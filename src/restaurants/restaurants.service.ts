import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/createRestaurant.dto';
import { User } from '../users/entities/user.entity';
import { Category } from './entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/editRestaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/deleteRestaurant.dto';
import { AllCategoriesOutput } from './dtos/all-Categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantOutput, RestaurantsInput } from './dtos/restaurants.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant) //decorator that makes repository from entity
    private readonly restaurants: Repository<Restaurant>,

    private readonly categories: CategoryRepository, //custome repository 타입
  ) {} //inject repository

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const { restaurantId } = editRestaurantInput;
      await this.checkOwner(owner.id, editRestaurantInput.restaurantId);
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        //배열을 넣어주면 entity를 업데이트 한다.
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not edit the restaurant',
      };
    }
  }
  async checkOwner(ownerId: number, restaurantId: number) {
    try {
      const restaurant = await this.restaurants.findOne({ id: restaurantId });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (ownerId !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'You are not authorized for this transaction',
        };
      }
    } catch (e) {
      return {
        ok: false,
        error: 'Transaction failed.',
      };
    }
  }
  async deleteRestaurant(
    owner: User,
    deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      await this.checkOwner(owner.id, deleteRestaurantInput.restaurantId);
      await this.restaurants.delete({ id: deleteRestaurantInput.restaurantId });
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Failed to delete the restaurant',
      };
    }
  }
  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find(); //find everything
      return {
        ok: true,
        categories,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }
  async countRestaurants(category: Category): Promise<number> {
    return this.restaurants.count({ category });
  }
  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug }); //relations으로 부르게 되면 DB 연산이 너무 커짐
      if (!category) {
        return {
          ok: false,
          error: 'Could not find category',
        };
      }
      const restaurants = await this.restaurants.find({
        where: { category },
        take: 25,
        skip: (page - 1) * 25,
      });
      category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category);
      return {
        ok: true,
        result: category,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not find the category',
      };
    }
  }
  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        take: 25,
        skip: (page - 1) * 25,
      });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch (error) {}
  }
}
