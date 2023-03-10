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
    exclusaoCliente: ExclusaoCliente,
    endereco: Endereco,
    telefone: Telefone,
    idColaboradorResponsavel: number,
    idEmpresa: number
}