import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BigLoadingFilterService {
  bigLoadingFilterSubject: Subject<boolean> = new Subject<boolean>();
  status: boolean = false;

  constructor() { }

  openFilter(): void {
    this.status = true;
    this.bigLoadingFilterSubject.next(true);
  }

  closeFilter(): void {
    this.status = false;
    this.bigLoadingFilterSubject.next(false);
  }

  getStatus(): boolean {
    return this.status;
  }
}
