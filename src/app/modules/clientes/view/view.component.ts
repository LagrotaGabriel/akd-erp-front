import { ClienteService } from './../services/cliente.service';
import { AfterViewInit, Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements AfterViewInit {

  clientes: any;
  focoInput: boolean = false;

  constructor(private clienteService: ClienteService) {}

  ngAfterViewInit(): void {
    this.clienteService.getClientes().subscribe(
      (res: any[]) => {
        this.clientes = res;
      },
      (error: any) => console.log(error)
    );
  }

  focusFunction() {
    this.focoInput = true;
  }

  removeFocusFunction(value: String) {
    if (value.length == 0) {
      this.focoInput = false;
    }
  }
}
