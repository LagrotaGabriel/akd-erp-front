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

  startDate = new Date(1990, 0, 1);
  minDate: Date;
  maxDate: Date;

  inputLengthCpfCnpj:number = 11;
  inputPatternCpfCnpj:any = /^[0-9]{3}.?[0-9]{3}.?[0-9]{3}-?[0-9]{2}/;

  cliente: Cliente = new Cliente();

  ngOnInit(): void {
    this.inicializarCliente();
    this.createForm();
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(1920, 0, 1);
    this.maxDate = new Date(currentYear, 0, 1);
    this.atualizaTipoPessoa();
  }

  inicializarCliente() {
    this.cliente = { nome: '', tipoPessoa: 'FISICA', cpfCnpj: '', inscricaoEstadual: '', email: '', dataNascimento: '', status: 'COMUM' }
  }

  createForm() {
    this.dadosCliente = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      tipoPessoa: ['', Validators.required],
      cpfCnpj: ['', [Validators.pattern(this.inputPatternCpfCnpj), Validators.maxLength(this.inputLengthCpfCnpj), Validators.minLength(this.inputLengthCpfCnpj)]],
      inscricaoEstadual: ['', [Validators.pattern(/^[0-9]{12}/), Validators.maxLength(12), Validators.minLength(12)]],
      email: ['', [Validators.email, Validators.maxLength(50)]],
      dataNascimento: [''],
      status: ['COMUM', Validators.required]
    });
    this.dadosTelefone = this.formBuilder.group({
      secondCtrl: ['', Validators.required],
    });
    this.dadosEndereco = this.formBuilder.group({
      thirdCtrl: ['', Validators.required],
    });
  }

  constructor(private formBuilder: FormBuilder) { }

  atualizaTipoPessoa() {
    console.log(this.cliente.tipoPessoa);
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
    this.dadosCliente.controls['cpfCnpj'].setValidators([Validators.maxLength(this.inputLengthCpfCnpj), Validators.minLength(this.inputLengthCpfCnpj)])
    this.dadosCliente.controls['cpfCnpj'].setValidators(Validators.pattern(this.inputPatternCpfCnpj))

    this.cliente.inscricaoEstadual = '';
    this.dadosCliente.controls['inscricaoEstadual'].reset();

    this.cliente.cpfCnpj = '';
    this.dadosCliente.controls['cpfCnpj'].reset();
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


}
