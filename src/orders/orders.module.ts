import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';
import { OrderResolver } from './orders.resolver';
import { OrderItem } from './entities/orderItem.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Dish } from '../restaurants/entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Restaurant, Dish])],
  providers: [OrderService, OrderResolver],
})
export class OrdersModule {}
