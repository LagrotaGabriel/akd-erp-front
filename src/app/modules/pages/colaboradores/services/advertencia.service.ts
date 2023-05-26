import { Observable, map, catchError, throwError, retry, tap, first } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { API_CONFIG } from 'src/app/config/api-config';
import { AdvertenciaPageObject } from '../detalhes/models/AdvertenciaPageObject';
import { Advertencia } from '../models/Advertencia';

@Injectable({
  providedIn: 'root'
})
export class AdvertenciaService {
  constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }

  private httpOptions = {
    params: new HttpParams({
    }),
    headers: new HttpHeaders({
      'Authorization': API_CONFIG.devToken
    }),
    body: null
  }

  public obtemAnexoAdvertencia(idColaborador: number, idAdvertencia: number): any {
    return this.http.get(`${API_CONFIG.baseUrl}api/sistema/v1/advertencia/obtem-anexo/${idColaborador}/${idAdvertencia}`,
      { headers: this.httpOptions.headers, responseType: "blob" }).subscribe(
        ((response) => {
          let blob = new Blob([response], { type: 'application/pdf' });
          let fileUrl = URL.createObjectURL(blob);
          window.open(fileUrl);
          let tagUrlPdfAdvertencia = document.createElement('a');
          tagUrlPdfAdvertencia.href = fileUrl;
          tagUrlPdfAdvertencia.target = '_blank';
          tagUrlPdfAdvertencia.download = 'akadion-anexo-advertencia-' + new Date().getTime().toString() + '.pdf';
          document.body.appendChild(tagUrlPdfAdvertencia);
        })
      )
  }

  public removeAdvertencia(idColaborador: number, idAdvertencia: number): Observable<any> {
    this.httpOptions.body = null;
    this.httpOptions.params = new HttpParams();
    return this.http.delete<any>(`${API_CONFIG.baseUrl}api/sistema/v1/advertencia/${idColaborador}/${idAdvertencia}`, this.httpOptions).pipe(
    );
  }

  public atualizaStatusAdvertencia(statusAdvertenciaEnum: string, idColaborador: number, idAdvertencia: number): Observable<any> {
    this.httpOptions.body = null;
    this.httpOptions.params = new HttpParams();
    return this.http.put<any>(`${API_CONFIG.baseUrl}api/sistema/v1/advertencia/altera-status/${idColaborador}/${idAdvertencia}`,
      statusAdvertenciaEnum, this.httpOptions).pipe(
    );
  }

  public atualizaAnexoAdvertencia(anexo: Blob, idColaborador: number, idAdvertencia: number): Observable<any> {
    this.httpOptions.body = null;
    this.httpOptions.params = new HttpParams();
    let formData = new FormData();
    formData.append("anexo", anexo);
    return this.http.put(`${API_CONFIG.baseUrl}api/sistema/v1/advertencia/anexa-documento/${idColaborador}/${idAdvertencia}`, formData,
      { headers: this.httpOptions.headers, responseType: "blob" })
  }

  public obtemPdfPadrao(idColaborador: number, idAdvertencia: number): any {
    this.httpOptions.body = null;
    this.httpOptions.params = new HttpParams();

    return this.http.get(`${API_CONFIG.baseUrl}api/sistema/v1/advertencia/pdf-padrao/${idColaborador}/${idAdvertencia}`,
      { headers: this.httpOptions.headers, responseType: "blob" }).subscribe(
        ((response) => {
          let blob = new Blob([response], { type: 'application/pdf' });
          let fileUrl = URL.createObjectURL(blob);
          window.open(fileUrl);
          let tagUrlPdfAdvertencia = document.createElement('a');
          tagUrlPdfAdvertencia.href = fileUrl;
          tagUrlPdfAdvertencia.target = '_blank';
          tagUrlPdfAdvertencia.download = 'akadion-advertencia-' + new Date().getTime().toString() + '.pdf';
          document.body.appendChild(tagUrlPdfAdvertencia);
        })
      )
  }

  public novaAdvertencia(advertencia: Advertencia, arquivoAdvertencia: Blob, idColaborador: number): any {
    this.httpOptions.body = null;
    this.httpOptions.params = new HttpParams();
    let formData = new FormData();
    formData.append("arquivoAdvertencia", arquivoAdvertencia);
    formData.append("advertencia", JSON.stringify(advertencia));
    return this.http.post(`${API_CONFIG.baseUrl}api/sistema/v1/advertencia/${idColaborador}`,
      formData, { headers: this.httpOptions.headers, responseType: "blob" }).subscribe(
        ((response) => {
          let blob = new Blob([response], { type: 'application/pdf' });
          let fileUrl = URL.createObjectURL(blob);
          window.open(fileUrl);
          let tagUrlPdfAdvertencia = document.createElement('a');
          tagUrlPdfAdvertencia.href = fileUrl;
          tagUrlPdfAdvertencia.target = '_blank';
          tagUrlPdfAdvertencia.download = 'akadion-advertencia-' + new Date().getTime().toString() + '.pdf';
          document.body.appendChild(tagUrlPdfAdvertencia);
          tagUrlPdfAdvertencia.click();
        })
      )
  }

  public getAdvertencias(pageableInfo: AdvertenciaPageObject, idColaborador: number): Observable<AdvertenciaPageObject> {
    this.httpOptions.params = new HttpParams();
    this.buildPageableParams(pageableInfo);
    return this.http.get<AdvertenciaPageObject>(`${API_CONFIG.baseUrl}api/sistema/v1/advertencia/${idColaborador}`, this.httpOptions).pipe(
      map(resposta => new AdvertenciaPageObject(resposta)),
      catchError((error: HttpErrorResponse) => {
        this.implementaLogicaDeCapturaDeErroNaListagemDeItens(error);
        console.log(error);
        return throwError(() => new HttpErrorResponse(error));
      }),
      retry({ count: 20, delay: 10000 })
    )
  }

  private buildPageableParams(pageableInfo: AdvertenciaPageObject) {
    this.httpOptions.params = this.httpOptions.params.set('size', 10);
    this.httpOptions.params = this.httpOptions.params.set('sort', 'a.dataCadastro,DESC');
    this.httpOptions.params = this.httpOptions.params.append('sort', 'a.horaCadastro,DESC');
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
