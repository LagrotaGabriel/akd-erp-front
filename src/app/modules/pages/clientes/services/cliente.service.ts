import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from 'src/app/config/api-config';
import { catchError, map, Observable, retry, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientePageObject } from '../models/ClientePageObject';
import { ClienteRequest } from '../models/request/ClienteRequest';
import { ClienteResponse } from '../models/response/ClienteResponse';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }

  private httpOptions = {
    params: new HttpParams({
    }),
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': API_CONFIG.devToken
    }),
    body: null
  }

  public validaDuplicidadeInscricaoEstadual(inscricaoEstadual: string) {
    this.httpOptions.body = null;
    return this.http.post(`${API_CONFIG.baseUrl}api/sistema/v1/cliente/verifica-ie`, inscricaoEstadual, this.httpOptions).pipe(
      catchError(erro => {
        return throwError(() => new Error((erro.error.error).toString().replace("Error:", "")))
      })
    )
  }

  public validaDuplicidadeCpfCnpj(cpfCnpj: string) {
    this.httpOptions.body = null;
    return this.http.post(`${API_CONFIG.baseUrl}api/sistema/v1/cliente/verifica-cpfCnpj`, cpfCnpj, this.httpOptions).pipe(
      catchError((erro: HttpErrorResponse) => {
        console.log(erro);
        if (erro.status != 403 && erro.status != 0) return throwError(() => new Error((erro.error.error).toString().replace("Error:", "")));
        else if (erro.status == 403) return throwError(() => new Error('Ops! Ocorreu um erro de autenticação'));
        else return throwError(() => new Error('Ops! Ocorreu um erro de conexão com o servidor'));
      })
    )
  }

  public atualizaCliente(idCliente: number, clienteNovo: ClienteRequest): Observable<ClienteResponse> {
    this.httpOptions.body = null;
    return this.http.put<ClienteResponse>(`${API_CONFIG.baseUrl}api/sistema/v1/cliente/${idCliente}`, clienteNovo, this.httpOptions).pipe(
      map(resposta => new ClienteResponse(resposta)),
    )
  }

  public novoCliente(clienteNovo: ClienteRequest): Observable<ClienteResponse> {
    this.httpOptions.body = null;
    return this.http.post<ClienteResponse>(`${API_CONFIG.baseUrl}api/sistema/v1/cliente`, clienteNovo, this.httpOptions).pipe(
      map(resposta => new ClienteResponse(resposta)),
    )
  }

  public obtemClientePorId(id: number): Observable<ClienteResponse> {
    this.httpOptions.params = new HttpParams();
    this.httpOptions.body = null;
    return this.http.get<ClienteResponse>(`${API_CONFIG.baseUrl}api/sistema/v1/cliente/${id}`, this.httpOptions).pipe(
      map((resposta) => new ClienteResponse(resposta))
    )
  }

  public getClientes(valorBusca: string, pageableInfo: ClientePageObject): Observable<ClientePageObject> {
    console.log('Service getClientes acessado');
    this.httpOptions.params = new HttpParams();
    this.httpOptions.body = null;
    this.buildRequestParams(valorBusca);
    this.buildPageableParams(pageableInfo);
    return this.http.get<ClientePageObject>(`${API_CONFIG.baseUrl}api/sistema/v1/cliente`, this.httpOptions).pipe(
      map(resposta => new ClientePageObject(resposta)),
      catchError((error: HttpErrorResponse) => {
        this.implementaLogicaDeCapturaDeErroNaListagemDeItens(error);
        console.log(error);
        return throwError(() => new HttpErrorResponse(error));
      }),
      retry({ count: 20, delay: 10000 })
    )
  }

  public removeClienteEmMassa(listaDeIds: number[]) {
    this.httpOptions.body = listaDeIds;
    return this.http.delete(`${API_CONFIG.baseUrl}api/sistema/v1/cliente`, this.httpOptions).pipe(
      catchError((httpErrorResponse: HttpErrorResponse) => {
        this.implementaLogicaDeCapturaDeErroNaExclusaoDeItens(httpErrorResponse);
        return throwError(() => new HttpErrorResponse(httpErrorResponse));
      })
    )
  }

  public removeCliente(id: number): Observable<ClienteResponse> {
    this.httpOptions.body = null;
    return this.http.delete<ClienteResponse>(`${API_CONFIG.baseUrl}api/sistema/v1/cliente/${id}`, this.httpOptions).pipe(
      map(resposta => new ClienteResponse(resposta)),
      catchError((httpErrorResponse: HttpErrorResponse) => {
        this.implementaLogicaDeCapturaDeErroNaExclusaoDeItens(httpErrorResponse);
        return throwError(() => new HttpErrorResponse(httpErrorResponse));
      })
    )
  }

  public obtemRelatorioClientes(listaDeIds: number[]): any {
    this.http.post(`${API_CONFIG.baseUrl}api/sistema/v1/cliente/relatorio`, listaDeIds, { headers: this.httpOptions.headers, responseType: "blob" })
      .subscribe(
        ((response) => {
          let blob = new Blob([response], { type: 'application/pdf' });
          let fileURL = URL.createObjectURL(blob);
          let tagUrlRelatorio = document.createElement('a');
          tagUrlRelatorio.href = fileURL;
          tagUrlRelatorio.target = '_blank';
          tagUrlRelatorio.download = 'akadion-clientes-' + new Date().getTime().toString() + '.pdf';
          document.body.appendChild(tagUrlRelatorio);
          tagUrlRelatorio.click();
        })
      );
  }

  private implementaLogicaDeCapturaDeErroNaListagemDeItens(error) {
    if (error.status == 403) {
      /*  Quando implantar ng-guard, implementar meio de não permitir duplicidade de acesso nesse método,
       pois o de metadados e o de obtenção paginada irão acessa-lo em caso de erro de servidor. Uma boa
       ideia para resolver esse problema, seria verificar se existe algum token ativo no localstorage para
       acessar a condição do método */
      console.log('Sem autorização, elaborar lógica de logout e redirect no método');
    }
    else {
      this._snackBar.open("Houve uma falha de comunicação com o servidor", "Fechar", {
        duration: 12000
      });
    }
  }

  private implementaLogicaDeCapturaDeErroNaExclusaoDeItens(error: HttpErrorResponse) {
    if (error.status == 403) {
      /*  Quando implantar ng-guard, implementar meio de não permitir duplicidade de acesso nesse método,
       pois o de metadados e o de obtenção paginada irão acessa-lo em caso de erro de servidor. Uma boa
       ideia para resolver esse problema, seria verificar se existe algum token ativo no localstorage para
       acessar a condição do método */
      console.log('Sem autorização, elaborar lógica de logout e redirect no método');
    }
    else if (error.status == 400) {
      this._snackBar.open(error.error.error, "Fechar", {
        duration: 3500
      });
    }
    else {
      this._snackBar.open("Houve uma falha de comunicação com o servidor", "Fechar", {
        duration: 3500
      });
    }
  }

  private buildRequestParams(busca: string) {
    if (busca != null && busca != undefined && busca != '') {
      this.httpOptions.params = this.httpOptions.params.set('busca', busca)
    }
  }

  private buildPageableParams(pageableInfo: ClientePageObject) {
    if (pageableInfo != null) {
      this.httpOptions.params = this.httpOptions.params.set('page', pageableInfo.pageNumber);
      this.httpOptions.params = this.httpOptions.params.set('size', pageableInfo.pageSize);
      this.httpOptions.params = this.httpOptions.params.set('sort', 'dataCadastro,' + pageableInfo.sortDirection);
      this.httpOptions.params = this.httpOptions.params.append('sort', 'horaCadastro,' + pageableInfo.sortDirection);
    }
    else {
      this.httpOptions.params = this.httpOptions.params.set('page', 0);
      this.httpOptions.params = this.httpOptions.params.set('size', 10);
      this.httpOptions.params = this.httpOptions.params.set('sort', 'dataCadastro,DESC');
      this.httpOptions.params = this.httpOptions.params.append('sort', 'horaCadastro,DESC');
    }
  }

}
