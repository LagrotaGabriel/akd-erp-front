import { CnpjResponse } from './../../../../shared/models/brasil-api/cnpj-response';
import { ConsultaCepResponse } from '../../../../shared/models/brasil-api/consulta-cep-response';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cliente } from '../models/cliente';
import { HttpErrorResponse } from '@angular/common/http';
import { BrasilApiService } from '../services/brasil-api.service';
import { EstadosResponse } from '../../../../shared/models/brasil-api/estados-response';
import { MunicipiosResponse } from '../../../../shared/models/brasil-api/municipios-response';

@Component({
  selector: 'app-novo',
  templateUrl: './novo.component.html',
  styleUrls: ['./novo.component.scss']
})
export class NovoComponent implements OnInit {

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

  cliente: Cliente = new Cliente();

  // Variaveis endereço
  estadosResponse: EstadosResponse[];
  municipiosResponse: MunicipiosResponse[];

  ngOnInit(): void {
    this.inicializarCliente();
    this.createForm();
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(1920, 0, 1);
    this.maxDate = new Date(currentYear, 0, 1);
    setTimeout(() => {
      this.atualizaTipoPessoa();
      this.atualizaValidatorsTelefone();
      this.obtemTodosEstadosBrasileiros();
    }, 0);
  }

  inicializarCliente() {
    this.cliente = {
      nome: '',
      tipoPessoa: 'FISICA',
      cpfCnpj: '',
      inscricaoEstadual: '',
      email: '',
      dataNascimento: '',
      status: 'COMUM',
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
      status: ['', Validators.required]
    });
    this.dadosTelefone = this.formBuilder.group({
      tipoTelefone: [''],
      prefixo: ['', [Validators.minLength(this.inputLengthPrefixo), Validators.maxLength(this.inputLengthPrefixo), Validators.pattern(this.inputPrefixoPattern)]],
      numero: [''],
    });
    this.dadosEndereco = this.formBuilder.group({
      logradouro: [''],
      numero: [''],
      bairro: [''],
      codigoPostal: [''],
      cidade: [''],
      complemento: [''],
      estado: ['']
    });
  }

  constructor(private formBuilder: FormBuilder, private brasilApiService: BrasilApiService) { }

  atualizaTipoPessoa() {
    if (this.cliente.tipoPessoa == 'FISICA') {
      this.inputLengthCpfCnpj = 11;
      this.inputPatternCpfCnpj = /^[0-9]{3}.?[0-9]{3}.?[0-9]{3}-?[0-9]{2}/;
      this.dadosCliente.controls['inscricaoEstadual'].disable();
    }
    else if (this.cliente.tipoPessoa == 'JURIDICA') {
      this.inputLengthCpfCnpj = 14;
      this.inputPatternCpfCnpj = /^[0-9]{2}[0-9]{3}[0-9]{3}[0-9]{4}[0-9]{2}/
      this.dadosCliente.controls['inscricaoEstadual'].enable();
    }
    this.dadosCliente.controls['cpfCnpj'].setValidators([Validators.maxLength(this.inputLengthCpfCnpj),
    Validators.minLength(this.inputLengthCpfCnpj), Validators.pattern(this.inputPatternCpfCnpj)]);

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
    if (this.cliente.tipoPessoa == 'JURIDICA' && this.cliente.cpfCnpj.length == 14 && this.dadosCliente.controls['cpfCnpj'].valid) {
      this.brasilApiService.obtemDadosClientePeloCnpj(this.cliente.cpfCnpj).subscribe(
        (res: CnpjResponse) => {
          this.setaClienteComInformacoesObtidasPeloCnpj(res);
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      )
    }
  }

  setaClienteComInformacoesObtidasPeloCnpj(cnpjResponse: CnpjResponse) {
    console.log(cnpjResponse);
    // Dados
    this.cliente.nome = cnpjResponse.nome_fantasia != null && cnpjResponse.nome_fantasia != ''
      ? cnpjResponse.nome_fantasia : this.cliente.nome;

    this.cliente.email = cnpjResponse.email != null && cnpjResponse.email != ''
      ? cnpjResponse.nome_fantasia : this.cliente.email;

    // Telefone
    if (cnpjResponse.ddd_telefone_1 != null && cnpjResponse.ddd_telefone_1 != '') {
      this.cliente.telefone.tipoTelefone = cnpjResponse.ddd_telefone_1.length == 10 
        ? this.cliente.telefone.tipoTelefone = 'FIXO' : this.cliente.telefone.tipoTelefone = 'MOVEL'
      this.atualizaValidatorsTelefone();
      this.cliente.telefone.prefixo = cnpjResponse.ddd_telefone_1.slice(0,2);
      this.cliente.telefone.numero = cnpjResponse.ddd_telefone_1.slice(2);
    }

    // Endereço
    this.cliente.endereco.logradouro = cnpjResponse.logradouro != null && cnpjResponse.logradouro != ''
      ? cnpjResponse.logradouro : this.cliente.endereco.logradouro;

    this.cliente.endereco.numero = cnpjResponse.numero != null && cnpjResponse.numero != ''
      ? parseInt(cnpjResponse.numero) : this.cliente.endereco.numero;

    this.cliente.endereco.bairro = cnpjResponse.bairro != null && cnpjResponse.bairro != ''
      ? cnpjResponse.bairro : this.cliente.endereco.bairro;

    this.cliente.endereco.cidade = cnpjResponse.municipio != null && cnpjResponse.municipio != ''
      ? cnpjResponse.municipio : this.cliente.endereco.cidade;

    this.cliente.endereco.codigoPostal = cnpjResponse.cep != null
      ? (cnpjResponse.cep).toString() : this.cliente.endereco.codigoPostal;

    this.cliente.endereco.estado = cnpjResponse.uf != null && cnpjResponse.uf != ''
      ? cnpjResponse.uf : this.cliente.endereco.estado;

    this.cliente.endereco.complemento = cnpjResponse.complemento != null && cnpjResponse.complemento != ''
      ? cnpjResponse.complemento : this.cliente.endereco.complemento;

  }

  realizaTratamentoInscricaoEstadual() {
    this.cliente.inscricaoEstadual = this.cliente.inscricaoEstadual
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;'":*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim();
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
  obtemTodosEstadosBrasileiros() {
    this.brasilApiService.getTodosEstados().subscribe(
      (res: EstadosResponse[]) => {
        res.sort((x, y) => x.sigla.localeCompare(y.sigla))
        this.estadosResponse = res;
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
  }

  realizaTratamentoCodigoPostal() {
    this.cliente.telefone.numero = this.cliente.telefone.numero
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;'":*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim();
    if (this.dadosEndereco.controls['codigoPostal'].valid && this.cliente.endereco.codigoPostal.length == 8) {
      this.brasilApiService.getEnderecoPeloCep(this.cliente.endereco.codigoPostal).subscribe(
        (res: ConsultaCepResponse) => {
          this.setaEnderecoComInformacoesObtidasPeloCep(res);
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      );
    }
  }

  setaEnderecoComInformacoesObtidasPeloCep(consultaCepResponse: ConsultaCepResponse) {
    this.cliente.endereco.logradouro = consultaCepResponse.street;
    this.cliente.endereco.bairro = consultaCepResponse.neighborhood;
    this.cliente.endereco.estado = consultaCepResponse.state;
    this.cliente.endereco.cidade = consultaCepResponse.city;
    this.obtemTodosMunicipiosPorEstado();
  }

  public obtemTodosMunicipiosPorEstado() {
    this.brasilApiService.obtemTodosMunicipiosPorEstado(this.cliente.endereco.estado).subscribe(
      (res: MunicipiosResponse[]) => {
        this.municipiosResponse = res;
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

}
