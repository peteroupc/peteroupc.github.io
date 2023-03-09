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
- [**Acknowledgments**](#Acknowledgments)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Ratio of Uniforms**](#Ratio_of_Uniforms)
    - [**Probability Transformations**](#Probability_Transformations)
    - [**Proof of the General Martingale Algorithm**](#Proof_of_the_General_Martingale_Algorithm)
    - [**SymPy Code for Piecewise Linear Factory Functions**](#SymPy_Code_for_Piecewise_Linear_Factory_Functions)
    - [**Algorithm for sin(_&lambda;_\*_&pi;_/2)**](#Algorithm_for_sin___lambda_____pi___2)
    - [**Pushdown Automata and Algebraic Functions**](#Pushdown_Automata_and_Algebraic_Functions)
    - [**Sampling Distributions Using Incomplete Information: Omitted Algorithms**](#Sampling_Distributions_Using_Incomplete_Information_Omitted_Algorithms)
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

[^21]: Kinderman, A.J., Monahan, J.F., "Computer generation of random variables using the ratio of uniform deviates", _ACM Transactions on Mathematical Software_ 3(3), pp. 257-260, 1977.

[^22]: Daumas, M., Lester, D., Muñoz, C., "[**Verified Real Number Calculations: A Library for Interval Arithmetic**](https://arxiv.org/abs/0708.3721)", arXiv:0708.3721 [cs.MS], 2007.

[^23]: Karney, C.F.F., 2016. Sampling exactly from the normal distribution. ACM Transactions on Mathematical Software (TOMS), 42(1), pp.1-14. Also: "[**Sampling exactly from the normal distribution**](https://arxiv.org/abs/1303.6257v2)", arXiv:1303.6257v2  [physics.comp-ph], 2014.

[^24]: Leydold, J., "[**Automatic sampling with the ratio-of-uniforms method**](https://dl.acm.org/doi/10.1145/347837.347863)", ACM Transactions on Mathematical Software 26(1), 2000.

[^25]: Brassard, G., Devroye, L., Gravel, C., "Remote Sampling with Applications to General Entanglement Simulation", _Entropy_ 2019(21)(92), [**https://doi.org/10.3390/e21010092**](https://doi.org/10.3390/e21010092) .

[^26]: Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.

[^27]: Devroye, L., Gravel, C., "[**Random variate generation using only finitely many unbiased, independently and identically distributed random bits**](https://arxiv.org/abs/1502.02539v6)", arXiv:1502.02539v6 [cs.IT], 2020.

[^28]: Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.

[^29]: Lee, A., Doucet, A. and Łatuszyński, K., 2014. "[**Perfect simulation using atomic regeneration with application to Sequential Monte Carlo**](https://arxiv.org/abs/1407.5770v1)", arXiv:1407.5770v1  [stat.CO].

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Ratio_of_Uniforms></a>
### Ratio of Uniforms

The Cauchy sampler given earlier demonstrates the _ratio-of-uniforms_ technique for sampling a distribution (Kinderman and Monahan 1977\)[^21].  It involves transforming the distribution's probability density function (PDF) into a compact shape.  The ratio-of-uniforms method appears here in the appendix, particularly since it can involve calculating upper and lower bounds of transcendental functions which, while it's possible to achieve in rational arithmetic (Daumas et al., 2007\)[^22], is less elegant than, say, the normal distribution sampler by Karney (2014\)[^23], which doesn't require calculating logarithms or other transcendental functions.

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

> **Note:** The ratio-of-uniforms shape is convex if and only if &minus;1/sqrt(_PDF_(_x_)) is a concave function (loosely speaking, its "slope" never increases) (Leydold 2000)[^24].
>
> **Examples:**
>
> 1. For the normal distribution, _PDF_ is proportional to exp(&minus;_x_<sup>2</sup>/2), so that _z_ after a logarithmic transformation (see next section) becomes 4\*ln(_v_) + (_u_/_v_)<sup>2</sup>, and since the distribution's ratio-of-uniforms shape is symmetric about the _v_-axis, the return value's sign is positive or negative with equal probability.
> 2. For the standard lognormal distribution ([**Gibrat's distribution**](https://mathworld.wolfram.com/GibratsDistribution.html)), _PDF_(_x_) is proportional to exp(&minus;(ln(_x_))<sup>2</sup>/2)/_x_, so that _z_ after a logarithmic transformation becomes 2\*ln(_v_)&minus;(&minus;ln(_u_/_v_)<sup>2</sup>/2 &minus; ln(_u_/_v_)), and the returned PSRN has a positive sign.
> 3. For the gamma distribution with shape parameter _a_ > 1, _PDF_(_x_) is proportional to _x_<sup>_a_&minus;1</sup>\*exp(&minus;_x_), so that _z_ after a logarithmic transformation becomes 2\*ln(_v_)&minus;(_a_&minus;1)\*ln(_u_/_v_)&minus;(_u_/_v_), or 0 if _u_ or _v_ is 0, and the returned PSRN has a positive sign.

<a id=Probability_Transformations></a>
### Probability Transformations

The following algorithm takes a uniform partially-sampled random number (PSRN) as a "coin" and flips that "coin" using **SampleGeometricBag** (a method described in my [**article on PSRNs**](https://peteroupc.github.io/exporand.html)).  Given that "coin" and a function _f_ as described below, the algorithm returns 1 with probability _f_(_U_), where _U_ is the number built up by the uniform PSRN (see also (Brassard et al., 2019\)[^25], (Devroye 1986, p. 769\)[^26], (Devroye and Gravel 2020\)[^27].  In the algorithm:

-  The uniform PSRN's sign must be positive and its integer part must be 0.
- For correctness, _f_(_U_) must meet the following conditions:
    - If the algorithm will be run multiple times with the same PSRN, _f_(_U_) must be the constant 0 or 1, or be continuous and polynomially bounded on the open interval (0, 1) (polynomially bounded means that both _f_(_U_) and 1&minus;_f_(_U_) are greater than or equal to min(_U_<sup>_n_</sup>, (1&minus;_U_)<sup>_n_</sup>) for some integer _n_ (Keane and O'Brien 1994\)[^28]).
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

<a id=Pushdown_Automata_and_Algebraic_Functions></a>
### Pushdown Automata and Algebraic Functions

Moved to [**Supplemental Notes on Bernoulli Factories**](https://peteroupc.github.io/bernsupp.html).

<a id=Sampling_Distributions_Using_Incomplete_Information_Omitted_Algorithms></a>
### Sampling Distributions Using Incomplete Information: Omitted Algorithms

**Algorithm 2.** Suppose there is an _oracle_ that produces independent random real numbers whose expected value ("long-run average") is a known or unknown mean. The goal is now to produce nonnegative random variates whose expected value is the mean of _f_(_X_), where _X_ is a number produced by the oracle.  This is possible whenever&mdash;

- _f_ has a finite lower bound and a finite upper bound on its domain, and
- the mean of _f_(_X_) is not less than _&delta;_, where _&delta;_ is a known rational number greater than 0.

The algorithm to achieve this goal follows (see Lee et al. 2014\)[^29]\:

1. Let _m_ be a rational number equal to or greater than the maximum value of abs(_f_(_&mu;_)) anywhere.  Create a _&nu;_ input coin that does the following: "Take a number from the oracle, call it _x_.  With probability abs(_f_(_x_))/_m_, return a number that is 1 if _f_(_x_) < 0 and 0 otherwise.  Otherwise, repeat this process."
2. Use one of the [**linear Bernoulli factories**](https://peteroupc.github.io/bernoulli.html#lambda____x___y__linear_Bernoulli_factories) to simulate 2\*_&nu;_ (2 times the _&nu;_ coin's probability of heads), using the _&nu;_ input coin, with _&#x03F5;_ = _&delta;_/_m_.  If the factory returns 1, return 0.  Otherwise, take a number from the oracle, call it _&xi;_, and return abs(_f_(_&xi;_)).

> **Example:** An example from Lee et al. (2014\)[^29].  Say the oracle produces uniform random variates in [0, 3\*_&pi;_], and let _f_(_&nu;_) = sin(_&nu;_).  Then the mean of _f_(_X_) is 2/(3\*_&pi;_), which is greater than 0 and found in SymPy by `sympy.stats.E(sin(sympy.stats.Uniform('U',0,3*pi)))`, so the algorithm can produce nonnegative random variates whose expected value ("long-run average") is that mean.
>
> **Notes:**
>
> 1. Averaging to the mean of _f_(_X_) (that is, **E**\[_f_(_X_)] where **E**\[.] means expected or average value) is not the same as averaging to _f_(_&mu;_) where _&mu;_ is the mean of the oracle's numbers (that is, _f_(**E**\[_X_])).  For example, if _X_ is 0 or 1 with equal probability, and _f_(_&nu;_) = exp(&minus;_&nu;_), then **E**\[_f_(_X_)] = exp(0) + (exp(&minus;1) &minus; exp(0))\*(1/2), and _f_(**E**\[_X_]) = _f_(1/2) = exp(&minus;1/2).
> 2. (Lee et al. 2014, Corollary 4\)[^29]\: If _f_(_&mu;_) is known to return only values in the interval [_a_, _c_], the mean of _f_(_X_) is not less than _&delta;_, _&delta;_ > _b_, and _&delta;_ and _b_ are known numbers, then Algorithm 2 can be modified as follows:
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

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
