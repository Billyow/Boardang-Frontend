import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { SearchUserComponent } from './pages/search-user/search-user'

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'success',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  
  {
    path: '',
    component: SearchUserComponent
  }

];
