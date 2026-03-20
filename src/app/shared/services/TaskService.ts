import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TaskResponse, CreateTaskRequest } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/tasks';

  getMyTasks(): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.baseUrl}/me`);
  }

  createTask(body: CreateTaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`/api/v1/boards/${body.boardId}/tasks`, body);
  }
}
