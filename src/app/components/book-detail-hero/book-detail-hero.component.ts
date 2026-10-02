import { Component, Input } from '@angular/core';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-detail-hero',
  standalone: true,
  template: `
    <div class="hero">
      <div class="cover">
        @if (coverUrl) {
          <img [src]="coverUrl" [alt]="title" />
        } @else {
          <div class="placeholder">📚</div>
        }
      </div>
      <div class="details">
        <h1 class="title">{{ title }}</h1>
        @if (authors.length) {
          <p class="authors">by {{ authors.join(', ') }}</p>
        }
        @if (year) {
          <p class="year">First published {{ year }}</p>
        }
        @if (subjects.length) {
          <div class="subjects">
            @for (subject of subjects.slice(0, 6); track subject) {
              <span class="chip">{{ subject }}</span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .hero {
      display: flex;
      gap: 32px;
      margin-bottom: 32px;
    }

    .cover {
      flex-shrink: 0;
      width: 200px;
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

      img {
        width: 100%;
        display: block;
      }
    }

    .placeholder {
      width: 200px;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      background: var(--primary-light);
    }

    .details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 8px;
    }

    .title {
      font-size: 1.8rem;
    }

    .authors {
      font-size: 1.1rem;
      color: var(--text-muted);
    }

    .year {
      font-size: 0.95rem;
      color: var(--text-muted);
    }

    .subjects {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .chip {
      background: var(--primary-light);
      color: var(--primary);
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .hero {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 20px;
      }

      .cover {
        width: 160px;
      }

      .placeholder {
        width: 160px;
        height: 240px;
      }

      .subjects {
        justify-content: center;
      }

      .title {
        font-size: 1.4rem;
      }
    }
  `],
})
export class BookDetailHeroComponent {
  @Input({ required: true }) title = '';
  @Input() authors: string[] = [];
  @Input() coverId?: number;
  @Input() year?: number;
  @Input() subjects: string[] = [];

  coverUrl = '';

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.coverUrl = this.bookService.getCoverUrl(this.coverId, 'L');
  }

  ngOnChanges(): void {
    this.coverUrl = this.bookService.getCoverUrl(this.coverId, 'L');
  }
}
