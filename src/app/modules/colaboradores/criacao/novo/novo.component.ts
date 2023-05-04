import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrasilApiService } from 'src/app/shared/services/brasil-api.service';
import { ColaboradorService } from '../../services/colaborador.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
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
      transition(':enter', [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 }))
      ]),
      transition(':leave', [
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
    private ref: ChangeDetectorRef) { }

  colaborador: ColaboradorNovo;

  dataNascimentoAparente: boolean = false;
  dataEntradaAparente: boolean = false;
  dataSaidaAparente: boolean = false;

  // Subscriptions
  validaDuplicidadeCpfCnpjSubscription$: Subscription;
  obtemTodosEstadosBrasileirosSubscription$: Subscription;
  getEnderecoPeloCepSubscription$: Subscription;
  obtemTodosMunicipiosPorEstadoSubscription$: Subscription;
  obtemTodasOcupacoesSubscription$: Subscription;

  // Form groups
  dadosColaborador: FormGroup;
  dadosProfissionais: FormGroup;
  dadosAcesso: FormGroup;

  // Validations colaborador
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

  ocupacoesResponse: string[] = [];

  contratoContratacao: File;

  @ViewChild('numeroEndereco') inputNumeroEndereco: ElementRef;
  @ViewChild('contratoContratacaoInput') contratoContratacaoInput: ElementRef;
  @ViewChild('selectSetor') selectSetor: ElementRef;
  @ViewChild('inputNome') inputNome: ElementRef;
  @ViewChild('inputDataNascimento') inputDataNascimento: ElementRef;
  @ViewChild('inputDataEntrada') inputDataEntrada: ElementRef;
  @ViewChild('inputDataSaida') inputDataSaida: ElementRef;
  @ViewChild('selectAcessoSistemaAtivo') selectAcessoSistemaAtivo: ElementRef;
  @ViewChild('inputSalario') inputSalario: ElementRef;

  ngAfterViewInit(): void {
    this.ref.detectChanges();
  }

  ngOnInit(): void {
    this.createForm();
    this.atualizaValidatorsTelefone();
    this.obtemTodosEstadosBrasileiros();
    this.obtemTodasOcupacoes();

    setTimeout(() => {
      this.inputNome.nativeElement.focus();
    }, 100);

    this.modulosLiberados = this.getValueAtributoDadosAcesso('privilegios');
  }

  createForm() {
    this.dadosColaborador = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      cpfCnpj: ['', [Validators.pattern(this.inputPatternCpfCnpj), Validators.maxLength(this.inputLengthCpfCnpj), Validators.minLength(this.inputLengthCpfCnpj)]],
      email: ['', [Validators.email, Validators.maxLength(50)]],
      dataNascimento: [''],
      tipoTelefone: [''],
      prefixo: [null, [Validators.minLength(this.inputLengthPrefixo), Validators.maxLength(this.inputLengthPrefixo), Validators.pattern(this.inputPrefixoPattern)]],
      numeroTelefone: [null],
      logradouro: [''],
      numero: [null],
      bairro: ['', Validators.maxLength(50)],
      codigoPostal: ['', [Validators.maxLength(8), Validators.pattern(/^\d{5}\d{3}/)]],
      cidade: ['', Validators.maxLength(50)],
      complemento: ['', Validators.maxLength(80)],
      estado: ['', Validators.maxLength(50)]
    });
    this.dadosProfissionais = this.formBuilder.group({
      tipoOcupacaoEnum: ['TECNICO'],
      ocupacao: ['', Validators.maxLength(30)],
      statusColaboradorEnum: ['ATIVO'],
      modeloContratacaoEnum: ['CLT'],
      modeloTrabalhoEnum: ['PRESENCIAL'],
      contratoContratacao: [null],
      salario: [0.0, [Validators.max(9999999.00), Validators.min(0.00)]],
      entradaEmpresa: [''],
      saidaEmpresa: [''],
      horaEntrada: [''],
      horaSaidaAlmoco: [{ value: '', disabled: true }],
      horaEntradaAlmoco: [{ value: '', disabled: true }],
      horaSaida: [{ value: '', disabled: true }],
      escalaEnum: [{ value: 'INDEFINIDA', disabled: true }],
      cargaHorariaSemanal: [{ value: '0:00', disabled: true }],
    });
    this.dadosAcesso = this.formBuilder.group({
      acessoSistemaAtivo: [true],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      permissaoEnum: ['LEITURA_BASICA'],
      privilegios: [['HOME', 'VENDAS', 'PDV', 'ESTOQUE', 'PRECOS']]
    });

    this.dadosProfissionais.get('saidaEmpresa').disable();

  }

  getValueAtributoDadosColaborador(atributo: string): any {
    return this.dadosColaborador.controls[atributo].value;
  }

  getValueAtributoDadosProfissionais(atributo: string): any {
    return this.dadosProfissionais.controls[atributo].value;
  }

  getValueAtributoDadosAcesso(atributo: string): any {
    return this.dadosAcesso.controls[atributo].value;
  }

  obtemTodasOcupacoes() {
    this.obtemTodasOcupacoesSubscription$ = this.colaboradorService.obtemTodasOcupacoes().subscribe({
      next: (resposta: string[]) => this.ocupacoesResponse = resposta
    })
  }

  // CPFCNPJ
  defineIconeInputCpfCnpj() {
    if (this.dadosColaborador.controls['cpfCnpj'].touched && this.dadosColaborador.controls['cpfCnpj'].invalid) {
      return 'error';
    }
    else {
      if (this.dadosColaborador.controls['cpfCnpj'].value == '' || this.dadosColaborador.controls['cpfCnpj'].value == null) return 'badge';
      else return 'check';
    }
  }

  realizaTratamentoCpfCnpj() {
    this.dadosColaborador.controls['cpfCnpj']
      .setValue(this.getValueAtributoDadosColaborador('cpfCnpj')
        .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
        .replace(/[^0-9.]/g, '')
        .trim())
  }

  // EMAIL
  defineIconeInputEmail() {
    if (this.dadosColaborador.controls['email'].touched && this.dadosColaborador.controls['email'].invalid) {
      return 'error';
    }
    else {
      if (this.dadosColaborador.controls['email'].value == '' || this.dadosColaborador.controls['email'].value == null) return 'alternate_email';
      else return 'check';
    }
  }

  // TELEFONE
  atualizaValidatorsTelefone() {
    this.dadosColaborador.controls['prefixo'].setValue('');
    this.dadosColaborador.controls['prefixo'].reset();

    this.dadosColaborador.controls['numeroTelefone'].setValue('');
    this.dadosColaborador.controls['numeroTelefone'].reset();

    this.dadosColaborador.controls['prefixo'].clearValidators();
    this.dadosColaborador.controls['numeroTelefone'].clearValidators();

    if (this.dadosColaborador.controls['tipoTelefone'].value != '' && this.dadosColaborador.controls['tipoTelefone'].value != null) {

      this.dadosColaborador.controls['prefixo'].enable();
      this.dadosColaborador.controls['numeroTelefone'].enable();

      if (this.dadosColaborador.controls['tipoTelefone'].value == 'FIXO') {
        this.inputLengthTelefone = 8;
        this.inputTelefonePattern = /^\d{4}\d{4}/;
      }

      else if (this.dadosColaborador.controls['tipoTelefone'].value == 'MOVEL' || this.dadosColaborador.controls['tipoTelefone'].value == 'MOVEL_WHATSAPP') {
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
    if (this.dadosColaborador.controls['tipoTelefone'].value != null
      && this.dadosColaborador.controls['tipoTelefone'].value != undefined
      && this.dadosColaborador.controls['tipoTelefone'].value != '') {
      return true;
    }
    return false;
  }

  realizaTratamentoPrefixo() {
    this.dadosColaborador.controls['prefixo']
      .setValue(this.getValueAtributoDadosColaborador('prefixo')
        .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
        .replace(/[^0-9.]/g, '')
        .trim())
  }

  realizaTratamentoNumeroTelefone() {
    this.dadosColaborador.controls['numeroTelefone']
      .setValue(this.getValueAtributoDadosColaborador('numeroTelefone')
        .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
        .replace(/[^0-9.]/g, '')
        .trim())
  }

  defineIconeInputTelefone(): string {
    if (this.dadosColaborador.controls['numeroTelefone'].touched && this.dadosColaborador.controls['numeroTelefone'].invalid) {
      return 'error';
    }
    else {
      if (
        this.dadosColaborador.controls['numeroTelefone'].value == '' && this.dadosColaborador.controls['tipoTelefone'].value == 'MOVEL_WHATSAPP'
        || this.dadosColaborador.controls['numeroTelefone'].value == '' && this.dadosColaborador.controls['tipoTelefone'].value == 'MOVEL'
        || this.dadosColaborador.controls['numeroTelefone'].value == null && this.dadosColaborador.controls['tipoTelefone'].value == 'MOVEL_WHATSAPP'
        || this.dadosColaborador.controls['numeroTelefone'].value == null && this.dadosColaborador.controls['tipoTelefone'].value == 'MOVEL') return 'smartphone';

      else if (
        this.dadosColaborador.controls['numeroTelefone'].value == '' && this.dadosColaborador.controls['tipoTelefone'].value == 'FIXO'
        || this.dadosColaborador.controls['numeroTelefone'].value == null && this.dadosColaborador.controls['tipoTelefone'].value == 'FIXO') return 'call';

      else return 'check';
    }
  }

  // DATA NASCIMENTO

  validaDataNascimento() {

    if (this.dadosColaborador.controls['dataNascimento'].value == '') {
      this.dataNascimentoAparente = false;
      return;
    }

    let dataNascimentoSplitada = (this.dadosColaborador.controls['dataNascimento'].value).split("-");
    if (dataNascimentoSplitada.length == 3) {
      if (parseInt(dataNascimentoSplitada[0]) > 2023 || parseInt(dataNascimentoSplitada[0]) < 1900) {
        this.dadosColaborador.controls['dataNascimento'].setValue('');
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
      if (this.dadosColaborador.controls['dataNascimento'].value == '' || this.dadosColaborador.controls['dataNascimento'].value == null) return 'calendar_month';
      else return 'check';
    }
  }

  // ENDEREÇO
  realizaTratamentoCodigoPostal() {

    this.atualizaValidatorsEndereco();

    this.dadosColaborador.controls['codigoPostal']
      .setValue(this.getValueAtributoDadosColaborador('codigoPostal')
        .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
        .replace(/[^0-9.]/g, '')
        .trim())

    if (this.dadosColaborador.controls['codigoPostal'].valid && this.getValueAtributoDadosColaborador('codigoPostal').length == 8) {
      this.getEnderecoPeloCepSubscription$ =
        this.brasilApiService.getEnderecoPeloCep(this.getValueAtributoDadosColaborador('codigoPostal')).subscribe({
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
    if (
      this.getValueAtributoDadosColaborador('logradouro') != null && this.getValueAtributoDadosColaborador('logradouro') != '' ||
      this.getValueAtributoDadosColaborador('numero') != null && this.getValueAtributoDadosColaborador('numero').toString() != '' ||
      this.getValueAtributoDadosColaborador('bairro') != null && this.getValueAtributoDadosColaborador('bairro') != '' ||
      this.getValueAtributoDadosColaborador('cidade') != null && this.getValueAtributoDadosColaborador('cidade') != '' ||
      this.getValueAtributoDadosColaborador('estado') != null && this.getValueAtributoDadosColaborador('estado') != '' ||
      this.getValueAtributoDadosColaborador('codigoPostal') != null && this.getValueAtributoDadosColaborador('codigoPostal') != '' ||
      this.getValueAtributoDadosColaborador('complemento') != null && this.getValueAtributoDadosColaborador('complemento') != '') {
      this.dadosColaborador.controls['cidade'].setValue(this.getValueAtributoDadosColaborador('cidade').normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
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
          this.router.navigate(['/colaboradores'])
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
    this.dadosColaborador.controls['logradouro'].setValue(consultaCepResponse.logradouro);
    this.dadosColaborador.controls['numero'].setValue(null);
    this.dadosColaborador.controls['bairro'].setValue(consultaCepResponse.bairro);
    this.dadosColaborador.controls['estado'].setValue(consultaCepResponse.estado);
    this.dadosColaborador.controls['cidade'].setValue(consultaCepResponse.cidade);
    this.dadosColaborador.controls['complemento'].setValue(null);

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
    if (this.getValueAtributoDadosColaborador('estado') != null && this.getValueAtributoDadosColaborador('estado') != '') {
      this.obtemTodosMunicipiosPorEstadoSubscription$ =
        this.brasilApiService.obtemTodosMunicipiosPorEstado(this.getValueAtributoDadosColaborador('estado')).subscribe({
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

  // STEP EMPRESA
  alteraStatusColaborador() {
    if (this.getValueAtributoDadosProfissionais('statusColaboradorEnum') == 'ATIVO'
      || this.getValueAtributoDadosProfissionais('statusColaboradorEnum') == 'AFASTADO'
      || this.getValueAtributoDadosProfissionais('statusColaboradorEnum') == 'FERIAS') {
      this.dadosProfissionais.controls['saidaEmpresa'].setValue('');
      this.dataSaidaAparente = false;
      this.dadosProfissionais.get('saidaEmpresa').disable();
    }
    else {
      this.dadosProfissionais.controls['saidaEmpresa'].setValue('');
      this.dataSaidaAparente = false;
      this.dadosProfissionais.get('saidaEmpresa').enable();
    }

    if (this.getValueAtributoDadosProfissionais('statusColaboradorEnum') == 'DISPENSADO') {
      this.dadosAcesso.controls['acessoSistemaAtivo'].setValue(false);
      this.dadosAcesso.get('acessoSistemaAtivo').disable();
      this.atualizaLiberacaoSistema();
    }
    else {
      this.dadosAcesso.get('acessoSistemaAtivo').enable();
      this.atualizaLiberacaoSistema();
    }
  }

  limpaInputContrato() {
    this.dadosProfissionais.controls['contratoContratacao'].setValue(null);
    this.contratoContratacao = null;
  }

  setaContrato(event) {
    if (event.target.files[0] == undefined) this.contratoContratacao = null;
    else {
      const max_size = 2097152;
      const allowed_types = ['image/png', 'image/jpeg', 'application/pdf' ,'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (event.target.files[0].size > max_size) {
        this._snackBar.open("O tamanho do arquivo não pode ser maior do que 2MB", "Fechar", {
          duration: 5000
        })
        this.limpaInputContrato();  
        return;
      }
      else if (!(allowed_types.includes(event.target.files[0].type))) {
        this._snackBar.open("Tipo de arquivo inválido. Escolha uma imagem, um pdf ou um arquivo word", "Fechar", {
          duration: 5000
        })
        this.limpaInputContrato();
        return;
      }
      else {
        this.contratoContratacao = event.target.files[0];
      }

    }
  }

  validaDataEntradaEmpresa() {
    if (this.getValueAtributoDadosProfissionais('entradaEmpresa') == '') {
      this.dataEntradaAparente = false;
      return;
    }

    let dataEntradaSplittada = (this.getValueAtributoDadosProfissionais('entradaEmpresa')).split("-");
    if (dataEntradaSplittada.length == 3) {
      if (parseInt(dataEntradaSplittada[0]) > 2023 || parseInt(dataEntradaSplittada[0]) < 1900) {
        this.dadosProfissionais.controls['entradaEmpresa'].setValue('');
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
      if (this.getValueAtributoDadosProfissionais('entradaEmpresa') == '' || this.getValueAtributoDadosProfissionais('entradaEmpresa') == null)
        return 'calendar_month';

      else return 'check';
    }
  }

  validaDataSaidaEmpresa() {
    if (this.getValueAtributoDadosProfissionais('saidaEmpresa') == '') {
      this.dataSaidaAparente = false;
      return;
    }

    let dataSaidaSplittada = (this.getValueAtributoDadosProfissionais('saidaEmpresa')).split("-");
    if (dataSaidaSplittada.length == 3) {
      if (parseInt(dataSaidaSplittada[0]) > 2023 || parseInt(dataSaidaSplittada[0]) < 1900) {
        this.dadosProfissionais.controls['saidaEmpresa'].setValue('');
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
      if (this.getValueAtributoDadosProfissionais('saidaEmpresa') == '' || this.getValueAtributoDadosProfissionais('saidaEmpresa') == null)
        return 'calendar_month';

      else return 'check';
    }
  }

  habilitaDataEntradaEmpresa() {
    this.inputDataEntrada.nativeElement.focus();
    this.dataEntradaAparente = true;
  }

  habilitaDataSaidaEmpresa() {
    if (this.getValueAtributoDadosProfissionais('statusColaboradorEnum') != 'ATIVO'
      && this.getValueAtributoDadosProfissionais('statusColaboradorEnum') != 'AFASTADO'
      && this.getValueAtributoDadosProfissionais('statusColaboradorEnum') != 'FERIAS') {
      this.inputDataSaida.nativeElement.focus();
      this.dataSaidaAparente = true;
    }
  }

  realizaTratamentoRemuneracao(evento) {

    if (evento.data == '-') {
      this.dadosProfissionais.controls['salario'].setValue(0);
    }

    if (this.getValueAtributoDadosProfissionais('salario') != null) {
      if (this.getValueAtributoDadosProfissionais('salario') < 0 || this.getValueAtributoDadosProfissionais('salario').toString().includes('-')) {
        this.dadosProfissionais.controls['salario'].setValue(0);
      }
      if (this.inputSalario.nativeElement.value.toString().startsWith('0')) {
        this.dadosProfissionais.controls['salario'].setValue(this.getValueAtributoDadosProfissionais('salario'));
      }

      let inputSalarioSplitted = this.inputSalario.nativeElement.value.toString().split(".")
      if (inputSalarioSplitted.length == 2) {
        if (inputSalarioSplitted[1].length > 2) {
          this.dadosProfissionais.controls['salario'].setValue(parseFloat(inputSalarioSplitted[0] + '.' + inputSalarioSplitted[1].slice(0, 2)));
        }
      }
    }
  }

  // EXPEDIENTE

  protected realizaValidacaoExpedienteHoraEntrada() {
    if (this.getValueAtributoDadosProfissionais('horaEntrada') != '' && this.getValueAtributoDadosProfissionais('horaEntrada') != null) {
      this.dadosProfissionais.controls['horaSaidaAlmoco'].addValidators([Validators.required]);
      this.dadosProfissionais.controls['horaEntradaAlmoco'].addValidators([Validators.required]);
      this.dadosProfissionais.controls['horaSaida'].addValidators([Validators.required]);
      this.dadosProfissionais.controls['escalaEnum'].addValidators([Validators.required]);
      this.dadosProfissionais.controls['horaSaidaAlmoco'].enable();
    }
    else {
      this.dadosProfissionais.controls['horaSaidaAlmoco'].setValue('');
      this.dadosProfissionais.controls['horaSaidaAlmoco'].clearValidators();
      this.dadosProfissionais.controls['horaSaidaAlmoco'].disable();

      this.dadosProfissionais.controls['horaEntradaAlmoco'].setValue('');
      this.dadosProfissionais.controls['horaEntradaAlmoco'].clearValidators();
      this.dadosProfissionais.controls['horaEntradaAlmoco'].disable();

      this.dadosProfissionais.controls['horaSaida'].setValue('');
      this.dadosProfissionais.controls['horaSaida'].clearValidators();
      this.dadosProfissionais.controls['horaSaida'].disable();

      this.dadosProfissionais.controls['escalaEnum'].setValue('INDEFINIDA');
      this.dadosProfissionais.controls['escalaEnum'].clearValidators();
      this.dadosProfissionais.controls['escalaEnum'].disable();

      this.dadosProfissionais.controls['cargaHorariaSemanal'].setValue('0:00');
    }

    this.invocaMetodoCalculoCargaHorariaSemanal();
  }

  protected realizaValidacaoExpedienteHoraSaidaAlmoco() {
    if (this.getValueAtributoDadosProfissionais('horaSaidaAlmoco') != '' && this.getValueAtributoDadosProfissionais('horaSaidaAlmoco') != null) {
      this.dadosProfissionais.controls['horaEntradaAlmoco'].enable();
    }
    else {
      this.dadosProfissionais.controls['horaEntradaAlmoco'].setValue('');
      this.dadosProfissionais.controls['horaEntradaAlmoco'].disable();

      this.dadosProfissionais.controls['horaSaida'].setValue('');
      this.dadosProfissionais.controls['horaSaida'].disable();

      this.dadosProfissionais.controls['escalaEnum'].setValue('INDEFINIDA');
      this.dadosProfissionais.controls['escalaEnum'].disable();

      this.dadosProfissionais.controls['cargaHorariaSemanal'].setValue('0:00');
    }

    this.invocaMetodoCalculoCargaHorariaSemanal();
  }

  protected realizaValidacaoExpedienteHoraEntradaAlmoco() {
    if (this.getValueAtributoDadosProfissionais('horaEntradaAlmoco') != '' && this.getValueAtributoDadosProfissionais('horaEntradaAlmoco') != null) {
      this.dadosProfissionais.controls['horaSaida'].enable();
    }
    else {
      this.dadosProfissionais.controls['horaSaida'].setValue('');
      this.dadosProfissionais.controls['horaSaida'].disable();

      this.dadosProfissionais.controls['escalaEnum'].setValue('INDEFINIDA');
      this.dadosProfissionais.controls['escalaEnum'].disable();

      this.dadosProfissionais.controls['cargaHorariaSemanal'].setValue('0:00');
    }

    this.invocaMetodoCalculoCargaHorariaSemanal();
  }

  protected realizaValidacaoExpedienteHoraSaida() {
    if (this.getValueAtributoDadosProfissionais('horaSaida') != '' && this.getValueAtributoDadosProfissionais('horaSaida') != null) {
      this.dadosProfissionais.controls['escalaEnum'].enable();
    }
    else {
      this.dadosProfissionais.controls['escalaEnum'].setValue('INDEFINIDA');
      this.dadosProfissionais.controls['escalaEnum'].disable();

      this.dadosProfissionais.controls['cargaHorariaSemanal'].setValue('0:00');
    }

    this.invocaMetodoCalculoCargaHorariaSemanal();
  }

  private invocaMetodoCalculoCargaHorariaSemanal() {
    if (this.getValueAtributoDadosProfissionais('horaEntrada') != '' && this.getValueAtributoDadosProfissionais('horaEntrada') != null
      && this.getValueAtributoDadosProfissionais('horaSaidaAlmoco') != '' && this.getValueAtributoDadosProfissionais('horaSaidaAlmoco') != null
      && this.getValueAtributoDadosProfissionais('horaEntradaAlmoco') != '' && this.getValueAtributoDadosProfissionais('horaEntradaAlmoco') != null
      && this.getValueAtributoDadosProfissionais('horaSaida') != '' && this.getValueAtributoDadosProfissionais('horaSaida') != null
      && this.getValueAtributoDadosProfissionais('escalaEnum') != 'INDEFINIDA' && this.getValueAtributoDadosProfissionais('escalaEnum') != null)
      this.realizaCalculoCargaHorariaSemanal();
  }

  realizaCalculoCargaHorariaSemanal() {

    let horaEntradaEmMinutos: number =
      (this.getValueAtributoDadosProfissionais('horaEntrada') != null && this.getValueAtributoDadosProfissionais('horaEntrada') != '')
        ? this.calculaHoraEmMinutos((this.getValueAtributoDadosProfissionais('horaEntrada')).split(':'))
        : 0;

    let horaSaidaAlmocoEmMinutos: number =
      (this.getValueAtributoDadosProfissionais('horaSaidaAlmoco') != null && this.getValueAtributoDadosProfissionais('horaSaidaAlmoco') != '')
        ? this.calculaHoraEmMinutos((this.getValueAtributoDadosProfissionais('horaSaidaAlmoco')).split(':'))
        : 0;

    let horaEntradaAlmocoEmMinutos: number =
      (this.getValueAtributoDadosProfissionais('horaEntradaAlmoco') != null && this.getValueAtributoDadosProfissionais('horaEntradaAlmoco') != '')
        ? this.calculaHoraEmMinutos((this.getValueAtributoDadosProfissionais('horaEntradaAlmoco')).split(':'))
        : 0;

    let horaSaidaEmMinutos: number =
      (this.getValueAtributoDadosProfissionais('horaSaida') != null && this.getValueAtributoDadosProfissionais('horaSaida') != '')
        ? this.calculaHoraEmMinutos((this.getValueAtributoDadosProfissionais('horaSaida')).split(':'))
        : 0;

    let TempoHorarioDeAlmoco: number = (horaEntradaAlmocoEmMinutos - horaSaidaAlmocoEmMinutos);
    let tempoEntradaSaida: number = (horaSaidaEmMinutos - horaEntradaEmMinutos);
    let diasEscala: number = this.calculaDiasEscala();
    let expedienteTotal: number = ((tempoEntradaSaida - TempoHorarioDeAlmoco) * diasEscala) / 60;


    this.dadosProfissionais.controls['cargaHorariaSemanal'].setValue(this.converteFloatParaStringNoFormatoTime(expedienteTotal));
  }

  private calculaDiasEscala(): number {
    switch (this.getValueAtributoDadosProfissionais('escalaEnum')) {
      case 'SEG_A_SEX': {
        return 5;
      }
      case 'SEG_A_SAB': {
        return 6;
      }
      case 'DIA_SIM_DIA_NAO': {
        return 4;
      }
      default: {
        return 0;
      }
    }
  }

  private converteFloatParaStringNoFormatoTime(number): string {
    let sign = (number >= 0) ? 1 : -1;

    number = number * sign;

    let hour = Math.floor(number);
    let decpart = number - hour;

    let min = 1 / 60;

    decpart = min * Math.round(decpart / min);

    let minute = Math.floor(decpart * 60) + '';

    if (minute.length < 2) {
      minute = '0' + minute;
    }

    let time = sign + (hour - 1) + ':' + minute;

    return time;
  }

  private calculaHoraEmMinutos(horaSplitada: string[]): number {
    if (horaSplitada.length == 2) return (Number((Number(horaSplitada[0]) * 60) + (Number(horaSplitada[1]))));
    else return 0;
  }

  // STEP ACESSO
  atualizaLiberacaoSistema() {
    if (this.getValueAtributoDadosAcesso('acessoSistemaAtivo')) {
      this.dadosAcesso.get('senha').enable();
      this.dadosAcesso.get('permissaoEnum').enable();
    }
    else {
      this.dadosAcesso.controls['privilegios'].setValue([]);
      this.modulosLiberados = this.getValueAtributoDadosAcesso('privilegios');
      this.dadosAcesso.get('senha').setValue('');
      this.dadosAcesso.get('senha').disable();
      this.dadosAcesso.get('permissaoEnum').disable();
    }
  }

  adicionaModulo(moduloLiberado) {
    this.getValueAtributoDadosAcesso('privilegios').push(moduloLiberado);
    this.modulosLiberados = this.getValueAtributoDadosAcesso('privilegios');
    this.privilegioAtual = '';
  }

  removeModulo(moduloLiberado) {
    this.getValueAtributoDadosAcesso('privilegios').splice(this.getValueAtributoDadosAcesso('privilegios').indexOf(moduloLiberado), 1);
    this.modulosLiberados = this.getValueAtributoDadosAcesso('privilegios');
  }

  defineIconeInputSenha() {
    if (this.dadosAcesso.controls['senha'].touched && this.dadosAcesso.controls['senha'].invalid) {
      return 'error';
    }
    else {
      if (this.getValueAtributoDadosAcesso('senha') == '' || this.getValueAtributoDadosAcesso('senha') == null) return 'lock';
      else return 'check';
    }
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

  // TRATAMENTO DE ENVIO DE FORMULÁRIO



  // ENVIO DE FORMULÁRIO

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
        senha: this.getValueAtributoDadosAcesso('acessoSistemaAtivo') ? this.getValueAtributoDadosAcesso('senha') : null,
        permissaoEnum: this.getValueAtributoDadosAcesso('acessoSistemaAtivo') ? this.getValueAtributoDadosAcesso('permissaoEnum') : null,
        privilegios: this.getValueAtributoDadosAcesso('acessoSistemaAtivo') ? this.getValueAtributoDadosAcesso('privilegios') : null
      }
    }
  }

  public enviarFormulario() {
    this.construirObjetoColaborador();
    this.colaboradorService.novoColaborador(this.colaborador, this.contratoContratacao).subscribe({
      next(response: number) {
        console.log('Matrícula gerada: ' + response);
      }
    });
  }

}
