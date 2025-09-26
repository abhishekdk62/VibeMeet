"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const meeting_entity_1 = require("./entities/meeting.entity");
let MeetingService = class MeetingService {
    meetingModel;
    constructor(meetingModel) {
        this.meetingModel = meetingModel;
    }
    async createMeeting(createMeetingDto, hostId) {
        const meetingId = await this.generateUniqueMeetingId();
        console.log(createMeetingDto);
        const meeting = new this.meetingModel({
            ...createMeetingDto,
            meetingId,
            hostId: new mongoose_2.Types.ObjectId(hostId),
            participants: [
                {
                    userId: new mongoose_2.Types.ObjectId(hostId),
                    joinedAt: new Date(),
                    role: 'host',
                },
            ],
        });
        return await meeting.save();
    }
    async findByMeetingId(meetingId) {
        return await this.meetingModel
            .findOne({ meetingId })
            .populate('hostId', 'firstName lastName email avatar')
            .populate('participants.userId', 'firstName lastName email avatar')
            .exec();
    }
    async joinMeeting(meetingId, userId) {
        const meeting = await this.meetingModel.findOne({ meetingId });
        if (!meeting) {
            throw new common_1.NotFoundException('Meeting not found');
        }
        const participant = meeting.participants.find((p) => p.userId.toString() === userId);
        if (participant && !participant.leftAt) {
            throw new common_1.BadRequestException('User already joined this meeting');
        }
        return await this.meetingModel
            .findOneAndUpdate({
            meetingId,
            'participants.userId': { $ne: new mongoose_2.Types.ObjectId(userId) },
        }, {
            $push: {
                participants: {
                    userId: new mongoose_2.Types.ObjectId(userId),
                    joinedAt: new Date(),
                    role: 'participant',
                },
            },
        }, { new: true })
            .populate('hostId', 'firstName lastName email avatar')
            .populate('participants.userId', 'firstName lastName email avatar');
    }
    async leaveMeeting(meetingId, userId) {
        return await this.meetingModel.findOneAndUpdate({
            meetingId,
            'participants.userId': new mongoose_2.Types.ObjectId(userId),
        }, {
            $set: {
                'participants.$.leftAt': new Date(),
            },
        }, { new: true });
    }
    async updateMeetingStatus(meetingId, status) {
        return await this.meetingModel.findOneAndUpdate({ meetingId }, { status }, { new: true });
    }
    async generateUniqueMeetingId() {
        let meetingId = '';
        let isUnique = false;
        while (!isUnique) {
            meetingId = this.generateMeetingCode();
            const existing = await this.meetingModel.findOne({ meetingId });
            isUnique = !existing;
        }
        return meetingId;
    }
    generateMeetingCode() {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        const segments = [3, 4, 3];
        return segments
            .map((length) => Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join(''))
            .join('-');
    }
};
exports.MeetingService = MeetingService;
exports.MeetingService = MeetingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(meeting_entity_1.Meeting.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MeetingService);
//# sourceMappingURL=meetings.service.js.map