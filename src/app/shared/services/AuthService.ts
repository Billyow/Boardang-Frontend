// src/app/shared/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { RegisterRequest } from '../models/auth.model';
import { Observable } from 'rxjs';
import { LoginRequest } from '../models/auth.model.js';
import { LoginResponse } from '../models/auth.model';

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

    login(request: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request);
    }
    
    saveToken(response: LoginResponse): void {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('token_type', response.tokenType);
        localStorage.setItem('expires_in', response.expiresIn.toString());
    }

    logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('expires_in');
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }
}
