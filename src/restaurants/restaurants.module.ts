import { Module } from '@nestjs/common';
import { RestaurantsResolver } from './restaurants.resolver';

@Module({
  imports: [],
  providers: [RestaurantsResolver],
})
export class RestaurantsModule {}
