import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  
  public estadoSidebar: boolean = true;

  alteraEstadoSidebar(event: boolean) {
    this.estadoSidebar = event;
  }
}
