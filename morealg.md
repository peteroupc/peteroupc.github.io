# More Algorithms for Arbitrary-Precision Sampling

[**Peter Occil**](mailto:poccil14@gmail.com)

**Abstract:** This page contains additional algorithms for arbitrary-precision sampling of continuous distributions, Bernoulli factory algorithms (biased-coin to biased-coin algorithms), and algorithms to simulate irrational probabilities.  They supplement my pages on Bernoulli factory algorithms and partially-sampled random numbers.

**2020 Mathematics Subject Classification:** 60-08, 60-04.

<a id=Introduction></a>
## Introduction

This page contains additional algorithms for arbitrary-precision sampling of continuous distributions, Bernoulli factory algorithms (biased-coin to biased-coin algorithms), and algorithms to simulate irrational probabilities.  These samplers are designed to not rely on floating-point arithmetic.  They may depend on algorithms given in the following pages:

* [**Partially-Sampled Random Numbers for Accurate Sampling of Continuous Distributions**](https://peteroupc.github.io/exporand.html)
* [**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)

<a id=Contents></a>
## Contents

- [**Introduction**](#Introduction)
- [**Contents**](#Contents)
- [**Bernoulli Factories and Irrational Probability Simulation**](#Bernoulli_Factories_and_Irrational_Probability_Simulation)
    - [**Certain Numbers Based on the Golden Ratio**](#Certain_Numbers_Based_on_the_Golden_Ratio)
    - [**Ratio of Lower Gamma Functions (&gamma;(_m_, _x_)/&gamma;(_m_, 1)).**](#Ratio_of_Lower_Gamma_Functions_gamma__m___x__gamma__m__1)
    - [**Derivative (slope) of arctan(_&lambda;_)**](#Derivative_slope_of_arctan___lambda)
    - [**cosh(_&lambda;_) &minus; 1**](#cosh___lambda___minus_1)
    - [**sinh(_&lambda;_)/2**](#sinh___lambda___2)
    - [**tanh(_&lambda;_)**](#tanh___lambda)
    - [**Certain Piecewise Linear Functions**](#Certain_Piecewise_Linear_Functions)
    - [**Non-Negative Factories**](#Non_Negative_Factories)
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
    - [Exponential Distribution with Unknown Rate _&lambda;_, Lying in (0, 1\]](#Exponential_Distribution_with_Unknown_Rate___lambda___Lying_in_0_1)
    - [**Exponential Distribution with Rate ln(_x_)**](#Exponential_Distribution_with_Rate_ln__x)
    - [**Lindley Distribution and Lindley-Like Mixtures**](#Lindley_Distribution_and_Lindley_Like_Mixtures)
- [**Requests and Open Questions**](#Requests_and_Open_Questions)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Ratio of Uniforms**](#Ratio_of_Uniforms)
    - [**Implementation Notes for Box/Shape Intersection**](#Implementation_Notes_for_Box_Shape_Intersection)
    - [**SymPy Code for Piecewise Linear Factory Functions**](#SymPy_Code_for_Piecewise_Linear_Factory_Functions)
    - [**Derivation of My Algorithm for min(_&lambda;_, 1/2)**](#Derivation_of_My_Algorithm_for_min___lambda___1_2)
    - [**Algorithm 2 for Non-Negative Factories**](#Algorithm_2_for_Non_Negative_Factories)
- [**License**](#License)

<a id=Bernoulli_Factories_and_Irrational_Probability_Simulation></a>
## Bernoulli Factories and Irrational Probability Simulation
&nbsp;

In the methods below, _&lambda;_ is the unknown probability of heads of the coin involved in the Bernoulli Factory problem.

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

<a id=Ratio_of_Lower_Gamma_Functions_gamma__m___x__gamma__m__1></a>
### Ratio of Lower Gamma Functions (&gamma;(_m_, _x_)/&gamma;(_m_, 1)).

1. Set _ret_ to the result of **kthsmallest** with the two parameters _m_ and _m_.  (Thus, _ret_ is distributed as _u_<sup>1/_m_</sup> where _u_ is a uniform(0, 1) random number; although **kthsmallest** accepts only integers, this formula works for any _m_ greater than 0.)
2. Set _k_ to 1, then set _u_ to point to the same value as _ret_.
3. Generate a uniform(0, 1) random number _v_.
4. If _v_ is less than _u_: Set _u_ to _v_, then add 1 to _k_, then go to step 3.
5. If _k_ is odd, return a number that is 1 if _ret_ is less than _x_ and 0 otherwise. (If _ret_ is implemented as a uniform partially-sampled random number (PSRN), this comparison should be done via **URandLessThanReal**.)  If _k_ is even, go to step 1.

Derivation:  See Formula 1 in the section "[**Probabilities Arising from Certain Permutations**](https://peteroupc.github.io/bernoulli.html#Probabilities_Arising_from_Certain_Permutations)", where:

- `ECDF(x)`  is the uniform(0,1) distribution's cumulative distribution function, namely _x_ if _x_ is in \[0, 1\], 0 if _x_ is less than 0, and 1 otherwise.
- `DPDF(x)` is the probability density function for the maximum of _m_ uniform(0,1) random numbers, namely _m_\*_x_<sup>_m_&minus;1</sup> if _x_ is in \[0, 1\], and 0 otherwise.

<a id=Derivative_slope_of_arctan___lambda></a>
### Derivative (slope) of arctan(_&lambda;_)

This algorithm involves the series expansion of this function (1 &minus; _&lambda;_<sup>2</sup> + _&lambda;_<sup>4</sup> &minus; ...) and involves the general martingale algorithm.

1. Set _u_ to 1, set _w_ to 1, set _&#x2113;_ to 0, and set _n_ to 1.
2. Generate a uniform(0, 1) random number _ret_.
3. (Loop.) If _w_ is not 0, flip the input coin and multiply _w_ by the result of the flip.  Do this step again.
4. If _n_ is even, set _u_ to _&#x2113;_ + _w_.  Otherwise, set _&#x2113;_ to _u_ &minus; _w_.
5. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  If _ret_ is less than _u_, go to the next step.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
6. Add 1 to _n_ and go to step 3.

<a id=cosh___lambda___minus_1></a>
### cosh(_&lambda;_) &minus; 1

This algorithm involves an application of the general martingale algorithm to the Taylor series for cosh(_&lambda;_)&minus;1, which is _&lambda;_<sup>2</sup>/(2!) + _&lambda;_<sup>4</sup>/(4!) + ....  See (Łatuszyński et al. 2009/2011, algorithm 3)<sup>[**(2)**](#Note2)</sup>.

1. Set _u_ to 0, set _w_ to 1, set _&#x2113;_ to 0, and set _n_ to 1.
2. Generate a uniform(0, 1) random number _ret_.
3. If _w_ is not 0, flip the input coin and multiply _w_ by the result of the flip.  Do this step again.
4. If _w_ is 0, set _u_ to _&#x2113;_ and go to step 6.  (The estimate _&lambda;_<sup>_n_\*2</sup> is 0, so no more terms are added and we use _&#x2113;_ as the final estimate for cosh(_&lambda;_)&minus;1.)
5. Let _m_ be (_n_\*2), let _&alpha;_ be 1/(_m_!) (a term of the Taylor series), and let _err_ be 2/((_m_+1)!) (the error term).  Add _&alpha;_ to _&#x2113;_, then set _u_ to _&#x2113;_ + _err_.
6. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  If _ret_ is less than _u_, go to the next step.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
7. Add 1 to _n_ and go to step 3.

In this algorithm, the error term, which follows from _Taylor's theorem_, has a numerator of 2 because 2 is higher than the maximum value that the function's slope, slope-of-slope, etc. functions can achieve anywhere in the interval [0, 1].

<a id=sinh___lambda___2></a>
### sinh(_&lambda;_)/2

This algorithm involves an application of the general martingale algorithm to the Taylor series for sinh(_&lambda;_)/2, which is _&lambda;_<sup>1</sup>/(1!\*2) + _&lambda;_<sup>3</sup>/(3!\*2) + ..., or as used here, _&lambda;_\*(1/2 + _&lambda;_<sup>2</sup>/(3!\*2) + _&lambda;_<sup>4</sup>/(5!\*2) + ...).

1. Flip the input coin.  If it returns 0, return 0.
2. Set _u_ to 0, set _w_ to 1, set _&#x2113;_ to 1/2 (the first term is added already), and set _n_ to 1.
3. Generate a uniform(0, 1) random number _ret_.
4. If _w_ is not 0, flip the input coin and multiply _w_ by the result of the flip.  Do this step again.
5. If _w_ is 0, set _u_ to _&#x2113;_ and go to step 7. (No more terms are added here.)
6. Let _m_ be (_n_\*2+1), let _&alpha;_ be 1/(_m_!\*2) (a term of the Taylor series), and let _err_ be 1/((_m_+1)!) (the error term).  Add _&alpha;_ to _&#x2113;_, then set _u_ to _&#x2113;_ + _err_.
7. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  If _ret_ is less than _u_, go to the next step.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
8. Add 1 to _n_ and go to step 4.

<a id=tanh___lambda></a>
### tanh(_&lambda;_)

There are two algorithms.

The first takes advantage of the so-called Lambert's continued fraction for tanh(.), as well as Bernoulli Factory algorithm 3 for continued fractions.  The algorithm begins with _k_ equal to 1.  Then the following steps are taken.

1. If _k_ is 1: With probability 1/2, flip the input coin and return the result.
2. If _k_ is greater than 1, then do the following with probability _k_/(1+_k_):
    - Flip the input coin twice.  If any of these flips returns 0, return 0.  Otherwise, return a number that is 1 with probability 1/_k_ and 0 otherwise.
3. Run this algorithm recursively, but with _k_ = _k_ + 2.  If the result is 1, return 0.  Otherwise, go to step 1.

The second algorithm involves an alternating series expansion of tanh(.) and involves the general martingale algorithm.

First, define the following operation:

- **Get the _m_<sup>th</sup> Bernoulli number**:
    1. If _m_ is 0, 1, 2, 3, or 4, return 1, &minus;1/2, 1/6, 0, or &minus;1/30, respectively.  Otherwise, if _m_ is odd, return 0.
    2. Set _i_ to 2 and _v_ to 1 &minus; (_m_+1)/2.
    3. While _i_ is less than _m_:
        1. **Get the _i_<sup>th</sup> Bernoulli number**, call it _b_.  Add _b_\*choose(_m_+1, _i_) to _v_.<sup>[**(3)**](#Note3)</sup>
        2. Add 2 to _i_.
    4. Return &minus;_v_/(_m_+1).

The algorithm is then as follows:

1. Flip the input coin.  If it returns 0, return 0.
2. Set _u_ to 1, set _w_ to 1, set _&#x2113;_ to 0, and set _n_ to 1.
3. Generate a uniform(0, 1) random number _ret_.
4. (Loop.) If _w_ is not 0, flip the input coin. If the flip returns 0, set _w_ to 0. Do this step again.
5. (Calculate the next term of the alternating series for tanh.) Let _m_ be 2\*(_n_+1).  **Get the _m_<sup>th</sup> Bernoulli number**, call it _b_. Let _t_ be abs(_b_)\*2<sup>_m_</sup>\*(2<sup>_m_</sup>&minus;1)/(_m_!).
6. If _n_ is even, set _u_ to _&#x2113;_ + _w_ \* _t_.  Otherwise, set _&#x2113;_ to _u_ &minus; _w_ \* _t_.
7. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  If _ret_ is less than _u_, go to the next step.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
8. Add 1 to _n_ and go to step 4.

<a id=Certain_Piecewise_Linear_Functions></a>
### Certain Piecewise Linear Functions

Let _f_(_&lambda;_) be a function of the form min(_&lambda;_\*_mult_, 1&minus;_&epsilon;_). (This is a piecewise linear function with two pieces: a rising linear part and a constant part.) This section describes how to calculate the Bernstein coefficients for polynomials that converge from above and below to _f_, based on Thomas and Blanchet (2012)<sup>[**(4)**](#Note4)</sup>.  These polynomials can then be used to generate heads with probability _f_(_&lambda;_) using the algorithms given in "[**General Factory Functions**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions)".  In this section, **fbelow(_n_, _k_)** and **fabove(_n_, _k_)** are the _k_<sup>th</sup> Bernstein coefficients (with _k_ starting at 0) of the lower and upper polynomials, respectively, of degree _n_.

The code in the [**appendix**](#Appendix) uses the computer algebra library SymPy to calculate a list of parameters for a sequence of polynomials converging from above.  The method to do so is called `calc_linear_func(eps, mult, count)`, where `eps` is _&epsilon;_, `mult` = _mult_, and `count` is the number of polynomials to generate.  Each item returned by `calc_linear_func` is a list of two items: the degree of the polynomial, and a _Y parameter_.  The procedure to calculate the required polynomials is then logically as follows (as written, it runs very slowly, though):

1. Set _i_ to 1.
2. Run `calc_linear_func(eps, mult, i)` and get the degree and _Y parameter_ for the last listed item, call them _n_ and _y_, respectively.
3. Set _x_ to &minus;((_y_&minus;(1&minus;_&epsilon;_))/_&epsilon;_)<sup>5</sup>/_mult_ + _y_/_mult_.  (This exact formula doesn't appear in the Thomas and Blanchet paper; rather it comes from the [**supplemental source code**](https://github.com/acthomasca/rberfac/blob/main/rberfac-public-2.R) uploaded by A. C. Thomas at my request.
4. For degree _n_, **fbelow(_n_, _k_)** is min((_k_/_n_)\*_mult_, 1&minus;_&epsilon;_), and **fabove(_n_, _k_)** is min((_k_/_n_)\*_y_/_x_,_y_).  (**fbelow** matches _f_ because _f_ is _concave_ in the interval [0, 1], which roughly means that its rate of growth there never goes up.)
5. Add 1 to _i_ and go to step 2.

It would be interesting to find general formulas to find the appropriate polynomials (degrees and _Y parameters_) given only the values for _mult_ and _&epsilon;_, rather than find them "the hard way" via `calc_linear_func`.  For this procedure, the degrees and _Y parameters_ can be upper bounds, as long as the sequence of degrees is monotonically increasing and the sequence of Y parameters is nonincreasing.

> **Note:** In Nacu and Peres (2005)<sup>[**(5)**](#Note5)</sup>, the following polynomial sequences were suggested to simulate min(_&lambda;_\*2, 1 &minus; 2\*_&epsilon;_), provided _&epsilon;_ &lt; 1/8, where _n_ is a power of 2.  However, with these sequences, an extraordinary number of input coin flips is required to simulate this function each time.
>
> - **fbelow(_n_, _k_)** = min((_k_/_n_)\*2, 1 &minus; 2\*_&epsilon;_).
> - **fabove(_n_, _k_)** = min((_k_/_n_)\*2, 1 &minus; 2\*_&epsilon;_) +<br>(max(0, _k_/_n_+3\*_&epsilon; &minus;_ 1/2)/(_&epsilon;_/(1&minus;sqrt(2)/2)))\*sqrt(2/_n_) +<br>(72\*max(0, _k_/_n_&minus;1/9)/(1&minus;exp(&minus;2\*_&epsilon;_\*_&epsilon;_)))\*exp(&minus;2\*_&epsilon;_\*_&epsilon;_\*_n_).

My own algorithm for min(_&lambda;_, 1/2) is as follows.  See the [**appendix**](https://peteroupc.github.io/morealg.html#Derivation_of_My_Algorithm_for_min___lambda___1_2) for the derivation of this algorithm.

1. With probability 1/2, flip the input coin and return the result.
2. (Random walk.) Generate unbiased random bits until more zeros than ones are generated this way for the first time.  Then set _m_ to (_n_&minus;1)/2+1, where _n_ is the number of bits generated this way.
3. (Build a degree-_m_\*2 polynomial equivalent to (4\*_&lambda;_\*(1&minus;_&lambda;_))<sup>_m_</sup>/2.) Let _z_ be (4<sup>_m_</sup>/2)/choose(_m_\*2,_m_).  Define a polynomial of degree _m_\*2 whose (_m_\*2)+1 Bernstein coefficients are all zero except the _m_<sup>th</sup> coefficient (starting at 0), whose value is _z_.  Elevate the degree of this polynomial enough times so that all its coefficients are 1 or less (degree elevation increases the polynomial's degree without changing its shape or position; see the derivation in the appendix).  Let _d_ be the new polynomial's degree.
4. (Simulate the polynomial, whose degree is _d_ (Goyal and Sigman 2012)<sup>[**(6)**](#Note6)</sup>.) Flip the input coin _d_ times and set _h_ to the number of ones generated this way.  Let _a_ be the _h_<sup>th</sup> Bernstein coefficient (starting at 0) of the new polynomial.  With probability _a_, return 1.  Otherwise, return 0.

I suspected that the required degree _d_ would be floor(_m_\*2/3)+1, as described in the appendix.  With help from the [**MathOverflow community**](https://mathoverflow.net/questions/381419), steps 3 and 4 of the algorithm can be described more efficiently as follows:

- (3.) Let _r_ be floor(_m_\*2/3)+1, and let _d_ be _m_\*2+_r_.
- (4.) (Simulate the polynomial, whose degree is _d_.) Flip the input coin _d_ times and set _h_ to the number of ones generated this way.  Let _a_ be (1/2) \* 2<sup>_m_\*2</sup>\*choose(_r_,_h_&minus;_m_)/choose(_d_, _h_) (the polynomial's _h_<sup>th</sup> Bernstein coefficient starting at 0; the first term is 1/2 because the polynomial being simulated has the value 1/2 at the point 1/2).  With probability _a_, return 1.  Otherwise, return 0.

<a id=Non_Negative_Factories></a>
### Non-Negative Factories

The Bernoulli factory approach can be extended in two ways to produce random numbers beyond the interval [0, 1].  Both algorithms use a different _oracle_ (black box) from coins that output heads or tails.

**Algorithm 1.** Say we have an oracle that produces random numbers in the interval \[_a_, _b_\], and these numbers have an unknown mean of _&mu;_. The goal is now to produce non-negative random numbers that average to _f_(_&mu;_).  This is possible if and only if _f_, in the interval \[_a_, _b_\]&mdash;

- is continuous everywhere,
- is bounded from above, and
- returns 0 everywhere or returns a value 0 or greater at each of the points _a_ and _b_ and a value greater than 0 at each other point

(Jacob and Thiery 2015)<sup>[**(7)**](#Note7)</sup>. (Here, _a_ and _b_ are both rational numbers and may be less than 0.)

In the algorithm below, let _&kappa;_ be greater than the maximum value of _f_ in the interval [_a_, _b_], and let _g_(_&lambda;_) = _f_(_a_ + (_b_&minus;_a_)\*_&lambda;_)/_&kappa;_.

1. Create a _&lambda;_ input coin that does the following: "Generate a random number from the oracle, call it _x_.  With probability (_x_&minus;_a_)/(_b_&minus;_a_) (see note below), return 1.  Otherwise, return 0."
2. Run a Bernoulli factory algorithm for _g_(_&lambda;_), using the _&lambda;_ input coin.  Then return _&kappa;_ times the result.

> **Note:** The check "With probability (_x_&minus;_a_)/(_b_&minus;_a_)" is exact if the oracle produces only rational numbers.  If the oracle can produce irrational numbers (such as numbers that follow a beta distribution or another continuous distribution), then the code for the oracle should use uniform [**partially-sampled random numbers (PSRNs)**](https://peteroupc.github.io/exporand.html).  In that case, the check can be implemented as follows.  Let _x_ be a uniform PSRN representing a number generated by the oracle.  Set _y_ to **RandUniformFromReal**(_b_&minus;_a_), then the check succeeds if **URandLess**(_y_, **UniformAddRational**(_x_, &minus;_a_)) returns 1, and fails otherwise.
>
> **Example:** Suppose an oracle produces random numbers in the interval [3, 13] with mean _&mu;_, and we seek to use the oracle to produce non-negative random numbers with mean _f_(_&mu;_) = &minus;319/100 + _&mu;_\*103/50 &minus; _&mu;_<sup>2</sup>*11/100, which is a polynomial with Bernstein coefficients [2, 9, 5] in the given interval.  Then since 8 is greater than the maximum of _f_ in that interval, _g_(_&lambda;_) is a degree-2 polynomial with Bernstein coefficients [2/8, 9/8, 5/8] in the interval [0, 1].  _g_ can't be simulated as is, though, but by increasing _g_'s degree to 3 we get the Bernstein coefficients [1/4, 5/6, 23/24, 5/8], which are all less than 1 so we can proceed with the following algorithm (see "[**Certain Polynomials in Bernstein Form**](https://peteroupc.github.io/bernoulli.html#Certain_Polynomials_in_Bernstein_Form)"):
>
> 1. Set _heads_ to 0.
> 2. Generate three random numbers from the oracle (which must produce random numbers in the interval [3, 13]).  For each number _x_: With probability (_x_&minus;3)/(10&minus;3), add 1 to _heads_.
> 3. Depending on _heads_, return 8 (that is, 1 times the upper bound) with the given probability, or 0 otherwise: _heads_=0 &rarr; probability 1/4; 1 &rarr; 5/6; 2 &rarr; 23/24; 3 &rarr; 5/8.

**Algorithm 2.** This algorithm takes an oracle and produces non-negative random numbers that average to the mean of _f_(_X_), where _X_ is a number produced by the oracle.  The algorithm appears in the appendix, however, because it requires applying an arbitrary function (here, _f_) to a potentially irrational number.

<a id=General_Arbitrary_Precision_Samplers></a>
## General Arbitrary-Precision Samplers

&nbsp;

<a id=Uniform_Distribution_Inside_N_Dimensional_Shapes></a>
### Uniform Distribution Inside N-Dimensional Shapes

The following is a general way to describe an arbitrary-precision sampler for generating a point uniformly at random inside a geometric shape located entirely in the hypercube [0, _d1_]&times;[0, _d2_]&times;...&times;[0,_dN_] in _N_-dimensional space, where _d1_, ..., _dN_ are integers greater than 0. The algorithm will generally work if the shape is reasonably defined; the technical requirements are that the shape must have a zero-volume boundary and a nonzero finite volume, and must assign zero probability to any zero-volume subset of it (such as a set of individual points).

The sampler's description has the following skeleton.

1. Generate _N_ empty uniform partially-sampled random numbers (PSRNs), with a positive sign, an integer part of 0, and an empty fractional part.  Call the PSRNs _p1_, _p2_, ..., _pN_.
2. Set _S_ to _base_, where _base_ is the base of digits to be stored by the PSRNs (such as 2 for binary or 10 for decimal).  Then set _N_ coordinates to 0, call the coordinates _c1_, _c2_, ..., _cN_.  Then set _d_ to 1.  Then, for each coordinate (_c1_, ..., _cN_), set that coordinate to an integer in [0, _dX_), chosen uniformly at random, where _dX_ is the corresponding dimension's size.
3. For each coordinate (_c1_, ..., _cN_), multiply that coordinate by _base_ and add a digit chosen uniformly at random to that coordinate.
4. This step uses a function known as **InShape**, which takes the coordinates of a box and returns one of three values: _YES_ if the box is entirely inside the shape; _NO_ if the box is entirely outside the shape; and _MAYBE_ if the box is partly inside and partly outside the shape, or if the function is unsure.  **InShape**, as well as the divisions of the coordinates by _S_, should be implemented using rational arithmetic.  Instead of dividing those coordinates this way, an implementation can pass _S_ as a separate parameter to **InShape**.  See the [**appendix**](#Implementation_Notes_for_Box_Shape_Intersection) for further implementation notes.  In this step, run **InShape** using the current box, whose coordinates in this case are ((_c1_/_S_, _c2_/_S_, ..., _cN_/_S_), ((_c1_+1)/_S_, (_c2_+1)/_S_, ..., (_cN_+1)/_S_)).
5. If the result of **InShape** is _YES_, then the current box was accepted.  If the box is accepted this way, then at this point, _c1_, _c2_, etc., will each store the _d_ digits of a coordinate in the shape, expressed as a number in the interval \[0, 1\], or more precisely, a range of numbers.  (For example, if _base_ is 10, _d_ is 3, and _c1_ is 342, then the first coordinate is 0.342, or more precisely, a number in the interval \[0.342, 0.343\].)  In this case, do the following:
    1. For each coordinate (_c1_, ..., _cN_), transfer that coordinate's least significant digits to the corresponding PSRN's fractional part.  The variable _d_ tells how many digits to transfer to each PSRN this way. Then, for each coordinate (_c1_, ..., _cN_), set the corresponding PSRN's integer part to floor(_cX_/_base_<sup>_d_</sup>), where _cX_ is that coordinate.  (For example, if _base_ is 10, _d_ is 3, and _c1_ is 7342, set _p1_'s fractional part to \[3, 4, 2\] and _p1_'s integer part to 7.)
    2. For each PSRN (_p1_, ..., _pN_), optionally fill that PSRN with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**).
    3. For each PSRN, optionally do the following: With probability 1/2, set that PSRN's sign to negative. (This will result in a symmetric shape in the corresponding dimension.  This step can be done for some PSRNs and not others.)
    4. Return the PSRNs _p1_, ..., _pN_, in that order.
6. If the result of **InShape** is _NO_, then the current box lies outside the shape and is rejected.  In this case, go to step 2.
7. If the result of **InShape** is _MAYBE_, it is not known whether the current box lies fully inside the shape, so multiply _S_ by _base_, then add 1 to _d_, then go to step 3.

> **Notes:**
>
> - See (Li and El Gamal 2016)<sup>[**(8)**](#Note8)</sup> and (Oberhoff 2018)<sup>[**(9)**](#Note9)</sup> for related work on encoding random points uniformly distributed in a shape.
> - Rejection sampling on a shape is subject to the "curse of dimensionality", since typical shapes of high dimension will tend to cover much less volume than their bounding boxes, so that it would take a lot of time on average to accept a high-dimensional box.  Moreover, the more area the shape takes up in the bounding box, the higher the acceptance rate.
> - Devroye (1986, chapter 8, section 3)<sup>[**(10)**](#Note10)</sup> describes grid-based methods to optimize random point generation.  In this case, the space is divided into a grid of boxes each with size 1/_base_<sup>_k_</sup> in all dimensions; the result of **InShape** is calculated for each such box and that box labeled with the result; all boxes labeled _NO_ are discarded; and the algorithm is modified by adding the following after step 2: "2a. Choose a precalculated box uniformly at random, then set _c1_, ..., _cN_ to that box's coordinates, then set _d_ to _k_ and set _S_ to _base_<sup>_k_</sup>. If a box labeled _YES_ was chosen, follow the substeps in step 5. If a box labeled _MAYBE_ was chosen, multiply _S_ by _base_ and add 1 to _d_." (For example, if _base_ is 10, _k_ is 1, _N_ is 2, and _d1_ = _d2_ = 1, the space could be divided into a 10&times;10 grid, made up of 100 boxes each of size (1/10)&times;(1/10).  Then, **InShape** is precalculated for the box with coordinates ((0, 0), (1, 1)), the box ((0, 1), (1, 2)), and so on \[the boxes' coordinates are stored as just given, but **InShape** instead uses those coordinates divided by _base_<sup>_k_</sup>, or 10<sup>1</sup> in this case\], each such box is labeled with the result, and boxes labeled _NO_ are discarded.  Finally the algorithm above is modified as just given.)
> - Besides a grid, another useful data structure is a _mapped regular paving_ (Harlow et al. 2012)<sup>[**(11)**](#Note11)</sup>, which can be described as a binary tree with nodes each consisting of zero or two child nodes and a marking value.  Start with a box that entirely covers the desired shape.  Calculate **InShape** for the box.  If it returns _YES_ or _NO_ then mark the box with _YES_ or _NO_, respectively; otherwise it returns _MAYBE_, so divide the box along its first widest coordinate into two sub-boxes, set the parent box's children to those sub-boxes, then repeat this process for each sub-box (or if the nesting level is too deep, instead mark each sub-box with _MAYBE_).  Then, to generate a random point (with a base-2 fractional part), start from the root, then: (1) If the box is marked _YES_, return a uniform random point between the given coordinates using the **RandUniformInRange** algorithm; or (2) if the box is marked _NO_, start over from the root; or (3) if the box is marked _MAYBE_, get the two child boxes bisected from the box, choose one of them with equal probability (e.g., choose the left child if an unbiased random bit is 0, or the right child otherwise), mark the chosen child with the result of **InShape** for that child, and repeat this process with that child; or (4) the box has two child boxes, so choose one of them with equal probability and repeat this process with that child.
>
> **Examples:**
>
> - The following example generates a point inside a quarter diamond (centered at (0, ..., 0), "radius" _k_ where _k_ is an integer greater than 0): Let _d1_, ..., _dN_ be _k_. Let **InShape** return _YES_ if ((_c1_+1) + ... + (_cN_+1)) < _S_\*_k_; _NO_ if (_c1_ + ... + _cN_) > _S_\*_k_; and _MAYBE_ otherwise.  For a full diamond, step 5.3 in the algorithm is done for all _N_ dimensions.
> - The following example generates a point inside a quarter hypersphere (centered at (0, ..., 0), radius _k_ where _k_ is an integer greater than 0): Let _d1_, ..., _dN_ be _k_. Let **InShape** return _YES_ if ((_c1_+1)<sup>2</sup> + ... + (_cN_+1)<sup>2</sup>) < (_S_\*_k_)<sup>2</sup>; _NO_ if (_c1_<sup>2</sup> + ... + _cN_<sup>2</sup>) > (_S_\*_k_)<sup>2</sup>; and _MAYBE_ otherwise.  For a full hypersphere with radius 1, step 5.3 in the algorithm is done for all _N_ dimensions.  In the case of a 2-dimensional circle, this algorithm thus adapts the well-known rejection technique of generating X and Y coordinates until X<sup>2</sup>+Y<sup>2</sup> < 1 (e.g., (Devroye 1986, p. 230 et seq.)<sup>[**(10)**](#Note10)</sup>).
> - The following example generates a point inside a quarter _astroid_ (centered at (0, ..., 0), radius _k_ where _k_ is an integer greater than 0): Let _d1_, ..., _dN_ be _k_. Let **InShape** return _YES_ if ((_sk_&minus;_c1_&minus;1)<sup>2</sup> + ... + (_sk_&minus;_cN_&minus;1)<sup>2</sup>) > _sk_<sup>2</sup>; _NO_ if ((_sk_&minus;_c1_)<sup>2</sup> + ... + (_sk_&minus;_cN_)<sup>2</sup>) < _sk_<sup>2</sup>; and _MAYBE_ otherwise, where _sk_ = _S_\*_k_.  For a full astroid, step 5.3 in the algorithm is done for all _N_ dimensions.

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

> **Note:** The algorithm skeleton uses ideas similar to the inversion-rejection method described in (Devroye 1986, ch. 7, sec. 4.6)<sup>[**(10)**](#Note10)</sup>; an exception is that instead of generating a uniform random number and comparing it to calculations of a CDF, this algorithm uses conditional probabilities of choosing a given piece, probabilities labeled _A_ and _B_.  This approach was taken so that the CDF of the distribution in question is never directly calculated in the course of the algorithm, which furthers the goal of sampling with arbitrary precision and without using floating-point arithmetic.

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
5. (At this point, we simulate exp(&minus;_U_<sup>2</sup>/_y_), exp(&minus;_k_<sup>2</sup>/_y_) , exp(&minus;_U_\*_k_\*2/_y_), as well as a scaled-down version of _U_ + _k_, where _U_ is the number built up by the uniform PSRN.) Call the **exp(&minus;_x_/_y_) algorithm** with _x_/_y_ = _ky_, then call the **exp(&minus;(_&lambda;_<sup>_k_</sup> * _x_)) algorithm** using the input coin from step 2, _x_ = 1/_y_, and _k_ = 2, then call the **exp(&minus;(_&lambda;_<sup>_k_</sup> \* (_x_+_m_)))** algorithm using the same input coin, _x_+_m_ = floor(_k_ * 2 / _y_), and _k_ = 1, then call the **sub-algorithm** given later with the uniform PSRN and _k_ = _k_.  If all of these calls return 1, the uniform PSRN was accepted.  Otherwise, remove all digits from the uniform PSRN's fractional part and go to step 4.
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

The following algorithm adapts the rejection algorithm from p. 472 in (Devroye 1986)<sup>[**(10)**](#Note10)</sup> for arbitrary-precision sampling.

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

Here we reimplement an example from Devroye's book _Non-Uniform Random Variate Generation_ (Devroye 1986, pp. 128&ndash;129)<sup>[**(10)**](#Note10)</sup>.  The following arbitrary-precision sampler generates a random number from a distribution with the following cumulative distribution function (CDF): `1 - cos(pi*x/2).`  The random number will be in the interval [0, 1].  Note that the result is the same as applying acos(_U_)*2/&pi;, where _U_ is a uniform \[0, 1\] random number, as pointed out by Devroye.  The algorithm follows.

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

<a id=Exponential_Distribution_with_Unknown_Rate___lambda___Lying_in_0_1></a>
### Exponential Distribution with Unknown Rate _&lambda;_, Lying in (0, 1]

Exponential random numbers can be generated using an input coin of unknown probability of heads of _&lambda;_ (which can be in the interval (0, 1]), by generating arrival times in a _Poisson process_ of rate 1, then _thinning_ the process using the coin.  The arrival times that result will be exponentially distributed with rate _&lambda;_.  This is shown, for example, in a [**Mathematics Stack Exchange question**](https://math.stackexchange.com/questions/3362473/simulating-an-exponential-random-variable-given-bernoulli-uniform), and thinning of Poisson processes is discussed, for example, in Devroye (1986, chapter six)<sup>[**(10)**](#Note10)</sup>.  The algorithm follows:

1. Generate an exponential(1) random number using the **ExpRand** or **ExpRand2** algorithm (with _&lambda;_ = 1), call it _ex_.
2. (Thinning step.) Flip the input coin.  If it returns 1, return _ex_.
3. Generate another exponential(1) random number using the **ExpRand** or **ExpRand2** algorithm (with _&lambda;_ = 1), call it _ex2_.  Then run **UniformAdd** on _ex_ and _ex2_ and set _ex_ to the result.  Then go to step 2.

Notice that the algorithm's average running time increases as _&lambda;_ decreases.

<a id=Exponential_Distribution_with_Rate_ln__x></a>
### Exponential Distribution with Rate ln(_x_)

The following new algorithm generates a partially-sampled random number that follows the exponential distribution with rate ln(_x_).  This is useful for generating a base-_x_ logarithm of a uniform(0,1) random number.  Here, _x_ is a rational number that's greater than 1.  In the algorithm, let _b_ be floor(ln(_x_)/ln(2)).

1. (Samples the integer part of the random number.) Generate a random number that expresses the number of failed trials before the first success, where each trial succeeds with probability 1&minus;1/_x_.  Set _k_ to that random number.  (This is also known as a "geometric random number", but this terminology is avoided because it has conflicting meanings in academic works.  If _x_ is a power of 2, this step can be implemented by generating blocks of _b_ unbiased random bits until a **non-zero** block of bits is generated this way, then setting _k_ to the number of **all-zero** blocks of bits generated this way.)
2. (The rest of the algorithm samples the fractional part.) Generate a uniform (0, 1) random number, call it _f_.
3. Create a _&mu;_ input coin that does the following: "**Sample from the number _f_** (e.g., call **SampleGeometricBag** on _f_ if _f_ is implemented as a uniform PSRN), then run the **algorithm for ln(2)** (described in "Bernoulli Factory Algorithms").  If both calls return 1, return 1.  Otherwise, return 0." (This simulates the probability _&lambda;_ = _f_\*ln(2).)    If _x_ is not a power of 2, also create a _&nu;_ input coin that does the following: "**Sample from the number _f_**, then run the **algorithm for ln(1 + _y_/_z_)** (described in "Bernoulli Factory Algorithms") with _y_/_z_ = (_x_&minus;2<sup>_b_</sup>)/2<sup>_b_</sup>.  If both calls return 1, return 1.  Otherwise, return 0."
4. Run the **algorithm for exp(&minus;_&lambda;_)** (described in "Bernoulli Factory Algorithms") _b_ times, using the _&mu;_ input coin.  If _x_ is not a power of 2, run the same algorithm once, using the _&nu;_ input coin.  If all these calls return 1, accept _f_.  If _f_ is accepted this way, set _f_'s integer part to _k_, then optionally fill _f_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _f_.
5. If _f_ was not accepted by the previous step, go to step 2.

> **Note**: A _bounded exponential_ random number with rate ln(_x_) and bounded by _m_ has a similar algorithm to this one.  Step 1 is changed to read as follows: "Set _k_ to a bounded-geometric(1&minus;1/_x_, _m_) random number (Bringmann and Friedrich 2013)<sup>[**(12)**](#Note12)</sup>, or more simply, the lesser of _m_ or the number of failed trials before the first success, where each trial succeeds with probability 1&minus;1/_x_. (If _x_ is a power of 2, this can be implemented by generating blocks of _b_ unbiased random bits until a **non-zero** block of bits or _m_ blocks of bits are generated this way, whichever comes first, then setting _k_ to the number of **all-zero** blocks of bits generated this way.) If _k_ is _m_, return _m_ (note that this _m_ is a constant, not a uniform PSRN; if the algorithm would otherwise return a uniform PSRN, it can return something else in order to distinguish this constant from a uniform PSRN)."  Additionally, instead of generating a uniform(0,1) random number in step 2, a uniform(0,_&mu;_) random number can be generated instead, such as a uniform PSRN generated via **RandUniformFromReal**, to implement an exponential distribution bounded by _m_+_&mu;_ (where _&mu;_ is a real number in the interval (0, 1)).

The following generator for the **rate ln(2)** is a special case of the previous algorithm and is useful for generating a base-2 logarithm of a uniform(0,1) random number. Unlike the similar algorithm of Ahrens and Dieter (1972)<sup>[**(13)**](#Note13)</sup>, this one doesn't require a table of probability values.

1. (Samples the integer part of the random number.  This will be geometrically distributed with parameter 1/2.) Generate unbiased random bits until a zero is generated this way.  Set _k_ to the number of ones generated this way.
2. (The rest of the algorithm samples the fractional part.) Generate a uniform (0, 1) random number, call it _f_.
3. Create an input coin that does the following: "**Sample from the number _f_** (e.g., call **SampleGeometricBag** on _f_ if _f_ is implemented as a uniform PSRN), then run the **algorithm for ln(2)** (described in "Bernoulli Factory Algorithms").  If both calls return 1, return 1.  Otherwise, return 0." (This simulates the probability _&lambda;_ = _f_\*ln(2).)
4. Run the **algorithm for exp(&minus;_&lambda;_)** (described in "Bernoulli Factory Algorithms"), using the input coin from the previous step.  If the call returns 1, accept _f_.  If _f_ is accepted this way, set _f_'s integer part to _k_, then optionally fill _f_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _f_.
5. If _f_ was not accepted by the previous step, go to step 2.

<a id=Lindley_Distribution_and_Lindley_Like_Mixtures></a>
### Lindley Distribution and Lindley-Like Mixtures

A random number that follows the Lindley distribution (Lindley 1958)<sup>[**(14)**](#Note14)</sup> with parameter _&theta;_ (a rational number greater than 0) can be generated as follows:

1. With probability _w_ = _&theta;_/(1+_&theta;_), generate an exponential random number with a rate of _&theta;_ via **ExpRand** or **ExpRand2** (described in my article on PSRNs) and return that number.
2. Otherwise, generate two exponential random numbers with a rate of _&theta;_ via **ExpRand** or **ExpRand2**, then generate their sum by applying the **UniformAdd** algorithm, then return that sum.

For the Garima distribution (Shanker 2016)<sup>[**(15)**](#Note15)</sup>, _w_ = (1+_&theta;_)/(2+_&theta;_).

For the i-Garima distribution (Singh and Das 2020)<sup>[**(16)**](#Note16)</sup>, _w_ = (2+_&theta;_)/(3+_&theta;_).

For the mixture-of-weighted-exponential-and-weighted-gamma distribution in (Iqbal and Iqbal 2020)<sup>[**(17)**](#Note17)</sup>, two exponential random numbers (rather than one) are generated in step 1, and three (rather than two) are generated in step 2.

<a id=Requests_and_Open_Questions></a>
## Requests and Open Questions

1. We would like to see new implementations of the following:
    - Algorithms that implement **InShape** for specific closed curves, specific closed surfaces, and specific signed distance functions.  Recall that **InShape** determines whether a box lies inside, outside, or partly inside or outside a given curve or surface.
    - Descriptions of new arbitrary-precision algorithms that use the skeleton given in the section "Building an Arbitrary-Precision Sampler".
2. The appendix contains implementation notes for **InShape**, which determines whether a box is outside or partially or fully inside a shape.  However, practical implementations of **InShape** will generally only be able to evaluate a shape pointwise.  What are necessary and/or sufficient conditions that allow an implementation to correctly classify a box just by evaluating the shape pointwise?
3. Take a polynomial _f_(_&lambda;_) of even degree _n_ of the form choose(_n_,_n_/2)\*_&lambda;_<sup>_n_/2</sup>\*(1&minus;_&lambda;_)<sup>_n_/2</sup>\*_k_, where _k_ is greater than 1 (thus all _f_'s Bernstein coefficients are 0 except for the middle one, which equals _k_).  Suppose _f_(1/2) lies in the interval (0, 1).  If we do the degree elevation, described in the appendix, enough times (at least _r_ times), then _f_'s Bernstein coefficients will all lie in [0, 1].  The question is: how many degree elevations are enough?  A [**MathOverflow answer**](https://mathoverflow.net/questions/381419/on-the-degree-elevation-needed-to-bring-bernstein-coefficients-to-0-1) showed that _r_ is at least _m_ = (_n_/_f_(1/2)<sup>2</sup>)/(1&minus;_f_(1/2)<sup>2</sup>), but is it true that floor(_m_)+1 elevations are enough?

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Fishman, D., Miller, S.J., "Closed Form Continued Fraction Expansions of Special Quadratic Irrationals", ISRN Combinatorics Vol. 2013, Article ID 414623 (2013).</small>
- <small><sup id=Note2>(2)</sup> Łatuszyński, K., Kosmidis, I.,  Papaspiliopoulos, O., Roberts, G.O., "[**Simulating events of unknown probabilities via reverse time martingales**](https://arxiv.org/abs/0907.4018v2)", arXiv:0907.4018v2 [stat.CO], 2009/2011.</small>
- <small><sup id=Note3>(3)</sup> choose(_n_, _k_) = _n_!/(_k_! * (_n_ &minus; _k_)!) is a binomial coefficient.  It can be calculated, for example, by calculating _i_/(_n_&minus;_i_+1) for each integer _i_ in the interval \[_n_&minus;_k_+1, _n_\], then multiplying the results (Yannis Manolopoulos. 2002. "[**Binomial coefficient computation: recursion or iteration?**](https://doi.org/10.1145/820127.820168)", SIGCSE Bull. 34, 4 (December 2002), 65–67).  Note that for all _m_&gt;0, choose(_m_, 0) = choose(_m_, _m_) = 1 and choose(_m_, 1) = choose(_m_, _m_&minus;1) = _m_; also, in this document, choose(_n_, _k_) is 0 when _k_ is less than 0 or greater than _n_.</small>
- <small><sup id=Note4>(4)</sup> Thomas, A.C., Blanchet, J., "[**A Practical Implementation of the Bernoulli Factory**](https://arxiv.org/abs/1106.2508v3)", arXiv:1106.2508v3  [stat.AP], 2012.</small>
- <small><sup id=Note5>(5)</sup> Nacu, Şerban, and Yuval Peres. "[**Fast simulation of new coins from old**](https://projecteuclid.org/euclid.aoap/1106922322)", The Annals of Applied Probability 15, no. 1A (2005): 93-115.</small>
- <small><sup id=Note6>(6)</sup> Goyal, V. and Sigman, K., 2012. On simulating a class of Bernstein polynomials. ACM Transactions on Modeling and Computer Simulation (TOMACS), 22(2), pp.1-5.</small>
- <small><sup id=Note7>(7)</sup> Jacob, P.E., Thiery, A.H., "On nonnegative unbiased estimators", Ann. Statist., Volume 43, Number 2 (2015), 769-784.</small>
- <small><sup id=Note8>(8)</sup> C.T. Li, A. El Gamal, "[**A Universal Coding Scheme for Remote Generation of Continuous Random Variables**](https://arxiv.org/abs/1603.05238v1)", arXiv:1603.05238v1  [cs.IT], 2016</small>
- <small><sup id=Note9>(9)</sup> Oberhoff, Sebastian, "[**Exact Sampling and Prefix Distributions**](https://dc.uwm.edu/etd/1888)", _Theses and Dissertations_, University of Wisconsin Milwaukee, 2018.</small>
- <small><sup id=Note10>(10)</sup> Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.</small>
- <small><sup id=Note11>(11)</sup> Harlow, J., Sainudiin, R., Tucker, W., "Mapped Regular Pavings", _Reliable Computing_ 16 (2012).</small>
- <small><sup id=Note12>(12)</sup> Bringmann, K. and Friedrich, T., 2013, July. "Exact and efficient generation of geometric random variates and random graphs", in _International Colloquium on Automata, Languages, and Programming_ (pp. 267-278).</small>
- <small><sup id=Note13>(13)</sup> Ahrens, J.H., and Dieter, U., "Computer methods from sampling from the exponential and normal distributions", _Communications of the ACM_ 15, 1972.</small>
- <small><sup id=Note14>(14)</sup> Lindley, D.V., "Fiducial distributions and Bayes' theorem", _Journal of the Royal Statistical Society Series B_, 1958.</small>
- <small><sup id=Note15>(15)</sup> Shanker, R., "Garima distribution and its application to model behavioral science data", _Biom Biostat Int J._ 4(7), 2016.</small>
- <small><sup id=Note16>(16)</sup> Singh, B.P., Das, U.D., "[**On an Induced Distribution and its Statistical Properties**](https://arxiv.org/abs/2010.15078)", arXiv:2010.15078 [stat.ME], 2020.</small>
- <small><sup id=Note17>(17)</sup> Iqbal, T. and Iqbal, M.Z., 2020. On the Mixture Of Weighted Exponential and Weighted Gamma Distribution. International Journal of Analysis and Applications, 18(3), pp.396-408.</small>
- <small><sup id=Note18>(18)</sup> Kinderman, A.J., Monahan, J.F., "Computer generation of random variables using the ratio of uniform deviates", _ACM Transactions on Mathematical Software_ 3(3), pp. 257-260, 1977.</small>
- <small><sup id=Note19>(19)</sup> Daumas, M., Lester, D., Muñoz, C., "[**Verified Real Number Calculations: A Library for Interval Arithmetic**](https://arxiv.org/abs/0708.3721)", arXiv:0708.3721 [cs.MS], 2007.</small>
- <small><sup id=Note20>(20)</sup> Karney, C.F.F., "[**Sampling exactly from the normal distribution**](https://arxiv.org/abs/1303.6257v2)", arXiv:1303.6257v2  [physics.comp-ph], 2014.</small>
- <small><sup id=Note21>(21)</sup> I thank D. Eisenstat from the _Stack Overflow_ community for leading me to this insight.</small>
- <small><sup id=Note22>(22)</sup> Wästlund, J., "[**Functions arising by coin flipping**](http://www.math.chalmers.se/~wastlund/coinFlip.pdf)", 1999.</small>
- <small><sup id=Note23>(23)</sup> Dale, H., Jennings, D. and Rudolph, T., 2015, "Provable quantum advantage in randomness processing", _Nature communications_ 6(1), pp. 1-4.</small>
- <small><sup id=Note24>(24)</sup> Tsai, Yi-Feng, Farouki, R.T., "Algorithm 812: BPOLY: An Object-Oriented Library of Numerical Algorithms for Polynomials in Bernstein Form", _ACM Trans. Math. Softw._ 27(2), 2001.</small>
- <small><sup id=Note25>(25)</sup> Lee, A., Doucet, A. and Łatuszyński, K., 2014. "[**Perfect simulation using atomic regeneration with application to Sequential Monte Carlo**](https://arxiv.org/abs/1407.5770v1)", arXiv:1407.5770v1  [stat.CO].</small>

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Ratio_of_Uniforms></a>
### Ratio of Uniforms

The Cauchy sampler given earlier demonstrates the _ratio-of-uniforms_ technique for sampling a distribution (Kinderman and Monahan 1977)<sup>[**(18)**](#Note18)</sup>.  It involves transforming the distribution's density function (PDF) into a compact shape.  The ratio-of-uniforms method appears here in the appendix, particularly since it can involve calculating upper and lower bounds of transcendental functions which, while it's possible to achieve in rational arithmetic (Daumas et al., 2007)<sup>[**(19)**](#Note19)</sup>, is less elegant than, say, the normal distribution sampler by Karney (2014)<sup>[**(20)**](#Note20)</sup>, which doesn't require calculating logarithms or other transcendental functions.

This algorithm works for any univariate (one-variable) distribution as long as&mdash;

- for all _x_, _PDF_(_x_) < &infin; and _PDF_(_x_)\*_x_<sup>2</sup> < &infin;, where _PDF_ is the distribution's PDF or a function proportional to the PDF,
- _PDF_ is continuous almost everywhere, and
- either&mdash;
    - the distribution's ratio-of-uniforms shape (the transformed PDF) is covered entirely by the rectangle [0, ceil(_d1_)]&times;[0, ceil(_d2_)], where _d1_ is not less than the highest value of _x_\*sqrt(_PDF_(_x_)) anywhere, and _d2_ is not less than the highest value of sqrt(_PDF_(_x_)) anywhere, or
    - half of that shape is covered this way and the shape is symmetric about the _v_-axis.

The algorithm follows.

1. Generate two empty PSRNs, with a positive sign, an integer part of 0, and an empty fractional part.  Call the PSRNs _p1_ and _p2_.
2. Set _S_ to _base_, where _base_ is the base of digits to be stored by the PSRNs (such as 2 for binary or 10 for decimal).  Then set _c1_ to an integer in the interval [0, _d1_), chosen uniformly at random, then set _c2_ to an integer in [0, _d2_), chosen uniformly at random, then set _d_ to 1.
3. Multiply _c1_ and _c2_ each by _base_ and add a digit chosen uniformly at random to that coordinate.
4. Run an **InShape** function that determines whether the transformed PDF is covered by the current box. In principle, this is the case when _z_ &le; 0 everywhere in the box, where _u_ lies in \[_c1_/_S_, (_c1_+1)/_S_\], _v_ lies in \[_c2_/_S_, (_c2_+1)/_S_\], and _z_ is _v_<sup>2</sup>&minus;_PDF_(_u_/_v_).  **InShape** returns _YES_ if the box is fully inside the transformed PDF, _NO_ if the box is fully outside it, and _MAYBE_ in any other case, or if evaluating _z_ fails for a given box (e.g., because ln(0) would be calculated or _v_ is 0).  See the next section for implementation notes.
5. If **InShape** as described in step 4 returns _YES_, then do the following:
    1. Transfer _c1_'s least significant digits to _p1_'s fractional part, and transfer _c2_'s least significant digits to _p2_'s fractional part.  The variable _d_ tells how many digits to transfer to each PSRN this way.  Then set _p1_'s integer part to floor(_c1_/_base_<sup>_d_</sup>) and _p2_'s integer part to floor(_c2_/_base_<sup>_d_</sup>). (For example, if _base_ is 10, _d_ is 3, and _c1_ is 7342, set _p1_'s fractional part to \[3, 4, 2\] and _p1_'s integer part to 7.)
    2. Run the **UniformDivision** algorithm (described in the article on PSRNs) on _p1_ and _p2_, in that order.
    3. If the transformed PDF is symmetric about the _v_-axis, set the resulting PSRN's sign to positive or negative with equal probability.  Otherwise, set the PSRN's sign to positive.
    4. Return the PSRN.
6. If **InShape** as described in step 4 returns _NO_, then go to step 2.
7. Multiply _S_ by _base_, then add 1 to _d_, then go to step 3.

> **Examples:**
>
> 1. For the normal distribution, _PDF_ is proportional to exp(&minus;_x_<sup>2</sup>/2), so that _z_ after a logarithmic transformation (see next section) becomes 4\*ln(_v_) + (_u_/_v_)<sup>2</sup>, and since the distribution's ratio-of-uniforms shape is symmetric about the _v_-axis, the return value's sign is positive or negative with equal probability.
> 2. For the standard lognormal distribution ([**Gibrat's distribution**](https://mathworld.wolfram.com/GibratsDistribution.html)), _PDF_(_x_) is proportional to exp(&minus;(ln(_x_))<sup>2</sup>/2)/_x_, so that _z_ after a logarithmic transformation becomes 2\*ln(_v_)&minus;(&minus;ln(_u_/_v_)<sup>2</sup>/2 &minus; ln(_u_/_v_)), and the returned PSRN has a positive sign.
> 3. For the gamma distribution with shape parameter _a_ > 1, _PDF_(_x_) is proportional to _x_<sup>_a_&minus;1</sup>\*exp(&minus;_x_), so that _z_ after a logarithmic transformation becomes 2\*ln(_v_)&minus;(_a_&minus;1)\*ln(_u_/_v_)&minus;(_u_/_v_), or 0 if _u_ or _v_ is 0, and the returned PSRN has a positive sign.

<a id=Implementation_Notes_for_Box_Shape_Intersection></a>
### Implementation Notes for Box/Shape Intersection

The "[**Uniform Distribution Inside N-Dimensional Shapes**](#Uniform_Distribution_Inside_N_Dimensional_Shapes)" algorithm uses a function called **InShape** to determine whether an axis-aligned box is either outside a shape, fully inside the shape, or partially inside the shape.  The following are notes that will aid in developing a robust implementation of **InShape** for a particular shape, especially because the boxes being tested can be arbitrarily small.

1. **InShape**, as well as the divisions of the coordinates by _S_, should be implemented using rational arithmetic.  Instead of dividing those coordinates this way, an implementation can pass _S_ as a separate parameter to **InShape**.
2. If the shape is convex, and the point (0, 0, ..., 0) is on or inside that shape, **InShape** can return&mdash;
    - _YES_ if all the box's corners are in the shape;
    - _NO_ if none of the box's corners are in the shape and if the shape's boundary does not intersect with the box's boundary; and
    - _MAYBE_ in any other case, or if the function is unsure.

    In the case of two-dimensional shapes, the shape's corners are (_c1_/_S_, _c2_/_S_), ((_c1_+1)/_S_, _c2_/_S_), (_c1_,(_c2_+1)/_S_), and ((_c1_+1)/_S_, (_c2_+1)/_S_).  However, checking for box/shape intersections this way is non-trivial to implement robustly, especially if interval arithmetic is not used.
3. If the shape is given as an inequality of the form _f_(_t1_, ..., _tN_) &le; 0, **InShape** should use rational interval arithmetic (such as the one given in (Daumas et al., 2007)<sup>[**(19)**](#Note19)</sup>), where the two bounds of each interval are rational numbers with arbitrary-precision numerators and denominators.  Then, **InShape** should build one interval for each dimension of the box and evaluate _f_ using those intervals<sup>[**(21)**](#Note21)</sup> with an accuracy that increases as _S_ increases.  Then, **InShape** can return&mdash;
    - _YES_ if the interval result of _f_ has an upper bound less than or equal to 0;
    - _NO_ if the interval result of _f_ has a lower bound greater than 0; and
    - _MAYBE_ in any other case.

    For example, if _f_ is (_t1_<sup>2</sup>+_t2_<sup>2</sup>&minus;1), which describes a quarter disk, **InShape** should build two intervals, namely _t1_ = \[_c1_/_S_, (_c1_+1)/_S_\] and _t2_ = \[_c2_/_S_, (_c2_+1)/_S_\], and evaluate _f_(_t1_, _t2_) using interval arithmetic.

    One thing to point out, though: If _f_ calls the exp(_x_) function where _x_ can potentially have a high absolute value, say 10000 or higher, the exp function can run a very long time in order to calculate proper bounds for the result, since the number of digits in exp(_x_) grows linearly with _x_.  In this case, it may help to transform the inequality to its logarithmic version.  For example, by applying ln(.) to each side of the inequality _y_<sup>2</sup> &le; exp(&minus;(_x_/_y_)<sup>2</sup>/2), the inequality becomes 2\*ln(_y_) &le; &minus;(_x_/_y_)<sup>2</sup>/2 and thus becomes 2\*ln(_y_) + (_x_/_y_)<sup>2</sup>/2 &le; 0 and thus becomes 4\*ln(_y_) + (_x_/_y_)<sup>2</sup> &le; 0.
4. If the shape is such that every axis-aligned line segment that begins in one face of the hypercube and ends in another face crosses the shape at most once, ignoring the segment's endpoints (an example is an axis-aligned quarter of a circular disk where the disk's center is (0, 0)), then **InShape** can return&mdash;
    - _YES_ if all the box's corners are in the shape;
    - _NO_ if none of the box's corners are in the shape; and
    - _MAYBE_ in any other case, or if the function is unsure.

    If **InShape** uses rational interval arithmetic, it can build an interval per dimension _per corner_, evaluate the shape for each corner individually and with an accuracy that increases as _S_ increases, and treat a corner as inside or outside the shape only if the result of the evaluation clearly indicates that.  Using the example of a quarter disk, **InShape** can build eight intervals, namely an _x_- and _y_-interval for each of the four corners; evaluate (_x_<sup>2</sup>+_y_<sup>2</sup>&minus;1) for each corner; and return _YES_ only if all four results have upper bounds less than or equal to 0, _NO_ only if all four results have lower bounds greater than 0, and _MAYBE_ in any other case.
5. If **InShape** expresses a shape in the form of a [**_signed distance function_**](https://en.wikipedia.org/wiki/Signed_distance_function), namely a function that describes the closest distance from any point in space to the shape's boundary, it can return&mdash;
    - _YES_ if the signed distance (or an upper bound of such distance) at each of the box's corners, after dividing their coordinates by _S_, is less than or equal to &minus;_&sigma;_ (where _&sigma;_ is an upper bound for sqrt(_N_)/(_S_\*2), such as 1/_S_);
    - _NO_ if the signed distance (or a lower bound of such distance) at each of the box's corners is greater than _&sigma;_; and
    - _MAYBE_ in any other case, or if the function is unsure.
6. **InShape** implementations can also involve a shape's _implicit curve_ or _algebraic curve_ equation (for closed curves), its _implicit surface_ equation (for closed surfaces), or its _signed distance field_ (a quantized version of a signed distance function).
7. An **InShape** function can implement a set operation (such as a union, intersection, or difference) of several simpler shapes, each with its own **InShape** function.  The final result depends on the shape operation (such as union or intersection) as well as the result returned by each component for a given box.  The following are examples of set operations:
    - For unions, the final result is _YES_ if any component returns _YES_; _NO_ if all components return _NO_; and _MAYBE_ otherwise.
    - For intersections, the final result is _YES_ if all components return _YES_; _NO_ if any component returns _NO_; and _MAYBE_ otherwise.
    - For differences between two shapes, the final result is _YES_ if the first shape returns _YES_ and the second returns _NO_; _NO_ if the first shape returns _NO_ or if both shapes return _YES_; and _MAYBE_ otherwise.
    - For the exclusive OR of two shapes, the final result is _YES_ if one shape returns _YES_ and the other returns _NO_; _NO_ if both shapes return _NO_ or both return _YES_; and _MAYBE_ otherwise.

<a id=SymPy_Code_for_Piecewise_Linear_Factory_Functions></a>
### SymPy Code for Piecewise Linear Factory Functions

```
def bernstein_n(func, x, n, pt=None):
  # Bernstein operator.
  # Create a polynomial that approximates func, which in turn uses
  # the symbol x.  The polynomial's degree is n and is evaluated
  # at the point pt (or at x if not given).
  if pt==None: pt=x
  ret=0
  v=[binomial(n,j) for j in range(n//2+1)]
  for i in range(0, n+1):
    oldret=ret
    bino=v[i] if i<len(v) else v[n-i]
    ret+=func.subs(x,S(i)/n)*bino*pt**i*(1-pt)**(n-i)
    if pt!=x and ret==oldret and ret>0: break
  return ret

def inflec(y,eps=S(2)/10,mult=2):
  # Calculate the inflection point (x) given y, eps, and mult.
  # The formula is not found in the paper by Thomas and
  # Blanchet 2012, but in
  # the supplemental source code uploaded by
  # A.C. Thomas.
  po=5 # Degree of y-to-x polynomial curve
  eps=S(eps)
  mult=S(mult)
  x=-((y-(1-eps))/eps)**po/mult + y/mult
  return x

def xfunc(y,sym,eps=S(2)/10,mult=2):
  # Calculate Bernstein "control polygon" given y,
  # eps, and mult.
  return Min(sym*y/inflec(y,eps,mult),y)

def calc_linear_func(eps=S(5)/10, mult=1, count=10):
   # Calculates the degrees and Y parameters
   # of a sequence of polynomials that converge
   # from above to min(x*mult, 1-eps).
   # eps must be in the interval (0, 1).
   # Default is 10 polynomials.
   polys=[]
   eps=S(eps)
   mult=S(mult)
   count=S(count)
   bs=20
   ypt=1-(eps/4)
   x=symbols('x')
   tfunc=Min(x*mult,1-eps)
   tfn=tfunc.subs(x,(1-eps)/mult).n()
   xpt=xfunc(ypt,x,eps=eps,mult=mult)
   bits=5
   i=0
   lastbxn = 1
   diffs=[]
   while i<count:
     bx=bernstein_n(xpt,x,bits,(1-eps)/mult)
     bxn=bx.n()
     if bxn > tfn and bxn < lastbxn:
       # Dominates target function
       #if oldbx!=None:
       #   diffs.append(bx)
       #   diffs.append(oldbx-bx)
       #oldbx=bx
       oldxpt=xpt
       lastbxn = bxn
       polys.append([bits,ypt])
       print("    [%d,%s]," % (bits,ypt))
       # Find y2 such that y2 < ypt and
       # bernstein_n(oldxpt,x,bits,inflec(y2, ...)) >= y2,
       # so that next Bernstein expansion will go
       # underneath the previous one
       while True:
         ypt-=(ypt-(1-eps))/4
         xpt=inflec(ypt,eps=eps,mult=mult).n()
         bxs=bernstein_n(oldxpt,x,bits,xpt).n()
         if bxs>=ypt.n():
            break
       xpt=xfunc(ypt,x,eps=eps,mult=mult)
       bits+=20
       i+=1
     else:
       bits=int(bits*200/100)
   return polys

calc_linear_func(count=8)
```

<a id=Derivation_of_My_Algorithm_for_min___lambda___1_2></a>
### Derivation of My Algorithm for min(_&lambda;_, 1/2)

The following explains how the algorithm is derived.

The function min(_&lambda;_, 1/2) can be rewritten as _A_ + _B_ where&mdash;

- _A_  = (1/2) \* _&lambda;_, and
- _B_ = (1/2) \* ((1&minus;sqrt(1&minus;4\*_&lambda;_\*(1&minus;_&lambda;_)))/2) = (1/2) \* &sum;<sub>_k_ = 1, 2, ...</sub> _g_(_k_) \*  _h_<sub>_k_</sub>(_&lambda;_),

revealing that the function is a [**convex combination**](https://peteroupc.github.io/bernoulli.html#Convex_Combinations), and _B_ is itself a convex combination where&mdash;

- _g_(_k_) = (2\*_k_,_k_)/((2\*_k_&minus;1)\*2<sup>2*_k_</sup>), and
- _h_<sub>_k_</sub>(_&lambda;_) = (4\*_&lambda;_\*(1&minus;_&lambda;_))<sup>_k_</sup> / 2 = (_&lambda;_\*(1&minus;_&lambda;_))<sup>_k_</sup> * 4<sup>_k_</sup> / 2

(see also Wästlund (1999)<sup>[**(22)**](#Note22)</sup>; Dale et al. (2015)<sup>[**(23)**](#Note23)</sup>).  The right-hand side of _h_, which is the polynomial built in step 3 of the algorithm, is a polynomial of degree _k_\*2 with Bernstein coefficients&mdash;

- _z_ = (4<sup>_v_</sup>/2) / choose(_v_*2,_v_) at _v_=_k_, and
- 0 elsewhere.

Unfortunately, _z_ is generally greater than 1, so that the polynomial can't be simulated, as is, using the Bernoulli factory algorithm for [**polynomials in Bernstein form**](https://peteroupc.github.io/bernoulli.html#Certain_Polynomials_in_Bernstein_Form).  Fortunately, the polynomial's degree can be elevated to bring the Bernstein coefficients to 1 or less (for degree elevation and other algorithms, see (Tsai and Farouki 2001)<sup>[**(24)**](#Note24)</sup>).  Moreover, due to the special form of the Bernstein coefficients in this case, the degree elevation process can be greatly simplified.  Given an even degree _d_ as well as _z_ (as defined above), the degree elevation is as follows:

1. Set _r_ to floor(_d_/3) + 1. (This starting value is because when this routine finishes, _r_/_d_ appears to converge to 1/3 as _d_ gets large, for the polynomial in question.)  Let _c_ be choose(_d_,_d_/2).
2. Create a list of _d_+_r_+1 Bernstein coefficients, all zeros.
3. For each integer _i_ in the interval [0, _d_+_r_]:
     - If _d_/2 is in the interval [max(0, _i_&minus;_r_), min(_d_,_i_)], set the _i_<sup>th</sup> Bernstein coefficient (starting at 0) to _z_\*_c_\*choose(_r_,_i_&minus;_d_/2)\* / choose(_d_+_r_, _i_).
4. If all the Bernstein coefficients are 1 or less, return them.  Otherwise, add _d_/2 to _r_ and go to step 2.

<a id=Algorithm_2_for_Non_Negative_Factories></a>
### Algorithm 2 for Non-Negative Factories

**Algorithm 2.** Say we have an _oracle_ that produces random real numbers. The goal is now to produce non-negative random numbers that average to the mean of _f_(_X_), where _X_ is a number produced by the oracle.  This is possible whenever the mean of _f_(_X_) is not less than _&delta;_, where _&delta;_ is a known number greater than 0. The algorithm to do so follows (see Lee et al. 2014)<sup>[**(25)**](#Note25)</sup>:

1. Let _m_ be an upper bound of the maximum value of abs(_f_(_&mu;_)) anywhere.  Create a _&nu;_ input coin that does the following: "Generate a random number from the oracle, call it _x_.  With probability abs(_f_(_x_))/_m_, return a number that is 1 if _f_(_x_) < 0 and 0 otherwise.  Otherwise, repeat this process."
2. Use one of the [**linear Bernoulli factories**](https://peteroupc.github.io/bernoulli.html#lambda____x___y__linear_Bernoulli_factories) to simulate 2\*_&nu;_ (2 times the _&nu;_ coin's probability of heads), using the _&nu;_ input coin, with _&#x03F5;_ = _&delta;_/_m_.  If the factory returns 1, return 0.  Otherwise, generate a random number from the oracle, call it _&xi;_, and return abs(_f_(_&xi;_)).

> **Example:** An example from Lee et al. (2014)<sup>[**(25)**](#Note25)</sup>.  Say the oracle produces uniform random numbers in [0, 3\*_&pi;_], and let _f_(_&mu;_) = sin(_&mu;_).  Then the mean of _f_(_X_) is 2/(3\*_&pi;_), which is greater than 0 and found in SymPy by `sympy.stats.E(sin(sympy.stats.Uniform('U',0,3*pi)))`, so the algorithm can produce non-negative random numbers that average to that mean.
>
> **Notes:**
>
> 1. Averaging to the mean of _f_(_X_) (that is, **E**\[_f_(_X_)] where **E**\[.] means expected or average value) is not the same as averaging to _f_(_&mu;_) where _&mu;_ is the mean of the oracle's numbers (that is, _f_(**E**\[_X_])).  For example, if _X_ is 0 or 1 with equal probability, and _f_(_&lambda;_) = exp(&minus;_&lambda;_), then **E**\[_f_(_X_)] = exp(0) + (exp(&minus;1) &minus; exp(0))\*(1/2), and _f_(**E**\[_X_]) = _f_(1/2) = exp(&minus;1/2).
> 2. (Lee et al. 2014, Corollary 4)<sup>[**(25)**](#Note25)</sup>: If _f_(_&mu;_) is known to return only values in the interval [_a_, _c_], the mean of _f_(_X_) is not less than _&delta;_, _&delta;_ > _b_, and _&delta;_ and _b_ are known numbers, then Algorithm 2 can be modified as follows:
>
>     - Use _f_(_&mu;_) = _f_(_&mu;_) &minus; _b_, and use _&delta;_ = _&delta;_ &minus; _b_.
>     - _m_ is taken as max(_b_&minus;_a_, _c_&minus;_b_).
>     - When Algorithm 2 finishes, add _b_ to its return value.

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
