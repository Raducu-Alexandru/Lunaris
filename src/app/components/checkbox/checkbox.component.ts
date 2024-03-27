import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css'],
})
export class CheckboxComponent {
  @Input('is-checked') isChecked: boolean = false;
  @Input('read-only') readOnly: boolean = false;
  @Output('custom-input') customInput: EventEmitter<boolean> = new EventEmitter();

  onCheckboxClick(): void {
    if (this.readOnly) {
      return;
    }
    this.isChecked = !this.isChecked;
    this.customInput.emit(this.isChecked);
  }
}
