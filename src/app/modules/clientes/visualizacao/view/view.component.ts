
import { Component } from '@angular/core';
import { FiltroAdicionado } from 'src/app/shared/models/filtros/FiltroAdicionado';
import { Cliente } from '../../models/Cliente';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent{

  public filtrosAdicionados: FiltroAdicionado[] = []
  public clientesSelecionados: Cliente[] = [];

  filtrosExportados(dados) {
    this.filtrosAdicionados = dados;
  }

  clientesSelecionadosExportados(dados) {
    this.clientesSelecionados = dados;
  }

}