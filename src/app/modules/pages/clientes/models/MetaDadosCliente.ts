import { ClienteResponse } from "../../models/response/ClienteResponse";

export class MetaDadosCliente {
    totalClientesCadastrados: any;
    clienteComMaiorGiro: ClienteResponse;
    clienteComMaisOrdens: ClienteResponse;
    bairroComMaisClientes: string;

    constructor(item) {
        this.totalClientesCadastrados = item?.totalClientesCadastrados;
        this.clienteComMaiorGiro = item?.clienteComMaiorGiro;
        this.clienteComMaisOrdens = item?.clienteComMaisOrdens;
        this.bairroComMaisClientes = item?.bairroComMaisClientes;
    }
}