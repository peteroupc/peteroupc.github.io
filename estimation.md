# Randomized Estimation Algorithms

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

Suppose we have an endless stream of numbers, each generated at random and independently from each other, and we can sample as many numbers from the stream as we want.  These numbers are called _random variates_.  This page presents general-purpose algorithms for estimating the mean value ("long-run average") of those variates, or estimating the mean value of a function of those numbers.  The estimates are either _unbiased_ (they have no systematic bias from the true mean value), or they come close to the true value with a user-specified error tolerance.

The algorithms are described to make them easy to implement by programmers.

Not yet covered are unbiased mean estimation algorithms that take a sequence of estimators that get better and better at estimating the desired mean (for example, estimators that average an increasing number of sample points).  See, for example, Vihola (2018\)[^1].

<a id=Concepts></a>
## Concepts

The following concepts are used in this document.

Each algorithm takes a stream of independent random variates (numbers).  These variates follow a _probability distribution_ or simply _distribution_, or a rule that says which kinds of numbers are more likely to occur than others.  A distribution has the following properties.

- The _expectation_, _expected value_, or _mean_ is the "long-run average" value of the distribution.  It is expressed as **E**\[_X_\], where _X_ is a number taken from the stream.  If we take independent random samples and then take their average, then with probability 1, the average will approach the expected value as _n_ gets large (the _law of large numbers_).
- An _n<sup>th</sup> moment_ is the expected value of _X_<sup>_n_</sup>.  In other words, take random samples, raise them to the power _n_, then take their average.  Then with probability 1, the average approaches the _n_<sup>th</sup> moment as _n_ gets large.
- An _n<sup>th</sup> central moment (about the mean)_ is the expected value of (_X_ &minus; _&mu;_)<sup>_n_</sup>, where _&mu;_ is the distribution's mean.  The 2nd central moment is called _variance_.
- An _n<sup>th</sup> central absolute moment_ (c.a.m.) is the expected value of abs(_X_ &minus; _&mu;_)<sup>_n_</sup>, where _&mu;_ is the distribution's mean.  This is the same as the central moment when _n_ is even.

Some distributions don't have an _n_<sup>th</sup> moment for a particular _n_.  This usually means the _n_<sup>th</sup> power of the stream's numbers varies so wildly that it can't be estimated accurately.  If a distribution has an _n_<sup>th</sup> moment, it also has a _k_<sup>th</sup> moment for any _k_ in the interval [1, _n_).

For any estimation algorithm, the _relative error_ is abs(_est_/_trueval_) &minus; 1, where _est_ is the estimate and _trueval_ is the true expected value.

<a id=A_Relative_Error_Algorithm_for_a_Bernoulli_Stream></a>
## A Relative-Error Algorithm for a Bernoulli Stream

The following algorithm from Huber (2017\)[^2] estimates the probability that a stream of random zeros and ones produces the number 1.  The algorithm's relative error is independent of that probability, however, and the algorithm produces _unbiased_ estimates.  Specifically, the stream of numbers has the following properties:

- The stream produces only zeros and ones (that is, the stream follows the **Bernoulli distribution**).
- The stream of numbers can't take on the value 0 with probability 1.
- The stream's mean (expected value) is unknown.

The algorithm, also known as _Gamma Bernoulli Approximation Scheme_, has the following parameters:

- _&epsilon;_, _&delta;_: Both parameters must be greater than 0, and _&epsilon;_ must be 3/4 or less, and _&delta;_ must be less than 1.

With this algorithm, the relative error will be no greater than _&epsilon;_ with probability 1 &minus; _&delta;_ or greater.  However, the estimate can be higher than 1 with probability greater than 0.

The algorithm, called **Algorithm A** in this document, follows.

1. Calculate the minimum number of samples _k_.  There are two suggestions.  The simpler one is _k_ = ceil(&minus;6\*ln(2/_&delta;_)/(_&epsilon;_<sup>2</sup>\*(4\*_&epsilon;_&minus;3))).  A more complicated one is the smallest integer _k_ such that gammainc(_k_,(_k_&minus;1)/(1+_&epsilon;_)) + (1 &minus; gammainc(_k_,(_k_&minus;1)/(1&minus;_&epsilon;_))) &le; _&delta;_, where gammainc is the regularized lower incomplete gamma function.
2. Take samples from the stream until _k_ 1's are taken this way.  Let _r_ be the total number of samples taken this way.
3. Generate _g_, a gamma random variate with shape parameter _r_ and scale 1, then return (_k_&minus;1)/_g_.

> **Notes**:
>
> 1. As noted in Huber 2017, if we have a stream of random variates that take on values in the interval [0, 1], but have unknown mean, we can transform each number by&mdash;
>
>    1. generating a uniform(0, 1) random variate _u_, then
>    2. changing that number to 1 if _u_ is less than that number, or 0 otherwise,
>
>    and we can use the new stream of zeros and ones in the algorithm to get an unbiased estimate of the unknown mean.
> 2. As can be seen in Feng et al. (2016\)[^3], the following is equivalent to steps 2 and 3 of _Algorithm A_: "Let G be 0. Do this _k_ times: 'Flip a coin until it shows heads, let _r_ be the number of flips (including the last), generate a gamma random variate with shape parameter _r_ and scale 1, and add that variate to G.' The estimated probability of heads is then (_k_&minus;1)/G.", and the following is likewise equivalent if the stream of random variates follows a (zero-truncated) "geometric" distribution with unknown mean: "Let G be 0. Do this _k_ times: 'Take a sample from the stream, call it _r_, generate a gamma random variate with shape parameter _r_ and scale 1, and add that variate to G.' The estimated mean is then (_k_&minus;1)/G." (This is with the understanding that the geometric distribution is defined differently in different academic works.)  The geometric algorithm produces unbiased estimates just like _Algorithm A_.
> 3. The generation of a gamma random variate and the division by that variate can cause numerical errors in practice, such as rounding and cancellations, unless care is taken.

<a id=A_Relative_Error_Algorithm_for_a_Bounded_Stream></a>
## A Relative-Error Algorithm for a Bounded Stream

The following algorithm comes from Huber and Jones (2019\)[^4]; see also Huber (2017\)[^5].  It estimates the expected value of a stream of random variates with the following properties:

- The numbers in the stream lie in the closed interval [0, 1].
- The stream of numbers can't take on the value 0 with probability 1.
- The stream's mean (expected value) is unknown.

The algorithm has the following parameters:

- _&epsilon;_, _&delta;_: Both parameters must be greater than 0, and _&epsilon;_ must be 1/8 or less, and _&delta;_ must be less than 1.

With this algorithm, the relative error will be no greater than _&epsilon;_ with probability 1 &minus; _&delta;_ or greater.  However, the estimate has a nonzero probability of being higher than 1.

This algorithm is not guaranteed to produce unbiased estimates.

The algorithm, called **Algorithm B** in this document, follows.

1. Set _k_ to ceil(2\*ln(6/_&delta;_)/_&epsilon;_<sup>2/3</sup>).
2. Set _b_ to 0 and _n_ to 0.
3. (Stage 1: Modified gamma Bernoulli approximation scheme.) While _b_ is less than _k_:
    1. Add 1 to _n_.
    2. Take a sample from the stream, call it _s_.
    3. With probability _s_ (for example, if a newly generated uniform(0, 1) random variate is less than _s_), add 1 to _b_.
4. Set _gb_ to _k_ + 2, then generate a gamma random variate with shape parameter _n_ and scale 1, then divide _gb_ by that variate.
5. (Find the sample size for the next stage.) Set _c1_ to 2\*ln(3/_&delta;_).
6. Generate a Poisson random variate with mean _c1_/(_&epsilon;_\*_gb_), call it _n_.
7. Run the standard deviation sub-algorithm (given later) _n_ times.  Set _A_ to the number of 1's returned by that sub-algorithm this way.
8. Set _csquared_ to (_A_ / _c1_ + 1 / 2 + sqrt(_A_ / _c1_ + 1 / 4)) * (1 + _&epsilon;_<sup>1 / 3</sup>)<sup>2</sup>\*_&epsilon;_/_gb_.
9. Set _n_ to ceil((2\*ln(6/_&delta;_)/_&epsilon;_<sup>2</sup>)/(1&minus;_&epsilon;_<sup>1/3</sup>)), or an integer greater than this.
10. (Stage 2: Light-tailed sample average.)  Set _e0_ to _&epsilon;_<sup>1/3</sup>.
11. Set _mu0_ to _gb_/(1&minus;_e0_<sup>2</sup>).
12. Set _alpha_ to _&epsilon;_/(_csquared_\*_mu0_).
13. Set _w_ to _n_\*_mu0_.
14. Do the following _n_ times:
    1. Get a sample from the stream, call it _g_.  Set _s_ to _alpha_\*(_g_&minus;_mu0_).
    2. If _s_&ge;0, add ln(1+_s_+_s_\*_s_/2)/_alpha_ to _w_.  Otherwise, subtract ln(1&minus;_s_+_s_\*_s_/2)/_alpha_ from _w_.
15. Return _w_/_n_.

The standard deviation sub-algorithm follows.

1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return 0.
2. Get two samples from the stream, call them _x_ and _y_.
3. Generate a uniform(0, 1) random variate, call it _u_.
4. If _u_ is less than (_x_&minus;_y_)<sup>2</sup>, return 1.  Otherwise, return 0.

> **Notes:**
>
> 1. As noted in Huber and Jones, if the stream of random variates takes on values in the interval [0, _m_], where _m_ is a known number, we can divide the stream's numbers by _m_ before using them in _Algorithm B_, and the algorithm will still work.
> 2. While this algorithm is exact in theory (assuming computers can store real numbers of any precision), practical implementations of it can cause numerical errors, such as rounding and cancellations, unless care is taken.

<a id=An_Absolute_Error_Adaptive_Algorithm></a>
## An Absolute-Error Adaptive Algorithm

The following algorithm comes from Kunsch et al. (2019\)[^6].  It estimates the mean of a stream of random variates with the following properties:

- The distribution of numbers in the stream has a finite _q_<sup>th</sup> c.a.m. and _p_<sup>th</sup> c.a.m.
- The exact _q_<sup>th</sup> c.a.m. and _p_<sup>th</sup> c.a.m. need not be known in advance.
- The _q_<sup>th</sup> c.a.m.'s _q_<sup>th</sup> root divided by the _p_<sup>th</sup> c.a.m.'s _p_<sup>th</sup> root is no more than _&kappa;_, where _&kappa;_ is 1 or greater. (The _q_<sup>th</sup> c.a.m.'s _q_<sup>th</sup> root is also known as _standard deviation_ if _q_ = 2, and _mean deviation_ if _q_ = 1; similarly for _p_.)

The algorithm works by first estimating the _p_<sup>th</sup> c.a.m. of the stream, then using the estimate to determine a sample size for the next step, which actually estimates the stream's mean.

This algorithm is not guaranteed to produce unbiased estimates.

The algorithm has the following parameters:

- _&epsilon;_, _&delta;_: Both parameters must be greater than 0, and _&delta;_ must be less than 1.  The algorithm will return an estimate within _&epsilon;_ of the true expected value with probability 1 &minus; _&delta;_ or greater, and the estimate will not go beyond the bounds of the stream's numbers.  The algorithm is not guaranteed to maintain a finite mean squared error or expected error in its estimates.
- _p_: The degree of the _p_<sup>th</sup> c.a.m. that the algorithm will estimate to determine the mean.
- _q_: The degree of the _q_<sup>th</sup> c.a.m.  _q_ must be greater than _p_.
- _&kappa;_: Maximum value allowed for the following value: the _q_<sup>th</sup> c.a.m.'s  _q_<sup>th</sup> root divided by the _p_<sup>th</sup> c.a.m.'s _p_<sup>th</sup> root.  (If _p_ = 2 and _q_ = 4, this is the maximum value allowed for the kurtosis's 4th root (Hickernell et al. 2012\)[^7] [^8].) _&kappa;_ may not be less than 1.

Both _p_ and _q_ must be 1 or greater and are usually integers.

For example:

- With parameters _p_ = 2, _q_ = 4, _&epsilon;_ = 1/10, _&delta;_ = 1/16, _&kappa;_ = 1.1, the algorithm assumes the stream's numbers are distributed so that the kurtosis's 4th root, that is, the 4th c.a.m.'s 4th root (_q_=4) divided by the standard deviation (_p_=2), is no more than 1.1 (or alternatively, the kurtosis is no more than 1.1<sup>4</sup> = 1.4641), and will return an estimate that's within 1/10 of the true mean with probability at least (1 &minus; 1/16) or 15/16.
- With parameters _p_ = 1, _q_ = 2, _&epsilon;_ = 1/10, _&delta;_ = 1/16, _&kappa;_ = 2, the algorithm assumes the stream's numbers are distributed so that the standard deviation (_q_=2) divided by the mean deviation (_p_=1) is no more than 2, and will return an estimate that's within 1/10 of the true mean with probability at least (1 &minus; 1/16) or 15/16.

The algorithm, called **Algorithm C** in this document, follows.

1. If _&kappa;_ is 1:
    1. Set _n_ to ceil(ln(1/_&delta;_)/ln(2))+1 (or an integer greater than this).
    2. Get _n_ samples from the stream and return (_mn_ + _mx_)/2, where _mx_ is the highest sample and _mn_ is the lowest.
2. Set _k_ to ceil((2*ln(1/_&delta;_))/ln(4/3)).  If _k_ is even, add 1 to _k_.
3. Set _kp_ to _k_.
4. Set _&kappa;_ to _&kappa;_<sup>(_p_\*_q_/(_q_&minus;_p_))</sup>.
5. If _q_ is 2 or less:
    - Set _m_ to ceil(3\*_&kappa;_\*48<sup>1/(_q_&minus;1)</sup>) (or an integer greater than this); set _s_ to 1+1/(_q_&minus;1); set _h_ to 16<sup>1/(_q_&minus;1)</sup>\*_&kappa;_/_&epsilon;_<sup>_s_</sup>.
6. If _q_ is greater than 2:
    - Set _m_ to ceil(144\*_&kappa;_); set _s_ to 2; set _h_ to 16\*_&kappa;_/_&epsilon;_<sup>_s_</sup>.
7. (Stage 1: Estimate _p_<sup>th</sup> c.a.m. to determine number of samples for stage 2.)  Create _k_ many blocks.  For each block:
    1. Get _m_ samples from the stream.
    2. Add the samples and divide by _m_ to get this block's sample mean, _mean_.
    3. Calculate the estimate of the _p_<sup>th</sup> c.a.m. for this block, which is: (_&sum;_<sub>_i_ = 0, ..., _k_&minus;1</sub> (_block_\[_i_\] &minus; _mean_)<sup>_p_</sup>)/_m_, where _block_\[_i_\] is the sample at position _i_ of the block (positions start at 0).
8. (Find the median of the _p_<sup>th</sup> c.a.m. estimates.)  Sort the estimates calculated by step 7 in ascending order, and set _median_ to the value in the middle of the sorted list (at position floor(_k_/2) with positions starting at 0); this works because _k_ is odd.
9. (Calculate sample size for the next stage.)  Set _mp_ to max(1, ceil(_h_ \* _median_<sup>_s_</sup>)), or an integer greater than this.
10. (Stage 2: Estimate of the sample mean.) Create _kp_ many blocks.  For each block:
    1. Get _mp_ samples from the stream.
    2. Add the samples and divide by _mp_ to get this block's sample mean.
11. (Find the median of the sample means.  This is definitely an unbiased estimate of the mean when _kp_ is 1 or 2, but unfortunately, it isn't one for any _kp_ > 2.)  Sort the sample means from step 10 in ascending order, and return the value in the middle of the sorted list (at position floor(_kp_/2) with positions starting at 0); this works because _kp_ is odd.

> **Notes:**
>
> 1. If the stream of random variates meets the condition for _Algorithm C_ for a given _q_, _p_, and _&kappa;_, then it still meets that condition when those variates are multiplied by a constant or a constant is added to them.
> 2. Theorem 3.4 of Kunsch et al. (2019\)[^6] shows that there is no mean estimation algorithm that&mdash;
>      - produces an estimate within a user-specified error tolerance (in terms of _absolute error_, as opposed to _relative error_) with probability greater than a user-specified value, and
>      - works for all streams whose distribution is known only to have finite moments (the moments are bounded but the bounds are unknown).
>
> **Examples:**
>
> 1. To estimate the probability of heads of a coin that produces either 1 with an unknown probability in the interval \[_&mu;_, 1&minus;_&mu;_\], or 0 otherwise, we can take _q_ = 4, _p_ = 2, and _&kappa;_ &ge; (1/min(_&mu;_, 1&minus;_&mu;_))<sup>1/4</sup> (Kunsch et al. 2019, Lemma 3.6).
> 2. The kurtosis of a Poisson distribution with mean _&mu;_ is (3 + 1/_&mu;_).  Thus, for example, to estimate the mean of a stream of Poisson variates with mean _&nu;_ or greater but otherwise unknown, we can take _q_ = 4, _p_ = 2, and _&kappa;_ &ge; (3 + 1/_&nu;_)<sup>1/4</sup>.
> 3. The kurtosis of an exponential distribution is 9 regardless of its rate.  Thus, to estimate the mean of a stream of exponential variates with unknown mean, we can take _q_ = 4, _p_ = 2, and _&kappa;_ &ge; 9<sup>1/4</sup> = sqrt(3).

<a id=Estimating_the_Mode></a>
## Estimating the Mode

Suppose there is an endless stream of items, each generated at random and independently from each other, and we can sample as many items from the stream as we want.  Then the following algorithm estimates the most frequently occurring item, called the _mode_.(Dutta and Goswami 2010)[^9]  This assumes the following are known:

- Exactly one item must occur more frequently than the others.
- $\epsilon$ is greater than 0 and less than one half of the smallest possible difference between the mode's probability and the next most frequent item's probability.
- $\delta$ is greater than 0 and less than 1.
- _n_ is the number of distinct items that can be taken.

The following algorithm correctly estimates the mode with probability $1-\delta$.

1. Calculate _m_ = ceil($\frac{(4\epsilon+3)(\ln(\frac{n}{\delta})+\ln(2))}{6\epsilon^2}$).
2. Take _m_ items from the stream.  If one item occurs more frequently than any other item taken this way, return the most frequent item.  Otherwise, return an arbitrary but fixed item (among the items the stream can take).

<a id=Estimating_a_Function_of_the_Mean></a>
## Estimating a Function of the Mean

_Algorithm C_ can be used to estimate a function of the mean of a stream of random variates with unknown mean.  Specifically, the goal is to estimate _f_(**E**[**z**]), where:

- **z** is a number produced by the stream.  Each number produced by the stream must lie in the interval [0, 1].
- _f_ is a known continuous function that maps the closed interval [0, 1] to [0, 1].
- The stream's numbers can take on a single value with probability 1.

The following algorithm takes the following parameters:

- _p_, _q_, and _&kappa;_ are as defined in _Algorithm C_.
- _&epsilon;_, _&delta;_: The algorithm will return an estimate within _&epsilon;_ of _f_(**E**[**z**]) with probability 1 &minus; _&delta;_ or greater, and the estimate will be in the interval [0, 1].

The algorithm, like _Algorithm C_, works only if the stream's distribution has the following technical property: The _q_<sup>th</sup> c.a.m.'s _q_<sup>th</sup> root divided by the _p_<sup>th</sup> c.a.m.'s _p_<sup>th</sup> root is no more than _&kappa;_, where _&kappa;_ is 1 or greater.  The algorithm, called **Algorithm D** in this document, follows.

1. Calculate _&gamma;_ as a number equal to or less than _&psi;_(_&epsilon;_), or the _inverse modulus of continuity_, which is found by taking the so-called _modulus of continuity_ of _f_(_x_), call it _&omega;_(_h_), and solving the equation _&omega;_(_h_) = _&epsilon;_ for _h_.
    - Loosely speaking, a modulus of continuity _&omega;_(_h_) gives the maximum range of _f_ in a window of size _h_.
    - For example, if _f_ has a bounded "slope" at all points, and has only finitely many "sharp turns", then _f_ is _Lipschitz continuous_ and its modulus of continuity is _&omega;_(_h_) = _M_\*_h_, where _M_ is the Lipschitz constant, which in this case is the maximum absolute value of _f_'s "slope function".  The solution for _&psi;_ is then _&psi;_(_&epsilon;_) = _&epsilon;_/_M_.
    - Because _f_ is continuous on a closed interval, it's guaranteed to have a modulus of continuity (by the Heine&ndash;Cantor theorem; see also a [**related question**](https://stats.stackexchange.com/questions/522429)).
2. Run _Algorithm C_ with the given parameters _p_, _q_, _&kappa;_, and _&delta;_, but with _&epsilon;_ = _&gamma;_.  Let _&mu;_ be the result.
3. Return _f_(_&mu;_).

A simpler version of _Algorithm D_ was given as an answer to the linked-to question; see also Jiang and Hickernell (2014\)[^10].  As with _Algorithm D_, this algorithm will return an estimate within _&epsilon;_ of _f_(**E**[**z**]) with probability 1 &minus; _&delta;_ or greater, and the estimate will be in the interval [0, 1].  The algorithm, called **Algorithm E** in this document, follows.

1. Calculate _&gamma;_ as given in step 1 of _Algorithm D_.
2. (Calculate the sample size.) Set _n_ to ceil(ln(2/_&delta;_)/(2\*_&gamma;_<sup>2</sup>)). (As the answer notes, this sample size is based on Hoeffding's inequality.)
3. (Calculate the sample mean.) Get _n_ samples from the stream, sum them, then divide the sum by _n_, then call the result _&mu;_.  Return _f_(_&mu;_).

If the stream is **unbounded** (can take on any real number) and its distribution has a **known upper bound on the standard deviation** _&sigma;_ (**or the variance** _&sigma;_<sup>2</sup>), then a similar algorithm follows from Chebyshev's inequality.  This was mentioned as Equation 14 in Hickernell et al. (2012/2013\)[^7], but is adapted to find the mean for _f_(_x_), which must be bounded and continuous on every closed interval of the real line. The algorithm will return an estimate within _&epsilon;_ of _f_(**E**[**z**]) with probability 1 &minus; _&delta;_ or greater, and the estimate will not go beyond the bounds of the stream's numbers. The algorithm, called **Algorithm F** in this document, follows.

1. Calculate _&gamma;_ as given in step 1 of _Algorithm D_.
2. (Calculate the sample size.) Set _n_ to ceil(_&sigma;_<sup>2</sup>/(_&delta;_\*_&gamma;_<sup>2</sup>)).
3. (Calculate the sample mean.) Get _n_ samples from the stream, sum them, then divide the sum by _n_, then call the result _&mu;_.  Return _f_(_&mu;_).

> **Notes:**
>
> 1. _Algorithm D_ and _Algorithm E_ won't work in general when _f_(_x_) has jump discontinuities (this happens in general when _f_ is piecewise continuous, or made up of independent continuous pieces that cover all of \[0, 1\]), at least when _&epsilon;_ is equal to or less than the maximum jump among all the jump discontinuities (see also a [**related question**](https://stats.stackexchange.com/questions/522429)).
> 3. _Algorithm D_ and _Algorithm E_ can be adapted to apply to streams outputting numbers in a bounded interval \[_a_, _b_\] (where _a_ and _b_ are known rational numbers), but with unknown mean, and with _f_ being a continuous function that maps [_a_, _b_] to [_a_, _b_], as follows:
>
>     - For each number in the stream, subtract _a_ from it, then divide it by (_b_ &minus; _a_).
>     - Instead of _&epsilon;_, take _&epsilon;_/(_b_ &minus; _a_).
>     - If the algorithm would return _f_(_&mu;_), instead return _g_(_&mu;_) where _g_(_&mu;_) = _f_(_a_ + (_&mu;_\*(_b_ &minus; _a_))).
>
> 4. _Algorithm E_ and _Algorithm F_ are not unbiased estimators in general.  However, when _f_(_x_) = _x_, the sample mean used by both algorithms is an unbiased estimator of the mean as long as the sample size _n_ is unchanged.
>
> **Examples:**
>
> 1. Take _f_(_x_) = sin(_&pi;_\*_x_\*4)/2 + 1/2.  This is a Lipschitz continuous function with Lipschitz constant 2\*_&pi;_, so for this _f_, _&psi;_(_&epsilon;_) = _&epsilon;_/(2\*_&pi;_).  Now, if we have a coin that produces heads with an unknown probability in the interval \[_&mu;_, 1&minus;_&mu;_\], or 0 otherwise, we can run _Algorithm D_ or _Algorithm E_ with _q_ = 4, _p_ = 2, and _&kappa;_ &ge; (1/min(_&mu;_, 1&minus;_&mu;_))<sup>1/4</sup> (see the section on _Algorithm C_).
> 2. Take _f_(_x_) = _x_.  This is a Lipschitz continuous function with Lipschitz constant 1, so for this _f_, _&psi;_(_&epsilon;_) = _&epsilon;_/1.
> 3. The variance of a Poisson distribution with mean _&mu;_ is _&mu;_.  Thus, for example, to estimate the mean of a stream of Poisson variates with mean _&nu;_ or less but otherwise unknown, we can take _&sigma;_ = sqrt(_&nu;_) so that the sample size _n_ is ceil(_&sigma;_<sup>2</sup>/(_&delta;_\*_&epsilon;_<sup>2</sup>)), in accordance with _Algorithm F_.

<a id=Randomized_Integration></a>
## Randomized Integration

Monte Carlo integration is a randomized way to estimate the integral ("area under the graph") of a function.

This time, suppose we have an endless stream of _vectors_ (_n_-dimensional points), each generated at random and independently from each other, and we can sample as many vectors from the stream as we want.

_Algorithm C_ can be used to estimate an integral of a function _h_(**z**), where **z** is a vector from the stream, with the following properties:

- _h_(**z**) is a multidimensional function that takes an _n_-dimensional vector and returns a real number.  _h_(**z**) is usually a function that's easy to evaluate but whose integral is hard to calculate.
- **z** is an _n_-dimensional vector chosen at random in the sampling domain.

The estimate will come within _&epsilon;_ of the true integral with probability 1 &minus; _&delta;_ or greater, as long as the following conditions are met:

- The _q_<sup>th</sup> c.a.m. for _h_(**z**) is finite.  That is, **E**\[abs(_h_(**z**)&minus;**E**\[_h_(**z**)\])<sup>_q_</sup>\] is finite.
- The _q_<sup>th</sup> c.a.m.'s _q_<sup>th</sup> root divided by the _p_<sup>th</sup> c.a.m.'s _p_<sup>th</sup> root is no more than _&kappa;_, where _&kappa;_ is 1 or greater.

Unfortunately, these conditions may be hard to verify in practice, especially when the distribution _h_(**z**) is not known.  (In fact, **E**\[_h_(**z**)\], as seen above, is the unknown integral that we seek to estimate.)

For this purpose, each number in the stream of random variates is generated as follows (see also Kunsch et al.):

1. Set **z** to an _n_-dimensional vector (list of _n_ numbers) chosen at random in the sampling domain, independently of any other choice.  Usually, **z** is chosen _uniformly_ at random this way (see note later in this section).
2. Calculate _h_(**z**), and set the next number in the stream to that value.

Alternatively, if _h_(**z**) can take on only numbers in the closed interval [0, 1], the much simpler _Algorithm E_ can be used on the newly generated stream (taking _f_(_x_) = _x_), rather than _Algorithm C_.

The following example (coded in Python for the SymPy computer algebra library) shows how to find parameter _&kappa;_ for estimating the integral of min(_Z1_, _Z2_) where _Z1_ and _Z2_ are each uniformly chosen at random in the interval [0, 1].  It assumes _p_ = 2 and _q_ = 4. (This is a trivial example because we can calculate the integral directly &mdash; 1/3 &mdash; but it shows how to proceed for more complicated cases.)

```
# Distribution of Z1 and Z2
u1=Uniform('U1',0,1)
u2=Uniform('U2',0,1)
# Function to estimate
func = Min(u1,u2)
emean=E(func)
p = S(2) # Degree of p-moment
q = S(4) # Degree of q-moment
# Calculate value for kappa
kappa = E(Abs(func-emean)**q)**(1/q) / E(Abs(func-emean)**p)**(1/p)
pprint(Max(1,kappa))
```

> **Note:** As an alternative to the usual process of choosing a point uniformly in the _whole_ sampling domain, _stratified sampling_ (Kunsch and Rudolf 2018\)[^11], which divides the sampling domain in equally sized boxes and finds the mean of random points in those boxes, can be described as follows (assuming the sampling domain is the _d_-dimensional hypercube [0, 1]<sup>_d_</sup>):
>
> 1. For a sample size _n_, set _m_ to floor(_n_<sup>1/_d_</sup>), where _d_ is the number of dimensions in the sampling domain (number of components of each point).  Set _s_ to 0.
> 2. For each _i\[1]_ in \[0, _m_), do: For each _i\[2]_ in \[0, _m_), do: ..., For each _i\[d]_ in \[0, _m_), do:
>     1. For each dimension _j_ in \[1, _d_], set _p\[j]_ to a number in the half-open interval \[_i\[j]_/_m_, (_i\[j]_+1)/_m_) chosen uniformly at random.
>     2. Add _f_((_p\[1]_, _p\[2]_, ..., _p\[j]_)) to _s_.
> 3. Return _s_/_m_<sup>_d_</sup>.
>
> The paper also implied a sample size _n_ for use in stratified sampling when _f_ is _&beta;_-Hölder continuous (is continuous and no "steeper" than **z**<sup>_&beta;_</sup>) and is defined on [0, 1]<sup>_d_</sup>, namely _n_ = ceil((ln(2/_&delta;_)/2\*_&epsilon;_<sup>2</sup>)<sup>_d_/(2\*_&beta;_+_d_)</sup>).

<a id=Finding_Coins_with_Maximum_Success_Probabilities></a>
## Finding Coins with Maximum Success Probabilities

Given _m_ coins each with unknown probability of heads, the following algorithm finds the _k_ coins that are most likely to show heads, such that the algorithm correctly finds them with probability at least 1 &minus; _&delta;_.  It uses the following parameters:

- _k_ is the number of coins to return.
- _&delta;_ is the confidence level; the algorithm correctly finds the coins most likely to show heads with probability at least 1 &minus; _&delta;_.
- _D_ is a _gap parameter_ or a lesser number, but must be greater than 0.  The _gap parameter_ is the difference between the _k_<sup>th</sup> most likely coin to show heads and the (_k_+1)<sup>th</sup> most likely coin to show heads.  Practically speaking, _D_ is the smallest possible difference between one probability of heads and another.
- _r_ is the number of rounds to run the algorithm and must be an integer 1 or greater.

In this section, ilog(_a_, _r_) means either _a_ if _r_ is 0, or max(ln(ilog(_a_, _r_&minus;1)), 1) otherwise.

Agarwal et al. (2017\)[^12] called this algorithm "aggressive elimination", and it can be described as follows.

1. Let _t_ be ceil((ilog(_m_, _r_) + ln(8\*_k_/_&delta;_)) \* 2/(_D_\*_D_)).
2. For each integer _i_ in \[1, _m_\], flip the coin labeled _i_, _t_ many times, then set _P_\[_i_\] to a list of two items: first is the number of times coin _i_ showed heads, and second is the label _i_.
3. Sort the _P_\[_i_\] in decreasing order by their values.
4. If _r_ is 1, return the labels to the first _k_ items in the list _P_, and the algorithm is done.
5. Set _&mu;_ to ceil(_k_ + _m_/ilog(_m_, _r_&minus; 1)).
6. Let _C_ be the coins whose labels are given in the first _&mu;_ items in the list (these are the _&mu;_ many coins found to be the most biased by this algorithm).
6. If _&mu;_ &le; 2\*_k_, do a recursive run of this algorithm, using only the coins in _C_ and with _&delta;_ = _&delta;_/2 and _r_ = 1.
7. If _&mu;_ > 2\*_k_, do a recursive run of this algorithm, using only the coins in _C_ and with _&delta;_ = _&delta;_/2 and _r_ = _r_ &minus; 1.

<a id=Requests_and_Open_Questions></a>
## Requests and Open Questions

Let _X_ be an endless stream of random variates and let _f_(_x_) be a known continuous function.

1. Is there an algorithm, besides _Algorithm C_ or _Algorithm F_, that can find **E**\[_X_\] (or _f_(**E**\[_X_\])) with either a high probability of a "small" absolute error or one of a "small" relative error, when the distribution of _X_ is unbounded, and additional assumptions on the distribution of _X_ apply, such as&mdash;

    - being unimodal (having one peak) and symmetric (mirrored on each side of the peak), and/or
    - following a geometric distribution, and/or
    - having decreasing or nonincreasing probabilities?

    Notice that merely having finite moments is not enough (Theorem 3.4, Kunsch et al. 2019[^6]).  Here, the accuracy tolerances for small error and high probability are user-specified.  A relative-error algorithm for **E**\[_X_\] for the geometric distribution was given already in a note.

2. How can _Algorithm D_ or _Algorithm E_ be adapted to a known discontinuous function _g_, so that the algorithm finds _g_(**E**[_X_]) with either a high probability of a "small" absolute error or one of a "small" relative error at all points in [0, 1] except at a "negligible" area around _g_'s discontinuities?  Is it enough to replace _g_ with a continuous function _f_ that equals _g_ everywhere except at that "negligible" area?  Here, the accuracy tolerances for small error, high probability, and "negligible" area are user-specified.  Perhaps the tolerance could be defined as the integral (area under the graph) of absolute differences between _f_ and _f_ instead of "negligible area"; in that case, how should the continuous _f_ be built?

3. Is it true that _Algorithm F_ remains valid when the sample size _n_ is ceil(abs(_M_)/(_&delta;_\*_&gamma;_<sup>_k_</sup>)), given that the stream's distribution is known to have a maximum _k_<sup>th</sup> central absolute moment of _M_?

<a id=Notes></a>
## Notes

[^1]: Vihola, M., 2018. Unbiased estimators and multilevel Monte Carlo. Operations Research, 66(2), pp.448-462.

[^2]: Huber, M., 2017. A Bernoulli mean estimate with known relative error distribution. Random Structures & Algorithms, 50(2), pp.173-182. (preprint in arXiv:1309.5413v2  [math.ST], 2015).

[^3]: Feng, J. et al. “Monte Carlo with User-Specified Relative Error.” (2016).

[^4]: Huber, Mark, and Bo Jones. "Faster estimates of the mean of bounded random variables." Mathematics and Computers in Simulation 161 (2019): 93-101.

[^5]: Huber, Mark, "[**An optimal(_&epsilon;_, _&delta;_)-approximation scheme for the mean of random variables with bounded relative variance**](https://arxiv.org/abs/1706.01478)", arXiv:1706.01478, 2017.

[^6]: Kunsch, Robert J., Erich Novak, and Daniel Rudolf. "Solvable integration problems and optimal sample size selection." Journal of Complexity 53 (2019): 40-67.  Also in [**https://arxiv.org/pdf/1805.08637.pdf**](https://arxiv.org/pdf/1805.08637.pdf) .

[^7]: Hickernell, F.J., Jiang, L., et al., "[**Guaranteed Conservative Fixed Width Intervals via Monte Carlo Sampling**](https://arxiv.org/abs/1208.4318v3)", arXiv:1208.4318v3 [math.ST], 2012/2013.

[^8]: As used here, kurtosis is the 4th c.a.m. divided by the square of the 2nd c.a.m.

[^9]: Dutta, Santanu, and Alok Goswami. "Mode estimation for discrete distributions." Mathematical Methods of Statistics 19, no. 4 (2010): 374-384.

[^10]: Jiang, L., Hickernell, F.J., "[**Guaranteed Monte Carlo Methods for Bernoulli Random Variables**](https://arxiv.org/abs/1411.1151)", arXiv:1411.1151 [math.NA], 2014.

[^11]: Kunsch, R.J., Rudolf, D., "[**Optimal confidence for Monte Carlo integration of smooth functions**](https://arxiv.org/abs/1809.09890)", arXiv:1809.09890, 2018.

[^12]: Agarwal, A., Agarwal, S., et al., "Learning with Limited Rounds of Adaptivity: Coin Tossing, Multi-Armed Bandits, and Ranking from Pairwise Comparisons", _Proceedings of Machine Learning Research_ 65 (2017).

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
