# More Algorithms for Arbitrary-Precision Sampling

[**Peter Occil**](mailto:poccil14@gmail.com)

**Abstract:** This page contains additional algorithms for arbitrary-precision sampling of continuous distributions, Bernoulli factory algorithms (biased-coin to biased-coin algorithms), and algorithms to simulate irrational probabilities.  They supplement my pages on Bernoulli factory algorithms and partially-sampled random numbers.

**2020 Mathematics Subject Classification:** 68W20, 60-08, 60-04.

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
    - [**exp(_&lambda;_/4)/2**](#exp___lambda___4_2)
    - [**sinh(_&lambda;_)/2**](#sinh___lambda___2)
    - [**1/(exp(1) &minus; 1)**](#1_exp_1_minus_1)
    - [**exp(1) &minus; 2**](#exp_1_minus_2)
    - [**tanh(_&lambda;_)**](#tanh___lambda)
    - [**Euler&ndash;Mascheroni Constant _&gamma;_**](#Euler_ndash_Mascheroni_Constant___gamma)
    - [**_&pi;_/4**](#pi___4)
    - [**_&pi;_/4 &minus; 1/2 or (_&pi;_ &minus; 2)/4**](#pi___4_minus_1_2_or___pi___minus_2_4)
    - [**(_&pi;_ &minus; 3)/4**](#pi___minus_3_4)
    - [**_&pi;_ &minus; 3**](#pi___minus_3)
    - [**4/(3\*_&pi;_)**](#4_3___pi)
    - [**Other Probabilities and Factory Functions**](#Other_Probabilities_and_Factory_Functions)
    - [**Certain Piecewise Linear Functions**](#Certain_Piecewise_Linear_Functions)
    - [**Sampling Distributions Using Incomplete Information**](#Sampling_Distributions_Using_Incomplete_Information)
    - [**Pushdown Automata for Square-Root-Like Functions**](#Pushdown_Automata_for_Square_Root_Like_Functions)
- [**General Arbitrary-Precision Samplers**](#General_Arbitrary_Precision_Samplers)
    - [**Uniform Distribution Inside N-Dimensional Shapes**](#Uniform_Distribution_Inside_N_Dimensional_Shapes)
    - [**Building an Arbitrary-Precision Sampler**](#Building_an_Arbitrary_Precision_Sampler)
    - [**Mixtures**](#Mixtures)
    - [**Weighted Choice Involving PSRNs**](#Weighted_Choice_Involving_PSRNs)
- [**Specific Arbitrary-Precision Samplers**](#Specific_Arbitrary_Precision_Samplers)
    - [**Rayleigh Distribution**](#Rayleigh_Distribution)
    - [**Hyperbolic Secant Distribution**](#Hyperbolic_Secant_Distribution)
    - [**Reciprocal of Power of Uniform**](#Reciprocal_of_Power_of_Uniform)
    - [**Distribution of _U_/(1&minus;_U_)**](#Distribution_of__U__1_minus__U)
    - [**Arc-Cosine Distribution**](#Arc_Cosine_Distribution)
    - [**Logistic Distribution**](#Logistic_Distribution)
    - [**Cauchy Distribution**](#Cauchy_Distribution)
    - [Exponential Distribution with Unknown Rate _&lambda;_, Lying in (0, 1\]](#Exponential_Distribution_with_Unknown_Rate___lambda___Lying_in_0_1)
    - [**Exponential Distribution with Rate ln(_x_)**](#Exponential_Distribution_with_Rate_ln__x)
    - [**Symmetric Geometric Distribution**](#Symmetric_Geometric_Distribution)
    - [**Lindley Distribution and Lindley-Like Mixtures**](#Lindley_Distribution_and_Lindley_Like_Mixtures)
    - [**Gamma Distribution**](#Gamma_Distribution)
    - [**One-Dimensional Epanechnikov Kernel**](#One_Dimensional_Epanechnikov_Kernel)
- [**Requests and Open Questions**](#Requests_and_Open_Questions)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Ratio of Uniforms**](#Ratio_of_Uniforms)
    - [**Implementation Notes for Box/Shape Intersection**](#Implementation_Notes_for_Box_Shape_Intersection)
    - [**Probability Transformations**](#Probability_Transformations)
    - [**SymPy Code for Piecewise Linear Factory Functions**](#SymPy_Code_for_Piecewise_Linear_Factory_Functions)
    - [**Derivation of My Algorithm for min(_&lambda;_, 1/2)**](#Derivation_of_My_Algorithm_for_min___lambda___1_2)
    - [**Sampling Distributions Using Incomplete Information: Omitted Algorithms**](#Sampling_Distributions_Using_Incomplete_Information_Omitted_Algorithms)
    - [**Pushdown Automata and Algebraic Functions**](#Pushdown_Automata_and_Algebraic_Functions)
        - [**Finite-State and Pushdown Generators**](#Finite_State_and_Pushdown_Generators)
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
2. Do the following process repeatedly, until this run of the algorithm returns a value:
    1. With probability _kp_/(1 + _kp_), return a number that is 1 with probability 1/_kp_ and 0 otherwise.
    2. Do a separate run of the currently running algorithm, but with _pos_ = _pos_ + 1.  If the separate run returns 1, return 0.

<a id=Ratio_of_Lower_Gamma_Functions_gamma__m___x__gamma__m__1></a>
### Ratio of Lower Gamma Functions (&gamma;(_m_, _x_)/&gamma;(_m_, 1)).

1. Set _ret_ to the result of **kthsmallest** with the two parameters _m_ and _m_.  (Thus, _ret_ is distributed as _u_<sup>1/_m_</sup> where _u_ is a uniform(0, 1) random variate; although **kthsmallest** accepts only integers, this formula works for any _m_ greater than 0.)
2. Set _k_ to 1, then set _u_ to point to the same value as _ret_.
3. Generate a uniform(0, 1) random variate _v_.
4. If _v_ is less than _u_: Set _u_ to _v_, then add 1 to _k_, then go to step 3.
5. If _k_ is odd, return a number that is 1 if _ret_ is less than _x_ and 0 otherwise. (If _ret_ is implemented as a uniform partially-sampled random number (PSRN), this comparison should be done via **URandLessThanReal**.)  If _k_ is even, go to step 1.

Derivation:  See Formula 1 in the section "[**Probabilities Arising from Certain Permutations**](https://peteroupc.github.io/bernoulli.html#Probabilities_Arising_from_Certain_Permutations)", where:

- `ECDF(x)`  is the uniform(0,1) distribution's cumulative distribution function, namely _x_ if _x_ is in \[0, 1\], 0 if _x_ is less than 0, and 1 otherwise.
- `DPDF(x)` is the probability density function for the maximum of _m_ uniform(0,1) random variates, namely _m_\*_x_<sup>_m_&minus;1</sup> if _x_ is in \[0, 1\], and 0 otherwise.

<a id=Derivative_slope_of_arctan___lambda></a>
### Derivative (slope) of arctan(_&lambda;_)

This algorithm involves the series expansion of this function (1 &minus; _&lambda;_<sup>2</sup> + _&lambda;_<sup>4</sup> &minus; ...) and involves the general martingale algorithm.

1. Set _u_ to 1, set _w_ to 1, set _&#x2113;_ to 0, and set _n_ to 1.
2. Generate a uniform(0, 1) random variate _ret_.
3. (The remaining steps are done repeatedly, until the algorithm returns a value.) If _w_ is not 0, flip the input coin and multiply _w_ by the result of the flip.  Do this step again.
4. If _n_ is even, set _u_ to _&#x2113;_ + _w_.  Otherwise, set _&#x2113;_ to _u_ &minus; _w_.
5. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  If _ret_ is less than _u_, go to the next step.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
6. Add 1 to _n_ and go to step 3.

<a id=cosh___lambda___minus_1></a>
### cosh(_&lambda;_) &minus; 1

There are two algorithms.

The first algorithm involves an application of the general martingale algorithm to the Taylor series for cosh(_&lambda;_)&minus;1, which is _&lambda;_<sup>2</sup>/(2!) + _&lambda;_<sup>4</sup>/(4!) + ....  See (Łatuszyński et al. 2009/2011, algorithm 3)<sup>[**(2)**](#Note2)</sup>. (In this document, _n_! = 1\*2\*3\*...\*_n_ is known as _n_ factorial.)

1. Set _u_ to 0, set _w_ to 1, set _&#x2113;_ to 0, and set _n_ to 1.
2. Generate a uniform(0, 1) random variate _ret_.
3. If _w_ is not 0, flip the input coin and multiply _w_ by the result of the flip.  Do this step again.
4. If _w_ is 0, set _u_ to _&#x2113;_ and go to step 6.  (The estimate _&lambda;_<sup>_n_\*2</sup> is 0, so no more terms are added and we use _&#x2113;_ as the final estimate for cosh(_&lambda;_)&minus;1.)
5. Let _m_ be (_n_\*2), let _&alpha;_ be 1/(_m_!) (a term of the Taylor series), and let _err_ be 2/((_m_+1)!) (the error term).  Add _&alpha;_ to _&#x2113;_, then set _u_ to _&#x2113;_ + _err_.
6. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  If _ret_ is less than _u_, go to the next step.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
7. Add 1 to _n_ and go to step 3.

In this algorithm, the error term, which follows from _Taylor's theorem_, has a numerator of 2 because 2 is higher than the maximum value that the function's slope, slope-of-slope, etc. functions can achieve anywhere in the interval [0, 1].

The second algorithm is one I found that takes advantage of the convex combination method.

1. ("Geometric" random variate _n_.)  Generate unbiased random bits until a zero is generated this way.  Set _n_ to 2 plus the number of ones generated this way. (The number _n_ is generated with probability _g_(_n_), as given below.)
2. (The next two steps succeed with probability _w_<sub>_n_</sub>(_&lambda;_)/_g_(_n_).)  If _n_ is odd, return 0.  Otherwise, with probability 2<sup>_n_&minus;1</sup>/(_n_!), go to the next step.  Otherwise, return 0.
3. Flip the input coin _n_ times or until a flip returns 0, whichever happens first.  Return 1 if all the flips, including the last, returned 1.  Otherwise, return 0.

Derivation: Follows from rewriting cosh(_&lambda;_)&minus;1 as the following series: &Sum;<sub>_n_=0,1,...</sub>&nbsp;_w_<sub>_n_</sub>(_&lambda;_) = &Sum;<sub>_n_=0,1,...</sub>&nbsp;_g_(_n_)\*(_w_<sub>_n_</sub>(_&lambda;_)/_g_(_n_)), where&mdash;

- _g_(_n_) is (1/2)\*(1/2)<sup>_n_&minus;2</sup> if _n_&ge;2, or 0 otherwise, and
- _w_<sub>_n_</sub>(_&lambda;_) is _&lambda;_<sup>_n_</sup>/(_n_!) if _n_&ge;2 and _n_ is even, or 0 otherwise.

<a id=exp___lambda___4_2></a>
### exp(_&lambda;_/4)/2

1. ("Geometric" random variate _n_.)  Generate unbiased random bits until a zero is generated this way.  Set _n_ to the number of ones generated this way. (The number _n_ is generated with probability _g_(_n_), as given below.)
2. (The next two steps succeed with probability _w_<sub>_n_</sub>(_&lambda;_)/_g_(_n_).)  With probability 1/(2<sup>_n_</sup>\*(_n_!)), go to the next step.  Otherwise, return 0.
3. Flip the input coin _n_ times or until a flip returns 0, whichever happens first.  Return 1 if all the flips, including the last, returned 1.  Otherwise, return 0.

Derivation: Follows from rewriting exp(_&lambda;_/4)/2 in a similar manner to cosh(_&lambda;_)&minus;1, where this time, _g_(_n_) is (1/2)\*(1/2)<sup>_n_</sup> (the "geometric" probabilities"), and _w_<sub>_n_</sub>(_&lambda;_) is the appropriate term for _n_ in the target function's Taylor series.

Additional functions:

| To simulate: | Follow this algorithm, except the probability in step 2 is: |
  ------- | -------- |
| exp(_&lambda;_)/4. |  2<sup>_n_&minus;1</sup>/(_n_!). |
| exp(_&lambda;_)/6. |  2<sup>_n_</sup>/(3\*(_n_!)). |
| exp(_&lambda;_/2)/2. | 1/(_n_!). |

<a id=sinh___lambda___2></a>
### sinh(_&lambda;_)/2

This algorithm involves an application of the general martingale algorithm to the Taylor series for sinh(_&lambda;_)/2, which is _&lambda;_<sup>1</sup>/(1!\*2) + _&lambda;_<sup>3</sup>/(3!\*2) + ..., or as used here, _&lambda;_\*(1/2 + _&lambda;_<sup>2</sup>/(3!\*2) + _&lambda;_<sup>4</sup>/(5!\*2) + ...).

1. Flip the input coin.  If it returns 0, return 0.
2. Set _u_ to 0, set _w_ to 1, set _&#x2113;_ to 1/2 (the first term is added already), and set _n_ to 1.
3. Generate a uniform(0, 1) random variate _ret_.
4. Do the following process repeatedly, until this algorithm returns a value:
    1. If _w_ is not 0, flip the input coin and multiply _w_ by the result of the flip.  Do this substep again.
    2. If _w_ is 0, set _u_ to _&#x2113;_ and go to the fourth substep. (No more terms are added here.)
    3. Let _m_ be (_n_\*2+1), let _&alpha;_ be 1/(_m_!\*2) (a term of the Taylor series), and let _err_ be 1/((_m_+1)!) (the error term).  Add _&alpha;_ to _&#x2113;_, then set _u_ to _&#x2113;_ + _err_.
    4. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  If _ret_ is less than _u_, go to the next substep.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
    5. Add 1 to _n_.

<a id=1_exp_1_minus_1></a>
### 1/(exp(1) &minus; 1)

Involves the continued fraction expansion and Bernoulli Factory algorithm 3 for continued fractions.  The algorithm begins with _pos_ equal to 1.  Then the following steps are taken.

- Do the following process repeatedly until this run of the algorithm returns a value:
    1. If _pos_ is divisible by 3 (that is, if rem(_pos_, 3) equals 0): Let _k_ be (_pos_/3)\*2.  With probability _k_/(1+_k_), return a number that is 1 with probability 1/_k_ and 0 otherwise.
    2. If _pos_ is not divisible by 3: Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return 1.
    3. Do a separate run of the currently running algorithm, but with _pos_ = _pos_ + 1.  If the separate run returns 1, return 0.

<a id=exp_1_minus_2></a>
### exp(1) &minus; 2

Involves the continued fraction expansion and Bernoulli Factory algorithm 3 for continued fractions.  The algorithm is the same as in the previous section, except it begins with _pos_ equal to 2 rather than 1 (because the continued fractions are almost the same).

<a id=tanh___lambda></a>
### tanh(_&lambda;_)

There are two algorithms.

The first takes advantage of the so-called Lambert's continued fraction for tanh(.), as well as Bernoulli Factory algorithm 3 for continued fractions.  The algorithm begins with _k_ equal to 1.  Then the following steps are taken.

1. If _k_ is 1: Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), flip the input coin and return the result.
2. Do the following process repeatedly, until this run of the algorithm returns a value:
    1. If _k_ is greater than 1, then do the following with probability _k_/(1+_k_):
        - Flip the input coin twice.  If any of these flips returns 0, return 0.  Otherwise, return a number that is 1 with probability 1/_k_ and 0 otherwise.
    2. Do a separate run of the currently running algorithm, but with _k_ = _k_ + 2.  If the separate run returns 1, return 0.

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
3. Generate a uniform(0, 1) random variate _ret_.
4. Do the following process repeatedly, until the algorithm returns a value:
    1. If _w_ is not 0, flip the input coin. If the flip returns 0, set _w_ to 0. Do this substep again.
    2. (Calculate the next term of the alternating series for tanh.) Let _m_ be 2\*(_n_+1).  **Get the _m_<sup>th</sup> Bernoulli number**, call it _b_. Let _t_ be abs(_b_)\*2<sup>_m_</sup>\*(2<sup>_m_</sup>&minus;1)/(_m_!).
    3. If _n_ is even, set _u_ to _&#x2113;_ + _w_ \* _t_.  Otherwise, set _&#x2113;_ to _u_ &minus; _w_ \* _t_.
    4. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  If _ret_ is less than _u_, go to the next step.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
    5. Add 1 to _n_.

<a id=Euler_ndash_Mascheroni_Constant___gamma></a>
### Euler&ndash;Mascheroni Constant _&gamma;_

As [**I learned**](https://stats.stackexchange.com/a/539564), the fractional part of 1/_U_, where _U_ is a uniform random variate in (0, 1), has a mean equal to 1 minus the Euler&ndash;Mascheroni constant _&gamma;_.<sup>[**(4)**](#Note4)</sup>  This leads to the following algorithm to sample a probability equal to _&gamma;_:

1. Generate a PSRN for the reciprocal of a uniform random variate, as described in [**another page of mine**](https://peteroupc.github.io/uniformsum.html#Reciprocal_of_Uniform_Random_Number).
2. Set the PSRN's integer part to 0, then run **SampleGeometricBag** on that PSRN.  Return 0 if the run returns 1, or 1 otherwise.

<a id=pi___4></a>
### _&pi;_/4

The following algorithm to sample the probability _&pi;_/4 is based on the section "[**Uniform Distribution Inside N-Dimensional Shapes**](#Uniform_Distribution_Inside_N_Dimensional_Shapes)", especially its Note 5.

1. Set _S_ to 2.  Then set _c1_ and _c2_ to 0.
2. Do the following process repeatedly, until the algorithm returns a value:
    1. Set _c1_ to 2\*_c1_ plus an unbiased random bit (either 0 or 1 with equal probability).  Then, set _c2_ to 2\*_c2_ plus an unbiased random bit.
    2. If ((_c1_+1)<sup>2</sup> + (_c2_+1)<sup>2</sup>) < _S_<sup>2</sup>, return 1.  (Point is inside the quarter disk, whose area is _&pi;_/4.)
    3. If ((_c1_)<sup>2</sup> + (_c2_)<sup>2</sup>) > _S_<sup>2</sup>, return 0.  (Point is outside the quarter disk.)
    4. Multiply _S_ by 2.

<a id=pi___4_minus_1_2_or___pi___minus_2_4></a>
### _&pi;_/4 &minus; 1/2 or (_&pi;_ &minus; 2)/4

Follows the _&pi;_/4 algorithm, except it samples from a quarter disk with an area equal to 1/2 removed.

1. Set _S_ to 2.  Then set _c1_ and _c2_ to 0.
2. Do the following process repeatedly, until the algorithm returns a value:
    1. Set _c1_ to 2\*_c1_ plus an unbiased random bit (either 0 or 1 with equal probability).  Then, set _c2_ to 2\*_c2_ plus an unbiased random bit.
    2. Set _diamond_ to _MAYBE_ and _disk_ to _MAYBE_.
    3. If ((_c1_+1) + (_c2_+1)) < _S_, set _diamond_ to _YES_.
    4. If ((_c1_) + (_c2_)) > _S_, set _diamond_ to _NO_.
    5. If ((_c1_+1)<sup>2</sup> + (_c2_+1)<sup>2</sup>) < _S_<sup>2</sup>, set _disk_ to _YES_.
    6. If ((_c1_)<sup>2</sup> + (_c2_)<sup>2</sup>) > _S_<sup>2</sup>, set _disk_ to _NO_.
    7. If _disk_ is _YES_ and _diamond_ is _NO_, return 1.  Otherwise, if _diamond_ is _YES_ or _disk_ is _NO_, return 0.
    8. Multiply _S_ by 2.

<a id=pi___minus_3_4></a>
### (_&pi;_ &minus; 3)/4

Follows the _&pi;_/4 algorithm, except it samples from a quarter disk with enough boxes removed from it to total an area equal to 3/4.

1. Set _S_ to 32.  Then set _c1_ to a uniform random integer in the half-open interval [0, _S_) and _c2_ to another uniform random integer in [0, _S_).
2. (Retained boxes.) If _c1_ is 0 and _c2_ is 0, or if _c1_ is 0 and _c2_ is 1, return 1.
3. (Removed boxes.) If ((_c1_+1)<sup>2</sup> + (_c2_+1)<sup>2</sup>) < 1024, return 0.
4. Multiply _S_ by 2.
5. (Sample the modified quarter disk.) Do the following process repeatedly, until the algorithm returns a value:
    1. Set _c1_ to 2\*_c1_ plus an unbiased random bit (either 0 or 1 with equal probability).  Then, set _c2_ to 2\*_c2_ plus an unbiased random bit.
    2. If ((_c1_+1)<sup>2</sup> + (_c2_+1)<sup>2</sup>) < _S_<sup>2</sup>, return 1.  (Point is inside the quarter disk, whose area is _&pi;_/4.)
    3. If ((_c1_)<sup>2</sup> + (_c2_)<sup>2</sup>) > _S_<sup>2</sup>, return 0.  (Point is outside the quarter disk.)
    4. Multiply _S_ by 2.

<a id=pi___minus_3></a>
### _&pi;_ &minus; 3

Similar to the _&pi;_/4 algorithm.  First it samples a point inside an area covering 1/4 of the unit square, then inside that area, it determines whether that point is inside another area covering (_&pi;_ &minus; 3)/4 of the unit square.  Thus, the algorithm acts as though it samples ((_&pi;_ &minus; 3)/4) / (1/4) = _&pi;_ &minus; 3.

1. Set _S_ to 2.  Then set _c1_ and _c2_ to 0.
2. Do the following process repeatedly, until the algorithm aborts it or returns a value:
    1. Set _S_ to 32.  Then set _c1_ to a uniform random integer in the half-open interval [0, _S_) and _c2_ to another uniform random integer in [0, _S_).
    2. (Return 1 if in retained boxes.) If _c1_ is 0 and _c2_ is 0, or if _c1_ is 0 and _c2_ is 1, return 1.
    3. (Check if outside removed boxes.) If ((_c1_+1)<sup>2</sup> + (_c2_+1)<sup>2</sup>) >= 1024, abort this process and go to step 3. (Otherwise, _c1_ and _c2_ are rejected and this process continues.)
3. Set _S_ to 64.
4. (Sample the modified quarter disk.) Do the following process repeatedly, until the algorithm returns a value:
    1. Set _c1_ to 2\*_c1_ plus an unbiased random bit (either 0 or 1 with equal probability).  Then, set _c2_ to 2\*_c2_ plus an unbiased random bit.
    2. If ((_c1_+1)<sup>2</sup> + (_c2_+1)<sup>2</sup>) < _S_<sup>2</sup>, return 1.  (Point is inside the quarter disk, whose area is _&pi;_/4.)
    3. If ((_c1_)<sup>2</sup> + (_c2_)<sup>2</sup>) > _S_<sup>2</sup>, return 0.  (Point is outside the quarter disk.)
    4. Multiply _S_ by 2.

> **Note:** Only a limited set of (_c1_, _c2_) pairs, including (0, 0) and (0, 1), will pass step 2 of this algorithm.  Thus it may be more efficient to choose one of them uniformly at random, rather than do step 2 as shown.  If (0, 0) or (0, 1) is chosen this way, the algorithm returns 1.

<a id=4_3___pi></a>
### 4/(3\*_&pi;_)

Given that the point (_x_, _y_) has positive coordinates and lies inside a disk of radius 1 centered at (0, 0), the mean value of _x_ is 4/(3\*_&pi;_). This leads to the following algorithm to sample that probability:

1. Generate two PSRNs in the form of a uniformly chosen point inside a 2-dimensional quarter hypersphere (see "[**Uniform Distribution Inside N-Dimensional Shapes**](#Uniform_Distribution_Inside_N_Dimensional_Shapes)" below, as well as the examples).
2. Let _x_ be one of those PSRNs.  Run **SampleGeometricBag** on that PSRN and return the result (which will be either 0 or 1).

> **Note:** The mean value 4/(3\*_&pi;_) can be derived as follows.  The relative probability that _x_ is "close" to _z_ is _p_(_z_) = sqrt(1 &minus; _z_\*_z_), where _z_ is in the interval [0, 1].  Now find the area under the graph of _z_\*_p_(_z_)/_c_ (where _c_=_&pi;_/4 is the area under the graph of _p_(_z_)).  The result is the mean value 4/(3\*_&pi;_).  The following Python code prints this mean value using the SymPy computer algebra library: `p=sqrt(1-z*z); c=integrate(p,(z,0,1)); print(integrate(z*p/c,(z,0,1)));`.

<a id=Other_Probabilities_and_Factory_Functions></a>
### Other Probabilities and Factory Functions

Algorithms in bold are given either in this page or in the "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)" page.

|  To simulate:  |  Follow this algorithm: |
   --- |  ---- |
|  3 &minus; exp(1) | Run the algorithm for **exp(1) &minus; 2**, then return 1 minus the result. |
|  exp(1)/_&pi;_  |  Create _&mu;_ coin for algorithm **exp(1) &minus; 2**.<br>Create _&lambda;_ coin for algorithm **_&pi;_ &minus; 3**.<br>Run algorithm for **(_d_ + _&mu;_) / (_c_ + _&lambda;_)** with _d_=2 and _c_=3.  |

<a id=Certain_Piecewise_Linear_Functions></a>
### Certain Piecewise Linear Functions

Let _f_(_&lambda;_) be a function of the form min(_&lambda;_\*_mult_, 1&minus;_&epsilon;_). This is a piecewise linear function with two pieces: a rising linear part and a constant part.

This section describes how to calculate the Bernstein coefficients for polynomials that converge from above and below to _f_, based on Thomas and Blanchet (2012)<sup>[**(5)**](#Note5)</sup>.  These polynomials can then be used to generate heads with probability _f_(_&lambda;_) using the algorithms given in "[**General Factory Functions**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions)".

In this section, **fbelow(_n_, _k_)** and **fabove(_n_, _k_)** are the _k_<sup>th</sup> coefficients (with _k_ starting at 0) of the lower and upper polynomials, respectively, in Bernstein form of degree _n_.

The code in the [**appendix**](#Appendix) uses the computer algebra library SymPy to calculate a list of parameters for a sequence of polynomials converging from above.  The method to do so is called `calc_linear_func(eps, mult, count)`, where `eps` is _&epsilon;_, `mult` = _mult_, and `count` is the number of polynomials to generate.  Each item returned by `calc_linear_func` is a list of two items: the degree of the polynomial, and a _Y parameter_.  The procedure to calculate the required polynomials is then logically as follows (as written, it runs very slowly, though):

1. Set _i_ to 1.
2. Run `calc_linear_func(eps, mult, i)` and get the degree and _Y parameter_ for the last listed item, call them _n_ and _y_, respectively.
3. Set _x_ to &minus;((_y_&minus;(1&minus;_&epsilon;_))/_&epsilon;_)<sup>5</sup>/_mult_ + _y_/_mult_.  (This exact formula doesn't appear in the Thomas and Blanchet paper; rather it comes from the [**supplemental source code**](https://github.com/acthomasca/rberfac/blob/main/rberfac-public-2.R) uploaded by A. C. Thomas at my request.
4. For degree _n_, **fbelow(_n_, _k_)** is min((_k_/_n_)\*_mult_, 1&minus;_&epsilon;_), and **fabove(_n_, _k_)** is min((_k_/_n_)\*_y_/_x_,_y_).  (**fbelow** matches _f_ because _f_ is _concave_ in the interval [0, 1], which roughly means that its rate of growth there never goes up.)
5. Add 1 to _i_ and go to step 2.

It would be interesting to find general formulas to find the appropriate polynomials (degrees and _Y parameters_) given only the values for _mult_ and _&epsilon;_, rather than find them "the hard way" via `calc_linear_func`.  For this procedure, the degrees and _Y parameters_ can be upper bounds, as long as the sequence of degrees is monotonically increasing and the sequence of Y parameters is nonincreasing.

> **Note:** In Nacu and Peres (2005)<sup>[**(6)**](#Note6)</sup>, the following polynomial sequences were suggested to simulate min(_&lambda;_\*2, 1 &minus; 2\*_&epsilon;_), provided _&epsilon;_ &lt; 1/8, where _n_ is a power of 2.  However, with these sequences, an extraordinary number of input coin flips is required to simulate this function each time.
>
> - **fbelow(_n_, _k_)** = min((_k_/_n_)\*2, 1 &minus; 2\*_&epsilon;_).
> - **fabove(_n_, _k_)** = min((_k_/_n_)\*2, 1 &minus; 2\*_&epsilon;_) +<br>(max(0, _k_/_n_+3\*_&epsilon; &minus;_ 1/2)/(_&epsilon;_/(1&minus;sqrt(2)/2)))\*sqrt(2/_n_) +<br>(72\*max(0, _k_/_n_&minus;1/9)/(1&minus;exp(&minus;2\*_&epsilon;_\*_&epsilon;_)))\*exp(&minus;2\*_&epsilon;_\*_&epsilon;_\*_n_).

My own algorithm for min(_&lambda;_, 1/2) is as follows.  See the [**appendix**](https://peteroupc.github.io/morealg.html#Derivation_of_My_Algorithm_for_min___lambda___1_2) for the derivation of this algorithm.

1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), flip the input coin and return the result.
2. Run the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) given later, and return the result of that run.

And the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) is as follows:

1. (Random walk.) Generate unbiased random bits until more zeros than ones are generated this way for the first time.  Then set _m_ to (_n_&minus;1)/2+1, where _n_ is the number of bits generated this way.
2. (Build a degree-_m_\*2 polynomial equivalent to (4\*_&lambda;_\*(1&minus;_&lambda;_))<sup>_m_</sup>/2.) Let _z_ be (4<sup>_m_</sup>/2)/choose(_m_\*2,_m_).  Define a polynomial of degree _m_\*2 whose (_m_\*2)+1 Bernstein coefficients are all zero except the _m_<sup>th</sup> coefficient (starting at 0), whose value is _z_.  Elevate the degree of this polynomial enough times so that all its coefficients are 1 or less (degree elevation increases the polynomial's degree without changing its shape or position; see the derivation in the appendix).  Let _d_ be the new polynomial's degree.
3. (Simulate the polynomial, whose degree is _d_ (Goyal and Sigman 2012)<sup>[**(7)**](#Note7)</sup>.) Flip the input coin _d_ times and set _h_ to the number of ones generated this way.  Let _a_ be the _h_<sup>th</sup> Bernstein coefficient (starting at 0) of the new polynomial.  With probability _a_, return 1.  Otherwise, return 0.

I suspected that the required degree _d_ would be floor(_m_\*2/3)+1, as described in the appendix.  With help from the [**MathOverflow community**](https://mathoverflow.net/questions/381419), steps 2 and 3 of the algorithm above can be described more efficiently as follows:

- (3.) Let _r_ be floor(_m_\*2/3)+1, and let _d_ be _m_\*2+_r_.
- (4.) (Simulate the polynomial, whose degree is _d_.) Flip the input coin _d_ times and set _h_ to the number of ones generated this way.  Let _a_ be (1/2) \* 2<sup>_m_\*2</sup>\*choose(_r_,_h_&minus;_m_)/choose(_d_, _h_) (the polynomial's _h_<sup>th</sup> Bernstein coefficient starting at 0; the first term is 1/2 because the polynomial being simulated has the value 1/2 at the point 1/2).  With probability _a_, return 1.  Otherwise, return 0.

The min(_&lambda;_, 1&minus;_&lambda;_) algorithm can be used to simulate certain other piecewise linear functions with three breakpoints, and algorithms for those functions are shown in the following table.  In the table, _&mu;_ is the unknown probability of heads of a second input coin.

|  Breakpoints  | Algorithm |
 --- | --- |
| 0 at 0; 1/2 at 1/2; and _&mu;_ at 1. | Flip the _&mu;_ input coin.  If it returns 1, flip the _&lambda;_ input coin and return the result.  Otherwise, run the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) using the _&lambda;_ input coin, and return the result of that run. |
| 0 at 0; _&mu;_/2 at 1/2; and _&mu;_/2 at 1. | Flip the _&mu;_ input coin.  If it returns 0, return 0.  Otherwise, generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), flip the _&lambda;_ input coin and return the result.  Otherwise, run the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) using the _&lambda;_ input coin, and return the result of that run. |
| _&mu;_ at 0; 1/2 at 1/2; and 0 at 1. | Flip the _&mu;_ input coin.  If it returns 1, flip the _&lambda;_ input coin and return 1 minus the result.  Otherwise, run the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) using the _&lambda;_ input coin, and return the result of that run. |
| 1 at 0; 1/2 at 1/2; and _&mu;_ at 1. | Flip the _&mu;_ input coin.  If it returns 0, flip the _&lambda;_ input coin and return 1 minus the result.  Otherwise, run the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) using the _&lambda;_ input coin, and return 1 minus the result of that run. |
| _&mu;_ at 0; 1/2 at 1/2; and 1 at 1. | Flip the _&mu;_ input coin.  If it returns 0, flip the _&lambda;_ input coin and return the result.  Otherwise, run the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) using the _&lambda;_ input coin, and return 1 minus the result of that run. |

<a id=Sampling_Distributions_Using_Incomplete_Information></a>
### Sampling Distributions Using Incomplete Information

The Bernoulli factory is a special case of the problem of **sampling a probability distribution with unknown parameters**.  This problem can be described as sampling from a new distribution using an _oracle_ (black box) that produces numbers of an incompletely known distribution. In the Bernoulli factory problem, this oracle is a _coin that shows heads or tails where the probability of heads is unknown_.  The rest of this section deals with oracles that go beyond coins.

**Algorithm 1.** Say we have an oracle that produces independent random variates in the interval \[_a_, _b_\], and these numbers have an unknown mean of _&mu;_. The goal is now to produce non-negative random variates whose expected ("average") value is _f_(_&mu;_).  Unless _f_ is constant, this is possible if and only if&mdash;

- _f_ is continuous on \[_a_, _b_\], and
- _f_(_&mu;_) is bounded from below by _&epsilon;_\*min((_&mu;_ &minus; _a_)<sup>_n_</sup>, (_b_ &minus; _&mu;_)<sup>_n_</sup>) for some integer _n_ and some _&epsilon;_ greater than 0 (loosely speaking, _f_ is non-negative and neither touches 0 inside (_a_, _b_) nor moves away from 0 more slowly than a polynomial)

(Jacob and Thiery 2015)<sup>[**(8)**](#Note8)</sup>. (Here, _a_ and _b_ are both rational numbers and may be less than 0.)

In the algorithm below, let _K_ be a rational number greater than the maximum value of _f_ in the interval [_a_, _b_], and let _g_(_&lambda;_) = _f_(_a_ + (_b_&minus;_a_)\*_&lambda;_)/_K_.

1. Create a _&lambda;_ input coin that does the following: "Take a number from the oracle, call it _x_.  With probability (_x_&minus;_a_)/(_b_&minus;_a_) (see note below), return 1.  Otherwise, return 0."
2. Run a Bernoulli factory algorithm for _g_(_&lambda;_), using the _&lambda;_ input coin.  Then return _K_ times the result.

> **Note:** The check "With probability (_x_&minus;_a_)/(_b_&minus;_a_)" is exact if the oracle produces only rational numbers.  If the oracle can produce irrational numbers (such as numbers that follow a beta distribution or another continuous distribution), then the code for the oracle should use uniform [**partially-sampled random numbers (PSRNs)**](https://peteroupc.github.io/exporand.html).  In that case, the check can be implemented as follows.  Let _x_ be a uniform PSRN representing a number generated by the oracle.  Set _y_ to **RandUniformFromReal**(_b_&minus;_a_), then the check succeeds if **URandLess**(_y_, **UniformAddRational**(_x_, &minus;_a_)) returns 1, and fails otherwise.
>
> **Example:** Suppose an oracle produces random variates in the interval [3, 13] with unknown mean _&mu;_, and we seek to use the oracle to produce non-negative random variates with mean _f_(_&mu;_) = &minus;319/100 + _&mu;_\*103/50 &minus; _&mu;_<sup>2</sup>*11/100, which is a polynomial with Bernstein coefficients [2, 9, 5] in the given interval.  Then since 8 is greater than the maximum of _f_ in that interval, _g_(_&lambda;_) is a degree-2 polynomial with Bernstein coefficients [2/8, 9/8, 5/8] in the interval [0, 1].  _g_ can't be simulated as is, though, but by increasing _g_'s degree to 3 we get the Bernstein coefficients [1/4, 5/6, 23/24, 5/8], which are all less than 1 so we can proceed with the following algorithm (see "[**Certain Polynomials**](https://peteroupc.github.io/bernoulli.html#Certain_Polynomials)"):
>
> 1. Set _heads_ to 0.
> 2. Generate three random variates from the oracle (which must produce random variates in the interval [3, 13]).  For each number _x_: With probability (_x_&minus;3)/(10&minus;3), add 1 to _heads_.
> 3. Depending on _heads_, return 8 (that is, 1 times the upper bound) with the given probability, or 0 otherwise: _heads_=0 &rarr; probability 1/4; 1 &rarr; 5/6; 2 &rarr; 23/24; 3 &rarr; 5/8.

**Algorithm 2.** This algorithm takes an oracle and produces non-negative random variates whose expected ("average") value is the mean of _f_(_X_), where _X_ is a number produced by the oracle.  The algorithm appears in the appendix, however, because it requires applying an arbitrary function (here, _f_) to a potentially irrational number.

**Algorithm 3.** For this algorithm, see the appendix.

**Algorithm 4.** Say there is an oracle in the form of an _n_-sided fair die (_n_&ge;2) with an unknown number of faces, where each face shows a different integer in the interval \[0, _n_).  The question arises: Which probability distributions based on _n_ can be sampled with this oracle?  This question was studied in the French-language dissertation of R. Duvignau (2015, section 5.2)<sup>[**(9)**](#Note9)</sup>, and the following are four of these distributions.

**_Bernoulli 1/n._** It's trivial to generate a Bernoulli variate that is 1 with probability 1/_n_ and 0 otherwise: just take a number from the oracle and return either 1 if that number is 0, or 0 otherwise.  Alternatively, take two numbers from the oracle and return either 1 if both are the same, or 0 otherwise (Duvignau 2015, p. 153)<sup>[**(9)**](#Note9)</sup>.

**_Random variate with mean n._** Likewise, it's trivial to generate variates with a mean of _n_: Do "Bernoulli 1/n" trials as described above until a trial returns 0, then return the number of trials done this way.  (This is often called 1 plus a "geometric" random variate, and has a mean of _n_.)

**_Binomial with parameters n and 1/n._** Using the oracle, the following algorithm generates a binomial variate of this kind (Duvignau 2015, Algorithm 20)<sup>[**(9)**](#Note9)</sup>:

1. Take items from the oracle until the same item is taken twice.
2. Create a list consisting of the items taken in step 1, except for the last item taken, then shuffle that list.
3. In the shuffled list, count the number of items that didn't change position after being shuffled, then return that number.

**_Binomial with parameters n and k/n._** Duvignau 2015 also includes an algorithm (Algorithm 25) to generate a binomial variate of this kind using the oracle (where _k_ is a known integer such that 0 < _k_ and _k_ &le; _n_):

1. Take items from the oracle until _k_ different items were taken this way.  Let _U_ be a list of these _k_ items, in the order in which they were first taken.
2. Create an empty list _L_.
3. For each integer _i_ in [0, _k_):
    1. Create an empty list _M_.
    2. Take an item from the oracle.  If the item is in _U_ at a position **less than _i_** (positions start at 0), repeat this substep.  Otherwise, if the item is not in _M_, add it to _M_ and repeat this substep.  Otherwise, go to the next substep.
    3. Shuffle the list _M_, then add to _L_ each item that didn't change position after being shuffled (if not already present in _L_).
4. For each integer _i_ in [0, _k_):
    1. Let _P_ be the item at position _i_ in _U_.
    2. Take an item from the oracle.  If the item is in _U_ at position **_i_ or less** (positions start at 0), repeat this substep.
    3. If the last item taken in the previous substep is in _U_ at a position **greater than _i_**, add _P_ to _L_ (if not already present).
5. Return the number of items in _L_.

Duvignau proved a result (Theorem 5.2) that answers the question: Which probability distributions based on the unknown _n_ can be sampled with the oracle?<sup>[**(10)**](#Note10)</sup> The result applies to a family of (discrete) distributions with the same unknown parameter _n_, starting with either 1 or a greater integer.  Let Supp(_m_) be the set of values taken on by the distribution with parameter equal to _m_.  Then that family can be sampled using the oracle if and only if:

- There is a computable function _f_(_k_) that outputs a positive number.
- For each _n_, Supp(_n_) is included in Supp(_n_+1).
- For every _k_ and for every _n_ starting with the greater of 2 or the first _n_ for which _k_ is in Supp(_n_), the probability of seeing _k_ given parameter _n_ is at least (1/_n_)<sup>_f_(_k_)</sup> (roughly speaking, the probability doesn't decay at a faster than polynomial rate as _n_ increases).

<a id=Pushdown_Automata_for_Square_Root_Like_Functions></a>
### Pushdown Automata for Square-Root-Like Functions

A _pushdown automaton_ is a state machine that keeps a stack of symbols.  In this document, the input for this automaton is a stream of flips of a coin that shows heads with probability _&lambda;_, and the output is 0 or 1 depending on which state the automaton ends up in when it empties the stack (Mossel and Peres 2005)<sup>[**(11)**](#Note11)</sup>.  That paper shows that a pushdown automaton, as defined here, can simulate only _algebraic functions_, that is, functions that can be a solution of a system of polynomial equations.  The [**appendix**](#Pushdown_Automata_and_Algebraic_Functions) defines these machines in more detail and has proofs on which algebraic functions are possible with pushdown automata.

The following algorithm extends the square-root construction of Flajolet et al. (2010)<sup>[**(12)**](#Note12)</sup>, takes an input coin with probability of heads _&lambda;_, and returns 1 with probability&mdash;

- _f_(_&lambda;_) = (1 &minus; _&lambda;_)/sqrt(1 + 4\*_&lambda;_\*_g_(_&lambda;_)\*(_g_(_&lambda;_) &minus; 1)), or equivalently,
- _f_(_&lambda;_) = (1 &minus; _&lambda;_) \* &sum;<sub>_n_=0,1,...</sub> _&lambda;_<sup>_n_</sup>\*_g_(_&lambda;_)<sup>_n_</sup>\*(1 &minus; _g_(_&lambda;_))<sup>_n_</sup>\*choose(2\*_n_, _n_) = (1 &minus; _&lambda;_) \* &sum;<sub>_n_=0,1,...</sub> (_&lambda;_\*_g_(_&lambda;_)\*(1 &minus; _g_(_&lambda;_)))<sup>_n_</sup>\*choose(2\*_n_, _n_), or equivalently,
- _f_(_&lambda;_) = (1 &minus; _&lambda;_) \* OGF(_&lambda;_\*_g_(_&lambda;_)\*(1 &minus; _g_(_&lambda;_))),

and 0 otherwise, where:

- _g_(_&lambda;_) is a continuous function that maps the half-open interval \[0, 1\) to the closed interval \[0, 1\] and admits a Bernoulli factory. If _g_ is a rational function (a ratio of two polynomials) with rational coefficients, then _f_ is algebraic and can be simulated by a _pushdown automaton_, as in the algorithm below. But this algorithm will still work even if _g_ is not a rational function.
- OGF(_x_) = &sum;<sub>_n_=0,1,...</sub> _x_<sup>_n_</sup>\*choose(2\*_n_, _n_) is the algorithm's ordinary generating function (also known as counting generating function).

1. Set _d_ to 0.
2. Do the following process repeatedly until this run of the algorithm returns a value:
    1. Flip the input coin.  If it returns 1, go to the next substep.  Otherwise, return either 1 if _d_ is 0, or 0 otherwise.
    2. Run a Bernoulli factory algorithm for _g_(_&lambda;_).  If the run returns 1, add 1 to _d_.  Otherwise, subtract 1 from _d_.  Do this substep again.

As a pushdown automaton, this algorithm (except the "Do this substep again" part) can be expressed as follows. Let the stack have the single symbol EMPTY, and start at the state POS-S1.  Based on the current state, the last coin flip (HEADS or TAILS), and the symbol on the top of the stack, set the new state and replace the top stack symbol with zero, one, or two symbols.  These _transition rules_ can be written as follows:

- (POS-S1, HEADS, _topsymbol_) &rarr; (POS-S2, {_topsymbol_}) (set state to POS-S2, keep _topsymbol_ on the stack).
- (NEG-S1, HEADS, _topsymbol_) &rarr; (NEG-S2, {_topsymbol_}).
- (POS-S1, TAILS, EMPTY) &rarr; (ONE, {}) (set state to ONE, pop the top symbol from the stack).
- (NEG-S1, TAILS, EMPTY) &rarr; (ONE, {}).
- (POS-S1, TAILS, X) &rarr; (ZERO, {}).
- (NEG-S1, TAILS, X) &rarr; (ZERO, {}).
- (ZERO, _flip_, _topsymbol_) &rarr; (ZERO, {}).
- (POS-S2, _flip_, _topsymbol_) &rarr; Add enough transition rules to the automaton to simulate _g_(_&lambda;_) by a finite-state machine (only possible if _g_ is rational with rational coefficients (Mossel and Peres 2005)<sup>[**(11)**](#Note11)</sup>).  Transition to POS-S2-ZERO if the machine outputs 0, or POS-S2-ONE if the machine outputs 1.
- (NEG-S2, _flip_, _topsymbol_) &rarr; Same as before, but the transitioning states are NEG-S2-ZERO and NEG-S2-ONE, respectively.
- (POS-S2-ONE, _flip_, _topsymbol_) &rarr; (POS-S1, {_topsymbol_, X}) (replace top stack symbol with _topsymbol_, then push X to the stack).
- (POS-S2-ZERO, _flip_, EMPTY) &rarr; (NEG-S1, {EMPTY, X}).
- (POS-S2-ZERO, _flip_, X) &rarr; (POS-S1, {}).
- (NEG-S2-ZERO, _flip_, _topsymbol_) &rarr; (NEG-S1, {_topsymbol_, X}).
- (NEG-S2-ONE, _flip_, EMPTY) &rarr; (POS-S1, {EMPTY, X}).
- (NEG-S2-ONE, _flip_, X) &rarr; (NEG-S1, {}).

The machine stops when it removes EMPTY from the stack, and the result is either ZERO (0) or ONE (1).

For the following algorithm, which extends the end of Note 1 of the Flajolet paper, the probability is&mdash;

- _f_(_&lambda;_) = (1 &minus; _&lambda;_) \* &sum;<sub>_n_=0,1,...</sub> _&lambda;_<sup>_H_\*_n_</sup>\*_g_(_&lambda;_)<sup>_n_</sup>\*(1 &minus; _g_(_&lambda;_))<sup>(_H_&minus;1)\*_n_</sup>\*choose(_H_\*_n_, _n_),

where _H_ &ge; 2 is an integer, and _g_ has the same meaning as earlier.

1. Set _d_ to 0.
2. Do the following process repeatedly until this run of the algorithm returns a value:
    1. Flip the input coin.  If it returns 1, go to the next substep.  Otherwise, return either 1 if _d_ is 0, or 0 otherwise.
    2. Run a Bernoulli factory algorithm for _g_(_&lambda;_).  If the run returns 1, add (_H_&minus;1) to _d_.  Otherwise, subtract 1 from _d_.  (Note: This substep is not done again.)

The following algorithm simulates the probability&mdash;

- _f_(_&lambda;_) = (1 &minus; _&lambda;_) \* &sum;<sub>_n_=0,1,...</sub> _&lambda;_<sup>_n_</sup>\* (&sum;<sub>_m_=0,1,...,_n_</sub> _W_(_n_, _m_)\*_g_(_&lambda;_)<sup>_m_</sup>\*(1 &minus; _g_(_&lambda;_))<sup>_n_&minus;_m_</sup>\*choose(_n_, _m_))<br>&nbsp;&nbsp;&nbsp;= (1 &minus; _&lambda;_) \* &sum;<sub>_n_=0,1,...</sub> _&lambda;_<sup>_n_</sup>\* (&sum;<sub>_m_=0,1,...,_n_</sub> _V_(_n_, _m_)\*_g_(_&lambda;_)<sup>_m_</sup>\*(1 &minus; _g_(_&lambda;_))<sup>_n_&minus;_m_</sup>),

where _g_ has the same meaning as earlier; _W_(_n_, _m_) is 1 if _m_\*_H_ equals (_n_&minus;_m_)\*_T_, or 0 otherwise; and _H_&ge;1 and _T_&ge;1 are integers. (In the first formula, the sum in parentheses is a polynomial in Bernstein form, in the variable _g_(_&lambda;_) and with only zeros and ones as coefficients.  Because of the _&lambda;_<sup>_n_</sup>, the polynomial gets smaller as _n_ gets larger.  _V_(_n_, _m_) is the number of _n_-letter words that have _m_ heads _and_ describe a walk that ends at the beginning.)

1. Set _d_ to 0.
2. Do the following process repeatedly until this run of the algorithm returns a value:
    1. Flip the input coin.  If it returns 1, go to the next substep.  Otherwise, return either 1 if _d_ is 0, or 0 otherwise.
    2. Run a Bernoulli factory algorithm for _g_(_&lambda;_).  If the run returns 1 ("heads"), add _H_ to _d_.  Otherwise ("tails"), subtract _T_ from _d_.  (Note: This substep is not done again.)

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
    3. For each PSRN, optionally do the following: Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), set that PSRN's sign to negative. (This will result in a symmetric shape in the corresponding dimension.  This step can be done for some PSRNs and not others.)
    4. Return the PSRNs _p1_, ..., _pN_, in that order.
6. If the result of **InShape** is _NO_, then the current box lies outside the shape and is rejected.  In this case, go to step 2.
7. If the result of **InShape** is _MAYBE_, it is not known whether the current box lies fully inside or fully outside the shape, so multiply _S_ by _base_, then add 1 to _d_, then go to step 3.

> **Notes:**
>
> 1. See (Li and El Gamal 2016)<sup>[**(13)**](#Note13)</sup> and (Oberhoff 2018)<sup>[**(14)**](#Note14)</sup> for related work on encoding random points uniformly distributed in a shape.
> 2. Rejection sampling on a shape is subject to the "curse of dimensionality", since typical shapes of high dimension will tend to cover much less volume than their bounding boxes, so that it would take a lot of time on average to accept a high-dimensional box.  Moreover, the more area the shape takes up in the bounding box, the higher the acceptance rate.
> 3. Devroye (1986, chapter 8, section 3)<sup>[**(15)**](#Note15)</sup> describes grid-based methods to optimize random point generation.  In this case, the space is divided into a grid of boxes each with size 1/_base_<sup>_k_</sup> in all dimensions; the result of **InShape** is calculated for each such box and that box labeled with the result; all boxes labeled _NO_ are discarded; and the algorithm is modified by adding the following after step 2: "2a. Choose a precalculated box uniformly at random, then set _c1_, ..., _cN_ to that box's coordinates, then set _d_ to _k_ and set _S_ to _base_<sup>_k_</sup>. If a box labeled _YES_ was chosen, follow the substeps in step 5. If a box labeled _MAYBE_ was chosen, multiply _S_ by _base_ and add 1 to _d_." (For example, if _base_ is 10, _k_ is 1, _N_ is 2, and _d1_ = _d2_ = 1, the space could be divided into a 10&times;10 grid, made up of 100 boxes each of size (1/10)&times;(1/10).  Then, **InShape** is precalculated for the box with coordinates ((0, 0), (1, 1)), the box ((0, 1), (1, 2)), and so on \[the boxes' coordinates are stored as just given, but **InShape** instead uses those coordinates divided by _base_<sup>_k_</sup>, or 10<sup>1</sup> in this case\], each such box is labeled with the result, and boxes labeled _NO_ are discarded.  Finally the algorithm above is modified as just given.)
> 4. Besides a grid, another useful data structure is a _mapped regular paving_ (Harlow et al. 2012)<sup>[**(16)**](#Note16)</sup>, which can be described as a binary tree with nodes each consisting of zero or two child nodes and a marking value.  Start with a box that entirely covers the desired shape.  Calculate **InShape** for the box.  If it returns _YES_ or _NO_ then mark the box with _YES_ or _NO_, respectively; otherwise it returns _MAYBE_, so divide the box along its first widest coordinate into two sub-boxes, set the parent box's children to those sub-boxes, then repeat this process for each sub-box (or if the nesting level is too deep, instead mark each sub-box with _MAYBE_).  Then, to generate a random point (with a base-2 fractional part), start from the root, then: (1) If the box is marked _YES_, return a uniform random point between the given coordinates using the **RandUniformInRange** algorithm; or (2) if the box is marked _NO_, start over from the root; or (3) if the box is marked _MAYBE_, get the two child boxes bisected from the box, choose one of them with equal probability (e.g., choose the left child if an unbiased random bit is 0, or the right child otherwise), mark the chosen child with the result of **InShape** for that child, and repeat this process with that child; or (4) the box has two child boxes, so choose one of them with equal probability and repeat this process with that child.
> 5. The algorithm can be adapted to return 1 with probability equal to its acceptance rate (which equals the shape's volume divided by the hyperrectangle's volume), and return 0 with the opposite probability.  In this case, replace steps 5 and 6 with the following: "5. If the result of **InShape** is _YES_, return 1.; 6. If the result of **InShape** is _NO_, return 0." (I thank BruceET of the Cross Validated community for leading me to this insight.)
>
> **Examples:**
>
> - The following example generates a point inside a quarter diamond (centered at (0, ..., 0), "radius" _k_ where _k_ is an integer greater than 0): Let _d1_, ..., _dN_ be _k_. Let **InShape** return _YES_ if ((_c1_+1) + ... + (_cN_+1)) < _S_\*_k_; _NO_ if (_c1_ + ... + _cN_) > _S_\*_k_; and _MAYBE_ otherwise.  For _N_=2, the acceptance rate (see note 5) is 1/2.  For a full diamond, step 5.3 in the algorithm is done for each of the _N_ dimensions.
> - The following example generates a point inside a quarter hypersphere (centered at (0, ..., 0), radius _k_ where _k_ is an integer greater than 0): Let _d1_, ..., _dN_ be _k_. Let **InShape** return _YES_ if ((_c1_+1)<sup>2</sup> + ... + (_cN_+1)<sup>2</sup>) < (_S_\*_k_)<sup>2</sup>; _NO_ if (_c1_<sup>2</sup> + ... + _cN_<sup>2</sup>) > (_S_\*_k_)<sup>2</sup>; and _MAYBE_ otherwise.  For _N_=2, the acceptance rate (see note 5) is _&pi;_/4. For a full hypersphere with radius 1, step 5.3 in the algorithm is done for each of the _N_ dimensions.  In the case of a 2-dimensional disk, this algorithm thus adapts the well-known rejection technique of generating X and Y coordinates until X<sup>2</sup>+Y<sup>2</sup> < 1 (e.g., (Devroye 1986, p. 230 et seq.)<sup>[**(15)**](#Note15)</sup>).
> - The following example generates a point inside a quarter _astroid_ (centered at (0, ..., 0), radius _k_ where _k_ is an integer greater than 0): Let _d1_, ..., _dN_ be _k_. Let **InShape** return _YES_ if ((_sk_&minus;_c1_&minus;1)<sup>2</sup> + ... + (_sk_&minus;_cN_&minus;1)<sup>2</sup>) > _sk_<sup>2</sup>; _NO_ if ((_sk_&minus;_c1_)<sup>2</sup> + ... + (_sk_&minus;_cN_)<sup>2</sup>) < _sk_<sup>2</sup>; and _MAYBE_ otherwise, where _sk_ = _S_\*_k_.  For _N_=2, the acceptance rate (see note 5) is 1 &minus; _&pi;_/4. For a full astroid, step 5.3 in the algorithm is done for each of the _N_ dimensions.

<a id=Building_an_Arbitrary_Precision_Sampler></a>
### Building an Arbitrary-Precision Sampler

If a continuous distribution&mdash;

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

Examples of algorithms that use this skeleton are the algorithm for the [**ratio of two uniform random variates**](https://peteroupc.github.io/uniformsum.html), as well as the algorithms for the Rayleigh distribution and for the reciprocal of power of uniform, both given later.

Perhaps the most difficult part of describing an arbitrary-precision sampler with this skeleton is finding the appropriate Bernoulli factory for the probabilities _A_, _B_, and _C_, especially when these probabilities have a non-trivial symbolic form.

> **Note:** The algorithm skeleton uses ideas similar to the inversion-rejection method described in (Devroye 1986, ch. 7, sec. 4.6)<sup>[**(15)**](#Note15)</sup>; an exception is that instead of generating a uniform random variate and comparing it to calculations of a CDF, this algorithm uses conditional probabilities of choosing a given piece, probabilities labeled _A_ and _B_.  This approach was taken so that the CDF of the distribution in question is never directly calculated in the course of the algorithm, which furthers the goal of sampling with arbitrary precision and without using floating-point arithmetic.

<a id=Mixtures></a>
### Mixtures

A _mixture_ involves sampling one of several distributions, where each distribution has a separate probability of being sampled.  In general, an arbitrary-precision sampler is possible if all of the following conditions are met:

- There is a finite number of distributions to choose from.
- The probability of sampling each distribution is a rational number, or it can be expressed as a function for which a [**Bernoulli factory algorithm**](https://peteroupc.github.io/bernoulli.html) exists.
- For each distribution, an arbitrary-precision sampler exists.

> **Example:** One example of a mixture is two beta distributions, with separate parameters.  One beta distribution is chosen with probability exp(&minus;3) (a probability for which a Bernoulli factory algorithm exists) and the other is chosen with the opposite probability.  For the two beta distributions, an arbitrary-precision sampling algorithm exists (see my article on [**partially-sampled random numbers (PSRNs)**](https://peteroupc.github.io/exporand.html) for details).

<a id=Weighted_Choice_Involving_PSRNs></a>
### Weighted Choice Involving PSRNs

Given _n_ uniform PSRNs, called _weights_, with labels starting from 0 and ending at _n_&minus;1, the following algorithm chooses an integer in [0, _n_) with probability proportional to its weight.  Each weight's sign must be positive.

1. Create an empty list, then for each weight starting with weight 0, add the weight's integer part plus 1 to that list.  For example, if the weights are [2.22...,0.001...,1.3...], in that order, the list will be [3, 1, 2], corresponding to integers 0, 1, and 2, in that order.  Call the list just created the _rounded weights list_.
2. Choose an integer _i_ with probability proportional to the weights in the rounded weights list.  This can be done, for example, by taking the result of **WeightedChoice**(_list_), where _list_ is the rounded weights list and **WeightedChoice** is given in "[**Randomization and Samping Methods**](https://peteroupc.github.io/randomfunc.html#Weighted_Choice_With_Replacement)".
3. Run **URandLessThanReal**(_w_, _rw_), where _w_ is the original weight for integer _i_, and _rw_ is the rounded weight for integer _i_ in the rounded weights list.  That algorithm returns 1 if _w_ turns out to be less than _rw_.  If the result is 1, return _i_.  Otherwise, go to step 2.

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
5. (At this point, we simulate exp(&minus;_U_<sup>2</sup>/_y_), exp(&minus;_k_<sup>2</sup>/_y_) , exp(&minus;_U_\*_k_\*2/_y_), as well as a scaled-down version of _U_ + _k_, where _U_ is the number built up by the uniform PSRN.) Call the **exp(&minus;_x_/_y_) algorithm** with _x_/_y_ = _ky_, then call the **exp(&minus;(_&lambda;_<sup>_k_</sup> * _x_)) algorithm** using the input coin from step 2, _x_ = 1/_y_, and _k_ = 2, then call the first or third algorithm for **exp(&minus;(_&lambda;_<sup>_k_</sup> \* _c_))** using the same input coin, _c_ = floor(_k_ * 2 / _y_), and _k_ = 1, then call the **sub-algorithm** given later with the uniform PSRN and _k_ = _k_.  If all of these calls return 1, the uniform PSRN was accepted.  Otherwise, remove all digits from the uniform PSRN's fractional part and go to step 4.
7. If the uniform PSRN, call it _ret_, was accepted by step 5, set _ret_'s integer part to _k_, then optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), and return _ret_.

The sub-algorithm below simulates a probability equal to (_U_+_k_)/_base_<sup>_z_</sup>, where _U_ is the number built by the uniform PSRN, _base_ is the base (radix) of digits stored by that PSRN, _k_ is an integer 0 or greater, and _z_ is the number of significant digits in _k_ (for this purpose, _z_ is 0 if _k_ is 0).

For base 2:

1.  Set _N_ to 0.
2.  Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), go to the next step.  Otherwise, add 1 to _N_ and repeat this step.
3.  If _N_ is less than _z_, return rem(_k_ / 2<sup>_z_ &minus; 1 &minus; _N_</sup>, 2).  (Alternatively, shift _k_ to the right, by _z_ &minus; 1 &minus; _N_ bits, then return _k_ _AND_ 1, where "_AND_" is a bitwise AND-operation.)
4.  Subtract _z_ from _N_.  Then, if the item at position _N_ in the uniform PSRN's fractional part (positions start at 0) is not set to a digit (e.g., 0 or 1 for base 2), set the item at that position to a digit chosen uniformly at random (e.g., either 0 or 1 for base 2), increasing the capacity of the uniform PSRN's fractional part as necessary.
4.  Return the item at position _N_.

For bases other than 2, such as 10 for decimal, this can be implemented as follows (based on **URandLess**):

1. Set _i_ to 0.
2. If _i_ is less than _z_:
    1. Set _da_ to rem(_k_ / 2<sup>_z_ &minus; 1 &minus; _i_</sup>, _base_), and set _db_ to a digit chosen uniformly at random (that is, an integer in the interval [0, _base_)).
    2. Return 1 if _da_ is less than _db_, or 0 if _da_ is greater than _db_.
3. If _i_ is _z_ or greater:
    1. If the digit at position (_i_ &minus; _z_) in the uniform PSRN's fractional part is not set, set the item at that position to a digit chosen uniformly at random (positions start at 0 where 0 is the most significant digit after the point, 1 is the second most significant, etc.).
    2. Set _da_ to the item at that position, and set _db_ to a digit chosen uniformly at random (that is, an integer in the interval [0, _base_)).
    3. Return 1 if _da_ is less than _db_, or 0 if _da_ is greater than _db_.
4. Add 1 to _i_ and go to step 3.

<a id=Hyperbolic_Secant_Distribution></a>
### Hyperbolic Secant Distribution

The following algorithm adapts the rejection algorithm from p. 472 in (Devroye 1986)<sup>[**(15)**](#Note15)</sup> for arbitrary-precision sampling.

1. Generate _ret_, an exponential random variate with a rate of 1 via the **ExpRand** or **ExpRand2** algorithm described in my article on [**PSRNs**](https://peteroupc.github.io/exporand.html).  This number will be a uniform PSRN.
2. Set _ip_ to 1 plus _ret_'s integer part.
3. (The rest of the algorithm accepts _ret_ with probability 1/(1+_ret_).) With probability _ip_/(1+_ip_), generate a number that is 1 with probability 1/_ip_ and 0 otherwise.  If that number is 1, _ret_ was accepted, in which case optionally fill it with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then set _ret_'s sign to positive or negative with equal probability, then return _ret_.
4. Call **SampleGeometricBag** on _ret_'s fractional part (ignore _ret_'s integer part and sign).  If the call returns 1, go to step 1.  Otherwise, go to step 3.

<a id=Reciprocal_of_Power_of_Uniform></a>
### Reciprocal of Power of Uniform

The following algorithm generates a PSRN of the form 1/_U_<sup>1/_x_</sup>, where _U_ is a uniform random variate in [0, 1] and _x_ is an integer greater than 0.

1. Set _intval_ to 1 and set _size_ to 1.
2. With probability (4<sup>_x_</sup>&minus;2<sup>_x_</sup>)/4<sup>_x_</sup>, go to step 3.  Otherwise, add _size_ to _intval_, then multiply _size_ by 2, then repeat this step.
3. Generate an integer in the interval [_intval_, _intval_ + _size_) uniformly at random, call it _i_.
4. Create a positive-sign zero-integer-part uniform PSRN, _ret_.
5. Create an input coin that calls **SampleGeometricBag** on the PSRN _ret_.  Call the **algorithm for _d_<sup>_k_</sup> / (_c_ + _&lambda;_)<sup>_k_</sup>** in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", using the input coin, where _d_ = _intval_, _c_ = _i_, and _k_ = _x_ + 1 (here, _&lambda;_ is the probability built up in _ret_ via **SampleGeometricBag**, and lies in the interval \[0, 1\]).  If the call returns 0, go to step 3.
6. The PSRN _ret_ was accepted, so set _ret_'s integer part to _i_, then optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _ret_.

This algorithm uses the skeleton described earlier in "Building an Arbitrary-Precision Sampler".  Here, the probabilities _A_, _B_,  and _C_ are as follows:

- _A_ = 0, since the random variate can't lie in the interval [0, 1).
- _B_ = (4<sup>_x_</sup>&minus;2<sup>_x_</sup>)/4<sup>_x_</sup>.
- _C_ = (_x_/(_i_ + _&lambda;_)<sup>_x_+1</sup>) / _M_.  Ideally, _M_ is either _x_ if _intval_ is 1, or _x_/_intval_<sup>_x_+1</sup> otherwise.  Thus, the ideal form for _C_ is _intval_<sup>_x_+1</sup>/(_i_+_&lambda;_)<sup>_x_+1</sup>.

<a id=Distribution_of__U__1_minus__U></a>
### Distribution of _U_/(1&minus;_U_)

The following algorithm generates a PSRN distributed as _U_/(1&minus;_U_), where _U_ is a uniform random variate in [0, 1].

1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), set _intval_ to 0, then set _size_ to 1, then go to step 4.
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

Here we reimplement an example from Devroye's book _Non-Uniform Random Variate Generation_ (Devroye 1986, pp. 128&ndash;129)<sup>[**(15)**](#Note15)</sup>.  The following arbitrary-precision sampler generates a random variate from a distribution with the following cumulative distribution function (CDF): `1 - cos(pi*x/2).`  The random variate will be in the interval [0, 1].  This algorithm's result is the same as applying acos(_U_)*2/&pi;, where _U_ is a uniform \[0, 1\] random variate, as pointed out by Devroye.  The algorithm follows.

1. Call the **kthsmallest** algorithm with `n = 2` and `k = 2`, but without filling it with digits at the last step.  Let _ret_ be the result.
2. Set _m_ to 1.
3. Call the **kthsmallest** algorithm with `n = 2` and `k = 2`, but without filling it with digits at the last step.  Let _u_ be the result.
4. With probability 4/(4\*_m_\*_m_ + 2\*_m_), call the **URandLess** algorithm with parameters _u_ and _ret_ in that order, and if that call returns 1, call the **algorithm for &pi; / 4**, described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", twice, and if both of these calls return 1, add 1 to _m_ and go to step 3.  (Here, we incorporate an erratum in the algorithm on page 129 of the book.)
5. If _m_ is odd, optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits  (similarly to **FillGeometricBag**), and return _ret_.
6. If _m_ is even, go to step 1.

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
### Logistic Distribution

The following new algorithm generates a partially-sampled random number that follows the logistic distribution.

1. Set _k_ to 0.
2. (Choose a 1-unit-wide piece of the logistic density.) Run the **algorithm for (1+exp(_k_))/(1+exp(_k_+1))** described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)").  If the call returns 0, add 1 to _k_ and repeat this step.  Otherwise, go to step 3.
3. (The rest of the algorithm samples from the chosen piece.) Generate a uniform(0, 1) random variate, call it _f_.
4. (Steps 4 through 7 succeed with probability exp(&minus;(_f_+_k_))/(1+exp(&minus;(_f_+_k_)))<sup>2</sup>.) Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), go to step 3.
5. Run the **algorithm for exp(&minus;_k_/1)** (described in "Bernoulli Factory Algorithms"), then **sample from the number _f_** (e.g., call **SampleGeometricBag** on _f_ if _f_ is implemented as a uniform PSRN).  If any of these calls returns 0, go to step 4.
6. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), accept _f_.  If _f_ is accepted this way, set _f_'s integer part to _k_, then optionally fill _f_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then set _f_'s sign to positive or negative with equal probability, then return _f_.
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

Exponential random variates can be generated using an input coin of unknown probability of heads of _&lambda;_ (which can be in the interval (0, 1]), by generating arrival times in a _Poisson process_ of rate 1, then _thinning_ the process using the coin.  The arrival times that result will be exponentially distributed with rate _&lambda;_.  I found the basic idea in the answer to a [**Mathematics Stack Exchange question**](https://math.stackexchange.com/questions/3362473/simulating-an-exponential-random-variable-given-bernoulli-uniform), and thinning of Poisson processes is discussed, for example, in Devroye (1986, chapter six)<sup>[**(15)**](#Note15)</sup>.  The algorithm follows:

1. Generate an exponential(1) random variate using the **ExpRand** or **ExpRand2** algorithm (with _&lambda;_ = 1), call it _ex_.
2. (Thinning step.) Flip the input coin.  If it returns 1, return _ex_.
3. Generate another exponential(1) random variate using the **ExpRand** or **ExpRand2** algorithm (with _&lambda;_ = 1), call it _ex2_.  Then run **UniformAdd** on _ex_ and _ex2_ and set _ex_ to the result.  Then go to step 2.

Notice that the algorithm's average running time increases as _&lambda;_ decreases.

<a id=Exponential_Distribution_with_Rate_ln__x></a>
### Exponential Distribution with Rate ln(_x_)

The following new algorithm generates a partially-sampled random number that follows the exponential distribution with rate ln(_x_).  This is useful for generating a base-_x_ logarithm of a uniform(0,1) random variate.  This algorithm has two supported cases:

- _x_ is a rational number that's greater than 1.  In that case, let _b_ be floor(ln(_x_)/ln(2)).
- _x_ is a uniform PSRN with a positive sign and an integer part of 1 or greater.  In that case, let _b_ be floor(ln(_i_)/ln(2)), where _i_ is _x_'s integer part.

The algorithm follows.

1. (Samples the integer part of the random variate.) Generate a number that is 1 with probability 1/_x_ and 0 otherwise, repeatedly until a zero is generated this way.  Set _k_ to the number of ones generated this way. (This is also known as a "geometric random variate", but this terminology is avoided because it has conflicting meanings in academic works.)
    - If _x_ is a rational number and a power of 2, this step can be implemented by generating blocks of _b_ unbiased random bits until a **non-zero** block of bits is generated this way, then setting _k_ to the number of **all-zero** blocks of bits generated this way.
    - If _x_ is a uniform PSRN, this step is implemented as follows: Run the first subalgorithm (later in this section) repeatedly until a run returns 0.  Set _k_ to the number of runs that returned 1 this way.
2. (The rest of the algorithm samples the fractional part.) Create _f_, a uniform PSRN with a positive sign, an empty fractional part, and an integer part of 0.
3. Create a _&mu;_ input coin that does the following: "**Sample from the number _f_** (e.g., call **SampleGeometricBag** on _f_ if _f_ is implemented as a uniform PSRN), then run the **algorithm for ln(1+_y_/_z_)** (given in "Bernoulli Factory Algorithms") with _y_/_z_ = 1/1.  If both calls return 1, return 1.  Otherwise, return 0." (This simulates the probability _&lambda;_ = _f_\*ln(2).)   Then:
    - If _x_ is a rational number, but not a power of 2, also create a _&nu;_ input coin that does the following: "**Sample from the number _f_**, then run the **algorithm for ln(1 + _y_/_z_)** with _y_/_z_ = (_x_&minus;2<sup>_b_</sup>)/2<sup>_b_</sup>.  If both calls return 1, return 1.  Otherwise, return 0."
    - If _x_ is a uniform PSRN, also create a _&rho;_ input coin that does the following: "Return the result of the second subalgorithm (later in this section), given _x_ and _b_", and a _&nu;_ input coin that does the following: "**Sample from the number _f_**, then run the **algorithm for ln(1 + _&lambda;_)**, using the _&rho;_ input coin.  If both calls return 1, return 1.  Otherwise, return 0."
4. Run the **algorithm for exp(&minus;_&lambda;_)** (described in "Bernoulli Factory Algorithms") _b_ times, using the _&mu;_ input coin.  If a _&nu;_ input coin was created in step 3, run the same algorithm once, using the _&nu;_ input coin.  If all these calls return 1, accept _f_.  If _f_ is accepted this way, set _f_'s integer part to _k_, then optionally fill _f_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _f_.
5. If _f_ was not accepted by the previous step, go to step 2.

> **Note**: A _bounded exponential_ random variate with rate ln(_x_) and bounded by _m_ has a similar algorithm to this one.  Step 1 is changed to read as follows: "Do the following _m_ times or until a zero is generated, whichever happens first: 'Generate a number that is 1 with probability 1/_x_ and 0 otherwise'. Then set _k_ to the number of ones generated this way. (_k_ is a so-called bounded-geometric(1&minus;1/_x_, _m_) random variate, which an algorithm of Bringmann and Friedrich (2013)<sup>[**(17)**](#Note17)</sup> can generate as well.  If _x_ is a power of 2, this can be implemented by generating blocks of _b_ unbiased random bits until a **non-zero** block of bits or _m_ blocks of bits are generated this way, whichever comes first, then setting _k_ to the number of **all-zero** blocks of bits generated this way.) If _k_ is _m_, return _m_ (this _m_ is a constant, not a uniform PSRN; if the algorithm would otherwise return a uniform PSRN, it can return something else in order to distinguish this constant from a uniform PSRN)."  Additionally, instead of generating a uniform(0,1) random variate in step 2, a uniform(0,_&mu;_) random variate can be generated instead, such as a uniform PSRN generated via **RandUniformFromReal**, to implement an exponential distribution bounded by _m_+_&mu;_ (where _&mu;_ is a real number in the interval (0, 1)).

The following generator for the **rate ln(2)** is a special case of the previous algorithm and is useful for generating a base-2 logarithm of a uniform(0,1) random variate. Unlike the similar algorithm of Ahrens and Dieter (1972)<sup>[**(18)**](#Note18)</sup>, this one doesn't require a table of probability values.

1. (Samples the integer part of the random variate.  This will be geometrically distributed with parameter 1/2.) Generate unbiased random bits until a zero is generated this way.  Set _k_ to the number of ones generated this way.
2. (The rest of the algorithm samples the fractional part.) Generate a uniform (0, 1) random variate, call it _f_.
3. Create an input coin that does the following: "**Sample from the number _f_** (e.g., call **SampleGeometricBag** on _f_ if _f_ is implemented as a uniform PSRN), then run the **algorithm for ln(1+_y_/_z_)** (given in "Bernoulli Factory Algorithms") with _y_/_z_ = 1/1.  If both calls return 1, return 1.  Otherwise, return 0." (This simulates the probability _&lambda;_ = _f_\*ln(2).)
4. Run the **algorithm for exp(&minus;_&lambda;_)** (described in "Bernoulli Factory Algorithms"), using the input coin from the previous step.  If the call returns 1, accept _f_.  If _f_ is accepted this way, set _f_'s integer part to _k_, then optionally fill _f_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _f_.
5. If _f_ was not accepted by the previous step, go to step 2.

The first subalgorithm samples the probability 1/_x_, where _x_&ge;1 is a uniform PSRN:

1. Set _c_ to _x_'s integer part.  With probability _c_ / (1 + _c_), return a number that is 1 with probability 1/_c_ and 0 otherwise.
2. Run **SampleGeometricBag** on _x_ (which ignores _x_'s integer part and sign).  If the run returns 1, return 0.  Otherwise, go to step 1.

The second subalgorithm samples the probability (_x_&minus;2<sup>_b_</sup>)/2<sup>_b_</sup>, where _x_&ge;1 is a uniform PSRN and _b_&ge;0 is an integer:

1. Subtract 2<sup>_b_</sup> from _x_'s integer part, then create _y_ as **RandUniformFromReal**(2<sup>_b_</sup>), then run **URandLessThanReal**(_x_, _y_), then add 2<sup>_b_</sup> back to _x_'s integer part.
2. Return the result of **URandLessThanReal** from step 1.

<a id=Symmetric_Geometric_Distribution></a>
### Symmetric Geometric Distribution

Samples from the symmetric geometric distribution from (Ghosh et al. 2012)<sup>[**(19)**](#Note19)</sup>, with parameter _&lambda;_, in the form of an input coin with unknown probability of heads of _&lambda;_.

1. Flip the input coin until it returns 0.  Set _n_ to the number of times the coin returned 1 this way.
2. Run a **Bernoulli factory algorithm for 1/(2&minus;_&lambda;_)**, using the input coin.  If the run returns 1, return _n_.  Otherwise, return &minus;1 &minus; _n_.

This is similar to an algorithm mentioned in an appendix in Li (2021)<sup>[**(20)**](#Note20)</sup>, in which the input coin&mdash;

- has _&lambda;_ = 1&minus;exp(&minus;_&epsilon;_), and
- can be built as follows using another input coin with probability of heads _&epsilon;_: "Run a **Bernoulli factory algorithm for exp(&minus;_&lambda;_)** using the _&epsilon;_ input coin, then return 1 minus the result."

<a id=Lindley_Distribution_and_Lindley_Like_Mixtures></a>
### Lindley Distribution and Lindley-Like Mixtures

A random variate that follows the Lindley distribution (Lindley 1958)<sup>[**(21)**](#Note21)</sup> with parameter _&theta;_ (a real number greater than 0) can be generated as follows:

1. With probability _w_ = _&theta;_/(1+_&theta;_), generate an exponential random variate with a rate of _&theta;_ via **ExpRand** or **ExpRand2** (described in my article on PSRNs) and return that number.
2. Otherwise, generate two exponential random variates with a rate of _&theta;_ via **ExpRand** or **ExpRand2**, then generate their sum by applying the **UniformAdd** algorithm, then return that sum.

For the Garima distribution (Shanker 2016)<sup>[**(22)**](#Note22)</sup>, _w_ = (1+_&theta;_)/(2+_&theta;_).

For the i-Garima distribution (Singh and Das 2020)<sup>[**(23)**](#Note23)</sup>, _w_ = (2+_&theta;_)/(3+_&theta;_).

For the mixture-of-weighted-exponential-and-weighted-gamma distribution in (Iqbal and Iqbal 2020)<sup>[**(24)**](#Note24)</sup>, two exponential random variates (rather than one) are generated in step 1, and three (rather than two) are generated in step 2.

> **Note:** If _&theta;_ is a uniform PSRN, then the check "With probability  _w_ = _&theta;_/(1+_&theta;_)" can be implemented by running the Bernoulli factory algorithm for **(_d_ + _&mu;_) / ((_d_ + _&mu;_) + (_c_ + _&lambda;_))**, where _c_ is 1; _&lambda;_ represents an input coin that always returns 0; _d_ is _&theta;_'s integer part, and _&mu;_ is an input coin that runs **SampleGeometricBag** on _&theta;_'s fractional part.  The check succeeds if the Bernoulli factory algorithm returns 1.

<a id=Gamma_Distribution></a>
### Gamma Distribution

The path to building an arbitrary-precision gamma sampler makes use of two algorithms: one for integer parameters of _a_, and another for rational parameters of _a_ in [0, 1).  Both algorithms can be combined into an arbitrary-precision gamma generator for rational parameters _a_>0.

First is an arbitrary-precision sampler for the sum of _n_ independent exponential random variates (also known as the Erlang(_n_) or gamma(_n_) distribution), implemented via partially-sampled uniform random variates.  Obviously, this algorithm is inefficient for large values of _n_.

1. Generate _n_ exponential random variates with a rate of 1 via the **ExpRand** or **ExpRand2** algorithm described in my article on [**partially-sampled random numbers (PSRNs)**](https://peteroupc.github.io/exporand.html).  These numbers will be uniform PSRNs; this algorithm won't work for exponential PSRNs (e-rands), described in the same article, because the sum of two e-rands may follow a subtly wrong distribution.  By contrast, generating exponential random variates via rejection from the uniform distribution will allow unsampled digits to be sampled uniformly at random without deviating from the exponential distribution.
2. Generate the sum of the random variates generated in step 1 by applying the [**UniformAdd**](https://peteroupc.github.io/exporand.html#Addition_and_Subtraction) algorithm given in another document.

The second algorithm takes a parameter _a_, which must be a rational number in the interval (0, 1].  Adapted from Berman's gamma generator, as given in Devroye 1986, p. 419.  Because of the power-of-uniform sub-algorithm this algorithm works only if the PSRN's fractional digits are binary (zeros or ones).

1. Create a positive-sign zero-integer-part uniform PSRN, _ret_.  If _a_ is 1, instead generate an exponential random variate with a rate of 1 via the **ExpRand** or
**ExpRand2** algorithm and return that variate.
2. Generate a PSRN _ret_ using the **power-of-uniform sub-algorithm** (in the page on PSRNs) with _px_/_py_ = 1/_a_.
3. (The following two steps succeed with probability (1&minus;_ret_)<sup>1&minus;_a_</sup>.)  Create an input coin that does the following: "Flip the input coin and return 1 minus the result."
4. Run the **algorithm for _&lambda;_<sup>_x_/_y_</sup>** with _x_/_y_ = 1&minus;_a_, using the input coin from step 3.  If the run returns 0, go to step 1.
5. (At this point, _ret_ is distributed as beta(_a_, 2 &minus; _a_).)  Generate two exponential random variates with a rate of 1 via **ExpRand** or **ExpRand2**, then generate their sum by applying the **UniformAdd** algorithm.  Call the sum _z_.
6. Run the **UniformMultiply** algorithm on _ret_ and _z_, and return the result of that algorithm.

The third algorithm combines both algorithms and works for any rational parameter _a_>0.

1. Let _n_ = floor(_a_).  Generate _ret_, a sum of _n_ exponential variates generated via the first algorithm in this section.  If _n_ = _a_, return _ret_.
2. Let _frac_ be _a_ &minus; floor(_a_).  Generate _ret2_, a gamma variate generated via the second algorithm in this section, with _a_ = _frac_.
3. Run the **UniformAdd** algorithm on _ret_ and _ret2_ and return the result of that algorithm.

<a id=One_Dimensional_Epanechnikov_Kernel></a>
### One-Dimensional Epanechnikov Kernel

Adapted from Devroye and Györfi (1985, p. 236)<sup>[**(25)**](#Note25)</sup>.

1. Generate three empty PSRNs _a_, _b_, and _c_, with a positive sign, an integer part of 0, and an empty fractional part.
2. Run **URandLess** on _a_ and _c_ in that order, then run **URandLess** on _b_ and _c_ in that order.  If both runs return 1, set _c_ to point to _b_.
3. Generate an unbiased random bit.  If that bit is 1 (which will happen with probability 1/2), set _c_'s sign to negative.
4. Return _c_.

<a id=Requests_and_Open_Questions></a>
## Requests and Open Questions

1. We would like to see new implementations of the following:
    - Algorithms that implement **InShape** for specific closed curves, specific closed surfaces, and specific signed distance functions.  Recall that **InShape** determines whether a box lies inside, outside, or partly inside or outside a given curve or surface.
    - Descriptions of new arbitrary-precision algorithms that use the skeleton given in the section "Building an Arbitrary-Precision Sampler".
2. The appendix contains implementation notes for **InShape**, which determines whether a box is outside or partially or fully inside a shape.  However, practical implementations of **InShape** will generally only be able to evaluate a shape pointwise.  What are necessary and/or sufficient conditions that allow an implementation to correctly classify a box just by evaluating the shape pointwise?
3. Take a polynomial _f_(_&lambda;_) of even degree _n_ of the form choose(_n_,_n_/2)\*_&lambda;_<sup>_n_/2</sup>\*(1&minus;_&lambda;_)<sup>_n_/2</sup>\*_k_, where _k_ is greater than 1 (thus all _f_'s Bernstein coefficients are 0 except for the middle one, which equals _k_).  Suppose _f_(1/2) lies in the interval (0, 1).  If we do the degree elevation, described in the appendix, enough times (at least _r_ times), then _f_'s Bernstein coefficients will all lie in [0, 1].  The question is: how many degree elevations are enough?  A [**MathOverflow answer**](https://mathoverflow.net/questions/381419/on-the-degree-elevation-needed-to-bring-bernstein-coefficients-to-0-1) showed that _r_ is at least _m_ = (_n_/_f_(1/2)<sup>2</sup>)/(1&minus;_f_(1/2)<sup>2</sup>), but is it true that floor(_m_)+1 elevations are enough?
4. A [**_finite-state generator_**](https://peteroupc.github.io/morealg.html#Finite_State_and_Pushdown_Generators) is a finite-state machine that generates a real number's base-2 expansion such as 0.110101100..., driven by flips of a coin.  A _pushdown generator_ is a finite-state generator with a stack of memory.  Both generators produce real numbers with a given probability distribution.  For example, a generator with a loop that outputs 0 or 1 at an equal chance produces a _uniform distribution_.  The following questions ask what kinds of distributions are possible with these generators.

    1. Of the probability distributions that a finite-state generator can generate, what is the exact class of:
        - _Discrete distributions_ (those that cover a finite or countably infinite set of values)?
        - _Absolutely continuous distributions_ (those with a probability density function such as the uniform or triangular distribution)?
        - _Singular distributions_ (covering an uncountable but zero-volume set)?
        - Absolutely continuous distributions with _continuous_ density functions?
    2. Same question as 1, but for pushdown generators.
    3. Of the probability distributions that a pushdown generator can generate, what is the exact class of distributions with piecewise smooth density functions?  (The answer is known for finite-state generators.)

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Fishman, D., Miller, S.J., "Closed Form Continued Fraction Expansions of Special Quadratic Irrationals", ISRN Combinatorics Vol. 2013, Article ID 414623 (2013).</small>
- <small><sup id=Note2>(2)</sup> Łatuszyński, K., Kosmidis, I.,  Papaspiliopoulos, O., Roberts, G.O., "[**Simulating events of unknown probabilities via reverse time martingales**](https://arxiv.org/abs/0907.4018v2)", arXiv:0907.4018v2 [stat.CO], 2009/2011.</small>
- <small><sup id=Note3>(3)</sup> choose(_n_, _k_) = (1\*2\*3\*...\*_n_)/((1\*...\*_k_)\*(1\*...\*(_n_&minus;_k_))) =  _n_!/(_k_! * (_n_ &minus; _k_)!) is a _binomial coefficient_, or the number of ways to choose _k_ out of _n_ labeled items.  It can be calculated, for example, by calculating _i_/(_n_&minus;_i_+1) for each integer _i_ in the interval \[_n_&minus;_k_+1, _n_\], then multiplying the results (Yannis Manolopoulos. 2002. "[**Binomial coefficient computation: recursion or iteration?**](https://doi.org/10.1145/820127.820168)", SIGCSE Bull. 34, 4 (December 2002), 65–67).  For every _m_&gt;0, choose(_m_, 0) = choose(_m_, _m_) = 1 and choose(_m_, 1) = choose(_m_, _m_&minus;1) = _m_; also, in this document, choose(_n_, _k_) is 0 when _k_ is less than 0 or greater than _n_.</small>
- <small><sup id=Note4>(4)</sup> It can also be said that the area under the graph of _x_ &minus; floor(1/_x_), where _x_ is in the closed interval [0, 1], equals 1 minus _&gamma;_.  See, for example, Havil, J., _Gamma: Exploring Euler's Constant_, 2003.</small>
- <small><sup id=Note5>(5)</sup> Thomas, A.C., Blanchet, J., "[**A Practical Implementation of the Bernoulli Factory**](https://arxiv.org/abs/1106.2508v3)", arXiv:1106.2508v3  [stat.AP], 2012.</small>
- <small><sup id=Note6>(6)</sup> Nacu, Şerban, and Yuval Peres. "[**Fast simulation of new coins from old**](https://projecteuclid.org/euclid.aoap/1106922322)", The Annals of Applied Probability 15, no. 1A (2005): 93-115.</small>
- <small><sup id=Note7>(7)</sup> Goyal, V. and Sigman, K., 2012. On simulating a class of Bernstein polynomials. ACM Transactions on Modeling and Computer Simulation (TOMACS), 22(2), pp.1-5.</small>
- <small><sup id=Note8>(8)</sup> Jacob, P.E., Thiery, A.H., "On nonnegative unbiased estimators", Ann. Statist., Volume 43, Number 2 (2015), 769-784.</small>
- <small><sup id=Note9>(9)</sup> Duvignau, R., 2015. Maintenance et simulation de graphes aléatoires dynamiques (Doctoral dissertation, Université de Bordeaux).</small>
- <small><sup id=Note10>(10)</sup> There are many distributions that can be sampled using the oracle, by first generating unbiased random bits via randomness extraction methods, but then these distributions won't use the unknown _n_ in general.  Duvignau proved Theorem 5.2 for an oracle that outputs _arbitrary_ but still distinct items, as opposed to integers, but this case can be reduced to the integer case (see section 4.1.3).</small>
- <small><sup id=Note11>(11)</sup> Mossel, Elchanan, and Yuval Peres. New coins from old: computing with unknown bias. Combinatorica, 25(6), pp.707-724, 2005.</small>
- <small><sup id=Note12>(12)</sup> Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560)", arXiv:0906.5560  [math.PR], 2010</small>
- <small><sup id=Note13>(13)</sup> C.T. Li, A. El Gamal, "[**A Universal Coding Scheme for Remote Generation of Continuous Random Variables**](https://arxiv.org/abs/1603.05238v1)", arXiv:1603.05238v1  [cs.IT], 2016</small>
- <small><sup id=Note14>(14)</sup> Oberhoff, Sebastian, "[**Exact Sampling and Prefix Distributions**](https://dc.uwm.edu/etd/1888)", _Theses and Dissertations_, University of Wisconsin Milwaukee, 2018.</small>
- <small><sup id=Note15>(15)</sup> Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.</small>
- <small><sup id=Note16>(16)</sup> Harlow, J., Sainudiin, R., Tucker, W., "Mapped Regular Pavings", _Reliable Computing_ 16 (2012).</small>
- <small><sup id=Note17>(17)</sup> Bringmann, K. and Friedrich, T., 2013, July. "Exact and efficient generation of geometric random variates and random graphs", in _International Colloquium on Automata, Languages, and Programming_ (pp. 267-278).</small>
- <small><sup id=Note18>(18)</sup> Ahrens, J.H., and Dieter, U., "Computer methods for sampling from the exponential and normal distributions", _Communications of the ACM_ 15, 1972.</small>
- <small><sup id=Note19>(19)</sup> Ghosh, A., Roughgarden, T., and Sundararajan, M., "Universally Utility-Maximizing Privacy Mechanisms", _SIAM Journal on Computing_ 41(6), 2012.</small>
- <small><sup id=Note20>(20)</sup> Li, L., 2021. Bayesian Inference on Ratios Subject to Differentially Private Noise (Doctoral dissertation, Duke University).</small>
- <small><sup id=Note21>(21)</sup> Lindley, D.V., "Fiducial distributions and Bayes' theorem", _Journal of the Royal Statistical Society Series B_, 1958.</small>
- <small><sup id=Note22>(22)</sup> Shanker, R., "Garima distribution and its application to model behavioral science data", _Biom Biostat Int J._ 4(7), 2016.</small>
- <small><sup id=Note23>(23)</sup> Singh, B.P., Das, U.D., "[**On an Induced Distribution and its Statistical Properties**](https://arxiv.org/abs/2010.15078)", arXiv:2010.15078 [stat.ME], 2020.</small>
- <small><sup id=Note24>(24)</sup> Iqbal, T. and Iqbal, M.Z., 2020. On the Mixture Of Weighted Exponential and Weighted Gamma Distribution. International Journal of Analysis and Applications, 18(3), pp.396-408.</small>
- <small><sup id=Note25>(25)</sup> Devroye, L., Györfi, L., _Nonparametric Density Estimation: The L1 View_, 1985.</small>
- <small><sup id=Note26>(26)</sup> Kinderman, A.J., Monahan, J.F., "Computer generation of random variables using the ratio of uniform deviates", _ACM Transactions on Mathematical Software_ 3(3), pp. 257-260, 1977.</small>
- <small><sup id=Note27>(27)</sup> Daumas, M., Lester, D., Muñoz, C., "[**Verified Real Number Calculations: A Library for Interval Arithmetic**](https://arxiv.org/abs/0708.3721)", arXiv:0708.3721 [cs.MS], 2007.</small>
- <small><sup id=Note28>(28)</sup> Karney, C.F.F., "[**Sampling exactly from the normal distribution**](https://arxiv.org/abs/1303.6257v2)", arXiv:1303.6257v2  [physics.comp-ph], 2014.</small>
- <small><sup id=Note29>(29)</sup> I thank D. Eisenstat from the _Stack Overflow_ community for leading me to this insight.</small>
- <small><sup id=Note30>(30)</sup> Brassard, G., Devroye, L., Gravel, C., "Remote Sampling with Applications to General Entanglement Simulation", _Entropy_ 2019(21)(92), [**https://doi.org/10.3390/e21010092**](https://doi.org/10.3390/e21010092) .</small>
- <small><sup id=Note31>(31)</sup> Devroye, L., Gravel, C., "[**Random variate generation using only finitely many unbiased, independently and identically distributed random bits**](https://arxiv.org/abs/1502.02539v6)", arXiv:1502.02539v6 [cs.IT], 2020.</small>
- <small><sup id=Note32>(32)</sup> Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.</small>
- <small><sup id=Note33>(33)</sup> Wästlund, J., "[**Functions arising by coin flipping**](http://www.math.chalmers.se/~wastlund/coinFlip.pdf)", 1999.</small>
- <small><sup id=Note34>(34)</sup> Dale, H., Jennings, D. and Rudolph, T., 2015, "Provable quantum advantage in randomness processing", _Nature communications_ 6(1), pp. 1-4.</small>
- <small><sup id=Note35>(35)</sup> Tsai, Yi-Feng, Farouki, R.T., "Algorithm 812: BPOLY: An Object-Oriented Library of Numerical Algorithms for Polynomials in Bernstein Form", _ACM Trans. Math. Softw._ 27(2), 2001.</small>
- <small><sup id=Note36>(36)</sup> Lee, A., Doucet, A. and Łatuszyński, K., 2014. "[**Perfect simulation using atomic regeneration with application to Sequential Monte Carlo**](https://arxiv.org/abs/1407.5770v1)", arXiv:1407.5770v1  [stat.CO].</small>
- <small><sup id=Note37>(37)</sup> Icard, Thomas F., "Calibrating generative models: The probabilistic Chomsky–Schützenberger hierarchy", _Journal of Mathematical Psychology_ 95 (2020): 102308.</small>
- <small><sup id=Note38>(38)</sup> Etessami, K. and Yannakakis, M., "Recursive Markov chains, stochastic grammars, and monotone systems of nonlinear equations", _Journal of the ACM_ 56(1), pp.1-66, 2009.</small>
- <small><sup id=Note39>(39)</sup> Dughmi, Shaddin, Jason Hartline, Robert D. Kleinberg, and Rad Niazadeh. "Bernoulli Factories and Black-box Reductions in Mechanism Design." Journal of the ACM (JACM) 68, no. 2 (2021): 1-30.</small>
- <small><sup id=Note40>(40)</sup> Esparza, J., Kučera, A. and Mayr, R., 2004, July. Model checking probabilistic pushdown automata. In _Proceedings of the 19th Annual IEEE Symposium on Logic in Computer Science_, 2004. (pp. 12-21). IEEE.</small>
- <small><sup id=Note41>(41)</sup> Elder, Murray, Geoffrey Lee, and Andrew Rechnitzer. "Permutations generated by a depth 2 stack and an infinite stack in series are algebraic." _Electronic Journal of Combinatorics_ 22(1), 2015.</small>
- <small><sup id=Note42>(42)</sup> Knuth, Donald E. and Andrew Chi-Chih Yao. "The complexity of nonuniform random variate generation", in _Algorithms and Complexity: New Directions and Recent Results_, 1976.</small>
- <small><sup id=Note43>(43)</sup> Vatan, F., "Distribution functions of probabilistic automata", in _Proceedings of the thirty-third annual ACM symposium on Theory of computing (STOC '01)_, pp. 684-693, 2001.</small>
- <small><sup id=Note44>(44)</sup> Kindler, Guy and D. Romik, "On distributions computable by random walks on graphs," _SIAM Journal on Discrete Mathematics_ 17 (2004): 624-633.</small>
- <small><sup id=Note45>(45)</sup> Vatan (2001) claims that a finite-state generator has a continuous `CDF` (unless it produces a single value with probability 1), but this is not necessarily true if the generator has a state that outputs 0 forever.</small>
- <small><sup id=Note46>(46)</sup> Adamczewski, B., Cassaigne, J. and Le Gonidec, M., 2020. On the computational complexity of algebraic numbers: the Hartmanis–Stearns problem revisited. Transactions of the American Mathematical Society, 373(5), pp.3085-3115.</small>
- <small><sup id=Note47>(47)</sup> Cobham, A., "On the Hartmanis-Stearns problem for a class of tag machines", in _IEEE Conference Record of 1968 Ninth Annual Symposium on Switching and Automata Theory_ 1968.</small>
- <small><sup id=Note48>(48)</sup> Adamczewski, B., Bugeaud, Y., "On the complexity of algebraic numbers I. Expansions in integer bases", _Annals of Mathematics_ 165 (2007).</small>
- <small><sup id=Note49>(49)</sup> Richman, F. (2012). Algebraic functions, calculus style. Communications in Algebra, 40(7), 2671-2683.</small>

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Ratio_of_Uniforms></a>
### Ratio of Uniforms

The Cauchy sampler given earlier demonstrates the _ratio-of-uniforms_ technique for sampling a distribution (Kinderman and Monahan 1977)<sup>[**(26)**](#Note26)</sup>.  It involves transforming the distribution's density function (PDF) into a compact shape.  The ratio-of-uniforms method appears here in the appendix, particularly since it can involve calculating upper and lower bounds of transcendental functions which, while it's possible to achieve in rational arithmetic (Daumas et al., 2007)<sup>[**(27)**](#Note27)</sup>, is less elegant than, say, the normal distribution sampler by Karney (2014)<sup>[**(28)**](#Note28)</sup>, which doesn't require calculating logarithms or other transcendental functions.

This algorithm works for any univariate (one-variable) distribution as long as&mdash;

- for every _x_, _PDF_(_x_) < &infin; and _PDF_(_x_)\*_x_<sup>2</sup> < &infin;, where _PDF_ is the distribution's PDF or a function proportional to the PDF,
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
3. If the shape is given as an inequality of the form _f_(_t1_, ..., _tN_) &le; 0, **InShape** should use rational interval arithmetic (such as the one given in (Daumas et al., 2007)<sup>[**(27)**](#Note27)</sup>), where the two bounds of each interval are rational numbers with arbitrary-precision numerators and denominators.  Then, **InShape** should build one interval for each dimension of the box and evaluate _f_ using those intervals<sup>[**(29)**](#Note29)</sup> with an accuracy that increases as _S_ increases.  Then, **InShape** can return&mdash;
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
7. An **InShape** function can implement a set operation (such as a union, intersection, or difference) of several simpler shapes, each with its own **InShape** function.  The final result depends on the set operation (such as union or intersection) as well as the result returned by each component for a given box.  The following are examples of set operations:
    - For unions, the final result is _YES_ if any component returns _YES_; _NO_ if all components return _NO_; and _MAYBE_ otherwise.
    - For intersections, the final result is _YES_ if all components return _YES_; _NO_ if any component returns _NO_; and _MAYBE_ otherwise.
    - For differences between two shapes, the final result is _YES_ if the first shape returns _YES_ and the second returns _NO_; _NO_ if the first shape returns _NO_ or if both shapes return _YES_; and _MAYBE_ otherwise.
    - For the exclusive OR of two shapes, the final result is _YES_ if one shape returns _YES_ and the other returns _NO_; _NO_ if both shapes return _NO_ or both return _YES_; and _MAYBE_ otherwise.

<a id=Probability_Transformations></a>
### Probability Transformations

The following algorithm takes a uniform partially-sampled random number (PSRN) as a "coin" and flips that "coin" using **SampleGeometricBag** (a method described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html)).  Given that "coin" and a function _f_ as described below, the algorithm returns 1 with probability _f_(_U_), where _U_ is the number built up by the uniform PSRN (see also (Brassard et al., 2019)<sup>[**(30)**](#Note30)</sup>, (Devroye 1986, p. 769)<sup>[**(15)**](#Note15)</sup>, (Devroye and Gravel 2020)<sup>[**(31)**](#Note31)</sup>.  In the algorithm:

-  The uniform PSRN's sign must be positive and its integer part must be 0.
- For correctness, _f_(_U_) must meet the following conditions:
    - If the algorithm will be run multiple times with the same PSRN, _f_(_U_) must be the constant 0 or 1, or be continuous and polynomially bounded on the open interval (0, 1) (polynomially bounded means that both _f_(_U_) and 1&minus;_f_(_U_) are bounded from below by min(_U_<sup>_n_</sup>, (1&minus;_U_)<sup>_n_</sup>) for some integer _n_ (Keane and O'Brien 1994)<sup>[**(32)**](#Note32)</sup>).
    - Otherwise, _f_(_U_) must map the interval \[0, 1] to \[0, 1] and be continuous everywhere or "almost everywhere".

    The first set of conditions is the same as those for the Bernoulli factory problem (see "[**About Bernoulli Factories**](https://peteroupc.github.io/bernoulli.html#About_Bernoulli_Factories)) and ensure this algorithm is unbiased (see also Łatuszyński et al. 2009/2011)<sup>[**(2)**](#Note2)</sup>.

The algorithm follows.

1. Set _v_ to 0 and _k_ to 1.
2. (_v_ acts as a uniform(0, 1) random variate to compare with _f_(_U_).) Set _v_ to _b_ * _v_ + _d_, where _b_ is the base (or radix) of the uniform PSRN's digits, and _d_ is a digit chosen uniformly at random.
3. Calculate an approximation of _f_(_U_) as follows:
    1. Set _n_ to the number of items (sampled and unsampled digits) in the uniform PSRN's fractional part.
    2. Of the first _n_ digits (sampled and unsampled) in the PSRN's fractional part, sample each of the unsampled digits uniformly at random.  Then let _uk_ be the PSRN's digit expansion up to the first _n_ digits after the point.
    3. Calculate the lowest and highest values of _f_ in the interval \[_uk_, _uk_ + _b_<sup>&minus;_n_</sup>\], call them _fmin_ and _fmax_. If abs(_fmin_ &minus; _fmax_) &le; 2 * _b_<sup>&minus;_k_</sup>, calculate (_fmax_ + _fmin_) / 2 as the approximation.  Otherwise, add 1 to _n_ and go to the previous substep.
4. Let _pk_ be the approximation's digit expansion up to the _k_ digits after the point.  For example, if _f_(_U_) is _&pi;_/5, _b_ is 10, and _k_ is 3, _pk_ is 628.
5. If _pk_ + 1 &le; _v_, return 0. If _pk_ &minus; 2 &ge; _v_, return 1.  If neither is the case, add 1 to _k_ and go to step 2.

> **Notes:**
>
> 1. This algorithm is related to the Bernoulli factory problem, where the input probability is unknown.  However, the algorithm doesn't exactly solve that problem because it has access to the input probability's value to some extent.
> 2. This section appears in the appendix because this article is focused on algorithms that don't rely on calculations of irrational numbers.

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
- _B_ = (1/2) \* min(_&lambda;_, 1&minus;_&lambda;_)<br/>&nbsp;&nbsp;= (1/2) \* ((1&minus;sqrt(1&minus;4\*_&lambda;_\*(1&minus;_&lambda;_)))/2)<br/>&nbsp;&nbsp;= (1/2) \* &sum;<sub>_k_ = 1, 2, ...</sub> _g_(_k_) \*  _h_<sub>_k_</sub>(_&lambda;_),

revealing that the function is a [**convex combination**](https://peteroupc.github.io/bernoulli.html#Convex_Combinations), and _B_ is itself a convex combination where&mdash;

- _g_(_k_) = choose(2\*_k_,_k_)/((2\*_k_&minus;1)\*2<sup>2*_k_</sup>), and
- _h_<sub>_k_</sub>(_&lambda;_) = (4\*_&lambda;_\*(1&minus;_&lambda;_))<sup>_k_</sup> / 2 = (_&lambda;_\*(1&minus;_&lambda;_))<sup>_k_</sup> * 4<sup>_k_</sup> / 2

(see also Wästlund (1999)<sup>[**(33)**](#Note33)</sup>; Dale et al. (2015)<sup>[**(34)**](#Note34)</sup>).  The right-hand side of _h_, which is the polynomial built in step 3 of the algorithm, is a polynomial of degree _k_\*2 with Bernstein coefficients&mdash;

- _z_ = (4<sup>_v_</sup>/2) / choose(_v_*2,_v_) at _v_=_k_, and
- 0 elsewhere.

Unfortunately, _z_ is generally greater than 1, so that the polynomial can't be simulated, as is, using the Bernoulli factory algorithm for [**polynomials in Bernstein form**](https://peteroupc.github.io/bernoulli.html#Certain_Polynomials_in_Bernstein_Form).  Fortunately, the polynomial's degree can be elevated to bring the Bernstein coefficients to 1 or less (for degree elevation and other algorithms, see (Tsai and Farouki 2001)<sup>[**(35)**](#Note35)</sup>).  Moreover, due to the special form of the Bernstein coefficients in this case, the degree elevation process can be greatly simplified.  Given an even degree _d_ as well as _z_ (as defined above), the degree elevation is as follows:

1. Set _r_ to floor(_d_/3) + 1. (This starting value is because when this routine finishes, _r_/_d_ appears to converge to 1/3 as _d_ gets large, for the polynomial in question.)  Let _c_ be choose(_d_,_d_/2).
2. Create a list of _d_+_r_+1 Bernstein coefficients, all zeros.
3. For each integer _i_ in the interval [0, _d_+_r_]:
     - If _d_/2 is in the interval [max(0, _i_&minus;_r_), min(_d_,_i_)], set the _i_<sup>th</sup> Bernstein coefficient (starting at 0) to _z_\*_c_\*choose(_r_,_i_&minus;_d_/2)\* / choose(_d_+_r_, _i_).
4. If all the Bernstein coefficients are 1 or less, return them.  Otherwise, add _d_/2 to _r_ and go to step 2.

<a id=Sampling_Distributions_Using_Incomplete_Information_Omitted_Algorithms></a>
### Sampling Distributions Using Incomplete Information: Omitted Algorithms

**Algorithm 2.** Say we have an _oracle_ that produces independent random real numbers whose expected ("average") value is a known or unknown mean. The goal is now to produce non-negative random variates whose expected value is the mean of _f_(_X_), where _X_ is a number produced by the oracle.  This is possible whenever _f_ has a finite minimum and maximum and the mean of _f_(_X_) is not less than _&delta;_, where _&delta;_ is a known rational number greater than 0. The algorithm to do so follows (see Lee et al. 2014)<sup>[**(36)**](#Note36)</sup>:

1. Let _m_ be a rational number equal to or greater than the maximum value of abs(_f_(_&mu;_)) anywhere.  Create a _&nu;_ input coin that does the following: "Take a number from the oracle, call it _x_.  With probability abs(_f_(_x_))/_m_, return a number that is 1 if _f_(_x_) < 0 and 0 otherwise.  Otherwise, repeat this process."
2. Use one of the [**linear Bernoulli factories**](https://peteroupc.github.io/bernoulli.html#lambda____x___y__linear_Bernoulli_factories) to simulate 2\*_&nu;_ (2 times the _&nu;_ coin's probability of heads), using the _&nu;_ input coin, with _&#x03F5;_ = _&delta;_/_m_.  If the factory returns 1, return 0.  Otherwise, take a number from the oracle, call it _&xi;_, and return abs(_f_(_&xi;_)).

> **Example:** An example from Lee et al. (2014)<sup>[**(36)**](#Note36)</sup>.  Say the oracle produces uniform random variates in [0, 3\*_&pi;_], and let _f_(_&nu;_) = sin(_&nu;_).  Then the mean of _f_(_X_) is 2/(3\*_&pi;_), which is greater than 0 and found in SymPy by `sympy.stats.E(sin(sympy.stats.Uniform('U',0,3*pi)))`, so the algorithm can produce non-negative random variates whose expected ("average") value is that mean.
>
> **Notes:**
>
> 1. Averaging to the mean of _f_(_X_) (that is, **E**\[_f_(_X_)] where **E**\[.] means expected or average value) is not the same as averaging to _f_(_&mu;_) where _&mu;_ is the mean of the oracle's numbers (that is, _f_(**E**\[_X_])).  For example, if _X_ is 0 or 1 with equal probability, and _f_(_&nu;_) = exp(&minus;_&nu;_), then **E**\[_f_(_X_)] = exp(0) + (exp(&minus;1) &minus; exp(0))\*(1/2), and _f_(**E**\[_X_]) = _f_(1/2) = exp(&minus;1/2).
> 2. (Lee et al. 2014, Corollary 4)<sup>[**(36)**](#Note36)</sup>: If _f_(_&mu;_) is known to return only values in the interval [_a_, _c_], the mean of _f_(_X_) is not less than _&delta;_, _&delta;_ > _b_, and _&delta;_ and _b_ are known numbers, then Algorithm 2 can be modified as follows:
>
>     - Use _f_(_&nu;_) = _f_(_&nu;_) &minus; _b_, and use _&delta;_ = _&delta;_ &minus; _b_.
>     - _m_ is taken as max(_b_&minus;_a_, _c_&minus;_b_).
>     - When Algorithm 2 finishes, add _b_ to its return value.
> 3. The check "With probability abs(_f_(_x_))/_m_" is exact if the oracle produces only rational numbers _and_ if _f_(_x_) outputs only rational numbers.  If the oracle or _f_ can produce irrational numbers (such as numbers that follow a beta distribution or another continuous distribution), then this check should be implemented using uniform [**partially-sampled random numbers (PSRNs)**](https://peteroupc.github.io/exporand.html).

**Algorithm 3.** Say we have an _oracle_ that produces independent random real numbers that are all greater than or equal to _a_ (which is a known rational number), whose mean (_&mu;_) is unknown.  The goal is to use the oracle to produce non-negative random variates with mean _f_(_&mu;_).  This is possible only if _f_ is 0 or greater everywhere in the interval \[_a_, _&infin;_\) and is nondecreasing in that interval (Jacob and Thiery 2015)<sup>[**(8)**](#Note8)</sup>.  This can be done using the algorithm below.  In the algorithm:

- _f_(_&mu;_) must be a function that can be written as the following infinite series expansion: _c_[0]\*_z_<sup>0</sup> + _c_[1]\*_z_<sup>1</sup> + ..., where _z_ = _&mu;_&minus;_a_ and all _c_\[_i_\] are 0 or greater.
- _&psi;_ is a rational number close to 1, such as 95/100.  (The exact choice is arbitrary and can be less or greater for efficiency purposes, but must be greater than 0 and less than 1.)

The algorithm follows.

1. Set _ret_ to 0, _prod_ to 1, _k_ to 0, and _w_ to 1. (_w_ is the probability of generating _k_ or more random variates in a single run of the algorithm.)
2. If _k_ is greater than 0: Take a number from the oracle, call it _x_, and multiply _prod_ by _x_&minus;_a_.
3. Add _c_\[_k_\]\*_prod_/_w_ to _ret_.
4. Multiply _w_ by _&psi;_ and add 1 to _k_.
5. With probability _&psi;_, go to step 2.  Otherwise, return _ret_.

Now, assume the oracle's numbers are all less than or equal to _b_ (rather than greater than or equal to _a_), where _b_ is a known rational number.  Then _f_ must be 0 or greater everywhere in (&minus;_&infin;_, _b_\] and be nonincreasing there (Jacob and Thiery 2015)<sup>[**(8)**](#Note8)</sup>, and the algorithm above can be used with the following modifications: (1) In the note on the infinite series, _z_ = _b_ &minus;_&mu;_; (2) in step 2, multiply _prod_ by _b_ &minus; _x_ rather than _x_ &minus; _a_.

> **Note:** This algorithm is exact if the oracle produces only rational numbers _and_ if all _c_\[_i_\] are rational numbers.  If the oracle can produce irrational numbers, then they should be implemented using uniform PSRNs.  See also note 3 on Algorithm 2.

<a id=Pushdown_Automata_and_Algebraic_Functions></a>
### Pushdown Automata and Algebraic Functions

This section has mathematical proofs showing which kinds of algebraic functions (functions that can be a solution of a system of polynomial equations) can be simulated with a pushdown automaton (a state machine with a stack).

The following summarizes what can be established about these algebraic functions:

- sqrt(_&lambda;_) can be simulated.
- Every rational function with rational coefficients that maps the open interval (0, 1) to (0, 1) can be simulated.
- If _f_(_&lambda;_) can be simulated, so can any Bernstein-form polynomial in the variable _f_(_&lambda;_) with coefficients that can be simulated.
- If _f_(_&lambda;_) and _g_(_&lambda;_) can be simulated, so can _f_(_&lambda;_)\*_g_(_&lambda;_), _f_(_g_(_&lambda;_)), and _g_(_f_(_&lambda;_)).
- If a full-domain pushdown automaton (defined later) can generate words of a given length with a given probability (a _probability distribution_ of word lengths), then the probability generating function for that distribution can be simulated, as well as for that distribution conditioned on a finite set or periodic infinite set of word lengths (e.g., all odd word lengths only).
- If a stochastic context-free grammar (defined later) can generate a probability distribution of word lengths, and terminates with probability 1, then the probability generating function for that distribution can be simulated.
- Every quadratic irrational in (0, 1) can be simulated.

It is not yet known whether the following functions can be simulated: _&lambda;_<sup>1/_p_</sup> for prime numbers _p_ greater than 2, or min(_&lambda;_, 1&minus;_&lambda;_).

--------------------------------

The following definitions are used in this section:

1. A _pushdown automaton_ has a finite set of _states_ and a finite set of _stack symbols_, one of which is called EMPTY, and takes a biased coin. It starts at a given state and its stack starts with EMPTY.  On each iteration:
    - The automaton flips the coin.
    - Based on the coin flip (HEADS or TAILS), the current state, and the top stack symbol, it moves to a new state (or keeps it unchanged) and replaces the top stack symbol with zero, one or two symbols.  Thus, there are three kinds of _transition rules_:
         - (_state_, _flip_, _symbol_) &rarr; (_state2_, {_symbol2_}): move to _state2_, replace top stack symbol with same or different one.
         - (_state_, _flip_, _symbol_) &rarr; (_state2_, {_symbol2_, _new_}): move to _state2_, replace top stack symbol with _symbol2_, then _push_ a new symbol (_new_) onto the stack.
         - (_state_, _flip_, _symbol_) &rarr; (_state2_, {}): move to _state2_, _pop_ the top symbol from the stack.

    When the stack is empty, the machine stops, and returns either 0 or 1 depending on the state it ends up at.  (Because each left-hand side has no more than one possible transition, the automaton is _deterministic_.)

2. A _full-domain pushdown automaton_ means a pushdown automaton that terminates with probability 1 given a coin with probability of heads _&lambda;_, for every _&lambda;_ in the open interval (0, 1).
3. **PDA** is the class of functions that map the open interval (0, 1) to (0, 1) and can be simulated by a full-domain pushdown automaton.
4. **ALGRAT** is the class of functions that map the open interval (0, 1) to (0, 1), are continuous, and are algebraic over the rational numbers (they satisfy a nonzero polynomial system whose coefficients are rational numbers).
5. A _probability generating function_ has the form _p_<sub>0</sub>\*_&lambda;_<sup>0</sup> + _p_<sub>1</sub>\*_&lambda;_<sup>1</sup> + ..., where _p_<sub>_i_</sub> (a _coefficient_) is the probability of getting _i_.

> **Notes:**
>
> 1. Mossel and Peres (2005)<sup>[**(11)**](#Note11)</sup> defined pushdown automata to start with a non-empty stack of _arbitrary_ size, and to allow each rule to replace the top symbol with an _arbitrary_ number of symbols.  Both cases can be reduced to the definition in this section.
> 2. Pushdown automata, as defined here, are very similar to so-called _probabilistic right-linear indexed grammars_ (Icard 2020)<sup>[**(37)**](#Note37)</sup> and can be translated to those grammars as well as to _probabilistic pushdown systems_ (Etessami and Yannakakis 2009)<sup>[**(38)**](#Note38)</sup>, as long as those grammars and systems use only transition probabilities that are rational numbers.

**Proposition 0** (Mossel and Peres 2005<sup>[**(37)**](#Note37)</sup>, Theorem 1.2): _A full-domain pushdown automaton can simulate a function that maps (0, 1) to (0, 1) only if the function is in class **ALGRAT**._

It is not known whether **ALGRAT** and **PDA** are equal, but the following can be established about **PDA**:

**Lemma 1A:** _Let g(&lambda;) be a function in the class **PDA**, and suppose a pushdown automaton F has two rules of the form (`state`, HEADS, `stacksymbol`) &rarr; RHS1 and (`state`, TAILS, `stacksymbol`) &rarr; RHS2, where `state` and `stacksymbol` are a specific state/symbol pair among the left-hand sides of F's rules.  Then there is a pushdown automaton that transitions to RHS1 with probability g(&lambda;) and to RHS2 with probability 1&minus;g(&lambda;) instead._

_Proof:_ If RHS1 and RHS2 are the same, then the conclusion holds and nothing has to be done.  Thus assume RHS1 and RHS2 are different.

Let _G_ be the full-domain pushdown automaton for _g_. Assume that machines _F_ and _G_ stop when they pop EMPTY from the stack. If this is not the case, transform both machines by renaming the symbol EMPTY to EMPTY&prime;&prime;, adding a new symbol EMPTY&prime;&prime; and new starting state X0, and adding rules (X0, _flip_, EMPTY) &rarr; (_start_, {EMPTY&prime;&prime;}) and rule (_state_, _flip_, EMPTY) &rarr; (_state_, {}) for all states other than X0, where _start_ is the starting state of _F_ or _G_, as the case may be.

Now, rename each state of _G_ as necessary so that the sets of states of _F_ and of _G_ are disjoint.  Then, add to _F_ a new stack symbol EMPTY&prime; (or a name not found in the stack symbols of G, as the case may be).  Then, for the following two pairs of rules in _F_, namely&mdash;

(_state_, HEADS, _stacksymbol_) &rarr; (_state2heads_, _stackheads_), and<br>
(_state_, TAILS, _stacksymbol_) &rarr; (_state2tails_, _stacktails_),

add two new states _state_<sub>0</sub> and _state_<sub>1</sub> that correspond to _state_ and have names different from all other states, and replace that rule with the following rules:

(_state_, HEADS, _stacksymbol_) &rarr; (_gstart_, {_stacksymbol_, EMPTY&prime;}),<br>
(_state_, TAILS, _stacksymbol_) &rarr; (_gstart_, {_stacksymbol_, EMPTY&prime;}),<br>
(_state_<sub>0</sub>, HEADS, _stacksymbol_) &rarr; (_state2heads_, _stackheads_),<br>
(_state_<sub>0</sub>, TAILS, _stacksymbol_) &rarr; (_state2heads_, _stackheads_),<br>
(_state_<sub>1</sub>, HEADS, _stacksymbol_) &rarr; (_state2tails_, _stacktails_), and<br>
(_state_<sub>1</sub>, TAILS, _stacksymbol_) &rarr; (_state2tails_, _stacktails_),<br>

where _gstart_ is the starting state for _G_, and copy the rules of the automaton for _G_ onto _F_, but with the following modifications:

- Replace the symbol EMPTY in _G_ with EMPTY&prime;.
- Replace each state in _G_ with a name distinct from all other states in _F_.
- Replace each rule in _G_ of the form (_state_, _flip_, EMPTY&prime;) &rarr; (_state2_, {}), where _state2_ is a final state of _G_ associated with output 1, with the rule (_state_, _flip_, EMPTY&prime;) &rarr; ( _state_<sub>1</sub>, {}).
- Replace each rule in _G_ of the form (_state_, _flip_, EMPTY&prime;) &rarr; (_state2_, {}), where _state2_ is a final state of _G_ associated with output 0, with the rule (_state_, _flip_, EMPTY&prime;) &rarr; ( _state_<sub>0</sub>, {}).

Then, the final states of the new machine are the same as those for the original machine _F_. &#x25a1;

**Lemma 1B:**  _There are pushdown automata that simulate the probabilities 0 and 1._

_Proof:_ The probability 0 automaton has the rules (START, HEADS, EMPTY) &rarr; (START, {}) and (START, TAILS, EMPTY) &rarr; (START, {}), and its only state START is associated with output 0. The probability 1 automaton is the same, except START is associated with output 1.  Both automata obviously terminate with probability 1. &#x25a1;

Because of Lemma 1A, it's possible to label each left-hand side of a pushdown automaton's rules with not just HEADS or TAILS, but also a rational number or another function in **PDA**, as long as for each state/symbol pair, the probabilities for that pair sum to 1.  For example, rules like the following are now allowed:

(START, 1/2, EMPTY) &rarr; ..., (START, sqrt(_&lambda;_)/2, EMPTY) &rarr; ..., (START, (1 &minus; sqrt(_&lambda;_))/2, EMPTY) &rarr; ....

**Proposition 1A:** _If f(&lambda;) is in the class **PDA**, then so is every polynomial written as&mdash;_

&sum;<sub>_i_ = 0, ..., _n_</sub> choose(_n_, _i_) * _f_(_&lambda;_)<sup>_i_</sup> * (1 &minus; _f_(_&lambda;_))<sup>_n_ &minus; _i_</sup> * _a_\[_i_\],

_where n is the polynomial's degree and a\[i\] is a function in the class **PDA**._

_Proof Sketch_: This corresponds to a two-stage pushdown automaton that follows the algorithm of Goyal and Sigman (2012)<sup>[**(7)**](#Note7)</sup>: The first stage counts the number of "heads" shown when flipping the f(&lambda;) coin, and the second stage flips another coin that has success probability _a_\[_i_\], where _i_ is the number of "heads". The automaton's transitions take advantage of Lemma 1A.  &#x25a1;

**Proposition 1:** _If f(&lambda;) and g(&lambda;) are functions in the class **PDA**, then so is their product, namely f(&lambda;)\*g(&lambda;)._

_Proof:_ Special case of Proposition 1A with _n_=1, _f_(_&lambda;_)=_f_(_&lambda;_), _a_\[0]=0 (using Lemma 1B), and _a_\[1]=_g_(_&lambda;_).  &#x25a1;

**Corollary 1A:** _If f(&lambda;), g(&lambda;), and h(&lambda;) are functions in the class **PDA**, then so is f(&lambda;)\*g(&lambda;) + (1&minus;f(&lambda;))\*h(&lambda;)._

_Proof:_ Special case of Proposition 1A with _n_=1, _f_(_&lambda;_)=_f_(_&lambda;_), _a_\[0]=_h_(_&lambda;_), and _a_\[1]=_g_(_&lambda;_).  &#x25a1;

**Proposition 2:** _If f(&lambda;) and g(&lambda;) are functions in the class **PDA**, then so is their composition, namely f(g(&lambda;)) or f&#x2218;g(&lambda;)._

_Proof:_ Let _F_ be the full-domain pushdown automaton for _f_. For each state/symbol pair among the left-hand sides of _F_'s rules, apply Lemma 1A to the automaton _F_, using the function _g_.  Then the new machine _F_ terminates with probability 1 because the original _F_ and _G_ do for every _&lambda;_ in (0, 1), and because _G_ maps to (0, 1) where _F_ terminates with probability 1.  Moreover, _f_ is in class **PDA** by Theorem 1.2 of (Mossel and Peres 2005)<sup>[**(11)**](#Note11)</sup> because the machine is a full-domain pushdown automaton.  &#x25a1;

**Proposition 3:** _Every rational function with rational coefficients that maps (0, 1) to (0, 1) is in class **PDA**._

_Proof:_ These functions can be simulated by a finite-state machine (Mossel and Peres 2005)<sup>[**(11)**](#Note11)</sup>.  This corresponds to a full-domain pushdown automaton that has no stack symbols other than EMPTY, never pushes symbols onto the stack, and pops the only symbol EMPTY from the stack whenever it transitions to a final state of the finite-state machine. &#x25a1;

> **Note:** An unbounded stack size is necessary for a pushdown automaton to simulate functions that a finite-state machine can't.  With a bounded stack size, there is a finite-state machine where each state not only holds the pushdown automaton's original state, but also encodes the contents of the stack (which is possible because the stack's size is bounded); each operation that would push, pop, or change the top symbol transitions to a state with the appropriate encoding of the stack instead.

**Proposition 4:** _If a full-domain pushdown automaton can generate words with the same letter such that the length of each word follows a probability distribution, then that distribution's probability generating function is in class **PDA**._

_Proof:_ Let _F_ be a full-domain pushdown automaton.  Add one state FAILURE, then augment _F_ with a special "letter-generating" operation as follows.  Add the following rule that pops all symbols from the stack:

(FAILURE, _flip_, _stacksymbol_) &rarr; (FAILURE, {}),

and for each rule of the following form that transitions to a letter-generating operation (where S and T are arbitrary states):

(S, _flip_, _stacksymbol_) &rarr; (T, _newstack_),

add another state S&prime; (with a name that differs from all other states) and replace that rule with the following rules:

(S, _flip_, _stacksymbol_) &rarr; (S&prime;, {_stacksymbol_}),<br/>
(S&prime;, HEADS, _stacksymbol_) &rarr; (T, _newstack_), and<br/>
(S&prime;, TAILS, _stacksymbol_) &rarr; (FAILURE, {}).

Then if the stack is empty upon reaching the FAILURE state, the result is 0, and if the stack is empty upon reaching any other state, the result is 1.  By (Dughmi et al. 2021)<sup>[**(39)**](#Note39)</sup>, the machine now simulates the distribution's probability generating function.  Moreover, the function is in class **PDA** by Theorem 1.2 of (Mossel and Peres 2005)<sup>[**(11)**](#Note11)</sup> because the machine is a full-domain pushdown automaton.  &#x25a1;

Define a _stochastic context-free grammar_ as follows.  The grammar consists of a finite set of _nonterminals_ and a finite set of _letters_, and rewrites one nonterminal (the starting nonterminal) into a word.  The grammar has three kinds of rules (in generalized Chomsky Normal Form (Etessami and Yannakakis 2009)<sup>[**(38)**](#Note38)</sup>):

- _X_ &rarr; _a_ (rewrite _X_ to the letter _a_).
- _X_ &rarr;<sub>_p_</sub> (_a_, _Y_) (with rational probability _p_, rewrite _X_ to the letter _a_ followed by the nonterminal _Y_).  For the same left-hand side, all the _p_ must sum to 1.
- _X_ &rarr; (_Y_, _Z_) (rewrite _X_ to the nonterminals _Y_ and _Z_ in that order).

Instead of a letter (such as _a_), a rule can use _&epsilon;_ (the empty string). (The grammar is _context-free_ because the left-hand side has only a single nonterminal, so that no context from the word is needed to parse it.)

**Proposition 5:** _Every stochastic context-free grammar can be transformed into a pushdown automaton.  If the automaton is a full-domain pushdown automaton and the grammar has a one-letter alphabet, the automaton can generate words such that the length of each word follows the same distribution as the grammar, and that distribution's probability generating function is in class **PDA**._

_Proof Sketch:_ In the equivalent pushdown automaton:

- _X_ &rarr; _a_ becomes the two rules&mdash;<br>(START, HEADS, _X_) &rarr; (_letter_, {}), and<br>(START, TAILS, _X_) &rarr; (_letter_, {}).<br>Here, _letter_ is either START or a unique state in _F_ that "detours" to a letter-generating operation for _a_ and sets the state back to START when finished (see Proposition 4).  If _a_ is _&epsilon;_, _letter_ is START and no letter-generating operation is done.
- _X_ &rarr;<sub>_p_<sub>_i_</sub></sub> (_a_<sub>_i_</sub>, _Y_<sub>_i_</sub>) (all rules with the same nonterminal _X_) are rewritten to enough rules to transition to a letter-generating operation for _a_<sub>_i_</sub>, and swap the top stack symbol with _Y_<sub>_i_</sub>, with probability _p_<sub>_i_</sub>, which is possible with just a finite-state machine (see Proposition 4) because all the probabilities are rational numbers (Mossel and Peres 2005)<sup>[**(11)**](#Note11)</sup>.  If _a_<sub>_i_</sub> is _&epsilon;_, no letter-generating operation is done.
- _X_ &rarr; (_Y_, _Z_) becomes the two rules&mdash;<br>(START, HEADS, _X_) &rarr; (START, {_Z_, _Y_}), and<br>(START, TAILS, _X_) &rarr; (START, {_Z_, _Y_}).

Here, _X_ is the stack symbol EMPTY if _X_ is the grammar's starting nonterminal. Now, assuming the automaton is full-domain, the rest of the result follows easily.   For a single-letter alphabet, the grammar corresponds to a system of polynomial equations, one for each rule in the grammar, as follows:

- _X_ &rarr; _a_ becomes _X_ = 1 if _a_ is the empty string (_&epsilon;_), or _X_ =  _&lambda;_ otherwise.
- For each nonterminal _X_, all _n_ rules of the form _X_ &rarr;<sub>_p_<sub>_i_</sub></sub> (_a_<sub>_i_</sub>, _Y_<sub>_i_</sub>) become the equation _X_ = _p_<sub>1</sub>\*_&lambda;_<sub>1</sub>\*_Y_<sub>1</sub> + _p_<sub>2</sub>\*_&lambda;_<sub>2</sub>\*_Y_<sub>2</sub> + ... + _p_<sub>_n_</sub>\*_&lambda;_<sub>_n_</sub>\*_Y_<sub>_n_</sub>, where _&lambda;_<sub>_i_</sub> is either 1 if _a_<sub>_i_</sub> is _&epsilon;_, or _&lambda;_ otherwise.
- _X_ &rarr; (_Y_, _Z_) becomes _X_ = _Y_\*_Z_.

Solving this system for the grammar's starting nonterminal, and applying Proposition 4, leads to the _probability generating function_ for the grammar's word distribution.  (See also Flajolet et al. 2010<sup>[**(12)**](#Note12)</sup>, Icard 2020<sup>[**(37)**](#Note37)</sup>.) &#x25a1;

> **Example:** The stochastic context-free grammar&mdash;<br>_X_ &rarr;<sub>1/2</sub> (_a_, _X1_),<br>_X1_ &rarr; (_X_, _X2_),<br>_X2_ &rarr; (_X_, _X_),<br>_X_ &rarr;<sub>1/2</sub> (_a_, _X3_),<br>_X3_ &rarr; _&epsilon;_,<br>which encodes ternary trees (Flajolet et al. 2010)<sup>[**(12)**](#Note12)</sup>, corresponds to the equation _X_ = (1/2) \* _&lambda;_\*_X_\*_X_\*_X_ + (1/2)\*_&lambda;_\*1, and solving this equation for _X_ leads to the probability generating function for such trees, which is a complicated expression.
>
> **Notes:**
>
> 1. A stochastic context-free grammar in which all the probabilities are 1/2 is called a _binary stochastic grammar_ (Flajolet et al. 2010<sup>[**(12)**](#Note12)</sup>).  If the starting nonterminal has _n_ rules of probability 1/_n_, then the grammar can be called an "_n_-ary stochastic grammar".  It is even possible for a nonterminal to have two rules of probability _&lambda;_ and (1&minus; _&lambda;_), which are used when the input coin returns 1 (HEADS) or 0 (TAILS), respectively.
>
> 2. If a pushdown automaton simulates the function _f_(_&lambda;_), then _f_ corresponds to a special system of equations, built as follows (Mossel and Peres 2005)<sup>[**(11)**](#Note11)</sup>; see also (Esparza et al. 2004)<sup>[**(40)**](#Note40)</sup>.  For each state of the automaton (call the state _en_), include the following equations in the system based on the automaton's transition rules:
>
>     - (_st_, _p_, _sy_) &rarr; (_s2_, {}) becomes either _&alpha;_<sub>_st_,_sy_,_en_</sub> = _p_ if _s2_ is _en_, or _&alpha;_<sub>_st_,_sy_,_en_</sub> = 0 otherwise.
>     - (_st_, _p_, _sy_) &rarr; (_s2_, {_sy1_}) becomes _&alpha;_<sub>_st_,_sy_,_en_</sub> = _p_ \* _&alpha;_<sub>_s2_,_sy1_,_en_</sub>.
>     - (_st_, _p_, _sy_) &rarr; (_s2_, {_sy1_, _sy2_}) becomes _&alpha;_<sub>_st_,_sy_,_en_</sub> = _p_\*_&alpha;_<sub>_s2_,_sy2_,_&sigma;[1]_</sub>\*_&alpha;_<sub>_&sigma;[1]_,_sy1_,_en_</sub> + ... + _p_\*_&alpha;_<sub>_s2_,_sy2_,_&sigma;[n]_</sub>\*_&alpha;_<sub>_&sigma;[n]_,_sy1_,_en_</sub>, where _&sigma;[i]_ is one of the machine's _n_ states.
>
>     (Here, _p_ is the probability of using the given transition rule; the special value HEADS becomes _&lambda;_, and the special value TAILS becomes 1&minus;_&lambda;_.)  Now, each time multiple equations have the same left-hand side, combine them into one equation with the same left-hand side, but with the sum of their right-hand sides.  Then, for any variable of the form _&alpha;_<sub>_a_,_b_,_c_</sub> not yet present in the system, include the equation _&alpha;_<sub>_a_,_b_,_c_</sub> = 0.  Then, for each final state _fs_ that returns 1, solve the system for the variable _&alpha;_<sub>START,EMPTY,_fs_</sub> (where START is the automaton's starting state) to get a solution (a function) that maps (0, 1) to (0, 1). (Each solve can produce multiple solutions, but only one of them will map (0, 1) to (0, 1) assuming every _p_ is either HEADS or TAILS.) Finally, add all the solutions to get _f_(_&lambda;_).
>
> 3. Assume there is a pushdown automaton (_F_) that follows Definition 1 except it uses a set of _N_ input letters (and not simply HEADS or TAILS), accepts an input word if the stack is empty, and rejects the word if the machine reaches a configuration without a transition rule.  Then a pushdown automaton in the full sense of Definition 1 (_G_) can be built.  In essence:
>     1. Add a new FAILURE state, which when reached, pops all symbols from the stack.
>     2. For each pair (_state_, _stacksymbol_) for _F_, add a set of rules that generate one of the input letters (each letter _i_ generated with probability _f_<sub> _i_</sub>(_&lambda;_), which must be a function in **PDA**), then use the generated letter to perform the transition stated in the corresponding rule for _F_.  If there is no such transition, transition to the FAILURE state instead.
>     3. When the stack is empty, output 0 if _G_ is in the FAILURE state, or 1 otherwise.
>
>     Then _G_ returns 1 with the same probability as _F_ accepts an input word with letters randomly generated as in the second step.  Also, one of the _N_ letters can be a so-called "end-of-string" symbol, so that a pushdown automaton can be built that accepts "empty strings"; an example is (Elder et al. 2015)<sup>[**(41)**](#Note41)</sup>.

**Proposition 6:** _If a full-domain pushdown automaton can generate a distribution of words with the same letter, there is a full-domain pushdown automaton that can generate a distribution of such words conditioned on&mdash;_

1. _a finite set of word lengths, or_
2. _a periodic infinite set of word lengths._

One example of a finite set of word lengths is {1, 3, 5, 6}, where only words of length 1, 3, 5, or 6 are allowed.  A _periodic infinite set_ is defined by a finite set of integers such as {1}, as well as an integer modulus such as 2, so that in this example, all integers congruent to 1 modulo 2 (that is, all odd integers) are allowed word lengths and belong to the set.

_Proof Sketch:_

1. As in Lemma 1A, assume that the automaton stops when it pops EMPTY from the stack.  Let _S_ be the finite set (e.g., {1, 3, 5, 6}), and let _M_ be the maximum value in the finite set.  For each integer _i_ in \[0, _M_\], make a copy of the automaton and append the integer _i_ to the name of each of its states.  Combine the copies into a new automaton _F_, and let its start state be the start state for copy 0.  Now, whenever _F_ generates a letter, instead of transitioning to the next state after the letter-generating operation (see Proposition 4), transition to the corresponding state for the next copy (e.g., if the operation would transition to copy 2's version of "XYZ", namely "2\_XYZ", transition to "3\_XYZ" instead), or if the last copy is reached, transition to the last copy's FAILURE state.  If _F_ would transition to a failure state corresponding to a copy not in _S_ (e.g., "0\_FAILURE", "2\_FAILURE", "3\_FAILURE" in this example), first all symbols other than EMPTY are popped from the stack and then _F_ transitions to its start state (this is a so-called "rejection" operation).  Now, all the final states (except FAILURE states) for the copies corresponding to the values in _S_ (e.g., copies 1, 3, 5, 6 in the example) are treated as returning 1, and all other states are treated as returning 0.

2. Follow (1), except as follows: (A) _M_ is equal to the integer modulus minus 1.  (B) For the last copy of the automaton, instead of transitioning to the next state after the letter-generating operation (see Proposition 4), transition to the corresponding state for copy 0 of the automaton.  &#x25a1;

**Proposition 7:** _Every constant function equal to a quadratic irrational number in the interval (0, 1) is in class **PDA**._

A _continued fraction_ is one way to write a real number.  For purposes of the following proof, every real number in (0, 1) has the following _continued fraction expansion_: 0 + 1 / (_a_[1] + 1 / (_a_[2] + 1 / (_a_[3] + ... ))), where each _a_\[_i_\], a _partial denominator_, is an integer greater than 0.  A _quadratic irrational number_ is an irrational number of the form (_b_+sqrt(_c_))/_d_, where _b_, _c_, and _d_ are rational numbers.

_Proof:_  By Lagrange's continued fraction theorem, every quadratic irrational number has a continued fraction expansion that is eventually periodic; the expansion can be described using a finite number of partial denominators, the last "few" of which repeat forever.  The following example describes a periodic continued fraction expansion: \[0; 1, 2, (5, 4, 3)\], which is the same as \[0; 1, 2, 5, 4, 3, 5, 4, 3, 5, 4, 3, ...\].  In this example, the partial denominators are the numbers after the semicolon; the size of the period (`(5, 4, 3)`) is 3; and the size of the non-period (`1, 2`) is 2.

Given a periodic expansion, and with the aid of an algorithm for simulating [**continued fractions**](https://peteroupc.github.io/bernoulli.html#Continued_Fractions), a recursive Markov chain for the expansion (Etessami and Yannakakis 2009)<sup>[**(38)**](#Note38)</sup> can be described as follows.  The chain's components are all built on the following template.  The template component has one entry E, one inner node N, one box, and two exits X0 and X1.  The box has one _call port_ as well as two _return ports_ B0 and B1.

- From E: Go to N with probability _x_, or to the box's call port with probability 1 &minus; _x_.
- From N: Go to X1 with probability _y_, or to X0 with probability 1 &minus; _y_.
- From B0: Go to E with probability 1.
- From B1: Go to X0 with probability 1.

Let _p_ be the period size, and let _n_ be the non-period size.  Now the recursive Markov chain to be built has _n_+_p_ components:

- For each _i_ in \[1, _n_+1\], there is a component labeled _i_.  It is the same as the template component, except _x_ = _a_\[_i_\]/(1 + _a_\[_i_\]), and _y_ = 1/_a_\[_i_\].  The component's single box goes to the component labeled _i_+1, _except_ that for component _n_+_p_, the component's single box goes to the component labeled _n_+1.

According to Etessami and Yannakakis (2009)<sup>[**(38)**](#Note38)</sup>, the recursive Markov chain can be translated to a pushdown automaton of the kind used in this section. Now all that's left is to argue that the recursive Markov chain terminates with probability 1.  For every component in the chain, it goes from its entry to its box with probability 1/2 or less (because each partial numerator must be 1 or greater).  Thus, the component is never more likely than not to recurse, and there are otherwise no probability-1 loops in each component, so the overall chain terminates with probability 1. &#x25a1;

**Lemma 1:** _The square root function sqrt(&lambda;) is in class **PDA**._

_Proof:_ See (Mossel and Peres 2005)<sup>[**(11)**](#Note11)</sup>. &#x25a1;

**Corollary 1:** _The function f(&lambda;) = &lambda;<sup>m/(2<sup>n</sup>)</sup>, where n &ge; 1 is an integer and where m &ge; 1 is an integer, is in class **PDA**._

_Proof:_ Start with the case _m_=1.  If _n_ is 1, write _f_ as sqrt(_&lambda;_); if _n_ is 2, write _f_ as sqrt&#x2218;sqrt(_&lambda;_); and for general _n_, write _f_ as sqrt&#x2218;sqrt&#x2218;...&#x2218;sqrt(_&lambda;_), with _n_ instances of sqrt.  Because this is a composition and sqrt can be simulated by a full-domain pushdown automaton, so can _f_.

For general _m_ and _n_, write _f_ as (sqrt&#x2218;sqrt&#x2218;...&#x2218;sqrt(_&lambda;_))<sup>_m_</sup>, with _n_ instances of sqrt.  This involves doing _m_ multiplications of sqrt&#x2218;sqrt&#x2218;...&#x2218;sqrt, and because this is an integer power of a function that can be simulated by a full-domain pushdown automaton, so can _f_.

Moreover, _f_ is in class **PDA** by Theorem 1.2 of (Mossel and Peres 2005)<sup>[**(11)**](#Note11)</sup> because the machine is a full-domain pushdown automaton. &#x25a1;

<a id=Finite_State_and_Pushdown_Generators></a>
#### Finite-State and Pushdown Generators

Another interesting class of machines (called _pushdown generators_ here) are similar to pushdown automata (see above), with the following exceptions:

1. Each transition rule can also, optionally, output a base-_N_ digit in its right-hand side.  An example is: (_state_, _flip_, _sy_) &rarr; (_digit_, _state2_, {_sy2_}).
2. The machine must output infinitely many digits if allowed to run forever.
3. Rules that would pop the last symbol from the stack are not allowed.

The "output" of the machine is now a real number _X_ in the interval [0, 1], in the form of the base-_N_ digit expansion `0.dddddd...`, where `dddddd...` are the digits produced by the machine from left to right.  In the rest of this section:

- `CDF(z)` is the cumulative distribution function of _X_, or the probability that _X_ is _z_ or less.
- `PDF(z)` is the probability density function of _X_, or the "slope" function of `CDF(z)`, or the relative probability of choosing a number "close" to _z_ at random.

A _finite-state generator_ (Knuth and Yao 1976)<sup>[**(42)**](#Note42)</sup> is the special case where the probability of heads is 1/2, each digit is either 0 or 1, rules can't push stack symbols, and only one stack symbol is used.  Then if `PDF(z)` is "smooth" (has infinitely many "slope" functions) on the open interval (0, 1), it must be a polynomial with rational coefficients and not equal 0 at any irrational point on (0, 1) (Vatan 2001)<sup>[**(43)**](#Note43)</sup>, (Kindler and Romik 2004)<sup>[**(44)**](#Note44)</sup>, and it can be shown that the mean of _X_ must be a rational number.  <sup>[**(45)**](#Note45)</sup>

**Proposition 8.** _Suppose a finite-state generator can generate a probability distribution that takes on finitely many values.  Then:_

1. _Each value occurs with a rational probability._
2. _Each value is either rational or transcendental._

A real number is _transcendental_ if it can't be a root of a nonzero polynomial with integer coefficients.  Thus, part 2 means, for example, that irrational, non-transcendental numbers such as 1/sqrt(2) and the golden ratio minus 1 can't be generated exactly.

Proving this proposition involves the following lemma, which shows that a finite-state generator is related to a machine with a one-way read-only input and a one-way write-only output:

**Lemma 2.** _A finite-state generator can fit the model of a one-way transducer-like k-machine (as defined in Adamczewski et al. (2020)<sup>[**(46)**](#Note46)</sup> section 5.3), for some k equal to 2 or greater._

_Proof Sketch:_ There are two cases.

Case 1: If every transition rule of the generator outputs a digit, then _k_ is the number of unique inputs among the generator's transition rules (usually, there are two unique inputs, namely HEADS and TAILS), and the model of a finite-state generator is modified as follows:

1. A _configuration_ of the finite-state generator consists of its current state together with either the last coin flip result or, if the coin wasn't flipped yet, the empty string.
2. The _output function_ takes a configuration described above and returns a digit.  If the coin wasn't flipped yet, the function returns an arbitrary digit (which is not used in proposition 4.6 of the Adamczewski paper).

Case 2: If at least one transition rule does not output a digit, then the finite-state generator can be transformed to a machine where HEADS/TAILS is replaced with 50% probabilities, then transformed to an equivalent machine whose rules always output one or more digits, as claimed in Lemma 5.2 of Vatan (2001)<sup>[**(43)**](#Note43)</sup>.  In case the resulting generator has rules that output more than one digit, additional states and rules can be added so that the generator's rules output only one digit as desired.  Now at this point the generator's probabilities will be rational numbers. Now transform the generator from probabilities to inputs of size _k_, where _k_ is the product of those probabilities, by adding additional rules as desired.  &#x25a1;

_Proof of Proposition 8:_ Let _n_ be an integer greater than 0. Take a finite-state generator that starts at state START and branches to one of _n_ finite-state generators (sub-generators) with some probability, which must be rational because the overall generator is a finite-state machine (Icard 2020, Proposition 13)<sup>[**(37)**](#Note37)</sup>.  The branching process outputs no digit, and part 3 of the proposition follows from Corollary 9 of Icard (2020)<sup>[**(37)**](#Note37)</sup>.  The _n_ sub-generators are special; each of them generates the binary expansion of a single real number in [0, 1] with probability 1.

To prove part 2 of the proposition, translate an arbitrary finite-state generator to a machine described in Lemma 2.  Once that is done, all that must be shown is that there are two different non-empty sequences of coin flips that end up at the same configuration. This is easy using the pigeonhole principle, since the finite-state generator has a finite number of configurations. Thus, by propositions 5.11, 4.6, and AB of Adamczewski et al. (2020)<sup>[**(46)**](#Note46)</sup>, the generator can generate a real number's binary expansion only if that number is rational or transcendental (see also Cobham (1968)<sup>[**(47)**](#Note47)</sup>; Adamczewski and Bugeaud (2007)<sup>[**(48)**](#Note48)</sup>).</s>  &#x25a1;

**Proposition 9.** _If the distribution function generated by a finite-state generator is continuous and algebraic on the open interval (0, 1), then that function is a piecewise polynomial function._

The proof follows from combining Kindler and Romik (2004, Theorem 2)<sup>[**(44)**](#Note44)</sup> and Knuth and Yao (1976)<sup>[**(42)**](#Note42)</sup> with Richman (2012)<sup>[**(49)**](#Note49)</sup>, who proved that a continuous algebraic function on an open interval is piecewise analytic ("analytic" is a stronger statement than "smooth").

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
