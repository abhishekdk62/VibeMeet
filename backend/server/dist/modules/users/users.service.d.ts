import { Model } from 'mongoose';
import { User } from './entities/user.entity';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<User>);
    findByGoogleId(googleId: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(userData: any): Promise<User>;
    findById(id: string): Promise<User | null>;
}
