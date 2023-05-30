import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Util } from 'src/app/modules/utils/Util';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.scss']
})
export class HistoricoComponent {

  abaSelecionada: FormControl = new FormControl(0);
  emiteMudancaDeAba: number = 0;

  mudaAbaSelecionadaSubscription$: Subscription = this.abaSelecionada.valueChanges.subscribe({
    next: () => {
      this.emiteMudancaDeAba = this.abaSelecionada.value;
    }
  })

  ngOnDestroy(): void {
    if (Util.isNotObjectEmpty(this.mudaAbaSelecionadaSubscription$)) this.mudaAbaSelecionadaSubscription$.unsubscribe();
  }

}
