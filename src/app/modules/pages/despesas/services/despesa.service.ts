import { map, Observable, catchError, throwError, retry } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DespesaPageObject } from '../models/response/DespesaPageObject';
import { API_CONFIG } from 'src/app/config/api-config';
import { DespesaResponse } from '../models/response/DespesaResponse';
import { DespesaRequest } from '../models/request/DespesaRequest';

@Injectable({
  providedIn: 'root'
})
export class DespesaService {

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }

  private httpOptions = {
    params: new HttpParams({
    }),
    headers: new HttpHeaders({
      'Authorization': API_CONFIG.devToken
    }),
    body: null
  }

  public novaDespesa(despesaRequest: DespesaRequest): Observable<DespesaResponse> {
    this.httpOptions.body = null;
    return this.http.post<DespesaResponse>(`${API_CONFIG.baseUrl}api/sistema/v1/despesas`, despesaRequest, this.httpOptions).pipe(
      map(resposta => new DespesaResponse(resposta)),
    )
  }

  public atualizaDespesa(idDespesa: number, despesaRequest: DespesaRequest): Observable<DespesaResponse> {
    this.httpOptions.body = null;
    return this.http.put<DespesaResponse>(`${API_CONFIG.baseUrl}api/sistema/v1/despesas/${idDespesa}`, despesaRequest, this.httpOptions).pipe(
      map(resposta => new DespesaResponse(resposta)),
    )
  }

  public obtemDespesaPorId(id: number): Observable<DespesaResponse> {
    this.httpOptions.params = new HttpParams();
    this.httpOptions.body = null;
    return this.http.get<DespesaResponse>(`${API_CONFIG.baseUrl}api/sistema/v1/despesas/${id}`, this.httpOptions).pipe(
      map((resposta) => new DespesaResponse(resposta))
    )
  }

  public getDespesas(valorBusca: string, mesAno: string, pageableInfo: DespesaPageObject): Observable<DespesaPageObject> {
    this.httpOptions.params = new HttpParams();
    this.httpOptions.body = null;
    this.buildRequestParams(valorBusca);
    this.httpOptions.params = this.httpOptions.params.append('mesAno', mesAno)
    this.buildPageableParams(pageableInfo);
    return this.http.get<DespesaPageObject>(`${API_CONFIG.baseUrl}api/sistema/v1/despesas`, this.httpOptions).pipe(
      map(resposta => new DespesaPageObject(resposta)),
      catchError((error: HttpErrorResponse) => {
        this.implementaLogicaDeCapturaDeErroNaListagemDeItens(error);
        console.log(error);
        return throwError(() => new HttpErrorResponse(error));
      }),
      retry({ count: 20, delay: 10000 })
    )
  }

  public removeDespesasEmMassa(listaDeIds: number[]) {
    this.httpOptions.body = listaDeIds;
    return this.http.delete(`${API_CONFIG.baseUrl}api/sistema/v1/despesas`, this.httpOptions).pipe(
      catchError((httpErrorResponse: HttpErrorResponse) => {
        this.implementaLogicaDeCapturaDeErroNaExclusaoDeItens(httpErrorResponse);
        return throwError(() => new HttpErrorResponse(httpErrorResponse));
      })
    )
  }

  public removeDespesa(id: number, exclusaoRecorrencias: boolean): Observable<DespesaResponse> {
    this.httpOptions.body = null;
    this.httpOptions.params = this.httpOptions.params.set('removeRecorrencia', exclusaoRecorrencias);
    return this.http.delete<DespesaResponse>(`${API_CONFIG.baseUrl}api/sistema/v1/despesas/${id}`, this.httpOptions).pipe(
      map(resposta => new DespesaResponse(resposta)),
      catchError((httpErrorResponse: HttpErrorResponse) => {
        this.implementaLogicaDeCapturaDeErroNaExclusaoDeItens(httpErrorResponse);
        return throwError(() => new HttpErrorResponse(httpErrorResponse));
      })
    )
  }

  public obtemRelatorio(listaDeIds: number[]): any {
    this.http.post(`${API_CONFIG.baseUrl}api/sistema/v1/despesas/relatorio`, listaDeIds, { headers: this.httpOptions.headers, responseType: "blob" })
      .subscribe(
        ((response) => {
          let blob = new Blob([response], { type: 'application/pdf' });
          let fileURL = URL.createObjectURL(blob);
          let tagUrlRelatorio = document.createElement('a');
          tagUrlRelatorio.href = fileURL;
          tagUrlRelatorio.target = '_blank';
          tagUrlRelatorio.download = 'akadion-despesas-' + new Date().getTime().toString() + '.pdf';
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

  private buildPageableParams(pageableInfo: DespesaPageObject) {
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
