# Randomized Estimation Algorithms

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

This page presents general-purpose algorithms for estimating the mean value of a stream of random numbers, or estimating the mean value of a function of those numbers.  The estimates are either _unbiased_ (they have no systematic bias from the true mean value), or they come close to the true value with a user-specified error tolerance.

The algorithms are described to make them easy to implement by programmers.

<a id=Concepts></a>
## Concepts

The following concepts are used in this document.

Each algorithm takes a stream of random numbers.  These numbers follow a _probability distribution_ or simply _distribution_, or a rule that says which kinds of numbers are more likely to occur than others.  A distribution has the following properties.

- The _expectation_, _expected value_, or _mean_ is the average value of the distribution.  It is expressed as **E**\[_X_\], where _X_ is a random number from the stream.  In other words, take random samples and then take their average.  The average will approach the expected value as _n_ gets large.
- An _n<sup>th</sup> moment_ is the expected value of _X_<sup>_n_</sup>.  In other words, take random samples, raise them to the power _n_, then take their average.  The average will approach the _n_<sup>th</sup> moment as _n_ gets large.
- An _n<sup>th</sup> central moment (about the mean)_ is the expected value of (_X_<sup>_n_</sup> &minus; _&mu;_), where _&mu;_ is the distribution's mean.  The 2nd central moment is called _variance_, and the 4th central moment _kurtosis_.
- An _n<sup>th</sup> central absolute moment_ (c.a.m.) is the expected value of abs(_X_<sup>_n_</sup> &minus; _&mu;_), where _&mu;_ is the distribution's mean.  This is the same as the central moment when _n_ is even.

Some distributions don't have an _n_<sup>th</sup> moment for a particular _n_.  This usually means the _n_<sup>th</sup> power of the random numbers varies so wildly that it can't be estimated accurately.  If a distribution has an _n_<sup>th</sup> moment, it also has a _k_<sup>th</sup> moment for any _k_ in the interval [1, _n_).

For any estimation algorithm, the _relative error_ is abs(_est_, _trueval_) &minus; 1, where _est_ is the estimate and _trueval_ is the true expected value.

<a id=Estimators_with_User_Specified_Relative_Error></a>
## Estimators with User-Specified Relative Error

The following algorithm from Huber (2017)<sup>[**(1)**](#Note1)</sup> estimates the probability of 1 of a stream of random zeros and ones (that is, it estimates the mean of a stream of Bernoulli random numbers with unknown mean).  The algorithm's relative error is independent of that probability, however, and the algorithm produces _unbiased_ estimates.  The algorithm assumes the stream of numbers can't take on the value 0 with probability 1.

The algorithm has the following parameters:

- _&epsilon;_, _&delta;_: Both parameters must be greater than 0, and _&epsilon;_ must be 3/4 or less, and _&delta;_ must be 1 or less.  With this algorithm, the relative error will be no greater than _&epsilon;_ with probability 1 &minus; _&delta;_ or greater.

The algorithm follows:

1. Calculate the minimum number of samples _k_.  There are two suggestions.  The simpler one is _k_ = ceil(&minus;6\*ln(2/_&delta;_)/(_&epsilon;_<sup>2</sup>\*(4\*_&epsilon;_&minus;3))).  A more complicated one is the smallest integer _k_ such that gammainc(_k_,(_k_&minus;1)/(1+_&epsilon;_)) + (1 &minus; gammainc(_k_,(_k_&minus;1)/(1&minus;_&epsilon;_))) &le; _&delta;_, where gammainc is the regularized lower incomplete gamma function.
2. Take samples from the stream until _k_ 1's are taken this way.  Let _r_ be the total number of samples taken this way.
3. Generate _g_, a gamma(_r_) random variate, then return (_k_&minus;1)/_g_.

> **Note**:
>
> 1. As noted in Huber 2017, if we have a stream of random numbers that take on values in the interval [0, 1], but have unknown mean, we can transform each number by&mdash;
>
>    1. generating a uniform(0, 1) random variate _u_, then
>    2. changing that number to 1 if _u_ is less than that number, or 0 otherwise,
>
>    and we can use the new stream of zeros and ones in the algorithm to get an unbiased estimate of the unknown mean.
> 2. As can be seen in Feng et al. (2016)<sup>[**(2)**](#Note2)</sup>, the following is equivalent to steps 2 and 3 of the original algorithm: "Let G be 0. Do this _k_ times: 'Flip a coin until it shows heads, let _r_ be the number of flips (including the last), and add a gamma(_r_) random variate to G.' The estimated probability of heads is then (_k_&minus;1)/G.", and the following is likewise equivalent if the stream of random numbers follows a (zero-truncated) "geometric" distribution with unknown mean: "Let G be 0. Do this _k_ times: 'Take a sample from the stream, call it _r_, and add a gamma(_r_) random variate to G.' The estimated mean is then (_k_&minus;1)/G." (This is with the understanding that the geometric distribution is defined differently in different academic works.)  The geometric algorithm produces unbiased estimates just like the original algorithm.

<a id=An_Algorithm_for_a_Stream_of_Bounded_Random_Numbers></a>
## An Algorithm for a Stream of Bounded Random Numbers

The following algorithm comes from Huber and Jones (2019)<sup>[**(3)**](#Note3)</sup>; see also Huber (2017)<sup>[**(4)**](#Note4)</sup>.  It estimates the expected value of a stream of random numbers taking on values in the closed interval [0, 1].  It assumes the stream of numbers can't take on the value 0 with probability 1.

The algorithm has the following parameters:

- _&epsilon;_, _&delta;_: Both parameters must be greater than 0, and _&epsilon;_ must be 1/8 or less, and _&delta;_ must be 1 or less.  The relative error is abs(_est_, _trueval_) &minus; 1, where _est_ is the estimate and _trueval_ is the true expected value.  With this algorithm, the relative error will be no greater than _&epsilon;_ with probability 1 &minus; _&delta;_ or greater.

The algorithm follows.

1. Set _k_ to ceil(2\*ln(6/_&delta;_)/_&epsilon;_<sup>2/3</sup>).
2. Set _b_ to 0 and _n_ to 0.
3. (Stage 1: Modified gamma Bernoulli approximation scheme.) While _b_ is less than _k_:
    1. Add 1 to _n_.
    2. Take a sample from the stream, call it _s_.
    3. Generate a uniform(0, 1) random number, call it _u_.
    4. If _u_ is less than _s_, add 1 to _b_.
4. Set _gb_ to _k_ + 2, then divide _gb_ by a gamma(_n_) random variate.
5. (Find the sample size for the next stage.) Set _c1_ to 2\*ln(3/_&delta;_).
6. Set _n_ to a Poisson(_c1_/(_&epsilon;_\*_gb_)) random variate.
7. Run the standard deviation sub-algorithm (given later) _n_ times.  Set _A_ to the number of 1's returned by that sub-algorithm this way.
8. Set _csquared_ to (_A_ / _c1_ + 1 / 2 + sqrt(_A_ / _c1_ + 1 / 4)) * (1 + _&epsilon;_<sup>1 / 3</sup>)<sup>2</sup>\*_&epsilon;_/_gb_.
9. Set _n_ to ceil((2\*ln(6/_&delta;_)/_&epsilon;_<sup>2</sup>)/(1&minus;_&epsilon;_<sup>1/3</sup>)).
10. (Stage 2: Light-tailed sample average.)  Set _e0_ to _&epsilon;_<sup>1/3</sup>.
11. Set _mu0_ to _gb_/(1&minus;_e0_<sup>2</sup>).
12. Set _alpha_ to _&epsilon;_/(_csquared_\*_mu0_).
13. Set _w_ to _n_\*_mu0_.
14. Do the following _n_ times:
    1. Get a sample from the stream, call it _g_.  Set _s_ to _alpha_\*(_g_&minus;_mu0_).
    2. If _s_&ge;0, add ln(1+_s_+_s_\*_s_/2)/_alpha_ to _w_.  Otherwise, subtract ln(1&minus;_s_+_s_\*_s_/2)/_alpha_ from _w_.
15. Return _w_/_n_.

The standard deviation sub-algorithm follows:

1. Generate an unbiased random bit.  If that bit is 1 (which happens with probability 1/2), return 0.
2. Get two samples from the stream, call them _x_ and _y_.
3. Generate a uniform(0, 1) random number, call it _u_.
4. If _u_ is less than (_x_&minus;_y_)<sup>2</sup>, return 1.  Otherwise, return 0.

> **Note:** As noted in Huber and Jones, if the stream of random numbers takes on values in the interval [0, _m_], where _m_ is a known number, we can divide the stream's numbers by _m_ before using them in this algorithm, and the algorithm will still work.

<a id=An_Adaptive_Algorithm></a>
## An Adaptive Algorithm

The following algorithm comes from Kunsch et al. (2019)<sup>[**(5)**](#Note5)</sup>.  It estimates the mean of a stream of random numbers, assuming their distribution has the following properties:

- It has a finite _q_<sup>th</sup> c.a.m. (also called _q_-moment in this section).
- It has a finite _p_<sup>th</sup> c.a.m. (also called _p_-moment in this section).
- The _q_-moment's _q_<sup>th</sup> root is no more than _&kappa;_ times the _p_-moment's _p_<sup>th</sup> root, where _&kappa;_ is 1 or greater. (Note that the _q_-moment's _q_<sup>th</sup> root is also known as _standard deviation_ if _q_ = 2, and _mean deviation_ if _q_ = 1; similarly for _p_.)

The algorithm works by first estimating the _p_-moment of the stream, then using the estimate to determine a sample size for the next step, which actually estimates the stream's mean.

The algorithm has the following parameters:

- _&epsilon;_, _&delta;_: Both parameters must be greater than 0, and _&delta;_ must be 1 or less.  The algorithm will return an estimate within _&epsilon;_ of the true expected value with probability 1 &minus; _&delta;_ or greater.  The algorithm is not guaranteed to maintain a finite mean squared error or expected error in its estimates.
- _p_: The degree of the _p_-moment that the algorithm will estimate to determine the mean.
- _q_: The algorithm assumes the distribution has a _q_-moment.  _q_ must be greater than _p_.
- _&kappa;_: May not be less than the _q_-moment's  _q_<sup>th</sup> root divided by the _p_-moment's _p_<sup>th</sup> root, and may not be less than 1.

For example:

- With parameters _p_ = 2, _q_ = 4, _&epsilon;_ = 1/10, _&delta;_ = 1/16, _&kappa;_ = 1.1, the algorithm assumes the random numbers' distribution has a bounded 4th c.a.m. and that the 4th c.a.m.'s 4th root is no more than 1.1 times the 2nd c.a.m.'s square root (that is, the standard deviation), and will return an estimate that's within 1/10 of the true mean with probability greater than (1 &minus; 1/16) or greater, or 15/16 or greater.
- With parameters _p_ = 1, _q_ = 2, _&epsilon;_ = 1/10, _&delta;_ = 1/16, _&kappa;_ = 2, the algorithm assumes the random numbers' distribution has a standard deviation (_q_=2) that is no more than 2 times its mean deviation (_p_=1), and will return an estimate that's within 1/10 of the true mean with probability greater than (1 &minus; 1/16) or greater, or 15/16 or greater.

The algorithm can be implemented as follows.

1. If _&kappa;_ is 1:
    1. Set _n_ to ceil(ln(1/_&delta;_)/ln(2))+1.
    2. Get _n_ samples from the stream and return (_mn_ + _mx_)/2, where _mx_ is the highest sample and _mn_ is the lowest.
2. Set _k_ to ceil((2*ln(1/_&delta;_))/ln(4/3)).  If _k_ is even, add 1 to _k_.
3. Set _kp_ to _k_.
4. Set _&kappa;_ to _&kappa;_<sup>(_p_\*_q_/(_q_&minus;_p_))</sup>.
5. If _q_ is 2 or less:
    - Set _m_ to ceil(3\*_&kappa;_\*48<sup>1/(_q_&minus;1)</sup>); set _s_ to 1+1/(_q_&minus;1); set _&eta;_ to 16<sup>1/(_q_&minus;1)</sup>\*_&kappa;_/_&epsilon;_<sup>_s_</sup>.
6. If _q_ is greater than 2:
    - Set _m_ to ceil(144\*_&kappa;_); set _s_ to 2; set _&eta;_ to 16\*_&kappa;_/_&epsilon;_<sup>_s_</sup>.
7. (Stage 1: Estimate _p_-moment to determine number of samples for stage 2.)  Create _k_ many blocks.  For each block:
    1. Get _m_ samples from the stream.
    2. Add the samples and divide by _m_ to get this block's sample mean, _mean_.
    3. Calculate the _p_-moment estimate for this block, which is: (_&sum;_<sub>_i_ = 0, ..., _k_&minus;1</sub> (_block_\[_i_\] &minus; _mean_)<sup>_p_</sup>)/_m_, where _block_\[_i_\] is the sample at position _i_ of the block (positions start at 0).
8. (Find the median of the _p_-moment estimates.)  Sort the _p_-moment estimates from step 7 in ascending order, and set _median_ to the value in the middle of the sorted list (at position floor(_k_/2) with positions starting at 0); this works because _k_ is odd.
9. (Calculate sample size for the next stage.)  Set _mp_ to max(1, ceil(_&eta;_ \* _median_<sup>_s_</sup>)).
10. (Stage 2: Estimate of the sample mean.) Create _kp_ many blocks.  For each block:
    1. Get _mp_ samples from the stream.
    2. Add the samples and divide by _mp_ to get this block's sample mean.
11. (Find the median of the sample means.  This is definitely an unbiased estimate of the mean when _kp_ is 1 or 2, but unfortunately, it isn't one for any _kp_ > 2.)  Sort the sample means from step 10 in ascending order, and return the value in the middle of the sorted list (at position floor(_kp_/2) with positions starting at 0); this works because _kp_ is odd.

<a id=Randomized_Integration></a>
## Randomized Integration

Monte Carlo integration is a randomized way to estimate the integral of a function.  The adaptive algorithm in this article can be used to estimate an integral of a function _f_(_Z_), where _Z_ is an n-dimensional vector chosen at random in the sampling domain.  The estimate will come within _&epsilon;_ of the true integral with probability 1 &minus; _&delta;_ or greater, as long as the following conditions are met:

- The _q_<sup>th</sup> c.a.m. for _f_(_Z_) is finite.  That is, **E**\[abs(_f_(_Z_)&minus;**E**\[_f_(_Z_)\])<sup>_q_</sup>\] is finite.
- The _q_<sup>th</sup> c.a.m.'s _q_<sup>th</sup> root is no more than _&kappa;_ times the _p_<sup>th</sup> c.a.m.'s _p_<sup>th</sup> root, where _&kappa;_ is 1 or greater.

Unfortunately, these conditions may be hard to verify in practice, especially when _f_(_Z_) is not known.  (In fact, **E**\[_f_(_Z_)\], as seen above, is the unknown integral that we seek to estimate.)

For this purpose, each number in the stream of random numbers is generated as follows (see also Kunsch et al.):

1. Set _Z_ to an _n_-dimensional vector (list of _n_ numbers) chosen at random in the sampling domain, independently of any other choice.  Usually, _Z_ is chosen _uniformly_ at random this way.
2. Calculate _f_(_Z_), and set the next number in the stream to that value.

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

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Huber, M., 2017. A Bernoulli mean estimate with known relative error distribution. Random Structures & Algorithms, 50(2), pp.173-182. (preprint in arXiv:1309.5413v2  [math.ST], 2015).</small>
- <small><sup id=Note2>(2)</sup> Feng, J. et al. “Monte Carlo with User-Specified Relative Error.” (2016).</small>
- <small><sup id=Note3>(3)</sup> Huber, Mark, and Bo Jones. "Faster estimates of the mean of bounded random variables." Mathematics and Computers in Simulation 161 (2019): 93-101.</small>
- <small><sup id=Note4>(4)</sup> Huber, Mark, "[**An optimal(_&epsilon;_, _&delta;_)-approximation scheme for the mean of random variables with bounded relative variance**](https://arxiv.org/abs/1706.01478)", arXiv:1706.01478, 2017.</small>
- <small><sup id=Note5>(5)</sup> Kunsch, Robert J., Erich Novak, and Daniel Rudolf. "Solvable integration problems and optimal sample size selection." Journal of Complexity 53 (2019): 40-67.  Also in [**https://arxiv.org/pdf/1805.08637.pdf**](https://arxiv.org/pdf/1805.08637.pdf) .</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
