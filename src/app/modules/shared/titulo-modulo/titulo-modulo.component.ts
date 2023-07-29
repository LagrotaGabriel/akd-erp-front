import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-titulo-modulo',
  templateUrl: './titulo-modulo.component.html',
  styleUrls: ['./titulo-modulo.component.scss']
})
export class TituloModuloComponent {
  @Input() texto: string = '';
}
