import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  SearchResponse,
  BookDetail,
  SubjectResponse,
} from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class BookService {
  private baseUrl = 'https://openlibrary.org';
  private coversUrl = 'https://covers.openlibrary.org/b/id';

  constructor(private http: HttpClient) {}

  search(query: string, limit = 20, offset = 0): Observable<SearchResponse> {
    const page = Math.ceil(offset / limit) || 1;
    return this.http.get<SearchResponse>(
      `${this.baseUrl}/search.json`,
      { params: { q: query, limit: limit.toString(), page: page.toString() } }
    );
  }

  getBookDetail(workId: string): Observable<BookDetail> {
    return this.http.get<BookDetail>(
      `${this.baseUrl}/works/${workId}.json`
    );
  }

  getSubjectBooks(subject: string, limit = 12): Observable<SubjectResponse> {
    return this.http.get<SubjectResponse>(
      `${this.baseUrl}/subjects/${subject}.json`,
      { params: { limit: limit.toString() } }
    );
  }

  getCoverUrl(coverId: number | undefined, size: 'S' | 'M' | 'L' = 'M'): string {
    if (!coverId) {
      return '';
    }
    return `${this.coversUrl}/${coverId}-${size}.jpg`;
  }

  getAuthor(authorKey: string): Observable<{ name: string }> {
    const cleanKey = authorKey.startsWith('/') ? authorKey : `/authors/${authorKey}`;
    return this.http.get<{ name: string }>(`${this.baseUrl}${cleanKey}.json`);
  }

  extractDescription(desc: string | { type?: string; value?: string } | undefined): string {
    if (!desc) {
      return '';
    }
    if (typeof desc === 'object' && desc !== null && 'value' in desc) {
      return desc.value || '';
    }
    return typeof desc === 'string' ? desc : '';
  }

  extractWorkId(key: string): string {
    return key.replace('/works/', '');
  }
}
