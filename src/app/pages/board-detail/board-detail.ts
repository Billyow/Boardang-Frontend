import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BoardService } from '../../shared/services/BoardService';
import { ColumnService } from '../../shared/services/ColumnService';
import { TaskService } from '../../shared/services/TaskService';
import { BoardResponse } from '../../shared/models/board.model';
import { swal } from '../../shared/utils/swal';

@Component({
  selector: 'app-board-detail',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './board-detail.html',
  styleUrl: './board-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly boardService = inject(BoardService); // used for initial load
  private readonly columnService = inject(ColumnService);
  private readonly taskService = inject(TaskService);
  private readonly fb = inject(FormBuilder);

  protected readonly board = signal<BoardResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Column creation
  protected readonly showCreateForm = signal(false);
  protected readonly creating = signal(false);
  protected readonly createForm = this.fb.group({
    title: ['', Validators.required],
  });

  // Task creation
  protected readonly addingTaskInColumn = signal<number | null>(null);
  protected readonly creatingTask = signal(false);
  protected readonly createTaskForm = this.fb.group({
    title: ['', Validators.required],
  });

  private boardId = 0;

  constructor() {
    this.boardId = Number(this.route.snapshot.paramMap.get('id'));

    this.boardService.getBoard(this.boardId).subscribe({
      next: (data) => {
        this.board.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Error loading board:', err);
        this.error.set('Failed to load board.');
        this.loading.set(false);
      },
    });
  }

  // ── Column actions ─────────────────────────────────────────────────────────

  protected onAddColumn(): void {
    this.showCreateForm.set(true);
  }

  protected onCancelCreate(): void {
    this.showCreateForm.set(false);
    this.createForm.reset();
  }

  protected onCreateColumn(): void {
    if (this.createForm.invalid) return;

    const title = this.createForm.value.title ?? '';
    this.creating.set(true);

    this.columnService.createColumn(this.boardId, title).subscribe({
      next: (column) => {
        this.board.update(b => b ? { ...b, columns: [...b.columns, { ...column, tasks: column.tasks ?? [] }] } : b);
        this.createForm.reset();
        this.creating.set(false);
        this.showCreateForm.set(false);
      },
      error: (err: unknown) => {
        console.error('Error creating column:', err);
        this.creating.set(false);
        swal.error('Failed to create column', 'Please try again.');
      },
    });
  }

  // ── Task actions ───────────────────────────────────────────────────────────

  protected onAddTask(columnId: number): void {
    this.addingTaskInColumn.set(columnId);
    this.createTaskForm.reset();
  }

  protected onCancelTask(): void {
    this.addingTaskInColumn.set(null);
    this.createTaskForm.reset();
  }

  protected onCreateTask(columnId: number): void {
    if (this.createTaskForm.invalid) return;

    const title = this.createTaskForm.value.title ?? '';
    this.creatingTask.set(true);

    this.taskService.createTask({ title, priority: 1, columnId, boardId: this.boardId }).subscribe({
      next: (task) => {
        this.board.update(b => b ? {
          ...b,
          columns: b.columns.map(c =>
            c.id === columnId ? { ...c, tasks: [...c.tasks, task] } : c
          ),
        } : b);
        this.createTaskForm.reset();
        this.creatingTask.set(false);
        this.addingTaskInColumn.set(null);
      },
      error: (err: unknown) => {
        console.error('Error creating task:', err);
        this.creatingTask.set(false);
        swal.error('Failed to create task', 'Please try again.');
      },
    });
  }

  protected priorityClass(priority: number): string {
    if (priority <= 10) return 'low';
    if (priority <= 50) return 'medium';
    return 'high';
  }
}
