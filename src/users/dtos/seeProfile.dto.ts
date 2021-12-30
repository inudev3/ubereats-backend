import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

@ArgsType()
export class SeeProfileInput {
  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class SeeProfileOutput extends CoreOutput {
  @Field(() => User, { nullable: true })
  user?: User;
}

// output은 objectType(graphql typeDef), input은 argsTyps
