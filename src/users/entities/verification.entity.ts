import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  @OneToOne((type) => User, { onDelete: 'CASCADE' })
  @JoinColumn() //JoinColumn은 항상 정보를 access하는 entity에서만 설정(둘 중 하나)
  //verification에서 user를 접근할 것이기 때문에 여기에 설정
  user: User;

  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4().replace('-', '');
  }
}
