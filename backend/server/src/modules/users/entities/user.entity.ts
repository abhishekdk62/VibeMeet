import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop()
  avatar?: string;

  @Prop({ default: 'offline', enum: ['online', 'offline', 'in_meeting'] })
  status: string;

  @Prop({ required: true })
  password?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
