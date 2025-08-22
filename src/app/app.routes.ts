import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeDashboardComponent } from './components/home-dashboard/home-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { RedirectGuard } from './guards/redirect.guard';

export const routes: Routes = [
  // Default route - redirects based on auth status
  { path: '', canActivate: [RedirectGuard], children: [] },

  // Login route
  { path: 'login', component: LoginComponent },

  // Protected dashboard route
  { path: 'dashboard', component: HomeDashboardComponent, canActivate: [AuthGuard] },

  // Catch all - redirect to default route
  { path: '**', redirectTo: '' }
];
