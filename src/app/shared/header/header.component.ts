import { SideNavDetails } from './../models/SideNavDetails';
import { ConfirmaLogoutComponent } from './confirma-logout/confirma-logout.component';

import { MatDialog } from '@angular/material/dialog';
import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent{

  @Output() public enviaAlteracaoEstadoSidebar = new EventEmitter();
  @Input() public sideNavDetails: SideNavDetails;

  public botaoMenuLateralResponsivo: boolean;

  alteraExibicaoSideBar() {
    if (this.sideNavDetails.estadoSidebar) {
      this.sideNavDetails.estadoSidebar = false;
    } else {
      this.sideNavDetails.estadoSidebar = true;
    }
    this.enviaAlteracaoEstadoSidebar.emit(this.sideNavDetails.estadoSidebar);
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

}
