// services/webrtcService.js
import io from "socket.io-client";
import socketService from "./socketService.js";

class WebRTCService {
  constructor() {
    this.socket = null;
    this.localStream = null;
    this.peerConnections = new Map();
    this.pendingCandidates = new Map();
    this.isInitialized = false;
    
    // FIXED: Initialize audio/video state properties
    this.isAudioEnabled = true;
    this.isVideoEnabled = true;
    this.hostMuted = false;          // Track if host has muted this user
    this.hostDisabledVideo = false;  // Track if host has disabled video
  }

  // Initialize socket connection with proper integration
  initializeSocket(token) {
    if (this.socket && this.socket.connected) {
      console.warn("Socket already initialized and connected");
      return this.socket;
    }

    this.socket = io(`${import.meta.env.VITE_API_URL}/meetings`, {
      auth: { token },
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 20000,
    });

    // Set socket in socket service immediately
    socketService.setSocket(this.socket);

    this.isInitialized = true;
    return this.socket;
  }

// In your WebRTC service, update getUserMedia method:
async getUserMedia(constraints = { video: true, audio: true }) {
  try {
    console.log("🎥 Getting user media with constraints:", constraints);
    
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, ...constraints.video },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
        ...constraints.audio,
      },
    });

    console.log("✅ User media obtained:", {
      streamId: this.localStream.id,
      audioTracks: this.localStream.getAudioTracks().length,
      videoTracks: this.localStream.getVideoTracks().length,
      localStreamReference: !!this.localStream
    });

    // Initialize track states properly
    if (this.localStream.getAudioTracks().length > 0) {
      this.localStream.getAudioTracks()[0].enabled = this.isAudioEnabled;
      console.log("🔊 Audio track initialized:", this.isAudioEnabled);
    }
    if (this.localStream.getVideoTracks().length > 0) {
      this.localStream.getVideoTracks()[0].enabled = this.isVideoEnabled;
      console.log("📹 Video track initialized:", this.isVideoEnabled);
    }

    return this.localStream;
  } catch (error) {
    console.error("❌ Error accessing media devices:", error);
    this.localStream = null; // Ensure it's null on error
    throw error;
  }
}


  // Create peer connection with duplicate prevention and enhanced state tracking
  createPeerConnection(socketId, isCaller = false) {
    if (this.peerConnections.has(socketId)) {
      const existing = this.peerConnections.get(socketId);
      if (
        existing.connectionState !== "closed" &&
        existing.connectionState !== "failed"
      ) {
        console.warn(
          `Peer connection already exists for ${socketId} with state: ${existing.connectionState}`
        );
        return existing;
      } else {
        this.closePeerConnection(socketId);
      }
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream);
      });
    }

    // Enhanced state change listeners
    peerConnection.addEventListener("signalingstatechange", () => {
      console.log(`[${socketId}] Signaling state: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener("connectionstatechange", () => {
      console.log(`[${socketId}] Connection state: ${peerConnection.connectionState}`);

      if (peerConnection.connectionState === "failed") {
        console.warn(`[${socketId}] Connection failed, attempting ICE restart`);
        peerConnection.restartIce();
      }

      if (peerConnection.connectionState === "closed") {
        this.closePeerConnection(socketId);
      }
    });

    peerConnection.addEventListener("iceconnectionstatechange", () => {
      console.log(`[${socketId}] ICE connection state: ${peerConnection.iceConnectionState}`);
    });

    this.peerConnections.set(socketId, peerConnection);
    return peerConnection;
  }

  // Create offer with enhanced state checking
  async createOffer(socketId, meetingId) {
    const peerConnection = this.peerConnections.get(socketId);
    if (!peerConnection) {
      console.error(`[${socketId}] No peer connection found for offer`);
      return;
    }

    if (peerConnection.signalingState !== "stable") {
      console.warn(
        `[${socketId}] Cannot create offer, signaling state: ${peerConnection.signalingState}`
      );
      return;
    }

    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peerConnection.setLocalDescription(offer);

      this.socket.emit("webrtc-offer", {
        meetingId,
        targetSocketId: socketId,
        offer: offer,
      });
    } catch (error) {
      console.error(`[${socketId}] Error creating offer:`, error);
      throw error;
    }
  }

  // Handle offer with proper state management
  async handleOffer(offer, from) {
    let peerConnection = this.peerConnections.get(from);

    if (!peerConnection) {
      peerConnection = this.createPeerConnection(from, false);
    }

    try {
      const currentState = peerConnection.signalingState;

      if (currentState === "stable" || currentState === "have-local-offer") {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        await this.processQueuedCandidates(from);

        if (offer.type === "offer") {
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          this.socket.emit("webrtc-answer", {
            targetSocketId: from,
            answer: answer,
          });
        }
      } else {
        console.warn(
          `[${from}] Cannot handle offer, wrong state: ${currentState}`
        );
      }
    } catch (error) {
      console.error(`[${from}] Error handling offer:`, error);
    }
  }

  // Handle answer with state validation
  async handleAnswer(answer, from) {
    const peerConnection = this.peerConnections.get(from);
    if (!peerConnection) {
      console.error(`[${from}] No peer connection found for answer`);
      return;
    }

    try {
      const currentState = peerConnection.signalingState;

      if (currentState === "have-local-offer") {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        await this.processQueuedCandidates(from);
      } else {
        console.warn(
          `[${from}] Cannot handle answer, wrong state: ${currentState}`
        );
      }
    } catch (error) {
      console.error(`[${from}] Error handling answer:`, error);
    }
  }

  // Handle ICE candidate with queuing
  handleIceCandidate(candidate, from) {
    const peerConnection = this.peerConnections.get(from);
    if (!peerConnection) {
      console.error(`[${from}] No peer connection found for ICE candidate`);
      return;
    }

    if (!peerConnection.remoteDescription) {
      if (!this.pendingCandidates.has(from)) {
        this.pendingCandidates.set(from, []);
      }
      this.pendingCandidates.get(from).push(candidate);
      return;
    }

    this.addIceCandidate(peerConnection, candidate, from);
  }

  // Process queued ICE candidates
  async processQueuedCandidates(socketId) {
    const candidates = this.pendingCandidates.get(socketId);
    if (candidates && candidates.length > 0) {
      console.log(`[${socketId}] Processing ${candidates.length} queued candidates`);
      const peerConnection = this.peerConnections.get(socketId);
      for (const candidate of candidates) {
        await this.addIceCandidate(peerConnection, candidate, socketId);
      }

      this.pendingCandidates.delete(socketId);
    }
  }

  // Add ICE candidate with error handling
  async addIceCandidate(peerConnection, candidate, from) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.warn(`[${from}] Failed to add ICE candidate:`, error.message);
    }
  }

  // FIXED: Proper toggle audio implementation
// Update your toggleAudio method:
toggleAudio() {
  console.log("🔊 toggleAudio called");
  console.log("🔊 localStream reference:", !!this.localStream);
  console.log("🔊 localStream details:", this.localStream ? {
    id: this.localStream.id,
    active: this.localStream.active,
    audioTracks: this.localStream.getAudioTracks().length
  } : "NULL");

  if (!this.localStream) {
    console.warn("❌ No local stream available for audio toggle");
    return false;
  }

  const audioTracks = this.localStream.getAudioTracks();
  if (audioTracks.length === 0) {
    console.warn("❌ No audio tracks available");
    return false;
  }

  if (this.hostMuted) {
    console.warn("❌ Cannot toggle audio - muted by host");
    return false;
  }

  const audioTrack = audioTracks[0];
  audioTrack.enabled = !audioTrack.enabled;
  this.isAudioEnabled = audioTrack.enabled;

  console.log(`✅ Audio ${audioTrack.enabled ? 'enabled' : 'disabled'}`);
  return audioTrack.enabled;
}

// Update your toggleVideo method:
toggleVideo() {
  console.log("📹 toggleVideo called");
  console.log("📹 localStream reference:", !!this.localStream);
  console.log("📹 localStream details:", this.localStream ? {
    id: this.localStream.id,
    active: this.localStream.active,
    videoTracks: this.localStream.getVideoTracks().length
  } : "NULL");

  if (!this.localStream) {
    console.warn("❌ No local stream available for video toggle");
    return false;
  }

  const videoTracks = this.localStream.getVideoTracks();
  if (videoTracks.length === 0) {
    console.warn("❌ No video tracks available");
    return false;
  }

  if (this.hostDisabledVideo) {
    console.warn("❌ Cannot toggle video - disabled by host");
    return false;
  }

  const videoTrack = videoTracks[0];
  videoTrack.enabled = !videoTrack.enabled;
  this.isVideoEnabled = videoTrack.enabled;

  console.log(`✅ Video ${videoTrack.enabled ? 'enabled' : 'disabled'}`);
  return videoTrack.enabled;
}
// Add this method to your WebRTC service:
validateLocalStream() {
  console.log("🔍 Validating local stream...");
  console.log("🔍 localStream exists:", !!this.localStream);
  
  if (!this.localStream) {
    console.error("❌ localStream is null/undefined");
    return false;
  }
  
  const audioTracks = this.localStream.getAudioTracks();
  const videoTracks = this.localStream.getVideoTracks();
  
  console.log("🔍 Stream validation results:", {
    streamId: this.localStream.id,
    streamActive: this.localStream.active,
    audioTracksCount: audioTracks.length,
    videoTracksCount: videoTracks.length,
    audioTrackEnabled: audioTracks.length > 0 ? audioTracks[0].enabled : 'N/A',
    videoTrackEnabled: videoTracks.length > 0 ? videoTracks[0].enabled : 'N/A',
    audioTrackState: audioTracks.length > 0 ? audioTracks[0].readyState : 'N/A',
    videoTrackState: videoTracks.length > 0 ? videoTracks[0].readyState : 'N/A'
  });
  
  return true;
}



  // FIXED: Proper toggle video implementation
  toggleVideo() {
    if (!this.localStream) {
      console.warn("No local stream available for video toggle");
      return false;
    }

    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length === 0) {
      console.warn("No video tracks available");
      return false;
    }

    // Don't allow toggle if host has disabled video for this user
    if (this.hostDisabledVideo) {
      console.warn("Cannot toggle video - disabled by host");
      return false;
    }

    const videoTrack = videoTracks[0];
    videoTrack.enabled = !videoTrack.enabled;
    this.isVideoEnabled = videoTrack.enabled;

    console.log(`Video ${videoTrack.enabled ? 'enabled' : 'disabled'}`);
    return videoTrack.enabled;
  }

  // FIXED: Force disable audio (for host control)
  forceDisableAudio() {
    if (this.localStream && this.localStream.getAudioTracks().length > 0) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
      this.isAudioEnabled = false;
      this.hostMuted = true;
      console.log("Audio force disabled by host");
    }
  }

  // FIXED: Force disable video (for host control)
  forceDisableVideo() {
    if (this.localStream && this.localStream.getVideoTracks().length > 0) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = false;
      });
      this.isVideoEnabled = false;
      this.hostDisabledVideo = true;
      console.log("Video force disabled by host");
    }
  }

  // Allow host to permit user to unmute
  allowUnmute() {
    this.hostMuted = false;
    console.log("Host has allowed unmuting");
  }

  // Allow host to permit user to enable video
  allowVideoEnable() {
    this.hostDisabledVideo = false;
    console.log("Host has allowed video enabling");
  }

  // Get current audio state
  getAudioEnabled() {
    if (!this.localStream || this.localStream.getAudioTracks().length === 0) {
      return false;
    }
    return this.localStream.getAudioTracks()[0].enabled;
  }

  // Get current video state
  getVideoEnabled() {
    if (!this.localStream || this.localStream.getVideoTracks().length === 0) {
      return false;
    }
    return this.localStream.getVideoTracks()[0].enabled;
  }

  // Start screen share with better error handling
  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const videoTrack = screenStream.getVideoTracks()[0];

      // Replace video track in all peer connections
      for (const [socketId, peerConnection] of this.peerConnections) {
        const sender = peerConnection
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender) {
          try {
            await sender.replaceTrack(videoTrack);
          } catch (error) {
            console.error(`[${socketId}] Failed to start screen share:`, error);
          }
        }
      }

      // Handle screen share end event
      videoTrack.onended = () => {
        this.stopScreenShare().catch(error => {
          console.error('Error handling screen share end:', error);
        });
      };

      return { stream: screenStream, videoTrack };
    } catch (error) {
      console.error("Error starting screen share:", error);
      throw error;
    }
  }

  // Stop screen share with better stream management
  async stopScreenShare() {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const videoTrack = cameraStream.getVideoTracks()[0];

      // Replace screen share with camera
      for (const [socketId, peerConnection] of this.peerConnections) {
        const sender = peerConnection
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender) {
          try {
            await sender.replaceTrack(videoTrack);
          } catch (error) {
            console.error(`[${socketId}] Failed to stop screen share:`, error);
          }
        }
      }

      // Update local stream reference
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
      }
      this.localStream = cameraStream;
      
      return videoTrack;
    } catch (error) {
      console.error("Error stopping screen share:", error);
      throw error;
    }
  }

  // Close peer connection with cleanup
  closePeerConnection(socketId) {
    const peerConnection = this.peerConnections.get(socketId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(socketId);
      this.pendingCandidates.delete(socketId);
    }
  }

  // Get current connection status
  getConnectionStatus() {
    const status = {
      isInitialized: this.isInitialized,
      hasSocket: !!this.socket,
      socketConnected: this.socket?.connected || false,
      hasLocalStream: !!this.localStream,
      peerConnectionCount: this.peerConnections.size,
      pendingCandidatesCount: this.pendingCandidates.size,
      isAudioEnabled: this.isAudioEnabled,
      isVideoEnabled: this.isVideoEnabled,
      hostMuted: this.hostMuted,
      hostDisabledVideo: this.hostDisabledVideo
    };
    
    return status;
  }
// Add these new methods for composite screen sharing with camera

// Start screen share with camera overlay (Picture-in-Picture style)
async startScreenShareWithCamera() {
  try {
    console.log("🎬 Starting screen share with camera overlay...");
    
    // Get screen stream
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { width: 1920, height: 1080 },
      audio: true,
    });

    // Get camera stream (smaller resolution for overlay)
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240 },
      audio: false, // Use screen audio, not camera audio
    });

    // Create canvas for compositing
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    // Create video elements for streams
    const screenVideo = document.createElement('video');
    const cameraVideo = document.createElement('video');
    
    screenVideo.srcObject = screenStream;
    cameraVideo.srcObject = cameraStream;
    
    screenVideo.muted = true;
    cameraVideo.muted = true;
    
    await screenVideo.play();
    await cameraVideo.play();

    // Store animation frame ID for cleanup
    let animationId;

    // Composite function
    const composite = () => {
      // Draw screen (full size)
      ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
      
      // Draw camera (small overlay in bottom-right corner)
      const cameraWidth = 320;
      const cameraHeight = 240;
      const margin = 20;
      
      // Add border/shadow for camera overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(
        canvas.width - cameraWidth - margin - 5,
        canvas.height - cameraHeight - margin - 5,
        cameraWidth + 10,
        cameraHeight + 10
      );
      
      // Draw camera video
      ctx.drawImage(
        cameraVideo,
        canvas.width - cameraWidth - margin,
        canvas.height - cameraHeight - margin,
        cameraWidth,
        cameraHeight
      );
      
      animationId = requestAnimationFrame(composite);
    };

    // Start compositing
    composite();

    // Get composite stream
    const compositeStream = canvas.captureStream(30); // 30 FPS
    
    // Add screen audio to composite stream
    const audioTrack = screenStream.getAudioTracks()[0];
    if (audioTrack) {
      compositeStream.addTrack(audioTrack);
    }

    // Replace video track in all peer connections
    const videoTrack = compositeStream.getVideoTracks()[0];
    
    for (const [socketId, peerConnection] of this.peerConnections) {
      const sender = peerConnection
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      if (sender) {
        try {
          await sender.replaceTrack(videoTrack);
          console.log(`✅ Screen+camera composite sent to ${socketId}`);
        } catch (error) {
          console.error(`❌ Failed to send composite to ${socketId}:`, error);
        }
      }
    }

    // Store references for cleanup
    this.screenStream = screenStream;
    this.cameraStream = cameraStream;
    this.compositeCanvas = canvas;
    this.compositeStream = compositeStream;
    this.screenVideo = screenVideo;
    this.cameraVideo = cameraVideo;
    this.animationId = animationId;

    // Handle screen share end
    screenStream.getVideoTracks()[0].onended = () => {
      this.stopScreenShareWithCamera().catch(console.error);
    };

    return { compositeStream, screenStream, cameraStream };

  } catch (error) {
    console.error("❌ Error starting screen share with camera:", error);
    throw error;
  }
}

async stopScreenShareWithCamera() {
  try {
    console.log("🛑 Stopping screen share with camera...");

    // Stop animation frame
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Stop all streams
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }

    if (this.compositeStream) {
      this.compositeStream.getTracks().forEach(track => track.stop());
      this.compositeStream = null;
    }

    // Clean up video elements
    if (this.screenVideo) {
      this.screenVideo.srcObject = null;
      this.screenVideo = null;
    }

    if (this.cameraVideo) {
      this.cameraVideo.srcObject = null;
      this.cameraVideo = null;
    }

    // Get new camera stream for normal video call
    const newCameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const videoTrack = newCameraStream.getVideoTracks()[0];

    // Replace composite with normal camera
    for (const [socketId, peerConnection] of this.peerConnections) {
      const sender = peerConnection
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      if (sender) {
        try {
          await sender.replaceTrack(videoTrack);
          console.log(`✅ Camera restored for ${socketId}`);
        } catch (error) {
          console.error(`❌ Failed to restore camera for ${socketId}:`, error);
        }
      }
    }

    // Update local stream reference
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    this.localStream = newCameraStream;
    
    // Cleanup canvas
    this.compositeCanvas = null;

    return videoTrack;

  } catch (error) {
    console.error("❌ Error stopping screen share with camera:", error);
    throw error;
  }
}

// Update your existing cleanup method
cleanup() {
  console.log("🧹 Cleaning up WebRTC service...");

  // Stop animation frame
  if (this.animationId) {
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }

  // Stop local stream
  if (this.localStream) {
    this.localStream.getTracks().forEach((track) => {
      track.stop();
    });
    this.localStream = null;
  }

  // Stop screen share streams
  if (this.screenStream) {
    this.screenStream.getTracks().forEach((track) => {
      track.stop();
    });
    this.screenStream = null;
  }

  if (this.cameraStream) {
    this.cameraStream.getTracks().forEach((track) => {
      track.stop();
    });
    this.cameraStream = null;
  }

  if (this.compositeStream) {
    this.compositeStream.getTracks().forEach((track) => {
      track.stop();
    });
    this.compositeStream = null;
  }

  // Clean up video elements
  if (this.screenVideo) {
    this.screenVideo.srcObject = null;
    this.screenVideo = null;
  }

  if (this.cameraVideo) {
    this.cameraVideo.srcObject = null;
    this.cameraVideo = null;
  }

  // Clear canvas reference
  this.compositeCanvas = null;

  // Close all peer connections
  this.peerConnections.forEach((peerConnection, socketId) => {
    peerConnection.close();
  });
  this.peerConnections.clear();
  this.pendingCandidates.clear();

  // Cleanup socket through socket service
  socketService.cleanup();

  this.socket = null;
  this.isInitialized = false;
  
  // Reset state properties
  this.isAudioEnabled = true;
  this.isVideoEnabled = true;
  this.hostMuted = false;
  this.hostDisabledVideo = false;
}

}

export default new WebRTCService();
