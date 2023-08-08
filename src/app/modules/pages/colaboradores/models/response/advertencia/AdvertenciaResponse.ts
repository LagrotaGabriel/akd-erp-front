export class AdvertenciaResponse {
    id?: number;
    dataCadastro?: string;
    horaCadastro?: string;
    motivo?: string;
    descricao?: string;
    statusAdvertenciaEnum?: string;
    advertenciaAssinada?: File[];
    expandido?: boolean = false;
}