import { Document, Types } from 'mongoose';
export type MeetingDocument = Meeting & Document;
export declare class Meeting extends Document {
    meetingId: string;
    title: string;
    hostId: Types.ObjectId;
    scheduledFor?: Date;
    status: string;
    requiresPassword: boolean;
    password?: string;
    settings: {
        allowChat: boolean;
        allowScreenShare: boolean;
        muteOnJoin: boolean;
        videoOnJoin: boolean;
        waitingRoom: boolean;
    };
    participants: Array<{
        userId: Types.ObjectId;
        joinedAt: Date;
        leftAt?: Date;
        role: string;
    }>;
}
export declare const MeetingSchema: import("mongoose").Schema<Meeting, import("mongoose").Model<Meeting, any, any, any, Document<unknown, any, Meeting, any, {}> & Meeting & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Meeting, Document<unknown, {}, import("mongoose").FlatRecord<Meeting>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Meeting> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
