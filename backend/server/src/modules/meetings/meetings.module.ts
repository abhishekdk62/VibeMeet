import { Module } from '@nestjs/common';
import { MeetingService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { MeetingGateway } from './meeting.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Meeting, MeetingSchema } from './entities/meeting.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meeting.name, schema: MeetingSchema }]),
  ],
  controllers: [MeetingsController],
  providers: [MeetingService, MeetingGateway],
  exports: [MeetingService, MeetingGateway],
})
export class MeetingsModule {}
