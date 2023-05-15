import { Subscription } from 'rxjs';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectOption } from 'src/app/modules/shared/inputs/models/select-option';
import { CustomSelectComponent } from 'src/app/modules/shared/inputs/custom-select/custom-select.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ColaboradorNovo } from '../../models/ColaboradorNovo';

@Component({
  selector: 'app-atualiza-dados-acesso',
  templateUrl: './atualiza-dados-acesso.component.html',
  styleUrls: ['../atualizacao.component.scss']
})
export class AtualizaDadosAcessoComponent {

  constructor(private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private ref: ChangeDetectorRef) { }

  modulosLiberados: string[] = ['HOME', 'VENDAS', 'PDV', 'ESTOQUE', 'PRECOS'];
  privilegioAtual: string = 'CLIENTES';

  @ViewChild('selectAcessoSistemaAtivo') selectAcessoSistemaAtivo: CustomSelectComponent;

  protected dadosAcesso: FormGroup = this.createForm();
  @Output() emissorDeDadosAcessoDoColaborador = new EventEmitter<FormGroup>();
  dadosAcessoSubscribe$: Subscription = this.dadosAcesso.valueChanges.subscribe({
    next: () => {
      this.emissorDeDadosAcessoDoColaborador.emit(this.dadosAcesso);
    }
  })

  @Output() emissorDeSolicitacaoDeEnvioDeFormulario = new EventEmitter();

  @Input() stepAtual: number;
  @Input() colaboradorPreAtualizacao: ColaboradorNovo;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.stepAtual == 2) {
      this.selectAcessoSistemaAtivo.acionaFoco();
    }
  }

  ngOnInit(): void {
    this.modulosLiberados = this.getValueAtributoDadosAcesso('privilegios');
    this.emissorDeDadosAcessoDoColaborador.emit(this.dadosAcesso);
  }

  ngAfterViewInit(): void {
    this.ref.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.dadosAcessoSubscribe$ != undefined) this.dadosAcessoSubscribe$.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      acessoSistemaAtivo: [true],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      permissaoEnum: ['LEITURA_BASICA'],
      privilegios: [['HOME', 'VENDAS', 'PDV', 'ESTOQUE', 'PRECOS']]
    });
  }

  protected getValueAtributoDadosAcesso(atributo: string): any {
    return this.dadosAcesso.controls[atributo].value;
  }

  protected geraOptionsAcessoSistemaAtivo(): SelectOption[] {
    let options: SelectOption[] = [
      {
        text: 'Liberado',
        value: true
      },
      {
        text: 'Bloqueado',
        value: false
      }
    ]
    return options;
  }

  protected geraOptionsPermissoes(): SelectOption[] {
    let options: SelectOption[] = [
      {
        text: 'Leitura simples',
        value: 'LEITURA_BASICA'
      },
      {
        text: 'Leitura completa',
        value: 'LEITURA_AVANCADA'
      },
      {
        text: 'Leitura simples + Alterações',
        value: 'LEITURA_BASICA_ALTERACAO'
      },
      {
        text: 'Leitura completa + Alterações',
        value: 'LEITURA_AVANCADA_ALTERACAO'
      }
    ]
    return options;
  }

  protected atualizaLiberacaoSistema() {
    if (this.getValueAtributoDadosAcesso('acessoSistemaAtivo')) {
      this.dadosAcesso.get('senha').enable();
      this.dadosAcesso.get('permissaoEnum').enable();
    }
    else {
      this.dadosAcesso.controls['privilegios'].setValue([]);
      this.modulosLiberados = this.getValueAtributoDadosAcesso('privilegios');
      this.dadosAcesso.get('senha').setValue('');
      this.dadosAcesso.get('senha').disable();
      this.dadosAcesso.get('permissaoEnum').disable();
    }
  }

  protected adicionaModulo(moduloLiberado) {
    this.getValueAtributoDadosAcesso('privilegios').push(moduloLiberado);
    this.modulosLiberados = this.getValueAtributoDadosAcesso('privilegios');
    this.privilegioAtual = '';
  }

  protected removeModulo(moduloLiberado) {
    this.getValueAtributoDadosAcesso('privilegios').splice(this.getValueAtributoDadosAcesso('privilegios').indexOf(moduloLiberado), 1);
    this.modulosLiberados = this.getValueAtributoDadosAcesso('privilegios');
  }

  protected defineIconeInputSenha() {
    if (this.dadosAcesso.controls['senha'].touched && this.dadosAcesso.controls['senha'].invalid) {
      return 'error';
    }
    else {
      if (this.getValueAtributoDadosAcesso('senha') == '' || this.getValueAtributoDadosAcesso('senha') == null) return 'lock';
      else return 'check';
    }
  }

  protected solicitarEnvioDeFormulario() {
    if (this.dadosAcesso.valid) this.emissorDeSolicitacaoDeEnvioDeFormulario.emit();
    else {
      this.dadosAcesso.markAllAsTouched();
      this._snackBar.open('Ops! Algum campo está incorreto. Revise o formulário e tente novamente.', "Fechar", {
        duration: 3500
      })
    }
  }

}