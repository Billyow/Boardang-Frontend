import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TaskResponse, CreateTaskRequest, MoveTaskRequest, UpdateTaskRequest } from '../models/task.model';

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

  moveTask(body: MoveTaskRequest): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(
      `/api/v1/boards/${body.boardId}/tasks/${body.taskId}/move`,
      { newColumnId: body.newColumnId },
    );
  }

  updateTask(boardId: number, taskId: string, body: UpdateTaskRequest): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(
      `/api/v1/boards/${boardId}/tasks/${taskId}`,
      body,
    );
  }

  addCollaborator(boardId: number, taskId: string, userId: number): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(
      `/api/v1/boards/${boardId}/tasks/${taskId}/collaborators/${userId}`,
      {},
    );
  }

  removeCollaborator(boardId: number, taskId: string, userId: number): Observable<TaskResponse> {
    return this.http.delete<TaskResponse>(
      `/api/v1/boards/${boardId}/tasks/${taskId}/collaborators/${userId}`,
    );
  }
}
