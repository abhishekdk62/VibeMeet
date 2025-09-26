declare class MeetingSettingsDto {
    allowChat?: boolean;
    allowScreenShare?: boolean;
    muteOnJoin?: boolean;
    videoOnJoin?: boolean;
    waitingRoom?: boolean;
}
export declare class CreateMeetingDto {
    title: string;
    scheduledFor?: Date;
    requiresPassword?: boolean;
    password?: string;
    settings?: MeetingSettingsDto;
}
export {};
