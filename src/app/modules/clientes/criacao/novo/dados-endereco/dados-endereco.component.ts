import { Subscription, debounceTime } from 'rxjs';
import { ChangeDetectorRef, Component, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrasilApiService } from 'src/app/shared/services/brasil-api.service';
import { ClienteService } from '../../../services/cliente.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { SelectOption } from 'src/app/modules/shared/inputs/models/select-option';
import { EstadosResponse } from 'src/app/shared/models/brasil-api/estados-response';
import { MunicipiosResponse } from 'src/app/shared/models/brasil-api/municipios-response';
import { ConsultaCepResponse } from 'src/app/shared/models/brasil-api/consulta-cep-response';
import { CustomInputComponent } from 'src/app/modules/shared/inputs/custom-input/custom-input.component';

@Component({
  selector: 'app-dados-endereco',
  templateUrl: './dados-endereco.component.html',
  styleUrls: ['./dados-endereco.component.scss']
})
export class DadosEnderecoComponent {

  constructor(private formBuilder: FormBuilder,
    private brasilApiService: BrasilApiService,
    private clienteService: ClienteService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private datePipe: DatePipe,
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

  @Input() stepAtual: number;

  @Output() emissorDeSolicitacaoDeEnvioDeFormulario = new EventEmitter();

  protected dadosEndereco: FormGroup = this.createFormDadosEndereco();
  @Output() emissorDeDadosDeEnderecoDoCliente = new EventEmitter<FormGroup>();

  dadosEnderecoSubscribe$: Subscription = this.dadosEndereco.valueChanges.pipe(
    debounceTime(500)
  ).subscribe({
    next: () => {
      this.emissorDeDadosDeEnderecoDoCliente.emit(this.dadosEndereco);
    }
  })

  ngAfterViewInit(): void {
    this.ref.detectChanges();
    this.emissorDeDadosDeEnderecoDoCliente.emit(this.dadosEndereco);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.stepAtual == 2) {
      setTimeout(() => {
        this.inputCodigoPostal.acionaFoco();
      }, 300);
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
      logradouro: [''],
      numero: [null],
      bairro: ['', Validators.maxLength(50)],
      codigoPostal: ['', [Validators.maxLength(8), Validators.pattern(/^\d{5}\d{3}/)]],
      cidade: ['', Validators.maxLength(50)],
      complemento: ['', Validators.maxLength(80)],
      estado: ['', Validators.maxLength(50)]
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
    //TODO Arrumar markastouched
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

    //TODO Arrumar
    //this.inputNumeroEndereco.nativeElement.focus();

    this.obtemTodosMunicipiosPorEstado();
  }

  protected obtemTodosMunicipiosPorEstado() {
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

  protected realizaTratamentoNumero() {
    this.atualizaValidatorsEndereco();
    this.dadosEndereco.controls['numero']
      .setValue(this.getValueAtributoDadosEndereco('numero')
        .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
        .replace(/[^0-9.]/g, '')
        .trim())
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
