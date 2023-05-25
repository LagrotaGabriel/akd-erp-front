import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from 'src/app/config/api-config';

import { catchError, map, Observable, retry, throwError, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageObject } from '../visualizacao/models/PageObject';
import { ColaboradorNovo } from '../models/ColaboradorNovo';
import { Colaborador } from '../models/Colaborador';

@Injectable({
  providedIn: 'root'
})
export class ColaboradorService {

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }

  private httpOptions = {
    params: new HttpParams({
    }),
    headers: new HttpHeaders({
      'Authorization': API_CONFIG.devToken
    }),
    body: null
  }

  public obtemImagemPerfilColaborador(idColaborador: number): Observable<any> {
    return this.http.get(`${API_CONFIG.baseUrl}api/sistema/v1/colaborador/imagem-perfil/${idColaborador}`,
      { headers: this.httpOptions.headers, responseType: "blob" }).pipe()
  }

  public atualizaImagemPerfilColaborador(idColaborador: number, imagemPerfil: Blob): Observable<Colaborador> {
    this.httpOptions.body = null;
    let formData = new FormData();
    formData.append("imagemPerfil", imagemPerfil);
    return this.http.put<Colaborador>(`${API_CONFIG.baseUrl}api/sistema/v1/colaborador/imagem-perfil/${idColaborador}`, formData, this.httpOptions).pipe(
      map((response) => new Colaborador(response))
    )
  }

  public atualizaColaborador(idColaborador: number, colaborador: ColaboradorNovo, contratoColaborador: Blob): Observable<string> {
    this.httpOptions.body = null;
    let formData = new FormData();
    formData.append("contratoColaborador", contratoColaborador);
    formData.append("colaborador", JSON.stringify(colaborador));
    formData.append("id", JSON.stringify(idColaborador));
    return this.http.put<string>(`${API_CONFIG.baseUrl}api/sistema/v1/colaborador/${idColaborador}`, formData, this.httpOptions).pipe(
    )
  }

  public obtemDetalhesDoColaboradorPorId(id: number): Observable<Colaborador> {
    this.httpOptions.params = new HttpParams();
    this.httpOptions.body = null;
    return this.http.get<Colaborador>(`${API_CONFIG.baseUrl}api/sistema/v1/colaborador/${id}`, this.httpOptions).pipe(
      map((resposta) => new Colaborador(resposta))
    )
  }

  public obtemColaboradorPorId(id: number): Observable<ColaboradorNovo> {
    this.httpOptions.params = new HttpParams();
    this.httpOptions.body = null;
    return this.http.get<ColaboradorNovo>(`${API_CONFIG.baseUrl}api/sistema/v1/colaborador/${id}`, this.httpOptions).pipe(
      map((resposta) => new ColaboradorNovo(resposta))
    )
  }

  public novoColaborador(colaboradorNovo: ColaboradorNovo, contratoColaborador: Blob): Observable<string> {
    this.httpOptions.body = null;
    let formData = new FormData();
    formData.append("contratoColaborador", contratoColaborador);
    formData.append("colaborador", JSON.stringify(colaboradorNovo));

    return this.http.post<string>(`${API_CONFIG.baseUrl}api/sistema/v1/colaborador`, formData, this.httpOptions).pipe(
    )
  }

  public obtemTodasOcupacoes(): Observable<string[]> {
    this.httpOptions.params = new HttpParams();
    this.httpOptions.body = null;
    return this.http.get<string[]>(`${API_CONFIG.baseUrl}api/sistema/v1/colaborador/ocupacoes`, this.httpOptions).pipe()
  }

  public getColaboradores(valorBusca: string, pageableInfo: PageObject): Observable<PageObject> {
    this.httpOptions.params = new HttpParams();
    this.httpOptions.body = null;
    this.buildRequestParams(valorBusca);
    this.buildPageableParams(pageableInfo);
    return this.http.get<PageObject>(`${API_CONFIG.baseUrl}api/sistema/v1/colaborador`, this.httpOptions).pipe(
      map(resposta => new PageObject(resposta)),
      catchError((error: HttpErrorResponse) => {
        this.implementaLogicaDeCapturaDeErroNaListagemDeItens(error);
        console.log(error);
        return throwError(() => new HttpErrorResponse(error));
      }),
      retry({ count: 20, delay: 10000 })
    )
  }

  public removeColaboradoresEmMassa(listaDeIds: number[]) {
    this.httpOptions.body = listaDeIds;
    return this.http.delete(`${API_CONFIG.baseUrl}api/sistema/v1/colaborador`, this.httpOptions).pipe(
      catchError((httpErrorResponse: HttpErrorResponse) => {
        this.implementaLogicaDeCapturaDeErroNaExclusaoDeItens(httpErrorResponse);
        return throwError(() => new HttpErrorResponse(httpErrorResponse));
      })
    )
  }

  public removeColaborador(id: number): Observable<Colaborador> {
    this.httpOptions.body = null;
    return this.http.delete<Colaborador>(`${API_CONFIG.baseUrl}api/sistema/v1/colaborador/${id}`, this.httpOptions).pipe(
      map(resposta => new Colaborador(resposta)),
      catchError((httpErrorResponse: HttpErrorResponse) => {
        this.implementaLogicaDeCapturaDeErroNaExclusaoDeItens(httpErrorResponse);
        return throwError(() => new HttpErrorResponse(httpErrorResponse));
      })
    )
  }

  public obtemRelatorioColaboradores(listaDeIds: number[]): any {
    this.http.post(`${API_CONFIG.baseUrl}api/sistema/v1/colaborador/relatorio`, listaDeIds, { headers: this.httpOptions.headers, responseType: "blob" })
      .subscribe(
        ((response) => {
          let blob = new Blob([response], { type: 'application/pdf' });
          let fileURL = URL.createObjectURL(blob);
          let tagUrlRelatorio = document.createElement('a');
          tagUrlRelatorio.href = fileURL;
          tagUrlRelatorio.target = '_blank';
          tagUrlRelatorio.download = 'akadion-colaboradores-' + new Date().getTime().toString() + '.pdf';
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

  private buildPageableParams(pageableInfo: PageObject) {
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
