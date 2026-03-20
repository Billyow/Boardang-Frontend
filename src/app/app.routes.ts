import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/shell/shell').then(m => m.ShellComponent),
    children: [
      {
        path: 'boards',
        loadComponent: () => import('./pages/boards/boards').then(m => m.BoardsComponent),
      },
      {
        path: 'boards/:id',
        loadComponent: () => import('./pages/board-detail/board-detail').then(m => m.BoardDetailComponent),
      },
      {
        path: '',
        redirectTo: 'boards',
        pathMatch: 'full',
      },
    ],
  },
];
