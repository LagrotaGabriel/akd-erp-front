import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CnpjResponse } from 'src/app/shared/models/brasil-api/cnpj-response';
import { ConsultaCepResponse } from '../../../../shared/models/brasil-api/consulta-cep-response';
import { EstadosResponse } from '../../../../shared/models/brasil-api/estados-response';
import { MunicipiosResponse } from '../../../../shared/models/brasil-api/municipios-response';

@Injectable({
  providedIn: 'root'
})
export class BrasilApiService {

  constructor(private http: HttpClient) {}

  urlBrasilApi: string = 'https://brasilapi.com.br/api';

  public getEnderecoPeloCep(cep: string): any {
    return this.http.get<ConsultaCepResponse>(`${this.urlBrasilApi}/cep/v1/${cep}`).pipe(
      res => res,
      error => error
    )
  }

  public getTodosEstados(): any {
    return this.http.get<EstadosResponse[]>(`${this.urlBrasilApi}/ibge/uf/v1`).pipe(
      res => res,
      error => error
    )
  }

  public obtemTodosMunicipiosPorEstado(estado: string): any{
    return this.http.get<MunicipiosResponse[]>(`${this.urlBrasilApi}/ibge/municipios/v1/${estado}?providers=dados-abertos-br,gov,wikipedia`).pipe(
      res => res,
      error => error
    )
  }

  public obtemDadosClientePeloCnpj(cnpj: string): any {
    return this.http.get<CnpjResponse>(`${this.urlBrasilApi}/cnpj/v1/${cnpj}`).pipe(
      res => res,
      error => error
    )
  }

}
