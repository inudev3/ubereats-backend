import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Category } from '../entities/category.entity';
import {
  PaginationInput,
  PaginationOutput,
} from '../../common/dtos/pagination.dto';

@InputType()
export class CategoryInput extends PaginationInput {
  @Field(() => String)
  slug;
}
@ObjectType()
export class CategoryOutput extends PaginationOutput {
  @Field(() => Category, { nullable: true })
  result?: Category;
}
