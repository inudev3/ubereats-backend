import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';

import { RestaurantsService } from './restaurants.service';
import { createRestaurantDto } from './dtos/createRestaurant.dto';
import { updateRestaurantDto } from './dtos/updateRestaurant.dto';

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}
  @Query(() => Boolean)
  isGood() {
    return true;
  }
  @Query(() => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }
  @Mutation(() => Boolean)
  async createRestaurant(
    @Args() createRestaurantDto: createRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  @Mutation(() => Boolean)
  async updateRestaurant(
    @Args() updateRestaurantDto: updateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.updateRestaurant(updateRestaurantDto);
      return true;
    } catch (e) {
      return false;
    }
  }
}
