// src/modules/meetings/meetings.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meeting, MeetingDocument } from './entities/meeting.entity';
import { CreateMeetingDto } from './dto/meeting.dto';

@Injectable()
export class MeetingService {
  constructor(
    @InjectModel(Meeting.name)
    private meetingModel: Model<MeetingDocument>,
  ) {}

  async createMeeting(
    createMeetingDto: CreateMeetingDto,
    hostId: string,
  ): Promise<Meeting> {
    const meetingId = await this.generateUniqueMeetingId();
    console.log(createMeetingDto);
    const meeting = new this.meetingModel({
      ...createMeetingDto,
      meetingId,
      hostId: new Types.ObjectId(hostId),
      participants: [
        {
          userId: new Types.ObjectId(hostId),
          joinedAt: new Date(),
          role: 'host',
        },
      ],
    });

    return await meeting.save();
  }

  async findByMeetingId(meetingId: string): Promise<Meeting | null> {
    return await this.meetingModel
      .findOne({ meetingId })
      .populate('hostId', 'firstName lastName email avatar')
      .populate('participants.userId', 'firstName lastName email avatar')
      .exec();
  }

  async joinMeeting(
    meetingId: string,
    userId: string,
  ): Promise<Meeting | null> {
    const meeting = await this.meetingModel.findOne({ meetingId });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    const participant = meeting.participants.find(
      (p) => p.userId.toString() === userId,
    );
    if (participant && !participant.leftAt) {
      throw new BadRequestException('User already joined this meeting');
    }
    return await this.meetingModel
      .findOneAndUpdate(
        {
          meetingId,
          'participants.userId': { $ne: new Types.ObjectId(userId) },
        },
        {
          $push: {
            participants: {
              userId: new Types.ObjectId(userId),
              joinedAt: new Date(),
              role: 'participant',
            },
          },
        },
        { new: true },
      )
      .populate('hostId', 'firstName lastName email avatar')
      .populate('participants.userId', 'firstName lastName email avatar');
  }

  async leaveMeeting(
    meetingId: string,
    userId: string,
  ): Promise<Meeting | null> {
    return await this.meetingModel.findOneAndUpdate(
      {
        meetingId,
        'participants.userId': new Types.ObjectId(userId),
      },
      {
        $set: {
          'participants.$.leftAt': new Date(),
        },
      },
      { new: true },
    );
  }

  async updateMeetingStatus(
    meetingId: string,
    status: 'waiting' | 'active' | 'ended',
  ): Promise<Meeting | null> {
    return await this.meetingModel.findOneAndUpdate(
      { meetingId },
      { status },
      { new: true },
    );
  }

  private async generateUniqueMeetingId(): Promise<string> {
    let meetingId: string = '';
    let isUnique = false;

    while (!isUnique) {
      meetingId = this.generateMeetingCode();
      const existing = await this.meetingModel.findOne({ meetingId });
      isUnique = !existing;
    }

    return meetingId;
  }

  private generateMeetingCode(): string {
    // Generate 10-character code like "abc-defg-hij"
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const segments = [3, 4, 3]; // abc-defg-hij pattern

    return segments
      .map((length) =>
        Array.from(
          { length },
          () => chars[Math.floor(Math.random() * chars.length)],
        ).join(''),
      )
      .join('-');
  }
}
