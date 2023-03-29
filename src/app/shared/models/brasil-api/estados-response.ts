interface Regiao {
    id: number;
    sigla: string;
    nome: string;
}

export class EstadosResponse {
    id: number;
    sigla: string;
    nome: string;
    regiao: Regiao;
}
