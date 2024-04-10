import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-student-index-page',
  templateUrl: './edit-student-index-page.component.html',
  styleUrl: './edit-student-index-page.component.scss'
})
export class EditStudentIndexPageComponent {

  constructor(private _router: Router, private _activatedRoute: ActivatedRoute) { }

  onSelectInput(event): void {
    var value = event.target.value;
    this._router.navigate([value], { relativeTo: this._activatedRoute });
  }
}
