import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';

import { User } from '../src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  createAccountQuery,
  editProfileQuery,
  LoginQuery,
  MeQuery,
  seeProfileQuery,
  VerifyEmailQuery,
} from '../src/queries';
import { Verification } from '../src/users/entities/verification.entity';
const GRAPHQL_ENDPOINT = '/graphql';

jest.mock('got', () => {
  //이메일 veirification code 확인 작업을 건너뛰기 위해 got만 mocking
  return {
    post: jest.fn(),
  };
});
const testUser = {
  EMAIL: 'inust33@naver.com',
  PASSWORD: '12345',
};

describe('UsersModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let usersRepository: Repository<User>;
  let verificationRepository: Repository<Verification>;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set('x-jwt', jwtToken).send({ query });
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    usersRepository = module.get(getRepositoryToken(User)); // 데이터베이스 연결없이 repository 의존성을 주입하는 메소드. 즉 repository를 mock하는 것
    verificationRepository = module.get(getRepositoryToken(Verification));
    await app.init();
  });
  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });
  describe('createAccount', () => {
    it('should create Account', async () => {
      return publicTest(createAccountQuery(testUser.EMAIL, testUser.PASSWORD))
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });
    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: createAccountQuery(testUser.EMAIL, testUser.PASSWORD),
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toEqual(
            'There is an user with that email already',
          );
        });
    });
  });

  describe('login', () => {
    it('should get a token with correct credentials', () => {
      return publicTest(LoginQuery(testUser.EMAIL, testUser.PASSWORD))
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token;
        });
    });
    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: LoginQuery(testUser.EMAIL, '666'),
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('Wrong password.');
          expect(login.token).toBe(null);
        });
    });
  });
  describe('seeProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find(); //데이터베이스에 항상 유저 한 명만 만들어지므로 그 유저를 사용하기 위해 만든다.
      userId = user.id;
    });
    it("should see a user's profile", () => {
      return privateTest(seeProfileQuery(userId))
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                seeProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toEqual(userId);
        });
    });
    it('should not be able to find a profile', () => {
      return privateTest(seeProfileQuery('666'))
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                seeProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toEqual(expect.any(String));
          expect(user).toEqual(null);
        });
    });
  });

  describe('Me', () => {
    it('should find my profile', () => {
      return privateTest(MeQuery())
        .expect(200)
        .expect((res) => {
          console.log(res);
          const {
            body: {
              data: {
                Me: { email },
              },
            },
          } = res;
          expect(email).toBe(testUser.EMAIL);
        });
    });
    it('should not allow logged out users', () => {
      return publicTest(MeQuery())
        .expect(200)
        .expect((res) => {
          const {
            body: {
              errors: [{ message }],
            },
          } = res;
          expect(message).toBe('Forbidden resource');
        });
    });
  });
  describe('editProfile', () => {
    const NEW_EMAIL = 'inust33@naver.com';
    it('should change email', () => {
      return privateTest(editProfileQuery(NEW_EMAIL))
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should have new email', () => {
      return privateTest(MeQuery())
        .expect(200)
        .expect((res) => {
          console.log(res);
          const {
            body: {
              data: {
                Me: { email },
              },
            },
          } = res;
          expect(email).toBe(NEW_EMAIL);
        });
    });
  });
  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationRepository.find(); //find multiple vals in an array.데이터베이스에 생기는 첫번째
      verificationCode = verification.code;
    });
    it('should verify email', () => {
      return publicTest(VerifyEmailQuery(verificationCode))
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail on wrong verification code', () => {
      return publicTest(VerifyEmailQuery('566'))
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Verification not found.');
        });
    });
  });
});
