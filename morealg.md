# More Algorithms for Arbitrary-Precision Sampling

[**Peter Occil**](mailto:poccil14@gmail.com)

This page contains additional algorithms for arbitrary-precision random sampling (sampling that does not rely on floating-point arithmetic).  They may depend on algorithms given in the following pages:

* [**Partially-Sampled Random Numbers for Accurate Sampling of the Beta, Exponential, and Other Continuous Distributions**](https://peteroupc.github.io/exporand.html)
* [**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)

## Bernoulli Factories and Irrational Number Simulation
&nbsp;

### Certain Numbers Based on the Golden Ratio

The following algorithm given by Fishman and Miller <<2013|Fishman, D., Miller, S.J., "Closed Form Continued Fraction Expansions of Special Quadratic Irrationals", ISRN Combinatorics Vol. 2013, Article ID 414623 (2013).>> finds the continued fraction expansion of certain numbers described as&mdash;

- _G_(_m_, _l_) = (_m_ + sqrt(_m_<sup>2</sup> + 4 * _l_))/2<br>&nbsp;&nbsp;&nbsp;&nbsp;or (_m_ &minus; sqrt(_m_<sup>2</sup> + 4 * _l_))/2,

whichever results in a real number greater than 1, where _m_ is a positive integer and _l_ is either 1 or &minus;1.  In this case, _G_(1, 1) is the golden ratio.

First, define the following operations:

- **Get the previous and next Fibonacci-based number given _k_, _m_, and _l_**:
    1. If _k_ is 0 or less, return an error.
    2. Set _g0_ to 0, _g1_ to 1, _x_ to 0, and _y_ to 0.
    3. Do the following _k_ times: Set _y_ to _m_ * _g1_ + _l_ * _g0_, then set _x_ to _g0_, then set _g0_ to _g1_, then set _g1_ to _y_.
    4. Return _x_ and _y_, in that order.
- **Get the partial denominator given _pos_, _k_, _m_, and _l_** (this partial denominator is part of the continued fraction expansion found by Fishman and Miller):
    1. **Get the previous and next Fibonacci-based number given _k_, _m_, and _l_**, call them _p_ and _n_, respectively.
    2. If _l_ is 1 and _k_ is odd, return _p_ + _n_.
    3. If _l_ is &minus;1 and _pos_ is 0, return _n_ &minus; _p_ &minus; 1.
    4. If _l_ is 1 and _pos_ is 0, return (_n_ + _p_) &minus; 1.
    5. If _l_ is &minus;1 and _pos_ is even, return _n_ &minus; _p_ &minus; 2. (The paper had an error here; the correction given here was verified by Miller via personal communication.)
    6. If _l_ is 1 and _pos_ is even, return (_n_ + _p_) &minus; 2.
    7. Return 1.

An application of the continued fraction algorithm is the following algorithm that generates 1 with probability _G_(_m_, _l_)<sup>&minus;_k_</sup> and 0 otherwise, where _k_ is an integer that is 1 or greater (see "Continued Fractions" in my page on Bernoulli factory algorithms). The algorithm starts with _pos_ = 0, then the following steps are taken:

1. **Get the partial denominator given _pos_, _k_, _m_, and _l_**, call it _kp_.
2. With probability _kp_/(1 + _kp_), return a number that is 1 with probability 1/_kp_ and 0 otherwise.
3. Run this algorithm recursively, but with _pos_ = _pos_ + 1.  If the algorithm returns 1, return 0.  Otherwise, go to step 2.

## Arbitrary-Precision Samplers

None yet.

### Mixtures

A _mixture_ involves sampling one of two distributions, where each distribution has a separate probability of being sampled.  In general, an arbitrary-precision sampler is possible if all of the following conditions hold:

- There is a finite number of distributions to choose from.
- The probability of sampling each distribution is a rational number, or it can be expressed as a function for which a [**Bernoulli factory algorithm**](https://peteroupc.github.io/bernoulli.html) exists.
- For each distribution, an arbitrary-precision sampler exists.

One example of a mixture is two beta distributions, with separate parameters.  One beta distribution is chosen with probability exp(&minus;3) (a probability for which a Bernoulli factory algorithm exists) and the other is chosen with the opposite probability.  For the two beta distributions, an arbitrary-precision sampling algorithm exists (see my article on [**partially-sampled random numbers**](https://peteroupc.github.io/exporand.html) for details.

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
