import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PopupConfig, PopupsService } from './custom-services/popup/popups.service';
import { BigLoadingFilterService } from './custom-services/big-loading-filter/big-loading-filter.service';
import { FullscreenComponentService, FullscreenComponentSubjectPayload } from './custom-services/fullscreen-component/fullscreen-component.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';
  bigLoadingFilterState: boolean = false;
  popupConfigObj: PopupConfig;
  popupsSubscription: Subscription;
  bigLoadingFilterSubscription: Subscription;
  fullscreenComponentSubscription: Subscription;
  fullscreenComponentConfigObj: FullscreenComponentSubjectPayload;

  constructor(private _popupsService: PopupsService, private _bigLoadingFilterService: BigLoadingFilterService, private _fullscreenComponentService: FullscreenComponentService) { }

  ngOnInit(): void {
    this.bigLoadingFilterSubscription = this._bigLoadingFilterService.bigLoadingFilterSubject.subscribe({
      next: (state: boolean) => {
        this.bigLoadingFilterState = state;
      }
    })
    this.popupsSubscription = this._popupsService.controlPopupsSubject.subscribe({
      next: (popupConfig: PopupConfig) => {
        this.popupConfigObj = popupConfig;
      },
    });
    this.fullscreenComponentSubscription = this._fullscreenComponentService.fullscreenComponentSubject.subscribe({
      next: (next: FullscreenComponentSubjectPayload) => {
        this.fullscreenComponentConfigObj = next;
      },
    });
  }

  ngOnDestroy(): void {
    this.popupsSubscription.unsubscribe();
    this.bigLoadingFilterSubscription.unsubscribe();
    this.fullscreenComponentSubscription.unsubscribe();
  }
}
