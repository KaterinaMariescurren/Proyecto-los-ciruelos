import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { postregisterGuard } from './postregister.guard';

describe('postregisterGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => postregisterGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
