import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
export declare class ParticipantsService {
    create(createParticipantDto: CreateParticipantDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateParticipantDto: UpdateParticipantDto): string;
    remove(id: number): string;
}
