import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-wheel',
  templateUrl: './loading-wheel.component.html',
  styleUrls: ['./loading-wheel.component.css'],
})
export class LoadingWheelComponent {
  @Input('stroke-color') strokeColor: string = '#ffffff';
}
