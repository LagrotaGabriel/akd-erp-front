import { Endereco } from "./endereco";
import { Telefone } from "./telefone";

export class Cliente {
    nome: string;
    tipoPessoa: string;
    cpfCnpj?: string;
    inscricaoEstadual?: string;
    email?: string;
    dataNascimento?: string;
    status: string;
    telefone?: Telefone;
    endereco?: Endereco; 
}
