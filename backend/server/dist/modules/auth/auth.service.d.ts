import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    googleLogin(googleUser: any): Promise<{
        user: import("../users/entities/user.entity").User;
        accessToken: string;
    }>;
    signup(email: string, password: string): Promise<{
        user: any;
        accessToken: string;
    }>;
    signin(email: string, password: string): Promise<{
        user: any;
        accessToken: string;
    }>;
    private generateToken;
}
