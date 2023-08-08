import { Arquivo } from "src/app/modules/shared/models/Arquivo";
import { Exclusao } from "src/app/modules/shared/models/Exclusao";
import { AcessoSistemaResponse } from "../acessoSistema/AcessoSistemaResponse";
import { EnderecoResponse } from "src/app/shared/models/endereco/response/EnderecoResponse";
import { TelefoneResponse } from "src/app/shared/models/telefone/response/TelefoneResponse";
import { ExpedienteResponse } from "../expediente/ExpedienteResponse";
import { ConfiguracaoPerfilResponse } from "../configuracaoPerfil/ConfiguracaoPerfilResponse";
import { DispensaResponse } from "../dispensa/DispensaResponse";
import { PontoResponse } from "../ponto/PontoResponse";
import { FeriasResponse } from "../ferias/FeriasResponse";
import { TableOptions } from "src/app/modules/shared/tabela/models/TableOptions";

export class ColaboradorResponse {
    id?: number;
    dataCadastro?: string;
    horaCadastro?: string;
    matricula?: number;
    fotoPerfil?: Arquivo;
    nome: string;
    dataNascimento?: string;
    email?: string;
    cpfCnpj?: string;
    ativo?: boolean;
    salario?: number;
    entradaEmpresa?: string;
    saidaEmpresa?: string;
    contratoContratacao?: Arquivo;
    ocupacao?: string;
    tipoOcupacaoEnum?: string;
    modeloContratacaoEnum?: string;
    modeloTrabalhoEnum?: string;
    statusColaboradorEnum?: string;
    exclusao?: Exclusao;
    acessoSistema?: AcessoSistemaResponse;
    configuracaoPerfil?: ConfiguracaoPerfilResponse;
    endereco?: EnderecoResponse;
    telefone?: TelefoneResponse;
    expediente?: ExpedienteResponse;
    dispensa?: DispensaResponse;
    pontos?: PontoResponse[];
    historicoFerias?: FeriasResponse[];
    checked?: boolean;
    expanded?: boolean;
    options?: TableOptions;

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
        this.pontos = item?.pontos;
        this.historicoFerias = item?.historicoFerias;
        this.options = {
            detalhesHabilitado: true,
            editarHabilitado: true,
            removerHabilitado: true
        }
    }

    isChecked(): boolean {
        return this.checked;
    }
}