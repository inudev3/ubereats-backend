import { Module } from '@nestjs/common';
import { RestaurantsResolver } from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './entities/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])], //import repositroy
  providers: [RestaurantsResolver, RestaurantsService], //controller가 없는대신 provider로 resolver와 service 2가지
})
export class RestaurantsModule {}
