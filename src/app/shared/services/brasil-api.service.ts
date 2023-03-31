import { map, Observable, catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CnpjResponse } from 'src/app/shared/models/brasil-api/cnpj-response';
import { ConsultaCepResponse } from '../models/brasil-api/consulta-cep-response';
import { EstadosResponse } from '../models/brasil-api/estados-response';
import { MunicipiosResponse } from '../models/brasil-api/municipios-response';

@Injectable({
  providedIn: 'root'
})
export class BrasilApiService {

  cnpjResponse: CnpjResponse;

  constructor(private http: HttpClient) { }

  urlBrasilApi: string = 'https://brasilapi.com.br/api';

  public getEnderecoPeloCep(cep: string): Observable<ConsultaCepResponse> {
    return this.http.get<ConsultaCepResponse>(`${this.urlBrasilApi}/cep/v1/${cep}`).pipe(
      map(resposta => new ConsultaCepResponse(resposta)),
      catchError(erro => {
        return throwError(() => new Error("Nenhum endereço foi encontrado com o cep digitado").toString().replace("Error:", ""))
      })
    )
  }

  public getTodosEstados(): Observable<EstadosResponse[]> {
    return this.http.get<EstadosResponse[]>(`${this.urlBrasilApi}/ibge/uf/v1`).pipe(
      map(estados => this.abstraiResponseApiEmObjetoEstadosResponse(estados)),
      catchError(erro => {
        return throwError(() => new Error("Ocorreu um erro de conexão com o servidor. Favor entrar em contato com o suporte").toString().replace("Error:", ""))
      })
    )
  }

  private abstraiResponseApiEmObjetoEstadosResponse(estados: any[]) {
    var estadosConvertidos: EstadosResponse[] = [];
    estados.forEach(estado => {
      estadosConvertidos.push(new EstadosResponse(estado));
    })
    return estadosConvertidos;
  }

  public obtemTodosMunicipiosPorEstado(estado: string): Observable<MunicipiosResponse[]> {
    return this.http.get<MunicipiosResponse[]>(`${this.urlBrasilApi}/ibge/municipios/v1/${estado}?providers=dados-abertos-br,gov,wikipedia`).pipe(
      map((resposta) => this.abstraiResponseApiEmObjetoMunicipiosResponse(resposta)),
      catchError(erro => {
        return throwError(() => new Error("Ocorreu um erro na obtenção automatizada dos municípios. Favor contatar o suporte").toString().replace("Error:", ""))
      })
    )
  }

  private abstraiResponseApiEmObjetoMunicipiosResponse(municipios: any[]) {
    var municipiosConvertidos: MunicipiosResponse[] = [];
    municipios.forEach(municipio => {
      municipiosConvertidos.push(new MunicipiosResponse(municipio));
    })
    return municipiosConvertidos;
  }

  public obtemDadosClientePeloCnpj(cnpj: string): Observable<CnpjResponse> {
    return this.http.get<CnpjResponse>(`${this.urlBrasilApi}/cnpj/v1/${cnpj}`).pipe(
      map(resposta => new CnpjResponse(resposta))
    )
  }

}
