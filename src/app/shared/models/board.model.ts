import { SimpleUser } from './user.model';
import { BoardColumnResponse } from './board-column.model';

export interface BoardResponse {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
  owner: SimpleUser;
  columns: BoardColumnResponse[];
  members: SimpleUser[];
}

export interface BoardSummaryResponse {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateBoardRequest {
  title: string;
  description?: string | null;
}