import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MeetingService } from './meetings.service';
export declare class MeetingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly meetingService;
    server: Server;
    private readonly logger;
    private connectedUsers;
    private meetingRooms;
    private userToSocket;
    constructor(meetingService: MeetingService);
    handleConnection(socket: Socket): void;
    handleDisconnect(socket: Socket): void;
    handleHostMuteParticipant(socket: Socket, data: {
        meetingId: string;
        targetSocketId: string;
        hostSocketId: string;
    }): Promise<void>;
    handleHostUnmuteParticipant(socket: Socket, data: {
        meetingId: string;
        targetSocketId: string;
        hostSocketId: string;
    }): Promise<void>;
    handleHostDisableVideo(socket: Socket, data: {
        meetingId: string;
        targetSocketId: string;
        hostSocketId: string;
    }): Promise<void>;
    handleHostEnableVideo(socket: Socket, data: {
        meetingId: string;
        targetSocketId: string;
        hostSocketId: string;
    }): Promise<void>;
    handleRemoveParticipant(socket: Socket, data: {
        meetingId: string;
        targetSocketId: string;
        hostSocketId: string;
    }): Promise<void>;
    private verifyHost;
    handleJoinMeeting(socket: Socket, data: {
        meetingId: string;
        userId: string;
        userName: string;
        isHost?: boolean;
        socketId?: string;
    }): Promise<void>;
    handleLeaveMeeting(socket: Socket, data: {
        meetingId: string;
    }): Promise<void>;
    handleWebRTCOffer(socket: Socket, data: {
        meetingId: string;
        targetSocketId: string;
        offer: RTCSessionDescriptionInit;
    }): void;
    handleWebRTCAnswer(socket: Socket, data: {
        targetSocketId: string;
        answer: RTCSessionDescriptionInit;
    }): void;
    handleWebRTCIceCandidate(socket: Socket, data: {
        targetSocketId: string;
        candidate: RTCIceCandidateInit;
    }): void;
    handleToggleVideo(socket: Socket, data: {
        meetingId: string;
        videoEnabled: boolean;
    }): void;
    handleToggleAudio(socket: Socket, data: {
        meetingId: string;
        audioEnabled: boolean;
    }): void;
    handleScreenShareStart(socket: Socket, data: {
        meetingId: string;
    }): void;
    handleScreenShareStop(socket: Socket, data: {
        meetingId: string;
    }): void;
    handleSendMessage(socket: Socket, data: {
        meetingId: string;
        message: string;
        userName?: string;
        socketId?: string;
        timestamp?: string;
        id?: string;
    }): void;
    private getMeetingParticipants;
    endMeeting(meetingId: string, hostId: string): Promise<void>;
}
