import { Routes } from '@angular/router';
import {LoginComponent} from './components/login/login.component';

export const routes: Routes = [
  // Admin routes (completely separate)
  { path: 'management/login', component: LoginComponent }, // Remove AuthGuard from login
  { path: 'management', redirectTo: 'management/dashboard', pathMatch: 'full' },

  // Catch all - redirect to visitor home
  {path: '**', redirectTo: ''}
];
