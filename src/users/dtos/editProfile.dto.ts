import { ArgsType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ArgsType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password', 'role']),
  ArgsType,
) {}

@ObjectType()
export class EditProfileOutput extends CoreOutput {}
