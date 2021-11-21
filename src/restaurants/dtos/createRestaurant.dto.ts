import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

@ArgsType()
export class createRestaurantDto {
  @Field(() => String)
  @Length(5, 10)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  address: string;

  @Field(() => String)
  @IsString()
  owner: string;

  @Field(() => Boolean)
  @IsBoolean()
  isGood: string;
}
