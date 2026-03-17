import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoardSummaryResponse, CreateBoardRequest } from '../models/board.model';

@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/boards';

  getBoards(): Observable<BoardSummaryResponse[]> {
    return this.http.get<BoardSummaryResponse[]>(this.baseUrl);
  }

  createBoard(request: CreateBoardRequest): Observable<BoardSummaryResponse> {
    return this.http.post<BoardSummaryResponse>(this.baseUrl, request);
  }
}
