import { Component, OnInit, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReadingListEntry, ReadingStatus } from '../../models/book.model';
import { ReadingListService } from '../../services/reading-list.service';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';

type SortOption = 'newest' | 'oldest' | 'title' | 'rating';
type EntryComparator = (a: ReadingListEntry, b: ReadingListEntry) => number;

const byDateAdded: EntryComparator = (a, b) =>
  new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();

const SORTERS: Record<SortOption, EntryComparator> = {
  newest: (a, b) => byDateAdded(b, a),
  oldest: byDateAdded,
  title: (a, b) => a.title.localeCompare(b.title),
  rating: (a, b) => b.rating - a.rating,
};

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [KanbanColumnComponent, FormsModule, RouterLink],
  template: `
    @if (activeCount === 0) {
      <div class="empty-state">
        <p>Your reading list is empty.</p>
        <a routerLink="/">Find something to read</a>
      </div>
    } @else {
      <div class="toolbar">
        <span class="summary">{{ activeCount }} to read &middot; {{ finishedItems.length }} finished</span>
        <label class="sort">
          Sort by
          <select [(ngModel)]="sortBy" (ngModelChange)="refresh()">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title</option>
            <option value="rating">Rating</option>
          </select>
        </label>
      </div>

      <div class="board">
        <app-kanban-column
          title="Want to Read"
          columnId="want"
          [items]="wantItems"
          [connectedTo]="['reading', 'finished']"
          (dropped)="onDrop($event)"
          (removeClicked)="onRemove($event)"
          (ratingChanged)="onRatingChange($event)"
        />
        <app-kanban-column
          title="Reading"
          columnId="reading"
          [items]="readingItems"
          [connectedTo]="['want', 'finished']"
          (dropped)="onDrop($event)"
          (removeClicked)="onRemove($event)"
          (ratingChanged)="onRatingChange($event)"
        />
        <app-kanban-column
          title="Finished"
          columnId="finished"
          [items]="finishedItems"
          [connectedTo]="['want', 'reading']"
          (dropped)="onDrop($event)"
          (removeClicked)="onRemove($event)"
          (ratingChanged)="onRatingChange($event)"
        />
      </div>
    }
  `,
  styles: [`
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .summary {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .sort {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: var(--text-muted);

      select {
        padding: 6px 10px;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--bg-card);
        color: var(--text);
        font-size: 0.9rem;
      }
    }

    .empty-state {
      text-align: center;
      padding: 64px 16px;
      color: var(--text-muted);
      background: var(--bg-card);
      border: 1px dashed var(--border);
      border-radius: var(--radius);

      p {
        font-size: 1.1rem;
        margin-bottom: 8px;
      }

      a {
        font-weight: 600;
      }
    }

    .board {
      display: flex;
      gap: 24px;
    }

    @media (max-width: 768px) {
      .board {
        flex-direction: column;
      }
    }
  `],
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  wantItems: ReadingListEntry[] = [];
  readingItems: ReadingListEntry[] = [];
  finishedItems: ReadingListEntry[] = [];
  activeCount = 0;
  sortBy: SortOption = 'newest';
  private sub?: Subscription;

  constructor(private readingListService: ReadingListService) {}

  ngOnInit(): void {
    this.sub = this.readingListService.entries$.subscribe(() => this.refresh());
  }

  refresh(): void {
    this.wantItems = this.sorted('want');
    this.readingItems = this.sorted('reading');
    this.finishedItems = this.sorted('finished');
    this.activeCount = this.wantItems.length + this.readingItems.length;
  }

  private sorted(status: ReadingStatus): ReadingListEntry[] {
    return this.readingListService.getByStatus(status).sort(SORTERS[this.sortBy]);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onDrop(event: CdkDragDrop<ReadingListEntry[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const entry = event.container.data[event.currentIndex];
      const newStatus = event.container.id as ReadingStatus;
      this.readingListService.updateStatus(entry.workId, newStatus);
    }
  }

  onRemove(workId: string): void {
    this.readingListService.remove(workId);
  }

  onRatingChange(event: { workId: string; rating: number }): void {
    this.readingListService.updateRating(event.workId, event.rating);
  }
}
