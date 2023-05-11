import { Cliente } from "./Cliente";

export class MetaDadosCliente {
    totalClientesCadastrados: any;
    clienteComMaiorGiro: Cliente;
    clienteComMaisOrdens: Cliente;
    bairroComMaisClientes: string;

    constructor(item) {
        this.totalClientesCadastrados = item?.totalClientesCadastrados;
        this.clienteComMaiorGiro = item?.clienteComMaiorGiro;
        this.clienteComMaisOrdens = item?.clienteComMaisOrdens;
        this.bairroComMaisClientes = item?.bairroComMaisClientes;
    }
}