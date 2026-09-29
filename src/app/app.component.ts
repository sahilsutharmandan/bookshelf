import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header />
    <main class="container">
      <router-outlet />
    </main>
  `,
  styles: [`
    main {
      padding-top: 24px;
      padding-bottom: 48px;
      min-height: calc(100vh - 64px);
    }
  `],
})
export class AppComponent {}
