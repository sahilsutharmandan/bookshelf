import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ReadingListEntry, ReadingGoal, ReadingStatus } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class ReadingListService {
  private storageKey = 'bookshelf_reading_list';
  private goalKey = 'bookshelf_reading_goal';
  private entriesSubject = new BehaviorSubject<ReadingListEntry[]>(this.loadEntries());

  entries$ = this.entriesSubject.asObservable();

  private loadEntries(): ReadingListEntry[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveEntries(entries: ReadingListEntry[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
    this.entriesSubject.next(entries);
  }

  saveAll(entries: ReadingListEntry[]): void {
    this.saveEntries(entries);
  }

  getEntry(workId: string): ReadingListEntry | undefined {
    return this.entriesSubject.value.find(e => e.workId === workId);
  }

  addOrUpdate(entry: Partial<ReadingListEntry> & { workId: string }): void {
    const entries = [...this.entriesSubject.value];
    const idx = entries.findIndex(e => e.workId === entry.workId);
    if (idx >= 0) {
      entries[idx] = { ...entries[idx], ...entry };
    } else {
      entries.push({
        title: '',
        authors: [],
        status: 'want',
        rating: 0,
        notes: '',
        dateAdded: new Date().toISOString(),
        ...entry,
      } as ReadingListEntry);
    }
    this.saveEntries(entries);
  }

  updateStatus(workId: string, status: ReadingStatus): void {
    const entries = [...this.entriesSubject.value];
    const idx = entries.findIndex(e => e.workId === workId);
    if (idx >= 0) {
      entries[idx] = { ...entries[idx], status };
      this.saveEntries(entries);
    }
  }

  updateRating(workId: string, rating: number): void {
    const entries = [...this.entriesSubject.value];
    const idx = entries.findIndex(e => e.workId === workId);
    if (idx >= 0) {
      entries[idx] = { ...entries[idx], rating };
      this.saveEntries(entries);
    }
  }

  updateNotes(workId: string, notes: string): void {
    const entries = [...this.entriesSubject.value];
    const idx = entries.findIndex(e => e.workId === workId);
    if (idx >= 0) {
      entries[idx] = { ...entries[idx], notes };
      this.saveEntries(entries);
    }
  }

  remove(workId: string): void {
    const entries = this.entriesSubject.value.filter(e => e.workId !== workId);
    this.saveEntries(entries);
  }

  getByStatus(status: ReadingStatus): ReadingListEntry[] {
    return this.entriesSubject.value.filter(e => e.status === status);
  }

  getGoal(): ReadingGoal {
    const data = localStorage.getItem(this.goalKey);
    if (data) {
      return JSON.parse(data);
    }
    return { year: new Date().getFullYear(), target: 12 };
  }

  setGoal(target: number): void {
    const goal: ReadingGoal = { year: new Date().getFullYear(), target };
    localStorage.setItem(this.goalKey, JSON.stringify(goal));
  }

  getFinishedThisYear(): number {
    const year = new Date().getFullYear();
    return this.entriesSubject.value.filter(
      e => e.status === 'finished' && (!e.dateAdded || new Date(e.dateAdded).getFullYear() === year)
    ).length;
  }

  getAverageRating(): number {
    const finished = this.entriesSubject.value.filter(
      e => e.status === 'finished' && e.rating > 0
    );
    if (finished.length === 0) return 0;
    const sum = finished.reduce((acc, e) => acc + e.rating, 0);
    return Math.round((sum / finished.length) * 10) / 10;
  }
}
