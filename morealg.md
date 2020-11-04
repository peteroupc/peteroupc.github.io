# More Algorithms for Arbitrary-Precision Sampling

[**Peter Occil**](mailto:poccil14@gmail.com)

This page contains additional algorithms for arbitrary-precision sampling of continuous distributions, Bernoulli factory algorithms (biased-coin to biased-coin algorithms), and algorithms to simulate irrational probabilities.  These samplers are designed to not rely on floating-point arithmetic.  They may depend on algorithms given in the following pages:

* [**Partially-Sampled Random Numbers for Accurate Sampling of Continuous Distributions**](https://peteroupc.github.io/exporand.html)
* [**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)

<a id=Contents></a>
## Contents

- [**Contents**](#Contents)
- [**Bernoulli Factories and Irrational Probability Simulation**](#Bernoulli_Factories_and_Irrational_Probability_Simulation)
    - [**Certain Numbers Based on the Golden Ratio**](#Certain_Numbers_Based_on_the_Golden_Ratio)
    - [**Ratio of Lower Gamma Functions (&gamma;(_m_, _n_)/&gamma;(_m_, 1)).**](#Ratio_of_Lower_Gamma_Functions_gamma__m___n__gamma__m__1)
- [**General Arbitrary-Precision Samplers**](#General_Arbitrary_Precision_Samplers)
    - [**Uniform Distribution Inside N-Dimensional Shapes**](#Uniform_Distribution_Inside_N_Dimensional_Shapes)
    - [**Building an Arbitrary-Precision Sampler**](#Building_an_Arbitrary_Precision_Sampler)
    - [**Mixtures**](#Mixtures)
- [**Specific Arbitrary-Precision Samplers**](#Specific_Arbitrary_Precision_Samplers)
    - [**Rayleigh Distribution**](#Rayleigh_Distribution)
    - [**Sum of Exponential Random Numbers**](#Sum_of_Exponential_Random_Numbers)
    - [**Hyperbolic Secant Distribution**](#Hyperbolic_Secant_Distribution)
    - [**Reciprocal of Power of Uniform**](#Reciprocal_of_Power_of_Uniform)
    - [**Distribution of _U_/(1&minus;_U_)**](#Distribution_of__U__1_minus__U)
    - [**Arc-Cosine Distribution**](#Arc_Cosine_Distribution)
    - [**Logistic Distribution**](#Logistic_Distribution)
    - [**Cauchy Distribution**](#Cauchy_Distribution)
    - [**Exponential Distribution with Rate ln(_x_)**](#Exponential_Distribution_with_Rate_ln__x)
    - [**Lindley Distribution and Lindley-Like Mixtures**](#Lindley_Distribution_and_Lindley_Like_Mixtures)
- [**Requests**](#Requests)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Normal Distribution via Ratio of Uniforms**](#Normal_Distribution_via_Ratio_of_Uniforms)
- [**License**](#License)

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
2. Set _k_ to 1, then set _u_ to point to the same value as _ret_.
3. Generate a uniform(0, 1) random number _v_.
4. If _v_ is less than _u_: Set _u_ to _v_, then add 1 to _k_, then go to step 3.
5. If _k_ is odd, return a number that is 1 if _ret_ is less than _n_ and 0 otherwise. (If _ret_ is implemented as a uniform PSRN, this comparison should be done via **URandLessThanReal**.)  If _k_ is even, go to step 1.

<a id=General_Arbitrary_Precision_Samplers></a>
## General Arbitrary-Precision Samplers

&nbsp;

<a id=Uniform_Distribution_Inside_N_Dimensional_Shapes></a>
### Uniform Distribution Inside N-Dimensional Shapes

The following is a general way to describe an arbitrary-precision sampler for generating a point uniformly at random inside a geometric shape located entirely in the hypercube [0, 1]&times;[0, 1]&times;...&times;[0,1] in _N_-dimensional space. The algorithm will generally work if the shape is reasonably defined; the technical requirements are that&mdash;

- the shape's volume must be nonzero,
- the shape must have a zero-volume boundary, and
- the shape must assign zero probability to any zero-volume subset of it (such as a set of individual points).

The sampler's description has the following skeleton.

1. Generate _N_ empty PSRNs, with a positive sign, an integer part of 0, and an empty fractional part.  Call the PSRNs _p1_, _p2_, ..., _pN_.
2. Set _S_ to _base_, where _base_ is the base of digits to be stored by the PSRNs (such as 2 for binary or 10 for decimal).  Then set _N_ coordinates to 0, call the coordinates _c1_, _c2_, ..., _cN_.  Then set _d_ to 1.
3. For each coordinate (_c1_, ..., _cN_), multiply that coordinate by _base_ and add a digit chosen uniformly at random to that coordinate.
4. This step uses a function known as **InShape**, which takes the coordinates of a box and returns one of three values: _YES_ if the box is entirely inside the shape; _NO_ if the box is entirely outside the shape; and _MAYBE_ if the box is partly inside and partly outside the shape, or if the function is unsure.  In this step, run **InShape** using the current box, whose coordinates in this case are ((_c1_/_S_, _c2_/_S_, ..., _cN_/_S_), ((_c1_+1)/_S_, (_c2_+1)/_S_, ..., (_cN_+1)/_S_)).  See below for implementation notes for this step.
5. If the result of **InShape** is _YES_, then the current box was accepted.  If the box is accepted this way, then at this point, _c1_, _c2_, etc., will each store the _d_ digits of a coordinate in the shape, expressed as a number in the interval \[0, 1\], or more precisely, a range of numbers.  (For example, if _base_ is 10, _d_ is 3, and _c1_ is 342, then the first coordinate is 0.342, or more precisely, a number in the interval \[0.342, 0.343\].)  In this case, do the following:
    1. For each coordinate (_c1_, ..., _cN_), transfer that coordinate's least significant digits to the corresponding PSRN's fractional part.  The variable _d_ tells how many digits to transfer to each PSRN this way. (For example, if _base_ is 10, _d_ is 3, and _c1_ is 342, set _p1_'s fractional part to \[3, 4, 2\].)
    2. For each PSRN (_p1_, ..., _pN_), optionally fill that PSRN with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**).
    3. For each PSRN, optionally do the following: With probability 1/2, set that PSRN's sign to negative. (This will result in a symmetric shape in the corresponding dimension.  This step can be done for some PSRNs and not others.)
    4. Return the PSRNs _p1_, ..., _pN_, in that order.
6. If the result of **InShape** is _NO_, then the current box lies outside the shape and is rejected.  In this case, go to step 2.
7. If the result of **InShape** is _MAYBE_, it is not known whether the current box lies fully inside the shape, so multiply _S_ by _base_, then add 1 to _d_, then go to step 3.

> **Notes:**
>
> - See (Li and El Gamal 2016)<sup>[**(2)**](#Note2)</sup> and (Oberhoff 2018)<sup>[**(3)**](#Note3)</sup> for related work on encoding random points uniformly distributed in a shape.
> - Rejection sampling on a shape is subject to the "curse of dimensionality", since typical shapes of high dimension will tend to cover much less volume than their bounding boxes, so that it would take a lot of time on average to accept a high-dimensional box.  Moreover, the more area the shape takes up in the bounding box, the higher the acceptance rate.
> - Implementation notes for step 4:
>
>     1. **InShape**, as well as the divisions of the coordinates by _S_, should be implemented using rational arithmetic.  Instead of dividing those coordinates this way, an implementation can pass _S_ as a separate parameter to **InShape**.
>     2. If the shape in question is convex, and the point (0, 0, ..., 0) is on or inside that shape, **InShape** can return&mdash;
>         - _YES_ if all the box's corners are in the shape;
>         - _NO_ if none of the box's corners are in the shape and if the shape's boundary does not intersect with the box's boundary; and
>         - _MAYBE_ in any other case, or if the function is unsure.
>
>         In the case of two-dimensional shapes, the shape's corners are (_c1_/_S_, _c2_/_S_), ((_c1_+1)/_S_, _c2_/_S_), (_c1_,(_c2_+1)/_S_), and ((_c1_+1)/_S_, (_c2_+1)/_S_).
>     3. If point (0, 0, ..., 0) is on or inside the shape, and the shape is such that every axis-aligned line segment inside the enclosing hypercube crosses the shape at most once, then **InShape** can return&mdash;
>         - _YES_ if all the box's corners are in the shape;
>         - _NO_ if none of the box's corners are in the shape; and
>         - _MAYBE_ in any other case, or if the function is unsure.
>     4. If **InShape** expresses a shape in the form of a [**_signed distance function_**](https://en.wikipedia.org/wiki/Signed_distance_function), namely a function that describes the closest distance from any point in space to the shape's boundary, it can return&mdash;
>         - _YES_ if the signed distance at each of the box's corners (after dividing their coordinates by _S_) is less than &minus;_&sigma;_ (where _&sigma;_ is an upper bound for sqrt(_N_)/(_S_\*2), such as 1/_S_);
>         - _NO_ if the signed distance at each of the box's corners is greater than _&sigma;_; and
>         - _MAYBE_ in any other case, or if the function is unsure.
>     5. **InShape** implementations can also involve a shape's _implicit curve_ or _algebraic curve_ equation (for closed curves), its _implicit surface_ equation (for closed surfaces), or its _signed distance field_ (a quantized version of a signed distance function).
> - An **InShape** function can implement a set operation (such as a union, intersection, or difference) of several simpler shapes, each with its own **InShape** function.  The final result depends on the shape operation (such as union or intersection) as well as the result returned by each component for a given box (for example, for unions, the final result is _YES_ if any component returns _YES_; _NO_ if all components return _NO_; and _MAYBE_ otherwise).
> - (Devroye 1986, chapter 8, section 3)<sup>[**(4)**](#Note4)</sup> describes grid-based methods to optimize random point generation.  In this case, the space is divided into a grid of boxes each with size 1/_base_<sup>_k_</sup> in all dimensions; the result of **InShape** is calculated for each such box and that box labeled with the result; all boxes labeled _NO_ are discarded; and the algorithm is modified by adding the following after step 2: "2a. Choose a precalculated box uniformly at random, then set _c1_, ..., _cN_ to that box's coordinates, then set _d_ to _k_ and set _S_ to _base_<sup>_k_</sup>. If a box labeled _YES_ was chosen, follow the substeps in step 5. If a box labeled _MAYBE_ was chosen, multiply _S_ by _base_ and add 1 to _d_." (For example, if _base_ is 10, _k_ is 1, and _N_ is 2, the space could be divided into a 10&times;10 grid, made up of 100 boxes each of size (1/10)&times;(1/10).  Then, **InShape** is precalculated for the box with coordinates ((0, 0), (1, 1)), the box ((0, 1), (1, 2)), and so on \[the boxes' coordinates are stored as just given, but **InShape** instead uses those coordinates divided by _base_<sup>_k_</sup>, or 10<sup>1</sup> in this case\], each such box is labeled with the result, and boxes labeled _NO_ are discarded.  Finally the algorithm above is modified as just given.)
> - The algorithm can be extended to geometric shapes enclosed in the hyperrectangle [0, _d1_]&times;[0, _d2_]&times;...&times;[0,_dN_], where _d1_, ..., _dN_ are integers greater than 0, as follows:
>     1. Add the following sentence at the end of step 2: "For each coordinate (_c1_, ..., _cN_), set that coordinate to an integer in [0, _dX_), chosen uniformly at random, where _dX_ is the corresponding dimension's size."
>     2. Add the following sentence at the end of the first substep of step 5: "Then, for each coordinate (_c1_, ..., _cN_), set the corresponding PSRN's integer part to floor(_cX_/_base_<sup>_d_</sup>), where _cX_ is that coordinate."
>
> **Examples:**
>
> - The following example generates a point inside a quarter diamond (centered at (0, ..., 0), "radius" 1): Let **InShape** return _YES_ if ((_c1_+1) + ... + (_cN_+1)) < _S_; _NO_ if (_c1_ + ... + _cN_) > _S_; and _MAYBE_ otherwise.  For a full diamond, step 5.3 in the algorithm is done for all _N_ dimensions.
> - The following example generates a point inside a quarter hypersphere (centered at (0, ..., 0), radius 1): Let **InShape** return _YES_ if ((_c1_+1)<sup>2</sup> + ... + (_cN_+1)<sup>2</sup>) < _S_<sup>2</sup>; _NO_ if (_c1_<sup>2</sup> + ... + _cN_<sup>2</sup>) > _S_<sup>2</sup>; and _MAYBE_ otherwise.  For a full hypersphere, step 5.3 in the algorithm is done for all _N_ dimensions.  In the case of a 2-dimensional circle, this algorithm thus adapts the well-known rejection technique of generating X and Y coordinates until X<sup>2</sup>+Y<sup>2</sup> < 1 (e.g., (Devroye 1986, p. 230 et seq.)<sup>[**(4)**](#Note4)</sup>).

<a id=Building_an_Arbitrary_Precision_Sampler></a>
### Building an Arbitrary-Precision Sampler

In many cases, if a continuous distribution&mdash;

- has a probability density function (PDF), or a function proportional to the PDF, with a known symbolic form,
- has a cumulative distribution function (CDF) with a known symbolic form,
- takes on only values 0 or greater, and
- has a PDF that has an infinite tail to the right, is bounded from above (that is, _PDF(0)_ is other than infinity), and decreases monotonically,

it may be possible to describe an arbitrary-precision sampler for that distribution.  Such a description has the following skeleton.

1. With probability _A_, set _intval_ to 0, then set _size_ to 1, then go to step 4.
    - _A_ is calculated as (_CDF_(1) &minus; _CDF_(0)) / (1&minus;_CDF_(0)), where _CDF_ is the distribution's CDF.  This should be found analytically using a computer algebra system such as SymPy.
    - The symbolic form of _A_ will help determine which Bernoulli factory algorithm, if any, will simulate the probability; if a Bernoulli factory exists, it should be used.
2. Set _intval_ to 1 and set _size_ to 1.
3. With probability _B_(_size_, _intval_), go to step 4.  Otherwise, add _size_ to _intval_, then multiply _size_ by 2, then repeat this step.
    - This step chooses an interval beyond 1, and grows this interval by geometric steps, so that an appropriate interval is chosen with the correct probability.
    - The probability _B_(_size_, _intval_) is the probability that the interval is chosen given that the previous intervals weren't chosen, and is calculated as (_CDF_(_size_ + _intval_) &minus; _CDF_(_intval_)) / (1&minus;_CDF_(_intval_)).  This should be found analytically using a computer algebra system such as SymPy.
    - The symbolic form of _B_ will help determine which Bernoulli factory algorithm, if any, will simulate the probability; if a Bernoulli factory exists, it should be used.
4. Generate an integer in the interval [_intval_, _intval_ + _size_) uniformly at random, call it _i_.
5. Create a positive-sign zero-integer-part uniform PSRN, _ret_.
6. Create an input coin that calls **SampleGeometricBag** on the PSRN _ret_.  Run a Bernoulli factory algorithm that simulates the probability _C_(_i_, _&lambda;_), using the input coin (here, _&lambda;_ is the probability built up in _ret_ via **SampleGeometricBag**, and lies in the interval \[0, 1\]).  If the call returns 0, go to step 4.
    - The probability _C_(_i_, _&lambda;_) is calculated as _PDF_(_i_ + _&lambda;_) / _M_, where _PDF_ is the distribution's PDF or a function proportional to the PDF, and should be found analytically using a computer algebra system such as SymPy.
    - In this formula, _M_ is any convenient number in the interval \[_PDF_(_intval_),  max(1, _PDF_(_intval_))\], and should be as low as feasible. _M_ serves to ensure that _C_ is as close as feasible to 1 (to improve acceptance rates), but no higher than 1.  The choice of _M_ can vary for each interval (each value of _intval_, which can only be 0, 1, or a power of 2).  Any such choice for _M_ preserves the algorithm's correctness because the PDF has to be monotonically decreasing and a new interval isn't chosen when _&lambda;_ is rejected.
    - The symbolic form of _C_ will help determine which Bernoulli factory algorithm, if any, will simulate the probability; if a Bernoulli factory exists, it should be used.
7. The PSRN _ret_ was accepted, so set _ret_'s integer part to _i_, then optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _ret_.

Examples of algorithms that use this skeleton are the algorithm for the [**ratio of two uniform random numbers**](https://peteroupc.github.io/uniformsum.html), as well as the algorithms for the Rayleigh distribution and for the reciprocal of power of uniform, both given later.

Perhaps the most difficult part of describing an arbitrary-precision sampler with this skeleton is finding the appropriate Bernoulli factory for the probabilities _A_, _B_, and _C_, especially when these probabilities have a non-trivial symbolic form.

> **Note:** The algorithm skeleton uses ideas similar to the inversion-rejection method described in (Devroye 1986, ch. 7, sec. 4.6)<sup>[**(4)**](#Note4)</sup>; an exception is that instead of generating a uniform random number and comparing it to calculations of a CDF, this algorithm uses conditional probabilities of choosing a given piece, probabilities labeled _A_ and _B_.  This approach was taken so that the CDF of the distribution in question is never directly calculated in the course of the algorithm, which furthers the goal of sampling with arbitrary precision and without using floating-point arithmetic.

<a id=Mixtures></a>
### Mixtures

A _mixture_ involves sampling one of several distributions, where each distribution has a separate probability of being sampled.  In general, an arbitrary-precision sampler is possible if all of the following conditions are met:

- There is a finite number of distributions to choose from.
- The probability of sampling each distribution is a rational number, or it can be expressed as a function for which a [**Bernoulli factory algorithm**](https://peteroupc.github.io/bernoulli.html) exists.
- For each distribution, an arbitrary-precision sampler exists.

> **Example:** One example of a mixture is two beta distributions, with separate parameters.  One beta distribution is chosen with probability exp(&minus;3) (a probability for which a Bernoulli factory algorithm exists) and the other is chosen with the opposite probability.  For the two beta distributions, an arbitrary-precision sampling algorithm exists (see my article on [**partially-sampled random numbers (PSRNs)**](https://peteroupc.github.io/exporand.html) for details).

<a id=Specific_Arbitrary_Precision_Samplers></a>
## Specific Arbitrary-Precision Samplers

&nbsp;

<a id=Rayleigh_Distribution></a>
### Rayleigh Distribution

The following is an arbitrary-precision sampler for the Rayleigh distribution with parameter _s_, which is a rational number greater than 0.

1. Set _k_ to 0, and set _y_ to 2 * _s_ * _s_.
2. With probability exp(&minus;(_k_ * 2 + 1)/_y_), go to step 3.  Otherwise, add 1 to _k_ and repeat this step.  (The probability check should be done with the **exp(&minus;_x_/_y_) algorithm** in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", with _x_/_y_ = (_k_ * 2 + 1)/_y_.)
3. (Now we sample the piece located at [_k_, _k_ + 1).)  Create a positive-sign zero-integer-part uniform PSRN, and create an input coin that returns the result of **SampleGeometricBag** on that uniform PSRN.
4. Set _ky_ to _k_ * _k_ / _y_.
5. (At this point, we simulate exp(&minus;_U_<sup>2</sup>/_y_), exp(&minus;_k_<sup>2</sup>/_y_) , exp(&minus;_U_\*_k_\*2/_y_), as well as a scaled-down version of _U_ + _k_, where _U_ is the number built up by the uniform PSRN.) Call the **exp(&minus;_x_/_y_) algorithm** with _x_/_y_ = _ky_, then call the **exp(&minus;(_&lambda;_<sup>_k_</sup> * _x_)) algorithm** using the input coin from step 2, _x_ = 1/_y_, and _k_ = 2, then call the same algorithm using the same input coin, _x_ = _k_ * 2 / _y_, and _k_ = 1, then call the **sub-algorithm** given later with the uniform PSRN and _k_ = _k_.  If all of these calls return 1, the uniform PSRN was accepted.  Otherwise, remove all digits from the uniform PSRN's fractional part and go to step 4.
7. If the uniform PSRN, call it _ret_, was accepted by step 5, set _ret_'s integer part to _k_, then optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), and return _ret_.

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

<a id=Sum_of_Exponential_Random_Numbers></a>
### Sum of Exponential Random Numbers

An arbitrary-precision sampler for the sum of _n_ exponential random numbers (also known as the Erlang(_n_) or gamma(_n_) distribution) is doable via partially-sampled uniform random numbers, though it is obviously inefficient for large values of _n_.

1. Generate _n_ exponential random numbers with a rate of 1 via the **ExpRand** or **ExpRand2** algorithm described in my article on [**partially-sampled random numbers (PSRNs)**](https://peteroupc.github.io/exporand.html).  These numbers will be uniform PSRNs; this algorithm won't work for exponential PSRNs (e-rands), described in the same article, because the sum of two e-rands may follow a subtly wrong distribution.  By contrast, generating exponential random numbers via rejection from the uniform distribution will allow unsampled digits to be sampled uniformly at random without deviating from the exponential distribution.
2. Generate the sum of the random numbers generated in step 1 by applying the [**UniformAdd**](https://peteroupc.github.io/exporand.html#Addition_and_Subtraction) algorithm given in another document.

<a id=Hyperbolic_Secant_Distribution></a>
### Hyperbolic Secant Distribution

The following algorithm adapts the rejection algorithm from p. 472 in (Devroye 1986)<sup>[**(4)**](#Note4)</sup> for arbitrary-precision sampling.

1. Generate a uniform PSRN, call it _ret_, and turn it into an exponential random number with a rate of 1, using an algorithm that employs rejection from the uniform distribution.
2. Set _ip_ to 1 plus _ret_'s integer part.
3. (The rest of the algorithm accepts _ret_ with probability 1/(1+_ret_).) With probability _ip_/(1+_ip_), generate a number that is 1 with probability 1/_ip_ and 0 otherwise.  If that number is 1, _ret_ was accepted, in which case optionally fill it with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then set _ret_'s sign to positive or negative with equal probability, then return _ret_.
4. Call **SampleGeometricBag** on _ret_'s fractional part (ignore _ret_'s integer part and sign).  If the call returns 1, go to step 1.  Otherwise, go to step 3.

<a id=Reciprocal_of_Power_of_Uniform></a>
### Reciprocal of Power of Uniform

The following algorithm generates a PSRN of the form 1/_U_<sup>1/_x_</sup>, where _U_ is a uniform random number in [0, 1] and _x_ is an integer greater than 0.

1. Set _intval_ to 1 and set _size_ to 1.
2. With probability (4<sup>_x_</sup>&minus;2<sup>_x_</sup>)/4<sup>_x_</sup>, go to step 3.  Otherwise, add _size_ to _intval_, then multiply _size_ by 2, then repeat this step.
3. Generate an integer in the interval [_intval_, _intval_ + _size_) uniformly at random, call it _i_.
4. Create a positive-sign zero-integer-part uniform PSRN, _ret_.
5. Create an input coin that calls **SampleGeometricBag** on the PSRN _ret_.  Call the **algorithm for _d_<sup>_k_</sup> / (_c_ + _&lambda;_)<sup>_k_</sup>** in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", using the input coin, where _d_ = _intval_, _c_ = _i_, and _k_ = _x_ + 1 (here, _&lambda;_ is the probability built up in _ret_ via **SampleGeometricBag**, and lies in the interval \[0, 1\]).  If the call returns 0, go to step 3.
6. The PSRN _ret_ was accepted, so set _ret_'s integer part to _i_, then optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _ret_.

This algorithm uses the skeleton described earlier in "Building an Arbitrary-Precision Sampler".  Here, the probabilities _A_, _B_,  and _C_ are as follows:

- _A_ = 0, since the random number can't lie in the interval [0, 1).
- _B_ = (4<sup>_x_</sup>&minus;2<sup>_x_</sup>)/4<sup>_x_</sup>.
- _C_ = (_x_/(_i_ + _&lambda;_)<sup>_x_+1</sup>) / _M_.  Ideally, _M_ is either _x_ if _intval_ is 1, or _x_/_intval_<sup>_x_+1</sup> otherwise.  Thus, the ideal form for _C_ is _intval_<sup>_x_+1</sup>/(_i_+_&lambda;_)<sup>_x_+1</sup>.

<a id=Distribution_of__U__1_minus__U></a>
### Distribution of _U_/(1&minus;_U_)

The following algorithm generates a PSRN of the form _U_/(1&minus;_U_), where _U_ is a uniform random number in [0, 1].

1. With probability 1/2, set _intval_ to 0, then set _size_ to 1, then go to step 4.
2. Set _intval_ to 1 and set _size_ to 1.
3. With probability _size_/(_size_ + _intval_ + 1), go to step 4.  Otherwise, add _size_ to _intval_, then multiply _size_ by 2, then repeat this step.
4. Generate an integer in the interval [_intval_, _intval_ + _size_) uniformly at random, call it _i_.
5. Create a positive-sign zero-integer-part uniform PSRN, _ret_.
6. Create an input coin that calls **SampleGeometricBag** on the PSRN _ret_.  Call the **algorithm for _d_<sup>_k_</sup> / (_c_ + _&lambda;_)<sup>_k_</sup>** in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", using the input coin, where _d_ = _intval_ + 1, _c_ = _i_ + 1, and _k_ = 2 (here, _&lambda;_ is the probability built up in _ret_ via **SampleGeometricBag**, and lies in the interval \[0, 1\]).  If the call returns 0, go to step 4.
7. The PSRN _ret_ was accepted, so set _ret_'s integer part to _i_, then optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _ret_.

This algorithm uses the skeleton described earlier in "Building an Arbitrary-Precision Sampler".  Here, the probabilities _A_, _B_,  and _C_ are as follows:

- _A_ = 1/2.
- _B_ = _size_/(_size_ + _intval_ + 1).
- _C_ = (1/(_i_+_&lambda;_+1)<sup>2</sup>) / _M_.  Ideally, _M_ is 1/(_intval_+1)<sup>2</sup>.  Thus, the ideal form for _C_ is (_intval_+1)<sup>2</sup>/(_i_+_&lambda;_+1)<sup>2</sup>.

<a id=Arc_Cosine_Distribution></a>
### Arc-Cosine Distribution

Here we reimplement an example from Devroye's book _Non-Uniform Random Variate Generation_ (Devroye 1986, pp. 128&ndash;129)<sup>[**(4)**](#Note4)</sup></sup>.  The following arbitrary-precision sampler generates a random number from a distribution with the following cumulative distribution function (CDF): `1 - cos(pi*x/2).`  The random number will be in the interval [0, 1].  Note that the result is the same as applying acos(_U_)*2/&pi;, where _U_ is a uniform \[0, 1\] random number, as pointed out by Devroye.  The algorithm follows.

1. Call the **kthsmallest** algorithm with `n = 2` and `k = 2`, but without filling it with digits at the last step.  Let _ret_ be the result.
2. Set _m_ to 1.
3. Call the **kthsmallest** algorithm with `n = 2` and `k = 2`, but without filling it with digits at the last step.  Let _u_ be the result.
4. With probability 4/(4\*_m_\*_m_ + 2\*_m_), call the **URandLess** algorithm with parameters _u_ and _ret_ in that order, and if that call returns 1, call the **algorithm for &pi; / 4**, described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", twice, and if both of these calls return 1, add 1 to _m_ and go to step 3.  (Here, we incorporate an erratum in the algorithm on page 129 of the book.)
5. If _m_ is odd, optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits  (similarly to **FillGeometricBag**), and return _ret_.
6. If _m_ is even, go to step 1.

And here is Python code that implements this algorithm.  Note that it uses floating-point arithmetic only at the end, to convert the result to a convenient form, and that it relies on methods from _randomgen.py_ and _bernoulli.py_.

```
def example_4_2_1(rg, bern, precision=53):
    while True:
       ret=rg.kthsmallest_urand(2,2)
       k=1
       while True:
          u=rg.kthsmallest_urand(2,2)
          kden=4*k*k+2*k # erratum incorporated
          if randomgen.urandless(rg,u, ret) and \
             rg.zero_or_one(4, kden)==1 and \
             bern.zero_or_one_pi_div_4()==1 and \
             bern.zero_or_one_pi_div_4()==1:
             k+=1
          elif (k&1)==1:
             return randomgen.urandfill(rg,ret,precision)/(1<<precision)
          else: break
```

<a id=Logistic_Distribution></a>
### Logistic Distribution

The following new algorithm generates a partially-sampled random number that follows the logistic distribution.

1. Set _k_ to 0.
2. (Choose a 1-unit-wide piece of the logistic density.) Run the **algorithm for (1+exp(_k_))/(1+exp(_k_+1))** described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)").  If the call returns 0, add 1 to _k_ and repeat this step.  Otherwise, go to step 3.
3. (The rest of the algorithm samples from the chosen piece.) Generate a uniform(0, 1) random number, call it _f_.
4. (Steps 4 through 7 succeed with probability exp(&minus;(_f_+_k_))/(1+exp(&minus;(_f_+_k_)))<sup>2</sup>.) With probability 1/2, go to step 3.
5. Run the **algorithm for exp(&minus;_k_/1)** (described in "Bernoulli Factory Algorithms"), then **sample from the number _f_** (e.g., call **SampleGeometricBag** on _f_ if _f_ is implemented as a uniform PSRN).  If any of these calls returns 0, go to step 4.
6. With probability 1/2, accept _f_.  If _f_ is accepted this way, set _f_'s integer part to _k_, then optionally fill _f_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then set _f_'s sign to positive or negative with equal probability, then return _f_.
7. Run the **algorithm for exp(&minus;_k_/1)** and **sample from the number _f_** (e.g., call **SampleGeometricBag** on _f_ if _f_ is implemented as a uniform PSRN).  If both calls return 1, go to step 3.  Otherwise, go to step 6.

<a id=Cauchy_Distribution></a>
### Cauchy Distribution

Uses the skeleton for the uniform distribution inside N-dimensional shapes.

1. Generate two empty PSRNs, with a positive sign, an integer part of 0, and an empty fractional part.  Call the PSRNs _p1_ and _p2_.
2. Set _S_ to _base_, where _base_ is the base of digits to be stored by the PSRNs (such as 2 for binary or 10 for decimal).  Then set _c1_ and _c2_ each to 0.  Then set _d_ to 1.
3. Multiply _c1_ and _c2_ each by _base_ and add a digit chosen uniformly at random to that coordinate.
4. If ((_c1_+1)<sup>2</sup> + (_c2_+1)<sup>2</sup>) < _S_<sup>2</sup>, then do the following:
    1. Transfer _c1_'s least significant digits to _p1_'s fractional part, and transfer _c2_'s least significant digits to _p2_'s fractional part.  The variable _d_ tells how many digits to transfer to each PSRN this way. (For example, if _base_ is 10, _d_ is 3, and _c1_ is 342, set _p1_'s fractional part to \[3, 4, 2\].)
    2. Run the **UniformDivision** algorithm (described in the article on PSRNs) on _p1_ and _p2_, in that order, then set the resulting PSRN's sign to positive or negative with equal probability, then return that PSRN.
5. If (_c1_<sup>2</sup> + _c2_<sup>2</sup>) > _S_<sup>2</sup>, then go to step 2.
6. Multiply _S_ by _base_, then add 1 to _d_, then go to step 3.

<a id=Exponential_Distribution_with_Rate_ln__x></a>
### Exponential Distribution with Rate ln(_x_)

The following new algorithm generates a partially-sampled random number that follows the exponential distribution with rate ln(_x_).  This is useful for generating a base-_x_ logarithm of a uniform(0,1) random number.  Here, _x_ is a rational number that's greater than 1.  In the algorithm, let _b_ be floor(ln(_x_)/ln(2)).

1. (Samples the integer part of the random number.) Generate a geometric(1&minus;1/_x_) random number, that is, the number of failed trials before the first success, where each trial has success rate 1&minus;1/_x_.  Set _k_ to that geometric random number.  (If _x_ is a power of 2, this step can be implemented by generating blocks of _b_ unbiased random bits until a **non-zero** block of bits is generated this way, then setting _k_ to the number of **all-zero** blocks of bits generated this way.)
2. (The rest of the algorithm samples the fractional part.) Generate a uniform (0, 1) random number, call it _f_.
3. Create a _&mu;_ input coin that does the following: "**Sample from the number _f_** (e.g., call **SampleGeometricBag** on _f_ if _f_ is implemented as a uniform PSRN), then run the **algorithm for ln(2)** (described in "Bernoulli Factory Algorithms").  If both calls return 1, return 1.  Otherwise, return 0." (This simulates the probability _&lambda;_ = _f_\*ln(2).)    If _x_ is not a power of 2, also create a _&nu;_ input coin that does the following: "**Sample from the number _f_**, then run the **algorithm for ln(1 + _y_/_z_)** (described in "Bernoulli Factory Algorithms") with _y_/_z_ = (_x_&minus;2<sup>_b_</sup>)/2<sup>_b_</sup>.  If both calls return 1, return 1.  Otherwise, return 0."
4. Run the **algorithm for exp(&minus;_&lambda;_)** (described in "Bernoulli Factory Algorithms") _b_ times, using the _&mu;_ input coin.  If _x_ is not a power of 2, run the same algorithm once, using the _&nu;_ input coin.  If all these calls return 1, accept _f_.  If _f_ is accepted this way, set _f_'s integer part to _k_, then optionally fill _f_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _f_.
5. If _f_ was not accepted by the previous step, go to step 2.

> **Note**: A _bounded exponential_ random number with rate ln(_x_) and bounded by _m_ has a similar algorithm to this one.  Step 1 is changed to read as follows: "Set _k_ to a bounded geometric(1&minus;1/_x_, _m_) random number (Bringmann and Friedrich 2013)<sup>[**(5)**](#Note5)</sup>, or more simply, either _m_ or a geometric(1&minus;1/_x_) random number, whichever is less. (If _x_ is a power of 2, this can be implemented by generating blocks of _b_ unbiased random bits until a **non-zero** block of bits or _m_ blocks of bits are generated this way, whichever comes first, then setting _k_ to the number of **all-zero** blocks of bits generated this way.) If _k_ is _m_, return _m_ (note that this _m_ is a constant, not a uniform PSRN; if the algorithm would otherwise return a uniform PSRN, it can return something else in order to distinguish this constant from a uniform PSRN)."  Optionally, instead of generating a uniform(0,1) random number in step 2, a uniform(0,_&mu;_) random number is generated instead, such as a uniform PSRN generated via **RandUniformFromReal**, to implement an exponential distribution bounded by _m_+_&mu;_ (where _&mu;_ is a real number in the interval (0, 1)).

The following generator for the **rate ln(2)** is a special case of the previous algorithm and is useful for generating a base-2 logarithm of a uniform(0,1) random number. Unlike the similar algorithm of Ahrens and Dieter (1972)<sup>[**(6)**](#Note6)</sup>, this one doesn't require a table of probability values.

1. (Samples the integer part of the random number.  This will be geometrically distributed with parameter 1/2.) Generate unbiased random bits until a zero is generated this way.  Set _k_ to the number of ones generated this way.
2. (The rest of the algorithm samples the fractional part.) Generate a uniform (0, 1) random number, call it _f_.
3. Create an input coin that does the following: "**Sample from the number _f_** (e.g., call **SampleGeometricBag** on _f_ if _f_ is implemented as a uniform PSRN), then run the **algorithm for ln(2)** (described in "Bernoulli Factory Algorithms").  If both calls return 1, return 1.  Otherwise, return 0." (This simulates the probability _&lambda;_ = _f_\*ln(2).)
4. Run the **algorithm for exp(&minus;_&lambda;_)** (described in "Bernoulli Factory Algorithms"), using the input coin from the previous step.  If the call returns 1, accept _f_.  If _f_ is accepted this way, set _f_'s integer part to _k_, then optionally fill _f_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _f_.
5. If _f_ was not accepted by the previous step, go to step 2.

<a id=Lindley_Distribution_and_Lindley_Like_Mixtures></a>
### Lindley Distribution and Lindley-Like Mixtures

A random number that follows the Lindley distribution (Lindley 1958)<sup>[**(7)**](#Note7)</sup> with parameter _&theta;_ (a rational number greater than 0) can be generated as follows:

- With probability _w_ = _&theta;_/(1+_&theta;_), generate an exponential random number with a rate of _&theta;_ via **ExpRand** or **ExpRand2** (described in my article on PSRNs) and return that number.
- Otherwise, generate two exponential random numbers with a rate of _&theta;_ via **ExpRand** or **ExpRand2**, then generate their sum by applying the **UniformAdd** algorithm, then return that sum.

For the Garima distribution (Shanker 2016)<sup>[**(8)**](#Note8)</sup>, _w_ = (1+_&theta;_)/(2+_&theta;_).

For the i-Garima distribution (Singh and Das 2020)<sup>[**(9)**](#Note9)</sup>, _w_ = (2+_&theta;_)/(3+_&theta;_).

<a id=Requests></a>
## Requests

We would like to see new implementations of the following:

- Algorithms that implement **InShape** for specific closed curves, specific closed surfaces, and specific signed distance functions.  Recall that **InShape** determines whether a box lies inside, outside, or partly inside or outside a given curve or surface.
- Descriptions of new arbitrary-precision algorithms that use the skeleton given in the section "Building an Arbitrary-Precision Sampler".

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Fishman, D., Miller, S.J., "Closed Form Continued Fraction Expansions of Special Quadratic Irrationals", ISRN Combinatorics Vol. 2013, Article ID 414623 (2013).</small>
- <small><sup id=Note2>(2)</sup> C.T. Li, A. El Gamal, "[**A Universal Coding Scheme for Remote Generation of Continuous Random Variables**](https://arxiv.org/abs/1603.05238v1)", arXiv:1603.05238v1  [cs.IT], 2016</small>
- <small><sup id=Note3>(3)</sup> Oberhoff, Sebastian, "[**Exact Sampling and Prefix Distributions**](https://dc.uwm.edu/etd/1888)", _Theses and Dissertations_, University of Wisconsin Milwaukee, 2018.</small>
- <small><sup id=Note4>(4)</sup> Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.</small>
- <small><sup id=Note5>(5)</sup> Bringmann, K. and Friedrich, T., 2013, July. "Exact and efficient generation of geometric random variates and random graphs", in _International Colloquium on Automata, Languages, and Programming_ (pp. 267-278).</small>
- <small><sup id=Note6>(6)</sup> Ahrens, J.H., and Dieter, U., "Computer methods from sampling from the exponential and normal distributions", _Communications of the ACM_ 15, 1972.</small>
- <small><sup id=Note7>(7)</sup> Lindley, D.V., "Fiducial distributions and Bayes' theorem", _Journal of the Royal Statistical Society Series B_, 1958.</small>
- <small><sup id=Note8>(8)</sup> Shanker, R., "Garima distribution and its application to model behavioral science data", _Biom Biostat Int J._ 4(7), 2016.</small>
- <small><sup id=Note9>(9)</sup> Singh, B.P., Das, U.D., "[**On an Induced Distribution and its Statistical Properties**](https://arxiv.org/abs/2010.15078)", arXiv:2010.15078 [stat.ME], 2020.</small>
- <small><sup id=Note10>(10)</sup> Kinderman, A.J., Monahan, J.F., "Computer generation of random variables using the ratio of uniform deviates", _ACM Transactions on Mathematical Software_ 3(3), pp. 257-260, 1977.</small>
- <small><sup id=Note11>(11)</sup> Daumas, M., Lester, D., Muñoz, C., "[**Verified Real Number Calculations: A Library for Interval Arithmetic**](https://arxiv.org/abs/0708.3721)", arXiv:0708.3721 [cs.MS], 2007.</small>
- <small><sup id=Note12>(12)</sup> Karney, C.F.F., "[**Sampling exactly from the normal distribution**](https://arxiv.org/abs/1303.6257v2)", arXiv:1303.6257v2  [physics.comp-ph], 2014.</small>

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Normal_Distribution_via_Ratio_of_Uniforms></a>
### Normal Distribution via Ratio of Uniforms

This sampler (as well as the Cauchy sampler given earlier) demonstrates the ratio-of-uniforms technique for sampling a distribution (Kinderman and Monahan 1977)<sup>[**(10)**](#Note10)</sup>.  It involves transforming a probability density function into a compact shape.  This sampler for the normal distribution appears here in the appendix since it involves calculating upper and lower bounds of logarithms which, while it's possible to achieve in rational arithmetic (Daumas et al., 2007)<sup>[**(11)**](#Note11)</sup>, is probably less efficient than the normal distribution sampler by Karney (2014)<sup>[**(12)**](#Note12)</sup>, which doesn't require calculating logarithms.

1. Generate two empty PSRNs, with a positive sign, an integer part of 0, and an empty fractional part.  Call the PSRNs _p1_ and _p2_.
2. Set _S_ to _base_, where _base_ is the base of digits to be stored by the PSRNs (such as 2 for binary or 10 for decimal).  Then set _c1_ and _c2_ each to 0.  Then set _d_ to 1.
3. Multiply _c1_ and _c2_ each by _base_ and add a digit chosen uniformly at random to that coordinate.
4. (**InShape** for the transformed normal distribution.) For each (_u_, _v_) pair in (_c1_,_c2_), (_c1_+1,_c2_), (_c1_,_c2_+1), and (_c1_+1,_c2_+1), calculate upper and lower bounds of (_u_/_v_)<sup>2</sup>+ln(_v_/_S_), with an accuracy level that depends on _S_ (the higher _S_ is, the more accurate), except that the bounds are each 0 if _v_ is 0.
5. If all four upper bounds in step 4 are less than 0, then do the following:
    1. Transfer _c1_'s least significant digits to _p1_'s fractional part, and transfer _c2_'s least significant digits to _p2_'s fractional part.  The variable _d_ tells how many digits to transfer to each PSRN this way. (For example, if _base_ is 10, _d_ is 3, and _c1_ is 342, set _p1_'s fractional part to \[3, 4, 2\].)
    2. Run the **UniformDivision** algorithm (described in the article on PSRNs) on _p1_ and _p2_, in that order, then set the resulting PSRN's sign to positive or negative with equal probability, then return that PSRN.
6. If all four lower bounds in step 4 are greater than 0, then go to step 2.
7. Multiply _S_ by _base_, then add 1 to _d_, then go to step 3.

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
