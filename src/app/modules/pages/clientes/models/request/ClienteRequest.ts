import { EnderecoResponse } from "src/app/shared/models/endereco/response/EnderecoResponse";
import { TelefoneRequest } from "src/app/shared/models/telefone/request/TelefoneRequest";

export class ClienteRequest {
    nome: string;
    tipoPessoa: string;
    statusCliente: string;
    cpfCnpj: string;
    inscricaoEstadual: string;
    email: string;
    dataNascimento: string;
    telefone: TelefoneRequest;
    endereco: EnderecoResponse; 

    constructor(item) {
        this.nome = item?.nome;
        this.tipoPessoa = item?.tipoPessoa;
        this.statusCliente = item?.statusCliente;
        this.cpfCnpj = item?.cpfCnpj;
        this.inscricaoEstadual = item?.inscricaoEstadual;
        this.email = item?.email;
        this.dataNascimento = item?.dataNascimento;
        this.telefone = item?.telefone;
        this.endereco = item?.endereco;
    }
}