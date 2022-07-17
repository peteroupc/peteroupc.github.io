# Supplemental Notes for Bernoulli Factory Algorithms

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Contents></a>
## Contents

- [**Contents**](#Contents)
- [**General Factory Functions**](#General_Factory_Functions)
    - [**Approximation Schemes**](#Approximation_Schemes)
    - [**Schemes That Don't Work**](#Schemes_That_Don_t_Work)
- [**Approximate Bernoulli Factories**](#Approximate_Bernoulli_Factories)
    - [**Approximate Bernoulli Factories for Certain Functions**](#Approximate_Bernoulli_Factories_for_Certain_Functions)
    - [**Approximate Bernoulli Factories for Linear Functions**](#Approximate_Bernoulli_Factories_for_Linear_Functions)
- [**Achievable Simulation Rates**](#Achievable_Simulation_Rates)
- [**Complexity**](#Complexity)
- [**Examples of Bernoulli Factory Approximation Schemes**](#Examples_of_Bernoulli_Factory_Approximation_Schemes)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Which functions admit a Bernoulli factory?**](#Which_functions_admit_a_Bernoulli_factory)
    - [**Which functions don't require outside randomness to simulate?**](#Which_functions_don_t_require_outside_randomness_to_simulate)
    - [**Multiple-Output Bernoulli Factory**](#Multiple_Output_Bernoulli_Factory)
    - [**Proofs for Function Approximation Schemes**](#Proofs_for_Function_Approximation_Schemes)
    - [**Example of Approximation Scheme**](#Example_of_Approximation_Scheme)
- [**License**](#License)

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

    must have non-negative coefficients, once the polynomials are rewritten in Bernstein form and elevated to degree _n_.

The consistency requirement ensures that the upper polynomials "decrease" and the lower polynomials "increase".  Unfortunately, the reverse is not true in general; even if the upper polynomials "decrease" and the lower polynomials "increase" to _f_, this does not ensure the consistency requirement by itself.  Examples of this fact are shown in the section "[**Schemes That Don't Work**](#Schemes_That_Don_t_Work)" later in this document.

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
>
> **Example:** Take _f_(_&lambda;_) = exp(&minus;_&lambda;_).  This is a convex and twice differentiable function, and bounded below by 3321/10000.  Then it can be shown that the following scheme for _f_ is valid:
>
> * **fbelow**(_n_, _k_) = 3321/10000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 1/(7\*n). (Observe that _f_(_k_/4) &minus; 1/(7\*4) &ge; 3321/10000.)
> * **fabove**(_n_, _k_) = _f_(_k_/_n_) (because _f_ is convex).
> * **fbound**(_n_) = [0, 1].

**Hölder and Lipschitz continuous functions.** I have found a way to extend the results of Nacu and Peres (2005\)[^1] to certain functions with a slope that tends to a vertical slope.  The following scheme, proved in the appendix, implements **fabove** and **fbelow** if _f_(_&lambda;_)&mdash;

- is _&alpha;_-[**_Hölder continuous_**](https://en.wikipedia.org/wiki/Hölder_condition) on [0, 1], meaning its vertical slopes there, if any, are no "steeper" than that of _m_\*_&lambda;_<sup>_&alpha;_</sup>, for some number _m_ greater than 0 (the Hölder constant) and for some _&alpha;_ in the interval (0, 1], and
- in the interval \[0, 1\]&mdash;
    - has a minimum of greater than 0 and a maximum of less than 1, or
    - is convex and has a minimum of greater than 0, or
    - is concave and has a maximum of less than 1.

If _f_ is 1-Hölder continuous, then _f_ is [**_Lipschitz continuous_**](https://en.wikipedia.org/wiki/Lipschitz_continuity)[^2] and _m_ is the highest absolute value of the function's "slope".  Otherwise, finding _m_ for a given _&alpha;_ is non-trivial and it requires knowing where _f_'s vertical slopes are, among other things.[^3]  But assuming _m_ and _&alpha;_ are known, then for every integer _n_ that's a power of 2:

- _D_(_n_) = _m_\*(2/7)<sup>_&alpha;_/2</sup>/((2<sup>_&alpha;_/2</sup>&minus;1)\*_n_<sup>_&alpha;_/2</sup>).
- **fbelow**(_n_, _k_) = _f_(_k_/_n_) if _f_ is concave; otherwise, min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if _n_ < 4; otherwise, _f_(_k_/_n_) &minus; _D_(_n_).
- **fabove**(_n_, _k_) = _f_(_k_/_n_) if _f_ is convex; otherwise, max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if _n_ < 4; otherwise, _f_(_k_/_n_) + _D_(_n_).

> **Note:**
>
> 1. Some functions _f_ are not _&alpha;_-Hölder continuous for any _&alpha;_ greater than 0.  These functions have a slope that's steeper than every "nth" root, and can't be handled by this method.  One example is _f_(_&lambda;_) = 1/10 if _&lambda;_ is 0 and &minus;1/(2\*ln(_&lambda;_/2)) + 1/10 otherwise, which has a slope near 0 that's steeper than every "nth" root.
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
2. Run a Bernoulli factory algorithm for _g_(.) and return the result of that algorithm.  This can be one of the [**general factory function algorithms**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions) if there is a way to calculate polynomials that converge to _g_(.) in a manner needed for that algorithm (for example, if _g_ is described earlier in this section).

> **Notes:**
>
> 1. It may happen that _g_(0) = 0.  In this case, step 2 of this algorithm can involve running this algorithm again, but with new _g_ and _h_ functions that are found based on the current _g_ function.  See the second example below.
> 2. If&mdash;
>
>     - _f_ is strictly increasing,
>     - _h_(_&lambda;_) = _&lambda;_, and
>     - _f&prime;_(_&lambda;_), the "slope" function of _f_, is continuous on [0, 1], maps (0, 1) to (0, 1), and belongs in one of the classes of functions given earlier,
>
>     then step 2 can be implemented by taking _g_ as _f&prime;_, except: (A) a uniform random variate, greater than 0 and less than 1, is generated at the start of the step; (B) instead of flipping the input coin as normal during that step, a different coin is flipped that does the following: "Flip the input coin, then [**sample from the number _u_**](https://peteroupc.github.io/bernoulli.html#Algorithms). Return 1 if both the call and the flip return 1, and return 0 otherwise."<br/>This is the "**integral method**" of Flajolet et al. (2010\)[^4] \(the modified step 2 simulates 1/_&lambda;_ times the _integral_ of _f_.).
>
> **Examples:**
>
> 1. If _f_(_&lambda;_) = (sinh(_&lambda;_)+cosh(_&lambda;_)&minus;1)/4, then _f_ is bounded from above by _h_(_&lambda;_) = _&lambda;_, so _g_(_&lambda;_) is 1/4 if _&lambda;_ = 0, and (exp(_&lambda;_) &minus; 1)/(4\*_&lambda;_) otherwise.  The following code in Python that uses the SymPy computer algebra library computes this example: `fx = (sinh(x)+cosh(x)-1)/4; h = x; pprint(Piecewise((limit(fx/h,x,0), Eq(x,0)), ((fx/h).simplify(), True)))`.
> 2. If _f_(_&lambda;_) = cosh(_&lambda;_) &minus; 1, then _f_ is bounded from above by _h_(_&lambda;_) = _&lambda;_, so _g_(_&lambda;_) is 0 if _&lambda;_ = 0, and (cosh(_&lambda;_)&minus;1)/_&lambda;_ otherwise.  Now, since _g_(0) = 0, find new functions _g_ and _h_ based on the current _g_.  The current _g_ is bounded from above by _H_(_&lambda;_) = _&lambda;_\*3\*(2&minus;_&lambda;_)/5 (a degree-2 polynomial that in Bernstein form has coefficients [0, 6/10, 6/10]), so _G_(_&lambda;_) = 5/12 if _&lambda;_ = 0, and &minus;(5\*cosh(_&lambda;_) &minus; 5)/(3\*_&lambda;_<sup>2</sup>\*(_&lambda;_&minus;2)) otherwise. _G_ is bounded away from 0 and 1, resulting in the following algorithm:
>
>     1. (Simulate _h_.) Flip the input coin.  If it returns 0, return 0.
>     2. (Simulate _H_.) Flip the input coin twice.  If both flips return 0, return 0.  Otherwise, with probability 4/10 (that is, 1 minus 6/10), return 0.
>     3. Run a Bernoulli factory algorithm for _G_ (which might involve building polynomials that converge to _G_, noticing that _G_ is twice differentiable) and return the result of that algorithm.

**Certain functions that equal 0 at 0 and 1 at 1.**  Let _f_, _g_, and _h_ be functions as defined earlier, except that _f_(0) = 0 and _f_(1) = 1.  Define the following additional functions:

- _&omega;_(_&lambda;_) is a function that meets the following requirements:
    - _&omega;_(_&lambda;_) is continuous on the closed interval [0, 1].
    - _&omega;_(0) = 0 and _&omega;_(1) = 1.
    - 1 &gt; _f_(_&lambda;_) &gt; _&omega;_(_&lambda;_) &gt; 0 for every _&lambda;_ in the open interval (0, 1).
- _q_(_&lambda;_) = lim<sub>_&nu;_&rarr;_&lambda;_</sub> _&omega;_(_&nu;_)/_h_(_&nu;_).
- _r_(_&lambda;_) = lim<sub>_&nu;_&rarr;_&lambda;_</sub> (1&minus;_g_(_&nu;_))/(1&minus;_q_(_&nu;_)).

Roughly speaking, _&omega;_ is a function that bounds _f_ from below, just as _h_ bounds _f_ from above. _&omega;_ should be a function with a simple Bernoulli factory algorithm, such as a polynomial in Bernstein form.  If both _&omega;_ and _h_ are polynomials of the same degree, _q_ will be a rational function with a relatively simple Bernoulli factory algorithm (see "[**Certain Rational Functions**](https://peteroupc.github.io/bernoulli.html#Certain_Rational_Functions)").

Now, if _r_(_&lambda;_) is continuous on [0, 1], then _f_ can be simulated using the following algorithm:

1. Run a Bernoulli factory algorithm for _h_.  If the call returns 0, return 0. (For example, if _h_(_&lambda;_) = _&lambda;_, then this step amounts to the following: "Flip the input coin.  If it returns 0, return 0.")
2. Run a Bernoulli factory algorithm for _q_(.).  If the call returns 1, return 1.
3. Run a Bernoulli factory algorithm for _r_(.), and return 1 minus the result of that call.  The Bernoulli factory algorithm can be one of the [**general factory function algorithms**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions) if there is a way to calculate polynomials that converge to _r_(.) in a manner needed for that algorithm (for example, if _r_ is described earlier in this section).

> **Note:** Quick proof: Rewrite $f=h\cdot(q\cdot1+(1-q)\cdot(1-r))+(1-h)\cdot0$.
>
> **Example:** If _f_(_&lambda;_) = (1&minus;exp(_&lambda;_))/(1&minus;exp(1)), then _f_ is bounded from above by _h_(_&lambda;_) = _&lambda;_, and from below by _&omega;_(_&lambda;_) = _&lambda;_<sup>2</sup>.  As a result, _q_(_&lambda;_) = _&lambda;_, and _r_(_&lambda;_) = (2 &minus; exp(1))/(1 &minus; exp(1)) if _&lambda;_ = 0; 1/(exp(1)&minus;1) if _&lambda;_ = 1; and (&minus;_&lambda;_\*(1 &minus; exp(1)) &minus; exp(_&lambda;_) + 1)/(_&lambda;_\*(1 &minus; exp(1))\*(_&lambda;_ &minus; 1)) otherwise.  This can be computed using the following code in Python that uses the SymPy computer algebra library: `fx=(1-exp(x))/(1-exp(1)); h=x; omega=x**2; q=(omega/h); r=(1-fx/h)/(1-q); r=Piecewise((limit(r, x, 0), Eq(x,0)), (limit(r,x,1),Eq(x,1)), (r,True)).simplify(); pprint(r)`.

**Other functions that equal 0 or 1 at the endpoints 0 and/or 1.** If _f_ does not fully admit an approximation scheme under the convex, concave, twice differentiable, and Hölder classes:

| If _f_(0) = | And _f_(1) = |      Method |
 --- | --- | --- |
| > 0 and < 1 | 1 | Use the algorithm for **certain functions that equal 0 at 0**, but with _f_(_&lambda;_) = 1 &minus; _f_(1&minus;_&lambda;_).<br/>_Inverted coin_: Instead of the usual input coin, use a coin that does the following: "Flip the input coin and return 1 minus the result."<br/>_Inverted result:_ If the overall algorithm would return 0, it returns 1 instead, and vice versa. |
| > 0 and < 1 | 0 | Algorithm for **certain functions that equal 0 at 0**, but with _f_(_&lambda;_) = _f_(1&minus;_&lambda;_).  (For example, cosh(_&lambda;_)&minus;1 becomes cosh(1&minus;_&lambda;_)&minus;1.)<br/>Inverted coin. |
| 1 | 0 | Algorithm for **certain functions that equal 0 at 0 and 1 at 1**, but with _f_(_&lambda;_) = 1&minus;_f_(_&lambda;_).<br/>Inverted result. |
| 1 | > 0 and &le; 1 | Algorithm for **certain functions that equal 0 at 0**, but with _f_(_&lambda;_) = 1&minus;_f_(_&lambda;_).<br/>Inverted result. |

**Specific functions.** My [**GitHub repository**](https://github.com/peteroupc/peteroupc.github.io/blob/master/approxscheme.py) includes SymPy code for a method, `approxscheme2`, to build a polynomial approximation scheme for certain factory functions.

<a id=Schemes_That_Don_t_Work></a>
### Schemes That Don't Work

In the academic literature (papers and books), there are many approximation methods that involve polynomials that converge from above and below to a function.  Unfortunately, most of them cannot be used as is to simulate a function _f_ in the Bernoulli Factory setting, because they don't ensure the consistency requirement described earlier.

The following are approximation schemes with counterexamples to consistency.

**First scheme.** In this scheme (Powell 1981\)[^5], let _f_ be a C<sup>2</sup> continuous function (a function with continuous "slope" and "slope-of-slope" functions) in [0, 1].  Then for every _n_&ge;1:

- **fabove**(_n_, _k_) = _f_(_k_/_n_) + _M_ / (8*_n_).
- **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; _M_ / (8*_n_).

Where _M_ is not less than the maximum absolute value of _f_'s slope-of-slope function (second derivative), and where _k_ is an integer in the interval [0, _n_].

The counterexample involves the C<sup>2</sup> continuous function _g_(_&lambda;_) = sin(_&pi;_\*_&lambda;_)/4 + 1/2.

For _g_, the coefficients for&mdash;

- the degree-2 upper polynomial in Bernstein form (**fabove**(5, _k_)) are [0.6542..., 0.9042..., 0.6542...], and
- the degree-4 upper polynomial in Bernstein form (**fabove**(6, _k_)) are [0.5771..., 0.7538..., 0.8271..., 0.7538..., 0.5771...].

The degree-2 polynomial lies above the degree-4 polynomial everywhere in [0, 1].  However, to ensure consistency, the degree-2 polynomial, once elevated to degree 4 and rewritten in Bernstein form, must have coefficients that are greater than or equal to those of the degree-4 polynomial.

- Once elevated to degree 4, the degree-2 polynomial's coefficients are [0.6542..., 0.7792..., 0.8208..., 0.7792..., 0.6542...].

As can be seen, the elevated polynomial's coefficient 0.8208... is less than the corresponding coefficient 0.8271... for the degree-4 polynomial.

_The rest of this section will note counterexamples involving other functions and schemes, without demonstrating them in detail._

**Second scheme.** In this scheme, let _f_ be a Lipschitz continuous function in \[0, 1\][^2], and let _S_ be the Sikkema constant, equal to (4306+837*sqrt(6))/5832, or slightly less than 1.09 (Sikkema 1961\)[^6].  Then for every _n_&ge;2:

- **fabove**(_n_, _k_) = _f_(_k_/_n_) + _L_\*_S_ / sqrt(_n_).
- **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus;  _L_\*(5/4) / sqrt(_n_).

Where L is the Lipschitz constant (the maximum absolute value of the "slope" function if it's continuous), , and where _k_ is an integer in the interval \[0, _n_\] (Lorentz 1986\)[^7].

There are two counterexamples here; together they show that this scheme can fail to ensure consistency, even if the set of functions is restricted to "smooth" functions (not just Lipschitz continuous functions):

1. The function _f_(_&lambda;_) = min(_&lambda;_, 1&minus;_&lambda;_)/2 is Lipschitz continuous with Lipschitz constant 1/2.  (In addition, _f_ has a kink at 1/2, so that it's not differentiable, but this is not essential for the counterexample.)  The counterexample involves the degree-5 and degree-6 upper polynomials (**fabove**(5, _k_) and **fabove**(6, _k_)).
2. The function _f_ = sin(4\*_&pi;_\*_&lambda;_)/4 + 1/2, a "smooth" function with Lipschitz constant _&pi;_.  The counterexample involves the degree-3 and degree-4 lower polynomials (**fbelow**(3, _k_) and **fbelow**(4, _k_)).

By extension, these counterexamples also appliy to the looser Popoviciu constant _S_ = 5/4 (Popoviciu 1935)[^8].

**Note on "clamping".** For any approximation scheme, "clamping" the values of **fbelow** and **fabove** to fit the interval [0, 1] won't necessarily preserve the consistency requirement, even if the original scheme met that requirement.

Here is a counterexample that applies to any approximation scheme.

Let _g_ and _h_ be two polynomials in Bernstein form as follows:

- _g_ has degree 5 and coefficients [10179/10000, 2653/2500, 9387/10000, 5049/5000, 499/500, 9339/10000].
- _h_ has degree 6 and coefficients [10083/10000, 593/625, 9633/10000, 4513/5000, 4947/5000, 9473/10000, 4519/5000].

After elevating _g_'s degree, _g_'s coefficients are no less than _h_'s, as required by the consistency property.

However, by clamping coefficients above 1 to equal 1, so that _g_ is now _g&prime;_ with [1, 1, 9387/10000, 1, 499/500, 9339/10000] and _h_ is now _h&prime;_ with [1, 593/625, 9633/10000, 4513/5000, 4947/5000, 9473/10000, 4519/5000], and elevate _g&prime;_ for coefficients [1, 1, 14387/15000, 19387/20000, 1499/1500, 59239/60000, 9339/10000], some of the coefficients of _g&prime;_ are less than those of _h&prime;_.  Thus, for this pair of polynomials, clamping the coefficients will destroy the consistent approximation property.

<a id=Approximate_Bernoulli_Factories></a>
## Approximate Bernoulli Factories

Although the schemes in the previous section don't work when building a _family_ of polynomials that converge to a function _f_(_&lambda;_), they are still useful for building an _approximation_ to that function, in the form of a _single_ polynomial, leading to an **approximate Bernoulli factory** for _f_.

Here, _f_(_&lambda;_) can be any function that maps the closed interval [0, 1] to [0, 1], even if it isn't continuous or a factory function (examples include the "step function" 0 if _&lambda;_ < 1/2 and 1 otherwise, or the function 2\*min(_&lambda;_, 1 &minus; _&lambda;_)).  Continuous functions can be approximated arbitrarily well by an approximate Bernoulli factory (as a result of the so-called "Weierstrass approximation theorem"), but this is not the case in general for discontinuous functions.

To build an approximate Bernoulli factory:

1. First, find a polynomial in Bernstein form of degree _n_ that is close to the desired function _f_.

    The simplest choice for this polynomial has _n_+1 coefficients and its _j_<sup>th</sup> coefficient (starting at 0) is found as _f_(_j_/_n_), and this is used in the examples below.  For this choice, if _f_ is continuous, the polynomial can be brought arbitrarily close to _f_ by choosing _n_ high enough.

    Whatever polynomial is used, the polynomial's coefficients must all lie in \[0, 1\].

2. Then, use one of the algorithms in the section "[**Certain Polynomials**](https://peteroupc.github.io/bernoulli.html)" to toss heads with probability equal to that polynomial, given its coefficients.

> **Note:** Bias and variance are the two sources of error in a randomized estimation algorithm.  Let _g_(_&lambda;_) be an approximation of _f_(_&lambda;_). The original Bernoulli factory for _f_, if it exists, has bias 0 and variance _f_(_&lambda;_)\*(1&minus;_f_(_&lambda;_)), but the approximate Bernoulli factory has bias _g_(_&lambda;_) &minus; _f_(_&lambda;_) and variance _g_(_&lambda;_)\*(1&minus;_g_(_&lambda;_)). ("Variance reduction" methods are outside the scope of this document.)  An estimation algorithm's _mean squared error_ equals variance plus square of bias.

<a id=Approximate_Bernoulli_Factories_for_Certain_Functions></a>
### Approximate Bernoulli Factories for Certain Functions

The two schemes in the previous section give an upper bound on the error on approximating _f_ with a degree-_n_ polynomial in Bernstein form.  To find a degree _n_ such that _f_ is approximated with a maximum error of _&epsilon;_, it's enough to solve the error bound's equation for _n_, then take _n_ = ceil(_n_) to get the solution if it's an integer, or the nearest integer that's bigger than the solution.

For example:

- The first scheme works for C<sup>2</sup> continuous functions with maximum "slope-of-slope" of _M_.
    - The error bound is _&epsilon;_ = _M_/(8\*_n_).
    - Solving for _n_ and taking ceil(_n_) leads to _n_ = ceil(_M_/(8\*_&epsilon;_)).
- The second scheme works for the larger class of Lipschitz continuous functions with constant _L_, but produces a bigger polynomial degree in general.
    - The error bound is _&epsilon;_ = _L_\*((4306+837*sqrt(6))/5832) / sqrt(_n_), where _n_ is the polynomial's degree.
    - Solving for _n_ and taking ceil(_n_) leads to _n_ = ceil(_L_<sup>2</sup>\*(3604122\*sqrt(6) + 11372525)/(17006112\*_&epsilon;_<sup>2</sup>)).
    - This solution can be simplified further to_n_ = ceil(59393\*_L_<sup>2</sup>/(50000\*_&epsilon;_<sup>2</sup>)), which is slightly bigger.

(Other methods similar to this one can give an upper bound on the Bernstein-form polynomial approximation error, if they apply to the function _f_ to be approximated.)

Now, if _f_ belongs to either class given above, the following algorithm (adapted from "Certain Polynomials") simulates a polynomial that approximates _f_ with a maximum error of _&epsilon;_:

1. Calculate _n_ as described above for the given class.
2. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.
3. With probability _f_(_j_/_n_), return 1.  Otherwise, return 0. (If _f_(_j_/_n_) can be an irrational number, see "[**Algorithms for General Irrational Constants**](https://peteroupc.github.io/bernoulli.html#Algorithms_for_General_Irrational_Constants)" for ways to sample this irrational probability exactly.)

<a id=Approximate_Bernoulli_Factories_for_Linear_Functions></a>
### Approximate Bernoulli Factories for Linear Functions

There are a number of approximate methods to simulate _&lambda;_\*_c_, where _c_ > 1 and _&lambda;_ lies in \[0, 1/_c_).  ("Approximate" because this function touches 1 at 1/_c_, so it can't be a factory function.) Since the methods use only up to _n_ flips, where _n_ is an integer greater than 0, the approximation will be a polynomial of degree _n_.

- Henderson and Glynn (2003, Remark 4\)[^9] approximates the function _&lambda;_\*2 using a polynomial where the _j_<sup>th</sup> coefficient (starting at 0) is min((_j_/_n_)\*2, 1&minus;1/_n_).  If _g_(_&lambda;_) is that polynomial, then the error in approximating _f_ is no greater than 1&minus;_g_(1/2).  _g_ can be computed with the SymPy computer algebra library as follows: `from sympy.stats import *; g=2*E( Min(sum(Bernoulli(("B%d" % (i)),z) for i in range(n))/n,(S(1)-S(1)/n)/2))`.

- I found the following approximation for _&lambda;_\*_c_[^10]\: "(1.) Set _j_ to 0 and _i_ to 0; (2.) If _i_ &ge; _n_, return 0; (3.) Flip the input coin, and if it returns 1, add 1 to _j_; (4.) (Estimate the probability and return 1 if it 'went over'.) If (_j_/(_i_+1)) &ge; 1/_c_, return 1; (5.) Add 1 to _i_ and go to step 2."  Here, _&lambda;_\*_c_ is approximated by a polynomial where the _j_<sup>th</sup> coefficient (starting at 0) is min((_j_/_n_)\*_c_, 1).  If _g_(_&lambda;_) is that polynomial, then the error in approximating _f_ is no greater than 1&minus;_g_(1/_c_).

- The previous approximation generalizes the one given in section 6 of Nacu and Peres (2005\)[^1], which approximates _&lambda;_\*2.

<a id=Achievable_Simulation_Rates></a>
## Achievable Simulation Rates

In general, the number of input coin flips needed by any Bernoulli factory algorithm for a factory function _f_(_&lambda;_) depends on how "smooth" the function _f_ is.

The following table summarizes the rate of simulation (in terms of the number of input coin flips needed) that can be achieved _in theory_ depending on _f_(_&lambda;_), assuming the unknown probability of heads.  In the table below:

- _&lambda;_, the unknown probability of heads, lies in the interval [_&epsilon;_, 1&minus;_&epsilon;_] for some _&epsilon;_ &gt; 0.
- The simulation makes use of unbiased random bits in addition to input coin flips.
- _&Delta;_(_n_, _r_, _&lambda;_) = _O_(max(sqrt(_&lambda;_\*(1&minus;_&lambda;_)/_n_),1/_n_)<sup>_r_</sup>), that is, _O_((1/_n_)<sup>_r_</sup>) near _&lambda;_ = 0 or 1, and _O_((1/_n_)<sup>_r_/2</sup>) elsewhere. (_O_(_h_(_n_)) roughly means "bounded from above by _h_(_n_) times a constant, for every _n_ large enough".)

|   Property of simulation   |   Property of _f_
  ------------- |  ------------------------
| Requires no more than _n_ input coin flips. | If and only if _f_ can be written as a polynomial in Bernstein form of degree _n_ with coefficients in \[0, 1] (Goyal and Sigman 2012\)[^11]. |
| Requires a finite number of flips on average. Also known as "realizable" by Flajolet et al. (2010\)[^4]. | Only if _f_ is Lipschitz continuous (Nacu and Peres 2005\)[^1].<br/>Whenever _f_ admits a fast simulation (Mendo 2019\)[^12].  |
| Number of flips required, raised to power of _r_, is finite on average and has a tail that drops off uniformly for every _&lambda;_.  | Only if _f_ is _C_<sup>_r_</sup> continuous (has _r_ or more continuous derivatives, or "slope" functions) (Nacu and Peres 2005\)[^1]. |
| Requires more than _n_ flips with probability _&Delta;_(_n_, _r_ + 1, _&lambda;_), for integer _r_ &ge; 0 and every _&lambda;_. (The greater _r_ is, the faster the simulation.) | Only if _f_ is _C_<sup>_r_</sup> continuous and the _r_<sup>th</sup> derivative is in the Zygmund class (has no vertical slope) (Holtz et al. 2011\)[^13]. |
| Requires more than _n_ flips with probability _&Delta;_(_n_, _&alpha;_, _&lambda;_), for non-integer _&alpha;_ &gt; 0 and every _&lambda;_. (The greater _&alpha;_ is, the faster the simulation.) | If and only if _f_ is _C_<sup>_r_</sup> continuous and the _r_<sup>th</sup> derivative is (_&alpha;_ &minus; _r_)-Hölder continuous, where _r_ = floor(_&alpha;_) (Holtz et al. 2011\)[^13]. Assumes _f_ is bounded away from 0 and 1. |
| "Fast simulation" (requires more than _n_ flips with a probability that decays exponentially as _n_ gets large).  Also known as "strongly realizable" by Flajolet et al. (2010\)[^4]. | If and only if _f_ is real analytic (is _C_<sup>&infin;</sup> continuous, or has continuous _k_<sup>th</sup> derivative for every _k_, and equals its Taylor series at every point) (Nacu and Peres 2005\)[^1].   |
| Average number of flips bounded from below by (_f&prime;_(_&lambda;_))<sup>2</sup>\*_&lambda;_\*(1&minus;_&lambda;_)/(_f_(_&lambda;_)\*(1&minus;_f_(_&lambda;_))), where _f&prime;_ is the first derivative of _f_.  | Whenever _f_ admits a fast simulation (Mendo 2019\)[^12]. |

> **Notes:**
>
> 1. By the results of Holtz et al., it is suspected that the target function _f_ can't be simulated using a finite number of flips on average for every probability of heads unless _f_'s fourth derivative is Hölder continuous.
> 2. If a function is constant on some non-empty open interval in its domain, but is not constant on the whole domain, then it can't be real analytic.

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
* Let _f_(_&lambda;_) = **cosh(_&lambda;_) &minus; 3/4**. Then, for every integer _n_ that's a power of 2, starting from 1:
    * The function was detected to be convex and twice differentiable, leading to:
        * **fbelow**(_n_, _k_) = 487/2500 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 154309/(700000\*n).
        * **fabove**(_n_, _k_) = _f_(_k_/_n_).
        * **fbound**(_n_) = [0, 1].
    * Generated using tighter bounds than necessarily proven:
        * **fbelow**(_n_, _k_) = 1043/5000 if _n_&lt;4; otherwise, _f_(_k_/_n_) &minus; 462927/(2800000\*n).
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

[^1]: Nacu, Şerban, and Yuval Peres. "[**Fast simulation of new coins from old**](https://projecteuclid.org/euclid.aoap/1106922322)", The Annals of Applied Probability 15, no. 1A (2005): 93-115.

[^2]: A Lipschitz continuous function on [0, 1], with constant _L_ is a continuous function such that _f_(_x_) and _f_(_y_) are no more than _L_\*_&epsilon;_ apart whenever _x_ and _y_ are in [0, 1] and no more than _&epsilon;_ apart.  Roughly speaking, the function has a defined slope at all points or "almost everywhere" in [0, 1], and that slope is bounded wherever it's defined.

[^3]: Specifically, the constant _m_ is a number equal to or greater than abs(_f_(_x_)&minus;_f_(_y_))/(abs(_x_&minus;_y_)<sup>_&alpha;_</sup>) for every _x_ in \[0, 1\] and every _y_ in \[0, 1\] such that _x_ != _y_.  However, _m_ can't directly be calculated as it would involve checking infinitely many _x_, _y_ pairs.

[^4]: Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560)", arXiv:0906.5560 [math.PR], 2010.

[^5]: Powell, M.J.D., _Approximation Theory and Methods_, 1981

[^6]: Sikkema, P.C., "Der Wert einiger Konstanten in der Theorie der Approximation mit Bernstein-Polynomen", Numer. Math. 3 (1961).

[^7]: G. G. Lorentz. Bernstein polynomials. 1986.

[^8]: Popoviciu, T., "Sur l'approximation des fonctions convexes d'ordre supérieur", Mathematica (Cluj), 1935.

[^9]: Henderson, S.G., Glynn, P.W., "Nonexistence of a class of variate generation schemes", _Operations Research Letters_ 31 (2003).

[^10]: For this approximation, if _n_ were infinity, the method would return 1 with probability 1 and so would not approximate _&lambda;_\*_c_, of course.

[^11]: Goyal, V. and Sigman, K., 2012. On simulating a class of Bernstein polynomials. ACM Transactions on Modeling and Computer Simulation (TOMACS), 22(2), pp.1-5.

[^12]: Mendo, Luis. "An asymptotically optimal Bernoulli factory for certain functions that can be expressed as power series." Stochastic Processes and their Applications 129, no. 11 (2019): 4366-4384.

[^13]: Holtz, O., Nazarov, F., Peres, Y., "New Coins from Old, Smoothly", _Constructive Approximation_ 33 (2011).

[^14]: Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.

[^15]: von Neumann, J., "Various techniques used in connection with random digits", 1951.

[^16]: Peres, Y., "[**Iterating von Neumann's procedure for extracting random bits**](https://projecteuclid.org/euclid.aos/1176348543)", Annals of Statistics 1992,20,1, p. 590-597.

[^17]: Knuth, Donald E. and Andrew Chi-Chih Yao. "The complexity of nonuniform random number generation", in _Algorithms and Complexity: New Directions and Recent Results_, 1976.

[^18]: Mossel, Elchanan, and Yuval Peres. New coins from old: computing with unknown bias. Combinatorica, 25(6), pp.707-724.

[^19]: S. Pae, "[**Binarization Trees and Random Number Generation**](https://arxiv.org/abs/1602.06058v2)", arXiv:1602.06058v2 [cs.DS], 2018.

[^20]: Levy, H., _Stochastic dominance_, 1998.

[^21]: Henry (https://math.stackexchange.com/users/6460/henry), Proving stochastic dominance for hypergeometric random variables, URL (version: 2021-02-20): [**https://math.stackexchange.com/q/4033573**](https://math.stackexchange.com/q/4033573) .

[^22]: Gal, S.G., "Calculus of the modulus of continuity for nonconcave functions and applications", _Calcolo_ 27 (1990)

[^23]: Gal, S.G., 1995. Properties of the modulus of continuity for monotonous convex functions and applications. _International Journal of Mathematics and Mathematical Sciences_ 18(3), pp.443-446.

[^24]: Anastassiou, G.A., Gal, S.G., _Approximation Theory: Moduli of Continuity and Global Smoothness Preservation_, Birkhäuser, 2012.

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Which_functions_admit_a_Bernoulli_factory></a>
### Which functions admit a Bernoulli factory?

Let _f_(_&lambda;_) be a function whose domain is the _closed_ interval [0, 1] or a subset of it, and that maps its domain to [0, 1].  The domain of _f_ gives the allowable values of _&lambda;_, which is the input coin's probability of heads.

_f_ admits a Bernoulli factory if and only if _f_ is constant on its domain, or is continuous and _polynomially bounded_ on its domain, as defined in the section "Proofs for Function Approximation Schemes" (Keane and O'Brien 1994\)[^14].

If _f_(_&lambda;_) meets these sufficient conditions, it admits a Bernoulli factory:

- _f_(_&lambda;_) is continuous on the closed interval [0, 1].
- _f_(_&lambda;_) has a minimum of greater than 0 and a maximum of less than 1.

If _f_(_&lambda;_) meets these sufficient conditions, it admits a Bernoulli factory and is Hölder continuous (has no slope steeper than an _n_<sup>th</sup> root's):

- _f_(_&lambda;_) is continuous.
- _f_(_&lambda;_) maps the closed interval \[0, 1\] to \[0, 1\].
- _f_(_&lambda;_) equals neither 0 nor 1 on the open interval (0, 1).
- _f_(_&lambda;_) is algebraic over rational numbers (that is, there is a nonzero polynomial _P_(_x_, _y_) in two variables and whose coefficients are rational numbers, such that _P_(_x_, _f_(_x_)) = 0 for every _x_ in the domain of _f_).

A [**proof by Reid Barton**](https://mathoverflow.net/a/395018/171320) begins by showing that _f_ is a _semialgebraic function_, so that by a known inequality and the other conditions, it meets the definitions of being Hölder continuous and polynomially bounded.

<a id=Which_functions_don_t_require_outside_randomness_to_simulate></a>
### Which functions don't require outside randomness to simulate?

The function _f_(_&lambda;_) is _strongly simulable_ if it admits a Bernoulli factory algorithm that uses nothing but the input coin as a source of randomness (Keane and O'Brien 1994\)[^14].  See "[**Randomized vs. Non-Randomized Algorithms**](https://peteroupc.github.io/bernoulli.html#Randomized_vs_Non_Randomized_Algorithms)".

**Strong Simulability Statement.** A function _f_(_&lambda;_) is strongly simulable only if&mdash;

1. _f_ is constant on its domain, or is continuous and polynomially bounded on its domain, and
2. _f_ maps the closed interval [0, 1] or a subset of it to [0, 1], and
3. _f_(0) equals 0 or 1 whenever 0 is in the domain of _f_, and
4. _f_(1) equals 0 or 1 whenever 1 is in the domain of _f_.

Keane and O'Brien already showed that _f_ is strongly simulable if conditions 1 and 2 are true and neither 0 nor 1 are included in the domain of _f_.  Conditions 3 and 4 are required because _&lambda;_ (the probability of heads) can be 0 or 1 so that the input coin returns 0 or 1, respectively, every time.  This is called a "degenerate" coin.  When given just a degenerate coin, no algorithm can produce one value with probability greater than 0, and another value with the opposite probability.  Rather, the algorithm can only produce a constant value with probability 1.  In the Bernoulli factory problem, that constant is either 0 or 1, so a Bernoulli factory algorithm for _f_ must return 1 with probability 1, or 0 with probability 1, when given just a degenerate coin and no outside randomness, resulting in conditions 3 and 4.

To show that _f_ is strongly simulable, it's enough to show that there is a Bernoulli factory for _f_ that must flip the input coin and get 0 and 1 before it uses any outside randomness.

**Proposition 1.** _If f(&lambda;) is described in the strong simulability statement and is a polynomial with computable coefficients, it is strongly simulable._

_Proof:_ If _f_ is the constant 0 or 1, the proof is trivial: simply return 0 or 1, respectively.

Otherwise: Let _a_\[_j_\] be the _j_<sup>th</sup> coefficient of the polynomial in Bernstein form.  Consider the following algorithm, modified from (Goyal and Sigman 2012\)[^11].

1. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.
2. If 0 is in the domain of _f_ and if _j_ is 0, return _f_(0). (By condition 3, _f_(0) must be either 0 or 1.)
3. If 1 is in the domain of _f_ and if _j_ is _n_, return _f_(1). (By condition 4, _f_(1) must be either 0 or 1.)
4. With probability _a_\[_j_\], return 1.  Otherwise, return 0. (For example, generate a uniformly distributed random variate, greater than 0 and less than 1, then return 1 if that variate is less than _a_\[_j_\], or 0 otherwise.  _a_\[_j_\] is the coefficient _j_ of the polynomial written in Bernstein form), or 0 otherwise.

(By the properties of the Bernstein form, _a_\[0\] will equal _f_(0) and _a_\[_n_\] will equal _f_(1) whenever 0 or 1 is in the domain of _f_, respectively.)

Step 4 is done by first generating unbiased bits (such as with the von Neumann trick of flipping the input coin twice until the flip returns 0 then 1 or 1 then 0 this way, then taking the result as 0 or 1, respectively (von Neumann 1951\)[^15]), then using the algorithm in "[**Digit Expansions**](https://peteroupc.github.io/bernoulli.html#Digit_Expansion)" to produce the probability _a_\[_j_\].  The algorithm computes _a_\[_j_\] bit by bit and compares the computed value with the generated bits.  Since the coin returned both 0 and 1 in step 1 earlier in the algorithm, we know the coin isn't degenerate, so that step 4 will finish with probability 1.  Now, since the Bernoulli factory used only the input coin for randomness, this shows that _f_ is strongly simulable. &#x25a1;

**Proposition 2.** _If f(&lambda;) is described in the strong simulability statement, and if either f is constant on its domain or f meets the additional conditions below, then f is strongly simulable._

1. _If f(0) = 0 or f(1) = 0 or both, then there is a polynomial g(&lambda;) in Bernstein form whose coefficients are computable and in the interval [0, 1], such that g(0) = f(0) and g(1) = f(1) whenever 0 or 1, respectively, is in the domain of f, and such that g(&lambda;) &gt; f(&lambda;) for every &lambda; in the domain of f, except at 0 and 1._
2. _If f(0) = 1 or f(1) = 1 or both, then there is a polynomial h(&lambda;) in Bernstein form whose coefficients are computable and in the interval [0, 1], such that h(0) = f(0) and h(1) = f(1) whenever 0 or 1, respectively, is in the domain of f, and such that h(&lambda;) &lt; f(&lambda;) for every &lambda; in the domain of f, except at 0 and 1._

**Lemma 1.** _If f(&lambda;) is described in the strong simulability statement and meets the additional condition below, then f is strongly simulable._

- _There is a polynomial g(&lambda;) in Bernstein form whose coefficients are computable and in the interval [0, 1], such that g(0) = f(0) and g(1) = f(1) whenever 0 or 1, respectively, is in the domain of f, and such that g(&lambda;) &gt; f(&lambda;) for every &lambda; in the domain of f, except at 0 and 1._

_Proof:_  Consider the following algorithm.

1. If _f_ is 0 everywhere in its domain or 1 everywhere in its domain, return 0 or 1, respectively.
2. Otherwise, use the algorithm given in Proposition 1 to simulate _g_(_&lambda;_).  If the algorithm returns 0, return 0. By the additional condition in the lemma, 0 will be returned if _&lambda;_ is either 0 or 1.

    Now, we know that the input coin's probability of heads is neither 0 nor 1.

    By the conditions in the lemma, both _f_ and _g_ will be positive on the open interval (0, 1) (wherever _f_ is defined).

    Now let _h_(_&lambda;_) = _f_(_&lambda;_)/_g_(_&lambda;_).  By the conditions in the lemma, _h_ will be positive everywhere in that interval.

3. If _h_ equals 1 everywhere in the interval (0, 1) \(wherever _f_ is defined), return 1.
4. Otherwise, we run a Bernoulli factory algorithm for _h_(_&lambda;_) that uses the input coin (and possibly outside randomness).  Since _h_ is continuous and polynomially bounded and the input coin's probability of heads is neither 0 nor 1, _h_ is strongly simulable; we can replace the outside randomness in the algorithm with unbiased random bits via the von Neumann trick.

Thus, _f_ admits an algorithm that uses nothing but the input coin as a source of randomness, and so is strongly simulable. &#x25a1;

**Lemma 2.** _If f(&lambda;) is described in the strong simulability statement and meets the additional conditions below, then f is strongly simulable._

1. _There are two polynomials g(&lambda;) and &omega;(&lambda;) in Bernstein form, such that both polynomials' coefficients are computable and all in the interval [0, 1]._
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

Now let _r_(_&lambda;_) = (_f_(_&lambda;_) &minus; _&omega;_(_&lambda;_)) / (_g_(_&lambda;_) &minus; _&omega;_(_&lambda;_)).  By the conditions in the lemma, _h_ will be positive everywhere in the interval (0, 1), wherever _f_ is defined.

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

- _M_ be the Lipschitz constant of _f_ (for example, its "slope" function's maximum absolute value), or a computable number greater than this.
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

Let _J_ be a closed interval on (0, 1), such as [1/100, 99/100].  Define the _entropy bound_ as _h_(_f_(_&lambda;_))/_h_(_&lambda;_) where _h_(_x_) = &minus;_x_\*ln(_x_)&minus;(1&minus;_x_)\*ln(1&minus;_x_) is related to the Shannon entropy function.  The question is:

_When the probability &lambda; can be any value in J, is there a multiple-output Bernoulli factory for f(&lambda;) with an expected ("long-run average") number of input coin flips per sample that is arbitrarily close to the entropy bound?  Call such a Bernoulli factory an **optimal factory**._

(See Nacu and Peres (2005, Question 2\)[^1].)

So far, the following functions do admit an _optimal factory_:

- The functions _&lambda;_ and 1 &minus; _&lambda;_.
- Constants in \[0, 1\].  As Nacu and Peres (2005\)[^1] already showed, any such constant _c_ admits an optimal factory: generate unbiased random bits using Peres's iterated von Neumann extractor (Peres 1992\)[^16], then build a binary tree that generates 1 with probability _c_ and 0 otherwise (Knuth and Yao 1976\)[^17].

It is easy to see that if an _optimal factory_ exists for _f_(_&lambda;_), then one also exists for 1 &minus; _f_(_&lambda;_): simply change all ones returned by the _f_(_&lambda;_) factory into zeros and vice versa.

Also, as Yuval Peres (Jun. 24, 2021) told me, there is an efficient multiple-output Bernoulli factory for _f_(_&lambda;_) = _&lambda;_/2: the key is to flip the input coin enough times to produce unbiased random bits using his extractor (Peres 1992\)[^12], then multiply each unbiased bit with another input coin flip to get a sample from _&lambda;_/2.  Given that the sample is equal to 0, there are three possibilities that can "be extracted to produce more fair bits": either the unbiased bit is 0, or the coin flip is 0, or both are 0.

This algorithm, though, doesn't count as an _optimal factory_, and Peres described this algorithm only incompletely.  By simulation and trial and error I found an improved version of the algorithm.  It uses two randomness extractors (extractor 1 and extractor 2) that produce unbiased random bits from biased data (which is done using a method given later in this section).  The extractors must be asymptotically optimal (they must approach the entropy limit as closely as desired); one example is the iterated von Neumann construction in Peres (1992\)[^16].  The algorithm consists of doing the following in a loop until the desired number of outputs is generated.

1. If the number of outputs generated so far is divisible by 20, do the following:
    - Generate an unbiased random bit (see below).  If that bit is zero, output 0, then repeat this step unless the desired number of outputs has been generated.  If the bit is 1, flip the input coin and output the result.
2. Otherwise, do the following:
    1. Generate an unbiased random bit (see below), call it _fc_.  Then flip the input coin and call the result _bc_.
    2. Output _fc_\*_bc_.
    3. (The following steps pass "unused" randomness to the extractor in a specific way to ensure correctness.) If _fc_ is 0, and _bc_ is 1, append 0 to extractor 2's input bits.
    4. If _fc_ and _bc_ are both 0, append 1 then 1 to extractor 2's input bits.
    5. If _fc_ is 1 and _bc_ is 0, append 1 then 0 to extractor 2's input bits.

Inspired by Peres's result with _&lambda;_/2, the following algorithm is proposed.  It works for any rational function of the form _D_(_&lambda;_)/_E_(_&lambda;_), where&mdash;

- _D_(_&lambda;_) = &sum;<sub>_i_ = 0, ..., _k_</sub> _&lambda;_<sup>_i_</sup> * (1 &minus; _&lambda;_)<sup>_k_ &minus; _i_</sup> * _d_\[_i_\],
- _E_(_&lambda;_) = &sum;<sub>_i_ = 0, ..., _k_</sub> _&lambda;_<sup>_i_</sup> * (1 &minus; _&lambda;_)<sup>_k_ &minus; _i_</sup> * _e_\[_i_\],
- every _d_\[_i_\] is less than or equal to the corresponding _e_\[_i_\], and
- each _d_\[_i_\] and each _e_\[_i_\] is a non-negative integer.

The algorithm is a modified version of the "block simulation" in Mossel and Peres (2005, Proposition 2.5\)[^18], which also "extracts" residual randomness with the help of six asymptotically optimal randomness extractors.  In the algorithm, let _r_ be an integer such that, for every integer _i_ in \[0, _k_], _e_\[_i_\] < choose(_k_, _i_)\*choose(2\*_r_, _r_).

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

While this algorithm is coin-flip-efficient, it is not believed to be an optimal factory, at least not without more work.  In particular, a bigger savings of input coin flips could occur if _f_(_&lambda;_) maps the interval _J_ to a small range of values, so that the algorithm could, for example, generate a uniform random variate in [0, 1] using unbiased random bits and see whether it lies outside that range of values &mdash; and thus produce a sample from _f_(_&lambda;_) without flipping the input coin again.

<small><sup>&dagger;</sup> For example, by translating the number to input bits via Pae's entropy-preserving binarization (Pae 2018\)[^19].  But correctness might depend on how this is done; after all, the number of coin flips per sample must equal or exceed the entropy bound for every _&lambda;_.</small>

<a id=Proofs_for_Function_Approximation_Schemes></a>
### Proofs for Function Approximation Schemes

This section shows mathematical proofs for some of the approximation schemes of this page.

In the following results:

- A _strictly bounded factory function_ means a continuous function on the closed interval [0, 1], with a minimum of greater than 0 and a maximum of less than 1.
- A function _f_(_&lambda;_) is _polynomially bounded_ if both _f_(_&lambda;_) and 1&minus;_f_(_&lambda;_) are bounded from below by min(_&lambda;_<sup>_n_</sup>, (1&minus;_&lambda;_)<sup>_n_</sup>) for some integer _n_ (Keane and O'Brien 1994\)[^14].
- A _modulus of continuity_ of a function _f_ means a non-negative and nondecreasing function _&omega;_ on the interval [0, 1], for which _&omega;_(0) = 0, and for which abs(f(_x_) &minus; f(_y_)) &le; _&omega;_(abs(_x_&minus;_y_)) for every _x_ in [0, 1] and every _y_ in [0, 1].  Loosely speaking, a modulus of continuity _&omega;_(_&delta;_) is bounded below by _f_'s maximum range in a window of size _&delta;_.

**Lemma 1.** _Let f(&lambda;) be a continuous and nondecreasing function, and let X<sub>k</sub> be a hypergeometric(2\*n, k, n) random variable, where n&ge;1 is a constant integer and k is an integer in [0, 2\*n] .  Then the expected value of f(X<sub>k</sub>/n) is nondecreasing as k increases._

_Proof._ This is equivalent to verifying whether _X_<sub>_m_+1</sub>/_n_ "dominates" _X_<sub>_m_</sub>/_n_ (and, obviously by extension, _X_<sub>_m_+1</sub> "dominates" _X_<sub>_m_</sub>) in terms of first-degree stochastic dominance (Levy 1998\)[^20].   This means that the probability that (_X_<sub>_m_+1</sub> &le; _j_) is less than or equal to that for _X_<sub>_m_</sub> for each _j_ in the interval [0, _n_].  A proof of this was given by the user "Henry" of the _Mathematics Stack Exchange_ community[^21]. &#x25a1;

Lemma 6(i) of Nacu and Peres (2005\)[^1] can be applied to continuous functions beyond just Lipschitz continuous functions.  This includes _Hölder continuous_ functions, namely continuous functions with no slope that's "steeper" than every "nth" root.

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

1. _&omega;_ is assumed to be non-negative because absolute values are non-negative.  To prove the first and second bounds: abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_))) &le; **E**[abs(_f_(_X_/_n_) &minus; _f_(_k_/(2 \* _n_))] &le; **E**\[_&omega;_(abs(_X_/_n_ &minus; _k_/(2 \* _n_))] &le; _&omega;_(**E**[abs(_X_/_n_ &minus; _k_/(2 \* _n_))]) (by Jensen's inequality and because _&omega;_ is concave) &le; _&omega;_(sqrt(**E**[abs(_X_/_n_ &minus; _k_/(2 \* _n_))]<sup>2</sup>)) = _&omega;_(sqrt(**Var**[_X_/_n_])) = _&omega;_(sqrt((_k_\*(2 \* _n_&minus;_k_)/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)))) &le; _&omega;_(sqrt((_n_<sup>2</sup>/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)))) = _&omega;_(sqrt((1/(8\*_n_&minus;4)))) = _&rho;_, and for every _n_&ge;4 that's an integer power of 2, _&rho;_ &le; _&omega;_(sqrt(1/(7\*_n_))).  To prove the third bound: abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_))) &le; _&omega;_(sqrt(**Var**[_X_/_n_])) &le; _&omega;_(sqrt(1/(2\*n))).  To prove the fourth bound: abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_))) &le; _&omega;_(sqrt((_n_<sup>2</sup>/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)))) = _&omega;_(sqrt( (_k_/(2\*_n_)) \* (1&minus;_k_/(2\*_n_)) / (2\*_n_&minus;1) )).
2. By the definition of Hölder continuous functions, take _&omega;_(_x_) = _M_\*_x_<sup>_&alpha;_</sup>.  Because _&omega;_ is a concave modulus of continuity on [0,1], the result follows from part 1.
3. abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_))) &le; (_M_/2)\***Var**[_X_/_n_] = (_M_/2)\*(_k_\*(2 \* _n_&minus;_k_)/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)) &le; (_M_/2)\*(_n_<sup>2</sup>/(4\*(2 \* _n_&minus;1)\*_n_<sup>2</sup>)) = (_M_/2)\*(1/(8\*_n_&minus;4)) = _&rho;_.  For every integer _n_&ge;4 that's a power of 2, _&rho;_ &le;  (_M_/2)\*(1/(7\*_n_)).
4. Let _X_<sub>_m_</sub> be a hypergeometric(2 \* _n_, _m_, _n_) random variable.  By Lemma 1 and the assumption that _f_ is nondecreasing, **E**[_f_(_X_<sub>_k_</sub>/_n_)] is nondecreasing as _k_ increases, so take **E**[_f_(_X_<sub>_n_</sub>/_n_)] = **E**[_f_(_Y_</sub>/_n_)] as the upper bound.  Then, abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_))) = abs(**E**[_f_(_X_/_n_)] &minus; _f_(**E**[_X_/_n_])) = **E**[_f_(_X_/_n_)] &minus; _f_(**E**\[_X_/_n_\]) (by Jensen's inequality, because _f_ is convex and bounded by 0) = **E**\[_f_(_X_/_n_)] &minus; _f_(_k_/(2 \* _n_)) &le; **E**\[_f_(_X_/_n_)\] (because _f_ is bounded by 0) &le; **E**[_f_(_Y_/_n_)]. &#x25a1;

> **Notes:**
>
> 1. **E**[.] means expected value ("long-run average"), and **Var**[.] means variance.  A hypergeometric(2 \* _n_, _k_, _n_) random variable is the number of "good" balls out of _n_ balls taken uniformly at random, all at once, from a bag containing 2 \* _n_ balls, _k_ of which are "good".
> 2. _f_ is _&alpha;_-Hölder continuous if its vertical slopes, if any, are no "steeper" than that of _M_\*_&lambda;_<sup>_&alpha;_</sup>, where 0 &lt; _&alpha;_ &le; 1 and _M_ is greater than 0.  An _&alpha;_-Hölder continuous function on the closed interval [0, 1] is also _&beta;_-Hölder continuous for any _&beta;_ such that 0 &lt; _&beta; &lt; _&alpha;_.
> 3. Parts 1 and 2 exploit a tighter bound on **Var**[_X_/_n_] than the bound given in Nacu and Peres (2005, Lemma 6(i) and 6(ii), respectively\)[^1].  However, for technical reasons, different bounds are proved for different ranges of integers _n_.
> 4. For part 3, as in Lemma 6(ii) of Nacu and Peres 2005, the second derivative need not be continuous (Y. Peres, pers. comm., 2021).
> 5. All continuous functions that map the closed interval [0, 1] to [0, 1], including all of them that admit a Bernoulli factory, have a modulus of continuity.  The proof of part 1 remains valid even if _&omega;_(0) > 0, because the bounds proved remain correct even if _&omega;_ is overestimated.  The following functions have a simple _&omega;_ that satisfies the lemma:
>     1. If _f_ is strictly increasing and convex, _&omega;_(_x_) can equal _f_(1) &minus; _f_(1&minus;_x_) (Gal 1990\)[^22]; (Gal 1995\)[^23].
>     2. If _f_ is strictly decreasing and convex, _&omega;_(_x_) can equal _f_(0) &minus; _f_(_x_) (Gal 1990\)[^22]; (Gal 1995\)[^23].
>     3. If _f_ is strictly increasing and concave, _&omega;_(_x_) can equal _f_(_x_) &minus; _f_(0) (by symmetry with 2).
>     4. If _f_ is strictly decreasing and concave, _&omega;_(_x_) can equal _f_(1&minus;_x_) &minus; _f_(1) (by symmetry with 1).
>     5. If _f_ is concave and is strictly increasing then strictly decreasing, then _&omega;_(_h_) can equal (_f_(min(_h_, _&sigma;_))+(_f_(1&minus;min(_h_, 1&minus;_&sigma;_))&minus;_f_(1)), where _&sigma;_ is the point where _f_ stops increasing and starts decreasing (Anastassiou and Gal 2012\)[^24].

**Theorem 1.** _Let &omega;(x) be as described in part 1 of Lemma 2, and let f(&lambda;) be a strictly bounded factory function. Let&mdash;_

_&eta;(n) = &eta;(2<sup>m</sup>) = &sum;<sub>k=m, m+1,...</sub> &phi;(2<sup>k</sup>),_

_for every integer n&ge;1 that's a power of 2 (with n=2<sup>m</sup>), where &phi;(n) is either&mdash;_

- _&omega;(sqrt(1/(8\*n&minus;4))), or_
- _&omega;(sqrt(1/(2\*n)))._

_If the infinite series &eta;(n) converges, then the following approximation scheme for f(&lambda;) is valid in the following sense: By forming two sequences of polynomials in Bernstein form with coefficients **fabove**(n, k) for the upper polynomials, and **fbelow**(n, k) for the lower polynomials, then those polynomials meet conditions (i), (iii), and (iv) of Proposition 3 of Nacu and Peres (2005\)[^1], for every integer n&ge;1 that's a power of 2, by defining **fabove** and **fbelow** as follows:_

- _**fbelow**(n, k) = f(k/n) &minus; &eta;(n)._
- _**fabove**(n, k) = f(k/n) + &eta;(n)._

_Except that the following bounding note applies: If **fabove**(n, k) > 1 for a given n and some k, **fabove**(n, k) = 1 instead for that n, and if **fbelow**(n, k) < 0 for a given n and some k, **fbelow**(n, k) = 0 instead for that n._

_Proof._ Follows from part 1 of Lemma 2 above as well as Remark B and the proof of Proposition 10 of Nacu and Peres (2005\)[^1].

For the series _&eta;_(_n_) in the theorem, each term of the series is nonnegative making the series nonnegative and, by the assumption that the series converges, _&eta;_(_n_) is nonincreasing with increasing _n_.

Condition (i) says that the coefficients **fbelow** and **fabove** must be bounded by 0 and 1.  This is ensured starting with a large enough value of _n_ greater than 0, call it _n_<sub>0</sub>, as shown next.

Let _&epsilon;_ be a positive distance between 0 and the minimum or between 1 and the maximum of _f_, whichever is smaller.  This _&epsilon;_ exists by the assumption that _f_ is bounded away from 0 and 1. Because the series _&eta;_ converges, _&eta;_(_n_) will eventually stay less than _&epsilon;_.  And the `f(k/n)` term is bounded by the minimum and maximum of _f_ by construction.  This combined means that the coefficients **fbelow** and **fabove** will eventually be bounded by 0 and 1 for every integer _n_ starting with _n_<sub>0</sub>.

For _n_ less than _n_<sub>0</sub>, condition (i) is ensured by setting **fbelow** and **fabove** to 0 or 1, respectively, whenever a coefficient of the degree-_n_ polynomial would otherwise be outside the bounds.

Condition (iii) says that the upper polynomials must converge to _f_ and so must the lower polynomials.  This is ensured in a similar way as in Proposition 10, as well as by the assumption that the series converges: as _n_ goes to infinity, _&eta;_(_n_) goes to 0 so that the coefficients, and thus the polynomials, converge to _f_.  For _n_ less than _n_<sub>0</sub>, the values of **fbelow** and **fabove** can be 0 or 1 without affecting convergence.

Condition (iv) is the _consistency requirement_ described earlier in this page. This is ensured as in Proposition 10 by bounding, from below, the offset by which to shift the approximating polynomials.  This lower bound is _&eta;_(_n_), a solution to the equation 0 = _&eta;_(_n_) &minus; _&eta;_(2 \* _n_) &minus; _&phi;_(_n_) (see note below), where _&phi;_ can take on either form given in the theorem. The solution given in the theorem is easy to prove by noting that this is a recursive process: we start by calculating the series for _n_ = 2\*_n_, then adding _&phi;_(_n_) to it, in effect working backwards and recursively, and we can easily see that we can calculate the series for _n_ = 2\*_n_ only if the series converges, hence the assumption of a converging series. For _n_<sub>0</sub>, the consistency requirement is maintained by noting that the degree-_n_<sub>0</sub> polynomial's coefficients must be bounded by 0 and 1 by condition (i) so they will likewise be bounded by those of the lower and upper polynomials of degree less than _n_<sub>0</sub>, and those polynomials are the constant 0 and the constant 1, respectively, as are their coefficients. &#x25a1;

> **Note:** There is only one solution _&eta;_(_n_) in the case at hand.  Unlike so-called [**_functional equations_**](https://math.stackexchange.com/questions/3993739) and linear recurrences, with a solution that varies depending on the starting value, there is only one solution in the case at hand, namely the solution that makes the series converge, if it exists at all.  Alternatively, the equation can be expanded to 0 = _&eta;_(_n_) &minus; _&eta;_(4 \* _n_) &minus; _&phi;_(2\*_n_) &minus; _&phi;_(_n_) = _&eta;_(_n_) &minus; _&eta;_(8 \* _n_) &minus; _&phi;_(4\*_n_) &minus; _&phi;_(2\*_n_) &minus; _&phi;_(_n_) = ...

**Corollary 1.** _Let f(&lambda;) be a strictly bounded factory function. If f is &alpha;-Hölder continuous with Hölder constant M and with &alpha; in the interval (0, 1], then the following approximation scheme determined by **fbelow** and **fabove** is valid in the sense of Theorem 1, subject to the bounding note:_

- _**fbelow**(n, k) = f(k/n) &minus; &delta;(n)._
- _**fabove**(n, k) = f(k/n) + &delta;(n)._

_Where D(n) = M/((2<sup>&alpha;/2</sup>&minus;1)\*n<sup>&alpha;/2</sup>)._

_Proof._ Follows from Theorem 1 by using the _&omega;_ given in part 2 of Lemma 2, and by using _&phi;_(_n_) = _&omega;_(sqrt(1/(2\*_n_))). &#x25a1;

> **Note:** For specific values of _&alpha;_, the equation _D_(_n_) = _D_(2 \* _n_) + _&phi;_(_n_) can be solved via linear recurrences; an example for _&alpha;_ = 1/2 is the following code in Python that uses the SymPy computer algebra library: `rsolve(Eq(f(n),f(n+1)+z*(1/(2*2**n))**((S(1)/2)/2)),f(n)).subs(n,ln(n,2)).simplify()`.  Trying different values of _&alpha;_ suggested the following formula for Hölder continuous functions with _&alpha;_ of 1/_j_ or greater: (_M_\* &sum;<sub>_i_ = 0,...,(_j_\*2)&minus;1</sub> 2<sup>_i_/(2\*_j_)</sup>)/_n_<sup>1/(2\*_j_)</sup> = _M_ / ((2<sup>1/(2\*_j_)</sup>&minus;1)\*_n_<sup>1/(2\*_j_)</sup>); and generalizing the latter expression led to the term in the theorem.

**Corollary 2.** _Let f(&lambda;) be a strictly bounded factory function.  If f is Lipschitz continuous with Lipschitz constant M, then the following approximation scheme determined by **fbelow** and **fabove** is valid in the sense of Theorem 1, subject to the bounding note:_

- _**fbelow**(n, k) = f(k/n) &minus; M/((sqrt(2)&minus;1)\*sqrt(n))._
- _**fabove**(n, k) = f(k/n) + M/((sqrt(2)&minus;1)\*sqrt(n))._

_Proof._ Because Lipschitz continuous functions are 1-Hölder continuous with Hölder constant _M_, the result follows from Corollary 1. &#x25a1;

> **Note:** This special case of Theorem 1 was already found by Nacu and Peres (2005\)[^1].

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

_Proof._ Parts 1 and 2 follow from Theorems 1 through 4, as the case may be.  For part 1, the lower polynomials are replaced by the degree-_n_ Bernstein approximations of _f_, and they meet the conditions in those theorems by Jensen's inequality.  For part 2, the upper polynomials are involved instead of the lower polynomials.  Part 3 also follows from Remark B of Nacu and Peres (2005\)[^1]. &#x25a1;

<a id=Example_of_Approximation_Scheme></a>
### Example of Approximation Scheme

The following example uses the results above to build an approximation scheme for a factory function.

Let _f_(_&lambda;_) = 0 if _&lambda;_ is 0, and (ln(_&lambda;_/exp(3)))<sup>&minus;2</sup> otherwise.  Then the following approximation scheme is valid in the sense of Theorem 1:

- _&eta;_(_k_) = &Phi;(1, 2, (ln(_k_)+ln(7)+6)/ln(2))\*4/ln(2)<sup>2</sup>.
- **fbelow**(n, k) = f(_k_/_n_).
- **fabove**(n, k) = max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if n < 4; otherwise, f(_k_/_n_) +  _&eta;_(_n_).

Where &Phi;(.) is a function called the _Lerch transcendent_, and **fabove** is subject to Theorem 1's bounding note.

Notice that the function _f_ is not Hölder continuous; its slope is exponentially steep at the point 0.

The first step is to find a concave modulus of continuity of _f_ (called _&omega;_(_h_)).  Because _f_ is strictly increasing and concave, and because _f_(0) = 0, we can take _&omega;_(_h_) = _f_(_h_).

Now, by plugging sqrt(1/(7\*_n_)) into _&omega;_, we get the following for Theorem 2 (assuming _n_&ge;0):

- _&phi;_(_n_) = 1/(ln(sqrt(7/_n_)/7)&minus;3)<sup>2</sup>.

Now, by applying Theorem 1, we compute _&eta;_(_k_) by substituting _n_ with 2<sup>_n_</sup>, summing over [_k_, &infin;), and substituting _k_ with log2(_k_).  _&eta;_ converges, resulting in:

- _&eta;_(_k_) = &Phi;(1, 2, (ln(_k_)+ln(7)+6)/ln(2))\*4/ln(2)<sup>2</sup>,

where &Phi;(.) is the Lerch transcendent.  This _&eta;_ matches the _&eta;_ given in the scheme above.  That scheme then follows from Theorems 1 and 2, as well as from part 1 of Proposition 1 because _f_ is concave.

the following code in Python that uses the SymPy computer algebra library is an example of finding the parameters for this approximation scheme.

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
