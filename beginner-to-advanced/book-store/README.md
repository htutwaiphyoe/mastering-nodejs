# Book Store — Learning Notes

These are the notes I took while building a small chess-bookstore API with **Bun, Express 5, Drizzle ORM, PostgreSQL, and Zod**. They're written to my future self: each section explains a concept in plain terms and then calls out the specific mistakes that actually cost me time, so I don't repeat them.

If you're skimming, the **"Watch out"** paragraphs are the parts worth reading twice.

---

## 1. TypeScript & tsconfig

TypeScript won't know about Node's built-in globals (`require`, `process`, `Buffer`) unless you tell it to include the Node type definitions. The setting for that is `types`, and if it's set to an empty array, TypeScript ignores `@types/node` even when it's installed — which shows up as the confusing error *"Cannot find name 'require'."* The fix is simply:

```json
"types": ["node"]
```

For import paths, the modern setup is `moduleResolution: "bundler"` together with `module: "preserve"`. This matches how Bun (and bundlers like Vite/esbuild) actually resolve files, and it lets you write natural, extensionless imports like `import { log } from "./logger"`. If you instead use `module: "nodenext"`, you have to write the *compiled* extension — `./logger.js` — even though the file on disk is `logger.ts`, which trips everyone up the first time.

A couple of smaller things: `baseUrl` is deprecated as of TypeScript 7, so define path aliases with just `paths` (they resolve relative to the `tsconfig.json` itself):

```json
"paths": { "@/*": ["./*"] }
```

And `verbatimModuleSyntax: true` requires you to mark type-only imports explicitly with `import type { X }`.

**Watch out:** VS Code caches your `tsconfig.json`. After you change it, the errors won't clear until you restart the TypeScript server (Command Palette → "Restart TS Server"). I lost time thinking a fix hadn't worked when it actually had.

## 2. require vs import

When you write `const x = require("...")`, TypeScript types `x` as **`any`** — you get no autocomplete and no type-checking at all. That's not a bug; `require`'s type signature genuinely returns `any` because it can load anything at runtime. Switching to an ESM `import` gives you full types and editor support, so prefer it.

**Watch out:** an ESM `import` needs `"type": "module"` in `package.json` (under `nodenext` resolution). Without it, the file is treated as CommonJS and the `import` keyword is rejected outright.

## 3. Bun

Bun does **not** reload your server automatically when you edit a file — it runs the file once and keeps the process alive. To get live reloading, use `bun --watch index.ts` (which fully restarts the process) or `bun --hot index.ts` (which hot-swaps the code without dropping the process). Bun also reads your tsconfig `paths` natively, so the `@/` alias just works at runtime with no extra tooling.

**Watch out:** flags must come **before** the entry file. `bun --hot index.ts` enables hot reload; `bun index.ts --hot` quietly passes `--hot` as an argument to your own program instead, and nothing reloads.

**Watch out:** older Bun (the 1.1.x line) had a bug where Express body parsing intermittently failed with *"request size did not match content length"* on reused connections. It's a Bun bug, not your code — running `bun upgrade` to the 1.2.x line fixes it.

## 4. Express 5

In `@types/express` v5, the values in `req.params` are typed as `string | string[]` (Express 5 supports wildcard and repeated params). If you pass a raw `req.params.id` straight into a query, TypeScript complains that a `string[]` isn't allowed. The clean fix is to type the route generic so the param narrows to a plain string:

```ts
(req: Request<{ id: string }>, res) => { const { id } = req.params; }
```

It helps to remember the order of the handler generics: `Request<Params, ResBody, ReqBody, ReqQuery>`. The request **body** is the third slot and the **query** is the fourth — a common source of "why isn't my body typed" confusion.

The best change in Express 5 is that it **automatically forwards errors from async handlers** to your error-handling middleware. In Express 4 an async function that threw would leave the request hanging, so people wrapped every handler in `try/catch`. In Express 5 that boilerplate is unnecessary — you only reach for `try/catch` when you want to *transform* a specific error into a friendlier one. Just remember the error handler must take all four arguments `(err, req, res, next)` (that's how Express recognizes it) and be registered last.

**Watch out:** a `204 No Content` response must not have a body. If you write `res.status(204).json({ ... })`, the JSON is silently dropped and the client gets an empty response. Use `200` with `.json()` when you want to return data, or `204` with `.send()` when you don't.

**Watch out:** for a catch-all 404, use `app.use(handler)` — not `app.get("*", ...)`. Express 5's router rejects a bare `*` and throws on startup.

## 5. Drizzle ORM

Drizzle can infer your TypeScript types straight from the table definition: `table.$inferSelect` is a full row and `$inferInsert` is the insert shape (columns with defaults or that are nullable become optional). A useful mental model is that **the column definition decides whether a field is required**: a `notNull` column with no default is required, while a column with a default is optional.

Two column types surprise people. A `numeric` column is represented as a **string** in JavaScript (this is deliberate — it avoids floating-point rounding errors with money), and a `date` column also comes back as a string like `"1965-01-01"`. So when you build values to insert, price is a string, not a number.

For conditional queries, `.where(undefined)` means "no filter", which makes optional search filters clean to express:

```ts
.where(search ? ilike(booksTable.title, `%${search}%`) : undefined)
```

Constraints and indexes go in the table's second-argument callback:

```ts
pgTable("books", { ...columns }, (t) => [
  check("price_non_negative", sql`${t.price} >= 0`),
  index("books_title_trgm_idx").using("gin", sql`${t.title} gin_trgm_ops`),
]);
```

**Watch out (this one cost real time):** Drizzle wraps database errors in a `DrizzleQueryError`. The actual Postgres error code lives at **`err.cause.code`**, not `err.code`. Because I was reading `err.code`, every database error fell through to a generic 500 instead of the right status. Check both.

**Watch out:** `drizzle-kit` does not manage Postgres extensions. If your schema uses something like a trigram index, `CREATE EXTENSION pg_trgm` won't be generated for you — you have to add it to the migration SQL by hand.

### Joining tables (leftJoin)

A join lets a single query pull related rows from two tables at once, matching them on a shared value. Since a book stores only its author's id, a join is how you return the whole author alongside the book instead of just that id — the database matches each book to the author whose id equals the book's stored author id, and hands back both together.

The important idea is the difference between a **left** join and an **inner** join. A left join always keeps every row from the "left" (main) table — here, books — even when there's no matching row on the other side; the missing side simply comes back empty. An inner join is stricter: it only returns rows where *both* sides have a match, so a book with no matching author would disappear from the results entirely.

In this project every book has a required author (the foreign key is not-null), so the two kinds of join would behave identically. But a left join is the safer default because it never silently drops your main record just because a related row happens to be missing — you'd rather get the book back with an empty author than get nothing at all. You reach for an inner join only when you specifically *want* to require the match and exclude the unmatched rows.

One practical wrinkle worth remembering: the result of a join isn't a single flat object. It comes back grouped by table — the book's columns under one key, the author's under another — so if you want a tidy response with the author nested inside the book, you reshape it yourself before sending it back.

## 6. IDs: identity vs UUID

There are two natural choices for a primary key, and they trade off differently:

- **Sequential (`generatedAlwaysAsIdentity`)** gives you small, ordered, human-readable ids like `1, 2, 3`. The downside is they're **guessable and enumerable** — anyone can walk `/books/1`, `/books/2` and count or scrape your data.
- **UUID (`defaultRandom`)** is not guessable and merges cleanly across databases, at the cost of being larger and hurting index locality because the values are random (UUIDv7 solves the ordering problem if you need it).

For a public API where ids are exposed, UUIDs are usually the safer default.

## 7. PostgreSQL & Docker

`docker compose up -d` needs the Docker **daemon** running first — on a Mac that means starting Docker Desktop. A stopped container still counts as "using" its image, so if you try to delete an image and it refuses, remove the container first and then the image. And remember that without a named `volumes:` entry, your database data is **ephemeral** — `docker compose down` deletes it along with the container.

It's worth mapping the common Postgres error codes to sensible HTTP responses in your error handler:

| Code | Meaning | HTTP |
|------|---------|------|
| 23505 | unique violation | 409 |
| 23503 | foreign key violation | 400 |
| 23502 | not-null violation | 400 |
| 23514 | check violation | 400 |

**Watch out:** an `ILIKE '%term%'` search (with a leading wildcard) **cannot use a normal B-tree index** — that kind of index only helps prefix searches like `term%`. To make `%term%` fast you need the `pg_trgm` extension and a **GIN trigram index**. And don't be alarmed if `EXPLAIN` shows a sequential scan anyway: on a tiny table Postgres correctly decides scanning is faster than using the index. You can force it with `SET enable_seqscan = off` just to confirm the index is usable.

### Two ways to search text: trigram vs full-text

`ILIKE` + trigram is not the only option. Postgres also has proper **full-text search** with `to_tsvector`/`to_tsquery`, and the two solve *different* problems:

```ts
// trigram / ILIKE — matches any substring, typo-tolerant, partial words
.where(ilike(booksTable.title, `%${term}%`))

// full-text — matches whole words and their stems, with ranking
.where(sql`to_tsvector('english', ${booksTable.title}) @@ websearch_to_tsquery('english', ${term})`)
```

The key distinction: **trigram matches substrings** (typing `syst` finds "System", `fisch` finds "Fischer"), while **full-text matches words and their stems** ("games" matches "game", "running" matches "run") and can rank results and handle boolean/phrase queries. Full-text ignores stop words and is language-aware; trigram is language-agnostic and tolerates typos and partial input.

For a short **title** field where users type partial words, trigram is usually the better fit — full-text can't do partial-word matching without a `:*` prefix trick. Full-text shines on longer prose like a **description**, where stemming and relevance ranking matter. Its index is a GIN index on the tsvector rather than a trigram index:

```ts
index("books_title_fts_idx").using("gin", sql`to_tsvector('english', ${t.title})`)
```

**Watch out:** never pass raw user input to `to_tsquery` — it has a strict query syntax and throws on ordinary input like `chess endgame`. Use **`websearch_to_tsquery`**, which accepts plain human text (spaces, quotes, `or`) safely.

## 8. Zod validation

The key realization is that **TypeScript types are erased at runtime**, so a typed `req.body` is really just untrusted `any` coming off the network. Zod is what actually checks the data at runtime. `drizzle-zod`'s `createInsertSchema` is especially nice because it derives the validator directly from your table, so validation and schema never drift apart.

A few techniques that mattered:

- **`.pick()` whitelists** the fields a client is allowed to send, which blocks *mass assignment* — without it, a client could set `id`, `createdAt`, or `updatedAt`. (I confirmed this: an injected `"id"` was silently stripped.)
- **Refinements** (the second argument to `createInsertSchema`) tighten fields whose auto-generated validation is too loose. Under this Drizzle release candidate, `varchar` length was enforced automatically but `numeric`, `date`, and `integer` were **not**, so I had to validate those explicitly or bad values would reach the database and cause a 500.
- **`.transform((n) => n.toFixed(2))`** lets the client send a natural `number` for price while handing Drizzle the `string` its `numeric` column expects. The rule to remember: the schema's *output* type must match what `db.insert().values()` expects.
- A refinement alone can't make a nullable or defaulted column required — for that, either use `.extend()` (which fully replaces the field) or make the column `notNull` so the requirement comes from the schema itself.

**Branded types** were the neat trick here. `z.uuid().brand<"Uuid">()` produces a `Uuid` type that is distinct from a plain `string`, so you can't accidentally pass an unvalidated string where a validated id is expected. It's only honest, though, when a validation gate (middleware) actually runs to produce that branded value.

## 9. Architecture patterns

A few patterns kept the code clean:

- A single **`validate(source, schema)` middleware factory** validates `req.body`, `req.params`, or `req.query`. It reassigns `req.body` with the parsed result (params and query are read-only in Express 5, so those are validated but not replaced).
- An **`ApiError` class plus a central error handler** means any layer can `throw ApiError.notFound(...)` and the handler turns it — along with mapped Postgres codes and a generic 500 fallback — into consistent JSON, without ever leaking a stack trace.
- Every response uses the **same envelope**: `{ status: "success" | "error", ... }`, so clients parse everything the same way.
- Controllers stay **thin** — validation happens at the edge in middleware, so the handler can trust its input — and the `@/` path alias removes the `../../..` import noise.

## 10. Git

To back-date a commit properly you have to set **both** dates, because `--date` on its own only changes the *author* date and leaves the *committer* date as now:

```bash
GIT_COMMITTER_DATE="2025-08-10T12:00:00" \
  git commit --date "2025-08-10T12:00:00" -m "..."
```

A bare `YYYY-MM-DD` is rejected for `GIT_COMMITTER_DATE`, so give it a full timestamp. (GitHub's contribution graph uses the author date, in case that's what you're aiming for.)

**Watch out:** GitHub's push protection blocks secrets before they ever land — including a public Mapbox `pk.` token. The way out is to scrub the token to a placeholder and amend, or explicitly allow it via the unblock URL in the error. And a broader lesson from debugging: when a stack trace lives entirely inside `node_modules` with none of your own files in it, the bug is almost always in a dependency or the runtime, not your code.

## 11. Deleting data: soft delete & keeping history

Deleting a record that other records point to is one of the most consequential decisions in a schema, because a foreign key can turn one delete into many. When a book references an author, the database needs to know what to do to the books if that author is removed. The options range from destructive to protective: a **cascade** deletes the author and all their books along with them; a **restrict** refuses the delete while any book still points at the author; a **set null** keeps the books but empties their author link; and **soft delete** sidesteps the whole question by never actually removing anything.

The safest default for anything meaningful is **soft delete**. Instead of a real `DELETE`, you add a `deletedAt` timestamp column and simply set it when something is "deleted." The row stays in the database, so nothing is destroyed and everything is reversible — you're just hiding it. The catch is that *every* read has to remember to filter out the hidden rows (`where deletedAt is null`); miss one query and "deleted" records leak back into the app. There's also a subtle side effect: a unique column like email is still occupied by a soft-deleted row, so that value can't be reused unless you make the uniqueness apply only to non-deleted rows.

The reason all of this matters becomes vivid once you imagine a customer who has already **bought** a book. Now the chain is order → book → author, and deleting the author is no longer just an author problem. A cascade would delete the author, then the books, and suddenly an order points at a product that no longer exists — the receipt and purchase history break, which for a real store is a legal and accounting disaster. Soft delete avoids this because the whole chain stays intact; the author is merely hidden from listings.

But the deeper principle worth remembering is that **transactional records should not depend on live catalog data at all.** An order is a historical fact: it must show what was bought, and the price that was actually paid, forever — regardless of what happens to the book or author afterward. So a well-designed order doesn't just link to the book and read its current title and price; it **stores a snapshot** of those values at the moment of purchase. Prices change, titles get corrected, records get removed — but the receipt must never change. The foreign key becomes a convenience link, while the snapshot is the source of truth.

The rule of thumb that falls out of this: **catalog data** (books, authors) can be edited or hidden, so it's fine to soft-delete and reference live; **transactional data** (orders) is append-only and self-contained, so it snapshots what it needs and never lets a later change rewrite history.

---

*Field notes from building the Book Store API — kept as a quick reference for next time.*
