# Notes on Approximation Theory

Some notes that may be useful when finding approximation error bounds that are explicit (with no hidden constants).

<a id=Definitions></a>

## Definitions

The _closed unit interval_ (written as \[0, 1\]) means the set consisting of 0, 1, and every real number in between.

For definitions of _continuous_, _derivative_, _convex_, _concave_, _Hölder continuous_, and _Lipschitz continuous_, see the definitions section in "[**Supplemental Notes for Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernsupp.html#Definitions)".

For definitions of _Bernstein form_ and _Bernstein coefficients_, see the definitions section in "[**Approximations in Bernstein form**](https://peteroupc.github.io/bernapprox.html#Definitions)".

- An _operator_ is a mapping from functions to functions.
- An operator $L$ is _linear_ if it satisfies $L(af)=aL(f)$ and $L(f+g)=L(f)+L(g)$ for all input functions $f$ and $g$ and every real number $a$.
- An operator $L$ is _positive_ if it has the property that, if $f$ is everywhere nonnegative, so is $L(f)$, for every input function $f$.
- The _operator norm_ of an operator $L$ is the maximum absolute value of $L(f)$ over all input functions $f$ with maximum absolute value 1 or less.

<a id=Results_on_Error_Bounds></a>

## Results on Error Bounds

Some results on error bounds for certain classes of operators.

<a id=Lebesgue_Inequality_for_Certain_Linear_Operators></a>

### Lebesgue Inequality for Certain Linear Operators

For any sequence of linear operators $(L_n)$ that map continuous functions to polynomials and reproduce all polynomials up to degree $m(n)$ (which depends on $n$), the following error bound (also known as _Lebesgue's lemma_ or the _Lebesgue inequality_) holds true for each $n$:

$$\text{abs}(L_n(f)(x) - f(x))\le(1+\|L_n\|)\cdot\max_t(\text{abs}(f(t)-P(t))),$$

where $\|L_n\|$ is the operator norm of $L_n$, and $P$ is a polynomial of degree up to $m(n)$ with the least maximum absolute difference between $f$ and the polynomial (see also DeVore and Lorentz (1993)[^1], Cheney (1996, chapter 6)[^2]).  But this error bound will generally be crude or trivial unless $L_n$ are nonpositive operators.  Indeed, the only positive linear operator that reproduces all polynomials up to degree 2 is the identity operator $L_n=f$ [^3].

<a id=Whitney_s_Inequality></a>

### Whitney's Inequality

Let $n$ be zero or a positive integer, let $f$ be continuous on a closed interval $[a, b]$, and let $P$ be a polynomial of degree $n$ or less on that interval.  Then the error of $P$ in approximating $f$ is bounded as follows (see Babenko and Kryakin 2019[^4]):

$$\|f-P\|\_\infty\le W \cdot \omega_{n+1}(f,\frac{b-a}{n+1}),$$

where&mdash;

- $W$ is 1 if $n\le 7$; otherwise, $W$ is $(2+\exp(-2)) < 2.13534$,
- $\|g\|_\infty$ is the maximum of the absolute value of (the continuous function) $g$ on $[a, b]$, and
- $\omega_{n}(f, h)$ is the modulus of continuity of $f$ of order $n$, with parameter $h$.

Using properties of the modulus of continuity (see Sevy 1991[^5], sec. 2.0.2; Gonska 1985[^6]), if $f$ has a continuous $(n+1)$-th derivative on $[a, b]$:

$$\|f-P\|_\infty\le W \cdot \left(\frac{b-a}{n+1}\right)^{n+1}\|f^{(n+1)}\|\_\infty,$$

and if $f$ has a continuous $n$-th derivative on that interval:

$$\|f-P\|_\infty\le W \cdot \left(\frac{b-a}{n+1}\right)^n\omega_1(f^{(n)}, \frac{b-a}{n+1}).$$

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
<a id=Notes></a>

## Notes

[^1]: R.A. DeVore and G.G. Lorentz, _Constructive Approximation_, 1993.

[^2]: E. W. Cheney, _Introduction to Approximation Theory_, 1998.

[^3]: Guessab, A., Nouisser, O. & Schmeisser, G. Enhancement of the algebraic precision of a linear operator and consequences under positivity. Positivity 13, 693–707 (2009). [**https://doi.org/10.1007/s11117-008-2253-4**](https://doi.org/10.1007/s11117-008-2253-4)

[^4]: Babenko, Alexander G., and Yuriy V. Kryakin. "Special difference operators and the constants in the classical Jackson-type theorems." Topics in Classical and Modern Analysis: In Memory of Yingkang Hu. Cham: Springer International Publishing, 2019. 35-46.

[^5]: Sevy, J., "Acceleration of convergence of sequences of simultaneous approximants", dissertation, Drexel University, 1991.

[^6]: H. H. Gonska, _Quantitative Approximation in C(X)_, Habilitationschrift, Universität Duisburg, 1985.
