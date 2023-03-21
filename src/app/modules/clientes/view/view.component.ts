
import { Component } from '@angular/core';
import Chart from 'chart.js/auto';
import { FiltroAdicionado } from 'src/app/shared/models/filtros/FiltroAdicionado';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent{

  public filtrosAdicionados: FiltroAdicionado[] = []

  filtrosExportados(dados) {
    this.filtrosAdicionados = dados;
  }

}