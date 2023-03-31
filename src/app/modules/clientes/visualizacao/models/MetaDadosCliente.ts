import { PageObject } from "src/app/shared/models/PageObject";
import { Cliente } from "./Cliente";

export interface MetaDadosCliente {
    totalClientesCadastrados: any;
    clienteComMaiorGiro: Cliente;
    clienteComMaisOrdens: Cliente;
    bairroComMaisClientes: string;
    page: PageObject;
}