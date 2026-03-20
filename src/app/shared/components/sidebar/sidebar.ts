import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';

import { BoardService } from '../../services/BoardService';
import { TaskService } from '../../services/TaskService';
import { SidebarStateService } from '../../services/SidebarStateService';
import { TaskResponse } from '../../models/task.model';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly boardService = inject(BoardService);
  private readonly taskService = inject(TaskService);
  protected readonly sidebarState = inject(SidebarStateService);

  protected readonly boards = toSignal(this.boardService.boards$, { initialValue: [] });
  protected readonly boardsLoading = signal(true);
  protected readonly boardsError = signal<string | null>(null);

  protected readonly tasks = signal<TaskResponse[]>([]);
  protected readonly tasksLoading = signal(true);
  protected readonly tasksError = signal<string | null>(null);

  protected readonly tasksOpen = signal(true);
  protected readonly boardsOpen = signal(true);
  protected readonly goalsOpen = signal(true);

  protected getTaskPriorityClass(priority: number): string {
    if (priority <= 10) return 'priority-low';
    if (priority <= 50) return 'priority-medium';
    return 'priority-high';
  }

  constructor() {
    this.boardService.getBoards().subscribe({
      next: () => this.boardsLoading.set(false),
      error: (err: unknown) => {
        console.error('Error loading boards in sidebar:', err);
        this.boardsError.set('Failed to load boards.');
        this.boardsLoading.set(false);
      },
    });

    this.taskService.getMyTasks().subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.tasksLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Error loading tasks in sidebar:', err);
        this.tasksError.set('Failed to load tasks.');
        this.tasksLoading.set(false);
      },
    });
  }
}
