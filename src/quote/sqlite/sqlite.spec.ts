import { Test, TestingModule } from '@nestjs/testing';
import { Sqlite } from './sqlite';

describe('Sqlite', () => {
  let provider: Sqlite;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Sqlite],
    }).compile();

    provider = module.get<Sqlite>(Sqlite);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
