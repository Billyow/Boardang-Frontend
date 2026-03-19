// src/app/shared/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { RegisterRequest, LoginRequest, LoginResponse, RefreshRequest, RefreshResponse, JwtClaims } from '../models/auth.model';
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

    decodeToken(token: string): JwtClaims | null {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded) as JwtClaims;
        } catch {
            return null;
        }
    }

    getClaims(): JwtClaims | null {
        const token = this.getToken();
        return token ? this.decodeToken(token) : null;
    }

    getUserId(): number | null {
        return this.getClaims()?.userId ?? null;
    }

    getUserName(): string | null {
        return this.getClaims()?.name ?? null;
    }

    getUserEmail(): string | null {
        return this.getClaims()?.email ?? null;
    }

    getUserRole(): string | null {
        return this.getClaims()?.role ?? null;
    }

    isLoggedIn(): boolean {
        const token = this.getToken();
        if (!token) return false;
        const claims = this.decodeToken(token);
        if (!claims || claims.type !== 'access') return false;
        return claims.exp * 1000 > Date.now();
    }
}
