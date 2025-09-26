// src/modules/auth/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async googleLogin(googleUser: any) {
    let user = await this.usersService.findByGoogleId(googleUser.googleId);
    if (!user) {
      user = await this.usersService.create({
        googleId: googleUser.googleId,
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        avatar: googleUser.avatar,
      });
    }
    const payload = { 
      sub: user._id, 
      email: user.email, 
      firstName: user.firstName,
      lastName: user.lastName 
    };
    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async signup(email: string, password: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User already exists with this email');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.usersService.create({ email, password: hashedPassword });
    return this.generateToken(newUser);
  }

  async signin(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Account doesnt exist or invalid Email');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid Password');
    }
    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
