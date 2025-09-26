// src/modules/meetings/meetings.controller.ts
import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Body, 
  UseGuards, 
  Request,
  Patch 
} from '@nestjs/common';
import { MeetingService } from './meetings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMeetingDto } from './dto/meeting.dto';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post()
  async createMeeting(
    @Body() createMeetingDto: CreateMeetingDto,
    @Request() req: any
  ) {
    
    return await this.meetingService.createMeeting(createMeetingDto, req.user.sub);
  }

  @Get(':meetingId')
  async getMeeting(@Param('meetingId') meetingId: string) {
    return await this.meetingService.findByMeetingId(meetingId);
  }

  @Patch(':meetingId/join')
  async joinMeeting(
    @Param('meetingId') meetingId: string,
    @Request() req: any
  ) {
    return await this.meetingService.joinMeeting(meetingId, req.user.sub);
  }

  @Patch(':meetingId/leave')
  async leaveMeeting(
    @Param('meetingId') meetingId: string,
    @Request() req: any
  ) {
    return await this.meetingService.leaveMeeting(meetingId, req.user.sub);
  }

  @Patch(':meetingId/status')
  async updateStatus(
    @Param('meetingId') meetingId: string,
    @Body() body: { status: 'waiting' | 'active' | 'ended' }
  ) {
    return await this.meetingService.updateMeetingStatus(meetingId, body.status);
  }
}
