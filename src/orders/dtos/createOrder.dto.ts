import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Column } from 'typeorm';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Order } from '../entities/order.entity';
import { DishOption } from '../../restaurants/entities/dish.entity';
import { OrderItemOption } from '../entities/orderItem.entity';

@InputType()
@ObjectType()
class CreateOrderItemInput {
  @Field((_) => Int)
  dishId: number;

  @Field((_) => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field((_) => [CreateOrderItemInput])
  items: CreateOrderItemInput[];

  @Field((_) => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
