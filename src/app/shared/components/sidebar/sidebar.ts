import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BoardService } from '../../services/BoardService';
import { SidebarStateService } from '../../services/SidebarStateService';
import { BoardSummaryResponse } from '../../models/board.model';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly boardService = inject(BoardService);
  protected readonly sidebarState = inject(SidebarStateService);

  protected readonly boards = signal<BoardSummaryResponse[]>([]);
  protected readonly boardsLoading = signal(true);
  protected readonly boardsError = signal<string | null>(null);

  protected readonly tasksOpen = signal(true);
  protected readonly boardsOpen = signal(true);
  protected readonly goalsOpen = signal(true);

  constructor() {
    this.boardService.getBoards().subscribe({
      next: (data) => {
        this.boards.set(data);
        this.boardsLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Error loading boards in sidebar:', err);
        this.boardsError.set('Failed to load boards.');
        this.boardsLoading.set(false);
      },
    });
  }
}
