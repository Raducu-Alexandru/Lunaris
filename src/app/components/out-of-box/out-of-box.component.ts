import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-out-of-box',
  templateUrl: './out-of-box.component.html',
  styleUrl: './out-of-box.component.scss'
})
export class OutOfBoxComponent {
  @Input('main-value') mainValue: any = '';
  @Input('out-of-value') outOfValue: any = '';
  @Input('title') title: string = '';
  @Input('text') text: string = '';
}
