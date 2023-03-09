# More Algorithms for Arbitrary-Precision Sampling

[**Peter Occil**](mailto:poccil14@gmail.com)

**Abstract:** This page contains additional algorithms for arbitrary-precision sampling of distributions, Bernoulli factory algorithms (biased-coin to biased-coin algorithms), and algorithms to produce heads with an irrational probability.  They supplement my pages on Bernoulli factory algorithms and partially-sampled random numbers.

**2020 Mathematics Subject Classification:** 68W20, 60-08, 60-04.

<a id=Introduction></a>
## Introduction

This page contains additional algorithms for arbitrary-precision sampling of distributions, Bernoulli factory algorithms (biased-coin to biased-coin algorithms), and algorithms to produce heads with an irrational probability.  These samplers are designed to not rely on floating-point arithmetic.

The samplers on this page may depend on algorithms given in the following pages:

* [**Partially-Sampled Random Numbers for Accurate Sampling of Continuous Distributions**](https://peteroupc.github.io/exporand.html)
* [**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)

Additional Bernoulli factory algorithms and irrational probability samplers are included here rather than in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)" because that article is quite long as it is.

<a id=About_This_Document></a>
### About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/morealg.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/morealg.md)**.  You can send comments on this document on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues)**.**

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
- [**Bernoulli Factories**](#Bernoulli_Factories)
    - [**Certain Power Series**](#Certain_Power_Series)
        - [**Certain Alternating Series**](#Certain_Alternating_Series)
        - [**General Power Series**](#General_Power_Series)
        - [**Series with Non-Negative Coefficients Summing to 1 or Less**](#Series_with_Non_Negative_Coefficients_Summing_to_1_or_Less)
        - [**Series with General Non-Negative Coefficients**](#Series_with_General_Non_Negative_Coefficients)
        - [**Power Series Examples**](#Power_Series_Examples)
    - [**Certain Piecewise Linear Functions**](#Certain_Piecewise_Linear_Functions)
    - [**Pushdown Automata for Square-Root-Like Functions**](#Pushdown_Automata_for_Square_Root_Like_Functions)
- [**Irrational Probabilities**](#Irrational_Probabilities)
    - [**Ratio of Lower Gamma Functions (&gamma;(_m_, _x_)/&gamma;(_m_, 1)).**](#Ratio_of_Lower_Gamma_Functions_gamma__m___x__gamma__m__1)
    - [**4/(3\*_&pi;_)**](#4_3___pi)
    - [**(1 + exp(_k_)) / (1 + exp(_k_ + 1))**](#1_exp__k__1_exp__k__1)
- [**Sampling Distributions Using Incomplete Information**](#Sampling_Distributions_Using_Incomplete_Information)
- [**General Arbitrary-Precision Samplers**](#General_Arbitrary_Precision_Samplers)
    - [**Cumulative Distribution Functions**](#Cumulative_Distribution_Functions)
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
    - [**Exponential Distribution with Unknown Small Rate**](#Exponential_Distribution_with_Unknown_Small_Rate)
    - [**Exponential Distribution with Rate ln(_x_)**](#Exponential_Distribution_with_Rate_ln__x)
    - [**Symmetric Geometric Distribution**](#Symmetric_Geometric_Distribution)
    - [**Lindley Distribution and Lindley-Like Mixtures**](#Lindley_Distribution_and_Lindley_Like_Mixtures)
    - [**Gamma Distribution**](#Gamma_Distribution)
    - [**One-Dimensional Epanechnikov Kernel**](#One_Dimensional_Epanechnikov_Kernel)
    - [**Uniform Distribution Inside Rectellipse**](#Uniform_Distribution_Inside_Rectellipse)
    - [**Tulap distribution**](#Tulap_distribution)
- [**Requests and Open Questions**](#Requests_and_Open_Questions)
- [**Acknowledgments**](#Acknowledgments)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Ratio of Uniforms**](#Ratio_of_Uniforms)
    - [**Implementation Notes for Box/Shape Intersection**](#Implementation_Notes_for_Box_Shape_Intersection)
    - [**Probability Transformations**](#Probability_Transformations)
    - [**Proof of the General Martingale Algorithm**](#Proof_of_the_General_Martingale_Algorithm)
    - [**SymPy Code for Piecewise Linear Factory Functions**](#SymPy_Code_for_Piecewise_Linear_Factory_Functions)
    - [**Algorithm for sin(_&lambda;_\*_&pi;_/2)**](#Algorithm_for_sin___lambda_____pi___2)
    - [**Sampling Distributions Using Incomplete Information: Omitted Algorithms**](#Sampling_Distributions_Using_Incomplete_Information_Omitted_Algorithms)
    - [**Pushdown Automata and Algebraic Functions**](#Pushdown_Automata_and_Algebraic_Functions)
        - [**Finite-State and Pushdown Generators**](#Finite_State_and_Pushdown_Generators)
- [**License**](#License)

<a id=Bernoulli_Factories></a>
## Bernoulli Factories
&nbsp;

As a reminder, the _Bernoulli factory problem_ is: We're given a coin that shows heads with an unknown probability, _&lambda;_, and the goal is to use that coin (and possibly also a fair coin) to build a "new" coin that shows heads with a probability that depends on _&lambda;_, call it _f_(_&lambda;_).  _f_ is a Bernoulli factory function (or factory function) if this problem can be solved for that function.

This section contains additional algorithms to solve the Bernoulli factory problem for certain kinds of functions.  Such algorithms could be placed in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", but, since that article is quite long as it is, they are included here instead.

In the methods below, _&lambda;_ is the unknown probability of heads of the coin involved in the Bernoulli factory problem.

<a id=Certain_Power_Series></a>
### Certain Power Series

A _power series_ is a function written as&mdash; $$f(\lambda) = a_0 (g(\lambda))^0 + a_1 (g(\lambda))^1 + ... + a_i (g(\lambda))^i + ...,\tag{1}$$ where $a_i$ are _coefficients_ and $g(\lambda)$ is a function in the variable $\lambda$.  Not all power series sum to a definite value, but all power series that matter in this section do, and they must be Bernoulli factory functions.  (In particular, $g(\lambda)$ must be a Bernoulli factory function, too.)

Depending on the coefficients, different algorithms can be built to simulate a power series function:

- The coefficients are arbitrary, but can be split into two parts.
- The coefficients alternate in sign, and their absolute values form a decreasing sequence.
- The coefficients are nonnegative and sum to 1 or less.
- The coefficients are nonnegative and may sum to 1 or greater.

> **Note:** In theory, the power series can contain coefficients that are irrational numbers or sum to an irrational number, but the algorithms to simulate such series can be inexact in practice.  Also, not all power series that admit a Bernoulli factory are covered by the algorithms in this section.  They include:
>
> - Series with coefficients that alternate in sign, but do not satisfy the **general martingale algorithm** or **Algorithm 1** below.  This includes nearly all such series that equal 0 at 0 and 1 at 1, or equal 0 at 1 and 1 at 0. (An example is $\sin(\lambda\pi/2)$.)
> - Series with negative and positive coefficients that do not eventually alternate in sign (ignoring zeros).

<a id=Certain_Alternating_Series></a>
#### Certain Alternating Series

Suppose the following holds true for a power series function $f(\lambda)$:

- $f$ is written as in equation $(1)$.
- Suppose $(a_i)$ is the sequence formed from the coefficients of the series.
- Let $(d_j)$ be the sequence formed from $(a_i)$ by deleting the zero coefficients.  Then suppose that:
     - $d_0$ is greater than 0, and the elements in $(d_j)$ alternate in sign (example: 1/2, -1/3, 1/4, -1/5, ...).
     - The absolute values of $(d_j)$'s elements are 1 or less and form a nowhere increasing sequence that is finite or converges to 0.

In addition, the coefficients should be rational numbers.

> **Example:** Let $f(\lambda) = (1/2)\lambda^0 - (1/4)\lambda^2 + (1/8)\lambda^4 - ...$.  Then $(a_i) = (1/2, 0, -1/4, 0, 1/8, ...)$ (for example, $a_0 = 1/2$) and deleting the zeros leads to $(d_i) = (1/2, -1/4, 1/8, ...)$  (for example, $d_0 = 1/2$), which meets the requirements above.

Then the algorithm below, based on an algorithm by Łatuszyński et al. (2009/2011, especially section 3.1\)[^1], simulates $f(\lambda)$ given a coin that shows heads (returns 1) with probability $g(\lambda)$.

**General martingale algorithm:**

1. Set _u_ to abs($d_0$) ($d_0$ is the value of the first nonzero coefficient in the sequence $(a_i)$), set _w_ to 1, set _&#x2113;_ to 0, and set _n_ to 1.
2. Generate a uniform(0, 1) random variate _ret_.
3. Do the following process repeatedly, until this algorithm returns a value:
    1. If _w_ is not 0, run a Bernoulli factory algorithm for $g(\lambda)$ (if $g(\lambda) = \lambda$, this is done by flipping the input coin), then multiply _w_ by the result of the run.
    2. If $a_n$ is greater than 0: Set _u_ to _&#x2113;_ + _w_ * $a_n$, then, if no further nonzero coefficients follow $a_n$, set _&#x2113;_ to _u_.
    3. If $a_n$ is less than 0: Set _&#x2113;_ to _u_ &minus; _w_ * abs($a_n$), then, if no further nonzero coefficients follow $a_n$, set _u_ to _&#x2113;_.
    4. If _ret_ is less than (or equal to) _&#x2113;_, return 1.  Otherwise, if _ret_ is less than _u_, add 1 to _n_.  Otherwise, return 0.  (If _ret_ is a uniform partially-sampled random number \[PSRN\], these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)

> **Notes:**
>
> 1. The **general martingale algorithm**, as it's called in this article, supports more functions than in section 3.1 of Łatuszyński et al. (2019/2011), which supports only power series whose coefficients alternate in sign and decrease in absolute value, with no zeros in between nonzero coefficients.  However, the general martingale algorithm uses that paper's framework.  A proof of its correctness is given in the appendix.
> 2. The **general martingale algorithm** allows the sequence $(a_i)$ to sum to 1, but this appears to be possible only if the sequence's nonzero values have the form $(1, -z_0, z_0, -z_1, z_1, ..., -z_i, z_i, ...)$, where the $z_i$ are positive, are no greater than 1, and form a nowhere increasing sequence that is finite or converges to 0.  Moreover, it appears that every power series with this sequence of coefficients is less than or equal to $\lambda$.

<a id=General_Power_Series></a>
#### General Power Series

The algorithm that follows can be used to simulate a more general class of power series functions.  Suppose the following for a power series function $f(\lambda)$:

- $f$ is written as in equation $(1)$.
- There is a rational number $Z$ defined as follows. For every $\lambda$ that satisfies $0 \le \lambda \le 1$, it is true that $0 \le f(\lambda) \le Z \lt 1$.
- There is an even integer $m$ defined as follows. The series in equation $(1)$ can be split into two parts: the first part ($A$) is the sum of the first $m$ terms, and the second part ($C$) is the sum of the remaining terms.  Moreover, both parts admit a Bernoulli factory algorithm (see "[**About Bernoulli Factories**](https://peteroupc.github.io/bernoulli.html#About_Bernoulli_Factories)" in the "Bernoulli Factory Algorithms" article).  Specifically: $$C(\lambda) = \sum_{i\ge m} a_i (g(\lambda))^i, A(\lambda) = f(\lambda) - C(\lambda).$$  As an example, if $C$ is a power series function described in the section "Certain Alternating Series", above, then $C$ admits a Bernoulli factory algorithm, namely the **general martingale algorithm**.

In addition, the algorithm will be simpler if each coefficient $a_i$ is a rational number.

Then rewrite the function as&mdash; $$f(\lambda) = A(\lambda) + (g(\lambda))^{m} B(\lambda),$$ where&mdash;

- $A(\lambda) = f(\lambda) - C(\lambda) = \sum_{i=0}^{m-1} a_i (g(\lambda))^i$ is a polynomial in $g(\lambda)$ of degree $m-1$, and
- $B(\lambda) = C(\lambda) / (g(\lambda))^{m} = \sum_{i\ge m} a_{m+i} (g(\lambda))^i$.

Rewrite $A$ as a polynomial in Bernstein form, in the variable $g(\lambda)$. (One way to transform a polynomial to Bernstein form, given the "power" coefficients $a_0, ..., a_{m-1}$, is the so-called "matrix method" from Ray and Nataraj (2012)[^2].)  Let $b_0, ..., b_{m-1}$ be the Bernstein-form polynomial's coefficients.  Then if those coefficients all lie in $[0, 1]$, then the following algorithm simulates $f(\lambda)$.

**Algorithm 1:** Run a [**linear Bernoulli factory**](https://peteroupc.github.io/bernoulli.html#Linear_Bernoulli_Factories), with parameters $x=2$, $y=1$, and $\epsilon=1-Z$.  Whenever the linear Bernoulli factory "flips the input coin", it runs the sub-algorithm below.

- **Sub-algorithm:** Generate an unbiased random bit.  If that bit is 1, sample the polynomial $A$ as follows (Goyal and Sigman 2012\)[^9]:
    1. Run a Bernoulli factory algorithm for $g(\lambda)$, $m-1$ times.  Let $j$ be the number of runs that return 1.
    2. With probability $b_j$, return 1.  Otherwise, return 0.

    If the bit is 0, do the following:

    1. Run a Bernoulli factory algorithm for $g(\lambda)$, $m$ times.  Return 0 if any of the runs returns 0.
    2. Run a Bernoulli factory algorithm for $B(\lambda)$, and return the result.

<a id=Series_with_Non_Negative_Coefficients_Summing_to_1_or_Less></a>
#### Series with Non-Negative Coefficients Summing to 1 or Less

Now, suppose $f(\lambda)$ can be written as a power series in equation $(1)$, but this time, the _coefficients_ $a_i$ are 0 or greater and their sum is 1 or less.

If $g(\lambda) = \lambda$, this kind of function&mdash;

- satisfies $0\le f(\lambda)\le 1$ whenever 0 &le; _&lambda;_ &le; 1,
- is either constant or strictly increasing, and
- is _convex_ (its "slope" or "velocity" doesn't decrease as _&lambda;_ increases)[^3].

Suppose $f$ can be written as $f(\lambda)= f_0(g(\lambda))$, where&mdash; $$f_0(\lambda) = \sum_{n} a_n \lambda^n = \sum_{n} w(n) \frac{a_n}{w(n)}\lambda^n,$$ where each sum is taken over all nonnegative values of $n$ where $a_n > 0$.[^4]

Then the key to simulating $f(\lambda)$ is to "tuck" the values $a_n$ under a function $w(n)$ such that&mdash;

- $1 \ge w(n)\ge a_n\ge 0$ for every allowed _n_, and
- $w(0)+w(1)+...=1$ (required for a valid distribution of integers 0 or greater).

> **Notes:**
>
> 1. Assuming $f_0(1)$ does not equal 0, an appropriate $w(n)$ is trivial to find &mdash; $w(n)=a_n/f_0(1)$ (because $a_n \le f_0(1)$ for every allowed $n$).  But in general, this can make $w(n)$ an irrational number and thus harder to handle with arbitrary precision.
> 2. If the coefficients $a_n$ sum to 1, then $w(n)$ can equal $a_n$.  In this case, $f_0(\lambda)$ is what's called the _probability generating function_ for getting $X$ with probability $a_X$ (or $w(X)$), and the expected value ("long-run average") of $X$ equals the "slope" of $f_0(\lambda)$ at 1.  See also (Dughmi et al. 2021)[^5].
> 3. Assuming $f_0(1)$ is an irrational number, $w(n)$ can equal $a_n + c_n/2^n$, where $c_n$ is the $n$-th base-2 digit after the point in the binary expansion of $1 - f_0(1)$ (or 0 if $n=0$).  Here, a number's _binary expansion_ is written as `0.bbbbb...` in base 2, where each `b` is a base-2 digit (either 0 or 1).  See my [**Stack Exchange question**](https://math.stackexchange.com/questions/4495216).

Once $a_n$ and $w(n)$ are found, the function $f(\lambda)$ can be simulated using the following algorithm, which takes advantage of the [**convex combination method**](https://peteroupc.github.io/bernoulli.html#Convex_Combinations).

**Algorithm 2:**

1. Choose at random an integer _n_ that equals _i_ with probability $w(i)$.
2. (The next two steps succeed with probability $\frac{a_n}{w(n)} (g(\lambda))^n$.) Let _P_ be $a_n/w(n)$.  With probability _P_, go to the next step.  Otherwise, return 0.
3. (At this point, _n_ equals _i_ with probability $a_i$.) Run a Bernoulli factory algorithm for $g(\lambda)$, _n_ times or until a run returns 0, whichever happens first. (For example, if $g(\lambda)=\lambda$, flip the input coin each time.)  Return 1 if all the runs, including the last, returned 1 (or if _n_ is 0).  Otherwise, return 0.

Step 1 is rather general, and doesn't fully describe how to generate the value $n$ at random.  That depends on the function $w(n)$.  See "[**Power Series Examples**](#Power_Series_Examples)", later, for examples of power series functions $f(\lambda)$ that can be simulated using Algorithm 2.

> **Note:** Part of **Algorithm 2** involves choosing $X$ at random with probability $w(X)$, then doing $X$ coin flips.  Thus, the algorithm uses, on average, at least the number of unbiased random bits needed to generate $X$ on average (Knuth and Yao 1976\)[^6].

**Algorithm 2** covers an algorithm that was given by Luis Mendo (2019)[^7] for simulating certain power series, but that works only if the coefficients sum to 1 or less and only if coefficient 0 ($a_0$) is 0.

To get to an algorithm equivalent to Mendo's, first **Algorithm 2** is modified to simulate $f_0(\lambda)$/_CS_ as follows, where _CS_ is the sum of all coefficients $a_i$, starting with $i=1$.  This shows Mendo's algorithm, like **Algorithm 2**, is actually a special case of the [**convex combination algorithm**](https://peteroupc.github.io/bernoulli.html#Convex_Combinations).

- Step 1 of **Algorithm 2** becomes: "(1a.) Set _dsum_ to 0 and $n$ to 1; (1b.) With probability $a_n$/(_CS_ &minus; _dsum_), go to step 2. Otherwise, add $a_n$ to _dsum_; (1c.) Add 1 to _i_ and go to step 1b." (Choose at random $n$ with probability $w(n)=a_n$/_CS_.)
- Step 2 becomes "Go to step 3". (The _P_ in **Algorithm 2** is not used; it's effectively $w(n)/\frac{a_n}{CS}=\frac{a_n}{CS}/\frac{a_n}{CS} = 1$.)
- In step 3, $g(\lambda)$ is either $\lambda$ (flip the input coin) or $1-\lambda$ (flip the input coin and take 1 minus the flip).

Mendo's algorithm and extensions of it mentioned by him cover several variations of power series as follows:

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

<a id=Series_with_General_Non_Negative_Coefficients></a>
#### Series with General Non-Negative Coefficients

If $f$ is a power series written as equation (1), but&mdash;

- each of the coefficients is positive or zero, and
- the coefficients sum to greater than 1,

then Nacu and Peres (2005, proposition 16\)[^1] gave an algorithm which takes the following parameters:

- _t_ is a rational number such that _B_ &lt; _t_ &le; 1 and  _f_(_t_) < 1.
- _&#x03F5;_ is a rational number such that 0 &lt; _&#x03F5;_ &le; (_t_ &minus; _B_)/2.

_B_ is not a parameter, but is the maximum allowed value for $g(\lambda)$ (probability of heads), and is greater than 0 and less than 1.  The following algorithm is based on that algorithm, but runs a Bernoulli factory for $g(\lambda)$ instead of flipping the input coin with probability of heads $\lambda$.

1. Create a _&nu;_ input coin that does the following: "(1) Set _n_ to 0. (2) With probability _&#x03F5;_/_t_, go to the next substep.  Otherwise, add 1 to _n_ and repeat this substep. (3) With probability 1 &minus; $a_n\cdot t^n$, return 0. (4) Run a [**linear Bernoulli factory**](https://peteroupc.github.io/bernoulli.html#Linear_Bernoulli_Factories) _n_ times, _x_/_y_ = 1/(_t_ &minus; _&#x03F5;_), and _&#x03F5;_ = _&#x03F5;_.  If the linear Bernoulli factory would flip the input coin, the coin is 'flipped' by running a Bernoulli factory for $g(\lambda)$.  If any run of the linear Bernoulli factory returns 0, return 0.  Otherwise, return 1."
2. Run a [**linear Bernoulli factory**](https://peteroupc.github.io/bernoulli.html#Linear_Bernoulli_Factories) once, using the _&nu;_ input coin described earlier, _x_/_y_ = _t_/_&#x03F5;_, and _&#x03F5;_ = _&#x03F5;_, and return the result.

<a id=Power_Series_Examples></a>
#### Power Series Examples

Examples 1 to 4 show how **Algorithm 1** leads to algorithms for simulating certain factory functions.

> **Note:** In the SymPy computer algebra library, the `series(func, x, n=20)` method computes the terms of a function's power series up to the term with $x^{19}$.  An example is: `series(sin(x), x, n=20)`.

**Example 1:** Take $f(\lambda) = \sin(3\lambda)/2$, which is a power series.

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
| Hyperbolic tangent: $\tanh(\lambda)$ |  $a_i = \frac{B(i+1) 2^{i+1} (2^{i+1}-1)}{(i+1)!}$ if $i$ is odd[^8], or 0 otherwise. |  1. |
| $\cos(\sqrt \lambda)$ |  $a_i = \frac{(-1)^i}{(2i)!}$. |  1. |
| $\sum_{i\ge 0} a_i x^i$ ([**source**](https://math.stackexchange.com/questions/855517)) | $a_i = \frac{(-1)^i 4^i}{(2i+1)^2 {2i \choose i}}$. | 1. |

To simulate a function in the table, run the **general martingale algorithm** with $g(\lambda) = \lambda$ and with the given coefficients and value of $d_0$ ($d_0$ is the first nonzero coefficient).

> **Note:** Bernoulli numbers can be computed with the following algorithm, namely **Get the _m_<sup>th</sup> Bernoulli number**:
>
> 1. If _m_ is 0, 1, 2, 3, or 4, return 1, 1/2, 1/6, 0, or &minus;1/30, respectively.  Otherwise, if _m_ is odd[^8], return 0.
> 2. Set _i_ to 2 and _v_ to 1 &minus; (_m_+1)/2.
> 3. While _i_ is less than _m_:
>     1. **Get the _i_<sup>th</sup> Bernoulli number**, call it _b_.  Add _b_\*choose(_m_+1, _i_) to _v_.[^9]
>     2. Add 2 to _i_.
> 4. Return &minus;_v_/(_m_+1).

Examples 7 to 9 use **Algorithm 2** to simulate power series functions where the coefficients $a_0$ are nonnegative.

**Example 7:** The hyperbolic cosine minus 1, denoted as cosh(_&lambda;_)&minus;1, can be written as follows: $$f(\lambda)=\cosh(\lambda)-1 = \sum_{n} a_n \lambda^n = \sum_{n} w(n) \frac{a_n \lambda^n}{w(n)},$$ where:

- Each sum given above is taken over all values of _n_ that can occur after step 1 is complete (in this case, all values of _n_ that are even and greater than 0).
- $a_n$ is $1/(n!)$.[^10]
- The coefficients $a_n$ are tucked under a function $w(n)$, which in this case is $\frac{1}{2^{n-2}}$ if _n_&gt;0 and _n_ is even[^11], or 0 otherwise.

For this particular function:

- Step 1 of **Algorithm 2** can read: "(1a.) Generate unbiased random bits (each bit is 0 or 1 with equal probability) until a zero is generated this way, then set _n_ to the number of ones generated this way; (1b.) Set _n_ to 2\*_n_ + 2."
- In step 2, _P_ is $a_n/w(n) = \frac{1}{n!} / \frac{1}{2^{n-2}} = \frac{2^{n/2}}{n!}$ for each allowed $n$.
- In step 3, $g(\lambda)$ is simply $\lambda$.

**Examples 8:** cosh(_&lambda;_)&minus;1 and additional target functions are shown in the following table.  (In the table below, $w(n)=1/(2^{w^{-1}(n)+1})$ where $w^{-1}(n)$ is the inverse of the "Step 1b" column, and the $g(\lambda)$ in step 3 is simply $\lambda$.)

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

**Examples 9:** The table below shows power series functions shifted downward and shows the algorithm changes needed to simulate the modified function.  In the table, _D_ is a rational number such that 0 &le; _D_ &le; _&phi;_(0), where _&phi;_(.) is the original function.

| Original function (_&phi;_(_&lambda;_)) | Target function _f_(_&lambda;_) | Step 1b in **Example 7** reads "Set _n_ to ..." | Value of _P_ |
  ------- | -------- | --- | --- |
| exp(_&lambda;_)/4. | _&phi;_(_&lambda;_) &minus; _D_. | _n_. | (1/4&minus;_D_)\*2 or (_&phi;_(0)&minus;_D_)\*2 if _n_ = 0;<br>2<sup>_n_&minus;1</sup>/(_n_!) otherwise. |
| exp(_&lambda;_)/6.  | _&phi;_(_&lambda;_) &minus; _D_. | _n_. | (1/6&minus;_D_)\*2 if _n_ = 0;<br>2<sup>_n_</sup>/(3\*(_n_!)) otherwise. |
| exp(_&lambda;_/2)/2.  | _&phi;_(_&lambda;_) &minus; _D_. | _n_. | (1/2&minus;_D_)\*2 if _n_ = 0;<br>1/(_n_!) otherwise. |
| cosh(_&lambda;_)/4. | _&phi;_(_&lambda;_) &minus; _D_. | 2\*_n_. | (1/4&minus;_D_)\*2 if _n_ = 0;<br>2<sup>_n_/2</sup>/(2\*(_n_!)) otherwise. |

**Example 10:** Let $f(\lambda)=exp(\lambda)\cdot (1-\lambda)$.  Run Mendo's algorithm for series of type 1, with $a_i = \frac{i-1}{i!}$ and $CS = 1$.

<a id=Certain_Piecewise_Linear_Functions></a>
### Certain Piecewise Linear Functions

Let _f_(_&lambda;_) be a function of the form min(_&lambda;_\*_mult_, 1&minus;_&epsilon;_). This is a _piecewise linear function_, a function made up of two linear pieces (in this case, the pieces are a rising linear part and a constant part).

This section describes how to calculate the Bernstein coefficients for polynomials that converge from above and below to _f_, based on Thomas and Blanchet (2012\)[^12].  These polynomials can then be used to show heads with probability _f_(_&lambda;_) using the algorithms given in "[**General Factory Functions**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions)".

In this section, **fbelow(_n_, _k_)** and **fabove(_n_, _k_)** are the _k_<sup>th</sup> coefficients (with _k_ starting at 0) of the lower and upper polynomials, respectively, in Bernstein form of degree _n_.

The code in the [**appendix**](#Appendix) uses the computer algebra library SymPy to calculate a list of parameters for a sequence of polynomials converging from above.  The method to do so is called `calc_linear_func(eps, mult, count)`, where `eps` is _&epsilon;_, `mult` = _mult_, and `count` is the number of polynomials to generate.  Each item returned by `calc_linear_func` is a list of two items: the degree of the polynomial, and a _Y parameter_.  The procedure to calculate the required polynomials is then logically as follows (as written, it runs very slowly, though):

1. Set _i_ to 1.
2. Run `calc_linear_func(eps, mult, i)` and get the degree and _Y parameter_ for the last listed item, call them _n_ and _y_, respectively.
3. Set _x_ to &minus;((_y_&minus;(1&minus;_&epsilon;_))/_&epsilon;_)<sup>5</sup>/_mult_ + _y_/_mult_.  (This exact formula doesn't appear in the Thomas and Blanchet paper; rather it comes from the [**supplemental source code**](https://github.com/acthomasca/rberfac/blob/main/rberfac-public-2.R) uploaded by A. C. Thomas at my request.)
4. For degree _n_, **fbelow(_n_, _k_)** is min((_k_/_n_)\*_mult_, 1&minus;_&epsilon;_), and **fabove(_n_, _k_)** is min((_k_/_n_)\*_y_/_x_,_y_).  (**fbelow** matches _f_ because _f_ is _concave_ on the interval [0, 1], which roughly means that its rate of growth there never goes up.)
5. Add 1 to _i_ and go to step 2.

It would be interesting to find general formulas to find the appropriate polynomials (degrees and _Y parameters_) given only the values for _mult_ and _&epsilon;_, rather than find them "the hard way" via `calc_linear_func`.  For this procedure, the degrees and _Y parameters_ can be upper bounds, as long as the sequence of degrees is strictly increasing and the sequence of Y parameters is nowhere increasing.

> **Note:** In Nacu and Peres (2005\)[^13], the following polynomial sequences were suggested to simulate $\min(2\lambda, 1-2\varepsilon)$, provided $\varepsilon \lt 1/8$, where _n_ is a power of 2.  However, with these sequences, an extraordinary number of input coin flips is required to simulate this function each time.
>
> - **fbelow(_n_, _k_)** = $\min(2(k/n), 1-2\varepsilon)$.
> - **fabove(_n_, _k_)** = $\min(2(k/n), 1-2\varepsilon)+$<br> $
 \frac{2\times\max(0, k/n+3\varepsilon - 1/2)}{\varepsilon(2-\sqrt{2})} \sqrt{2/n}+$<br> $\frac{72\times\max(0,k/n-1/9)}{1-\exp(-2\times\varepsilon^2)} \exp(-2n\times\varepsilon^2)$.

<a id=Pushdown_Automata_for_Square_Root_Like_Functions></a>
### Pushdown Automata for Square-Root-Like Functions

In this section, ${n \choose m}$ = choose($n$, $m$) is a binomial coefficient.

The following algorithm extends the square-root construction of Flajolet et al. (2010\)[^14], takes an input coin with probability of heads _&lambda;_ (where 0 &le; _&lambda;_ &lt; 1), and returns 1 with probability&mdash;

$$f(\lambda)=\frac{1-\lambda}{\sqrt{1+4\lambda\mathtt{Coin}(\lambda)(\mathtt{Coin}(\lambda)-1)}} = (1-\lambda)\sum_{n\ge 0} \lambda^n (\mathtt{Coin}(\lambda))^n (1-\mathtt{Coin}(\lambda))^n {2n \choose n}$$  $$= (1-\lambda)\sum_{n\ge 0} (\lambda \mathtt{Coin}(\lambda) (1-\mathtt{Coin}(\lambda)))^n {2n \choose n}$$ $$= \sum_{n\ge 0} (1-\lambda) \lambda^n h_n(\lambda) = \sum_{n\ge 0} g(n, \lambda) h_n(\lambda),$$

and 0 otherwise, where:

- `Coin`(_&lambda;_) is a Bernoulli factory function. If `Coin` is a rational function (a ratio of two polynomials) whose coefficients are rational numbers, then _f_ is an _algebraic function_ (a function that can be a solution of a nonzero polynomial equation) and can be simulated by a _pushdown automaton_, or a state machine with a stack (see the algorithm below and the note that follows it). But this algorithm will still work even if `Coin` is not a rational function.  In the original square-root construction,  `Coin`(_&lambda;_) = 1/2.
- $g(n, \lambda) = (1-\lambda) \lambda^n$; this is the probability of running the `Coin` Bernoulli factory $2 \times n$ times.
- $h_n(\lambda) = (\mathtt{Coin}(\lambda))^n (1-\mathtt{Coin}(\lambda))^n {2n \choose n}$; this is the probability of getting as many ones as zeros from the `Coin` Bernoulli factory.

Equivalently&mdash; $$f(\lambda)=(1-\lambda) OGF(\lambda \mathtt{Coin}(\lambda) (1-\mathtt{Coin}(\lambda))),$$ where $OGF(x) = \sum_{n\ge 0} x^n {2n \choose n}$ is the algorithm's ordinary generating function (also known as counting generating function).

The algorithm follows.

1. Set _d_ to 0.
2. Do the following process repeatedly until this run of the algorithm returns a value:
    1. Flip the input coin.  If it returns 1, go to the next substep.  Otherwise, return either 1 if _d_ is 0, or 0 otherwise.
    2. Run a Bernoulli factory algorithm for `Coin`(_&lambda;_).  If the run returns 1, add 1 to _d_.  Otherwise, subtract 1 from _d_.
    3. Repeat the previous substep.

> **Note:** A _pushdown automaton_ is a state machine that keeps a stack of symbols.  In this document, the input for this automaton is a stream of flips of a coin that shows heads with probability _&lambda;_, and the output is 0 or 1 depending on which state the automaton ends up in when it empties the stack (Mossel and Peres 2005\)[^15].  That paper shows that a pushdown automaton, as defined here, can simulate only _algebraic functions_, that is, functions that can be a solution of a nonzero polynomial equation.  The [**appendix**](#Pushdown_Automata_and_Algebraic_Functions) defines these machines in more detail and has proofs on which algebraic functions are possible with pushdown automata.
>
> As a pushdown automaton, this algorithm (except the "Repeat the previous substep" part) can be expressed as follows. Let the stack have the single symbol EMPTY, and start at the state POS-S1.  Based on the current state, the last coin flip (HEADS or TAILS), and the symbol on the top of the stack, set the new state and replace the top stack symbol with zero, one, or two symbols.  These _transition rules_ can be written as follows:
> - (POS-S1, HEADS, _topsymbol_) &rarr; (POS-S2, {_topsymbol_}) (set state to POS-S2, keep _topsymbol_ on the stack).
> - (NEG-S1, HEADS, _topsymbol_) &rarr; (NEG-S2, {_topsymbol_}).
> - (POS-S1, TAILS, EMPTY) &rarr; (ONE, {}) (set state to ONE, pop the top symbol from the stack).
> - (NEG-S1, TAILS, EMPTY) &rarr; (ONE, {}).
> - (POS-S1, TAILS, X) &rarr; (ZERO, {}).
> - (NEG-S1, TAILS, X) &rarr; (ZERO, {}).
> - (ZERO, _flip_, _topsymbol_) &rarr; (ZERO, {}).
> - (POS-S2, _flip_, _topsymbol_) &rarr; Add enough transition rules to the automaton to simulate _g_(_&lambda;_) by a finite-state machine (only possible if _g_ is rational with rational coefficients (Mossel and Peres 2005\)[^15]).  Transition to POS-S2-ZERO if the machine outputs 0, or POS-S2-ONE if the machine outputs 1.
> - (NEG-S2, _flip_, _topsymbol_) &rarr; Same as before, but the transitioning states are NEG-S2-ZERO and NEG-S2-ONE, respectively.
> - (POS-S2-ONE, _flip_, _topsymbol_) &rarr; (POS-S1, {_topsymbol_, X}) (replace top stack symbol with _topsymbol_, then push X to the stack).
> - (POS-S2-ZERO, _flip_, EMPTY) &rarr; (NEG-S1, {EMPTY, X}).
> - (POS-S2-ZERO, _flip_, X) &rarr; (POS-S1, {}).
> - (NEG-S2-ZERO, _flip_, _topsymbol_) &rarr; (NEG-S1, {_topsymbol_, X}).
> - (NEG-S2-ONE, _flip_, EMPTY) &rarr; (POS-S1, {EMPTY, X}).
> - (NEG-S2-ONE, _flip_, X) &rarr; (NEG-S1, {}).
>
> The machine stops when it removes EMPTY from the stack, and the result is either ZERO (0) or ONE (1).

For the following algorithm, which extends the end of Note 1 of the Flajolet paper, the probability is&mdash; $$f(\lambda)=(1-\lambda) \sum_{n\ge 0} \lambda^{Hn} \mathtt{Coin}(\lambda)^n (1-\mathtt{Coin}(\lambda))^{Hn-n} {Hn \choose n},$$ where _H_ &ge; 2 is an integer; and `Coin` has the same meaning as earlier.

1. Set _d_ to 0.
2. Do the following process repeatedly until this run of the algorithm returns a value:
    1. Flip the input coin.  If it returns 1, go to the next substep.  Otherwise, return either 1 if _d_ is 0, or 0 otherwise.
    2. Run a Bernoulli factory algorithm for `Coin`(_&lambda;_).  If the run returns 1, add (_H_&minus;1) to _d_.  Otherwise, subtract 1 from _d_.

The following algorithm simulates the probability&mdash; $$
f(\lambda) = (1-\lambda) \sum_{n\ge 0} \lambda^n \left( \sum_{m\ge 0} W(n,m) \mathtt{Coin}(\lambda)^m (1-\mathtt{Coin}(\lambda))^{n-m} {n \choose m}\right)$$ $$= (1-\lambda) \sum_{n\ge 0} \lambda^n \left( \sum_{m\ge 0} V(n,m) \mathtt{Coin}(\lambda)^m (1-\mathtt{Coin}(\lambda))^{n-m}\right),$$ where `Coin` has the same meaning as earlier; _W_(_n_, _m_) is 1 if _m_\*_H_ equals (_n_&minus;_m_)\*_T_, or 0 otherwise; and _H_&ge;1 and _T_&ge;1 are integers. (In the first formula, the sum in parentheses is a polynomial in Bernstein form, in the variable `Coin`(_&lambda;_) and with only zeros and ones as coefficients.  Because of the _&lambda;_<sup>_n_</sup>, the polynomial gets smaller as _n_ gets larger.  _V_(_n_, _m_) is the number of _n_-letter words that have _m_ heads _and_ describe a walk that ends at the beginning.)

1. Set _d_ to 0.
2. Do the following process repeatedly until this run of the algorithm returns a value:
    1. Flip the input coin.  If it returns 1, go to the next substep.  Otherwise, return either 1 if _d_ is 0, or 0 otherwise.
    2. Run a Bernoulli factory algorithm for `Coin`(_&lambda;_).  If the run returns 1 ("heads"), add _H_ to _d_.  Otherwise ("tails"), subtract _T_ from _d_.

<a id=Irrational_Probabilities></a>
## Irrational Probabilities

<a id=Ratio_of_Lower_Gamma_Functions_gamma__m___x__gamma__m__1></a>
### Ratio of Lower Gamma Functions (&gamma;(_m_, _x_)/&gamma;(_m_, 1)).

1. Set _ret_ to the result of **kthsmallest** with the two parameters _m_ and _m_.  (Thus, _ret_ is distributed as _u_<sup>1/_m_</sup> where _u_ is a uniform random variate greater than 0 and less than 1; although **kthsmallest** accepts only integers, this formula works for every _m_ greater than 0.)
2. Set _k_ to 1, then set _u_ to point to the same value as _ret_.
3. Generate a uniform(0, 1) random variate _v_.
4. If _v_ is less than _u_: Set _u_ to _v_, then add 1 to _k_, then go to step 3.
5. If _k_ is odd[^8], return a number that is 1 if _ret_ is less than _x_ and 0 otherwise. (If _ret_ is implemented as a uniform partially-sampled random number (PSRN), this comparison should be done via **URandLessThanReal**.)  If _k_ is even[^11], go to step 1.

Derivation:  See Formula 1 in the section "[**Probabilities Arising from Certain Permutations**](https://peteroupc.github.io/bernoulli.html#Probabilities_Arising_from_Certain_Permutations)", where:

- `ECDF(x)`  is the probability that a uniform random variate greater than 0 and less than 1 is _x_ or less, namely _x_ if _x_ is in \[0, 1\], 0 if _x_ is less than 0, and 1 otherwise.
- `DPDF(x)` is the probability density function for the maximum of _m_ uniform random variates in [0, 1], namely _m_\*_x_<sup>_m_&minus;1</sup> if _x_ is in \[0, 1\], and 0 otherwise.

<a id=4_3___pi></a>
### 4/(3\*_&pi;_)

Given that the point (_x_, _y_) has positive coordinates and lies inside a disk of radius 1 centered at (0, 0), the mean value of _x_ is 4/(3\*_&pi;_). This leads to the following algorithm to sample that probability:

1. Generate two PSRNs in the form of a uniformly chosen point inside a 2-dimensional quarter hypersphere (that is, a quarter of a "filled circle"; see "[**Uniform Distribution Inside N-Dimensional Shapes**](https://peteroupc.github.io/morealg.html#Uniform_Distribution_Inside_N_Dimensional_Shapes)" in the article "More Algorithms for Arbitrary-Precision Sampling", as well as the examples there).
2. Let _x_ be one of those PSRNs.  Run **SampleGeometricBag** on that PSRN and return the result (which will be either 0 or 1).

> **Note:** The mean value 4/(3\*_&pi;_) can be derived as follows.  The relative probability that _x_ is "close" to _z_, where $0\le _z_ \le 1$, is _p_(_z_) = sqrt(1 &minus; _z_\*_z_).  Now find the integral ("area under the graph") of _z_\*_p_(_z_)/_c_ (where _c_=_&pi;_/4 is the integral of _p_(_z_) on the interval [0, 1]).  The result is the mean value 4/(3\*_&pi;_).  The following Python code prints this mean value using the SymPy computer algebra library: `p=sqrt(1-z*z); c=integrate(p,(z,0,1)); print(integrate(z*p/c,(z,0,1)));`.

<a id=1_exp__k__1_exp__k__1></a>
### (1 + exp(_k_)) / (1 + exp(_k_ + 1))

This algorithm simulates this probability by computing lower and upper bounds of exp(1), which improve as more and more digits are calculated.  These bounds are calculated through an algorithm by Citterio and Pavani (2016\)[^16].  Note the use of the methodology in Łatuszyński et al. (2009/2011, algorithm 2\)[^17] in this algorithm.  In this algorithm, _k_ must be an integer 0 or greater.

1. If _k_ is 0, run the **algorithm for 2 / (1 + exp(2))** and return the result.  If _k_ is 1, run the **algorithm for (1 + exp(1)) / (1 + exp(2))** and return the result.
2. Generate a uniform(0, 1) random variate, call it _ret_.
3. If _k_ is 3 or greater, return 0 if _ret_ is greater than 38/100, or 1 if _ret_ is less than 36/100.  (This is an early return step.  If _ret_ is implemented as a uniform PSRN, these comparisons should be done via the **URandLessThanReal algorithm**, which is described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html).)
4. Set _d_ to 2.
5. Calculate a lower and upper bound of exp(1) (_LB_ and _UB_, respectively) in the form of rational numbers whose numerator has at most _d_ digits, using the Citterio and Pavani algorithm.  For details, see later.
6. Set _rl_ to (1+_LB_<sup>_k_</sup>) / (1+_UB_<sup>_k_ + 1</sup>), and set _ru_ to (1+_UB_<sup>_k_</sup>) / (1+_LB_<sup>_k_ + 1</sup>); both these numbers should be calculated using rational arithmetic.
7. If _ret_ is greater than _ru_, return 0.  If _ret_ is less than _rl_, return 1.  (If _ret_ is implemented as a uniform PSRN, these comparisons should be done via **URandLessThanReal**.)
8. Add 1 to _d_ and go to step 5.

The following implements the parts of Citterio and Pavani's algorithm needed to calculate lower and upper bounds for exp(1) in the form of rational numbers.

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
4. If (_i_ &minus; 1) is odd[^8], return _semi_ as the lower bound and _conv_ as the upper bound.  Otherwise, return _conv_ as the lower bound and _semi_ as the upper bound.

<a id=Sampling_Distributions_Using_Incomplete_Information></a>
## Sampling Distributions Using Incomplete Information

The Bernoulli factory is a special case of the problem of **sampling a probability distribution with unknown parameters**.  This problem can be described as sampling from a new distribution using an _oracle_ (black box) that produces numbers of an incompletely known distribution. In the Bernoulli factory problem, this oracle is a _coin that shows heads or tails where the probability of heads is unknown_.  The rest of this section deals with oracles that go beyond coins.

**Algorithm 1.** Suppose there is an oracle that produces independent random variates on a closed interval \[_a_, _b_\], and these numbers have an unknown mean of _&mu;_. The goal is now to produce nonnegative random variates whose expected value ("long-run average") is _f_(_&mu;_).  Unless _f_ is constant, this is possible if and only if&mdash;

- _f_ is continuous on the closed interval, and
- _f_(_&mu;_) is greater than or equal to _&epsilon;_\*min((_&mu;_ &minus; _a_)<sup>_n_</sup>, (_b_ &minus; _&mu;_)<sup>_n_</sup>) for some integer _n_ and some _&epsilon;_ greater than 0 (loosely speaking, _f_ is nonnegative and neither touches 0 in the interior of the interval nor moves away from 0 more slowly than a polynomial)

(Jacob and Thiery 2015\)[^18]. (Here, _a_ and _b_ are both rational numbers and may be less than 0.)

In the algorithm below, let _K_ be a rational number greater than the maximum value of _f_ on the closed interval [_a_, _b_], and let _g_(_&lambda;_) = _f_(_a_ + (_b_&minus;_a_)\*_&lambda;_)/_K_.

1. Create a _&lambda;_ input coin that does the following: "Take a number from the oracle, call it _x_.  With probability (_x_&minus;_a_)/(_b_&minus;_a_) (see note below), return 1.  Otherwise, return 0."
2. Run a Bernoulli factory algorithm for _g_(_&lambda;_), using the _&lambda;_ input coin.  Then return _K_ times the result.

> **Note:** The check "With probability (_x_&minus;_a_)/(_b_&minus;_a_)" is exact if the oracle produces only rational numbers.  If the oracle can produce irrational numbers (such as numbers that follow a beta distribution or another non-discrete distribution), then the code for the oracle should use uniform [**partially-sampled random numbers (PSRNs)**](https://peteroupc.github.io/exporand.html).  In that case, the check can be implemented as follows.  Let _x_ be a uniform PSRN representing a number generated by the oracle.  Set _y_ to **RandUniformFromReal**(_b_&minus;_a_), then the check succeeds if **URandLess**(_y_, **UniformAddRational**(_x_, &minus;_a_)) returns 1, and fails otherwise.
>
> **Example:** Suppose an oracle produces random variates in the interval [3, 13] with unknown mean _&mu;_, and the goal is to use the oracle to produce nonnegative random variates with mean _f_(_&mu;_) = &minus;319/100 + _&mu;_\*103/50 &minus; _&mu;_<sup>2</sup>*11/100, which is a polynomial with Bernstein coefficients [2, 9, 5] in the given interval.  Then since 8 is greater than the maximum of _f_ in that interval, _g_(_&lambda;_) is a degree-2 polynomial in the interval [0, 1] that has Bernstein coefficients [2/8, 9/8, 5/8].  _g_ can't be simulated as is, though, but increasing _g_'s degree to 3 leads to the Bernstein coefficients [1/4, 5/6, 23/24, 5/8], which are all less than 1 so that the following algorithm can be used (see "[**Certain Polynomials**](https://peteroupc.github.io/bernoulli.html#Certain_Polynomials)"):
>
> 1. Set _heads_ to 0.
> 2. Generate three random variates from the oracle (which must produce random variates in the interval [3, 13]).  For each number _x_: With probability (_x_&minus;3)/(10&minus;3), add 1 to _heads_.
> 3. Depending on _heads_, return 8 (that is, 1 times the upper bound) with the given probability, or 0 otherwise: _heads_=0 &rarr; probability 1/4; 1 &rarr; 5/6; 2 &rarr; 23/24; 3 &rarr; 5/8.

**Algorithm 2.** This algorithm takes an oracle and produces nonnegative random variates whose expected value ("long-run average") is the mean of _f_(_X_), where _X_ is a number produced by the oracle.  The algorithm appears in the appendix, however, because it requires applying an arbitrary function (here, _f_) to a potentially irrational number.

**Algorithm 3.** For this algorithm, see the appendix.

**Algorithm 4.** Say there is an oracle in the form of a fair die.  The number of faces of the die, _n_, is at least 2 but otherwise unknown. Each face shows a different integer 0 or greater and less than _n_.  The question arises: Which probability distributions based on the number of faces can be sampled with this oracle?  This question was studied in the French-language dissertation of R. Duvignau (2015, section 5.2\)[^19], and the following are four of these distributions.

**_Bernoulli 1/n._** It's trivial to generate a Bernoulli variate that is 1 with probability 1/_n_ and 0 otherwise: just take a number from the oracle and return either 1 if that number is 0, or 0 otherwise.  Alternatively, take two numbers from the oracle and return either 1 if both are the same, or 0 otherwise (Duvignau 2015, p. 153\)[^19].

**_Random variate with mean n._** Likewise, it's trivial to generate variates with a mean of _n_: Do "Bernoulli 1/n" trials as described above until a trial returns 0, then return the number of trials done this way.  (This is related to the ambiguously defined "geometric" random variates.)

**_Binomial with parameters n and 1/n._** Using the oracle, the following algorithm generates a binomial variate of this kind (Duvignau 2015, Algorithm 20\)[^19]\:

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

> **Note:** Duvignau proved a result (Theorem 5.2) that answers the question: Which probability distributions based on the unknown _n_ can be sampled with the oracle?[^20] The result applies to a family of (discrete) distributions with the same unknown parameter _n_, starting with either 1 or a greater integer.  Let Supp(_m_) be the set of values taken on by the distribution with parameter equal to _m_.  Then that family can be sampled using the oracle if and only if:

> - There is a computable function _f_(_k_) that outputs a positive number.
> - For each _n_, Supp(_n_) is included in Supp(_n_+1).
> - For every _k_ and for every _n_ &ge; 2 starting with the first _n_ for which _k_ is in Supp(_n_), the probability of seeing _k_ given parameter _n_ is at least (1/_n_)<sup>_f_(_k_)</sup> (roughly speaking, the probability doesn't decay at a faster than polynomial rate as _n_ increases).

<a id=General_Arbitrary_Precision_Samplers></a>
## General Arbitrary-Precision Samplers

&nbsp;

<a id=Cumulative_Distribution_Functions></a>
### Cumulative Distribution Functions

Suppose a real number _z_ is given (which might be a uniform PSRN or a rational number).  If a probability distribution&mdash;

- has a probability density function (PDF) (as with the normal or exponential distribution), and
- has an arbitrary-precision sampler that returns a uniform PSRN _X_,

then it's possible to generate 1 with the same probability as the sampler returns an _X_ that is less than or equal to _z_, as follows:

1. Run the arbitrary-precision sampler to generate _X_, a uniform PSRN.
2. Run **URandLess** (if _z_ is a uniform PSRN) or **URandLessThanReal** (if _z_ is a real number) with parameters _X_ and _z_, in that order, and return the result.

Specifically, the probability of returning 1 is the _cumulative distribution function_ (CDF) for the distribution of _X_.

> **Notes:**
>
> 1. Although step 2 of the algorithm checks whether _X_ is merely less than _z_, this is still correct; because the distribution of _X_ has a PDF, _X_ is less than _z_ with the same probability as _X_ is less than or equal to _z_.
> 2. All probability distributions have a CDF, not just those with a PDF, but also discrete ones such as Poisson or binomial.

<a id=Uniform_Distribution_Inside_N_Dimensional_Shapes></a>
### Uniform Distribution Inside N-Dimensional Shapes

The following is a general way to describe an arbitrary-precision sampler for generating a point uniformly at random inside a geometric shape located entirely in the hypercube [0, _d1_]&times;[0, _d2_]&times;...&times;[0,_dN_] in _N_-dimensional space, where _d1_, ..., _dN_ are integers greater than 0. The algorithm will generally work if the shape is reasonably defined; the technical requirements are that the shape must have a zero-volume (Lebesgue measure zero) boundary and a nonzero finite volume, and must assign zero probability to any zero-volume subset of it (such as a set of individual points).

The sampler's description has the following skeleton.

1. Generate _N_ empty uniform partially-sampled random numbers (PSRNs), with a positive sign, an integer part of 0, and an empty fractional part.  Call the PSRNs _p1_, _p2_, ..., _pN_.
2. Set _S_ to _base_, where _base_ is the base of digits to be stored by the PSRNs (such as 2 for binary or 10 for decimal).  Then set _N_ coordinates to 0, call the coordinates _c1_, _c2_, ..., _cN_.  Then set _d_ to 1.  Then, for each coordinate (_c1_, ..., _cN_), set that coordinate to an integer in [0, _dX_), chosen uniformly at random, where _dX_ is the corresponding dimension's size.
3. For each coordinate (_c1_, ..., _cN_), multiply that coordinate by _base_ and add a digit chosen uniformly at random to that coordinate.
4. This step uses a function known as **InShape**, which takes the coordinates of a box and returns one of three values: _YES_ if the box is entirely inside the shape; _NO_ if the box is entirely outside the shape; and _MAYBE_ if the box is partly inside and partly outside the shape, or if the function is unsure.  **InShape**, as well as the divisions of the coordinates by _S_, should be implemented using rational arithmetic.  Instead of dividing those coordinates this way, an implementation can pass _S_ as a separate parameter to **InShape**.  See the [**appendix**](#Implementation_Notes_for_Box_Shape_Intersection) for further implementation notes.  In this step, run **InShape** using the current box, whose coordinates in this case are ((_c1_/_S_, _c2_/_S_, ..., _cN_/_S_), ((_c1_+1)/_S_, (_c2_+1)/_S_, ..., (_cN_+1)/_S_)).
5. If the result of **InShape** is _YES_, then the current box was accepted.  If the box is accepted this way, then at this point, _c1_, _c2_, etc., will each store the _d_ digits of a coordinate in the shape, expressed as a number in the interval \[0, 1\], or more precisely, a range of numbers.  (For example, if _base_ is 10, _d_ is 3, and _c1_ is 342, then the first coordinate is 0.342..., or more precisely, a number in the interval \[0.342, 0.343\].)  In this case, do the following:
    1. For each coordinate (_c1_, ..., _cN_), transfer that coordinate's least significant digits to the corresponding PSRN's fractional part.  The variable _d_ tells how many digits to transfer to each PSRN this way. Then, for each coordinate (_c1_, ..., _cN_), set the corresponding PSRN's integer part to floor(_cX_/_base_<sup>_d_</sup>), where _cX_ is that coordinate.  (For example, if _base_ is 10, _d_ is 3, and _c1_ is 7342, set _p1_'s fractional part to \[3, 4, 2\] and _p1_'s integer part to 7.)
    2. For each PSRN (_p1_, ..., _pN_), optionally fill that PSRN with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**).
    3. For each PSRN, optionally do the following: Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), set that PSRN's sign to negative. (This will result in a symmetric shape in the corresponding dimension.  This step can be done for some PSRNs and not others.)
    4. Return the PSRNs _p1_, ..., _pN_, in that order.
6. If the result of **InShape** is _NO_, then the current box lies outside the shape and is rejected.  In this case, go to step 2.
7. If the result of **InShape** is _MAYBE_, it is not known whether the current box lies fully inside or fully outside the shape, so multiply _S_ by _base_, then add 1 to _d_, then go to step 3.

> **Notes:**
>
> 1. See (Li and El Gamal 2016\)[^21] and (Oberhoff 2018\)[^22] for related work on encoding random points uniformly distributed in a shape.
> 2. Rejection sampling on a shape is subject to the "curse of dimensionality", since typical shapes of high dimension will tend to cover much less volume than their bounding boxes, so that it would take a lot of time on average to accept a high-dimensional box.  Moreover, the more volume the shape takes up in the bounding box, the higher the acceptance rate.
> 3. Devroye (1986, chapter 8, section 3\)[^23] describes grid-based methods to optimize random point generation.  In this case, the space is divided into a grid of boxes each with size 1/_base_<sup>_k_</sup> in all dimensions; the result of **InShape** is calculated for each such box and that box labeled with the result; all boxes labeled _NO_ are discarded; and the algorithm is modified by adding the following after step 2: "2a. Choose a precalculated box uniformly at random, then set _c1_, ..., _cN_ to that box's coordinates, then set _d_ to _k_ and set _S_ to _base_<sup>_k_</sup>. If a box labeled _YES_ was chosen, follow the substeps in step 5. If a box labeled _MAYBE_ was chosen, multiply _S_ by _base_ and add 1 to _d_." (For example, if _base_ is 10, _k_ is 1, _N_ is 2, and _d1_ = _d2_ = 1, the space could be divided into a 10&times;10 grid, made up of 100 boxes each of size (1/10)&times;(1/10).  Then, **InShape** is precalculated for the box with coordinates ((0, 0), (1, 1)), the box ((0, 1), (1, 2)), and so on \[the boxes' coordinates are stored as just given, but **InShape** instead uses those coordinates divided by _base_<sup>_k_</sup>, or 10<sup>1</sup> in this case\], each such box is labeled with the result, and boxes labeled _NO_ are discarded.  Finally the algorithm above is modified as just given.)
> 4. Besides a grid, another useful data structure is a _mapped regular paving_ (Harlow et al. 2012\)[^24], which can be described as a binary tree with nodes each consisting of zero or two child nodes and a marking value.  Start with a box that entirely covers the desired shape.  Calculate **InShape** for the box.  If it returns _YES_ or _NO_ then mark the box with _YES_ or _NO_, respectively; otherwise it returns _MAYBE_, so divide the box along its first widest coordinate into two sub-boxes, set the parent box's children to those sub-boxes, then repeat this process for each sub-box (or if the nesting level is too deep, instead mark each sub-box with _MAYBE_).  Then, to generate a random point (with a base-2 fractional part), start from the root, then: (1) If the box is marked _YES_, return a uniform random point between the given coordinates using the **RandUniformInRange** algorithm; or (2) if the box is marked _NO_, start over from the root; or (3) if the box is marked _MAYBE_, get the two child boxes bisected from the box, choose one of them with equal probability (for example, choose the left child if an unbiased random bit is 0, or the right child otherwise), mark the chosen child with the result of **InShape** for that child, and repeat this process with that child; or (4) the box has two child boxes, so choose one of them with equal probability and repeat this process with that child.
> 5. The algorithm can be adapted to return 1 with probability equal to its acceptance rate (which equals the shape's volume divided by the hyperrectangle's volume), and return 0 with the opposite probability.  In this case, replace steps 5 and 6 with the following: "5. If the result of **InShape** is _YES_, return 1.; 6. If the result of **InShape** is _NO_, return 0." (I thank BruceET of the Cross Validated community for leading me to this insight.)
>
> **Examples:**
>
> - The following example generates a point inside a quarter diamond (centered at (0, ..., 0), "radius" _k_ where _k_ is an integer greater than 0): Let _d1_, ..., _dN_ be _k_. Let **InShape** return _YES_ if ((_c1_+1) + ... + (_cN_+1)) < _S_\*_k_; _NO_ if (_c1_ + ... + _cN_) > _S_\*_k_; and _MAYBE_ otherwise.  For _N_=2, the acceptance rate (see note 5) is 1/2.  For a full diamond, step 5.3 in the algorithm is done for each of the _N_ dimensions.
> - The following example generates a point inside a quarter hypersphere (centered at (0, ..., 0), radius _k_ where _k_ is an integer greater than 0): Let _d1_, ..., _dN_ be _k_. Let **InShape** return _YES_ if ((_c1_+1)<sup>2</sup> + ... + (_cN_+1)<sup>2</sup>) < (_S_\*_k_)<sup>2</sup>; _NO_ if (_c1_<sup>2</sup> + ... + _cN_<sup>2</sup>) > (_S_\*_k_)<sup>2</sup>; and _MAYBE_ otherwise.  For _N_=2, the acceptance rate (see note 5) is _&pi;_/4. For a full hypersphere with radius 1, step 5.3 in the algorithm is done for each of the _N_ dimensions.  In the case of a 2-dimensional disk, this algorithm thus adapts the well-known rejection technique of generating X and Y coordinates until X<sup>2</sup>+Y<sup>2</sup> < 1 (for example, (Devroye 1986, p. 230 et seq.\)[^23]).
> - The following example generates a point inside a quarter _astroid_ (centered at (0, ..., 0), radius _k_ where _k_ is an integer greater than 0): Let _d1_, ..., _dN_ be _k_. Let **InShape** return _YES_ if ((_sk_&minus;_c1_&minus;1)<sup>2</sup> + ... + (_sk_&minus;_cN_&minus;1)<sup>2</sup>) > _sk_<sup>2</sup>; _NO_ if ((_sk_&minus;_c1_)<sup>2</sup> + ... + (_sk_&minus;_cN_)<sup>2</sup>) < _sk_<sup>2</sup>; and _MAYBE_ otherwise, where _sk_ = _S_\*_k_.  For _N_=2, the acceptance rate (see note 5) is 1 &minus; _&pi;_/4. For a full astroid, step 5.3 in the algorithm is done for each of the _N_ dimensions.

<a id=Building_an_Arbitrary_Precision_Sampler></a>
### Building an Arbitrary-Precision Sampler

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
6. Create an input coin that calls **SampleGeometricBag** on the PSRN _ret_.  Run a Bernoulli factory algorithm that returns 1 with probability equal to  _C_(_i_, _&lambda;_), using the input coin (here, _&lambda;_, the heads probability of the input coin, is the probability built up in _ret_ via **SampleGeometricBag**, and lies in the interval \[0, 1\]).  If the call returns 0, go to step 4.
    - The probability _C_(_i_, _&lambda;_) is calculated as _PDF_(_i_ + _&lambda;_) / _M_, where _PDF_ is the distribution's PDF or a function proportional to the PDF, and should be found analytically using a computer algebra system such as SymPy.
    - In this formula, _M_ is any convenient number that satisfies _PDF_(_intval_) &le; _M_ &le; max(1, _PDF_(_intval_)), and should be as low as feasible. _M_ serves to ensure that _C_ is as close as feasible to 1 (to improve acceptance rates), but no higher than 1.  The choice of _M_ can vary for each interval (each value of _intval_, which can only be 0, 1, or a power of 2).  Any such choice for _M_ preserves the algorithm's correctness because the PDF has to be strictly decreasing and a new interval isn't chosen when _&lambda;_ is rejected.
    - The symbolic form of _C_ will help determine which Bernoulli factory algorithm, if any, will simulate the probability; if a Bernoulli factory exists, it should be used.
7. The PSRN _ret_ was accepted, so set _ret_'s integer part to _i_, then optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _ret_.

Examples of algorithms that use this skeleton are the algorithm for the [**ratio of two uniform random variates**](https://peteroupc.github.io/uniformsum.html), as well as the algorithms for the Rayleigh distribution and for the reciprocal of power of uniform, both given later.

Perhaps the most difficult part of describing an arbitrary-precision sampler with this skeleton is finding the appropriate Bernoulli factory algorithm for the probabilities _A_, _B_, and _C_, especially when these probabilities have a non-trivial symbolic form.

> **Note:** The algorithm skeleton uses ideas similar to the inversion-rejection method described in Devroye (1986, ch. 7, sec. 4.6\)[^23]; an exception is that instead of generating a uniform random variate and comparing it to calculations of a CDF, this algorithm uses conditional probabilities of choosing a given piece, probabilities labeled _A_ and _B_.  This approach was taken so that the CDF of the distribution in question is never directly calculated in the course of the algorithm, which furthers the goal of sampling with arbitrary precision and without using floating-point arithmetic.

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
2. Choose an integer _i_ with probability proportional to the weights in the rounded weights list.  This can be done, for example, by taking the result of **WeightedChoice**(_list_), where _list_ is the rounded weights list and **WeightedChoice** is given in "[**Randomization and Sampling Methods**](https://peteroupc.github.io/randomfunc.html#Weighted_Choice_With_Replacement)".
3. Run **URandLessThanReal**(_w_, _rw_), where _w_ is the original weight for integer _i_, and _rw_ is the rounded weight for integer _i_ in the rounded weights list.  That algorithm returns 1 if _w_ turns out to be less than _rw_.  If the result is 1, return _i_.  Otherwise, go to step 2.

<a id=Specific_Arbitrary_Precision_Samplers></a>
## Specific Arbitrary-Precision Samplers

&nbsp;

<a id=Rayleigh_Distribution></a>
### Rayleigh Distribution

The following is an arbitrary-precision sampler for the Rayleigh distribution with parameter _s_, which is a rational number greater than 0.

1. Set _k_ to 0, and set _y_ to 2 * _s_ * _s_.
2. With probability exp(&minus;(_k_ * 2 + 1)/_y_), go to step 3.  Otherwise, add 1 to _k_ and repeat this step.  (The probability check should be done with the **exp(&minus;_x_/_y_) algorithm** in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", with _x_/_y_ = (_k_ * 2 + 1)/_y_.)
3. (Now, the piece located at [_k_, _k_ + 1) is sampled.)  Create a positive-sign zero-integer-part uniform PSRN, and create an input coin that returns the result of **SampleGeometricBag** on that uniform PSRN.
4. Set _ky_ to _k_ * _k_ / _y_.
5. (Now simulating exp(&minus;_U_<sup>2</sup>/_y_), exp(&minus;_k_<sup>2</sup>/_y_) , exp(&minus;_U_\*_k_\*2/_y_), as well as a scaled-down version of _U_ + _k_, where _U_ is the number built up by the uniform PSRN.) Call the **exp(&minus;_x_/_y_) algorithm** with _x_/_y_ = _ky_, then call the **exp(&minus;(_&lambda;_<sup>_k_</sup> * _x_)) algorithm** using the input coin from step 2, _x_ = 1/_y_, and _k_ = 2, then call the first or third algorithm for **exp(&minus;(_&lambda;_<sup>_k_</sup> \* _c_))** using the same input coin, _c_ = floor(_k_ * 2 / _y_), and _k_ = 1, then call the **sub-algorithm** given later with the uniform PSRN and _k_ = _k_.  If all of these calls return 1, the uniform PSRN was accepted.  Otherwise, remove all digits from the uniform PSRN's fractional part and go to step 4.
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
### Hyperbolic Secant Distribution

The following algorithm adapts the rejection algorithm from p. 472 in (Devroye 1986\)[^23] for arbitrary-precision sampling.

1. Generate _ret_, an exponential random variate with a rate of 1 via the **ExpRand** or **ExpRand2** algorithm described in my article on [**PSRNs**](https://peteroupc.github.io/exporand.html).  This number will be a uniform PSRN.
2. Set _ip_ to 1 plus _ret_'s integer part.
3. (The rest of the algorithm accepts _ret_ with probability 1/(1+_ret_).) With probability _ip_/(1+_ip_), generate a number that is 1 with probability 1/_ip_ and 0 otherwise.  If that number is 1, _ret_ was accepted, in which case optionally fill it with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then set _ret_'s sign to positive or negative with equal probability, then return _ret_.
4. Call **SampleGeometricBag** on _ret_'s fractional part (ignore _ret_'s integer part and sign).  If the call returns 1, go to step 1.  Otherwise, go to step 3.

<a id=Reciprocal_of_Power_of_Uniform></a>
### Reciprocal of Power of Uniform

The following algorithm generates a PSRN of the form 1/_U_<sup>1/_x_</sup>, where _U_ is a uniform random variate greater than 0 and less than 1 and _x_ is an integer greater than 0.

1. Set _intval_ to 1 and set _size_ to 1.
2. With probability (4<sup>_x_</sup>&minus;2<sup>_x_</sup>)/4<sup>_x_</sup>, go to step 3.  Otherwise, add _size_ to _intval_, then multiply _size_ by 2, then repeat this step.
3. Generate an integer in the interval [_intval_, _intval_ + _size_) uniformly at random, call it _i_.
4. Create _ret_, a uniform PSRN with a positive sign and an integer part of 0.
5. Create an input coin that calls **SampleGeometricBag** on the PSRN _ret_.  Call the **algorithm for _d_<sup>_k_</sup> / (_c_ + _&lambda;_)<sup>_k_</sup>** in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", using the input coin, where _d_ = _intval_, _c_ = _i_, and _k_ = _x_ + 1 (here, _&lambda;_ is the probability built up in _ret_ via **SampleGeometricBag**, and lies in the interval \[0, 1\]).  If the call returns 0, go to step 3.
6. The PSRN _ret_ was accepted, so set _ret_'s integer part to _i_, then optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _ret_.

This algorithm uses the skeleton described earlier in "Building an Arbitrary-Precision Sampler".  Here, the probabilities _A_, _B_,  and _C_ are as follows:

- _A_ = 0, since the random variate can't be zero or come between 0 and 1.
- _B_ = (4<sup>_x_</sup>&minus;2<sup>_x_</sup>)/4<sup>_x_</sup>.
- _C_ = (_x_/(_i_ + _&lambda;_)<sup>_x_+1</sup>) / _M_.  Ideally, _M_ is either _x_ if _intval_ is 1, or _x_/_intval_<sup>_x_+1</sup> otherwise.  Thus, the ideal form for _C_ is _intval_<sup>_x_+1</sup>/(_i_+_&lambda;_)<sup>_x_+1</sup>.

<a id=Distribution_of__U__1_minus__U></a>
### Distribution of _U_/(1&minus;_U_)

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
### Arc-Cosine Distribution

The following is a reimplementation of an example from Devroye's book _Non-Uniform Random Variate Generation_ (Devroye 1986, pp. 128&ndash;129\)[^23].  The following arbitrary-precision sampler generates a random variate from a distribution with the following cumulative distribution function (CDF): `1 - cos(pi*x/2).`  The random variate will be 0, 1, or a real number in between.  This algorithm's result is the same as applying acos(_U_)*2/&pi;, where _U_ is a uniform random variate between 0 and 1, as pointed out by Devroye. (acos(_x_) is the inverse cosine function.)  The algorithm follows.

1. Call the **kthsmallest** algorithm with `n = 2` and `k = 2`, but without filling it with digits at the last step.  Let _ret_ be the result.
2. Set _m_ to 1.
3. Call the **kthsmallest** algorithm with `n = 2` and `k = 2`, but without filling it with digits at the last step.  Let _u_ be the result.
4. With probability 4/(4\*_m_\*_m_ + 2\*_m_), call the **URandLess** algorithm with parameters _u_ and _ret_ in that order, and if that call returns 1, call the **algorithm for &pi; / 4**, described in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)", twice, and if both of these calls return 1, add 1 to _m_ and go to step 3.  (Here, an erratum in the algorithm on page 129 of the book is incorporated.)
5. If _m_ is odd[^8], optionally fill _ret_ with uniform random digits as necessary to give its fractional part the desired number of digits  (similarly to **FillGeometricBag**), and return _ret_.
6. If _m_ is even[^11], go to step 1.

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
5. Run the **algorithm for exp(&minus;_k_/1)** (described in "Bernoulli Factory Algorithms"), then **sample from the number _f_** (for example, call **SampleGeometricBag** on _f_ if _f_ is implemented as a uniform PSRN).  If any of these calls returns 0, go to step 4.
6. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), accept _f_.  If _f_ is accepted this way, set _f_'s integer part to _k_, then optionally fill _f_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then set _f_'s sign to positive or negative with equal probability, then return _f_.
7. Run the **algorithm for exp(&minus;_k_/1)** and **sample from the number _f_** (for example, call **SampleGeometricBag** on _f_ if _f_ is implemented as a uniform PSRN).  If both calls return 1, go to step 3.  Otherwise, go to step 6.

<a id=Cauchy_Distribution></a>
### Cauchy Distribution

Uses the skeleton for the uniform distribution inside N-dimensional shapes.

1. Generate two empty PSRNs, with a positive sign, an integer part of 0, and an empty fractional part.  Call the PSRNs _p1_ and _p2_.
2. Set _S_ to _base_, where _base_ is the base of digits to be stored by the PSRNs (such as 2 for binary or 10 for decimal).  Then set _c1_ and _c2_ each to 0.  Then set _d_ to 1.
3. Multiply _c1_ and _c2_ each by _base_ and add a digit chosen uniformly at random to that coordinate.
4. If ((_c1_+1)<sup>2</sup> + (_c2_+1)<sup>2</sup>) < _S_<sup>2</sup>, then do the following:
    1. Transfer _c1_'s least significant digits to _p1_'s fractional part, and transfer _c2_'s least significant digits to _p2_'s fractional part.  The variable _d_ tells how many digits to transfer to each PSRN this way. (For example, if _base_ is 10, _d_ is 3, and _c1_ is 342, set _p1_'s fractional part to \[3, 4, 2\].)
    2. Run the **UniformDivide** algorithm (described in the article on PSRNs) on _p1_ and _p2_, in that order, then set the resulting PSRN's sign to positive or negative with equal probability, then return that PSRN.
5. If (_c1_<sup>2</sup> + _c2_<sup>2</sup>) > _S_<sup>2</sup>, then go to step 2.
6. Multiply _S_ by _base_, then add 1 to _d_, then go to step 3.

<a id=Exponential_Distribution_with_Unknown_Small_Rate></a>
### Exponential Distribution with Unknown Small Rate

Exponential random variates can be generated using an input coin of unknown probability of heads of _&lambda;_ (which can either be 1 or come between 0 and 1), by generating arrival times in a _Poisson process_ of rate 1, then _thinning_ the process using the coin.  The arrival times that result will be exponentially distributed with rate _&lambda;_.  I found the basic idea in the answer to a [**Mathematics Stack Exchange question**](https://math.stackexchange.com/questions/3362473/simulating-an-exponential-random-variable-given-bernoulli-uniform), and thinning of Poisson processes is discussed, for example, in Devroye (1986, chapter six\)[^23].  The algorithm follows:

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
3. Create a _&mu;_ input coin that does the following: "**Sample from the number _f_** (for example, call **SampleGeometricBag** on _f_ if _f_ is implemented as a uniform PSRN), then run the **algorithm for ln(1+_y_/_z_)** (given in "Bernoulli Factory Algorithms") with _y_/_z_ = 1/1.  If both calls return 1, return 1.  Otherwise, return 0." (This simulates the probability _&lambda;_ = _f_\*ln(2).)   Then:
    - If _x_ is a rational number, but not a power of 2, also create a _&nu;_ input coin that does the following: "**Sample from the number _f_**, then run the **algorithm for ln(1 + _y_/_z_)** with _y_/_z_ = (_x_&minus;2<sup>_b_</sup>)/2<sup>_b_</sup>.  If both calls return 1, return 1.  Otherwise, return 0."
    - If _x_ is a uniform PSRN, also create a _&rho;_ input coin that does the following: "Return the result of the second subalgorithm (later in this section), given _x_ and _b_", and a _&nu;_ input coin that does the following: "**Sample from the number _f_**, then run the **algorithm for ln(1 + _&lambda;_)**, using the _&rho;_ input coin.  If both calls return 1, return 1.  Otherwise, return 0."
4. Run the **algorithm for exp(&minus;_&lambda;_)** (described in "Bernoulli Factory Algorithms") _b_ times, using the _&mu;_ input coin.  If a _&nu;_ input coin was created in step 3, run the same algorithm once, using the _&nu;_ input coin.  If all these calls return 1, accept _f_.  If _f_ is accepted this way, set _f_'s integer part to _k_, then optionally fill _f_ with uniform random digits as necessary to give its fractional part the desired number of digits (similarly to **FillGeometricBag**), then return _f_.
5. If _f_ was not accepted by the previous step, go to step 2.

> **Note**: A _bounded exponential_ random variate with rate ln(_x_) and bounded by _m_ has a similar algorithm to this one.  Step 1 is changed to read as follows: "Do the following _m_ times or until a zero is generated, whichever happens first: 'Generate a number that is 1 with probability 1/_x_ and 0 otherwise'. Then set _k_ to the number of ones generated this way. (_k_ is a so-called bounded-geometric(1&minus;1/_x_, _m_) random variate, which an algorithm of Bringmann and Friedrich (2013\)[^25] can generate as well.  If _x_ is a power of 2, this can be implemented by generating blocks of _b_ unbiased random bits until a **non-zero** block of bits or _m_ blocks of bits are generated this way, whichever comes first, then setting _k_ to the number of **all-zero** blocks of bits generated this way.) If _k_ is _m_, return _m_ (this _m_ is a constant, not a uniform PSRN; if the algorithm would otherwise return a uniform PSRN, it can return something else in order to distinguish this constant from a uniform PSRN)."  Additionally, instead of generating a uniform(0,1) random variate in step 2, a uniform(0,_&mu;_) random variate can be generated instead, such as a uniform PSRN generated via **RandUniformFromReal**, to implement an exponential distribution bounded by _m_+_&mu;_ (where _&mu;_ is a real number greater than 0 and less than 1).

The following generator for the **rate ln(2)** is a special case of the previous algorithm and is useful for generating a base-2 logarithm of a uniform(0,1) random variate. Unlike the similar algorithm of Ahrens and Dieter (1972\)[^26], this one doesn't require a table of probability values.

1. (Samples the integer part of the random variate.  This will be geometrically distributed with parameter 1/2.) Generate unbiased random bits until a zero is generated this way.  Set _k_ to the number of ones generated this way.
2. (The rest of the algorithm samples the fractional part.) Generate a uniform (0, 1) random variate, call it _f_.
3. Create an input coin that does the following: "**Sample from the number _f_** (for example, call **SampleGeometricBag** on _f_ if _f_ is implemented as a uniform PSRN), then run the **algorithm for ln(1+_y_/_z_)** (given in "Bernoulli Factory Algorithms") with _y_/_z_ = 1/1.  If both calls return 1, return 1.  Otherwise, return 0." (This simulates the probability _&lambda;_ = _f_\*ln(2).)
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

Samples from the symmetric geometric distribution from (Ghosh et al. 2012\)[^27], with parameter _&lambda;_, in the form of an input coin with unknown probability of heads of _&lambda;_.

1. Flip the input coin until it returns 0.  Set _n_ to the number of times the coin returned 1 this way.
2. Run a **Bernoulli factory algorithm for 1/(2&minus;_&lambda;_)**, using the input coin.  If the run returns 1, return _n_.  Otherwise, return &minus;1 &minus; _n_.

This is similar to an algorithm mentioned in an appendix in Li (2021\)[^28], in which the input coin&mdash;

- has _&lambda;_ = 1&minus;exp(&minus;_&epsilon;_), and
- can be built as follows using another input coin with probability of heads _&epsilon;_: "Run a **Bernoulli factory algorithm for exp(&minus;_&lambda;_)** using the _&epsilon;_ input coin, then return 1 minus the result."

<a id=Lindley_Distribution_and_Lindley_Like_Mixtures></a>
### Lindley Distribution and Lindley-Like Mixtures

The _Lindley distribution_ is a _mixture_ of two probability distributions, with each of the two distributions having a separate probability of being sampled (_w_ and 1&minus;_w_ in the algorithm below).  A random variate that follows the Lindley distribution (Lindley 1958\)[^29] with parameter _&theta;_ (a real number greater than 0) can be generated as follows:

Let _A_ be 1 and let _B_ be 2.  Then:

1. With probability _w_ = _&theta;_/(1+_&theta;_), generate _A_ exponential random variates with a rate of _r_ = _&theta;_ via **ExpRand** or **ExpRand2** (described in my article on PSRNs), then generate their sum by applying the **UniformAdd** algorithm, then return that sum.
2. Otherwise, generate _B_ exponential random variates with a rate of _r_ via **ExpRand** or **ExpRand2**, then generate their sum by applying the **UniformAdd** algorithm, then return that sum.

Mixtures similar to the Lindley distribution are shown in the following table and use the same algorithm, but with the values given in the table.

| Distribution | _w_ is: | _r_ is: | _A_ is: | _B_ is: |
  --- | --- | --- | --- | --- |
| Garima (Shanker 2016\)[^30]. | (1+_&theta;_)/(2+_&theta;_). | _&theta;_. | 1. | 2. |
| i-Garima (Singh and Das 2020\)[^31]. | (2+_&theta;_)/(3+_&theta;_). | _&theta;_. | 1. | 2. |
| Mixture-of-weighted-exponential-and-weighted-gamma (Iqbal and Iqbal 2020\)[^32]. | _&theta;_/(1+_&theta;_). | _&theta;_. | 2. | 3. |
| Xgamma (Sen et al. 2016)[^33]. | _&theta;_/(1+_&theta;_). | _&theta;_. | 1. | 3. |
| Mirra (Sen et al. 2021)[^34]. | _&theta;_<sup>2</sup>/(_&alpha;_+_&theta;_<sup>2</sup>) where _&alpha;_>0. | _&theta;_. | 1. | 3. |

> **Notes:**
>
> 1. If _&theta;_ is a uniform PSRN, then the check "With probability  _w_ = _&theta;_/(1+_&theta;_)" can be implemented by running the Bernoulli factory algorithm for **(_d_ + _&mu;_) / ((_d_ + _&mu;_) + (_c_ + _&lambda;_))**, where _c_ is 1; _&lambda;_ represents an input coin that always returns 0; _d_ is _&theta;_'s integer part, and _&mu;_ is an input coin that runs **SampleGeometricBag** on _&theta;_'s fractional part.  The check succeeds if the Bernoulli factory algorithm returns 1.
> 2. A **Sushila** random variate is _&alpha;_ times a Lindley random variate, where _&alpha;_ > 0 (Shanker et al. 2013)[^35].
> 3. An **X-Lindley** random variate (Chouia and Zeghdoudi 2021)[^36] is, with probability _&theta;_/(1+_&theta;_), an exponential random variate with a rate of _&theta;_ (see step 1), and otherwise, a Lindley random variate with parameter _&theta;_.

<a id=Gamma_Distribution></a>
### Gamma Distribution

The following arbitrary-precision sampler generates the sum of _n_ independent exponential random variates (also known as the Erlang(_n_) or gamma(_n_) distribution), implemented via partially-sampled uniform random variates.  Obviously, this algorithm is inefficient for large values of _n_.

1. Generate _n_ exponential random variates with a rate of 1 via the **ExpRand** or **ExpRand2** algorithm described in my article on [**partially-sampled random numbers (PSRNs)**](https://peteroupc.github.io/exporand.html).  These numbers will be uniform PSRNs; this algorithm won't work for exponential PSRNs (e-rands), described in the same article, because the sum of two e-rands may follow a subtly wrong distribution.  By contrast, generating exponential random variates via rejection from the uniform distribution will allow unsampled digits to be sampled uniformly at random without deviating from the exponential distribution.
2. Generate the sum of the random variates generated in step 1 by applying the [**UniformAdd**](https://peteroupc.github.io/exporand.html#Addition_and_Subtraction) algorithm given in another document.

<a id=One_Dimensional_Epanechnikov_Kernel></a>
### One-Dimensional Epanechnikov Kernel

Adapted from Devroye and Györfi (1985, p. 236\)[^37].

1. Generate three uniform PSRNs _a_, _b_, and _c_, with a positive sign, an integer part of 0, and an empty fractional part.
2. Run **URandLess** on _a_ and _c_ in that order, then run **URandLess** on _b_ and _c_ in that order.  If both runs return 1, set _c_ to point to _b_.
3. Generate an unbiased random bit.  If that bit is 1 (which will happen with probability 1/2), set _c_'s sign to negative.
4. Return _c_.

<a id=Uniform_Distribution_Inside_Rectellipse></a>
### Uniform Distribution Inside Rectellipse

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
### Tulap distribution

The algorithm below samples a variate from the Tulap(_m_, _b_, _q_) distribution ("truncated uniform Laplace"; Awan and Slavković (2019)[^38]) and returns it as a uniform PSRN.

- The parameter _b_ is greater than 0, is less than 1, and can be a uniform PSRN.
- The parameter _m_ is a rational number or a uniform PSRN.
- The parameter _q_ is not used in this algorithm, and is treated as 0.

-----

1. **Sample from the number _b_** (for example, call **SampleGeometricBag** on _b_ if _b_ is implemented as a uniform PSRN) until the result is 0.  Set _g1_ to the number of times the result is 1 this way.
2. **Sample from the number _b_** until the result is 0.  Set _g2_ to the number of times the result is 1 this way.
3. Set _n_ to _g2_ &minus; _g1_.  Create _ret_, a uniform PSRN as follows: The sign part is positive if _n_ &ge; 0 and negative otherwise; the integer part is abs(_n_); the fractional part is empty.
4. Add a uniform random variate in (&minus;1/2, 1/2) to _ret_.  If _ret_ stores base-2 fractional digits, this can be done as follows.  Set _u_ to an unbiased random bit, then:
    - If _n_ < 0 and _u_ is 1, subtract 1 from the integer part and append 1 to the fractional part.
    - If _n_ > 0 and _u_ is 1, add 1 to the integer part and append 1 to the fractional part.
    - If _n_ is 0 or _u_ is 0, append 0 to the fractional part.
5. If _m_ is given and is not 0, run the **UniformAdd** or **UniformAddRational** algorithm with parameters _ret_ and _m_, respectively, and set _ret_ to the result.
6. Return _ret_.

<a id=Requests_and_Open_Questions></a>
## Requests and Open Questions

1. There is interest in seeing new implementations of the following:
    - Algorithms that implement **InShape** for specific closed curves, specific closed surfaces, and specific signed distance functions.  Recall that **InShape** determines whether a box lies inside, outside, or partly inside or outside a given curve or surface.
    - Descriptions of new arbitrary-precision algorithms that use the skeleton given in the section "Building an Arbitrary-Precision Sampler".
2. The appendix contains implementation notes for **InShape**, which determines whether a box is outside or partially or fully inside a shape.  However, practical implementations of **InShape** will generally only be able to evaluate a shape pointwise.  What are necessary and/or sufficient conditions that allow an implementation to correctly classify a box just by evaluating the shape pointwise?
3. Take a polynomial _f_(_&lambda;_) of even degree _n_ of the form choose(_n_,_n_/2)\*_&lambda;_<sup>_n_/2</sup>\*(1&minus;_&lambda;_)<sup>_n_/2</sup>\*_k_, where _k_ is greater than 1 (thus all _f_'s Bernstein coefficients are 0 except for the middle one, which equals _k_).  Suppose _f_(1/2) is greater than 0 and less than 1.  If the degree elevation, described in the appendix, is done enough times (at least _r_ times), then _f_'s Bernstein coefficients will all lie in the interval [0, 1].  The question is: how many degree elevations are enough?  A [**MathOverflow answer**](https://mathoverflow.net/questions/381419/on-the-degree-elevation-needed-to-bring-bernstein-coefficients-to-0-1) showed that _r_ is at least _m_ = (_n_/_f_(1/2)<sup>2</sup>)/(1&minus;_f_(1/2)<sup>2</sup>), but is it true that floor(_m_)+1 elevations are enough?
4. A [**_finite-state generator_**](https://peteroupc.github.io/morealg.html#Finite_State_and_Pushdown_Generators) is a finite-state machine that generates a real number's base-2 expansion such as 0.110101100..., driven by flips of a coin.  A _pushdown generator_ is a finite-state generator with a stack of memory.  Both generators produce real numbers with a given probability distribution.  For example, a generator with a loop that outputs 0 or 1 at an equal chance produces a _uniform distribution_.  The following questions ask what kinds of distributions are possible with these generators.

    1. Of the probability distributions that a finite-state generator can generate, what is the exact class of:
        - _Discrete distributions_ (those that cover a finite or countably infinite set of values)?
        - _Absolutely continuous distributions_ (those with a probability density function such as the uniform or triangular distribution)?
        - _Singular distributions_ (covering an uncountable but zero-volume set)?
        - Absolutely continuous distributions with _continuous_ density functions?
    2. Same question as 1, but for pushdown generators.
    3. Of the probability distributions that a pushdown generator can generate, what is the exact class of distributions with piecewise density functions whose pieces have infinitely many "slope" functions?  (The answer is known for finite-state generators.)

<a id=Acknowledgments></a>
## Acknowledgments

Michael Shoemate gave comments on this article.

<a id=Notes></a>
## Notes

[^1]: Łatuszyński, K., Kosmidis, I.,  Papaspiliopoulos, O., Roberts, G.O., "[**Simulating events of unknown probabilities via reverse time martingales**](https://arxiv.org/abs/0907.4018v2)", arXiv:0907.4018v2 [stat.CO], 2009/2011.

[^2]: S. Ray, P.S.V. Nataraj, "A Matrix Method for Efficient Computation of Bernstein Coefficients", _Reliable Computing_ 17(1), 2012.

[^3]: To show the target function $f(\lambda)$ is convex, find the "slope-of-slope" function of _f_ and show it's 0 or greater for every _&lambda;_ in the domain.  To do so, first find the "slope": omit the first term and for each remaining term (with $i\ge 1$), replace $a_i \lambda^i$ with $a_i i \lambda^{i-1}$.  The resulting "slope" function is still an infinite series with coefficients 0 or greater.  Hence, so will the "slope" of this "slope" function, so the result follows by induction.

[^4]: _Summation notation_, involving the Greek capital sigma (&Sigma;), is a way to write the sum of one or more terms of similar form. For example, $\sum_{k=0}^n g(k)$ means $g(0)+g(1)+...+g(n)$, and $\sum_{k\ge 0} g(k)$ means $g(0)+g(1)+...$.

[^5]: Dughmi, Shaddin, Jason Hartline, Robert D. Kleinberg, and Rad Niazadeh. "Bernoulli Factories and Black-box Reductions in Mechanism Design." Journal of the ACM (JACM) 68, no. 2 (2021): 1-30.

[^6]: Knuth, Donald E. and Andrew Chi-Chih Yao. "The complexity of nonuniform random number generation", in _Algorithms and Complexity: New Directions and Recent Results_, 1976.

[^7]: Mendo, Luis. "An asymptotically optimal Bernoulli factory for certain functions that can be expressed as power series." Stochastic Processes and their Applications 129, no. 11 (2019): 4366-4384.

[^8]: "_x_ is odd" means that _x_ is an integer and not divisible by 2.  This is true if _x_ &minus; 2\*floor(_x_/2) equals 1, or if _x_ is an integer and the least significant bit of abs(_x_) is 1.

[^9]: choose(_n_, _k_) = (1\*2\*3\*...\*_n_)/((1\*...\*_k_)\*(1\*...\*(_n_&minus;_k_))) =  _n_!/(_k_! * (_n_ &minus; _k_)!) is a _binomial coefficient_, or the number of ways to choose _k_ out of _n_ labeled items.  It can be calculated, for example, by calculating _i_/(_n_&minus;_i_+1) for each integer _i_ in the interval \[_n_&minus;_k_+1, _n_\], then multiplying the results (Yannis Manolopoulos. 2002. "[**Binomial coefficient computation: recursion or iteration?**](https://doi.org/10.1145/820127.820168)", SIGCSE Bull. 34, 4 (December 2002), 65–67).  For every _m_&gt;0, choose(_m_, 0) = choose(_m_, _m_) = 1 and choose(_m_, 1) = choose(_m_, _m_&minus;1) = _m_; also, in this document, choose(_n_, _k_) is 0 when _k_ is less than 0 or greater than _n_.

[^10]: _n_! = 1\*2\*3\*...\*_n_ is also known as _n_ factorial; in this document, (0!) = 1.

[^11]: "_x_ is even" means that _x_ is an integer and divisible by 2.  This is true if _x_ &minus; 2\*floor(_x_/2) equals 0, or if _x_ is an integer and the least significant bit of abs(_x_) is 0.

[^12]: Thomas, A.C., Blanchet, J., "[**A Practical Implementation of the Bernoulli Factory**](https://arxiv.org/abs/1106.2508v3)", arXiv:1106.2508v3  [stat.AP], 2012.

[^13]: Nacu, Şerban, and Yuval Peres. "[**Fast simulation of new coins from old**](https://projecteuclid.org/euclid.aoap/1106922322)", The Annals of Applied Probability 15, no. 1A (2005): 93-115.

[^14]: Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560)", arXiv:0906.5560  [math.PR], 2010

[^15]: Mossel, Elchanan, and Yuval Peres. New coins from old: computing with unknown bias. Combinatorica, 25(6), pp.707-724, 2005.

[^16]: Citterio, M., Pavani, R., "A Fast Computation of the Best k-Digit Rational Approximation to a Real Number", Mediterranean Journal of Mathematics 13 (2016).

[^17]: Łatuszyński, K., Kosmidis, I., Papaspiliopoulos, O., Roberts, G.O., "[**Simulating events of unknown probabilities via reverse time martingales**](https://arxiv.org/abs/0907.4018v2)", arXiv:0907.4018v2 [stat.CO], 2009/2011.

[^18]: Jacob, P.E., Thiery, A.H., "On nonnegative unbiased estimators", Ann. Statist., Volume 43, Number 2 (2015), 769-784.

[^19]: Duvignau, R., 2015. Maintenance et simulation de graphes aléatoires dynamiques (Doctoral dissertation, Université de Bordeaux).

[^20]: There are many distributions that can be sampled using the oracle, by first generating unbiased random bits via randomness extraction methods, but then these distributions won't use the unknown number of faces in general.  Duvignau proved Theorem 5.2 for an oracle that outputs _arbitrary_ but still distinct items, as opposed to integers, but this case can be reduced to the integer case (see section 4.1.3).

[^21]: C.T. Li, A. El Gamal, "[**A Universal Coding Scheme for Remote Generation of Continuous Random Variables**](https://arxiv.org/abs/1603.05238v1)", arXiv:1603.05238v1  [cs.IT], 2016

[^22]: Oberhoff, Sebastian, "[**Exact Sampling and Prefix Distributions**](https://dc.uwm.edu/etd/1888)", _Theses and Dissertations_, University of Wisconsin Milwaukee, 2018.

[^23]: Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.

[^24]: Harlow, J., Sainudiin, R., Tucker, W., "Mapped Regular Pavings", _Reliable Computing_ 16 (2012).

[^25]: Bringmann, K. and Friedrich, T., 2013, July. "Exact and efficient generation of geometric random variates and random graphs", in _International Colloquium on Automata, Languages, and Programming_ (pp. 267-278).

[^26]: Ahrens, J.H., and Dieter, U., "Computer methods for sampling from the exponential and normal distributions", _Communications of the ACM_ 15, 1972.

[^27]: Ghosh, A., Roughgarden, T., and Sundararajan, M., "Universally Utility-Maximizing Privacy Mechanisms", _SIAM Journal on Computing_ 41(6), 2012.

[^28]: Li, L., 2021. Bayesian Inference on Ratios Subject to Differentially Private Noise (Doctoral dissertation, Duke University).

[^29]: Lindley, D.V., "Fiducial distributions and Bayes' theorem", _Journal of the Royal Statistical Society Series B_, 1958.

[^30]: Shanker, R., "Garima distribution and its application to model behavioral science data", _Biom Biostat Int J._ 4(7), 2016.

[^31]: Singh, B.P., Das, U.D., "[**On an Induced Distribution and its Statistical Properties**](https://arxiv.org/abs/2010.15078)", arXiv:2010.15078 [stat.ME], 2020.

[^32]: Iqbal, T. and Iqbal, M.Z., 2020. On the Mixture Of Weighted Exponential and Weighted Gamma Distribution. International Journal of Analysis and Applications, 18(3), pp.396-408.

[^33]: Sen, S., et al., "The xgamma distribution: statistical properties and application", 2016.

[^34]: Sen, Subhradev, Suman K. Ghosh, and Hazem Al-Mofleh. "The Mirra distribution for modeling time-to-event data sets." In Strategic Management, Decision Theory, and Decision Science, pp. 59-73. Springer, Singapore, 2021.

[^35]: Shanker, Rama, Shambhu Sharma, Uma Shanker, and Ravi Shanker. "Sushila distribution and its application to waiting times data." International Journal of Business Management 3, no. 2 (2013): 1-11.

[^36]: Chouia, Sarra, and Halim Zeghdoudi. "The xlindley distribution: Properties and application." Journal of Statistical Theory and Applications 20, no. 2 (2021): 318-327.

[^37]: Devroye, L., Györfi, L., _Nonparametric Density Estimation: The L1 View_, 1985.

[^38]: Awan, Jordan, and Aleksandra Slavković. "Differentially private inference for binomial data." arXiv:1904.00459 (2019).

[^39]: Kinderman, A.J., Monahan, J.F., "Computer generation of random variables using the ratio of uniform deviates", _ACM Transactions on Mathematical Software_ 3(3), pp. 257-260, 1977.

[^40]: Daumas, M., Lester, D., Muñoz, C., "[**Verified Real Number Calculations: A Library for Interval Arithmetic**](https://arxiv.org/abs/0708.3721)", arXiv:0708.3721 [cs.MS], 2007.

[^41]: Karney, C.F.F., 2016. Sampling exactly from the normal distribution. ACM Transactions on Mathematical Software (TOMS), 42(1), pp.1-14. Also: "[**Sampling exactly from the normal distribution**](https://arxiv.org/abs/1303.6257v2)", arXiv:1303.6257v2  [physics.comp-ph], 2014.

[^42]: Leydold, J., "[**Automatic sampling with the ratio-of-uniforms method**](https://dl.acm.org/doi/10.1145/347837.347863)", ACM Transactions on Mathematical Software 26(1), 2000.

[^43]: Duff, T., "Interval Arithmetic and Recursive Subdivision for Implicit Functions and Constructive Solid Geometry", Computer Graphics 26(2), July 1992.

[^44]: I thank D. Eisenstat from the _Stack Overflow_ community for leading me to this insight.

[^45]: Brassard, G., Devroye, L., Gravel, C., "Remote Sampling with Applications to General Entanglement Simulation", _Entropy_ 2019(21)(92), [**https://doi.org/10.3390/e21010092**](https://doi.org/10.3390/e21010092) .

[^46]: Devroye, L., Gravel, C., "[**Random variate generation using only finitely many unbiased, independently and identically distributed random bits**](https://arxiv.org/abs/1502.02539v6)", arXiv:1502.02539v6 [cs.IT], 2020.

[^47]: Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.

[^48]: Lee, A., Doucet, A. and Łatuszyński, K., 2014. "[**Perfect simulation using atomic regeneration with application to Sequential Monte Carlo**](https://arxiv.org/abs/1407.5770v1)", arXiv:1407.5770v1  [stat.CO].

[^49]: Banderier, C. And Drmota, M., 2015. Formulae and asymptotics for coefficients of algebraic functions. Combinatorics, Probability and Computing, 24(1), pp.1-53.

[^50]: Icard, Thomas F., "Calibrating generative models: The probabilistic Chomsky–Schützenberger hierarchy", _Journal of Mathematical Psychology_ 95 (2020): 102308.

[^51]: Etessami, K. and Yannakakis, M., "Recursive Markov chains, stochastic grammars, and monotone systems of nonlinear equations", _Journal of the ACM_ 56(1), pp.1-66, 2009.

[^52]: Goyal, V. and Sigman, K., 2012. On simulating a class of Bernstein polynomials. ACM Transactions on Modeling and Computer Simulation (TOMACS), 22(2), pp.1-5.

[^53]: Esparza, J., Kučera, A. and Mayr, R., 2004, July. Model checking probabilistic pushdown automata. In _Proceedings of the 19th Annual IEEE Symposium on Logic in Computer Science_, 2004. (pp. 12-21). IEEE.

[^54]: Elder, Murray, Geoffrey Lee, and Andrew Rechnitzer. "Permutations generated by a depth 2 stack and an infinite stack in series are algebraic." _Electronic Journal of Combinatorics_ 22(1), 2015.

[^55]: Vatan, F., "Distribution functions of probabilistic automata", in _Proceedings of the thirty-third annual ACM symposium on Theory of computing (STOC '01)_, pp. 684-693, 2001.

[^56]: Kindler, Guy and D. Romik, "On distributions computable by random walks on graphs," _SIAM Journal on Discrete Mathematics_ 17 (2004): 624-633.

[^57]: Vatan (2001) claims that a finite-state generator has a continuous `CDF` (unless it produces a single value with probability 1), but this is not necessarily true if the generator has a state that outputs 0 forever.

[^58]: Adamczewski, B., Cassaigne, J. and Le Gonidec, M., 2020. On the computational complexity of algebraic numbers: the Hartmanis–Stearns problem revisited. Transactions of the American Mathematical Society, 373(5), pp.3085-3115.

[^59]: Cobham, A., "On the Hartmanis-Stearns problem for a class of tag machines", in _IEEE Conference Record of 1968 Ninth Annual Symposium on Switching and Automata Theory_ 1968.

[^60]: Adamczewski, B., Bugeaud, Y., "On the complexity of algebraic numbers I. Expansions in integer bases", _Annals of Mathematics_ 165 (2007).

[^61]: Richman, F. (2012). Algebraic functions, calculus style. Communications in Algebra, 40(7), 2671-2683.

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Ratio_of_Uniforms></a>
### Ratio of Uniforms

The Cauchy sampler given earlier demonstrates the _ratio-of-uniforms_ technique for sampling a distribution (Kinderman and Monahan 1977\)[^39].  It involves transforming the distribution's probability density function (PDF) into a compact shape.  The ratio-of-uniforms method appears here in the appendix, particularly since it can involve calculating upper and lower bounds of transcendental functions which, while it's possible to achieve in rational arithmetic (Daumas et al., 2007\)[^40], is less elegant than, say, the normal distribution sampler by Karney (2014\)[^41], which doesn't require calculating logarithms or other transcendental functions.

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
    2. Run the **UniformDivide** algorithm (described in the article on PSRNs) on _p1_ and _p2_, in that order.
    3. If the transformed PDF is symmetric about the _v_-axis, set the resulting PSRN's sign to positive or negative with equal probability.  Otherwise, set the PSRN's sign to positive.
    4. Return the PSRN.
6. If **InShape** as described in step 4 returns _NO_, then go to step 2.
7. Multiply _S_ by _base_, then add 1 to _d_, then go to step 3.

> **Note:** The ratio-of-uniforms shape is convex if and only if &minus;1/sqrt(_PDF_(_x_)) is a concave function (loosely speaking, its "slope" never increases) (Leydold 2000)[^42].
>
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
3. If the shape is given as an inequality of the form _f_(_t1_, ..., _tN_) &le; 0, where _f_ is a continuous function of one or more variables, **InShape**'s calculations should involve _rational intervals_, or objects that describe a number that's bounded by two rational numbers with numerators and denominators of arbitrary size.  (See also (Duff 1992)[^43] Daumas et al. (2007\)[^40] give one implementation of rational intervals.) Then, **InShape** should build one interval for each dimension of the box and evaluate _f_ using those intervals[^44] with an accuracy that increases as _S_ increases.  Then, **InShape** can return&mdash;
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

The following algorithm takes a uniform partially-sampled random number (PSRN) as a "coin" and flips that "coin" using **SampleGeometricBag** (a method described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html)).  Given that "coin" and a function _f_ as described below, the algorithm returns 1 with probability _f_(_U_), where _U_ is the number built up by the uniform PSRN (see also (Brassard et al., 2019\)[^45], (Devroye 1986, p. 769\)[^23], (Devroye and Gravel 2020\)[^46].  In the algorithm:

-  The uniform PSRN's sign must be positive and its integer part must be 0.
- For correctness, _f_(_U_) must meet the following conditions:
    - If the algorithm will be run multiple times with the same PSRN, _f_(_U_) must be the constant 0 or 1, or be continuous and polynomially bounded on the open interval (0, 1) (polynomially bounded means that both _f_(_U_) and 1&minus;_f_(_U_) are greater than or equal to min(_U_<sup>_n_</sup>, (1&minus;_U_)<sup>_n_</sup>) for some integer _n_ (Keane and O'Brien 1994\)[^47]).
    - Otherwise, _f_(_U_) must map the interval \[0, 1] to \[0, 1] and be continuous everywhere or "almost everywhere".

    The first set of conditions is the same as those for the Bernoulli factory problem (see "[**About Bernoulli Factories**](https://peteroupc.github.io/bernoulli.html#About_Bernoulli_Factories)) and ensure this algorithm is unbiased (see also Łatuszyński et al. 2009/2011\)[^1].

The algorithm follows.

1. Set _v_ to 0 and _k_ to 1.
2. (_v_ acts as a uniform random variate greater than 0 and less than 1 to compare with _f_(_U_).) Set _v_ to _b_ * _v_ + _d_, where _b_ is the base (or radix) of the uniform PSRN's digits, and _d_ is a digit chosen uniformly at random.
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

<a id=Proof_of_the_General_Martingale_Algorithm></a>
### Proof of the General Martingale Algorithm

This proof of the **general martingale algorithm** is similar to the proof for certain alternating series with only nonzero coefficients, given in Łatuszyński et al. (2019/2011)[^1], section 3.1.  Suppose we repeatedly flip a coin that shows heads with probability $g(\lambda)$ and we get the following results: $X_1, X_2, ...$, where each result is either 1 if the coin shows heads or 0 otherwise.  Then define two sequences _U_ and _L_ as follows:

- $U_0=d_0$ and $L_0=0$.
- For each $n>0$, $U_n$ is $L_{n-1} + |a_n|\times X_1\times...\times X_n$ if $a_n > 0$, otherwise $U_{n-1} - |a_n|\times X_1\times...\times X_n$ if no nonzero coefficients follow $a_n$ and $a_n < 0$, otherwise $U_{n-1}$.
- For each $n>0$, $L_n$ is $U_{n-1} - |a_n|\times X_1\times...\times X_n$ if $a_n < 0$, otherwise $L_{n-1} + |a_n|\times X_1\times...\times X_n$ if no nonzero coefficients follow $a_n$ and $a_n > 0$, otherwise $L_{n-1}$.

Then it's clear that with probability 1, for every $n\ge 1$&mdash;

- $L_n \le U_n$,
- $U_n$ is 0 or greater and $L_n$ is 1 or less, and
- $L_{n-1} \le L_n$ and $U_{n-1} \ge U_n$.

Moreover, if there are infinitely many nonzero coefficients, the _U_ and _L_ sequences have expected values ("long-run averages") converging to $f(\lambda)$ with probability 1; otherwise $f(\lambda)$ is a polynomial in $g(\lambda)$, and $U_n$ and $L_n$ have expected values that approach $f(\lambda)$ as $n$ gets large.  These conditions are required for the paper's Algorithm 3 (and thus the **general martingale algorithm**) to be valid.

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
   # eps must be greater than 0 and less than 1.
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

Derivation:  Write&mdash; $$f(\lambda) = \sin(\lambda \pi/2) = 1-g(1-\lambda),$$ where&mdash; $$g(\mu) = 1-\sin((1-\mu) \pi/2)$$ $$= \sum_{n\ge 0} \frac{(\mu\pi/2)^{4n+2}}{(4n+2)!} - \frac{(\mu\pi/2)^{4n+4}}{(4n+4)!}$$ $$= \sum_{n\ge 0} w_n(\mu) = \sum_{n\ge 0} w_n(1) \frac{w_n(\mu)}{w_n(1)}.$$

This is a [**convex combination**](https://peteroupc.github.io/bernoulli.html#Convex_Combinations) of $w_n(1)$ and $\frac{w_n(\mu)}{w_n(1)}$ &mdash; to simulate $g(\mu)$, first an integer _n_ is chosen with probability $w_n(1)$ and then a coin that shows heads with probability $\frac{w_n(\mu)}{w_n(1)}$ is flipped.  Finally, to simulate $f(\lambda)$, the input coin is "inverted" ($\mu = 1-\lambda$), $g(\mu)$ is simulated using the "inverted" coin, and 1 minus the simulation result is returned.

As given above, each term $w_n(\mu)$ is a polynomial in $\mu$, and is strictly increasing and equals 1 or less everywhere on the interval $[0, 1]$, and $w_n(1)$ is a constant so that $\frac{w_n(\mu)}{w_n(1)}$ remains a polynomial.  Each polynomial $\frac{w_n(\mu)}{w_n(1)}$ can be transformed into a polynomial in Bernstein form with the following coefficients: $$(0, 0, ..., 0, 8/(v-\pi^2), 8(4n+3)/(v-\pi^2), 1),$$ where the polynomial is of degree $4n+4$ and so has $4n+5$ coefficients, and $v = \frac{((4n+4)!)\times 2^{4n+4}}{((4n+2)!)\times 2^{4n+2}} = 16 (n+1) (4n+3)$.  These are the coefficients used in steps 4 through 7 of the algorithm above.

> **Note:** sin(_&lambda;_\*_&pi;_/2) = cos((1&minus;_&lambda;_)\*_&pi;_/2).

<a id=Sampling_Distributions_Using_Incomplete_Information_Omitted_Algorithms></a>
### Sampling Distributions Using Incomplete Information: Omitted Algorithms

**Algorithm 2.** Suppose there is an _oracle_ that produces independent random real numbers whose expected value ("long-run average") is a known or unknown mean. The goal is now to produce nonnegative random variates whose expected value is the mean of _f_(_X_), where _X_ is a number produced by the oracle.  This is possible whenever&mdash;

- _f_ has a finite lower bound and a finite upper bound on its domain, and
- the mean of _f_(_X_) is not less than _&delta;_, where _&delta;_ is a known rational number greater than 0.

The algorithm to achieve this goal follows (see Lee et al. 2014\)[^48]\:

1. Let _m_ be a rational number equal to or greater than the maximum value of abs(_f_(_&mu;_)) anywhere.  Create a _&nu;_ input coin that does the following: "Take a number from the oracle, call it _x_.  With probability abs(_f_(_x_))/_m_, return a number that is 1 if _f_(_x_) < 0 and 0 otherwise.  Otherwise, repeat this process."
2. Use one of the [**linear Bernoulli factories**](https://peteroupc.github.io/bernoulli.html#lambda____x___y__linear_Bernoulli_factories) to simulate 2\*_&nu;_ (2 times the _&nu;_ coin's probability of heads), using the _&nu;_ input coin, with _&#x03F5;_ = _&delta;_/_m_.  If the factory returns 1, return 0.  Otherwise, take a number from the oracle, call it _&xi;_, and return abs(_f_(_&xi;_)).

> **Example:** An example from Lee et al. (2014\)[^48].  Say the oracle produces uniform random variates in [0, 3\*_&pi;_], and let _f_(_&nu;_) = sin(_&nu;_).  Then the mean of _f_(_X_) is 2/(3\*_&pi;_), which is greater than 0 and found in SymPy by `sympy.stats.E(sin(sympy.stats.Uniform('U',0,3*pi)))`, so the algorithm can produce nonnegative random variates whose expected value ("long-run average") is that mean.
>
> **Notes:**
>
> 1. Averaging to the mean of _f_(_X_) (that is, **E**\[_f_(_X_)] where **E**\[.] means expected or average value) is not the same as averaging to _f_(_&mu;_) where _&mu;_ is the mean of the oracle's numbers (that is, _f_(**E**\[_X_])).  For example, if _X_ is 0 or 1 with equal probability, and _f_(_&nu;_) = exp(&minus;_&nu;_), then **E**\[_f_(_X_)] = exp(0) + (exp(&minus;1) &minus; exp(0))\*(1/2), and _f_(**E**\[_X_]) = _f_(1/2) = exp(&minus;1/2).
> 2. (Lee et al. 2014, Corollary 4\)[^48]\: If _f_(_&mu;_) is known to return only values in the interval [_a_, _c_], the mean of _f_(_X_) is not less than _&delta;_, _&delta;_ > _b_, and _&delta;_ and _b_ are known numbers, then Algorithm 2 can be modified as follows:
>
>     - Use _f_(_&nu;_) = _f_(_&nu;_) &minus; _b_, and use _&delta;_ = _&delta;_ &minus; _b_.
>     - _m_ is taken as max(_b_&minus;_a_, _c_&minus;_b_).
>     - When Algorithm 2 finishes, add _b_ to its return value.
> 3. The check "With probability abs(_f_(_x_))/_m_" is exact if the oracle produces only rational numbers _and_ if _f_(_x_) outputs only rational numbers.  If the oracle or _f_ can produce irrational numbers (such as numbers that follow a beta distribution or another non-discrete distribution), then this check should be implemented using uniform [**partially-sampled random numbers (PSRNs)**](https://peteroupc.github.io/exporand.html).

**Algorithm 3.** Suppose there is an _oracle_ that produces independent random real numbers that are all greater than or equal to _a_ (which is a known rational number), whose mean (_&mu;_) is unknown.  The goal is to use the oracle to produce nonnegative random variates with mean _f_(_&mu;_).  This is possible only if _f_ is 0 or greater everywhere in the interval \[_a_, _&infin;_\) and is nowhere decreasing in that interval (Jacob and Thiery 2015\)[^18].  This can be done using the algorithm below.  In the algorithm:

- _f_(_&mu;_) must be a function that can be written as&mdash;<br>_c_[0]\*_z_<sup>0</sup> + _c_[1]\*_z_<sup>1</sup> + ...,<br>which is an infinite series where _z_ = _&mu;_&minus;_a_ and all _c_\[_i_\] are 0 or greater.
- _&psi;_ is a rational number close to 1, such as 95/100.  (The exact choice is arbitrary and can be less or greater for efficiency purposes, but must be greater than 0 and less than 1.)

The algorithm follows.

1. Set _ret_ to 0, _prod_ to 1, _k_ to 0, and _w_ to 1. (_w_ is the probability of generating _k_ or more random variates in a single run of the algorithm.)
2. If _k_ is greater than 0: Take a number from the oracle, call it _x_, and multiply _prod_ by _x_&minus;_a_.
3. Add _c_\[_k_\]\*_prod_/_w_ to _ret_.
4. Multiply _w_ by _&psi;_ and add 1 to _k_.
5. With probability _&psi;_, go to step 2.  Otherwise, return _ret_.

Now, assume the oracle's numbers are all less than or equal to _b_ (rather than greater than or equal to _a_), where _b_ is a known rational number.  Then _f_ must be 0 or greater everywhere in (&minus;_&infin;_, _b_\] and be nowhere increasing there (Jacob and Thiery 2015\)[^18], and the algorithm above can be used with the following modifications: (1) In the note on the infinite series, _z_ = _b_ &minus;_&mu;_; (2) in step 2, multiply _prod_ by _b_ &minus; _x_ rather than _x_ &minus; _a_.

> **Note:** This algorithm is exact if the oracle produces only rational numbers _and_ if all _c_\[_i_\] are rational numbers.  If the oracle can produce irrational numbers, then they should be implemented using uniform PSRNs.  See also note 3 on Algorithm 2.

<a id=Pushdown_Automata_and_Algebraic_Functions></a>
### Pushdown Automata and Algebraic Functions

This section has mathematical proofs showing which kinds of algebraic functions (functions that can be a solution of a nonzero polynomial equation) can be simulated with a pushdown automaton (a state machine with a stack).

The following summarizes what can be established about these algebraic functions:

- sqrt(_&lambda;_) can be simulated.
- Every rational function with rational coefficients that maps the open interval (0, 1) to itself can be simulated.
- If _f_(_&lambda;_) can be simulated, so can any Bernstein-form polynomial in the variable _f_(_&lambda;_) with coefficients that can be simulated.
- If _f_(_&lambda;_) and _g_(_&lambda;_) can be simulated, so can _f_(_&lambda;_)\*_g_(_&lambda;_), _f_(_g_(_&lambda;_)), and _g_(_f_(_&lambda;_)).
- If a full-domain pushdown automaton (defined later) can generate words of a given length with a given probability (a _probability distribution_ of word lengths), then the probability generating function for that distribution can be simulated, as well as for that distribution conditioned on a finite set or periodic infinite set of word lengths (for example, all odd word lengths only).
- If a stochastic context-free grammar (defined later) can generate a probability distribution of word lengths, and terminates with probability 1, then the probability generating function for that distribution can be simulated.
- Every quadratic irrational number between 0 and 1 can be simulated.

It is not yet known whether the following functions can be simulated:

- _&lambda;_<sup>1/_p_</sup> for prime numbers _p_ greater than 2. The answer may be no; Banderier and Drmota (2015)[^49] proved results that show, among other things, that $\lambda^{1/p}$, where $p$ is not a power of 2, is not a possible solution to $P(\lambda) = 0$, where $P(\lambda)$ is a polynomial whose coefficients are non-negative real numbers.
- min(_&lambda;_, 1&minus;_&lambda;_).

--------------------------------

The following definitions are used in this section:

1. A _pushdown automaton_ has a finite set of _states_ and a finite set of _stack symbols_, one of which is called EMPTY, and takes a coin that shows heads with an unknown probability. It starts at a given state and its stack starts with EMPTY.  On each iteration:
    - The automaton flips the coin.
    - Based on the coin flip (HEADS or TAILS), the current state, and the top stack symbol, it moves to a new state (or keeps it unchanged) and replaces the top stack symbol with zero, one or two symbols.  Thus, there are three kinds of _transition rules_:
         - (_state_, _flip_, _symbol_) &rarr; (_state2_, {_symbol2_}): move to _state2_, replace top stack symbol with same or different one.
         - (_state_, _flip_, _symbol_) &rarr; (_state2_, {_symbol2_, _new_}): move to _state2_, replace top stack symbol with _symbol2_, then _push_ a new symbol (_new_) onto the stack.
         - (_state_, _flip_, _symbol_) &rarr; (_state2_, {}): move to _state2_, _pop_ the top symbol from the stack.

    When the stack is empty, the machine stops, and returns either 0 or 1 depending on the state it ends up at.  (Because each left-hand side has no more than one possible transition, the automaton is _deterministic_.)

2. A _full-domain pushdown automaton_ means a pushdown automaton that terminates with probability 1 given a coin with probability of heads _&lambda;_, for every _&lambda;_ greater than 0 and less than 1.
3. **PDA** is the class of functions that map the open interval (0, 1) to itself and can be simulated by a full-domain pushdown automaton.  **PDA** also includes the constant functions 0 and 1.
4. **ALGRAT** is the class of functions that map the open interval (0, 1) to itself, are continuous, and are algebraic over the rational numbers (they satisfy a nonzero polynomial system whose coefficients are rational numbers). **ALGRAT** also includes the constant functions 0 and 1.
5. A _probability generating function_ has the form _p_<sub>0</sub>\*_&lambda;_<sup>0</sup> + _p_<sub>1</sub>\*_&lambda;_<sup>1</sup> + ..., where _p_<sub>_i_</sub> (a _coefficient_) is the probability of getting _i_.

> **Notes:**
>
> 1. Mossel and Peres (2005\)[^15] defined pushdown automata to start with a non-empty stack of _arbitrary_ size, and to allow each rule to replace the top symbol with an _arbitrary_ number of symbols.  Both cases can be reduced to the definition in this section.
> 2. Pushdown automata, as defined here, are very similar to so-called _probabilistic right-linear indexed grammars_ (Icard 2020\)[^50] and can be translated to those grammars as well as to _probabilistic pushdown systems_ (Etessami and Yannakakis 2009\)[^51], as long as those grammars and systems use only transition probabilities that are rational numbers.

**Proposition 0** (Mossel and Peres 2005[^50], Theorem 1.2): _A full-domain pushdown automaton can simulate a function that maps (0, 1) to itself only if the function is in class **ALGRAT**._

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

$${n\choose 0}f(\lambda)^0 (1-f(\lambda))^{n-0} a[0] + {n\choose 1}f(\lambda)^1 (1-f(\lambda))^{n-1} a[1] + ... + {n\choose n}f(\lambda)^n (1-f(\lambda))^{n-n} a[n],$$

_where n is the polynomial's degree and a\[0], a\[1], ..., a\[n] are functions in the class **PDA**._

_Proof Sketch_: This corresponds to a two-stage pushdown automaton that follows the algorithm of Goyal and Sigman (2012\)[^52]\: The first stage counts the number of "heads" shown when flipping the f(&lambda;) coin, and the second stage flips another coin that has success probability _a_\[_i_\], where _i_ is the number of "heads". The automaton's transitions take advantage of Lemma 1A.  &#x25a1;

**Proposition 1:** _If f(&lambda;) and g(&lambda;) are functions in the class **PDA**, then so is their product, namely f(&lambda;)\*g(&lambda;)._

_Proof:_ Special case of Proposition 1A with _n_=1, _f_(_&lambda;_)=_f_(_&lambda;_), _a_\[0]=0 (using Lemma 1B), and _a_\[1]=_g_(_&lambda;_).  &#x25a1;

**Corollary 1A:** _If f(&lambda;), g(&lambda;), and h(&lambda;) are functions in the class **PDA**, then so is f(&lambda;)\*g(&lambda;) + (1&minus;f(&lambda;))\*h(&lambda;)._

_Proof:_ Special case of Proposition 1A with _n_=1, _f_(_&lambda;_)=_f_(_&lambda;_), _a_\[0]=_h_(_&lambda;_), and _a_\[1]=_g_(_&lambda;_).  &#x25a1;

**Proposition 2:** _If f(&lambda;) and g(&lambda;) are functions in the class **PDA**, then so is their composition, namely f(g(&lambda;)) or f&#x2218;g(&lambda;)._

_Proof:_ Let _F_ be the full-domain pushdown automaton for _f_. For each state/symbol pair among the left-hand sides of _F_'s rules, apply Lemma 1A to the automaton _F_, using the function _g_.  Then the new machine _F_ terminates with probability 1 because the original _F_ and the original automaton for _g_ do for every _&lambda;_ greater than 0 and less than 1, and because the automaton for _g_ maps to (0, 1) where _F_ terminates with probability 1.  Moreover, _f_ is in class **PDA** by Theorem 1.2 of (Mossel and Peres 2005\)[^15] because the machine is a full-domain pushdown automaton.  &#x25a1;

**Proposition 3:** _Every rational function with rational coefficients that maps (0, 1) to itself is in class **PDA**._

_Proof:_ These functions can be simulated by a finite-state machine (Mossel and Peres 2005\)[^15].  This corresponds to a full-domain pushdown automaton that has no stack symbols other than EMPTY, never pushes symbols onto the stack, and pops the only symbol EMPTY from the stack whenever it transitions to a final state of the finite-state machine. &#x25a1;

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

Then if the stack is empty upon reaching the FAILURE state, the result is 0, and if the stack is empty upon reaching any other state, the result is 1.  By (Dughmi et al. 2021\)[^5], the machine now simulates the distribution's probability generating function.  Moreover, the function is in class **PDA** by Theorem 1.2 of (Mossel and Peres 2005\)[^15] because the machine is a full-domain pushdown automaton.  &#x25a1;

Define a _stochastic context-free grammar_ as follows.  The grammar consists of a finite set of _nonterminals_ and a finite set of _letters_, and rewrites one nonterminal (the starting nonterminal) into a word.  The grammar has three kinds of rules (in generalized Chomsky Normal Form (Etessami and Yannakakis 2009\)[^51]):

- _X_ &rarr; _a_ (rewrite _X_ to the letter _a_).
- _X_ &rarr;<sub>_p_</sub> (_a_, _Y_) (with rational probability _p_, rewrite _X_ to the letter _a_ followed by the nonterminal _Y_).  For the same left-hand side, all the _p_ must sum to 1.
- _X_ &rarr; (_Y_, _Z_) (rewrite _X_ to the nonterminals _Y_ and _Z_ in that order).

Instead of a letter (such as _a_), a rule can use _&epsilon;_ (the empty string). (The grammar is _context-free_ because the left-hand side has only a single nonterminal, so that no context from the word is needed to parse it.)

**Proposition 5:** _Every stochastic context-free grammar can be transformed into a pushdown automaton.  If the automaton is a full-domain pushdown automaton and the grammar has a one-letter alphabet, the automaton can generate words such that the length of each word follows the same distribution as the grammar, and that distribution's probability generating function is in class **PDA**._

_Proof Sketch:_ In the equivalent pushdown automaton:

- _X_ &rarr; _a_ becomes the two rules&mdash;<br>(START, HEADS, _X_) &rarr; (_letter_, {}), and<br>(START, TAILS, _X_) &rarr; (_letter_, {}).<br>Here, _letter_ is either START or a unique state in _F_ that "detours" to a letter-generating operation for _a_ and sets the state back to START when finished (see Proposition 4).  If _a_ is _&epsilon;_, _letter_ is START and no letter-generating operation is done.
- _X_ &rarr;<sub>_p_<sub>_i_</sub></sub> (_a_<sub>_i_</sub>, _Y_<sub>_i_</sub>) (all rules with the same nonterminal _X_) are rewritten to enough rules to transition to a letter-generating operation for _a_<sub>_i_</sub>, and swap the top stack symbol with _Y_<sub>_i_</sub>, with probability _p_<sub>_i_</sub>, which is possible with just a finite-state machine (see Proposition 4) because all the probabilities are rational numbers (Mossel and Peres 2005\)[^15].  If _a_<sub>_i_</sub> is _&epsilon;_, no letter-generating operation is done.
- _X_ &rarr; (_Y_, _Z_) becomes the two rules&mdash;<br>(START, HEADS, _X_) &rarr; (START, {_Z_, _Y_}), and<br>(START, TAILS, _X_) &rarr; (START, {_Z_, _Y_}).

Here, _X_ is the stack symbol EMPTY if _X_ is the grammar's starting nonterminal. Now, assuming the automaton is full-domain, the rest of the result follows easily.   For a single-letter alphabet, the grammar corresponds to a system of polynomial equations, one for each rule in the grammar, as follows:

- _X_ &rarr; _a_ becomes _X_ = 1 if _a_ is the empty string (_&epsilon;_), or _X_ =  _&lambda;_ otherwise.
- For each nonterminal _X_, all _n_ rules of the form _X_ &rarr;<sub>_p_<sub>_i_</sub></sub> (_a_<sub>_i_</sub>, _Y_<sub>_i_</sub>) become the equation _X_ = _p_<sub>1</sub>\*_&lambda;_<sub>1</sub>\*_Y_<sub>1</sub> + _p_<sub>2</sub>\*_&lambda;_<sub>2</sub>\*_Y_<sub>2</sub> + ... + _p_<sub>_n_</sub>\*_&lambda;_<sub>_n_</sub>\*_Y_<sub>_n_</sub>, where _&lambda;_<sub>_i_</sub> is either 1 if _a_<sub>_i_</sub> is _&epsilon;_, or _&lambda;_ otherwise.
- _X_ &rarr; (_Y_, _Z_) becomes _X_ = _Y_\*_Z_.

Solving this system for the grammar's starting nonterminal, and applying Proposition 4, leads to the _probability generating function_ for the grammar's word distribution.  (See also Flajolet et al. 2010[^14], Icard 2020[^50].) &#x25a1;

> **Example:** The stochastic context-free grammar&mdash;<br>_X_ &rarr;<sub>1/2</sub> (_a_, _X1_),<br>_X1_ &rarr; (_X_, _X2_),<br>_X2_ &rarr; (_X_, _X_),<br>_X_ &rarr;<sub>1/2</sub> (_a_, _X3_),<br>_X3_ &rarr; _&epsilon;_,<br>which encodes ternary trees (Flajolet et al. 2010\)[^14], corresponds to the equation _X_ = (1/2) \* _&lambda;_\*_X_\*_X_\*_X_ + (1/2)\*_&lambda;_\*1, and solving this equation for _X_ leads to the probability generating function for such trees, which is a complicated expression.
>
> **Notes:**
>
> 1. A stochastic context-free grammar in which all the probabilities are 1/2 is called a _binary stochastic grammar_ (Flajolet et al. 2010[^14]).  If every probability is a multiple of 1/_n_, then the grammar can be called an "_n_-ary stochastic grammar".  It is even possible for a nonterminal to have two rules of probability _&lambda;_ and (1&minus; _&lambda;_), which are used when the input coin returns 1 (HEADS) or 0 (TAILS), respectively.
>
> 2. If a pushdown automaton simulates the function _f_(_&lambda;_), then _f_ corresponds to a special system of equations, built as follows (Mossel and Peres 2005\)[^15]; see also (Esparza et al. 2004\)[^53].  For each state of the automaton (call the state _en_), include the following equations in the system based on the automaton's transition rules:
>
>     - (_st_, _p_, _sy_) &rarr; (_s2_, {}) becomes either _&alpha;_<sub>_st_,_sy_,_en_</sub> = _p_ if _s2_ is _en_, or _&alpha;_<sub>_st_,_sy_,_en_</sub> = 0 otherwise.
>     - (_st_, _p_, _sy_) &rarr; (_s2_, {_sy1_}) becomes _&alpha;_<sub>_st_,_sy_,_en_</sub> = _p_ \* _&alpha;_<sub>_s2_,_sy1_,_en_</sub>.
>     - (_st_, _p_, _sy_) &rarr; (_s2_, {_sy1_, _sy2_}) becomes _&alpha;_<sub>_st_,_sy_,_en_</sub> = _p_\*_&alpha;_<sub>_s2_,_sy2_,_&sigma;[1]_</sub>\*_&alpha;_<sub>_&sigma;[1]_,_sy1_,_en_</sub> + ... + _p_\*_&alpha;_<sub>_s2_,_sy2_,_&sigma;[n]_</sub>\*_&alpha;_<sub>_&sigma;[n]_,_sy1_,_en_</sub>, where _&sigma;[i]_ is one of the machine's _n_ states.
>
>     (Here, _p_ is the probability of using the given transition rule; the special value HEADS becomes _&lambda;_, and the special value TAILS becomes 1&minus;_&lambda;_.)  Now, each time multiple equations have the same left-hand side, combine them into one equation with the same left-hand side, but with the sum of their right-hand sides.  Then, for every variable of the form _&alpha;_<sub>_a_,_b_,_c_</sub> not yet present in the system, include the equation _&alpha;_<sub>_a_,_b_,_c_</sub> = 0.  Then, for each final state _fs_ that returns 1, solve the system for the variable _&alpha;_<sub>START,EMPTY,_fs_</sub> (where START is the automaton's starting state) to get a solution (a function) that maps (0, 1) to itself. (Each solve can produce multiple solutions, but only one of them will map (0, 1) to itself assuming every _p_ is either HEADS or TAILS.) Finally, add all the solutions to get _f_(_&lambda;_).
>
> 3. Assume there is a pushdown automaton (_F_) that follows Definition 1 except it uses a set of _N_ input letters (and not simply HEADS or TAILS), accepts an input word if the stack is empty, and rejects the word if the machine reaches a configuration without a transition rule.  Then a pushdown automaton in the full sense of Definition 1 (_G_) can be built.  In essence:
>     1. Add a new FAILURE state, which when reached, pops all symbols from the stack.
>     2. For each pair (_state_, _stacksymbol_) for _F_, add a set of rules that generate one of the input letters (each letter _i_ generated with probability _f_<sub> _i_</sub>(_&lambda;_), which must be a function in **PDA**), then use the generated letter to perform the transition stated in the corresponding rule for _F_.  If there is no such transition, transition to the FAILURE state instead.
>     3. When the stack is empty, output 0 if _G_ is in the FAILURE state, or 1 otherwise.
>
>     Then _G_ returns 1 with the same probability as _F_ accepts an input word with letters randomly generated as in the second step.  Also, one of the _N_ letters can be a so-called "end-of-string" symbol, so that a pushdown automaton can be built that accepts "empty strings"; an example is (Elder et al. 2015\)[^54].

**Proposition 6:** _If a full-domain pushdown automaton can generate a distribution of words with the same letter, there is a full-domain pushdown automaton that can generate a distribution of such words conditioned on&mdash;_

1. _a finite set of word lengths, or_
2. _a periodic infinite set of word lengths._

One example of a finite set of word lengths is {1, 3, 5, 6}, where only words of length 1, 3, 5, or 6 are allowed.  A _periodic infinite set_ is defined by a finite set of integers such as {1}, as well as an integer modulus such as 2, so that in this example, all integers congruent to 1 modulo 2 (that is, all odd integers) are allowed word lengths and belong to the set.

_Proof Sketch:_

1. As in Lemma 1A, assume that the automaton stops when it pops EMPTY from the stack.  Let _S_ be the finite set (for example, {1, 3, 5, 6}), and let _M_ be the maximum value in the finite set.  For each integer _i_ in \[0, _M_\], make a copy of the automaton and append the integer _i_ to the name of each of its states.  Combine the copies into a new automaton _F_, and let its start state be the start state for copy 0.  Now, whenever _F_ generates a letter, instead of transitioning to the next state after the letter-generating operation (see Proposition 4), transition to the corresponding state for the next copy (for example, if the operation would transition to copy 2's version of "XYZ", namely "2\_XYZ", transition to "3\_XYZ" instead), or if the last copy is reached, transition to the last copy's FAILURE state.  If _F_ would transition to a failure state corresponding to a copy not in _S_ (for example, "0\_FAILURE", "2\_FAILURE", "3\_FAILURE" in this example), first all symbols other than EMPTY are popped from the stack and then _F_ transitions to its start state (this is a so-called "rejection" operation).  Now, all the final states (except FAILURE states) for the copies corresponding to the values in _S_ (for example, copies 1, 3, 5, 6 in the example) are treated as returning 1, and all other states are treated as returning 0.

2. Follow (1), except as follows: (A) _M_ is equal to the integer modulus minus 1.  (B) For the last copy of the automaton, instead of transitioning to the next state after the letter-generating operation (see Proposition 4), transition to the corresponding state for copy 0 of the automaton.  &#x25a1;

**Proposition 7:** _Every constant function equal to a quadratic irrational number between 0 and 1 is in class **PDA**._

A _continued fraction_ is one way to write a real number.  For purposes of the following proof, every real number greater than 0 and less than 1 has the following _continued fraction expansion_: 0 + 1 / (_a_[1] + 1 / (_a_[2] + 1 / (_a_[3] + ... ))), where each _a_\[_i_\], a _partial denominator_, is an integer greater than 0.  A _quadratic irrational number_ is an irrational number that can be written as (_b_+sqrt(_c_))/_d_, where _b_, _c_, and _d_ are rational numbers.

_Proof:_  By Lagrange's continued fraction theorem, every quadratic irrational number has a continued fraction expansion that is eventually periodic; the expansion can be described using a finite number of partial denominators, the last "few" of which repeat forever.  The following example describes a periodic continued fraction expansion: \[0; 1, 2, (5, 4, 3)\], which is the same as \[0; 1, 2, 5, 4, 3, 5, 4, 3, 5, 4, 3, ...\].  In this example, the partial denominators are the numbers after the semicolon; the size of the period (`(5, 4, 3)`) is 3; and the size of the non-period (`1, 2`) is 2.

Given a periodic expansion, and with the aid of an algorithm for simulating [**continued fractions**](https://peteroupc.github.io/bernoulli.html#Continued_Fractions), a recursive Markov chain for the expansion (Etessami and Yannakakis 2009\)[^51] can be described as follows.  The chain's components are all built on the following template.  The template component has one entry E, one inner node N, one box, and two exits X0 and X1.  The box has one _call port_ as well as two _return ports_ B0 and B1.

- From E: Go to N with probability _x_, or to the box's call port with probability 1 &minus; _x_.
- From N: Go to X1 with probability _y_, or to X0 with probability 1 &minus; _y_.
- From B0: Go to E with probability 1.
- From B1: Go to X0 with probability 1.

Let _p_ be the period size, and let _n_ be the non-period size.  Now the recursive Markov chain to be built has _n_+_p_ components:

- For each _i_ in \[1, _n_+1\], there is a component labeled _i_.  It is the same as the template component, except _x_ = _a_\[_i_\]/(1 + _a_\[_i_\]), and _y_ = 1/_a_\[_i_\].  The component's single box goes to the component labeled _i_+1, _except_ that for component _n_+_p_, the component's single box goes to the component labeled _n_+1.

According to Etessami and Yannakakis (2009\)[^51], the recursive Markov chain can be translated to a pushdown automaton of the kind used in this section. Now all that's left is to argue that the recursive Markov chain terminates with probability 1.  For every component in the chain, it goes from its entry to its box with probability 1/2 or less (because each partial numerator must be 1 or greater).  Thus, the component recurses with no greater probability than not, and there are otherwise no probability-1 loops in each component, so the overall chain terminates with probability 1. &#x25a1;

**Lemma 1:** _The square root function sqrt(&lambda;) is in class **PDA**._

_Proof:_ See (Mossel and Peres 2005\)[^15]. &#x25a1;

**Corollary 1:** _The function f(&lambda;) = &lambda;<sup>m/(2<sup>n</sup>)</sup>, where n &ge; 1 is an integer and where m &ge; 1 is an integer, is in class **PDA**._

_Proof:_ Start with the case _m_=1.  If _n_ is 1, write _f_ as sqrt(_&lambda;_); if _n_ is 2, write _f_ as sqrt&#x2218;sqrt(_&lambda;_); and for general _n_, write _f_ as sqrt&#x2218;sqrt&#x2218;...&#x2218;sqrt(_&lambda;_), with _n_ instances of sqrt.  Because this is a composition and sqrt can be simulated by a full-domain pushdown automaton, so can _f_.

For general _m_ and _n_, write _f_ as (sqrt&#x2218;sqrt&#x2218;...&#x2218;sqrt(_&lambda;_))<sup>_m_</sup>, with _n_ instances of sqrt.  This involves doing _m_ multiplications of sqrt&#x2218;sqrt&#x2218;...&#x2218;sqrt, and because this is an integer power of a function that can be simulated by a full-domain pushdown automaton, so can _f_.

Moreover, _f_ is in class **PDA** by Theorem 1.2 of (Mossel and Peres 2005\)[^15] because the machine is a full-domain pushdown automaton. &#x25a1;

<a id=Finite_State_and_Pushdown_Generators></a>
#### Finite-State and Pushdown Generators

Another interesting class of machines (called _pushdown generators_ here) are similar to pushdown automata (see above), with the following exceptions:

1. Each transition rule can also, optionally, output a base-_N_ digit in its right-hand side.  An example is: (_state_, _flip_, _sy_) &rarr; (_digit_, _state2_, {_sy2_}).
2. The machine must output infinitely many digits if allowed to run forever.
3. Rules that would pop the last symbol from the stack are not allowed.

The "output" of the machine is now a real number _X_ in the form of the base-_N_ digit expansion `0.dddddd...`, where `dddddd...` are the digits produced by the machine from left to right.  In the rest of this section:

- `CDF(z)` is the cumulative distribution function of _X_, or the probability that _X_ is _z_ or less.
- `PDF(z)` is the probability density function of _X_, or the "slope" function of `CDF(z)`, or the relative probability of choosing a number "close" to _z_ at random.

A _finite-state generator_ (Knuth and Yao 1976\)[^6] is the special case where the probability of heads is 1/2, each digit is either 0 or 1, rules can't push stack symbols, and only one stack symbol is used.  Then if `PDF(z)` has infinitely many "slope" functions on the open interval (0, 1), it must be a polynomial with rational coefficients and not equal 0 at any irrational point on (0, 1) (Vatan 2001\)[^55], (Kindler and Romik 2004\)[^56], and it can be shown that the mean of _X_ must be a rational number.  [^57]

**Proposition 8.** _Suppose a finite-state generator can generate a probability distribution that takes on finitely many values.  Then:_

1. _Each value occurs with a rational probability._
2. _Each value is either rational or transcendental._

A real number is _transcendental_ if it can't be a root of a nonzero polynomial with integer coefficients.  Thus, part 2 means, for example, that irrational, non-transcendental numbers such as 1/sqrt(2) and the golden ratio minus 1 can't be generated exactly.

Proving this proposition involves the following lemma, which shows that a finite-state generator is related to a machine with a one-way read-only input and a one-way write-only output:

**Lemma 2.** _A finite-state generator can fit the model of a one-way transducer-like k-machine (as defined in Adamczewski et al. (2020\)[^58] section 5.3), for some k equal to 2 or greater._

_Proof Sketch:_ There are two cases.

Case 1: If every transition rule of the generator outputs a digit, then _k_ is the number of unique inputs among the generator's transition rules (usually, there are two unique inputs, namely HEADS and TAILS), and the model of a finite-state generator is modified as follows:

1. A _configuration_ of the finite-state generator consists of its current state together with either the last coin flip result or, if the coin wasn't flipped yet, the empty string.
2. The _output function_ takes a configuration described above and returns a digit.  If the coin wasn't flipped yet, the function returns an arbitrary digit (which is not used in proposition 4.6 of the Adamczewski paper).

Case 2: If at least one transition rule does not output a digit, then the finite-state generator can be transformed to a machine where HEADS/TAILS is replaced with 50% probabilities, then transformed to an equivalent machine whose rules always output one or more digits, as claimed in Lemma 5.2 of Vatan (2001\)[^55].  In case the resulting generator has rules that output more than one digit, additional states and rules can be added so that the generator's rules output only one digit as desired.  Now at this point the generator's probabilities will be rational numbers. Now transform the generator from probabilities to inputs of size _k_, where _k_ is the product of those probabilities, by adding additional rules as desired.  &#x25a1;

_Proof of Proposition 8:_ Let _n_ be an integer greater than 0. Take a finite-state generator that starts at state START and branches to one of _n_ finite-state generators (sub-generators) with some probability, which must be rational because the overall generator is a finite-state machine (Icard 2020, Proposition 13\)[^50].  The branching process outputs no digit, and part 3 of the proposition follows from Corollary 9 of Icard (2020\)[^50].  The _n_ sub-generators are special; each of them generates the binary expansion of a single real number in [0, 1] with probability 1.

To prove part 2 of the proposition, translate an arbitrary finite-state generator to a machine described in Lemma 2.  Once that is done, all that must be shown is that there are two different non-empty sequences of coin flips that end up at the same configuration. This is easy using the pigeonhole principle, since the finite-state generator has a finite number of configurations. Thus, by propositions 5.11, 4.6, and AB of Adamczewski et al. (2020\)[^58], the generator can generate a real number's binary expansion only if that number is rational or transcendental (see also Cobham (1968\)[^59]; Adamczewski and Bugeaud (2007\)[^60]).</s>  &#x25a1;

**Proposition 9.** _If the distribution function generated by a finite-state generator is continuous and algebraic on the open interval (0, 1), then that function is a piecewise polynomial function on that interval._

The proof follows from combining Kindler and Romik (2004, Theorem 2\)[^56] and Knuth and Yao (1976\)[^6] with Richman (2012\)[^61], who proved that a continuous algebraic function on an open interval is piecewise analytic ("analytic" is a stronger statement than having infinitely many "slope" functions).

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
