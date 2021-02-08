# Supplemental Notes for Bernoulli Factory Algorithms

<a id=General_Factory_Functions></a>
## General Factory Functions

The algorithms for [**general factory functions**](https://peteroupc.github.io/bernoulli.html) work with two sequences of polynomials: one approaches the function _f_(_&lambda;_) from above, the other from below, where _f_ is a continuous function that maps the interval (0, 1) to (0, 1).  (These two sequences form a so-called _approximation scheme_ for _f_.) One requirement for these algorithms to work correctly is called the _consistency requirement_:

- For each sequence, the difference between one polynomial and the previous one must have non-negative Bernstein coefficients (once the latter polynomial is elevated to the same degree as the other).

The consistency requirement ensures that the polynomials approach the target function without crossing each other.  Unfortunately, the reverse is not true in general; even if the upper polynomials "decrease" and the lower polynomials "increase" to _f_, this does not mean that the scheme will ensure consistency.

<a id=Schemes_That_Don_t_Work></a>
### Schemes That Don't Work

In the academic literature (papers and books), there are many approximation schemes that involve polynomials that converge from above and below to a function.  Unfortunately, most of them cannot be used as is to simulate a function _f_ in the Bernoulli Factory setting, because they don't ensure the consistency requirement described earlier.

The following are approximation schemes with counterexamples to consistency.

In this section, **fbelow** and **fabove** mean the _k_<sup>th</sup> Bernstein coefficient for the lower or upper degree-_n_ polynomial, respectively, where _k_ is an integer in the interval \[0, _n_\].

**First scheme.** In this scheme (Powell 1981)<sup>[**(1)**](#Note1)</sup>, let _f_ be a twice differentiable function (that is, a C<sup>2</sup> continuous function, or a function with continuous "slope" and "slope-of-slope" functions).  Then the upper polynomial of degree _n_ has Bernstein coefficients as follows, for all _n_&ge;1:

-  **fabove**(_n_, _k_) = _f_(_k_/_n_) + _M_ / (8*_n_),

where _M_ is an upper bound of the maximum absolute value of _f_'s slope-of-slope function (second derivative), and where _k_ is an integer in the interval [0, _n_].

And the lower polynomial of degree _n_ has Bernstein coefficients as follows:

- **fbelow**(n, k) = f(k/n) + M / (8*n).

The counterexample involves the twice differentiable function _g_(_&lambda;_) = sin(_&pi;_\*_&lambda;_)/4 + 1/2.

For _g_, the Bernstein coefficients for&mdash;

- the degree-2 upper polynomial (b(5, k)) are [0.6542..., 0.9042..., 0.6542...], and
- the degree-4 upper polynomial (b(6, k)) are [0.5771..., 0.7538..., 0.8271..., 0.7538..., 0.5771...].

The degree-2 polynomial lies above the degree-4 polynomial everywhere in [0, 1].  However, to ensure consistency, the degree-2 polynomial, once elevated to degree 4, must have Bernstein coefficients that are greater than or equal to those of the degree-4 polynomial.

- Once elevated to degree 4, the degree-2 polynomial's coefficients are [0.6542..., 0.7792..., 0.8208..., 0.7792..., 0.6542...].

As we can see, the elevated polynomial's coefficient 0.8208... is less than the corresponding coefficient 0.8271... for the degree-4 polynomial.

**Second scheme.** In this scheme, let _f_ be a Lipschitz continuous function in \[0, 1\] (that is, a continuous function whose slope does not tend to a vertical slope anywhere in [0, 1]).  Then the upper polynomial of degree _n_ has Bernstein coefficients as follows, for all n&ge;2:

- **fabove**(n, k) = f(k/n) + (5/4) / sqrt(n),

where L is the maximum absolute "slope", also known as the Lipschitz constant, and (5/4) is the so-called Popoviciu constant, and where _k_ is an integer in the interval \[0, _n_\] (Lorentz 1986)<sup>[**(2)**](#Note2)</sup>, (Popoviciu 1935)<sup>[**(3)**](#Note3)</sup>.

And the lower polynomial of degree _n_ has Bernstein coefficients as follows, for all n&ge;1:

- **fbelow**(n, k) = f(k/n) + (5/4) / sqrt(n).

The following counterexamples show that this scheme can fail to ensure consistency, even if the set of functions is restricted to "smooth" functions (not just Lipschitz continuous functions).

For the first counterexample, the function _g_(_&lambda;_) = min(_&lambda;_, 1&minus;_&lambda;_)/2 is Lipschitz continuous with Lipschitz constant 1.  (In addition, _g_ has a kink at 1/2, so that it's not differentiable, but this is not essential for the counterexample.)

For _g_, the Bernstein coefficients for&mdash;

- the degree-5 upper polynomial (b(5, k)) are [0.4874..., 0.5874..., 0.6874..., 0.6874..., 0.5874..., 0.4874...], and
- the degree-6 upper polynomial (b(6, k)) are [0.4449..., 0.5283..., 0.6116..., 0.6949..., 0.6116..., 0.5283..., 0.4449...].

The degree-5 polynomial lies above the degree-6 polynomial everywhere in [0, 1].  However, to ensure consistency, the degree-5 polynomial, once elevated to degree 6, must have Bernstein coefficients that are greater than or equal to those of the degree-6 polynomial.

- Once elevated to degree 6, the degree-5 polynomial's coefficients are [0.4874..., 0.5707..., 0.6541..., 0.6874..., 0.6541..., 0.5707..., 0.4874...].

As we can see, the elevated polynomial's coefficient 0.6874... is less than the corresponding coefficient 0.6949... for the degree-6 polynomial.

There is a similar counterexample that can be built:

- When _g_ = sin(4\*_&pi;_\*_&lambda;_)/4 + 1/2, a "smooth" function with Lipschitz constant _&pi;_, the counterexample is present between the degree-3 and degree-4 lower polynomials.

Thus, we have shown that this approximation scheme is not guaranteed to meet the consistency requirement for all Lipschitz continuous functions.

It is yet to be seen whether a counterexample exists for this scheme when _n_ is restricted to powers of 2.

**Third scheme.** Same as the second scheme, but replacing (5/4) with the Sikkema constant, _S_ = (4306+837*sqrt(6))/5832 (Lorentz 1986)<sup>[**(2)**](#Note2)</sup>, (Sikkema 1961)<sup>[**(4)**](#Note4)</sup>.   In fact, the same counterexamples for the second scheme apply to this one, since this scheme merely multiplies the offset to bring the approximating polynomials closer to _f_.

For example, the first counterexample for this scheme is almost the same as the first one for the second scheme, except the coefficients for&mdash;

- the degree-5 upper polynomial are [0.5590..., 0.6590..., 0.7590..., 0.7590..., 0.6590..., 0.5590...], and
- the degree-6 upper polynomial are [0.5103..., 0.5936..., 0.6770..., 0.7603..., 0.6770..., 0.5936..., 0.5103...].

And once elevated to degree 6, the degree-5 polynomial's coefficients are [0.5590..., 0.6423..., 0.7257..., 0.7590..., 0.7257..., 0.6423..., 0.5590...].

As we can see, the elevated polynomial's coefficient 0.7590... is less than the corresponding coefficient 0.7603... for the degree-6 polynomial.

<a id=Other_Schemes></a>
### Other Schemes

I have found how to extend the results of Nacu and Peres (2005)<sup>[**(5)**](#Note5)</sup> to certain functions with a slope that tends to a vertical slope.  Moreover, the polynomials satisfy the consistency requirement unlike with the schemes from the previous section.

For example, take a factory function _f_(_&lambda;_), the function to simulate using flips of a coin with unknown probability of heads of _&lambda;_.  The following scheme to build upper and lower polynomials can be used if _f_(_&lambda;_)&mdash;

- is _&alpha;_-_Hölder continuous_, meaning its vertical slopes, if any, are no "steeper" than _m_\*_&lambda;_<sup>1/2</sup>, for some number _m_ greater than 0 (the Hölder constant) and for some _&alpha;_ in the interval (0, 1], and
- in the interval \[0, 1\]&mdash;
      - has a minimum of greater than 0 and a maximum of less than 1, or
      - is _convex_ (the rate of growth of its "slope" never decreases) and has a minimum of greater than 0, or
      - is _concave_ (the rate of growth of its "slope" never increases) and has a maximum of less than 1.

If _f_ has no slope that tends to a vertical slope anywhere in \[0, 1\], then _f_ is Lipschitz continuous so that _&alpha;_ is 1 and _m_ is the function's highest absolute "slope".  Otherwise, finding _m_ for a given _&alpha;_ is non-trivial and it requires knowing where _f_'s vertical slopes are, among other things.<sup>[**(6)**](#Note6)</sup>  But assuming _m_ and _&alpha;_ are known, then for all _n_ that are powers of 2:

- _&delta;_(_n_) = _m_\*(2/7)<sup>_&alpha;_</sup>/((2<sup>_&alpha;_</sup>&minus;1)\*_n_<sup>_&alpha;_</sup>).
- **fbelow**(_n_, _k_) = min(**fbelow**(4,0), **fbelow**(4,1), **fbelow**(4,2), **fbelow**(4,3)) if _n_ < 4; otherwise, _f_(_k_/_n_) &minus; _&delta;_(_n_) (or _f_(_k_/_n_) if _f_ is concave).
- **fabove**(_n_, _k_) = max(**fabove**(4,0), **fabove**(4,1), **fabove**(4,2), **fabove**(4,3)) if _n_ < 4; otherwise, _f_(_k_/_n_) + _&delta;_(_n_) (or _f_(_k_/_n_) if _f_ is concave).

Proofs are in the appendix.

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Powell, M.J.D., _Approximation Theory and Methods_, 1981</small>
- <small><sup id=Note2>(2)</sup> G. G. Lorentz. Bernstein polynomials. 1986.</small>
- <small><sup id=Note3>(3)</sup> Popoviciu, T., "Sur l'approximation des fonctions convexes d'ordre supérieur", Mathematica (Cluj), 1935.</small>
- <small><sup id=Note4>(4)</sup> Sikkema, P.C., "Der Wert einiger Konstanten in der Theorie der Approximation mit Bernstein-Polynomen", Numer. Math. 3 (1961).</small>
- <small><sup id=Note5>(5)</sup> Nacu, Şerban, and Yuval Peres. "[**Fast simulation of new coins from old**](https://projecteuclid.org/euclid.aoap/1106922322)", The Annals of Applied Probability 15, no. 1A (2005): 93-115.</small>
- <small><sup id=Note6>(6)</sup> Specifically, the constant _m_ is an upper bound of abs(_f_(_x_)&minus;_f_(_y_))/(abs(_x_&minus;_y_)<sup>_&alpha;_</sup>) for all _x_, _y_ pairs, where _x_ and _y_ are each in \[0, 1\] and _x_ != _y_.  However, this bound can't directly be calculated as it would involve checking an infinite number of _x_, _y_ pairs.</small>

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Proofs_for_H_lder_Function_Approximation_Scheme></a>
### Proofs for Hölder Function Approximation Scheme

There is a straightforward extension to lemma 6(i) of Nacu and Peres (2005)<sup>[**(5)**](#Note5)</sup> to certain functions with a slope that tends to a vertical slope.  Specifically, it applies to any _Hölder continuous_ function, which means a continuous function whose slope doesn't go exponentially fast to a vertical slope.

The parameters _&alpha;_ and _M_, in parts 1 and 2 of the lemma below, mean that the function is no "steeper" than _M_\*_&lambda;_<sup>_&alpha;_</sup>; _&alpha;_ is in the interval (0, 1] and _M_ is greater than 0.

**Lemma 1.** _Let f(&lambda;) be a continuous function that maps [0, 1] to [&minus;1, 1], and let X be a hypergeometric(2\*n, k, n) random variable._

1. _If f is &alpha;-Hölder continuous with Hölder constant M, then&mdash;_

    abs(**E**[_f_(_X_/_n_)] &minus; _f_(_k_/(2\*_n_))),&nbsp;&nbsp;&nbsp;(1)

    _is bounded from above by M\*(1/(2\*n))<sup>&alpha;/2</sup>, for all integers n&ge;1._
2. _If f is &alpha;-Hölder continuous with Hölder constant M, then the expression (1) is bounded from above by M\*(1/(7\*n))<sup>&alpha;/2</sup>, for all integers n&ge;4._
3. _If f is twice differentiable, and its second derivative's absolute value is bounded from above by M, then the expression (1) is bounded from above by (M/2)\*(1/(7\*n)), for all integers n&ge;4._

_Proof._

1. abs(**E**[_f_(_X_/_n_)] &minus; _f_(k/(2\*_n_))) &le; **E**[abs(_f_(_X_/_n_) &minus; _f_(_k_/(2\*_n_))] &le; _M_\***E**[abs(_X_/_n_ &minus; _k_/(2\*_n_))]<sup>_&alpha;_</sup> (by the definition of Hölder continuous functions) &le; _M_\*(**E**[abs(_X_/_n_ &minus; _k_/(2\*_n_))]<sup>2</sup>)<sup>_&alpha;_/2</sup> = _M_\***Var**[_X_/_n_]<sup>_&alpha;_/2</sup> &le; _M_\*(1/(2\*_n_))<sup>_&alpha;_/2</sup>.
2. For all integers _n_&ge;4, abs(**E**[_f_(_X_/_n_)] &minus; _f_(k/(2\*_n_))) &le; _M_\***Var**[_X_/_n_]<sup>_&alpha;_/2</sup> = _M_\*(_k_\*(2\*_n_&minus;_k_)/(4\*(2\*_n_&minus;1)\*_n_<sup>2</sup>))<sup>_&alpha;_/2</sup> &le; _M_\*(_n_<sup>2</sup>/(4\*(2\*_n_&minus;1)\*_n_<sup>2</sup>))<sup>_&alpha;_/2</sup> = _M_\*(1/(8\*_n_&minus;4))<sup>_&alpha;_/2</sup> &le;  _M_\*(1/(7\*_n_))<sup>_&alpha;_/2</sup>.
3. For all integers _n_&ge;4, abs(**E**[_f_(_X_/_n_)] &minus; _f_(k/(2\*_n_))) &le; (_M_/2)\***Var**[_X_/_n_]<sup>_&alpha;_/2</sup> = (_M_/2)\*(_k_\*(2\*_n_&minus;_k_)/(4\*(2\*_n_&minus;1)\*_n_<sup>2</sup>)) &le; (_M_/2)\*(_n_<sup>2</sup>/(4\*(2\*_n_&minus;1)\*_n_<sup>2</sup>)) = (_M_/2)\*(1/(8\*_n_&minus;4)) &le;  (_M_/2)\*(1/(7\*_n_)). &#x25a1;

> **Notes:**
>
> 1. **E**[.] means expected or average value, and **Var**[.] means variance.
> 2. A _Lipschitz-continuous_ function has no slope that tends to a vertical slope, making it a 1-Hölder continuous function with _M_ equal to its Lipschitz constant.
> 3. An _&alpha;_-Hölder continuous function in [0, 1] is also _&beta;_-Hölder continuous for any _&beta;_ less than _&alpha;_.
> 4. Parts 2 and 3 exploit a tighter bound on **Var**[_X_/_n_] than the bound given in Nacu and Peres (2005)<sup>[**(5)**](#Note5)</sup>.  However, for technical reasons, these bounds are proved only for all integers n&ge;4.

**Theorem 1.** _Let f(&lambda;), &alpha;, and M be as described in part 1 of Lemma 1, except f maps [0, 1] to (0, 1). The following Bernstein coefficients (**fabove**(n, k) for the upper polynomials, and **fbelow**(n, k) for the lower polynomials) form an approximation scheme that meets conditions (i), (iii), and (iv) of Proposition 3 of Nacu and Peres (2005)<sup>[**(5)**](#Note5)</sup>, for all n&ge;1, and thus can be used to simulate f via the algorithms for general factory functions described at the top of this page:_

- _**fbelow**(n, k) = f(k/n) &minus; &delta;(n) (kth Bernstein coefficient of lower nth degree polynomial)._
- _**fabove**(n, k) = f(k/n) + M/((2<sup>&alpha;/2</sup>&minus;1)\*n<sup>&alpha;/2</sup> &delta;(n) (kth Bernstein coefficient of upper nth degree polynomial)._

_Where &delta;(n) = M/((2<sup>&alpha;/2</sup>&minus;1)\*n<sup>&alpha;/2</sup>)._

_Proof._ Follows from part 1 of Lemma 1 above as well as the proof of Proposition 10 of Nacu and Peres (2005)<sup>[**(5)**](#Note5)</sup>.  The term _&delta;_(_n_) is found as a solution to the functional equation _&delta;_(_n_) = _&delta;_(2\*_n_) + _M_\*(1/(2\*_n_))<sup>_&alpha;_/2</sup>, and functional equations of this kind were suggested in the proof of Proposition 10, to find the offset by which to shift the approximating polynomials. &#x25a1;

> **Note:** For specific values of _&alpha;_, the functional equation given in the proof can be solved via linear recurrences; an example for _&alpha;_ = 1/2 is the following SymPy code: `rsolve(Eq(f(n),f(n+1)+z*(1/(2*2**n))**((S(1)/2)/2)),f(n)).subs(n,log(n,2)).simplify()`.  Trying different values of _&alpha;_ suggested the following formula for Hölder continuous functions with _&alpha;_ of 1/_j_ or greater: (_M_\* &sum;<sub>_i_ = 0,...,(_j_\*2)&minus;1</sub> 2<sup>_i_/(2\*_j_)</sup>)/_n_<sup>1/(2\*_j_)</sup> = _M_ / ((2<sup>1/(2\*_j_)</sup>&minus;1)\*_n_<sup>1/(2\*_j_)</sup>); and generalizing the latter expression led to the term in the theorem.

**Theorem 2.** _Let f(&lambda;) and M be as described in part 2 of Lemma 1, except f maps [0, 1] to (0, 1).  The following Bernstein coefficients form an approximation scheme that meets conditions (i), (iii), and (iv) of Proposition 3 of Nacu and Peres (2005)<sup>[**(5)**](#Note5)</sup>, for all n&ge;1:_

_If n is 4 or greater:_

- _**fbelow**(n, k) = f(k/n) &minus; &eta;(n)._
- _**fabove**(n, k) = f(k/n) + &eta;(n)._

_Otherwise:_

- _**fbelow**(n, k) = Lower bound of **fbelow**(4, k) for all k in [0, 4]._
- _**fabove**(n, k) = Upper bound of **fabove**(4, k) for all k in [0, 4]._

_Where &eta;(n) = _M_\*(2/7)<sup>&alpha;</sup>/((2<sup>&alpha;</sup>&minus;1)\*_n_<sup>&alpha;</sup>)._

_Proof._  Follows from part 2 of Lemma 1 above as well as the proof of Proposition 10 of Nacu and Peres, as well as from the observation in Remark B of the paper that we can start the algorithm from _n_ = 4; in that case, the upper and lower polynomials of degree 1 through 3 above would be constant functions whose Bernstein coefficients are all the same.  The term _&eta;_(_n_) is found as a solution to the functional equation _&eta;_(_n_) = _&eta;_(2\*_n_) + _M_\*(1/(7\*_n_))<sup>_&alpha;_/2</sup>, and functional equations of this kind were suggested in the proof of Proposition 10, to find the offset by which to shift the approximating polynomials.  &#x25a1;

> **Note:** The term _&eta;_(_n_) was found in a similar way as the term _&delta;_(_n_) in Theorem 1.

**Theorem 3.** _Let f(&lambda;) and M be as described in part 3 of Lemma 1, except f maps [0, 1] to (0, 1).  Then the following Bernstein coefficients form an approximation scheme that meets conditions (i), (iii), and (iv) of Proposition 3 of Nacu and Peres (2005)<sup>[**(5)**](#Note5)</sup>, for all n&ge;1:_

_If n is 4 or greater:_

- _**fbelow**(n, k) = f(k/n) &minus; M/(7\*n)._
- _**fabove**(n, k) = f(k/n) + M/(7\*n)._

_Otherwise:_

- _**fbelow**(n, k) = Lower bound of **fbelow**(4, k) for all k in [0, 4]._
- _**fabove**(n, k) = Upper bound of **fabove**(4, k) for all k in [0, 4]._

_Proof._  Follows from part 3 of Lemma 3 above as well as the proof of Proposition 10 of Nacu and Peres, noting that the solution to the functional equation _&kappa;_(n) = _&kappa;_(2\*n) + (_M_/2)\*(1/(7\*_n_)) is _M_/(7\*_n_).  Also follows from the observation in Remark B of the paper that we can start the algorithm from _n_ = 4; in that case, the upper and lower polynomials of degree 1 through 3 above would be constant functions whose Bernstein coefficients are all the same.  &#x25a1;

**Proposition 1.**

1. _Let f be as given in Theorem 1, 2, or 3, except f is concave and may have a minimum of 0.  The approximation scheme of that theorem remains valid if **fbelow**(n, k) = f(k/n), rather than as given in that theorem._
2. _Let f be as given in Theorem 1, 2, or 3, except f is convex and may have a maximum of 1.  The approximation scheme of that theorem remains valid if **fabove**(n, k) = f(k/n), rather than as given in that theorem._

_Proof._ Follows from Theorem 1, 2, or 3, as the case may be, and Jensen's inequality.  &#x25a1;

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
