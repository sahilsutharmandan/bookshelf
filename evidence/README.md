# Reading list and stats evidence

The before images are the five supplied screenshots, copied unchanged. After images use a reconstructed eight-book sample matching the titles, authors, statuses and ratings shown; cover editions differ. Desktop captures are 1280 × 901. The mobile capture uses a 390 × 844 viewport and shows the full vertically scrolling page.

| Check | Before | After |
| --- | --- | --- |
| Equal, stable desktop columns | [Before](before/1-reading-list.png) | [After](after/1-reading-list.png) |
| Harry Potter dragged into Reading | [Before](before/2-dragged-to-reading.png) | [After](after/2-dragged-to-reading.png) |
| Harry Potter remains in Reading after refresh | [Before](before/3-after-refresh.png) | [After](after/3-after-refresh.png) |
| All three lists accessible vertically on mobile | [Before](before/4-reading-list-mobile.png) | [After](after/4-reading-list-mobile.png) |
| Full goal ring when four books exceed a goal of three | [Before](before/5-stats-goal.png) | [After](after/5-stats-goal.png) |

## Verification

- Real browser mouse drags into populated and empty columns; saved status checked and page reloaded.
- Same-column reordering checked after reload.
- Desktop columns have equal widths.
- No reading-list horizontal page overflow at viewport widths 375, 390, 768 and 1024 pixels.
- Goal ring checked below, at and above target; changed goal survives refresh.
- No browser runtime errors during these checks.
- Production build and `git diff --check` pass.

Responsive checks use desktop Chrome viewport emulation, not a physical phone.
