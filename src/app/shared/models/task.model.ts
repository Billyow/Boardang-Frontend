import { SimpleUser } from './user.model';

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  createdBy: SimpleUser;
  collaborators: SimpleUser[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  priority: number;
  columnId: number;
  boardId: number;
}

export interface MoveTaskRequest {
  taskId: string;
  newColumnId: number;
  boardId: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  priority?: number;
}