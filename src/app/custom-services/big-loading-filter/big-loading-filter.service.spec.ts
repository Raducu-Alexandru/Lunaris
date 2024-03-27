import { TestBed } from '@angular/core/testing';

import { BigLoadingFilterService } from './big-loading-filter.service';

describe('BigLoadingFilterService', () => {
  let service: BigLoadingFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BigLoadingFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
