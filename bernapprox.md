# Approximations in Bernstein Form

[**Peter Occil**](mailto:poccil14@gmail.com)

This page describes how to compute a polynomial in Bernstein form that comes close to a function $f(\lambda)$ with a user-defined error tolerance, so that the polynomial's coefficients will lie in the closed unit interval if $f$'s values lie in that interval.  The polynomial is often simpler to calculate than the original function $f$ and can often be accurate enough for an application's purposes.

> **Note:** This page was originally developed as part of a section on _approximate Bernoulli factories_, or algorithms that toss heads with probability equal to a polynomial that comes close to a continuous function.  However, the information in this page is of much broader interest than the approximate Bernoulli factory problem.

<a id=Contents></a>
## Contents

- [**Contents**](#Contents)
- [**About This Document**](#About_This_Document)
- [**Definitions**](#Definitions)
- [**Approximations by Polynomials**](#Approximations_by_Polynomials)
    - [**Taylor Polynomials for "Smooth" Functions**](#Taylor_Polynomials_for_Smooth_Functions)
    - [**Approximating an Integral**](#Approximating_an_Integral)
- [**Approximations by Rational Functions**](#Approximations_by_Rational_Functions)
- [**Request for Additional Methods**](#Request_for_Additional_Methods)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Results Used in Approximations by Polynomials**](#Results_Used_in_Approximations_by_Polynomials)
    - [**Chebyshev Interpolants**](#Chebyshev_Interpolants)
- [**License**](#License)

<a id=About_This_Document></a>
## About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/bernapprox.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/bernapprox.md)**.  You can send comments on this document on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues), especially if you find any errors on this page.

My audience for this article is **computer programmers with mathematics knowledge, but little or no familiarity with calculus**.

<a id=Definitions></a>
## Definitions

This section describes certain math terms used on this page for programmers to understand.

The _closed unit interval_ (written as \[0, 1\]) means the set consisting of 0, 1, and every real number in between.

For definitions of _continuous_, _derivative_, _convex_, _concave_, _Hölder continuous_, and _Lipschitz continuous_, see the definitions section in "[**Supplemental Notes for Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernsupp.html#Definitions)".

Any polynomial can be written in _Bernstein form_ as&mdash;

$${n\choose 0}\lambda^0 (1-\lambda)^{n-0} a[0] + {n\choose 1}\lambda^1 (1-\lambda)^{n-1} a[1] + ... + {n\choose n}\lambda^n (1-\lambda)^{n-n} a[n],$$

where _n_ is the polynomial's _degree_ and _a_[0], _a_[1], ..., _a_\[_n_\] are its _n_ plus one _coefficients_.[^1]

<a id=Approximations_by_Polynomials></a>
## Approximations by Polynomials

A polynomial of a high enough degree (called $n$) can be used to approximate $f(\lambda)$ with an error no more than $\epsilon$, as long as the polynomial's Bernstein coefficients can be calculated and an explicit upper bound on the approximation error is available. See my [**question on MathOverflow**](https://mathoverflow.net/questions/442057/explicit-and-fast-error-bounds-for-approximating-continuous-functions).  Examples of these polynomials (all of degree $n$) are given in the following table.

| Name |  Polynomial | Its Bernstein coefficients are found as follows: | Notes |
 --- | --- | --- | --- |
| Bernstein polynomial. | $B_n(f)$.  | $f(j/n)$, where $0\le j\le n$. | Originated with S.N. Bernstein (1912). |
| Order-2 iterated Boolean sum. | $U_{n,2} = B_n(W_{n,2})$. | $W_{n,2}(j/n)$, where $0\le j\le n$ and $W_{n,2}(\lambda) = 2 f(\lambda) - B_n(f(\lambda))$. | Micchelli (1973)[^2], Guan (2009)[^3], Güntürk and Li (2021, sec. 3.3)[^4]. |
| Order-3 iterated Boolean sum. | $U_{n,3} = B_n(W_{n,3})$. | $W_{n,3}(j/n)$, where $0\le j\le n$ and $W_{n,3}(\lambda) = B_n(B_n(f(\lambda)))$ + $3 (f(\lambda)$ &minus; $B_n(f(\lambda)))$. | Same. |
| Butzer's linear combination (order 1). | $L_{2,n/2} = 2 B_{n}(f(\lambda))$ &minus; $B_{n/2}(f(\lambda))$. | (First, define the following operation: **Get coefficients for $n$ given $m$**: Treat the coefficients \[$f(0/m)$, $f(1/m)$, ..., $f(m/m)$\] as representing a polynomial in Bernstein form of degree $m$, then rewrite that polynomial to one of degree $n$ with $n+1$ Bernstein coefficients, then return those coefficients.)<br>**Get coefficients for $n$ given $n/2$**, call them _a_[0], ..., _a_[_n_], then set the final Bernstein coefficients to $2 f(j/n) - a[j]$ for each $j$. |Tachev (2022)[^5], Butzer (1955)[^6].  $n\ge 6$ must be even.|
| Butzer's linear combination (order 2). | $L_{3,n/4} = B_{n/4}(f)/3$ + $B_{n}(f)\cdot 8/3$ &minus; $2 B_{n/2}(f)$ | **Get coefficients for $n$ given $n/4$**, call them _a_[0], ..., _a_[_n_], then **get coefficients for $n$ given $n/2$**, call them _b_[0], ..., _b_[_n_], then set the final Bernstein coefficients to $a[j]/3-2 b[j]+8 f(j/n)/3$ for each $j$. | Butzer (1955)[^6]. $n\ge 4$ must be divisible by 4. |
| Lorentz operator (order 2). | $Q_{n-2,2}=B_{n-2}(f)-x(1-x)\cdot$ $B_{n-2}(f'')/(2(n-2))$. | **Get coefficients for $n$ given $n-2$**, call them _a_[0], ..., _a_[_n_].  Then for each integer $j$ with $1\le j\lt n$, subtract $z$ from _a_[_j_], where $z=(((f''((j-1)/(n-2)))$ / $(4(n-2)))\cdot 2j(n-j)/((n-1)\cdot(n))$.  The final Bernstein coefficients are now _a_[0], ..., _a_[_n_]. | Holtz et al. (2011)[^7]; Bernstein (1932)[^8]; Lorentz (1966)[^9]. $n\ge 4$; $f''$ is the second derivative of $f$. |

The goal is now to find a polynomial of degree $n$ such that&mdash;

1. the polynomial is within $\epsilon$ of $f(\lambda)$, and
2. each of the polynomial's Bernstein coefficients is not less than 0 or greater than 1 (assuming none of $f$'s values is less than 0 or greater than 1).

For some of the polynomials given above, a degree $n$ can be found so that the degree-$n$ polynomial is within $\epsilon$ of $f$, if $f$ is continuous and meets other conditions.  In general, to find the degree $n$, solve the error bound's equation for $n$ and round the solution up to the nearest integer.  See the table below, where:

- $M_r$ is not less than the maximum of the absolute value of $f$'s $r$-th derivative.
- $H_r$ is not less than $f$'s $r$-th derivative's Hölder constant (for the given Hölder exponent _&alpha;_).
- $L_r$ is not less than $f$'s $r$-th derivative's Lipschitz constant.

| If _f_(_&lambda;_): |  Then the following polynomial: |  Is close to _f_ with the following error bound: | Where _n_ is:  | Notes |
 --- | --- | --- | --- | --- |
| Has Hölder continuous second derivative (see "Definitions"). | $U_{n, 2}$. | _&epsilon;_ = $(5H_2+4M_2)$ / $(32 n^{1+\alpha/2})$. | _n_=max(3, ceil($((5H_2+4M_2)$ / $(32\epsilon))^{2/(2+\alpha)}$)). | $n\ge 3$.  0 &lt; _&alpha;_ &le; 1 is second derivative's Hölder exponent.  See Proposition B10C in appendix.|
| Has Lipschitz continuous second derivative. | $U_{n, 2}$. | _&epsilon;_ = $(5L_2+4M_2)$ / $(32 n^{3/2})$. | _n_=max(3, ceil($((5L_2+4M_2)$ / $(32\epsilon))^{2/3}$)). | $n\ge 3$.  Special case of previous entry.|
| Has Lipschitz continuous second derivative. | $Q_{n-2,2}$. | _&epsilon;_ = 0.098585 _L_<sub>2</sub>/((_n_&minus;2)<sup>3/2</sup>). | _n_=max(4, ceil($((0.098585 L_2)$ / $(\epsilon))^{2/3}+2$)). | $n\ge 4$. See Proposition B10A in appendix. |
| Has continuous third derivative. | $L_{2, n/2}$. | _&epsilon;_ = (3\*sqrt(3&minus;4/_n_)/4)\*_M_<sub>3</sub>/_n_<sup>2</sup> &lt; (3\*sqrt(3)/4)\*_M_<sub>3</sub>/_n_<sup>2</sup> &lt; 1.29904\*_M_<sub>3</sub>/_n_<sup>2</sup> &le; 1.29904\*_M_<sub>3</sub>/_n_<sup>3/2</sup>. | _n_=max(6,ceil($\frac{3^{3/4} \sqrt{M_3/\epsilon}}{2}$)) &le; max(6,ceil((113976/100000) \* sqrt(_M_<sub>3</sub>/_&epsilon;_))) &le; max(6, ceil($((1.29904 M_3)$ / $\epsilon)^{2/3}$)). (If _n_ is now odd, add 1.) | Tachev (2022)[^5]. $n\ge 6$ must be even. |
| Has Hölder continuous third derivative. | $U_{n, 2}$. | _&epsilon;_ = $(9H_3+8M_2+8M_3)$ / $(64 n^{(3+\alpha)/2})$. | _n_=max(6, ceil($((9H_3+8M_2+8M_3)$ / $(64\epsilon))^{2/(3+\alpha)}$)). | $n\ge 6$.  0 &lt; _&alpha;_ &le; 1 is third derivative's Hölder exponent.  See Proposition B10D in appendix.|
| Has Lipschitz continuous third derivative. | $U_{n, 2}$. | _&epsilon;_ = $(9H_3+8M_2+8M_3)$ / $(64 n^2)$. | _n_=max(6, ceil($((9H_3+8M_2+8M_3)$ / $(64\epsilon))^{1/2}$)). | $n\ge 6$.  Special case of previous entry.|
| Has Lipschitz continuous third derivative. | $L_{3, n/4}$. | _&epsilon;_ = _L_<sub>3</sub>/(8\*_n_<sup>2</sup>). | _n_=max(4,ceil((sqrt(2)/4) \* sqrt(_L_<sub>3</sub>/_&epsilon;_))) &le; max(4,ceil((35356/100000) \* sqrt(_L_<sub>3</sub>/_&epsilon;_))). (Round _n_ up to nearest multiple of 4.) | $n\ge 4$ must be divisible by 4. See Proposition B10 in appendix. |
| Has Lipschitz continuous derivative. | $B_n(f)$. | _&epsilon;_ = _L_<sub>1</sub>/(8\*_n_). | _n_ = ceil(_L_<sub>1</sub>/(8\*_&epsilon;_)). | Lorentz (1963)[^10].[^11]|
| Has Hölder continuous derivative. | $B_n(f)$. | _&epsilon;_ = _H_<sub>1</sub>/(4\*_n_<sup>(1+_&alpha;_)/2</sup>). | _n_ = ceil((_H_<sub>1</sub>/(4\*_&epsilon;_))<sup>2/(1+_&alpha;_)</sup>). | Schurer and Steutel (1975)[^12]. 0 &lt; _&alpha;_ &le; 1 is derivative's Hölder exponent. |
| Is Hölder continuous. | $B_n(f)$. | _&epsilon;_ = _H_<sub>0</sub>\*(1/(4\*_n_))<sup>_&alpha;_/2</sup>. | _n_ = ceil((_H_<sub>0</sub>/_&epsilon;_))<sup>2/_&alpha;_</sup>/4). | Kac (1938)[^13]. 0 &lt; _&alpha;_ &le; 1 is _f_'s Hölder exponent. |
| Is Lipschitz continuous. | $B_n(f)$. | _&epsilon;_ = _L_<sub>0</sub>\*sqrt(1/(4\*_n_)). | _n_ = ceil((_L_<sub>0</sub>)<sup>2</sup>/(4\*_&epsilon;_<sup>2</sup>)). | Special case of previous entry. |
| Is Lipschitz continuous. | $B_n(f)$. | _&epsilon;_ = $\frac{4306+837\sqrt{6}}{5832} L_0/n^{1/2}$ &lt; $1.08989 L_0/n^{1/2}$. | _n_=ceil((_L_<sub>0</sub>\*1.08989/_&epsilon;_)<sup>2</sup>). | Sikkema (1961)[^14]. |

> **Note:** In addition, by analyzing the proof of Theorem 2.4 of Güntürk and Li (2021, sec. 3.3)[^4], the following error bounds for $U_{n, 3}$ _appear_ to be true:
>
> - If $f(\lambda)$ has continuous fifth derivative: _&epsilon;_ = 4.0421\*max(_M_<sub>0</sub>,...,_M_<sub>5</sub>)/_n_<sup>5/2</sup>.
> - If $f(\lambda)$ has continuous sixth derivative: _&epsilon;_ = 4.8457\*max(_M_<sub>0</sub>,...,_M_<sub>6</sub>)/_n_<sup>3</sup>.

Bernstein polynomials ($B_n(f)$) have the advantages that only one Bernstein coefficient has to be found per run and that the coefficient will be bounded by 0 and 1 if $f(\lambda)$ is.  But their disadvantage is that they approach $f$ slowly in general, at a rate no faster than a rate proportional to $1/n$ (Voronovskaya 1932)[^15].

On the other hand, polynomials other than Bernstein polynomials ($B_n(f)$) can approach $f$ faster in many cases than $B_n(f)$, but are not necessarily bounded by 0 and 1.  For these polynomials, the following process can be used to calculate the required degree $n$, given an error tolerance of $\epsilon$, assuming none of $f$'s values is less than 0 or greater than 1.

1. Determine whether $f$ is described in the table above.  Let _A_ be the minimum of $f$ on the closed unit interval and let _B_ be the maximum of $f$ there.
2. If 0 &lt; _A_ &le; _B_ &lt; 1, calculate $n$ as given in the table above, but with $\epsilon=\min(\epsilon, A, 1-B)$, and stop.
3. Propositions B1, B2, and B3 in the [**appendix**](#Appendix) give conditions on $f$ so that $W_{n,2}$ or $W_{n,3}$ (as the case may be) will be nonnegative.  If _B_ is less than 1 and any of those conditions is met, calculate $n$ as given in the table above, but with $\epsilon=\min(\epsilon, 1-B)$. (For B3, set $n$ to max($n$, $m$), where $m$ is given in that proposition.) Then stop; $W_{n,2}$ or $W_{n,3}$ will now be bounded by 0 and 1.
4. Calculate $n$ as given in the table above.  Then, if any Bernstein coefficient of the resulting polynomial is less than 0 or greater than 1, double the value of $n$ until this condition is no longer true.

The resulting polynomial of degree $n$ will be within $\epsilon$ of $f(\lambda)$.

> **Notes:**
>
> 1. A polynomial's Bernstein coefficients can be rounded to multiples of $\delta$ (where $0 \lt\delta\le 1$) by setting either&mdash;
>
>     - $c$=floor($c/\delta$) \* $\delta$ (rounding down), or
>     - $c$=floor($c/\delta + 1/2$) \* $\delta$ (rounding to the nearest multiple),
>
>     for each coefficient $c$.  The new polynomial will differ from the old one by at most $\delta$.  (Thus, to find a polynomial with multiple-of-$\delta$ coefficients that approximates $f$ with error $\epsilon$ [which must be greater than $\delta$], first find a polynomial with error $\epsilon - \delta$, then round that polynomial's coefficients as given here.)
> 2. _Gevrey's hierarchy_ is a class of "smooth" functions with known bounds on their derivatives. A function $f(\lambda)$ belongs in _Gevrey's hierarchy_ if there are $B\ge 1$, $l\ge 1$, $\gamma\ge 1$ such that $f$'s $n$-th derivative's absolute value is not greater than $Bl^n n^{\gamma n}$ for every $n\ge 1$ (Kawamura et al. 2015)[^16]; see also (Gevrey 1918)[^17]). In this case, for each $n\ge 1$&mdash;
>    - the $n$-th derivative of $f$ is continuous and has a maximum absolute value of at most $Bl^n n^{\gamma n}$, and
>    - the $(n-1)$-th derivative of $f$ is Lipschitz continuous with Lipschitz constant at most $Bl^n n^{\gamma n}$.
>
>    _Gevrey's hierarchy_ with $\gamma=1$ is the class of functions equaling power series (see next section).

<a id=Taylor_Polynomials_for_Smooth_Functions></a>
### Taylor Polynomials for "Smooth" Functions

If $f(\lambda)$ is "smooth" enough on the closed unit interval and if $\epsilon$ is big enough, then Taylor's theorem shows how to build a polynomial that comes within $\epsilon$ of $f$. In this section $f$ may but need not be writable as a power series.

Let $n\ge 0$ be an integer, and let $f^{(i)}$ be the $i$-th derivative of $f(\lambda)$.  Suppose that&mdash;

1. $f$ is continuous on the closed unit interval, and
2. $f$ satisfies $\epsilon\le f(0)\le 1-\epsilon$ and $\epsilon\le f(1)\le 1-\epsilon$, and
3. $f$ satisfies $\epsilon\lt f(\lambda)\lt 1-\epsilon$ whenever $0\lt\lambda\lt 1$, and
4. $f$'s $(n+1)$-th derivative is continuous and satisfies $\epsilon\ge M/((n+1)!)$, where $M$ is not less than the maximum of the absolute value of that derivative, and
5. $f(0)$ is known as well as $f^{(1)}(0), ..., f^{(n)}(0)$.

Then the $n$-th _Taylor polynomial_ centered at 0, given below, is within $\epsilon$ of $f$: $$P(\lambda) = a_0 \lambda^0 + a_1 \lambda^1 + ... + a_n \lambda^n,$$

where $a_0 = f(0)$ and $a_i = f^{(i)}(0)/(i!)$ for $i\ge 1$.

Items 2 and 3 above are not needed to find a polynomial within $\epsilon$ of $f$, but they _are_ needed to ensure the Taylor polynomial's Bernstein coefficients will lie in the closed unit interval, as described after the note.

> **Note:** If $f(\lambda)$ can be rewritten as a power series, namely $f(\lambda) = c_0 \lambda^0 + c_1 \lambda^1 + ... + c_i \lambda^i + ...$ whenever $0\le\lambda\le 1$ (so that $f$ has a continuous $k$-th derivative for every $k$), and if the coefficients $c_i$&mdash;
>
> - are each greater than 0,
> - form a nowhere increasing sequence (example: (1/4, 1/8, 1/8, 1/16, ...)), and
> - meet the so-called "ratio test",
>
> then the algorithms in Carvalho and Moreira (2022)[^18] can be used to find the first $n$+1 coefficients such that $P(\lambda)$ is within $\epsilon$ of $f$ (see also the appendix).

Given the Taylor polynomial $P$, the algorithm to find the polynomial's Bernstein coefficients is as follows:

- Rewrite $P(\lambda)$ as a polynomial in Bernstein form.  (One way to transform a polynomial to Bernstein form, given the "power" coefficients $a_0, ..., a_n$, is the so-called "matrix method" from Ray and Nataraj (2012)[^19].)  Let $b_0, ..., b_n$ be the Bernstein-form polynomial's coefficients.  If any of those coefficients is less than 0 or greater than 1, double the value of $n$ and rewrite $P$ to Bernstein form of degree $n$, until none of the coefficients is less than 0 or greater than 1.

The result will be a polynomial of degree $n$ with $(n+1)$ Bernstein coefficients.

<a id=Approximating_an_Integral></a>
### Approximating an Integral

Roughly speaking, the _integral_ of _f_(_x_) on an interval \[_a_, _b_\] is the "area under the graph" of that function when the function is restricted to that interval.  If _f_ is continuous there, this is the value that $\frac{1}{n} (f(a+(b-a)(1-\frac{1}{2})/n)+f(a+(b-a)(2-\frac{1}{2})/n)+...+f(a+(b-a)(n-\frac{1}{2})/n))$ approaches as $n$ gets larger and larger.

If a polynomial is in Bernstein form of degree $n$, and is defined on the closed unit interval:

- The polynomial's integral on the closed unit interval is equal to the average of its $(n+1)$ Bernstein coefficients; that is, the integral is found by adding those coefficients together, then dividing by $(n+1)$ (Tsai and Farouki 2001)[^43].
- If the polynomial is within $\epsilon$ of a function $f(\lambda)$ on the closed unit interval, then its integral on that interval will be within $\epsilon$ of the integral of $f$.

<a id=Approximations_by_Rational_Functions></a>
## Approximations by Rational Functions

Consider the class of rational functions $p(\lambda)/q(\lambda)$ that map the closed unit interval to itself, where $q(\lambda)$ is in Bernstein form with non-negative coefficients.  Then rational functions of this kind are not much better than polynomials in approximating $f(\lambda)$ when&mdash;

- the $k$-th derivative of $f$ is continuous on the open interval (0, 1), but not the $(k+1)$-th derivative (Borwein 1979, section 3)[^20], _or_
- $f(\lambda)$ is writable as $a_0 \lambda^0 + a_1 \lambda^1 + ...$, where $a_k\ge(k+1) a_{k+1}\ge 0$ whenever $k\ge 0$ (Borwein 1980)[^21].

In addition, rational functions are not much better than polynomials in approximating $f(\lambda)$ when&mdash;

- the $k$-th derivative of $f$ is continuous on the half-open interval (0, 1], but not the $(k+1)$-th derivative, _and_
- the rational function has no root that is a complex number whose real part is between 0 and 1 (Borwein 1979, theorem 29)[^20].

<a id=Request_for_Additional_Methods></a>
## Request for Additional Methods

Readers are requested to let me know of additional solutions to the following problem:

_Let $f(\lambda)$ be continuous and map the closed unit interval to itself.  Given $\epsilon\gt 0$, and given that $f(\lambda)$ belongs to a large class of functions (for example, it has a continuous, Lipschitz continuous, concave, or nowhere decreasing $k$-th derivative for some integer $k$, or any combination of these), compute the Bernstein coefficients of a polynomial or rational function (of some degree $n$) that is within $\epsilon$ of $f(\lambda)$._

_The approximation error must be no more than a constant times $1/n^{r/2}$ if the given class has only functions with continuous $r$-th derivative._

_Methods that use only integer arithmetic and addition and multiplication of rational numbers are preferred (thus, Chebyshev methods and other methods that involve cosines, sines, $\pi$, $\exp$, and $\ln$ are not preferred)._

See also the [**open questions**](https://peteroupc.github.io/bernreq.html#Polynomials_that_approach_a_factory_function_fast).

<a id=Notes></a>
## Notes

[^1]: choose(_n_, _k_) = (1\*2\*3\*...\*_n_)/((1\*...\*_k_)\*(1\*...\*(_n_&minus;_k_))) =  _n_!/(_k_! * (_n_ &minus; _k_)!) $={n \choose k}$ is a _binomial coefficient_, or the number of ways to choose _k_ out of _n_ labeled items.  It can be calculated, for example, by calculating _i_/(_n_&minus;_i_+1) for each integer _i_ in \[_n_&minus;_k_+1, _n_\], then multiplying the results (Yannis Manolopoulos. 2002. "Binomial coefficient computation: recursion or iteration?", SIGCSE Bull. 34, 4 (December 2002), 65–67. DOI: [**https://doi.org/10.1145/820127.820168**](https://doi.org/10.1145/820127.820168)).  For every _m_>0, choose(_m_, 0) = choose(_m_, _m_) = 1 and choose(_m_, 1) = choose(_m_, _m_&minus;1) = _m_; also, in this document, choose(_n_, _k_) is 0 when _k_ is less than 0 or greater than _n_.<br>_n_! = 1\*2\*3\*...\*_n_ is also known as _n_ factorial; in this document, (0!) = 1.

[^2]: Micchelli, Charles. "The saturation class and iterates of the Bernstein polynomials." Journal of Approximation Theory 8, no. 1 (1973): 1-18.

[^3]: Guan, Zhong. "[**Iterated Bernstein polynomial approximations**](https://arxiv.org/abs/0909.0684)", arXiv:0909.0684 (2009).

[^4]: Güntürk, C.S., Li, W., "[**Approximation of functions with one-bit neural networks**](https://arxiv.org/abs/2112.09181)", arXiv:2112.09181 [cs.LG], 2021.

[^5]: Tachev, Gancho. "[**Linear combinations of two Bernstein polynomials**](https://doi.org/10.3934/mfc.2022061)", _Mathematical Foundations of Computing_, 2022.

[^6]: Butzer, P.L., "Linear combinations of Bernstein polynomials", Canadian Journal of Mathematics 15 (1953).

[^7]: Holtz, O., Nazarov, F., Peres, Y., "[**New Coins from Old, Smoothly**](https://link.springer.com/content/pdf/10.1007/s00365-010-9108-5.pdf)", _Constructive Approximation_ 33 (2011).

[^8]: Bernstein, S. N. (1932). "Complément a l’article de E. Voronovskaya." CR Acad. URSS, 86-92.

[^9]: G.G. Lorentz, "The degree of approximation by polynomials with positive coefficients", 1966.

[^10]: G.G. Lorentz, "Inequalities and saturation classes for Bernstein polynomials", 1963.

[^11]: Qian et al. suggested an _n_ which has the upper bound _n_=ceil(1+max($2n$,$n^2 (2^{n}C)/\epsilon$)), where $C$ is the maximum of $f$ on its domain, but this is often much worse and works only if $f$ is a polynomial (Qian, W., Riedel, M. D., & Rosenberg, I. (2011). Uniform approximation and Bernstein polynomials with coefficients in the unit interval. European Journal of Combinatorics, 32(3), 448-463).

[^12]: Schurer and Steutel, "On an inequality of Lorentz in the theory of Bernstein polynomials", 1975.

[^13]: Kac, M., "Une remarque sur les polynômes de M. S. Bernstein", Studia Math. 7, 1938.

[^14]: Sikkema, P.C., "Der Wert einiger Konstanten in der Theorie der Approximation mit Bernstein-Polynomen", 1961.

[^15]: E. Voronovskaya, "Détermination de la forme asymptotique d'approximation des fonctions par les polynômes de M. Bernstein", 1932.

[^16]: Kawamura, Akitoshi, Norbert Müller, Carsten Rösnick, and Martin Ziegler. "[**Computational benefit of smoothness: Parameterized bit-complexity of numerical operators on analytic functions and Gevrey’s hierarchy**](https://doi.org/10.1016/j.jco.2015.05.001)." Journal of Complexity 31, no. 5 (2015): 689-714.

[^17]: M. Gevrey, "Sur la nature analytique des solutions des équations aux dérivées partielles", 1918.

[^18]: Carvalho, Luiz Max, and Guido A. Moreira. "[**Adaptive truncation of infinite sums: applications to Statistics**](https://arxiv.org/abs/2202.06121)", arXiv:2202.06121 (2022).

[^19]: S. Ray, P.S.V. Nataraj, "A Matrix Method for Efficient Computation of Bernstein Coefficients", Reliable Computing 17(1), 2012.

[^20]: Borwein, P. B. (1979). Restricted uniform rational approximations (Doctoral dissertation, University of British Columbia).

[^21]: Borwein, Peter B. "Approximations by rational functions with positive coefficients." Journal of Mathematical Analysis and Applications 74, no. 1 (1980): 144-151.

[^22]: Qian, Weikang, Marc D. Riedel, and Ivo Rosenberg. "Uniform approximation and Bernstein polynomials with coefficients in the unit interval." European Journal of Combinatorics 32, no. 3 (2011): 448-463.

[^23]: Li, Zhongkai. "Bernstein polynomials and modulus of continuity." Journal of Approximation Theory 102, no. 1 (2000): 171-174.

[^24]: _Summation notation_, involving the Greek capital sigma (&Sigma;), is a way to write the sum of one or more terms of similar form. For example, $\sum_{k=0}^n g(k)$ means $g(0)+g(1)+...+g(n)$, and $\sum_{k\ge 0} g(k)$ means $g(0)+g(1)+...$.

[^25]: Molteni, Giuseppe. "Explicit bounds for even moments of Bernstein’s polynomials." Journal of Approximation Theory 273 (2022): 105658.

[^26]: Adell, J. A., Bustamante, J., & Quesada, J. M. (2015). Estimates for the moments of Bernstein polynomials. Journal of Mathematical Analysis and Applications, 432(1), 114-128.

[^27]: Adell, J.A., Cárdenas-Morales, D., "[**Quantitative generalized Voronovskaja’s formulae for Bernstein polynomials**](https://www.sciencedirect.com/science/article/pii/S0021904518300376)", Journal of Approximation Theory 231, July 2018.

[^28]: Gonska, H.H., Piţul, P., Raşa, I., "On Peano's form of the Taylor remainder, Voronovskaja's theorem and the commutator of positive linear operators", In Numerical Analysis and Approximation Theory, 2006.

[^29]: The result from Gonska et al. actually applies if the $r$-th derivative belongs to a broader class of continuous functions than Lipschitz continuous functions, but this feature is not used in this proof.

[^30]: Cheng, F., "On the rate of convergence of Bernstein polynomials of functions of bounded variation", Journal of Approximation Theory 39 (1983).

[^31]: G.G. Lorentz, _Bernstein polynomials_, 1953.

[^32]: _NIST Digital Library of Mathematical Functions_, [**https://dlmf.nist.gov/**](https://dlmf.nist.gov/) , Release 1.1.9 of 2023-03-15.

[^33]: Ditzian, Z., Totik, V., _Moduli of Smoothness_, 1987.

[^34]: May, C.P., "Saturation and inverse theorems for a class of exponential-type operators", Canadian Journal of Mathematics 28 (1976).

[^35]: Draganov, Borislav R. "On simultaneous approximation by iterated Boolean sums of Bernstein operators." Results in Mathematics 66, no. 1 (2014): 21-41.

[^36]: Knoop, H-B., Pottinger, P., "Ein Satz vom Korovkin-Typ für $C^k$-Räume", Math. Zeitschrift 148 (1976).

[^37]: Kacsó, D.P., "Simultaneous approximation by almost convex operators", 2002.

[^38]: Stancu, D.D., Agratini, O., et al. _Analiză Numerică şi Teoria Aproximării_, 2001.

[^39]: H. Wang, "[**Analysis of error localization of Chebyshev spectral approximations**](https://arxiv.org/abs/2106.03456v3)", arXiv:2106.03456v3 [math.NA], 2023.

[^40]: Trefethen, L.N., [**_Approximation Theory and Approximation Practice_**](https://www.chebfun.org/ATAP/), 2013.

[^41]: R. Kannan and C.K. Kreuger, _Advanced Analysis on the Real Line_, 1996.

[^42]: Rababah, Abedallah. "Transformation of Chebyshev–Bernstein polynomial basis." Computational Methods in Applied Mathematics 3.4 (2003): 608-622.

[^43]: Tsai, Y., Farouki, R.T., "Algorithm 812: BPOLY: An Object- Oriented Library of Numerical Algorithms for Polynomials in Bernstein Form", ACM Transactions on Mathematical Software, June 2001.

<a id=Appendix></a>
## Appendix

<a id=Results_Used_in_Approximations_by_Polynomials></a>
### Results Used in Approximations by Polynomials

**Lemma A1:** Let&mdash; $$f(x)=a_0 x^0 + a_1 x^1 + ...,$$ where the $a_i$ are constants each 0 or greater and sum to a finite value and where $0\le x\le 1$ (the domain is the closed unit interval). Then $f$ is convex and has a maximum at 1.

_Proof:_ By inspection, $f(x)$ is a power series and is nonnegative wherever $x\ge 0$ (and thus wherever $0\le x\le 1$).  Each of its terms has a maximum at 1 since&mdash;

- for $n=0$, $a_0 x^0=a_0$ is a non-negative constant (which trivially reaches its maximum at 1), and
- for each $n$ where $a_0 = 0$, $a_0 x^n$ is the constant 0 (which trivially reaches its maximum at 1), and
- for each other $n$, $x^n$ is a strictly increasing function and multiplying that by $a_n$ (a positive constant) doesn't change whether it's strictly increasing.

Since all of these terms have a maximum at 1 on the domain, so does their sum.

The derivative of $f$ is&mdash; $$f'(x) = 1\cdot a_1 x^0 + ... + i\cdot a_i x^{i-1} + ...,$$ which is still a power series with nonnegative values of $a_n$, so the proof so far applies to $f'$ instead of $f$.  By induction, the proof so far applies to all derivatives of $f$, including its second derivative.

Now, since the second derivative is nonnegative wherever $x\ge 0$, and thus on its domain, $f$ is convex, which completes the proof. &#x25a1;

**Proposition A2:** For a function $f(x)$ as in Lemma A1, let&mdash; $$g_n(x)=a_0 x^0 + ... + a_n x^n,$$ and have the same domain as $f$.  Then for every $n\ge 1$, $g_n(x)$ is within $\epsilon$ of $f(x)$, where $\epsilon = f(1) - g_n(1)$.

_Proof:_ $g_n$, consisting of the first $n+1$ terms of $f$, is a power series with nonnegative coefficients, so by Lemma A1, it has a maximum at 1.  The same is true for $f-g_n$, consisting of the remaining terms of $f$.  Since the latter has a maximum at 1, the maximum error is $\epsilon = f(1)-g_n(1)$. &#x25a1;

For a function $f$ described in Lemma A1, $f(1)=a_0 1^0 + a_1 1^1 + ... = a_0 + a_1+...$, and $f$'s error behavior is described at the point 1, so the algorithms given in Carvalho and Moreira (2022)[^18] &mdash; which apply to infinite sums &mdash; can be used to "cut off" $f$ at a certain number of terms and do so with a controlled error.

**Proposition B1**: Let $f(\lambda)$ map the closed unit interval to itself and be continuous and concave.  Then $W_{n,2}$ and $W_{n,3}$ (as defined in "For Certain Functions") are nonnegative on the closed unit interval.

_Proof:_ For $W_{n,2}$ it's enough to prove that $B_n(f)\le f$ for every $n\ge 1$.  This is the case because of Jensen's inequality and because $f$ is concave.

For $W_{n,3}$ it must also be shown that $B_n(B_n(f(\lambda)))$ is nonnegative.  For this, using only the fact that $f$ maps the closed unit interval to itself, $B_n(f)$ will have Bernstein coefficients in that interval (each coefficient is a value of $f$) and so will likewise map the closed unit interval to itself (Qian et al. 2011)[^22].  Thus, by induction, $B_n(B_n(f(\lambda)))$ is nonnegative.  The discussion for $W_{n,2}$ also shows that $(f - B_n(f))$ is nonnegative as well.  Thus, $W_{n,3}$ is nonnegative on the closed unit interval. &#x25a1;

**Proposition B2**: Let $f(\lambda)$ map the closed unit interval to itself, be continuous, nowhere decreasing, and subadditive, and equal 0 at 0. Then $W_{n,2}$ is nonnegative on the closed unit interval.

_Proof:_ The assumptions on $f$ imply that $B_n(f)\le 2 f$ (Li 2000)[^23], showing that $W_{n,2}$ is nonnegative on the closed unit interval.  &#x25a1;

> **Note:** A subadditive function $f$ has the property that $f(a+b) \le f(a)+f(b)$ whenever $a$, $b$, and $a+b$ are in $f$'s domain.

**Proposition B3**: Let $f(\lambda)$ map the closed unit interval to itself and have a Lipschitz continuous derivative with Lipschitz constant $L$.  If $f(\lambda) \ge \frac{L \lambda(1-\lambda)}{2m}$ on $f$'s domain, for some $m\ge 1$, then $W_{n,2}$ is nonnegative there, for every $n\ge m$.

_Proof_: Let $E(\lambda, n) = \frac{L \lambda(1-\lambda)}{2n}$. Lorentz (1963)[^10] showed that with this Lipschitz derivative assumption on $f$, $B_n$ differs from $f(\lambda)$ by no more than $E(\lambda, n)$ for every $n\ge 1$ and wherever $0\lt\lambda\lt 1$.  As is well known, $B_n(0)=f(0)$ and $B_n(1)=f(1)$.  By inspection, $E(\lambda, n)$ is biggest when $n=1$ and decreases as $n$ increases. Assuming the worst case that $B_n(\lambda) = f(\lambda) + E(\lambda, m)$, it follows that $W_{n,2}=2 f(\lambda) - B_n(\lambda)\ge 2 f(\lambda) - f(\lambda) - E(\lambda, m) = f(\lambda) - E(\lambda, m)\ge 0$ whenever $f(\lambda)\ge E(\lambda, m)$.  Because $E(\lambda, k+1)\le E(\lambda,k)$ for every $k\ge 1$, the preceding sentence holds true for every $n\ge m$. &#x25a1;

The following results deal with a useful quantity when discussing the error in approximating a function by Bernstein polynomials.  Suppose a coin shows heads with probability $p$, and $n$ independent tosses of the coin are made.  Then the total number of heads $X$ follows a _binomial distribution_, and the $r$-th central moment of that distribution is as follows: $$T_{n,r}(p) = \mathbb{E}[(X-\mathbb{E}[X])^r] = \sum_{k=0}^n (k-np)^r{n \choose k}p^k (1-p)^{n-k},$$ where $\mathbb{E}[.]$ is the expected value ("long-run average").   (Traditionally, another central moment, that of $X/n$ or the ratio of heads to tosses, is denoted $S_{n,r}(p)=T_{n,r}(p)/n^r=\mathbb{E}[(X/n-\mathbb{E}[X/n])^r]$.  $T$ and $S$ are notations of S.N. Bernstein, known for Bernstein polynomials.) The following results bound the absolute value of $T$ and $S$.[^24]

**Result B4** (Molteni (2022)[^25]): If $r$ is an even integer such that $0\le r\le 44$, then for every integer $n\ge 1$, $|T_{n,r}(p)|\le (r!)/(((r/2)!)8^{r/2}) n^{r/2}$ and $|S_{n,r}(p)| \le (r!)/(((r/2)!)8^{r/2})\cdot(1/n^{r/2})$.

**Result B4A** (Adell et al. (2015)[^26]):  For every odd integer $r\ge 1$, $T_{n,r}(p)$ is positive whenever $0\le p\le 1/2$, and negative whenever $1/2\le p\le 1$.

**Lemma B5**: For every integer $n\ge 1$:

- $|S_{n,0}(p)|=1=1\cdot(p(1-p)/n)^{0/2}$.
- $|S_{n,1}(p)|=0=0\cdot(p(1-p)/n)^{1/2}$.
- $|S_{n,2}(p)|=p(1-p)/n=1\cdot(p(1-p)/n)^{2/2}$.

The proof is straightforward.

**Result B6** (Adell and Cárdenas-Morales (2018)[^27]): Let $\sigma(r,t) = (r!)/(((r/2)!)t^{r/2})$.  If $r\ge 0$ is an even integer, then&mdash;

- for every integer $n\ge 1$, $|T_{n,r}(p)|\le \sigma(r,6)n^{r/2}$ and $|S_{n,r}(p)| \le \sigma(r,6)/n^{r/2}$, and
- for every integer $n\ge 1$, $|T_{n,r}(1/2)|\le \sigma(r,8)n^{r/2}$ and $|S_{n,r}(1/2)| \le \sigma(r,8)/n^{r/2}$.

**Lemma B9**: Let $f(\lambda)$ have a Lipschitz continuous $r$-th derivative on the closed unit interval (see "[**Definitions**](#Definitions)"), where $r\ge 0$ is an integer, and let $M$ be equal to or greater than the $r$-th derivative's Lipschitz constant.  Then, for every $0\le x_0 \le 1$:

1. $f$ can be written as $f(\lambda) = R_{f,r}(\lambda, x_0) + f(x_0) + \sum_{i=1}^{r} (\lambda-x_0)^i f^{(i)}(x_0)/(i!)$ where $f^{(i)}$ is the $i$-th derivative of $f$.
2. If $r$ is odd, $|B_n(R_{f,r}(\lambda, x_0))(x_0)| \le M/((((r+1)/2)!)(\beta n)^{(r+1)/2})$ for every integer $n\ge 1$, where $\beta$ is 8 if $r\le 43$ and 6 otherwise.
3. If $r=0$, $|B_n(R_{f,r}(\lambda, x_0))(x_0)| \le M/(2n^{1/2})$ for every integer $n\ge 1$.
4. If $r$ is even and greater than 0, $|B_n(R_{f,r}(\lambda, x_0))(x_0)| \le \frac{M}{(r+1)!n^{(r+1)/2}}\left(\frac{2\cdot(r+1)!(r)!}{\gamma^{r+1}((r/2)!)^2}\right)^{1/2}$ for every integer $n\ge 2$, where $\gamma$ is 8 if $r\le 42$ and 6 otherwise.

_Proof_: The well-known result of part 1 says $f$ equals the _Taylor polynomial_ of degree $r$ at $x_0$ plus the _Lagrange remainder_,  $R_{f,r}(\lambda, x_0)$. A result found in Gonska et al. (2006)[^28], which applies for any integer $r\ge 0$, bounds that Lagrange remainder [^29].  By that result, because $f$'s $r$-th derivative is Lipschitz continuous&mdash; $$|R_{f,r}(\lambda, x_0)|\le \frac{|\lambda-x_0|^r}{r!} M \frac{|\lambda-x_0|}{r+1}=M\frac{|\lambda-x_0|^{r+1}}{(r+1)!}.$$

The goal is now to bound the Bernstein polynomial of $|\lambda-x_0|^{r+1}$.  This is easiest to do if $r$ is odd.

If $r$ is odd, then $(\lambda-x_0)^{r+1} = |\lambda-x_0|^{r+1}$, so by Results B4 and B6, the Bernstein polynomial of $|\lambda-x_0|^{r+1}$ can be bounded as follows: $$|B_n((\lambda-x_0)^{r+1})(x_0)| \le \frac{(r+1)!}{(((r+1)/2)!)\beta^{(r+1)/2}}\frac{1}{n^{(r+1)/2}} = \sigma(r,n),$$ where $\beta$ is 8 if $r\le 43$ and 6 otherwise.  Therefore&mdash; $$|B_n(R_{f,r}(\lambda, x_0))(x_0)| \le \frac{M}{(r+1)!} |B_n((\lambda-x_0)^{r+1})(x_0)|$$ $$\le \frac{M}{(r+1)!}\frac{(r+1)!}{(((r+1)/2)!)\beta^{(r+1)/2}}\frac{1}{n^{(r+1)/2}} = \frac{M}{(((r+1)/2)!)(\beta n)^{(r+1)/2}}.$$

If $r$ is 0, then the Bernstein polynomial of $|\lambda-x_0|^{1}$ is bounded by $\sqrt{x_0(1-x_0)/n}$ for every integer $n\ge 1$ (Cheng 1983)[^30], so&mdash; $$|B_n(R_{f,r}(\lambda, x_0))(x_0)| \le \frac{M}{(r+1)!}\sqrt{x_0(1-x_0)/n}\le \frac{M}{(r+1)!}\frac{1}{2n^{1/2}}=\frac{M}{2n^{1/2}}.$$

If $r$ is even and greater than 0, the Bernstein polynomial for $|\lambda-x_0|^{r+1}$ can be bounded as follows for every $n\ge 2$, using [**Schwarz's inequality**](https://mathworld.wolfram.com/SchwarzsInequality.html) (see also Bojanic and Shisha [1975][^31] for the case $r=4$): $$B_n(|\lambda-x_0|^{r+1})(x_0)=B_n((|\lambda-x_0|^{r/2}|\lambda-x_0|^{(r+2)/2})^2)(x_0)$$ $$\le\sqrt{|S_{n,r}(x_0)|}\sqrt{|S_{n,r+2}(x_0)|}\le\sqrt{\sigma(r,n)}\sqrt{\sigma(r+2,n)}$$ $$\le\frac{1}{n^{(r+1)/2}}\left(\frac{2\cdot(r+1)!(r)!}{\gamma^{r+1}((r/2)!)^2}\right)^{1/2},$$where $\gamma$ is 8 if $r\le 42$ and 6 otherwise. Therefore&mdash; $$|B_n(R_{f,r}(\lambda, x_0))(x_0)| \le \frac{M}{(r+1)!\cdot n^{(r+1)/2}}\left(\frac{2\cdot(r+1)!(r)!}{\gamma^{r+1}((r/2)!)^2}\right)^{1/2}. $$&#x25a1;

> **Notes:**
>
> 1. If a function $f(\lambda)$ has a continuous $r$-th derivative on its domain (where $r\ge 0$ is an integer), then by Taylor's theorem for real variables, $R_{f,r}(\lambda, x_0)$, is writable as $f^{(r)}(c)\cdot (\lambda-x_0)^r /(r!),$ for some $c$ between $\lambda$ and $x_0$ (and thus on $f$'s domain) (DLMF [^32] [**equation 1.4.36**](https://dlmf.nist.gov/1.4.E36)).  Thus, by this estimate, $|R_{f,r}(\lambda, x_0)| \le \frac{M}{r!} (\lambda-x_0)^r.$
> 2. It would be interesting to strengthen this lemma, at least for $r\le 10$, with a bound of the form $MC\cdot\max(1/n, (x_0(1-x_0)/n)^{1/2})^{r+1}$, where $C$ is an explicitly given constant depending on $r$, which is possible because the Bernstein polynomial of $|\lambda-x_0|^{r+1}$ can be bounded in this way (Lorentz 1966)[^9].

**Corollary B9A**: Let $f(\lambda)$ have a Lipschitz continuous $r$-th derivative on the closed unit interval, and let $M$ be that $r$-th derivative's Lipschitz constant or greater.  Then, for every $0\le x_0 \le 1$:

| If $r$ is: | Then $\text{abs}(B_n(R_{f,r}(\lambda, x_0))(x_0)) \le$ ... |
 --- | --- |
| 0. | $M/(2 n^{1/2})$ for every integer $n\ge 1$. |
| 0. | $M\cdot\sqrt{x_0(1-x_0)/n}$ for every integer $n\ge 1$. |
| 1. | $M/(8 n)$ for every integer $n\ge 1$. |
| 2. | $\sqrt{3}M/(48 n^{3/2}) < 0.03609 M/n^{3/2}$ for every integer $n\ge 2$. |
| 3. | $M/(128 n^2)$ for every integer $n\ge 1$. |
| 4. | $\sqrt{5}M/(1280 n^{5/2}) < 0.001747 M/n^{5/2}$ for every integer $n\ge 2$. |
| 5. | $M/(3072 n^3)$ for every integer $n\ge 1$. |

**Proposition B10**: Let $f(\lambda)$ have a Lipschitz continuous third derivative on the closed unit interval.  For each $n\ge 4$ that is divisible by 4, let $L_{3,n/4}(f) = (1/3)\cdot B_{n/4}(f) - 2\cdot B_{n/2}(f) + (8/3)\cdot B_{n}(f)$.  Then $L_{3,n/4}(f)$ is within $M/(8 n^2)$ of $f$, where $M$ is the maximum of the absolute value of that fourth derivative.

_Proof_: This proof is inspired by the proof technique in Tachev (2022)[^5].

Because $f$ has a Lipschitz continuous third derivative, $f$ has the Lagrange remainder $R_{f,3}(\lambda, x_0)$ given in Lemma B9 and Corollary B9A.

It is known that $L_{3,n/4}$ is a linear operator that preserves polynomials of degree 3 or less, so that $L_{3,n/4}(f) = f$ whenever $f$ is a polynomial of degree 3 or less (Ditzian and Totik 1987)[^33], Butzer (1955)[^6], May (1976)[^34].  Because of this, it can be assumed without loss of generality that $f(x_0)=0$.

Therefore&mdash;$$|L_{3,n/4}(f(\lambda))(x_0) - f(x_0)| = |L_{3,n/4}(R_{f,3}(\lambda, x_0))|.$$ Now denote $\sigma_n$ as the maximum of $|B_n(R_{f,3}(\lambda, x_0))(x_0)|$ over $0\le x_0\le 1$.  In turn (using Corollary B9A)&mdash; $$|L_{3,n/4}(R_{f,3}(\lambda, x_0))| \le(1/3)\cdot\sigma_{n/4} + 2\cdot\sigma_{n/2}+(8/3)\cdot\sigma_n$$ $$\le (1/3)\frac{M}{128 (n/4)^2} + 2\frac{M}{128 (n/2)^2} + (8/3)\frac{M}{128 n^2} =M/(8 n^2).$$ &#x25a1;

**Proposition B10A:** Let $f(\lambda)$ have a Lipschitz continuous second derivative on the closed unit interval.  Let $Q_{n,2}(f)=B_n(f)(x)-\frac{x(1-x)}{2n} B_n(f'')(x)$ be the _Lorentz operator_ of order 2 (Holtz et al. 2011\)[^7], (Lorentz 1966)[^9], which is a polynomial in Bernstein form of degree $n+2$.  Then if $n\ge 2$ is an integer, $Q_{n,2}(f)$ is within $\frac{M(\sqrt{3}+3)}{48 n^{3/2}} \lt 0.098585 M/(n^{3/2})$ of $f$, where $M$ is that second derivative's Lipschitz constant or greater.

_Proof_: Since $Q_{n,2}(f)$ preserves polynomials of degree 2 or less (Holtz et al. 2011, Lemma 14\)[^7] and since $f$ has a Lipschitz continuous second derivative, $f$ has the Lagrange remainder $R_{f,2}(\lambda, x_0)$ given in Lemma B9, and $f''$, the second derivative of $f$, has the Lagrange remainder $R_{f'',0}(\lambda, x_0)$.  Thus, using Corollary B9A, the error bound can be written as&mdash; $$|Q_{n,2}(f(\lambda))(x_0) - f(x_0)|\le|B_n(R_{f,2}(\lambda, x_0))| + \frac{x_0(1-x_0)}{2n} |B_n(R_{f'',0}(\lambda,x_0))|$$ $$\le \frac{\sqrt{3}M}{48 n^{3/2}} + \frac{1}{8n} \frac{M}{2 n^{1/2}} = \frac{M(\sqrt{3}+3)}{48 n^{3/2}} \lt 0.098585 M/(n^{3/2}).$$ &#x25a1;

**Corollary B10B:** Let $f(\lambda)$ have a continuous second derivative on the closed unit interval.  Then $B_n(f)$ is within $\frac{M}{8n}$ of $f$, where $M$ is the maximum of that second derivative's absolute value or greater.

_Proof_: Follows from Lorentz (1963)[^10] and the well-known fact that $M$ is an upper bound of $f$'s first derivative's (minimal) Lipschitz constant. &#x25a1;

In the following propositions, $f^{(r)}$ means the $r$-th derivative of the function $f$ and $\max(|f|)$ means the maximum of the absolute value of the function $f$.

**Proposition B10C:** Let $f(\lambda)$ have a Hölder continuous second derivative on the closed unit interval, with Hölder exponent $\alpha$ ($0\lt\alpha\le 1$) and Hölder constant $L$ or less.  Let $U_{n,2}(f)=B_n(2f-B_n(f))$ be $f$'s iterated Boolean sum of order 2 of Bernstein polynomials.  Then if $n\ge 3$ is an integer, the error in approximating $f$ with $U_{n,2}(f)$ is as follows: $$|f-U_{n,2}(f)|\le \frac{M_2}{8 n^{2}} + 5 L/(32 n^{1+\alpha/2}) \le ((5L+4M_2)/32)/n^{1+\alpha/2},$$ where $M_2$ is the maximum of that second derivative's absolute value or greater.

_Proof_: This proof is inspired by a result in Draganov (2004, Theorem 4.1)[^35].

The error to be bounded can be expressed as $|(B_n(f)-f)( B_n(f)-f )|$.  Following Corollary B10B: $$|(B_n(f)-f)( B_n(f)-f )|\le \frac{1}{8n} \max(|(B_n(f))^{(2)}-f^{(2)}|).\tag{B10C-1}$$ It thus remains to estimate the right-hand side of the bound.  A result by Knoop and Pottinger (1976)[^36], which works for every $n\ge 3$, is what is known as a _simultaneous approximation_ error bound, showing that the second derivative of the Bernstein polynomial approaches that of $f$ as $n$ increases.  Using this result: $$|(B_n(f))^{(2)}-f^{(2)}| \le \frac{1}{n} M_2+(5/4) L/n^{\alpha/2},$$ so&mdash; $$|(B_n(f)-f)( B_n(f)-f )|\le \frac{1}{8n} \left(\frac{1}{n} M_2+(5/4) L/n^{\alpha/2}\right)$$ $$\le \frac{M_2}{8 n^{2}} + \frac{5L}{32 n^{1+\alpha/2}}\le \frac{5L+4M_2}{32}\frac{1}{n^{1+\alpha/2}}.$$ &#x25a1;

> **Note**: The error bound $0.75 M_2/n^2$ for $U_{n,2}$ is false in general if $f(\lambda)$ is assumed only to be non-negative, concave, and have a continuous second derivative on the closed unit interval.  A counterexample is $f(\lambda)=(1-(1-2\lambda)^{2.5})/2$ if $\lambda <1/2$ and $(1-(2\lambda-1)^{2.5})/2$ otherwise.

**Proposition B10D:** Let $f(\lambda)$ have a Hölder continuous third derivative on the closed unit interval, with Hölder exponent $\alpha$ ($0\lt\alpha\le 1$) and Hölder constant $L$ or less.  If $n\ge 6$ is an integer, the error in approximating $f$ with $U_{n,2}(f)$ is as follows: $$|f-U_{n,2}(f)|\le \frac{\max(|f^{(2)}|)+\max(|f^{(3)}|)}{8n^2}+9L/(64 n^{(3+\alpha)/2})$$ $$\le \frac{9L+8\max(|f^{(2)}|)+8\max(|f^{(3)}|)}{64n^{(3+\alpha)/2}}.$$

_Proof_: Again, the goal is to estimate the right-hand side of (B10C-1).  But this time, a different simultaneous approximation bound is employed, namely a result from Kacsó (2002)[^37], which in this case works if $n\ge\max(r+2,(r+1)r)=6$, where $r=2$. By that result: $$|(B_n(f))^{(2)}-f^{(2)}| \le \frac{r(r-1)}{2n} M_2+\frac{r M_3}{2n}+\frac{9}{8}\omega_2(f^{(2)},1/n^{1/2})$$ $$\le \frac{1}{n} M_2+M_3/n+\frac{9}{8} L/n^{(1+\alpha)/2},$$ where $r=2$, $M_2 = \max(|f^{(2)}|)$, and $M_3=\max(|f^{(3)}|)$, using properties of $\omega_2$, the second-order modulus of continuity of $f^{(2)}$, given in Stancu et al. (2001)[^38].  Therefore&mdash; $$|(B_n(f)-f)( B_n(f)-f )|\le \frac{1}{8n} \left(\frac{1}{n} M_2+M_3/n+\frac{9}{8} L/n^{(1+\alpha)/2}\right)$$ $$\le \frac{M_2+M_3}{8n^2} + \frac{9L}{64 n^{(3+\alpha)/2}}\le \frac{9L+8M_2+8M_3}{64n^{(3+\alpha)/2}}.$$ &#x25a1;

In a similar way, it's possible to prove an error bound for $U_{n,3}$ that applies to functions with a Hölder continuous fourth or fifth derivative, by expressing the error bound as $|(B_n(f)-f)((B_n(f)-f)(B_n(f)-f))|$ and replacing the values for $M_2$, $M_3$, and $L$ in the bound proved at the end of Proposition B10D with upper bounds for $|(B_n(f))^{(2)}-f^{(2)}|$, $|(B_n(f))^{(3)}-f^{(3)}|$, and $|(B_n(f))^{(4)}-f^{(4)}|$, respectively.

<a id=Chebyshev_Interpolants></a>
### Chebyshev Interpolants

The following is a method that employs _Chebyshev interpolants_ to compute the Bernstein coefficients of a polynomial that comes within $\epsilon$ of $f(\lambda)$, as long as $f$ meets certain conditions.  Because the method introduces a trigonometric function (the cosine function), it appears here in the appendix and it runs too slowly for real-time or "online" use; rather, this method is more suitable for pregenerating ("offline") the approximate version of a function known in advance.

- $f$ must be continuous on the interval $[a, b]$ and must have an $r$-th derivative of _bounded variation_, as described later.
- Suppose $f$'s domain is the interval $[a, b]$.  Then the _Chebyshev interpolant_ of degree $n$ of $f$ (Wang 2023)[^39], (Trefethen 2013)[^40] is&mdash; $$p(\lambda)=\sum_{k=0}^n c_k T_k(2\frac{\lambda-a}{b-a}-1),$$ where&mdash;

    - $c_k=\sigma(k,n)\frac{2}{n}\sum_{j=0}^n \sigma(j,n) f(\gamma(j,n))T_k(\cos(j\pi/n))$,
    - $\gamma(j,n) = a+(b-a)(\cos(j\pi/n)+1)/2$,
    - $\sigma(k,n)$ is 1/2 if $k$ is 0 or $n$, and 1 otherwise, and
    - $T_k(x)$ is the $k$-th [**Chebyshev polynomial of the first kind**](https://mathworld.wolfram.com/ChebyshevPolynomialoftheFirstKind.html) (`chebyshevt(k,x)` in the SymPy computer algebra library).
- Let $r\ge 1$ and $n\gt r$ be integers. If $f$ is continuous on the interval $[a, b]$ and $f$ has an $r$-th derivative of _bounded variation_, then the degree-$n$ Chebyshev interpolant of $f$ is within $\left(\frac{(b-a)}{2}\right)^r\frac{4V}{\pi r(n-r)^r}$ of $f$, where $V$ is the $r$-th derivative's _total variation_ or greater.  This relies on a theorem in chapter 7 of Trefethen (2013)[^40] as well as a statement in note 1 at the end of this section.
    - If the $r$-th derivative is nowhere decreasing or nowhere increasing on the interval $[a, b]$, then $V$ can equal abs($f(b)-f(a)$).
    - If the $r$-th derivative is Lipschitz continuous with Lipschitz constant $M$ or less, then $V$ can equal $M\cdot(b-a)$ (Kannan and Kreuger 1996)[^41].
    - The required degree is thus $n=\text{ceil}(r+\frac{(b-a)}{2}(4V/(\pi r\epsilon))^{1/r})$ &le; $\text{ceil}(r+\frac{(b-a)}{2}(1.2733 V/(r\epsilon))^{1/r})$, where $\epsilon>0$ is the desired error tolerance.
- If $f$ is real analytic on $[a, b]$, a better error bound is possible, but describing it requires ideas from complex analysis that are too advanced for this article.  See chapter 8 of Trefethen (2013)[^40].

-------------

1. Compute the required degree $n$ as given above, with error tolerance $\epsilon/2$.
2. Compute the ($n$ plus one) coefficients of $f$'s degree-$n$ Chebyshev interpolant, call them $c_0, ..., c_n$.
3. Compute the (_n_+1)&times;(_n_+1) matrix $M$ described in Theorem 1 of Rababah (2003)[^42].
4. Multiply the matrix by the transposed coefficients $(c_0, ..., c_n)$ to get the polynomial's Bernstein coefficients $b_0, ..., b_n$.  (Transposing means turning columns to rows and vice versa.)
5. For each $i$, replace the Bernstein coefficient $b_i$ with $\text{floor}(b_i / (\epsilon/2) + 1/2) \cdot (\epsilon/2)$.
6. Return the Bernstein coefficients $b_0, ..., b_n$.

> **Notes:**
>
> 1. The following statement can be shown.  Let $f(x)$ be continuous on the interval $[a, b]$.  If the $r$-th derivative of $f$, call it $FR$, has total variation $V$, where $r\ge 1$, then $g(x) = FR(a+(b-a) (x+1)/2)$ has total variation $V\left(\frac{b-a}{2}\right)^r$ on the interval $[-1, 1]$.
> 2. The method in this section doesn't require $f(\lambda)$ to have a particular minimum or maximum.  If $f$ must map the closed unit interval to itself and the Bernstein coefficients must lie on that interval, the following changes to the method are needed:
>     - $f(\lambda)$ must be continuous on the closed unit interval ($a=0$, $b=1$) and take on only values in that interval.
>     - If any Bernstein coefficient returned by the method is less than 0 or greater than 1, double the value of $n$ and repeat the method starting at step 2 until that condition is no longer true.
> 3. It would be of interest to build Chebyshev-like interpolants that sample $f(\lambda)$ at _rational_ values of $\lambda$ that get closer to the Chebyshev points (e.g., $\cos(j\pi/n)$) with increasing $n$, and to find results that provide explicit bounds (with no hidden constants) on the approximation error that are close to those for Chebyshev interpolants.

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
