import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/createAccount.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '../jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/editProfile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/VerifyEmail.dto';
import { SeeProfileOutput } from './dtos/seeProfile.dto';
import { MailService } from '../mail/mail.service';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    //check new user && hash the password
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: 'There is an user with that email already' };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.verifications.save(
        this.verifications.create({ user }),
      );
      this.mailService.sendVerificationEmail(
        user.email,
        verification.code,
        user.email,
      );
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    //find user, check password, make a JWT and give to user
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['password', 'id'] },
      );
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      const PasswordCorrect = await user.checkPassword(password);
      if (!PasswordCorrect) {
        return {
          ok: false,
          error: 'Wrong password.',
        };
      }
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return { ok: false, error: 'Cannot login' };
    }
  }

  async findById(id: number): Promise<SeeProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return { ok: false, error: 'User not Found.' };
    }
  }

  async editProfile(
    userId: number,
    { email, password, role }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    //입력하지 않은 input이 undefined가 되지 않도록 조심해야 함.
    try {
      const user = await this.users.findOne({ id: userId });

      if (email) {
        user.email = email;
        user.verified = false;
        await this.verifications.delete({ user: { id: userId } });
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        this.mailService.sendVerificationEmail(
          user.email,
          verification.code,
          user.email,
        );
      }
      if (password) user.password = password;
      if (role) user.role = role;
      await this.users.save(user); //save여야 BeforeUpdate가 작동함. update는 작동안함.
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not update profile.' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      ); //{relations:['user']}
      if (verification) {
        // await this.users.update(
        //   { id: verification.user.id },
        //   { verified: true },
        // );
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return { ok: true };
      }
      return { ok: false, error: 'Verification not found.' };
    } catch (error) {
      console.log(error);
      return { ok: false, error: 'Could not verify Email.' };
    }
  }
}
