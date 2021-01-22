# Bernoulli Factory Algorithms

[**Peter Occil**](mailto:poccil14@gmail.com)

**Abstract:** This page catalogs algorithms to turn coins biased one way into coins biased another way, also known as _Bernoulli factories_.  It provides step-by-step instructions to help programmers implement these Bernoulli factory algorithms.  This page also contains algorithms to exactly simulate probabilities that are irrational numbers, using only random bits, which is related to the Bernoulli factory problem. This page is focused on sampling methods that _exactly_ simulate a given probability without introducing new errors, assuming "truly random" numbers are available.  The page links to a Python module that implements several Bernoulli factories.

**2020 Mathematics Subject Classification:** 60-08, 60-04.

<a id=Introduction></a>
## Introduction

This page catalogs algorithms to turn coins biased one way into coins biased another way, also known as _Bernoulli factories_.  Many of them were suggested in (Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>, but without step-by-step instructions in many cases.  This page provides these instructions to help programmers implement the Bernoulli factories they describe.  The Python module [**_bernoulli.py_**](https://peteroupc.github.io/bernoulli.py) includes implementations of several Bernoulli factories.

This page also contains algorithms to exactly simulate probabilities that are irrational numbers, using only random bits, which is related to the Bernoulli factory problem.  Again, many of these were suggested in (Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>.

This page is focused on sampling methods that _exactly_ simulate the probability described, without introducing rounding errors or other errors beyond those already present in the inputs (and assuming that we have a source of "truly" random numbers, that is, random numbers that are independent and identically distributed).

<a id=About_This_Document></a>
### About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/bernoulli.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/bernoulli.md)**.  You can send comments on this document on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues)**.  See** "[**Requests and Open Questions**](#Requests_and_Open_Questions)" **for a list of things about this document that I seek answers to.**

**I encourage readers to implement any of the algorithms given in this page, and report their implementation experiences.  This may help improve this page.**

<a id=Contents></a>
## Contents

- [**Introduction**](#Introduction)
    - [**About This Document**](#About_This_Document)
- [**Contents**](#Contents)
- [**About Bernoulli Factories**](#About_Bernoulli_Factories)
- [**Algorithms**](#Algorithms)
    - [**Algorithms for Functions of _&lambda;_**](#Algorithms_for_Functions_of___lambda)
        - [**Certain Power Series**](#Certain_Power_Series)
        - [**exp(&minus;_&lambda;_)**](#exp_minus___lambda)
        - [**exp(&minus;(_&lambda;_<sup>_k_</sup> * _x_))**](#exp_minus___lambda___k___x)
        - [**exp(&minus;(_&lambda;_<sup>_k_</sup> * (_x_ + _m_)))**](#exp_minus___lambda___k___x___m)
        - [**exp(&minus;(_&lambda;_ + _m_)<sup>_k_</sup>)**](#exp_minus___lambda____m___k)
        - [**exp(_&lambda;_)*(1&minus;_&lambda;_)**](#exp___lambda___1_minus___lambda)
        - [**(1&minus;_&lambda;_)/cos(_&lambda;_)**](#1_minus___lambda___cos___lambda)
        - [**(1&minus;_&lambda;_) * tan(_&lambda;_)**](#1_minus___lambda___tan___lambda)
        - [**exp(_&lambda;_ * _c_ &minus; _c_)**](#exp___lambda____c__minus__c)
        - [**exp(&minus;_&lambda;_ &minus; _c_)**](#exp_minus___lambda___minus__c)
        - [**1/(2<sup>_k_ + _&lambda;_</sup>) or exp(&minus;(_k_ + _&lambda;_)\*ln(2))**](#1_2_k____lambda___or_exp_minus__k____lambda___ln_2)
        - [**1/(2<sup>_m_\*(_k_ + _&lambda;_)</sup>) or 1/((2<sup>_m_</sup>)\*(_k_ + _&lambda;_)) or exp(&minus;(_k_ + _&lambda;_)\*ln(2<sup>_m_</sup>))**](#1_2_m___k____lambda___or_1_2_m___k____lambda___or_exp_minus__k____lambda___ln_2_m)
        - [**1/(1+_&lambda;_)**](#1_1___lambda)
        - [**_&lambda;_/(1+_&lambda;_)**](#lambda___1___lambda)
        - [**ln(1+_&lambda;_)**](#ln_1___lambda)
        - [**1 &minus; ln(1+_&lambda;_)**](#1_minus_ln_1___lambda)
        - [**_c_ * _&lambda;_ * _&beta;_ / (_&beta;_ * (_c_ * _&lambda;_ + _d_ * _&mu;_) &minus; (_&beta;_ &minus; 1) * (_c_ + _d_))**](#c____lambda_____beta_____beta____c____lambda____d____mu___minus___beta___minus_1__c___d)
        - [**_c_ * _&lambda;_ / (_c_ * _&lambda;_ + _d_) or (_c_/_d_) * _&lambda;_ / (1 + (_c_/_d_) * _&lambda;_))**](#c____lambda____c____lambda____d__or__c___d____lambda___1__c___d____lambda)
        - [**1 / (_c_ + _&lambda;_)**](#1__c____lambda)
        - [**(_d_ + _&lambda;_) / _c_**](#d____lambda____c)
        - [**_d_ / (_c_ + _&lambda;_)**](#d___c____lambda)
        - [**(_d_ + _&mu;_) / (_c_ + _&lambda;_)**](#d____mu____c____lambda)
        - [**_d_<sup>_k_</sup> / (_c_ + _&lambda;_)<sup>_k_</sup>, or (_d_ / (_c_ + _&lambda;_))<sup>_k_</sup>**](#d__k___c____lambda____k__or__d___c____lambda____k)
        - [**_&lambda;_ + _&mu;_**](#lambda_____mu)
        - [**_&lambda;_ &minus; _&mu;_**](#lambda___minus___mu)
        - [**1/(_c_ + _&lambda;_)**](#1__c____lambda_2)
        - [**1 &minus; _&lambda;_**](#1_minus___lambda)
        - [**_&nu;_ * _&lambda;_ + (1 &minus; _&nu;_) * _&mu;_**](#nu_____lambda___1_minus___nu_____mu)
        - [**_&lambda;_ + _&mu;_ &minus; (_&lambda;_ * _&mu;_)**](#lambda_____mu___minus___lambda_____mu)
        - [**(_&lambda;_ + _&mu;_) / 2**](#lambda_____mu___2)
        - [**arctan(_&lambda;_) /_&lambda;_**](#arctan___lambda_____lambda)
        - [**arctan(_&lambda;_)**](#arctan___lambda)
        - [**cos(_&lambda;_)**](#cos___lambda)
        - [**sin(_&lambda;_)**](#sin___lambda)
        - [**_&lambda;_<sup>_x_/_y_</sup>**](#lambda___x___y)
        - [**_&lambda;_<sup>_&mu;_</sup>**](#lambda____mu)
        - [**sqrt(_&lambda;_)**](#sqrt___lambda)
        - [**arcsin(_&lambda;_) + sqrt(1 &minus; _&lambda;_<sup>2</sup>) &minus; 1**](#arcsin___lambda___sqrt_1_minus___lambda__2_minus_1)
        - [**arcsin(_&lambda;_) / 2**](#arcsin___lambda___2)
        - [**_&lambda;_ * _&mu;_**](#lambda_____mu_2)
        - [**_&lambda;_ * _x_/_y_ (linear Bernoulli factories)**](#lambda____x___y__linear_Bernoulli_factories)
        - [**(_&lambda;_ * _x_/_y_)<sup>_i_</sup>**](#lambda____x___y___i)
        - [**_&#x03F5;_ / _&lambda;_**](#x03F5_____lambda)
        - [**Certain Rational Functions**](#Certain_Rational_Functions)
        - [**Certain Polynomials in Bernstein Form**](#Certain_Polynomials_in_Bernstein_Form)
        - [**Certain Algebraic Functions**](#Certain_Algebraic_Functions)
        - [**Expressions Involving Polylogarithms**](#Expressions_Involving_Polylogarithms)
    - [**Algorithms for Irrational Constants**](#Algorithms_for_Irrational_Constants)
        - [**Digit Expansions**](#Digit_Expansions)
        - [**Continued Fractions**](#Continued_Fractions)
        - [**Continued Logarithms**](#Continued_Logarithms)
        - [**1 / _&phi;_ (1 divided by the golden ratio)**](#1___phi___1_divided_by_the_golden_ratio)
        - [**sqrt(2) &minus; 1**](#sqrt_2_minus_1)
        - [**1/sqrt(2)**](#1_sqrt_2)
        - [**tanh(1/2) or (exp(1) &minus; 1) / (exp(1) + 1)**](#tanh_1_2_or_exp_1_minus_1_exp_1_1)
        - [**arctan(_x_/_y_) \* _y_/_x_**](#arctan__x___y___y___x)
        - [**_&pi;_ / 12**](#pi___12)
        - [**_&pi;_ / 4**](#pi___4)
        - [**1 / _&pi;_**](#1___pi)
        - [**(_a_/_b_)<sup>_x_/_y_</sup>**](#a___b___x___y)
        - [**exp(&minus;_x_/_y_)**](#exp_minus__x___y)
        - [**exp(&minus;_z_)**](#exp_minus__z)
        - [**(_a_/_b_)<sup>_z_</sup>**](#a___b___z)
        - [**1 / 1 + exp(_x_ / (_y_ * 2<sup>_prec_</sup>)) (LogisticExp)**](#1_1_exp__x___y__2_prec__LogisticExp)
        - [**1 / 1 + exp(_z_ / 2<sup>_prec_</sup>)) (LogisticExp)**](#1_1_exp__z__2_prec__LogisticExp)
        - [**Polylogarithmic Constants**](#Polylogarithmic_Constants)
        - [**_&zeta;_(3) * 3 / 4 and Other Zeta-Related Constants**](#zeta___3_3_4_and_Other_Zeta_Related_Constants)
        - [**erf(_x_)/erf(1)**](#erf__x__erf_1)
        - [**2 / (1 + exp(2)) or (1 + exp(0)) / (1 + exp(1))**](#2_1_exp_2_or_1_exp_0_1_exp_1)
        - [**(1 + exp(1)) / (1 + exp(2))**](#1_exp_1_1_exp_2)
        - [**(1 + exp(_k_)) / (1 + exp(_k_ + 1))**](#1_exp__k__1_exp__k__1)
        - [**Euler's Constant _&gamma;_**](#Euler_s_Constant___gamma)
        - [**exp(&minus;_x_/_y_) \* _z_/_t_**](#exp_minus__x___y___z___t)
        - [**ln(2)**](#ln_2)
        - [**ln(1+_y_/_z_)**](#ln_1__y___z)
    - [**General Algorithms**](#General_Algorithms)
        - [**Convex Combinations**](#Convex_Combinations)
        - [**Simulating the Probability Generating Function**](#Simulating_the_Probability_Generating_Function)
        - [**Integrals**](#Integrals)
        - [**Certain Converging Series**](#Certain_Converging_Series)
        - [**General Factory Functions**](#General_Factory_Functions)
- [**Requests and Open Questions**](#Requests_and_Open_Questions)
- [**Correctness and Performance Charts**](#Correctness_and_Performance_Charts)
- [**Acknowledgments**](#Acknowledgments)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Randomized vs. Non-Randomized Algorithms**](#Randomized_vs_Non_Randomized_Algorithms)
    - [**Simulating Probabilities vs. Estimating Probabilities**](#Simulating_Probabilities_vs_Estimating_Probabilities)
    - [**Convergence of Bernoulli Factories**](#Convergence_of_Bernoulli_Factories)
    - [**Alternative Implementation of Bernoulli Factories**](#Alternative_Implementation_of_Bernoulli_Factories)
    - [**SymPy Code for Parameters to Simulate _C_<sup>2</sup> Functions**](#SymPy_Code_for_Parameters_to_Simulate__C_2_Functions)
    - [**Correctness Proof for the Continued Logarithm Simulation Algorithm**](#Correctness_Proof_for_the_Continued_Logarithm_Simulation_Algorithm)
    - [**Correctness Proof for Continued Fraction Simulation Algorithm 3**](#Correctness_Proof_for_Continued_Fraction_Simulation_Algorithm_3)
    - [**The von Neumann Schema**](#The_von_Neumann_Schema)
    - [**Probabilities Arising from Certain Permutations**](#Probabilities_Arising_from_Certain_Permutations)
    - [**Sketch of Derivation of the Algorithm for 1 / _&pi;_**](#Sketch_of_Derivation_of_the_Algorithm_for_1___pi)
    - [**Calculating Bounds for exp(1)**](#Calculating_Bounds_for_exp_1)
- [**License**](#License)

<a id=About_Bernoulli_Factories></a>
## About Bernoulli Factories

A _Bernoulli factory_ (Keane and O'Brien 1994)<sup>[**(2)**](#Note2)</sup> is an algorithm that takes an input coin (a method that returns 1, or heads, with an unknown probability, or 0, or tails, otherwise) and returns 0 or 1 with a probability that depends on the input coin's probability of heads.  For example, a Bernoulli factory algorithm can take a coin that returns heads with probability _&lambda;_ and produce a coin that returns heads with probability exp(&minus;_&lambda;_).

A _factory function_ is a function that relates the old probability to the new one.  Its domain is [0, 1] or a subset of [0, 1], and returns a probability in [0, 1].  There are certain requirements for factory functions.  As shown by Keane and O'Brien (1994)<sup>[**(2)**](#Note2)</sup>, a function _f_(_&lambda;_) can serve as a factory function if and only if _f_, within its domain&mdash;

- is continuous everywhere,
- does not go to 0 or 1 exponentially fast in value, and
- either returns a constant value in \[0, 1\] everywhere, or returns a value in \[0, 1\] at each of the points 0 and 1 and a value in (0, 1) at each other point.

As one example, the function _f_ = 2*_&lambda;_ cannot serve as a factory function, since its graph touches 1 somewhere in the open interval (0, 1).<sup>[**(3)**](#Note3)</sup>

If a function's graph touches 0 or 1 somewhere in (0, 1), papers have suggested dealing with this by modifying the function so it no longer touches 0 or 1 there (for example, _f_ = 2*_&lambda;_ might become _f_ = min(2 * _&lambda;_, 1 &minus; _&#x03F5;_) where _&#x03F5;_ is in (0, 1/2) (Keane and O'Brien 1994)<sup>[**(2)**](#Note2)</sup>, (Huber 2014, introduction)<sup>[**(4)**](#Note4)</sup>), or by somehow ensuring that _&lambda;_ does not come close to the point where the graph touches 0 or 1 (Nacu and Peres 2005, theorem 1)<sup>[**(5)**](#Note5)</sup>.

The next section will show algorithms for a number of factory functions, allowing different kinds of probabilities to be simulated from input coins.

<a id=Algorithms></a>
## Algorithms

In the following algorithms:

- _&lambda;_ is the unknown probability of heads of the input coin.
-  choose(_n_, _k_) = _n_!/(_k_! * (_n_ &minus; _k_)!) is a binomial coefficient.  It can be calculated, for example, by calculating _i_/(_n_&minus;_i_+1) for each integer _i_ in \[_n_&minus;_k_+1, _n_\], then multiplying the results (Manolopoulos 2002)<sup>[**(6)**](#Note6)</sup>.  Note that for all _m_>0, choose(_m_, 0) = choose(_m_, _m_) = 1 and choose(_m_, 1) = choose(_m_, _m_&minus;1) = _m_; also, choose(_n_, _k_) is 0 when _k_ is less than 0 or greater than _n_.
- The instruction to "generate a uniform(0, 1) random number" can be implemented&mdash;
    - by creating a [**uniform partially-sampled random number (PSRN)**](https://peteroupc.github.io/exporand.html) with a positive sign, an integer part of 0, and an empty fractional part (most accurate), or
    - by generating `RNDRANGEMaxExc(0, 1)` or `RNDINT(1000)` (less accurate).
- The instruction to "generate an exponential random number" can be implemented&mdash;
    - by creating an empty [**exponential PSRN**](https://peteroupc.github.io/exporand.html) (most accurate), or
    - by getting the result of the **ExpRand** or **ExpRand2** algorithm (described in my article on PSRNs) with a rate of 1, or
    - by generating `-ln(1/RNDRANGEMinExc(0, 1))` (less accurate).
- To **sample from a random number _u_** means to generate a number that is 1 with probability _u_ and 0 otherwise.
    - If the number is a uniform PSRN, call the **SampleGeometricBag** algorithm with the PSRN and take the result of that call (which will be 0 or 1) (most accurate). (**SampleGeometricBag** is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
    - Otherwise, this can be implemented by generating another uniform(0, 1) random number _v_ and generating 1 if _v_ is less than _u_ or 0 otherwise (less accurate).
- Where an algorithm says "if _a_ is less than _b_", where _a_ and _b_ are random numbers, it means to run the **RandLess** algorithm on the two numbers (if they are both PSRNs), or do a less-than operation on _a_ and _b_, as appropriate. (**RandLess** is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
- Where a step in the algorithm says "with probability _x_" to refer to an event that may or may not happen, then this can be implemented in one of the following ways:
    - Convert _x_ to a rational number _y_/_z_, then call `ZeroOrOne(y, z)`.  The event occurs if the call returns 1. (Most accurate.)  For example, if an instruction says "With probability 3/5, return 1", then implement it as "Call `ZeroOrOne(3, 5)`. If the call returns 1, return 1."  `ZeroOrOne` is described in my article on [**random sampling methods**](https://peteroupc.github.io/randomfunc.html#Boolean_True_False_Conditions).
    - Generate a uniform(0, 1) random number _v_. The event occurs if _v_ is less than _x_.  (Less accurate.)
- For best results, the algorithms should be implemented using exact rational arithmetic (such as `Fraction` in Python or `Rational` in Ruby).  Floating-point arithmetic is discouraged because it can introduce errors due to fixed-precision calculations, such as rounding and cancellations.

The algorithms as described here do not always lead to the best performance.  An implementation may change these algorithms as long as they produce the same results as the algorithms as described here.

The algorithms assume that a source of independent and unbiased random bits is available, in addition to the input coins.  But it's possible to implement these algorithms using nothing but those coins as a source of randomness.  See the [**appendix**](#Randomized_vs_Non_Randomized_Algorithms) for details.

Bernoulli factory algorithms that simulate _f_(_&lambda;_) are equivalent to unbiased estimators of _f_(_&lambda;_). See the [**appendix**](#Simulating_Probabilities_vs_Estimating_Probabilities) for details.

<a id=Algorithms_for_Functions_of___lambda></a>
### Algorithms for Functions of _&lambda;_

&nbsp;

<a id=Certain_Power_Series></a>
#### Certain Power Series

Mendo (2019)<sup>[**(7)**](#Note7)</sup> gave a Bernoulli factory algorithm for certain functions that can be rewritten as a series of the form&mdash;

&nbsp;&nbsp;&nbsp;&nbsp;1 &minus; (_c_\[0\] \* (1 &minus; _&lambda;_) + ... + _c_\[_i_\] * (1 &minus; _&lambda;_)<sup>_i_ + 1</sup> + ...),

where _c_\[_i_\] >= 0 are the coefficients of the series and sum to 1.   (According to Mendo, this implies that the series is differentiable &mdash; its graph has no "sharp corners" &mdash; and takes on a value that approaches 0 or 1 as _&lambda;_ approaches 0 or 1, respectively). The algorithm follows:

1. Let _v_ be 1 and let _result_ be 1.
2. Set _dsum_ to 0 and _i_ to 0.
3. Flip the input coin.  If it returns _v_, return _result_.
4. If _i_ is equal to or greater than the number of coefficients, set _ci_ to 0.  Otherwise, set _ci_ to _c_\[_i_\].
5. With probability _ci_/(1 &minus; _dsum_), return 1 minus _result_.
6. Add _ci_ to _dsum_, add 1 to _i_, and go to step 3.

As pointed out in Mendo (2019)<sup>[**(7)**](#Note7)</sup>, variants of this algorithm work for power series of the form&mdash;

1. (_c_\[0\] \* (1 &minus; _&lambda;_) + ... + _c_\[_i_\] * (1 &minus; _&lambda;_)<sup>_i_ + 1</sup> + ...), or
2. (_c_\[0\] \* _&lambda;_ + ... + _c_\[_i_\] * _&lambda;_<sup>_i_ + 1</sup> + ...), or
3. 1 &minus; (_c_\[0\] \* _&lambda;_ + ... + _c_\[_i_\] * _&lambda;_<sup>_i_ + 1</sup> + ...).

In the first two cases, replace "let _result_ be 1" in the algorithm with "let _result_ be 0".  In the last two cases, replace "let _v_ be 1" with "let _v_ be 0".  Also, as pointed out by Mendo, the _c_\[_i_\] can also sum to less than 1, in which case if the algorithm would return 1, instead it returns a number that is 1 with probability equal to the sum of all _c_\[_i_\], and 0 otherwise.

(Łatuszyński et al. 2009/2011)<sup>[**(8)**](#Note8)</sup> gave an algorithm that works for a wide class of series and other constructs that converge to the desired probability from above and from below.

One of these constructs is an alternating series of the form&mdash;

&nbsp;&nbsp;&nbsp;&nbsp;_d[0]_ &minus; _d[1]_ * _&lambda;_ + _d[2]_ * _&lambda;_<sup>2</sup> &minus; ...,

where _d_\[_i_\] are all in the interval [0, 1] and form a nonincreasing sequence of coefficients.

The following is the general algorithm for this kind of series, called the **general martingale algorithm**.  It takes a list of coefficients and an input coin, and returns 1 with the probability given by the series above, and 0 otherwise.

1. Let _d[0]_, _d[1]_, etc. be the first, second, etc. coefficients of the alternating series.  Set _u_ to _d[0]_, set _w_ to 1, set _&#x2113;_ to 0, and set _n_ to 1.
2. Generate a uniform(0, 1) random number _ret_.
3. If _w_ is not 0, flip the input coin and multiply _w_ by the result of the flip.
4. If _n_ is even, set _u_ to _&#x2113;_ + _w_ * _d[n]_.  Otherwise, set _&#x2113;_ to _u_ &minus; _w_ * _d[n]_.
5. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  If _ret_ is less than _u_, go to the next step.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
6. Add 1 to _n_ and go to step 3.

If the alternating series has the form&mdash;

&nbsp;&nbsp;&nbsp;&nbsp;_d[0]_ &minus; _d[1]_ * _&lambda;_<sup>2</sup> + _d[2]_ * _&lambda;_<sup>4</sup> &minus; ...,

then modify the general martingale algorithm by adding the following after step 3: "3a. Repeat step 3 once."  (Examples of this kind of series are found in sin(_&lambda;_) and cos(_&lambda;_).)

(Nacu and Peres 2005, proposition 16)<sup>[**(5)**](#Note5)</sup>.  This algorithm simulates a function of the form&mdash;

&nbsp;&nbsp;&nbsp;&nbsp;_d[0]_ + _d[1]_ * _&lambda;_ + _d[2]_ * _&lambda;_<sup>2</sup> &minus; ...,

where each _d_\[_i_\] is 0 or greater, and takes two parameters _t_ and _&epsilon;_, where _t_ must be chosen such that _t_ is in (0, 1], _f_(_t_) < 1, and _&lambda;_ < _t_ &minus; 2\*_&epsilon;_.

1. Create a _&nu;_ input coin that does the following: "(1) Set _n_ to 0. (2) With probability _&epsilon;_/_t_, go to the next substep.  Otherwise, add 1 to _n_ and repeat this substep. (3) With probability 1 &minus; _d_\[_n_\]\*_t_<sup>_n_</sup>, return 0. (4) Call the **2014 algorithm**, the **2016 algorithm**, or the **2019 algorithm**, described later, _n_ times, using the (_&lambda;_) input coin, _x_/_y_ = 1/(_t_ &minus; _&epsilon;), _i_ = 1 (for the 2019 algorithm), and _&#x03F5;_ = _&epsilon;_.  If any of these calls returns 0, return 0.  Otherwise, return 1."
2. Call the **2014 algorithm**, the **2016 algorithm**, or the **2019 algorithm** once, using the _&nu;_ input coin described earlier, _x_/_y_ = _t_/_&epsilon;, _i_ = 1 (for the 2019 algorithm), and _&#x03F5;_ = _&epsilon;_, and return the result.

<a id=exp_minus___lambda></a>
#### exp(&minus;_&lambda;_)

This algorithm converges quickly everywhere in (0, 1).  (In other words, the algorithm is _uniformly fast_, meaning the average running time is bounded from above by the same constant for all choices of _&lambda;_ and other parameters (Devroye 1986, esp. p. 717)<sup>[**(9)**](#Note9)</sup>.<sup>[**(10)**](#Note10)</sup>) This algorithm is adapted from the general martingale algorithm (in "Certain Power Series", above), and makes use of the fact that exp(&minus;_&lambda;_) can be rewritten as 1 &minus; _&lambda;_ + _&lambda;_<sup>2</sup>/2 &minus; _&lambda;_<sup>3</sup>/6 + _&lambda;_<sup>4</sup>/24 &minus; ..., which is an alternating series whose coefficients are 1, 1, 1/(2!), 1/(3!), 1/(4!), ....

1. Set _u_ to 1, set _w_ to 1, set _&#x2113;_ to 0, and set _n_ to 1.
2. Generate a uniform(0, 1) random number _ret_.
3. If _w_ is not 0, flip the input coin, multiply _w_ by the result of the flip, and divide _w_ by _n_. (This is changed from the general martingale algorithm to take account of the factorial more efficiently in the second and later coefficients.)
4. If _n_ is even, set _u_ to _&#x2113;_ + _w_.  Otherwise, set _&#x2113;_ to _u_ &minus; _w_.
5. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  If _ret_ is less than _u_, go to the next step.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
6. Add 1 to _n_ and go to step 3.

See the appendix for other algorithms.

<a id=exp_minus___lambda___k___x></a>
#### exp(&minus;(_&lambda;_<sup>_k_</sup> * _x_))

In the following algorithm, which applies the general martingale algorithm, _k_ is an integer 0 or greater, and _x_ is a rational number in the interval \[0, 1\].  It represents the series 1 &minus; _&lambda;_<sup>_k_</sup>\*_x_ + _&lambda;_<sup>2\*_k_</sup>\*_x_/2! &minus; _&lambda;_<sup>3\*_k_</sup>\*_x_/3!, ..., and the coefficients are 1, _x_, _x_/(2!), _x_/(3!), ....

1. Special cases: If _x_ is 0, return 1.  If _k_ is 0, run the **algorithm for exp(&minus;_x_/_y_)** (given later in this page) with _x_/_y_ = _x_, and return the result.
2. Set _u_ to 1, set _w_ to 1, set _&#x2113;_ to 0, and set _n_ to 1.
3. Generate a uniform(0, 1) random number _ret_.
4. If _w_ is not 0, flip the input coin _k_ times or until the flip returns 0.  If any of the flips returns 0, set _w_ to 0, or if all the flips return 1, divide _w_ by _n_.  Then, multiply _w_ by a number that is 1 with probability _x_ and 0 otherwise.
5. If _n_ is even, set _u_ to _&#x2113;_ + _w_.  Otherwise, set _&#x2113;_ to _u_ &minus; _w_.
6. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  If _ret_ is less than _u_, go to the next step.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
7. Add 1 to _n_ and go to step 4.

<a id=exp_minus___lambda___k___x___m></a>
#### exp(&minus;(_&lambda;_<sup>_k_</sup> * (_x_ + _m_)))

In the following algorithm, _k_ and _m_ are both integers 0 or greater, and _x_ is a rational number in the interval \[0, 1\].

1. Call the **algorithm for exp(&minus;(_&lambda;_<sup>_k_</sup> * _x_))** _m_ times with _k_ = _k_ and _x_ = 1.  If any of these calls returns 0, return 0.
2. If _x_ is 0, return 1.
3. Call the **algorithm for exp(&minus;(_&lambda;_<sup>_k_</sup> * _x_))** once, with _k_ = _k_ and _x_ = _x_.  Return the result of this call.

<a id=exp_minus___lambda____m___k></a>
#### exp(&minus;(_&lambda;_ + _m_)<sup>_k_</sup>)

In the following algorithm, _m_ and _k_ are both integers 0 or greater.

1. If _k_ is 0, run the **algorithm for exp(&minus;_x_/_y_)** (given later on this page) with _x_/_y_ = 1/1, and return the result.
2. If _k_ is 1 and _m_ is 0, run the **algorithm for exp(&minus;_&lambda;_)** and return the result.
3. Run the **algorithm for exp(&minus;_x_/_y_)** with _x_/_y_ = _m_<sup>_k_</sup> / 1.  If the algorithm returns 0, return 0.
4. Run the **algorithm for exp(&minus;(_&lambda;_<sup>_k_</sup> * _x_))**, with _k_ = _k_ and _x_ = 1.  If the algorithm returns 0, return 0.
5. If _m_ is 0, return 1.
6. Set _i_ to 1, then while _i_ < _k_:
     1. Set _z_ to choose(_k_, _i_) * _m_<sup>_k_ &minus; _i_</sup>.
     2. Run the **algorithm for exp(&minus;(_&lambda;_<sup>_k_</sup> * _x_))** _z_ times, with _k_ = _i_ and _x_ = 1.  If any of these calls returns 0, return 0.
     3. Add 1 to _i_.
7. Return 1.

<a id=exp___lambda___1_minus___lambda></a>
#### exp(_&lambda;_)*(1&minus;_&lambda;_)

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>:

1. Set _k_ and _w_ each to 0.
2. Flip the input coin.  If it returns 0, return 1.
3. Generate a uniform(0, 1) random number _U_.
4. If _k_ > 0 and _w_ is less than _U_, return 0.
5. Set _w_ to _U_, add 1 to _k_, and go to step 2.

<a id=1_minus___lambda___cos___lambda></a>
#### (1&minus;_&lambda;_)/cos(_&lambda;_)

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>:

1. Flip the input coin until the flip returns 0.  Then set _G_ to the number of times the flip returns 1 this way.
2. If _G_ is **odd**, return 0.
3. Generate a uniform(0, 1) random number _U_, then set _i_ to 1.
4. While _i_ is less than _G_:
    1. Generate a uniform(0, 1) random number _V_.
    2. If _i_ is odd and _V_ is less than _U_, return 0.
    3. If _i_ is even and _U_ is less than _V_, return 0.
    4. Add 1 to _i_, then set _U_ to _V_.
5. Return 1.

<a id=1_minus___lambda___tan___lambda></a>
#### (1&minus;_&lambda;_) * tan(_&lambda;_)

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>:

1. Flip the input coin until the flip returns 0.  Then set _G_ to the number of times the flip returns 1 this way.
2. If _G_ is **even**, return 0.
3. Generate a uniform(0, 1) random number _U_, then set _i_ to 1.
4. While _i_ is less than _G_:
    1. Generate a uniform(0, 1) random number _V_.
    2. If _i_ is odd and _V_ is less than _U_, return 0.
    3. If _i_ is even and _U_ is less than _V_, return 0.
    4. Add 1 to _i_, then set _U_ to _V_.
5. Return 1.

<a id=exp___lambda____c__minus__c></a>
#### exp(_&lambda;_ * _c_ &minus; _c_)

Used in (Dughmi et al. 2017)<sup>[**(11)**](#Note11)</sup> to apply an exponential weight (here, _c_) to an input coin.

1. Generate a Poisson(_c_) random integer, call it _N_.
2. Flip the input coin until the flip returns 0 or the coin is flipped _N_ times, whichever comes first.  Return 1 if all the coin flips, including the last, returned 1 (or if _N_ is 0); or return 0 otherwise.

<a id=exp_minus___lambda___minus__c></a>
#### exp(&minus;_&lambda;_ &minus; _c_)

To the best of my knowledge, I am not aware of any article or paper by others that presents this particular Bernoulli factory. In this algorithm, _c_ is an integer that is 0 or greater.

1. Run the **algorithm for exp(&minus;_c_/1)** described later in this document.  Return 0 if the algorithm returns 0.
2. Return the result of the **algorithm for exp(&minus;_&lambda;_)**.

<a id=1_2_k____lambda___or_exp_minus__k____lambda___ln_2></a>
#### 1/(2<sup>_k_ + _&lambda;_</sup>) or exp(&minus;(_k_ + _&lambda;_)\*ln(2))

This new algorithm uses the base-2 logarithm _k_ + _&lambda;_, where _k_ is an integer 0 or greater, and is useful when this logarithm is very large.

1. If _k_ &gt; 0, generate unbiased random bits until a zero bit or _k_ bits were generated this way, whichever comes first.  If a zero bit was generated this way, return 0.
2. Create an input coin _&mu;_ that does the following: "Flip the input coin, then run the **algorithm for ln(2)** (given later).  If both the call and the flip return 1, return 1.  Otherwise, return 0."
3. Run the **algorithm for exp(&minus;&mu;)** using the _&mu;_ input coin, and return the result.

<a id=1_2_m___k____lambda___or_1_2_m___k____lambda___or_exp_minus__k____lambda___ln_2_m></a>
#### 1/(2<sup>_m_\*(_k_ + _&lambda;_)</sup>) or 1/((2<sup>_m_</sup>)\*(_k_ + _&lambda;_)) or exp(&minus;(_k_ + _&lambda;_)\*ln(2<sup>_m_</sup>))

An extension of the previous algorithm.  Here, _m_ is an integer greater than 0.

1. If _k_ &gt; 0, generate unbiased random bits until a zero bit or _k_\*_m_ bits were generated this way, whichever comes first.  If a zero bit was generated this way, return 0.
2. Create an input coin _&mu;_ that does the following: "Flip the input coin, then run the **algorithm for ln(2)** (given later).  If both the call and the flip return 1, return 1.  Otherwise, return 0."
3. Run the **algorithm for exp(&minus;&mu;)** _m_ times, using the _&mu;_ input coin.  If any of the calls returns 0, return 0.  Otherwise, return 1.

<a id=1_1___lambda></a>
#### 1/(1+_&lambda;_)

This algorithm is a special case of the two-coin Bernoulli factory of (Gonçalves et al., 2017)<sup>[**(12)**](#Note12)</sup> and is uniformly fast.  It will be called the **two-coin special case** in this document.<sup>[**(13)**](#Note13)</sup>

1. With probability 1/2, return 1. (For example, generate either 0 or 1 with equal probability, that is, an unbiased random bit, and return 1 if that bit is 1.)
2. Flip the input coin.  If it returns 1, return 0.  Otherwise, go to step 1.

<a id=lambda___1___lambda></a>
#### _&lambda;_/(1+_&lambda;_)

Return 1 minus the result of the **algorithm for 1/(1+_&lambda;_)**.

<a id=ln_1___lambda></a>
#### ln(1+_&lambda;_)

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>:

1. Generate a uniform(0, 1) random number _u_.
2. Flip the input coin.  If it returns 0, flip the coin again and return the result.
3. [**Sample from the number _u_**](#Algorithms). If the result is 0, flip the input coin and return the result.
4. Flip the input coin.  If it returns 0, return 0.
5. [**Sample from the number _u_**](#Algorithms). If the result is 0, return 0.  Otherwise, go to step 2.

Observing that the even-parity construction used in the Flajolet paper is equivalent to the two-coin special case, which is uniformly fast for all _&lambda;_ parameters, the algorithm above can be made uniformly fast as follows:

1. With probability 1/2, flip the input coin and return the result.
2. Generate a uniform(0, 1) random number _u_, if _u_ wasn't generated yet.
3. [**Sample from the number _u_**](#Algorithms), then flip the input coin.  If the call and the flip both return 1, return 0.  Otherwise, go to step 1.

<a id=1_minus_ln_1___lambda></a>
#### 1 &minus; ln(1+_&lambda;_)

Invert the result of the algorithm for ln(1+_&lambda;_) (make it 1 if it's 0 and vice versa).<sup>[**(14)**](#Note14)</sup>

<a id=c____lambda_____beta_____beta____c____lambda____d____mu___minus___beta___minus_1__c___d></a>
#### _c_ * _&lambda;_ * _&beta;_ / (_&beta;_ * (_c_ * _&lambda;_ + _d_ * _&mu;_) &minus; (_&beta;_ &minus; 1) * (_c_ + _d_))

This is the general two-coin algorithm of (Gonçalves et al., 2017)<sup>[**(12)**](#Note12)</sup> and (Vats et al. 2020)<sup>[**(15)**](#Note15)</sup>.  It takes two input coins that each output heads (1) with probability _&lambda;_ or _&mu;_, respectively.  It also takes a parameter _&beta;_ in the interval \[0, 1\], which is a so-called "portkey" or early rejection parameter (when _&beta;_ = 1, the formula simplifies to _c_ * _&lambda;_ / (_c_ * _&lambda;_ + _d_ * _&mu;_)).

1. With probability _&beta;_, go to step 2.  Otherwise, return 0. (For example, call `ZeroOrOne` with _&beta;_'s numerator and denominator, and return 0 if that call returns 0, or go to step 2 otherwise.  `ZeroOrOne` is described in my article on [**random sampling methods**](https://peteroupc.github.io/randomfunc.html#Boolean_True_False_Conditions).)
2. With probability _c_ / (_c_ + _d_), flip the _&lambda;_ input coin.  Otherwise, flip the _&mu;_ input coin.  If the _&lambda;_ input coin returns 1, return 1.  If the _&mu;_ input coin returns 1, return 0.  If the corresponding coin returns 0, go to step 1.

<a id=c____lambda____c____lambda____d__or__c___d____lambda___1__c___d____lambda></a>
#### _c_ * _&lambda;_ / (_c_ * _&lambda;_ + _d_) or (_c_/_d_) * _&lambda;_ / (1 + (_c_/_d_) * _&lambda;_))

This algorithm, also known as the **logistic Bernoulli factory** (Huber 2016)<sup>[**(16)**](#Note16)</sup>, (Morina et al., 2019)<sup>[**(17)**](#Note17)</sup>, is a special case of the two-coin algorithm above, but this time uses only one input coin.

1. With probability _d_ / (_c_ + _d_), return 0.
2. Flip the input coin.  If the flip returns 1, return 1.  Otherwise, go to step 1.

(Note that Huber \[2016\] specifies this Bernoulli factory in terms of a Poisson point process, which seems to require much more randomness on average.)

<a id=1__c____lambda></a>
#### 1 / (_c_ + _&lambda;_)

In this algorithm, _c_ must be 1 or greater.  For example, this algorithm can simulate a probability of the form 1 / _z_, where _z_ is greater than 0 and made up of an integer part (_c_) and a fractional part (_&lambda;_) that can be simulated by a Bernoulli factory.  See also the algorithms for continued fractions.

1. With probability _c_ / (1 + _c_), return a number that is 1 with probability 1/_c_ and 0 otherwise.
2. Flip the input coin.  If the flip returns 1, return 0.  Otherwise, go to step 1.

<a id=d____lambda____c></a>
#### (_d_ + _&lambda;_) / _c_

This algorithm currently works only if _d_ and _c_ are integers and 0 <= _d_ < _c_.

1. Generate an integer in [0, _c_) uniformly at random, call it _i_.
2. If _i_ < _d_, return 1.  If _i_ = _d_, flip the input coin and return the result.  If neither is the case, go to step 1.

<a id=d___c____lambda></a>
#### _d_ / (_c_ + _&lambda;_)

In this algorithm, _c_ must be 1 or greater and _d_ must be in the interval \[0, _c_\].  See also the algorithms for continued fractions.

1. With probability _c_ / (1 + _c_), return a number that is 1 with probability _d_/_c_ and 0 otherwise.
2. Flip the input coin.  If the flip returns 1, return 0.  Otherwise, go to step 1.

<a id=d____mu____c____lambda></a>
#### (_d_ + _&mu;_) / (_c_ + _&lambda;_)

Combines the algorithms in the previous two sections.  This algorithm currently works only if _d_ and _c_ are integers and 0 <= _d_ < _c_.

1. With probability _c_ / (1 + _c_), do the following:
    1. Generate an integer in [0, _c_) uniformly at random, call it _i_.
    2. If _i_ < _d_, return 1.  If _i_ = _d_, flip the _&mu;_ input coin and return the result.  If neither is the case, go to the previous substep.
2. Flip the _&lambda;_ input coin.  If the flip returns 1, return 0.  Otherwise, go to step 1.

<a id=d__k___c____lambda____k__or__d___c____lambda____k></a>
#### _d_<sup>_k_</sup> / (_c_ + _&lambda;_)<sup>_k_</sup>, or (_d_ / (_c_ + _&lambda;_))<sup>_k_</sup>

In this algorithm, _c_ must be 1 or greater, _d_ must be in the interval \[0, _c_\], and _k_ must be an integer 0 or greater.

1. Set _i_ to 0.
2. If _k_ is 0, return 1.
3. With probability _c_ / (1 + _c_), do the following:
    1. With probability _d_/_c_, add 1 to _i_ and then either return 1 if _i_ is now _k_ or greater, or abort these substeps and go to step 2 otherwise.
    2. Return 0.
4. Flip the input coin.  If the flip returns 1, return 0.  Otherwise, go to step 2.

<a id=lambda_____mu></a>
#### _&lambda;_ + _&mu;_

(Nacu and Peres 2005, proposition 14(iii))<sup>[**(5)**](#Note5)</sup>.  This algorithm takes two input coins that simulate _&lambda;_ or _&mu;_, respectively, and a parameter _&#x03F5;_, which must be greater than 0 and chosen such that _&lambda;_ + _&mu;_ < 1 &minus; _&#x03F5;_.

1. Create a _&nu;_ input coin that does the following: "With probability 1/2, flip the _&lambda;_ input coin and return the result.  Otherwise, flip the _&mu;_ input coin and return the result."
2. Call the **2014 algorithm**, the **2016 algorithm**, or the **2019 algorithm**, described later, using the _&nu;_ input coin, _x_/_y_ = 2/1, _i_ = 1 (for the 2019 algorithm), and _&#x03F5;_ = _&#x03F5;_, and return the result.

<a id=lambda___minus___mu></a>
#### _&lambda;_ &minus; _&mu;_

(Nacu and Peres 2005, proposition 14(iii-iv))<sup>[**(5)**](#Note5)</sup>.  This algorithm takes two input coins that simulate _&lambda;_ or _&mu;_, respectively, and a parameter _&#x03F5;_, which must be greater than 0 and chosen such that _&lambda;_ &minus; _&mu;_ > _&#x03F5;_ (and should be chosen such that _&#x03F5;_ is slightly less than _&lambda;_ &minus; _&mu;_).

1. Create a _&nu;_ input coin that does the following: "With probability 1/2, flip the _&lambda;_ input coin and return **1 minus the result**.  Otherwise, flip the _&mu;_ input coin and return the result."
2. Call the **2014 algorithm**, the **2016 algorithm**, or the **2019 algorithm**, described later, using the _&nu;_ input coin, _x_/_y_ = 2/1, _i_ = 1 (for the 2019 algorithm), and _&#x03F5;_ = _&#x03F5;_, and return 1 minus the result.

<a id=1__c____lambda_2></a>
#### 1/(_c_ + _&lambda;_)

Works only if _c_ > 0.

1. With probability _c_/(1 + _c_), return a number that is 1 with probability 1/_c_ and 0 otherwise.
2. Flip the input coin.  If the flip returns 1, return 0.  Otherwise, go to step 1.

<a id=1_minus___lambda></a>
#### 1 &minus; _&lambda;_

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>: Flip the _&lambda;_ input coin and return 0 if the result is 1, or 1 otherwise.

<a id=nu_____lambda___1_minus___nu_____mu></a>
#### _&nu;_ * _&lambda;_ + (1 &minus; _&nu;_) * _&mu;_

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>: Flip the _&nu;_ input coin.  If the result is 0, flip the _&lambda;_ input coin and return the result.  Otherwise, flip the _&mu;_ input coin and return the result.

<a id=lambda_____mu___minus___lambda_____mu></a>
#### _&lambda;_ + _&mu;_ &minus; (_&lambda;_ * _&mu;_)

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>: Flip the _&lambda;_ input coin and the _&mu;_ input coin.  Return 1 if either flip returns 1, and 0 otherwise.

<a id=lambda_____mu___2></a>
#### (_&lambda;_ + _&mu;_) / 2

(Nacu and Peres 2005, proposition 14(iii))<sup>[**(5)**](#Note5)</sup>; (Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>: With probability 1/2, flip the _&lambda;_ input coin and return the result.  Otherwise, flip the _&mu;_ input coin and return the result.

<a id=arctan___lambda_____lambda></a>
#### arctan(_&lambda;_) /_&lambda;_

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>:

1. Generate a uniform(0, 1) random number _u_.
2. [**Sample from the number _u_**](#Algorithms) twice, and flip the input coin twice.  If any of these calls or flips returns 0, return 1.
3. [**Sample from the number _u_**](#Algorithms) twice, and flip the input coin twice.  If any of these calls or flips returns 0, return 0.  Otherwise, go to step 2.

Observing that the even-parity construction used in the Flajolet paper is equivalent to the two-coin special case, which is uniformly fast for all _&lambda;_ parameters, the algorithm above can be made uniformly fast as follows:

1. With probability 1/2, return 1.
2. Generate a uniform(0, 1) random number _u_, if it wasn't generated yet.
3. [**Sample from the number _u_**](#Algorithms) twice, and flip the input coin twice.  If all of these calls and flips return 1, return 0.  Otherwise, go to step 1.

<a id=arctan___lambda></a>
#### arctan(_&lambda;_)

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>: Call the **algorithm for arctan(_&lambda;_) /_&lambda;_** and flip the input coin.  Return 1 if the call and flip both return 1, or 0 otherwise.

<a id=cos___lambda></a>
#### cos(_&lambda;_)

This algorithm adapts the general martingale algorithm for this function's series expansion.  In fact, this is a special case of Algorithm 3 of (Łatuszyński et al. 2009/2011)<sup>[**(8)**](#Note8)</sup> (which is more general than Proposition 3.4, the general martingale algorithm). The series expansion for cos(_&lambda;_) is 1 &minus; _&lambda;_<sup>2</sup>/(2!) + _&lambda;_<sup>4</sup>/(4!) &minus; ..., which is an alternating series except the exponent is increased by 2 (rather than 1) with each term.  The coefficients are thus 1, 1/(2!), 1/(4!), ....  A _lower truncation_ of the series is a truncation of that series that ends with a minus term, and the corresponding _upper truncation_ is the same truncation but without the last minus term.  This series expansion meets the requirements of Algorithm 3 because&mdash;

- the lower truncation is less than or equal to its corresponding upper truncation almost surely,
- the lower and upper truncations are in the interval [0, 1],
- each lower truncation is greater than or equal to the previous lower truncation almost surely,
- each upper truncation is less than or equal to the previous upper truncation almost surely, and
- the lower and upper truncations have an expected value that approaches _&lambda;_ from below and above.

The algorithm to simulate cos(_&lambda;_) follows.

1. Set _u_ to 1, set _w_ to 1, set _&#x2113;_ to 0, set _n_ to 1, and set _fac_ to 2.
2. Generate a uniform(0, 1) random number _ret_.
3. If _w_ is not 0, flip the input coin. If the flip returns 0, set _w_ to 0. Do this step again. (Note that in the general martingale algorithm, only one coin is flipped in this step. Up to two coins are flipped instead because the exponent increases by 2 rather than 1.)
4. If _n_ is even, set _u_ to _&#x2113;_ + _w_ / _fac_.  Otherwise, set _&#x2113;_ to _u_ &minus; _w_ / _fac_. (Here we divide by the factorial of 2-times-_n_.)
5. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  If _ret_ is less than _u_, go to the next step.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
6. Add 1 to _n_, then multiply _fac_ by (_n_ * 2 &minus; 1) * (_n_ * 2), then go to step 3.

<a id=sin___lambda></a>
#### sin(_&lambda;_)

This algorithm is likewise a special case of Algorithm 3 of (Łatuszyński et al. 2009/2011)<sup>[**(8)**](#Note8)</sup>.  sin(_&lambda;_) can be rewritten as _&lambda;_ * (1 &minus; _&lambda;_<sup>2</sup>/(3!) + _&lambda;_<sup>4</sup>/(5!) &minus; ...), which includes an alternating series where the exponent is increased by 2 (rather than 1) with each term.  The coefficients are thus 1, 1/(3!), 1/(5!), .... This series expansion meets the requirements of Algorithm 3 for the same reasons as the cos(_&lambda;_) series does.

The algorithm to simulate sin(_&lambda;_) follows.

1. Flip the input coin.  If it returns 0, return 0.
2. Set _u_ to 1, set _w_ to 1, set _&#x2113;_ to 0, set _n_ to 1, and set _fac_ to 6.
3. Generate a uniform(0, 1) random number _ret_.
4. If _w_ is not 0, flip the input coin. If the flip returns 0, set _w_ to 0. Do this step again.
5. If _n_ is even, set _u_ to _&#x2113;_ + _w_ / _fac_.  Otherwise, set _&#x2113;_ to _u_ &minus; _w_ / _fac_.
6. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  If _ret_ is less than _u_, go to the next step.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
7. Add 1 to _n_, then multiply _fac_ by (_n_ * 2) * (_n_ * 2 + 1), then go to step 4.

<a id=lambda___x___y></a>
#### _&lambda;_<sup>_x_/_y_</sup>

In the algorithm below, the case where _x_/_y_ is in (0, 1) is due to recent work by Mendo (2019)<sup>[**(7)**](#Note7)</sup>.  The algorithm works only when _x_/_y_ is 0 or greater.

1. If _x_/_y_ is 0, return 1.
2. If _x_/_y_ is equal to 1, flip the input coin and return the result.
3. If _x_/_y_ is greater than 1:
    1. Set _ipart_ to floor(_x_/_y_) and _fpart_ to `rem(x, y)`.
    2. If _fpart_ is greater than 0, subtract 1 from _ipart_, then call this algorithm recursively with _x_ = floor(_fpart_/2) and _y_ = _y_, then call this algorithm, again recursively, with _x_ = _fpart_ &minus; floor(_fpart_/2) and _y_ = _y_. Return 0 if either call returns 0.  (This is done rather than the more obvious approach in order to avoid calling this algorithm with fractional parts very close to 0, because the algorithm runs much more slowly than for fractional parts closer to 1.)
    3. If _ipart_ is 1 or greater, flip the input coin _ipart_ many times.  Return 0 if any of these flips returns 1.
    4. Return 1.
4. _x_/_y_ is less than 1, so set _i_ to 1.
5. Flip the input coin; if it returns 1, return 1.
6. With probability _x_/(_y_*_i_), return 0.
7. Add 1 to _i_ and go to step 5.

> **Note:** When _x_/_y_ is less than 1, the minimum number of coin flips needed, on average, by this algorithm will grow without bound as _&lambda;_ approaches 0.  In fact, no fast Bernoulli factory algorithm can avoid this unbounded growth without additional information on _&lambda;_ (Mendo 2019)<sup>[**(7)**](#Note7)</sup>.  See also the appendix, which also shows an alternative way to implement this and other Bernoulli factory algorithms using partially-sampled random numbers (PSRNs), which exploits knowledge of _&lambda;_ but is not the focus of this article since it involves arithmetic.

<a id=lambda____mu></a>
#### _&lambda;_<sup>_&mu;_</sup>

This algorithm is based on the previous one, but changed to accept a second input coin (which outputs heads with probability _&mu;_) rather than a fixed value for the exponent. To the best of my knowledge, I am not aware of any article or paper by others that presents this particular Bernoulli factory.

1. Set _i_ to 1.
2. Flip the input coin that simulates the base, _&lambda;_; if it returns 1, return 1.
3. Flip the input coin that simulates the exponent, _&mu;_; if it returns 1, return 0 with probability 1/_i_.
4. Add 1 to _i_ and go to step 1.

<a id=sqrt___lambda></a>
#### sqrt(_&lambda;_)

Use the algorithm for _&lambda;_<sup>1/2</sup>.

<a id=arcsin___lambda___sqrt_1_minus___lambda__2_minus_1></a>
#### arcsin(_&lambda;_) + sqrt(1 &minus; _&lambda;_<sup>2</sup>) &minus; 1

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>.  The algorithm given here uses the special two-coin case rather than the even-parity construction.

1. Generate a uniform(0, 1) random number _u_.
2. Create a secondary coin _&mu;_ that does the following: "[**Sample from the number _u_**](#Algorithms) twice, and flip the input coin twice.  If all of these calls and flips return 1, return 0.  Otherwise, return 1."
3. Call the **algorithm for _&mu;_<sup>1/2</sup>** using the secondary coin _&mu;_.  If it returns 0, return 0.
4. With probability 1/2, flip the input coin and return the result.
5. [**Sample from the number _u_**](#Algorithms) once, and flip the input coin once.  If both the call and flip return 1, return 0.  Otherwise, go to step 4.

<a id=arcsin___lambda___2></a>
#### arcsin(_&lambda;_) / 2

The Flajolet paper doesn't explain in detail how arcsin(_&lambda;_)/2 arises out of arcsin(_&lambda;_) + sqrt(1 &minus; _&lambda;_<sup>2</sup>) &minus; 1 via Bernoulli factory constructions, but here is an algorithm.<sup>[**(18)**](#Note18)</sup> However, the number of input coin flips is expected to grow without bound as _&lambda;_ approaches 1.

1. With probability 1/2, run the **algorithm for arcsin(_&lambda;_) + sqrt(1 &minus; _&lambda;_<sup>2</sup>) &minus; 1** and return the result.
2. Create a secondary coin _&mu;_ that does the following: "Flip the input coin twice.  If both flips return 1, return 0.  Otherwise, return 1." (The coin simulates 1 &minus; _&lambda;_<sup>2</sup>.)
3. Call the **algorithm for _&mu;_<sup>1/2</sup>** using the secondary coin _&mu;_.  If it returns 0, return 1; otherwise, return 0. (This step effectively cancels out the sqrt(1 &minus; _&lambda;_<sup>2</sup>) &minus; 1 part and divides by 2.)

<a id=lambda_____mu_2></a>
#### _&lambda;_ * _&mu;_

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>: Flip the _&lambda;_ input coin and the _&mu;_ input coin.  Return 1 if both flips return 1, and 0 otherwise.

<a id=lambda____x___y__linear_Bernoulli_factories></a>
#### _&lambda;_ * _x_/_y_ (linear Bernoulli factories)

In general, this function will touch 0 or 1 somewhere in \[0, 1\], when _x_/_y_ > 1.  This makes the function relatively non-trivial to simulate in this case.

Huber has suggested several algorithms for this function over the years.

The first algorithm is called the **2014 algorithm** in this document (Huber 2014)<sup>[**(4)**](#Note4)</sup>.  It uses three parameters: _x_, _y_, and _&#x03F5;_, such that _x_/_y_ > 0 and _&#x03F5;_ is greater than 0.  When _x_/_y_ is greater than 1, the _&#x03F5;_ parameter has to be chosen such that _&lambda;_ * _x_/_y_ < 1 &minus; _&#x03F5;_, in order to bound the function away from 0 and 1.  As a result, some knowledge of _&lambda;_ has to be available to the algorithm.  (In fact, as simulation results show, the choice of _&#x03F5;_ is crucial to this algorithm's performance; for best results, _&#x03F5;_ should be chosen such that _&lambda;_ * _x_/_y_ is slightly less than 1 &minus; _&#x03F5;_.) The algorithm as described below also includes certain special cases, not mentioned in Huber, to make it more general.

1. Special cases: If _x_ is 0, return 0.  Otherwise, if _x_ equals _y_, flip the input coin and return the result.  Otherwise, if _x_ is less than _y_, then: (a) With probability _x_/_y_, flip the input coin and return the result; otherwise (b) return 0.
2. Set _c_ to _x_/_y_, and set _k_ to 23 / (5 * _&#x03F5;_).
3. If _&#x03F5;_ is greater than 644/1000, set _&#x03F5;_ to 644/1000.
4. Set _i_ to 1.
5. Flip the input coin.  If it returns 0, then generate numbers that are each 1 with probability (_c_ &minus; 1) / _c_ and 0 otherwise, until 0 is generated this way, then add 1 to _i_ for each number generated this way (including the last).
6. Subtract 1 from _i_, then if _i_ is 0, return 1.
7. If _i_ is less than _k_, go to step 5.
8. If _i_ is _k_ or greater:
    1. Generate _i_ numbers that are each 1 with probability 2 / (_&#x03F5;_ + 2) or 0 otherwise.  If any of those numbers is 0, return 0.
    2. Multiply _c_ by 2 / (_&#x03F5;_ + 2), divide _&#x03F5;_ by 2, and multiply _k_ by 2.
9. If _i_ is 0, return 1.  Otherwise, go to step 5.

The second algorithm is called the **2016 algorithm** (Huber 2016)<sup>[**(16)**](#Note16)</sup> and uses the same parameters _x_, _y_, and _&#x03F5;_, and its description uses the same special cases.  The difference here is that it involves a so-called "logistic Bernoulli factory", which is replaced in this document with a different one that simulates the same function.  When _x_/_y_ is greater than 1, the _&#x03F5;_ parameter has to be chosen such that _&lambda;_ * _x_/_y_ <= 1 &minus; _&#x03F5;_.

1. The same special cases as for the 2014 algorithm apply.
2. Set _m_ to ceil(1 + 9 / (2 * _&#x03F5;_)).
3. Set _&beta;_ to 1 + 1 / (_m_ &minus; 1).
4. **Algorithm A** is what Huber calls this step.  Set _s_ to 1, then while _s_ is greater than 0 and less than _m_:
    1. Run the **logistic Bernoulli factory** algorithm with _c_/_d_ = _&beta;_ * _x_/_y_.
    2. Set _s_ to _s_ &minus; _z_ * 2 + 1, where _z_ is the result of the logistic Bernoulli factory.
5. If _s_ is other than 0, return 0.
6. With probability 1/_&beta;_, return 1.
7. Run this algorithm recursively, with _x_/_y_ = _&beta;_ * _x_/_y_ and _&#x03F5;_ = 1 &minus; _&beta;_ * (1 &minus; _&#x03F5;_).  If it returns 0, return 0.
8. The **high-power logistic Bernoulli factory** is what Huber calls this step.  Set _s_ to 1, then while _s_ is greater than 0 and less than or equal to _m_ minus 2:
    1. Run the **logistic Bernoulli factory** algorithm with _c_/_d_ = _&beta;_ * _x_/_y_.
    2. Set _s_ to _s_ + _z_ * 2 &minus; 1, where _z_ is the result of the logistic Bernoulli factory.
9. If _s_ is equal to _m_ minus 1, return 1.
10. Subtract 1 from _m_ and go to step 7.

The paper that presented the 2016 algorithm also included a third algorithm, described below, that works only if _&lambda;_ * _x_ / _y_ is known to be less than 1/2.  This third algorithm takes three parameters: _x_, _y_, and _m_, and _m_ has to be chosen such that _&lambda;_ * _x_ / _y_ <= _m_ < 1/2.

1. The same special cases as for the 2014 algorithm apply.
2. Run the **logistic Bernoulli factory** algorithm with _c_/_d_ = (_x_/_y_) / (1 &minus; 2 * _m_).  If it returns 0, return 0.
3. With probability 1 &minus; 2 * _m_, return 1.
4. Run the 2014 algorithm or 2016 algorithm with _x_/_y_ = (_x_/_y_) / (2 * _m_) and _&#x03F5;_ = 1 &minus; _m_.

<a id=lambda____x___y___i></a>
#### (_&lambda;_ * _x_/_y_)<sup>_i_</sup>

(Huber 2019)<sup>[**(19)**](#Note19)</sup>.  This algorithm, called the **2019 algorithm** in this document, uses four parameters: _x_, _y_, _i_, and _&#x03F5;_, such that _x_/_y_ > 0, _i_ >= 0 is an integer, and _&#x03F5;_ is greater than 0.  When _x_/_y_ is greater than 1, the _&#x03F5;_ parameter has to be chosen such that _&lambda;_ * _x_/_y_ < 1 &minus; _&#x03F5;_.  It also has special cases not mentioned in Huber 2019.

1.  Special cases: If _i_ is 0, return 1.  If _x_ is 0, return 0.  Otherwise, if _x_ equals _y_ and _i_ equals 1, flip the input coin and return the result.
2. Special case: If _x_ is less than _y_ and _i_ = 1, then: (a) With probability _x_/_y_, flip the input coin and return the result; otherwise (b) return 0.
3. Special case: If _x_ is less than _y_, then create a secondary coin _&mu;_ that does the following: "(a) With probability _x_/_y_, flip the input coin and return the result; otherwise (b) return 0", then run the **algorithm for (_&mu;_<sup>_i_/1</sup>)** (described earlier) using this secondary coin.
4. Set _t_ to 355/100 and _c_ to _x_/_y_.
5. If _i_ is 0, return 1.
6. While _i_ = _t_ / _&#x03F5;_:
    1. Set _&beta;_ to (1 &minus; _&#x03F5;_ / 2) / (1 &minus; _&#x03F5;_).
    2. Run the **algorithm for (1/_&beta;_)<sup>_i_</sup>** (the algorithm labeled **_x_<sup>_y_</sup>** and given in the irrational constants section).  If it returns 0, return 0.
    3. Multiply _c_ by _&beta;_, then divide _&#x03F5;_ by 2.
7. Run the **logistic Bernoulli factory** with _c_/_d_ = _c_, then set _z_ to the result.  Set _i_ to _i_ + 1 &minus; _z_ * 2, then go to step 5.

<a id=x03F5_____lambda></a>
#### _&#x03F5;_ / _&lambda;_

(Lee et al. 2014)<sup>[**(20)**](#Note20)</sup>  This algorithm, in addition to the input coin, takes a parameter _&#x03F5;_, which must be greater than 0 and be chosen such that _&#x03F5;_ is less than _&lambda;_.

1. Set _&beta;_ to max(_&#x03F5;_, 1/2) and set _&gamma;_ to 1 &minus; (1 &minus; _&beta;_) / (1 &minus; (_&beta;_ / 2)).
2. Create a _&mu;_ input coin that flips the input coin and returns 1 minus the result.
3. With probability _&#x03F5;_, return 1.
4. Run the **2014 algorithm**, **2016 algorithm**, or **2019 algorithm**, with the _&mu;_ input coin, _x_/_y_ = 1 / (1 &minus; _&#x03F5;_),  _i_ = 1 (for the 2019 algorithm), and _&#x03F5;_ = _&gamma;_. If the result is 0, return 0.  Otherwise, go to step 3.  (Note that running the algorithm this way simulates the probability (_&lambda;_ &minus; _&#x03F5;_)/(1 &minus; _&#x03F5;_) or 1 &minus; (1 &minus; _&lambda;_)/(1 &minus; _&#x03F5;_)).

<a id=Certain_Rational_Functions></a>
#### Certain Rational Functions

According to (Mossel and Peres 2005)<sup>[**(21)**](#Note21)</sup>, a function can be simulated by a finite-state machine (equivalently, a "probabilistic regular grammar" (Smith and Johnson 2007)<sup>[**(22)**](#Note22)</sup>, (Icard 2019)<sup>[**(23)**](#Note23)</sup>) if and only if the function can be written as a rational function (ratio of polynomials) with rational coefficients, that takes in an input _&lambda;_ in some subset of (0, 1) and outputs a number in the interval (0, 1).

The following algorithm is suggested from the Mossel and Peres paper and from (Thomas and Blanchet 2012)<sup>[**(24)**](#Note24)</sup>.  It assumes the rational function is of the form _D_(_&lambda;_)/_E_(_&lambda;_), where&mdash;

- _D_(_&lambda;_) = &Sigma;<sub>_i_ = 0, ..., _n_</sub> _&lambda;_<sup>_i_</sup> * (1 &minus; _&lambda;_)<sup>_n_ &minus; _i_</sup> * _d_\[_i_\],
- _E_(_&lambda;_) = &Sigma;<sub>_i_ = 0, ..., _n_</sub> _&lambda;_<sup>_i_</sup> * (1 &minus; _&lambda;_)<sup>_n_ &minus; _i_</sup> * _e_\[_i_\],
- every _d_\[_i_\] is less than or equal to the corresponding _e_\[_i_\], and
- each _d_\[_i_\] and each _e_\[_i_\] is an integer or rational number in the interval [0, choose(_n_, _i_)], where the upper bound is the total number of _n_-bit words with _i_ ones.

Here, _d_\[_i_\] is akin to the number of "passing" _n_-bit words with _i_ ones, and _e_\[_i_\] is akin to that number plus the number of "failing" _n_-bit words with _i_ ones.

The algorithm follows.

1. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.
2. Call **WeightedChoice**(**NormalizeRatios**(\[_e_\[_j_\] &minus; _d_\[_j_\], _d_\[_j_\], choose(_n_, _j_) &minus; _e_\[_j_\]\])), where **WeightedChoice** and **NormalizeRatios** are given in "[**Randomization and Sampling Methods**](https://peteroupc.github.io/randomfunc.html)".  If the call returns 0 or 1, return that result.  Otherwise, go to step 1.

> **Notes:**
>
> 1. In the formulas above&mdash;
>
>     - _d_\[_i_\] can be replaced with _&delta;_\[_i_\] * choose(_n_,_i_), where _&delta;_\[_i_\] is a rational number in the interval \[0, 1\] (and thus expresses the probability that a given word is a "passing" word among all _n_-bit words with _i_ ones), and
>     - _e_\[_i_\] can be replaced with _&eta;_\[_i_\] * choose(_n_,_i_), where _&eta;_\[_i_\] is a rational number in the interval \[0, 1\] (and thus expresses the probability that a given word is a "passing" or "failing" word among all _n_-bit words with _i_ ones),
>
>     and then _&delta;_\[_i_\] and _&eta;_\[_i_\] can be seen as control points for two different 1-dimensional [**Bézier curves**](https://en.wikipedia.org/wiki/Bézier_curve), where the _&delta;_ curve is always on or "below" the _&eta;_ curve.  For each curve, _&lambda;_ is the relative position on that curve, the curve begins at  _&delta;_\[0\] or _&eta;_\[0\], and the curve ends at _&delta;_\[_n_\] or _&eta;_\[_n_\]. See also the next section.
>
> 2. This algorithm could be modified to avoid additional randomness besides the input coin flips by packing the coin flips into an _n_-bit word and looking up whether that word is "passing", "failing", or neither, among all _n_-bit words with _j_ ones, but this is not so trivial to do (especially because in general, a lookup table first has to be built in a setup step, which can be impractical unless 2<sup>_n_</sup> is relatively small).  Moreover, this approach works only if _d_\[_i_\] and _e_\[_i_\] are integers (or if _d_\[_i_\] is replaced with floor(_d_\[_i_\]) and _e_\[_i_\] with ceil(_e_\[_i_\]) (Holtz et al. 2011)<sup>[**(25)**](#Note25)</sup>, but this, of course, suffers from rounding error when done in this algorithm).  See also (Thomas and Blanchet 2012)<sup>[**(24)**](#Note24)</sup>.

----

The following algorithm implements a special case of the "Dice Enterprise" method of (Morina et al., 2019)<sup>[**(17)**](#Note17)</sup>.  The algorithm returns one of _m_ outcomes (namely _X_, an integer in [0, _m_)) with probability _P_<sub>_X_</sub>(x) / (_P_<sub>0</sub>(x) + _P_<sub>1</sub>(x) + ... + _P_<sub>_m_&minus;1</sub>(x)).  Specifically, the probability is a _rational function_, or ratio of polynomials.  Here, all the _P_<sub>i</sub>(x) are in the form of polynomials such that&mdash;
- the polynomials all have the same degree, namely _n_;
- the polynomials' variable is _&lambda;_, the input coin's probability of heads; and
- the sum of _j_th Bernstein coefficients of all the polynomials is greater than 0 (and can be greater than 1), for each _j_.

Any rational function can be brought into this form, but the steps to do so are not simple enough to describe here.<sup>[**(62)**](#Note62)</sup>  In this algorithm, let _R_\[_j_\] be the sum of _j_th Bernstein coefficients of the polynomials.  First, define the following operation:

- **Get the new state given _state_, _b_, _u_, and _n_**:
    1. If _state_ > 0 and _b_ is 0, return either _state&minus;1_ if _u_ is less than (or equal to) the following probability, or _state_ otherwise.  The probability is _R_\[_state_&minus;1]/max(_R_\[_state_\], _R_\[_state_&minus;1]).
    2. If _state_ < _n_ and _b_ is 1, return either _state+1_ if _u_ is less than (or equal to) the following probability, or _state_ otherwise.  The probability is _R_\[_state_+1]/max(_R_\[_state_\], _R_\[_state_+1]).
    3. Return _state_.

Then the algorithm is as follows:

1. Create two empty lists: _blist_ and _ulist_.
2. Set _state1_ to 0 and _state2_ to _n_.
3. Flip the input coin and append the result (which is 0 or 1) to the end of _blist_.  Generate a uniform(0, 1) random number and append it to the end of _ulist_.
4. (Monotonic coupling from the past (Morina et al., 2019)<sup>[**(17)**](#Note17)</sup>, (Propp and Wilson 1996)<sup>[**(26)**](#Note26)</sup>.)Set _i_ to the number of items in _blist_ minus 1, then while _i_ is 0 or greater:
    1. Let _b_ be the item at position _i_ (starting at 0) in _blist_, and let _u_ be the item at that position in _ulist_.
    2. **Get the new state given _state1_, _b_, _u_, and _n_**, and set _state1_ to the new state.
    3. **Get the new state given _state2_, _b_, _u_, and _n_**, and set _state2_ to the new state.
    4. Subtract 1 from _i_.
5. If _state1_ and _state2_ are not equal, go to step 2.
6. Let _b_\[_i_]\[_j_] be the _j_<sup>th</sup> Bernstein coefficient (starting at 0) of the polynomial for _i_.  Call **WeightedChoice**(\[_b_\[0\]\[_state1_\], ..., _b_\[_m_&minus;1\]\[_state1_\]]), where **WeightedChoice** is given in "[**Randomization and Sampling Methods**](https://peteroupc.github.io/randomfunc.html)", and return the result.

> **Note:** If there are only two outcomes, then this is the special Bernoulli factory case; the algorithm would then return 1 with probability _P_<sub>1</sub>(_&lambda;_) / (_P_<sub>0</sub>(_&lambda;_) + _P_<sub>1</sub>(_&lambda;_)).

<a id=Certain_Polynomials_in_Bernstein_Form></a>
#### Certain Polynomials in Bernstein Form

A polynomial can be written in _Bernstein form_ as &Sigma;<sub>_i_ = 0, ..., _n_</sub> choose(_n_, _i_) * _&lambda;_<sup>_i_</sup> * (1 &minus; _&lambda;_)<sup>_n_ &minus; _i_</sup> * _a_\[_i_\], where _n_ is the polynomial's degree and _a_\[_i_\] are its _n_ plus one _Bernstein coefficients_.  According to (Goyal and Sigman 2012)<sup>[**(27)**](#Note27)</sup>, a function can be simulated with a fixed number of input coin flips if and only if the function is a polynomial that has Bernstein coefficients all in the interval \[0, 1\] (see also (Wästlund 1999, section 4)<sup>[**(28)**](#Note28)</sup>; (Qian and Riedel 2008)<sup>[**(29)**](#Note29)</sup>).  They also give an algorithm for simulating these polynomials, which is given below.

1. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.
2. With probability _a_\[_j_\], return 1.  Otherwise, return 0.

> **Notes**:
>
> 1. Each _a_\[_i_\] acts as a control point for a 1-dimensional [**Bézier curve**](https://en.wikipedia.org/wiki/Bézier_curve), where _&lambda;_ is the relative position on that curve, the curve begins at  _a_\[0\], and the curve ends at _a_\[_n_\].  For example, given control points 0.2, 0.3, and 0.6, the curve is at 0.2 when _&lambda;_ = 0, and 0.6 when _&lambda;_ = 1.  (The curve, however, is not at 0.3 when _&lambda;_ = 1/2; in general, Bézier curves do not cross their control points other than the first and the last.)
> 2. The problem of simulating polynomials in Bernstein form is related to _stochastic logic_, which involves simulating probabilities that arise out of Boolean functions (functions that use only AND, OR, NOT, and XOR operations) that take a fixed number of bits as input, where each bit has a separate probability of being 1 rather than 0, and output a single bit (for further discussion see (Qian et al. 2011)<sup>[**(30)**](#Note30)</sup>).
> 3. This algorithm can serve as an approximate way to simulate any factory function _f_.  In this case, _a_\[_j_\] is calculated as _f_(_j_/_n_), so that the resulting polynomial closely approximates the function; the higher _n_ is, the better this approximation.
>
> **Example:** Take the following parabolic function discussed in (Thomas and Blanchet 2012)<sup>[**(24)**](#Note24)</sup>: (1&minus;4\*(_&lambda;_&minus;1/2)<sup>2</sup>)\*_c_, where _c_ is in the interval (0, 1).  This is a polynomial that can be rewritten as &minus;4\*_c_\*_&lambda;_<sup>2</sup>+4\*_c_\*_&lambda;_, so that this _power form_ has coefficients (0, 4\*_c_, &minus;4\*_c_) and a degree (_n_) of 2. Using the matrix method by Ray and Nataraj (2012)<sup>[**(31)**](#Note31)</sup>, we get Bernstein coefficients (0, 2\*_c_, 0).  Thus, for this polynomial, _a_\[0] is 0,  _a_\[1] is 2\*_c_, and  _a_\[2] is 0.  Thus, if _c_ is in the interval (0, 1/2], we can simulate this function as follows: "Flip the input coin twice.  If exactly one of the flips returns 1, return a number that is 1 with probability 2\*_c_ and 0 otherwise.  Otherwise, return 0."  For other values of _c_, the algorithm requires computing the Bernstein coefficients, then elevating the polynomial's degree enough times so that those Bernstein coefficients all lie in [0, 1]; the required degree approaches infinity as _c_ approaches 1.<sup>[**(32)**](#Note32)</sup>

----

Niazadeh et al. (2020)<sup>[**(33)**](#Note33)</sup> describes monomials (involving one or more coins) of the form _&Pi;_<sub>_i_ = 1, ..., _n_</sub> _&lambda;_\[_i_]<sup>_a_\[_i_\]</sup> \* (1&minus;_&lambda;_\[_i_])<sup>_b_\[_i_\]</sup>, where there are _n_ coins, _&lambda;_\[_i_] is the probability of heads of coin _i_, and _a_\[_i_\] >= 0 and _b_\[_i_\] >= 0 are parameters for coin _i_ (specifically, of _a_+_b_ flips, the first _a_ flips must return heads and the rest must return tails to succeed).

1. For each _i_ in \[1, _n_\]:
     1. Flip the _&lambda;_\[_i_] input coin _a_\[_i_\] times.  If any of the flips returns 0, return 0.
     2. Flip the _&lambda;_\[_i_] input coin _b_\[_i_\] times.  If any of the flips returns 1, return 0.
2. Return 1.

The same paper also describes polynomials that are weighted sums of this kind of monomials, namely polynomials of the form _P_ = &Sigma;<sub>_j_ = 1, ..., _k_</sub> _c_\[_j_\]\*_M_\[_j_\](**_&lambda;_**), where there are _k_ monomials, _M_\[_j_\](.) identifies monomial _j_, **_&lambda;_** identifies the coins' probabilities of heads, and _c_\[_j_\] >= 0 is the weight for monomial _j_.  (If there is only one coin, these polynomials are in Bernstein form if _c_\[_j_\] is _&alpha;_\[_j_\]\*choose(_k_&minus;1, _j_&minus;1) where _&alpha;_\[_j_\] is a Bernstein coefficient in the interval [0, 1], and if _a_\[1\] = _j_&minus;1 and _b_\[1\] = _k_&minus;_j_ for each monomial _j_.)

Let _C_ be the sum of all _c_\[_j_\].  To simulate the probability _P_/_C_, choose one of the monomials with probability proportional to its weight (see "[**A Note on Weighted Choice Algorithms**](https://peteroupc.github.io/randomnotes.html#A_Note_on_Weighted_Choice_Algorithms)"), then run the algorithm above on that monomial (see also "[**Convex Combinations**](#Convex_Combinations)", later).

----

Another algorithm is a slight modification of the "Dice Enterprise" special case given in the [**previous section**](#Certain_Rational_Functions).  It works with degree-_n_ polynomials in Bernstein form of the kind described at the top of this section.  This algorithm is often more efficient (in terms of number of input coin flips needed) than the Goyal and Sigman algorithm given earlier in this section.

- Instead of the version of "**Get the new state given _state_, _b_, _u_, and _n_**" from the previous section, use the following version:
    1. If _state_ > 0 and _b_ is 0, return either _state&minus;1_ if _u_ is less than (or equal to) the following probability, or _state_ otherwise.  The probability is 1 if _state_ is greater than floor(_n_/2), and _state_/(_n_+1&minus;_state_) otherwise (and is equivalent to choose(_n_,_state_&minus;1)/max(choose(_n_,_state_), choose(_n_,_state_&minus;1))).
    2. If _state_ < _n_ and _b_ is 1, return either _state+1_ if _u_ is less than (or equal to) the following probability, or _state_ otherwise.  The probability is 1 if _state_ is less than floor(_n_/2), and (_n_&minus;_state_)/(_state_+1) otherwise (and is equivalent to choose(_n_,_state_+1)/max(choose(_n_,_state_), choose(_n_,_state_+1))).
    3. Return _state_.
- Then modify step 6 of the previous section's algorithm to read: "6. With probability _a_\[_state1_\], return 1.  Otherwise, return 0."

    Alternatively, step 6 is left unchanged.  In that case, the algorithm works with _m_ polynomials, and will return one of _m_ outcomes (namely _X_, an integer in \[0, _m_)), with probability equal to the polynomial for _X_.  For this to work, though, the polynomials must have the same degree, and the _j_<sup>th</sup> Bernstein coefficients of the _m_ polynomials must be 0 or greater and sum to 1, for each _j_.

<a id=Certain_Algebraic_Functions></a>
#### Certain Algebraic Functions

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup> showed how certain functions can be simulated by generating a bitstring and determining whether that bitstring belongs to a certain class of bitstrings.  The rules for determining whether a bitstring belongs to that class are called a _binary stochastic grammar_, which uses an alphabet of only two "letters", or more generally a _stochastic grammar_.   The functions belong to a class called _algebraic functions_ (functions that can be a solution of a polynomial system).

According to (Mossel and Peres 2005)<sup>[**(21)**](#Note21)</sup>, a factory function can be simulated by a pushdown automaton only if that function can be a solution of a polynomial system with rational coefficients.<sup>[**(34)**](#Note34)</sup>

The following algorithm simulates the following algebraic function:

- &Sigma;<sub>_k_ = 0, 1, 2, ...</sub> (_&lambda;_<sup>_k_</sup> * (1 &minus; _&lambda;_) * W(_k_) / _&beta;_<sup>_k_</sup>), or alternatively,
- (1 &minus; _&lambda;_) * OGF(_&lambda;_/_&beta;_),

where&mdash;

- W(_k_) is a number in the interval \[0, _&beta;_<sup>_k_</sup>\] and is the number of _k_-letter words that can be produced by the stochastic grammar in question,
- _&beta;_ is the alphabet size, or the number of "letters" in the alphabet (e.g., 2 for the cases discussed in the Flajolet paper), and is an integer 2 or greater,
- the _ordinary generating function_ OGF(_x_) = W(0) + W(1) * _x_ + W(2) * _x_<sup>2</sup> + W(3) * _x_<sup>3</sup> + ..., and
- the second formula incorporates a correction to Theorem 3.2 of the paper<sup>[**(35)**](#Note35)</sup>.

(Here, the _k_<sup>th</sup> coefficient of OGF(_x_) corresponds to W(_k_).)  The algorithm follows.

1. Set _g_ to 0.
2. With probability _&lambda;_, add 1 to _g_ and repeat this step.  Otherwise, go to step 3.
3. Return a number that is 1 with probability W(_g_)/_&beta;_<sup>_g_</sup>, and 0 otherwise.  (In the Flajolet paper, this is done by generating a _g_-letter word uniformly at random and "parsing" that word using a binary stochastic grammar to determine whether that word can be produced by that grammar.  Note that this determination can be made this way as each of the word's "letters" is generated.)

An extension to this algorithm, not mentioned in the Flajolet paper, is the use of stochastic grammars with a bigger alphabet than two "letters".  For example, in the case of _ternary stochastic grammars_, the alphabet size is 3 and _&beta;_ is 3 in the algorithm above.  In general, for <em>_&beta;_-ary stochastic grammars</em>, the alphabet size is _&beta;_, which can be any integer 2 or greater.

> **Examples:**
>
> 1. The following is an example from the Flajolet paper. A _g_-letter binary word can be "parsed" as follows to determine whether that word encodes a ternary tree: "3. If _g_ is 0, return 0.  Otherwise, set _i_ to 1 and _d_ to 1.; 3a. Generate an unbiased random bit (that is, either 0 or 1, chosen with equal probability), then subtract 1 from _d_ if that bit is 0, or add 2 to _d_ otherwise.; 3b. Add 1 to _i_. Then, if _i_ < _g_ and _d_ > 0, go to step 3a.; 3c. Return 1 if _d_ is 0 and _i_ is _g_, or 0 otherwise."
> 2. If W(_g_), the number of _g_-letter words that can be produced by the stochastic grammar in question, has the form&mdash;
>
>     - choose(_g_, _g_/_t_) \* (_&beta;_&minus;1)<sup>_g_&minus;_g_/_t_</sup> (the number of _g_-letter words with exactly _g_/_t_ A's, for an alphabet size of _&beta;_) if _g_ is divisible by _t_<sup>[**(36)**](#Note36)</sup>, and
>     - 0 otherwise,
>
>     where _t_ is an integer 2 or greater and _&beta;_ is the alphabet size and is an integer 2 or greater, step 3 of the algorithm can be done as follows: "3. If _g_ is not divisible by _t_, return 0. Otherwise, generate _g_ uniform random integers in the interval [0, _&beta;_) (e.g., _g_ unbiased random bits if _&beta;_ is 2), then return 1 if exactly _g_/_t_ zeros were generated this way, or 0 otherwise."  If _&beta;_ = 2, then this reproduces another example from the Flajolet paper.
> 3. If W(_g_) has the form&mdash;<br/>&nbsp;&nbsp;&nbsp;&nbsp;choose(_g_ * _&alpha;_, _g_) \* (_&beta;_&minus;1)<sup>_g_\*_&alpha;&minus;g_</sup> / _&beta;_<sup>_g_\*_&alpha;&minus;g_</sup>,<br/>where _&alpha;_ is an integer 1 or greater and _&beta;_ is the alphabet size and is an integer 2 or greater, step 3 of the algorithm can be done as follows: "3. Generate _g_ * _&alpha;_ uniform random integers in the interval [0, _&beta;_) (e.g., _g_ * _&alpha;_ unbiased random bits if _&beta;_ is 2), then return 1 if exactly _g_ zeros were generated this way, or 0 otherwise."  If _&alpha;_ = 2 and _&beta;_ = 2, then this expresses the _square-root construction_ sqrt(1 &minus; _&lambda;_), mentioned in the Flajolet paper.  If _&alpha;_ is 1, the modified algorithm simulates the following probability: (_&beta;_\*(_&lambda;_&minus;1))/(_&lambda;_&minus;_&beta;_).  And interestingly, I have found that if _&alpha;_ is 2 or greater, the probability simplifies to involve a hypergeometric function.  Specifically, the probability becomes&mdash;
>
>     - (1 &minus; _&lambda;_) * <sub>_&alpha;_&minus;1</sub>_F_<sub>_&alpha;_&minus;2</sub>(1/_&alpha;_, 2/_&alpha;_, ..., (_&alpha;_&minus;1)/_&alpha;_; 1/(_&alpha;_&minus;1), ..., (_&alpha;_&minus;2)/(_&alpha;_&minus;1); _&lambda;_ \* _&alpha;_<sup>_&alpha;_</sup>/((_&alpha;_&minus;1)<sup>_&alpha;_&minus;1</sup> \* 2<sup>_&alpha;_</sup>)) if _&beta;_ = 2, or more generally,
>     - (1 &minus; _&lambda;_) * <sub>_&alpha;_&minus;1</sub>_F_<sub>_&alpha;_&minus;2</sub>(1/_&alpha;_, 2/_&alpha;_, ..., (_&alpha;_&minus;1)/_&alpha;_; 1/(_&alpha;_&minus;1), ..., (_&alpha;_&minus;2)/(_&alpha;_&minus;1); _&lambda;_\*_&alpha;_<sup>_&alpha;_</sup>\*(_&beta;_&minus;1)<sup>_&alpha;_&minus;1</sup>/((_&alpha;_&minus;1)<sup>_&alpha;_&minus;1</sup> \* _&beta;_<sup>_&alpha;_</sup>)).
>
>     The ordinary generating function for this modified algorithm is thus&mdash;<br/>&nbsp;&nbsp;&nbsp;&nbsp;OGF(_z_) = <sub>_&alpha;_&minus;1</sub>_F_<sub>_&alpha;_&minus;2</sub>(1/_&alpha;_, 2/_&alpha;_, ..., (_&alpha;_&minus;1)/_&alpha;_; 1/(_&alpha;_&minus;1), ..., (_&alpha;_&minus;2)/(_&alpha;_&minus;1); _z_\*_&alpha;_<sup>_&alpha;_</sup>\*(_&beta;_&minus;1)<sup>_&alpha;_&minus;1</sup>/((_&alpha;_&minus;1)<sup>_&alpha;_&minus;1</sup> \* _&beta;_<sup>_&alpha;_&minus;1</sup>)).
> 4.  The probability involved in example 2 likewise involves hypergeometric functions:
>
>     - (1 &minus; _&lambda;_) * <sub>_t_&minus;1</sub>_F_<sub>_t_&minus;2</sub>(1/_t_, 2/_t_, ..., (_t_&minus;1)/_t_; 1/(_t_&minus;1), ..., (_t_&minus;2)/(_t_&minus;1); _&lambda;_<sup>_t_</sup>\*_t_<sup>_t_</sup>\*(_&beta;_&minus;1)<sup>_t_&minus;1</sup>/((_t_&minus;1)<sup>_t_&minus;1</sup> \* _&beta;_<sup>_t_</sup>)).

<a id=Expressions_Involving_Polylogarithms></a>
#### Expressions Involving Polylogarithms

The following algorithm simulates the expression Li<sub>_r_</sub>(_&lambda;_) * (1 / _&lambda;_ &minus; 1), where _r_ is an integer 1 or greater.  If _&lambda;_ is 1/2, this expression simplifies to Li<sub>_r_</sub>(1/2). See also (Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>.  However, even with a relatively small _r_ such as 6, the expression quickly approaches a straight line.

1. Flip the input coin until it returns 0, and let _t_ be 1 plus the number of times the coin returned 1 this way.
2. Return a number that is 1 with probability 1/_t_<sup>_r_</sup> and 0 otherwise.

<a id=Algorithms_for_Irrational_Constants></a>
### Algorithms for Irrational Constants

The following algorithms generate heads with a probability equal to an irrational number.  (On the other hand, probabilities that are _rational_ constants are trivial to simulate.  If fair coins are available, the `ZeroOrOne` method, which is described in my article on [**random sampling methods**](https://peteroupc.github.io/randomfunc.html#Boolean_True_False_Conditions), should be used.  If coins with unknown bias are available, then a [**_randomness extraction_**](https://peteroupc.github.io/randextract.html) method should be used to turn them into fair coins.)

<a id=Digit_Expansions></a>
#### Digit Expansions

Probabilities can be expressed as a digit expansion (of the form `0.dddddd...`).  The following algorithm returns 1 with probability `p` and 0 otherwise, where `p` is a probability in the interval [0, 1).  Note that the number 0 is also an infinite digit expansion of zeros, and the number 1 is also an infinite digit expansion of base-minus-ones.  Irrational numbers always have infinite digit expansions, which must be calculated "on-the-fly".

In the algorithm (see also (Brassard et al., 2019)<sup>[**(37)**](#Note37)</sup>, (Devroye 1986, p. 769)<sup>[**(9)**](#Note9)</sup>), `BASE` is the digit base, such as 2 for binary or 10 for decimal.

1. Set `u` to 0 and `k` to 1.
2. Set `u` to `(u * BASE) + v`, where `v` is a random integer in the interval [0, `BASE`) (such as `RNDINTEXC(BASE)`, or simply an unbiased random bit if `BASE` is 2).  Calculate `pa`, which is an approximation to `p` such that abs(`p`&minus;`pa`) <= `BASE`<sup>&minus;`k`</sup>.  Set `pk` to `pa`'s digit expansion up to the `k` digits after the point.  Example: If `p` is _&pi;_/4, `BASE` is 10, and `k` is 5, then `pk = 78539`.
3. If `pk + 1 <= u`, return 0.  If `pk - 2 >= u`, return 1.  If neither is the case, add 1 to `k` and go to step 2.

<a id=Continued_Fractions></a>
#### Continued Fractions

The following algorithm simulates a probability expressed as a simple continued fraction of the following form: 0 + 1 / (_a_\[1\] + 1 / (_a_\[2\] + 1 / (_a_\[3\] + ... ))).  The _a_\[_i_\] are the _partial denominators_, none of which may have an absolute value less than 1.  Inspired by (Flajolet et al., 2010, "Finite graphs (Markov chains) and rational functions")<sup>[**(1)**](#Note1)</sup>, I developed the following algorithm.

Algorithm 1. This algorithm works only if each _a_\[_i_\]'s absolute value is 1 or greater and _a_\[1\] is positive, but otherwise, each  _a_\[_i_\] may be negative and/or a non-integer.  The algorithm begins with _pos_ equal to 1.  Then the following steps are taken.

1. Set _k_ to _a_\[_pos_\].
2. If the partial denominator at _pos_ is the last, return a number that is 1 with probability 1/_k_ and 0 otherwise.
3. If _a_\[_pos_\] is less than 0, set _kp_ to _k_ &minus; 1 and _s_ to 0.  Otherwise, set _kp_ to _k_ and _s_ to 1. (This step accounts for negative partial denominators.)
4. With probability _kp_/(1+_kp_), return a number that is 1 with probability 1/_kp_ and 0 otherwise.
5. Run this algorithm recursively, but with _pos_ = _pos_ + 1.  If the result is _s_, return 0.  Otherwise, go to step 4.

A _generalized continued fraction_ has the form 0 + _b_\[1\] / (_a_\[1\] + _b_\[2\] / (_a_\[2\] + _b_\[3\] / (_a_\[3\] + ... ))).  The _a_\[_i_\] are the same as before, but the _b_\[_i_\] are the _partial numerators_. The following are two algorithms to simulate a probability in the form of a generalized continued fraction.

Algorithm 2. This algorithm works only if each _b_\[_i_\]/_a_\[_i_\] is 1 or less, but otherwise, each _b_\[_i_\] and each  _a_\[_i_\] may be negative and/or a non-integer.  This algorithm employs an equivalence transform from generalized to simple continued fractions.  The algorithm begins with _pos_ and _r_ both equal to 1.  Then the following steps are taken.

1. Set _r_ to 1 / (_r_ * _b_\[_pos_\]), then set _k_ to _a_\[_pos_\] * _r_. (_k_ is the partial denominator for the equivalent simple continued fraction.)
2. If the partial numerator/denominator pair at _pos_ is the last, return a number that is 1 with probability 1/abs(_k_) and 0 otherwise.
3. Set _kp_ to abs(_k_) and _s_ to 1.
4. Set _r2_ to 1 / (_r_ * _b_\[_pos_ + 1\]).  If _a_\[_pos_ + 1\] * _r2_ is less than 0, set _kp_ to _kp_ &minus; 1 and _s_ to 0. (This step accounts for negative partial numerators and denominators.)
5. With probability _kp_/(1+_kp_), return a number that is 1 with probability 1/_kp_ and 0 otherwise.
6. Run this algorithm recursively, but with _pos_ = _pos_ + 1 and _r_ = _r_.  If the result is _s_, return 0.  Otherwise, go to step 5.

Algorithm 3. This algorithm works only if each _b_\[_i_\]/_a_\[_i_\] is 1 or less and if each _b_\[_i_\] and each  _a_\[_i_\] is greater than 0, but otherwise, each _b_\[_i_\] and each _a_\[_i_\] may be a non-integer.  The algorithm begins with _pos_ equal to 1.  Then the following steps are taken.

1. If the partial numerator/denominator pair at _pos_ is the last, return a number that is 1 with probability _b_\[_pos_\]/_a_\[_pos_\] and 0 otherwise.
2. With probability _a_\[_pos_\]/(1 + _a_\[_pos_\]), return a number that is 1 with probability _b_\[_pos_\]/_a_\[_pos_\] and 0 otherwise.
3. Run this algorithm recursively, but with _pos_ = _pos_ + 1.  If the result is 1, return 0.  Otherwise, go to step 2.

See the appendix for a correctness proof of Algorithm 3.

> **Notes:**
>
> - If any of these algorithms encounters a probability outside the interval [0, 1], the entire algorithm will fail for that continued fraction.
>
> - These algorithms will work for continued fractions of the form "1 &minus; ..." (rather than "0 + ...") if&mdash;
>     - before running the algorithm, the first partial numerator and denominator have their sign removed, and
>     - after running the algorithm, 1 minus the result (rather than just the result) is taken.
>
> - These algorithms are designed to allow the partial numerators and denominators to be calculated "on the fly".
> - The following is an alternative way to write Algorithm 1, which better shows the inspiration because it shows how the "even parity construction" (or the two-coin special case) as well as the "1 &minus; _x_" construction can be used to develop rational number simulators that are as big as their continued fraction expansions, as suggested in the cited part of the Flajolet paper.  However, it only works if the size of the continued fraction expansion (here, _size_) is known in advance.
>     1. Set _i_ to _size_.
>     2. Create an input coin that does the following: "Return a number that is 1 with probability 1/_a_\[_size_\] or 0 otherwise".
>     3. While _i_ is 1 or greater:
>         1. Set _k_ to _a_\[_i_\].
>         2. Create an input coin that takes the previous input coin and _k_ and does the following: "(a) With probability _k_/(1+_k_), return a number that is 1 with probability 1/_k_ and 0 otherwise; (b) Flip the previous input coin.  If the result is 1, return 0.  Otherwise, go to step (a)".  (The probability _k_/(1+_k_) is related to _&lambda;_/(1+_&lambda;_) = 1 &minus; 1/(1+_&lambda;_), which involves the even-parity construction&mdash;or the two-coin special case&mdash;for 1/(1+_&lambda;_) as well as complementation for "1 &minus; _x_".)
>         3. Subtract 1 from _i_.
>     4. Flip the last input coin created by this algorithm, and return the result.

<a id=Continued_Logarithms></a>
#### Continued Logarithms

The _continued logarithm_ (Gosper 1978)<sup>[**(38)**](#Note38)</sup>, (Borwein et al., 2016)<sup>[**(39)**](#Note39)</sup> of a number in (0, 1) has the following continued fraction form: 0 + (1 / 2<sup>_c_\[1\]</sup>) / (1 + (1 / 2<sup>_c_\[2\]</sup>) / (1 + ...)), where _c_\[_i_\] are the coefficients of the continued logarithm and all 0 or greater.  I have come up with the following algorithm that simulates a probability expressed as a continued logarithm expansion.

The algorithm begins with _pos_ equal to 1.  Then the following steps are taken.

1. If the coefficient at _pos_ is the last, return a number that is 1 with probability 1/(2<sup>_c_\[_pos_\]</sup>) and 0 otherwise.
2. With probability 1/2, return a number that is 1 with probability 1/(2<sup>_c_\[_pos_\]</sup>) and 0 otherwise.
3. Run this algorithm recursively, but with _pos_ = _pos_ + 1.  If the result is 1, return 0.  Otherwise, go to step 2.

For a correctness proof, see the appendix.

<a id=1___phi___1_divided_by_the_golden_ratio></a>
#### 1 / _&phi;_ (1 divided by the golden ratio)

This algorithm uses the algorithm described in the section on continued fractions to simulate 1 divided by the golden ratio, whose continued fraction's partial denominators are 1, 1, 1, 1, ....

1. With probability 1/2, return 1.
2. Run this algorithm recursively.  If the result is 1, return 0.  Otherwise, go to step 1.

<a id=sqrt_2_minus_1></a>
#### sqrt(2) &minus; 1

Another example of a continued fraction is that of the fractional part of the square root of 2, where the partial denominators are 2, 2, 2, 2, .... The algorithm to simulate this number is as follows:

1. With probability 2/3, generate an unbiased random bit and return that bit.
2. Run this algorithm recursively.  If the result is 1, return 0.  Otherwise, go to step 1.

<a id=1_sqrt_2></a>
#### 1/sqrt(2)

This third example of a continued fraction shows how to simulate a probability 1/_z_, where _z_ > 1 has a known simple continued fraction expansion.  In this case, the partial denominators are as follows: floor(_z_), _a_\[1\], _a_\[2\], ..., where the _a_\[_i_\] are _z_'s partial denominators (not including _z_'s integer part).  In the example of 1/sqrt(2), the partial denominators are 1, 2, 2, 2, ..., where 1 comes first since floor(sqrt(2)) = 1.  The algorithm to simulate 1/sqrt(2) is as follows:

The algorithm begins with _pos_ equal to 1.  Then the following steps are taken.

1. If _pos_ is 1, return 1 with probability 1/2.  If _pos_ is greater than 1, then with probability 2/3, generate an unbiased random bit and return that bit.
2. Run this algorithm recursively, but with _pos_ = _pos_ + 1.  If the result is 1, return 0.  Otherwise, go to step 1.

<a id=tanh_1_2_or_exp_1_minus_1_exp_1_1></a>
#### tanh(1/2) or (exp(1) &minus; 1) / (exp(1) + 1)

The algorithm begins with _k_ equal to 2.  Then the following steps are taken.

1. With probability _k_/(1+_k_), return a number that is 1 with probability 1/_k_ and 0 otherwise.
2. Run this algorithm recursively, but with _k_ = _k_ + 4.  If the result is 1, return 0.  Otherwise, go to step 1.

<a id=arctan__x___y___y___x></a>
#### arctan(_x_/_y_) \* _y_/_x_

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>:

1. Generate a uniform(0, 1) random number _u_.
2. Generate a number that is 1 with probability _x_ * _x_/(_y_ * _y_), or 0 otherwise.  If the number is 0, return 1.
3. [**Sample from the number _u_**](#Algorithms) twice.  If either of these calls returns 0, return 1.
4. Generate a number that is 1 with probability _x_ * _x_/(_y_ * _y_), or 0 otherwise.  If the number is 0, return 0.
5. [**Sample from the number _u_**](#Algorithms) twice.  If either of these calls returns 0, return 0.  Otherwise, go to step 2.

Observing that the even-parity construction used in the Flajolet paper is equivalent to the two-coin special case, which is uniformly fast, the algorithm above can be made uniformly fast as follows:

1. With probability 1/2, return 1.
2. Generate a uniform(0, 1) random number _u_, if it wasn't generated yet.
3. With probability _x_ * _x_/(_y_ * _y_), [**sample from the number _u_**](#Algorithms) twice.  If both of these calls return 1, return 0.
4. Go to step 1.

<a id=pi___12></a>
#### _&pi;_ / 12

Two algorithms:

- First algorithm: Use the algorithm for **arcsin(1/2) / 2**.  Where the algorithm says to "flip the input coin", instead generate an unbiased random bit.
- Second algorithm: With probability 2/3, return 0.  Otherwise, run the algorithm for **&pi; / 4** and return the result.

<a id=pi___4></a>
#### _&pi;_ / 4

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>:

1. Generate a random integer in the interval [0, 6), call it _n_.
2. If _n_ is less than 3, return the result of the **algorithm for arctan(1/2) \* 2**.  Otherwise, if _n_ is 3, return 0.  Otherwise, return the result of the **algorithm for arctan(1/3) \* 3**.

<a id=1___pi></a>
#### 1 / _&pi;_

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>:

1. Set _t_ to 0.
2. With probability 1/4, add 1 to _t_ and repeat this step.  Otherwise, go to step 3.
3. With probability 1/4, add 1 to _t_ and repeat this step.  Otherwise, go to step 4.
4. With probability 5/9, add 1 to _t_.
5. Generate 2*_t_ unbiased random bits (that is, either 0 or 1, chosen with equal probability), and return 0 if there are more zeros than ones generated this way or more ones than zeros.  (Note that this condition can be checked even before all the bits are generated this way.)  Do this step two more times.
6. Return 1.

For a sketch of how this algorithm is derived, see the appendix.

<a id=a___b___x___y></a>
#### (_a_/_b_)<sup>_x_/_y_</sup>

In the algorithm below, _a_, _b_, _x_, and _y_ are integers, and the case where _x_/_y_ is in (0, 1) is due to recent work by Mendo (2019)<sup>[**(7)**](#Note7)</sup>.  This algorithm works only if&mdash;

-  _x_/_y_ is 0 or greater and _a_/_b_ is in the interval [0, 1], or
-  _x_/_y_ is less than 0 and _a_/_b_ is 1 or greater.

The algorithm follows.

1. If _x_/_y_ is less than 0, swap _a_ and _b_, and remove the sign from _x_/_y_.  If _a_/_b_ is now no longer in the interval [0, 1], return an error.
2. If _x_/_y_ is equal to 1, return 1 with probability _a_/_b_ and 0 otherwise.
3. If _x_ is 0, return 1.  Otherwise, if _a_ is 0, return 0.  Otherwise, if _a_ equals _b_, return 1.
4. If _x_/_y_ is greater than 1:
    1. Set _ipart_ to floor(_x_/_y_) and _fpart_ to `rem(x, y)`.
    2. If _fpart_ is greater than 0, subtract 1 from _ipart_, then call this algorithm recursively with _x_ = floor(_fpart_/2) and _y_ = _y_, then call this algorithm, again recursively, with _x_ = _fpart_ &minus; floor(_fpart_/2) and _y_ = _y_. Return 0 if either call returns 0.  (This is done rather than the more obvious approach in order to avoid calling this algorithm with fractional parts very close to 0, because the algorithm runs much more slowly than for fractional parts closer to 1.)
    3. If _ipart_ is 1 or greater, generate a random number that is 1 with probability _a_<sup>_ipart_</sup>/_b_<sup>_ipart_</sup> or 0 otherwise. (Or generate _ipart_ many random numbers that are each 1 with probability _a_/_b_ or 0 otherwise, then multiply them all into one number.)  If that number is 0, return 0.
    4. Return 1.
5. Set _i_ to 1.
6. With probability _a_/_b_, return 1.
7. Otherwise, with probability _x_/(_y_*_i_), return 0.
8. Add 1 to _i_ and go to step 6.

<a id=exp_minus__x___y></a>
#### exp(&minus;_x_/_y_)

This algorithm takes integers _x_ >= 0 and _y_ > 0 and outputs 1 with probability `exp(-x/y)` or 0 otherwise. It originates from (Canonne et al. 2020)<sup>[**(40)**](#Note40)</sup>.

1. Special case: If _x_ is 0, return 1. (This is because the probability becomes `exp(0) = 1`.)
2. If `x > y` (so _x_/_y_ is greater than 1), call this algorithm (recursively) `floor(x/y)` times with _x_ = _y_ = 1 and once with _x_ = _x_ &minus; floor(_x_/_y_) \* _y_ and _y_ = _y_.  Return 1 if all these calls return 1; otherwise, return 0.
3. Set _r_ to 1 and _i_ to 1.
4. Return _r_ with probability (_y_ \* _i_ &minus; _x_) / (_y_ \* _i_).
5. Set _r_ to 1 &minus; _r_, add 1 to _i_, and go to step 4.

<a id=exp_minus__z></a>
#### exp(&minus;_z_)

This algorithm is similar to the previous algorithm, except that the exponent, _z_, can be any real number 0 or greater, as long as _z_ can be rewritten as the sum of one or more components whose fractional parts can each be simulated by a Bernoulli factory algorithm that outputs heads with probability equal to that fractional part. (This makes use of the identity exp(&minus;a) = exp(&minus;b) * exp(&minus;c).)

More specifically:

1. Decompose _z_ into _n_ > 0 positive components that sum to _z_.  For example, if _z_ = 3.5, it can be decomposed into only one component, 3.5 (whose fractional part is trivial to simulate), and if _z_ = _&pi;_, it can be decomposed into four components that are all (&pi; / 4), which has a not-so-trivial simulation described earlier on this page.
2. For each component _LC_\[_i_\] found this way, let _LI_\[_i_\] be floor(_LC_\[_i_\]) and let _LF_\[_i_\] be _LC_\[_i_\] &minus; floor(_LC_\[_i_\]) (_LC_\[_i_\]'s fractional part).

The algorithm is then as follows:

- For each component _LC_\[_i_\], call the **algorithm for exp(&minus; _LI_\[_i_\]/1)**, and call the **general martingale algorithm** adapted for **exp(&minus;_&lambda;_)** using the input coin that simulates  _LF_\[_i_\].  If any of these calls returns 0, return 0; otherwise, return 1. (See also (Canonne et al. 2020)<sup>[**(40)**](#Note40)</sup>.)

<a id=a___b___z></a>
#### (_a_/_b_)<sup>_z_</sup>

This algorithm is similar to the previous algorithm for powering, except that the exponent, _z_,  can be any real number 0 or greater, as long as _z_ can be rewritten as the sum of one or more components whose fractional parts can each be simulated by a Bernoulli factory algorithm that outputs heads with probability equal to that fractional part. This algorithm makes use of a similar identity as for `exp` and works only if _z_ is 0 or greater and _a_/_b_ is in the interval [0, 1].

Decompose _z_ into _LC_\[_i_\], _LI_\[_i_\], and _LF_\[_i_\] just as for the **exp(&minus; _z_)** algorithm.  The algorithm is then as follows.

- If _z_ is 0, return 1.  Otherwise, if _a_ is 0, return 0.  Otherwise, for each component _LC_\[_i_\] (until the algorithm returns a number):
    1. Call the **algorithm for  (_a_/_b_)<sup>_LI_\[_i_\]/1</sup>**.  If it returns 0, return 0.
    2. Set _j_ to 1.
    3. Generate a random number that is 1 with probability _a_/_b_ and 0 otherwise.  If that number is 1, abort these steps and move on to the next component or, if there are no more components, return 1.
    4. Flip the input coin that simulates  _LF_\[_i_\] (which is the exponent); if it returns 1, return 0 with probability 1/_j_.
    5. Add 1 to _j_ and go to substep 2.

<a id=1_1_exp__x___y__2_prec__LogisticExp></a>
#### 1 / 1 + exp(_x_ / (_y_ * 2<sup>_prec_</sup>)) (LogisticExp)

This is the probability that the bit at _prec_ (the _prec_<sup>th</sup> bit after the point) is set for an exponential random number with rate _x_/_y_.  This algorithm is a special case of the **logistic Bernoulli factory**.

1. With probability 1/2, return 1.
2. Call the **algorithm for exp(&minus; _x_/(_y_ * 2<sup>_prec_</sup>))**.  If the call returns 1, return 1.  Otherwise, go to step 1.

<a id=1_1_exp__z__2_prec__LogisticExp></a>
#### 1 / 1 + exp(_z_ / 2<sup>_prec_</sup>)) (LogisticExp)

This is similar to the previous algorithm, except that _z_ can be any real number described in the **algorithm for exp(&minus;_z_)**.

Decompose _z_ into _LC_\[_i_\], _LI_\[_i_\], and _LF_\[_i_\] just as for the **exp(&minus;_z_)** algorithm.  The algorithm is then as follows.

1. For each component _LC_\[_i_\], create an input coin that does the following: "(a) With probability 1/(2<sup>_prec_</sup>), return 1 if the input coin that simulates _LF_\[_i_\] returns 1; (b) Return 0".
2. Return 0 with probability 1/2.
3. Call the **algorithm for exp(&minus; _x_/_y_)** with _x_ = &Sigma;<sub>_i_</sub> _LI_\[_i_\] and _y_ = 2<sup>_prec_</sup>.  If this call returns 0, go to step 2.
4. For each component _LC_\[_i_\], call the **algorithm for exp(&minus;_&lambda;_)**, using the corresponding input coin for  _LC_\[_i_\] created in step 1. If any of these calls returns 0, go to step 2.  Otherwise, return 1.

<a id=Polylogarithmic_Constants></a>
#### Polylogarithmic Constants

The following algorithm simulates a polylogarithmic constant of the form Li<sub>_r_</sub>(1/2), where _r_ is an integer 1 or greater.  See (Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup> and "Convex Combinations" (the algorithm works by decomposing the series forming the polylogarithmic constant into _g_(_i_) = (1/2)<sup>_i_</sup>, which sums to 1, and _h_<sub>_i_</sub>() = _i_<sup>_r_</sup>, where _i_ >= 1).

1. Set _t_ to 1.
2. With probability 1/2, add 1 to _t_ and repeat this step.  Otherwise, go to step 3.
3. Return a number that is 1 with probability 1/_t_<sup>_r_</sup> and 0 otherwise.

<a id=zeta___3_3_4_and_Other_Zeta_Related_Constants></a>
#### _&zeta;_(3) * 3 / 4 and Other Zeta-Related Constants

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>.  It can be seen as a triple integral whose integrand is 1/(1 + _a_ * _b_ * _c_), where _a_, _b_, and _c_ are uniform(0, 1) random numbers.  This algorithm is given below, but using the two-coin special case instead of the even-parity construction.  Note that the triple integral in section 5 of the paper is _&zeta;_(3) * 3 / 4, not _&zeta;_(3) * 7 / 8. (Here, _&zeta;_(_x_) is the Riemann zeta function.)

1. Generate three uniform(0,1) random numbers.
2. With probability 1/2, return 1.
3. [**Sample from each of the three numbers**](#Algorithms) generated in step 1.  If all three calls return 1, return 0.  Otherwise, go to step 2. (This implements a triple integral involving the uniform random numbers.)

This can be extended to cover any constant of the form _&zeta;_(_k_) * (1 &minus; 2<sup>&minus;(_k_ &minus; 1)</sup>) where _k_ >= 2 is an integer, as suggested slightly by the Flajolet paper when it mentions _&zeta;_(5) * 31 / 32 (which should probably read _&zeta;_(5) * 15 / 16 instead), using the following algorithm.

1. Generate _k_ uniform(0,1) random numbers.
2. With probability 1/2, return 1.
3. [**Sample from each of the _k_ numbers**](#Algorithms) generated in step 1.  If all _k_ calls return 1, return 0.  Otherwise, go to step 2.

<a id=erf__x__erf_1></a>
#### erf(_x_)/erf(1)

In the following algorithm, _x_ is a real number in the interval [0, 1].

1. Generate a uniform(0, 1) random number, call it _ret_.
2. Set _u_ to point to the same value as _ret_, and set _k_ to 1.
3. (In this and the next step, we create _v_, which is the maximum of two uniform [0, 1] random numbers.) Generate two uniform(0, 1) random numbers, call them _a_ and _b_.
4. If _a_ is less than _b_, set _v_ to _b_. Otherwise, set _v_ to _a_.
5. If _v_ is less than _u_, set _u_ to _v_, then add 1 to _k_, then go to step 3.
6. If _k_ is odd, return 1 if _ret_ is less than _x_, or 0 otherwise. (If _ret_ is implemented as a uniform PSRN, this comparison should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
7. Go to step 1.

In fact, this algorithm takes advantage of a theorem related to the Forsythe method of random sampling (Forsythe 1972)<sup>[**(41)**](#Note41)</sup>.  See the section "[**Probabilities Arising from Certain Permutations**](#Probabilities_Arising_from_Certain_Permutations)" in the appendix for more information.

> **Note:** If the last step in the algorithm reads "Return 0" rather than "Go to step 1", then the algorithm simulates the probability erf(_x_)\*sqrt(&pi;)/2 instead.

<a id=2_1_exp_2_or_1_exp_0_1_exp_1></a>
#### 2 / (1 + exp(2)) or (1 + exp(0)) / (1 + exp(1))

This algorithm takes advantage of formula 2 mentioned in the section "[**Probabilities Arising from Certain Permutations**](#Probabilities_Arising_from_Certain_Permutations)" in the appendix.  Here, the relevant probability is rewritten as 1 &minus; (&int;<sub>(&minus;&infin;, 1)</sub> (1 &minus; exp(&minus;max(0, min(1, _z_)))) * exp(&minus;_z_) _dz_) / (&int;<sub>(&minus;&infin;, &infin;)</sub> (1 &minus; exp(&minus;max(0, min(1, _z_))) * exp(&minus;_z_) _dz_).

1. Generate an **exponential** random number _ex_, then set _k_ to 1.
2. Set _u_ to point to the same value as _ex_.
3. Generate a **uniform(0,1)** random number _v_.
4. Set _stop_ to 1 if _u_ is less than _v_, and 0 otherwise.
5. If _stop_ is 1 and _k_ **is even**, return a number that is 0 if _ex_ is **less than 1**, and 1 otherwise.  Otherwise, if _stop_ is 1, go to step 1.
6. Set _u_ to _v_, then add 1 to _k_, then go to step 3.

<a id=1_exp_1_1_exp_2></a>
#### (1 + exp(1)) / (1 + exp(2))

This algorithm takes advantage of the theorem mentioned in the section "[**Probabilities Arising from Certain Permutations**](#Probabilities_Arising_from_Certain_Permutations)" in the appendix.  Here, the relevant probability is rewritten as 1 &minus; (&int;<sub>(&minus;&infin;, 1/2)</sub> exp(&minus;max(0, min(1, _z_))) * exp(&minus;_z_) _dz_) / (&int;<sub>(&minus;&infin;, &infin;)</sub> exp(&minus;max(0, min(1, _z_)) * exp(&minus;_z_) _dz_).

1. Generate an **exponential** random number _ex_, then set _k_ to 1.
2. Set _u_ to point to the same value as _ex_.
3. Generate a **uniform(0,1)** random number _v_.
4. Set _stop_ to 1 if _u_ is less than _v_, and 0 otherwise.
5. If _stop_ is 1 and _k_ **is odd**, return a number that is 0 if _ex_ is **less than 1/2**, and 1 otherwise.  Otherwise, if _stop_ is 1, go to step 1.
6. Set _u_ to _v_, then add 1 to _k_, then go to step 3.

<a id=1_exp__k__1_exp__k__1></a>
#### (1 + exp(_k_)) / (1 + exp(_k_ + 1))

This algorithm simulates this probability by computing lower and upper bounds of exp(1), which improve as more and more digits are calculated.  These bounds are calculated by an algorithm by Citterio and Pavani (2016)<sup>[**(42)**](#Note42)</sup>.  Note the use of the methodology in (Łatuszyński et al. 2009/2011, algorithm 2)<sup>[**(8)**](#Note8)</sup> in this algorithm.  In this algorithm, _k_ must be an integer 0 or greater.

1. If _k_ is 0, run the **algorithm for 2 / (1 + exp(2))** and return the result.  If _k_ is 1, run the **algorithm for (1 + exp(1)) / (1 + exp(2))** and return the result.
2. Generate a uniform(0, 1) random number, call it _ret_.
3. If _k_ is 3 or greater, return 0 if _ret_ is greater than 38/100, or 1 if _ret_ is less than 36/100.  (This is an early return step.  If _ret_ is implemented as a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
4. Set _d_ to 2.
5. Calculate a lower and upper bound of exp(1) (_LB_ and _UB_, respectively) in the form of rational numbers whose numerator has at most _d_ digits, using the Citterio and Pavani algorithm.  For details, see the appendix.
6. Set _rl_ to (1+_LB_<sup>_k_</sup>) / (1+_UB_<sup>_k_ + 1</sup>), and set _ru_ to (1+_UB_<sup>_k_</sup>) / (1+_LB_<sup>_k_ + 1</sup>); both these numbers should be calculated using rational arithmetic.
7. If _ret_ is greater than _ru_, return 0.  If _ret_ is less than _rl_, return 1.  (If _ret_ is implemented as a uniform PSRN, these comparisons should be done via **URandLessThanReal**.)
8. Add 1 to _d_ and go to step 5.

<a id=Euler_s_Constant___gamma></a>
#### Euler's Constant _&gamma;_

The following algorithm to simulate Euler's constant _&gamma;_ is due to Mendo (2020)<sup>[**(43)**](#Note43)</sup>.  This solves an open question given in (Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>.   The series used was given by Sondow (2005)<sup>[**(44)**](#Note44)</sup>. An algorithm for _&gamma;_ appears here even though it is not yet known whether this constant is irrational.

1. Set _&#x03F5;_ to 1, then set _n_, _lamunq_, _lam_, _s_, _k_, and _prev_ to 0 each.
2. Add 1 to _k_, then add _s_/(2<sup>_k_</sup>) to _lam_.
3. If _lamunq_+_&#x03F5;_ <= _lam_ + 1/(2<sup>_k_</sup>), go to step 8.
4. If _lamunq_ > _lam_ + 1/(2<sup>_k_</sup>), go to step 8.
5. If _lamunq_ > _lam_ + 1/(2<sup>_k_+1</sup>) and _lamunq_+_&#x03F5;_ < 3/(2<sup>_k_+1</sup>), go to step 8.
6. (This step adds a term of the series for _&gamma;_ to _lamunq_, and sets _&#x03F5;_ to an upper bound on the error that results if the series is truncated after summing this and the previous terms.) If _n_ is 0, add 1/2 to _lamunq_ and set _&#x03F5;_ to 1/2.  Otherwise, add _B_(_n_)/(2\*_n_\*(2\*_n_+1)\*(2\*_n_+2)) to _lamunq_ and set _&#x03F5;_ to min(_prev_, (2+_B_(_n_)+(1/_n_))/(16\*_n_\*_n_)), where _B_(_n_) is the minimum number of bits needed to store _n_ (or the smallest _b_>=1 such that _n_ &lt; 2<sup>_b_</sup>).
7. Add 1 to _n_, then set _prev_ to _&#x03F5;_, then go to step 3.
8. Let _bound_ be _lam_+1/(2<sup>_k_</sup>).  If _lamunq_+_&#x03F5;_ <= _bound_, set _s_ to 0.  Otherwise, if _lamunq_ > _bound_, set _s_ to 2.  Otherwise, set _s_ to 1.
9. With probability 1/2, go to step 2.  Otherwise, return a number that is 0 if _s_ is 0, 1 if _s_ is 2, or an unbiased random bit (either 0 or 1 with equal probability) otherwise.

<a id=exp_minus__x___y___z___t></a>
#### exp(&minus;_x_/_y_) \* _z_/_t_

This algorithm is again based on an algorithm due to Mendo (2020)<sup>[**(43)**](#Note43)</sup>.  In this algorithm, _x_, _y_, _z_, and _t_ are integers greater than 0, except _x_ and/or _z_ may be 0, and must be such that exp(&minus;_x_/_y_) \* _z_/_t_ is in the interval [0, 1].

1. If _z_ is 0, return 0.  If _x_ is 0, return a number that is 1 with probability _z_/_t_ and 0 otherwise.
2. Set _&#x03F5;_ to 1, then set _n_, _lamunq_, _lam_, _s_, and _k_ to 0 each.
3. Add 1 to _k_, then add _s_/(2<sup>_k_</sup>) to _lam_.
4. If _lamunq_+_&#x03F5;_ <= _lam_ + 1/(2<sup>_k_</sup>), go to step 9.
5. If _lamunq_ > _lam_ + 1/(2<sup>_k_</sup>), go to step 9.
6. If _lamunq_ > _lam_ + 1/(2<sup>_k_+1</sup>) and _lamunq_+_&#x03F5;_ < 3/(2<sup>_k_+1</sup>), go to step 8.
7. (This step adds two terms of exp(&minus;_x_/_y_)'s alternating series, multiplied by _z_/_t_, to _lamunq_, and sets _&#x03F5;_ to an upper bound on how close the current sum is to the desired probability.)  Let _m_ be _n_\*2.  Set _&#x03F5;_ to _z_\*_x_<sup>_m_</sup>/(_t_\*(_m_!)\*_y_<sup>_m_</sup>).  If _m_ is 0, add _z_\*(_y_&minus;_x_)/(_t_\*_y_) to _lamunq_. Otherwise, add _z_\*_x_<sup>_m_</sup>\*(_m_\*_y_&minus;_x_+_y_) / (_t_\*_y_<sup>_m_+1</sup>\*((_m_+1)!)) to _lamunq_.
8. Add 1 to _n_ and go to step 4.
9. Let _bound_ be _lam_+1/(2<sup>_k_</sup>).  If _lamunq_+_&#x03F5;_ <= _bound_, set _s_ to 0.  Otherwise, if _lamunq_ > _bound_, set _s_ to 2.  Otherwise, set _s_ to 1.
10. With probability 1/2, go to step 3.  Otherwise, return a number that is 0 if _s_ is 0, 1 if _s_ is 2, or an unbiased random bit (either 0 or 1 with equal probability) otherwise.

<a id=ln_2></a>
#### ln(2)

A special case of the algorithm for ln(1+_&lambda;_) given earlier.

1. With probability 1/2, return 1.
2. Generate a uniform(0, 1) random number _u_, if it wasn't generated yet.
3. [**Sample from the number _u_**](#Algorithms).  If the result is 1, return 0.  Otherwise, go to step 1.

<a id=ln_1__y___z></a>
#### ln(1+_y_/_z_)

See also the algorithm given earlier for ln(1+_&lambda;_).  In this algorithm, _y_/_z_ is a rational number in the interval [0, 1].

1. If _y_/_z_ is 0, return 0.
2. With probability 1/2, return a number that is 1 with probability _y_/_z_ and 0 otherwise.
3. Generate a uniform(0, 1) random number _u_, if _u_ wasn't generated yet.
4. [**Sample from the number _u_**](#Algorithms), then generate a number that is 1 with probability _y_/_z_ and 0 otherwise.  If the call returns 1 and the number generated is 1, return 0.  Otherwise, go to step 2.

<a id=General_Algorithms></a>
### General Algorithms

&nbsp;

<a id=Convex_Combinations></a>
#### Convex Combinations

Assume we have one or more input coins _h_<sub>_i_</sub>(_&lambda;_) that returns heads with a probability that depends on _&lambda;_.  (The number of coins may be infinite.) The following algorithm chooses one of these coins at random then flips that coin.  Specifically, the algorithm generates 1 with probability equal to the following weighted sum: _g_(0) * _h_<sub>0</sub>(_&lambda;_) + _g_(1) * _h_<sub>1</sub>(_&lambda;_) + ..., where _g_(_i_) is the probability that coin _i_ will be chosen, _h_<sub>_i_</sub> is the function simulated by coin _i_, and all the _g_(_i_) sum to 1.  See (Wästlund 1999, Theorem 2.7)<sup>[**(28)**](#Note28)</sup>.  (Alternatively, the algorithm can be seen as returning heads with probability **E**\[_h_<sub>_X_</sub>(_&lambda;_)\], that is, the expected or average value of _h_<sub>_X_</sub> where _X_ is the number that identifies the randomly chosen coin.)

1. Generate a random integer _X_ in some way.  For example, it could be a uniform random integer in [1, 6], or it could be a Poisson random number.  (Specifically, the number _X_ is generated with probability _g_(_X_).)
2. Flip the coin represented by _X_ and return the result.

> **Examples:**
>
> 1. Generate a Poisson(_&mu;_) random number _X_, then flip the input coin.  With probability 1/(1+_X_), return the result of the coin flip; otherwise, return 0.  This corresponds to _g_(_i_) being the Poisson(_&mu;_) probabilities and _h_<sub>_i_</sub>() returning 1 with probability 1/(1+_i_), and 0 otherwise.  The probability that this method returns 1 is **E**\[1/(1+_X_)\], or (exp(_&mu;_)&minus;1)/(exp(_&mu;_)\*_&mu;_).
> 2. Generate a Poisson(_&mu;_) random number _X_ and return 1 if _X_ is 0, or 0 otherwise.  This is a Bernoulli factory for exp(&minus;_&mu;_) mentioned earlier, and corresponds to _g_(_i_) being the Poisson(_&mu;_) probabilities and _h_<sub>_i_</sub>() returning 1 if _i_ is 0, and 0 otherwise.
> 3. Generate a Poisson(_&mu;_) random number _X_, run the **algorithm for exp(&minus;_z_)** with _z_ = _X_, and return the result.  The probability of returning 1 this way is **E**\[exp(&minus;_X_)\], or exp(_&mu;_\*exp(&minus;1)&minus;_&mu;_).  The following Python code uses the computer algebra library SymPy to find this probability: `from sympy.stats import *; E(exp(-Poisson('P', x))).simplify()`.
> 4. _Bernoulli Race_ (Dughmi et al. 2017)<sup>[**(11)**](#Note11)</sup>: Say we have _n_ coins, then choose one of them uniformly at random and flip that coin. If the flip returns 1, return _X_; otherwise, repeat this algorithm.  This algorithm chooses a random coin based on its probability of heads.  Each iteration corresponds to _g_(_i_) being 1/_n_ and _h_<sub>_i_</sub>() being the probability for the corresponding coin _i_.
> 5. (Wästlund 1999)<sup>[**(28)**](#Note28)</sup>: Generate a Poisson(1) random number _X_, then flip the input coin _X_ times.  Return 0 if any of the flips returns 1, or 1 otherwise.  This is a Bernoulli factory for exp(&minus;_&lambda;_), and corresponds to _g_(_i_) being the Poisson(1) probabilities, namely 1/(_i_!\*exp(1)), and _h_<sub>_i_</sub>() being (1&minus;_&lambda;_)<sup>_i_</sup>.

<a id=Simulating_the_Probability_Generating_Function></a>
#### Simulating the Probability Generating Function

The following algorithm is a special case of the convex combination method.  It generates heads with probability **E**\[_&lambda;_<sup>_X_</sup>\], that is, the expected or average value of _&lambda;_<sup>_X_</sup>.  **E**\[_&lambda;_<sup>_X_</sup>\] is the _probability generating function_, also known as _factorial moment generating function_, for the distribution of _X_ (Dughmi et al. 2017)<sup>[**(11)**](#Note11)</sup>.

1. Generate a random integer _X_ in some way.  For example, it could be a uniform random integer in [1, 6], or it could be a Poisson random number.
2. Flip the input coin until the flip returns 0 or the coin is flipped _X_ times, whichever comes first.  Return 1 if all the coin flips, including the last, returned 1 (or if _X_ is 0); or return 0 otherwise.

<a id=Integrals></a>
#### Integrals

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup> showed how to turn an algorithm that simulates _f_(_&lambda;_) into an algorithm that simulates the following probability:

- (1/_&lambda;_) &int;<sub>\[0, _&lambda;_\]</sub> _f_(_u_) _du_, or equivalently,
- &int;<sub>\[0, 1\]</sub> _f_(_u_ * _&lambda;_) _du_ (an integral).

This can be done by modifying the algorithm as follows:

- Generate a uniform(0, 1) random number _u_ at the start of the algorithm.
- Instead of flipping the input coin, flip a coin that does the following: "Flip the input coin, then [**sample from the number _u_**](#Algorithms).  Return 1 if both the call and the flip return 1, and return 0 otherwise."

I have found that it's possible to simulate the following integral, namely&mdash;

- &int;<sub>\[_a_, _b_\]</sub> _f_(_u_) _du_,

where \[_a_, _b_\] is \[0, 1\] or a closed interval therein, using different changes to the algorithm, namely:

- Add the following step at the start of the algorithm: "Generate a uniform(0, 1) random number _u_ at the start of the algorithm.  Then if _u_ is less than _a_ or is greater than _b_, repeat this step. (If _u_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal** algorithm.)"
- Instead of flipping the input coin, flip a coin that does the following: "[**Sample from the number _u_**](#Algorithms) and return the result."
- If the algorithm would return 1, it instead returns a number that is 1 with probability _b_ &minus; _a_ and 0 otherwise.

> **Note**: If _a_ is 0 and _b_ is 1, the probability simulated by this algorithm will be monotonically increasing (will keep going up), have a slope no greater than 1, and equal 0 at the point 0.

<a id=Certain_Converging_Series></a>
#### Certain Converging Series

The algorithm for Euler's constant is one example of a general algorithm given by Mendo (2020)<sup>[**(43)**](#Note43)</sup> for simulating any probability in (0, 1), as long as it can be rewritten as a converging series&mdash;

- that has the form _a_\[0\] + _a_\[1\] + ..., where _a_\[_n_\] are all positive rational numbers, and
- for which a sequence _err_\[0\], _err_\[1\], ..., is available that is nonincreasing and converges to 0, where _err_\[_n_\] is an upper bound on the error from truncating the series _a_ after summing the first _n_+1 terms.

The algorithm follows.

1. Set _&#x03F5;_ to 1, then set _n_, _lamunq_, _lam_, _s_, and _k_ to 0 each.
2. Add 1 to _k_, then add _s_/(2<sup>_k_</sup>) to _lam_.
3. If _lamunq_+_&#x03F5;_ <= _lam_ + 1/(2<sup>_k_</sup>), go to step 8.
4. If _lamunq_ > _lam_ + 1/(2<sup>_k_</sup>), go to step 8.
5. If _lamunq_ > _lam_ + 1/(2<sup>_k_+1</sup>) and _lamunq_+_&#x03F5;_ < 3/(2<sup>_k_+1</sup>), go to step 8.
6. Add _a_\[_n_\] to _lamunq_ and set _&#x03F5;_ to _err_\[_n_\].
7. Add 1 to _n_, then go to step 3.
8. Let _bound_ be _lam_+1/(2<sup>_k_</sup>).  If _lamunq_+_&#x03F5;_ <= _bound_, set _s_ to 0.  Otherwise, if _lamunq_ > _bound_, set _s_ to 2.  Otherwise, set _s_ to 1.
9. With probability 1/2, go to step 2.  Otherwise, return a number that is 0 if _s_ is 0, 1 if _s_ is 2, or an unbiased random bit (either 0 or 1 with equal probability) otherwise.

If _a_, given above, is instead a sequence that converges to the _base-2 logarithm_ of a probability in (0, 1), the following algorithm I developed simulates that probability.  For simplicity's sake, even though logarithms for such probabilities are negative, all the _a_\[_i_\] must be 0 or greater (and thus are the negated values of the already negative logarithm approximations) and must form a nondecreasing sequence, and all the _err_\[_i_\] must be 0 or greater.

1. Set _intinf_ to floor(max(0, abs(_a_\[0\]))).  (This is the absolute integer part of the first term in the series, or 0, whichever is greater.)
2. If _intinf_ is greater than 0, generate unbiased random bits until a zero bit or _intinf_ bits were generated this way.  If a zero was generated this way, return 0.
3. Generate an exponential random number _E_ with rate ln(2).  This can be done, for example, by using the algorithm given in "[**More Algorithms for Arbitrary-Precision Sampling**](https://peteroupc.github.io/morealg.html)". (We take advantage of the exponential distribution's _memoryless property_: given that an exponential random number _E_ is greater than _intinf_, _E_ minus _intinf_ has the same distribution.)
4. Set _n_ to 0.
5. Set _inf_ to max(0, _a_\[_n_\]), then set _sup_ to min(0, _inf_+_err_\[_n_\]).
6. If _E_ is less than _inf_+_intinf_, return 0.  If _E_ is less than _sup_+_intinf_, go to the next step.  If neither is the case, return 1.
7. Set _n_ to 1, then go to step 5.

The case when _a_ converges to a _natural logarithm_ rather than a base-2 logarithm is trivial by comparison.  Again for this algorithm, all the _a_\[_i_\] must be 0 or greater and form a nondecreasing sequence, and all the _err_\[_i_\] must be 0 or greater.

1. Generate an exponential random number _E_ (with rate 1).
2. Set _n_ to 0.
3. Set _inf_ to max(0, _a_\[_n_\]), then set _sup_ to min(0, _inf_+_err_\[_n_\]).
4. If _E_ is less than _inf_+_intinf_, return 0.  If _E_ is less than _sup_+_intinf_, go to the next step.  If neither is the case, return 1.
5. Set _n_ to 1, then go to step 5.

> **Example**:
>
> - Let _f_(_&lambda;_) = cosh(1)&minus;1.  The first algorithm in this section can simulate this constant if step 6 is modified to read: "Let _m_ be ((_n_+1)\*2), and let _&alpha;_ be 1/(_m_!) (a term of the Taylor series).  Add _&alpha;_ to _lamunq_ and set _&#x03F5;_ to 2/((_m_+1)!) (the error term).".<sup>[**(45)**](#Note45)</sup>
> - Logarithms can form the basis of efficient algorithms to simulate the probability _z_ = choose(_n_, _k_)/2<sup>_n_</sup> when _n_ can be very large (e.g., as large as 2<sup>30</sup>), without relying on floating-point arithmetic.  In this example, the trivial algorithm for choose(_n_, _k_), the binomial coefficient, will generally require a growing amount of storage that depends on _n_ and _k_. On the other hand, any constant can be simulated using up to two unbiased random bits on average, and even slightly less than that for the constants at hand here (Kozen 2014)<sup>[**(46)**](#Note46)</sup>.  Instead of calculating the binomial coefficient directly, a series can be calculated that converges to that coefficient's logarithm, such as ln(choose(_n_, _k_)), which is economical in space even for large _n_ and _k_.  Then the algorithm above can be used with that series to simulate the probability _z_.  A similar approach has been implemented (see [**interval.py**](https://github.com/peteroupc/peteroupc.github.io/blob/master/interval.py#L694) and [**betadist.py**](https://github.com/peteroupc/peteroupc.github.io/blob/master/betadist.py#L700)).  See also an appendix in (Bringmann et al. 2014)<sup>[**(47)**](#Note47)</sup>.

<a id=General_Factory_Functions></a>
#### General Factory Functions

A coin with unknown probability of heads of _&lambda;_ can be turned into a coin with probability of heads of _f_(_&lambda;_), where _f_ is any factory function, via an algorithm that works with two sequences of polynomials:

- One sequence of polynomials must be non-decreasing and converge from below to _f_, and the other sequence must be non-increasing and converge from above to _f_.
- For both sequences, there must be a way to calculate their polynomials' _Bernstein coefficients_.
- For each sequence, the polynomials must have increasing degree.
- For each sequence, the difference between one polynomial and its previous one must have non-negative Bernstein coefficients (once the previous polynomial is elevated to the same degree as the other).

This section sets forth two algorithms to simulate factory functions via polynomials.  In both algorithms:

- **fbelow**(_n_, _k_) is a lower bound of the _k_<sup>th</sup> Bernstein coefficient for a degree-_n_ polynomial that approximates _f_ from below, where _k_ is in the interval [0, _n_].  For example, this can be _f_(_k_/_n_) minus a constant that depends on _n_. (See note 7 below.)
- **fabove**(_n_, _k_) is an upper bound of the _k_<sup>th</sup> Bernstein coefficient for a degree-_n_ polynomial that approximates _f_ from above.  For example, this can be _f_(_k_/_n_) plus a constant that depends on _n_. (See note 7.)

The first algorithm implements the reverse-time martingale framework (Algorithm 4) in Łatuszyński et al. (2009/2011)<sup>[**(8)**](#Note8)</sup> and the degree-doubling suggestion in Algorithm I of Flegal and Herbei (2012)<sup>[**(48)**](#Note48)</sup>, although an error in Algorithm I is noted below.  The first algorithm follows.

1. Generate a uniform(0, 1) random number, call it _ret_.
2. Set _&#x2113;_ and _&#x2113;t_ to 0.  Set _u_ and _ut_ to 1. Set _lastdegree_ to 0, and set _ones_ to 0.
3. Set _degree_ so that the first pair of polynomials has degree equal to _degree_ and has Bernstein coefficients all lying in [0, 1].  For example, this can be done as follows: Let **fbound**(_n_) be the minimum value for **fbelow**(_n_, _k_) and the maximum value for **fabove**(_n_,_k_) for any _k_ in the interval \[0, _n_\]; then set _degree_ to 1; then while **fbound**(_degree_\) returns an upper or lower bound that is less than 0 or greater than 1, multiply _degree_ by 2; then go to the next step.
4. Set _startdegree_ to _degree_.
5. (Loop.) Flip the input coin _t_ times, where _t_ is _degree_ &minus; _lastdegree_.  For each time the coin returns 1 this way, add 1 to _ones_.
6. Set _&#x2113;_ to **fbelow**(_degree_, _ones_), set _u_ to **fabove**(_degree_, _ones_), and set _lastdegree_ to _degree_.
7. (This step and the next find the expected values of the previous _&#x2113;_ and _u_ given the current coin flips.) If _degree_ equals _startdegree_, set _&#x2113;s_ to 0 and _us_ to 1. (Algorithm I of Flegal and Herbei 2012 doesn't take this into account.)
8. If _degree_ is greater than _startdegree_: Let _nh_ be choose(_degree_, _ones_), and let _od_ be _degree_/2.  Set _&#x2113;s_ to &Sigma;<sub>_j_=0,...,_ones_</sub> **fbelow**(_od_,_j_)\*choose(_degree_&minus;_od_, _ones_&minus;_j_)\*choose(_od_,_j_)/_nh_, and set _us_ to &Sigma;<sub>_j_=0,...,_ones_</sub> **fabove**(_od_,_j_)\*choose(_degree_&minus;_od_, _ones_&minus;_j_)\*choose(_od_,_j_)/_nh_.
9. Let _m_ be (_ut_&minus;_&#x2113;t_)/(_us_&minus;_&#x2113;s_).  Set _&#x2113;t_ to _&#x2113;t_+(_&#x2113;_&minus;_&#x2113;s_)\*_m_, and set _ut_ to _ut_&minus;(_us_&minus;_u_)\*_m_.
10. If _ret_ is less than (or equal to) _&#x2113;t_, return 1.  If _ret_ is less than _ut_, go to the next step.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
11. (Find the next pair of polynomials and restart the loop.) Increase _degree_ so that the next pair of polynomials has degree equal to a higher value of _degree_ and gets closer to the target function (for example, multiply _degree_ by 2).  Then, go to step 5.

The second algorithm was given in Thomas and Blanchet (2012)<sup>[**(24)**](#Note24)</sup>; it assumes the same sequences of polynomials are available as in the previous algorithm.   An algorithm equivalent to that algorithm is given below.

1. Set _ones_ to 0, and set _lastdegree_ to 0.
2. Set _degree_ so that the first pair of polynomials has degree equal to _degree_ and has Bernstein coefficients all lying in [0, 1].  For example, this can be done as follows: Let **fbound**(_n_) be the minimum value for **fbelow**(_n_, _k_) and the maximum value for **fabove**(_n_,_k_) for any _k_ in the interval \[0, _n_\]; then set _degree_ to 1; then while **fbound**(_degree_\) returns an upper or lower bound that is less than 0 or greater than 1, multiply _degree_ by 2; then go to the next step.
3. Set _startdegree_ to _degree_.
4. (Loop.) Flip the input coin _t_ times, where _t_ is _degree_ &minus; _lastdegree_.  For each time the coin returns 1 this way, add 1 to _ones_.
5. Set _c_ to choose(_degree_, _ones_).
6. Calculate _a_\[_degree_,_ones_\] = floor(**fbelow**(_degree_, _ones_)\*_c_) and set _acount_ to it, then calculate _b_\[_degree_,_ones_\] = floor((1&minus;**fabove**(_degree_, _ones_))\*_c_) and set _bcount_ to it, then subtract (_acount_ + _bcount_) from _c_.
7. If _degree_ is greater than _startdegree_, then:
    1. Let _diff_ be _degree_&minus;_lastdegree_, let _u_ be max(0, _ones_&minus;_lastdegree_),
and let _v_ be min(_ones_, _diff_).  (The following substep removes outcomes from _acount_ and _bcount_ that would have terminated the algorithm earlier.  The procedure differs from step (f) of section 3 of the paper, which appears to be incorrect, and the procedure was derived from the [**supplemental source code**](https://github.com/acthomasca/rberfac/blob/main/rberfac-public-2.R) uploaded by A. C. Thomas at my request.)
    2. For each integer _k_ in the interval [_u_, _v_]:
        1. Set _d_ to choose(_diff_, _k_).
        2. Subtract (_a_\[_lastdegree_, _ones_&minus;_k_\]\*_d_) from _acount_.  Here, _a_\[_s_,_t_\] is calculated as floor(**fbelow**(_s_, _t_)\*choose(_s_, _t_)), and may be stored for later use.
        3. Subtract (_b_\[_lastdegree_, _ones_&minus;_k_\]\*_d_) from _bcount_.  Here, _b_\[_s_,_t_\] is calculated as floor((1&minus;**fabove**(_s_, _t_))\*choose(_s_, _t_)), and may be stored for later use.
8. Call **WeightedChoice**([_acount_, _bcount_, _c_]), where **WeightedChoice** is given in "[**Randomization and Sampling Methods**](https://peteroupc.github.io/randomfunc.html)". (This generates a number that is 0, 1, or 2 with probability proportional to each of the given weights.)
9. If the number generated by the previous step is 0, return 1.  If the number generated by that step is 1, return 0.
10. (Find the next pair of polynomials and restart the loop.) Set _lastdegree_ to _degree_, then increase _degree_ so that the next pair of polynomials has degree equal to a higher value of _degree_ and gets closer to the target function (for example, multiply _degree_ by 2).  Then, go to step 4.

> **Notes:**
>
> 1. The efficiency of these two algorithms depends, among other things, on how "smooth" _f_ is, and on how easy it is to calculate the appropriate values for **fbelow** and **fabove**.  The best way to implement **fbelow** and **fabove** will require a deep mathematical analysis of _f_.
> 2. If _f_ is known to be _concave_ in the interval [0, 1\] (which roughly means that its rate of growth there never goes up), then **fbelow**(_n_, _k_) can equal _f_(_k_/_n_), thanks to Jensen's inequality.
> 3. If _f_ is known to be _convex_ in the interval [0, 1\] (which roughly means that its rate of growth there never goes down), then **fabove**(_n_, _k_) can equal _f_(_k_/_n_), thanks to Jensen's inequality.  One example is _f_(_&lambda;_) = exp(&minus;_&lambda;_/4).
> 4. The following method (Nacu and Peres 2005, proposition 10(ii))<sup>[**(5)**](#Note5)</sup> implements **fabove** and **fbelow** if _f_(_&lambda;_)&mdash;
>     - (a) has continuous "slope" and "slope-of-slope" functions in the interval \[0, 1\] \(in other words, _f_ is _C_<sup>2</sup> continuous there), and
>     - (b) in the interval \[0, 1\]&mdash;
>         - has a minimum of greater than 0 and a maximum of less than 1, or
>         - is convex and has a minimum of greater than 0, or
>         - is concave and has a maximum of less than 1.
>
>     Let _m_ be an upper bound of the highest value of abs(_f&prime;&prime;_(_x_)) for any _x_ in [0, 1], where _f&prime;&prime;_ is the "slope-of-slope" function of _f_.  Then for all _n_ that are powers of 2:
>     - **fbelow**(_n_, _k_) = _f_(_k_/_n_) + _m_/(_n_\*2) (or _f_(_k_/_n_) if _f_ is concave; see note 2).
>     - **fabove**(_n_, _k_) = _f_(_k_/_n_) + _m_/(_n_\*2) (or _f_(_k_/_n_) if _f_ is convex; see note 3).
>
>     The SymPy code in the [**appendix**](#SymPy_Code_for_Parameters_to_Simulate_C2_Functions) can calculate the necessary values for **fbound(_n_)** and _m_, given _f_.  Perhaps this algorithm also works with the tighter approximation of (_n_\*8) rather than (_n_\*2) (see Powell 1981)<sup>[**(49)**](#Note49)</sup>.
> 5. If _f_(_&lambda;_) is _Lipschitz continuous_ in (0, 1) and meets (b) in note 4, the following method implements **fabove** and **fbelow** (Nacu and Peres 2005, proposition 10(i))<sup>[**(5)**](#Note5)</sup>.  Let _m_ be the _Lipschitz constant_, namely an upper bound of the highest value of abs(_f&prime;_(_x_)) for any _x_ in [0, 1], where _f&prime;_ is the "slope" function of _f_.  Then for all _n_ that are powers of 2:
>     - **fbelow**(_n_, _k_) = _f_(_k_/_n_) + (1+sqrt(2))\*_m_/sqrt(_n_) (or _f_(_k_/_n_) if _f_ is concave; see note 2).
>     - **fabove**(_n_, _k_) = _f_(_k_/_n_) + (1+sqrt(2))\*_m_/sqrt(_n_) (or _f_(_k_/_n_) if _f_ is convex; see note 3).
> 6. In some cases, a single pair of polynomial sequences may not converge quickly to the desired function _f_, especially when _f_ is not _C_<sup>2</sup> continuous.  An intriguing suggestion from Thomas and Blanchet (2012)<sup>[**(24)**](#Note24)</sup> is to use multiple pairs of polynomial sequences that converge to _f_, where each pair is optimized for particular ranges of _&lambda;_: first flip the input coin several times to get a rough estimate of _&lambda;_, then choose the pair that's optimized for the estimated _&lambda;_, and run either algorithm in this section on that pair.
> 7. If _f_(_k_/_n_) is not a rational number, then it should be calculated in **fabove** and **fbelow** with an accuracy that improves as _n_ (the polynomial degree) gets larger.  In that case, **fabove** should calculate an upper bound of _f_(_k_/_n_), and **fbelow** a lower bound.  Also, it's often convenient to implement **fabove** and **fbelow** with the same code routine and with rational interval arithmetic (such as the one described in Daumas et al. (2007)<sup>[**(50)**](#Note50)</sup>), since both bounds would then be available at once.
>
> **Examples:**
>
> 1. If _f_(_&lambda;_) = min(_&lambda;_, _c_) with _c_ in the interval (0, 1), then the following implementations can be used (Lorentz 1953)<sup>[**(51)**](#Note51)</sup>:
>     - **fbelow**(_n_, _k_) = _f_(_k_/_n_).  This is possible because _f_ is concave.
>     - **fabove**(_n_, _k_) = _f_(_k_/_n_) + _S_/sqrt(_n_), where _S_ = (4306+837\*sqrt(6))/5832 is Sikkema's constant (Sikkema 1961)<sup>[**(52)**](#Note52)</sup> and has an upper bound of 1.08989.
>     - **fbound**(_n_) = [0, **fabove**(_n_, _n_)].
> 2. If _f_(_&lambda;_) = sin(2\*_&lambda;_)/2, then note 4 suggests the following:
>     - **fbelow**(_n_, _k_) = sin(2\*_k_/_n_)/2.  This is possible because _f_ is concave.
>     - **fabove**(_n_, _k_) = sin(2\*_k_/_n_)/2 + 2 / (_n_\*2).
>     - **fbound**(_n_) = [0, (1/2) + 1/_n_].
> 3. If _f_(_&lambda;_) = sin(3\*_&lambda;_)/2, then notes 4 suggests the following:
>     - **fbelow**(_n_, _k_) = sin(3\*_k_/_n_)/2.  This is possible because _f_ is concave.
>     - **fabove**(_n_, _k_) = sin(3\*_k_/_n_)/2 + (9/16) / (_n_\*2).
>     - **fbound**(_n_) = [0, (1/2) + 9/(32\*_n_)].

<a id=Requests_and_Open_Questions></a>
## Requests and Open Questions

1. See the open questions found in the section "[**Probabilities Arising from Certain Permutations**](#Probabilities_Arising_from_Certain_Permutations)" in the appendix.
2. I request expressions of mathematical functions that can be expressed in any of the following ways:
    - Series expansions for continuous functions that equal 0 or 1 at the points 0 and 1.  These are required for Mendo's algorithm for [**certain power series**](#Certain_Power_Series).
    - Series expansions for alternating power series whose coefficients are all in the interval [0, 1] and form a nonincreasing sequence.  This is required for another class of power series.
    - Series expansions with non-negative coefficients and for which bounds on the truncation error are available.
    - Upper and lower bound approximations that converge to a given constant or function.  These upper and lower bounds must be nonincreasing or nondecreasing, respectively.
    - To apply the algorithms for [**general factory functions**](#General_Factory_Functions), what is needed are two sequences of polynomials in Bernstein form, one of which converges from above to a given function, the other from below.  These sequences must be nonincreasing or nondecreasing, respectively, and the polynomials must be of increasing degree and have Bernstein coefficients that are all rational numbers lying in \[0, 1\], but the polynomials in each sequence may start closer to the function at some points than at others.

        Especially helpful would be an automated procedure to compute such sequences, in terms of their Bernstein coefficients, for a large class of factory functions (such as min(_&lambda;_, _c_) where _c_ is a constant in (0, 1)).  (This is in the sense that when given only information about the desired function, such as the coordinates of the function's piecewise linear graph, the procedure can automatically compute the appropriate sequences without further user intervention.)

        I have found [**several methods**](https://math.stackexchange.com/questions/3889382) to compute such sequences, but most of them have issues that I seek clarification on.  For example, the method of Holtz et al. (2011)<sup>[**(25)**](#Note25)</sup> requires knowing the function's smoothness class and requires the function to be bounded away from 0 and 1; moreover the method uses several constants, namely _s_, _θ<sub>α</sub>_, and _D_, with no easy lower bounds.  As another example, Gal's method (1989)<sup>[**(53)**](#Note53)</sup> produces polynomials that converge too slowly to be practical.

        See also my questions on _Mathematics Stack Exchange_:

        - [**Computing converging polynomials**](https://math.stackexchange.com/questions/3904732/what-are-ways-to-compute-polynomials-that-converge-from-above-and-below-to-a-con).
        - [**Bounds of Bernstein coefficients**](https://math.stackexchange.com/questions/3929743/are-error-bounds-on-bernstein-form-polynomials-also-error-bounds-on-their-bernst).
    - Simple [**continued fractions**](#Continued_Fractions) that express useful constants.

    All these expressions should not rely on floating-point arithmetic or the direct use of irrational constants (such as _&pi;_ or sqrt(2)), but may rely on rational arithmetic.  For example, a series expansion that _directly_ contains the constant _&pi;_ is not desired; however, a series expansion that converges to a fraction of _&pi;_ is.
3. Is there a simpler or faster way to implement the base-2 or natural logarithm of binomial coefficients?  See the example in the section "[**Certain Converging Series**](#Certain_Converging_Series)".
4. According to (Mossel and Peres 2005)<sup>[**(21)**](#Note21)</sup>, a pushdown automaton can take a coin with unknown probability of heads of _&lambda;_ and turn it into a coin with probability of heads of _f_(_&lambda;_) only if _f_ is a factory function and can be a solution of a polynomial system with rational coefficients. (See "[**Certain Algebraic Functions**](#Certain_Algebraic_Functions)".)  Are there any results showing whether the converse is true; namely, can a pushdown automaton simulate _any_ _f_ of this kind?  Note that this question is not quite the same as the question of which algebraic functions can be simulated by a context-free grammar (either in general or restricted to those of a certain ambiguity and/or alphabet size), and is not quite the same as the question of which _probability generating functions_ can be simulated by context-free grammars or pushdown automata, although answers to those questions would be nice.  (See also Icard 2019<sup>[**(23)**](#Note23)</sup>.  Answering this question might involve ideas from analytic combinatorics; e.g., see the recent works of Cyril Banderier and colleagues.)

<a id=Correctness_and_Performance_Charts></a>
## Correctness and Performance Charts

Charts showing the correctness and performance of some of these algorithms are found in a [**separate page**](https://peteroupc.github.io/bernoullicorrect.html).

<a id=Acknowledgments></a>
## Acknowledgments

I acknowledge Luis Mendo, who responded to one of my open questions, as well as C. Karney.

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560)", arXiv:0906.5560  [math.PR], 2010.</small>
- <small><sup id=Note2>(2)</sup> Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.</small>
- <small><sup id=Note3>(3)</sup> There is an analogue to the Bernoulli factory problem called the _quantum Bernoulli factory_, with the same goal of simulating functions of unknown probabilities, but this time with algorithms that employ quantum-mechanical operations (unlike _classical_ algorithms that employ no such operations).  However, quantum-mechanical programming is far from being accessible to most programmers at the same level as classical programming, and will likely remain so for the foreseeable future.  For this reason, the _quantum Bernoulli factory_ is outside the scope of this document, but it should be noted that more factory functions can be "constructed" using quantum-mechanical operations than by classical algorithms.  For example, a factory function defined in \[0, 1\] has to meet the requirements proved by Keane and O'Brien except it can touch 0 and/or 1 at a finite number of points in the domain, but its value still cannot go to 0 or 1 exponentially fast (Dale, H., Jennings, D. and Rudolph, T., 2015, "Provable quantum advantage in randomness processing", _Nature communications_ 6(1), pp. 1-4).</small>
- <small><sup id=Note4>(4)</sup> Huber, M., "[**Nearly optimal Bernoulli factories for linear functions**](https://arxiv.org/abs/1308.1562v2)", arXiv:1308.1562v2  [math.PR], 2014.</small>
- <small><sup id=Note5>(5)</sup> Nacu, Şerban, and Yuval Peres. "[**Fast simulation of new coins from old**](https://projecteuclid.org/euclid.aoap/1106922322)", The Annals of Applied Probability 15, no. 1A (2005): 93-115.</small>
- <small><sup id=Note6>(6)</sup> Yannis Manolopoulos. 2002. "Binomial coefficient computation: recursion or iteration?", SIGCSE Bull. 34, 4 (December 2002), 65–67. DOI: [**https://doi.org/10.1145/820127.820168.**](https://doi.org/10.1145/820127.820168.)</small>
- <small><sup id=Note7>(7)</sup> Mendo, Luis. "An asymptotically optimal Bernoulli factory for certain functions that can be expressed as power series." Stochastic Processes and their Applications 129, no. 11 (2019): 4366-4384.</small>
- <small><sup id=Note8>(8)</sup> Łatuszyński, K., Kosmidis, I.,  Papaspiliopoulos, O., Roberts, G.O., "[**Simulating events of unknown probabilities via reverse time martingales**](https://arxiv.org/abs/0907.4018v2)", arXiv:0907.4018v2 [stat.CO], 2009/2011.</small>
- <small><sup id=Note9>(9)</sup> Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.</small>
- <small><sup id=Note10>(10)</sup> Another algorithm for exp(&minus;_&lambda;_) involves the von Neumann schema described in the appendix, but unfortunately, it converges slowly as _&lambda;_ approaches 1.</small>
- <small><sup id=Note11>(11)</sup> Shaddin Dughmi, Jason D. Hartline, Robert Kleinberg, and Rad Niazadeh. 2017. Bernoulli Factories and Black-Box Reductions in Mechanism Design. In _Proceedings of 49th Annual ACM SIGACT Symposium on the Theory of Computing_, Montreal, Canada, June 2017 (STOC’17).</small>
- <small><sup id=Note12>(12)</sup> Gonçalves, F. B., Łatuszyński, K. G., Roberts, G. O. (2017).  Exact Monte Carlo likelihood-based inference for jump-diffusion processes.</small>
- <small><sup id=Note13>(13)</sup> There are two other algorithms for this function, but they both converge very slowly when _&lambda;_ is very close to 1.  One is the general martingale algorithm, since when _&lambda;_ is in \[0, 1\], this function is an alternating series of the form `1 - x + x^2 - x^3 + ...`, whose coefficients are 1, 1, 1, 1, ....  The other is the so-called "even-parity" construction from Flajolet et al. 2010: "(1) Flip the input coin.  If it returns 0, return 1. (2) Flip the input coin.  If it returns 0, return 0.  Otherwise, go to step 1."</small>
- <small><sup id=Note14>(14)</sup> Another algorithm for this function uses the general martingale algorithm, but uses more bits on average as _&lambda;_ approaches 1.  Here, the alternating series is `1 - x + x^2/2 - x^3/3 + ...`, whose coefficients are 1, 1, 1/2, 1/3, ...</small>
- <small><sup id=Note15>(15)</sup> Vats, D., Gonçalves, F. B., Łatuszyński, K. G., Roberts, G. O. "[**Efficient Bernoulli factory MCMC for intractable likelihoods**](https://arxiv.org/abs/2004.07471)", arXiv:2004.07471 [stat.CO], 2020.</small>
- <small><sup id=Note16>(16)</sup> Huber, M., "[**Optimal linear Bernoulli factories for small mean problems**](https://arxiv.org/abs/1507.00843v2)", arXiv:1507.00843v2 [math.PR], 2016.</small>
- <small><sup id=Note17>(17)</sup> Morina, G., Łatuszyński, K., et al., "[**From the Bernoulli Factory to a Dice Enterprise via Perfect Sampling of Markov Chains**](https://arxiv.org/abs/1912.09229)", arXiv:1912.09229 [math.PR], 2019/2020.</small>
- <small><sup id=Note18>(18)</sup> One of the only implementations I could find of this, if not the only, was a [**Haskell implementation**](https://github.com/derekelkins/buffon/blob/master/Data/Distribution/Buffon.hs).</small>
- <small><sup id=Note19>(19)</sup> Huber, M., "[**Designing perfect simulation algorithms using local correctness**](https://arxiv.org/abs/1907.06748v1)", arXiv:1907.06748v1 [cs.DS], 2019.</small>
- <small><sup id=Note20>(20)</sup> Lee, A., Doucet, A. and Łatuszyński, K., 2014. "[**Perfect simulation using atomic regeneration with application to Sequential Monte Carlo**](https://arxiv.org/abs/1407.5770v1)", arXiv:1407.5770v1  [stat.CO].</small>
- <small><sup id=Note21>(21)</sup> Mossel, Elchanan, and Yuval Peres. New coins from old: computing with unknown bias. Combinatorica, 25(6), pp.707-724.</small>
- <small><sup id=Note22>(22)</sup> Smith, N. A. and Johnson, M. (2007).  Weighted and probabilistic context-free grammars are equally expressive. Computational Linguistics, 33(4):477–491.</small>
- <small><sup id=Note23>(23)</sup> Icard, Thomas F., "Calibrating generative models: The probabilistic Chomsky–Schützenberger hierarchy." Journal of Mathematical Psychology 95 (2020): 102308.</small>
- <small><sup id=Note24>(24)</sup> Thomas, A.C., Blanchet, J., "[**A Practical Implementation of the Bernoulli Factory**](https://arxiv.org/abs/1106.2508v3)", arXiv:1106.2508v3  [stat.AP], 2012.</small>
- <small><sup id=Note25>(25)</sup> Holtz, O., Nazarov, F., Peres, Y., "New Coins from Old, Smoothly", _Constructive Approximation_ 33 (2011).</small>
- <small><sup id=Note26>(26)</sup> Propp, J.G., Wilson, D.B., "Exact sampling with coupled Markov chains and applications to statistical mechanics", 1996.</small>
- <small><sup id=Note27>(27)</sup> Goyal, V. and Sigman, K., 2012. On simulating a class of Bernstein polynomials. ACM Transactions on Modeling and Computer Simulation (TOMACS), 22(2), pp.1-5.</small>
- <small><sup id=Note28>(28)</sup> Wästlund, J., "[**Functions arising by coin flipping**](http://www.math.chalmers.se/~wastlund/coinFlip.pdf)", 1999.</small>
- <small><sup id=Note29>(29)</sup> Qian, W. and Riedel, M.D., 2008, June. The synthesis of robust polynomial arithmetic with stochastic logic. In 2008 45th ACM/IEEE Design Automation Conference (pp. 648-653). IEEE.</small>
- <small><sup id=Note30>(30)</sup> Weikang Qian, Marc D. Riedel, Ivo Rosenberg, "Uniform approximation and Bernstein polynomials with coefficients in the unit interval", _European Journal of Combinatorics_ 32(3), 2011,
[**https://doi.org/10.1016/j.ejc.2010.11.004**](https://doi.org/10.1016/j.ejc.2010.11.004) [**http://www.sciencedirect.com/science/article/pii/S0195669810001666**](http://www.sciencedirect.com/science/article/pii/S0195669810001666)</small>
- <small><sup id=Note31>(31)</sup> S. Ray, P.S.V. Nataraj, "A Matrix Method for Efficient Computation of Bernstein Coefficients", Reliable Computing 17(1), 2012.</small>
- <small><sup id=Note32>(32)</sup> And this shows that the polynomial couldn't be simulated if _c_ were allowed to be 1, since the required degree would be infinity; in fact, the polynomial would touch 1 at the point 0.5 in this case, ruling out its simulation by any algorithm (see "About Bernoulli Factories", earlier).</small>
- <small><sup id=Note33>(33)</sup> Niazadeh, R., Leme, R.P., Schneider, J., "[**Combinatorial Bernoulli Factories: Matchings, Flows, and Polytopes**](https://arxiv.org/abs/2011.03865v1)", arXiv:2011.03865v1 [cs.DS], Nov. 7, 2020.</small>
- <small><sup id=Note34>(34)</sup> A _pushdown automaton_, as used here, is defined in Mossel and Peres 2005 and is described as a machine that maintains a stack of symbols and transitions from one state to another based on the current state, the symbol at the top of the stack, and the outcome of a biased coin flip.  With each state transition, the machine adds symbols to the stack or removes symbols from it.  When the stack is empty, the machine halts, and the result is 0 or 1 depending on the machine's state at that time.</small>
- <small><sup id=Note35>(35)</sup> The probability given in Theorem 3.2 of the Flajolet paper, namely just "&Sigma; <sub>_k_ = 0, 1, 2, ... </sub> (W(_k_) * (_&lambda;_/2)<sup>_k_</sup>)", appears to be incorrect in conjunction with Figure 4 of that paper.</small>
- <small><sup id=Note36>(36)</sup> Here, "choose(_g_, _g_/_t_)" means that out of _g_ letters, _g_/_t_ of them must be A's, and "(_&beta;_&minus;1)<sup>_g_&minus;_g_/_t_</sup>" is the number of words that have _g_&minus;_g_/_t_ letters other than A, given that the remaining letters were A's.</small>
- <small><sup id=Note37>(37)</sup> Brassard, G., Devroye, L., Gravel, C., "Remote Sampling with Applications to General Entanglement Simulation", _Entropy_ 2019(21)(92), [**https://doi.org/10.3390/e21010092**](https://doi.org/10.3390/e21010092) .</small>
- <small><sup id=Note38>(38)</sup> Bill Gosper, "Continued Fraction Arithmetic", 1978.</small>
- <small><sup id=Note39>(39)</sup> Borwein, J. et al. “Continued Logarithms and Associated Continued Fractions.” _Experimental Mathematics_ 26 (2017): 412 - 429.</small>
- <small><sup id=Note40>(40)</sup> Canonne, C., Kamath, G., Steinke, T., "[**The Discrete Gaussian for Differential Privacy**](https://arxiv.org/abs/2004.00010)", arXiv:2004.00010 [cs.DS], 2020.</small>
- <small><sup id=Note41>(41)</sup> Forsythe, G.E., "Von Neumann's Comparison Method for Random Sampling from the Normal and Other Distributions", _Mathematics of Computation_ 26(120), October 1972.</small>
- <small><sup id=Note42>(42)</sup> Citterio, M., Pavani, R., "A Fast Computation of the Best _k_-Digit Rational Approximation to a Real Number", _Mediterranean Journal of Mathematics_ 13 (2016).</small>
- <small><sup id=Note43>(43)</sup> Mendo, L., "[**Simulating a coin with irrational bias using rational arithmetic**](https://arxiv.org/abs/2010.14901)", arXiv:2010.14901 [math.PR], 2020.</small>
- <small><sup id=Note44>(44)</sup> Sondow, Jonathan. “New Vacca-Type Rational Series for Euler's Constant and Its 'Alternating' Analog ln 4/_&pi;_.”, 2005.</small>
- <small><sup id=Note45>(45)</sup> The error term, which follows from _Taylor's theorem_, has a numerator of 2 because 2 is higher than the maximum value at the point 1 (in cosh(1)) that _f_'s slope, slope-of-slope, etc. functions can achieve.</small>
- <small><sup id=Note46>(46)</sup> Kozen, D., [**"Optimal Coin Flipping"**](http://www.cs.cornell.edu/~kozen/Papers/Coinflip.pdf), 2014.</small>
- <small><sup id=Note47>(47)</sup> K. Bringmann, F. Kuhn, et al., “Internal DLA: Efficient Simulation of a Physical Growth Model.” In: _Proc. 41st International Colloquium on Automata, Languages, and Programming (ICALP'14)_, 2014.</small>
- <small><sup id=Note48>(48)</sup> Flegal, J.M., Herbei, R., "Exact sampling from intractible probability distributions via a Bernoulli factory", _Electronic Journal of Statistics_ 6, 10-37, 2012.</small>
- <small><sup id=Note49>(49)</sup> Powell, M.J.D., _Approximation Theory and Methods_, 1981.</small>
- <small><sup id=Note50>(50)</sup> Daumas, M., Lester, D., Muñoz, C., "[**Verified Real Number Calculations: A Library for Interval Arithmetic**](https://arxiv.org/abs/0708.3721)", arXiv:0708.3721 [cs.MS], 2007.</small>
- <small><sup id=Note51>(51)</sup> Lorentz, G.G., _Bernstein Polynomials_, 1953.</small>
- <small><sup id=Note52>(52)</sup> Sikkema, P.C., "Der Wert einiger Konstanten in der Theorie der Approximation mit Bernstein-Polynomen", Numer. Math. 3 (1961).</small>
- <small><sup id=Note53>(53)</sup> Gal, S.G., "Constructive approximation by monotonous polynomial sequences in LipMα, with α ∈ (0, 1]", _Journal of Approximation Theory_ 59 (1989).</small>
- <small><sup id=Note54>(54)</sup> von Neumann, J., "Various techniques used in connection with random digits", 1951.</small>
- <small><sup id=Note55>(55)</sup> Pae, S., "Random number generation using a biased source", dissertation, University of Illinois at Urbana-Champaign, 2005.</small>
- <small><sup id=Note56>(56)</sup> Peres, Y., "Iterating von Neumann's procedure for extracting random bits", Annals of Statistics 1992,20,1, p. 590-597.</small>
- <small><sup id=Note57>(57)</sup> Estimating _&lambda;_ as _&lambda;&prime;_, then finding _f_(_&lambda;&prime;_), is not necessarily an unbiased estimator of _f_(_&lambda;_), even if _&lambda;&prime;_ is an unbiased estimator.  Indeed, even though standard deviation equals the square root of variance, taking the square root of the bias-corrected sample variance does not lead to an unbiased estimator of the standard deviation.</small>
- <small><sup id=Note58>(58)</sup> Glynn, P.W., "Exact simulation vs exact estimation", _Proceedings of the 2016 Winter Simulation Conference_, 2016.</small>
- <small><sup id=Note59>(59)</sup> Devroye, L., Gravel, C., "[**Random variate generation using only finitely many unbiased, independently and identically distributed random bits**](https://arxiv.org/abs/1502.02539v6)", arXiv:1502.02539v6  [cs.IT], 2020.</small>
- <small><sup id=Note60>(60)</sup> Flajolet, P., Sedgewick, R., _Analytic Combinatorics_, Cambridge University Press, 2009.</small>
- <small><sup id=Note61>(61)</sup> Monahan, J.. "Extensions of von Neumann’s method for generating random variables." Mathematics of Computation 33 (1979): 1065-1069.</small>
- <small><sup id=Note62>(62)</sup> See the Morina paper for details.  Also, if the Bernstein coefficients are irrational numbers, then special methods are needed to ensure exact results, such as interval arithmetic that calculates lower and upper bounds.</small>

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Randomized_vs_Non_Randomized_Algorithms></a>
### Randomized vs. Non-Randomized Algorithms

A _non-randomized algorithm_ is a simulation algorithm that uses nothing but the input coin as a source of randomness (in contrast to _randomized algorithms_, which do use other sources of randomness) (Mendo 2019)<sup>[**(7)**](#Note7)</sup>.  Instead of generating outside randomness, a randomized algorithm can implement a [**_randomness extraction_**](https://peteroupc.github.io/randextract.html) procedure to generate that randomness using the input coins themselves.  In this way, the algorithm becomes a _non-randomized algorithm_.  For example, if an algorithm implements the **two-coin special case** by generating a random bit in step 1, it could replace generating that bit with flipping the input coin twice until the flip returns 0 then 1 or 1 then 0 this way, then taking the result as 0 or 1, respectively (von Neumann 1951)<sup>[**(54)**](#Note54)</sup>.  A non-randomized algorithm works only if the probability of heads of any of the input coins is known to lie in the interval (0, 1).

In fact, there is a lower bound on the average number of coin flips needed to turn a coin with one probability of heads of (_&lambda;_) into a coin with another (_&tau;_ = _f_(_&lambda;_)).  It's called the _entropy bound_ (see, e.g., (Pae 2005)<sup>[**(55)**](#Note55)</sup>, (Peres 1992)<sup>[**(56)**](#Note56)</sup>) and is calculated as&mdash;

&nbsp;&nbsp;&nbsp;&nbsp;((_&tau;_ &minus; 1) * ln(1 &minus; _&tau;_) &minus; _&tau;_ * ln(_&tau;_)) /<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;((_&lambda;_ &minus; 1) * ln(1 &minus; _&lambda;_) &minus; _&lambda;_ * ln(_&lambda;_)).

For example, if _f_(_&lambda;_) is a constant, non-randomized algorithms will generally require a growing number of coin flips to simulate that constant if the input coin is strongly biased towards heads or tails (the probability of heads is _&lambda;_).  Note that this formula only works if nothing but coin flips is allowed as randomness.

For certain values of _&lambda;_, Kozen (2014)<sup>[**(46)**](#Note46)</sup> showed a tighter lower bound of this kind, but this bound is generally non-trivial and assumes _&lambda;_ is known.  However, if _&lambda;_ is 1/2 (the input coin is unbiased), this bound is simple: at least 2 flips of the input coin are needed on average to simulate a known constant _&tau;_, except when _&tau;_ is a multiple of 1/(2<sup>_n_</sup>) for any integer _n_.

<a id=Simulating_Probabilities_vs_Estimating_Probabilities></a>
### Simulating Probabilities vs. Estimating Probabilities

A Bernoulli factory or another algorithm that produces heads with a given probability acts as an unbiased estimator for that probability that produces estimates in \[0, 1\] almost surely (Łatuszyński et al. 2009/2011)<sup>[**(8)**](#Note8)</sup>. As a result, the probability _f_(_&lambda;_) can be simulated in theory by&mdash;

1. finding in some way an unbiased estimate of _f_(_&lambda;_), where _f_(.) is a factory function and _&lambda;_ is the input coin's probability of heads;<sup>[**(57)**](#Note57)</sup>
2. generating a uniform random number in [0,1], call it _u_; and
3. returning 1 if _u_ is less than _v_, or 0 otherwise.

In practice, however, this method is prone to numerous errors, and they include errors due to the use of fixed precision in steps 1 and 2, such as rounding and cancellations.  For this reason and also because "exact sampling" is the focus of this page, this page does not cover algorithms that directly estimate _&lambda;_ or _f_(_&lambda;_). See also (Mossel and Peres 2005, section 4.3)<sup>[**(21)**](#Note21)</sup>.

As also shown in (Łatuszyński et al. 2009/2011)<sup>[**(8)**](#Note8)</sup>, however, if _f_(_&lambda;_) can't serve as a factory function, it's not possible to build an unbiased estimator of that function which produces estimates in \[0, 1\] almost surely, since simulating that function isn't possible.  For example, function A can't serve as a factory function, so no simulator for that function (and no unbiased estimator of the kind just given) is possible.  This _is_ possible for function B, however (Keane and O'Brien 1994)<sup>[**(2)**](#Note2)</sup>.

- Function A: 2 * _&lambda;_, when _&lambda;_ lies in (0, 1/2).
- Function B: 2 * _&lambda;_, when _&lambda;_ lies in (0, 1/2 &minus; _&#x03F5;_), where _&#x03F5;_ is in (0, 1/2).

Glynn (2016)<sup>[**(58)**](#Note58)</sup> distinguishes between&mdash;

- _exact simulation_, or generating random numbers with the same _distribution_ as that of _g_(_X_)  (same "shape", location, and scale of probabilities) in almost surely finite time, where _g_(_X_) is a random value that follows the desired distribution, based on random numbers _X_, and
- _exact estimation_, or generating random numbers with the same _expected value_ as that of _g_(_X_) (that is, building an estimator of _g_(_X_) that is _unbiased_ and not merely _consistent_ or _asymptotically unbiased_) in almost surely finite time.

Again, the focus of this page is "exact sampling" (_exact simulation_), not "exact estimation", but the input coin with probability of heads of _&lambda;_ can be any "exact estimator" of _&lambda;_ (as defined above) that outputs either 0 or 1.

<a id=Convergence_of_Bernoulli_Factories></a>
### Convergence of Bernoulli Factories

The following Python code illustrates how to test a Bernoulli factory algorithm for convergence to the correct probability, as well as the speed of this convergence.  In this case, we are testing the Bernoulli factory algorithm of _x_<sup>_y_/_z_</sup>, where _x_ is in the interval (0, 1) and _y_/_z_ is greater than 0.  Depending on the parameters _x_, _y_, and _z_, this Bernoulli factory converges faster or slower.

```
# Parameters for the Bernoulli factory x**(y/z)
x=0.005 # x is the input coin's probability of heads
y=2
z=3
# Print the desired probability
print(x**(y/z))
passp = 0
failp = 0
# Set cumulative probability to 1
cumu = 1
iters=4000
for i in range(iters):
  # With probability x, the algorithm returns 1 (heads)
  prob=(x);prob*=cumu; passp+=prob; cumu-=prob
  # With probability (y/(z*(i+1))), the algorithm returns 0 (tails)
  prob=(y/(z*(i+1)));prob*=cumu; failp+=prob; cumu-=prob
  # Output the current probability in this iteration,
  # but only for the first 30 and last 30 iterations
  if i<30 or i>=iters-30: print(passp)
```

As this code shows, as _x_ (the probability of heads of the input coin) approaches 0, the convergence rate gets slower and slower, even though the probability will eventually converge to the correct one. In fact, when _y_/_z_ is less than 1:

- The average number of coin flips needed by this algorithm will grow without bound as _x_ approaches 0, and Mendo (2019)<sup>[**(7)**](#Note7)</sup> showed that this is a lower bound; that is, no Bernoulli factory algorithm can do much better without knowing more information on _x_.
- _x_<sup>_y_/_z_</sup> has a slope that tends to a vertical slope near 0, so that the so-called [**_Lipschitz condition_**](https://en.wikipedia.org/wiki/Lipschitz_continuity) is not met at 0.  And (Nacu and Peres 2005, propositions 10 and 23)<sup>[**(5)**](#Note5)</sup> showed that the Lipschitz condition is necessary for a Bernoulli factory to have an upper bound on the average running time.

Thus, a practical implementation of this algorithm may have to switch to an alternative implementation (such as the one described in the next section) when it detects that the first few digits (after the point) of the uniform random number's fractional part are zeros.

<a id=Alternative_Implementation_of_Bernoulli_Factories></a>
### Alternative Implementation of Bernoulli Factories

Say we have a Bernoulli factory algorithm that takes a coin with probability of heads of _p_ and outputs 1 with probability _f_(_p_).  If this algorithm takes a uniform partially-sampled random number (PSRN) as the input coin and flips that coin using **SampleGeometricBag** (a method described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html)), the algorithm could instead be implemented as follows in order to return 1 with probability _f_(_U_), where _U_ is the number represented by the uniform PSRN (see also (Brassard et al., 2019)<sup>[**(37)**](#Note37)</sup>, (Devroye 1986, p. 769)<sup>[**(9)**](#Note9)</sup>, (Devroye and Gravel 2020)<sup>[**(59)**](#Note59)</sup>.  This algorithm assumes the uniform PSRN's sign is positive and its integer part is 0.

1. Set _v_ to 0 and _k_ to 1.
2. Set _v_ to _b_ * _v_ + _d_, where _b_ is the base (or radix) of the uniform PSRN's digits, and _d_ is a digit chosen uniformly at random.
3. Calculate an approximation of _f_(_U_) as follows:
    1. Set _n_ to the number of items (sampled and unsampled digits) in the uniform PSRN's fractional part.
    2. Of the first _n_ digits (sampled and unsampled) in the PSRN's fractional part, sample each of the unsampled digits uniformly at random.  Then let _uk_ be the PSRN's digit expansion up to the first _n_ digits after the point.
    3. Calculate the lowest and highest values of _f_ in the interval \[_uk_, _uk_ + _b_<sup>&minus;_n_</sup>\], call them _fmin_ and _fmax_. If abs(_fmin_ &minus; _fmax_) <= 2 * _b_<sup>&minus;_k_</sup>, calculate (_fmax_ + _fmin_) / 2 as the approximation.  Otherwise, add 1 to _n_ and go to the previous substep.
4. Let _pk_ be the approximation's digit expansion up to the _k_ digits after the point.  For example, if _f_(_U_) is _&pi;_, _b_ is 10, and _k_ is 2, _pk_ is 314.
5. If _pk_ + 1 <= _v_, return 0. If _pk_ &minus; 2 >= _v_, return 1.  If neither is the case, add 1 to _k_ and go to step 2.

However, the focus of this article is on algorithms that don't rely on calculations of irrational numbers, which is why this section is in the appendix.

<a id=SymPy_Code_for_Parameters_to_Simulate__C_2_Functions></a>
### SymPy Code for Parameters to Simulate _C_<sup>2</sup> Functions

A note in the section "[**General Factory Functions**](#General_Factory_Functions)" gave a method to find polynomials that converge from above and below to a function with continuous slope and slope-of-slope functions, also known as a _C_<sup>2</sup> continuous function. The following Python code uses the SymPy computer algebra library to calculate three needed parameters given a _C_<sup>2</sup> continuous function `func` that uses the variable `x`: _m_ (`m`) and the two bounds for **fbound(_n_)** (`bound1` and `bound2`, respectively).

```
def rminimum(f,x):
  return -rmaximum(-f,x)

def rmaximum(f,x): # Try maximum, and fall back if it fails
  try:
     return maximum(f,x,Interval(0, 1))
  except:
     # 0.1 is added below as a bias
     return (f).subs(x, nsolve(diff(f), (0,1)))+0.1

d=diff(diff(func))
m=Max(rmaximum(-d,x),rmaximum(d,x))
bound1=rminimum(func,x)-m/(n*8)
bound2=rmaximum(func,x)+m/(n*8)
```

<a id=Correctness_Proof_for_the_Continued_Logarithm_Simulation_Algorithm></a>
### Correctness Proof for the Continued Logarithm Simulation Algorithm

**Theorem.** _The algorithm given in "Continued Logarithms" returns 1 with probability exactly equal to the number represented by the continued logarithm c, and 0 otherwise._

_Proof._ This proof of correctness takes advantage of Huber's "fundamental theorem of perfect simulation" (Huber 2019)<sup>[**(19)**](#Note19)</sup>.  Using Huber's theorem requires proving two things:

- First, we note that the algorithm clearly halts almost surely, since step 1 will stop the algorithm if it reaches the last coefficient, and step 2 always gives a chance that the algorithm will return a value, even if it's called recursively or the number of coefficients is infinite.  Thus, the chance the algorithm has to be called recursively or with more iterations shrinks and shrinks as the algorithm does more recursions and iterations.
- Second, we show the algorithm is locally correct when the recursive call in step 3 is replaced with an oracle that simulates the correct "continued sub-logarithm".  If step 1 reaches the last coefficient, the algorithm obviously passes with the correct probability.  Otherwise, we will be simulating the probability (1 / 2<sup>_c_\[_i_\]</sup>) / (1 + _x_), where _x_ is the "continued sub-logarithm" and will be at most 1 by construction.  Steps 2 and 3 define a loop that divides the probability space into three pieces: the first piece takes up one half, the second piece (step 3) takes up a portion of the other half (which here is equal to _x_/2), and the last piece is the "rejection piece" that reruns the loop.  Since this loop changes no variables that affect later iterations, each iteration acts like an acceptance/rejection algorithm already proved to be a perfect simulator by Huber.  The algorithm will pass at step 2 with probability _p_ = (1 / 2<sup>_c_\[_i_\]</sup>) / 2 and fail either at step 2 with probability _f1_ = (1 &minus; 1 / 2<sup>_c_\[_i_\]</sup>) / 2, or at step 3 with probability _f2_ = _x_/2 (all these probabilities are relative to the whole iteration).  Finally, dividing the passes by the sum of passes and fails (_p_ / (_p_ + _f1_ + _f2_)) leads to (1 / 2<sup>_c_\[_i_\]</sup>) / (1 + _x_), which is the probability we wanted.

Since both conditions of Huber's theorem are satisfied, this completes the proof. &#x25a1;

<a id=Correctness_Proof_for_Continued_Fraction_Simulation_Algorithm_3></a>
### Correctness Proof for Continued Fraction Simulation Algorithm 3

**Theorem.** _Suppose a generalized continued fraction's partial numerators are b[i] and all greater than 0, and its partial denominators are a[i] and all greater than 0, and suppose further that each b[i]/a[i] is 1 or less. Then the algorithm given as Algorithm 3 in "Continued Fractions" returns 1 with probability exactly equal to the number represented by that continued fraction, and 0 otherwise._

_Proof._ We use Huber's "fundamental theorem of perfect simulation" again in the proof of correctness.

- The algorithm halts almost surely for the same reason as the similar continued logarithm simulator.
- If the call in step 3 is replaced with an oracle that simulates the correct "sub-fraction", the algorithm is locally correct.  If step 1 reaches the last element of the continued fraction, the algorithm obviously passes with the correct probability. Otherwise, we will be simulating the probability _b_\[_i_\] / (_a_\[_i_\] + _x_), where _x_ is the "continued sub-fraction" and will be at most 1 by assumption.  Steps 2 and 3 define a loop that divides the probability space into three pieces: the first piece takes up a part equal to _h_ = _a_\[_i_\]/(_a_\[_i_\] + 1), the second piece (step 3) takes up a portion of the remainder (which here is equal to _x_ * (1 &minus; _h_)), and the last piece is the "rejection piece".  The algorithm will pass at step 2 with probability _p_ = (_b_\[_i_\] / _a_\[_pos_\]) * _h_ and fail either at step 2 with probability _f1_ = (1 &minus; _b_\[_i_\] / _a_\[_pos_\]) * _h_, or at step 3 with probability _f2_ = _x_ * (1 &minus; _h_) (all these probabilities are relative to the whole iteration).  Finally, dividing the passes by the sum of passes and fails leads to _b_\[_i_\] / (_a_\[_i_\] + _x_), which is the probability we wanted, so that both of Huber's conditions are satisfied and we are done.  &#x25a1;

<a id=The_von_Neumann_Schema></a>
### The von Neumann Schema

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup> describes what it calls the _von Neumann schema_ (sec. 2).  Although the von Neumann schema is used in several Bernoulli factories given here, it's not a Bernoulli factory itself since it could produce random numbers other than 0 and 1, which is why this section appears in the appendix.  Given a permutation class and an input coin, the von Neumann schema generates a random integer _n_, 0 or greater, with probability equal to&mdash;

- (_&lambda;_<sup>_n_</sup> * V(_n_) / _n_!) / EGF(_&lambda;_),

where&mdash;

- EGF(_&lambda;_) = &Sigma;<sub>_k_ = 0, 1, ...</sub> (_&lambda;_<sup>_k_</sup> * V(_k_) / _k_!) (the _exponential generating function_ or EGF, which completely determines a permutation class), and
- V(_n_) is a number in the interval \[0, _n_!\] and is the number of permutations of size _n_ that meet the requirements of the permutation class in question.

Effectively, a random number _G_ is generated by flipping the coin until it returns 0 and counting the number of ones (the paper calls _G_ a _geometric_(_&lambda;_) random number, but this terminology is avoided in this article because it has several conflicting meanings in academic works), and then accepted with probability V(_G_)/(_G_!) and rejected otherwise.  The probability that _r_ random numbers are rejected this way is _p_*(1 &minus; _p_)<sup>_r_</sup>, where _p_ = (1 &minus; _&lambda;_) * EGF(_&lambda;_).

Examples of permutation classes include&mdash;

- single-cycle permutations (EGF(_&lambda;_) = Cyc(_&lambda;_) = ln(1/(1 &minus; _&lambda;_)); V(_n_) = (_n_ &minus; 1)!)
- sorted permutations, or permutations whose numbers are sorted in descending order (EGF(_&lambda;_) = Set(_&lambda;_) = exp(_&lambda;_); V(_n_) = 1),
- all permutations (EGF(_&lambda;_) = Seq(_&lambda;_) = 1/(1 &minus; _&lambda;_); V(_n_) = _n_!),
- alternating permutations of even size (EGF(_&lambda;_) = 1/cos(_&lambda;_); the V(_n_) starting at _n_ = 0 is [**A000364**](https://oeis.org/A000364) in the _On-Line Encyclopedia of Integer Sequences_), and
- alternating permutations of odd size (EGF(_&lambda;_) = tan(_&lambda;_); the V(_n_) starting at _n_ = 0 is [**A000182**](https://oeis.org/A000182)),

using the notation in "Analytic Combinatorics" (Flajolet and Sedgewick 2009)<sup>[**(60)**](#Note60)</sup>.

The following algorithm generates a random number that follows the von Neumann schema.

1. Set _r_ to 0. (This is the number of times the algorithm rejects a random number.)
2. Flip the input coin until the flip returns 0.  Then set _G_ to the number of times the flip returns 1 this way.
3. With probability V(_G_)/_G_!, return _G_ (or _r_ if desired).  (In practice, the probability check is done by generating _G_ uniform(0, 1) random numbers and determining whether those numbers satisfy the given permutation class, or generating as many of those numbers as necessary to make this determination.  This is especially because _G_!, the factorial of _G_, can easily become very large.)
4. Add 1 to _r_ and go to step 2.

A variety of Bernoulli factory probability functions can arise from the von Neumann schema, depending on the EGF and which values of _G_ and/or _r_ the Bernoulli factory algorithm treats as heads or tails.  The following Python functions use the SymPy computer algebra library to find probabilities and other useful information for applying the von Neumann schema, given a permutation class's EGF.

```
def coeffext(f, x, power):
    # Extract a coefficient from a generating function
    # NOTE: Can also be done with just the following line:
    # return diff(f,(x,power)).subs(x,0)/factorial(power)
    px = 2
    for i in range(10):
      try:
        poly=Poly(series(f, x=x, n=power+px).removeO())
        return poly.as_expr().coeff(x, power)
      except:
        px+=2
    # Failed, assume 0
    return 0

def number_n_prob(f, x, n):
    # Probability that the number n is generated
    # for the von Neumann schema with the given
    # exponential generating function (e.g.f.)
    # Example: number_n_prob(exp(x),x,1) --> x**exp(-x)
    return (x**n*coeffext(f, x, n))/f

def r_rejects_prob(f, x, r):
    # Probability that the von Neumann schema
    # with the given e.g.f. will reject r random numbers
    # before accepting the next one
    p=(1-x)*f
    return p*(1-p)**r

def valid_perm(f, x, n):
    # Number of permutations of size n that meet
    # the requirements of the permutation class
    # determined by the given e.g.f. for the
    # von Neumann schema
    return coeffext(f, x, n)*factorial(n)
```

> **Note:** The von Neumann schema can simulate any _power series distribution_ (such as Poisson, negative binomial, geometric, and logarithmic series), given a suitable exponential generating function.  However, because of step 2, the number of input coin flips required by the schema grows without bound as _&lambda;_ approaches 1.
>
> **Example:** Using the class of _sorted permutations_, we can generate a Poisson(_&lambda;_) random number via the von Neumann schema, where _&lambda;_ is the probability of heads of the input coin.  This would lead to an algorithm for exp(&minus;_&lambda;_) &mdash; return 1 if a Poisson(_&lambda;_) random number is 0, or 0 otherwise &mdash; but for the reason given in the note, this algorithm converges slowly as _&lambda;_ approaches 1.

A variation on the von Neumann schema occurs if _G_ is generated differently than given in step 2, but is still generated by flipping the input coin.  In that case, the algorithm above will return _n_ with probability&mdash;

- (_&kappa;_(_n_; _&lambda;_)\*V(_n_)/(_n_!)) / _p_,

where _p_ = ( &Sigma;<sub>_k_=0,1,...</sub> (_&kappa;_(_k_; _&lambda;_)\*V(_k_)/(_k_!)) ), and where _&kappa;_(_n_; _&lambda;_) is the probability that _G_ is _n_, with parameter _&lambda;_ or the input coin's probability of heads.  Also, the probability that _r_ random numbers are rejected by the modified algorithm is _p_*(1 &minus; _p_)<sup>_r_</sup>.

> **Example:**  If _G_ is a Poisson(_z_<sup>2</sup>/4) random number and the sorted permutation class is used, the algorithm will return 0 with probability 1/_I_<sub>0</sub>(_z_), where _I_<sub>0</sub>(.) is the modified Bessel function of the first kind.

<a id=Probabilities_Arising_from_Certain_Permutations></a>
### Probabilities Arising from Certain Permutations

Certain interesting probability functions can arise from permutations, such as permutations that are sorted or permutations whose highest number appears first.

Inspired by the [**von Neumann schema**](#The_von_Neumann_schema) given earlier in this appendix, we can describe an algorithm that produces a random number given a permutation class as follows:

1. Create an empty list.
2. Generate a uniform(0, 1) random number _u_, and append _u_ to the end of the list.
3. Let _n_ be the number of items in the list minus 1.  If the items in the list do not form a permutation that meets the permutation class's requirements, return _n_.  Otherwise, go to step 2.

This algorithm returns the number _n_ with the following probability:

_G_(_n_) = (1 &minus; _V_(_n_ + 1)/(_V_(_n_) * (_n_ + 1)) ) * (1 &minus; &Sigma;<sub>_j_ = 0, ..., _n_ &minus; 1</sub> _G_(_j_) )<br/>
&nbsp;&nbsp;&nbsp;&nbsp;= (_V_(_n_) * (_n_ + 1) &minus; _V_(_n_ + 1)) / (_V_(0) * (_n_ + 1)!),

where _V_(_n_) is the number of permutations of size _n_ that meet the permutation class's requirements. For this algorithm, _V_(_n_) must be in the interval \(0, _n_!\] (thus, for example, this formula won't work if there are 0 permutations of odd size). _V_(_n_) can be a sequence associated with an _exponential generating function_ (EGF) for the kind of permutation involved in the algorithm, and examples of EGFs were given in the section on the von Neumann schema.  For example, the class of _alternating permutations_ (permutations whose numbers alternate between low and high, that is, _X1_ > _X2_ < _X3_ > ...) uses the EGF tan(_&lambda;_)+1/cos(_&lambda;_).

For this algorithm, the probability that the generated _n_&mdash;

- is odd is 1 &minus; 1 / EGF(1), or
- is even is 1 / EGF(1), or
- is less than _k_ is (_V_(0) &minus; _V_(_k_)/(_k_!)) / _V_(0).

This algorithm can also be used to produce continuous random numbers, which will depend on the EGF (permutation class), which return values of _n_ we care about, and so on.  Specifically, consider the following algorithm:

1. Create an empty list.
2. If the list is empty, generate a random number distributed as _D_, call it _&delta;_.  Otherwise, generate a random number distributed as _E_.  Either way, append the random number to the end of the list. (In this step, _D_ and _E_ are both continuous distributions.)
3. Let _n_ be the number of items in the list minus 1.  If the items in the list do not form a permutation that meets the permutation class's requirements, return _n_.  Otherwise, go to step 2.

Then the algorithm's behavior is given in the tables below.

| Permutation Class | Distribution _D_ | Distribution _E_ | The algorithm returns _n_ with this probability: | The probability that _n_ is ... |
 --- | --- | --- | --- | --- |
| Numbers sorted in descending order | Uniform(0,1) | Uniform(0,1) | _n_ / ((_n_ + 1)!). | Odd is 1&minus;exp(&minus;1).<br/>Even is exp(&minus;1). |
| Numbers sorted in descending order | Any | Any | (&int;<sub>(&minus;&infin;,&infin;)</sub> DPDF(_z_) \* (ECDF(_z_)<sup>_n_&minus;1</sup>/((_n_&minus;1)!) &minus; ECDF(_z_)<sup>_n_</sup>/(_n_!)) _dz_), for all _n_ > 0 (see also proof of Theorem 2.1 of (Devroye 1986, Chapter IV)<sup>[**(9)**](#Note9)</sup>. DPDF and ECDF are defined later. | Odd is denominator of formula 1 below. |
| Alternating numbers | Uniform(0,1) | Uniform(0,1) | (_a_<sub>_n_</sub> * (_n_ + 1) &minus; _a_<sub>_n_ + 1</sub>) / (_n_ + 1)!, where _a_<sub>_i_</sub> is the integer at position _i_ (starting at 0) of the sequence [**A000111**](https://oeis.org/A000111) in the _On-Line Encyclopedia of Integer Sequences_. | Odd is 1&minus;cos(1)/(sin(1)+1).<br/>Even is cos(1)/(sin(1)+1). |
| Any | Uniform(0,1) | Uniform(0,1) | (&int;<sub>\[0, 1\]</sub> 1 \* (_z_<sup>_n_&minus;1</sup>\*V(_n_)/((_n_&minus;1)!) &minus; _z_<sup>_n_</sup>\*V(_n_+1)/(_n_!)) _dz_), for all _n_ > 0. | Odd is 1 &minus; 1 / EGF(1). |

| Permutation Class | Distribution _D_ | Distribution _E_ | The probability that _&delta;_ is less than _x_ given that _n_ is ... |
 --- | --- | --- | --- |
| Numbers sorted in descending order | Any | Any | Odd is _&psi;_(_x_) = (&int;<sub>(&minus;&infin;, _x_)</sub> exp(&minus;ECDF(_z_)) * DPDF(_z_) _dz_) / (&int;<sub>(&minus;&infin;, &infin;)</sub> exp(&minus;ECDF(_z_)) * DPDF(_z_) _dz_) (Formula 1; see Theorem 2.1(iii) of (Devroye 1986, Chapter IV)<sup>[**(9)**](#Note9)</sup>; see also Forsythe 1972<sup>[**(41)**](#Note41)</sup>).  Here, DPDF is the probability density function (PDF) of _D_, and ECDF is the cumulative distribution function (CDF) of _E_.<br>If _x_ is uniform(0, 1), this probability becomes &int;<sub>[0, 1]</sub> _&psi;_(_z_) _dz_. |
| Numbers sorted in descending order | Any | Any | Even is (&int;<sub>(&minus;&infin;, _x_)</sub> (1 &minus; exp(&minus;ECDF(_z_))) * DPDF(_z_) _dz_) / (&int;<sub>(&minus;&infin;, &infin;)</sub> (1 &minus; exp(&minus;ECDF(_z_))) * DPDF(_z_) _dz_) (Formula 2; see also Monahan 1979<sup>[**(61)**](#Note61)</sup>).  DPDF and ECDF are as above. |
| Numbers sorted in descending order | Uniform(0,1) | Uniform(0,1) | Odd is ((1&minus;exp(&minus;_x_))&minus;exp(1))/(1&minus;exp(1)).  Therefore, the distribution of _&delta;_ is exponential(1) and "truncated" to the interval \[0, 1\] (von Neumann 1951)<sup>[**(54)**](#Note54)</sup>. |
| Numbers sorted in descending order | Uniform(0,1) | Max. of two uniform(0,1) | Odd is erf(_x_)/erf(1) (uses Formula 1, where DPDF(_z_) = 1 and ECDF(_z_) = _z_<sup>2</sup> for _z_ in \[0, 1\]; see also [**erf(_x_)/erf(1)**](#erf__x__erf_1)). |

> **Note:** All the functions possible for formulas 1 and 2 are nondecreasing functions.  Both formulas express the cumulative distribution function _F_<sub>_D_</sub>(_x_ | _n_ is odd) or _F_<sub>_D_</sub>(_x_ | _n_ is even), respectively.

**Open Question:**  How can the tables above be filled for other permutation classes and different combinations of distributions _D_ and _E_?

<a id=Sketch_of_Derivation_of_the_Algorithm_for_1___pi></a>
### Sketch of Derivation of the Algorithm for 1 / _&pi;_

The Flajolet paper presented an algorithm to simulate 1 / _&pi;_ but provided no derivation.  Here is a sketch of how this algorithm works.

The algorithm is an application of the [**convex combination**](#Convex_Combinations) technique.  Namely, 1 / _&pi;_ can be seen as a convex combination of two components:

- _g_(_n_): 2<sup>6 * _n_</sup> * (6 * _n_ + 1) / 2<sup>8 * _n_ + 2</sup> = 2<sup>&minus;2 * _n_</sup> * (6 * _n_ + 1) / 4 = (6 * _n_ + 1) / (2<sup>2 * _n_ + 2</sup>), which is the probability that the sum of the following independent random numbers equals _n_:

    - Two random numbers that each express the number of failures before the first success, where the chance of a success is 1&minus;1/4 (the paper calls these two numbers _geometric_(1/4) random numbers, but this terminology is avoided in this article because it has several conflicting meanings in academic works).
    - One Bernoulli(5/9) random number.

    This corresponds to step 1 of the convex combination algorithm and steps 2 through 4 of the 1 / _&pi;_ algorithm.  (This also shows that there is an error in the identity for 1 / _&pi;_ given in the Flajolet paper: the "8 _n_ + 4" should read "8 _n_ + 2".)
- _h_<sub>_n_</sub>(): (choose(_n_ * 2, _n_) / 2<sup>_n_ * 2</sup>)<sup>3</sup>, which is the probability of heads of the "coin" numbered _n_.  This corresponds to step 2 of the convex combination algorithm and step 5 of the 1 / _&pi;_ algorithm.

> **Notes:**
>
> 1. 9 * (_n_ + 1) / (2<sup>2 * _n_ + 4</sup>) is the probability that the sum of two independent random numbers equals _n_, where each of the two numbers expresses the number of failures before the first success and the chance of a success is 1&minus;1/4.
> 2. _p_<sup>_m_</sup> * (1 &minus; _p_)<sup>_n_</sup> * choose(_n_ + _m_ &minus; 1, _m_ &minus; 1) is the probability that the sum of _m_ independent random numbers equals _n_ (a _negative binomial distribution_), where each of the _m_ numbers expresses the number of failures before the first success and the chance of a success is _p_.
> 3. _f_(_z_) * (1 &minus; _p_) + _f_(_z_ &minus; 1) * _p_ is the probability that the sum of two independent random numbers &mdash; a Bernoulli(_p_) number and an integer _z_ with probability mass function _f_(.) &mdash; equals _z_.

<a id=Calculating_Bounds_for_exp_1></a>
### Calculating Bounds for exp(1)

The following implements the parts of Citterio and Pavani's algorithm (2016)<sup>[**(42)**](#Note42)</sup> needed to calculate lower and upper bounds for exp(1) in the form of rational numbers.

Define the following operations:

- **Setup:** Set _p_ to the list `[0, 1]`, set _q_ to the list `[1, 0]`, set _a_ to the list `[0, 0, 2]` (two zeros, followed by the integer part for exp(1)), set _v_ to 0, and set _av_ to 0.
- **Ensure _n_:** While _v_ is less than or equal to _n_:
    1. (Ensure partial denominator _v_, starting from 0, is available.) If _v_ + 2 is greater than or equal to the size of _a_, append 1, _av_, and 1, in that order, to the list _a_, then add 2 to _av_.
    2. (Calculate convergent _v_, starting from 0.) Append _a_\[_n_+2\] \* _p_\[_n_+1\]+_p_\[_n_\] to the list _p_, and append _a_\[_n_+2\] \* _q_\[_n_+1\]+_q_\[_n_\] to the list _q_. (Positions in lists start at 0.  For example, _p_\[0\] means the first item in _p_; _p_\[1\] means the second; and so on.)
    3. Add 1 to _v_.
- **Get the numerator for convergent _n_:** Ensure _n_, then return _p_\[_n_+2\].
- **Get convergent _n_:** Ensure _n_, then return _p_\[_n_+2\]/_q_\[_n_+2\].
- **Get semiconvergent _n_ given _d_:**
    1. Ensure _n_, then set _m_ to floor(((10<sup>_d_</sup>)&minus;1&minus;_p_\[_n_+1\])/_p_[_n_+2]).
    2. Return (_p_\[_n_+2\] \* _m_ +_p_[_n_+1]) / (_q_\[_n_+2\] \* _m_ +_q_[_n_+1]).

Then the algorithm to calculate lower and upper bounds for exp(1), given _d_, is as follows:

1. Set _i_ to 0, then run the **setup**.
2. **Get the numerator for convergent _i_**, call it _c_. If _c_ is less than 10<sup>_d_</sup>, add 1 to _i_ and repeat this step.  Otherwise, go to the next step.
3. **Get convergent _i_ &minus; 1** and **get semiconvergent _i_ &minus; 1 given _d_**, call them _conv_ and _semi_, respectively.
4. If (_i_ &minus; 1) is odd, return _semi_ as the lower bound and _conv_ as the upper bound.  Otherwise, return _conv_ as the lower bound and _semi_ as the upper bound.

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
