import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
export declare class ParticipantsController {
    private readonly participantsService;
    constructor(participantsService: ParticipantsService);
    create(createParticipantDto: CreateParticipantDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateParticipantDto: UpdateParticipantDto): string;
    remove(id: string): string;
}
