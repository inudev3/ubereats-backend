import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';

import { User } from '../../users/entities/user.entity';

import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Dish } from '../../restaurants/entities/dish.entity';
import { OrderItem } from './orderItem.entity';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}
registerEnumType(OrderStatus, { name: 'OrderStatus' });
@InputType('OrderInputType', { isAbstract: true }) // abstract로 설정하면 inputType으로 변환이 가능
@Entity()
@ObjectType()
export class Order extends CoreEntity {
  @Field((_) => User, { nullable: true })
  @ManyToOne((_) => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  customer?: User;

  @Field((_) => User, { nullable: true })
  @ManyToOne((_) => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  driver?: User;

  @Field((_) => Restaurant, { nullable: true })
  @ManyToOne((_) => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true, //레스토랑이 지워져도 주문은 지워지지 않도록
  })
  restaurant?: Restaurant;

  @Field((_) => [OrderItem])
  @ManyToMany((_) => OrderItem)
  @JoinTable() //should always join the table in the owning side(주문에서 dish를 접근하기 때문에 주문에서 JoinTable해야함)
  items: OrderItem[];

  @Column({ nullable: true })
  @Field((_) => Float, { nullable: true })
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @Field((_) => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
