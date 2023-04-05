import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from 'src/app/config/api-config';
import { FiltroAdicionado } from 'src/app/shared/models/filtros/FiltroAdicionado';
import { PageObject } from '../../../shared/models/PageObject';
import { Cliente as ClienteNovo } from '../criacao/models/cliente';
import { Cliente } from '../visualizacao/models/Cliente';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(private http: HttpClient) { }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3MDI0NDkiLCJleHAiOjE2ODA4Nzc0Mzh9.Ml4rLLgrdm7OgK54ikHULn4fBKAmUHXJDsNA2wm1jwsJcE4ombaX60Zgu1-UMQ3IoWAXrjhcxKjyJW3ZhP4LCQ'
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
      if (cliente.endereco.cidade == '') cliente.endereco.cidade = null;
      if (cliente.endereco.complemento == '') cliente.endereco.complemento = null;
      if (cliente.endereco.codigoPostal == '') cliente.endereco.codigoPostal = null;
      if (cliente.endereco.bairro == '') cliente.endereco.bairro = null;
      if (cliente.endereco.logradouro == '' || cliente.endereco.logradouro == null || cliente.endereco.numero == null) cliente.endereco = null;
    }

    return cliente;

  }

  public validaDuplicidadeInscricaoEstadual(inscricaoEstadual: string): Observable<string> {
    return this.http.post<string>(`${API_URL.baseUrl}api/sistema/v1/cliente/verifica-ie`, inscricaoEstadual, this.httpOptions).pipe(
      catchError(erro => {
        return throwError(() => new Error((erro.error.error).toString().replace("Error:", "")))
      })
    )
  }

  public validaDuplicidadeCpfCnpj(cpfCnpj: string): Observable<string> {
    return this.http.post<string>(`${API_URL.baseUrl}api/sistema/v1/cliente/verifica-cpfCnpj`, cpfCnpj, this.httpOptions).pipe(
      catchError(erro => {
        return throwError(() => new Error((erro.error.error).toString().replace("Error:", "")))
      })
    )
  }

  public novoCliente(clienteNovo: ClienteNovo): Observable<ClienteNovo> {
    clienteNovo = this.realizaTratamentoDeAtributosNulos(clienteNovo);
    return this.http.post<ClienteNovo>(`${API_URL.baseUrl}api/sistema/v1/cliente`, clienteNovo, this.httpOptions).pipe(
      map(resposta => new ClienteNovo(resposta)),
    )
  }

  public getClientes(filtrosAdicionados: FiltroAdicionado[], pageableInfo: PageObject): any {
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

  private buildPageableParams(pageableInfo: PageObject): string {
    var requestParamSintax = "?";
    if (pageableInfo != null) {
      requestParamSintax += "page=" + pageableInfo.pageNumber;
      requestParamSintax += "&size=" + pageableInfo.pageSize;
      requestParamSintax += "&sort=dataCadastro," + pageableInfo.sortDirection + "&sort=horaCadastro," + pageableInfo.sortDirection;
    }
    else {
      requestParamSintax += "page=" + 0;
      requestParamSintax += "&size=" + 10;
      requestParamSintax += "&sort=dataCadastro,DESC&horaCadastro,DESC";
    }
    return requestParamSintax;
  }


}
