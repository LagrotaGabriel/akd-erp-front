import { ConfirmaLogoutComponent } from './confirma-logout/confirma-logout.component';

import { MatDialog } from '@angular/material/dialog';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Output() public enviaAlteracaoEstadoSidebar = new EventEmitter();
  public estadoSideBar: boolean = true;

  exibeSideBar() {
    if (this.estadoSideBar) {
      this.estadoSideBar = false;
    } else {
      this.estadoSideBar = true;
    }
    this.enviaAlteracaoEstadoSidebar.emit(this.estadoSideBar);
  }

  confirmaLogout(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(ConfirmaLogoutComponent, {
      width: '30rem',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  constructor(public dialog: MatDialog) {}
  ngOnInit(): void {
    this.exibeSideBar();
  }
}
