import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';

import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsEnum, Length } from 'class-validator';
import { CoreEntity } from "src/common/entities/core.entity";

enum UserRole {
  Client,
  Owner,
  Delivery,
}
registerEnumType(UserRole, { name: 'UserRole' }); //graphql ENUM type register
@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(() => String)
  @Length(5)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(() => Boolean)
  verified: boolean;

  @BeforeInsert() //password가 db에 반영되기 전에 작동
  @BeforeUpdate() //update할 때도 작동
  async hashPassword(): Promise<void> {
    if (this.password) {
      //to prevent from hashing without password change
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (error) {
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(aPassword, this.password);
    } catch (e) {
      throw new InternalServerErrorException('');
    }
  }
}
