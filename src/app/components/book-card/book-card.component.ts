import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/book', workId]" class="card">
      <div class="cover">
        @if (coverUrl && !imageError) {
          <img [src]="coverUrl" [alt]="title" loading="lazy" (error)="onImageError()" />
        } @else {
          <div class="placeholder">📚</div>
        }
      </div>
      <div class="info">
        <h3 class="title">{{ title }}</h3>
        <p class="author">{{ authors }}</p>
        <div class="meta">
          @if (year) {
            <span>{{ year }}</span>
          }
          @if (pages) {
            <span>{{ pages }} pages</span>
          }
        </div>
      </div>
    </a>
  `,
  styles: [`
    .card {
      display: flex;
      flex-direction: column;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
      text-decoration: none;
      color: var(--text);
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        text-decoration: none;
      }
    }

    .cover {
      aspect-ratio: 2 / 3;
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
      font-size: 2.5rem;
      background: var(--primary-light);
    }

    .info {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .title {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      font-weight: 700;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .author {
      font-size: 0.85rem;
      color: var(--text-muted);
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .meta {
      display: flex;
      gap: 8px;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
    }
  `],
})
export class BookCardComponent implements OnInit, OnChanges {
  @Input({ required: true }) title = '';
  @Input() authorList: string[] = [];
  @Input() coverId?: number;
  @Input() year?: number;
  @Input() pages?: number;
  @Input({ required: true }) workId = '';

  coverUrl = '';
  imageError = false;

  get authors(): string {
    return this.authorList.join(', ');
  }

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.updateCover();
  }

  ngOnChanges(): void {
    this.updateCover();
  }

  onImageError(): void {
    this.imageError = true;
  }

  private updateCover(): void {
    this.imageError = false;
    this.coverUrl = this.bookService.getCoverUrl(this.coverId);
  }
}
