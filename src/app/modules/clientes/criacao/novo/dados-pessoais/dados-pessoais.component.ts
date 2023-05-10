import { Subscription, debounceTime } from 'rxjs';
import { Component, ChangeDetectorRef, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BrasilApiService } from 'src/app/shared/services/brasil-api.service';
import { ClienteService } from '../../../services/cliente.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { CnpjResponse } from 'src/app/shared/models/brasil-api/cnpj-response';
import { SelectOption } from 'src/app/modules/shared/inputs/models/select-option';
import { CustomInputComponent } from 'src/app/modules/shared/inputs/custom-input/custom-input.component';

@Component({
  selector: 'app-dados-pessoais',
  templateUrl: './dados-pessoais.component.html',
  styleUrls: ['./dados-pessoais.component.scss']
})
export class DadosPessoaisComponent {

  constructor(private formBuilder: FormBuilder,
    private brasilApiService: BrasilApiService,
    private clienteService: ClienteService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private ref: ChangeDetectorRef) { }

  // Validations
  inputLengthCpfCnpj: number = 11;
  inputPatternCpfCnpj: any = /^\d{3}.?\d{3}.?\d{3}-?\d{2}/;

  // Tags html
  @ViewChild('inputNome') inputNome: CustomInputComponent;

  // Subscriptions
  validaDuplicidadeCpfCnpjSubscription$: Subscription;
  obtemDadosClientePeloCnpjSubscription$: Subscription;
  validaDuplicidadeInscricaoEstadualSubscription$: Subscription;

  @Input() stepAtual: number;

  protected dadosCliente: FormGroup = this.createFormDadosCliente();
  @Output() emissorDeDadosPessoaisDoCliente = new EventEmitter<FormGroup>();

  dadosColaboradorSubscribe$: Subscription = this.dadosCliente.valueChanges.pipe(
    debounceTime(500)
  ).subscribe({
    next: () => {
      this.emissorDeDadosPessoaisDoCliente.emit(this.dadosCliente);
    }
  })

  ngAfterViewInit(): void {
    this.ref.detectChanges();
    this.emissorDeDadosPessoaisDoCliente.emit(this.dadosCliente);
    this.inputNome.acionaFoco();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.stepAtual == 0 && !changes['stepAtual'].isFirstChange()) {
      setTimeout(() => {
        this.inputNome.acionaFoco();
      }, 300);
    }
  }

  ngOnDestroy(): void {
    if (this.dadosColaboradorSubscribe$ != undefined) this.dadosColaboradorSubscribe$.unsubscribe();
    if (this.validaDuplicidadeCpfCnpjSubscription$ != undefined) this.validaDuplicidadeCpfCnpjSubscription$.unsubscribe();
    if (this.obtemDadosClientePeloCnpjSubscription$ != undefined) this.obtemDadosClientePeloCnpjSubscription$.unsubscribe();
    if (this.validaDuplicidadeInscricaoEstadualSubscription$ != undefined) this.validaDuplicidadeInscricaoEstadualSubscription$.unsubscribe();
  }

  createFormDadosCliente(): FormGroup {
    return this.formBuilder.group({
      nome: ['', [Validators.required, Validators.maxLength(50)]],
      tipoPessoa: ['FISICA', Validators.required],
      cpfCnpj: ['', [Validators.pattern(this.inputPatternCpfCnpj), Validators.maxLength(this.inputLengthCpfCnpj), Validators.minLength(this.inputLengthCpfCnpj)]],
      inscricaoEstadual: new FormControl(
        {
          value: '',
          disabled: true
        },
        Validators.pattern(/^\d{12}/)
      ),
      email: ['', [Validators.email, Validators.maxLength(50)]],
      dataNascimento: [''],
      statusCliente: ['COMUM', Validators.required]
    });
  }

  protected getValueAtributoDadosCliente(atributo: string): any {
    return this.dadosCliente.controls[atributo].value;
  }

  protected setValueParaAtributoDadosCliente(atributo: string, valor: any) {
    this.dadosCliente.controls[atributo].setValue(valor);
  }

  // Geradores de Select Options
  protected geraOptionsTipoPessoa(): SelectOption[] {
    let options: SelectOption[] = [
      {
        text: 'Física',
        value: 'FISICA'
      },
      {
        text: 'Jurídica',
        value: 'JURIDICA'
      }
    ]
    return options;
  }

  protected geraOptionsStatusCliente(): SelectOption[] {
    let options: SelectOption[] = [
      {
        text: 'Comum',
        value: 'COMUM'
      },
      {
        text: 'Devedor',
        value: 'DEVEDOR'
      },
      {
        text: 'Vip',
        value: 'VIP'
      },
      {
        text: 'Atenção',
        value: 'ATENCAO'
      }
    ]
    return options;
  }

  atualizaTipoPessoa() {

    if (this.getValueAtributoDadosCliente('tipoPessoa') == 'FISICA') {
      this.inputLengthCpfCnpj = 11;
      this.inputPatternCpfCnpj = /^\d{3}.?\d{3}.?\d{3}-?\d{2}/;
      this.dadosCliente.controls['inscricaoEstadual'].disable();
      this.dadosCliente.controls['dataNascimento'].enable();
    }
    else if (this.getValueAtributoDadosCliente('tipoPessoa') == 'JURIDICA') {
      this.inputLengthCpfCnpj = 14;
      this.inputPatternCpfCnpj = /^\d{2}\d{3}\d{3}\d{4}\d{2}/
      this.dadosCliente.controls['inscricaoEstadual'].enable();
      this.dadosCliente.controls['dataNascimento'].disable();
    }
    this.dadosCliente.controls['cpfCnpj'].setValidators([Validators.maxLength(this.inputLengthCpfCnpj),
    Validators.minLength(this.inputLengthCpfCnpj), Validators.pattern(this.inputPatternCpfCnpj)]);

    this.setValueParaAtributoDadosCliente('dataNascimento', '')
    this.setValueParaAtributoDadosCliente('inscricaoEstadual', '')
    this.setValueParaAtributoDadosCliente('cpfCnpj', '')
  }

  realizaTratamentoCpfCnpj() {
    this.setValueParaAtributoDadosCliente('cpfCnpj', this.getValueAtributoDadosCliente('cpfCnpj')
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim());
    this.invocaValidacaoDuplicidadeCpfCnpj();
  }

  invocaValidacaoDuplicidadeCpfCnpj() {
    if (
      this.getValueAtributoDadosCliente('tipoPessoa') == 'JURIDICA'
      && this.getValueAtributoDadosCliente('cpfCnpj').length == 14
      && this.dadosCliente.controls['cpfCnpj'].valid ||
      this.getValueAtributoDadosCliente('tipoPessoa') == 'FISICA'
      && this.getValueAtributoDadosCliente('cpfCnpj').length == 11
      && this.dadosCliente.controls['cpfCnpj'].valid) {

      this.validaDuplicidadeCpfCnpjSubscription$ = this.clienteService.validaDuplicidadeCpfCnpj(this.getValueAtributoDadosCliente('cpfCnpj')).subscribe({
        error: error => {
          this.setValueParaAtributoDadosCliente('cpfCnpj', '');
          this.dadosCliente.controls['cpfCnpj'].reset();
          this._snackBar.open(error, "Fechar", {
            duration: 3500
          });
        },
        complete: () => {
          if (this.getValueAtributoDadosCliente('tipoPessoa') == 'JURIDICA') this.obtemDadosDoClientePeloCnpj();
          console.log('Validação de duplicidade de Cpf/Cnpj finalizada com sucesso')
        }
      });

    }

  }

  obtemDadosDoClientePeloCnpj() {
    this.obtemDadosClientePeloCnpjSubscription$ = this.brasilApiService.obtemDadosClientePeloCnpj(this.getValueAtributoDadosCliente('cpfCnpj')).subscribe({
      next: retornoApi => this.setaClienteComInformacoesObtidasPeloCnpj(retornoApi),
      error: error => {
        this._snackBar.open('Ocorreu um erro na obtenção das informações do CNPJ', "Fechar", {
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
    this.setaClienteComInformacoesPessoaisObtidasPeloCnpj(cnpjResponse);
    this.setaClienteComInformacoesDeTelefoneObtidasPeloCnpj(cnpjResponse);
    this.setaClienteComInformacoesDeEnderecoObtidasPeloCnpj(cnpjResponse);
  }

  private setaClienteComInformacoesPessoaisObtidasPeloCnpj(cnpjResponse: CnpjResponse) {
    if (cnpjResponse.nomeFantasia != null && cnpjResponse.nomeFantasia != '') {
      this.setValueParaAtributoDadosCliente('nome', cnpjResponse.nomeFantasia);
      this.dadosCliente.controls['nome'].markAsTouched();
    }

    if (cnpjResponse.email != null && cnpjResponse.email != '') {
      this.setValueParaAtributoDadosCliente('email', cnpjResponse.email);
      this.dadosCliente.controls['email'].markAsTouched();
    }
  }

  private setaClienteComInformacoesDeTelefoneObtidasPeloCnpj(cnpjResponse: CnpjResponse) {
    //TODO
    /*     if (cnpjResponse.telefonePrincipal != null && cnpjResponse.telefonePrincipal != '') {
          if (cnpjResponse.telefonePrincipal.length == 10) {
            this.setValueParaAtributoDadosTelefone('tipoTelefone', 'FIXO');
          }
          else {
            this.setValueParaAtributoDadosTelefone('tipoTelefone', 'MOVEL');
          }
          this.atualizaValidatorsTelefone();
          this.dadosTelefone.controls['tipoTelefone'].markAsTouched();
    
          this.setValueParaAtributoDadosTelefone('prefixo', cnpjResponse.telefonePrincipal.slice(0, 2));
          this.setValueParaAtributoDadosTelefone('numero', cnpjResponse.telefonePrincipal.slice(2));
    
          this.dadosTelefone.controls['prefixo'].markAsTouched();
          this.dadosTelefone.controls['numero'].markAsTouched();
        } */
  }

  private setaClienteComInformacoesDeEnderecoObtidasPeloCnpj(cnpjResponse: CnpjResponse) {
    //TODO
    /*     if (cnpjResponse.logradouro != null && cnpjResponse.logradouro != '') {
          this.setValueParaAtributoDadosEndereco('logradouro', cnpjResponse.logradouro);
          this.dadosEndereco.controls['logradouro'].markAsTouched();
        }
    
        if (cnpjResponse.numero != null && cnpjResponse.numero != '') {
          this.setValueParaAtributoDadosEndereco('numero', parseInt(cnpjResponse.numero));
          this.dadosEndereco.controls['numero'].markAsTouched();
        }
    
        if (cnpjResponse.bairro != null && cnpjResponse.bairro != '') {
          this.setValueParaAtributoDadosEndereco('bairro', parseInt(cnpjResponse.bairro));
          this.dadosEndereco.controls['bairro'].markAsTouched();
        }
    
        if (cnpjResponse.municipio != null && cnpjResponse.municipio != '') {
          this.setValueParaAtributoDadosEndereco('cidade', cnpjResponse.municipio);
          this.dadosEndereco.controls['cidade'].markAsTouched();
        }
    
        if (cnpjResponse.cep != null) {
          this.setValueParaAtributoDadosEndereco('codigoPostal', (cnpjResponse.cep).toString());
          this.dadosEndereco.controls['codigoPostal'].markAsTouched();
        }
    
        if (cnpjResponse.uf != null && cnpjResponse.uf != '') {
          this.setValueParaAtributoDadosEndereco('estado', cnpjResponse.uf);
          this.dadosEndereco.controls['estado'].markAsTouched();
          this.obtemTodosMunicipiosPorEstado();
        }
    
        if (cnpjResponse.complemento != null && cnpjResponse.complemento != '') {
          this.setValueParaAtributoDadosEndereco('complemento', cnpjResponse.complemento);
          this.dadosEndereco.controls['complemento'].markAsTouched();
        } */
  }

  realizaTratamentoInscricaoEstadual() {
    this.setValueParaAtributoDadosCliente('inscricaoEstadual', this.getValueAtributoDadosCliente('inscricaoEstadual')
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim());
    this.invocaValidacaoDuplicidadeInscricaoEstadual();
  }

  invocaValidacaoDuplicidadeInscricaoEstadual() {
    if (this.getValueAtributoDadosCliente('inscricaoEstadual').length == 11 && this.dadosCliente.controls['inscricaoEstadual'].valid) {
      this.validaDuplicidadeInscricaoEstadualSubscription$ =
        this.clienteService.validaDuplicidadeInscricaoEstadual(this.getValueAtributoDadosCliente('inscricaoEstadual')).subscribe({
          error: error => {
            this.setValueParaAtributoDadosCliente('inscricaoEstadual', '');
            this.dadosCliente.controls['inscricaoEstadual'].reset();
            this._snackBar.open(error, "Fechar", {
              duration: 3500
            });
          },
          complete: () => console.log('Validação de duplicidade de inscrição estadual completada com sucesso')
        })
    }
  }

  validaDataNascimento() {

    if (this.getValueAtributoDadosCliente('dataNascimento') == '') {
      return;
    }

    let dataNascimentoSplitada = this.getValueAtributoDadosCliente('dataNascimento').split("-");
    if (dataNascimentoSplitada.length == 3) {
      if (parseInt(dataNascimentoSplitada[0]) > 2023 || parseInt(dataNascimentoSplitada[0]) < 1900) {
        this.setValueParaAtributoDadosCliente('dataNascimento', '');
        this._snackBar.open("Data de nascimento inválida", "Fechar", {
          duration: 3500
        })
        return;
      }
    }
  }

  retornaParaVisualizacaoDeClientes() {
    this.router.navigate(['/clientes'])
  }

}
