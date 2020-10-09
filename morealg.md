# More Algorithms for Arbitrary-Precision Sampling

[**Peter Occil**](mailto:poccil14@gmail.com)

This page contains additional algorithms for arbitrary-precision sampling of continuous distributions, Bernoulli factory algorithms (biased-coin to biased-coin algorithms), and algorithms to simulate irrational probabilities.  These samplers are designed to not rely on floating-point arithmetic.  They may depend on algorithms given in the following pages:

* [**Partially-Sampled Random Numbers for Accurate Sampling of the Beta, Exponential, and Other Continuous Distributions**](https://peteroupc.github.io/exporand.html)
* [**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)

<a id=Bernoulli_Factories_and_Irrational_Probability_Simulation></a>
## Bernoulli Factories and Irrational Probability Simulation
&nbsp;

<a id=Certain_Numbers_Based_on_the_Golden_Ratio></a>
### Certain Numbers Based on the Golden Ratio

The following algorithm given by Fishman and Miller (2013)<sup>[**(1)**](#Note1)</sup> finds the continued fraction expansion of certain numbers described as&mdash;

- _G_(_m_, _&#x2113;_) = (_m_ + sqrt(_m_<sup>2</sup> + 4 * _&#x2113;_))/2<br>&nbsp;&nbsp;&nbsp;&nbsp;or (_m_ &minus; sqrt(_m_<sup>2</sup> + 4 * _&#x2113;_))/2,

whichever results in a real number greater than 1, where _m_ is a positive integer and _&#x2113;_ is either 1 or &minus;1.  In this case, _G_(1, 1) is the golden ratio.

First, define the following operations:

- **Get the previous and next Fibonacci-based number given _k_, _m_, and _&#x2113;_**:
    1. If _k_ is 0 or less, return an error.
    2. Set _g0_ to 0, _g1_ to 1, _x_ to 0, and _y_ to 0.
    3. Do the following _k_ times: Set _y_ to _m_ * _g1_ + _&#x2113;_ * _g0_, then set _x_ to _g0_, then set _g0_ to _g1_, then set _g1_ to _y_.
    4. Return _x_ and _y_, in that order.
- **Get the partial denominator given _pos_, _k_, _m_, and _&#x2113;_** (this partial denominator is part of the continued fraction expansion found by Fishman and Miller):
    1. **Get the previous and next Fibonacci-based number given _k_, _m_, and _&#x2113;_**, call them _p_ and _n_, respectively.
    2. If _&#x2113;_ is 1 and _k_ is odd, return _p_ + _n_.
    3. If _&#x2113;_ is &minus;1 and _pos_ is 0, return _n_ &minus; _p_ &minus; 1.
    4. If _&#x2113;_ is 1 and _pos_ is 0, return (_n_ + _p_) &minus; 1.
    5. If _&#x2113;_ is &minus;1 and _pos_ is even, return _n_ &minus; _p_ &minus; 2. (The paper had an error here; the correction given here was verified by Miller via personal communication.)
    6. If _&#x2113;_ is 1 and _pos_ is even, return (_n_ + _p_) &minus; 2.
    7. Return 1.

An application of the continued fraction algorithm is the following algorithm that generates 1 with probability _G_(_m_, _&#x2113;_)<sup>&minus;_k_</sup> and 0 otherwise, where _k_ is an integer that is 1 or greater (see "Continued Fractions" in my page on Bernoulli factory algorithms). The algorithm starts with _pos_ = 0, then the following steps are taken:

1. **Get the partial denominator given _pos_, _k_, _m_, and _&#x2113;_**, call it _kp_.
2. With probability _kp_/(1 + _kp_), return a number that is 1 with probability 1/_kp_ and 0 otherwise.
3. Run this algorithm recursively, but with _pos_ = _pos_ + 1.  If the algorithm returns 1, return 0.  Otherwise, go to step 2.

<a id=Ratio_of_Lower_Gamma_Functions_gamma__m___n__gamma__m__1></a>
### Ratio of Lower Gamma Functions (&gamma;(_m_, _n_)/&gamma;(_m_, 1)).

1. Set _ret_ to the result of **kthsmallest** with the two parameters _m_ and _m_.
2. Set _k_ to 1 and _u_ to _ret_.
3. Generate a uniform(0, 1) random number _v_.
4. If _v_ is less than _u_: Set _u_ to _v_, then add 1 to _k_, then go to step 3.
5. If _k_ is odd, return a number that is 1 if _ret_ is less than _n_ and 0 otherwise. (If _ret_ is implemented as a uniform PSRN, this comparison should be done via **URandLessThanReal**.)  If _k_ is even, go to step 1.

<a id=Arbitrary_Precision_Samplers></a>
## Arbitrary-Precision Samplers

<a id=Rayleigh_Distribution></a>
### Rayleigh Distribution

The following is an arbitrary-precision sampler for the Rayleigh distribution with parameter _s_, which is a rational number greater than 0.

1. Set _k_ to 0, and set _y_ to 2 * _s_ * _s_.
2. With probability exp(&minus;(_k_ * 2 + 1)/_y_), go to step 3.  Otherwise, add 1 to _k_ and repeat this step.  (The probability check should be done with the **exp(&minus;_x_/_y_) algorithm** in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", with _x_/_y_ = (_k_ * 2 + 1)/_y_.)
3. (Now we sample the piece located at [_k_, _k_ + 1).)  Create a positive-sign zero-integer-part uniform PSRN, and create an input coin that returns the result of **SampleGeometricBag** on that uniform PSRN.
4. Set _ky_ to _k_ * _k_ / _y_.
5. (At this point, we simulate exp(&minus;_U_<sup>2</sup>/_y_), exp(&minus;_k_<sup>2</sup>/_y_) , exp(&minus;_U_\*_k_\*2/_y_), as well as a scaled-down version of _U_ + _k_, where _U_ is the number built up by the uniform PSRN.) Call the **exp(&minus;_x_/_y_) algorithm** with _x_/_y_ = _ky_, then call the **exp(&minus;(&lambda;<sup>_k_</sup> * _x_)) algorithm** using the input coin from step 2, _x_ = 1/_y_, and _k_ = 2, then call the same algorithm using the same input coin, _x_ = _k_ * 2 / _y_, and _k_ = 1, then call the **sub-algorithm** given later with the uniform PSRN and _k_ = _k_.  If all of these calls return 1, the uniform PSRN was accepted.  Otherwise, remove all digits from the uniform PSRN's fractional part and go to step 4.
7. If the uniform PSRN, call it _ret_, was accepted by step 5, fill it with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), and return _k_ + _ret_.

The sub-algorithm below simulates a probability equal to (_U_+_k_)/_base_<sup>_z_</sup>, where _U_ is the number built by the uniform PSRN, _base_ is the base (radix) of digits stored by that PSRN, _k_ is an integer 0 or greater, and _z_ is the number of significant digits in _k_ (for this purpose, _z_ is 0 if _k_ is 0).

For base 2:

1.  Set _N_ to 0.
2.  With probability 1/2, go to the next step.  Otherwise, add 1 to _N_ and repeat this step.
3.  If _N_ is less than _z_, return rem(_k_ / 2<sup>_z_ &minus; 1 &minus; _N_</sup>, 2).  (Alternatively, shift _k_ to the right, by _z_ &minus; 1 &minus; _N_ bits, then return _k_ _AND_ 1, where "_AND_" is a bitwise AND-operation.)
4.  Subtract _z_ from _N_.  Then, if the item at position _N_ in the uniform PSRN's fractional part (positions start at 0) is not set to a digit (e.g., 0 or 1 for base 2), set the item at that position to a digit chosen uniformly at random (e.g., either 0 or 1 for base 2), increasing the capacity of the uniform PSRN's fractional part as necessary.
4.  Return the item at position _N_.

For bases other than 2, such as 10 for decimal, this can be implemented as follows (based on **URandLess**):

1. Set _i_ to 0.
2. If _i_ is less than _z_:
    1. Set _da_ to rem(_k_ / 2<sup>_z_ &minus; 1 &minus; _i_</sup>, _base_), and set _db_ to a digit chosen uniformly at random (that is, an integer in the interval [0, _base_)).
    2. Return 1 if _da_ is less than _db_, or 0 if _da_ is greater than _db_.
3. If _i_ is _z_ or greater:
    1. If the digit at position (_i_ &minus; _z_) in the uniform PSRN's fractional part is not set, set the item at that position to a digit chosen uniformly at random (positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.).
    2. Set _da_ to the item at that position, and set _db_ to a digit chosen uniformly at random (that is, an integer in the interval [0, _base_)).
    3. Return 1 if _da_ is less than _db_, or 0 if _da_ is greater than _db_.
4. Add 1 to _i_ and go to step 3.

<a id=Uniform_Distribution_Inside_a_Circle></a>
### Uniform Distribution Inside a Circle

The following algorithm is an arbitrary-precision sampler for generating a point uniformly at random inside a circle centered at (0, 0) and with radius 1.  It adapts the well-known rejection technique of generating X and Y coordinates until X<sup>2</sup>+Y<sup>2</sup> < 1 (e.g., (Devroye 1986, p. 230 et seq.)<sup>[**(2)**](#Note2)</sup>).

1. Generate two empty PSRNs, call them _x_ and _y_, with a positive sign, an integer part of 0, and an empty fractional part.
2. Set _c_ to _base_, where _base_ is the base of digits to be stored by the PSRNs (such as 2 for binary or 10 for decimal).  Then set _xd_ to 0, _yd_ to 0, and _d_ to 1.
3. Multiply _xd_ by _base_ and add a digit chosen uniformly at random to _xd_.  Then multiply _yd_ by _base_ and add a digit chosen uniformly at random to _yd_.
4. Set _lb_ to _xd_\*_xd_ + _yd_\*_yd_, and set _ub_ to (_xd_ + 1) \* (_xd_ + 1) +  (_yd_ + 1) \* (_yd_ + 1).  (Here, _lb_ and _ub_ are lower and upper bounds, respectively, of the distance from the point (_xd_, _yd_) to the origin, scaled to _c_<sup>2</sup> units.  These bounds can prove useful not just for implementing the uniform distribution inside a circle, but also the uniform distribution inside a shell or a set of concentric shells.)
5. If _ub_ < _c_<sup>2</sup>, then _xd_ and _yd_ lie inside the circle and are accepted.  If they are accepted this way, then at this point, _xd_ and _yd_ will each store the _d_ digits of a coordinate in the circle, expressed as a number in the interval \[0, 1\], or more precisely, a range of numbers.  (For example, if _base_ is 10, _d_ is 3, and _xd_ is 342, then the X-coordinate is 0.342, or more precisely, a number in the interval \[0.342, 0.343\].)  In this case, do the following:
    1. Transfer the digits of _xd_ and _yd_ to _x_'s and _y_'s fractional parts, respectively.  The variable _d_ tells how many digits to transfer this way. (For example, if _base_ is 10, _d_ is 3, and _xd_ is 342, set _x_'s fractional part to \[3, 4, 2\].)
    2. Fill _x_ and _y_ each with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**).
    3. With probability 1/2, set _x_'s sign to negative.  Then with probability 1/2, set _y_'s sign to negative.
    4. Return _x_ and _y_, in that order.
6. If _lb_ > _c_<sup>2</sup>, then the point lies outside the circle and is rejected.  In this case, go to step 2.
7. At this point, it is not known whether _xd_ and _yd_ lie inside the circle, so multiply _c_ by _base_, then 1 to _d_, then go to step 3.

<a id=Sum_of_Exponential_Random_Numbers></a>
### Sum of Exponential Random Numbers

An arbitrary-precision sampler for the sum of _n_ exponential random numbers (also known as the Erlang(_n_) or gamma(_n_) distribution) is doable via partially-sampled uniform random numbers, though it is obviously inefficient for large values of _n_.

1. Generate _n_ uniform PSRNs, and turn each of them into an exponential random number with a rate of 1, using an algorithm that employs rejection from the uniform distribution (such as the von Neumann algorithm or Karney's improvement to that algorithm (Karney 2014)<sup>[**(3)**](#Note3)</sup>).  This algorithm won't work for exponential PSRNs (e-rands), described in my article on [**partially-sampled random numbers**](https://peteroupc.github.io/exporand.html), because the sum of two e-rands may follow a subtly wrong distribution.  By contrast, generating exponential random numbers via rejection from the uniform distribution will allow unsampled digits to be sampled uniformly at random without deviating from the exponential distribution.
2. Generate the sum of the random numbers generated in step 1 by applying the [**algorithm to add two PSRNs**](https://peteroupc.github.io/uniformsum.html#Addition_and_Subtraction_of_Two_PSRNs) given in another document.

<a id=Hyperbolic_Secant_Distribution></a>
### Hyperbolic Secant Distribution

The following algorithm adapts the rejection algorithm from p. 472 in (Devroye 1986)<sup>[**(2)**](#Note2)</sup> for arbitrary-precision sampling.

1. Generate an exponential PSRN, call it _ret_.
2. Set _ip_ to 1 plus _ret_'s integer part.
3. (The rest of the algorithm accepts _ret_ with probability 1/(1+_ret_).) With probability _ip_/(1+_ip_), generate a number that is 1 with probability 1/_ip_ and 0 otherwise.  If that number is 1, _ret_ was accepted, in which case fill it with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), and return either _ret_ or &minus;_ret_ with equal probability.
4. Call **SampleGeometricBag** on _ret_'s fractional part (ignore _ret_'s integer part and sign).  If the call returns 1, go to step 1.  Otherwise, go to step 3.

<a id=Mixtures></a>
### Mixtures

A _mixture_ involves sampling one of several distributions, where each distribution has a separate probability of being sampled.  In general, an arbitrary-precision sampler is possible if all of the following conditions are met:

- There is a finite number of distributions to choose from.
- The probability of sampling each distribution is a rational number, or it can be expressed as a function for which a [**Bernoulli factory algorithm**](https://peteroupc.github.io/bernoulli.html) exists.
- For each distribution, an arbitrary-precision sampler exists.

One example of a mixture is two beta distributions, with separate parameters.  One beta distribution is chosen with probability exp(&minus;3) (a probability for which a Bernoulli factory algorithm exists) and the other is chosen with the opposite probability.  For the two beta distributions, an arbitrary-precision sampling algorithm exists (see my article on [**partially-sampled random numbers**](https://peteroupc.github.io/exporand.html) for details).

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Fishman, D., Miller, S.J., "Closed Form Continued Fraction Expansions of Special Quadratic Irrationals", ISRN Combinatorics Vol. 2013, Article ID 414623 (2013).</small>
- <small><sup id=Note2>(2)</sup> Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.</small>
- <small><sup id=Note3>(3)</sup> Karney, C.F.F., "[**Sampling exactly from the normal distribution**](https://arxiv.org/abs/1303.6257v2)", arXiv:1303.6257v2  [physics.comp-ph], 2014.</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).