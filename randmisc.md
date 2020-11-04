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

This algorithm has an acceptance rate of 1/16 regardless of the value of _n_.  However, step 6 will generally require a growing amount of storage and time to exactly calculate the given probability as _n_ gets large, notably due to the inherent factorial in the binomial coefficient.  The Bringmann paper suggests approximating this factorial via Spouge's approximation; however, it seems hard to do so without using floating-point arithmetic, which the paper ultimately resorts to. Alternatively, the logarithm of that probability can be calculated that is much more economical in terms of storage than the full exact probability.  Then, an exponential random number can be generated, negated, and compared with that logarithm to determine whether the step succeeds.

More specifically, step 6 can be changed as follows:

- (6.) Let _p_ be loggamma(_n_+1)&minus;loggamma(_k_+1)&minus;loggamma((_n_&minus;_k_)+1)+ln(_m_)+ln(2)\*_k_&minus;(_n_+2) (where loggamma(_x_) is the logarithm of the gamma function).
- (6a.) Generate an exponential random number with rate 1 (which is the negative natural logarithm of a uniform(0,1) random number).  Set _e_ to 0 minus that number.
- (6b.) If _e_ is greater than _p_, go to step 2.  Otherwise, return _ret_. (This step can be replaced by calculating lower and upper bounds that converge to _p_.  Then, go to step 2 if _e_ is greater than the upper bound, or return _ret_ if _e_ is less than or equal to the lower bound, or compute better bounds and repeat this step otherwise.  See also chapter 4 of (Devroye 1986)<sup>[**(3)**](#Note3)</sup>.

<a id=Sampling_Unbounded_Monotone_Density_Functions></a>
## Sampling Unbounded Monotone Density Functions

This section shows a preprocessing algorithm to generate a random number in [0, 1] from a distribution whose probability density function (PDF)&mdash;

- is continuous in the interval [0, 1],
- is monotonically decreasing in [0, 1], and
- has an unbounded peak at 0.

The trick here is to sample the peak in such a way that the result is either forced to be 0 or forced to belong to the bounded part of the PDF.  This algorithm does not require the area under the curve of the PDF in [0, 1] to be 1; in other words, this algorithm works even if the PDF is known up to a normalizing constant.  The algorithm is as follows.

1. Set _i_ to 1.
2. Calculate the cumulative probability of the interval [0, 2<sup>&minus;_i_</sup>] and that of [0, 2<sup>&minus;(_i_ &minus; 1)</sup>], call them _p_ and _t_, respectively.
3. With probability _p_/_t_, add 1 to _i_ and go to step 2. (Alternatively, if _i_ is equal to or higher than the desired number of fractional bits in the result, return 0 instead of adding 1 and going to step 2.)
4. At this point, the PDF at [2<sup>&minus;_i_</sup>, 2<sup>&minus;(_i_ &minus; 1)</sup>) is bounded from above, so sample a random number in this interval using any appropriate algorithm, including rejection sampling.  Because the PDF is monotonically decreasing, the peak of the PDF at this interval is located at 2<sup>&minus;_i_</sup>, so that rejection sampling becomes trivial.

It is relatively straightforward to adapt this algorithm for monotonically increasing PDFs with the unbounded peak at 1, or to PDFs with a different domain than \[0, 1\].

This algorithm is similar to the "inversion-rejection" algorithm mentioned in section 4.4 of chapter 7 of Devroye's _Non-Uniform Random Variate Generation_ (1986)<sup>[**(3)**](#Note3)</sup>.  I was unaware of that algorithm at the time I started writing the text that became this section (Jul. 25, 2020).  The difference here is that it assumes the whole distribution (including its PDF and cumulative distribution function) is supported on the interval [0, 1], while the algorithm presented in this article doesn't make that assumption (e.g., the interval [0, 1] can cover only part of the PDF's support).

By the way, this algorithm arose while trying to devise an algorithm that can generate an integer power of a uniform random number, with arbitrary precision, without actually calculating that power (a naïve calculation that is merely an approximation and usually introduces bias); for more information, see my other article on [**partially-sampled random numbers**](https://peteroupc.github.io/exporand.html).  Even so, the algorithm I have come up with in this note may be of independent interest.

In the case of powers of a uniform \[0, 1\] random number _X_, namely _X_<sup>_n_</sup>, the ratio _p_/_t_ in this algorithm has a very simple form, namely (1/2)<sup>1/_n_</sup>, which is possible to simulate using a so-called _Bernoulli factory_ algorithm without actually having to calculate this ratio.  Note that this formula is the same regardless of _i_.  This is found by taking the PDF f(_x_) = _x_<sup>1/_n_</sup>/(_x_ * _n_)</sup> and finding the appropriate _p_/_t_ ratios by integrating _f_ over the two intervals mentioned in step 2 of the algorithm.

<a id=Certain_Families_of_Distributions></a>
## Certain Families of Distributions

This section is a note on certain families of univariate (one-variable) distributions of random numbers, with emphasis on sampling random numbers from them.

The "odd X Y" family uses two distributions, X and Y, where X is an arbitrary continuous distribution and Y is a distribution with an easy-to-sample quantile function (also known as inverse cumulative distribution function or inverse CDF).  The following algorithm samples a random number following a distribution from this family:

1. Generate a random number that follows the distribution X, call it _x_.
2. Calculate the quantile for Y of _x_/(1+_x_), and return that quantile.

Examples of this family include the "odd log-logistic G" family (where "G" or "generated" corresponds to Y) (Gleaton and Lynch 2006)<sup>[**(4)**](#Note4)</sup> and the "generalized odd Weibull generated" family (where X is the Weibull distribution and Y is arbitrary) (Korkmaz et al. 2018)<sup>[**(5)**](#Note5)</sup>.  Many special cases of this family have been proposed in many papers, and usually their names suggest the distributions that make up this family.  Some of these members have the word "generalized" in their name, and in most such cases the quantile in step 2 should be calculated as (_x_/(1+_x_))<sup>1/_a_</sup>, where _a_ is a shape parameter greater than 0; an example is the "generalized odd gamma-G" family (Hosseini et al. 2018)<sup>[**(6)**](#Note6)</sup>.

A _compound distribution_ is simply the minimum of _N_ random variables distributed as _X_, where _N_ is distributed as the discrete distribution _Y_ (Tahir and Cordeiro 2016)<sup>[**(7)**](#Note7)</sup>.  For example, the "beta-G-geometric" family represents the minimum of _N_ beta-G random variables (G is an arbitrary distribution), where _N_ is a (zero-truncated) geometric random number.  A _complementary compound distribution_ is the maximum of _N_ random variables distributed as _X_, where _N_ is distributed as the discrete distribution _Y_.

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> K. Bringmann, F. Kuhn, et al., “Internal DLA: Efficient Simulation of a Physical Growth Model.” In: _Proc. 41st International Colloquium on Automata, Languages, and Programming (ICALP'14)_, 2014.</small>
- <small><sup id=Note2>(2)</sup> choose(_n_, _k_) = _n_!/(_k_! * (_n_ &minus; _k_)!) is a binomial coefficient.  It can be calculated, for example, by calculating _i_/(_n_&minus;_i_+1) for each integer _i_ in \[_n_&minus;_k_+1, _n_\], then multiplying the results (Yannis Manolopoulos. 2002. "[**Binomial coefficient computation: recursion or iteration?**](https://doi.org/10.1145/820127.820168)", SIGCSE Bull. 34, 4 (December 2002), 65–67).  Note that for all _m_>0, choose(_m_, 0) = choose(_m_, _m_) = 1 and choose(_m_, 1) = choose(_m_, _m_&minus;1) = _m_.</small>
- <small><sup id=Note3>(3)</sup> Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.</small>
- <small><sup id=Note4>(4)</sup> Gleaton, J.U., Lynch, J. D., "Properties of generalized log-logistic families of lifetime distributions", _Journal of Probability and Statistical Science_ 4(1), 2006.</small>
- <small><sup id=Note5>(5)</sup> Korkmaz, M.Ç., Alizadeh, M., et al., "The Generalized Odd Weibull Generated Family of Distributions: Statistical Properties and Applications", _Pak. J. Stat. Oper. Res._ XIV(3), 2018.</small>
- <small><sup id=Note6>(6)</sup> Hosseini, B., Afshari, M., "The Generalized Odd Gamma-G Family of Distributions:  Properties and Application", _Austrian Journal of Statistics_ vol. 47, Feb. 2018.</small>
- <small><sup id=Note7>(7)</sup> Tahir, M.H., Cordeiro, G.M., "Compounding of distributions: a survey and new generalized classes", _Journal of Statistical Distributions and Applications_ 3(13), 2016.</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
