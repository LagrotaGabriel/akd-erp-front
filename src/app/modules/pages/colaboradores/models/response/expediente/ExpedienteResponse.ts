export class ExpedienteResponse {
    horaEntrada: string;
    horaSaidaAlmoco: string;
    horaEntradaAlmoco: string;
    horaSaida: string;
    cargaHorariaSemanal: string;
    escalaEnum: string;

    constructor(item) {
        this.horaEntrada = item?.horaEntrada;
        this.horaSaidaAlmoco = item?.horaSaidaAlmoco;
        this.horaEntradaAlmoco = item?.horaEntradaAlmoco;
        this.horaSaida = item?.horaSaida;
        this.cargaHorariaSemanal = item?.cargaHorariaSemanal;
        this.escalaEnum = item?.escalaEnum;
    }
}