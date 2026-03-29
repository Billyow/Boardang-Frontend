import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

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
    '(click)':     'onCardClick()',
  },
})
export class TaskCardComponent {
  readonly task  = input.required<TaskResponse>();
  readonly colId = input.required<number>();

  readonly taskOpen = output<TaskResponse>();

  private readonly dragState = inject(DragStateService);
  private _dragged = false;

  protected readonly hostClass = computed(() => {
    const p = this.task().priority;
    const level = p <= 10 ? 'low' : p <= 50 ? 'medium' : 'high';
    const dragging = this.dragState.draggingTaskId() === this.task().id ? ' task-dragging' : '';
    return `task-card priority-${level}${dragging}`;
  });

  protected readonly priorityLevel = computed(() => {
    const p = this.task().priority;
    return p <= 10 ? 'low' : p <= 50 ? 'medium' : 'high';
  });

  protected readonly priorityLabel = computed(() => {
    const p = this.task().priority;
    return p <= 10 ? 'Low' : p <= 50 ? 'Medium' : 'High';
  });

  protected readonly initials = computed(() =>
    this.task().createdBy.name
      .split(' ')
      .map((w: string) => w[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2)
  );

  protected onDragStart(event: DragEvent): void {
    this._dragged = true;
    this.dragState.taskDragStart(event, this.task(), this.colId());
  }

  protected onDragEnd(): void {
    this.dragState.taskDragEnd();
    setTimeout(() => { this._dragged = false; }, 0);
  }

  protected onCardClick(): void {
    if (this._dragged) return;
    this.taskOpen.emit(this.task());
  }
}
