import { MeetingService } from './meetings.service';
import { CreateMeetingDto } from './dto/meeting.dto';
export declare class MeetingsController {
    private readonly meetingService;
    constructor(meetingService: MeetingService);
    createMeeting(createMeetingDto: CreateMeetingDto, req: any): Promise<import("./entities/meeting.entity").Meeting>;
    getMeeting(meetingId: string): Promise<import("./entities/meeting.entity").Meeting | null>;
    joinMeeting(meetingId: string, req: any): Promise<import("./entities/meeting.entity").Meeting | null>;
    leaveMeeting(meetingId: string, req: any): Promise<import("./entities/meeting.entity").Meeting | null>;
    updateStatus(meetingId: string, body: {
        status: 'waiting' | 'active' | 'ended';
    }): Promise<import("./entities/meeting.entity").Meeting | null>;
}
