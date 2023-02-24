# Supplemental Notes for Bernoulli Factory Algorithms

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Contents></a>
## Contents

- [**Contents**](#Contents)
- [**About This Document**](#About_This_Document)
- [**Definitions**](#Definitions)
- [**General Factory Functions**](#General_Factory_Functions)
    - [**Building the Lower and Upper Polynomials**](#Building_the_Lower_and_Upper_Polynomials)
- [**Approximate Bernoulli Factories**](#Approximate_Bernoulli_Factories)
    - [**Approximate Bernoulli Factories for Certain Functions**](#Approximate_Bernoulli_Factories_for_Certain_Functions)
    - [**Approximate Bernoulli Factories for Power Series**](#Approximate_Bernoulli_Factories_for_Power_Series)
    - [**Approximate Bernoulli Factories for Linear Functions**](#Approximate_Bernoulli_Factories_for_Linear_Functions)
- [**Achievable Simulation Rates**](#Achievable_Simulation_Rates)
- [**Complexity**](#Complexity)
- [**Examples of Bernoulli Factory Polynomial-Building Schemes**](#Examples_of_Bernoulli_Factory_Polynomial_Building_Schemes)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Proofs on Cutting Off a Power Series**](#Proofs_on_Cutting_Off_a_Power_Series)
    - [**Results Used in Approximate Bernoulli Factories**](#Results_Used_in_Approximate_Bernoulli_Factories)
    - [**Failures of the Consistency Requirement**](#Failures_of_the_Consistency_Requirement)
    - [**Which functions admit a Bernoulli factory?**](#Which_functions_admit_a_Bernoulli_factory)
    - [**Which functions don't require outside randomness to simulate?**](#Which_functions_don_t_require_outside_randomness_to_simulate)
    - [**Multiple-Output Bernoulli Factory**](#Multiple_Output_Bernoulli_Factory)
    - [**Proofs for Polynomial-Building Schemes**](#Proofs_for_Polynomial_Building_Schemes)
        - [**A Conjecture on Polynomial Approximation**](#A_Conjecture_on_Polynomial_Approximation)
    - [**Example of Polynomial-Building Scheme**](#Example_of_Polynomial_Building_Scheme)
- [**License**](#License)

<a id=About_This_Document></a>
## About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/bernsupp.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/bernsupp.md)**.  You can send comments on this document on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues)**.  See** "[**Open Questions on the Bernoulli Factory Problem**](https://peteroupc.github.io/bernreq.html)" **for a list of things about this document that I seek answers to.**

My audience for this article is **computer programmers with mathematics knowledge, but little or no familiarity with calculus**.  It should be read in conjunction with the article "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)".

I encourage readers to implement any of the algorithms given in this page, and report their implementation experiences.  In particular, [**I seek comments on the following aspects**](https://github.com/peteroupc/peteroupc.github.io/issues/18):

- Are the algorithms in this article (in conjunction with "Bernoulli Factory Algorithms") easy to implement? Is each algorithm written so that someone could write code for that algorithm after reading the article?
- Does this article have errors that should be corrected?
- Are there ways to make this article more useful to the target audience?

Comments on other aspects of this document are welcome.

<a id=Definitions></a>
## Definitions

This section describes certain math terms used on this page for programmers to understand.

The _closed unit interval_ (written as \[0, 1\]) means the set consisting of 0, 1, and every real number in between.

The following terms can describe a function $f(x)$, specifically how "well-behaved" $f$ is &mdash; which can be important when designing Bernoulli factory algorithms.  This page mostly cares how $f$ behaves when its domain is the closed unit interval, that is, when $0 \le x \le 1$.

- If $f$ is continuous, its _derivative_ is, roughly speaking, its "slope" or "velocity" or "instantaneous-rate-of-change" function.  The derivative (or _first derivative_) is denoted as $f'$.  The _second derivative_ ("slope-of-slope") of $f$, denoted $f''$, is the derivative of $f'$; the _third derivative_ is the derivative of $f''$; and so on.
- A [**_Hölder continuous_**](https://en.wikipedia.org/wiki/Hölder_condition) function  (with _M_ being the _Hölder constant_ and _&alpha;_ being the _Hölder exponent_) is a continuous function _f_ such that _f_(_x_) and _f_(_y_) are no more than _M_\*_&delta;_<sup>_&alpha;_</sup> apart whenever _x_ and _y_ are in the function's domain and no more than _&delta;_ apart.<br>Roughly speaking, the function's "steepness" is no greater than that of _M_\*_x_<sup>_&alpha;_</sup>.
- A _Lipschitz continuous_ function with constant _L_ (the _Lipschitz constant_) is Hölder continuous with Hölder exponent 1 and Hölder constant _L_.<br>Roughly speaking, the function's "steepness" is no greater than that of _L_\*_x_.<br>If the function has a derivative on its domain, _L_ can be the maximum absolute value of that derivative.
- A _convex_ function $f$ has the property that $f((x+y)/2) \le (f(x)+f(y))/2$ whenever $x$, $y$, and $(x+y)/2$ are in the function's domain.<br>Roughly speaking, if the function's "slope" never goes down, then it's convex.
- A _concave_ function $f$ has the property that $f((x+y)/2) \ge (f(x)+f(y))/2$ whenever $x$, $y$, and $(x+y)/2$ are in the function's domain.<br>Roughly speaking, if the function's "slope" never goes up, then it's concave.

<a id=General_Factory_Functions></a>
## General Factory Functions

As a reminder, the _Bernoulli factory problem_ is: We're given a coin that shows heads with an unknown probability, _&lambda;_, and the goal is to use that coin (and possibly also a fair coin) to build a "new" coin that shows heads with a probability that depends on _&lambda;_, call it _f_(_&lambda;_).

The algorithm for [**general factory functions**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions), described in my main article on Bernoulli factory algorithms, works by building randomized upper and lower bounds for a function _f_(_&lambda;_), based on flips of the input coin.  Roughly speaking, the algorithm works as follows:

1. Generate a random variate, _U_, uniformly distributed, greater than 0 and less than 1.
2. Flip the input coin, then build an upper and lower bound for _f_(_&lambda;_), based on the outcomes of the flips so far.
3. If _U_ is less than or equal to the lower bound, return 1. If _U_ is greater than the upper bound, return 0.  Otherwise, go to step 2.

These randomized upper and lower bounds come from two sequences of polynomials as follows:

1. One sequence approaches the function _f_(_&lambda;_) from above, the other from below, and both sequences must converge to _f_.
2. For each sequence, the first polynomial has degree 1 (so is a linear function), and each other polynomial's degree is 1 higher than the previous.
3. The _consistency requirement_ must be met: The difference&mdash;
    - between the degree-(_n_&minus;1) upper polynomial and the degree-_n_ upper polynomial, and
    - between the degree-_n_ lower polynomial and the degree-(_n_&minus;1) lower polynomial,

    must have nonnegative coefficients, once the polynomials are rewritten in Bernstein form and elevated to degree _n_.

The consistency requirement ensures that the upper polynomials "decrease" and the lower polynomials "increase".  Unfortunately, the reverse is not true in general; even if the upper polynomials "decrease" and the lower polynomials "increase" to _f_, this does not ensure the consistency requirement by itself.  Examples of this fact are shown in the section "[**Failures of the Consistency Requirement**](#Failures_of_the_Consistency_Requirement)" in the appendix.

In this document, **fbelow**(_n_, _k_) and **fabove**(_n_, _k_) mean the _k_<sup>th</sup> coefficient for the lower or upper degree-_n_ polynomial in Bernstein form, respectively, where 0 &le; _k_ &le; _n_ is an integer.

<a id=Building_the_Lower_and_Upper_Polynomials></a>
### Building the Lower and Upper Polynomials

A _factory function_ _f_(_&lambda;_) is a function for which the Bernoulli factory problem can be solved (see "[**About Bernoulli Factories**](https://peteroupc.github.io/bernoulli.html#About_Bernoulli_Factories)"). The following are ways to build sequences of polynomials that appropriately converge to a factory function if that function meets certain conditions.  It would be helpful to plot that factory function using a computer algebra system to see if it belongs to any of the classes of functions described below.

**Concave functions.** If _f_ is concave, then **fbelow**(_n_, _k_) can equal _f_(_k_/_n_), thanks to Jensen's inequality. One example is _f_(_&lambda;_) = 1&minus; _&lambda;_<sup>2</sup>.

**Convex functions.** If _f_ is convex, then **fabove**(_n_, _k_) can equal _f_(_k_/_n_), thanks to Jensen's inequality.  One example is _f_(_&lambda;_) = exp(&minus;_&lambda;_/4).

**Hölder and Lipschitz continuous functions.** I have found a way to extend the results of Nacu and Peres (2005\)[^1] to certain functions with a slope that tends to a vertical slope.  The following scheme, proved in the appendix, implements **fabove** and **fbelow** if _f_(_&lambda;_)&mdash;

- is [**_Hölder continuous_**](https://en.wikipedia.org/wiki/Hölder_condition) on the closed unit interval, with Hölder constant _m_ and Hölder exponent _&alpha;_ (see "[**Definitions**](#Definitions)"), and
- in the closed unit interval&mdash;
    - has a minimum of greater than 0 and a maximum of less than 1, or
    - is convex and has a minimum of greater than 0, or
    - is concave and has a maximum of less than 1.

Finding _m_ and _&alpha;_ is non-trivial in general.  But assuming _m_ and _&alpha;_ are known, then for every integer _n_ that's a power of 2:

- _D_(_n_) = _m_\*(2/7)<sup>_&alpha;_/2</sup>/((2<sup>_&alpha;_/2</sup>&minus;1)\*_n_<sup>_&alpha;_/2</sup>).
- **fbelow**(_n_, _k_) = _f_(_k_/_n_) if _f_ is concave; otherwise, min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if _n_ < 4; otherwise, _f_(_k_/_n_) &minus; _D_(_n_).
- **fabove**(_n_, _k_) = _f_(_k_/_n_) if _f_ is convex; otherwise, max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if _n_ < 4; otherwise, _f_(_k_/_n_) + _D_(_n_).

> **Note:**
>
> 1. Some factory functions are not Hölder continuous for any Hölder exponent greater than 0.  These functions have a slope that's steeper than every "nth" root, and can't be handled by this method.  One example is _f_(_&lambda;_) = 1/10 if _&lambda;_ is 0 and &minus;1/(2\*ln(_&lambda;_/2)) + 1/10 otherwise, which has a slope near 0 that's steeper than every "nth" root.
> 2. If the factory function has a Hölder exponent of 1 (and so is Lipschitz continuous), _D_(_n_) can be _m_\*322613/(250000\*sqrt(_n_)), which is an upper bound.
> 3. If the factory function's Hölder exponent is 1/2 or greater, _D_(_n_) can be _m_\*154563/(40000\*_n_<sup>1/4</sup>), which is an upper bound.

**Functions with a Lipschitz continuous derivative.** The following method, proved in the appendix, implements **fabove** and **fbelow** if _f_(_&lambda;_)&mdash;

- has a Lipschitz continuous derivative (see "[**Definitions**](#Definitions)"), and
- in the closed unit interval&mdash;
    - has a minimum of greater than 0 and a maximum of less than 1, or
    - is convex and has a minimum of greater than 0, or
    - is concave and has a maximum of less than 1.

Let _m_ be the Lipschitz constant of _f_'s derivative, or a greater number than that constant (if _f_ has a second derivative on its domain, then _m_ can be the maximum absolute value of that second derivative).  Then for every integer _n_ that's a power of 2:

- **fbelow**(_n_, _k_) = _f_(_k_/_n_) if _f_ is concave; otherwise, min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if _n_ < 4; otherwise,  _f_(_k_/_n_) &minus; _m_/(7\*_n_).
- **fabove**(_n_, _k_) = _f_(_k_/_n_) if _f_ is convex; otherwise, max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if _n_ < 4; otherwise, _f_(_k_/_n_) + _m_/(7\*_n_).

My [**GitHub repository**](https://github.com/peteroupc/peteroupc.github.io/blob/master/approxscheme.py) includes SymPy code for a method, `c2params`, to calculate the necessary values for _m_ and the bounds of these polynomials, given a factory function.

> **Examples:**
>
> 1. Take _f_(_&lambda;_) = exp(&minus;_&lambda;_).  This is a convex function, and its derivative is Lipschitz continuous with Lipschitz constant 1.  Then it can be shown that the following scheme for _f_ is valid (the value 3321/10000 is slightly less than _M_ &minus; 1/(7\*4), where _M_ is the minimum of _f_ on its domain):
>
>     * **fbelow**(_n_, _k_) = 3321/10000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 1/(7\*n). (Observe that _f_(_k_/4) &minus; 1/(7\*4) &ge; 3321/10000.)
>     * **fabove**(_n_, _k_) = _f_(_k_/_n_) (because _f_ is convex).
>
> 2. Take _f_(_&lambda;_) = _&lambda;_/2 if _&lambda;_ &le; 1/2; (4\*_&lambda;_ &minus; 1)/(8\*_&lambda;_) otherwise.  This function is concave, and its derivative is Lipschitz continuous with Lipschitz constant 2.  Then it can be shown that the following scheme for _f_ is valid (the value 893/2000 is slightly greater than _M_ + 2/(7\*4), where _M_ is the maximum of _f_ on its domain):
>
>     * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
>     * **fabove**(_n_, _k_) = 893/2000 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 2/(7\*_n_).

**Certain functions that equal 0 at 0.** This approach involves transforming the function _f_ so that it no longer equals 0 at the point 0.  This can be done by dividing _f_ by a function (`High`(_&lambda;_)) that "dominates" _f_ everywhere on the closed unit interval.  Unlike for the original function, there might be a polynomial-building scheme described earlier in this section for the transformed function.

More specifically, `High`(_&lambda;_) must meet the following requirements:

- `High`(_&lambda;_) is continuous on the closed unit interval.
- `High`(0) = 0. (This is required to ensure correctness in case _&lambda;_ is 0.)
- 1 &ge; `High`(1) &ge; _f_(1) &ge; 0.
- 1 &gt; `High`(_&lambda;_) &gt; _f_(_&lambda;_) &gt; 0 whenever 0 < _&lambda;_ < 1.
- If _f_(1) = 0, then `High`(1) = 0. (This is required to ensure correctness in case _&lambda;_ is 1.)

Also, `High` should be a function with a simple Bernoulli factory algorithm.  For example, `High` can be a polynomial in Bernstein form of degree _n_ whose _n_ plus one coefficients are \[0, 1, 1, ..., 1\].  This polynomial is easy to simulate using the algorithms from the section "[**Certain Polynomials**](https://peteroupc.github.io/bernoulli.html#Certain_Polynomials)".[^2]

The algorithm is now described.

Let _g_(_&lambda;_) = lim<sub>_&nu;_&rarr;_&lambda;_</sub> _f_(_&nu;_)/`High`(_&nu;_) (roughly speaking, the value that _f_(_&nu;_)/`High`(_&nu;_) approaches as _&nu;_ approaches _&lambda;_.) If&mdash;

- _f_(0) = 0 and _f_(1) < 1, and
- _g_(_&lambda;_) is continuous on the closed unit interval and belongs in one of the classes of functions given earlier,

then _f_ can be simulated using the following algorithm:

1. Run a Bernoulli factory algorithm for `High`.  If the call returns 0, return 0. (For example, if `High`(_&lambda;_) = _&lambda;_, then this step amounts to the following: "Flip the input coin.  If it returns 0, return 0.")
2. Run a Bernoulli factory algorithm for _g_(.) and return the result of that algorithm.  This can be one of the [**general factory function algorithms**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions) if there is a way to calculate polynomials that converge to _g_(.) in a manner needed for that algorithm (for example, if _g_ is described earlier in this section).

> **Notes:**
>
> 1. It may happen that _g_(0) = 0.  In this case, step 2 of this algorithm can involve running this algorithm again, but with new _g_ and `High` functions that are found based on the current _g_ function.  See the second example below.
> 2. `High`(_&lambda;_) can also equal 1 instead of be described in this section.  That leads to the original Bernoulli factory algorithm for _f_(_&lambda;_).
>
> **Examples:**
>
> 1. If _f_(_&lambda;_) = (sinh(_&lambda;_)+cosh(_&lambda;_)&minus;1)/4, then _f_ is less than or equal to `High`(_&lambda;_) = _&lambda;_, so _g_(_&lambda;_) is 1/4 if _&lambda;_ = 0, and (exp(_&lambda;_) &minus; 1)/(4\*_&lambda;_) otherwise.  The following code in Python that uses the SymPy computer algebra library computes this example: `fx = (sinh(x)+cosh(x)-1)/4; h = x; pprint(Piecewise((limit(fx/h,x,0), Eq(x,0)), ((fx/h).simplify(), True)))`.
> 2. If _f_(_&lambda;_) = cosh(_&lambda;_) &minus; 1, then _f_ is less than or equal to `High`(_&lambda;_) = _&lambda;_, so _g_(_&lambda;_) is 0 if _&lambda;_ = 0, and (cosh(_&lambda;_)&minus;1)/_&lambda;_ otherwise.  Now, since _g_(0) = 0, find new functions _g_ and `High` based on the current _g_.  The current _g_ is less than or equal to `High`(_&lambda;_) = _&lambda;_\*3\*(2&minus;_&lambda;_)/5 (a degree-2 polynomial that in Bernstein form has coefficients [0, 6/10, 6/10]), so _G_(_&lambda;_) = 5/12 if _&lambda;_ = 0, and &minus;(5\*cosh(_&lambda;_) &minus; 5)/(3\*_&lambda;_<sup>2</sup>\*(_&lambda;_&minus;2)) otherwise. _G_ is bounded away from 0 and 1, resulting in the following algorithm:
>
>     1. (Simulate `High`.) Flip the input coin.  If it returns 0, return 0.
>     2. (Simulate `High`.) Flip the input coin twice.  If both flips return 0, return 0.  Otherwise, with probability 4/10 (that is, 1 minus 6/10), return 0.
>     3. Run a Bernoulli factory algorithm for _G_ (which might involve building polynomials that converge to _G_, noticing that _G_'s derivative is Lipschitz continuous) and return the result of that algorithm.

**Certain functions that equal 0 at 0 and 1 at 1.**  Let _f_, _g_, and `High` be functions as defined earlier, except that _f_(0) = 0 and _f_(1) = 1.  Define the following additional functions:

- `Low`(_&lambda;_) is a function that meets the following requirements:
    - `Low`(_&lambda;_) is continuous on the closed unit interval.
    - `Low`(0) = 0 and `Low`(1) = 1.
    - 1 &gt; _f_(_&lambda;_) &gt; `Low`(_&lambda;_) &gt; 0 whenever 0 < _&lambda;_ < 1.
- _q_(_&lambda;_) = lim<sub>_&nu;_&rarr;_&lambda;_</sub> `Low`(_&nu;_)/`High`(_&nu;_).
- _r_(_&lambda;_) = lim<sub>_&nu;_&rarr;_&lambda;_</sub> (1&minus;_g_(_&nu;_))/(1&minus;_q_(_&nu;_)).

Roughly speaking, `Low` is a function that bounds _f_ from below, just as `High` bounds _f_ from above. `Low` should be a function with a simple Bernoulli factory algorithm, such as a polynomial in Bernstein form.  If both `Low` and `High` are polynomials of the same degree, _q_ will be a ratio of polynomials with a relatively simple Bernoulli factory algorithm (see "[**Certain Rational Functions**](https://peteroupc.github.io/bernoulli.html#Certain_Rational_Functions)").

Now, if _r_(_&lambda;_) is continuous on the closed unit interval, then _f_ can be simulated using the following algorithm:

1. Run a Bernoulli factory algorithm for `High`.  If the call returns 0, return 0. (For example, if `High`(_&lambda;_) = _&lambda;_, then this step amounts to the following: "Flip the input coin.  If it returns 0, return 0.")
2. Run a Bernoulli factory algorithm for _q_(.).  If the call returns 1, return 1.
3. Run a Bernoulli factory algorithm for _r_(.), and return 1 minus the result of that call.  The Bernoulli factory algorithm can be one of the [**general factory function algorithms**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions) if there is a way to calculate polynomials that converge to _r_(.) in a manner needed for that algorithm (for example, if _r_ is described earlier in this section).

> **Notes:**
>
> 1. Quick proof: Rewrite $f=\text{High}\cdot(q\cdot1+(1-q)\cdot(1-r))+(1-\text{High})\cdot0$.
> 2. `High`(_&lambda;_) is allowed to equal 1 if the _r_(.) in step 3 is allowed to equal 0 at 0.
>
> **Example:** If _f_(_&lambda;_) = (1&minus;exp(_&lambda;_))/(1&minus;exp(1)), then _f_ is less than or equal to `High`(_&lambda;_) = _&lambda;_, and greater than or equal to `Low`(_&lambda;_) = _&lambda;_<sup>2</sup>.  As a result, _q_(_&lambda;_) = _&lambda;_, and _r_(_&lambda;_) = (2 &minus; exp(1))/(1 &minus; exp(1)) if _&lambda;_ = 0; 1/(exp(1)&minus;1) if _&lambda;_ = 1; and (&minus;_&lambda;_\*(1 &minus; exp(1)) &minus; exp(_&lambda;_) + 1)/(_&lambda;_\*(1 &minus; exp(1))\*(_&lambda;_ &minus; 1)) otherwise.  This can be computed using the following code in Python that uses the SymPy computer algebra library: `fx=(1-exp(x))/(1-exp(1)); high=x; low=x**2; q=(low/high); r=(1-fx/high)/(1-q); r=Piecewise((limit(r, x, 0), Eq(x,0)), (limit(r,x,1),Eq(x,1)), (r,True)).simplify(); pprint(r)`.

**Other functions that equal 0 or 1 at the endpoints 0 and/or 1.** If _f_ does not fully admit a polynomial-building scheme under the convex, concave, Lipschitz derivative, and Hölder classes:

| If _f_(0) = | And _f_(1) = |      Method |
 --- | --- | --- |
| > 0 and < 1 | 1 | Use the algorithm for **certain functions that equal 0 at 0**, but with _f_(_&lambda;_) = 1 &minus; _f_(1&minus;_&lambda;_).<br/>_Inverted coin_: Instead of the usual input coin, use a coin that does the following: "Flip the input coin and return 1 minus the result."<br/>_Inverted result:_ If the overall algorithm would return 0, it returns 1 instead, and vice versa. |
| > 0 and < 1 | 0 | Algorithm for **certain functions that equal 0 at 0**, but with _f_(_&lambda;_) = _f_(1&minus;_&lambda;_).  (For example, cosh(_&lambda;_)&minus;1 becomes cosh(1&minus;_&lambda;_)&minus;1.)<br/>Inverted coin. |
| 1 | 0 | Algorithm for **certain functions that equal 0 at 0 and 1 at 1**, but with _f_(_&lambda;_) = 1&minus;_f_(_&lambda;_).<br/>Inverted result. |
| 1 | > 0 and &le; 1 | Algorithm for **certain functions that equal 0 at 0**, but with _f_(_&lambda;_) = 1&minus;_f_(_&lambda;_).<br/>Inverted result. |

**Specific functions.** My [**GitHub repository**](https://github.com/peteroupc/peteroupc.github.io/blob/master/approxscheme.py) includes SymPy code for a method, `approxscheme2`, to build a polynomial-building scheme for certain factory functions.

<a id=Approximate_Bernoulli_Factories></a>
## Approximate Bernoulli Factories

An **approximate Bernoulli factory** for a function _f_(_&lambda;_) is a Bernoulli factory algorithm that simulates another function, _g_(_&lambda;_), that approximates _f_ in some sense.

Usually _g_ is a polynomial, but can also be a rational function (ratio of polynomials) or another function with an easy-to-implement Bernoulli factory algorithm.

Meanwhile, _f_(_&lambda;_) can be any function that maps the closed unit interval to itself, even if it isn't continuous or a factory function (examples include the "step function" 0 if _&lambda;_ < 1/2 and 1 otherwise, or the function 2\*min(_&lambda;_, 1 &minus; _&lambda;_)).  If the function is continuous, it can be approximated arbitrarily well by an approximate Bernoulli factory (as a result of the so-called "Weierstrass approximation theorem"), but generally not if the function is discontinuous.

To build an approximate Bernoulli factory with a polynomial:

1. First, find a polynomial in Bernstein form of degree _n_ that is close to the desired function _f_(_&lambda;_).

    The simplest choice for this polynomial, known simply as a _Bernstein polynomial_, has _n_+1 coefficients and its _j_<sup>th</sup> coefficient (starting at 0) is found as _f_(_j_/_n_).  For this choice, if _f_ is continuous, the polynomial can be brought arbitrarily close to _f_ by choosing _n_ high enough.

    Whatever polynomial is used, the polynomial's coefficients must all lie in \[0, 1\].

2. Then, use one of the algorithms in the section "[**Certain Polynomials**](https://peteroupc.github.io/bernoulli.html)" to toss heads with probability equal to that polynomial, given its coefficients.

> **Note:** Bias and variance are the two sources of error in a randomized estimation algorithm.  Let _g_(_&lambda;_) be an approximation of _f_(_&lambda;_). The original Bernoulli factory for _f_, if it exists, has bias 0 and variance _f_(_&lambda;_)\*(1&minus;_f_(_&lambda;_)), but the approximate Bernoulli factory has bias _g_(_&lambda;_) &minus; _f_(_&lambda;_) and variance _g_(_&lambda;_)\*(1&minus;_g_(_&lambda;_)). ("Variance reduction" methods are outside the scope of this document.)  An estimation algorithm's _mean squared error_ equals variance plus square of bias.

<a id=Approximate_Bernoulli_Factories_for_Certain_Functions></a>
### Approximate Bernoulli Factories for Certain Functions

This section first discusses approximating $f$ with a _Bernstein polynomial_ (a degree-$n$ polynomial in Bernstein form with coefficients $f(k/n)$ with $0\le k\le n$).  The advantage is only one Bernstein coefficient has to be found per run; the disadvantage is that Bernstein polynomials approach $f$ slowly in general, in the order of $1/n$ (Voronovskaya 1932)[^3].

There are results that give an upper bound on the error on approximating _f_ with a degree-_n_ Bernstein polynomial.  To find a degree _n_ such that _f_ is approximated with a maximum error of _&epsilon;_, solve the error bound's equation for _n_, then take _n_ = ceil(_n_) to get the solution if it's an integer, or the nearest integer that's bigger than the solution.

For example:

| If _f_(_&lambda;_): |  Then the degree-_n_ Bernstein polynomial is close to $f$ with the following error bound: |   Where _n_ is:  |  Notes |
 --- | --- | --- | --- |
| Has Lipschitz continuous derivative (see "Definitions"). | _&epsilon;_ = _M_/(8\*_n_). | _n_ = ceil(_M_/(8\*_&epsilon;_)). | Lorentz (1966)[^4]. _M_ is the derivative's Lipschitz constant. |
| Hölder continuous with constant _M_ and exponent _&alpha;_. | _&epsilon;_ = _M_\*(1/(4\*_n_))<sup>_&alpha;_/2</sup>. | _n_ = ceil(1/(4<sup>_&alpha;_</sup>\*_&epsilon;_<sup>2</sup>/_M_<sup>2</sup>)<sup>1/_&alpha;_</sup>). | Mathé (1999)[^5]. 0 &lt; _&alpha;_ &le; 1. |
| Lipschitz continuous with constant _L_. | _&epsilon;_ = _L_\*sqrt(1/(4\*_n_)). | _n_ = ceil(_L_<sup>2</sup>/(4\*_&epsilon;_<sup>2</sup>)). | Special case of previous entry. |

Now, if _f_ belongs to any of the classes given above, the following algorithm (adapted from "Certain Polynomials") simulates a polynomial that approximates _f_ with a maximum error of _&epsilon;_:

1. Calculate _n_ as described in the table above for the given class.
2. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.
3. With probability _f_(_j_/_n_), return 1.  Otherwise, return 0. (If _f_(_j_/_n_) can be an irrational number, see "[**Algorithms for General Irrational Constants**](https://peteroupc.github.io/bernoulli.html#Algorithms_for_General_Irrational_Constants)" for ways to sample this irrational probability exactly.)

-------------------

Alternatively, polynomials other than Bernstein polynomials, but written in Bernstein form, can be used to approximate $f$ with an error no more than $\epsilon$, as long as an explicit upper bound on the approximation error is available.  A ratio of two such polynomials can also approximate $f$ this way.  See my [**question on MathOverflow**](https://mathoverflow.net/questions/424272).

An example is given by the iterated Bernstein polynomial construction discussed in Micchelli (1973)[^6] and Guan (2009)[^7]. Let $B_n(f(\lambda))$ be the ordinary Bernstein polynomial for $f(\lambda)$.  Then&mdash;

- the order-2 iterated Bernstein polynomial of degree $n$ is $U_{n,2} = B_n(W_{n,2})$, where $W_{n,2} = 2 f(\lambda) - B_n(f(\lambda))$, and
- the order-3 iterated Bernstein polynomial of degree $n$ is $U_{n,3} = B_n(W_{n,3})$, where $W_{n,3} = B_n(B_n(f(\lambda))) + 3 (f(\lambda) - B_n(f(\lambda)))$

(Güntürk and Li 2021, sec. 3.3)[^8]. The goal is now to find a degree $n$ such that&mdash;

1. the iterated polynomial is within $\epsilon$ of $f(\lambda)$, and
2. the polynomial $W_{n,i}$ is not less than 0 or greater than 1.

&nbsp;

By analyzing the proof of Theorem 3.3 of the paper just cited, the following error bounds _appear_ to be true.  In the table below, _M_<sub>_n_</sub> is not less than the so-called $C^n$ norm.  Unfortunately, the $C^n$ norm is defined differently in different academic works, and the bounds are sensitive to how that norm is defined.[^9]

| If _f_(_&lambda;_): |  Then the following polynomial: |  Is close to _f_ with the following error bound: | Where _n_ is:  |
 --- | --- | --- | --- |
| Has continuous third derivative. | $U_{n,2}$ | _&epsilon;_ = 0.3489\*_M_<sub>3</sub>/_n_<sup>3/2</sup>. | _n_=ceil((0.3489)<sup>2/3</sup>\*(_M_<sub>4</sub>/_&epsilon;_)<sup>2/3</sup>) &lt; ceil((49561/100000)\*(_M_/_&epsilon;_)<sup>2/3</sup>). |
| Has continuous fourth derivative. | $U_{n,2}$ | _&epsilon;_ = 0.275\*_M_<sub>4</sub>/_n_<sup>2</sup>. | _n_=ceil(sqrt(0.275)\*sqrt(_M_<sub>4</sub>/_&epsilon;_)) &lt; ceil((52441/100000)\*sqrt(_M_/_&epsilon;_)). |
| Has continuous fifth derivative. | $U_{n,3}$ | _&epsilon;_ = 0.7284\*_M_<sub>5</sub>/_n_<sup>5/2</sup>. | _n_=ceil((0.7284)<sup>2/5</sup>\*(_M_<sub>5</sub>/_&epsilon;_)<sup>2/5</sup>) &lt; ceil((88095/100000)\*(_M_/_&epsilon;_)<sup>2/5</sup>). |
| Has continuous sixth derivative. | $U_{n,3}$ | _&epsilon;_ = 0.9961\*_M_<sub>6</sub>/_n_<sup>3</sup>. | _n_=ceil((0.9961)<sup>1/3</sup>\*(_M_<sub>6</sub>/_&epsilon;_)<sup>1/3</sup>) &lt; ceil((99870/100000)\*(_M_/_&epsilon;_)<sup>1/3</sup>). |

However, unlike with ordinary Bernstein polynomials, the polynomial $W$ (and thus $U$) is not necessarily bounded by 0 and 1.  The following process can be used to calculate the required degree $n$, given an error tolerance of $\epsilon$.

1. Determine whether $f$ is described in the table above.  Let _A_ be the minimum of $f$ on the closed unit interval and let _B_ be the maximum of $f$ there.
2. If 0 &lt; _A_ &le; _B_ &lt; 1, calculate $n$ as given in the table above, but with $\epsilon=\min(\epsilon, A, 1-B)$, and stop.
3. Propositions B1, B2, and B3 in the [**appendix**](#Appendix) give conditions on $f$ so that $W_{n,2}$ or $W_{n,3}$ (as the case may be) will be nonnegative.  If _B_ is less than 1 and any of those conditions is met, calculate $n$ as given in the table above, but with $\epsilon=\min(\epsilon, 1-B)$. (For B3, set $n$ to max($n$, $m$), where $m$ is given in that proposition.) Then stop; $W$ will now be bounded by 0 and 1.
4. Calculate $n$ as given in the table above.  Then, if $W_{n,i}(j/n)\lt 0$ or $W_{n,i}(j/n)\gt 1$ for some $0\le j\le n$, double the value of $n$ until this condition is no longer true.

Once _n_ is found, simulating the iterated polynomial is as follows:

1. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.
2. With probability $W_{n,2}(j/n)$ or $W_{n,3}(j/n)$ (as the case may be), return 1.  Otherwise, return 0.

> **Notes:**
>
> 1. Providing the full proof for the error bounds shown in the table is a bit tedious, so here is a sketch.  The proof was found by analyzing Theorem 3.3 of Güntürk and Li (2021)[^8], finding upper bounds for so-called "central moments" of the binomial distribution (see B4 to B7 in the appendix), then plugging them in to various estimates mentioned in that theorem's proof.  The most significant estimate in that theorem is denoted $(B_n-I)^{\lceil (r+1)/2 \rceil}(f)$, which in this case is the error when approximating $f$ using an iterated Bernstein polynomial, when $f$ has a continuous $(r+1)$-th derivative.
> 2. A polynomial's Bernstein coefficients can be rounded to multiples of $\delta$ (where $0 \lt\delta\le 1$) by setting $c$=floor($c/\delta$) \* $\delta$ for each coefficient $c$.  The new polynomial will differ from the old one by at most $\delta$.  (Thus, to find a polynomial with multiple-of-$\delta$ coefficients that approximates $f$ with error $\epsilon$ [which must be greater than $\delta$], first find a polynomial with error $\epsilon - \delta$, then round that polynomial's coefficients as given here.)

<a id=Approximate_Bernoulli_Factories_for_Power_Series></a>
### Approximate Bernoulli Factories for Power Series

Some functions can be rewritten as a power series, namely: $$f(\lambda) = a_0 \lambda^0 + a_1 \lambda^1 + ... + a_i \lambda^i + ...,$$ where $a_i$, the _coefficients_, are constant rational numbers[^10].

To simulate an approximation of $f$ that comes within $\epsilon$ of $f$:

1. Find the first $n$+1 coefficients such that the polynomial $P(\lambda) = a_0 \lambda^0 + ... + a_n\lambda^n$ is within $\epsilon$ of $f$ wherever $0 \le \lambda \le 1$.

    If $f$'s coefficients are each greater than 0, form a nowhere increasing sequence (example: (1/4, 1/8, 1/8, 1/16, ...)), and meet the so-called "ratio test", the algorithms in Carvalho and Moreira (2022)[^11] can be used here (see also "[**Proofs on Cutting Off a Power Series**](#Proofs_on_Cutting_Off_a_Power_Series)" in the appendix).

    Alternatively, if bounds on the derivatives of $f$ are known, then thanks to Taylor's theorem, $P(\lambda)$ will be close enough if $M/((n+1)!) \le \epsilon$, where $M$ is equal to or greater than the maximum absolute value of $f$'s ($n$+1)-th derivative on the domain of $f$.
2. Rewrite $P(\lambda)$ as a polynomial in Bernstein form.  (One way to transform a polynomial to Bernstein form, given the "power" coefficients $a_0, ..., a_n$, is the so-called "matrix method" from Ray and Nataraj (2012)[^12].)  Let $b_0, ..., b_n$ be the Bernstein-form polynomial's coefficients.
3. Flip the input coin _n_ times, then let _j_ be the number of times the coin returned 1 this way, then return either 1 with probability $b_j$, or 0 otherwise.

In fact, if $f(\lambda)$ belongs in _Gevrey's hierarchy_ (there are $B\ge 1, l\ge 1, \gamma\ge 1$ such that its $n$-th derivative's absolute value is not greater than $Bl^n n^{\gamma n}$ for every $n$), which includes functions equaling power series as a special case ($\gamma=1$), it's possible to bound the derivatives and find the appropriate degree for the approximating polynomial (for details, see (Kawamura et al. 2015)[^13]; see also (Gevrey 1918)[^14]).

<a id=Approximate_Bernoulli_Factories_for_Linear_Functions></a>
### Approximate Bernoulli Factories for Linear Functions

There are a number of approximate methods to simulate _&lambda;_\*_c_, where _c_ > 1 and 0 &le; _&lambda;_ &lt; 1/_c_.  ("Approximate" because this function touches 1 at 1/_c_, so it can't be a factory function.) Since the methods use only up to _n_ flips, where _n_ is an integer greater than 0, the approximation will be a polynomial of degree _n_.

- Henderson and Glynn (2003, Remark 4\)[^15] approximates the function _&lambda;_\*2 using a polynomial where the _j_<sup>th</sup> coefficient (starting at 0) is min((_j_/_n_)\*2, 1&minus;1/_n_).  If _g_(_&lambda;_) is that polynomial, then the error in approximating _f_ is no greater than 1&minus;_g_(1/2).  _g_ can be computed with the SymPy computer algebra library as follows: `from sympy.stats import *; g=2*E( Min(sum(Bernoulli(("B%d" % (i)),z) for i in range(n))/n,(S(1)-S(1)/n)/2))`.

- I found the following approximation for _&lambda;_\*_c_[^16]\: "(1.) Set _j_ to 0 and _i_ to 0; (2.) If _i_ &ge; _n_, return 0; (3.) Flip the input coin, and if it returns 1, add 1 to _j_; (4.) (Estimate the probability and return 1 if it 'went over'.) If (_j_/(_i_+1)) &ge; 1/_c_, return 1; (5.) Add 1 to _i_ and go to step 2."  Here, _&lambda;_\*_c_ is approximated by a polynomial where the _j_<sup>th</sup> coefficient (starting at 0) is min((_j_/_n_)\*_c_, 1).  If _g_(_&lambda;_) is that polynomial, then the error in approximating _f_ is no greater than 1&minus;_g_(1/_c_).

- The previous approximation generalizes the one given in section 6 of Nacu and Peres (2005\)[^1], which approximates _&lambda;_\*2.

<a id=Achievable_Simulation_Rates></a>
## Achievable Simulation Rates

In general, the number of input coin flips needed by any Bernoulli factory algorithm for a factory function _f_(_&lambda;_) depends on how "smooth" the function _f_ is.

The following table summarizes the rate of simulation (in terms of the number of input coin flips needed) that can be achieved _in theory_ depending on _f_(_&lambda;_), assuming the input coin's probability of heads is unknown.  In the table below:

- _&lambda;_, the unknown probability of heads, is _&epsilon;_ or greater and (1&minus;_&epsilon;_) or less for some _&epsilon;_ &gt; 0.
- The simulation makes use of unbiased random bits in addition to input coin flips.
- _&Delta;_(_n_, _r_, _&lambda;_) = _O_(max(sqrt(_&lambda;_\*(1&minus;_&lambda;_)/_n_),1/_n_)<sup>_r_</sup>), that is, _O_((1/_n_)<sup>_r_</sup>) near _&lambda;_ = 0 or 1, and _O_((1/_n_)<sup>_r_/2</sup>) elsewhere. (_O_(_h_(_n_)) roughly means "less than or equal to _h_(_n_) times a constant, for every _n_ large enough".)

|   Property of simulation   |   Property of _f_
  ------------- |  ------------------------
| Requires no more than _n_ input coin flips. | If and only if _f_ can be written as a polynomial in Bernstein form of degree _n_ with coefficients in the closed unit interval (Goyal and Sigman 2012\)[^17]. |
| Requires a finite number of flips on average. Also known as "realizable" by Flajolet et al. (2010\)[^18]. | Only if _f_ is Lipschitz continuous (Nacu and Peres 2005\)[^1].<br/>Whenever _f_ admits a fast simulation (Mendo 2019\)[^19].  |
| Number of flips required, raised to power of _r_, is bounded by a finite number on average and has a tail that drops off uniformly over _f_'s domain.  | Only if _f_ has continuous _r_-th derivative (Nacu and Peres 2005\)[^1]. |
| Requires more than _n_ flips with probability _&Delta;_(_n_, _r_ + 1, _&lambda;_), for integer _r_ &ge; 0 and every _&lambda;_. (The greater _r_ is, the faster the simulation.) | Only if _f_ has an _r_-th derivative that is continuous and in the Zygmund class (see note 3) (Holtz et al. 2011\)[^20]. |
| Requires more than _n_ flips with probability _&Delta;_(_n_, _&alpha;_, _&lambda;_), for non-integer _&alpha;_ &gt; 0 and every _&lambda;_. (The greater _&alpha;_ is, the faster the simulation.) | If and only if _f_ has an _r_-th derivative that is Hölder continuous with exponent (_&alpha;_ &minus; _r_), where _r_ = floor(_&alpha;_) (Holtz et al. 2011\)[^20]. Assumes _f_ is bounded away from 0 and 1. |
| "Fast simulation" (requires more than _n_ flips with a probability that decays exponentially as _n_ gets large).  Also known as "strongly realizable" by Flajolet et al. (2010\)[^18]. | If and only if _f_ is real analytic (writable as $f(\lambda)=a_0 \lambda^0 + a_1 \lambda^1 + ...$ for real constants $a_i$) (Nacu and Peres 2005\)[^1].   |
| Average number of flips greater than or equal to (_f&prime;_(_&lambda;_))<sup>2</sup>\*_&lambda;_\*(1&minus;_&lambda;_)/(_f_(_&lambda;_)\*(1&minus;_f_(_&lambda;_))), where _f&prime;_ is the first derivative of _f_.  | Whenever _f_ admits a fast simulation (Mendo 2019\)[^19]. |

> **Notes:**
>
> 1. By the results of Holtz et al., it is suspected that the target function _f_ can't be simulated using a finite number of flips on average for every probability of heads unless _f_'s fourth derivative is Hölder continuous.
> 2. If a function is constant on some non-empty open interval in its domain, but is not constant on the whole domain, then it can't be real analytic.
> 3. A function in the _Zygmund class_, roughly speaking, has no vertical slope.  The Zygmund class includes the smaller class of Lipschitz continuous functions.

<a id=Complexity></a>
## Complexity

The following note shows the complexity of the algorithm for 1/_&phi;_ in the main article, where _&phi;_ is the golden ratio.

Let **E**\[_N_\] be the expected ("long-run average") number of unbiased random bits (fair coin flips) generated by the algorithm.

Then, since each bit is independent, **E**\[_N_\] = 2\*_&phi;_ as shown below.

- Each iteration stops the algorithm with probability _p_ = (1/2) + (1&minus;(1/2)) * (1/_&phi;_) (1/2 for the initial bit and 1/_&phi;_ for the recursive run; (1&minus;(1/2)) because we're subtracting the (1/2) earlier on the right-hand side from 1).
- Thus, the expected number of iterations is **E**\[_T_\] = 1/_p_ by a well-known rejection sampling argument, since the algorithm doesn't depend on iteration counts.
- Each iteration uses 1 * (1/2) + (1 + **E**\[_N_\]) * (1/2) bits on average, so the whole algorithm uses **E**\[_N_\] = (1 * (1/2) + (1 + **E**\[_N_\]) * (1/2)) * **E**\[_T_\] bits on average (each iteration consumes either 1 bit with probability 1/2, or (1 + **E**\[_N_\]) bits with probability 1/2). This equation has the solution **E**\[_N_\] = 1 + sqrt(5) = 2\*_&phi;_.

Also, on average, half of these flips (_&phi;_) show 1 and half show 0, since the bits are unbiased (the coin is fair).

A similar analysis to the one above can be used to find the expected ("long-run average") time complexity of many Bernoulli factory algorithms.

<a id=Examples_of_Bernoulli_Factory_Polynomial_Building_Schemes></a>
## Examples of Bernoulli Factory Polynomial-Building Schemes

The following are polynomial-building schemes and hints to simulate a coin of probability _f_(_&lambda;_) given an input coin with probability of heads of _&lambda;_.  The schemes were generated automatically using `approxscheme2` and have not been rigorously verified for correctness.

* Let _f_(_&lambda;_) = **cosh(_&lambda;_) &minus; 3/4**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be convex and twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = 487/2500 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 154309/(700000\*n).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).

    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 1043/5000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 462927/(2800000\*n).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).

* Let _f_(_&lambda;_) = **3/4 &minus; sqrt(&minus;_&lambda;_\*(_&lambda;_ &minus; 1))**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be convex and (1/2)-Hölder continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; 1545784563/(400000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; 26278337571/(25600000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
* Let _f_(_&lambda;_) = **3\*sin(sqrt(3)\*sqrt(sin(2\*_&lambda;_)))/4 + 1/50**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be (1/2)-Hölder continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; 709907859/(100000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_) + 709907859/(100000000\*n<sup>1/4</sup>).
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; 6389170731/(3200000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_) + 6389170731/(3200000000\*n<sup>1/4</sup>).
* Let _f_(_&lambda;_) = **3/4 &minus; sqrt(&minus;_&lambda;_\*(_&lambda;_ &minus; 1))**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be convex and (1/2)-Hölder continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; 1545784563/(400000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; 26278337571/(25600000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
* Let _f_(_&lambda;_) = **_&lambda;_\*sin(7\*&pi;\*_&lambda;_)/4 + 1/2**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be twice differentiable using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = 523/10000 if _n_&lt;64; otherwise, _f_(_k_/_n_) &minus; 11346621/(700000\*n).
        * **fabove**(_n_, _k_) = 1229/1250 if _n_&lt;64; otherwise, _f_(_k_/_n_) + 11346621/(700000\*n).

    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 681/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) &minus; 34039863/(4480000\*n).
        * **fabove**(_n_, _k_) = 4837/5000 if _n_&lt;32; otherwise, _f_(_k_/_n_) + 34039863/(4480000\*n).

* Let _f_(_&lambda;_) = **sin(4\*&pi;\*_&lambda;_)/4 + 1/2**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = 737/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) &minus; 1973921/(350000\*n).
        * **fabove**(_n_, _k_) = 9263/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) + 1973921/(350000\*n).

    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 1123/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) &minus; 1973921/(448000\*n).
        * **fabove**(_n_, _k_) = 8877/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) + 1973921/(448000\*n).

* Let _f_(_&lambda;_) = **sin(6\*&pi;\*_&lambda;_)/4 + 1/2**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = 517/10000 if _n_&lt;64; otherwise, _f_(_k_/_n_) &minus; 2220661/(175000\*n).
        * **fabove**(_n_, _k_) = 9483/10000 if _n_&lt;64; otherwise, _f_(_k_/_n_) + 2220661/(175000\*n).

    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 1043/10000 if _n_&lt;64; otherwise, _f_(_k_/_n_) &minus; 104371067/(11200000\*n).
        * **fabove**(_n_, _k_) = 8957/10000 if _n_&lt;64; otherwise, _f_(_k_/_n_) + 104371067/(11200000\*n).

* Let _f_(_&lambda;_) = **sin(4\*&pi;\*_&lambda;_)/4 + 1/2**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = 737/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) &minus; 1973921/(350000\*n).
        * **fabove**(_n_, _k_) = 9263/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) + 1973921/(350000\*n).

    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 1123/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) &minus; 1973921/(448000\*n).
        * **fabove**(_n_, _k_) = 8877/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) + 1973921/(448000\*n).

* Let _f_(_&lambda;_) = **_&lambda;_<sup>2</sup>/2 + 1/10 if _&lambda;_ &le; 1/2; _&lambda;_/2 &minus; 1/40 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be convex and twice differentiable using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = 321/5000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 1/(7\*n).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).

* Let _f_(_&lambda;_) = **1/2 &minus; sqrt(1 &minus; 2\*_&lambda;_)/2 if _&lambda;_ < 1/2; sqrt(2\*_&lambda;_ &minus; 1)/2 + 1/2 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be (1/2)-Hölder continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; 1545784563/(400000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_) + 1545784563/(400000000\*n<sup>1/4</sup>).
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; 10820491941/(12800000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_) + 10820491941/(12800000000\*n<sup>1/4</sup>).
* Let _f_(_&lambda;_) = **1/2 &minus; sqrt(1 &minus; 2\*_&lambda;_)/4 if _&lambda;_ < 1/2; sqrt(2\*_&lambda;_ &minus; 1)/4 + 1/2 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be (1/2)-Hölder continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; 772969563/(400000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_) + 772969563/(400000000\*n<sup>1/4</sup>).
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 193/5000 if _n_&lt;16; otherwise, _f_(_k_/_n_) &minus; 5410786941/(12800000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = 4807/5000 if _n_&lt;16; otherwise, _f_(_k_/_n_) + 5410786941/(12800000000\*n<sup>1/4</sup>).

* Let _f_(_&lambda;_) = **_&lambda;_/2 + (1 &minus; 2\*_&lambda;_)<sup>3/2</sup>/12 &minus; 1/12 if _&lambda;_ < 0; _&lambda;_/2 + (2\*_&lambda;_ &minus; 1)<sup>3/2</sup>/12 &minus; 1/12 if _&lambda;_ &ge; 1/2; _&lambda;_/2 + (1 &minus; 2\*_&lambda;_)<sup>3/2</sup>/12 &minus; 1/12 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be convex and Lipschitz continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; 322613/(500000\*sqrt(n)).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; 3548743/(32000000\*sqrt(n)).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
* Let _f_(_&lambda;_) = **1/2 &minus; sqrt(1 &minus; 2\*_&lambda;_)/4 if _&lambda;_ < 1/2; sqrt(2\*_&lambda;_ &minus; 1)/4 + 1/2 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be (1/2)-Hölder continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; 772969563/(400000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_) + 772969563/(400000000\*n<sup>1/4</sup>).
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 193/5000 if _n_&lt;16; otherwise, _f_(_k_/_n_) &minus; 5410786941/(12800000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = 4807/5000 if _n_&lt;16; otherwise, _f_(_k_/_n_) + 5410786941/(12800000000\*n<sup>1/4</sup>).

* Let _f_(_&lambda;_) = **1/2 &minus; sqrt(1 &minus; 2\*_&lambda;_)/8 if _&lambda;_ < 1/2; sqrt(2\*_&lambda;_ &minus; 1)/8 + 1/2 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be (1/2)-Hölder continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = 333/10000 if _n_&lt;64; otherwise, _f_(_k_/_n_) &minus; 386562063/(400000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = 9667/10000 if _n_&lt;64; otherwise, _f_(_k_/_n_) + 386562063/(400000000\*n<sup>1/4</sup>).

    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 451/2000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 2705934441/(12800000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = 1549/2000 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 2705934441/(12800000000\*n<sup>1/4</sup>).

* Let _f_(_&lambda;_) = **_&lambda;_/4 + (1 &minus; 2\*_&lambda;_)<sup>3/2</sup>/24 + 5/24 if _&lambda;_ < 0; _&lambda;_/4 + (2\*_&lambda;_ &minus; 1)<sup>3/2</sup>/24 + 5/24 if _&lambda;_ &ge; 1/2; _&lambda;_/4 + (1 &minus; 2\*_&lambda;_)<sup>3/2</sup>/24 + 5/24 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be convex and Lipschitz continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = 443/5000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 322613/(1000000\*sqrt(n)).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).

    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 1111/5000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 3548743/(64000000\*sqrt(n)).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).

* Let _f_(_&lambda;_) = **3\*_&lambda;_/2 if _&lambda;_ &le; 1 &minus; _&lambda;_; 3/2 &minus; 3\*_&lambda;_/2 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be concave and Lipschitz continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 124/125 if _n_&lt;64; otherwise, _f_(_k_/_n_) + 967839/(500000\*sqrt(n)).

    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 1863/2000 if _n_&lt;64; otherwise, _f_(_k_/_n_) + 2903517/(2000000\*sqrt(n)).

* Let _f_(_&lambda;_) = **9\*_&lambda;_/5 if _&lambda;_ &le; 1 &minus; _&lambda;_; 9/5 &minus; 9\*_&lambda;_/5 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be concave and Lipschitz continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_) + 2903517/(1250000\*sqrt(n)).
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_) + 8710551/(5000000\*sqrt(n)).
* Let _f_(_&lambda;_) = **19\*_&lambda;_/20 if _&lambda;_ &le; 1 &minus; _&lambda;_; 19/20 &minus; 19\*_&lambda;_/20 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be concave and Lipschitz continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 1817/2000 if _n_&lt;8; otherwise, _f_(_k_/_n_) + 6129647/(5000000\*sqrt(n)).

    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 2337/2500 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 18388941/(20000000\*sqrt(n)).

* Let _f_(_&lambda;_) = **min(1/8, 3\*_&lambda;_)**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be concave and Lipschitz continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 4047/5000 if _n_&lt;32; otherwise, _f_(_k_/_n_) + 967839/(250000\*sqrt(n)).

    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 171/400 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 967839/(1600000\*sqrt(n)).

<a id=Notes></a>
## Notes

[^1]: Nacu, Şerban, and Yuval Peres. "[**Fast simulation of new coins from old**](https://projecteuclid.org/euclid.aoap/1106922322)", The Annals of Applied Probability 15, no. 1A (2005): 93-115.

[^2]: In this case, an algorithm to simulate `High`(_&lambda;_) is: Flip the input coin _n_ times or until a flip returns 1, whichever comes first, then output the last coin flip result.

[^3]: E. Voronovskaya, "Détermination de la forme asymptotique d'approximation des fonctions par les polynômes de M. Bernstein", 1932.

[^4]: G.G. Lorentz, "Approximation of functions", 1966.

[^5]: Mathé, Peter. “Approximation of Hölder Continuous Functions by Bernstein Polynomials.” The American Mathematical Monthly 106, no. 6 (1999): 568–74. [**https://doi.org/10.2307/2589469.**](https://doi.org/10.2307/2589469.)

[^6]: Micchelli, Charles. "The saturation class and iterates of the Bernstein polynomials." Journal of Approximation Theory 8, no. 1 (1973): 1-18.

[^7]: Guan, Zhong. "[**Iterated Bernstein polynomial approximations**](https://arxiv.org/abs/0909.0684)", arXiv:0909.0684 (2009).

[^8]: Güntürk, C.S., Li, W., "[**Approximation of functions with one-bit neural networks**](https://arxiv.org/abs/2112.09181)", arXiv:2112.09181 [cs.LG], 2021.

[^9]: Güntürk and Li 2021 defines the $C^n$ norm as the maximum absolute value of $f(\lambda)$ and its _n_-th derivative where $0\le \lambda\le 1$, but the bounds would then be false in general.  One counterexample is $2\lambda(1-\lambda)$, and another is $(\sin(\lambda)+2\lambda(1-\lambda))/2$.

[^10]: More generally, the coefficients can be real numbers, but there are computational issues.  Rational numbers more easily support arbitrary precision than other real numbers, where special measures are required such as so-called constructive/recursive reals.

[^11]: Carvalho, Luiz Max, and Guido A. Moreira. "[**Adaptive truncation of infinite sums: applications to Statistics**](https://arxiv.org/abs/2202.06121)", arXiv:2202.06121 (2022).

[^12]: S. Ray, P.S.V. Nataraj, "A Matrix Method for Efficient Computation of Bernstein Coefficients", Reliable Computing 17(1), 2012.

[^13]: Kawamura, Akitoshi, Norbert Müller, Carsten Rösnick, and Martin Ziegler. "[**Computational benefit of smoothness: Parameterized bit-complexity of numerical operators on analytic functions and Gevrey’s hierarchy**](https://doi.org/10.1016/j.jco.2015.05.001)." Journal of Complexity 31, no. 5 (2015): 689-714.

[^14]: M. Gevrey, "Sur la nature analytique des solutions des équations aux dérivées partielles", 1918.

[^15]: Henderson, S.G., Glynn, P.W., "Nonexistence of a class of variate generation schemes", _Operations Research Letters_ 31 (2003).

[^16]: For this approximation, if _n_ were infinity, the method would return 1 with probability 1 and so would not approximate _&lambda;_\*_c_, of course.

[^17]: Goyal, V. and Sigman, K., 2012. On simulating a class of Bernstein polynomials. ACM Transactions on Modeling and Computer Simulation (TOMACS), 22(2), pp.1-5.

[^18]: Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560)", arXiv:0906.5560 [math.PR], 2010.

[^19]: Mendo, Luis. "An asymptotically optimal Bernoulli factory for certain functions that can be expressed as power series." Stochastic Processes and their Applications 129, no. 11 (2019): 4366-4384.

[^20]: Holtz, O., Nazarov, F., Peres, Y., "New Coins from Old, Smoothly", _Constructive Approximation_ 33 (2011).

[^21]: Qian, Weikang, Marc D. Riedel, and Ivo Rosenberg. "Uniform approximation and Bernstein polynomials with coefficients in the unit interval." European Journal of Combinatorics 32, no. 3 (2011): 448-463.

[^22]: Li, Zhongkai. "Bernstein polynomials and modulus of continuity." Journal of Approximation Theory 102, no. 1 (2000): 171-174.

[^23]: _Summation notation_, involving the Greek capital sigma (&Sigma;), is a way to write the sum of one or more terms of similar form. For example, $\sum_{k=0}^n g(k)$ means $g(0)+g(1)+...+g(n)$, and $\sum_{k\ge 0} g(k)$ means $g(0)+g(1)+...$.

[^24]: Skorski, Maciej. "[**Handy formulas for binomial moments**](https://arxiv.org/abs/2012.06270)", arXiv:2012.06270 (2020).

[^25]: Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.

[^26]: von Neumann, J., "Various techniques used in connection with random digits", 1951.

[^27]: Peres, Y., "[**Iterating von Neumann's procedure for extracting random bits**](https://projecteuclid.org/euclid.aos/1176348543)", Annals of Statistics 1992,20,1, p. 590-597.

[^28]: Knuth, Donald E. and Andrew Chi-Chih Yao. "The complexity of nonuniform random number generation", in _Algorithms and Complexity: New Directions and Recent Results_, 1976.

[^29]: Mossel, Elchanan, and Yuval Peres. New coins from old: computing with unknown bias. Combinatorica, 25(6), pp.707-724.

[^30]: S. Pae, "[**Binarization Trees and Random Number Generation**](https://arxiv.org/abs/1602.06058v2)", arXiv:1602.06058v2 [cs.DS], 2018.

[^31]: Levy, H., _Stochastic dominance_, 1998.

[^32]: Henry (https://math.stackexchange.com/users/6460/henry), Proving stochastic dominance for hypergeometric random variables, URL (version: 2021-02-20): [**https://math.stackexchange.com/q/4033573**](https://math.stackexchange.com/q/4033573) .

[^33]: Gal, S.G., "Calculus of the modulus of continuity for nonconcave functions and applications", _Calcolo_ 27 (1990)

[^34]: Gal, S.G., 1995. Properties of the modulus of continuity for monotonous convex functions and applications. _International Journal of Mathematics and Mathematical Sciences_ 18(3), pp.443-446.

[^35]: Anastassiou, G.A., Gal, S.G., _Approximation Theory: Moduli of Continuity and Global Smoothness Preservation_, Birkhäuser, 2012.

[^36]: This formula applies to functions with Lipschitz-continuous derivative (a weaker assumption than having three continuous derivatives), but that derivative's Lipschitz constant is a lower bound on $M_{1,3}$, so that formula is useful here.

[^37]: Le Gruyer, Erwan. "Minimal Lipschitz extensions to differentiable functions defined on a Hilbert space." Geometric and Functional Analysis 19, no. 4 (2009): 1101-1118.

[^38]: Herbert-Voss, Ariel, Matthew J. Hirn, and Frederick McCollum. "Computing minimal interpolants in C1, 1 (Rd)." Rev. Mat. Iberoam 33, no. 1 (2017): 29-66.

[^39]: Molteni, Giuseppe. "Explicit bounds for even moments of Bernstein’s polynomials." Journal of Approximation Theory 273 (2022): 105658.

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Proofs_on_Cutting_Off_a_Power_Series></a>
### Proofs on Cutting Off a Power Series

**Lemma A1:** Let&mdash; $$f(x)=a_0 x^0 + a_1 x^1 + ...,$$ where the $a_i$ are constants each 0 or greater and sum to a finite value and where $0\le x\le 1$ (the domain is the closed unit interval). Then $f$ is convex and has a maximum at 1.

_Proof:_ By inspection, $f(x)$ is a power series and is nonnegative on the positive real line (and thus wherever $0\le x\le 1$).  Each of its terms has a maximum at 1 since&mdash;

- for $n=0$, $a_0 x^0=a_0$ is a non-negative constant (which trivially reaches its maximum at 1), and
- for each $n$ where $a_0 = 0$, $a_0 x^n$ is the constant 0 (which trivially reaches its maximum at 1), and
- for each other $n$, $x^n$ is a strictly increasing function and multiplying that by $a_n$ (a positive constant) doesn't change whether it's strictly increasing.

Since all of these terms have a maximum at 1 on the domain, so does their sum.

The derivative of $f$ is&mdash; $$f'(x) = a_1 x^0 + ... + a_i x^{i-1} + ...,$$ which is still a power series with nonnegative values of $a_n$, so the proof so far applies to $f'$ instead of $f$.  By induction, the proof so far applies to all derivatives of $f$, including its second derivative.

Now, since the second derivative is nonnegative on the positive real line, and thus on its domain, $f$ is convex, which completes the proof. &#x25a1;

**Proposition A2:** For a function $f(x)$ as in Lemma A1, let&mdash; $$g_n(x)=a_0 x^0 + ... + a_n x^n,$$ and have the same domain as $f$.  Then for every $n\ge 1$, $g_n(x)$ is within $\epsilon$ of $f(x)$, where $\epsilon = f(1) - g_n(1)$.

_Proof:_ $g_n$, consisting of the first $n+1$ terms of $f$, is a power series with nonnegative coefficients, so by Lemma A1, it has a maximum at 1.  The same is true for $f-g_n$, consisting of the remaining terms of $f$.  Since the latter has a maximum at 1, the maximum error is $\epsilon = f(1)-g_n(1)$. &#x25a1;

For a function $f$ described in Lemma A1, $f(1)=a_0 1^0 + a_1 1^1 + ... = a_0 + a_1+...$, and $f$'s error behavior is described at the point 1, the algorithms given in Carvalho and Moreira (2022)[^11] &mdash; which apply to infinite sums &mdash; can be used to "cut off" $f$ at a certain number of terms and do so with a controlled error.

<a id=Results_Used_in_Approximate_Bernoulli_Factories></a>
### Results Used in Approximate Bernoulli Factories

**Proposition B1**: Let $f(\lambda)$ map the closed unit interval to itself and be continuous and concave.  Then $W_{n,2}$ and $W_{n,3}$ (as defined in "Approximate Bernoulli Factories for Certain Functions") are nonnegative on the closed unit interval.

_Proof:_ For $W_{n,2}$ it's enough to prove that $B_n(f)\le f$ for every $n\ge 1$.  This is the case because of Jensen's inequality and because $f$ is concave.

For $W_{n,3}$ it must also be shown that $B_n(B_n(f(\lambda)))$ is nonnegative.  For this, using only the fact that $f$ maps the closed unit interval to itself, $B_n(f)$ will have Bernstein coefficients in that interval (each coefficient is a value of $f$) and so will likewise map the closed unit interval to itself (Qian et al. 2011)[^21].  Thus, by induction, $B_n(B_n(f(\lambda)))$ is nonnegative.  The discussion for $W_{n,2}$ also shows that $(f - B_n(f))$ is nonnegative as well.  Thus, $W_{n,3}$ is nonnegative on the closed unit interval. &#x25a1;

**Proposition B2**: Let $f(\lambda)$ map the closed unit interval to itself, be continuous, nowhere decreasing, and subadditive, and equal 0 at 0. Then $W_{n,2}$ is nonnegative on the closed unit interval.

_Proof:_ The assumptions on $f$ imply that $B_n(f)\le 2 f$ (Li 2000)[^22], showing that $W_{n,2}$ is nonnegative on the closed unit interval.  &#x25a1;

> **Note:** A subadditive function $f$ has the property that $f(a+b) \le f(a)+f(b)$ whenever $a$, $b$, and $a+b$ are in $f$'s domain.

**Proposition B3**: Let $f(\lambda)$ map the closed unit interval to itself and have a Lipschitz continuous derivative with Lipschitz constant $L$.  If $f(\lambda) \ge \frac{L \lambda(1-\lambda)}{2m}$ on $f$'s domain, for some $m\ge 1$, then $W_{n,2}$ is nonnegative there, for every $n\ge m$.

_Proof_: Let $E(\lambda, n) = \frac{L \lambda(1-\lambda)}{2n}$. Lorentz (1966)[^4] showed that with this Lipschitz derivative assumption on $f$, $B_n$ differs from $f(\lambda)$ by no more than $E(\lambda, n)$ for every $n\ge 1$.  By inspection, $E(\lambda, n)$ is biggest when $n=1$ and decreases as $n$ increases. Assuming the worst case that $B_n(\lambda) = f(\lambda) + E(\lambda, m)$, it follows that $W_{n,2}=2 f(\lambda) - B_n(\lambda)\ge 2 f(\lambda) - f(\lambda) - E(\lambda, m) = f(\lambda) - E(\lambda, m)\ge 0$ whenever $f(\lambda)\ge E(\lambda, m)$.  Because $E(\lambda, k+1)\le E(\lambda,k)$ for every $k\ge 1$, the preceding sentence holds true for every $n\ge m$. &#x25a1;

The following results deal with a useful quantity when discussing the error in approximating a function by Bernstein polynomials.  Suppose a coin shows heads with probability $p$, and $n$ independent tosses of the coin are made.  Then the total number of heads $X$ follows a _binomial distribution_, and the $r$-th central moment of that distribution is as follows: $$T(n, r, p) = \mathbb{E}[(X-\mathbb{E}[X])^r] = \sum_{k=0}^n (k-np)^r{n \choose k}p^k (1-p)^{n-k},$$ where $\mathbb{E}[.]$ is the expected value ("long-run average").  The following results bound the absolute value of $T$.[^23]

**Result B4** (Molteni 2022)[^39]: If $r$ is an even integer such that $0\le r\le 44$, then $|T(n, r, p)| \le \frac{r!}{((r/2)!)8^{r/2}} n^{r/2}$ for every $n\ge 1$.

**Proposition B5**: For every integer $n\ge 1$, the following is true: $$|T(n, 3, p)| \le \frac{\sqrt{3}}{18\sqrt{n}} n^{3/2} \le \frac{\sqrt{3}}{18} n^{3/2} \lt (963/10000) n^{3/2}.$$

_Proof_: The critical points of $T(n, 3, p)$ (the points where the maximum might be) are at $p=0$, $p=1$, $p=1/2-\sqrt{3}/6$, and $p=1/2+\sqrt{3}/6$.  The moment equals 0 at the points 0 and 1, so that leaves the last two.  Since $T(n, r, p)$ is antisymmetric whenever $r$ is odd, and is nonnegative whenever $r$ is odd and $0\le p \le 1/2$ (Skorski 2020)[^24], it's enough to take the critical point $0 \le p=1/2-\sqrt{3}/6 \le 1/2$ to bound $|T(n, 3, p)|$ on either side.  By inspection, the moment at that critical point is decreasing as $n$ increases, starting with $n=1$. &#x25a1;

**Corollary B6**:  For every integer $n_0\ge 1$, $|T(n, 3, p)| \le \frac{\sqrt{3}}{18\sqrt{n_0}} n^{3/2} < (963/10000)\frac{1}{\sqrt{n_0}} n^{3/2}$ whenever $n\ge n_0$.

**Proposition B7**:  For every integer $n\ge 1$, $|T(n, 5, p)| \le 0.083 n^{5/2}.$  For every integer $n\ge 304$, $|T(n, 5, p)| \le n^2 \le 0.05736 n^{5/2}.$

_Proof_: Evaluating the moment for each $1\le n \le 303$ at its critical point shows that $|T(n,5,p)| < 0.083 n^{5/2}$ for every such $n$.  An upper bound given in sec. 3.1 of Skorski (2020) leads to $|T(n,5,p)| \le n/4+2 {n \choose 2} = n/4+2\frac{n!}{(n-2)!} = n^2 - \frac{3}{4}n \le n^2$ whenever $n\ge 2$, and $n^2/n^{5/2}$ is decreasing as $n$ increases, starting with $n=2$, because its derivative $\frac{-n}{2n^{5/2}}$ is negative whenever $n\ge 2$. Thus it's enough to take the bound $n^2$ at 304, namely 92188, so that $|T(n,5,p)|\le 304^2 = 92188 < 0.05736/n^{5/2}$ for every $n\ge 304$.  This is still less than $0.083 n^{5/2}$, so that bound stands for the first part.  &#x25a1;

<a id=Failures_of_the_Consistency_Requirement></a>
### Failures of the Consistency Requirement

In the academic literature (papers and books), there are many results showing that a polynomial comes within a given error bound of a function _f_(_&lambda;_), when _f_ meets certain conditions.  Unfortunately, these error bounds don't necessarily mean that a sequence of polynomials far from these bounds will obey the consistency requirement, a requirement for simulating _f_ in the Bernoulli factory setting.

Here is one such error bound. Let _f_ have a Lipschitz continuous derivative on the closed unit interval with Lipschitz constant _M_.  Then the _Bernstein polynomial_ for _f_ of degree _n_ (which is in Bernstein form with coefficients $f(k/n)$ with $0\le k\le n$) is within _M_\*_x_\*(1&minus;_x_)/(2\*_n_) of _f_ (and thus within _M_/(8\*_n_) of _f_) whenever $0\le x\le 1$ (Lorentz 1966)[^4]. Thus, for every _n_&ge;1:

- **fabove**(_n_, _k_) = _f_(_k_/_n_) + _M_ / (8*_n_).
- **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; _M_ / (8*_n_).

Where _k_ is an integer and 0 &le; _k_ &le; _n_.

The example against the consistency requirement involves the function _g_(_&lambda;_) = sin(_&pi;_\*_&lambda;_)/4 + 1/2, which has a Lipschitz continuous derivative.

For _g_, the coefficients for&mdash;

- the degree-2 upper polynomial in Bernstein form (**fabove**(5, _k_)) are [0.6542..., 0.9042..., 0.6542...], and
- the degree-4 upper polynomial in Bernstein form (**fabove**(6, _k_)) are [0.5771..., 0.7538..., 0.8271..., 0.7538..., 0.5771...].

The degree-2 polynomial lies above the degree-4 polynomial everywhere in the closed unit interval.  However, to ensure consistency, the degree-2 polynomial, once elevated to degree 4 and rewritten in Bernstein form, must have coefficients that are greater than or equal to those of the degree-4 polynomial.

- Once elevated to degree 4, the degree-2 polynomial's coefficients are [0.6542..., 0.7792..., 0.8208..., 0.7792..., 0.6542...].

As can be seen, the elevated polynomial's coefficient 0.8208... is less than the corresponding coefficient 0.8271... for the degree-4 polynomial.

**Note on "clamping".** In addition, for a polynomial-building scheme, "clamping" the values of **fbelow** and **fabove** to fit the closed unit interval won't necessarily preserve the consistency requirement, even if the original scheme met that requirement.  Here is an example that applies to any scheme.

Let _g_ and _h_ be two polynomials in Bernstein form as follows:

- _g_ has degree 5 and coefficients [10179/10000, 2653/2500, 9387/10000, 5049/5000, 499/500, 9339/10000].
- _h_ has degree 6 and coefficients [10083/10000, 593/625, 9633/10000, 4513/5000, 4947/5000, 9473/10000, 4519/5000].

After elevating _g_'s degree, _g_'s coefficients are no less than _h_'s, as required by the consistency property.

However, by clamping coefficients above 1 to equal 1, so that _g_ is now _g&prime;_ with [1, 1, 9387/10000, 1, 499/500, 9339/10000] and _h_ is now _h&prime;_ with [1, 593/625, 9633/10000, 4513/5000, 4947/5000, 9473/10000, 4519/5000], and elevate _g&prime;_ for coefficients [1, 1, 14387/15000, 19387/20000, 1499/1500, 59239/60000, 9339/10000], some of the coefficients of _g&prime;_ are less than those of _h&prime;_.  Thus, for this pair of polynomials, clamping the coefficients will destroy the consistency property.

<a id=Which_functions_admit_a_Bernoulli_factory></a>
### Which functions admit a Bernoulli factory?

Let _f_(_&lambda;_) be a function whose domain is the _closed_ closed unit interval or a subset of it, and that maps its domain to the closed unit interval.  The domain of _f_ gives the allowable values of _&lambda;_, which is the input coin's probability of heads.

_f_ admits a Bernoulli factory if and only if _f_ is constant on its domain, or is continuous and _polynomially bounded_ on its domain, as defined later in the section "Proofs for Polynomial-Building Schemes" (Keane and O'Brien 1994\)[^25].

If _f_(_&lambda;_) meets these sufficient conditions, it admits a Bernoulli factory:

- _f_(_&lambda;_) is continuous on the closed unit interval.
- _f_(_&lambda;_) has a minimum of greater than 0 and a maximum of less than 1.

If _f_(_&lambda;_) meets these sufficient conditions, it admits a Bernoulli factory and is Hölder continuous (see "[**Definitions**](#Definitions)"):

- _f_(_&lambda;_) maps the closed unit interval to \[0, 1\].
- _f_(_&lambda;_) is continuous.
- 0 < _f_(_&lambda;_) < 1 whenever 0 < _&lambda;_ < 1.
- _f_(_&lambda;_) is algebraic over rational numbers (that is, there is a nonzero polynomial _P_(_x_, _y_) in two variables and whose coefficients are rational numbers, such that _P_(_x_, _f_(_x_)) = 0 for every _x_ in the domain of _f_).

A [**proof by Reid Barton**](https://mathoverflow.net/a/395018/171320) begins by showing that _f_ is a _semialgebraic function_, so that by a known inequality and the other conditions, it meets the definitions of being Hölder continuous and polynomially bounded.

<a id=Which_functions_don_t_require_outside_randomness_to_simulate></a>
### Which functions don't require outside randomness to simulate?

The function _f_(_&lambda;_) is _strongly simulable_ if it admits a Bernoulli factory algorithm that uses nothing but the input coin as a source of randomness (Keane and O'Brien 1994\)[^25].  See "[**Randomized vs. Non-Randomized Algorithms**](https://peteroupc.github.io/bernoulli.html#Randomized_vs_Non_Randomized_Algorithms)".

**Strong Simulability Statement.** A function _f_(_&lambda;_) is strongly simulable only if&mdash;

1. _f_ is constant on its domain, or is continuous and polynomially bounded on its domain, and
2. _f_ maps the closed unit interval or a subset of it to the closed unit interval, and
3. _f_(0) equals 0 or 1 whenever 0 is in the domain of _f_, and
4. _f_(1) equals 0 or 1 whenever 1 is in the domain of _f_.

Keane and O'Brien already showed that _f_ is strongly simulable if conditions 1 and 2 are true and neither 0 nor 1 are included in the domain of _f_.  Conditions 3 and 4 are required because _&lambda;_ (the probability of heads) can be 0 or 1 so that the input coin returns 0 or 1, respectively, every time.  This is called a "degenerate" coin.  When given just a degenerate coin, no algorithm can produce one value with probability greater than 0, and another value with the opposite probability.  Rather, the algorithm can only produce a constant value with probability 1.  In the Bernoulli factory problem, that constant is either 0 or 1, so a Bernoulli factory algorithm for _f_ must return 1 with probability 1, or 0 with probability 1, when given just a degenerate coin and no outside randomness, resulting in conditions 3 and 4.

To show that _f_ is strongly simulable, it's enough to show that there is a Bernoulli factory for _f_ that must flip the input coin and get 0 and 1 before it uses any outside randomness.

**Proposition 1.** _If f(&lambda;) is described in the strong simulability statement and is a polynomial with computable coefficients, it is strongly simulable._

_Proof:_ If _f_ is the constant 0 or 1, the proof is trivial: simply return 0 or 1, respectively.

Otherwise: Let _a_\[_j_\] be the _j_<sup>th</sup> coefficient of the polynomial in Bernstein form.  Consider the following algorithm, modified from (Goyal and Sigman 2012\)[^17].

1. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.
2. If 0 is in the domain of _f_ and if _j_ is 0, return _f_(0). (By condition 3, _f_(0) must be either 0 or 1.)
3. If 1 is in the domain of _f_ and if _j_ is _n_, return _f_(1). (By condition 4, _f_(1) must be either 0 or 1.)
4. With probability _a_\[_j_\], return 1.  Otherwise, return 0. (For example, generate a uniformly distributed random variate, greater than 0 and less than 1, then return 1 if that variate is less than _a_\[_j_\], or 0 otherwise.  _a_\[_j_\] is the coefficient _j_ of the polynomial written in Bernstein form), or 0 otherwise.

(By the properties of the Bernstein form, _a_\[0\] will equal _f_(0) and _a_\[_n_\] will equal _f_(1) whenever 0 or 1 is in the domain of _f_, respectively.)

Step 4 is done by first generating unbiased bits (such as with the von Neumann trick of flipping the input coin twice until the flip returns 0 then 1 or 1 then 0 this way, then taking the result as 0 or 1, respectively (von Neumann 1951\)[^26]), then using the algorithm in "[**Digit Expansions**](https://peteroupc.github.io/bernoulli.html#Digit_Expansion)" to produce the probability _a_\[_j_\].  The algorithm computes _a_\[_j_\] bit by bit and compares the computed value with the generated bits.  Since the coin returned both 0 and 1 in step 1 earlier in the algorithm, we know the coin isn't degenerate, so that step 4 will finish with probability 1.  Now, since the Bernoulli factory used only the input coin for randomness, this shows that _f_ is strongly simulable. &#x25a1;

**Proposition 2.** _If f(&lambda;) is described in the strong simulability statement, and if either f is constant on its domain or f meets the additional conditions below, then f is strongly simulable._

1. _If f(0) = 0 or f(1) = 0 or both, then there is a polynomial g(&lambda;) in Bernstein form whose coefficients are computable and in the closed unit interval, such that g(0) = f(0) and g(1) = f(1) whenever 0 or 1, respectively, is in the domain of f, and such that g(&lambda;) &gt; f(&lambda;) for every &lambda; in the domain of f, except at 0 and 1._
2. _If f(0) = 1 or f(1) = 1 or both, then there is a polynomial h(&lambda;) in Bernstein form whose coefficients are computable and in the closed unit interval, such that h(0) = f(0) and h(1) = f(1) whenever 0 or 1, respectively, is in the domain of f, and such that h(&lambda;) &lt; f(&lambda;) for every &lambda; in the domain of f, except at 0 and 1._

**Lemma 1.** _If f(&lambda;) is described in the strong simulability statement and meets the additional condition below, then f is strongly simulable._

- _There is a polynomial g(&lambda;) in Bernstein form whose coefficients are computable and in the closed unit interval, such that g(0) = f(0) and g(1) = f(1) whenever 0 or 1, respectively, is in the domain of f, and such that g(&lambda;) &gt; f(&lambda;) for every &lambda; in the domain of f, except at 0 and 1._

_Proof:_  Consider the following algorithm.

1. If _f_ is 0 everywhere in its domain or 1 everywhere in its domain, return 0 or 1, respectively.
2. Otherwise, use the algorithm given in Proposition 1 to simulate _g_(_&lambda;_).  If the algorithm returns 0, return 0. By the additional condition in the lemma, 0 will be returned if _&lambda;_ is either 0 or 1.

    Now, we know that the input coin's probability of heads is neither 0 nor 1.

    By the conditions in the lemma, both _f_(_&lambda;_)>0 and _g_(_&lambda;_)>0 whenever 0 < _&lambda_ < 1 and _&lambda;_ is in _f_'s domain.

    Now let _h_(_&lambda;_) = _f_(_&lambda;_)/_g_(_&lambda;_).  By the conditions in the lemma, _h_ will be positive everywhere in that interval.

3. Return 1 if _h_ has the following property: _h_(_&lambda;_) = 0 whenever 0 < _&lambda;_ < 1 and _&lambda;_ is in _f_'s domain.
4. Otherwise, we run a Bernoulli factory algorithm for _h_(_&lambda;_) that uses the input coin (and possibly outside randomness).  Since _h_ is continuous and polynomially bounded and the input coin's probability of heads is neither 0 nor 1, _h_ is strongly simulable; we can replace the outside randomness in the algorithm with unbiased random bits via the von Neumann trick.

Thus, _f_ admits an algorithm that uses nothing but the input coin as a source of randomness, and so is strongly simulable. &#x25a1;

**Lemma 2.** _If f(&lambda;) is described in the strong simulability statement and meets the additional conditions below, then f is strongly simulable._

1. _There are two polynomials g(&lambda;) and &omega;(&lambda;) in Bernstein form, such that both polynomials' coefficients are computable and all in the closed unit interval._
2. _g(0) = &omega;(0) = f(0) = 0 (so that 0 is in the domain of f)._
3. _g(1) = &omega;(1) = f(1) = 1 (so that 1 is in the domain of f)._
4. _For every &lambda; in the domain of f, except at 0 and 1, g(&lambda;) &gt; f(&lambda;)._
5. _For every &lambda; in the domain of f, except at 0 and 1, &omega;(&lambda;) &lt; f(&lambda;)._

_Proof:_ First, assume _g_ and _&omega;_ have the same degree.  If not, elevate the degree of the polynomial with lesser degree to have the same degree as the other.

Now, let _g_\[_j_\] and _&omega;_\[_j_\] be the _j_<sup>th</sup> coefficient of the polynomial _g_ or _&omega;_, respectively, in Bernstein form.  Consider the following algorithm, which is similar to the algorithm in Proposition 1.

1. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.
2. If 0 is in the domain of _f_ and if _j_ is 0, return _g_(0) = _&omega;_(0) = 0.
3. If 1 is in the domain of _f_ and if _j_ is _n_, return _g_(1) = _&omega;_(1) = 0.
4. Generate a uniformly distributed random variate, greater than 0 and less than 1, then return 1 if that variate is less than _&omega;_\[_j_\], or return 0 if that variate is greater than _g_\[_j_\].  This step is carried out via the von Neumann method, as in Proposition 1.

If the algorithm didn't return a value, then by now we know that the input coin's probability of heads is neither 0 nor 1, since step 2 returned a value (either 0 or 1), which can only happen if the input coin didn't return all zeros or all ones.

Now let _r_(_&lambda;_) = (_f_(_&lambda;_) &minus; _&omega;_(_&lambda;_)) / (_g_(_&lambda;_) &minus; _&omega;_(_&lambda;_)).  By the conditions in the lemma, _h_(_&lambda;_) will be positive wherever 0 < _&lambda;_ < 1 and _&lambda;_ is in the domain of _f_.

Now, run a Bernoulli factory algorithm for _r_(_&lambda;_) that uses the input coin (and possibly outside randomness).  Since _r_ is continuous and polynomially bounded and the input coin's probability of heads is neither 0 nor 1, _r_ is strongly simulable; we can replace the outside randomness in the algorithm with unbiased random bits via the von Neumann trick.

Thus, _f_ admits an algorithm that uses nothing but the input coin as a source of randomness, and so is strongly simulable. &#x25a1;

_Proof of Proposition 2:_  The following cases can occur:

1. If neither 0 nor 1 are in the domain of _f_, then _f_ is strongly simulable by the discussion above.
2. If _f_ is 0 everywhere in its domain or 1 everywhere in its domain: Return 0 or 1, respectively.
3. If 0 but not 1 is in the domain of _f_: If _f_(0) = 0, apply Lemma 1.  If _f_(0) = 1, apply Lemma 1, but take _f_ = 1 &minus; _f_ and return 1 minus the output of the lemma's algorithm (this will bring _f_(0) = 0 and satisfy the lemma.)
4. If 1 but not 0 is in the domain of _f_: If _f_(1) = 0, apply Lemma 1.  If _f_(1) = 1, apply Lemma 1, but take _f_ = 1 &minus; _f_ and return 1 minus the output of the lemma's algorithm (this will bring _f_(1) = 0 and satisfy the lemma.)
5. _f_(0) = _f_(1) = 0: Apply Lemma 1.
6. _f_(0) = _f_(1) = 1: Apply Lemma 1, but take _f_ = 1 &minus; _f_ and return 1 minus the output of the lemma's algorithm.
7. _f_(0) = 0 and _f_(1) = 1: Apply Lemma 2.
8. _f_(0) = 1 and _f_(1) = 0: Apply Lemma 2, but take _f_ = 1 &minus; _f_ and return 1 minus the output of the lemma's algorithm.

&#x25a1;

**Proposition 3.** _If f(&lambda;) is described in the strong simulability statement and is Lipschitz continuous, then f is strongly simulable._

**Lemma 3.** _If f(&lambda;) is described in the strong simulability statement, is Lipschitz continuous, and is such that f(0) = 0 and f(1) = 0 whenever 0 or 1, respectively, is in the domain of f, then f is strongly simulable._

_Proof:_ If _f_ is 0 everywhere in its domain or 1 everywhere in its domain: Return 0 or 1, respectively.  Otherwise, let&mdash;

- _M_ be the Lipschitz constant of _f_ (its derivative's maximum absolute value if _f_ is continuous), or a computable number greater than this.
- _l_ be either 0 if 0 is in the domain of _f_, or 1 otherwise, and
- _u_ be either 0 if 1 is in the domain of _f_, or 1 otherwise.

To build _g_, take its degree as ceil(_M_)+1 or greater (so that _g_'s Lipschitz constant is greater than _M_ and _g_ has ceil(_M_) + 2 coefficients), then set the first coefficient as _l_, the last coefficient as _u_, and the remaining coefficients as 1. (As a result, the polynomial _g_ will have computable coefficients.) Then _g_ will meet the additional condition for Lemma 1 and the result follows from that lemma. &#x25a1;

**Lemma 4.** _If f(&lambda;) is described in the strong simulability statement, is Lipschitz continuous, and is such that f(0) = 0 and f(1) = 1 (so that 0 and 1 are in the domain of f), then f is strongly simulable._

_Proof:_ Let _M_ and _l_ be as in Lemma 3.

To build _g_ and _&omega;_, take their degree as ceil(_M_)+1 or greater (so that their Lipschitz constant is greater than _M_ and each polynomial has ceil(_M_) + 2 coefficients), then for each polynomial, set its first coefficient as _l_ and the last coefficient as 1. The remaining coefficients of _g_ are set as 1 and the remaining coefficients of _&omega;_ are set as 0.  (As a result, the polynomial _g_ will have computable coefficients.)  Then _g_ and _&omega;_ will meet the additional conditions for Lemma 2 and the result follows from that lemma. &#x25a1;

_Proof of Proposition 3:_ In the proof of proposition 2, replace Lemma 1 and Lemma 2 with Lemma 3 and Lemma 4, respectively. &#x25a1;

It is suspected that the conditions in Proposition 2 are necessary and sufficient for _f_(_&lambda;_) to be strongly simulable.

<a id=Multiple_Output_Bernoulli_Factory></a>
### Multiple-Output Bernoulli Factory

A related topic is a Bernoulli factory that takes a coin with unknown probability of heads _&lambda;_ and produces one or more samples of the probability _f_(_&lambda;_).  This section calls it a _multiple-output Bernoulli factory_.

Obviously, any single-output Bernoulli factory can produce multiple outputs by running itself multiple times.  But for some functions _f_, it may be that producing multiple outputs at a time may use fewer input coin flips than producing one output multiple times.

Let _a_ and _b_ be real numbers satisfying 0 < _a_ < _b_ < 1, such as _a_=1/100, _b_=99/100.  Define the _entropy bound_ as _h_(_f_(_&lambda;_))/_h_(_&lambda;_) where _h_(_x_) = &minus;_x_\*ln(_x_)&minus;(1&minus;_x_)\*ln(1&minus;_x_) is related to the Shannon entropy function.  The question is:

_When the probability &lambda; is such that a &le; &lambda; &le; b, is there a multiple-output Bernoulli factory for f(&lambda;) with an expected ("long-run average") number of input coin flips per sample that is arbitrarily close to the entropy bound?  Call such a Bernoulli factory an **optimal factory**._

(See Nacu and Peres (2005, Question 2\)[^1].)

So far, the following functions do admit an _optimal factory_:

- The functions _&lambda;_ and 1 &minus; _&lambda;_.
- Constants in \[0, 1\].  As Nacu and Peres (2005\)[^1] already showed, any such constant _c_ admits an optimal factory: generate unbiased random bits using Peres's iterated von Neumann extractor (Peres 1992\)[^27], then build a binary tree that generates 1 with probability _c_ and 0 otherwise (Knuth and Yao 1976\)[^28].

It is easy to see that if an _optimal factory_ exists for _f_(_&lambda;_), then one also exists for 1 &minus; _f_(_&lambda;_): simply change all ones returned by the _f_(_&lambda;_) factory into zeros and vice versa.

Also, as Yuval Peres (Jun. 24, 2021) told me, there is an efficient multiple-output Bernoulli factory for _f_(_&lambda;_) = _&lambda;_/2: the key is to flip the input coin enough times to produce unbiased random bits using his extractor (Peres 1992\)[^19], then multiply each unbiased bit with another input coin flip to get a sample from _&lambda;_/2.  Given that the sample is equal to 0, there are three possibilities that can "be extracted to produce more fair bits": either the unbiased bit is 0, or the coin flip is 0, or both are 0.

This algorithm, though, doesn't count as an _optimal factory_, and Peres described this algorithm only incompletely.  By simulation and trial and error I found an improved version of the algorithm.  It uses two randomness extractors (extractor 1 and extractor 2) that produce unbiased random bits from biased data (which is done using a method given later in this section).  The extractors must be asymptotically optimal (they must approach the entropy limit as closely as desired); one example is the iterated von Neumann construction in Peres (1992\)[^27].  The algorithm consists of doing the following in a loop until the desired number of outputs is generated.

1. If the number of outputs generated so far is divisible by 20, do the following:
    - Generate an unbiased random bit (see below).  If that bit is zero, output 0, then repeat this step unless the desired number of outputs has been generated.  If the bit is 1, flip the input coin and output the result.
2. Otherwise, do the following:
    1. Generate an unbiased random bit (see below), call it _fc_.  Then flip the input coin and call the result _bc_.
    2. Output _fc_\*_bc_.
    3. (The following steps pass "unused" randomness to the extractor in a specific way to ensure correctness.) If _fc_ is 0, and _bc_ is 1, append 0 to extractor 2's input bits.
    4. If _fc_ and _bc_ are both 0, append 1 then 1 to extractor 2's input bits.
    5. If _fc_ is 1 and _bc_ is 0, append 1 then 0 to extractor 2's input bits.

Inspired by Peres's result with _&lambda;_/2, the following algorithm is proposed.  It works for every function writable as _D_(_&lambda;_)/_E_(_&lambda;_), where&mdash;

- $D$ is the polynomial $D(\lambda)=\sum_{i=0}^k \lambda^i (1-\lambda)^{k-i} d[i]$,
- $E$ is the polynomial $E(\lambda)=\sum_{i=0}^k \lambda^i (1-\lambda)^{k-i} e[i]$,
- every _d_\[_i_\] is less than or equal to the corresponding _e_\[_i_\], and
- each _d_\[_i_\] and each _e_\[_i_\] is a nonnegative integer.

The algorithm is a modified version of the "block simulation" in Mossel and Peres (2005, Proposition 2.5\)[^29], which also "extracts" residual randomness with the help of six asymptotically optimal randomness extractors.  In the algorithm, let _r_ be an integer such that, for every integer _i_ in \[0, _k_], _e_\[_i_\] < choose(_k_, _i_)\*choose(2\*_r_, _r_).

1. Set _iter_ to 0.
2. Flip the input coin _k_ times.  Then build a bitstring _B1_ consisting of the coin flip results in the order they occurred.  Let _i_ be the number of ones in _B1_.
3. Generate 2\*_r_ unbiased random bits (see below).  (Rather than flipping the input coin 2\*_r_ times, as in the algorithm of Proposition 2.5.)  Then build a bitstring _B2_ consisting of the coin flip results in the order they occurred.
4. If the number of ones in _B2_ is other than _r_: Translate _B1_ + _B2_ to an integer under mapping 1, then pass that number to extractor 2<sup>&dagger;</sup>, then add 1 to _iter_, then go to step 2.
5. Translate _B1_ + _B2_ to an integer under mapping 2, call the integer _&beta;_.  If _&beta;_ < _d_\[_i_\], pass _&beta;_ to extractor 3, then pass _iter_ to extractor 6, then output a 1.  Otherwise, if _&beta;_ < _e_\[_i_\], pass _&beta;_ &minus; _d_\[_i_\] to extractor 4, then pass _iter_ to extractor 6, then output a 0.  Otherwise, pass _&beta;_ &minus; _e_\[_i_\] to extractor 5, then add 1 to _iter_, then go to step 2.

The mappings used in this algorithm are as follows:

1. A one-to-one mapping between&mdash;
    - bitstrings of length _k_ + 2\*_r_ with fewer or greater than _r_ ones among the last 2\*_r_ bits, and
    - the integers in [0, 2<sup>_k_</sup> \* (2<sup>2\*_r_</sup> &minus; choose(2\*_r_, _r_))).
2. A one-to-one mapping between&mdash;
    - bitstrings of length _k_ + 2\*_r_ with exactly _i_ ones among the first _k_ bits and exactly _r_ ones among the remaining bits, and
    - the integers in [0, choose(_k_, _i_)\*choose(2\*_r_, _r_)).

In this algorithm, an unbiased random bit is generated as follows.  Let _m_ be an even integer that is 32 or greater (in general, the greater _m_ is, the more efficient the overall algorithm is in terms of coin flips).

1. Use extractor 1 to extract outputs from floor(_n_/_m_)*_m_ inputs, where _n_ is the number of input bits available to that extractor.  Do the same for the remaining extractors.
2. If extractor 2 has at least one unused output bit, take an output and stop.  Otherwise, repeat this step for the remaining extractors.
3. Flip the input coin at least _m_ times, append the coin results to extractor 1's inputs, and go to step 1.

Now consider the last paragraph of Proposition 2.5.  If the input coin were flipped in step 2, the probability of&mdash;

- outputting 1 in the algorithm's last step would be _P1_ = _&lambda;_<sup>_r_</sup>\*(1&minus;_&lambda;_)<sup>_r_</sup>\*_D_(_&lambda;_).
- outputting either 0 or 1 in that step would be _P01_ = _&lambda;_<sup>_r_</sup>\*(1&minus;_&lambda;_)<sup>_r_</sup>\*_E_(_&lambda;_),

so that the algorithm would simulate _f_(_&lambda;_) = _P1_ / _P01_.  Observe that the _&lambda;_<sup>_r_</sup>\*(1&minus;_&lambda;_)<sup>_r_</sup> cancels out in the division.  Thus, we could replace the input coin with unbiased random bits and still simulate _f_(_&lambda;_); the _&lambda;_<sup>_r_</sup>\*(1&minus;_&lambda;_)<sup>_r_</sup> above would then be (1/2)<sup>2\*_r_</sup>.

While this algorithm is coin-flip-efficient, it is not believed to be an optimal factory, at least not without more work.  In particular, a bigger savings of input coin flips could occur if _f_(_&lambda;_) maps each value _a_ or greater and _b_ or less to a small range of values, so that the algorithm could, for example, generate a uniform random variate greater than 0 and less than 1 using unbiased random bits and see whether that variate lies outside that range of values &mdash; and thus produce a sample from _f_(_&lambda;_) without flipping the input coin again.

<small><sup>&dagger;</sup> For example, by translating the number to input bits via Pae's entropy-preserving binarization (Pae 2018\)[^30].  But correctness might depend on how this is done; after all, the number of coin flips per sample must equal or exceed the entropy bound for every _&lambda;_.</small>

<a id=Proofs_for_Polynomial_Building_Schemes></a>
### Proofs for Polynomial-Building Schemes

This section shows mathematical proofs for some of the polynomial-building schemes of this page.

In the following results:

- A _strictly bounded factory function_ means a continuous function on the closed unit interval, with a minimum of greater than 0 and a maximum of less than 1.
- A function _f_(_&lambda;_) is _polynomially bounded_ if both _f_(_&lambda;_) and 1&minus;_f_(_&lambda;_) are greater than or equal to min(_&lambda;_<sup>_n_</sup>, (1&minus;_&lambda;_)<sup>_n_</sup>) for some integer _n_ (Keane and O'Brien 1994\)[^25].
- A _modulus of continuity_ of a function _f_ means a nonnegative and nowhere decreasing function _&omega;_ on the closed unit interval, for which _&omega;_(0) = 0, and for which abs(f(_x_) &minus; f(_y_)) &le; _&omega;_(abs(_x_&minus;_y_)) for every _x_ in the closed unit interval and every _y_ in the closed unit interval.  Loosely speaking, a modulus of continuity _&omega;_(_&delta;_) is greater than or equal to _f_'s maximum range in a window of size _&delta;_.

**Lemma 1.** _Let f(&lambda;) be a continuous and nowhere decreasing function, and let X<sub>k</sub> be a hypergeometric(2\*n, k, n) random variable, where n&ge;1 is a constant integer and k is an integer in [0, 2\*n] .  Then the expected value of f(X<sub>k</sub>/n) decreases nowhere as k increases._

_Proof._ This is equivalent to verifying whether _X_<sub>_m_+1</sub>/_n_ "dominates" _X_<sub>_m_</sub>/_n_ (and, obviously by extension, _X_<sub>_m_+1</sub> "dominates" _X_<sub>_m_</sub>) in terms of first-degree stochastic dominance (Levy 1998\)[^31].   This means that the probability that (_X_<sub>_m_+1</sub> &le; _j_) is less than or equal to that for _X_<sub>_m_</sub> for each _j_ in the closed interval [0, _n_].  A proof of this was given by the user "Henry" of the _Mathematics Stack Exchange_ community[^32]. &#x25a1;

Lemma 6(i) of Nacu and Peres (2005\)[^1] can be applied to continuous functions beyond just Lipschitz continuous functions.  This includes the larger class of _Hölder continuous_ functions (see "[**Definitions**](#Definitions)").

**Lemma 2.** _Let f(&lambda;) be a continuous function that maps the closed unit interval to itself, and let X be a hypergeometric(2\*n, k, n) random variable._

1. _Let &omega;(x) be a modulus of continuity of f.  If &omega; is continuous and concave, then the expression&mdash;<br>abs(**E**[f(X/n)] &minus; f(k/(2\*n))),&nbsp;&nbsp;&nbsp;(1)<br>is less than or equal to&mdash;_
    - _&omega;(sqrt(1/(8\*n&minus;4))), for every integer n&ge;1 that's a power of 2,_
    - _&omega;(sqrt(1/(7\*n))), for every integer n&ge;4 that's a power of 2,_
    - _&omega;(sqrt(1/(2\*n))), for every integer n&ge;1 that's a power of 2, and_
    - _&omega;(sqrt( (k/(2\*n)) \* (1&minus;k/(2\*n)) / (2\*n&minus;1) )), for every n&ge;1 that's a power of 2._
2. _If f is Hölder continuous with Hölder constant M and with Hölder exponent &alpha; such that 0 < &alpha; &le; 1, then the expression (1) is less than or equal to&mdash;_
    - _M\*(1/(2\*n))<sup>&alpha;/2</sup>, for every integer n&ge;1 that's a power of 2,_
    - _M\*(1/(7\*n))<sup>&alpha;/2</sup>, for every integer n&ge;4 that's a power of 2, and_
    - _M\*(1/(8\*n&minus;4))<sup>&alpha;/2</sup>, for every integer n&ge;1 that's a power of 2._
3. _If f has a Lipschitz continuous derivative with Lipschitz constant M, then the expression (1) is less than or equal to&mdash;_
    - _(M/2)\*(1/(7\*n)), for every integer n&ge;4 that's a power of 2, and_
    - _(M/2)\*(1/(8\*n&minus;4)), for every integer n&ge;1 that's a power of 2._
4. _If f is convex, nowhere decreasing, and greater than or equal to 0, then the expression (1) is less than or equal to **E**[f(Y/n)] for every integer n&ge;1 that's a power of 2, where Y is a hypergeometric(2*n, n, n) random variable._

_Proof._

1. _&omega;_ is assumed to be nonnegative because absolute values are nonnegative.  To prove the first and second bounds: abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_))) &le; **E**[abs(_f_(_X_/_n_) &minus; _f_(_k_/(2 \* _n_))] &le; **E**\[_&omega;_(abs(_X_/_n_ &minus; _k_/(2 \* _n_))] &le; _&omega;_(**E**[abs(_X_/_n_ &minus; _k_/(2 \* _n_))]) (by Jensen's inequality and because _&omega;_ is concave) &le; _&omega;_(sqrt(**E**[abs(_X_/_n_ &minus; _k_/(2 \* _n_))]<sup>2</sup>)) = _&omega;_(sqrt(**Var**[_X_/_n_])) = _&omega;_(sqrt((_k_\*(2 \* _n_&minus;_k_)/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)))) &le; _&omega;_(sqrt((_n_<sup>2</sup>/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)))) = _&omega;_(sqrt((1/(8\*_n_&minus;4)))) = _&rho;_, and for every _n_&ge;4 that's an integer power of 2, _&rho;_ &le; _&omega;_(sqrt(1/(7\*_n_))).  To prove the third bound: abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_))) &le; _&omega;_(sqrt(**Var**[_X_/_n_])) &le; _&omega;_(sqrt(1/(2\*n))).  To prove the fourth bound: abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_))) &le; _&omega;_(sqrt((_n_<sup>2</sup>/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)))) = _&omega;_(sqrt( (_k_/(2\*_n_)) \* (1&minus;_k_/(2\*_n_)) / (2\*_n_&minus;1) )).
2. By the definition of Hölder continuous functions, take _&omega;_(_x_) = _M_\*_x_<sup>_&alpha;_</sup>.  Because _&omega;_ is a concave modulus of continuity on the closed unit interval, the result follows from part 1.
3. (Much of this proof builds on Nacu and Peres 2005, Proposition 6(ii)[^1].) The expected value (see note 1) of $X$ is $E[X/n]=k/(2n)$. Since $E[X/n-k/(2n)] = 0$, it follows that $f'(X/n) E(X/n-k/(2n)) = 0$.  Moreover, $|f(x)-f(s)-f'(x)(x-s)|\le (M/2)(x-s)^2$ (see Micchelli 1973, Theorem 3.2)[^6], so&mdash; $$E[|f(X/n)-f(k/(2n))|]=|E[f(X/n)-f(k/(2n))-f'(k/(2n))(X/n-k/(2n))]|$$ $$\le (M/2)(X/n-k/(2n))^2 \le (M/2) Var(X/n).$$  By part 1's proof, it follows that (_M_/2)\***Var**[_X_/_n_] = (_M_/2)\*(_k_\*(2 \* _n_&minus;_k_)/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)) &le; (_M_/2)\*(_n_<sup>2</sup>/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)) = (_M_/2)\*(1/(8\*_n_&minus;4)) = _&rho;_.  For every integer _n_&ge;4 that's a power of 2, _&rho;_ &le;  (_M_/2)\*(1/(7\*_n_)).
4. Let _X_<sub>_m_</sub> be a hypergeometric(2 \* _n_, _m_, _n_) random variable.  By Lemma 1 and the assumption that _f_ is nowhere decreasing, **E**[_f_(_X_<sub>_k_</sub>/_n_)] is nowhere decreasing as _k_ increases, so take **E**[_f_(_X_<sub>_n_</sub>/_n_)] = **E**[_f_(_Y_</sub>/_n_)] as the upper bound.  Then, abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_))) = abs(**E**[_f_(_X_/_n_)] &minus; _f_(**E**[_X_/_n_])) = **E**[_f_(_X_/_n_)] &minus; _f_(**E**\[_X_/_n_\]) (by Jensen's inequality, because _f_ is convex and not less than 0) = **E**\[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_)) &le; **E**\[_f_(_X_/_n_)\] (because _f_ is not less than 0) &le; **E**[_f_(_Y_/_n_)]. &#x25a1;

> **Notes:**
>
> 1. **E**[.] means expected value ("long-run average"), and **Var**[.] means variance.  A hypergeometric(2 \* _n_, _k_, _n_) random variable is the number of "good" balls out of _n_ balls taken uniformly at random, all at once, from a bag containing 2 \* _n_ balls, _k_ of which are "good".
> 2. Parts 1 through 3 exploit a tighter bound on **Var**[_X_/_n_] than the bound given in Nacu and Peres (2005, Lemma 6(i) and 6(ii), respectively\)[^1].  However, for technical reasons, different bounds are proved for different ranges of integers _n_.
> 3. All continuous functions that map the closed unit interval to itself, including all of them that admit a Bernoulli factory, have a modulus of continuity.  The proof of part 1 remains valid even if _&omega;_(0) > 0, because the bounds proved remain correct even if _&omega;_ is overestimated.  The following functions have a simple _&omega;_ that satisfies the lemma:
>     1. If _f_ is strictly increasing and convex, _&omega;_(_x_) can equal _f_(1) &minus; _f_(1&minus;_x_) (Gal 1990\)[^33]; (Gal 1995\)[^34].
>     2. If _f_ is strictly decreasing and convex, _&omega;_(_x_) can equal _f_(0) &minus; _f_(_x_) (Gal 1990\)[^33]; (Gal 1995\)[^34].
>     3. If _f_ is strictly increasing and concave, _&omega;_(_x_) can equal _f_(_x_) &minus; _f_(0) (by symmetry with 2).
>     4. If _f_ is strictly decreasing and concave, _&omega;_(_x_) can equal _f_(1&minus;_x_) &minus; _f_(1) (by symmetry with 1).
>     5. If _f_ is concave and is strictly increasing then strictly decreasing, then _&omega;_(_h_) can equal (_f_(min(_h_, _&sigma;_))+(_f_(1&minus;min(_h_, 1&minus;_&sigma;_))&minus;_f_(1)), where _&sigma;_ is the point where _f_ stops increasing and starts decreasing (Anastassiou and Gal 2012\)[^35].

**Theorem 1.** _Let $f$ be a strictly bounded factory function, let $n_0\ge 1$ be an integer, and let $\phi(n)$ be a function that takes on a nonnegative value.  Suppose $f$ is such that the expression (1) in Lemma 2 is less than or equal to $\phi(n)$ whenever $n\ge n_0$ is an integer power of 2.  Let&mdash;_

$$\eta(n)=\sum_{k\ge \log_2(n)} \phi(2^k),$$

_for every integer n&ge;1 that's a power of 2.  If the infinite series &eta;(n) converges to a finite value for each such $n$, and if it converges to 0 as $n$ gets large, then the following scheme for f(&lambda;) is valid in the following sense:_

_There are polynomials $g_n$ and $h_n$ (where $n\ge 1$ is an integer power of 2) as follows. The $k$-th Bernstein coefficient of $g_n$ and $h_n$ is **fbelow**(n, k) and **fabove**(n, k), respectively (where $0\le k\le n$), where:_

_If $n_0 = 1$:_

- _**fbelow**(n, k) =_ $f(k/n)-\eta(n)$.
- _**fabove**(n, k) =_ $f(k/n)+\eta(n)$.

_If $n_0 > 1$:_

- _**fbelow**(n, k) =_ min(**fbelow**($n_0$,0), **fbelow**($n_0$,1), ..., **fbelow**($n_0$,$n_0$)) _if_ $n < n_0$; $f(k/n)-\eta(n)$ _otherwise._
- _**fabove**(n, k) =_ max(**fabove**($n_0$,0), **fabove**($n_0$,1), ..., **fbelow**($n_0$,$n_0$)) _if_ $n < n_0$; $f(k/n)+\eta(n)$ _otherwise._

_The polynomials $g_n$ and $h_n$ satisfy:_

1. _$g_n \le h_n$._
2. _$g_n$ and $h_n$ converge to $f$ as $n$ gets large._
3. $(g_{n+1}-g_n)$ _and_ $(h_{n}-h_{n+1})$ _are polynomials with nonnegative Bernstein coefficients once they are rewritten to polynomials in Bernstein form of degree exactly $n+1$._

_Proof._ For simplicity, this proof assumes first that $n_0 = 1$.

For the series _&eta;_(_n_) in the theorem, because $\phi(n)$ is nonnegative, each term of the series is nonnegative making the series nonnegative and, by the assumption that the series converges, _&eta;_(_n_) is nowhere increasing with increasing _n_.

Item 1 is trivial.  If $n\ge n_0$, $g_n$ is simply the Bernstein polynomial of $f$ minus a nonnegative value, and $h_n$ is the Bernstein polynomial of $f$ plus that same value, and if $n$ is less than $n_0$, $g_n$ is a constant value not less than the lowest point reachable by the lower polynomials, and $h_n$ is a constant value not less than the highest point reachable by the upper polynomials.

Item 2 is likewise trivial. A well known result is that the Bernstein polynomials of $f$ converge to $f$ as their degree $n$ gets large.  And because the series _&eta;_ (in Theorem 1) sums to a finite value that goes to 0 as $n$ increases, the upper and lower shifts will converge to 0 so that $g_n$ and $h_n$ converge to the degree-$n$ Bernstein polynomials and thus to $f$.

Item 3 is the _consistency requirement_ described earlier in this page. This is ensured as in Proposition 10 of Nacu and Peres (2005)[^1] by bounding, from below, the offset by which to shift the approximating polynomials.  This lower bound is _&eta;_(_n_), a solution to the equation 0 = _&eta;_(_n_) &minus; _&eta;_(2 \* _n_) &minus; _&phi;_(_n_) (see note below), where _&phi;_(_n_) is a function that takes on a nonnegative value.

_&phi;_(_n_) is, roughly speaking, the minimum distance between one polynomial and the next so that the consistency requirement is met between those two polynomials.  Compare the assumptions on _&phi;_ in Theorem 1 with equations (10) and (11) in Nacu and Peres (2005).

The solution for $\eta(n)$ given in the statement of the theorem is easy to prove by noting that this is a recursive process: we start by calculating the series for _n_ = 2\*_n_, then adding _&phi;_(_n_) to it (which will be positive), in effect working backwards and recursively, and we can easily see that we can calculate the series for _n_ = 2\*_n_ only if the series converges, hence the assumption of a converging series.

Now to prove the result assuming that $n_0 > 1$.

Then we can take advantage of the observation in Remark B of Nacu and Peres (2005)[^1] that we can start defining the polynomials at any $n$ greater than 0, including $n = n_0$; in that case, the upper and lower polynomials of degree 1 or greater, but less than $n_0$, would be constant functions, so that as polynomials in Bernstein form, the coefficients of each one would be equal. The lower constants are no greater than $g_{n_0}$'s lowest Bernstein coefficient, and the upper constants are no less than $g_{n_0}$'s highest Bernstein coefficients; they meet Item 3 because these lower and upper constants, when elevated to degree $n_0$, have Bernstein coefficients that are still no greater or no less, respectively, than the corresponding degree-$n_0$ polynomial. With the _&phi;_ given in this theorem, the series _&eta;_(_n_) in the theorem remains nonnegative.  Moreover, since _&eta;_ is assumed to converge, _&eta;_(_n_) still decreases with increasing _n_. &#x25a1;

> **Notes:**
>
> 1. There is only one solution _&eta;_(_n_) in the case at hand.  Unlike so-called [**_functional equations_**](https://math.stackexchange.com/questions/3993739) and linear recurrences, with a solution that varies depending on the starting value, there is only one solution in the case at hand, namely the solution that makes the series converge, if it exists at all.  Alternatively, the equation can be expanded to 0 = _&eta;_(_n_) &minus; _&eta;_(4 \* _n_) &minus; _&phi;_(2\*_n_) &minus; _&phi;_(_n_) = _&eta;_(_n_) &minus; _&eta;_(8 \* _n_) &minus; _&phi;_(4\*_n_) &minus; _&phi;_(2\*_n_) &minus; _&phi;_(_n_) = ...
> 2. $\log_2(n)$ is the number $x$ such that $2^x = n$.

**Proposition 1A.** _If a scheme satisfies Theorem 1, the polynomials $g_n$ and $h_n$ in the scheme can be made to satisfy conditions (i), (iii), and (iv) of Proposition 3 of Nacu and Peres (2005)[^1] as follows:_

- $g_n$ = $g_{n-1}$ _and_ $h_n$ = $h_{n-1}$ _whenever $n$ is an integer greater than 1 and not a power of 2._
- _If **fabove**(n, k) > 1 for a given $n$ and some $k$, the coefficients of $h_n$ (the upper polynomial) are all 1._
- _If **fbelow**(n, k) < 0 for a given $n$ and some $k$, the coefficients of $g_n$ (the lower polynomial) are all 0._

_Proof:_ Condition (i) of Proposition 3 says that each coefficient of the polynomials must be 0 or greater and 1 or less.  This is ensured starting with a large enough value of _n_ greater than 0 that's a power of 2, call it _n_<sub>1</sub>, as shown next.

Let _&epsilon;_ be a positive distance between 0 and the minimum or between 1 and the maximum of _f_, whichever is smaller.  This _&epsilon;_ exists by the assumption that _f_ is bounded away from 0 and 1. Because the series _&eta;_ (in Theorem 1) sums to a finite value that goes to 0 as $n$ increases, _&eta;_(_n_) will eventually stay less than _&epsilon;_.  And if $n\ge n_0$ is a power of 2 (where $n_0$ is as in Theorem 1), the `f(k/n)` term is bounded by the minimum and maximum of _f_ by construction. This combined means that the lower and upper polynomials' Bernstein coefficients will eventually be bounded by 0 and 1 for every integer _n_ starting with _n_<sub>1</sub>.

For _n_ less than _n_<sub>1</sub>, condition (i) is ensured by setting the lower or upper polynomial's coefficient to 0 or 1, respectively, whenever a coefficient of the degree-_n_ polynomial would otherwise be less than 0 or greater than 1, respectively.

Condition (iii) of Proposition 3 is mostly ensured by item 2 of Theorem 1.  The only thing to add is that for $n$ less than _n_<sub>1</sub>, the lower and upper polynomials $g_n$ and $h_n$ can be treated as 0 or 1 without affecting convergence, and that for $n$ other than a power of 2, defining $g_n = g_{n-1}$ and $h_n = h_{n-1}$ maintains condition (iii) by Remark B of Nacu and Peres (2005)[^1].

Condition (iv) of Proposition 3 is mostly ensured by item 3 of Theorem 1.  For _n_=_n_<sub>1</sub>, condition (iv) is maintained by noting that the degree-_n_<sub>1</sub> polynomial's coefficients must be bounded by 0 and 1 by condition (i) so they will likewise be bounded by those of the lower and upper polynomials of degree less than _n_<sub>1</sub>, and those polynomials are the constant 0 and the constant 1, respectively, as are their coefficients. Finally, for $n$ other than a power of 2, defining $g_n = g_{n-1}$ and $h_n = h_{n-1}$ maintains condition (iv) by Remark B of Nacu and Peres (2005)[^1].  &#x25a1;

**Corollary 1.** _Let f(&lambda;) be a strictly bounded factory function. If that function is Hölder continuous with Hölder constant M and Hölder exponent &alpha;, then the following scheme determined by **fbelow** and **fabove** is valid in the sense of Theorem 1:_

- _**fbelow**(n, k) = f(k/n) &minus; D(n)._
- _**fabove**(n, k) = f(k/n) + D(n)._

_Where_ $D(n)=\frac{M}{((2^{\alpha/2}-1) n^{\alpha/2}}$.

_Or:_

- _**fbelow**(n, k) = min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if n < 4; otherwise, f(k/n) &minus; &eta;(n)._
- _**fabove**(n, k) = max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if n < 4; otherwise, f(k/n) + &eta;(n)._

_Where &eta;(n) = M\*(2/7)<sup>&alpha;/2</sup>/((2<sup>&alpha;/2</sup>&minus;1)\*n<sup>&alpha;/2</sup>)._

_Proof._ Because $f$ is Hölder continuous, it admits the modulus of continuity $\omega(x)=Mx^{\alpha}$.  By part 1 of lemma 2:

- For each integer $n\ge 1$ that's a power of 2 ($n_0=1$ in Theorem 1), $\phi(n)=\omega(\sqrt{1/(2n)})=M (1/(2n))^{\alpha/2}$ can be taken for each such integer $n$, and thus $\eta(n)=D(n)=\frac{M}{((2^{\alpha/2}-1) n^{\alpha/2}}$ (where $\eta(n)$ is as in Theorem 1).
- For each integer $n\ge 4$ that's a power of 2 ($n_0=4$ in Theorem 1), $\phi(n)=\omega(\sqrt{1/(2n)})=M (1/(7n))^{\alpha/2}$ can be taken for each such integer $n$, and thus $\eta(n)=$ M\*(2/7)<sup>&alpha;/2</sup>/((2<sup>&alpha;/2</sup>&minus;1)\*n<sup>&alpha;/2</sup>).

In both cases $\eta(n)$ is finite and converges to 0 as $n$ increases.

The result then follows from Theorem 1. &#x25a1;

> **Note:** For specific values of _&alpha;_, the equation _D_(_n_) = _D_(2 \* _n_) + _&phi;_(_n_) can be solved via linear recurrences; an example for _&alpha;_ = 1/2 is the following code in Python that uses the SymPy computer algebra library: `rsolve(Eq(f(n),f(n+1)+z*(1/(2*2**n))**((S(1)/2)/2)),f(n)).subs(n,ln(n,2)).simplify()`.  Trying different values of _&alpha;_ suggested the following formula for Hölder continuous functions with _&alpha;_ of 1/_j_ or greater: (_M_\* $\sum_{i=0}^{2j-1} 2^{i/(2j)})/_n_<sup>1/(2\*_j_)</sup> = _M_ / ((2<sup>1/(2\*_j_)</sup>&minus;1)\*_n_<sup>1/(2\*_j_)</sup>); and generalizing the latter expression led to the term in the theorem.

**Corollary 2.** _Let f(&lambda;) be a strictly bounded factory function.  If that function is Lipschitz continuous with Lipschitz constant M, then the following scheme determined by **fbelow** and **fabove** is valid in the sense of Theorem 1:_

- _**fbelow**(n, k) = f(k/n) &minus; M/((sqrt(2)&minus;1)\*sqrt(n))._
- _**fabove**(n, k) = f(k/n) + M/((sqrt(2)&minus;1)\*sqrt(n))._

_Or:_

- _**fbelow**(n, k) = min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if n < 4; otherwise, f(k/n) &minus; M\*sqrt(2/7)/((sqrt(2)&minus;1)\*sqrt(n))._
- _**fabove**(n, k) = max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if n < 4; otherwise, f(k/n) + M\*sqrt(2/7)/((sqrt(2)&minus;1)\*sqrt(n))._

_Proof._ Because Lipschitz continuous functions are Hölder continuous with Hölder constant _M_ and exponent 1, the result follows from Corollary 1. &#x25a1;

> **Note:** The first scheme given here is a special case of Theorem 1 that was already found by Nacu and Peres (2005\)[^1].

**Corollary 3.** _Let f(&lambda;) be a strictly bounded factory function. If that function has a Lipschitz continuous derivative with Lipschitz constant L, then the following scheme determined by **fbelow** and **fabove** is valid in the sense of Theorem 1:_

- _**fbelow**(n, k) = min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if n < 4; otherwise, f(k/n) &minus; L/(7\*n)._
- _**fabove**(n, k) = max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if n < 4; otherwise, f(k/n) + L/(7\*n)._

_Proof._ By part 3 of lemma 2, for each integer $n\ge 4$ that's a power of 2 ($n_0=4$ in Theorem 1), $\phi(n)=(L/2) (1/(7n))$ can be taken for each such integer $n$, and thus $\eta(n)=L/(7n)$ (where $\eta(n)$ is as in Theorem 1). $\eta(n)$ is finite and converges to 0 as $n$ increases. The result then follows from Theorem 1. &#x25a1;

> **Note:** Nacu and Peres (2005\)[^1] already proved a looser scheme in the case when $f$ has a second derivative on the closed unit interval that is not greater than a constant \(a slightly stronger condition than having a Lipschitz continuous derivative on that domain).

**Theorem 2.** _Let f(&lambda;) be a strictly bounded factory function.  If that function is convex and nowhere decreasing, then Theorem 1 remains valid with &phi;(n) = **E**\[f(Y/n)\] (where Y is a hypergeometric(2*n, n, n) random variable), rather than as given in that theorem._

_Proof._  Follows from Theorem 1 and part 4 of Lemma 2 above. With the _&phi;_ given in this theorem, the series _&eta;_(_n_) in Theorem 1 remains nonnegative; also, this theorem adopts Theorem 1's assumption that the series converges, so that _&eta;_(_n_) still decreases with increasing _n_. &#x25a1;

**Proposition 1.**

1. _Let f be as given in Theorem 1 or 2 or Corollary 1 to 3, except that f must be concave and polynomially bounded and may have a minimum of 0. Then the schemes of those results remain valid if **fbelow**(n, k) = f(k/n), rather than as given in those results._
2. _Let f be as given in Theorem 1 or 2 or Corollary 1 to 3, except that f must be convex and polynomially bounded and may have a maximum of 1.  Then the schemes of those results remain valid if **fabove**(n, k) = f(k/n), rather than as given in those results._
3. _Theorems 1 and 2 and Corollaries 1 to 3 can be extended to all integers n&ge;1, not just those that are powers of 2, by defining&mdash;_

    - _**fbelow**(n, k) = (k/n)\***fbelow**(n&minus;1, max(0, k&minus;1)) + ((n&minus;k)/n)\***fbelow**(n&minus;1, min(n&minus;1, k)), and_
    - _**fabove**(n, k) = (k/n)\***fabove**(n&minus;1, max(0, k&minus;1)) + ((n&minus;k)/n)\***fabove**(n&minus;1, min(n&minus;1, k)),_

    _for every integer n&ge;1 other than a power of 2. Parts 1 and 2 of this proposition still apply to the modified scheme._

_Proof._ Parts 1 and 2 follow from Theorem 1 or 2 or Corollary 1 to 3, as the case may be.  For part 1, the lower polynomials are replaced by the degree-_n_ Bernstein polynomials of _f_, and they meet the conditions in those theorems by Jensen's inequality.  For part 2, the upper polynomials are involved instead of the lower polynomials.  Part 3 also follows from Remark B of Nacu and Peres (2005\)[^1]. &#x25a1;

The following lemma shows that if a scheme for $f(\lambda)$ shifts polynomials upward and downward, the pre-shifted polynomials are close to $f(\lambda)$ by the amount of the shift.

**Lemma 3.** _Let $f$ be a strictly bounded factory function. Let $S$ be an infinite set of positive integers.  For each integer $n\ge 1$, let $W_n(\lambda)$ be a function, and let $\epsilon_n(f,\lambda)$ be a nonnegative function.  Suppose that there are polynomials $g_n$ and $h_n$ (for each $n$ in $S$) as follows:_

1. _$g_n$ and $h_n$ have Bernstein coefficients $W_n(k/n) - \epsilon_n(f,\lambda)$ and $W_n(k/n) + \epsilon_n(f,\lambda)$, respectively ($0\le k\le n$)._
2. _$g_n \le h_n$._
3. _$g_n$ and $h_n$ converge to $f$ as $n$ gets large._
4. $(g_{m}-g_n)$ _and_ $(h_{n}-h_{m})$ _are polynomials with nonnegative Bernstein coefficients once they are rewritten to polynomials in Bernstein form of degree exactly $m$, where $m$ is the smallest number greater than $n$ in $S$._

_Then for each $n$ in $S$, $|f(\lambda) - B_n(W_n(\lambda))| \le \epsilon_n(f,\lambda)$ whenever $0\le \lambda\le 1$, where $B_n(W_n(\lambda))$ is the Bernstein polynomial of degree $n$ of the function $W_n(\lambda)$._

_Proof:_ $W_n(k/n)$ is the $k$-th Bernstein coefficient of $B_n(W_n(\lambda))$, which is $g_n$ and $h_n$ before they are shifted downward and upward, respectively, by $\epsilon_n(f,\lambda)$.  Moreover, property 4 in the lemma corresponds to condition (iv) of Nacu and Peres (2005)[^1], which implies that, for every $m>n$, $g_{n}(\lambda)\le g_{m}(\lambda)\le f(\lambda)$ (the lower polynomials "increase") and $h_{n}(\lambda)\ge h_{m}\ge f(\lambda)$ (the upper polynomials "decrease") for every $n\ge 1$ (Nacu and Peres 2005, Remark A)[^1].

Then if $B_n(W_n(\lambda)) < f(\lambda)$ for some $\lambda$ in the closed unit interval, shifting the left-hand side upward by $\epsilon_n(f,\lambda)$ (a nonnegative function) means that $h_n = B_n(W_n(\lambda))+\epsilon_n(f,\lambda) \ge f(\lambda)$, and rearranging this expression leads to $f(\lambda) - B_n(W_n(\lambda)) \le \epsilon_n(f,\lambda)$.

Likewise, if $B_n(W_n(\lambda)) > f(\lambda)$ for some $\lambda$ in the closed unit interval, shifting the left-hand side downward by $\epsilon_n(f,\lambda)$ means that $g_n = B_n(W_n(\lambda))-\epsilon_n(f,\lambda) \le f(\lambda)$, and rearranging this expression leads to $B_n(W_n(\lambda)) - f(\lambda) \le \epsilon_n(f,\lambda)$.

This combined means that $|f(x) - B_n(W_n(\lambda))| \le \epsilon_n(f,\lambda)$ whenever $0\le \lambda\le 1$.  &#x25a1;

**Corollary 4**.  _If $f(\lambda)$ satisfies a scheme given in Theorem 1 with $n_0\ge 1$, then $B_n(f(\lambda))$ comes within $\eta(n)$ of $f$ for every integer $n\ge n_0$ that's a power of 2; that is, $|B_n(f(\lambda))| \le \eta(n)$ for every such $n$._

<a id=A_Conjecture_on_Polynomial_Approximation></a>
#### A Conjecture on Polynomial Approximation

The following conjecture suggests there may be a way to easily adapt other approximating polynomials, besides the ordinary Bernstein polynomials, to the Bernoulli factory problem.

**Conjecture.**

Let $r\ge 1$, and let $f$ be a strictly bounded factory function whose $r$-th derivative is continuous.  Let $M$ be the maximum absolute value of $f$ and its derivatives up to the $r$-th derivative. Let $W_{2^0}(\lambda), W_{2^1}(\lambda), ..., W_{2^n}(\lambda),...$ be a sequence of functions on the closed unit interval that converge uniformly to $f$ (that is, for every tolerance level, all $W_{2^i}$ after some value $i$ are within that tolerance level of $f$ at all points on the closed unit interval).

For each integer $n\ge1$ that's a power of 2, suppose that there is $D>0$ such that&mdash; $$|f(\lambda)-B_n(W_n(\lambda))| \le DM/n^{r/2},$$ whenever $0\le \lambda\le 1$, where $B_n(W_n(\lambda))$ is the degree-$n$ Bernstein polynomial of $W_n(\lambda)$.

Then there is $C_0\ge D$ such that for every $C\ge C_0$, there are polynomials $g_n$ and $h_n$ (for each $n\ge 1$) as follows:

1. $g_n$ and $h_n$ have Bernstein coefficients $W_n(k/n) - CM/n^{r/2}$ and $W_n(k/n) + CM/n^{r/2}$, respectively ($0\le k\le n$), if $n$ is a power of 2, and $g_n=g_{n-1}$ and $h_n=h_{n-1}$ otherwise.
2. $g_n$ and $h_n$ converge to $f$ as $n$ gets large.
3. $(g_{n+1}-g_{n})$ and $(h_{n}-h_{n+1})$ are polynomials with nonnegative Bernstein coefficients once they are rewritten to polynomials in Bernstein form of degree exactly $n+1$.

Equivalently (see also Nacu and Peres 2005), there is $C_1>0$ such that, for each integer $n\ge 1$ that's a power of 2&mdash; $$\left|\left(\sum_{i=0}^k \left(W_n\left(\frac{i}{n}\right)\right) {n\choose i}{n\choose {k-i}}/{2n \choose k}\right)-W_{2n}\left(\frac{k}{2n}\right)\right|\le \frac{C_1 M}{n^{r/2}},$$ whenever $0\le k\le 2n$, so that $C=\frac{C_1}{1-\sqrt{2/2^{r+1}}}$.

It is further conjectured that the same value of $C_0$ (or $C_1$) suffices when $f$ has a Lipschitz continuous $(r-1)$-th derivative and $M$ is the maximum absolute value of $f$ and the Lipschitz constants of $f$ and its derivatives up to the $(r-1)$-th derivative.

> **Note:** By Lemma 3, $B_n(W_n(f(\lambda)))$ would be close to $f(\lambda)$ by at most $C_0 M/n^{r/2}$.  Properties 2 and 3 above correspond to (iii) and (iv) in Nacu and Peres (2005, Proposition 3\)[^1].

---------------------

The following lower bounds on $C_0$ can be shown.  In the table:

- $M_{0,r}$ is the maximum absolute value of $f(\lambda)$ and its $r$-th derivative (Güntürk and Li 2021)[^8].
- $M_{1,r}$ is the maximum absolute value of $f(\lambda)$ and its derivatives up to the $r$-th derivative.  Thus, $M_{1,r}\ge M_{0,r}$.
- The bounds are valid only if $n$ is a power-of-two integer and, unless otherwise specified, only if $n\ge 1$.

&nbsp;

| If $r$ is... | And... | And $W_n$ is... | Then $C_0$ must be greater than: | And $C_0$ is conjectured to be: | Because of this counterexample: |
 --- | --- | --- | --- | --- | --- |
| 3 | $M=M_{0,3}$ | $2 f - B_n(f)$\* | 2.62 | 2.63 | $2 \lambda \left(1 - \lambda\right)$ |
| 3 | $M=M_{0,3}$, $n\ge 4$ | $2 f - B_n(f)$ | 0.66 | 0.67 | $2\lambda(1-\lambda)$ |
| 4 | $M=M_{0,4}$ | $2 f - B_n(f)$ | 3.58 | 3.59 | $3 \lambda^{2} \cdot \left(1 - \lambda\right)$ |
| 4 | $M=M_{0,4}$, $n\ge 4$ | $2 f - B_n(f)$ | 3.52 | 3.53 | $\lambda^{2} \cdot \left(1 - \lambda\right)$ |
| 3 | $M=M_{1,3}$ | $2 f - B_n(f)$ | 0.29 | $\frac{3}{16-4 \sqrt{2}}$ &lt; 0.29005.\*\* | $2 \lambda \left(1 - \lambda\right)$ |
| 3 | $M=M_{1,3}$, $n\ge 4$ | $2 f - B_n(f)$ | 0.08 | 0.09 | $2 \lambda \left(1 - \lambda\right)$ |
| 4 | $M=M_{1,4}$ | $2 f - B_n(f)$ | 0.24 | 0.25 | $2 \lambda \left(1 - \lambda\right)$ |
| 4 | $M=M_{1,4}$, $n\ge 4$ | $2 f - B_n(f)$ | 0.14 | 0.15 | $2 \lambda \left(1 - \lambda\right)$ |
| 5 | $M=M_{1,5}$ | $B_n(B_n(f))+3(f-B_n(f))$\*** | 0.26 | 0.27 | $2 \lambda \left(1 - \lambda\right)$ |
| 5 | $M=M_{1,5}$, $n\ge 4$ | $B_n(B_n(f))+3(f-B_n(f))$ | 0.10 | 0.11 | $3 \lambda^{2} \cdot \left(1 - \lambda\right)$ |
| 6 | $M=M_{1,6}$ | $B_n(B_n(f))+3(f-B_n(f))$ | 0.24 | 0.25 | $2 \lambda \left(1 - \lambda\right)$ |
| 6 | $M=M_{1,6}$, $n\ge 4$ | $B_n(B_n(f))+3(f-B_n(f))$ | 0.22 | 0.23 | $3 \lambda^{2} \cdot \left(1 - \lambda\right)$ |

\* Corresponds to the iterated Bernstein polynomial of order 2 (Güntürk and Li 2021)[^8].

\*\*\* Corresponds to the iterated Bernstein polynomial of order 3 (Güntürk and Li 2021)[^8].

\*\* The following is evidence for the conjectured bound, at least if $f(0)=f(1)$.

The Bernstein polynomials $B_n(f)$ satisfy the partition-of-unity property: $\sum_{k=0}^n (c+f(k/n)) p_{n,k} = c+\sum_{k=0}^n f(k/n) p_{n,k}$ for every $c$, where $\sum_{k=0}^n p_{n,k}=1$.  So do the hypergeometric probabilities $\sigma_{n,k,i} = {n\choose i}{n\choose {k-i}}/{2n \choose k}$.  Thus, rewrite $\sum_{k=0}^n (c+W_n(i/n)) \sigma_{n,k,i}$ = $\sum_{k=0}^n (2 (c+f) - B_n(c+f)) \sigma_{n,k,i}$ = $\sum_{k=0}^n (2c + 2f - c - B_n(f)) \sigma_{n,k,i}$ = $\sum_{k=0}^n (c + 2f - B_n(f)) \sigma_{n,k,i}$ = $c + \sum_{k=0}^n W_n(i/n) \sigma_{n,k,i}$.  And rewrite $c + \sum_{k=0}^n W_n(i/n) \sigma_{n,k,i} - (c+W_{2n}(k/(2n))) = \sum_{k=0}^n W_n(i/n) \sigma_{n,k,i} - W_{2n}(k/(2n))$. Thus, when $W_n = 2f-B_n(f)$, $f(0)$ can equal 0 without loss of generality.

Suppose $f(0) = f(1) = 0$, then $W_1(f)$ will equal 0.  Let $X$ be a hypergeometric(2,k,1) random variable (for $k$ equal to 0, 1, or 2). Then $E[f(X/1)]$ will likewise equal 0.  Thus, since $W_n(f)(0)=f(0)$ and $W_n(f)(1)=f(1)$ for every $n$, and since $W_2(f)(1/2) = 2f(1/2) - B_2(f)(1/2)$ (and thus considers only the values of $f$ at 0, 1/2, and 1), $|E[f(X/1)] - f(k/2)|$ will take its maximum at $k=1$, namely $|0 - (2f(1/2) - B_2(f)(1/2))| = |- 3f(1/2)/2|$. That right-hand side is the minimum shift needed for the consistency requirement to hold; call it $z$, and let $y$ be $M_{1,3}$. To get the minimum $C_0$ that works, solve $C_0 y/1^{3/2} - C_0 y/2^{3/2}$ = z for $C_0$.  The solution is&mdash; $$C_0=\frac{z}{y} \frac{4}{4-\sqrt{2}} = \frac{|0-f(1/2)|}{y} \frac{12}{2\cdot (4-\sqrt{2})}.$$

The solution shows that if $y = M_{1,3}$ can come arbitrarily close to 0, then no value for $C_0$ will work.  Which is why the goal is now to find a tight upper bound on the least possible value of $M_{1,3}$ for $r=3$ such that:

1. $f(\lambda)$ has a continuous third derivative.
2. $f(0)=f(1)=0$ and $0 < f(1/2) < 1$.

Take the function $g(\lambda)=2\lambda(1-\lambda)$, which satisfies (1), (2), and $g(0)=g(1)=0$ and $g(1/2)=1/2$, and has an $M_{1,3}$ of 4.  Given that $\frac{|0-g(1/2)|}{y}=\frac{|0-1/2|}{y}=1/8$, the goal is now to see whether any function $f$ satisfying (1) and (2) has $\max(0, f(1/2)) < M_{1,3} < 8\cdot |0-f(1/2)|=8 f(1/2)$.

To aid in this goal, there is a formula to find the least possible Lipschitz constant for $f$'s first derivative (see "Definitions")[^36], given a finite set of points (0, 1/2, and 1 in the case at hand) and the values of $f$ and $f'$ at those points (Le Gruyer 2009)[^37]; see also (Herbert-Voss et al. 2017)[^38]. Denote $L(.,.,.)$ as this least possible Lipschitz constant.  Then according to that formula&mdash; $$L([0, 1/2, 1], [0, t, 0], [z_1, z_2, z_3]) = \max(2 \sqrt{\left|{z_{1} - z_{2}}\right|^{2} + \left|{- 4 t + z_{1} + z_{2}}\right|^{2}} + 2 \left|{- 4 t + z_{1} + z_{2}}\right|,$$ $$\sqrt{\left|{z_{1} - z_{3}}\right|^{2} + \left|{z_{1} + z_{3}}\right|^{2}} + \left|{z_{1} + z_{3}}\right|,$$ $$2 \sqrt{\left|{z_{2} - z_{3}}\right|^{2} + \left|{4 t + z_{2} + z_{3}}\right|^{2}} + 2 \left|{4 t + z_{2} + z_{3}}\right|)$$ $$=L([0, 1/2, 1], [0, t, 0], [z_1, z_2, z_3])$$ (where $t$ is greater than 0 and less than 1), so only $f'$ values in the interval $[-8f(1/2), 8f(1/2)]$ have to be checked.

Let $H = 8\cdot |\beta-f(1/2)|$. In this case, only values of $f$ in the closed unit interval have to be checked and only $f'$ values in $[-H, H]$ have to be checked.

Assuming that no $M_{1,3}$ less than $8\cdot |0-f(1/2)|$ is found, then&mdash; $$C_0=\frac{|0-f(1/2)|}{y} \frac{12}{2\cdot (4-\sqrt{2})}=\frac{|0-f(1/2)|}{H} \frac{12}{2\cdot (4-\sqrt{2})}=(1/8) \frac{12}{2\cdot (4-\sqrt{2})}$$ $$=3/(16-4\sqrt{2}),$$ which is the conjectured lower bound for $C_0$.

<a id=Example_of_Polynomial_Building_Scheme></a>
### Example of Polynomial-Building Scheme

The following example uses the results above to build a polynomial-building scheme for a factory function.

Let _f_(_&lambda;_) = 0 if _&lambda;_ is 0, and (ln(_&lambda;_/exp(3)))<sup>&minus;2</sup> otherwise. (This function is not Hölder continuous; its slope is exponentially steep at the point 0.)  Then the following scheme is valid in the sense of Theorem 1, subject to that theorem's bounding note:

- _&eta;_(_k_) = &Phi;(1, 2, (ln(_k_)+ln(7)+6)/ln(2))\*4/ln(2)<sup>2</sup>.
- **fbelow**(n, k) = f(_k_/_n_).
- **fabove**(n, k) = max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if n < 4; otherwise, f(_k_/_n_) +  _&eta;_(_n_).

Where &Phi;(.) is a function called the _Lerch transcendent_.

The first step is to find a concave modulus of continuity of _f_ (called _&omega;_(_h_)).  Because _f_ is strictly increasing and concave, and because _f_(0) = 0, we can take _&omega;_(_h_) = _f_(_h_).

Now, by plugging sqrt(1/(7\*_n_)) into _&omega;_, we get the following for Theorem 2 (assuming _n_&ge;0):

- _&phi;_(_n_) = 1/(ln(sqrt(7/_n_)/7)&minus;3)<sup>2</sup>.

Now, by applying Theorem 1, we compute _&eta;_(_k_) by substituting _n_ with 2<sup>_n_</sup>, summing over [_k_, &infin;), and substituting _k_ with ln(_k_)/ln(2).  _&eta;_ converges, resulting in:

- _&eta;_(_k_) = &Phi;(1, 2, (ln(_k_)+ln(7)+6)/ln(2))\*4/ln(2)<sup>2</sup>,

where &Phi;(.) is the Lerch transcendent.  This _&eta;_ matches the _&eta;_ given in the scheme above.  That scheme then follows from Theorems 1 and 2, as well as from part 1 of Proposition 1 because _f_ is concave.

the following code in Python that uses the SymPy computer algebra library is an example of finding the parameters for this polynomial-building scheme.

```
px=Piecewise((0,Eq(x,0)),((ln(x/exp(3))**-2),True))
# omega is modulus of continuity.  Since
# px is strictly increasing, concave, and px(0)=0,
# we can take omega as px
omega=px
omega=piecewise_fold(omega.rewrite(Piecewise)).simplify()
# compute omega
phi=omega.subs(x,sqrt(1/(7*n)))
pprint(phi)
# compute eta
eta=summation(phi.subs(n,2**n),(n,k,oo)).simplify()
eta=eta.subs(k,log(k,2)) # Replace k with ln(k)/ln(2)
pprint(eta)
for i in range(20):
  # Calculate upper bounds for eta at certain points.
  try:
    print("eta(2^%d) ~= %s" % (i,ceiling(eta.subs(k,2**i)*10000000).n()/10000000))
  except:
    print("eta(2^%d) ~= [FAILED]" % (i))
```

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
