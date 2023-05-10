import { ClienteService } from '../../services/cliente.service';
import { CnpjResponse } from '../../../../shared/models/brasil-api/cnpj-response';
import { ConsultaCepResponse } from '../../../../shared/models/brasil-api/consulta-cep-response';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Cliente } from '../models/cliente';
import { BrasilApiService } from '../../../../shared/services/brasil-api.service';
import { EstadosResponse } from '../../../../shared/models/brasil-api/estados-response';
import { MunicipiosResponse } from '../../../../shared/models/brasil-api/municipios-response';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { SelectOption } from 'src/app/modules/shared/inputs/models/select-option';

@Component({
  selector: 'app-novo',
  templateUrl: './novo.component.html',
  styleUrls: ['./novo.component.scss'],
})
export class NovoComponent implements OnDestroy {

  constructor(private formBuilder: FormBuilder,
    private brasilApiService: BrasilApiService,
    private clienteService: ClienteService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private ref: ChangeDetectorRef) { }

  // Subscriptions
  novoClienteSubscription$: Subscription;

  // Form groups
  protected dadosCliente: FormGroup;
  protected dadosTelefone: FormGroup;
  protected dadosEndereco: FormGroup;

  cliente: Cliente;

  stepAtual: number = 0;

  ngAfterViewInit(): void {
    const startTime = performance.now();
    this.ref.detectChanges();
    const duration = performance.now() - startTime;
    console.log(`ngAfterViewInit levou ${duration}ms`);
  }

  ngOnDestroy(): void {
    if (this.novoClienteSubscription$ != undefined) this.novoClienteSubscription$.unsubscribe();
  }

  mudaPasso(event) {
    this.stepAtual = event.selectedIndex;
  }

  // FUNÇÕES QUE RECEBEM EMISSÃO DE EVENTOS DOS COMPONENTES FILHOS

  protected recebeFormGroupDadosPessoais(event) {
    console.log('Recebendo dados pessoais')
    this.dadosCliente = event;
  }

  protected recebeFormGroupDadosTelefone(event) {
    console.log('Recebendo dados de telefone')
    this.dadosTelefone = event;
  }

  protected recebeFormGroupDadosEndereco(event) {
    console.log('Recebendo dados de endereço')
    this.dadosEndereco = event;
  }

  // SUBMIT
  public enviarFormulario() {
    //TODO LÓGICA DE ENVIO DE FORMULÁRIO
    /*     if (this.getValueAtributoDadosCliente('dataNascimento') != null && this.getValueAtributoDadosCliente('dataNascimento') != '')
          this.setValueParaAtributoDadosCliente('dataNascimento', this.datePipe.transform(this.getValueAtributoDadosCliente('dataNascimento'), "yyyy-MM-dd"));
    
        if (this.dadosCliente.valid && this.dadosTelefone.valid && this.dadosEndereco.valid) {
          //TODO ESTRUTURAR LÓGICA DE CRIAÇÃO DE OBJETO DO TIPO CLIENTE
          this.novoClienteSubscription$ =
            this.clienteService.novoCliente(this.cliente).subscribe({
              error: error => {
                this._snackBar.open("Ocorreu um erro ao cadastrar o cliente", "Fechar", {
                  duration: 3500
                })
              },
              complete: () => {
                this.router.navigate(['/clientes']);
                this._snackBar.open("Cliente cadastrado com sucesso", "Fechar", {
                  duration: 3500
                });
              }
            });
        } */
  }

}
