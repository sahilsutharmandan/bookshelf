import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ReadingListService } from '../../services/reading-list.service';
import { ReadingGoalComponent } from '../../components/reading-goal/reading-goal.component';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [FormsModule, ReadingGoalComponent],
  template: `
    <section class="stats-page">
      <h1>Reading Stats</h1>

      <div class="stats-grid">
        <div class="stat-card goal-card">
          <h2>{{ currentYear }} Reading Goal</h2>
          <app-reading-goal [current]="finishedThisYear" [target]="goalTarget" />
          <div class="goal-input">
            <label for="goal-input">Set goal</label>
            <input
              id="goal-input"
              type="number"
              min="1"
              max="365"
              [(ngModel)]="goalTarget"
              (ngModelChange)="onGoalChange($event)"
              class="input"
            />
            <span class="input-label">books</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-number">{{ finishedThisYear }}</div>
          <div class="stat-label">Books finished in {{ currentYear }}</div>
        </div>

        <div class="stat-card">
          <div class="stat-number">{{ totalBooks }}</div>
          <div class="stat-label">Total books across all lists</div>
        </div>

        <div class="stat-card">
          <div class="stat-number">{{ averageRating > 0 ? averageRating : '—' }}</div>
          <div class="stat-label">Average rating of finished books</div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .stats-page {
      padding-top: 16px;
    }

    h1 {
      font-size: 1.8rem;
      margin-bottom: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
    }

    .goal-card {
      grid-column: 1 / -1;

      h2 {
        font-size: 1.2rem;
        margin-bottom: 8px;
      }
    }

    .goal-input {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;

      label {
        font-weight: 500;
        font-size: 0.9rem;
        color: var(--text-muted);
      }
    }

    .input {
      width: 80px;
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg);
      color: var(--text);
      font-size: 1rem;
      text-align: center;

      &:focus {
        outline: none;
        border-color: var(--primary);
      }
    }

    .input-label {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      font-family: var(--font-heading);
      color: var(--primary);
      line-height: 1;
    }

    .stat-label {
      font-size: 0.95rem;
      color: var(--text-muted);
    }

    @media (max-width: 600px) {
      .goal-card {
        grid-column: auto;
      }
    }
  `],
})
export class StatsComponent implements OnInit, OnDestroy {
  goalTarget = 12;
  finishedThisYear = 0;
  totalBooks = 0;
  averageRating = 0;
  currentYear = new Date().getFullYear();
  private sub?: Subscription;

  constructor(private readingListService: ReadingListService) {}

  ngOnInit(): void {
    const goal = this.readingListService.getGoal();
    this.goalTarget = goal.target;
    this.sub = this.readingListService.entries$.subscribe(entries => {
      this.totalBooks = entries.length;
      this.finishedThisYear = this.readingListService.getFinishedThisYear();
      this.averageRating = this.readingListService.getAverageRating();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onGoalChange(value: number): void {
    if (value > 0) {
      this.readingListService.setGoal(value);
    }
  }
}
