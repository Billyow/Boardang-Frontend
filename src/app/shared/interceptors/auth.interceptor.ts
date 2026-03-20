import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/AuthService';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.getToken();
    const isAuthEndpoint = req.url.includes('/auth/');
    const authReq = (token && !isAuthEndpoint)
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status !== 401 || isAuthEndpoint) {
                return throwError(() => error);
            }

            const refreshToken = authService.getRefreshToken();

            if (!refreshToken) {
                authService.logout();
                router.navigate(['/login']);
                return throwError(() => error);
            }

            return authService.refresh(refreshToken).pipe(
                switchMap((response) => {
                    authService.saveToken(response);
                    const retryReq = req.clone({
                        setHeaders: { Authorization: `Bearer ${response.accessToken}` },
                    });
                    return next(retryReq);
                }),
                catchError((refreshError: unknown) => {
                    authService.logout();
                    router.navigate(['/login']);
                    return throwError(() => refreshError);
                })
            );
        })
    );
};
