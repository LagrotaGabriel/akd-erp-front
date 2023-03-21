import { TiposFiltro } from 'src/app/shared/models/filtros/TiposFiltro';
import { Filtro, InputTypeFiltro } from './../models/filtros/Filtro';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FiltrosService {

  filtros: Filtro[] = [];

  public setaTiposFiltro(tipoFiltros: TiposFiltro[]) {

    tipoFiltros.forEach(tipoFiltro => {

      switch (tipoFiltro) {
        case "nome":
          this.filtros.push({
            disabled: false,
            tipoFiltro: TiposFiltro.NOME,
            descricao: 'nome',
            descricaoChip: 'Nome',
            descricaoOption: 'Por nome',
            valorDefault: '',
            textoPlaceholder: 'Busca por nome',
            tamanhoMinimo: '1',
            tamanhoMaximo: '40',
            tipoInput: InputTypeFiltro.TEXT
          })
          break;
        case "email":
          this.filtros.push({
            disabled: false,
            tipoFiltro: TiposFiltro.EMAIL,
            descricao: 'email',
            descricaoChip: 'E-mail',
            descricaoOption: 'Por e-mail',
            valorDefault: '',
            textoPlaceholder: 'Busca por e-mail',
            tamanhoMinimo: '1',
            tamanhoMaximo: '40',
            tipoInput: InputTypeFiltro.TEXT
          })
          break
        case "cpfCnpj":
          this.filtros.push({
            disabled: false,
            tipoFiltro: TiposFiltro.CPF_CNPJ,
            descricao: 'cpfCnpj',
            descricaoChip: 'Cpf/Cnpj',
            descricaoOption: 'Por cpf/cnpj',
            valorDefault: '',
            textoPlaceholder: 'Busca por cpf ou cnpj',
            tamanhoMinimo: '1',
            tamanhoMaximo: '18',
            tipoInput: InputTypeFiltro.TEXT
          })
          break;
        case "bairro":
          this.filtros.push({
            disabled: false,
            tipoFiltro: TiposFiltro.BAIRRO,
            descricao: 'bairro',
            descricaoChip: 'Bairro',
            descricaoOption: 'Por bairro',
            valorDefault: '',
            textoPlaceholder: 'Busca por bairro',
            tamanhoMinimo: '1',
            tamanhoMaximo: '30',
            tipoInput: InputTypeFiltro.TEXT
          })
          break;
        case "data":
          this.filtros.push({
            disabled: false,
            tipoFiltro: TiposFiltro.DATA,
            descricao: 'data',
            descricaoChip: 'Data',
            descricaoOption: 'Por data',
            valorDefault: new Date().toISOString().slice(0, 10),
            textoPlaceholder: 'Busca por data',
            tamanhoMinimo: '2023-01-01',
            tamanhoMaximo: new Date().toISOString().slice(0, 10),
            tipoInput: InputTypeFiltro.DATE
          })
          break;
        case "mesAno":
          this.filtros.push({
            disabled: false,
            tipoFiltro: TiposFiltro.MES_ANO,
            descricao: 'periodo',
            descricaoChip: 'Período',
            descricaoOption: 'Por mês/ano',
            valorDefault: '2023-03',
            textoPlaceholder: 'Busca por mês e ano',
            tamanhoMinimo: '2023-01-01',
            tamanhoMaximo: new Date().toISOString().slice(0, 7),
            tipoInput: InputTypeFiltro.MONTH
          })
          break;
      }

    })

    return this.filtros;
  }

}
