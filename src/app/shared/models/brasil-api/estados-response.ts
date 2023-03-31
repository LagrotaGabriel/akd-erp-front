export class EstadosResponse {
    sigla: string;
    nome: string;

    constructor(item) {
        this.sigla = item?.sigla;
        this.nome = item?.nome;
    }


}
