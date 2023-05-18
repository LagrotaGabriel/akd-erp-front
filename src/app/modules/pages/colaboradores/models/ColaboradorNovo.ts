import { AcessoSistema } from "./AcessoSistema";
import { Expediente } from "./Expediente";
import { Telefone } from "src/app/shared/models/Telefone";
import { Endereco } from "src/app/shared/models/Endereco";
import { Contrato } from "./Contrato";

export class ColaboradorNovo {
    fotoPerfil?: File;
    nome: string;                          
    dataNascimento?: string;               
    email?: string;                        
    cpfCnpj?: string;                      
    salario?: number;                      
    entradaEmpresa?: string;                                
    saidaEmpresa?: string;
    contratoContratacao?: Contrato;
    ocupacao?: string;                                      
    tipoOcupacaoEnum?: string;                              
    modeloContratacaoEnum?: string;                         
    modeloTrabalhoEnum?: string;                            
    statusColaboradorEnum?: string;                         
    acessoSistema?: AcessoSistema;         
    endereco?: Endereco;                   
    telefone?: Telefone;                   
    expediente?: Expediente;               

    constructor(item) {
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
    }

}