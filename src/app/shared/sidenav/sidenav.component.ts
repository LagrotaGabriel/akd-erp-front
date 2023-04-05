import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { SideNavDetails } from '../models/SideNavDetails';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  public screenWidth: any;

  public sideNavDetails: SideNavDetails = {
    sidebarDesktop: true,
    estadoSidebar: true,
    ofuscaConteudo: false,
    tipoSidebar: 'side'
  };

  alteraEstadoSidebar(event: boolean) {
    this.sideNavDetails.estadoSidebar = event;
  }

  fechaMenuClicandoNoBackground() {
    this.sideNavDetails.estadoSidebar=false;
  }

  ngOnInit(): void {
    this.adequaVariaveisDeAcordoComTamanhoDaTela(window.innerWidth);
  }

  adequaVariaveisDeAcordoComTamanhoDaTela(screenWidth: number): void {
    this.screenWidth = screenWidth;
    if (this.screenWidth <= 1070) this.setaSideBarParaMobile();
    else this.setaSideBarParaDesktop();
  }

  onResize(event: any): void {
    this.adequaVariaveisDeAcordoComTamanhoDaTela(event.target.innerWidth);
  }

  setaSideBarParaMobile(): void {
    this.sideNavDetails = {
      sidebarDesktop: false,
      estadoSidebar: false,
      ofuscaConteudo: true,
      tipoSidebar: 'over'
    }
  }

  limpaLocalStorage() {
    localStorage.removeItem('checkAll');
    localStorage.removeItem('metaDados');
    localStorage.removeItem('pageable');
    localStorage.removeItem('chips');
    localStorage.removeItem('filtros');
    localStorage.removeItem('tiposBuscaHabilitados');
    localStorage.removeItem('itensSelecionadosNaTabela');
  }

  setaSideBarParaDesktop(): void {
    this.sideNavDetails = {
      sidebarDesktop: true,
      estadoSidebar: true,
      ofuscaConteudo: false,
      tipoSidebar: 'side'
    }
  }
}
