import { EnderecoRequest } from "src/app/shared/models/endereco/request/EnderecoRequest";
import { TelefoneRequest } from "src/app/shared/models/telefone/request/TelefoneRequest";
import { ExpedienteRequest } from "../expediente/ExpedienteRequest";
import { AcessoSistemaRequest } from "../acessoSistema/AcessoSistemaRequest";
import { Arquivo } from "src/app/modules/shared/models/Arquivo";

export class ColaboradorRequest {
    id?: number;
    nome: string;
    cpfCnpj?: string;
    dataNascimento?: string;
    email?: string;
    telefone?: TelefoneRequest;
    endereco?: EnderecoRequest;
    tipoOcupacaoEnum: string;
    ocupacao?: string;
    statusColaboradorEnum: string;
    modeloContratacaoEnum: string;
    modeloTrabalhoEnum: string;
    salario?: number;
    entradaEmpresa?: string;
    saidaEmpresa?: string;
    contratoContratacao?: Arquivo;
    expediente?: ExpedienteRequest;
    acessoSistema?: AcessoSistemaRequest;

    constructor(item) {
        this.id = item?.id;
        this.nome = item?.nome;
        this.cpfCnpj = item?.cpfCnpj;
        this.dataNascimento = item?.dataNascimento;
        this.email = item?.email;
        this.telefone = item?.telefone;
        this.endereco = item?.endereco;
        this.tipoOcupacaoEnum = item?.tipoOcupacaoEnum;
        this.ocupacao = item?.ocupacao;
        this.statusColaboradorEnum = item?.statusColaboradorEnum;
        this.modeloContratacaoEnum = item?.modeloContratacaoEnum;
        this.modeloTrabalhoEnum = item?.modeloTrabalhoEnum;
        this.salario = item?.salario;
        this.entradaEmpresa = item?.entradaEmpresa;
        this.saidaEmpresa = item?.saidaEmpresa;
        this.contratoContratacao = item?.contratoContratacao;
        this.expediente = item?.expediente;
        this.acessoSistema = item?.acessoSistema;
    }
}