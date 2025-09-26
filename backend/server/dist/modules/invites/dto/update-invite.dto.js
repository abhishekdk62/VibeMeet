"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInviteDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_invite_dto_1 = require("./create-invite.dto");
class UpdateInviteDto extends (0, mapped_types_1.PartialType)(create_invite_dto_1.CreateInviteDto) {
}
exports.UpdateInviteDto = UpdateInviteDto;
//# sourceMappingURL=update-invite.dto.js.map