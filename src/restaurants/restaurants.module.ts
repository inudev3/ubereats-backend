import { Module } from '@nestjs/common';
import { CategoryResolver, RestaurantsResolver } from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './entities/restaurant.entity';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])], //import repositroy
  providers: [RestaurantsResolver, CategoryResolver, RestaurantsService], //controller가 없는대신 provider로 resolver와 service 2가지
})
export class RestaurantsModule {}
