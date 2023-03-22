
import { Component, DoCheck } from '@angular/core';
import { FiltroAdicionado } from 'src/app/shared/models/filtros/FiltroAdicionado';
import { Cliente } from '../models/Cliente';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements DoCheck{

  public filtrosAdicionados: FiltroAdicionado[] = []
  public clientesSelecionados: Cliente[] = [];

  ngDoCheck(): void {
    console.log(this.clientesSelecionados);
  }

  filtrosExportados(dados) {
    this.filtrosAdicionados = dados;
  }

  clientesSelecionadosExportados(dados) {
    this.clientesSelecionados = dados;
  }

}