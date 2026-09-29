# BookShelf

A book discovery and personal reading list app built with Angular 18. Browse the Open Library catalog, track your reading, and set yearly goals.

## Features

- **Search** - Find books via the Open Library API with debounced search and subject browse chips (fiction, science, history, biography, fantasy, mystery). Results show cover art, title, author, year, and page count with pagination.
- **Book Detail** - View full book information including description, subjects, and cover art. Add books to your reading list with status tracking (Want to Read / Reading / Finished), star ratings (1-5), and personal notes.
- **Reading List** - Kanban board with drag-and-drop between three columns (Want to Read, Reading, Finished) powered by Angular CDK. Inline star ratings and quick removal.
- **Stats** - Yearly reading goal with an SVG progress ring, books finished count, total books across lists, and average rating for finished books.

## Tech Stack

- Angular 18 (standalone components, lazy-loaded routes)
- RxJS (debounced search with switchMap)
- Angular CDK (drag-and-drop)
- Hand-written SCSS with CSS custom properties
- Open Library API (no key required)
- localStorage for all persisted state
- Dark/light theme toggle

## Getting Started

```bash
npm install
npx ng serve
```

Open `http://localhost:4200` in your browser.

## Build

```bash
npx ng build
```

Output goes to `dist/bookshelf/`.

## API

All data comes from the [Open Library API](https://openlibrary.org/developers/api):

| Endpoint | Purpose |
|---|---|
| `/search.json?q={query}` | Search books |
| `/works/{id}.json` | Book details |
| `/subjects/{subject}.json` | Subject browsing |
| `covers.openlibrary.org/b/id/{id}-{S,M,L}.jpg` | Cover images |

## Project Structure

```
src/app/
  models/          Book, reading list, and API response types
  services/        BookService (API), ReadingListService (localStorage)
  components/      Reusable UI: header, book-card, star-rating, kanban, etc.
  pages/           Route pages: search, book-detail, reading-list, stats
```
