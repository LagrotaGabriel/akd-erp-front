import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrasilApiService } from 'src/app/shared/services/brasil-api.service';
import { ColaboradorService } from '../../services/colaborador.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { Colaborador } from '../../visualizacao/models/Colaborador';
import { ColaboradorNovo } from '../models/ColaboradorNovo';
import { ConsultaCepResponse } from 'src/app/shared/models/brasil-api/consulta-cep-response';
import { EstadosResponse } from 'src/app/shared/models/brasil-api/estados-response';
import { MunicipiosResponse } from 'src/app/shared/models/brasil-api/municipios-response';

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
export class NovoComponent {

  constructor(private formBuilder: FormBuilder,
    private brasilApiService: BrasilApiService,
    private colaboradorService: ColaboradorService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private ref: ChangeDetectorRef) { }

  dataNascimentoAparente: boolean = false;
  dataEntradaAparente: boolean = false;
  dataSaidaAparente: boolean = false;

  // Subscriptions
  validaDuplicidadeCpfCnpjSubscription$: Subscription;
  obtemTodosEstadosBrasileirosSubscription$: Subscription;
  getEnderecoPeloCepSubscription$: Subscription;
  obtemTodosMunicipiosPorEstadoSubscription$: Subscription;

  // Form groups
  dadosColaborador: FormGroup;
  dadosProfissionais: FormGroup;
  dadosAcesso: FormGroup;

  colaborador: ColaboradorNovo;

  // Variáveis data
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

  // Variaveis endereço
  estadosResponse: EstadosResponse[];
  municipiosResponse: MunicipiosResponse[];

  // Variaveis acesso
  modulosLiberados: string[] = ['HOME', 'VENDAS', 'PDV', 'ESTOQUE', 'PRECOS'];
  privilegioAtual: string = 'CLIENTES';

  @ViewChild('numeroEndereco') inputNumeroEndereco: ElementRef;
  @ViewChild('contratoContratacaoInput') contratoContratacaoInput: ElementRef;
  @ViewChild('selectSetor') selectSetor: ElementRef;
  @ViewChild('inputNome') inputNome: ElementRef;
  @ViewChild('inputDataNascimento') inputDataNascimento: ElementRef;
  @ViewChild('inputDataEntrada') inputDataEntrada: ElementRef;
  @ViewChild('inputDataSaida') inputDataSaida: ElementRef;
  @ViewChild('selectAcessoSistemaAtivo') selectAcessoSistemaAtivo: ElementRef;

  ngAfterViewInit(): void {
    this.ref.detectChanges();
  }

  ngOnInit(): void {
    this.inicializarColaborador();
    this.createForm();
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(1920, 0, 1);
    this.maxDate = new Date(currentYear, 0, 1);

    // this.atualizaTipoPessoa();
    this.atualizaValidatorsTelefone();
    this.obtemTodosEstadosBrasileiros();

    setTimeout(() => {
      this.inputNome.nativeElement.focus();
    }, 100);

    this.modulosLiberados = this.colaborador.acessoSistema.privilegios;
  }

  inicializarColaborador() {
    this.colaborador = {
      nome: '',
      cpfCnpj: '',
      email: '',
      dataNascimento: '',
      telefone: {
        tipoTelefone: '',
        prefixo: null,
        numero: null
      },
      endereco: {
        id: null,
        logradouro: '',
        numero: null,
        bairro: '',
        codigoPostal: '',
        cidade: '',
        complemento: '',
        estado: ''
      },
      tipoOcupacaoEnum: 'TECNICO',
      ocupacao: '',
      statusColaboradorEnum: 'ATIVO',
      modeloContratacaoEnum: 'CLT',
      modeloTrabalhoEnum: 'PRESENCIAL',
      contratoContratacao: null,
      salario: 0.0,
      entradaEmpresa: '',
      saidaEmpresa: '',
      expediente: {
        horaEntrada: '',
        horaSaida: '',
        horaSaidaAlmoco: '',
        horaEntradaAlmoco: '',
        cargaHorariaSemanal: 0,
        escalaEnum: 'INDEFINIDA'
      },
      acessoSistema: {
        acessoSistemaAtivo: true,
        senha: '',
        permissaoEnum: 'LEITURA_BASICA',
        privilegios: ['HOME', 'VENDAS', 'PDV', 'ESTOQUE', 'PRECOS']
      }
    }
  }

  createForm() {
    this.dadosColaborador = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      cpfCnpj: ['', [Validators.pattern(this.inputPatternCpfCnpj), Validators.maxLength(this.inputLengthCpfCnpj), Validators.minLength(this.inputLengthCpfCnpj)]],
      email: ['', [Validators.email, Validators.maxLength(50)]],
      dataNascimento: [''],
      tipoTelefone: [''],
      prefixo: ['', [Validators.minLength(this.inputLengthPrefixo), Validators.maxLength(this.inputLengthPrefixo), Validators.pattern(this.inputPrefixoPattern)]],
      numeroTelefone: [''],
      logradouro: [''],
      numero: [''],
      bairro: ['', Validators.maxLength(50)],
      codigoPostal: ['', [Validators.maxLength(8), Validators.pattern(/^\d{5}\d{3}/)]],
      cidade: ['', Validators.maxLength(50)],
      complemento: ['', Validators.maxLength(80)],
      estado: ['', Validators.maxLength(50)]
    });
    this.dadosProfissionais = this.formBuilder.group({
      tipoOcupacaoEnum: [''],
      ocupacao: ['', Validators.maxLength(30)],
      statusColaboradorEnum: [''],
      modeloContratacaoEnum: [''],
      modeloTrabalhoEnum: [''],
      contratoContratacao: [null],
      salario: [0.0, [Validators.max(9999999.00), Validators.min(0.00)]],
      entradaEmpresa: [''],
      saidaEmpresa: [''],
      horaEntrada: [''],
      horaSaida: [''],
      horaSaidaAlmoco: [''],
      horaEntradaAlmoco: [''],
      escalaEnum: ['INDEFINIDA'],
      cargaHorariaSemanal: [0],
    });
    this.dadosAcesso = this.formBuilder.group({
      acessoSistemaAtivo: [true],
      senha: [''],
      permissaoEnum: ['LEITURA_BASICA'],
      privilegios: [['HOME', 'VENDAS', 'PDV', 'ESTOQUE', 'PRECOS']]
    });

    this.dadosProfissionais.get('saidaEmpresa').disable();

  }

  // CPFCNPJ
  defineIconeInputCpfCnpj() {
    if (this.dadosColaborador.controls['cpfCnpj'].touched && this.dadosColaborador.controls['cpfCnpj'].invalid) {
      return 'error';
    }
    else {
      if (this.colaborador.cpfCnpj == '' || this.colaborador.cpfCnpj == null) return 'badge';
      else return 'check';
    }
  }

  // EMAIL
  defineIconeInputEmail() {
    if (this.dadosColaborador.controls['email'].touched && this.dadosColaborador.controls['email'].invalid) {
      return 'error';
    }
    else {
      if (this.colaborador.email == '' || this.colaborador.email == null) return 'alternate_email';
      else return 'check';
    }
  }

  // TELEFONE

  atualizaValidatorsTelefone() {
    this.colaborador.telefone.prefixo = '';
    this.dadosColaborador.controls['prefixo'].reset();

    this.colaborador.telefone.numero = '';
    this.dadosColaborador.controls['numeroTelefone'].reset();

    this.dadosColaborador.controls['prefixo'].clearValidators();
    this.dadosColaborador.controls['numeroTelefone'].clearValidators();

    if (this.colaborador.telefone.tipoTelefone != '' && this.colaborador.telefone.tipoTelefone != null) {

      this.dadosColaborador.controls['prefixo'].enable();
      this.dadosColaborador.controls['numeroTelefone'].enable();

      if (this.colaborador.telefone.tipoTelefone == 'FIXO') {
        this.inputLengthTelefone = 8;
        this.inputTelefonePattern = /^\d{4}\d{4}/;
      }

      else if (this.colaborador.telefone.tipoTelefone == 'MOVEL' || this.colaborador.telefone.tipoTelefone == 'MOVEL_WHATSAPP') {
        this.inputLengthTelefone = 9;
        this.inputTelefonePattern = /^\d\d{4}\d{4}/;
      }

      this.dadosColaborador.controls['prefixo'].addValidators(Validators.required);
      this.dadosColaborador.controls['prefixo'].addValidators([Validators.maxLength(this.inputLengthPrefixo), Validators.minLength(this.inputLengthPrefixo)]);
      this.dadosColaborador.controls['prefixo'].addValidators(Validators.pattern(this.inputPrefixoPattern));

      this.dadosColaborador.controls['numeroTelefone'].addValidators(Validators.required);
      this.dadosColaborador.controls['numeroTelefone'].addValidators([Validators.maxLength(this.inputLengthTelefone), Validators.minLength(this.inputLengthTelefone)]);
      this.dadosColaborador.controls['numeroTelefone'].addValidators(Validators.pattern(this.inputTelefonePattern));
    }

    else {
      this.dadosColaborador.controls['prefixo'].disable();
      this.dadosColaborador.controls['numeroTelefone'].disable();
    }

    this.dadosColaborador.controls['prefixo'].updateValueAndValidity();
    this.dadosColaborador.controls['numeroTelefone'].updateValueAndValidity();
  }

  verificaSeTipoTelefoneNuloOuVazio(): boolean {
    if (this.colaborador.telefone != null) {
      if (this.colaborador.telefone.tipoTelefone != null && this.colaborador.telefone.tipoTelefone != undefined && this.colaborador.telefone.tipoTelefone != '') {
        return true;
      }
    }
    return false;
  }

  realizaTratamentoPrefixo() {
    this.colaborador.telefone.prefixo = this.colaborador.telefone.prefixo
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim();
  }

  realizaTratamentoNumeroTelefone() {
    this.colaborador.telefone.numero = this.colaborador.telefone.numero
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim();
  }

  defineIconeInputTelefone(): string {
    if (this.dadosColaborador.controls['numeroTelefone'].touched && this.dadosColaborador.controls['numeroTelefone'].invalid) {
      return 'error';
    }
    else {
      if (
        this.colaborador.telefone.numero == '' && this.colaborador.telefone.tipoTelefone == 'MOVEL_WHATSAPP'
        || this.colaborador.telefone.numero == '' && this.colaborador.telefone.tipoTelefone == 'MOVEL'
        || this.colaborador.telefone.numero == null && this.colaborador.telefone.tipoTelefone == 'MOVEL_WHATSAPP'
        || this.colaborador.telefone.numero == null && this.colaborador.telefone.tipoTelefone == 'MOVEL') return 'smartphone';

      else if (
        this.colaborador.telefone.numero == '' && this.colaborador.telefone.tipoTelefone == 'FIXO'
        || this.colaborador.telefone.numero == null && this.colaborador.telefone.tipoTelefone == 'FIXO') return 'call';

      else return 'check';
    }
  }

  // DATA NASCIMENTO

  validaDataNascimento() {

    if (this.colaborador.dataNascimento == '') {
      this.dataNascimentoAparente = false;
      return;
    }

    let dataNascimentoSplitada = this.colaborador.dataNascimento.split("-");
    if (dataNascimentoSplitada.length == 3) {
      if (parseInt(dataNascimentoSplitada[0]) > 2023 || parseInt(dataNascimentoSplitada[0]) < 1900) {
        this.colaborador.dataNascimento = '';
        this.dataNascimentoAparente = false;
        this._snackBar.open("Data de nascimento inválida", "Fechar", {
          duration: 3500
        })
        return;
      }
    }
  }

  habilitaDataNascimento() {
    this.inputDataNascimento.nativeElement.focus();
    this.dataNascimentoAparente = true;
  }

  defineIconeDataNascimento() {
    if (this.dadosColaborador.controls['dataNascimento'].touched && this.dadosColaborador.controls['dataNascimento'].invalid) {
      return 'error';
    }
    else {
      if (this.colaborador.dataNascimento == '' || this.colaborador.dataNascimento == null) return 'calendar_month';
      else return 'check';
    }
  }

  // ENDEREÇO
  realizaTratamentoCodigoPostal() {

    this.atualizaValidatorsEndereco();

    this.colaborador.endereco.codigoPostal = this.colaborador.endereco.codigoPostal
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim();

    if (this.dadosColaborador.controls['codigoPostal'].valid && this.colaborador.endereco.codigoPostal.length == 8) {
      this.getEnderecoPeloCepSubscription$ =
        this.brasilApiService.getEnderecoPeloCep(this.colaborador.endereco.codigoPostal).subscribe({
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

  atualizaValidatorsEndereco() {
    if (this.colaborador.endereco.logradouro != null && this.colaborador.endereco.logradouro != '' ||
      this.colaborador.endereco.numero != null && this.colaborador.endereco.numero.toString() != '' ||
      this.colaborador.endereco.bairro != null && this.colaborador.endereco.bairro != '' ||
      this.colaborador.endereco.cidade != null && this.colaborador.endereco.cidade != '' ||
      this.colaborador.endereco.estado != null && this.colaborador.endereco.estado != '' ||
      this.colaborador.endereco.codigoPostal != null && this.colaborador.endereco.codigoPostal != '' ||
      this.colaborador.endereco.complemento != null && this.colaborador.endereco.complemento != '') {
      this.colaborador.endereco.cidade = this.colaborador.endereco.cidade.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      this.dadosColaborador.controls['logradouro'].addValidators([Validators.required, Validators.maxLength(50), Validators.minLength(1)]);
      this.dadosColaborador.controls['numero'].addValidators([Validators.required, Validators.max(99999), Validators.min(1), Validators.pattern(/^\d{1,5}$/)]);
    }
    else {
      this.dadosColaborador.controls['logradouro'].clearValidators();
      this.dadosColaborador.controls['numero'].clearValidators();
    }

    this.dadosColaborador.controls['logradouro'].updateValueAndValidity();
    this.dadosColaborador.controls['numero'].updateValueAndValidity();

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

  setaEnderecoComInformacoesObtidasPeloCep(consultaCepResponse: ConsultaCepResponse) {
    this.colaborador.endereco.logradouro = consultaCepResponse.logradouro;
    this.colaborador.endereco.numero = null;
    this.colaborador.endereco.bairro = consultaCepResponse.bairro;
    this.colaborador.endereco.estado = consultaCepResponse.estado;
    this.colaborador.endereco.cidade = consultaCepResponse.cidade;
    this.colaborador.endereco.complemento = null;

    this.dadosColaborador.controls['codigoPostal'].markAsTouched();
    this.dadosColaborador.controls['logradouro'].markAsTouched();
    this.dadosColaborador.controls['bairro'].markAsTouched();
    this.dadosColaborador.controls['estado'].markAsTouched();
    this.dadosColaborador.controls['cidade'].markAsTouched();

    this.inputNumeroEndereco.nativeElement.focus();

    this.obtemTodosMunicipiosPorEstado();
  }

  public obtemTodosMunicipiosPorEstado() {
    this.atualizaValidatorsEndereco();
    if (this.colaborador.endereco.estado != null && this.colaborador.endereco.estado != '') {
      this.obtemTodosMunicipiosPorEstadoSubscription$ =
        this.brasilApiService.obtemTodosMunicipiosPorEstado(this.colaborador.endereco.estado).subscribe({
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

  realizaTratamentoCpfCnpj() {
  }

  // STEP EMPRESA
  alteraStatusColaborador() {
    if (this.colaborador.statusColaboradorEnum == 'ATIVO'
      || this.colaborador.statusColaboradorEnum == 'AFASTADO'
      || this.colaborador.statusColaboradorEnum == 'FERIAS') {
      this.colaborador.saidaEmpresa = '';
      this.dataSaidaAparente = false;
      this.dadosProfissionais.get('saidaEmpresa').disable();
    }
    else {
      this.colaborador.saidaEmpresa = '';
      this.dataSaidaAparente = false;
      this.dadosProfissionais.get('saidaEmpresa').enable();
    }

    if (this.colaborador.statusColaboradorEnum == 'DISPENSADO') {
      this.colaborador.acessoSistema.acessoSistemaAtivo = false;
      this.dadosAcesso.get('acessoSistemaAtivo').disable();
      this.atualizaLiberacaoSistema();
    }
    else {
      this.dadosAcesso.get('acessoSistemaAtivo').enable();
      this.atualizaLiberacaoSistema();
    }
  }

  limpaInputContrato() {
    this.colaborador.contratoContratacao = null;
  }

  validaDataEntradaEmpresa() {
    if (this.colaborador.entradaEmpresa == '') {
      this.dataEntradaAparente = false;
      return;
    }

    let dataEntradaSplittada = this.colaborador.entradaEmpresa.split("-");
    if (dataEntradaSplittada.length == 3) {
      if (parseInt(dataEntradaSplittada[0]) > 2023 || parseInt(dataEntradaSplittada[0]) < 1900) {
        this.colaborador.entradaEmpresa = '';
        this.dataEntradaAparente = false;
        this._snackBar.open("Data de entrada inválida", "Fechar", {
          duration: 3500
        })
        return;
      }
    }
  }

  defineIconeDataEntradaEmpresa() {
    if (this.dadosProfissionais.controls['entradaEmpresa'].touched && this.dadosProfissionais.controls['entradaEmpresa'].invalid) {
      return 'error';
    }
    else {
      if (this.colaborador.entradaEmpresa == '' || this.colaborador.entradaEmpresa == null) return 'calendar_month';
      else return 'check';
    }
  }

  validaDataSaidaEmpresa() {
    if (this.colaborador.saidaEmpresa == '') {
      this.dataSaidaAparente = false;
      return;
    }

    let dataSaidaSplittada = this.colaborador.saidaEmpresa.split("-");
    if (dataSaidaSplittada.length == 3) {
      if (parseInt(dataSaidaSplittada[0]) > 2023 || parseInt(dataSaidaSplittada[0]) < 1900) {
        this.colaborador.saidaEmpresa = '';
        this.dataEntradaAparente = false;
        this._snackBar.open("Data de saída inválida", "Fechar", {
          duration: 3500
        })
        return;
      }
    }
  }

  defineIconeDataSaidaEmpresa() {
    if (this.dadosProfissionais.controls['saidaEmpresa'].touched && this.dadosProfissionais.controls['saidaEmpresa'].invalid) {
      return 'error';
    }
    else {
      if (this.colaborador.saidaEmpresa == '' || this.colaborador.saidaEmpresa == null) return 'calendar_month';
      else return 'check';
    }
  }

  habilitaDataEntradaEmpresa() {
    this.inputDataEntrada.nativeElement.focus();
    this.dataEntradaAparente = true;
  }

  habilitaDataSaidaEmpresa() {
    if (this.colaborador.statusColaboradorEnum != 'ATIVO'
      && this.colaborador.statusColaboradorEnum != 'AFASTADO'
      && this.colaborador.statusColaboradorEnum != 'FERIAS') {
      this.inputDataSaida.nativeElement.focus();
      this.dataSaidaAparente = true;
    }
  }

  // STEP ACESSO
  atualizaLiberacaoSistema() {
    if (this.colaborador.acessoSistema.acessoSistemaAtivo) {
      this.dadosAcesso.get('senha').enable();
      this.dadosAcesso.get('permissaoEnum').enable();
    }
    else {
      this.colaborador.acessoSistema.privilegios = [];
      this.modulosLiberados = this.colaborador.acessoSistema.privilegios;
      this.dadosAcesso.get('senha').setValue('');
      this.dadosAcesso.get('senha').disable();
      this.dadosAcesso.get('permissaoEnum').disable();
    }
  }

  adicionaModulo(moduloLiberado) {
    this.colaborador.acessoSistema.privilegios.push(moduloLiberado)
    this.modulosLiberados = this.colaborador.acessoSistema.privilegios;
    this.privilegioAtual = '';
  }

  removeModulo(moduloLiberado) {
    this.colaborador.acessoSistema.privilegios.splice(moduloLiberado, 1);
    this.modulosLiberados = this.colaborador.acessoSistema.privilegios;
  }

  // NAVEGAÇÃO ENTRE OS STEPS

  retornaParaVisualizacao() {
    this.router.navigate(['/colaboradores'])
  }

  avancaPrimeiraEtapa() {
    setTimeout(() => {
      this.inputNome.nativeElement.focus();
    }, 400);
  }

  avancaSegundaEtapa() {
    setTimeout(() => {
      this.selectSetor.nativeElement.focus();
    }, 400);
  }

  avancaTerceiraEtapa() {
    setTimeout(() => {
      this.selectAcessoSistemaAtivo.nativeElement.focus();
    }, 400);
  }

  public enviarFormulario() {
  }

}
