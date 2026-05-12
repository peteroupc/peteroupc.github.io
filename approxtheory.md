# Notes on Approximation Theory

Some notes that may be useful when finding approximation error bounds that are explicit (with no hidden constants).

The notes generally relate to error bounds on how close a polynomial is to a single-variable function on a closed interval.

<a id=Definitions></a>

## Definitions

The _closed unit interval_ (written as \[0, 1\]) means the set consisting of 0, 1, and every real number in between.

For definitions of _continuous_, _derivative_, _convex_, _concave_, _Hölder continuous_, and _Lipschitz continuous_, see the definitions section in "[**Supplemental Notes for Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernsupp.html#Definitions)".

- An _operator_ is a mapping from functions to functions.
- An operator $L$ is _linear_ if it satisfies $L(af)=aL(f)$ and $L(f+g)=L(f)+L(g)$ for all input functions $f$ and $g$ and every real number $a$.
- An operator $L$ is _positive_ if it has the property that, if $f$ is everywhere nonnegative, so is $L(f)$, for every input function $f$.
- The _operator norm_ of an operator $L$ is the maximum absolute value of $L(f)$ over all input functions $f$ with maximum absolute value 1 or less.  This assumes $L$ takes only continuous functions.
- In this page, $e_i$ is a function such that $e_i(t) = t^i$, so that $e_1(t) = t$; as an example, if $L(f) = f(0) + f(1)$, then $L(e_1 - x)$ = $(e_1(0) - x) + (e_1(1) - x)$ = $(0-x)+(1-x)=1-2x$.

<a id=Moments_of_Linear_Operators></a>

## "Moments" of Linear Operators

To examine the approximation behavior of linear operators, it is helpful to find the so-called "moments" of those operators, that is, the functions they map certain polynomials to.

For a linear operator $L$, they are:

- "Raw moments": The values of $L(e_i)(x)$ for each integer $i\ge 0$.
- "Central moments": The values of $L((e_1-x)^i)$ for each integer $i\ge 0$.  If raw moments $L(e_0), ..., L(e_j)$ are known, then $L((e_1-x)^j)$ is also known, thanks to proposition 5.6 of Gonska et al. (2006)[^8].
- "Absolute moments": The values of $L(\abs(e_1-x)^i)(x)$ for each integer $i\ge 0$.  When $i$ is even, $L(\text{abs}(e_1-x)^i)$ = $L((e_1-x)^i)$.

<a id=Taylor_Expansion_of_Linear_Operators></a>

## Taylor Expansion of Linear Operators

Let $f(\lambda)$ have a continuous $s$-th derivative on a closed interval, where $s$ is zero or a positive integer, and let $L(f)$ be a linear operator.  Then:

$$L_n(f)(\lambda) = L_n(R(f, \lambda)) + \sum_{i=0}^s L_n((e_1-\lambda)^i)(\lambda)\frac{f^{(i)}(\lambda)}{i!},$$

where $R(f,\lambda)$ is the remainder of $f$ after subtracting the degree-$s$ Taylor polynomial of $f$ centered at $\lambda$. (See also Piţul (2007, proof of theorem 5.8)[^9].)

<a id=Results_on_Error_Bounds></a>

## Results on Error Bounds

Some results on error bounds for certain classes of operators.

<a id=Whitney_s_Inequality></a>

### Whitney's Inequality

Let $n$ be zero or a positive integer, let $f(\lambda)$ be continuous on a closed interval $[a, b]$, and let $P$ be a polynomial of degree $n$ or less with the least maximum absolute difference between $f$ and the polynomial on that interval.  Then the error of $P$ in approximating $f$ is bounded as follows (see Babenko and Kryakin 2019[^1]):

$$\|f-P\|\_\infty\le W \cdot \omega_{n+1}(f,\frac{b-a}{n+1}),$$

where&mdash;

- $W$ is:
    - 1 if $n\le 7$.
    - $(2+\exp(-2)) (< 2.13534)$ if $n\ge 8$.
    - $3/4$ if $n=1$ and $f$ is convex (Singh Kaire and Prymak 2023/2025)[^2].
    - $1/2$ if $n=1$, $f$ is convex, and $a=-b$ (Singh Kaire and Prymak 2023/2025)[^2].
- $\|g\|_\infty$ is the maximum of the absolute value of (the continuous function) $g$ on $[a, b]$, and
- $\omega_{n}(f, h)$ is the modulus of continuity of $f$ of order $n$, with parameter $h$.

Using properties of the modulus of continuity (see Sevy 1991[^3], sec. 2.0.2; Gonska 1985[^4]), if $f$ has a continuous $(n+1)$-th derivative on $[a, b]$:

$$\|f-P\|_\infty\le W \cdot \left(\frac{b-a}{n+1}\right)^{n+1}\|f^{(n+1)}\|_\infty,$$

and if $f$ has a continuous $n$-th derivative on that interval:

$$\|f-P\|_\infty\le W \cdot \left(\frac{b-a}{n+1}\right)^n\omega_1(f^{(n)}, \frac{b-a}{n+1}).$$

<a id=Lebesgue_Inequality_for_Certain_Linear_Operators></a>

### Lebesgue Inequality for Certain Linear Operators

Let $f(\lambda)$ be a continuous function.  For any sequence of linear operators $(L_n)$ that map continuous functions to polynomials and reproduce all polynomials up to degree $m(n)$ (which depends on $n$), the following error bound (also known as _Lebesgue's lemma_ or the _Lebesgue inequality_) holds true for each $n$:

$$\text{abs}(L_n(f)(x) - f(x))\le(1+\|L_n\|)\cdot\max_t(\text{abs}(f(t)-P(t))),$$

where $\|\|L_n\|\|$ is the operator norm of $L_n$, and $P$ is a polynomial of degree up to $m(n)$ with the least maximum absolute difference between $f$ and the polynomial (see also DeVore and Lorentz (1993)[^5], Cheney (1996, chapter 6)[^6]).  But this error bound will generally be crude or trivial unless $L_n$ are nonpositive operators.  Indeed, the only positive linear operator $L$ that reproduces all polynomials up to degree 2 is the identity operator $L=f$.[^7]

Now let $f$ have a continuous third derivative on the closed unit interval.  Combining the previous inequality with the Whitney-type inequalities in the previous section leads to the following error bound for linear operators $L$ that map continuous functions to polynomials and reproduce all polynomials up to degree 2:

$$\text{abs}(L(f)(x) - f(x))\le(1+\|L\|)\cdot 1\cdot \left(\frac{1}{3}\right)^{3}\|f^{(3)}\|\_\infty$$

$$ = (1+\|L\|)\|f^{(3)}\|\_\infty/27.$$

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
<a id=Notes></a>

## Notes

[^1]: Babenko, Alexander G., and Yuriy V. Kryakin. "Special difference operators and the constants in the classical Jackson-type theorems." Topics in Classical and Modern Analysis: In Memory of Yingkang Hu. Cham: Springer International Publishing, 2019. 35-46.

[^2]: Jaskaran Singh Kaire and Andriy Prymak. "Whitney-type estimates for convex functions." arXiv preprint arXiv:2311.00912 (2023).

[^3]: Sevy, J., "Acceleration of convergence of sequences of simultaneous approximants", dissertation, Drexel University, 1991.

[^4]: H. H. Gonska, _Quantitative Approximation in C(X)_, Habilitationschrift, Universität Duisburg, 1985.

[^5]: R.A. DeVore and G.G. Lorentz, _Constructive Approximation_, 1993.

[^6]: E. W. Cheney, _Introduction to Approximation Theory_, 1998.

[^7]: Guessab, A., Nouisser, O. & Schmeisser, G. Enhancement of the algebraic precision of a linear operator and consequences under positivity. Positivity 13, 693–707 (2009). [**https://doi.org/10.1007/s11117-008-2253-4**](https://doi.org/10.1007/s11117-008-2253-4)

[^8]: Gonska, Heiner, Paula Piƫul, and Ioan Raşa. "On differences of positive linear operators." Carpathian Journal of Mathematics (2006): 65-78.

[^9]: Piţul, P., "Evaluation of the Approximation Order by Positive Linear Operators", dissertation, Universität Duisberg-Essen, 2007.
