# Bernoulli Factory Algorithms

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

This page catalogs algorithms to turn coins biased one way into coins biased another way, also known as _Bernoulli factories_.  Many of them were suggested in (Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>, but without step-by-step instructions in many cases.  This page provides these instructions to help programmers implement the Bernoulli factories they describe.

<a id=About_This_Document></a>
### About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/bernoulli.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/bernoulli.md)**.  You can send comments on this document on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues)**.  You are welcome to suggest additional Bernoulli factory algorithms.**

<a id=Contents></a>
## Contents

- [**Introduction**](#Introduction)
    - [**About This Document**](#About_This_Document)
- [**Contents**](#Contents)
- [**About Bernoulli Factories**](#About_Bernoulli_Factories)
- [**Algorithms**](#Algorithms)
    - [**Algorithms for Functions of &lambda;**](#Algorithms_for_Functions_of_lambda)
        - [**exp(&minus;&lambda;)**](#exp_minus_lambda)
        - [**exp(&lambda;)*(1&minus;&lambda;)**](#exp_lambda_1_minus_lambda)
        - [**exp(&minus;&lambda; &minus; _c_)**](#exp_minus_lambda_minus__c)
        - [**1/(1+&lambda;)**](#1_1_lambda)
        - [**log(1+&lambda;)**](#log_1_lambda)
        - [**1 &minus; log(1+&lambda;)**](#1_minus_log_1_lambda)
        - [**_c_ * &lambda; * &beta; / (&beta; * (_c_ * &lambda; + _d_ * &mu;) &minus; (&beta; &minus; 1) * (_c_ + _d_))**](#c__lambda_beta_beta__c__lambda__d__mu_minus_beta_minus_1__c___d)
        - [**_c_ * &lambda; / (_c_ * &lambda; + _d_) or (_c_/_d_) * &lambda; / (1 + (_c_/_d_) * &lambda;))**](#c__lambda__c__lambda__d__or__c___d__lambda_1__c___d__lambda)
        - [**&lambda; + &mu;**](#lambda_mu)
        - [**&lambda; &minus; &mu;**](#lambda_minus_mu)
        - [**1/(_c_ + &lambda;)**](#1__c__lambda)
        - [**1 &minus; &lambda;**](#1_minus_lambda)
        - [**&nu; * &lambda; + (1 &minus; &nu;) * &mu;**](#nu_lambda_1_minus_nu_mu)
        - [**&lambda; + &mu; &minus; (&lambda; * &mu;)**](#lambda_mu_minus_lambda_mu)
        - [**(&lambda; + &mu;) / 2**](#lambda_mu_2)
        - [**arctan(&lambda;) /&lambda;**](#arctan_lambda_lambda)
        - [**arctan(&lambda;)**](#arctan_lambda)
        - [**&lambda;<sup>_x_/_y_</sup>**](#lambda__x___y)
        - [**&lambda;<sup>&mu;</sup>**](#lambda_mu_3)
        - [**sqrt(&lambda;)**](#sqrt_lambda)
        - [**arcsin(&lambda;) + sqrt(1 &minus; &lambda;<sup>2</sup>) &minus; 1**](#arcsin_lambda_sqrt_1_minus_lambda_2_minus_1)
        - [**arcsin(&lambda;) / 2**](#arcsin_lambda_2)
        - [**&lambda; * &mu;**](#lambda_mu_4)
        - [**&lambda; * _x_/_y_ (linear Bernoulli factories)**](#lambda__x___y__linear_Bernoulli_factories)
        - [**(&lambda; * _x_/_y_)<sup>_i_</sup>**](#lambda__x___y___i)
        - [**&epsilon; / &lambda;**](#epsilon_lambda)
    - [**Algorithms for Irrational Constants**](#Algorithms_for_Irrational_Constants)
        - [**Continued Fractions**](#Continued_Fractions)
        - [**arctan(_x_/_y_) \* _y_/_x_**](#arctan__x___y___y___x)
        - [**&pi; / 12**](#pi_12)
        - [**&pi; / 4**](#pi_4)
        - [**1 / &pi;**](#1_pi)
        - [**(_a_/_b_)<sup>_x_/_y_</sup>**](#a___b___x___y)
        - [**exp(&minus;_x_/_y_)**](#exp_minus__x___y)
        - [**exp(&minus;_z_)**](#exp_minus__z)
        - [**(_a_/_b_)<sup>_z_</sup>**](#a___b___z)
    - [**General Algorithms**](#General_Algorithms)
        - [**Simulating the Probability Generating Function**](#Simulating_the_Probability_Generating_Function)
        - [**URandLessThanFraction**](#URandLessThanFraction)
- [**Correctness and Performance Charts**](#Correctness_and_Performance_Charts)
    - [**The Charts**](#The_Charts)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Convergence of Bernoulli Factories**](#Convergence_of_Bernoulli_Factories)
    - [**Alternative Implementation of Bernoulli Factories**](#Alternative_Implementation_of_Bernoulli_Factories)
- [**License**](#License)

<a id=About_Bernoulli_Factories></a>
## About Bernoulli Factories

A _Bernoulli factory_ (Keane and O'Brien 1994)<sup>[**(2)**](#Note2)</sup> is an algorithm that takes an input coin (a method that returns 1, or heads, with an unknown probability, or 0, or tails, otherwise) and returns 0 or 1 with a probability that depends on the input coin's probability of heads.  For example, a Bernoulli factory algorithm can take a coin that returns heads with probability &lambda; and produce a coin that returns heads with probability exp(&minus;&lambda;).

A _factory function_ is a function that relates the old probability to the new one.  Its domain is [0, 1] and returns a probability in [0, 1].  There are certain requirements for factory functions.  As shown by Keane and O'Brien (1994)<sup>[**(2)**](#Note2)</sup>, a function _f_ can serve as a factory function if and only if _f_, in the interval \[0, 1\]&mdash;

- is continuous everywhere, and
- either returns a constant value in \[0, 1\] everywhere, or returns a value in \[0, 1\] at each of the points 0 and 1 and a value in (0, 1) at each other point.

As one example, the function _f_ = 2*p cannot serve as a factory function, since its graph touches 1 somewhere in the open interval (0, 1).

The next section will show algorithms for a number of factory functions, allowing different kinds of probabilities to be simulated from input coins.

<a id=Algorithms></a>
## Algorithms

In the following algorithms:

- &lambda; is the unknown probability of heads of the input coin.
- The **SampleGeometricBag** and **URandLess** algorithms are described in my article on [**partially-sampled random numbers (PSRNs)**](https://peteroupc.github.io/exporand.html).
- The `ZeroOrOne` method should be implemented as shown in my article on [**random sampling methods**](https://peteroupc.github.io/randomfunc.html#Boolean_True_False_Conditions).
- The instruction to "generate a uniform random number" can be implemented by creating an empty [**uniform PSRN**](https://peteroupc.github.io/exporand.html) (most accurate) or by generating `RNDEXCRANGE(0, 1)` or `RNDINT(1000)` (less accurate).
- Where an algorithm says "if _a_ is less than _b_", where _a_ and _b_ are uniform random numbers, it means to run the **URandLess** algorithm on the two PSRNs, or do a less-than operation on _a_ and _b_, as appropriate.
- For best results, the algorithms should be implemented using exact rational arithmetic (such as `Fraction` in Python or `Rational` in Ruby).

> **Performance notes:**
>
> The algorithms as described here do not always lead to the best performance.  An implementation may change these algorithms as long as they produce the same results as the algorithms as described here.  Some algorithms are described as "uniformly fast".  This means that their average running time is bounded from above for all choices of &lambda; and other parameters (Devroye 1986, esp. p. 717)<sup>[**(3)**](#Note3)</sup>.
>
> An algorithm can be uniformly fast for all &lambda; parameters in a closed interval in (0, 1) only if its factory function meets the Lipschitz condition on that closed interval, that is, it is continuous and has no slope that tends to a vertical slope anywhere in that interval (Nacu and Peres 2005, proposition 23)<sup>[**(4)**](#Note4)</sup>.

<a id=Algorithms_for_Functions_of_lambda></a>
### Algorithms for Functions of &lambda;

&nbsp;

<a id=exp_minus_lambda></a>
#### exp(&minus;&lambda;)

The algorithm in (Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup> calls for generating a Poisson(&lambda;) random number and returning 1 if that number is 0, or 0 otherwise.  The Poisson generator in turn involves generating a geometric(&lambda;) random number _G_<sup>[**(5)**](#Note5)</sup>, then _G_ uniform random numbers, then returning _G_ only if all _G_ uniform numbers are sorted.<sup>[**(6)**](#Note6)</sup>  The algorithm follows.

1. Flip the input coin until the coin returns 0.  Then set _G_ to the number of times the coin returns 1 this way.
2. If _G_ is 0, return 1.
3. Generate a uniform random number _w_, and set _i_ to 1.
4. While _i_ is less than _G_:
    1. Generate a uniform random number _U_.
    2. If _w_ is less than _U_, break out of this loop and go to step 1.
    3. Add 1 to _i_, and set _w_ to _U_.
5. Return 0.  (_G_ is now a Poisson(&lambda;) random number, but is other than 0.)

This algorithm, however, runs very slowly as &lambda; approaches 1.

Here is an alternative version of the algorithm above, which doesn't generate a geometric random number at the outset.

1. Set _k_ and _w_ each to 0.
2. Flip the input coin.  If the coin returns 0 and _k_ is 0, return 1.  Otherwise, if the coin returns 0, return 0.
3. Generate a uniform random number _U_.
4. If _k_ > 0 and _w_ is less than _U_, go to step 1.
5. Set _w_ to _U_, add 1 to _k_, and go to step 2.

In turn, this algorithm likewise converges very slowly as &lambda; approaches 1.

A third algorithm is uniformly fast everywhere in (0, 1).   It uses the reverse-time martingale approach for alternating series in (Łatuszyński et al. 2009/2011)<sup>[**(7)**](#Note7)</sup> and makes use of the fact that exp(&minus;&lambda;) can be rewritten as 1 &minus; &lambda; + &lambda;<sup>2</sup>/2 &minus; &lambda;<sup>3</sup>/6 + &lambda;<sup>4</sup>/24 &minus; ..., which is an alternating series whose coefficients are 1, 1, 1/(2!), 1/(3!), 1/(4!), ..., which satisfy the requirements for this approach because the coefficients are nonincreasing and all 1 or less.  However, the algorithm requires a bit more arithmetic, notably rational division.

First, the general algorithm for the reverse-time martingale approach (called the **general martingale algorithm**) follows.  It takes a list of coefficients and an input coin, and returns 1 with probability _c[0]_ &minus; _c[1]_ * &lambda; + _c[2]_ * &lambda;<sup>2</sup> &minus; ..., and 0 otherwise.

1. Let _c[0]_, _c[1]_, etc. be the first, second, etc. coefficients of the alternating series.  Set _u_ to _c[0]_, set _w_ to 1, set _l_ to 0, and set _n_ to 1.
2. Create an empty uniform PSRN.
3. If _w_ is not 0, flip the input coin and multiply _w_ by the result of the flip.
4. If _n_ is even, set _u_ to _l_ + _w_ * _c[n]_.  Otherwise, set _l_ to _u_ + _w_ * _c[n]_.
5. Run the **URandLessThanFraction algorithm** on the PSRN and _l_.  If the algorithm returns 1, return 1.
6. Run the **URandLessThanFraction algorithm** on the PSRN and _u_.  If the algorithm returns 0, return 0.
7. Add 1 to _n_ and go to step 3.

For **exp(&minus;&lambda;)**, modify that algorithm as follows for more efficiency:

- Rather than multiplying by _c[n]_ in step 4, divide _w_ by _n_ in step 3 (after multiplying by the result of the flip).  This is a more efficient way to take account of the factorial in the second and later coefficients.

<a id=exp_lambda_1_minus_lambda></a>
#### exp(&lambda;)*(1&minus;&lambda;)

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>:

1. Set _k_ and _w_ each to 0.
2. Flip the input coin.  If it returns 0, return 1.
3. Generate a uniform random number _U_.
4. If _k_ > 0 and _w_ is less than _U_, return 0.
5. Set _w_ to _U_, add 1 to _k_, and go to step 2.

<a id=exp_minus_lambda_minus__c></a>
#### exp(&minus;&lambda; &minus; _c_)

To the best of my knowledge, I am not aware of any article or paper by others that presents this particular Bernoulli factory. In this algorithm, _c_ is an integer that is 0 or greater.

1. Run the **algorithm for exp(&minus;_c_/1)** described later in this document.  Return 0 if the algorithm returns 0.
2. Return the result of the **algorithm for exp(&minus;&lambda;)**.

<a id=1_1_lambda></a>
#### 1/(1+&lambda;)

One algorithm is the general martingale algorithm, since when &lambda; is in [0, 1], this function is an alternating series of the form `1 - x + x^2 - x^3 + ...`, whose coefficients are 1, 1, 1, 1, ....  However, this algorithm converges slowly when &lambda; is very close to 1.

A second algorithm is the so-called "even-parity" construction of (Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>.  However, this algorithm too converges slowly when &lambda; is very close to 1.

1. Flip the input coin.  If it returns 0, return 1.
2. Flip the input coin.  If it returns 0, return 0.  Otherwise, go to step 1.

A third algorithm is a special case of the two-coin Bernoulli factory of (Gonçalves et al., 2017)<sup>[**(8)**](#Note8)</sup> and is uniformly fast, unlike the previous two algorithms:

1. With probability 1/2, return 1. (For example, generate an unbiased random bit and return 1 if that bit is 1.)
2. Flip the input coin.  If it returns 1, return 0.  Otherwise, go to step 1.

<a id=log_1_lambda></a>
#### log(1+&lambda;)

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>:

1. Create an empty uniform PSRN.
2. Flip the input coin.  If it returns 0, flip the coin again and return the result.
3. Call the **SampleGeometricBag** algorithm with the PSRN.  If it returns 0, flip the input coin and return the result.
4. Flip the input coin.  If it returns 0, return 0.
5. Call the **SampleGeometricBag** algorithm with the PSRN.  If it returns 0, return 0.  Otherwise, go to step 2.

Observing that the even-parity construction used in the Flajolet paper is equivalent to the two-coin special case, which is uniformly fast for all &lambda; parameters, the algorithm above can be made uniformly fast as follows:

1. Create an empty uniform PSRN.
2. With probability 1/2, flip the input coin and return the result.
3. Call **SampleGeometricBag** on the PSRN, then flip the input coin.  If the call and the flip both return 1, return 0.  Otherwise, go to step 2.

<a id=1_minus_log_1_lambda></a>
#### 1 &minus; log(1+&lambda;)

Invert the result of the algorithm for log(1+&lambda;) (make it 1 if it's 0 and vice versa).<sup>[**(9)**](#Note9)</sup>

<a id=c__lambda_beta_beta__c__lambda__d__mu_minus_beta_minus_1__c___d></a>
#### _c_ * &lambda; * &beta; / (&beta; * (_c_ * &lambda; + _d_ * &mu;) &minus; (&beta; &minus; 1) * (_c_ + _d_))

This is the general two-coin algorithm of (Gonçalves et al., 2017)<sup>[**(8)**](#Note8)</sup> and (Vats et al. 2020)<sup>[**(10)**](#Note10)</sup>.  It takes two input coins that each output heads (1) with probability &lambda; or &mu;, respectively.  It also takes a parameter &beta; in the interval [0, 1], which is a so-called "portkey" or early rejection parameter (when &beta; = 1, the formula simplifies to _c_ * &lambda; / (_c_ * &lambda; + _d_ * &mu;)).

1. With probability &beta;, go to step 2.  Otherwise, return 0. (For example, call `ZeroOrOne` with &beta;'s numerator and denominator, and return 0 if that call returns 0, or go to step 2 otherwise.)
2. With probability _c_ / (_c_ + _d_), flip the &lambda; input coin.  Otherwise, flip the &mu; input coin.  If the &lambda; input coin returns 1, return 1.  If the &mu; input coin returns 1, return 0.  If the corresponding coin returns 0, go to step 1.

<a id=c__lambda__c__lambda__d__or__c___d__lambda_1__c___d__lambda></a>
#### _c_ * &lambda; / (_c_ * &lambda; + _d_) or (_c_/_d_) * &lambda; / (1 + (_c_/_d_) * &lambda;))

 This algorithm, also known as the **logistic Bernoulli factory** (Huber 2016)<sup>[**(11)**](#Note11)</sup>, (Morina et al., 2019)<sup>[**(12)**](#Note12)</sup>, is a special case of the two-coin algorithm above, but this time uses only one input coin.

1. With probability _d_ / (_c_ + _d_), return 0.
2. Flip the input coin.  If the coin returns 1, return 1.  Otherwise, go to step 1.

(Note that Huber \[2016\] specifies this Bernoulli factory in terms of a Poisson point process, which seems to require much more randomness on average.)

<a id=lambda_mu></a>
#### &lambda; + &mu;

(Nacu and Peres 2005, proposition 14(iii))<sup>[**(4)**](#Note4)</sup>.  This algorithm takes two input coins that simulate &lambda; or &mu;, respectively, and a parameter &epsilon;, which must be greater than 0 and chosen such that &lambda; + &mu; < 1 &minus; &epsilon;.

1. Create a &nu; input coin that does the following: "With probability 1/2, flip the &lambda; input coin and return the result.  Otherwise, flip the &mu; input coin and return the result."
2. Call the **2014 algorithm**, the **2016 algorithm**, or the **2019 algorithm**, described later, using the &nu; input coin, _x_/_y_ = 2/1, _i_ = 1 (for the 2019 algorithm), and &epsilon; = &epsilon;, and return the result.

<a id=lambda_minus_mu></a>
#### &lambda; &minus; &mu;

(Nacu and Peres 2005, proposition 14(iii-iv))<sup>[**(4)**](#Note4)</sup>.  This algorithm takes two input coins that simulate &lambda; or &mu;, respectively, and a parameter &epsilon;, which must be greater than 0 and chosen such that &lambda; &minus; &mu; > &epsilon; (and should be chosen such that &epsilon; is slightly less than &lambda; &minus; &mu;).

1. Create a &nu; input coin that does the following: "With probability 1/2, flip the &lambda; input coin and return **1 minus the result**.  Otherwise, flip the &mu; input coin and return the result."
2. Call the **2014 algorithm**, the **2016 algorithm**, or the **2019 algorithm**, described later, using the &nu; input coin, _x_/_y_ = 2/1, _i_ = 1 (for the 2019 algorithm), and &epsilon; = &epsilon;, and return 1 minus the result.

<a id=1__c__lambda></a>
#### 1/(_c_ + &lambda;)

Works only if _c_ > 0.

1. With probability _c_/(1 + _c_), return a number that is 1 with probability 1/_c_ and 0 otherwise.
2. Flip the input coin.  If the coin returns 1, return 0.  Otherwise, go to step 1.

<a id=1_minus_lambda></a>
#### 1 &minus; &lambda;

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>: Flip the &lambda; input coin and return 0 if the result is 1, or 1 otherwise.

<a id=nu_lambda_1_minus_nu_mu></a>
#### &nu; * &lambda; + (1 &minus; &nu;) * &mu;

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>: Flip the &nu; input coin.  If the result is 0, flip the &lambda; input coin and return the result.  Otherwise, flip the &mu; input coin and return the result.

<a id=lambda_mu_minus_lambda_mu></a>
#### &lambda; + &mu; &minus; (&lambda; * &mu;)

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>: Flip the &lambda; input coin and the &mu; input coin.  Return 1 if either flip returns 1, and 0 otherwise.

<a id=lambda_mu_2></a>
#### (&lambda; + &mu;) / 2

(Nacu and Peres 2005, proposition 14(iii))<sup>[**(4)**](#Note4)</sup>; (Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>: With probability 1/2, flip the &lambda; input coin and return the result.  Otherwise, flip the &mu; input coin and return the result.

<a id=arctan_lambda_lambda></a>
#### arctan(&lambda;) /&lambda;

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>:

1. Generate an empty uniform PSRN.
2. Call **SampleGeometricBag** twice on the PSRN, and flip the input coin twice.  If any of these calls or flips returns 0, return 1.
3. Call **SampleGeometricBag** twice on the PSRN, and flip the input coin twice.  If any of these calls or flips returns 0, return 0.  Otherwise, go to step 2.

Observing that the even-parity construction used in the Flajolet paper is equivalent to the two-coin special case, which is uniformly fast for all &lambda; parameters, the algorithm above can be made uniformly fast as follows:

1. Create an empty uniform PSRN.
2. With probability 1/2, return 1.
3. Call **SampleGeometricBag** twice on the PSRN, and flip the input coin twice.  If all of these calls and flips return 1, return 0.  Otherwise, go to step 2.

<a id=arctan_lambda></a>
#### arctan(&lambda;)

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>: Call the **algorithm for arctan(&lambda;) /&lambda;** and flip the input coin.  Return 1 if the call and flip both return 1, or 0 otherwise.

<a id=lambda__x___y></a>
#### &lambda;<sup>_x_/_y_</sup>

In the algorithm below, the case where _x_/_y_ is in (0, 1) is due to recent work by Mendo (2019)<sup>[**(13)**](#Note13)</sup>.  The algorithm works only when _x_/_y_ is 0 or greater.

1. If _x_/_y_ is 0, return 1.
2. If _x_/_y_ is equal to 1, flip the input coin and return the result.
3. If _x_/_y_ is greater than 1:
    1. Set _ipart_ to floor(_x_/_y_) and _fpart_ to `rem(x, y)`.
    2. If _fpart_ is greater than 0, subtract 1 from _ipart_, then call this algorithm recursively with _x_ = floor(_fpart_/2) and _y_ = _y_, then call this algorithm, again recursively, with _x_ = _fpart_ &minus; floor(_fpart_/2) and _y_ = _y_. Return 0 if either call returns 0.  (This is done rather than the more obvious approach in order to avoid calling this algorithm with fractional parts very close to 0, because the algorithm runs much more slowly than for fractional parts closer to 1.)
    3. If _ipart_ is 1 or greater, flip the input coin _ipart_ many times.  Return 0 if any of these flips returns 1.
    4. Return 1.
4. _x_/_y_ is less than 1, so set _i_ to 1.
5. Flip the input coin; if it returns 1, return 1.
6. Return 0 with probability _x_/(_y_*_i_).
7. Add 1 to _i_ and go to step 5.

> **Note:** When _x_/_y_ is less than 1, the minimum number of coin flips needed, on average, by this algorithm will grow without bound as &lambda; approaches 0.  In fact, no fast Bernoulli factory algorithm can avoid this unbounded growth without additional information on &lambda; (Mendo 2019)<sup>[**(13)**](#Note13)</sup>.  See also the appendix, which also shows an alternative way to implement this and other Bernoulli factory algorithms using PSRNs, which exploits knowledge of &lambda; but is not the focus of this article since it involves arithmetic.

<a id=lambda_mu_3></a>
#### &lambda;<sup>&mu;</sup>

This algorithm is based on the previous one, but changed to accept a second input coin (which outputs heads with probability &mu;) rather than a fixed value for the exponent. To the best of my knowledge, I am not aware of any other article or paper that presents this particular Bernoulli factory.

1. Set _i_ to 1.
2. Flip the input coin that simulates the base, &lambda;; if it returns 1, return 1.
3. Flip the input coin that simulates the exponent, &mu;; if it returns 1, return 0 with probability 1/_i_.
4. Add 1 to _i_ and go to step 1.

<a id=sqrt_lambda></a>
#### sqrt(&lambda;)

Use the algorithm for &lambda;<sup>1/2</sup>.

<a id=arcsin_lambda_sqrt_1_minus_lambda_2_minus_1></a>
#### arcsin(&lambda;) + sqrt(1 &minus; &lambda;<sup>2</sup>) &minus; 1

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>.  The algorithm given here uses the special two-coin case rather than the even-parity construction.

1. Create an empty uniform PSRN.
2. Create a secondary coin &mu; that does the following: "Call **SampleGeometricBag** twice on the PSRN, and flip the input coin twice.  If all of these calls and flips return 1, return 0.  Otherwise, return 1."
3. Call the **algorithm for &mu;<sup>1/2</sup>** using the secondary coin &mu;.  If it returns 0, return 0.
4. With probability 1/2, flip the input coin and return the result.
5. Call **SampleGeometricBag** once on the PSRN, and flip the input coin once.  If both the call and flip return 1, return 0.  Otherwise, go to step 4.

<a id=arcsin_lambda_2></a>
#### arcsin(&lambda;) / 2

The Flajolet paper doesn't explain in detail how arcsin(&lambda;)/2 arises out of arcsin(&lambda;) + sqrt(1 &minus; &lambda;<sup>2</sup>) &minus; 1 via Bernoulli factory constructions, but here is an algorithm.<sup>[**(14)**](#Note14)</sup> Note, however, that the number of input coin flips is expected to grow without bound as &lambda; approaches 1.

1. With probability 1/2, run the **algorithm for arcsin(&lambda;) + sqrt(1 &minus; &lambda;<sup>2</sup>) &minus; 1** and return the result.
2. Create a secondary coin &mu; that does the following: "Flip the input coin twice.  If both flips return 1, return 0.  Otherwise, return 1."
3. Call the **algorithm for &mu;<sup>1/2</sup>** using the secondary coin &mu;.  If it returns 0, return 1; otherwise, return 0.

<a id=lambda_mu_4></a>
#### &lambda; * &mu;

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>: Flip the &lambda; input coin and the &mu; input coin.  Return 1 if both flips return 1, and 0 otherwise.

<a id=lambda__x___y__linear_Bernoulli_factories></a>
#### &lambda; * _x_/_y_ (linear Bernoulli factories)

Huber has suggested several algorithms for this function over the years.

The first algorithm is called the **2014 algorithm** in this document (Huber 2014)<sup>[**(15)**](#Note15)</sup>.  It uses three parameters: _x_, _y_, and &epsilon;, such that _x_/_y_ > 0 and &epsilon; is greater than 0.  When _x_/_y_ is greater than 1, the &epsilon; parameter has to be chosen such that &lambda; * _x_/_y_ < 1 &minus; &epsilon;, which implies that some knowledge of &lambda; has to be available to the algorithm.  (In fact, as simulation results show, the choice of &epsilon; is crucial to this algorithm's performance; for best results, &epsilon; should be chosen such that &lambda; * _x_/_y_ is slightly less than 1 &minus; &epsilon;.) The algorithm as described below also includes certain special cases, not mentioned in Huber, to make it more general.

1. Special cases: If _x_ is 0, return 0.  Otherwise, if _x_ equals _y_, flip the input coin and return the result.  Otherwise, if _x_ is less than _y_, then: (a) With probability _x_/_y_, flip the input coin and return the result; otherwise (b) return 0.
2. Set _c_ to _x_/_y_, and set _k_ to 23 / (5 * &epsilon;).
3. If &epsilon; is greater than 644/1000, set &epsilon; to 644/1000.
4. Set _i_ to 1.
5. Flip the input coin.  If it returns 0, then generate numbers that are each 1 with probability (_c_ &minus; 1) / _c_ and 0 otherwise, until 0 is generated this way, then add 1 to _i_ for each number generated this way (including the last).
6. Subtract 1 from _i_, then if _i_ is 0, return 1.
7. If _i_ is less than _k_, go to step 5.
8. If _i_ is _k_ or greater:
    1. Generate _i_ numbers that are each 1 with probability 2 / (&epsilon; + 2) or 0 otherwise.  If any of those numbers is 0, return 0.
    2. Multiply _c_ by 2 / (&epsilon; + 2), divide &epsilon; by 2, and multiply _k_ by 2.
9. If _i_ is 0, return 1.  Otherwise, go to step 5.

The second algorithm is called the **2016 algorithm** (Huber 2016)<sup>[**(16)**](#Note16)</sup> and uses the same parameters _x_, _y_, and &epsilon;, and its description uses the same special cases.  The difference here is that it involves a so-called "logistic Bernoulli factory", which is replaced in this document with a different one that simulates the same function.  When _x_/_y_ is greater than 1, the &epsilon; parameter has to be chosen such that &lambda; * _x_/_y_ <= 1 &minus; &epsilon;.

1. The same special cases as for the 2014 algorithm apply.
2. Set _m_ to ceil(1 + 9 / (2 * &epsilon;)).
3. Set &beta; to 1 + 1 / (_m_ &minus; 1).
4. **Algorithm A** is what Huber calls this step.  Set _s_ to 1, then while _s_ is greater than 0 and less than _m_:
    1. Run the **logistic Bernoulli factory** algorithm with _c_/_d_ = &beta; * _x_/_y_.
    2. Set _s_ to _s_ &minus; _z_ * 2 + 1, where _z_ is the result of the logistic Bernoulli factory.
5. If _s_ is other than 0, return 0.
6. With probability 1/&beta;, return 1.
7. Run this algorithm recursively, with _x_/_y_ = &beta; * _x_/_y_ and &epsilon; = 1 &minus; &beta; * (1 &minus; &epsilon;).  If it returns 0, return 0.
8. The **high-power logistic Bernoulli factory** is what Huber calls this step.  Set _s_ to 1, then while _s_ is greater than 0 and less than or equal to _m_ minus 2:
    1. Run the **logistic Bernoulli factory** algorithm with _c_/_d_ = &beta; * _x_/_y_.
    2. Set _s_ to _s_ + _z_ * 2 &minus; 1, where _z_ is the result of the logistic Bernoulli factory.
9. If _s_ is equal to _m_ minus 1, return 1.
10. Subtract 1 from _m_ and go to step 7.

The paper that presented the 2016 algorithm also included a third algorithm, described below, that works only if &lambda; * _x_ / _y_ is known to be less than 1/2.  This third algorithm takes three parameters: _x_, _y_, and _m_, and _m_ has to be chosen such that &lambda; * _x_ / _y_ <= _m_ < 1/2.

1. The same special cases as for the 2014 algorithm apply.
2. Run the **logistic Bernoulli factory** algorithm with _c_/_d_ = (_x_/_y_) / (1 &minus; 2 * _m_).  If it returns 0, return 0.
3. With probability 1 &minus; 2 * _m_, return 1.
4. Run the 2014 algorithm or 2016 algorithm with _x_/_y_ = (_x_/_y_) / (2 * _m_) and &epsilon; = 1 &minus; _m_.

<a id=lambda__x___y___i></a>
#### (&lambda; * _x_/_y_)<sup>_i_</sup>

(Huber 2019)<sup>[**(17)**](#Note17)</sup>.  This algorithm, called the **2019 algorithm** in this document, uses four parameters: _x_, _y_, _i_, and &epsilon;, such that _x_/_y_ > 0, _i_ >= 0 is an integer, and &epsilon; is greater than 0.  When _x_/_y_ is greater than 1, the &epsilon; parameter has to be chosen such that &lambda; * _x_/_y_ < 1 &minus; &epsilon;.  It also has special cases not mentioned in Huber 2019.

1.  Special cases: If _i_ is 0, return 1.  If _x_ is 0, return 0.  Otherwise, if _x_ equals _y_ and _i_ equals 1, flip the input coin and return the result.
2. Special case: If _x_ is less than _y_ and _i_ = 1, then: (a) With probability _x_/_y_, flip the input coin and return the result; otherwise (b) return 0.
3. Special case: If _x_ is less than _y_, then create a secondary coin &mu; that does the following: "(a) With probability _x_/_y_, flip the input coin and return the result; otherwise (b) return 0", then run the **algorithm for (&mu;<sup>_i_/1</sup>)** (described earlier) using this secondary coin.
4. Set _t_ to 355/100 and _c_ to _x_/_y_.
5. If _i_ is 0, return 1.
6. While _i_ = _t_ / &epsilon;:
    1. Set &beta; to (1 &minus; &epsilon; / 2) / (1 &minus; &epsilon;).
    2. Run the **algorithm for (1/&beta;)<sup>_i_</sup>** (described later).  If it returns 0, return 0.
    3. Multiply _c_ by &beta;, then divide &epsilon; by 2.
7. Run the **logistic Bernoulli factory** with _c_/_d_ = _c_, then set _z_ to the result.  Set _i_ to _i_ + 1 &minus; _z_ * 2, then go to step 5.

<a id=epsilon_lambda></a>
#### &epsilon; / &lambda;

(Lee et al. 2014)<sup>[**(22)**](#Note22)</sup>  This algorithm, in addition to the input coin, takes a parameter &epsilon;, which must be greater than 0 and be chosen such that &epsilon; is less than &lambda;.

1. If &beta; to max(&epsilon;, 1/2) and set &gamma; to 1 &minus; (1 &minus; &beta;) / (1 &minus; (&beta; / 2)).
2. Create a &mu; input coin that flips the input coin and returns 1 minus the result.
3. With probability &epsilon;, return 1.
4. Run the **2014 algorithm**, **2016 algorithm**, or **2019 algorithm**, with the &mu; input coin, _x_/_y_ = &minus;_y_/(_x_&minus;_y_), _i_ = 1 (for the 2019 algorithm), and &epsilon; = &gamma;. If the result is 0, return 0.  Otherwise, go to step 3.  (Note that running the algorithm this way simulates the probability (&lambda; &minus; &epsilon;)/(1 &minus; &epsilon;) or 1 &minus; (1 &minus; &lambda;)/(1 &minus; &epsilon;)

<a id=Algorithms_for_Irrational_Constants></a>
### Algorithms for Irrational Constants

The following algorithms generate heads with a probability equal to an irrational number.  (On the other hand, probabilities that are _rational_ constants are trivial to simulate.  If fair coins are available, the `ZeroOrOne` method should be used.  If coins with unknown bias are available, then a _randomness extraction_ method such as the von Neumann algorithm should be used to turn them into fair coins.  Randomness extraction is outside the scope of this document, however.)

<a id=Continued_Fractions></a>
#### Continued Fractions

The following algorithm simulates a probability expressed as a regular continued fraction of the following form: 0 + 1 / (_a_\[1\] + 1 / (_a_\[2\] + 1 / (_a_\[3\] + ... ))).  The _a_\[_i_\] are the _partial denominators_ and must be integers greater than 0.  Inspired by (Flajolet et al., 2010, "Finite graphs (Markov chains) and rational functions")<sup>[**(1)**](#Note1)</sup>, I developed the following algorithm.

The algorithm begins with _pos_ equal to 1.  Then the following steps are taken.

1. Set _k_ to _a_\[_pos_\].
2. If _k_ is the last partial denominator, return a number that is 1 with probability 1/_k_ and 0 otherwise.
3. With probability _k_/(1+_k_), return a number that is 1 with probability 1/_k_ and 0 otherwise.
4. Run this algorithm recursively, but with _pos_ = _pos_ + 1.  If the result is 1, return 0.  Otherwise, go to step 3.

<a id=arctan__x___y___y___x></a>
#### arctan(_x_/_y_) \* _y_/_x_

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>:

1. Create an empty uniform PSRN.
2. Generate a number that is 1 with probability _x_ * _x_/(_y_ * _y_), or 0 otherwise.  If the number is 0, return 1.
3. Call **SampleGeometricBag** twice on the PSRN.  If either of these calls returns 0, return 1.
4. Generate a number that is 1 with probability _x_ * _x_/(_y_ * _y_), or 0 otherwise.  If the number is 0, return 0.
5. Call **SampleGeometricBag** twice on the PSRN.  If either of these calls returns 0, return 0.  Otherwise, go to step 2.

Observing that the even-parity construction used in the Flajolet paper is equivalent to the two-coin special case, which is uniformly fast, the algorithm above can be made uniformly fast as follows:

1. Create an empty uniform PSRN.
2. With probability 1/2, return 1.
3. With probability _x_ * _x_/(_y_ * _y_), call **SampleGeometricBag** twice on the PSRN.  If both of these calls return 1, return 0.
4. Go to step 2.

<a id=pi_12></a>
#### &pi; / 12

Two algorithms:

- First algorithm: Use the algorithm for **arcsin(1/2) / 2**.  Where the algorithm says to "flip the input coin", instead generate an unbiased random bit.
- Second algorithm: With probability 2/3, return 0.  Otherwise, run the algorithm for **&pi; / 4** and return the result.

<a id=pi_4></a>
#### &pi; / 4

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>:

1. Generate a random integer in the interval [0, 6), call it _n_.
2. If _n_ is less than 3, return the result of the **algorithm for arctan(1/2) \* 2**.  Otherwise, if _n_ is 3, return 0.  Otherwise, return the result of the **algorithm for arctan(1/3) \* 3**.

<a id=1_pi></a>
#### 1 / &pi;

(Flajolet et al., 2010)<sup>[**(1)**](#Note1)</sup>:

1. Generate two geometric(1/4) random numbers, and call _t_ their sum.  (As used here, a geometric(1/4) random number is the number of successes before the first failure, with success probability 1/4.)
2. With probability 5/9, add 1 to _t_.
3. Generate 2*_t_ unbiased random bits, and return 0 if there are more zeros than ones generated this way or vice versa.  (Note that this condition can be checked even before all the bits are generated this way.)  Repeat this step two more times.
4. Return 1.

<a id=a___b___x___y></a>
#### (_a_/_b_)<sup>_x_/_y_</sup>

In the algorithm below, _a_, _b_, _x_, and _y_ are integers, and the case where _x_/_y_ is in (0, 1) is due to recent work by Mendo (2019)<sup>[**(13)**](#Note13)</sup>.  This algorithm works only if&mdash;

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

This algorithm takes integers _x_ >= 0 and _y_ > 0 and outputs 1 with probability `exp(-x/y)` or 0 otherwise. It originates from (Canonne et al. 2020)<sup>[**(18)**](#Note18)</sup>.

1. Special case: If _x_ is 0, return 1. (This is because the probability becomes `exp(0) = 1`.)
2. If `x > y` (so _x_/_y_ is greater than 1), call this algorithm (recursively) `floor(x/y)` times with _x_ = _y_ = 1 and once with _x_ = _x_ &minus; floor(_x_/_y_) \* _y_ and _y_ = _y_.  Return 1 if all these calls return 1; otherwise, return 0.
3. Set _r_ to 1 and _i_ to 1.
4. Return _r_ with probability (_y_ \* _i_ &minus; _x_) / (_y_ \* _i_).
5. Set _r_ to 1 &minus; _r_, add 1 to _i_, and go to step 4.

<a id=exp_minus__z></a>
#### exp(&minus;_z_)

This algorithm is similar to the previous algorithm, except that the exponent, _z_, can be any real number 0 or greater, as long as _z_ can be rewritten as the sum of one or more components whose fractional parts can each be simulated by a Bernoulli factory algorithm that outputs heads with probability equal to that fractional part. (This makes use of the identity exp(&minus;a) = exp(&minus;b) * exp(&minus;c).)

More specifically:

1. Decompose _z_ into _n_ > 0 positive components that sum to _z_.  For example, if _z_ = 3.5, it can be decomposed into only one component, 3.5 (whose fractional part is trivial to simulate), and if _z_ = &pi;, it can be decomposed into four components that are all (&pi; / 4), which has a not-so-trivial simulation described earlier on this page.
2. For each component _LC_\[_i_\] found this way, let _LI_\[_i_\] be floor(_LC_\[_i_\]) and let _LF_\[_i_\] be _LC_\[_i_\] &minus; floor(_LC_\[_i_\]) (_LC_\[_i_\]'s fractional part).

The algorithm is then as follows:

- For each component _LC_\[_i_\], call the **algorithm for exp(&minus; _LI_\[_i_\]/1)**, and call the **general martingale algorithm** adapted for **exp(&minus;&lambda;)** using the input coin that simulates  _LF_\[_i_\].  If any of these calls returns 0, return 0; otherwise, return 1. (See also (Canonne et al. 2020)<sup>[**(18)**](#Note18)</sup>.)

<a id=a___b___z></a>
#### (_a_/_b_)<sup>_z_</sup>

This algorithm is similar to the previous algorithm for powering, except that the exponent, _z_,  can be any real number 0 or greater, as long as _z_ can be rewritten as the sum of one or more components whose fractional parts can each be simulated by a Bernoulli factory algorithm that outputs heads with probability equal to that fractional part. This algorithm makes use of a similar identity as for `exp` and works only if _z_ is 0 or greater and _a_/_b_ is in the interval [0, 1].

Decompose _z_ into _LC_\[_i_\], _LI_\[_i_\], and _LF_\[_i_\] just as for the **exp(&minus; _z_)** algorithm.  The algorithm is then as follows.

- If _z_ is 0, return 1.  Otherwise, if _a_ is 0, return 0.  Otherwise, for each component _LC_\[_i_\] (until the algorithm returns a number):
    1. Call the **algorithm for  (_a_/_b_)<sup>_LI_\[_i_\]/1</sup>**.  If it returns 0, return 0.
    2. Set _j_ to 1.
    3. Generate a random number that is 1 with probability _a_/_b_ and 0 otherwise.  If that number is 1, move on to the next component or, if there are no more components, return 1.
    4. Flip the input coin that simulates  _LF_\[_i_\] (which is the exponent); if it returns 1, return 0 with probability 1/_j_.
    5. Add 1 to _j_ and go to substep 2.

<a id=General_Algorithms></a>
### General Algorithms

<a id=Simulating_the_Probability_Generating_Function></a>
#### Simulating the Probability Generating Function

Let _X_ be a random number that follows a discrete distribution (one that takes on a countable number of values).  The following algorithm generates heads with probability **E**\[&lambda;<sup>_X_</sup>\], that is, the expected (average) value of &lambda;<sup>_X_</sup>.  **E**\[&lambda;<sup>_X_</sup>\] is the distribution's _probability generating function_, also known as _factorial moment generating function_ (Dughmi et al. 2017)<sup>[**(19)**](#Note19)</sup>.

1. Generate a random number _N_ of the given distribution.
2. Flip the input coin until the coin returns 0 or the coin is flipped _N_ times.  Return 1 if all the coin flips, including the last, returned 1 (or if _N_ is 0); or return 0 otherwise.

<a id=URandLessThanFraction></a>
#### URandLessThanFraction

The following helper algorithm is used by some of the algorithms on this page.  It returns 1 if a PSRN turns out to be less than a fraction, _frac_, which is a number in the interval \[0, 1\].

1. If _frac_ is 0 or 1, return 0 or 1, respectively. (The case of 1 is a degenerate case since the PSRN could, at least in theory, represent an infinite sequence of ones, making it equal to 1.)
2. Set _pt_ to 1/_base_, and set _i_ to 0. (_base_ is the base, or radix, of the PSRN's digits, such as 2 for binary or 10 for decimal.)
3. Set _d1_ to the digit at the _i_<sup>th</sup> position (starting from 0) of the uniform PSRN.  If there is no digit there, put a digit chosen uniformly at random at that position and set _d1_ to that digit.
4. Set _d2_ to floor(_frac_ / _pt_).  (For example, in base 2, set _d2_ to 0 if _frac_ is less than _pt_, or 1 otherwise.)
5. If _d1_ is less than _d2_, return 1.  If _d1_ is greater than _d2_, return 0.
6. If _frac_ >= _pt_, subtract _pt_ from _frac_.
7. Divide _pt_ by _base_, add 1 to _i_, and go to step 3.

<a id=Correctness_and_Performance_Charts></a>
## Correctness and Performance Charts

The following charts show the correctness of many of the algorithms on this page and show their performance in terms of the number of bits they use on average.  For each algorithm, and for each of 100 &lambda; values evenly spaced from 0.0001 to 0.9999:

- 500 runs of the algorithm were done.  Then...
- The number of bits used by the runs were averaged, as were the return values of the runs (since the return value is either 0 or 1, the mean return value will be in the interval [0, 1]).  The number of bits used included the number of bits used to produce each coin flip, assuming the coin flip procedure for &lambda; was generated using the `Bernoulli#coin()` method in _bernoulli.py_, which produces that probability in an optimal or near-optimal way.

For each algorithm, if a single run was detected to use more than 5000 bits for a given &lambda;, the entire data point for that &lambda; was suppressed in the charts below.

In addition, for each algorithm, a chart appears showing the minimum number of input coin flips that any fast Bernoulli factory algorithm will need on average to simulate the given function, based on work by Mendo (2019)<sup>[**(13)**](#Note13)</sup>.  Note that some functions require a growing number of coin flips as &lambda; approaches 0 or 1.  Note that for the 2014, 2016, and 2019 algorithms, an &epsilon; of 1 &minus; _x_ * _c_ * 1.001 was used (or 0.0001 if &epsilon; would be greater than 1).  Points with invalid &epsilon; values were suppressed.  For the low-mean algorithm, an _m_ of max(0.49999, _x_*_c_*1.02) was used unless noted otherwise.

<a id=The_Charts></a>
### The Charts

| Algorithm | Simulated Mean | Average Bits Consumed | Coin Flips |
 --- | --- | --- | --- |
| (1/3)\*x/(1+(1/3)\*x) | ![**Simulated Mean for (1/3)\*x/(1+(1/3)\*x)**](bernoullicharts/1_3_x_1_1_3_x__mean.svg) | ![**Expected Bits Consumed by (1/3)\*x/(1+(1/3)\*x)**](bernoullicharts/1_3_x_1_1_3_x__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/1_3_x_1_1_3_x__bound.svg) |
| 0.5\*x/(1+0.5\*x) | ![**Simulated Mean for 0.5\*x/(1+0.5\*x)**](bernoullicharts/0_5_x_1_0_5_x__mean.svg) | ![**Expected Bits Consumed by 0.5\*x/(1+0.5\*x)**](bernoullicharts/0_5_x_1_0_5_x__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/0_5_x_1_0_5_x__bound.svg) |
| 1 - log(1+x) (Alt. Series) | ![**Simulated Mean for 1 - log(1+x) (Alt. Series)**](bernoullicharts/1_-_log_1_x_alt_series__mean.svg) | ![**Expected Bits Consumed by 1 - log(1+x) (Alt. Series)**](bernoullicharts/1_-_log_1_x_alt_series__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/1_-_log_1_x_alt_series__bound.svg) |
| 1/(1+x) (Alt. Series) | ![**Simulated Mean for 1/(1+x) (Alt. Series)**](bernoullicharts/1_1_x_alt_series__mean.svg) | ![**Expected Bits Consumed by 1/(1+x) (Alt. Series)**](bernoullicharts/1_1_x_alt_series__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/1_1_x_alt_series__bound.svg) |
| 1/(1+x) (Even Parity) | ![**Simulated Mean for 1/(1+x) (Even Parity)**](bernoullicharts/1_1_x_even_parity__mean.svg) | ![**Expected Bits Consumed by 1/(1+x) (Even Parity)**](bernoullicharts/1_1_x_even_parity__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/1_1_x_even_parity__bound.svg) |
| 1/(1+x) (Two-Coin Special Case) | ![**Simulated Mean for 1/(1+x) (Two-Coin Special Case)**](bernoullicharts/1_1_x_two-coin_special_case__mean.svg) | ![**Expected Bits Consumed by 1/(1+x) (Two-Coin Special Case)**](bernoullicharts/1_1_x_two-coin_special_case__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/1_1_x_two-coin_special_case__bound.svg) |
| 1/(3+x) | ![**Simulated Mean for 1/(3+x)**](bernoullicharts/1_3_x__mean.svg) | ![**Expected Bits Consumed by 1/(3+x)**](bernoullicharts/1_3_x__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/1_3_x__bound.svg) |
| 1/(5+x) | ![**Simulated Mean for 1/(5+x)**](bernoullicharts/1_5_x__mean.svg) | ![**Expected Bits Consumed by 1/(5+x)**](bernoullicharts/1_5_x__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/1_5_x__bound.svg) |
| 2014 Add. x+0.1 | ![**Simulated Mean for 2014 Add. x+0.1**](bernoullicharts/2014_add_x_0_1_mean.svg) | ![**Expected Bits Consumed by 2014 Add. x+0.1**](bernoullicharts/2014_add_x_0_1_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/2014_add_x_0_1_bound.svg) |
| 2014 Add. x+0.2 | ![**Simulated Mean for 2014 Add. x+0.2**](bernoullicharts/2014_add_x_0_2_mean.svg) | ![**Expected Bits Consumed by 2014 Add. x+0.2**](bernoullicharts/2014_add_x_0_2_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/2014_add_x_0_2_bound.svg) |
| 2014 Add. x+0.3 | ![**Simulated Mean for 2014 Add. x+0.3**](bernoullicharts/2014_add_x_0_3_mean.svg) | ![**Expected Bits Consumed by 2014 Add. x+0.3**](bernoullicharts/2014_add_x_0_3_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/2014_add_x_0_3_bound.svg) |
| 2014 Add. x+0.5 | ![**Simulated Mean for 2014 Add. x+0.5**](bernoullicharts/2014_add_x_0_5_mean.svg) | ![**Expected Bits Consumed by 2014 Add. x+0.5**](bernoullicharts/2014_add_x_0_5_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/2014_add_x_0_5_bound.svg) |
| 2014 Lin. x\*1.3 | ![**Simulated Mean for 2014 Lin. x\*1.3**](bernoullicharts/2014_lin_x_1_3_mean.svg) | ![**Expected Bits Consumed by 2014 Lin. x\*1.3**](bernoullicharts/2014_lin_x_1_3_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/2014_lin_x_1_3_bound.svg) |
| 2014 Lin. x\*1.5 | ![**Simulated Mean for 2014 Lin. x\*1.5**](bernoullicharts/2014_lin_x_1_5_mean.svg) | ![**Expected Bits Consumed by 2014 Lin. x\*1.5**](bernoullicharts/2014_lin_x_1_5_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/2014_lin_x_1_5_bound.svg) |
| 2014 Lin. x\*2.0 | ![**Simulated Mean for 2014 Lin. x\*2.0**](bernoullicharts/2014_lin_x_2_0_mean.svg) | ![**Expected Bits Consumed by 2014 Lin. x\*2.0**](bernoullicharts/2014_lin_x_2_0_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/2014_lin_x_2_0_bound.svg) |
| 2014 Lin. x\*4.0 | ![**Simulated Mean for 2014 Lin. x\*4.0**](bernoullicharts/2014_lin_x_4_0_mean.svg) | ![**Expected Bits Consumed by 2014 Lin. x\*4.0**](bernoullicharts/2014_lin_x_4_0_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/2014_lin_x_4_0_bound.svg) |
| 2014 Lin. x\*6.0 | ![**Simulated Mean for 2014 Lin. x\*6.0**](bernoullicharts/2014_lin_x_6_0_mean.svg) | ![**Expected Bits Consumed by 2014 Lin. x\*6.0**](bernoullicharts/2014_lin_x_6_0_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/2014_lin_x_6_0_bound.svg) |
| 2014 Lin. x\*8.0 | ![**Simulated Mean for 2014 Lin. x\*8.0**](bernoullicharts/2014_lin_x_8_0_mean.svg) | ![**Expected Bits Consumed by 2014 Lin. x\*8.0**](bernoullicharts/2014_lin_x_8_0_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/2014_lin_x_8_0_bound.svg) |
| 2014 Sub. x-0.1 | ![**Simulated Mean for 2014 Sub. x-0.1**](bernoullicharts/2014_sub_x-0_1_mean.svg) | ![**Expected Bits Consumed by 2014 Sub. x-0.1**](bernoullicharts/2014_sub_x-0_1_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/2014_sub_x-0_1_bound.svg) |
| 2014 Sub. x-0.2 | ![**Simulated Mean for 2014 Sub. x-0.2**](bernoullicharts/2014_sub_x-0_2_mean.svg) | ![**Expected Bits Consumed by 2014 Sub. x-0.2**](bernoullicharts/2014_sub_x-0_2_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/2014_sub_x-0_2_bound.svg) |
| 2014 Sub. x-0.3 | ![**Simulated Mean for 2014 Sub. x-0.3**](bernoullicharts/2014_sub_x-0_3_mean.svg) | ![**Expected Bits Consumed by 2014 Sub. x-0.3**](bernoullicharts/2014_sub_x-0_3_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/2014_sub_x-0_3_bound.svg) |
| 2014 Sub. x-0.5 | ![**Simulated Mean for 2014 Sub. x-0.5**](bernoullicharts/2014_sub_x-0_5_mean.svg) | ![**Expected Bits Consumed by 2014 Sub. x-0.5**](bernoullicharts/2014_sub_x-0_5_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/2014_sub_x-0_5_bound.svg) |
| arcsin(x)+sqrt(1-x\*x)-1 | ![**Simulated Mean for arcsin(x)+sqrt(1-x\*x)-1**](bernoullicharts/arcsin_x_sqrt_1-x_x_-1_mean.svg) | ![**Expected Bits Consumed by arcsin(x)+sqrt(1-x\*x)-1**](bernoullicharts/arcsin_x_sqrt_1-x_x_-1_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/arcsin_x_sqrt_1-x_x_-1_bound.svg) |
| arcsin(x)/2 | ![**Simulated Mean for arcsin(x)/2**](bernoullicharts/arcsin_x_2_mean.svg) | ![**Expected Bits Consumed by arcsin(x)/2**](bernoullicharts/arcsin_x_2_bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/arcsin_x_2_bound.svg) |
| arctan(x) (Flajolet) | ![**Simulated Mean for arctan(x) (Flajolet)**](bernoullicharts/arctan_x_flajolet__mean.svg) | ![**Expected Bits Consumed by arctan(x) (Flajolet)**](bernoullicharts/arctan_x_flajolet__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/arctan_x_flajolet__bound.svg) |
| arctan(x) (Two-Coin Special Case) | ![**Simulated Mean for arctan(x) (Two-Coin Special Case)**](bernoullicharts/arctan_x_two-coin_special_case__mean.svg) | ![**Expected Bits Consumed by arctan(x) (Two-Coin Special Case)**](bernoullicharts/arctan_x_two-coin_special_case__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/arctan_x_two-coin_special_case__bound.svg) |
| exp(-x) (Alg. 2) | ![**Simulated Mean for exp(-x) (Alg. 2)**](bernoullicharts/exp_-x_alg_2__mean.svg) | ![**Expected Bits Consumed by exp(-x) (Alg. 2)**](bernoullicharts/exp_-x_alg_2__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/exp_-x_alg_2__bound.svg) |
| exp(-x) (Alt. Series) | ![**Simulated Mean for exp(-x) (Alt. Series)**](bernoullicharts/exp_-x_alt_series__mean.svg) | ![**Expected Bits Consumed by exp(-x) (Alt. Series)**](bernoullicharts/exp_-x_alt_series__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/exp_-x_alt_series__bound.svg) |
| exp(-x) (Flajolet) | ![**Simulated Mean for exp(-x) (Flajolet)**](bernoullicharts/exp_-x_flajolet__mean.svg) | ![**Expected Bits Consumed by exp(-x) (Flajolet)**](bernoullicharts/exp_-x_flajolet__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/exp_-x_flajolet__bound.svg) |
| exp(x)\*(1-x) | ![**Simulated Mean for exp(x)\*(1-x)**](bernoullicharts/exp_x_1-x__mean.svg) | ![**Expected Bits Consumed by exp(x)\*(1-x)**](bernoullicharts/exp_x_1-x__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/exp_x_1-x__bound.svg) |
| log(1+x) (Flajolet) | ![**Simulated Mean for log(1+x) (Flajolet)**](bernoullicharts/log_1_x_flajolet__mean.svg) | ![**Expected Bits Consumed by log(1+x) (Flajolet)**](bernoullicharts/log_1_x_flajolet__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/log_1_x_flajolet__bound.svg) |
| log(1+x) (Two-Coin Special Case) | ![**Simulated Mean for log(1+x) (Two-Coin Special Case)**](bernoullicharts/log_1_x_two-coin_special_case__mean.svg) | ![**Expected Bits Consumed by log(1+x) (Two-Coin Special Case)**](bernoullicharts/log_1_x_two-coin_special_case__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/log_1_x_two-coin_special_case__bound.svg) |
| pow(x,1/3) | ![**Simulated Mean for pow(x,1/3)**](bernoullicharts/pow_x_1_3__mean.svg) | ![**Expected Bits Consumed by pow(x,1/3)**](bernoullicharts/pow_x_1_3__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/pow_x_1_3__bound.svg) |
| pow(x,2/1) | ![**Simulated Mean for pow(x,2/1)**](bernoullicharts/pow_x_2_1__mean.svg) | ![**Expected Bits Consumed by pow(x,2/1)**](bernoullicharts/pow_x_2_1__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/pow_x_2_1__bound.svg) |
| pow(x,2/4) | ![**Simulated Mean for pow(x,2/4)**](bernoullicharts/pow_x_2_4__mean.svg) | ![**Expected Bits Consumed by pow(x,2/4)**](bernoullicharts/pow_x_2_4__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/pow_x_2_4__bound.svg) |
| pow(x,3/4) | ![**Simulated Mean for pow(x,3/4)**](bernoullicharts/pow_x_3_4__mean.svg) | ![**Expected Bits Consumed by pow(x,3/4)**](bernoullicharts/pow_x_3_4__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/pow_x_3_4__bound.svg) |
| pow(x,4/5) | ![**Simulated Mean for pow(x,4/5)**](bernoullicharts/pow_x_4_5__mean.svg) | ![**Expected Bits Consumed by pow(x,4/5)**](bernoullicharts/pow_x_4_5__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/pow_x_4_5__bound.svg) |
| pow(x,5/1) | ![**Simulated Mean for pow(x,5/1)**](bernoullicharts/pow_x_5_1__mean.svg) | ![**Expected Bits Consumed by pow(x,5/1)**](bernoullicharts/pow_x_5_1__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/pow_x_5_1__bound.svg) |
| pow(x,5/4) | ![**Simulated Mean for pow(x,5/4)**](bernoullicharts/pow_x_5_4__mean.svg) | ![**Expected Bits Consumed by pow(x,5/4)**](bernoullicharts/pow_x_5_4__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/pow_x_5_4__bound.svg) |
| sqrt(x) | ![**Simulated Mean for sqrt(x)**](bernoullicharts/sqrt_x__mean.svg) | ![**Expected Bits Consumed by sqrt(x)**](bernoullicharts/sqrt_x__bits.svg) | ![**Coin Flips for the Function**](bernoullicharts/sqrt_x__bound.svg) |

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560v2)", arXiv:0906.5560v2  [math.PR], 2010.</small>

<small><sup id=Note2>(2)</sup> Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.</small>

<small><sup id=Note3>(3)</sup> Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.</small>

<small><sup id=Note4>(4)</sup> Nacu, Şerban, and Yuval Peres. "Fast simulation of new coins from old", The Annals of Applied Probability 15, no. 1A (2005): 93-115.</small>

<small><sup id=Note5>(5)</sup> As used here and in the Flajolet paper, a geometric random number is the number of successes before the first failure, where the success probability is &lambda;.</small>

<small><sup id=Note6>(6)</sup> The Flajolet paper describes what it calls the _von Neumann schema_, which, given a permutation class and an input coin, generates a random non-negative integer _n_ with probability equal to (&lambda;<sup>_n_</sup> * V(_n_) / _n_!) / EGF(&lambda;), where EGF(&lambda;) = &Sigma;<sub>_k_ = 0, 1, ...</sub> (&lambda;<sup>_k_</sup> * V(_k_) / _k_!), and V(_n_) is the number of _valid_ permutations of size _n_.  Here, EGF(&lambda;) is the _exponential generating function_.  Effectively, a geometric(&lambda;) random number _G_ is accepted with probability V(_G_)/_G_! (where _G_! is the number of _possible_ permutations of size _G_, or 1 if _G_ is 0), and rejected otherwise.  The probability that _r_ geometric random numbers are rejected this way is _p_*(1 &minus; _p_)<sup>_r_</sup>, where _p_ = (1 &minus; &lambda;) * EGF(&lambda;).</small>

<small><sup id=Note7>(7)</sup> Łatuszyński, K., Kosmidis, I.,  Papaspiliopoulos, O., Roberts, G.O., "[**Simulating events of unknown probabilities via reverse time martingales**](https://arxiv.org/abs/0907.4018v2)", arXiv:0907.4018v2 [stat.CO], 2009/2011.</small>

<small><sup id=Note8>(8)</sup> Gonçalves, F. B., Łatuszyński, K. G., Roberts, G. O. (2017).  Exact Monte Carlo likelihood-based inference for jump-diffusion processes.</small>

<small><sup id=Note9>(9)</sup> Another algorithm for this function uses the general martingale algorithm, but uses more bits on average as &lambda; approaches 1.  Here, the alternating series is `1 - x + x^2/2 - x^3/3 + ...`, whose coefficients are 1, 1, 1/2, 1/3, ...</small>

<small><sup id=Note10>(10)</sup> Vats, D., Gonçalves, F. B., Łatuszyński, K. G., Roberts, G. O. Efficient Bernoulli factory MCMC for intractable likelihoods, arXiv:2004.07471v1 [stat.CO], 2020.</small>

<small><sup id=Note11>(11)</sup> Huber, M., "[**Optimal linear Bernoulli factories for small mean problems**](https://arxiv.org/abs/1507.00843v2)", arXiv:1507.00843v2 [math.PR], 2016</small>

<small><sup id=Note12>(12)</sup> Morina, G., Łatuszyński, K., et al., "[**From the Bernoulli Factory to a Dice Enterprise via Perfect Sampling of Markov Chains**](https://arxiv.org/abs/1912.09229v1)", arXiv:1912.09229v1 [math.PR], 2019.</small>

<small><sup id=Note13>(13)</sup> Mendo, Luis. "An asymptotically optimal Bernoulli factory for certain functions that can be expressed as power series." Stochastic Processes and their Applications 129, no. 11 (2019): 4366-4384.</small>

<small><sup id=Note14>(14)</sup> One of the only implementations I could find of this, if not the only, was a [**Haskell implementation**](https://github.com/derekelkins/buffon/blob/master/Data/Distribution/Buffon.hs).</small>

<small><sup id=Note15>(15)</sup> Huber, M., "[**Nearly optimal Bernoulli factories for linear functions**](https://arxiv.org/abs/1308.1562v2)", arXiv:1308.1562v2  [math.PR], 2014.</small>

<small><sup id=Note16>(16)</sup> Huber, M., "[**Optimal linear Bernoulli factories for small mean problems**](https://arxiv.org/abs/1507.00843v2)", arXiv:1507.00843v2 [math.PR], 2016.</small>

<small><sup id=Note17>(17)</sup> Huber, M., "[**Designing perfect simulation algorithms using local correctness**](https://arxiv.org/abs/1907.06748v1)", arXiv:1907.06748v1 [cs.DS], 2019.</small>

<small><sup id=Note18>(18)</sup> Canonne, C., Kamath, G., Steinke, T., "[**The Discrete Gaussian for Differential Privacy**](https://arxiv.org/abs/2004.00010v2)", arXiv:2004.00010v2 [cs.DS], 2020.</small>

<small><sup id=Note19>(19)</sup> Shaddin Dughmi, Jason D. Hartline, Robert Kleinberg, and Rad Niazadeh. 2017. Bernoulli Factories and Black-Box Reductions in Mechanism Design. In _Proceedings of 49th Annual ACM SIGACT Symposium on the Theory of Computing_, Montreal, Canada, June 2017 (STOC’17).</small>

<small><sup id=Note20>(20)</sup> Brassard, G., Devroye, L., Gravel, C., "Remote Sampling with Applications to General Entanglement Simulation", Entropy 2019(21)(92), doi:10.3390/e21010092.</small>

<small><sup id=Note21>(21)</sup> Devroye, L., Gravel, C., "[**Sampling with arbitrary precision**](https://arxiv.org/abs/1502.02539v5)", arXiv:1502.02539v5 [cs.IT], 2015.</small>

<small><sup id=Note22>(22)</sup> Lee, A., Doucet, A. and Łatuszyński, K., 2014. Perfect simulation using atomic regeneration with application to Sequential Monte Carlo, arXiv:1407.5770v1  [stat.CO].</small>

<a id=Appendix></a>
## Appendix

&nbsp;

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

- The average number of coin flips needed by this algorithm will grow without bound as _x_ approaches 0, and Mendo (2019)<sup>[**(13)**](#Note13)</sup> showed that this is a lower bound; that is, no Bernoulli factory algorithm can do much better without knowing more information on _x_.
- _x_<sup>_y_/_z_</sup> has a slope that tends to a vertical slope near 0, so that the so-called [**_Lipschitz condition_**](https://en.wikipedia.org/wiki/Lipschitz_continuity) is not met at 0.  And (Nacu and Peres 2005, propositions 10 and 23)<sup>[**(4)**](#Note4)</sup> showed that the Lipschitz condition is necessary for a Bernoulli factory to have an upper bound on the average running time.

Thus, a practical implementation of this algorithm may have to switch to an alternative implementation (such as the one described in the next section) when it detects that the geometric bag's first few digits are zeros.

<a id=Alternative_Implementation_of_Bernoulli_Factories></a>
### Alternative Implementation of Bernoulli Factories

Say we have a Bernoulli factory algorithm that takes a coin with probability of heads of _p_ and outputs 1 with probability _f_(_p_).  If this algorithm takes a geometric bag (a partially-sampled uniform random number or PSRN) as the input coin and flips that coin using **SampleGeometricBag**, the algorithm could instead be implemented as follows in order to return 1 with probability _f_(_U_), where _U_ is the number represented by the geometric bag (see also (Brassard et al., 2019)<sup>[**(20)**](#Note20)</sup>, (Devroye 1986, p. 431)<sup>[**(3)**](#Note3)</sup>, (Devroye and Gravel 2015)<sup>[**(21)**](#Note21)</sup>:

1. Set _v_ to 0 and _k_ to 1.
2. Set _v_ to _b_ * _v_ + _d_, where _b_ is the base (or radix) of the geometric bag's digits, and _d_ is a digit chosen uniformly at random.
3. Calculate an approximation of _f_(_U_) as follows:
    1. Set _n_ to the number of items (sampled and unsampled digits) in the geometric bag.
    2. Of the first _n_ items in the geometric bag, sample each of the unsampled digits uniformly at random.  Then let _uk_ be the geometric bag's digit expansion up to the first _n_ digits after the point.
    3. Calculate the lowest and highest values of _f_ in the interval \[_uk_, _uk_ + _b_<sup>&minus;_n_</sup>\], call them _fmin_ and _fmax_. If abs(_fmin_ - _fmax_) <= 2 * _b_<sup>&minus;_k_</sup>, calculate (_fmax_ + _fmin_) / 2 as the approximation.  Otherwise, add 1 to _n_ and go to the previous substep.
4. Let _pk_ be the approximation's digit expansion up to the _k_ digits after the point.  For example, if _f_(_U_) is &pi; and _k_ is 2, _pk_ is 314.
5. If _pk_ + 1 <= _v_, return 0. If _pk_ &minus; 2 >= _v_, return 1.  If neither is the case, add 1 to _k_ and go to step 2.

However, the focus of this article is on algorithms that don't rely on calculations of irrational numbers, which is why this section is in the appendix.

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
