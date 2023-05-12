import { ClienteService } from '../../services/cliente.service';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Cliente } from '../../models/cliente';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { Telefone } from '../../models/telefone';
import { Endereco } from '../../models/endereco';
import { Util } from 'src/app/modules/utils/Util';

@Component({
  selector: 'app-atualizacao',
  templateUrl: './atualizacao.component.html',
  styleUrls: ['./atualizacao.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(300, style({ opacity: 0 }))
      ])
    ]),
  ]
})
export class AtualizacaoComponent implements OnInit, OnDestroy {

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private ref: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute) { }

  idCliente: number;

  stepAtual: number = 0;
  telefoneBuscadoCnpj: Telefone;
  enderecoBuscadoCnpj: Endereco;

  // Subscriptions
  atualizaClienteSubscription$: Subscription;
  obtemClientePorIdSubscription$: Subscription;

  // Form groups
  dadosCliente: FormGroup;
  dadosTelefone: FormGroup;
  dadosEndereco: FormGroup;

  clientePreAtualizacao: Cliente;
  cliente: Cliente;

  ngOnInit(): void {
    this.realizaValidacaoDoIdCliente();
    this.inicializarCliente();
  }

  ngAfterViewInit(): void {
    const startTime = performance.now();
    this.ref.detectChanges();
    const duration = performance.now() - startTime;
    console.log(`ngAfterViewInit levou ${duration}ms`);
  }

  ngOnDestroy(): void {
    if (this.atualizaClienteSubscription$ != undefined) this.atualizaClienteSubscription$.unsubscribe();
    if (this.obtemClientePorIdSubscription$ != undefined) this.obtemClientePorIdSubscription$.unsubscribe();
  }

  mudaPasso(event) {
    this.stepAtual = event.selectedIndex;
  }

  protected getValueAtributoDadosCliente(atributo: string): any {
    return this.dadosCliente.controls[atributo].value;
  }

  protected getValueAtributoDadosTelefone(atributo: string): any {
    return this.dadosTelefone.controls[atributo].value;
  }

  protected getValueAtributoDadosEndereco(atributo: string): any {
    return this.dadosEndereco.controls[atributo].value;
  }

  realizaValidacaoDoIdCliente() {
    let id = this.activatedRoute.snapshot.paramMap.get('id')
    if (/^\d+$/.test(id)) this.idCliente = parseInt(id);
    else {
      this.router.navigate(['/clientes']);
      this._snackBar.open("O cliente que você tentou editar não existe", "Fechar", {
        duration: 3500
      });
    }
  }

  inicializarCliente() {
    this.obtemClientePorIdSubscription$ = this.clienteService.obtemClientePorId(this.idCliente).subscribe({
      next: (cliente: Cliente) => {
        this.clientePreAtualizacao = cliente;
      }
    })
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

  protected recebeTelefoneEncontradoNoCnpj(telefone: Telefone) {
    console.log('Recebendo telefone encontrado pelo CNPJ');
    this.telefoneBuscadoCnpj = telefone;
  }

  protected recebeEnderecoEncontradoNoCnpj(endereco: Endereco) {
    console.log('Recebendo endereço encontrado pelo CNPJ');
    this.enderecoBuscadoCnpj = endereco;
  }

  private constroiObjetoCliente() {

    console.log('Realizando envio de formulário');
    console.log(this.dadosCliente);
    console.log(this.dadosTelefone);
    console.log(this.dadosEndereco);

    this.cliente = {
      nome: this.getValueAtributoDadosCliente('nome'),
      tipoPessoa: this.getValueAtributoDadosCliente('tipoPessoa'),
      cpfCnpj: Util.isNotEmptyString(this.getValueAtributoDadosCliente('cpfCnpj')) ? this.getValueAtributoDadosCliente('cpfCnpj') : null,
      inscricaoEstadual: Util.isNotEmptyString(this.getValueAtributoDadosCliente('inscricaoEstadual')) ? this.getValueAtributoDadosCliente('inscricaoEstadual') : null,
      email: Util.isNotEmptyString(this.getValueAtributoDadosCliente('email')) ? this.getValueAtributoDadosCliente('email') : null,
      dataNascimento: Util.isNotEmptyString(this.getValueAtributoDadosCliente('dataNascimento')) ? this.getValueAtributoDadosCliente('dataNascimento') : null,
      statusCliente: this.getValueAtributoDadosCliente('statusCliente'),
      telefone: Util.isNotEmptyString(this.getValueAtributoDadosTelefone('tipoTelefone'))
        ? {
          tipoTelefone: this.getValueAtributoDadosTelefone('tipoTelefone'),
          prefixo: this.getValueAtributoDadosTelefone('prefixo'),
          numero: this.getValueAtributoDadosTelefone('numero')
        }
        : null,
      endereco: Util.isNotEmptyString(this.getValueAtributoDadosEndereco('logradouro'))
        ? {
          codigoPostal: Util.isNotEmptyString(this.getValueAtributoDadosEndereco('codigoPostal')) ? this.getValueAtributoDadosEndereco('codigoPostal') : null,
          estado: Util.isNotEmptyString(this.getValueAtributoDadosEndereco('estado')) ? this.getValueAtributoDadosEndereco('estado') : null,
          cidade: Util.isNotEmptyString(this.getValueAtributoDadosEndereco('cidade')) ? this.getValueAtributoDadosEndereco('cidade') : null,
          logradouro: Util.isNotEmptyString(this.getValueAtributoDadosEndereco('logradouro')) ? this.getValueAtributoDadosEndereco('logradouro') : null,
          numero: Util.isNotEmptyString(this.getValueAtributoDadosEndereco('numero')) ? this.getValueAtributoDadosEndereco('numero') : null,
          bairro: Util.isNotEmptyString(this.getValueAtributoDadosEndereco('bairro')) ? this.getValueAtributoDadosEndereco('bairro') : null,
          complemento: Util.isNotEmptyString(this.getValueAtributoDadosEndereco('complemento')) ? this.getValueAtributoDadosEndereco('complemento') : null
        }
        : null,
    }
  }

  // SUBMIT
  public enviarFormulario() {
    this.constroiObjetoCliente();
    if (Util.isNotEmptyString(this.getValueAtributoDadosCliente('dataNascimento')))
      this.cliente.dataNascimento = this.datePipe.transform(this.getValueAtributoDadosCliente('dataNascimento'), "yyyy-MM-dd");

    if (this.dadosCliente.valid && this.dadosTelefone.valid && this.dadosEndereco.valid) {
      this.atualizaClienteSubscription$ =
        this.clienteService.atualizaCliente(this.idCliente, this.cliente).subscribe({
          error: error => {
            this._snackBar.open("Ocorreu um erro ao atualizar o cliente", "Fechar", {
              duration: 3500
            })
          },
          complete: () => {
            this.router.navigate(['/clientes']);
            this._snackBar.open("Cliente atualizado com sucesso", "Fechar", {
              duration: 3500
            });
          }
        });
    }
  }

}
