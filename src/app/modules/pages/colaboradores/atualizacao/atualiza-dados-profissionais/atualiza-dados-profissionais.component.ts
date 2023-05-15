import { debounceTime, Subscription } from 'rxjs';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomSelectComponent } from 'src/app/modules/shared/inputs/custom-select/custom-select.component';
import { SelectOption } from 'src/app/modules/shared/inputs/models/select-option';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ColaboradorService } from '../../services/colaborador.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { ColaboradorNovo } from '../../models/ColaboradorNovo';
import { Util } from 'src/app/modules/utils/Util';

@Component({
  selector: 'app-atualiza-dados-profissionais',
  templateUrl: './atualiza-dados-profissionais.component.html',
  styleUrls: ['../atualizacao.component.scss'],
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
export class AtualizaDadosProfissionaisComponent {

  constructor(private formBuilder: FormBuilder,
    private colaboradorService: ColaboradorService,
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

  @Input() stepAtual: number;
  @Input() colaboradorPreAtualizacao: ColaboradorNovo;

  ngOnChanges(changes: SimpleChanges): void {
    if (Util.isNotObjectEmpty(changes['colaboradorPreAtualizacao'])) {
      let colaboradorRecebido: ColaboradorNovo = changes['colaboradorPreAtualizacao'].currentValue;
      if (Util.isNotObjectEmpty(colaboradorRecebido)) this.atualizaFormDadosProfissionaisColaborador();
    }

    if (Util.isNotObjectEmpty(changes['stepAtual'])) {
      if (this.stepAtual == 1) {
        setTimeout(() => {
          this.selectSetor.acionaFoco();
        }, 300);
      }
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
      tipoOcupacaoEnum: new FormControl(
        {
          value: 'TECNICO',
          disabled: true
        }
      ),
      ocupacao: new FormControl(
        {
          value: '',
          disabled: true
        }, Validators.maxLength(30)
      ),
      statusColaboradorEnum: new FormControl(
        {
          value: 'ATIVO',
          disabled: true
        }
      ),
      modeloContratacaoEnum: new FormControl(
        {
          value: 'CLT',
          disabled: true
        }
      ),
      modeloTrabalhoEnum: new FormControl(
        {
          value: 'PRESENCIAL',
          disabled: true
        }
      ),
      contratoContratacao: new FormControl(
        {
          value: null,
          disabled: true
        }
      ),
      salario: new FormControl(
        {
          value: 0.0,
          disabled: true
        },
        [
          Validators.max(9999999.00),
          Validators.min(0.00)
        ]
      ),
      entradaEmpresa: new FormControl(
        {
          value: '',
          disabled: true
        }
      ),
      saidaEmpresa: new FormControl(
        {
          value: '',
          disabled: true
        }
      ),
      horaEntrada: new FormControl(
        {
          value: '',
          disabled: true
        }
      ),
      horaSaidaAlmoco: new FormControl(
        {
          value: '',
          disabled: true
        }
      ),
      horaEntradaAlmoco: new FormControl(
        {
          value: '',
          disabled: true
        }
      ),
      horaSaida: new FormControl(
        {
          value: '',
          disabled: true
        }
      ),
      escalaEnum: new FormControl(
        {
          value: 'INDEFINIDA',
          disabled: true
        }, Validators.required
      ),
      cargaHorariaSemanal: new FormControl(
        {
          value: '0:00',
          disabled: true
        }
      ),
    });
  }

  private atualizaFormDadosProfissionaisColaborador() {
    this.setaValoresFormCliente();
    this.administraLiberacaoOuBloqueioDosCamposFormCliente();
    this.setaValidatorsFormCliente();
    this.emissorDeDadosProfissionaisDoColaborador.emit(this.dadosProfissionais);
  }

  private setaValoresFormCliente() {
    this.dadosProfissionais.setValue({
      tipoOcupacaoEnum: this.colaboradorPreAtualizacao.tipoOcupacaoEnum,
      ocupacao: Util.isEmptyString(this.colaboradorPreAtualizacao.ocupacao) ? '' : this.colaboradorPreAtualizacao.ocupacao,
      statusColaboradorEnum: this.colaboradorPreAtualizacao.statusColaboradorEnum,
      modeloContratacaoEnum: this.colaboradorPreAtualizacao.modeloContratacaoEnum,
      modeloTrabalhoEnum: this.colaboradorPreAtualizacao.modeloTrabalhoEnum,
      contratoContratacao: '',
      salario: Util.isEmptyNumber(this.colaboradorPreAtualizacao.salario) ? 0.0 : this.colaboradorPreAtualizacao.salario,
      entradaEmpresa: Util.isEmptyString(this.colaboradorPreAtualizacao.entradaEmpresa) ? '' : this.colaboradorPreAtualizacao.entradaEmpresa,
      saidaEmpresa: Util.isEmptyString(this.colaboradorPreAtualizacao.saidaEmpresa) ? '' : this.colaboradorPreAtualizacao.saidaEmpresa,
      horaEntrada: Util.isObjectEmpty(this.colaboradorPreAtualizacao.expediente) ? '' : this.colaboradorPreAtualizacao.expediente.horaEntrada,
      horaSaidaAlmoco: Util.isObjectEmpty(this.colaboradorPreAtualizacao.expediente) ? '' : this.colaboradorPreAtualizacao.expediente.horaSaidaAlmoco,
      horaEntradaAlmoco: Util.isObjectEmpty(this.colaboradorPreAtualizacao.expediente) ? '' : this.colaboradorPreAtualizacao.expediente.horaEntradaAlmoco,
      horaSaida: Util.isObjectEmpty(this.colaboradorPreAtualizacao.expediente) ? '' : this.colaboradorPreAtualizacao.expediente.horaSaida,
      escalaEnum: Util.isObjectEmpty(this.colaboradorPreAtualizacao.expediente) ? 'INDEFINIDA' : this.colaboradorPreAtualizacao.expediente.escalaEnum,
      cargaHorariaSemanal: Util.isObjectEmpty(this.colaboradorPreAtualizacao.expediente) ? '0:00' : this.colaboradorPreAtualizacao.expediente.cargaHorariaSemanal,
    })
  }

  private administraLiberacaoOuBloqueioDosCamposFormCliente() {
    this.dadosProfissionais.get('tipoOcupacaoEnum').enable();
    this.dadosProfissionais.get('ocupacao').enable();
    this.dadosProfissionais.get('statusColaboradorEnum').enable();
    this.dadosProfissionais.get('modeloContratacaoEnum').enable();
    this.dadosProfissionais.get('modeloTrabalhoEnum').enable();
    this.dadosProfissionais.get('contratoContratacao').enable();
    this.dadosProfissionais.get('salario').enable();
    this.dadosProfissionais.get('entradaEmpresa').enable();
    (this.getValueAtributoDadosProfissionais('statusColaboradorEnum') == 'FREELANCER'
      || this.getValueAtributoDadosProfissionais('statusColaboradorEnum') == 'DISPENSADO')
      ? this.dadosProfissionais.get('saidaEmpresa').enable()
      : this.dadosProfissionais.get('saidaEmpresa').disable();
    this.dadosProfissionais.get('horaEntrada').enable();
    if (Util.isNotEmptyString(this.getValueAtributoDadosProfissionais('horaSaidaAlmoco'))) {
      this.dadosProfissionais.get('horaSaidaAlmoco').enable();
      this.dadosProfissionais.get('horaEntradaAlmoco').enable();
      this.dadosProfissionais.get('horaSaida').enable();
      this.dadosProfissionais.get('escalaEnum').enable();
    }
    else {
      this.dadosProfissionais.get('horaSaidaAlmoco').disable();
      this.dadosProfissionais.get('horaEntradaAlmoco').disable();
      this.dadosProfissionais.get('horaSaida').disable();
      this.dadosProfissionais.get('escalaEnum').disable();
    }
  }

  private setaValidatorsFormCliente() {
    if (Util.isNotEmptyString(this.getValueAtributoDadosProfissionais('horaSaidaAlmoco'))) {
      this.dadosProfissionais.get('horaSaidaAlmoco').setValidators(Validators.required);
      this.dadosProfissionais.get('horaEntradaAlmoco').setValidators(Validators.required);
      this.dadosProfissionais.get('horaSaida').setValidators(Validators.required);
    }
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
    this.obtemTodasOcupacoesSubscription$ = this.colaboradorService.obtemTodasOcupacoes().subscribe({
      next: (resposta: string[]) => this.ocupacoesResponse = resposta
    })
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
  }

  protected limpaInputContrato() {
    this.dadosProfissionais.controls['contratoContratacao'].setValue(null);
    this.contratoContratacao = null;
    this.emissorDeContratoContratacao.emit(this.contratoContratacao);
  }

  protected setaContrato(event) {
    if (event.target.files[0] == undefined) this.contratoContratacao = null;
    else {
      const max_size = 2097152;
      const allowed_types = ['image/png', 'image/jpeg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

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

  protected avancaProximaEtapa() {
    if (this.dadosProfissionais.invalid) {
      this.dadosProfissionais.markAllAsTouched();
      this._snackBar.open('Ops! Algum campo está incorreto. Revise o formulário e tente novamente.', "Fechar", {
        duration: 3500
      })
    }
  }

}