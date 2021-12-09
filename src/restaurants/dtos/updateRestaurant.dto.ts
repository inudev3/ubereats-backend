import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { createRestaurantDto } from './createRestaurant.dto';

@InputType()
export class updateRestaurantInputType extends PartialType(
  createRestaurantDto,
  InputType,
) {}

@ArgsType()
export class updateRestaurantDto {
  @Field(() => Number)
  id: number;
  @Field(() => updateRestaurantInputType)
  data: updateRestaurantInputType;
}
