# Supplemental Notes for Bernoulli Factory Algorithms

<a id=General_Factory_Functions></a>
## General Factory Functions

The algorithms for general factory functions work with two sequences of polynomials: one converges from above to a function _f_(_&lambda;_), the other from below.  (These two sequences form a so-called _approximation scheme_ for _f_.) One requirement for these algorithms to work correctly is called the _consistency requirement_:

- The difference between one polynomial and the previous one must have non-negative Bernstein coefficients (once the latter polynomial is elevated to the same degree as the other).

The consistency requirement ensures that the polynomials converge monotonically to the target function.  Unfortunately: the reverse is generally not true; even if the upper polynomials "decrease" and the lower polynomials "increase" to _f_, this does not mean that the scheme will ensure consistency.  And indeed this is the case for many approximation schemes given in the literature.  The following are counterexamples.

<a id=First_Scheme></a>
### First Scheme

In this scheme (Powell 1981), let _f_ be a twice differentiable function (that is, a C2 continuous function, or a function with continuous "slope" and "slope-of-slope" functions).  Then the upper polynomial of degree _n_ has Bernstein coefficients as follows, for all n>=1:

- a(n, k) = f(k/n) + M / (8*n),

where M is an upper bound of the maximum absolute value of _f_'s slope-of-slope function (second derivative).

And the lower polynomial of degree _n_ has Bernstein coefficients as follows:

- a(n, k) = f(k/n) + M / (8*n).

The counterexample is given at: [https://math.stackexchange.com/a/3945261/721857](https://math.stackexchange.com/a/3945261/721857)

<a id=Second_Scheme></a>
### Second Scheme

In this scheme, let _f_ be a Lipschitz continuous function in [0, 1] (that is, a function whose slope does not tend to a vertical slope anywhere in [0, 1]).  Then the upper polynomial of degree _n_ has Bernstein coefficients as follows, for all n>=1:

- a(n, k) = f(k/n) + (5/4) / sqrt(n),

where L is the maximum absolute "slope", also known as the Lipschitz constant, and (5/4) is the so-called Popoviciu constant.

And the lower polynomial of degree _n_ has Bernstein coefficients as follows, for all n>=1:

- a(n, k) = f(k/n) + (5/4) / sqrt(n).

Notice that this counterexample applies for all n>=1.  Perhaps the scheme ensures consistency when n is restricted to powers of 2 instead or the class of functions is restricted to differentiable (C1 continuous) functions.

The function _g_(_&lambda;_) = min(_&lambda;_, 1&minus;_&lambda;_)/2 is Lipschitz continuous with Lipschitz constant 1.  (In addition, _g_ has a kink at 1/2, so that it's not differentiable, but this is not essential for the counterexample.)

For _g_, the Bernstein coefficients for&mdash;

- the degree-5 upper polynomial are [0.4874..., 0.5874..., 0.6874..., 0.6874..., 0.5874..., 0.4874...], and
- the degree-6 upper polynomial are [0.4449..., 0.5283..., 0.6116..., 0.6949..., 0.6116..., 0.5283..., 0.4449...].

The degree-5 polynomial lies above the degree-6 polynomial everywhere in [0, 1].  However, to ensure consistency, the degree-5 polynomial, once elevated to degree 6, must have Bernstein coefficients that are greater than or equal to those of degree-6 polynomial.

- Once elevated to degree 6, the degree-5 polynomial's coefficients are [0.4874..., 0.5707..., 0.6541..., 0.6874..., 0.6541..., 0.5707..., 0.4874...].

As we can see, the elevated polynomial's coefficient 0.6874... is less than the corresponding coefficient 0.6949... for the degree-6 polynomial.  Thus, we have shown that this approximation scheme is not guaranteed to meet the consistency requirement for all Lipschitz continuous functions.

<a id=Third_Scheme></a>
### Third Scheme

Same as above, but replacing (5/4) with the Sikkema constant, _S_ = (4306+837*sqrt(6))/5832.

The counterexample for this scheme is almost the same as the one for the second scheme, except the coefficients for&mdash;

- the degree-5 upper polynomial are [0.5590..., 0.6590..., 0.7590..., 0.7590..., 0.6590..., 0.5590...], and
- the degree-6 upper polynomial are [0.5103..., 0.5936..., 0.6770..., 0.7603..., 0.6770..., 0.5936..., 0.5103...].

And once elevated to degree 6, the degree-5 polynomial's coefficients are [0.5590..., 0.6423..., 0.7257..., 0.7590..., 0.7257..., 0.6423..., 0.5590...].

As we can see, the elevated polynomial's coefficient 0.7590... is less than the corresponding coefficient 0.7603... for the degree-6 polynomial.  Thus, we have shown that this approximation scheme is not guaranteed to meet the consistency requirement for all Lipschitz continuous functions.
