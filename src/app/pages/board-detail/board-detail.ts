import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BoardService } from '../../shared/services/BoardService';
import { ColumnService } from '../../shared/services/ColumnService';
import { TaskService } from '../../shared/services/TaskService';
import { BoardResponse } from '../../shared/models/board.model';
import { TaskResponse } from '../../shared/models/task.model';
import { swal } from '../../shared/utils/swal';
import { DragStateService } from './drag-state.service';
import { KanbanColumnComponent } from './kanban-column/kanban-column';

@Component({
  selector: 'app-board-detail',
  imports: [ReactiveFormsModule, KanbanColumnComponent],
  providers: [DragStateService],
  templateUrl: './board-detail.html',
  styleUrl: './board-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardDetailComponent {
  private readonly route         = inject(ActivatedRoute);
  private readonly boardService  = inject(BoardService);
  private readonly columnService = inject(ColumnService);
  private readonly taskService   = inject(TaskService);
  private readonly fb            = inject(FormBuilder);

  protected readonly board   = signal<BoardResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error   = signal<string | null>(null);

  protected readonly showCreateForm = signal(false);
  protected readonly creating       = signal(false);
  protected readonly createForm = this.fb.group({ title: ['', Validators.required] });

  protected boardId = 0;

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.boardId = Number(params.get('id'));
      this.board.set(null);
      this.loading.set(true);
      this.error.set(null);
      this.boardService.getBoard(this.boardId).subscribe({
        next: (data) => {
          this.board.set({
            ...data,
            columns: [...data.columns].sort((a, b) => a.position - b.position),
          });
          this.loading.set(false);
        },
        error: (err: unknown) => {
          console.error('Error loading board:', err);
          this.error.set('Failed to load board.');
          this.loading.set(false);
        },
      });
    });
  }

  // ── Column CRUD ──────────────────────────────────────────────────────────────

  protected onAddColumn(): void { this.showCreateForm.set(true); }

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
        this.board.update(b =>
          b ? { ...b, columns: [...b.columns, { ...column, tasks: column.tasks ?? [] }] } : b
        );
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

  // ── Events from KanbanColumnComponent ───────────────────────────────────────

  protected onTaskAdded(event: { columnId: number; task: TaskResponse }): void {
    this.board.update(b => b ? {
      ...b,
      columns: b.columns.map(c =>
        c.id === event.columnId ? { ...c, tasks: [...c.tasks, event.task] } : c
      ),
    } : b);
  }

  protected onTaskDrop(event: { taskId: string; srcColId: number; targetColId: number }): void {
    const { taskId, srcColId, targetColId } = event;
    let movedTask: TaskResponse | undefined;

    this.board.update(b => {
      if (!b) return b;
      const cols = b.columns.map(c => {
        if (c.id === srcColId) {
          const tasks = c.tasks.filter(t => {
            if (t.id === taskId) { movedTask = t; return false; }
            return true;
          });
          return { ...c, tasks };
        }
        return c;
      });
      if (!movedTask) return b;
      return {
        ...b,
        columns: cols.map(c =>
          c.id === targetColId ? { ...c, tasks: [...c.tasks, movedTask!] } : c
        ),
      };
    });

    this.taskService.moveTask({ taskId, newColumnId: targetColId, boardId: this.boardId }).subscribe({
      error: (err: unknown) => console.error('Move task failed:', err),
    });
  }

  protected onColDrop(event: { srcColId: number; targetColId: number }): void {
    const { srcColId, targetColId } = event;
    const cols = [...(this.board()?.columns ?? [])];
    const fromIdx = cols.findIndex(c => c.id === srcColId);
    const toIdx   = cols.findIndex(c => c.id === targetColId);
    if (fromIdx === -1 || toIdx === -1) return;

    const [col] = cols.splice(fromIdx, 1);
    cols.splice(toIdx, 0, col);

    const afterColumnId  = cols[toIdx - 1]?.id ?? null;
    const beforeColumnId = cols[toIdx + 1]?.id ?? null;

    this.board.update(b => b ? { ...b, columns: cols } : b);

    this.columnService.moveColumn(this.boardId, srcColId, { afterColumnId, beforeColumnId }).subscribe({
      error: (err: unknown) => console.error('Move column failed:', err),
    });
  }
}
