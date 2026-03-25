import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { TaskResponse } from '../../../shared/models/task.model';
import { DragStateService } from '../drag-state.service';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]':     'hostClass()',
    draggable:     'true',
    '(dragstart)': 'onDragStart($event)',
    '(dragend)':   'onDragEnd()',
  },
})
export class TaskCardComponent {
  readonly task  = input.required<TaskResponse>();
  readonly colId = input.required<number>();

  private readonly dragState = inject(DragStateService);

  protected readonly hostClass = computed(() => {
    const p = this.task().priority;
    const level = p <= 10 ? 'low' : p <= 50 ? 'medium' : 'high';
    const dragging = this.dragState.draggingTaskId() === this.task().id ? ' task-dragging' : '';
    return `task-card priority-${level}${dragging}`;
  });

  protected onDragStart(event: DragEvent): void {
    this.dragState.taskDragStart(event, this.task(), this.colId());
  }

  protected onDragEnd(): void {
    this.dragState.taskDragEnd();
  }
}
