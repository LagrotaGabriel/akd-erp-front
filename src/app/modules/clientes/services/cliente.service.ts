import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from 'src/app/config/api-config';
import { FiltroAdicionado } from 'src/app/shared/models/filtros/FiltroAdicionado';
import { Pageable, PageObject } from '../../../shared/models/PageObject';
import { Cliente as ClienteNovo } from '../novo/models/cliente';
import { Cliente } from '../models/Cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(private http: HttpClient) { }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3MDI0NDkiLCJleHAiOjE2ODAyNzk1MzF9.02lW0gkD_eL_WGu4Z13o_S0KPAmqIbIVy7C-chkrviJHK32Jir9mqJuJiCH2h1SnH9pACP5CurCxyJFnIta79A'
    })
  }

  private realizaTratamentoDeAtributosNulos(cliente: ClienteNovo): ClienteNovo {

    // DADOS
    if (cliente.cpfCnpj == '') cliente.cpfCnpj = null;
    if (cliente.inscricaoEstadual == '') cliente.inscricaoEstadual = null;
    if (cliente.email == '') cliente.email = null;
    if (cliente.dataNascimento == '') cliente.dataNascimento = null;

    // TELEFONE
    if (cliente.telefone != null) {
      if (cliente.telefone.tipoTelefone == '' || cliente.telefone.tipoTelefone == null ||
        cliente.telefone.prefixo == '' || cliente.telefone.prefixo == null ||
        cliente.telefone.numero == '' || cliente.telefone.numero == null) cliente.telefone = null;
    }

    // ENDERECO
    if (cliente.endereco != null) {
      if (cliente.endereco.estado == '') cliente.endereco.estado = null;
      if (cliente.endereco.logradouro == '' || cliente.endereco.logradouro == null ||
        cliente.endereco.numero == null) cliente.endereco = null;
    }

    return cliente;

  }

  public novoCliente(clienteNovo: ClienteNovo): any {
    clienteNovo = this.realizaTratamentoDeAtributosNulos(clienteNovo);
    return this.http.post<ClienteNovo>(`${API_URL.baseUrl}api/sistema/v1/cliente`, clienteNovo, this.httpOptions).pipe(
      res => res,
      error => error
    )
  }

  public getClientes(filtrosAdicionados: FiltroAdicionado[], pageableInfo: Pageable): any {
    var requestParams = this.buildRequestParams(filtrosAdicionados, "&");
    var pageableParams = this.buildPageableParams(pageableInfo);
    return this.http.get<PageObject>(`${API_URL.baseUrl}api/sistema/v1/cliente${pageableParams}${requestParams}`, this.httpOptions).pipe(
      res => res,
      error => error
    )
  }

  public getMetaDados(filtrosAdicionados: FiltroAdicionado[]): any {
    var requestParams = this.buildRequestParams(filtrosAdicionados, "?");
    return this.http.get<PageObject>(`${API_URL.baseUrl}api/sistema/v1/cliente/meta${requestParams}`, this.httpOptions).pipe(
      res => res,
      error => error
    )
  }

  public removeCliente(id: number): any {
    return this.http.delete<Cliente>(`${API_URL.baseUrl}api/sistema/v1/cliente/${id}`, this.httpOptions).pipe(
      res => res,
      error => error
    )
  }

  private buildRequestParams(filtrosAdicionados: FiltroAdicionado[], requestParamType: string): string {
    var requestParamSintax = "";
    var requestParams: string[] = [];
    filtrosAdicionados.forEach(filtro => {
      if (requestParamSintax == "") requestParamSintax += (requestParamType + "busca=")
      requestParams.push(filtro.tipoFiltro + "=" + filtro.valor);
    })
    requestParamSintax += requestParams.toString();
    return requestParamSintax;
  }

  private buildPageableParams(pageableInfo: Pageable): string {
    var requestParamSintax = "?";
    if (pageableInfo != null) {
      requestParamSintax += "page=" + pageableInfo.pageNumber;
      requestParamSintax += "&size=" + pageableInfo.pageSize;
      requestParamSintax += "&sort=dataCadastro," + pageableInfo.sortDirection + "&sort=horaCadastro," + pageableInfo.sortDirection;
    }
    else {
      requestParamSintax += "page=" + 0;
      requestParamSintax += "&size=" + 20;
      requestParamSintax += "&sort=dataCadastro,desc&horaCadastro,desc";
    }
    return requestParamSintax;
  }


}
