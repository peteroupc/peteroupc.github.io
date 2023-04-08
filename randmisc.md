# Miscellaneous Observations on Randomization

[**Peter Occil**](mailto:poccil14@gmail.com)

This page should be read in conjunction with the following articles:

- [**Randomization and Sampling Methods**](https://peteroupc.github.io/randomfunc.html).
- [**More Random Sampling Methods**](https://peteroupc.github.io/randomnotes.html).

<a id=Contents></a>
## Contents

- [**Contents**](#Contents)
- [**About This Document**](#About_This_Document)
- [**Samplers for Certain Discrete Distributions**](#Samplers_for_Certain_Discrete_Distributions)
    - [**On a Binomial Sampler**](#On_a_Binomial_Sampler)
    - [**On Geometric Samplers**](#On_Geometric_Samplers)
        - [**Bounded Geometric Distribution**](#Bounded_Geometric_Distribution)
        - [**Symmetric Geometric Distribution**](#Symmetric_Geometric_Distribution)
    - [**Weighted Choice for Special Distributions**](#Weighted_Choice_for_Special_Distributions)
        - [**Weighted Choice with Weights Written as an Integer and Fraction**](#Weighted_Choice_with_Weights_Written_as_an_Integer_and_Fraction)
        - [**Distributions with nowhere increasing or nowhere decreasing weights**](#Distributions_with_nowhere_increasing_or_nowhere_decreasing_weights)
        - [**Unimodal distributions of weights**](#Unimodal_distributions_of_weights)
        - [**Weighted Choice with Log Probabilities**](#Weighted_Choice_with_Log_Probabilities)
    - [**Bernoulli Distribution for Cumulative Distribution Functions**](#Bernoulli_Distribution_for_Cumulative_Distribution_Functions)
    - [**Bit Vectors with Random Bit Flips**](#Bit_Vectors_with_Random_Bit_Flips)
    - [**Log-Uniform Distribution**](#Log_Uniform_Distribution)
- [**Sampling Unbounded Monotone Density Functions**](#Sampling_Unbounded_Monotone_Density_Functions)
- [**Certain Families of Distributions**](#Certain_Families_of_Distributions)
- [**Certain Distributions**](#Certain_Distributions)
- [**Random Variate Generation via Quantiles**](#Random_Variate_Generation_via_Quantiles)
- [**Batching Random Samples via Randomness Extraction**](#Batching_Random_Samples_via_Randomness_Extraction)
- [**Sampling Distributions Using Incomplete Information**](#Sampling_Distributions_Using_Incomplete_Information)
    - [**Additional Algorithms**](#Additional_Algorithms)
- [**Acknowledgments**](#Acknowledgments)
- [**Notes**](#Notes)
- [**License**](#License)

<a id=About_This_Document></a>
## About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/randmisc.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/randmisc.md)**.  You can send comments on this document on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues)**.**

My audience for this article is **computer programmers with mathematics knowledge, but little or no familiarity with calculus**.

I encourage readers to implement any of the algorithms given in this page, and report their implementation experiences.  In particular, [**I seek comments on the following aspects**](https://github.com/peteroupc/peteroupc.github.io/issues/18):

- Are the algorithms in this article easy to implement? Is each algorithm written so that someone could write code for that algorithm after reading the article?
- Does this article have errors that should be corrected?
- Are there ways to make this article more useful to the target audience?

Comments on other aspects of this document are welcome.

<a id=Samplers_for_Certain_Discrete_Distributions></a>
## Samplers for Certain Discrete Distributions

The following are exact samplers for certain _discrete distributions_, or probability distributions that take on values each mappable to a different integer.

<a id=On_a_Binomial_Sampler></a>
### On a Binomial Sampler

The binomial(_n_, _p_) distribution models the number of successful trials ("coin flips") out of _n_ of them, where the trials are independent and have success probability _p_.

Take the following sampler of a binomial(_n_, 1/2) distribution, where _n_ is even, which is equivalent to the one that appeared in Bringmann et al. (2014\)[^1], and adapted to be more programmer-friendly.

1. If _n_ is less than 4, generate _n_ unbiased random bits (each bit is zero or one with equal probability) and return their sum.  Otherwise, if _n_ is odd[^2], set _ret_ to the result of this algorithm with _n_ = _n_ &minus; 1, then add an unbiased random bit's value to _ret_, then return _ret_.
2. Set _m_ to floor(sqrt(_n_)) + 1.
3. (First, sample from an envelope of the binomial curve.) Generate unbiased random bits until a zero is generated this way.  Set _k_ to the number of ones generated this way.
4. Set _s_ to an integer in [0, _m_) chosen uniformly at random, then set _i_ to _k_\*_m_ + _s_.
5. Generate an unbiased random bit.  If that bit is 0, set _ret_ to (_n_/2)+_i_.  Otherwise, set _ret_ to (_n_/2)&minus;_i_&minus;1.
6. (Second, accept or reject _ret_.) If _ret_ < 0 or _ret_ > _n_, go to step 3.
7. With probability choose(_n_, _ret_)\*_m_\*2<sup>_k_&minus;_n_&minus;2</sup>, return _ret_.  Otherwise, go to step 3. (Here, choose(_n_, _k_) is a _binomial coefficient_, or the number of ways to choose _k_ out of _n_ labeled items.[^3])

This algorithm has an acceptance rate of 1/16 regardless of the value of _n_.  However, step 7 will generally require a growing amount of storage and time to exactly calculate the given probability as _n_ gets larger, notably due to the inherent factorial in the binomial coefficient.  The Bringmann paper suggests approximating this factorial via Spouge's approximation; however, it seems hard to do so without using floating-point arithmetic, which the paper ultimately resorts to. Alternatively, the logarithm of that probability can be calculated, then 0 minus an exponential random variate can be generated and compared with that logarithm to determine whether the step succeeds.

More specifically, step 7 can be changed as follows:

- (7.) Let _p_ be loggamma(_n_+1)&minus;loggamma(_ret_+1)&minus;loggamma((_n_&minus;_ret_)+1)+ln(_m_)+ln(2)\*(_k_&minus;_n_&minus;2) (where loggamma(_x_) is the logarithm of the gamma function).
- (7a.) Generate an exponential random variate with rate 1 (which is the negative natural logarithm of a uniform(0,1) random variate).  Set _h_ to 0 minus that number.
- (7b.) If _h_ is greater than _p_, go to step 3.  Otherwise, return _ret_. (This step can be replaced by calculating lower and upper bounds that converge to _p_.  In that case, go to step 3 if _h_ is greater than the upper bound, or return _ret_ if _h_ is less than the lower bound, or compute better bounds and repeat this step otherwise.  See also chapter 4 of (Devroye 1986\)[^4].)

My implementation of loggamma and the natural logarithm ([**betadist.py**](https://peteroupc.github.io/betadist.py)) relies on so-called "constructive reals" as well as a fast converging version of Stirling's formula for the factorial's natural logarithm (Schumacher 2016\)[^5].

Also, according to the Bringmann paper, _m_ can be set such that _m_ is in the interval \[sqrt(_n_), sqrt(_n_)+3\], so I implement step 1 by starting with _u_ = 2<sup>floor((1+_&beta;_(_n_))/2)</sup>, then calculating _v_ = floor((_u_+floor(_n_/_u_))/2), _w_ = _u_, _u_ = _v_  until _v_ &ge; _w_, then setting _m_ to _w_ + 1.  Here, _&beta;_(_n_) = ceil(ln(_n_+1)/ln(2)), or alternatively the minimum number of bits needed to store _n_ (with _&beta;_(0) = 0).

> **Notes:**
>
> - A binomial(_n_, 1/2) random variate, where _n_ is odd[^2], can be generated by adding an unbiased random bit's value (either zero or one with equal probability) to a binomial(_n_&minus;1, 1/2) random variate.
> - As pointed out by Farach-Colton and Tsai (2015\)[^6], a binomial(_n_, _p_) random variate, where _p_ is in the interval (0, 1), can be generated using binomial(_n_, 1/2) numbers using a procedure equivalent to the following:
>     1. Set _k_ to 0 and _ret_ to 0.
>     2. If the binary digit at position _k_ after the point in _p_'s binary expansion (that is, 0.bbbb... where each b is a zero or one) is 1, add a binomial(_n_, 1/2) random variate to _ret_ and subtract the same variate from _n_; otherwise, set _n_ to a binomial(_n_, 1/2) random variate.
>     3. If _n_ is greater than 0, add 1 to _k_ and go to step 2; otherwise, return _ret_. (Positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.)

<a id=On_Geometric_Samplers></a>
### On Geometric Samplers

As used in Bringmann and Friedrich (2013\)[^7], a geometric(_p_) random variate expresses the number of failing trial before the first success, where each trial ("coin flip") is independent and has success probability _p_, satisfying 0 &lt; _p_ &le; 1.

> **Note**: The terms "geometric distribution" and "geometric random variate" have conflicting meanings in academic works.

The following algorithm is equivalent to the geometric(_px_/_py_) sampler that appeared in that paper, but adapted to be more programmer-friendly.  The algorithm uses the rational number _px_/_py_, not an arbitrary real number _p_; some of the notes in this section indicate how to adapt the algorithm to an arbitrary _p_.

1. Set _pn_ to _px_, _k_ to 0, and _d_ to 0.
2. While _pn_\*2 &le; _py_, add 1 to _k_ and multiply _pn_ by 2.  (Equivalent to finding the largest _k_ &ge; 0 such that _p_\*2<sup>_k_</sup> &le; 1.  For the case when _p_ need not be rational, enough of its binary expansion can be calculated to carry out this step accurately, but in this case any _k_ such that _p_ is greater than 1/(2<sup>_k_+2</sup>) and less than or equal to 1/(2<sup>_k_</sup>) will suffice, as the Bringmann paper points out.)
3. With probability (1&minus;_px_/_py_)<sup>2<sup>_k_</sup></sup>, add 1 to _d_ and repeat this step. (To simulate this probability, the first sub-algorithm below can be used.)
4. Generate a uniform random integer in [0, 2<sup>_k_</sup>), call it _m_, then with probability (1&minus;_px_/_py_)<sup>_m_</sup>, return _d_\*2<sup>_k_</sup>+_m_. Otherwise, repeat this step. (The Bringmann paper, though, suggests to simulate this probability by sampling only as many bits of _m_ as needed to do so, rather than just generating _m_ in one go, then using the first sub-algorithm on _m_.  However, the implementation, given as the second sub-algorithm below, is much more complicated and is not crucial for correctness.)

The first sub-algorithm returns 1 with probability (1&minus;_px_/_py_)<sup>_n_</sup>, assuming that _n_\*_px_/_py_ &le; 1.  It implements the approach from the Bringmann paper by rewriting the probability using the binomial theorem. (More generally, to return 1 with probability (1&minus;_p_)<sup>_n_</sup>, it's enough to flip a coin that shows heads with probability _p_, _n_ times or until it shows heads, whichever comes first, and then return either 1 if all the flips showed tails, or 0 otherwise.  See also "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)".)

1. Set _pnum_, _pden_, and _j_  to 1, then set _r_ to 0, then set _qnum_ to _px_, and _qden_ to _py_, then set _i_ to 2.
2. If _j_ is greater than _n_, go to step 5.
3. If _j_ is even[^8], set _pnum_ to _pnum_\*_qden_ + _pden_\*_qnum_\*choose(_n_,_j_). Otherwise, set _pnum_ to _pnum_\*_qden_ &minus; _pden_\*_qnum_\*choose(_n_,_j_).
4. Multiply _pden_ by _qden_, then multiply _qnum_ by _px_, then multiply _qden_ by _py_, then add 1 to _j_.
5. If _j_ is less than or equal to 2 and less than or equal to _n_, go to step 2.
6. Multiply _r_ by 2, then add an unbiased random bit's value (either 0 or 1 with equal probability) to _r_.
7. If _r_ &le; floor((_pnum_\*_i_)/_pden_) &minus; 2, return 1. If _r_ &ge; floor((_pnum_\*_i_)/_pden_) + 1, return 0.  If neither is the case, multiply _i_ by 2 and go to step 2.

The second sub-algorithm returns an integer _m_ in [0, 2<sup>_k_</sup>) with probability (1&minus;_px_/_py_)<sup>_m_</sup>, or &minus;1 with the opposite probability.  It assumes that 2<sup>_k_</sup>\*_px_/_py_ &le; 1.

1. Set _r_ and _m_ to 0.
2. Set _b_ to 0, then while _b_ is less than _k_:
    1. (Sum _b_+2 summands of the binomial equivalent of the desired probability.  First, append an additional bit to _m_, from most to least significant.) Generate an unbiased random bit (either 0 or 1 with equal probability).  If that bit is 1, add 2<sup>_k_&minus;_b_</sup> to _m_.
    2. (Now build up the binomial probability.) Set _pnum_, _pden_, and _j_  to 1, then set _qnum_ to _px_, and _qden_ to _py_.
    3. If _j_ is greater than _m_ or greater than _b_ + 2, go to the sixth substep.
    4. If _j_ is even[^8], set _pnum_ to _pnum_\*_qden_ + _pden_\*_qnum_\*choose(_m_,_j_). Otherwise, set _pnum_ to _pnum_\*_qden_ &minus; _pden_\*_qnum_\*choose(_m_,_j_).
    5. Multiply _pden_ by _qden_, then multiply _qnum_ by _px_, then multiply _qden_ by _py_, then add 1 to _j_, then go to the third substep.
    6. (Now check the probability.) Multiply _r_ by 2, then add an unbiased random bit's value (either 0 or 1 with equal probability) to _r_.
    7. If _r_ &le; floor((_pnum_\*2<sup>_b_</sup>)/_pden_) &minus; 2, add a uniform random integer in [0, 2<sup>_k_\*_b_</sup>) to _m_ and return _m_ (and, if requested, the number _k_&minus;_b_&minus;1). If _r_ &ge; floor((_pnum_\*2<sup>_b_</sup>)/_pden_) + 1, return &minus;1 (and, if requested, an arbitrary value).  If neither is the case, add 1 to _b_.
8. Add an unbiased random bit to _m_. (At this point, _m_ is fully sampled.)
9. Run the first sub-algorithm with _n_ = _m_, except in step 1 of that sub-algorithm, set _r_ to the value of _r_ built up by this algorithm, rather than 0, and set _i_ to 2<sup>_k_</sup>, rather than 2.  If that sub-algorithm returns 1, return _m_ (and, if requested, the number &minus;1).  Otherwise, return &minus;1 (and, if requested, an arbitrary value).

<a id=Bounded_Geometric_Distribution></a>
#### Bounded Geometric Distribution

As used in the Bringmann paper, a bounded geometric(_p_, _n_) random variate is a geometric(_p_) random variate or _n_ (an integer greater than 0), whichever is less.  The following algorithm is equivalent to the algorithm given in that paper, but adapted to be more programmer-friendly.

1. Set _pn_ to _px_, _k_ to 0, _d_ to 0, and _m2_ to the smallest power of 2 that is greater than _n_ (or equivalently, 2<sup>_bits_</sup> where _bits_ is the minimum number of bits needed to store _n_).
2. While _pn_\*2 &le; _py_, add 1 to _k_ and multiply _pn_ by 2.
3. With probability (1&minus;_px_/_py_)<sup>2<sup>_k_</sup></sup>, add 1 to _d_ and then either return _n_ if _d_\*2<sup>_k_</sup> is greater than or equal to _m2_, or repeat this step if less. (To simulate this probability, the first sub-algorithm above can be used.)
4. Generate a uniform random integer in [0, 2<sup>_k_</sup>), call it _m_, then with probability (1&minus;_px_/_py_)<sup>_m_</sup>, return min(_n_, _d_\*2<sup>_k_</sup>+_m_). In the Bringmann paper, this step is implemented in a manner equivalent to the following (this alternative implementation, though, is not crucial for correctness):
    1. Run the second sub-algorithm above, except return two values, rather than one, in the situations given in the sub-algorithm.  Call these two values _m_ and _mbit_.
    2. If _m_ < 0, go to the first substep.
    3. If _mbit_ &ge; 0, add 2<sup>_mbit_</sup> times an unbiased random bit to _m_ and subtract 1 from _mbit_.  If that bit is 1 or _mbit_ < 0, go to the next substep; otherwise, repeat this substep.
    4. Return _n_ if _d_\*2<sup>_k_</sup> is greater than or equal to _m2_.
    5. Add a uniform random integer in [0, 2<sup>_mbit_+1</sup>) to _m_, then return min(_n_, _d_\*2<sup>_k_</sup>+_m_).

<a id=Symmetric_Geometric_Distribution></a>
#### Symmetric Geometric Distribution

Samples from the symmetric geometric distribution from (Ghosh et al. 2012)[^9], with parameter _&lambda;_ (a real number satisfying 0 &lt; _&lambda;_ &le; 1), in the form of an input coin with unknown probability of heads of _&lambda;_.

1. Flip the input coin until it returns 1.  Set _n_ to the number of times the coin returned 0 this way.
2. Run a **Bernoulli factory algorithm for 1/(2&minus;_&lambda;_)**, using the input coin.  If the run returns 1, return _n_.  Otherwise, return &minus;1 &minus; _n_.

This is similar to an algorithm mentioned in an appendix in Li (2021)[^10], in which the input coin&mdash;

- has _&lambda;_ = 1&minus;exp(&minus;_&epsilon;_), where _&epsilon;_ > 0, and
- can be built as follows using another input coin: "Run the **ExpMinus** algorithm with parameter _&epsilon;_, then return 1 minus the result."

The algorithm of Li generates a variate from the _discrete Laplace distribution_ with parameter _&epsilon;_, and Canonne et al. (2020\)[^11] likewise gave an exact algorithm for that distribution where _&epsilon;_ = _s_/_t_ is a rational number, where _s_ > 0 and _t_ > 0 are integers, namely an algorithm equivalent to the following:

1. Generate a uniform random integer _u_ that satisfies 0 &le; _u_ &lt; _t_.
2. Run the **ExpMinus** algorithm with parameter _u_/_t_.   If it returns 0, go to step 1.
3. Run the **ExpMinus** algorithm with parameter 1, until a run returns 0, then set _n_ to the number of times the algorithm returned 1 this way.
4. Set _y_ to floor((_u_+_n_\*_t_)/_s_).
5. Generate an unbiased random bit (either zero or one with equal probability).  If the bit is 0, return _y_.  Otherwise, if _y_ is 0, go to step 1.  Otherwise, return &minus;_y_.

<a id=Weighted_Choice_for_Special_Distributions></a>
### Weighted Choice for Special Distributions

The following are algorithms to sample items whose "weights" (which are related to the probability of sampling each item) are given in a special way.  They supplement the section "[**Weighted Choice**](https://peteroupc.github.io/randomfunc.html#Weighted_Choice)" in my article "Randomization and Sampling Methods".

<a id=Weighted_Choice_with_Weights_Written_as_an_Integer_and_Fraction></a>
#### Weighted Choice with Weights Written as an Integer and Fraction

Suppose there is a list called _weights_.  This is a list of _n_ weights, with labels starting at 0 and ending at _n_&minus;1.

Each weight&mdash;

1. can store an integer part _m_ and have _&nu;_ represent a "coin" that implements an algorithm that returns 1 (or outputs heads) with probability equal to the fractional part _&nu;_, also known as a _Bernoulli factory algorithm_ (_m_ &ge; 0, and 0 &le; _&nu;_ &le; 1), or
2. can store a [**partially-sampled random number**](https://peteroupc.github.io/exporand.html) (PSRN), with the integer part equal to _m_ and the fractional part equal to _&nu;_ (_m_ &ge; 0, and 0 &le; _&nu;_ &le; 1), or
3. can store a rational number _x_/_y_, where _x_&ge;0 and _y_&gt;0 are integers, such that _m_ = floor(_x_/_y_) and _&nu;_ = _x_/_y_&minus;_m_.

Given this list of weights, the following algorithm chooses an integer in [0, _n_) with probability proportional to its weight.

1. Create an empty list, then for each weight starting with weight 0, append the weight's integer part (_m_) plus 1 to that list.  For example, if the weights are PSRNs written as [2.22...,0.001...,1.3...], in that order, the list will be [3, 1, 2], corresponding to integers 0, 1, and 2, in that order.  Call the list just created the _rounded weights list_.
2. Choose an integer _i_ with probability proportional to the weights in the rounded weights list.  This can be done, for example, by taking the result of **WeightedChoice**(_list_), where _list_ is the rounded weights list and **WeightedChoice** is given in "[**Randomization and Sampling Methods**](https://peteroupc.github.io/randomfunc.html#Weighted_Choice_With_Replacement)".  Let _w_ be the original weight for integer _i_, and let _rw_ be the rounded weight for integer _i_ in the rounded weights list.
3. Generate _j_, a uniform random integer that is 0 or greater and less than _rw_. If _j_ is less than _rw_&minus;1, return _i_.  Otherwise:

    - If _w_ is written as in case 1, above, run the Bernoulli factory algorithm for _&nu;_ (the weight's fractional part).  If it returns 1, return _i_.  Otherwise, go to step 2.
    - If _w_ is written as in case 2, run **SampleGeometricBag** on the PSRN.  If the result is 1, return _i_.  Otherwise, go to step 2.
    - If _w_ is written as in case 3, let _r_ = rem(_x_, _y_) = _x_&minus;floor(_x_/_y_)\*_y_, then with probability _r_/_y_, return _i_. (For example, generate _z_, a uniform random integer satisfying 0&le;_z_&lt;_y_, then if _z_&lt;_r_, return _i_.) Otherwise, go to step 2.

<a id=Distributions_with_nowhere_increasing_or_nowhere_decreasing_weights></a>
#### Distributions with nowhere increasing or nowhere decreasing weights

An algorithm for sampling an integer in the interval \[_a_, _b_) with probability proportional to weights listed in _nowhere increasing_ order (example: \[10, 3, 2, 1, 1\] when _a_ = 0 and _b_ = 5) can be implemented as follows (Chewi et al. 2022\)[^12].  It has a logarithmic time complexity in terms of setup and sampling.

- Setup:  Let _w_\[_i_\] be the weight for integer _i_ (with _i_ starting at _a_).
    1. (Envelope weights.) Build a list _q_ as follows: The first item is _w_\[_a_\], then set _j_ to 1, then while _j_ &lt; _b_&minus;_a_, append _w_\[_a_ + _j_\] and multiply _j_ by 2.  The list _q_'s items should be rational numbers that equal the true values, if possible, or overestimate them if not.
    2. (Envelope chunk weights.) Build a list _r_ as follows: The first item is _q_\[0\], then set _j_ to 1 and _m_ to 1, then while _j_ &lt; _b_&minus;_a_, append _q_\[_m_\]\*min((_b_&minus;_a_) &minus; _j_, _j_) and multiply _j_ by 2 and add 1 to _m_.
    3. (Start and end points of each chunk.) Build a list _D_ as follows: The first item is the list \[_a_, _a_+1\], then set _j_ to 1, then while _j_ &lt; _n_, append the list \[_j_, _j_ + min((_b_&minus;_a_) &minus; _j_, _j_)\] and multiply _j_ by 2.
- Sampling:
    1. Choose an integer in [0, _s_) with probability proportional to the weights in _r_, where _s_ is the number of items in _r_.  Call the chosen integer _k_.
    2. Set _x_ to an integer chosen uniformly at random such that _x_ is greater than or equal to _D_\[_k_\]\[0\] and is less than _D_\[_k_\]\[1\].
    3. With probability _w_\[_x_\] / _q_\[_k_\], return _x_.  Otherwise, go to step 1.

For _nowhere decreasing_ rather than nowhere increasing weights, the algorithm is as follows instead:

- Setup:  Let _w_\[_i_\] be the weight for integer _i_ (with _i_ starting at _a_).
    1. (Envelope weights.) Build a list _q_ as follows: The first item is _w_\[_b_&minus;1\], then set _j_ to 1, then while _j_ &lt; (_b_&minus;_a_), append _w_\[_b_&minus;1&minus;_j_\] and multiply _j_ by 2.  The list _q_'s items should be rational numbers that equal the true values, if possible, or overestimate them if not.
    2. (Envelope chunk weights.) Build a list _r_ as given in step 2 of the previous algorithm's setup.
    3. (Start and end points of each chunk.) Build a list _D_ as follows: The first item is the list \[_b_&minus;1, _b_\], then set _j_ to 1, then while _j_ &lt; (_b_&minus;_a_), append the list \[(_b_&minus;_j_) &minus; min((_b_&minus;_a_) &minus; _j_, _j_), _b_&minus;_j_\] and multiply _j_ by 2.
- The sampling is the same as for the previous algorithm.

> **Notes:**
>
> 1. The weights can be base-_&beta;_ logarithms, especially since logarithms preserve order, but in this case the algorithm requires changes.  In the setup step 2, replace "_q_\[_m_\]\*min((_b_&minus;_a_)" with "_q_\[_m_\]+ln(min((_b_&minus;_a_))/ln(_&beta;_)" (which is generally inexact unless _&beta;_ is 2); in sampling step 1, use an algorithm that takes base-_&beta;_ logarithms as weights; and replace sampling step 3 with "Generate an exponential random variate with rate ln(_&beta;_) (that is, the variate is _E_/ln(_&beta;_) where _E_ is an exponential random variate with rate 1).  If that variate is greater than _q_\[_k_\] minus _w_\[_x_\], return _x_.  Otherwise, go to step 1."<br>Applying these modifications to this section's algorithms can introduce numerical errors unless care is taken (see note 2).  The same is true for running the unmodified algorithms with weights that are not rational numbers.
> 2. If an algorithm will operate on potentially irrational numbers, then to avoid numerical errors, it should store and operate on real numbers in the form of constructive reals or recursive reals (see, e.g., Boehm 1987[^13], 2020[^14]), or in the form of partially-sampled random numbers (PSRNs) together with algorithms with [**desirable properties for PSRN samplers**](https://peteroupc.github.io/exporand.html#Properties).

<a id=Unimodal_distributions_of_weights></a>
#### Unimodal distributions of weights

The following is an algorithm for sampling an integer in the interval \[_a_, _b_\) with probability proportional to a _unimodal distribution_ of weights (that is, nowhere decreasing on the left and nowhere increasing on the right) (Chewi et al. 2022\)[^12].  It assumes the mode (the point with the highest weight) is known.  An example is \[1, 3, 9, 4, 4\] when _a_ = 0 and _b_ = 5, and the _mode_ is 2, which corresponds to the weight 9.  It has a logarithmic time complexity in terms of setup and sampling.

- Setup:
    1. Find the point with the highest weight, such as via binary search.  Call this point _mode_.
    2. Run the setup for _nowhere decreasing_ weights on the interval [_a_, _mode_), then run the setup for _nowhere increasing_ weights on the interval [_mode_, _b_).  Both setups are described in the previous section.  Then, concatenate the two _q_ lists into one, the two _r_ lists into one, and the two _D_ lists into one.
- The sampling is the same as for the algorithms in the previous section.

<a id=Weighted_Choice_with_Log_Probabilities></a>
#### Weighted Choice with Log Probabilities

Huijben et al. (2022)[^15] reviews the Gumbel max trick and Gumbel softmax distributions.

>  **Note**: Because these algorithms involve adding one real number to another and calculating `exp` of a real number, they can introduce numerical errors unless care is taken (see note 2 in "Distributions with nowhere increasing or nowhere decreasing weights", above).

**Weighted choice with the Gumbel max trick.** Let _C_>0 be an unknown number.  Then, given&mdash;

- a vector of the form [_p_<sub>0</sub>, _p_<sub>1</sub>, ..., _p_<sub>_n_</sub>], where _p_<sub>_i_</sub> is a so-called "unnormalized log probability" of the form ln(_x_)+_C_ (where _C_ is a constant and _x_ is the probability of getting _i_),

an integer in the closed interval [0, _n_] can be sampled as follows:

1. ("Gumbel".) For each _p_<sub>_i_</sub>, generate a "Gumbel variate" _G_, then set _q_<sub>_i_</sub> to _p_<sub>_i_</sub>+_G_.  (A so-called "Gumbel variate" is distributed as &minus;ln(&minus;ln(_U_)), where _U_ is a uniform random variate greater than 0 and less than 1.[^16])
2. ("Max".) Return the integer _i_ corresponding to the highest _q_<sub>_i_</sub> value.

> **Note:** "Gumbel top _k_ sampling" samples _k_ items according to their "unnormalized log probabilities" (see Fig. 7 of Huijben et al. (2022)[^15]); this sampling works by doing step 1, then choosing the _k_ integers corresponding to the _k_ highest _q_<sub>_i_</sub> values.  With this sampling, though, the probability of getting _i_ (if the plain Gumbel max trick were used) is not necessarily the probability that _i_ is included in the _k_-item sample (Tillé 2023)[^17].

**Weighted choice with the Gumbel softmax trick.** Given a vector described above as well as a "temperature" parameter _&lambda;_ > 0, a "continuous relaxation" or "concrete distribution" (which transforms the vector to a new one) can be sampled as follows:

1. ("Gumbel".) For each _p_<sub>_i_</sub>, generate a "Gumbel variate" _G_, then set _q_<sub>_i_</sub> to _p_<sub>_i_</sub>+_G_.
2. ("Softmax".) For each _q_<sub>_i_</sub>, set it to exp(_q_<sub>_i_</sub>/_&lambda;_).
3. Set _d_ to the sum of all values of _q_<sub>_i_</sub>.
4. For each _q_<sub>_i_</sub>, divide it by _d_.

The algorithm's result is a vector _q_, which can be used only once to sample _i_ with probability proportional to _q_<sub>_i_</sub> (which is not a "log probability"). (In this case, steps 3 and 4 above can be omitted if that sampling method can work with weights that need not sum to 1.)

<a id=Bernoulli_Distribution_for_Cumulative_Distribution_Functions></a>
### Bernoulli Distribution for Cumulative Distribution Functions

Suppose a real number _z_ is given (which might be a partially-sampled random number [PSRN] or a rational number).  If a probability distribution&mdash;

- has a probability density function (PDF) (as with the normal or exponential distribution), and
- has an arbitrary-precision sampler that returns a PSRN _X_,

then it's possible to generate 1 with the same probability as the sampler returns an _X_ that is less than or equal to _z_, as follows:

1. Run the arbitrary-precision sampler to generate _X_, a uniform PSRN.
2. Run **RandLess** (if _z_ is a PSRN) or **RandLessThanReal** (if _z_ is a real number) with parameters _X_ and _z_, in that order, and return the result.

Specifically, the probability of returning 1 is the _cumulative distribution function_ (CDF) for the distribution of _X_.

> **Notes:**
>
> 1. Although step 2 of the algorithm checks whether _X_ is merely less than _z_, this is still correct; because the distribution of _X_ has a PDF, _X_ is less than _z_ with the same probability as _X_ is less than or equal to _z_.
> 2. All probability distributions have a CDF, not just those with a PDF, but also discrete ones such as Poisson or binomial.

<a id=Bit_Vectors_with_Random_Bit_Flips></a>
### Bit Vectors with Random Bit Flips

Chakraborty and Vardeman (2021)[^18] describes distributions of bit vectors with a random number of bit flips. Given three parameters &mdash; _&mu;_ is a _p_-item vector (list) with only zeros and/or ones; _p_ is the size of _&mu;_; and _&alpha;_ is a spread parameter greater than 0 and less than 1 &mdash; do the following to generate such a vector:

1. Generate a random integer _c_ in the interval \[0, _p_] in some way.  (_c_ need not be uniformly distributed.  This is the number of bit flips.)
2. Create a _p_-item list _&nu;_, where the first _c_ items are ones and the rest are zeros.  [**Shuffle**](https://peteroupc.github.io/randomfunc.html#Shuffling) the list.
3. Create a copy of _&mu;_, call it _M_.  Then for each _i_ where _&nu;_\[_i_\] = 1, set _M_\[_i_\] to 1 &minus; _M_\[_i_\].  Then return _M_.

The paper describes two ways to establish the weights for _c_ in step 1 (there are others as well):

- Generate _c_ with probability proportional to the following weights: [_&alpha;_<sup>0</sup>, _&alpha;_<sup>1</sup>, ..., _&alpha;_<sup>_p_</sup>].  (Since each weight is 1 or less, this can be implemented as follows, for example.  Generate a uniform random integer in \[0, _p_\], call it _d_, then flip a coin that shows heads with probability _&alpha;_, _d_ times, then either return _d_ if _d_ is 0 or all the flips are heads, or repeat this process otherwise.)
- Generate _c_ with probability proportional to the following weights: [_&alpha;_<sup>0</sup>\*choose(_p_,0), _&alpha;_<sup>1</sup>\*choose(_p_,1), ..., _&alpha;_<sup>_p_</sup>\*choose(_p_,_p_)].  (Since the sum of weights is no more than $2^p$, each weight can be divided by $2^p$ to get weights that are 1 or less, so that this can be implemented as follows, for example.  Generate a uniform random integer in \[0, _p_\], call it _d_, then flip a coin that shows heads with probability _&alpha;_, _d_ times, and a coin that shows heads with probability choose(_p_, _d_)/2<sup>_p_</sup> once, then either return _d_ if all the flips are heads, or repeat this process otherwise.  Note that the probability choose(_p_, _d_)/2<sup>_p_</sup> is simple to simulate for being a rational number.)

<a id=Log_Uniform_Distribution></a>
### Log-Uniform Distribution

Samples from the so-called "log uniform distribution" as used by the Abseil programming library.  This algorithm takes a maximum _mx_ and a logarithmic base _b_, and chooses an integer in \[0, _mx_\] such that two values are chosen with the same probability if their base-_b_ logarithms are equal in their integer parts (which roughly means that lower numbers occur with an exponentially greater probability).  Although this algorithm works, in principle, for every _b_ > 0, Abseil supports only integer bases _b_.

1. Let _L_ be ceil(ln(_mx_+1)/ln(_b_)). Choose a uniform random integer in the closed interval \[0, _L_\], call it _u_.
2. If _u_ is 0, return 0.
3. Set _st_ to min(_mx_, ceil(_b_<sup>_u_&minus;1</sup>)).
4. Set _en_ to min(_mx_, ceil(_b_<sup>_u_</sup>) &minus; 1).
5. Choose a uniform random integer in the closed interval [_st_, _en_], and return it.

<a id=Sampling_Unbounded_Monotone_Density_Functions></a>
## Sampling Unbounded Monotone Density Functions

This section shows a preprocessing algorithm to generate a random variate in the closed interval [0, 1] from a distribution whose probability density function (PDF)&mdash;

- is continuous in the interval [0, 1],
- is strictly decreasing in [0, 1], and
- has an unbounded peak at 0.

The trick here is to sample the peak in such a way that the result is either forced to be 0 or forced to belong to the bounded part of the PDF.  This algorithm does not require the area under the curve of the PDF in [0, 1] to be 1; in other words, this algorithm works even if the PDF is known up to a normalizing constant.  The algorithm is as follows.

1. Set _i_ to 1.
2. Calculate the cumulative probability of the interval [0, 2<sup>&minus;_i_</sup>] and that of [0, 2<sup>&minus;(_i_ &minus; 1)</sup>], call them _p_ and _t_, respectively.
3. With probability _p_/_t_, add 1 to _i_ and go to step 2. (Alternatively, if _i_ is equal to or higher than the desired number of fractional bits in the result, return 0 instead of adding 1 and going to step 2.)
4. At this point, the PDF at [2<sup>&minus;_i_</sup>, 2<sup>&minus;(_i_ &minus; 1)</sup>) is less than or equal to a finite number, so sample a random variate in this interval using any appropriate algorithm, including rejection sampling.  Because the PDF is strictly decreasing, the peak of the PDF at this interval is located at 2<sup>&minus;_i_</sup>, so that rejection sampling becomes trivial.

It is relatively straightforward to adapt this algorithm for strictly increasing PDFs with the unbounded peak at 1, or to PDFs with a different domain than \[0, 1\].

This algorithm is similar to the "inversion&ndash;rejection" algorithm mentioned in section 4.4 of chapter 7 of Devroye's _Non-Uniform Random Variate Generation_ (1986\)[^4].  I was unaware of that algorithm at the time I started writing the text that became this section (Jul. 25, 2020).  The difference here is that it assumes the whole distribution has support \[0, 1\] ("support" is defined later), while the algorithm presented in this article doesn't make that assumption (for example, the interval [0, 1] can cover only part of the distribution's support).

By the way, this algorithm arose while trying to devise an algorithm that can generate an integer power of a uniform random variate, with arbitrary precision, without actually calculating that power (a naïve calculation that is merely an approximation and usually introduces bias); for more information, see the article on [**partially-sampled random numbers**](https://peteroupc.github.io/exporand.html).  Even so, the algorithm I have come up with in this note may be of independent interest.

In the case of powers of a uniform random variate between 0 and 1, call the variate _X_, namely _X_<sup>_n_</sup>, the ratio _p_/_t_ in this algorithm has a very simple form, namely (1/2)<sup>1/_n_</sup>.  Note that this formula is the same regardless of _i_. (To return 1 with probability (1/2)<sup>1/_n_</sup>, the algorithm for **(_a_/_b_)<sup>_z_</sup>** in "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)" can be used with _a_=1, _b_=2, and _z_=1/_n_.)  This is found by taking the PDF _f_(_x_) = _x_<sup>1/_n_</sup>/(_x_ * _n_)</sup> and finding the appropriate _p_/_t_ ratios by integrating _f_ over the two intervals mentioned in step 2 of the algorithm.

<a id=Certain_Families_of_Distributions></a>
## Certain Families of Distributions

This section is a note on certain families of univariate (one-variable) probability distributions, with emphasis on generating random variates from them.  Some of these families are described in Ahmad et al. (2019\)[^19], Jones (2015)[^20].

The following mathematical definitions are used:

- A probability distribution's _quantile function_ (also known as _inverse cumulative distribution function_ or _inverse CDF_) is a nowhere decreasing function that maps uniform random variates greater than 0 and less than 1 to numbers that follow the distribution.
- A probability distribution's _support_ is the set of values the distribution can take on, plus that set's endpoints.  For example, the beta distribution's support is the closed interval [0, 1], and the normal distribution's support is the entire real line.
- The _zero-truncated Poisson_ distribution: To generate a random variate that follows this distribution (with parameter _&lambda;_ > 0), generate random variates from the [**Poisson distribution**](https://peteroupc.github.io/randomfunc.html#Poisson_Distribution) with parameter _&lambda;_ until a variate other than 0 is generated this way, then take the last generated variate.

**G families.** In general, families of the form "X-G" (such as "beta-G" (Eugene et al., 2002\)[^21]) use two distributions, X and G, where&mdash;

- X is a probability distribution whose support is the closed interval \[0, 1\], and
- G is a probability distribution that should have an easy-to-compute quantile function.

The following algorithm samples a random variate following a distribution from this kind of family:

1. Generate a random variate that follows the distribution X. (Or generate a uniform [**partially-sampled random number (PSRN)**](https://peteroupc.github.io/exporand.html) that follows the distribution X.)  Call the number _x_.
2. Calculate the quantile for G of _x_, and return that quantile. (If _x_ is a uniform PSRN, see "Random Variate Generation via Quantiles", later.)

Certain special cases of the "X-G" families, such as the following, use a specially designed distribution for X:

- The _exp-G_ family (Barreto-Souza and Simas 2010/2013)[^22], where X is an exponential distribution, truncated to the interval [0, 1], with parameter _&lambda;_ &ge; 0; step 1 is modified to read: "Generate _U_, a uniform random variate between 0 and 1, then set _x_ to &minus;ln((exp(&minus;_&lambda;_)&minus;1)\*_U_ + 1)/_&lambda;_ if _&lambda;_ != 0, and _U_ otherwise." (The _alpha power_ or _alpha power transformed_ family (Mahdavi and Kundu 2017\)[^23] uses the same distribution for X, but with _&lambda;_=&minus;ln(_&alpha;_) where _&alpha;_ is in \(0, 1\]; see also Jones (2018)[^24].)
- One family uses a shape parameter _a_ > 0; step 1 is modified to read: "Generate _u_, a uniform random variate between 0 and 1, then set _x_ to _u_<sup>1/_a_</sup>."  This family is mentioned in Lehmann (1953)[^25], Durrans (1992)[^26], and Mudholkar and Srivastava (1993\)[^27], which called it _exponentiated_.
- The _transmuted-G_ family (Shaw and Buckley 2007\)[^28]. The family uses a shape parameter _&eta;_ satisfying &minus;1 &le; _&eta;_ &le; 1; step 1 is modified to read: "Generate a piecewise linear random variate between 0 and 1 with weight 1&minus;_&eta;_ at 0 and weight 1+_&eta;_ at 1, call the number _x_. (It can be generated as follows, see also (Devroye 1986, p. 71-72\)[^4]\: With probability min(1&minus;_&eta;_, 1+_&eta;_), generate _x_, a uniform random variate between 0 and 1. Otherwise, generate two uniform random variates between 0 and 1, set _x_ to the higher of the two, then if _&eta;_ is less than 0, set _x_ to 1&minus;_x_.)". ((Granzotto et al. 2017\)[^29] mentions the same distribution, but with a parameter _&lambda;_ = _&eta;_ + 1 satisfying 0 &le; _&lambda;_ &le; 2.)
- A _cubic rank transmuted_ distribution (Granzotto et al. 2017\)[^29] uses parameters _&lambda;_<sub>0</sub> and _&lambda;_<sub>1</sub> in the interval [0, 1]; step 1 is modified to read: "Generate three uniform random variates between 0 and 1, then sort them in ascending order.  Then, choose 1, 2, or 3 with probability proportional to these weights: \[_&lambda;_<sub>0</sub>, _&lambda;_<sub>1</sub>, 3&minus;_&lambda;_<sub>0</sub>&minus;_&lambda;_<sub>1</sub>\].  Then set _x_ to the first, second, or third variate if 1, 2, or 3 is chosen this way, respectively."
- Biweight distribution (Al-Khazaleh and Alzoubi 2021)[^52]: Step 1 is modified to read: "Generate a uniform random variate _x_ in [0, 1], then with probability (1&minus;_x_<sup>2</sup>)<sup>2</sup>, go to the next step.  Otherwise, repeat this process."; or "Create a uniform PSRN _x_ with positive sign and integer part 0, then run **SampleGeometricBag** on that PSRN four times.  If the first two results are not both 1 and if the last two results are not both 1, go to the next step; otherwise, repeat this process."

**Transformed&ndash;transformer family.** In fact, the "X-G" families are a special case of the so-called "transformed&ndash;transformer" family of distributions introduced by Alzaatreh et al. (2013\)[^30] that uses two distributions, X and G, where X (the "transformed") is an arbitrary distribution with a probability density function; G (the "transformer") is a distribution with an easy-to-compute quantile function; and _W_ is a nowhere decreasing function that, among other conditions, maps a number in the closed interval [0, 1] to a number with the same support as X.  The following algorithm samples a random variate from this kind of family:

1. Generate a random variate that follows the distribution X. (Or generate a uniform PSRN that follows X.) Call the number _x_.
2. Calculate _w_ = _W_<sup>&minus;1</sup>(_x_) (where _W_<sup>&minus;1</sup>(.) is the inverse of _W_), then calculate the quantile for G of _w_ and return that quantile. (If _x_ is a uniform PSRN, see "Random Variate Generation via Quantiles", later.)

The following are special cases of the "transformed&ndash;transformer" family:

- The "T-R{_Y_}" family (Aljarrah et al., 2014\)[^31], in which _T_ is an arbitrary distribution with a PDF (X in the algorithm above), _R_ is a distribution with an easy-to-compute quantile function (G in the algorithm above), and _W_ is the quantile function for the distribution _Y_, whose support must contain the support of _T_ (so that _W_<sup>&minus;1</sup>(_x_) is the cumulative distribution function for _Y_, or the probability that a _Y_-distributed number is _x_ or less).
- Several versions of _W_ have been proposed for the case when distribution X's support is \[0, &infin;\), such as the Rayleigh and gamma distributions.  They include:
    - _W_(_x_) = &minus;ln(1&minus;_x_) (_W_<sup>&minus;1</sup>(_x_) = 1&minus;exp(&minus;_x_)).  Suggested in the original paper by Alzaatreh et al.
    - _W_(_x_) = _x_/(1&minus;_x_) (_W_<sup>&minus;1</sup>(_x_) = _x_/(1+_x_)).  Suggested in the original paper by Alzaatreh et al.  This choice forms the so-called "odd X G" family, and one example is the "odd log-logistic G" family (Gleaton and Lynch 2006\)[^32].

> **Example:** For the "generalized odd gamma-G" family (Hosseini et al. 2018\)[^33], X is the gamma(_&alpha;_) distribution, _W_<sup>&minus;1</sup>(_x_) = (_x_/(1+_x_))<sup>1/_&beta;_</sup>, G is arbitrary, _&alpha;_>0, and _&beta;_>0.

A family very similar to the "transformed&ndash;transformer" family uses a _decreasing_ _W_.

- When distribution X's support is \[0, &infin;), one such _W_ that has been proposed is _W_(_x_) = &minus;ln(_x_) (_W_<sup>&minus;1</sup>(_x_) = exp(&minus;_x_); examples include the "Rayleigh-G" family or "Rayleigh&ndash;Rayleigh" distribution (Al Noor and Assi 2020\)[^34], as well as the "generalized gamma-G" family, where "generalized gamma" refers to the Stacy distribution (Boshi et al. 2020\)[^35]).

**Minimums, maximums, and sums.** Some distributions are described as a minimum, maximum, or sum of _N_ independent random variates distributed as _X_, where _N_ &ge; 1 is an independent integer distributed as the discrete distribution _Y_.

- Tahir and Cordeiro (2016\)[^36] calls a distribution of minimums a _compound distribution_, and a distribution of maximums a _complementary compound distribution_.
- Pérez-Casany et al. (2016\)[^37] calls a distribution of minimums or of maximums a _random-stopped extreme distribution_.
- Let _S_ be a sum of _N_ variates as described above.  Then Amponsah et al. (2021)[^38] describe the distribution of (_S_, _N_), a two-variable random variate often called an _episode_.
- A distribution of sums can be called a _stopped-sum distribution_ (Johnson et al. 2005\)[^39]. (In this case, _N_ can be 0 so that _N_ &ge; 0 is an integer distributed as _Y_.)

A variate following a distribution of minimums or of maximums can be generated as follows (Duarte-López et al. 2021\)[^40]\:

1. Generate a uniform random variate between 0 and 1. (Or generate a uniform PSRN with integer part 0, positive sign, and empty fractional part.)  Call the number _x_.
2. For minimums, calculate the quantile for _X_ of 1&minus;_W_<sup>&minus;1</sup>(_x_) (where _W_<sup>&minus;1</sup>(.) is the inverse of _Y_'s probability generating function), and return that quantile.[^41] \(If _x_ is a uniform PSRN, see "Random Variate Generation via Quantiles", later.  _Y_'s probability generating function is _W_(_z_) = _a_\[0]\*_z_<sup>0</sup> + _a_\[1]\*_z_<sup>1</sup> + ..., where 0 &lt; _z_ &lt; 1 and _a_\[_i_] is the probability that a _Y_-distributed variate equals _i_.  See example below.)
3. For maximums, calculate the quantile for _X_ of _W_<sup>&minus;1</sup>(_x_), and return that quantile.

> **Examples:**
>
> | This distribution: | Is a distribution of: | Where _X_ is: | And _Y_ is: |
>  ---- | --- | --- | --- |
> | Geometric zero-truncated Poisson (Akdoğan et al., 2020\)[^42]. | Maximums. | 1 plus the number of failures before the first success, with each success having the same probability. | Zero-truncated Poisson. |
> | GMDP(_&alpha;_, _&beta;_, _&delta;_, _p_) (Amponsah et al. 2021)[^38] \(_&alpha;_>0, _&beta;_>0, _&delta;_>0, 0&lt;_p_&lt;1). | (_S_, _N_) episodes. | Gamma(_&alpha;_) variate divided by _&beta;_. | Discrete Pareto(_&delta;_, _p_) (see "Certain Distributions"). |
> | Bivariate gamma geometric(_&alpha;_, _&beta;_, _p_) (Barreto-Souza 2012)[^43] \(_&alpha;_>0, _&beta;_>0, 0&lt;_p_&lt;1). | (_S_, _N_) episodes. | Gamma(_&alpha;_) variate divided by _&beta;_. | 1 plus the number of failures before the first success, with each success having probability _p_. |
> | Exponential Poisson (Kuş 2007)[^44]. | Minimums. | Exponential. | Zero-truncated Poisson. |
> | Poisson exponential (Cancho et al. 2011)[^45]. | Maximums. | Exponential. | Zero-truncated Poisson. |
> | Right-truncated Weibull(_a_, _b_, _c_) (Jodrá 2020\)[^46] \(_a_, _b_, and _c_ are greater than 0). | Minimums. | Power function(_b_, _c_). | Zero-truncated Poisson(_a_\*_c_<sup>_b_</sup>). |
>
> **Example:** If _Y_ is zero-truncated Poisson with parameter _&lambda;_, its probability generating function is $W(z)=\frac{1-\exp(z\lambda)}{1-\exp(\lambda)}$, and solving for _x_ leads to its inverse: $W^{-1}(x)=\ln(1-x+x\times\exp(\lambda))/\lambda$.
>
> **Note:** Bivariate exponential geometric (Barreto-Souza 2012)[^43] is a special case of bivariate gamma geometric with _&alpha;_=1.

**Inverse distributions.** An _inverse X distribution_ (or _inverted X distribution_) is generally the distribution of 1 divided by a random variate distributed as _X_.  For example, an _inverse exponential_ random variate (Keller and Kamath 1982\)[^47] is 1 divided by an exponential random variate with rate 1 (and so is distributed as &minus;1/ln(_U_) where _U_ is a uniform random variate between 0 and 1) and may be multiplied by a parameter _&theta;_ > 0.

**Weighted distributions.** A _weighted X distribution_ uses a distribution X and a weight function _w_(_x_) whose values lie in [0, 1] everywhere in X's support.  The following algorithm samples from a weighted distribution (see also (Devroye 1986, p. 47\)[^4]):

1. Generate a random variate that follows the distribution X. (Or generate a uniform PSRN that follows X.) Call the number _x_.
2. With probability _w_(_x_), return _x_.  Otherwise, go to step 1.

Some weighted distributions allow any weight function _w_(_x_) whose values are nonnegative everywhere in X's support (Rao 1985\)[^48].  (If _w_(_x_) = _x_, the distribution is often called a _length-biased_ or _size-biased distribution_; if _w_(_x_) = _x_<sup>2</sup>, _area-biased_.)  Their probability density functions (PDFs) are proportional to the original PDFs multiplied by _w_(_x_).

**Inflated distributions.** To generate an _inflated X_ (also called _c-inflated X_ or _c-adjusted X_) random variate with parameters _c_ and _&alpha;_, generate&mdash;

- _c_ with probability _&alpha;_, and
- a random variate distributed as X otherwise.

For example, a _zero-inflated beta_ random variate is 0 with probability _&alpha;_ and a beta random variate otherwise (the parameter _c_ is 0) (Ospina and Ferrari 2010\)[^49]  A zero-and-one inflated X distribution is 0 or 1 with probability _&alpha;_ and distributed as X otherwise.  For example, to generate a _zero-and-one-inflated unit Lindley_ random variate (with parameters _&alpha;_, _&theta;_, and _p_) (Chakraborty and Bhattacharjee 2021\)[^50]\:

1. With probability _&alpha;_, return a number that is 0 with probability _p_ and 1 otherwise.
2. Generate a unit Lindley(_&theta;_) random variate, that is, generate _x_/(1+_x_) where _x_ is a [**Lindley(_&theta;_) random variate**](https://peteroupc.github.io/exporand.html#Lindley_Distribution_and_Lindley_Like_Mixtures).

> **Note:** A zero-inflated X distribution where X takes on 0 with probability 0 is also called a _hurdle distribution_ (Mullahy 1986)[^51].

**Unit distributions.** To generate a _unit X_ random variate (where X is a distribution whose support is the positive real line), generate a random variate distributed as X, call it _x_, then return exp(&minus;_x_) or 1 &minus;exp(&minus;_x_) (also known as "Type I" or "Type II", respectively).  For example, a unit gamma distribution is also known as the _Grassia distribution_ (Grassia 1977)[^52].

**CDF&ndash;quantile family.** Given two distributions X and Y (which can be the same), a location parameter _&mu;_ &ge; 0, and a dispersion parameter _&sigma;_>0, a variate from this family of distributions can be generated as follows (Smithson and Shou 2019\)[^42]:

1. Generate a random variate that follows the distribution X. (Or generate a uniform PSRN that follows X.) Call the number _x_.
2. If distribution X's support is the positive real line, calculate _x_ as ln(_x_).
3. Calculate _z_ as _&mu;_+_&sigma;_\*_x_.
4. If distribution Y's support is the positive real line, calculate _z_ as exp(_z_).
5. Return _H_(_z_).

In this algorithm:

- X and Y are distributions that each have support on either the whole real line or the positive real line.  However, the book intends X to have an easy-to-compute quantile function.
- _H_(_z_) is Y's _cumulative distribution function_, or the probability that a Y-distributed random variate is _z_ or less.  The book likewise intends _H_ to be easy to compute.

> **Note:** An important property for use in statistical estimation is _identifiability_.  A family of distributions is _identifiable_ if it has the property that if two parameter vectors (_&theta;_<sub>1</sub> and _&theta;_<sub>2</sub>) determine the same distribution, then _&theta;_<sub>1</sub> must equal _&theta;_<sub>2</sub>.

<a id=Certain_Distributions></a>
## Certain Distributions

In the table below, _U_ is a uniform random variate between 0 and 1, and all random variates are independently generated.

| This distribution: |  Is distributed as: | And uses these parameters: |
 --- | --- | --- |
| Power function(_a_, _c_). | _c_\*_U_<sup>1/_a_</sup>. | _a_ > 0, _c_ > 0. |
| Lehmann Weibull(_a1_, _a2_, _&beta;_) (Elgohari and Yousof 2020\)[^53]. | (ln(1/_U_)/_&beta;_)<sup>1/_a1_</sup>/_a2_ or (_E_/_&beta;_)<sup>1/_a1_</sup>/_a2_ | _a1_, _a2_, _&beta;_ > 0. _E_ is an exponential random variate with rate 1. |
| Marshall&ndash;Olkin(_&alpha;_) (Marshall and Olkin 1997\)[^54] | (1&minus;_U_)/(_U_\*(_&alpha;_&minus;1) + 1). | _&alpha;_ in [0, 1]. |
| Lomax(_&alpha;_). | (1&minus;_U_)<sup>&minus;1/_&alpha;_</sup>&minus;1. | _&alpha;_ > 0. |
| Power Lomax(_&alpha;_, _&beta;_) (Rady et al. 2016\)[^55]. | _L_<sup>1/_&beta;_</sup> | _&beta;_ > 0; _L_ is Lomax(_&alpha;_). |
| Topp&ndash;Leone(_&alpha;_). | 1&minus;sqrt(1&minus;_U_<sup>1/_&alpha;_</sup>). | _&alpha;_ > 0. |
| Bell&ndash;Touchard(_a_, _b_) (Castellares et al. 2020)[^56]. | Sum of _N_ zero-truncated Poisson(_a_) random variates, where _N_ is Poisson with parameter _b_\*exp(_a_)&minus;_b_.[^57] | _a_>0, _b_>0. |
| Bell(_a_) (Castellares et al. 2020)[^56]. | Bell&ndash;Touchard(_a_, 0). | _a_>0. |
| Discrete Pareto(_&delta;_, _p_) (Buddana and Kozubowski 2014)[^58] | 1 plus the number of failures before the first success, with each success having probability 1&minus;exp(&minus;_Z_), where _Z_ is a gamma(1/_&delta;_) variate times &minus;_&delta;_\*ln(1&minus;_p_). | _&delta;_ > 0, and 0&lt;_p_&lt;1. |
| Neyman type A(_&delta;_, _&tau;_) (Batsidis and Lemonte 2021)[^59]| Bell&ndash;Touchard(_&tau;_, _&delta;_\*exp(&minus;_&tau;_)). | _&delta;_>0, _&tau;_>0. |
| Gamma exponential (Kudryavtsev 2019)[^60]. | _&delta;_\*Gamma(_t_)<sup>1/_&nu;_</sup>/Gamma(_s_)<sup>_r_/_&nu;_</sup>, where Gamma(_x_) is a gamma(_x_) variate. | 0 &le; _r_ &lt; 1; _&nu;_ &ne; 0; _s_>0; _t_>0; _&delta;_>0. |
| Extended xgamma (Saha et al. 2019)[^61] | Gamma(_&alpha;_ + _c_) variate divided by _&theta;_, where _c_ is either 0 with probability _&theta;_/(_&theta;_+_&beta;_), or 2 otherwise. | _&theta;_>0, _&alpha;_>0, _&beta;_ &ge; 0. |
| Generalized Pareto(_a_, _b_) (McNeil et al. 2010)[^62] | _a_\*((1/(1&minus;_U_))<sup>_b_</sup>&minus;1)/_b_. | _a_>0; _b_>0. |
| Skew symmetric or symmetry-modulated (Azzalini and Capitanio 2003)[^63], (Azzalini 2022)[^64]. | _Z_ if _T_ &le; _w_(_Z_), or &minus;_Z_ otherwise. | _Z_ follows a symmetric distribution around 0; _T_ follows a symmetric distribution (not necessarily around 0). _w_(_x_) satisfies &minus;_w_(_x_) = _w_(&minus;_x_). |
| Skew normal (Azzalini 1985)[^65]. | Skew symmetric with _Z_ and _T_ both separate Normal(0, 1) variates, and _w_(_x_) = _x_\*_&alpha;_. | _&alpha;_ is a real number. |
| Logarithmic skew normal (Gómez-Déniz et al. 2020)[^66] | exp(SNE(_&lambda;_,_&lambda;_)\*_&sigma;_+_&mu;_). | _&mu;_ and _&lambda;_ are real numbers; _&sigma;_ > 0. SNE is described later. |
| Tilted beta binomial (Hahn 2022)[^67] | Binomial(_n_, Tilted-beta(_&theta;_, _v_, _&alpha;_, _&beta;_)) variate. | 0 &le; _&theta;_ &le; 1;  0 &le; _v_ &le; 1; _&alpha;_>0, _&beta;_>0; _n_ &ge; 0 is an integer. |
| Two-piece distribution (Rubio and Steel 2020)[^68]. | _&mu;_ &minus; abs(_Z_)\*_sigma1_ with probability _sigma1_/(_sigma1_+_sigma2_), or _&mu;_ + abs(_Z_)\*_sigma2_ otherwise. | _&mu;_ is a real number; _sigma1_>0; _sigma2_>0; _Z_ follows a symmetric distribution around 0. |
| Asymmetric generalized Gaussian (Tesei and Regazzoni 1996)[^69] | Two-piece distribution where _Z_ is exponential-power(_&alpha;_). | _&alpha;_>0; _&mu;_ is a real number; _sigma1_>0; _sigma2_>0. |

| This distribution: | Can be sampled with the following algorithms: | And uses these parameters: |
 --- | --- | --- |
| Offset-symmetric Gaussian (Sadeghi and Korki 2021)[^70] | (1) Generate an unbiased random bit _b_ (either 0 or 1 with equal probability); (2) generate _Y_, a Normal(0, _&sigma;_) random variate (standard deviation _&sigma;_), and if _Y_ < _m_, repeat this step; (3) return (_Y_ &minus; _m_)\*(_b_\*2 &minus; 1). | _m_>0; _&sigma;_>0. |
| Generalized skew normal (SNE(_&lambda;_,_&xi;_)) (Henze 1986)[^71] | **First algorithm:** (1) Generate _Y_ and _Z_, two Normal(0,1) variates; (2) if _Z_<_Y_\*_&lambda;_+_&xi;_, return _Y_; else go to 1. **Second algorithm:** (1) Let _il_=1/sqrt(1+_&lambda;_<sup>2</sup>); (2) Generate _Y_ and _Z_, two Normal(0,1) variates; (3) if _Y_>&minus;_&xi;_\*_il_, return _Y_\*_&lambda;_\*_il_ + _Z_; else go to 2. | _&lambda;_ and _&xi;_ are real numbers. |
| Generalized geometric (Francis-Staite and White 2022)[^72] | (1) Set _ret_ to 1; (2) with probability _&rho;_(_ret_), add 1 to _ret_ and repeat this step; otherwise, return _ret_. | 0 &le; _&rho;_(_k_) &le; 1 for each _k_. |
| Generalized Sibuya (Kozubowski and Podgórski 2018)[^73] | (1) Set _ret_ to 1; (2) with probability _&alpha;_/(_&nu;_+_ret_), return _ret_; otherwise, add 1 to _ret_ and repeat this step. | _&alpha;_ < _&nu;_ + 1, and _&nu;_ &ge; 0.[^74] |
| Himanshu (Agarwal and Pandey 2022)[^75] | (1) Set _ret_ to 0; (2) flip coin that shows heads with probability _p_, _n_ times; (3) if any flip shows 0 (tails), add 1 to _ret_ and go to 2; otherwise, return _ret_. | 0 &le; _p_ &le; 1; _n_ &ge; 1 is an integer. |
| Tilted beta (Hahn and López Martín 2005)[^76] | (1) With probability _&theta;_, return a beta(_&alpha;_, _&beta;_) variate; (2) Generate a uniform variate in (0, 1), call it _x_; (3) Flip coin that returns 1 with probability _x_, and another that returns 1 with probability _v_; (4) If both coins return 1 or both return 0, return _x_; otherwise go to step 2. | 0 &le; _&theta;_ &le; 1;  0 &le; _v_ &le; 1; _&alpha;_>0; _&beta;_>0. |

<a id=Random_Variate_Generation_via_Quantiles></a>
## Random Variate Generation via Quantiles

This note is about generating random variates from a non-discrete distribution via _inverse transform sampling_, using uniform [**partially-sampled random numbers (PSRNs)**](https://peteroupc.github.io/exporand.html).

In this section:

- A distribution's _quantile function_ (also known as _inverse cumulative distribution function_ or _inverse CDF_) is a nowhere decreasing function that maps uniform random variates greater than 0 and less than 1 to numbers that follow the distribution.
- A _uniform PSRN_ is ultimately a number that lies in an interval; it contains a sign, an integer part, and a fractional part made up of digits sampled on demand.

Take the following situation:

- Let _f_(.) be a function applied to _a_ or _b_ before calculating the quantile.
- Let _Q_(_z_) be the quantile function for the desired distribution.
- Let _x_ be a random variate in the form of a uniform PSRN, so that this PSRN will lie in the interval \[_a_, _b_\].  If _f_(_t_) = _t_ (the identity function), the PSRN _x_ must have a positive sign and an integer part of 0, so that the interval \[_a_, _b_\] is either the interval \[0, 1\] or a closed interval in \[0, 1\], depending on the PSRN's fractional part.  For example, if the PSRN is 2.147..., then the interval is \[2.147, 2.148\].
- Let _&beta;_ be the digit base of digits in _x_'s fractional part (such as 2 for binary).
- Suppose _Q_(_z_) is continuous on the open interval (_a_, _b_).

Then the following algorithm transforms that number to a random variate for the desired distribution, which comes within the desired error tolerance of _&epsilon;_ with probability 1 (see (Devroye and Gravel 2020\)[^77]):

1. Generate additional digits of _x_ uniformly at random&mdash;thus shortening the interval \[_a_, _b_\]&mdash;until a lower bound of _Q_(_f_(_a_)) and an upper bound of _Q_(_f_(_b_)) differ by no more than 2\*_&epsilon;_.  Call the two bounds _low_ and _high_, respectively.
2. Return _low_+(_high_&minus;_low_)/2.

In some cases, it may be possible to calculate the needed digit size in advance.

As one example, if _f_(_t_) = _t_ (the identity function) and the quantile function is _Lipschitz continuous_ with Lipschitz constant _L_ or less on the interval \[_a_, _b_\][^78], then the following algorithm generates a quantile with error tolerance _&epsilon;_:

1. Let _d_ be ceil((ln(max(1,_L_)) &minus; ln(_&epsilon;_)) / ln(_&beta;_)). For each digit among the first _d_ digits in _x_'s fractional part, if that digit is unsampled, set it to a digit chosen uniformly at random.
2. The PSRN _x_ now lies in the interval \[_a_, _b_\].  Calculate lower and upper bounds of _Q_(_a_) and _Q_(_b_), respectively, that are within _&epsilon;_/2 of the true quantiles, call the bounds _low_ and _high_, respectively.
3. Return _low_+(_high_&minus;_low_)/2.

This algorithm chooses a random interval of size equal to _&beta;_<sup>_d_</sup>, and because the quantile function is Lipschitz continuous, the values at the interval's bounds are guaranteed to vary by no more than 2*_&epsilon;_ (actually _&epsilon;_, but the calculation in step 2 adds an additional error of at most _&epsilon;_), which is needed to meet the tolerance _&epsilon;_ (see also Devroye and Gravel 2020[^77]).

A similar algorithm can exist even if the quantile function _Q_ is not Lipschitz continuous on the interval \[_a_, _b_\].

Specifically, if&mdash;

- _f_(_t_) = _t_ (the identity function),
- _Q_ on the interval \[_a_, _b_\] is continuous and has a minimum and maximum, and
- _Q_ on \[_a_, _b_\] admits a continuous and strictly increasing function _&omega;_(_&delta;_) as a _modulus of continuity_,

then _d_ in step 1 above can be calculated as&mdash;<br/>&nbsp;&nbsp;max(0, ceil(&minus;ln(_&omega;_<sup>&minus;1</sup>(_&epsilon;_))/ln(_&beta;_))),<br/>where _&omega;_<sup>&minus;1</sup>(_&epsilon;_) is the inverse of the modulus of continuity.  (Loosely speaking, a modulus of continuity _&omega;_(_&delta;_) gives the quantile function's maximum-minus-minimum in a window of size _&delta;_, and the inverse modulus _&omega;_<sup>&minus;1</sup>(_&epsilon;_) finds a window small enough that the quantile function differs by no more than _&epsilon;_ in the window.[^79]).[^80]

For example&mdash;

- if _Q_ is Lipschitz continuous[^78] with Lipschitz constant _L_ or less on \[_a_, _b_\], then the function is no "steeper" than that of _&omega;_(_&delta;_) = _L_\*_&delta;_, so _&omega;_<sup>&minus;1</sup>(_&epsilon;_) = _&epsilon;_/_L_, and
- if _Q_ is Hölder continuous with Hölder constant _M_ or less and Hölder exponent _&alpha;_ on that interval [^81], then the function is no "steeper" than that of _&omega;_(_&delta;_) = _M_\*_&delta;_<sup>_&alpha;_</sup>, so _&omega;_<sup>&minus;1</sup>(_&epsilon;_) = (_&epsilon;_/_M_)<sup>1/_&alpha;_</sup>.

The algorithms given earlier in this section have a disadvantage: the desired error tolerance has to be made known to the algorithm in advance. (Indeed, for this reason, the algorithms don't satisfy [**desirable properties for PSRN samplers**](https://peteroupc.github.io/exporand.html#Properties).)  To generate a quantile to any error tolerance (even if the tolerance is not known in advance), a rejection sampling approach is needed.  For this to work:

- The target distribution must have a probability density function (PDF), as is the case with the normal and exponential distributions.
- That PDF, or a function proportional to it, must be known, must be less than or equal to a finite number, and must be continuous "almost everywhere" (the set of discontinuous points is "zero-volume", that is, has Lebesgue measure zero) (see also (Devroye and Gravel 2020\)[^77]).

Here is a sketch of how this rejection sampler might work:

1. After using one of the algorithms given earlier in this section to sample digits of _x_ as needed, let _a_ and _b_ be _x_'s upper and lower bounds.  Calculate lower and upper bounds of the quantiles of _f_(_a_) and _f_(_b_) (the bounds are \[_alow_, _ahigh_\] and \[_blow_, _bhigh_\] respectively).
2. Given the target function's PDF or a function proportional to it, sample a uniform PSRN, _y_, in the interval \[_alow_, _bhigh_\] using an arbitrary-precision rejection sampler such as Oberhoff's method (described in an [**appendix to the PSRN article**](https://peteroupc.github.io/exporand.html#Oberhoff_s_Exact_Rejection_Sampling_Method)).
3. Accept _y_ (and return it) if it clearly lies in \[_ahigh_, _blow_\].  Reject _y_ (and go to the previous step) if it clearly lies outside \[_alow_, _bhigh_\].  If _y_ clearly lies in \[_alow_, _ahigh_\] or in \[_blow_, _bhigh_\], generate more digits of _x_, uniformly at random, and go to the first step.
4. If _y_ doesn't clearly fall in any of the cases in the previous step, generate more digits of _y_, uniformly at random, and go to the previous step.

<a id=Batching_Random_Samples_via_Randomness_Extraction></a>
## Batching Random Samples via Randomness Extraction

Devroye and Gravel (2020\)[^77] suggest the following randomness extractor to reduce the number of random bits needed to produce a batch of samples by a sampling algorithm.  The extractor works based on the probability that the algorithm consumes _X_ random bits given that it produces a specific output _Y_ (or _P_(_X_ | _Y_) for short):

1. Start with the interval [0, 1].
2. For each pair (_X_, _Y_) in the batch, the interval shrinks from below by _P_(_X_&minus;1 | _Y_) and from above by _P_(_X_ | _Y_). (For example, if \[0.2, 0.8\] \(range 0.6) shrinks from below by 0.1 and from above by 0.8, the new interval is \[0.2+0.1\*0.6, 0.2+0.8\*0.6] = [0.26, 0.68].  For correctness, though, the interval is not allowed to shrink to a single point, since otherwise step 3 would run forever.)
3. Extract the bits, starting from the binary point, that the final interval's lower and upper bound have in common (or 0 bits if the upper bound is 1). (For example, if the final interval is [0.101010..., 0.101110...] in binary, the bits 1, 0, 1 are extracted, since the common bits starting from the point are 101.)

After a sampling method produces an output _Y_, both _X_ (the number of random bits the sampler consumed) and _Y_ (the output) are added to the batch and fed to the extractor, and new bits extracted this way are added to a queue for the sampling method to use to produce future outputs. (Notice that the number of bits extracted by the algorithm above grows as the batch grows, so only the new bits extracted this way are added to the queue this way.)

The issue of finding _P_(_X_ | _Y_) is now discussed.  Generally, if the sampling method implements a random walk on a binary tree that is driven by unbiased random bits and has leaves labeled with one outcome each (Knuth and Yao 1976\)[^82], _P_(_X_ | _Y_) is found as follows (and Claude Gravel clarified to me that this is the intention of the extractor algorithm): Take a weighted count of all leaves labeled _Y_ up to depth _X_ (where the weight for depth _z_ is 1/2<sup>_z_</sup>), then divide it by a weighted count of all leaves labeled _Y_ at all depths (for instance, if the tree has two leaves labeled _Y_ at _z_=2, three at _z_=3, and three at _z_=4, and _X_ is 3, then _P_(_X_ | _Y_) is (2/2<sup>2</sup>+3/2<sup>3</sup>) / (2/2<sup>2</sup>+3/2<sup>3</sup>+3/2<sup>4</sup>)).  In the special case where the tree has at most 1 leaf labeled _Y_ at every depth, this is implemented by finding _P_(_Y_), or the probability to output _Y_, then chopping _P_(_Y_) up to the _X_<sup>th</sup> binary digit after the point and dividing by the original _P_(_Y_) (for instance, if _X_ is 4 and P(_Y_) is 0.101011..., then _P_(_X_ | _Y_) is 0.1010 / 0.101011...).

Unfortunately, _P_(_X_ | _Y_) is not easy to calculate when the number of values _Y_ can take on is large or even unbounded.  In this case, I can suggest the following ad hoc algorithm, which uses a randomness extractor that takes _bits_ as input, such as the von Neumann, Peres, or Zhou&ndash;Bruck extractor (see "[**Notes on Randomness Extraction**](https://peteroupc.github.io/randextract.html)").  The algorithm counts the number of bits it consumes (_X_) to produce an output, then feeds _X_ to the extractor as follows.

1. Let _z_ be abs(_X_&minus;_lastX_), where _lastX_ is either the last value of _X_ fed to this extractor for this batch or 0 if there is no such value.
2. If _z_ is greater than 0, feed the bits of _z_ from most significant to least significant to a queue of extractor inputs.
3. Now, when the sampler consumes a random bit, it checks the input queue.  As long as 64 bits or more are in the input queue, the sampler dequeues 64 bits from it, runs the extractor on those bits, and adds the extracted bits to an output queue. (The number 64 can instead be any even number greater than 2.)  Then, if the output queue is not empty, the sampler dequeues a bit from that queue and uses that bit; otherwise it generates an unbiased random bit as usual.

<a id=Sampling_Distributions_Using_Incomplete_Information></a>
## Sampling Distributions Using Incomplete Information

The Bernoulli factory problem (the problem of turning one biased coin into another biased coin; see "[**Bernoulli Factory Algorithms**](https://peteroupc.github.io/bernoulli.html)") is a special case of the problem of **sampling a probability distribution with unknown parameters**.  This problem can be described as sampling from a new distribution using an _oracle_ (black box) that produces numbers of an incompletely known distribution. In the Bernoulli factory problem, this oracle is a _coin that shows heads or tails where the probability of heads is unknown_.  The rest of this section deals with oracles that go beyond coins.

**Algorithm 1.** Suppose there is an oracle that produces independent random variates on a closed interval \[_a_, _b_\], and these numbers have an unknown mean of _&mu;_. The goal is now to produce nonnegative random variates whose expected value ("long-run average") is _f_(_&mu;_).  Unless _f_ is constant, this is possible if and only if&mdash;

- _f_ is continuous on the closed interval, and
- _f_(_&mu;_) is greater than or equal to _&epsilon;_\*min((_&mu;_ &minus; _a_)<sup>_n_</sup>, (_b_ &minus; _&mu;_)<sup>_n_</sup>) for some integer _n_ and some _&epsilon;_ greater than 0 (loosely speaking, _f_ is nonnegative and neither touches 0 in the interior of the interval nor moves away from 0 more slowly than a polynomial)

(Jacob and Thiery 2015\)[^83]. (Here, _a_ and _b_ are both rational numbers and may be less than 0.)

In the algorithm below, let _K_ be a rational number greater than the maximum value of _f_ on the closed interval [_a_, _b_], and let _g_(_&lambda;_) = _f_(_a_ + (_b_&minus;_a_)\*_&lambda;_)/_K_.

1. Create a _&lambda;_ input coin that does the following: "Take a number from the oracle, call it _x_.  With probability (_x_&minus;_a_)/(_b_&minus;_a_) (see note below), return 1.  Otherwise, return 0."
2. Run a Bernoulli factory algorithm for _g_(_&lambda;_), using the _&lambda;_ input coin.  Then return _K_ times the result.

> **Note:** The check "With probability (_x_&minus;_a_)/(_b_&minus;_a_)" is exact if the oracle produces only rational numbers.  Otherwise, calculating the probability can lead to numerical errors unless care is taken (see note 2 in "Distributions with nowhere increasing or nowhere decreasing weights", above).  With uniform partially-sampled random numbers (PSRNs), the check can be implemented as follows.  Let _x_ be a uniform PSRN representing a number generated by the oracle.  Set _y_ to **RandUniformFromReal**(_b_&minus;_a_), then the check succeeds if **RandLess**(_y_, **UniformAddRational**(_x_, &minus;_a_)) returns 1, and fails otherwise.
>
> **Example:** Suppose an oracle produces random variates in the interval [3, 13] with unknown mean _&mu;_, and the goal is to use the oracle to produce nonnegative random variates with mean _f_(_&mu;_) = &minus;319/100 + _&mu;_\*103/50 &minus; _&mu;_<sup>2</sup>*11/100, which is a polynomial with Bernstein coefficients [2, 9, 5] in the given interval.  Then since 8 is greater than the maximum of _f_ in that interval, _g_(_&lambda;_) is a degree-2 polynomial in the interval [0, 1] that has Bernstein coefficients [2/8, 9/8, 5/8].  _g_ can't be simulated as is, though, but increasing _g_'s degree to 3 leads to the Bernstein coefficients [1/4, 5/6, 23/24, 5/8], which are all less than 1 so that the following algorithm can be used (see "[**Certain Polynomials**](https://peteroupc.github.io/bernoulli.html#Certain_Polynomials)"):
>
> 1. Set _heads_ to 0.
> 2. Generate three random variates from the oracle (which must produce random variates in the interval [3, 13]).  For each number _x_: With probability (_x_&minus;3)/(10&minus;3), add 1 to _heads_.
> 3. Depending on _heads_, return 8 (that is, 1 times the upper bound) with the given probability, or 0 otherwise: _heads_=0 &rarr; probability 1/4; 1 &rarr; 5/6; 2 &rarr; 23/24; 3 &rarr; 5/8.

**Algorithm 2.** Say there is an oracle in the form of a fair die.  The number of faces of the die, _n_, is at least 2 but otherwise unknown. Each face shows a different integer 0 or greater and less than _n_.  The question arises: Which probability distributions based on the number of faces can be sampled with this oracle?  This question was studied in the French-language dissertation of R. Duvignau (2015, section 5.2\)[^84], and the following are four of these distributions.

**_Bernoulli 1/n._** It's trivial to generate a Bernoulli variate that is 1 with probability 1/_n_ and 0 otherwise: just take a number from the oracle and return either 1 if that number is 0, or 0 otherwise.  Alternatively, take two numbers from the oracle and return either 1 if both are the same, or 0 otherwise (Duvignau 2015, p. 153\)[^84].

**_Random variate with mean n._** Likewise, it's trivial to generate variates with a mean of _n_: Do "Bernoulli 1/n" trials as described above until a trial returns 0, then return the number of trials done this way.  (This is related to the ambiguously defined "geometric" random variates.)

**_Binomial with parameters n and 1/n._** Using the oracle, the following algorithm generates a binomial variate of this kind (Duvignau 2015, Algorithm 20\)[^84]\:

1. Take items from the oracle until the same item is taken twice.
2. Create a list consisting of the items taken in step 1, except for the last item taken, then shuffle that list.
3. In the shuffled list, count the number of items that didn't change position after being shuffled, then return that number.

**_Binomial with parameters n and k/n._** Duvignau 2015 also includes an algorithm (Algorithm 25) to generate a binomial variate of this kind using the oracle (where _k_ is a known integer such that 0 < _k_ and _k_ &le; _n_):

1. Take items from the oracle until _k_ different items were taken this way.  Let _U_ be a list of these _k_ items, in the order in which they were first taken.
2. Create an empty list _L_.
3. For each integer _i_ satisfying 0 &le; _i_ &lt; _k_:
    1. Create an empty list _M_.
    2. Take an item from the oracle.  If the item is in _U_ at a position **less than _i_** (positions start at 0), repeat this substep.  Otherwise, if the item is not in _M_, add it to _M_ and repeat this substep.  Otherwise, go to the next substep.
    3. Shuffle the list _M_, then add to _L_ each item that didn't change position after being shuffled (if not already present in _L_).
4. For each integer _i_ satisfying 0 &le; _i_ &lt; _k_:
    1. Let _P_ be the item at position _i_ in _U_.
    2. Take an item from the oracle.  If the item is in _U_ at position **_i_ or less** (positions start at 0), repeat this substep.
    3. If the last item taken in the previous substep is in _U_ at a position **greater than _i_**, add _P_ to _L_ (if not already present).
5. Return the number of items in _L_.

> **Note:** Duvignau proved a result (Theorem 5.2) that answers the question: Which probability distributions based on the unknown _n_ can be sampled with the oracle?[^85] The result applies to a family of (discrete) distributions with the same unknown parameter _n_, starting with either 1 or a greater integer.  Let Supp(_m_) be the set of values taken on by the distribution with parameter equal to _m_.  Then that family can be sampled using the oracle (with or without additional randomness) if and only if:

> - There is a computable function _f_(_k_) that outputs a positive number.
> - For each _n_, Supp(_n_) is included in Supp(_n_+1).
> - For every _k_ and for every _n_ &ge; 2 starting with the first _n_ for which _k_ is in Supp(_n_), the probability of seeing _k_ given parameter _n_ is at least (1/_n_)<sup>_f_(_k_)</sup>.
>
> Moreover, by Proposition 5.5 of Duvignau, a family meeting the conditions above can be sampled without additional randomness (besides the oracle) if and only if Supp(1) has no more than one element.
>
> **Example:** Let _n_&ge; 2 be an integer.<br>The family of Bernoulli distributions, taking on 1 with probability exp(&minus;_n_) and 0 otherwise, cannot be simulated this way, because that probability decays faster than the rate (1/_n_)<sup>_f_(1)</sup> for any _f_.  This is consistent with the results for _Bernoulli factories_ (Keane and O'Brien 1994)[^86], where a coin that shows heads with unknown probability _&lambda;_ = 1/_n_ cannot be turned into a coin that shows heads with probability g(_&lambda;_) = exp(&minus;1/_&lambda;_) = exp(&minus;_n_) since _g_ is not polynomially bounded (away from 0).<br>However, a Bernoulli family, taking on 1 with probability _h_(_n_) = (1+ln(_n_))/_n_ and 0 with probability 1&minus;_h_(_n_), _can_ be simulated, because min(_h_(_n_), 1&minus;_h_(_n_)) &ge; (1/_n_)<sup>3</sup>.

<a id=Additional_Algorithms></a>
### Additional Algorithms

The following algorithms are included here because they require applying an arbitrary function (such as _f_(_&lambda;_)) to a potentially irrational number.

**Algorithm 3.** Suppose there is an _oracle_ that produces independent random real numbers whose expected value ("long-run average") is a known or unknown mean. The goal is now to produce nonnegative random variates whose expected value is the mean of _f_(_X_), where _X_ is a number produced by the oracle.  This is possible whenever&mdash;

- _f_ has a finite lower bound and a finite upper bound on its domain, and
- the mean of _f_(_X_) is not less than _&delta;_, where _&delta;_ is a known rational number greater than 0.

The algorithm to achieve this goal follows (see Lee et al. 2014[^87]\)\:

1. Let _m_ be a rational number equal to or greater than the maximum value of abs(_f_(_&mu;_)) anywhere.  Create a _&nu;_ input coin that does the following: "Take a number from the oracle, call it _x_.  With probability abs(_f_(_x_))/_m_, return a number that is 1 if _f_(_x_) < 0 and 0 otherwise.  Otherwise, repeat this process."
2. Use one of the [**linear Bernoulli factories**](https://peteroupc.github.io/bernoulli.html#lambda____x___y__linear_Bernoulli_factories) to simulate 2\*_&nu;_ (2 times the _&nu;_ coin's probability of heads), using the _&nu;_ input coin, with _&#x03F5;_ = _&delta;_/_m_.  If the factory returns 1, return 0.  Otherwise, take a number from the oracle, call it _&xi;_, and return abs(_f_(_&xi;_)).

> **Example:** An example from Lee et al. (2014\)[^87].  Say the oracle produces uniform random variates in [0, 3\*_&pi;_], and let _f_(_&nu;_) = sin(_&nu;_).  Then the mean of _f_(_X_) is 2/(3\*_&pi;_), which is greater than 0 and found in SymPy by `sympy.stats.E(sin(sympy.stats.Uniform('U',0,3*pi)))`, so the algorithm can produce nonnegative random variates whose expected value ("long-run average") is that mean.
>
> **Notes:**
>
> 1. Averaging to the mean of _f_(_X_) (that is, **E**\[_f_(_X_)] where **E**\[.] means expected value or "long-run average") is not the same as averaging to _f_(_&mu;_) where _&mu;_ is the mean of the oracle's numbers (that is, _f_(**E**\[_X_])).  For example, if _X_ is 0 or 1 with equal probability, and _f_(_&nu;_) = exp(&minus;_&nu;_), then **E**\[_f_(_X_)] = exp(0) + (exp(&minus;1) &minus; exp(0))\*(1/2), and _f_(**E**\[_X_]) = _f_(1/2) = exp(&minus;1/2).
> 2. (Lee et al. 2014, Corollary 4\)[^87]\: If _f_(_&mu;_) is known to return only values in the interval [_a_, _c_], the mean of _f_(_X_) is not less than _&delta;_, _&delta;_ > _b_, and _&delta;_ and _b_ are known numbers, then Algorithm 2 can be modified as follows:
>
>     - Use _f_(_&nu;_) = _f_(_&nu;_) &minus; _b_, and use _&delta;_ = _&delta;_ &minus; _b_.
>     - _m_ is taken as max(_b_&minus;_a_, _c_&minus;_b_).
>     - When Algorithm 2 finishes, add _b_ to its return value.
> 3. The check "With probability abs(_f_(_x_))/_m_" is exact if the oracle produces only rational numbers _and_ if _f_(_x_) outputs only rational numbers.  If the oracle or _f_ can produce irrational numbers (such as numbers that follow a beta distribution or another non-discrete distribution), then calculating the probability can lead to numerical errors unless care is taken (see note 2 in "Distributions with nowhere increasing or nowhere decreasing weights", above).

**Algorithm 4.** Suppose there is an _oracle_ that produces independent random real numbers that are all greater than or equal to _a_ (which is a known rational number), whose mean (_&mu;_) is unknown.  The goal is to use the oracle to produce nonnegative random variates with mean _f_(_&mu;_).  This is possible only if _f_ is 0 or greater everywhere in the interval \[_a_, _&infin;_\) and is nowhere decreasing in that interval (Jacob and Thiery 2015\)[^83].  This can be done using the algorithm below.  In the algorithm:

- _f_(_&mu;_) must be a function that can be written as&mdash;<br>_c_[0]\*_z_<sup>0</sup> + _c_[1]\*_z_<sup>1</sup> + ...,<br>which is an infinite series where _z_ = _&mu;_&minus;_a_ and all _c_\[_i_\] are 0 or greater.
- _&psi;_ is a rational number close to 1, such as 95/100.  (The exact choice is arbitrary and can be less or greater for efficiency purposes, but must be greater than 0 and less than 1.)

The algorithm follows.

1. Set _ret_ to 0, _prod_ to 1, _k_ to 0, and _w_ to 1. (_w_ is the probability of taking _k_ or more numbers from the oracle in a single run of the algorithm.)
2. If _k_ is greater than 0: Take a number from the oracle, call it _x_, and multiply _prod_ by _x_&minus;_a_.
3. Add _c_\[_k_\]\*_prod_/_w_ to _ret_.
4. Multiply _w_ by _&psi;_ and add 1 to _k_.
5. With probability _&psi;_, go to step 2.  Otherwise, return _ret_.

Now, assume the oracle's numbers are all less than or equal to _b_ (rather than greater than or equal to _a_), where _b_ is a known rational number.  Then _f_ must be 0 or greater everywhere in (&minus;_&infin;_, _b_\] and be nowhere increasing there (Jacob and Thiery 2015\)[^83], and the algorithm above can be used with the following modifications: (1) In the note on the infinite series, _z_ = _b_ &minus;_&mu;_; (2) in step 2, multiply _prod_ by _b_ &minus; _x_ rather than _x_ &minus; _a_.

> **Note:** This algorithm is exact if the oracle produces only rational numbers _and_ if all _c_\[_i_\] are rational numbers.  Otherwise, the algorithm can introduce numerical errors unless care is taken (see note 2 in "Distributions with nowhere increasing or nowhere decreasing weights", above).  See also note 3 on the previous algorithm.

<a id=Acknowledgments></a>
## Acknowledgments

Due to a suggestion by Michael Shoemate who suggested it was "easy to get lost" in this and related articles, some sections that related to geometric distributions were moved here.  He also noticed a minor error which was corrected.

<a id=Notes></a>
## Notes

[^1]: K. Bringmann, F. Kuhn, et al., “Internal DLA: Efficient Simulation of a Physical Growth Model.” In: _Proc. 41st International Colloquium on Automata, Languages, and Programming (ICALP'14)_, 2014.

[^2]: "_x_ is odd" means that _x_ is an integer and not divisible by 2.  This is true if _x_ &minus; 2\*floor(_x_/2) equals 1, or if _x_ is an integer and the least significant bit of abs(_x_) is 1.

[^3]: choose(_n_, _k_) = (1\*2\*3\*...\*_n_)/((1\*...\*_k_)\*(1\*...\*(_n_&minus;_k_))) =  _n_!/(_k_! * (_n_ &minus; _k_)!) is a _binomial coefficient_, or the number of ways to choose _k_ out of _n_ labeled items.  It can be calculated, for example, by calculating _i_/(_n_&minus;_i_+1) for each integer _i_ in the interval \[_n_&minus;_k_+1, _n_\], then multiplying the results (Yannis Manolopoulos. 2002. "[**Binomial coefficient computation: recursion or iteration?**](https://doi.org/10.1145/820127.820168)", SIGCSE Bull. 34, 4 (December 2002), 65–67).  Note that for every _m_>0, choose(_m_, 0) = choose(_m_, _m_) = 1 and choose(_m_, 1) = choose(_m_, _m_&minus;1) = _m_; also, in this document, choose(_n_, _k_) is 0 when _k_ is less than 0 or greater than _n_.

[^4]: Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.

[^5]: R. Schumacher, "[**Rapidly Convergent Summation Formulas involving Stirling Series**](https://arxiv.org/abs/1602.00336v1)", arXiv:1602.00336v1 [math.NT], 2016.

[^6]: Farach-Colton, M. and Tsai, M.T., 2015. Exact sublinear binomial sampling. _Algorithmica_ 73(4), pp. 637-651.

[^7]: Bringmann, K., and Friedrich, T., 2013, July. Exact and efficient generation of geometric random variates and random graphs, in _International Colloquium on Automata, Languages, and Programming_ (pp. 267-278).

[^8]: "_x_ is even" means that _x_ is an integer and divisible by 2.  This is true if _x_ &minus; 2\*floor(_x_/2) equals 0, or if _x_ is an integer and the least significant bit of abs(_x_) is 0.

[^9]: Ghosh, A., Roughgarden, T., and Sundararajan, M., "Universally Utility-Maximizing Privacy Mechanisms", _SIAM Journal on Computing_ 41(6), 2012.

[^10]: Li, L., 2021. Bayesian Inference on Ratios Subject to Differentially Private Noise (Doctoral dissertation, Duke University).

[^11]: Canonne, C., Kamath, G., Steinke, T., "[**The Discrete Gaussian for Differential Privacy**](https://arxiv.org/abs/2004.00010)", arXiv:2004.00010 [cs.DS], 2020.

[^12]: Chewi, Sinho, Patrik R. Gerber, Chen Lu, Thibaut Le Gouic, and Philippe Rigollet. "[**Rejection sampling from shape-constrained distributions in sublinear time**](https://proceedings.mlr.press/v151/chewi22a.html)." In International Conference on Artificial Intelligence and Statistics, pp. 2249-2265. PMLR, 2022.

[^13]: Hans-J. Boehm. 1987. Constructive Real Interpretation of Numerical Programs. In Proceedings of the SIGPLAN ’87 Symposium on Interpreters and Interpretive Techniques. 214-221

[^14]: Boehm, Hans-J. "Towards an API for the real numbers." In Proceedings of the 41st ACM SIGPLAN Conference on Programming Language Design and Implementation, pp. 562-576. 2020.

[^15]: Huijben, I.A., Kool, W., Paulus, M.B. and Van Sloun, R.J., 2022. A Review of the Gumbel-max Trick and its Extensions for Discrete Stochasticity in Machine Learning. IEEE Transactions on Pattern Analysis and Machine Intelligence.  Also in [**https://arxiv.org/pdf/2110.01515**](https://arxiv.org/pdf/2110.01515)

[^16]: Or as &minus;ln(_E_), where _E_ is an exponential random variate with rate 1.

[^17]: Tillé, Y., "Remarks on some misconceptions about unequal probability sampling without replacement", Computer Science Review 47 (Feb. 2023).

[^18]: Chakraborty, A., Vardeman, S. B., Modeling and inference for mixtures of simple symmetric exponential families of p-dimensional distributions for vectors with binary coordinates, Stat Anal Data Min: The ASA Data Sci Journal. 2021; 14: 352– 365. [**https://doi.org/10.1002/sam.11528**](https://doi.org/10.1002/sam.11528)

[^19]: Ahmad, Z. et al. "Recent Developments in Distribution Theory: A Brief Survey and Some New Generalized Classes of distributions." Pakistan Journal of Statistics and Operation Research 15 (2019): 87-110.

[^20]: Jones, M. C. "On families of distributions with shape parameters." International Statistical Review 83, no. 2 (2015): 175-192.

[^21]: Eugene, N., Lee, C., Famoye, F., "Beta-normal distribution and its applications", _Commun. Stat. Theory Methods_ 31, 2002.

[^22]: Barreto-Souza, Wagner and Alexandre B. Simas. "The exp-G family of probability distributions." _Brazilian Journal of Probability and Statistics_ 27, 2013.  Also in arXiv:1003.1727v1 [stat.ME], 2010.

[^23]: Mahdavi, Abbas, and Debasis Kundu. "A new method for generating distributions with an application to exponential distribution." _Communications in Statistics -- Theory and Methods_ 46, no. 13 (2017): 6543-6557.

[^24]: M. C. Jones. Letter to the Editor concerning “A new method for generating distributions with an application to exponential distribution” and “Alpha power Weibull distribution: Properties and applications”, _Communications in Statistics - Theory and Methods_ 47 (2018).

[^25]: Lehmann, E.L., "The power of rank tests", Annals of Mathematical Statistics 24(1), March 1953.

[^26]: Durrans, S.R., "Distributions of fractional order statistics in hydrology", Water Resources Research 28 (1992).

[^27]: Mudholkar, G. S., Srivastava, D. K., "Exponentiated Weibull family for analyzing bathtub failure-rate data", _IEEE Transactions on Reliability_ 42(2), 299-302, 1993.

[^28]: Shaw, W.T., Buckley, I.R.C., "The alchemy of probability distributions: Beyond Gram-Charlier expansions, and a skew-kurtotic-normal distribution from a rank transmutation map", 2007.

[^29]: Granzotto, D.C.T., Louzada, F., et al., "Cubic rank transmuted distributions: inferential issues and applications", _Journal of Statistical Computation and Simulation_, 2017.

[^30]: Alzaatreh, A., Famoye, F., Lee, C., "A new method for generating families of continuous distributions", _Metron_ 71:63–79 (2013).

[^31]: Aljarrah, M.A., Lee, C. and Famoye, F., "On generating T-X family of distributions using quantile functions", Journal of Statistical Distributions and Applications,1(2), 2014.

[^32]: Gleaton, J.U., Lynch, J. D., "Properties of generalized log-logistic families of lifetime distributions", _Journal of Probability and Statistical Science_ 4(1), 2006.

[^33]: Hosseini, B., Afshari, M., "The Generalized Odd Gamma-G Family of Distributions:  Properties and Applications", _Austrian Journal of Statistics_ vol. 47, Feb. 2018.

[^34]: N.H. Al Noor and N.K. Assi, "Rayleigh-Rayleigh Distribution: Properties and Applications", _Journal of Physics: Conference Series_ 1591, 012038 (2020).  The underlying Rayleigh distribution uses a parameter _&theta;_ (or _&lambda;_), which is different from _Mathematica_'s parameterization with _&sigma;_ = sqrt(1/_&theta;_<sup>2</sup>) = sqrt(1/_&lambda;_<sup>2</sup>).  The first Rayleigh distribution uses _&theta;_ and the second, _&lambda;_.

[^35]: Boshi, M.A.A., et al., "Generalized Gamma – Generalized Gompertz Distribution", _Journal of Physics: Conference Series_ 1591, 012043 (2020).

[^36]: Tahir, M.H., Cordeiro, G.M., "Compounding of distributions: a survey and new generalized classes", _Journal of Statistical Distributions and Applications_ 3(13), 2016.

[^37]: Pérez-Casany, M., Valero, J., and Ginebra, J. (2016). Random-Stopped Extreme distributions. International Conference on Statistical Distributions and Applications.

[^38]: Amponsah, C.K., Kozubowski, T.J. & Panorska, A.K. A general stochastic model for bivariate episodes driven by a gamma sequence. J Stat Distrib App 8, 7 (2021). [**https://doi.org/10.1186/s40488-021-00120-5**](https://doi.org/10.1186/s40488-021-00120-5)

[^39]: Johnson, N. L., Kemp, A. W., and Kotz, S. (2005). Univariate discrete distributions.

[^40]: Duarte-López, A., Pérez-Casany, M. and Valero, J., 2021. Randomly stopped extreme Zipf extensions. Extremes, pp.1-34.

[^41]: This is simplified from the paper because _Y_ can take on only values greater than 0 so that the probability of getting 0 is 0.

[^42]: Akdoğan, Y., Kus, C., et al., "Geometric-Zero Truncated Poisson Distribution: Properties and Applications", _Gazi University Journal of Science_ 32(4), 2019.

[^43]: Barreto-Souza, W.: "Bivariate gamma-geometric law and its induced Lévy process", Journal of Multivariate Analysis 109 (2012).

[^44]: Kuş, C., "A new lifetime distribution", _Computational Statistics & Data Analysis_ 51 (2007).

[^45]: Cancho, Vicente G., Franscisco Louzada-Neto, and Gladys DC Barriga. "The Poisson-exponential lifetime distribution." Computational Statistics & Data Analysis 55, no. 1 (2011): 677-686.

[^46]: Jodrá, P., "A note on the right truncated Weibull distribution and the minimum of power function distributions", 2020.

[^47]: Keller, A.Z., Kamath A.R., "Reliability analysis of CNC machine tools", _Reliability Engineering_ 3 (1982).

[^48]: Rao, C.R., "Weighted distributions arising out of methods of ascertainment", 1985.

[^49]: Ospina, R., Ferrari, S.L.P., "Inflated Beta Distributions", 2010.

[^50]: Chakraborty, S., Bhattacharjee, S., "[**Modeling proportion of success in high school leaving examination- A comparative study of Inflated Unit Lindley and Inflated Beta distribution**](https://arxiv.org/abs/2103.08916)", arXiv:2103.08916 [stat.ME], 2021.

[^51]: Mullahy, J., "Specification and testing of some modified count data models", 1986.

[^52]: Grassia, A., "On a family of distributions with argument between 0 and 1 obtained by transformation of the gamma and derived compound distributions", _Australian Journal of Statistics_, 1977.

[^53]: Elgohari, Hanaa, and Haitham Yousof. "New Extension of Weibull Distribution: Copula, Mathematical Properties and Data Modeling." Stat., Optim. Inf. Comput., Vol.8, December 2020.

[^54]: Marshall, A.W. and Olkin, I., 1997. A new method for adding a parameter to a family of distributions with application to the exponential and Weibull families. Biometrika, 84(3), pp.641-652.

[^55]: Rady,  E.H.A.,  Hassanein,  W.A.,  Elhaddad,  T.A., "The power Lomax distribution with an application to bladder cancer data", (2016).

[^56]: Castellares, F., Lemonte, A.J., Moreno, G., "On the two-parameter Bell-Touchard discrete distribution", _Communications in Statistics
    - Theory and Methods_ 4, (2020).

[^57]: The similar Bell&ndash;Touchard process is the sum of the first _N_ variates from an infinite sequence of zero-truncated Poisson(_a_) random variates, where _N_ is the number of events of a Poisson process with rate _b_\*exp(_a_)&minus;_b_ (Freud, T., Rodriguez, P.M., "[**The Bell-Touchard counting process**](https://arxiv.org/abs/2203.16737v2)", arXiv:2203.16737v2 [math.PR], 2022).

[^58]: Buddana, Amrutha, and Tomasz J. Kozubowski. "Discrete Pareto distributions." Economic Quality Control 29, no. 2 (2014): 143-156.

[^59]: Batsidis, A., Lemonte, A.J., "On Goodness-of-Fit Tests for the Neyman Type A Distribution", REVSTAT-Statistical Journal (accepted Nov. 2021).

[^60]: Kudryavtsev, A.A., "On the representation of gamma-exponential and generalized negative binomial distributions", Inform. Appl. 13 (2019)

[^61]: Saha, M., et al., "[**The extended xgamma distribution**](https://arxiv.org/abs/1909.01103)", arXiv:1909.01103 [math.ST], 2019.

[^62]: McNeil, et al., "Quantitative risk management", 2010.

[^63]: Azzalini, A., Capitanio, A., "Distributions generated by perturbation of symmetry with emphasis on a multivariate skew t‐distribution." Journal of the Royal Statistical Society: Series B (Statistical Methodology) 65, no. 2 (2003): 367-389.

[^64]: Azzalini, A., "An overview on the progeny of the skew-normal family&mdash; A personal perspective", Journal of Multivariate Analysis 188, March 2022.

[^65]: Azzalini, Adelchi. "A class of distributions which includes the normal ones." Scandinavian journal of statistics (1985): 171-178.

[^66]: Gómez-Déniz, Emilio, and E. Calderín-Ojeda. "[**On the usefulness of the logarithmic skew normal distribution for describing claims size data**](https://www.hindawi.com/journals/mpe/2020/1420618/)." Mathematical Problems in Engineering 2020 (2020). Lin and Stoyanov (2009, "The logarithmic skew-normal distributions are moment-indeterminate", _Journal of Applied Probability_ 46) studied the logarithmic skew normal distribution with _&mu;_=0 and _&sigma;_=1.

[^67]: Hahn, Eugene D. "The Tilted Beta-Binomial Distribution in Overdispersed Data: Maximum Likelihood and Bayesian Estimation." Journal of Statistical Theory and Practice 16, no. 3 (2022): 1-22.

[^68]: Rubio, F.J. and Steel, M.F.J. (2020), The family of two-piece distributions. Significance, 17: 12-13. [**https://doi.org/10.1111/j.1740-9713.2020.01352.x**](https://doi.org/10.1111/j.1740-9713.2020.01352.x)

[^69]: A. Tesei and C. S. Regazzoni, “The asymmetric generalized Gaussian function: a new HOS-based model for generic noise PDFs,” in Proceedings of 8th Workshop on Statistical Signal and Array Processing, Corfu, Greece, Jun. 1996, pp. 210-213

[^70]: Sadeghi, Parastoo, and Mehdi Korki. "Offset-Symmetric Gaussians for Differential Privacy." arXiv preprint arXiv:2110.06412 (2021).

[^71]: Henze, Norbert. "A probabilistic representation of the 'skew-normal' distribution." Scandinavian journal of statistics (1986): 271-275. SNE(_&lambda;_,0) is distributed as Azzalini's skew normal distribution.

[^72]: Francis-Staite, Kelli, and Langford White. "[**Analysis of sojourn time distributions for semi-Markov models**](https://arxiv.org/abs/2206.10865)", arXiv:2206.10865 (2022).

[^73]: Kozubowski, Tomasz J., and Krzysztof Podgórski. "A generalized Sibuya distribution." Annals of the Institute of Statistical Mathematics 70, no. 4 (2018): 855-887.

[^74]: If _&nu;_ = 0, this is the ordinary Sibuya distribution.

[^75]: Agarwal, A., Pandey, H., "Himanshu distribution and its applications", Bulletin of Mathematics and Statistics Research 10(4), 2022.

[^76]: Hahn, E.D., López Martín, M.d.M., "Robust project management with the tilted beta distribution", 2015.

[^77]: Devroye, L., Gravel, C., "[**Random variate generation using only finitely many unbiased, independently and identically distributed random bits**](https://arxiv.org/abs/1502.02539v6)", arXiv:1502.02539v6  [cs.IT], 2020.

[^78]: A Lipschitz continuous function, with Lipschitz constant _L_, is a continuous function such that _f_(_x_) and _f_(_y_) are no more than _L_\*_&epsilon;_ apart whenever _x_ and _y_ are points in the domain that are no more than _&epsilon;_ apart.  Roughly speaking, the function's slope is no "steeper" than that of _L_\*_x_.

[^79]: Ker-I Ko makes heavy use of the inverse modulus of continuity in his complexity theory, for example, "Computational complexity of roots of real functions." In _30th Annual Symposium on Foundations of Computer Science_, pp. 204-209. IEEE Computer Society, 1989.

[^80]: Here is a sketch of the proof: Because the quantile function _Q_(_x_) is continuous on a closed interval, it's uniformly continuous there.  For this reason, there is a positive function _&omega;_<sup>&minus;1</sup>(_&epsilon;_) such that _Q_(_x_) is less than _&epsilon;_-away from _Q_(_y_), for every _&epsilon;_&gt;0, whenever _x_ and _y_ lie in that interval and whenever _x_ is less than _&omega;_<sup>&minus;1</sup>(_&epsilon;_)-away from _y_.  The inverse modulus of continuity is one such function, which is formed by inverting a modulus of continuity admitted by _Q_, as long as that modulus is continuous and strictly increasing on that interval to make that modulus invertible.  Finally, max(0, ceil(&minus;ln(_z_)/ln(_&beta;_))) is an upper bound on the number of base-_&beta;_ fractional digits needed to store 1/_z_ with an error of at most _&epsilon;_.

[^81]: A [**_Hölder continuous_**](https://en.wikipedia.org/wiki/Hölder_condition) function  (with _M_ being the _Hölder constant_ and _&alpha;_ being the _Hölder exponent_) is a continuous function _f_ such that _f_(_x_) and _f_(_y_) are no more than _M_\*_&delta;_<sup>_&alpha;_</sup> apart whenever _x_ and _y_ are in the function's domain and no more than _&delta;_ apart.<br>Here, _&alpha;_ satisfies 0 &lt; _&alpha;_ &le; 1.<br>Roughly speaking, the function's "steepness" is no greater than that of _M_\*_x_<sup>_&alpha;_</sup>.

[^82]: Knuth, Donald E. and Andrew Chi-Chih Yao. "The complexity of nonuniform random number generation", in _Algorithms and Complexity: New Directions and Recent Results_, 1976.

[^83]: Jacob, P.E., Thiery, A.H., "On nonnegative unbiased estimators", Ann. Statist., Volume 43, Number 2 (2015), 769-784.

[^84]: Duvignau, R., 2015. Maintenance et simulation de graphes aléatoires dynamiques (Doctoral dissertation, Université de Bordeaux).

[^85]: There are many distributions that can be sampled using the oracle, by first generating unbiased random bits via randomness extraction methods, but then these distributions won't use the unknown number of faces in general.  Duvignau proved Theorem 5.2 for an oracle that outputs _arbitrary_ but still distinct items, as opposed to integers, but this case can be reduced to the integer case (see section 4.1.3).

[^86]: Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.

[^87]: Lee, A., Doucet, A. and Łatuszyński, K., 2014. "[**Perfect simulation using atomic regeneration with application to Sequential Monte Carlo**](https://arxiv.org/abs/1407.5770v1)", arXiv:1407.5770v1  [stat.CO].

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
