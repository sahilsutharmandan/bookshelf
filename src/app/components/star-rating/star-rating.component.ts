import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    <div class="stars">
      @for (star of stars; track star) {
        <span
          class="star"
          [class.filled]="star <= (hoverValue || rating)"
          (click)="setRating(star)"
          (mouseenter)="hoverValue = star"
        >★</span>
      }
    </div>
  `,
  styles: [`
    .stars {
      display: flex;
      gap: 4px;
    }

    .star {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--border);
      padding: 0;
      line-height: 1;
      transition: color 0.15s, transform 0.15s;

      &:hover {
        transform: scale(1.15);
      }

      &.filled {
        color: #f59e0b;
      }
    }
  `],
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Output() ratingChange = new EventEmitter<number>();

  stars = [1, 2, 3, 4, 5];
  hoverValue = 0;

  setRating(value: number): void {
    this.rating = value;
    this.ratingChange.emit(value);
  }
}
