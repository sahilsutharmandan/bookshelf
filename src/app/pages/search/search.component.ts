import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, catchError, switchMap, of, timer, map } from 'rxjs';
import { BookService } from '../../services/book.service';
import { BookCardComponent } from '../../components/book-card/book-card.component';
import { BookSearchResult } from '../../models/book.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, BookCardComponent],
  template: `
    <section class="search-page">
      <div class="search-header">
        <h1>Discover Books</h1>
        <div class="search-box">
          <input
            type="text"
            [(ngModel)]="query"
            (ngModelChange)="onQueryChange($event)"
            placeholder="Search for books..."
            class="search-input"
          />
        </div>
      </div>

      <div class="subject-chips">
        @for (subject of subjects; track subject) {
          <button
            class="chip"
            [class.active]="activeSubject === subject"
            (click)="browseSubject(subject)"
          >{{ subject }}</button>
        }
      </div>

      @if (loading) {
        <div class="loading">Searching...</div>
      }

      @if (!loading && results.length > 0) {
        <div class="results-grid">
          @for (book of results; track book.key) {
            <app-book-card
              [title]="book.title"
              [authorList]="book.author_name || []"
              [coverId]="book.cover_i"
              [year]="book.first_publish_year"
              [pages]="book.number_of_pages_median"
              [workId]="extractWorkId(book.key)"
            />
          }
        </div>

        <div class="pagination">
          <span class="pagination-info">
            Showing {{ offset + 1 }}&ndash;{{ offset + results.length }} of {{ totalResults }}
          </span>
          <div class="pagination-buttons">
            <button (click)="prevPage()" [disabled]="offset === 0" class="page-btn">Previous</button>
            <button (click)="nextPage()" [disabled]="offset + pageSize >= totalResults" class="page-btn">Next</button>
          </div>
        </div>
      }

      @if (error) {
        <div class="empty" role="alert">{{ error }} <button class="page-btn" (click)="doSearch()">Retry</button></div>
      }

      @if (!loading && !error && searched && results.length === 0) {
        <div class="empty">No books found. Try a different search term.</div>
      }
    </section>
  `,
  styles: [`
    .search-page {
      padding-top: 16px;
    }

    .search-header {
      text-align: center;
      margin-bottom: 24px;

      h1 {
        font-size: 2rem;
        margin-bottom: 16px;
        color: var(--text);
      }
    }

    .search-box {
      max-width: 560px;
      margin: 0 auto;
    }

    .search-input {
      width: 100%;
      padding: 14px 20px;
      border: 2px solid var(--border);
      border-radius: 32px;
      background: var(--bg-card);
      color: var(--text);
      font-size: 1rem;
      transition: border-color 0.2s;

      &:focus {
        outline: none;
        border-color: var(--primary);
      }

      &::placeholder {
        color: var(--text-muted);
      }
    }

    .subject-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-bottom: 32px;
    }

    .chip {
      padding: 8px 16px;
      border: 1px solid var(--border);
      border-radius: 20px;
      background: var(--bg-card);
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;

      &:hover {
        border-color: var(--primary);
        color: var(--primary);
      }

      &.active {
        background: var(--primary);
        color: #fff;
        border-color: var(--primary);
      }
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 20px;
    }

    .pagination {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      margin-top: 32px;
      gap: 12px;
    }

    .pagination-info {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .pagination-buttons {
      display: flex;
      gap: 8px;
    }

    .page-btn {
      padding: 8px 20px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg-card);
      color: var(--text);
      font-weight: 500;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        border-color: var(--primary);
        color: var(--primary);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .loading,
    .empty {
      text-align: center;
      padding: 48px 16px;
      color: var(--text-muted);
      font-size: 1.1rem;
    }

    @media (max-width: 480px) {
      .search-header h1 {
        font-size: 1.5rem;
      }
      .results-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
      }
    }
  `],
})
export class SearchComponent implements OnInit, OnDestroy {
  query = '';
  results: BookSearchResult[] = [];
  totalResults = 0;
  offset = 0;
  pageSize = 20;
  loading = false;
  searched = false;
  activeSubject = '';
  error = '';

  subjects = ['fiction', 'science', 'history', 'biography', 'fantasy', 'mystery'];

  private searchSubject = new Subject<{ query: string; offset: number; delay: number }>();
  private sub?: Subscription;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.sub = this.searchSubject.pipe(
      switchMap(({ query, offset, delay }) => {
        this.error = '';
        this.searched = !!query.trim();
        this.loading = this.searched;
        if (!this.searched) return of({ response: null, offset, error: '' });
        return timer(delay).pipe(
          switchMap(() => this.bookService.search(query.trim(), this.pageSize, offset)),
          map(response => ({ response, offset, error: '' })),
          catchError(() => of({ response: null, offset, error: 'Unable to load books. Please try again.' }))
        );
      })
    ).subscribe(({ response, offset, error }) => {
      this.loading = false;
      this.error = error;
      this.offset = offset;
      this.results = response?.docs || [];
      this.totalResults = response?.numFound || 0;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onQueryChange(value: string): void {
    this.offset = 0;
    this.activeSubject = '';
    this.searchSubject.next({ query: value, offset: 0, delay: 350 });
  }

  browseSubject(subject: string): void {
    this.activeSubject = subject;
    this.query = subject;
    this.offset = 0;
    this.doSearch();
  }

  prevPage(): void {
    if (this.loading || this.offset === 0) return;
    this.offset = Math.max(0, this.offset - this.pageSize);
    this.doSearch();
  }

  nextPage(): void {
    if (this.loading || this.offset + this.pageSize >= this.totalResults) return;
    this.offset += this.pageSize;
    this.doSearch();
  }

  doSearch(): void {
    this.searchSubject.next({ query: this.query, offset: this.offset, delay: 0 });
  }

  extractWorkId(key: string): string {
    return this.bookService.extractWorkId(key);
  }
}
