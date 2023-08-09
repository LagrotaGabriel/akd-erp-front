import { Component, ViewChild, ElementRef, ChangeDetectorRef, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, debounceTime } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectOption } from '../../../../shared/inputs/models/select-option';
import { CustomSelectComponent } from '../../../../shared/inputs/custom-select/custom-select.component';
import { fadeInOutAnimation } from 'src/app/shared/animations';
import { ColaboradorResponse } from '../../models/response/colaborador/ColaboradorResponse';
import { Util } from 'src/app/modules/utils/Util';

@Component({
  selector: 'app-dados-profissionais',
  templateUrl: './dados-profissionais.component.html',
  styleUrls: ['../new.component.scss'],
  animations: [fadeInOutAnimation]
})
export class DadosProfissionaisComponent {

  constructor(private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private ref: ChangeDetectorRef) { }

  private obtemTodasOcupacoesSubscription$: Subscription;

  protected dadosProfissionais: FormGroup = this.createForm();
  @Output() emissorDeDadosProfissionaisDoColaborador = new EventEmitter<FormGroup>();

  dadosProfissionaisSubscribe$: Subscription = this.dadosProfissionais.valueChanges.pipe(
    debounceTime(500)
  ).subscribe({
    next: () => {
      this.emissorDeDadosProfissionaisDoColaborador.emit(this.dadosProfissionais);
    }
  })

  protected ocupacoesResponse: string[] = [];

  protected contratoContratacao: File;
  @Output() emissorDeContratoContratacao = new EventEmitter<File>();

  @ViewChild('selectSetor') selectSetor: CustomSelectComponent;
  @ViewChild('inputSalario') inputSalario: ElementRef;
  @ViewChild('botaoProximo') botaoProximo: ElementRef;
  @ViewChild('botaoRetorno') botaoRetorno: ElementRef;

  @Input() stepAtual: number;
  @Input() setupDadosProfissionaisAtualizacao: ColaboradorResponse;

  ngOnChanges(changes: SimpleChanges): void {
    let setupDadosProfissionaisAtualizacao = changes['setupDadosProfissionaisAtualizacao'];
    if (Util.isNotObjectEmpty(setupDadosProfissionaisAtualizacao)) {
      if (Util.isNotObjectEmpty(setupDadosProfissionaisAtualizacao.currentValue)) {
        this.realizaSetupDadosProfissionais(setupDadosProfissionaisAtualizacao.currentValue);
      }
    }

    if (this.stepAtual == 1) {
      setTimeout(() => {
        this.selectSetor.acionaFoco();
      }, 300);
    }
  }

  ngAfterViewInit(): void {
    this.ref.detectChanges();
    this.obtemTodasOcupacoes();
    this.emissorDeDadosProfissionaisDoColaborador.emit(this.dadosProfissionais);
  }

  ngOnDestroy(): void {
    if (this.obtemTodasOcupacoesSubscription$ != undefined) this.obtemTodasOcupacoesSubscription$.unsubscribe();
    if (this.dadosProfissionaisSubscribe$ != undefined) this.dadosProfissionaisSubscribe$.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      tipoOcupacaoEnum: ['TECNICO'],
      ocupacao: ['', Validators.maxLength(30)],
      statusColaboradorEnum: ['ATIVO'],
      modeloContratacaoEnum: ['CLT'],
      modeloTrabalhoEnum: ['PRESENCIAL'],
      contratoContratacao: [null],
      salario: [0.0, [Validators.max(9999999.00), Validators.min(0.00)]],
      entradaEmpresa: [''],
      saidaEmpresa: [{ value: '', disabled: true }],
      horaEntrada: [''],
      horaSaidaAlmoco: [{ value: '', disabled: true }],
      horaEntradaAlmoco: [{ value: '', disabled: true }],
      horaSaida: [{ value: '', disabled: true }],
      escalaEnum: [{ value: 'INDEFINIDA', disabled: true }],
      cargaHorariaSemanal: [{ value: '0:00', disabled: true }],
    });
  }

  protected getValueAtributoDadosProfissionais(atributo: string): any {
    return this.dadosProfissionais.controls[atributo].value;
  }

  // OPTIONS

  protected geraOptionsSetor(): SelectOption[] {
    let options: SelectOption[] = [
      {
        text: 'Técnico',
        value: 'TECNICO'
      },
      {
        text: 'Técnico interno',
        value: 'TECNICO_INTERNO'
      },
      {
        text: 'Técnico externo',
        value: 'TECNICO_EXTERNO'
      },
      {
        text: 'Atendimento',
        value: 'ATENDENTE'
      },
      {
        text: 'Gerência',
        value: 'GERENTE'
      },
      {
        text: 'Diretoria',
        value: 'DIRETOR'
      },
      {
        text: 'Financeiro',
        value: 'FINANCEIRO'
      },
      {
        text: 'Administrativo',
        value: 'ADMINISTRATIVO'
      },
      {
        text: 'Marketing',
        value: 'MARKETING'
      },
      {
        text: 'Tecnologia',
        value: 'TECNICO_TI'
      }
    ]
    return options;
  }

  protected geraOptionsStatusColaborador(): SelectOption[] {
    let options: SelectOption[] = [
      {
        text: 'Ativo',
        value: 'ATIVO'
      },
      {
        text: 'Afastado',
        value: 'AFASTADO'
      },
      {
        text: 'Freelancer',
        value: 'FREELANCER'
      },
      {
        text: 'De férias',
        value: 'FERIAS'
      },
      {
        text: 'Dispensado',
        value: 'DISPENSADO'
      }
    ]
    return options;
  }

  protected geraOptionsModeloContratacao(): SelectOption[] {
    let options: SelectOption[] = [
      {
        text: 'CLT',
        value: 'CLT'
      },
      {
        text: 'Pessoa jurídica (PJ)',
        value: 'PJ'
      },
      {
        text: 'Freelancer',
        value: 'FREELANCER'
      }
    ]
    return options;
  }

  protected geraOptionsModeloTrabalho(): SelectOption[] {
    let options: SelectOption[] = [
      {
        text: 'Presencial',
        value: 'PRESENCIAL'
      },
      {
        text: 'Híbrido',
        value: 'HIBRIDO'
      },
      {
        text: 'Remoto',
        value: 'HOME_OFFICE'
      }
    ]
    return options;
  }

  protected geraOptionsEscala(): SelectOption[] {
    let options: SelectOption[] = [
      {
        text: 'Indefinida',
        value: 'INDEFINIDA'
      },
      {
        text: '5x2',
        value: 'SEG_A_SEX'
      },
      {
        text: '6x1',
        value: 'SEG_A_SAB'
      },
      {
        text: '12x36',
        value: 'DIA_SIM_DIA_NAO'
      }
    ]
    return options;
  }

  protected obtemTodasOcupacoes() {
    /*     this.obtemTodasOcupacoesSubscription$ = this.colaboradorService.obtemTodasOcupacoes().subscribe({
          next: (resposta: string[]) => this.ocupacoesResponse = resposta
        }) */
  }

  protected alteraStatusColaborador() {
    if (this.getValueAtributoDadosProfissionais('statusColaboradorEnum') == 'ATIVO'
      || this.getValueAtributoDadosProfissionais('statusColaboradorEnum') == 'AFASTADO'
      || this.getValueAtributoDadosProfissionais('statusColaboradorEnum') == 'FERIAS') {
      this.dadosProfissionais.controls['saidaEmpresa'].setValue('');
      this.dadosProfissionais.get('saidaEmpresa').disable();
    }
    else {
      this.dadosProfissionais.controls['saidaEmpresa'].setValue('');
      this.dadosProfissionais.get('saidaEmpresa').enable();
    }

    if (this.getValueAtributoDadosProfissionais('statusColaboradorEnum') == 'FREELANCER')
      this.dadosProfissionais.controls['modeloContratacaoEnum'].setValue('FREELANCER');
  }

  protected limpaInputContrato() {
    this.dadosProfissionais.controls['contratoContratacao'].setValue(null);
    this.contratoContratacao = null;
    this.emissorDeContratoContratacao.emit(this.contratoContratacao);
  }

  protected setaContrato(event) {
    if (event.target.files[0] == undefined) this.contratoContratacao = null;
    else {
      const max_size = 1048576;
      const allowed_types = ['image/png', 'image/jpeg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (event.target.files[0].size > max_size) {
        this._snackBar.open("O tamanho do arquivo não pode ser maior do que 1MB", "Fechar", {
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
        this.emissorDeContratoContratacao.emit(this.contratoContratacao);
      }

    }
  }

  protected getHoje(): string {
    let hoje = new Date();
    return (hoje.getFullYear() + '-' + hoje.getMonth() + '-' + hoje.getDay()).toString();
  }

  protected validaDataEntradaEmpresa() {
    if (this.getValueAtributoDadosProfissionais('entradaEmpresa') == '') {
      return;
    }

    let dataEntradaSplittada = (this.getValueAtributoDadosProfissionais('entradaEmpresa')).split("-");
    if (dataEntradaSplittada.length == 3) {
      if (parseInt(dataEntradaSplittada[0]) > 2023 || parseInt(dataEntradaSplittada[0]) < 1900) {
        this.dadosProfissionais.controls['entradaEmpresa'].setValue('');
        this._snackBar.open("Data de entrada inválida", "Fechar", {
          duration: 3500
        })
        return;
      }
    }

  }

  protected defineIconeDataEntradaEmpresa() {
    if (this.dadosProfissionais.controls['entradaEmpresa'].touched && this.dadosProfissionais.controls['entradaEmpresa'].invalid) {
      return 'error';
    }
    else {
      if (this.getValueAtributoDadosProfissionais('entradaEmpresa') == '' || this.getValueAtributoDadosProfissionais('entradaEmpresa') == null)
        return 'calendar_month';

      else return 'check';
    }
  }

  protected validaDataSaidaEmpresa() {
    if (this.getValueAtributoDadosProfissionais('saidaEmpresa') == '') {
      return;
    }

    let dataSaidaSplittada = (this.getValueAtributoDadosProfissionais('saidaEmpresa')).split("-");
    if (dataSaidaSplittada.length == 3) {
      if (parseInt(dataSaidaSplittada[0]) > 2023 || parseInt(dataSaidaSplittada[0]) < 1900) {
        this.dadosProfissionais.controls['saidaEmpresa'].setValue('');
        this._snackBar.open("Data de saída inválida", "Fechar", {
          duration: 3500
        })
        return;
      }
    }
  }

  protected defineIconeDataSaidaEmpresa() {
    if (this.dadosProfissionais.controls['saidaEmpresa'].touched && this.dadosProfissionais.controls['saidaEmpresa'].invalid) {
      return 'error';
    }
    else {
      if (this.getValueAtributoDadosProfissionais('saidaEmpresa') == '' || this.getValueAtributoDadosProfissionais('saidaEmpresa') == null)
        return 'calendar_month';

      else return 'check';
    }
  }

  protected realizaTratamentoRemuneracao(evento) {

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

  redirecionaParaMetodoDeValidacaoParaCampoDeExpedienteCorrespondente(campo: string) {
    switch (campo) {
      case 'entrada': {
        this.realizaValidacaoExpedienteHoraEntrada();
        break;
      }
      case 'saidaAlmoco': {
        this.realizaValidacaoExpedienteHoraSaidaAlmoco();
        break;
      }
      case 'entradaAlmoco': {
        this.realizaValidacaoExpedienteHoraEntradaAlmoco();
        break;
      }
      case 'saida': {
        this.realizaValidacaoExpedienteHoraSaida();
        break;
      }
    }
  }

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

  protected realizaCalculoCargaHorariaSemanal() {

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

  realizaSetupDadosProfissionais(colaborador: ColaboradorResponse) {

    if (Util.isNotObjectEmpty(colaborador.expediente)) {
      this.dadosProfissionais.controls['horaEntrada'].enable();
      this.dadosProfissionais.controls['horaSaidaAlmoco'].enable();
      this.dadosProfissionais.controls['horaEntradaAlmoco'].enable();
      this.dadosProfissionais.controls['horaSaida'].enable();
      this.dadosProfissionais.controls['escalaEnum'].enable();
    }

    if (Util.isNotEmptyString(colaborador.saidaEmpresa)) {
      this.dadosProfissionais.controls['saidaEmpresa'].enable();
    }

    this.dadosProfissionais.setValue({
      tipoOcupacaoEnum: colaborador.tipoOcupacaoEnum,
      ocupacao: colaborador.ocupacao,
      statusColaboradorEnum: colaborador.statusColaboradorEnum,
      modeloContratacaoEnum: colaborador.modeloContratacaoEnum,
      modeloTrabalhoEnum: colaborador.modeloTrabalhoEnum,
      contratoContratacao: null,
      salario: colaborador.salario,
      entradaEmpresa: colaborador.entradaEmpresa,
      saidaEmpresa: colaborador.saidaEmpresa,
      horaEntrada: Util.isObjectEmpty(colaborador.expediente) ? '' : colaborador.expediente.horaEntrada,
      horaSaidaAlmoco: Util.isObjectEmpty(colaborador.expediente) ? '' : colaborador.expediente.horaSaidaAlmoco,
      horaEntradaAlmoco: Util.isObjectEmpty(colaborador.expediente) ? '' : colaborador.expediente.horaEntradaAlmoco,
      horaSaida: Util.isObjectEmpty(colaborador.expediente) ? '' : colaborador.expediente.horaSaida,
      escalaEnum: Util.isObjectEmpty(colaborador.expediente) ? '' : colaborador.expediente.escalaEnum,
      cargaHorariaSemanal: Util.isObjectEmpty(colaborador.expediente) ? '0:00' : colaborador.expediente.cargaHorariaSemanal,
    })
  }

  protected avancaProximaEtapa() {
    if (this.dadosProfissionais.invalid) {
      this.dadosProfissionais.markAllAsTouched();
      this._snackBar.open('Ops! Algum campo está incorreto. Revise o formulário e tente novamente.', "Fechar", {
        duration: 3500
      })
    }
  }

}
