export class DispensaResponse {
    dataDispensa: string;
    motivo: string;
    listaNegra: boolean;
    anexos: File[];
    contratoDispensa: File[];

    constructor(item) {
        this.dataDispensa = item?.dataDispensa;
        this.motivo = item?.motivo;
        this.listaNegra = item?.listaNegra;
        this.anexos = item?.anexos;
        this.contratoDispensa = item?.contratoDispensa;
    }
}