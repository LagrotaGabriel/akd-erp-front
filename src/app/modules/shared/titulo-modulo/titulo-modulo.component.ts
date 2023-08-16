import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Util } from '../../utils/Util';

@Component({
  selector: 'app-titulo-modulo',
  templateUrl: './titulo-modulo.component.html',
  styleUrls: ['./titulo-modulo.component.scss']
})
export class TituloModuloComponent {

  constructor(private activatedRoute: ActivatedRoute, private cdRef: ChangeDetectorRef) { }

  @Input() texto: string = '';

  filtroMesAtual: string = '';

  ngAfterViewInit(): void {
    this.realizaValidacaoFiltroBuscaPorMes();
    this.cdRef.detectChanges();
  }

  realizaValidacaoFiltroBuscaPorMes() {
    let params = this.activatedRoute.snapshot.queryParamMap;

    if (params.has('date')) {
      let date = params.get('date');
      if (/\d{4}\-\d{2}/.test(date)) {
        if (parseInt(date.split('-')[0]) < 1900
          || parseInt(date.split('-')[0]) > 2100
          || parseInt(date.split('-')[1]) < 1
          || parseInt(date.split('-')[1]) > 12) {
          this.filtroMesAtual = Util.obtemMesAnoPorExtenso(Util.getMesAnoAtual());
          return false;
        }
        else {
          this.filtroMesAtual = Util.obtemMesAnoPorExtenso(date);
          return true;
        }
      }
      else {
        this.filtroMesAtual = Util.obtemMesAnoPorExtenso(Util.getMesAnoAtual());
        return false;
      }
    }
    else {
      this.filtroMesAtual = Util.obtemMesAnoPorExtenso(Util.getMesAnoAtual());
      return false;
    }
  }
}
