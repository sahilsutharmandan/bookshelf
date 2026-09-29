import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="header-inner container">
        <a routerLink="/" class="logo">BookShelf</a>
        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Search</a>
          <a routerLink="/reading-list" routerLinkActive="active">My List</a>
          <a routerLink="/stats" routerLinkActive="active">Stats</a>
        </nav>
        <button class="theme-toggle" (click)="toggleTheme()" [attr.aria-label]="'Toggle theme'">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-inner {
      display: flex;
      align-items: center;
      height: 64px;
      gap: 24px;
    }

    .logo {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
      white-space: nowrap;
    }

    .nav {
      display: flex;
      gap: 16px;
      margin-left: auto;

      a {
        color: var(--text-muted);
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 4px;
        text-decoration: none;
        transition: color 0.2s;

        &:hover {
          color: var(--text);
        }

        &.active {
          color: var(--primary);
        }
      }
    }

    .theme-toggle {
      background: none;
      border: 1px solid var(--border);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: border-color 0.2s;
      flex-shrink: 0;

      &:hover {
        border-color: var(--primary);
      }
    }

    @media (max-width: 480px) {
      .nav a {
        font-size: 0.9rem;
        padding: 4px;
      }
      .header-inner {
        gap: 12px;
      }
    }
  `],
})
export class HeaderComponent {
  isDark = false;

  constructor() {
    const saved = localStorage.getItem('bookshelf_theme');
    if (saved === 'dark') {
      this.isDark = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('bookshelf_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('bookshelf_theme', 'light');
    }
  }
}
