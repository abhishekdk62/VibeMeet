import { Model } from 'mongoose';
import { Meeting, MeetingDocument } from './entities/meeting.entity';
import { CreateMeetingDto } from './dto/meeting.dto';
export declare class MeetingService {
    private meetingModel;
    constructor(meetingModel: Model<MeetingDocument>);
    createMeeting(createMeetingDto: CreateMeetingDto, hostId: string): Promise<Meeting>;
    findByMeetingId(meetingId: string): Promise<Meeting | null>;
    joinMeeting(meetingId: string, userId: string): Promise<Meeting | null>;
    leaveMeeting(meetingId: string, userId: string): Promise<Meeting | null>;
    updateMeetingStatus(meetingId: string, status: 'waiting' | 'active' | 'ended'): Promise<Meeting | null>;
    private generateUniqueMeetingId;
    private generateMeetingCode;
}
