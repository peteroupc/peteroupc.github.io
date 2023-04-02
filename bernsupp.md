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
    - [**Approximate Bernoulli Factories for Other "Smooth" Functions**](#Approximate_Bernoulli_Factories_for_Other_Smooth_Functions)
    - [**Approximate Bernoulli Factories for Linear Functions**](#Approximate_Bernoulli_Factories_for_Linear_Functions)
- [**Achievable Simulation Rates**](#Achievable_Simulation_Rates)
- [**Complexity**](#Complexity)
- [**Examples of Bernoulli Factory Polynomial-Building Schemes**](#Examples_of_Bernoulli_Factory_Polynomial_Building_Schemes)
- [**Miscellaneous Bernoulli Factories**](#Miscellaneous_Bernoulli_Factories)
    - [**Certain Piecewise Linear Functions**](#Certain_Piecewise_Linear_Functions)
    - [**Pushdown Automata for Square-Root-Like Functions**](#Pushdown_Automata_for_Square_Root_Like_Functions)
    - [**Ratio of Lower Gamma Functions (&gamma;(_m_, _x_)/&gamma;(_m_, 1)).**](#Ratio_of_Lower_Gamma_Functions_gamma__m___x__gamma__m__1)
    - [**4/(3\*_&pi;_)**](#4_3___pi)
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
    - [**Pushdown Automata and Algebraic Functions**](#Pushdown_Automata_and_Algebraic_Functions)
        - [**Finite-State and Pushdown Generators**](#Finite_State_and_Pushdown_Generators)
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
- A [**_Hölder continuous_**](https://en.wikipedia.org/wiki/Hölder_condition) function  (with _M_ being the _Hölder constant_ and _&alpha;_ being the _Hölder exponent_) is a continuous function _f_ such that _f_(_x_) and _f_(_y_) are no more than _M_\*_&delta;_<sup>_&alpha;_</sup> apart whenever _x_ and _y_ are in the function's domain and no more than _&delta;_ apart.<br>Here, _&alpha;_ satisfies 0 &lt; _&alpha;_ &le; 1.<br>Roughly speaking, the function's "steepness" is no greater than that of _M_\*_x_<sup>_&alpha;_</sup>.
- A _Lipschitz continuous_ function with constant _L_ (the _Lipschitz constant_) is Hölder continuous with Hölder exponent 1 and Hölder constant _L_.<br>Roughly speaking, the function's "steepness" is no greater than that of _L_\*_x_.<br>If the function has a derivative on its domain, _L_ can be the absolute value of the maximum of that derivative.

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

- is [**_Hölder continuous_**](https://en.wikipedia.org/wiki/Hölder_condition) on the closed unit interval, with Hölder constant _m_ or less and Hölder exponent _&alpha;_ (see "[**Definitions**](#Definitions)"), and
- on the closed unit interval&mdash;
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
>
> **Example:** If _f_(_&lambda;_) is a _piecewise linear_ factory function (made of multiple linear functions defined on a finite number of "pieces", or subintervals, of the closed unit interval), _m_ can equal the greatest absolute value of the slope among all pieces' slopes, and _&alpha;_ is 1 (_f_ is Lipschitz continuous).  For example, suppose _f_(_&lambda;_) equals 0 at 0, 3/4 at 2/3 and 1/4 at 1, and these points are connected by linear functions.  In this example, _&alpha;_ is 1 and _m_ is $\max(|(1/2-0)/(2/3)|,|(1/4-3/4)/(1/3)|) = 1.5$.

**Functions with a Lipschitz continuous derivative.** The following method, proved in the appendix, implements **fabove** and **fbelow** if _f_(_&lambda;_)&mdash;

- has a Lipschitz continuous derivative (see "[**Definitions**](#Definitions)"), and
- in the closed unit interval&mdash;
    - has a minimum of greater than 0 and a maximum of less than 1, or
    - is convex and has a minimum of greater than 0, or
    - is concave and has a maximum of less than 1.

Let _m_ be the Lipschitz constant of _f_'s derivative, or a greater number than that constant (if _f_ has a second derivative on its domain, then _m_ can be the absolute value of the maximum of that second derivative).  Then for every integer _n_ that's a power of 2:

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

    Whatever polynomial is used, the polynomial's coefficients must all lie on the closed unit interval.

2. Then, use one of the algorithms in the section "[**Certain Polynomials**](https://peteroupc.github.io/bernoulli.html)" to toss heads with probability equal to that polynomial, given its coefficients.

> **Note:** Bias and variance are the two sources of error in a randomized estimation algorithm.  Let _g_(_&lambda;_) be an approximation of _f_(_&lambda;_). The original Bernoulli factory for _f_, if it exists, has bias 0 and variance _f_(_&lambda;_)\*(1&minus;_f_(_&lambda;_)), but the approximate Bernoulli factory has bias _g_(_&lambda;_) &minus; _f_(_&lambda;_) and variance _g_(_&lambda;_)\*(1&minus;_g_(_&lambda;_)). ("Variance reduction" methods are outside the scope of this document.)  An estimation algorithm's _mean squared error_ equals variance plus square of bias.

<a id=Approximate_Bernoulli_Factories_for_Certain_Functions></a>
### Approximate Bernoulli Factories for Certain Functions

This section first discusses approximating $f$ with a _Bernstein polynomial_ (a degree-$n$ polynomial in Bernstein form with coefficients $f(k/n)$ with $0\le k\le n$).  The advantage is only one Bernstein coefficient has to be found per run; the disadvantage is that Bernstein polynomials approach $f$ slowly in general, in the order of magnitude of $1/n$ (Voronovskaya 1932)[^3].

There are results that give an upper bound on the error on approximating _f_ with a degree-_n_ Bernstein polynomial.  To find a degree _n_ such that _f_ is approximated with a maximum error of _&epsilon;_, solve the error bound's equation for _n_, then take _n_ = ceil(_n_) to get the solution if it's an integer, or the nearest integer that's bigger than the solution.

For example:

| If _f_(_&lambda;_): |  Then the degree-_n_ Bernstein polynomial is close to $f$ with the following error bound: |   Where _n_ is:  |  Notes |
 --- | --- | --- | --- |
| Has Lipschitz continuous derivative (see "Definitions"). | _&epsilon;_ = _M_/(8\*_n_). | _n_ = ceil(_M_/(8\*_&epsilon;_)). | Lorentz (1966)[^4]. _M_ &gt; 0 is the derivative's Lipschitz constant or greater. |
| Hölder continuous. | _&epsilon;_ = _M_\*(1/(4\*_n_))<sup>_&alpha;_/2</sup>. | _n_ = ceil(1/(4<sup>_&alpha;_</sup>\*_&epsilon;_<sup>2</sup>/_M_<sup>2</sup>)<sup>1/_&alpha;_</sup>). | Mathé (1999)[^5]. 0 &lt; _&alpha;_ &le; 1 is _f_'s Hölder exponent; _M_ &gt; 0 is its Hölder constant or greater. |
| Lipschitz continuous. | _&epsilon;_ = _L_\*sqrt(1/(4\*_n_)). | _n_ = ceil(_L_<sup>2</sup>/(4\*_&epsilon;_<sup>2</sup>)). | Special case of previous entry. _L_ &gt; 0 is _f_'s Lipschitz constant or greater. |

Now, if _f_ belongs to any of the classes given above, the following algorithm (adapted from "Certain Polynomials") simulates a polynomial that approximates _f_ with a maximum error of _&epsilon;_:

1. Calculate _n_ as described in the table above for the given class.
2. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.
3. With probability _f_(_j_/_n_), return 1.  Otherwise, return 0. (If _f_(_j_/_n_) can be an irrational number, see "[**Algorithms for General Irrational Constants**](https://peteroupc.github.io/bernoulli.html#Algorithms_for_General_Irrational_Constants)" for ways to sample this irrational probability exactly.)

-------------------

Alternatively, polynomials other than Bernstein polynomials, but written in Bernstein form, can be used to approximate $f$ with an error no more than $\epsilon$, as long as an explicit upper bound on the approximation error is available.  A ratio of two such polynomials can also approximate $f$ this way.  See my [**question on MathOverflow**](https://mathoverflow.net/questions/442057/explicit-and-fast-error-bounds-for-approximating-continuous-functions).

Let $B_n(f(\lambda))$ be the ordinary Bernstein polynomial for $f(\lambda)$.  Examples of these alternative polynomials (all of degree $n$) are given in the following table.

| Name |  Polynomial | Its Bernstein coefficients are found as follows: | Notes |
 --- | --- | --- | --- |
| Order-2 iterated Bernstein polynomial. | $U_{n,2} = B_n(W_{n,2})$. | Calculate $W_{n,2} = 2 f(\lambda) - B_n(f(\lambda))$. | Micchelli (1973)[^6], Guan (2009)[^7], (Güntürk and Li 2021, sec. 3.3)[^8]. |
| Order-3 iterated Bernstein polynomial. | $U_{n,3} = B_n(W_{n,3})$. | Calculate $W_{n,3} = B_n(B_n(f(\lambda)))$ + $3 (f(\lambda)$ &minus; $B_n(f(\lambda)))$. | Same. |
| Linear Bernstein polynomial combination. | $L_{2,n/2} = 2 B_{n}(f(\lambda))$ &minus; $B_{n/2}(f(\lambda))$. | Treat the coefficients \[$f(0/(n/2))$, $f(1/(n/2))$, ..., $f((n/2)/(n/2))$\] as representing a polynomial in Bernstein form of degree $n/2$, elevate that polynomial to one of degree $n$ with Bernstein coefficients $b_0, b_1, ..., b_n$, then set the final Bernstein coefficients to $b_i = 2 f(i/n) - b_i$ for each $i$. |(Tachev 2022)[^9].  $n\ge 6$ must be even.|

The goal is now to find a degree $n$ such that&mdash;

1. the alternative polynomial is within $\epsilon$ of $f(\lambda)$, and
2. the polynomial $W_{n,i}$ is not less than 0 or greater than 1.

Then:

| If _f_(_&lambda;_): |  Then the following polynomial: |  Is close to _f_ with the following error bound: | Where _n_ is:  | Notes |
 --- | --- | --- | --- | --- |
| Is concave and has continuous second derivative. | $U_{n,2}$. | _&epsilon;_ = 0.75\*_M_/_n_<sup>2</sup>. | _n_ = ceil(sqrt(0.75\*_M_/_&epsilon;_)). | _M_ is not less than absolute value of the maximum of second derivative.  See Proposition B8 in appendix. |
| Has continuous third derivative. | $L_{2, n/2}$. | _&epsilon;_ = (3\*sqrt(3&minus;4/_n_)/4)\*_M_/_n_<sup>2</sup> &lt; (3\*sqrt(3)/4)\*_M_/_n_<sup>2</sup>. | _n_=max(6,ceil($\frac{3^{3/4} \sqrt{M/\epsilon}}{2}$)) &le; max(6,ceil((113976/100000) \* sqrt(M/_&epsilon;_))). (If _n_ is now odd, add 1.) | (Tachev 2022)[^9]. $n\ge 6$ must be even. _M_ is not less than absolute value of the maximum of third derivative. |

By analyzing the proof of Theorem 3.3 of Güntürk and Li (2021, sec. 3.3)[^8], the following error bounds _appear_ to be true.  In the table below, _M_<sub>_n_</sub> is not less than the so-called $C^n$ norm.  Unfortunately, the $C^n$ norm is defined differently in different academic works, and the bounds are sensitive to how that norm is defined.[^10]

| If _f_(_&lambda;_): |  Then the following polynomial: |  Appears to be close to _f_ with the following error bound: | Where _n_ is:  |
 --- | --- | --- | --- |
| Has continuous fourth derivative. | $U_{n,2}$ | _&epsilon;_ = 0.275\*_M_<sub>4</sub>/_n_<sup>2</sup>. | _n_=ceil(sqrt(0.275)\*sqrt(_M_<sub>4</sub>/_&epsilon;_)) &le; ceil((52441/100000)\*sqrt(_M_<sub>4</sub>/_&epsilon;_)). |
| Has continuous fifth derivative. | $U_{n,3}$ | _&epsilon;_ = 0.7284\*_M_<sub>5</sub>/_n_<sup>5/2</sup>. | _n_=ceil((0.7284)<sup>2/5</sup>\*(_M_<sub>5</sub>/_&epsilon;_)<sup>2/5</sup>) &le; ceil((88095/100000)\*(_M_<sub>5</sub>/_&epsilon;_)<sup>2/5</sup>). |
| Has continuous sixth derivative. | $U_{n,3}$ | _&epsilon;_ = 0.9961\*_M_<sub>6</sub>/_n_<sup>3</sup>. | _n_=ceil((0.9961)<sup>1/3</sup>\*(_M_<sub>6</sub>/_&epsilon;_)<sup>1/3</sup>) &le; ceil((99870/100000)\*(_M_<sub>6</sub>/_&epsilon;_)<sup>1/3</sup>). |

However, unlike with ordinary Bernstein polynomials, the alternative polynomial is not necessarily bounded by 0 and 1.  The following process can be used to calculate the required degree $n$, given an error tolerance of $\epsilon$.

1. Determine whether $f$ is described in either of the two tables above.  Let _A_ be the minimum of $f$ on the closed unit interval and let _B_ be the maximum of $f$ there.
2. If 0 &lt; _A_ &le; _B_ &lt; 1, calculate $n$ as given in either of the two tables above, but with $\epsilon=\min(\epsilon, A, 1-B)$, and stop.
3. Propositions B1, B2, and B3 in the [**appendix**](#Appendix) give conditions on $f$ so that $W_{n,2}$ or $W_{n,3}$ (as the case may be) will be nonnegative.  If _B_ is less than 1 and any of those conditions is met, calculate $n$ as given in either of the two tables above, but with $\epsilon=\min(\epsilon, 1-B)$. (For B3, set $n$ to max($n$, $m$), where $m$ is given in that proposition.) Then stop; $W$ will now be bounded by 0 and 1.
4. Calculate $n$ as given in either of the two tables above.  Then, if $W_{n,i}(j/n)\lt 0$ or $W_{n,i}(j/n)\gt 1$ for some $0\le j\le n$, double the value of $n$ until this condition is no longer true.

Once _n_ is found, simulating the alternative polynomial is as follows:

1. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.
2. With probability equal to the alternative polynomial's Bernstein coefficient at position _j_ (0&le;_j_&le;_n_), return 1.  Otherwise, return 0.

> **Notes:**
>
> 1. Providing the full proof for the error bounds shown in the last table is a bit tedious, so here is a sketch.  The proof was found by analyzing Theorem 3.3 of Güntürk and Li (2021)[^8], finding upper bounds for so-called "central moments" of the binomial distribution (see B4 to B7 in the appendix), then plugging them in to various estimates mentioned in that theorem's proof.  The most significant estimate in that theorem is denoted $(B_n-I)^{\lceil (r+1)/2 \rceil}(f)$, which in this case is the error when approximating $f$ using an iterated Bernstein polynomial, when $f$ has a continuous $(r+1)$-th derivative.
> 2. A polynomial's Bernstein coefficients can be rounded to multiples of $\delta$ (where $0 \lt\delta\le 1$) by setting $c$=floor($c/\delta$) \* $\delta$ for each coefficient $c$.  The new polynomial will differ from the old one by at most $\delta$.  (Thus, to find a polynomial with multiple-of-$\delta$ coefficients that approximates $f$ with error $\epsilon$ [which must be greater than $\delta$], first find a polynomial with error $\epsilon - \delta$, then round that polynomial's coefficients as given here.)

<a id=Approximate_Bernoulli_Factories_for_Power_Series></a>
### Approximate Bernoulli Factories for Power Series

Some functions can be rewritten as a power series, namely: $$f(\lambda) = a_0 \lambda^0 + a_1 \lambda^1 + ... + a_i \lambda^i + ...,$$ where $a_i$, the _coefficients_, are constant rational numbers[^11].

To simulate an approximation of $f$ that comes within $\epsilon$ of $f$:

1. Find the first $n$+1 coefficients such that the polynomial $P(\lambda) = a_0 \lambda^0 + ... + a_n\lambda^n$ is within $\epsilon$ of $f$ wherever $0 \le \lambda \le 1$.

    If $f$'s coefficients are each greater than 0, form a nowhere increasing sequence (example: (1/4, 1/8, 1/8, 1/16, ...)), and meet the so-called "ratio test", the algorithms in Carvalho and Moreira (2022)[^12] can be used here (see also "[**Proofs on Cutting Off a Power Series**](#Proofs_on_Cutting_Off_a_Power_Series)" in the appendix).

    Alternatively, if bounds on the derivatives of $f$ are known, then thanks to Taylor's theorem, $P(\lambda)$ will be close enough if $M/((n+1)!) \le \epsilon$, where $M$ is equal to or greater than the absolute value of the maximum of $f$'s ($n$+1)-th derivative on the domain of $f$.

2. Rewrite $P(\lambda)$ as a polynomial in Bernstein form.  (One way to transform a polynomial to Bernstein form, given the "power" coefficients $a_0, ..., a_n$, is the so-called "matrix method" from Ray and Nataraj (2012)[^13].)  Let $b_0, ..., b_n$ be the Bernstein-form polynomial's coefficients.  If any of those coefficients is less than 0 or greater than 1, double the value of $n$ and rewrite $P$ to Bernstein form of degree $n$, until none of the coefficents is less than 0 or greater than 1.
3. Flip the input coin _n_ times, then let _j_ be the number of times the coin returned 1 this way, then return either 1 with probability $b_j$, or 0 otherwise.

In fact, if $f(\lambda)$ belongs in _Gevrey's hierarchy_ (there are $B\ge 1, l\ge 1, \gamma\ge 1$ such that its $n$-th derivative's absolute value is not greater than $Bl^n n^{\gamma n}$ for every $n$), which includes functions equaling power series as a special case ($\gamma=1$), it's possible to bound the derivatives and find the appropriate degree for the approximating polynomial (for details, see (Kawamura et al. 2015)[^14]; see also (Gevrey 1918)[^15]).

<a id=Approximate_Bernoulli_Factories_for_Other_Smooth_Functions></a>
### Approximate Bernoulli Factories for Other "Smooth" Functions

If $f(\lambda)$ is "smooth" enough and $\epsilon$ is big enough, then Taylor's theorem shows how to a build a polynomial that comes within $\epsilon$ of $f$.

Let $n\ge 0$ be an integer, and let $f^{(i)}$ be the $i$-th derivative of $f(\lambda)$.  Suppose that&mdash;

- $f$ is continuous on the closed unit interval, and
- $f$ satisfies $\epsilon\le f(\lambda)\le 1-\epsilon$ whenever $0\le\lambda\le 1$, and
- $f$'s $(n+1)$-th derivative is continuous and satisfies $\epsilon\ge M/((n+1)!)$, where $M$ is not less than the maximum of the absolute value of that derivative, and
- $f(0)$ is known as well as $f^{(1)}(0), ..., f^{(n)}(0)$.

Then the $n$-th _Taylor polynomial_ centered at 0, given below, is within $\epsilon$ of $f$: $$P(\lambda) = a_0 \lambda^0 + a_1 \lambda^1 + ... + a_n \lambda^n,$$

where $a_0 = f(0)$ and $a_i = f^{(i)}(0)/(i!)$ for $i\ge 1$.  Given this $P$, the algorithm to simulate this polynomial is the same as steps 2 and 3 of the previous section's algorithm.

<a id=Approximate_Bernoulli_Factories_for_Linear_Functions></a>
### Approximate Bernoulli Factories for Linear Functions

There are a number of approximate methods to simulate _&lambda;_\*_c_, where _c_ > 1 and 0 &le; _&lambda;_ &lt; 1/_c_.  ("Approximate" because this function touches 1 at 1/_c_, so it can't be a factory function.) Since the methods use only up to _n_ flips, where _n_ is an integer greater than 0, the approximation will be a polynomial of degree _n_.

- Henderson and Glynn (2003, Remark 4\)[^16] approximates the function _&lambda;_\*2 using a polynomial where the _j_<sup>th</sup> coefficient (starting at 0) is min((_j_/_n_)\*2, 1&minus;1/_n_).  If _g_(_&lambda;_) is that polynomial, then the error in approximating _f_ is no greater than 1&minus;_g_(1/2).  _g_ can be computed with the SymPy computer algebra library as follows: `from sympy.stats import *; g=2*E( Min(sum(Bernoulli(("B%d" % (i)),z) for i in range(n))/n,(S(1)-S(1)/n)/2))`.

- I found the following approximation for _&lambda;_\*_c_[^17]\: "(1.) Set _j_ to 0 and _i_ to 0; (2.) If _i_ &ge; _n_, return 0; (3.) Flip the input coin, and if it returns 1, add 1 to _j_; (4.) (Estimate the probability and return 1 if it 'went over'.) If (_j_/(_i_+1)) &ge; 1/_c_, return 1; (5.) Add 1 to _i_ and go to step 2."  Here, _&lambda;_\*_c_ is approximated by a polynomial where the _j_<sup>th</sup> coefficient (starting at 0) is min((_j_/_n_)\*_c_, 1).  If _g_(_&lambda;_) is that polynomial, then the error in approximating _f_ is no greater than 1&minus;_g_(1/_c_).

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
| Requires no more than _n_ input coin flips. | If and only if _f_ can be written as a polynomial in Bernstein form of degree _n_ with coefficients in the closed unit interval (Goyal and Sigman 2012\)[^18]. |
| Requires a finite number of flips on average. Also known as "realizable" by Flajolet et al. (2010\)[^19]. | Only if _f_ is Lipschitz continuous (Nacu and Peres 2005\)[^1].<br/>Whenever _f_ admits a fast simulation (Mendo 2019\)[^20].  |
| Number of flips required, raised to power of _r_, is bounded by a finite number on average and has a tail that drops off uniformly over _f_'s domain.  | Only if _f_ has continuous _r_-th derivative (Nacu and Peres 2005\)[^1]. |
| Requires more than _n_ flips with probability _&Delta;_(_n_, _r_ + 1, _&lambda;_), for integer _r_ &ge; 0 and every _&lambda;_. (The greater _r_ is, the faster the simulation.) | Only if _f_ has an _r_-th derivative that is continuous and in the Zygmund class (see note 3) (Holtz et al. 2011\)[^21]. |
| Requires more than _n_ flips with probability _&Delta;_(_n_, _&alpha;_, _&lambda;_), for non-integer _&alpha;_ &gt; 0 and every _&lambda;_. (The greater _&alpha;_ is, the faster the simulation.) | If and only if _f_ has an _r_-th derivative that is Hölder continuous with Hölder exponent (_&alpha;_ &minus; _r_) or greater, where _r_ = floor(_&alpha;_) (Holtz et al. 2011\)[^21]. Assumes _f_ is bounded away from 0 and 1. |
| "Fast simulation" (requires more than _n_ flips with a probability that decays exponentially as _n_ gets large).  Also known as "strongly realizable" by Flajolet et al. (2010\)[^19]. | If and only if _f_ is real analytic (writable as $f(\lambda)=a_0 \lambda^0 + a_1 \lambda^1 + ...$ for real constants $a_i$) (Nacu and Peres 2005\)[^1].   |
| Average number of flips greater than or equal to (_f&prime;_(_&lambda;_))<sup>2</sup>\*_&lambda;_\*(1&minus;_&lambda;_)/(_f_(_&lambda;_)\*(1&minus;_f_(_&lambda;_))), where _f&prime;_ is the first derivative of _f_.  | Whenever _f_ admits a fast simulation (Mendo 2019\)[^20]. |

> **Notes:**
>
> 1. By the results of Holtz et al., it is suspected that the target function _f_ can't be simulated using a finite number of flips on average for every probability of heads unless _f_'s fourth derivative is Hölder continuous.
> 2. A function in the _Zygmund class_, roughly speaking, has no vertical slope.  The Zygmund class includes the smaller class of Lipschitz continuous functions.

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

<a id=Miscellaneous_Bernoulli_Factories></a>
## Miscellaneous Bernoulli Factories

In the methods below, _&lambda;_ is the unknown probability of heads of the coin involved in the Bernoulli factory problem.

<a id=Certain_Piecewise_Linear_Functions></a>
### Certain Piecewise Linear Functions

Let _f_(_&lambda;_) be a function of the form min(_&lambda;_\*_mult_, 1&minus;_&epsilon;_). This is a _piecewise linear function_, a function made up of two linear pieces (in this case, the pieces are a rising linear part and a constant part).

This section describes how to calculate the Bernstein coefficients for polynomials that converge from above and below to _f_, based on Thomas and Blanchet (2012\)[^22].  These polynomials can then be used to show heads with probability _f_(_&lambda;_) using the algorithms given in "[**General Factory Functions**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions)".

In this section, **fbelow(_n_, _k_)** and **fabove(_n_, _k_)** are the _k_<sup>th</sup> coefficients (with _k_ starting at 0) of the lower and upper polynomials, respectively, in Bernstein form of degree _n_.

The code at the end of this section uses the computer algebra library SymPy to calculate a list of parameters for a sequence of polynomials converging from above.  The method to do so is called `calc_linear_func(eps, mult, count)`, where `eps` is _&epsilon;_, `mult` = _mult_, and `count` is the number of polynomials to generate.  Each item returned by `calc_linear_func` is a list of two items: the degree of the polynomial, and a _Y parameter_.  The procedure to calculate the required polynomials is then logically as follows (as written, it runs very slowly, though):

1. Set _i_ to 1.
2. Run `calc_linear_func(eps, mult, i)` and get the degree and _Y parameter_ for the last listed item, call them _n_ and _y_, respectively.
3. Set _x_ to &minus;((_y_&minus;(1&minus;_&epsilon;_))/_&epsilon;_)<sup>5</sup>/_mult_ + _y_/_mult_.  (This exact formula doesn't appear in the Thomas and Blanchet paper; rather it comes from the [**supplemental source code**](https://github.com/acthomasca/rberfac/blob/main/rberfac-public-2.R) uploaded by A. C. Thomas at my request.)
4. For degree _n_, **fbelow(_n_, _k_)** is min((_k_/_n_)\*_mult_, 1&minus;_&epsilon;_), and **fabove(_n_, _k_)** is min((_k_/_n_)\*_y_/_x_,_y_).  (**fbelow** matches _f_ because _f_ is _concave_ on the closed unit interval.)
5. Add 1 to _i_ and go to step 2.

It would be interesting to find general formulas to find the appropriate polynomials (degrees and _Y parameters_) given only the values for _mult_ and _&epsilon;_, rather than find them "the hard way" via `calc_linear_func`.  For this procedure, the degrees and _Y parameters_ can be upper bounds, as long as the sequence of degrees is strictly increasing and the sequence of Y parameters is nowhere increasing.

> **Note:** In Nacu and Peres (2005\)[^1], the following polynomial sequences were suggested to simulate $\min(2\lambda, 1-2\varepsilon)$, provided $\varepsilon \lt 1/8$, where _n_ is a power of 2.  However, with these sequences, an extraordinary number of input coin flips is required to simulate this function each time.
>
> - **fbelow(_n_, _k_)** = $\min(2(k/n), 1-2\varepsilon)$.
> - **fabove(_n_, _k_)** = $\min(2(k/n), 1-2\varepsilon)+$<br> $
 \frac{2\times\max(0, k/n+3\varepsilon - 1/2)}{\varepsilon(2-\sqrt{2})} \sqrt{2/n}+$<br> $\frac{72\times\max(0,k/n-1/9)}{1-\exp(-2\times\varepsilon^2)} \exp(-2n\times\varepsilon^2)$.

SymPy code for piecewise linear functions:

```
def bernstein_n(func, x, n, pt=None):
  # Bernstein operator.
  # Create a polynomial that approximates func, which in turn uses
  # the symbol x.  The polynomial's degree is n and is evaluated
  # at the point pt (or at x if not given).
  if pt==None: pt=x
  ret=0
  v=[binomial(n,j) for j in range(n//2+1)]
  for i in range(0, n+1):
    oldret=ret
    bino=v[i] if i<len(v) else v[n-i]
    ret+=func.subs(x,S(i)/n)*bino*pt**i*(1-pt)**(n-i)
    if pt!=x and ret==oldret and ret>0: break
  return ret

def inflec(y,eps=S(2)/10,mult=2):
  # Calculate the inflection point (x) given y, eps, and mult.
  # The formula is not found in the paper by Thomas and
  # Blanchet 2012, but in
  # the supplemental source code uploaded by
  # A.C. Thomas.
  po=5 # Degree of y-to-x polynomial curve
  eps=S(eps)
  mult=S(mult)
  x=-((y-(1-eps))/eps)**po/mult + y/mult
  return x

def xfunc(y,sym,eps=S(2)/10,mult=2):
  # Calculate Bernstein "control polygon" given y,
  # eps, and mult.
  return Min(sym*y/inflec(y,eps,mult),y)

def calc_linear_func(eps=S(5)/10, mult=1, count=10):
   # Calculates the degrees and Y parameters
   # of a sequence of polynomials that converge
   # from above to min(x*mult, 1-eps).
   # eps must be greater than 0 and less than 1.
   # Default is 10 polynomials.
   polys=[]
   eps=S(eps)
   mult=S(mult)
   count=S(count)
   bs=20
   ypt=1-(eps/4)
   x=symbols('x')
   tfunc=Min(x*mult,1-eps)
   tfn=tfunc.subs(x,(1-eps)/mult).n()
   xpt=xfunc(ypt,x,eps=eps,mult=mult)
   bits=5
   i=0
   lastbxn = 1
   diffs=[]
   while i<count:
     bx=bernstein_n(xpt,x,bits,(1-eps)/mult)
     bxn=bx.n()
     if bxn > tfn and bxn < lastbxn:
       # Dominates target function
       #if oldbx!=None:
       #   diffs.append(bx)
       #   diffs.append(oldbx-bx)
       #oldbx=bx
       oldxpt=xpt
       lastbxn = bxn
       polys.append([bits,ypt])
       print("    [%d,%s]," % (bits,ypt))
       # Find y2 such that y2 < ypt and
       # bernstein_n(oldxpt,x,bits,inflec(y2, ...)) >= y2,
       # so that next Bernstein expansion will go
       # underneath the previous one
       while True:
         ypt-=(ypt-(1-eps))/4
         xpt=inflec(ypt,eps=eps,mult=mult).n()
         bxs=bernstein_n(oldxpt,x,bits,xpt).n()
         if bxs>=ypt.n():
            break
       xpt=xfunc(ypt,x,eps=eps,mult=mult)
       bits+=20
       i+=1
     else:
       bits=int(bits*200/100)
   return polys

calc_linear_func(count=8)
```

<a id=Pushdown_Automata_for_Square_Root_Like_Functions></a>
### Pushdown Automata for Square-Root-Like Functions

In this section, ${n \choose m}$ = choose($n$, $m$) is a binomial coefficient.[^23] [^24]

The following algorithm extends the square-root construction of Flajolet et al. (2010\)[^25], takes an input coin with probability of heads _&lambda;_ (where 0 &le; _&lambda;_ &lt; 1), and returns 1 with probability&mdash;

$$f(\lambda)=\frac{1-\lambda}{\sqrt{1+4\lambda\mathtt{Coin}(\lambda)(\mathtt{Coin}(\lambda)-1)}} = (1-\lambda)\sum_{n\ge 0} \lambda^n (\mathtt{Coin}(\lambda))^n (1-\mathtt{Coin}(\lambda))^n {2n \choose n}$$  $$= (1-\lambda)\sum_{n\ge 0} (\lambda \mathtt{Coin}(\lambda) (1-\mathtt{Coin}(\lambda)))^n {2n \choose n}$$ $$= \sum_{n\ge 0} (1-\lambda) \lambda^n h_n(\lambda) = \sum_{n\ge 0} g(n, \lambda) h_n(\lambda),$$

and 0 otherwise [^26], where:

- `Coin`(_&lambda;_) is a Bernoulli factory function. Although not required, `Coin` can be a rational function (a ratio of two polynomials) whose coefficients are rational numbers; if so, _f_ will be an _algebraic function_ (a function that can be a solution of a nonzero polynomial equation) and can be simulated by a _pushdown automaton_, or a state machine with a stack (see the algorithm below and the note that follows it). In the original square-root construction,  `Coin`(_&lambda;_) = 1/2.
- $g(n, \lambda) = (1-\lambda) \lambda^n$; this is the probability of running the `Coin` Bernoulli factory $2 \times n$ times.
- $h_n(\lambda) = (\mathtt{Coin}(\lambda))^n (1-\mathtt{Coin}(\lambda))^n {2n \choose n}$; this is the probability of getting as many ones as zeros from the `Coin` Bernoulli factory.

Equivalently&mdash; $$f(\lambda)=(1-\lambda) OGF(\lambda \mathtt{Coin}(\lambda) (1-\mathtt{Coin}(\lambda))),$$ where $OGF(x) = \sum_{n\ge 0} x^n {2n \choose n}$ is the algorithm's ordinary generating function (also known as counting generating function).

The algorithm follows.

1. Set _d_ to 0.
2. Do the following process repeatedly until this run of the algorithm returns a value:
    1. Flip the input coin.  If it returns 1, go to the next substep.  Otherwise, return either 1 if _d_ is 0, or 0 otherwise.
    2. Run a Bernoulli factory algorithm for `Coin`(_&lambda;_).  If the run returns 1, add 1 to _d_.  Otherwise, subtract 1 from _d_.
    3. Repeat the previous substep.

> **Note:** A _pushdown automaton_ is a state machine that keeps a stack of symbols.  In this document, the input for this automaton is a stream of flips of a coin that shows heads with probability _&lambda;_, and the output is 0 or 1 depending on which state the automaton ends up in when it empties the stack (Mossel and Peres 2005\)[^27].  That paper shows that a pushdown automaton, as defined here, can simulate only _algebraic functions_, that is, functions that can be a solution of a nonzero polynomial equation.  The [**appendix**](#Pushdown_Automata_and_Algebraic_Functions) defines these machines in more detail and has proofs on which algebraic functions are possible with pushdown automata.
>
> As a pushdown automaton, this algorithm (except the "Repeat the previous substep" part) can be expressed as follows. Let the stack have the single symbol EMPTY, and start at the state POS-S1.  Based on the current state, the last coin flip (HEADS or TAILS), and the symbol on the top of the stack, set the new state and replace the top stack symbol with zero, one, or two symbols.  These _transition rules_ can be written as follows:
> - (POS-S1, HEADS, _topsymbol_) &rarr; (POS-S2, {_topsymbol_}) (set state to POS-S2, keep _topsymbol_ on the stack).
> - (NEG-S1, HEADS, _topsymbol_) &rarr; (NEG-S2, {_topsymbol_}).
> - (POS-S1, TAILS, EMPTY) &rarr; (ONE, {}) (set state to ONE, pop the top symbol from the stack).
> - (NEG-S1, TAILS, EMPTY) &rarr; (ONE, {}).
> - (POS-S1, TAILS, X) &rarr; (ZERO, {}).
> - (NEG-S1, TAILS, X) &rarr; (ZERO, {}).
> - (ZERO, _flip_, _topsymbol_) &rarr; (ZERO, {}).
> - (POS-S2, _flip_, _topsymbol_) &rarr; Add enough transition rules to the automaton to simulate _g_(_&lambda;_) by a finite-state machine (only possible if _g_ is rational with rational coefficients (Mossel and Peres 2005\)[^27]).  Transition to POS-S2-ZERO if the machine outputs 0, or POS-S2-ONE if the machine outputs 1.
> - (NEG-S2, _flip_, _topsymbol_) &rarr; Same as before, but the transitioning states are NEG-S2-ZERO and NEG-S2-ONE, respectively.
> - (POS-S2-ONE, _flip_, _topsymbol_) &rarr; (POS-S1, {_topsymbol_, X}) (replace top stack symbol with _topsymbol_, then push X to the stack).
> - (POS-S2-ZERO, _flip_, EMPTY) &rarr; (NEG-S1, {EMPTY, X}).
> - (POS-S2-ZERO, _flip_, X) &rarr; (POS-S1, {}).
> - (NEG-S2-ZERO, _flip_, _topsymbol_) &rarr; (NEG-S1, {_topsymbol_, X}).
> - (NEG-S2-ONE, _flip_, EMPTY) &rarr; (POS-S1, {EMPTY, X}).
> - (NEG-S2-ONE, _flip_, X) &rarr; (NEG-S1, {}).
>
> The machine stops when it removes EMPTY from the stack, and the result is either ZERO (0) or ONE (1).

For the following algorithm, which extends the end of Note 1 of the Flajolet paper, the probability is&mdash; $$f(\lambda)=(1-\lambda) \sum_{n\ge 0} \lambda^{Hn} \mathtt{Coin}(\lambda)^n (1-\mathtt{Coin}(\lambda))^{Hn-n} {Hn \choose n},$$ where _H_ &ge; 2 is an integer; and `Coin` has the same meaning as earlier.

1. Set _d_ to 0.
2. Do the following process repeatedly until this run of the algorithm returns a value:
    1. Flip the input coin.  If it returns 1, go to the next substep.  Otherwise, return either 1 if _d_ is 0, or 0 otherwise.
    2. Run a Bernoulli factory algorithm for `Coin`(_&lambda;_).  If the run returns 1, add (_H_&minus;1) to _d_.  Otherwise, subtract 1 from _d_.

The following algorithm simulates the probability&mdash; $$
f(\lambda) = (1-\lambda) \sum_{n\ge 0} \lambda^n \left( \sum_{m\ge 0} W(n,m) \mathtt{Coin}(\lambda)^m (1-\mathtt{Coin}(\lambda))^{n-m} {n \choose m}\right)$$ $$= (1-\lambda) \sum_{n\ge 0} \lambda^n \left( \sum_{m\ge 0} V(n,m) \mathtt{Coin}(\lambda)^m (1-\mathtt{Coin}(\lambda))^{n-m}\right),$$ where `Coin` has the same meaning as earlier; _W_(_n_, _m_) is 1 if _m_\*_H_ equals (_n_&minus;_m_)\*_T_, or 0 otherwise; and _H_&ge;1 and _T_&ge;1 are integers. (In the first formula, the sum in parentheses is a polynomial in Bernstein form, in the variable `Coin`(_&lambda;_) and with only zeros and ones as coefficients.  Because of the _&lambda;_<sup>_n_</sup>, the polynomial gets smaller as _n_ gets larger.  _V_(_n_, _m_) is the number of _n_-letter words that have _m_ heads _and_ describe a walk that ends at the beginning.)

1. Set _d_ to 0.
2. Do the following process repeatedly until this run of the algorithm returns a value:
    1. Flip the input coin.  If it returns 1, go to the next substep.  Otherwise, return either 1 if _d_ is 0, or 0 otherwise.
    2. Run a Bernoulli factory algorithm for `Coin`(_&lambda;_).  If the run returns 1 ("heads"), add _H_ to _d_.  Otherwise ("tails"), subtract _T_ from _d_.

<a id=Ratio_of_Lower_Gamma_Functions_gamma__m___x__gamma__m__1></a>
### Ratio of Lower Gamma Functions (&gamma;(_m_, _x_)/&gamma;(_m_, 1)).

1. Set _ret_ to the result of **kthsmallest** with the two parameters _m_ and _m_.  (Thus, _ret_ is distributed as _u_<sup>1/_m_</sup> where _u_ is a uniform random variate greater than 0 and less than 1; although **kthsmallest** accepts only integers, this formula works for every _m_ greater than 0.)
2. Set _k_ to 1, then set _u_ to point to the same value as _ret_.
3. Generate a uniform random variate between 0 and 1, call it _v_.
4. If _v_ is less than _u_: Set _u_ to _v_, then add 1 to _k_, then go to step 3.
5. If _k_ is odd[^28], return a number that is 1 if _ret_ is less than _x_ and 0 otherwise. (If _ret_ is implemented as a uniform partially-sampled random number (PSRN), this comparison should be done via **URandLessThanReal**.)  If _k_ is even[^29], go to step 1.

Derivation:  See Formula 1 in the section "[**Probabilities Arising from Certain Permutations**](https://peteroupc.github.io/bernoulli.html#Probabilities_Arising_from_Certain_Permutations)", where:

- `ECDF(x)`  is the probability that a uniform random variate between 0 and 1 is _x_ or less, namely _x_ if _x_ is greater than 0 and less than 1, 0 if _x_ is less than 0, and 1 otherwise.
- `DPDF(x)` is the probability density function for the maximum of _m_ uniform random variates between 0 and 1, namely _m_\*_x_<sup>_m_&minus;1</sup> if _x_ is greater than 0 and less than 1, and 0 otherwise.

<a id=4_3___pi></a>
### 4/(3\*_&pi;_)

Given that the point (_x_, _y_) has positive coordinates and lies inside a disk of radius 1 centered at (0, 0), the mean value of _x_ is 4/(3\*_&pi;_). This leads to the following algorithm to sample that probability:

1. Generate two partially-sampled random numbers (PSRNs) in the form of a uniformly chosen point inside a 2-dimensional quarter hypersphere (that is, a quarter of a "filled circle"; see "[**Uniform Distribution Inside N-Dimensional Shapes**](https://peteroupc.github.io/exporand.html#Uniform_Distribution_Inside_N_Dimensional_Shapes)" in the article "Partially-Sampled Random Numbers", as well as the examples there).
2. Let _x_ be one of those PSRNs.  Run **SampleGeometricBag** on that PSRN and return the result (which will be either 0 or 1).

> **Note:** The mean value 4/(3\*_&pi;_) can be derived as follows.  The relative probability that _x_ is "close" to _z_, where $0\le _z_ \le 1$, is _p_(_z_) = sqrt(1 &minus; _z_\*_z_).  Now find the integral ("area under the graph") of _z_\*_p_(_z_)/_c_ (where _c_=_&pi;_/4 is the integral of _p_(_z_) on the closed unit interval).  The result is the mean value 4/(3\*_&pi;_).  The following Python code prints this mean value using the SymPy computer algebra library: `p=sqrt(1-z*z); c=integrate(p,(z,0,1)); print(integrate(z*p/c,(z,0,1)));`.

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

[^9]: Tachev, Gancho. "[**Linear combinations of two Bernstein polynomials**](https://doi.org/10.3934/mfc.2022061)", _Mathematical Foundations of Computing_, 2022.

[^10]: Güntürk and Li 2021 defines the $C^n$ norm as the absolute value of the maximum of $f(\lambda)$ and its _n_-th derivative where $0\le \lambda\le 1$, but the bounds would then be false in general.  One counterexample is $2\lambda(1-\lambda)$, and another is $(\sin(\lambda)+2\lambda(1-\lambda))/2$.

[^11]: More generally, the coefficients can be real numbers, but there are computational issues.  Rational numbers more easily support arbitrary precision than other real numbers, where special measures are required such as so-called constructive/recursive reals.

[^12]: Carvalho, Luiz Max, and Guido A. Moreira. "[**Adaptive truncation of infinite sums: applications to Statistics**](https://arxiv.org/abs/2202.06121)", arXiv:2202.06121 (2022).

[^13]: S. Ray, P.S.V. Nataraj, "A Matrix Method for Efficient Computation of Bernstein Coefficients", Reliable Computing 17(1), 2012.

[^14]: Kawamura, Akitoshi, Norbert Müller, Carsten Rösnick, and Martin Ziegler. "[**Computational benefit of smoothness: Parameterized bit-complexity of numerical operators on analytic functions and Gevrey’s hierarchy**](https://doi.org/10.1016/j.jco.2015.05.001)." Journal of Complexity 31, no. 5 (2015): 689-714.

[^15]: M. Gevrey, "Sur la nature analytique des solutions des équations aux dérivées partielles", 1918.

[^16]: Henderson, S.G., Glynn, P.W., "Nonexistence of a class of variate generation schemes", _Operations Research Letters_ 31 (2003).

[^17]: For this approximation, if _n_ were infinity, the method would return 1 with probability 1 and so would not approximate _&lambda;_\*_c_, of course.

[^18]: Goyal, V. and Sigman, K., 2012. On simulating a class of Bernstein polynomials. ACM Transactions on Modeling and Computer Simulation (TOMACS), 22(2), pp.1-5.

[^19]: Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560)", arXiv:0906.5560 [math.PR], 2010.

[^20]: Mendo, Luis. "An asymptotically optimal Bernoulli factory for certain functions that can be expressed as power series." Stochastic Processes and their Applications 129, no. 11 (2019): 4366-4384.

[^21]: Holtz, O., Nazarov, F., Peres, Y., "New Coins from Old, Smoothly", _Constructive Approximation_ 33 (2011).

[^22]: Thomas, A.C., Blanchet, J., "[**A Practical Implementation of the Bernoulli Factory**](https://arxiv.org/abs/1106.2508v3)", arXiv:1106.2508v3  [stat.AP], 2012.

[^23]: choose(_n_, _k_) = (1\*2\*3\*...\*_n_)/((1\*...\*_k_)\*(1\*...\*(_n_&minus;_k_))) =  _n_!/(_k_! * (_n_ &minus; _k_)!) is a _binomial coefficient_, or the number of ways to choose _k_ out of _n_ labeled items.  It can be calculated, for example, by calculating _i_/(_n_&minus;_i_+1) for each integer _i_ in the interval \[_n_&minus;_k_+1, _n_\], then multiplying the results (Yannis Manolopoulos. 2002. "[**Binomial coefficient computation: recursion or iteration?**](https://doi.org/10.1145/820127.820168)", SIGCSE Bull. 34, 4 (December 2002), 65–67).  For every _m_&gt;0, choose(_m_, 0) = choose(_m_, _m_) = 1 and choose(_m_, 1) = choose(_m_, _m_&minus;1) = _m_; also, in this document, choose(_n_, _k_) is 0 when _k_ is less than 0 or greater than _n_.

[^24]: _n_! = 1\*2\*3\*...\*_n_ is also known as _n_ factorial; in this document, (0!) = 1.

[^25]: Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560)", arXiv:0906.5560  [math.PR], 2010

[^26]: _Summation notation_, involving the Greek capital sigma (&Sigma;), is a way to write the sum of one or more terms of similar form. For example, $\sum_{k=0}^n g(k)$ means $g(0)+g(1)+...+g(n)$, and $\sum_{k\ge 0} g(k)$ means $g(0)+g(1)+...$.

[^27]: Mossel, Elchanan, and Yuval Peres. New coins from old: computing with unknown bias. Combinatorica, 25(6), pp.707-724, 2005.

[^28]: "_x_ is odd" means that _x_ is an integer and not divisible by 2.  This is true if _x_ &minus; 2\*floor(_x_/2) equals 1, or if _x_ is an integer and the least significant bit of abs(_x_) is 1.

[^29]: "_x_ is even" means that _x_ is an integer and divisible by 2.  This is true if _x_ &minus; 2\*floor(_x_/2) equals 0, or if _x_ is an integer and the least significant bit of abs(_x_) is 0.

[^30]: Qian, Weikang, Marc D. Riedel, and Ivo Rosenberg. "Uniform approximation and Bernstein polynomials with coefficients in the unit interval." European Journal of Combinatorics 32, no. 3 (2011): 448-463.

[^31]: Li, Zhongkai. "Bernstein polynomials and modulus of continuity." Journal of Approximation Theory 102, no. 1 (2000): 171-174.

[^32]: Skorski, Maciej. "[**Handy formulas for binomial moments**](https://arxiv.org/abs/2012.06270)", arXiv:2012.06270 (2020).

[^33]: Bustamante, J., "Estimates of positive linear operators in terms of second order moduli", J. Math. Anal. Appl. 345 (2008).

[^34]: Also known as the Ditzian&ndash;Totik second modulus of smoothness (Ditzian, Z., Totik, V., "Moduli of smoothness", Springer, 1987).

[^35]: A.F. Timan, Theory of Approximation of Functions of a Real Variable, 1994.

[^36]: Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.

[^37]: von Neumann, J., "Various techniques used in connection with random digits", 1951.

[^38]: Peres, Y., "[**Iterating von Neumann's procedure for extracting random bits**](https://projecteuclid.org/euclid.aos/1176348543)", Annals of Statistics 1992,20,1, p. 590-597.

[^39]: Knuth, Donald E. and Andrew Chi-Chih Yao. "The complexity of nonuniform random number generation", in _Algorithms and Complexity: New Directions and Recent Results_, 1976.

[^40]: Mossel, Elchanan, and Yuval Peres. New coins from old: computing with unknown bias. Combinatorica, 25(6), pp.707-724.

[^41]: S. Pae, "[**Binarization Trees and Random Number Generation**](https://arxiv.org/abs/1602.06058v2)", arXiv:1602.06058v2 [cs.DS], 2018.

[^42]: Levy, H., _Stochastic dominance_, 1998.

[^43]: Henry (https://math.stackexchange.com/users/6460/henry), Proving stochastic dominance for hypergeometric random variables, URL (version: 2021-02-20): [**https://math.stackexchange.com/q/4033573**](https://math.stackexchange.com/q/4033573) .

[^44]: Gal, S.G., "Calculus of the modulus of continuity for nonconcave functions and applications", _Calcolo_ 27 (1990)

[^45]: Gal, S.G., 1995. Properties of the modulus of continuity for monotonous convex functions and applications. _International Journal of Mathematics and Mathematical Sciences_ 18(3), pp.443-446.

[^46]: Anastassiou, G.A., Gal, S.G., _Approximation Theory: Moduli of Continuity and Global Smoothness Preservation_, Birkhäuser, 2012.

[^47]: This formula applies to functions with Lipschitz-continuous derivative (a weaker assumption than having three continuous derivatives), but that derivative's Lipschitz constant is a lower bound on $M_{1,3}$, so that formula is useful here.

[^48]: Le Gruyer, Erwan. "Minimal Lipschitz extensions to differentiable functions defined on a Hilbert space." Geometric and Functional Analysis 19, no. 4 (2009): 1101-1118.

[^49]: Herbert-Voss, Ariel, Matthew J. Hirn, and Frederick McCollum. "Computing minimal interpolants in C1, 1 (Rd)." Rev. Mat. Iberoam 33, no. 1 (2017): 29-66.

[^50]: Banderier, C. And Drmota, M., 2015. Formulae and asymptotics for coefficients of algebraic functions. Combinatorics, Probability and Computing, 24(1), pp.1-53.

[^51]: Icard, Thomas F., "Calibrating generative models: The probabilistic Chomsky–Schützenberger hierarchy", _Journal of Mathematical Psychology_ 95 (2020): 102308.

[^52]: Dughmi, Shaddin, Jason Hartline, Robert D. Kleinberg, and Rad Niazadeh. "Bernoulli Factories and Black-box Reductions in Mechanism Design." Journal of the ACM (JACM) 68, no. 2 (2021): 1-30.

[^53]: Etessami, K. and Yannakakis, M., "Recursive Markov chains, stochastic grammars, and monotone systems of nonlinear equations", _Journal of the ACM_ 56(1), pp.1-66, 2009.

[^54]: Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560)", arXiv:0906.5560  [math.PR], 2010.

[^55]: Esparza, J., Kučera, A. and Mayr, R., 2004, July. Model checking probabilistic pushdown automata. In _Proceedings of the 19th Annual IEEE Symposium on Logic in Computer Science_, 2004. (pp. 12-21). IEEE.

[^56]: Elder, Murray, Geoffrey Lee, and Andrew Rechnitzer. "Permutations generated by a depth 2 stack and an infinite stack in series are algebraic." _Electronic Journal of Combinatorics_ 22(1), 2015.

[^57]: Vatan, F., "Distribution functions of probabilistic automata", in _Proceedings of the thirty-third annual ACM symposium on Theory of computing (STOC '01)_, pp. 684-693, 2001.

[^58]: Kindler, Guy and D. Romik, "On distributions computable by random walks on graphs," _SIAM Journal on Discrete Mathematics_ 17 (2004): 624-633.

[^59]: Vatan (2001) claims that a finite-state generator has a continuous `CDF` (unless it produces a single value with probability 1), but this is not necessarily true if the generator has a state that outputs 0 forever.

[^60]: Adamczewski, B., Cassaigne, J. and Le Gonidec, M., 2020. On the computational complexity of algebraic numbers: the Hartmanis–Stearns problem revisited. Transactions of the American Mathematical Society, 373(5), pp.3085-3115.

[^61]: Cobham, A., "On the Hartmanis-Stearns problem for a class of tag machines", in _IEEE Conference Record of 1968 Ninth Annual Symposium on Switching and Automata Theory_ 1968.

[^62]: Adamczewski, B., Bugeaud, Y., "On the complexity of algebraic numbers I. Expansions in integer bases", _Annals of Mathematics_ 165 (2007).

[^63]: Richman, F. (2012). Algebraic functions, calculus style. Communications in Algebra, 40(7), 2671-2683.

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Proofs_on_Cutting_Off_a_Power_Series></a>
### Proofs on Cutting Off a Power Series

**Lemma A1:** Let&mdash; $$f(x)=a_0 x^0 + a_1 x^1 + ...,$$ where the $a_i$ are constants each 0 or greater and sum to a finite value and where $0\le x\le 1$ (the domain is the closed unit interval). Then $f$ is convex and has a maximum at 1.

_Proof:_ By inspection, $f(x)$ is a power series and is nonnegative wherever $x\ge 0$ (and thus wherever $0\le x\le 1$).  Each of its terms has a maximum at 1 since&mdash;

- for $n=0$, $a_0 x^0=a_0$ is a non-negative constant (which trivially reaches its maximum at 1), and
- for each $n$ where $a_0 = 0$, $a_0 x^n$ is the constant 0 (which trivially reaches its maximum at 1), and
- for each other $n$, $x^n$ is a strictly increasing function and multiplying that by $a_n$ (a positive constant) doesn't change whether it's strictly increasing.

Since all of these terms have a maximum at 1 on the domain, so does their sum.

The derivative of $f$ is&mdash; $$f'(x) = a_1 x^0 + ... + a_i x^{i-1} + ...,$$ which is still a power series with nonnegative values of $a_n$, so the proof so far applies to $f'$ instead of $f$.  By induction, the proof so far applies to all derivatives of $f$, including its second derivative.

Now, since the second derivative is nonnegative wherever $x\ge 0$, and thus on its domain, $f$ is convex, which completes the proof. &#x25a1;

**Proposition A2:** For a function $f(x)$ as in Lemma A1, let&mdash; $$g_n(x)=a_0 x^0 + ... + a_n x^n,$$ and have the same domain as $f$.  Then for every $n\ge 1$, $g_n(x)$ is within $\epsilon$ of $f(x)$, where $\epsilon = f(1) - g_n(1)$.

_Proof:_ $g_n$, consisting of the first $n+1$ terms of $f$, is a power series with nonnegative coefficients, so by Lemma A1, it has a maximum at 1.  The same is true for $f-g_n$, consisting of the remaining terms of $f$.  Since the latter has a maximum at 1, the maximum error is $\epsilon = f(1)-g_n(1)$. &#x25a1;

For a function $f$ described in Lemma A1, $f(1)=a_0 1^0 + a_1 1^1 + ... = a_0 + a_1+...$, and $f$'s error behavior is described at the point 1, the algorithms given in Carvalho and Moreira (2022)[^12] &mdash; which apply to infinite sums &mdash; can be used to "cut off" $f$ at a certain number of terms and do so with a controlled error.

<a id=Results_Used_in_Approximate_Bernoulli_Factories></a>
### Results Used in Approximate Bernoulli Factories

**Proposition B1**: Let $f(\lambda)$ map the closed unit interval to itself and be continuous and concave.  Then $W_{n,2}$ and $W_{n,3}$ (as defined in "Approximate Bernoulli Factories for Certain Functions") are nonnegative on the closed unit interval.

_Proof:_ For $W_{n,2}$ it's enough to prove that $B_n(f)\le f$ for every $n\ge 1$.  This is the case because of Jensen's inequality and because $f$ is concave.

For $W_{n,3}$ it must also be shown that $B_n(B_n(f(\lambda)))$ is nonnegative.  For this, using only the fact that $f$ maps the closed unit interval to itself, $B_n(f)$ will have Bernstein coefficients in that interval (each coefficient is a value of $f$) and so will likewise map the closed unit interval to itself (Qian et al. 2011)[^30].  Thus, by induction, $B_n(B_n(f(\lambda)))$ is nonnegative.  The discussion for $W_{n,2}$ also shows that $(f - B_n(f))$ is nonnegative as well.  Thus, $W_{n,3}$ is nonnegative on the closed unit interval. &#x25a1;

**Proposition B2**: Let $f(\lambda)$ map the closed unit interval to itself, be continuous, nowhere decreasing, and subadditive, and equal 0 at 0. Then $W_{n,2}$ is nonnegative on the closed unit interval.

_Proof:_ The assumptions on $f$ imply that $B_n(f)\le 2 f$ (Li 2000)[^31], showing that $W_{n,2}$ is nonnegative on the closed unit interval.  &#x25a1;

> **Note:** A subadditive function $f$ has the property that $f(a+b) \le f(a)+f(b)$ whenever $a$, $b$, and $a+b$ are in $f$'s domain.

**Proposition B3**: Let $f(\lambda)$ map the closed unit interval to itself and have a Lipschitz continuous derivative with Lipschitz constant $L$.  If $f(\lambda) \ge \frac{L \lambda(1-\lambda)}{2m}$ on $f$'s domain, for some $m\ge 1$, then $W_{n,2}$ is nonnegative there, for every $n\ge m$.

_Proof_: Let $E(\lambda, n) = \frac{L \lambda(1-\lambda)}{2n}$. Lorentz (1966)[^4] showed that with this Lipschitz derivative assumption on $f$, $B_n$ differs from $f(\lambda)$ by no more than $E(\lambda, n)$ for every $n\ge 1$.  By inspection, $E(\lambda, n)$ is biggest when $n=1$ and decreases as $n$ increases. Assuming the worst case that $B_n(\lambda) = f(\lambda) + E(\lambda, m)$, it follows that $W_{n,2}=2 f(\lambda) - B_n(\lambda)\ge 2 f(\lambda) - f(\lambda) - E(\lambda, m) = f(\lambda) - E(\lambda, m)\ge 0$ whenever $f(\lambda)\ge E(\lambda, m)$.  Because $E(\lambda, k+1)\le E(\lambda,k)$ for every $k\ge 1$, the preceding sentence holds true for every $n\ge m$. &#x25a1;

The following results deal with a useful quantity when discussing the error in approximating a function by Bernstein polynomials.  Suppose a coin shows heads with probability $p$, and $n$ independent tosses of the coin are made.  Then the total number of heads $X$ follows a _binomial distribution_, and the $r$-th central moment of that distribution is as follows: $$T(n, r, p) = \mathbb{E}[(X-\mathbb{E}[X])^r] = \sum_{k=0}^n (k-np)^r{n \choose k}p^k (1-p)^{n-k},$$ where $\mathbb{E}[.]$ is the expected value ("long-run average").  The following results bound the absolute value of $T$.[^26]

**Result B4** (Molteni 2022)[^39]: If $r$ is an even integer such that $0\le r\le 44$, then $|T(n, r, p)| \le \frac{r!}{((r/2)!)8^{r/2}} n^{r/2}$ for every $n\ge 1$.

**Proposition B5**: For every integer $n\ge 1$, the following is true: $$|T(n, 3, p)| \le \frac{\sqrt{3}}{18\sqrt{n}} n^{3/2} \le \frac{\sqrt{3}}{18} n^{3/2} \lt (963/10000) n^{3/2}.$$

_Proof_: The critical points of $T(n, 3, p)$ (the points where the maximum might be) are at $p=0$, $p=1$, $p=1/2-\sqrt{3}/6$, and $p=1/2+\sqrt{3}/6$.  The moment equals 0 at the points 0 and 1, so that leaves the last two.  Since $T(n, r, p)$ is antisymmetric whenever $r$ is odd, and is nonnegative whenever $r$ is odd and $0\le p \le 1/2$ (Skorski 2020)[^32], it's enough to take the critical point $0 \le p=1/2-\sqrt{3}/6 \le 1/2$ to bound $|T(n, 3, p)|$ on either side.  By inspection, the moment at that critical point is decreasing as $n$ increases, starting with $n=1$. &#x25a1;

**Corollary B6**:  For every integer $n_0\ge 1$, $|T(n, 3, p)| \le \frac{\sqrt{3}}{18\sqrt{n_0}} n^{3/2} < (963/10000)\frac{1}{\sqrt{n_0}} n^{3/2}$ whenever $n\ge n_0$.

**Proposition B7**:  For every integer $n\ge 1$, $|T(n, 5, p)| \le 0.083 n^{5/2}.$  For every integer $n\ge 304$, $|T(n, 5, p)| \le n^2 \le 0.05736 n^{5/2}.$

_Proof_: Evaluating the moment for each $1\le n \le 303$ at its critical point shows that $|T(n,5,p)| < 0.083 n^{5/2}$ for every such $n$.  An upper bound given in sec. 3.1 of Skorski (2020) leads to $|T(n,5,p)| \le n/4+2 {n \choose 2} = n/4+2\frac{n!}{(n-2)!} = n^2 - \frac{3}{4}n \le n^2$ whenever $n\ge 2$, and $n^2/n^{5/2}$ is decreasing as $n$ increases, starting with $n=2$, because its derivative $\frac{-n}{2n^{5/2}}$ is negative whenever $n\ge 2$. Thus it's enough to take the bound $n^2$ at 304, namely 92188, so that $|T(n,5,p)|\le 304^2 = 92188 < 0.05736/n^{5/2}$ for every $n\ge 304$.  This is still less than $0.083 n^{5/2}$, so that bound stands for the first part.  &#x25a1;

**Proposition B8**:  Let _n_&ge;1 be an integer.  Suppose $f(\lambda)$ is concave and has a continuous second derivative on the closed unit interval.  Then $U_{n,2}(f)$ (as defined in "Approximate Bernoulli Factories for Continuous Functions") is within $3 M\lambda(1-\lambda)/(n^2)$ and within $0.75 M/(n^2)$ of $f$, where $M$ is the absolute value of the maximum of $f$'s second derivative.

_Proof:_ Theorem 11 of Bustamante (2008)[^33] provides error bounds for certain polynomials that come close to a continuous function.  To use this result here, the following conditions are verified:

- $U_{n,2}$ is non-negative (because $f$ is concave, making $W_{n,2}$, and therefore its Bernstein polynomial $U_{n,2}$, non-negative by Proposition B1).
- $U_{n,2}$ is a linear operator (Micchelli 1973)[^6].  Notably, it equals $f$ whenever $f$ is a linear function.
- $U_{n,2}(\lambda) = \lambda$ and $U_{n,2}(1) = 1$.
- $\phi(\lambda)=1$ which is positive and concave.
- $(U_{n,2}(\lambda^2)-\lambda^2) = \lambda(1-\lambda)/n^2$.

Then by Theorem 11, $U_{n,2}$ is close to $f$ by at most&mdash; $$\left(\frac32+\frac{3}{(2h^2\phi(\lambda)^2)}\frac{\lambda(1-\lambda)}{n^2}\right) \omega_{2}^{\phi}(f, h),$$ where $\omega_{2}^{\phi}(f, h)$ is a function[^34] that satisfies $\omega_{2}^{\phi}(f, h)\le M h^2$ whenever $h\le 1/2$, for the given choice of $\phi$ (Timan 1994)[^35].  So&mdash; $$\left(\frac32+\frac{3}{2h^2\phi(\lambda)^2}\frac{\lambda(1-\lambda)}{n^2}\right) \omega_{2}^{\phi}(f, h) \le \left(\frac32+\frac{3\lambda(1-\lambda)}{2h^2n^2}\right) M h^2 = \epsilon(f, h, n).$$ Finally, the change of variable $h=\sqrt{\lambda(1-\lambda)}/n$ is made (and $h$ is at most 1/2 given $n\ge 1$).  This change of variable leads to&mdash; $$\epsilon(f,h,n)=\left(\frac32+\frac{3}{2}\right) M (\sqrt{\lambda(1-\lambda)}/n)^2 = \frac{3M\lambda(1-\lambda)}{n^2} \le \frac{3M}{4n^2} = 0.75M/(n^2).$$ &#x25a1;

> **Note:** The requirement of being concave is needed here to ensure $U_{n,2}(f)$ is non-negative.  It is open whether this proposition's conclusion remains true if this requirement is dropped.

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

Let _f_(_&lambda;_) be a function whose domain is the closed unit interval or a subset of it, and that maps its domain to the closed unit interval.  The domain of _f_ gives the allowable values of _&lambda;_, which is the input coin's probability of heads.

_f_ admits a Bernoulli factory if and only if _f_ is constant on its domain, or is continuous and _polynomially bounded_ on its domain, as defined later in the section "Proofs for Polynomial-Building Schemes" (Keane and O'Brien 1994\)[^36].

If _f_(_&lambda;_) meets these sufficient conditions, it admits a Bernoulli factory and is Hölder continuous (see "[**Definitions**](#Definitions)"):

- _f_(_&lambda;_) maps the closed unit interval to itself.
- _f_(_&lambda;_) is continuous.
- 0 < _f_(_&lambda;_) < 1 whenever 0 < _&lambda;_ < 1.
- _f_(_&lambda;_) is algebraic over rational numbers (that is, there is a nonzero polynomial _P_(_x_, _y_) in two variables and whose coefficients are rational numbers, such that _P_(_x_, _f_(_x_)) = 0 for every _x_ in the domain of _f_).

A [**proof by Reid Barton**](https://mathoverflow.net/a/395018/171320) begins by showing that _f_ is a _semialgebraic function_, so that by a known inequality and the other conditions, it meets the definitions of being Hölder continuous and polynomially bounded.

<a id=Which_functions_don_t_require_outside_randomness_to_simulate></a>
### Which functions don't require outside randomness to simulate?

The function _f_(_&lambda;_) is _strongly simulable_ if it admits a Bernoulli factory algorithm that uses nothing but the input coin as a source of randomness (Keane and O'Brien 1994\)[^36].  See "[**Randomized vs. Non-Randomized Algorithms**](https://peteroupc.github.io/bernoulli.html#Randomized_vs_Non_Randomized_Algorithms)".

**Strong Simulability Statement.** A function _f_(_&lambda;_) is strongly simulable only if&mdash;

1. _f_ is constant on its domain, or is continuous and polynomially bounded on its domain, and
2. _f_ maps the closed unit interval or a subset of it to the closed unit interval, and
3. _f_(0) equals 0 or 1 whenever 0 is in the domain of _f_, and
4. _f_(1) equals 0 or 1 whenever 1 is in the domain of _f_.

Keane and O'Brien already showed that _f_ is strongly simulable if conditions 1 and 2 are true and neither 0 nor 1 are included in the domain of _f_.  Conditions 3 and 4 are required because _&lambda;_ (the probability of heads) can be 0 or 1 so that the input coin returns 0 or 1, respectively, every time.  This is called a "degenerate" coin.  When given just a degenerate coin, no algorithm can produce one value with probability greater than 0, and another value with the opposite probability.  Rather, the algorithm can only produce a constant value with probability 1.  In the Bernoulli factory problem, that constant is either 0 or 1, so a Bernoulli factory algorithm for _f_ must return 1 with probability 1, or 0 with probability 1, when given just a degenerate coin and no outside randomness, resulting in conditions 3 and 4.

To show that _f_ is strongly simulable, it's enough to show that there is a Bernoulli factory for _f_ that must flip the input coin and get 0 and 1 before it uses any outside randomness.

**Proposition 1.** _If f(&lambda;) is described in the strong simulability statement and is a polynomial with computable coefficients, it is strongly simulable._

_Proof:_ If _f_ is the constant 0 or 1, the proof is trivial: simply return 0 or 1, respectively.

Otherwise: Let _a_\[_j_\] be the _j_<sup>th</sup> coefficient of the polynomial in Bernstein form.  Consider the following algorithm, modified from (Goyal and Sigman 2012\)[^18].

1. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.
2. If 0 is in the domain of _f_ and if _j_ is 0, return _f_(0). (By condition 3, _f_(0) must be either 0 or 1.)
3. If 1 is in the domain of _f_ and if _j_ is _n_, return _f_(1). (By condition 4, _f_(1) must be either 0 or 1.)
4. With probability _a_\[_j_\], return 1.  Otherwise, return 0. (For example, generate a uniformly distributed random variate, greater than 0 and less than 1, then return 1 if that variate is less than _a_\[_j_\], or 0 otherwise.  _a_\[_j_\] is the coefficient _j_ of the polynomial written in Bernstein form), or 0 otherwise.

(By the properties of the Bernstein form, _a_\[0\] will equal _f_(0) and _a_\[_n_\] will equal _f_(1) whenever 0 or 1 is in the domain of _f_, respectively.)

Step 4 is done by first generating unbiased bits (such as with the von Neumann trick of flipping the input coin twice until the flip returns 0 then 1 or 1 then 0 this way, then taking the result as 0 or 1, respectively (von Neumann 1951\)[^37]), then using the algorithm in "[**Digit Expansions**](https://peteroupc.github.io/bernoulli.html#Digit_Expansion)" to produce the probability _a_\[_j_\].  The algorithm computes _a_\[_j_\] bit by bit and compares the computed value with the generated bits.  Since the coin returned both 0 and 1 in step 1 earlier in the algorithm, we know the coin isn't degenerate, so that step 4 will finish with probability 1.  Now, since the Bernoulli factory used only the input coin for randomness, this shows that _f_ is strongly simulable. &#x25a1;

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

- _M_ be the Lipschitz constant of _f_ (its derivative's absolute value of the maximum if _f_ is continuous), or a computable number greater than this.

- _l_ be either 0 if 0 is in the domain of _f_, or 1 otherwise, and
- _u_ be either 0 if 1 is in the domain of _f_, or 1 otherwise.

To build _g_, take its degree as ceil(_M_)+1 or greater (so that _g_'s Lipschitz constant is greater than _M_ and _g_ has ceil(_M_) + 2 coefficients), then set the first coefficient as _l_, the last coefficient as _u_, and the remaining coefficients as 1. (As a result, the polynomial _g_ will have computable coefficients.) Then _g_ will meet the additional condition for Lemma 1 and the result follows from that lemma. &#x25a1;

**Lemma 4.** _If f(&lambda;) is described in the strong simulability statement, is Lipschitz continuous, and is such that f(0) = 0 and f(1) = 1 (so that 0 and 1 are in the domain of f), then f is strongly simulable._

_Proof:_ Let _M_ and _l_ be as in Lemma 3.

To build _g_ and _&omega;_, take their degree as ceil(_M_)+1 or greater (so that their Lipschitz constant is greater than _M_ and each polynomial has ceil(_M_) + 2 coefficients), then for each polynomial, set its first coefficient as _l_ and the last coefficient as 1. The remaining coefficients of _g_ are set as 1 and the remaining coefficients of _&omega;_ are set as 0.  (As a result, the polynomial _g_ will have computable coefficients.)  Then _g_ and _&omega;_ will meet the additional conditions for Lemma 2 and the result follows from that lemma. &#x25a1;

_Proof of Proposition 3:_ In the proof of proposition 2, replace Lemma 1 and Lemma 2 with Lemma 3 and Lemma 4, respectively. &#x25a1;

I suspect that a function $f$ that maps the closed interval or a subset thereof to the closed unit interval is strongly simulable if and only if&mdash;

- $f$ is constant on its domain, or is continuous and polynomially bounded on its domain, and
- $f(0)$ and $f(1)$ are each 0, 1, or undefined, and
- 0 is not in the domain of $f$, or there are $\epsilon>0$ and a Lipschitz continuous function $g(x)$ such that $f(x)=g(x)$ whenever $0\le x\lt \epsilon$ and $x$ is in $f$'s domain, and
- 1 is not in the domain of $f$, or there are $\epsilon>0$ and a Lipschitz continuous function $h(x)$ such that $f(x)=h(x)$ whenever $1-\epsilon\lt x\le 1$ and $x$ is in $f$'s domain.

This is suspected by observing that for every integer $n>0$ and every Bernoulli factory function $f(x)$, $(1-(1-x)^n) \cdot f(x)$ is Lipschitz continuous at 0 with Lipschitz constant no more than $n$. ($(1-x)^n$ is the probability of the biased coin showing zero $n$ times in a row.)

<a id=Multiple_Output_Bernoulli_Factory></a>
### Multiple-Output Bernoulli Factory

A related topic is a Bernoulli factory that takes a coin with unknown probability of heads _&lambda;_ and produces one or more samples of the probability _f_(_&lambda;_).  This section calls it a _multiple-output Bernoulli factory_.

Obviously, any single-output Bernoulli factory can produce multiple outputs by running itself multiple times.  But for some functions _f_, it may be that producing multiple outputs at a time may use fewer input coin flips than producing one output multiple times.

Let _a_ and _b_ be real numbers satisfying 0 < _a_ < _b_ < 1, such as _a_=1/100, _b_=99/100.  Define the _entropy bound_ as _h_(_f_(_&lambda;_))/_h_(_&lambda;_) where _h_(_x_) = &minus;_x_\*ln(_x_)&minus;(1&minus;_x_)\*ln(1&minus;_x_) is related to the Shannon entropy function.  The question is:

_When the probability &lambda; is such that a &le; &lambda; &le; b, is there a multiple-output Bernoulli factory for f(&lambda;) with an expected ("long-run average") number of input coin flips per sample that is arbitrarily close to the entropy bound?  Call such a Bernoulli factory an **optimal factory**._

(See Nacu and Peres (2005, Question 2\)[^1].)

So far, the following functions do admit an _optimal factory_:

- The functions _&lambda;_ and 1 &minus; _&lambda;_.
- Constants _c_ satisfying 0 &le; _c_ &le; 1.  As Nacu and Peres (2005\)[^1] already showed, any such constant admits an optimal factory: generate unbiased random bits using Peres's iterated von Neumann extractor (Peres 1992\)[^38], then build a binary tree that generates 1 with probability _c_ and 0 otherwise (Knuth and Yao 1976\)[^39].

It is easy to see that if an _optimal factory_ exists for _f_(_&lambda;_), then one also exists for 1 &minus; _f_(_&lambda;_): simply change all ones returned by the _f_(_&lambda;_) factory into zeros and vice versa.

Also, as Yuval Peres (Jun. 24, 2021) told me, there is an efficient multiple-output Bernoulli factory for _f_(_&lambda;_) = _&lambda;_/2: the key is to flip the input coin enough times to produce unbiased random bits using his extractor (Peres 1992\)[^20], then multiply each unbiased bit with another input coin flip to get a sample from _&lambda;_/2.  Given that the sample is equal to 0, there are three possibilities that can "be extracted to produce more fair bits": either the unbiased bit is 0, or the coin flip is 0, or both are 0.

This algorithm, though, doesn't count as an _optimal factory_, and Peres described this algorithm only incompletely.  By simulation and trial and error I found an improved version of the algorithm.  It uses two randomness extractors (extractor 1 and extractor 2) that produce unbiased random bits from biased data (which is done using a method given later in this section).  The extractors must be asymptotically optimal (they must approach the entropy limit as closely as desired); one example is the iterated von Neumann construction in Peres (1992\)[^38].  The algorithm consists of doing the following in a loop until the desired number of outputs is generated.

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

The algorithm is a modified version of the "block simulation" in Mossel and Peres (2005, Proposition 2.5\)[^40], which also "extracts" residual randomness with the help of six asymptotically optimal randomness extractors.  In the algorithm, let _r_ be an integer such that, for every integer _i_ in \[0, _k_], _e_\[_i_\] < choose(_k_, _i_)\*choose(2\*_r_, _r_).

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

<small><sup>&dagger;</sup> For example, by translating the number to input bits via Pae's entropy-preserving binarization (Pae 2018\)[^41].  But correctness might depend on how this is done; after all, the number of coin flips per sample must equal or exceed the entropy bound for every _&lambda;_.</small>

<a id=Proofs_for_Polynomial_Building_Schemes></a>
### Proofs for Polynomial-Building Schemes

This section shows mathematical proofs for some of the polynomial-building schemes of this page.

In the following results:

- A _strictly bounded factory function_ means a continuous function on the closed unit interval, with a minimum of greater than 0 and a maximum of less than 1.
- A function _f_(_&lambda;_) is _polynomially bounded_ if both _f_(_&lambda;_) and 1&minus;_f_(_&lambda;_) are greater than or equal to min(_&lambda;_<sup>_n_</sup>, (1&minus;_&lambda;_)<sup>_n_</sup>) for some integer _n_ (Keane and O'Brien 1994\)[^36].
- A _modulus of continuity_ of a function _f_ means a nonnegative and nowhere decreasing function _&omega;_ on the closed unit interval, for which _&omega;_(0) = 0, and for which abs(f(_x_) &minus; f(_y_)) &le; _&omega;_(abs(_x_&minus;_y_)) for every _x_ in the closed unit interval and every _y_ in the closed unit interval.  Loosely speaking, a modulus of continuity _&omega;_(_&delta;_) is greater than or equal to _f_'s maximum range in a window of size _&delta;_.

**Lemma 1.** _Let f(&lambda;) be a continuous and nowhere decreasing function, and let X<sub>k</sub> be a hypergeometric(2\*n, k, n) random variable, where n&ge;1 is a constant integer and k is an integer in [0, 2\*n] .  Then the expected value of f(X<sub>k</sub>/n) decreases nowhere as k increases._

_Proof._ This is equivalent to verifying whether _X_<sub>_m_+1</sub>/_n_ "dominates" _X_<sub>_m_</sub>/_n_ (and, obviously by extension, _X_<sub>_m_+1</sub> "dominates" _X_<sub>_m_</sub>) in terms of first-degree stochastic dominance (Levy 1998\)[^42].   This means that the probability that (_X_<sub>_m_+1</sub> &le; _j_) is less than or equal to that for _X_<sub>_m_</sub> for each _j_ satisfying 0 &le; _j_ &le; _n_.  A proof of this was given by the user "Henry" of the _Mathematics Stack Exchange_ community[^43]. &#x25a1;

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
>     1. If _f_ is strictly increasing and convex, _&omega;_(_x_) can equal _f_(1) &minus; _f_(1&minus;_x_) (Gal 1990\)[^44]; (Gal 1995\)[^45].
>     2. If _f_ is strictly decreasing and convex, _&omega;_(_x_) can equal _f_(0) &minus; _f_(_x_) (Gal 1990\)[^44]; (Gal 1995\)[^45].
>     3. If _f_ is strictly increasing and concave, _&omega;_(_x_) can equal _f_(_x_) &minus; _f_(0) (by symmetry with 2).
>     4. If _f_ is strictly decreasing and concave, _&omega;_(_x_) can equal _f_(1&minus;_x_) &minus; _f_(1) (by symmetry with 1).
>     5. If _f_ is concave and is strictly increasing then strictly decreasing, then _&omega;_(_h_) can equal (_f_(min(_h_, _&sigma;_))+(_f_(1&minus;min(_h_, 1&minus;_&sigma;_))&minus;_f_(1)), where _&sigma;_ is the point where _f_ stops increasing and starts decreasing (Anastassiou and Gal 2012\)[^46].

**Theorem 1.** _Let $f$ be a strictly bounded factory function, let $n_0\ge 1$ be an integer, and let $\phi(n)$ be a function that takes on a nonnegative value.  Suppose $f$ is such that the expression (1) in Lemma 2 is less than or equal to $\phi(n)$ whenever $n\ge n_0$ is an integer power of 2.  Let&mdash;_

$$\eta(n)=\sum_{k\ge \log_2(n)} \phi(2^k),$$

_for every integer n&ge;1 that's a power of 2.  If the series &eta;(n) converges to a finite value for each such $n$, and if it converges to 0 as $n$ gets large, then the following scheme for f(&lambda;) is valid in the following sense:_

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

**Lemma 3.** _Let $f$ be a strictly bounded factory function. Let $S$ be an infinite set of positive integers.  For each integer $n\ge 1$, let $W_n(\lambda)$ be a function, and let $\epsilon_n(f)$ be a nonnegative constant that depends on $f$ and $n$.  Suppose that there are polynomials $g_n$ and $h_n$ (for each $n$ in $S$) as follows:_

1. _$g_n$ and $h_n$ have Bernstein coefficients $W_n(k/n) - \epsilon_n(f)$ and $W_n(k/n) + \epsilon_n(f)$, respectively ($0\le k\le n$)._
2. _$g_n \le h_n$._
3. _$g_n$ and $h_n$ converge to $f$ as $n$ gets large._
4. $(g_{m}-g_n)$ _and_ $(h_{n}-h_{m})$ _are polynomials with nonnegative Bernstein coefficients once they are rewritten to polynomials in Bernstein form of degree exactly $m$, where $m$ is the smallest number greater than $n$ in $S$._

_Then for each $n$ in $S$, $|f(\lambda) - B_n(W_n(\lambda))| \le \epsilon_n(f)$ whenever $0\le \lambda\le 1$, where $B_n(W_n(\lambda))$ is the Bernstein polynomial of degree $n$ of the function $W_n(\lambda)$._

_Proof:_ $W_n(k/n)$ is the $k$-th Bernstein coefficient of $B_n(W_n(\lambda))$, which is $g_n$ and $h_n$ before they are shifted downward and upward, respectively, by $\epsilon_n(f)$.  Moreover, property 4 in the lemma corresponds to condition (iv) of Nacu and Peres (2005)[^1], which implies that, for every $m>n$, $g_{n}(\lambda)\le g_{m}(\lambda)\le f(\lambda)$ (the lower polynomials "increase") and $h_{n}(\lambda)\ge h_{m}(\lambda)\ge f(\lambda)$ (the upper polynomials "decrease") for every $n\ge 1$ (Nacu and Peres 2005, Remark A)[^1].

Then if $B_n(W_n(\lambda)) < f(\lambda)$ for some $\lambda$ in the closed unit interval, shifting the left-hand side upward by $\epsilon_n(f)$ (a nonnegative constant) means that $h_n = B_n(W_n(\lambda))+\epsilon_n(f) \ge f(\lambda)$, and rearranging this expression leads to $f(\lambda) - B_n(W_n(\lambda)) \le \epsilon_n(f)$.

Likewise, if $B_n(W_n(\lambda)) > f(\lambda)$ for some $\lambda$ in the closed unit interval, shifting the left-hand side downward by $\epsilon_n(f)$ means that $g_n = B_n(W_n(\lambda))-\epsilon_n(f) \le f(\lambda)$, and rearranging this expression leads to $B_n(W_n(\lambda)) - f(\lambda) \le \epsilon_n(f)$.

This combined means that $|f(x) - B_n(W_n(\lambda))| \le \epsilon_n(f)$ whenever $0\le \lambda\le 1$.  &#x25a1;

**Corollary 4**.  _If $f(\lambda)$ satisfies a scheme given in Theorem 1 with $n_0\ge 1$, then $B_n(f(\lambda))$ comes within $\eta(n)$ of $f$ for every integer $n\ge n_0$ that's a power of 2; that is, $|B_n(f(\lambda))| \le \eta(n)$ for every such $n$._

<a id=A_Conjecture_on_Polynomial_Approximation></a>
#### A Conjecture on Polynomial Approximation

The following conjecture suggests there may be a way to easily adapt other approximating polynomials, besides the ordinary Bernstein polynomials, to the Bernoulli factory problem.

**Conjecture.**

Let $r\ge 1$, and let $f$ be a strictly bounded factory function whose $r$-th derivative is continuous.  Let $M$ be the absolute value of the maximum of $f$ and its derivatives up to the $r$-th derivative. Let $W_{2^0}(\lambda), W_{2^1}(\lambda), ..., W_{2^n}(\lambda),...$ be functions on the closed unit interval that converge uniformly to $f$ (that is, for every tolerance level, all $W_{2^i}$ after some value $i$ are within that tolerance level of $f$ at all points on the closed unit interval).

For each integer $n\ge1$ that's a power of 2, suppose that there is $D>0$ such that&mdash; $$|f(\lambda)-B_n(W_n(\lambda))| \le DM/n^{r/2},$$ whenever $0\le \lambda\le 1$, where $B_n(W_n(\lambda))$ is the degree-$n$ Bernstein polynomial of $W_n(\lambda)$.

Then there is $C_0\ge D$ such that for every $C\ge C_0$, there are polynomials $g_n$ and $h_n$ (for each $n\ge 1$) as follows:

1. $g_n$ and $h_n$ have Bernstein coefficients $W_n(k/n) - CM/n^{r/2}$ and $W_n(k/n) + CM/n^{r/2}$, respectively ($0\le k\le n$), if $n$ is a power of 2, and $g_n=g_{n-1}$ and $h_n=h_{n-1}$ otherwise.
2. $g_n$ and $h_n$ converge to $f$ as $n$ gets large.
3. $(g_{n+1}-g_{n})$ and $(h_{n}-h_{n+1})$ are polynomials with nonnegative Bernstein coefficients once they are rewritten to polynomials in Bernstein form of degree exactly $n+1$.

Equivalently (see also Nacu and Peres 2005), there is $C_1>0$ such that, for each integer $n\ge 1$ that's a power of 2&mdash; $$\left|\left(\sum_{i=0}^k \left(W_n\left(\frac{i}{n}\right)\right) {n\choose i}{n\choose {k-i}}/{2n \choose k}\right)-W_{2n}\left(\frac{k}{2n}\right)\right|\le \frac{C_1 M}{n^{r/2}},$$ whenever $0\le k\le 2n$, so that $C=\frac{C_1}{1-\sqrt{2/2^{r+1}}}$.

It is further conjectured that the same value of $C_0$ (or $C_1$) suffices when $f$ has a Lipschitz continuous $(r-1)$-th derivative and $M$ is the absolute value of the maximum of $f$ and the Lipschitz constants of $f$ and its derivatives up to the $(r-1)$-th derivative.

> **Note:** By Lemma 3, $B_n(W_n(f(\lambda)))$ would be close to $f(\lambda)$ by at most $C_0 M/n^{r/2}$.  Properties 2 and 3 above correspond to (iii) and (iv) in Nacu and Peres (2005, Proposition 3\)[^1].

---------------------

The following lower bounds on $C_0$ can be shown.  In the table:

- $M_{0,r}$ is the absolute value of the maximum of $f(\lambda)$ and its $r$-th derivative (Güntürk and Li 2021)[^8].

- $M_{1,r}$ is the absolute value of the maximum of $f(\lambda)$ and its derivatives up to the $r$-th derivative.  Thus, $M_{1,r}\ge M_{0,r}$.

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

To aid in this goal, there is a formula to find the least possible Lipschitz constant for $f$'s first derivative (see "Definitions")[^47], given a finite set of points (0, 1/2, and 1 in the case at hand) and the values of $f$ and $f'$ at those points (Le Gruyer 2009)[^48]; see also (Herbert-Voss et al. 2017)[^49]. Denote $L(.,.,.)$ as this least possible Lipschitz constant.  Then according to that formula&mdash; $$L([0, 1/2, 1], [0, t, 0], [z_1, z_2, z_3]) = \max(2 \sqrt{\left|{z_{1} - z_{2}}\right|^{2} + \left|{- 4 t + z_{1} + z_{2}}\right|^{2}} + 2 \left|{- 4 t + z_{1} + z_{2}}\right|,$$ $$\sqrt{\left|{z_{1} - z_{3}}\right|^{2} + \left|{z_{1} + z_{3}}\right|^{2}} + \left|{z_{1} + z_{3}}\right|,$$ $$2 \sqrt{\left|{z_{2} - z_{3}}\right|^{2} + \left|{4 t + z_{2} + z_{3}}\right|^{2}} + 2 \left|{4 t + z_{2} + z_{3}}\right|)$$ (where $t$ is greater than 0 and less than 1), so only $f'$ values in the interval $[-8f(1/2), 8f(1/2)]$ have to be checked.

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

<a id=Pushdown_Automata_and_Algebraic_Functions></a>
### Pushdown Automata and Algebraic Functions

This section has mathematical proofs showing which kinds of algebraic functions (functions that can be a solution of a nonzero polynomial equation) can be simulated with a pushdown automaton (a state machine with a stack).

The following summarizes what can be established about these algebraic functions:

- sqrt(_&lambda;_) can be simulated.
- Every rational function with rational coefficients that maps the open interval (0, 1) to itself can be simulated.
- If _f_(_&lambda;_) can be simulated, so can any Bernstein-form polynomial in the variable _f_(_&lambda;_) with coefficients that can be simulated.
- If _f_(_&lambda;_) and _g_(_&lambda;_) can be simulated, so can _f_(_&lambda;_)\*_g_(_&lambda;_), _f_(_g_(_&lambda;_)), and _g_(_f_(_&lambda;_)).
- If a full-domain pushdown automaton (defined later) can generate words of a given length with a given probability (a _probability distribution_ of word lengths), then the probability generating function for that distribution can be simulated, as well as for that distribution conditioned on a finite set or periodic infinite set of word lengths (for example, all odd word lengths only).
- If a stochastic context-free grammar (defined later) can generate a probability distribution of word lengths, and terminates with probability 1, then the probability generating function for that distribution can be simulated.
- Every quadratic irrational number between 0 and 1 can be simulated.

It is not yet known whether the following functions can be simulated:

- _&lambda;_<sup>1/_p_</sup> for prime numbers _p_ greater than 2. The answer may be no; Banderier and Drmota (2015)[^50] proved results that show, among other things, that $\lambda^{1/p}$, where $p$ is not a power of 2, is not a possible solution to $P(\lambda) = 0$, where $P(\lambda)$ is a polynomial whose coefficients are non-negative real numbers.
- min(_&lambda;_, 1&minus;_&lambda;_).

--------------------------------

The following definitions are used in this section:

1. A _pushdown automaton_ has a finite set of _states_ and a finite set of _stack symbols_, one of which is called EMPTY, and takes a coin that shows heads with an unknown probability. It starts at a given state and its stack starts with EMPTY.  On each iteration:
    - The automaton flips the coin.
    - Based on the coin flip (HEADS or TAILS), the current state, and the top stack symbol, it moves to a new state (or keeps it unchanged) and replaces the top stack symbol with zero, one or two symbols.  Thus, there are three kinds of _transition rules_:
         - (_state_, _flip_, _symbol_) &rarr; (_state2_, {_symbol2_}): move to _state2_, replace top stack symbol with same or different one.
         - (_state_, _flip_, _symbol_) &rarr; (_state2_, {_symbol2_, _new_}): move to _state2_, replace top stack symbol with _symbol2_, then _push_ a new symbol (_new_) onto the stack.
         - (_state_, _flip_, _symbol_) &rarr; (_state2_, {}): move to _state2_, _pop_ the top symbol from the stack.

    When the stack is empty, the machine stops, and returns either 0 or 1 depending on the state it ends up at.  (Because each left-hand side has no more than one possible transition, the automaton is _deterministic_.)

2. A _full-domain pushdown automaton_ means a pushdown automaton that terminates with probability 1 given a coin with probability of heads _&lambda;_, for every _&lambda;_ greater than 0 and less than 1.
3. **PDA** is the class of functions _f_(_&lambda;_) that satisfy 0<_f_(_&lambda;_)<1 whenever 0<_&lambda;_<1, and can be simulated by a full-domain pushdown automaton.  **PDA** also includes the constant functions 0 and 1.
4. **ALGRAT** is the class of functions that satisfy 0<_f_(_&lambda;_)<1 whenever 0<_&lambda;_<1, are continuous, and are algebraic over the rational numbers (they satisfy a nonzero polynomial system whose coefficients are rational numbers). **ALGRAT** also includes the constant functions 0 and 1.
5. A _probability generating function_ has the form _p_<sub>0</sub>\*_&lambda;_<sup>0</sup> + _p_<sub>1</sub>\*_&lambda;_<sup>1</sup> + ..., where _p_<sub>_i_</sub> (a _coefficient_) is the probability of getting _i_.

> **Notes:**
>
> 1. Mossel and Peres (2005\)[^27] defined pushdown automata to start with a non-empty stack of _arbitrary_ size, and to allow each rule to replace the top symbol with an _arbitrary_ number of symbols.  Both cases can be reduced to the definition in this section.
> 2. Pushdown automata, as defined here, are very similar to so-called _probabilistic right-linear indexed grammars_ (Icard 2020\)[^51] and can be translated to those grammars as well as to _probabilistic pushdown systems_ (Etessami and Yannakakis 2009\)[^51], as long as those grammars and systems use only transition probabilities that are rational numbers.

**Proposition 0** (Mossel and Peres 2005[^27], Theorem 1.2): _A full-domain pushdown automaton can simulate a function that maps (0, 1) to itself only if the function is in class **ALGRAT**._

It is not known whether **ALGRAT** and **PDA** are equal, but the following can be established about **PDA**:

**Lemma 1A:** _Let g(&lambda;) be a function in the class **PDA**, and suppose a pushdown automaton F has two rules of the form (`state`, HEADS, `stacksymbol`) &rarr; RHS1 and (`state`, TAILS, `stacksymbol`) &rarr; RHS2, where `state` and `stacksymbol` are a specific state/symbol pair among the left-hand sides of F's rules.  Then there is a pushdown automaton that transitions to RHS1 with probability g(&lambda;) and to RHS2 with probability 1&minus;g(&lambda;) instead._

_Proof:_ If RHS1 and RHS2 are the same, then the conclusion holds and nothing has to be done.  Thus assume RHS1 and RHS2 are different.

Let _G_ be the full-domain pushdown automaton for _g_. Assume that machines _F_ and _G_ stop when they pop EMPTY from the stack. If this is not the case, transform both machines by renaming the symbol EMPTY to EMPTY&prime;&prime;, adding a new symbol EMPTY&prime;&prime; and new starting state X0, and adding rules (X0, _flip_, EMPTY) &rarr; (_start_, {EMPTY&prime;&prime;}) and rule (_state_, _flip_, EMPTY) &rarr; (_state_, {}) for all states other than X0, where _start_ is the starting state of _F_ or _G_, as the case may be.

Now, rename each state of _G_ as necessary so that the sets of states of _F_ and of _G_ are disjoint (mutually exclusive).  Then, add to _F_ a new stack symbol EMPTY&prime; (or a name not found in the stack symbols of G, as the case may be).  Then, for the following two pairs of rules in _F_, namely&mdash;

(_state_, HEADS, _stacksymbol_) &rarr; (_state2heads_, _stackheads_), and<br>
(_state_, TAILS, _stacksymbol_) &rarr; (_state2tails_, _stacktails_),

add two new states _state_<sub>0</sub> and _state_<sub>1</sub> that correspond to _state_ and have names different from all other states, and replace that rule with the following rules:

(_state_, HEADS, _stacksymbol_) &rarr; (_gstart_, {_stacksymbol_, EMPTY&prime;}),<br>
(_state_, TAILS, _stacksymbol_) &rarr; (_gstart_, {_stacksymbol_, EMPTY&prime;}),<br>
(_state_<sub>0</sub>, HEADS, _stacksymbol_) &rarr; (_state2heads_, _stackheads_),<br>
(_state_<sub>0</sub>, TAILS, _stacksymbol_) &rarr; (_state2heads_, _stackheads_),<br>
(_state_<sub>1</sub>, HEADS, _stacksymbol_) &rarr; (_state2tails_, _stacktails_), and<br>
(_state_<sub>1</sub>, TAILS, _stacksymbol_) &rarr; (_state2tails_, _stacktails_),<br>

where _gstart_ is the starting state for _G_, and copy the rules of the automaton for _G_ onto _F_, but with the following modifications:

- Replace the symbol EMPTY in _G_ with EMPTY&prime;.
- Replace each state in _G_ with a name distinct from all other states in _F_.
- Replace each rule in _G_ of the form (_state_, _flip_, EMPTY&prime;) &rarr; (_state2_, {}), where _state2_ is a final state of _G_ associated with output 1, with the rule (_state_, _flip_, EMPTY&prime;) &rarr; ( _state_<sub>1</sub>, {}).
- Replace each rule in _G_ of the form (_state_, _flip_, EMPTY&prime;) &rarr; (_state2_, {}), where _state2_ is a final state of _G_ associated with output 0, with the rule (_state_, _flip_, EMPTY&prime;) &rarr; ( _state_<sub>0</sub>, {}).

Then, the final states of the new machine are the same as those for the original machine _F_. &#x25a1;

**Lemma 1B:**  _There are pushdown automata that simulate the probabilities 0 and 1._

_Proof:_ The probability 0 automaton has the rules (START, HEADS, EMPTY) &rarr; (START, {}) and (START, TAILS, EMPTY) &rarr; (START, {}), and its only state START is associated with output 0. The probability 1 automaton is the same, except START is associated with output 1.  Both automata obviously terminate with probability 1. &#x25a1;

Because of Lemma 1A, it's possible to label each left-hand side of a pushdown automaton's rules with not just HEADS or TAILS, but also a rational number or another function in **PDA**, as long as for each state/symbol pair, the probabilities for that pair sum to 1.  For example, rules like the following are now allowed:

(START, 1/2, EMPTY) &rarr; ..., (START, sqrt(_&lambda;_)/2, EMPTY) &rarr; ..., (START, (1 &minus; sqrt(_&lambda;_))/2, EMPTY) &rarr; ....

**Proposition 1A:** _If f(&lambda;) is in the class **PDA**, then so is every polynomial written as&mdash;_

$${n\choose 0}f(\lambda)^0 (1-f(\lambda))^{n-0} a[0] + {n\choose 1}f(\lambda)^1 (1-f(\lambda))^{n-1} a[1] + ... + {n\choose n}f(\lambda)^n (1-f(\lambda))^{n-n} a[n],$$

_where n is the polynomial's degree and a\[0], a\[1], ..., a\[n] are functions in the class **PDA**._

_Proof Sketch_: This corresponds to a two-stage pushdown automaton that follows the algorithm of Goyal and Sigman (2012)[^18]\: The first stage counts the number of "heads" shown when flipping the f(&lambda;) coin, and the second stage flips another coin that has success probability _a_\[_i_\], where _i_ is the number of "heads". The automaton's transitions take advantage of Lemma 1A.  &#x25a1;

**Proposition 1:** _If f(&lambda;) and g(&lambda;) are functions in the class **PDA**, then so is their product, namely f(&lambda;)\*g(&lambda;)._

_Proof:_ Special case of Proposition 1A with _n_=1, _f_(_&lambda;_)=_f_(_&lambda;_), _a_\[0]=0 (using Lemma 1B), and _a_\[1]=_g_(_&lambda;_).  &#x25a1;

**Corollary 1A:** _If f(&lambda;), g(&lambda;), and h(&lambda;) are functions in the class **PDA**, then so is f(&lambda;)\*g(&lambda;) + (1&minus;f(&lambda;))\*h(&lambda;)._

_Proof:_ Special case of Proposition 1A with _n_=1, _f_(_&lambda;_)=_f_(_&lambda;_), _a_\[0]=_h_(_&lambda;_), and _a_\[1]=_g_(_&lambda;_).  &#x25a1;

**Proposition 2:** _If f(&lambda;) and g(&lambda;) are functions in the class **PDA**, then so is their composition, namely f(g(&lambda;)) or (f&#x2218;g)(&lambda;)._

_Proof:_ Let _F_ be the full-domain pushdown automaton for _f_. For each state/symbol pair among the left-hand sides of _F_'s rules, apply Lemma 1A to the automaton _F_, using the function _g_.  Then the new machine _F_ terminates with probability 1 because the original _F_ and the original automaton for _g_ do for every _&lambda;_ greater than 0 and less than 1, and because the automaton for _g_ never outputs the same value with probability 0 or 1 for any _&lambda;_ greater than 0 or less than 1.  Moreover, _f_ is in class **PDA** by Theorem 1.2 of (Mossel and Peres 2005\)[^27] because the machine is a full-domain pushdown automaton.  &#x25a1;

**Proposition 3:** _Every rational function with rational coefficients that maps the open interval (0, 1) to itself is in class **PDA**._

_Proof:_ These functions can be simulated by a finite-state machine (Mossel and Peres 2005\)[^27].  This corresponds to a full-domain pushdown automaton that has no stack symbols other than EMPTY, never pushes symbols onto the stack, and pops the only symbol EMPTY from the stack whenever it transitions to a final state of the finite-state machine. &#x25a1;

> **Note:** An unbounded stack size is necessary for a pushdown automaton to simulate functions that a finite-state machine can't.  With a bounded stack size, there is a finite-state machine where each state not only holds the pushdown automaton's original state, but also encodes the contents of the stack (which is possible because the stack's size is bounded); each operation that would push, pop, or change the top symbol transitions to a state with the appropriate encoding of the stack instead.

**Proposition 4:** _If a full-domain pushdown automaton can generate words with the same letter such that the length of each word follows a probability distribution, then that distribution's probability generating function is in class **PDA**._

_Proof:_ Let _F_ be a full-domain pushdown automaton.  Add one state FAILURE, then augment _F_ with a special "letter-generating" operation as follows.  Add the following rule that pops all symbols from the stack:

(FAILURE, _flip_, _stacksymbol_) &rarr; (FAILURE, {}),

and for each rule of the following form that transitions to a letter-generating operation (where S and T are arbitrary states):

(S, _flip_, _stacksymbol_) &rarr; (T, _newstack_),

add another state S&prime; (with a name that differs from all other states) and replace that rule with the following rules:

(S, _flip_, _stacksymbol_) &rarr; (S&prime;, {_stacksymbol_}),<br/>
(S&prime;, HEADS, _stacksymbol_) &rarr; (T, _newstack_), and<br/>
(S&prime;, TAILS, _stacksymbol_) &rarr; (FAILURE, {}).

Then if the stack is empty upon reaching the FAILURE state, the result is 0, and if the stack is empty upon reaching any other state, the result is 1.  By Dughmi et al. (2021)[^52], the machine now simulates the distribution's probability generating function.  Moreover, the function is in class **PDA** by Theorem 1.2 of Mossel and Peres (2005)[^27] because the machine is a full-domain pushdown automaton.  &#x25a1;

Define a _stochastic context-free grammar_ as follows.  The grammar consists of a finite set of _nonterminals_ and a finite set of _letters_, and rewrites one nonterminal (the starting nonterminal) into a word.  The grammar has three kinds of rules (in generalized Chomsky Normal Form (Etessami and Yannakakis 2009)[^53]):

- _X_ &rarr; _a_ (rewrite _X_ to the letter _a_).
- _X_ &rarr;<sub>_p_</sub> (_a_, _Y_) (with rational probability _p_, rewrite _X_ to the letter _a_ followed by the nonterminal _Y_).  For the same left-hand side, all the _p_ must sum to 1.
- _X_ &rarr; (_Y_, _Z_) (rewrite _X_ to the nonterminals _Y_ and _Z_ in that order).

Instead of a letter (such as _a_), a rule can use _&epsilon;_ (the empty string). (The grammar is _context-free_ because the left-hand side has only a single nonterminal, so that no context from the word is needed to parse it.)

**Proposition 5:** _Every stochastic context-free grammar can be transformed into a pushdown automaton.  If the automaton is a full-domain pushdown automaton and the grammar has a one-letter alphabet, the automaton can generate words such that the length of each word follows the same distribution as the grammar, and that distribution's probability generating function is in class **PDA**._

_Proof Sketch:_ In the equivalent pushdown automaton:

- _X_ &rarr; _a_ becomes the two rules&mdash;<br>(START, HEADS, _X_) &rarr; (_letter_, {}), and<br>(START, TAILS, _X_) &rarr; (_letter_, {}).<br>Here, _letter_ is either START or a unique state in _F_ that "detours" to a letter-generating operation for _a_ and sets the state back to START when finished (see Proposition 4).  If _a_ is _&epsilon;_, _letter_ is START and no letter-generating operation is done.
- _X_ &rarr;<sub>_p_<sub>_i_</sub></sub> (_a_<sub>_i_</sub>, _Y_<sub>_i_</sub>) (all rules with the same nonterminal _X_) are rewritten to enough rules to transition to a letter-generating operation for _a_<sub>_i_</sub>, and swap the top stack symbol with _Y_<sub>_i_</sub>, with probability _p_<sub>_i_</sub>, which is possible with just a finite-state machine (see Proposition 4) because all the probabilities are rational numbers (Mossel and Peres 2005)[^27].  If _a_<sub>_i_</sub> is _&epsilon;_, no letter-generating operation is done.
- _X_ &rarr; (_Y_, _Z_) becomes the two rules&mdash;<br>(START, HEADS, _X_) &rarr; (START, {_Z_, _Y_}), and<br>(START, TAILS, _X_) &rarr; (START, {_Z_, _Y_}).

Here, _X_ is the stack symbol EMPTY if _X_ is the grammar's starting nonterminal. Now, assuming the automaton is full-domain, the rest of the result follows easily.   For a single-letter alphabet, the grammar corresponds to a system of polynomial equations, one for each rule in the grammar, as follows:

- _X_ &rarr; _a_ becomes _X_ = 1 if _a_ is the empty string (_&epsilon;_), or _X_ =  _&lambda;_ otherwise.
- For each nonterminal _X_, all _n_ rules of the form _X_ &rarr;<sub>_p_<sub>_i_</sub></sub> (_a_<sub>_i_</sub>, _Y_<sub>_i_</sub>) become the equation _X_ = _p_<sub>1</sub>\*_&lambda;_<sub>1</sub>\*_Y_<sub>1</sub> + _p_<sub>2</sub>\*_&lambda;_<sub>2</sub>\*_Y_<sub>2</sub> + ... + _p_<sub>_n_</sub>\*_&lambda;_<sub>_n_</sub>\*_Y_<sub>_n_</sub>, where _&lambda;_<sub>_i_</sub> is either 1 if _a_<sub>_i_</sub> is _&epsilon;_, or _&lambda;_ otherwise.
- _X_ &rarr; (_Y_, _Z_) becomes _X_ = _Y_\*_Z_.

Solving this system for the grammar's starting nonterminal, and applying Proposition 4, leads to the _probability generating function_ for the grammar's word distribution.  (See also Flajolet et al. 2010[^25], Icard 2020[^42].) &#x25a1;

> **Example:** The stochastic context-free grammar&mdash;<br>_X_ &rarr;<sub>1/2</sub> (_a_, _X1_),<br>_X1_ &rarr; (_X_, _X2_),<br>_X2_ &rarr; (_X_, _X_),<br>_X_ &rarr;<sub>1/2</sub> (_a_, _X3_),<br>_X3_ &rarr; _&epsilon;_,<br>which encodes ternary trees (Flajolet et al. 2010)[^54], corresponds to the equation _X_ = (1/2) \* _&lambda;_\*_X_\*_X_\*_X_ + (1/2)\*_&lambda;_\*1, and solving this equation for _X_ leads to the probability generating function for such trees, which is a complicated expression.
>
> **Notes:**
>
> 1. A stochastic context-free grammar in which all the probabilities are 1/2 is called a _binary stochastic grammar_ (Flajolet et al. 2010)[^25].  If every probability is a multiple of 1/_n_, then the grammar can be called an "_n_-ary stochastic grammar".  It is even possible for a nonterminal to have two rules of probability _&lambda;_ and (1&minus; _&lambda;_), which are used when the input coin returns 1 (HEADS) or 0 (TAILS), respectively.
>
> 2. If a pushdown automaton simulates the function _f_(_&lambda;_), then _f_ corresponds to a special system of equations, built as follows (Mossel and Peres 2005)[^27]; see also Esparza et al. (2004)[^55].  For each state of the automaton (call the state _en_), include the following equations in the system based on the automaton's transition rules:
>
>     - (_st_, _p_, _sy_) &rarr; (_s2_, {}) becomes either _&alpha;_<sub>_st_,_sy_,_en_</sub> = _p_ if _s2_ is _en_, or _&alpha;_<sub>_st_,_sy_,_en_</sub> = 0 otherwise.
>     - (_st_, _p_, _sy_) &rarr; (_s2_, {_sy1_}) becomes _&alpha;_<sub>_st_,_sy_,_en_</sub> = _p_ \* _&alpha;_<sub>_s2_,_sy1_,_en_</sub>.
>     - (_st_, _p_, _sy_) &rarr; (_s2_, {_sy1_, _sy2_}) becomes _&alpha;_<sub>_st_,_sy_,_en_</sub> = _p_\*_&alpha;_<sub>_s2_,_sy2_,_&sigma;[1]_</sub>\*_&alpha;_<sub>_&sigma;[1]_,_sy1_,_en_</sub> + ... + _p_\*_&alpha;_<sub>_s2_,_sy2_,_&sigma;[n]_</sub>\*_&alpha;_<sub>_&sigma;[n]_,_sy1_,_en_</sub>, where _&sigma;[i]_ is one of the machine's _n_ states.
>
>     (Here, _p_ is the probability of using the given transition rule; the special value HEADS becomes _&lambda;_, and the special value TAILS becomes 1&minus;_&lambda;_.)  Now, each time multiple equations have the same left-hand side, combine them into one equation with the same left-hand side, but with the sum of their right-hand sides.  Then, for every variable of the form _&alpha;_<sub>_a_,_b_,_c_</sub> not yet present in the system, include the equation _&alpha;_<sub>_a_,_b_,_c_</sub> = 0.  Then, for each final state _fs_ that returns 1, solve the system for the variable _&alpha;_<sub>START,EMPTY,_fs_</sub> (where START is the automaton's starting state) to get a solution (a function) that maps the open interval (0, 1) to itself. (Each solve can produce multiple solutions, but only one of them will map that open interval to itself assuming every _p_ is either HEADS or TAILS.) Finally, add all the solutions to get _f_(_&lambda;_).
>
> 3. Assume there is a pushdown automaton (_F_) that follows Definition 1 except it uses a set of _N_ input letters (and not simply HEADS or TAILS), accepts an input word if the stack is empty, and rejects the word if the machine reaches a configuration without a transition rule.  Then a pushdown automaton in the full sense of Definition 1 (_G_) can be built.  In essence:
>     1. Add a new FAILURE state, which when reached, pops all symbols from the stack.
>     2. For each pair (_state_, _stacksymbol_) for _F_, add a set of rules that generate one of the input letters (each letter _i_ generated with probability _f_<sub> _i_</sub>(_&lambda;_), which must be a function in **PDA**), then use the generated letter to perform the transition stated in the corresponding rule for _F_.  If there is no such transition, transition to the FAILURE state instead.
>     3. When the stack is empty, output 0 if _G_ is in the FAILURE state, or 1 otherwise.
>
>     Then _G_ returns 1 with the same probability as _F_ accepts an input word with letters randomly generated as in the second step.  Also, one of the _N_ letters can be a so-called "end-of-string" symbol, so that a pushdown automaton can be built that accepts "empty strings"; an example is Elder et al. (2015)[^56].

**Proposition 6:** _If a full-domain pushdown automaton can generate a distribution of words with the same letter, there is a full-domain pushdown automaton that can generate a distribution of such words conditioned on&mdash;_

1. _a finite set of word lengths, or_
2. _a periodic infinite set of word lengths._

One example of a finite set of word lengths is {1, 3, 5, 6}, where only words of length 1, 3, 5, or 6 are allowed.  A _periodic infinite set_ is defined by a finite set of integers such as {1}, as well as an integer modulus such as 2, so that in this example, all integers congruent to 1 modulo 2 (that is, all odd integers) are allowed word lengths and belong to the set.

_Proof Sketch:_

1. As in Lemma 1A, assume that the automaton stops when it pops EMPTY from the stack.  Let _S_ be the finite set (for example, {1, 3, 5, 6}), and let _M_ be the maximum value in the finite set.  For each integer _i_ in \[0, _M_\], make a copy of the automaton and append the integer _i_ to the name of each of its states.  Combine the copies into a new automaton _F_, and let its start state be the start state for copy 0.  Now, whenever _F_ generates a letter, instead of transitioning to the next state after the letter-generating operation (see Proposition 4), transition to the corresponding state for the next copy (for example, if the operation would transition to copy 2's version of "XYZ", namely "2\_XYZ", transition to "3\_XYZ" instead), or if the last copy is reached, transition to the last copy's FAILURE state.  If _F_ would transition to a failure state corresponding to a copy not in _S_ (for example, "0\_FAILURE", "2\_FAILURE", "3\_FAILURE" in this example), first all symbols other than EMPTY are popped from the stack and then _F_ transitions to its start state (this is a so-called "rejection" operation).  Now, all the final states (except FAILURE states) for the copies corresponding to the values in _S_ (for example, copies 1, 3, 5, 6 in the example) are treated as returning 1, and all other states are treated as returning 0.

2. Follow (1), except as follows: (A) _M_ is equal to the integer modulus minus 1.  (B) For the last copy of the automaton, instead of transitioning to the next state after the letter-generating operation (see Proposition 4), transition to the corresponding state for copy 0 of the automaton.  &#x25a1;

**Proposition 7:** _Every constant function equal to a quadratic irrational number between 0 and 1 is in class **PDA**._

A _continued fraction_ is one way to write a real number.  For purposes of the following proof, every real number greater than 0 and less than 1 has the following _continued fraction expansion_: 0 + 1 / (_a_[1] + 1 / (_a_[2] + 1 / (_a_[3] + ... ))), where each _a_\[_i_\], a _partial denominator_, is an integer greater than 0.  A _quadratic irrational number_ is an irrational number that can be written as (_b_+sqrt(_c_))/_d_, where _b_, _c_, and _d_ are rational numbers.

_Proof:_  By Lagrange's continued fraction theorem, every quadratic irrational number has a continued fraction expansion that is eventually periodic; the expansion can be described using a finite number of partial denominators, the last "few" of which repeat forever.  The following example describes a periodic continued fraction expansion: \[0; 1, 2, (5, 4, 3)\], which is the same as \[0; 1, 2, 5, 4, 3, 5, 4, 3, 5, 4, 3, ...\].  In this example, the partial denominators are the numbers after the semicolon; the size of the period (`(5, 4, 3)`) is 3; and the size of the non-period (`1, 2`) is 2.

Given a periodic expansion, and with the aid of an algorithm for simulating [**continued fractions**](https://peteroupc.github.io/bernoulli.html#Continued_Fractions), a recursive Markov chain for the expansion (Etessami and Yannakakis 2009)[^53] can be described as follows.  The chain's components are all built on the following template.  The template component has one entry E, one inner node N, one box, and two exits X0 and X1.  The box has one _call port_ as well as two _return ports_ B0 and B1.

- From E: Go to N with probability _x_, or to the box's call port with probability 1 &minus; _x_.
- From N: Go to X1 with probability _y_, or to X0 with probability 1 &minus; _y_.
- From B0: Go to E with probability 1.
- From B1: Go to X0 with probability 1.

Let _p_ be the period size, and let _n_ be the non-period size.  Now the recursive Markov chain to be built has _n_+_p_ components:

- For each _i_ in \[1, _n_+1\], there is a component labeled _i_.  It is the same as the template component, except _x_ = _a_\[_i_\]/(1 + _a_\[_i_\]), and _y_ = 1/_a_\[_i_\].  The component's single box goes to the component labeled _i_+1, _except_ that for component _n_+_p_, the component's single box goes to the component labeled _n_+1.

According to Etessami and Yannakakis (2009)[^53], the recursive Markov chain can be translated to a pushdown automaton of the kind used in this section. Now all that's left is to argue that the recursive Markov chain terminates with probability 1.  For every component in the chain, it goes from its entry to its box with probability 1/2 or less (because each partial numerator must be 1 or greater).  Thus, the component recurses with no greater probability than not, and there are otherwise no probability-1 loops in each component, so the overall chain terminates with probability 1. &#x25a1;

**Lemma 1:** _The square root function sqrt(&lambda;) is in class **PDA**._

_Proof:_ See Mossel and Peres (2005)[^27]. &#x25a1;

**Corollary 1:** _The function f(&lambda;) = &lambda;<sup>m/(2<sup>n</sup>)</sup>, where n &ge; 1 is an integer and where m &ge; 1 is an integer, is in class **PDA**._

_Proof:_ Start with the case _m_=1.  If _n_ is 1, write _f_ as sqrt(_&lambda;_); if _n_ is 2, write _f_ as (sqrt&#x2218;sqrt)(_&lambda;_); and for general _n_, write _f_ as (sqrt&#x2218;sqrt&#x2218;...&#x2218;sqrt)(_&lambda;_), with _n_ instances of sqrt.  Because this is a composition and sqrt can be simulated by a full-domain pushdown automaton, so can _f_.

For general _m_ and _n_, write _f_ as ((sqrt&#x2218;sqrt&#x2218;...&#x2218;sqrt)(_&lambda;_))<sup>_m_</sup>, with _n_ instances of sqrt.  This involves doing _m_ multiplications of sqrt&#x2218;sqrt&#x2218;...&#x2218;sqrt, and because this is an integer power of a function that can be simulated by a full-domain pushdown automaton, so can _f_.

Moreover, _f_ is in class **PDA** by Theorem 1.2 of (Mossel and Peres 2005)[^27] because the machine is a full-domain pushdown automaton. &#x25a1;

<a id=Finite_State_and_Pushdown_Generators></a>
#### Finite-State and Pushdown Generators

Another interesting class of machines (called _pushdown generators_ here) are similar to pushdown automata (see above), with the following exceptions:

1. Each transition rule can also, optionally, output a base-_N_ digit in its right-hand side.  An example is: (_state_, _flip_, _sy_) &rarr; (_digit_, _state2_, {_sy2_}).
2. The machine must output infinitely many digits if allowed to run forever.
3. Rules that would pop the last symbol from the stack are not allowed.

The "output" of the machine is now a real number _X_ in the form of the base-_N_ digit expansion `0.dddddd...`, where `dddddd...` are the digits produced by the machine from left to right.  In the rest of this section:

- `CDF(z)` is the cumulative distribution function of _X_, or the probability that _X_ is _z_ or less.
- `PDF(z)` is the probability density function of _X_, or the derivative of `CDF(z)`, or the relative probability of choosing a number "close" to _z_ at random.

A _finite-state generator_ (Knuth and Yao 1976)[^39] is the special case where the probability of heads is 1/2, each digit is either 0 or 1, rules can't push stack symbols, and only one stack symbol is used.  Then if `PDF(z)` has infinitely many derivatives on the open interval (0, 1), it must be a polynomial with rational coefficients and satisfy `PDF(z) > 0` whenever 0 &le; `z` &le; 1 is irrational (Vatan 2001)[^57], (Kindler and Romik 2004)[^58], and it can be shown that the expected value (mean or "long-run average") of _X_ must be a rational number. [^59]

**Proposition 8.** _Suppose a finite-state generator can generate a probability distribution that takes on finitely many values.  Then:_

1. _Each value occurs with a rational probability._
2. _Each value is either rational or transcendental._

A real number is _transcendental_ if it can't be a root of a nonzero polynomial with integer coefficients.  Thus, part 2 means, for example, that irrational, non-transcendental numbers such as 1/sqrt(2) and the golden ratio minus 1 can't be generated exactly.

Proving this proposition involves the following lemma, which shows that a finite-state generator is related to a machine with a one-way read-only input and a one-way write-only output:

**Lemma 2.** _A finite-state generator can fit the model of a one-way transducer-like k-machine (as defined in Adamczewski et al. (2020\)[^60] section 5.3), for some k equal to 2 or greater._

_Proof Sketch:_ There are two cases.

Case 1: If every transition rule of the generator outputs a digit, then _k_ is the number of unique inputs among the generator's transition rules (usually, there are two unique inputs, namely HEADS and TAILS), and the model of a finite-state generator is modified as follows:

1. A _configuration_ of the finite-state generator consists of its current state together with either the last coin flip result or, if the coin wasn't flipped yet, the empty string.
2. The _output function_ takes a configuration described above and returns a digit.  If the coin wasn't flipped yet, the function returns an arbitrary digit (which is not used in proposition 4.6 of the Adamczewski paper).

Case 2: If at least one transition rule does not output a digit, then the finite-state generator can be transformed to a machine where HEADS/TAILS is replaced with 50% probabilities, then transformed to an equivalent machine whose rules always output one or more digits, as claimed in Lemma 5.2 of Vatan (2001)[^57].  In case the resulting generator has rules that output more than one digit, additional states and rules can be added so that the generator's rules output only one digit as desired.  Now at this point the generator's probabilities will be rational numbers. Now transform the generator from probabilities to inputs of size _k_, where _k_ is the product of those probabilities, by adding additional rules as desired.  &#x25a1;

_Proof of Proposition 8:_ Let _n_ be an integer greater than 0. Take a finite-state generator that starts at state START and branches to one of _n_ finite-state generators (sub-generators) with some probability, which must be rational because the overall generator is a finite-state machine (Icard 2020, Proposition 13)[^51].  The branching process outputs no digit, and part 3 of the proposition follows from Corollary 9 of Icard (2020)[^51].  The _n_ sub-generators are special; each of them generates the binary expansion of a single real number in the closed unit interval with probability 1.

To prove part 2 of the proposition, translate an arbitrary finite-state generator to a machine described in Lemma 2.  Once that is done, all that must be shown is that there are two different non-empty sequences of coin flips that end up at the same configuration. This is easy using the pigeonhole principle, since the finite-state generator has a finite number of configurations. Thus, by propositions 5.11, 4.6, and AB of Adamczewski et al. (2020)[^60], the generator can generate a real number's binary expansion only if that number is rational or transcendental (see also Cobham (1968)[^61]; Adamczewski and Bugeaud (2007)[^62]).  &#x25a1;

**Proposition 9.** _If the distribution function generated by a finite-state generator is continuous and algebraic on the open interval (0, 1), then that function is a piecewise polynomial function on that interval._

The proof follows from combining Kindler and Romik (2004, Theorem 2)[^58] and Knuth and Yao (1976)[^39] with Richman (2012)[^63], who proved that a continuous algebraic function on an open interval is piecewise analytic ("analytic" means writable as $c_0 x^0+ ... +c_i x^i + ...$ where $c_i$ are real numbers).

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
