import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notes-editor',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="notes">
      <label class="label" for="notes-textarea">Personal Notes</label>
      <textarea
        id="notes-textarea"
        class="textarea"
        [(ngModel)]="notes"
        (ngModelChange)="notesChange.emit($event)"
        placeholder="Write your thoughts about this book..."
        rows="4"
      ></textarea>
    </div>
  `,
  styles: [`
    .notes {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .label {
      font-weight: 600;
      font-size: 0.95rem;
    }

    .textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: #fff;
      color: #333;
      resize: vertical;
      line-height: 1.6;
      transition: border-color 0.2s;

      &:focus {
        outline: none;
        border-color: var(--primary);
      }

      &::placeholder {
        color: var(--text-muted);
      }
    }
  `],
})
export class NotesEditorComponent {
  @Input() notes = '';
  @Output() notesChange = new EventEmitter<string>();
}
