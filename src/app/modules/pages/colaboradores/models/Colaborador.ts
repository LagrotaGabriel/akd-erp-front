import { Endereco } from "src/app/shared/models/Endereco";
import { AcessoSistema } from "./AcessoSistema";
import { ConfiguracaoPerfil } from "./ConfiguracaoPerfil";
import { ExclusaoColaborador } from "./ExclusaoColaborador";
import { Telefone } from "src/app/shared/models/Telefone";
import { Expediente } from "./Expediente";
import { Dispensa } from "./Dispensa";
import { Ponto } from "./Ponto";
import { Ferias } from "./Ferias";
import { Advertencia } from "./Advertencia";
import { Parentesco } from "./Parentesco";

export class Colaborador {
    id?: number;
    dataCadastro?: string;
    horaCadastro?: string;
    matricula?: number;
    fotoPerfil?: File;
    nome: string;
    dataNascimento?: string;
    email?: string;
    cpfCnpj?: string;
    ativo?: boolean;
    salario?: number;
    entradaEmpresa?: string;
    saidaEmpresa?: string;
    contratoContratacao?: File;
    ocupacao?: string;
    tipoOcupacaoEnum?: string;
    modeloContratacaoEnum?: string;
    modeloTrabalhoEnum?: string;
    statusColaboradorEnum?: string;
    exclusao?: ExclusaoColaborador;
    acessoSistema?: AcessoSistema;
    configuracaoPerfil?: ConfiguracaoPerfil;
    endereco?: Endereco;
    telefone?: Telefone;
    expediente?: Expediente;
    dispensa?: Dispensa;
    pontos?: Ponto[];
    historicoFerias?: Ferias[];
    advertencias?: Advertencia[];
    parentescos?: Parentesco[];
    checked?: boolean;
    expanded?: boolean;

    constructor(item) {
        this.id = item?.id;
        this.dataCadastro = item?.dataCadastro;
        this.horaCadastro = item?.horaCadastro;
        this.matricula = item?.matricula;
        this.fotoPerfil = item?.fotoPerfil;
        this.nome = item?.nome;
        this.dataNascimento = item?.dataNascimento;
        this.email = item?.email;
        this.cpfCnpj = item?.cpfCnpj;
        this.ativo = item?.ativo;
        this.salario = item?.salario;
        this.entradaEmpresa = item?.entradaEmpresa;
        this.saidaEmpresa = item?.saidaEmpresa;
        this.contratoContratacao = item?.contratoContratacao;
        this.ocupacao = item?.ocupacao;
        this.tipoOcupacaoEnum = item?.tipoOcupacaoEnum;
        this.modeloContratacaoEnum = item?.modeloContratacaoEnum;
        this.modeloTrabalhoEnum = item?.modeloTrabalhoEnum;
        this.statusColaboradorEnum = item?.statusColaboradorEnum;
        this.exclusao = item?.exclusao;
        this.acessoSistema = item?.acessoSistema;
        this.configuracaoPerfil = item?.configuracaoPerfil;
        this.endereco = item?.endereco;
        this.telefone = item?.telefone;
        this.expediente = item?.expediente;
        this.dispensa = item?.dispensa;
        this.pontos = item?.pontos
        this.historicoFerias = item?.historicoFerias;
        this.advertencias = item?.advertencias;
        this.parentescos = item?.parentescos;
    }

    isChecked(): boolean {
        return this.checked;
    }
}