import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BoardResponse, BoardSummaryResponse, CreateBoardRequest } from '../models/board.model';

@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/boards';

  private readonly _boards = new BehaviorSubject<BoardSummaryResponse[]>([]);
  readonly boards$ = this._boards.asObservable();

  getBoards(): Observable<BoardSummaryResponse[]> {
    return this.http.get<BoardSummaryResponse[]>(this.baseUrl).pipe(
      tap(boards => this._boards.next(boards))
    );
  }

  getBoard(id: number): Observable<BoardResponse> {
    return this.http.get<BoardResponse>(`${this.baseUrl}/${id}`);
  }

  createBoard(request: CreateBoardRequest): Observable<BoardSummaryResponse> {
    return this.http.post<BoardSummaryResponse>(this.baseUrl, request).pipe(
      tap(board => this._boards.next([...this._boards.value, board]))
    );
  }
}
