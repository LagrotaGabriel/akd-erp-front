import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from 'src/app/config/api-config';
import { PageObject } from '../../../shared/models/PageObject';
import { Cliente as ClienteNovo } from '../criacao/models/cliente';
import { Cliente } from '../visualizacao/models/Cliente';
import { catchError, map, Observable, retry, throwError, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver';

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
      'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3MDI0NDkiLCJleHAiOjE2ODIzMzI4Mzh9.jtT2mFoN-7tZj23Jx_6EvcQIn1_QZSi8sRsByhATHJZuLeU_5efWPnsNIRkujcMt4AeMl-tJ_gqkPzl28AbaWw'
    }),
    body: null
  }

  private realizaTratamentoDeAtributosNulos(cliente: ClienteNovo): ClienteNovo {
    cliente = this.realizaTratamentoDosDadosPessoaisNulosDoCliente(cliente);
    cliente = this.realizaTratamentoDosDadosDeTelefoneNulosDoCliente(cliente);
    cliente = this.realizaTratamentoDosDadosDeEnderecoNulosDoCliente(cliente);
    return cliente;
  }

  private realizaTratamentoDosDadosPessoaisNulosDoCliente(cliente: ClienteNovo): ClienteNovo {
    if (cliente.cpfCnpj == '') cliente.cpfCnpj = null;
    if (cliente.inscricaoEstadual == '') cliente.inscricaoEstadual = null;
    if (cliente.email == '') cliente.email = null;
    if (cliente.dataNascimento == '') cliente.dataNascimento = null;
    return cliente;
  }

  private realizaTratamentoDosDadosDeTelefoneNulosDoCliente(cliente: ClienteNovo): ClienteNovo {
    if (cliente.telefone != null) {
      if (cliente.telefone.tipoTelefone == '' || cliente.telefone.tipoTelefone == null ||
        cliente.telefone.prefixo == '' || cliente.telefone.prefixo == null ||
        cliente.telefone.numero == '' || cliente.telefone.numero == null) cliente.telefone = null;
    }
    return cliente;
  }

  private realizaTratamentoDosDadosDeEnderecoNulosDoCliente(cliente: ClienteNovo): ClienteNovo {
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

  public validaDuplicidadeInscricaoEstadual(inscricaoEstadual: string) {
    this.httpOptions.body = null;
    return this.http.post(`${API_URL.baseUrl}api/sistema/v1/cliente/verifica-ie`, inscricaoEstadual, this.httpOptions).pipe(
      catchError(erro => {
        return throwError(() => new Error((erro.error.error).toString().replace("Error:", "")))
      })
    )
  }

  public validaDuplicidadeCpfCnpj(cpfCnpj: string) {
    this.httpOptions.body = null;
    return this.http.post(`${API_URL.baseUrl}api/sistema/v1/cliente/verifica-cpfCnpj`, cpfCnpj, this.httpOptions).pipe(
      catchError((erro: HttpErrorResponse) => {
        return throwError(() => new Error((erro.error.error).toString().replace("Error:", "")))
      })
    )
  }

  public atualizaCliente(idCliente: number, clienteNovo: ClienteNovo): Observable<ClienteNovo> {
    clienteNovo = this.realizaTratamentoDeAtributosNulos(clienteNovo);
    this.httpOptions.body = null;
    return this.http.put<ClienteNovo>(`${API_URL.baseUrl}api/sistema/v1/cliente/${idCliente}`, clienteNovo, this.httpOptions).pipe(
      map(resposta => new ClienteNovo(resposta)),
    )
  }

  public novoCliente(clienteNovo: ClienteNovo): Observable<ClienteNovo> {
    clienteNovo = this.realizaTratamentoDeAtributosNulos(clienteNovo);
    this.httpOptions.body = null;
    return this.http.post<ClienteNovo>(`${API_URL.baseUrl}api/sistema/v1/cliente`, clienteNovo, this.httpOptions).pipe(
      map(resposta => new ClienteNovo(resposta)),
    )
  }

  public obtemClientePorId(id: number): Observable<ClienteNovo> {
    this.httpOptions.params = new HttpParams();
    this.httpOptions.body = null;
    return this.http.get<ClienteNovo>(`${API_URL.baseUrl}api/sistema/v1/cliente/${id}`, this.httpOptions).pipe(
      tap((resposta) => console.log(resposta)),
      map(resposta => new ClienteNovo(resposta)),
      tap((resposta) => console.log(resposta))
    )
  }

  public getClientes(valorBusca: string, pageableInfo: PageObject): Observable<PageObject> {
    this.httpOptions.params = new HttpParams();
    this.httpOptions.body = null;
    this.buildRequestParams(valorBusca);
    this.buildPageableParams(pageableInfo);
    return this.http.get<PageObject>(`${API_URL.baseUrl}api/sistema/v1/cliente`, this.httpOptions).pipe(
      map(resposta => new PageObject(resposta)),
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
    return this.http.delete(`${API_URL.baseUrl}api/sistema/v1/cliente`, this.httpOptions).pipe(
      catchError((httpErrorResponse: HttpErrorResponse) => {
        this.implementaLogicaDeCapturaDeErroNaExclusaoDeItens(httpErrorResponse);
        return throwError(() => new HttpErrorResponse(httpErrorResponse));
      })
    )
  }

  public removeCliente(id: number): Observable<Cliente> {
    this.httpOptions.body = null;
    return this.http.delete<Cliente>(`${API_URL.baseUrl}api/sistema/v1/cliente/${id}`, this.httpOptions).pipe(
      map(resposta => new Cliente(resposta)),
      catchError((httpErrorResponse: HttpErrorResponse) => {
        this.implementaLogicaDeCapturaDeErroNaExclusaoDeItens(httpErrorResponse);
        return throwError(() => new HttpErrorResponse(httpErrorResponse));
      })
    )
  }

  public obtemRelatorioClientes(listaDeIds: number[]): any {
    this.http.post(`${API_URL.baseUrl}api/sistema/v1/cliente/relatorio`, listaDeIds, { headers: this.httpOptions.headers, responseType: "blob" })
      .subscribe(
        ((response) => {
          let blob = new Blob([response], { type: 'mediaType' });
          saveAs(blob, 'akadion-clientes-' + new Date().getTime().toString() + '.pdf');
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
