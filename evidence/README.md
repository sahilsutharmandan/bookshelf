# Visual Evidence: Before vs After

This directory contains the visual evidence captured before and after the fixes.

## Screenshots

- `1-reading-list.png`: Initial reading list on desktop.
- `2-dragged-to-reading.png`: After dragging Harry Potter from "Want to Read" into "Reading".
- `3-after-refresh.png`: After refreshing the page. In the `before` version, Harry Potter reverted to "Want to Read"; in the `after` version, the book persists in "Reading".
- `4-reading-list-mobile.png`: Mobile view on phone (390x844 viewport). In the `before` version, columns overflowed horizontally; in the `after` version, columns stack vertically.
- `5-stats-goal.png`: Reading stats page. In the `before` version, reading 4 out of 3 books showed an incomplete (~33%) progress circle due to negative SVG offset; in the `after` version, it correctly renders 100% full.
