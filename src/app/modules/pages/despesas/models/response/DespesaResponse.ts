import { TableOptions } from "src/app/modules/shared/tabela/models/TableOptions";

export class DespesaResponse {
    id: number;
    dataCadastro: string;
    horaCadastro: string;
    dataPagamento: string;
    dataAgendamento: string;
    descricao: string;
    valor: number;
    qtdRecorrencias: number;
    observacao: string;
    tipoRecorrencia: string;
    statusDespesa: string;
    tipoDespesa: string;
    checked?: boolean;
    expanded?: boolean;
    options?: TableOptions;

    constructor(item) {
        this.dataCadastro = item?.dataCadastro;
        this.horaCadastro = item?.horaCadastro;
        this.dataPagamento = item?.dataPagamento;
        this.dataAgendamento = item?.dataAgendamento;
        this.descricao = item?.descricao;
        this.valor = item?.valor;
        this.qtdRecorrencias = item?.qtdRecorrencias;
        this.observacao = item?.observacao;
        this.tipoRecorrencia = item?.tipoRecorrencia;
        this.statusDespesa = item?.statusDespesa;
        this.tipoDespesa = item?.tipoDespesa;
        this.options = {
            detalhesHabilitado: true,
            editarHabilitado: true,
            removerHabilitado: true
        }
    }

    isChecked(): boolean {
        return this.checked;
    }
}