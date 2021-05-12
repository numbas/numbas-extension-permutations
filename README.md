Permutation groups extension for Numbas
=============================

This extension adds a new data type to the Numbas JME system, representing elements of permutation groups (really, just S_infinity, but you can pretend you're working in an S_n).

Permutations are stored as bijections on the natural numbers.

The symbol for the identity permutation is `e` by default. You can change this by setting `Numbas.extensions.permutations.identity_symbol` in the question preamble.

JME data type
-------------

This extension adds a new JME data type, `Numbas.jme.types.permutation`, representing a permutation.

JME Functions
---------

### `permutation(map)` or `perm(map)`

Create a permutation. `map` is a list of numbers. `map[i]` is the image of `i` under the permutation.

**Note**: Because lists are zero-indexed, the first element is `0`, not `1`.

**Example**: `permutation([1,0])` is the permutation swapping the first two elements and will be displayed in cycle notation as `(1,2)`.

### `permutation(str)` or `perm(str)`

Create a permutation. `str` is a permutation in disjoint cycle notation.

**Example**: `permutation("(1,2)(3,4,5)")`

## `transposition(a,b)`

A permutation representing the transposition of the elements `a` and `b`.

### `rotation(n,r)`

Create a permutation representing a rotation of the numbers `1` to `n` by `r` places.
If `r` is not given it defaults to `1`.

### `flip(n)`

Create a permutation representing a reflection of the numbers `1` to `n`.

### `compose(p1,p2)` or `p1*p2`

Compose permutations. The action is on the left - `(p1*p2)[x] = p1[p2[x]]`.

### `p^n`

The `n`th power of `p`. `p^0` is the identity permutation.

### `p[x]`

Apply permutation `p` to the number `x`. 
Consider `p` as an element of `S_n`; any `x` greater than or equal to `n` is mapped to itself.

### `inverse(p)`

Returns the inverse of permutation `p`.

### `even(p)`

Is `p` an even permutation (can it be written as a product of an even number of transpositions?)

### `size(p)`

The largest number `n` that is permuted by `p`, or equivalently, the smallest `n` such that `p` is a member of `S_n`.

### `order(p)`

The order of `p`: the smallest power of `p` equivalent to the identity permutation.

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

### `is_disjoint(str)`

Returns true if `str` is a representation of a permutation as disjoint cycles (no two cycles have an element in common).

### `is_transpositions(str)`

Returns true if `str` is a representation of a permutation as transpositions (each cycle has length 2).

### `is_rotation(p)`

Returns true if `p` is a rotation, i.e. a permutation of the form `f: i -> (i+x) mod N`, for some 0< x < N.

### `is_flip(p)`

Returns true if `p` is a flipped rotation, i.e. a permutation of the form `f: i -> (x-i) mod N`, for some 0<x<N.
