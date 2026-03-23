import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BoardService } from '../../shared/services/BoardService';
import { ColumnService } from '../../shared/services/ColumnService';
import { TaskService } from '../../shared/services/TaskService';
import { BoardResponse } from '../../shared/models/board.model';
import { TaskResponse } from '../../shared/models/task.model';
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
  private readonly boardService = inject(BoardService);
  private readonly columnService = inject(ColumnService);
  private readonly taskService = inject(TaskService);
  private readonly fb = inject(FormBuilder);

  protected readonly board = signal<BoardResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Column creation
  protected readonly showCreateForm = signal(false);
  protected readonly creating = signal(false);
  protected readonly createForm = this.fb.group({ title: ['', Validators.required] });

  // Task creation
  protected readonly addingTaskInColumn = signal<number | null>(null);
  protected readonly creatingTask = signal(false);
  protected readonly createTaskForm = this.fb.group({ title: ['', Validators.required] });

  // Drag & Drop state (signals consumed by template)
  protected readonly draggingTaskId = signal<string | null>(null);
  protected readonly dropTargetColId = signal<number | null>(null);
  protected readonly draggingColId = signal<number | null>(null);
  protected readonly colDropTargetId = signal<number | null>(null);

  // Internal drag tracking (not needed in template)
  private dragSrcColId = 0;

  private readonly DRAG_TASK = 'application/x-boardang-task';
  private readonly DRAG_COL  = 'application/x-boardang-col';

  private boardId = 0;

  constructor() {
    this.boardId = Number(this.route.snapshot.paramMap.get('id'));

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
  }

  // ── Column CRUD ─────────────────────────────────────────────────────────────

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

  // ── Task CRUD ───────────────────────────────────────────────────────────────

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

  // ── CSS class helpers ───────────────────────────────────────────────────────

  protected taskClass(task: TaskResponse): string {
    const priority = 'priority-' + this.priorityClass(task.priority);
    const dragging = this.draggingTaskId() === task.id ? ' task-dragging' : '';
    return `task-card ${priority}${dragging}`;
  }

  protected colClass(colId: number): string {
    const dragging   = this.draggingColId() === colId    ? ' col-dragging'    : '';
    const dropTarget = this.colDropTargetId() === colId  ? ' col-drop-target' : '';
    return `column-card${dragging}${dropTarget}`;
  }

  // ── Drag & Drop — Task source ───────────────────────────────────────────────

  protected onTaskDragStart(event: DragEvent, task: TaskResponse, colId: number): void {
    this.dragSrcColId = colId;
    this.draggingTaskId.set(task.id);
    event.dataTransfer!.setData(this.DRAG_TASK, task.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  protected onTaskDragEnd(): void {
    this.draggingTaskId.set(null);
    this.dropTargetColId.set(null);
    this.dragSrcColId = 0;
  }

  // ── Drag & Drop — Column source (grabbed via col-header) ───────────────────

  protected onColHeaderDragStart(event: DragEvent, colId: number): void {
    this.draggingColId.set(colId);
    event.dataTransfer!.setData(this.DRAG_COL, String(colId));
    event.dataTransfer!.effectAllowed = 'move';
  }

  protected onColHeaderDragEnd(): void {
    this.draggingColId.set(null);
    this.colDropTargetId.set(null);
  }

  // ── Drag & Drop — Column card (drop target for both tasks and columns) ──────

  protected onColCardDragOver(event: DragEvent, colId: number): void {
    const types = event.dataTransfer?.types ?? [];

    if (types.includes(this.DRAG_TASK)) {
      event.preventDefault();
      event.dataTransfer!.dropEffect = 'move';
      this.dropTargetColId.set(colId);
    } else if (types.includes(this.DRAG_COL) && this.draggingColId() !== colId) {
      event.preventDefault();
      event.dataTransfer!.dropEffect = 'move';
      this.colDropTargetId.set(colId);
    }
  }

  protected onColCardDragLeave(event: DragEvent): void {
    const rel = event.relatedTarget as Element | null;
    if (rel && (event.currentTarget as Element).contains(rel)) return;
    this.dropTargetColId.set(null);
    this.colDropTargetId.set(null);
  }

  protected onColCardDrop(event: DragEvent, targetColId: number): void {
    event.preventDefault();
    const taskId = event.dataTransfer?.getData(this.DRAG_TASK);
    if (taskId) {
      this.handleTaskDrop(taskId, targetColId);
      return;
    }
    const srcColIdStr = event.dataTransfer?.getData(this.DRAG_COL);
    if (srcColIdStr) {
      this.handleColDrop(Number(srcColIdStr), targetColId);
    }
  }

  // ── Drop handlers ───────────────────────────────────────────────────────────

  private handleTaskDrop(taskId: string, targetColId: number): void {
    const srcColId = this.dragSrcColId;
    this.dropTargetColId.set(null);
    this.draggingTaskId.set(null);
    this.dragSrcColId = 0;

    if (!srcColId || srcColId === targetColId) return;

    let movedTask: TaskResponse | undefined;
    this.board.update(b => {
      if (!b) return b;
      const cols = b.columns.map(c => {
        if (c.id === srcColId) {
          const tasks = c.tasks.filter(t => { if (t.id === taskId) { movedTask = t; return false; } return true; });
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

  private handleColDrop(srcColId: number, targetColId: number): void {
    this.colDropTargetId.set(null);
    this.draggingColId.set(null);

    if (srcColId === targetColId) return;

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
