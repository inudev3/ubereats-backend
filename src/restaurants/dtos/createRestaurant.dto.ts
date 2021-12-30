import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';

import { Restaurant } from '../entities/restaurant.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

@InputType()
export class CreateRestaurantInput extends PickType(
  Restaurant,
  ['name', 'coverImg', 'address'],
  ArgsType,
) {
  @Field(() => String)
  categoryName: string;
} //Mapped Types allows you to change decorateor from parent class됨
//또는 entity에 InputType을 isAbstact:true로 설정해도 됨
@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
