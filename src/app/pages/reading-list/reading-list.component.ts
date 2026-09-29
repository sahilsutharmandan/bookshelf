import { Component } from '@angular/core';
import { KanbanBoardComponent } from '../../components/kanban-board/kanban-board.component';

@Component({
  selector: 'app-reading-list',
  standalone: true,
  imports: [KanbanBoardComponent],
  template: `
    <section class="reading-list-page">
      <h1>My Reading List</h1>
      <app-kanban-board />
    </section>
  `,
  styles: [`
    .reading-list-page {
      padding-top: 16px;
    }

    h1 {
      font-size: 1.8rem;
      margin-bottom: 24px;
    }
  `],
})
export class ReadingListComponent {}
