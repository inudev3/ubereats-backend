import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from './jwt.service';
import { UserService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable() //makes the class as a provicer
export class JwtMiddleWare implements NestMiddleware {
  //used class to make dependency injection of userService
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly Users: Repository<User>,
    private readonly usersService: UserService, //jwtModule is used in Appmodule, so it can import userService that UserModule exported to Appmodule
  ) {}
  //it doesn't matter if it doesnt implements NextMiddleware and it can be just a function
  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        const decoded = this.jwtService.verify(token.toString());
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          const user = await this.Users.findOneOrFail({ id: decoded['id'] });
          req['user'] = user;
        }
      } catch (error) {
        console.log(error);
      }
    }
    next();
  }
}
