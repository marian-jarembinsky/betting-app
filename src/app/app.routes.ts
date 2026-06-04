import { Routes } from '@angular/router';

export const routes: Routes = [
  // {
  //   path: 'matches',
  //   loadComponent: () =>
  //     import('./components/matches/matches.component').then(
  //       m => m.MatchesComponent
  //     ),
  // },
  { path: '**', redirectTo: '' },
];
