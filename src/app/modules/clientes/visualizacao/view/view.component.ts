
import { Component } from '@angular/core';
import { FiltroAdicionado } from 'src/app/shared/models/filtros/FiltroAdicionado';
import { Cliente } from '../models/Cliente';
import { PageObject } from 'src/app/shared/models/PageObject';
import { ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent{

  constructor( private cdref: ChangeDetectorRef ) {}   

  public clientesSelecionados: Cliente[] = [];
  public clientesLocalizadosNoTypeAhead: PageObject;

  ngAfterContentChecked() {
    this.clientesSelecionados = this.clientesSelecionados;
    this.clientesLocalizadosNoTypeAhead = this.clientesLocalizadosNoTypeAhead;
    this.cdref.detectChanges();
 }

 clientesLocalizadosNoTypeAheadExportados(dados) {
  this.clientesLocalizadosNoTypeAhead = dados;
 }

  clientesSelecionadosExportados(dados) {
    this.clientesSelecionados = dados;
  }

}