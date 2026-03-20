import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoardColumnResponse, BoardColumnCreateRequest } from '../models/board-column.model';

@Injectable({ providedIn: 'root' })
export class ColumnService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/boards';

  createColumn(boardId: number, title: string): Observable<BoardColumnResponse> {
    const body: BoardColumnCreateRequest = { boardId, title };
    return this.http.post<BoardColumnResponse>(`${this.base}/${boardId}/columns`, body);
  }

  deleteColumn(boardId: number, columnId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${boardId}/columns/${columnId}`);
  }
}
