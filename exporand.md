# Partially-Sampled Random Numbers for Accurate Sampling of Continuous Distributions

[**Peter Occil**](mailto:poccil14@gmail.com)

**2020 Mathematics Subject Classification:** 68W20, 60-08, 60-04.

<a id=Introduction></a>
## Introduction

This page introduces a Python implementation of _partially-sampled random numbers_ (PSRNs).  Although structures for PSRNs were largely described before this work, this document unifies the concepts for these kinds of numbers from prior works and shows how they can be used to sample the beta distribution (for most sets of parameters), the exponential distribution (with an arbitrary rate parameter), and many other continuous distributions&mdash;

- while avoiding floating-point arithmetic, and
- to an arbitrary precision and with user-specified error bounds (and thus in an "exact" manner in the sense defined in (Karney 2016\)[^1]).

For instance, these two points distinguish the beta sampler in this document from any other specially-designed beta sampler I am aware of.  As for the exponential distribution, there are papers that discuss generating exponential random variates using random bits (Flajolet and Saheb 1982\)[^2], (Karney 2016\)[^1], (Devroye and Gravel 2020\)[^3], (Thomas and Luk 2008\)[^4], but most if not all of them don't deal with generating exponential PSRNs using an arbitrary rate, not just 1.  (Habibizad Navin et al., 2010\)[^5] is perhaps an exception; however the approach appears to involve pregenerated tables of digit probabilities.

The samplers discussed here also draw on work dealing with a construct called the _Bernoulli factory_ (Keane and O'Brien 1994\)[^6] \(Flajolet et al., 2010\)[^7], which can simulate a new probability given a coin that shows heads with an unknown probability.  One important feature of Bernoulli factories is that they can simulate a given probability _exactly_, without having to calculate that probability manually, which is important if the probability can be an irrational number whose value no computer can compute exactly (such as `sqrt(p)` or `exp(-2)`).

This page shows [**Python code**](#Sampler_Code) for these samplers.

<a id=About_This_Document></a>
### About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/exporand.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/exporand.md)**.  You can send comments on this document either on** [**CodeProject**](https://www.codeproject.com/Articles/5272482/Partially-Sampled-Random-Numbers-for-Accurate-Samp) **or on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues)**.**

My audience for this article is **computer programmers with mathematics knowledge, but little or no familiarity with calculus**.

I encourage readers to implement any of the algorithms given in this page, and report their implementation experiences.  In particular, [**I seek comments on the following aspects**](https://github.com/peteroupc/peteroupc.github.io/issues/18):

- Are the algorithms in this article easy to implement? Is each algorithm written so that someone could write code for that algorithm after reading the article?
- Does this article have errors that should be corrected?
- Are there ways to make this article more useful to the target audience?

Comments on other aspects of this document are welcome.

<a id=Contents></a>
## Contents

- [**Introduction**](#Introduction)
    - [**About This Document**](#About_This_Document)
- [**Contents**](#Contents)
- [**About the Beta Distribution**](#About_the_Beta_Distribution)
- [**About the Exponential Distribution**](#About_the_Exponential_Distribution)
- [**About Partially-Sampled Random Numbers**](#About_Partially_Sampled_Random_Numbers)
    - [**Uniform Partially-Sampled Random Numbers**](#Uniform_Partially_Sampled_Random_Numbers)
    - [**Exponential Partially-Sampled Random Numbers**](#Exponential_Partially_Sampled_Random_Numbers)
    - [**Other Distributions**](#Other_Distributions)
    - [**Properties**](#Properties)
    - [**Limitations**](#Limitations)
    - [**Relation to Constructive Reals**](#Relation_to_Constructive_Reals)
- [**Sampling Uniform and Exponential PSRNs**](#Sampling_Uniform_and_Exponential_PSRNs)
    - [**Sampling Uniform PSRNs**](#Sampling_Uniform_PSRNs)
    - [**Sampling E-rands**](#Sampling_E_rands)
- [**Arithmetic and Comparisons with PSRNs**](#Arithmetic_and_Comparisons_with_PSRNs)
    - [**Addition and Subtraction**](#Addition_and_Subtraction)
    - [**Multiplication**](#Multiplication)
    - [**Reciprocal and Division**](#Reciprocal_and_Division)
    - [**Using the Arithmetic Algorithms**](#Using_the_Arithmetic_Algorithms)
    - [**Comparisons**](#Comparisons)
    - [**Discussion**](#Discussion)
- [**Building Blocks**](#Building_Blocks)
    - [**SampleGeometricBag**](#SampleGeometricBag)
    - [**FillGeometricBag**](#FillGeometricBag)
    - [**kthsmallest**](#kthsmallest)
    - [**Power-of-Uniform Sub-Algorithm**](#Power_of_Uniform_Sub_Algorithm)
- [**Algorithms for the Beta and Exponential Distributions**](#Algorithms_for_the_Beta_and_Exponential_Distributions)
    - [**Beta Distribution**](#Beta_Distribution)
    - [**Exponential Distribution**](#Exponential_Distribution)
- [**Sampler Code**](#Sampler_Code)
- [**Correctness Testing**](#Correctness_Testing)
    - [**Beta Sampler**](#Beta_Sampler)
    - [**ExpRandFill**](#ExpRandFill)
    - [**ExpRandLess**](#ExpRandLess)
- [**Accurate Simulation of Continuous Distributions**](#Accurate_Simulation_of_Continuous_Distributions)
    - [**General Arbitrary-Precision Samplers**](#General_Arbitrary_Precision_Samplers)
        - [**Uniform Distribution Inside N-Dimensional Shapes**](#Uniform_Distribution_Inside_N_Dimensional_Shapes)
        - [**Building an Arbitrary-Precision Sampler**](#Building_an_Arbitrary_Precision_Sampler)
        - [**Continuous Distributions Supported on 0 to 1**](#Continuous_Distributions_Supported_on_0_to_1)
    - [**Specific Arbitrary-Precision Samplers**](#Specific_Arbitrary_Precision_Samplers)
        - [**Rayleigh Distribution**](#Rayleigh_Distribution)
        - [**Hyperbolic Secant Distribution**](#Hyperbolic_Secant_Distribution)
        - [**Sum of Uniform Random Variates**](#Sum_of_Uniform_Random_Variates)
        - [**Ratio of Two Uniform Random Variates**](#Ratio_of_Two_Uniform_Random_Variates)
        - [**Reciprocal of Uniform Random Variate**](#Reciprocal_of_Uniform_Random_Variate)
        - [**Reciprocal of Power of Uniform Random Variate**](#Reciprocal_of_Power_of_Uniform_Random_Variate)
        - [**Distribution of _U_/(1&minus;_U_)**](#Distribution_of__U__1_minus__U)
        - [**Arc-Cosine Distribution**](#Arc_Cosine_Distribution)
        - [**Logistic Distribution**](#Logistic_Distribution)
        - [**Cauchy Distribution**](#Cauchy_Distribution)
        - [**Exponential Distribution with Unknown Small Rate**](#Exponential_Distribution_with_Unknown_Small_Rate)
        - [**Exponential Distribution with Rate ln(_x_)**](#Exponential_Distribution_with_Rate_ln__x)
        - [**Lindley Distribution and Lindley-Like Mixtures**](#Lindley_Distribution_and_Lindley_Like_Mixtures)
        - [**Gamma Distribution**](#Gamma_Distribution)
        - [**One-Dimensional Epanechnikov Kernel**](#One_Dimensional_Epanechnikov_Kernel)
        - [**Uniform Distribution Inside Rectellipse**](#Uniform_Distribution_Inside_Rectellipse)
        - [**Tulap distribution**](#Tulap_distribution)
        - [**Continuous Bernoulli Distribution**](#Continuous_Bernoulli_Distribution)
- [**Complexity**](#Complexity)
    - [**General Principles**](#General_Principles)
    - [**Complexity of Specific Algorithms**](#Complexity_of_Specific_Algorithms)
- [**Application to Weighted Reservoir Sampling**](#Application_to_Weighted_Reservoir_Sampling)
- [**Acknowledgments**](#Acknowledgments)
- [**Other Documents**](#Other_Documents)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Equivalence of SampleGeometricBag Algorithms**](#Equivalence_of_SampleGeometricBag_Algorithms)
    - [**UniformMultiply Algorithm**](#UniformMultiply_Algorithm)
    - [**Uniform of Uniforms Produces a Product of Uniforms**](#Uniform_of_Uniforms_Produces_a_Product_of_Uniforms)
    - [**Oberhoff's "Exact Rejection Sampling" Method**](#Oberhoff_s_Exact_Rejection_Sampling_Method)
    - [**Probability Transformations**](#Probability_Transformations)
    - [**Ratio of Uniforms**](#Ratio_of_Uniforms)
    - [**Setting Digits by Digit Probabilities**](#Setting_Digits_by_Digit_Probabilities)
- [**License**](#License)

<a id=About_the_Beta_Distribution></a>
## About the Beta Distribution

The [**beta distribution**](https://en.wikipedia.org/wiki/Beta_distribution) is a bounded-domain probability distribution; its two parameters, `alpha` and `beta`, are both greater than 0 and describe the distribution's shape.  Depending on `alpha` and `beta`, the shape can be a smooth peak or a smooth valley.  The beta distribution can take on values in the interval [0, 1].  Any value in this interval (`x`) can occur with a probability proportional to&mdash;

    pow(x, alpha - 1) * pow(1 - x, beta - 1).               (1)

Although `alpha` and `beta` can each be greater than 0, the sampler presented in this document only works if&mdash;

- both parameters are 1 or greater, or
- in the case of base-2 numbers, one parameter equals 1 and the other is greater than 0.

<a id=About_the_Exponential_Distribution></a>
## About the Exponential Distribution

The _exponential distribution_ takes a parameter _&lambda;_.  Informally speaking, a random variate that follows an exponential distribution is the number of units of time between one event and the next, and _&lambda;_ is the expected average number of events per unit of time.  Usually, _&lambda;_ is equal to 1.

An exponential random variate is commonly generated as follows: `-ln(1 - X) / lamda`, where `X` is a uniformly-distributed random real number in the interval \(0, 1\).  (This particular algorithm, however, is not robust in practice, for reasons that are outside the scope of this document, but see (Pedersen 2018\)[^8].)  This page presents an alternative way to sample exponential random variates.

<a id=About_Partially_Sampled_Random_Numbers></a>
## About Partially-Sampled Random Numbers

In this document, a _partially-sampled random number_ (PSRN) is a data structure that stores a real number of unlimited precision, but whose contents are sampled only when necessary. PSRNs open the door to algorithms that sample a random variate that "exactly" follows a probability distribution, _with arbitrary precision_, and _without floating-point arithmetic_ (see "Properties" later in this section).

PSRNs specified here consist of the following three things:

- A _fractional part_ with an arbitrary number of digits.  This can be implemented as an array of digits or as a packed integer containing all the digits.  Some algorithms care whether those digits were _sampled_ or _unsampled_; in that case, if a digit is unsampled, its unsampled status can be noted in a way that distinguishes it from sampled digits (for example, by using the `None` keyword in Python, or the number &minus;1, or by storing a separate bit array indicating which bits are sampled and unsampled).  The base in which all the digits are stored (such as base 10 for decimal or base 2 for binary) is arbitrary.  The fractional part's digits form a so-called _digit expansion_ (for example, _binary expansion_ in the case of binary or base-2 digits).  Digits beyond those stored in the fractional part are unsampled.

    For example, if the fractional part stores the base-10 digits \[1, 3, 5\], in that order, then it represents a random variate in the interval \[0.135, 0.136\], reflecting the fact that the digits between 0.135 and 0.136 are unknown.
- An optional _integer part_ (more specifically, the integer part of the number's absolute value, that is, `floor(abs(x))`).
- An optional _sign_ (positive or negative).

If the integer part is not stored, it's assumed to be 0.  If the sign is not stored, it's assumed to be positive.  For example, an implementation can care only about PSRNs in the interval [0, 1] by storing only a fractional part.

PSRNs ultimately represent a random variate between two other numbers; one of the variate's two bounds has the following form: sign * (integer part + fractional part), which is a lower bound if the PSRN is positive, or an upper bound if it's negative. For example, if the PSRN stores a positive sign, the integer 3, and the fractional part \[3, 5, 6\] (in base 10), then the PSRN represents a random variate in the interval \[3.356, 3.357\].  Here, one of the bounds is built using the PSRN's sign, integer part, and fractional part, and because the PSRN is positive, this is a lower bound.

This section specifies two kinds of PSRNs: uniform and exponential.

<a id=Uniform_Partially_Sampled_Random_Numbers></a>
### Uniform Partially-Sampled Random Numbers

The most trivial example of a PSRN is that of the uniform distribution.

In this document, a **uniform PSRN** is a PSRN that represents a uniform random variate in a given interval.  For example, if the PSRN is 3.356..., then it represents a uniformly distributed random variate in the interval [3.356, 3.357].  A uniform PSRN has the property that each additional digit of its fractional part (in this example, `.356...`) is sampled simply by setting it to an independent uniform random digit, an observation that dates from von Neumann (1951\)[^9] in the binary case.[^10]

- Flajolet et al. (2010\)[^7] use the term _geometric bag_ to refer to a uniform PSRN in the interval [0, 1] that stores binary (base-2) digits, some of which may be unsampled.  In this case, the PSRN can consist of just a fractional part, which can be implemented as described earlier.
- Karney (2016\)[^1] uses the term _u-rand_ to refer to uniform PSRNs that can store a sign, integer part, and a fractional part, where the base of the fractional part's digits is arbitrary, but Karney's concept only contemplates sampling digits from left to right without any gaps.

A uniform PSRN remains a uniform PSRN even if it was generated using a non-uniform random sampling algorithm (such as Karney's algorithm for the normal distribution).

<a id=Exponential_Partially_Sampled_Random_Numbers></a>
### Exponential Partially-Sampled Random Numbers

In this document, an **exponential PSRN** (or **_e-rand_**, named similarly to Karney's "u-rands" for partially-sampled uniform random variates (Karney 2016\)[^1]) samples each bit that, when combined with the existing bits, results in an exponentially-distributed random variate of the given rate.  Also, because `-ln(1 - X)`, where `X` is a uniform random variate between 0 and 1, is exponentially distributed, e-rands can also represent the natural logarithm of a partially-sampled uniform random variate in (0, 1].  The difference here is that additional bits are sampled not as unbiased random bits, but rather as bits with a vanishing bias.   (More specifically, an exponential PSRN generally represents an exponentially-distributed random variate in a given interval.)

Algorithms for sampling e-rands are given in the section "Algorithms for the Beta and Exponential Distributions".

<a id=Other_Distributions></a>
### Other Distributions

PSRNs of other distributions can be implemented via rejection from the uniform distribution. Examples include the following:

- The beta and continuous Bernoulli distributions, as discussed later in this document.
- The standard normal distribution, as shown in (Karney 2016\)[^1] by running Karney's Algorithm N and filling unsampled digits uniformly at random, or as shown in an improved version of that algorithm by Du et al. (2020\)[^11].
- Sampling uniform distributions in \[0, _n_\) (not just \[0, 1\]), is described later in "[**Sampling Uniform PSRNs**](#Sampling_Uniform_PSRNs)".)

For all these distributions, the PSRN's unsampled trailing digits converge to the uniform distribution, and this also applies to any continuous distribution with a continuous probability density function (or more generally, to so-called "absolutely continuous"[^12] distributions) (Oberhoff 2018\)[^13], (Hill and Schürger 2005, Corollary 4.4\)[^14].

PSRNs could also be implemented via rejection from the exponential distribution.

<a id=Properties></a>
### Properties

An algorithm that samples from a non-discrete distribution using PSRNs has the following properties:

1. The algorithm relies only on a source of independent and unbiased random bits for randomness.
2. The algorithm does not rely on floating-point arithmetic or fixed-precision approximations of irrational numbers or transcendental functions. (The algorithm may calculate approximations that converge to an irrational number, as long as those approximations are rational numbers of arbitrary precision.  The more implicitly the algorithm works with irrational numbers or transcendental functions, the better.)
3. The algorithm may use rational arithmetic (such as `Fraction` in Python or `Rational` in Ruby), as long as the arithmetic is exact.
4. If the algorithm outputs a PSRN, the number represented by the sampled digits must follow a distribution that is close to the ideal distribution by a distance of not more than _b_<sup>&minus;_m_</sup>, where _b_ is the PSRN's base, or radix (such as 2 for binary), and _m_ is the position, starting from 1, of the rightmost sampled digit of the PSRN's fractional part.  ((Devroye and Gravel 2020\)[^3] suggests Wasserstein distance, or "earth-mover distance", as the distance to use for this purpose.) The number has to be close this way even if the algorithm's caller later samples unsampled digits of that PSRN at random (for example, uniformly at random in the case of a uniform PSRN).
5. If the algorithm fills a PSRN's unsampled fractional digits at random (for example, uniformly at random in the case of a uniform PSRN), so that the number's fractional part has _m_ digits, the number's distribution must remain close to the ideal distribution by a distance of not more than _b_<sup>&minus;_m_</sup>.

> **Notes:**
>
> 1. It is not easy to turn a sampler for a non-discrete distribution into an algorithm that meets these properties.  Some reasons for this are given in the section "[**Discussion**](#Discussion)" later in this document.
> 2. The _exact rejection sampling_ algorithm described by Oberhoff (2018\)[^13] produces samples that act like PSRNs.  However, in general, the algorithm doesn't have the properties described in this section because some of its operations can introduce numerical error unless care is taken, and these operations include calculating minimums and maximums of probabilities.  Moreover, the algorithm's progression depends on the value of previously sampled bits, not just on the position of those bits as with the uniform and exponential distributions (see also (Thomas and Luk 2008\)[^4]).  For completeness, Oberhoff's method appears in the appendix.

<a id=Limitations></a>
### Limitations

Because a PSRN stores a random variate in a certain interval, PSRNs are not well suited for representing numbers in zero-volume sets.  Such sets include:

- Sets of integers or rational numbers.
- Sets of individual points.
- Curves on two- or higher-dimensional real number space.
- Surfaces on three- or higher-dimensional real number space.

In the case of curves and surfaces, a PSRN can't directly store the coordinates, in space, of a random point on that curve or surface (because the exact value of those coordinates may be an irrational number that no computer can store, and no interval can bound those exact coordinates "tightly" enough), but the PSRN _can_ store upper and lower bounds that indirectly give that point's position on that curve or surface.

> **Examples:**
>
> 1. To represent a point on the edge of a circle, a PSRN can store a random variate in the interval \[0, 2\*_&pi;_\), via the **RandUniformFromReal** method, given later, for 2\*_&pi;_ (for example, it can store an integer part of 2 and a fractional part of \[1, 3, 5\] and thus represent a number in the interval \[2.135, 2.136\]), and the number stored this way indicates the distance on the circular arc relative to its starting position.  A program that cares about the point's X and Y coordinates can then generate enough digits of the PSRN to compute an approximation of cos(_P_) and sin(_P_), respectively, to the desired accuracy, where _P_ is the number stored by the PSRN.  (However, the direct use of mathematical functions such as `cos` and `sin` is outside the scope of this document.)
> 2. Example 1 is trivial, because each point on the interval maps evenly to a point on the circle.  But this is not true in general: an interval's or box's points don't map evenly to points on a curve or surface in general.  For example, take two PSRNs describing the U and V coordinates of a 3 dimensional cone's surface: \[1.135, 1.136\] for U and \[0.288, 0.289\] for V, and the cone's coordinates are X = U\*cos(V), Y = U\*sin(V), Z = U. In this example, the PSRNs form a box that's mapped to a small part of the cone surface.  However, the points in the box don't map to the cone evenly this way, so generating enough digits to calculate X, Y, and Z to the desired accuracy will not sample uniformly from that part of the cone without more work (see Williamson (1987\)[^15] for one solution).

<a id=Relation_to_Constructive_Reals></a>
### Relation to Constructive Reals

Partially-sampled random numbers are related to a body of work dealing with so-called "constructive reals" or "recursive reals", or operations on real numbers that compute an approximation of the exact result to a user-specified number of digit places.  For example, in Hans-J. Boehm's implementation (Boehm 2020)[^16], (Boehm 1987)[^17], each operation on "constructive reals" (such as addition, multiplication, `exp`, `ln`, and so on) is associated with a function `f(n)` (where `n` is usually 0 or greater) that returns an integer `m` such that `abs(m/pow(2, n) - x) < 1/pow(2, n)`, where `x` is the exact result of the operation.  In addition, comparisons such as "less than" or "greater than" can operate on "constructive reals".  As suggested in Goubault-Larrecq et al. (2021)[^18], there can also be an operation that samples the digits of a uniform random variate between 0 and 1 and gives access to approximations of that variate, sampling random digits as necessary.  Similarly, operations of this kind can be defined to access approximations of the value stored in a PSRN (including a uniform or exponential PSRN), sampling digits for the PSRN as necessary.

Details on "constructive real" operations and comparisons are outside the scope of this document.

<a id=Sampling_Uniform_and_Exponential_PSRNs></a>
## Sampling Uniform and Exponential PSRNs

&nbsp;

<a id=Sampling_Uniform_PSRNs></a>
### Sampling Uniform PSRNs

There are several algorithms for sampling uniform partially-sampled random numbers given another number.

The **RandUniform** algorithm generates a uniformly distributed PSRN (**a**) that is greater than 0 and less than another PSRN (**b**) with probability 1.  This algorithm samples digits of **b**'s fractional part as necessary.  This algorithm should not be used if **b** is known to be a real number rather than a partially-sampled random number, since this algorithm could overshoot the value **b** had (or appeared to have) at the beginning of the algorithm; instead, the **RandUniformFromReal** algorithm, given later, should be used.  (For example, if **b** is 3.425..., one possible result of this algorithm is **a** = 3.42574... and **b** = 3.42575... Note that in this example, 3.425... is not considered an exact number.)

1. Create an empty uniform PSRN **a**.  Let _&beta;_ be the base (or radix) of digits stored in **b**'s fractional part (for example, 2 for binary or 10 for decimal).  If **b**'s integer part or sign is unsampled, or if **b**'s sign is negative, return an error.
2. (We now set **a**'s integer part and sign.) Set **a**'s sign to positive and **a**'s integer part to an integer chosen uniformly at random in \[0, _bi_\], where _bi_ is **b**'s integer part (note that _bi_ is included).  If **a**'s integer part is less than _bi_, return **a**.
3. (We now sample **a**'s fractional part.)  Set _i_ to 0.
4. If **b**'s integer part is 0 and **b**'s fractional part begins with a sampled 0-digit, set _i_ to the number of sampled zeros at the beginning of **b**'s fractional part.  A nonzero digit or an unsampled digit ends this sequence.  Then append _i_ zeros to **a**'s fractional part.  (For example, if **b** is 5.000302 or 4.000 or 0.0008, there are three sampled zeros that begin **b**'s fractional part, so _i_ is set to 3 and three zeros are appended to **a**'s fractional part.)
5. If the digit at position _i_ of **a**'s fractional part is unsampled, set the digit at that position to a base-_&beta;_ digit chosen uniformly at random (such as an unbiased random bit if _&beta;_ is 2). (Positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.)
6. If the digit at position _i_ of **b**'s fractional part is unsampled, sample the digit at that position according to the kind of PSRN **b** is. (For example, if **b** is a uniform PSRN and _&beta;_ is 2, this can be done by setting the digit at that position to an unbiased random bit.)
7. If the digit at position _i_ of **a**'s fractional part is less than the corresponding digit for **b**, return **a**.
8. If that digit is greater, then discard **a**, then create a new empty uniform PSRN **a**, then go to step 2.
9. Add 1 to _i_ and go to step 5.

> **Notes:**
>
> 1. Karney (2014, end of sec. 4\)[^1] discusses how even the integer part can be partially sampled rather than generating the whole integer as in step 2 of the algorithm.  However, incorporating this suggestion will add a non-trivial amount of complexity to the algorithm given above.
> 2. The **RandUniform** algorithm is equivalent to generating the product of a random variate (**b**) and a uniform random variate between 0 and 1.
> 3. If **b** is a uniform PSRN with a positive sign, an integer part of 0, and an empty fractional part, the **RandUniform** algorithm is equivalent to generating the product of two uniform random variates between 0 and 1.

The **RandUniformInRangePositive** algorithm generates a uniformly distributed PSRN (**a**) that is greater than one nonnegative real number **bmin** and less than another positive real number **bmax** with probability 1.  This algorithm works whether **bmin** or **bmax** is known to be a rational number or not (for example, either number can be the result of an expression such as `exp(-2)` or `ln(20)`), but the algorithm notes how it can be more efficiently implemented if **bmin** or **bmax** is known to be a rational number.

1. If **bmin** is greater than or equal to **bmax**, if **bmin** is less than 0, or if **bmax** is 0 or less, return an error.
2. Create an empty uniform PSRN **a**.
3. Special case: If **bmax** is 1 and **bmin** is 0, set **a**'s sign to positive, set **a**'s integer part to 0, and return **a**.
4. Special case: If **bmax** and **bmin** are rational numbers and each of their denominators is a power of _&beta;_, including 1 (where _&beta;_ is the desired digit base, or radix, of the uniform PSRN, such as 10 for decimal or 2 for binary), then do the following:
    1. Let _denom_ be **bmax**'s or **bmin**'s denominator, whichever is greater.
    2. Set _c1_ to floor(**bmax**\*_denom_) and _c2_ to floor((**bmax**&minus;**bmin**)\*_denom_).
    3. If _c2_ is greater than 1, add to _c1_ an integer chosen uniformly at random in \[0, _c2_) \(note that _c2_ is excluded).
    4. Let _d_ be the base-_&beta;_ logarithm of _denom_ (this is equivalent to finding the minimum number of base-_&beta;_ digits needed to store _denom_ and subtracting 1). Transfer _c1_'s least significant digits to **a**'s fractional part; the variable _d_ tells how many digits to transfer to each PSRN this way. Then set **a**'s sign to positive and **a**'s integer part to floor(_c1_/_&beta;_<sup>_d_</sup>). (For example, if _&beta;_ is 10, _d_ is 3, and _c1_ is 7342, set **a**'s fractional part to \[3, 4, 2\] and **a**'s integer part to 7.)  Finally, return **a**.
5. Calculate floor(**bmax**), and set _bmaxi_ to the result.  Likewise, calculate floor(**bmin**) and set _bmini_ to the result.
6. If _bmini_ is equal to **bmin** and _bmaxi_ is equal to **bmax**, set **a**'s sign to positive and **a**'s integer part to an integer chosen uniformly at random in \[_bmini_, _bmaxi_\) \(note that _bmaxi_ is excluded), then return **a**.  (It should be noted that determining whether a real number is equal to another is undecidable in general.)
7. (We now set **a**'s integer part and sign.) Set **a**'s sign to positive and **a**'s integer part to an integer chosen uniformly at random in the interval \[_bmini_, _bmaxi_\] \(note that _bmaxi_ is included).  If _bmaxi_ is equal to **bmax**, the integer is chosen from the interval \[_bmini_, _bmaxi_&minus;1\] instead.  Return **a** if&mdash;
    - **a**'s integer part is greater than _bmini_ and less than _bmaxi_, or
    - _bmini_ is equal to **bmin**, and **a**'s integer part is equal to _bmini_ and less than _bmaxi_.
8. (We now sample **a**'s fractional part.)  Set _i_ to 0 and _istart_ to 0. ( Then, _if **bmax** is known rational:_ set _bmaxf_ to **bmax** minus _bmaxi_, and _if **bmin** is known rational_, set _bminf_ to **bmin** minus _bmini_.)
9. (This step is not crucial for correctness, but helps improve its efficiency.  It sets **a**'s fractional part to the initial digits shared by **bmin** and **bmax**.) If **a**'s integer part is equal to _bmini_ and _bmaxi_, then do the following in a loop:
        1. Calculate the base-_&beta;_ digit at position _i_ of **bmax**'s and **bmin**'s fractional parts, and set _dmax_ and _dmin_ to those digits, respectively. (_If **bmax** is known rational:_ Do this step by setting _dmax_ to floor(_bmaxf_\*_&beta;_) and _dmin_ to floor(_bminf_\*_&beta;_).)
        2. If _dmin_ equals _dmax_, append _dmin_ to **a**'s fractional part, then add 1 to _i_ (and, if **bmax** and/or **bmin** is known to be rational, set _bmaxf_ to _bmaxf_\*_&beta;_&minus;_d_ and set _bminf_ to _bminf_\*_&beta;_&minus;_d_).  Otherwise, break from this loop and set _istart_ to _i_.
10. (Ensure the fractional part is greater than **bmin**'s.) Set _i_ to _istart_, then if **a**'s integer part is equal to _bmini_:
    1. Calculate the base-_&beta;_ digit at position _i_ of **bmin**'s fractional part, and set _dmin_ to that digit.
    2. If the digit at position _i_ of **a**'s fractional part is unsampled, set the digit at that position to a base-_&beta;_ digit chosen uniformly at random (such as an unbiased random bit if _&beta;_ is 2, or binary). (Positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.)
    3. Let _ad_ be the digit at position _i_ of **a**'s fractional part.  If _ad_ is greater than _dmin_, abort these substeps and go to step 11.
    4. Discard **a**, create a new empty uniform PSRN **a**, and abort these substeps and go to step 7 if _ad_ is less than _dmin_.
    5. Add 1 to _i_ and go to the first substep.
11. (Ensure the fractional part is less than **bmax**'s.) Set _i_ to _istart_, then if **a**'s integer part is equal to _bmaxi_:
    1. If _bmaxi_ is 0 and not equal to **bmax**, and if **a** has no digits in its fractional part, then do the following in a loop:
        1. Calculate the base-_&beta;_ digit at position _i_ of **bmax**'s fractional part, and set _d_ to that digit. (_If **bmax** is known rational:_ Do this step by setting _d_ to floor(_bmaxf_\*_&beta;_).)
        2. If _d_ is 0, append a 0-digit to **a**'s fractional part, then add 1 to _i_ (and, if **bmax** is known to be rational, set _bmaxf_ to _bmaxf_\*_&beta;_&minus;_d_).  Otherwise, break from this loop.
    2. Calculate the base-_&beta;_ digit at position _i_ of **bmax**'s fractional part, and set _dmax_ to that digit. (_If **bmax** is known rational:_ Do this step by multiplying _bmaxf_ by _&beta;_, then setting _dmax_ to floor(_bmaxf_), then subtracting _dmax_ from _bmaxf_.)
    3. If the digit at position _i_ of **a**'s fractional part is unsampled, set the digit at that position to a base-_&beta;_ digit chosen uniformly at random.
    4. Let _ad_ be the digit at position _i_ of **a**'s fractional part.  Return **a** if _ad_ is less than _dmax_.
    5. Discard **a**, create a new empty uniform PSRN **a**, and abort these substeps and go to step 7 if&mdash;
        - _**bmax** is not known to be rational_, and either _ad_ is greater than _dmax_ or all the digits after the digit at position _i_ of **bmax**'s fractional part are zeros, or
        - _**bmax** is known to be rational_, and either _ad_ is greater than _dmax_ or _bmaxf_ is 0
    6. Add 1 to _i_ and go to the second substep.
12. Return **a**.

The **RandUniformInRange** algorithm generates a uniformly distributed PSRN (**a**) that is greater than one real number **bmin** and less than another real number **bmax** with probability 1. It works for both positive and negative real numbers, but it's specified separately from **RandUniformInRangePositive** to reduce clutter.

1. If **bmin** is greater than or equal to **bmax**, return an error.  If **bmin** and **bmax** are each 0 or greater, return the result of **RandUniformInRangePositive**.
2. If **bmin** and **bmax** are each 0 or less, call **RandUniformInRangePositive** with **bmin** = abs(**bmax**) and **bmax** = abs(**bmin**), set the result's fractional part to negative, and return the result.
3. (At this point, **bmin** is less than 0 and **bmax** is greater than 0.) Set _bmaxi_ to either floor(**bmax**) if **bmax** is 0 or greater, or &minus;ceil(abs(**bmax**)) otherwise, and set _bmini_ to either floor(**bmin**) if **bmin** is 0 or greater, or &minus;ceil(abs(**bmin**)) otherwise.  (Described this way to keep implementers from confusing floor with the integer part.)
4. Set _ipart_ to an integer chosen uniformly at random in the interval \[_bmini_, _bmaxi_\] (note that _bmaxi_ is included).  If _bmaxi_ is equal to **bmax**, the integer is chosen from the interval \[_bmini_, _bmaxi_&minus;1\] instead.
5. If _ipart_ is neither _bmini_ nor _bmaxi_, create a uniform PSRN **a** with an empty fractional part; then set **a**'s sign to either positive if _ipart_ is 0 or greater, or negative otherwise; then set **a**'s integer part to abs(_ipart_+1) if _ipart_ is less than 0, or _ipart_ otherwise; then return **a**.
6. If _ipart_ is _bmini_, then create a uniform PSRN **a** with a positive sign, an integer part of abs(_ipart_+1), and an empty fractional part; then run **URandLessThanReal** with **a** = **a** and **b** = abs(**bmin**). If the result is 1, set **a**'s sign to negative and return **a**.  Otherwise, go to step 3.
7. If _ipart_ is _bmaxi_, then create a uniform PSRN **a** with a positive sign, an integer part of _ipart_, and an empty fractional part; then run **URandLessThanReal** with **a** = **a** and **b** = **bmax**. If the result is 1, return **a**.  Otherwise, go to step 3.

The **RandUniformFromReal** algorithm generates a uniformly distributed PSRN (**a**) that is greater than 0 and less than a real number **b** with probability 1.  It is equivalent to the **RandUniformInRangePositive** algorithm with **a** = **a**, **bmin** = 0, and **bmax** = **b**.

The **UniformComplement** algorithm generates 1 minus the value of a uniform PSRN (**a**) as follows:

1. If **a**'s sign is negative or its integer part is other than 0, return an error.
2. For each sampled digit in **a**'s fractional part, set it to _base_&minus;1&minus;_digit_, where _digit_ is the digit and _base_ is the base of digits stored by the PSRN, such as 2 for binary.
3. Return **a**.

<a id=Sampling_E_rands></a>
### Sampling E-rands

**Sampling an e-rand** (a exponential PSRN) makes use of two observations, based on the parameter _&lambda;_ of the exponential distribution (with _&lambda;_ greater than 0):

- While a coin flip with probability of heads of exp(&minus;_&lambda;_) is heads, the exponential random variate is increased by 1.
- If a coin flip with probability of heads of 1/(1+exp(_&lambda;_/2<sup>_prec_</sup>)) is heads, the exponential random variate is increased by 2<sup>&minus;_prec_</sup>, where _prec_ > 0 is an integer.

Devroye and Gravel (2020, sec. 3.8\)[^3] already made these observations, but only for _&lambda;_ = 1.

To implement these probabilities using just random bits, the sampler uses the **ExpMinus** and **LogisticExp** algorithms from "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)".

> **Note:** An exponential PSRN is an exponential random variate built up digit by digit, but an exponential random variate can also be stored in a _uniform PSRN_ and generated by other algorithms.

<a id=Arithmetic_and_Comparisons_with_PSRNs></a>
## Arithmetic and Comparisons with PSRNs

This section describes addition, subtraction, multiplication, reciprocal, and division involving uniform PSRNs, and discusses other aspects of arithmetic involving PSRNs.

<a id=Addition_and_Subtraction></a>
### Addition and Subtraction

The following algorithm (**UniformAdd**) shows how to add two uniform PSRNs (**a** and **b**) that store digits of the same base (radix) in their fractional parts, and get a uniform PSRN as a result.  The input PSRNs may have a positive or negative sign, and it is assumed that their integer parts and signs were sampled.  _Python code implementing this algorithm is given later in this document._

1. If **a** has unsampled digits before the last sampled digit in its fractional part, set each of those unsampled digits to a digit chosen uniformly at random.  Do the same for **b**.
2. If **a** has fewer digits in its fractional part than **b** (or vice versa), sample enough digits (by setting them to uniform random digits, such as unbiased random bits if **a** and **b** store binary, or base-2, digits) so that both PSRNs' fractional parts have the same number of digits.  Now, let _digitcount_ be the number of digits in **a**'s fractional part.
3. Let _asign_ be &minus;1 if **a**'s sign is negative, or 1 otherwise.  Let _bsign_ be &minus;1 if **b**'s sign is negative, or 1 otherwise.  Let _afp_ be **a**'s integer and fractional parts packed into an integer, as explained in the example, and let _bfp_ be **b**'s integer and fractional parts packed the same way.  (For example, if **a** represents the number 83.12344..., _afp_ is 8312344.)  Let _base_ be the base of digits stored by **a** and **b**, such as 2 for binary or 10 for decimal.
4. Calculate the following four numbers:
    - _afp_\*_asign_ + _bfp_\*_bsign_.
    - _afp_\*_asign_ + (_bfp_+1)\*_bsign_.
    - (_afp_+1)\*_asign_ + _bfp_\*_bsign_.
    - (_afp_+1)\*_asign_ + (_bfp_+1)\*_bsign_.
5. Set _minv_ to the minimum and _maxv_ to the maximum of the four numbers just calculated.  These are lower and upper bounds to the result of applying interval addition to the PSRNs **a** and **b**. (For example, if **a** is 0.12344... and **b** is 0.38925..., their fractional parts are added to form **c** = 0.51269...., or the interval [0.51269, 0.51271].)  However, the resulting PSRN is not uniformly distributed in its interval, and this is what the rest of this algorithm will solve, since in fact, the distribution of numbers in the interval resembles the distribution of the sum of two uniform random variates.
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
4. Let _afp_ be **a**'s integer and fractional parts packed into an integer, as explained in the example.  (For example, if **a** represents the number 83.12344..., _afp_ is 8312344.)  Let _asign_ be &minus;1 if
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

The following algorithm (**UniformMultiplyRational**) shows how to multiply a uniform PSRN (**a**) by a nonzero rational number **b**.  The input PSRN may have a positive or negative sign, and it is assumed that its integer part and sign were sampled. _Python code implementing this algorithm is given later in this document._

1. If **a** has unsampled digits before the last sampled digit in its fractional part, set each of those unsampled digits to a digit chosen uniformly at random.   Now, let _digitcount_ be the number of digits in **a**'s fractional part.
2. Create a uniform PSRN, call it _ret_.  Set _ret_'s sign to be &minus;1 if **a**'s sign is positive and **b** is less than 0 or if **a**'s sign is negative and **b** is 0 or greater, or 1 otherwise, then set _ret_'s integer part to 0.  Let _base_ be the base of digits stored in **a**'s fractional part (such as 2 for binary or 10 for decimal).  Set _absfrac_ to abs(**b**), then set _fraction_ to _absfrac_ &minus; floor(_absfrac_).
3. Let _afp_ be **a**'s integer and fractional parts packed into an integer, as explained in the example.  (For example, if **a** represents the number 83.12344..., _afp_ is 8312344.)
4. Set _dcount_ to _digitcount_, then set _ddc_ to _base_<sup>_dcount_</sup>, then set _lower_ to (_afp_/_ddc_)\*_absfrac_ (using rational arithmetic), then set _upper_ to ((_afp_+1)/_ddc_)\*_absfrac_ (again using rational arithmetic).
5. Set _rv_ to a uniform random integer in the interval [floor(_lower_\*_ddc_), floor(_upper_\*_ddc_)).
6. Set _rvlower_ to _rv_/_ddc_ (as a rational number), then set _rvupper_ to (_rv_+1)/_ddc_ (as a rational number).
7. If _rvlower_ is greater than or equal to _lower_ and _rvupper_ is less than _upper_, then the algorithm is almost done, so do the following: Transfer the _dcount_ least significant digits of _rv_ to _ret_'s fractional part (note that _ret_'s fractional part stores digits from most to least significant),  then set _ret_'s integer part to floor(_rv_/_base_<sup>_dcount_</sup>), then return _ret_. (For example, if _base_ is 10, _dcount_ is 4, and _rv_ is 342978, then _ret_'s fractional part is set to \[2, 9, 7, 8\], and _ret_'s integer part is set to 34.)
8. If _rvlower_ is greater than _upper_ or if _rvupper_ is less than _lower_, go to step 4.
9. Multiply _rv_ and _ddc_ each by _base_, then add 1 to _dcount_, then add a digit chosen uniformly at random to _rv_, then go to step 6.

Another algorithm (**UniformMultiply**) shows how to multiply two uniform PSRNs (**a** and **b**) is given in the appendix &mdash; the algorithm is complicated and it may be simpler to instead connect PSRNs with "constructive reals" (described earlier) that implement multiplication to arbitrary precision.

> **Note:** Let _b_>0, _c_&ge;0, and _d_>0 be rational numbers where _d_>_c_. To generate the product of two uniform variates, one in [0, _b_] and the other in [_c_, _d_], the following algorithm can be used.<br>(1) Generate a uniform PSRN using **RandUniformFromReal** with parameter _b_\*(_d_&minus;_c_), call it **K**;<br>(2) Get the result of **UniformAddRational** with parameters **K** and _b_\*_c_, call it **M**;<br>(3) Generate a uniform PSRN using **RandUniform** with parameter **M**; return the PSRN.<br>Broadly speaking: "generate a uniform(0, _b_\*(_d_&minus;_c_)) random variate _X_, then return a uniform(0, _X_+_b_\*_c_) random variate".  See the [**appendix**](#Uniform_of_Uniforms_Produces_a_Product_of_Uniforms) for evidence that this algorithm works, at least when _c_ = 0.

<a id=Reciprocal_and_Division></a>
### Reciprocal and Division

The following algorithm (**UniformReciprocal**) generates 1/**a**, where **a** is a uniform PSRN, and generates a new uniform PSRN with that reciprocal.  The input PSRN may have a positive or negative sign, and it is assumed that its integer part and sign were sampled.  All divisions mentioned here should be done using rational arithmetic. _Python code implementing this algorithm is given later in this document._

1. If **a** has unsampled digits before the last sampled digit in its fractional part, set each of those unsampled digits to a digit chosen uniformly at random.   Now, let _digitcount_ be the number of digits in **a**'s fractional part.
2. Create a uniform PSRN, call it _ret_.  Set _ret_'s sign to **a**'s sign.  Let _base_ be the base of digits stored in **a**'s fractional part (such as 2 for binary or 10 for decimal).
3. If **a** has no non-zero digit in its fractional part, and has an integer part of 0, then append a digit chosen uniformly at random to **a**'s fractional part. If that digit is 0, repeat this step. (This step is crucial for correctness when both PSRNs' intervals cover the number 0, since the distribution of their product is different from the usual case.)
4. Let _afp_ be **a**'s integer and fractional parts packed into an integer, as explained in the example.  (For example, if **a** represents the number 83.12344..., _afp_ is 8312344.)
5. (Calculate lower and upper bounds of 1/**a**, disregarding **a**'s sign.)  Set _dcount_ to _digitcount_, then set _ddc_ to _base_<sup>_dcount_</sup>, then set _lower_ to (_ddc_/(_afp_+1)), then set _upper_ to (_ddc_/_afp_).
6. Set _lowerdc_ to floor(_lower_\*_ddc_).  If _lowerdc_ is 0, add 1 to _dcount_, multiply _ddc_ by _base_, then repeat this step. (This step too is important for correctness.)
7. (_rv_ represents a tight interval between the lower and upper bounds, and _rv2_ represents a uniform random variate between 0 and 1 to compare with the density function for the reciprocal.) Set _rv_ to a uniform random integer in the interval [_lowerdc_, floor(_upper_\*_ddc_)).  Set _rv2_ to a uniform random integer in the interval [0, _lowerdc_).
8. (Get the bounds of the tight interval _rv_.) Set _rvlower_ to _rv_/_ddc_, then set _rvupper_ to (_rv_+1)/_ddc_.
9. If _rvlower_ is greater than or equal to _lower_ and _rvupper_ is less than _upper_:
    1. Set _rvd_ to _lowerdc_/_ddc_, then set _rvlower2_ to _rv2_/_lowerdc_, then set _rvupper2_ to (_rv2_+1)/_lowerdc_. (_rvlower2_ and _rvupper2_ are bounds of the uniform(0, 1) variate.)
    2. (Compare with upper bounded density: _y_<sup>2</sup>/_x_<sup>2</sup>, where _y_ is the lower bound of 1/**a** and _x_ is between the lower and upper bounds.) If _rvupper2_ is less than (_rvd_\*_rvd_)/(_rvupper_\*_rvupper_), then the algorithm is almost done, so do the following: Transfer the _dcount_ least significant digits of _rv_ to _ret_'s fractional part (note that _ret_'s fractional part stores digits from most to least significant), then set _ret_'s integer part to floor(_rv_/_base_<sup>_dcount_</sup>), then return _ret_. (For example, if _base_ is 10, _dcount_ is 4, and _rv_ is 342978, then _ret_'s fractional part is set to \[2, 9, 7, 8\], and _ret_'s integer part is set to 34.)
    3. (Compare with lower bounded density.) If _rvlower2_ is greater than (_rvd_\*_rvd_)/(_rvlower_\*_rvlower_), then abort these substeps and go to step 5. (This is a rejection event.)
10. If _rvlower_ is greater than _upper_ or if _rvupper_ is less than _lower_, go to step 5. (This is a rejection event.)
11. Multiply _rv_, _rv2_, _lowerdc_, and _ddc_ each by _base_, then add 1 to _dcount_, then add a digit chosen uniformly at random to _rv_, then add a digit chosen uniformly at random to _rv2_, then go to step 8.

With this algorithm it's now trivial to describe an algorithm for dividing one uniform PSRN **a** by another uniform PSRN **b**, here called **UniformDivide**:

1. Run the **UniformReciprocal** algorithm on **b** to create a new uniform PSRN **c**.
2. If **c**'s fractional part has no digits or all of them are zeros, append uniform random digits to **c** until a nonzero digit is appended this way.
3. Run the **UniformMultiply** algorithm (given in the appendix) on **a** and **b**, in that order, and return the result of that algorithm.

It's likewise trivial to describe an algorithm for multiplying a uniform PSRN **a** by a nonzero rational number **b**, here called **UniformDivideRational**:

1. If **b** is 0, return an error.
2. Run the **UniformMultiplyRational** algorithm on **a** and 1/**b**, in that order, and return the result of that algorithm.

<a id=Using_the_Arithmetic_Algorithms></a>
### Using the Arithmetic Algorithms

The algorithms given above for addition and multiplication are useful for scaling and shifting PSRNs.  For example, they can transform a normally-distributed PSRN into one with an arbitrary mean and standard deviation (by first multiplying the PSRN by the standard deviation, then adding the mean).  Here is a sketch of a procedure that achieves this, given two parameters, _location_ and _scale_, that are both rational numbers.

1. Generate a uniform PSRN, then transform it into a variate of the desired distribution via an algorithm that employs rejection from the uniform distribution (such as Karney's algorithm for the standard normal distribution (Karney 2016\)[^1])).  This procedure won't work for exponential PSRNs (e-rands).
2. Run the **UniformMultiplyRational** algorithm to multiply the uniform PSRN by the rational parameter _scale_ to get a new uniform PSRN.
3. Run the **UniformAddRational** algorithm to add the new uniform PSRN and the rational parameter _location_ to get a third uniform PSRN.  Return this third PSRN.

See also the section "Discussion" later in this article.

<a id=Comparisons></a>
### Comparisons

Two PSRNs, each of a different distribution but storing digits of the same base (radix), can be exactly compared to each other using algorithms similar to those in this section.

The **RandLess** algorithm compares two PSRNs, **a** and **b** (and samples additional bits from them as necessary) and returns 1 if **a** turns out to be less than **b** with probability 1, or 0 otherwise (see also (Karney 2016\)[^1])).

1. If **a**'s integer part wasn't sampled yet, sample **a**'s integer part according to the kind of PSRN **a** is.  Do the same for **b**.
2. If **a**'s sign is different from **b**'s sign, return 1 if **a**'s sign is negative and 0 if it's positive.  If **a**'s sign is positive, return 1 if **a**'s integer part is less than **b**'s, or 0 if greater.  If **a**'s sign is negative, return 0 if **a**'s integer part is less than **b**'s, or 1 if greater.
3. Set _i_ to 0.
4. If the digit at position _i_ of **a**'s fractional part is unsampled, set the digit at that position according to the kind of PSRN **a** is. (Positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.)  Do the same for **b**.
5. Let _da_ be the digit at position _i_ of **a**'s fractional part, and let _db_ be **b**'s corresponding digit.
5. If **a**'s sign is positive, return 1 if _da_ is less than _db_, or 0 if _da_ is greater than _db_.
6. If **a**'s sign is negative, return 0 if _da_ is less than _db_, or 1 if _da_ is greater than _db_.
7. Add 1 to _i_ and go to step 4.

**URandLess** is a version of **RandLess** that involves two uniform PSRNs.  The algorithm for **URandLess** samples digit _i_ in step 4 by setting the digit at position _i_ to a digit chosen uniformly at random. (For example, if **a** is a uniform PSRN that stores base-2 or binary digits, this can be done by setting the digit at that position to an unbiased random bit.)

> **Note**: To sample the **maximum** of two uniform random variates between 0 and 1, or the **square root** of a uniform random variate between 0 and 1: (1) Generate two uniform PSRNs **a** and **b** each with a positive sign, an integer part of 0, and an empty fractional part. (2) Run **RandLess** on **a** and **b** in that order.  If the call returns 0, return **a**; otherwise, return **b**.

The **RandLessThanReal** algorithm compares a PSRN **a** with a real number **b** and returns 1 if **a** turns out to be less than **b** with probability 1, or 0 otherwise.  This algorithm samples digits of **a**'s fractional part as necessary.  This algorithm works whether **b** is known to be a rational number or not (for example, **b** can be the result of an expression such as `exp(-2)` or `ln(20)`), but the algorithm notes how it can be more efficiently implemented if **b** is known to be a rational number.

1. If **a**'s integer part or sign is unsampled, return an error.
2. Set _bs_ to &minus;1 if **b** is less than 0, or 1 otherwise. Calculate floor(abs(**b**)), and set _bi_ to the result. (_If **b** is known rational:_ Then set _bf_ to abs(**b**) minus _bi_.)
3. If **a**'s sign is different from _bs_'s sign, return 1 if **a**'s sign is negative and 0 if it's positive.  If **a**'s sign is positive, return 1 if **a**'s integer part is less than _bi_, or 0 if greater. (Continue if both are equal.)  If **a**'s sign is negative, return 0 if **a**'s integer part is less than _bi_, or 1 if greater. (Continue if both are equal.)
4. Set _i_ to 0.
5. If the digit at position _i_ of **a**'s fractional part is unsampled, set the digit at that position according to the kind of PSRN **a** is. (Positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.)
6. Calculate the base-_&beta;_ digit at position _i_ of **b**'s fractional part, and set _d_ to that digit. (_If **b** is known rational:_ Do this step by multiplying _bf_ by _&beta;_, then setting _d_ to floor(_bf_), then subtracting _d_ from _bf_.)
7. Let _ad_ be the digit at position _i_ of **a**'s fractional part.
8. Return 1 if&mdash;
    - _ad_ is less than _d_ and **a**'s sign is positive,
    - _ad_ is greater than _d_ and **a**'s sign is negative, or
    - _ad_ is equal to _d_, **a**'s sign is negative, and&mdash;
        - _**b** is not known to be rational_ and all the digits after the digit at position _i_ of **b**'s fractional part are zeros (indicating **a** is less than **b** with probability 1), or
        - _**b** is known to be rational_ and _bf_ is 0 (indicating **a** is less than **b** with probability 1).
9. Return 0 if&mdash;
    - _ad_ is less than _d_ and **a**'s sign is negative,
    - _ad_ is greater than _d_ and **a**'s sign is positive, or
    - _ad_ is equal to _d_, **a**'s sign is positive, and&mdash;
        - _**b** is not known to be rational_ and all the digits after the digit at position _i_ of **b**'s fractional part are zeros (indicating **a** is greater than **b** with probability 1), or
        - _**b** is known to be rational_ and _bf_ is 0 (indicating **a** is greater than **b** with probability 1).
10. Add 1 to _i_ and go to step 5.

An alternative version of steps 6 through 9 in the algorithm above are as follows (see also (Brassard et al. 2019\)[^19]):

- (6.) Calculate _bp_, which is an approximation to **b** such that abs(**b** &minus; _bp_) <= _&beta;_<sup>&minus;_i_ &minus; 1</sup>, and such that _bp_ has the same sign as **b**.  Let _bk_ be _bp_'s digit expansion up to the _i_ + 1 digits after the point (ignoring its sign).  For example, if **b** is &pi; or &minus;&pi;, _&beta;_ is 10, and _i_ is 4, one possibility is _bp_ = 3.14159 and _bk_ = 314159.
- (7.) Let _ak_ be **a**'s digit expansion up to the _i_ + 1 digits after the point (ignoring its sign).
- (8.) If _ak_ <= _bk_ &minus; 2, return either 1 if **a**'s sign is positive or 0 otherwise.
- (9.) If _ak_ >= _bk_ + 1, return either 1 if **a**'s sign is negative or 0 otherwise.[^20]

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
9. If _c_ is 1, set _num_ to _num_ \* _pt_ &minus; _den_ \* _d2_, then multiply _den_ by _pt_.
10. If _num_ is 0, return either 0 if **a**'s sign is positive, or 1 otherwise.
11. Multiply _pt_ by _base_, add 1 to _i_, and go to step 5.

<a id=Discussion></a>
### Discussion

This section discusses issues involving arithmetic with PSRNs.

**Uniform PSRN arithmetic produces non-uniform distributions in general.** As can be seen in the arithmetic algorithms earlier in this section (such as **UniformAdd** and **UniformMultiplyRational**), addition, multiplication, and other arithmetic operations with PSRNs (see also (Brassard et al., 2019\)[^19]) are not as trivial as adding, multiplying, etc. their integer and fractional parts.  A uniform PSRN is ultimately a uniform random variate inside an interval (this is its nature), yet arithmetic on random variates does not produce a uniform distribution in general.

An example illustrates this. Say we have two uniform PSRNs: _A_ = 0.12345... and _B_ = 0.38901....  They represent random variates in the intervals _AI_ = \[0.12345, 0.12346\] and _BI_ = \[0.38901, 0.38902\], respectively.  Adding two uniform PSRNs is akin to adding their intervals (using interval arithmetic), so that in this example, the result _C_ lies in _CI_ = \[0.12345 + 0.38901, 0.12346 + 0.38902\] = \[0.51246, 0.51248\].  However, the resulting random variate is _not_ uniformly distributed in \[0.51246, 0.51248\], so that simply choosing a uniform random variate in the interval won't work.  (This is true in general for other arithmetic operations besides addition.)  This can be demonstrated by generating many pairs of uniform random variates in the intervals _AI_ and _BI_, summing the numbers in each pair, and building a histogram using the sums (which will all lie in the interval _CI_).  In this case, the histogram will show a triangular distribution that peaks at 0.51247.

The example applies in general to most other math operations besides addition (including multiplication, division, `log`, `sin`, and so on): do the math operation on the intervals _AI_ and _BI_, and build a histogram of random results (products, quotients, etc.) that lie in the resulting interval to find out what distribution forms this way.

**Implementing other operations.** In contrast to addition, multiplication, and division, certain other math operations are trivial to carry out in PSRNs.  They include negation, as mentioned in (Karney 2016\)[^1], and operations affecting the PSRN's integer part only.

A promising way to connect PSRNs with other math operations (such as multiplication, `ln`, and `exp`) is to use "constructive reals" or "recursive reals".  See the section "Relation to Constructive Reals", earlier.

A sampler can be created that uses the probabilities of getting each digit under the target distribution.  But if the distribution is non-discrete:

- These probabilities will depend on previous digits except for a very limited class of distributions (including uniform and exponential); see the [**appendix**](#Setting_Digits_by_Digit_Probabilities) for details.
- For distributions outside that limited class, the sampler will be _limited-precision_ (not _arbitrary-precision_) in practice, since it can hold only so many digit probabilities.  For example, the works (Habibizad Navin et al., 2007\)[^21], (Nezhad et al., 2013\)[^22] point to building a "tree" of such digit probabilities. [^23]

Finally, arithmetic with PSRNs may be possible if the result of the arithmetic is distributed with a known probability density function (PDF), allowing for an algorithm that implements rejection from the uniform or exponential distribution.  An example of this is found in the **UniformReciprocal** algorithm above.  However, that PDF may have an unbounded peak, thus ruling out rejection sampling in practice.  For example, if _X_ is a uniform PSRN in the interval [0, 1], then the distribution of _X_<sup>3</sup> has the PDF `(1/3) / pow(X, 2/3)`, which has an unbounded peak at 0.  While this rules out plain rejection samplers for _X_<sup>3</sup> in practice, it's still possible to sample powers of uniforms using PSRNs, which will be described later in this article.

**Reusing PSRNs.** The arithmetic algorithms in this section may give incorrect results if the _same PSRN_ is used more than once in different runs of these algorithms.

This issue happens in general when the original sampler uses the same random variate for different purposes in the algorithm (an example is "_W_\*_Y_, (1&minus;_W_)\*_Y_", where _W_ and _Y_ are independent random variates (Devroye 1986, p. 394\)[^24]).  In this case, if one PSRN spawns additional PSRNs (so that they become _dependent_ on the first), those additional PSRNs may become inaccurate once additional digits of the first PSRN are sampled uniformly at random. (This is not always the case, but it's hard to characterize when the additional PSRNs become inaccurate this way and when not.)

This issue is easy to see for the **UniformAddRational** or **UniformMultiplyRational** algorithm when it's called more than once with the same PSRN and the same rational number:  although the same random variate ought to be returned each time, in reality different variates will be generated this way with probability 1, especially when additional digits are sampled from them afterwards.

It might be believed that the issue just described could be solved by the algorithm below:

_Assume we want to multiply the same PSRN by different numbers.  Let vec be a vector of rational numbers to multiply the same PSRN by, and let vec\[i\] be the rational number at position i of the vector (positions start at 0)._

1. _Set i to 0, set **a** to the input PSRN, set num to vec\[i\], and set 'output' to an empty list._
2. _Set ret to the result of **UniformMultiplyRational** with the PSRN **a** and the rational number num._
3. _Add a pointer to ret to the list 'output'.  If vec\[i\] was the last number in the vector, stop this algorithm._
4. _Set **a** to point to ret, then add 1 to i, then set num to vec\[i\]/vec\[i&minus;1\], then go to step 2._

However, even this algorithm doesn't ensure that the output PSRNs will be exactly proportional to the same random variate.  An example: Let **a** be the PSRN 0.... (or the interval \[0.0, 1.0\]), then let **b** be the result of **UniformMultiplyRational**(**a**, 1/2), then let **c** be the result of **UniformMultiplyRational**(**b**, 1/3).  One possible result for **b** is 0.41... and for **c** is 0.138.... Now we fill **a**, **b**, and **c** with uniform random bits.  Thus, as one possible result, **a** is now 0.13328133..., **b** is now 0.41792367..., and **c** is now 0.13860371....  Here, however, **c** divided by **b** is not exactly 1/3, although it's close, and **b** divided by **a** is far from 1/2 (especially since **a** was very coarse to begin with). Although this example shows PSRNs with decimal digits, the situation is worse with binary digits.

<a id=Building_Blocks></a>
## Building Blocks

This document relies on several building blocks described in this section.

One of them is the "geometric bag" technique by Flajolet and others (2010\)[^7], which generates heads or tails with a probability that is built up digit by digit.

<a id=SampleGeometricBag></a>
### SampleGeometricBag

The algorithm **SampleGeometricBag** returns 1 with a probability built up by a uniform PSRN's fractional part.  (Flajolet et al., 2010\)[^7] described an algorithm for the base-2 (binary) case, but that algorithm is difficult to apply to other digit bases.  Thus the following is a general version of the algorithm for any digit base.  For convenience, this algorithm ignores the PSRN's integer part and sign.

1. Set _i_ to 0, and set **b** to a uniform PSRN with a positive sign and an integer part of 0.
2. If the item at position _i_ of the input PSRN's fractional part is unsampled (that is, not set to a digit), set the item at that position to a digit chosen uniformly at random, increasing the fractional part's capacity as necessary (positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.), and append the result to that fractional part's digit expansion.  Do the same for **b**.
3. Let _da_ be the digit at position _i_ of the input PSRN's fractional part, and let _db_ be the corresponding digit for **b**.  Return 0 if _da_ is less than _db_, or 1 if _da_ is greater than _db_.
5. Add 1 to _i_ and go to step 2.

For base 2, the following **SampleGeometricBag** algorithm can be used, which is closer to the one given in the Flajolet paper.  It likewise ignores the input PSRN's integer part and sign.

1.  Set _N_ to 0.
2.  With probability 1/2, go to the next step.  Otherwise, add 1 to _N_ and repeat this step. (When the algorithm moves to the next step, _N_ is what the Flajolet paper calls a _geometric_ random variate (with parameter 1/2), hence the name "geometric bag", but the terminology "geometric random variate" is avoided in this article since it has several conflicting meanings in academic works.)
3.  If the item at position _N_ in the uniform PSRN's fractional part (positions start at 0) is not set to a digit (for example, 0 or 1 for base 2), set the item at that position to a digit chosen uniformly at random (for example, either 0 or 1 for base 2), increasing the fractional part's capacity as necessary.  (As a result of this step, there may be "gaps" in the uniform PSRN where no digit was sampled yet.)
4.  Return the item at position _N_.

For more on why these two algorithms are equivalent, see the appendix.

**SampleGeometricBagComplement** is the same as the **SampleGeometricBag** algorithm, except the return value is 1 minus the original return value.  The result is that if **SampleGeometricBag** outputs 1 with probability _U_, **SampleGeometricBagComplement** outputs 1 with probability 1 &minus; _U_.

<a id=FillGeometricBag></a>
### FillGeometricBag

**FillGeometricBag** takes a uniform PSRN and generates a number whose fractional part has `p` digits as follows:

1. For each position in \[0, `p`), if the item at that position in the uniform PSRN's fractional part is unsampled, set the item there to a digit chosen uniformly at random (for example, either 0 or 1 for binary), increasing the fractional part's capacity as necessary. (Positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.  See also (Oberhoff 2018, sec. 8\)[^13].)
2. Let `sign` be -1 if the PSRN's sign is negative, or 1 otherwise; let `ipart` be the PSRN's integer part; and let `bag` be the PSRN's fractional part.  Take the first `p` digits of `bag` and return `sign` * (`ipart` + bag[0] * _b_<sup>&minus;0&minus;1</sup> + bag[1] * _b_<sup>&minus;1&minus;1</sup> + ... + bag[`p`&minus;1] * _b_<sup>&minus;(`p`&minus;1)&minus;1</sup>), where _b_ is the base, or radix.

After step 2, if it somehow happens that digits beyond `p` in the PSRN's fractional part were already sampled (that is, they were already set to a digit), then the implementation could choose instead to fill all unsampled digits between the first and the last set digit and return the full number, optionally rounding it to a number whose fractional part has `p` digits, with a rounding mode of choice. (For example, if `p` is 4, _b_ is 10, and the PSRN is 0.3437500... or 0.3438500..., it could use a round-to-nearest mode to round the PSRN to the number 0.3438 or 0.3439, respectively; because this is a PSRN with an "infinite" but unsampled digit expansion, there is no tie-breaking such as "ties to even" applied here.)

<a id=kthsmallest></a>
### kthsmallest

The **kthsmallest** method generates the 'k'th smallest 'bitcount'-digit uniform random variate in the interval \[0, 1\] out of 'n' of them (also known as the 'n'th _order statistic_), is also relied on by this beta sampler.  It is used when both `a` and `b` are integers, based on the known property that a beta random variate in this case is the `a`th smallest uniform random variate between 0 and 1 out of `a + b - 1` of them (Devroye 1986, p. 431\)[^24].

**kthsmallest**, however, doesn't simply generate 'n' 'bitcount'-digit numbers and then sort them.  Rather, it builds up their digit expansions digit by digit, via PSRNs.    It uses the observation that (in the binary case) each uniform random variate between 0 and 1 is either less than half or greater than half with equal probability; thus, the number of uniform numbers that are less than half vs. greater than half follows a binomial(n, 1/2) distribution (and of the numbers less than half, say, the less-than-one-quarter vs. greater-than-one-quarter numbers follows the same distribution, and so on).    Thanks to this observation, the algorithm can generate a sorted sample "on the fly".  A similar observation applies to other bases than base 2 if we use the multinomial distribution instead of the binomial distribution.  I am not aware of any other article or paper (besides one by me) that describes the **kthsmallest** algorithm given here.

The algorithm is as follows:

1. Create `n` uniform PSRNs with positive sign and an integer part of 0.
2. Set `index` to 1.
3. If `index <= k` and `index + n >= k`:
    1. Generate **v**, a multinomial random vector with _b_ probabilities equal to 1/_b_, where _b_ is the base, or radix (for the binary case, _b_ = 2, so this is equivalent to generating `LC`, a binomial random variate with parameters `n` and 0.5, and setting **v** to {`LC`, `n - LC`}).
    2. Starting at `index`, append the digit 0 to the first **v**\[0\] PSRNs, a 1 digit to the next **v**\[1\] PSRNs, and so on to appending a _b_ &minus; 1 digit to the last **v**\[_b_ &minus; 1\] PSRNs (for the binary case, this means appending a 0 bit to the first `LC` PSRNs and a 1 bit to the next `n - LC` PSRNs).
    3. For each integer _i_ in \[0, _b_): If **v**\[_i_\] > 1, repeat step 3 and these substeps with `index` = `index` + **v**\[0\] + **v**\[1\] + ... + **v**\[_i_ &minus; 1\] and `n` = **v**\[_i_\]. (For the binary case, this means: If `LC > 1`, repeat step 3 and these substeps with the same `index` and `n = LC`; then, if `n - LC > 1`, repeat step 3 and these substeps with `index = index + LC`, and `n = n - LC`).
4. Take the `k`th PSRN (starting at 1), then optionally fill it with uniform random digits as necessary to give its fractional part `bitcount` many digits (similarly to **FillGeometricBag** above), then return that number.  (Note that the beta sampler  described later chooses to fill the PSRN this way via this algorithm.)

<a id=Power_of_Uniform_Sub_Algorithm></a>
### Power-of-Uniform Sub-Algorithm

The power-of-uniform sub-algorithm is used for certain cases of the beta sampler below.  It returns _U_<sup>_px_/_py_</sup>, where _U_ is a uniform random variate in the interval \[0, 1\] and _px_/_py_ is greater than 1, but unlike the naïve algorithm it supports an arbitrary precision, uses only random bits, and avoids floating-point arithmetic.  It also uses a _complement_ flag to determine whether to return 1 minus the result.

It makes use of a number of algorithms as follows:

- It uses an algorithm for [**sampling unbounded monotone PDFs**](https://peteroupc.github.io/randmisc.html), which in turn is similar to the inversion-rejection algorithm in (Devroye 1986, ch. 7, sec. 4.4\)[^24].  This is needed because when _px_/_py_ is greater than 1, the distribution of _U_<sup>_px_/_py_</sup> has the PDF `(py/px) / pow(U, 1-py/px)`, which has an unbounded peak at 0.
- It uses a number of Bernoulli factory algorithms, including **SampleGeometricBag** and some algorithms described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)".

However, this algorithm currently only supports generating a PSRN with base-2 (binary) digits in its fractional part.

The power-of-uniform algorithm is as follows:

1. Set _i_ to 1.
2. Call the **algorithm for (_a_/_b_)<sup>_x_/_y_</sup>** described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", with parameters `a = 1, b = 2, x = py, y = px`.  If the call returns 1 and _i_ is less than _n_, add 1 to _i_ and repeat this step.  If the call returns 1 and _i_ is _n_ or greater, return 1 if the _complement_ flag is 1 or 0 otherwise (or return a uniform PSRN with a positive sign, an integer part of 0, and a fractional part filled with exactly _n_ ones or zeros, respectively).
3. As a result, we will now sample a number in the interval \[2<sup>&minus;_i_</sup>, 2<sup>&minus;(_i_ &minus; 1)</sup>).  We now have to generate a uniform random variate _X_ in this interval, then accept it with probability (_py_ / (_px_ * 2<sup>_i_</sup>)) / _X_<sup>1 &minus; _py_ / _px_</sup>; the 2<sup>_i_</sup> in this formula is to help avoid very low probabilities for sampling purposes.  The following steps will achieve this without having to use floating-point arithmetic.
4. Create a positive-sign zero-integer-part uniform PSRN, then create a _geobag_ input coin that returns the result of **SampleGeometricBag** on that PSRN.
5. Create a _powerbag_ input coin that does the following: "Call the  **algorithm for _&lambda;_<sup>_x_/_y_</sup>**, described in '[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html#lambda__x___y)', using the _geobag_ input coin and with _x_/_y_ = 1 &minus; _py_ / _px_, and return the result."
6. Append _i_ &minus; 1 zero-digits followed by a single one-digit to the PSRN's fractional part.  This will allow us to sample a uniform random variate limited to the interval mentioned earlier.
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
2. If _a_ > 2 and _b_ > 2, do the following steps, which split _a_ and _b_ into two parts that are faster to simulate (and implement the generalized rejection strategy in (Devroye 1986, top of page 47\)[^24]):
    1. Set _aintpart_ to floor(_a_) &minus; 1, set _bintpart_ to floor(_b_) &minus; 1, set _arest_ to _a_ &minus; _aintpart_, and set _brest_ to _b_ &minus; _bintpart_.
    2. Do a separate (recursive) run of this algorithm, but with _a_ = _aintpart_ and _b_ = _bintpart_. Set _bag_ to the PSRN created by the run.
    3. Create an input coin _geobag_ that returns the result of **SampleGeometricBag** using the given PSRN.  Create another input coin _geobagcomp_ that returns the result of **SampleGeometricBagComplement** using the given PSRN.
    4. Call the **algorithm for _&lambda;_<sup>_x_/_y_</sup>**, described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", using the _geobag_ input coin and _x_/_y_ = _arest_/1, then call the same algorithm using the _geobagcomp_ input coin and _x_/_y_ = _brest_/1. If both calls return 1, return _bag_. Otherwise, go to substep 2.
3. Create an positive-sign zero-integer-part uniform PSRN.  Create an input coin _geobag_ that returns the result of **SampleGeometricBag** using the given PSRN.  Create another input coin _geobagcomp_ that returns the result of **SampleGeometricBagComplement** using the given PSRN.
4. Remove all digits from the PSRN's fractional part.  This will result in an "empty" uniform random variate between 0 and 1, _U_, for the following steps, which will accept _U_ with probability _U_<sup>a&minus;1</sup>*(1&minus;_U_)<sup>b&minus;1</sup> (the proportional probability for the beta distribution), as _U_ is built up.
5. Call the **algorithm for _&lambda;_<sup>_x_/_y_</sup>**, described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", using the _geobag_ input coin and _x_/_y_ = _a_ &minus; 1)/1 (thus returning with probability _U_<sup>a&minus;1</sup>).  If the result is 0, go to step 4.
6. Call the same algorithm using the _geobagcomp_ input coin and _x_/_y_ = (_b_ &minus; 1)/1 (thus returning 1 with probability (1&minus;_U_)<sup>b&minus;1</sup>).  If the result is 0, go to step 4. (Note that this step and the previous step don't depend on each other and can be done in either order without affecting correctness, and this is taken advantage of in the Python code below.)
7. _U_ was accepted, so return the result of **FillGeometricBag**.

Once a PSRN is accepted by the steps above, optionally fill the unsampled digits of the PSRN's fractional part with uniform random digits as necessary to give the number a _p_-digit fractional part (similarly to **FillGeometricBag**), then return the resulting number.

> **Notes:**
>
> - A beta random variate with parameters 1/_x_ and 1 is the same as a uniform random variate in [0, 1] raised to the power of _x_.
> - For the beta distribution, the bigger `alpha` or `beta` is, the smaller the area of acceptance becomes (and the greater the probability that random variates get rejected by steps 5 and 6, raising its run-time).  This is because `max(u^(alpha-1)*(1-u)^(beta-1))`, the peak of the PDF, approaches 0 as the parameters get bigger.  To deal with this, step 2 was included, which under certain circumstances breaks the PDF into two parts that are relatively trivial to sample (in terms of bit complexity).

<a id=Exponential_Distribution></a>
### Exponential Distribution

We also have the necessary building blocks to describe how to sample e-rands.  An e-rand consists of four numbers: the first is a multiple of 1/(2<sup>_k_</sup>), the second is _k_, the third is the integer part (initially &minus;1 to indicate the integer part wasn't sampled yet), and the fourth, _&lambda;_, is the rate parameter of the exponential distribution (_&lambda;_>0). (Because exponential random variates are always 0 or greater, the e-rand's sign is implicitly positive.)  In the Python code, e-rands are as described, except _&lambda;_ must be a rational number and its numerator and denominator take up a parameter each.

To sample bit _k_ after the binary point of an exponential random variate with rate _&lambda;_ (where _k_ = 1 means the first digit after the point, _k_ = 2 means the second, etc.), call the **LogisticExp** algorithm (see "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html") with _z_=_&lambda;_ and _prec_ = _k_.

The **ExpRandLess** algorithm is a special case of the general **RandLess** algorithm given earlier.  It compares two e-rands **a** and **b** (and samples additional bits from them as necessary) and returns 1 if **a** turns out to be less than **b**, or 0 otherwise. (Note that **a** and **b** are allowed to have different _&lambda;_ parameters.)

1. If **a**'s integer part wasn't sampled yet, call the **ExpMinus** algorithm (see "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html") with _z_=_&lambda;_, until the call returns 0, then set the integer part to the number of times 1 was returned this way.  Do the same for **b**.
2. Return 1 if **a**'s integer part is less than **b**'s, or 0 if **a**'s integer part is greater than **b**'s.
3. Set _i_ to 0.
4. If **a**'s fractional part has _i_ or fewer bits, call the **LogisticExp** algorithm (see "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html") with _z_=_&lambda;_ and _prec_ = _i_ + 1, and append the result to that fractional part's binary expansion.  (For example, if the implementation stores the binary expansion as a packed integer and a size, the implementation can shift the packed integer by 1, add the result of the algorithm to that integer, then add 1 to the size.) Do the same for **b**.
5. Return 1 if **a**'s fractional part is less than **b**'s, or 0 if **a**'s fractional part is greater than **b**'s.
6. Add 1 to _i_ and go to step 4.

The **ExpRandFill** algorithm takes an e-rand and generates a number whose fractional part has `p` digits as follows:

1. For each position _i_ in \[0, `p`), if the item at that position in the e-rand's fractional part is unsampled, call the **LogisticExp** algorithm (see "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html") with _z_=_&lambda;_ and _prec_ = _i_ + 1, and set the item at position _i_ to the result (which will be either 0 or 1), increasing the fractional part's capacity as necessary. (Bit positions start at 0 where 0 is the most significant bit after the point, 1 is the next, etc.  See also (Oberhoff 2018, sec. 8\)[^13].)
2. Let `sign` be -1 if the e-rand's sign is negative, or 1 otherwise; let `ipart` be the e-rand's integer part; and let `bag` be the PSRN's fractional part.  Take the first `p` digits of `bag` and return `sign` * (`ipart` + bag[0] * 2<sup>&minus;0&minus;1</sup> + bag[1] * 2<sup>&minus;1&minus;1</sup> + ... + bag[`p`&minus;1] * 2<sup>&minus;(`p`&minus;1)&minus;1</sup>).

See the discussion in **FillGeometricBag** for advice on how to handle the case when it somehow happens that bits beyond `p` in the PSRN's fractional part were already sampled (that is, they were already set to a digit) after step 2 of this algorithm.

Here is a third algorithm (called **ExpRand**) that generates a _uniform PSRN_, rather than an e-rand, that follows the exponential distribution.   In the algorithm, the rate _&lambda;_ is given as a rational number greater than 0.  The method is based on von Neumann's algorithm (von Neumann 1951\)[^9].

1. Set _recip_ to 1/_&lambda;_, and set _highpart_ to 0.
2. Set _u_ to the result of **RandUniformFromReal** with the parameter _recip_.
3. Set _val_ to point to the same value as _u_, and set _accept_ to 1.
4. Set _v_ to the result of **RandUniformFromReal** with the parameter _recip_.
5. Run the **URandLess** algorithm on _u_ and _v_, in that order.  If the call returns 0, set _u_ to _v_, then set _accept_ to 1 minus _accept_, then go to step 4.
6. If _accept_ is 1, add _highpart_ to _val_ via the **UniformAddRational** algorithm given earlier, then return _val_.
7. Add _recip_ to _highpart_ and go to step 2.

The following alternative version of the previous algorithm (called **ExpRand2**) includes Karney's improvement to the von Neumann algorithm (Karney 2016\)[^1], namely a so-called "early rejection step". The algorithm here allows an arbitrary rate parameter (_&lambda;_), given as a rational number greater than 0, unlike with the von Neumann and Karney algorithms, where _&lambda;_ is 1.

1. Set _recip_ to 1/_&lambda;_, and set _highpart_ to 0.
2. Set _u_ to the result of **RandUniformFromReal** with the parameter _recip_.
3. Run the **URandLessThanReal** algorithm on _u_ with the parameter _recip_/2.  If the call returns 0, add _recip_/2 to _highpart_ and go to step 2.  (This is Karney's "early rejection step", where the parameter is 1/2 when _&lambda;_ is 1.  However, Fan et al. (2019\)[^25] point out that the parameter 1/2 in Karney's "early rejection step" is not optimal.)
4. Set _val_ to point to the same value as _u_, and set _accept_ to 1.
5. Set _v_ to the result of **RandUniformFromReal** with the parameter _recip_.
6. Run the **URandLess** algorithm on _u_ and _v_, in that order.  If the call returns 0, set _u_ to _v_, then set _accept_ to 1 minus _accept_, then go to step 5.
7. If _accept_ is 1, add _highpart_ to _val_ via the **UniformAddRational** algorithm given earlier, then return _val_.
8. Add **_recip_/2** to _highpart_ and go to step 2.

> **Note:** A Laplace (double exponential) random variate is then implemented by giving the PSRN returned by **ExpRand** or **ExpRand2** a random sign (with equal probability, the PSRN's sign is either positive or negative).

<a id=Sampler_Code></a>
## Sampler Code

The following Python code implements the beta sampler described in this document.  It relies on two Python modules I wrote:

- "[**bernoulli.py**](https://github.com/peteroupc/peteroupc.github.io/blob/master/bernoulli.py)", which collects a number of Bernoulli factories, some of which are relied on by the code below.
- "[**randomgen.py**](https://github.com/peteroupc/peteroupc.github.io/blob/master/randomgen.py)", which collects a number of random variate generation methods, including `kthsmallest`, as well as the `RandomGen` class.

Note that the code uses floating-point arithmetic only to convert the result of the sampler to a convenient form, namely a floating-point number.

This code is far from fast, though, at least in Python.

The Python code below supports only rational-valued _&lambda;_ parameters in the exponential sampler.

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
        return []  # Empty uniform random variate
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
        # of a uniform random variate, provided px/py
        # is in (0, 1].
        return betadist(b, py, px, 1, 1, precision)

    return b.fill_geometric_bag(
        betadist_geobag(b, ax, ay, bx, by), precision
    )

def betadist_geobag(b, ax=1, ay=1, bx=1, by=1):
    """ Generates a beta-distributed random variate with arbitrary
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
        return _urand_to_geobag(randomgen.RandomGen().kthsmallest_psrn(a + b - 1, a))
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
        # Create a uniform random variate (U) bit-by-bit, and
        # accept it with probability U^(a-1)*(1-U)^(b-1), which
        # is the unnormalized PDF of the beta distribution
        bag.clear()
        if bp1() == 1:
            # Accepted
            return ret

def _fill_geometric_bag(b, bag, precision):
        ret = 0
        lb = min(len(bag), precision)
        for i in range(lb):
            if i >= len(bag) or bag[i] == None:
                ret = (ret << 1) | b.rndint(1)
            else:
                ret = (ret << 1) | bag[i]
        if len(bag) < precision:
            diff = precision - len(bag)
            ret = (ret << diff) | b.rndint((1 << diff) - 1)
        # Now we have a number that is a multiple of
        # 2^-precision.
        return ret / (1 << precision)

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

In the following Python code, `add_psrns` is a method to generate the result of multiplying or adding two uniform PSRNs, respectively.

```
def psrn_reciprocal(psrn1, digits=2):
    """ Generates the reciprocal of a partially-sampled random number.
        psrn1: List containing the sign, integer part, and fractional part
            of the first PSRN.  Fractional part is a list of digits
            after the point, starting with the first.
        digits: Digit base of PSRNs' digits.  Default is 2, or binary. """
    if psrn1[0] == None or psrn1[1] == None:
        raise ValueError
    for i in range(len(psrn1[2])):
        psrn1[2][i] = (
            random.randint(0, digits - 1) if psrn1[2][i] == None else psrn1[2][i]
        )
    digitcount = len(psrn1[2])
    # Perform multiplication
    frac1 = psrn1[1]
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn1[2][i]
    while frac1 == 0:
        # Avoid degenerate cases
        d1 = random.randint(0, digits - 1)
        psrn1[2].append(d1)
        frac1 = frac1 * digits + d1
        digitcount += 1
    while True:
        dcount = digitcount
        ddc = digits ** dcount
        small = Fraction(ddc, frac1 + 1)
        large = Fraction(ddc, frac1)
        if small>large: raise ValueError
        if small==0: raise ValueError
        while True:
           dc = int(small * ddc)
           if dc!=0: break
           dcount+=1
           ddc*=digits
        if dc == 0:
             print(["dc",dc,"dc/ddc",float(Fraction(dc,ddc)),"small",float(small),"dcount",dcount,"psrn",psrn1])
        dc2 = int(large * ddc) + 1
        rv = random.randint(dc, dc2 - 1)
        rvx = random.randint(0, dc - 1)
        # print([count,float(small), float(large),dcount, dc/ddc, dc2/ddc])
        while True:
            rvsmall = Fraction(rv, ddc)
            rvlarge = Fraction(rv + 1, ddc)
            if rvsmall >= small and rvlarge < large:
                rvd = Fraction(dc, ddc)
                rvxf = Fraction(rvx, dc)
                rvxf2 = Fraction(rvx + 1, dc)
                # print(["dcs",rvx,"rvsmall",float(rvsmall),"rvlarge",float(rvlarge),"small",float(small),
                #   "rvxf",float(rvxf),float(rvxf2),"rvd",float(rvd),
                #   "sl",float((rvd*rvd)/(rvlarge*rvlarge)),float((rvd*rvd)/(rvsmall*rvsmall))])
                if rvxf2 < (rvd * rvd) / (rvlarge * rvlarge):
                    cpsrn = [1, 0, [0 for i in range(dcount)]]
                    cpsrn[0] = psrn1[0]
                    sret = rv
                    for i in range(dcount):
                        cpsrn[2][dcount - 1 - i] = sret % digits
                        sret //= digits
                    cpsrn[1] = sret
                    return cpsrn
                elif rvxf > (rvd * rvd) / (rvsmall * rvsmall):
                    break
            elif rvsmall > large or rvlarge < small:
                break
            rv = rv * digits + random.randint(0, digits - 1)
            rvx = rvx * digits + random.randint(0, digits - 1)
            dcount += 1
            ddc *= digits
            dc *= digits

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
    while True:
        dcount = digitcount
        ddc = digits ** dcount
        small = Fraction(frac1, ddc) * absfrac
        large = Fraction(frac1 + 1, ddc) * absfrac
        dc = int(small * ddc)
        dc2 = int(large * ddc) + 1
        rv = random.randint(dc, dc2 - 1)
        while True:
            rvsmall = Fraction(rv, ddc)
            rvlarge = Fraction(rv + 1, ddc)
            if rvsmall >= small and rvlarge < large:
                cpsrn = [1, 0, [0 for i in range(dcount)]]
                cpsrn[0] = psrn1[0] * fracsign
                sret = rv
                for i in range(dcount):
                    cpsrn[2][dcount - 1 - i] = sret % digits
                    sret //= digits
                cpsrn[1] = sret
                return cpsrn
            elif rvsmall > large or rvlarge < small:
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
    isinteger = absfrac.denominator == 1
    # Special cases
    # positive+pos. integer or negative+neg. integer
    if ((fracsign < 0) == (psrn[0] < 0)) and isinteger and len(psrn[2]) == 0:
        return [fracsign, psrn[1] + int(absfrac), []]
    # PSRN has no fractional part, fraction is integer
    if (
        isinteger
        and psrn[0] == 1
        and psrn[1] == 0
        and len(psrn[2]) == 0
        and fracsign < 0
    ):
        return [fracsign, int(absfrac) - 1, []]
    if (
        isinteger
        and psrn[0] == 1
        and psrn[1] == 0
        and len(psrn[2]) == 0
        and fracsign > 0
    ):
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

<a id=Correctness_Testing></a>
## Correctness Testing

&nbsp;

<a id=Beta_Sampler></a>
### Beta Sampler

To test the correctness of the beta sampler presented in this document, the Kolmogorov&ndash;Smirnov test was applied with various values of `alpha` and `beta` and the default precision of 53, using SciPy's `kstest` method.  The code for the test is very simple: `kst = scipy.stats.kstest(ksample, lambda x: scipy.stats.beta.cdf(x, alpha, beta))`, where `ksample` is a sample of random variates generated using the sampler above.  This test can be used because the beta distribution has a probability density function; independently sampled variates from the distribution are tested; and the distribution's parameters are known. Note that SciPy uses a two-sided Kolmogorov&ndash;Smirnov test by default.

See the results of the [**correctness testing**](https://peteroupc.github.io/betadistresults.html).   For each pair of parameters, five samples with 50,000 numbers per sample were taken, and results show the lowest and highest Kolmogorov&ndash;Smirnov statistics and p-values achieved for the five samples.  If p-values tend to be close to 0 (or close to 1, since this test is two-sided), then this is evidence that the samples do not come from the corresponding beta distribution.

<a id=ExpRandFill></a>
### ExpRandFill

To test the correctness of the `exprandfill` method (which implements the **ExpRandFill** algorithm), the Kolmogorov&ndash;Smirnov test was applied with various values of _&lambda;_ and the default precision of 53, using SciPy's `kstest` method.  The code for the test is very simple: `kst = scipy.stats.kstest(ksample, lambda x: scipy.stats.expon.cdf(x, scale=1/lamda))`, where `ksample` is a sample of random variates generated using the `exprand` method above.  This test can be used because the exponential distribution has a probability density function; independently sampled variates from the distribution are tested; and the distribution's parameters are known.  Note that SciPy uses a two-sided Kolmogorov&ndash;Smirnov test by default.

The table below shows the results of the correctness testing. For each parameter, five samples with 50,000 numbers per sample were taken, and results show the lowest and highest Kolmogorov&ndash;Smirnov statistics and p-values achieved for the five samples.  If p-values tend to be close to 0 (or close to 1, since this test is two-sided), then this is evidence that the samples do not come from the corresponding beta distribution.

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

To test the correctness of `exprandless`, a two-independent-sample T-test was applied to scores involving e-rands and scores involving the Python `random.expovariate` method.  Specifically, the score is calculated as the number of times one exponential variate compares as less than another; for the same _&lambda;_ this event should have the same probability as the event that it compares as greater.  (In fact, this should be the case for _any_ pair of independent random variates of the same non-degenerate distribution; see proposition 2 in my note on [**randomness extraction**](https://peteroupc.github.io/randextract.html).)  The Python code that follows the table calculates this score for e-rands and `expovariate`.   Even here, the code for the test is very simple: `kst = scipy.stats.ttest_ind(exppyscores, exprandscores)`, where `exppyscores` and `exprandscores` are each lists of 20 results from `exppyscore` or `exprandscore`, respectively, and the results contained in `exppyscores` and `exprandscores` were generated independently of each other.

The table below shows the results of the correctness testing. For each pair of parameters, results show the lowest and highest T-test statistics and p-values achieved for the 20 results.  If p-values tend to be close to 0, then this is evidence that the exponential random variates are not compared as less or greater with the expected probability.

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

<a id=Accurate_Simulation_of_Continuous_Distributions></a>
## Accurate Simulation of Continuous Distributions

The following shows arbitrary-precision samplers for various continuous distributions using PSRNs.

<a id=General_Arbitrary_Precision_Samplers></a>
### General Arbitrary-Precision Samplers

&nbsp;

<a id=Uniform_Distribution_Inside_N_Dimensional_Shapes></a>
#### Uniform Distribution Inside N-Dimensional Shapes

The following is a general way to describe an arbitrary-precision sampler for generating a point uniformly at random inside a geometric shape located entirely in the hypercube [0, _d1_]&times;[0, _d2_]&times;...&times;[0,_dN_] in _N_-dimensional space, where _d1_, ..., _dN_ are integers greater than 0. The algorithm will generally work if the shape is reasonably defined; the technical requirements are that the shape must have a zero-volume (Lebesgue measure zero) boundary and a nonzero finite volume, and must assign zero probability to any zero-volume subset of it (such as a set of individual points).

The sampler's description has the following skeleton.

1. Generate _N_ empty uniform partially-sampled random numbers (PSRNs), with a positive sign, an integer part of 0, and an empty fractional part.  Call the PSRNs _p1_, _p2_, ..., _pN_.
2. Set _S_ to _base_, where _base_ is the base of digits to be stored by the PSRNs (such as 2 for binary or 10 for decimal).  Then set _N_ coordinates to 0, call the coordinates _c1_, _c2_, ..., _cN_.  Then set _d_ to 1.  Then, for each coordinate (_c1_, ..., _cN_), set that coordinate to an integer in [0, _dX_), chosen uniformly at random, where _dX_ is the corresponding dimension's size.
3. For each coordinate (_c1_, ..., _cN_), multiply that coordinate by _base_ and add a digit chosen uniformly at random to that coordinate.
4. This step uses a function known as **InShape**, which takes the coordinates of a box and returns one of three values: _YES_ if the box is entirely inside the shape; _NO_ if the box is entirely outside the shape; and _MAYBE_ if the box is partly inside and partly outside the shape, or if the function is unsure.  **InShape**, as well as the divisions of the coordinates by _S_, should be implemented using rational arithmetic.  Instead of dividing those coordinates this way, an implementation can pass _S_ as a separate parameter to **InShape**.  See the Implementation Notes for Box Shape Intersection, later in this section, for further implementation notes.  In this step, run **InShape** using the current box, whose coordinates in this case are ((_c1_/_S_, _c2_/_S_, ..., _cN_/_S_), ((_c1_+1)/_S_, (_c2_+1)/_S_, ..., (_cN_+1)/_S_)).
5. If the result of **InShape** is _YES_, then the current box was accepted.  If the box is accepted this way, then at this point, _c1_, _c2_, etc., will each store the _d_ digits of a coordinate in the shape, expressed as a number in the interval \[0, 1\], or more precisely, a range of numbers.  (For example, if _base_ is 10, _d_ is 3, and _c1_ is 342, then the first coordinate is 0.342..., or more precisely, a number in the interval \[0.342, 0.343\].)  In this case, do the following:
    1. For each coordinate (_c1_, ..., _cN_), transfer that coordinate's least significant digits to the corresponding PSRN's fractional part.  The variable _d_ tells how many digits to transfer to each PSRN this way. Then, for each coordinate (_c1_, ..., _cN_), set the corresponding PSRN's integer part to floor(_cX_/_base_<sup>_d_</sup>), where _cX_ is that coordinate.  (For example, if _base_ is 10, _d_ is 3, and _c1_ is 7342, set _p1_'s fractional part to \[3, 4, 2\] and _p1_'s integer part to 7.)
    2. For each PSRN (_p1_, ..., _pN_), optionally fill that PSRN with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**).
    3. For each PSRN, optionally do the following: Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), set that PSRN's sign to negative. (This will result in a symmetric shape in the corresponding dimension.  This step can be done for some PSRNs and not others.)
    4. Return the PSRNs _p1_, ..., _pN_, in that order.
6. If the result of **InShape** is _NO_, then the current box lies outside the shape and is rejected.  In this case, go to step 2.
7. If the result of **InShape** is _MAYBE_, it is not known whether the current box lies fully inside or fully outside the shape, so multiply _S_ by _base_, then add 1 to _d_, then go to step 3.

> **Notes:**
>
> 1. See Li and El Gamal [^26] and Oberhoff (2018)[^13] for related work on encoding random points uniformly distributed in a shape.
> 2. Rejection sampling on a shape is subject to the "curse of dimensionality", since typical shapes of high dimension will tend to cover much less volume than their bounding boxes, so that it would take a lot of time on average to accept a high-dimensional box.  Moreover, the more volume the shape takes up in the bounding box, the higher the acceptance rate.
> 3. Devroye (1986, chapter 8, section 3)[^24] describes grid-based methods to optimize random point generation.  In this case, the space is divided into a grid of boxes each with size 1/_base_<sup>_k_</sup> in all dimensions; the result of **InShape** is calculated for each such box and that box labeled with the result; all boxes labeled _NO_ are discarded; and the algorithm is modified by adding the following after step 2: "2a. Choose a precalculated box uniformly at random, then set _c1_, ..., _cN_ to that box's coordinates, then set _d_ to _k_ and set _S_ to _base_<sup>_k_</sup>. If a box labeled _YES_ was chosen, follow the substeps in step 5. If a box labeled _MAYBE_ was chosen, multiply _S_ by _base_ and add 1 to _d_." (For example, if _base_ is 10, _k_ is 1, _N_ is 2, and _d1_ = _d2_ = 1, the space could be divided into a 10&times;10 grid, made up of 100 boxes each of size (1/10)&times;(1/10).  Then, **InShape** is precalculated for the box with coordinates ((0, 0), (1, 1)), the box ((0, 1), (1, 2)), and so on \[the boxes' coordinates are stored as just given, but **InShape** instead uses those coordinates divided by _base_<sup>_k_</sup>, or 10<sup>1</sup> in this case\], each such box is labeled with the result, and boxes labeled _NO_ are discarded.  Finally the algorithm above is modified as just given.)
> 4. Besides a grid, another useful data structure is a _mapped regular paving_ (Harlow et al. 2012)[^27], which can be described as a binary tree with nodes each consisting of zero or two child nodes and a marking value.  Start with a box that entirely covers the desired shape.  Calculate **InShape** for the box.  If it returns _YES_ or _NO_ then mark the box with _YES_ or _NO_, respectively; otherwise it returns _MAYBE_, so divide the box along its first widest coordinate into two sub-boxes, set the parent box's children to those sub-boxes, then repeat this process for each sub-box (or if the nesting level is too deep, instead mark each sub-box with _MAYBE_).  Then, to generate a random point (with a base-2 fractional part), start from the root, then: (1) If the box is marked _YES_, return a uniform random point between the given coordinates using the **RandUniformInRange** algorithm; or (2) if the box is marked _NO_, start over from the root; or (3) if the box is marked _MAYBE_, get the two child boxes bisected from the box, choose one of them with equal probability (for example, choose the left child if an unbiased random bit is 0, or the right child otherwise), mark the chosen child with the result of **InShape** for that child, and repeat this process with that child; or (4) the box has two child boxes, so choose one of them with equal probability and repeat this process with that child.
> 5. The algorithm can be adapted to return 1 with probability equal to its acceptance rate (which equals the shape's volume divided by the hyperrectangle's volume), and return 0 with the opposite probability.  In this case, replace steps 5 and 6 with the following: "5. If the result of **InShape** is _YES_, return 1.; 6. If the result of **InShape** is _NO_, return 0." (I thank BruceET of the Cross Validated community for leading me to this insight.)
>
> **Implementation Notes for Box/Shape Intersection**: The algorithm in this section uses a function called **InShape** to determine whether an axis-aligned box is either outside a shape, fully inside the shape, or partially inside the shape.  The following are notes that will aid in developing a robust implementation of **InShape** for a particular shape, especially because the boxes being tested can be arbitrarily small.
>
> 1. **InShape**, as well as the divisions of the coordinates by _S_, should be implemented using rational arithmetic.  Instead of dividing those coordinates this way, an implementation can pass _S_ as a separate parameter to **InShape**.
> 2. If the shape is convex, and the point (0, 0, ..., 0) is on or inside that shape, **InShape** can return&mdash;
>     - _YES_ if all the box's corners are in the shape;
>     - _NO_ if none of the box's corners are in the shape and if the shape's boundary does not intersect with the box's boundary; and
>     - _MAYBE_ in any other case, or if the function is unsure.
>
>     In the case of two-dimensional shapes, the shape's corners are (_c1_/_S_, _c2_/_S_), ((_c1_+1)/_S_, _c2_/_S_), (_c1_,(_c2_+1)/_S_), and ((_c1_+1)/_S_, (_c2_+1)/_S_).  However, checking for box/shape intersections this way is non-trivial to implement robustly, especially if interval arithmetic is not used.
> 3. If the shape is given as an inequality of the form _f_(_t1_, ..., _tN_) &le; 0, where _f_ is a continuous function of one or more variables, **InShape**'s calculations should involve _rational intervals_, or objects that describe a number that's bounded by two rational numbers with numerators and denominators of arbitrary size.  (See also (Duff 1992)[^28]; Daumas et al. (2007)[^29] give one implementation of rational intervals.) Then, **InShape** should build one interval for each dimension of the box and evaluate _f_ using those intervals[^30] with an accuracy that increases as _S_ increases.  Then, **InShape** can return&mdash;
>     - _YES_ if the interval result of _f_ has an upper bound less than or equal to 0;
>     - _NO_ if the interval result of _f_ has a lower bound greater than 0; and
>     - _MAYBE_ in any other case.
>
>     For example, if _f_ is (_t1_<sup>2</sup>+_t2_<sup>2</sup>&minus;1), which describes a quarter disk, **InShape** should build two intervals, namely _t1_ = \[_c1_/_S_, (_c1_+1)/_S_\] and _t2_ = \[_c2_/_S_, (_c2_+1)/_S_\], and evaluate _f_(_t1_, _t2_) using interval arithmetic.
>
>     One thing to point out, though: If _f_ calls the exp(_x_) function where _x_ can potentially have a high absolute value, say 10000 or higher, the exp function can run a very long time in order to calculate proper bounds for the result, since the number of digits in exp(_x_) grows linearly with _x_.  In this case, it may help to transform the inequality to its logarithmic version.  For example, by applying ln(.) to each side of the inequality _y_<sup>2</sup> &le; exp(&minus;(_x_/_y_)<sup>2</sup>/2), the inequality becomes 2\*ln(_y_) &le; &minus;(_x_/_y_)<sup>2</sup>/2 and thus becomes 2\*ln(_y_) + (_x_/_y_)<sup>2</sup>/2 &le; 0 and thus becomes 4\*ln(_y_) + (_x_/_y_)<sup>2</sup> &le; 0.
> 4. If the shape is such that every axis-aligned line segment that begins in one face of the hypercube and ends in another face crosses the shape at most once, ignoring the segment's endpoints (an example is an axis-aligned quarter of a circular disk where the disk's center is (0, 0)), then **InShape** can return&mdash;
>     - _YES_ if all the box's corners are in the shape;
>     - _NO_ if none of the box's corners are in the shape; and
>     - _MAYBE_ in any other case, or if the function is unsure.
>
>     If **InShape** uses rational interval arithmetic, it can build an interval per dimension _per corner_, evaluate the shape for each corner individually and with an accuracy that increases as _S_ increases, and treat a corner as inside or outside the shape only if the result of the evaluation clearly indicates that.  Using the example of a quarter disk, **InShape** can build eight intervals, namely an _x_- and _y_-interval for each of the four corners; evaluate (_x_<sup>2</sup>+_y_<sup>2</sup>&minus;1) for each corner; and return _YES_ only if all four results have upper bounds less than or equal to 0, _NO_ only if all four results have lower bounds greater than 0, and _MAYBE_ in any other case.
> 5. If **InShape** expresses a shape in the form of a [**_signed distance function_**](https://en.wikipedia.org/wiki/Signed_distance_function), namely a function that describes the closest distance from any point in space to the shape's boundary, it can return&mdash;
>     - _YES_ if the signed distance (or an upper bound of such distance) at each of the box's corners, after dividing their coordinates by _S_, is less than or equal to &minus;_&sigma;_ (where _&sigma;_ is an upper bound for sqrt(_N_)/(_S_\*2), such as 1/_S_);
>     - _NO_ if the signed distance (or a lower bound of such distance) at each of the box's corners is greater than _&sigma;_; and
>     - _MAYBE_ in any other case, or if the function is unsure.
> 6. **InShape** implementations can also involve a shape's _implicit curve_ or _algebraic curve_ equation (for closed curves), its _implicit surface_ equation (for closed surfaces), or its _signed distance field_ (a quantized version of a signed distance function).
> 7. An **InShape** function can implement a set operation (such as a union, intersection, or difference) of several simpler shapes, each with its own **InShape** function.  The final result depends on the set operation (such as union or intersection) as well as the result returned by each component for a given box.  The following are examples of set operations:
>     - For unions, the final result is _YES_ if any component returns _YES_; _NO_ if all components return _NO_; and _MAYBE_ otherwise.
>     - For intersections, the final result is _YES_ if all components return _YES_; _NO_ if any component returns _NO_; and _MAYBE_ otherwise.
>     - For differences between two shapes, the final result is _YES_ if the first shape returns _YES_ and the second returns _NO_; _NO_ if the first shape returns _NO_ or if both shapes return _YES_; and _MAYBE_ otherwise.
>     - For the exclusive OR of two shapes, the final result is _YES_ if one shape returns _YES_ and the other returns _NO_; _NO_ if both shapes return _NO_ or both return _YES_; and _MAYBE_ otherwise.
>
> **Examples:**
>
> - The following example generates a point inside a quarter diamond (centered at (0, ..., 0), "radius" _k_ where _k_ is an integer greater than 0): Let _d1_, ..., _dN_ be _k_. Let **InShape** return _YES_ if ((_c1_+1) + ... + (_cN_+1)) < _S_\*_k_; _NO_ if (_c1_ + ... + _cN_) > _S_\*_k_; and _MAYBE_ otherwise.  For _N_=2, the acceptance rate (see note 5) is 1/2.  For a full diamond, step 5.3 in the algorithm is done for each of the _N_ dimensions.
> - The following example generates a point inside a quarter hypersphere (centered at (0, ..., 0), radius _k_ where _k_ is an integer greater than 0): Let _d1_, ..., _dN_ be _k_. Let **InShape** return _YES_ if ((_c1_+1)<sup>2</sup> + ... + (_cN_+1)<sup>2</sup>) < (_S_\*_k_)<sup>2</sup>; _NO_ if (_c1_<sup>2</sup> + ... + _cN_<sup>2</sup>) > (_S_\*_k_)<sup>2</sup>; and _MAYBE_ otherwise.  For _N_=2, the acceptance rate (see note 5) is _&pi;_/4. For a full hypersphere with radius 1, step 5.3 in the algorithm is done for each of the _N_ dimensions.  In the case of a 2-dimensional disk, this algorithm thus adapts the well-known rejection technique of generating X and Y coordinates until X<sup>2</sup>+Y<sup>2</sup> < 1 (for example, Devroye (1986, p. 230 ff.)[^24]).
> - The following example generates a point inside a quarter _astroid_ (centered at (0, ..., 0), radius _k_ where _k_ is an integer greater than 0): Let _d1_, ..., _dN_ be _k_. Let **InShape** return _YES_ if ((_sk_&minus;_c1_&minus;1)<sup>2</sup> + ... + (_sk_&minus;_cN_&minus;1)<sup>2</sup>) > _sk_<sup>2</sup>; _NO_ if ((_sk_&minus;_c1_)<sup>2</sup> + ... + (_sk_&minus;_cN_)<sup>2</sup>) < _sk_<sup>2</sup>; and _MAYBE_ otherwise, where _sk_ = _S_\*_k_.  For _N_=2, the acceptance rate (see note 5) is 1 &minus; _&pi;_/4. For a full astroid, step 5.3 in the algorithm is done for each of the _N_ dimensions.

<a id=Building_an_Arbitrary_Precision_Sampler></a>
#### Building an Arbitrary-Precision Sampler

Suppose a probability distribution&mdash;

- takes on only values 0 or greater, and
- is described by a cumulative distribution function (CDF, or _CDF_(_x_), or the probability of getting _x_ or less under the distribution) and by a probability distribution (PDF) or a function proportional to the PDF.

Also, suppose that&mdash;

- the CDF and PDF or proportional function have known symbolic forms, and
- the PDF that has an infinite tail to the right, is less than or equal to a finite number (so that _PDF(0)_ is other than infinity), and is strictly decreasing.

Then it may be possible to describe an arbitrary-precision sampler for that distribution.  Such a description has the following skeleton.

1. With probability _A_, set _intval_ to 0, then set _size_ to 1, then go to step 4.
    - _A_ is calculated as (_CDF_(1) &minus; _CDF_(0)) / (1&minus;_CDF_(0)), where _CDF_ is the distribution's CDF.  This should be found analytically using a computer algebra system such as SymPy.
    - The symbolic form of _A_ will help determine which Bernoulli factory algorithm, if any, will simulate the probability; if a Bernoulli factory exists, it should be used.
2. Set _intval_ to 1 and set _size_ to 1.
3. With probability _B_(_size_, _intval_), go to step 4.  Otherwise, add _size_ to _intval_, then multiply _size_ by 2, then repeat this step.
    - This step chooses an interval beyond 1, and grows this interval by geometric steps, so that an appropriate interval is chosen with the correct probability.
    - The probability _B_(_size_, _intval_) is the probability that the interval is chosen given that the previous intervals weren't chosen, and is calculated as (_CDF_(_size_ + _intval_) &minus; _CDF_(_intval_)) / (1&minus;_CDF_(_intval_)).  This should be found analytically using a computer algebra system such as SymPy.
    - The symbolic form of _B_ will help determine which Bernoulli factory algorithm, if any, will simulate the probability; if a Bernoulli factory exists, it should be used.
4. Generate an integer in the interval [_intval_, _intval_ + _size_) uniformly at random, call it _i_.
5. Create _ret_, a uniform PSRN with a positive sign and an integer part of 0.
6. Create an input coin that calls **SampleGeometricBag** on the PSRN _ret_.  Run a Bernoulli factory algorithm that returns 1 with probability equal to  _C_(_i_, _&lambda;_), using the input coin (here, _&lambda;_, the heads probability of the input coin, is the probability built up in _ret_ via **SampleGeometricBag**, and satisfies 0 &le; _&lambda;_ &le; 1). If the call returns 0, go to step 4.
    - The probability _C_(_i_, _&lambda;_) is calculated as _PDF_(_i_ + _&lambda;_) / _M_, where _PDF_ is the distribution's PDF or a function proportional to the PDF, and should be found analytically using a computer algebra system such as SymPy.
    - In this formula, _M_ is any convenient number that satisfies _PDF_(_intval_) &le; _M_ &le; max(1, _PDF_(_intval_)), and should be as low as feasible. _M_ serves to ensure that _C_ is as close as feasible to 1 (to improve acceptance rates), but no higher than 1.  The choice of _M_ can vary for each interval (each value of _intval_, which can only be 0, 1, or a power of 2).  Any such choice for _M_ preserves the algorithm's correctness because the PDF has to be strictly decreasing and a new interval isn't chosen when _&lambda;_ is rejected.
    - The symbolic form of _C_ will help determine which Bernoulli factory algorithm, if any, will simulate the probability; if a Bernoulli factory exists, it should be used.
    - This step could be implemented as follows instead: "Generate _z_, a uniform PSRN with a positive sign and an integer part of 0.  Determine whether _z_ is greater than _C_(_i_, _ret_), using operations for 'constructive reals' and treating _z_ and _ret_ as 'constructive reals' whose fractional digits are sampled using **SampleGeometricBag** as necessary.  If _z_ is greater, go to step 4." See "[**Relation to Constructive Reals**](#Relation_to_Constructive_Reals)", earlier.  However, although this change is also correct, the use of "constructive reals" (or "recursive reals") here is not preferred when a Bernoulli factory is available to implement this step.
7. The PSRN _ret_ was accepted, so set _ret_'s integer part to _i_, then optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _ret_.

Examples of algorithms that use this skeleton are the algorithm for the [**ratio of two uniform random variates**](#Ratio_of_Two_Uniform_Random_Variates), as well as the algorithms for the Rayleigh distribution and for the reciprocal of power of uniform, both given later.

Perhaps the most difficult part of describing an arbitrary-precision sampler with this skeleton is finding the appropriate Bernoulli factory algorithm for the probabilities _A_, _B_, and _C_, especially when these probabilities have a non-trivial symbolic form.

> **Note:** The algorithm skeleton uses ideas similar to the inversion-rejection method described in Devroye (1986, ch. 7, sec. 4.6)[^24]; an exception is that instead of generating a uniform random variate and comparing it to calculations of a CDF, this algorithm uses conditional probabilities of choosing a given piece, probabilities labeled _A_ and _B_.  This approach was taken so that the CDF of the distribution in question is never directly calculated in the course of the algorithm, which furthers the goal of sampling with arbitrary precision and without using floating-point arithmetic.

<a id=Continuous_Distributions_Supported_on_0_to_1></a>
#### Continuous Distributions Supported on 0 to 1

The beta sampler in this document shows one case of a general approach to simulating a wide class of continuous distributions thanks to Bernoulli factories, as long as the distributions have probability density functions (PDFs) and take on only values 0 or greater and 1 or less.  This general approach can sample a number that follows one of these distributions, using the algorithm below.  The algorithm allows any arbitrary base (or radix) _b_ (such as 2 for binary).  (See also Devroye (1986, ch. 2, sec. 3.8, exercise 14)[^24])

1. Create a uniform PSRN with a positive sign, an integer part of 0, and an empty fractional part.  Create a **SampleGeometricBag** Bernoulli factory that uses that PSRN.
2. As the PSRN builds up a uniform random variate, accept the PSRN with a probability that can be represented by a Bernoulli factory algorithm (that takes the **SampleGeometricBag** factory from step 1 as part of its input), or reject it otherwise. (A number of these algorithms can be found in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)".)  Let _f_(_U_) be the probability density function (PDF) modeled by this Bernoulli factory, where _U_ is the uniform random variate built up by the PSRN. _f_ has a domain equal to the open interval (0, 1) or a subset of that interval, and returns a value of \[0, 1\] everywhere in its domain. _f_ is the PDF for the underlying continuous distribution, or the PDF times a (possibly unknown) constant factor.  As shown by Keane and O'Brien (1994)[^6], however, this step works if and only if&mdash;
    - _f_(_&lambda;_) is constant on its domain, or
    - _f_(_&lambda;_) is continuous and polynomially bounded on its domain (polynomially bounded means that both _f_(_&lambda;_) and 1&minus;_f_(_&lambda;_) are greater than or equal to min(_&lambda;_<sup>_n_</sup>, (1&minus;_&lambda;_)<sup>_n_</sup>) for some integer _n_),

   and they show that 2 \* _&lambda;_, where 0 &le; _&lambda;_ &lt; 1/2, is one function that does not admit a Bernoulli factory.  _f_(_&lambda;_) can be a constant, including an irrational number; see "[**Algorithms for Irrational Constants**](https://peteroupc.github.io/bernoulli.html#Algorithms_for_Irrational_Constants)" for ways to simulate constant probabilities.
3. If the PSRN is accepted, optionally fill the PSRN with uniform random digits as necessary to give its fractional part _n_ digits (similarly to **FillGeometricBag** above), where _n_ is a precision parameter, then return the PSRN.

However, the speed of this algorithm depends crucially on the mode (highest point) of _f_(_&lambda;_) with 0 &le; _&lambda;_ &le; 1.[^31]  As the mode approaches 0, the average rejection rate increases.  Effectively, this step generates a point uniformly at random in a 1&times;1 area in space.  If the mode is close to 0, _f_ will cover only a tiny portion of this area, so that the chance is high that the generated point will fall outside the area of _f_ and have to be rejected.

The beta distribution's PDF at (1) fits the requirements of Keane and O'Brien (for `alpha` and `beta` both greater than 1), thus it can be simulated by Bernoulli factories and is covered by this general algorithm.

This algorithm can be modified to produce random variates in the interval \[_m_, _m_ + _y_\] (where _m_ and _y_ are rational numbers and _y_ is greater than 0), rather than \[0, 1\], as follows:

1. Apply the algorithm above, except that a modified function _f&prime;_(_x_) = _f_(_x_ * _y_ + _m_) is used rather than _f_, where _x_ is the number in \[0, 1\] that is built up by the PSRN, and that the choice is not made to fill the PSRN as given in step 3 of that algorithm.
2. Multiply the resulting random PSRN by _y_ via the second algorithm in "[**Multiplication**](#Multiplication)".  (Note that if _y_ has the form _b_<sup>_i_</sup>, this step is relatively trivial.)
3. Add _m_ to the resulting random PSRN via the second algorithm in "[**Addition and Subtraction**](#Addition_and_Subtraction)".

Note that here, the function _f&prime;_ must meet the requirements of Keane and O'Brien.  (For example, take the function `sqrt((x - 4) / 2)`, which isn't a Bernoulli factory function.  If we now seek to sample from the interval \[4, 4+2<sup>1</sup>\] = \[4, 6\], the _f_ used in step 2 is now `sqrt(x)`, which _is_ a Bernoulli factory function so that we can apply this algorithm.)

<a id=Specific_Arbitrary_Precision_Samplers></a>
### Specific Arbitrary-Precision Samplers

&nbsp;

<a id=Rayleigh_Distribution></a>
#### Rayleigh Distribution

The following is an arbitrary-precision sampler for the Rayleigh distribution with parameter _s_, which is a rational number greater than 0.

1. Set _k_ to 0, and set _y_ to 2 * _s_ * _s_.
2. Run the **ExpMinus** algorithm with parameter (_k_ * 2 + 1)/_y_.  If it returns 1, go to step 3.  Otherwise, add 1 to _k_ and repeat this step.
3. (Now, the piece located at [_k_, _k_ + 1) is sampled.)  Create a uniform PSRN with a positive sign and an integer part of 0.
4. Set _ky_ to _k_ * _k_ / _y_.
5. (Now simulating exp(&minus;_U_<sup>2</sup>/_y_), exp(&minus;_k_<sup>2</sup>/_y_) , exp(&minus;_U_\*_k_\*2/_y_), as well as a scaled-down version of _U_ + _k_, where _U_ is the number built up by the uniform PSRN.) Call the **ExpMinus** algorithm with parameter _k\*y_, then call the **exp(&minus;(_&lambda;_\*_z_))** with _z_ = 1/_y_ and _&lambda;_ representing a coin that does: "Run **SampleGeometricBag** on the uniform PSRN twice, and return 1 if both flips return 1, or 0 otherwise", then run the **algorithm for exp(&minus;(_&lambda;_\* _z_))** with _z_= floor(_k_ * 2 / _y_), and _&lambda;_ being a coin that does: "Run **SampleGeometricBag** on the uniform PSRN once, then return the result", then call the **sub-algorithm** given later with the uniform PSRN and _k_ = _k_.  If all of these calls return 1, the uniform PSRN was accepted.  Otherwise, remove all digits from the uniform PSRN's fractional part and go to step 4.
7. If the uniform PSRN, call it _ret_, was accepted by step 5, set _ret_'s integer part to _k_, then optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), and return _ret_.

The sub-algorithm below simulates a probability equal to (_U_+_k_)/_base_<sup>_z_</sup>, where _U_ is the number built by the uniform PSRN, _base_ is the base (radix) of digits stored by that PSRN, _k_ is an integer 0 or greater, and _z_ is the number of significant digits in _k_ (for this purpose, _z_ is 0 if _k_ is 0).

For base 2:

1.  Set _N_ to 0.
2.  Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), go to the next step.  Otherwise, add 1 to _N_ and repeat this step.
3.  If _N_ is less than _z_, return rem(_k_ / 2<sup>_z_ &minus; 1 &minus; _N_</sup>, 2).  (Alternatively, shift _k_ to the right, by _z_ &minus; 1 &minus; _N_ bits, then return _k_ _AND_ 1, where "_AND_" is a bitwise AND-operation.)
4.  Subtract _z_ from _N_.  Then, if the item at position _N_ in the uniform PSRN's fractional part (positions start at 0) is not set to a digit (for example, 0 or 1 for base 2), set the item at that position to a digit chosen uniformly at random (for example, either 0 or 1 for base 2), increasing the capacity of the uniform PSRN's fractional part as necessary.
4.  Return the item at position _N_.

For bases other than 2, such as 10 for decimal, this can be implemented as follows (based on **URandLess**):

1. Set _i_ to 0.
2. If _i_ is less than _z_:
    1. Set _da_ to rem(_k_ / 2<sup>_z_ &minus; 1 &minus; _i_</sup>, _base_), and set _db_ to a digit chosen uniformly at random (that is, an integer in the interval [0, _base_)).
    2. Return 1 if _da_ is less than _db_, or 0 if _da_ is greater than _db_.
3. If _i_ is _z_ or greater:
    1. If the digit at position (_i_ &minus; _z_) in the uniform PSRN's fractional part is not set, set the item at that position to a digit chosen uniformly at random (positions start at 0 where 0 is the most significant digit after the point, 1 is the second most significant, etc.).
    2. Set _da_ to the item at that position, and set _db_ to a digit chosen uniformly at random (so that 0 &le; _db_ &lt; _base_).
    3. Return 1 if _da_ is less than _db_, or 0 if _da_ is greater than _db_.
4. Add 1 to _i_ and go to step 3.

<a id=Hyperbolic_Secant_Distribution></a>
#### Hyperbolic Secant Distribution

The following algorithm adapts the rejection algorithm from p. 472 in Devroye (1986)[^24] for arbitrary-precision sampling.

1. Generate _ret_, an exponential random variate with a rate of 1 via the **ExpRand** or **ExpRand2** algorithm.  This number will be a uniform PSRN.
2. Set _ip_ to 1 plus _ret_'s integer part.
3. (The rest of the algorithm accepts _ret_ with probability 1/(1+_ret_).) With probability _ip_/(1+_ip_), generate a number that is 1 with probability 1/_ip_ and 0 otherwise.  If that number is 1, _ret_ was accepted, in which case optionally fill it with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then set _ret_'s sign to positive or negative with equal probability, then return _ret_.
4. Call **SampleGeometricBag** on _ret_'s fractional part (ignore _ret_'s integer part and sign).  If the call returns 1, go to step 1.  Otherwise, go to step 3.

<a id=Sum_of_Uniform_Random_Variates></a>
#### Sum of Uniform Random Variates

The sum of _n_ uniform random variates between 0 and 1 has the following probability density function (PDF) (see [**MathWorld**](https://mathworld.wolfram.com/UniformSumDistribution.html)):

$$f(x)=\left(\sum_{k=0}^n (-1)^k {n\choose k} (x-k)^{n-1} \text{sign}(x-k)\right)/(2(n-1)!),$$

where ${n\choose k}$ is a _binomial coefficient_, or the number of ways to choose _k_ out of _n_ labeled items, and sign(_x_) is 1 if _x_ is greater than 0, or 0 if _x_ is 0, or &minus;1 is less than 0.[^32] [^33] [^34]

This is a polynomial of degree _n_ &minus; 1.  For _n_ uniform numbers, the distribution can take on values that are 0 or greater and _n_ or less.

This new algorithm samples the sum of uniform random variates between 0 and 1 and the ratio of two uniform random variates between 0 and 1, with the help of PSRNs. It logically works as follows:

1. The distribution is divided into pieces that are each 1 unit long (thus, for example, if _n_ is 4, there will be four pieces).
2. An integer in \[0, _n_\) is chosen uniformly at random, call it _i_, then the piece identified by _i_ is chosen.  There are [**many algorithms to choose an integer**](https://peteroupc.github.io/randomfunc.html#RNDINT_Random_Integers_in_0_N) this way, but an algorithm that is "optimal" in terms of the number of bits it uses, as well as unbiased, should be chosen.
3. The PDF at \[_i_, _i_ + 1\] is shifted so the desired piece of the PDF is at \[0, 1\] rather than its usual place.  More specifically, the PDF is now as follows: $$\mathtt{ShiftedF}(x)=\left(\sum_{k=0}^n (-1)^k {n\choose k} ((x+i)-k)^{n-1} \text{sign}((x+i)-k)\right)/(2(n-1)!),$$ where _x_ is a real number in \[0, 1\].  Since `ShiftedF` is a polynomial, it can be rewritten in Bernstein form, so that it has _Bernstein coefficients_, which are equivalent to control points describing the shape of the curve drawn out by `ShiftedF`. (The Bernstein coefficients are the backbone of the well-known Bézier curve.) A polynomial can be written in Bernstein form as&mdash; $$\sum_{k=0}^m {m\choose k} x^k (1-x)^{m-k} a[k],$$ where _a_\[_k_\] are the control points and _m_ is the polynomial's degree (here, _n_ &minus; 1). In this case, there will be _n_ control points, which together trace out a 1-dimensional Bézier curve.  For example, given control points 0.2, 0.3, and 0.6, the curve is at 0.2 when _x_ = 0, and 0.6 when _x_ = 1.  (Note that the curve is not at 0.3 when _x_ = 1/2; in general, Bézier curves do not cross their control points other than the first and the last.)

    Moreover, this polynomial can be simulated because its Bernstein coefficients all lie in \[0, 1\] (Goyal and Sigman 2012\)[^35].
4. The sampler creates a "coin" made up of a uniform partially-sampled random number (PSRN) whose contents are built up on demand using an algorithm called **SampleGeometricBag**.  It flips this "coin" _n_ &minus; 1 times and counts the number of times the coin returned 1 this way, call it _j_. (The "coin" will return 1 with probability equal to the to-be-determined uniform random variate.)
5. Based on _j_, the sampler accepts the PSRN with probability equal to the control point _a_\[_j_\]. (See (Goyal and Sigman 2012\)[^35].)
6. If the PSRN is accepted, the sampler optionally fills it up with uniform random digits, then sets the PSRN's integer part to _i_, then the sampler returns the finished PSRN.  If the PSRN is not accepted, the sampler starts over from step 2.

**_Finding Parameters_**:

Using the uniform sum sampler for an arbitrary _n_ requires finding the Bernstein control points for each of the _n_ pieces of the uniform sum PDF.  This can be found, for example, with the Python code below, which uses the SymPy computer algebra library.  In the code:

- `unifsum(x,n,v)` calculates the PDF of the sum of `n` uniform random variates when the variable `x` is shifted by `v` units.
- `find_control_points` returns the control points for each piece of the PDF for the sum of `n` uniform random variates, starting with piece 0.
- `find_areas` returns the relative areas for each piece of that PDF.  This can be useful to implement a variant of the sampler above, as detailed later in this section.

```
def unifsum(x,n,v):
    # Builds up the PDF at x (with offset v)
    # of the sum of n uniform random variates
    ret=0
    x=x+v # v is an offset
    for k in range(n+1):
           s=(-1)**k*binomial(n,k)*(x-k)**(n-1)
           # Equivalent to k>x+v since x is limited
           # to [0, 1]
           if k>v: ret-=s
           else: ret+=s
    return ret/(2*factorial(n-1))

def find_areas(n):
   x=symbols('x', real=True)
   areas=[integrate(unifsum(x,n,i),(x,0,1)) for i in range(n)]
   g=prod([v.q for v in areas])
   areas=[int(v*g) for v in areas]
   g=gcd(areas)
   areas=[v/int(g) for v in areas]
   return areas

def find_control_points(n, scale_pieces=False):
 x=symbols('x', real=True)
 controls=[]
 for i in range(n):
  # Find the "usual" coefficients of the uniform
  # sum polynomial at offset i.
  poly=Poly(unifsum(x, n, i))
  coeffs=[poly.coeff_monomial(x**i) for i in range(n)]
  # Build coefficient vector
  coeffs=Matrix(coeffs)
  # Build power-to-Bernstein basis matrix
  mat=[[0 for _ in range(n)] for _ in range(n)]
  for j in range(n):
    for k in range(n):
       if k==0 or j==n-1:
         mat[j][k]=1
       elif k<=j:
         mat[j][k]=binomial(j, j-k) / binomial(n-1, k)
       else:
         mat[j][k]=0
  mat=Matrix(mat)
  # Get the Bernstein control points
  mv = mat*coeffs
  mvc = [Rational(mv[i]) for i in range(n)]
  maxcoeff = max(mvc)
  # If requested, scale up control points to raise acceptance rate
  if scale_pieces:
     mvc = [v/maxcoeff for v in mvc]
  mv = [[v.p, v.q] for v in mvc]
  controls.append(mv)
 return controls
```

The basis matrix is found, for example, as Equation 42 of (Ray and Nataraj 2012\)[^36].

For example, if _n_ = 4 (so a sum of four uniform random variates is desired), the following control points are used for each piece of the PDF:

| Piece | Control Points |
 --- | --- |
| 0 | 0, 0, 0, 1/6 |
| 1 | 1/6, 1/3, 2/3, 2/3 |
| 2 | 2/3, 2/3, 1/3, 1/6 |
| 3 | 1/6, 0, 0, 0 |

For more efficient results, all these control points could be scaled so that the highest control point is equal to 1.  This doesn't affect the algorithm's correctness because scaling a Bézier curve's control points scales the curve accordingly, as is well known. In the example above, after multiplying by 3/2 (the reciprocal of the highest control point, which is 2/3), the table would now look like this:

| Piece | Control Points |
 --- | --- |
| 0 | 0, 0, 0, 1/4 |
| 1 | 1/4, 1/2, 1, 1 |
| 2 | 1, 1, 1/2, 1/4 |
| 3 | 1/4, 0, 0, 0 |

Notice the following:

- All these control points are rational numbers, and the sampler may have to determine whether an event is true with probability equal to a control point.  For rational numbers like these, it is possible to determine this exactly (using only random bits), using the **ZeroOrOne** method given in my [**article on randomization and sampling methods**](https://peteroupc.github.io/randomfunc.html#Boolean_True_False_Conditions).
- The first and last piece of the PDF have a predictable set of control points.  Namely the control points are as follows:
    - Piece 0: 0, 0, ..., 0, 1/((_n_ &minus; 1)!), where (_n_ &minus; 1)! = 1\*2\*3\*...\*(_n_&minus;1).
    - Piece _n_ &minus; 1: 1/((_n_ &minus; 1)!), 0, 0, ..., 0.

If the areas of the PDF's pieces are known in advance (and SymPy makes them easy to find as the `find_areas` method shows), then the sampler could be modified as follows, since each piece is now chosen with probability proportional to the chance that a random variate there will be sampled:

- Step 2 is changed to read: "An integer in \[0, _n_\) is chosen with probability proportional to the corresponding piece's area, call the integer _i_, then the piece identified by _i_ is chosen.  There are many [**algorithms to choose an integer**](https://peteroupc.github.io/randomfunc.html#Weighted_Choice_With_Replacement) this way."
- The last sentence in step 6 is changed to read: "If the PSRN is not accepted, the sampler starts over from step 3."  With this, the same piece is sampled again.
- The following are additional modifications that should be done to the sampler.  However, not applying them does not affect the sampler's correctness.

    - The control points should be scaled so that the highest control point of _each_ piece is equal to 1.  See the table below for an example.
    - If piece 0 is being sampled and the PSRN's digits are binary (base 2), the "coin" described in step 4 uses a modified version of **SampleGeometricBag** in which a 1 (rather than any other digit) is sampled from the PSRN when it reads from or writes to that PSRN.  Moreover, the PSRN is always accepted regardless of the result of the "coin" flip.
    - If piece _n_ &minus; 1 is being sampled and the PSRN's digits are binary (base 2), the "coin" uses a modified version of **SampleGeometricBag** in which a 0 (rather than any other digit) is sampled, and the PSRN is always accepted.

| Piece | Control Points |
 --- | --- |
| 0 | 0, 0, 0, 1 |
| 1 | 1/4, 1/2, 1, 1 |
| 2 | 1, 1, 1/2, 1/4 |
| 3 | 1, 0, 0, 0 |

**_Sum of Two Uniform Random Variates_**:

The following algorithm samples the sum of two uniform random variates.

1. Create a uniform PSRN (partially-sampled random number) with an empty fractional part, an integer part of 0, and a positive sign, call it _ret_.
2. Generate an unbiased random bit (that is, either 0 or 1, chosen with equal probability).
3. Remove all digits from _ret_.  (This algorithm works for digits of any base, including base 10 for decimal, or base 2 for binary.)
4. Call the **SampleGeometricBag** algorithm on _ret_, then generate an unbiased random bit.
5. If the bit generated in step 2 is 1 and the result of **SampleGeometricBag** is 1, optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _ret_.
6. If the bit generated in step 2 is 0 and the result of **SampleGeometricBag** is 0, optionally fill _ret_ as in step 5, then set _ret_'s integer part to 1, then return _ret_.
7. Go to step 3.

For base 2, the following algorithm also works, using certain "tricks" described in the next section.

1. Generate an unbiased random bit (that is, either 0 or 1, chosen with equal probability), call it _d_.
2. Generate unbiased random bits until 0 is generated this way.  Set _g_ to the number of one-bits generated by this step.
3. Create a uniform PSRN with an empty fractional part, an integer part of 0, and a positive sign, call it _ret_.  Then, set the digit at position _g_ of the PSRN's fractional part to _d_ (positions start at 0 in the PSRN).
4. Optionally, fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**).  Then set _ret_'s integer part to (1 &minus; _d_), then return _ret_

**_Sum of Three Uniform Random Variates_**:

The following algorithm samples the sum of three uniform random variates.

1. Create a positive-sign zero-integer-part uniform PSRN, call it _ret_.
2. Choose an integer in [0, 6), uniformly at random. (With this, the left piece is chosen at a 1/6 chance, the right piece at 1/6, and the middle piece at 2/3, corresponding to the relative areas occupied by the three pieces.)
3. Remove all digits from _ret_.
4. If 0 was chosen by step 2, we will sample from the left piece of the function for the sum of three uniform random variates.  This piece runs along the interval \[0, 1\) and is a polynomial with Bernstein coefficients of (0, 1, 1/2) (and is thus a Bézier curve with those control points).  Due to the particular form of the control points, the piece can be sampled in one of the following ways:

    - Call the **SampleGeometricBag** algorithm twice on _ret_.  If both of these calls return 1, then accept _ret_ with probability 1/2.  This is the most "naïve" approach.
    - Call the **SampleGeometricBag** algorithm twice on _ret_.  If both of these calls return 1, then accept _ret_.  This version of the step is still correct since it merely scales the polynomial so its upper bound is closer to 1, which is the top of the left piece, thus improving the acceptance rate of this step.
    - Base-2 only: Call a modified version of **SampleGeometricBag** twice on _ret_; in this modified algorithm, a 1 (rather than any other digit) is sampled from _ret_ when that algorithm reads or writes a digit in _ret_.  Then _ret_ is accepted.  This version will always accept _ret_ on the first try, without rejection, and is still correct because _ret_ would be accepted by this step only if **SampleGeometricBag** succeeds both times, which will happen only if that algorithm reads or writes out a 1 each time (because otherwise the control point is 0, meaning that _ret_ is accepted with probability 0).

    If _ret_ was accepted, optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _ret_.
5. If 2, 3, 4, or 5 was chosen by step 2, we will sample from the middle piece of the PDF, which runs along the interval [1, 2) and is a polynomial with Bernstein coefficients (control points) of (1/2, 1, 1/2).  Call the **SampleGeometricBag** algorithm twice on _ret_.  If neither or both of these calls return 1, then accept _ret_.  Otherwise, if one of these calls returns 1 and the other 0, then accept _ret_ with probability 1/2.  If _ret_ was accepted, optionally fill _ret_ as given in step 4, then set _ret_'s integer part to 1, then return _ret_.
6. If 1 was chosen by step 2, we will sample from the right piece of the PDF, which runs along the interval [2, 3) and is a polynomial with Bernstein coefficients (control points) of (1/2, 0, 0).  Due to the particular form of the control points, the piece can be sampled in one of the following ways:

    - Call the **SampleGeometricBag** algorithm twice on _ret_.  If both of these calls return 0, then accept _ret_ with probability 1/2.  This is the most "naïve" approach.
    - Call the **SampleGeometricBag** algorithm twice on _ret_.  If both of these calls return 0, then accept _ret_.  This version is correct for a similar reason as in step 4.
    - Base-2 only: Call a modified version of **SampleGeometricBag** twice on _ret_; in this modified algorithm, a 0 (rather than any other digit) is sampled from _ret_ when that algorithm reads or writes a digit in _ret_.  Then _ret_ is accepted.  This version is correct for a similar reason as in step 4.

    If _ret_ was accepted, optionally fill _ret_ as given in step 4, then set _ret_'s integer part to 2, then return _ret_.
7. Go to step 3.

<a id=Ratio_of_Two_Uniform_Random_Variates></a>
#### Ratio of Two Uniform Random Variates

The ratio of two uniform random variates between 0 and 1 has the following probability density function (see [**MathWorld**](https://mathworld.wolfram.com/UniformRatioDistribution.html)):

- 1/2 if _x_ >= 0 and _x_ <= 1,
- ( 1/ _x_<sup>2</sup>) / 2 if _x_ > 1, and
- 0 otherwise.

The following algorithm generates the ratio of two uniform random variates.

1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), we have a uniform random variate between 0 and 1.  Create a positive-sign zero-integer-part uniform PSRN, then optionally fill the PSRN with uniform random digits as necessary to give the number's fractional part the desired number of digits (similarly to **FillGeometricBag**), then return the PSRN.
2. At this point, the result will be 1 or greater.  Set _intval_ to 1 and set _size_ to 1.
3. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), go to step 4.  Otherwise, add _size_ to _intval_, then multiply _size_ by 2, then repeat this step.  (This step chooses an interval beyond 1, taking advantage of the fact that the area under the PDF between 1 and 2 is 1/4, between 2 and 4 is 1/8, between 4 and 8 is 1/16, and so on, so that an appropriate interval is chosen with the correct probability.)
4. Generate an integer in the interval [_intval_, _intval_ + _size_) uniformly at random, call it _i_.
5. Create a positive-sign zero-integer-part uniform PSRN, _ret_.
6. Call the **sub-algorithm** below with _d_ = _intval_ and _c_ = _i_.  If the call returns 0, go to step 4.  (Here we simulate _intval_/(_i_+_&lambda;_) rather than 1/(_i_+_&lambda;_) in order to increase acceptance rates in this step.  This is possible without affecting the algorithm's correctness.)
7. Call the **sub-algorithm** below with _d_ = 1 and _c_ = _i_.  If the call returns 0, go to step 4.
8. The PSRN _ret_ was accepted, so set _ret_'s integer part to _i_, then optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _ret_.

The algorithm above uses a sub-algorithm that simulates the probability _d_ / (_c_ + _&lambda;_), where _&lambda;_ is the probability built up by the uniform PSRN, as follows:

1. With probability _c_ / (1 + _c_), return a number that is 1 with probability _d_/_c_ and 0 otherwise.
2. Call **SampleGeometricBag** on _ret_ (the uniform PSRN).  If the call returns 1, return 0.  Otherwise, go to step 1.

And the following Python code implements this algorithm.

```
def numerator_div(bern, numerator, intpart, bag):
   # Simulates numerator/(intpart+bag)
   while True:
      if bern.zero_or_one(intpart,1+intpart)==1:
         return bern.zero_or_one(numerator,intpart)
      if bern.geometric_bag(bag)==1: return 0

def ratio_of_uniform(bern):
    """ Exact simulation of the ratio of uniform random variates."""
    # First, simulate the integer part
    if bern.randbit():
       # This is 0 to 1, which follows a uniform distribution
       bag=[]
       return bern.fill_geometric_bag(bag)
    else:
       # This is 1 or greater
       intval=1
       size=1
       # Determine which range of integer parts to draw
       while True:
           if bern.randbit()==1:
                break
           intval+=size
           size*=2
       while True:
         # Draw the integer part
         intpart=bern.rndintexc(size) + intval
         bag=[]
         # Note: Density at [intval,intval+size) is multiplied
         # by intval, to increase acceptance rates
         if numerator_div(bern,intval,intpart,bag)==1 and \
            numerator_div(bern,1,intpart,bag)==1:
             return intpart + bern.fill_geometric_bag(bag)
```

<a id=Reciprocal_of_Uniform_Random_Variate></a>
#### Reciprocal of Uniform Random Variate

The reciprocal of a uniform random variate between 0 and 1 has the probability density function&mdash;

- 1 / _x_<sup>2</sup> if _x_ > 1, and
- 0 otherwise.

The algorithm to generate the reciprocal of a uniform random variate is the same as the algorithm for the ratio of two uniform random variates, except step 1 is omitted.

<a id=Reciprocal_of_Power_of_Uniform_Random_Variate></a>
#### Reciprocal of Power of Uniform Random Variate

The following algorithm generates a PSRN of the form 1/_U_<sup>1/_x_</sup>, where _U_ is a uniform random variate greater than 0 and less than 1 and _x_ is an integer greater than 0.

1. Set _intval_ to 1 and set _size_ to 1.
2. With probability (4<sup>_x_</sup>&minus;2<sup>_x_</sup>)/4<sup>_x_</sup>, go to step 3.  Otherwise, add _size_ to _intval_, then multiply _size_ by 2, then repeat this step.
3. Generate an integer in the interval [_intval_, _intval_ + _size_) uniformly at random, call it _i_.
4. Create _ret_, a uniform PSRN with a positive sign and an integer part of 0.
5. Create an input coin that calls **SampleGeometricBag** on the PSRN _ret_.  Call the **algorithm for _d_<sup>_k_</sup> / (_c_ + _&lambda;_)<sup>_k_</sup>** in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", using the input coin, where _d_ = _intval_, _c_ = _i_, and _k_ = _x_ + 1 (here, _&lambda;_ is the probability built up in _ret_ via **SampleGeometricBag**, and satisfies 0 &le; _&lambda;_ &le; 1).  If the call returns 0, go to step 3.
6. The PSRN _ret_ was accepted, so set _ret_'s integer part to _i_, then optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _ret_.

This algorithm uses the skeleton described earlier in "Building an Arbitrary-Precision Sampler".  Here, the probabilities _A_, _B_,  and _C_ are as follows:

- _A_ = 0, since the random variate can't be zero or come between 0 and 1.
- _B_ = (4<sup>_x_</sup>&minus;2<sup>_x_</sup>)/4<sup>_x_</sup>.
- _C_ = (_x_/(_i_ + _&lambda;_)<sup>_x_+1</sup>) / _M_.  Ideally, _M_ is either _x_ if _intval_ is 1, or _x_/_intval_<sup>_x_+1</sup> otherwise.  Thus, the ideal form for _C_ is _intval_<sup>_x_+1</sup>/(_i_+_&lambda;_)<sup>_x_+1</sup>.

<a id=Distribution_of__U__1_minus__U></a>
#### Distribution of _U_/(1&minus;_U_)

The following algorithm generates a PSRN distributed as _U_/(1&minus;_U_), where _U_ is a uniform random variate greater than 0 and less than 1.

1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), set _intval_ to 0, then set _size_ to 1, then go to step 4.
2. Set _intval_ to 1 and set _size_ to 1.
3. With probability _size_/(_size_ + _intval_ + 1), go to step 4.  Otherwise, add _size_ to _intval_, then multiply _size_ by 2, then repeat this step.
4. Generate an integer in the interval [_intval_, _intval_ + _size_) uniformly at random, call it _i_.
5. Create _ret_, a uniform PSRN with a positive sign and an integer part of 0.
6. Create an input coin that calls **SampleGeometricBag** on the PSRN _ret_.  Call the **algorithm for _d_<sup>_k_</sup> / (_c_ + _&lambda;_)<sup>_k_</sup>** in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", using the input coin, where _d_ = _intval_ + 1, _c_ = _i_ + 1, and _k_ = 2 (here, _&lambda;_ is the probability built up in _ret_ via **SampleGeometricBag**, and satisfies 0 &le; _&lambda;_ &le; 1).  If the call returns 0, go to step 4.
7. The PSRN _ret_ was accepted, so set _ret_'s integer part to _i_, then optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _ret_.

This algorithm uses the skeleton described earlier in "Building an Arbitrary-Precision Sampler".  Here, the probabilities _A_, _B_,  and _C_ are as follows:

- _A_ = 1/2.
- _B_ = _size_/(_size_ + _intval_ + 1).
- _C_ = (1/(_i_+_&lambda;_+1)<sup>2</sup>) / _M_.  Ideally, _M_ is 1/(_intval_+1)<sup>2</sup>.  Thus, the ideal form for _C_ is (_intval_+1)<sup>2</sup>/(_i_+_&lambda;_+1)<sup>2</sup>.

<a id=Arc_Cosine_Distribution></a>
#### Arc-Cosine Distribution

The following is a reimplementation of an example from Devroye's book _Non-Uniform Random Variate Generation_ (Devroye 1986, pp. 128&ndash;129)[^24].  The following arbitrary-precision sampler generates a random variate from a distribution with the following cumulative distribution function (CDF): `1 - cos(pi*x/2).`  The random variate will be 0, 1, or a real number in between.  This algorithm's result is the same as applying acos(_U_)*2/&pi;, where _U_ is a uniform random variate between 0 and 1, as pointed out by Devroye. (acos(_x_) is the inverse cosine function.)  The algorithm follows.

1. Call the **kthsmallest** algorithm with `n = 2` and `k = 2`, but without filling it with digits at the last step.  Let _ret_ be the result.
2. Set _m_ to 1.
3. Call the **kthsmallest** algorithm with `n = 2` and `k = 2`, but without filling it with digits at the last step.  Let _u_ be the result.
4. With probability 4/(4\*_m_\*_m_ + 2\*_m_), call the **URandLess** algorithm with parameters _u_ and _ret_ in that order, and if that call returns 1, call the **algorithm for &pi; / 4**, described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", twice, and if both of these calls return 1, add 1 to _m_ and go to step 3.  (Here, an erratum in the algorithm on page 129 of the book is incorporated.)
5. If _m_ is odd[^37], optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits  (similarly to **FillGeometricBag**), and return _ret_.
6. If _m_ is even[^38], go to step 1.

And here is Python code that implements this algorithm.  The code uses floating-point arithmetic only at the end, to convert the result to a convenient form, and it relies on methods from _randomgen.py_ and _bernoulli.py_.

```
def example_4_2_1(rg, bern, precision=53):
    while True:
       ret=rg.kthsmallest_psrn(2,2)
       k=1
       while True:
          u=rg.kthsmallest_psrn(2,2)
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
#### Logistic Distribution

The following new algorithm generates a partially-sampled random number that follows the logistic distribution.

1. Set _k_ to 0.
2. (Choose a 1-unit-wide piece of the logistic density.) Run the **algorithm for (1+exp(_k_))/(1+exp(_k_+1))** described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)").  If the call returns 0, add 1 to _k_ and repeat this step.  Otherwise, go to step 3.
3. (The rest of the algorithm samples from the chosen piece.) Create a uniform PSRN with integer part 0 and a positive sign, call it _f_.
4. (Steps 4 through 7 succeed with probability exp(&minus;(_f_+_k_))/(1+exp(&minus;(_f_+_k_)))<sup>2</sup>.) Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), go to step 3.
5. Call the **ExpMinus** algorithm with parameter _k_, then call the **ExpMinus** algorithm with parameter _f_.  If any of these calls returns 0, go to step 4.
6. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), accept _f_.  If _f_ is accepted this way, set _f_'s integer part to _k_, then optionally fill _f_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then set _f_'s sign to positive or negative with equal probability, then return _f_.
7. Call the **ExpMinus** algorithm with parameter _k_, then call the **ExpMinus** algorithm with parameter _f_.  If both calls return 1, go to step 3.  Otherwise, go to step 6.

<a id=Cauchy_Distribution></a>
#### Cauchy Distribution

Uses the skeleton for the uniform distribution inside N-dimensional shapes.

1. Generate two empty PSRNs, with a positive sign, an integer part of 0, and an empty fractional part.  Call the PSRNs _p1_ and _p2_.
2. Set _S_ to _base_, where _base_ is the base of digits to be stored by the PSRNs (such as 2 for binary or 10 for decimal).  Then set _c1_ and _c2_ each to 0.  Then set _d_ to 1.
3. Multiply _c1_ and _c2_ each by _base_ and add a digit chosen uniformly at random to that coordinate.
4. If ((_c1_+1)<sup>2</sup> + (_c2_+1)<sup>2</sup>) < _S_<sup>2</sup>, then do the following:
    1. Transfer _c1_'s least significant digits to _p1_'s fractional part, and transfer _c2_'s least significant digits to _p2_'s fractional part.  The variable _d_ tells how many digits to transfer to each PSRN this way. (For example, if _base_ is 10, _d_ is 3, and _c1_ is 342, set _p1_'s fractional part to \[3, 4, 2\].)
    2. Run the **UniformDivide** algorithm on _p1_ and _p2_, in that order, then set the resulting PSRN's sign to positive or negative with equal probability, then return that PSRN.
5. If (_c1_<sup>2</sup> + _c2_<sup>2</sup>) > _S_<sup>2</sup>, then go to step 2.
6. Multiply _S_ by _base_, then add 1 to _d_, then go to step 3.

<a id=Exponential_Distribution_with_Unknown_Small_Rate></a>
#### Exponential Distribution with Unknown Small Rate

Exponential random variates can be generated using an input coin of unknown probability of heads of _&lambda;_ (which can either be 1 or come between 0 and 1), by generating arrival times in a _Poisson process_ of rate 1, then _thinning_ the process using the coin.  The arrival times that result will be exponentially distributed with rate _&lambda;_.  I found the basic idea in the answer to a [**Mathematics Stack Exchange question**](https://math.stackexchange.com/questions/3362473/simulating-an-exponential-random-variable-given-bernoulli-uniform), and thinning of Poisson processes is discussed, for example, in Devroye (1986, chapter six)[^24].  The algorithm follows:

1. Generate an exponential(1) random variate using the **ExpRand** or **ExpRand2** algorithm (with _&lambda;_ = 1), call it _ex_.
2. (Thinning step.) Flip the input coin.  If it returns 1, return _ex_.
3. Generate another exponential(1) random variate using the **ExpRand** or **ExpRand2** algorithm (with _&lambda;_ = 1), call it _ex2_.  Then run **UniformAdd** on _ex_ and _ex2_ and set _ex_ to the result.  Then go to step 2.

Notice that the algorithm's average running time increases as _&lambda;_ decreases.

<a id=Exponential_Distribution_with_Rate_ln__x></a>
#### Exponential Distribution with Rate ln(_x_)

The following new algorithm generates a partially-sampled random number that follows the exponential distribution with rate ln(_x_).  This is useful for generating a base-_x_ logarithm of a uniform(0,1) random variate.  This algorithm has two supported cases:

- _x_ is a rational number that's greater than 1.  In that case, let _b_ be floor(ln(_x_)/ln(2)).
- _x_ is a uniform PSRN with a positive sign and an integer part of 1 or greater.  In that case, let _b_ be floor(ln(_i_)/ln(2)), where _i_ is _x_'s integer part.

The algorithm follows.

1. (Samples the integer part of the random variate.) Generate a number that is 1 with probability 1/_x_ and 0 otherwise, repeatedly until a zero is generated this way.  Set _k_ to the number of ones generated this way. (This is also known as a "geometric random variate", but this terminology is avoided because it has conflicting meanings in academic works.)
    - If _x_ is a rational number and a power of 2, this step can be implemented by generating blocks of _b_ unbiased random bits until a **non-zero** block of bits is generated this way, then setting _k_ to the number of **all-zero** blocks of bits generated this way.
    - If _x_ is a uniform PSRN, this step is implemented as follows: Run the first subalgorithm (later in this section) repeatedly until a run returns 0.  Set _k_ to the number of runs that returned 1 this way.
2. (The rest of the algorithm samples the fractional part.) Create _f_, a uniform PSRN with a positive sign, an empty fractional part, and an integer part of 0.
3. Create a _&mu;_ input coin that does the following: "Call **SampleGeometricBag** on _f_, then run the **algorithm for ln(1+_y_/_z_)** (given in "Bernoulli Factory Algorithms") with _y_/_z_ = 1/1.  If both calls return 1, return 1.  Otherwise, return 0." (This simulates the probability _&lambda;_ = _f_\*ln(2).)   Then:
    - If _x_ is a rational number, but not a power of 2, also create a _&nu;_ input coin that does the following: "Call **SampleGeometricBag** on _f_, then run the **algorithm for ln(1 + _y_/_z_)** with _y_/_z_ = (_x_&minus;2<sup>_b_</sup>)/2<sup>_b_</sup>.  If both calls return 1, return 1.  Otherwise, return 0."
    - If _x_ is a uniform PSRN, also create a _&rho;_ input coin that does the following: "Return the result of the second subalgorithm (later in this section), given _x_ and _b_", and a _&nu;_ input coin that does the following: "Call **SampleGeometricBag** on _f_, then run the **algorithm for ln(1 + _&lambda;_)**, using the _&rho;_ input coin.  If both calls return 1, return 1.  Otherwise, return 0."
4. Call the **ExpMinus** algorithm with parameter _&mu;_ (using the _&mu;_ input coin), _b_ times.  If a _&nu;_ input coin was created in step 3, run the same algorithm once, using the _&nu;_ input coin.  If all these calls return 1, accept _f_.  If _f_ is accepted this way, set _f_'s integer part to _k_, then optionally fill _f_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _f_.
5. If _f_ was not accepted by the previous step, go to step 2.

> **Note**: A _bounded exponential_ random variate with rate ln(_x_) and bounded by _m_ has a similar algorithm to this one.  Step 1 is changed to read as follows: "Do the following _m_ times or until a zero is generated, whichever happens first: 'Generate a number that is 1 with probability 1/_x_ and 0 otherwise'. Then set _k_ to the number of ones generated this way. (_k_ is a so-called bounded-geometric(1&minus;1/_x_, _m_) random variate, which an algorithm of Bringmann and Friedrich (2013)[^39] can generate as well.  If _x_ is a power of 2, this can be implemented by generating blocks of _b_ unbiased random bits until a **non-zero** block of bits or _m_ blocks of bits are generated this way, whichever comes first, then setting _k_ to the number of **all-zero** blocks of bits generated this way.) If _k_ is _m_, return _m_ (this _m_ is a constant, not a uniform PSRN; if the algorithm would otherwise return a uniform PSRN, it can return something else in order to distinguish this constant from a uniform PSRN)."  Additionally, instead of generating a uniform(0,1) random variate in step 2, a uniform(0,_&mu;_) random variate can be generated instead, such as a uniform PSRN generated via **RandUniformFromReal**, to implement an exponential distribution bounded by _m_+_&mu;_ (where _&mu;_ is a real number greater than 0 and less than 1).

The following generator for the **rate ln(2)** is a special case of the previous algorithm and is useful for generating a base-2 logarithm of a uniform(0,1) random variate. Unlike the similar algorithm of Ahrens and Dieter (1972)[^40], this one doesn't require a table of probability values.

1. (Samples the integer part of the random variate.  This will be geometrically distributed with parameter 1/2.) Generate unbiased random bits until a zero is generated this way.  Set _k_ to the number of ones generated this way.
2. (The rest of the algorithm samples the fractional part.) Create _f_, a uniform PSRN with integer part 0 and a positive sign.
3. Create an input coin that does the following: "Call **SampleGeometricBag** on _f_, then run the **algorithm for ln(1+_y_/_z_)** (given in "Bernoulli Factory Algorithms") with _y_/_z_ = 1/1.  If both calls return 1, return 1.  Otherwise, return 0." (This simulates the probability _&lambda;_ = _f_\*ln(2).)
4. Run the **ExpMinus** algorithm with parameter _&lambda;_, using the input coin from the previous step.  If the call returns 1, accept _f_.  If _f_ is accepted this way, set _f_'s integer part to _k_, then optionally fill _f_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _f_.
5. If _f_ was not accepted by the previous step, go to step 2.

The first subalgorithm samples the probability 1/_x_, where _x_&ge;1 is a uniform PSRN:

1. Set _c_ to _x_'s integer part.  With probability _c_ / (1 + _c_), return a number that is 1 with probability 1/_c_ and 0 otherwise.
2. Run **SampleGeometricBag** on _x_ (which ignores _x_'s integer part and sign).  If the run returns 1, return 0.  Otherwise, go to step 1.

The second subalgorithm samples the probability (_x_&minus;2<sup>_b_</sup>)/2<sup>_b_</sup>, where _x_&ge;1 is a uniform PSRN and _b_&ge;0 is an integer:

1. Subtract 2<sup>_b_</sup> from _x_'s integer part, then create _y_ as **RandUniformFromReal**(2<sup>_b_</sup>), then run **URandLessThanReal**(_x_, _y_), then add 2<sup>_b_</sup> back to _x_'s integer part.
2. Return the result of **URandLessThanReal** from step 1.

<a id=Lindley_Distribution_and_Lindley_Like_Mixtures></a>
#### Lindley Distribution and Lindley-Like Mixtures

A _mixture_ involves one or more distributions, where each distribution has a separate probability of being sampled, and sampling one of them at random.

> **Example:** One example of a mixture is two beta distributions, with separate parameters.  One beta distribution is chosen with probability exp(&minus;3) (which can be simulated, for example, using the **ExpMinus** algorithm with parameter 3 can be used) and the other is chosen with the opposite probability.  For the two beta distributions, an arbitrary-precision sampling algorithm exists.

The _Lindley distribution_ is one example of a _mixture_, namely, there are two probability distributions, with each of the two distributions having a separate probability of being sampled (_w_ and 1&minus;_w_ in the algorithm below).  A random variate that follows the Lindley distribution (Lindley 1958)[^41] with parameter _&theta;_ (a real number greater than 0) can be generated as follows:

Let _A_ be 1 and let _B_ be 2.  Then:

1. With probability _w_ = _&theta;_/(1+_&theta;_), generate _A_ exponential random variates with a rate of _r_ = _&theta;_ via **ExpRand** or **ExpRand2** (described in my article on PSRNs), then generate their sum by applying the **UniformAdd** algorithm, then return that sum.
2. Otherwise, generate _B_ exponential random variates with a rate of _r_ via **ExpRand** or **ExpRand2**, then generate their sum by applying the **UniformAdd** algorithm, then return that sum.

Mixtures similar to the Lindley distribution are shown in the following table and use the same algorithm, but with the values given in the table.

| Distribution | _w_ is: | _r_ is: | _A_ is: | _B_ is: |
  --- | --- | --- | --- | --- |
| Garima (Shanker 2016)[^42]. | (1+_&theta;_)/(2+_&theta;_). | _&theta;_. | 1. | 2. |
| i-Garima (Singh and Das 2020)[^43]. | (2+_&theta;_)/(3+_&theta;_). | _&theta;_. | 1. | 2. |
| Mixture-of-weighted-exponential-and-weighted-gamma (Iqbal and Iqbal 2020)[^44]. | _&theta;_/(1+_&theta;_). | _&theta;_. | 2. | 3. |
| Xgamma (Sen et al. 2016)[^45]. | _&theta;_/(1+_&theta;_). | _&theta;_. | 1. | 3. |
| Mirra (Sen et al. 2021)[^46]. | _&theta;_<sup>2</sup>/(_&alpha;_+_&theta;_<sup>2</sup>) where _&alpha;_>0. | _&theta;_. | 1. | 3. |

> **Notes:**
>
> 1. If _&theta;_ is a uniform PSRN, then the check "With probability  _w_ = _&theta;_/(1+_&theta;_)" can be implemented by running the Bernoulli factory algorithm for **(_d_ + _&mu;_) / ((_d_ + _&mu;_) + (_c_ + _&lambda;_))**, where _c_ is 1; _&lambda;_ represents an input coin that always returns 0; _d_ is _&theta;_'s integer part, and _&mu;_ is an input coin that runs **SampleGeometricBag** on _&theta;_'s fractional part.  The check succeeds if the Bernoulli factory algorithm returns 1.
> 2. A **Sushila** random variate is _&alpha;_ times a Lindley random variate, where _&alpha;_ > 0 (Shanker et al. 2013)[^47].
> 3. An **X-Lindley** random variate (Chouia and Zeghdoudi 2021)[^48] is, with probability _&theta;_/(1+_&theta;_), an exponential random variate with a rate of _&theta;_ (see step 1), and otherwise, a Lindley random variate with parameter _&theta;_.

<a id=Gamma_Distribution></a>
#### Gamma Distribution

The following arbitrary-precision sampler generates the sum of _n_ independent exponential random variates (also known as the Erlang(_n_) or gamma(_n_) distribution), implemented via partially-sampled uniform random variates.  Obviously, this algorithm is inefficient for large values of _n_.

1. Generate _n_ exponential random variates with a rate of 1 via the **ExpRand** or **ExpRand2** algorithm.  These numbers will be uniform PSRNs; this algorithm won't work for exponential PSRNs (e-rands) because the sum of two e-rands may follow a subtly wrong distribution.  By contrast, generating exponential random variates via rejection from the uniform distribution will allow unsampled digits to be sampled uniformly at random without deviating from the exponential distribution.
2. Generate the sum of the random variates generated in step 1 by applying the [**UniformAdd**](#Addition_and_Subtraction) algorithm given in another document.

<a id=One_Dimensional_Epanechnikov_Kernel></a>
#### One-Dimensional Epanechnikov Kernel

Adapted from Devroye and Györfi (1985, p. 236)[^49].

1. Generate three uniform PSRNs _a_, _b_, and _c_, with a positive sign, an integer part of 0, and an empty fractional part.
2. Run **URandLess** on _a_ and _c_ in that order, then run **URandLess** on _b_ and _c_ in that order.  If both runs return 1, set _c_ to point to _b_.
3. Generate an unbiased random bit.  If that bit is 1 (which will happen with probability 1/2), set _c_'s sign to negative.
4. Return _c_.

<a id=Uniform_Distribution_Inside_Rectellipse></a>
#### Uniform Distribution Inside Rectellipse

The following example generates a point inside a quarter [**_rectellipse_**](https://mathworld.wolfram.com/Rectellipse.html) centered at (0, 0) with&mdash;

- horizontal "radius" _d1_, which is an integer greater than 0,
- vertical "radius" _d2_, which is an integer greater than 0, and
- squareness parameter _&sigma;_, which is a rational number in [0, 1].

Use the algorithm in "[**Uniform Distribution Inside N-Dimensional Shapes**](#Uniform_Distribution_Inside_N_Dimensional_Shapes)", except:

- Let **InShape** return&mdash;
    - _YES_ if (_&sigma;_\*_x1_\*_y1_)<sup>2</sup>/(_d1_\*_d2_)<sup>2</sup> &minus; (_x2_/_d1_)<sup>2</sup> &minus; (_y2_/_d2_)<sup>2</sup> + 1 > 0,
    - _NO_ if (_&sigma;_\*_x2_\*_y2_)<sup>2</sup>/(_d1_\*_d2_)<sup>2</sup> &minus; (_x1_/_d1_)<sup>2</sup> &minus; (_y1_/_d2_)<sup>2</sup> + 1 < 0, and
    - _MAYBE_ otherwise,

    where _x1_ = _C1_/_S_, _x2_ = (_C1_+1)/_S_, _y1_ = _C2_/_S_, and _y2_ = (_C2_+1)/_S_ (these four values define the bounds, along the X and Y dimensions, of the box passed to **InShape**).

For a full rectellipse, step 5.3 in the algorithm is done for each of the two dimensions.

<a id=Tulap_distribution></a>
#### Tulap distribution

The algorithm below samples a variate from the Tulap(_m_, _b_, _q_) distribution ("truncated uniform Laplace"; Awan and Slavković (2019)[^50]) and returns it as a uniform PSRN.

- The parameter _b_ is greater than 0 and less than 1.  Logically, this is implemented as a "coin" whose probability of returning 1 (showing heads) is not known by the algorithm.  An example of this "coin" is a uniform PSRN with an initially empty fractional part, where "flipping" this "coin" means running **SampleGeometricBag** on that PSRN.
- The parameter _m_ is a rational number or a uniform PSRN.
- The parameter _q_ is not used in this algorithm, and is treated as 0.

-----

1. Flip the coin for _b_ until the result is 0.  Set _g1_ to the number of times the result is 1 this way.
2. Flip the coin for _b_ until the result is 0.  Set _g2_ to the number of times the result is 1 this way.
3. Set _n_ to _g2_ &minus; _g1_.  Create _ret_, a uniform PSRN as follows: The sign part is positive if _n_ &ge; 0 and negative otherwise; the integer part is abs(_n_); the fractional part is empty.
4. Add a uniform random variate in (&minus;1/2, 1/2) to _ret_.  If _ret_ stores base-2 fractional digits, this can be done as follows.  Set _u_ to an unbiased random bit, then:
    - If _n_ < 0 and _u_ is 1, subtract 1 from the integer part and append 1 to the fractional part.
    - If _n_ > 0 and _u_ is 1, add 1 to the integer part and append 1 to the fractional part.
    - If _n_ is 0 or _u_ is 0, append 0 to the fractional part.
5. If _m_ is given and is not 0, run the **UniformAdd** or **UniformAddRational** algorithm with parameters _ret_ and _m_, respectively, and set _ret_ to the result.
6. Return _ret_.

<a id=Continuous_Bernoulli_Distribution></a>
#### Continuous Bernoulli Distribution

The continuous Bernoulli distribution (Loaiza-Ganem and Cunningham 2019)[^51] was designed to considerably improve performance of variational autoencoders (a machine learning model) in modeling continuous data that takes values in the interval [0, 1], including "almost-binary" image data.

The continous Bernoulli distribution takes one parameter `lamda` (where 0 &le; `lamda` &le; 1), and takes on values in the closed interval [0, 1] with a probability proportional to&mdash;

    pow(lamda, x) * pow(1 - lamda, 1 - x).

Again, this function meets the requirements stated by Keane and O'Brien, so it can be simulated via Bernoulli factories.  Thus, this distribution can be simulated in Python as described below.

The algorithm for sampling the continuous Bernoulli distribution follows.  It uses an input coin that returns 1 with probability `lamda`.

1. Create a positive-sign zero-integer-part uniform PSRN.
2. Create a **complementary lambda Bernoulli factory** that returns 1 minus the result of the input coin.
3. Remove all digits from the uniform PSRN's fractional part.  This will result in an "empty" uniform random variate, _U_, in the interval [0, 1] for the following steps, which will accept _U_ with probability `lamda`<sup>_U_</sup>*(1&minus;`lamda`)<sup>1&minus;_U_</sup> as _U_ is built up.
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
           # Create a uniform random variate (U) bit-by-bit, and
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

The _bit complexity_ of an algorithm that generates random variates is measured as the number of unbiased random bits that algorithm uses on average.

<a id=General_Principles></a>
### General Principles

Existing work shows how to calculate the bit complexity for any probability distribution:

- For a 1-dimensional distribution with a probability density function (PDF), the bit complexity is greater than or equal to `DE + prec - 1` random bits, where `DE` is the differential entropy for the distribution and _prec_ is the number of bits in the random variate's fractional part (Devroye and Gravel 2020\)[^3].
- For a discrete distribution (a distribution of random integers with separate probabilities of occurring), the bit complexity is greater than or equal to the binary entropies of all the probabilities involved, summed together (Knuth and Yao 1976\)[^52].  (For a given probability _p_, the binary entropy is `0 - p*log2(p)` where `log2(x) = ln(x)/ln(2)`.)  An optimal algorithm will come within 2 bits of this lower bound on average.

For example, in the case of the exponential distribution, `DE` is log2(exp(1)/_&lambda;_), so the minimum bit complexity for this distribution is log2(exp(1)/_&lambda;_) + _prec_ &minus; 1, so that if _prec_ = 20, this minimum is about 20.443 bits when _&lambda;_ = 1, decreases when _&lambda;_ goes up, and increases when _&lambda;_ goes down.  In the case of any other distribution with a PDF, `DE` is the integral of `f(x) * log2(1/f(x))` over all valid values `x`, where `f` is the distribution's PDF.

Although existing work shows lower bounds on the number of random bits an algorithm will need on average, most algorithms will generally not achieve these lower bounds in practice.

In general, if an algorithm calls other algorithms that generate random variates, the total expected bit complexity is&mdash;

- the expected number of calls to each of those other algorithms, times
- the bit complexity for each such call.

<a id=Complexity_of_Specific_Algorithms></a>
### Complexity of Specific Algorithms

The beta and exponential samplers given here will generally use many more bits on average than the lower bounds on bit complexity, especially since they generate a PSRN one digit at a time.

The `zero_or_one` method generally uses 2 random bits on average, due to its nature as a Bernoulli trial involving random bits, see also (Lumbroso 2013, Appendix B\)[^53].  However, it uses no random bits if both its parameters are the same.

For **SampleGeometricBag** with base 2, the bit complexity has two components.

- One component comes from sampling the number of heads from a fair coin until the first tails, as follows:
    - Optimal lower bound: Since the binary entropy of the random variate is 2, the optimal lower bound is 2 bits.
    - Optimal upper bound: 4 bits.
- The other component comes from filling the partially-sampled random number's fractional part with random bits.  The complexity here depends on the number of times **SampleGeometricBag** is called for the same PSRN, call it `n`.  Then the expected number of bits is the expected number of bit positions filled this way after `n` calls.

**SampleGeometricBagComplement** has the same bit complexity as **SampleGeometricBag**.

**FillGeometricBag**'s bit complexity is rather easy to find.  For base 2, it uses only one bit to sample each unfilled digit at positions less than `p`. (For bases other than 2, sampling _each_ digit this way might not be optimal, since the digits are generated one at a time and random bits are not recycled over several digits.)  As a result, for an algorithm that uses both **SampleGeometricBag** and **FillGeometricBag** with `p` bits, these two contribute, on average, anywhere from `p + g * 2` to `p + g * 4` bits to the complexity, where `g` is the number of calls to **SampleGeometricBag**. (This complexity could be increased by 1 bit if **FillGeometricBag** is implemented with a rounding mechanism other than simple truncation.)

<a id=Application_to_Weighted_Reservoir_Sampling></a>
## Application to Weighted Reservoir Sampling

[**Weighted reservoir sampling**](https://peteroupc.github.io/randomfunc.html#Weighted_Choice_Without_Replacement_List_of_Unknown_Size) (choosing an item at random from a list of unknown size) is often implemented by&mdash;

- assigning each item a _weight_ (an integer 0 or greater) as it's encountered, call it _w_,
- giving each item an exponential random variate with _&lambda;_ = _w_, call it a key, and
- choosing the item with the smallest key

(see also (Efraimidis 2015\)[^54]). However, using fully-sampled exponential random variates as keys (such as the naïve idiom `-ln(1-X)/w`, where `X` is a uniform random variate between 0 and 1, in common floating-point arithmetic) can lead to inexact sampling, since the keys have a limited precision, it's possible for multiple items to have the same random key (which can make sampling those items depend on their order rather than on randomness), and the maximum weight is unknown.  Partially-sampled e-rands, as given in this document, eliminate the problem of inexact sampling.  This is notably because the `exprandless` method returns one of only two answers&mdash;either "less" or "greater"&mdash;and samples from both e-rands as necessary so that they will differ from each other by the end of the operation.  (This is not a problem because randomly generated real numbers are expected to differ from each other with probability 1.) Another reason is that partially-sampled e-rands have potentially arbitrary precision.

<a id=Acknowledgments></a>
## Acknowledgments

I acknowledge Claude Gravel who reviewed a previous version of this article.

Due to a suggestion by Michael Shoemate who suggested it was "easy to get lost" in this and related articles, some sections that related to PSRNs and were formerly in "More Algorithms for Arbitrary-Precision Sampling" were moved here.

<a id=Other_Documents></a>
## Other Documents

The following are some additional articles I have written on the topic of random and pseudorandom number generation.  All of them are open-source.

* [**Random Number Generator Recommendations for Applications**](https://peteroupc.github.io/random.html)
* [**Randomization and Sampling Methods**](https://peteroupc.github.io/randomfunc.html)
* [**More Random Sampling Methods**](https://peteroupc.github.io/randomnotes.html)
* [**Code Generator for Discrete Distributions**](https://peteroupc.github.io/autodist.html)
* [**The Most Common Topics Involving Randomization**](https://peteroupc.github.io/randomcommon.html)
* [**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)
* [**Testing PRNGs for High-Quality Randomness**](https://peteroupc.github.io/randomtest.html)
* [**Examples of High-Quality PRNGs**](https://peteroupc.github.io/hqprng.html)

<a id=Notes></a>
## Notes

[^1]: Karney, C.F.F., 2016. Sampling exactly from the normal distribution. ACM Transactions on Mathematical Software (TOMS), 42(1), pp.1-14. Also: "[**Sampling exactly from the normal distribution**](https://arxiv.org/abs/1303.6257v2)", arXiv:1303.6257v2  [physics.comp-ph], 2014.

[^2]: Philippe Flajolet, Nasser Saheb. The complexity of generating an exponentially distributed variate. [Research Report] RR-0159, INRIA. 1982. inria-00076400.

[^3]: Devroye, L., Gravel, C., "[**Random variate generation using only finitely many unbiased, independently and identically distributed random bits**](https://arxiv.org/abs/1502.02539v6)", arXiv:1502.02539v6  [cs.IT], 2020.

[^4]: Thomas, D.B. and Luk, W., 2008, September. Sampling from the exponential distribution using independent bernoulli variates. In 2008 International Conference on Field Programmable Logic and Applications (pp. 239-244). IEEE.

[^5]: A. Habibizad Navin, R. Olfatkhah and M. K. Mirnia, "A data-oriented model of exponential random variable," 2010 2nd International Conference on Advanced Computer Control, Shenyang, 2010, pp. 603-607, doi: 10.1109/ICACC.2010.5487128.

[^6]: Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.

[^7]: Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560v2)", arXiv:0906.5560v2  [math.PR], 2010.

[^8]: Pedersen, K., "[**Reconditioning your quantile function**](https://arxiv.org/abs/1704.07949)", arXiv:1704.07949 [stat.CO], 2018.

[^9]: von Neumann, J., "Various techniques used in connection with random digits", 1951.

[^10]: As noted by von Neumann (1951), a uniform random variate bounded by 0 and 1 can be produced by "juxtapos[ing] enough random binary digits".  In this sense, the variate is _X1_/`B`<sup>1</sup> + _X2_/`B`<sup>2</sup> + ..., (where `B` is the digit base 2, and _X1_, _X2_, etc. are independent uniform random integers in the interval \[0, `B`\)), perhaps "forc[ing] the last [random bit] to be 1" "[t]o avoid any bias".  It is not hard to see that this approach can be applied to generate any digit expansion of any base, not just 2.

[^11]: Yusong Du, Baoying Fan, and Baodian Wei, "[**An Improved Exact Sampling Algorithm for the Standard Normal Distribution**](https://arxiv.org/abs/2008.03855)", arXiv:2008.03855 [cs.DS], 2020.

[^12]: This means that every zero-volume (Lebesgue measure zero) subset of the distribution's domain (such as a finite set of points) has zero probability.  Equivalently, it means the distribution has a probability density function.

[^13]: Oberhoff, Sebastian, "[**Exact Sampling and Prefix Distributions**](https://dc.uwm.edu/etd/1888)", _Theses and Dissertations_, University of Wisconsin Milwaukee, 2018.

[^14]: Hill, T.P. and Schürger, K., 2005. Regularity of digits and significant digits of random variables. _Stochastic processes and their applications_, 115(10), pp.1723-1743.

[^15]: J.F. Williamson, "Random selection of points distributed on curved surfaces", _Physics in Medicine & Biology_ 32(10), 1987.

[^16]: Boehm, Hans-J. "Towards an API for the real numbers." In Proceedings of the 41st ACM SIGPLAN Conference on Programming Language Design and Implementation, pp. 562-576. 2020.

[^17]: Hans-J. Boehm. 1987. Constructive Real Interpretation of Numerical Programs. In Proceedings of the SIGPLAN ’87 Symposium on Interpreters and Interpretive Techniques. 214-221

[^18]: Goubault-Larrecq, Jean, Xiaodong Jia, and Clément Théron. "A Domain-Theoretic Approach to Statistical Programming Languages." arXiv preprint arXiv:2106.16190 (2021) (especially sec. 12.3).

[^19]: Brassard, G., Devroye, L., Gravel, C., "Remote Sampling with Applications to General Entanglement Simulation", _Entropy_ 2019(21)(92), doi:10.3390/e21010092.

[^20]: Note that _ak_ \* _&beta;_<sup>&minus;(_i_ + 1)</sup> is not just within _&beta;_<sup>&minus;(_i_ + 1)</sup> of its "true" result's absolute value, but also not more than that value.  Hence _ak_ >= _bk_ + 1 rather than _ak_ >= _bk_ + 2.

[^21]: A. Habibizad Navin, Fesharaki, M.N., Teshnelab, M. and Mirnia, M., 2007. "Data oriented modeling of uniform random variable: Applied approach". _World Academy Science Engineering Technology_, 21, pp.382-385.

[^22]: Nezhad, R.F., Effatparvar, M., Rahimzadeh, M., 2013. "Designing a Universal Data-Oriented Random Number Generator", _International Journal of Modern Education and Computer Science_ 2013(2), pp. 19-24.

[^23]: In effect, for each supported integer _n_, the tree gives the probabilities of getting a value in \[_n_\*_p_, (_n_+1)\*_p_\], where _p_ is the resolution of the tree such as 1/100000.

[^24]: Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.

[^25]: Fan, Baoying et al. “On Generating Exponentially Distributed Variates by Using Early Rejection.” _2019 IEEE 5th International Conference on Computer and Communications (ICCC)_ (2019): 1307-1311.

[^26]: 2016C.T. Li, A. El Gamal, "[**A Universal Coding Scheme for Remote Generation of Continuous Random Variables**](https://arxiv.org/abs/1603.05238v1)", arXiv:1603.05238v1  [cs.IT], 2016.

[^27]: Harlow, J., Sainudiin, R., Tucker, W., "Mapped Regular Pavings", _Reliable Computing_ 16 (2012).

[^28]: Duff, T., "Interval Arithmetic and Recursive Subdivision for Implicit Functions and Constructive Solid Geometry", Computer Graphics 26(2), July 1992.

[^29]: Daumas, M., Lester, D., Muñoz, C., "[**Verified Real Number Calculations: A Library for Interval Arithmetic**](https://arxiv.org/abs/0708.3721)", arXiv:0708.3721 [cs.MS], 2007.

[^30]: I thank D. Eisenstat from the _Stack Overflow_ community for leading me to this insight.

[^31]: More specifically, the _essential supremum_, that is, the function's highest point in \[0, 1\] ignoring zero-volume, or measure-zero, sets.  However, the mode is also correct here, since discontinuous PDFs don't admit Bernoulli factories, as required by step 2.

[^32]: choose(_n_, _k_) = (1\*2\*3\*...\*_n_)/((1\*...\*_k_)\*(1\*...\*(_n_&minus;_k_))) =  _n_!/(_k_! * (_n_ &minus; _k_)!) is a _binomial coefficient_, or the number of ways to choose _k_ out of _n_ labeled items.  It can be calculated, for example, by calculating _i_/(_n_&minus;_i_+1) for each integer _i_ in the interval \[_n_&minus;_k_+1, _n_\], then multiplying the results (Yannis Manolopoulos. 2002. "[**Binomial coefficient computation: recursion or iteration?**](https://doi.org/10.1145/820127.820168)", SIGCSE Bull. 34, 4 (December 2002), 65–67).  For every _m_&gt;0, choose(_m_, 0) = choose(_m_, _m_) = 1 and choose(_m_, 1) = choose(_m_, _m_&minus;1) = _m_; also, in this document, choose(_n_, _k_) is 0 when _k_ is less than 0 or greater than _n_.

[^33]: _n_! = 1\*2\*3\*...\*_n_ is also known as _n_ factorial; in this document, (0!) = 1.

[^34]: _Summation notation_, involving the Greek capital sigma (&Sigma;), is a way to write the sum of one or more terms of similar form. For example, $\sum_{k=0}^n g(k)$ means $g(0)+g(1)+...+g(n)$, and $\sum_{k\ge 0} g(k)$ means $g(0)+g(1)+...$.

[^35]: Goyal, V. and Sigman, K., 2012. On simulating a class of Bernstein polynomials. ACM Transactions on Modeling and Computer Simulation (TOMACS), 22(2), pp.1-5.

[^36]: S. Ray, P.S.V. Nataraj, "A Matrix Method for Efficient Computation of Bernstein Coefficients", _Reliable Computing_ 17(1), 2012.

[^37]: "_x_ is odd" means that _x_ is an integer and not divisible by 2.  This is true if _x_ &minus; 2\*floor(_x_/2) equals 1, or if _x_ is an integer and the least significant bit of abs(_x_) is 1.

[^38]: "_x_ is even" means that _x_ is an integer and divisible by 2.  This is true if _x_ &minus; 2\*floor(_x_/2) equals 0, or if _x_ is an integer and the least significant bit of abs(_x_) is 0.

[^39]: Bringmann, K. and Friedrich, T., 2013, July. "Exact and efficient generation of geometric random variates and random graphs", in _International Colloquium on Automata, Languages, and Programming_ (pp. 267-278).

[^40]: Ahrens, J.H., and Dieter, U., "Computer methods for sampling from the exponential and normal distributions", _Communications of the ACM_ 15, 1972.

[^41]: Lindley, D.V., "Fiducial distributions and Bayes' theorem", _Journal of the Royal Statistical Society Series B_, 1958.

[^42]: Shanker, R., "Garima distribution and its application to model behavioral science data", _Biom Biostat Int J._ 4(7), 2016.

[^43]: Singh, B.P., Das, U.D., "[**On an Induced Distribution and its Statistical Properties**](https://arxiv.org/abs/2010.15078)", arXiv:2010.15078 [stat.ME], 2020.

[^44]: Iqbal, T. and Iqbal, M.Z., 2020. On the Mixture Of Weighted Exponential and Weighted Gamma Distribution. International Journal of Analysis and Applications, 18(3), pp.396-408.

[^45]: Sen, S., et al., "The xgamma distribution: statistical properties and application", 2016.

[^46]: Sen, Subhradev, Suman K. Ghosh, and Hazem Al-Mofleh. "The Mirra distribution for modeling time-to-event data sets." In Strategic Management, Decision Theory, and Decision Science, pp. 59-73. Springer, Singapore, 2021.

[^47]: Shanker, Rama, Shambhu Sharma, Uma Shanker, and Ravi Shanker. "Sushila distribution and its application to waiting times data." International Journal of Business Management 3, no. 2 (2013): 1-11.

[^48]: Chouia, Sarra, and Halim Zeghdoudi. "The xlindley distribution: Properties and application." Journal of Statistical Theory and Applications 20, no. 2 (2021): 318-327.

[^49]: Devroye, L., Györfi, L., _Nonparametric Density Estimation: The L1 View_, 1985.

[^50]: Awan, Jordan, and Aleksandra Slavković. "Differentially private inference for binomial data." arXiv:1904.00459 (2019).

[^51]: Loaiza-Ganem, Gabriel, and John P. Cunningham. "The continuous Bernoulli: fixing a pervasive error in variational autoencoders." _Advances in Neural Information Processing Systems_ 32 (2019).

[^52]: Knuth, Donald E. and Andrew Chi-Chih Yao. "The complexity of nonuniform random number generation", in _Algorithms and Complexity: New Directions and Recent Results_, 1976.

[^53]: Lumbroso, J., "[**Optimal Discrete Uniform Generation from Coin Flips, and Applications**](https://arxiv.org/abs/1304.1916)", arXiv:1304.1916 [cs.DS].

[^54]: Efraimidis, P. "[**Weighted Random Sampling over Data Streams**](https://arxiv.org/abs/1012.0256v2)", arXiv:1012.0256v2 [cs.DS], 2015.

[^55]: Glen, A.G., Leemis, L.M. and Drew, J.H., 2004. Computing the distribution of the product of two continuous random variables. Computational statistics & data analysis, 44(3), pp.451-464.

[^56]: Brassard, G., Devroye, L., Gravel, C., "Remote Sampling with Applications to General Entanglement Simulation", _Entropy_ 2019(21)(92), [**https://doi.org/10.3390/e21010092**](https://doi.org/10.3390/e21010092)

[^57]: Devroye, L., Gravel, C., "[**Random variate generation using only finitely many unbiased, independently and identically distributed random bits**](https://arxiv.org/abs/1502.02539v6)", arXiv:1502.02539v6 [cs.IT], 2020.

[^58]: Łatuszyński, K., Kosmidis, I.,  Papaspiliopoulos, O., Roberts, G.O., "[**Simulating events of unknown probabilities via reverse time martingales**](https://arxiv.org/abs/0907.4018v2)", arXiv:0907.4018v2 [stat.CO], 2009/2011.

[^59]: Kinderman, A.J., Monahan, J.F., "Computer generation of random variables using the ratio of uniform deviates", _ACM Transactions on Mathematical Software_ 3(3), pp. 257-260, 1977.

[^60]: Leydold, J., "[**Automatic sampling with the ratio-of-uniforms method**](https://dl.acm.org/doi/10.1145/347837.347863)", ACM Transactions on Mathematical Software 26(1), 2000.

[^61]: S. Kakutani, "On equivalence of infinite product measures", _Annals of Mathematics_ 1948.

[^62]: George Marsaglia. "Random Variables with Independent Binary Digits." Ann. Math. Statist. 42 (6) 1922 - 1929, December, 1971. [**https://doi.org/10.1214/aoms/1177693058**](https://doi.org/10.1214/aoms/1177693058) .

[^63]: Chatterji, S. D.. “Certain induced measures and the fractional dimensions of their “supports”.” Zeitschrift für Wahrscheinlichkeitstheorie und Verwandte Gebiete 3 (1964): 184-192.

<a id=Appendix></a>
## Appendix

<a id=Equivalence_of_SampleGeometricBag_Algorithms></a>
### Equivalence of SampleGeometricBag Algorithms

For the **SampleGeometricBag**, there are two versions: one for binary (base 2) and one for other bases.  Here is why these two versions are equivalent in the binary case.  Step 2 of the first algorithm samples a temporary random variate _N_.  This can be implemented by generating unbiased random bits (that is, each bit is either 0 or 1, chosen with equal probability) until a zero is generated this way.  There are three cases relevant here.

- The generated bit is one, which will occur at a 50% chance. This means the bit position is skipped and the algorithm moves on to the next position.  In algorithm 3, this corresponds to moving to step 3 because **a**'s fractional part is equal to **b**'s, which likewise occurs at a 50% chance compared to the fractional parts being unequal (since **a** is fully built up in the course of the algorithm).
- The generated bit is zero, and the algorithm samples (or retrieves) a zero bit at position _N_, which will occur at a 25% chance. In algorithm 3, this corresponds to returning 0 because **a**'s fractional part is less than **b**'s, which will occur with the same probability.
- The generated bit is zero, and the algorithm samples (or retrieves) a one bit at position _N_, which will occur at a 25% chance. In algorithm 3, this corresponds to returning 1 because **a**'s fractional part is greater than **b**'s, which will occur with the same probability.

<a id=UniformMultiply_Algorithm></a>
### UniformMultiply Algorithm

The following algorithm (**UniformMultiply**) shows how to multiply two uniform PSRNs (**a** and **b**) that store digits of the same base (radix) in their fractional parts, and get a uniform PSRN as a result.  The input PSRNs may have a positive or negative sign, and it is assumed that their integer parts and signs were sampled.

The algorithm currently works only if each PSRN's fractional part has at least one nonzero digit; otherwise, it can produce results that follow an incorrect distribution.  This case might be handled by applying the note in the section "Multiplication", but this will further complicate the algorithm below.

1. If **a** has unsampled digits before the last sampled digit in its fractional part, set each of those unsampled digits to a digit chosen uniformly at random.  Do the same for **b**.
2. If **a** has fewer digits in its fractional part than **b** (or vice versa), sample enough digits (by setting them to uniform random digits, such as unbiased random bits if **a** and **b** store binary, or base-2, digits) so that both PSRNs' fractional parts have the same number of digits.
3. If either **a** or **b** has an integer part of 0 and a fractional part with no non-zero digits, then do the following.
     1. Append a digit chosen uniformly at random to **a**'s fractional part.  Do the same for **b**.
     2. If either **a** or **b** has an integer part of 0 and a fractional part with no non-zero digits, go to the previous substep.
4. Let _afp_ be **a**'s integer and fractional parts packed into an integer, as explained in the example, and let _bfp_ be **b**'s integer and fractional parts packed the same way.  (For example, if **a** represents the number 83.12344..., _afp_ is 8312344.)  Let _digitcount_ be the number of digits in **a**'s fractional part.
5. Calculate _n1_ = _afp_\*_bfp_, _n2_ = _afp_\*(_bfp_+1), _n3_ = (_afp_+1)\*_bfp_, and _n4_ = (_afp_+1)\*(_bfp_+1).
6. Set _minv_ to _n1_ and _maxv_ to _n2_.  Set _midmin_ to min(_n2_, _n3_) and _midmax_ to max(_n2_, _n3_).
    - <small>The numbers _minv_ and _maxv_ are lower and upper bounds to the result of applying interval multiplication to the PSRNs **a** and **b**. For example, if **a** is 0.12344... and **b** is 0.38925..., their fractional parts are added to form **c** = 0.51269...., or the interval [0.51269, 0.51271].  However, the resulting PSRN is not uniformly distributed in its interval.  In the case of multiplication the distribution is almost a trapezoid whose domain is the interval \[_minv_, _maxv_\] and whose top is delimited by _midmin_ and _midmax_. (See note 1 at the end of this section.)</small>
7. Create a new uniform PSRN, _ret_.  If **a**'s sign is negative and **b**'s sign is negative, or vice versa, set _ret_'s sign to negative.  Otherwise, set _ret_'s sign to positive.
8. Set _z_ to a uniform random integer in the interval [0, _maxv_&minus;_minv_).
9. If _z_ &lt; _midmin_&minus;_minv_ or if _z_ &ge; _midmax_ &minus; _minv_, we will sample from the left side or right side of the "trapezoid", respectively.  In this case, do the following:
     1. Set _x_ to _minv_ + _z_.  Create _psrn_, a PSRN with positive sign and empty fractional part.
     2. If _z_ &lt; _midmin_ &minus; _minv_ (left side), set _psrn_'s integer part to _x_ &minus; _minv_, then run **sub-algorithm 1** given later, with the parameters _minv_ and _psrn_. (The sub-algorithm returns 1 with probability ln((_minv_+_psrn_)/_minv_).)
     3. If _z_ &ge; _midmin_ &minus; _minv_ (right side), set _psrn_'s integer part to _x_ &minus; _midmax_, then run **sub-algorithm 2** given later, with the parameters _maxv_, _midmax_ and _psrn_. (The sub-algorithm returns 1 with probability ln(_maxv_/(_midmax_+_psrn_)).)
     4. If sub-algorithm 1 or 2 returns 1, the algorithm succeeds, so do the following:
         1. Set _s_ to _ru_.
         2. Transfer the _n_\*2 least significant digits of _s_ to _ret_'s fractional part, where _n_ is the number of digits in **a**'s fractional part.  (Note that _ret_'s fractional part stores digits from most to least significant.)
         3. Append the digits in _psrn_'s fractional part to the end of _ret_'s fractional part.
         4. Set _ret_'s integer part to floor(_s_/_base_<sup>_n_\*2</sup>).  (For example, if _base_ is 10, _n_\*2 is 4, and _s_ is 342978, then _ret_'s fractional part is set to \[2, 9, 7, 8\], and _ret_'s integer part is set to 34.)  Finally, return _ret_.
     5. If sub-algorithm 1 or 2 returns 0, abort these substeps and go to step 8.
10. (If we reach here, we have reached the middle part of the trapezoid, which is flat and uniform.) If _n2_ > _n3_, run **sub-algorithm 3** given later, with the parameter _afp_ (returns 1 with probability ln(1+1/_afp_)).  Otherwise, run **sub-algorithm 3** with the parameter _bfp_ (returns 1 with probability ln(1+1/_bfp_)).  In either case, if the sub-algorithm returns 0, go to step 8.
11. (The algorithm succeeds.) Set _s_ to _minv_ + _z_, then transfer the (_n_\*2) least significant digits of _s_ to _ret_'s fractional part, then set _ret_'s integer part to floor(_s_/_base_<sup>_n_\*2</sup>), then return _ret_.

The following sub-algorithms are used by **UniformMultiply**.  They all involve the same underlying function, ln(1+_x_), with an [**algorithm**](https://peteroupc.github.io/bernoulli.html#ln_1___lambda) mentioned in the page "Bernoulli Factory Algorithms".

- The sub-algorithm **ln(1+_x_)** takes an **input algorithm** and returns 1 with probability ln(1+_x_), where _x_ is the probability that the input algorithm returns 1.
    - Do the following process repeatedly, until this sub-algorithm returns a value:
        1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), run the **input algorithm** and return the result.
        2. If _u_ wasn't created yet, create _u_, a uniform PSRN with positive sign, an integer part of 0, and an empty fractional part.
        3. Run the **SampleGeometricBag** algorithm on _u_'s fractional part, then run the **input algorithm**.  If the call and the run both return 1, return 0.
- **Sub-algorithm 1** takes two parameters (_minv_ and _psrn_) and returns 1 with probability ln((_minv_+_psrn_)/_minv_).  Run the **ln(1+_x_)** sub-algorithm with an **input algorithm** as follows:
    1. Let _p_ be _psrn_'s integer part.  Generate an integer in [0, _minv_) uniformly at random, call it _i_.
    2. If _i_ < _p_, return 1.  If _i_ = _p_, flip the input coin and return the result.  If neither is the case, return 0.
- **Sub-algorithm 2** takes three parameters (_maxv_, _midmax_ and _psrn_) and returns 1 with probability ln(_maxv_/(_midmax_+_psrn_)).  Run the **ln(1+_x_)** sub-algorithm with an **input algorithm** as follows:
    1. Let _p_ be _psrn_'s integer part.  Set _d_ to _maxv_ &minus; _p_ &minus; _midmax_ &minus; 1, and set _c_ to _p_ + _midmax_.
    2. With probability _c_ / (1 + _c_), do the following:
        - Generate an integer in [0, _c_) uniformly at random, call it _i_.   If _i_ < _d_, return 1.  If _i_ = _d_, run **SampleGeometricBag** on _psrn_'s fractional part and return 1 minus the result.  If _i_ > _d_, return 0.
    3. Run **SampleGeometricBag** on _psrn_'s fractional part.  If the result is 1, return 0.  Otherwise, go to step 2.
- **Sub-algorithm 3** takes one parameter (called _n_ here) and returns 1 with probability ln(1+1/_n_).  Run the **ln(1+_x_)** sub-algorithm with an **input algorithm** as follows: "Return a number that is 1 with probability 1/_n_ and 0 otherwise."

> **Note:** The product distribution of two uniform PSRNs is not exactly a trapezoid, but follows a not-so-trivial distribution; when each PSRN is bounded away from 0, the distribution's left and right sides are not exactly "triangular", but are based on logarithmic functions.  However, these logarithmic functions approach a triangular shape as the distribution's "width" gets smaller.  See Glen et al. (2004\)[^55] and a [**Stack Exchange question**](https://math.stackexchange.com/questions/375967/probability-density-function-of-a-product-of-uniform-random-variables).

<a id=Uniform_of_Uniforms_Produces_a_Product_of_Uniforms></a>
### Uniform of Uniforms Produces a Product of Uniforms

This section contains evidence that the algorithm given in the note in the section "Multiplication" correctly produces the product of two uniform random variates, one in [0, _b_] and the other in [_c_, _d_], at least when _c_ = 0.

The probability density function (PDF) for a uniform(_&alpha;_, _&beta;_) random variate is 1/(_&beta;_&minus;_&alpha;_) if _x_ is in [_&alpha;_, _&beta;_], and 0 elsewhere.  It will be called UPDF(_x_, _&alpha;_, _&beta;_) here.

Let _K_ = _b_\*(_d_&minus;_c_).  To show the result, we find two PDFs as described below.

- To find the PDF for the algorithm, find the expected value of UPDF(_x_, 0, _Z_+_b_\*_c_), where _Z_ is distributed as uniform(0, _K_).  This is done by finding the integral (area under the graph) with respect to _z_ of UPDF(_x_, 0, _z_+_b_\*_c_)\*UPDF(_z_, 0, _K_) in the interval [0, _K_\] (the set of values _Z_ can take on).  The result is `PDF1(x) = ln(b**2*c**2 - b**2*c*d + (b*c - b*d)*min(b*(-c + d), max(0, -b*c + x)))/(b*c - b*d) - ln(b**2*c**2 - b**2*c*d + b*(-c + d)*(b*c - b*d))/(b*c - b*d)`.
- The second PDF is the PDF for the product of two uniform random variates, one in [0, _b_] and the other in [_c_, _d_].  By Rohatgi's formula (see also (Glen et al. 2004\)[^55]), it can be found by finding the integral with respect to _z_ of UPDF(_z_, 0, _b_)\*UPDF(_x_/_z_, _c_, _d_)/_z_, in the interval [0, &infin;) (noting that _z_ is never negative here).  The result is `PDF2(x) = (ln(max(c,x/b)) - ln(max(c,d,x/b)))/(b*c-b*d)`.

Now it must be shown that `PDF1` and `PDF2` are equal whenever _x_ is in the interval (0, _b_\*_d_).  Subtracting one PDF from the other and simplifying, it is seen that:

- Both PDFs are equal at least when _c_ = 0 (and when _b_, _d_, and _x_ are all greater than 0), and they are equal in all calculations so far when _b_, _c_, and _d_ are replaced with specific values.
- The simplified difference between the PDFs has an integral equal to 0, which strongly suggests the PDFs are equal (this is not conclusive because the simplified difference can be negative).

<a id=Oberhoff_s_Exact_Rejection_Sampling_Method></a>
### Oberhoff's "Exact Rejection Sampling" Method

The following describes an algorithm described by Oberhoff for sampling a continuous distribution taking on values in [0, 1], as long as the distribution has a probability density function (PDF) and the PDF is continuous "almost everywhere" and less than or equal to a finite number (Oberhoff 2018, section 3\)[^13], see also (Devroye and Gravel 2020\)[^3]. (Note that if the PDF's domain is wider than [0, 1], then the function needs to be divided into one-unit-long pieces, one piece chosen at random with probability proportional to its area, and that piece shifted so that it lies in [0, 1] rather than its usual place; see Oberhoff pp. 11-12.)

1. Set _pdfmax_ to an upper bound of the PDF (or the PDF times a possibly unknown constant factor) on the domain at \[0, 1\].  Let _base_ be the base, or radix, of the digits in the return value (such as 2 for binary or 10 for decimal).
2. Set _prefix_ to 0 and _prefixLength_ to 0.
3. Set _y_ to a uniform random variate that satisfies 0 &le; _y_ &le; _pdfmax_.
4. Let _pw_ be _base_<sup>&minus;_prefixLength_</sup>.  Set _lower_ and _upper_ to a lower or upper bound, respectively, of the value of the PDF (or the PDF times a possibly unknown constant factor) on the domain at \[_prefix_ * _pw_, _prefix_ * _pw_ + _pw_\].
5. If _y_ turns out to be greater than _upper_, the prefix was rejected, so go to step 2.
6. If _y_ turns out to be less than _lower_, the prefix was accepted.  Now do the following:
    1. While _prefixLength_ is less than the desired precision, set _prefix_ to _prefix_ * _base_ + _r_, where _r_ is a uniform random digit, then add 1 to _prefixLength_.
    2. Return _prefix_ * _base_<sup>&minus;_prefixLength_</sup>.  (If _prefixLength_ is somehow greater than the desired precision, then the algorithm could choose to round the return value to a number whose fractional part has the desired number of digits, with a rounding mode of choice.)
7. Set _prefix_ to _prefix_ * _base_ + _r_, where _r_ is a uniform random digit, then add 1 to _prefixLength_, then go to step 4.

This algorithm appears here in the appendix rather than in the main text, because:

- Certain operations it uses can introduce numerical errors unless care is taken.  These operations include evaluating the PDF (or a constant times the PDF) and finding its maximum and minimum values at an interval.
- This article is focused on algorithms that don't rely on calculations of irrational numbers.

Moreover, there is additional approximation error from generating _y_ with a fixed number of digits, unless _y_ is a uniform PSRN (see also "[**Application to Weighted Reservoir Sampling**](#Application_to_Weighted_Reservoir_Sampling)").  For practical purposes, the lower and upper bounds calculated in step 4 should depend on _prefixLength_ (the higher _prefixLength_ is, the more accurate).

Oberhoff also describes _prefix distributions_ that sample a box that covers the PDF, with probability proportional to the box's area, but these distributions will have to support a fixed maximum prefix length and so will only approximate the underlying distribution.

<a id=Probability_Transformations></a>
### Probability Transformations

The following algorithm takes a uniform partially-sampled random number (PSRN) as a "coin" and flips that "coin" using **SampleGeometricBag**.  Given that "coin" and a function _f_ as described below, the algorithm returns 1 with probability _f_(_U_), where _U_ is the number built up by the uniform PSRN (see also Brassard et al., (2019)[^56], (Devroye 1986, p. 769\)[^24], (Devroye and Gravel 2020\)[^57].  In the algorithm:

-  The uniform PSRN's sign must be positive and its integer part must be 0.
- For correctness, _f_(_U_) must meet the following conditions:
    - If the algorithm will be run multiple times with the same PSRN, _f_(_U_) must be the constant 0 or 1, or be continuous and polynomially bounded on the open interval (0, 1) (polynomially bounded means that both _f_(_U_) and 1&minus;_f_(_U_) are greater than or equal to min(_U_<sup>_n_</sup>, (1&minus;_U_)<sup>_n_</sup>) for some integer _n_ (Keane and O'Brien 1994\)[^6]).
    - Otherwise, _f_(_U_) must map the interval \[0, 1] to \[0, 1] and be continuous everywhere or "almost everywhere" (the set of discontinuous points must be "zero-volume", or have Lebesgue measure zero).

    The first set of conditions is the same as those for the Bernoulli factory problem (see "[**About Bernoulli Factories**](https://peteroupc.github.io/bernoulli.html#About_Bernoulli_Factories)) and ensure this algorithm is unbiased (see also Łatuszyński et al. (2009/2011)[^58]\).

The algorithm follows.

1. Set _v_ to 0 and _k_ to 1.
2. (_v_ acts as a uniform random variate greater than 0 and less than 1 to compare with _f_(_U_).) Set _v_ to _b_ * _v_ + _d_, where _b_ is the base (or radix) of the uniform PSRN's digits, and _d_ is a digit chosen uniformly at random.
3. Calculate an approximation of _f_(_U_) as follows:
    1. Set _n_ to the number of items (sampled and unsampled digits) in the uniform PSRN's fractional part.
    2. Of the first _n_ digits (sampled and unsampled) in the PSRN's fractional part, sample each of the unsampled digits uniformly at random.  Then let _uk_ be the PSRN's digit expansion up to the first _n_ digits after the point.
    3. Calculate the lowest and highest values of _f_ in the interval \[_uk_, _uk_ + _b_<sup>&minus;_n_</sup>\], call them _fmin_ and _fmax_. If abs(_fmin_ &minus; _fmax_) &le; 2 * _b_<sup>&minus;_k_</sup>, calculate (_fmax_ + _fmin_) / 2 as the approximation.  Otherwise, add 1 to _n_ and go to the previous substep.
4. Let _pk_ be the approximation's digit expansion up to the _k_ digits after the point.  For example, if _f_(_U_) is _&pi;_/5, _b_ is 10, and _k_ is 3, _pk_ is 628.
5. If _pk_ + 1 &le; _v_, return 0. If _pk_ &minus; 2 &ge; _v_, return 1.  If neither is the case, add 1 to _k_ and go to step 2.

> **Notes:** This algorithm is related to the Bernoulli factory problem, where the input probability is unknown.  However, the algorithm doesn't exactly solve that problem because it has access to the input probability's value to some extent.  Moreover, this article is focused on algorithms that don't rely on calculations of irrational numbers.  For these two reasons, this section appears in the appendix.

<a id=Ratio_of_Uniforms></a>
### Ratio of Uniforms

The Cauchy sampler given earlier demonstrates the _ratio-of-uniforms_ technique for sampling a distribution (Kinderman and Monahan 1977)[^59].  It involves transforming the distribution's probability density function (PDF) into a compact shape.

This algorithm works for every univariate (one-variable) distribution as long as&mdash;

- _PDF_(_x_) (either the distribution's PDF or a function proportional to the PDF) is continuous "almost everywhere" on its domain,
- both _PDF_(_x_) and _x_<sup>2</sup>\*_PDF_(_x_) have a maximum on that domain, and
- either&mdash;
    - the distribution's ratio-of-uniforms shape (the transformed PDF) is covered entirely by the rectangle [0, ceil(_d1_)]&times;[0, ceil(_d2_)], where _d1_ is not less than the maximum of abs(_x_)\*sqrt(_PDF_(_x_)) on its domain, and _d2_ is not less than the maximum of sqrt(_PDF_(_x_)) on its domain, or
    - half of that shape is covered this way and the shape is symmetric about the _v_-axis.

The algorithm follows.

1. Generate two empty PSRNs, with a positive sign, an integer part of 0, and an empty fractional part.  Call the PSRNs _p1_ and _p2_.
2. Set _S_ to _base_, where _base_ is the base of digits to be stored by the PSRNs (such as 2 for binary or 10 for decimal).  Then set _c1_ to an integer in the interval [0, _d1_), chosen uniformly at random, then set _c2_ to an integer in [0, _d2_), chosen uniformly at random, then set _d_ to 1.
3. Multiply _c1_ and _c2_ each by _base_ and add a digit chosen uniformly at random to that coordinate.
4. Run an **InShape** function that determines whether the transformed PDF is covered by the current box. In principle, this is the case when _z_ &le; 0 everywhere in the box, where _u_ lies in \[_c1_/_S_, (_c1_+1)/_S_\], _v_ lies in \[_c2_/_S_, (_c2_+1)/_S_\], and _z_ is _v_<sup>2</sup>&minus;_PDF_(_u_/_v_).  **InShape** returns _YES_ if the box is fully inside the transformed PDF, _NO_ if the box is fully outside it, and _MAYBE_ in any other case, or if evaluating _z_ fails for a given box (for example, because ln(0) would be calculated or _v_ is 0).  See the next section for implementation notes.
5. If **InShape** as described in step 4 returns _YES_, then do the following:
    1. Transfer _c1_'s least significant digits to _p1_'s fractional part, and transfer _c2_'s least significant digits to _p2_'s fractional part.  The variable _d_ tells how many digits to transfer to each PSRN this way.  Then set _p1_'s integer part to floor(_c1_/_base_<sup>_d_</sup>) and _p2_'s integer part to floor(_c2_/_base_<sup>_d_</sup>). (For example, if _base_ is 10, _d_ is 3, and _c1_ is 7342, set _p1_'s fractional part to \[3, 4, 2\] and _p1_'s integer part to 7.)
    2. Run the **UniformDivide** algorithm on _p1_ and _p2_, in that order.
    3. If the transformed PDF is symmetric about the _v_-axis, set the resulting PSRN's sign to positive or negative with equal probability.  Otherwise, set the PSRN's sign to positive.
    4. Return the PSRN.
6. If **InShape** as described in step 4 returns _NO_, then go to step 2.
7. Multiply _S_ by _base_, then add 1 to _d_, then go to step 3.

This algorithm appears here in the appendix rather than in the main text, because:

- Certain operations it uses can introduce numerical errors unless care is taken.  These operations can include calculating upper and lower bounds of transcendental functions which, while it's possible to achieve in rational arithmetic (Daumas et al., 2007)[^29], is less elegant than, say, the normal distribution sampler by Karney (2016)[^1], which doesn't require calculating logarithms or other transcendental functions.
- This article is focused on algorithms that don't rely on calculations of irrational numbers.

> **Note:** The ratio-of-uniforms shape is convex if and only if &minus;1/sqrt(_PDF_(_x_)) is a concave function (loosely speaking, its "slope" never increases) (Leydold 2000)[^60].
>
> **Examples:**
>
> 1. For the normal distribution, _PDF_ is proportional to exp(&minus;_x_<sup>2</sup>/2), so that _z_ after a logarithmic transformation (see next section) becomes 4\*ln(_v_) + (_u_/_v_)<sup>2</sup>, and since the distribution's ratio-of-uniforms shape is symmetric about the _v_-axis, the return value's sign is positive or negative with equal probability.
> 2. For the standard lognormal distribution ([**Gibrat's distribution**](https://mathworld.wolfram.com/GibratsDistribution.html)), _PDF_(_x_) is proportional to exp(&minus;(ln(_x_))<sup>2</sup>/2)/_x_, so that _z_ after a logarithmic transformation becomes 2\*ln(_v_)&minus;(&minus;ln(_u_/_v_)<sup>2</sup>/2 &minus; ln(_u_/_v_)), and the returned PSRN has a positive sign.
> 3. For the gamma distribution with shape parameter _a_ > 1, _PDF_(_x_) is proportional to _x_<sup>_a_&minus;1</sup>\*exp(&minus;_x_), so that _z_ after a logarithmic transformation becomes 2\*ln(_v_)&minus;(_a_&minus;1)\*ln(_u_/_v_)&minus;(_u_/_v_), or 0 if _u_ or _v_ is 0, and the returned PSRN has a positive sign.

<a id=Setting_Digits_by_Digit_Probabilities></a>
### Setting Digits by Digit Probabilities

In principle, a partially-sampled random number is possible by finding a sequence of digit probabilities and setting that number's digits according to those probabilities.  However, the uniform and exponential distributions are the only practical distributions of this kind.  Details follow.

Let _X_ be a random variate of the form `0.bbbbbbb...`, where each `b` is an independent random binary digit (0 or 1).

Let _a_<sub>_j_</sub> be the probability that the digit at position _j_ equals 1 (starting with _j_ = 1 for the first digit after the point).

Then Kakutani's theorem (Kakutani 1948\)[^61] says that _X_ has an _absolutely continuous_[^12] distribution if and only if the sum of squares of (_a_<sub>_j_</sub> &minus; 1/2) converges (so that the binary digits become less and less biased as they move farther and farther from the binary point).  See also Marsaglia (1971\)[^62], Chatterji (1964\)[^63].

This kind of absolutely continuous distribution can thus be built if we can find an infinite sequence _a_<sub>_j_</sub> that converges to 1/2, and set _X_'s binary digits using those probabilities.  However, as Marsaglia (1971\)[^62] showed, the absolutely continuous distribution can only be one of the following:

1. The distribution's probability density function (PDF) is zero somewhere in every open interval in (0, 1), without being 0 on all of [0, 1].  Thus, the PDF is not continuous.
2. The PDF is positive at 1/2, 1/4, 1/8, and so on, so the PDF is continuous and positive on all of (0, 1), and the sequence has the form&mdash;

    _a_<sub>_j_</sub> = exp(_w_/2<sup>_j_</sup>)/(1 + exp(_w_/2<sup>_j_</sup>)),

    where _w_ is a constant.
3. The PDF is not described in Case 2 above, but is positive on some open interval in (0, 1), so the PDF will be piecewise continuous, and _X_ can be multiplied by an integer power of 2 so that the new variate's distribution has a PDF described in Case 2.

As Marsaglia also showed, similar results apply when the base of the random digits is other than 2 (binary).  See also my [**Stack Exchange question**](https://math.stackexchange.com/questions/4052024/on-random-variables-made-up-of-independent-random-digits).

Case 2 has several special cases, including:

- The uniform distribution (_w_ = 0).
- The fractional part of an exponential random variate with rate 1 (_w_ = &minus;1; (Devroye and Gravel 2020\)[^3]).
- More general, the fractional part of an exponential variate with rate _&lambda;_ (_w_ = &minus;_&lambda;_).
- 1 minus the fractional part of an exponential variate with rate _w_ when _w_ > 0.
- _a_<sub>_j_</sub> = _y_<sup>_v_/2<sup>_j_</sup></sup>/(1 + _y_<sup>_v_/2<sup>_j_</sup></sup>), with _w_ = ln(_y_)\*_v_ where _y_ > 0 and _v_ are constants.

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
