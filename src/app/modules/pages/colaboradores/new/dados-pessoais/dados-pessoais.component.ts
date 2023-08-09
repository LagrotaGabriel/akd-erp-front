import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ViewChild, ChangeDetectorRef, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription, debounceTime } from 'rxjs';
import { ConsultaCepResponse } from 'src/app/shared/models/brasil-api/consulta-cep-response';
import { EstadosResponse } from 'src/app/shared/models/brasil-api/estados-response';
import { MunicipiosResponse } from 'src/app/shared/models/brasil-api/municipios-response';
import { BrasilApiService } from 'src/app/shared/services/brasil-api.service';
import { SelectOption } from '../../../../shared/inputs/models/select-option';
import { CustomInputComponent } from '../../../../shared/inputs/custom-input/custom-input.component';
import { ColaboradorResponse } from '../../models/response/colaborador/ColaboradorResponse';
import { Util } from 'src/app/modules/utils/Util';
import { Mask } from 'src/app/modules/utils/Mask';

@Component({
  selector: 'app-dados-pessoais',
  templateUrl: './dados-pessoais.component.html',
  styleUrls: ['../new.component.scss'],
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
export class DadosPessoaisComponent {

  constructor(private formBuilder: FormBuilder,
    private brasilApiService: BrasilApiService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private ref: ChangeDetectorRef) { }

  // Validations colaborador
  protected inputLengthCpfCnpj: number = 14;
  protected inputPatternCpfCnpj: any = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;

  // Validations telefone
  protected inputLengthPrefixo: number = 2;
  private inputPrefixoPattern: any = /^\d{2}/;
  protected inputLengthTelefone: number;
  private inputTelefonePattern: any;

  // Variaveis endereço
  estadosResponse: EstadosResponse[];
  dataListCidade: string[];
  estadosOptions: SelectOption[];
  municipiosResponse: MunicipiosResponse[];

  @ViewChild('inputNumero') inputNumero: CustomInputComponent;
  @ViewChild('inputNome') inputNome: CustomInputComponent;

  // Subscriptions
  private obtemTodosEstadosBrasileirosSubscription$: Subscription;
  private getEnderecoPeloCepSubscription$: Subscription;
  private obtemTodosMunicipiosPorEstadoSubscription$: Subscription;

  protected dadosColaborador: FormGroup = this.createForm();
  @Output() emissorDeDadosPessoaisDoColaborador = new EventEmitter<FormGroup>();

  dadosColaboradorSubscribe$: Subscription = this.dadosColaborador.valueChanges.pipe(
    debounceTime(500)
  ).subscribe({
    next: () => {
      this.emissorDeDadosPessoaisDoColaborador.emit(this.dadosColaborador);
    }
  })

  @Input() stepAtual: number;
  @Input() setupDadosAtualizacao: ColaboradorResponse;

  ngOnChanges(changes: SimpleChanges): void {
    let setupDadosAtualizacao = changes['setupDadosAtualizacao'];
    if (Util.isNotObjectEmpty(setupDadosAtualizacao)) {
      if (Util.isNotObjectEmpty(setupDadosAtualizacao.currentValue)) {
        this.realizaSetupDados(setupDadosAtualizacao.currentValue);
      }
    }

    if (Util.isNotObjectEmpty(changes['stepAtual'])) {
      if (this.stepAtual == 0 && !changes['stepAtual'].isFirstChange()) {
        setTimeout(() => {
          this.inputNome.acionaFoco();
        }, 300);
      }
    }
  }

  ngAfterViewInit(): void {
    this.ref.detectChanges();
    this.obtemTodosEstadosBrasileiros();
    this.emissorDeDadosPessoaisDoColaborador.emit(this.dadosColaborador);
    this.inputNome.acionaFoco();
  }

  ngOnDestroy(): void {
    if (this.obtemTodosEstadosBrasileirosSubscription$ != undefined) this.obtemTodosEstadosBrasileirosSubscription$.unsubscribe();
    if (this.getEnderecoPeloCepSubscription$ != undefined) this.getEnderecoPeloCepSubscription$.unsubscribe();
    if (this.obtemTodosMunicipiosPorEstadoSubscription$ != undefined) this.obtemTodosMunicipiosPorEstadoSubscription$.unsubscribe();
    if (this.dadosColaboradorSubscribe$ != undefined) this.dadosColaboradorSubscribe$.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      nome: ['', [Validators.required, Validators.maxLength(50)]],
      cpfCnpj: ['', [Validators.pattern(this.inputPatternCpfCnpj), Validators.maxLength(this.inputLengthCpfCnpj), Validators.minLength(this.inputLengthCpfCnpj)]],
      email: ['', [Validators.email, Validators.maxLength(50)]],
      dataNascimento: [''],
      tipoTelefone: [''],
      prefixo: [{ value: '', disabled: true }],
      numeroTelefone: [{ value: '', disabled: true }],
      logradouro: [''],
      numero: [null],
      bairro: ['', Validators.maxLength(50)],
      codigoPostal:
        ['',
          [
            Validators.minLength(9),
            Validators.maxLength(9),
            Validators.pattern(/^\d{5}\-\d{3}$/)
          ]
        ],
      cidade: ['', Validators.maxLength(50)],
      complemento: ['', Validators.maxLength(80)],
      estado: ['', Validators.maxLength(50)]
    });
  }

  protected getValueAtributoDadosColaborador(atributo: string): any {
    return this.dadosColaborador.controls[atributo].value;
  }

  protected setValueParaAtributoDadosColaborador(atributo: string, valor: any) {
    this.dadosColaborador.controls[atributo].setValue(valor);
  }

  // CPFCNPJ
  protected defineIconeInputCpfCnpj() {
    if (this.dadosColaborador.controls['cpfCnpj'].touched && this.dadosColaborador.controls['cpfCnpj'].invalid) {
      return 'error';
    }
    else {
      if (this.dadosColaborador.controls['cpfCnpj'].value == '' || this.dadosColaborador.controls['cpfCnpj'].value == null) return 'badge';
      else return 'check';
    }
  }

  realizaTratamentoCpfCnpj(tecla) {
    if (tecla?.inputType != 'deleteContentBackward' || tecla == null)
      this.setValueParaAtributoDadosColaborador('cpfCnpj', Mask.cpfMask(this.getValueAtributoDadosColaborador('cpfCnpj')));
  }

  // EMAIL
  protected defineIconeInputEmail() {
    if (this.dadosColaborador.controls['email'].touched && this.dadosColaborador.controls['email'].invalid) {
      return 'error';
    }
    else {
      if (this.dadosColaborador.controls['email'].value == '' || this.dadosColaborador.controls['email'].value == null) return 'alternate_email';
      else return 'check';
    }
  }

  protected geraOptionsTipoTelefone(): SelectOption[] {
    let options: SelectOption[] = [
      {
        text: 'Sem telefone',
        value: ''
      },
      {
        text: 'Fixo',
        value: 'FIXO'
      },
      {
        text: 'Móvel',
        value: 'MOVEL'
      },
      {
        text: 'Móvel com whatsapp',
        value: 'MOVEL_WHATSAPP'
      }
    ]
    return options;
  }

  protected atualizaValidatorsTelefone() {
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

  protected verificaSeTipoTelefoneNuloOuVazio(): boolean {
    if (this.dadosColaborador.controls['tipoTelefone'].value != null
      && this.dadosColaborador.controls['tipoTelefone'].value != undefined
      && this.dadosColaborador.controls['tipoTelefone'].value != '') {
      return true;
    }
    return false;
  }

  protected realizaTratamentoPrefixo() {
    this.dadosColaborador.controls['prefixo']
      .setValue(this.getValueAtributoDadosColaborador('prefixo')
        .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
        .replace(/[^0-9.]/g, '')
        .trim())
  }

  protected realizaTratamentoNumeroTelefone() {
    this.dadosColaborador.controls['numeroTelefone']
      .setValue(this.getValueAtributoDadosColaborador('numeroTelefone')
        .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
        .replace(/[^0-9.]/g, '')
        .trim())
  }

  protected defineIconeInputTelefone(): string {
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

  protected validaDataNascimento() {
    let dataNascimentoSplitada = (this.dadosColaborador.controls['dataNascimento'].value).split("-");
    if (dataNascimentoSplitada.length == 3) {
      if (parseInt(dataNascimentoSplitada[0]) > 2023 || parseInt(dataNascimentoSplitada[0]) < 1900) {
        this.dadosColaborador.controls['dataNascimento'].setValue('');
        this._snackBar.open("Data de nascimento inválida", "Fechar", {
          duration: 3500
        })
        return;
      }
    }
  }

  protected defineIconeDataNascimento() {
    if (this.dadosColaborador.controls['dataNascimento'].touched && this.dadosColaborador.controls['dataNascimento'].invalid) {
      return 'error';
    }
    else {
      if (this.dadosColaborador.controls['dataNascimento'].value == '' || this.dadosColaborador.controls['dataNascimento'].value == null) return 'calendar_month';
      else return 'check';
    }
  }

  // ENDERECO

  realizaTratamentoCodigoPostal(tecla) {

    if (tecla?.inputType != 'deleteContentBackward' || tecla == null) {
      this.setValueParaAtributoDadosColaborador('codigoPostal', Mask.cepMask(this.getValueAtributoDadosColaborador('codigoPostal')));
    }

    if (this.dadosColaborador.controls['codigoPostal'].valid && this.getValueAtributoDadosColaborador('codigoPostal').length == 9) {
      this.getEnderecoPeloCepSubscription$ =
        this.brasilApiService.getEnderecoPeloCep(this.getValueAtributoDadosColaborador('codigoPostal').replace('-', '')).subscribe({
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

  protected realizaTratamentoNumero() {
    this.atualizaValidatorsEndereco();
    this.dadosColaborador.controls['numero']
      .setValue(this.getValueAtributoDadosColaborador('numero')
        .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
        .replace(/[^0-9.]/g, '')
        .trim())
  }

  protected atualizaValidatorsEndereco() {
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

  protected geraOptionsEstado() {
    let options: SelectOption[] = [
      {
        text: '',
        value: ''
      },
    ]

    this.estadosResponse.forEach(estado => {
      options.push({
        text: (estado.sigla + ' - ' + estado.nome).toUpperCase(),
        value: estado.sigla
      })
    })

    this.estadosOptions = options;
  }

  protected geraDataListCidade() {
    let municipiosList: string[] = []
    this.municipiosResponse.forEach(municipio => {
      municipiosList.push(municipio.nome);
    })

    this.dataListCidade = municipiosList;
  }

  protected obtemTodosEstadosBrasileiros() {
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
          this.geraOptionsEstado();
          console.log("Estados carregados com sucesso");
        }
      });
  }

  protected setaEnderecoComInformacoesObtidasPeloCep(consultaCepResponse: ConsultaCepResponse) {
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

    this.inputNumero.acionaFoco();

    this.obtemTodosMunicipiosPorEstado();
  }

  protected obtemTodosMunicipiosPorEstado() {
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
          complete: () => {
            console.log('Obtenção de municípios por estado realizada com sucesso')
            this.geraDataListCidade();
          }
        })
    }
    else {
      this.municipiosResponse = [];
    }
  }

  realizaSetupDados(colaborador: ColaboradorResponse) {
    this.dadosColaborador.setValue({
      nome: colaborador.nome,
      cpfCnpj: colaborador.cpfCnpj,
      email: colaborador.email,
      dataNascimento: colaborador.dataNascimento,
      tipoTelefone: Util.isObjectEmpty(colaborador.telefone) ? '' : colaborador.telefone.tipoTelefone,
      prefixo: Util.isObjectEmpty(colaborador.telefone) ? '' : colaborador.telefone.prefixo,
      numeroTelefone: Util.isObjectEmpty(colaborador.telefone) ? '' : colaborador.telefone.numero,
      logradouro: Util.isObjectEmpty(colaborador.endereco) ? '' : colaborador.endereco.logradouro,
      numero: Util.isObjectEmpty(colaborador.endereco) ? null : colaborador.endereco.numero,
      bairro: Util.isObjectEmpty(colaborador.endereco) ? '' : colaborador.endereco.bairro,
      codigoPostal: Util.isObjectEmpty(colaborador.endereco) ? '' : colaborador.endereco.codigoPostal,
      cidade: Util.isObjectEmpty(colaborador.endereco) ? '' : colaborador.endereco.cidade,
      complemento: Util.isObjectEmpty(colaborador.endereco) ? '' : colaborador.endereco.complemento,
      estado: Util.isObjectEmpty(colaborador.endereco) ? '' : colaborador.endereco.estado,
    })

    this.setupAtualizaValidatorsTelefone();
    this.atualizaValidatorsEndereco();

  }

  protected setupAtualizaValidatorsTelefone() {
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

  protected retornaParaVisualizacao() {
    this.router.navigate(['/colaboradores'])
  }

  protected avancaProximaEtapa() {
    if (this.dadosColaborador.invalid) {
      this.dadosColaborador.markAllAsTouched();
      this._snackBar.open('Ops! Algum campo está incorreto. Revise o formulário e tente novamente.', "Fechar", {
        duration: 3500
      })
    }
  }

}
