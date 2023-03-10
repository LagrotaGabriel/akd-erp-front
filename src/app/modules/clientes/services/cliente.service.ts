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
      'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3MDI0NDkiLCJleHAiOjE2Nzg5NzQ3OTV9.OcKjF8wYEYCQvcRWdham0UC-cwz5VF3jbn5n2i9j-DHnqrCjTa8Pjvubr1Mev6qLE0sUY2QDRUOtgcDk2j5Asg'
    })
  }

  public getClientes(): any {
    return this.http.get<Cliente[]>(`${API_URL.baseUrl}api/sistema/v1/cliente`, this.httpOptions).pipe(
      res => res,
      error => error
    )
  }
}
