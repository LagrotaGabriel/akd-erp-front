import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ChangeDetectorRef } from '@angular/core';
import { ColaboradorService } from '../services/colaborador.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ColaboradorNovo } from '../models/ColaboradorNovo';
import { FormGroup } from '@angular/forms';
import { Util } from 'src/app/modules/utils/Util';

@Component({
  selector: 'app-atualizacao',
  templateUrl: './atualizacao.component.html',
  styleUrls: ['./atualizacao.component.scss']
})
export class AtualizacaoComponent {
  constructor(private colaboradorService: ColaboradorService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private ref: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute) { }

  protected dadosColaborador: FormGroup;
  protected dadosProfissionais: FormGroup;
  protected dadosAcesso: FormGroup;
  protected contratoContratacao: File;
  private criaNovoColaboradorSubscription$: Subscription;

  colaboradorPreAtualizacao: ColaboradorNovo;
  private colaborador: ColaboradorNovo;

  // Subscriptions
  atualizaColaboradorSubscription$: Subscription;
  obtemColaboradorPorIdSubscription$: Subscription;

  idColaborador: number;
  stepAtual: number = 0;

  ngOnInit(): void {
    this.realizaValidacaoDoIdColaborador();
    this.inicializarColaborador();
  }

  ngAfterViewInit(): void {
    this.ref.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.criaNovoColaboradorSubscription$ != undefined) this.criaNovoColaboradorSubscription$.unsubscribe();
  }

  mudaPasso(event) {
    this.stepAtual = event.selectedIndex;
  }

  realizaValidacaoDoIdColaborador() {
    let id = this.activatedRoute.snapshot.paramMap.get('id')
    if (/^\d+$/.test(id)) this.idColaborador = parseInt(id);
    else {
      this.router.navigate(['/clientes']);
      this._snackBar.open("O cliente que você tentou editar não existe", "Fechar", {
        duration: 3500
      });
    }
  }

  inicializarColaborador() {
    this.obtemColaboradorPorIdSubscription$ = this.colaboradorService.obtemColaboradorPorId(this.idColaborador).subscribe({
      next: (colaborador: ColaboradorNovo) => {
        this.colaboradorPreAtualizacao = colaborador;
      }
    })
  }

  // FUNÇÕES QUE RECEBEM EMISSÃO DE EVENTOS DOS COMPONENTES FILHOS

  protected recebeFormGroupDadosPessoais(event) {
    this.dadosColaborador = event;
  }

  protected recebeFormGroupDadosProfissionais(event) {
    this.dadosProfissionais = event;
  }

  protected recebeFormGroupDadosAcesso(event) {
    this.dadosAcesso = event;
  }

  protected recebeContratoContratacao(event) {
    console.log('Recebendo contrato...');
    this.contratoContratacao = event;
  }

  // GETTERS
  protected getValueAtributoDadosColaborador(atributo: string): any {
    return this.dadosColaborador.controls[atributo].value;
  }

  protected getValueAtributoDadosProfissionais(atributo: string): any {
    return this.dadosProfissionais.controls[atributo].value;
  }

  protected getValueAtributoDadosAcesso(atributo: string): any {
    return this.dadosAcesso.controls[atributo].value;
  }


  private construirObjetoColaborador() {

    this.colaborador = {
      nome: this.getValueAtributoDadosColaborador('nome') != '' ? this.getValueAtributoDadosColaborador('nome') : null,
      cpfCnpj: this.getValueAtributoDadosColaborador('cpfCnpj') != '' ? this.getValueAtributoDadosColaborador('cpfCnpj') : null,
      dataNascimento: this.getValueAtributoDadosColaborador('dataNascimento') != '' ? this.getValueAtributoDadosColaborador('dataNascimento') : null,
      email: this.getValueAtributoDadosColaborador('email') != '' ? this.getValueAtributoDadosColaborador('email') : null,
      telefone: this.getValueAtributoDadosColaborador('tipoTelefone') != ''
        ? {
          tipoTelefone: this.getValueAtributoDadosColaborador('tipoTelefone'),
          prefixo: this.getValueAtributoDadosColaborador('prefixo'),
          numero: this.getValueAtributoDadosColaborador('numeroTelefone')
        }
        : null,
      endereco: this.getValueAtributoDadosColaborador('logradouro') != null && this.getValueAtributoDadosColaborador('logradouro') != ''
        ? {
          id: null,
          codigoPostal: this.getValueAtributoDadosColaborador('codigoPostal') != '' ? this.getValueAtributoDadosColaborador('codigoPostal') : null,
          estado: this.getValueAtributoDadosColaborador('estado') != '' ? this.getValueAtributoDadosColaborador('estado') : null,
          cidade: this.getValueAtributoDadosColaborador('cidade') != '' ? this.getValueAtributoDadosColaborador('cidade') : null,
          logradouro: this.getValueAtributoDadosColaborador('logradouro') != '' ? this.getValueAtributoDadosColaborador('logradouro') : null,
          numero: this.getValueAtributoDadosColaborador('numero') != '' ? this.getValueAtributoDadosColaborador('numero') : null,
          bairro: this.getValueAtributoDadosColaborador('bairro') != '' ? this.getValueAtributoDadosColaborador('bairro') : null,
          complemento: this.getValueAtributoDadosColaborador('complemento') != '' ? this.getValueAtributoDadosColaborador('complemento') : null
        }
        : null,
      tipoOcupacaoEnum: this.getValueAtributoDadosProfissionais('tipoOcupacaoEnum'),
      ocupacao: this.getValueAtributoDadosProfissionais('ocupacao') != '' ? this.getValueAtributoDadosProfissionais('ocupacao') : null,
      statusColaboradorEnum: this.getValueAtributoDadosProfissionais('statusColaboradorEnum') != ''
        ? this.getValueAtributoDadosProfissionais('statusColaboradorEnum')
        : null,
      modeloContratacaoEnum: this.getValueAtributoDadosProfissionais('modeloContratacaoEnum'),
      modeloTrabalhoEnum: this.getValueAtributoDadosProfissionais('modeloTrabalhoEnum'),
      salario: this.getValueAtributoDadosProfissionais('salario') != '' ? this.getValueAtributoDadosProfissionais('salario') : null,
      entradaEmpresa: this.getValueAtributoDadosProfissionais('entradaEmpresa') != ''
        ? this.getValueAtributoDadosProfissionais('entradaEmpresa')
        : null,
      saidaEmpresa: this.getValueAtributoDadosProfissionais('saidaEmpresa') != ''
        ? this.getValueAtributoDadosProfissionais('saidaEmpresa')
        : null,
      expediente: this.getValueAtributoDadosProfissionais('horaEntrada') != '' && this.getValueAtributoDadosProfissionais('horaEntrada') != null ? {
        horaEntrada: this.getValueAtributoDadosProfissionais('horaEntrada'),
        horaSaidaAlmoco: this.getValueAtributoDadosProfissionais('horaSaidaAlmoco'),
        horaEntradaAlmoco: this.getValueAtributoDadosProfissionais('horaEntradaAlmoco'),
        horaSaida: this.getValueAtributoDadosProfissionais('horaSaida'),
        cargaHorariaSemanal: this.getValueAtributoDadosProfissionais('cargaHorariaSemanal'),
        escalaEnum: this.getValueAtributoDadosProfissionais('escalaEnum')
      } : null,
      acessoSistema: {
        acessoSistemaAtivo: this.getValueAtributoDadosAcesso('acessoSistemaAtivo'),
        senha: this.trataSenhaColaborador(),
        permissaoEnum: this.getValueAtributoDadosAcesso('acessoSistemaAtivo') ? this.getValueAtributoDadosAcesso('permissaoEnum') : 'LEITURA_BASICA',
        privilegios: this.getValueAtributoDadosAcesso('acessoSistemaAtivo') ? this.getValueAtributoDadosAcesso('privilegios') : null
      }
    }
  }

  private trataSenhaColaborador(): string {
    if (this.getValueAtributoDadosAcesso('acessoSistemaAtivo')) {
      if (Util.isEmptyString(this.getValueAtributoDadosAcesso('acessoSistemaAtivo'))) return null;
      else return this.getValueAtributoDadosAcesso('senha');
    }
    else return null;
  }

  protected enviarFormulario() {
    this.construirObjetoColaborador();
    let matricula: string = '';
    this.criaNovoColaboradorSubscription$ = this.colaboradorService.atualizaColaborador(this.idColaborador, this.colaborador, this.contratoContratacao).subscribe({
      next: (response: string) => {
        matricula = response;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
        this.router.navigate(['/colaboradores']);
        this._snackBar.open("Ocorreu um erro durante a atualização do colaborador. Entre em contato com o suporte", "Fechar", {
          duration: 5000
        });
      },
      complete: () => {
        this.router.navigate(['/colaboradores']);
        this._snackBar.open("Colaborador N°: " + matricula + " atualizado com sucesso", "Fechar", {
          duration: 7500
        });
      }
    });
  }
}
