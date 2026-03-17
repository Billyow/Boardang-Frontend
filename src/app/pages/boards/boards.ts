import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BoardService } from '../../shared/services/BoardService';
import { BoardSummaryResponse, CreateBoardRequest } from '../../shared/models/board.model';

@Component({
  selector: 'app-boards',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './boards.html',
  styleUrl: './boards.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardsComponent {
  private readonly boardService = inject(BoardService);
  private readonly fb = inject(FormBuilder);

  protected readonly boards = signal<BoardSummaryResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly creating = signal(false);

  protected readonly createForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
  });

  constructor() {
    this.boardService.getBoards().subscribe({
      next: (data) => {
        this.boards.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Error loading boards:', err);
        this.error.set('Failed to load boards.');
        this.loading.set(false);
      },
    });
  }

  protected onCreate(): void {
    if (this.createForm.invalid) return;

    const { title, description } = this.createForm.value;
    const request: CreateBoardRequest = {
      title: title ?? '',
      description: description ?? null,
    };

    this.creating.set(true);

    this.boardService.createBoard(request).subscribe({
      next: (board) => {
        this.boards.update(current => [...current, board]);
        this.createForm.reset();
        this.creating.set(false);
      },
      error: (err: unknown) => {
        console.error('Error creating board:', err);
        this.creating.set(false);
      },
    });
  }
}
