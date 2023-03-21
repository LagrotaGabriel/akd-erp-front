import { TiposFiltro } from "./TiposFiltro";

export enum InputTypeFiltro {
    TEXT = 'text',
    DATE = 'date',
    MONTH = 'month'
  }

export interface Filtro {
    disabled: boolean;
    tipoFiltro: TiposFiltro;
    descricao: string;
    descricaoChip: string;
    descricaoOption: string;
    valorDefault: string;
    textoPlaceholder: string;
    tamanhoMinimo: string;
    tamanhoMaximo: string;
    tipoInput: InputTypeFiltro;
}