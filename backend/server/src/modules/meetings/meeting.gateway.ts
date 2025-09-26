// src/modules/meetings/meeting.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { MeetingService } from './meetings.service';

interface ConnectedUser {
  socketId: string;
  userId: string;
  userName: string;
  meetingId: string;
  isHost: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
}

interface MeetingParticipant {
  socketId: string;
  userId: string;
  userName: string;
  isHost: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
  joinedAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/meetings',
})
@Injectable()
export class MeetingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MeetingGateway.name);
  private connectedUsers = new Map<string, ConnectedUser>(); // socketId -> user
  private meetingRooms = new Map<string, Set<string>>(); // meetingId -> Set of socketIds
  private userToSocket = new Map<string, string>(); // userId -> socketId

  constructor(private readonly meetingService: MeetingService) {}

  handleConnection(socket: Socket) {
    this.logger.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`);

    const user = this.connectedUsers.get(socket.id);
    if (user) {
      this.handleLeaveMeeting(socket, { meetingId: user.meetingId });
    }
  }
// Add these methods to your existing MeetingGateway class

// HOST CONTROL EVENTS - ADD THESE TO YOUR EXISTING CLASS
@SubscribeMessage('host-mute-participant')
async handleHostMuteParticipant(
  @ConnectedSocket() socket: Socket,
  @MessageBody() data: { 
    meetingId: string; 
    targetSocketId: string; 
    hostSocketId: string 
  }
) {
  try {
    // Verify the client is the host
    const isHost = await this.verifyHost(socket.id, data.meetingId);
    if (!isHost) {
      socket.emit('error', { message: 'Only hosts can mute participants' });
      return;
    }

    // Update target participant state
    const targetUser = this.connectedUsers.get(data.targetSocketId);
    if (targetUser) {
      targetUser.audioEnabled = false;
    }

    // Mute the target participant
    this.server.to(data.targetSocketId).emit('host-muted-you');
    
    // Notify all participants about the mute
    this.server.to(data.meetingId).emit('participant-audio-toggle', {
      socketId: data.targetSocketId,
      userId: targetUser?.userId,
      audioEnabled: false,
      mutedByHost: true
    });

    this.logger.log(`Host ${socket.id} muted participant ${data.targetSocketId}`);

  } catch (error) {
    this.logger.error('Error in host mute:', error);
    socket.emit('error', { message: 'Failed to mute participant' });
  }
}

@SubscribeMessage('host-unmute-participant')
async handleHostUnmuteParticipant(
  @ConnectedSocket() socket: Socket,
  @MessageBody() data: { 
    meetingId: string; 
    targetSocketId: string; 
    hostSocketId: string 
  }
) {
  try {
    const isHost = await this.verifyHost(socket.id, data.meetingId);
    if (!isHost) {
      socket.emit('error', { message: 'Only hosts can unmute participants' });
      return;
    }

    // Update target participant state
    const targetUser = this.connectedUsers.get(data.targetSocketId);
    if (targetUser) {
      targetUser.audioEnabled = true;
    }

    this.server.to(data.targetSocketId).emit('host-unmuted-you');
    
    this.server.to(data.meetingId).emit('participant-audio-toggle', {
      socketId: data.targetSocketId,
      userId: targetUser?.userId,
      audioEnabled: true,
      mutedByHost: false
    });

    this.logger.log(`Host ${socket.id} unmuted participant ${data.targetSocketId}`);

  } catch (error) {
    this.logger.error('Error in host unmute:', error);
    socket.emit('error', { message: 'Failed to unmute participant' });
  }
}

@SubscribeMessage('host-disable-video')
async handleHostDisableVideo(
  @ConnectedSocket() socket: Socket,
  @MessageBody() data: { 
    meetingId: string; 
    targetSocketId: string; 
    hostSocketId: string 
  }
) {
  try {
    const isHost = await this.verifyHost(socket.id, data.meetingId);
    if (!isHost) {
      socket.emit('error', { message: 'Only hosts can disable video' });
      return;
    }

    // Update target participant state
    const targetUser = this.connectedUsers.get(data.targetSocketId);
    if (targetUser) {
      targetUser.videoEnabled = false;
    }

    this.server.to(data.targetSocketId).emit('host-disabled-your-video');
    
    this.server.to(data.meetingId).emit('participant-video-toggle', {
      socketId: data.targetSocketId,
      userId: targetUser?.userId,
      videoEnabled: false,
      disabledByHost: true
    });

    this.logger.log(`Host ${socket.id} disabled video for participant ${data.targetSocketId}`);

  } catch (error) {
    this.logger.error('Error in host disable video:', error);
    socket.emit('error', { message: 'Failed to disable video' });
  }
}

@SubscribeMessage('host-enable-video')
async handleHostEnableVideo(
  @ConnectedSocket() socket: Socket,
  @MessageBody() data: { 
    meetingId: string; 
    targetSocketId: string; 
    hostSocketId: string 
  }
) {
  try {
    const isHost = await this.verifyHost(socket.id, data.meetingId);
    if (!isHost) {
      socket.emit('error', { message: 'Only hosts can enable video' });
      return;
    }

    // Update target participant state
    const targetUser = this.connectedUsers.get(data.targetSocketId);
    if (targetUser) {
      targetUser.videoEnabled = true;
    }

    this.server.to(data.targetSocketId).emit('host-enabled-your-video');
    
    this.server.to(data.meetingId).emit('participant-video-toggle', {
      socketId: data.targetSocketId,
      userId: targetUser?.userId,
      videoEnabled: true,
      disabledByHost: false
    });

    this.logger.log(`Host ${socket.id} enabled video for participant ${data.targetSocketId}`);

  } catch (error) {
    this.logger.error('Error in host enable video:', error);
    socket.emit('error', { message: 'Failed to enable video' });
  }
}

@SubscribeMessage('remove-participant')
async handleRemoveParticipant(
  @ConnectedSocket() socket: Socket,
  @MessageBody() data: { 
    meetingId: string; 
    targetSocketId: string; 
    hostSocketId: string 
  }
) {
  try {
    const isHost = await this.verifyHost(socket.id, data.meetingId);
    if (!isHost) {
      socket.emit('error', { message: 'Only hosts can remove participants' });
      return;
    }

    const targetUser = this.connectedUsers.get(data.targetSocketId);
    if (!targetUser) {
      socket.emit('error', { message: 'Participant not found' });
      return;
    }

    // Update database - mark as left
    await this.meetingService.leaveMeeting(data.meetingId, targetUser.userId);
    
    // Notify the participant they were removed
    this.server.to(data.targetSocketId).emit('you-were-removed', {
      reason: 'Removed by host'
    });

    // Notify other participants
    socket.to(data.meetingId).emit('participant-left', {
      socketId: data.targetSocketId,
      userId: targetUser.userId,
      userName: targetUser.userName,
      reason: 'removed'
    });

    // Remove from local tracking
    this.connectedUsers.delete(data.targetSocketId);
    this.userToSocket.delete(targetUser.userId);
    
    const meetingRoom = this.meetingRooms.get(data.meetingId);
    if (meetingRoom) {
      meetingRoom.delete(data.targetSocketId);
    }

    // Disconnect the participant
    const targetSocket = this.server.sockets.sockets.get(data.targetSocketId);
    if (targetSocket) {
      targetSocket.leave(data.meetingId);
      targetSocket.disconnect();
    }

    this.logger.log(`Host ${socket.id} removed participant ${data.targetSocketId}`);

  } catch (error) {
    this.logger.error('Error removing participant:', error);
    socket.emit('error', { message: 'Failed to remove participant' });
  }
}

private async verifyHost(socketId: string, meetingId: string): Promise<boolean> {
  const user = this.connectedUsers.get(socketId);
  if (!user) return false;
  if (user.isHost && user.meetingId === meetingId) {
    return true;
  }
  try {
    const meeting = await this.meetingService.findByMeetingId(meetingId);
    return !!meeting && user.userId === meeting.hostId.toString();
  } catch (error) {
    this.logger.error('Error verifying host:', error);
    return false;
  }
}

@SubscribeMessage('join-meeting')
async handleJoinMeeting(
  @ConnectedSocket() socket: Socket,
  @MessageBody()
  data: {
    meetingId: string;
    userId: string;
    userName: string;
    isHost?: boolean;
    socketId?: string;
  },
) {
  const { meetingId, userId, userName, isHost = false } = data;

  this.logger.log('=== JOIN MEETING REQUEST ===');
  this.logger.log(`Socket ID: ${socket.id}`);
  this.logger.log(`Request data:`, JSON.stringify(data, null, 2));

  try {
    // Verify meeting exists
    this.logger.log(`Looking for meeting: ${meetingId}`);
    const meeting = await this.meetingService.findByMeetingId(meetingId);
    
    if (!meeting) {
      this.logger.error(`Meeting not found: ${meetingId}`);
      socket.emit('join-error', { message: 'Meeting not found' });
      return;
    }

    this.logger.log(`Meeting found: ${meeting._id}`);

    // Verify meeting is active or waiting
    if (meeting.status === 'ended') {
      this.logger.error(`Meeting has ended: ${meetingId}`);
      socket.emit('join-error', { message: 'Meeting has ended' });
      return;
    }

    // Determine if user is actually the host
    const isActualHost = meeting.hostId.toString() === userId || isHost;
    this.logger.log(`User ${userId} is host: ${isActualHost}`);

    // Join socket room
    this.logger.log(`Joining socket room: ${meetingId}`);
    socket.join(meetingId);

    // *** CRITICAL FIX: Store user connection info FIRST ***
    const connectedUser: ConnectedUser = {
      socketId: socket.id,
      userId,
      userName,
      meetingId,
      isHost: isActualHost,
      videoEnabled: true,
      audioEnabled: true,
    };

    this.connectedUsers.set(socket.id, connectedUser);
    this.userToSocket.set(userId, socket.id);

    // Add to meeting room
    if (!this.meetingRooms.has(meetingId)) {
      this.meetingRooms.set(meetingId, new Set());
    }
    this.meetingRooms.get(meetingId)!.add(socket.id);

    this.logger.log('=== AFTER ADDING USER ===');
    this.logger.log('Connected users:', Array.from(this.connectedUsers.keys()));
    this.logger.log('Meeting rooms:', Array.from(this.meetingRooms.keys()));
    this.logger.log(`Sockets in room ${meetingId}:`, Array.from(this.meetingRooms.get(meetingId) || []));

    // *** NOW get participants (this will include the current user) ***
    const participants = this.getMeetingParticipants(meetingId);
    this.logger.log(`Current participants count: ${participants.length}`);
    this.logger.log(`Participants:`, participants);

    // Update meeting status to active if it's the first participant
    if (participants.length === 1) {
      this.logger.log('First participant - updating meeting status to active');
      await this.meetingService.updateMeetingStatus(meetingId, 'active');
    }

    // Update database - WRAP IN TRY-CATCH TO PREVENT FAILURE
    this.logger.log('Updating database with participant join');
    try {
      await this.meetingService.joinMeeting(meetingId, userId);
      this.logger.log('Database updated successfully');
    } catch (dbError) {
      this.logger.warn('Database update failed, but continuing:', dbError.message);
    }

    // *** FIXED ORDER: Send success to the joining user first ***
    socket.emit('joined-successfully', { meetingId, participants });
    this.logger.log(`✅ User ${userName} successfully joined meeting ${meetingId} as ${isActualHost ? 'host' : 'participant'}`);

    // *** THEN notify others about new participant ***
    socket.to(meetingId).emit('participant-joined', {
      participant: {
        socketId: socket.id,
        userId,
        userName,
        isHost: isActualHost,
        videoEnabled: true,
        audioEnabled: true,
        joinedAt: new Date(),
      },
    });

    // *** FINALLY send updated participants list to ALL users in the room ***
    this.server.to(meetingId).emit('participants-list', { participants });

  } catch (error) {
    this.logger.error('❌ Error joining meeting:', error);
    this.logger.error('Error stack:', error.stack);
    socket.emit('join-error', { message: 'Failed to join meeting', error: error.message });
  }
}


  @SubscribeMessage('leave-meeting')
  async handleLeaveMeeting(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { meetingId: string },
  ) {
    const { meetingId } = data;
    const user = this.connectedUsers.get(socket.id);

    if (!user) return;

    try {
      // Leave socket room
      socket.leave(meetingId);

      // Remove from tracking maps
      this.connectedUsers.delete(socket.id);
      this.userToSocket.delete(user.userId);

      const meetingRoom = this.meetingRooms.get(meetingId);
      if (meetingRoom) {
        meetingRoom.delete(socket.id);

        // If room is empty, clean up
        if (meetingRoom.size === 0) {
          this.meetingRooms.delete(meetingId);
          await this.meetingService.updateMeetingStatus(meetingId, 'ended');
        }
      }

      // Notify other participants
      socket.to(meetingId).emit('participant-left', {
        socketId: socket.id,
        userId: user.userId,
        userName: user.userName,
      });

      // Update database
      await this.meetingService.leaveMeeting(meetingId, user.userId);

      socket.emit('left-successfully', { meetingId });

      this.logger.log(`User ${user.userName} left meeting ${meetingId}`);
    } catch (error) {
      this.logger.error('Error leaving meeting:', error);
    }
  }

  // WebRTC Signaling Events
  @SubscribeMessage('webrtc-offer')
  handleWebRTCOffer(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: {
      meetingId: string;
      targetSocketId: string;
      offer: RTCSessionDescriptionInit;
    },
  ) {
    const { targetSocketId, offer, meetingId } = data;

    socket.to(targetSocketId).emit('webrtc-offer', {
      offer,
      from: socket.id,
      meetingId,
    });

    this.logger.debug(
      `WebRTC offer sent from ${socket.id} to ${targetSocketId}`,
    );
  }

  @SubscribeMessage('webrtc-answer')
  handleWebRTCAnswer(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: {
      targetSocketId: string;
      answer: RTCSessionDescriptionInit;
    },
  ) {
    const { targetSocketId, answer } = data;

    socket.to(targetSocketId).emit('webrtc-answer', {
      answer,
      from: socket.id,
    });

    this.logger.debug(
      `WebRTC answer sent from ${socket.id} to ${targetSocketId}`,
    );
  }

  @SubscribeMessage('webrtc-ice-candidate')
  handleWebRTCIceCandidate(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: {
      targetSocketId: string;
      candidate: RTCIceCandidateInit;
    },
  ) {
    const { targetSocketId, candidate } = data;

    socket.to(targetSocketId).emit('webrtc-ice-candidate', {
      candidate,
      from: socket.id,
    });

    this.logger.debug(
      `ICE candidate sent from ${socket.id} to ${targetSocketId}`,
    );
  }

  // Media Control Events
  @SubscribeMessage('toggle-video')
  handleToggleVideo(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { meetingId: string; videoEnabled: boolean },
  ) {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    user.videoEnabled = data.videoEnabled;

    socket.to(data.meetingId).emit('participant-video-toggle', {
      socketId: socket.id,
      userId: user.userId,
      videoEnabled: data.videoEnabled,
    });
  }

  @SubscribeMessage('toggle-audio')
  handleToggleAudio(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { meetingId: string; audioEnabled: boolean },
  ) {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    user.audioEnabled = data.audioEnabled;

    socket.to(data.meetingId).emit('participant-audio-toggle', {
      socketId: socket.id,
      userId: user.userId,
      audioEnabled: data.audioEnabled,
    });
  }

  @SubscribeMessage('screen-share-start')
  handleScreenShareStart(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { meetingId: string },
  ) {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    socket.to(data.meetingId).emit('participant-screen-share-start', {
      socketId: socket.id,
      userId: user.userId,
      userName: user.userName,
    });
  }

  @SubscribeMessage('screen-share-stop')
  handleScreenShareStop(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { meetingId: string },
  ) {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    socket.to(data.meetingId).emit('participant-screen-share-stop', {
      socketId: socket.id,
      userId: user.userId,
    });
  }
handleSendMessage(
  @ConnectedSocket() socket: Socket,
  @MessageBody()
  data: {
    meetingId: string;
    message: string;
    userName?: string; // Add this to receive userName from frontend
    socketId?: string;
    timestamp?: string;
    id?: string;
  },
) {
  this.logger.log('📨 Message received on server:', JSON.stringify(data, null, 2));
  
  const user = this.connectedUsers.get(socket.id);
  if (!user) {
    this.logger.error('❌ User not found for message sending');
    socket.emit('error', { message: 'User not found' });
    return;
  }

  // Create message data structure that matches frontend expectations
  const messageData = {
    id: data.id || `${socket.id}-${Date.now()}-${Math.random()}`,
    message: data.message.trim(),
    userName: data.userName || user.userName, // Use provided userName or fallback to stored
    socketId: socket.id,
    userId: user.userId,
    timestamp: data.timestamp || new Date().toISOString(),
    meetingId: data.meetingId
  };

  this.logger.log('📤 Broadcasting message:', JSON.stringify(messageData, null, 2));

  // Broadcast to ALL participants in the meeting (including sender for confirmation)
  this.server.to(data.meetingId).emit('new-message', messageData);
  
  this.logger.log(`✅ Message sent in meeting ${data.meetingId} by ${user.userName}`);
}

private getMeetingParticipants(meetingId: string): MeetingParticipant[] {
  console.log(`🔍 Getting participants for meeting ${meetingId}`);
  
  const socketIds = this.meetingRooms.get(meetingId);
  console.log(`Socket IDs in room:`, socketIds ? Array.from(socketIds) : 'No room found');
  
  if (!socketIds || socketIds.size === 0) {
    console.log('❌ No socket IDs found for meeting');
    return [];
  }

  const participants = Array.from(socketIds)
    .map((socketId) => {
      const user = this.connectedUsers.get(socketId);
      console.log(`User for socket ${socketId}:`, user);
      return user;
    })
    .filter((user) => user !== undefined)
    .map((user) => ({
      socketId: user.socketId,
      userId: user.userId,
      userName: user.userName,
      isHost: user.isHost,
      videoEnabled: user.videoEnabled,
      audioEnabled: user.audioEnabled,
      joinedAt: new Date(),
    }));

  console.log(`✅ Final participants for ${meetingId}:`, participants);
  return participants;
}


  // Public method to end meeting (can be called from controller)
  async endMeeting(meetingId: string, hostId: string) {
    const socketIds = this.meetingRooms.get(meetingId);
    if (!socketIds) return;

    // Notify all participants that meeting ended
    this.server.to(meetingId).emit('meeting-ended', {
      meetingId,
      endedBy: hostId,
      timestamp: new Date(),
    });

    // Clean up all connections
    for (const socketId of socketIds) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(meetingId);
        socket.disconnect();
      }
      this.connectedUsers.delete(socketId);
    }

    this.meetingRooms.delete(meetingId);
    await this.meetingService.updateMeetingStatus(meetingId, 'ended');
  }
}
