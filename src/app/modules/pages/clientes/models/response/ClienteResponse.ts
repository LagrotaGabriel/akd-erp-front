import { TableOptions } from "src/app/modules/shared/tabela/models/TableOptions";
import { EnderecoResponse } from "src/app/shared/models/endereco/response/EnderecoResponse";
import { TelefoneResponse } from "src/app/shared/models/telefone/response/TelefoneResponse";
import { ExclusaoCliente } from "../ExclusaoCliente";

export class ClienteResponse {

    id: number;
    dataCadastro: string;
    horaCadastro: string;
    dataNascimento: string;
    nome: string;
    tipoPessoa: string;
    cpfCnpj: string;
    inscricaoEstadual: string;
    email: string;
    statusCliente: string;
    qtdOrdensRealizadas: number;
    giroTotal: number;
    exclusaoCliente: ExclusaoCliente;
    endereco: EnderecoResponse;
    telefone: TelefoneResponse;
    nomeColaboradorResponsavel: string;
    checked: boolean;
    expanded: boolean;
    options?: TableOptions;

    constructor(item) {
        this.id = item?.id;
        this.dataCadastro = item?.dataCadastro;
        this.horaCadastro = item?.horaCadastro;
        this.dataNascimento = item?.dataNascimento;
        this.nome = item?.nome;
        this.tipoPessoa = item?.tipoPessoa;
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
        this.options = {
            detalhesHabilitado: true,
            editarHabilitado: true,
            removerHabilitado: true
        }
    }
}