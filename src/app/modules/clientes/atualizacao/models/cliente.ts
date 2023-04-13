import { Endereco } from "./endereco";
import { Telefone } from "./telefone";

export class Cliente {
    nome: string;
    tipoPessoa: string;
    cpfCnpj: string;
    inscricaoEstadual: string;
    email: string;
    dataNascimento: string;
    statusCliente: string;
    telefone: Telefone;
    endereco: Endereco; 

    constructor(item) {
        this.nome = item?.nome;
        this.tipoPessoa = item?.tipoPessoa;
        this.cpfCnpj = item?.cpfCnpj;
        this.inscricaoEstadual = item?.inscricaoEstadual;
        this.email = item?.email;
        this.dataNascimento = item?.dataNascimento;
        this.statusCliente = item?.statusCliente;
        this.telefone = item?.telefone;
        this.endereco = item?.endereco;
    }
}
