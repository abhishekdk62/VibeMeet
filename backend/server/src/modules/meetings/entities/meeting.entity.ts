import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MeetingDocument = Meeting & Document;

@Schema({ timestamps: true })
export class Meeting extends Document {
  @Prop({ required: true, unique: true, length: 15 })
  meetingId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  hostId: Types.ObjectId;

  @Prop()
  scheduledFor?: Date;

  @Prop({ 
    enum: ['waiting', 'active', 'ended'], 
    default: 'waiting' 
  })
  status: string;

  @Prop({ default: false })
  requiresPassword: boolean;

  @Prop()
  password?: string;

  @Prop({
    type: Object,
    default: {
      allowChat: true,
      allowScreenShare: true,
      muteOnJoin: false,
      videoOnJoin: true,
      waitingRoom: false
    }
  })
  settings: {
    allowChat: boolean;
    allowScreenShare: boolean;
    muteOnJoin: boolean;
    videoOnJoin: boolean;
    waitingRoom: boolean;
  };

  @Prop([{ 
    userId: { type: Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    leftAt: Date,
    role: { type: String, enum: ['host', 'participant'], default: 'participant' }
  }])
  participants: Array<{
    userId: Types.ObjectId;
    joinedAt: Date;
    leftAt?: Date;
    role: string;
  }>;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
