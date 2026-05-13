# Notes on Approximation Theory

Some notes that may be useful when finding approximation error bounds that are explicit, with no hidden constants and without introducing transcendental or trigonometric functions.

The notes generally relate to error bounds on how close a polynomial is to a single-variable function on a closed interval.  The mapping from a function to a function (in this case, from a single-variable function to a polynomial "close" to it) is called an _operator_, and operators involved in these error bounds are often linear operators, whose behavior is relatively simple to examine.

<a id=Contents></a>

## Contents

- [**Contents**](#Contents)
- [**Definitions**](#Definitions)
- [**Bernstein Form and Bernstein Polynomials**](#Bernstein_Form_and_Bernstein_Polynomials)
- [**"Moments" of Linear Operators**](#Moments_of_Linear_Operators)
    - [**"Moments" of Bernstein Polynomials**](#Moments_of_Bernstein_Polynomials)
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

- An _operator_ is a mapping from a function to a function.
- An operator $L$ is _linear_ if it satisfies $L(af)=aL(f)$ and $L(f+g)=L(f)+L(g)$ for all input functions $f$ and $g$ and every real number $a$.
- An operator $L$ is _positive_ if it has the property that, if $f$ is nonnegative on its domain, so is $L(f)$, for every input function $f$.[^1]
- The _operator norm_ of an operator $L$ is the maximum absolute value of $L(f)$ over all input functions $f$ with maximum absolute value 1 or less.  This assumes $L$ takes only continuous functions.
- In this document, $e_i$ is a function such that $e_i(t) = t^i$, so that $e_0(t) = 1$ and $e_1(t) = t$; as an example, if $L(f) = f(0) + f(1)$, then $L(e_1 - x)$ = $(e_1(0) - x) + (e_1(1) - x)$ = $(0-x)+(1-x)=1-2x$.

<a id=Bernstein_Form_and_Bernstein_Polynomials></a>

## Bernstein Form and Bernstein Polynomials

Among the best known examples of linear operators are the Bernstein polynomials.

In this document, a polynomial $P(x)$ is written in _Bernstein form of degree $n$_ if it is written as&mdash;

$$P(x)=\sum_{k=0}^n a_k \frac{n!}{(k!)((n-k)!)} x^k (1-x)^{n-k},$$

where the real numbers $a_0, ..., a_n$ are the polynomial's _Bernstein coefficients_.[^2]

The degree-$n$ _Bernstein polynomial_ of an arbitrary function $f(x)$ has Bernstein coefficients $a_k = f(k/n)$.  In general, this Bernstein polynomial differs from $f$ even if $f$ is a polynomial.  In this document, the degree-$n$ Bernstein polynomial of $f$ is denoted $B_n(f)$. $B_n(f)$ is a positive linear operator.

<a id=Moments_of_Linear_Operators></a>

## "Moments" of Linear Operators

To examine the approximation behavior of linear operators, it is helpful to find the so-called "moments" of those operators, that is, the functions they map certain polynomials to.

For a linear operator $L$, they are:

- "Raw moments": The values of $L(e_i)$ for each integer $i\ge 0$.
- "Central moments": The values of $L((e_1-x)^i)$ for each integer $i\ge 0$.  If the "raw moments" $L(e_0), ..., L(e_j)$ are known, then $L((e_1-x)^j)$ is also known, thanks to proposition 5.6 of Gonska et al. (2006)[^3].
- "Absolute moments": The values of $L(\text{abs}(e_1-x)^i)(x)$ for each integer $i\ge 0$.  When $i$ is even, $L(\text{abs}(e_1-x)^i)$ = $L((e_1-x)^i)$.

Because $L$ is linear, if $L(e_i) = e_i$ for each $i$ from 0 through $j$, then $L$ _reproduces all polynomials_ up to degree $j$ (that is, $L(f) = f$ whenever $f$ is a polynomial of degree $j$ or less).

<a id=Moments_of_Bernstein_Polynomials></a>

### "Moments" of Bernstein Polynomials

The following results deal with useful quantities when discussing the error in approximating a function by Bernstein polynomials.

Suppose a coin shows heads with probability $p$, and $n$ independent tosses of the coin are made, where $n$ is 1 or greater.  Then the total number of heads $X$ follows a _binomial distribution_.  The following are useful quantities of this distribution.

- $T_{n,r}$: The _central moment_ of $X$ is denoted $T_{n,r}(p)$ = $\mathbb{E}[(X-\mathbb{E}[X])^r]$ = $B_n((e_1-p)^r)(p)\cdot n^r$. (In this section, $\mathbb{E}[Y]$ is the expected value [or mean or “long-run average”] of the random variable $Y$.)  Formulas for computing this central moment are given in Skorski (2024)[^23].
- $S_{n,r}$: Traditionally, the central moment of $X/n$ or the ratio of heads to tosses is denoted $S_{n,r}(p)$ = $T_{n,r}(p)/n^r$ = $\mathbb{E}[(X/n-\mathbb{E}[X/n])^r]$ = $B_n((e_1-p)^r)(p)$.  ($T$ and $S$ are notations of S.N. Bernstein, known for Bernstein polynomials.) $S_{n,r}$ is thus the $r$-th "central moment" of degree-$n$ Bernstein polynomials.
- $M_{n,r}$: The $r$-th _central absolute moment_ of $X/n$ is denoted $M_{n,r}(p)$ = $\mathbb{E}[\text{abs}(X/n-\mathbb{E}[X/n])^r]$ = $B_n(\text{abs}(e_1-p)^r)(p)$.  If $r$ is even, $M_{n,r}(p) = S_{n,r}(p)$. $M_{n,r}$ is thus the $r$-th "absolute moment" of degree-$n$ Bernstein polynomials.

The following gives bounds on $M_{n,r}$; some results in approximation theory rely on bounds like these.

**Proposition 1**: _Let $r\ge 0$, and let $\sigma(r,t) = (r!)/(((r/2)!)t^{r/2})$.  Then for values of $r$ and $n$ described in the following table,_ $M_{n, r}(p)\le \mu_{n,r}/n^{r/2}$, _where_ $\mu_{n,r}$ _is as given in the table._

| If $r$... |  Then $\mu_{n,r}$ is...  |
 --- | ---- |
| Is an even integer. | $\sigma(r,6)$, for every integer $n\ge 1$. |
| Is an even integer, but not greater than 44. |  $\sigma(r,8)$, for every integer $n\ge 1$. |
| Is 1. | $1/2$, for every integer $n\ge 1$. |
| Is odd, and $3\le r\le 43$. | $\sqrt{\sigma(r-1,8)\sigma(r+1,8)} = r^{1/2}(r-1)! / (2\cdot 8^{(r-1)/2}((r-1)/2)!)$, for every integer $n\ge 2$. |
| Is odd and greater than 43. | $\sqrt{\sigma(r-1,6)\sigma(r+1,6)}$, for every integer $n\ge 2$. |

_Proof:_ The first row comes from a result of Adell and Cárdenas-Morales (2018)[^4].  The second row is an improved result of the first, from Molteni (2022)[^5].  The third row follows from Cheng (1983)[^6].  The fourth and fifth rows follow from the first and second as well as that the absolute central moment for odd $r$ can be bounded for every integer $n\ge 2$, using Schwarz's inequality (Weisstein)[^7] \(see also Bojanić and Shisha 1975[^8] for the case $r=4$). &#x25a1;

<a id=Taylor_Expansion_of_Linear_Operators></a>

## Taylor Expansion of Linear Operators

Let $f(\lambda)$ have a continuous $s$-th derivative on a closed interval, where $s$ is zero or a positive integer, and let $L(f)$ be a linear operator.  Then:

$$L_n(f)(\lambda) = L_n(R(f, \lambda)) + \sum_{i=0}^s L_n((e_1-\lambda)^i)(\lambda)\frac{f^{(i)}(\lambda)}{i!}, \tag{1}$$

where $R(f,\lambda)$ is the remainder of $f$ after subtracting the degree-$s$ Taylor polynomial of $f$ centered at $\lambda$. (See also Piţul (2007, proof of theorem 5.8)[^9].)

In the case that $L$ is positive, upper bounds for $L_n(R(f,\lambda))$ are given by Păltănea and Smuc (2019)[^10].

Finding such upper bounds is harder if $L$ is not positive.  This situation can be helped if $L$ can be written as a difference between two positive linear operators $LA$ and $LB$, so that $L(f) = LA(f) - LB(f)$.  See the "Example" section later in this document.

<a id=Results_on_Error_Bounds></a>

## Results on Error Bounds

Some results on error bounds for certain classes of operators.

<a id=Whitney_s_Inequality></a>

### Whitney's Inequality

Let $n$ be zero or a positive integer, let $f(\lambda)$ be continuous on a closed interval $[a, b]$, and let $P$ be a polynomial of degree $n$ or less with the least maximum absolute difference between $f$ and the polynomial on that interval.  Then the error of $P$ in approximating $f$ is bounded as follows (see Babenko and Kryakin 2019[^11]):

$$\|f-P\|_\infty\le W \cdot \omega_{n+1}(f,\frac{b-a}{n+1}),$$

where&mdash;

- $W$ is:
    - 1 if $n\le 7$.
    - $(2+\exp(-2)) (< 2.13534)$ if $n\ge 8$.
    - $3/4$ if $n=1$ and $f$ is convex (Singh Kaire and Prymak 2023/2025)[^12].
    - $1/2$ if $n=1$, $f$ is convex, and $a=-b$ (Singh Kaire and Prymak 2023/2025)[^12].
- $\|\|g\|\|_\infty$ is the maximum of the absolute value of (the continuous function) $g$ on $[a, b]$, and
- $\omega_{n}(f, h)$ is the smallest modulus of continuity of $f$ of order $n$, with parameter $h$.

Using properties of moduli of continuity (see Sevy 1991[^13], sec. 2.0.2; Gonska 1985[^14]), if $f$ has a continuous $(n+1)$-th derivative on $[a, b]$:

$$\|f-P\|_\infty\le W \cdot \left(\frac{b-a}{n+1}\right)^{n+1}\|f^{(n+1)}\|_\infty,$$

and if $f$ has a continuous $n$-th derivative on that interval:

$$\|f-P\|_\infty\le W \cdot \left(\frac{b-a}{n+1}\right)^n\omega_1(f^{(n)}, \frac{b-a}{n+1}).$$

<a id=Lebesgue_Inequality_for_Certain_Linear_Operators></a>

### Lebesgue Inequality for Certain Linear Operators

Let $f(\lambda)$ be a continuous function on a closed interval.  For any sequence of linear operators $(L_n)$ that map continuous functions to polynomials and reproduce all polynomials up to degree $m(n)$ (which depends on $n$), the following error bound (also known as _Lebesgue's lemma_ or the _Lebesgue inequality_) holds true for each $n$:

$$\text{abs}(L_n(f)(x) - f(x))\le(1+\|L_n\|)\cdot\max_t(\text{abs}(f(t)-P(t))),$$

where $\|\|L_n\|\|$ is the operator norm of $L_n$, and $P$ is a polynomial of degree up to $m(n)$ with the least maximum absolute difference between $f$ and the polynomial (see also DeVore and Lorentz (1993)[^15], Cheney (1996, chapter 6)[^16]).  But this error bound will generally be crude or trivial unless $L_n$ are nonpositive operators.  Indeed, the only positive linear operator $L$ that reproduces all polynomials up to degree 2 is the identity operator $L=f$.[^17]

Now let $f$ have a continuous third derivative on the closed unit interval.  Combining the previous inequality with the Whitney-type inequalities in the previous section leads to the following error bound for linear operators $L$ that map continuous functions to polynomials and reproduce all polynomials up to degree 2:

$$\text{abs}(L(f)(x) - f(x))\le(1+\|L\|)\cdot 1\cdot \left(\frac{1}{3}\right)^{3}\|f^{(3)}\|_\infty$$

$$ = (1+\|L\|)\|f^{(3)}\|_\infty/27.$$

<a id=Example></a>

## Example

This example shows how to find a linear operator's bounds.

Let $L_n(f)$ be a linear operator inspired by [**a conjecture I have**](https://peteroupc.github.io/bernsupp.html#A_Conjecture_on_Polynomial_Approximation) on polynomial approximation.  It is described as follows:

$$L_n(f)(\lambda) = \sum_{i=0}^n \left( W_{2n}\left(f\right)\left(\frac{k}{2n}\right) - W_n\left(f\right)\left(\frac{i}{n}\right)\right)\sigma_{n,k,i}$$

$$=\mathbb{E}\left[W_{2n}\left(f\right)\left(\frac{k}{2n}\right) - W_n\left(f\right)\left(\frac{X_k}{n}\right)\right],$$

where:

- $k = 2n\lambda$, where $0\le\lambda\le 1$.
- $W_n(f)$ is a linear operator that approaches $f$ as $n$ increases.[^18]
- $X_k$ is a hypergeometric($2n$, $k$, $n$) random variable.
- $\sigma_{n,k,i}$ equals ${n\choose i}{n\choose {k-i}}/{2n \choose k}$ and is the probability that $X_k$ equals $i$.
- $\mathbb{E}[Y]$ is the expected value (or mean or “long-run average”) of the random variable $Y$.

$L_n$ and $W_n$ are generally nonpositive operators.  As an example, take $W_n=2f-B_n(f)$.  Then $B_n(W_n(f))$ is a linear operator that is the iterated Boolean sum of degree-$n$ Bernstein polynomials, with one iteration; see Güntürk and Li (2021a, Theorem 5)[^19].  That paper, among others (for example, Micchelli 1973[^20]), showed that this operator approaches $f$ at the rate $O(1/n^{3/2})$ if $f$ has a continuous third derivative. ("$O(1/n^{3/2})$" means the error is no greater than a constant times $1/n^{3/2}$ for all values of $n$.)

With this choice of $W_n$, $L_n$ becomes:

$$L_n(f)(\lambda) = \sum_{i=0}^n\left((2f\left(\frac{k}{2n}\right) - B_{2n}(f)\left(\frac{k}{2n}\right)) - (2f\left(\frac{i}{n}\right) - B_n(f)\left(\frac{i}{n}\right))\right) \sigma_{n,k,i}$$

$$= \mathbb{E}\left[(2f\left(\frac{k}{2n}\right) - B_{2n}(f)\left(\frac{k}{2n}\right)) - (2f\left(\frac{X_k}{n}\right) - B_n(f)\left(\frac{X_k}{n}\right))\right]$$

$$= \sum_{i=0}^n\left((2f\left(\frac{k}{2n}\right) + B_{n}(f)\left(\frac{i}{n}\right))\right)\sigma_{n,k,i} - \sum_{i=0}^n \left((2f\left(\frac{i}{n}\right) + B_{2n}(f)\left(\frac{k}{n}\right))\right) \sigma_{n,k,i}$$

$$= LA_n(f)(\lambda) - LB_n(f)(\lambda).$$

Here, $LA_n$ and $LB_n$ are positive linear operators, making it easier to assess their approximation properties.

It will be shown that, if $f$ has a continuous third derivative, the rate of $L_n$ towards zero is $O(M/n^{3/2})$, where $M$ is the maximum absolute value of $f$ and its derivatives up to the third derivative.  The proof of this relies on exact expressions of $L_n$'s [**"raw moments" and "central moments"**](#Moments_of_Linear_Operators), and those for the combined operator $(LA_n+LB_n)$.

The following are some of these values and those for related operators:

- $L_n(e_0)(x) = L_n((e_1-x)^0)(x) = 0$.
- $L_n(e_1)(x) = L_n((e_1-x)^1)(x) = 0$.
- $L_n(e_2)(x) = L_n((e_1-x)^2)(x)$ = $3x(x - 1)/(2n(2n-1))$ = $O(1/n^2)$.
- $L_n(e_3)(x)$ = $n^3 x^2(2nx - 4x + 3)/(2n - 1)$.
- $LA_n((e_1-x)^2)(x)$ = $-x(3n - 2)\cdot(x - 1)/(n(2n-1))$ = $O(1/n)$.
- $LB_n((e_1-x)^2)(x)$ = $-x(6n - 1)\cdot(x - 1)/(2n(2n-1))$ = $O(1/n)$.
- $(LA_n+LB_n)((e_1-x)^2)(x)$ = $LA_n(\text{abs}(e_1-x)^2)(x) + LB_n(\text{abs}(e_1-x)^2)(x)$ = $-x(12n - 5)\cdot(x - 1)/(2n(2n - 1)) = O(1/n)$.

To find values like those just listed, it is useful to calculate raw moments (Wang et al. 2023)[^21] and central moments (Weisstein)[^22] of hypergeometric random variables (such as $X_k$).  Indeed, if $g(y)=W_{2n}(e_r;k/(2n))-W_n(e_r;y)$ is a polynomial in $y$ of degree $r$ or less, then $L_n(e_r)$ can be found using a Taylor expansion, namely as&mdash;

$$L_n(e_r) = \sum_{i=0}^r \mathbb{E}[(X_k/n-\mathbb{E}[X_k/n])^i]\frac{g^{(i)}(\mathbb{E}[X_k/n])}{i!}$$

$$= \sum_{i=0}^r \frac{\mathbb{E}[(X_k-\mathbb{E}[X_k])^i]}{n^i}\frac{g^{(i)}(k/(2n))}{i!},$$

where the derivatives are taken with respect to $y$, and where $\mathbb{E}[(X_k-\mathbb{E}[X_k])^i]$ is the $i$-th central moment of $X_k$.

In the following, the notation $\|\|f\|\|$ means $\max_{0\le\lambda\le 1}(\text{abs}(f(\lambda)))$.

The first step is to [**find the Taylor expansion**](#Taylor_Expansion_of_Linear_Operators) of $L_n(f)(\lambda)$. Given that $L_n((e_1-x)^0)(x)$ = $L_n((e_1-x)^1)(x)$ = 0, this becomes:

$$L_n(f)(\lambda) = L_n(R(f, \lambda)) + \sum_{i=2}^3 L_n((e_1-\lambda)^i)(\lambda)\frac{f^{(i)}(\lambda)}{i!},$$

$$\text{abs}(L_n(f)(\lambda)) \le \|L_n(R(f, \lambda))\|+ \|L_n((e_1-\lambda)^2)\| \|f^{(2)}\|/2$$

$$+ \|L_n((e_1-\lambda)^3)\| \|f^{(3)}\|/6.$$

The function $\text{abs}(L_n((e_1-x)^3)(x))$ has its maximum at $x=1/2-\sqrt{3}/6$; and $\text{abs}(L_n((e_1-x)^2)(x))$ has its maximum at $x=1/2$, so:

$$\text{abs}(L_n(f)(\lambda)) \le \|L_n(R(f, \lambda))\| + \text{abs}(\frac{3\lambda(\lambda - 1)}{2n(2n-1)})\|f^{(2)}\|/2$$

$$ + \|L_n((e_1-\lambda)^3)\| \|f^{(3)}\|/6$$

$$ \le \|L_n(R(f, \lambda))\| + \frac{3}{8n(2n-1)}\|f^{(2)}\|/2$$

$$ + \frac{\sqrt{3} (6 n - 5)}{24 n^{2} (2 n - 1)}\|f^{(3)}\|/6.$$

Meanwhile the remainder is estimated as follows, using the proof of corollary 2.3 of Gonska et al. (2006)[^3]\:

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

[^1]: A better term for positive operators is probably nonnegativity-preserving operators.

[^2]: _n_! = 1\*2\*3\*...\*_n_ is also known as _n_ factorial; in this document, (0!) = 1.<br>_Summation notation_, involving the Greek capital sigma (&Sigma;), is a way to write the sum of one or more terms of similar form. For example, $\sum_{k=0}^n g(k)$ means $g(0)+g(1)+...+g(n)$, and $\sum_{k\ge 0} g(k)$ means $g(0)+g(1)+...$.

[^3]: Gonska, Heiner, Paula Piƫul, and Ioan Raşa. "On differences of positive linear operators." Carpathian Journal of Mathematics (2006): 65-78.

[^4]: Adell, J.A., Cárdenas-Morales, D., "[**Quantitative generalized Voronovskaja’s formulae for Bernstein polynomials**](https://www.sciencedirect.com/science/article/pii/S0021904518300376)", Journal of Approximation Theory 231, July 2018.

[^5]: Molteni, Giuseppe. "Explicit bounds for even moments of Bernstein’s polynomials." Journal of Approximation Theory 273 (2022): 105658.

[^6]: Cheng, F., "On the rate of convergence of Bernstein polynomials of functions of bounded variation", Journal of Approximation Theory 39 (1983).

[^7]: Weisstein, Eric W. "Schwarz's Inequality." From MathWorld--A Wolfram Resource. [**https://mathworld.wolfram.com/SchwarzsInequality.html**](https://mathworld.wolfram.com/SchwarzsInequality.html)

[^8]: R. Bojanic, O. Shisha, "Degree of $L^1$ approximation to integrable functions by modified Bernstein polynomials", Journal of Approximation Theory 13, 66–72 (1975).

[^9]: Piţul, P., "Evaluation of the Approximation Order by Positive Linear Operators", dissertation, Universität Duisberg-Essen, 2007.

[^10]: Păltănea, R., Smuc, M., "Sharp Estimates of Asymptotic Error of Approximation by General Positive Linear Operators in Terms of the First and the Second Moduli of Continuity", _Results in Mathematics_ 74 (2019).

[^11]: Babenko, Alexander G., and Yuriy V. Kryakin. "Special difference operators and the constants in the classical Jackson-type theorems." Topics in Classical and Modern Analysis: In Memory of Yingkang Hu. Cham: Springer International Publishing, 2019. 35-46.

[^12]: Jaskaran Singh Kaire and Andriy Prymak. "Whitney-type estimates for convex functions." arXiv preprint arXiv:2311.00912 (2023).

[^13]: Sevy, J., "Acceleration of convergence of sequences of simultaneous approximants", dissertation, Drexel University, 1991.

[^14]: H. H. Gonska, _Quantitative Approximation in C(X)_, Habilitationschrift, Universität Duisburg, 1985.

[^15]: R.A. DeVore and G.G. Lorentz, _Constructive Approximation_, 1993.

[^16]: E. W. Cheney, _Introduction to Approximation Theory_, 1998.

[^17]: Guessab, A., Nouisser, O. & Schmeisser, G. Enhancement of the algebraic precision of a linear operator and consequences under positivity. Positivity 13, 693–707 (2009). [**https://doi.org/10.1007/s11117-008-2253-4**](https://doi.org/10.1007/s11117-008-2253-4)

[^18]: $W_n$ can, in principle, be nonlinear instead, but this would require a totally different approach to finding the approximation error, and $L_n$ would then be nonlinear in general.

[^19]: Güntürk, C. Sinan, and Weilin Li. "[**Approximation with one-bit polynomials in Bernstein form**](https://arxiv.org/pdf/2112.09183)", arXiv:2112.09183 (2021); Constructive Approximation, pp.1-30 (2022).

[^20]: Micchelli, Charles. "[**The saturation class and iterates of the Bernstein polynomials**](https://www.sciencedirect.com/science/article/pii/0021904573900282)", Journal of Approximation Theory 8, no. 1 (1973): 1-18.

[^21]: Wang, Y.Q., Zhang, Y.Y, Liu, J.L., "Expectation identity of the hypergeometric distribution and its application in the calculations of high-order origin moments",Communications in Statistics--Theory and Methods 52(17), 2023. [**https://doi.org/10.1080/03610926.2021.2024235**](https://doi.org/10.1080/03610926.2021.2024235)

[^22]: Weisstein, Eric W. "Central Moment." From MathWorld--A Wolfram Resource. [**https://mathworld.wolfram.com/CentralMoment.html**](https://mathworld.wolfram.com/CentralMoment.html)

[^23]: Skorski, Maciej. "Handy formulas for binomial moments." _Modern Stochastics: Theory and Applications_ 12.1 (2024): 27-41.
