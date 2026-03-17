// src/app/shared/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { RegisterRequest, LoginRequest, LoginResponse, RefreshRequest, RefreshResponse } from '../models/auth.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = '/api/v1/auth';

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

    refresh(refreshToken: string): Observable<RefreshResponse> {
        const body: RefreshRequest = { refreshToken };
        return this.http.post<RefreshResponse>(`${this.baseUrl}/refresh`, body);
    }

    saveToken(response: LoginResponse): void {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
    }

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}
