import { AcessoSistema } from "./../../visualizacao/models/AcessoSistema";
import { Expediente } from "./../../visualizacao/models/Expediente";
import { Parentesco } from "./../../visualizacao/models/Parentesco";
import { Telefone } from "src/app/shared/models/Telefone";
import { Endereco } from "src/app/shared/models/Endereco";

export class ColaboradorNovo {
    fotoPerfil?: File;
    nome: string;                          // OK
    dataNascimento?: string;               // OK
    email?: string;                        // OK
    cpfCnpj?: string;                      // OK
    salario?: number;
    entradaEmpresa?: string;
    saidaEmpresa?: string;
    contratoContratacao?: File;
    ocupacao?: string;                                      // OK
    tipoOcupacaoEnum?: string;                              // OK
    modeloContratacaoEnum?: string;                         // OK
    modeloTrabalhoEnum?: string;                            // OK
    statusColaboradorEnum?: string;                         // OK
    acessoSistema?: AcessoSistema;
    endereco?: Endereco;                   // OK
    telefone?: Telefone;                   // OK
    expediente?: Expediente;
    parentescos?: Parentesco[];

    constructor(item) {
        this.fotoPerfil = item?.fotoPerfil;
        this.nome = item?.nome;
        this.dataNascimento = item?.dataNascimento;
        this.email = item?.email;
        this.cpfCnpj = item?.cpfCnpj;
        this.salario = item?.salario;
        this.entradaEmpresa = item?.entradaEmpresa;
        this.saidaEmpresa = item?.saidaEmpresa;
        this.contratoContratacao = item?.contratoContratacao;
        this.ocupacao = item?.ocupacao;
        this.tipoOcupacaoEnum = item?.tipoOcupacaoEnum;
        this.modeloContratacaoEnum = item?.modeloContratacaoEnum;
        this.modeloTrabalhoEnum = item?.modeloTrabalhoEnum;
        this.statusColaboradorEnum = item?.statusColaboradorEnum;
        this.acessoSistema = item?.acessoSistema;
        this.endereco = item?.endereco;
        this.telefone = item?.telefone;
        this.expediente = item?.expediente;
        this.parentescos = item?.parentescos;
    }

}