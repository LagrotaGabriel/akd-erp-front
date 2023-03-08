import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirma-logout',
  templateUrl: './confirma-logout.component.html',
  styleUrls: ['./confirma-logout.component.scss'],
})
export class ConfirmaLogoutComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmaLogoutComponent>) {}
}
