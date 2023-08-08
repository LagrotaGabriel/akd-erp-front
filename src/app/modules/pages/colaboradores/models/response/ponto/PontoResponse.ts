export class PontoResponse {
    horaEntrada: string;
    horaSaidaAlmoco: string;
    horaEntradaAlmoco: string;
    horaSaida: string;

    constructor(item) {
        this.horaEntrada = item?.horaEntrada;
        this.horaSaidaAlmoco = item?.horaSaidaAlmoco;
        this.horaEntradaAlmoco = item?.horaEntradaAlmoco;
        this.horaSaida = item?.horaSaida;
    }
}