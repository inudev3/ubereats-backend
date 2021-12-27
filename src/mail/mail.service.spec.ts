import { MailService } from './mail.service';
import got from 'got';
import * as FormData from 'form-data';
import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from '../common/common.constants';

jest.mock('got');
jest.mock('form-data'); //module자체를 mock하면 그냥 바로 mock 함수가 됨. got같이 메소드가 따로 없는 경우, 혹은 formdata처럼 생성자가 필요한 경우 다 mock함수로 바뀜
const TEST_APIKEY = 'test_apiKey';
const TEST_DOMAIN = 'test_domain';
const TEST_FROMEMAIL = 'test_fromEmail';
describe('MailService', () => {
  let service: MailService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test_apiKey',
            domain: 'test_domain',
            fromEmail: 'test_fromEmail',
          },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'code',
        to: 'whomever',
      };
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true); //we don't mock here because we are going to test sendEmail later
      service.sendVerificationEmail(
        //mock은 음식모형 같은 거고 spyOn은 실제 음식을 맛보는 것
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
        sendVerificationEmailArgs.to,
      );
      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify your Email',
        'verify-email',
        `${sendVerificationEmailArgs.to}`,
        {
          code: sendVerificationEmailArgs.code,
          username: sendVerificationEmailArgs.email,
        },
      );
    });
  });
  describe('sendEmail', () => {
    it('sends Email', async () => {
      const ok = await service.sendEmail('', '', '', {
        code: '',
        username: '',
      });
      const formSpy = jest.spyOn(FormData.prototype, 'append'); //spyOn을 하기 위해선 메소드가 있어야 한다.
      expect(formSpy).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );
      expect(ok).toBe(true);
    });
    it('fails on Error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const ok = await service.sendEmail('', '', '', {});
      expect(ok).toBe(false);
    });
  });
});
