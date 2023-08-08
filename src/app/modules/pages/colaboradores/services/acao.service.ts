import { Observable, map, throwError, retry, catchError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from 'src/app/config/api-config';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AcaoPageObject } from '../models/response/acao/AcaoPageObject';

@Injectable({
  providedIn: 'root'
})
export class AcaoService {

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }

  private httpOptions = {
    params: new HttpParams({
    }),
    headers: new HttpHeaders({
      'Authorization': API_CONFIG.devToken
    }),
    body: null
  }

  public getAcoes(pageableInfo: AcaoPageObject, idColaborador: number): Observable<AcaoPageObject> {
    this.httpOptions.params = new HttpParams();
    this.buildPageableParams(pageableInfo);
    return this.http.get<AcaoPageObject>(`${API_CONFIG.baseUrl}api/sistema/v1/colaborador/${idColaborador}/acoes`, this.httpOptions).pipe(
      map(resposta => new AcaoPageObject(resposta)),
      catchError((error: HttpErrorResponse) => {
        this.implementaLogicaDeCapturaDeErroNaListagemDeItens(error);
        console.log(error);
        return throwError(() => new HttpErrorResponse(error));
      }),
      retry({ count: 20, delay: 10000 })
    )
  }

  private buildPageableParams(pageableInfo: AcaoPageObject) {
    this.httpOptions.params = this.httpOptions.params.set('size', 10);
    this.httpOptions.params = this.httpOptions.params.set('sort', 'a.dataCriacao,DESC');
    this.httpOptions.params = this.httpOptions.params.append('sort', 'a.horaCriacao,DESC');
    if (pageableInfo != null) this.httpOptions.params = this.httpOptions.params.set('page', pageableInfo.pageNumber);
    else this.httpOptions.params = this.httpOptions.params.set('page', 0);
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
}
