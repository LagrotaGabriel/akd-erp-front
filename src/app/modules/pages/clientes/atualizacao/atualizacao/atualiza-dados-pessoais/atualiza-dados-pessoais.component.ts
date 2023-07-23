import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BrasilApiService } from 'src/app/shared/services/brasil-api.service';
import { ClienteService } from '../../../services/cliente.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Cliente } from '../../../models/cliente';
import { Util } from 'src/app/modules/utils/Util';
import { SelectOption } from 'src/app/modules/shared/inputs/models/select-option';
import { Subscription, debounceTime } from 'rxjs';
import { Endereco } from '../../../models/endereco';
import { CnpjResponse } from 'src/app/shared/models/brasil-api/cnpj-response';
import { Telefone } from '../../../models/telefone';
import { CustomInputComponent } from 'src/app/modules/shared/inputs/custom-input/custom-input.component';

@Component({
  selector: 'app-atualiza-dados-pessoais',
  templateUrl: './atualiza-dados-pessoais.component.html',
  styleUrls: ['../atualizacao.component.scss']
})
export class AtualizaDadosPessoaisComponent {

  constructor(private formBuilder: FormBuilder,
    private brasilApiService: BrasilApiService,
    private clienteService: ClienteService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private ref: ChangeDetectorRef) { }

  //VALIDATIONS
  inputLengthCpfCnpj: number = 11;
  inputPatternCpfCnpj: any = /^\d{3}.?\d{3}.?\d{3}-?\d{2}/;

  // Tags html
  @ViewChild('inputNome') inputNome: CustomInputComponent;

  // Subscriptions
  validaDuplicidadeCpfCnpjSubscription$: Subscription;
  obtemDadosClientePeloCnpjSubscription$: Subscription;
  validaDuplicidadeInscricaoEstadualSubscription$: Subscription;

  @Input() stepAtual: number;
  @Input() clientePreAtualizacao: Cliente;

  @Output() emissorDeTelefoneEncontradoNoCnpj = new EventEmitter<Telefone>();
  @Output() emissorDeEnderecoEncontradoNoCnpj = new EventEmitter<Endereco>();

  protected dadosCliente: FormGroup = this.inicializaFormulario();
  @Output() emissorDeDadosPessoaisDoCliente = new EventEmitter<FormGroup>();

  dadosClienteSubscribe$: Subscription = this.dadosCliente.valueChanges.pipe(
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
    if (Util.isNotObjectEmpty(changes['clientePreAtualizacao'])) {
      let clienteRecebido: Cliente = changes['clientePreAtualizacao'].currentValue;
      if (Util.isNotObjectEmpty(clienteRecebido)) this.atualizaFormDadosCliente();
    }

    if (Util.isNotObjectEmpty(changes['stepAtual'])) {
      if (this.stepAtual == 0 && !changes['stepAtual'].isFirstChange()) {
        setTimeout(() => {
          this.inputNome.acionaFoco();
        }, 300);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.dadosClienteSubscribe$ != undefined) this.dadosClienteSubscribe$.unsubscribe();
    if (this.validaDuplicidadeCpfCnpjSubscription$ != undefined) this.validaDuplicidadeCpfCnpjSubscription$.unsubscribe();
    if (this.obtemDadosClientePeloCnpjSubscription$ != undefined) this.obtemDadosClientePeloCnpjSubscription$.unsubscribe();
    if (this.validaDuplicidadeInscricaoEstadualSubscription$ != undefined) this.validaDuplicidadeInscricaoEstadualSubscription$.unsubscribe();
  }

  private inicializaFormulario(): FormGroup {
    return this.formBuilder.group({
      nome: new FormControl(
        {
          value: '',
          disabled: true,
        },
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ),
      tipoPessoa: new FormControl(
        {
          value: 'FISICA',
          disabled: true
        }, Validators.required
      ),
      cpfCnpj: new FormControl(
        {
          value: '',
          disabled: true
        }, Validators.pattern(/^\d{3}.?\d{3}.?\d{3}-?\d{2}/),
      ),
      inscricaoEstadual: new FormControl(
        {
          value: '',
          disabled: true
        }, Validators.pattern(/^\d{12}/)
      ),
      email: new FormControl(
        {
          value: '',
          disabled: true
        },
        [
          Validators.email,
          Validators.maxLength(50)
        ]
      ),
      dataNascimento: new FormControl(
        {
          value: '',
          disabled: true
        }
      ),
      statusCliente: new FormControl(
        {
          value: 'COMUM',
          disabled: true
        }, Validators.required
      )
    });
  }

  private atualizaFormDadosCliente() {
    this.setaValoresFormCliente();
    this.administraLiberacaoOuBloqueioDosCamposFormCliente();
    this.setaValidatorsFormCliente();
    this.emissorDeDadosPessoaisDoCliente.emit(this.dadosCliente);
  }

  private setaValoresFormCliente() {
    this.dadosCliente.setValue({
      nome: this.clientePreAtualizacao.nome,
      tipoPessoa: Util.isEmptyString(this.clientePreAtualizacao.tipoPessoa) ? 'FISICA' : this.clientePreAtualizacao.tipoPessoa,
      cpfCnpj: Util.isEmptyString(this.clientePreAtualizacao.cpfCnpj) ? '' : this.clientePreAtualizacao.cpfCnpj,
      inscricaoEstadual: Util.isEmptyString(this.clientePreAtualizacao.inscricaoEstadual) ? '' : this.clientePreAtualizacao.inscricaoEstadual,
      email: Util.isEmptyString(this.clientePreAtualizacao.email) ? '' : this.clientePreAtualizacao.email,
      dataNascimento: Util.isEmptyString(this.clientePreAtualizacao.dataNascimento) ? '' : this.clientePreAtualizacao.dataNascimento,
      statusCliente: Util.isEmptyString(this.clientePreAtualizacao.statusCliente) ? 'COMUM' : this.clientePreAtualizacao.statusCliente
    })
  }

  private administraLiberacaoOuBloqueioDosCamposFormCliente() {
    this.dadosCliente.get('nome').enable();
    this.dadosCliente.get('tipoPessoa').enable();
    this.dadosCliente.get('cpfCnpj').enable();
    (this.clientePreAtualizacao.tipoPessoa == 'FISICA')
      ? this.dadosCliente.get('inscricaoEstadual').disable()
      : this.dadosCliente.get('inscricaoEstadual').enable();
    this.dadosCliente.get('email').enable();
    (this.clientePreAtualizacao.tipoPessoa == 'FISICA')
      ? this.dadosCliente.get('dataNascimento').enable()
      : this.dadosCliente.get('dataNascimento').disable();
    this.dadosCliente.get('statusCliente').enable();
  }

  private setaValidatorsFormCliente() {
    this.dadosCliente.get('cpfCnpj').setValidators(Validators.pattern(this.retornaPatternCpfCnpjParaTipoDePessoaAtual()));
  }

  // Getters e Setters
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
        error: (error) => {
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
    console.log(cnpjResponse);
    this.setaClienteComInformacoesPessoaisObtidasPeloCnpj(cnpjResponse);
    this.setaClienteComInformacoesDeTelefoneObtidasPeloCnpj(cnpjResponse);
    this.setaClienteComInformacoesDeEnderecoObtidasPeloCnpj(cnpjResponse);
  }

  private setaClienteComInformacoesPessoaisObtidasPeloCnpj(cnpjResponse: CnpjResponse) {
    if (Util.isNotEmptyString(cnpjResponse.nomeFantasia)) {
      this.setValueParaAtributoDadosCliente('nome', cnpjResponse.nomeFantasia.slice(0, 50));
      this.dadosCliente.controls['nome'].markAsTouched();
    }
    else if (Util.isNotEmptyString(cnpjResponse.razaoSocial)) {
      this.setValueParaAtributoDadosCliente('nome', cnpjResponse.razaoSocial.slice(0, 50));
      this.dadosCliente.controls['nome'].markAsTouched();
    }

    if (Util.isNotEmptyString(cnpjResponse.email)) {
      this.setValueParaAtributoDadosCliente('email', cnpjResponse.email);
      this.dadosCliente.controls['email'].markAsTouched();
    }
  }

  private setaClienteComInformacoesDeTelefoneObtidasPeloCnpj(cnpjResponse: CnpjResponse) {
    if (Util.isEmptyString(cnpjResponse.telefonePrincipal)) {
      let telefone: Telefone = new Telefone();
      if (cnpjResponse.telefonePrincipal.length == 10) {
        telefone.tipoTelefone = 'FIXO';
        telefone.prefixo = cnpjResponse.telefonePrincipal.slice(0, 2);
        telefone.numero = cnpjResponse.telefonePrincipal.slice(2);
      }
      else if (cnpjResponse.telefonePrincipal.length == 11) {
        telefone.tipoTelefone = 'MOVEL';
        telefone.prefixo = cnpjResponse.telefonePrincipal.slice(0, 2);
        telefone.numero = cnpjResponse.telefonePrincipal.slice(2);
      }
      else {
        telefone.tipoTelefone = '';
        telefone.prefixo = '';
        telefone.numero = '';
      }
      this.emissorDeTelefoneEncontradoNoCnpj.emit(telefone);
    }
  }

  private setaClienteComInformacoesDeEnderecoObtidasPeloCnpj(cnpjResponse: CnpjResponse) {
    let endereco: Endereco = new Endereco();
    if (Util.isNotEmptyString(cnpjResponse.logradouro)) endereco.logradouro = cnpjResponse.logradouro;
    if (Util.isNotEmptyString(cnpjResponse.numero)) endereco.numero = Util.transformStringToNumber(cnpjResponse.numero);
    if (Util.isNotEmptyString(cnpjResponse.bairro)) endereco.bairro = cnpjResponse.bairro;
    if (Util.isNotEmptyString(cnpjResponse.municipio)) endereco.cidade = cnpjResponse.municipio;
    if (Util.isNotEmptyNumber(cnpjResponse.cep)) endereco.codigoPostal = cnpjResponse.cep.toString();
    if (Util.isNotEmptyString(cnpjResponse.uf)) endereco.estado = cnpjResponse.uf;
    if (Util.isNotEmptyString(cnpjResponse.complemento)) endereco.complemento = cnpjResponse.complemento;
    this.emissorDeEnderecoEncontradoNoCnpj.emit(endereco);
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

  protected avancaProximaEtapa() {
    if (this.dadosCliente.invalid) {
      this.dadosCliente.markAllAsTouched();
      this._snackBar.open('Ops! Algum campo está incorreto. Revise o formulário e tente novamente.', "Fechar", {
        duration: 3500
      })
    }
  }

  private retornaPatternCpfCnpjParaTipoDePessoaAtual(): any {
    return this.clientePreAtualizacao.tipoPessoa == 'FISICA' ? /^\d{3}.?\d{3}.?\d{3}-?\d{2}/ : /^\d{2}\d{3}\d{3}\d{4}\d{2}/;
  }

}
