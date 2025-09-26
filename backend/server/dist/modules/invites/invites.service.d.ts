import { CreateInviteDto } from './dto/create-invite.dto';
import { UpdateInviteDto } from './dto/update-invite.dto';
export declare class InvitesService {
    create(createInviteDto: CreateInviteDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateInviteDto: UpdateInviteDto): string;
    remove(id: number): string;
}
