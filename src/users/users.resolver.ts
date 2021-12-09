import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './users.service';
import { User } from './entities/user.entity';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/createAccount.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthUser } from '../auth/auth-user.decorator';
import { SeeProfileInput, SeeProfileOutput } from './dtos/seeProfile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/editProfile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/VerifyEmail.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UserService) {}
  @Query(() => Boolean)
  hi() {
    return true;
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args() createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  async login(@Args() loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  Me(@AuthUser() user: User) {
    return user;
  }

  @UseGuards(AuthGuard)
  @Query(() => SeeProfileOutput)
  async seeProfile(
    @Args() seeProfileInput: SeeProfileInput,
  ): Promise<SeeProfileOutput> {
    return this.usersService.findById(seeProfileInput.userId);
  }

  @Mutation(() => EditProfileOutput)
  @UseGuards(AuthGuard)
  async editProfile(
    @AuthUser() authUser: User,
    @Args() editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput);
  }

  @Mutation(() => VerifyEmailOutput)
  async verifyEmail(
    @Args() { code }: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(code);
  }
}
