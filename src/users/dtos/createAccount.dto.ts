import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { MutationOutput } from '../../common/dtos/output.dto';

@ArgsType()
export class CreateAccountInput extends PickType(
  User,
  ['email', 'password', 'role'],
  ArgsType,
) {}

@ObjectType() // output은 objectType(graphql typeDef), input은 argsTyps
export class CreateAccountOutput extends MutationOutput {}
