Permutation groups extension for Numbas
=============================

This extension adds a new data type to the Numbas JME system, representing elements of permutation groups (really, just S_infinity, but you can pretend you're working in an S_n).

Permutations are stored as bijections on the natural numbers.

JME Functions
---------

### `permutation(map)` or `perm(map)`

Create a permutation. `map` is a list of numbers. `map[i]` is the image of `i` under the permutation. 

### `permutation(str)` or `perm(str)`

Create a permutation. `str` is a permutation in disjoint cycle notation (e.g. `"(1,2)(3,4,5)"`)

### `compose(p1,p2)` or `p1*p2`

Compose permutations. The action is on the left - `(p1*p2)[x] = p1[p2[x]]`.

### `p[x]`

Apply permutation `p` to the number `x`.

### `inverse(p)`

Returns the inverse of permutation `p`.

### `even(p)`

Is `p` an even permutation (can it be written as a product of an even number of transpositions?)

### `order(p)`

Order of `p`.

### `cycles(p)`

Calculate all of `p`'s cycles. Returns a list of lists of numbers.

### `nontrivial_cycles(p)`

Calculate all of `p`'s cycles of length greater than 1.

### `show(p)`

Render `p` as a TeX string (just substituting `p` into a TeX expression will also work, but you can use this if you want to manipulate the TeX string somehow)

### `twoline(p)`

Render `p` in two-line form (numbers 1..n on top row, their images on the bottom) as a TeX string

### `as_transpositions(p)`

Render `p` as a product of transpositions, in TeX.

### `p1=p2`

Are `p1` and `p2` the same permutation? True if `p1*inverse(p2)` maps `n` to `n` for all `n`.
