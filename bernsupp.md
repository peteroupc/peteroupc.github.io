# Supplemental Notes for Bernoulli Factory Algorithms

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Contents></a>
## Contents

- [**Contents**](#Contents)
- [**General Factory Functions**](#General_Factory_Functions)
    - [**Approximation Schemes**](#Approximation_Schemes)
    - [**Schemes That Don't Work**](#Schemes_That_Don_t_Work)
- [**Approximate Bernoulli Factories**](#Approximate_Bernoulli_Factories)
- [**Achievable Simulation Rates**](#Achievable_Simulation_Rates)
- [**Complexity**](#Complexity)
- [**Examples of Bernoulli Factory Approximation Schemes**](#Examples_of_Bernoulli_Factory_Approximation_Schemes)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Which functions admit a Bernoulli factory?**](#Which_functions_admit_a_Bernoulli_factory)
    - [**Proofs for Function Approximation Schemes**](#Proofs_for_Function_Approximation_Schemes)
    - [**Example of Approximation Scheme**](#Example_of_Approximation_Scheme)
- [**License**](#License)

<a id=General_Factory_Functions></a>
## General Factory Functions

As a reminder, the _Bernoulli factory problem_ is: Given a coin with unknown probability of heads of _&lambda;_, sample the probability _f_(_&lambda;_).

The algorithms for [**general factory functions**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions), described in my main article on Bernoulli factory algorithms, work by building randomized upper and lower bounds for a function _f_(_&lambda;_), based on flips of the input coin.  Roughly speaking, the algorithms work as follows:

1. Generate a uniform(0, 1) random number, _U_.
2. Flip the input coin, then build an upper and lower bound for _f_(_&lambda;_), based on the outcomes of the flips so far.
3. If _U_ is less than or equal to the lower bound, return 1. If _U_ is greater than the upper bound, return 0.  Otherwise, go to step 2.

These randomized upper and lower bounds come from two sequences of polynomials: one approaches the function _f_(_&lambda;_) from above, the other from below, where _f_ is a function for which the Bernoulli factory problem can be solved.  (These two sequences form a so-called _approximation scheme_ for _f_.) One requirement for these algorithms to work correctly is called the _consistency requirement_:

_The difference&mdash;_

- _between the degree-(n&minus;1) upper polynomial and the degree-n upper polynomial, and_
- _between the degree-n lower polynomial and the degree-(n&minus;1) lower polynomial,_

_must have non-negative coefficients, once the polynomials are elevated to degree n and rewritten in Bernstein form._

The consistency requirement ensures that the upper polynomials "decrease" and the lower polynomials "increase".  Unfortunately, the reverse is not true in general; even if the upper polynomials "decrease" and the lower polynomials "increase" to _f_, this does not mean that the scheme will ensure consistency.  Examples of this fact are shown in the section "[**Schemes That Don't Work**](#Schemes_That_Don_t_Work)" later in this document.

In this document, **fbelow**(_n_, _k_) and **fabove**(_n_, _k_) mean the _k_<sup>th</sup> coefficient for the lower or upper degree-_n_ polynomial in Bernstein form, respectively, where _k_ is an integer in the interval \[0, _n_\].

<a id=Approximation_Schemes></a>
### Approximation Schemes

A _factory function_ _f_(_&lambda;_) is a function for which the Bernoulli factory problem can be solved (see "[**About Bernoulli Factories**](https://peteroupc.github.io/bernoulli.html#About_Bernoulli_Factories)"). The following are approximation schemes for _f_ if it belongs to one of certain classes of factory functions.  It would be helpful to plot the desired function _f_ using a computer algebra system to see if it belongs to any of the classes of functions described below.

**Concave functions.** If _f_ is known to be _concave_ in the interval [0, 1\] (which roughly means that its rate of growth there never goes up), then **fbelow**(_n_, _k_) can equal _f_(_k_/_n_), thanks to Jensen's inequality.

**Convex functions.** If _f_ is known to be _convex_ in the interval [0, 1\] (which roughly means that its rate of growth there never goes down), then **fabove**(_n_, _k_) can equal _f_(_k_/_n_), thanks to Jensen's inequality.  One example is _f_(_&lambda;_) = exp(&minus;_&lambda;_/4).

**Twice differentiable functions.** The following method, proved in the appendix, implements **fabove** and **fbelow** if _f_(_&lambda;_)&mdash;

- has a defined "slope-of-slope" everywhere in \[0, 1\] (that is, the function is _twice differentiable_ there), and
- in the interval \[0, 1\]&mdash;
    - has a minimum of greater than 0 and a maximum of less than 1, or
    - is convex and has a minimum of greater than 0, or
    - is concave and has a maximum of less than 1.

Let _m_ be an upper bound of the highest value of abs(_f&prime;&prime;_(_x_)) for any _x_ in [0, 1], where _f&prime;&prime;_ is the "slope-of-slope" function of _f_.  Then for every integer _n_ that's a power of 2:

- **fbelow**(_n_, _k_) = _f_(_k_/_n_) if _f_ is concave; otherwise, min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if _n_ < 4; otherwise,  _f_(_k_/_n_) &minus; _m_/(7\*_n_).
- **fabove**(_n_, _k_) = _f_(_k_/_n_) if _f_ is convex; otherwise, max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if _n_ < 4; otherwise, _f_(_k_/_n_) + _m_/(7\*_n_).

My [**GitHub repository**](https://github.com/peteroupc/peteroupc.github.io/blob/master/approxscheme.py) includes SymPy code for a method, `c2params`, to calculate the necessary values for _m_ and the bounds of these polynomials, given _f_.

> **Note:** For this method, the "slope-of-slope" function need not be continuous (Y. Peres, pers. comm., 2021).

**Hölder and Lipschitz continuous functions.** I have found a way to extend the results of Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup> to certain functions with a slope that tends to a vertical slope.  The following scheme, proved in the appendix, implements **fabove** and **fbelow** if _f_(_&lambda;_)&mdash;

- is _&alpha;_-[**_Hölder continuous_**](https://en.wikipedia.org/wiki/Hölder_condition) in [0, 1], meaning its vertical slopes there, if any, are no "steeper" than that of _m_\*_&lambda;_<sup>_&alpha;_</sup>, for some number _m_ greater than 0 (the Hölder constant) and for some _&alpha;_ in the interval (0, 1], and
- in the interval \[0, 1\]&mdash;
    - has a minimum of greater than 0 and a maximum of less than 1, or
    - is convex and has a minimum of greater than 0, or
    - is concave and has a maximum of less than 1.

If _f_ in \[0, 1] has a defined slope at all points or at all but a countable number of points, and does not tend to a vertical slope anywhere, then _f_ is [**_Lipschitz continuous_**](https://en.wikipedia.org/wiki/Lipschitz_continuity), _&alpha;_ is 1, and _m_ is the highest absolute value of the function's "slope".  Otherwise, finding _m_ for a given _&alpha;_ is non-trivial and it requires knowing where _f_'s vertical slopes are, among other things.<sup>[**(2)**](#Note2)</sup>  But assuming _m_ and _&alpha;_ are known, then for every integer _n_ that's a power of 2:

- _D_(_n_) = _m_\*(2/7)<sup>_&alpha;_/2</sup>/((2<sup>_&alpha;_/2</sup>&minus;1)\*_n_<sup>_&alpha;_/2</sup>).
- **fbelow**(_n_, _k_) = _f_(_k_/_n_) if _f_ is concave; otherwise, min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if _n_ < 4; otherwise, _f_(_k_/_n_) &minus; _D_(_n_).
- **fabove**(_n_, _k_) = _f_(_k_/_n_) if _f_ is convex; otherwise, max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if _n_ < 4; otherwise, _f_(_k_/_n_) + _D_(_n_).

> **Note:**
>
> 1. Some functions _f_ are not _&alpha;_-Hölder continuous for any _&alpha;_ greater than 0.  These functions have a slope that's steeper than any "nth" root, and can't be handled by this method.  One example is _f_(_&lambda;_) = 1/10 if _&lambda;_ is 0 and &minus;1/(2\*ln(_&lambda;_/2)) + 1/10 otherwise, which has a slope near 0 that's steeper than any "nth" root.
> 2. In the Lipschitz case (_&alpha;_ = 1), _D_(_n_) can be _m_\*322613/(250000\*sqrt(_n_)), which is an upper bound.
> 3. In the case _&alpha;_ = 1/2, _D_(_n_) can be _m_\*154563/(40000\*_n_<sup>1/4</sup>), which is an upper bound.

**Certain functions that equal 0 at 0.** This approach involves transforming the function _f_ so that it no longer equals 0 at the point 0.  This can be done by dividing _f_ by a function (_h_(_&lambda;_)) that "dominates" _f_ at every point in the interval [0, 1].  Unlike for the original function, there might be an approximation scheme described earlier in this section for the transformed function.

More specifically, _h_(_&lambda;_) must meet the following requirements:

- _h_(_&lambda;_) is continuous on the closed interval [0, 1].
- _h_(0) = 0. (This is required to ensure correctness in case _&lambda;_ is 0.)
- 1 &ge; _h_(1) &ge; _f_(1) &ge; 0.
- 1 &gt; _h_(_&lambda;_) &gt; _f_(_&lambda;_) &gt; 0 for every _&lambda;_ in the open interval (0, 1).
- If _f_(1) = 0, then _h_(1) = 0. (This is required to ensure correctness in case _&lambda;_ is 1.)

Also, _h_ should be a function with a simple Bernoulli factory algorithm.  For example, _h_ can be a polynomial in Bernstein form of degree _n_ whose _n_ plus one coefficients are \[0, 1, 1, ..., 1\].  This polynomial is easy to simulate using the algorithms from the section "[**Certain Polynomials**](https://peteroupc.github.io/bernoulli.html#Certain_Polynomials)".

The algorithm is now described.

Let _g_(_&lambda;_) = lim<sub>_&nu;_&rarr;_&lambda;_</sub> _f_(_&nu;_)/_h_(_&nu;_) (in other words, the value that _f_(_&nu;_)/_h_(_&nu;_) approaches as _&nu;_ approaches _&lambda;_.) If&mdash;

- _f_(0) = 0 and _f_(1) < 1, and
- _g_(_&lambda;_) is continuous on [0, 1] and belongs in one of the classes of functions given earlier,

then _f_ can be simulated using the following algorithm:

1. Run a Bernoulli factory algorithm for _h_.  If the call returns 0, return 0. (For example, if _h_(_&lambda;_) = _&lambda;_, then this step amounts to the following: "Flip the input coin.  If it returns 0, return 0.")
2. Run one of the [**general factory function algorithms**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions) for _g_(.), and return the result of that algorithm.  This involves building polynomials that converge to _g_(.), as described earlier in this section.  (Alternatively, if _g_ is easy to simulate, instead run another Bernoulli factory algorithm for _g_ and return the result of that algorithm.)

> **Notes:**
>
> 1. It may happen that _g_(0) = 0.  In this case, step 2 of this algorithm can involve running this algorithm again, but with new _g_ and _h_ functions that are found based on the current _g_ function.  See the second example below.
> 2. If&mdash;
>
>     - _f_ is monotonically increasing,
>     - _h_(_&lambda;_) = _&lambda;_, and
>     - _f&prime;_(_&lambda;_), the "slope" function of _f_, is continuous on [0, 1], maps (0, 1) to (0, 1), and belongs in one of the classes of functions given earlier,
>
>     then step 2 can be implemented by taking _g_ as _f&prime;_, except: (A) a uniform(0, 1) random number _u_ is generated at the start of the step; (B) instead of flipping the input coin as normal during that step, a different coin is flipped that does the following: "Flip the input coin, then [**sample from the number _u_**](https://peteroupc.github.io/bernoulli.html#Algorithms). Return 1 if both the call and the flip return 1, and return 0 otherwise."<br/>This is the "**integral method**" of Flajolet et al. (2010)<sup>[**(3)**](#Note3)</sup> (the modified step 2 simulates 1/_&lambda;_ times the _integral_ of _f_.).
>
> **Examples:**
>
> 1. If _f_(_&lambda;_) = (sinh(_&lambda;_)+cosh(_&lambda;_)&minus;1)/4, then _f_ is bounded from above by _h_(_&lambda;_) = _&lambda;_, so _g_(_&lambda;_) is 1/4 if _&lambda;_ = 0, and (exp(_&lambda;_) &minus; 1)/(4\*_&lambda;_) otherwise.  The following SymPy code computes this example: `fx = (sinh(x)+cosh(x)-1)/4; h = x; pprint(Piecewise((limit(fx/h,x,0), Eq(x,0)), ((fx/h).simplify(), True)))`.
> 2. If _f_(_&lambda;_) = cosh(_&lambda;_) &minus; 1, then _f_ is bounded from above by _h_(_&lambda;_) = _&lambda;_, so _g_(_&lambda;_) is 0 if _&lambda;_ = 0, and (cosh(_&lambda;_)&minus;1)/_&lambda;_ otherwise.  Since _g_(0) = 0, we find new functions _g_ and _h_ based on the current _g_.  The current _g_ is bounded from above by _H_(_&lambda;_) = _&lambda;_\*3\*(2&minus;_&lambda;_)/5 (a degree-2 polynomial that in Bernstein form has coefficients [0, 6/10, 6/10]), so _G_(_&lambda;_) = 5/12 if _&lambda;_ = 0, and &minus;(5\*cosh(_&lambda;_) &minus; 5)/(3\*_&lambda;_<sup>2</sup>\*(_&lambda;_&minus;2)) otherwise. _G_ is bounded away from 0 and 1, so we have the following algorithm:
>
>     1. (Simulate _h_.) Flip the input coin.  If it returns 0, return 0.
>     2. (Simulate _H_.) Flip the input coin twice.  If both flips return 0, return 0.  Otherwise, with probability 4/10 (that is, 1 minus 6/10), return 0.
>     3. Run a Bernoulli factory algorithm for _G_ (which involves building polynomials that converge to _G_, noticing that _G_ is twice differentiable) and return the result of that algorithm.

**Certain functions that equal 0 at 0 and 1 at 1.**  Let _f_, _g_, and _h_ be functions as defined earlier, except that _f_(0) = 0 and _f_(1) = 1.  Define the following additional functions:

- _&omega;_(_&lambda;_) is a function that meets the following requirements:
    - _&omega;_(_&lambda;_) is continuous on the closed interval [0, 1].
    - _&omega;_(0) = 0 and _&omega;_(1) = 1.
    - 1 &gt; _f_(_&lambda;_) &gt; _&omega;_(_&lambda;_) &gt; 0 for every _&lambda;_ in the open interval (0, 1).
- _q_(_&lambda;_) = lim<sub>_&nu;_&rarr;_&lambda;_</sub> _&omega;_(_&nu;_)/_h_(_&nu;_).
- _r_(_&lambda;_) = lim<sub>_&nu;_&rarr;_&lambda;_</sub> (1&minus;_g_(_&nu;_))/(1&minus;_q_(_&nu;_)).

Roughly speaking, _&omega;_ is a function that bounds _f_ from below, just as _h_ bounds _f_ from above. _&omega;_ should be a function with a simple Bernoulli factory algorithm, such as a polynomial in Bernstein form.  If both _&omega;_ and _h_ are polynomials of the same degree, _q_ will be a rational function with a relatively simple Bernoulli factory algorithm (see "[**Certain Rational Functions**](https://peteroupc.github.io/bernoulli.html#Certain_Rational_Functions)").

Now, if _r_(_&lambda;_) is continuous on [0, 1] and belongs in one of the classes of functions given earlier, then _f_ can be simulated using the following algorithm:

1. Run a Bernoulli factory algorithm for _h_.  If the call returns 0, return 0. (For example, if _h_(_&lambda;_) = _&lambda;_, then this step amounts to the following: "Flip the input coin.  If it returns 0, return 0.")
2. Run a Bernoulli factory algorithm for _q_(.).  If the call returns 1, return 1.
3. Run one of the [**general factory function algorithms**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions) for _r_(.).  If the call returns 0, return 1.  Otherwise, return 0.  This step involves building polynomials that converge to _r_(.), as described earlier in this section.

> **Example:** If _f_(_&lambda;_) = (1&minus;exp(_&lambda;_))/(1&minus;exp(1)), then _f_ is bounded from above by _h_(_&lambda;_) = _&lambda;_, and from below by _&omega;_(_&lambda;_) = _&lambda;_<sup>2</sup>.  As a result, _q_(_&lambda;_) = _&lambda;_, and _r_(_&lambda;_) = (2 &minus; exp(1))/(1 &minus; exp(1)) if _&lambda;_ = 0; 1/(exp(1)&minus;1) if _&lambda;_ = 1; and (&minus;_&lambda;_\*(1 &minus; exp(1)) &minus; exp(_&lambda;_) + 1)/(_&lambda;_\*(1 &minus; exp(1))\*(_&lambda;_ &minus; 1)) otherwise.  This can be computed using the following SymPy code: `fx=(1-exp(x))/(1-exp(1)); h=x; phi=x**2; q=(phi/h); r=(1-fx/h)/(1-q); r=Piecewise((limit(r, x, 0), Eq(x,0)), (limit(r,x,1),Eq(x,1)), (r,True)).simplify(); pprint(r)`.

**Other functions that equal 0 or 1 at the endpoints 0 and/or 1.** If _f_ does not fully admit an approximation scheme under the convex, concave, twice differentiable, and Hölder classes:

| If _f_(0) = | And _f_(1) = |      Method |
 --- | --- | --- |
| > 0 and < 1 | 1 | Use the algorithm for **certain functions that equal 0 at 0**, but with _f_(_&lambda;_) = 1 &minus; _f_(1&minus;_&lambda;_).<br/>_Inverted coin_: Instead of the usual input coin, use a coin that does the following: "Flip the input coin and return 1 minus the result."<br/>_Inverted result:_ If the overall algorithm would return 0, it returns 1 instead, and vice versa. |
| > 0 and < 1 | 0 | Algorithm for **certain functions that equal 0 at 0**, but with _f_(_&lambda;_) = _f_(1&minus;_&lambda;_).  (For example, cosh(_&lambda;_)&minus;1 becomes cosh(1&minus;_&lambda;_)&minus;1.)<br/>Inverted coin. |
| 1 | 0 | Algorithm for **certain functions that equal 0 at 0 and 1 at 1**, but with _f_(_&lambda;_) = 1&minus;_f_(_&lambda;_).<br/>Inverted result. |
| 1 | > 0 and &le; 1 | Algorithm for **certain functions that equal 0 at 0**, but with _f_(_&lambda;_) = 1&minus;_f_(_&lambda;_).<br/>Inverted result. |

**Specific functions.** My [**GitHub repository**](https://github.com/peteroupc/peteroupc.github.io/blob/master/approxscheme.py) includes SymPy code for a method, `approxscheme2`, to build a polynomial approximation scheme for certain factory functions.

**Open questions.**

- Are there factory functions used in practice that are not covered by the approximation schemes in this section?
- Are there specific functions (especially those in practical use) for which there are practical and faster formulas for building polynomials that converge to those functions (besides those I list in this section or the main [**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html) article)?

<a id=Schemes_That_Don_t_Work></a>
### Schemes That Don't Work

In the academic literature (papers and books), there are many approximation schemes that involve polynomials that converge from above and below to a function.  Unfortunately, most of them cannot be used as is to simulate a function _f_ in the Bernoulli Factory setting, because they don't ensure the consistency requirement described earlier.

The following are approximation schemes with counterexamples to consistency.

**First scheme.** In this scheme (Powell 1981)<sup>[**(4)**](#Note4)</sup>, let _f_ be a C<sup>2</sup> continuous function (a function with continuous "slope" and "slope-of-slope" functions) in [0, 1].  Then for every _n_&ge;1:

- **fabove**(_n_, _k_) = _f_(_k_/_n_) + _M_ / (8*_n_).
- **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; _M_ / (8*_n_).

Where _M_ is an upper bound of the maximum absolute value of _f_'s slope-of-slope function (second derivative), and where _k_ is an integer in the interval [0, _n_].

The counterexample involves the C<sup>2</sup> continuous function _g_(_&lambda;_) = sin(_&pi;_\*_&lambda;_)/4 + 1/2.

For _g_, the coefficients for&mdash;

- the degree-2 upper polynomial in Bernstein form (**fabove**(5, _k_)) are [0.6542..., 0.9042..., 0.6542...], and
- the degree-4 upper polynomial in Bernstein form (**fabove**(6, _k_)) are [0.5771..., 0.7538..., 0.8271..., 0.7538..., 0.5771...].

The degree-2 polynomial lies above the degree-4 polynomial everywhere in [0, 1].  However, to ensure consistency, the degree-2 polynomial, once elevated to degree 4 and rewritten in Bernstein form, must have coefficients that are greater than or equal to those of the degree-4 polynomial.

- Once elevated to degree 4, the degree-2 polynomial's coefficients are [0.6542..., 0.7792..., 0.8208..., 0.7792..., 0.6542...].

As we can see, the elevated polynomial's coefficient 0.8208... is less than the corresponding coefficient 0.8271... for the degree-4 polynomial.

_The rest of this section will note counterexamples involving other functions and schemes, without demonstrating them in detail._

**Second scheme.** In this scheme, let _f_ be a Lipschitz continuous function in \[0, 1\] (that is, a continuous function in [0, 1] that has a defined slope at all points or at all but a countable number of points, and does not tend to a vertical slope anywhere).  Then for every _n_&ge;2:

- **fabove**(_n_, _k_) = _f_(_k_/_n_) + _L_\*(5/4) / sqrt(_n_).
- **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus;  _L_\*(5/4) / sqrt(_n_).

Where L is the maximum absolute "slope", also known as the Lipschitz constant, and (5/4) is the so-called Popoviciu constant, and where _k_ is an integer in the interval \[0, _n_\] (Lorentz 1986)<sup>[**(5)**](#Note5)</sup>, (Popoviciu 1935)<sup>[**(6)**](#Note6)</sup>.

There are two counterexamples here; together they show that this scheme can fail to ensure consistency, even if the set of functions is restricted to "smooth" functions (not just Lipschitz continuous functions):

1. The function _f_(_&lambda;_) = min(_&lambda;_, 1&minus;_&lambda;_)/2 is Lipschitz continuous with Lipschitz constant 1/2.  (In addition, _f_ has a kink at 1/2, so that it's not differentiable, but this is not essential for the counterexample.)  The counterexample involves the degree-5 and degree-6 upper polynomials (**fabove**(5, _k_) and **fabove**(6, _k_)).
2. The function _f_ = sin(4\*_&pi;_\*_&lambda;_)/4 + 1/2, a "smooth" function with Lipschitz constant _&pi;_.  The counterexample involves the degree-3 and degree-4 lower polynomials (**fbelow**(3, _k_) and **fbelow**(4, _k_)).

It is yet to be seen whether a counterexample exists for this scheme when _n_ is restricted to powers of 2.

**Third scheme.** Same as the second scheme, but replacing (5/4) with the Sikkema constant, _S_ = (4306+837*sqrt(6))/5832 (Lorentz 1986)<sup>[**(5)**](#Note5)</sup>, (Sikkema 1961)<sup>[**(7)**](#Note7)</sup>, which is slightly less than 1.09.   In fact, the same counterexamples for the second scheme apply to this one, since this scheme merely multiplies the offset to bring the approximating polynomials closer to _f_.

**Note on "clamping".** For any approximation scheme, "clamping" the values of **fbelow** and **fabove** to fit the interval [0, 1] won't necessarily preserve the consistency requirement, even if the original scheme met that requirement.

Here is a counterexample that applies to any approximation scheme.

Let _g_ and _h_ be two polynomials in Bernstein form as follows:

- _g_ has degree 5 and coefficients [10179/10000, 2653/2500, 9387/10000, 5049/5000, 499/500, 9339/10000].
- _h_ has degree 6 and coefficients [10083/10000, 593/625, 9633/10000, 4513/5000, 4947/5000, 9473/10000, 4519/5000].

After elevating _g_'s degree, _g_'s coefficients are no less than _h_'s, as required by the consistency property.

However, if we clamp coefficients above 1 to equal 1, so that _g_ is now _g&prime;_ with [1, 1, 9387/10000, 1, 499/500, 9339/10000] and _h_ is now _h&prime;_ with [1, 593/625, 9633/10000, 4513/5000, 4947/5000, 9473/10000, 4519/5000], and elevate _g&prime;_ for coefficients [1, 1, 14387/15000, 19387/20000, 1499/1500, 59239/60000, 9339/10000], some of the coefficients of _g&prime;_ are less than those of _h&prime;_.  Thus, for this pair of polynomials, clamping the coefficients will destroy the consistent approximation property.

<a id=Approximate_Bernoulli_Factories></a>
## Approximate Bernoulli Factories

Although the schemes in the previous section don't work when building a _family_ of polynomials that converge to a function _f_(_&lambda;_), they are still useful for building an _approximation_ to that function, in the form of a _single_ polynomial, so that we get an **approximate Bernoulli factory** for _f_.

Here, _f_(_&lambda;_) can be any function that maps the closed interval [0, 1] to [0, 1], even if it isn't continuous or a factory function (examples include the "step function" 0 if _&lambda;_ < 1/2 and 1 otherwise, or the function 2\*min(_&lambda;_, 1 &minus; _&lambda;_)).  Continuous functions can be approximated arbitrarily well by an approximate Bernoulli factory (as a result of the so-called "Weierstrass approximation theorem"), but this is not the case in general for discontinuous functions.

To build an approximate Bernoulli factory:

1. We first find a polynomial in Bernstein form of degree _n_ that is close to the desired function _f_.

    The simplest choice for this polynomial has _n_+1 coefficients and its _j_<sup>th</sup> coefficient (starting at 0) is found as _f_(_j_/_n_), and this is used in the examples below.  For this choice, if _f_ is continuous, the polynomial can be brought arbitrarily close to _f_ by choosing _n_ high enough.

    Whatever polynomial is used, the polynomial's coefficients must all lie in \[0, 1\].

2. Then, we use one of the algorithms in the section "[**Certain Polynomials**](https://peteroupc.github.io/bernoulli.html)" to simulate that polynomial, given its coefficients.

**Examples of approximate Bernoulli factories.** The schemes in the previous section give an upper bound on the error on approximating _f_ with a degree-_n_ polynomial in Bernstein form.  For example, the third scheme does this when _f_ is a Lipschitz continuous function (with Lipschitz constant _L_).  To find a degree _n_ such that _f_ is approximated with a maximum error of _&epsilon;_, we need to solve the following equation for _n_:

- _&epsilon;_ = _L_\*((4306+837*sqrt(6))/5832) / sqrt(_n_).

This has the following solution:

- _n_ = _L_<sup>2</sup>\*(3604122\*sqrt(6) + 11372525)/(17006112\*_&epsilon;_<sup>2</sup>).

This is generally not an integer, so we use _n_ = ceil(_n_) to get the solution if it's an integer, or the nearest integer that's bigger than the solution.  This solution can be simplified further to _n_ = ceil(59393\*_L_<sup>2</sup>/(50000\*_&epsilon;_<sup>2</sup>)), which bounds the previous solution from above.

Now, if _f_ is a Lipschitz continuous factory function with Lipschitz constant _L_, the following algorithm (adapted from "Certain Polynomials") simulates a polynomial that approximates _f_ with a maximum error of _&epsilon;_:

1. Calculate _n_ as ceil(59393\*_L_<sup>2</sup>/(50000\*_&epsilon;_<sup>2</sup>)).
2. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.
3. With probability _f_(_j_/_n_), return 1.  Otherwise, return 0. (If _f_(_j_/_n_) can be an irrational number, see "[**Algorithms for General Irrational Constants**](https://peteroupc.github.io/bernoulli.html#Algorithms_for_General_Irrational_Constants)" for ways to sample this irrational probability exactly.)

As another example, we use the first scheme in the previous section to get the following approximate algorithm for C<sup>2</sup> continuous functions with maximum "slope-of-slope" of _M_:

1. Calculate _n_ as ceil(_M_/(8\*_&epsilon;_)) (upper bound of the solution to the equation _&epsilon;_ = _M_/(8\*_n_)).
2. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.
3. With probability _f_(_j_/_n_), return 1.  Otherwise, return 0.

We can proceed similarly with other methods that give an upper bound on the Bernstein-form polynomial approximation error, if they apply to the function _f_ that we seek to approximate.

**Approximate methods for linear functions.** There are a number of approximate methods to simulate _&lambda;_\*_c_, where _c_ > 1 and _&lambda;_ lies in \[0, 1/_c_).  ("Approximate" because this function touches 1 at 1/_c_, so it can't be a factory function.) Since the methods use only up to _n_ flips, where _n_ is an integer greater than 0, the approximation will be a polynomial of degree _n_.

- Henderson and Glynn (2003, Remark 4)<sup>[**(8)**](#Note8)</sup> approximates the function _&lambda;_\*2 using a polynomial where the _j_<sup>th</sup> coefficient (starting at 0) is min((_j_/_n_)\*2, 1&minus;1/_n_).  If _g_(_&lambda;_) is that polynomial, then the error in approximating _f_ is no greater than 1&minus;_g_(1/2).  _g_ can be computed with the SymPy computer algebra library as follows: `from sympy.stats import *; g=2*E( Min(sum(Bernoulli(("B%d" % (i)),z) for i in range(n))/n,(S(1)-S(1)/n)/2))`.

- I found the following approximation for _&lambda;_\*_c_<sup>[**(9)**](#Note9)</sup>: "(1.) Set _j_ to 0 and _i_ to 0; (2.) If _i_ &ge; _n_, return 0; (3.) Flip the input coin, and if it returns 1, add 1 to _j_; (4.) (Estimate the probability and return 1 if it 'went over'.) If (_j_/(_i_+1)) &ge; 1/_c_, return 1; (5.) Add 1 to _i_ and go to step 2."  Here, _&lambda;_\*_c_ is approximated by a polynomial where the _j_<sup>th</sup> coefficient (starting at 0) is min((_j_/_n_)\*_c_, 1).  If _g_(_&lambda;_) is that polynomial, then the error in approximating _f_ is is no greater than 1&minus;_g_(1/_c_).

- The previous approximation generalizes the one given in section 6 of Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup>, which approximates _&lambda;_\*2.

> **Note:** Bias and variance are the two sources of error in a randomized estimation algorithm.  Let _g_(_&lambda;_) be an approximation of _f_(_&lambda;_). The original Bernoulli factory for _f_, if it exists, has bias 0 and variance _f_(_&lambda;_)\*(1&minus;_f_(_&lambda;_)), but the approximate Bernoulli factory has bias _g_(_&lambda;_) &minus; _f_(_&lambda;_) and variance _g_(_&lambda;_)\*(1&minus;_g_(_&lambda;_)).  Unlike with bias, there are ways to reduce variance, which are outside the scope of this document.  An estimation algorithm's _mean squared error_ equals variance plus square of bias.

<a id=Achievable_Simulation_Rates></a>
## Achievable Simulation Rates

In general, the number of input coin flips needed by any Bernoulli factory algorithm for a factory function _f_(_&lambda;_) depends on how "smooth" the function _f_ is.

The following table summarizes the rate of simulation (in terms of the number of input coin flips needed) that can be achieved _in theory_ depending on _f_(_&lambda;_), assuming the unknown probability of heads.  In the table below:

- _&lambda;_, lies in the interval [_&epsilon;_, 1&minus;_&epsilon;_] for some _&epsilon;_ &gt; 0.
- _&Delta;_(_n_, _r_, _&lambda;_) = _O_(max(sqrt(_&lambda;_\*(1&minus;_&lambda;_)/_n_),1/_n_)<sup>_r_</sup>), that is, _O_((1/_n_)<sup>_r_</sup>) near _&lambda;_ = 0 or 1, and _O_((1/_n_)<sup>_r_/2</sup>) elsewhere. (_O_(_h_(_n_)) roughly means "bounded from above by _h_(_n_) times a constant".)

|   Property of simulation   |   Property of _f_
  ------------- |  ------------------------
| Requires no more than _n_ input coin flips. | If and only if _f_ can be written as a polynomial in Bernstein form of degree _n_ with coefficients in \[0, 1] (Goyal and Sigman 2012)<sup>[**(10)**](#Note10)</sup>. |
| Requires a finite number of flips on average. Also known as "realizable" by Flajolet et al. (2010)<sup>[**(3)**](#Note3)</sup>. | Only if _f_ is Lipschitz continuous (Nacu and Peres 2005)<sup>[**(1)**](#Note1)</sup>.<br/>Whenever _f_ admits a fast simulation (Mendo 2019)<sup>[**(11)**](#Note11)</sup>.  |
| Number of flips required, raised to power of _r_, is finite on average and has a tail that drops off uniformly for every _&lambda;_.  | Only if _f_ is _C_<sup>_r_</sup> continuous (has _r_ or more continuous derivatives, or "slope" functions) (Nacu and Peres 2005)<sup>[**(1)**](#Note1)</sup>. |
| Requires more than _n_ flips with probability _&Delta;_(_n_, _r_ + 1, _&lambda;_), for integer _r_ &ge; 0 and every _&lambda;_. (The greater _r_ is, the faster the simulation.) | Only if _f_ is _C_<sup>_r_</sup> continuous and the _r_<sup>th</sup> derivative is in the Zygmund class (has no vertical slope) (Holtz et al. 2011)<sup>[**(12)**](#Note12)</sup>. |
| Requires more than _n_ flips with probability _&Delta;_(_n_, _&alpha;_, _&lambda;_), for non-integer _&alpha;_ &gt; 0 and every _&lambda;_. (The greater _&alpha;_ is, the faster the simulation.) | If and only if _f_ is _C_<sup>_r_</sup> continuous and the _r_<sup>th</sup> derivative is (_&alpha;_ &minus; _r_)-Hölder continuous, where _r_ = floor(_&alpha;_) (Holtz et al. 2011)<sup>[**(12)**](#Note12)</sup>. Assumes _f_ is bounded away from 0 and 1. |
| "Fast simulation" (requires more than _n_ flips with a probability that decays exponentially as _n_ gets large).  Also known as "strongly realizable" by Flajolet et al. (2010)<sup>[**(3)**](#Note3)</sup>. | If and only if _f_ is real analytic (is _C_<sup>&infin;</sup> continuous, or has continuous _k_<sup>th</sup> derivative for every _k_, and agrees with its Taylor series "near" every point) (Nacu and Peres 2005)<sup>[**(1)**](#Note1)</sup>.   |
| Average number of flips bounded from below by (_f&prime;_(_&lambda;_))<sup>2</sup>\*_&lambda;_\*(1&minus;_&lambda;_)/(_f_(_&lambda;_)\*(1&minus;_f_(_&lambda;_))), where _f&prime;_ is the first derivative of _f_.  | Whenever _f_ admits a fast simulation (Mendo 2019)<sup>[**(11)**](#Note11)</sup>. |

> **Notes:**
>
> 1. By the results of Holtz et al., it is suspected that the target function _f_ can't be simulated using a finite number of flips on average unless _f_ is _C_<sup>2</sup> continuous.
> 2. If a function is constant on some open interval in its domain, but is not constant on the whole domain, then it can't be real analytic.

<a id=Complexity></a>
## Complexity

The following note shows the complexity of the algorithm for 1/_&phi;_ in the main article, where _&phi;_ is the golden ratio.

Let **E**\[_N_\] be the expected (average) number of unbiased random bits (fair coin flips) generated by the algorithm.

Then, since each bit is independent, **E**\[_N_\] = 2\*_&phi;_ as shown below.

- Each iteration stops the algorithm with probability _p_ = (1/2) + (1&minus;(1/2)) * (1/_&phi;_) (1/2 for the initial bit and 1/_&phi;_ for the recursive run; (1&minus;(1/2)) because we're subtracting the (1/2) earlier on the right-hand side from 1).
- Thus, the expected (average) number of iterations is **E**\[_T_\] = 1/_p_ by a well-known rejection sampling argument, since the algorithm doesn't depend on iteration counts.
- Each iteration uses 1 * (1/2) + (1 + **E**\[_N_\]) * (1/2) bits on average, so the whole algorithm uses **E**\[_N_\] = (1 * (1/2) + (1 + **E**\[_N_\]) * (1/2)) * **E**\[_T_\] bits on average (each iteration consumes either 1 bit with probability 1/2, or (1 + **E**\[_N_\]) bits with probability 1/2). This equation has the solution **E**\[_N_\] = 1 + sqrt(5) = 2\*_&phi;_.

Also, on average, half of these flips (_&phi;_) show 1 and half show 0, since the bits are unbiased (the coin is fair).

A similar analysis to the one above can be used to find the expected (average) time complexity of many Bernoulli factory algorithms.

<a id=Examples_of_Bernoulli_Factory_Approximation_Schemes></a>
## Examples of Bernoulli Factory Approximation Schemes

The following are approximation schemes and hints to simulate a coin of probability _f_(_&lambda;_) given an input coin with probability of heads of _&lambda;_.  The schemes were generated automatically using `approxscheme2` and have not been rigorously verified for correctness.

* Let _f_(_&lambda;_) = **min(1/2, _&lambda;_)**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be concave and Lipschitz continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 9563/10000 if _n_&lt;8; otherwise, _f_(_k_/_n_) + 322613/(250000\*sqrt(n)).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 371/500 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 967839/(2000000\*sqrt(n)).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **cosh(_&lambda;_) &minus; 1**.  Then simulate _f_ by first flipping the input coin twice.  If both flips return 0, return 0.  Otherwise, flip the input coin.  If it returns 0, return 0.  Otherwise, simulate _g_(_&lambda;_) (a function described below) and return the result.<br>
    Let _g_(_&lambda;_) = 1/4 if _&lambda;_ = 0; -(cosh(_&lambda;_) &minus; 1)/(_&lambda;_<sup>2</sup>\*(_&lambda;_ &minus; 2)) otherwise. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be convex and twice differentiable using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = 503/2500 if _n_&lt;4; otherwise, _g_(_k_/_n_) &minus; 136501/(700000\*n).
        * **fabove**(_n_, _k_) = _g_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 2301/10000 if _n_&lt;4; otherwise, _g_(_k_/_n_) &minus; 1774513/(22400000\*n).
        * **fabove**(_n_, _k_) = _g_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **cosh(_&lambda;_) &minus; 3/4**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be convex and twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = 487/2500 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 154309/(700000\*n).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 1043/5000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 462927/(2800000\*n).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **cosh(_&lambda;_)/4 &minus; 1/4**.  Then simulate _f_ by first flipping the input coin twice.  If both flips return 0, return 0.  Otherwise, flip the input coin.  If it returns 0, return 0.  Otherwise, simulate _g_(_&lambda;_) (a function described below) and return the result.<br>
    Let _g_(_&lambda;_) = 1/16 if _&lambda;_ = 0; -(cosh(_&lambda;_) &minus; 1)/(4\*_&lambda;_<sup>2</sup>\*(_&lambda;_ &minus; 2)) otherwise. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be convex and twice differentiable using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = 503/10000 if _n_&lt;4; otherwise, _g_(_k_/_n_) &minus; 17063/(350000\*n).
        * **fabove**(_n_, _k_) = _g_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 23/400 if _n_&lt;4; otherwise, _g_(_k_/_n_) &minus; 221819/(11200000\*n).
        * **fabove**(_n_, _k_) = _g_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **exp(_&lambda;_)/4 &minus; 1/4**.  Then simulate _f_ by first flipping the input coin twice.  If both flips return 0, return 0.  Otherwise, simulate _g_(_&lambda;_) (a function described below) and return the result.<br>
    Let _g_(_&lambda;_) = 1/8 if _&lambda;_ = 0; -(exp(_&lambda;_) &minus; 1)/(4\*_&lambda;_\*(_&lambda;_ &minus; 2)) otherwise. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be convex and twice differentiable using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = 7/100 if _n_&lt;4; otherwise, _g_(_k_/_n_) &minus; 9617/(43750\*n).
        * **fabove**(_n_, _k_) = _g_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 207/2000 if _n_&lt;4; otherwise, _g_(_k_/_n_) &minus; 9617/(112000\*n).
        * **fabove**(_n_, _k_) = _g_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **sin(3\*_&lambda;_)/2**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be concave and twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 1319/2000 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 9/(14\*n).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 1299/2000 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 135/(224\*n).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **exp(&minus;_&lambda;_)**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be convex and twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = 3321/10000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 1/(7\*n).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 861/2500 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 3/(32\*n).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
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
* Let _f_(_&lambda;_) = **sin(&pi;\*_&lambda;_)/4 + 1/2**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be concave and twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 4191/5000 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 246741/(700000\*n).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 8313/10000 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 14557719/(44800000\*n).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **sqrt(_&lambda;_)**.  Then simulate _f_ by first simulating a polynomial with the following coefficients: [0, 1].  If it returns 0, return 1.  Otherwise, simulate _g_(_&lambda;_) (a function described below) and return 1 minus the result.  During the simulation, instead of flipping the input coin as usual, a different coin is flipped which does the following: "Flip the input coin and return 1 minus the result."<br>
    Let _g_(_&lambda;_) = 1/2 if _&lambda;_ = 0; (1 &minus; sqrt(1 &minus; _&lambda;_))/_&lambda;_ otherwise. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be convex and (1/2)-Hölder continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _g_(_k_/_n_) &minus; 147735488601/(80000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = _g_(_k_/_n_).
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _g_(_k_/_n_) &minus; 147735488601/(5120000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = _g_(_k_/_n_).
* Let _f_(_&lambda;_) = **1 &minus; _&lambda;_<sup>2</sup>**.  Then simulate _f_ by first flipping the input coin.  If it returns 0, return 1.  Otherwise, flip the input coin twice.  If both flips return 0, return 1.  Otherwise, simulate _g_(_&lambda;_) (a function described below) and return 1 minus the result.<br>
    Let _g_(_&lambda;_) = 1/(2 &minus; _&lambda;_). Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be convex and twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = 857/2000 if _n_&lt;4; otherwise, _g_(_k_/_n_) &minus; 2/(7\*n).
        * **fabove**(_n_, _k_) = _g_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 4709/10000 if _n_&lt;4; otherwise, _g_(_k_/_n_) &minus; 13/(112\*n).
        * **fabove**(_n_, _k_) = _g_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **sqrt(1 &minus; _&lambda;_<sup>2</sup>)**.  Then simulate _f_ by first flipping the input coin.  If it returns 0, return 1.  Otherwise, flip the input coin.  If it returns 0, return 1.  Otherwise, simulate _g_(_&lambda;_) (a function described below) and return 1 minus the result.<br>
    Let _g_(_&lambda;_) = 1/2 if _&lambda;_ = 0; (1 &minus; sqrt(1 &minus; _&lambda;_<sup>2</sup>))/_&lambda;_<sup>2</sup> otherwise. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be convex and (1/2)-Hölder continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _g_(_k_/_n_) &minus; 405238440128399386484736/(1953125\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = _g_(_k_/_n_).
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _g_(_k_/_n_) &minus; 6331850627006240413824/(1953125\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = _g_(_k_/_n_).
* Let _f_(_&lambda;_) = **cos(&pi;\*_&lambda;_)/4 + 1/2**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = 809/5000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 246741/(700000\*n).
        * **fabove**(_n_, _k_) = 4191/5000 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 246741/(700000\*n).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 409/2000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 8142453/(44800000\*n).
        * **fabove**(_n_, _k_) = 1591/2000 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 8142453/(44800000\*n).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **_&lambda;_\*sin(7\*&pi;\*_&lambda;_)/4 + 1/2**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be twice differentiable using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = 523/10000 if _n_&lt;64; otherwise, _f_(_k_/_n_) &minus; 11346621/(700000\*n).
        * **fabove**(_n_, _k_) = 1229/1250 if _n_&lt;64; otherwise, _f_(_k_/_n_) + 11346621/(700000\*n).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 681/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) &minus; 34039863/(4480000\*n).
        * **fabove**(_n_, _k_) = 4837/5000 if _n_&lt;32; otherwise, _f_(_k_/_n_) + 34039863/(4480000\*n).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **sin(4\*&pi;\*_&lambda;_)/4 + 1/2**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = 737/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) &minus; 1973921/(350000\*n).
        * **fabove**(_n_, _k_) = 9263/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) + 1973921/(350000\*n).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 1123/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) &minus; 1973921/(448000\*n).
        * **fabove**(_n_, _k_) = 8877/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) + 1973921/(448000\*n).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **sin(6\*&pi;\*_&lambda;_)/4 + 1/2**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = 517/10000 if _n_&lt;64; otherwise, _f_(_k_/_n_) &minus; 2220661/(175000\*n).
        * **fabove**(_n_, _k_) = 9483/10000 if _n_&lt;64; otherwise, _f_(_k_/_n_) + 2220661/(175000\*n).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 1043/10000 if _n_&lt;64; otherwise, _f_(_k_/_n_) &minus; 104371067/(11200000\*n).
        * **fabove**(_n_, _k_) = 8957/10000 if _n_&lt;64; otherwise, _f_(_k_/_n_) + 104371067/(11200000\*n).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **sin(2\*_&lambda;_)/2**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be concave and twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 2851/5000 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 2/(7\*n).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 5613/10000 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 1/(4\*n).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **sin(4\*&pi;\*_&lambda;_)/4 + 1/2**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = 737/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) &minus; 1973921/(350000\*n).
        * **fabove**(_n_, _k_) = 9263/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) + 1973921/(350000\*n).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 1123/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) &minus; 1973921/(448000\*n).
        * **fabove**(_n_, _k_) = 8877/10000 if _n_&lt;32; otherwise, _f_(_k_/_n_) + 1973921/(448000\*n).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **_&lambda;_<sup>2</sup>/2 + 1/10 if _&lambda;_ &le; 1/2; _&lambda;_/2 &minus; 1/40 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be convex and twice differentiable using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = 321/5000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 1/(7\*n).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 693/10000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 55/(448\*n).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **_&lambda;_/2 if _&lambda;_ &le; 1/2; (4\*_&lambda;_ &minus; 1)/(8\*_&lambda;_) otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be concave and twice differentiable using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 893/2000 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 2/(7\*n).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 4197/10000 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 5/(28\*n).
        * **fbound**(_n_) = [0, 1].
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
        * **fbound**(_n_) = [0, 1].
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
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **1/2 &minus; sqrt(1 &minus; 2\*_&lambda;_)/8 if _&lambda;_ < 1/2; sqrt(2\*_&lambda;_ &minus; 1)/8 + 1/2 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be (1/2)-Hölder continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = 333/10000 if _n_&lt;64; otherwise, _f_(_k_/_n_) &minus; 386562063/(400000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = 9667/10000 if _n_&lt;64; otherwise, _f_(_k_/_n_) + 386562063/(400000000\*n<sup>1/4</sup>).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 451/2000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 2705934441/(12800000000\*n<sup>1/4</sup>).
        * **fabove**(_n_, _k_) = 1549/2000 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 2705934441/(12800000000\*n<sup>1/4</sup>).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **_&lambda;_/4 + (1 &minus; 2\*_&lambda;_)<sup>3/2</sup>/24 + 5/24 if _&lambda;_ < 0; _&lambda;_/4 + (2\*_&lambda;_ &minus; 1)<sup>3/2</sup>/24 + 5/24 if _&lambda;_ &ge; 1/2; _&lambda;_/4 + (1 &minus; 2\*_&lambda;_)<sup>3/2</sup>/24 + 5/24 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be convex and Lipschitz continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = 443/5000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 322613/(1000000\*sqrt(n)).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 1111/5000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 3548743/(64000000\*sqrt(n)).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **3\*_&lambda;_/2 if _&lambda;_ &le; 1 &minus; _&lambda;_; 3/2 &minus; 3\*_&lambda;_/2 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be concave and Lipschitz continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 124/125 if _n_&lt;64; otherwise, _f_(_k_/_n_) + 967839/(500000\*sqrt(n)).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 1863/2000 if _n_&lt;64; otherwise, _f_(_k_/_n_) + 2903517/(2000000\*sqrt(n)).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **9\*_&lambda;_/5 if _&lambda;_ &le; 1 &minus; _&lambda;_; 9/5 &minus; 9\*_&lambda;_/5 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be concave and Lipschitz continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_) + 2903517/(1250000\*sqrt(n)).
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_) + 8710551/(5000000\*sqrt(n)).
* Let _f_(_&lambda;_) = **min(_&lambda;_, 1 &minus; _&lambda;_)**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be concave and Lipschitz continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 9563/10000 if _n_&lt;8; otherwise, _f_(_k_/_n_) + 322613/(250000\*sqrt(n)).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 123/125 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 967839/(1000000\*sqrt(n)).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **_&lambda;_/2 if _&lambda;_ &le; 1 &minus; _&lambda;_; 1/2 &minus; _&lambda;_/2 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be concave and Lipschitz continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 5727/10000 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 322613/(500000\*sqrt(n)).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 123/250 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 967839/(2000000\*sqrt(n)).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **19\*_&lambda;_/20 if _&lambda;_ &le; 1 &minus; _&lambda;_; 19/20 &minus; 19\*_&lambda;_/20 otherwise**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be concave and Lipschitz continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 1817/2000 if _n_&lt;8; otherwise, _f_(_k_/_n_) + 6129647/(5000000\*sqrt(n)).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 2337/2500 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 18388941/(20000000\*sqrt(n)).
        * **fbound**(_n_) = [0, 1].
* Let _f_(_&lambda;_) = **min(1/8, 3\*_&lambda;_)**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * Detected to be concave and Lipschitz continuous using numerical methods, which may be inaccurate:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 4047/5000 if _n_&lt;32; otherwise, _f_(_k_/_n_) + 967839/(250000\*sqrt(n)).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = _f_(_k_/_n_).
        * **fabove**(_n_, _k_) = 171/400 if _n_&lt;4; otherwise, _f_(_k_/_n_) + 967839/(1600000\*sqrt(n)).
        * **fbound**(_n_) = [0, 1].

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Nacu, Şerban, and Yuval Peres. "[**Fast simulation of new coins from old**](https://projecteuclid.org/euclid.aoap/1106922322)", The Annals of Applied Probability 15, no. 1A (2005): 93-115.</small>
- <small><sup id=Note2>(2)</sup> Specifically, the constant _m_ is an upper bound of abs(_f_(_x_)&minus;_f_(_y_))/(abs(_x_&minus;_y_)<sup>_&alpha;_</sup>) for every _x_, _y_ pairs, where _x_ and _y_ are each in \[0, 1\] and _x_ != _y_.  However, this bound can't directly be calculated as it would involve checking an infinite number of _x_, _y_ pairs.</small>
- <small><sup id=Note3>(3)</sup> Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560)", arXiv:0906.5560 [math.PR], 2010.</small>
- <small><sup id=Note4>(4)</sup> Powell, M.J.D., _Approximation Theory and Methods_, 1981</small>
- <small><sup id=Note5>(5)</sup> G. G. Lorentz. Bernstein polynomials. 1986.</small>
- <small><sup id=Note6>(6)</sup> Popoviciu, T., "Sur l'approximation des fonctions convexes d'ordre supérieur", Mathematica (Cluj), 1935.</small>
- <small><sup id=Note7>(7)</sup> Sikkema, P.C., "Der Wert einiger Konstanten in der Theorie der Approximation mit Bernstein-Polynomen", Numer. Math. 3 (1961).</small>
- <small><sup id=Note8>(8)</sup> Henderson, S.G., Glynn, P.W., "Nonexistence of a class of variate generation schemes", _Operations Research Letters_ 31 (2003).</small>
- <small><sup id=Note9>(9)</sup> For this approximation, if _n_ were infinity, the method would return 1 with probability 1 and so would not approximate _&lambda;_\*_c_, of course.</small>
- <small><sup id=Note10>(10)</sup> Goyal, V. and Sigman, K., 2012. On simulating a class of Bernstein polynomials. ACM Transactions on Modeling and Computer Simulation (TOMACS), 22(2), pp.1-5.</small>
- <small><sup id=Note11>(11)</sup> Mendo, Luis. "An asymptotically optimal Bernoulli factory for certain functions that can be expressed as power series." Stochastic Processes and their Applications 129, no. 11 (2019): 4366-4384.</small>
- <small><sup id=Note12>(12)</sup> Holtz, O., Nazarov, F., Peres, Y., "New Coins from Old, Smoothly", _Constructive Approximation_ 33 (2011).</small>
- <small><sup id=Note13>(13)</sup> Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.</small>
- <small><sup id=Note14>(14)</sup> Levy, H., _Stochastic dominance_, 1998.</small>
- <small><sup id=Note15>(15)</sup> Henry (https://math.stackexchange.com/users/6460/henry), Proving stochastic dominance for hypergeometric random variables, URL (version: 2021-02-20): [**https://math.stackexchange.com/q/4033573**](https://math.stackexchange.com/q/4033573) .</small>
- <small><sup id=Note16>(16)</sup> Gal, S.G., "Calculus of the modulus of continuity for nonconcave functions and applications", _Calcolo_ 27 (1990)</small>
- <small><sup id=Note17>(17)</sup> Gal, S.G., 1995. Properties of the modulus of continuity for monotonous convex functions and applications. _International Journal of Mathematics and Mathematical Sciences_ 18(3), pp.443-446.</small>
- <small><sup id=Note18>(18)</sup> Anastassiou, G.A., Gal, S.G., _Approximation Theory: Moduli of Continuity and Global Smoothness Preservation_, Birkhäuser, 2012.</small>

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Which_functions_admit_a_Bernoulli_factory></a>
### Which functions admit a Bernoulli factory?

In general, _f_(_&lambda;_) admits a Bernoulli factory for any _&lambda;_ on \[0, 1\] if and only if _f_ is continuous, maps \[0, 1\] to \[0, 1\], and is _polynomially bounded_, as defined later (Keane and O'Brien 1994)<sup>[**(13)**](#Note13)</sup>.

If _f_(_&lambda;_) meets these sufficient conditions, it admits a Bernoulli factory:

- _f_(_&lambda;_) is continuous on the closed interval [0, 1].
- _f_(_&lambda;_) has a minimum of greater than 0 and a maximum of less than 1.

If _f_(_&lambda;_) meets these sufficient conditions, it admits a Bernoulli factory and is Hölder continuous (has no slope steeper than an _n_<sup>th</sup> root's):

- _f_(_&lambda;_) is continuous.
- _f_(_&lambda;_) maps the closed interval \[0, 1\] to \[0, 1\].
- _f_(_&lambda;_) equals neither 0 nor 1 on the open interval (0, 1).
- _f_(_&lambda;_) is algebraic over rational numbers (that is, there is a nonzero polynomial _P_(_x_, _y_) in two variables and whose coefficients are rational numbers, such that _P_(_x_, _f_(_x_)) = 0).

A [**proof by Reid Barton**](https://mathoverflow.net/a/395018/171320) begins by showing that _f_ is a _semialgebraic function_, so that by a known inequality, it satisfies abs(f(_x_) &minus; f(_y_)) &le; _M_\*(abs(_x_&minus;_y_))<sup>_&alpha;_</sup> for some _&alpha;_ > 0 and some _M_ > 0 (which is the definition of being Hölder continuous), as well as meeting the definition of polynomially bounded given later.

<a id=Proofs_for_Function_Approximation_Schemes></a>
### Proofs for Function Approximation Schemes

This section shows mathematical proofs for some of the approximation schemes of this page.

In the following results:

- A _strictly bounded factory function_ means a continuous function on the closed interval [0, 1], with a minimum of greater than 0 and a maximum of less than 1.
- A function _f_(_&lambda;_) is _polynomially bounded_ if both _f_(_&lambda;_) and 1&minus;_f_(_&lambda;_) are bounded from below by min(_&lambda;_<sup>_n_</sup>, (1&minus;_&lambda;_)<sup>_n_</sup>) for some integer _n_ (Keane and O'Brien 1994)<sup>[**(13)**](#Note13)</sup>.
- A _modulus of continuity_ of a function _f_ means a non-negative and nondecreasing function on the interval [0, 1], for which _&omega;_(0) = 0, and for which abs(f(_x_) &minus; f(_y_)) &le; _&omega;_(abs(_x_&minus;_y_)) for every _x_ in [0, 1] and every _y_ in [0, 1].  Loosely speaking, the modulus of continuity _&omega;_(_&delta;_) gives _f_'s maximum range in a window of size _&delta;_.

**Lemma 1.** _Let f(&lambda;) be a continuous and nondecreasing function, and let X<sub>k</sub> be a hypergeometric(2\*n, k, n) random variable, where n&ge;1 is a constant integer and k is an integer in [0, 2\*n] .  Then **E**[f(X<sub>k</sub>/n)] is nondecreasing as k increases._

_Proof._ This is equivalent to verifying whether _X_<sub>_m_+1</sub>/_n_ &succeq; _X_<sub>_m_</sub>/_n_ (and, obviously by extension, _X_<sub>_m_+1</sub> &succeq; _X_<sub>_m_</sub>) in terms of first-degree stochastic dominance (Levy 1998)<sup>[**(14)**](#Note14)</sup>.   This means that the probability that (_X_<sub>_m_+1</sub> &le; _j_) is less than or equal to that for _X_<sub>_m_</sub> for each _j_ in the interval [0, _n_].  A proof of this was given by the user "Henry" of the _Mathematics Stack Exchange_ community<sup>[**(15)**](#Note15)</sup>. &#x25a1;

Lemma 6(i) of Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup> can be applied to continuous functions beyond just Lipschitz continuous functions.  This includes _Hölder continuous_ functions, namely continuous functions with no slope "steeper" than any "nth" root.

**Lemma 2.** _Let f(&lambda;) be a continuous function that maps [0, 1] to [0, 1], and let X be a hypergeometric(2\*n, k, n) random variable._

1. _Let &omega;(x) be a modulus of continuity of f.  If &omega; is continuous and concave on [0, 1], then the expression&mdash;<br>abs(**E**[f(X/n)] &minus; f(k/(2\*n))),&nbsp;&nbsp;&nbsp;(1)<br>is bounded from above by&mdash;_
    - _&omega;(sqrt(1/(8\*n&minus;4))), for every integer n&ge;1 that's a power of 2,_
    - _&omega;(sqrt(1/(7\*n))), for every integer n&ge;4 that's a power of 2,_
    - _&omega;(sqrt(1/(2\*n))), for every integer n&ge;1 that's a power of 2, and_
    - _&omega;(sqrt( (k/(2\*n)) \* (1&minus;k/(2\*n)) / (2\*n&minus;1) )), for every n&ge;1 that's a power of 2._
2. _If f is &alpha;-Hölder continuous with Hölder constant M and with &alpha; in the interval (0, 1], then the expression (1) is bounded from above by&mdash;_
    - _M\*(1/(2\*n))<sup>&alpha;/2</sup>, for every integer n&ge;1 that's a power of 2,_
    - _M\*(1/(7\*n))<sup>&alpha;/2</sup>, for every integer n&ge;4 that's a power of 2, and_
    - _M\*(1/(8\*n&minus;4))<sup>&alpha;/2</sup>, for every integer n&ge;1 that's a power of 2._
3. _If f has a second derivative whose absolute value is defined in all of [0, 1] and bounded from above by M, then the expression (1) is bounded from above by&mdash;_
    - _(M/2)\*(1/(7\*n)), for every integer n&ge;4 that's a power of 2, and_
    - _(M/2)\*(1/(8\*n&minus;4)), for every integer n&ge;1 that's a power of 2._
4. _If f is convex, nondecreasing, and bounded from below by 0, then the expression (1) is bounded from above by **E**[f(Y/n)] for every integer n&ge;1 that's a power of 2, where Y is a hypergeometric(2*n, n, n) random variable._

_Proof._

1. _&omega;_ is assumed to be non-negative because absolute values are non-negative.  To prove the first and second bounds: abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_))) &le; **E**[abs(_f_(_X_/_n_) &minus; _f_(_k_/(2 \* _n_))] &le; **E**\[_&omega;_(abs(_X_/_n_ &minus; _k_/(2 \* _n_))] &le; _&omega;_(**E**[abs(_X_/_n_ &minus; _k_/(2 \* _n_))]) (by Jensen's inequality and because _&omega;_ is concave) &le; _&omega;_(sqrt(**E**[abs(_X_/_n_ &minus; _k_/(2 \* _n_))]<sup>2</sup>)) = _&omega;_(sqrt(**Var**[_X_/_n_])) = _&omega;_(sqrt((_k_\*(2 \* _n_&minus;_k_)/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)))) &le; _&omega;_(sqrt((_n_<sup>2</sup>/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)))) = _&omega;_(sqrt((1/(8\*_n_&minus;4)))) = _&rho;_, and for every _n_&ge;4 that are integer powers of 2, _&rho;_ &le; _&omega;_(sqrt(1/(7\*_n_))).  To prove the third bound: abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_))) &le; _&omega;_(sqrt(**Var**[_X_/_n_])) &le; _&omega;_(sqrt(1/(2\*n))).  To prove the fourth bound: abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_))) &le; _&omega;_(sqrt((_n_<sup>2</sup>/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)))) = _&omega;_(sqrt( (_k_/(2\*_n_)) \* (1&minus;_k_/(2\*_n_)) / (2\*_n_&minus;1) )).
2. By the definition of Hölder continuous functions, take _&omega;_(_x_) = _M_\*_x_<sup>_&alpha;_</sup>.  Because _&omega;_ is a concave modulus of continuity on [0,1], the result follows from part 1.
3. abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_))) &le; (_M_/2)\***Var**[_X_/_n_] = (_M_/2)\*(_k_\*(2 \* _n_&minus;_k_)/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)) &le; (_M_/2)\*(_n_<sup>2</sup>/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)) = (_M_/2)\*(1/(8\*_n_&minus;4)) = _&rho;_.  For every integer _n_&ge;4 that's a power of 2, _&rho;_ &le;  (_M_/2)\*(1/(7\*_n_)).
4. Let _X_<sub>_m_</sub> be a hypergeometric(2 \* _n_, _m_, _n_) random variable.  By Lemma 1 and the assumption that _f_ is nondecreasing, **E**[_f_(_X_<sub>_k_</sub>/_n_)] is nondecreasing as _k_ increases, so take **E**[_f_(_X_<sub>_n_</sub>/_n_)] = **E**[_f_(_Y_</sub>/_n_)] as the upper bound.  Then, abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_))) = abs(**E**[_f_(_X_/_n_)] &minus; _f_(**E**[_X_/_n_])) = **E**[_f_(_X_/_n_)] &minus; _f_(**E**\[_X_/_n_\]) (by Jensen's inequality, because _f_ is convex and bounded by 0) = **E**\[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_)) &le; **E**\[_f_(_X_/_n_)\] (because _f_ is bounded by 0) &le; **E**[_f_(_Y_/_n_)]. &#x25a1;

> **Notes:**
>
> 1. **E**[.] means expected or average value, and **Var**[.] means variance.  A hypergeometric(2 \* _n_, _k_, _n_) random variable is the number of "good" balls out of _n_ balls taken uniformly at random, all at once, from a bag containing 2 \* _n_ balls, _k_ of which are "good".
> 2. _f_ is _&alpha;_-Hölder continuous if its vertical slopes, if any, are no "steeper" than that of _M_\*_&lambda;_<sup>_&alpha;_</sup>, where _&alpha;_ is in the interval (0, 1] and _M_ is greater than 0.  An _&alpha;_-Hölder continuous function on the closed interval [0, 1] is also _&beta;_-Hölder continuous for any _&beta;_ less than _&alpha;_.
> 3. Parts 1 and 2 exploit a tighter bound on **Var**[_X_/_n_] than the bound given in Nacu and Peres (2005, Lemma 6(i) and 6(ii), respectively)<sup>[**(1)**](#Note1)</sup>.  However, for technical reasons, different bounds are proved for different ranges of integers _n_.
> 4. For part 3, as in Lemma 6(ii) of Nacu and Peres 2005, the second derivative need not be continuous (Y. Peres, pers. comm., 2021).
> 5. All continuous functions that map the closed interval [0, 1] to [0, 1], including all of them that admit a Bernoulli factory, have a modulus of continuity.  The proof of part 1 remains valid even if _&omega;_(0) > 0, because the bounds proved remain correct even if _&omega;_ is overestimated.  The following functions have a simple _&omega;_ that satisfies the lemma:
>     1. If _f_ is monotone increasing and convex, _&omega;_(_x_) can equal _f_(1) &minus; _f_(1&minus;_x_) (Gal 1990)<sup>[**(16)**](#Note16)</sup>; (Gal 1995)<sup>[**(17)**](#Note17)</sup>.
>     2. If _f_ is monotone decreasing and convex, _&omega;_(_x_) can equal _f_(0) &minus; _f_(_x_) (Gal 1990)<sup>[**(16)**](#Note16)</sup>; (Gal 1995)<sup>[**(17)**](#Note17)</sup>.
>     3. If _f_ is monotone increasing and concave, _&omega;_(_x_) can equal _f_(_x_) &minus; _f_(0) (by symmetry with 2).
>     4. If _f_ is monotone decreasing and concave, _&omega;_(_x_) can equal _f_(1&minus;_x_) &minus; _f_(1) (by symmetry with 1).
>     5. If _f_ is concave and is monotone increasing then monotone decreasing, then _&omega;_(_h_) can equal (_f_(min(_h_, _&sigma;_))+(_f_(1&minus;min(_h_, 1&minus;_&sigma;_))&minus;_f_(1)), where _&sigma;_ is the point where _f_ stops increasing and starts decreasing (Anastassiou and Gal 2012)<sup>[**(18)**](#Note18)</sup>.

**Theorem 1.** _Let &omega;(x) be as described in part 1 of Lemma 2, and let f(&lambda;) be a strictly bounded factory function. Let&mdash;_

_&eta;(n) = &eta;(2<sup>m</sup>) = &sum;<sub>k=m, m+1,...</sub> &phi;(2<sup>k</sup>),_

_for every integer n&ge;1 that's a power of 2 (with n=2<sup>m</sup>), where &phi;(n) is either&mdash;_

- _&omega;(sqrt(1/(8\*n&minus;4))), or_
- _&omega;(sqrt(1/(2\*n)))._

_If the infinite series &eta;(n) converges, then the following approximation scheme for f(&lambda;) is valid in the following sense: By forming two sequences of polynomials in Bernstein form with coefficients **fabove**(n, k) for the upper polynomials, and **fbelow**(n, k) for the lower polynomials, then those polynomials meet conditions (i), (iii), and (iv) of Proposition 3 of Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup>, for every integer n&ge;1 that's a power of 2, by defining **fabove** and **fbelow** as follows:_

- _**fbelow**(n, k) = f(k/n) &minus; &eta;(n)._
- _**fabove**(n, k) = f(k/n) + &eta;(n)._

_Except that the following bounding note applies: If **fabove**(n, k) > 1 for a given n and some k, **fabove**(n, k) = 1 instead for that n, and if **fbelow**(n, k) < 0 for a given n and some k, **fbelow**(n, k) = 0 instead for that n._

_Proof._ Follows from part 1 of Lemma 2 above as well as Remark B and the proof of Proposition 10 of Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup>.

We note that for the series _&eta;_(_n_) in the theorem, each term of the series is nonnegative making the series nonnegative and, by the assumption that the series converges, _&eta;_(_n_) is nonincreasing with increasing _n_.

Condition (i) says that the coefficients **fbelow** and **fabove** must be bounded by 0 and 1.  This is ensured starting with a large enough value of _n_ greater than 0, call it _n_<sub>0</sub>, as shown next.

Let _&epsilon;_ be a positive distance between 0 and the minimum or between 1 and the maximum of _f_, whichever is smaller.  This _&epsilon;_ exists by the assumption that _f_ is bounded away from 0 and 1. Because the series _&eta;_ converges, _&eta;_(_n_) will eventually stay less than _&epsilon;_.  And the `f(k/n)` term is bounded by the minimum and maximum of _f_ by construction.  This combined means that the coefficients **fbelow** and **fabove** will eventually be bounded by 0 and 1 for every integer _n_ starting with _n_<sub>0</sub>.

For _n_ less than _n_<sub>0</sub>, condition (i) is ensured by setting **fbelow** and **fabove** to 0 or 1, respectively, whenever a coefficient of the degree-_n_ polynomial would otherwise be outside the bounds.

Condition (iii) says that the upper polynomials must converge to _f_ and so must the lower polynomials.  This is ensured in a similar way as in Proposition 10, as well as by the assumption that the series converges: as _n_ goes to infinity, _&eta;_(_n_) goes to 0 so that the coefficients, and thus the polynomials, converge to _f_.  For _n_ less than _n_<sub>0</sub>, the values of **fbelow** and **fabove** can be 0 or 1 without affecting convergence.

Condition (iv) is the _consistency requirement_ described earlier in this page. This is ensured as in Proposition 10 by bounding, from below, the offset by which to shift the approximating polynomials.  This lower bound is _&eta;_(_n_), a solution to the equation 0 = _&eta;_(_n_) &minus; _&eta;_(2 \* _n_) &minus; _&phi;_(_n_) (see note below), where _&phi;_ can take on either form given in the theorem. The solution given in the theorem is easy to prove by noting that this is a recursive process: we start by calculating the series for _n_ = 2\*_n_, then adding _&phi;_(_n_) to it, in effect working backwards and recursively, and we can easily see that we can calculate the series for _n_ = 2\*_n_ only if the series converges, hence the assumption of a converging series. For _n_<sub>0</sub>, the consistency requirement is maintained by noting that the degree-_n_<sub>0</sub> polynomial's coefficients must be bounded by 0 and 1 by condition (i) so they will likewise be bounded by those of the lower and upper polynomials of degree less than _n_<sub>0</sub>, and those polynomials are identically 0 and identically 1, respectively, as are their coefficients. &#x25a1;

> **Note:** There is only one solution _&eta;_(_n_) in the case at hand.  Unlike so-called [**_functional equations_**](https://math.stackexchange.com/questions/3993739) and linear recurrences, with a solution that varies depending on the starting value, there is only one solution in the case at hand, namely the solution that makes the series converge, if it exists at all.  Alternatively, the equation can be expanded to 0 = _&eta;_(_n_) &minus; _&eta;_(4 \* _n_) &minus; _&phi;_(2\*_n_) &minus; _&phi;_(_n_) = _&eta;_(_n_) &minus; _&eta;_(8 \* _n_) &minus; _&phi;_(4\*_n_) &minus; _&phi;_(2\*_n_) &minus; _&phi;_(_n_) = ...

**Corollary 1.** _Let f(&lambda;) be a strictly bounded factory function. If f is &alpha;-Hölder continuous with Hölder constant M and with &alpha; in the interval (0, 1], then the following approximation scheme determined by **fbelow** and **fabove** is valid in the sense of Theorem 1, subject to the bounding note:_

- _**fbelow**(n, k) = f(k/n) &minus; &delta;(n)._
- _**fabove**(n, k) = f(k/n) + &delta;(n)._

_Where D(n) = M/((2<sup>&alpha;/2</sup>&minus;1)\*n<sup>&alpha;/2</sup>)._

_Proof._ Follows from Theorem 1 by using the _&omega;_ given in part 2 of Lemma 2, and by using _&phi;_(_n_) = _&omega;_(sqrt(1/(2\*_n_))). &#x25a1;

> **Note:** For specific values of _&alpha;_, the equation _D_(_n_) = _D_(2 \* _n_) + _&phi;_(_n_) can be solved via linear recurrences; an example for _&alpha;_ = 1/2 is the following SymPy code: `rsolve(Eq(f(n),f(n+1)+z*(1/(2*2**n))**((S(1)/2)/2)),f(n)).subs(n,ln(n,2)).simplify()`.  Trying different values of _&alpha;_ suggested the following formula for Hölder continuous functions with _&alpha;_ of 1/_j_ or greater: (_M_\* &sum;<sub>_i_ = 0,...,(_j_\*2)&minus;1</sub> 2<sup>_i_/(2\*_j_)</sup>)/_n_<sup>1/(2\*_j_)</sup> = _M_ / ((2<sup>1/(2\*_j_)</sup>&minus;1)\*_n_<sup>1/(2\*_j_)</sup>); and generalizing the latter expression led to the term in the theorem.

**Corollary 2.** _Let f(&lambda;) be a strictly bounded factory function.  If f is Lipschitz continuous with Lipschitz constant M, then the following approximation scheme determined by **fbelow** and **fabove** is valid in the sense of Theorem 1, subject to the bounding note:_

- _**fbelow**(n, k) = f(k/n) &minus; M/((sqrt(2)&minus;1)\*sqrt(n))._
- _**fabove**(n, k) = f(k/n) + M/((sqrt(2)&minus;1)\*sqrt(n))._

_Proof._ Because Lipschitz continuous functions are 1-Hölder continuous with Hölder constant _M_, the result follows from Corollary 1. &#x25a1;

> **Note:** This special case of Theorem 1 was already found by Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup>.

**Theorem 2.** _Let f(&lambda;) be a strictly bounded factory function, and let &omega;(x) be as described in Theorem 1. Theorem 1 remains valid with the following versions of &phi;(n), **fbelow**, and **fabove**, rather than as given in that theorem, subject to the bounding note:_

- _&phi;(n) = &omega;(sqrt(1/(7\*n)))._
- _**fbelow**(n, k) = min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if n < 4; otherwise, f(k/n) &minus; &eta;(n)._
- _**fabove**(n, k) = max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if n < 4; otherwise, f(k/n) + &eta;(n)._

_Proof._  Follows from Theorem 1 and part 1 of Lemma 2 above, as well as Remark B and the proof of Proposition 10 of Nacu and Peres, including the observation in Remark B of the paper that we can start the algorithm from _n_ = 4; in that case, the upper and lower polynomials of degree 1 through 3 above would be constant functions, so that as polynomials in Bernstein form, the coefficients of each one would be equal.  With the _&phi;_ given in this theorem, the series _&eta;_(_n_) in Theorem 1 remains nonnegative; also, this theorem adopts Theorem 1's assumption that the series converges, so that _&eta;_(_n_) still decreases with increasing _n_. &#x25a1;

**Corollary 3.** _Let f(&lambda;) be a strictly bounded factory function. If f is &alpha;-Hölder continuous with Hölder constant M and with &alpha; in the interval (0, 1], then the following approximation scheme is valid in the sense of Theorem 1, subject to the bounding note:_

- _**fbelow**(n, k) = min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if n < 4; otherwise, f(k/n) &minus; &eta;(n)._
- _**fabove**(n, k) = max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if n < 4; otherwise, f(k/n) + &eta;(n)._

_Where &eta;(n) = M\*(2/7)<sup>&alpha;/2</sup>/((2<sup>&alpha;/2</sup>&minus;1)\*n<sup>&alpha;/2</sup>)._

_Proof._ Follows from Theorem 2 by using the _&omega;_ given in part 2 of Lemma 2. &#x25a1;

**Theorem 3.** _Let f(&lambda;) be a strictly bounded factory function.  If f has a second derivative whose absolute value is defined in all of [0, 1] and bounded from above by M, then the following approximation scheme is valid in the sense of Theorem 1, subject to the bounding note:_

- _**fbelow**(n, k) = min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if n < 4; otherwise, f(k/n) &minus; M/(7\*n)._
- _**fabove**(n, k) = max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if n < 4; otherwise, f(k/n) + M/(7\*n)._

_Proof._  Because (_M_/2)\*(1/(7\*_n_)) in part 3 of Lemma 2 is bounded the same way as the statement _&omega;_(sqrt(1/(7\*n))) in Theorem 2 and part 1 of Lemma 2, take _&omega;_(_n_) as (_M_/2)\*(1/(7\*_n_)).  Then the result follows from Theorem 2.  &#x25a1;

**Theorem 4.** _Let f(&lambda;) be a strictly bounded factory function.  If f is convex and nondecreasing, then Theorem 1 remains valid with &phi;(n) = **E**\[f(Y/n)\] (where Y is a hypergeometric(2*n, n, n) random variable), rather than as given in that theorem._

_Proof._  Follows from Theorem 1 and part 4 of Lemma 2 above. With the _&phi;_ given in this theorem, the series _&eta;_(_n_) in Theorem 1 remains nonnegative; also, this theorem adopts Theorem 1's assumption that the series converges, so that _&eta;_(_n_) still decreases with increasing _n_. &#x25a1;

**Proposition 1.**

1. _Let f be as given in any of Theorems 1 through 4, except that f must be concave and polynomially bounded and may have a minimum of 0. Then the approximation scheme of that theorem remains valid if **fbelow**(n, k) = f(k/n), rather than as given in that theorem._
2. _Let f be as given in any of Theorems 1 through 4, except that f must be convex and polynomially bounded and may have a maximum of 1.  Then the approximation scheme of that theorem remains valid if **fabove**(n, k) = f(k/n), rather than as given in that theorem._
3. _Theorems 1 through 4 can be extended to all integers n&ge;1, not just those that are powers of 2, by defining&mdash;_

    - _**fbelow**(n, k) = (k/n)\***fbelow**(n&minus;1, max(0, k&minus;1)) + ((n&minus;k)/n)\***fbelow**(n&minus;1, min(n&minus;1, k)), and_
    - _**fabove**(n, k) = (k/n)\***fabove**(n&minus;1, max(0, k&minus;1)) + ((n&minus;k)/n)\***fabove**(n&minus;1, min(n&minus;1, k)),_

    _for every integer n&ge;1 other than a power of 2. Parts 1 and 2 of this proposition still apply to the modified scheme._

_Proof._ Parts 1 and 2 follow from Theorems 1 through 4, as the case may be.  For part 1, the lower polynomials are replaced by the degree-_n_ Bernstein approximations of _f_, and they meet the conditions in those theorems by Jensen's inequality.  For part 2, the upper polynomials are involved instead of the lower polynomials.  Part 3 also follows from Remark B of Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup>. &#x25a1;

<a id=Example_of_Approximation_Scheme></a>
### Example of Approximation Scheme

The following example uses the results above to build an approximation scheme for a factory function.

Let _f_(_&lambda;_) = 0 if _&lambda;_ is 0, and (ln(_&lambda;_/exp(3)))<sup>&minus;2</sup> otherwise.  Then the following approximation scheme is valid in the sense of Theorem 1:

- _&eta;_(_k_) = &Phi;(1, 2, (ln(_k_)+ln(7)+6)/ln(2))\*4/ln(2)<sup>2</sup>.
- **fbelow**(n, k) = f(_k_/_n_).
- **fabove**(n, k) = max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if n < 4; otherwise, f(_k_/_n_) +  _&eta;_(_n_).

Where &Phi; is a function called the _Lerch transcendent_, and **fabove** is subject to Theorem 1's bounding note.

Notice that the function _f_ is not Hölder continuous; its slope is exponentially steep at the point 0.

The first step is to find a concave modulus of continuity of _f_ (called _&omega;_(_h_)).  Because _f_ is monotone increasing and concave, and because _f_(0) = 0, we can take _&omega;_(_h_) = _f_(_h_).

Now, by plugging sqrt(1/(7\*_n_)) into _&omega;_, we get the following for Theorem 2 (assuming _n_&ge;0):

- _&phi;_(_n_) = 1/(ln(sqrt(7/_n_)/7)&minus;3)<sup>2</sup>.

Now, by applying Theorem 1, we compute _&eta;_(_k_) by substituting _n_ with 2<sup>_n_</sup>, summing over [_k_, &infin;), and substituting _k_ with log2(_k_).  _&eta;_ converges, resulting in:

- _&eta;_(_k_) = &Phi;(1, 2, (ln(_k_)+ln(7)+6)/ln(2))\*4/ln(2)<sup>2</sup>,

where &Phi; is the Lerch transcendent.  This _&eta;_ matches the _&eta;_ given in the scheme above.  That scheme then follows from Theorems 1 and 2, as well as from part 1 of Proposition 1 because _f_ is concave.

The following SymPy code is an example of finding the parameters for this approximation scheme.

```
px=Piecewise((0,Eq(x,0)),((log(x/exp(3))**-2),True))
# omega is modulus of continuity.  Since
# px is monotone increasing, concave, and px(0)=0,
# we can take omega as px
omega=px
omega=piecewise_fold(omega.rewrite(Piecewise)).simplify()
# compute omega
phi=omega.subs(x,sqrt(1/(7*n)))
pprint(phi)
# compute eta
eta=summation(phi.subs(n,2**n),(n,k,oo)).simplify()
pprint(eta)
for i in range(20):
  # Calculate upper bounds for eta at certain points.
  try:
    print("eta(2^%d) ~= %s" % (i,ceiling(eta.subs(k,i)*10000000).n()/10000000))
  except:
    print("eta(2^%d) ~= [FAILED]" % (i))
```

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
