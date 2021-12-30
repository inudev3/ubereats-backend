import { CoreOutput } from '../../common/dtos/output.dto';
import { ArgsType, ObjectType, PickType } from '@nestjs/graphql';
import { Verification } from '../entities/verification.entity';

@ArgsType()
export class VerifyEmailInput extends PickType(
  Verification,
  ['code'],
  ArgsType,
) {}

@ObjectType()
export class VerifyEmailOutput extends CoreOutput {}
