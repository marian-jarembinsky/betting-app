import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/matches/matches.component').then(
        m => m.MatchesComponent
      ),
  },
  {
    path: 'place-bet',
    loadComponent: () =>
      import('./components/place-bet/place-bet.component').then(
        m => m.PlaceBetComponent
      ),
  },
  {
    path: 'place-bet/:matchNumber',
    loadComponent: () =>
      import('./components/place-bet/place-bet.component').then(
        m => m.PlaceBetComponent
      ),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/admin/admin.component').then(m => m.AdminComponent),
  },
  { path: '**', redirectTo: '' },
];
