import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, AfterViewChecked, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { BookService } from '../../services/book.service';
import { ReadingListService } from '../../services/reading-list.service';
import { BookDetail, ReadingStatus, SubjectWork } from '../../models/book.model';
import { BookDetailHeroComponent } from '../../components/book-detail-hero/book-detail-hero.component';
import { StarRatingComponent } from '../../components/star-rating/star-rating.component';
import { NotesEditorComponent } from '../../components/notes-editor/notes-editor.component';
import { BookCardComponent } from '../../components/book-card/book-card.component';
import { FormsModule } from '@angular/forms';
import { formatDate } from '../../utils/format';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    BookDetailHeroComponent,
    StarRatingComponent,
    NotesEditorComponent,
    BookCardComponent,
    FormsModule,
    RouterLink,
  ],
  template: `
    @if (book) {
      <div class="detail-page">
        <app-book-detail-hero
          [title]="book.title"
          [authors]="authors"
          [coverId]="coverId"
          [year]="year"
          [subjects]="book.subjects || []"
        />

        <div class="content-grid">
          <div class="main-content">
            @if (description) {
              <div class="description">
                <h2>About this book</h2>
                <p #descText [class.clamped]="!expanded">{{ description }}</p>
                @if (canExpand) {
                  <button class="more-btn" (click)="expanded = !expanded" [attr.aria-expanded]="expanded">
                    {{ expanded ? 'Show less' : 'Show more' }}
                  </button>
                }
              </div>
            }
          </div>

          <aside class="sidebar">
            <div class="action-card">
              <label class="label" for="status-select">Reading status</label>
              <select
                id="status-select"
                class="status-select"
                [ngModel]="currentStatus"
                (ngModelChange)="onStatusChange($event)"
              >
                <option value="">Not in list</option>
                <option value="want">Want to Read</option>
                <option value="reading">Reading</option>
                <option value="finished">Finished</option>
              </select>

              @if (currentStatus) {
                @if (addedOn) {
                  <p class="added-on">On your list since {{ addedOn }}</p>
                }

                <div class="rating-section">
                  <label class="label">Your rating</label>
                  <app-star-rating [rating]="currentRating" (ratingChange)="onRatingChange($event)" />
                </div>

                <app-notes-editor
                  [notes]="currentNotes"
                  (notesChange)="onNotesChange($event)"
                />
              }
            </div>
          </aside>
        </div>

        @if (relatedBooks.length > 0) {
          <section class="related">
            <h2>Related Books</h2>
            <div class="related-grid">
              @for (related of relatedBooks; track related.key) {
                <app-book-card
                  [title]="related.title"
                  [authorList]="getRelatedAuthors(related)"
                  [coverId]="related.cover_id"
                  [workId]="extractWorkId(related.key)"
                />
              }
            </div>
          </section>
        }
      </div>
    } @else if (loading) {
      <div class="loading">Loading book details...</div>
    }
  `,
  styles: [`
    .detail-page {
      padding-top: 16px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 32px;
      margin-bottom: 48px;
    }

    .description {
      h2 {
        font-size: 1.2rem;
        margin-bottom: 12px;
      }

      p {
        color: var(--text);
        line-height: 1.8;
        white-space: pre-line;

        &.clamped {
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }

    .more-btn {
      margin-top: 8px;
      padding: 0;
      background: none;
      border: none;
      color: var(--primary);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .added-on {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: -6px;
    }

    .action-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .label {
      font-weight: 600;
      font-size: 0.95rem;
      display: block;
    }

    .status-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg);
      color: var(--text);
      font-size: 0.95rem;
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: var(--primary);
      }
    }

    .rating-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .related {
      h2 {
        font-size: 1.3rem;
        margin-bottom: 20px;
      }
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
    }

    .loading {
      text-align: center;
      padding: 48px 16px;
      color: var(--text-muted);
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
    }
  `],
})
export class BookDetailComponent implements OnInit, AfterViewChecked {
  book?: BookDetail;
  loading = true;
  description = '';
  authors: string[] = [];
  coverId?: number;
  year?: number;
  currentStatus: ReadingStatus | '' = '';
  currentRating = 0;
  currentNotes = '';
  relatedBooks: SubjectWork[] = [];
  expanded = false;
  canExpand = false;
  addedOn = '';
  private workId = '';

  private _descText?: ElementRef<HTMLElement>;

  @ViewChild('descText')
  set descText(el: ElementRef<HTMLElement> | undefined) {
    this._descText = el;
    this.checkCanExpand();
  }
  get descText(): ElementRef<HTMLElement> | undefined {
    return this._descText;
  }

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private readingListService: ReadingListService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.workId = params.get('workId') || '';
        this.loading = true;
        return this.bookService.getBookDetail(this.workId);
      })
    ).subscribe(book => {
      this.book = book;
      this.loading = false;
      this.description = this.bookService.extractDescription(book.description);
      this.expanded = false;
      this.canExpand = false;
      this.checkCanExpand();
      this.coverId = book.covers?.[0];
      this.authors = [];
      this.year = undefined;
      this.addedOn = '';

      const entry = this.readingListService.getEntry(this.workId);
      if (entry) {
        this.currentStatus = entry.status;
        this.currentRating = entry.rating;
        this.currentNotes = entry.notes;
        this.authors = entry.authors;
        this.year = entry.year;
        this.addedOn = formatDate(entry.dateAdded);
      }

      if (book.subjects?.length) {
        const subject = book.subjects[0].toLowerCase().replace(/\s+/g, '_');
        this.bookService.getSubjectBooks(subject).subscribe(res => {
          this.relatedBooks = (res.works || [])
            .filter(w => this.bookService.extractWorkId(w.key) !== this.workId)
            .slice(0, 6);
        });
      }
    });
  }

  onStatusChange(status: ReadingStatus | ''): void {
    this.currentStatus = status;
    if (status) {
      this.readingListService.addOrUpdate({
        workId: this.workId,
        title: this.book?.title || '',
        authors: this.authors,
        coverId: this.coverId,
        status,
        rating: this.currentRating,
        notes: this.currentNotes,
        year: this.year,
      });
      const entry = this.readingListService.getEntry(this.workId);
      this.addedOn = entry ? formatDate(entry.dateAdded) : '';
    } else {
      this.readingListService.remove(this.workId);
      this.currentRating = 0;
      this.currentNotes = '';
    }
  }

  onRatingChange(rating: number): void {
    this.currentRating = rating;
    this.readingListService.updateRating(this.workId, rating);
  }

  onNotesChange(notes: string): void {
    this.currentNotes = notes;
    this.readingListService.updateNotes(this.workId, notes);
  }

  ngAfterViewChecked(): void {
    if (!this.expanded && !this.canExpand && this._descText?.nativeElement) {
      const el = this._descText.nativeElement;
      if (el.scrollHeight > el.clientHeight + 1) {
        this.canExpand = true;
        this.cdr.detectChanges();
      }
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.expanded && this._descText?.nativeElement) {
      const el = this._descText.nativeElement;
      const clipped = el.scrollHeight > el.clientHeight + 1;
      if (this.canExpand !== clipped) {
        this.canExpand = clipped;
        this.cdr.markForCheck();
      }
    }
  }

  private checkCanExpand(): void {
    if (this.expanded) return;
    setTimeout(() => {
      if (!this.expanded && this._descText?.nativeElement) {
        const el = this._descText.nativeElement;
        const clipped = el.scrollHeight > el.clientHeight + 1;
        if (this.canExpand !== clipped) {
          this.canExpand = clipped;
          this.cdr.markForCheck();
        }
      }
    }, 0);
  }

  private isDescriptionClipped(): boolean {
    const el = this._descText?.nativeElement;
    return !!el && el.scrollHeight > el.clientHeight + 1;
  }

  getRelatedAuthors(work: SubjectWork): string[] {
    return work.authors?.map(a => a.name) || [];
  }

  extractWorkId(key: string): string {
    return this.bookService.extractWorkId(key);
  }
}
