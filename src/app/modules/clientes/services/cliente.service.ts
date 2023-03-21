import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from 'src/app/config/api-config';
import { Cliente } from '../models/Cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(private http: HttpClient) { }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': '	Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3MDI0NDkiLCJleHAiOjE2Nzk2MjA2Mzd9.sOBojG0nse6Dc1n2ZLPTUEhsH96_5I1c8793CrwnReSkKqjj5tAuYgYIsCkpxc8QmpIexUBUw2uPY3KupyPCHw'
    })
  }

  public getClientes(): any {
    return this.http.get<Cliente[]>(`${API_URL.baseUrl}api/sistema/v1/cliente`, this.httpOptions).pipe(
      res => res,
      error => error
    )
  }
}
