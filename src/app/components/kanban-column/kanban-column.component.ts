import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { RouterLink } from '@angular/router';
import { ReadingListEntry } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [CdkDropList, CdkDrag, RouterLink, StarRatingComponent],
  template: `
    <div class="column">
      <h3 class="column-title">{{ title }} <span class="count">({{ items.length }})</span></h3>
      <div
        class="card-list"
        cdkDropList
        [cdkDropListData]="items"
        [id]="columnId"
        [cdkDropListConnectedTo]="connectedTo"
        (cdkDropListDropped)="dropped.emit($event)"
      >
        @for (entry of items; track entry.workId) {
          <div class="kanban-card" cdkDrag>
            <a [routerLink]="['/book', entry.workId]" class="card-link">
              <div class="card-cover">
                @if (getCoverUrl(entry.coverId)) {
                  <img [src]="getCoverUrl(entry.coverId)" [alt]="entry.title" loading="lazy" />
                } @else {
                  <div class="placeholder">📚</div>
                }
              </div>
              <div class="card-info">
                <p class="card-title">{{ entry.title }}</p>
                <p class="card-author">{{ entry.authors.join(', ') || 'Unknown author' }}</p>
              </div>
            </a>
            <div class="card-footer">
              <app-star-rating
                [rating]="entry.rating"
                (ratingChange)="ratingChanged.emit({ workId: entry.workId, rating: $event })"
              />
              <button class="remove-btn" (click)="removeClicked.emit(entry.workId)" aria-label="Remove from list">✕</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .column {
      flex: 1;
      min-width: 0;
    }

    .column-title {
      font-size: 1rem;
      font-family: var(--font-heading);
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--primary);
    }

    .count {
      font-weight: 400;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .card-list {
      min-height: 100px;
      background: var(--bg);
      border-radius: var(--radius);
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .kanban-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      cursor: grab;
      transition: box-shadow 0.2s;

      &:active {
        cursor: grabbing;
      }
    }

    .card-link {
      display: flex;
      gap: 10px;
      padding: 10px;
      text-decoration: none;
      color: var(--text);
    }

    .card-cover {
      width: 48px;
      height: 68px;
      flex-shrink: 0;
      border-radius: 4px;
      overflow: hidden;
      background: var(--primary-light);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .card-info {
      min-width: 0;
    }

    .card-title {
      font-weight: 600;
      font-size: 0.85rem;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-author {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 2px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px 8px;
    }

    .remove-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1rem;
      padding: 4px 8px;
      border-radius: 4px;
      transition: color 0.2s, background 0.2s;

      &:hover {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
      }
    }

    :host ::ng-deep .cdk-drag-preview {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      border-radius: var(--radius);
      background: var(--bg-card);
    }

    :host ::ng-deep .cdk-drag-placeholder {
      opacity: 0.3;
    }

    :host ::ng-deep .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `],
})
export class KanbanColumnComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) columnId = '';
  @Input() items: ReadingListEntry[] = [];
  @Input() connectedTo: string[] = [];
  @Output() dropped = new EventEmitter<any>();
  @Output() removeClicked = new EventEmitter<string>();
  @Output() ratingChanged = new EventEmitter<{ workId: string; rating: number }>();

  constructor(private bookService: BookService) {}

  getCoverUrl(coverId: number | undefined): string {
    return this.bookService.getCoverUrl(coverId, 'S');
  }
}
