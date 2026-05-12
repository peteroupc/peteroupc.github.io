# Notes on Approximation Theory

Some notes that may be useful when finding approximation error bounds that are explicit, with no hidden constants and without introducing transcendental or trigonometric functions.

The notes generally relate to error bounds on how close a polynomial is to a single-variable function on a closed interval.  The mapping from a function to a function (in this case, from a single-variable function to a polynomial "close" to it) is called an _operator_, and operators involved in these error bounds are often linear operators, whose behavior is relatively simple to examine.

<a id=Contents></a>

## Contents

- [**Contents**](#Contents)
- [**Definitions**](#Definitions)
- [**"Moments" of Linear Operators**](#Moments_of_Linear_Operators)
- [**Taylor Expansion of Linear Operators**](#Taylor_Expansion_of_Linear_Operators)
- [**Results on Error Bounds**](#Results_on_Error_Bounds)
    - [**Whitney's Inequality**](#Whitney_s_Inequality)
    - [**Lebesgue Inequality for Certain Linear Operators**](#Lebesgue_Inequality_for_Certain_Linear_Operators)
- [**Example**](#Example)
- [**License**](#License)
- [**Notes**](#Notes)

<a id=Definitions></a>

## Definitions

The _closed unit interval_ (written as \[0, 1\]) means the set consisting of 0, 1, and every real number in between.

For definitions of _continuous_, _derivative_, _convex_, _concave_, _Hölder continuous_, and _Lipschitz continuous_, see the definitions section in "[**Supplemental Notes for Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernsupp.html#Definitions)".

- An _operator_ is a mapping from functions to functions.
- An operator $L$ is _linear_ if it satisfies $L(af)=aL(f)$ and $L(f+g)=L(f)+L(g)$ for all input functions $f$ and $g$ and every real number $a$.
- An operator $L$ is _positive_ if it has the property that, if $f$ is nonnegative on its domain, so is $L(f)$, for every input function $f$.
- The _operator norm_ of an operator $L$ is the maximum absolute value of $L(f)$ over all input functions $f$ with maximum absolute value 1 or less.  This assumes $L$ takes only continuous functions.
- In this document, $e_i$ is a function such that $e_i(t) = t^i$, so that $e_1(t) = t$; as an example, if $L(f) = f(0) + f(1)$, then $L(e_1 - x)$ = $(e_1(0) - x) + (e_1(1) - x)$ = $(0-x)+(1-x)=1-2x$.

<a id=Moments_of_Linear_Operators></a>

## "Moments" of Linear Operators

To examine the approximation behavior of linear operators, it is helpful to find the so-called "moments" of those operators, that is, the functions they map certain polynomials to.

For a linear operator $L$, they are:

- "Raw moments": The values of $L(e_i)(x)$ for each integer $i\ge 0$.
- "Central moments": The values of $L((e_1-x)^i)$ for each integer $i\ge 0$.  If the "raw moments" $L(e_0), ..., L(e_j)$ are known, then $L((e_1-x)^j)$ is also known, thanks to proposition 5.6 of Gonska et al. (2006)[^1].
- "Absolute moments": The values of $L(\text{abs}(e_1-x)^i)(x)$ for each integer $i\ge 0$.  When $i$ is even, $L(\text{abs}(e_1-x)^i)$ = $L((e_1-x)^i)$.

<a id=Taylor_Expansion_of_Linear_Operators></a>

## Taylor Expansion of Linear Operators

Let $f(\lambda)$ have a continuous $s$-th derivative on a closed interval, where $s$ is zero or a positive integer, and let $L(f)$ be a linear operator.  Then:

$$L_n(f)(\lambda) = L_n(R(f, \lambda)) + \sum_{i=0}^s L_n((e_1-\lambda)^i)(\lambda)\frac{f^{(i)}(\lambda)}{i!},$$

where $R(f,\lambda)$ is the remainder of $f$ after subtracting the degree-$s$ Taylor polynomial of $f$ centered at $\lambda$. (See also Piţul (2007, proof of theorem 5.8)[^2].)

<a id=Results_on_Error_Bounds></a>

## Results on Error Bounds

Some results on error bounds for certain classes of operators.

<a id=Whitney_s_Inequality></a>

### Whitney's Inequality

Let $n$ be zero or a positive integer, let $f(\lambda)$ be continuous on a closed interval $[a, b]$, and let $P$ be a polynomial of degree $n$ or less with the least maximum absolute difference between $f$ and the polynomial on that interval.  Then the error of $P$ in approximating $f$ is bounded as follows (see Babenko and Kryakin 2019[^3]):

$$\|f-P\|_\infty\le W \cdot \omega_{n+1}(f,\frac{b-a}{n+1}),$$

where&mdash;

- $W$ is:
    - 1 if $n\le 7$.
    - $(2+\exp(-2)) (< 2.13534)$ if $n\ge 8$.
    - $3/4$ if $n=1$ and $f$ is convex (Singh Kaire and Prymak 2023/2025)[^4].
    - $1/2$ if $n=1$, $f$ is convex, and $a=-b$ (Singh Kaire and Prymak 2023/2025)[^4].
- $\|\|g\|\|_\infty$ is the maximum of the absolute value of (the continuous function) $g$ on $[a, b]$, and
- $\omega_{n}(f, h)$ is the modulus of continuity of $f$ of order $n$, with parameter $h$.

Using properties of the modulus of continuity (see Sevy 1991[^5], sec. 2.0.2; Gonska 1985[^6]), if $f$ has a continuous $(n+1)$-th derivative on $[a, b]$:

$$\|f-P\|_\infty\le W \cdot \left(\frac{b-a}{n+1}\right)^{n+1}\|f^{(n+1)}\|_\infty,$$

and if $f$ has a continuous $n$-th derivative on that interval:

$$\|f-P\|_\infty\le W \cdot \left(\frac{b-a}{n+1}\right)^n\omega_1(f^{(n)}, \frac{b-a}{n+1}).$$

<a id=Lebesgue_Inequality_for_Certain_Linear_Operators></a>

### Lebesgue Inequality for Certain Linear Operators

Let $f(\lambda)$ be a continuous function on a closed interval.  For any sequence of linear operators $(L_n)$ that map continuous functions to polynomials and reproduce all polynomials up to degree $m(n)$ (which depends on $n$), the following error bound (also known as _Lebesgue's lemma_ or the _Lebesgue inequality_) holds true for each $n$:

$$\text{abs}(L_n(f)(x) - f(x))\le(1+\|L_n\|)\cdot\max_t(\text{abs}(f(t)-P(t))),$$

where $\|\|L_n\|\|$ is the operator norm of $L_n$, and $P$ is a polynomial of degree up to $m(n)$ with the least maximum absolute difference between $f$ and the polynomial (see also DeVore and Lorentz (1993)[^7], Cheney (1996, chapter 6)[^8]).  But this error bound will generally be crude or trivial unless $L_n$ are nonpositive operators.  Indeed, the only positive linear operator $L$ that reproduces all polynomials up to degree 2 is the identity operator $L=f$.[^9]

Now let $f$ have a continuous third derivative on the closed unit interval.  Combining the previous inequality with the Whitney-type inequalities in the previous section leads to the following error bound for linear operators $L$ that map continuous functions to polynomials and reproduce all polynomials up to degree 2:

$$\text{abs}(L(f)(x) - f(x))\le(1+\|L\|)\cdot 1\cdot \left(\frac{1}{3}\right)^{3}\|f^{(3)}\|\_\infty$$

$$ = (1+\|L\|)\|f^{(3)}\|\_\infty/27.$$

<a id=Example></a>

## Example

In this section, a polynomial $P(x)$ is written in _Bernstein form of degree $n$_ if it is written as&mdash;

$$P(x)=\sum_{k=0}^n a_k \frac{n!}{(k!)((n-k)!)} x^k (1-x)^{n-k},$$

where the real numbers $a_0, ..., a_n$ are the polynomial's _Bernstein coefficients_.

The degree-$n$ _Bernstein polynomial_ of an arbitrary function $f(x)$ has Bernstein coefficients $a_k = f(k/n)$.  In general, this Bernstein polynomial differs from $f$ even if $f$ is a polynomial.  In this section, the degree-$n$ Bernstein polynomial of $f$ is denoted $B_n(f)$. $B_n(f)$ is a positive linear operator.

-----------

Let $L_n(f)$ be a (nonpositive) linear operator described as follows.  The functions it maps to and from lie on the closed unit interval.

Let $W_n=2f-B_n(f)$.  Then $B_n(W_n(f))$ is a (nonpositive) linear operator that is the iterated Boolean sum of degree-$n$ Bernstein polynomials, with one iteration; see Güntürk and Li (2021a, Theorem 5)[^10].  That paper, among others (for example, Micchelli 1973[^13]), showed that $B_n(W_n(f))=O(1/n^{3/2})$ if $f$ has a continuous third derivative. ($O(1/n^{3/2})$ means a function no greater than a constant times $1/n^{3/2}$ for all sufficiently large values of $n$.)

$L_n(f)$ is then based on $W_n(f)$ and is a special case of [**a conjecture I have**](https://peteroupc.github.io/bernsupp.html#A_Conjecture_on_Polynomial_Approximation) on polynomial approximation.  Let $k=2n\lambda$, where $0\le\lambda\le 1$.  Let&mdash;

$$L_n(f)(\lambda) = \sum_{i=0}^n\left((2f\left(\frac{k}{2n}\right) - B_{2n}(f)\left(\frac{k}{2n}\right)) - (2f\left(\frac{i}{n}\right) - B_n(f)\left(\frac{i}{n}\right))\right) \sigma_{n,k,i}$$

$$= \mathbb{E}\left[(2f\left(\frac{k}{2n}\right) - B_{2n}(f)\left(\frac{k}{2n}\right)) - (2f\left(\frac{X_k}{n}\right) - B_n(f)\left(\frac{X_k}{n}\right))\right]$$

$$= \sum_{i=0}^n\left((2f\left(\frac{k}{2n}\right) + B_{n}(f)\left(\frac{i}{n}\right))\right)\sigma_{n,k,i} - \sum_{i=0}^n \left((2f\left(\frac{i}{n}\right) + B_{2n}(f)\left(\frac{k}{n}\right))\right) \sigma_{n,k,i}$$

$$= LA_n(f)(\lambda) - LB_n(f)(\lambda).$$

Here, $\sigma_{n,k,i}$ equals ${n\choose i}{n\choose {k-i}}/{2n \choose k}$ and is the probability of getting $i$.  (This is the probability of a hypergeometric($2n$, $k$, $n$) random variable.) Meanwhile, $LA_n$ and $LB_n$ are positive linear operators, making it easier to assess their approximation properties.

It will be shown that, if $f$ has a continuous third derivative, the rate of $\text{abs}(L_n)$ is $O(M/n^{3/2})$, where $M$ is the maximum absolute value of $f$ and its derivatives up to the third derivative.  The proof of this relies on exact expressions of the values $L_n((e_1-x)^i)$ (or $L_n(e_i)$) and $(LA_n+LB_n)((e_1-x)^i)$ (or $(LA_n+LB_n)(e_i)$), for $0\le i\le 4$.

The following are some of these values and those for related operators:

- $L_n(e_0)(x) = L_n((e_1-x)^0)(x) = 0$.
- $L_n(e_1)(x) = L_n((e_1-x)^1)(x) = 0$.
- $L_n(e_2)(x) = L_n((e_1-x)^2)(x)$ = $3x(x - 1)/(2n(2n-1))$ = $O(1/n^2)$.
- $L_n(e_3)(x)$ = $n^3 x^2(2nx - 4x + 3)/(2n - 1)$.
- $LA_n((e_1-x)^2)(x)$ = $-x(3n - 2)\cdot(x - 1)/(n(2n-1))$ = $O(1/n)$.
- $LB_n((e_1-x)^2)(x)$ = $-x(6n - 1)\cdot(x - 1)/(2n(2n-1))$ = $O(1/n)$.
- $(LA_n+LB_n)((e_1-x)^2)(x)$ = $LA_n(\text{abs}(e_1-x)^2)(x) + LB_n(\text{abs}(e_1-x)^2)(x)$ = $-x(12n - 5)\cdot(x - 1)/(2n(2n - 1)) = O(1/n)$.

To find values like those just listed, it is useful to calculate raw moments (Wang et al. 2023)[^11] and central moments (Weisstein)[^12] of hypergeometric random variables.  Let $X_k$ be a hypergeometric random variable.  If $g(y)=W_{2n}(e_r;k/(2n))-W_n(e_r;y)$ is a polynomial in $y$ of degree $r$ or less, then $L_n(e_r)$ can be found using a Taylor expansion, namely as&mdash;

$$L_n(e_r) = \sum_{i=0}^r \mathbb{E}[(X_k/n-\mathbb{E}[X_k/n])^i]\frac{g^{(i)}(\mathbb{E}[X_k/n])}{i!}$$

$$= \sum_{i=0}^r \frac{\mathbb{E}[(X_k-\mathbb{E}X_k)^i]}{n^i}\frac{g^{(i)}(k/(2n))}{i!},$$

where the derivatives are taken with respect to $y$, and where $\mathbb{E}[(X_k-\mathbb{E}[X_k])^i]$ is the $i$-th central moment of $X_k$.

In the following, the notation $\|\|f\|\|$ means $\max_{0\le\lambda\le 1}(\text{abs}(f(\lambda)))$.

The first step is to find the Taylor expansion of $L_n(f)(\lambda)$. Given that $L_n((e_1-x)^0)(x)$ = $L_n((e_1-x)^1)(x)$ = 0, this becomes:

$$L_n(f)(\lambda) = L_n(R(f, \lambda)) + \sum_{i=2}^3 L_n((e_1-\lambda)^i)(\lambda)\frac{f^{(i)}(\lambda)}{i!},$$

$$\text{abs}(L_n(f)(\lambda)) \le \|L_n(R(f, \lambda))\|+ \|L_n((e_1-\lambda)^2)\| \|f^{(2)}\|/2$$

$$+ \|L_n((e_1-\lambda)^3)\| \|f^{(3)}\|/6.$$

The function $\text{abs}(L_n((e_1-x)^3)(x))$ has its maximum at $x=1/2-\sqrt{3}/6$; and $\text{abs}(L_n((e_1-x)^2)(x))$ has its maximum at $x=1/2$, so:

$$\text{abs}(L_n(f)(\lambda)) \le \|L_n(R(f, \lambda))\| + \text{abs}(\frac{3\lambda(\lambda - 1)}{2n(2n-1)})\|f^{(2)}\|/2$$

$$ + \|L_n((e_1-\lambda)^3)\| \|f^{(3)}\|/6$$

$$ \le \|L_n(R(f, \lambda))\| + \frac{3}{8n(2n-1)}\|f^{(2)}\|/2$$

$$ + \frac{\sqrt{3} (6 n - 5)}{24 n^{2} (2 n - 1)}\|f^{(3)}\|/6.$$

Meanwhile the remainder is estimated as follows, using the proof of corollary 2.3 of Gonska et al. (2006)[^1]\:

$$\|L_n(R(f, \lambda))\|\le \frac{1}{6} \|f^{(3)}\| \|(LA_n+LB_n)(\text{abs}(e_1-\lambda)^3)\|.$$

In turn, using Schwarz's inequality (see proof of the same paper's corollary 2.1):

$$\|(LA_n+LB_n)(\text{abs}(e_1-\lambda)^3)\|\le (\|(LA_n+LB_n)((e_1-\lambda)^4)\|)^{1/2}$$

$$\times (\|(LA_n+LB_n)((e_1-\lambda)^2)\|)^{1/2} \le \frac{3\sqrt{3}}{8n^{3/2}}.$$

(The expression in the middle takes its maximum at $\lambda = 1/2$; the right-hand side is an upper bound of that expression for all positive integers $n$.) Altogether:

$$\|L_n(f)\| \le \frac{3}{8n(2n-1)}\frac{1}{2}\|f^{(2)}\|$$

$$ + \left(\frac{3\sqrt{3}}{8n^{3/2}} + \frac{\sqrt{3} (6 n - 5)}{24 n^{2} (2 n - 1)}\right)\frac{1}{6}\|f^{(3)}\| = LC_n(f)$$

$$\le 0.1875 \frac{\|f^{(2)}\|}{n^{3/2}} + \frac{5\sqrt{3}}{72} \frac{\|f^{(3)}\|}{n^{3/2}} \le \frac{0.3078 M}{n^{3/2}} = O(1/n^{3/2}).$$

If $n\ge 2$ is an integer, $LC_n(f)\le 0.2165 M/n^{3/2}$.

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
<a id=Notes></a>

## Notes

[^1]: Gonska, Heiner, Paula Piƫul, and Ioan Raşa. "On differences of positive linear operators." Carpathian Journal of Mathematics (2006): 65-78.

[^2]: Piţul, P., "Evaluation of the Approximation Order by Positive Linear Operators", dissertation, Universität Duisberg-Essen, 2007.

[^3]: Babenko, Alexander G., and Yuriy V. Kryakin. "Special difference operators and the constants in the classical Jackson-type theorems." Topics in Classical and Modern Analysis: In Memory of Yingkang Hu. Cham: Springer International Publishing, 2019. 35-46.

[^4]: Jaskaran Singh Kaire and Andriy Prymak. "Whitney-type estimates for convex functions." arXiv preprint arXiv:2311.00912 (2023).

[^5]: Sevy, J., "Acceleration of convergence of sequences of simultaneous approximants", dissertation, Drexel University, 1991.

[^6]: H. H. Gonska, _Quantitative Approximation in C(X)_, Habilitationschrift, Universität Duisburg, 1985.

[^7]: R.A. DeVore and G.G. Lorentz, _Constructive Approximation_, 1993.

[^8]: E. W. Cheney, _Introduction to Approximation Theory_, 1998.

[^9]: Guessab, A., Nouisser, O. & Schmeisser, G. Enhancement of the algebraic precision of a linear operator and consequences under positivity. Positivity 13, 693–707 (2009). [**https://doi.org/10.1007/s11117-008-2253-4**](https://doi.org/10.1007/s11117-008-2253-4)

[^10]: Güntürk, C. Sinan, and Weilin Li. "[**Approximation with one-bit polynomials in Bernstein form**](https://arxiv.org/pdf/2112.09183)", arXiv:2112.09183 (2021); Constructive Approximation, pp.1-30 (2022).

[^11]: Wang, Y.Q., Zhang, Y.Y, Liu, J.L., "Expectation identity of the hypergeometric distribution and its application in the calculations of high-order origin moments",Communications in Statistics--Theory and Methods 52(17), 2023. [**https://doi.org/10.1080/03610926.2021.2024235**](https://doi.org/10.1080/03610926.2021.2024235)

[^12]: Weisstein, Eric W. "Central Moment." From MathWorld--A Wolfram Resource. [**https://mathworld.wolfram.com/CentralMoment.html**](https://mathworld.wolfram.com/CentralMoment.html)

[^13]: Micchelli, Charles. "[**The saturation class and iterates of the Bernstein polynomials**](https://www.sciencedirect.com/science/article/pii/0021904573900282)", Journal of Approximation Theory 8, no. 1 (1973): 1-18.
