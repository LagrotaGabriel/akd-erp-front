import { Component, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectOption } from 'src/app/modules/shared/inputs/models/select-option';
import { Util } from 'src/app/modules/utils/Util';
import { fadeInOutAnimation } from 'src/app/shared/animations';
import { DespesaRequest } from '../models/request/DespesaRequest';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { DespesaService } from '../services/despesa.service';
import { DespesaResponse } from '../models/response/DespesaResponse';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss'],
  animations: [fadeInOutAnimation]
})
export class NewComponent {

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private despesaService: DespesaService,
    private ref: ChangeDetectorRef) { }

  @ViewChild('inputValor') inputValor: ElementRef;

  protected dadosDespesa: FormGroup = this.createForm();

  protected despesaRequest: DespesaRequest;
  protected despesaPreAtualizacao: DespesaResponse;

  titulo: string = 'Cadastrar nova despesa';
  idDespesa: number = null;

  private criaNovaDespesaSubscription$: Subscription;
  private obtemDespesaPorIdSubscription$: Subscription;
  private atualizaDespesaSubscription$: Subscription;

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      if (params.has('id')) {
        this.titulo = 'Editar despesa';
        let id = params.get('id');
        if (/^\d+$/.test(id)) {
          this.idDespesa = parseInt(id);
          this.inicializaDespesa(parseInt(id));
        }
        else {
          this.router.navigate(['/despesas']);
          this._snackBar.open("A despesa que você tentou editar não existe", "Fechar", {
            duration: 3500
          });
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.ref.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.criaNovaDespesaSubscription$ != undefined) this.criaNovaDespesaSubscription$.unsubscribe();
    if (this.obtemDespesaPorIdSubscription$ != undefined) this.obtemDespesaPorIdSubscription$.unsubscribe();
    if (this.atualizaDespesaSubscription$ != undefined) this.atualizaDespesaSubscription$.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      descricao: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ],
      valor: [
        '',
        [
          Validators.required
        ]
      ],
      tipoDespesa: [
        'FIXO',
        [
          Validators.required
        ]
      ],
      statusDespesa: [
        'PAGO',
        [
          Validators.required
        ]
      ],
      qtdRecorrencias: [
        '0',
        [
          Validators.required
        ]
      ],
      dataPagamento: [
        Util.getDiaMesAnoAtual(),
        [
          Validators.required,
          this.customValidatorDataPagamento()
        ]
      ],
      dataAgendamento: [
        '',
        [
          this.customValidatorDataAgendamento()
        ]
      ]
    });
  }

  protected getValueAtributoDadosDespesas(atributo: string): any {
    if (Util.isObjectEmpty(this.dadosDespesa)) return null;
    return this.dadosDespesa.controls[atributo].value;
  }

  protected geraOptionsTipoDespesa(): SelectOption[] {
    let options: SelectOption[] = [
      {
        text: 'Fixo',
        value: 'FIXO'
      },
      {
        text: 'Variável',
        value: 'VARIAVEL'
      },
      {
        text: 'Investimento',
        value: 'INVESTIMENTO'
      }
    ]
    return options;
  }

  protected geraOptionsStatusDespesa(): SelectOption[] {
    let options: SelectOption[] = [
      {
        text: 'Pago',
        value: 'PAGO'
      },
      {
        text: 'Pendente',
        value: 'PENDENTE'
      }
    ]
    return options;
  }

  protected geraOptionsQtdRecorrencia(): SelectOption[] {

    let options: SelectOption[] = [
      {
        text: 'Sem recorrência',
        value: '0'
      },
      {
        text: '1 Mês - Até ' + Util.somaMesesNaDataAtual(1),
        value: '1'
      },
      {
        text: '2 Meses - Até ' + Util.somaMesesNaDataAtual(2),
        value: '2'
      },
      {
        text: '3 Meses - Até ' + Util.somaMesesNaDataAtual(3),
        value: '3'
      },
      {
        text: '4 Meses - Até ' + Util.somaMesesNaDataAtual(4),
        value: '4'
      },
      {
        text: '5 Meses - Até ' + Util.somaMesesNaDataAtual(5),
        value: '5'
      },
      {
        text: '6 Meses - Até ' + Util.somaMesesNaDataAtual(6),
        value: '6'
      },
      {
        text: '7 Meses - Até ' + Util.somaMesesNaDataAtual(7),
        value: '7'
      },
      {
        text: '8 Meses - Até ' + Util.somaMesesNaDataAtual(8),
        value: '8'
      },
      {
        text: '9 Meses - Até ' + Util.somaMesesNaDataAtual(9),
        value: '9'
      },
      {
        text: '10 Meses - Até ' + Util.somaMesesNaDataAtual(10),
        value: '10'
      },
      {
        text: '11 Meses - Até ' + Util.somaMesesNaDataAtual(11),
        value: '11'
      },
      {
        text: '12 Meses - Até ' + Util.somaMesesNaDataAtual(12),
        value: '12'
      }
    ]
    return options;
  }

  protected getHoje(): string {
    return Util.getDiaMesAnoAtual();
  }

  protected alteraStatusDespesa() {
    let status = this.getValueAtributoDadosDespesas('statusDespesa');

    if (status == 'PAGO') {
      this.dadosDespesa.controls['dataAgendamento'].setValue('');
      this.dadosDespesa.controls['dataAgendamento'].removeValidators(Validators.required);

      this.dadosDespesa.controls['dataPagamento'].setValue(this.getHoje());
      this.dadosDespesa.controls['dataPagamento'].setValidators(
        [
          Validators.required,
          this.customValidatorDataPagamento()
        ]
      );
    }
    else if (status == 'PENDENTE') {
      this.dadosDespesa.controls['dataPagamento'].setValue('');
      this.dadosDespesa.controls['dataPagamento'].removeValidators(Validators.required);

      this.dadosDespesa.controls['dataAgendamento'].setValue(this.getHoje());
      this.dadosDespesa.controls['dataAgendamento'].setValidators(
        [
          Validators.required,
          this.customValidatorDataAgendamento()
        ]
      );
    }
    this.dadosDespesa.controls['dataAgendamento'].updateValueAndValidity();
    this.dadosDespesa.controls['dataPagamento'].updateValueAndValidity();
  }

  protected realizaTratamentoValor(evento) {

    if (evento.data == '-') {
      this.dadosDespesa.controls['valor'].setValue(0);
    }

    if (this.getValueAtributoDadosDespesas('valor') != null) {
      if (this.getValueAtributoDadosDespesas('valor') < 0 || this.getValueAtributoDadosDespesas('valor').toString().includes('-')) {
        this.dadosDespesa.controls['valor'].setValue(0);
      }
      if (this.inputValor.nativeElement.value.toString().startsWith('0')) {
        this.dadosDespesa.controls['valor'].setValue(this.getValueAtributoDadosDespesas('valor'));
      }

      let inputValorSplitted = this.inputValor.nativeElement.value.toString().split(".")
      if (inputValorSplitted.length == 2) {
        if (inputValorSplitted[1].length > 2) {
          this.dadosDespesa.controls['valor'].setValue(parseFloat(inputValorSplitted[0] + '.' + inputValorSplitted[1].slice(0, 2)));
        }
      }
    }
  }

  customValidatorDataPagamento(): ValidatorFn {

    return (formGroup: AbstractControl): ValidationErrors | null => {
      if (this.getValueAtributoDadosDespesas('dataPagamento') == null)
        return null;

      if (Util.isEmptyString(this.getValueAtributoDadosDespesas('dataPagamento'))) {
        return null;
      }

      let today: Date = new Date();
      today.setHours(0, 0, 0, 0);

      let minDate: Date = new Date();
      minDate.setFullYear(1900);

      let splittedDataInput: any[] = this.getValueAtributoDadosDespesas('dataPagamento').split('-');
      let dataPagamentoInput = new Date(splittedDataInput[0], splittedDataInput[1] - 1, splittedDataInput[2]);

      if (dataPagamentoInput > today
        || (dataPagamentoInput.getFullYear() < minDate.getFullYear())
        || dataPagamentoInput.toString() == 'Invalid Date') {
        return { nameWrong: true };
      }

      return null;
    }
  }

  customValidatorDataAgendamento(): ValidatorFn {

    return (formGroup: AbstractControl): ValidationErrors | null => {
      if (this.getValueAtributoDadosDespesas('dataAgendamento') == null)
        return null;

      if (Util.isEmptyString(this.getValueAtributoDadosDespesas('dataAgendamento'))) {
        return null;
      }

      let today: Date = new Date();
      today.setHours(0, 0, 0, 0);

      let maxDate: Date = new Date();
      maxDate.setFullYear(today.getFullYear() + 10);

      let splittedDataInput: any[] = this.getValueAtributoDadosDespesas('dataAgendamento').split('-');
      let dataAgendamentoInput = new Date(splittedDataInput[0], splittedDataInput[1] - 1, splittedDataInput[2]);

      if (dataAgendamentoInput < today
        || dataAgendamentoInput.getFullYear() > maxDate.getFullYear()
        || dataAgendamentoInput.toString() == 'Invalid Date') {
        return { nameWrong: true };
      }

      return null;
    }
  }

  inicializaDespesa(id: number) {
    this.obtemDespesaPorIdSubscription$ = this.despesaService.obtemDespesaPorId(id).subscribe({
      next: (despesa: DespesaResponse) => {
        this.despesaPreAtualizacao = despesa;
      },
      complete: () => {
        this.despesaRequest = {
          id: id,
          dataPagamento: this.despesaPreAtualizacao.dataPagamento,
          dataAgendamento: this.despesaPreAtualizacao.dataAgendamento,
          descricao: this.despesaPreAtualizacao.descricao,
          valor: this.despesaPreAtualizacao.valor,
          qtdRecorrencias: this.despesaPreAtualizacao.qtdRecorrencias,
          statusDespesa: this.despesaPreAtualizacao.statusDespesa,
          tipoDespesa: this.despesaPreAtualizacao.tipoDespesa,
        }
        this.setupValoresFormDespesa();
        this.setupValidatorsFormDespesa();
      }
    })
  }

  setupValoresFormDespesa() {
    this.dadosDespesa.setValue(
      {
        descricao: this.despesaPreAtualizacao.descricao,
        valor: this.despesaPreAtualizacao.valor,
        tipoDespesa: this.despesaPreAtualizacao.tipoDespesa,
        statusDespesa: this.despesaPreAtualizacao.statusDespesa,
        qtdRecorrencias: this.despesaPreAtualizacao.qtdRecorrencias,
        dataPagamento: this.despesaPreAtualizacao.dataPagamento,
        dataAgendamento: this.despesaPreAtualizacao.dataAgendamento
      }
    )
  }

  setupValidatorsFormDespesa() {
    let status = this.getValueAtributoDadosDespesas('statusDespesa');

    if (status == 'PAGO') {
      this.dadosDespesa.controls['dataAgendamento'].setValue('');
      this.dadosDespesa.controls['dataAgendamento'].removeValidators(Validators.required);

      this.dadosDespesa.controls['dataPagamento'].setValidators(
        [
          Validators.required,
          this.customValidatorDataPagamento()
        ]
      );
    }
    else if (status == 'PENDENTE') {
      this.dadosDespesa.controls['dataPagamento'].setValue('');
      this.dadosDespesa.controls['dataPagamento'].removeValidators(Validators.required);

      this.dadosDespesa.controls['dataAgendamento'].setValidators(
        [
          Validators.required,
          this.customValidatorDataAgendamento()
        ]
      );
    }
    this.dadosDespesa.controls['dataAgendamento'].updateValueAndValidity();
    this.dadosDespesa.controls['dataPagamento'].updateValueAndValidity();
  }

  protected retornaParaVisualizacao() {
    this.router.navigate(['/despesas'])
  }

  protected solicitarEnvioDeFormulario() {
    if (this.dadosDespesa.valid) this.direcionaEnvioDeFormulario();
    else {
      this.dadosDespesa.markAllAsTouched();
      this._snackBar.open('Ops! Algum campo está incorreto. Revise o formulário e tente novamente.', "Fechar", {
        duration: 3500
      })
    }
  }

  construirObjetoDespesa() {
    this.despesaRequest = {
      id: Util.isNotEmptyNumber(this.idDespesa)
        ? this.idDespesa
        : null,
      dataPagamento: Util.isNotEmptyString(this.getValueAtributoDadosDespesas('dataPagamento'))
        ? this.getValueAtributoDadosDespesas('dataPagamento')
        : null,
      dataAgendamento: Util.isNotEmptyString(this.getValueAtributoDadosDespesas('dataAgendamento'))
        ? this.getValueAtributoDadosDespesas('dataAgendamento')
        : null,
      descricao: Util.isNotEmptyString(this.getValueAtributoDadosDespesas('descricao'))
        ? this.getValueAtributoDadosDespesas('descricao')
        : null,
      valor: Util.isNotEmptyString(this.getValueAtributoDadosDespesas('valor'))
        ? this.getValueAtributoDadosDespesas('valor')
        : null,
      qtdRecorrencias: Util.isNotEmptyString(this.getValueAtributoDadosDespesas('qtdRecorrencias'))
        ? this.getValueAtributoDadosDespesas('qtdRecorrencias')
        : null,
      statusDespesa: Util.isNotEmptyString(this.getValueAtributoDadosDespesas('statusDespesa'))
        ? this.getValueAtributoDadosDespesas('statusDespesa')
        : null,
      tipoDespesa: Util.isNotEmptyString(this.getValueAtributoDadosDespesas('tipoDespesa'))
        ? this.getValueAtributoDadosDespesas('tipoDespesa')
        : null,
    }
  }

  public direcionaEnvioDeFormulario() {
    this.construirObjetoDespesa();
    if (Util.isNotEmptyString(this.getValueAtributoDadosDespesas('dataPagamento')))
      this.despesaRequest.dataPagamento = this.datePipe.transform(this.getValueAtributoDadosDespesas('dataPagamento'), "yyyy-MM-dd");

    if (Util.isNotEmptyString(this.getValueAtributoDadosDespesas('dataAgendamento')))
      this.despesaRequest.dataAgendamento = this.datePipe.transform(this.getValueAtributoDadosDespesas('dataAgendamento'), "yyyy-MM-dd");

    if (this.dadosDespesa.valid) {
      if (Util.isEmptyNumber(this.idDespesa)) this.enviaFormularioCriacao();
      else this.enviaFormularioAtualizacao();
    }
  }

  private enviaFormularioCriacao() {
    this.criaNovaDespesaSubscription$ =
      this.despesaService.novaDespesa(this.despesaRequest).subscribe({
        error: error => {
          this._snackBar.open("Ocorreu um erro ao cadastrar a despesa", "Fechar", {
            duration: 3500
          })
        },
        complete: () => {
          this.router.navigate(['/despesas']);
          this._snackBar.open("Despesa cadastrada com sucesso", "Fechar", {
            duration: 3500
          });
        }
      });
  }

  private enviaFormularioAtualizacao() {
    this.atualizaDespesaSubscription$ =
      this.despesaService.atualizaDespesa(this.idDespesa, this.despesaRequest).subscribe({
        error: error => {
          this._snackBar.open("Ocorreu um erro ao atualizar a despesa", "Fechar", {
            duration: 3500
          })
        },
        complete: () => {
          this.router.navigate(['/despesas']);
          this._snackBar.open("Despesa atualizada com sucesso", "Fechar", {
            duration: 3500
          });
        }
      });
  }

}
