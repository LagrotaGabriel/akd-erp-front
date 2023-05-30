import { Component } from '@angular/core';
import { Util } from 'src/app/modules/utils/Util';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { slideUpDownAnimation } from 'src/app/shared/animations';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss'],
})
export class DetalhesComponent {

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
