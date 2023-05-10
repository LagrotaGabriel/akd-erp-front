import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-error',
  templateUrl: './custom-error.component.html',
  styleUrls: ['./custom-error.component.scss']
})
export class CustomErrorComponent {

  @Input() mensagemErro: string;

}
