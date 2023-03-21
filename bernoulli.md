# Bernoulli Factory Algorithms

[**Peter Occil**](mailto:poccil14@gmail.com)

**Abstract:** This page catalogs algorithms to turn coins biased one way into coins biased another way, also known as _Bernoulli factories_.  It provides step-by-step instructions to help programmers implement these Bernoulli factory algorithms.  This page also contains algorithms to exactly sample probabilities that are irrational numbers, using only random bits, which is related to the Bernoulli factory problem. This page is focused on methods that _exactly_ sample a given probability without introducing new errors, assuming "truly random" numbers are available.  The page links to a Python module that implements several Bernoulli factories.

**2020 Mathematics Subject Classification:** 68W20, 60-08, 60-04.

<a id=Introduction></a>
## Introduction

Suppose a coin shows heads with an unknown probability, _&lambda;_. The goal is to use that coin (and possibly also a fair coin) to build a "new" coin that shows heads with a probability that depends on _&lambda;_, call it _f_(_&lambda;_). This is the _Bernoulli factory problem_.

This page:

- Catalogs algorithms to solve the Bernoulli factory problem for a wide variety of functions, algorithms known as _Bernoulli factories_.  For many of these algorithms, step-by-step instructions are provided.  (Many of these algorithms were suggested in (Flajolet et al., 2010\)[^1], but without step-by-step instructions in many cases.)
- Contains algorithms to exactly sample probabilities that are irrational numbers, which is related to the Bernoulli factory problem.  (An _irrational number_ is a number that can't be written as a ratio of two integers.) Again, many of these algorithms were suggested in (Flajolet et al., 2010\)[^1].
- Assumes knowledge of **computer programming and mathematics**, but **little or no familiarity with calculus**.
- Is focused on methods that _exactly_ sample the probability described, without introducing rounding errors or other errors beyond those already present in the inputs (and assuming that a source of independent and unbiased random bits is available).

The Python module [**_bernoulli.py_**](https://peteroupc.github.io/bernoulli.py) includes implementations of several Bernoulli factories.  For extra notes, see: [**Supplemental Notes for Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernsupp.html)

<a id=About_This_Document></a>
### About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/bernoulli.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/bernoulli.md)**.  You can send comments on this document on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues)**.  See** "[**Requests and Open Questions**](#Requests_and_Open_Questions)" **for a list of things about this document that I seek answers to.**

My audience for this article is **computer programmers with mathematics knowledge, but little or no familiarity with calculus**.

I encourage readers to implement any of the algorithms given in this page, and report their implementation experiences.  In particular, [**I seek comments on the following aspects**](https://github.com/peteroupc/peteroupc.github.io/issues/18):

- Are the algorithms in the articles easy to implement? Is each algorithm written so that someone could write code for that algorithm after reading the article?
- Does this article have errors that should be corrected?
- Are there ways to make this article more useful to the target audience?

Comments on other aspects of this document are welcome.

<a id=Contents></a>
## Contents

- [**Introduction**](#Introduction)
    - [**About This Document**](#About_This_Document)
- [**Contents**](#Contents)
- [**About Bernoulli Factories**](#About_Bernoulli_Factories)
- [**Algorithms**](#Algorithms)
    - [**Implementation Notes**](#Implementation_Notes)
    - [**Algorithms for General Functions of _&lambda;_**](#Algorithms_for_General_Functions_of___lambda)
        - [**Certain Polynomials**](#Certain_Polynomials)
        - [**Certain Rational Functions**](#Certain_Rational_Functions)
        - [**Certain Power Series**](#Certain_Power_Series)
        - [**General Factory Functions**](#General_Factory_Functions)
    - [**Algorithms for General Irrational Constants**](#Algorithms_for_General_Irrational_Constants)
        - [**Digit Expansions**](#Digit_Expansions)
        - [**Continued Fractions**](#Continued_Fractions)
        - [**Continued Logarithms**](#Continued_Logarithms)
        - [**Certain Algebraic Numbers**](#Certain_Algebraic_Numbers)
        - [**Certain Converging Series**](#Certain_Converging_Series)
    - [**Other General Algorithms**](#Other_General_Algorithms)
        - [**Convex Combinations**](#Convex_Combinations)
        - [**Bernoulli Race and Generalizations**](#Bernoulli_Race_and_Generalizations)
        - [**Flajolet's Probability Simulation Schemes**](#Flajolet_s_Probability_Simulation_Schemes)
        - [**Integrals**](#Integrals)
    - [**Algorithms for Specific Functions of _&lambda;_**](#Algorithms_for_Specific_Functions_of___lambda)
        - [**ExpMinus (exp(&minus;_z_))**](#ExpMinus_exp_minus__z)
        - [**LogisticExp (1 &minus; expit(_z_/2<sup>_prec_</sup>))**](#LogisticExp_1_minus_expit__z__2_prec)
        - [**exp(&minus;(_&lambda;_ \* _z_))**](#exp_minus___lambda____z)
        - [**exp(&minus;exp(_m_ + _&lambda;_))**](#exp_minus_exp__m____lambda)
        - [**exp(&minus;(_m_ + _&lambda;_)<sup>_k_</sup>)**](#exp_minus__m____lambda____k)
        - [**exp(_&lambda;_)*(1&minus;_&lambda;_)**](#exp___lambda___1_minus___lambda)
        - [**(1 &minus; exp(&minus;(_m_ + _&lambda;_))) / (_m_ + _&lambda;_)**](#1_minus_exp_minus__m____lambda____m____lambda)
        - [**expit(_z_) or 1&minus;1/(1+exp(_z_)) or exp(_z_)/(1+exp(_z_)) or 1/(1+exp(&minus;_z_))**](#expit__z__or_1_minus_1_1_exp__z__or_exp__z__1_exp__z__or_1_1_exp_minus__z)
        - [**expit(_z_)\*2 &minus; 1 or tanh(_z_/2)**](#expit__z__2_minus_1_or_tanh__z__2)
        - [**_&lambda;_\*exp(_z_) / (_&lambda;_\*exp(_z_) + (1 &minus; _&lambda;_)) or _&lambda;_\*exp(_z_) / (1 + _&lambda;_\*(exp(_z_) &minus; 1))**](#lambda___exp__z____lambda___exp__z__1_minus___lambda___or___lambda___exp__z__1___lambda___exp__z__minus_1)
        - [**(1 + exp(_z_ &minus; _w_)) / (1 + exp(_z_))**](#1_exp__z__minus__w__1_exp__z)
        - [**1/(2<sup>_m_\*(_k_ + _&lambda;_)</sup>) or exp(&minus;(_k_ + _&lambda;_)\*ln(2<sup>_m_</sup>))**](#1_2_m___k____lambda___or_exp_minus__k____lambda___ln_2_m)
        - [**1/(2<sup>(_x_/_y_)\*(_&lambda;_)</sup>) or exp(&minus;(_&lambda;_)\*ln(2<sup>_x_/_y_</sup>))**](#1_2__x___y____lambda___or_exp_minus___lambda___ln_2_x___y)
        - [**Two-Coin Algorithm (_c_ * _&lambda;_ * _&beta;_ / (_&beta;_ * (_c_ * _&lambda;_ + _d_ * _&mu;_) &minus; (_&beta;_ &minus; 1) * (_c_ + _d_)))**](#Two_Coin_Algorithm__c____lambda_____beta_____beta____c____lambda____d____mu___minus___beta___minus_1__c___d)
        - [**_c_ * _&lambda;_ / (_c_ * _&lambda;_ + _d_) or (_c_/_d_) * _&lambda;_ / (1 + (_c_/_d_) * _&lambda;_))**](#c____lambda____c____lambda____d__or__c___d____lambda___1__c___d____lambda)
        - [**(_d_ + _&lambda;_) / _c_**](#d____lambda____c)
        - [**_d_ / (_c_ + _&lambda;_)**](#d___c____lambda)
        - [**(_d_ + _&mu;_) / (_c_ + _&lambda;_)**](#d____mu____c____lambda)
        - [**(_d_ + _&mu;_) / ((_d_ + _&mu;_) + (_c_ + _&lambda;_))**](#d____mu____d____mu____c____lambda)
        - [**_d_<sup>_k_</sup> / (_c_ + _&lambda;_)<sup>_k_</sup>, or (_d_ / (_c_ + _&lambda;_))<sup>_k_</sup>**](#d__k___c____lambda____k__or__d___c____lambda____k)
        - [**1/(1+_&lambda;_)**](#1_1___lambda)
        - [**1/(2 &minus; _&lambda;_)**](#1_2_minus___lambda)
        - [**1/(1+(_m_+_&lambda;_)<sup>2</sup>)**](#1_1__m____lambda___2)
        - [**1 / (1 + (_x_/_y_)\*_&lambda;_)**](#1_1__x___y____lambda)
        - [**_&lambda;_<sup>_x_/_y_</sup>**](#lambda___x___y)
        - [**sqrt(_&lambda;_)**](#sqrt___lambda)
        - [**arctan(_&lambda;_) /_&lambda;_**](#arctan___lambda_____lambda)
        - [**arctan(_&lambda;_)**](#arctan___lambda)
        - [**cos(_&lambda;_)**](#cos___lambda)
        - [**sin(_&lambda;_\*sqrt(_c_)) / (_&lambda;_\*sqrt(_c_))**](#sin___lambda___sqrt__c____lambda___sqrt__c)
        - [**sin(_&lambda;_)**](#sin___lambda)
        - [**ln(1+_&lambda;_)**](#ln_1___lambda)
        - [**ln(_c_+_&lambda;_)/(_c_+_&lambda;_)**](#ln__c____lambda____c____lambda)
        - [**arcsin(_&lambda;_) + sqrt(1 &minus; _&lambda;_<sup>2</sup>) &minus; 1**](#arcsin___lambda___sqrt_1_minus___lambda__2_minus_1)
        - [**tanh(_z_)**](#tanh__z)
        - [**Expressions Involving Polylogarithms**](#Expressions_Involving_Polylogarithms)
        - [**min(_&lambda;_, 1/2) and min(_&lambda;_, 1&minus;_&lambda;_)**](#min___lambda___1_2_and_min___lambda___1_minus___lambda)
    - [**Algorithms for Specific Functions of _&lambda;_ (Probability-Sensitive)**](#Algorithms_for_Specific_Functions_of___lambda___Probability_Sensitive)
        - [**_&lambda;_ + _&mu;_**](#lambda_____mu)
        - [**_&lambda;_ &minus; _&mu;_**](#lambda___minus___mu)
        - [**_&#x03F5;_ / _&lambda;_**](#x03F5_____lambda)
        - [**_&mu;_ / _&lambda;_**](#mu_____lambda)
        - [**_&lambda;_ * _x_/_y_**](#lambda____x___y)
        - [**(_&lambda;_ * _x_/_y_)<sup>_i_</sup>**](#lambda____x___y___i)
        - [**Linear Bernoulli Factories**](#Linear_Bernoulli_Factories)
        - [**_&lambda;_<sup>_&mu;_</sup>**](#lambda____mu)
        - [**(1&minus;_&lambda;_)/cos(_&lambda;_)**](#1_minus___lambda___cos___lambda)
        - [**(1&minus;_&lambda;_) * tan(_&lambda;_)**](#1_minus___lambda___tan___lambda)
        - [**ln((_c_ + _d_ + _&lambda;_)/_c_)**](#ln__c___d____lambda____c)
        - [**arcsin(_&lambda;_) / 2**](#arcsin___lambda___2)
    - [**Other Factory Functions**](#Other_Factory_Functions)
    - [**Algorithms for Specific Constants**](#Algorithms_for_Specific_Constants)
        - [**1 / _&phi;_ (1 divided by the golden ratio)**](#1___phi___1_divided_by_the_golden_ratio)
        - [**sqrt(2) &minus; 1**](#sqrt_2_minus_1)
        - [**1/sqrt(2)**](#1_sqrt_2)
        - [**tanh(1/2) or (exp(1) &minus; 1) / (exp(1) + 1)**](#tanh_1_2_or_exp_1_minus_1_exp_1_1)
        - [**arctan(_x_/_y_) \* _y_/_x_**](#arctan__x___y___y___x)
        - [**_&pi;_ / 12**](#pi___12)
        - [**_&pi;_ / 4**](#pi___4)
        - [**_&pi;_/4 &minus; 1/2 or (_&pi;_ &minus; 2)/4**](#pi___4_minus_1_2_or___pi___minus_2_4)
        - [**(_&pi;_ &minus; 3)/4**](#pi___minus_3_4)
        - [**_&pi;_ &minus; 3**](#pi___minus_3)
        - [**1 / _&pi;_**](#1___pi)
        - [**(_a_/_b_)<sup>_z_</sup>**](#a___b___z)
        - [**1/(exp(1) + _c_ &minus; 2)**](#1_exp_1__c__minus_2)
        - [**exp(1) &minus; 2**](#exp_1_minus_2)
        - [**_&zeta;_(3) * 3 / 4 and Other Zeta-Related Constants**](#zeta___3_3_4_and_Other_Zeta_Related_Constants)
        - [**erf(_x_)/erf(1)**](#erf__x__erf_1)
        - [**Euler&ndash;Mascheroni constant _&gamma;_**](#Euler_ndash_Mascheroni_constant___gamma)
        - [**exp(&minus;_x_/_y_) \* _z_/_t_**](#exp_minus__x___y___z___t)
        - [**Certain Numbers Based on the Golden Ratio**](#Certain_Numbers_Based_on_the_Golden_Ratio)
        - [**ln(1+_y_/_z_)**](#ln_1__y___z)
        - [**ln(_&pi;_)/_&pi;_**](#ln___pi_____pi)
- [**Requests and Open Questions**](#Requests_and_Open_Questions)
- [**Correctness and Performance Charts**](#Correctness_and_Performance_Charts)
- [**Acknowledgments**](#Acknowledgments)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Using the Input Coin Alone for Randomness**](#Using_the_Input_Coin_Alone_for_Randomness)
    - [**The Entropy Bound**](#The_Entropy_Bound)
    - [**Bernoulli Factories and Unbiased Estimation**](#Bernoulli_Factories_and_Unbiased_Estimation)
    - [**Correctness Proof for the Continued Logarithm Simulation Algorithm**](#Correctness_Proof_for_the_Continued_Logarithm_Simulation_Algorithm)
    - [**Correctness Proof for Continued Fraction Simulation Algorithm 3**](#Correctness_Proof_for_Continued_Fraction_Simulation_Algorithm_3)
    - [**Proof of the General Martingale Algorithm**](#Proof_of_the_General_Martingale_Algorithm)
    - [**Algorithm for sin(_&lambda;_\*_&pi;_/2)**](#Algorithm_for_sin___lambda_____pi___2)
    - [**Probabilities Arising from Certain Permutations**](#Probabilities_Arising_from_Certain_Permutations)
    - [**Derivation of an Algorithm for _&pi;_ / 4**](#Derivation_of_an_Algorithm_for___pi___4)
    - [**Sketch of Derivation of the Algorithm for 1 / _&pi;_**](#Sketch_of_Derivation_of_the_Algorithm_for_1___pi)
    - [**Preparing Rational Functions**](#Preparing_Rational_Functions)
- [**License**](#License)

<a id=About_Bernoulli_Factories></a>
## About Bernoulli Factories

A _Bernoulli factory_ (Keane and O'Brien 1994\)[^2] is an algorithm that takes an input coin (a method that returns 1, or heads, with an unknown probability, or 0, or tails, otherwise) and returns 0 or 1 with a probability that depends on the input coin's probability of heads.

- The Greek letter lambda (_&lambda;_) represents the unknown probability of heads.
- The Bernoulli factory's outputs are statistically independent, and so are those of the input coin.
- Many Bernoulli factories also use a _fair coin_ in addition to the input coin.  A fair coin shows heads or tails with equal probability, and represents a source of randomness outside the input coin.
- A _factory function_ is a known function that relates the old probability to the new one.  Its domain is the _closed_ interval [0, 1] or a subset of that interval, and maps an input in that interval to an output in that interval.

> **Example:** A Bernoulli factory algorithm can take a coin that returns heads with probability _&lambda;_ and produce a coin that returns heads with probability exp(&minus;_&lambda;_).  In this example, exp(&minus;_&lambda;_) is the factory function.

Keane and O'Brien (1994\)[^2] showed that a function _f_ that maps \[0, 1\] (or a subset of it) to [0, 1] admits a Bernoulli factory if and only if&mdash;

- _f_ is constant on its domain, or
- _f_ is continuous and polynomially bounded on its domain (polynomially bounded means that both _f_(_&lambda;_) and 1&minus;_f_(_&lambda;_) are not less than min(_&lambda;_<sup>_n_</sup>, (1&minus;_&lambda;_)<sup>_n_</sup>) for some integer _n_).

The following shows some functions that are factory functions and some that are not.  In the table below, _&#x03F5;_ is a number greater than 0 and less than 1/2.

| Function _f_(_&lambda;_) | Domain | Can _f_ be a factory function? |
 ---- | ---- | ---- |
| 0 | [0, 1] | Yes; constant. |
| 1 | [0, 1] | Yes; constant. |
| 1/2 | (0, 1) | Yes; constant. |
| 1/4 if _&lambda;_<1/2, and 3/4 elsewhere | (0, 1) | No; discontinuous. |
| 2*_&lambda;_ | \[0,&nbsp;1\] or \[0,&nbsp;1/2\) | No; not polynomially bounded since _f_(_&lambda;_) approaches 1 as _&lambda;_ approaches 1/2 (as opposed to 0 or 1).[^3]. |
| 1&minus;2*_&lambda;_ | [0,&nbsp;1] or [0,&nbsp;1/2) | No; not polynomially bounded since _f_(_&lambda;_) approaches 0 as _&lambda;_ approaches 1/2. |
| 2*_&lambda;_ | [0,&nbsp;1/2&minus;&#x03F5;\] | Yes; continuous and polynomially bounded on domain (Keane and O'Brien 1994\)[^2]. |
| min(2 * _&lambda;_, 1 &minus; _&#x03F5;_) | [0, 1] | Yes; continuous and polynomially bounded on domain (Huber 2014, introduction\)[^4]. |
| 0 if _&lambda;_ = 0, or exp(&minus;1/_&lambda;_) otherwise | (0, 1) | No; not polynomially bounded since it moves away from 0 more slowly than any polynomial. |
| &#x03F5; if _&lambda;_ = 0, or exp(&minus;1/_&lambda;_) + &#x03F5; otherwise | (0, 1) | Yes; continuous, minimum greater than 0, maximum less than 1. |

If _f_'s domain includes 0 and/or 1 (so that the input coin is allowed to return 0 every time or 1 every time, respectively), then _f_ can be a factory function only if&mdash;

1. the function is constant on its domain, or is continuous and polynomially bounded on its domain, and
2. _f_(0) equals 0 or 1 whenever 0 is in the function's domain, and
3. _f_(1) equals 0 or 1 whenever 1 is in the function's domain,

unless outside randomness (besides the input coin) is available.

<a id=Algorithms></a>
## Algorithms

This section will show algorithms for a number of factory functions, allowing different kinds of probabilities to be sampled from input coins.

The algorithms as described here do not always lead to the best performance.  An implementation may change these algorithms as long as they produce the same results as the algorithms as described here.

> **Notes:**
>
> 1. Most of the algorithms assume that a source of independent and unbiased random bits is available, in addition to the input coins.  But in many cases, they can be implemented using nothing but those coins as a source of randomness.  See the [**appendix**](#Appendix) for details.
> 2. Bernoulli factory algorithms that sample the probability _f_(_&lambda;_) act as unbiased estimators of _f_(_&lambda;_) (their "long run average" equals _f_(_&lambda;_)). See the [**appendix**](#Bernoulli_Factories_and_Unbiased_Estimation) for details.

<a id=Implementation_Notes></a>
### Implementation Notes

This section shows implementation notes that apply to the algorithms in this article.  They should be followed to avoid introducing error in the algorithms.

In the following algorithms:

- The Greek letter lambda (_&lambda;_) represents the unknown probability of heads of the input coin.
-  choose(_n_, _k_) = (1\*2\*3\*...\*_n_)/((1\*...\*_k_)\*(1\*...\*(_n_&minus;_k_))) =  _n_!/(_k_! * (_n_ &minus; _k_)!) $={n \choose k}$ is a _binomial coefficient_, or the number of ways to choose _k_ out of _n_ labeled items.  It can be calculated, for example, by calculating _i_/(_n_&minus;_i_+1) for each integer _i_ in \[_n_&minus;_k_+1, _n_\], then multiplying the results (Manolopoulos 2002\)[^5].  For every _m_>0, choose(_m_, 0) = choose(_m_, _m_) = 1 and choose(_m_, 1) = choose(_m_, _m_&minus;1) = _m_; also, in this document, choose(_n_, _k_) is 0 when _k_ is less than 0 or greater than _n_.
- _n_! = 1\*2\*3\*...\*_n_ is also known as _n_ factorial; in this document, (0!) = 1.
- _Summation notation_, involving the Greek capital sigma (&Sigma;), is a way to write the sum of one or more terms of similar form. For example, $\sum_{k=0}^n g(k)$ means $g(0)+g(1)+...+g(n)$, and $\sum_{k\ge 0} g(k)$ means $g(0)+g(1)+...$.
- The instruction to "generate a uniform random variate between 0 and 1" can be implemented&mdash;
    - by creating a [**uniform partially-sampled random number (PSRN)**](https://peteroupc.github.io/exporand.html) with a positive sign, an integer part of 0, and an empty fractional part (most accurate), or
    - by generating a uniform random variate greater than 0 and less than 1 (for example, `RNDRANGEMinMaxExc(0, 1)` in "[**Randomization and Sampling Methods**](https://peteroupc.github.io/randomfunc.html)" (less accurate).
- The instruction to "choose [integers] with probability proportional to [_weights_]" can be implemented in one of the following ways:
    - If the weights are rational numbers, take the result of **WeightedChoice**(**NormalizeRatios**(_weights_))), where **WeightedChoice** and **NormalizeRatios** are given in "[**Randomization and Sampling Methods**](https://peteroupc.github.io/randomfunc.html#Weighted_Choice_With_Replacement)".
    - If the weights are uniform PSRNs, use the algorithm given in "[**Weighted Choice Involving PSRNs**](https://peteroupc.github.io/randmisc.html#Weighted_Choice_Involving_PSRNs)".

    For example, "Choose 0, 1, or 2 with probability proportional to the weights [A, B, C]" means to choose 0, 1, or 2 at random so that 0 is chosen with probability A/(A+B+C), 1 with probability B/(A+B+C), and 2 with probability C/(A+B+C).
- Where an algorithm says "if _a_ is less than _b_", where _a_ and _b_ are random variates, it means to run the **RandLess** algorithm on the two numbers (if they are both PSRNs), or do a less-than operation on _a_ and _b_, as appropriate. (**RandLess** is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
- Where an algorithm says "if _a_ is less than (or equal to) _b_", where _a_ and _b_ are random variates, it means to run the **RandLess** algorithm on the two numbers (if they are both PSRNs), or do a less-than-or-equal operation on _a_ and _b_, as appropriate.
- To **sample from a number _u_** means to generate a number that is 1 with probability _u_ and 0 otherwise.
    - If the number is a uniform PSRN, call the **SampleGeometricBag** algorithm with the PSRN and take the result of that call (which will be 0 or 1) (most accurate). (**SampleGeometricBag** is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
    - Otherwise, this can be implemented by generating a uniform random variate between 0 and 1 _v_ (see above) and generating 1 if _v_ is less than _u_ (see above) or 0 otherwise.
- Where a step in the algorithm says "with probability _x_" to refer to an event that may or may not happen, then this can be implemented in one of the following ways:
    - Generate a uniform random variate between 0 and 1 _v_ (see above). The event occurs if _v_ is less than _x_ (see above).
    - Convert _x_ to a rational number _y_/_z_, then call `ZeroOrOne(y, z)`.  The event occurs if the call returns 1. For example, if an instruction says "With probability 3/5, return 1", then implement it as "Call `ZeroOrOne(3, 5)`. If the call returns 1, return 1."  `ZeroOrOne` is described in my article on [**random sampling methods**](https://peteroupc.github.io/randomfunc.html#Boolean_True_False_Conditions).  If _x_ is not a rational number, then rounding error will result, however.
- For best results, the algorithms should be implemented using exact rational arithmetic (such as `Fraction` in Python or `Rational` in Ruby).  Floating-point arithmetic is discouraged because it can introduce errors due to fixed-precision calculations, such as rounding and cancellations.

<a id=Algorithms_for_General_Functions_of___lambda></a>
### Algorithms for General Functions of _&lambda;_

This section describes general-purpose algorithms for sampling probabilities that are polynomials, rational functions, or functions in general.

<a id=Certain_Polynomials></a>
#### Certain Polynomials

Any polynomial can be written in _Bernstein form_ as&mdash;

$${n\choose 0}\lambda^0 (1-\lambda)^{n-0} a[0] + {n\choose 1}\lambda^1 (1-\lambda)^{n-1} a[1] + ... + {n\choose n}\lambda^n (1-\lambda)^{n-n} a[n],$$

where _n_ is the polynomial's _degree_ and _a_[0], _a_[1], ..., _a_\[_n_\] are its _n_ plus one _coefficients_.

But a polynomial admits a Bernoulli factory only if each of its coefficients is 0 or greater and less than 1 (once the polynomial is written in Bernstein form), and a function can be simulated with a fixed number of coin flips only if it's a polynomial of that kind (Goyal and Sigman 2012[^6]; Qian et al. 2011\)[^7]; see also Wästlund 1999, section 4[^8]).

Goyal and Sigman give an algorithm for simulating these polynomials, which is given below.

1. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.[^9]
2. Return a number that is 1 with probability _a_\[_j_\], or 0 otherwise.

For certain polynomials with duplicate coefficients, the following is an optimized version of this algorithm, not given by Goyal and Sigman:

1. Set _j_ to 0 and _i_ to 0.  If _n_ is 0, return 0.
2. If _i_ is _n_ or greater, or if the coefficients _a_\[_k_\], with _k_ in the interval \[_j_, _j_+(_n_&minus;_i_)\], are all equal, return a number that is 1 with probability _a_\[_j_\], or 0 otherwise.
3. Flip the input coin.  If it returns 1, add 1 to _j_.
4. Add 1 to _i_ and go to step 2.

And here is another optimized algorithm:

1. Set _j_ to 0 and _i_ to 0.  If _n_ is 0, return 0.  Otherwise, generate a uniform random variate between 0 and 1, call it _u_.
2. If _u_ is less than a lower bound of the lowest coefficient, return 1.  Otherwise, if _u_ is less than (or equal to) an upper bound of the highest coefficient, go to the next step.  Otherwise, return 0.
3. If _i_ is _n_ or greater, or if the coefficients _a_\[_k_\], with _k_ in the interval \[_j_, _j_+(_n_&minus;_i_)\], are all equal, return a number that is 1 if _u_ is less than _a_\[_j_\], or 0 otherwise.
4. Flip the input coin.  If it returns 1, add 1 to _j_.
5. Add 1 to _i_ and go to step 3.

Because the coefficients _a_\[_i_\] must be 0 or greater, but not greater than 1, some or all of them can themselves be coins with unknown probability of heads.  In that case, the first algorithm can read as follows:

1. Flip the input coin _n_ times, and let _j_ be the number of times the coin returned 1 this way.
2. If _a_\[_j_\] is a coin, flip it and return the result.  Otherwise, return a number that is 1 with probability _a_\[_j_\], or 0 otherwise.

> **Notes**:
>
> 1. Each _a_\[_i_\] acts as a control point for a 1-dimensional [**Bézier curve**](https://en.wikipedia.org/wiki/Bézier_curve), where _&lambda;_ is the relative position on that curve, the curve begins at  _a_\[0\], and the curve ends at _a_\[_n_\].  For example, given control points 0.2, 0.3, and 0.6, the curve is at 0.2 when _&lambda;_ = 0, and 0.6 when _&lambda;_ = 1.  (The curve, however, is not at 0.3 when _&lambda;_ = 1/2; in general, Bézier curves do not cross their control points other than the first and the last.)
> 2. The problem of simulating polynomials in Bernstein form is related to _stochastic logic_, which involves simulating probabilities that arise out of Boolean functions (functions that use only AND, OR, NOT, and exclusive-OR operations) that take a fixed number of bits as input, where each bit has a separate probability of being 1 rather than 0, and output a single bit (for further discussion see (Qian et al. 2011\)[^7], Qian and Riedel 2008[^10]).
> 3. These algorithms can serve as an approximate way to simulate any function _f_ that maps the interval \[0, 1] to \[0, 1], whether continuous or not.  In this case, _a_\[_j_\] is calculated as _f_(_j_/_n_), so that the resulting polynomial closely approximates the function.  In fact, if the function is continuous, it's possible to choose the polynomial degree (_n_) high enough to achieve a given maximum error (this is a result of the so-called "Weierstrass approximation theorem").  For more information, see my [**Supplemental Notes on Bernoulli Factories**](https://peteroupc.github.io/bernsupp.html).
>
> **Examples:**
>
> 1. Take the following parabolic function discussed in Thomas and Blanchet (2012\)[^11]\: (1&minus;4\*(_&lambda;_&minus;1/2)<sup>2</sup>)\*_c_, where 0 &lt; _c_ &lt; 1.  This is a polynomial of degree 2 that can be rewritten as &minus;4\*_c_\*_&lambda;_<sup>2</sup>+4\*_c_\*_&lambda;_, so that this _power form_ has coefficients (0, 4\*_c_, &minus;4\*_c_) and a degree (_n_) of 2. Rewriting the polynomial in Bernstein form (such as via the matrix method by Ray and Nataraj (2012\)[^12]) leads to coefficients (0, 2\*_c_, 0).  Thus, for this polynomial, _a_\[0] is 0,  _a_\[1] is 2\*_c_, and  _a_\[2] is 0.  Thus:
>     - If 0 &lt; _c_ &le; 1/2, this function can be simulated as follows: "Flip the input coin twice.  If exactly one of the flips returns 1, return a number that is 1 with probability 2\*_c_ and 0 otherwise.  Otherwise, return 0."
>     - If 1/2 &lt; _c_ &lt; 1, the algorithm requires rewriting the polynomial in Bernstein form, then elevating the degree of the rewritten polynomial enough times to bring its coefficients in [0, 1]; the required degree approaches infinity as _c_ approaches 1.[^13]
>
> 2. The _conditional_ construction, mentioned in Flajolet et al. (2010\)[^1], has the form&mdash;<br>(_&lambda;_) \* _a_\[0] + (1 &minus; _&lambda;_) \* _a_\[1].<br>This is a degree-1 polynomial in Bernstein form with variable _&lambda;_ and coefficients _a_\[0] and _a_\[1]. It has the following algorithm: "Flip the _&lambda;_ input coin.  If the result is 0, flip the _a_\[0] input coin and return the result.  Otherwise, flip the _a_\[1] input coin and return the result."  Special cases of the conditional construction include complement, mean, product, and logical OR; see "[**Other Factory Functions**](#Other_Factory_Functions)".

&nbsp;

**Multiple coins.** Niazadeh et al. (2021\)[^14] describes monomials (involving one or more coins) of the form _&lambda;_\[1\]<sup>_a_\[1\]</sup> \* (1&minus;_&lambda;_\[1])<sup>_b_\[1\]</sup>\*_&lambda;_\[2]<sup>_a_\[2\]</sup> \* (1&minus;_&lambda;_\[2])<sup>_b_\[2\]</sup>\* ... \* _&lambda;_\[_n_]<sup>_a_\[_n_\]</sup> \* (1&minus;_&lambda;_\[_n_])<sup>_b_\[_n_\]</sup>, where there are _n_ coins, _&lambda;_\[_i_] is the probability of heads of coin _i_, and _a_\[_i_\] &ge; 0 and _b_\[_i_\] &ge; 0 are parameters for coin _i_ (specifically, of _a_+_b_ flips, the first _a_ flips must return heads and the rest must return tails to succeed).

1. For each _i_ in \[1, _n_\]:
     1. Flip the _&lambda;_\[_i_] input coin _a_\[_i_\] times.  If any of the flips returns 0, return 0.
     2. Flip the _&lambda;_\[_i_] input coin _b_\[_i_\] times.  If any of the flips returns 1, return 0.
2. Return 1.

The same paper also describes polynomials that are weighted sums of this kind of monomials, namely polynomials of the form _P_ = $\sum{j=1}^k$ _c_\[_j_\]\*_M_\[_j_\](**_&lambda;_**), where there are _k_ monomials, _M_\[_j_\](.) identifies monomial _j_, **_&lambda;_** identifies the coins' probabilities of heads, and _c_\[_j_\] &ge; 0 is the weight for monomial _j_.

Let _C_ be the sum of all _c_\[_j_\].  To simulate the probability _P_/_C_, choose one of the monomials with probability proportional to its weight (see "[**Weighted Choice With Replacement**](https://peteroupc.github.io/randomfunc.html#Weighted_Choice_With_Replacement)"), then run the algorithm above on that monomial (see also "[**Convex Combinations**](#Convex_Combinations)", later).

The following is a special case:

- If there is only one coin, the polynomials _P_ are in Bernstein form if _c_\[_j_\] is _&alpha;_\[_j_\]\*choose(_k_&minus;1, _j_&minus;1) where _&alpha;_\[_j_\] is a coefficient 0 or greater, but not greater than 1, and if _a_\[1\] = _j_&minus;1 and _b_\[1\] = _k_&minus;_j_ for each monomial _j_.

<a id=Certain_Rational_Functions></a>
#### Certain Rational Functions

A _rational function_ is a ratio of polynomials.

According to Mossel and Peres (2005\)[^15], a function that maps the open interval (0, 1) to itself can be simulated by a finite-state machine if and only if the function can be written as a rational function whose coefficients are rational numbers.

The following algorithm is suggested from the Mossel and Peres paper and from (Thomas and Blanchet 2012\)[^11].  It assumes the rational function is written as _D_(_&lambda;_)/_E_(_&lambda;_), where&mdash;

- _D_(_&lambda;_) = $\sum_{i=0}^n$ _&lambda;_<sup>_i_</sup> * (1 &minus; _&lambda;_)<sup>_n_ &minus; _i_</sup> * _d_\[_i_\],
- _E_(_&lambda;_) = $\sum_{i=0}^n$ _&lambda;_<sup>_i_</sup> * (1 &minus; _&lambda;_)<sup>_n_ &minus; _i_</sup> * _e_\[_i_\],
- every _d_\[_i_\] is less than or equal to the corresponding _e_\[_i_\], and
- each _d_\[_i_\] and each _e_\[_i_\] is an integer or rational number in the interval [0, choose(_n_, _i_)], where the upper bound is the total number of _n_-bit words with _i_ ones.

Here, _d_\[_i_\] is akin to the number of "passing" _n_-bit words with _i_ ones, and _e_\[_i_\] is akin to that number plus the number of "failing" _n_-bit words with _i_ ones.  (Because of the assumptions, _D_ and _E_ are polynomials that map the closed interval [0, 1] to itself.)

The algorithm follows.

1. Flip the input coin _n_ times, and let _heads_ be the number of times the coin returned 1 this way.
2. Choose 0, 1, or 2 with probability proportional to these weights: \[_e_\[_heads_\] &minus; _d_\[_heads_\], _d_\[_heads_\], choose(_n_, _heads_) &minus; _e_\[_heads_\]\].  If 0 or 1 is chosen this way, return it.  Otherwise, go to step 1.

> **Notes:**
>
> 1. In the formulas above&mdash;
>
>     - _d_\[_i_\] can be replaced with _&delta;_\[_i_\] * choose(_n_,_i_), where _&delta;_\[_i_\] is a rational number in the interval \[0, 1\] (and thus expresses the probability that a given word is a "passing" word among all _n_-bit words with _i_ ones), and
>     - _e_\[_i_\] can be replaced with _&eta;_\[_i_\] * choose(_n_,_i_), where _&eta;_\[_i_\] is a rational number in the interval \[0, 1\] (and thus expresses the probability that a given word is a "passing" or "failing" word among all _n_-bit words with _i_ ones),
>
>     and then _&delta;_\[_i_\] and _&eta;_\[_i_\] can be seen as control points for two different 1-dimensional [**Bézier curves**](https://en.wikipedia.org/wiki/Bézier_curve), where the _&delta;_ curve is always on or "below" the _&eta;_ curve.  For each curve, _&lambda;_ is the relative position on that curve, the curve begins at  _&delta;_\[0\] or _&eta;_\[0\], and the curve ends at _&delta;_\[_n_\] or _&eta;_\[_n_\]. See also the next section.
>
> 2. This algorithm could be modified to avoid additional randomness besides the input coin flips by packing the coin flips into an _n_-bit word and looking up whether that word is "passing", "failing", or neither, among all _n_-bit words with _j_ ones, but this can be impractical (in general, a lookup table of size 2<sup>_n_</sup> first has to be built in a setup step; as _n_ grows, the table size grows exponentially).  Moreover, this approach works only if _d_\[_i_\] and _e_\[_i_\] are integers (or if _d_\[_i_\] is replaced with floor(_d_\[_i_\]) and _e_\[_i_\] with ceil(_e_\[_i_\]) (Nacu and Peres 2005\)[^16], but this suffers from rounding error when done in this algorithm).  See also (Thomas and Blanchet 2012\)[^11].
> 3. As with polynomials, this algorithm (or the one given later) can serve as an approximate way to simulate any factory function, via a rational function that closely approximates that function.  The higher _n_ is, the better this approximation, and in general, a degree-_n_ rational function approximates a given function better than a degree-_n_ polynomial.  However, to achieve a given error tolerance with a rational function, the degree _n_ as well as _d_\[_i_\] and _e_\[_i_\] have to be optimized.  This is unlike the polynomial case where only the degree _n_ has to be optimized.
>
> **Example**: Take the function _f_(_&lambda;_) = 1/(_&lambda;_&minus;2)<sup>2</sup>.  This is a rational function, in this case a ratio of two polynomials that are both nonnegative on the interval \[0, 1].  One algorithm to simulate this function follows.<br>(1) Flip the input coin twice, and let _heads_ be the number of times the coin returned 1 this way.<br>(2) Depending on _heads_, choose 0, 1, or 2 with probability proportional to the following weights: _heads_=0 &rarr; \[3, 1, 0], _heads_=1 &rarr; \[1, 1, 2], _heads_=2 &rarr; \[0, 1, 3]; if 0 or 1 is chosen this way, return it; otherwise, go to step 1.<br>Here is how _f_ was prepared to derive this algorithm:<br>(1) Take the numerator 1, and the denominator (_&lambda;_&minus;2)<sup>2</sup>.  Rewrite the denominator as 1\*_&lambda;_<sup>2</sup> &minus; 4\*_&lambda;_ + 4.<br>(2) Rewrite the numerator and denominator into homogeneous polynomials (polynomials whose terms have the same degree) of degree 2; see the "homogenizing" section in "[**Preparing Rational Functions**](#Preparing_Rational_Functions)".  The result is (1, 2, 1) and (4, 4, 1) respectively.<br>(3) Divide both polynomials (actually their coefficients) by the same value so that both polynomials are 1 or less.  An easy (but not always best) choice is to divide them by their maximum coefficient, which is 4 in this case.  The result is _d_ = (1/4, 1/2, 1/4), _e_ = (1, 1, 1/4).<br>(4) Prepare the weights as given in step 2 of the original algorithm.  The result is [3/4, 1/4, 0], [1/2, 1/2, 1], and [0, 1/4, 3/4], for different counts of heads.  Because the weights in this case are multiples of 1/4, they can be simplified to integers without affecting the algorithm: [3, 1, 0], [1, 1, 2], [0, 1, 3], respectively.

**"Dice Enterprise" special case.** The following algorithm implements a special case of the "Dice Enterprise" method of Morina et al. (2022\)[^17].  The algorithm returns one of _m_ outcomes (namely _X_, an integer in [0, _m_)) with probability _P_<sub>_X_</sub>(_&lambda;_) / (_P_<sub>0</sub>(_&lambda;_) + _P_<sub>1</sub>(_&lambda;_) + ... + _P_<sub>_m_&minus;1</sub>(_&lambda;_)), where _&lambda;_ is the input coin's probability of heads and _m_ is 2 or greater.  Specifically, the probability is a _rational function_, or ratio of polynomials.  Here, all the _P_<sub>_k_</sub>(_&lambda;_) are in the form of polynomials as follows:
- The polynomials are _homogeneous_, that is, they are written as $\sum_{i=0}^n$ _&lambda;_<sup>_i_</sup> * (1 &minus; _&lambda;_)<sup>_n_ &minus; _i_</sup> * _a_\[_i_\], where _n_ is the polynomial's degree and _a_\[_i_\] is a coefficient.
- The polynomials have the same degree (namely _n_) and all _a_\[_i_\] are 0 or greater.
- The sum of _j_<sup>th</sup> coefficients is greater than 0, for each _j_ starting at 0 and ending at _n_, except that the list of sums may begin and/or end with zeros.  Call this list _R_.  For example, this condition holds true if _R_ is (2, 4, 4, 2) or (0, 2, 4, 0), but not if _R_ is (2, 0, 4, 3).

Any rational function that admits a Bernoulli factory can be brought into the form just described, as detailed in the appendix under "[**Preparing Rational Functions**](#Preparing_Rational_Functions)".  In this algorithm, let _R_\[_j_\] be the sum of _j_<sup>th</sup> coefficients of the polynomials (with _j_ starting at 0).  First, define the following operation:

- **Get the new state given _state_, _b_, _u_, and _n_**:
    1. If _state_ > 0 and _b_ is 0, return either _state&minus;1_ if _u_ is less than (or equal to) _PA_, or _state_ otherwise, where _PA_ is _R_\[_state_&minus;1]/max(_R_\[_state_\], _R_\[_state_&minus;1]).
    2. If _state_ < _n_ and _b_ is 1, return either _state+1_ if _u_ is less than (or equal to) _PB_, or _state_ otherwise, where _PB_ is _R_\[_state_+1]/max(_R_\[_state_\], _R_\[_state_+1]).
    3. Return _state_.

Then the algorithm is as follows:

1. Create two empty lists: _blist_ and _ulist_.
2. Set _state1_ to the position of the first non-zero item in _R_.  Set _state2_ to the position of the last non-zero item in _R_.  In both cases, positions start at 0.  If all the items in _R_ are zeros, return 0.
3. Flip the input coin and append the result (which is 0 or 1) to the end of _blist_.  Generate a uniform random variate between 0 and 1 and append it to the end of _ulist_.
4. (Monotonic coupling from the past (Morina et al., 2022\)[^17], (Propp and Wilson 1996\)[^18].) Set _i_ to the number of items in _blist_ minus 1, then while _i_ is 0 or greater:
    1. Let _b_ be the item at position _i_ (starting at 0) in _blist_, and let _u_ be the item at that position in _ulist_.
    2. **Get the new state given _state1_, _b_, _u_, and _n_**, and set _state1_ to the new state.
    3. **Get the new state given _state2_, _b_, _u_, and _n_**, and set _state2_ to the new state.
    4. Subtract 1 from _i_.
5. If _state1_ and _state2_ are not equal, go to step 2.
6. Let  _b_(_j_) be coefficient _a_\[_state1_\] of the polynomial for _j_. Choose an integer in [0, _m_) with probability proportional to these weights: \[_b_(0), _b_(1), ..., _b_(_m_&minus;1)].  Then return the chosen integer.

> **Notes:**
>
> 1. If there are only two outcomes, then this is the special Bernoulli factory case; the algorithm would then return 1 with probability _P_<sub>1</sub>(_&lambda;_) / (_P_<sub>0</sub>(_&lambda;_) + _P_<sub>1</sub>(_&lambda;_)).
> 2. If _R_\[_j_\] = choose(_n_, _j_), steps 1 through 5 have the same effect as counting the number of ones from _n_ input coin flips (which would be stored in _state1_ in this case), but unfortunately, these steps wouldn't be more efficient.  In this case, _PA_ is equivalent to "1 if _state_ is greater than floor(_n_/2), and _state_/(_n_+1&minus;_state_) otherwise", and _PB_ is equivalent to "1 if _state_ is less than floor(_n_/2), and (_n_&minus;_state_)/(_state_+1) otherwise".
>
> **Example:** Let _P_<sub>0</sub>(_&lambda;_) = 2\*_&lambda;_\*(1&minus;_&lambda;_) and _P_<sub>1</sub>(_&lambda;_) = (4\*_&lambda;_\*(1&minus;_&lambda;_))<sup>2</sup>/2.  The goal is to produce 1 with probability _P_<sub>1</sub>(_&lambda;_) / (_P_<sub>0</sub>(_&lambda;_) + _P_<sub>1</sub>(_&lambda;_)). [**Preparing this function**](#Preparing_Rational_Functions) (along with noting that the maximum degree is _n_ = 4) results in the coefficient sums _R_ = (0, 2, 12, 2, 0).  Since _R_ begins and ends with 0, step 2 of the algorithm sets _state1_ and _state2_, respectively, to the position of the first or last nonzero item, namely 1 or 3.  (Alternatively, because _R_ begins and ends with 0, a third polynomial is included, namely the constant _P_<sub>2</sub>(_&lambda;_) = 0.001, so that the new coefficient sums would be _R&prime;_ = (0.001, 10.004, 12.006, 2.006, 0.001) \[formed by adding the coefficient 0.001\*choose(_n_, _i_) to the sum at _i_, starting at _i_ = 0].  Now run the algorithm using _R&prime;_, and if it returns 2 \[meaning that the constant polynomial was chosen], try again until the algorithm no longer returns 2.)

<a id=Certain_Power_Series></a>
#### Certain Power Series

Some functions can be written as&mdash; $$f(\lambda) = a_0 (g(\lambda))^0 + a_1 (g(\lambda))^1 + ... + a_i (g(\lambda))^i + ...,\tag{1}$$ where $a_i$ are _coefficients_ and $g(\lambda)$ is a function in the variable $\lambda$.  The right-hand side of (1) is called a _power series_ as long as $g(\lambda) = \lambda$.  A function writable as (1) will be called a _generalized power series_ here. Not all power series sum to a definite value, but all generalized power series that matter in this section do, and they must be Bernoulli factory functions.  (In particular, $g(\lambda)$ must be a Bernoulli factory function, too.)

Depending on the coefficients, different algorithms can be built to simulate a generalized power series:

- The coefficients are arbitrary, but can be split into two parts.
- The coefficients alternate in sign, and their absolute values form a decreasing sequence.
- The coefficients are nonnegative and sum to 1 or less.
- The coefficients are nonnegative and may sum to 1 or greater.

> **Note:** In theory, the series (1) can contain coefficients that are irrational numbers or sum to an irrational number, but the algorithms for such series can be inexact in practice.  Also, not all generalized power series that admit a Bernoulli factory are covered by the algorithms in this section.  They include:
>
> - Series with coefficients that alternate in sign, but do not satisfy the **general martingale algorithm** or **Algorithm 1** below.  This includes nearly all such series that equal 0 at 0 and 1 at 1, or equal 0 at 1 and 1 at 0. (An example is $\sin(\lambda\pi/2)$.)
> - Series with negative and positive coefficients that do not eventually alternate in sign (ignoring zeros).

**_Certain Alternating Series_**:

Suppose the following holds true for a generalized power series $f(\lambda)$:

- $f$ is written as in equation $(1)$.
- Suppose $(a_i)$ is the sequence formed from the coefficients of the series.
- Let $(d_j)$ be the sequence formed from $(a_i)$ by deleting the zero coefficients.  Then suppose that:
     - $d_0$ is greater than 0, and the elements in $(d_j)$ alternate in sign (example: 1/2, -1/3, 1/4, -1/5, ...).
     - The absolute values of $(d_j)$'s elements are 1 or less and form a nowhere increasing sequence that is finite or converges to 0.

In addition, the coefficients should be rational numbers.

> **Example:** Let $f(\lambda) = (1/2)\lambda^0 - (1/4)\lambda^2 + (1/8)\lambda^4 - ...$.  Then $(a_i) = (1/2, 0, -1/4, 0, 1/8, ...)$ (for example, $a_0 = 1/2$) and deleting the zeros leads to $(d_i) = (1/2, -1/4, 1/8, ...)$  (for example, $d_0 = 1/2$), which meets the requirements above.

Then the algorithm below, based on an algorithm by Łatuszyński et al. (2009/2011, especially section 3.1\)[^19], simulates $f(\lambda)$ given a coin that shows heads (returns 1) with probability $g(\lambda)$.

**General martingale algorithm:**

1. Set _u_ to abs($d_0$) ($d_0$ is the value of the first nonzero coefficient in the sequence $(a_i)$), set _w_ to 1, set _&#x2113;_ to 0, and set _n_ to 1.
2. Generate a uniform random variate between 0 and 1 _ret_.
3. Do the following process repeatedly, until this algorithm returns a value:
    1. If _w_ is not 0, run a Bernoulli factory algorithm for $g(\lambda)$ (if $g(\lambda) = \lambda$, this is done by flipping the input coin), then multiply _w_ by the result of the run.
    2. If $a_n$ is greater than 0: Set _u_ to _&#x2113;_ + _w_ * $a_n$, then, if no further nonzero coefficients follow $a_n$, set _&#x2113;_ to _u_.
    3. If $a_n$ is less than 0: Set _&#x2113;_ to _u_ &minus; _w_ * abs($a_n$), then, if no further nonzero coefficients follow $a_n$, set _u_ to _&#x2113;_.
    4. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  Otherwise, if _ret_ is less than _u_, add 1 to _n_.  Otherwise, return 0.  (If _ret_ is a uniform partially-sampled random number \[PSRN\], these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)

> **Notes:**
>
> 1. The **general martingale algorithm**, as it's called in this article, supports more functions than in section 3.1 of Łatuszyński et al. (2019/2011), which supports only functions writable as a power series whose coefficients alternate in sign and decrease in absolute value, with no zeros in between nonzero coefficients.  However, the general martingale algorithm uses that paper's framework.  A proof of its correctness is given in the appendix.
> 2. The **general martingale algorithm** allows the sequence $(a_i)$ to sum to 1, but in this case, it seems that the sequence's nonzero values must have the form $(1, -z_0, z_0, -z_1, z_1, ..., -z_i, z_i, ...)$, where the $z_i$ are positive, are no greater than 1, and form a nowhere increasing sequence that is finite or converges to 0.  Moreover, it appears that every power series with this sequence of coefficients is less than or equal to $\lambda$.

**_General Power Series_**:

Suppose the following for a generalized power series $f(\lambda)$:

- $f$ is written as in equation $(1)$.
- There is a rational number $Z$ defined as follows. For every $\lambda$ that satisfies $0 \le \lambda \le 1$, it is true that $0 \le f(\lambda) \le Z \lt 1$.
- There is an even integer $m$ defined as follows. The series in equation $(1)$ can be split into two parts: the first part ($A$) is the sum of the first $m$ terms, and the second part ($C$) is the sum of the remaining terms.  Moreover, both parts admit a Bernoulli factory algorithm (see "[**About Bernoulli Factories**](https://peteroupc.github.io/bernoulli.html#About_Bernoulli_Factories)" in the "Bernoulli Factory Algorithms" article).  Specifically: $$C(\lambda) = \sum_{i\ge m} a_i (g(\lambda))^i, A(\lambda) = f(\lambda) - C(\lambda).$$  As an example, if $C$ is a generalized power series described in the section "Certain Alternating Series", above, then $C$ admits a Bernoulli factory algorithm, namely the **general martingale algorithm**.

In addition, the algorithm will be simpler if each coefficient $a_i$ is a rational number.

Then rewrite the function as&mdash; $$f(\lambda) = A(\lambda) + (g(\lambda))^{m} B(\lambda),$$ where&mdash;

- $A(\lambda) = f(\lambda) - C(\lambda) = \sum_{i=0}^{m-1} a_i (g(\lambda))^i$ is a polynomial in $g(\lambda)$ of degree $m-1$, and
- $B(\lambda) = C(\lambda) / (g(\lambda))^{m} = \sum_{i\ge m} a_{m+i} (g(\lambda))^i$.

Rewrite $A$ as a polynomial in Bernstein form, in the variable $g(\lambda)$. (One way to transform a polynomial to Bernstein form, given the "power" coefficients $a_0, ..., a_{m-1}$, is the so-called "matrix method" from Ray and Nataraj (2012)[^20].)  Let $b_0, ..., b_{m-1}$ be the Bernstein-form polynomial's coefficients.  Then if those coefficients all lie in $[0, 1]$, then the following algorithm simulates $f(\lambda)$.

**Algorithm 1:** Run a [**linear Bernoulli factory**](https://peteroupc.github.io/bernoulli.html#Linear_Bernoulli_Factories), with parameters $x=2$, $y=1$, and $\epsilon=1-Z$.  Whenever the linear Bernoulli factory "flips the input coin", it runs the sub-algorithm below.

- **Sub-algorithm:** Generate an unbiased random bit.  If that bit is 1, sample the polynomial $A$ as follows (Goyal and Sigman 2012\)[^MATMP2]:
    1. Run a Bernoulli factory algorithm for $g(\lambda)$, $m-1$ times.  Let $j$ be the number of runs that return 1.
    2. With probability $b_j$, return 1.  Otherwise, return 0.

    If the bit is 0, do the following:

    1. Run a Bernoulli factory algorithm for $g(\lambda)$, $m$ times.  Return 0 if any of the runs returns 0.
    2. Run a Bernoulli factory algorithm for $B(\lambda)$, and return the result.

**_Series with Non-Negative Coefficients Summing to 1 or Less_**:

Now, suppose $f(\lambda)$ can be written as in equation $(1)$, at the beginning of this section, but this time, the _coefficients_ $a_i$ are 0 or greater and their sum is 1 or less.

If $g(\lambda) = \lambda$, this kind of function&mdash;

- satisfies $0\le f(\lambda)\le 1$ whenever 0 &le; _&lambda;_ &le; 1,
- is either constant or strictly increasing, and
- is _convex_ (its "slope" or "velocity" doesn't decrease as _&lambda;_ increases)[^21].

Suppose $f$ can be written as $f(\lambda)= f_0(g(\lambda))$, where&mdash; $$f_0(\lambda) = \sum_{n} a_n \lambda^n = \sum_{n} w(n) \frac{a_n}{w(n)}\lambda^n,$$ where each sum is taken over all nonnegative values of $n$ where $a_n > 0$. (For notation details, see "[**Implementation Notes**](#Implementation_Notes)".)

Then the key to simulating $f(\lambda)$ is to "tuck" the values $a_n$ under a function $w(n)$ such that&mdash;

- $1 \ge w(n)\ge a_n\ge 0$ for every allowed _n_, and
- $w(0)+w(1)+...=1$ (required for a valid distribution of integers 0 or greater).

> **Notes:**
>
> 1. Assuming $f_0(1)$ does not equal 0, an appropriate $w(n)$ is trivial to find &mdash; $w(n)=a_n/f_0(1)$ (because $a_n \le f_0(1)$ for every allowed $n$).  But in general, this can make $w(n)$ an irrational number and thus harder to handle with arbitrary precision.
> 2. If the coefficients $a_n$ sum to 1, then $w(n)$ can equal $a_n$.  In this case, $f_0(\lambda)$ is what's called the _probability generating function_ for getting $X$ with probability $a_X$ (or $w(X)$), and the expected value ("long-run average") of $X$ equals the "slope" of $f_0(\lambda)$ at 1.  See also (Dughmi et al. 2021)[^22].
> 3. Assuming $f_0(1)$ is an irrational number, $w(n)$ can equal $a_n + c_n/2^n$, where $c_n$ is the $n$-th base-2 digit after the point in the binary expansion of $1 - f_0(1)$ (or 0 if $n=0$).  Here, a number's _binary expansion_ is written as `0.bbbbb...` in base 2, where each `b` is a base-2 digit (either 0 or 1).  See my [**Stack Exchange question**](https://math.stackexchange.com/questions/4495216).

Once $a_n$ and $w(n)$ are found, the function $f(\lambda)$ can be simulated using the following algorithm, which takes advantage of the [**convex combination method**](https://peteroupc.github.io/bernoulli.html#Convex_Combinations).

**Algorithm 2:**

1. Choose at random an integer _n_ that equals _i_ with probability $w(i)$.
2. (The next two steps succeed with probability $\frac{a_n}{w(n)} (g(\lambda))^n$.) Let _P_ be $a_n/w(n)$.  With probability _P_, go to the next step.  Otherwise, return 0.
3. (At this point, _n_ equals _i_ with probability $a_i$.) Run a Bernoulli factory algorithm for $g(\lambda)$, _n_ times or until a run returns 0, whichever happens first. (For example, if $g(\lambda)=\lambda$, flip the input coin each time.)  Return 1 if all the runs, including the last, returned 1 (or if _n_ is 0).  Otherwise, return 0.

Step 1 is rather general, and doesn't fully describe how to generate the value $n$ at random.  That depends on the function $w(n)$.  See "[**Power Series Examples**](#Power_Series_Examples)", later, for examples of generalized power series $f(\lambda)$ that can be simulated using Algorithm 2.

> **Note:** Part of **Algorithm 2** involves choosing $X$ at random with probability $w(X)$, then doing $X$ coin flips.  Thus, the algorithm uses, on average, at least the number of unbiased random bits needed to generate $X$ on average (Knuth and Yao 1976\)[^23].

**Algorithm 2** covers an algorithm that was given by Luis Mendo (2019)[^24] for simulating certain functions writable as power series, but that works only if the coefficients sum to 1 or less and only if coefficient 0 ($a_0$) is 0.

To get to an algorithm equivalent to Mendo's, first **Algorithm 2** is modified to simulate $f_0(\lambda)$/_CS_ as follows, where _CS_ is the sum of all coefficients $a_i$, starting with $i=1$.  This shows Mendo's algorithm, like **Algorithm 2**, is actually a special case of the [**convex combination algorithm**](https://peteroupc.github.io/bernoulli.html#Convex_Combinations).

- Step 1 of **Algorithm 2** becomes: "(1a.) Set _dsum_ to 0 and $n$ to 1; (1b.) With probability $a_n$/(_CS_ &minus; _dsum_), go to step 2. Otherwise, add $a_n$ to _dsum_; (1c.) Add 1 to _i_ and go to step 1b." (Choose at random $n$ with probability $w(n)=a_n$/_CS_.)
- Step 2 becomes "Go to step 3". (The _P_ in **Algorithm 2** is not used; it's effectively $w(n)/\frac{a_n}{CS}=\frac{a_n}{CS}/\frac{a_n}{CS} = 1$.)
- In step 3, $g(\lambda)$ is either $\lambda$ (flip the input coin) or $1-\lambda$ (flip the input coin and take 1 minus the flip).

Mendo's algorithm and extensions of it mentioned by him cover several variations of functions writable as power series as follows:

| Type |   Power Series  |   Algorithm  |
  --- | --- | --- |
| 1 | $f(\lambda)=1-f_0(1-\lambda)$ | With probability _CS_, run the modified algorithm with $g(\lambda)=1-\lambda$ and return 1 minus the result.  Otherwise, return 1. |
| 2 | $f(\lambda)=f_0(1-\lambda)$ | With probability _CS_, run the modified algorithm with $g(\lambda)=1-\lambda$ and return the result.  Otherwise, return 0. |
| 3 | $f(\lambda)=f_0(\lambda)$ | With probability _CS_, run the modified algorithm with $g(\lambda)=\lambda$ and return the result.  Otherwise, return 0. |
| 4 | $f(\lambda)=1-f_0(\lambda)$ | With probability _CS_, run the modified algorithm with $g(\lambda)=\lambda$ and return 1 minus the result.  Otherwise, return 1. |

The conditions on $f$ given above mean that&mdash;

- for series of type 1, _f_(0) = 1&minus;_CS_ and _f_(1) = 1 (series of type 1 with _CS_=1 is the main form in Mendo's paper),
- for series of type 2, _f_(0) = _CS_ and _f_(1) = 0,
- for series of type 3, _f_(0) = 0 and _f_(1) = _CS_, and
- for series of type 4, _f_(0) = 1 and _f_(1) = 1&minus;_CS_.

**_Series with General Non-Negative Coefficients_**:

If $f$ is written as equation (1), in the beginning of this section, but&mdash;

- each of the coefficients is positive or zero, and
- the coefficients sum to greater than 1,

then Nacu and Peres (2005, proposition 16\)[^19] gave an algorithm which takes the following parameters:

- _t_ is a rational number such that _B_ &lt; _t_ &le; 1 and  _f_(_t_) < 1.
- _&#x03F5;_ is a rational number such that 0 &lt; _&#x03F5;_ &le; (_t_ &minus; _B_)/2.

_B_ is not a parameter, but is the maximum allowed value for $g(\lambda)$ (probability of heads), and is greater than 0 and less than 1.  The following algorithm is based on that algorithm, but runs a Bernoulli factory for $g(\lambda)$ instead of flipping the input coin with probability of heads $\lambda$.

1. Create a _&nu;_ input coin that does the following: "(1) Set _n_ to 0. (2) With probability _&#x03F5;_/_t_, go to the next substep.  Otherwise, add 1 to _n_ and repeat this substep. (3) With probability 1 &minus; $a_n\cdot t^n$, return 0. (4) Run a [**linear Bernoulli factory**](https://peteroupc.github.io/bernoulli.html#Linear_Bernoulli_Factories) _n_ times, _x_/_y_ = 1/(_t_ &minus; _&#x03F5;_), and _&#x03F5;_ = _&#x03F5;_.  If the linear Bernoulli factory would flip the input coin, the coin is 'flipped' by running a Bernoulli factory for $g(\lambda)$.  If any run of the linear Bernoulli factory returns 0, return 0.  Otherwise, return 1."
2. Run a [**linear Bernoulli factory**](https://peteroupc.github.io/bernoulli.html#Linear_Bernoulli_Factories) once, using the _&nu;_ input coin described earlier, _x_/_y_ = _t_/_&#x03F5;_, and _&#x03F5;_ = _&#x03F5;_, and return the result.

**_Power Series Examples_**:

Examples 1 to 4 show how **Algorithm 1** leads to algorithms for simulating certain factory functions.

> **Note:** In the SymPy computer algebra library, the `series(func, x, n=20)` method computes the terms of a function's power series up to the term with $x^{19}$.  An example is: `series(sin(x), x, n=20)`.

**Example 1:** Take $f(\lambda) = \sin(3\lambda)/2$, which is writable as a power series.

- $f$ is less than or equal to $Z=1/2 \lt 1$.
- $f$ satisfies $m=8$ since splitting the series at 8 leads to two functions that admit Bernoulli factories.
- Thus, $f$ can be written as&mdash; $$f(\lambda) = A(\lambda) + \lambda^8 \left(\sum_{i\ge 0} a_{8+i} \lambda^i\right),$$ where $a_i = \frac{3^i}{i! \times 2}(-1)^{(i-1)/2}$ if $i$ is odd and 0 otherwise.
- $A$ is rewritten from "power" form (with coefficients $a_0, ..., a_{m-1}$) to Bernstein form, with the following coefficients, in order: [0, 3/14, 3/7, 81/140, 3/5, 267/560, 81/280, 51/1120].
- Now, **Algorithm 1** can be used to simulate $f$ given a coin that shows heads (returns 1) with probability $\lambda$, where:
    - $g(\lambda) = \lambda$, so the Bernoulli factory algorithm for $g(\lambda)$ is simply to flip the coin for $\lambda$.
    - The coefficients $b_0, ..., b_{m-1}$, in order, are the Bernstein-form coefficients found for $A$.
    - The Bernoulli factory algorithm for $B(\lambda)$ is as follows: Let $h_i = a_i$.  Then run the **general martingale algorithm** with $g(\lambda) = \lambda$ and $a_i = h_{m+i}$.

**Example 2:** Take $f(\lambda) = 1/2 + \sin(6\lambda)/4$, rewritable as another power series.

- $f$ is less than or equal to $Z=3/4 \lt 1$.
- $f$ satisfies $m=16$ since splitting the series at 16 leads to two functions that admit Bernoulli factories.
- Thus, $f$ can be written as&mdash; $$f(\lambda) = A(\lambda) + \lambda^{m} \left(\sum_{i\ge 0} a_{m+i} \lambda^i\right),$$ where $m=16$, and where $a_i$ is $1/2$ if $i = 0$; $\frac{6^i}{i! \times 4}(-1)^{(i-1)/2}$ if $i$ is odd; and 0 otherwise.
- $A$ is rewritten from "power" form (with coefficients $a_0, ..., a_{m-1}$) to Bernstein form, with the following coefficients, in order: [1/2, 3/5, 7/10, 71/91, 747/910, 4042/5005, 1475/2002, 15486/25025, 167/350, 11978/35035, 16869/70070, 167392/875875, 345223/1751750, 43767/175175, 83939/250250, 367343/875875].
- Now, **Algorithm 1** can be used to simulate $f$ in the same manner as for Example 1.

**Example 3:** Take $f(\lambda) = 1/2 + \sin(\pi\lambda)/4$.  To simulate this probability:

1. Create a _&mu;_ coin that does the following: "With probability 1/3, return 0.  Otherwise, run the algorithm for **_&pi;_/4** (in 'Bernoulli Factory Algorithms') and return the result." (Simulates _&pi;_/6.)
2. Run the algorithm for $1/2 + \sin(6\lambda)/4$ in Example 2, using the _&mu;_ coin.

**Example 4:** Take $f(\lambda) = 1/2 + \cos(6\lambda)/4$.  This is as in Example 2, except&mdash;

- $Z=3/4$ and $m=16$;
- $a_i$ is $3/4$ if $i = 0$; $\frac{6^i}{i! \times 4}(-1)^{i/2}$ if $i$ is even and greater than 0; and 0 otherwise; and
- the Bernstein-form coefficients for $A$, in order, are [3/4, 3/4, 255/364, 219/364, 267/572, 1293/4004, 4107/20020, 417/2860, 22683/140140, 6927/28028, 263409/700700, 2523/4900, 442797/700700, 38481/53900, 497463/700700].

**Example 5:** Take $f(\lambda) = 1/2 + \cos(\pi\lambda)/4$.  This is as in Example 3, except step 2 runs the algorithm for $1/2 + \cos(6\lambda)/4$ in Example 4.

**Examples 6:** The following functions can be written as power series that satisfy the **general martingale algorithm**.  In the table, $B(i)$ is the $i$<sup>th</sup> _Bernoulli number_ (see the note after the table), and ${n \choose m}$ = choose($n$, $m$) is a binomial coefficient.

| Function $f(\lambda)$ | Coefficients | Value of $d_0$ |
  --- | --- | --- |
| $\lambda/(\exp(\lambda)-1)$ |  $a_i = -1/2$ if $i=1$, or $B(i)/(i!)$ otherwise. |  1. |
| Hyperbolic tangent: $\tanh(\lambda)$ |  $a_i = \frac{B(i+1) 2^{i+1} (2^{i+1}-1)}{(i+1)!}$ if $i$ is odd[^25], or 0 otherwise. |  1. |
| $\cos(\sqrt \lambda)$ |  $a_i = \frac{(-1)^i}{(2i)!}$. |  1. |
| $\sum_{i\ge 0} a_i x^i$ ([**source**](https://math.stackexchange.com/questions/855517)) | $a_i = \frac{(-1)^i 4^i}{(2i+1)^2 {2i \choose i}}$. | 1. |

To simulate a function in the table, run the **general martingale algorithm** with $g(\lambda) = \lambda$ and with the given coefficients and value of $d_0$ ($d_0$ is the first nonzero coefficient).

> **Note:** Bernoulli numbers can be computed with the following algorithm, namely **Get the _m_<sup>th</sup> Bernoulli number**:
>
> 1. If _m_ is 0, 1, 2, 3, or 4, return 1, 1/2, 1/6, 0, or &minus;1/30, respectively.  Otherwise, if _m_ is odd[^25], return 0.
> 2. Set _i_ to 2 and _v_ to 1 &minus; (_m_+1)/2.
> 3. While _i_ is less than _m_:
>     1. **Get the _i_<sup>th</sup> Bernoulli number**, call it _b_.  Add _b_\*choose(_m_+1, _i_) to _v_.
>     2. Add 2 to _i_.
> 4. Return &minus;_v_/(_m_+1).

Examples 7 to 9 use **Algorithm 2** to simulate generalized power series where the coefficients $a_0$ are nonnegative.

**Example 7:** The hyperbolic cosine minus 1, denoted as cosh(_&lambda;_)&minus;1, can be written as follows: $$f(\lambda)=\cosh(\lambda)-1 = \sum_{n} a_n \lambda^n = \sum_{n} w(n) \frac{a_n \lambda^n}{w(n)},$$ where:

- Each sum given above is taken over all values of _n_ that can occur after step 1 is complete (in this case, all values of _n_ that are even and greater than 0).
- $a_n$ is $1/(n!)$.[^26]
- The coefficients $a_n$ are tucked under a function $w(n)$, which in this case is $\frac{1}{2^{n-2}}$ if _n_&gt;0 and _n_ is even[^27], or 0 otherwise.

For this particular function:

- Step 1 of **Algorithm 2** can read: "(1a.) Generate unbiased random bits (each bit is 0 or 1 with equal probability) until a zero is generated this way, then set _n_ to the number of ones generated this way; (1b.) Set _n_ to 2\*_n_ + 2."
- In step 2, _P_ is $a_n/w(n) = \frac{1}{n!} / \frac{1}{2^{n-2}} = \frac{2^{n/2}}{n!}$ for each allowed $n$.
- In step 3, $g(\lambda)$ is simply $\lambda$.

**Examples 8:** cosh(_&lambda;_)&minus;1 and additional target functions are shown in the following table.  (In the table below, $w(n)=1/(2^{z^{-1}(n)+1})$ where $z^{-1}(n)$ is the inverse of the "Step 1b" column, and the $g(\lambda)$ in step 3 is simply $\lambda$.)

| Target function _f_(_&lambda;_) | Step 1b in **Example 7** reads "Set _n_ to ..." | $a_n$ | $w(n)$ | Value of _P_ |
  ------- | -------- | --- | --- | --- |
| cosh(_&lambda;_)&minus;1. | 2\*_n_ + 2. | 1/(_n_!). | 1/(2<sup>(n&minus;2)/2+1</sup>). | 2<sup>_n_/2</sup>/(_n_!). |
| exp(_&lambda;_/4)/2. | _n_. | 1/(_n_!\*2\*4<sup>_n_</sup>) | 1/(2<sup>_n_+1</sup>). |  1/(2<sup>_n_</sup>\*(_n_!)). |
| exp(_&lambda;_)/4. | _n_. | 1/(_n_!\*4). | 1/(2<sup>_n_+1</sup>). | 2<sup>_n_&minus;1</sup>/(_n_!). |
| exp(_&lambda;_)/6. | _n_. | 1/(_n_!\*6). | 1/(2<sup>_n_+1</sup>). | 2<sup>_n_</sup>/(3\*(_n_!)). |
| exp(_&lambda;_/2)/2. | _n_. | 1/(_n_!\*2\*2<sup>_n_</sup>) | 1/(2<sup>_n_+1</sup>). |1/(_n_!). |
| (exp(_&lambda;_)&minus;1)/2. | _n_ + 1. | 1/((_n_+1)!\*4). | 1/(2<sup>_n_</sup>). |2<sup>_n_&minus;1</sup>/(_n_!). |
| sinh(_&lambda;_)/2 | 2\*_n_ + 1. | 1/(_n_!\*2). | 1/(2<sup>(_n_&minus;1)/2+1</sup>). | 2<sup>(_n_&minus;1)/2</sup>/(_n_!). |
| cosh(_&lambda;_)/2 | 2\*_n_. | 1/(_n_!\*2). | 1/(2<sup>_n_/2+1</sup>). |2<sup>_n_/2</sup>/(_n_!). |

> **Note:** sinh(_&lambda;_) is the hyperbolic sine function.

**Examples 9:** The table below shows generalized power series shifted downward and shows the algorithm changes needed to simulate the modified function.  In the table, _D_ is a rational number such that 0 &le; _D_ &le; _&phi;_(0), where _&phi;_(.) is the original function.

| Original function (_&phi;_(_&lambda;_)) | Target function _f_(_&lambda;_) | Step 1b in **Example 7** reads "Set _n_ to ..." | Value of _P_ |
  ------- | -------- | --- | --- |
| exp(_&lambda;_)/4. | _&phi;_(_&lambda;_) &minus; _D_. | _n_. | (1/4&minus;_D_)\*2 or (_&phi;_(0)&minus;_D_)\*2 if _n_ = 0;<br>2<sup>_n_&minus;1</sup>/(_n_!) otherwise. |
| exp(_&lambda;_)/6.  | _&phi;_(_&lambda;_) &minus; _D_. | _n_. | (1/6&minus;_D_)\*2 if _n_ = 0;<br>2<sup>_n_</sup>/(3\*(_n_!)) otherwise. |
| exp(_&lambda;_/2)/2.  | _&phi;_(_&lambda;_) &minus; _D_. | _n_. | (1/2&minus;_D_)\*2 if _n_ = 0;<br>1/(_n_!) otherwise. |
| cosh(_&lambda;_)/4. | _&phi;_(_&lambda;_) &minus; _D_. | 2\*_n_. | (1/4&minus;_D_)\*2 if _n_ = 0;<br>2<sup>_n_/2</sup>/(2\*(_n_!)) otherwise. |

**Example 10:** Let $f = \exp(\lambda)/3$.  Then this function is a generalized power series, with nonnegative coefficients, which can be tucked under probabilities of the form $w(n) = \left(\frac{2}{3}(1-\frac{2}{3})^n\right)$.

- Step 1 of **Algorithm 2** can read: "(1a.) Set _n_ to 0.  (1b.) With probability 2/3, go to substep 1c.  Otherwise, add 1 to _n_ and repeat this substep. (1c.) Set _n_ to _n_."
- In step 2, _P_ is $a_n/w(n) = \frac{1}{3\cdot n!} / \left(\frac{2}{3}(1-\frac{2}{3})^n\right) = \frac{(3/2)^{n + 1}}{n!}$ for each allowed $n$.
- In step 3, $g(\lambda)$ is simply $\lambda$.

**Example 11:** Let $f(\lambda)=\exp(\lambda)\cdot (1-\lambda)$.  Run Mendo's algorithm for series of type 1, with $a_i = \frac{i-1}{i!}$ and $CS = 1$.

<a id=General_Factory_Functions></a>
#### General Factory Functions

A coin with unknown probability of heads of _&lambda;_ can be turned into a coin with probability of heads of _f_(_&lambda;_), where _f_ is any factory function, via an algorithm that builds randomized bounds on _f_(_&lambda;_) based on the outcomes of the coin flips.  These randomized bounds come from two sequences of polynomials:

- One sequence of polynomials converges from above to _f_, the other from below.
- For each sequence, the polynomials must have increasing degree.
- The polynomials are written in _Bernstein form_ (see "[**Certain Polynomials**](#Certain_Polynomials)").
- For each _n_, the degree-_n_ polynomials' coefficients must lie at or "inside" those of the previous upper polynomial and the previous lower one (once the polynomials are elevated to degree _n_).

The following algorithm can be used to simulate factory functions via polynomials.  In the algorithm:

- **fbelow**(_n_, _k_) is a lower bound of the _k_<sup>th</sup> coefficient for a degree-_n_ polynomial in Bernstein form that comes close to _f_ from below, where 0 &le; _k_ &le; _n_.  For example, this can be _f_(_k_/_n_) minus a constant that depends on _n_. (See note 1 below.)
- **fabove**(_n_, _k_) is an upper bound of the _k_<sup>th</sup> coefficient for a degree-_n_ polynomial in Bernstein form  that comes close to _f_ from above.  For example, this can be _f_(_k_/_n_) plus a constant that depends on _n_. (See note 1.)

The algorithm implements the reverse-time martingale framework (Algorithm 4) in Łatuszyński et al. (2009/2011\)[^19] and the degree-doubling suggestion in Algorithm I of Flegal and Herbei (2012\)[^28], although an error in Algorithm I is noted below.  The first algorithm follows.

1. Generate a uniform random variate between 0 and 1, call it _ret_.
2. Set _&#x2113;_ and _&#x2113;t_ to 0.  Set _u_ and _ut_ to 1. Set _lastdegree_ to 0, and set _ones_ to 0.
3. Set _degree_ so that the first pair of polynomials has degree equal to _degree_ and has coefficients all lying in [0, 1].  For example, this can be done as follows: Let **fbound**(_n_) be the minimum value for **fbelow**(_n_, _k_) and the maximum value for **fabove**(_n_,_k_) with _k_ in the interval \[0, _n_\]; then set _degree_ to 1; then while **fbound**(_degree_\) returns an upper or lower bound that is less than 0 or greater than 1, multiply _degree_ by 2; then go to the next step.
4. Set _startdegree_ to _degree_.
5. (The remaining steps are now done repeatedly until the algorithm finishes by returning a value.) Flip the input coin _t_ times, where _t_ is _degree_ &minus; _lastdegree_.  For each time the coin returns 1 this way, add 1 to _ones_.
6. Calculate _&#x2113;_ and _u_ as follows:
    1. Define **FB**(_a_, _b_) as follows: Let _c_ be choose(_a_, _b_). (Optionally, multiply _c_ by 2<sup>_a_</sup>; see note 3.)  Calculate **fbelow**(_a_, _b_) as lower and upper bounds _LB_ and _UB_ that are accurate enough that floor(_LB_\*_c_) = floor(_UB_\*_c_), then return floor(_LB_\*_c_)/_c_.
    2. Define **FA**(_a_, _b_) as follows: Let _c_ be choose(_a_, _b_). (Optionally, multiply _c_ by 2<sup>_a_</sup>; see note 3.)  Calculate **fabove**(_a_, _b_) as lower and upper bounds _LB_ and _UB_ that are accurate enough that ceil(_LB_\*_c_) = ceil(_UB_\*_c_), then return ceil(_LB_\*_c_)/_c_.
    3. Set _&#x2113;_ to **FB**(_degree_, _ones_) and set _u_ to **FA**(_degree_, _ones_).
7. (This step and the next find the means of the previous _&#x2113;_ and of _u_ given the current coin flips.) If _degree_ equals _startdegree_, set _&#x2113;s_ to 0 and _us_ to 1. (Algorithm I of Flegal and Herbei 2012 doesn't take this into account.)
8. If _degree_ is greater than _startdegree_:
    1. Let _nh_ be choose(_degree_, _ones_), and let _k_ be min(_lastdegree_, _ones_).
    2. Set _&#x2113;s_ to $\sum_{j=0}^k$ **FB**(_lastdegree_,_j_)\*choose(_degree_&minus;_lastdegree_, _ones_&minus;_j_)\*choose(_lastdegree_,_j_)/_nh_.
    3. Set _us_ to $\sum_{j=0}^k$ **FA**(_lastdegree_,_j_)\*choose(_degree_&minus;_lastdegree_, _ones_&minus;_j_)\*choose(_lastdegree_,_j_)/_nh_.
9. Let _m_ be (_ut_&minus;_&#x2113;t_)/(_us_&minus;_&#x2113;s_).  Set _&#x2113;t_ to _&#x2113;t_+(_&#x2113;_&minus;_&#x2113;s_)\*_m_, and set _ut_ to _ut_&minus;(_us_&minus;_u_)\*_m_.
10. If _ret_ is less than (or equal to) _&#x2113;t_, return 1.  If _ret_ is less than _ut_, go to the next step.  If neither is the case, return 0.  (If _ret_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
11. (Find the next pair of polynomials and restart the loop.) Set _lastdegree_ to _degree_, then increase _degree_ so that the next pair of polynomials has degree equal to a higher value of _degree_ and gets closer to the target function (for example, multiply _degree_ by 2).  Then, go to step 5.

Another algorithm, given in Thomas and Blanchet (2012\)[^11], was based on the one from Nacu and Peres (2005\)[^16].  That algorithm is not given here, however.

> **Notes:**
>
> 1. The efficiency of this algorithm depends on many things, including how "smooth" _f_ is (Holtz et al. 2011)[^29] and how easy it is to calculate the appropriate values for **fbelow** and **fabove**.  The best way to implement **fbelow** and **fabove** for a given function _f_ will require a deep mathematical analysis of that function.  For more information, see my [**Supplemental Notes on Bernoulli Factories**](https://peteroupc.github.io/bernsupp.html).
> 2. In some cases, a single pair of polynomial sequences may not converge quickly to the desired function _f_, especially when _f_ is not "smooth" enough.  An intriguing suggestion from Thomas and Blanchet (2012\)[^11] is to use multiple pairs of polynomial sequences that converge to _f_, where each pair is optimized for particular ranges of _&lambda;_: first flip the input coin several times to get a rough estimate of _&lambda;_, then choose the pair that's optimized for the estimated _&lambda;_, and run either algorithm in this section on that pair.
> 3. Normally, the algorithm works only if 0 &lt; _&lambda;_ &lt; 1. If _&lambda;_ can be 0 or 1 (meaning the input coin is allowed to return 1 every time or 0 every time), then based on a suggestion in Holtz et al. (2011\)[^29], the _c_ in **FA** and **FB** can be multiplied by 2<sup>_a_</sup> (as shown in step 6) to ensure correctness for every value of _&lambda;_.

<a id=Algorithms_for_General_Irrational_Constants></a>
### Algorithms for General Irrational Constants

This section shows general-purpose algorithms to generate heads with a probability equal to an _irrational number_ (a number that isn't a ratio of two integers), when that number is known by its digit or series expansion, continued fraction, or continued logarithm.

But on the other hand, probabilities that are _rational_ constants are trivial to simulate.  If fair coins are available, the `ZeroOrOne` method, which is described in my article on [**random sampling methods**](https://peteroupc.github.io/randomfunc.html#Boolean_True_False_Conditions), should be used.  If coins with unknown probability of heads are available, then a [**_randomness extraction_**](https://peteroupc.github.io/randextract.html) method should be used to turn them into fair coins.

<a id=Digit_Expansions></a>
#### Digit Expansions

Probabilities can be expressed as a digit expansion (of the form `0.dddddd...`).  The following algorithm returns 1 with probability `p` and 0 otherwise, where 0 &le; `p` &lt; 1.  (The number 0 is also an infinite digit expansion of zeros, and the number 1 is also an infinite digit expansion of base-minus-ones.)  Irrational numbers always have infinite digit expansions, which must be calculated "on-the-fly".

In the algorithm (see also (Brassard et al., 2019\)[^29], (Devroye 1986, p. 769\)[^30]), `BASE` is the digit base, such as 2 for binary or 10 for decimal.

1. Set `u` to 0 and `k` to 1.
2. Set `u` to `(u * BASE) + v`, where `v` is a uniform random integer in the interval [0, `BASE`) (if `BASE` is 2, then `v` is simply an unbiased random bit).  Calculate `pa`, which is an approximation to `p` such that abs(`p`&minus;`pa`) &le; `BASE`<sup>&minus;`k`</sup>.  Set `pk` to `pa`'s digit expansion up to the `k` digits after the point.  Example: If `p` is _&pi;_/4, `BASE` is 10, and `k` is 5, then `pk = 78539`.
3. If `pk + 1 <= u`, return 0.[^31] If `pk - 2 >= u`, return 1.  If neither is the case, add 1 to `k` and go to step 2.

<a id=Continued_Fractions></a>
#### Continued Fractions

A _simple continued fraction_ is a way to write a real number between 0 and 1. A simple continued fraction has the form&mdash; $0 + 1 / (_a_\[1\] + 1 / (_a_\[2\] + 1 / (_a_\[3\] + ... ))),$ where the _a_\[_i_\] are the _partial denominators_, none of which may have an absolute value less than 1.

Inspired by (Flajolet et al., 2010, "Finite graphs (Markov chains) and rational functions"\)[^1], I developed the following algorithm.

**Algorithm 1.** The following algorithm simulates a probability expressed as a simple continued fraction.  This algorithm works only if each _a_\[_i_\]'s absolute value is 1 or greater and _a_\[1\] is greater than 0, but otherwise, each  _a_\[_i_\] may be negative and/or a non-integer.  The algorithm begins with _pos_ equal to 1.  Then the following steps are taken.

1. Set _k_ to _a_\[_pos_\].
2. If the partial denominator at _pos_ is the last, return a number that is 1 with probability 1/_k_ and 0 otherwise.
3. If _a_\[_pos_\] is less than 0, set _kp_ to _k_ &minus; 1 and _s_ to 0.  Otherwise, set _kp_ to _k_ and _s_ to 1. (This step accounts for negative partial denominators.)
4. Do the following process repeatedly until this run of the algorithm returns a value:
    1. With probability _kp_/(1+_kp_), return a number that is 1 with probability 1/_kp_ and 0 otherwise.
    2. Do a separate run of the currently running algorithm, but with _pos_ = _pos_ + 1.  If the separate run returns _s_, return 0.

**Algorithm 2.**

A _generalized continued fraction_ has the form 0 + _b_\[1\] / (_a_\[1\] + _b_\[2\] / (_a_\[2\] + _b_\[3\] / (_a_\[3\] + ... ))).  The _a_\[_i_\] are the same as before, but the _b_\[_i_\] are the _partial numerators_. The following are two algorithms to simulate a probability in the form of a generalized continued fraction.

The following algorithm works only if each ratio _b_\[_i_\]/_a_\[_i_\] has an absolute value of 1 or less, but otherwise, each _b_\[_i_\] and each  _a_\[_i_\] may be negative and/or a non-integer.  This algorithm employs an equivalence transform from generalized to simple continued fractions.  The algorithm begins with _pos_ and _r_ both equal to 1.  Then the following steps are taken.

1. Set _r_ to 1 / (_r_ * _b_\[_pos_\]), then set _k_ to _a_\[_pos_\] * _r_. (_k_ is the partial denominator for the equivalent simple continued fraction.)
2. If the partial numerator/denominator pair at _pos_ is the last, return a number that is 1 with probability 1/abs(_k_) and 0 otherwise.
3. Set _kp_ to abs(_k_) and _s_ to 1.
4. Set _r2_ to 1 / (_r_ * _b_\[_pos_ + 1\]).  If _a_\[_pos_ + 1\] * _r2_ is less than 0, set _kp_ to _kp_ &minus; 1 and _s_ to 0. (This step accounts for negative partial numerators and denominators.)
5. Do the following process repeatedly until this run of the algorithm returns a value:
    1. With probability _kp_/(1+_kp_), return a number that is 1 with probability 1/_kp_ and 0 otherwise.
    2. Do a separate run of the currently running algorithm, but with _pos_ = _pos_ + 1 and _r_ = _r_.  If the separate run returns _s_, return 0.

**Algorithm 3.** This algorithm works only if each ratio _b_\[_i_\]/_a_\[_i_\] is 1 or less and if each _b_\[_i_\] and each  _a_\[_i_\] is greater than 0, but otherwise, each _b_\[_i_\] and each _a_\[_i_\] may be a non-integer.  The algorithm begins with _pos_ equal to 1.  Then the following steps are taken.

1. If the partial numerator/denominator pair at _pos_ is the last, return a number that is 1 with probability _b_\[_pos_\]/_a_\[_pos_\] and 0 otherwise.
2. Do the following process repeatedly until this run of the algorithm returns a value:
    1. With probability _a_\[_pos_\]/(1 + _a_\[_pos_\]), return a number that is 1 with probability _b_\[_pos_\]/_a_\[_pos_\] and 0 otherwise.
    2. Do a separate run of the currently running algorithm, but with _pos_ = _pos_ + 1.  If the separate run returns 1, return 0.

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
> - The following is an alternative way to write Algorithm 1, which better shows the inspiration because it shows how the so-called "even-parity construction"[^32] \(or the two-coin algorithm) as well as the "1 &minus; _x_" construction can be used to develop rational number simulators that are as big as their continued fraction expansions, as suggested in the cited part of the Flajolet paper.  However, it only works if the size of the continued fraction expansion (here, _size_) is known in advance.
>     1. Set _i_ to _size_.
>     2. Create an input coin that does the following: "Return a number that is 1 with probability 1/_a_\[_size_\] or 0 otherwise".
>     3. While _i_ is 1 or greater:
>         1. Set _k_ to _a_\[_i_\].
>         2. Create an input coin that takes the previous input coin and _k_ and does the following: "(a) With probability _k_/(1+_k_), return a number that is 1 with probability 1/_k_ and 0 otherwise; (b) Flip the previous input coin.  If the result is 1, return 0.  Otherwise, go to step (a)".  (The probability _k_/(1+_k_) is related to _&lambda;_/(1+_&lambda;_) = 1 &minus; 1/(1+_&lambda;_), which involves the even-parity construction&mdash;or the two-coin algorithm&mdash;for 1/(1+_&lambda;_) as well as complementation for "1 &minus; _x_".)
>         3. Subtract 1 from _i_.
>     4. Flip the last input coin created by this algorithm, and return the result.

<a id=Continued_Logarithms></a>
#### Continued Logarithms

The _continued logarithm_ (Gosper 1978\)[^33], (Borwein et al., 2016\)[^34] of a number greater than 0 and less than 1 has the following continued fraction form: 0 + (1 / 2<sup>_c_\[1\]</sup>) / (1 + (1 / 2<sup>_c_\[2\]</sup>) / (1 + ...)), where _c_\[_i_\] are the coefficients of the continued logarithm and all 0 or greater.  I have come up with the following algorithm that simulates a probability expressed as a continued logarithm expansion.

The algorithm begins with _pos_ equal to 1.  Then the following steps are taken.

1. If the coefficient at _pos_ is the last, return a number that is 1 with probability 1/(2<sup>_c_\[_pos_\]</sup>) and 0 otherwise.
2. Do the following process repeatedly until this run of the algorithm returns a value:
    1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return a number that is 1 with probability 1/(2<sup>_c_\[_pos_\]</sup>) and 0 otherwise.
    2. Do a separate run of the currently running algorithm, but with _pos_ = _pos_ + 1.  If the separate run returns 1, return 0.

For a correctness proof, see the appendix.

<a id=Certain_Algebraic_Numbers></a>
#### Certain Algebraic Numbers

A method to sample a probability equal to a polynomial's root appears in a French-language article by Penaud and Roques (2002\)[^35].  The following is an implementation of that method, using the discussion in the paper's section 1 and Algorithm 2, and incorporates a correction to Algorithm 2.  The algorithm takes a polynomial as follows:

- It has the form _P_(_x_) = _a_\[0\]\*_x_<sup>0</sup> + _a_\[1\]\*_x_<sup>1</sup> + ... + _a_\[_n_\]\*_x_<sup>_n_</sup>, where _a_\[_i_\], the _coefficients_, are all rational numbers, and 0 &le; _x_ &le; 1.
- It equals 0 (has a _root_) at exactly one point, and that point is greater than 0 and less than 1.

And the algorithm returns 1 with probability equal to the root, and 0 otherwise.  The root _R_ is known as an _algebraic number_ because it satisfies the polynomial equation _P_(_R_) = 0.  The algorithm follows.

1. Set _r_ to 0 and _d_ to 2.
2. Do the following process repeatedly, until this algorithm returns a value:
    1. Generate an unbiased random bit, call it _z_.
    2. Set _t_ to (_r_\*2+1)/_d_.
    3. If _P_(0) > 0:
        1. If _z_ is 1 and _P_(_t_) is less than 0, return 0.
        2. If _z_ is 0 and _P_(_t_) is greater than 0, return 1.
    4. If _P_(0) < 0:
        1. If _z_ is 1 and _P_(_t_) is greater than 0, return 0.
        2. If _z_ is 0 and _P_(_t_) is less than 0, return 1.
    5. Set _r_ to _r_\*2+_z_, then multiply _d_ by 2.

> **Example** (Penaud and Roques 2002\)[^35]\:  Let _P_(_x_) = 1 &minus; _x_ &minus; _x_<sup>2</sup>.  When 0 &le; _x_ &le; 1, this is a polynomial whose only root 1 is 2/(1+sqrt(5)), that is, 1 divided by the golden ratio or 1/_&phi;_ or about 0.618, and _P_(0) > 0.  Then given _P_, the algorithm above samples the probability 1/_&phi;_ exactly.

<a id=Certain_Converging_Series></a>
#### Certain Converging Series

A general-purpose algorithm was given by Mendo (2020/2021\)[^36] that can simulate any probability, as long as&mdash;

- the probability is greater than 0 and less than 1,
- the probability can be written as a (possibly infinite) sum of rational numbers greater than 0, that is, as _p_ = _a_\[0\] + _a_\[1\] + ..., and
- a sequence of rational numbers _err_\[0\], _err_\[1\], ... is available that is nowhere increasing and approaches 0 (_converges_ to 0), where _err_\[_n_\] is not less than _p_ &minus; (_a_\[0] + ... + _a_\[_n_]).

The algorithm follows.

1. Set _&#x03F5;_ to 1, then set _n_, _lamunq_, _lam_, _s_, and _k_ to 0 each.
2. Add 1 to _k_, then add _s_/(2<sup>_k_</sup>) to _lam_.
3. If _lamunq_+_&#x03F5;_ &le; _lam_ + 1/(2<sup>_k_</sup>), go to step 8.
4. If _lamunq_ > _lam_ + 1/(2<sup>_k_</sup>), go to step 8.
5. If _lamunq_ > _lam_ + 1/(2<sup>_k_+1</sup>) and _lamunq_+_&#x03F5;_ < 3/(2<sup>_k_+1</sup>), go to step 8.
6. Add _a_\[_n_\] to _lamunq_ and set _&#x03F5;_ to _err_\[_n_\].
7. Add 1 to _n_, then go to step 3.
8. Let _bound_ be _lam_+1/(2<sup>_k_</sup>).  If _lamunq_+_&#x03F5;_ &le; _bound_, set _s_ to 0.  Otherwise, if _lamunq_ > _bound_, set _s_ to 2.  Otherwise, set _s_ to 1.
9. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), go to step 2.  Otherwise, return a number that is 0 if _s_ is 0, 1 if _s_ is 2, or an unbiased random bit (either 0 or 1 with equal probability) otherwise.

If _a_, given above, sums to the _base-2 logarithm_ of the probability rather than that probability, the following algorithm I developed simulates that probability.  For simplicity's sake, even though logarithms for such probabilities are negative, all the _a_\[_i_\] must be 0 or greater (and thus are the negated values of the already negative logarithm approximations) and must form a nowhere decreasing sequence, and all the _err_\[_i_\] must be 0 or greater.

1. Set _intinf_ to floor(max(0, abs(_a_\[0\]))).  (This is the absolute integer part of the first term in the series, or 0, whichever is greater.)
2. If _intinf_ is greater than 0, generate unbiased random bits until a zero bit or _intinf_ bits were generated this way.  If a zero was generated this way, return 0.
3. Generate an exponential random variate _E_ with rate ln(2).  This can be done, for example, by using the **exponential distribution with rate ln(_x_)** algorithm given in "[**Partially-Sampled Random Numbers**](https://peteroupc.github.io/exporand.html#Exponential_Distribution_with_Rate_ln__x)". (This step takes advantage of the exponential distribution's _memoryless property_: given that an exponential random variate _E_ is greater than _intinf_, _E_ minus _intinf_ has the same distribution.)
4. Set _n_ to 0.
5. Do the following process repeatedly until the algorithm returns a value:
    1. Set _inf_ to max(0, _a_\[_n_\]), then set _sup_ to min(0, _inf_+_err_\[_n_\]).
    2. If _E_ is less than _inf_+_intinf_, return 0.  If _E_ is less than _sup_+_intinf_, go to the next step.  If neither is the case, return 1.
    3. Set _n_ to 1.

The case when the sequence _a_ converges to a _natural logarithm_ rather than a base-2 logarithm is trivial by comparison.  Again for this algorithm, all the _a_\[_i_\] must be 0 or greater and form a nowhere decreasing sequence, and all the _err_\[_i_\] must be 0 or greater.

1. Generate an exponential random variate _E_ with rate 1.  This can be done, for example, by using the **ExpRand** or **ExpRand2** algorithm given in "[**Partially-Sampled Random Numbers**](https://peteroupc.github.io/exporand.html#Exponential_Distribution)".
2. Set _n_ to 0.
3. Do the following process repeatedly until the algorithm returns a value:
    1. Set _inf_ to max(0, _a_\[_n_\]), then set _sup_ to min(0, _inf_+_err_\[_n_\]).
    2. If _E_ is less than _inf_+_intinf_, return 0.  If _E_ is less than _sup_+_intinf_, go to the next step.  If  neither is the case, return 1.
    3. Set _n_ to 1.

> **Notes:**
>
> 1. Mendo (2020/2021\)[^36] as well as Carvalho and Moreira (2022)[^37] discuss how to find error bounds on "cutting off" a series that work for many infinite series.  This can be helpful in finding the appropriate sequences _a_ and _err_ needed for the first algorithm in this section.
> 2. If a number is known as a simple continued fraction whose partial denominators are integers, Citterio and Pavani (2016)[^38] show how to calculate lower and upper bounds for that number.  The bounds will be rational numbers whose numerator has at most a given number of digits.
>
> **Examples**:
>
> - Let _f_(_&lambda;_) = cosh(1)&minus;1, namely, the hyperbolic cosine, minus 1, of 1.  This function can be rewritten as a sum required by the first algorithm in this section, namely _f_'s _Taylor series_ at 0.  Then this algorithm can be used with _a_\[_i_] = 1/(((_i_+1)\*2)!) and _err_\[_i_] = 2/((((_i_+1)\*2)+1)!). [^39]
> - Logarithms can form the basis of efficient algorithms to simulate the probability _z_ = choose(_n_, _k_)/2<sup>_n_</sup> when _n_ can be very large (for example, as large as 2<sup>30</sup>), without relying on floating-point arithmetic.  In this example, the trivial algorithm for choose(_n_, _k_), a binomial coefficient, will generally require a growing amount of storage that depends on _n_ and _k_. On the other hand, any constant can be simulated using up to two unbiased random bits on average, and even slightly less than that for the constants at hand here (Kozen 2014\)[^40].  Instead of calculating binomial coefficients directly, a series can be calculated that sums to that coefficient's logarithm, such as ln(choose(_n_, _k_)), which is economical in space even for large _n_ and _k_.  Then the algorithm above can be used with that series to simulate the probability _z_. See also an appendix in (Bringmann et al. 2014\)[^41].

<a id=Other_General_Algorithms></a>
### Other General Algorithms

&nbsp;

<a id=Convex_Combinations></a>
#### Convex Combinations

Assume there is one or more input coins _h_<sub>_i_</sub>(_&lambda;_) that return heads with a probability that depends on _&lambda;_.  (The number of coins may be infinite.) The following algorithm chooses one of these coins at random then flips that coin.  Specifically, the algorithm generates 1 with probability equal to the following weighted sum: _g_(0) * _h_<sub>0</sub>(_&lambda;_) + _g_(1) * _h_<sub>1</sub>(_&lambda;_) + ..., where _g_(_i_) is the probability that coin _i_ will be chosen, _h_<sub>_i_</sub> is the function simulated by coin _i_, and all the _g_(_i_) sum to 1.  See (Wästlund 1999, Theorem 2.7\)[^8].  (Alternatively, the algorithm can be seen as returning heads with probability **E**\[_h_<sub>_X_</sub>(_&lambda;_)\], that is, the expected value, or "long-run average", of _h_<sub>_X_</sub> where _X_ is the number that identifies the randomly chosen coin.)

1. Generate a random integer _X_ in some way.  For example, it could be a uniform random integer greater than 1 and less than 6, or it could be a Poisson random variate.  (Specifically, the number _X_ is generated with probability _g_(_X_).  If every _g_(_i_) is a rational number, the following [**algorithm**](https://www.keithschwarz.com/darts-dice-coins/) can generate _X_: "(1) Set _X_ to 0 and _d_ to 1. (2) With probability _g_(_X_)/_d_, return _X_; otherwise subtract _g_(_X_) from _d_, add 1 to _X_, and repeat this step.")
2. Flip the coin represented by _X_ and return the result.

>
> **Notes:**
>
> 1. **Building convex combinations.** Assume there is a function of the form _f_(_&lambda;_) = $w_0(\lambda)+w_1(\lambda)+...$, where $w_0, w_1, ...$ are continuous functions.  Let _g_(_n_) be the probability that a randomly chosen number _X_ is _n_, such that _g_(0) + _g_(1) + ... = 1.  Then by **generating _X_ and flipping a coin with probability of heads of _w_<sub>_X_</sub>(_&lambda;_)/_g_(_X_)**, we can simulate the probability _f_(_&lambda;_) as the convex combination&mdash; $$f(\lambda)=g(0) \frac{w_0(\lambda)}{g(0)} + g(1) \frac{w_1(\lambda)}{g(1)} + ...$$ (where a term is omitted if division by 0 occurs), but this works only if the following conditions are met for each integer _n_&ge;0:
>     - $1 \ge g(n) \ge w_n(\lambda) \ge 0$, wherever $0 \le \lambda \le 1$.
>     - If $g(n)>0$, the function $w_n(\lambda)/g(n)$ admits a Bernoulli factory; see the section "About Bernoulli Factories".
>
>     See also Mendo (2019\)[^24].
> 2. **Constants writable as a sum of nonnegative numbers.** A special case of note 1.  Let _g_ be as in note 1, and let $c$ be a constant written as&mdash; $$c=a_0+a_1+a_2+...,$$ where&mdash;
>
>     - $a_n$ are each 0 or greater and sum to 1 or less, and
>     - $1 \ge g(n) \ge a_n \ge 0$ for each integer $n\ge 0$.
>
>     Then by **generating _X_ and flipping a coin with probability of heads of _a_<sub>_X_</sub>/_g_(_X_)**, we can simulate the probability  _c_ as the convex combination&mdash; $$f(\lambda)=g(0) \frac{a_0}{g(0)} + g(1) \frac{a_1}{g(1)} + ...,$$ where a term is omitted if division by 0 occurs.
>
> **Examples:**
>
> 1. Generate _X_, a Poisson random variate with mean _&mu;_, then flip the input coin.  With probability 1/(1+_X_), return the result of the coin flip; otherwise, return 0.  This corresponds to _g_(_i_) being the Poisson probabilities and the coin for _h_<sub>_i_</sub> returning 1 with probability 1/(1+_i_), and 0 otherwise.  The probability that this method returns 1 is **E**\[1/(1+_X_)\], or (exp(_&mu;_)&minus;1)/(exp(_&mu;_)\*_&mu;_).
> 2. (Wästlund 1999\)[^8]\: Generate a Poisson random variate _X_ with mean 1, then flip the input coin _X_ times.  Return 0 if any of the flips returns 1, or 1 otherwise.  This is a Bernoulli factory for exp(&minus;_&lambda;_), and corresponds to _g_(_i_) being the Poisson probabilities, namely 1/(_i_!\*exp(1)), and _h_<sub>_i_</sub>() being (1&minus;_&lambda;_)<sup>_i_</sup>.
> 3. Generate _X_, a Poisson random variate with mean _&mu;_, run the **ExpMinus** algorithm with _z_ = _X_, and return the result.  The probability of returning 1 this way is **E**\[exp(&minus;_X_)\], or exp(_&mu;_\*exp(&minus;1)&minus;_&mu;_).  The following Python code uses the computer algebra library SymPy to find this probability: `from sympy.stats import *; E(exp(-Poisson('P', x))).simplify()`.
> 4. Multivariate Bernoulli factory (Huber 2016\)[^42] of the form _R_ = _C_<sub>0</sub>\*_&lambda;_<sub>0</sub> + _C_<sub>1</sub>\*_&lambda;_<sub>1</sub> + ... + _C_<sub>_m_&minus;1</sub>\*_&lambda;_<sub>_m_&minus;1</sub>, where _C_<sub>_i_</sub> are known constants greater than 0,  _&#x03F5;_ > 0, and _R_ &le; 1 &minus; _&#x03F5;_: Choose an integer in [0, _m_) uniformly at random, call it _i_, then run a linear Bernoulli factory for (_m_\*_C_<sub>_i_</sub>)\*_&lambda;_<sub>_i_</sub>.  This differs from Huber's suggestion of "thinning" a random process driven by multiple input coins.
> 5. **Probability generating function** (PGF) (Dughmi et al. 2021\)[^43]. Generates heads with probability **E**\[_&lambda;_<sup>_X_</sup>\], that is, the expected value ("long-run average") of _&lambda;_<sup>_X_</sup>.  **E**\[_&lambda;_<sup>_X_</sup>\] is the PGF for the distribution of _X_.  The algorithm follows: (1) Generate a random integer _X_ in some way; (2) Flip the input coin until the flip returns 0 or the coin is flipped _X_ times, whichever comes first.  Return 1 if all the coin flips, including the last, returned 1 (or if _X_ is 0); or return 0 otherwise.
> 6. Assume _X_ is the number of unbiased random bits that show 0 before the first 1 is generated.  Then _g_(_n_) = 1/(2<sup>_n_+1</sup>).

The previous algorithm can be generalized further, so that an input coin that simulates the probability _&lambda;_ helps generate the random integer in step 1.  Now, the overall algorithm returns 1 with probability&mdash; $$\sum_{k\ge 0} g(k,\lambda) h_k(\lambda).$$

This algorithm, called **Algorithm CC** in this document, follows.

1. Choose an integer 0 or greater at random, with help of the input coin for $\lambda$, so that $k$ is chosen with probability $g(k,\lambda)$. Call the chosen integer _X_.
2. Flip the coin represented by _X_ and return the result.

> **Notes:**
>
> 1. Step 1 of this algorithm is incomplete, since it doesn't explain how to generate $X$ exactly.  That depends on the probability $g(k,\lambda)$.
> 2. If we define _S_ to be a set of integers 0 or greater, and replace step 2 with "If _X_ is in the set _S_, return 1.  Otherwise, return 0", then the algorithm returns 1 with probability $\sum_{k\text{ in }S} g(k,\lambda)$ (because $h_k(\lambda)$ is either 1 if $k$ is in _S_, or 0 otherwise). Then the so-called "even-parity" construction[^32] is a special case of this algorithm, if _S_ is the even positive integers and zero and if the example below is used.
>
> **Example:** Step 1 can read "Flip the input coin for _&lambda;_ repeatedly until it returns 0.  Set _X_ to the number of times the coin returned 1 this way." Then step 1 generates _X_ with probability $\lambda^X (1-\lambda)$.[^44]

<a id=Bernoulli_Race_and_Generalizations></a>
#### Bernoulli Race and Generalizations

The Bernoulli factory approach, which simulates a coin with unknown heads probability, leads to an algorithm to roll an _n_-face die where the chance of each face is unknown.  Here is one such die-rolling algorithm (Schmon et al. 2019\)[^45].  It generalizes the so-called Bernoulli Race (see note 1 below) and returns _i_ with probability&mdash; $$\phi_i = \frac{g(i)\cdot h_i(\pmb\mu)}{\sum_{k=0}^r g(k)\cdot h_k(\pmb\mu)},$$

where:

- _r_ is an integer greater than 0.  There are _r_+1 values this algorithm can choose from.
- _g_(_i_) takes an integer _i_ and returns a number 0 or greater.  This serves as a _weight_ for the "coin" labeled _i_; the higher the weight, the greater the probability the "coin" will be "flipped".
- _h_<sub>_i_</sub>(**_&mu;_**) takes in a number _i_ and the probabilities of heads of one or more input coins, and returns a number that is 0 or greater and 1 or less.  This represents the "coin" for one of the _r_+1 choices.

The algorithm follows.

1. Generate a random integer _i_ in some way, so that _i_ is generated with probability proportional to the following weights: \[_g_(0), _g_(1), ..., _g_(_r_)\].
2. Run a Bernoulli factory algorithm for _h_<sub>_i_</sub>(**_&mu;_**).  If the run returns 0 (_i_ is rejected), go to step 1.
3. _i_ is accepted, so return _i_.

> **Notes:**
>
> 1. The _Bernoulli Race_ (Dughmi et al. 2021\)[^43] is a special case of this algorithm with _g_(_k_) = 1 for every _k_. Say there is _n_ coins, then choose one of them uniformly at random and flip that coin. If the flip returns 1, return _X_; otherwise, repeat this algorithm.  This algorithm chooses a random coin based on its probability of heads.
> 2. If we define _S_ to be the integers \[0, _r_\] or a subset of them and replace step 3 with "If _i_ is in the set _S_, return 1.  Otherwise, return 0.", the algorithm returns 1 with probability $\sum_{k\text{ in }S} \phi_k$, and 0 otherwise.  In that case, the modified algorithm has the so-called "die-coin algorithm" of Agrawal et al. (2021, Appendix D\)[^46] as a special case with&mdash;<br>_g_(_k_) = _c_<sup>_k_</sup>\*_d_<sup>_r_&minus;_k_</sup>,<br>_h_<sub>_k_</sub>(_&lambda;_, _&mu;_) = _&lambda;_<sup>_k_</sup>\*_&mu;_<sup>_r_&minus;_k_</sup> (for the following algorithm: flip the _&lambda;_ coin _k_ times and the _&mu;_ coin _r_&minus;_k_ times; return 1 if all flips return 1, or 0 otherwise), and<br>_S_ is the set of integers that are 1 or greater and _r_ or less,<br>where _c_&ge;0, _d_&ge;0, and _&lambda;_ and _&mu;_ are the probabilities of heads of two input coins.  In that paper, _c_, _d_, _&lambda;_, and _&mu;_ correspond to _c_<sub>_y_</sub>, _c_<sub>_x_</sub>, _p_<sub>_y_</sub>, and _p_<sub>_x_</sub>, respectively.
> 3. Although not noted in the Schmon paper, the _r_ in the algorithm can be infinity (see also Wästlund 1999, Theorem 2.7[^8]).  In that case, Step 1 is changed to say "Choose an integer 0 or greater at random with probability _g_(_k_) for integer _k_.  Call the chosen integer _i_."  As an example, step 1 can sample from a Poisson distribution, which can take on any integer 0 or greater.

The previous algorithm can be generalized further, so that an input coin that simulates the probability _&lambda;_ helps generate the random integer in step 1.  Now, the overall algorithm generates an integer _X_ with probability&mdash; $$\frac{g(X,\lambda) h_X(\pmb \mu)}{\sum_{k\ge 0} g(k,\lambda) h_k(\pmb \mu)}.$$

In addition, the set of integers to choose from can be infinite.  This algorithm, called **Algorithm BR** in this document, follows.

1. Choose an integer 0 or greater at random, with help of the input coin for $\lambda$, so that $k$ is chosen with probability proportional to $g(k,\lambda)$. Call the chosen integer _X_.  (If the integer must be less than or equal to an integer _r_, then the integer will have probability proportional to the following weights: \[_g_(0, _&lambda;_), _g_(1, _&lambda;_), ..., _g_(_r_, _&lambda;_)\].)
2. Run a Bernoulli factory algorithm for _h_<sub>_X_</sub>(**_&mu;_**).  If the run returns 0 (_i_ is rejected), go to step 1.
3. _X_ is accepted, so return _X_.

> **Notes:**
>
> 1. Step 1 of this algorithm is incomplete, since it doesn't explain how to generate $X$ exactly.  That depends on the weights $g(k,\lambda)$.
> 2. The probability that $s$ many values of _X_ are rejected by this algorithm is $p(1 − p)^s$, where&mdash; $$p=\frac{\sum_{k\ge 0} g(k,\lambda) h_k(\pmb \mu)}{\sum_{k\ge 0} g(k,\lambda)}.$$
>
> **Example:** Step 1 can read "Flip the input coin for _&lambda;_ repeatedly until it returns 0.  Set _X_ to the number of times the coin returned 1 this way." Then step 1 generates _X_ with probability $g(X,\lambda)=\lambda^X (1-\lambda)$.[^44]

<a id=Flajolet_s_Probability_Simulation_Schemes></a>
#### Flajolet's Probability Simulation Schemes

Flajolet et al. (2010\)[^1] described two schemes for probability simulation, inspired by restricted models of computing.

**Certain algebraic functions.** Flajolet et al. (2010\)[^1] showed a sampling method modeled on _pushdown automata_ (state machines with a stack) that are given flips of a coin with unknown heads probability _&lambda;_.  These flips form a _bitstring_, and each pushdown automaton accepts only a certain class of bitstrings.  The rules for determining whether a bitstring belongs to that class are called a _binary stochastic grammar_, which uses an alphabet of only two "letters".  If a pushdown automaton terminates, it accepts a bitstring with probability _f_(_&lambda;_), where _f_ must be an _algebraic function over rationals_ (a function that can be a solution of a nonzero polynomial equation whose coefficients are rational numbers) (Mossel and Peres 2005\)[^15].

Specifically, the method simulates the following function (not necessarily algebraic): $$f(\lambda) = \sum_{k\ge 0} g(k,\lambda) h_k(\lambda),$$ where the paper uses $g(k, \lambda) = \lambda^k (1-\lambda)$ and $h_k(\lambda) = W(k)/\beta^k$, so that&mdash; $$f(\lambda) = (1-\lambda) OGF(\lambda/\beta),$$ where:

- $W(k)$ returns a number in the interval \[0, $\beta^k$\].  If $W(k)$ is an integer for every $k$, then $W(k)$ is the number of $k$-letter words that can be produced by the stochastic grammar in question.
- $\beta \ge 2$ is an integer.  This is the alphabet size, or the number of "letters" in the alphabet.  This is 2 for the cases discussed in the Flajolet paper (binary stochastic grammars), but it can be greater than 2 for more general stochastic grammars.
- $OGF(x) = W(0) + W(1) x + W(2) x^2 + W(3) x^3 + ...$ is an _ordinary generating function_.  This is a _power series_ whose _coefficients_ are $W(i)$ (for example, $W(2)$ is coefficient 2).

The method uses **Algorithm CC**, where step 1 is done as follows: "Flip the input coin repeatedly until it returns 0.  Set _X_ to the number of times the coin returned 1 this way."[^44]  Optionally, step 2 can be done as described in Flajolet et al., (2010\)[^1]: generate an _X_-letter word uniformly at random and "parse" that word using a stochastic grammar to determine whether that word can be produced by that grammar.

> **Note:** The _radius of convergence_ of OGF is the greatest number _&rho;_ such that OGF is defined at every point less than _&rho;_ away from the origin (0, 0).  In this algorithm, the radius of convergence is in the interval \[1/_&beta;_, 1\] (Flajolet 1987\)[^47].  For example, the OGF involved in the square root construction given in the examples below has radius of convergence 1/2.
>
> **Examples:**
>
> 1. The following is an example from the Flajolet et al. paper. An _X_-letter binary word can be "parsed" as follows to determine whether that word encodes a ternary tree: "2. If _X_ is 0, return 0.  Otherwise, set _i_ to 1 and _d_ to 1.; 2a. Generate an unbiased random bit (that is, either 0 or 1, chosen with equal probability), then subtract 1 from _d_ if that bit is 0, or add 2 to _d_ otherwise.; 2b. Add 1 to _i_. Then, if _i_ < _X_ and _d_ > 0, go to step 3a.; 2c. Return 1 if _d_ is 0 and _i_ is _X_, or 0 otherwise."
> 2. If W(_X_), the number of _X_-letter words that can be produced by the stochastic grammar in question, has the form&mdash;
>
>     - choose(_X_, _X_/_t_) \* (_&beta;_&minus;1)<sup>_X_&minus;_X_/_t_</sup> (the number of _X_-letter words with exactly _X_/_t_ A's, for an alphabet size of _&beta;_) if _X_ is divisible by _t_[^48], and
>     - 0 otherwise,
>
>     where _t_ is an integer 2 or greater and _&beta;_ is the alphabet size and is an integer 2 or greater, step 2 of the algorithm can be done as follows: "2. If _X_ is not divisible by _t_, return 0. Otherwise, generate _X_ uniform random integers in the interval [0, _&beta;_) (for example, _X_ unbiased random bits if _&beta;_ is 2), then return 1 if exactly _X_/_t_ zeros were generated this way, or 0 otherwise."  If _&beta;_ = 2, then this reproduces another example from the Flajolet paper.
> 3. If W(_X_) has the form&mdash;<br/>&nbsp;&nbsp;&nbsp;&nbsp;choose(_X_ * _&alpha;_, _X_) \* (_&beta;_&minus;1)<sup>_X_\*_&alpha;&minus;X_</sup> / _&beta;_<sup>_X_\*_&alpha;&minus;X_</sup>,<br/>where _&alpha;_ is an integer 1 or greater and _&beta;_ is the alphabet size and is an integer 2 or greater [^49], step 2 of the algorithm can be done as follows: "2. Generate _X_ * _&alpha;_ uniform random integers in the interval [0, _&beta;_) (for example, _X_ * _&alpha;_ unbiased random bits if _&beta;_ is 2), then return 1 if exactly _X_ zeros were generated this way, or 0 otherwise."  If _&alpha;_ = 2 and _&beta;_ = 2, then this expresses the _square-root construction_ sqrt(1 &minus; _&lambda;_), mentioned in the Flajolet et al. paper.  If _&alpha;_ is 1, the modified algorithm simulates the following probability: (_&beta;_\*(_&lambda;_&minus;1))/(_&lambda;_&minus;_&beta;_).  And interestingly, I have found that if _&alpha;_ is 2 or greater, the probability simplifies to involve a hypergeometric function.  Specifically, the probability becomes&mdash; $$f(\lambda)=(1-\lambda)\times_{\alpha-1} F_{\alpha-2} \left(\frac{1}{\alpha},\frac{2}{\alpha},...,\frac{\alpha-1}{\alpha}; \frac{1}{\alpha-1},\frac{2}{\alpha-1},...,\frac{\alpha-2}{\alpha-1}; \lambda\frac{\alpha^\alpha}{(\alpha-1)^{\alpha-1}2^{\alpha}}\right),$$ if _&beta;_ = 2, or more generally&mdash; $$f(\lambda)=(1-\lambda)\times_{\alpha-1} F_{\alpha-2} \left(\frac{1}{\alpha},\frac{2}{\alpha},...,\frac{\alpha-1}{\alpha}; \frac{1}{\alpha-1},\frac{2}{\alpha-1},...,\frac{\alpha-2}{\alpha-1}; \lambda\frac{\alpha^\alpha(\beta-1)^{\alpha-1}}{(\alpha-1)^{\alpha-1}\beta^{\alpha}}\right).$$
>
>     The ordinary generating function for this modified algorithm is thus&mdash; $$OGF(z) = 1\times_{\alpha-1} F_{\alpha-2} \left(\frac{1}{\alpha},\frac{2}{\alpha},...,\frac{\alpha-1}{\alpha}; \frac{1}{\alpha-1},\frac{2}{\alpha-1},...,\frac{\alpha-2}{\alpha-1}; z\frac{\alpha^\alpha (\beta-1)^{\alpha-1}}{(\alpha-1)^{\alpha-1}\beta^{\alpha-1}}\right).$$
> 4.  The probability involved in example 2 likewise involves hypergeometric functions: $$f(\lambda)=(1-\lambda)\times_{t-1} F_{t-2}\left(\frac{1}{t},\frac{2}{t},...,\frac{t-1}{t}; \frac{1}{t-1},\frac{2}{t-1},...,\frac{t-2}{t-1}; \lambda^t \frac{t^t (\beta-1)^{t-1}}{(t-1)^{t-1} \beta^t}\right).$$

**The von Neumann schema.** Flajolet et al. (2010\)[^1], section 2, describes what it calls the _von Neumann schema_, which produces random integers based on a coin with unknown heads probability.  To describe the schema, the following definition is needed:

- A _permutation class_ is a rule that describes how a sequence of numbers must be ordered.  The ordering of the numbers is called a _permutation_.  Two examples of permutation classes cover permutations sorted in descending order, and permutations whose highest number appears first.  When checking whether a sequence follows a permutation class, only less-than and greater-than comparisons between two numbers are allowed.

Now, given a permutation class and an input coin, the von Neumann schema generates a random integer $n\ge 0$, with probability equal to&mdash; $$w_n(\lambda) = \frac{g(n,\lambda) h_n(\lambda)}{\sum_{k\ge 0} g(k,\lambda) h_k(\lambda)},$$ where the schema uses $g(k, \lambda) = \lambda^k (1-\lambda)$ and $h_k(\lambda) = \frac{V(k)}{k!}$, so that&mdash; $$w_n(\lambda)=\frac{(1-\lambda) \lambda^n V(n)/(n!)}{(1-\lambda) EGF(\lambda)} = \frac{\lambda^n V(n)/(n!)}{EGF(\lambda)},$$ where:

- $V(n)$ returns a number in the interval \[0, _n_!\].  If $V(n)$ is an integer for every $n$, this is the number of permutations of size $n$ that belong in the permutation class.
- $EGF(\lambda) = \sum_{k\ge 0} \lambda^k \frac{V(k)}{k!}$ is an _exponential generating function_, which completely determines a permutation class.
-  The probability that $r$ many values of $X$ are rejected by the von Neumann schema (for the choices of $g$ and $h$ above) is $p(1 − p)^r$, where $p=(1-\lambda) EGF(\lambda)$.

The von Neumann schema uses **Algorithm BR**, where in step 1, the von Neumann schema as given in the Flajolet paper does the following: "Flip the input coin repeatedly until it returns 0.  Set _X_ to the number of times the coin returned 1 this way."[^44]  Optionally, step 2 can be implemented as described in Flajolet et al., (2010\)[^1]: generate  _X_ uniform random variates between 0 and 1, then determine whether those numbers satisfy the given permutation class, or generate as many of those numbers as necessary to make this determination.

> **Note:** The von Neumann schema can sample from any _power series distribution_ (such as Poisson, negative binomial, and logarithmic series), given a suitable exponential generating function.  However, the number of input coin flips required by the schema grows without bound as _&lambda;_ approaches 1.
>
> **Examples:**
>
> 1. Examples of permutation classes include the following (using the notation in "Analytic Combinatorics" (Flajolet and Sedgewick 2009\)[^50]):
>
>     - Single-cycle permutations, or permutations whose highest number appears first (EGF(_&lambda;_) = Cyc(_&lambda;_) = ln(1/(1 &minus; _&lambda;_)); V(_n_) = ((_n_ &minus; 1)!) \[or 0 if _n_ is 0)\]).
>     - Sorted permutations, or permutations whose numbers are sorted in descending order (EGF(_&lambda;_) = Set(_&lambda;_) = exp(_&lambda;_); V(_n_) = 1).
>     - All permutations (EGF(_&lambda;_) = Seq(_&lambda;_) = 1/(1 &minus; _&lambda;_); V(_n_) = _n_!),
>     - Alternating permutations of even size (EGF(_&lambda;_) = 1/cos(_&lambda;_) = sec(_&lambda;_); V(_n_) = W(_n_/2) if _n_ is even[^27] and 0 otherwise, where the W(_m_) starting at _m_ = 0 is [**A000364**](https://oeis.org/A000364) in the _On-Line Encyclopedia of Integer Sequences_).
>     - Alternating permutations of odd size (EGF(_&lambda;_) = tan(_&lambda;_); V(_n_) = W((_n_+1)/2) if _n_ is odd[^25] and 0 otherwise, where the W(_m_) starting at _m_ = 1 is [**A000182**](https://oeis.org/A000182)).
>
> 2. Using the class of _sorted permutations_, we can generate a Poisson random variate with mean _&lambda;_ via the von Neumann schema, where _&lambda;_ is the probability of heads of the input coin.  This would lead to an algorithm for exp(&minus;_&lambda;_) &mdash; outputting 1 if a Poisson random variate with mean _&lambda;_ is 0, or 0 otherwise &mdash; but for the reason given in the note, this algorithm gets slower as _&lambda;_ approaches 1.  Also, if _c_ &gt; 0 is a real number, adding a Poisson random variate with mean floor(_c_) to one with mean _c_&minus;floor(_c_) generates a Poisson random variate with mean _c_.
> 3. The algorithm for exp(&minus;_&lambda;_), described in example 2, is as follows:
>
>     1. Flip the input coin repeatedly until it returns 0.  Set _X_ to the number of times the coin returned 1 this way.
>     2. With probability 1/((_X_)!), _X_ is accepted so return a number that is 1 if _X_ is 0 and 0 otherwise.  Otherwise, go to the previous step.
>
> 4. For the class of _alternating permutations of even size_ (see example 1), step 2 in **Algorithm BR** can be implemented as follows (Flajolet et al. 2010, sec. 2.2\)[^1]:
>
>     - (2a.) (Limited to even-sized permutations.) If _X_ is odd[^25], reject _X_ (and go to step 1).
>     - (2b.) Generate a uniform random variate between 0 and 1, call it U, then set _i_ to 1.
>     - (2c.) While _i_ is less than _X_:
>         - Generate a uniform random variate between 0 and 1, call it V.
>         - If _i_ is odd[^25] and V is less than U, or if _i_ is even[^27] and U is less than V, reject _X_ (and go to step 1).
>         - Add 1 to i, then set U to V.
>
> 5. For the class of _alternating permutations of odd size_ (see example 1), step 2 in **Algorithm BR** can be implemented as in example 4, except 2a reads: "(2a.) (Limited to odd-sized permutations.) If _X_ is even[^27], reject _X_ (and go to step 1)." (Flajolet et al. 2010, sec. 2.2\)[^1].
> 6. By computing&mdash; $$\frac{\sum_{k\ge 0} g(2k+1,\lambda) h_{2k+1}(\lambda)}{\sum_{k\ge 0} g(k,\lambda) h_k(\lambda)}$$ (which is the probability of getting an odd-numbered output), and using the class of sorted permutations ($h_i(\lambda)=1/(i!)$), it is found that the von Neumann schema's output is odd with probability $\exp(-\lambda)\times \sinh(\lambda)$, where $sinh$ is the hyperbolic sine function.
> 7. The _X_ generated in step 1 can follow any distribution of integers 0 or greater, not just the distribution used by the von Neumann schema (because **Algorithm BR** is more general than the von Neumann schema).  (In that case, the function $g(k, \lambda)$ will be the probability of getting $k$ under the new distribution.) For example, if _X_ is a Poisson random variate with mean _z_<sup>2</sup>/4, where _z_ &gt; 0, and if the sorted permutation class is used, the algorithm will return 0 with probability 1/_I_<sub>0</sub>(_z_), where _I_<sub>0</sub>(.) is the modified Bessel function of the first kind.

**Examples for the von Neumann schema**.  Examples contained in Theorem 2.3 of Flajolet et al. (2010\)[^1].  In the table:

- _&lambda;_ is the unknown heads probability of a coin.
- _&mu;_ is another coin that flips the _&lambda;_ coin and returns 1 minus the result (thus simulating 1 &minus; _&lambda;_).

| Function | Values Allowed |  Algorithm |
 --- | ---- | --- |
| exp(&minus;_&lambda;_) | 0 &le; _&lambda;_ &lt; 1 | Uses von Neumann schema algorithm (VNS) with **sorted** permutations, and the _&lambda;_ coin.  Return 1 if VNS returns 0, and 0 otherwise. |
| exp(_&lambda;_ &minus; 1) = exp(&minus;(1 &minus; _&lambda;_)) | 0 &lt; _&lambda;_ &le; 1 | Uses VNS with sorted permutations, and the _&mu;_ coin.  Return 1 if VNS returns 0, and 0 otherwise. |
| (1&minus;_&lambda;_)\*exp(_&lambda;_) | 0 &le; _&lambda;_ &lt; 1 | Uses VNS with sorted permutations, and the _&lambda;_ coin.  Return 1 if VNS finishes in one iteration, and 0 otherwise. |
| _&lambda;_\*exp(1&minus;_&lambda;_) | 0 &lt; _&lambda;_ &le; 1 | Uses VNS with sorted permutations, and the _&mu;_ coin.  Return 1 if VNS finishes in one iteration, and 0 otherwise. |
| _&lambda;_/ln(1/(1&minus;_&lambda;_)) | 0 &le; _&lambda;_ &lt; 1 | Uses VNS with **single-cycle** permutations, and the _&lambda;_ coin.  Return 1 if VNS returns **1**, and 0 otherwise. |
| (1&minus;_&lambda;_)/ln(1/_&lambda;_) | 0 &lt; _&lambda;_ &le; 1 | Uses VNS with single-cycle permutations, and the _&mu;_ coin.  Return 1 if VNS returns **1**, and 0 otherwise. |
| (1&minus;_&lambda;_)\*ln(1/(1&minus;_&lambda;_)) | 0 &le; _&lambda;_ &lt; 1 | Uses VNS with single-cycle permutations, and the _&lambda;_ coin.  Return 1 if VNS finishes in one iteration, and 0 otherwise. |
| _&lambda;_\*ln(1/_&lambda;_) | 0 &lt; _&lambda;_ &le; 1 | Uses VNS with single-cycle permutations, and the _&mu;_ coin.  Return 1 if VNS finishes in one iteration, and 0 otherwise. |
| cos(_&lambda;_) | 0 &le; _&lambda;_ &lt; 1 | Uses VNS with **alternating even-sized** permutations, and the _&lambda;_ coin.  Return 1 if VNS returns **0**, and 0 otherwise. |
| (1&minus;_&lambda;_)/cos(_&lambda;_) = (1&minus;_&lambda;_)\*sec(_&lambda;_) | 0 &le; _&lambda;_ &lt; 1 | Uses VNS with alternating even-sized permutations, and the _&lambda;_ coin.  Return 1 if VNS finishes in one iteration, and 0 otherwise. |
| _&lambda;_/tan(_&lambda;_) | 0 &le; _&lambda;_ &lt; 1 | Uses VNS with **alternating odd-sized** permutations, and the _&lambda;_ coin.  Return 1 if VNS returns **1**, and 0 otherwise. |
| (1&minus;_&lambda;_)\*tan(_&lambda;_) | 0 &le; _&lambda;_ &lt; 1 | Uses VNS with alternating odd-sized permutations, and the _&lambda;_ coin.  Return 1 if VNS finishes in one iteration, and 0 otherwise. |

**Recap.**  As can be seen&mdash;

- the scheme for algebraic functions uses **Algorithm CC** with $g(k, \lambda) = \lambda^k (1-\lambda)$ and $h_k(\lambda) = W(k)/\beta^k$, and
- the _von Neumann schema_ uses **Algorithm BR** with $g(k, \lambda) = \lambda^k (1-\lambda)$ and $h_k(\lambda) = V(k)/(k!)$,

and both schemes implement step 1 of the algorithm in the same way.  However, different choices for $g$ and $h$ will lead to modified schemes that could lead to Bernoulli factory algorithms for new functions.

<a id=Integrals></a>
#### Integrals

Roughly speaking, the _integral_ of _f_(_x_) on an interval \[_a_, _b_\] is the "area under the graph" of that function when the function is restricted to that interval.  If _f_ is continuous there, this is the value that $\frac{1}{n} (f(a+(b-a)(1-\frac{1}{2})/n)+f(a+(b-a)(2-\frac{1}{2})/n)+...+f(a+(b-a)(n-\frac{1}{2})/n))$ approaches as $n$ gets larger and larger.

**Algorithm 1.** (Flajolet et al., 2010\)[^1] showed how to turn an algorithm that simulates _f_(_&lambda;_) into an algorithm that simulates the probability&mdash;

- $\frac{1}{\lambda} \int_0^\lambda f(u)\,du$ ($\frac{1}{\lambda}$ times the integral of $f(u)$ on $[0, \lambda]$), or equivalently,
- $\int_0^1 f(\lambda u)\,du$ (the integral of $f(\lambda u)$ on $[0, 1]$),

namely the following algorithm:

1. Generate _u_, a uniform random variate between 0 and 1, call it _u_.
2. Create an input coin that does the following: "Flip the original input coin, then [**sample from the number _u_**](#Implementation_Notes).  Return 1 if both the call and the flip return 1, and return 0 otherwise."
3. Run the original Bernoulli factory algorithm, using the input coin described in step 2 rather than the original input coin.  Return the result of that run.

**Algorithm 2.** A special case of Algorithm 1 is the integral $\int_0^1 f(u)\,du$, when the original input coin always returns 1:

1. Generate a uniform random variate between 0 and 1, call it _u_.
2. Create an input coin that does the following: "[**Sample from the number _u_**](#Implementation_Notes) and return the result."
3. Run the original Bernoulli factory algorithm, using the input coin described in step 2 rather than the original input coin.  Return the result of that run.

**Algorithm 3.** I have found that it's possible to simulate the following integral, namely&mdash; $$\int_a^b f(\lambda u)\,du,$$ where $0\le a\lt b\le 1$, using the following algorithm:

1. Generate a uniform random variate between 0 and 1 _u_.  Then if _u_ is less than _a_ or is greater than _b_, repeat this step. (If _u_ is a uniform PSRN, these comparisons should be done via the **URandLessThanReal** algorithm.)
2. Create an input coin that does the following: "[**Sample from the number _u_**](#Implementation_Notes) and return the result."
3. Run the original Bernoulli factory algorithm, using the input coin described in step 2.  If the run returns 0, return 0.  Otherwise, generate a uniform random variate between 0 and 1 _v_ and return a number that is 0 if _v_ is less than _a_ or is greater than _b_, or 1 otherwise.

> **Note**: If _a_ is 0 and _b_ is 1, the probability simulated by this algorithm will be strictly increasing (will keep going up), have a slope no greater than 1, and equal 0 at the point 0.

<a id=Algorithms_for_Specific_Functions_of___lambda></a>
### Algorithms for Specific Functions of _&lambda;_

This section and the next one describe algorithms for specific functions, especially when they have a more convenient simulation than the general-purpose algorithms given earlier.  They can be grouped as follows:

- Functions involving the exponential function exp(_x_).
- Rational functions of several variables.
- Addition, subtraction, and division.
- Powers and roots.
- Linear Bernoulli factories.
- Transcendental functions.
- Other factory functions.

<a id=ExpMinus_exp_minus__z></a>
#### ExpMinus (exp(&minus;_z_))

In this document, the **ExpMinus** algorithm is a Bernoulli factory taking a parameter _z_.  The parameter _z_ is 0 or greater and can be written in any of the following ways:

1. As a rational number, namely _x_/_y_ where _x_&ge;0 and _y_>0 are integers.
2. As an integer and fractional part, namely _m_ + _&nu;_ where _m_ &ge; 0 is an integer and _&nu;_ (0 &le; _&nu;_ &le; 1) is the probability of heads of a coin.  (Specifically, the "coin" must implement a Bernoulli factory algorithm that returns 1 \[or outputs heads\] with probability equal to the fractional part _&nu;_.[^51])
3. As a finite sum of positive numbers, each of which can be written in either of the preceding ways.  For example, if _z_ = &pi;, it can be written as a sum of four numbers, each of which is (&pi; / 4), that is, _m_ = 0 and _&nu;_ = (&pi; / 4).  (This case makes use of the identity exp(&minus;(_b_+_c_)) = exp(&minus;_b_) \* exp(&minus;_c_).  Here, &pi;/4 has a not-so-trivial Bernoulli factory algorithm described in this article.)

The **ExpMinus** algorithm is as follows.  To flip a coin with probability of heads of exp(&minus;_z_):

- In case 1, use the following algorithm (Canonne et al. 2020\)[^53]:
    1. Special case: If _x_ is 0, return 1. (This is because the probability becomes `exp(0) = 1`.)
    2. If `x > y` (so _x_/_y_ is greater than 1), call this algorithm (recursively) `floor(x/y)` times with _x_ = _y_ = 1 and once with _x_ = _x_ &minus; floor(_x_/_y_) \* _y_ and _y_ = _y_.  Return 1 if all these calls return 1; otherwise, return 0.
    3. Set _r_ to 1 and _i_ to 1.
    4. Return _r_ with probability (_y_ \* _i_ &minus; _x_) / (_y_ \* _i_).
    5. Set _r_ to 1 &minus; _r_, add 1 to _i_, and go to step 4.

    Or the following algorithm:

    - If _x_ is 0, return 1.  Otherwise, generate _N_, a Poisson random variate with mean _x_/_y_ (see "[**Poisson Distribution**](https://peteroupc.github.io/randomfunc.html#Poisson_Distribution)" for one way to do this), and return a number that is 1 if _N_ is 0, or 0 otherwise.
- In case 2, use case 2 of the **algorithm for exp(&minus;(_&lambda;_ \* _z_))** with parameter _z_, where _&lambda;_ represents a coin that always returns 1.
- In case 3, rewrite the _z_ parameter as a sum of positive numbers.  For each number, run either case 1 or case 2 (depending on how the number is written) of the **ExpMinus** algorithm with that number as the parameter.  If any of these runs returns 0, return 0; otherwise, return 1.  (See also (Canonne et al. 2020\)[^52].)

> **Examples:** The **ExpMinus** algorithm with the following parameters can be implemented as follows:
>
> - Parameter _&pi;_:  Run the **algorithm for exp(&minus;(_&lambda;_ \* _z_))**, four times, with parameter _z_ = 0 + _&nu;_, where _&nu;_ is a Bernoulli factory for (_&pi;_/4), and _&lambda;_ represents a coin that always returns 1.  If any of these runs returns 0, return 0; otherwise, return 1.
> - Parameter 3: Run case 1 of the algorithm where _x_=3 and _y_=1.
> - Parameter 7/5: Run case 1 of the algorithm where _x_=7 and _y_=5.
>
> **Note:** exp(&minus;_z_) = exp(1&minus;_z_)/exp(1) = 1/exp(_z_).

<a id=LogisticExp_1_minus_expit__z__2_prec></a>
#### LogisticExp (1 &minus; expit(_z_/2<sup>_prec_</sup>))

This is the probability that the binary digit at _prec_ (the _prec_<sup>th</sup> binary digit after the point, where _prec_ is greater than 0) is set for an exponential random variate with rate _z_.  In this document, the **LogisticExp** algorithm is a Bernoulli factory taking the following parameters in this order:

1. _z_ is 0 or greater, and written as a rational number (case 1), as an integer and fractional part (case 2), or as a sum of positive numbers (case 3), as described in the [**"ExpMinus" section**](#ExpMinus_exp_minus__z).
2. _prec_ is an integer 0 or greater.

The **LogisticExp** algorithm is as follows.  To flip a coin with probability of heads of 1/(1+exp(_z_/2<sup>_prec_</sup>)) = 1 &minus; expit(_&lambda;_/2<sup>_prec_</sup>):

- Run the **algorithm for expit(_&lambda;_\*_z_)** where _z_ = _z_, and where _&lambda;_ represents a coin that returns a number that is 1 with probability 1/(2<sup>_prec_</sup>) or 0 otherwise.  Return 1 minus the result of that run (leading to **1 &minus; expit(_&lambda;_\*_z_)**).

<a id=exp_minus___lambda____z></a>
#### exp(&minus;(_&lambda;_ \* _z_))

In the following algorithm:

- _z_ is 0 or greater, and written as a rational number (case 1), as an integer and fractional part (case 2), or as a sum of positive numbers (case 3), as described in the [**"ExpMinus" section**](#ExpMinus_exp_minus__z).
- _&lambda;_ is the probability of heads of an input coin, with 0 &le; _&lambda;_ &le; 1.

The algorithm follows.

- In case 1 (_z_ = _x_/_y_) (see also algorithm for exp(&minus;((1&minus;_&lambda;_)<sup>1</sup> \* _c_)) in "Other Factory Functions"):
    1. Special case: If _x_ is 0, return 1.
    2. Generate _N_, a Poisson random variate with mean _x_/_y_.  (See "[**Poisson Distribution**](https://peteroupc.github.io/randomfunc.html#Poisson_Distribution)" for one way to do this.)
    3. Flip the _&lambda;_ input coin until a flip returns 1 or the coin is flipped _N_ times, whichever comes first.  Return 0 if _N_ is greater than 0 and any of the flips, including the last, returns 1.  Otherwise, return 1. (The flips transform a Poisson variate with mean _x_/_y_ to one with mean _&lambda;_\*_x_/_y_; see (Devroye 1986, p. 487\)[^30].)
- In case 2 (_z_ = _m_ + _&nu;_):
    1. Set _j_ to 0, then while _j_ < _m_+1:
        1. Generate _N_, a Poisson random variate with mean 1.
        2. If _j_ = _m_, flip the _&nu;_ input coin _N_ times and set _N_ to the number of flips that return 1 this way.  (This transforms a Poisson variate with mean 1 to one with mean _&nu;_; see (Devroye 1986, p. 487\)[^30].)
        3. Flip the _&lambda;_ input coin until a flip returns 1 or the coin is flipped _N_ times, whichever comes first.  Return 0 if _N_ is greater than 0 and any of the flips, including the last, returns 1.
        4. Add 1 to _j_.
    2. Return 1.
- In case 3, rewrite the _z_ parameter as a sum of positive numbers.  For each number, run either case 1 or case 2 (depending on how the number is written) of this algorithm with that number as the parameter.  If any of these runs returns 0, return 0; otherwise, return 1.

> **Notes:**
>
> 1. The following is a proof of case 2 of this algorithm.  First, suppose $\lambda = 1$.  Each iteration of the loop in the algorithm returns 0 if a Poisson random variate with mean $t$ (see second substep of step 1) is other than 0, where $t$ is $\nu$ in the last iteration, or 1 otherwise. Since the Poisson variate is 0 with probability $\exp(-t)$, the iteration will terminate the algorithm with probability $1-\exp(-t)$ and "succeed" with probability $\exp(-t)$.  If all the iterations "succeed", the algorithm will return 1, which will happen with probability $\exp(-\nu) \cdot (\exp(-1))^m = \exp(-(m+\nu))$.  Now suppose 0 &le; $\lambda$ &lt; 1.  Then (due to the third substep of step 1) the Poisson variate just mentioned has mean $t\lambda$ rather than $t$, so that each iteration succeeds with probability $1-\exp(-t\lambda)$ and the final algorithm returns 1 with probability $\exp(-\nu\lambda) \cdot (\exp(-\lambda))^m = \exp(-(m+\nu)\lambda)$.
> 2. When _z_ is a rational number with 0 &le; _z_ &le; 1, this function can be rewritten as a power series expansion.  In that case, one way to simulate the function is to run the **general martingale algorithm** (see "[**Certain Power Series**](#Certain_Power_Series)"), with $g(\lambda) = \lambda$, and with parameter $d_0 = 1$ and coefficients $a_i = \frac{(-1)^i z^i}{i!}$, and return the result of that algorithm.
> 3. When _z_ is a rational number 0 or greater, this function can be simulated as follows: Let _m_ be floor(_c_).  Call the algorithm in note 2 _m_ times with _z_ = 1.  If any of these calls returns 0, return 0. Otherwise, if _z_ is an integer (that is, if floor(_z_) = _z_), return 1.  Otherwise, call the algorithm in note 2 once, with _z_ = _z_ &minus; floor(_z_).  Return the result of this call.
> 4. When _m_ = 0 and _&mu;_ = 1, this function, in case 2, becomes exp(&minus;_&lambda;_) and can be rewritten as a power series expansion.  In that case, one way to simulate the function is to use the **general martingale algorithm** (see "[**Certain Power Series**](#Certain_Power_Series)"), with $g(\lambda)=\lambda$, and with $d_0 = 1$ and coefficients $a_i = (-1)^i/(i!)$.[^53]

<a id=exp_minus_exp__m____lambda></a>
#### exp(&minus;exp(_m_ + _&lambda;_))

In the following algorithm, _m_ is an integer 0 or greater.

1. Generate a Poisson random variate with mean 3<sup>_m_+1</sup>, call it _n_.  (See "[**Poisson Distribution**](https://peteroupc.github.io/randomfunc.html#Poisson_Distribution)" for one way to do this.)
2. (Thin _n_ to a Poisson random variate with mean $\exp(m+\lambda)$, returning early if the variate would be greater than 0.) If _n_ is greater than 0, do the following _n_ times or until this algorithm returns a value:
    - Run the algorithm for **exp(_&lambda;_)/3** (see "Certain Power Series"), _m_ times, with _&lambda;_ being a coin that always returns 0.  Then run the algorithm for **exp(_&lambda;_)/3** once, with _&lambda;_ being the input coin.  If all these runs return 1, return 0.
3. Return 1.

> **Note:** The following is a proof this algorithm is valid.  Rewrite $\exp(m+\lambda)=3^{m+1}\cdot\frac{\exp(1)}{3}^m\cdot\frac{\exp(\lambda)}{3}$.  Step 1 generates a Poisson variate with mean $3^{m+1}$.  This variate is then thinned to a Poisson variate with mean $\exp(m+\lambda)$ in step 2, returning early if the new variate would be greater than 0 (because a Poisson variate with mean $\exp(m+\lambda)$ is 0 with probability $\exp(-\exp(m+\lambda))$).

<a id=exp_minus__m____lambda____k></a>
#### exp(&minus;(_m_ + _&lambda;_)<sup>_k_</sup>)

In the following algorithm, _m_ and _k_ are both integers 0 or greater.

1. If _k_ is 0, run the **ExpMinus** algorithm with parameter 1, and return the result.
2. If _k_ is 1, run the **ExpMinus** algorithm with parameter _m_ + _&lambda;_, and return the result.
3. (Expand (_m_ + _&lambda;_)<sup>_k_</sup> to a polynomial in _&lambda;_ in rest of algorithm.  First the _&lambda;_<sup>0</sup> term.) Run the **ExpMinus** algorithm with parameter _m_<sup>_k_</sup>.  If the algorithm returns 0, return 0.
4. (Now the _&lambda;_<sup>_k_</sup> term.) Run the **ExpMinus** algorithm with parameter 0 + _&mu;_, where _&mu;_ represents an input coin that does: "Flip the _&lambda;_ input coin _k_ times and return either 1 if all the flips return 1, or 0 otherwise". If the algorithm returns 0, return 0.
5. (Now the other terms.) If _m_ is 0, return 1.
6. Set _i_ to 1, then while _i_ < _k_:
     1. Set _w_ to choose(_k_, _i_) * _m_<sup>_k_ &minus; _i_</sup>.
     2. (Now the _&lambda;_<sup>_i_</sup> term.) Run the **ExpMinus** algorithm, _w_ times, with parameter 0 + _&mu;_, where _&mu;_ represents an input coin that does: "Flip the _&lambda;_ input coin _i_ times and return either 1 if all the flips return 1, or 0 otherwise".  If any of these calls returns 0, return 0.
     3. Add 1 to _i_.
7. Return 1.

<a id=exp___lambda___1_minus___lambda></a>
#### exp(_&lambda;_)*(1&minus;_&lambda;_)

(Flajolet et al., 2010\)[^1]\:

1. Set _k_ and _w_ each to 0.
2. Flip the input coin.  If it returns 0, return 1.
3. Generate a uniform random variate between 0 and 1 _U_.
4. If _k_ > 0 and _w_ is less than _U_, return 0.
5. Set _w_ to _U_, add 1 to _k_, and go to step 2.

<a id=1_minus_exp_minus__m____lambda____m____lambda></a>
#### (1 &minus; exp(&minus;(_m_ + _&lambda;_))) / (_m_ + _&lambda;_)

In this algorithm, _m_ + _&lambda;_ must be greater than 0.

1. If _m_ = 0, run the **general martingale algorithm** (see "[**Certain Power Series**](#Certain_Power_Series)"), with $g(\lambda)=\lambda$, and with $d_0 = 1$ and coefficients $a_i = \frac{(-1)^i}{(i+1)!}$, and return the result of that algorithm.
2. (_m_>0.) Run the **ExpMinus** algorithm with parameter _z_ = _m_ + _&lambda;_.  If it returns 1, return 0.
3. Run the algorithm for **_d_/(_c_+_&lambda;_)** with _d_=1 and _c_=_m_, and return the result of that algorithm.

<a id=expit__z__or_1_minus_1_1_exp__z__or_exp__z__1_exp__z__or_1_1_exp_minus__z></a>
#### expit(_z_) or 1&minus;1/(1+exp(_z_)) or exp(_z_)/(1+exp(_z_)) or 1/(1+exp(&minus;_z_))

expit(_z_), also known as the _logistic function_, is the probability that a random variate from the logistic distribution is _z_ or less.

_z_ is a number (positive or not) whose absolute value (abs(_z_)) is written in one of the ways described in the [**"ExpMinus" section**](#ExpMinus_exp_minus__z).

- If _z_ is known to be 0 or greater:
    1. Create an _R_ coin that runs the **ExpMinus** algorithm with parameter _z_.
    2. Run the algorithm for **_d_/(_c_+_&lambda;_)** with _d_=1, _c_=1, and with  _&lambda;_ being the _R_ coin, and return the result of that run.
- If _z_ is known to be 0 or less:
    1. Create a _R_ coin that runs the **ExpMinus** algorithm with parameter abs(_z_).
    2. Run the algorithm for **_d_/(_c_+_&lambda;_)** with _d_=1, _c_=1, and with  _&lambda;_ being the _R_ coin, and return **1 minus the result** of that run.

> **Note**: This algorithm can be used to simulate **expit(_&lambda;_\* _z_)**, where _&lambda;_ is the probability of heads of an input coin, with 0 &le; _&lambda;_ &le; 1, except it runs the **algorithm for exp(&minus;(_&lambda;_ \* _z_))** instead of the **ExpMinus** algorithm.

<a id=expit__z__2_minus_1_or_tanh__z__2></a>
#### expit(_z_)\*2 &minus; 1 or tanh(_z_/2)

In this algorithm, _z_ is 0 or greater and is written in one of the ways described in the [**"ExpMinus" section**](#ExpMinus_exp_minus__z).  `tanh` is the hyperbolic tangent function.

- Do the following process repeatedly, until this algorithm returns a value:
    1. Run the **ExpMinus** algorithm with parameter _z_.  Let _r_ be the result of that run.
    2. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return 1&minus;_r_.  Otherwise, if _r_ is 1, return 0.

> **Note:** Follows from observing that tanh(_z_/2) = (_d_ + (1 &minus; _&mu;_)) / (_c_ + _&mu;_), where _&mu;_ = exp(&minus;_z_), _d_ = 0, and _c_ = 1.  (See **algorithm for (_d_ + _&mu;_) / (_c_ + _&lambda;_)**.)

<a id=lambda___exp__z____lambda___exp__z__1_minus___lambda___or___lambda___exp__z__1___lambda___exp__z__minus_1></a>
#### _&lambda;_\*exp(_z_) / (_&lambda;_\*exp(_z_) + (1 &minus; _&lambda;_)) or _&lambda;_\*exp(_z_) / (1 + _&lambda;_\*(exp(_z_) &minus; 1))

In this algorithm:

- _z_ is an "exponential shift" (Peres et al. 2021\)[^54] or "exponential twist" (Sadowsky and Bucklew 1990)[^55]. Its absolute value is written in one of the ways described in the [**"ExpMinus" section**](#ExpMinus_exp_minus__z).
- _&lambda;_ is a coin that shows heads with probability equal to the probability to be shifted.

The algorithm follows:

- Do the following process repeatedly, until this algorithm returns a value:
    1. Flip the _&lambda;_ input coin.  Let _flip_ be the result of that flip.
    2. Run the algorithm for **expit(_z_)** with _z_=_z_. If the run returns 1 and if _flip_ is 1, return 1.  If the run returns 0 and if _flip_ is 0, return 0.

> **Note:** This is also a special case of the two-coin algorithm, where _&beta;_=1, _c_=exp(_z_), _d_=1, _&lambda;_ = _&lambda;_, and _&mu;_ = 1 &minus; _&lambda;_.

<a id=1_exp__z__minus__w__1_exp__z></a>
#### (1 + exp(_z_ &minus; _w_)) / (1 + exp(_z_))

In this algorithm, _z_ is a number (positive or not), and _w_ is 0 or greater, and their absolute values are each written in one of the ways described in the [**"ExpMinus" section**](https://peteroupc.github.io/bernoulli.html#ExpMinus_exp_minus__z)".

- If _z_ is known to be 0 or greater:
    - Run the **ExpMinus** algorithm with parameter _w_, then run the **expit(_z_)** algorithm with parameter _z_.  If the **ExpMinus** run returns 1 and the **expit** run returns 0, return 0.  Otherwise, return 1.
- If _z_ is known to be 0 or less:
    - Run the **ExpMinus** algorithm with parameter _w_, then run the **expit(_z_)** algorithm with parameter abs(_z_).  If both runs return 0, return 0.  Otherwise, return 1.

> **Notes:**
>
> 1. (1 + exp(_z_&minus;1)) / (1 + exp(_z_)) = $1-\frac{1 - e^{-1}}{e^{-z} + 1}$. (1 + exp(1&minus;1)) / (1 + exp(1)) = 2 / (1 + exp(2)) = (1 + exp(0)) / (1 + exp(1)).
> 2. For the similar function **(1 + exp(_z_)) / (1 + exp(_z_+1))**, use this algorithm with _w_ = 1, except add 1 to _z_ (if _z_ is written as an integer and fractional part, add 1 to the integer part; if written as a sum of numbers, append 1 to those numbers).

<a id=1_2_m___k____lambda___or_exp_minus__k____lambda___ln_2_m></a>
#### 1/(2<sup>_m_\*(_k_ + _&lambda;_)</sup>) or exp(&minus;(_k_ + _&lambda;_)\*ln(2<sup>_m_</sup>))

This new algorithm uses the base-2 logarithm _k_ + _&lambda;_ and is useful when this logarithm is very large.  In this algorithm, _k_ &ge; 0 is an integer, and _m_ &ge; 0 is an integer.

1. (Factor function in two parts.  First, simulate 1/(2<sup>_mk_</sup>).) If _k_ &gt; 0, generate unbiased random bits until a zero bit or _k_\*_m_ bits were generated this way, whichever comes first.  If a zero bit was generated this way, return 0.
2. (Rest of algorithm simulates 1/(2<sup>_m&lambda;_</sup>).) Create an input coin _&mu;_ that does the following: "Flip the input coin, then run the **algorithm for ln(1+_y_/_z_)** (given later) with _y_/_z_ = 1/1.  If both the call and the flip return 1, return 1.  Otherwise, return 0." (Simulates $\ln(2) \lambda$.)
3. Run the **ExpMinus** algorithm, with parameter 0 + _&mu;_ (using the _&mu;_ input coin), _m_ times.  If any of the runs returns 0, return 0.  Otherwise, return 1.

<a id=1_2__x___y____lambda___or_exp_minus___lambda___ln_2_x___y></a>
#### 1/(2<sup>(_x_/_y_)\*(_&lambda;_)</sup>) or exp(&minus;(_&lambda;_)\*ln(2<sup>_x_/_y_</sup>))

Based on the previous algorithm.  In this algorithm, _x_ &ge; 0 and _y_ &gt; 0 are integers.

1. Special case: If _x_ is 0, return 1.
2. Let _c_ = ceil(_x_/_y_). Create an input coin _&mu;_ that does the following: "Flip the input coin, then run the **algorithm for ln(1+_y_/_z_)** (given later) with _y_/_z_ = 1/1.  If both the call and the flip return 1, return a number that is 1 with probability _x_/(_y_\*_c_) and 0 otherwise.  Otherwise, return 0." (Simulates $\ln(2) \frac{xy}{c} \lambda$.)
3. Run the **ExpMinus** algorithm, with parameter 0 + _&mu;_ (using the _&mu;_ input coin), _c_ times.  If any of the runs returns 0, return 0.  Otherwise, return 1.

<a id=Two_Coin_Algorithm__c____lambda_____beta_____beta____c____lambda____d____mu___minus___beta___minus_1__c___d></a>
#### Two-Coin Algorithm (_c_ * _&lambda;_ * _&beta;_ / (_&beta;_ * (_c_ * _&lambda;_ + _d_ * _&mu;_) &minus; (_&beta;_ &minus; 1) * (_c_ + _d_)))

This is the general **two-coin algorithm** of (Gonçalves et al., 2017\)[^56] and (Vats et al. 2022\)[^57].  It takes two input coins that each output heads (1) with probability _&lambda;_ or _&mu;_, respectively.  It also takes parameters _c_ and _d_, each 0 or greater, and _&beta;_ in the interval \[0, 1\], which is a so-called "portkey" or early rejection parameter (when _&beta;_ = 1, the formula simplifies to _c_ * _&lambda;_ / (_c_ * _&lambda;_ + _d_ * _&mu;_)).  In Vats et al. (2022\)[^57], _&beta;_, _c_, _d_, _&lambda;_ and _&mu;_ correspond to _&beta;_, _c_<sub>_y_</sub>, _c_<sub>_x_</sub>, _p_<sub>_y_</sub>, and _p_<sub>_x_</sub>, respectively, in the "portkey" algorithm, or to _&beta;_, _c̃_<sub>_x_</sub>, _c̃_<sub>_y_</sub>, _p̃_<sub>_x_</sub>, and _p̃_<sub>_y_</sub>, respectively, in the "flipped portkey" algorithm.

1. With probability _&beta;_, go to step 2.  Otherwise, return 0. (For example, call `ZeroOrOne` with _&beta;_'s numerator and denominator, and return 0 if that call returns 0, or go to step 2 otherwise.  `ZeroOrOne` is described in my article on [**random sampling methods**](https://peteroupc.github.io/randomfunc.html#Boolean_True_False_Conditions).)
2. With probability _c_ / (_c_ + _d_), flip the _&lambda;_ input coin.  Otherwise, flip the _&mu;_ input coin.  If the _&lambda;_ input coin returns 1, return 1.  If the _&mu;_ input coin returns 1, return 0.  If the corresponding coin returns 0, go to step 1.

<a id=c____lambda____c____lambda____d__or__c___d____lambda___1__c___d____lambda></a>
#### _c_ * _&lambda;_ / (_c_ * _&lambda;_ + _d_) or (_c_/_d_) * _&lambda;_ / (1 + (_c_/_d_) * _&lambda;_))

This algorithm, also known as the **logistic Bernoulli factory** (Huber 2016\)[^42], (Morina et al., 2022\)[^17], is a special case of the two-coin algorithm above, but this time uses only one input coin.

1. With probability _d_ / (_c_ + _d_), return 0.
2. Flip the input coin.  If the flip returns 1, return 1.  Otherwise, go to step 1.

> **Note:** Huber (2016) specifies this Bernoulli factory in terms of a Poisson point process, which seems to require much more randomness on average.

<a id=d____lambda____c></a>
#### (_d_ + _&lambda;_) / _c_

In this algorithm, _d_ and _c_ must be integers, and 0 &le; _d_ < _c_.

1. Generate an integer in [0, _c_) uniformly at random, call it _i_.
2. If _i_ < _d_, return 1.  If _i_ = _d_, flip the input coin and return the result.  If neither is the case, return 0.

<a id=d___c____lambda></a>
#### _d_ / (_c_ + _&lambda;_)

In this algorithm, _c_ and _d_ must be rational numbers, _c_ &ge; 1, and 0 &le; _d_ &le; _c_.  See also the algorithms for continued fractions.  (For example, when _d_ = 1, this algorithm can simulate a probability of the form 1 / _z_, where _z_ is 1 or greater and made up of an integer part (_c_) and a fractional part (_&lambda;_) that can be simulated by a Bernoulli factory.)

1. With probability _c_ / (1 + _c_), return a number that is 1 with probability _d_/_c_ and 0 otherwise.
2. Flip the input coin.  If the flip returns 1, return 0.  Otherwise, go to step 1.

> **Note**: A quick proof this algorithm works: Let _x_ be the desired probability.  Then&mdash;<br>_x_ = (_c_ / (1 + _c_)) \* (_d_/_c_) +<br>(1&minus;_c_ / (1 + _c_)) \* (_&lambda;_\*0 + (1&minus;_&lambda;_)\*_x_),<br>and solving for _x_ leads to _x_=_d_/(_c_+_&lambda;_).

<a id=d____mu____c____lambda></a>
#### (_d_ + _&mu;_) / (_c_ + _&lambda;_)

Combines the algorithms in the previous two sections.

In this algorithm, _c_ and _d_ must be integers, and 0 &le; _d_ < _c_.

1. With probability _c_ / (1 + _c_), do the following:
    1. Generate an integer in [0, _c_) uniformly at random, call it _i_.
    2. If _i_ < _d_, return 1.  If _i_ = _d_, flip the _&mu;_ input coin and return the result.  If neither is the case, return 0.
2. Flip the _&lambda;_ input coin.  If the flip returns 1, return 0.  Otherwise, go to step 1.

<a id=d____mu____d____mu____c____lambda></a>
#### (_d_ + _&mu;_) / ((_d_ + _&mu;_) + (_c_ + _&lambda;_))

In this algorithm, _c_ and _d_ are integers 0 or greater, and _&lambda;_ and _&mu;_ are the probabilities of heads of two different input coins.  In the intended use of this algorithm, _&lambda;_ and _&mu;_ are backed by the fractional parts of two uniform partially-sampled random numbers (PSRNs), and _c_ and _d_ are their integer parts, respectively.

1. Let _D_ = _d_ and _C_ = _c_. Run the algorithm for **(_d_ + _&mu;_) / (_c_ + _&lambda;_)** with _&lambda;_ and _&mu;_ both being the _&mu;_ input coin, with _d_ = _D_+_C_, and with _c_ = 1+_D_ + _C_.  If the run returns 1:
    1. If _c_ is 0, return 1.
    2. Run the algorithm for **(_d_ + _&mu;_) / (_c_ + _&lambda;_)** with _&lambda;_ and _&mu;_ both being the _&mu;_ input coin, with _d_ = _D_, and with _c_ = _D_ + _C_.  If the run returns 1, return 1.  Otherwise, return 0.
2. Flip the _&lambda;_ input coin. If the flip returns 1, return 0. Otherwise, go to step 1.

<a id=d__k___c____lambda____k__or__d___c____lambda____k></a>
#### _d_<sup>_k_</sup> / (_c_ + _&lambda;_)<sup>_k_</sup>, or (_d_ / (_c_ + _&lambda;_))<sup>_k_</sup>

In this algorithm, _c_ and _d_ must be rational numbers, _c_ &ge; 1, and 0 &le; _d_ &le; _c_, and _k_ must be an integer 0 or greater.

1. Set _i_ to 0.
2. If _k_ is 0, return 1.
3. With probability _c_ / (1 + _c_), do the following:
    1. With probability _d_/_c_, add 1 to _i_ and then either return 1 if _i_ is now _k_ or greater, or abort these substeps and go to step 2 otherwise.
    2. Return 0.
4. Flip the input coin.  If the flip returns 1, return 0.  Otherwise, go to step 2.

<a id=1_1___lambda></a>
#### 1/(1+_&lambda;_)

This algorithm is a special case of the two-coin algorithm of (Gonçalves et al., 2017\)[^56] and has bounded expected running time for all _&lambda;_ parameters.[^58]

1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return 1.
2. Flip the input coin.  If it returns 1, return 0.  Otherwise, go to step 1.

> **Note:** In this special case of the two-coin algorithm, _&beta;_=1, _c_=1, _d_=1, old _&lambda;_ equals 1, and _&mu;_ equals new _&lambda;_.

<a id=1_2_minus___lambda></a>
#### 1/(2 &minus; _&lambda;_)

1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return 1.
2. Flip the input coin.  **If it returns 0**, return 0.  Otherwise, go to step 1.

> **Note:** Can be derived from the previous algorithm by observing that 1/(2 &minus; _&lambda;_) = 1/(1 + (1 &minus; _&lambda;_)).

<a id=1_1__m____lambda___2></a>
#### 1/(1+(_m_+_&lambda;_)<sup>2</sup>)

This is a rational function (ratio of two polynomials) with variable _&lambda;_, and this rational function admits the following algorithm.  In this algorithm, _m_ must be an integer 0 or greater, and _&lambda;_ is the unknown heads probability of a coin.

1. Let _d_ be the three-item list [1, 2, 1] \(for numerator 1).  Let _e_ be the three-item list [1+m<sup>2</sup>, 2\*(1+m<sup>2</sup>+m), 1+m<sup>2</sup>+2\*m+1] \(for denominator).  Find the highest number in _e_, then divide each item in _d_ and in _e_ by that number (using rational arithmetic).
2. Run the first algorithm for [**rational functions**](https://peteroupc.github.io/bernoulli.html#Certain_Rational_Functions) in "Bernoulli Factory Algorithms", with _n_ = 2, and with _d_ and _e_ given above.

<a id=1_1__x___y____lambda></a>
#### 1 / (1 + (_x_/_y_)\*_&lambda;_)

Another special case of the two-coin algorithm.  In this algorithm, _x_/_y_ must be 0 or greater.

1. With probability _y_/(_x_+_y_), return 1.
2. Flip the input coin.  If the flip returns 1, return 0.  Otherwise, go to step 1.

> **Note:** In this special case of the two-coin algorithm, _&beta;_=1, _c_=1, _d_=_x_/_y_, old _&lambda;_ equals 1, and _&mu;_ equals new _&lambda;_.
>
> **Example**:  **_&mu;_ / (1 + (_x_/_y_)\*_&lambda;_)** (takes two input coins that simulate _&lambda;_ or _&mu;_, respectively): Run the **algorithm for 1 / (1 + (_x_/_y_)\*_&lambda;_)** using the _&lambda;_ input coin.  If it returns 0, return 0.  Otherwise, flip the _&mu;_ input coin and return the result.

<a id=lambda___x___y></a>
#### _&lambda;_<sup>_x_/_y_</sup>

In the algorithm below, the case where 0 &lt; _x_/_y_ &lt; 1 is due to Mendo (2019\)[^24].  The algorithm works only when _x_/_y_ is 0 or greater.

1. If _x_/_y_ is 0, return 1.
2. If _x_/_y_ is equal to 1, flip the input coin and return the result.
3. If _x_/_y_ is greater than 1:
    1. Set _ipart_ to floor(_x_/_y_) and _fpart_ to rem(_x_, _y_) (equivalent to _x_ - _y_\*floor(_x_/_y_)).
    2. If _fpart_ is greater than 0, subtract 1 from _ipart_, then call this algorithm recursively with _x_ = floor(_fpart_/2) and _y_ = _y_, then call this algorithm, again recursively, with _x_ = _fpart_ &minus; floor(_fpart_/2) and _y_ = _y_. Return 0 if either call returns 0.  (This is done rather than the more obvious approach in order to avoid calling this algorithm with fractional parts very close to 0, because the algorithm runs much more slowly than for fractional parts closer to 1.)
    3. If _ipart_ is 1 or greater, flip the input coin _ipart_ many times.  Return 0 if any of these flips returns 1.
    4. Return 1.
4. _x_/_y_ is less than 1, so set _i_ to 1.
5. Do the following process repeatedly, until this algorithm returns a value:
    1. Flip the input coin; if it returns 1, return 1.
    2. With probability _x_/(_y_\*_i_), return 0. (Note: _x_/(_y_\*_i_) = (_x_/_y_) \* (1/_i_).)
    3. Add 1 to _i_.

> **Notes:**
>
> 1. When _x_/_y_ is less than 1, the expected number of flips grows without bound as _&lambda;_ approaches 0.  In fact, no fast Bernoulli factory algorithm can avoid this unbounded growth without additional information on _&lambda;_ (Mendo 2019\)[^24].
> 2. Another algorithm is discussed in the online community [**Cross Validated**](https://stats.stackexchange.com/questions/50272).

<a id=sqrt___lambda></a>
#### sqrt(_&lambda;_)

Special case of the previous algorithm with _&mu;_ = 1/2.

- Set _i_ to 1.  Then do the following process repeatedly, until this algorithm returns a value:
    1. Flip the input coin. If it returns 1, return 1.
    2. With probability 1/(_i_\*2), return 0.
    3. Add 1 to _i_ and go to step 1.

<a id=arctan___lambda_____lambda></a>
#### arctan(_&lambda;_) /_&lambda;_

arctan(_&lambda;_) is the inverse tangent of _&lambda;_.

Based on the algorithm from Flajolet et al. (2010\)[^1], but uses the two-coin algorithm (which has bounded expected running time for every _&lambda;_ parameter) rather than the even-parity construction (which does not).[^32][^54]

- Do the following process repeatedly, until this algorithm returns a value:
    1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return 1.
    2. Generate a uniform random variate between 0 and 1 _u_, if it wasn't generated yet.
    3. [**Sample from the number _u_**](#Implementation_Notes) twice, and flip the input coin twice.  If all of these calls and flips return 1, return 0.

<a id=arctan___lambda></a>
#### arctan(_&lambda;_)

(Flajolet et al., 2010\)[^1]\: Call the **algorithm for arctan(_&lambda;_) /_&lambda;_** and flip the input coin.  Return 1 if the call and flip both return 1, or 0 otherwise.

<a id=cos___lambda></a>
#### cos(_&lambda;_)

This function can be rewritten as a power series expansion.  To simulate it, use the **general martingale algorithm** (see "[**Certain Power Series**](#Certain_Power_Series)"), with $g(\lambda)=\lambda$, and with $d_0 = 1$ and coefficients $a_i = (-1)^{i/2} / (i!)$ if $i$ is even[^27] and 0 otherwise.

<a id=sin___lambda___sqrt__c____lambda___sqrt__c></a>
#### sin(_&lambda;_\*sqrt(_c_)) / (_&lambda;_\*sqrt(_c_))

This function can be rewritten as a power series expansion.  To simulate it, use the **general martingale algorithm** (see "[**Certain Power Series**](#Certain_Power_Series)"), with $g(\lambda)=\lambda$, and with $d_0 = 1$ and coefficients $a_i = \frac{ (-1)^{i/2} c^{i/2}}{(i+1)!}$ if $i$ is even[^27] and 0 otherwise.  In this algorithm, _c_ must be a rational number in the interval (0, 6].

<a id=sin___lambda></a>
#### sin(_&lambda;_)

Equals the previous function times _&lambda;_, with _c_ = 1.

- Flip the input coin.  If it returns 0, return 0.  Otherwise, run the algorithm for **sin(_&lambda;_\*sqrt(_c_)) / (_&lambda;_\*sqrt(_c_))** with _c_ = 1, then return the result.

<a id=ln_1___lambda></a>
#### ln(1+_&lambda;_)

Based on the algorithm from Flajolet et al. (2010\)[^1], but uses the two-coin algorithm (which has bounded expected running time for every _&lambda;_ parameter) rather than the even-parity construction (which does not).[^32][^55]

- Do the following process repeatedly, until this algorithm returns a value:
    1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), flip the input coin and return the result.
    2. Generate a uniform random variate between 0 and 1 _u_, if _u_ wasn't generated yet.
    3. [**Sample from the number _u_**](#Implementation_Notes), then flip the input coin.  If the call and the flip both return 1, return 0.

<a id=ln__c____lambda____c____lambda></a>
#### ln(_c_+_&lambda;_)/(_c_+_&lambda;_)

In this algorithm:

- _c_ is a rational number and is 1 or greater.
- _&lambda;_ is the unknown heads probability of a coin.

The algorithm follows.

1. Run the algorithm for **_d_ / (_c_ + _&lambda;_)**, with _d_=1 and _c_=_c_, repeatedly, until the run returns 1, then set _g_ to the number of runs that returned 0 this way.
2. If _g_ is 0, return 0.  Otherwise, return a number that is 1 with probability 1/_g_ or 0 otherwise.

> **Note:** This algorithm is based on the [**von Neumann schema**](https://peteroupc.github.io/bernoulli.html#Flajolet_s_Probability_Simulation_Schemes) with the single-cycle permutation class.  In this case, given a coin that shows heads with probability _z_, the schema will terminate in one iteration with probability (1&minus;_z_)\*ln(1/(1&minus;_z_)).  (In step 2 of the algorithm, returning 0 means that the von Neumann schema would require another iteration.) Thus, if the coin shows heads with probability 1 &minus; _z_, the one-iteration probability is _z_\*ln(1/_z_), so if the coin shows heads with probability 1 &minus; 1/(_m_+_z_), the one-iteration probability is (1/(_m_+_z_))\*ln(1/(1/(_m_+_z_))) = ln(_m_+_z_)/(_m_+_z_).

<a id=arcsin___lambda___sqrt_1_minus___lambda__2_minus_1></a>
#### arcsin(_&lambda;_) + sqrt(1 &minus; _&lambda;_<sup>2</sup>) &minus; 1

(Flajolet et al., 2010\)[^1].  arcsin(_&lambda;_) is the inverse sine of _&lambda;_.  The algorithm given here uses the two-coin algorithm rather than the even-parity construction[^32].

1. Generate a uniform random variate between 0 and 1 _u_.
2. Create a secondary coin _&mu;_ that does the following: "[**Sample from the number _u_**](#Implementation_Notes) twice, and flip the input coin twice.  If all of these calls and flips return 1, return 0.  Otherwise, return 1."
3. Call the **algorithm for _&mu;_<sup>1/2</sup>** using the secondary coin _&mu;_.  If it returns 0, return 0.
4. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), flip the input coin and return the result.
5. [**Sample from the number _u_**](#Implementation_Notes) once, and flip the input coin once.  If both the call and flip return 1, return 0.  Otherwise, go to step 4.

<a id=tanh__z></a>
#### tanh(_z_)

`tanh` is the hyperbolic tangent function.  In this algorithm, _z_ is 0 or greater and is written in one of the ways described in the [**"ExpMinus" section**](#ExpMinus_exp_minus__z).[^59]

- Do the following process repeatedly, until this algorithm returns a value:
    1. Run the **ExpMinus** algorithm, with parameter _z_, twice.  Let _r_ be a number that is 1 if both runs returned 1, or 0 otherwise.
    2. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return 1&minus;_r_.  Otherwise, if _r_ is 1, return 0.

> **Note:** Follows from observing that tanh(_z_) = (_d_ + (1 &minus; _&mu;_)) / (_c_ + _&mu;_), where _&mu;_ = (exp(&minus;_z_))<sup>2</sup>, _d_ = 0, and _c_ = 1.

<a id=Expressions_Involving_Polylogarithms></a>
#### Expressions Involving Polylogarithms

The following algorithm simulates the expression Li<sub>_r_</sub>(_&lambda;_) * (1 / _&lambda;_ &minus; 1), where Li<sub>_r_</sub>(.) is a polylogarithm of order _r_, and _r_ is an integer 1 or greater.    However, even with a relatively small _r_ such as 6, the expression quickly approaches a straight line.

If _&lambda;_ is 1/2, this expression simplifies to Li<sub>_r_</sub>(1/2). See also (Flajolet et al., 2010\)[^1].  See also "[**Convex Combinations**](#Convex_Combinations)" (the case of 1/2 works by decomposing the series forming the polylogarithmic constant into _g_(_i_) = (1/2)<sup>_i_</sup>, which sums to 1, and _h_<sub>_i_</sub>() = 1/_i_<sup>_r_</sup>, where _i_ &ge; 1).

1. Flip the input coin until it returns 0, and let _t_ be 1 plus the number of times the coin returned 1 this way.
2. Return a number that is 1 with probability 1/_t_<sup>_r_</sup> and 0 otherwise.

<a id=min___lambda___1_2_and_min___lambda___1_minus___lambda></a>
#### min(_&lambda;_, 1/2) and min(_&lambda;_, 1&minus;_&lambda;_)

My own algorithm for min(_&lambda;_, 1/2) is as follows.  See the end of this section for the derivation of this algorithm.

1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), flip the input coin and return the result.
2. Run the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) given later, and return the result of that run.

And the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) is as follows:

1. (Random walk.) Generate unbiased random bits until more zeros than ones are generated this way for the first time.  Then set _m_ to (_n_&minus;1)/2+1, where _n_ is the number of bits generated this way.
2. (Build a degree-_m_\*2 polynomial equivalent to (4\*_&lambda;_\*(1&minus;_&lambda;_))<sup>_m_</sup>/2.) Let _z_ be (4<sup>_m_</sup>/2)/choose(_m_\*2,_m_).  Define a polynomial of degree _m_\*2 whose (_m_\*2)+1 Bernstein coefficients are all zero except the _m_<sup>th</sup> coefficient (starting at 0), whose value is _z_.  Elevate the degree of this polynomial enough times so that all its coefficients are 1 or less (degree elevation increases the polynomial's degree without changing its shape or position; see the derivation at the end of this section).  Let _d_ be the new polynomial's degree.
3. (Simulate the polynomial, whose degree is _d_ (Goyal and Sigman 2012\)[^6].) Flip the input coin _d_ times and set _h_ to the number of ones generated this way.  Let _a_ be the _h_<sup>th</sup> Bernstein coefficient (starting at 0) of the new polynomial.  With probability _a_, return 1.  Otherwise, return 0.

I suspected that the required degree _d_ would be floor(_m_\*2/3)+1, as described in the appendix.  With help from the [**MathOverflow community**](https://mathoverflow.net/questions/381419), steps 2 and 3 of the algorithm above can be described more efficiently as follows:

- (2.) Let _r_ be floor(_m_\*2/3)+1, and let _d_ be _m_\*2+_r_.
- (3.) (Simulate the polynomial, whose degree is _d_.) Flip the input coin _d_ times and set _h_ to the number of ones generated this way.  Let _a_ be (1/2) \* 2<sup>_m_\*2</sup>\*choose(_r_,_h_&minus;_m_)/choose(_d_, _h_) (the polynomial's _h_<sup>th</sup> Bernstein coefficient starting at 0; the first term is 1/2 because the polynomial being simulated has the value 1/2 at the point 1/2).  With probability _a_, return 1.  Otherwise, return 0.

The min(_&lambda;_, 1&minus;_&lambda;_) algorithm can be used to simulate certain other piecewise linear functions with three breakpoints, and algorithms for those functions are shown in the following table.  In the table, _&mu;_ is the unknown probability of heads of a second input coin, and _&nu;_ is the unknown probability of heads of a third input coin.

|  Breakpoints  | Algorithm |
 --- | --- |
| 0 at 0; _&nu;_/2 at 1/2; and _&nu;_\*_&mu;_ at 1. | Flip the _&nu;_ input coin.  If it returns 0, return 0.  Otherwise, flip the _&mu;_ input coin.  If it returns 1, flip the _&lambda;_ input coin and return the result.  Otherwise, run the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) using the _&lambda;_ input coin, and return the result of that run. |
| (1&minus;_&mu;_)/2 at 0; 1/2 at 1/2; and _&mu;_/2 at 1. | Generate an unbiased random bit.  If that bit is 1, run the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) using the _&lambda;_ input coin, and return the result of that run.  Otherwise, flip the _&mu;_ input coin.  If it returns 1, flip the _&lambda;_ input coin and return the result.  Otherwise, flip the _&lambda;_ input coin and return 1 minus the result. |
| 0 at 0; _&mu;_/2 at 1/2; and _&mu;_/2 at 1. | Flip the _&mu;_ input coin.  If it returns 0, return 0.  Otherwise, generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), flip the _&lambda;_ input coin and return the result.  Otherwise, run the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) using the _&lambda;_ input coin, and return the result of that run. |
| _&mu;_ at 0; 1/2 at 1/2; and 0 at 1. | Flip the _&mu;_ input coin.  If it returns 1, flip the _&lambda;_ input coin and return 1 minus the result.  Otherwise, run the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) using the _&lambda;_ input coin, and return the result of that run. |
| 1 at 0; 1/2 at 1/2; and _&mu;_ at 1. | Flip the _&mu;_ input coin.  If it returns 0, flip the _&lambda;_ input coin and return 1 minus the result.  Otherwise, run the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) using the _&lambda;_ input coin, and return 1 minus the result of that run. |
| _&mu;_ at 0; 1/2 at 1/2; and 1 at 1. | Flip the _&mu;_ input coin.  If it returns 0, flip the _&lambda;_ input coin and return the result.  Otherwise, run the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) using the _&lambda;_ input coin, and return 1 minus the result of that run. |
| _B_ at 0; _B_+(_A_/2) at 1/2; and _B_+(_A_/2) at 1. | (_A_&le;1 and _B_&le;1&minus;_A_ are rational numbers.) With probability 1&minus;_A_, return a number that is 1 with probability _B_/(1&minus;_A_) and 0 otherwise.  Otherwise, generate an unbiased random bit.  If that bit is 1, flip the _&lambda;_ input coin and return the result.  Otherwise, run the algorithm for min(_&lambda;_, 1&minus;_&lambda;_) using the _&lambda;_ input coin, and return the result of that run. |

> **Example:** Let $f$ be $\lambda/2$ if $\lambda\le 1/2$, and $1/2-\lambda/2$ otherwise.  Then use the algorithm for 0 at 0; _&nu;_/2 at 1/2; and _&nu;_\*_&mu;_ at 1, where _&nu;_ is a coin that returns 1 with probability 1/2 and 0 otherwise, and _&mu;_ is a coin that always returns 0.
>
> **Note:** The following explains how the algorithm is derived. The function min(_&lambda;_, 1/2) can be rewritten as _A_ + _B_ where&mdash;
>
> - _A_  = (1/2) \* _&lambda;_, and
> - _B_ = (1/2) \* min(_&lambda;_, 1&minus;_&lambda;_)<br/>&nbsp;&nbsp;= (1/2) \* ((1&minus;sqrt(1&minus;4\*_&lambda;_\*(1&minus;_&lambda;_)))/2)<br/>&nbsp;&nbsp;= (1/2) \* $\sum_{k\ge 1} h_k(\lambda)$,
>
> revealing that the function is a [**convex combination**](#Convex_Combinations), and _B_ is itself a convex combination where&mdash;
>
> - _g_(_k_) = choose(2\*_k_,_k_)/((2\*_k_&minus;1)\*2<sup>2*_k_</sup>), and
> - _h_<sub>_k_</sub>(_&lambda;_) = (4\*_&lambda;_\*(1&minus;_&lambda;_))<sup>_k_</sup> / 2 = (_&lambda;_\*(1&minus;_&lambda;_))<sup>_k_</sup> * 4<sup>_k_</sup> / 2
>
> (see also Wästlund (1999)[^8]; Dale et al. (2015)[^60]).  The right-hand side of _h_, which is the polynomial built in step 3 of the algorithm for min(_&lambda;_, 1&minus;_&lambda;_), is a polynomial of degree _k_\*2 with Bernstein coefficients&mdash;
>
> - _z_ = (4<sup>_v_</sup>/2) / choose(_v_*2,_v_) at _v_=_k_, and
> - 0 elsewhere.
>
> Unfortunately, _z_ can be greater than 1, so that the polynomial can't be simulated, as is, using the Bernoulli factory algorithm for [**polynomials in Bernstein form**](https://peteroupc.github.io/bernoulli.html#Certain_Polynomials_in_Bernstein_Form).  Fortunately, the polynomial's degree can be elevated to bring the Bernstein coefficients to 1 or less (for degree elevation and other algorithms, see Tsai and Farouki (2001)[^61]).  Moreover, due to the special form of the Bernstein coefficients in this case, the degree elevation process can be greatly simplified.  Given an even degree _d_ as well as _z_ (as defined above), the degree elevation is as follows:
>
> 1. Set _r_ to floor(_d_/3) + 1. (This starting value is because when this routine finishes, _r_/_d_ appears to converge to 1/3 as _d_ gets large, for the polynomial in question.)  Let _c_ be choose(_d_,_d_/2).
> 2. Create a list of _d_+_r_+1 Bernstein coefficients, all zeros.
> 3. For each integer _i_ satisfying 0 &le; _i_ &le; _d_+_r_:
>      - If max(0, _i_&minus;_r_) &le; _d_/2 and if _d_/2 &le; min(_d_, _i_), set the _i_<sup>th</sup> Bernstein coefficient (starting at 0) to _z_\*_c_\*choose(_r_,_i_&minus;_d_/2)\* / choose(_d_+_r_, _i_).
> 4. If all the Bernstein coefficients are 1 or less, return them.  Otherwise, add _d_/2 to _r_ and go to step 2.

<a id=Algorithms_for_Specific_Functions_of___lambda___Probability_Sensitive></a>
### Algorithms for Specific Functions of _&lambda;_ (Probability-Sensitive)

This section describes algorithms for specific functions that require knowing certain information on the probability of input coins.

<a id=lambda_____mu></a>
#### _&lambda;_ + _&mu;_

(Nacu and Peres 2005, proposition 14(iii)\)[^16].  This algorithm takes two input coins that simulate _&lambda;_ or _&mu;_, respectively, and a parameter _&#x03F5;_ such that 0 &lt; _&#x03F5;_ &le; 1 &minus; _&lambda;_ &minus; _&mu;_.

1. Create a _&nu;_ input coin that does the following: "Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), flip the _&lambda;_ input coin and return the result.  Otherwise, flip the _&mu;_ input coin and return the result."
2. Run a [**linear Bernoulli factory**](#Linear_Bernoulli_Factories) using the _&nu;_ input coin, _x_/_y_ = 2/1, and _&#x03F5;_ = _&#x03F5;_, and return the result.

<a id=lambda___minus___mu></a>
#### _&lambda;_ &minus; _&mu;_

(Nacu and Peres 2005, proposition 14(iii-iv)\)[^16].  This algorithm takes two input coins that simulate _&lambda;_ or _&mu;_, respectively, and a parameter _&#x03F5;_ such that 0 &lt; _&#x03F5;_ &le; _&lambda;_ &minus; _&mu;_ \(the greater _&#x03F5;_ is, the more efficient\).

1. Create a _&nu;_ input coin that does the following: "Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), flip the _&lambda;_ input coin and return **1 minus the result**.  Otherwise, flip the _&mu;_ input coin and return the result."
2. Run a [**linear Bernoulli factory**](#Linear_Bernoulli_Factories) using the _&nu;_ input coin, _x_/_y_ = 2/1, and _&#x03F5;_ = _&#x03F5;_, and return 1 minus the result.

<a id=x03F5_____lambda></a>
#### _&#x03F5;_ / _&lambda;_

(Lee et al. 2014\)[^62].  In the following algorithm:

- _&lambda;_ is the probability of heads of an input coin.
- _&#x03F5;_ is a rational number that satisfies 0 &lt; _&#x03F5;_ &le; _&lambda;_ &le; 1.

The algorithm follows.

1. Set _&beta;_ to max(_&#x03F5;_, 1/2) and set _&gamma;_ to 1 &minus; (1 &minus; _&beta;_) / (1 &minus; (_&beta;_ / 2)).
2. Create a _&mu;_ input coin that flips the input coin and returns 1 minus the result.
3. With probability _&#x03F5;_, return 1.
4. Run a [**linear Bernoulli factory**](#Linear_Bernoulli_Factories) with the _&mu;_ input coin, _x_/_y_ = 1 / (1 &minus; _&#x03F5;_), and _&#x03F5;_ = _&gamma;_. If the result is 0, return 0.  Otherwise, go to step 3.  (Running the linear Bernoulli factory this way simulates the probability (_&lambda;_ &minus; _&#x03F5;_)/(1 &minus; _&#x03F5;_) or 1 &minus; (1 &minus; _&lambda;_)/(1 &minus; _&#x03F5;_)).

<a id=mu_____lambda></a>
#### _&mu;_ / _&lambda;_

(Morina 2021\)[^63].  In this division algorithm:

- _&mu;_ is the probability of heads of an input coin and represents the dividend.
- _&lambda;_ is the probability of heads of another input coin, represents the divisor, and satisfies 0 &le; _&mu;_ &lt; _&lambda;_ &le; 1.
- _&#x03F5;_ is a rational number that satisfies 0 &lt; _&#x03F5;_ &le; _&lambda;_ &minus; _&mu;_.  _&#x03F5;_ can be a positive rational number that equals a lower bound for _&lambda;_ minus an upper bound for _&mu;_.

The algorithm follows.

- Do the following process repeatedly, until this algorithm returns a value:
    1. Generate an unbiased random bit (either 0 or 1 with equal probability).
    2. If the bit generated in step 1 is 1, flip the _&mu;_ input coin.  If it returns 1, return 1.
    3. If the bit generated in step 1 is 0, run the **algorithm for _&lambda;_ &minus; _&mu;_** with _&#x03F5;_ = _&#x03F5;_. If it returns 1, return 0.

<a id=lambda____x___y></a>
#### _&lambda;_ * _x_/_y_

In general, this function will touch 0 or 1 at some point greater than 0 and less than 1, when _x_/_y_ > 1.  This makes the function relatively non-trivial to simulate in this case.

Huber has suggested several algorithms for this function over the years.

The first algorithm in this document comes from Huber (2014\)[^4].  It uses three parameters:

- _x_ and _y_ are integers such that _x_/_y_ > 0 and _y_!=0.
- _&#x03F5;_ is a rational number greater than 0 and less than 1.  If _x_/_y_ is greater than 1, _&#x03F5;_ must be such that 0 &lt; _&#x03F5;_ &le;1 &minus; _&lambda;_ * _x_/_y_, in order to bound the function away from 0 and 1.  The greater _&#x03F5;_ is, the more efficient.

As a result, some knowledge of _&lambda;_ has to be available to the algorithm. The algorithm as described below also includes certain special cases, not mentioned in Huber, to make it more general.

1. Special cases: If _x_ is 0, return 0.  Otherwise, if _x_ equals _y_, flip the input coin and return the result.  Otherwise, if _x_ is less than _y_, then do the following: "With probability _x_/_y_, flip the input coin and return the result; otherwise return 0."
2. Set _c_ to _x_/_y_, and set _k_ to 23 / (5 * _&#x03F5;_).
3. If _&#x03F5;_ is greater than 644/1000, set _&#x03F5;_ to 644/1000.
4. Set _i_ to 1.
5. While _i_ is not 0:
    1. Flip the input coin.  If it returns 0, then generate numbers that are each 1 with probability (_c_ &minus; 1) / _c_ and 0 otherwise, until 1 is generated this way, then add 1 to _i_ for each number generated this way (including the last).
    2. Subtract 1 from _i_.
    3. If _i_ is _k_ or greater:
        1. Generate _i_ numbers that are each 1 with probability 2 / (_&#x03F5;_ + 2) or 0 otherwise.  If any of those numbers is 0, return 0.
        2. Multiply _c_ by 2 / (_&#x03F5;_ + 2), then divide _&#x03F5;_ by 2, then multiply _k_ by 2.
9. (_i_ is 0.) Return 1.

Huber (2016\)[^42] presented a second algorithm using the same three parameters, but it's omitted here because it appears to perform worse than the algorithm given above and the **algorithm for (_&lambda;_ * _x_/_y_)<sup>_i_</sup>** below (see also Morina 2021[^63]).

Huber (2016) also included a third algorithm that simulates _&lambda;_ * _x_ / _y_.  The algorithm works only if _&lambda;_ * _x_ / _y_ is known to be less than 1/2.  This third algorithm takes three parameters:

- _x_ and _y_ are integers such that _x_/_y_ > 0 and _y_!=0.
- _m_ is a rational number such that _&lambda;_ * _x_ / _y_ &le; _m_ &lt; 1/2.

The algorithm follows.

1. The same special cases as for the first algorithm in this section apply.
2. Run the **logistic Bernoulli factory** algorithm with _c_/_d_ = (_x_/_y_) / (1 &minus; 2 * _m_).  If it returns 0, return 0.
3. With probability 1 &minus; 2 * _m_, return 1.
4. Run a [**linear Bernoulli factory**](#Linear_Bernoulli_Factories) with _x_/_y_ = (_x_/_y_) / (2 * _m_) and _&#x03F5;_ = 1 &minus; _m_.

> **Note:** For approximate methods to simulate _&lambda;_\*(_x_/_y_), see the page "[**Supplemental Notes for Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernsupp.html)".

<a id=lambda____x___y___i></a>
#### (_&lambda;_ * _x_/_y_)<sup>_i_</sup>

(Huber 2019\)[^64].  This algorithm uses four parameters:

- _x_ and _y_ are integers such that _x_/_y_ > 0 and _y_!=0.
- _i_ is an integer 0 or greater.
- _&#x03F5;_ is a rational number such that 0 &lt; _&#x03F5;_ &lt; 1.  If _x_/_y_ is greater than 1, _&#x03F5;_ must be such that 0 &lt; _&#x03F5;_ &le;1 &minus; _&lambda;_ * _x_/_y_.

The algorithm also has special cases not mentioned in Huber 2019.

1.  Special cases: If _i_ is 0, return 1.  If _x_ is 0, return 0.  Otherwise, if _x_ equals _y_ and _i_ equals 1, flip the input coin and return the result.
2. Special case: If _x_ is less than _y_ and _i_ = 1, then do the following: "With probability _x_/_y_, flip the input coin and return the result; otherwise return 0."
3. Special case: If _x_ is less than _y_, then create a secondary coin that does the following: "With probability _x_/_y_, flip the input coin and return the result; otherwise return 0", then flip the secondary coin _i_ times until a flip returns 0, whichever comes first, then return a number that is 1 if all the flips, including the last, return 1, or 0 otherwise.
4. Set _t_ to 355/100 and _c_ to _x_/_y_.
5. While _i_ is not 0:
    1. While _i_ > _t_ / _&#x03F5;_:
        1. Set _&beta;_ to (1 &minus; _&#x03F5;_ / 2) / (1 &minus; _&#x03F5;_).
        2. Run the **algorithm for (_a_/_b_)<sup>_z_</sup>** (given in the irrational constants section) with _a_=1, _b_=_&beta;_, and _z_ = _i_.  If the run returns 0, return 0.
        3. Multiply _c_ by _&beta;_, then divide _&#x03F5;_ by 2.
    2. Run the **logistic Bernoulli factory** with _c_/_d_ = _c_, then set _z_ to the result.  Set _i_ to _i_ + 1 &minus; _z_ * 2.
6. (_i_ is 0.) Return 1.

<a id=Linear_Bernoulli_Factories></a>
#### Linear Bernoulli Factories

In this document, a **linear Bernoulli factory** refers to one of the following:

- The first algorithm for [**_&lambda;_ * _x_/_y_**](#lambda____x___y) with the stated parameters _x_, _y_, and _&#x03F5;_.
- The [**algorithm for (_&lambda;_ * _x_/_y_)<sup>_i_</sup>**](#lambda____x___y___i) with the stated parameters _x_, _y_, and _&#x03F5;_, and with _i_ = 1 (see previous section).

<a id=lambda____mu></a>
#### _&lambda;_<sup>_&mu;_</sup>

This algorithm is based on the **algorithm for _&lambda;_<sup>_x_/_y_</sup>**, but changed to accept a second input coin (which outputs heads with probability _&mu;_) rather than a fixed value for the exponent.  For this algorithm, _&lambda;_ and _&mu;_ may not both be 0.

- Set _i_ to 1.  Then do the following process repeatedly, until this algorithm returns a value:
    1. Flip the input coin that simulates the base, _&lambda;_; if it returns 1, return 1.
    2. Flip the input coin that simulates the exponent, _&mu;_; if it returns 1, return 0 with probability 1/_i_.
    3. Add 1 to _i_.

<a id=1_minus___lambda___cos___lambda></a>
#### (1&minus;_&lambda;_)/cos(_&lambda;_)

(Flajolet et al., 2010\)[^1].  Uses an average number of flips that grows without bound as _&lambda;_ goes to 1.

1. Flip the input coin until the flip returns 0.  Then set _G_ to the number of times the flip returns 1 this way.
2. If _G_ is **odd**, return 0.
3. Generate a uniform random variate between 0 and 1 _U_, then set _i_ to 1.
4. While _i_ is less than _G_:
    1. Generate a uniform random variate between 0 and 1 _V_.
    2. If _i_ is odd[^25] and _V_ is less than _U_, return 0.
    3. If _i_ is even[^27] and _U_ is less than _V_, return 0.
    4. Add 1 to _i_, then set _U_ to _V_.
5. Return 1.

<a id=1_minus___lambda___tan___lambda></a>
#### (1&minus;_&lambda;_) * tan(_&lambda;_)

(Flajolet et al., 2010\)[^1].  Uses an average number of flips that grows without bound as _&lambda;_ goes to 1.

1. Flip the input coin until the flip returns 0.  Then set _G_ to the number of times the flip returns 1 this way.
2. If _G_ is **even**, return 0.
3. Generate a uniform random variate between 0 and 1 _U_, then set _i_ to 1.
4. While _i_ is less than _G_:
    1. Generate a uniform random variate between 0 and 1 _V_.
    2. If _i_ is odd[^25] and _V_ is less than _U_, return 0.
    3. If _i_ is even[^27] and _U_ is less than _V_, return 0.
    4. Add 1 to _i_, then set _U_ to _V_.
5. Return 1.

<a id=ln__c___d____lambda____c></a>
#### ln((_c_ + _d_ + _&lambda;_)/_c_)

In this algorithm, _d_ and _c_ are integers, 0 &lt; _c_, and _c_ &gt; _d_ &ge; 0, and (_c_ + _d_ + _&lambda;_)/_c_ &le; exp(1).

- Do the following process repeatedly, until this algorithm returns a value:
    1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), run the **algorithm for (_d_ + _&lambda;_) / _c_** with _d_ = _d_ and _c_ = _c_, and return the result.
    2. Generate a uniform random variate between 0 and 1 _u_, if _u_ wasn't generated yet.
    3. [**Sample from the number _u_**](#Implementation_Notes), then run the **algorithm for (_d_ + _&lambda;_) / _c_** with _d_ = _d_ and _c_ = _c_.  If both calls return 1, return 0.

<a id=arcsin___lambda___2></a>
#### arcsin(_&lambda;_) / 2

The Flajolet paper doesn't explain in detail how arcsin(_&lambda;_)/2 arises out of arcsin(_&lambda;_) + sqrt(1 &minus; _&lambda;_<sup>2</sup>) &minus; 1 via Bernoulli factory constructions, but here is an algorithm.[^65] However, the number of input coin flips is expected to grow without bound as _&lambda;_ approaches 1.

1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), run the **algorithm for arcsin(_&lambda;_) + sqrt(1 &minus; _&lambda;_<sup>2</sup>) &minus; 1** and return the result.
2. Create a secondary coin _&mu;_ that does the following: "Flip the input coin twice.  If both flips return 1, return 0.  Otherwise, return 1." (The coin simulates 1 &minus; _&lambda;_<sup>2</sup>.)
3. Call the **algorithm for _&mu;_<sup>1/2</sup>** using the secondary coin _&mu;_.  If it returns 0, return 1; otherwise, return 0. (This step effectively cancels out the sqrt(1 &minus; _&lambda;_<sup>2</sup>) &minus; 1 part and divides by 2.)

<a id=Other_Factory_Functions></a>
### Other Factory Functions

Algorithms in bold are given in this page.

|  To simulate:  |  Follow this algorithm: |
   --- |  ---- |
|  1/sqrt(_&pi;_)  |  Create _&lambda;_ coin for algorithm **1/_&pi;_**.<br>Run algorithm for **sqrt(_&lambda;_)**.  |
|  1/sqrt(_h_+_&lambda;_)  |  (_&lambda;_ is unknown heads probability of a coin; _h_&ge;1 is a rational number.)<br>Create _&mu;_ coin for algorithm **_d_/(_c_+_&lambda;_)** with _c_=_h_ and _d_=1.<br>Run algorithm for **sqrt(_&lambda;_)** with _&lambda;_ being the _&mu;_ coin.  |
|  1 / (_c_ + _&lambda;_)  |  (_&lambda;_ is unknown heads probability of a coin; _c_&ge;1 is a rational number.)<br>Run algorithm for **_d_ / (_c_ + _&lambda;_)** with _d_ = 1. |
|  1 / (1 + _&lambda;_<sup>2</sup>)  |  (Slope function of arctan(_&lambda;_).  _&lambda;_ is unknown heads probability of a coin.)<br>Create _&mu;_ coin that flips _&lambda;_ coin twice and returns either 1 if both flips return 1, or 0 otherwise.<br>Run algorithm for **_d_ / (_c_ + _&lambda;_)** with _d_=1, _c_=1, and _&lambda;_ being the _&mu;_ coin. |
|  1 / (_c_ + exp(&minus; _z_))  |  (_z_&ge;0 is written as described in [**"ExpMinus" section**](#ExpMinus_exp_minus__z); _c_&ge;1 is a rational number.)<br>Create _&mu;_ coin for **ExpMinus** algorithm with parameter _z_.<br>Run algorithm for **_d_ / (_c_ + _&lambda;_)** with _d_=1, _c_=_c_, and _&lambda;_ being the _&mu;_ coin. |
| 1/(2<sup>_k_ + _&lambda;_</sup>) or<br>exp(&minus;(_k_ + _&lambda;_)\*ln(2)) | (_&lambda;_ is unknown heads probability of a coin.  _k_ &ge; 0 is an integer.)<br>Run algorithm **1/(2<sup>_m_\*(_k_ + _&lambda;_</sup>))** with _k_=_k_ and _m_=1. |
| 1&minus;exp(&minus; _z_) = (exp(_z_)&minus;1) \* exp(&minus;_z_) = (exp(_z_)&minus;1) / exp(_z_) | (_z_&ge;0 is written as described in [**"ExpMinus" section**](#ExpMinus_exp_minus__z).)<br>Run **ExpMinus** algorithm with parameter _z_, and return 1 minus the result. |
| exp(&minus;((1&minus;_&lambda;_)<sup>1</sup> \* _c_)) | ((Dughmi et al. 2021\)[^43]; applies an exponential weight&mdash;here, _c_&mdash;to an input coin.  _&lambda;_ is unknown heads probability of a coin.)<br>(1) If _c_ is 0, return 1.<br>(2) Generate _N_, a Poisson random variate with mean _c_.<br>(3) Flip the input coin until the flip returns 0 or the coin is flipped _N_ times, whichever comes first, then return a number that is 1 if _N_ is 0 or all of the coin flips (including the last) return 1, or 0 otherwise. |
| exp(_&lambda;_<sup>2</sup>) &minus; _&lambda;_\*exp(_&lambda;_<sup>2</sup>) | (_&lambda;_ is unknown heads probability of a coin.)<br>Run **general martingale algorithm** with $g(\lambda)=\lambda$, $d_0=1$, and $a_i=\frac{(-1)^i}{(\text{floor}(i/2))!}$. |
| 1 &minus; 1 / (1+(_&mu;_\*_&lambda;_/(1 &minus; _&mu;_)) =<br>(_&mu;_\*_&lambda;_/(1 &minus; _&mu;_) / (1+(_&mu;_\*_&lambda;_/(1 &minus; _&mu;_)) | (Special case of **logistic Bernoulli factory**; 0 &le; _&lambda;_ &le; 1, 0 &le; _&mu;_ &lt; 1, and both are unknown heads probabilities of two coins.)<br>(1) Flip the _&mu;_ coin.  If it returns 0, return 0. (Coin samples probability _&mu;_/(_&mu;_ + (1 &minus; _&mu;_)) = _&mu;_.) <br>(2) Flip the _&lambda;_ coin.  If it returns 1, return 1.  Otherwise, go to step 1. |
| _&lambda;_/(1+_&lambda;_) | (_&lambda;_ is unknown heads probability of a coin.)<br>Run algorithm for **1/(1+_&lambda;_)**, then return 1 minus the result. |
| _c_ * _&lambda;_ / (_c_ * _&lambda;_ + (_d_+_&mu;_)) = (_c_/(_d_+_&mu;_)) * _&lambda;_ / (1 + (_c_/(_d_+_&mu;_)) * _&lambda;_)) | (_c_&ge;0 is an integer; _d_&ge;0 is an integer; 0 &le; _&lambda;_ &le; 1, 0 &le; _&mu;_ &lt; 1, and both are unknown heads probabilities of two coins.)<br>(1) If _c_ is 0, return 0.<br>(2) Let _D_ = _d_ and _C_ = _c_, then run the algorithm for **(_d_ + _&mu;_) / (_c_ + _&lambda;_)** with _&lambda;_ and _&mu;_ both being the _&mu;_ input coin, with _d_ = _D_, and with _c_ = _D_ + _C_.  If the run returns 1, return 0.<br>(3) Flip the _&lambda;_ input coin.  If the flip returns 1, return 1.  Otherwise, go to step 2. |
| (_d_+_&mu;_) / (_c_ * _&lambda;_ + (_d_+_&mu;_)) | (_c_, _d_, _&lambda;_, and _&mu;_ are as in the previous algorithm.)<br> Run the previous algorithm and return 1 minus the result. |
| exp(_z_)/(1+exp(_z_))<sup>2</sup> | (Equals expit(_z_)\*(1&minus;expit(_z_)). _z_ is described in "expit(_z_)" section.)<br>Run the algorithm for **expit(_z_)** twice, with _m_=0. If the first run returns 1 and the second returns 0, return 1.  Otherwise, return 0. |
| _&nu;_ * 1 + (1 &minus; _&nu;_) * _&mu;_ = _&nu;_ + _&mu;_ &minus; (_&nu;_\*_&mu;_) | (_Logical OR_. Flajolet et al., 2010[^1].  Special case of _&nu;_ * _&lambda;_ + (1 &minus; _&nu;_) * _&mu;_ with _&lambda;_ = 1. _&nu;_ and _&mu;_ are unknown heads probabilities of two coins.)<br>Flip the _&nu;_ input coin and the _&mu;_ input coin.  Return 1 if either flip returns 1, and 0 otherwise. |
| 1 &minus; _&nu;_ | (_Complement_. Flajolet et al., 2010[^1].  Special case of _&nu;_ * _&lambda;_ + (1 &minus; _&nu;_) * _&mu;_ with _&lambda;_ = 0 and _&mu;_ = 1. _&nu;_ is unknown heads probability of a coin.)<br>Flip the _&nu;_ input coin and return 1 minus the result. |
| _&nu;_ * _&lambda;_ | (_Logical AND_ or _Product_. Flajolet et al., 2010[^1].  Special case of _&nu;_ * _&lambda;_ + (1 &minus; _&nu;_) * _&mu;_ with _&mu;_ = 0. _&nu;_ and _&lambda;_ are unknown heads probabilities of two coins.)<br>Flip the _&nu;_ input coin and the _&lambda;_ input coin.  Return 1 if both flips return 1, and 0 otherwise. |
| (_&lambda;_ + _&mu;_)/2 = (1/2)\*_&lambda;_ + (1/2)\*_&mu;_ | (_Mean_. Nacu and Peres 2005, proposition 14(iii\)[^16]; Flajolet et al., 2010[^1].  Special case of _&nu;_ * _&lambda;_ + (1 &minus; _&nu;_) * _&mu;_ with _&nu;_ = 1/2. _&lambda;_ and _&mu;_ are unknown heads probabilities of two coins.)<br> Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), flip the _&lambda;_ input coin and return the result.  Otherwise, flip the _&mu;_ input coin and return the result. |
|  (1+_&lambda;_)/2 = (1/2) + (1/2)\*_&lambda;_ | (_&lambda;_ is unknown heads probability of a coin.)<br>Generate an unbiased random bit.  If that bit is 1, return 1.  Otherwise, flip the input coin and return the result. |
|  (1&minus;_&lambda;_)/2 | (_&lambda;_ is unknown heads probability of a coin.)<br>Generate an unbiased random bit.  If that bit is 1, return 0.  Otherwise, flip the input coin and return 1 minus the result. |
| 1 &minus; ln(1+_&lambda;_) | (_&lambda;_ is unknown heads probability of a coin.)<br>Run algorithm for **ln(1+_&lambda;_)**, then return 1 minus the result.[^66] |
| sin(sqrt(_&lambda;_)\*sqrt(_c_)) / (sqrt(_&lambda;_)\*sqrt(_c_)) | (_c_ is a rational number; 0 &lt; _c_ &le; 6.  _&lambda;_ is unknown heads probability of a coin.)<br>Run **general martingale algorithm** with $g(\lambda)=\lambda$, and with $d_0 = 1$ and coefficients $a_i = \frac{ (-1)^{i} c^{i}}{(i+i+1)!}$. |
|  3 &minus; exp(1) | Run the algorithm for **exp(1) &minus; 2**, then return 1 minus the result. |
|  1/(exp(1)&minus;1) | Run the algorithm for **1/(exp(1)+_c_&minus;2)** with _c_ = 1. |
|  _r_/_&pi;_  |  (_r_ is a rational number; 0&le;_r_&le;3.)<br>Create _&lambda;_ coin for algorithm **_&pi;_ &minus; 3**.<br>Create _&mu;_ coin that does: "With probability _r_ &minus; floor(_r_), return 1; otherwise return 0."<br>If _r_=0, return 0.  If _r_=3, run algorithm for **_d_ / (_c_ + _&lambda;_)** with _d_=_n_ and _c_=3.  If 0 &lt; _r_ &lt; 3, run algorithm for **(_d_ + _&mu;_) / (_c_ + _&lambda;_)** with _d_=floor(_r_) and _c_=3.  |
|  exp(1)/_&pi;_  |  Create _&mu;_ coin for algorithm **exp(1) &minus; 2**.<br>Create _&lambda;_ coin for algorithm **_&pi;_ &minus; 3**.<br>Run algorithm for **(_d_ + _&mu;_) / (_c_ + _&lambda;_)** with _d_=2 and _c_=3.  |
|  exp(1)/4  |  Generate unbiased random bits (each bit is 0 or 1 with equal probability) until a zero is generated this way, then set _n_ to the number of ones generated this way.<br>Set _n_ to 2\*_n_ + 2.<br>With probability 2<sup>_n_&minus;1</sup>/(_n_!), return 1.  Otherwise return 0. |
|  _r_\*_&lambda;_ &minus; _r_ + _r_\*exp(&minus;_&lambda;_)  |  (_r_ is a rational number greater than 0, but not greater than 2.  _&lambda;_ is the unknown heads probability of a coin.)<br>Run the **general martingale algorithm** with $g(\lambda) = \lambda$, and with $d_0 = r/2$  and coefficients $a_i = \frac{r}{(i)!} (-1)^i$ if $i\ge 2$ and $a_i=0$ otherwise.  |
|  _r_\*exp(&minus;1) = _r_/exp(1)  |  (_r_ is a rational number; 0&le;_r_&le;2.)<br>If _r_=0, return 0.  If _r_=2, un algorithm for **_d_ / (_c_ + _&lambda;_)** with _d_=_n_ and _c_=2.  If 0&lt;_r_&lt;2, run algorithm for **_c_\*_&lambda;_ &minus; _c_ + _c_\*exp(&minus;_&lambda;_)** with _r_=_r_ and _&lambda;_ being a coin that always returns 1. |
| _&lambda;_/(2&minus;_&lambda;_) = (_&lambda;_/2)/(1&minus;(_&lambda;_/2)) | (_&lambda;_ is the unknown heads probability of a coin.)<br>(1) Flip _&lambda;_ coin; return 0 if it returns 0.<br>(2) Run algorithm for **1/(2&minus;_&lambda;_)**. |
| (1&minus;_&lambda;_)/(1+_&lambda;_) | (_&lambda;_ is the unknown heads probability of a coin.)<br>(1) Flip _&lambda;_ coin; return 0 if it returns 1.<br>(2) Run algorithm for **_d_ / (_c_ + _&lambda;_)** with _d_=1 and _c_=1. |

<a id=Algorithms_for_Specific_Constants></a>
### Algorithms for Specific Constants

This section shows algorithms to simulate a probability equal to a specific
kind of irrational number.

<a id=1___phi___1_divided_by_the_golden_ratio></a>
#### 1 / _&phi;_ (1 divided by the golden ratio)

This algorithm uses the algorithm described in the section on [**continued fractions**](#Continued_Fractions) to simulate 1 divided by the golden ratio (about 0.618), whose continued fraction's partial denominators are 1, 1, 1, 1, ....

1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return 1.
2. Do a separate run of the currently running algorithm.  If the separate run returns 1, return 0.  Otherwise, go to step 1.

<a id=sqrt_2_minus_1></a>
#### sqrt(2) &minus; 1

Another example of a continued fraction is that of the fractional part of the square root of 2, where the partial denominators are 2, 2, 2, 2, .... The algorithm to simulate this number is as follows:

1. With probability 2/3, generate an unbiased random bit and return that bit.
2. Do a separate run of the currently running algorithm.  If the separate run returns 1, return 0.  Otherwise, go to step 1.

<a id=1_sqrt_2></a>
#### 1/sqrt(2)

This third example of a continued fraction shows how to simulate a probability 1/_z_, where _z_ > 1 has a known simple continued fraction expansion.  In this case, the partial denominators are as follows: floor(_z_), _a_\[1\], _a_\[2\], ..., where the _a_\[_i_\] are _z_'s partial denominators (not including _z_'s integer part).  In the example of 1/sqrt(2), the partial denominators are 1, 2, 2, 2, ..., where 1 comes first since floor(sqrt(2)) = 1.  The algorithm to simulate 1/sqrt(2) is as follows:

The algorithm begins with _pos_ equal to 1.  Then the following steps are taken.

1. If _pos_ is 1, return 1 with probability 1/2.  If _pos_ is greater than 1, then with probability 2/3, generate an unbiased random bit and return that bit.
2. Do a separate run of the currently running algorithm, but with _pos_ = _pos_ + 1.  If the separate run returns 1, return 0.  Otherwise, go to step 1.

<a id=tanh_1_2_or_exp_1_minus_1_exp_1_1></a>
#### tanh(1/2) or (exp(1) &minus; 1) / (exp(1) + 1)

The algorithm begins with _k_ equal to 2.  Then the following steps are taken.

1. With probability _k_/(1+_k_), return a number that is 1 with probability 1/_k_ and 0 otherwise.
2. Do a separate run of the currently running algorithm, but with _k_ = _k_ + 4.  If the separate run returns 1, return 0.  Otherwise, go to step 1.

<a id=arctan__x___y___y___x></a>
#### arctan(_x_/_y_) \* _y_/_x_

(Flajolet et al., 2010\)[^1]\:

1. Generate a uniform random variate between 0 and 1 _u_.
2. Generate a number that is 1 with probability _x_ * _x_/(_y_ * _y_), or 0 otherwise.  If the number is 0, return 1.
3. [**Sample from the number _u_**](#Implementation_Notes) twice.  If either of these calls returns 0, return 1.
4. Generate a number that is 1 with probability _x_ * _x_/(_y_ * _y_), or 0 otherwise.  If the number is 0, return 0.
5. [**Sample from the number _u_**](#Implementation_Notes) twice.  If either of these calls returns 0, return 0.  Otherwise, go to step 2.

Observing that the even-parity construction used in the Flajolet paper[^32] is equivalent to the two-coin algorithm, which has bounded expected running time for all _&lambda;_ parameters, the algorithm above can be modified as follows:

1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return 1.
2. Generate a uniform random variate between 0 and 1 _u_, if it wasn't generated yet.
3. With probability _x_ * _x_/(_y_ * _y_), [**sample from the number _u_**](#Implementation_Notes) twice.  If both of these calls return 1, return 0.
4. Go to step 1.

<a id=pi___12></a>
#### _&pi;_ / 12

Two algorithms:

- First algorithm: Use the algorithm for **arcsin(_&lambda;_) / 2**, but where the algorithm says to "flip the input coin", instead generate an unbiased random bit.
- Second algorithm: With probability 2/3, return 0.  Otherwise, run an algorithm for **&pi; / 4** and return the result.

<a id=pi___4></a>
#### _&pi;_ / 4

Three algorithms:

- First algorithm (Flajolet et al., 2010\)[^1]\: Generate a random integer _n_ satisfying 0 &le; _n_ &le; 5, call it _n_.  If _n_ is less than 3, return the result of the **algorithm for arctan(_x_/_y_) \* _y_/_x_** with _x_=1 and _y_=2.  Otherwise, if _n_ is 3, return 0.  Otherwise, return the result of the **algorithm for arctan(_x_/_y_) \* _y_/_x_** with _x_=1 and _y_=3.
- Second algorithm (since arctan(1) = _&pi;_ / 4): Run the second **algorithm for arctan(_x_/_y_) \* _y_/_x_** with _x_=1 and _y_=1.
- Third algorithm: See the appendix.

A fourth algorithm to sample _&pi;_/4 is based on the section "[**Uniform Distribution Inside N-Dimensional Shapes**](https://peteroupc.github.io/exporand.html#Uniform_Distribution_Inside_N_Dimensional_Shapes)", especially its Note 5, in "More Algorithms for Arbitrary-Precision Sampling".  In effect, it samples a 2-dimensional point with coordinates between 0 and 1 and determines if that point is within 1 unit of the origin (0, 0), which will happen with probability _&pi;_/4.

1. Set _S_ to 2.  Then set _c1_ and _c2_ to 0.
2. Do the following process repeatedly, until the algorithm returns a value:
    1. Set _c1_ to 2\*_c1_ plus an unbiased random bit (either 0 or 1 with equal probability).  Then, set _c2_ to 2\*_c2_ plus an unbiased random bit.
    2. If ((_c1_+1)<sup>2</sup> + (_c2_+1)<sup>2</sup>) < _S_<sup>2</sup>, return 1.  (Point is inside the quarter disk, whose area is _&pi;_/4.)
    3. If ((_c1_)<sup>2</sup> + (_c2_)<sup>2</sup>) > _S_<sup>2</sup>, return 0.  (Point is outside the quarter disk.)
    4. Multiply _S_ by 2.

<a id=pi___4_minus_1_2_or___pi___minus_2_4></a>
#### _&pi;_/4 &minus; 1/2 or (_&pi;_ &minus; 2)/4

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
#### (_&pi;_ &minus; 3)/4

Follows the _&pi;_/4 algorithm, except it samples from a quarter disk with enough boxes removed from it to total an area equal to 3/4.

1. Set _S_ to 32.  Then set _c1_ to a uniform random integer in the half-open interval [0, _S_) and _c2_ to another uniform random integer in that interval.
2. (Retained boxes.) If _c1_ is 0 and _c2_ is 0, or if _c1_ is 0 and _c2_ is 1, return 1.
3. (Removed boxes.) If ((_c1_+1)<sup>2</sup> + (_c2_+1)<sup>2</sup>) < 1024, return 0.
4. Multiply _S_ by 2.
5. (Sample the modified quarter disk.) Do the following process repeatedly, until the algorithm returns a value:
    1. Set _c1_ to 2\*_c1_ plus an unbiased random bit (either 0 or 1 with equal probability).  Then, set _c2_ to 2\*_c2_ plus an unbiased random bit.
    2. If ((_c1_+1)<sup>2</sup> + (_c2_+1)<sup>2</sup>) < _S_<sup>2</sup>, return 1.  (Point is inside the quarter disk, whose area is _&pi;_/4.)
    3. If ((_c1_)<sup>2</sup> + (_c2_)<sup>2</sup>) > _S_<sup>2</sup>, return 0.  (Point is outside the quarter disk.)
    4. Multiply _S_ by 2.

<a id=pi___minus_3></a>
#### _&pi;_ &minus; 3

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

<a id=1___pi></a>
#### 1 / _&pi;_

(Flajolet et al., 2010\)[^1]\:

1. Set _t_ to 0.
2. With probability 1/4, add 1 to _t_ and repeat this step.  Otherwise, go to step 3.
3. With probability 1/4, add 1 to _t_ and repeat this step.  Otherwise, go to step 4.
4. With probability 5/9, add 1 to _t_.
5. Generate 2*_t_ unbiased random bits (that is, either 0 or 1, chosen with equal probability), and return 0 if there are more zeros than ones generated this way or more ones than zeros.  (In fact, this condition can be checked even before all the bits are generated this way.)  Do this step two more times.
6. Return 1.

For a sketch of how this algorithm is derived, see the appendix.

<a id=a___b___z></a>
#### (_a_/_b_)<sup>_z_</sup>

In the algorithm below:

- _a_ &ge; 0 is an integer.
- _b_ &gt; 0 is an integer.
- z is a number (positive or not), and its absolute value (abs(_z_)) is written as a rational number (case 1), as an integer and fractional part (case 2), or as a sum of positive numbers (case 3), as described in the [**"ExpMinus" section**](#ExpMinus_exp_minus__z).
-  If _z_ is known to be 0 or greater then it must be that 0 &le; _a_/_b_ &le; 1, or
-  If _z_ is known to be less than 0, then it must be that _a_/_b_ &ge; 1.

The algorithm follows.

- In case 1 (_z_ = _x_/_y_):
    1. If _z_ is known to be less than 0, swap _a_ and _b_, and remove the sign from _z_.  If _a_/_b_ is now less than 0 or greater than 1, return an error.
    2. If _x_ equals _y_, return 1 with probability _a_/_b_ and 0 otherwise.
    3. If _x_ is 0, return 1.  Otherwise, if _a_ is 0, return 0.  Otherwise, if _a_ equals _b_, return 1.
    4. If _x_/_y_ is greater than 1:
        1. Set _ipart_ to floor(_x_/_y_) and _fpart_ to rem(_x_, _y_) (equivalent to _x_ - _y_\*floor(_x_/_y_)).
        2. If _fpart_ is greater than 0, subtract 1 from _ipart_, then call this algorithm recursively with _x_ = floor(_fpart_/2) and _y_ = _y_, then call this algorithm, again recursively, with _x_ = _fpart_ &minus; floor(_fpart_/2) and _y_ = _y_. Return 0 if either call returns 0.  (This is done rather than the more obvious approach in order to avoid calling this algorithm with fractional parts very close to 0, because the algorithm runs much more slowly than for fractional parts closer to 1.)
        3. If _ipart_ is 1 or greater, generate at random a number that is 1 with probability _a_<sup>_ipart_</sup>/_b_<sup>_ipart_</sup> or 0 otherwise. (Or generate, at random, _ipart_ many numbers that are each 1 with probability _a_/_b_ or 0 otherwise, then multiply them all into one number.)  If that number is 0, return 0.
        4. Return 1.
    5. (Note on steps 5 to 8: This case where 0 &lt; _x_/_y_ &lt; 1 is due to recent work by Mendo (2019\)[^24].) Set _i_ to 1.
    6. With probability _a_/_b_, return 1.
    7. Otherwise, with probability _x_/(_y_*_i_), return 0.
    8. Add 1 to _i_ and go to step 6.
- In case 2 (abs(_z_) = _m_ + _&nu;_; here, 0 < _&nu;_ &le; 1 unless _a_/_b_ is not zero):
    1. If _z_ is known to be less than 0, swap _a_ and _b_, and remove the sign from _z_.  If _a_/_b_ is now less than 0 or greater than 1, return an error.
    2. If _a_ is 0 and _m_ is not 0, return 0.  If _a_ equals _b_, return 1.
    3. If _m_ is 1 or greater, generate at random a number that is 1 with probability _a_<sup>_m_</sup>/_b_<sup>_m_</sup> or 0 otherwise. (Or generate, at random, _m_ many numbers that are each 1 with probability _a_/_b_ or 0 otherwise, then multiply them all into one number.)  If that number is 0, return 0.
    4. (Note on steps 4 to 7: This case where 0 &lt; _z_ &lt; 1 is due to recent work by Mendo (2019\)[^24].) Set _i_ to 1.
    5. With probability _a_/_b_, return 1.
    6. Flip the _&nu;_ input coin.  If it returns 0, return 0 with probability 1/_i_.
    7. Add 1 to _i_ and go to step 6.
- In case 3:
    1. If _z_ is known to be less than 0, swap _a_ and _b_, and remove the sign from _z_.  If _a_/_b_ is now less than 0 or greater than 1, return an error.
    2. If _a_ is 0, return 0 (_z_ will be positive here).  If _a_ equals _b_, return 1.
    3. Rewrite the _z_ parameter's absolute value as a sum of positive numbers.  For each number, run either case 1 or case 2 (depending on how the number is written) of this algorithm with that number as the parameter.  If any of these runs returns 0, return 0; otherwise, return 1.

<a id=1_exp_1__c__minus_2></a>
#### 1/(exp(1) + _c_ &minus; 2)

Involves the continued fraction expansion and Bernoulli Factory algorithm 3 for continued fractions.  In this algorithm, _c_&ge;1 is a rational number.

The algorithm begins with _pos_ equal to 1.  Then the following steps are taken.

- Do the following process repeatedly until this run of the algorithm returns a value:
    1. If _pos_ is divisible by 3 (that is, if rem(_pos_, 3) equals 0): Let _k_ be (_pos_/3)\*2.  With probability _k_/(1+_k_), return a number that is 1 with probability 1/_k_ and 0 otherwise.
    2. If _pos_ is 1: With probability _c_/(1+_c_), return a number that is 1 with probability 1/_c_ and 0 otherwise.
    3. If _pos_ is greater than 1 and not divisible by 3: Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return 1.
    4. Do a separate run of the currently running algorithm, but with _pos_ = _pos_ + 1.  If the separate run returns 1, return 0.

<a id=exp_1_minus_2></a>
#### exp(1) &minus; 2

Involves the continued fraction expansion and Bernoulli Factory algorithm 3 for continued fractions.  Run the algorithm for **1/(exp(1)+_c_&minus;2)** above with _c_ = 1, except the algorithm begins with _pos_ equal to 2 rather than 1 (because the continued fractions are almost the same).

<a id=zeta___3_3_4_and_Other_Zeta_Related_Constants></a>
#### _&zeta;_(3) * 3 / 4 and Other Zeta-Related Constants

(Flajolet et al., 2010\)[^1].  It can be seen as a triple integral of the function 1/(1 + _a_ * _b_ * _c_), where _a_, _b_, and _c_ are uniform random variates between 0 and 1.  This algorithm is given below, but using the two-coin algorithm instead of the even-parity construction[^32].  Here, _&zeta;_(_x_) is the Riemann zeta function.

1. Generate three uniform random variates between 0 and 1.
2. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return 1.
3. [**Sample from each of the three numbers**](#Implementation_Notes) generated in step 1.  If all three calls return 1, return 0.  Otherwise, go to step 2. (This implements a triple integral involving the uniform random variates.)

> **Note:** The triple integral in section 5 of the paper is _&zeta;_(3) * 3 / 4, not _&zeta;_(3) * 7 / 8.

This can be extended to cover any constant of the form _&zeta;_(_k_) * (1 &minus; 2<sup>&minus;(_k_ &minus; 1)</sup>) where _k_ &ge; 2 is an integer, as suggested slightly by the Flajolet paper when it mentions _&zeta;_(5) * 31 / 32 (which should probably read _&zeta;_(5) * 15 / 16 instead), using the following algorithm.

1. Generate _k_ uniform random variates between 0 and 1.
2. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return 1.
3. [**Sample from each of the _k_ numbers**](#Implementation_Notes) generated in step 1.  If all _k_ calls return 1, return 0.  Otherwise, go to step 2.

<a id=erf__x__erf_1></a>
#### erf(_x_)/erf(1)

In the following algorithm, _x_ is a real number that is 0 or greater and 1 or less.

1. Generate a uniform random variate between 0 and 1, call it _ret_.
2. Set _u_ to point to the same value as _ret_, and set _k_ to 1.
3. (In this and the next step, _v_ is created, which is the maximum of two uniform [0, 1] random variates.) Generate two uniform random variates between 0 and 1, call them _a_ and _b_.
4. If _a_ is less than _b_, set _v_ to _b_. Otherwise, set _v_ to _a_.
5. If _v_ is less than _u_, set _u_ to _v_, then add 1 to _k_, then go to step 3.
6. If _k_ is odd[^25], return 1 if _ret_ is less than _x_, or 0 otherwise. (If _ret_ is implemented as a uniform PSRN, this comparison should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
7. Go to step 1.

In fact, this algorithm takes advantage of a theorem related to the Forsythe method of random sampling (Forsythe 1972\)[^67].  See the section "[**Probabilities Arising from Certain Permutations**](#Probabilities_Arising_from_Certain_Permutations)" in the appendix for more information.

> **Note:** If the last step in the algorithm reads "Return 0" rather than "Go to step 1", then the algorithm simulates the probability erf(_x_)\*sqrt(&pi;)/2 instead.

<a id=Euler_ndash_Mascheroni_constant___gamma></a>
#### Euler&ndash;Mascheroni constant _&gamma;_

The following algorithm to simulate the Euler&ndash;Mascheroni constant _&gamma;_ (about 0.5772) is due to Mendo (2020/2021\)[^36].  This solves an open question given in (Flajolet et al., 2010\)[^1].  An algorithm for the Euler&ndash;Mascheroni constant appears here even though it is not yet known whether this constant is irrational.  Sondow (2005\)[^68] described how the Euler&ndash;Mascheroni constant can be rewritten as an infinite sum, which is the form used in this algorithm.

1. Set _&#x03F5;_ to 1, then set _n_, _lamunq_, _lam_, _s_, _k_, and _prev_ to 0 each.
2. Add 1 to _k_, then add _s_/(2<sup>_k_</sup>) to _lam_.
3. If _lamunq_+_&#x03F5;_ &le; _lam_ + 1/(2<sup>_k_</sup>), go to step 8.
4. If _lamunq_ > _lam_ + 1/(2<sup>_k_</sup>), go to step 8.
5. If _lamunq_ > _lam_ + 1/(2<sup>_k_+1</sup>) and _lamunq_+_&#x03F5;_ < 3/(2<sup>_k_+1</sup>), go to step 8.
6. (This step adds a term of the infinite sum for _&gamma;_ to _lamunq_, and sets _&#x03F5;_ to an upper bound on the error that results if the infinite sum is "cut off" after summing this and the previous terms.) If _n_ is 0, add 1/2 to _lamunq_ and set _&#x03F5;_ to 1/2.  Otherwise, add _B_(_n_)/(2\*_n_\*(2\*_n_+1)\*(2\*_n_+2)) to _lamunq_ and set _&#x03F5;_ to min(_prev_, (2+_B_(_n_)+(1/_n_))/(16\*_n_\*_n_)), where _B_(_n_) is the minimum number of bits needed to store _n_ (or the smallest integer _b_&ge;1 such that _n_ &lt; 2<sup>_b_</sup>).
7. Add 1 to _n_, then set _prev_ to _&#x03F5;_, then go to step 3.
8. Let _bound_ be _lam_+1/(2<sup>_k_</sup>).  If _lamunq_+_&#x03F5;_ &le; _bound_, set _s_ to 0.  Otherwise, if _lamunq_ > _bound_, set _s_ to 2.  Otherwise, set _s_ to 1.
9. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), go to step 2.  Otherwise, return a number that is 0 if _s_ is 0, 1 if _s_ is 2, or an unbiased random bit (either 0 or 1 with equal probability) otherwise.

> **Note:** The following is another algorithm for this constant.  As [**I learned**](https://stats.stackexchange.com/a/539564), the fractional part of 1/_U_, where _U_ is a uniform random variate between 0 and 1, has a mean equal to 1 minus the Euler&ndash;Mascheroni constant _&gamma;_, about 0.5772.[^69]  This leads to the following algorithm to sample a probability equal to _&gamma;_:
>
> 1. Generate a random variate of the form 1/_U_ &minus; floor(1/_U_), where _U_ is a uniform random variate between 0 and 1.  This can be done by generating a uniform PSRN for [**the reciprocal of a uniform random variate**](https://peteroupc.github.io/exporand.html#Reciprocal_of_Uniform_Random_Variate), then setting that PSRN's integer part to 0.  Call the variate (or PSRN) _f_.
> 2. **Sample from the number _f_** (for example, call **SampleGeometricBag** on _f_ if _f_ is implemented as a uniform PSRN).  Return 0 if the run returns 1, or 1 otherwise.

<a id=exp_minus__x___y___z___t></a>
#### exp(&minus;_x_/_y_) \* _z_/_t_

This algorithm is again based on an algorithm due to Mendo (2020/2021\)[^36].  The algorithm takes integers _x_ &ge; 0, _y_ &gt; 0, _z_ &ge; 0, and _t_ &gt; 0, such that 0 &le; exp(&minus;_x_/_y_) \* _z_/_t_ &le; 1.

1. If _z_ is 0, return 0.  If _x_ is 0, return a number that is 1 with probability _z_/_t_ and 0 otherwise.
2. Set _&#x03F5;_ to 1, then set _n_, _lamunq_, _lam_, _s_, and _k_ to 0 each.
3. Add 1 to _k_, then add _s_/(2<sup>_k_</sup>) to _lam_.
4. If _lamunq_+_&#x03F5;_ &le; _lam_ + 1/(2<sup>_k_</sup>), go to step 9.
5. If _lamunq_ > _lam_ + 1/(2<sup>_k_</sup>), go to step 9.
6. If _lamunq_ > _lam_ + 1/(2<sup>_k_+1</sup>) and _lamunq_+_&#x03F5;_ < 3/(2<sup>_k_+1</sup>), go to step 8.
7. (This step adds two terms of exp(&minus;_x_/_y_)'s well-known infinite sum, multiplied by _z_/_t_, to _lamunq_, and sets _&#x03F5;_ to an upper bound on how close the current sum is to the desired probability.)  Let _m_ be _n_\*2.  Set _&#x03F5;_ to _z_\*_x_<sup>_m_</sup>/(_t_\*(_m_!)\*_y_<sup>_m_</sup>).  If _m_ is 0, add _z_\*(_y_&minus;_x_)/(_t_\*_y_) to _lamunq_. Otherwise, add _z_\*_x_<sup>_m_</sup>\*(_m_\*_y_&minus;_x_+_y_) / (_t_\*_y_<sup>_m_+1</sup>\*((_m_+1)!)) to _lamunq_.
8. Add 1 to _n_ and go to step 4.
9. Let _bound_ be _lam_+1/(2<sup>_k_</sup>).  If _lamunq_+_&#x03F5;_ &le; _bound_, set _s_ to 0.  Otherwise, if _lamunq_ > _bound_, set _s_ to 2.  Otherwise, set _s_ to 1.
10. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), go to step 3.  Otherwise, return a number that is 0 if _s_ is 0, 1 if _s_ is 2, or an unbiased random bit (either 0 or 1 with equal probability) otherwise.

<a id=Certain_Numbers_Based_on_the_Golden_Ratio></a>
#### Certain Numbers Based on the Golden Ratio

The following algorithm given by Fishman and Miller (2013)[^70] finds the continued fraction expansion of certain numbers described as&mdash;

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
    2. If _&#x2113;_ is 1 and _k_ is odd[^25], return _p_ + _n_.
    3. If _&#x2113;_ is &minus;1 and _pos_ is 0, return _n_ &minus; _p_ &minus; 1.
    4. If _&#x2113;_ is 1 and _pos_ is 0, return (_n_ + _p_) &minus; 1.
    5. If _&#x2113;_ is &minus;1 and _pos_ is even[^27], return _n_ &minus; _p_ &minus; 2. (The paper had an error here; the correction given here was verified by Miller via personal communication.)
    6. If _&#x2113;_ is 1 and _pos_ is even[^27], return (_n_ + _p_) &minus; 2.
    7. Return 1.

An application of the continued fraction algorithm is the following algorithm that generates 1 with probability _G_(_m_, _&#x2113;_)<sup>&minus;_k_</sup> and 0 otherwise, where _k_ is an integer that is 1 or greater (see "Continued Fractions" in my page on Bernoulli factory algorithms). The algorithm starts with _pos_ = 0, then the following steps are taken:

1. **Get the partial denominator given _pos_, _k_, _m_, and _&#x2113;_**, call it _kp_.
2. Do the following process repeatedly, until this run of the algorithm returns a value:
    1. With probability _kp_/(1 + _kp_), return a number that is 1 with probability 1/_kp_ and 0 otherwise.
    2. Do a separate run of the currently running algorithm, but with _pos_ = _pos_ + 1.  If the separate run returns 1, return 0.

<a id=ln_1__y___z></a>
#### ln(1+_y_/_z_)

See also the algorithm given earlier for ln(1+_&lambda;_).  In this algorithm, _y_/_z_ is a rational number that is 0 or greater and 1 or less.  (Thus, the special case ln(2) results when _y_/_z_ = 1/1.)

1. If _y_ is 0, return 0.
2. Do the following process repeatedly, until this algorithm returns a value:
    1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return a number that is 1 with probability _y_/_z_ and 0 otherwise.
    2. Generate a uniform random variate between 0 and 1 _u_, if _u_ wasn't generated yet.
    3. [**Sample from the number _u_**](#Implementation_Notes), then generate a number that is 1 with probability _y_/_z_ and 0 otherwise.  If the call returns 1 and the number generated is 1, return 0.

<a id=ln___pi_____pi></a>
#### ln(_&pi;_)/_&pi;_

Special case of the algorithm for **ln(_c_+_&lambda;_)/(_c_+_&lambda;_)**.

1. Run the algorithm for **1/_&pi;_** repeatedly, until the run returns 1, then set _g_ to the number of runs that returned 0 this way.
2. If _g_ is 0, return 0.  Otherwise, return a number that is 1 with probability 1/_g_ or 0 otherwise.

<a id=Requests_and_Open_Questions></a>
## Requests and Open Questions

See my page "[**Open Questions on the Bernoulli Factory Problem**](https://peteroupc.github.io/bernreq.html)" for open questions, answers to which will greatly improve my articles on Bernoulli factories.  These questions include:

- [**Polynomials that approach a factory function "fast"**](https://peteroupc.github.io/bernreq.html#Polynomials_that_approach_a_factory_function_fast).
- [**New coins from old, smoothly**](https://peteroupc.github.io/bernreq.html#New_coins_from_old_smoothly).
- [**Tossing Heads According to a Concave Function**](https://peteroupc.github.io/bernreq.html#Tossing_Heads_According_to_a_Concave_Function).
- [**Simulable and strongly simulable functions**](https://peteroupc.github.io/bernreq.html#Simulable_and_strongly_simulable_functions).
- [**Multiple-Output Bernoulli Factories**](https://peteroupc.github.io/bernreq.html#Multiple_Output_Bernoulli_Factories).
- [**From coin flips to algebraic functions via pushdown automata**](https://peteroupc.github.io/bernreq.html#From_coin_flips_to_algebraic_functions_via_pushdown_automata).

Other questions:

- Let a permutation class (such as numbers in descending order) and two continuous probability distributions D and E be given.  Consider the following algorithm: Generate a sequence of independent random variates (where the first is distributed as D and the rest as E) until the sequence no longer follows the permutation class, then return _n_, which is how many numbers were generated this way minus 1.  In this case:
    1. What is the probability that _n_ is returned?
    2. What is the probability that _n_ is odd or even or belongs to a certain class of numbers?
    3. For each _x_, what is the probability that the first generated number is _x_ or less given that _n_ is odd? ...given that _n_ is even? the last generated number?

    Obviously, these answers depend on the specific permutation class and/or distributions _D_ and _E_. See also my Stack Exchange question [**Probabilities arising from permutations**](https://stats.stackexchange.com/questions/499864/probabilities-arising-from-permutations).
- Is there a simpler or faster way to implement the base-2 or natural logarithm of binomial coefficients?  See the example in the section "[**Certain Converging Series**](#Certain_Converging_Series)".

<a id=Correctness_and_Performance_Charts></a>
## Correctness and Performance Charts

Charts showing the correctness and performance of some of these algorithms are found in a [**separate page**](https://peteroupc.github.io/bernoullicorrect.html).

<a id=Acknowledgments></a>
## Acknowledgments

I acknowledge Luis Mendo, who responded to one of my open questions, as well as C. Karney.
Due to a suggestion by Michael Shoemate who suggested it was "easy to get lost" in this and related articles, some sections that related to Bernoulli factories and were formerly in "More Algorithms for Arbitrary-Precision Sampling" were moved here.

<a id=Notes></a>
## Notes

[^1]: Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560)", arXiv:0906.5560  [math.PR], 2010.

[^2]: Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.

[^3]: There is an analogue to the Bernoulli factory problem called the _quantum Bernoulli factory_, with the same goal of simulating functions of unknown probabilities, but this time with algorithms that employ quantum-mechanical operations (unlike _classical_ algorithms that employ no such operations).  However, quantum-mechanical programming is far from being accessible to most programmers at the same level as classical programming, and will likely remain so for the foreseeable future.  For this reason, the _quantum Bernoulli factory_ is outside the scope of this document, but it should be noted that more factory functions can be "constructed" using quantum-mechanical operations than by classical algorithms.  For example, a factory function whose domain is \[0, 1\] has to meet the requirements proved by Keane and O'Brien except it can touch 0 and/or 1 at a finite number of points in the domain (Dale, H., Jennings, D. and Rudolph, T., 2015, "Provable quantum advantage in randomness processing", _Nature communications_ 6(1), pp. 1-4).

[^4]: Huber, M., "[**Nearly optimal Bernoulli factories for linear functions**](https://arxiv.org/abs/1308.1562v2)", arXiv:1308.1562v2  [math.PR], 2014.

[^5]: Yannis Manolopoulos. 2002. "Binomial coefficient computation: recursion or iteration?", SIGCSE Bull. 34, 4 (December 2002), 65–67. DOI: [**https://doi.org/10.1145/820127.820168.**](https://doi.org/10.1145/820127.820168.)

[^6]: Goyal, V. and Sigman, K., 2012. On simulating a class of Bernstein polynomials. ACM Transactions on Modeling and Computer Simulation (TOMACS), 22(2), pp.1-5.

[^7]: Weikang Qian, Marc D. Riedel, Ivo Rosenberg, "Uniform approximation and Bernstein polynomials with coefficients in the unit interval", _European Journal of Combinatorics_ 32(3), 2011,
[**https://doi.org/10.1016/j.ejc.2010.11.004**](https://doi.org/10.1016/j.ejc.2010.11.004) [**http://www.sciencedirect.com/science/article/pii/S0195669810001666**](http://www.sciencedirect.com/science/article/pii/S0195669810001666)

[^8]: Wästlund, J., "[**Functions arising by coin flipping**](http://www.math.chalmers.se/~wastlund/coinFlip.pdf)", 1999.

[^9]: Then _j_ is a _binomial_ random variate expressing the number of successes in _n_ trials that each succeed with probability _&lambda;_.

[^10]: Qian, W. and Riedel, M.D., 2008, June. The synthesis of robust polynomial arithmetic with stochastic logic. In 2008 45th ACM/IEEE Design Automation Conference (pp. 648-653). IEEE.

[^11]: Thomas, A.C., Blanchet, J., "[**A Practical Implementation of the Bernoulli Factory**](https://arxiv.org/abs/1106.2508v3)", arXiv:1106.2508v3  [stat.AP], 2012.

[^12]: S. Ray, P.S.V. Nataraj, "A Matrix Method for Efficient Computation of Bernstein Coefficients", Reliable Computing 17(1), 2012.

[^13]: And this shows that the polynomial couldn't be simulated if _c_ were allowed to be 1, since the required degree would be infinity; in fact, the polynomial would touch 1 at the point 0.5 in this case, ruling out its simulation by any algorithm (see "About Bernoulli Factories", earlier).

[^14]: Niazadeh, R., Paes Leme, R., Schneider, J., "[**Combinatorial Bernoulli Factories: Matchings, Flows, and Polytopes**](https://dl.acm.org/doi/10.1145/3406325.3451072)", in _Proceedings of the 53rd Annual ACM SIGACT Symposium on Theory of Computing_, pp. 833-846, June 2021; also at [**https://arxiv.org/abs/2011.03865.pdf**](https://arxiv.org/abs/2011.03865).

[^15]: Mossel, Elchanan, and Yuval Peres. New coins from old: computing with unknown bias. Combinatorica, 25(6), pp.707-724, 2005.

[^16]: Nacu, Şerban, and Yuval Peres. "[**Fast simulation of new coins from old**](https://projecteuclid.org/euclid.aoap/1106922322)", The Annals of Applied Probability 15, no. 1A (2005): 93-115.

[^17]: Giulio Morina. Krzysztof Łatuszyński. Piotr Nayar. Alex Wendland. "From the Bernoulli factory to a dice enterprise via perfect sampling of Markov chains." Ann. Appl. Probab. 32 (1) 327 - 359, February 2022. [**https://doi.org/10.1214/21-AAP1679**](https://doi.org/10.1214/21-AAP1679)

[^18]: Propp, J.G., Wilson, D.B., "Exact sampling with coupled Markov chains and applications to statistical mechanics", 1996.

[^19]: Łatuszyński, K., Kosmidis, I.,  Papaspiliopoulos, O., Roberts, G.O., "[**Simulating events of unknown probabilities via reverse time martingales**](https://arxiv.org/abs/0907.4018v2)", arXiv:0907.4018v2 [stat.CO], 2009/2011.

[^20]: S. Ray, P.S.V. Nataraj, "A Matrix Method for Efficient Computation of Bernstein Coefficients", _Reliable Computing_ 17(1), 2012.

[^21]: To show the target function $f(\lambda)$ is convex, find the "slope-of-slope" function of _f_ and show it's 0 or greater for every _&lambda;_ in the domain.  To do so, first find the "slope": omit the first term and for each remaining term (with $i\ge 1$), replace $a_i \lambda^i$ with $a_i i \lambda^{i-1}$.  The resulting "slope" function is still an infinite series with coefficients 0 or greater.  Hence, so will the "slope" of this "slope" function, so the result follows by induction.

[^22]: Dughmi, Shaddin, Jason Hartline, Robert D. Kleinberg, and Rad Niazadeh. "Bernoulli Factories and Black-box Reductions in Mechanism Design." Journal of the ACM (JACM) 68, no. 2 (2021): 1-30.

[^23]: Knuth, Donald E. and Andrew Chi-Chih Yao. "The complexity of nonuniform random number generation", in _Algorithms and Complexity: New Directions and Recent Results_, 1976.

[^24]: Mendo, Luis. "An asymptotically optimal Bernoulli factory for certain functions that can be expressed as power series." Stochastic Processes and their Applications 129, no. 11 (2019): 4366-4384.

[^25]: "_x_ is odd" means that _x_ is an integer and not divisible by 2.  This is true if _x_ &minus; 2\*floor(_x_/2) equals 1, or if _x_ is an integer and the least significant bit of abs(_x_) is 1.

[^26]: _n_! = 1\*2\*3\*...\*_n_ is also known as _n_ factorial; in this document, (0!) = 1.

[^27]: "_x_ is even" means that _x_ is an integer and divisible by 2.  This is true if _x_ &minus; 2\*floor(_x_/2) equals 0, or if _x_ is an integer and the least significant bit of abs(_x_) is 0.

[^28]: Flegal, J.M., Herbei, R., "Exact sampling from intractible probability distributions via a Bernoulli factory", _Electronic Journal of Statistics_ 6, 10-37, 2012.

[^29]: Brassard, G., Devroye, L., Gravel, C., "Remote Sampling with Applications to General Entanglement Simulation", _Entropy_ 2019(21)(92), [**https://doi.org/10.3390/e21010092**](https://doi.org/10.3390/e21010092) .

[^30]: Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.

[^31]: Note that `u * BASE`<sup>&minus;`k`</sup> is not just within `BASE`<sup>&minus;`k`</sup> of its "true" result, but also not more than that result.  Hence `pk + 1 <= u` rather than `pk + 2 <= u`.

[^32]: The "even-parity" construction (Flajolet et al. 2010) is so called because it involves flipping the input coin repeatedly until it returns zero, then counting the number of ones.  The final result is 1 if that number is even, or 0 otherwise. However, the number of flips needed by this method grows without bound as $\lambda$ (the probability the input coin returns 1) approaches 1. See also the note for **Algorithm CC**.

[^33]: Bill Gosper, "Continued Fraction Arithmetic", 1978.

[^34]: Borwein, J. et al. “Continued Logarithms and Associated Continued Fractions.” _Experimental Mathematics_ 26 (2017): 412 - 429.

[^35]: Penaud, J.G., Roques, O., "Tirage à pile ou face de mots de Fibonacci", _Discrete Mathematics_ 256, 2002.

[^36]: Mendo, L., "[**Simulating a coin with irrational bias using rational arithmetic**](https://arxiv.org/abs/2010.14901)", arXiv:2010.14901 [math.PR], 2020/2021.

[^37]: Carvalho, Luiz Max, and Guido A. Moreira. "[**Adaptive truncation of infinite sums: applications to Statistics**](https://arxiv.org/abs/2202.06121)", arXiv:2202.06121 (2022).

[^38]: Citterio, M., Pavani, R., "A Fast Computation of the Best k-Digit Rational Approximation to a Real Number", Mediterranean Journal of Mathematics 13 (2016).

[^39]: The error term, which follows from the so-called Lagrange remainder for Taylor series, has a numerator of 2 because 2 is higher than the maximum value at the point 1 (in cosh(1)) that _f_'s slope, slope-of-slope, etc. functions can achieve.

[^40]: Kozen, D., [**"Optimal Coin Flipping"**](http://www.cs.cornell.edu/~kozen/Papers/Coinflip.pdf), 2014.

[^41]: K. Bringmann, F. Kuhn, et al., “Internal DLA: Efficient Simulation of a Physical Growth Model.” In: _Proc. 41st International Colloquium on Automata, Languages, and Programming (ICALP'14)_, 2014.

[^42]: Huber, M., "[**Optimal linear Bernoulli factories for small mean problems**](https://arxiv.org/abs/1507.00843v2)", arXiv:1507.00843v2 [math.PR], 2016.

[^43]: Dughmi, Shaddin, Jason Hartline, Robert D. Kleinberg, and Rad Niazadeh. "Bernoulli factories and black-box reductions in mechanism design." Journal of the ACM (JACM) 68, no. 2 (2021): 1-30.

[^44]: However, the number of flips needed by this method will then grow without bound as $\lambda$ approaches 1.  Also, this article avoids calling the value _X_ produced this way a "geometric" random variate.  Indeed, there is no single way to give the probabilities of a "geometric" random variate; different academic works define the variate differently.

[^45]: Schmon, S.M., Doucet, A. and Deligiannidis, G., 2019, April. Bernoulli race particle filters. In The 22nd International Conference on Artificial Intelligence and Statistics (pp. 2350-2358).

[^46]: Agrawal, S., Vats, D., Łatuszyński, K. and Roberts, G.O., 2021. "[**Optimal Scaling of MCMC Beyond Metropolis**](https://arxiv.org/abs/2104.02020.)", arXiv:2104.02020.

[^47]: Flajolet, Ph., "Analytic models and ambiguity of context-free languages", _Theoretical Computer Science_ 49, pp. 283-309, 1987

[^48]: Here, "choose(_X_, _X_/_t_)" means that out of _X_ letters, _X_/_t_ of them must be A's, and "(_&beta;_&minus;1)<sup>_X_&minus;_X_/_t_</sup>" is the number of words that have _X_&minus;_X_/_t_ letters other than A, given that the remaining letters were A's.

[^49]: In this formula, which is similar to Example 2's, the division by _&beta;_<sup>_X_\*_&alpha;&minus;X_</sup> brings W(_X_) from the interval \[0, _&beta;_<sup>_g_\*_&alpha;_</sup>\] ((_X_\*_&alpha;_)-letter words) to the interval \[0, _&beta;_<sup>_X_</sup>\] (_X_-letter words), as required by the main algorithm.

[^50]: Peres, Y., "Iterating von Neumann's procedure for extracting random bits", Annals of Statistics 1992,20,1, p. 590-597.

[^51]: In fact, thanks to the "geometric bag" technique of Flajolet et al. (2010), the fractional part _&nu;_ can even come from a uniform partially-sampled random number (PSRN).

[^52]: Canonne, C., Kamath, G., Steinke, T., "[**The Discrete Gaussian for Differential Privacy**](https://arxiv.org/abs/2004.00010)", arXiv:2004.00010 [cs.DS], 2020.

[^53]: Another algorithm for exp(&minus;_&lambda;_) involves the von Neumann schema, but unfortunately, it converges slowly as _&lambda;_ approaches 1.

[^54]: Peres, N., Lee, A.R. and Keich, U., 2021. Exactly computing the tail of the Poisson-Binomial Distribution. ACM Transactions on Mathematical Software (TOMS), 47(4), pp.1-19.

[^55]: Sadowsky, Bucklew, On large deviations theory and asymptotically efficient Monte Carlo
estimation, IEEE Transactions on Information Theory 36 (1990)

[^56]: Gonçalves, F. B., Łatuszyński, K. G., Roberts, G. O. (2017).  Exact Monte Carlo likelihood-based inference for jump-diffusion processes.

[^57]: Vats, D., Gonçalves, F. B., Łatuszyński, K. G., Roberts, G. O., "Efficient Bernoulli factory Markov chain Monte Carlo for intractable posteriors", _Biometrika_ 109(2), June 2022 (also in arXiv:2004.07471 [stat.CO]).

[^58]: There are two other algorithms for this function, but they both converge very slowly when _&lambda;_ is very close to 1.  One is the **general martingale algorithm** (see "More Algorithms for Arbitrary-Precision Sampling") with $g(\lambda)=\lambda$, $d_0 = 1$, and $a_i=(-1)^i$.  The other is the so-called "even-parity" construction from Flajolet et al. 2010: "(1) Flip the input coin.  If it returns 0, return 1. (2) Flip the input coin.  If it returns 0, return 0.  Otherwise, go to step 1."

[^59]: There is another algorithm for tanh(_z_), based on Lambert's continued fraction for tanh(.), but it works only if 0 &le; _z_ &le; 1 and if _z_ is the probability of heads of an input coin.  The algorithm begins with _k_ equal to 1.  Then: (1) If _k_ is 1, generate an unbiased random bit, then if that bit is 1, flip the input coin and return the result; (2) If _k_ is greater than 1, then with probability _k_/(1+_k_), flip the input coin twice, and if either or both flips returned 0, return 0, and if both flips returned 1, return a number that is 1 with probability 1/_k_ and 0 otherwise; (3) Do a separate run of the currently running algorithm, but with _k_ = _k_ + 2.  If the separate run returns 1, return 0; (4) Go to step 2.

[^60]: Dale, H., Jennings, D. and Rudolph, T., 2015, "Provable quantum advantage in randomness processing", _Nature communications_ 6(1), pp. 1-4.

[^61]: Tsai, Yi-Feng, Farouki, R.T., "Algorithm 812: BPOLY: An Object-Oriented Library of Numerical Algorithms for Polynomials in Bernstein Form", _ACM Trans. Math. Softw._ 27(2), 2001.

[^62]: Lee, A., Doucet, A. and Łatuszyński, K., 2014. "[**Perfect simulation using atomic regeneration with application to Sequential Monte Carlo**](https://arxiv.org/abs/1407.5770v1)", arXiv:1407.5770v1  [stat.CO].

[^63]: Morina, Giulio (2021) Extending the Bernoulli Factory to a dice enterprise. PhD thesis, University of Warwick.

[^64]: Huber, M., "[**Designing perfect simulation algorithms using local correctness**](https://arxiv.org/abs/1907.06748v1)", arXiv:1907.06748v1 [cs.DS], 2019.

[^65]: One of the only implementations I could find of this, if not the only, was a [**Haskell implementation**](https://github.com/derekelkins/buffon/blob/master/Data/Distribution/Buffon.hs).

[^66]: Another algorithm for this function uses the **general martingale algorithm** with $g(\lambda)=\lambda$, $d_0 = 1$ and $a_i=(-1)^{i+1}/i$ (except $a_0 = 0$), but uses more bits on average as _&lambda;_ approaches 1.

[^67]: Forsythe, G.E., "Von Neumann's Comparison Method for Random Sampling from the Normal and Other Distributions", _Mathematics of Computation_ 26(120), October 1972.

[^68]: Sondow, Jonathan. “New Vacca-Type Rational Series for Euler's Constant and Its 'Alternating' Analog ln 4/_&pi;_.”, 2005.

[^69]: It can also be said that the integral (see "[**Integrals**](#Integrals)") of _x_ &minus; floor(1/_x_), where _x_ is greater than 0 but not greater than 1, equals 1 minus _&gamma;_.  See, for example, Havil, J., _Gamma: Exploring Euler's Constant_, 2003.

[^70]: Fishman, D., Miller, S.J., "Closed Form Continued Fraction Expansions of Special Quadratic Irrationals", ISRN Combinatorics Vol. 2013, Article ID 414623 (2013).

[^71]: von Neumann, J., "Various techniques used in connection with random digits", 1951.

[^72]: Pae, S., "Random number generation using a biased source", dissertation, University of Illinois at Urbana-Champaign, 2005.

[^73]: Monahan, J.. "Extensions of von Neumann’s method for generating random variables." Mathematics of Computation 33 (1979): 1065-1069.

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Using_the_Input_Coin_Alone_for_Randomness></a>
### Using the Input Coin Alone for Randomness

A function _f_(_&lambda;_) is _strongly simulable_ (Keane and O'Brien 1994\)[^24] if there is a Bernoulli factory algorithm for that function that uses _only_ the input coin as its source of randomness.

If a Bernoulli factory algorithm uses a fair coin, it can often generate flips of the fair coin using the input coin instead, with the help of [**_randomness extraction_**](https://peteroupc.github.io/randextract.html) techniques.

> **Example:** If a Bernoulli factory algorithm would generate an unbiased random bit, instead it could flip the input coin twice until the flip returns 0 then 1 or 1 then 0 this way, then take the result as 0 or 1, respectively (von Neumann 1951\)[^71].  But this trick works only if the input coin's probability of heads is neither 0 nor 1.

When Keane and O'Brien (1994\)[^24] introduced Bernoulli factories, they showed already that _f_(_&lambda;_) is strongly simulable whenever it admits a Bernoulli factory and its domain includes neither 0 nor 1 (so the input coin doesn't show heads every time or tails every time) &mdash; just use the von Neumann trick as in the example above.  But does _f_ remain strongly simulable if its domain includes 0 and/or 1?  That's a complexer question; see the [**supplemental notes**](https://peteroupc.github.io/bernsupp.html#Which_functions_don_t_require_outside_randomness_to_simulate).

<a id=The_Entropy_Bound></a>
### The Entropy Bound

There is a lower bound on the average number of coin flips needed to turn a coin with one probability of heads (_&lambda;_) into a coin with another (_&tau;_ = _f_(_&lambda;_)).  It's called the _entropy bound_ (see, for example, (Pae 2005\)[^72], (Peres 1992\)[^50]) and is calculated as&mdash;

- ((_&tau;_ &minus; 1) * ln(1 &minus; _&tau;_) &minus; _&tau;_ * ln(_&tau;_)) / ((_&lambda;_ &minus; 1) * ln(1 &minus; _&lambda;_) &minus; _&lambda;_ * ln(_&lambda;_)).

For example, if _f_(_&lambda;_) is a constant, an algorithm whose only randomness comes from the input coin will require more coin flips to simulate that constant, the more strongly that coin leans towards heads or tails.  But this formula works only for such algorithms, even if _f_ isn't a constant.

For certain values of _&lambda;_, Kozen (2014\)[^40] showed a tighter lower bound of this kind, but in general, this bound is not so easy to describe and assumes _&lambda;_ is known.  However, if _&lambda;_ is 1/2 (the input coin is unbiased), this bound is simple: at least 2 flips of the input coin are needed on average to simulate a known constant _&tau;_, except when _&tau;_ is a multiple of 1/(2<sup>_n_</sup>) for some integer _n_.

<a id=Bernoulli_Factories_and_Unbiased_Estimation></a>
### Bernoulli Factories and Unbiased Estimation

If an algorithm&mdash;

- takes flips of a coin with an unknown probability of heads (_&lambda;_), and
- produces heads with a probability that depends on _&lambda;_ (_f_(_&lambda;_)) and tails otherwise,

the algorithm acts as an _unbiased estimator_ of _f_(_&lambda;_) that produces estimates in \[0, 1\] with probability 1 (Łatuszyński et al. 2009/2011\)[^19]. (And an estimator like this is possible only if _f_ is a factory function; see Łatuszyński.) Because the algorithm is _unbiased_, its expected value (or mean or "long-run average") is _f_(_&lambda;_). Since the algorithm is unbiased and outputs only 0 or 1, this leads to the following: If we take _n_ independent outputs of the algorithm, sum them, then divide by _n_, then with probability 1, this _average_ approaches _f_(_&lambda;_) as _n_ gets _large_ (the _law of large numbers_).

On the other hand&mdash;

- estimating _&lambda;_ as _&lambda;&prime;_ (for example, by averaging multiple flips of a _&lambda;_-coin), then
- calculating _f_(_&lambda;&prime;_),

is not necessarily an unbiased estimator of _f_(_&lambda;_), even if _&lambda;&prime;_ is an unbiased estimator.

This page focuses on _unbiased_ estimators because "exact sampling" depends on being unbiased. See also (Mossel and Peres 2005, section 4\)[^15].

> **Note:** Bias and variance are the two sources of error in a randomized estimation algorithm.  An unbiased estimator has no bias, but is not without error.  In the case at hand here, the variance of a Bernoulli factory for _f_(_&lambda;_) equals _f_(_&lambda;_) \* (1&minus;_f_(_&lambda;_)) and can go as high as 1/4.  ("Variance reduction" methods are outside the scope of this document.)  An estimation algorithm's _mean squared error_ equals variance plus square of bias.

<a id=Correctness_Proof_for_the_Continued_Logarithm_Simulation_Algorithm></a>
### Correctness Proof for the Continued Logarithm Simulation Algorithm

**Theorem.** _If the algorithm given in "Continued Logarithms" terminates with probability 1, it returns 1 with probability exactly equal to the number represented by the continued logarithm c, and 0 otherwise._

_Proof._ This proof of correctness takes advantage of Huber's "fundamental theorem of perfect simulation" (Huber 2019\)[^64].  Using Huber's theorem requires proving two things:

- The algorithm finishes with probability 1 by assumption.
- Second, we show the algorithm is locally correct when the recursive call in the loop is replaced with a "black box" that simulates the correct "continued sub-logarithm".  If step 1 reaches the last coefficient, the algorithm obviously passes with the correct probability.  Otherwise, we will be simulating the probability (1 / 2<sup>_c_\[_i_\]</sup>) / (1 + _x_), where _x_ is the "continued sub-logarithm" and will be at most 1 by construction.  Step 2 defines a loop that divides the probability space into three pieces: the first piece takes up one half, the second piece (in the second substep) takes up a portion of the other half (which here is equal to _x_/2), and the last piece is the "rejection piece" that reruns the loop.  Since this loop changes no variables that affect later iterations, each iteration acts like an acceptance/rejection algorithm already proved to be a perfect simulator by Huber.  The algorithm will pass at the first substep with probability _p_ = (1 / 2<sup>_c_\[_i_\]</sup>) / 2 and fail either at the first substep of the loop with probability _f1_ = (1 &minus; 1 / 2<sup>_c_\[_i_\]</sup>) / 2, or at the second substep with probability _f2_ = _x_/2 (all these probabilities are relative to the whole iteration).  Finally, dividing the passes by the sum of passes and fails (_p_ / (_p_ + _f1_ + _f2_)) leads to (1 / 2<sup>_c_\[_i_\]</sup>) / (1 + _x_), which is the probability we wanted.

Since both conditions of Huber's theorem are satisfied, this completes the proof. &#x25a1;

<a id=Correctness_Proof_for_Continued_Fraction_Simulation_Algorithm_3></a>
### Correctness Proof for Continued Fraction Simulation Algorithm 3

**Theorem.** _Suppose a generalized continued fraction's partial numerators are b[i] and all greater than 0, and its partial denominators are a[i] and all 1 or greater, and suppose further that each b[i]/a[i] is 1 or less. Then the algorithm given as Algorithm 3 in "Continued Fractions" returns 1 with probability exactly equal to the number represented by that continued fraction, and 0 otherwise._

_Proof._ We use Huber's "fundamental theorem of perfect simulation" again in the proof of correctness.

- The algorithm finishes with probability 1 because with each recursion, the method does a recursive run with no greater probability than not; observe that _a_\[_i_\] can never be more than 1, so that _a_\[_i_\]/(1+_a_\[_i_\]), that is, the probability of finishing the run in each iteration, is always 1/2 or greater.
- If the recursive call in the loop is replaced with a "black box" that simulates the correct "sub-fraction", the algorithm is locally correct.  If step 1 reaches the last element of the continued fraction, the algorithm obviously passes with the correct probability. Otherwise, we will be simulating the probability _b_\[_i_\] / (_a_\[_i_\] + _x_), where _x_ is the "continued sub-fraction" and will be at most 1 by assumption.  Step 2 defines a loop that divides the probability space into three pieces: the first piece takes up a part equal to _h_ = _a_\[_i_\]/(_a_\[_i_\] + 1), the second piece (in the second substep) takes up a portion of the remainder (which here is equal to _x_ * (1 &minus; _h_)), and the last piece is the "rejection piece".  The algorithm will pass at the first substep with probability _p_ = (_b_\[_i_\] / _a_\[_pos_\]) * _h_ and fail either at the first substep of the loop with probability _f1_ = (1 &minus; _b_\[_i_\] / _a_\[_pos_\]) * _h_, or at the second substep with probability _f2_ = _x_ * (1 &minus; _h_) (all these probabilities are relative to the whole iteration).  Finally, dividing the passes by the sum of passes and fails leads to _b_\[_i_\] / (_a_\[_i_\] + _x_), which is the probability we wanted, so that both of Huber's conditions are satisfied and we are done.  &#x25a1;

<a id=Proof_of_the_General_Martingale_Algorithm></a>
### Proof of the General Martingale Algorithm

This proof of the **general martingale algorithm** is similar to the proof for certain alternating series with only nonzero coefficients, given in Łatuszyński et al. (2019/2011)[^19], section 3.1.  Suppose we repeatedly flip a coin that shows heads with probability $g(\lambda)$ and we get the following results: $X_1, X_2, ...$, where each result is either 1 if the coin shows heads or 0 otherwise.  Then define two sequences _U_ and _L_ as follows:

- $U_0=d_0$ and $L_0=0$.
- For each $n>0$, $U_n$ is $L_{n-1} + |a_n|\times X_1\times...\times X_n$ if $a_n > 0$, otherwise $U_{n-1} - |a_n|\times X_1\times...\times X_n$ if no nonzero coefficients follow $a_n$ and $a_n < 0$, otherwise $U_{n-1}$.
- For each $n>0$, $L_n$ is $U_{n-1} - |a_n|\times X_1\times...\times X_n$ if $a_n < 0$, otherwise $L_{n-1} + |a_n|\times X_1\times...\times X_n$ if no nonzero coefficients follow $a_n$ and $a_n > 0$, otherwise $L_{n-1}$.

Then it's clear that with probability 1, for every $n\ge 1$&mdash;

- $L_n \le U_n$,
- $U_n$ is 0 or greater and $L_n$ is 1 or less, and
- $L_{n-1} \le L_n$ and $U_{n-1} \ge U_n$.

Moreover, if there are infinitely many nonzero coefficients, the _U_ and _L_ sequences have expected values ("long-run averages") converging to $f(\lambda)$ with probability 1; otherwise $f(\lambda)$ is a polynomial in $g(\lambda)$, and $U_n$ and $L_n$ have expected values that approach $f(\lambda)$ as $n$ gets large.  These conditions are required for the paper's Algorithm 3 (and thus the **general martingale algorithm**) to be valid.

<a id=Algorithm_for_sin___lambda_____pi___2></a>
### Algorithm for sin(_&lambda;_\*_&pi;_/2)

The following algorithm returns 1 with probability sin(_&lambda;_\*_&pi;_/2) and 0 otherwise, given a coin that shows heads with probability _&lambda;_.  However, this algorithm appears in the appendix since it requires manipulating irrational numbers, particularly numbers involving _&pi;_.

1. Choose at random an integer _n_ (0 or greater) with probability (_&pi;_/2)<sup>4\*_n_+2</sup>/((4\*_n_+2)!) &minus; (_&pi;_/2)<sup>4\*_n_+4</sup>/((4\*_n_+4)!).
2. Let _v_ = 16\*(_n_+1)\*(4\*_n_+3).
3. Flip the input coin 4\*_n_+4 times.  Let _tails_ be the number of flips that returned 0 this way. (This would be the number of heads if the probability _&lambda;_ were 1 &minus; _&lambda;_.)
4. If _tails_ = 4\*_n_+4, return 0.
5. If _tails_ = 4\*_n_+3, return a number that is 0 with probability 8\*(4\*_n_+3)/(_v_&minus;_&pi;_<sup>2</sup>) and 1 otherwise.
6. If _tails_ = 4\*_n_+2, return a number that is 0 with probability 8/(_v_&minus;_&pi;_<sup>2</sup>) and 1 otherwise.
7. Return 1.

> **Notes:**
>
>  1.  The following is a derivation of this algorithm.  Write&mdash; $$f(\lambda) = \sin(\lambda \pi/2) = 1-g(1-\lambda),$$ where&mdash; $$g(\mu) = 1-\sin((1-\mu) \pi/2)$$ $$= \sum_{n\ge 0} \frac{(\mu\pi/2)^{4n+2}}{(4n+2)!} - \frac{(\mu\pi/2)^{4n+4}}{(4n+4)!}$$ $$= \sum_{n\ge 0} w_n(\mu) = \sum_{n\ge 0} w_n(1) \frac{w_n(\mu)}{w_n(1)}.$$  This is a [**convex combination**](#Convex_Combinations) of $w_n(1)$ and $\frac{w_n(\mu)}{w_n(1)}$ &mdash; to simulate $g(\mu)$, first an integer _n_ is chosen with probability $w_n(1)$ and then a coin that shows heads with probability $\frac{w_n(\mu)}{w_n(1)}$ is flipped.  Finally, to simulate $f(\lambda)$, the input coin is "inverted" ($\mu = 1-\lambda$), $g(\mu)$ is simulated using the "inverted" coin, and 1 minus the simulation result is returned.<br><br>As given above, each term $w_n(\mu)$ is a polynomial in $\mu$, and is strictly increasing and equals 1 or less everywhere on the interval $[0, 1]$, and $w_n(1)$ is a constant so that $\frac{w_n(\mu)}{w_n(1)}$ remains a polynomial.  Each polynomial $\frac{w_n(\mu)}{w_n(1)}$ can be transformed into a polynomial in Bernstein form with the following coefficients: $$(0, 0, ..., 0, 8/(v-\pi^2), 8(4n+3)/(v-\pi^2), 1),$$ where the polynomial is of degree $4n+4$ and so has $4n+5$ coefficients, and $v = \frac{((4n+4)!)\times 2^{4n+4}}{((4n+2)!)\times 2^{4n+2}} = 16 (n+1) (4n+3)$.  These are the coefficients used in steps 4 through 7 of the algorithm above.
>
>  2. sin(_&lambda;_\*_&pi;_/2) = cos((1&minus;_&lambda;_)\*_&pi;_/2).

<a id=Probabilities_Arising_from_Certain_Permutations></a>
### Probabilities Arising from Certain Permutations

Certain interesting probability functions can arise from permutations.

Inspired by the von Neumann schema, the following algorithm can be described:

Let a _permutation class_ (defined in [**"Flajolet's Probability Simulation Schemes"**](#Flajolet_s_Probability_Simulation_Schemes)) and two distributions _D_ and _E_, which are both continuous with probability density functions, be given. Consider the following algorithm: Generate a sequence of independent random variates (where the first is distributed as _D_ and the rest as _E_) until the sequence no longer follows the permutation class, then return _n_, which is how many numbers were generated this way minus 1.

Then the algorithm's behavior is given in the tables below.

| Permutation Class | Distributions _D_ and _E_ | The algorithm returns _n_ with this probability: | The probability that _n_ is ... |
 --- | --- | --- | --- | --- |
| Numbers sorted in descending order | Arbitrary; _D_ = _E_ | _n_ / ((_n_ + 1)!). | Odd is 1&minus;exp(&minus;1); even is exp(&minus;1). See note 3. |
| Numbers sorted in descending order | Each arbitrary | (&int;<sub>(&minus;&infin;,&infin;)</sub> DPDF(_z_) \* ((ECDF(_z_))<sup>_n_&minus;1</sup>/((_n_&minus;1)!) &minus; (ECDF(_z_))<sup>_n_</sup>/(_n_!)) _dz_), for every _n_ > 0 (see also proof of Theorem 2.1 of (Devroye 1986, Chapter IV\)[^30]. DPDF and ECDF are defined later. | Odd is denominator of formula 1 below. |
| Alternating numbers | Arbitrary; _D_ = _E_ | (_a_<sub>_n_</sub> * (_n_ + 1) &minus; _a_<sub>_n_ + 1</sub>) / (_n_ + 1)!, where _a_<sub>_i_</sub> is the integer at position _i_ (starting at 0) of the sequence [**A000111**](https://oeis.org/A000111) in the _On-Line Encyclopedia of Integer Sequences_. | Odd is 1&minus;cos(1)/(sin(1)+1); even is cos(1)/(sin(1)+1).  See note 3. |
| Any | Arbitrary; _D_ = _E_ | (&int;<sub>\[0, 1\]</sub> 1 \* (_z_<sup>_n_&minus;1</sup>\*V(_n_)/((_n_&minus;1)!) &minus; _z_<sup>_n_</sup>\*V(_n_+1)/(_n_!)) _dz_), for every _n_ > 0.  _V_(_n_) is the number of permutations of size _n_ that belong in the permutation class. For this algorithm, _V_(_n_) must be greater than 0 and less than or equal to _n_ factorial; this algorithm won't work, for example, if there are 0 permutations of odd size.  | Odd is 1 &minus; 1 / EGF(1); even is 1/EGF(1).<br/>Less than _k_ is (_V_(0) &minus; _V_(_k_)/(_k_!)) / _V_(0).  See note 3. |

| Permutation Class | Distributions _D_ and _E_ | The probability that the first number in the sequence is _x_ or less given that _n_ is ... |
 --- | --- | --- | --- |
| Numbers sorted in descending order | Each arbitrary | Odd is _&psi;_(_x_) = (&int;<sub>(&minus;&infin;, _x_)</sub> exp(&minus;ECDF(_z_)) * DPDF(_z_) _dz_) / (&int;<sub>(&minus;&infin;, &infin;)</sub> exp(&minus;ECDF(_z_)) * DPDF(_z_) _dz_) (Formula 1; see Theorem 2.1(iii) of (Devroye 1986, Chapter IV\)[^30]; see also Forsythe 1972[^67]).  Here, DPDF is the probability density function (PDF) of _D_, and ECDF is the cumulative distribution function for _E_.<br>If _x_ is a uniform random variate greater than 0 and less than 1, this probability becomes &int;<sub>[0, 1]</sub> _&psi;_(_z_) _dz_. |
| Numbers sorted in descending order | Each arbitrary | Even is (&int;<sub>(&minus;&infin;, _x_)</sub> (1 &minus; exp(&minus;ECDF(_z_))) * DPDF(_z_) _dz_) / (&int;<sub>(&minus;&infin;, &infin;)</sub> (1 &minus; exp(&minus;ECDF(_z_))) * DPDF(_z_) _dz_) (Formula 2; see also Monahan 1979[^73]).  DPDF and ECDF are as above. |
| Numbers sorted in descending order | Both uniform variates between 0 and 1 | Odd is ((1&minus;exp(&minus;_x_)))/(1&minus;exp(&minus;1)).  Therefore, the first number in the sequence is distributed as exponential with rate 1 and "cut off" to be not less than 0 and not greater than 1 (von Neumann 1951\)[^71]. |
| Numbers sorted in descending order | _D_ is a uniform variate between 0 and 1; _E_ is max. of two uniform variates between 0 and 1. | Odd is erf(_x_)/erf(1) (uses Formula 1, where DPDF(_z_) = 1 and ECDF(_z_) = _z_<sup>2</sup> for 0&le;_z_&le;1; see also [**erf(_x_)/erf(1)**](#erf__x__erf_1)). |

| Permutation Class | Distributions _D_ and _E_ | The probability that the first number in the sequence is...|
 --- | --- | --- | --- |
| Numbers sorted in descending order | _D_ is an exponential variate with rate 1; _E_ is a uniform variate between 0 and 1. | 1 or less given that _n_ is even is 1 &minus; 2 / (1 + exp(2)) = 1 &minus; (1 + exp(0)) / (1 + exp(1)) = (exp(1)&minus;1)/(exp(1)+1) (uses Formula 2, where DPDF(_z_) = exp(&minus;_z_) and ECDF(_z_) = min(1,_z_) for _z_&ge;0). |
| Numbers sorted in descending order | _D_ is an exponential variate with rate 1; _E_ is a uniform variate between 0 and 1. | 1/2 or less given that _n_ is odd is 1 &minus; (1 + exp(1)) / (1 + exp(2)) = (exp(2) &minus; exp(1)) / (exp(2)+1) (uses Formula 1, where DPDF(_z_) = exp(&minus;_z_) and ECDF(_z_) = min(1,_z_) for _z_&ge;0). |

> **Notes:**
>
> 1. All the functions possible for formulas 1 and 2 are nowhere decreasing functions.  Both formulas express what are called _cumulative distribution functions_, namely _F_<sub>_D_</sub>(_x_ given that _n_ is odd) or _F_<sub>_D_</sub>(_x_ given that _n_ is even), respectively.
> 2. EGF(_z_) is the _exponential generating function_ (EGF) for the kind of permutation involved in the algorithm.  For example, the class of _alternating permutations_ (permutations whose numbers alternate between low and high, that is, _X1_ > _X2_ < _X3_ > ...) uses the EGF tan(_&lambda;_)+1/cos(_&lambda;_).  Other examples of EGFs were given in the section on the von Neumann schema.
> 3. The results that point to this note have the special case that both _D_ and _E_ are uniform random variates between 0 and 1.  Indeed, if each variate _x_ in the sequence is transformed with _CDF_(_x_), where _CDF_ is _D_'s cumulative distribution function, then with probability 1, _x_ becomes a uniform random variate greater than 0 and less than 1, with the same numerical order as before.  See also [**this Stack Exchange question**](https://stats.stackexchange.com/questions/550847).

<a id=Derivation_of_an_Algorithm_for___pi___4></a>
### Derivation of an Algorithm for _&pi;_ / 4

The following is a derivation of the Madhava&ndash;Gregory&ndash;Leibniz (MGL) generator for simulating the probability $\pi/4$ (Flajolet et al. 2010)[^1].  It works as follows.  Let $S$ be a set of non-negative integers.  Then:

1. Generate a uniform random variate between 0 and 1, call it $U$.
2. [**Sample from the number $U$**](#Implementation_Notes) repeatedly until the sampling "fails" (returns 0).  Set $k$ to the number of "successes".  (Thus, this step generates $k$ with probability $g(k,U) = (1-U) U^k$.)
3. If $k$ is in $S$, return 1; otherwise, return 0.

This can be seen as running **Algorithm CC** with an input coin for a randomly generated probability (a uniform random variate between 0 and 1).  Given that step 1 generates $U$, the probability this algorithm returns 1 is&mdash; $$\sum_{k\text{ in }S} g(k,U) = \sum_{k\text{ in }S} (1-U) U^k,$$ and the overall algorithm uses the "[**integral method**](#Integrals)", so that the overall algorithm returns 1 with probability&mdash; $$\int_0^1\sum_{k\text{ in }S} (1-U) U^k\,dU,$$ which, in the case of the MGL generator (where $S$ is the set of non-negative integers with a remainder of 0 or 1 after division by 4), equals $\int_0^1 \frac{1}{U^2+1}\,dU = \pi/4$.

The derivation below relies on the following fact: The probability satisfies&mdash; $$\int_0^1\sum_{k\text{ in }S} g(k,U)\,dU = \sum_{k\text{ in }S}\int_0^1 g(k,U)\,dU.$$ Swapping the integral and the sum is not always possible, but it is in this case because the conditions of so-called Tonelli's theorem are met: $g(k,U)$ is continuous and non-negative whenever $k$ is in $S$ and $0\le U\le 1$; and $S$ and the interval $[0, 1]$ have natural sigma-finite measures.

Now to show how the MGL generator produces the probability $\pi/4$.  Let $C(k)$ be the probability that this algorithm's step 2 generates a number $k$, namely&mdash; $$C(k)=\int_0^1 g(k,U)\,dU = \int_0^1 (1-U) U^k\,dU = \frac{1}{k^2+3k+2}.$$  Then the MGL series for $\pi/4$ is formed by&mdash;

$$\pi/4 = (1/1-1/3)+(1/5-1/7)+...=2/3+2/35+2/99+...$$

$$=(C(0)+C(1))+(C(4)+C(5))+(C(8)+C(9))+...$$

$$=\sum_{k\ge 0} C(4k)+C(4k+1),$$

where the last sum takes $C(k)$ for each $k$ in the set $S$ given for the MGL generator.

<a id=Sketch_of_Derivation_of_the_Algorithm_for_1___pi></a>
### Sketch of Derivation of the Algorithm for 1 / _&pi;_

The Flajolet paper presented an algorithm to simulate 1 / _&pi;_ but provided no derivation.  Here is a sketch of how this algorithm works.

The algorithm is an application of the [**convex combination**](#Convex_Combinations) technique.  Namely, 1 / _&pi;_ can be seen as a convex combination of two components:

- _g_(_n_): 2<sup>6 * _n_</sup> * (6 * _n_ + 1) / 2<sup>8 * _n_ + 2</sup> = 2<sup>&minus;2 * _n_</sup> * (6 * _n_ + 1) / 4 = (6 * _n_ + 1) / (2<sup>2 * _n_ + 2</sup>), which is the probability that the sum of the following independent random variates equals _n_:

    - Two random variates that each express the number of failures before the first success, where the chance of a success is 1&minus;1/4 (the paper calls these two numbers _geometric_(1/4) random variates, but this terminology is avoided in this article because it has several conflicting meanings in academic works).
    - One Bernoulli random variate with mean 5/9.

    This corresponds to step 1 of the convex combination algorithm and steps 2 through 4 of the 1 / _&pi;_ algorithm.  (This also shows that there is an error in the identity for 1 / _&pi;_ given in the Flajolet paper: the "8 _n_ + 4" should read "8 _n_ + 2".)
- _h_<sub>_n_</sub>(): (choose(_n_ * 2, _n_) / 2<sup>_n_ * 2</sup>)<sup>3</sup>, which is the probability of heads of the "coin" numbered _n_.  This corresponds to step 2 of the convex combination algorithm and step 5 of the 1 / _&pi;_ algorithm.

> **Notes:**
>
> 1. 9 * (_n_ + 1) / (2<sup>2 * _n_ + 4</sup>) is the probability that the sum of two independent random variates equals _n_, where each of the two variates expresses the number of failures before the first success and the chance of a success is 1&minus;1/4.
> 2. _p_<sup>_m_</sup> * (1 &minus; _p_)<sup>_n_</sup> * choose(_n_ + _m_ &minus; 1, _m_ &minus; 1) is the probability that the sum of _m_ independent random variates equals _n_ (a _negative binomial distribution_), where each of the _m_ variates expresses the number of failures before the first success and the chance of a success is _p_.
> 3. _p_ \* _f_(_z_ &minus; 1) + (1 &minus; _p_) \* _f_(_z_) is the probability that the sum of two independent random variates &mdash; a Bernoulli variate with mean _p_ as well as an integer that equals _x_ with probability _f_(_x_) &mdash; equals _z_.

<a id=Preparing_Rational_Functions></a>
### Preparing Rational Functions

This section describes how to turn a single-variable rational function (ratio of polynomials) into an array of polynomials needed to apply the **"Dice Enterprise" special case** described in "[**Certain Rational Functions**](#Certain_Rational_Functions)".  In short, the steps to do so can be described as _separating_, _homogenizing_, and _augmenting_.

**Separating.** If a rational function's numerator (_D_) and denominator (_E_) are written&mdash;

-  as a sum of terms of the form _z_\*_&lambda;_<sup>_i_</sup>\*(1&minus;_&lambda;_)<sup>_j_</sup>, where _z_ is a real number and _i_&ge;0 and _j_&ge;0 are integers (called _form 1_ in this section),

then the function can be separated into two polynomials that sum to the denominator.  (Here, _i_+_j_ is the term's _degree_, and the polynomial's degree is the highest degree among its terms.)  To do this separation, subtract the numerator from the denominator to get a new polynomial (_G_) such that _G_ = _E_ &minus; _D_ (or _D_ + _G_ = _E_).  (Then _D_ and _G_ are the two polynomials that will be used.) Similarly, if we have multiple rational functions with a common denominator, namely (_D1_/_E_), ..., (_DN_/_E_), where _D1_, ..., _DN_ and _E_ are written in form 1, then they can be separated into _N_ + 1 polynomials by subtracting the numerators from the denominator, so that _G_ = _E_ &minus; _D1_ &minus; ... &minus; _DN_.  (Then _D1_, ..., _DN_ and _G_ are the polynomials that will be used.) To use the polynomials in the algorithm, however, they need to be _homogenized_, then _augmented_, as described next.

> **Example:** We have the rational function  (4\*_&lambda;_<sup>1</sup>\*(1&minus;_&lambda;_)<sup>2</sup>) /  (7 &minus; 5\*_&lambda;_<sup>1</sup>\*(1&minus;_&lambda;_)<sup>2</sup>).  Subtracting the numerator from the denominator leads to: 7 &minus; 1\*_&lambda;_<sup>1</sup>\*(1&minus;_&lambda;_)<sup>2</sup>.

**Homogenizing.** The next step is to _homogenize_ the polynomials so they have the same degree and a particular form.  For this step, choose _n_ to be an integer no less than the highest degree among the polynomials.

Suppose a polynomial&mdash;

- is 0 or greater for every _&lambda;_ 0 or greater, but not greater than 1,
- has degree _n_ or less, and
- is written in form 1 as given above.

Then the polynomial can be turned into a _homogeneous polynomial_ of degree _n_ (all its terms have degree _n_) as follows.

- For each integer _m_ in [0, _n_], the new homogeneous polynomial's coefficient at _m_ is found as follows:
    1. Set _r_ to 0.
    2. For each term (in the old polynomial) of the form _z_\*_&lambda;_<sup>_i_</sup>\*(1&minus;_&lambda;_)<sup>_j_</sup>:
        - If _i_ &le; _m_, and (_n_&minus;_m_) &ge; _j_, and _i_ + _j_ &le; _n_, add _z_\*choose(_n_&minus;(_i_+_j_), (_n_&minus;_m_)&minus;_j_) to _r_.
    3. Now, _r_ is the new coefficient (corresponding to the term _r_\* _&lambda;_<sup>_m_</sup>\*(1&minus;_&lambda;_)<sup>_n_&minus;_m_</sup>).

If the polynomial is written in so-called "power form" as _c\[0\]_ + _c\[1\]_\*_&lambda;_ + _c\[2\]_\*_&lambda;_<sup>2</sup> + ... + _c\[n\]_\*_&lambda;_<sup>_n_</sup>, then the method is instead as follows:

- For each integer _m_ in [0, _n_], the new homogeneous polynomial's coefficient at _m_ is found as follows:
    1. Set _r_ to 0.
    2. For each integer _i_ in [0, _m_], if there is a coefficient _c\[i\]_, add _c\[i\]_\*choose(_n_&minus;_i_, _n_&minus;_m_) to _r_.
    3. Now, _r_ is the new coefficient (corresponding to the term _r_\* _&lambda;_<sup>_m_</sup>\*(1&minus;_&lambda;_)<sup>_n_&minus;_m_</sup>).

> **Example:** Let the following polynomial be given: 3\*_&lambda;_<sup>2</sup> + 10\*_&lambda;_<sup>1</sup>\*(1&minus;_&lambda;_)<sup>2</sup>.  This is a degree-3 polynomial, and we seek to turn it into a degree-5 homogeneous polynomial.  The result becomes the sum of the terms&mdash;
>
> - 0 \* _&lambda;_<sup>0</sup>\*(1&minus;_&lambda;_)<sup>5</sup>;
> - 10\*choose(2, 2) \* _&lambda;_<sup>1</sup>\*(1&minus;_&lambda;_)<sup>4</sup> = 10\* _&lambda;_<sup>1</sup>\*(1&minus;_&lambda;_)<sup>4</sup>;
> - (3\*choose(3, 3) + 10\*choose(2, 1)) \* _&lambda;_<sup>2</sup>\*(1&minus;_&lambda;_)<sup>3</sup> = 23\* _&lambda;_<sup>2</sup>\*(1&minus;_&lambda;_)<sup>3</sup>;
> - (3\*choose(3, 2) + 10\*choose(2, 0)) \* _&lambda;_<sup>3</sup>\*(1&minus;_&lambda;_)<sup>2</sup> = 19\* _&lambda;_<sup>3</sup>\*(1&minus;_&lambda;_)<sup>2</sup>;
> - 3\*choose(3, 1) \* _&lambda;_<sup>4</sup>\*(1&minus;_&lambda;_)<sup>1</sup> = 9\* _&lambda;_<sup>4</sup>\*(1&minus;_&lambda;_)<sup>1</sup>; and
> - 3\*choose(3, 0) \* _&lambda;_<sup>5</sup>\*(1&minus;_&lambda;_)<sup>0</sup> = 3\* _&lambda;_<sup>5</sup>\*(1&minus;_&lambda;_)<sup>0</sup>,
>
> resulting in the coefficients (0, 10, 23, 19, 9, 3) for the new homogeneous polynomial.

**Augmenting.** If we have an array of homogeneous single-variable polynomials of the same degree, they are ready for use in the **Dice Enterprise special case** if&mdash;

- the polynomials have the same degree, namely _n_,
- their coefficients are all 0 or greater, and
- the sum of _j_<sup>th</sup> coefficients is greater than 0, for each _j_ starting at 0 and ending at _n_, except that the list of sums may begin and/or end with zeros.

If those conditions are not met, then each polynomial can be _augmented_ as often as necessary to meet the conditions (Morina et al., 2022\)[^17].  For polynomials of the kind relevant here, augmenting a polynomial amounts to degree elevation similar to that of polynomials in Bernstein form (see also Tsai and Farouki 2001[^61]).  It is implemented as follows:

- Let _n_ be the polynomial's old degree.  For each _k_ in [0, _n_+1], the new polynomial's coefficient at _k_ is found as follows:
    - Let _c_\[_j_\] be the old polynomial's _j_<sup>th</sup> coefficient (starting at 0).  Calculate _c_\[_j_\] \* choose(1, _k_&minus;_j_) for each integer _j_ satisfying max(0, _k_&minus;1) &le; _j_ &le; min(_n_, _k_), then add them together.  The sum is the new coefficient.

According to the Morina paper, it's enough to do _n_ augmentations on each polynomial for the whole array to meet the conditions above (although fewer than _n_ will often suffice).

> **Note**: For best results, the input polynomials' coefficients should be rational numbers.  If they are not, then special methods are needed to ensure exact results, such as interval arithmetic that calculates lower and upper bounds.

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
