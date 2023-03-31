export class CnpjResponse {
    cnpj?: string;
    razaoSocial?: string;
    nomeFantasia?: string;
    logradouro?: string;
    email?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cep?: number;
    uf?: string;
    municipio?: string;
    telefonePrincipal?: string;

    constructor(item) {
        this.cnpj = item?.cnpj;
        this.razaoSocial = item?.razao_social;
        this.nomeFantasia = item?.nome_fantasia;
        this.logradouro = item?.logradouro;
        this.email = item?.email;
        this.numero = item?.numero;
        this.complemento = item?.complemento;
        this.bairro = item?.bairro;
        this.cep = item?.cep;
        this.uf = item?.uf;
        this.municipio = item?.municipio;
        this.telefonePrincipal = item?.ddd_telefone_1;
    }

}