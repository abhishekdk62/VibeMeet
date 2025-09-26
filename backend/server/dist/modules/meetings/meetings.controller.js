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
exports.MeetingsController = void 0;
const common_1 = require("@nestjs/common");
const meetings_service_1 = require("./meetings.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const meeting_dto_1 = require("./dto/meeting.dto");
let MeetingsController = class MeetingsController {
    meetingService;
    constructor(meetingService) {
        this.meetingService = meetingService;
    }
    async createMeeting(createMeetingDto, req) {
        return await this.meetingService.createMeeting(createMeetingDto, req.user.sub);
    }
    async getMeetingById(userId) {
        return await this.meetingService.findByUserId(userId);
    }
    async getMeeting(meetingId) {
        return await this.meetingService.findByMeetingId(meetingId);
    }
    async joinMeeting(meetingId, req) {
        return await this.meetingService.joinMeeting(meetingId, req.user.sub);
    }
    async leaveMeeting(meetingId, req) {
        return await this.meetingService.leaveMeeting(meetingId, req.user.sub);
    }
    async updateStatus(meetingId, body) {
        return await this.meetingService.updateMeetingStatus(meetingId, body.status);
    }
};
exports.MeetingsController = MeetingsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [meeting_dto_1.CreateMeetingDto, Object]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "createMeeting", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "getMeetingById", null);
__decorate([
    (0, common_1.Get)(':meetingId'),
    __param(0, (0, common_1.Param)('meetingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "getMeeting", null);
__decorate([
    (0, common_1.Patch)(':meetingId/join'),
    __param(0, (0, common_1.Param)('meetingId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "joinMeeting", null);
__decorate([
    (0, common_1.Patch)(':meetingId/leave'),
    __param(0, (0, common_1.Param)('meetingId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "leaveMeeting", null);
__decorate([
    (0, common_1.Patch)(':meetingId/status'),
    __param(0, (0, common_1.Param)('meetingId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "updateStatus", null);
exports.MeetingsController = MeetingsController = __decorate([
    (0, common_1.Controller)('meetings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [meetings_service_1.MeetingService])
], MeetingsController);
//# sourceMappingURL=meetings.controller.js.map