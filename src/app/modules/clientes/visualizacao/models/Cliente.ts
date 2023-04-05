import { Endereco } from "src/app/shared/models/Endereco";
import { Telefone } from "src/app/shared/models/Telefone";
import { ExclusaoCliente } from "./ExclusaoCliente";

export class Cliente {
    id: number;
    dataCadastro: string;
    horaCadastro: string;
    dataNascimento: string;
    nome: string;
    cpfCnpj: string;
    inscricaoEstadual: string;
    email: string;
    statusCliente: string;
    qtdOrdensRealizadas: number;
    giroTotal: number;
    exclusaoCliente: ExclusaoCliente;
    endereco: Endereco;
    telefone: Telefone;
    nomeColaboradorResponsavel: string;
    checked?: boolean;
    expanded?: boolean;

    constructor(item) {
        this.id = item?.id;
        this.dataCadastro = item?.dataCadastro;
        this.horaCadastro = item?.horaCadastro;
        this.dataNascimento = item?.dataNascimento;
        this.nome = item?.nome;
        this.cpfCnpj = item?.cpfCnpj;
        this.inscricaoEstadual = item?.inscricaoEstadual;
        this.email = item?.email;
        this.statusCliente = item?.statusCliente;
        this.qtdOrdensRealizadas = item?.qtdOrdensRealizadas;
        this.giroTotal = item?.giroTotal;
        this.exclusaoCliente = item?.exclusaoCliente;
        this.endereco = item?.endereco;
        this.telefone = item?.telefone;
        this.nomeColaboradorResponsavel = item?.nomeColaboradorResponsavel;
        this.checked = item?.checked;
        this.expanded = item?.expanded;
    }
}