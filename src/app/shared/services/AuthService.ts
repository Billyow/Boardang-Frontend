// src/app/shared/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { RegisterRequest } from '../models/register-request.js';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/auth'; // Cambia si usas otro path

register(request: RegisterRequest): Observable<HttpResponse<void>> {
  return this.http.post<void>(
    `${this.baseUrl}/register`,
    request,
    { observe: 'response' } 
  );
}

}
