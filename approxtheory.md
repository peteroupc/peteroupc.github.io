# Notes on Approximation Theory

Some notes that may be useful when finding approximation error bounds that are explicit, with no hidden constants and without introducing transcendental or trigonometric functions.

The notes generally relate to error bounds on how close a polynomial is to a single-variable function on a closed interval.  The mapping from a function to a function (in this case, from a single-variable function to a polynomial "close" to it) is called an _operator_, and operators involved in these error bounds are often linear operators, whose behavior is relatively simple to examine.

<a id=Contents></a>

## Contents

- [**Contents**](#Contents)
- [**Notation and Definitions**](#Notation_and_Definitions)
- [**Bernstein Form and Bernstein Polynomials**](#Bernstein_Form_and_Bernstein_Polynomials)
- [**"Moments" of Linear Operators**](#Moments_of_Linear_Operators)
    - [**"Moments" of Bernstein Polynomials**](#Moments_of_Bernstein_Polynomials)
- [**Taylor Expansion of Linear Operators**](#Taylor_Expansion_of_Linear_Operators)
- [**Results on Error Bounds**](#Results_on_Error_Bounds)
    - [**Bounds for General Positive Linear Operators**](#Bounds_for_General_Positive_Linear_Operators)
    - [**Whitney's Inequality**](#Whitney_s_Inequality)
    - [**Lebesgue Inequality for Certain Linear Operators**](#Lebesgue_Inequality_for_Certain_Linear_Operators)
- [**Example**](#Example)
- [**Example: An Interesting Linear Operator**](#Example_An_Interesting_Linear_Operator)
- [**License**](#License)
- [**Notes**](#Notes)

<a id=Notation_and_Definitions></a>

## Notation and Definitions

For definitions of _continuous_, _derivative_, _convex_, _concave_, _Hölder continuous_, and _Lipschitz continuous_, see the definitions section in "[**Supplemental Notes for Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernsupp.html#Definitions)".

- The _closed unit interval_ (written as \[0, 1\]) means the set consisting of 0, 1, and every real number in between.
- An _operator_ is a mapping from a function to a function.
- An operator $L$ is _linear_ if it satisfies $L(af)=aL(f)$ and $L(f+g)=L(f)+L(g)$ for all input functions $f$ and $g$ and every number $a$.
- An operator $L$ is _positive_ if it has the property that, if an input function $f$ is nonnegative on its domain, so is $L(f)$.[^1]
- The _operator norm_ of an operator $L$ is the maximum absolute value of $L(f)$ over all input functions $f$ with maximum absolute value 1 or less.  This assumes $L$ takes only continuous functions on a closed interval.
- In this document, $e_i$ is a function such that $e_i(t) = t^i$, so that $e_0(t) = 1$ and $e_1(t) = t$; as an example, if $L(f) = f(0) + f(1)$, then $L(e_1 - x)$ = $(e_1(0) - x) + (e_1(1) - x)$ = $(0-x)+(1-x)=1-2x$.
- The _expected value_ (or mean or “long-run average”) of a random variable $Y$ is denoted $\mathbb{E}[Y]$.
- A _modulus of continuity of order 1_ of a function _f_, denoted $\omega_1(\delta)$, means a nonnegative and nowhere decreasing function where, for each $\delta\ge 0$, $\text{abs}(f(x)-f(y))\le\omega_1(\delta)$ whenever $x$ and $y$ are in $f$'s domain and no more than $\delta$ apart.  Loosely speaking, $\omega_1(\delta)$ gives how much $f$ can vary when $f$ is restricted to a window of size $\delta$ or less.  The modulus of continuity reflects the "regularity" of $f$; generally, the smaller it is, the more "regular".

<a id=Bernstein_Form_and_Bernstein_Polynomials></a>

## Bernstein Form and Bernstein Polynomials

Among the best known examples of linear operators are the Bernstein polynomials.

In this document, a polynomial $P(x)$ is written in _Bernstein form of degree $n$_ if it is written as&mdash;

$$P(x)=\sum_{k=0}^n a_k \frac{n!}{(k!)((n-k)!)} x^k (1-x)^{n-k},$$

where the real numbers $a_0, ..., a_n$ are the polynomial's _Bernstein coefficients_.[^2]

The degree-$n$ _Bernstein polynomial_ of an arbitrary function $f(x)$ has Bernstein coefficients $a_k = f(k/n)$.  In general, this Bernstein polynomial differs from $f$ even if $f$ is a polynomial.  In this document, the degree-$n$ Bernstein polynomial of $f$ is denoted $B_n(f)$. $B_n(f)$ is a positive linear operator.

<a id=Moments_of_Linear_Operators></a>

## "Moments" of Linear Operators

To examine the approximation behavior of linear operators, it is helpful to find the so-called "moments" of those operators, that is, the functions they map certain functions to.

For a linear operator $L$, they are:

- "Raw moments": The values of $L(e_i)$ for each integer $i\ge 0$.
- "Central moments": The values of $L((e_1-x)^i)$ for each integer $i\ge 0$.  If the "raw moments" $L(e_0), ..., L(e_j)$ are known, then $L((e_1-x)^j)$ is also known, thanks to proposition 5.6 of Gonska et al. (2006)[^3].
- "Absolute moments": The values of $L(\text{abs}(e_1-x)^i)(x)$ for each integer $i\ge 0$.  When $i$ is even, $L(\text{abs}(e_1-x)^i)$ = $L((e_1-x)^i)$.

Because $L$ is linear, if $L(e_i) = e_i$ for each $i$ from 0 through $j$, then $L$ _reproduces all polynomials_ up to degree $j$ (that is, $L(f) = f$ whenever $f$ is a polynomial of degree $j$ or less).

Also, because $L$ is linear, the "moments" of degree up to $m$, say, lead to easy ways to find the mapping by $L$ of any polynomial of degree up to $m$, when the polynomial is written in "power" form.

> **Example:** Let $f(x)$ be the polynomial $4x^3 - 6x^2 + 8x^1 - 10$.  Then:
>
> $$L(f) = 4L(e_3) - 6L(e_2) + 8L(e_1) - 10L(e_0).$$

<a id=Moments_of_Bernstein_Polynomials></a>

### "Moments" of Bernstein Polynomials

The following results deal with useful quantities when discussing the error in approximating a function by Bernstein polynomials.

Suppose a coin shows heads with probability $p$, and $n$ independent tosses of the coin are made, where $n$ is 1 or greater.  Then the total number of heads $X$ follows a _binomial distribution_.  The following are useful quantities of this distribution.

- $T_{n,r}$: The _central moment_ of $X$ is denoted $T_{n,r}(p)$ = $\mathbb{E}[(X-\mathbb{E}[X])^r]$ = $B_n((e_1-p)^r)(p)\cdot n^r$. Formulas for computing this central moment are given in Skorski (2024)[^4].
- $S_{n,r}$: Traditionally, the central moment of $X/n$ or the ratio of heads to tosses is denoted $S_{n,r}(p)$ = $T_{n,r}(p)/n^r$ = $\mathbb{E}[(X/n-\mathbb{E}[X/n])^r]$ = $B_n((e_1-p)^r)(p)$.  ($T$ and $S$ are notations of S.N. Bernstein, known for Bernstein polynomials.) $S_{n,r}$ is thus the $r$-th "central moment" of degree-$n$ Bernstein polynomials.
- $M_{n,r}$: The $r$-th _central absolute moment_ of $X/n$ is denoted $M_{n,r}(p)$ = $\mathbb{E}[\text{abs}(X/n-\mathbb{E}[X/n])^r]$ = $B_n(\text{abs}(e_1-p)^r)(p)$.  If $r$ is even, $M_{n,r}(p) = S_{n,r}(p)$. $M_{n,r}$ is thus the $r$-th "absolute moment" of degree-$n$ Bernstein polynomials.

The following gives bounds on $M_{n,r}$; some results in approximation theory rely on bounds like these.[^5]

**Proposition 1**: _Let $r\ge 0$, and let $\sigma(r,t) = (r!)/(((r/2)!)t^{r/2})$.  Then for real numbers $r$ and integers $n$ described in the following table,_ $M_{n, r}(p)\le \mu_{n,r}/n^{r/2}$, _where_ $\mu_{n,r}$ _is as given in the table._

| If $r$... |  Then $\mu_{n,r}$ is...  |
 --- | ---- |
| Is an even integer. | $\sigma(r,6)$, for positive $n$. |
| Is an even integer, but not greater than 44. |  $\sigma(r,8)$, for positive $n$. |
| Is 1. | $1/2$, for positive $n$. |
| Is odd, and $3\le r\le 43$. | $\sqrt{\sigma(r-1,8)\sigma(r+1,8)} = r^{1/2}(r-1)! / (2\cdot 8^{(r-1)/2}((r-1)/2)!)$, for $n\ge 2$. |
| Is odd and greater than 43. | $\sqrt{\sigma(r-1,6)\sigma(r+1,6)}$, for $n\ge 2$. |

_Proof:_ The first row comes from a result of Adell and Cárdenas-Morales (2018)[^6].  The second row is an improved result of the first, from Molteni (2022)[^7].  The third row follows from Cheng (1983)[^8].  The fourth and fifth rows follow from the first and second as well as that the absolute central moment for odd $r$ can be bounded for every integer $n\ge 2$, using Schwarz's inequality (Weisstein)[^9] \(see also Bojanić and Shisha 1975[^10] for the case $r=4$). &#x25a1;

<a id=Taylor_Expansion_of_Linear_Operators></a>

## Taylor Expansion of Linear Operators

Continuous functions can be "unwrapped" into a Taylor expansion.  The linear mapping of those functions also has a Taylor expansion of sorts, which is described next.

Let $f(\lambda)$ have a continuous $s$-th derivative on a closed interval, where $s$ is zero or a positive integer, and let $L(f)$ be a linear operator that maps continuous functions on that interval to functions of that kind.  Then:

$$L_n(f)(\lambda) = L_n(R_s(f, \lambda)) + \sum_{i=0}^s L_n((e_1-\lambda)^i)(\lambda)\frac{f^{(i)}(\lambda)}{i!}, \tag{1}$$

where $R_s(f,\lambda)$ is the remainder after subtracting from $f$ the degree-$s$ Taylor polynomial of $f$ centered at $\lambda$. (See also Piţul (2007, proof of theorem 5.8)[^11].)

If $L$ reproduces constants, so that $L(e_0)=1$, this becomes:

$$L_n(f)(\lambda) - f(\lambda) = L_n(R_s(f, \lambda)) + \sum_{i=1}^s L_n((e_1-\lambda)^i)(\lambda)\frac{f^{(i)}(\lambda)}{i!}.\tag{2}$$

It can be seen from the expansions $(1)$ and $(2)$ that finding upper bounds for $L_n(f)(\lambda)$ involves:

- Finding upper bounds for $L_n$'s "central moments" up to the $s$-th order.
- Finding upper bounds for $L_n(R_s(f,\lambda))$.
    - If $L$ is positive linear, such bounds are given in the section "[**Bounds for General Positive Linear Operators**](#Bounds_for_General_Positive Linear_Operators)".
    - If $L$ is not positive, finding such bounds is harder. This situation can be helped if $L$ can be written as a difference between two positive linear operators $LA$ and $LB$, so that $L(f) = LA(f) - LB(f)$.[^12]  See the "[**Example**](#Example)" section later in this document.

Meanwhile, bounds for the derivatives of $f$ (here, $f^{(i)}$) are often assumed to be known beforehand.

<a id=Results_on_Error_Bounds></a>

## Results on Error Bounds

Some results on error bounds for certain classes of operators.

<a id=Bounds_for_General_Positive_Linear_Operators></a>

### Bounds for General Positive Linear Operators

The following results give bounds that apply to large classes of positive linear operators.  In this section:

- $\sigma_i = L((e_i-\lambda)^i)(\lambda)$ (the $i$-th "central moment" of the linear operator $L$ in question).
- $\tau_i = L(\text{abs}(e_i-\lambda)^i)(\lambda)$  (the $i$-th "absolute moment" of the linear operator $L$ in question).
- $\omega_1(f, \delta)$ is the smallest modulus of continuity of a function $f$ of order 1, with parameter $\delta$.
- $\tilde\omega_1(f, \delta)$ is the smallest concave modulus of continuity of $f$ of order 1, both with parameter $\delta$.

**Lemma 1**. _Let $f(\lambda)$ be continuous on a closed interval, and let $L$ be a positive linear operator that maps continuous functions on that interval to functions of that kind and reproduces all constants (so that_ $L(e_0) = 1$ _).  Then_ $\text{abs}(L(f)(\lambda)-f(\lambda))\le\tilde\omega_1(f, \tau_1)$.

_Proof:_ Follows from a result of Gonska and Meier (1985, theorem 3.1)[^13]. &#x25a1;

**Lemma 2**. _Let $f(\lambda)$ be continuous on a closed interval, and let $L$ be a positive linear operator that maps continuous functions on that interval to functions of that kind and reproduces all polynomials up to degree 1 (constants and linear functions).  Let $h>0$ be a real number. Then:_

| No. | If $f$ ... |  Then $\text{abs}(L(f)(\lambda)-f(\lambda))\le ... $ |
 - | ----- | ----- |
| 1 | Is continuous. | $(1 + (\sigma_2)^{1/2}/h) \omega_1(f, h)$. |
| 2 | Is continuous. | $(1 + (\sigma_2)/h^2) \omega_1(f, h)$. |
| 3 | Is continuous. | (Use ineq. 1 if $h<(\sigma_2)^{1/2}$, or ineq. 2 otherwise.) |
| 4 | Is continuous. | $\tilde\omega_1(f, (\sigma_2)^{1/2})$. |
| 5 | Is Hölder continuous with Hölder exponent $\alpha$ ($0\lt\alpha\le 1$) and Hölder constant $M$ or less. | $M (\sigma_2)^{\alpha/2}$. |
| 6 | Is Lipschitz continuous with Lipschitz constant $M$ or less. | $M (\sigma_2)^{1/2}$. |
| 7 | Has a continuous derivative. | $((h+2)^2/(8h))\cdot \omega_1(f^{(1)}, h\cdot\sqrt{\sigma_2}) \cdot\sqrt{\sigma_2}$. |
| 8 | Has a continuous derivative. | $\frac{1}{2}(\sigma_2)^{1/2} \tilde\omega_1(f^{(1)}, (\sigma_2)^{1/2})$. |
| 9 | Has a Hölder-continuous derivative with Hölder exponent $\alpha$ ($0\lt\alpha\le 1$) and Hölder constant $M$ or less. | $\frac{M}{2}(\sigma_2)^{(1+\alpha)/2}$. |
| 10 | Has a Lipschitz-continuous derivative with Lipschitz constant $M$ or less. | $\frac{M}{2} (\sigma_2)$. |

_Proof:_ Inequality 1 follows from a special case of a theorem on positive linear operators from Shisha and Mond (1968)[^14]; inequality 2 follows from a result of Mond (1978)[^15]; inequality 3, a result of Păltănea (2004, corollary 1.2.2)[^16]; and inequality 4, a result of Peetre (1969)[^17].  Inequality 8 follows from a result of Gonska and Meier (1985, theorem 4.1)[^13]; see also Păltănea and Dimitriu (2016, remark 3)[^18].  Inequality 7 is a special case of Theorem 2.19 (in conjunction with Remark 2.21) of Anastassiou (1985), with the interval $[a, b]$, $m=1$ (since the function is defined on all of $[a, b]$), $r=h$, and $x_0$ equal to $\lambda$.

Inequality 5 follows from inequality 4 using properties of Hölder-continuous functions; by assumption, $f$ admits the continuous and concave modulus of continuity $\omega_1(\delta)=M\delta^\alpha$, where $\delta>0$.  Inequality 9 follows from inequality 8 in the same manner.  Inequalities 6 and 10 follow from inequalities 5 and 9, respectively, given that Lipschitz-continuous functions are Hölder continuous with Hölder exponent 1. &#x25a1;

**Lemma 3**. _Let $f(\lambda)$ have a continuous $k$-th derivative on a closed interval, and let $L$ be a positive linear operator that maps continuous functions on that interval to functions of that kind.  Let $h>0$ be a real number. Then $L(f)(\lambda) = L(Q_k(f,\lambda))(\lambda) + L(R_k(f,\lambda))(\lambda)$, where:_

$$\text{abs}(L(Q_k(f,\lambda)) - f(\lambda))\le \left(\sum_{i=0}^k \frac{\max(\text{abs}(f^{(i)})) \text{abs}(\sigma_i)}{i!}\right),$$

$$\text{abs}(L(R_k(f,\lambda)))\le\left(\frac{\tau_k}{k!}+\frac{\tau_{k+1}}{(k+1)!\cdot h}\right)\cdot\omega_1(f^{(k)}, h),$$

$$\text{and }\text{abs}(L(R_k(f,\lambda)))\le\max\left(\frac{\tau_k}{k!}, \frac{\tau_{k+1}}{(k+1)!\cdot 2h}\right)\cdot\tilde\omega_1(f^{(k)}, 2h),$$

$$\text{and }\text{abs}(L(R_k(f,\lambda)))\le\frac{\tau_k}{k!}\cdot\tilde\omega_1(f^{(k)}, \frac{\tau_{k+1}}{(k+1)\tau_k}),$$

_and where:_

- $Q_k(f,\lambda)=$ $\sum_{i=0}^k f^{(i)}(\lambda)\cdot(e_0-\lambda)^i/(i!)$ _is the degree-$k$_ Taylor polynomial _of $f$ centered at $\lambda$._
- $R_k(f,\lambda)$ _is the_ Taylor remainder _that results from subtracting $Q(f,\lambda)$ from $f$._

_Proof:_  The second to fourth bounds given relate to the Taylor remainder.  The second bound comes from Păltănea and Smuc (2019, Theorem 1)[^19]; the third bound comes from corollary 3.2 of Dimitriu (2010)[^20] and Brudnyĭ's lemma; and the fourth bound follows from the second with $h=\tau_{k+1}/(2(k+1)\tau_k)$ and comes from Gonska et al. (2006)[^21], where the closed interval assumed was the closed unit interval; see also Gonska (2007)[^22], Piţul (2007)[^11].  See also Anastassiou (1985, theorem 2.31)[^23].[^24]&#x25a1;

**Lemma 4.** _Let $k$ be zero or a positive integer. Let $f(\lambda)$ have a Lipschitz-continuous $k$-th derivative on a closed interval, with Lipschitz constant $M$ or less, and let $L$ be a positive linear operator that maps continuous functions on that interval to functions of that kind.  Then_ $\text{abs}(L(R_k(f,\lambda)))\le M \tau_{k+1}/((k+1)!)$, _where_ $R_k(f,\lambda)$ _is as in Lemma 3._

_Proof:_  Follows from the third bound for $L(R_k(f,\lambda))$ in Lemma 3 in the same manner as inequality 10 of Lemma 2. &#x25a1;

The following lemma adapts the previous lemmas to the setting of random variables.

**Lemma 5.** _Let $f(\lambda)$ be continuous on a closed interval, and let $Y$ be a random variable taking only values in that interval.  Then Lemmas 1 through 4 apply as appropriate to $f$ with $L(f)=\mathbb{E}[f(Y)]$ and $\lambda =\mathbb{E}[Y]$._

_Proof_: With these assumptions there is a positive linear operator $L(f) = \mathbb{E}[f(Y)]$ for $Y$ and $f$, according to Theorem 3.1.1 of Frantz (1984)[^25], letting $x_o = \lambda$.  Then $L(e_0)$ = $\mathbb{E}[e_0(Y)]$ = $\mathbb{E}[1]$ = 1 regardless of $Y$, and  $L(e_1)$ = $\mathbb{E}[e_1(Y)]$ = $\mathbb{E}[Y]$ = $\lambda$, so $L$ reproduces all polynomials of degree up to 1. &#x25a1;

<a id=Whitney_s_Inequality></a>

### Whitney's Inequality

Let $n$ be zero or a positive integer, let $f(\lambda)$ be continuous on a closed interval $[a, b]$, and let $P$ be a polynomial of degree $n$ or less with the least maximum absolute difference between $f$ and the polynomial on that interval.  Then the error of $P$ in approximating $f$ is bounded as follows (see Babenko and Kryakin 2019[^26]):

$$\|f-P\|_\infty\le W \cdot \omega_{n+1}(f,\frac{b-a}{n+1}),$$

where&mdash;

- $W$ is:
    - 1 if $n\le 7$.
    - $(2+\exp(-2)) (< 2.13534)$ if $n\ge 8$.
    - $3/4$ if $n=1$ and $f$ is convex (Singh Kaire and Prymak 2023/2025)[^27].
    - $1/2$ if $n=1$, $f$ is convex, and $a=-b$ (Singh Kaire and Prymak 2023/2025)[^27].
- $\|\|g\|\|_\infty$ is the maximum of the absolute value of (the continuous function) $g$ on $[a, b]$, and
- $\omega_{n}(f, h)$ is the smallest modulus of continuity of $f$ of order $n$, with parameter $h$.

Using properties of moduli of continuity (see Sevy 1991[^28], sec. 2.0.2; Gonska 1985[^29]), if $f$ has a continuous $(n+1)$-th derivative on $[a, b]$:

$$\|f-P\|_\infty\le W \cdot \left(\frac{b-a}{n+1}\right)^{n+1}\|f^{(n+1)}\|_\infty,$$

and if $f$ has a continuous $n$-th derivative on that interval:

$$\|f-P\|_\infty\le W \cdot \left(\frac{b-a}{n+1}\right)^n\omega_1(f^{(n)}, \frac{b-a}{n+1}).$$

<a id=Lebesgue_Inequality_for_Certain_Linear_Operators></a>

### Lebesgue Inequality for Certain Linear Operators

Let $f(\lambda)$ be a continuous function on a closed interval.  For any sequence of linear operators $(L_n)$ that map continuous functions to polynomials and reproduce all polynomials up to degree $m(n)$ (which depends on $n$), the following error bound (also known as _Lebesgue's lemma_ or the _Lebesgue inequality_) holds true for each $n$:

$$\text{abs}(L_n(f)(x) - f(x))\le(1+\|L_n\|)\cdot\max_t(\text{abs}(f(t)-P(t))),$$

where $\|\|L_n\|\|$ is the operator norm of $L_n$, and $P$ is a polynomial of degree up to $m(n)$ with the least maximum absolute difference between $f$ and the polynomial (see also DeVore and Lorentz (1993)[^30], Cheney (1996, chapter 6)[^31]).  But this error bound will generally be crude or trivial unless $L_n$ are nonpositive operators.  Indeed, the only positive linear operator $L$ that reproduces all polynomials up to degree 2 is the identity operator $L=f$.[^32]

> **Example:** Let $f$ have a continuous third derivative on the closed unit interval.  Combining the previous inequality with the Whitney-type inequalities in the previous section leads to the following error bound for linear operators $L$ that map continuous functions to polynomials and reproduce all polynomials up to degree 2:
>
> $$\text{abs}(L(f)(x) - f(x))\le(1+\|L\|)\cdot 1\cdot \left(\frac{1}{3}\right)^{3}\|f^{(3)}\|_\infty$$
>
> $$ = (1+\|L\|)\|f^{(3)}\|_\infty/27.$$

<a id=Example></a>

## Example

This example shows how to find a linear operator's bounds.

Let $L_n(f)$ be a linear operator inspired by [**a conjecture I have**](https://peteroupc.github.io/bernsupp.html#A_Conjecture_on_Polynomial_Approximation) on polynomial approximation.  It is described as follows:

$$L_n(f)(\lambda) = \sum_{i=0}^n \left( W_{2n}\left(f\right)\left(\frac{k}{2n}\right) - W_n\left(f\right)\left(\frac{i}{n}\right)\right)\sigma_{n,k,i}$$

$$=\mathbb{E}\left[W_{2n}\left(f\right)\left(\frac{k}{2n}\right) - W_n\left(f\right)\left(\frac{X_k}{n}\right)\right],$$

where:

- $k = 2n\lambda$, where $0\le\lambda\le 1$.
- $W_n(f)$ is a linear operator that approaches $f$ as $n$ increases.[^33]
- $X_k$ is a hypergeometric($2n$, $k$, $n$) random variable.
- $\sigma_{n,k,i}$ equals ${n\choose i}{n\choose {k-i}}/{2n \choose k}$ and is the probability that $X_k$ equals $i$.
- $\mathbb{E}[Y]$ is the expected value (or mean or “long-run average”) of the random variable $Y$.

$L_n$ and $W_n$ are generally nonpositive operators.  As an example, take $W_n=2f-B_n(f)$.  Then $B_n(W_n(f))$ is a linear operator that is the iterated Boolean sum of degree-$n$ Bernstein polynomials, with one iteration; see Güntürk and Li (2021a, Theorem 5)[^34].  That paper, among others (for example, Micchelli 1973[^35]), showed that this operator approaches $f$ at the rate $O(1/n^{3/2})$ if $f$ has a continuous third derivative. ("$O(1/n^{3/2})$" means the error is no greater than a constant times $1/n^{3/2}$ for all values of $n$.)

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

To find values like those just listed, it is useful to calculate raw moments (Wang et al. 2023)[^36] and central moments (Weisstein)[^37] of hypergeometric random variables (such as $X_k$).  Indeed, if $g(y)=W_{2n}(e_r;k/(2n))-W_n(e_r;y)$ is a polynomial in $y$ of degree $r$ or less, then $L_n(e_r)$ can be found using a Taylor expansion, namely as&mdash;

$$L_n(e_r) = \sum_{i=0}^r \mathbb{E}[(X_k/n-\mathbb{E}[X_k/n])^i]\frac{g^{(i)}(\mathbb{E}[X_k/n])}{i!}$$

$$= \sum_{i=0}^r \frac{\mathbb{E}[(X_k-\mathbb{E}[X_k])^i]}{n^i}\frac{g^{(i)}(k/(2n))}{i!},$$

where the derivatives are taken with respect to $y$, and where $\mathbb{E}[(X_k-\mathbb{E}[X_k])^i]$ is the $i$-th central moment of $X_k$.

In the following, the notation $\|\|f\|\|$ means $\max_{0\le\lambda\le 1}(\text{abs}(f(\lambda)))$.

The first step is to [**find the Taylor expansion**](#Taylor_Expansion_of_Linear_Operators) of $L_n(f)(\lambda)$. Given that $L_n((e_1-x)^0)(x)$ = $L_n((e_1-x)^1)(x)$ = 0, this becomes:

$$L_n(f)(\lambda) = L_n(R_3(f, \lambda)) + \sum_{i=2}^3 L_n((e_1-\lambda)^i)(\lambda)\frac{f^{(i)}(\lambda)}{i!},$$

$$\text{abs}(L_n(f)(\lambda)) \le \|L_n(R_3(f, \lambda))\|+ \|L_n((e_1-\lambda)^2)\| \|f^{(2)}\|/2$$

$$+ \|L_n((e_1-\lambda)^3)\| \|f^{(3)}\|/6.$$

The function $\text{abs}(L_n((e_1-x)^3)(x))$ has its maximum at $x=1/2-\sqrt{3}/6$; and $\text{abs}(L_n((e_1-x)^2)(x))$ has its maximum at $x=1/2$, so:

$$\text{abs}(L_n(f)(\lambda)) \le \|L_n(R_3(f, \lambda))\| + \text{abs}(\frac{3\lambda(\lambda - 1)}{2n(2n-1)})\|f^{(2)}\|/2$$

$$ + \|L_n((e_1-\lambda)^3)\| \|f^{(3)}\|/6$$

$$ \le \|L_n(R_3(f, \lambda))\| + \frac{3}{8n(2n-1)}\|f^{(2)}\|/2$$

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

<a id=Example_An_Interesting_Linear_Operator></a>

## Example: An Interesting Linear Operator

For a continuous function $f$ on the closed unit interval and for nonnegative integers $m$ and $n$, let $H_{n,m}$ be a linear operator as follows:

$$H_{n,m}(f)=B_n(f) + \text{Lag}_m(f) - B_n(\text{Lag}_m(f)),$$

where $B_n$ is the degree-$n$ Bernstein polynomial and $\text{Lag}_m$ is the polynomial of degree up to $m$ that equals $f$ at "$m+1$ distinct points on" the closed unit interval.  This operator was mentioned in Remark 2 of Gavrea and Ivan (2018)[^38], but appears not to have been studied elsewhere.

It is known that $Lag_m$ is a linear operator and reproduces all polynomials of degree $m$ or less, so that $Lag_m(e_i) = e_i$ whenever $0\le i\le m$ is an integer. Thus, if $f$ is such a polynomial, $B_n(f)=B_n(Lag_m(f))$ and therefore $H_{n,m}(f)$ = $Lag_m(f)=f$, and therefore $H_{n,m}(e_i)=e_i$ whenever $0\le i\le m$ is an integer.

(The foregoing sentence would remain true if $B_n$ were replaced with any other operator mapping to and from the same functions.)

Because $H_{n,m}$ reproduces all polynomials up to degree $m$, its "central moments" are $H_{n,m}((e_0-x)^0)=1$ and $H_{n,m}((e_i-x)^i)=0$ whenever $0\lt i\le m$ is an integer.  Thus, according to the expansion $(2)$, the following holds if $f$ has a continuous $m$-th derivative:

$$H_{n,m}(f)(\lambda) - f(\lambda) = H_{n,m}(R_m(f, \lambda))(\lambda).$$

Finding further bounds for $H_{n,m}$ is made difficult by that operator's nonpositivity.  To try to solve this, $\text{Lag}_m$ is decomposed into two positive operators $\text{LagA}_m$ and $\text{LagB}_m$ such that $\text{Lag}_m=\text{LagA}_m+\text{LagB}_m$.

$\text{Lag}_m$ is an operator written as&mdash;

$$\text{Lag}_m(f)(\lambda)=\sum_{i=0}^m f(x_i) l(i, \lambda, x_0, ..., x_m),$$

where $l(...)$ is a function that is not necessarily negative everywhere.  This operator is decomposed into two positive linear operators as follows:

$$\text{LagA}_m(f)(\lambda)=\sum_{i=0}^m f(x_i) (l(i, \lambda, x_0, ..., x_m)+M),$$

$$\text{LagB}_m(f)(\lambda)=\sum_{i=0}^m f(x_i) M,$$

where $M$ is greater than or equal to the operator norm of $\text{Lag}_m$, that is:

$$M\ge\sum_{i=0}^m \max_\lambda\text{abs}(l(i, \lambda, x_0, ..., x_m)).$$

Now with these two new operators, $H_{n,m}$ is rewritten as:

$$H_{n,m}(f)=B_n(f) + (\text{LagA}_m(f) - \text{LagB}_m(f)) - B_n(\text{LagA}_m(f) - \text{LagB}_m(f))$$

$$=B_n(f) + \text{LagA}_m(f) - \text{LagB}_m(f) - B_n(\text{LagA}_m(f)) + B_n(\text{LagB}_m(f))$$

$$=\left(B_n(f) + \text{LagA}_m(f) + B_n(\text{LagB}_m(f))\right) - \left(\text{LagB}_m(f) + B_n(\text{LagA}_m(f))\right)$$

(and because $B_n$ reproduces all constants:)

$$=\left(B_n(f) + \text{LagA}_m(f)\right) - \left(B_n(\text{LagA}_m(f))\right)$$

$$=HA_{n,m}(f) - HB_{n,m}(f),$$

where $HA_{n,m}$ and $HB_{n,m}$ are positive linear operators.

But this approach ultimately leads to a dead end, notably because the $i$-th "absolute moments" of the operator $(HA_{n,m} + HB_{n,m})$, for fixed $m$, do not generally converge to 0 as $n$ increases.

Alternatively, to find the approximation error of $H_{n,m}$, write:

$$H_{n,m}(f) - f=B_n(f) + \text{Lag}_m(f) - B_n(\text{Lag}_m(f)) - f$$

$$=(B_n(f) - f) + (\text{Lag}_m(f) - B_n(\text{Lag}_m(f))),$$

$$\text{abs}((H_{n,m}(f) - f)(\lambda))\le\text{abs}(B_n(f) - f) + \text{abs}(B_n(\text{Lag}_m(f)) - \text{Lag}_m(f)),$$

so now there are two error bounds to find: one for $f$ and the other for $\text{Lag}_m(f)$.  And, if $f$ has a continuous second derivative, both have the same form:

$$B_n(g)\le M_2(g)/(8n),$$

where $M_i(g)$ is the maximum absolute value of $g$'s $i$-th derivative. (This follows from Lorentz (1963)[^39] and the well-known fact that $M_2$ is an upper bound of $g$'s first derivative's smallest Lipschitz constant.) Thus what is left is to estimate the second derivative of $\text{Lag}_m(f)$.  Given that that function is a polynomial of degree $m$ or less, this can be estimated as:

$$\text{abs}(\text{Lag}_m(f)^{(2)}(\lambda))\le \|\text{Lag}_m\| M_0(f)\cdot \max(1,m)^2,$$

where $\|\|Lag_m\|\|$ is the operator norm of $Lag_m$, also known as its _Lebesgue constant_, which will vary depending on the points on the closed unit interval where the polynomial meets (interpolates) $f$.  The inequality just shown relies on Bernstein's inequality for the derivatives of polynomials (Weisstein)[^40].

Altogether, if $f$ has a continuous second derivative and $m$ is fixed:

$$\text{abs}((H_{n,m}(f) - f)(\lambda))\le \frac{M_2(f)}{8n} + \frac{\|\text{Lag}_m\| M_0(f)\cdot \max(1,m)^2}{8n},$$
>
>**Example:** If $m$ is 3, and the polynomial generated by $Lag_m$ interpolates $f$ at the points 0, 1/3, 2/3, and 1, the inequality just shown becomes:
>
> $$\text{abs}((H_{n,3}(f) - f)(\lambda))\le \frac{M_2(f)}{8n} + \frac{1.64\cdot M_0(f)\cdot 9}{8n},$$
>
> using an upper bound for $\|\|Lag_3\|\|$.

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
<a id=Notes></a>

## Notes

[^1]: A better term for positive operators is probably nonnegativity-preserving operators.

[^2]: _n_! = 1\*2\*3\*...\*_n_ is also known as _n_ factorial; in this document, (0!) = 1.<br>_Summation notation_, involving the Greek capital sigma (&Sigma;), is a way to write the sum of one or more terms of similar form. For example, $\sum_{k=0}^n g(k)$ means $g(0)+g(1)+...+g(n)$, and $\sum_{k\ge 0} g(k)$ means $g(0)+g(1)+...$.

[^3]: Gonska, Heiner, Paula Piƫul, and Ioan Raşa. "On differences of positive linear operators." Carpathian Journal of Mathematics (2006): 65-78.

[^4]: Skorski, Maciej. "Handy formulas for binomial moments." _Modern Stochastics: Theory and Applications_ 12.1 (2024): 27-41.

[^5]: It is also possible to bound the "absolute moment" as $M_{n,r}(p)\le C(r)(\max(1/n, (p(1-p)/n)^{1/2})^r$ or $M_{n,r}(p)\le C(r)(1/n + (p(1-p)/n)^{1/2})^r$ (G.G. Lorentz, "The degree of approximation by polynomials with positive coefficients", 1966), but the constants $C(r)$ seem to be higher (and less favorable) than the $C(r)$ in $M_{n,r}(p)\le C(r)/n^{r/2}$.

[^6]: Adell, J.A., Cárdenas-Morales, D., "[**Quantitative generalized Voronovskaja’s formulae for Bernstein polynomials**](https://www.sciencedirect.com/science/article/pii/S0021904518300376)", Journal of Approximation Theory 231, July 2018.

[^7]: Molteni, Giuseppe. "Explicit bounds for even moments of Bernstein’s polynomials." Journal of Approximation Theory 273 (2022): 105658.

[^8]: Cheng, F., "On the rate of convergence of Bernstein polynomials of functions of bounded variation", Journal of Approximation Theory 39 (1983).

[^9]: Weisstein, Eric W. "Schwarz's Inequality." From MathWorld--A Wolfram Resource. [**https://mathworld.wolfram.com/SchwarzsInequality.html**](https://mathworld.wolfram.com/SchwarzsInequality.html)

[^10]: R. Bojanic, O. Shisha, "Degree of $L^1$ approximation to integrable functions by modified Bernstein polynomials", Journal of Approximation Theory 13, 66–72 (1975).

[^11]: Piţul, P., "Evaluation of the Approximation Order by Positive Linear Operators", dissertation, Universität Duisberg-Essen, 2007.

[^12]: I suspect that, whenever $L$ is a linear operator that maps continuous functions on a closed interval to functions of that kind, $L$ can be written as a difference between two positive linear operators.  But I have not seen a proof of that statement; Acu et al. ("[**Grüss-type and Ostrowski-type inequalities in approximation theory**](https://doi.org/10.1007/s11253-011-0548-2)", Ukr Math J 63, 843–864, 2011) give a similar statement but without proof.

[^13]: Gonska, H.H., Meier, J., "On approximation by Bernstein-type operators: best constants", Studia Sci. Math. Hungar. 22, 1987.

[^14]: Shisha, O., Mond. B, "The degree of convergence of linear positive operators", 1968.

[^15]: Mond, B., "On the degree of approximation by linear positive operators", _Journal of Approximation Theory_ 18 (1976).

[^16]: Păltănea, R., _Approximation Theory Using Positive Linear Operators_, Birkhäuser, 2004.

[^17]: Peetre, J., "On the connection between the theory of interpolation spaces and approximation theory", in _Approximation Theory_, 1969.

[^18]: Păltănea, R, Dimitriu, M.T., "On some second order moduli of smoothness." General Mathematics 24 (2016)

[^19]: Păltănea, R., Smuc, M., "Sharp Estimates of Asymptotic Error of Approximation by General Positive Linear Operators in Terms of the First and the Second Moduli of Continuity", _Results in Mathematics_ 74 (2019).

[^20]: Dimitriu, M.T., "[**Estimates with optimal constants using Peetre's K-functionals**](https://www.jstor.org/stable/43964559)", _Carpathian Journal of Mathematics_ 26 (2010).

[^21]: Gonska, Heiner, Paula Piţul, and Ioan Raşa. "On Peano's form of the Taylor remainder, Voronovskaja's theorem and the commutator of positive linear operators", 2006.

[^22]: Gonska, Heiner. "On the degree of approximation in Voronovskaja's theorem", Studia Univ. Babeş-Bolyai, Math., September 2007.

[^23]: Anastassiou, George A. "[**A study of positive linear operators by the method of moments, one-dimensional case**](https://www.sciencedirect.com/science/article/pii/0021904585900498)." Journal of Approximation Theory 45.3 (1985): 247-270.

[^24]: The paper Cichoń et al., "[**On delta-method of moments and probabilistic sums**](https://doi.org/10.1137/1.9781611973037.11)", ANALCO 2013, has very similar results, but they assume the function $f$ has a $k$-th derivative defined on an _open_ interval (say, $0\lt\lambda\lt 1$), rather than a _closed_ one, making those results harder to use if $Y$ is a random variable that can take a value equal to either endpoint of the interval (in this example, 0 or 1).

[^25]: Frantz, Deborah A. Summability methods, probability distributions, and associated positive linear operators. Lehigh University, 1984.

[^26]: Babenko, Alexander G., and Yuriy V. Kryakin. "Special difference operators and the constants in the classical Jackson-type theorems." Topics in Classical and Modern Analysis: In Memory of Yingkang Hu. Cham: Springer International Publishing, 2019. 35-46.

[^27]: Jaskaran Singh Kaire and Andriy Prymak. "Whitney-type estimates for convex functions." arXiv preprint arXiv:2311.00912 (2023).

[^28]: Sevy, J., "Acceleration of convergence of sequences of simultaneous approximants", dissertation, Drexel University, 1991.

[^29]: H. H. Gonska, _Quantitative Approximation in C(X)_, Habilitationschrift, Universität Duisburg, 1985.

[^30]: R.A. DeVore and G.G. Lorentz, _Constructive Approximation_, 1993.

[^31]: E. W. Cheney, _Introduction to Approximation Theory_, 1998.

[^32]: Guessab, A., Nouisser, O. & Schmeisser, G. Enhancement of the algebraic precision of a linear operator and consequences under positivity. _Positivity_ 13, 693–707 (2009). [**https://doi.org/10.1007/s11117-008-2253-4**](https://doi.org/10.1007/s11117-008-2253-4). However, Gavrea and Ivan ("[**A note on the fixed points of positive linear operators**](https://doi.org/10.1016/j.jat.2017.12.001)", _Journal of Approximation Theory_ (227), 2018) pointed out that there are positive linear operators besides the identity that reproduce all polynomials of the form $x^i$ where $i>0$.

[^33]: $W_n$ can, in principle, be nonlinear instead, but this would require a totally different approach to finding the approximation error, and $L_n$ would then be nonlinear in general.

[^34]: Güntürk, C. Sinan, and Weilin Li. "[**Approximation with one-bit polynomials in Bernstein form**](https://arxiv.org/pdf/2112.09183)", arXiv:2112.09183 (2021); Constructive Approximation, pp.1-30 (2022).

[^35]: Micchelli, Charles. "[**The saturation class and iterates of the Bernstein polynomials**](https://www.sciencedirect.com/science/article/pii/0021904573900282)", Journal of Approximation Theory 8, no. 1 (1973): 1-18.

[^36]: Wang, Y.Q., Zhang, Y.Y, Liu, J.L., "Expectation identity of the hypergeometric distribution and its application in the calculations of high-order origin moments",Communications in Statistics--Theory and Methods 52(17), 2023. [**https://doi.org/10.1080/03610926.2021.2024235**](https://doi.org/10.1080/03610926.2021.2024235)

[^37]: Weisstein, Eric W. "Central Moment." From MathWorld--A Wolfram Resource. [**https://mathworld.wolfram.com/CentralMoment.html**](https://mathworld.wolfram.com/CentralMoment.html)

[^38]: Ioan Gavrea, Mircea Ivan, "A note on the fixed points of positive linear operators", Journal of Approximation Theory (227), 2018, [**https://doi.org/10.1016/j.jat.2017.12.001.**](https://doi.org/10.1016/j.jat.2017.12.001).

[^39]: G.G. Lorentz, "Inequalities and saturation classes for Bernstein polynomials", 1963.

[^40]:  Weisstein, Eric W. "Bernstein's Inequality." From MathWorld--A Wolfram Resource. [https://mathworld.wolfram.com/BernsteinsInequality.html](https://mathworld.wolfram.com/BernsteinsInequality.html)
