"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MeetingGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const meetings_service_1 = require("./meetings.service");
let MeetingGateway = MeetingGateway_1 = class MeetingGateway {
    meetingService;
    server;
    logger = new common_1.Logger(MeetingGateway_1.name);
    connectedUsers = new Map();
    meetingRooms = new Map();
    userToSocket = new Map();
    constructor(meetingService) {
        this.meetingService = meetingService;
    }
    handleConnection(socket) {
        this.logger.log(`Client connected: ${socket.id}`);
    }
    handleDisconnect(socket) {
        this.logger.log(`Client disconnected: ${socket.id}`);
        const user = this.connectedUsers.get(socket.id);
        if (user) {
            this.handleLeaveMeeting(socket, { meetingId: user.meetingId });
        }
    }
    async handleHostMuteParticipant(socket, data) {
        try {
            const isHost = await this.verifyHost(socket.id, data.meetingId);
            if (!isHost) {
                socket.emit('error', { message: 'Only hosts can mute participants' });
                return;
            }
            const targetUser = this.connectedUsers.get(data.targetSocketId);
            if (targetUser) {
                targetUser.audioEnabled = false;
            }
            this.server.to(data.targetSocketId).emit('host-muted-you');
            this.server.to(data.meetingId).emit('participant-audio-toggle', {
                socketId: data.targetSocketId,
                userId: targetUser?.userId,
                audioEnabled: false,
                mutedByHost: true,
            });
            this.logger.log(`Host ${socket.id} muted participant ${data.targetSocketId}`);
        }
        catch (error) {
            this.logger.error('Error in host mute:', error);
            socket.emit('error', { message: 'Failed to mute participant' });
        }
    }
    async handleHostUnmuteParticipant(socket, data) {
        try {
            const isHost = await this.verifyHost(socket.id, data.meetingId);
            if (!isHost) {
                socket.emit('error', { message: 'Only hosts can unmute participants' });
                return;
            }
            const targetUser = this.connectedUsers.get(data.targetSocketId);
            if (targetUser) {
                targetUser.audioEnabled = true;
            }
            this.server.to(data.targetSocketId).emit('host-unmuted-you');
            this.server.to(data.meetingId).emit('participant-audio-toggle', {
                socketId: data.targetSocketId,
                userId: targetUser?.userId,
                audioEnabled: true,
                mutedByHost: false,
            });
            this.logger.log(`Host ${socket.id} unmuted participant ${data.targetSocketId}`);
        }
        catch (error) {
            this.logger.error('Error in host unmute:', error);
            socket.emit('error', { message: 'Failed to unmute participant' });
        }
    }
    async handleHostDisableVideo(socket, data) {
        try {
            const isHost = await this.verifyHost(socket.id, data.meetingId);
            if (!isHost) {
                socket.emit('error', { message: 'Only hosts can disable video' });
                return;
            }
            const targetUser = this.connectedUsers.get(data.targetSocketId);
            if (targetUser) {
                targetUser.videoEnabled = false;
            }
            this.server.to(data.targetSocketId).emit('host-disabled-your-video');
            this.server.to(data.meetingId).emit('participant-video-toggle', {
                socketId: data.targetSocketId,
                userId: targetUser?.userId,
                videoEnabled: false,
                disabledByHost: true,
            });
            this.logger.log(`Host ${socket.id} disabled video for participant ${data.targetSocketId}`);
        }
        catch (error) {
            this.logger.error('Error in host disable video:', error);
            socket.emit('error', { message: 'Failed to disable video' });
        }
    }
    async handleHostEnableVideo(socket, data) {
        try {
            const isHost = await this.verifyHost(socket.id, data.meetingId);
            if (!isHost) {
                socket.emit('error', { message: 'Only hosts can enable video' });
                return;
            }
            const targetUser = this.connectedUsers.get(data.targetSocketId);
            if (targetUser) {
                targetUser.videoEnabled = true;
            }
            this.server.to(data.targetSocketId).emit('host-enabled-your-video');
            this.server.to(data.meetingId).emit('participant-video-toggle', {
                socketId: data.targetSocketId,
                userId: targetUser?.userId,
                videoEnabled: true,
                disabledByHost: false,
            });
            this.logger.log(`Host ${socket.id} enabled video for participant ${data.targetSocketId}`);
        }
        catch (error) {
            this.logger.error('Error in host enable video:', error);
            socket.emit('error', { message: 'Failed to enable video' });
        }
    }
    async handleRemoveParticipant(socket, data) {
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
            await this.meetingService.leaveMeeting(data.meetingId, targetUser.userId);
            this.server.to(data.targetSocketId).emit('you-were-removed', {
                reason: 'Removed by host',
            });
            socket.to(data.meetingId).emit('participant-left', {
                socketId: data.targetSocketId,
                userId: targetUser.userId,
                userName: targetUser.userName,
                reason: 'removed',
            });
            this.connectedUsers.delete(data.targetSocketId);
            this.userToSocket.delete(targetUser.userId);
            const meetingRoom = this.meetingRooms.get(data.meetingId);
            if (meetingRoom) {
                meetingRoom.delete(data.targetSocketId);
            }
            const targetSocket = this.server.sockets.sockets.get(data.targetSocketId);
            if (targetSocket) {
                targetSocket.leave(data.meetingId);
                targetSocket.disconnect();
            }
            this.logger.log(`Host ${socket.id} removed participant ${data.targetSocketId}`);
        }
        catch (error) {
            this.logger.error('Error removing participant:', error);
            socket.emit('error', { message: 'Failed to remove participant' });
        }
    }
    async verifyHost(socketId, meetingId) {
        const user = this.connectedUsers.get(socketId);
        if (!user)
            return false;
        if (user.isHost && user.meetingId === meetingId) {
            return true;
        }
        try {
            const meeting = await this.meetingService.findByMeetingId(meetingId);
            return !!meeting && user.userId === meeting.hostId.toString();
        }
        catch (error) {
            this.logger.error('Error verifying host:', error);
            return false;
        }
    }
    async handleJoinMeeting(socket, data) {
        const { meetingId, userId, userName, isHost = false } = data;
        this.logger.log('=== JOIN MEETING REQUEST ===');
        this.logger.log(`Socket ID: ${socket.id}`);
        this.logger.log(`Request data:`, JSON.stringify(data, null, 2));
        try {
            this.logger.log(`Looking for meeting: ${meetingId}`);
            const meeting = await this.meetingService.findByMeetingId(meetingId);
            if (!meeting) {
                this.logger.error(`Meeting not found: ${meetingId}`);
                socket.emit('join-error', { message: 'Meeting not found' });
                return;
            }
            this.logger.log(`Meeting found: ${meeting._id}`);
            if (meeting.status === 'ended') {
                this.logger.error(`Meeting has ended: ${meetingId}`);
                socket.emit('join-error', { message: 'Meeting has ended' });
                return;
            }
            const isActualHost = meeting.hostId.toString() === userId || isHost;
            this.logger.log(`User ${userId} is host: ${isActualHost}`);
            this.logger.log(`Joining socket room: ${meetingId}`);
            socket.join(meetingId);
            const connectedUser = {
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
            if (!this.meetingRooms.has(meetingId)) {
                this.meetingRooms.set(meetingId, new Set());
            }
            this.meetingRooms.get(meetingId).add(socket.id);
            this.logger.log('=== AFTER ADDING USER ===');
            this.logger.log('Connected users:', Array.from(this.connectedUsers.keys()));
            this.logger.log('Meeting rooms:', Array.from(this.meetingRooms.keys()));
            this.logger.log(`Sockets in room ${meetingId}:`, Array.from(this.meetingRooms.get(meetingId) || []));
            const participants = this.getMeetingParticipants(meetingId);
            this.logger.log(`Current participants count: ${participants.length}`);
            this.logger.log(`Participants:`, participants);
            if (participants.length === 1) {
                this.logger.log('First participant - updating meeting status to active');
                await this.meetingService.updateMeetingStatus(meetingId, 'active');
            }
            this.logger.log('Updating database with participant join');
            try {
                await this.meetingService.joinMeeting(meetingId, userId);
                this.logger.log('Database updated successfully');
            }
            catch (dbError) {
                this.logger.warn('Database update failed, but continuing:', dbError.message);
            }
            socket.emit('joined-successfully', { meetingId, participants });
            this.logger.log(`✅ User ${userName} successfully joined meeting ${meetingId} as ${isActualHost ? 'host' : 'participant'}`);
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
            this.server.to(meetingId).emit('participants-list', { participants });
        }
        catch (error) {
            this.logger.error('❌ Error joining meeting:', error);
            this.logger.error('Error stack:', error.stack);
            socket.emit('join-error', {
                message: 'Failed to join meeting',
                error: error.message,
            });
        }
    }
    async handleLeaveMeeting(socket, data) {
        const { meetingId } = data;
        const user = this.connectedUsers.get(socket.id);
        if (!user)
            return;
        try {
            socket.leave(meetingId);
            this.connectedUsers.delete(socket.id);
            this.userToSocket.delete(user.userId);
            const meetingRoom = this.meetingRooms.get(meetingId);
            if (meetingRoom) {
                meetingRoom.delete(socket.id);
                if (meetingRoom.size === 0) {
                    this.meetingRooms.delete(meetingId);
                    await this.meetingService.updateMeetingStatus(meetingId, 'ended');
                }
            }
            socket.to(meetingId).emit('participant-left', {
                socketId: socket.id,
                userId: user.userId,
                userName: user.userName,
            });
            await this.meetingService.leaveMeeting(meetingId, user.userId);
            socket.emit('left-successfully', { meetingId });
            this.logger.log(`User ${user.userName} left meeting ${meetingId}`);
        }
        catch (error) {
            this.logger.error('Error leaving meeting:', error);
        }
    }
    handleWebRTCOffer(socket, data) {
        const { targetSocketId, offer, meetingId } = data;
        socket.to(targetSocketId).emit('webrtc-offer', {
            offer,
            from: socket.id,
            meetingId,
        });
        this.logger.debug(`WebRTC offer sent from ${socket.id} to ${targetSocketId}`);
    }
    handleWebRTCAnswer(socket, data) {
        const { targetSocketId, answer } = data;
        socket.to(targetSocketId).emit('webrtc-answer', {
            answer,
            from: socket.id,
        });
        this.logger.debug(`WebRTC answer sent from ${socket.id} to ${targetSocketId}`);
    }
    handleWebRTCIceCandidate(socket, data) {
        const { targetSocketId, candidate } = data;
        socket.to(targetSocketId).emit('webrtc-ice-candidate', {
            candidate,
            from: socket.id,
        });
        this.logger.debug(`ICE candidate sent from ${socket.id} to ${targetSocketId}`);
    }
    handleToggleVideo(socket, data) {
        const user = this.connectedUsers.get(socket.id);
        if (!user)
            return;
        user.videoEnabled = data.videoEnabled;
        socket.to(data.meetingId).emit('participant-video-toggle', {
            socketId: socket.id,
            userId: user.userId,
            videoEnabled: data.videoEnabled,
        });
    }
    handleToggleAudio(socket, data) {
        const user = this.connectedUsers.get(socket.id);
        if (!user)
            return;
        user.audioEnabled = data.audioEnabled;
        socket.to(data.meetingId).emit('participant-audio-toggle', {
            socketId: socket.id,
            userId: user.userId,
            audioEnabled: data.audioEnabled,
        });
    }
    handleScreenShareStart(socket, data) {
        const user = this.connectedUsers.get(socket.id);
        if (!user)
            return;
        socket.to(data.meetingId).emit('participant-screen-share-start', {
            socketId: socket.id,
            userId: user.userId,
            userName: user.userName,
        });
    }
    handleScreenShareStop(socket, data) {
        const user = this.connectedUsers.get(socket.id);
        if (!user)
            return;
        socket.to(data.meetingId).emit('participant-screen-share-stop', {
            socketId: socket.id,
            userId: user.userId,
        });
    }
    handleSendMessage(socket, data) {
        this.logger.log('📨 Message received on server:', JSON.stringify(data, null, 2));
        const user = this.connectedUsers.get(socket.id);
        if (!user) {
            this.logger.error('❌ User not found for message sending');
            socket.emit('error', { message: 'User not found' });
            return;
        }
        const messageData = {
            id: data.id || `${socket.id}-${Date.now()}-${Math.random()}`,
            message: data.message.trim(),
            userName: data.userName || user.userName,
            socketId: socket.id,
            userId: user.userId,
            timestamp: data.timestamp || new Date().toISOString(),
            meetingId: data.meetingId,
        };
        this.logger.log('📤 Broadcasting message:', JSON.stringify(messageData, null, 2));
        this.server.to(data.meetingId).emit('new-message', messageData);
        this.logger.log(`✅ Message sent in meeting ${data.meetingId} by ${user.userName}`);
    }
    getMeetingParticipants(meetingId) {
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
    async endMeeting(meetingId, hostId) {
        const socketIds = this.meetingRooms.get(meetingId);
        if (!socketIds)
            return;
        this.server.to(meetingId).emit('meeting-ended', {
            meetingId,
            endedBy: hostId,
            timestamp: new Date(),
        });
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
};
exports.MeetingGateway = MeetingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MeetingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('host-mute-participant'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MeetingGateway.prototype, "handleHostMuteParticipant", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('host-unmute-participant'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MeetingGateway.prototype, "handleHostUnmuteParticipant", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('host-disable-video'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MeetingGateway.prototype, "handleHostDisableVideo", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('host-enable-video'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MeetingGateway.prototype, "handleHostEnableVideo", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('remove-participant'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MeetingGateway.prototype, "handleRemoveParticipant", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-meeting'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MeetingGateway.prototype, "handleJoinMeeting", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-meeting'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MeetingGateway.prototype, "handleLeaveMeeting", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc-offer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MeetingGateway.prototype, "handleWebRTCOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc-answer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MeetingGateway.prototype, "handleWebRTCAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc-ice-candidate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MeetingGateway.prototype, "handleWebRTCIceCandidate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('toggle-video'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MeetingGateway.prototype, "handleToggleVideo", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('toggle-audio'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MeetingGateway.prototype, "handleToggleAudio", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('screen-share-start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MeetingGateway.prototype, "handleScreenShareStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('screen-share-stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MeetingGateway.prototype, "handleScreenShareStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send-message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MeetingGateway.prototype, "handleSendMessage", null);
exports.MeetingGateway = MeetingGateway = MeetingGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.NODE_ENV == 'dev'
                ? process.env.FRONTEND_URL_DEV
                : process.env.FRONTEND_URL_PROD,
            credentials: true,
        },
        namespace: '/meetings',
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [meetings_service_1.MeetingService])
], MeetingGateway);
//# sourceMappingURL=meeting.gateway.js.map