# Hand-off: backend for the Community tab

**For:** the agent working on the backend repo `ttym-sturdy-engine` (Django, Docker container `django_api`).
**From:** the mobile app. The app's Community tab is built and shipped against the contract below. Fields it doesn't receive yet are hidden, so you can ship this in any order.

## Context

The Community tab is a content hub for women and girls. It has four sections, all served by our backend, which already mirrors Contentful into one shared snapshot (`content/services/snapshot.py`, `content/registry.py`, `content/services/mapper.py`). The app never calls Contentful.

1. **Edu Content.** Short videos from our midwives, shown as portrait cards with a thumbnail, the author's avatar and name, and a caption.
2. **Insights.** Everyday sexual and reproductive health questions ("How can I reduce my cramps?"). Each card shows a topic label and icon ("CRAMPING"), the question, and how many people read the answer. Tapping opens the article that answers it.
3. **Join Community.** A link out. Not your concern.
4. **Articles.** The existing feed, now with a read count.

A chip row of tags (Pregnancy, Menopause, Period, Wellness, …) filters all three content sections.

## What exists today (checked 2026-10-19)

- The `video` content type has one field, `reel`. The one published video links an asset missing from `includes`, so `/content/videos/` returns `reel: null`.
- `popularQuestion` maps to `{id, questions, article}`, but no entries are published. It has no topic, icon or tags.
- `blogTag` has no published entries, so `/content/tags/` is empty.
- Nothing records article reads.
- `/article/comments/{id}/` is public and returns each commenter's `email` and `phone_number` through `SharedProfileSerialiser`. This is a privacy leak.

## Tasks

Do them in this order. Each one ends in passing tests. Follow the existing patterns: `ContentType` entries in `REGISTRY`, mappers in `mapper.py`, `annotate_engagement` for per-user and count data, and the `contentful` fixture in `content/tests/fakes.py`. Update `content/tests/fixtures/space.json` when you add fields so the tests exercise them.

### 1. Close the comment privacy leak

Return comment authors as `{"user": {"username", "display_name", "profile_pic"}}` and nothing else. Keep the `user` wrapper, because the app reads `author.user.display_name`. Add a test asserting that `email` and `phone_number` are absent from both GET and POST responses.

### 2. Article read tracking

- **Model.** `ArticleRead(article_id: str, user: FK, created_at)` with a unique constraint on `(user, article_id)`.
- **Endpoint.** `POST /api/v1/article/read/{article_id}/`.
  - Signed-in user: `get_or_create` the row, then return 204. Repeat calls are no-ops.
  - Anonymous caller: return 204 and record nothing.
  - Unknown article: 404 `content/not-found`. Use `get_content(REGISTRY["articles"], id=...)`, as `bookmark_article` does.
  - Don't require `IsVerified`. Reading isn't gated.
- **`read_count`.** The number of `ArticleRead` rows for an article. Add it to every article summary the app sees:
  - `/content/articles/` list and detail, both already via `annotate_engagement`;
  - `/article/bookmarks/` items' `article`. `bookmarks_with_articles` doesn't run `annotate_engagement` today, so `comment_count` is missing there too. Fix both.
  - the `article` object inside each question (task 4).

  Do it with one aggregate query per response, not one per article.

### 3. Videos

- **Contentful model (`video`).** Add `title` (short text), `caption` (short text), `thumbnail` (image asset), `author` (link to `author`) and `tags` (links to `blogTag`). Fix or republish the reel asset so it resolves.
- **API shape** for `/content/videos/` and `/content/videos/{id}/`:
  ```json
  {"id": "…", "title": "Easing period pain", "caption": "Three stretches that help…",
   "reel": {"url": "https://videos.ctfassets.net/…", "content_type": "video/mp4", "width": null, "height": null, "title": "…", "description": "…"},
   "thumbnail": {"url": "https://images.ctfassets.net/…", "content_type": "image/jpeg", "width": 720, "height": 1280, "title": "…", "description": "…"},
   "author": {"id": "…", "name": "Sarah Nkansah Boateng", "profile_image": { …asset… }},
   "tags": [{"id": "…", "name": "Period"}],
   "published_at": "2026-10-19T10:00:00Z"}
  ```
  `reel`, `thumbnail` and `author` may each be `null`. Use the existing `asset()` and `author()` mappers.
- **Behaviour.** Newest first. Add a `tag` filter (tag id), the same as articles. The app hides videos whose `reel` is null, but returning them is fine.

### 4. Insights (popular questions)

- **Contentful model.** Give `popularQuestion` a `topic` and `tags`.
  - `topic` links to a new `insightTopic` type with `name` (short text, e.g. "Cramping") and `icon` (image asset, a square illustration on a transparent background).
  - `tags` links to `blogTag`, for the chip filter.
- **API shape** for `/content/questions/`:
  ```json
  {"id": "…", "questions": ["How can I reduce my cramps?", "Is it normal for cramps to make me vomit?"],
   "topic": {"id": "…", "name": "Cramping", "icon": { …asset… or null }},
   "tags": [{"id": "…", "name": "Period"}],
   "article": {"id": "…", "slug": "…", "title": "…", "read_count": 1520}}
  ```
  `topic` and `article` may be `null`. The app shows one card per string in `questions`, all linking to the same article, and drops entries whose `article` is null.
- **Behaviour.** Newest first, with a `tag` filter. Register `insightTopic` in `REGISTRY` only if something lists topics on its own. The app doesn't, so it can stay embedded.

### 5. Content to publish

This is for whoever edits Contentful. You can create a few entries to test locally.
- Tags: Pregnancy, Menopause, Period, Wellness, and the rest of the product list.
- Topics with icons: Bloating, Cramping, and so on.
- Popular questions, each linking a topic, tags and the answering article.
- Videos with every new field filled in.

## Contract rules the app relies on

- Pagination stays `{count, next, previous, results}`, with `page` and `page_size` (max 50).
- Errors stay `{code, message, details?}`. A removed article returns 404 `content/not-found`, including on `POST /article/read/`.
- IDs are Contentful string ids. Never numbers.
- New fields may be `null`, but they must always be present once you ship them. The app treats a missing field as "backend not updated yet".

## Done means

- `docker compose exec django_api pytest` passes with new tests for each task.
- `curl` output for each changed endpoint matches the shapes above. Paste one real response per endpoint in your final report.
- `POST /article/read/<id>/` twice as the same user raises that article's `read_count` by exactly 1. The same call while anonymous leaves it unchanged.
- `/article/comments/<id>/` contains no `email` or `phone_number` anywhere.
- Report the Contentful model changes you made, or the ones still needed from the content editor, as a list.
