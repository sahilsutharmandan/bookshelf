import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/search/search.component').then(m => m.SearchComponent),
  },
  {
    path: 'book/:workId',
    loadComponent: () =>
      import('./pages/book-detail/book-detail.component').then(m => m.BookDetailComponent),
  },
  {
    path: 'reading-list',
    loadComponent: () =>
      import('./pages/reading-list/reading-list.component').then(m => m.ReadingListComponent),
  },
  {
    path: 'stats',
    loadComponent: () =>
      import('./pages/stats/stats.component').then(m => m.StatsComponent),
  },
  { path: '**', redirectTo: '' },
];
