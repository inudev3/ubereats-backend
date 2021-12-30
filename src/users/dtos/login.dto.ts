import { CoreOutput } from '../../common/dtos/output.dto';
import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { IsOptional } from 'class-validator';

@ArgsType()
export class LoginInput extends PickType(
  User,
  ['email', 'password'],
  ArgsType,
) {}
@ObjectType()
export class LoginOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  token?: string;
}
