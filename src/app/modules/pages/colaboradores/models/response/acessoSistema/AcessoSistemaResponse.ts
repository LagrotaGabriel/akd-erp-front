export class AcessoSistemaResponse {
    acessoSistemaAtivo: boolean;
    senha: string;
    permissaoEnum: string;
    privilegios: string[];

    constructor(item) {
        this.acessoSistemaAtivo = item?.acessoSistemaAtivo;
        this.senha = item?.senha;
        this.permissaoEnum = item?.permissaoEnum;
        this.privilegios = item?.privilegios;
    }
}