import {
  ChangeDetectionStrategy, Component, computed, inject, input, output, signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BoardColumnResponse } from '../../../shared/models/board-column.model';
import { TaskResponse } from '../../../shared/models/task.model';
import { TaskService } from '../../../shared/services/TaskService';
import { swal } from '../../../shared/utils/swal';
import { DragStateService } from '../drag-state.service';
import { TaskCardComponent } from '../task-card/task-card';

const COLORS = [
  [137, 180, 250],
  [180, 190, 254],
  [166, 227, 161],
  [243, 139, 168],
  [250, 179, 135],
  [249, 226, 175],
  [148, 226, 213],
  [203, 166, 247],
] as const;

@Component({
  selector: 'app-kanban-column',
  imports: [ReactiveFormsModule, TaskCardComponent],
  templateUrl: './kanban-column.html',
  styleUrl: './kanban-column.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'column-card',
    '[class.col-dragging]':    'dragState.draggingColId() === column().id',
    '[class.col-drop-target]': 'dragState.colDropTargetId() === column().id',
    '[style.--col-r]': 'rgb()[0]',
    '[style.--col-g]': 'rgb()[1]',
    '[style.--col-b]': 'rgb()[2]',
    '(dragover)':  'onDragOver($event)',
    '(dragleave)': 'onDragLeave($event)',
    '(drop)':      'onDrop($event)',
  },
})
export class KanbanColumnComponent {
  readonly column     = input.required<BoardColumnResponse>();
  readonly boardId    = input.required<number>();
  readonly colorIndex = input<number>(0);

  readonly taskAdded = output<{ columnId: number; task: TaskResponse }>();
  readonly taskDrop  = output<{ taskId: string; srcColId: number; targetColId: number }>();
  readonly colDrop   = output<{ srcColId: number; targetColId: number }>();

  protected readonly dragState = inject(DragStateService);
  private  readonly taskService = inject(TaskService);
  private  readonly fb          = inject(FormBuilder);

  protected readonly rgb = computed(() => COLORS[this.colorIndex() % COLORS.length]);

  protected readonly addingTask   = signal(false);
  protected readonly creatingTask = signal(false);
  protected readonly taskForm = this.fb.group({ title: ['', Validators.required] });

  // ── Task CRUD ────────────────────────────────────────────────────────────────

  protected onAddTask(): void {
    this.addingTask.set(true);
    this.taskForm.reset();
  }

  protected onCancelTask(): void {
    this.addingTask.set(false);
    this.taskForm.reset();
  }

  protected onCreateTask(): void {
    if (this.taskForm.invalid) return;
    const title = this.taskForm.value.title ?? '';
    this.creatingTask.set(true);
    this.taskService.createTask({ title, priority: 1, columnId: this.column().id, boardId: this.boardId() }).subscribe({
      next: (task) => {
        this.taskAdded.emit({ columnId: this.column().id, task });
        this.taskForm.reset();
        this.creatingTask.set(false);
        this.addingTask.set(false);
      },
      error: (err: unknown) => {
        console.error('Error creating task:', err);
        this.creatingTask.set(false);
        swal.error('Failed to create task', 'Please try again.');
      },
    });
  }

  // ── Column header drag ───────────────────────────────────────────────────────

  protected onColHeaderDragStart(event: DragEvent): void {
    this.dragState.colDragStart(event, this.column().id);
  }

  protected onColHeaderDragEnd(): void {
    this.dragState.colDragEnd();
  }

  // ── Drop target events (on host) ─────────────────────────────────────────────

  protected onDragOver(event: DragEvent): void {
    this.dragState.colCardDragOver(event, this.column().id);
  }

  protected onDragLeave(event: DragEvent): void {
    this.dragState.colCardDragLeave(event);
  }

  protected onDrop(event: DragEvent): void {
    const result = this.dragState.resolveDrop(event, this.column().id);
    if (!result) return;
    if (result.type === 'task') {
      this.taskDrop.emit(result);
    } else {
      this.colDrop.emit(result);
    }
  }
}
