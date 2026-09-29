import { Component, OnInit, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
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
