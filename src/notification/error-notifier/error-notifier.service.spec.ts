import { Test, TestingModule } from '@nestjs/testing';
import { ErrorNotifierService } from './error-notifier.service';

describe('ErrorNotifierService', () => {
  let service: ErrorNotifierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorNotifierService],
    }).compile();

    service = module.get<ErrorNotifierService>(ErrorNotifierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
