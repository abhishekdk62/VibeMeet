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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingSchema = exports.Meeting = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Meeting = class Meeting extends mongoose_2.Document {
    meetingId;
    title;
    hostId;
    scheduledFor;
    status;
    requiresPassword;
    password;
    settings;
    participants;
};
exports.Meeting = Meeting;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, length: 15 }),
    __metadata("design:type", String)
], Meeting.prototype, "meetingId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Meeting.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Meeting.prototype, "hostId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Meeting.prototype, "scheduledFor", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['waiting', 'active', 'ended'],
        default: 'waiting'
    }),
    __metadata("design:type", String)
], Meeting.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Meeting.prototype, "requiresPassword", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Meeting.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: {
            allowChat: true,
            allowScreenShare: true,
            muteOnJoin: false,
            videoOnJoin: true,
            waitingRoom: false
        }
    }),
    __metadata("design:type", Object)
], Meeting.prototype, "settings", void 0);
__decorate([
    (0, mongoose_1.Prop)([{
            userId: { type: mongoose_2.Types.ObjectId, ref: 'User' },
            joinedAt: { type: Date, default: Date.now },
            leftAt: Date,
            role: { type: String, enum: ['host', 'participant'], default: 'participant' }
        }]),
    __metadata("design:type", Array)
], Meeting.prototype, "participants", void 0);
exports.Meeting = Meeting = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Meeting);
exports.MeetingSchema = mongoose_1.SchemaFactory.createForClass(Meeting);
//# sourceMappingURL=meeting.entity.js.map