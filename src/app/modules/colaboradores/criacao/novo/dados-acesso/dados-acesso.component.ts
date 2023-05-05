import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ViewChild, ElementRef, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dados-acesso',
  templateUrl: './dados-acesso.component.html',
  styleUrls: ['./dados-acesso.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate(300, style({ opacity: 0 }))
      ])
    ]),
  ]
})
export class DadosAcessoComponent {

  constructor(private formBuilder: FormBuilder,
    private ref: ChangeDetectorRef) { }

  modulosLiberados: string[] = ['HOME', 'VENDAS', 'PDV', 'ESTOQUE', 'PRECOS'];
  privilegioAtual: string = 'CLIENTES';

  @ViewChild('selectAcessoSistemaAtivo') selectAcessoSistemaAtivo: ElementRef;

  protected dadosAcesso: FormGroup = this.createForm();
  @Output() emissorDeDadosAcessoDoColaborador = new EventEmitter<FormGroup>();
  dadosAcessoSubscribe$: Subscription = this.dadosAcesso.valueChanges.subscribe({
    next: () => {
      this.emissorDeDadosAcessoDoColaborador.emit(this.dadosAcesso);
    }
  })

  @Output() emissorDeSolicitacaoDeEnvioDeFormulario = new EventEmitter();

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
    this.emissorDeSolicitacaoDeEnvioDeFormulario.emit();
  }

}
