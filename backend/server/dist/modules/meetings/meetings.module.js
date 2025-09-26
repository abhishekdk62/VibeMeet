"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingsModule = void 0;
const common_1 = require("@nestjs/common");
const meetings_service_1 = require("./meetings.service");
const meetings_controller_1 = require("./meetings.controller");
const meeting_gateway_1 = require("./meeting.gateway");
const mongoose_1 = require("@nestjs/mongoose");
const meeting_entity_1 = require("./entities/meeting.entity");
let MeetingsModule = class MeetingsModule {
};
exports.MeetingsModule = MeetingsModule;
exports.MeetingsModule = MeetingsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: meeting_entity_1.Meeting.name, schema: meeting_entity_1.MeetingSchema }]),
        ],
        controllers: [meetings_controller_1.MeetingsController],
        providers: [meetings_service_1.MeetingService, meeting_gateway_1.MeetingGateway],
        exports: [meetings_service_1.MeetingService, meeting_gateway_1.MeetingGateway],
    })
], MeetingsModule);
//# sourceMappingURL=meetings.module.js.map