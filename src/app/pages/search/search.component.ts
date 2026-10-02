import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
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

      @if (results.length > 0) {
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

      @if (!loading && searched && results.length === 0) {
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

  subjects = ['fiction', 'science', 'history', 'biography', 'fantasy', 'mystery'];

  private searchSubject = new Subject<string>();
  private sub?: Subscription;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.sub = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q.trim()) {
          this.searched = false;
          return of(null);
        }
        this.loading = true;
        this.searched = true;
        return this.bookService.search(q, this.pageSize, this.offset);
      })
    ).subscribe({
      next: (res) => {
        this.loading = false;
        if (res) {
          this.results = res.docs;
          this.totalResults = res.numFound;
        } else {
          this.results = [];
          this.totalResults = 0;
        }
      },
      error: () => {
        this.loading = false;
        this.results = [];
        this.totalResults = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onQueryChange(value: string): void {
    this.offset = 0;
    this.activeSubject = '';
    this.searchSubject.next(value);
  }

  browseSubject(subject: string): void {
    const isSameSubject = this.activeSubject === subject && this.query === subject;
    this.activeSubject = subject;
    this.query = subject;
    this.offset = 0;
    if (isSameSubject) {
      this.doSearch();
    } else {
      this.searchSubject.next(subject);
    }
  }

  prevPage(): void {
    this.offset = Math.max(0, this.offset - this.pageSize);
    this.doSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextPage(): void {
    this.offset += this.pageSize;
    this.doSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private doSearch(): void {
    this.loading = true;
    this.bookService.search(this.query, this.pageSize, this.offset).subscribe({
      next: (res) => {
        this.loading = false;
        this.results = res.docs;
        this.totalResults = res.numFound;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  extractWorkId(key: string): string {
    return this.bookService.extractWorkId(key);
  }
}
