import { Subscription, debounceTime } from 'rxjs';
import { ChangeDetectorRef, Component, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BrasilApiService } from 'src/app/shared/services/brasil-api.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectOption } from 'src/app/modules/shared/inputs/models/select-option';
import { EstadosResponse } from 'src/app/shared/models/brasil-api/estados-response';
import { MunicipiosResponse } from 'src/app/shared/models/brasil-api/municipios-response';
import { ConsultaCepResponse } from 'src/app/shared/models/brasil-api/consulta-cep-response';
import { CustomInputComponent } from 'src/app/modules/shared/inputs/custom-input/custom-input.component';
import { Util } from 'src/app/modules/utils/Util';
import { EnderecoResponse } from 'src/app/shared/models/endereco/response/EnderecoResponse';
import { Mask } from 'src/app/modules/utils/Mask';

@Component({
  selector: 'app-dados-endereco',
  templateUrl: './dados-endereco.component.html',
  styleUrls: ['../new.component.scss']
})
export class DadosEnderecoComponent {

  constructor(private formBuilder: FormBuilder,
    private brasilApiService: BrasilApiService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private ref: ChangeDetectorRef) { }

  // Subscriptions
  obtemTodosEstadosBrasileirosSubscription$: Subscription;
  getEnderecoPeloCepSubscription$: Subscription;
  obtemTodosMunicipiosPorEstadoSubscription$: Subscription;

  // Variaveis endereço
  estadosResponse: EstadosResponse[];
  municipiosResponse: MunicipiosResponse[];
  estadosOptions: SelectOption[];
  dataListCidade: string[];

  // Tags html
  @ViewChild('inputCodigoPostal') inputCodigoPostal: CustomInputComponent;
  @ViewChild('inputNumero') inputNumero: CustomInputComponent;

  @Input() stepAtual: number;
  @Input() enderecoEncontradoNoCnpj: EnderecoResponse;
  @Input() setupEnderecoAtualizacao: EnderecoResponse = null;

  @Output() emissorDeSolicitacaoDeEnvioDeFormulario = new EventEmitter();
  @Output() emissorDeEstados = new EventEmitter();

  protected dadosEndereco: FormGroup = this.createFormDadosEndereco();
  @Output() emissorDeDadosDeEnderecoDoCliente = new EventEmitter<FormGroup>();

  dadosEnderecoSubscribe$: Subscription = this.dadosEndereco.valueChanges.pipe(
    debounceTime(500)
  ).subscribe({
    next: () => {
      this.atualizaValidatorsEndereco();
    },
    complete: () => {
      this.emissorDeDadosDeEnderecoDoCliente.emit(this.dadosEndereco);
    }
  })

  ngAfterViewInit(): void {
    this.ref.detectChanges();
    this.obtemTodosEstadosBrasileiros();
    this.emissorDeDadosDeEnderecoDoCliente.emit(this.dadosEndereco);
  }

  ngOnChanges(changes: SimpleChanges): void {
    let setupEnderecoAtualizacao = changes['setupEnderecoAtualizacao'];
    if (Util.isNotObjectEmpty(setupEnderecoAtualizacao)) {
      if (Util.isNotObjectEmpty(setupEnderecoAtualizacao.currentValue)) this.realizaSetupEndereco(setupEnderecoAtualizacao.currentValue);
    }

    if (this.stepAtual == 2) {
      setTimeout(() => {
        this.inputCodigoPostal.acionaFoco();
      }, 300);
    }
    if (changes['enderecoEncontradoNoCnpj'] != undefined) {
      let endereco: EnderecoResponse = changes['enderecoEncontradoNoCnpj'].currentValue;
      if (endereco != undefined) {
        this.atualizaEnderecoComValoresEncontradosPeloCnpj(endereco);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.dadosEnderecoSubscribe$ != undefined) this.dadosEnderecoSubscribe$.unsubscribe();
    if (this.obtemTodosEstadosBrasileirosSubscription$ != undefined) this.obtemTodosEstadosBrasileirosSubscription$.unsubscribe();
    if (this.getEnderecoPeloCepSubscription$ != undefined) this.getEnderecoPeloCepSubscription$.unsubscribe();
    if (this.obtemTodosMunicipiosPorEstadoSubscription$ != undefined) this.obtemTodosMunicipiosPorEstadoSubscription$.unsubscribe();
  }

  createFormDadosEndereco(): FormGroup {
    return this.formBuilder.group({
      logradouro: new FormControl(
        {
          value: '',
          disabled: false
        },
      ),
      numero: new FormControl(
        {
          value: '',
          disabled: false
        },
      ),
      bairro: new FormControl(
        {
          value: '',
          disabled: false
        },
        [
          Validators.maxLength(50)
        ]
      ),
      codigoPostal: new FormControl(
        {
          value: '',
          disabled: false
        },
        [
          Validators.maxLength(9),
          Validators.pattern(/^\d{5}\-\d{3}$/)
        ]
      ),
      cidade: new FormControl(
        {
          value: '',
          disabled: false
        },
        [
          Validators.maxLength(50)
        ]
      ),
      complemento: new FormControl(
        {
          value: '',
          disabled: false
        },
        [
          Validators.maxLength(50)
        ]
      ),
      estado: new FormControl(
        {
          value: '',
          disabled: false
        },
        [
          Validators.maxLength(50)
        ]
      ),
    });
  }

  protected getValueAtributoDadosEndereco(atributo: string): any {
    return this.dadosEndereco.controls[atributo].value;
  }

  protected setValueParaAtributoDadosEndereco(atributo: string, valor: any) {
    this.dadosEndereco.controls[atributo].setValue(valor);
  }

  // Geradores de Select options
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

  private verificaSeAlgumCampoEstaPreenchido(): boolean {
    if (Object.keys(this.dadosEndereco.value).some(k => !!this.dadosEndereco.value[k])) return true;
    return false;
  }

  atualizaValidatorsEndereco() {
    if (this.verificaSeAlgumCampoEstaPreenchido()) {
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

  protected obtemTodosEstadosBrasileiros() {
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
          this.geraOptionsEstado();
          this.emissorDeEstados.emit(this.estadosResponse);
          console.log("Estados carregados com sucesso");
        }
      });
  }

  realizaTratamentoCodigoPostal(tecla) {

    if (tecla?.inputType != 'deleteContentBackward' || tecla == null) {
      this.setValueParaAtributoDadosEndereco('codigoPostal', Mask.cepMask(this.getValueAtributoDadosEndereco('codigoPostal')));
    }

    if (this.dadosEndereco.controls['codigoPostal'].valid && this.getValueAtributoDadosEndereco('codigoPostal').length == 9) {
      this.getEnderecoPeloCepSubscription$ =
        this.brasilApiService.getEnderecoPeloCep(this.getValueAtributoDadosEndereco('codigoPostal').replace('-', '')).subscribe({
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
    this.dadosEndereco.setValue({
      codigoPostal: this.getValueAtributoDadosEndereco('codigoPostal'),
      logradouro: consultaCepResponse.logradouro,
      numero: '',
      bairro: consultaCepResponse.bairro,
      estado: consultaCepResponse.estado,
      cidade: consultaCepResponse.cidade,
      complemento: ''
    })

    this.dadosEndereco.markAllAsTouched();
    this.inputNumero.acionaFoco();
    this.obtemTodosMunicipiosPorEstado();
  }

  protected obtemTodosMunicipiosPorEstado() {

    if (Util.isNotEmptyString(this.getValueAtributoDadosEndereco('estado'))) {
      this.obtemTodosMunicipiosPorEstadoSubscription$ =
        this.brasilApiService.obtemTodosMunicipiosPorEstado(this.getValueAtributoDadosEndereco('estado')).subscribe({
          next: resposta => this.municipiosResponse = resposta,
          error: error => {
            this._snackBar.open(error, 'Fechar', {
              duration: 3500
            })
          },
          complete: () => {
            this.geraDataListCidade();
            console.log('Obtenção de municípios por estado realizada com sucesso')
          }
        })
    }
    else {
      this.municipiosResponse = [];
    }
  }

  private atualizaEnderecoComValoresEncontradosPeloCnpj(endereco: EnderecoResponse) {
    this.dadosEndereco.setValue({
      codigoPostal: (Util.isNotEmptyString(endereco.codigoPostal)) ? endereco.codigoPostal : this.getValueAtributoDadosEndereco('codigoPostal'),
      logradouro: (Util.isNotEmptyString(endereco.logradouro)) ? endereco.logradouro : this.getValueAtributoDadosEndereco('logradouro'),
      numero: (Util.isNotEmptyNumber(endereco.numero)) ? endereco.numero : this.getValueAtributoDadosEndereco('numero'),
      bairro: (Util.isNotEmptyString(endereco.bairro)) ? endereco.bairro : this.getValueAtributoDadosEndereco('bairro'),
      estado: (Util.isNotEmptyString(endereco.estado)) ? endereco.estado : this.getValueAtributoDadosEndereco('estado'),
      cidade: (Util.isNotEmptyString(endereco.cidade)) ? endereco.cidade : this.getValueAtributoDadosEndereco('cidade'),
      complemento: (Util.isNotEmptyString(endereco.complemento)) ? endereco.complemento : this.getValueAtributoDadosEndereco('complemento'),
    })

    if (Util.isNotEmptyString(endereco.estado)) this.obtemTodosMunicipiosPorEstado();

    this.dadosEndereco.markAllAsTouched();
  }

  protected realizaTratamentoNumero() {
    this.dadosEndereco.controls['numero']
      .setValue(this.getValueAtributoDadosEndereco('numero')
        .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
        .replace(/[^0-9.]/g, '')
        .trim())
  }

  protected realizaSetupEndereco(endereco: EnderecoResponse) {
    this.dadosEndereco.setValue({
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      bairro: endereco.bairro,
      codigoPostal: endereco.codigoPostal,
      cidade: endereco.cidade,
      complemento: endereco.complemento,
      estado: endereco.estado,
    })
    this.atualizaValidatorsEndereco();
  }

  protected solicitarEnvioDeFormulario() {
    if (this.dadosEndereco.valid) this.emissorDeSolicitacaoDeEnvioDeFormulario.emit();
    else {
      this.dadosEndereco.markAllAsTouched();
      this._snackBar.open('Ops! Algum campo está incorreto. Revise o formulário e tente novamente.', "Fechar", {
        duration: 3500
      })
    }
  }


}
