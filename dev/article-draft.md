# Sometimes One, Sometimes Many: A JavaScript Pattern That Got Left Behind

## The Problem

Every JavaScript developer has written this code:

```javascript
function processIds(ids) {
  if (Array.isArray(ids)) {
    return ids.map(id => fetchUser(id));
  } else {
    return fetchUser(ids);
  }
}
```

Or this:

```javascript
// API returns either {user: {id: 1}} or {users: [{id: 1}, {id: 2}]}
const users = response.user ? [response.user] : response.users;
users.forEach(u => console.log(u.id));
```

Or struggled with the DOM:

```javascript
const element = document.getElementById('myId');         // Returns one element
const elements = document.getElementsByClassName('box'); // Returns collection

// Different methods for each
element.classList.add('active');
Array.from(elements).forEach(el => el.classList.add('active'));
```

This singular/plural distinction is everywhere in JavaScript, and we've just accepted that we need to write different code for each case.

## A Different Approach

Back in 2014, I wrote a small library called jado that took a different approach: what if we just didn't care whether something was singular or plural?

```javascript
// jado treats everything as iterable
jado.map(5, x => x * 2);          // returns 10
jado.map([5, 6], x => x * 2);     // returns [10, 12]

// Same function, no type checking needed
function processIds(ids) {
  return jado.map(ids, id => fetchUser(id));
}
```

The idea was simple: make operations work uniformly on any type. A single value behaves like a single-item collection. An array behaves like an array. Objects, strings, even null and undefined - they all just work.

## Why This Matters

This pattern shows up constantly:

### Configuration Objects
```javascript
// Sometimes one middleware, sometimes many
{
  middleware: authMiddleware
}
// vs
{
  middleware: [authMiddleware, loggingMiddleware]
}

// With jado, your code doesn't change:
jado.each(config.middleware, m => app.use(m));
```

### API Responses
```javascript
// Some endpoints return single items, some return arrays
// GitHub API: GET /repos/:owner/:repo returns one repo
// GitHub API: GET /users/:username/repos returns array

// Traditional approach needs checking
const repos = Array.isArray(response) ? response : [response];

// jado approach
jado.map(response, repo => repo.name);
```

### Event Handling
```javascript
// Sometimes one listener, sometimes many
element.addEventListener('click', handler);
element.addEventListener('click', [handler1, handler2]); // Doesn't work!

// But imagine if it did:
jado.each(handlers, h => element.addEventListener('click', h));
```

## The Functional Programming Connection

This isn't a new idea. Haskell has been doing this for decades with functors:

```haskell
fmap (+1) [1,2,3]    -- [2,3,4]
fmap (+1) (Just 1)   -- Just 2
fmap (+1) Nothing    -- Nothing
```

The operation (`fmap`) works uniformly across different container types. You don't write different code for Maybe vs List.

## What JavaScript Chose Instead

JavaScript went a different direction. ES6 introduced the iteration protocol, requiring objects to explicitly implement `Symbol.iterator`. TypeScript doubled down on explicit type handling. Modern JavaScript says "be explicit about types."

This has clear benefits:
- Better tooling and IDE support
- Compile-time error catching  
- Clearer contracts between functions
- Performance optimizations

But we lost something too: the simplicity of operations that just work.

## Still Relevant Today

Even in 2025, you still can't do this in JavaScript:

```javascript
// Still doesn't work
{a: 1, b: 2}.map(v => v * 2);

// Still need Array.from()
document.querySelectorAll('.box').map(el => el.innerHTML);

// Still need type checking
const result = maybeArray.map(x => x + 1); // Errors if not array
```

Libraries like Lodash help, but they're explicit about types - different functions for different types (`_.map` for arrays, `_.mapValues` for objects).

## The Path Navigation Problem

There's another problem jado solved that's still painful today: navigating deeply nested objects.

### Modern Solutions and Their Complexity

**JSONPath** (2007):
```javascript
// JSONPath uses XPath-like syntax
jsonpath.query(data, '$.users[?(@.age > 18)].name');
jsonpath.query(data, '$..book[?(@.price < 10)]');
```
Powerful but complex. Learning curve for query syntax. Overkill for simple navigation.

**Lodash's get/set** (2012):
```javascript
_.get(data, 'users.admin.name');
_.get(data, ['users', 'admin', 'permissions', 0]);
_.set(data, 'users.admin.theme', 'dark');
```
Good but requires a dependency. No path manipulation utilities.

**Optional Chaining** (2020):
```javascript
data?.users?.admin?.name
data?.users?.['admin']?.permissions?.[0]
```
Built into the language but only works with known property names. Can't use dynamic paths.

### What Jado Did in 2014

```javascript
// Simple string paths
jado.p2v(data, 'users/admin/name');
jado.p2v(data, 'users/admin/permissions/0');

// Convert between representations
const path = jado.strToPath('users/admin/name');  // ['users', 'admin', 'name']
const str = jado.pathToStr(path);                  // 'users/admin/name'

// Handle special characters
jado.p2v(data, ['config/settings', 'theme']);  // Key contains slash
```

No query language to learn. No complex syntax. Just paths. 

The design philosophy again: make the simple case simple. Most of the time you just want to grab a value from a nested object. Why should that require learning XPath-like syntax or adding a 70KB dependency?

## The Pattern Lives On

While jado itself is a relic from 2014, the pattern appears in modern code:

```javascript
// React children
React.Children.map(children, child => ...)  // Works on single child or array

// CSS-in-JS libraries
css(styles);  // Often accepts single style object or array

// GraphQL/Apollo
// Automatically handles single vs array based on schema
```

The need hasn't gone away. We've just accepted the boilerplate.

## A Small Example: Counting Things

Jado included a counting set that still has no modern equivalent:

```javascript
const counts = jado.cset();
counts.add('apple');
counts.add('apple');
counts.add('orange');

counts.keys();    // ['apple', 'orange']  
counts.count('apple'); // 2
counts.avg();     // 1.5 (average count)
counts.std();     // Standard deviation of counts
```

To do this today requires combining a Map with a statistics library. Simple operations require multiple tools.

## Conclusion

I'm not arguing we should abandon TypeScript or modern JavaScript's explicit approach. They solve real problems at scale. But there's value in remembering alternative approaches.

Sometimes the best code is the code you don't have to write. Every `Array.isArray()` check, every `Array.from()`, every ternary operator handling the one-vs-many case - that's complexity we've accepted as necessary.

But is it?

The jado experiment suggested maybe not. Maybe we could have a JavaScript where operations work uniformly across types. Where singular vs plural isn't a distinction your code needs to care about.

That's not the path JavaScript took. But understanding the paths not taken helps us understand why we write the code we write today - and maybe, occasionally, to question whether we need to.

---

*The jado library is still available on [npm](https://www.npmjs.com/package/jado) and [GitHub](https://github.com/deftio/jado), though it's no longer maintained. It represents a snapshot of one approach to JavaScript from a simpler time, when the language was still figuring out what it wanted to be.*

## Code Examples for the Article

```javascript
// The problem jado solved
function processData(input) {
  // Without jado - defensive coding
  if (input === null || input === undefined) {
    return [];
  }
  if (Array.isArray(input)) {
    return input.map(transform);
  }
  if (typeof input === 'object') {
    return Object.values(input).map(transform);
  }
  return transform(input);
}

// With jado - it just works
function processData(input) {
  return jado.map(input, transform);
}
```

```javascript
// Real-world example: Processing form inputs
// Sometimes a checkbox has one value, sometimes many

// Traditional
const values = Array.isArray(formData.categories) 
  ? formData.categories 
  : [formData.categories];
const validated = values.filter(v => allowedCategories.includes(v));

// With jado
const validated = jado.filter(formData.categories, 
  v => allowedCategories.includes(v));
```