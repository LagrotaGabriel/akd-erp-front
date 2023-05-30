import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Util } from 'src/app/modules/utils/Util';
import { Cliente } from '../../../models/cliente';
import { Subscription, debounceTime } from 'rxjs';
import { SelectOption } from 'src/app/modules/shared/inputs/models/select-option';
import { Telefone } from '../../../models/telefone';
import { CustomSelectComponent } from 'src/app/modules/shared/inputs/custom-select/custom-select.component';

@Component({
  selector: 'app-atualiza-dados-telefone',
  templateUrl: './atualiza-dados-telefone.component.html',
  styleUrls: ['../atualizacao.component.scss']
})
export class AtualizaDadosTelefoneComponent {

  constructor(private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private ref: ChangeDetectorRef) { }

  // Validations telefone
  inputLengthPrefixo: number = 2;
  inputPrefixoPattern: any = /^\d{2}/;
  inputLengthTelefone: number;
  inputTelefonePattern: any;

  // Tags html
  @ViewChild('SelectTipoTelefone') selectTipoTelefone: CustomSelectComponent;

  @Input() stepAtual: number;
  @Input() telefoneEncontradoNoCnpj: Telefone;
  @Input() clientePreAtualizacao: Cliente;

  protected dadosTelefone: FormGroup = this.createFormDadosTelefone();
  @Output() emissorDeDadosDeTelefoneDoCliente = new EventEmitter<FormGroup>();

  dadosTelefoneSubscribe$: Subscription = this.dadosTelefone.valueChanges.pipe(
    debounceTime(500)
  ).subscribe({
    next: () => {
      this.emissorDeDadosDeTelefoneDoCliente.emit(this.dadosTelefone);
    }
  })

  ngAfterViewInit(): void {
    this.ref.detectChanges();
    this.emissorDeDadosDeTelefoneDoCliente.emit(this.dadosTelefone);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (Util.isNotObjectEmpty(changes['stepAtual'])) {
      if (this.stepAtual == 1) {
        setTimeout(() => {
          this.selectTipoTelefone.acionaFoco();
        }, 300);
      }
    }

    if (Util.isNotObjectEmpty(changes['clientePreAtualizacao'])) {
      let clienteRecebido: Cliente = changes['clientePreAtualizacao'].currentValue;
      if (Util.isNotObjectEmpty(clienteRecebido))
        if (Util.isNotObjectEmpty(clienteRecebido.telefone))
          this.atualizaFormDadosTelefone();
    }

    if (changes['telefoneEncontradoNoCnpj'] != undefined) {
      let telefone: Telefone = changes['telefoneEncontradoNoCnpj'].currentValue;
      if (telefone != undefined) {
        this.atualizaTelefoneComTelefoneEncontradoPeloCnpj(telefone);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.dadosTelefoneSubscribe$ != undefined) this.dadosTelefoneSubscribe$.unsubscribe();
  }

  protected getValueAtributoDadosTelefone(atributo: string): any {
    return this.dadosTelefone.controls[atributo].value;
  }

  protected setValueParaAtributoDadosTelefone(atributo: string, valor: any) {
    this.dadosTelefone.controls[atributo].setValue(valor);
  }

  // Geradores de Select Options
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

  createFormDadosTelefone(): FormGroup {
    return this.formBuilder.group({
      tipoTelefone: new FormControl(
        {
          value: '',
          disabled: false
        }
      ),
      prefixo: new FormControl(
        {
          value: '',
          disabled: true
        }, Validators.pattern(this.inputPrefixoPattern)
      ),
      numero: new FormControl(
        {
          value: '',
          disabled: true
        }
      )
    })
  }

  private atualizaFormDadosTelefone() {
    this.setaValoresFormTelefone();
    this.administraLiberacaoOuBloqueioDosCamposFormTelefone();
    this.setaValidatorsFormTelefone();
    this.emissorDeDadosDeTelefoneDoCliente.emit(this.dadosTelefone);
  }

  private setaValoresFormTelefone() {
    this.dadosTelefone.setValue({
      tipoTelefone: this.clientePreAtualizacao.telefone.tipoTelefone,
      prefixo: Util.isEmptyString(this.clientePreAtualizacao.telefone.prefixo) ? '' : this.clientePreAtualizacao.telefone.prefixo,
      numero: Util.isEmptyString(this.clientePreAtualizacao.telefone.numero) ? '' : this.clientePreAtualizacao.telefone.numero,
    })
  }

  private administraLiberacaoOuBloqueioDosCamposFormTelefone() {
    (this.clientePreAtualizacao.telefone.tipoTelefone == '')
      ? this.dadosTelefone.get('prefixo').disable()
      : this.dadosTelefone.get('prefixo').enable();
    (this.clientePreAtualizacao.telefone.numero == '')
      ? this.dadosTelefone.get('numero').disable()
      : this.dadosTelefone.get('numero').enable();
  }

  private setaValidatorsFormTelefone() {
    this.dadosTelefone.get('numero').setValidators(Validators.pattern(this.retornaPatternNumeroTelefoneParaTipoDeTelefoneAtual()));
  }

  isTelefonePreenchido(): boolean {
    if (Util.isNotObjectEmpty(this.clientePreAtualizacao)) {
      if (Util.isNotObjectEmpty(this.clientePreAtualizacao.telefone)) return true;
      return false;
    }
    else return false;
  }

  atualizaValidatorsTelefone() {

    this.dadosTelefone.setValue({
      tipoTelefone: this.getValueAtributoDadosTelefone('tipoTelefone'),
      prefixo: '',
      numero: ''
    })

    this.dadosTelefone.clearValidators();

    if (this.getValueAtributoDadosTelefone('tipoTelefone') != '') {

      this.dadosTelefone.enable()

      if (this.getValueAtributoDadosTelefone('tipoTelefone') == 'FIXO') {
        this.inputLengthTelefone = 8;
        this.inputTelefonePattern = /^\d{4}\d{4}/;
      }

      else if (this.getValueAtributoDadosTelefone('tipoTelefone') == 'MOVEL' || this.getValueAtributoDadosTelefone('tipoTelefone') == 'MOVEL_WHATSAPP') {
        this.inputLengthTelefone = 9;
        this.inputTelefonePattern = /^\d\d{4}\d{4}/;
      }

      this.dadosTelefone.controls['prefixo'].setValidators([
        Validators.required, Validators.pattern(this.inputPrefixoPattern)
      ])

      this.dadosTelefone.controls['numero'].setValidators([
        Validators.required, Validators.pattern(this.inputTelefonePattern)
      ])

    }

    else {
      this.dadosTelefone.controls['prefixo'].disable();
      this.dadosTelefone.controls['numero'].disable();
    }

    this.dadosTelefone.controls['prefixo'].updateValueAndValidity();
    this.dadosTelefone.controls['numero'].updateValueAndValidity();
  }

  private atualizaTelefoneComTelefoneEncontradoPeloCnpj(telefone: Telefone) {
    this.setValueParaAtributoDadosTelefone('tipoTelefone', telefone.tipoTelefone);
    this.atualizaValidatorsTelefone();
    this.dadosTelefone.setValue({
      tipoTelefone: telefone.tipoTelefone,
      prefixo: telefone.prefixo,
      numero: telefone.numero,
    })
    this.dadosTelefone.markAllAsTouched();
  }

  verificaSePrefixoTelefoneNuloOuVazio(): boolean {
    if (this.getValueAtributoDadosTelefone('prefixo') != '') return true;
    return false;
  }

  verificaSeTipoTelefoneNuloOuVazio(): boolean {
    if (this.getValueAtributoDadosTelefone('tipoTelefone') != '') return true;
    return false;
  }

  realizaTratamentoPrefixo() {
    this.setValueParaAtributoDadosTelefone('prefixo', this.getValueAtributoDadosTelefone('prefixo')
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim());
  }

  realizaTratamentoNumeroTelefone() {
    this.setValueParaAtributoDadosTelefone('numero', this.getValueAtributoDadosTelefone('numero')
      .replace(/[&\/\\#,+@=!"_ªº¹²³£¢¬()$~%.;':*?<>{}-]/g, "")
      .replace(/[^0-9.]/g, '')
      .trim());
  }

  protected avancaProximaEtapa() {
    if (this.dadosTelefone.invalid) {
      this.dadosTelefone.markAllAsTouched();
      this._snackBar.open('Ops! Algum campo está incorreto. Revise o formulário e tente novamente.', "Fechar", {
        duration: 3500
      })
    }
  }

  retornaPatternNumeroTelefoneParaTipoDeTelefoneAtual(): any {
    return this.clientePreAtualizacao.telefone.tipoTelefone == 'FIXO' ? /^\d{4}\d{4}/ : /^\d\d{4}\d{4}/;
  }

}
