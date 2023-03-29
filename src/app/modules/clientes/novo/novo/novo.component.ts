import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cliente } from '../models/cliente';

@Component({
  selector: 'app-novo',
  templateUrl: './novo.component.html',
  styleUrls: ['./novo.component.scss']
})
export class NovoComponent implements OnInit {

  dadosCliente: FormGroup;
  dadosTelefone: FormGroup;
  dadosEndereco: FormGroup;

  minDate: Date;
  maxDate: Date;

  inputLengthCpfCnpj: number = 11;
  inputPatternCpfCnpj: any = /^[0-9]{3}.?[0-9]{3}.?[0-9]{3}-?[0-9]{2}/;

  inputLengthPrefixo: number = 2;
  inputPrefixoPattern: any = /^[0-9]{2}/;
  inputLengthTelefone: number;
  inputTelefonePattern: any;

  cliente: Cliente = new Cliente();

  ngOnInit(): void {
    this.inicializarCliente();
    this.createForm();
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(1920, 0, 1);
    this.maxDate = new Date(currentYear, 0, 1);
    this.atualizaTipoPessoa();
    this.atualizaValidatorsTelefone();
  }

  inicializarCliente() {
    this.cliente = {
      nome: '', tipoPessoa: 'FISICA', cpfCnpj: '', inscricaoEstadual: '', email: '', dataNascimento: '', status: 'COMUM',
      telefone: { tipoTelefone: '', prefixo: null, numero: null }
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
      thirdCtrl: ['', Validators.required],
    });
  }

  constructor(private formBuilder: FormBuilder) { }

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

  realizaTratamentoCpfCnpj() {
    console.log(this.dadosCliente.controls);
    this.cliente.cpfCnpj = this.cliente.cpfCnpj
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;'":*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim();
  }

  realizaTratamentoInscricaoEstadual() {
    this.cliente.inscricaoEstadual = this.cliente.inscricaoEstadual
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;'":*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim();
  }

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

}
