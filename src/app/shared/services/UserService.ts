import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDTO } from '../models/user-dto';


@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/user';

  getUserByEmailA(email: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.baseUrl}/${encodeURIComponent(email)}`);
  }

  getUserByEmailC(email: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.baseUrl}/cache/${encodeURIComponent(email)}`);
  }
}
