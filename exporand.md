# Partially-Sampled Random Numbers for Accurate Sampling of Continuous Distributions

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

This page introduces a Python implementation of _partially-sampled random numbers_ (PSRNs).  Although structures for PSRNs were largely described before this work, this document unifies the concepts for these kinds of numbers from prior works and shows how they can be used to sample the beta distribution (for most sets of parameters), the exponential distribution (with an arbitrary rate parameter), and other continuous distributions&mdash;

- while avoiding floating-point arithmetic, and
- to an arbitrary precision and with user-specified error bounds (and thus in an "exact" manner in the sense defined in (Karney 2014)<sup>[**(1)**](#Note1)</sup>).

For instance, these two points distinguish the beta sampler in this document from any other specially-designed beta sampler I am aware of.  As for the exponential distribution, there are papers that discuss generating exponential random numbers using random bits (Flajolet and Saheb 1982)<sup>[**(2)**](#Note2)</sup>, (Karney 2014)<sup>[**(1)**](#Note1)</sup>, (Devroye and Gravel 2015)<sup>[**(3)**](#Note3)</sup>, (Thomas and Luk 2008)<sup>[**(4)**](#Note4)</sup>, but most if not all of them don't deal with generating exponential PSRNs using an arbitrary rate, not just 1.  (Habibizad Navin et al., 2010)<sup>[**(5)**](#Note5)</sup> is perhaps an exception; however the approach appears to involve pregenerated tables of digit probabilities.

The samplers discussed here also draw on work dealing with a construct called the _Bernoulli factory_ (Keane and O'Brien 1994)<sup>[**(6)**](#Note6)</sup> (Flajolet et al., 2010)<sup>[**(7)**](#Note7)</sup>, which can simulate an arbitrary probability by transforming biased coins to biased coins.  One important feature of Bernoulli factories is that they can simulate a given probability _exactly_, without having to calculate that probability manually, which is important if the probability can be an irrational number that no computer can compute exactly (such as `pow(p, 1/2)` or `exp(-2)`).

This page shows [**Python code**](#Sampler_Code) for these samplers.

<a id=About_This_Document></a>
### About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/exporand.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/exporand.md)**.  You can send comments on this document either on** [**CodeProject**](https://www.codeproject.com/Articles/5272482/Partially-Sampled-Random-Numbers-for-Accurate-Samp) **or on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues)**.**

<a id=Contents></a>
## Contents

- [**Introduction**](#Introduction)
    - [**About This Document**](#About_This_Document)
- [**Contents**](#Contents)
- [**Notation**](#Notation)
- [**About the Beta Distribution**](#About_the_Beta_Distribution)
- [**About the Exponential Distribution**](#About_the_Exponential_Distribution)
- [**About Partially-Sampled Random Numbers**](#About_Partially_Sampled_Random_Numbers)
    - [**Uniform Partially-Sampled Random Numbers**](#Uniform_Partially_Sampled_Random_Numbers)
    - [**Exponential Partially-Sampled Random Numbers**](#Exponential_Partially_Sampled_Random_Numbers)
    - [**Other Distributions**](#Other_Distributions)
    - [**Properties**](#Properties)
    - [**Comparisons**](#Comparisons)
    - [**Limitations**](#Limitations)
- [**Sampling Uniform and Exponential PSRNs**](#Sampling_Uniform_and_Exponential_PSRNs)
    - [**Sampling Uniform PSRNs**](#Sampling_Uniform_PSRNs)
    - [**Sampling E-rands**](#Sampling_E_rands)
- [**Arithmetic with PSRNs**](#Arithmetic_with_PSRNs)
    - [**In General**](#In_General)
    - [**Addition and Subtraction**](#Addition_and_Subtraction)
    - [**Multiplication**](#Multiplication)
    - [**Using the Arithmetic Algorithms**](#Using_the_Arithmetic_Algorithms)
- [**Building Blocks**](#Building_Blocks)
    - [**SampleGeometricBag**](#SampleGeometricBag)
    - [**FillGeometricBag**](#FillGeometricBag)
    - [**kthsmallest**](#kthsmallest)
    - [**Power-of-Uniform Sub-Algorithm**](#Power_of_Uniform_Sub_Algorithm)
- [**Algorithms for the Beta and Exponential Distributions**](#Algorithms_for_the_Beta_and_Exponential_Distributions)
    - [**Beta Distribution**](#Beta_Distribution)
    - [**Exponential Distribution**](#Exponential_Distribution)
- [**Sampler Code**](#Sampler_Code)
    - [**Exponential Sampler: Extension**](#Exponential_Sampler_Extension)
- [**Correctness Testing**](#Correctness_Testing)
    - [**Beta Sampler**](#Beta_Sampler)
    - [**ExpRandFill**](#ExpRandFill)
    - [**ExpRandLess**](#ExpRandLess)
- [**Accurate Simulation of Continuous Distributions Supported on 0 to 1**](#Accurate_Simulation_of_Continuous_Distributions_Supported_on_0_to_1)
    - [**An Example: The Continuous Bernoulli Distribution**](#An_Example_The_Continuous_Bernoulli_Distribution)
- [**Complexity**](#Complexity)
    - [**General Principles**](#General_Principles)
    - [**Complexity of Specific Algorithms**](#Complexity_of_Specific_Algorithms)
- [**Application to Weighted Reservoir Sampling**](#Application_to_Weighted_Reservoir_Sampling)
- [**Open Questions**](#Open_Questions)
- [**Acknowledgments**](#Acknowledgments)
- [**Other Documents**](#Other_Documents)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**SymPy Formula for the algorithm for exp(&minus;_x_/_y_)**](#SymPy_Formula_for_the_algorithm_for_exp_minus__x___y)
    - [**Equivalence of SampleGeometricBag Algorithms**](#Equivalence_of_SampleGeometricBag_Algorithms)
    - [**Oberhoff's "Exact Rejection Sampling" Method**](#Oberhoff_s_Exact_Rejection_Sampling_Method)
    - [**Setting Digits by Digit Probabilities**](#Setting_Digits_by_Digit_Probabilities)
- [**License**](#License)

<a id=Notation></a>
## Notation

In this document, `RNDINT(x)` is a uniformly-distributed random integer in the interval \[0, x\], `RNDINTEXC(x)` is a uniformly-distributed random integer in the interval \[0, x\), and `RNDU01OneExc()` is a uniformly-distributed random real number in the interval \[0, 1\).

<a id=About_the_Beta_Distribution></a>
## About the Beta Distribution

The [**beta distribution**](https://en.wikipedia.org/wiki/Beta_distribution) is a bounded-domain probability distribution; its two parameters, `alpha` and `beta`, are both greater than 0 and describe the distribution's shape.  Depending on `alpha` and `beta`, the shape can be a smooth peak or a smooth valley.  The beta distribution can take on values in the interval [0, 1].  Any value in this interval (`x`) can occur with a probability proportional to&mdash;

    pow(x, alpha - 1) * pow(1 - x, beta - 1).               (1)

Although `alpha` and `beta` can each be greater than 0, the sampler presented in this document only works if&mdash;

- both parameters are 1 or greater, or
- in the case of base-2 numbers, one parameter equals 1 and the other is greater than 0.

<a id=About_the_Exponential_Distribution></a>
## About the Exponential Distribution

The _exponential distribution_ takes a parameter _&lambda;_.  Informally speaking, a random number that follows an exponential distribution is the number of units of time between one event and the next, and _&lambda;_ is the expected average number of events per unit of time.  Usually, _&lambda;_ is equal to 1.

An exponential random number is commonly generated as follows: `-ln(1 - RNDU01OneExc()) / lamda`.  (This particular formula is not robust, though, for reasons that are outside the scope of this document, but see (Pedersen 2018)<sup>[**(8)**](#Note8)</sup>.)  This page presents an alternative way to sample exponential random numbers.

<a id=About_Partially_Sampled_Random_Numbers></a>
## About Partially-Sampled Random Numbers

In this document, a _partially-sampled random number_ (PSRN) is a data structure that stores a real number of unlimited precision, but whose contents are sampled only when necessary. PSRNs open the door to algorithms that sample a random number that "exactly" follows a continuous distribution, _with arbitrary precision_, and _without floating-point arithmetic_ (see "Properties" later in this section).

PSRNs specified here consist of the following three things:

- A _fractional part_ with an arbitrary number of digits.  This can be implemented as an array of digits or as a packed integer containing all the digits.  Some algorithms care whether those digits were _sampled_ or _unsampled_; in that case, if a digit is unsampled, its unsampled status can be noted in a way that distinguishes it from sampled digits (e.g., by using the `None` keyword in Python, or the number &minus;1, or by storing a separate bit array indicating which bits are sampled and unsampled).  The base in which all the digits are stored (such as base 10 for decimal or base 2 for binary) is arbitrary.  The fractional part's digits form a so-called _digit expansion_ (e.g., _binary expansion_ in the case of binary or base-2 digits).  Digits beyond those stored in the fractional part are unsampled.

    For example, if the fractional part stores the base-10 digits \[1, 3, 5\], in that order, then it represents a random number in the interval \[0.135, 0.136\], reflecting the fact that the digits between 0.135 and 0.136 are unknown.
- An optional _integer part_ (more specifically, the integer part of the number's absolute value, that is, `floor(abs(x))`).
- An optional _sign_ (positive or negative).

If an implementation cares only about PSRNs in the interval [0, 1], it can store only a fractional part; in this case, the unstored integer part and sign are assumed to be 0 and positive, respectively.

PSRNs ultimately represent a random number between two others; one of the number's two bounds has the following form: sign * (integer part + fractional part), which is a lower bound if the PSRN is positive, or an upper bound if it's negative. For example, if the PSRN stores a positive sign, the integer 3, and the fractional part \[3, 5, 6\] (in base 10), then the PSRN represents a random number in the interval \[3.356, 3.357\].  Here, one of the bounds is built using the PSRN's sign, integer part, and fractional part, and because the PSRN is positive, this is a lower bound.

This section specifies two kinds of PSRNs: uniform and exponential.

<a id=Uniform_Partially_Sampled_Random_Numbers></a>
### Uniform Partially-Sampled Random Numbers

The most trivial example of a PSRN is that of the uniform distribution.

- Flajolet et al. (2010)<sup>[**(7)**](#Note7)</sup> use the term _geometric bag_ to refer to a uniform PSRN in the interval [0, 1] that stores binary (base-2) digits, some of which may be unsampled.  In this case, the PSRN can consist of just a fractional part, which can be implemented as described earlier.
- (Karney 2014)<sup>[**(1)**](#Note1)</sup> uses the term _u-rand_ to refer to uniform PSRNs that can store a sign, integer part, and a fractional part, where the base of the fractional part's digits is arbitrary, but Karney's concept only contemplates sampling digits from left to right without any gaps.

Each additional digit of a uniform PSRN's fractional part is sampled simply by setting it to an independent uniform random digit, an observation that dates from von Neumann (1951)<sup>[**(9)**](#Note9)</sup> in the binary case.<sup>[**(10)**](#Note10)</sup>  A PSRN with this property is called a **uniform PSRN** in this document, even if was generated using a non-uniform random sampling algorithm (such as Karney's algorithm for the normal distribution). (This is notably because, in general, this kind of PSRN represents a uniformly-distributed random number in a given interval.  For example, if the PSRN is 3.356..., then it represents a random number that is uniformly distributed in the interval [3.356, 3.357].)

<a id=Exponential_Partially_Sampled_Random_Numbers></a>
### Exponential Partially-Sampled Random Numbers

In this document, an **exponential PSRN** (or **_e-rand_**, named similarly to Karney's "u-rands" for partially-sampled uniform random numbers (Karney 2014)<sup>[**(1)**](#Note1)</sup>) samples each bit that, when combined with the existing bits, results in an exponentially-distributed random number of the given rate.  Also, because `-ln(1 - RNDU01())` is exponentially distributed, e-rands can also represent the natural logarithm of a partially-sampled uniform random number in (0, 1].  The difference here is that additional bits are sampled not as unbiased random bits, but rather as bits with a vanishing bias.   (More specifically, an exponential PSRN generally represents an exponentially-distributed random number in a given interval.)

Algorithms for sampling e-rands are given in the section "Algorithms for the Beta and Exponential Distributions".

<a id=Other_Distributions></a>
### Other Distributions

PSRNs of other distributions can be implemented via rejection from the uniform distribution. Examples include the following:

- The beta and continuous Bernoulli distributions, as discussed later in this document.
- The standard normal distribution, as shown in (Karney 2014)<sup>[**(1)**](#Note1)</sup> by running Karney's Algorithm N and filling unsampled digits uniformly at random, or as shown in an improved version of that algorithm by Du et al. (2020)<sup>[**(11)**](#Note11)</sup>.
- Sampling uniform distributions in \[0, _n_\) (not just \[0, 1\]), is described later in "[**Sampling Uniform PSRNs**](#Sampling_Uniform_PSRNs)".)

For these distributions (and others that are continuous almost everywhere and bounded from above), Oberhoff (2018)<sup>[**(12)**](#Note12)</sup> proved that unsampled trailing bits of the PSRN converge to the uniform distribution (see also (Kakutani 1948)<sup>[**(13)**](#Note13)</sup>).

PSRNs could also be implemented via rejection from the exponential distribution, although no concrete examples are presented here.

<a id=Properties></a>
### Properties

An algorithm that samples from a continuous distribution using PSRNs has the following properties:

1. The algorithm relies only on a source of independent and unbiased random bits for randomness.
2. The algorithm does not rely on floating-point arithmetic or calculations of irrational or transcendental numbers (other than digit extractions), including when the algorithm samples each digit of a PSRN.
3. The algorithm may use rational arithmetic (such as `Fraction` in Python or `Rational` in Ruby), as long as the arithmetic is exact.
4. If the algorithm outputs a PSRN, the number represented by the sampled digits must follow a distribution that is close to the ideal distribution by a distance of not more than _b_<sup>&minus;_m_</sup>, where _b_ is the PSRN's base, or radix (such as 2 for binary), and _m_ is the position, starting from 1, of the rightmost sampled digit of the PSRN's fractional part.  ((Devroye and Gravel 2015)<sup>[**(3)**](#Note3)</sup> suggests Wasserstein distance, or "earth-mover distance", as the distance to use for this purpose.) The number has to be close this way even if the algorithm's caller later samples unsampled digits of that PSRN at random (e.g., uniformly at random in the case of a uniform PSRN).
5. If the algorithm fills a PSRN's unsampled fractional digits at random (e.g., uniformly at random in the case of a uniform PSRN), so that the number's fractional part has _m_ digits, the number's distribution must remain close to the ideal distribution by a distance of not more than _b_<sup>&minus;_m_</sup>.

> **Notes:**
>
> 1. It is not easy to turn a sampler for a continuous distribution into an algorithm that meets these properties.  The following are some reasons for this.
>     - One reason is that arithmetic and other math operations on uniform PSRNs does not always lead to a uniform PSRN; see "[**Arithmetic with PSRNs**](#Arithmetic_with_PSRNs)".
>     - Another issue occurs when the original sampler uses the same random number for different purposes in the algorithm (an example is "_W_\*_Y_, (1&minus;_W_)\*_Y_", where _W_ and _Y_ are independent random numbers (Devroye 1986, p. 394)<sup>[**(14)**](#Note14)</sup>).  In this case, if one PSRN spawns additional PSRNs (so that they become _dependent_ on the first), those additional PSRNs may become inaccurate once additional digits of the first PSRN are sampled uniformly at random. (This is not always the case, but it's hard to characterize when the additional PSRNs become inaccurate this way and when not.)
> 2. The _exact rejection sampling_ algorithm described by Oberhoff (2018)<sup>[**(12)**](#Note12)</sup> produces samples that act like PSRNs; however, the algorithm doesn't have the properties described in this section.  This is because the method requires calculating minimums of probabilities and, in practice, requires the use of floating-point arithmetic in most cases (see property 2 above).  Moreover, the algorithm's progression depends on the value of previously sampled bits, not just on the position of those bits as with the uniform and exponential distributions (see also (Thomas and Luk 2008)<sup>[**(4)**](#Note4)</sup>).  For completeness, Oberhoff's method appears in the appendix.

<a id=Comparisons></a>
### Comparisons

Two PSRNs, each of a different distribution but storing digits of the same base (radix), can be exactly compared to each other using algorithms similar to those in this section.

The **RandLess** algorithm compares two PSRNs, **a** and **b** (and samples additional bits from them as necessary) and returns 1 if **a** turns out to be less than **b** almost surely, or 0 otherwise (see also (Karney 2014)<sup>[**(1)**](#Note1)</sup>)).

1. If **a**'s integer part wasn't sampled yet, sample **a**'s integer part according to the kind of PSRN **a** is.  Do the same for **b**.
2. If **a**'s sign is different from **b**'s sign, return 1 if **a**'s sign is negative and 0 if it's positive.  If **a**'s sign is positive, return 1 if **a**'s integer part is less than **b**'s, or 0 if greater.  If **a**'s sign is negative, return 0 if **a**'s integer part is less than **b**'s, or 1 if greater.
3. Set _i_ to 0.
4. If the digit at position _i_ of **a**'s fractional part is unsampled, set the digit at that position according to the kind of PSRN **a** is. (Positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.)  Do the same for **b**.
5. Let _da_ be the digit at position _i_ of **a**'s fractional part, and let _db_ be **b**'s corresponding digit.
5. If **a**'s sign is positive, return 1 if _da_ is less than _db_, or 0 if _da_ is greater than _db_.
6. If **a**'s sign is negative, return 0 if _da_ is less than _db_, or 1 if _da_ is greater than _db_.
7. Add 1 to _i_ and go to step 4.

**URandLess** is a version of **RandLess** that involves two uniform PSRNs.  The algorithm for **URandLess** samples digit _i_ in step 4 by setting the digit at position _i_ to a digit chosen uniformly at random. (For example, if **a** is a uniform PSRN that stores base-2 or binary digits, this can be done by setting the digit at that position to `RNDINTEXC(2)`.)

The **RandLessThanReal** algorithm compares a PSRN **a** with a real number **b** and returns 1 if **a** turns out to be less than **b** almost surely, or 0 otherwise.  This algorithm samples digits of **a**'s fractional part as necessary.  This algorithm works whether **b** is known to be a rational number or not (for example, **b** can be the result of an expression such as `exp(-2)` or `log(20)`), but the algorithm notes how it can be more efficiently implemented if **b** is known to be a rational number.

1. If **a**'s integer part or sign is unsampled, return an error.
2. Set _bs_ to &minus;1 if **b** is less than 0, or 1 otherwise. Calculate floor(abs(**b**)), and set _bi_ to the result. (_If **b** is known rational:_ Then set _bf_ to abs(**b**) minus _bi_.)
3. If **a**'s sign is different from _bs_'s sign, return 1 if **a**'s sign is negative and 0 if it's positive.  If **a**'s sign is positive, return 1 if **a**'s integer part is less than _bi_, or 0 if greater. (Continue if both are equal.)  If **a**'s sign is negative, return 0 if **a**'s integer part is less than _bi_, or 1 if greater. (Continue if both are equal.)
4. Set _i_ to 0.
5. If the digit at position _i_ of **a**'s fractional part is unsampled, set the digit at that position according to the kind of PSRN **a** is. (Positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.)
6. Calculate the base-&beta; digit at position _i_ of **b**'s fractional part, and set _d_ to that digit. (_If **b** is known rational:_ Do this step by multiplying _bf_ by &beta;, then setting _d_ to floor(_bf_), then subtracting _d_ from _bf_.)
7. Let _ad_ be the digit at position _i_ of **a**'s fractional part.
8. Return 1 if&mdash;
    - _ad_ is less than _d_ and **a**'s sign is positive,
    - _ad_ is greater than _d_ and **a**'s sign is negative, or
    - _ad_ is equal to _d_, **a**'s sign is negative, and&mdash;
        - _**b** is not known to be rational_ and all the digits after the digit at position _i_ of **b**'s fractional part are zeros (indicating **a** is less than **b** almost surely), or
        - _**b** is known to be rational_ and _bf_ is 0 (indicating **a** is less than **b** almost surely).
9. Return 0 if&mdash;
    - _ad_ is less than _d_ and **a**'s sign is negative,
    - _ad_ is greater than _d_ and **a**'s sign is positive, or
    - _ad_ is equal to _d_, **a**'s sign is positive, and&mdash;
        - _**b** is not known to be rational_ and all the digits after the digit at position _i_ of **b**'s fractional part are zeros (indicating **a** is greater than **b** almost surely), or
        - _**b** is known to be rational_ and _bf_ is 0 (indicating **a** is greater than **b** almost surely).
10. Add 1 to _i_ and go to step 5.

An alternative version of steps 6 through 9 in the algorithm above are as follows (see also (Brassard et al. 2019)<sup>[**(15)**](#Note15)</sup>):

- (6.) Calculate _bp_, which is an approximation to **b** such that abs(**b** &minus; _bp_) <= &beta;<sup>&minus;_i_ &minus; 1</sup>, and such that _bp_ has the same sign as **b**.  Let _bk_ be _bp_'s digit expansion up to the _i_ + 1 digits after the point (ignoring its sign).  For example, if **b** is &pi; or &minus;&pi;, &beta; is 10, and _i_ is 4, one possibility is _bp_ = 3.14159 and _bk_ = 314159.
- (7.) Let _ak_ be **a**'s digit expansion up to the _i_ + 1 digits after the point (ignoring its sign).
- (8.) If _ak_ <= _bk_ &minus; 2, return either 1 if **a**'s sign is positive or 0 otherwise.
- (9.) If _ak_ >= _bk_ + 1, return either 1 if **a**'s sign is negative or 0 otherwise.

**URandLessThanReal** is a version of **RandLessThanReal** in which **a** is a uniform PSRN.  The algorithm for **URandLessThanReal** samples digit _i_ in step 4 by setting the digit at position _i_ to a digit chosen uniformly at random.

The following shows how to implement **URandLessThanReal** when **b** is a fraction known by its numerator and denominator, _num_/_den_.

1. If **a**'s integer part or sign is unsampled, or if _den_ is 0, return an error.  Then, if _num_ and _den_ are both less than 0, set them to their absolute values.  Then if **a**'s sign is positive, its integer part is 0, and _num_ is 0, return 0.  Then if **a**'s sign is positive, its integer part is 0, and _num_'s sign is different from _den_'s sign, return 0.
2. Set _bs_ to &minus;1 if _num_ or _den_, but not both, is less than 0, or 1 otherwise, then set _den_ to abs(_den_), then set _bi_ to floor(abs(_num_)/_den_), then set _num_ to rem(abs(_num_), _den_).
3. If **a**'s sign is different from _bs_'s sign, return 1 if **a**'s sign is negative and 0 if it's positive.  If **a**'s sign is positive, return 1 if **a**'s integer part is less than _bi_, or 0 if greater. (Continue if both are equal.)  If **a**'s sign is negative, return 0 if **a**'s integer part is less than _bi_, or 1 if greater. (Continue if both are equal.)  If _num_ is 0 (indicating the fraction is an integer), return 0 if **a**'s sign is positive and 1 otherwise.
4. Set _pt_ to _base_, and set _i_ to 0. (_base_ is the base, or radix, of **a**'s digits, such as 2 for binary or 10 for decimal.)
5. Set _d1_ to the digit at the _i_<sup>th</sup> position (starting from 0) of **a**'s fractional part.  If the digit at that position is unsampled, put a digit chosen uniformly at random at that position and set _d1_ to that digit.
6. Set _c_ to 1 if _num_ * _pt_ >= _den_, and 0 otherwise.
7. Set _d2_ to floor(_num_ * _pt_ / _den_).  (In base 2, this is equivalent to setting _d2_ to _c_.)
8. If _d1_ is less than _d2_, return either 1 if **a**'s sign is positive, or 0 otherwise.  If _d1_ is greater than _d2_, return either 0 if **a**'s sign is positive, or 1 otherwise.
9. If _c_ is 1, set _num_ to _num_ * _pt_ &minus; _den_, then multiply _den_ by _pt_.
10. If _num_ is 0, return either 0 if **a**'s sign is positive, or 1 otherwise.
11. Multiply _pt_ by _base_, add 1 to _i_, and go to step 5.

<a id=Limitations></a>
### Limitations

Because a PSRN stores a random number in a certain interval, PSRNs are not well suited for representing numbers in zero-volume sets.  Such sets include:

- Sets of integers or rational numbers.
- Sets of individual points.
- Curves on two- or higher-dimensional space.
- Surfaces on three- or higher-dimensional space.

In the case of curves and surfaces, a PSRN can't directly store the coordinates, in space, of a random point on that curve or surface (because the exact value of those coordinates may be an irrational number that no computer can store, and no interval can bound those exact coordinates "tightly" enough), but the PSRN _can_ store upper and lower bounds that indirectly give that point's position on that curve or surface.

For example, to represent a point on the edge of a circle, a PSRN can store a random number in the interval \[0, 2\*_&pi;_\), via the **RandUniformFromReal** method, given later, for 2\*_&pi;_ (for example, it can store an integer part of 2 and a fractional part of \[1, 3, 5\] and thus represent a number in the interval \[2.135, 2.136\]), and the number stored this way indicates the distance on the circular arc relative to its starting position.  A program that cares about the point's X and Y coordinates can then generate enough digits of the PSRN to compute an approximation of cos(_P_) and sin(_P_), respectively, to the desired accuracy, where _P_ is the number stored by the PSRN.  (However, the direct use of mathematical functions such as `cos` and `sin` is outside the scope of this document, because the focus here is on "exact sampling".)

<a id=Sampling_Uniform_and_Exponential_PSRNs></a>
## Sampling Uniform and Exponential PSRNs

&nbsp;

<a id=Sampling_Uniform_PSRNs></a>
### Sampling Uniform PSRNs

There are two algorithms for sampling uniform partially-sampled random numbers given another number.

The **RandUniform** algorithm generates a uniformly distributed PSRN (**a**) that is greater than 0 and less than another PSRN (**b**) almost surely.  This algorithm samples digits of **b**'s fractional part as necessary.  This algorithm should not be used if **b** is known to be a real number rather than a partially-sampled random number, since this algorithm could overshoot the value **b** had (or appeared to have) at the beginning of the algorithm; instead, the **RandUniformFromReal** algorithm, given later, should be used.  (For example, if **b** is 3.425..., one possible result of this algorithm is **a** = 3.42574... and **b** = 3.42575... Note that in this example, 3.425... is not considered an exact number.)

1. Create an empty uniform PSRN **a**.  Let &beta; be the base (or radix) of digits stored in **b**'s fractional part (e.g., 2 for binary or 10 for decimal).  If **b**'s integer part or sign is unsampled, or if **b**'s sign is negative, return an error.
2. Set **a**'s sign to positive and **a**'s integer part to an integer chosen uniformly at random in \[0, _bi_\], where _bi_ is **b**'s integer part (e.g., `RNDINT(0, bi)`).  If **a**'s integer part is less than _bi_, return **a**.
3. (We now sample **a**'s fractional part.)  Set _i_ to 0.
4. If **b**'s integer part is 0 and **b**'s fractional part begins with a sampled 0-digit, set _i_ to the number of sampled zeros at the beginning of **b**'s fractional part.  A nonzero digit or an unsampled digit ends this sequence.  Then append _i_ zeros to **a**'s fractional part.  (For example, if **b** is 5.000302 or 4.000 or 0.0008, there are three sampled zeros that begin **b**'s fractional part, so _i_ is set to 3 and three zeros are appended to **a**'s fractional part.)
5. If the digit at position _i_ of **a**'s fractional part is unsampled, set the digit at that position to a base-&beta; digit chosen uniformly at random. (Positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.  An example if &beta; is 2, or binary, is `RNDINTEXC(2)`.)
6. If the digit at position _i_ of **b**'s fractional part is unsampled, sample the digit at that position according to the kind of PSRN **b** is. (For example, if **b** is a uniform PSRN and &beta; is 2, this can be done by setting the digit at that position to `RNDINTEXC(2)`.)
7. If the digit at position _i_ of **a**'s fractional part is less than the corresponding digit for **b**, return **a**.
8. If that digit is greater, then discard **a**, then create a new empty uniform PSRN **a**, then go to step 2.
9. Add 1 to _i_ and go to step 5.

> **Notes:**
>
> 1. Karney (2014, end of sec. 4)<sup>[**(1)**](#Note1)</sup> discusses how even the integer part can be partially sampled rather than generating the whole integer as in step 2 of the algorithm.  However, incorporating this suggestion will add a non-trivial amount of complexity to the algorithm given above.
> 2. The **RandUniform** algorithm is equivalent to generating the product of a random number (**b**) and a uniform(0, 1) random number.
> 3. If **b** is a uniform PSRN with a positive sign, an integer part of 0, and an empty fractional part, the **RandUniform** algorithm is equivalent to generating the product of two uniform(0, 1) random numbers.

The **RandUniformFromReal** algorithm generates a uniformly distributed PSRN (**a**) that is greater than 0 and less than a real number **b** almost surely.  This algorithm works whether **b** is known to be a rational number or not (for example, **b** can be the result of an expression such as `exp(-2)` or `log(20)`), but the algorithm notes how it can be more efficiently implemented if **b** is known to be a rational number.

1. If **b** is 0 or less, return an error.
2. Create an empty uniform PSRN **a**.
3. Special case: If **b** is 1, set **a**'s sign to negative, set **a**'s integer part to 0, and return **a**.
4. Calculate floor(**b**), and set _bi_ to the result. (_If **b** is known rational:_ Then set _bf_ to **b** minus _bi_.)
5. If _bi_ is equal to **b**, set **a**'s sign to positive and **a**'s integer part to an integer chosen uniformly at random in \[0, _bi_\) (e.g., `RNDINTEXC(0, bi)`), then return **a**.  (It should be noted that determining whether a real number is equal to another is undecidable in general.)
6. Set **a**'s sign to positive and **a**'s integer part to an integer chosen uniformly at random in \[0, _bi_\] (e.g., `RNDINT(0, bi)`), then if **a**'s integer part is less than _bi_, return **a**.
7. (We now sample **a**'s fractional part.)  Set _i_ to 0.
8. If _bi_ is 0 and not equal to **b**, then do the following in a loop:
    1. Calculate the base-&beta; digit at position _i_ of **b**'s fractional part, and set _d_ to that digit. (&beta; is the desired digit base, or radix, of the uniform PSRN, such as 10 for decimal or 2 for binary). (_If **b** is known rational:_ Do this step by multiplying _bf_ by &beta;, then setting _d_ to floor(_bf_), then subtracting _d_ from _bf_.)
    2. If _d_ is 0, append a 0-digit to **a**'s fractional part, then add 1 to _i_.  Otherwise, break from this loop.
9. If the digit at position _i_ of **a**'s fractional part is unsampled, set the digit at that position to a base-&beta; digit chosen uniformly at random. (Positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.  An example if &beta; is 2, or binary, is `RNDINTEXC(2)`.)
10. Calculate the base-&beta; digit at position _i_ of **b**'s fractional part, and set _d_ to that digit. (_If **b** is known rational:_ Do this step by multiplying _bf_ by &beta;, then setting _d_ to floor(_bf_), then subtracting _d_ from _bf_.)
11. Let _ad_ be the digit at position _i_ of **a**'s fractional part.  If _ad_ is less than _d_, return **a**.
12. _If **b** is not known to be rational:_ If _ad_ is greater than _d_, or if all the digits after the digit at position _i_ of **b**'s fractional part are zeros, then discard **a**, then create a new empty uniform PSRN **a**, then go to step 6.
13. _If **b** is known rational:_ If _ad_ is greater than _d_, or if _bf_ is 0, then discard **a**, then create a new empty uniform PSRN **a**, then set _bf_ to **b** minus _bi_, then go to step 6.
14. Add 1 to _i_ and go to step 9.

<a id=Sampling_E_rands></a>
### Sampling E-rands

**Sampling an e-rand** (a exponential PSRN) makes use of two observations (based on the parameter _&lambda;_ of the exponential distribution):

- While a coin flip with probability of heads of exp(-_&lambda;_) is heads, the exponential random number is increased by 1.
- If a coin flip with probability of heads of 1/(1+exp(_&lambda;_/2<sup>_k_</sup>)) is heads, the exponential random number is increased by 2<sup>-_k_</sup>, where _k_ > 0 is an integer.

(Devroye and Gravel 2015)<sup>[**(3)**](#Note3)</sup> already made these observations in their Appendix, but only for _&lambda;_ = 1.

To implement these probabilities using just random bits, the sampler uses two algorithms, which both enable e-rands with rational valued _&lambda;_ parameters:

1. One to simulate a probability of the form `exp(-x/y)` (here, the **algorithm for exp(&minus;_x_/_y_)** described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)").
2. One to simulate a probability of the form `1/(1+exp(x/(y*pow(2, prec))))` (here, the **LogisticExp** algorithm described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)").

<a id=Arithmetic_with_PSRNs></a>
## Arithmetic with PSRNs
&nbsp;

<a id=In_General></a>
### In General

Arithmetic between two PSRNs is not always trivial.

- Adding, multiplying, or dividing two PSRNs _A_ and _B_ (see also (Brassard et al., 2019)<sup>[**(15)**](#Note15)</sup>) is not as simple as adding their integer and fractional parts.

    An example illustrates this. Say we have two uniform PSRNs: _A_ = 0.12345... and _B_ = 0.38901....  They represent random numbers in the intervals _AI_ = \[0.12345, 0.12346\] and _BI_ = \[0.38901, 0.38902\], respectively.  Adding two uniform PSRNs is akin to adding their intervals (using interval arithmetic), so that in this example, the result _C_ lies in _CI_ = \[0.12345 + 0.38901, 0.12346 + 0.38902\] = \[0.51246, 0.51248\].  However, the resulting random number is _not_ uniformly distributed in \[0.51246, 0.51248\], so that simply choosing a uniform random number in the interval won't work.  This can be demonstrated by generating many pairs of uniform random numbers in the intervals _AI_ and _BI_, summing the numbers in each pair, and building a histogram using the sums (which will all lie in the interval _CI_).  In this case, the histogram will show a triangular distribution that peaks at 0.51247.

    This example can also apply to other arithmetic operations besides addition: do the interval operation (multiplication, division, etc.) on the intervals _AI_ and _BI_, and build a histogram of random results (products, quotients, etc.) that lie in the resulting interval to find out what distribution forms this way.

    Another reason most operations are nontrivial is that the result of the operation may be an irrational number (as in `log`, `sin`, etc.), or can even have a non-terminating digit expansion (as in most cases of division).  For these operations, although interval arithmetic can tightly bound the possible result to a finite number of digits, the resulting interval can include numbers with a probability density of zero.
- On the other hand, some other arithmetic operations are trivial to carry out in PSRNs.  They include negation, as mentioned in (Karney 2014)<sup>[**(1)**](#Note1)</sup>, and operations affecting the PSRN's integer part only.
- Partially-sampled-number arithmetic may also be possible by relating the relative probabilities of each digit, in the result's digit expansion, to some kind of formula.
    - There is previous work that relates continuous distributions to digit probabilities in a similar manner (but only in base 10) (Habibizad Navin et al., 2007)<sup>[**(16)**](#Note16)</sup>, (Nezhad et al., 2013)<sup>[**(17)**](#Note17)</sup>.  This previous work points to building a probability tree, where the probability of the next digit depends on the value of the previous digits.  However, calculating each probability requires knowing the distribution's cumulative distribution function (CDF), and the calculations can incur rounding and cancellation errors especially when the digit probabilities are not rational numbers or they have no simple mathematical form, as is often the case.
    - For some distributions (including the uniform and exponential distributions), the digit probabilities don't depend on previous digits, only on the position of the digit.  In this case, however, there appear to be limits on how practical this approach is; see the [**appendix**](#Setting_Digits_by_Digit_Probabilities) for details.
- Finally, arithmetic with PSRNs may be possible if the result of the arithmetic is distributed with a known probability density function (PDF) (e.g., one found via Rohatgi's formula (Rohatgi 1976)<sup>[**(18)**](#Note18)</sup>), allowing for an algorithm that implements rejection from the uniform or exponential distribution.  An example of this is found in my article on [**arbitrary-precision samplers for the sum of uniform random numbers**](https://peteroupc.github.io/uniformsum.html).  However, that PDF may have an unbounded peak, thus ruling out rejection sampling in practice.  For example, if _X_ is a uniform PSRN, then the distribution of _X_<sup>3</sup> has the PDF `(1/3) / pow(X, 2/3)`, which has an unbounded peak at 0.  While this rules out plain rejection samplers for _X_<sup>3</sup> in practice, it's still possible to sample powers of uniforms using PSRNs, which will be described later in this article.

<a id=Addition_and_Subtraction></a>
### Addition and Subtraction

The following algorithm (**UniformAdd**) shows how to add two uniform PSRNs (**a** and **b**) that store digits of the same base (radix) in their fractional parts, and get a uniform PSRN as a result.  The input PSRNs may have a positive or negative sign, and it is assumed that their integer parts and signs were sampled.  _Python code implementing this algorithm is given later in this document._

1. If **a** has unsampled digits before the last sampled digit in its fractional part, set each of those unsampled digits to a digit chosen uniformly at random.  Do the same for **b**.
2. If **a** has fewer digits in its fractional part than **b** (or vice versa), sample enough digits (by setting them to uniform random digits, such as unbiased random bits if **a** and **b** store binary, or base-2, digits) so that both PSRNs' fractional parts have the same number of digits.  Now, let _digitcount_ be the number of digits in **a**'s fractional part.
3. Let _asign_ be &minus;1 if **a**'s sign is negative, or 1 otherwise.  Let _bsign_ be &minus;1 if **b**'s sign is negative, or 1 otherwise.  Let _afp_ be the digits of **a**'s _fractional part_, and let _bfp_ be the digits of **b**'s _fractional part_.  (For example, if **a** represents the number 83.12344..., _afp_ is 12344.)  Let _base_ be the base of digits stored by **a** and **b**, such as 2 for binary or 10 for decimal.
4. Calculate the following four numbers:
    - _afp_\*_asign_ + _bfp_\*_bsign_.
    - _afp_\*_asign_ + (_bfp_+1)\*_bsign_.
    - (_afp_+1)\*_asign_ + _bfp_\*_bsign_.
    - (_afp_+1)\*_asign_ + (_bfp_+1)\*_bsign_.
5. Set _minv_ to the minimum and _maxv_ to the maximum of the four numbers just calculated.  These are lower and upper bounds to the result of applying interval addition to the PSRNs **a** and **b**. (For example, if **a** is 0.12344... and **b** is 0.38925..., their fractional parts are added to form **c** = 0.51269...., or the interval [0.51269, 0.51271].)  However, the resulting PSRN is not uniformly distributed in its interval, and this is what the rest of this algorithm will solve, since in fact, the distribution of numbers in the interval resembles the distribution of the sum of two uniform random numbers.
6. Once the four numbers are sorted from lowest to highest, let _midmin_ be the second number in the sorted order, and let _midmax_ be the third number in that order.
7. Set _x_ to a uniform random integer in the interval [0, _maxv_&minus;_minv_).  If _x_ < _midmin_&minus;_minv_, set _dir_ to 0 (the left side of the sum density).  Otherwise, if _x_ > _midmax_&minus;_minv_, set _dir_ to 1 (the right side of the sum density).  Otherwise, do the following:
     1. Set _s_ to _minv_ + _x_.
     2. Create a new uniform PSRN, _ret_.  If _s_ is less than 0, set _s_ to abs(1 + _s_) and set _ret_'s sign to negative.  Otherwise, set _ret_'s sign to positive.
     3. Transfer the _digitcount_ least significant digits of _s_ to _ret_'s fractional part.  (Note that _ret_'s fractional part stores digits from most to least significant.)  Then set _ret_'s integer part to floor(_s_/_base_<sup>_digitcount_</sup>), then return _ret_.  (For example, if _base_ is 10, _digitcount_ is 3, and _s_ is 34297, then _ret_'s fractional part is set to \[2, 9, 7\], and _ret_'s integer part is set to 34.)
8. If _dir_ is 0 (the left side), set _pw_ to _x_ and _b_ to _midmin_&minus;_minv_.  Otherwise (the right side), set _pw_ to _x_&minus;(_midmax_&minus;_minv_) and _b_ to _maxv_&minus;_midmax_.
9. Set _newdigits_ to 0, then set _y_ to a uniform random integer in the interval [0, _b_).
10. If _dir_ is 0, set _lower_ to _pw_.  Otherwise, set _lower_ to _b_&minus;1&minus;_pw_.
11. If _y_ is less than _lower_, do the following:
     1. Set _s_ to _minv_ if _dir_ is 0, or _midmax_ otherwise, then set _s_ to _s_\*(_base_<sup>_newdigits_</sup>) + _pw_.
     2. Create a new uniform PSRN, _ret_.  If _s_ is less than 0, set _s_ to abs(1 + _s_) and set _ret_'s sign to negative.  Otherwise, set _ret_'s sign to positive.
     3. Transfer the _digitcount_ + _newdigits_ least significant digits of _s_ to _ret_'s fractional part, then set _ret_'s integer part to floor(_s_/_base_<sup>_digitcount_ + _newdigits_</sup>), then return _ret_.
12. If _y_ is greater than _lower_ + 1, go to step 7. (This is a rejection event.)
13. Multiply _pw_, _y_, and _b_ each by _base_, then add a digit chosen uniformly at random to _pw_, then add a digit chosen uniformly at random to _y_, then add 1 to _newdigits_, then go to step 10.

The following algorithm (**UniformAddRational**) shows how to add a uniform PSRN (**a**) and a rational number **b**.  The input PSRN may have a positive or negative sign, and it is assumed that its integer part and sign were sampled. Similarly, the rational number may be positive, negative, or zero.  _Python code implementing this algorithm is given later in this document._

1. Let _ai_ be **a**'s integer part.  Special cases:
    - If **a**'s sign is positive and has no sampled digits in its fractional part, and if **b** is an integer 0 or greater, return a uniform PSRN with a positive sign, an integer part equal to _ai_ + **b**, and an empty fractional part.
    - If **a**'s sign is negative and has no sampled digits in its fractional part, and if **b** is an integer less than 0, return a uniform PSRN with a negative sign, an integer part equal to _ai_ + abs(**b**), and an empty fractional part.
    - If **a**'s sign is positive, has an integer part of 0, and has no sampled digits in its fractional part, and if **b** is an integer, return a uniform PSRN with an empty fractional part.  If **b** is less than 0, the PSRN's sign is negative and its integer part is abs(**b**)&minus;1.  If **b** is 0 or greater, the PSRN's sign is positive and its integer part is abs(**b**).
    - If **b** is 0, return a copy of **a**.
2. If **a** has unsampled digits before the last sampled digit in its fractional part, set each of those unsampled digits to a digit chosen uniformly at random.   Now, let _digitcount_ be the number of digits in **a**'s fractional part.
3. Let _asign_ be &minus;1 if **a**'s sign is negative or 1 otherwise.  Let _base_ be the base of digits stored in **a**'s fractional part (such as 2 for binary or 10 for decimal).  Set _absfrac_ to abs(**b**), then set _fraction_ to _absfrac_ &minus; floor(_absfrac_).
4. Let _afp_ be the digits of **a**'s _fractional part_.  (For example, if **a** represents the number 83.12344..., _afp_ is 12344.)  Let _asign_ be &minus;1 if
5. Set _ddc_ to _base_<sup>_dcount_</sup>, then set _lower_ to ((_afp_\*_asign_)/_ddc_)+**b** (using rational arithmetic), then set _upper_ to (((_afp_+1)\*_asign_)/_ddc_)+**b** (again using rational arithmetic).  Set _minv_ to min(_lower_, _upper_), and set _maxv_ to min(_lower_, _upper_).
6. Set _newdigits_ to 0, then set _b_ to 1, then set _ddc_ to _base_<sup>_dcount_</sup>, then set _mind_ to floor(abs(_minv_\*_ddc_)), then set _maxd_ to floor(abs(_maxv_\*_ddc_)). (Outer bounds): Then set _rvstart_ to _mind_&minus;1 if _minv_ is less than 0, or _mind_ otherwise, then set _rvend_ to _maxd_ if _maxv_ is less than 0, or _maxd_+1 otherwise.
7. Set _rv_ to a uniform random integer in the interval [0, _rvend_&minus;_rvstart_), then set _rvs_ to _rv_ + _rvstart_.
8. (Inner bounds.) Set _innerstart_ to _mind_ if _minv_ is less than 0, or _mind_+1 otherwise, then set _innerend_ to _maxd_&minus;1 if _maxv_ is less than 0, or _maxd_ otherwise.
9. If _rvs_ is greater than _innerstart_ and less than _innerend_, then the algorithm is almost done, so do the following:
    1. Create an empty uniform PSRN, call it _ret_.  If _rvs_ is less than 0, set _rvs_ to abs(1 + _rvs_) and set _ret_'s sign to negative.  Otherwise, set _ret_'s sign to positive.
    2. Transfer the _digitcount_ + _newdigits_ least significant digits of _rvs_ to _ret_'s fractional part, then set _ret_'s integer part to floor(_rvs_/_base_<sup>_digitcount_ + _newdigits_</sup>), then return _ret_.
10. If _rvs_ is equal to or less than _innerstart_ and (_rvs_+1)/_ddc_ (calculated using rational arithmetic) is less than or equal to _minv_, go to step 6.  (This is a rejection event.)
11. If _rvs_/_ddc_ (calculated using rational arithmetic) is greater than or equal to _maxv_, go to step 6.  (This is a rejection event.)
12. Add 1 to _newdigits_, then multiply _ddc_, _rvstart_, _rv_, and _rvend_ each by _base_, then set _mind_ to floor(abs(_minv_\*_ddc_)), then set _maxd_ to floor(abs(_maxv_\*_ddc_)), then add a digit chosen uniformly at random to _rv_, then set _rvs_ to _rv_+_rvstart_, then go to step 8.

<a id=Multiplication></a>
### Multiplication

The following algorithm (**UniformMultiply**) shows how to multiply two uniform PSRNs (**a** and **b**) that store digits of the same base (radix) in their fractional parts, and get a uniform PSRN as a result.  The input PSRNs may have a positive or negative sign, and it is assumed that their integer parts and signs were sampled. _Python code implementing this algorithm is given later in this document._

1. If **a** has unsampled digits before the last sampled digit in its fractional part, set each of those unsampled digits to a digit chosen uniformly at random.  Do the same for **b**.
2. If **a** has fewer digits in its fractional part than **b** (or vice versa), sample enough digits (by setting them to uniform random digits, such as unbiased random bits if **a** and **b** store binary, or base-2, digits) so that both PSRNs' fractional parts have the same number of digits.
3. If neither **a** nor **b** has a non-zero digit in its fractional part, then do the following. (This step is crucial for correctness when both PSRNs' intervals cover the number 0, since the distribution of their product is different from the usual case.)
     1. Append a digit chosen uniformly at random to **a**'s fractional part.  Do the same for **b**.
     2. If both digits chosen in the previous substep were zeros, go to the previous substep.
4. Let _afp_ be the digits of **a**'s _fractional part_, and let _bfp_ be the digits of **b**'s _fractional part_.  (For example, if **a** represents the number 83.12344..., _afp_ is 12344.)  Let _digitcount_ be the number of digits in **a**'s fractional part.
5. Calculate _n1_ = _afp_\*_bfp_, _n2_ = _afp_\*(_bfp_+1), _n3_ = (_afp_+1)\*_bfp_, and _n4_ = (_afp_+1)\*(_bfp_+1).
6. Set _minv_ to the minimum and _maxv_ to the maximum of the four numbers just calculated.  Set _midmin_ to min(_n2_, _n3_) and _midmax_ to max(_n2_, _n3_).  The numbers _minv_ and _maxv_ are lower and upper bounds to the result of applying interval multiplication to the PSRNs **a** and **b**. (For example, if **a** is 0.12344... and **b** is 0.38925..., their fractional parts are added to form **c** = 0.51269...., or the interval [0.51269, 0.51271].)  However, the resulting PSRN is not uniformly distributed in its interval; in the case of multiplication the distribution resembles a trapezoid whose domain is the interval \[_minv_, _maxv_\] and whose top is delimited by _midmin_ and _midmax_.
7. Create a new uniform PSRN, _ret_.  If **a**'s sign is negative and **b**'s sign is negative, or vice versa, set _ret_'s sign to negative.  Otherwise, set _ret_'s sign to positive.
8. Set _z_ to a uniform random integer in the interval [0, _maxv_&minus;_minv_).
9. If _z_ is less than _midmin_&minus;_minv_, we will sample from the left side of the trapezoid.  In this case, do the following:
    1. Set _x_ to _z_, then set _newdigits_ to 0, then set _b_ to _midmin_&minus;_minv_, then set _y_ to a uniform random integer in the interval [0, _b_).
    2. If _y_ is less than _x_, the algorithm succeeds, so do the following:
        1. Set _s_ to _minv_\*_base_<sup>_newdigits_</sup> + _x_ (where _base_ is the base of digits stored by **a** and **b**, such as 2 for binary or 10 for decimal).
        2. Transfer the (_n_\*2 + _newdigits_) least significant digits of _s_ to _ret_'s fractional part, where _n_ is the number of digits in **a**'s fractional part.  (Note that _ret_'s fractional part stores digits from most to least significant.)  Then set _ret_'s integer part to floor(_s_/_base_<sup>_n_\*2 + _newdigits_</sup>).  (For example, if _base_ is 10, (_n_\*2 + _newdigits_) is 4, and _s_ is 342978, then _ret_'s fractional part is set to \[2, 9, 7, 8\], and _ret_'s integer part is set to 34.)  Finally, return _ret_.
    3. If _y_ is greater than _x_ + 1, abort these substeps and go to step 8. (This is a rejection event.)
    4. Multiply _x_, _y_, and _b_ each by _base_, then add a digit chosen uniformly at random to _x_, then add a digit chosen uniformly at random to _y_, then add 1 to _newdigits_, then go to the second substep.
10. If _z_ is greater than or equal to _midmax_&minus;_minv_, we will sample from the right side of the trapezoid.  In this case, do the following:
    1. Set _x_ to _z_&minus;(_midmax_&minus;_minv_), then set _newdigits_ to 0, then set _b_ to _maxv_&minus;_midmax_, then set _y_ to a uniform random integer in the interval [0, _b_).
    2. If _y_ is less than _b_&minus;1&minus;_x_, the algorithm succeeds, so do the following: Set _s_ to _midmax_\*_base_<sup>_newdigits_</sup> + _x_, then transfer the (_n_\*2+ _newdigits_) least significant digits of _s_ to _ret_'s fractional part, then set _ret_'s integer part to floor(_s_/_base_<sup>_n_\*2 + _newdigits_</sup>), then return _ret_.
    3. If _y_ is greater than (_b_&minus;1&minus;_x_) + 1, abort these substeps and go to step 8. (This is a rejection event.)
    4. Multiply _x_, _y_, and _b_ each by _base_, then add a digit chosen uniformly at random to _x_, then add a digit chosen uniformly at random to _y_, then add 1 to _newdigits_, then go to the second substep.
11. If we reach here, we have reached the middle part of the trapezoid, which is flat and uniform, so no rejection is necessary. Set _s_ to _minv_ + _z_, then transfer the (_n_\*2) least significant digits of _s_ to _ret_'s fractional part, then set _ret_'s integer part to floor(_s_/_base_<sup>_n_\*2</sup>), then return _ret_.

The following algorithm (**UniformMultiplyRational**) shows how to multiply a uniform PSRN (**a**) by a nonzero rational number **b**.  The input PSRN may have a positive or negative sign, and it is assumed that its integer part and sign were sampled. _Python code implementing this algorithm is given later in this document._

1. If **a** has unsampled digits before the last sampled digit in its fractional part, set each of those unsampled digits to a digit chosen uniformly at random.   Now, let _digitcount_ be the number of digits in **a**'s fractional part.
2. Create a uniform PSRN, call it _ret_.  Set _ret_'s sign to be &minus;1 if **a**'s sign is positive and **b** is less than 0 or if **a**'s sign is negative and **b** is 0 or greater, or 1 otherwise, then set _ret_'s integer part to 0.  Let _base_ be the base of digits stored in **a**'s fractional part (such as 2 for binary or 10 for decimal).  Set _absfrac_ to abs(**b**), then set _fraction_ to _absfrac_ &minus; floor(_absfrac_).
3. Let _afp_ be the digits of **a**'s _fractional part_.  (For example, if **a** represents the number 83.12344..., _afp_ is 12344.)
4. Set _dcount_ to _digitcount_, then set _ddc_ to _base_<sup>_dcount_</sup>, then set _lower_ to (_afp_/_ddc_)\*_absfrac_ (using rational arithmetic), then set _upper_ to (_afp_/_ddc_)\*_absfrac_ (again using rational arithmetic).
5. Set _rv_ to a uniform random integer in the interval [floor(_lower_\*_ddc_), floor(_upper_\*_ddc_)).
6. Set _rvlower_ to _rv_/_ddc_ (as a rational number), then set _rvupper_ to (_rv_+1)/_ddc_ (as a rational number).
7. If _rvlower_ is greater than or equal to _lower_ and _rvupper_ is less than _upper_, then the algorithm is almost done, so do the following: Transfer the _dcount_ least significant digits of _rv_ to _ret_'s fractional part (note that _ret_'s fractional part stores digits from most to least significant),  then set _ret_'s integer part to floor(_rv_/_base_<sup>_dcount_</sup>), then return _ret_. (For example, if _base_ is 10, (_dcount_) is 4, and _rv_ is 342978, then _ret_'s fractional part is set to \[2, 9, 7, 8\], and _ret_'s integer part is set to 34.)
8. If _rvlower_ is greater than _upper_ or if _rvupper_ is less than _lower_, go to step 4.
9. Multiply _rv_ and _ddc_ each by _base_, then add 1 to _dcount_, then add a digit chosen uniformly at random to _rv_, then go to step 7.

<a id=Using_the_Arithmetic_Algorithms></a>
### Using the Arithmetic Algorithms

The algorithms given above for addition and multiplication are useful for scaling and shifting PSRNs.  For example, they can transform a normally-distributed PSRN into one with an arbitrary mean and standard deviation (by first multiplying the PSRN by the standard deviation, then adding the mean).  Here is a sketch of a procedure that achieves this, given two parameters, _location_ and _scale_, that are both rational numbers.

1. Generate a uniform PSRN, then transform it into a random number of the desired distribution via an algorithm that employs rejection from the uniform distribution (such as Karney's algorithm for the standard normal distribution (Karney 2014)<sup>[**(1)**](#Note1)</sup>)).  This procedure won't work for exponential PSRNs (e-rands).
2. Run the **UniformMultiplyRational** algorithm to multiply the uniform PSRN by the rational parameter _scale_ to get a new uniform PSRN.
3. Run the **UniformAddRational** algorithm to add the new uniform PSRN and the rational parameter _location_ to get a third uniform PSRN.  Return this third PSRN.

Note that incorrect results may occur if the _same PSRN_ is used more than once in different runs of these addition and multiplication algorithms.  This is easy to see for the **UniformAddRational** or **UniformMultiplyRational** algorithm when it's called more than once with the same PSRN and the same rational number:  although the same random number ought to be returned each time, in reality different random numbers will be generated this way almost surely, especially when additional digits are sampled from them afterwards.

It might be believed that the issue just described could be solved by the algorithm below:

_Let  vec be the vector of rational numbers, and let vec\[i\] be the rational number at position i of the vector (positions start at 0)._

1. _Set i to 0, set **a** to the input PSRN, set num to vec\[i\], and set 'output' to an empty list._
2. _Set ret to the result of **UniformMultiplyRational** with the PSRN **a** and the rational number num._
3. _Add a pointer to ret to the list 'output'.  If vec\[i\] was the last number in the vector, stop this algorithm._
4. _Set **a** to point to ret, then add 1 to i, then set num to vec\[i\]/vec\[i&minus;1\]._

However, even this algorithm doesn't ensure that the output PSRNs will be exactly proportional to the same random number.  An example: Let **a** be the PSRN 0.... (or the interval \[0.0, 1.0\]), then let **b** be the result of **UniformMultiplyRational**(**a**, 1/2), then let **c** be the result of **UniformMultiplyRational**(**b**, 1/3).  One possible result for **b** is 0.41... and for **c** is 0.138.... Now we fill **a**, **b**, and **c** with uniform random bits.  Thus, as one possible result, **a** is now 0.13328133..., **b** is now 0.41792367..., and **c** is now 0.13860371....  Here, however, **c** divided by **b** is not exactly 1/3, although it's quite close, and **b** divided by **a** is far from 1/2 (especially since **a** was very coarse to begin with). Although we show PSRNs with decimal digits, the situation is worse with binary digits.

<a id=Building_Blocks></a>
## Building Blocks

This document relies on several building blocks described in this section.

One of them is the "geometric bag" technique by Flajolet and others (2010)<sup>[**(7)**](#Note7)</sup>, which generates heads or tails with a probability that is built up digit by digit.

<a id=SampleGeometricBag></a>
### SampleGeometricBag

The algorithm **SampleGeometricBag** returns 1 with a probability built up by a uniform PSRN.  (Flajolet et al., 2010)<sup>[**(7)**](#Note7)</sup> described an algorithm for the base-2 (binary) case, but that algorithm is difficult to apply to other digit bases.  Thus the following is a general version of the algorithm for any digit base.

1. Set _i_ to 0, and set **b** to a uniform PSRN with a positive sign and an integer part of 0.
2. If the item at position _i_ of the input PSRN's fractional part is unsampled (that is, not set to a digit), set the item at that position to a digit chosen uniformly at random, increasing the fractional part's capacity as necessary (positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.), and append the result to that fractional part's digit expansion.  Do the same for **b**.
3. Let _da_ be the digit at position _i_ of the input PSRN's fractional part, and let _db_ be the corresponding digit for **b**.  Return 0 if _da_ is less than _db_, or 1 if _da_ is greater than _db_.
5. Add 1 to _i_ and go to step 2.

For base 2, the following **SampleGeometricBag** algorithm can be used, which is closer to the one given in the Flajolet paper:

1.  Set _N_ to 0.
2.  With probability 1/2, go to the next step.  Otherwise, add 1 to _N_ and repeat this step. (When the algorithm moves to the next step, _N_ is a geometric(1/2) random number.)
3.  If the item at position _N_ in the uniform PSRN's fractional part (positions start at 0) is not set to a digit (e.g., 0 or 1 for base 2), set the item at that position to a digit chosen uniformly at random (e.g., either 0 or 1 for base 2), increasing the fractional part's capacity as necessary.  (As a result of this step, there may be "gaps" in the uniform PSRN where no digit was sampled yet.)
4.  Return the item at position _N_.

For more on why these two algorithms are equivalent, see the appendix.

**SampleGeometricBagComplement** is the same as the **SampleGeometricBag** algorithm, except the return value is 1 minus the original return value.  The result is that if **SampleGeometricBag** outputs 1 with probability _U_, **SampleGeometricBagComplement** outputs 1 with probability 1 &minus; _U_.

<a id=FillGeometricBag></a>
### FillGeometricBag

**FillGeometricBag** takes a uniform PSRN and generates a number whose fractional part has `p` digits as follows:

1. For each position in \[0, `p`), if the item at that position in the uniform PSRN's fractional part is unsampled, set the item there to a digit chosen uniformly at random (e.g., either 0 or 1 for binary), increasing the fractional part's capacity as necessary. (Positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.  See also (Oberhoff 2018, sec. 8)<sup>[**(12)**](#Note12)</sup>.)
2. Let `sign` be -1 if the PSRN's sign is negative, or 1 otherwise; let `ipart` be the PSRN's integer part; and let `bag` be the PSRN's fractional part.  Take the first `p` digits of `bag` and return `sign` * (`ipart` + &Sigma;<sub>_i_=0, ..., `p`&minus;1</sub> bag[_i_] * _b_<sup>&minus;_i_&minus;1</sup>), where _b_ is the base, or radix.

After step 2, if it somehow happens that digits beyond `p` in the PSRN's fractional part were already sampled (that is, they were already set to a digit), then the implementation could choose instead to fill all unsampled digits between the first and the last set digit and return the full number, optionally rounding it to a number whose fractional part has `p` digits, with a rounding mode of choice. (For example, if `p` is 4, _b_ is 10, and the PSRN is 0.3437500... or 0.3438500..., it could use a round-to-nearest mode to round the PSRN to the number 0.3438 or 0.3439, respectively; because this is a PSRN with an "infinite" but unsampled digit expansion, there is no tie-breaking such as "ties to even" applied here.)

<a id=kthsmallest></a>
### kthsmallest

The **kthsmallest** method generates the 'k'th smallest 'bitcount'-digit uniform random number out of 'n' of them (also known as the 'n'th _order statistic_), is also relied on by this beta sampler.  It is used when both `a` and `b` are integers, based on the known property that a beta random variable in this case is the `a`th smallest uniform (0, 1) random number out of `a + b - 1` of them (Devroye 1986, p. 431)<sup>[**(14)**](#Note14)</sup>.

**kthsmallest**, however, doesn't simply generate 'n' 'bitcount'-digit numbers and then sort them.  Rather, it builds up their digit expansions digit by digit, via PSRNs.    It uses the observation that (in the binary case) each uniform (0, 1) random number is equally likely to be less than half or greater than half; thus, the number of uniform numbers that are less than half vs. greater than half follows a binomial(n, 1/2) distribution (and of the numbers less than half, say, the less-than-one-quarter vs. greater-than-one-quarter numbers follows the same distribution, and so on).    Thanks to this observation, the algorithm can generate a sorted sample "on the fly".  A similar observation applies to other bases than base 2 if we use the multinomial distribution instead of the binomial distribution.  I am not aware of any other article or paper (besides one by me) that describes the **kthsmallest** algorithm given here.

The algorithm is as follows:

1. Create `n` uniform PSRNs with positive sign and an integer part of 0.
2. Set `index` to 1.
3. If `index <= k` and `index + n >= k`:
    1. Generate **v**, a multinomial random vector with _b_ probabilities equal to 1/_b_, where _b_ is the base, or radix (for the binary case, _b_ = 2, so this is equivalent to generating `LC` = binomial(`n`, 0.5) and setting **v** to {`LC`, `n - LC`}).
    2. Starting at `index`, append the digit 0 to the first **v**\[0\] PSRNs, a 1 digit to the next **v**\[1\] PSRNs, and so on to appending a _b_ &minus; 1 digit to the last **v**\[_b_ &minus; 1\] PSRNs (for the binary case, this means appending a 0 bit to the first `LC` PSRNs and a 1 bit to the next `n - LC` PSRNs).
    3. For each integer _i_ in \[0, _b_): If **v**\[_i_\] > 1, repeat step 3 and these substeps with `index` = `index` + &Sigma;<sub>_j_=0, ..., _i_&minus;1</sub> **v**\[_j_\] and `n` = **v**\[_i_\]. (For the binary case, this means: If `LC > 1`, repeat step 3 and these substeps with the same `index` and `n = LC`; then, if `n - LC > 1`, repeat step 3 and these substeps with `index = index + LC`, and `n = n - LC`).
4. Take the `k`th PSRN (starting at 1), then optionally fill it with uniform random digits as necessary to give its fractional part `bitcount` many digits (similarly to **FillGeometricBag** above), then return that number.  (Note that the beta sampler  described later chooses to fill the PSRN this way via this algorithm.)

<a id=Power_of_Uniform_Sub_Algorithm></a>
### Power-of-Uniform Sub-Algorithm

The power-of-uniform sub-algorithm is used for certain cases of the beta sampler below.  It returns _U_<sup>_px_/_py_</sup>, where _U_ is a uniform random number in the interval \[0, 1\] and _px_/_py_ is greater than 1, but unlike the naïve algorithm it supports an arbitrary precision, uses only random bits, and avoids floating-point arithmetic.  It also uses a _complement_ flag to determine whether to return 1 minus the result.

It makes use of a number of algorithms as follows:

- It uses an algorithm for [**sampling unbounded monotone PDFs**](https://peteroupc.github.io/unbounded.html), which in turn is similar to the inversion-rejection algorithm in (Devroye 1986, ch. 7, sec. 4.4)<sup>[**(14)**](#Note14)</sup>.  This is needed because when _px_/_py_ is greater than 1, the distribution of _U_<sup>_px_/_py_</sup> has the PDF `(py/px) / pow(U, 1-py/px)`, which has an unbounded peak at 0.
- It uses a number of Bernoulli factory algorithms, including **SampleGeometricBag** and some algorithms described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)".

However, this algorithm currently only supports generating a PSRN with base-2 (binary) digits in its fractional part.

The power-of-uniform algorithm is as follows:

1. Set _i_ to 1.
2. Call the **algorithm for (_a_/_b_)<sup>_x_/_y_</sup>** described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", with parameters `a = 1, b = 2, x = py, y = px`.  If the call returns 1 and _i_ is less than _n_, add 1 to _i_ and repeat this step.  If the call returns 1 and _i_ is _n_ or greater, return 1 if the _complement_ flag is 1 or 0 otherwise (or return a uniform PSRN with a positive sign, an integer part of 0, and a fractional part filled with exactly _n_ ones or zeros, respectively).
3. As a result, we will now sample a number in the interval \[2<sup>&minus;_i_</sup>, 2<sup>&minus;(_i_ &minus; 1)</sup>).  We now have to generate a uniform random number _X_ in this interval, then accept it with probability (_py_ / (_px_ * 2<sup>_i_</sup>)) / _X_<sup>1 &minus; _py_ / _px_</sup>; the 2<sup>_i_</sup> in this formula is to help avoid very low probabilities for sampling purposes.  The following steps will achieve this without having to use floating-point arithmetic.
4. Create a positive-sign zero-integer-part uniform PSRN, then create a _geobag_ input coin that returns the result of **SampleGeometricBag** on that PSRN.
5. Create a _powerbag_ input coin that does the following: "Call the  **algorithm for _&lambda;_<sup>_x_/_y_</sup>**, described in '[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html#lambda__x___y)', using the _geobag_ input coin and with _x_/_y_ = 1 &minus; _py_ / _px_, and return the result."
6. Append _i_ &minus; 1 zero-digits followed by a single one-digit to the PSRN's fractional part.  This will allow us to sample a uniform random number limited to the interval mentioned earlier.
7. Call the **algorithm for ϵ / λ**, described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html#x03F5_lambda)", using the _powerbag_ input coin (which represents _b_) and with ϵ = _py_/(_px_ * 2<sup>_i_</sup>) (which represents _a_), thus returning 1 with probability _a_/_b_.  If the call returns 1, the PSRN was accepted, so do the following:
    1. If the _complement_ flag is 1, make each zero-digit in the PSRN's fractional part a one-digit and vice versa.
    2. Optionally, fill the PSRN with uniform random digits as necessary to give its fractional part _n_ digits (similarly to **FillGeometricBag** above), where _n_ is a precision parameter.  Then, return the PSRN.
8. If the call to the algorithm for ϵ / λ returns 0, remove all but the first _i_ digits from the PSRN's fractional part, then go to step 7.

<a id=Algorithms_for_the_Beta_and_Exponential_Distributions></a>
## Algorithms for the Beta and Exponential Distributions

&nbsp;

<a id=Beta_Distribution></a>
### Beta Distribution

All the building blocks are now in place to describe a _new_ algorithm to sample the beta distribution, described as follows.  It takes three parameters: _a_ >= 1 and _b_ >= 1 (or one parameter is 1 and the other is greater than 0 in the binary case) are the parameters to the beta distribution, and _p_ > 0 is a precision parameter.

1. Special cases:
    - If _a_ = 1 and _b_ = 1, return a positive-sign zero-integer-part uniform PSRN.
    - If _a_ and _b_ are both integers, return the result of **kthsmallest** with `n = a - b + 1` and `k = a`
    - In the binary case, if _a_ is 1 and _b_ is less than 1, call the **power-of-uniform sub-algorithm** described below, with _px_/_py_ = 1/_b_, and the _complement_ flag set to 1, and return the result of that algorithm as is (without filling it as described in substep 7.2 of that algorithm).
    - In the binary case, if _b_ is 1 and _a_ is less than 1, call the **power-of-uniform sub-algorithm** described below, with _px_/_py_ = 1/_a_, and the _complement_ flag set to 0, and return the result of that algorithm as is (without filling it as described in substep 7.2 of that algorithm).
2. If _a_ > 2 and _b_ > 2, do the following steps, which split _a_ and _b_ into two parts that are faster to simulate (and implement the generalized rejection strategy in (Devroye 1986, top of page 47)<sup>[**(14)**](#Note14)</sup>):
    1. Set _aintpart_ to floor(_a_) &minus; 1, set _bintpart_ to floor(_b_) &minus; 1, set _arest_ to _a_ &minus; _aintpart_, and set _brest_ to _b_ &minus; _bintpart_.
    2. Run this algorithm recursively, but with _a_ = _aintpart_ and _b_ = _bintpart_. Set _bag_ to the PSRN created by the run.
    3. Create an input coin _geobag_ that returns the result of **SampleGeometricBag** using the given PSRN.  Create another input coin _geobagcomp_ that returns the result of **SampleGeometricBagComplement** using the given PSRN.
    4. Call the **algorithm for _&lambda;_<sup>_x_/_y_</sup>**, described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", using the _geobag_ input coin and _x_/_y_ = _arest_/1, then call the same algorithm using the _geobagcomp_ input coin and _x_/_y_ = _brest_/1. If both calls return 1, return _bag_. Otherwise, go to substep 2.
3. Create an positive-sign zero-integer-part uniform PSRN.  Create an input coin _geobag_ that returns the result of **SampleGeometricBag** using the given PSRN.  Create another input coin _geobagcomp_ that returns the result of **SampleGeometricBagComplement** using the given PSRN.
4. Remove all digits from the PSRN's fractional part.  This will result in an "empty" uniform(0, 1) random number, _U_, for the following steps, which will accept _U_ with probability _U_<sup>a&minus;1</sup>*(1&minus;_U_)<sup>b&minus;1</sup>) (the proportional probability for the beta distribution), as _U_ is built up.
5. Call the **algorithm for _&lambda;_<sup>_x_/_y_</sup>**, described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", using the _geobag_ input coin and _x_/_y_ = _a_ &minus; 1)/1 (thus returning with probability _U_<sup>a&minus;1</sup>).  If the result is 0, go to step 4.
6. Call the same algorithm using the _geobagcomp_ input coin and _x_/_y_ = (_b_ &minus; 1)/1 (thus returning 1 with probability (1&minus;_U_)<sup>b&minus;1</sup>).  If the result is 0, go to step 4. (Note that this step and the previous step don't depend on each other and can be done in either order without affecting correctness, and this is taken advantage of in the Python code below.)
7. _U_ was accepted, so return the result of **FillGeometricBag**.

Once a PSRN is accepted by the steps above, optionally fill the unsampled digits of the PSRN's fractional part with uniform random digits as necessary to give the number a _p_-digit fractional part (similarly to **FillGeometricBag**), then return the resulting number.

> **Notes:**
>
> - A beta(1/_x_, 1) random number is the same as a uniform random number raised to the power of _x_.
> - For the beta distribution bigger `alpha` or `beta` is, the smaller the area of acceptance becomes (and the more likely random numbers get rejected by steps 5 and 6, raising its run-time).  This is because `max(u^(alpha-1)*(1-u)^(beta-1))`, the peak of the PDF, approaches 0 as the parameters get bigger.  To deal with this, step 2 was included, which under certain circumstances breaks the PDF into two parts that are relatively trivial to sample (in terms of bit complexity).

<a id=Exponential_Distribution></a>
### Exponential Distribution

We also have the necessary building blocks to describe how to sample e-rands.  As implemented in the Python code, an e-rand consists of five numbers: the first is a multiple of 1/(2<sup>_x_</sup>), the second is _x_, the third is the integer part (initially &minus;1 to indicate the integer part wasn't sampled yet), and the fourth and fifth are the _&lambda;_ parameter's numerator and denominator, respectively.  (Because exponential random numbers are always 0 or greater, the e-rand's sign is implicitly positive).

To sample bit _k_ after the binary point of an exponential random number with rate _&lambda;_ (where _k_ = 1 means the first digit after the point, _k_ = 2 means the second, etc.), call the **LogisticExp** algorithm with _x_ = _&lambda;_'s numerator, _y_ = _&lambda;_'s denominator, and _prec_ = _k_.

The **ExpRandLess** algorithm is a special case of the general **RandLess** algorithm given earlier.  It compares two e-rands **a** and **b** (and samples additional bits from them as necessary) and returns 1 if **a** turns out to be less than **b**, or 0 otherwise. (Note that **a** and **b** are allowed to have different _&lambda;_ parameters.)

1. If **a**'s integer part wasn't sampled yet, call the **algorithm for exp(&minus;_x_/_y_)** with _x_ = _&lambda;_'s numerator and _y_ = _&lambda;_'s denominator, until the call returns 0, then set the integer part to the number of times 1 was returned this way.  Do the same for **b**.
2. Return 1 if **a**'s integer part is less than **b**'s, or 0 if **a**'s integer part is greater than **b**'s.
3. Set _i_ to 0.
4. If **a**'s fractional part has _i_ or fewer bits, call the **LogisticExp** algorithm with _x_ = _&lambda;_'s numerator, _y_ = _&lambda;_'s denominator, and _prec_ = _i_ + 1, and append the result to that fractional part's binary expansion.  (For example, if the implementation stores the binary expansion as a packed integer and a size, the implementation can shift the packed integer by 1, add the result of the algorithm to that integer, then add 1 to the size.) Do the same for **b**.
5. Return 1 if **a**'s fractional part is less than **b**'s, or 0 if **a**'s fractional part is greater than **b**'s.
6. Add 1 to _i_ and go to step 4.

The **ExpRandFill** algorithm takes an e-rand and generates a number whose fractional part has `p` digits as follows:

1. For each position _i_ in \[0, `p`), if the item at that position in the e-rand's fractional part is unsampled, call the **LogisticExp** algorithm with _x_ = _&lambda;_'s numerator, _y_ = _&lambda;_'s denominator, and _prec_ = _i_ + 1, and set the item at position _i_ to the result (which will be either 0 or 1), increasing the fractional part's capacity as necessary. (Bit positions start at 0 where 0 is the most significant bit after the point, 1 is the next, etc.  See also (Oberhoff 2018, sec. 8)<sup>[**(12)**](#Note12)</sup>.)
2. Let `sign` be -1 if the e-rand's sign is negative, or 1 otherwise; let `ipart` be the e-rand's integer part; and let `bag` be the PSRN's fractional part.  Take the first `p` digits of `bag` and return `sign` * (`ipart` + &Sigma;<sub>_i_=0, ..., `p`&minus;1</sub> bag[_i_] * 2<sup>&minus;_i_&minus;1</sup>).

See the discussion in **FillGeometricBag** for advice on how to handle the case when if it somehow happens that bits beyond `p` in the PSRN's fractional part were already sampled (that is, they were already set to a digit) after step 2 of this algorithm.

Here is a third algorithm that generates a _uniform PSRN_, rather than an e-rand, that follows the exponential distribution.   In the algorithm, the rate _&lambda;_ is given as a rational number greater than 0.  The method is based on von Neumann's algorithm (von Neumann 1951)<sup>[**(9)**](#Note9)</sup>.

1. Set _recip_ to 1/_&lambda;_, and set _highpart_ to 0.
2. Set _u_ to the result of **RandUniformFromReal** with the parameter _recip_.
3. Set _val_ to point to the same value as _u_, and set _accept_ to 1.
4. Set _v_ to the result of **RandUniformFromReal** with the parameter _recip_.
5. Run the **URandLess** algorithm on _u_ and _v_, in that order.  If the call returns 0, set _u_ to _v_, then set _accept_ to 1 minus _accept_, then go to step 4.
6. If _accept_ is 1, add _highpart_ to _val_ via the **UniformAddRational** algorithm given earlier, then return _val_.
7. Add _recip_ to _highpart_ and go to step 2.

The following alternative version of the previous algorithm includes Karney's improvement to the von Neumann algorithm (Karney 2014)<sup>[**(1)**](#Note1)</sup>, namely a so-called "early rejection step". The algorithm here allows an arbitrary rate parameter (_&lambda;_), given as a rational number greater than 0, unlike with the von Neumann and Karney algorithms, where _&lambda;_ is 1.

1. Set _recip_ to 1/_&lambda;_, and set _highpart_ to 0.
2. Set _u_ to the result of **RandUniformFromReal** with the parameter _recip_.
3. Run the **URandLessThanReal** algorithm on _u_ with the parameter _recip_/2.  If the call returns 0, add _recip_/2 to _highpart_ and go to step 2.  (This is Karney's "early rejection step", where the parameter is 1/2 when _&lambda;_ is 1.  However, Fan et al. (2019)<sup>[**(19)**](#Note19)</sup> point out that the parameter 1/2 in Karney's "early rejection step" is not optimal.)
4. Set _val_ to point to the same value as _u_, and set _accept_ to 1.
5. Set _v_ to the result of **RandUniformFromReal** with the parameter _recip_.
6. Run the **URandLess** algorithm on _u_ and _v_, in that order.  If the call returns 0, set _u_ to _v_, then set _accept_ to 1 minus _accept_, then go to step 5.
7. If _accept_ is 1, add _highpart_ to _val_ via the **UniformAddRational** algorithm given earlier, then return _val_.
8. Add **_recip_/2** to _highpart_ and go to step 2.

<a id=Sampler_Code></a>
## Sampler Code

The following Python code implements the beta sampler just described.  It relies on two Python modules I wrote:

- "[**bernoulli.py**](https://github.com/peteroupc/peteroupc.github.io/blob/master/bernoulli.py)", which collects a number of Bernoulli factories, some of which are relied on by the code below.
- "[**randomgen.py**](https://github.com/peteroupc/peteroupc.github.io/blob/master/randomgen.py)", which collects a number of random number generation methods, including `kthsmallest`, as well as the `RandomGen` class.

Note that the code uses floating-point arithmetic only to convert the result of the sampler to a convenient form, namely a floating-point number.

This code is far from fast, though, at least in Python.

```
import math
import random
import bernoulli
from randomgen import RandomGen
from fractions import Fraction

def _toreal(ret, precision):
        # NOTE: Although we convert to a floating-point
        # number here, this is not strictly necessary and
        # is merely for convenience.
        return ret*1.0/(1<<precision)

def _urand_to_geobag(bag):
  return [(bag[0]>>(bag[1]-1-i))&1 for i in range(bag[1])]

def _power_of_uniform_greaterthan1(bern, power, complement=False, precision=53):
    return bern.fill_geometric_bag(
        _power_of_uniform_greaterthan1_geobag(bern, power, complement), precision
    )

def _power_of_uniform_greaterthan1_geobag(bern, power, complement=False, precision=53):
   if power<1:
     raise ValueError("Not supported")
   if power==1:
        return []  # Empty uniform random number
   i=1
   powerfrac=Fraction(power)
   powerrest=Fraction(1) - Fraction(1)/powerfrac
   # Choose an interval
   while bern.zero_or_one_power_ratio(1,2,
         powerfrac.denominator,powerfrac.numerator) == 1:
      i+=1
   epsdividend = Fraction(1)/(powerfrac * 2**i)
   # -- A choice for epsdividend which makes eps_div
   # -- much faster, but this will require floating-point arithmetic
   # -- to calculate "**powerrest", which is not the focus
   # -- of this article.
   # probx=((2.0**(-i-1))**powerrest)
   # epsdividend=Fraction(probx)*255/256
   bag=[]
   gb=lambda: bern.geometric_bag(bag)
   bf =lambda: bern.power(gb, powerrest.numerator, powerrest.denominator)
   while True:
      # Limit sampling to the chosen interval
      bag.clear()
      for k in range(i-1):
         bag.append(0)
      bag.append(1)
      # Simulate epsdividend / x**(1-1/power)
      if bern.eps_div(bf, epsdividend) == 1:
          # Flip all bits if complement is true
          bag=[x if x==None else 1-x for x in bag] if complement else bag
          return bag

def powerOfUniform(b, px, py, precision=53):
        # Special case of beta, returning power of px/py
        # of a uniform random number, provided px/py
        # is in (0, 1].
        return betadist(b, py, px, 1, 1, precision)

    return b.fill_geometric_bag(
        betadist_geobag(b, ax, ay, bx, by), precision
    )

def betadist_geobag(b, ax=1, ay=1, bx=1, by=1):
    """ Generates a beta-distributed random number with arbitrary
          (user-defined) precision.  Currently, this sampler only works if (ax/ay) and
          (bx/by) are both 1 or greater, or if one of these parameters is
         1 and the other is less than 1.
         - b: Bernoulli object (from the "bernoulli" module).
         - ax, ay: Numerator and denominator of first shape parameter.
         - bx, by: Numerator and denominator of second shape parameter.
         - precision: Number of bits after the point that the result will contain.
        """
    # Beta distribution for alpha>=1 and beta>=1
    bag = []
    afrac=(Fraction(ax) if ay==1 else Fraction(ax, ay))
    bfrac=(Fraction(bx) if by==1 else Fraction(bx, by))
    bpower = bfrac - 1
    apower = afrac - 1
    # Special case for a=b=1
    if bpower == 0 and apower == 0:
        return bag
    # Special case if a=1
    if apower == 0 and bpower < 0:
        return _power_of_uniform_greaterthan1_geobag(b, Fraction(by, bx), True)
    # Special case if b=1
    if bpower == 0 and apower < 0:
        return _power_of_uniform_greaterthan1_geobag(b, Fraction(ay, ax), False)
    if apower <= -1 or bpower <= -1:
        raise ValueError
    # Special case if a and b are integers
    if int(bpower) == bpower and int(apower) == apower:
        a = int(afrac)
        b = int(bfrac)
        return _urand_to_geobag(randomgen.RandomGen().kthsmallest_urand(a + b - 1, a))
    # Split a and b into two parts which are relatively trivial to simulate
    if bfrac > 2 and afrac > 2:
        bintpart = int(bfrac) - 1
        aintpart = int(afrac) - 1
        brest = bfrac - bintpart
        arest = afrac - aintpart
        # Generalized rejection method, p. 47
        while True:
           bag = betadist_geobag(b, aintpart, 1, bintpart, 1)
           gb = lambda: b.geometric_bag(bag)
           gbcomp = lambda: b.geometric_bag(bag) ^ 1
           if (b.power(gbcomp, brest)==1 and \
              b.power(gb, arest)==1):
              return bag
    # Create a "geometric bag" to hold a uniform random
    # number (U), described by Flajolet et al. 2010
    gb = lambda: b.geometric_bag(bag)
    # Complement of "geometric bag"
    gbcomp = lambda: b.geometric_bag(bag) ^ 1
    bp1=lambda: (1 if b.power(gbcomp, bpower)==1 and \
            b.power(gb, apower)==1 else 0)
    while True:
        # Create a uniform random number (U) bit-by-bit, and
        # accept it with probability U^(a-1)*(1-U)^(b-1), which
        # is the unnormalized PDF of the beta distribution
        bag.clear()
        if bp1() == 1:
            # Accepted
            return ret

def _fill_geometric_bag(b, bag, precision):
        ret=0
        lb=min(len(bag), precision)
        for i in range(lb):
           if i>=len(bag) or bag[i]==None:
              ret=(ret<<1)|b.randbit()
           else:
              ret=(ret<<1)|bag[i]
        if len(bag) < precision:
           diff=precision-len(bag)
           ret=(ret << diff)|random.randint(0,(1 << diff)-1)
        # Now we have a number that is a multiple of
        # 2^-precision.
        return _toreal(ret, precision)
```

The following Python code implements the exponential sampler described earlier.  In the Python code below, note that `zero_or_one` uses `random.randint` which does not necessarily use only random bits, even though it's called only to return either zero or one.

```
import random

def logisticexp(ln, ld, prec):
        """ Returns 1 with probability 1/(1+exp(ln/(ld*2^prec))). """
        denom=ld*2**prec
        while True:
           if zero_or_one(1, 2)==0: return 0
           if zero_or_one_exp_minus(ln, denom) == 1: return 1

def exprandnew(lamdanum=1, lamdaden=1):
     """ Returns an object to serve as a partially-sampled
          exponential random number with the given
          rate 'lamdanum'/'lamdaden'.  The object is a list of five numbers
          as given in the prose.  Default for 'lamdanum'
          and 'lamdaden' is 1.
          The number created by this method will be "empty"
          (no bits sampled yet).
          """
     return [0, 0, -1, lamdanum, lamdaden]

def exprandfill(a, bits):
    """ Fills the unsampled bits of the given exponential random number
           'a' as necessary to make a number whose fractional part
           has 'bits' many bits.  If the number's fractional part already has
           that many bits or more, the number is rounded using the round-to-nearest,
           ties to even rounding rule.  Returns the resulting number as a
           multiple of 2^'bits'. """
    # Fill the integer if necessary.
    if a[2]==-1:
        a[2]=0
        while zero_or_one_exp_minus(a[3], a[4]) == 1:
            a[2]+=1
    if a[1] > bits:
        # Shifting bits beyond the first excess bit.
        aa = a[0] >> (a[1] - bits - 1)
        # Check the excess bit; if odd, round up.
        ret=aa >> 1 if (aa & 1) == 0 else (aa >> 1) + 1
        return ret|(a[2]<<bits)
    # Fill the fractional part if necessary.
    while a[1] < bits:
       index = a[1]
       a[1]+=1
       a[0]=(a[0]<<1)|logisticexp(a[3], a[4], index+1)
    return a[0]|(a[2]<<bits)

def exprandless(a, b):
        """ Determines whether one partially-sampled exponential number
           is less than another; returns
           true if so and false otherwise.  During
           the comparison, additional bits will be sampled in both numbers
           if necessary for the comparison. """
        # Check integer part of exponentials
        if a[2] == -1:
            a[2] = 0
            while zero_or_one_exp_minus(a[3], a[4]) == 1:
                a[2] += 1
        if b[2] == -1:
            b[2] = 0
            while zero_or_one_exp_minus(b[3], b[4]) == 1:
                b[2] += 1
        if a[2] < b[2]:
            return True
        if a[2] > b[2]:
            return False
        index = 0
        while True:
            # Fill with next bit in a's exponential number
            if a[1] < index:
                raise ValueError
            if b[1] < index:
                raise ValueError
            if a[1] <= index:
                a[1] += 1
                a[0] = logisticexp(a[3], a[4], index + 1) | (a[0] << 1)
            # Fill with next bit in b's exponential number
            if b[1] <= index:
                b[1] += 1
                b[0] = logisticexp(b[3], b[4], index + 1) | (b[0] << 1)
            aa = (a[0] >> (a[1] - 1 - index)) & 1
            bb = (b[0] >> (b[1] - 1 - index)) & 1
            if aa < bb:
                return True
            if aa > bb:
                return False
            index += 1

def zero_or_one(px, py):
        """ Returns 1 at probability px/py, 0 otherwise.
            Uses Bernoulli algorithm from Lumbroso appendix B,
            with one exception noted in this code. """
        if py <= 0:
            raise ValueError
        if px == py:
            return 1
        z = px
        while True:
            z = z * 2
            if z >= py:
                if random.randint(0,1) == 0:
                    return 1
                z = z - py
            # Exception: Condition added to help save bits
            elif z == 0: return 0
            else:
                if random.randint(0,1) == 0:
                   return 0

def zero_or_one_exp_minus(x, y):
        """ Generates 1 with probability exp(-px/py); 0 otherwise.
               Reference: Canonne et al. 2020. """
        if y <= 0 or x < 0:
            raise ValueError
        if x==0: return 1
        if x > y:
            xf = int(x / y)  # Get integer part
            x = x % y  # Reduce to fraction
            if x > 0 and zero_or_one_exp_minus(x, y) == 0:
                return 0
            for i in range(xf):
                if zero_or_one_exp_minus(1, 1) == 0:
                    return 0
            return 1
        r = 1
        ii = 1
        while True:
            if zero_or_one(x, y*ii) == 0:
                return r
            r=1-r
            ii += 1

# Example of use
def exprand(lam):
   return exprandfill(exprandnew(lam),53)*1.0/(1<<53)

```

In the following Python code, `multiply_psrns` and `add_psrns` are methods to generate the result of multiplying or adding two uniform PSRNs, respectively.

```
def multiply_psrns(psrn1, psrn2, digits=2):
    """ Multiplies two uniform partially-sampled random numbers.
        psrn1: List containing the sign, integer part, and fractional part
            of the first PSRN.  Fractional part is a list of digits
            after the point, starting with the first.
        psrn2: List containing the sign, integer part, and fractional part
            of the second PSRN.
        digits: Digit base of PSRNs' digits.  Default is 2, or binary. """
    if psrn1[0] == None or psrn1[1] == None or psrn2[0] == None or psrn2[1] == None:
        raise ValueError
    for i in range(len(psrn1[2])):
        psrn1[2][i] = (
            random.randint(0, digits - 1) if psrn1[2][i] == None else psrn1[2][i]
        )
    for i in range(len(psrn2[2])):
        psrn2[2][i] = (
            random.randint(0, digits - 1) if psrn2[2][i] == None else psrn2[2][i]
        )
    while len(psrn1[2]) < len(psrn2[2]):
        psrn1[2].append(random.randint(0, digits - 1))
    while len(psrn1[2]) > len(psrn2[2]):
        psrn2[2].append(random.randint(0, digits - 1))
    digitcount = len(psrn1[2])
    if len(psrn2[2]) != digitcount:
        raise ValueError
    # Perform multiplication
    frac1 = psrn1[1]
    frac2 = psrn2[1]
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn1[2][i]
    for i in range(digitcount):
        frac2 = frac2 * digits + psrn2[2][i]
    if frac1 == 0 and frac2 == 0:
        while True:
            d1=random.randint(0, digits - 1)
            d2=random.randint(0, digits - 1)
            frac1=frac1*digits+d1
            frac2=frac2*digits+d2
            digitcount+=1
            if d1!=0 or d2!=0: break
    small = frac1 * frac2
    mid1 = frac1 * (frac2 + 1)
    mid2 = (frac1 + 1) * frac2
    large = (frac1 + 1) * (frac2 + 1)
    midmin = min(mid1, mid2)
    midmax = max(mid1, mid2)
    cpsrn = [1, 0, [0 for i in range(digitcount * 2)]]
    cpsrn[0] = psrn1[0] * psrn2[0]
    while True:
        rv = random.randint(0, large - small - 1)
        if rv < midmin - small:
            # Left side of product density; rising triangular
            pw = rv
            newdigits = 0
            b = midmin - small
            y = random.randint(0, b - 1)
            while True:
                if y < pw:
                    # Success
                    sret = small * (digits ** newdigits) + pw
                    for i in range(digitcount * 2 + newdigits):
                        idx = (digitcount * 2 + newdigits) - 1 - i
                        while idx >= len(cpsrn[2]):
                            cpsrn[2].append(None)
                        cpsrn[2][idx] = sret % digits
                        sret //= digits
                    cpsrn[1] = sret
                    return cpsrn
                elif y > pw + 1:  # Greater than upper bound
                    # Rejected
                    break
                pw = pw * digits + random.randint(0, digits - 1)
                y = y * digits + random.randint(0, digits - 1)
                b *= digits
                newdigits += 1
        elif rv >= midmax - small:
            # Right side of product density; falling triangular
            pw = rv - (midmax - small)
            newdigits = 0
            b = large - midmax
            y = random.randint(0, b - 1)
            while True:
                lowerbound = b - 1 - pw
                if y < lowerbound:
                    # Success
                    sret = midmax * (digits ** newdigits) + pw
                    for i in range(digitcount * 2 + newdigits):
                        idx = (digitcount * 2 + newdigits) - 1 - i
                        while idx >= len(cpsrn[2]):
                            cpsrn[2].append(None)
                        cpsrn[2][idx] = sret % digits
                        sret //= digits
                    cpsrn[1] = sret
                    return cpsrn
                elif y > lowerbound + 1:  # Greater than upper bound
                    # Rejected
                    break
                pw = pw * digits + random.randint(0, digits - 1)
                y = y * digits + random.randint(0, digits - 1)
                b *= digits
                newdigits += 1
        else:
            # Middle, or uniform, part of product density
            sret = small + rv
            for i in range(digitcount * 2):
                cpsrn[2][digitcount * 2 - 1 - i] = sret % digits
                sret //= digits
            cpsrn[1] = sret
            return cpsrn

def multiply_psrn_by_fraction(psrn1, fraction, digits=2):
    """ Multiplies a partially-sampled random number by a fraction.
        psrn1: List containing the sign, integer part, and fractional part
            of the first PSRN.  Fractional part is a list of digits
            after the point, starting with the first.
        fraction: Fraction to multiply by.
        digits: Digit base of PSRNs' digits.  Default is 2, or binary. """
    if psrn1[0] == None or psrn1[1] == None:
        raise ValueError
    fraction = Fraction(fraction)
    for i in range(len(psrn1[2])):
        psrn1[2][i] = (
            random.randint(0, digits - 1) if psrn1[2][i] == None else psrn1[2][i]
        )
    digitcount = len(psrn1[2])
    # Perform multiplication
    frac1 = psrn1[1]
    fracsign = -1 if fraction < 0 else 1
    absfrac = abs(fraction)
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn1[2][i]
    # Result is "inexact", and "small" expresses a lower bound
    while True:
        dcount = digitcount
        ddc = digits ** dcount
        small1 = Fraction(frac1, ddc) * absfrac
        large1 = Fraction(frac1 + 1, ddc) * absfrac
        dc = int(small1 * ddc)
        dc2 = int(large1 * ddc) + 1
        rv = random.randint(dc, dc2 - 1)
        while True:
            rvsmall = Fraction(rv, ddc)
            rvlarge = Fraction(rv + 1, ddc)
            if rvsmall >= small1 and rvlarge < large1:
                cpsrn = [1, 0, [0 for i in range(dcount)]]
                cpsrn[0] = psrn1[0] * fracsign
                sret = rv
                for i in range(dcount):
                    cpsrn[2][dcount - 1 - i] = sret % digits
                    sret //= digits
                cpsrn[1] = sret
                return cpsrn
            elif rvsmall > large1 or rvlarge < small1:
                break
            else:
                rv = rv * digits + random.randint(0, digits - 1)
                dcount += 1
                ddc *= digits

def add_psrns(psrn1, psrn2, digits=2):
    """ Adds two uniform partially-sampled random numbers.
        psrn1: List containing the sign, integer part, and fractional part
            of the first PSRN.  Fractional part is a list of digits
            after the point, starting with the first.
        psrn2: List containing the sign, integer part, and fractional part
            of the second PSRN.
        digits: Digit base of PSRNs' digits.  Default is 2, or binary. """
    if psrn1[0] == None or psrn1[1] == None or psrn2[0] == None or psrn2[1] == None:
        raise ValueError
    for i in range(len(psrn1[2])):
        psrn1[2][i] = (
            random.randint(0, digits - 1) if psrn1[2][i] == None else psrn1[2][i]
        )
    for i in range(len(psrn2[2])):
        psrn2[2][i] = (
            random.randint(0, digits - 1) if psrn2[2][i] == None else psrn2[2][i]
        )
    while len(psrn1[2]) < len(psrn2[2]):
        psrn1[2].append(random.randint(0, digits - 1))
    while len(psrn1[2]) > len(psrn2[2]):
        psrn2[2].append(random.randint(0, digits - 1))
    digitcount = len(psrn1[2])
    if len(psrn2[2]) != digitcount:
        raise ValueError
    # Perform addition
    frac1 = psrn1[1]
    frac2 = psrn2[1]
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn1[2][i]
    for i in range(digitcount):
        frac2 = frac2 * digits + psrn2[2][i]
    small = frac1 * psrn1[0] + frac2 * psrn2[0]
    mid1 = frac1 * psrn1[0] + (frac2 + 1) * psrn2[0]
    mid2 = (frac1 + 1) * psrn1[0] + frac2 * psrn2[0]
    large = (frac1 + 1) * psrn1[0] + (frac2 + 1) * psrn2[0]
    minv = min(small, mid1, mid2, large)
    maxv = max(small, mid1, mid2, large)
    # Difference is expected to be a multiple of two
    if abs(maxv - minv) % 2 != 0:
        raise ValueError
    vs = [small, mid1, mid2, large]
    vs.sort()
    midmin = vs[1]
    midmax = vs[2]
    while True:
        rv = random.randint(0, maxv - minv - 1)
        if rv < 0:
            raise ValueError
        side = 0
        start = minv
        if rv < midmin - minv:
            # Left side of sum density; rising triangular
            side = 0
            start = minv
        elif rv >= midmax - minv:
            # Right side of sum density; falling triangular
            side = 1
            start = midmax
        else:
            # Middle, or uniform, part of sum density
            sret = minv + rv
            cpsrn = [1, 0, [0 for i in range(digitcount)]]
            if sret < 0:
                sret += 1
                cpsrn[0] = -1
            sret = abs(sret)
            for i in range(digitcount):
                cpsrn[2][digitcount - 1 - i] = sret % digits
                sret //= digits
            cpsrn[1] = sret
            return cpsrn
        if side == 0:  # Left side
            pw = rv
            b = midmin - minv
        else:
            pw = rv - (midmax - minv)
            b = maxv - midmax
        newdigits = 0
        y = random.randint(0, b - 1)
        while True:
            lowerbound = pw if side == 0 else b - 1 - pw
            if y < lowerbound:
                # Success
                sret = start * (digits ** newdigits) + pw
                cpsrn = [1, 0, [0 for i in range(digitcount + newdigits)]]
                if sret < 0:
                    sret += 1
                    cpsrn[0] = -1
                sret = abs(sret)
                for i in range(digitcount + newdigits):
                    idx = (digitcount + newdigits) - 1 - i
                    while idx >= len(cpsrn[2]):
                        cpsrn[2].append(None)
                    cpsrn[2][idx] = sret % digits
                    sret //= digits
                cpsrn[1] = sret
                return cpsrn
            elif y > lowerbound + 1:  # Greater than upper bound
                # Rejected
                break
            pw = pw * digits + random.randint(0, digits - 1)
            y = y * digits + random.randint(0, digits - 1)
            b *= digits
            newdigits += 1

def add_psrn_and_fraction(psrn, fraction, digits=2):
    if psrn[0] == None or psrn[1] == None:
        raise ValueError
    fraction = Fraction(fraction)
    fracsign = -1 if fraction < 0 else 1
    absfrac = abs(fraction)
    origfrac = fraction
    isinteger = (absfrac.denominator == 1)
    # Special cases
    # positive+pos. integer or negative+neg. integer
    if ((fracsign < 0) == (psrn[0] < 0)) and isinteger and len(psrn[2]) == 0:
        return [fracsign, psrn[1] + int(absfrac), []]
    # PSRN has no fractional part, fraction is integer
    if isinteger and psrn[0] == 1 and psrn[1] == 0 and len(psrn[2]) == 0 and fracsign<0:
        return [fracsign, int(absfrac)-1, []]
    if isinteger and psrn[0] == 1 and psrn[1] == 0 and len(psrn[2]) == 0 and fracsign>0:
        return [fracsign, int(absfrac), []]
    if fraction == 0:  # Special case of 0
        return [psrn[0], psrn[1], [x for x in psrn[2]]]
    # End special cases
    for i in range(len(psrn[2])):
        psrn[2][i] = random.randint(0, digits - 1) if psrn[2][i] == None else psrn[2][i]
    digitcount = len(psrn[2])
    # Perform addition
    frac1 = psrn[1]
    frac2 = int(absfrac)
    fraction = absfrac - frac2
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn[2][i]
    for i in range(digitcount):
        digit = int(fraction * digits)
        fraction = (fraction * digits) - digit
        frac2 = frac2 * digits + digit
    ddc = digits ** digitcount
    small = Fraction(frac1 * psrn[0], ddc) + origfrac
    large = Fraction((frac1 + 1) * psrn[0], ddc) + origfrac
    minv = min(small, large)
    maxv = max(small, large)
    while True:
        newdigits = 0
        b = 1
        ddc = digits ** digitcount
        mind = int(minv * ddc)
        maxd = int(maxv * ddc)
        rvstart = mind - 1 if minv < 0 else mind
        rvend = maxd if maxv < 0 else maxd + 1
        rv = random.randint(0, rvend - rvstart - 1)
        rvs = rv + rvstart
        if rvs >= rvend:
            raise ValueError
        while True:
            rvstartbound = mind if minv < 0 else mind + 1
            rvendbound = maxd - 1 if maxv < 0 else maxd
            if rvs > rvstartbound and rvs < rvendbound:
                sret = rvs
                cpsrn = [1, 0, [0 for i in range(digitcount + newdigits)]]
                if sret < 0:
                    sret += 1
                    cpsrn[0] = -1
                sret = abs(sret)
                for i in range(digitcount + newdigits):
                    idx = (digitcount + newdigits) - 1 - i
                    cpsrn[2][idx] = sret % digits
                    sret //= digits
                cpsrn[1] = sret
                return cpsrn
            elif rvs <= rvstartbound:
                rvd = Fraction(rvs + 1, ddc)
                if rvd <= minv:
                    # Rejected
                    break
                else:
                    # print(["rvd",rv+rvstart,float(rvd),float(minv)])
                    newdigits += 1
                    ddc *= digits
                    rvstart *= digits
                    rvend *= digits
                    mind = int(minv * ddc)
                    maxd = int(maxv * ddc)
                    rv = rv * digits + random.randint(0, digits - 1)
                    rvs = rv + rvstart
            else:
                rvd = Fraction(rvs, ddc)
                if rvd >= maxv:
                    # Rejected
                    break
                else:
                    newdigits += 1
                    ddc *= digits
                    rvstart *= digits
                    rvend *= digits
                    mind = int(minv * ddc)
                    maxd = int(maxv * ddc)
                    rv = rv * digits + random.randint(0, digits - 1)
                    rvs = rv + rvstart
```

<a id=Exponential_Sampler_Extension></a>
### Exponential Sampler: Extension

The code above supports rational-valued _&lambda;_ parameters.  It can be extended to support any real-valued _&lambda;_ parameter greater than 0, as long as _&lambda;_ can be rewritten as the sum of one or more components whose fractional parts can each be simulated by a Bernoulli factory algorithm that outputs heads with probability equal to that fractional part.<sup>[**(20)**](#Note20)</sup>.

More specifically:

1. Decompose _&lambda;_ into _n_ > 0 positive components that sum to _&lambda;_.  For example, if _&lambda;_ = 3.5, it can be decomposed into only one component, 3.5 (whose fractional part is trivial to simulate), and if _&lambda;_ = &pi;, it can be decomposed into four components that are all (&pi; / 4), which has a not-so-trivial simulation described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)".
2. For each component _LC_\[_i_\] found this way, let _LI_\[_i_\] be floor(_LC_\[_i_\]) and let _LF_\[_i_\] be _LC_\[_i_\] &minus; floor(_LC_\[_i_\]) (_LC_\[_i_\]'s fractional part).

The code above can then be modified as follows:

- `exprandnew` is modified so that instead of taking `lamdanum` and `lamdaden`, it takes a list of the components described above.  Each component is stored as _LI_\[_i_\] and an algorithm that simulates _LF_\[_i_\].

- `zero_or_one_exp_minus(a, b)` is replaced with the **algorithm for exp(&minus; _z_)** described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", where _z_ is the real-valued _&lambda;_ parameter.

- `logisticexp(a, b, index+1)` is replaced with the **algorithm for 1 / 1 + exp(_z_ / 2<sup>_index_ + 1</sup>)) (LogisticExp)** described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", where _z_ is the real-valued _&lambda;_ parameter.

<a id=Correctness_Testing></a>
## Correctness Testing

&nbsp;

<a id=Beta_Sampler></a>
### Beta Sampler

To test the correctness of the beta sampler presented in this document, the Kolmogorov&ndash;Smirnov test was applied with various values of `alpha` and `beta` and the default precision of 53, using SciPy's `kstest` method.  The code for the test is very simple: `kst = scipy.stats.kstest(ksample, lambda x: scipy.stats.beta.cdf(x, alpha, beta))`, where `ksample` is a sample of random numbers generated using the sampler above.  Note that SciPy uses a two-sided Kolmogorov&ndash;Smirnov test by default.

See the results of the [**correctness testing**](https://peteroupc.github.io/betadistresults.html).   For each pair of parameters, five samples with 50,000 numbers per sample were taken, and results show the lowest and highest Kolmogorov&ndash;Smirnov statistics and p-values achieved for the five samples.  Note that a p-value extremely close to 0 or 1 strongly indicates that the samples do not come from the corresponding beta distribution.

<a id=ExpRandFill></a>
### ExpRandFill

To test the correctness of the `exprandfill` method (which implements the **ExpRandFill** algorithm), the Kolmogorov&ndash;Smirnov test was applied with various values of _&lambda;_ and the default precision of 53, using SciPy's `kstest` method.  The code for the test is very simple: `kst = scipy.stats.kstest(ksample, lambda x: scipy.stats.expon.cdf(x, scale=1/lamda))`, where `ksample` is a sample of random numbers generated using the `exprand` method above.  Note that SciPy uses a two-sided Kolmogorov&ndash;Smirnov test by default.

The table below shows the results of the correctness testing. For each parameter, five samples with 50,000 numbers per sample were taken, and results show the lowest and highest Kolmogorov&ndash;Smirnov statistics and p-values achieved for the five samples.  Note that a p-value extremely close to 0 or 1 strongly indicates that the samples do not come from the corresponding exponential distribution.

|  _&lambda;_ | Statistic | _p_-value |
 ---- | ---- | ---- |
| 1/10 | 0.00233-0.00435 | 0.29954-0.94867 |
| 1/4 | 0.00254-0.00738 | 0.00864-0.90282 |
| 1/2 | 0.00195-0.00521 | 0.13238-0.99139 |
| 2/3 | 0.00295-0.00457 | 0.24659-0.77715 |
| 3/4 | 0.00190-0.00636 | 0.03514-0.99381 |
| 9/10 | 0.00226-0.00474 | 0.21032-0.96029 |
| 1 | 0.00267-0.00601 | 0.05389-0.86676 |
| 2 | 0.00293-0.00684 | 0.01870-0.78310 |
| 3 | 0.00284-0.00675 | 0.02091-0.81589 |
| 5 | 0.00256-0.00546 | 0.10130-0.89935 |
| 10 | 0.00279-0.00528 | 0.12358-0.82974 |

<a id=ExpRandLess></a>
### ExpRandLess

To test the correctness of `exprandless`, a two-independent-sample T-test was applied to scores involving e-rands and scores involving the Python `random.expovariate` method.  Specifically, the score is calculated as the number of times one exponential number compares as less than another; for the same _&lambda;_ this event should be as likely as the event that it compares as greater.  (In fact, this should be the case for _any_ pair of independent random numbers of the same distribution; see proposition 2 in my note on [**randomness extraction**](https://peteroupc.github.io/randextract.html).)  The Python code that follows the table calculates this score for e-rands and `expovariate`.   Even here, the code for the test is very simple: `kst = scipy.stats.ttest_ind(exppyscores, exprandscores)`, where `exppyscores` and `exprandscores` are each lists of 20 results from `exppyscore` or `exprandscore`, respectively, and the results contained in `exppyscores` and `exprandscores` were generated independently of each other.

The table below shows the results of the correctness testing. For each pair of parameters, results show the lowest and highest T-test statistics and p-values achieved for the 20 results.  Note that a p-value extremely close to 0 or 1 strongly indicates that exponential random numbers are not compared as less or greater with the expected probability.

|  Left _&lambda;_ | Right _&lambda;_ | Statistic | _p_-value |
 ---- | ---- | ---- | ---- |
| 1/10 | 1/10 | -1.21015 &ndash; 0.93682 | 0.23369 &ndash; 0.75610 |
| 1/10 | 1/2 | -1.25248 &ndash; 3.56291 | 0.00101 &ndash; 0.39963 |
| 1/10 | 1 | -0.76586 &ndash; 1.07628 | 0.28859 &ndash; 0.94709 |
| 1/10 | 2 | -1.80624 &ndash; 1.58347 | 0.07881 &ndash; 0.90802 |
| 1/10 | 5 | -0.16197 &ndash; 1.78700 | 0.08192 &ndash; 0.87219 |
| 1/2 | 1/10 | -1.46973 &ndash; 1.40308 | 0.14987 &ndash; 0.74549 |
| 1/2 | 1/2 | -0.79555 &ndash; 1.21538 | 0.23172 &ndash; 0.93613 |
| 1/2 | 1 | -0.90496 &ndash; 0.11113 | 0.37119 &ndash; 0.91210 |
| 1/2 | 2 | -1.32157 &ndash; -0.07066 | 0.19421 &ndash; 0.94404 |
| 1/2 | 5 | -0.55135 &ndash; 1.85604 | 0.07122 &ndash; 0.76994 |
| 1 | 1/10 | -1.27023 &ndash; 0.73501 | 0.21173 &ndash; 0.87314 |
| 1 | 1/2 | -2.33246 &ndash; 0.66827 | 0.02507 &ndash; 0.58741 |
| 1 | 1 | -1.24446 &ndash; 0.84555 | 0.22095 &ndash; 0.90587 |
| 1 | 2 | -1.13643 &ndash; 0.84148 | 0.26289 &ndash; 0.95717 |
| 1 | 5 | -0.70037 &ndash; 1.46778 | 0.15039 &ndash; 0.86996 |
| 2 | 1/10 | -0.77675 &ndash; 1.15350 | 0.25591 &ndash; 0.97870 |
| 2 | 1/2 | -0.23122 &ndash; 1.20764 | 0.23465 &ndash; 0.91855 |
| 2 | 1 | -0.92273 &ndash; -0.05904 | 0.36197 &ndash; 0.95323 |
| 2 | 2 | -1.88150 &ndash; 0.64096 | 0.06758 &ndash; 0.73056 |
| 2 | 5 | -0.08315 &ndash; 1.01951 | 0.31441 &ndash; 0.93417 |
| 5 | 1/10 | -0.60921 &ndash; 1.54606 | 0.13038 &ndash; 0.91563 |
| 5 | 1/2 | -1.30038 &ndash; 1.43602 | 0.15918 &ndash; 0.86349 |
| 5 | 1 | -1.22803 &ndash; 1.35380 | 0.18380 &ndash; 0.64158 |
| 5 | 2 | -1.83124 &ndash; 1.40222 | 0.07491 &ndash; 0.66075 |
| 5 | 5 | -0.97110 &ndash; 2.00904 | 0.05168 &ndash; 0.74398 |

```
def exppyscore(ln,ld,ln2,ld2):
        return sum(1 if random.expovariate(ln*1.0/ld)<random.expovariate(ln2*1.0/ld2) \
              else 0 for i in range(1000))

def exprandscore(ln,ld,ln2,ld2):
        return sum(1 if exprandless(exprandnew(ln,ld), exprandnew(ln2,ld2)) \
              else 0 for i in range(1000))
```

<a id=Accurate_Simulation_of_Continuous_Distributions_Supported_on_0_to_1></a>
## Accurate Simulation of Continuous Distributions Supported on 0 to 1

The beta sampler in this document shows one case of a general approach to simulating a wide class of continuous distributions supported on \[0, 1\], thanks to Bernoulli factories.  This general approach can sample a number that follows one of these distributions, using the algorithm below.  The algorithm allows any arbitrary base (or radix) _b_ (such as 2 for binary).  (See also (Devroye 1986, ch. 2, sec. 3.8, exercise 14)<sup>[**(14)**](#Note14)</sup>.)

1. Create an uniform PSRN with a positive sign, an integer part of 0, and an empty fractional part.  Create a **SampleGeometricBag** Bernoulli factory that uses that PSRN.
2. As the PSRN builds up a uniform random number, accept the PSRN with a probability that can be represented by a Bernoulli factory algorithm (that takes the **SampleGeometricBag** factory from step 1 as part of its input), or reject it otherwise. (A number of these algorithms can be found in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)".)  Let _f_(_U_) be the probability function modeled by this Bernoulli factory, where _U_ is the uniform random number built up by the PSRN. _f_ is a multiple of the PDF for the underlying continuous distribution (as a result, this algorithm can be used even if the distribution's PDF is only known up to a normalization constant).  As shown by Keane and O'Brien <sup>[**(6)**](#Note6)</sup>, however, this step works if and only if _f_(_&lambda;_), in a given set in \[0, 1\]&mdash;
    - is continuous everywhere,
    - does not go to 0 or 1 exponentially fast in value, and
    - either returns a constant value in \[0, 1\] everywhere, or returns a value in \[0, 1\] at each of the points 0 and 1 and a value in (0, 1) at each other point,

   and they give the example of 2 \* _&lambda;_ as a probability function that cannot be represented by a Bernoulli factory.  Notice that the probability can be a constant, including an irrational number; see "[**Algorithms for Irrational Constants**](https://peteroupc.github.io/bernoulli.html#Algorithms_for_Irrational_Constants)" for ways to simulate constant probabilities.
3. If the PSRN is accepted, optionally fill the PSRN with uniform random digits as necessary to give its fractional part _n_ digits (similarly to **FillGeometricBag** above), where _n_ is a precision parameter, then return the PSRN.

However, the speed of this algorithm depends crucially on the _essential supremum_ of _f_ in \[0, 1\] (that is, the function's highest point in that interval ignoring zero-volume, or measure-zero, sets).  As the essential supremum approaches 0, the average rejection rate increases.  Effectively, this step generates a point uniformly at random in a 1&times;1 area in space.  If the essential supremum is close to 0, _f_ will cover only a tiny portion of this area, so that the chance is high that the generated point will fall outside the area of _f_ and have to be rejected.

The beta distribution's PDF at (1) fits the requirements of Keane and O'Brien (for `alpha` and `beta` both greater than 1), thus it can be simulated by Bernoulli factories and is covered by this general algorithm.

This algorithm can be modified to produce random numbers in the interval \[_m_, _m_ + _y_\] (where _m_ and _y_ are rational numbers and _y_ is greater than 0), rather than \[0, 1\], as follows:

1. Apply the algorithm above, except that a modified probability function _f&prime;_(_x_) = _f_(_x_ * _y_ + _m_) is used rather than _f_, where _x_ is the number in \[0, 1\] that is built up by the PSRN, and that the choice is not made to fill the PSRN as given in step 3 of that algorithm.
2. Multiply the resulting random PSRN by _y_ via the second algorithm in "[**Multiplication**](#Multiplication)".  (Note that if _y_ has the form _b_<sup>_i_</sup>, this step is relatively trivial.)
3. Add _m_ to the resulting random PSRN via the second algorithm in "[**Addition and Subtraction**](#Addition_and_Subtraction)".

Note that here, the probability function _f&prime;_ must meet the requirements of Keane and O'Brien.  (For example, take the probability function `sqrt((x - 4) / 2)`, which isn't a Bernoulli factory function.  If we now seek to sample from the interval \[4, 4+2<sup>1</sup>\] = \[4, 6\], the _f_ used in step 2 is now `sqrt(x)`, which _is_ a Bernoulli factory function so that we can apply this algorithm.)

<a id=An_Example_The_Continuous_Bernoulli_Distribution></a>
### An Example: The Continuous Bernoulli Distribution

The continuous Bernoulli distribution (Loaiza-Ganem and Cunningham 2019)<sup>[**(21)**](#Note21)</sup> was designed to considerably improve performance of variational autoencoders (a machine learning model) in modeling continuous data that takes values in the interval [0, 1], including "almost-binary" image data.

The continous Bernoulli distribution takes one parameter `lamda` (a number in [0, 1]), and takes on values in the interval [0, 1] with a probability proportional to&mdash;

    pow(lamda, x) * pow(1 - lamda, 1 - x).

Again, this function meets the requirements stated by Keane and O'Brien, so it can be simulated via Bernoulli factories.  Thus, this distribution can be simulated in Python as described below.

The algorithm for sampling the continuous Bernoulli distribution follows.  It uses an input coin that returns 1 with probability `lamda`.

1. Create a positive-sign zero-integer-part uniform PSRN.
2. Create a **complementary lambda Bernoulli factory** that returns 1 minus the result of the input coin.
3. Remove all digits from the uniform PSRN's fractional part.  This will result in an "empty" uniform(0,1) random number, _U_, for the following steps, which will accept _U_ with probability `lamda`<sup>_U_</sup>*(1&minus;`lamda`)<sup>1&minus;_U_</sup>) (the proportional probability for the beta distribution), as _U_ is built up.
4. Call the **algorithm for _&lambda;_<sup>&mu;</sup>** described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", using the input coin as the _&lambda;_-coin, and **SampleGeometricBag** as the &mu;-coin (which will return 1 with probability `lamda`<sup>_U_</sup>).  If the result is 0, go to step 3.
5. Call the **algorithm for _&lambda;_<sup>&mu;</sup>** using the **complementary lambda Bernoulli factory** as the _&lambda;_-coin and **SampleGeometricBagComplement** algorithm as the &mu;-coin (which will return 1 with probability (1-`lamda`)<sup>1&minus;_U_</sup>).  If the result is 0, go to step 3. (Note that steps 4 and 5 don't depend on each other and can be done in either order without affecting correctness.)
6. _U_ was accepted, so return the result of **FillGeometricBag**.

The Python code that samples the continuous Bernoulli distribution follows.

    def _twofacpower(b, fbase, fexponent):
        """ Bernoulli factory B(p, q) => B(p^q).
               - fbase, fexponent: Functions that return 1 if heads and 0 if tails.
                 The first is the base, the second is the exponent.
                 """
        i = 1
        while True:
            if fbase() == 1:
                return 1
            if fexponent() == 1 and \
                b.zero_or_one(1, i) == 1:
                return 0
            i = i + 1

    def contbernoullidist(b, lamda, precision=53):
        # Continuous Bernoulli distribution
        bag=[]
        lamda=Fraction(lamda)
        gb=lambda: b.geometric_bag(bag)
        # Complement of "geometric bag"
        gbcomp=lambda: b.geometric_bag(bag)^1
        fcoin=b.coin(lamda)
        lamdab=lambda: fcoin()
        # Complement of "lambda coin"
        lamdabcomp=lambda: fcoin()^1
        acc=0
        while True:
           # Create a uniform random number (U) bit-by-bit, and
           # accept it with probability lamda^U*(1-lamda)^(1-U), which
           # is the unnormalized PDF of the beta distribution
           bag.clear()
           # Produce 1 with probability lamda^U
           r=_twofacpower(b, lamdab, gb)
           # Produce 1 with probability (1-lamda)^(1-U)
           if r==1: r=_twofacpower(b, lamdabcomp, gbcomp)
           if r == 1:
                 # Accepted, so fill up the "bag" and return the
                 # uniform number
                 ret=_fill_geometric_bag(b, bag, precision)
                 return ret
           acc+=1

<a id=Complexity></a>
## Complexity

The _bit complexity_ of an algorithm that generates random numbers is measured as the number of random bits that algorithm uses on average.

<a id=General_Principles></a>
### General Principles

Existing work shows how to calculate the bit complexity for any distribution of random numbers:

- For a 1-dimensional continuous distribution, the bit complexity is bounded from below by `DE + prec - 1` random bits, where `DE` is the differential entropy for the distribution and _prec_ is the number of bits in the random number's fractional part (Devroye and Gravel 2015)<sup>[**(3)**](#Note3)</sup>.
- For a discrete distribution (a distribution of random integers with separate probabilities of occurring), the bit complexity is bounded from below by the binary entropies of all the probabilities involved, summed together (Knuth and Yao 1976)<sup>[**(22)**](#Note22)</sup>.  (For a given probability _p_, the binary entropy is `p*log2(1/p)`.)  An optimal algorithm will come within 2 bits of this lower bound on average.

For example, in the case of the exponential distribution, `DE` is log2(exp(1)/_&lambda;_), so the minimum bit complexity for this distribution is log2(exp(1)/_&lambda;_) + _prec_ &minus; 1, so that if _prec_ = 20, this minimum is about 20.443 bits when _&lambda;_ = 1, decreases when _&lambda;_ goes up, and increases when _&lambda;_ goes down.  In the case of any other continuous distribution, `DE` is the integral of `f(x) * log2(1/f(x))` over all valid values `x`, where `f` is the distribution's PDF.

Although existing work shows lower bounds on the number of random bits an algorithm will need on average, most algorithms will generally not achieve these lower bounds in practice.

In general, if an algorithm calls other algorithms that generate random numbers, the total expected bit complexity is&mdash;

- the expected number of calls to each of those other algorithms, times
- the bit complexity for each such call.

<a id=Complexity_of_Specific_Algorithms></a>
### Complexity of Specific Algorithms

The beta and exponential samplers given here will generally use many more bits on average than the lower bounds on bit complexity, especially since they generate a PSRN one digit at a time.

The `zero_or_one` method generally uses 2 random bits on average, due to its nature as a Bernoulli trial involving random bits, see also (Lumbroso 2013, Appendix B)<sup>[**(23)**](#Note23)</sup>.  However, it uses no random bits if both its parameters are the same.

For **SampleGeometricBag** with base 2, the bit complexity has two components.

- One component comes from sampling a geometric (1/2) random number, as follows:
    - Optimal lower bound: Since the binary entropy of the random number is 2, the optimal lower bound is 2 bits.
    - Optimal upper bound: 4 bits.
- The other component comes from filling the partially-sampled random number's fractional part with random bits.  The complexity here depends on the number of times **SampleGeometricBag** is called for the same PSRN, call it `n`.  Then the expected number of bits is the expected number of bit positions filled this way after `n` calls.

**SampleGeometricBagComplement** has the same bit complexity as **SampleGeometricBag**.

**FillGeometricBag**'s bit complexity is rather easy to find.  For base 2, it uses only one bit to sample each unfilled digit at positions less than `p`. (For bases other than 2, sampling _each_ digit this way might not be optimal, since the digits are generated one at a time and random bits are not recycled over several digits.)  As a result, for an algorithm that uses both **SampleGeometricBag** and **FillGeometricBag** with `p` bits, these two contribute, on average, anywhere from `p + g * 2` to `p + g * 4` bits to the complexity, where `g` is the number of calls to **SampleGeometricBag**. (This complexity could be increased by 1 bit if **FillGeometricBag** is implemented with a rounding mechanism other than simple truncation.)

The complexity of the **algorithm for exp(&minus;_x_/_y_)** (which outputs 1 with probability exp(&minus;_x_/_y_)) was discussed in some detail by (Canonne et al. 2020)<sup>[**(24)**](#Note24)</sup>, but not in terms of its bit complexity.  The special case of &gamma; =_x_/_y_ = 0 requires no bits.  If &gamma; is an integer greater than 1, then the bit complexity is the same as that of sampling a random number _G_, where _G_ is &gamma; or the number of successes before the first failure, whichever is less, and where a success has probility exp(&minus;1).

- Optimal lower bound: Has a complicated formula for general &gamma;, but approaches `log2(exp(1)-(exp(1)+1)*ln(exp(1)-1))` = 2.579730853... bits with increasing &gamma;.
- Optimal upper bound: Optimal lower bound plus 2.
- The actual implementation's average bit complexity is generally&mdash;
    - the expected number of calls to the **algorithm for exp(&minus;_x_/_y_)** (with &gamma; = 1), which is the expected value of _G_ as described above, times
    - the bit complexity for each such call.

If &gamma; is 1 or less, the optimal bit complexity is determined as the complexity of sampling a random integer _k_ with probability function&mdash;

 - P(_k_) = &gamma;<sup>_k_</sup>/_k_! &minus; &gamma;<sup>_k_ + 1</sup>/(_k_ + 1)!,

and the optimal lower bound is found by taking the binary entropy of each probability (`P(k)/log2(1/P(k))`) and summing them all.

- Optimal lower bound: Again, this has a complicated formula (see the appendix for SymPy code), but it appears to be highest at about 1.85 bits, which is reached when &gamma; is about 0.848.
- Optimal upper bound: Optimal lower bound plus 2.
- The actual implementation's average bit complexity is generally&mdash;
    - the expected number of calls to `zero_or_one`, which was determined to be exp(&gamma;) in (Canonne et al. 2020)<sup>[**(24)**](#Note24)</sup>, times
    - the bit complexity for each such call (which is generally 2, but is lower in the case of &gamma; = 1, which involves `zero_or_one(1, 1)` that uses no random bits).

If &gamma; is a non-integer greater than 1, the bit complexity is the sum of the bit complexities for its integer part and for its fractional part.

<a id=Application_to_Weighted_Reservoir_Sampling></a>
## Application to Weighted Reservoir Sampling

[**Weighted reservoir sampling**](https://peteroupc.github.io/randomfunc.html#Weighted_Choice_Without_Replacement_List_of_Unknown_Size) (choosing an item at random from a list of unknown size) is often implemented by&mdash;

- assigning each item a _weight_ (an integer 0 or greater) as it's encountered, call it _w_,
- giving each item an exponential random number with _&lambda;_ = _w_, call it a key, and
- choosing the item with the smallest key

(see also (Efraimidis 2015)<sup>[**(25)**](#Note25)</sup>). However, using fully-sampled exponential random numbers as keys (such as the naïve idiom `-ln(1-RNDU01())/w` in common floating-point arithmetic) can lead to inexact sampling, since the keys have a limited precision, it's possible for multiple items to have the same random key (which can make sampling those items depend on their order rather than on randomness), and the maximum weight is unknown.  Partially-sampled e-rands, as given in this document, eliminate the problem of inexact sampling.  This is notably because the `exprandless` method returns one of only two answers&mdash;either "less" or "greater"&mdash;and samples from both e-rands as necessary so that they will differ from each other by the end of the operation.  (This is not a problem because randomly generated real numbers are expected to differ from each other almost surely.) Another reason is that partially-sampled e-rands have potentially arbitrary precision.

<a id=Open_Questions></a>
## Open Questions

There are some open questions on PSRNs:

1. Are there constructions for PSRNs other than for cases given earlier in this document?
2. Doing an arithmetic operation between two PSRNs is akin to doing an interval operation between those PSRNs, since a PSRN is ultimately a random number that lies in an interval.  However, as explained in "[**Arithmetic with PSRNs**](#Arithmetic_with_PSRNs)", the result of the operation is an interval that bounds a random number that is _not_ always uniformly distributed in that interval.  For example, in the case of addition this distribution is triangular with a peak in the middle, and in the case of multiplication this distribution resembles a trapezoid.  What are the exact distributions of this kind for other interval arithmetic operations, such as division?

<a id=Acknowledgments></a>
## Acknowledgments

I acknowledge Claude Gravel who reviewed a previous version of this article.

<a id=Other_Documents></a>
## Other Documents

The following are some additional articles I have written on the topic of random and pseudorandom number generation.  All of them are open-source.

* [**Random Number Generator Recommendations for Applications**](https://peteroupc.github.io/random.html)
* [**Randomization and Sampling Methods**](https://peteroupc.github.io/randomfunc.html)
* [**More Random Number Sampling Methods**](https://peteroupc.github.io/randomnotes.html)
* [**Code Generator for Discrete Distributions**](https://peteroupc.github.io/autodist.html)
* [**The Most Common Topics Involving Randomization**](https://peteroupc.github.io/randomcommon.html)
* [**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)
* [**More Algorithms for Arbitrary-Precision Sampling**](https://peteroupc.github.io/morealg.html)
* [**Testing PRNGs for High-Quality Randomness**](https://peteroupc.github.io/randomtest.html)
* [**Examples of High-Quality PRNGs**](https://peteroupc.github.io/hqprng.html)

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Karney, C.F.F., "[**Sampling exactly from the normal distribution**](https://arxiv.org/abs/1303.6257v2)", arXiv:1303.6257v2  [physics.comp-ph], 2014.</small>
- <small><sup id=Note2>(2)</sup> Philippe Flajolet, Nasser Saheb. The complexity of generating an exponentially distributed variate. [Research Report] RR-0159, INRIA. 1982. inria-00076400.</small>
- <small><sup id=Note3>(3)</sup> Devroye, L., Gravel, C., "[**Sampling with arbitrary precision**](https://arxiv.org/abs/1502.02539v5)", arXiv:1502.02539v5 [cs.IT], 2015.</small>
- <small><sup id=Note4>(4)</sup> Thomas, D.B. and Luk, W., 2008, September. Sampling from the exponential distribution using independent bernoulli variates. In 2008 International Conference on Field Programmable Logic and Applications (pp. 239-244). IEEE.</small>
- <small><sup id=Note5>(5)</sup> A. Habibizad Navin, R. Olfatkhah and M. K. Mirnia, "A data-oriented model of exponential random variable," 2010 2nd International Conference on Advanced Computer Control, Shenyang, 2010, pp. 603-607, doi: 10.1109/ICACC.2010.5487128.</small>
- <small><sup id=Note6>(6)</sup> Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.</small>
- <small><sup id=Note7>(7)</sup> Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560v2)", arXiv:0906.5560v2  [math.PR], 2010.</small>
- <small><sup id=Note8>(8)</sup> Pedersen, K., "[**Reconditioning your quantile function**](https://arxiv.org/abs/1704.07949)", arXiv:1704.07949 [stat.CO], 2018.</small>
- <small><sup id=Note9>(9)</sup> von Neumann, J., "Various techniques used in connection with random digits", 1951.</small>
- <small><sup id=Note10>(10)</sup> As noted by von Neumann (1951), a uniform random number bounded by 0 and 1 can be produced by "juxtapos[ing] enough random binary digits".  In this sense, the random number is `RNDINTEXC(B)/pow(B, 1) + RNDINTEXC(B)/pow(B, 2) + RNDINTEXC(B)/pow(B, 3) + ...` (where `B` is the digit base 2), perhaps "forc[ing] the last [random bit] to be 1" "[t]o avoid any bias".  It is not hard to see that this approach can be applied to generate any digit expansion of any base, not just 2.</small>
- <small><sup id=Note11>(11)</sup> Yusong Du, Baoying Fan, and Baodian Wei, "[**An Improved Exact Sampling Algorithm for the Standard Normal Distribution**](https://arxiv.org/abs/2008.03855)", arXiv:2008.03855 [cs.DS], 2020.</small>
- <small><sup id=Note12>(12)</sup> Oberhoff, Sebastian, "[**Exact Sampling and Prefix Distributions**](https://dc.uwm.edu/etd/1888)", _Theses and Dissertations_, University of Wisconsin Milwaukee, 2018.</small>
- <small><sup id=Note13>(13)</sup> S. Kakutani, "On equivalence of infinite product measures", _Annals of Mathematics_ 1948.</small>
- <small><sup id=Note14>(14)</sup> Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.</small>
- <small><sup id=Note15>(15)</sup> Brassard, G., Devroye, L., Gravel, C., "Remote Sampling with Applications to General Entanglement Simulation", _Entropy_ 2019(21)(92), doi:10.3390/e21010092.</small>
- <small><sup id=Note16>(16)</sup> A. Habibizad Navin, Fesharaki, M.N., Teshnelab, M. and Mirnia, M., 2007. "Data oriented modeling of uniform random variable: Applied approach". _World Academy Science Engineering Technology_, 21, pp.382-385.</small>
- <small><sup id=Note17>(17)</sup> Nezhad, R.F., Effatparvar, M., Rahimzadeh, M., 2013. "Designing a Universal Data-Oriented Random Number Generator", _International Journal of Modern Education and Computer Science_ 2013(2), pp. 19-24.</small>
- <small><sup id=Note18>(18)</sup> Rohatgi, V.K., 1976. An Introduction to Probability Theory Mathematical Statistics.</small>
- <small><sup id=Note19>(19)</sup> Fan, Baoying et al. “On Generating Exponentially Distributed Variates by Using Early Rejection.” _2019 IEEE 5th International Conference on Computer and Communications (ICCC)_ (2019): 1307-1311.</small>
- <small><sup id=Note20>(20)</sup> In fact, thanks to the "geometric bag" technique of Flajolet et al. (2010), that fractional part can even be a uniform random number in [0, 1] whose contents are built up digit by digit.</small>
- <small><sup id=Note21>(21)</sup> Loaiza-Ganem, G., Cunningham, J.P., "[**The continuous Bernoulli: fixing a pervasive error in variational autoencoders**](https://arxiv.org/abs/1907.06845v5)", arXiv:1907.06845v5  [stat.ML], 2019.</small>
- <small><sup id=Note22>(22)</sup> Knuth, Donald E. and Andrew Chi-Chih Yao. "The complexity of nonuniform random number generation", in _Algorithms and Complexity: New Directions and Recent Results_, 1976.</small>
- <small><sup id=Note23>(23)</sup> Lumbroso, J., "[**Optimal Discrete Uniform Generation from Coin Flips, and Applications**](https://arxiv.org/abs/1304.1916)", arXiv:1304.1916 [cs.DS].</small>
- <small><sup id=Note24>(24)</sup> Canonne, C., Kamath, G., Steinke, T., "[**The Discrete Gaussian for Differential Privacy**](https://arxiv.org/abs/2004.00010v2)", arXiv:2004.00010v2 [cs.DS], 2020.</small>
- <small><sup id=Note25>(25)</sup> Efraimidis, P. "[**Weighted Random Sampling over Data Streams**](https://arxiv.org/abs/1012.0256v2)", arXiv:1012.0256v2 [cs.DS], 2015.</small>
- <small><sup id=Note26>(26)</sup> Devroye, L., Gravel, C., "[**The expected bit complexity of the von Neumann rejection algorithm**](https://arxiv.org/abs/1511.02273)", arXiv:1511.02273 [cs.IT], 2016.</small>
- <small><sup id=Note27>(27)</sup> This means that every zero-volume (measure-zero) subset of the distribution's domain (such as a set of points) has zero probability.</small>

<a id=Appendix></a>
## Appendix

<a id=SymPy_Formula_for_the_algorithm_for_exp_minus__x___y></a>
### SymPy Formula for the algorithm for exp(&minus;_x_/_y_)

The following Python code uses SymPy to plot the bit complexity lower bound for the **algorithm for exp(&minus;_x_/_y_)** when &gamma; is 1 or less:

```
def ent(p):
   return p*log(1/p,2)

def expminusformula():
   i=symbols('i',integer=True)
   x=symbols('x',real=True)
   # Approximation for k = [0, 6]; the result is little different
   # for k = [0, infinity]
   return summation(ent(x**i/factorial(i) - \
      x**(i+1)/factorial(i+1)), (i,0,6))

plot(expminusformula(), xlim=(0,1), ylim=(0,2))
```

<a id=Equivalence_of_SampleGeometricBag_Algorithms></a>
### Equivalence of SampleGeometricBag Algorithms

For the **SampleGeometricBag**, there are two versions: one for binary (base 2) and one for other bases.  Here is why these two versions are equivalent in the binary case.  Step 2 of the first algorithm samples a temporary random number _N_.  This can be implemented by generating unbiased random bits (that is, each bit is either 0 or 1, chosen with equal probability) until a zero is generated this way.  There are three cases relevant here.

- The generated bit is one, which will occur at a 50% chance. This means the bit position is skipped and the algorithm moves on to the next position.  In algorithm 3, this corresponds to moving to step 3 because **a**'s fractional part is equal to **b**'s, which likewise occurs at a 50% chance compared to the fractional parts being unequal (since **a** is fully built up in the course of the algorithm).
- The generated bit is zero, and the algorithm samples (or retrieves) a zero bit at position _N_, which will occur at a 25% chance. In algorithm 3, this corresponds to returning 0 because **a**'s fractional part is less than **b**'s, which will occur with the same probability.
- The generated bit is zero, and the algorithm samples (or retrieves) a one bit at position _N_, which will occur at a 25% chance. In algorithm 3, this corresponds to returning 1 because **a**'s fractional part is greater than **b**'s, which will occur with the same probability.

<a id=Oberhoff_s_Exact_Rejection_Sampling_Method></a>
### Oberhoff's "Exact Rejection Sampling" Method

The following describes an algorithm described by Oberhoff for sampling a continuous distribution supported on the interval [0, 1], as long as its probability function is continuous almost everywhere and bounded from above (Oberhoff 2018, section 3)<sup>[**(12)**](#Note12)</sup>, see also (Devroye and Gravel 2016)<sup>[**(26)**](#Note26)</sup>. (Note that if the probability function's domain is wider than [0, 1], then the function needs to be divided into one-unit-long pieces, one piece chosen at random with probability proportional to its area, and that piece shifted so that it lies in [0, 1] rather than its usual place; see Oberhoff pp. 11-12.)

1. Set _pdfmax_ to an upper bound of the probability function on the domain at \[0, 1\].  Let _base_ be the base, or radix, of the digits in the return value (such as 2 for binary or 10 for decimal).
2. Set _prefix_ to 0 and _prefixLength_ to 0.
3. Set _y_ to a uniform random number in the interval \[0, _pdfmax_\].
4. Let _pw_ be _base_<sup>&minus;_prefixLength_</sup>.  Set _lower_ and _upper_ to a lower or upper bound, respectively, of the probability function's value on the domain at \[_prefix_ * _pw_, _prefix_ * _pw_ + _pw_\].
5. If _y_ turns out to be greater than _upper_, the prefix was rejected, so go to step 2.
6. If _y_ turns out to be less than _lower_, the prefix was accepted.  Now do the following:
    1. While _prefixLength_ is less than the desired precision, set _prefix_ to _prefix_ * _base_ + _r_, where _r_ is a uniform random digit, then add 1 to _prefixLength_.
    2. Return _prefix_ * _base_<sup>&minus;_prefixLength_</sup>.  (If _prefixLength_ is somehow greater than the desired precision, then the algorithm could choose to round the return value to a number whose fractional part has the desired number of digits, with a rounding mode of choice.)
7. Set _prefix_ to _prefix_ * _base_ + _r_, where _r_ is a uniform random digit, then add 1 to _prefixLength_, then go to step 4.

Because this algorithm requires evaluating the probability function and finding its maximum and minimum values at an interval (which often requires floating-point arithmetic and is often not trivial), this algorithm appears here in the appendix rather than in the main text.  Moreover, there is additional approximation error from generating _y_ with a fixed number of digits, unless _y_ is a uniform PSRN (see also "[**Application to Weighted Reservoir Sampling**](#Application_to_Weighted_Reservoir_Sampling)").

Oberhoff also describes _prefix distributions_ that sample a box that covers the probability function, with probability proportional to the box's area, but these distributions will have to support a fixed maximum prefix length and so will only approximate the underlying continuous distribution.

<a id=Setting_Digits_by_Digit_Probabilities></a>
### Setting Digits by Digit Probabilities

In principle, a partially-sampled random number is possible by finding a sequence of digit probabilities and setting that number's digits according to those probabilities.  However, there seem to be limits on how practical this approach is.

The following is part of Kakutani's theorem (Kakutani 1948)<sup>[**(13)**](#Note13)</sup>: Let _a_<sub>_j_</sub> be the _j_<sup>th</sup> binary digit probability in a random number's binary expansion, where the random number is in \[0, 1\] and each digit is independently set.  Then the random number's distribution is _absolutely continuous_<sup>[**(27)**](#Note27)</sup> if and only if the sum of squares of (_a_<sub>_j_</sub> &minus; 1/2) converges.  In other words, the random number's bits become less and less biased as they move farther and farther from the binary point.

An absolutely continuous distribution can thus be built if we can find a sequence _a_<sub>_j_</sub> that converges to 1/2.  Then a random number could be formed by setting each of its digits to 1 with probability equal to the corresponding _a_<sub>_j_</sub>.  However, experiments show that the resulting distribution will have a discontinuous _PDF_, except if the sequence has the form&mdash;

- _a_<sub>_j_</sub> = _y_<sup>_w_/&beta;<sup>_j_</sup></sup>/(1 + _y_<sup>_w_/&beta;<sup>_j_</sup></sup>),

where &beta; = 2, _y_ > 0, and _w_ > 0, and special cases include the uniform distribution (_y_ = 1, _w_ = 1), the truncated exponential(1) distribution (_y_ = (1/exp(1)), _w_ = 1; (Devroye and Gravel 2015)<sup>[**(3)**](#Note3)</sup>), and the more general exponential(_&lambda;_) distribution (_y_ = (1/exp(1)), _w_ = _&lambda;_).  Other sequences of the form _z_(_j_)/(1 + _z_(_j_)) will generally result in a discontinuous PDF even if _z_(_j_) converges to 1.

For reference, the following calculates the relative probability for _x_ for a given sequence, where _x_ is in [0, 1), and plotting this probability function (which is proportional to the PDF) will often show whether the function is discontinuous:

- Let _b_<sub>_j_</sub> be the _j_<sup>th</sup> base-&beta; digit after the point (e.g., `rem(floor(x*pow(beta, j)), beta)` where `beta` = &beta;).
- Let _t_(_x_) = &Pi;<sub>_j_ = 1, 2, ...</sub> _b_<sub>_j_</sub> * _a_<sub>_j_</sub> + (1 &minus; _b_<sub>_j_</sub>) * (1 &minus; _a_<sub>_j_</sub>).
- The relative probability for _x_ is _t_(_x_) / (argmax<sub>_z_</sub> _t_(_z_)).

It appears that the distribution's PDF will be continuous only if&mdash;

- the probabilities of the first half, interval (0, 1/2), are proportional to those of the second half, interval (1/2, 1), and
- the probabilities of each quarter, eighth, etc. are proportional to those of every other quarter, eighth, etc.

It may be that something similar applies for &beta; other than 2 (non-base-2 or non-binary cases) as it does to &beta; = 2 (the base-2 or binary case).

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
