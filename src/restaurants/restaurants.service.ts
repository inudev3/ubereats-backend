import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Raw, Repository } from 'typeorm';
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
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/searchRestaurant.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/createDish.dto';
import { Dish } from './entities/dish.entity';
import { EditDishInput, EditDishOutput } from './dtos/editDish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/deleteDish.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    //decorator that makes repository from entity
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
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
      const { restaurant, ok, error } = await this.checkOwner(
        owner.id,
        editRestaurantInput.restaurantId,
      );
      if (error) {
        return { ok, error };
      }
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
      return {
        ok: true,
        restaurant,
      };
    } catch (e) {
      throw new Error('check failed');
    }
  }
  async deleteRestaurant(
    owner: User,
    deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const { restaurant, ok, error } = await this.checkOwner(
        owner.id,
        deleteRestaurantInput.restaurantId,
      );
      if (error) {
        return { ok, error };
      }
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
  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
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
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load restaurants ',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu'],
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant Not Found',
        };
      }
      return {
        ok: true,
        result: restaurant,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }
  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: { name: Raw((name) => `${name} ILIKE '%${query}%'`) }, //sql notation for search
        skip: (page - 1) * 25,
        take: 25,
      });
      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 5),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not find restaurant for the keyword',
      };
    }
  }
  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const { restaurant, ok, error } = await this.checkOwner(
        owner.id,
        createDishInput.restaurantId,
      );
      if (error) {
        return {
          ok,
          error,
        };
      }
      const dish = await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create dish',
      };
    }
  }
  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const { dish, ok, error } = await this.checkDishOwner(
        owner.id,
        editDishInput.dishId,
      );
      if (error) {
        return { ok, error };
      }
      await this.dishes.save([{ id: editDishInput.dishId, ...editDishInput }]);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not update dish' };
    }
  }
  async checkDishOwner(ownerId: number, dishId: number) {
    try {
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return { ok: false, error: 'Dish not found' };
      }
      if (ownerId !== dish.restaurant.ownerId) {
        return { ok: false, error: 'You are not authorized' };
      }
      return { ok: true, dish };
    } catch {
      throw new Error();
    }
  }
  async deleteDish(
    owner: User,
    deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const { dish, ok, error } = await this.checkDishOwner(
        owner.id,
        deleteDishInput.dishId,
      );
      if (error) {
        return { ok, error };
      }
      await this.dishes.delete(deleteDishInput.dishId);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could  delete dish' };
    }
  }
}
