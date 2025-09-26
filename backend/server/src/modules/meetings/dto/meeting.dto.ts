// src/modules/meetings/dto/create-meeting.dto.ts
import { IsString, IsOptional, IsBoolean, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MeetingSettingsDto {
  @IsBoolean()
  @IsOptional()
  allowChat?: boolean = true;

  @IsBoolean()
  @IsOptional()
  allowScreenShare?: boolean = true;

  @IsBoolean()
  @IsOptional()
  muteOnJoin?: boolean = false;

  @IsBoolean()
  @IsOptional()
  videoOnJoin?: boolean = true;

  @IsBoolean()
  @IsOptional()
  waitingRoom?: boolean = false;
}

export class CreateMeetingDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsDateString()
  scheduledFor?: Date;

  @IsOptional()
  @IsBoolean()
  requiresPassword?: boolean = false;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MeetingSettingsDto)
  settings?: MeetingSettingsDto;
}
