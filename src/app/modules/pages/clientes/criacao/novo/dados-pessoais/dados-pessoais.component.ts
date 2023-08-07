import { Subscription, debounceTime } from 'rxjs';
import { Component, ChangeDetectorRef, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BrasilApiService } from 'src/app/shared/services/brasil-api.service';
import { ClienteService } from '../../../services/cliente.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CnpjResponse } from 'src/app/shared/models/brasil-api/cnpj-response';
import { SelectOption } from 'src/app/modules/shared/inputs/models/select-option';
import { CustomInputComponent } from 'src/app/modules/shared/inputs/custom-input/custom-input.component';
import { Util } from 'src/app/modules/utils/Util';
import { TelefoneResponse } from 'src/app/shared/models/telefone/response/TelefoneResponse';
import { EnderecoResponse } from 'src/app/shared/models/endereco/response/EnderecoResponse';
import { Mask } from 'src/app/modules/utils/Mask';
import { ClienteResponse } from '../../../models/response/ClienteResponse';
import { Endereco } from 'src/app/shared/models/Endereco';
import { Telefone } from 'src/app/shared/models/Telefone';

@Component({
  selector: 'app-dados-pessoais',
  templateUrl: './dados-pessoais.component.html',
  styleUrls: ['../novo.component.scss']
})
export class DadosPessoaisComponent {

  constructor(private formBuilder: FormBuilder,
    private brasilApiService: BrasilApiService,
    private clienteService: ClienteService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private ref: ChangeDetectorRef) { }

  // Validations
  inputLengthCpfCnpj: number = 14;
  inputPatternCpfCnpj: any = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;

  // Tags html
  @ViewChild('inputNome') inputNome: CustomInputComponent;

  // Subscriptions
  validaDuplicidadeCpfCnpjSubscription$: Subscription;
  obtemDadosClientePeloCnpjSubscription$: Subscription;
  validaDuplicidadeInscricaoEstadualSubscription$: Subscription;

  @Input() stepAtual: number;

  @Input() setupDadosAtualizacao: ClienteResponse;
  @Input() estados;

  @Output() emissorDeTelefoneEncontradoNoCnpj = new EventEmitter<TelefoneResponse>();
  @Output() emissorDeEnderecoEncontradoNoCnpj = new EventEmitter<EnderecoResponse>();

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
      this.inputLengthCpfCnpj = 14;
      this.inputPatternCpfCnpj = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
      this.dadosCliente.controls['inscricaoEstadual'].disable();
      this.dadosCliente.controls['dataNascimento'].enable();
    }
    else if (this.getValueAtributoDadosCliente('tipoPessoa') == 'JURIDICA') {
      this.inputLengthCpfCnpj = 18;
      this.inputPatternCpfCnpj = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/
      this.dadosCliente.controls['inscricaoEstadual'].enable();
      this.dadosCliente.controls['dataNascimento'].disable();
    }
    this.dadosCliente.controls['cpfCnpj'].setValidators([Validators.maxLength(this.inputLengthCpfCnpj),
    Validators.minLength(this.inputLengthCpfCnpj), Validators.pattern(this.inputPatternCpfCnpj)]);

    this.setValueParaAtributoDadosCliente('dataNascimento', '')
    this.setValueParaAtributoDadosCliente('inscricaoEstadual', '')
    this.setValueParaAtributoDadosCliente('cpfCnpj', '')
  }

  realizaTratamentoCpfCnpj(tecla) {
    if (this.getValueAtributoDadosCliente('tipoPessoa') == 'FISICA' && tecla?.inputType != 'deleteContentBackward'
      || this.getValueAtributoDadosCliente('tipoPessoa') == 'FISICA' && tecla == null) {
      this.setValueParaAtributoDadosCliente('cpfCnpj', Mask.cpfMask(this.getValueAtributoDadosCliente('cpfCnpj')));
    }
    else if (this.getValueAtributoDadosCliente('tipoPessoa') == 'JURIDICA' && tecla?.inputType != 'deleteContentBackward'
      || this.getValueAtributoDadosCliente('tipoPessoa') == 'JURIDICA' && tecla == null) {
      this.setValueParaAtributoDadosCliente('cpfCnpj', Mask.cnpjMask(this.getValueAtributoDadosCliente('cpfCnpj')));
    }
    this.invocaValidacaoDuplicidadeCpfCnpj();
  }

  invocaValidacaoDuplicidadeCpfCnpj() {
    if (
      this.getValueAtributoDadosCliente('tipoPessoa') == 'JURIDICA'
      && this.getValueAtributoDadosCliente('cpfCnpj').length == 18
      && this.dadosCliente.controls['cpfCnpj'].valid ||
      this.getValueAtributoDadosCliente('tipoPessoa') == 'FISICA'
      && this.getValueAtributoDadosCliente('cpfCnpj').length == 14
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
    this.obtemDadosClientePeloCnpjSubscription$ = this.brasilApiService.obtemDadosClientePeloCnpj(
      this.getValueAtributoDadosCliente('cpfCnpj').replace('.', '').replace('-', '').replace('/', '')).subscribe({
        next: retornoApi => this.setaClienteComInformacoesObtidasPeloCnpj(retornoApi),
        error: error => {
          this._snackBar.open('Nenhum CNPJ foi encontrado para obtenção automática de dados', "Fechar", {
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
    if (Util.isNotEmptyString(cnpjResponse.telefonePrincipal)) {
      let telefone: TelefoneResponse = new TelefoneResponse();
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

    if ((Util.isNotEmptyString(cnpjResponse.uf))) {
      let estadosBrasileiros: string[] = [];
      this.estados.forEach(estado => {
        estadosBrasileiros.push(
          estado.sigla
        )
      })

      if (estadosBrasileiros.indexOf(cnpjResponse.uf) == -1) {
        cnpjResponse.uf = null;
      }

    }
    else {
      cnpjResponse.uf = null;
    }

    let endereco: EnderecoResponse = {
      logradouro: (Util.isNotEmptyString(cnpjResponse.logradouro)) ? cnpjResponse.logradouro : null,
      numero: (Util.isNotEmptyString(cnpjResponse.numero)) ? Util.transformStringToNumber(cnpjResponse.numero) : null,
      bairro: (Util.isNotEmptyString(cnpjResponse.bairro)) ? cnpjResponse.bairro : null,
      cidade: (Util.isNotEmptyString(cnpjResponse.municipio)) ? cnpjResponse.municipio : null,
      codigoPostal: (Util.isNotEmptyNumber(cnpjResponse.cep)) ? cnpjResponse.cep.toString() : null,
      estado: cnpjResponse.uf,
      complemento: (Util.isNotEmptyString(cnpjResponse.complemento)) ? cnpjResponse.complemento : null,
    };
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

  realizaSetupDados(cliente: ClienteResponse) {
    this.dadosCliente.setValue({
      nome: cliente.nome,
      tipoPessoa: cliente.tipoPessoa,
      cpfCnpj: cliente.cpfCnpj,
      inscricaoEstadual: cliente.inscricaoEstadual,
      email: cliente.email,
      dataNascimento: cliente.dataNascimento,
      statusCliente: cliente.statusCliente
    })
    this.atualizaValidatorsTipoPessoaSetupAtualizacao();
  }

  atualizaValidatorsTipoPessoaSetupAtualizacao() {
    if (this.getValueAtributoDadosCliente('tipoPessoa') == 'FISICA') {
      this.inputLengthCpfCnpj = 14;
      this.inputPatternCpfCnpj = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
      this.dadosCliente.controls['inscricaoEstadual'].disable();
      this.dadosCliente.controls['dataNascimento'].enable();
    }
    else if (this.getValueAtributoDadosCliente('tipoPessoa') == 'JURIDICA') {
      this.inputLengthCpfCnpj = 18;
      this.inputPatternCpfCnpj = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/
      this.dadosCliente.controls['inscricaoEstadual'].enable();
      this.dadosCliente.controls['dataNascimento'].disable();
    }

    this.dadosCliente.controls['cpfCnpj'].setValidators(
      [
        Validators.maxLength(this.inputLengthCpfCnpj),
        Validators.minLength(this.inputLengthCpfCnpj),
        Validators.pattern(this.inputPatternCpfCnpj)
      ]
    );

    this.dadosCliente.controls['cpfCnpj'].updateValueAndValidity();
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

}
