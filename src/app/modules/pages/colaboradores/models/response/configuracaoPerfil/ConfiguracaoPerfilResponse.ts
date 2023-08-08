export class ConfiguracaoPerfilResponse {
    dataUltimaAtualizacao: string;
    horaUltimaAtualizacao: string;
    temaTelaEnum: string;

    constructor(item) {
        this.dataUltimaAtualizacao = item?.dataUltimaAtualizacao;
        this.horaUltimaAtualizacao = item?.horaUltimaAtualizacao;
        this.temaTelaEnum = item?.temaTelaEnum;
    }
}