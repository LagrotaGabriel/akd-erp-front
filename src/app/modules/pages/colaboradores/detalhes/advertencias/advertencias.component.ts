import { Component } from '@angular/core';
import { AdvertenciaService } from '../../services/advertencia.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvertenciaPageObject } from '../models/AdvertenciaPageObject';
import { Util } from 'src/app/modules/utils/Util';
import { Advertencia } from '../../models/Advertencia';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectOption } from 'src/app/modules/shared/inputs/models/select-option';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SlideInOutAnimation, fadeInOutAnimation, slideUpDownAnimation } from 'src/app/shared/animations';

@Component({
  selector: 'app-advertencias',
  templateUrl: './advertencias.component.html',
  styleUrls: ['./advertencias.component.scss'],
  animations: [SlideInOutAnimation, fadeInOutAnimation, slideUpDownAnimation],
})
export class AdvertenciasComponent {

  constructor(private formBuilder: FormBuilder,
    private advertenciaService: AdvertenciaService,
    private activatedRoute: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private router: Router) {
  }

  protected novaAdvertenciaHabilitada: boolean = false;

  protected dadosNovaAdvertencia: FormGroup = this.createFormDadosCliente();

  protected documentoAdvertencia: File;

  protected advertencias: AdvertenciaPageObject;

  ngAfterViewInit(): void {
    this.realizaObtencaoDasAdvertenciasDoColaborador();
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
          Validators.maxLength(120),
          Validators.required
        ]
      ),
      status: new FormControl(
        {
          value: '',
          disabled: false
        },
        [
          Validators.required
        ]
      ),
      advertenciaAssinada: [null]
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
      const allowed_types = ['image/png', 'image/jpeg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

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
  }

  geraEndPointAcessoItemAdvertencia(advertencia: Advertencia): string {
    //TODO DEVE GERAR UM PDF DA ADVERTÊNCIA GERADA
    return null;
  }

  realizaObtencaoDasAdvertenciasDoColaborador() {
    this.advertenciaService.getAcoes(Util.isNotObjectEmpty(this.advertencias) ? this.advertencias : null,
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
