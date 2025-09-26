// services/socketService.js
class SocketService {
  constructor() {
    this.socket = null;
    this.meetingId = null;
    this.isConnected = false;
    this.hasJoinedMeeting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
  }

  // Set socket reference (called from WebRTC service)
  setSocket(socket) {
    if (this.socket && this.socket.connected) {
      console.warn('Socket already exists and is connected');
      return;
    }
    
    this.socket = socket;
    this.setupConnectionHandlers();
  }

  // Setup connection event handlers
  setupConnectionHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.hasJoinedMeeting = false;
      
      if (reason === 'io server disconnect') {
        this.handleReconnect();
      }
    });

    this.socket.on('reconnect', () => {
      this.isConnected = true;
      
      if (this.meetingId && !this.hasJoinedMeeting) {
        this.rejoinMeeting();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    
    setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      }
    }, 2000 * this.reconnectAttempts);
  }

  rejoinMeeting() {
    if (!this.socket || !this.meetingId || this.hasJoinedMeeting) return;
    
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData.id || userData._id || userData.userId;
    const userName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email || 'User';
    
    if (userId) {
      this.socket.emit('rejoin-meeting', {
        meetingId: this.meetingId,
        userId: userId,
        userName: userName
      });
    }
  }

  joinMeeting(meetingId, userId, userName, isHost = false) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return false;
    }

    if (!this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    if (this.hasJoinedMeeting && this.meetingId === meetingId) {
      console.warn('Already joined this meeting');
      return true;
    }

    if (!meetingId || !userId || !userName) {
      console.error('Missing required parameters:', { meetingId, userId, userName });
      return false;
    }

    
    this.meetingId = meetingId;
    this.socket.emit('join-meeting', {
      meetingId,
      userId,
      userName,
      isHost,
      socketId: this.socket.id
    });

    this.hasJoinedMeeting = true;
    return true;
  }

  leaveMeeting() {
    if (!this.socket || !this.meetingId) return;
    
    
    this.socket.emit('leave-meeting', { 
      meetingId: this.meetingId,
      socketId: this.socket.id
    });
    
    this.meetingId = null;
    this.hasJoinedMeeting = false;
  }

  validateConnection(meetingId) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return false;
    }

    if (!this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    if (!this.hasJoinedMeeting || this.meetingId !== meetingId) {
      console.error('Not joined to this meeting');
      return false;
    }

    return true;
  }

  toggleVideo(meetingId, videoEnabled) {
    if (!this.validateConnection(meetingId)) return;
    
    this.socket.emit('toggle-video', {
      meetingId,
      videoEnabled,
      socketId: this.socket.id
    });
  }

  toggleAudio(meetingId, audioEnabled) {
    if (!this.validateConnection(meetingId)) return;
    
    this.socket.emit('toggle-audio', {
      meetingId,
      audioEnabled,
      socketId: this.socket.id
    });
  }

  startScreenShare(meetingId) {
    if (!this.validateConnection(meetingId)) return;
    
    this.socket.emit('screen-share-start', { 
      meetingId,
      socketId: this.socket.id
    });
  }

  stopScreenShare(meetingId) {
    if (!this.validateConnection(meetingId)) return;
    
    this.socket.emit('screen-share-stop', { 
      meetingId,
      socketId: this.socket.id
    });
  }

  sendMessage(meetingId, message) {
    if (!this.validateConnection(meetingId)) return;
    
    this.socket.emit('send-message', {
      meetingId,
      message,
      socketId: this.socket.id,
      timestamp: new Date().toISOString()
    });
  }

  // HOST CONTROL METHODS
  hostMuteParticipant(meetingId, targetSocketId) {
    if (!this.validateConnection(meetingId)) return;
    
    this.socket.emit('host-mute-participant', {
      meetingId,
      targetSocketId,
      hostSocketId: this.socket.id
    });
  }

  hostUnmuteParticipant(meetingId, targetSocketId) {
    if (!this.validateConnection(meetingId)) return;
    
    this.socket.emit('host-unmute-participant', {
      meetingId,
      targetSocketId,
      hostSocketId: this.socket.id
    });
  }

  hostDisableVideo(meetingId, targetSocketId) {
    if (!this.validateConnection(meetingId)) return;
    
    this.socket.emit('host-disable-video', {
      meetingId,
      targetSocketId,
      hostSocketId: this.socket.id
    });
  }

  hostEnableVideo(meetingId, targetSocketId) {
    if (!this.validateConnection(meetingId)) return;
    
    this.socket.emit('host-enable-video', {
      meetingId,
      targetSocketId,
      hostSocketId: this.socket.id
    });
  }

  removeParticipant(meetingId, targetSocketId) {
    if (!this.validateConnection(meetingId)) return;
    
    this.socket.emit('remove-participant', {
      meetingId,
      targetSocketId,
      hostSocketId: this.socket.id
    });
  }

  // Setup event listeners with host controls
  setupListeners(callbacks) {
    if (!this.socket) {
      console.error('Socket not initialized for setting up listeners');
      return;
    }

    this.removeListeners();

    // Participant events
    this.socket.on('participants-list', (data) => {
      if (callbacks.onParticipantsList) {
        callbacks.onParticipantsList(data);
      }
    });

    this.socket.on('participant-joined', (data) => {
      if (callbacks.onParticipantJoined) {
        callbacks.onParticipantJoined(data);
      }
    });

    this.socket.on('participant-left', (data) => {
      if (callbacks.onParticipantLeft) {
        callbacks.onParticipantLeft(data);
      }
    });
    
 
    this.socket.on('webrtc-offer', (data) => {
      if (callbacks.onWebRTCOffer) {
        callbacks.onWebRTCOffer(data);
      }
    });

    this.socket.on('webrtc-answer', (data) => {
      if (callbacks.onWebRTCAnswer) {
        callbacks.onWebRTCAnswer(data);
      }
    });

    this.socket.on('webrtc-ice-candidate', (data) => {
      if (callbacks.onWebRTCIceCandidate) {
        callbacks.onWebRTCIceCandidate(data);
      }
    });
    
    // Media control updates
    this.socket.on('participant-video-toggle', (data) => {
      if (callbacks.onVideoToggle) {
        callbacks.onVideoToggle(data);
      }
    });

    this.socket.on('participant-audio-toggle', (data) => {
      if (callbacks.onAudioToggle) {
        callbacks.onAudioToggle(data);
      }
    });
    
    // Screen share events
    this.socket.on('participant-screen-share-start', (data) => {
      if (callbacks.onScreenShareStart) {
        callbacks.onScreenShareStart(data);
      }
    });

    this.socket.on('participant-screen-share-stop', (data) => {
      if (callbacks.onScreenShareStop) {
        callbacks.onScreenShareStop(data);
      }
    });
    
    // Chat events
    this.socket.on('new-message', (data) => {
      if (callbacks.onNewMessage) {
        callbacks.onNewMessage(data);
      }
    });
    
    // Meeting events
    this.socket.on('meeting-ended', (data) => {
      this.hasJoinedMeeting = false;
      this.meetingId = null;
      if (callbacks.onMeetingEnded) {
        callbacks.onMeetingEnded(data);
      }
    });

    this.socket.on('joined-successfully', (data) => {
      if (callbacks.onJoinedSuccessfully) {
        callbacks.onJoinedSuccessfully(data);
      }
    });

    // Error handling
    this.socket.on('join-error', (data) => {
      console.error('Join error:', data);
      this.hasJoinedMeeting = false;
      if (callbacks.onJoinError) {
        callbacks.onJoinError(data);
      }
    });

    // HOST CONTROL EVENTS
    this.socket.on('host-muted-you', () => {
      if (callbacks.onHostMutedYou) {
        callbacks.onHostMutedYou();
      }
    });

    this.socket.on('host-unmuted-you', () => {
      if (callbacks.onHostUnmutedYou) {
        callbacks.onHostUnmutedYou();
      }
    });

    this.socket.on('host-disabled-your-video', () => {
      if (callbacks.onHostDisabledVideo) {
        callbacks.onHostDisabledVideo();
      }
    });

    this.socket.on('host-enabled-your-video', () => {
      if (callbacks.onHostEnabledVideo) {
        callbacks.onHostEnabledVideo();
      }
    });

    this.socket.on('you-were-removed', (data) => {
      if (callbacks.onRemovedFromMeeting) {
        callbacks.onRemovedFromMeeting(data);
      }
    });
  }
// In your socketService.js, add this method:
sendMessage(meetingId, message, userName) {
  if (!this.validateConnection(meetingId)) return;
  
  const messageData = {
    meetingId,
    message: message.trim(),
    userName,
    socketId: this.socket.id,
    timestamp: new Date().toISOString(),
    id: Date.now() + Math.random() // Simple ID generation
  };
  
  this.socket.emit('send-message', messageData);
  return messageData; // Return for immediate UI update
}

  // Remove all listeners
  removeListeners() {
    if (!this.socket) return;
    
    
    const events = [
      'participants-list',
      'participant-joined', 
      'participant-left',
      'webrtc-offer',
      'webrtc-answer', 
      'webrtc-ice-candidate',
      'participant-video-toggle',
      'participant-audio-toggle',
      'participant-screen-share-start',
      'participant-screen-share-stop',
      'new-message',
      'meeting-ended',
      'joined-successfully',
      'join-error',
      'host-muted-you',
      'host-unmuted-you',
      'host-disabled-your-video',
      'host-enabled-your-video',
      'you-were-removed'
    ];

    events.forEach(event => {
      this.socket.removeAllListeners(event);
    });
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      hasJoinedMeeting: this.hasJoinedMeeting,
      meetingId: this.meetingId,
      socketId: this.socket?.id || null
    };
  }

  cleanup() {
    
    if (this.hasJoinedMeeting) {
      this.leaveMeeting();
    }

    this.removeListeners();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.hasJoinedMeeting = false;
    this.meetingId = null;
    this.reconnectAttempts = 0;
  }
}

export default new SocketService();
