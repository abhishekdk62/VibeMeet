import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    googleAuth(): Promise<void>;
    googleAuthRedirect(req: any, res: any): Promise<any>;
    signup(body: {
        email: string;
        password: string;
    }): Promise<{
        user: any;
        accessToken: string;
    }>;
    signin(body: {
        email: string;
        password: string;
    }): Promise<{
        user: any;
        accessToken: string;
    }>;
}
