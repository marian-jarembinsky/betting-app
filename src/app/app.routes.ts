import { Routes } from '@angular/router';

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
  { path: '**', redirectTo: '' },
];
