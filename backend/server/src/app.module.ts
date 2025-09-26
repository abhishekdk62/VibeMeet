import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ParticipantsModule } from './modules/participants/participants.module';
import { InvitesModule } from './modules/invites/invites.module';
import { ChatModule } from './modules/chat/chat.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { AuthModule } from './modules/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),

    UsersModule,
    ParticipantsModule,
    InvitesModule,
    ChatModule,
    MeetingsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
