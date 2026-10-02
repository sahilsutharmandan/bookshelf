import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-reading-goal',
  standalone: true,
  template: `
    <div class="goal-ring">
      <svg viewBox="0 0 120 120" class="ring-svg">
        <circle
          cx="60" cy="60" r="52"
          fill="none"
          stroke="var(--border)"
          stroke-width="8"
        />
        <circle
          cx="60" cy="60" r="52"
          fill="none"
          stroke="var(--primary)"
          stroke-width="8"
          stroke-linecap="round"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset"
          [style.opacity]="current > 0 ? 1 : 0"
          class="progress-ring"
        />
      </svg>
      <div class="ring-label">
        <span class="count">{{ current }}</span>
        <span class="divider">/</span>
        <span class="target-num">{{ target }}</span>
      </div>
    </div>
  `,
  styles: [`
    .goal-ring {
      position: relative;
      width: 160px;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ring-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .progress-ring {
      transition: stroke-dashoffset 0.6s ease;
    }

    .ring-label {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.2;
    }

    .count {
      font-size: 2rem;
      font-weight: 700;
      font-family: var(--font-heading);
      color: var(--primary);
    }

    .divider {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .target-num {
      font-size: 1rem;
      color: var(--text-muted);
    }
  `],
})
export class ReadingGoalComponent {
  @Input() current = 0;
  @Input() target = 12;

  readonly circumference = 2 * Math.PI * 52;

  get dashOffset(): number {
    if (!this.target || this.target <= 0) return this.circumference;
    const progress = Math.min(1, Math.max(0, this.current / this.target));
    return this.circumference * (1 - progress);
  }
}
