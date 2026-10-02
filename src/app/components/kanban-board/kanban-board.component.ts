import { Component, OnInit, OnDestroy } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { ReadingListEntry, ReadingStatus } from '../../models/book.model';
import { ReadingListService } from '../../services/reading-list.service';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [KanbanColumnComponent],
  template: `
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
  `,
  styles: [`
    .board {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 24px;
    }

    @media (max-width: 767px) {
      .board {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `],
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  wantItems: ReadingListEntry[] = [];
  readingItems: ReadingListEntry[] = [];
  finishedItems: ReadingListEntry[] = [];
  private sub?: Subscription;

  constructor(private readingListService: ReadingListService) {}

  ngOnInit(): void {
    this.sub = this.readingListService.entries$.subscribe(() => {
      this.wantItems = this.readingListService.getByStatus('want');
      this.readingItems = this.readingListService.getByStatus('reading');
      this.finishedItems = this.readingListService.getByStatus('finished');
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onDrop(event: CdkDragDrop<ReadingListEntry[]>): void {
    const entry = event.previousContainer.data[event.previousIndex];
    if (entry) {
      this.readingListService.moveEntry(
        entry.workId,
        event.container.id as ReadingStatus,
        event.currentIndex
      );
    }
  }

  onRemove(workId: string): void {
    this.readingListService.remove(workId);
  }

  onRatingChange(event: { workId: string; rating: number }): void {
    this.readingListService.updateRating(event.workId, event.rating);
  }
}
