import { JwtService } from './jwt.service';
import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from '../common/common.constants';
import * as jwt from 'jsonwebtoken';
import { string } from 'joi';

const TEST_KEY = 'testKey';
const USER_ID = 1;
const TOKEN = 'TOKEN';
jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'TOKEN'),
    verify: jest.fn(() => ({ id: USER_ID })),
  };
});
describe('JwtService', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('sign', () => {
    it('should return a signed token', () => {
      const USER_ID = 1;
      const TOKEN = service.sign(USER_ID);
      expect(typeof TOKEN).toBe('string');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, TEST_KEY);
    });
  });
  describe('verify', () => {
    it('should return a decoded token', () => {
      const TOKEN = 'TOKEN';
      const decodedToken = service.verify(TOKEN);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_KEY);
      expect(decodedToken).toEqual({ id: USER_ID });
    });
  });
});
