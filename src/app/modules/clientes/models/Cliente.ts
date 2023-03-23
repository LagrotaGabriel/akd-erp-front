import { Endereco } from "src/app/shared/models/Endereco";
import { Telefone } from "src/app/shared/models/Telefone";
import { ExclusaoCliente } from "./ExclusaoCliente";

export interface Cliente {
    id: number,
    dataCadastro: string,
    horaCadastro: string,
    dataNascimento: string,
    nome: string,
    cpfCnpj: string,
    inscricaoEstadual: string,
    email: string,
    statusCliente: string,
    qtdOrdensRealizadas: number,
    giroTotal: number,
    exclusaoCliente: ExclusaoCliente,
    endereco: Endereco,
    telefone: Telefone,
    nomeColaboradorResponsavel: string,
    checked?: boolean,
    expanded?: boolean,
}