import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PopupsService {
  controlPopupsSubject: Subject<PopupConfig> = new Subject<PopupConfig>();
  resultPopupsSubject: Subject<PopupResult> = new Subject<PopupResult>();
  constructor() { }

  openPopup(popupConfig: PopupConfig): Promise<PopupResult> {
    this.controlPopupsSubject.next(popupConfig);
    return new Promise<PopupResult>((res, rej) => {
      var subscription: Subscription = this.resultPopupsSubject.subscribe({
        next: (popupResult: PopupResult) => {
          res(popupResult);
          subscription.unsubscribe();
        },
      });
    });
  }

  closePopup(): void {
    var popupResult: PopupResult = {
      result: 'closed',
    };
    this.sendPopupResult(popupResult);
    this.controlPopupsSubject.next(undefined);
  }

  sendPopupResult(popupResult: PopupResult): void {
    this.resultPopupsSubject.next(popupResult);
  }
}

export type PopupType =
  | 'confirmation'
  | 'alert'
  | 'alert-confirmation'
  | 'ok'
  | 'info'
  | 'warning' | 'text-input';

export interface PopupConfig {
  type: PopupType;
  text?: string;
  data?: any;
}

export interface PopupResult {
  result: string;
  data?: any;
}
