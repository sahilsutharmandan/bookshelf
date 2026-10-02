import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    <div class="stars" role="group" aria-label="Your rating" (mouseleave)="hoverValue = 0">
      @for (star of stars; track star) {
        <button
          type="button"
          [attr.aria-label]="star + (star === 1 ? ' star' : ' stars')"
          [attr.aria-pressed]="star === rating"
          class="star"
          [class.filled]="star <= (hoverValue || rating)"
          (click)="setRating(star)"
          (mouseenter)="hoverValue = star"
        >★</button>
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
      color: var(--text-muted);
      padding: 4px;
      line-height: 1;
      transition: color 0.15s, transform 0.15s;

      &:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
      }

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
