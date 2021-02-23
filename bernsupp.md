# Supplemental Notes for Bernoulli Factory Algorithms

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=General_Factory_Functions></a>
## General Factory Functions

As a reminder, the _Bernoulli factory problem_ is: Given a coin with unknown probability of heads of _&lambda;_, sample the probability _f_(_&lambda;_).

The algorithms for [**general factory functions**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions), described in my main article on Bernoulli factory algorithms, work by building randomized upper and lower bounds for a function _f_(_&lambda;_), based on flips of the input coin.  Roughly speaking, the algorithms work as follows:

1. Generate a uniform(0, 1) random number, _U_.
2. Flip the input coin, then build an upper and lower bound for _f_(_&lambda;_), based on the outcomes of the flips so far.
3. If _U_ is less than or equal to the lower bound, return 1. If _U_ is greater than the upper bound, return 0.  Otherwise, go to step 2.

These randomized upper and lower bounds come from two sequences of polynomials: one approaches the function _f_(_&lambda;_) from above, the other from below, where _f_ is a continuous function that maps the interval (0, 1) to (0, 1).  (These two sequences form a so-called _approximation scheme_ for _f_.) One requirement for these algorithms to work correctly is called the _consistency requirement_:

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

**_C_<sup>2</sup> continuous functions.** The following method, proved in the appendix, implements **fabove** and **fbelow** if _f_(_&lambda;_)&mdash;

- has continuous "slope" and "slope-of-slope" functions in the interval \[0, 1\] \(in other words, _f_ is _C_<sup>2</sup> continuous or _twice differentiable_ there), and
- in the interval \[0, 1\]&mdash;
    - has a minimum of greater than 0 and a maximum of less than 1, or
    - is convex and has a minimum of greater than 0, or
    - is concave and has a maximum of less than 1.

Let _m_ be an upper bound of the highest value of abs(_f&prime;&prime;_(_x_)) for any _x_ in [0, 1], where _f&prime;&prime;_ is the "slope-of-slope" function of _f_.  Then for all _n_ that are powers of 2:

- **fbelow**(_n_, _k_) = _f_(_k_/_n_) if _f_ is concave; otherwise, min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if _n_ < 4; otherwise,  _f_(_k_/_n_) &minus; _m_/(7\*_n_).
- **fabove**(_n_, _k_) = _f_(_k_/_n_) if _f_ is convex; otherwise, max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if _n_ < 4; otherwise, _f_(_k_/_n_) + _m_/(7\*_n_).

My [**GitHub repository**](https://github.com/peteroupc/peteroupc.github.io/blob/master/approxscheme.py) includes SymPy code for a method, `c2params`, to calculate the necessary values for _m_ and the bounds of these polynomials, given _f_.

**Hölder and Lipschitz continuous functions.** I have found a way to extend the results of Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup> to certain functions with a slope that tends to a vertical slope.  The following scheme, proved in the appendix, implements **fabove** and **fbelow** if _f_(_&lambda;_)&mdash;

- is _&alpha;_-_Hölder continuous_ in [0, 1], meaning its vertical slopes there, if any, are no "steeper" than _m_\*_&lambda;_<sup>_&alpha;_</sup>, for some number _m_ greater than 0 (the Hölder constant) and for some _&alpha;_ in the interval (0, 1], and
- in the interval \[0, 1\]&mdash;
    - has a minimum of greater than 0 and a maximum of less than 1, or
    - is convex and has a minimum of greater than 0, or
    - is concave and has a maximum of less than 1.

If _f_ in \[0, 1] has a defined slope at all but a countable number of points, and does not tend to a vertical slope anywhere, then _f_ is [**_Lipschitz continuous_**](https://en.wikipedia.org/wiki/Lipschitz_continuity), _&alpha;_ is 1, and _m_ is the highest absolute value of the function's "slope".  Otherwise, finding _m_ for a given _&alpha;_ is non-trivial and it requires knowing where _f_'s vertical slopes are, among other things.<sup>[**(2)**](#Note2)</sup>  But assuming _m_ and _&alpha;_ are known, then for all _n_ that are powers of 2:

- _&delta;_(_n_) = _m_\*(2/7)<sup>_&alpha;_/2</sup>/((2<sup>_&alpha;_/2</sup>&minus;1)\*_n_<sup>_&alpha;_/2</sup>).
- **fbelow**(_n_, _k_) = _f_(_k_/_n_) if _f_ is concave; otherwise, min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if _n_ < 4; otherwise, _f_(_k_/_n_) &minus; _&delta;_(_n_).
- **fabove**(_n_, _k_) = _f_(_k_/_n_) if _f_ is convex; otherwise, max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if _n_ < 4; otherwise, _f_(_k_/_n_) + _&delta;_(_n_).

**Specific functions.** My [**GitHub repository**](https://github.com/peteroupc/peteroupc.github.io/blob/master/approxscheme.py) includes SymPy code for a method, `approxscheme2`, to build a polynomial approximation scheme for certain factory functions.

<a id=Schemes_That_Don_t_Work></a>
### Schemes That Don't Work

In the academic literature (papers and books), there are many approximation schemes that involve polynomials that converge from above and below to a function.  Unfortunately, most of them cannot be used as is to simulate a function _f_ in the Bernoulli Factory setting, because they don't ensure the consistency requirement described earlier.

The following are approximation schemes with counterexamples to consistency.

**First scheme.** In this scheme (Powell 1981)<sup>[**(3)**](#Note3)</sup>, let _f_ be a twice differentiable function (that is, a C<sup>2</sup> continuous function, or a function with continuous "slope" and "slope-of-slope" functions).  Then for all _n_&ge;1:

- **fabove**(_n_, _k_) = _f_(_k_/_n_) + _M_ / (8*_n_).
- **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; _M_ / (8*_n_).

Where _M_ is an upper bound of the maximum absolute value of _f_'s slope-of-slope function (second derivative), and where _k_ is an integer in the interval [0, _n_].

The counterexample involves the twice differentiable function _g_(_&lambda;_) = sin(_&pi;_\*_&lambda;_)/4 + 1/2.

For _g_, the coefficients for&mdash;

- the degree-2 upper polynomial in Bernstein form (**fabove**(5, _k_)) are [0.6542..., 0.9042..., 0.6542...], and
- the degree-4 upper polynomial in Bernstein form (**fabove**(6, _k_)) are [0.5771..., 0.7538..., 0.8271..., 0.7538..., 0.5771...].

The degree-2 polynomial lies above the degree-4 polynomial everywhere in [0, 1].  However, to ensure consistency, the degree-2 polynomial, once elevated to degree 4 and rewritten in Bernstein form, must have coefficients that are greater than or equal to those of the degree-4 polynomial.

- Once elevated to degree 4, the degree-2 polynomial's coefficients are [0.6542..., 0.7792..., 0.8208..., 0.7792..., 0.6542...].

As we can see, the elevated polynomial's coefficient 0.8208... is less than the corresponding coefficient 0.8271... for the degree-4 polynomial.

_The rest of this section will note counterexamples involving other functions and schemes, without demonstrating them in detail._

**Second scheme.** In this scheme, let _f_ be a Lipschitz continuous function in \[0, 1\] (that is, a continuous function in [0, 1] that has a defined slope at all but a countable number of points, and does not tend to a vertical slope anywhere).  Then for all _n_&ge;2:

- **fabove**(_n_, _k_) = _f_(_k_/_n_) + _L_\*(5/4) / sqrt(_n_).
- **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus;  _L_\*(5/4) / sqrt(_n_).

Where L is the maximum absolute "slope", also known as the Lipschitz constant, and (5/4) is the so-called Popoviciu constant, and where _k_ is an integer in the interval \[0, _n_\] (Lorentz 1986)<sup>[**(4)**](#Note4)</sup>, (Popoviciu 1935)<sup>[**(5)**](#Note5)</sup>.

There are two counterexamples here; together they show that this scheme can fail to ensure consistency, even if the set of functions is restricted to "smooth" functions (not just Lipschitz continuous functions):

1. The function _f_(_&lambda;_) = min(_&lambda;_, 1&minus;_&lambda;_)/2 is Lipschitz continuous with Lipschitz constant 1/2.  (In addition, _f_ has a kink at 1/2, so that it's not differentiable, but this is not essential for the counterexample.)  The counterexample involves the degree-5 and degree-6 upper polynomials (**fabove**(5, _k_) and **fabove**(6, _k_)).
2. The function _f_ = sin(4\*_&pi;_\*_&lambda;_)/4 + 1/2, a "smooth" function with Lipschitz constant _&pi;_.  The counterexample involves the degree-3 and degree-4 lower polynomials (**fbelow**(3, _k_) and **fbelow**(4, _k_)).

It is yet to be seen whether a counterexample exists for this scheme when _n_ is restricted to powers of 2.

**Third scheme.** Same as the second scheme, but replacing (5/4) with the Sikkema constant, _S_ = (4306+837*sqrt(6))/5832 (Lorentz 1986)<sup>[**(4)**](#Note4)</sup>, (Sikkema 1961)<sup>[**(6)**](#Note6)</sup>, which equals about 1.09.   In fact, the same counterexamples for the second scheme apply to this one, since this scheme merely multiplies the offset to bring the approximating polynomials closer to _f_.

**Fourth scheme.**  In this scheme, which relates to a result from Kopotun et al. (2017)<sup>[**(7)**](#Note7)</sup>, let _f_ be a nondecreasing and Lipschitz continuous function in \[0, 1\].  Then for all _n_&ge;2:

- **fabove**(_n_, _k_) = _f_(_k_/_n_) + sqrt(1&minus;(2\*_k_/_n_&minus;1)<sup>2</sup>)\*_L_/_n_.
- **fbelow**(_n_, _k_) = _f_(_k_/_n_) &minus; sqrt(1&minus;(2\*_k_/_n_&minus;1)<sup>2</sup>)\*_L_/_n_.

Where _L_ is the Lipschitz constant for _f_.

This counterexample has _f_ be a degree-12 polynomial in Bernstein form with coefficients [0, 61/625, 1273/10000, 697/5000, 1573/10000, 2411/5000, 271/500, 5903/10000, 374/625, 6013/10000, 6017/10000, 1107/1250, 8983/10000]. This polynomial is nondecreasing and Lipschitz continuous with Lipschitz constant (_L_) slightly less than 1.37277.  And the counterexample involves the upper polynomials of degree 16 and 32 generated by **fabove**(16, _k_) and **fabove**(32, _k_), respectively.

**Note on "clamping".** For any approximation scheme, "clamping" the values of **fbelow** and **fabove** to fit the interval [0, 1] won't necessarily preserve the consistency requirement, even if the original scheme met that requirement.

Here is a counterexample that applies to any approximation scheme.

Let _g_ and _h_ be two polynomials in Bernstein form as follows:

- _g_ has degree 5 and coefficients [10179/10000, 2653/2500, 9387/10000, 5049/5000, 499/500, 9339/10000].
- _h_ has degree 6 and coefficients [10083/10000, 593/625, 9633/10000, 4513/5000, 4947/5000, 9473/10000, 4519/5000].

After elevating _g_'s degree, _g_'s coefficients are no less than _h_'s, as required by the consistency property.

However, if we clamp coefficients above 1 to equal 1, so that _g_ is now _g&prime;_ with [1, 1, 9387/10000, 1, 499/500, 9339/10000] and _h_ is now _h&prime;_ with [1, 593/625, 9633/10000, 4513/5000, 4947/5000, 9473/10000, 4519/5000], and elevate _g&prime;_ for coefficients [1, 1, 14387/15000, 19387/20000, 1499/1500, 59239/60000, 9339/10000], some of the coefficients of _g&prime;_ are less than those of _h&prime;_.  Thus, for this pair of polynomials, clamping the coefficients will destroy the consistent approximation property.

<a id=Achievable_Simulation_Rates></a>
## Achievable Simulation Rates

In general, the number of coin flips needed by any Bernoulli factory algorithm for _f_(_&lambda;_) depends on how "smooth" the function _f_ is.

The following table summarizes the rate of simulation (in terms of the number of input coin flips needed) that can be achieved depending on _f_(_&lambda;_), assuming the unknown probability of heads, _&lambda;_, lies in the interval [_&epsilon;_, 1&minus;_&epsilon;_] for some _&epsilon;_ &gt; 0.  In the table below, _&Delta;_(_n_, _r_, _x_) = _O_(max(sqrt(_x_\*(1&minus;_x_)/_n_),1/_n_)<sup>_r_</sup>), that is, _O_((1/_n_)<sup>2\*_r_</sup>) near _x_ = 0 or 1, and _O_((1/_n_)<sup>_r_</sup>) elsewhere.

|   Property of simulation   |   Property of _f_
  ------------- |  ------------------------
| Requires more than _n_ input coin flips with probability _&Delta;_(_n_, _r_&minus;1, _&lambda;_), for integer _r_ &ge; 0. | Only if _f_ has _r_ continuous derivatives ("slope" functions) and the _r_<sup>th</sup> derivative is in the Zygmund class (has no vertical slope) (Holtz et al. 2011)<sup>[**(10)**](#Note10)</sup>. |
| Requires more than _n_ flips with probability _&Delta;_(_n_, _&alpha;_, _&lambda;_), for non-integer _&alpha;_ &gt; 0. | If and only if _f_ has _r_ continuous derivatives and the _r_<sup>th</sup> derivative is (_&alpha;_ &minus; _r_)-Hölder continuous (Holtz et al. 2011)<sup>[**(11)**](#Note11)</sup>. |
| Requires a finite number of flips on average. | Only if _f_ is Lipschitz continuous (Nacu and Peres 2005)<sup>[**(1)**](#Note1)</sup>. |
| Number of flips required, raised to power of _k_, is finite on average and drops off uniformly.  | Only if _f_ has _k_ continuous derivatives (is C<sup>_k_</sup> continuous) (Nacu and Peres 2005)<sup>[**(1)**](#Note1)</sup>. |
| "Fast simulation" (number of flips required drops off exponentially).  | If and only if _f_ is real analytic ("smooth", or has _k_<sup>th</sup> derivative for every _k_, and agrees with its Taylor series "near" every point) (Nacu and Peres 2005)<sup>[**(1)**](#Note1)</sup>. |
| Number of flips bounded from below by (_f&prime;_(_&lambda;))<sup>2</sup>\*_&lambda;_\*(1&minus;_&lambda;_)/(_f_(_&lambda;_)\*(1&minus;_f_(_&lambda;_))), where _f&prime;_ is the first derivative of _f_.  | Whenever _f_ admits a fast simulation (Mendo 2019)<sup>[**(12)**](#Note12)</sup>. |

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Nacu, Şerban, and Yuval Peres. "[**Fast simulation of new coins from old**](https://projecteuclid.org/euclid.aoap/1106922322)", The Annals of Applied Probability 15, no. 1A (2005): 93-115.</small>
- <small><sup id=Note2>(2)</sup> Specifically, the constant _m_ is an upper bound of abs(_f_(_x_)&minus;_f_(_y_))/(abs(_x_&minus;_y_)<sup>_&alpha;_</sup>) for all _x_, _y_ pairs, where _x_ and _y_ are each in \[0, 1\] and _x_ != _y_.  However, this bound can't directly be calculated as it would involve checking an infinite number of _x_, _y_ pairs.</small>
- <small><sup id=Note3>(3)</sup> Powell, M.J.D., _Approximation Theory and Methods_, 1981</small>
- <small><sup id=Note4>(4)</sup> G. G. Lorentz. Bernstein polynomials. 1986.</small>
- <small><sup id=Note5>(5)</sup> Popoviciu, T., "Sur l'approximation des fonctions convexes d'ordre supérieur", Mathematica (Cluj), 1935.</small>
- <small><sup id=Note6>(6)</sup> Sikkema, P.C., "Der Wert einiger Konstanten in der Theorie der Approximation mit Bernstein-Polynomen", Numer. Math. 3 (1961).</small>
- <small><sup id=Note7>(7)</sup> Kopotun, K.A., et al., "[**Interpolatory pointwise estimates for monotone polynomial approximation**](https://arxiv.org/abs/1711.07083)", arXiv:1711.07083 [math.CA], 2017.</small>
- <small><sup id=Note8>(8)</sup> Levy, H., _Stochastic dominance_, 1998.</small>
- <small><sup id=Note9>(9)</sup> Henry (https://math.stackexchange.com/users/6460/henry), Proving stochastic dominance for hypergeometric random variables, URL (version: 2021-02-20): [**https://math.stackexchange.com/q/4033573**](https://math.stackexchange.com/q/4033573) .</small>
- <small><sup id=Note10>(10)</sup> Holtz, O., Nazarov, F., Peres, Y., "New Coins from Old, Smoothly", _Constructive Approximation_ 33 (2011).</small>
- <small><sup id=Note11>(11)</sup> Holtz, O., Nazarov, F., Peres, Y., "New Coins from Old, Smoothly", _Constructive Approximation_ 33 (2011).</small>
- <small><sup id=Note12>(12)</sup> Mendo, Luis. "An asymptotically optimal Bernoulli factory for certain functions that can be expressed as power series." Stochastic Processes and their Applications 129, no. 11 (2019): 4366-4384.</small>

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Proofs_for_H_lder_Function_Approximation_Scheme></a>
### Proofs for Hölder Function Approximation Scheme

This section shows mathematical proofs for some of the approximation schemes of this page.

There is a straightforward extension to lemma 6(i) of Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup> to certain functions with a slope that tends to a vertical slope.  Specifically, it applies to any _Hölder continuous_ function, which means a continuous function whose slope doesn't go exponentially fast to a vertical slope.

**Lemma 1.** _Let f(&lambda;) be a continuous and nondecreasing function, and let X<sub>k</sub> be a hypergeometric(2\*n, k, n) random variable, where n&ge;1 is a constant integer.  Then **E**[f(X<sub>k</sub>/n)] is nondecreasing as k increases._

_Proof._ This is equivalent to verifying whether _X_<sub>_m_+1</sub>/_n_ &succeq; _X_<sub>_m_</sub>/_n_ (and, obviously by extension, _X_<sub>_m_+1</sub> &succeq; _X_<sub>_m_</sub>) in terms of first-degree stochastic dominance (Levy 1998)<sup>[**(8)**](#Note8)</sup>.   This means that the probability that _X_<sub>_m_+1</sub> &le; _j_) is less than or equal to that for _X_<sub>_m_</sub> for each _j_ in the interval [0, _n_].  A proof of this was given by the user "Henry" of the _Mathematics Stack Exchange_ community<sup>[**(9)**](#Note9)</sup>. &#x25a1;

**Lemma 2.** _Let f(&lambda;) be a continuous function that maps [0, 1] to [&minus;1, 1], and let X be a hypergeometric(2\*n, k, n) random variable._

1. _If f is &alpha;-Hölder continuous with Hölder constant M, then&mdash;_

    abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2\*_n_))),&nbsp;&nbsp;&nbsp;(1)

    _is bounded from above by M\*(1/(2\*n))<sup>&alpha;/2</sup>, for all n&ge;1 that are integer powers of 2._
2. _If f is &alpha;-Hölder continuous with Hölder constant M, then the expression (1) is bounded from above by M\*(1/(7\*n))<sup>&alpha;/2</sup>, for all n&ge;4 that are integer powers of 2._
3. _If f is C<sup>2</sup> continuous, and its second derivative's absolute value is bounded from above by M, then the expression (1) is bounded from above by (M/2)\*(1/(7\*n)), for all n&ge;4 that are integer powers of 2._
4. _If f is convex, nondecreasing, and bounded from below by 0, then the expression (1) is bounded from above by E[f(Y/n)] for all n&ge;1 that are integer powers of 2, where Y is a hypergeometric(2*n, n, n) random variable._

_Proof._

1. abs(**E**[_f_(_X_/_n_)] &minus; _f_(k/(2\*_n_))) &le; **E**[abs(_f_(_X_/_n_) &minus; _f_(_k_/(2\*_n_))] &le; _M_\***E**[abs(_X_/_n_ &minus; _k_/(2\*_n_))]<sup>_&alpha;_</sup> (by the definition of Hölder continuous functions) &le; _M_\*(**E**[abs(_X_/_n_ &minus; _k_/(2\*_n_))]<sup>2</sup>)<sup>_&alpha;_/2</sup> = _M_\***Var**[_X_/_n_]<sup>_&alpha;_/2</sup> &le; _M_\*(1/(2\*_n_))<sup>_&alpha;_/2</sup>.
2. For all integers _n_&ge;4, abs(**E**[_f_(_X_/_n_)] &minus; _f_(k/(2\*_n_))) &le; _M_\***Var**[_X_/_n_]<sup>_&alpha;_/2</sup> = _M_\*(_k_\*(2\*_n_&minus;_k_)/(4\*(2\*_n_&minus;1)\*_n_<sup>2</sup>))<sup>_&alpha;_/2</sup> &le; _M_\*(_n_<sup>2</sup>/(4\*(2\*_n_&minus;1)\*_n_<sup>2</sup>))<sup>_&alpha;_/2</sup> = _M_\*(1/(8\*_n_&minus;4))<sup>_&alpha;_/2</sup> &le;  _M_\*(1/(7\*_n_))<sup>_&alpha;_/2</sup>.
3. For all integers _n_&ge;4, abs(**E**[_f_(_X_/_n_)] &minus; _f_(k/(2\*_n_))) &le; (_M_/2)\***Var**[_X_/_n_]<sup>_&alpha;_/2</sup> = (_M_/2)\*(_k_\*(2\*_n_&minus;_k_)/(4\*(2\*_n_&minus;1)\*_n_<sup>2</sup>)) &le; (_M_/2)\*(_n_<sup>2</sup>/(4\*(2\*_n_&minus;1)\*_n_<sup>2</sup>)) = (_M_/2)\*(1/(8\*_n_&minus;4)) &le;  (_M_/2)\*(1/(7\*_n_)).
4. Let _X_<sub>_k_</sub> be a hypergeometric(2\*_n_, _k_, _n_) random variable.  By Lemma 1 and the assumption that _f_ is nondecreasing, **E**[_f_(_X_<sub>_k_</sub>/_n_)] is nondecreasing as _k_ increases, so take **E**[_f_(_X_<sub>_n_</sub>/_n_)] = **E**[_f_(_Y_</sub>/_n_)] as the upper bound.  Then, abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2\*_n_))) = abs(**E**[_f_(_X_/_n_)] &minus; _f_(**E**[_X_/_n_])) = **E**[_f_(_X_/_n_)] &minus; _f_(**E**\[_X_/_n_\]) (by Jensen's inequality, because _f_ is convex and bounded by 0) = **E**\[_f_(_X_/_n_)] &minus; _f_(_k_/(2\*_n_)) &le; **E**\[_f_(_X_/_n_)\] (because _f_ is bounded by 0) &le; **E**[_f_(_Y_/_n_)]. &#x25a1;

> **Notes:**
>
> 1. **E**[.] means expected or average value, and **Var**[.] means variance.  A hypergeometric(2\*_n_, _k_, _n_) random variable is the number of "good" balls out of _n_ balls taken uniformly at random, all at once, from a bag containing 2\*_n_ balls, _k_ of which are "good".
> 2. _f_ is _&alpha;_-Hölder continuous if its vertical slopes, if any, are no "steeper" than _M_\*_&lambda;_<sup>_&alpha;_</sup>, where _&alpha;_ is in the interval (0, 1] and _M_ is greater than 0.  An _&alpha;_-Hölder continuous function in [0, 1] is also _&beta;_-Hölder continuous for any _&beta;_ less than _&alpha;_.
> 3. Parts 2 and 3 exploit a tighter bound on **Var**[_X_/_n_] than the bound given in Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup>.  However, for technical reasons, these bounds are proved only for all integers n&ge;4.

**Theorem 1.** _Let f(&lambda;), &alpha;, and M be as described in part 1 of Lemma 2, except f maps [0, 1] to the interval [&epsilon;, 1&minus;&epsilon;] for &epsilon; in (0, 1/2). By forming two sequences of polynomials in Bernstein form with coefficients **fabove**(n, k) for the upper polynomials, and **fbelow**(n, k) for the lower polynomials, the result is an approximation scheme that meets conditions (i), (iii), and (iv) of Proposition 3 of Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup>, for all n&ge;1 that are integer powers of 2, and thus can be used to simulate f via the algorithms for general factory functions described at the top of this page:_

- _**fbelow**(n, k) = f(k/n) &minus; &delta;(n)._
- _**fabove**(n, k) = f(k/n) + &delta;(n)._

_Where &delta;(n) = M/((2<sup>&alpha;/2</sup>&minus;1)\*n<sup>&alpha;/2</sup>)._

_Proof._ Follows from part 1 of Lemma 2 above as well as Remark B and the proof of Proposition 10 of Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup>.  The term _&delta;_(_n_) is found as a solution to the functional equation _&delta;_(_n_) = _&delta;_(2\*_n_) + _M_\*(1/(2\*_n_))<sup>_&alpha;_/2</sup>, and functional equations of this kind were suggested in the proof of Proposition 10, to find the offset by which to shift the approximating polynomials. &#x25a1;

> **Note:** For specific values of _&alpha;_, the functional equation given in the proof can be solved via linear recurrences; an example for _&alpha;_ = 1/2 is the following SymPy code: `rsolve(Eq(f(n),f(n+1)+z*(1/(2*2**n))**((S(1)/2)/2)),f(n)).subs(n,log(n,2)).simplify()`.  Trying different values of _&alpha;_ suggested the following formula for Hölder continuous functions with _&alpha;_ of 1/_j_ or greater: (_M_\* &sum;<sub>_i_ = 0,...,(_j_\*2)&minus;1</sub> 2<sup>_i_/(2\*_j_)</sup>)/_n_<sup>1/(2\*_j_)</sup> = _M_ / ((2<sup>1/(2\*_j_)</sup>&minus;1)\*_n_<sup>1/(2\*_j_)</sup>); and generalizing the latter expression led to the term in the theorem.

**Theorem 2.** _Let f(&lambda;) and M be as described in part 2 of Lemma 2, except f maps [0, 1] to the interval [&epsilon;, 1&minus;&epsilon;] for &epsilon; in (0, 1/2).  Then the following approximation scheme determined by **fabove** and **fbelow** meets conditions (i), (iii), and (iv) of Proposition 3 of Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup>, for all n&ge;1 that are integer powers of 2:_

- _**fbelow**(n, k) = min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if n < 4; otherwise, f(k/n) &minus; &eta;(n)._
- _**fabove**(n, k) = max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if n < 4; otherwise, f(k/n) + &eta;(n)._

_Where &eta;(n) = M\*(2/7)<sup>&alpha;/2</sup>/((2<sup>&alpha;/2</sup>&minus;1)\*n<sup>&alpha;/2</sup>)._

_Proof._  Follows from part 2 of Lemma 2 above as well as Remark B and the proof of Proposition 10 of Nacu and Peres, including the observation in Remark B of the paper that we can start the algorithm from _n_ = 4; in that case, the upper and lower polynomials of degree 1 through 3 above would be constant functions, so that as polynomials in Bernstein form, the coefficients of each one would be equal.  The term _&eta;_(_n_) is found as a solution to the functional equation _&eta;_(_n_) = _&eta;_(2\*_n_) + _M_\*(1/(7\*_n_))<sup>_&alpha;_/2</sup>, and functional equations of this kind were suggested in the proof of Proposition 10, to find the offset by which to shift the approximating polynomials.  &#x25a1;

> **Note:** The term _&eta;_(_n_) was found in a similar way as the term _&delta;_(_n_) in Theorem 1.

**Theorem 3.** _Let f(&lambda;) and M be as described in part 3 of Lemma 2, except f maps [0, 1] to the interval [&epsilon;, 1&minus;&epsilon;] for &epsilon; in (0, 1/2).  Then the following approximation scheme determined by **fabove** and **fbelow** meets conditions (i), (iii), and (iv) of Proposition 3 of Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup>, for all n&ge;1 that are integer powers of 2:_

- _**fbelow**(n, k) = min(**fbelow**(4,0), **fbelow**(4,1), ..., **fbelow**(4,4)) if n < 4; otherwise, f(k/n) &minus; M/(7\*n)._
- _**fabove**(n, k) = max(**fabove**(4,0), **fabove**(4,1), ..., **fabove**(4,4)) if n < 4; otherwise, f(k/n) + M/(7\*n)._

_Proof._  Follows from part 3 of Lemma 2 above as well as Remark B and the proof of Proposition 10 of Nacu and Peres, noting that the solution to the functional equation _&kappa;_(n) = _&kappa;_(2\*_n_) + (_M_/2)\*(1/(7\*_n_)) is _M_/(7\*_n_).  Notably, this exploits the observation in Remark B of the paper that we can start the algorithm from _n_ = 4; in that case, the upper and lower polynomials of degree 1 through 3 above would be constant functions, so that as polynomials in Bernstein form, the coefficients of each one would be equal.  &#x25a1;

**Proposition 1.**

1. _Let f be as given in Theorem 1, 2, or 3, except f is concave and may have a minimum of 0.  The approximation scheme of that theorem remains valid if **fbelow**(n, k) = f(k/n), rather than as given in that theorem._
2. _Let f be as given in Theorem 1, 2, or 3, except f is convex and may have a maximum of 1.  The approximation scheme of that theorem remains valid if **fabove**(n, k) = f(k/n), rather than as given in that theorem._
3. _Theorems 1, 2, and 3 can be extended to all integers n&ge;1, not just those that are powers of 2, by defining&mdash;_

    - _**fbelow**(n, k) = (k/n)\***fbelow**(n&minus;1, max(0, k&minus;1)) + ((n&minus;k)/n)\***fbelow**(n&minus;1, min(n&minus;1, k)), and_
    - _**fabove**(n, k) = (k/n)\***fabove**(n&minus;1, max(0, k&minus;1)) + ((n&minus;k)/n)\***fabove**(n&minus;1, min(n&minus;1, k)),_

    _for all n&ge;1 other than powers of 2. Parts 1 and 2 of this proposition still apply to the modified scheme._

_Proof._ Parts 1 and 2 follow from Theorem 1, 2, or 3, as the case may be, and Jensen's inequality.  Part 3 also follows from Remark B of Nacu and Peres (2005)<sup>[**(1)**](#Note1)</sup>. &#x25a1;

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
