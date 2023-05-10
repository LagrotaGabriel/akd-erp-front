import { ClienteService } from '../../services/cliente.service';
import { CnpjResponse } from '../../../../shared/models/brasil-api/cnpj-response';
import { ConsultaCepResponse } from '../../../../shared/models/brasil-api/consulta-cep-response';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cliente } from '../models/cliente';
import { BrasilApiService } from '../../../../shared/services/brasil-api.service';
import { EstadosResponse } from '../../../../shared/models/brasil-api/estados-response';
import { MunicipiosResponse } from '../../../../shared/models/brasil-api/municipios-response';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-novo',
  templateUrl: './novo.component.html',
  styleUrls: ['./novo.component.scss'],
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
export class NovoComponent implements OnInit, OnDestroy {

  dataNascimentoAparente: boolean = false;

  // Subscriptions
  validaDuplicidadeCpfCnpjSubscription$: Subscription;
  obtemDadosClientePeloCnpjSubscription$: Subscription;
  validaDuplicidadeInscricaoEstadualSubscription$: Subscription;
  obtemTodosEstadosBrasileirosSubscription$: Subscription;
  getEnderecoPeloCepSubscription$: Subscription;
  obtemTodosMunicipiosPorEstadoSubscription$: Subscription;
  novoClienteSubscription$: Subscription;

  // Form groups
  protected dadosCliente: FormGroup = this.createFormDadosCliente();
  protected dadosTelefone: FormGroup = this.createFormDadosTelefone();
  protected dadosEndereco: FormGroup = this.createFormDadosEndereco();

  // Variáveis data de nascimento
  minDate: Date;
  maxDate: Date;

  // Validations cliente
  inputLengthCpfCnpj: number = 11;
  inputPatternCpfCnpj: any = /^\d{3}.?\d{3}.?\d{3}-?\d{2}/;

  // Validations telefone
  inputLengthPrefixo: number = 2;
  inputPrefixoPattern: any = /^\d{2}/;
  inputLengthTelefone: number;
  inputTelefonePattern: any;

  cliente: Cliente;

  // Variaveis endereço
  estadosResponse: EstadosResponse[];
  municipiosResponse: MunicipiosResponse[];

  @ViewChild('numeroEndereco') inputNumeroEndereco: ElementRef;
  @ViewChild('inputTipoTelefone') inputTipoTelefone: ElementRef;
  @ViewChild('codigoPostal') codigoPostal: ElementRef;
  @ViewChild('inputNome') inputNome: ElementRef;
  @ViewChild('inputDataNascimento') inputDataNascimento: ElementRef;

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(1920, 0, 1);
    this.maxDate = new Date(currentYear, 0, 1);

    //this.atualizaTipoPessoa();
    //this.atualizaValidatorsTelefone();
    //this.obtemTodosEstadosBrasileiros();

    setTimeout(() => {
      this.inputNome.nativeElement.focus();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.validaDuplicidadeCpfCnpjSubscription$ != undefined) this.validaDuplicidadeCpfCnpjSubscription$.unsubscribe();
    if (this.obtemDadosClientePeloCnpjSubscription$ != undefined) this.obtemDadosClientePeloCnpjSubscription$.unsubscribe();
    if (this.validaDuplicidadeInscricaoEstadualSubscription$ != undefined) this.validaDuplicidadeInscricaoEstadualSubscription$.unsubscribe();
    if (this.obtemTodosEstadosBrasileirosSubscription$ != undefined) this.obtemTodosEstadosBrasileirosSubscription$.unsubscribe();
    if (this.getEnderecoPeloCepSubscription$ != undefined) this.getEnderecoPeloCepSubscription$.unsubscribe();
    if (this.obtemTodosMunicipiosPorEstadoSubscription$ != undefined) this.obtemTodosMunicipiosPorEstadoSubscription$.unsubscribe();
    if (this.novoClienteSubscription$ != undefined) this.novoClienteSubscription$.unsubscribe();
  }

  createFormDadosCliente(): FormGroup {
    return this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      tipoPessoa: ['FISICA', Validators.required],
      cpfCnpj: ['', [Validators.pattern(this.inputPatternCpfCnpj), Validators.maxLength(this.inputLengthCpfCnpj), Validators.minLength(this.inputLengthCpfCnpj)]],
      inscricaoEstadual: ['', [Validators.pattern(/^\d{12}/), Validators.maxLength(12), Validators.minLength(12)]],
      email: ['', [Validators.email, Validators.maxLength(50)]],
      dataNascimento: [''],
      statusCliente: ['COMUM', Validators.required]
    });
  }

  createFormDadosTelefone(): FormGroup {
    return this.formBuilder.group({
      tipoTelefone: [''],
      prefixo: [null, [Validators.minLength(this.inputLengthPrefixo), Validators.maxLength(this.inputLengthPrefixo), Validators.pattern(this.inputPrefixoPattern)]],
      numero: [null],
    });
  }

  createFormDadosEndereco(): FormGroup {
    return this.formBuilder.group({
      logradouro: [''],
      numero: [null],
      bairro: ['', Validators.maxLength(50)],
      codigoPostal: ['', [Validators.maxLength(8), Validators.pattern(/^\d{5}\d{3}/)]],
      cidade: ['', Validators.maxLength(50)],
      complemento: ['', Validators.maxLength(80)],
      estado: ['', Validators.maxLength(50)]
    });
  }

  constructor(private formBuilder: FormBuilder,
    private brasilApiService: BrasilApiService,
    private clienteService: ClienteService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private datePipe: DatePipe) { }

  protected getValueAtributoDadosCliente(atributo: string): any {
    return this.dadosCliente.controls[atributo].value;
  }

  protected setValueParaAtributoDadosCliente(atributo: string, valor: any) {
    this.dadosCliente.controls[atributo] = valor;
  }

  protected getValueAtributoDadosTelefone(atributo: string): any {
    return this.dadosTelefone.controls[atributo].value;
  }

  protected setValueParaAtributoDadosTelefone(atributo: string, valor: any) {
    this.dadosTelefone.controls[atributo] = valor;
  }

  protected getValueAtributoDadosEndereco(atributo: string): any {
    return this.dadosEndereco.controls[atributo].value;
  }

  protected setValueParaAtributoDadosEndereco(atributo: string, valor: any) {
    this.dadosEndereco.controls[atributo] = valor;
  }

  retornaParaVisualizacaoDeClientes() {
    this.router.navigate(['/clientes'])
  }

  avancaPrimeiraEtapa() {
    setTimeout(() => {
      this.inputNome.nativeElement.focus();
    }, 400);
  }

  avancaSegundaEtapa() {
    setTimeout(() => {
      this.inputTipoTelefone.nativeElement.focus();
    }, 400);
  }

  avancaTerceiraEtapa() {
    setTimeout(() => {
      this.codigoPostal.nativeElement.focus();
    }, 400);
  }

  // EMAIL
  defineIconeInputEmail() {
    if (this.dadosCliente.controls['email'].touched && this.dadosCliente.controls['email'].invalid) {
      return 'error';
    }
    else {
      if (this.getValueAtributoDadosCliente('email') == '' || this.getValueAtributoDadosCliente('email') == null) return 'alternate_email';
      else return 'check';
    }
  }

  atualizaTipoPessoa() {

    if (this.getValueAtributoDadosCliente('tipoPessoa') == 'FISICA') {
      this.inputLengthCpfCnpj = 11;
      this.inputPatternCpfCnpj = /^\d{3}.?\d{3}.?\d{3}-?\d{2}/;
      this.dadosCliente.controls['inscricaoEstadual'].disable();
      this.dadosCliente.controls['dataNascimento'].enable();
    }
    else if (this.getValueAtributoDadosCliente('tipoPessoa') == 'JURIDICA') {
      this.inputLengthCpfCnpj = 14;
      this.inputPatternCpfCnpj = /^\d{2}\d{3}\d{3}\d{4}\d{2}/
      this.dataNascimentoAparente = false;
      this.dadosCliente.controls['inscricaoEstadual'].enable();
      this.dadosCliente.controls['dataNascimento'].disable();
    }
    this.dadosCliente.controls['cpfCnpj'].setValidators([Validators.maxLength(this.inputLengthCpfCnpj),
    Validators.minLength(this.inputLengthCpfCnpj), Validators.pattern(this.inputPatternCpfCnpj)]);

    this.setValueParaAtributoDadosCliente('dataNascimento', '')
    this.dadosCliente.controls['dataNascimento'].reset();

    this.setValueParaAtributoDadosCliente('inscricaoEstadual', '')
    this.dadosCliente.controls['inscricaoEstadual'].reset();

    this.setValueParaAtributoDadosCliente('cpfCnpj', '')
    this.dadosCliente.controls['cpfCnpj'].reset();
  }

  atualizaValidatorsTelefone() {
    this.setValueParaAtributoDadosTelefone('prefixo', '');
    this.dadosTelefone.controls['prefixo'].reset();

    this.setValueParaAtributoDadosTelefone('numero', '');
    this.dadosTelefone.controls['numero'].reset();

    this.dadosTelefone.controls['prefixo'].clearValidators();
    this.dadosTelefone.controls['numero'].clearValidators();

    if (this.getValueAtributoDadosTelefone('tipoTelefone') != '' && this.getValueAtributoDadosTelefone('tipoTelefone') != null) {

      this.dadosTelefone.controls['prefixo'].enable();
      this.dadosTelefone.controls['numero'].enable();

      if (this.getValueAtributoDadosTelefone('tipoTelefone') == 'FIXO') {
        this.inputLengthTelefone = 8;
        this.inputTelefonePattern = /^\d{4}\d{4}/;
      }

      else if (this.getValueAtributoDadosTelefone('tipoTelefone') == 'MOVEL' || this.getValueAtributoDadosTelefone('tipoTelefone') == 'MOVEL_WHATSAPP') {
        this.inputLengthTelefone = 9;
        this.inputTelefonePattern = /^\d\d{4}\d{4}/;
      }

      this.dadosTelefone.controls['prefixo'].addValidators(Validators.required);
      this.dadosTelefone.controls['prefixo'].addValidators([Validators.maxLength(this.inputLengthPrefixo), Validators.minLength(this.inputLengthPrefixo)]);
      this.dadosTelefone.controls['prefixo'].addValidators(Validators.pattern(this.inputPrefixoPattern));

      this.dadosTelefone.controls['numero'].addValidators(Validators.required);
      this.dadosTelefone.controls['numero'].addValidators([Validators.maxLength(this.inputLengthTelefone), Validators.minLength(this.inputLengthTelefone)]);
      this.dadosTelefone.controls['numero'].addValidators(Validators.pattern(this.inputTelefonePattern));
    }

    else {
      this.dadosTelefone.controls['prefixo'].disable();
      this.dadosTelefone.controls['numero'].disable();
    }

    this.dadosTelefone.controls['prefixo'].updateValueAndValidity();
    this.dadosTelefone.controls['numero'].updateValueAndValidity();
  }

  // DADOS
  realizaTratamentoCpfCnpj() {
    this.setValueParaAtributoDadosCliente('cpfCnpj', this.getValueAtributoDadosCliente('cpfCnpj')
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim());
    this.invocaValidacaoDuplicidadeCpfCnpj();
  }

  invocaValidacaoDuplicidadeCpfCnpj() {

    if (
      this.getValueAtributoDadosCliente('tipoPessoa') == 'JURIDICA'
      && this.getValueAtributoDadosCliente('cpfCnpj').length == 14
      && this.dadosCliente.controls['cpfCnpj'].valid ||
      this.getValueAtributoDadosCliente('tipoPessoa') == 'FISICA'
      && this.getValueAtributoDadosCliente('cpfCnpj').length == 11
      && this.dadosCliente.controls['cpfCnpj'].valid) {

      this.validaDuplicidadeCpfCnpjSubscription$ = this.clienteService.validaDuplicidadeCpfCnpj(this.getValueAtributoDadosCliente('cpfCnpj')).subscribe({
        error: error => {
          this.setValueParaAtributoDadosCliente('cpfCnpj', '');
          this.dadosCliente.controls['cpfCnpj'].reset();
          this._snackBar.open(error, "Fechar", {
            duration: 3500
          });
        },
        complete: () => {
          if (this.getValueAtributoDadosCliente('tipoPessoa') == 'JURIDICA') this.obtemDadosDoClientePeloCnpj();
          console.log('Validação de duplicidade de Cpf/Cnpj finalizada com sucesso')
        }
      });

    }

  }

  obtemDadosDoClientePeloCnpj() {
    this.obtemDadosClientePeloCnpjSubscription$ = this.brasilApiService.obtemDadosClientePeloCnpj(this.getValueAtributoDadosCliente('cpfCnpj')).subscribe({
      next: retornoApi => this.setaClienteComInformacoesObtidasPeloCnpj(retornoApi),
      error: error => {
        this._snackBar.open('Ocorreu um erro na obtenção das informações do CNPJ', "Fechar", {
          duration: 3500
        })
      },
      complete: () => {
        console.log('Informações do CNPJ digitado obtidas com sucesso');
        this._snackBar.open('Informações do CNPJ obtidas', "Fechar", {
          duration: 3500
        });
      }
    })
  }

  setaClienteComInformacoesObtidasPeloCnpj(cnpjResponse: CnpjResponse) {
    this.setaClienteComInformacoesPessoaisObtidasPeloCnpj(cnpjResponse);
    this.setaClienteComInformacoesDeTelefoneObtidasPeloCnpj(cnpjResponse);
    this.setaClienteComInformacoesDeEnderecoObtidasPeloCnpj(cnpjResponse);
  }

  private setaClienteComInformacoesPessoaisObtidasPeloCnpj(cnpjResponse: CnpjResponse) {
    if (cnpjResponse.nomeFantasia != null && cnpjResponse.nomeFantasia != '') {
      this.setValueParaAtributoDadosCliente('nome', cnpjResponse.nomeFantasia);
      this.dadosCliente.controls['nome'].markAsTouched();
    }

    if (cnpjResponse.email != null && cnpjResponse.email != '') {
      this.setValueParaAtributoDadosCliente('email', cnpjResponse.email);
      this.dadosCliente.controls['email'].markAsTouched();
    }
  }

  private setaClienteComInformacoesDeTelefoneObtidasPeloCnpj(cnpjResponse: CnpjResponse) {
    if (cnpjResponse.telefonePrincipal != null && cnpjResponse.telefonePrincipal != '') {
      if (cnpjResponse.telefonePrincipal.length == 10) {
        this.setValueParaAtributoDadosTelefone('tipoTelefone', 'FIXO');
      }
      else {
        this.setValueParaAtributoDadosTelefone('tipoTelefone', 'MOVEL');
      }
      this.atualizaValidatorsTelefone();
      this.dadosTelefone.controls['tipoTelefone'].markAsTouched();

      this.setValueParaAtributoDadosTelefone('prefixo', cnpjResponse.telefonePrincipal.slice(0, 2));
      this.setValueParaAtributoDadosTelefone('numero', cnpjResponse.telefonePrincipal.slice(2));

      this.dadosTelefone.controls['prefixo'].markAsTouched();
      this.dadosTelefone.controls['numero'].markAsTouched();
    }
  }

  private setaClienteComInformacoesDeEnderecoObtidasPeloCnpj(cnpjResponse: CnpjResponse) {
    if (cnpjResponse.logradouro != null && cnpjResponse.logradouro != '') {
      this.setValueParaAtributoDadosEndereco('logradouro', cnpjResponse.logradouro);
      this.dadosEndereco.controls['logradouro'].markAsTouched();
    }

    if (cnpjResponse.numero != null && cnpjResponse.numero != '') {
      this.setValueParaAtributoDadosEndereco('numero', parseInt(cnpjResponse.numero));
      this.dadosEndereco.controls['numero'].markAsTouched();
    }

    if (cnpjResponse.bairro != null && cnpjResponse.bairro != '') {
      this.setValueParaAtributoDadosEndereco('bairro', parseInt(cnpjResponse.bairro));
      this.dadosEndereco.controls['bairro'].markAsTouched();
    }

    if (cnpjResponse.municipio != null && cnpjResponse.municipio != '') {
      this.setValueParaAtributoDadosEndereco('cidade', cnpjResponse.municipio);
      this.dadosEndereco.controls['cidade'].markAsTouched();
    }

    if (cnpjResponse.cep != null) {
      this.setValueParaAtributoDadosEndereco('codigoPostal', (cnpjResponse.cep).toString());
      this.dadosEndereco.controls['codigoPostal'].markAsTouched();
    }

    if (cnpjResponse.uf != null && cnpjResponse.uf != '') {
      this.setValueParaAtributoDadosEndereco('estado', cnpjResponse.uf);
      this.dadosEndereco.controls['estado'].markAsTouched();
      this.obtemTodosMunicipiosPorEstado();
    }

    if (cnpjResponse.complemento != null && cnpjResponse.complemento != '') {
      this.setValueParaAtributoDadosEndereco('complemento', cnpjResponse.complemento);
      this.dadosEndereco.controls['complemento'].markAsTouched();
    }
  }

  realizaTratamentoInscricaoEstadual() {
    this.setValueParaAtributoDadosCliente('inscricaoEstadual', this.getValueAtributoDadosCliente('inscricaoEstadual')
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim());
    this.invocaValidacaoDuplicidadeInscricaoEstadual();
  }

  invocaValidacaoDuplicidadeInscricaoEstadual() {
    if (this.getValueAtributoDadosCliente('inscricaoEstadual').length == 11 && this.dadosCliente.controls['inscricaoEstadual'].valid) {
      this.validaDuplicidadeInscricaoEstadualSubscription$ =
        this.clienteService.validaDuplicidadeInscricaoEstadual(this.getValueAtributoDadosCliente('inscricaoEstadual')).subscribe({
          error: error => {
            this.setValueParaAtributoDadosCliente('inscricaoEstadual', '');
            this.dadosCliente.controls['inscricaoEstadual'].reset();
            this._snackBar.open(error, "Fechar", {
              duration: 3500
            });
          },
          complete: () => console.log('Validação de duplicidade de inscrição estadual completada com sucesso')
        })
    }
  }

  habilitaDataNascimento() {
    if (this.getValueAtributoDadosCliente('tipoPessoa') != 'JURIDICA') {
      this.inputDataNascimento.nativeElement.focus();
      this.dataNascimentoAparente = true;
    }
  }

  validaDataNascimento() {

    if (this.getValueAtributoDadosCliente('dataNascimento') == '') {
      this.dataNascimentoAparente = false;
      return;
    }

    let dataNascimentoSplitada = this.getValueAtributoDadosCliente('dataNascimento').split("-");
    if (dataNascimentoSplitada.length == 3) {
      if (parseInt(dataNascimentoSplitada[0]) > 2023 || parseInt(dataNascimentoSplitada[0]) < 1900) {
        this.setValueParaAtributoDadosCliente('dataNascimento', '');
        this.dataNascimentoAparente = false;
        this._snackBar.open("Data de nascimento inválida", "Fechar", {
          duration: 3500
        })
        return;
      }
    }
  }

  defineIconeDataNascimento() {
    if (this.dadosCliente.controls['dataNascimento'].touched && this.dadosCliente.controls['dataNascimento'].invalid) {
      return 'error';
    }
    else {
      if (this.getValueAtributoDadosCliente('dataNascimento') == '' || this.getValueAtributoDadosCliente('dataNascimento') == null) return 'calendar_month';
      else return 'check';
    }
  }

  // TELEFONE
  verificaSePrefixoTelefoneNuloOuVazio(): boolean {
    if (
      this.getValueAtributoDadosTelefone('prefixo') != null
      && this.getValueAtributoDadosTelefone('prefixo') != undefined
      && this.getValueAtributoDadosTelefone('prefixo') != '') {
      return true;
    }
    return false;
  }

  verificaSeTipoTelefoneNuloOuVazio(): boolean {
    if (
      this.getValueAtributoDadosTelefone('tipoTelefone') != null
      && this.getValueAtributoDadosTelefone('tipoTelefone') != undefined
      && this.getValueAtributoDadosTelefone('tipoTelefone') != '') {
      return true;
    }
    return false;
  }

  realizaTratamentoPrefixo() {
    this.setValueParaAtributoDadosTelefone('prefixo', this.getValueAtributoDadosTelefone('prefixo')
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim());
  }

  realizaTratamentoNumeroTelefone() {
    this.setValueParaAtributoDadosTelefone('numero', this.getValueAtributoDadosTelefone('numero')
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim());
  }

  defineIconeInputTelefone(): string {
    if (this.dadosTelefone.controls['numero'].touched && this.dadosTelefone.controls['numero'].invalid) {
      return 'error';
    }
    else {
      if (
        this.getValueAtributoDadosTelefone('numero') == '' && this.getValueAtributoDadosTelefone('tipoTelefone') == 'MOVEL_WHATSAPP'
        || this.getValueAtributoDadosTelefone('numero') == '' && this.getValueAtributoDadosTelefone('tipoTelefone') == 'MOVEL'
        || this.getValueAtributoDadosTelefone('numero') == null && this.getValueAtributoDadosTelefone('tipoTelefone') == 'MOVEL_WHATSAPP'
        || this.getValueAtributoDadosTelefone('numero') == null && this.getValueAtributoDadosTelefone('tipoTelefone') == 'MOVEL') return 'smartphone';

      else if (
        this.getValueAtributoDadosTelefone('numero') == '' && this.getValueAtributoDadosTelefone('tipoTelefone') == 'FIXO'
        || this.getValueAtributoDadosTelefone('numero') == null && this.getValueAtributoDadosTelefone('tipoTelefone') == 'FIXO') return 'call';

      else return 'check';
    }
  }

  // ENDEREÇO
  atualizaValidatorsEndereco() {
    if (this.getValueAtributoDadosEndereco('logradouro') != null && this.getValueAtributoDadosEndereco('logradouro') != '' ||
      this.getValueAtributoDadosEndereco('numero') != null && this.getValueAtributoDadosEndereco('numero').toString() != '' ||
      this.getValueAtributoDadosEndereco('bairro') != null && this.getValueAtributoDadosEndereco('bairro') != '' ||
      this.getValueAtributoDadosEndereco('cidade') != null && this.getValueAtributoDadosEndereco('cidade') != '' ||
      this.getValueAtributoDadosEndereco('estado') != null && this.getValueAtributoDadosEndereco('estado') != '' ||
      this.getValueAtributoDadosEndereco('codigoPostal') != null && this.getValueAtributoDadosEndereco('codigoPostal') != '' ||
      this.getValueAtributoDadosEndereco('complemento') != null && this.getValueAtributoDadosEndereco('complemento') != '') {
      this.setValueParaAtributoDadosEndereco('cidade', this.getValueAtributoDadosEndereco('cidade').normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      this.dadosEndereco.controls['logradouro'].addValidators([Validators.required, Validators.maxLength(50), Validators.minLength(1)]);
      this.dadosEndereco.controls['numero'].addValidators([Validators.required, Validators.max(99999), Validators.min(1), Validators.pattern(/^\d{1,5}$/)]);
    }
    else {
      this.dadosEndereco.controls['logradouro'].clearValidators();
      this.dadosEndereco.controls['numero'].clearValidators();
    }

    this.dadosEndereco.controls['logradouro'].updateValueAndValidity();
    this.dadosEndereco.controls['numero'].updateValueAndValidity();

  }

  obtemTodosEstadosBrasileiros() {
    this.obtemTodosEstadosBrasileirosSubscription$ =
      this.brasilApiService.getTodosEstados().subscribe({
        next: response => {
          response.sort((x, y) => x.sigla.localeCompare(y.sigla))
          this.estadosResponse = response;
        },
        error: error => {
          this.router.navigate(['/clientes'])
          this._snackBar.open(error, "Fechar", {
            duration: 3500
          });
        },
        complete: () => {
          console.log("Estados carregados com sucesso");
        }
      });
  }

  realizaTratamentoCodigoPostal() {

    this.atualizaValidatorsEndereco();

    this.setValueParaAtributoDadosEndereco('codigoPostal', this.getValueAtributoDadosEndereco('codigoPostal')
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim());

    if (this.dadosEndereco.controls['codigoPostal'].valid && this.getValueAtributoDadosEndereco('codigoPostal').length == 8) {
      this.getEnderecoPeloCepSubscription$ =
        this.brasilApiService.getEnderecoPeloCep(this.getValueAtributoDadosEndereco('codigoPostal')).subscribe({
          next: resposta => this.setaEnderecoComInformacoesObtidasPeloCep(resposta),
          error: error => {
            this._snackBar.open(error, "Fechar", {
              duration: 3500
            })
          },
          complete: () => console.log('Busca de endereço por cep realizada com sucesso')
        });
    }
  }

  setaEnderecoComInformacoesObtidasPeloCep(consultaCepResponse: ConsultaCepResponse) {
    this.setValueParaAtributoDadosEndereco('logradouro', consultaCepResponse.logradouro);
    this.setValueParaAtributoDadosEndereco('numero', null);
    this.setValueParaAtributoDadosEndereco('bairro', consultaCepResponse.bairro);
    this.setValueParaAtributoDadosEndereco('estado', consultaCepResponse.estado);
    this.setValueParaAtributoDadosEndereco('cidade', consultaCepResponse.cidade);
    this.setValueParaAtributoDadosEndereco('complemento', null);
    this.dadosEndereco.controls['codigoPostal'].markAsTouched();
    this.dadosEndereco.controls['logradouro'].markAsTouched();
    this.dadosEndereco.controls['bairro'].markAsTouched();
    this.dadosEndereco.controls['estado'].markAsTouched();
    this.dadosEndereco.controls['cidade'].markAsTouched();

    this.inputNumeroEndereco.nativeElement.focus();

    this.obtemTodosMunicipiosPorEstado();
  }

  public obtemTodosMunicipiosPorEstado() {
    this.atualizaValidatorsEndereco();
    if (this.getValueAtributoDadosEndereco('estado') != null && this.getValueAtributoDadosEndereco('estado') != '') {
      this.obtemTodosMunicipiosPorEstadoSubscription$ =
        this.brasilApiService.obtemTodosMunicipiosPorEstado(this.getValueAtributoDadosEndereco('estado')).subscribe({
          next: resposta => this.municipiosResponse = resposta,
          error: error => {
            this._snackBar.open(error, 'Fechar', {
              duration: 3500
            })
          },
          complete: () => console.log('Obtenção de municípios por estado realizada com sucesso')
        })
    }
    else {
      this.municipiosResponse = [];
    }
  }

  // SUBMIT

  public enviarFormulario() {
    if (this.getValueAtributoDadosCliente('dataNascimento') != null && this.getValueAtributoDadosCliente('dataNascimento') != '')
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
    }
  }

}
