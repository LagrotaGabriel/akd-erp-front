import { Component } from '@angular/core';

@Component({
  selector: 'app-busca',
  templateUrl: './busca.component.html',
  styleUrls: ['./busca.component.scss']
})
export class BuscaComponent {
  focoInput: boolean = false;

  focusFunction() {
    this.focoInput = true;
  }

  removeFocusFunction(value: String) {
    if (value.length == 0) {
      this.focoInput = false;
    }
  }
}
