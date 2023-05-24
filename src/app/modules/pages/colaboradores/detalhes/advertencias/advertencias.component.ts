import { Component, ViewChild, Input, SimpleChanges } from '@angular/core';
import { AdvertenciaService } from '../../services/advertencia.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvertenciaPageObject } from '../models/AdvertenciaPageObject';
import { Util } from 'src/app/modules/utils/Util';
import { Advertencia } from '../../models/Advertencia';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectOption } from 'src/app/modules/shared/inputs/models/select-option';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInOutAnimation, slideUpDownAnimation } from 'src/app/shared/animations';
import { CustomInputComponent } from 'src/app/modules/shared/inputs/custom-input/custom-input.component';

@Component({
  selector: 'app-advertencias',
  templateUrl: './advertencias.component.html',
  styleUrls: ['./advertencias.component.scss'],
  animations: [fadeInOutAnimation, slideUpDownAnimation],
})
export class AdvertenciasComponent {

  constructor(private formBuilder: FormBuilder,
    private advertenciaService: AdvertenciaService,
    private activatedRoute: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private router: Router) {
  }

  @Input() abaSelecionada;

  protected novaAdvertenciaHabilitada: boolean = false;

  @ViewChild('inputMotivo') inputMotivo: CustomInputComponent;

  private novaAdvertencia: Advertencia
  protected dadosNovaAdvertencia: FormGroup = this.createFormDadosCliente();

  protected documentoAdvertencia: File;
  protected documentoAdvertenciaAtualizado: File;

  protected advertencias: AdvertenciaPageObject;

  ngAfterViewInit(): void {
    this.realizaObtencaoDasAdvertenciasDoColaborador();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.novaAdvertenciaHabilitada) this.alteraExibicaoNovaAdvertencia();
    this.fechaTodasAdvertencias();
  }

  createFormDadosCliente(): FormGroup {
    return this.formBuilder.group({
      motivo: new FormControl(
        {
          value: '',
          disabled: false
        },
        [
          Validators.maxLength(40),
          Validators.required
        ]
      ),
      descricao: new FormControl(
        {
          value: '',
          disabled: false
        },
        [
          Validators.maxLength(500),
          Validators.required
        ]
      ),
      status: new FormControl(
        {
          value: 'PENDENTE',
          disabled: false
        },
        [
          Validators.required
        ]
      ),
      advertenciaAssinada: new FormControl(
        {
          value: null,
          disabled: false
        }
      )
    });
  }

  protected getValueAtributoDadosNovaAdvertencia(atributo: string): any {
    return this.dadosNovaAdvertencia.controls[atributo].value;
  }

  protected geraOptionsStatusAdvertencia(): SelectOption[] {
    let options: SelectOption[] = [
      {
        text: 'Sem assinatura',
        value: 'PENDENTE'
      },
      {
        text: 'Assinada',
        value: 'ASSINADA'
      }
    ]
    return options;
  }

  protected setaArquivo(event) {
    if (event.target.files[0] == undefined) this.documentoAdvertencia = null;
    else {
      const max_size = 1048576;
      const allowed_types = ['application/pdf'];

      if (event.target.files[0].size > max_size) {
        this._snackBar.open("O tamanho do arquivo não pode ser maior do que 1MB", "Fechar", {
          duration: 5000
        })
        this.limpaInputArquivo();
        return;
      }
      else if (!(allowed_types.includes(event.target.files[0].type))) {
        this._snackBar.open("Tipo de arquivo inválido. Escolha uma imagem, um pdf ou um arquivo word", "Fechar", {
          duration: 5000
        })
        this.limpaInputArquivo();
        return;
      }
      else {
        this.documentoAdvertencia = event.target.files[0];
      }

    }
  }

  protected limpaInputArquivo() {
    this.dadosNovaAdvertencia.controls['advertenciaAssinada'].setValue(null);
    this.documentoAdvertencia = null;
  }

  protected alteraExibicaoNovaAdvertencia() {
    this.novaAdvertenciaHabilitada = !this.novaAdvertenciaHabilitada;
    if (!this.novaAdvertenciaHabilitada) {
      this.limpaInputArquivo();
      this.dadosNovaAdvertencia.reset();
    }
    else {
      setTimeout(() => {
        this.inputMotivo.acionaFoco();
      }, 100);
    }
  }

  protected gerarAdvertencia() {
    if (this.dadosNovaAdvertencia.valid) {
      this.constroiObjetoAdvertencia();
      this.advertenciaService.novaAdvertencia(this.novaAdvertencia, this.documentoAdvertencia, parseInt(this.activatedRoute.snapshot.paramMap.get('id')));
      setTimeout(() => {
        this.realizaObtencaoDasAdvertenciasDoColaborador();
      }, 2000);
    }
    else {
      this._snackBar.open('Favor revisar os campos do formulário e tentar novamente', 'Fechar', {
        duration: 3000
      })
      this.dadosNovaAdvertencia.markAllAsTouched();
    }
  }

  protected constroiObjetoAdvertencia() {
    this.novaAdvertencia = {
      motivo: this.getValueAtributoDadosNovaAdvertencia('motivo'),
      descricao: this.getValueAtributoDadosNovaAdvertencia('descricao'),
      statusAdvertenciaEnum: this.getValueAtributoDadosNovaAdvertencia('status')
    }
  }

  protected chamadaServicoDeObtencaoDeAnexoAdvertencia(advertencia: Advertencia) {
    if (Util.isObjectEmpty(advertencia.advertenciaAssinada)) return null;
    this.advertenciaService.obtemAnexoAdvertencia(parseInt(this.activatedRoute.snapshot.paramMap.get('id')), advertencia.id);
  }

  protected chamadaServicoDeObtencaoDePdfPadrao(idAdvertencia: number) {
    this.advertenciaService.obtemPdfPadrao(parseInt(this.activatedRoute.snapshot.paramMap.get('id')), idAdvertencia);
  }

  protected chamadaServicoDeAtualizacaoDeStatusAdvertencia(advertencia: Advertencia) {

    let novoStatusAdvertencia: string = advertencia.statusAdvertenciaEnum == 'PENDENTE' ? 'ASSINADA' : 'PENDENTE';

    this.advertenciaService.atualizaStatusAdvertencia(novoStatusAdvertencia, parseInt(this.activatedRoute.snapshot.paramMap.get('id')), advertencia.id).subscribe({
      complete: () => {
        this._snackBar.open('Status da advertência alterado com sucesso!', 'Fechar', {
          duration: 3500
        });
        this.realizaObtencaoDasAdvertenciasDoColaborador();
      }
    });
  }

  protected chamadaServicoDeRemocaoDeAdvertencia(advertencia: Advertencia) {

    this.advertenciaService.removeAdvertencia(parseInt(this.activatedRoute.snapshot.paramMap.get('id')), advertencia.id).subscribe({
      complete: () => {
        this._snackBar.open('Advertência removida com sucesso!', 'Fechar', {
          duration: 3500
        });
        this.realizaObtencaoDasAdvertenciasDoColaborador();
      }
    });
  }

  protected atualizaArquivoAdvertencia(event, advertencia: Advertencia) {

    if (advertencia.advertenciaAssinada != null) {
      if (window.confirm('Tem certeza que deseja substituir o arquivo existente na advertência?')) null;
      else return;
    }

    if (event.target.files[0] == undefined) this.documentoAdvertenciaAtualizado = null;
    else {
      const max_size = 1048576;
      const allowed_types = ['application/pdf'];

      if (event.target.files[0].size > max_size) {
        this._snackBar.open("O tamanho do arquivo não pode ser maior do que 1MB", "Fechar", {
          duration: 5000
        })
        this.limpaInputArquivoAtualizado();
        return;
      }
      else if (!(allowed_types.includes(event.target.files[0].type))) {
        this._snackBar.open("Tipo de arquivo inválido. Escolha uma imagem, um pdf ou um arquivo word", "Fechar", {
          duration: 5000
        })
        this.limpaInputArquivoAtualizado();
        return;
      }
      else {
        this.documentoAdvertenciaAtualizado = event.target.files[0];
        this.advertenciaService.atualizaAnexoAdvertencia(this.documentoAdvertenciaAtualizado,
          parseInt(this.activatedRoute.snapshot.paramMap.get('id')),
          advertencia.id).subscribe({
            complete: () => {
              this._snackBar.open('Arquivo anexado à advertência com sucesso!', 'Fechar', {
                duration: 3000
              });
              this.limpaInputArquivoAtualizado();
              this.realizaObtencaoDasAdvertenciasDoColaborador();
            }
          })


      }

    }
  }

  protected limpaInputArquivoAtualizado() {
    this.documentoAdvertenciaAtualizado = null;
  }

  fechaTodasAdvertencias() {
    if (Util.isNotObjectEmpty(this.advertencias)) {
      this.advertencias.content.forEach(advertencia => {
        advertencia.expandido = false;
      })
    }
  }

  realizaObtencaoDasAdvertenciasDoColaborador() {
    this.advertenciaService.getAdvertencias(Util.isNotObjectEmpty(this.advertencias) ? this.advertencias : null,
      parseInt(this.activatedRoute.snapshot.paramMap.get('id'))).subscribe({
        next: (resposta => {
          console.log(resposta);
          this.advertencias = resposta;
        }),
        error: () => {
          this.router.navigate(['/colaboradores/' + this.activatedRoute.snapshot.paramMap.get('id')]);
        }
      })
  }

  // ==================== PAGINAÇÃO ==========================

  GeraNumerosParaNavegarNaPaginacao(n: number): Array<number> {
    return Array(n);
  }

  selecionarPagina(numeroPagina: number) {
    this.advertencias.pageNumber = numeroPagina;
    this.realizaObtencaoDasAdvertenciasDoColaborador();
  }

  geraBotaoVoltarPaginacao(): string {
    if (window.innerWidth > 340) return 'Voltar'
    else return '<';
  }

  geraBotaoAvancarPaginacao(): string {
    if (window.innerWidth > 340) return 'Próximo'
    else return '>';
  }

  voltarPagina() {
    if (this.advertencias.pageNumber > 0) {
      this.advertencias.pageNumber--;
      this.realizaObtencaoDasAdvertenciasDoColaborador();
    }
  }

  avancarPagina() {
    if (this.advertencias.pageNumber < this.advertencias.totalPages - 1) {
      this.advertencias.pageNumber++;
      this.realizaObtencaoDasAdvertenciasDoColaborador();
    }
  }

}
