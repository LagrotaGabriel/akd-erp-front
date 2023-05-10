import { Subscription, debounceTime } from 'rxjs';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BrasilApiService } from 'src/app/shared/services/brasil-api.service';
import { ClienteService } from '../../../services/cliente.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { SelectOption } from 'src/app/modules/shared/inputs/models/select-option';
import { CustomSelectComponent } from 'src/app/modules/shared/inputs/custom-select/custom-select.component';

@Component({
  selector: 'app-dados-telefone',
  templateUrl: './dados-telefone.component.html',
  styleUrls: ['./dados-telefone.component.scss']
})
export class DadosTelefoneComponent {

  constructor(private formBuilder: FormBuilder,
    private brasilApiService: BrasilApiService,
    private clienteService: ClienteService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private ref: ChangeDetectorRef) { }

  // Validations
  inputLengthPrefixo: number = 2;
  inputPrefixoPattern: any = /^\d{2}/;
  inputLengthTelefone: number;
  inputTelefonePattern: any;

  // Tags html
  @ViewChild('SelectTipoTelefone') selectTipoTelefone: CustomSelectComponent;

  @Input() stepAtual: number;

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
    if (this.stepAtual == 1) {
      setTimeout(() => {
        this.selectTipoTelefone.acionaFoco();
      }, 300);
    }
  }

  ngOnDestroy(): void {
    if (this.dadosTelefoneSubscribe$ != undefined) this.dadosTelefoneSubscribe$.unsubscribe();
  }

  createFormDadosTelefone(): FormGroup {
    return this.formBuilder.group({
      tipoTelefone: [''],
      prefixo: new FormControl(
        {
          value: '',
          disabled: true
        },
        [
          Validators.minLength(this.inputLengthPrefixo),
          Validators.maxLength(this.inputLengthPrefixo),
          Validators.pattern(this.inputPrefixoPattern)]
      ),
      numero: new FormControl(
        {
          value: '',
          disabled: true
        },
        [
          Validators.minLength(this.inputLengthTelefone),
          Validators.maxLength(this.inputLengthTelefone),
          Validators.pattern(this.inputTelefonePattern)]
      ),
    });
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

  atualizaValidatorsTelefone() {
    this.setValueParaAtributoDadosTelefone('prefixo', '');
    this.dadosTelefone.controls['prefixo'].reset();

    this.setValueParaAtributoDadosTelefone('numero', '');
    this.dadosTelefone.controls['numero'].reset();

    this.dadosTelefone.controls['prefixo'].clearValidators();
    this.dadosTelefone.controls['numero'].clearValidators();

    if (this.getValueAtributoDadosTelefone('tipoTelefone') != '' && this.getValueAtributoDadosTelefone('tipoTelefone') != null) {

      this.dadosTelefone.controls['prefixo'].enable();
      this.dadosTelefone.controls['numero'].enable();

      if (this.getValueAtributoDadosTelefone('tipoTelefone') == 'FIXO') {
        this.inputLengthTelefone = 8;
        this.inputTelefonePattern = /^\d{4}\d{4}/;
      }

      else if (this.getValueAtributoDadosTelefone('tipoTelefone') == 'MOVEL' || this.getValueAtributoDadosTelefone('tipoTelefone') == 'MOVEL_WHATSAPP') {
        this.inputLengthTelefone = 9;
        this.inputTelefonePattern = /^\d\d{4}\d{4}/;
      }

      //TODO VERIFICAR POSSIBILIDADE DE ADICIONAR VALIDATORS EM MASSA
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

  verificaSePrefixoTelefoneNuloOuVazio(): boolean {
    if (
      this.getValueAtributoDadosTelefone('prefixo') != null
      && this.getValueAtributoDadosTelefone('prefixo') != undefined
      && this.getValueAtributoDadosTelefone('prefixo') != '') {
      return true;
    }
    return false;
  }

  verificaSeTipoTelefoneNuloOuVazio(): boolean {
    if (
      this.getValueAtributoDadosTelefone('tipoTelefone') != null
      && this.getValueAtributoDadosTelefone('tipoTelefone') != undefined
      && this.getValueAtributoDadosTelefone('tipoTelefone') != '') {
      return true;
    }
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

}
