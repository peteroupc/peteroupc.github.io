# Notes on Approximation Theory

[**Peter Occil**](mailto:poccil14@gmail.com)

The notes in this page catalog results that may be useful in finding bounds on how close a single-variable function on a compact interval is to a polynomial or rational function (or, more generally, a "simpler" version of the other function).

The aim is to find error bounds that are _explicit_, with no hidden constants and without introducing transcendental or trigonometric functions. If an error bound is explicit, it can be computed _offline_, without performing an approximation first, so that it can be known, for example, which degree polynomial to build in order to come close to a function with a given accuracy.

The mapping from a function to a function (for example, from a single-variable function to a polynomial "close" to it) is called an _{op}erator_, and operators involved in these bounds are often linear operators, whose behavior is relatively simple to examine.

<a id=Contents></a>

## Contents

- [**Contents**](#Contents)
- [**About This Document**](#About_This_Document)
- [**Notation and Definitions**](#Notation_and_Definitions)
- [**Bernstein Form and Bernstein Polynomials**](#Bernstein_Form_and_Bernstein_Polynomials)
- [**"Moments" of Linear Operators**](#Moments_of_Linear_Operators)
    - [**"Moments" of Bernstein Polynomials**](#Moments_of_Bernstein_Polynomials)
- [**Taylor Expansion of Linear Operators**](#Taylor_Expansion_of_Linear_Operators)
- [**Results on Error Bounds**](#Results_on_Error_Bounds)
    - [**Bounds for General Positive Linear Operators**](#Bounds_for_General_Positive_Linear_Operators)
    - [**Bounds for Remainder of Bernstein Polynomials**](#Bounds_for_Remainder_of_Bernstein_Polynomials)
    - [**Bounds for General Linear Operators**](#Bounds_for_General_Linear_Operators)
    - [**Inequalities on Polynomial Errors**](#Inequalities_on_Polynomial_Errors)
    - [**Lebesgue Inequality for Certain Linear Operators**](#Lebesgue_Inequality_for_Certain_Linear_Operators)
    - [**Bounds for Certain Nonlinear Operators**](#Bounds_for_Certain_Nonlinear_Operators)
    - [**Lipschitz-Continuous Operators**](#Lipschitz_Continuous_Operators)
- [**Example**](#Example)
- [**Example: An Interesting Linear Operator**](#Example_An_Interesting_Linear_Operator)
- [**Example: The Lorentz Operators**](#Example_The_Lorentz_Operators)
- [**Probabilistic Interpretations of Linear Operators**](#Probabilistic_Interpretations_of_Linear_Operators)
- [**Conclusion and Ways to Improve This Article**](#Conclusion_and_Ways_to_Improve_This_Article)
- [**License**](#License)
- [**Notes**](#Notes)

<a id=About_This_Document></a>

## About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/approxtheory.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/approxtheory.md)**.  You can send comments on this document on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues), especially if you find any errors on this page.

<a id=Notation_and_Definitions></a>

## Notation and Definitions

For definitions of _continuous_, _derivative_, _convex_, _concave_, _Hölder continuous_, and _Lipschitz continuous_, see the definitions section in "[**Supplemental Notes for Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernsupp.html#Definitions)".

- The _closed unit interval_ (written as \[0, 1\]) means the set consisting of 0, 1, and every real number in between.
- A _compact interval_ (written as $[a, b]$), means a set of real numbers consisting of $a$, $b$, and every real number in between, where $a$ is less than or equal to $b$.[^1]  The closed unit interval is one example of a compact interval.
- A function $f(\lambda)$ is _bounded_ if there are two real numbers $a$ and $b$ such that $a\le f(\lambda) \le b$ over the domain of $f$.
- The _least upper bound_ of a function $f(x)$ is the smallest number $b$ such that $f(x) \le b$ over the domain of $f$.  If $f$ is continuous, the least upper bound is the same as the maximum.
- An _operator_ is a mapping from a function to a function.
    - An operator $L$ is _linear_ if it satisfies $L(af)=aL(f)$ and $L(f+g)=L(f)+L(g)$ for all allowed functions $f$ and $g$ and every number $a$.[^2].
    - An operator $L$ is _positive_ if it has the property that, if an allowed function $f$ is nonnegative on its domain, so is $L(f)$.[^3]
    - The _operator norm_ of an operator $L$ is the least upper bound of the following value over all allowed functions $f$ other than 0: the "norm" of $L(f)$ divided by the "norm" of $f$ (De Villiers 2012, (5.2.2))[^4].[^5]  The "norm" of $L(f)$ and that of $f$ depend on the spaces of functions that $L$ maps to and from, respectively.
    - An operator is _bounded_ if its operator norm is finite.
- The _expected value_ (or mean or “long-run average”) of a random variable $Y$ is denoted $\mathbb{E}[Y]$.
- A _modulus of continuity of order 1_ of a function _f_, denoted $\omega_1(f, \delta)$, means a nonnegative and nowhere decreasing function where, for each $\delta\ge 0$, $\text{abs}(f(x)-f(y))\le\omega_1(f, \delta)$ whenever $x$ and $y$ are in $f$'s domain and no more than $\delta$ apart.  Loosely speaking, $\omega_1(f, \delta)$ gives how much $f$ can vary when $f$ is restricted to a window of size $\delta$ or less.  The modulus of continuity reflects the "regularity" of $f$; generally, the smaller it is, the more "regular".
- In this document:
    - $e_i$ is a function such that $e_i(t) = t^i$, so that $e_0(t) = 1$ and $e_1(t) = t$; as an example, if $L(f) = f(0) + f(1)$, then $L(e_1 - x)$ = $(e_1(0) - x) + (e_1(1) - x)$ = $(0-x)+(1-x)=1-2x$.
    - The notation $\Vert f\Vert$, where $f$ is a function, means the function's "norm", which is the maximum absolute value over its domain unless the context indicates otherwise.
    - The notation $\Vert L\Vert_{op}$, where $L$ is an operator, means its operator norm; the "norm" used to define the operator norm is the maximum absolute value unless noted otherwise.

<a id=Bernstein_Form_and_Bernstein_Polynomials></a>

## Bernstein Form and Bernstein Polynomials

Among the best known examples of linear operators are the Bernstein polynomials.

In this document, a polynomial $P(x)$ is written in _Bernstein form of degree $n$_ if it is written as&mdash;

$$P(x)=\sum_{k=0}^n a_k \frac{n!}{(k!)((n-k)!)} x^k (1-x)^{n-k},$$

where $0\le x\le 1$ and the real numbers $a_0, ..., a_n$ are the polynomial's _Bernstein coefficients_.[^6]

The degree-$n$ _Bernstein polynomial_ of a function $f(x)$, denoted $B_n(f)$ in this document, has Bernstein coefficients $a_k = f(k/n)$.  In general, this Bernstein polynomial differs from $f$ even if $f$ is a polynomial.

$B_n(f)$ is a positive linear operator. It maps a function like $f(x)$ on the closed unit interval to a polynomial of degree $n$ or less on that interval.

This page's emphasis is on methods that produce polynomials in Bernstein form, ratios of such polynomials, or functions like $f(g(x))$ where $f$ and $g$ are such polynomials or ratios.

<a id=Moments_of_Linear_Operators></a>

## "Moments" of Linear Operators

To examine the approximation behavior of linear operators, it is helpful to find the so-called "moments" of those operators, that is, the functions they map certain functions to.

For a linear operator $L$, they are:

- "Raw moments": The values of $L(e_i)$ for each integer $i\ge 0$.
- "Central moments": The values of $L((e_1-x)^i)$ for each integer $i\ge 0$.  If the "raw moments" $L(e_0), ..., L(e_j)$ are known, then $L((e_1-x)^j)$ is also known, thanks to proposition 5.6 of Gonska et al. (2006)[^7].
- "Absolute moments": The values of $L(\text{abs}(e_1-x)^i)(x)$ for each integer $i\ge 0$.  When $i$ is even, $L(\text{abs}(e_1-x)^i)$ = $L((e_1-x)^i)$.

Because $L$ is linear, if $L(e_i) = e_i$ for each $i$ from 0 through $j$ ($j$ is zero or a positive integer), then:

- $L$ _reproduces all polynomials_ up to degree $j$ (that is, $L(f) = f$ whenever $f$ is a polynomial of degree $j$ or less).
- The $0$-th "central moment" is $L(e_0)$ = $L((e_1-x)^0)$ = 1, and for each $i$ from 1 through $j$, $L((e_1-x)^j) = 0$.

Also, because $L$ is linear, the "moments" of degree up to $m$, say, lead to easy ways to find the mapping by $L$ of any polynomial of degree up to $m$, when the polynomial is written in "power" form.

> **Example:** Let $f(x)$ be the polynomial $4x^3 - 6x^2 + 8x^1 - 10$.  Then:
>
> $$L(f) = 4L(e_3) - 6L(e_2) + 8L(e_1) - 10L(e_0).$$

<a id=Moments_of_Bernstein_Polynomials></a>

### "Moments" of Bernstein Polynomials

The following results deal with useful quantities when discussing the error in approximating a function by Bernstein polynomials.

Suppose a coin shows heads with probability $p$, and $n$ independent tosses of the coin are made, where $n$ is 1 or greater.  Then the total number of heads $X$ follows a _binomial distribution_.  The following are useful quantities of this distribution.

- $T_{n,r}$: The _central moment_ (moment about the mean) of $X$ is denoted $T_{n,r}(p)$ = $\mathbb{E}[(X-\mathbb{E}[X])^r]$ = $B_n((e_1-p)^r)(p)\cdot n^r$. Formulas for computing this central moment are given in Skorski (2024)[^8].
- $S_{n,r}$: Traditionally, the central moment of $X/n$ or the ratio of heads to tosses is denoted $S_{n,r}(p)$ = $T_{n,r}(p)/n^r$ = $\mathbb{E}[(X/n-\mathbb{E}[X/n])^r]$ = $B_n((e_1-p)^r)(p)$.  ($T$ and $S$ are notations of S.N. Bernstein, known for Bernstein polynomials.) $S_{n,r}$ is thus the $r$-th "central moment" of degree-$n$ Bernstein polynomials.
- $M_{n,r}$: The $r$-th _central absolute moment_ of $X/n$ is denoted $M_{n,r}(p)$ = $\mathbb{E}[\text{abs}(X/n-\mathbb{E}[X/n])^r]$ = $B_n(\text{abs}(e_1-p)^r)(p)$.  If $r$ is even, $M_{n,r}(p) = S_{n,r}(p)$. $M_{n,r}$ is thus the $r$-th "absolute moment" of degree-$n$ Bernstein polynomials.

The following gives bounds on $M_{n,r}$; some results in approximation theory rely on bounds like these.[^9]

**Proposition 1**: _Let $r\ge 0$, and let $\sigma(r,t) = (r!)/(((r/2)!)t^{r/2})$.  Then for real numbers $r$ and integers $n$ described in the following table,_ $M_{n, r}(p)\le \mu_{n,r}/n^{r/2}$, _where_ $\mu_{n,r}$ _is as given in the table._

| If $r$... |  Then $\mu_{n,r}$ is...  |
 --- | ---- |
| Is an even integer. | $\sigma(r,6)$, for positive $n$. |
| Is an even integer, but not greater than 44. |  $\sigma(r,8)$, for positive $n$. |
| Is 1. | $1/2$, for positive $n$. |
| Is odd, and $3\le r\le 43$. | $\sqrt{\sigma(r-1,8)\sigma(r+1,8)} = r^{1/2}(r-1)! / (2\cdot 8^{(r-1)/2}((r-1)/2)!)$, for $n\ge 2$. |
| Is odd and greater than 43. | $\sqrt{\sigma(r-1,6)\sigma(r+1,6)}$, for $n\ge 2$. |

_Proof:_ The first row comes from a result of Adell and Cárdenas-Morales (2018)[^10].  The second row is an improved result of the first, from Molteni (2022)[^11].  The third row follows from Cheng (1983)[^12].  The fourth and fifth rows follow from the first and second as well as that the absolute central moment for odd $r$ can be overestimated for every integer $n\ge 2$, using Schwarz's inequality (Weisstein)[^13] \(see also Bojanić and Shisha 1975[^14] for the case $r=4$). &#x25a1;

<a id=Taylor_Expansion_of_Linear_Operators></a>

## Taylor Expansion of Linear Operators

Continuous functions can be "unwrapped" into a Taylor expansion.  The linear mapping of those functions also has a Taylor expansion of sorts, which is described next.

Let $f(\lambda)$ have a continuous $s$-th derivative on a compact interval, where $s$ is zero or a positive integer, and let $L(f)$ be a linear operator that maps continuous functions on that interval to functions of that kind.  Then:

$$L(f)(\lambda) = L(R_s(f, \lambda)) + \sum_{i=0}^s L((e_1-\lambda)^i)(\lambda)\frac{f^{(i)}(\lambda)}{i!}, \tag{1}$$

where $R_s(f,\lambda)$ is the "remainder" after subtracting from $f$ the degree-$s$ Taylor polynomial of $f$ centered at $\lambda$. (See also Piţul (2007, proof of theorem 5.8)[^15].)  $R_s(f,\lambda)$ is 0 if $f$ is a polynomial of degree $s$ or less.

If $L$ reproduces constants, so that $L(e_0)=1$, this becomes:

$$L(f)(\lambda) - f(\lambda) = L(R_s(f, \lambda)) + \sum_{i=1}^s L((e_1-\lambda)^i)(\lambda)\frac{f^{(i)}(\lambda)}{i!}.\tag{2}$$

If $L$ reproduces polynomials up to degree $s$, this even reduces to $L(f)(\lambda) - f(\lambda) = L(R_s(f, \lambda))$.

It can be seen from the expansions just given that finding upper bounds for $L_n(f)(\lambda)$ involves:

- Finding upper bounds for $L$'s "central moments" up to the $s$-th order.
- Finding upper bounds for $L(R_s(f,\lambda))$. If $L$ is positive linear, such bounds are given in the section "[**Bounds for General Positive Linear Operators**](#Bounds_for_General_Positive_Linear_{op}erators)". If $L$ is nonpositive linear, bounds are given in the section "[**Bounds for General Linear Operators**](#Bounds_for_General_Linear_{op}erators)", and this can be helped if $L$ can be written as a difference between two positive linear operators $LA$ and $LB$, so that $L(f) = LA(f) - LB(f)$.[^16]  See the "[**Example**](#Example)" section later in this document.

Meanwhile, bounds for the derivatives of $f$ (here, $f^{(i)}$) are often assumed to be known beforehand.

<a id=Results_on_Error_Bounds></a>

## Results on Error Bounds

Some results on error bounds for certain classes of operators.

<a id=Bounds_for_General_Positive_Linear_Operators></a>

### Bounds for General Positive Linear Operators

The results in this section give bounds that apply to large classes of positive linear operators.

But many classes of positive linear operators, including Bernstein polynomials, generally do not approximate functions with more than two continuous derivatives "better" than functions with only two (Voronovskaya 1932)[^17], (DeVore 1972/2006)[^18], (Cárdenas-Morales et al. 2012)[^19].

In this section:

- $\sigma_i = L((e_i-\lambda)^i)(\lambda)$ (the $i$-th "central moment" of the linear operator $L$ in question).
- $\tau_i = L(\text{abs}(e_i-\lambda)^i)(\lambda)$  (the $i$-th "absolute moment" of the linear operator $L$ in question).
- $\omega_1(f, \cdot)$ is the smallest modulus of continuity of a function $f$ of order 1.
- $\tilde\omega_1(f, \cdot)$ is the smallest concave modulus of continuity of $f$ of order 1.

**Lemma 1**. _Let $f(\lambda)$ be continuous on a compact interval, and let $L$ be a positive linear operator that maps continuous functions on that interval to functions of that kind and reproduces all constants (so that_ $L(e_0) = 1$ _).  Then:_

| No. | $\text{abs}(L(f)(\lambda)-f(\lambda))\le ...$ |
 - | ----- |
| 1 | $\tilde\omega_1(f, \tau_1)$. |
| 2 | $2 \omega_1(f, (\sigma_2)^{1/2})$. |
| 3 | $(1 + (\sigma_2)^{1/2}/h) \omega_1(f, h)$. |
| 4 | $(1 + (\sigma_2)/h^2) \omega_1(f, h)$. |
| 5 | (Use ineq. 3 if $h<(\sigma_2)^{1/2}$, or ineq. 4 otherwise.) |
| 6 | $\tilde\omega_1(f, (\sigma_2)^{1/2})$. |
| 7 | $(1 + 1/h^2) \omega_1(f, h\cdot\text{Max}(\sigma_2)^{1/2})$. |

_In the table, $\text{Max}(\sigma_2)$ is the maximum of $\sigma_2$ over all values of $\lambda$ in the compact interval._

_Proof:_ Inequality 1 follows from a result of Gonska and Meier (1985, theorem 3.1)[^20]. Inequality 2 follows from a result of Shisha and Mond (1968, theorem 1)[^21]; inequality 4 comes from another result in the same paper (see also Mamedov (1959)[^22]); inequality 7 follows from a result of Mond (1978)[^23]; inequality 3 is a special case of Remark 1.2.5 of Păltănea (2004)[^24]; inequality 5 is from corollary 1.2.2 of the same book; inequality 6, a result of Peetre (1969)[^25] \(also mentioned in Gonska (1998/2023)[^26], which has an extensive discussion on error bounds for linear operators). &#x25a1;

**Remark 1:** The moduli of continuity $\omega_1(f, \delta)$ and $\tilde\omega_1(f, \delta)$ offer concise ways to express different error bounds depending on how "regular" $f$ is.  Properties of these moduli are given in Sevy 1991[^27], sec. 2.0.2; Gonska 1985[^28]. For example, let $f$ be continuous on a compact interval.  Then:

- $\omega_1(f,\delta)\le\tilde\omega_1(f,\delta)$ (Peetre 1969)[^29].
- If $f$ is Hölder continuous with exponent $\alpha$ ($0\lt\alpha\le 1$) and constant $M$ or less, $\omega_1(f,\delta)\le\tilde\omega_1(f,\delta)\le M\delta^\alpha$.  Indeed, in this case, $f$ admits the continuous and concave modulus of continuity $\omega_1(\delta)=M\delta^\alpha$, where $\delta>0$.
- If $f$:
    1. is Lipschitz continuous with Lipschitz constant $M$ or less, or
    2. has a continuous derivative with maximum absolute value $M$ or less,

    then $\omega_1(f,\delta)\le\tilde\omega_1(f,\delta)\le M\delta$; in case (1) because $f$ is Hölder continuous with Hölder exponent 1, and in case (2) because of a result of Hardy and Littlewood.

> **Example:** Let $f$ and $L$ be as in Lemma 1. If $f$ has a continuous derivative with maximum absolute value $M$ or less, $\text{abs}(L(f)(\lambda)-f(\lambda))\le M (\sigma_2)^{1/2}$; this follows from the combination of Remark 1 and inequality 6 of Lemma 1.

**Lemma 2**. _Let $f(\lambda)$ be continuous on a compact interval, and let $L$ be a positive linear operator that maps continuous functions on that interval to functions of that kind and reproduces all polynomials up to degree 1 (constants and linear functions).  Let $h>0$ be a real number. Then:_

| No. | If $f$ ... |  Then abs($(L(f)(\lambda)-f(\lambda))$ &le; ... |
 - | --- | ----- |
| 1 | Has a continuous derivative. | $((h+2)^2/(8h))\cdot \omega_1(f^{(1)}, h\cdot\sqrt{\sigma_2}) \cdot\sqrt{\sigma_2}$. |
| 2 | Has a continuous derivative. | $\frac{1}{2}(\sigma_2)^{1/2} \tilde\omega_1(f^{(1)}, (\sigma_2)^{1/2})$. |
| 3 | Has a Hölder-continuous derivative with Hölder exponent $\alpha$ ($0\lt\alpha\le 1$) and Hölder constant $M$ or less. | $\frac{M}{2}(\sigma_2)^{(1+\alpha)/2}$. |
| 4 | Has a Lipschitz-continuous derivative with Lipschitz constant $M$ or less, or has a continuous second derivative with maximum absolute value $M$ or less. | $\frac{M}{2} (\sigma_2)$. |

_Proof:_  Inequality 1 is a special case of Theorem 2.19 (in conjunction with Remark 2.21) of Anastassiou (1985), with the interval $[a, b]$, $m=1$ (since the function is defined on all of $[a, b]$), $r=h$, and $x_0$ equal to $\lambda$.  Inequality 2 follows from a result of Gonska and Meier (1985, theorem 4.1)[^20]; see also Păltănea and Dimitriu (2016, remark 3)[^30]. Inequalities 3 and 4 follow from inequality 2 because of Remark 1. &#x25a1;

**Lemma 3**. _Let $f(\lambda)$ have a continuous $k$-th derivative on a compact interval, and let $L$ be a positive linear operator that maps continuous functions on that interval to functions of that kind.  Let $h>0$ be a real number. Then $L(f)(\lambda) = L(Q_k(f,\lambda))(\lambda) + L(R_k(f,\lambda))(\lambda)$, where:_

$$\text{abs}(L(Q_k(f,\lambda)) - f(\lambda))\le \left(\sum_{i=0}^k \frac{\max(\text{abs}(f^{(i)})) \text{abs}(\sigma_i)}{i!}\right),$$

$$\text{abs}(L(R_k(f,\lambda)))\le\left(\frac{\tau_k}{k!}+\frac{\tau_{k+1}}{(k+1)!\cdot h}\right)\cdot\omega_1(f^{(k)}, h),$$

$$\text{and }\text{abs}(L(R_k(f,\lambda)))\le\max\left(\frac{\tau_k}{k!}, \frac{\tau_{k+1}}{(k+1)!\cdot 2h}\right)\cdot\tilde\omega_1(f^{(k)}, 2h),$$

$$\text{and }\text{abs}(L(R_k(f,\lambda)))\le\frac{\tau_k}{k!}\cdot\tilde\omega_1(f^{(k)}, \frac{\tau_{k+1}}{(k+1)\tau_k}),$$

_and where:_

- $Q_k(f,\lambda)=$ $\sum_{i=0}^k f^{(i)}(\lambda)\cdot(e_0-\lambda)^i/(i!)$ _is the degree-$k$_ Taylor polynomial _of $f$ centered at $\lambda$._
- $R_k(f,\lambda)$ _is the_ Taylor remainder _that results from subtracting $Q(f,\lambda)$ from $f$._

_Proof:_  The second to fourth bounds given relate to the Taylor remainder.  The second bound comes from Păltănea and Smuc (2019, Theorem 1)[^31]; the third bound comes from corollary 3.2 of Dimitriu (2010)[^32] and Brudnyĭ's lemma; and the fourth bound follows from the second with $h=\tau_{k+1}/(2(k+1)\tau_k)$ and comes from Gonska et al. (2006)[^33], where the compact interval assumed was the closed unit interval; see also Gonska (2007)[^34], Piţul (2007)[^15].  See also Anastassiou (1985, theorem 2.31)[^35].[^36]&#x25a1;

**Lemma 4.** _Let $k$ be zero or a positive integer. Let $f(\lambda)$&mdash;_

1. _have a Lipschitz-continuous $k$-th derivative on a compact interval, with Lipschitz constant $M$ or less, or_
2. _have a continuous $(k+1)$-th derivative on that interval, with maximum absolute value $M$ or less,_

_and let $L$ be a positive linear operator that maps continuous functions on that interval to functions of that kind.  Then_ $\text{abs}(L(R_k(f,\lambda)))\le M \tau_{k+1}/((k+1)!)$, _where_ $R_k(f,\lambda)$ _is as in Lemma 3._

_Proof:_  Follows from the third bound for $L(R_k(f,\lambda))$ in Lemma 3 in the same manner as inequality 10 of Lemma 2, using Remark 1. &#x25a1;

The following two lemmas are more general, but not as easy to use.

**Lemma 4A** (special case of Theorem 3.4 in Gonska (1998/2023)[^26]). _Let $f(\lambda)$ be continuous on a compact interval or a closed subset thereof, and let $L$ be a positive linear operator that maps continuous functions on $f$'s domain to bounded functions on that domain.  Let $h>0$ be a real number.  Then:_

$$\begin{multline}\text{abs}(L(f)(\lambda)-f(\lambda))\le\max(\text{Max}(L(e_0)) ,L(\text{abs}(e_1-\lambda))(\lambda))\cdot\tilde\omega_1(f,h)\\\\+\text{abs}(L(e_0)(\lambda)-1)\cdot\text{abs}(f(\lambda))\\\\\le(\text{Max}(L(e_0)) +L(\text{abs}(e_1-\lambda))(\lambda))\cdot\tilde\omega_1(f,h)+\text{abs}(L(e_0)(\lambda)-1)\cdot\text{abs}(f(\lambda)),\end{multline}$$

_where_ $\text{Max}(L(e_0))$ _is the maximum of $L(e_0)$ over $f$'s domain._

**Lemma 4B** (special case of Theorem 4.7 in Gonska (1998/2023)[^26]). _Let $f(\lambda)$ be continuous on a compact interval, and let $L$ be a positive linear operator that maps bounded functions on $f$'s domain to bounded functions on that domain.  Let $h>0$ be a real number.  Then:_

$$\begin{multline}\text{abs}(L(f)(\lambda)-f(\lambda))\le(L(e_0)(\lambda)\\\\+L(\text{ceil}((e_1-\lambda)/h-1))(\lambda))\cdot\omega_1(f,h)\\\\+\text{abs}(L(e_0)(\lambda)-1)\cdot\text{abs}(f(\lambda)),\end{multline}$$

$$\begin{multline}\text{abs}(L(f)(\lambda)-f(\lambda))\le(L(e_0)(\lambda)\\\\+L(\text{abs}(e_1-\lambda))(\lambda)/h)\cdot\omega_1(f,h)\\\\+\text{abs}(L(e_0)(\lambda)-1)\cdot\text{abs}(f(\lambda)).\end{multline}$$

_The second inequality also works if $L$ maps from continuous functions instead of from bounded functions._

> **Notes:**
>
> 1. Using Lemma 4A requires calculating $L(e_0)$, $\text{Max}(L(e_0))$, and $L(\text{abs}(e_1-\lambda))$, or finding upper bounds for these.
> 2. Using Lemma 4B requires calculating $L(e_0)$ and either $L(\text{abs}(e_1-\lambda))$ or $L(\text{ceil}((e_1-\lambda)/h-1))$, or finding upper bounds for these values.
> 3. Unlike Lemma 4A, Lemma 4B is not guaranteed to work if $f$'s domain is a closed subset of a compact interval (see Remark 2.5 in Gonska (1998/2023)[^26]).

The following lemma adapts the previous lemmas to the setting of random variables.

**Lemma 5.** _Let $f(\lambda)$ be continuous on a compact interval, and let $Y$ be a random variable taking only values in that interval.  Then Lemmas 1 through 4A apply as appropriate to $f$ meeting their conditions, with $L(f)=\mathbb{E}[f(Y)]$ and $\lambda =\mathbb{E}[Y]$._

_Proof_: With these assumptions there is a positive linear operator $L(f) = \mathbb{E}[f(Y)]$ for $Y$ and $f$, according to Theorem 3.1.1 of Frantz (1984)[^37], letting $x_o = \lambda$.  Then $L(e_0)$ = $\mathbb{E}[e_0(Y)]$ = $\mathbb{E}[1]$ = 1 regardless of $Y$, and  $L(e_1)$ = $\mathbb{E}[e_1(Y)]$ = $\mathbb{E}[Y]$ = $\lambda$, so $L$ reproduces all polynomials of degree up to 1. &#x25a1;

<a id=Bounds_for_Remainder_of_Bernstein_Polynomials></a>

### Bounds for Remainder of Bernstein Polynomials

The following results specialize the previous ones to the case of [**Bernstein polynomials**](#Bernstein_Form_and_Bernstein_Polynomials) $B_n$.  They apply to the Bernstein polynomial of the result of subtracting a Taylor polynomial from a function, and are useful when a linear operator contains $B_n(f)$ in its definition and reproduces all polynomials of degree $r$ or less.

**Lemma 6**: _Let $k$ be zero or a positive integer.  Let $f(\lambda)$&mdash;_

1. _have a Lipschitz-continuous $k$-th derivative on the closed unit interval, with Lipschitz constant $M$ or less, or_
2. _have a continuous $(k+1)$-th derivative on that interval, with maximum absolute value $M$ or less._

_Then the following bound holds true:_ $\text{abs}(B_n(R_k(f, \lambda)) \le (M \mu_{k+1})/ ( ((k+1)!) n^{(k+1)/2})$ _for every integer $n\ge 2$ (and also for $n=1$ if $k$ is odd), where_ $\mu_k$ _is as defined in Proposition 1._

_Proof_: Follows from Lemma 4, with $L(f)=B_n(f)$, and from Proposition 1. &#x25a1;

**Corollary 1**: _Let $f(\lambda)$, $k$, and $M$ be as in Lemma 6.  Then, for every $0\le\lambda\le 1$:_

| If $k$ is: | Then $\text{abs}(B_n(R_k(f, \lambda))) \le$ ... |
 - | ------ |
| 0. | $M(1/2)/n^{1/2}$ for every integer $n\ge 1$. |
| 1. | $M(1/8)/n = 0.125M/n$ for every integer $n\ge 1$. |
| 2. | $M(\sqrt{3}/48)/n^{3/2} < 0.3609M/n^{3/2}$ for every integer $n\ge 2$. |
| 3. | $M(1/128)/n^{2} = 0.0078125M/n^{2}$ for every integer $n\ge 1$. |
| 4. | $M(\sqrt{5}/1280)/n^{5/2} < 0.001747/n^{5/2}$ for every integer $n\ge 2$. |
| 5. | $M(1/3072)/n^{3} < 0.0003256/n^{3}$ for every integer $n\ge 1$. |

<a id=Bounds_for_General_Linear_Operators></a>

### Bounds for General Linear Operators

The results in this section give error bounds for important classes of linear operators (not necessarily positive ones).  But, in general, they are harder to use than the ones for positive linear operators, because more has to be computed for nonpositive operators than just the "moments".

Roughly speaking, the _integral_ of $f(\lambda)$ on the compact interval $[a,b]$ is the "area under the graph" of that function when the function is restricted to that interval.  If $f$ is continuous there, this is the value that&mdash;

$$\frac{b-a}{n} \sum_{i=1}^n f\left(a+(b-a)(i-\frac{1}{2})/n\right),\tag{2A}$$

approaches as $n$ gets larger and larger.[^38] The integral of $f(\lambda)$ on $[a,b]$ is denoted $\int_a^b f(\lambda) d\lambda$.

The next two lemmas rely on the so-called _Peano kernel theorem_, which was originally developed to assess the error in estimating the integral of a function from samples of it[^39] \(for more on this theory, see Brass and Förster 1998[^40]; Waldron 1999[^41]).

**Lemma 7.** _Let $k$ be zero or a positive integer, let $f(\lambda)$ have a continuous $(k+1)$-th derivative on the compact interval $[a, b]$, where that derivative has maximum absolute value $M$ or less.  Let $C$ and $c$ be real numbers such that $c\le f^{(k+1)}\le C$ over that interval. Let $L$ be a bounded linear operator that&mdash;_

- _reproduces all polynomials of degree $k$ or less, and_
- _maps continuous functions (or, if $k=0$, bounded functions) on the interval $[a, b]$ to continuous functions on that interval._

_Let $LF(f) = f - L(f)$.  Then, whenever $a\le\lambda\le b$:_

$$\begin{multline}\text{abs}(LF(f)(\lambda)) = \text{abs}(f(\lambda) - L(f)(\lambda))\\\\\le \frac{C - c}{2}\int_a^b \text{abs}\left(LF(\lgroup e_1-t\rgroup_+^k)(\lambda)/(k!)\right) dt\quad\quad\mbox{(3)}\\\\= \frac{C - c}{2(k!)} \int_a^b \text{abs}\left(LF(\lgroup e_1-t\rgroup_+^k)(\lambda)\right) dt\quad\quad\mbox{(4)}\\\\= \frac{C - c}{2(k!)} \left\lgroup\int_a^\lambda \text{abs}\left(LF(\lgroup e_1-t\rgroup_+^k)(\lambda)\right) dt +\\\\\int_\lambda^b \text{abs}\left(LF(\lgroup e_1-t\rgroup_+^k)(\lambda)\right) dt\right\rgroup\\\\= \frac{C - c}{2(k!)} \left\lgroup\int_a^\lambda \text{abs}\left((\lambda-t)^k - L(\lgroup e_1-t\rgroup_+^k)(\lambda)\right) dt +\\\\
\int_\lambda^b \text{abs}\left(L((e_1-t)_+^k)(\lambda)\right) dt\right\rgroup,\\\\\end{multline}$$

$$\begin{multline}
\text{abs}(LF(f)(\lambda))\le \frac{M}{k!} \int_a^b \text{abs}\left(LF(\lgroup e_1-t\rgroup_+^k)(\lambda))\right) dt,\quad\quad\mbox{(5)}
\end{multline}$$

_where the notation_ $\lgroup x\rgroup^k_+$ _is as follows. If $k\gt 0$, this equals $((x+\text{abs}(x))/2)^k$, or $\max(0, x)^k$, and if $k$ is 0, this equals either 1 if $x\ge 0$ or 0 otherwise._

Formulas (3) and (4) are because, in this case, the operator $LF$ equals 0 for every polynomial of degree $k$ or less, so that $LF(e_i)=0$ whenever $0\le i\le k$, so that $LF$ satisfies theorem 3 of Gavrea and Ivan (2015)[^42]. Formula (5) is an easy consequence of (4); see also Brass and Förster (1998, theorem 5)[^40].[^43]

> **Note:** The operator&mdash;
>
> $$\frac{LF(\lgroup e_1-t\rgroup_+^k)}{k!} = \frac{\lgroup e_1-t\rgroup_+^k - L(\lgroup e_1-t\rgroup_+^k)}{k!},$$
>
> where $k\ge 0$, is called the _Peano kernel of order $k+1$_ of $LF$ (Brass and Förster 1998)[^40]), with a fixed value of $t$ such that $a\le t\le b$.  But finding a "closed form" of Peano kernels is relatively hard compared to "raw moments" and "central moments".  Luckily, only an upper bound of the Peano kernel is needed to use the formulas in this lemma.

**Lemma 8** (see Theorem 4 of Gavrea and Ivan (2015)[^42]). _With the assumptions in Lemma 7, if $LF$ is the difference of two positive linear operators $LA$ and $LB$, so that $LF(f)=LA(f)-LB(f)$ (or $L(f)=f-LA(f)+LB(f)$), and $LA$ and $LB$ both map continuous functions on that interval to functions of that kind, then:_

$$\text{abs}(L(f)(\lambda) - f(\lambda))\le \frac{C - c}{(k+1)!} \text{abs}(LA(e_{k+1})(\lambda)),$$

$$\text{abs}(L(f)(\lambda) - f(\lambda))\le \frac{2M}{(k+1)!} \text{abs}(LA(e_{k+1})(\lambda)).$$

**Lemma 9** (special case of Theorem 3.2 in Gonska (1998/2023)[^26]). _Let $f(\lambda)$ be continuous on a compact interval or a closed subset thereof, and let $L$ be a bounded linear operator that maps continuous functions on $f$'s domain to bounded functions on that domain.  Let $h>0$ be a real number.  Then for each $\lambda$ in $f$'s domain:_

$$\begin{multline}\text{abs}(L(f)(\lambda)-f(\lambda))\le\max((\Vert L\Vert_{op}+\alpha)/2, (\gamma(\beta(\lambda)-L(e_0)(\lambda))+\\\\\text{abs}(L(\text{abs}(e_1-\lambda))(\lambda)))/h)\\\\\cdot\tilde\omega_1(f,h)+\text{abs}(L(e_0)(\lambda)-1)\cdot\text{abs}(f(\lambda)),\end{multline}$$

_where:_

- _$\alpha$ is the maximum of_ $\text{abs}(L(e_0))$ _over $f$'s domain._
- $\Vert L\Vert_{op}$ _is the operator norm of $L$, where the "norm" used to define the operator norm is the least upper bound on the absolute value._[^44]
- _$\beta(\lambda)$ is the least upper bound of $\text{abs}(L(g)(\lambda))$ over all continuous functions $g$ on $f$'s domain with a maximum absolute value of 1 or less._
- _$\gamma$ is the difference between the highest and lowest value of $\lambda$ in $f$'s domain._

**Lemma 10.** _With the assumptions in Lemma 9, if $L$ reproduces constants, so that_ $L(e_0)=1$, _the inequality in that lemma becomes:_

$$\begin{multline}\text{abs}(L(f)(\lambda)-f(\lambda))\le\max((1+\Vert L\Vert_{op})/2, (\gamma(\beta(\lambda)-1)\\\\+\text{abs}(L(\text{abs}(e_1-\lambda))(\lambda)))/h)\cdot\tilde\omega_1(f,h).\end{multline}$$

**Lemma 11** (special case of Theorem 4.4 and Corollary 4.5 in Gonska (1998/2023)[^26]). _Let $f(\lambda)$ be continuous on a compact interval $[a, b]$, and let $L$ be a bounded linear operator that maps continuous functions on $f$'s domain to bounded functions on that domain.  Let $h>0$ be a real number.  Then for each $\lambda$ in $f$'s domain:_

$$\begin{multline}\text{abs}(L(f)(\lambda)-f(\lambda))\le\big((\beta(\lambda)-\text{abs}(L(e_0)(\lambda)))\cdot(1+(b-a)/h)\\\\+\text{abs}(L(e_0)(\lambda))+\text{abs}(L(\text{abs}(e_1-\lambda))(\lambda))/h\big)\cdot\omega_1(f,h)\\\\+\text{abs}(L(e_0)(\lambda)-1)\cdot\text{abs}(f(\lambda)),\end{multline}$$

_where $\beta(\lambda)$ is as in Lemma 9._

**Lemma 12.** _With the assumptions in Lemma 11, if $L$ reproduces constants, so that_ $L(e_0)=1$, _the inequality in that lemma becomes:_

$$\begin{multline}\text{abs}(L(f)(\lambda)-f(\lambda))\le\big((\beta(\lambda)-1)\cdot(1+(b-a)/h)\\\\+1+\text{abs}(L(\text{abs}(e_1-\lambda))(\lambda))/h\big)\cdot\omega_1(f,h)\end{multline}$$

&nbsp;

>**Note:** Lemmas 11 and 12 are not guaranteed to work if $f$'s domain is a closed subset of a compact interval, unlike Lemmas 9 and 10 (see Remark 2.5 in Gonska (1998/2023)[^26]).

<a id=Inequalities_on_Polynomial_Errors></a>

### Inequalities on Polynomial Errors

The following inequalities give bounds on the "best possible" error that a polynomial of degree $n$ can achieve in approximating a function.

**Lemma 13**. _Let $n$ be zero or a positive integer, let $k$ be a positive integer, let $f(\lambda)$ be continuous on a compact interval $[a, b]$, and let $P$ be a polynomial of degree $n$ or less with the least maximum absolute difference between $f$ and the polynomial on that interval.  Then the error of $P$ in approximating $f$ is bounded as follows (see Babenko and Kryakin 2019[^45], Babenko and Kryakin 2018[^46], and references therein):_

$$\text{abs}(f(\lambda)-P(\lambda))\le\begin{cases} W \cdot \omega_{n+1}(f,\frac{b-a}{n+1}) & \textrm{(Wh)}\\\\ J\cdot\omega_k(f,\frac{\alpha\pi}{n+1}), & \textrm{(JS)}\end{cases}$$

_where:_

- _$W$ is:_
    - 1/2 _if $n$ is 0 or 1 (Whitney 1957)[^47]._
    - 1 _if $2\le n\le 7$._
    - 2 _if $8\le n\lt 81999$._
    - $(2+\exp(-2)) (< 2.13534)$ _if_ $n\ge 81999$.
    - _$3/4$ if $n=1$ and $f$ is convex (Singh Kaire and Prymak 2023/2025)[^48]._
    - _$1/2$ if $n=1$, $f$ is convex, and $a=-b$ (Singh Kaire and Prymak 2023/2025)[^48]._
- _$J$ is (Babenko and Kryakin 2018[^46]):_
    - 1 _if $k=1$ and $\alpha=1$._
    - _$3/4+3/(16\alpha^2)$ if $k=2$ and $n\ge 1$._
    - 4.38 _if $k=4$, $\alpha=1$, and $n\ge 11$._
    - 2.59 _if $k=4$, $\alpha=2$, and $n\ge 11$._
    - 8.9 _if $n\ge k(k-1)-1$, $k$ is 2, 4, 6, or 8, and $\alpha$ is 1 or 2._
    - 9.74 _if $n\ge k(k-1)-1$, $k\ge 10$, $k$ is even, and $\alpha=2$._
- $\alpha\gt 0$.
- $\omega_{n}(f, h)$ _is the smallest modulus of continuity of $f$ of order $n$, with parameter $h$._
- _The inequality (JS) is valid only for the compact interval $[-1,1]$._

> **Note:** The inequality (Wh) is also known as Whitney's inequality; the inequality (JS), the Jackson&ndash;Stechkin inequality.

**Lemma 13A**.  _With the assumptions in Lemma 13, if $f$ has a continuous $(n+1)$-th derivative whose maximum absolute value is $M$ or less, then:_

$$\text{abs}(f(\lambda)-P(\lambda))\le \frac{M (b-a)^{n+1}}{((n+1)!)\cdot 2^{2n+1}}. \tag{Ph}$$

&nbsp;

>**Note:** The following are references on the inequality (Ph): Brass and Petras (2011, example 3.1.2)[^49]; Phillips (2003, theorem 2.4.6)[^50].

Using properties of moduli of continuity (see Sevy 1991[^27], sec. 2.0.2; Gonska 1985[^28]), if $f$ has a continuous $(n+1)$-th derivative on $[a, b]$:

$$\text{abs}(f(\lambda)-P(\lambda))\le W \cdot \left(\frac{b-a}{n+1}\right)^{n+1}\max(\text{abs}(f^{(n+1)})),$$

and if $f$ has a continuous $n$-th derivative on that interval:

$$\text{abs}(f(\lambda)-P(\lambda))\le W \cdot \left(\frac{b-a}{n+1}\right)^n\omega_1(f^{(n)}, \frac{b-a}{n+1}).$$

&nbsp;

>**Note:** Upper bounds similar to those in this section can be found by considering an operator $L$ that maps continuous functions to all functions in a certain family (such as polynomials of degree $n$ or less, as in this section); in that case $P$ would be a function in the family with the "best approximation" to $f$.  As one example, Marsden (1972)[^51] \(see also Beutel et al. 2002[^52]) proved an upper bound of this kind using an operator that maps to a family of _splines_, that is, continuous functions whose pieces are polynomials. So did De Boor (1968)[^53].

<a id=Lebesgue_Inequality_for_Certain_Linear_Operators></a>

### Lebesgue Inequality for Certain Linear Operators

For certain operators, the approximation error of a function under that operator can be related to the "best approximation" error between that function and every function the operator maps to.

**Lemma 14** (Lebesgue's lemma or Lebesgue inequality): _Suppose the following:_

- _$S$ is the space of continuous functions on a compact interval, and its "norm" ($\Vert\cdot\Vert$) is the maximum absolute value._
- _$f$ is a function in $S$._
- _$T$ is a subspace of $S$ that has a "best approximation" to $f$, so that there is a function $g$ in $T$ such that $\Vert f - g\Vert\le\Vert f - h\Vert$ for every function $h$ in $T$ (De Villiers 2012, theorem 5.3.2)[^4].[^54] Also, $T$ admits the same "norm" as $S$._
- _$L$ is a linear operator that maps functions in $S$ to functions in $T$.  Also, $L$ is_ idempotent, _that is, applying the linear operator twice or more is the same as applying it once, so that $L(L(f))=L(f)$ for every allowed function $f$ (for example, $L$ reproduces all functions in $T$)._
- _$I$ is the identity operator $I(f)=f$._

_Then:_

$$\begin{multline}\Vert f - L(f)\Vert\le(\Vert I - L\Vert_{op})\cdot\text{Dist}(f,P)\quad\text{(Leb2)}\\\\ \le(\Vert I\Vert_{op} + \Vert L\Vert_{op}) \cdot\text{Dist}(f,P)\\\\ \le(1 + \Vert L\Vert_{op}) \cdot\text{Dist}(f,P),\quad\text{(Leb)}\end{multline}$$

_where_ $\Vert I-L\Vert_{op}$ _is the operator norm for the difference between $f$ and $L(f)$; and $\text{Dist}(f,P)$ is the greatest lower bound of $\Vert f-P\Vert$ over all functions $P$ in $T$ (see also DeVore and Lorentz (1993, p. 30; ch. 5)[^55], Powell (1981, theorem 3.1)[^56], De Villiers (2012, theorem 5.3.2)[^4]; for (Leb2) see De Boor (1982, chapter 2)[^57])._ [^58]

> **Examples:**
>
> 1. Let $f$ have a continuous third derivative on the closed unit interval.  Combining the inequalities (Leb) and (Wh) leads to the following error bound if $T$ is the set of polynomials up to degree 2:
>
>     $$\begin{multline}\Vert f - L(f)\Vert\le(1+\Vert L\Vert_{op})\cdot 1\cdot \left(\frac{1}{3}\right)^{3}\Vert f^{(3)}\Vert\\\\= (1+\Vert L\Vert_{op})\Vert f^{(3)}\Vert /27.\end{multline}$$
>
> 2. The Bernstein polynomial $B_n$ maps continuous functions to polynomials up to degree $n$, but if $n$ is 2 or greater it is _not_ idempotent because it does not reproduce all polynomials up to degree $n$.  For example, for $e_2(x)=x^2$, a degree-2 polynomial, $B_n(e_2)=x^2+x(1-x)/n\ne x^2$.  Thus, the inequalities (Leb) and (Leb2) do not apply to Bernstein polynomials of degree 2 or greater.
>
> 3. The _identity operator_ $I(f)=f$ has operator norm 1 and maps every function to itself.  For this operator, the inequality (Leb2) becomes:
>
>     $$\Vert f - I(f)\Vert\le\Vert I - I\Vert_{op}\cdot 0 = 0.$$
>
> **Notes:**
>
> 1. The only positive linear operator that maps continuous to continuous functions and reproduces all polynomials up to degree 2 (constants, linear functions, and quadratic functions) is the identity operator (Păltănea 2004, corollary 1.1.2)[^24].[^59]
> 2. Inequalities similar to (Leb) and (Leb2) may apply to _spline operators_ that map to a continuous function (a _spline_) that equals a polynomial at subintervals of its domain (for example, Sablonnière 2007[^60]).  These operators may have a _local approximation_ property, such that $L(f)(\lambda)$ depends only on the behavior of $f$ near $\lambda$.  But it's not clear to me when inequalities similar to (Leb) and (Leb2) apply to those cases.[^61]

<a id=Bounds_for_Certain_Nonlinear_Operators></a>

### Bounds for Certain Nonlinear Operators

The following comes from a result in Bede and Gal (2010)[^62]; see also Bede et al. (2009)[^63].

**Lemma 15**: _Let $f(\lambda)$ be continuous, bounded, and nonnegative on an interval.  Let $L$ be an operator that maps functions of that kind to functions of that kind and also has the following properties:_

1. _(Monotone.) For every pair of allowed functions $g$ and $h$, if $g\le h$, then $L(g)\le L(h)$._
2. _(Subadditive.) For every pair of allowed functions $g$ and $h$, $L(g+h)\le L(g)+L(h)$._
3. _(Positively homogeneous.) $xL(g)=L(xg)$ for every allowed function $g$ and every $x\ge 0$._

_Finally, let $h>0$ be a real number.  Then the first inequality applies, and the second one also applies if $L(e_0)=1$:_

$$\begin{multline}
\text{abs}(f(x)-L(f)(x))\le(L(e_0)(x)+L(\text{abs}(e_1-x))(x)/h)\cdot\omega_1(f, h)\\\\+f(x)\cdot\text{abs}(L(e_0)(x)-1),\end{multline}$$

$$\text{abs}(f(x)-L(f)(x))\le(1+L(\text{abs}(e_1-x))(x)/h)\cdot\omega_1(f, h),$$

_provided that, in either case,_ $L(\text{abs}(e_1-x))(x)$ _(the "absolute moment" of $L$) exists (and is finite or infinite)._

> **Notes:** An operator meeting conditions 2 and 3 is also called a _sublinear_ operator.  Every linear operator is also sublinear. A linear operator is monotone if and only if it is positive.  For more on nonlinear operators, see Gal and Niculescu (2023)[^64]; on nonlinear approximation, see DeVore (1998)[^65].)
>
> **Example**:  Take the operator $L(f) = (f)^3$.  Then $L$ is not a linear operator because $2\cdot L(e_2) = 2e_6$, yet $L(2 e_2) = 8e_6$.  For the same reason $L$ is not positively homogeneous (and thus not sublinear).  And $L$ is unbounded because $L(z)/z=z^2$ grows without bound as $z$ increases.  But $L$ is positive: a nonnegative number raised to a positive power (such as 3) is itself nonnegative.

<a id=Lipschitz_Continuous_Operators></a>

### Lipschitz-Continuous Operators

An operator $L$ is _Lipschitz continuous_ if it satisfies $\Vert L(f)-L(g)\Vert\le M\Vert f-g\Vert$ for some $M\ge 0$ and all allowed functions $f$ and $g$. (The left-hand side is a "norm" that depends on the space of functions $L$ maps _to_; the right-hand "norm", on the functions $L$ maps _from_.) When this is the case, $M$ is a _Lipschitz constant_ of that operator.

Every bounded linear operator $L$ is Lipschitz continuous with $M$ equal to its operator norm (because $\Vert L(f)-L(g)\Vert$ = $\Vert L(f-g)\Vert$ $\le\Vert L\Vert_{op}\cdot\Vert f-g\Vert$), and so is every monotone and sublinear operator (Gal and Niculescu 2023b)[^66].

**Lemma 16**: _If $L$ is a Lipschitz-continuous operator, then for every allowed function $f$:_

$$\Vert L(f)\Vert\le M\Vert f-P\Vert,$$

_where $P$ is any function such that $L(P)=0$._

_Proof:_ This follows easily from the definition of Lipschitz continuity.

<a id=Example></a>

## Example

This example shows how to find a linear operator's bounds.

Let $L_n(f)$ be a linear operator inspired by [**a conjecture I have**](https://peteroupc.github.io/bernsupp.html#A_Conjecture_on_Polynomial_Approximation) on polynomial approximation.  It is described as follows:

$$L_n(f)(\lambda) = \sum_{i=0}^n \left( W_{2n}\left(f\right)\left(\frac{k}{2n}\right) - W_n\left(f\right)\left(\frac{i}{n}\right)\right)\sigma_{n,k,i}$$

$$=\mathbb{E}\left[W_{2n}\left(f\right)\left(\frac{k}{2n}\right) - W_n\left(f\right)\left(\frac{X_k}{n}\right)\right],$$

where:

- $k = 2n\lambda$, where $0\le\lambda\le 1$.
- $W_n(f)$ is a linear operator that approaches $f$ as $n$ increases.[^67]
- $X_k$ is a hypergeometric($2n$, $k$, $n$) random variable.  This is the number of "good" balls out of $k$ balls taken uniformly at random, all at once, from a bag containing $2n$ balls, $n$ of which are "good".
- $\sigma_{n,k,i}$ equals ${n\choose i}{n\choose {k-i}}/{2n \choose k}$ and is the probability that $X_k$ equals $i$.

$L_n$ and $W_n$ are generally nonpositive operators.  As an example, take $W_n=2f-B_n(f)$.  Then $B_n(W_n(f))$ is a linear operator that is the iterated Boolean sum of degree-$n$ Bernstein polynomials, with one iteration; see Güntürk and Li (2021a, Theorem 5)[^68].  That paper, among others (for example, Micchelli 1973[^69]), showed that this operator approaches $f$ at the rate $O(1/n^{3/2})$ if $f$ has a continuous third derivative. ("$O(1/n^{3/2})$" means the error is no greater than a constant times $1/n^{3/2}$ for all values of $n$.)

With this choice of $W_n$, $L_n$ becomes:

$$L_n(f)(\lambda) = \sum_{i=0}^n\left((2f\left(\frac{k}{2n}\right) - B_{2n}(f)\left(\frac{k}{2n}\right)) - (2f\left(\frac{i}{n}\right) - B_n(f)\left(\frac{i}{n}\right))\right) \sigma_{n,k,i}$$

$$= \mathbb{E}\left[(2f\left(\frac{k}{2n}\right) - B_{2n}(f)\left(\frac{k}{2n}\right)) - (2f\left(\frac{X_k}{n}\right) - B_n(f)\left(\frac{X_k}{n}\right))\right]$$

$$= \sum_{i=0}^n\left((2f\left(\frac{k}{2n}\right) + B_{n}(f)\left(\frac{i}{n}\right))\right)\sigma_{n,k,i} - \sum_{i=0}^n \left((2f\left(\frac{i}{n}\right) + B_{2n}(f)\left(\frac{k}{n}\right))\right) \sigma_{n,k,i}$$

$$= LA_n(f)(\lambda) - LB_n(f)(\lambda).$$

Here, $LA_n$ and $LB_n$ are positive linear operators, making it easier to assess their approximation properties.

It will be shown that, if $f$ has a continuous third derivative, the rate of $L_n$ towards zero is $O(M/n^{3/2})$, where $M$ is the maximum absolute value of $f$ and its derivatives up to the third derivative.  The proof of this relies on exact expressions of $L_n$'s [**"raw moments" and "central moments"**](#Moments_of_Linear_{op}erators), and those for the combined operator $(LA_n+LB_n)$.

The following are some of these values and those for related operators:

- $L_n(e_0)(x) = L_n((e_1-x)^0)(x) = 0$.
- $L_n(e_1)(x) = L_n((e_1-x)^1)(x) = 0$.
- $L_n(e_2)(x) = L_n((e_1-x)^2)(x)$ = $3x(x - 1)/(2n(2n-1))$ = $O(1/n^2)$.
- $L_n(e_3)(x)$ = $n^3 x^2(2nx - 4x + 3)/(2n - 1)$.
- $LA_n((e_1-x)^2)(x)$ = $-x(3n - 2)\cdot(x - 1)/(n(2n-1))$ = $O(1/n)$.
- $LB_n((e_1-x)^2)(x)$ = $-x(6n - 1)\cdot(x - 1)/(2n(2n-1))$ = $O(1/n)$.
- $(LA_n+LB_n)((e_1-x)^2)(x)$ = $LA_n(\text{abs}(e_1-x)^2)(x) + LB_n(\text{abs}(e_1-x)^2)(x)$ = $-x(12n - 5)\cdot(x - 1)/(2n(2n - 1)) = O(1/n)$.

To find values like those just listed, it is useful to calculate raw moments (Wang et al. 2023)[^70] and central moments (Weisstein)[^71] of hypergeometric random variables (such as $X_k$).  Indeed, if $g(y)=W_{2n}(e_r;k/(2n))-W_n(e_r;y)$ is a polynomial in $y$ of degree $r$ or less, then $L_n(e_r)$ can be found using a Taylor expansion, namely as&mdash;

$$L_n(e_r) = \sum_{i=0}^r \mathbb{E}[(X_k/n-\mathbb{E}[X_k/n])^i]\frac{g^{(i)}(\mathbb{E}[X_k/n])}{i!}$$

$$= \sum_{i=0}^r \frac{\mathbb{E}[(X_k-\mathbb{E}[X_k])^i]}{n^i}\frac{g^{(i)}(k/(2n))}{i!},$$

where the derivatives are taken with respect to $y$, and where $\mathbb{E}[(X_k-\mathbb{E}[X_k])^i]$ is the $i$-th central moment of $X_k$.

The first step is to [**find the Taylor expansion**](#Taylor_Expansion_of_Linear_{op}erators) of $L_n(f)(\lambda)$. Given that $L_n((e_1-x)^0)(x)$ = $L_n((e_1-x)^1)(x)$ = 0, this becomes:

$$L_n(f)(\lambda) = L_n(R_3(f, \lambda)) + \sum_{i=2}^3 L_n((e_1-\lambda)^i)(\lambda)\frac{f^{(i)}(\lambda)}{i!},$$

$$\text{abs}(L_n(f)(\lambda)) \le \Vert L_n(R_3(f, \lambda))\Vert + \Vert L_n((e_1-\lambda)^2)\Vert\cdot\Vert f^{(2)}\Vert /2$$

$$+ \Vert L_n((e_1-\lambda)^3)\Vert\cdot\Vert f^{(3)}\Vert /6.$$

The function $\text{abs}(L_n((e_1-x)^3)(x))$ has its maximum at $x=1/2-\sqrt{3}/6$; and $\text{abs}(L_n((e_1-x)^2)(x))$ has its maximum at $x=1/2$, so:

$$\text{abs}(L_n(f)(\lambda)) \le \Vert L_n(R_3(f, \lambda))\Vert  + \text{abs}(\frac{3\lambda(\lambda - 1)}{2n(2n-1)})\Vert f^{(2)}\Vert /2$$

$$ + \Vert L_n((e_1-\lambda)^3)\Vert\cdot\Vert f^{(3)}\Vert /6$$

$$ \le \Vert L_n(R_3(f, \lambda))\Vert  + \frac{3}{8n(2n-1)}\Vert f^{(2)}\Vert /2$$

$$ + \frac{\sqrt{3} (6 n - 5)}{24 n^{2} (2 n - 1)}\Vert f^{(3)}\Vert /6.$$

Meanwhile the remainder is estimated as follows, using the proof of corollary 2.3 of Gonska et al. (2006)[^7]\:

$$\Vert L_n(R(f, \lambda))\Vert \le \frac{1}{6} \Vert f^{(3)}\Vert\cdot\Vert (LA_n+LB_n)(\text{abs}(e_1-\lambda)^3)\Vert .$$

In turn, using Schwarz's inequality (see proof of the same paper's corollary 2.1):

$$\Vert (LA_n+LB_n)(\text{abs}(e_1-\lambda)^3)\Vert \le (\Vert (LA_n+LB_n)((e_1-\lambda)^4)\Vert )^{1/2}$$

$$\times (\Vert (LA_n+LB_n)((e_1-\lambda)^2)\Vert )^{1/2} \le \frac{3\sqrt{3}}{8n^{3/2}}.$$

(The expression in the middle takes its maximum at $\lambda = 1/2$; the right-hand side is an upper bound of that expression for all positive integers $n$.) Altogether:

$$\Vert L_n(f)\Vert  \le \frac{3}{8n(2n-1)}\frac{1}{2}\Vert f^{(2)}\Vert$$

$$ + \left(\frac{3\sqrt{3}}{8n^{3/2}} + \frac{\sqrt{3} (6 n - 5)}{24 n^{2} (2 n - 1)}\right)\frac{1}{6}\Vert f^{(3)}\Vert  = LC_n(f)$$

$$\le 0.1875 \frac{\Vert f^{(2)}\Vert }{n^{3/2}} + \frac{5\sqrt{3}}{72} \frac{\Vert f^{(3)}\Vert }{n^{3/2}} \le \frac{0.3078 M}{n^{3/2}} = O(1/n^{3/2}).$$

If $n\ge 2$ is an integer, $LC_n(f)\le 0.2165 M/n^{3/2}$.

<a id=Example_An_Interesting_Linear_Operator></a>

## Example: An Interesting Linear Operator

For a continuous function $f$ on the closed unit interval and for nonnegative integers $m$ and $n$, let $H_{n,m}$ be a linear operator as follows:

$$H_{n,m}(f)=B_n(f) + \text{Lag}_m(f) - B_n(\text{Lag}_m(f)),$$

where $B_n$ is the degree-$n$ Bernstein polynomial (see "Bernstein Form and Bernstein Polynomials", earlier) and $\text{Lag}_m$ is the polynomial of degree up to $m$ that equals $f$ at "$m+1$ distinct points on" the closed unit interval.  This operator was mentioned in Remark 2 of Gavrea and Ivan (2018)[^72], but appears not to have been studied elsewhere.

It is known that $Lag_m$ is a linear operator and reproduces all polynomials of degree $m$ or less, so that $Lag_m(e_i) = e_i$ whenever $0\le i\le m$ is an integer. Thus, if $f$ is such a polynomial, $B_n(f)=B_n(Lag_m(f))$ and therefore $H_{n,m}(f)$ = $Lag_m(f)=f$, and therefore $H_{n,m}(e_i)=e_i$ whenever $0\le i\le m$ is an integer.

Because $H_{n,m}$ is linear and reproduces all polynomials up to degree $m$, the following holds if $f$ has a continuous $m$-th derivative:

$$H_{n,m}(f)(\lambda) - f(\lambda) = H_{n,m}(R_m(f, \lambda))(\lambda)$$

$$=B_n(R_m(f,\lambda)) + \text{Lag}_m(R_m(f,\lambda)) - B_n(\text{Lag}_m(R_m(f,\lambda))).$$

With the help of Lemma 6, the following holds if $n$ is also 2 or greater and $m$ is a positive integer:

$$\Vert H_{n,m}(f)(\lambda)\Vert  \le \frac{\Vert f^{(m)}\Vert  \mu_{m}}{ (m!) n^{m/2}} + \Vert \text{Lag}_m(R_m(f,\lambda)) - B_n(\text{Lag}_m(R_m(f,\lambda)))\Vert$$

where $\mu_r$ is as in Proposition 1.

It will be helpful to estimate the second derivative of $\text{Lag}_m(f)$.

Given that that function is a polynomial of degree $m$ or less, this can be estimated as:

$$\text{abs}(\text{Lag}_m(f)^{(2)}(\lambda))\le \Vert \text{Lag}_m\Vert_{op}\cdot\Vert f\Vert\cdot M(m),\tag{E}$$

where:

- $\Vert Lag_m\Vert_{op}$ is the operator norm of $Lag_m$, which in this case equals its _Lebesgue constant_, which will vary depending on the points on the closed unit interval where the polynomial meets (interpolates) $f$ (Ibrahimoglu 2016)[^73].
- $M(m) = (4/3)\cdot \max(2,m)^2(\max(2,m)^2-1)$.  This is an upper bound on the maximum absolute value of a polynomial's second derivative (on the closed unit interval) when that polynomial has a maximum absolute value of 1 (on that interval).  This uses the following lemma based on one proved for the interval $[-1,1]$ by V. Markov in 1892 (see also Schaeffer and Duffin 1938 [^74]).

**Lemma**: _Let_ $p(\lambda)=c_0 \lambda^0 + ... + c_n \lambda^n$ _be a polynomial on the interval_ $[a,b]$, _where_ $c_0$, ..., $c_n$ _are real numbers and_ $c_n$ _is not zero. If_ $\Vert p\Vert\le 1$, _then_ $\Vert p^{(2)}\Vert\le (b-a)^2 n^2 (n^2-1)/3$.

An error bound for $H_{n,m}$ can also be written as:

$$\begin{multline}H_{n,m}(f) - f=B_n(f) + \text{Lag}_m(f) - B_n(\text{Lag}_m(f)) - f\\\\=(B_n(f) - f) + (\text{Lag}_m(f) - B_n(\text{Lag}_m(f))),\end{multline}$$

$$\text{abs}((H_{n,m}(f) - f)(\lambda))\le\text{abs}(B_n(f) - f) + \text{abs}(B_n(\text{Lag}_m(f)) - \text{Lag}_m(f)),$$

so now there are two error bounds to find: one for $f$ and the other for $\text{Lag}_m(f)$.  And, if $f$ has a continuous second derivative, both have the same form:

$$B_n(g)\le \Vert g^{(2)}\Vert/(8n).$$

(This follows from Lorentz (1964)[^75] and the well-known fact that $\Vert g^{(2)}\Vert$, the maximum absolute value of $g$'s second derivative, is an upper bound of $g$'s first derivative's smallest Lipschitz constant.)

Altogether, if $f$ has a continuous second derivative and $m$ is fixed:

$$\text{abs}((H_{n,m}(f) - f)(\lambda))\le \frac{\Vert f^{(2)}\Vert}{8n} + \frac{\Vert \text{Lag}_m\Vert_{op}\cdot\Vert f\Vert\cdot M(m)}{8n}.$$

It is suspected that, using $(E)$, the following is true if $f$ has a continuous $m$-th derivative and $m$ is a positive integer:

$$H_{n,m}(f)(\lambda) - f(\lambda) = B_n(R_m(f,\lambda)) + \lgroup\text{Lag}_m(f) - B_n(\text{Lag}_m(f))\rgroup,$$

so that, using Lemma 6 again, there is a better error bound if $n$ is 2 or greater:

$$\text{abs}((H_{n,m}(f) - f)(\lambda))\le \frac{\Vert f^{(m)}\Vert  \mu_{m}}{ (m!) n^{m/2}} + (\Vert Lag_m\Vert_{op}\cdot\Vert f\Vert\cdot M(m)) \frac{\mu_{m}}{ (m!) n^{m/2}}.$$

<a id=Example_The_Lorentz_Operators></a>

## Example: The Lorentz Operators

The _Lorentz operators_ were introduced by Lorentz (1963)[^76] and studied by Holtz et al. (2011)[^77].

This section touches on the Lorentz operator of order 2, defined as&mdash;

$$Q_{n,2}(f)(\lambda)=B_n(f)(\lambda)-\frac{\lambda(1-\lambda)}{2n} B_n(f^{(2)})(\lambda)$$

$$=B_n\left(f(e_1)-\frac{\lambda(1-\lambda)}{2n}f^{(2)}(e_1)\right)(\lambda),$$

where $0\le\lambda\le 1$.[^78]

This operator is a nonpositive linear operator.

- Unlike in the previous examples, this operator takes in only continuous functions with a second derivative.
- The operator maps those functions to polynomials of degree up to $n+2$.

Because $Q_{n,2}(e_i) = e_i$ if $i$ is 0, 1, or 2, the operator reproduces all polynomials of degree 2 or less (for another proof, see Lemma 14 of Holtz et al. 2011[^77]).  (The Lorentz operators of order 0 and 1 are simply the Bernstein polynomials.)

$Q_{n,2}$ can be bounded as follows:

$$\Vert Q_{n,2}(f)\Vert\le\Vert B\Vert_{op}\cdot\Vert f\Vert+\frac{1}{8n}\Vert B\Vert_{op}\cdot\Vert f^{(2)}\Vert = \Vert f\Vert+\Vert f^{(2)}\Vert/(8n),$$

where $\Vert B\Vert_{op} = 1$ (De Villiers 2012, Theorem 5.2.2)[^4] is the operator norm of the Bernstein polynomials.

Some of the "moments" of this operator are:

- $Q_{n,2}(e_3)=\frac{x \left(n^{2} x^{2} + 2 x^{2} - 3 x + 1\right)}{n^{2}}.$
- $Q_{n,2}((e_1-\lambda)^3)=\frac{x \left(2 x^{2} - 3 x + 1\right)}{n^{2}}.$

Let $LF = f - Q_{n,2}(f)$ be the error in approximating $f$ with $Q_{n,2}(f)$.

It is suspected that&mdash;

$$\Vert LF(f)\Vert \le \frac{C \Vert f^{(3)}\Vert}{n^{3/2}},$$

for some $C>0$, and it is of interest to find an explicit upper bound for $C$, especially a tight one.

It is suspected further, using Lemma 6 and Corollary 1, that&mdash;

$$\Vert LF(f)\Vert \le \frac{\mu_3\Vert f^{(3)}\Vert}{6\cdot n^{3/2}}+\frac{1}{8n}\frac{\mu_1\Vert f^{(3)}\Vert}{1\cdot n^{1/2}}\le(0.06015+0.0625)\frac{\Vert f^{(3)}\Vert}{n^{3/2}},$$

The operator norm for $Q_{n,2}$ requires some care to define.  Because $Q_{n,2}$ doesn't map from all continuous functions, a different kind of "norm" than the maximum absolute value is needed to define this operator norm.  Denote $C^k$, where $k\ge 0$, as the space of functions with a continuous $k$-th derivative on the closed unit interval. The following "norm" gives $C^k$ the property that a sum of functions in that space converges whenever the sum of "norms" of those functions is finite[^79]\:

$$\Vert f\Vert_{C^k} = \begin{cases}\Vert f\Vert + \Vert f^{(k)}\Vert & \text{if }k\ge 0,\\\\\Vert f\Vert & \text{if }k=0.\end{cases}$$

Using the $C^2$ "norm" to define the operator norm of $Q_{n,2}$, that operator can be bounded as follows:

$$\Vert Q_{n,2}(f)\Vert\le\Vert f\Vert+\Vert f^{(2)}\Vert/(8n)\le\Vert f\Vert_{C^2}+\Vert f\Vert_{C^2}/(8n)=\Vert f\Vert_{C^2}\frac{9}{8n},$$

so the operator norm satisfies $\Vert Q_{n,2}\Vert_{op}\le 9/(8n)$.

<a id=Probabilistic_Interpretations_of_Linear_Operators></a>

## Probabilistic Interpretations of Linear Operators

The Bernstein polynomials featured in a proof in 1912 of the result that any continuous function on a compact interval can be approximated as well as desired by polynomials (Bernstein 1912)[^80]. That proof used probability theory. In a series of papers, Adell and De la Cal use probability theory to interpret a number of linear operators in addition to those polynomials (Adell and De la Cal 1996[^81], 1995[^82]).

<a id=Conclusion_and_Ways_to_Improve_This_Article></a>

## Conclusion and Ways to Improve This Article

Many academic papers and books present results in approximation theory, especially error bounds, with hidden constants and without giving upper bounds for such constants.  For example, a result may say the following about an operator (approximation scheme) $L$ and a function $f(\lambda)$.  If certain conditions are met, then:

$$\text{abs}(f(\lambda) - L(\lambda)) \le C\omega_1(f, 1/n^{1/2}),\text{ or }$$

$$\text{abs}(f(\lambda) - L(\lambda)) \le D\Vert f^{(3)}\Vert/n^{3/2},$$

where $C$ and $D$ are unspecified constants with no upper bounds given.  Or:

$$\text{abs}(f(\lambda) - L(\lambda)) = O(1/n^{1/2}),$$

where $O(1/n^{1/2})$ is a function whose absolute value is no more than an unspecified constant times $1/n^{1/2}$. (For example, compare Sevy 1991[^27] with Gonska and Zhou 1994[^83] and Holtz et al. 2011[^77].)

It was a goal of this article to catalog general-purpose error bounds without such hidden constants.

To improve this article, explicit error bounds (with no hidden constants) of the following kinds are sought:

- Inequalities similar to the [**Lebesgue inequality**](#Lebesgue_Inequality_for_Certain_Linear_{op}erators) for certain operators (not necessarily linear ones) where the normal Lebesgue inequality doesn't apply (say, spline operators with local approximation, or numerical integration rules).  For example, inequalities of the following forms, where $C>0$ is an explicitly given constant:
    - $\Vert f-L(f)\Vert$ is no more than $C$ times the smallest $\Vert f-P\Vert$ over all functions $P$ mapped to by $L$.
    - $\Vert f-L(f)\Vert \le (C \Vert I - L\Vert_{op})$ times the smallest $\Vert f-P\Vert$ over _a subset_ of functions $P$ mapped to by $L$.
    - $\Vert f-L(f)\Vert \le (C\Vert I - L\Vert_{op})$ times the smallest $\Vert f^{(k)}-P^{(k)}\Vert$ over _a subset_ of functions $P$ mapped to by $L$, where $k\ge 1$ (for example, De Boor 1975[^84]).
    - Inequalities of the foregoing kinds where $L$ and $f$ are restricted to some compact subinterval.
- General-purpose upper bounds on the error when approximating a function with:
    1. Polynomials, especially polynomials in Bernstein form with nonnegative coefficients.
    2. Ratios of polynomials described in (1).
    3. Convex combinations of functions described in (1) or (2).  A convex combination has the form $c_0 f_0(\lambda) + c_1 f_1(\lambda) + ...$ where $c_i$ are nonnegative and sum to 1.
    4. Compositions of functions described in (1), (2), or (3) (for example, Yeon 2025)[^85].  A composition of functions $f$ and $g$ is a function like $f(g(\lambda))$.
- Easy-to-use upper bounds for [**estimating Peano kernels**](#Bounds_for_General_Linear_{op}erators), such as the Peano kernels corresponding to the [**Lorentz operators**](#Example_The_Lorentz_{op}erators).
- Additional error bounds for [**nonlinear operators**](#Bounds_for_Certain_Nonlinear_{op}erators).
- Error bounds that are sharper than those in Lemmas 9 to 12 for functions with a continuous $k$-th derivative for some $k\ge 2$.

In addition, the following will be helpful.

- Results on ways to rewrite a nonpositive linear operator into a difference of two positive linear operators, as used in Lemma 8 and the first Example section.
- Does Lemma 7 also work for linear operators, such as the [**Lorentz operator**](#Example_The_Lorentz_{op}erators), whose norm is not based on the maximum absolute value?
- In which cases are the [**Lebesgue inequalities**](#Lebesgue_Inequality_for_Certain_Linear_{op}erators) (Leb) and (Leb2) true even if the set of functions $L$ maps to is not a (linear) subspace?
- Given the work by Rohwer (2005)[^86], are the inequalities (Leb) and (Leb2) true when&mdash;
    - $L$ is nonlinear,
    - $L$ is Lipschitz continuous, replacing $\Vert L\Vert_{op}$ with the Lipschitz constant of $L$, and
    - both $L$ and $I-L$ are idempotent?

Also:

- Is it helpful to introduce the concept of functions of bounded variation in this article?

Those are not all the possible ways this article can be improved.

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
<a id=Notes></a>

## Notes

[^1]: This term is used instead of "closed interval", a term which can also encompass infinitely long intervals, which is not the intent of this document (Weisstein, Eric W. "Closed Interval." From MathWorld--A Wolfram Resource. [**https://mathworld.wolfram.com/ClosedInterval.html**](https://mathworld.wolfram.com/ClosedInterval.html)).

[^2]: A linear operator is also known as a _linear map_ (Axler 2020) or a _linear transformation_.

[^3]: A better term for positive operators is probably nonnegativity-preserving operators.

[^4]: De Villiers, J., _Mathematics of Approximation_, Atlantis Press, 2012. [**https://doi.org/10.2991/978-94-91216-50-3**](https://doi.org/10.2991/978-94-91216-50-3)

[^5]: If $L$ is linear, the operator norm is the maximum "norm" of $L(f)$ over all allowed functions $f$ with a "norm" equal to 1 (De Villiers 2012, Theorem 5.2.3).

[^6]: _n_! = 1\*2\*3\*...\*_n_ is also known as _n_ factorial; in this document, (0!) = 1.<br>_Summation notation_, involving the Greek capital sigma (&Sigma;), is a way to write the sum of one or more terms of similar form. For example, $\sum_{k=0}^n g(k)$ means $g(0)+g(1)+...+g(n)$, and $\sum_{k\ge 0} g(k)$ means $g(0)+g(1)+...$.

[^7]: [**Gonska, Heiner, Paula Piƫul, and Ioan Raşa. "On Differences of Positive Linear Operators."**](https://scholar.google.com/scholar?q=Gonska,+Heiner,+Paula+Piƫul,+and+Ioan+Raşa.+On+Differences+of+Positive+Linear+Operators) _Carpathian Journal of Mathematics_ 22, no. 1/2 (2006): 65–78. [**http://www.jstor.org/stable/43998909**](http://www.jstor.org/stable/43998909)

[^8]: Skorski, Maciej. "Handy formulas for binomial moments." _Modern Stochastics: Theory and Applications_ 12.1 (2024): 27-41. [**https://doi.org/10.15559/24-VMSTA260**](https://doi.org/10.15559/24-VMSTA260)

[^9]: It is also possible to bound the "absolute moment" as $M_{n,r}(p)\le C(r)(\max(1/n, (p(1-p)/n)^{1/2})^r$ or $M_{n,r}(p)\le D(r)(1/n + (p(1-p)/n)^{1/2})^r$ (Lorentz, G.G. The degree of approximation by polynomials with positive coefficients. Math. Ann. 151, 239–251 (1963). [**https://doi.org/10.1007/BF01398235**](https://doi.org/10.1007/BF01398235)), but the constants $C(r)$ and $D(r)$ seem to be higher (and less favorable) than the $E(r)$ in $M_{n,r}(p)\le E(r)/n^{r/2}$.

[^10]: Adell, J.A., Cárdenas-Morales, D., "[**Quantitative generalized Voronovskaja’s formulae for Bernstein polynomials**](https://www.sciencedirect.com/science/article/pii/S0021904518300376)", Journal of Approximation Theory 231, July 2018. [**https://doi.org/10.1016/j.jat.2018.04.007**](https://doi.org/10.1016/j.jat.2018.04.007)

[^11]: Molteni, Giuseppe. "Explicit bounds for even moments of Bernstein’s polynomials." Journal of Approximation Theory 273 (2022): 105658. [**https://doi.org/10.1016/j.jat.2021.105658**](https://doi.org/10.1016/j.jat.2021.105658)

[^12]: Cheng, F., "On the rate of convergence of Bernstein polynomials of functions of bounded variation", Journal of Approximation Theory 39 (1983). [**https://doi.org/10.1016/0021-9045%2883%2990098-9**](https://doi.org/10.1016/0021-9045%2883%2990098-9) [**https://www.sciencedirect.com/science/article/pii/0021904583900989**](https://www.sciencedirect.com/science/article/pii/0021904583900989)

[^13]: Weisstein, Eric W. "Schwarz's Inequality." From MathWorld--A Wolfram Resource. [**https://mathworld.wolfram.com/SchwarzsInequality.html**](https://mathworld.wolfram.com/SchwarzsInequality.html)

[^14]: R. Bojanić, O. Shisha, "Degree of $L^1$ approximation to integrable functions by modified Bernstein polynomials", Journal of Approximation Theory 13, 66–72 (1975). [**https://doi.org/10.1016/0021-9045%2875%2990015-5**](https://doi.org/10.1016/0021-9045%2875%2990015-5) [**https://www.sciencedirect.com/science/article/pii/0021904575900155**](https://www.sciencedirect.com/science/article/pii/0021904575900155)

[^15]: [**Piţul, P., "Evaluation of the Approximation Order by Positive Linear Operators"**](https://scholar.google.com/scholar?q=Piţul,+P.,+Evaluation+of+the+Approximation+Order+by+Positive+Linear+Operators), dissertation, Universität Duisberg-Essen, 2007.

[^16]: I suspect that, whenever $L$ is a bounded linear operator that maps continuous functions on a compact interval to functions of that kind, $L$ can be written as a difference between two positive linear operators.  But I have not seen a proof of that statement; Acu et al. ("[**Grüss-type and Ostrowski-type inequalities in approximation theory**](https://doi.org/10.1007/s11253-011-0548-2)", Ukr Math J 63, 843–864, 2011) give a similar statement but without proof.

[^17]: [**E. Voronovskaya, "Détermination de la forme asymptotique d'approximation des fonctions par les polynômes de M. Bernstein"**](https://scholar.google.com/scholar?q=E.+Voronovskaya,+Détermination+de+la+forme+asymptotique+dapproximation+des+fonctions+par+les+polynômes+de+M.+Bernstein), 1932.

[^18]: DeVore, Ronald A. The approximation of continuous functions by positive linear operators. Springer, 2006. [**https://doi.org/10.1007/BFb0059493**](https://doi.org/10.1007/BFb0059493)

[^19]: Cárdenas-Morales, Daniel, Pedro Garrancho, and Ioan Rasa. "Asymptotic formulae via a Korovkin-type result." Abstract and Applied Analysis. Vol. 2012. John Wiley & Sons, Inc., 2012. [**https://doi.org/10.1155/2012/217464**](https://doi.org/10.1155/2012/217464)

[^20]: [**Gonska, H.H., Meier, J., "On approximation by Bernstein-type operators: best constants"**](https://scholar.google.com/scholar?q=Gonska,+H.H.,+Meier,+J.,+On+approximation+by+Bernstein-type+operators+best+constants), Studia Sci. Math. Hungar. 22, 1987.

[^21]: O. Shisha, & B. Mond,  "The degree of convergence of sequences of linear positive operators", Proc. Natl. Acad. Sci. U.S.A. 60 (4) 1196-1200, [**https://doi.org/10.1073/pnas.60.4.1196**](https://doi.org/10.1073/pnas.60.4.1196) (1968).

[^22]: [**R. G. Mamedov, "On the order of approximation of functions by linear positive operators."**](https://scholar.google.com/scholar?q=R.+G.+Mamedov,+On+the+order+of+approximation+of+functions+by+linear+positive+operators) (Russian.) Dokl. Akad. Nauk SSSR 128 (1959).

[^23]: Mond, B., "On the degree of approximation by linear positive operators", _Journal of Approximation Theory_ 18 (1976). [**https://doi.org/10.1016/0021-9045%2876%2990022-8**](https://doi.org/10.1016/0021-9045%2876%2990022-8) [**https://www.sciencedirect.com/science/article/pii/0021904576900228**](https://www.sciencedirect.com/science/article/pii/0021904576900228)

[^24]: Păltănea, R., _Approximation Theory Using Positive Linear Operators_, Birkhäuser, 2004. [**https://doi.org/10.1007/978-1-4612-2058-9**](https://doi.org/10.1007/978-1-4612-2058-9)

[^25]: [**Peetre, J., "On the connection between the theory of interpolation spaces and approximation theory"**](https://scholar.google.com/scholar?q=Peetre,+J.,+On+the+connection+between+the+theory+of+interpolation+spaces+and+approximation+theory), in _Approximation Theory_, 1969.

[^26]: Gonska, Heiner. "The rate of convergence of bounded linear processes on spaces of continuous functions." Journal of Numerical Analysis and Approximation Theory 52.2 (2023): 182-232. [**https://doi.org/10.33993/jnaat522-1326**](https://doi.org/10.33993/jnaat522-1326)

[^27]: Sevy, J., "Acceleration of convergence of sequences of simultaneous approximants", dissertation, Drexel University, 1991. [**https://doi.org/10.17918/00010296**](https://doi.org/10.17918/00010296)

[^28]: H. H. Gonska, _Quantitative Approximation in C(X)_, Habilitationschrift, Universität Duisburg, 1985.

[^29]: [**Peetre, J., "Exact interpolation theorems for Lipschitz-continuous functions"**](https://scholar.google.com/scholar?q=Peetre,+J.,+Exact+interpolation+theorems+for+Lipschitz-continuous+functions), Ricerche Mat. 18 (1969).

[^30]: [**Păltănea, R, Dimitriu, M.T., "On some second order moduli of smoothness."**](https://scholar.google.com/scholar?q=Păltănea,+R,+Dimitriu,+M.T.,+On+some+second+order+moduli+of+smoothness) General Mathematics 24 (2016)

[^31]: Păltănea, R., Smuc, M. "Sharp Estimates of Asymptotic Error of Approximation by General Positive Linear Operators in Terms of the First and the Second Moduli of Continuity", _Results in Mathematics_ 74, 70 (2019). [**https://doi.org/10.1007/s00025-019-0997-8**](https://doi.org/10.1007/s00025-019-0997-8)

[^32]: Dimitriu, M.T., "[**Estimates with optimal constants using Peetre's K-functionals**](https://www.jstor.org/stable/43964559)", _Carpathian Journal of Mathematics_ 26 (2010).

[^33]: Gonska, Heiner, Paula Piţul, and Ioan Raşa. "On Peano's form of the Taylor remainder, Voronovskaja's theorem and the commutator of positive linear operators". In _Proceedings of the International Conference on Numerical Analysis and Approximation Theory_, Cluj-Napoca. Romania, July 2006.

[^34]: [**Gonska, Heiner. "On the degree of approximation in Voronovskaja's theorem"**](https://scholar.google.com/scholar?q=Gonska,+Heiner.+On+the+degree+of+approximation+in+Voronovskajas+theorem), Studia Univ. Babeş-Bolyai, Math., September 2007.

[^35]: Anastassiou, George A. "[**A study of positive linear operators by the method of moments, one-dimensional case**](https://www.sciencedirect.com/science/article/pii/0021904585900498)." Journal of Approximation Theory 45.3 (1985): 247-270. [**https://doi.org/10.1016/0021-9045%2885%2990049-8**](https://doi.org/10.1016/0021-9045%2885%2990049-8)

[^36]: The paper Cichoń et al., "[**On delta-method of moments and probabilistic sums**](https://doi.org/10.1137/1.9781611973037.11)", ANALCO 2013, has very similar results, but they assume the function $f$ has a $k$-th derivative defined on an _{op}en_ interval (say, $0\lt\lambda\lt 1$), rather than a _compact_ interval, making those results harder to use if $Y$ is a random variable that can take a value equal to either endpoint of the interval (in this example, 0 or 1).

[^37]: Frantz, Deborah A. [**Summability methods, probability distributions, and associated positive linear operators**](https://preserve.lehigh.edu/lehigh-scholarship/graduate-publications-theses-dissertations/theses-dissertations/summability). Lehigh University, 1984.

[^38]: The integral of a discontinuous or unbounded function is more complicated to define. See chapter 3, "Integration", of Axler, S., _Measure, Integration & Real Analysis_, Springer, 2020. [**https://doi.org/10.1007/978-3-030-33143-6**](https://doi.org/10.1007/978-3-030-33143-6).

[^39]: This kind of estimation is called _quadrature_ or _numerical integration_, and methods for such estimation, such as the one that is given in (2A) and also known as the midpoint rule, are called _quadrature rules_ (see also Brass, H., Petras, K., _Quadrature Theory: The Theory of Numerical Integration on a Compact Interval_, American Mathematical Society, 2011).

[^40]: Brass, H., Förster, KJ. (1998). On the Application of the Peano Representation of Linear Functionals in Numerical Analysis. In: Milovanović, G.V. (eds) Recent Progress in Inequalities. Mathematics and Its Applications, vol 430. Springer, Dordrecht. [**https://doi.org/10.1007/978-94-015-9086-0_10**](https://doi.org/10.1007/978-94-015-9086-0_10)

[^41]: Waldron, Shayne. "Refinements of the Peano kernel theorem." Numerical functional analysis and optimization 20.1-2 (1999): 147-161. [**https://doi.org/10.1080/01630569908816885**](https://doi.org/10.1080/01630569908816885)

[^42]: Gavrea, I., Ivan, M., "A sharp estimate for the Peano error representation", _Applied Mathematics and Computation_ 252 (2015). [**https://doi.org/10.1016/j.amc.2014.12.017**](https://doi.org/10.1016/j.amc.2014.12.017)

[^43]: Note that for the bounds in Lemma 7, $(e_1-t)_+^0$ is discontinuous and so is not accepted by $LF$ and $L$ if they map from only continuous functions; thus the results in this section suppose both operators map from bounded functions for $k=0$.  Brass and Förster 1998 adequately provides for the case $k=0$, but not Gavrea and Ivan 2015, unfortunately.

[^44]: $L$ maps functions in set $A$ to functions in set $B$. In this case, $A$ is the set of continuous functions on $f$'s domain and $B$ is the set of bounded functions on that domain.  Both sets are equipped with a "norm" equal to the least upper bound on $g$'s absolute value, where $g$ is a function in $A$ or $B$. (As used in Gonska (1998/2023), the "norm" for $A$ is the maximum rather than the least upper bound, but the two are equivalent in this case.)

[^45]: Babenko, A.G., Kryakin, Y.V. (2019). Special Difference Operators and the Constants in the Classical Jackson-Type Theorems. In: Abell, M., Iacob, E., Stokolos, A., Taylor, S., Tikhonov, S., Zhu, J. (eds) Topics in Classical and Modern Analysis. Applied and Numerical Harmonic Analysis. Birkhäuser, Cham. [**https://doi.org/10.1007/978-3-030-12277-5_2**](https://doi.org/10.1007/978-3-030-12277-5_2)

[^46]: Babenko, A.G., Kryakin, Y.V. On Constants in the Jackson Stechkin Theorem in the Case of Approximation by Algebraic Polynomials. Proc. Steklov Inst. Math. 303, 18–30 (2018). [**https://doi.org/10.1134/S0081543818080035**](https://doi.org/10.1134/S0081543818080035)

[^47]: Whitney, H. “On functions with bounded n-th differences”, _J. Math. Pures Appl._, Sér. 9, 36, 67–95 (1957).

[^48]: Jaskaran Singh Kaire and Andriy Prymak, "[**Whitney-type estimates for convex functions**](https://arxiv.org/abs/2311.00912)", arXiv:2311.00912 (2023).

[^49]: Brass, H., Petras, K., _Quadrature Theory: The Theory of Numerical Integration on a Compact Interval_, American Mathematical Society, 2011.

[^50]: Phillips, G.M., _Interpolation and Approximation by Polynomials_, Springer New York, NY, 2003. [**https://doi.org/10.1007/b97417**](https://doi.org/10.1007/b97417)

[^51]: Marsden, M.J., "On Uniform Spline Approximation", _Journal of Approximation Theory_ 6 (1972). [**https://doi.org/10.1016/0021-9045%2872%2990056-1**](https://doi.org/10.1016/0021-9045%2872%2990056-1) [**https://www.sciencedirect.com/science/article/pii/0021904572900561**](https://www.sciencedirect.com/science/article/pii/0021904572900561)

[^52]: [**Beutel, Laura, et al. "On variation-diminishing Schoenberg operators: new quantitative statements."**](https://scholar.google.com/scholar?q=Beutel,+Laura,+et+al.+On+variation-diminishing+Schoenberg+operators+new+quantitative+statements) Multivariate Approximation and Interpolation with Applications (ed. by M. Gasca), Monogr. Academia Cien. de Zaragoza 20 (2002): 9-58.

[^53]: De Boor, C., "On Uniform Approximation by Splines", _Journal of Approximation Theory_ 1 (1968). [**https://doi.org/10.1016/0021-9045%2868%2990026-9**](https://doi.org/10.1016/0021-9045%2868%2990026-9) [**https://www.sciencedirect.com/science/article/pii/0021904568900269**](https://www.sciencedirect.com/science/article/pii/0021904568900269)

[^54]: For example, if $f$ is continuous on a compact interval:<br>(1) The set of polynomials of degree up to $n$ on that interval, where $n$ is zero or a positive integer, has a "best approximation" to $f$ (De Villiers 2012, theorem 4.1.2).<br>(2) Any finite-dimensional subspace of continuous functions on that interval has a "best approximation" to $f$ (De Villiers 2012, theorem 4.1.1).<br>A _subspace_ of a set of functions is a subset of that set (which can be that set itself) with the following property: If $f$ and $g$ are in the subset, so are $(f+g)$ and $(c\cdot f)$ for any number $c$. The subspace is _finite-dimensional_ if it is the smallest subspace that contains a finite set of functions.

[^55]: R.A. DeVore and G.G. Lorentz, _Constructive Approximation_, 1993. [**https://link.springer.com/book/9783540506270**](https://link.springer.com/book/9783540506270)

[^56]: Powell, Michael James David. Approximation theory and methods. Cambridge University Press, 1981.

[^57]: De Boor, C. (1982). Topics in multivariate approximation theory. In: Turner, P.R. (eds) Topics in Numerical Analysis. Lecture Notes in Mathematics, vol 965. Springer, Berlin, Heidelberg. [**https://doi.org/10.1007/BFb0063200**](https://doi.org/10.1007/BFb0063200)

[^58]: In addition, chapter 5 of Rohwer's _Nonlinear Smoothing and Multiresolution Analysis_ discusses extensions to the Lebesgue inequality that apply to Lipschitz-continuous operators (both linear and nonlinear; see section "Bounds for Certain Nonlinear Operators" in this page).

[^59]: However, Gavrea and Ivan ("[**A note on the fixed points of positive linear operators**](https://doi.org/10.1016/j.jat.2017.12.001)", _Journal of Approximation Theory_ (227), 2018) pointed out that there are positive linear operators besides the identity that reproduce all polynomials of the form $x^i$ where $i>0$.

[^60]: Sablonniere, Paul. "A quadrature formula associated with a univariate spline quasi interpolant." BIT Numerical Mathematics 47.4 (2007): 825-837. [**https://doi.org/10.1007/s10543-007-0146-8**](https://doi.org/10.1007/s10543-007-0146-8)

[^61]: It has been argued that the inequalities in this section apply to spline operators that reproduce every polynomial up to degree $d$, say, on _subintervals_ of their domain even though they map to more functions than polynomials on the _whole_ domain. For example, compare&mdash;<br>Sablonnière, P. "Univariate spline quasi-interpolants and applications to numerical analysis." Rend. Sem. Mat. Univ. Pol. Torino 63.3 (2005), section 2, and<br>Sablonnière, P. "Quadratic spline quasi-interpolants on bounded domains of Rd, d= 1, 2, 3." Rend. Sem. Mat. Univ. Pol. Torino 61.3 (2003), matter after Remark 1,<br>with the operators in Lee, B-G., et al., "Some examples of quasi-interpolants constructed from local spline projectors", Mathematical methods for curves and surfaces, Oslo 2000 (2000), section 2, which were shown to reproduce all functions they map to.<br>But what stops us from subdividing the intervals further into, say, $10n$ subintervals of length $1/(10n)$, and inferring a much smaller error bound?  Indeed, in this example, $L(f)$ then still equals a degree-2-or less polynomial at each of the new subintervals and reproduces polynomials of that kind at each of them.

[^62]: [**Bede, Barnabás, and Sorin G. Gal. "Approximation by Nonlinear Bernstein and Favard-Szász-Mirakjan Operators of Max-Product Kind."**](https://scholar.google.com/scholar?q=Bede,+Barnabás,+and+Sorin+G.+Gal.+Approximation+by+Nonlinear+Bernstein+and+Favard-Szász-Mirakjan+Operators+of+Max-Product+Kind) Journal of Concrete & Applicable Mathematics 8.1 (2010).

[^63]: Bede, Barnabás, Coroianu, Lucian, Gal, Sorin G., Approximation and Shape Preserving Properties of the Bernstein Operator of Max-Product Kind, International Journal of Mathematics and Mathematical Sciences, 2009, 590589, 26 pages, 2009. [**https://doi.org/10.1155/2009/590589**](https://doi.org/10.1155/2009/590589)

[^64]: Gal, Sorin G., and Constantin P. Niculescu. "[**Korovkin-type theorems for weakly nonlinear and monotone operators**](https://arxiv.org/abs/2206.14102v1)", arXiv:2206.14102v1 [math.FA], also in _Mediterranean Journal of Mathematics_ 20.2 (2023): 56. [**https://doi.org/10.1007/s00009-023-02271-y**](https://doi.org/10.1007/s00009-023-02271-y)

[^65]: DeVore, R. A. (1998). Nonlinear approximation. Acta Numerica, 7, 51–150. [**https://doi.org/10.1017/S0962492900002816**](https://doi.org/10.1017/S0962492900002816).

[^66]: Gal, S.G., Niculescu, C.P. Korovkin-Type Theorems for Weakly Nonlinear and Monotone Operators. Mediterr. J. Math. 20, 56 (2023). [**https://doi.org/10.1007/s00009-023-02271-y**](https://doi.org/10.1007/s00009-023-02271-y)

[^67]: $W_n$ can, in principle, be nonlinear instead, but this would require a totally different approach to finding the approximation error, and $L_n$ would then be nonlinear in general.

[^68]: Güntürk, C. Sinan, and Weilin Li. "[**Approximation with one-bit polynomials in Bernstein form**](https://arxiv.org/pdf/2112.09183)", arXiv:2112.09183 (2021); Constr Approx 57, 601–630 (2023). [**https://doi.org/10.1007/s00365-022-09608-y**](https://doi.org/10.1007/s00365-022-09608-y)

[^69]: Micchelli, Charles. "[**The saturation class and iterates of the Bernstein polynomials**](https://www.sciencedirect.com/science/article/pii/0021904573900282)", Journal of Approximation Theory 8, no. 1 (1973): 1-18.

[^70]: Wang, Y.Q., Zhang, Y.Y, Liu, J.L., "Expectation identity of the hypergeometric distribution and its application in the calculations of high-order origin moments", Communications in Statistics--Theory and Methods 52(17), 2023. [**https://doi.org/10.1080/03610926.2021.2024235**](https://doi.org/10.1080/03610926.2021.2024235)

[^71]: Weisstein, Eric W. "Central Moment." From MathWorld--A Wolfram Resource. [**https://mathworld.wolfram.com/CentralMoment.html**](https://mathworld.wolfram.com/CentralMoment.html)

[^72]: Ioan Gavrea, Mircea Ivan, "A note on the fixed points of positive linear operators", Journal of Approximation Theory (227), 2018, [**https://doi.org/10.1016/j.jat.2017.12.001.**](https://doi.org/10.1016/j.jat.2017.12.001).

[^73]: Ibrahimoglu, B.A. Lebesgue functions and Lebesgue constants in polynomial interpolation. J Inequal Appl 2016, 93 (2016). [**https://doi.org/10.1186/s13660-016-1030-3**](https://doi.org/10.1186/s13660-016-1030-3)

[^74]: Schaeffer, A. C., and R. J. Duffin. "On some inequalities of S. Bernstein and W. Markoff for derivatives of polynomials." Bulletin of the American Mathematical Society 44.4 (1938): 289-297. [**https://doi.org/10.1090/S0002-9904-1938-06747-X**](https://doi.org/10.1090/S0002-9904-1938-06747-X)

[^75]: Lorentz, G.G. (1964). Inequalities and the Saturation Classes of Bernstein Polynomials. In: Butzer, P.L., Korevaar, J. (eds) On Approximation Theory / Über Approximationstheorie. ISNM International Series of Numerical Mathematics / Internationale Schriftenreihe zur Nummerischen Mathematik / Série Internationale D’Analyse Numérique, vol 5 . Springer, Basel. [**https://doi.org/10.1007/978-3-0348-4131-3_19**](https://doi.org/10.1007/978-3-0348-4131-3_19)

[^76]: Lorentz, G.G. The degree of approximation by polynomials with positive coefficients. Math. Ann. 151, 239–251 (1963). [**https://doi.org/10.1007/BF01398235**](https://doi.org/10.1007/BF01398235)

[^77]: Holtz, O., Nazarov, F. & Peres, Y. New Coins from Old, Smoothly. Constr Approx 33, 331–363 (2011). [**https://doi.org/10.1007/s00365-010-9108-5**](https://doi.org/10.1007/s00365-010-9108-5)

[^78]: $Q_{n,2}$ can also be seen as the Bernstein polynomial of a so-called _linear differential operator_: $1\cdot f^{(0)} + 0\cdot f^{(1)} + (\lambda(1-\lambda)/(2n))\cdot f^{(2)}$.

[^79]: A linear space of functions with this property is also called a _Banach space_ (Axler, S., _Measure, Integration & Real Analysis_, Springer, 2020. [**https://doi.org/10.1007/978-3-030-33143-6**](https://doi.org/10.1007/978-3-030-33143-6)).  In the same work that introduced Banach spaces, S. Banach ("Sur les opérations dans les ensembles abstraits et leur application aux équations intégrales", Fund. Math. 3, 1922) proposed the "norms" presented here.

[^80]: [**S.N. Bernstein, "Démonstration du théorème de Weierstrass fondée sur le calcul des probabilités"**](https://scholar.google.com/scholar?q=S.N.+Bernstein,+Démonstration+du+théorème+de+Weierstrass+fondée+sur+le+calcul+des+probabilités), Comm. Kharkov Math. Soc. 13, 1-2, 1912.

[^81]: Adell, J. A., and J. De la Cal. "Bernstein-type operators diminish the φ-variation." Constructive Approximation 12.4 (1996): 489-507. [**https://doi.org/10.1007/BF02437505**](https://doi.org/10.1007/BF02437505)

[^82]: Adell, J. A., and J. De la Cal. "Bernstein-Durrmeyer operators." Computers & Mathematics with Applications 30.3-6 (1995): 1-14. [**https://doi.org/10.1016/0898-1221%2895%2900081-X**](https://doi.org/10.1016/0898-1221%2895%2900081-X)

[^83]: Gonska, Heinz H., and Xin-long Zhou. "Approximation theorems for the iterated Boolean sums of Bernstein operators." Journal of Computational and Applied Mathematics 53.1 (1994): 21-31. [**https://doi.org/10.1016/0377-0427%02892%02900133-T**](https://doi.org/10.1016/0377-0427%02892%02900133-T)

[^84]: Carl de Boor, "Quadratic spline interpolation and the sharpness of Lebesgue's inequality", _Journal of Approximation Theory_ 17(4), August 1976. [**https://doi.org/10.1016/0021-9045%2876%2990079-4**](https://doi.org/10.1016/0021-9045%2876%2990079-4) [**https://www.sciencedirect.com/science/article/pii/0021904576900794**](https://www.sciencedirect.com/science/article/pii/0021904576900794)

[^85]: Yeon, K., "[**Deep Univariate Polynomial and Conformal Approximation**](https://arxiv.org/abs/2503.00698)", arXiv:2503.00698 [math.NA], 2025.

[^86]: Rohwer, C., _Nonlinear Smoothing and Multiresolution Analysis_, Birkhäuser, 2005. [**https://doi.org/10.1007/3-7643-7382-2**](https://doi.org/10.1007/3-7643-7382-2)
