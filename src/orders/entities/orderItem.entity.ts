import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { User } from '../../users/entities/user.entity';
import {
  Dish,
  DishChoice,
  DishOption,
} from '../../restaurants/entities/dish.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@InputType('OrderItemInputType', { isAbstract: true }) // abstract로 설정하면 inputType으로 변환이 가능
@Entity()
@ObjectType()
export class OrderItem extends CoreEntity {
  @Field((_) => Dish)
  @ManyToOne((_) => Dish, { nullable: true, onDelete: 'CASCADE' }) //order은 dish와 dishoptions를 전부 저장할 수 없으므로, 주문 아이템 entity를 따로 만든다.
  dish: Dish; //Inverseside를 신경써줄 필요는 없음

  @Field(() => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true }) //relation을 설정하면 수정할 때마다 과거 order/dish가 수정되는데, type:json으로 설정하면 relation 없어짐. db JSON.stringfy로  JSON 객체를 저장하는 것.
  options?: OrderItemOption[]; //json은 order이 추가할 때 한번 생성되고 저장됨, relation 없음.
}

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  //고객입장에서의 주문 옵션으로 각각의 주문마다 고객이 고른 옵션과 해당 초이스 만을 가짐. 메뉴 입장에서는 옵션과 초이스가 복수일 수도 있으나 고객입장에서는 단수
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true }) //json으로 저장하기 때문에, 실제 DishChoice 엔티티가 아니어도 상관없음
  choice?: string;
}
