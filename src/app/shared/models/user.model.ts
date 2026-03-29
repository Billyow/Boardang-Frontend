export interface SimpleUser {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

export type BoardMemberRole = 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface BoardMemberResponse {
  user: SimpleUser;
  role: BoardMemberRole;
}
