import { ArgsType, InputType, OmitType } from '@nestjs/graphql';

import { Restaurant } from '../entities/restaurant.entity';

@ArgsType()
export class createRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  ArgsType,
) {} //Mapped Types allows you to change decorateor from parent class됨
//또는 entity에 InputType을 isAbstact:true로 설정해도 됨
