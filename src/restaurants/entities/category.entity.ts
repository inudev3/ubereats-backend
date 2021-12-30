import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true }) // abstract로 설정하면 inputType으로 변환이 가능, 이 때 Object타입과 같은 이름을 가지지 않도록 이름을 따로 설정해줘야 함.
@Entity()
@ObjectType()
export class Category extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImg: string;

  @Field(() => [Restaurant], { nullable: true })
  @OneToMany(() => Restaurant, (restaurant) => restaurant.category)
  restaurants: Restaurant[];

  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  slug: string;
}
