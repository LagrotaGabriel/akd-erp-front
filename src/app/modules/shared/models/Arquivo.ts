export class Arquivo {
    id?: number;
    nome?: string;
    tamanho?: number;
    tipo?: string;
    arquivo?: File;

    constructor(item) {
        this.id = item?.id;
        this.nome = item?.nome;
        this.tamanho = item?.tamanho;
        this.tipo = item?.tipo;
        this.arquivo = item?.arquivo;
    }
}