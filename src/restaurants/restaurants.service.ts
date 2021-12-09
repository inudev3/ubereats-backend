import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createRestaurantDto } from './dtos/createRestaurant.dto';
import { updateRestaurantDto } from './dtos/updateRestaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant) //decorator that makes repository from entity
    private readonly restaurants: Repository<Restaurant>,
  ) {} //inject repository
  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }
  createRestaurant(
    createRestaurantDto: createRestaurantDto,
  ): Promise<Restaurant> {
    const newRestaurant = this.restaurants.create(createRestaurantDto); // same with doing new Restaurant();
    return this.restaurants.save(newRestaurant);
  }
  updateRestaurant({ id, data }: updateRestaurantDto) {
    return this.restaurants.update(id, { ...data }); //should make a partial entity
  }
}
