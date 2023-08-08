export class FeriasResponse {
    dataCadastro: string;
    horaCadastro: string;
    totalDias: number;
    dataInicio: string;
    dataFim: string;

    constructor(item) {
        this.dataCadastro = item?.dataCadastro;
        this.horaCadastro = item?.horaCadastro;
        this.totalDias = item?.totalDias;
        this.dataInicio = item?.dataInicio;
        this.dataFim = item?.dataFim;
    }
}