# Miscellaneous Observations on Randomization

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=On_a_Binomial_Sampler></a>
## On a Binomial Sampler

Take the following sampler of a binomial(_n_, 1/2) distribution (where _n_ is even), which is equivalent to the one that appeared in (Bringmann et al. 2014)<sup>[**(1)**](#Note1)</sup>, and adapted to be more programmer-friendly.

1. Set _m_ to floor(sqrt(_n_)) + 1.
2. (First, sample from an envelope of the binomial curve.) Generate unbiased random bits (zeros or ones) until a zero is generated this way.  Set _k_ to the number of ones generated this way.
3. Set _s_ to an integer in [0, _m_) chosen uniformly at random, then set _i_ to _k_\*_m_ + _s_.
4. Set _ret_ to either _n_/2+_i_ or _n_/2&minus;_i_&minus;1 with equal probability.
5. (Second, accept or reject _ret_.) If _ret_ < 0 or _ret_ > _n2_, go to step 2.
6. With probability choose(_n_, _ret_)\*_m_\*2<sup>_k_&minus;(_n_+2)</sup>, return _ret_.  Otherwise, go to step 2. (Here, choose(_n_, _k_) is a binomial coefficient.<sup>[**(2)**](#Note2)</sup>)

This algorithm has an acceptance rate of 1/16 regardless of the value of _n_.  However, step 6 will generally require a growing amount of storage and time to exactly calculate the given probability as _n_ gets large, notably due to the inherent factorial in the binomial coefficient.  Alternatively, the logarithm loggamma(_n_+1)&minus;loggamma(_k_+1)&minus;loggamma((_n_&minus;_k_)+1)+ln(_m_)+ln(2)\*_k_&minus;(_n_+2) (where loggamma(_x_) is the logarithm of the gamma function) can be calculated, more specifically a converging series of lower and upper bounds that converge to that logarithm.  This series is much more economical in terms of storage than the full exact probability.  Then, an exponential random number with rate 1 (which is the negative natural logarithm of a uniform(0,1) random number) can be generated, negated, and compared with those bounds to determine whether the step succeeds.

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> K. Bringmann, F. Kuhn, et al., “Internal DLA: Efficient Simulation of a Physical Growth Model.” In: _Proc. 41st International Colloquium on Automata, Languages, and Programming (ICALP'14)_, 2014.</small>
- <small><sup id=Note2>(2)</sup> choose(_n_, _k_) = _n_!/(_k_! * (_n_ &minus; _k_)!) is a binomial coefficient.  It can be calculated, for example, by calculating _i_/(_n_&minus;_i_+1) for each integer _i_ in \[_n_&minus;_k_+1, _n_\], then multiplying the results (Yannis Manolopoulos. 2002. "[**Binomial coefficient computation: recursion or iteration?**](https://doi.org/10.1145/820127.820168)", SIGCSE Bull. 34, 4 (December 2002), 65–67).  Note that for all _m_>0, choose(_m_, 0) = choose(_m_, _m_) = 1 and choose(_m_, 1) = choose(_m_, _m_&minus;1) = _m_.</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
