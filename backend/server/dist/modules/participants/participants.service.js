"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantsService = void 0;
const common_1 = require("@nestjs/common");
let ParticipantsService = class ParticipantsService {
    create(createParticipantDto) {
        return 'This action adds a new participant';
    }
    findAll() {
        return `This action returns all participants`;
    }
    findOne(id) {
        return `This action returns a #${id} participant`;
    }
    update(id, updateParticipantDto) {
        return `This action updates a #${id} participant`;
    }
    remove(id) {
        return `This action removes a #${id} participant`;
    }
};
exports.ParticipantsService = ParticipantsService;
exports.ParticipantsService = ParticipantsService = __decorate([
    (0, common_1.Injectable)()
], ParticipantsService);
//# sourceMappingURL=participants.service.js.map