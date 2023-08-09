import { Subscription } from 'rxjs';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ColaboradorService } from '../services/colaborador.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ColaboradorRequest } from '../models/request/colaborador/ColaboradorRequest';
import { ColaboradorResponse } from '../models/response/colaborador/ColaboradorResponse';
import { Util } from 'src/app/modules/utils/Util';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewComponent {

  constructor(private colaboradorService: ColaboradorService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private ref: ChangeDetectorRef,
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute) { }

  private colaborador: ColaboradorRequest;
  protected colaboradorPreAtualizacao: ColaboradorResponse;

  protected dadosColaborador: FormGroup;
  protected dadosProfissionais: FormGroup;
  protected dadosAcesso: FormGroup;
  protected contratoContratacao: File;

  private criaNovoColaboradorSubscription$: Subscription;
  private obtemColaboradorPorIdSubscription$: Subscription;
  private atualizaColaboradorSubscription$: Subscription;

  stepAtual: number = 0;

  titulo: string = 'Cadastrar novo colaborador';
  idColaborador: number = null;

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      if (params.has('id')) {
        this.titulo = 'Editar colaborador';
        let id = params.get('id');
        if (/^\d+$/.test(id)) {
          this.idColaborador = parseInt(id);
          this.inicializaColaborador(parseInt(id));
        }
        else {
          this.router.navigate(['/colaboradores']);
          this._snackBar.open("O colaborador que você tentou editar não existe", "Fechar", {
            duration: 3500
          });
        }
      }
    });

  }

  ngAfterViewInit(): void {
    this.ref.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.criaNovoColaboradorSubscription$ != undefined) this.criaNovoColaboradorSubscription$.unsubscribe();
    if (this.obtemColaboradorPorIdSubscription$ != undefined) this.obtemColaboradorPorIdSubscription$.unsubscribe();
    if (this.atualizaColaboradorSubscription$ != undefined) this.atualizaColaboradorSubscription$.unsubscribe();
  }

  mudaPasso(event) {
    this.stepAtual = event.selectedIndex;
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

  inicializaColaborador(id: number) {
    this.obtemColaboradorPorIdSubscription$ = this.colaboradorService.obtemColaboradorPorId(id).subscribe({
      next: (colaborador: ColaboradorResponse) => {
        this.colaboradorPreAtualizacao = colaborador;
      },
      complete: () => {
        this.colaborador = {
          id: id,
          nome: this.colaboradorPreAtualizacao.nome,
          cpfCnpj: this.colaboradorPreAtualizacao.cpfCnpj,
          dataNascimento: this.colaboradorPreAtualizacao.dataNascimento,
          email: this.colaboradorPreAtualizacao.email,
          telefone: this.colaboradorPreAtualizacao.telefone != null
            ? {
              tipoTelefone: this.colaboradorPreAtualizacao.telefone.tipoTelefone,
              prefixo: this.colaboradorPreAtualizacao.telefone.prefixo,
              numero: this.colaboradorPreAtualizacao.telefone.numero,
            }
            : null,
          endereco: this.colaboradorPreAtualizacao.endereco != null
            ? {
              logradouro: this.colaboradorPreAtualizacao.endereco.logradouro,
              numero: this.colaboradorPreAtualizacao.endereco.numero,
              bairro: this.colaboradorPreAtualizacao.endereco.bairro,
              codigoPostal: this.colaboradorPreAtualizacao.endereco.codigoPostal,
              cidade: this.colaboradorPreAtualizacao.endereco.cidade,
              complemento: this.colaboradorPreAtualizacao.endereco.complemento,
              estado: this.colaboradorPreAtualizacao.endereco.estado,
            }
            : null,
          tipoOcupacaoEnum: this.colaboradorPreAtualizacao.tipoOcupacaoEnum,
          ocupacao: this.colaboradorPreAtualizacao.ocupacao,
          statusColaboradorEnum: this.colaboradorPreAtualizacao.statusColaboradorEnum,
          modeloContratacaoEnum: this.colaboradorPreAtualizacao.modeloContratacaoEnum,
          modeloTrabalhoEnum: this.colaboradorPreAtualizacao.modeloTrabalhoEnum,
          salario: this.colaboradorPreAtualizacao.salario,
          entradaEmpresa: this.colaboradorPreAtualizacao.entradaEmpresa,
          saidaEmpresa: this.colaboradorPreAtualizacao.saidaEmpresa,
          contratoContratacao: this.colaboradorPreAtualizacao.contratoContratacao,
          expediente: this.colaboradorPreAtualizacao.expediente,
          acessoSistema: this.colaboradorPreAtualizacao.acessoSistema
        }

        console.log(this.colaborador);
      }
    })
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
        senha: this.getValueAtributoDadosAcesso('acessoSistemaAtivo') ? this.getValueAtributoDadosAcesso('senha') : null,
        permissaoEnum: this.getValueAtributoDadosAcesso('acessoSistemaAtivo') ? this.getValueAtributoDadosAcesso('permissaoEnum') : null,
        privilegios: this.getValueAtributoDadosAcesso('acessoSistemaAtivo') ? this.getValueAtributoDadosAcesso('privilegios') : null
      }
    }
  }

  public direcionaEnvioDeFormulario() {
    this.construirObjetoColaborador();
    if (Util.isNotEmptyString(this.getValueAtributoDadosColaborador('dataNascimento')))
      this.colaborador.dataNascimento = this.datePipe.transform(this.getValueAtributoDadosColaborador('dataNascimento'), "yyyy-MM-dd");

    if (this.dadosColaborador.valid && this.dadosAcesso.valid && this.dadosProfissionais.valid) {
      if (Util.isEmptyNumber(this.idColaborador)) this.enviaFormularioCriacao();
      else this.enviaFormularioAtualizacao();
    }
  }

  private enviaFormularioCriacao() {
    console.log(this.colaborador);
    this.criaNovoColaboradorSubscription$ =
      this.colaboradorService.novoColaborador(this.colaborador, this.contratoContratacao).subscribe({
        error: error => {
          this._snackBar.open("Ocorreu um erro ao cadastrar o colaborador", "Fechar", {
            duration: 3500
          })
        },
        complete: () => {
          this.router.navigate(['/colaboradores']);
          this._snackBar.open("Colaborador cadastrado com sucesso", "Fechar", {
            duration: 3500
          });
        }
      });
  }

  private enviaFormularioAtualizacao() {
    this.atualizaColaboradorSubscription$ =
      this.colaboradorService.atualizaColaborador(this.idColaborador, this.colaborador, this.contratoContratacao).subscribe({
        error: error => {
          this._snackBar.open("Ocorreu um erro ao atualizar o colaborador", "Fechar", {
            duration: 3500
          })
        },
        complete: () => {
          this.router.navigate(['/colaboradores']);
          this._snackBar.open("Colaborador atualizado com sucesso", "Fechar", {
            duration: 3500
          });
        }
      });
  }
}
