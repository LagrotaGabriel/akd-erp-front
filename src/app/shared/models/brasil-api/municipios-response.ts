export class MunicipiosResponse {
    nome: string;

    constructor(item) {
        this.nome = item?.nome;
    }
}
