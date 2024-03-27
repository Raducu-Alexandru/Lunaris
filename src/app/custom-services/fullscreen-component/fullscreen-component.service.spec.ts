import { TestBed } from '@angular/core/testing';

import { FullscreenComponentService } from './fullscreen-component.service';

describe('FullscreenComponentService', () => {
  let service: FullscreenComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FullscreenComponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
