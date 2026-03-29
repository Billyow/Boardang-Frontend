import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TaskResponse, UpdateTaskRequest } from '../../../shared/models/task.model';
import { BoardResponse } from '../../../shared/models/board.model';
import { SimpleUser } from '../../../shared/models/user.model';
import { AuthService } from '../../../shared/services/AuthService';
import { TaskService } from '../../../shared/services/TaskService';
import { swal } from '../../../shared/utils/swal';

@Component({
  selector: 'app-task-detail-modal',
  imports: [FormsModule],
  templateUrl: './task-detail-modal.html',
  styleUrl: './task-detail-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailModalComponent {
  readonly task        = input.required<TaskResponse>();
  readonly board       = input.required<BoardResponse>();
  readonly close       = output<void>();
  readonly taskUpdated = output<TaskResponse>();

  private readonly authService = inject(AuthService);
  private readonly taskService = inject(TaskService);

  // ── Permission ───────────────────────────────────────────────────────────────

  protected readonly canEdit = computed(() => {
    const userId = this.authService.getUserId();
    if (userId === null) return false;
    const uid = Number(userId);
    const b = this.board();
    if (Number(b.owner.id) === uid) return true;
    const member = b.members.find(m => Number(m.user.id) === uid);
    return member?.role === 'ADMIN' || member?.role === 'MEMBER';
  });

  // ── Derived display values ────────────────────────────────────────────────────

  protected readonly initials = computed(() =>
    this.task().createdBy.name
      .split(' ')
      .map((w: string) => w[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2)
  );

  protected readonly priorityLabel = computed(() => {
    const p = this.task().priority;
    return p <= 10 ? 'Low' : p <= 50 ? 'Medium' : 'High';
  });

  protected readonly priorityLevel = computed(() => {
    const p = this.task().priority;
    return p <= 10 ? 'low' : p <= 50 ? 'medium' : 'high';
  });

  protected readonly collaboratorInitials = computed(() =>
    this.task().collaborators.map(c =>
      c.name.split(' ').map((w: string) => w[0] ?? '').join('').toUpperCase().slice(0, 2)
    )
  );

  // ── Available members for picker (board roster minus current collaborators) ──

  protected readonly availableMembers = computed(() => {
    const collaboratorIds = new Set(this.task().collaborators.map(c => c.id));
    const b = this.board();
    const roster = new Map<number, SimpleUser>();
    roster.set(b.owner.id, b.owner);
    for (const m of b.members) {
      roster.set(m.user.id, m.user);
    }
    return [...roster.values()].filter(u => !collaboratorIds.has(u.id));
  });

  // ── Edit state ────────────────────────────────────────────────────────────────

  protected readonly editingTitle         = signal(false);
  protected readonly titleDraft           = signal('');
  protected readonly editingDesc          = signal(false);
  protected readonly descDraft            = signal('');
  protected readonly editingPriority      = signal(false);
  protected readonly priorityDraft        = signal(0);
  protected readonly showCollaboratorPicker = signal(false);
  protected readonly saving               = signal(false);

  // ── Title editing ─────────────────────────────────────────────────────────────

  protected startEditTitle(): void {
    if (!this.canEdit()) return;
    this.titleDraft.set(this.task().title);
    this.editingTitle.set(true);
  }

  protected saveTitle(): void {
    const trimmed = this.titleDraft().trim();
    if (!trimmed || trimmed === this.task().title) {
      this.editingTitle.set(false);
      return;
    }
    this.patch({ title: trimmed });
  }

  protected cancelTitle(): void {
    this.editingTitle.set(false);
  }

  protected onTitleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter')  { event.preventDefault(); this.saveTitle();   }
    if (event.key === 'Escape') { event.preventDefault(); this.cancelTitle(); }
  }

  // ── Description editing ───────────────────────────────────────────────────────

  protected startEditDesc(): void {
    if (!this.canEdit()) return;
    this.descDraft.set(this.task().description ?? '');
    this.editingDesc.set(true);
  }

  protected saveDesc(): void {
    const trimmed = this.descDraft().trim();
    const current = this.task().description ?? '';
    if (trimmed === current) {
      this.editingDesc.set(false);
      return;
    }
    this.patch({ description: trimmed || null });
  }

  protected cancelDesc(): void {
    this.editingDesc.set(false);
  }

  protected onDescKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') { event.preventDefault(); this.cancelDesc(); }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.saveDesc();
    }
  }

  // ── Priority editing ──────────────────────────────────────────────────────────

  protected startEditPriority(): void {
    if (!this.canEdit()) return;
    this.priorityDraft.set(this.task().priority);
    this.editingPriority.set(true);
  }

  protected savePriority(): void {
    const value = this.priorityDraft();
    if (value === this.task().priority) {
      this.editingPriority.set(false);
      return;
    }
    this.patch({ priority: value });
  }

  protected cancelPriority(): void {
    this.editingPriority.set(false);
  }

  protected onPriorityKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter')  { event.preventDefault(); this.savePriority();   }
    if (event.key === 'Escape') { event.preventDefault(); this.cancelPriority(); }
  }

  // ── Collaborator picker ───────────────────────────────────────────────────────

  protected toggleCollaboratorPicker(): void {
    this.showCollaboratorPicker.update(v => !v);
  }

  protected addCollaborator(userId: number): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.taskService.addCollaborator(this.board().id, this.task().id, userId).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.showCollaboratorPicker.set(false);
        this.taskUpdated.emit(updated);
      },
      error: (err: unknown) => {
        console.error('Add collaborator failed:', err);
        this.saving.set(false);
        swal.error('Failed to add member', 'Please try again.');
      },
    });
  }

  protected removeCollaborator(userId: number): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.taskService.removeCollaborator(this.board().id, this.task().id, userId).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.taskUpdated.emit(updated);
      },
      error: (err: unknown) => {
        console.error('Remove collaborator failed:', err);
        this.saving.set(false);
        swal.error('Failed to remove member', 'Please try again.');
      },
    });
  }

  protected memberInitials(user: SimpleUser): string {
    return user.name.split(' ').map((w: string) => w[0] ?? '').join('').toUpperCase().slice(0, 2);
  }

  // ── Shared patch ──────────────────────────────────────────────────────────────

  private patch(changes: UpdateTaskRequest): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.taskService.updateTask(this.board().id, this.task().id, changes).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.editingTitle.set(false);
        this.editingDesc.set(false);
        this.editingPriority.set(false);
        this.taskUpdated.emit(updated);
      },
      error: (err: unknown) => {
        console.error('Update task failed:', err);
        this.saving.set(false);
        swal.error('Failed to save', 'Please try again.');
      },
    });
  }
}
