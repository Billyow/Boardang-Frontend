import { TaskResponse } from './task.model';

export interface BoardColumnResponse {
  id: number;
  title: string;
  position: number;
  tasks: TaskResponse[];
}

export interface BoardColumnCreateRequest {
  boardId: number;
  title: string;
}
