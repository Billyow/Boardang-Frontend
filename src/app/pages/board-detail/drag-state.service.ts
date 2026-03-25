import { Injectable, signal } from '@angular/core';
import { TaskResponse } from '../../shared/models/task.model';

export type DropResult =
  | { type: 'task'; taskId: string; srcColId: number; targetColId: number }
  | { type: 'col';  srcColId: number; targetColId: number };

@Injectable()
export class DragStateService {
  private readonly DRAG_TASK = 'application/x-boardang-task';
  private readonly DRAG_COL  = 'application/x-boardang-col';

  readonly draggingTaskId  = signal<string | null>(null);
  readonly dropTargetColId = signal<number | null>(null);
  readonly draggingColId   = signal<number | null>(null);
  readonly colDropTargetId = signal<number | null>(null);

  private dragSrcColId = 0;

  // ── Task drag ────────────────────────────────────────────────────────────────

  taskDragStart(event: DragEvent, task: TaskResponse, colId: number): void {
    this.dragSrcColId = colId;
    this.draggingTaskId.set(task.id);
    event.dataTransfer!.setData(this.DRAG_TASK, task.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  taskDragEnd(): void {
    this.draggingTaskId.set(null);
    this.dropTargetColId.set(null);
    this.dragSrcColId = 0;
  }

  // ── Column drag ──────────────────────────────────────────────────────────────

  colDragStart(event: DragEvent, colId: number): void {
    this.draggingColId.set(colId);
    event.dataTransfer!.setData(this.DRAG_COL, String(colId));
    event.dataTransfer!.effectAllowed = 'move';
  }

  colDragEnd(): void {
    this.draggingColId.set(null);
    this.colDropTargetId.set(null);
  }

  // ── Drop-target management ───────────────────────────────────────────────────

  colCardDragOver(event: DragEvent, colId: number): void {
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

  colCardDragLeave(event: DragEvent): void {
    const rel = event.relatedTarget as Element | null;
    if (rel && (event.currentTarget as Element).contains(rel)) return;
    this.dropTargetColId.set(null);
    this.colDropTargetId.set(null);
  }

  // ── Drop resolution ──────────────────────────────────────────────────────────

  resolveDrop(event: DragEvent, targetColId: number): DropResult | null {
    event.preventDefault();

    const taskId = event.dataTransfer?.getData(this.DRAG_TASK);
    if (taskId) {
      const srcColId = this.dragSrcColId;
      this.dropTargetColId.set(null);
      this.draggingTaskId.set(null);
      this.dragSrcColId = 0;
      if (!srcColId || srcColId === targetColId) return null;
      return { type: 'task', taskId, srcColId, targetColId };
    }

    const srcColIdStr = event.dataTransfer?.getData(this.DRAG_COL);
    if (srcColIdStr) {
      const srcColId = Number(srcColIdStr);
      this.colDropTargetId.set(null);
      this.draggingColId.set(null);
      if (srcColId === targetColId) return null;
      return { type: 'col', srcColId, targetColId };
    }

    return null;
  }
}
