import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-go-back-text',
  templateUrl: './go-back-text.component.html',
  styleUrl: './go-back-text.component.scss'
})
export class GoBackTextComponent {
  @Input('link') link: string = '..';
}
