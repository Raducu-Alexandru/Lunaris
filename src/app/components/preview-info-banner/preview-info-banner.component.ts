import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-preview-info-banner',
  templateUrl: './preview-info-banner.component.html',
  styleUrl: './preview-info-banner.component.scss'
})
export class PreviewInfoBannerComponent {
  @Input('big-text') bigText: string = '';
  @Input('small-text') smallText: string = '';
  @Input('click-link') clickLink: string = '';
  @Input('no-click') isNoClick: boolean = false;
  @Input('show-delete') showDelete: boolean = false;
  @Output('delete') delete: EventEmitter<void> = new EventEmitter<void>();

  constructor(private _router: Router, private _activatedRoute: ActivatedRoute) { }

  onWrapperClick(): void {
    if (this.isNoClick) {
      return;
    }
    this._router.navigate([this.clickLink], { relativeTo: this._activatedRoute });
  }

  onDeleteClick(): void {
    console.log('delete clicked');
    this.delete.emit();
  }
}
