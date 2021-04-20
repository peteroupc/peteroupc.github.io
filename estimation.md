# Randomized Estimation Algorithms

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

This page presents general-purpose algorithms for estimating the mean value of a stream of random numbers, or estimating the mean value of a function of those numbers.  The estimates are either _unbiased_ (they have no systematic bias from the true mean value), or they come close to the true value with a user-specified error tolerance.

<a id=Concepts></a>
## Concepts

The following concepts are used in this document.

Each algorithm takes a stream of random numbers.  These numbers follow a _probability distribution_ or simply _distribution_, or a rule that says which kinds of numbers are more likely to occur than others.  A distribution has the following properties.

- The _expectation_, _expected value_, or _mean_ is the average value of the distribution.  It is expressed as **E**\[_X_\], where _X_ is a random number from the stream.  In other words, take random samples and then take their average.  The average will approach the expected value as _n_ gets large.
- An _n<sup>th</sup> moment_ is the expected value of _X_<sup>_n_</sup>.  In other words, take random samples, raise them to the power _n_, then take their average.  The average will approach the _n_<sup>th</sup> moment as _n_ gets large.
- An _n<sup>th</sup> central moment (about the mean)_ is the expected value of (_X_<sup>_n_</sup> &minus; _&mu;_), where _&mu;_ is the distribution's mean.  The 2nd central moment is called _variance_, and the 4th central moment _kurtosis_.
- An _n<sup>th</sup> central absolute moment_ (c.a.m.) is the expected value of abs(_X_<sup>_n_</sup> &minus; _&mu;_), where _&mu;_ is the distribution's mean.  This is the same as the central moment when _n_ is even.

Some distributions don't have an _n_<sup>th</sup> moment for a particular _n_.  This usually means the _n_<sup>th</sup> power of the random numbers varies so wildly that it can't be estimated accurately.  If a distribution has an _n_<sup>th</sup> moment, it also has a _k_<sup>th</sup> moment for any _k_ in the interval [1, _n_).

<a id=An_Adaptive_Algorithm></a>
## An Adaptive Algorithm

The following algorithm comes from Kunsch et al. 2019 <<Kunsch, Robert J., Erich Novak, and Daniel Rudolf. "Solvable integration problems and optimal sample size selection." Journal of Complexity 53 (2019): 40-67.  Also in [**https://arxiv.org/pdf/1805.08637.pdf**](https://arxiv.org/pdf/1805.08637.pdf) .>>.  It estimates the mean of a stream of random numbers, assuming their distribution has the following properties:

- It has a finite _q_<sup>th</sup> c.a.m. (also called _q_-moment in this section).
- It has a finite _p_<sup>th</sup> c.a.m. (also called _p_-moment in this section).
- The _q_-moment's _q_<sup>th</sup> root is no more than _&kappa;_ times the _p_-moment's _p_<sup>th</sup> root, where _&kappa;_ is 1 or greater. (Note that the _q_-moment's _q_<sup>th</sup> root is also known as _standard deviation_ if _q_ = 2, and _mean deviation_ if _q_ = 1; similarly for _p_.)

The algorithm works by first estimating the _p_-moment of the stream, then using the estimate to determine a sample size for the next step, which actually estimates the stream's mean.

The algorithm has the following parameters:

- _&epsilon;_, _&delta;_: Both parameters must be greater than 0, and _&delta;_ must be 1 or less.  The algorithm will return an estimate within _&epsilon;_ of the true expected value with probability 1 &minus; _&delta;_ or greater.  The algorithm is not guaranteed to maintain a finite mean square error or expected error in its estimates.
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

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
