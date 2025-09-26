import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { UpdateInviteDto } from './dto/update-invite.dto';
export declare class InvitesController {
    private readonly invitesService;
    constructor(invitesService: InvitesService);
    create(createInviteDto: CreateInviteDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateInviteDto: UpdateInviteDto): string;
    remove(id: string): string;
}
