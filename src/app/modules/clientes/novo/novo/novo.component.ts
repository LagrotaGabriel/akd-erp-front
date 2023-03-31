import { ClienteService } from './../../services/cliente.service';
import { CnpjResponse } from './../../../../shared/models/brasil-api/cnpj-response';
import { ConsultaCepResponse } from '../../../../shared/models/brasil-api/consulta-cep-response';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cliente } from '../models/cliente';
import { BrasilApiService } from '../services/brasil-api.service';
import { EstadosResponse } from '../../../../shared/models/brasil-api/estados-response';
import { MunicipiosResponse } from '../../../../shared/models/brasil-api/municipios-response';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-novo',
  templateUrl: './novo.component.html',
  styleUrls: ['./novo.component.scss']
})
export class NovoComponent implements OnInit, OnDestroy {

  // Subscriptions
  validaDuplicidadeCpfCnpjSubscription$: Subscription;
  obtemDadosClientePeloCnpjSubscription$: Subscription;
  validaDuplicidadeInscricaoEstadualSubscription$: Subscription;
  obtemTodosEstadosBrasileirosSubscription$: Subscription;
  getEnderecoPeloCepSubscription$: Subscription;
  obtemTodosMunicipiosPorEstadoSubscription$: Subscription;
  novoClienteSubscription$: Subscription;

  // Form groups
  dadosCliente: FormGroup;
  dadosTelefone: FormGroup;
  dadosEndereco: FormGroup;

  // Variáveis data de nascimento
  minDate: Date;
  maxDate: Date;

  // Validations cliente
  inputLengthCpfCnpj: number = 11;
  inputPatternCpfCnpj: any = /^[0-9]{3}.?[0-9]{3}.?[0-9]{3}-?[0-9]{2}/;

  // Validations telefone
  inputLengthPrefixo: number = 2;
  inputPrefixoPattern: any = /^[0-9]{2}/;
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

  ngOnInit(): void {
    this.inicializarCliente();
    this.createForm();

    const currentYear = new Date().getFullYear();
    this.minDate = new Date(1920, 0, 1);
    this.maxDate = new Date(currentYear, 0, 1);

    this.atualizaTipoPessoa();
    this.atualizaValidatorsTelefone();
    this.obtemTodosEstadosBrasileiros();

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

  inicializarCliente() {
    this.cliente = {
      nome: '',
      tipoPessoa: 'FISICA',
      cpfCnpj: '',
      inscricaoEstadual: '',
      email: '',
      dataNascimento: '',
      statusCliente: 'COMUM',
      telefone: {
        tipoTelefone: '',
        prefixo: null,
        numero: null
      },
      endereco: {
        logradouro: '',
        numero: null,
        bairro: '',
        codigoPostal: '',
        cidade: '',
        complemento: '',
        estado: ''
      },
    }
  }

  createForm() {
    this.dadosCliente = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      tipoPessoa: ['', Validators.required],
      cpfCnpj: ['', [Validators.pattern(this.inputPatternCpfCnpj), Validators.maxLength(this.inputLengthCpfCnpj), Validators.minLength(this.inputLengthCpfCnpj)]],
      inscricaoEstadual: ['', [Validators.pattern(/^[0-9]{12}/), Validators.maxLength(12), Validators.minLength(12)]],
      email: ['', [Validators.email, Validators.maxLength(50)]],
      dataNascimento: [''],
      statusCliente: ['', Validators.required]
    });
    this.dadosTelefone = this.formBuilder.group({
      tipoTelefone: [''],
      prefixo: ['', [Validators.minLength(this.inputLengthPrefixo), Validators.maxLength(this.inputLengthPrefixo), Validators.pattern(this.inputPrefixoPattern)]],
      numero: [''],
    });
    this.dadosEndereco = this.formBuilder.group({
      logradouro: [''],
      numero: [''],
      bairro: ['', Validators.maxLength(50)],
      codigoPostal: ['', [Validators.maxLength(8), Validators.pattern(/^[0-9]{5}[0-9]{3}/)]],
      cidade: ['', Validators.maxLength(50)],
      complemento: ['', Validators.maxLength(50)],
      estado: ['', Validators.maxLength(50)]
    });
  }

  constructor(private formBuilder: FormBuilder,
    private brasilApiService: BrasilApiService,
    private clienteService: ClienteService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private datePipe: DatePipe) { }

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

  atualizaTipoPessoa() {

    if (this.cliente.tipoPessoa == 'FISICA') {
      this.inputLengthCpfCnpj = 11;
      this.inputPatternCpfCnpj = /^[0-9]{3}.?[0-9]{3}.?[0-9]{3}-?[0-9]{2}/;
      this.dadosCliente.controls['inscricaoEstadual'].disable();
      this.dadosCliente.controls['dataNascimento'].enable();
    }
    else if (this.cliente.tipoPessoa == 'JURIDICA') {
      this.inputLengthCpfCnpj = 14;
      this.inputPatternCpfCnpj = /^[0-9]{2}[0-9]{3}[0-9]{3}[0-9]{4}[0-9]{2}/
      this.dadosCliente.controls['inscricaoEstadual'].enable();
      this.dadosCliente.controls['dataNascimento'].disable();
    }
    this.dadosCliente.controls['cpfCnpj'].setValidators([Validators.maxLength(this.inputLengthCpfCnpj),
    Validators.minLength(this.inputLengthCpfCnpj), Validators.pattern(this.inputPatternCpfCnpj)]);

    this.cliente.dataNascimento = '';
    this.dadosCliente.controls['dataNascimento'].reset();

    this.cliente.inscricaoEstadual = '';
    this.dadosCliente.controls['inscricaoEstadual'].reset();

    this.cliente.cpfCnpj = '';
    this.dadosCliente.controls['cpfCnpj'].reset();
  }

  atualizaValidatorsTelefone() {
    this.cliente.telefone.prefixo = '';
    this.dadosTelefone.controls['prefixo'].reset();

    this.cliente.telefone.numero = '';
    this.dadosTelefone.controls['numero'].reset();

    this.dadosTelefone.controls['prefixo'].clearValidators();
    this.dadosTelefone.controls['numero'].clearValidators();

    if (this.cliente.telefone.tipoTelefone != '' && this.cliente.telefone.tipoTelefone != null) {

      this.dadosTelefone.controls['prefixo'].enable();
      this.dadosTelefone.controls['numero'].enable();

      if (this.cliente.telefone.tipoTelefone == 'FIXO') {
        this.inputLengthTelefone = 8;
        this.inputTelefonePattern = /^[0-9]{4}[0-9]{4}/;
      }

      else if (this.cliente.telefone.tipoTelefone == 'MOVEL' || this.cliente.telefone.tipoTelefone == 'MOVEL_WHATSAPP') {
        this.inputLengthTelefone = 9;
        this.inputTelefonePattern = /^[0-9][0-9]{4}[0-9]{4}/;
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
    this.cliente.cpfCnpj = this.cliente.cpfCnpj
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;'":*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim();
    this.invocaValidacaoDuplicidadeCpfCnpj();
  }

  invocaValidacaoDuplicidadeCpfCnpj() {

    if (this.cliente.tipoPessoa == 'JURIDICA' && this.cliente.cpfCnpj.length == 14 && this.dadosCliente.controls['cpfCnpj'].valid ||
      this.cliente.tipoPessoa == 'FISICA' && this.cliente.cpfCnpj.length == 11 && this.dadosCliente.controls['cpfCnpj'].valid) {

      this.validaDuplicidadeCpfCnpjSubscription$ = this.clienteService.validaDuplicidadeCpfCnpj(this.cliente.cpfCnpj).subscribe({
        error: error => {
          this.cliente.cpfCnpj = '';
          this.dadosCliente.controls['cpfCnpj'].reset();
          this._snackBar.open(error, "Fechar", {
            duration: 3500
          });
        },
        complete: () => {
          if (this.cliente.tipoPessoa == 'JURIDICA') this.obtemDadosDoClientePeloCnpj();
          console.log('Validação de duplicidade de Cpf/Cnpj finalizada com sucesso')
        }
      });

    }

  }

  obtemDadosDoClientePeloCnpj() {
    this.obtemDadosClientePeloCnpjSubscription$ = this.brasilApiService.obtemDadosClientePeloCnpj(this.cliente.cpfCnpj).subscribe({
      next: retornoApi => this.setaClienteComInformacoesObtidasPeloCnpj(retornoApi),
      error: error => {
        this._snackBar.open('Ocorreu um erro na obtenção automatizada das informações do CNPJ', "Fechar", {
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
    // Dados
    if (cnpjResponse.nomeFantasia != null && cnpjResponse.nomeFantasia != '') {
      this.cliente.nome = cnpjResponse.nomeFantasia;
      this.dadosCliente.controls['nome'].markAsTouched();
    }

    if (cnpjResponse.email != null && cnpjResponse.email != '') {
      this.cliente.email = cnpjResponse.email;
      this.dadosCliente.controls['email'].markAsTouched();
    }

    // Telefone
    if (cnpjResponse.telefonePrincipal != null && cnpjResponse.telefonePrincipal != '') {
      if (cnpjResponse.telefonePrincipal.length == 10) {
        this.cliente.telefone.tipoTelefone = 'FIXO';
      }
      else {
        this.cliente.telefone.tipoTelefone = 'MOVEL';
      }
      this.atualizaValidatorsTelefone();
      this.dadosTelefone.controls['tipoTelefone'].markAsTouched();

      this.cliente.telefone.prefixo = cnpjResponse.telefonePrincipal.slice(0, 2);
      this.cliente.telefone.numero = cnpjResponse.telefonePrincipal.slice(2);
      this.dadosTelefone.controls['prefixo'].markAsTouched();
      this.dadosTelefone.controls['numero'].markAsTouched();
    }

    // Endereço
    if (cnpjResponse.logradouro != null && cnpjResponse.logradouro != '') {
      this.cliente.endereco.logradouro = cnpjResponse.logradouro;
      this.dadosEndereco.controls['logradouro'].markAsTouched();
    }

    if (cnpjResponse.numero != null && cnpjResponse.numero != '') {
      this.cliente.endereco.numero = parseInt(cnpjResponse.numero);
      this.dadosEndereco.controls['numero'].markAsTouched();
    }

    if (cnpjResponse.bairro != null && cnpjResponse.bairro != '') {
      this.cliente.endereco.bairro = cnpjResponse.bairro;
      this.dadosEndereco.controls['bairro'].markAsTouched();
    }

    if (cnpjResponse.municipio != null && cnpjResponse.municipio != '') {
      this.cliente.endereco.cidade = cnpjResponse.municipio;
      this.dadosEndereco.controls['cidade'].markAsTouched();
    }

    if (cnpjResponse.cep != null) {
      this.cliente.endereco.codigoPostal = (cnpjResponse.cep).toString();
      this.dadosEndereco.controls['codigoPostal'].markAsTouched();
    }

    if (cnpjResponse.uf != null && cnpjResponse.uf != '') {
      this.cliente.endereco.estado = cnpjResponse.uf;
      this.dadosEndereco.controls['estado'].markAsTouched();
      this.obtemTodosMunicipiosPorEstado();
    }

    if (cnpjResponse.complemento != null && cnpjResponse.complemento != '') {
      this.cliente.endereco.complemento = cnpjResponse.complemento;
      this.dadosEndereco.controls['complemento'].markAsTouched();
    }

  }

  realizaTratamentoInscricaoEstadual() {
    this.cliente.inscricaoEstadual = this.cliente.inscricaoEstadual
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;'":*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim();
    this.invocaValidacaoDuplicidadeInscricaoEstadual();
  }

  invocaValidacaoDuplicidadeInscricaoEstadual() {
    if (this.cliente.inscricaoEstadual.length == 11 && this.dadosCliente.controls['inscricaoEstadual'].valid) {
      this.validaDuplicidadeInscricaoEstadualSubscription$ =
        this.clienteService.validaDuplicidadeInscricaoEstadual(this.cliente.inscricaoEstadual).subscribe({
          error: error => {
            this.cliente.inscricaoEstadual = '';
            this.dadosCliente.controls['inscricaoEstadual'].reset();
            this._snackBar.open(error, "Fechar", {
              duration: 3500
            });
          },
          complete: () => console.log('Validação de duplicidade de inscrição estadual completada com sucesso')
        })
    }
  }

  // TELEFONE
  realizaTratamentoPrefixo() {
    this.cliente.telefone.prefixo = this.cliente.telefone.prefixo
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;'":*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim();
  }

  realizaTratamentoNumeroTelefone() {
    this.cliente.telefone.numero = this.cliente.telefone.numero
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;'":*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim();
  }

  // ENDEREÇO
  atualizaValidatorsEndereco() {
    if (this.cliente.endereco.logradouro != null && this.cliente.endereco.logradouro != '' ||
      this.cliente.endereco.numero != null ||
      this.cliente.endereco.bairro != null && this.cliente.endereco.bairro != '' ||
      this.cliente.endereco.cidade != null && this.cliente.endereco.cidade != '' ||
      this.cliente.endereco.estado != null && this.cliente.endereco.estado != '' ||
      this.cliente.endereco.codigoPostal != null && this.cliente.endereco.codigoPostal != '' ||
      this.cliente.endereco.complemento != null && this.cliente.endereco.complemento != '') {
      this.cliente.endereco.cidade = this.cliente.endereco.cidade.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      this.dadosEndereco.controls['logradouro'].addValidators([Validators.required, Validators.maxLength(50), Validators.minLength(1)]);
      this.dadosEndereco.controls['numero'].addValidators([Validators.required, Validators.max(99999), Validators.min(1), Validators.pattern(/^[0-9]{1,5}$/)]);
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

    this.cliente.endereco.codigoPostal = this.cliente.endereco.codigoPostal
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;'":*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim();

    if (this.dadosEndereco.controls['codigoPostal'].valid && this.cliente.endereco.codigoPostal.length == 8) {
      this.getEnderecoPeloCepSubscription$ =
        this.brasilApiService.getEnderecoPeloCep(this.cliente.endereco.codigoPostal).subscribe({
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
    this.cliente.endereco.logradouro = consultaCepResponse.logradouro;
    this.cliente.endereco.numero = null;
    this.cliente.endereco.bairro = consultaCepResponse.bairro;
    this.cliente.endereco.estado = consultaCepResponse.estado;
    this.cliente.endereco.cidade = consultaCepResponse.cidade;
    this.cliente.endereco.complemento = null;

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
    if (this.cliente.endereco.estado != null && this.cliente.endereco.estado != '') {
      this.obtemTodosMunicipiosPorEstadoSubscription$ =
        this.brasilApiService.obtemTodosMunicipiosPorEstado(this.cliente.endereco.estado).subscribe({
          next: resposta => this.municipiosResponse = resposta,
          error: error => {
            this._snackBar.open(error, 'Fechar', {
              duration: 3500
            })
          },
          complete: () => console.log('Obtenção de municípios por estado realizada com sucesso')
        })
    }
  }

  // SUBMIT

  public enviarFormulario() {
    if (this.cliente.dataNascimento != null && this.cliente.dataNascimento != '')
      this.cliente.dataNascimento = this.datePipe.transform(this.cliente.dataNascimento, "yyyy-MM-dd");

    this.novoClienteSubscription$ =
      this.clienteService.novoCliente(this.cliente).subscribe({
        error: error => {
          this._snackBar.open("Ocorreu um erro ao cadastrar o cliente", "Fechar", {
            duration: 3500
          })
        },
        complete: () => {
          this.router.navigate(['/clientes'])
          console.log("Cliente cadastrado com sucesso");
          this._snackBar.open("Cliente cadastrado com sucesso", "Fechar", {
            duration: 3500
          });
        }
      });
  }

}
