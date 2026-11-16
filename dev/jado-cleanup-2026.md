# Jado — 2026 minor cleanup notes

*Working notes, November 15, 2026. Scope: one small preservation/maintenance pass. Jado is not an active investment or an evangelism project. Preserve its tiny, cardinality-independent grammar; fix clear mistakes and then stop.*

Decisions recorded with the 1.1.0 pass, on branch `cleanup-2026`:

* **Rejected scalar** - `filter` and `filterx` return `undefined`. An accepted scalar is returned as itself.
* **reducex** - the callback is `(accumulator, value, key)`. A scalar has no key, so the key is `undefined`.
* **Missing seed** - `reduce` and `reducex` throw `TypeError` on an empty list or a nullish input. A single value with no seed is returned, and the function is not called.
* **cloneType** - `null` and `undefined` pass through. Core types get an empty value. Typed arrays get a zero-length array of the same kind. A custom class returns `undefined` and its constructor is not called.
* **Left as they were** - object walks still use `for...in`, including inherited enumerable names. `map`, `mapx`, and `forEach` still call `getValue` on members. `filter` still uses `== true`, so `1` passes and other truthy values do not.
* **Not a record** - a plain object is a collection of fields. The docs no longer say one object and an array of objects are the same case.

Repository: https://github.com/deftio/jado  
Primary references: [`src/jado.js`](https://github.com/deftio/jado/blob/master/src/jado.js), [`test/jado_test.js`](https://github.com/deftio/jado/blob/master/test/jado_test.js), [`README.md`](https://github.com/deftio/jado/blob/master/README.md)

## North star

Jado emerged from working with large, uneven Trensant knowledge-graph responses—people, places, things and attributes—and from exploring browser DOM structures. The winning property was that a transformation did **not** need `if (single) ... else if (array) ... else if (object) ...` everywhere. Keep that property. Reduce incidental special cases, but don't disguise errors or add cleverness that is harder to reason about than the original branches.

## Scope and stopping rule

**This is a spare-time cleanup, not Jado 2.0.** Keep the one-line helpers where they remain clear and correct. Do not expand the API, chase adoption, benchmark competitors, or refactor merely for modern style. The smallness of the implementation was part of the original experiment, not an accident.

**Done means:** core behavior is documented; the known `reduce` and singleton `filter` defects are fixed; `null` and `undefined` are preserved distinctly; focused regression tests pass; package metadata/docs are accurate. Anything else goes into an optional backlog. Aim for a few small, reviewable commits rather than a rewrite.

## A. Small fixes worth doing

- [x] **P1 — Match native `Array.prototype.reduce` callback order.** Current `jado.reduce` invokes `f(value, accumulator)`; use `f(accumulator, value)` instead. Test *noncommutative* callbacks (string concatenation, subtraction, object accumulation), since addition won't expose the reversal. Audit internal callers (`_r`, `a2s`, `s2a`, stats, path helpers, etc.) and examples **before** switching; this is a breaking change, even if tiny. Consider the corresponding `reducex` signature: either `(accumulator, value, key)` to resemble native reduce, or explicitly document the extended convention. Don't leave two incompatible accumulator positions without a reason.

  ```js
  // Desired convention:
  jado.reduce([1, 2, 3], (acc, value) => acc - value, 10); // 4
  ```

- [x] **P1 — Fix singleton `filter` / `filterx`.** Both branches currently contain `r = d[k]` even though `k` has not been assigned for singleton input. Decide first what an *accepted* and *rejected* scalar should return, then fix both functions consistently and add tests. This is a real bug, not an aesthetic preference. (Also note `filterx`'s singleton callback should obey its documented callback contract.)

- [x] **P1 — Fix `cloneType(null)` / `cloneType(undefined)` assumptions.** The implementation uses `new x.constructor()`, which fails on nullish inputs and is unreliable for some built-ins and custom classes. Implement explicit behavior for the supported *core types* rather than promising arbitrary constructor cloning. Clarify whether the output is an empty container, a preserved atomic value, or a sentinel. Test dates and typed arrays if they are supported; don't silently claim all objects are safe.

- [x] **P1 — Add a small behavioral matrix to tests.** The checked-in Mocha suite appears very thin (mostly `typeOf`). Add table-driven cases covering `map`, `filter`, `reduce`, `mapx`, `filterx`, `reducex` with scalars, strings, arrays, objects, empty arrays/objects, `null`, `undefined`, and DOM-like collections where applicable. Explicitly assert output *shape*, not just values. Include key order only where the API promises it.

- [ ] **P2 — Use own properties where object traversal is intended.** Several functions use `for...in`, which includes inherited enumerable properties. For JSON-like dictionaries, `Object.keys()` is usually the intended enumeration. Decide whether inherited keys were ever deliberate, and test this. Make sure sparse arrays and arrays with extra enumerable properties have documented behavior.

- [ ] **P2 — Clarify implicit function evaluation.** `jado.getValue(fn)` calls `fn()`, and parts of Jado use that behavior. That can be convenient for lazy values but surprising or dangerous when exploring graphs containing callbacks. Keep `getValue` as an *explicit* opt-in evaluation helper; consider ensuring generic traversal and `map` do not invoke functions implicitly, or at least document precisely which calls do. Treat a behavioral change as compatibility-sensitive.

- [x] **P2 — Document path edge cases and test round trips.** State clearly that `p2v(data, '')` refers to an empty-string key, not root; document root paths and array-path usage for keys containing delimiters. Test missing paths, numeric-looking keys, empty keys, and escaped/delimiter-containing keys. Don't invent a complex path language merely for completeness.

- [x] **P2 — Correct metadata and stale README claims.** `package.json` lists a Bitbucket SSH repository although the public home is GitHub. Review historical claims in the README (for example, dates relative to ES6/JSONPath/Lodash) and remove unsupported precedence claims. Fix spelling such as “interable” and “dependancies,” and keep examples accurate after the reduce change.

- [ ] **P3 — Check packaging without enlarging the project.** Verify CommonJS, ESM, browser UMD, entry points, generated `dist`, version strings, and `npm pack` contents. Refresh tooling only enough to keep `npm test`, `npm run lint`, and `npm run build` reliable on supported Node versions. No need for a framework migration.

## B. Nullish values — 2026 decision and historical note

**Decision (November 15, 2026): preserve nullish values distinctly.** `null` stays `null`, and `undefined` stays `undefined`; neither is rewritten as `{}` simply to permit a subsequent Jado operation. This follows Jado's shape-preserving, cardinality-independent intent and does not require a wrapper or fluent chaining API.

```js
jado.map(null, fn)       // null; fn not called
jado.map(undefined, fn)  // undefined; fn not called
jado.map({}, fn)         // {}
jado.map([], fn)         // []
jado.map(5, fn)          // fn(5)
```

For a core `map`, favor **shallow nullish propagation**: `map({a: null}, fn)` still passes the contained `null` to `fn`, just as native array mapping passes nullish members to callbacks. Do not quietly add deep skipping; that would create a surprising second rule.

**Historical note (preserve this in documentation):** The older README describes `null` and `undefined` being converted to `{}` so operations can continue without null checks. The motivation is not established from commit history. A plausible explanation is the behavior of ES5-era JavaScript: generic object traversal and property access on nullish values frequently threw `TypeError`, optional chaining did not exist, and normalizing to `{}` provided a very compact way to avoid exceptions in subsequent traversal. Another plausible rationale is treating a missing subtree as an empty collection of results in Trensant graph exploration. **The author also recalls being delighted by how tiny the helpers were, often single-line implementations; preserving that compactness may have favored an easy nullish-to-empty normalization.** That is a recollection of the design atmosphere, not a confirmed explanation of this particular decision. Neither technical hypothesis should be presented as established author intent. In hindsight the conversion loses an important distinction: **absence is not an empty dictionary**. No broad `try/catch` around `TypeError` is needed to implement the new policy; a small explicit boundary check is clearer.

```js
// Illustrative boundary guard, not a patch against a particular function:
if (data === null || data === undefined) return data;
```

**Other operations require their own semantics, not automatic copying of map's rule:**

| Input | `map(fn)` | `filter(pred)` (proposed) | `reduce(fn, initial)` (proposed) |
|---|---|---|---|
| `null` | `null` | `null` | `initial` |
| `undefined` | `undefined` | `undefined` | `initial` |
| `{}` | `{}` | `{}` | `initial` |
| `[]` | `[]` | `[]` | `initial` |
| `5` | `fn(5)` | `5` if accepted; explicit absent result if rejected | `fn(initial, 5)` |

The filter and reduce columns are **proposals pending test/spec review**, not statements of current code. Especially decide what rejection of a scalar returns, and whether a reduction without a seed on an empty or nullish input throws (as native array reduction does for an empty input).

- [x] Update the README's nullish-to-`{}` claim and document the historical behavior without inventing a definitive rationale.
- [x] Add `map(null)` and `map(undefined)` regression tests that assert callback non-invocation and **strict identity** of the result.
- [x] Add tests proving that `map({a:null}, fn)` and `map([undefined], fn)` still pass the contained values to the callback.
- [x] Audit `mapx`, `cloneType`, path helpers, and other internals for conversion of `null` / `undefined` into `{}`; decide scope before changing each operation.
- [x] Document the nullish policy change as compatibility-sensitive, even if Jado is being maintained primarily for posterity.

## C. Things **not** to do during cleanup

- Do **not** reintroduce DOM-specific singular/plural method dispatch into Jado core. A separate adapter can handle `Element`, `NodeList`, and `HTMLCollection` if desired.
- Do **not** auto-convert every scalar to `[scalar]` and return arrays from every operation. Preserving singleton shape is a central design choice.
- Do **not** make strings iterable by default just because JS strings implement `Symbol.iterator`; treating text atomically is useful.
- Do **not** add a large query language, proxy layer, reactive state, TypeScript-required build, or framework dependency as part of posterity maintenance.
- Do **not** silently alter all callback signatures in one commit without checking internal composition and existing user code.

## D. Spare-time execution plan (prioritized)

### Must do — enough to call Jado cleaned up

- [x] **Commit 1 — tests and decisions.** Add the compact behavior matrix for scalar, array, object, `null`, `undefined`. State explicitly that `map` preserves nullish inputs *without invoking the callback*, while contained nullish members are still passed to callbacks. Record existing behavior where needed to reveal the change.
- [x] **Commit 2 — correctness.** Fix singleton `filter` / `filterx` and implement `map(null) → null`, `map(undefined) → undefined`. Review `cloneType` only insofar as it blocks this policy or throws for supported inputs. Write tests for each.
- [x] **Commit 3 — compatibility consistency.** Switch `reduce` to `(accumulator, value)`; align or clearly specify `reducex`; audit all internal users and examples. Include a noncommutative test. Note the breaking callback-order change.
- [x] **Commit 4 — posterity polish.** Update README semantics, add the historical note, fix repository metadata and obvious doc errors, run tests/build, and tag a small maintenance release.

### Optional — only if a real problem is found during the pass

- [ ] Tighten own-property enumeration or document existing `for...in` semantics.
- [ ] Address `getValue` function execution in generic transformations, if demonstrably surprising or unsafe.
- [ ] Add path edge-case tests and correct a demonstrated problem, not a speculative future requirement.
- [ ] Touch packaging/tooling only when the current test/build/publish path is actually broken.

**Stop rule:** Once the four must-do commits are done and the tests pass, archive the notes and return to more active work. No feature roadmap or architectural overhaul.


## Source review scope

These notes were based on the public GitHub README, `src/jado.js`, `test/jado_test.js`, and `package.json` as visible on November 15, 2026. They are a **review checklist, not a tested patch**: the repository was inspected via GitHub pages; the full suite was not run locally. Items identified as bugs are grounded in visible source; other items are proposed hardening or design decisions.
