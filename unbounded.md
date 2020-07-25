# How to Sample Unbounded Monotone Density Functions

[**Peter Occil**](mailto:poccil14@gmail.com)

This short note shows a preprocessing algorithm to generate a random number in [0, 1] from a distribution whose density function&mdash;

- is everywhere continuous in [0, 1],
- is monotonically decreasing in [0, 1], and
- has an unbounded peak at 0.

The trick here is to sample the peak in such a way that the result is either forced to be 0 or forced to belong to the bounded part of the density function.  This algorithm does not require the area under the curve of the density in [0, 1] to be 1; in other words, this algorithm works even if the density function is known up to a normalizing constant.  The algorithm is as follows.

1. Set _i_ to 1.
2. Calculate the cumulative probability of the interval [0, 2<sup>&minus;_i_</sup>] and that of [0, 2<sup>&minus;(_i_ &minus; 1)</sup>], call them _p_ and _t_.
3. With probability _p_/_t_, add 1 to _i_ and go to step 2. (Alternatively, if _i_ is equal to or higher than the desired number of fractional bits in the result, return 0 instead of adding 1 and going to step 2.)
4. At this point, the density function at [2<sup>&minus;_i_</sup>, 2<sup>&minus;(_i_ &minus; 1)</sup>) is bounded from above, so sample a random number in this interval using any appropriate algorithm, including rejection sampling.  Because the density is monotonically decreasing, the peak of the density at this interval is located at 2<sup>&minus;_i_</sup>, so that rejection sampling becomes trivial.

It is relatively straightforward to adapt this algorithm for monotonically increasing density functions with the unbounded peak at 1, or to density functions with a different domain than [0, 1].

This algorithm is similar to the "inversion-rejection" algorithm mentioned in section 4.4 of chapter 7 of Devroye's _Non-Uniform Random Variate Generation_ (1986)<sup>[**(1)**](#Note1)</sup>.  I was unaware of that algorithm at the time I started writing this article.  The difference here is that it assumes the whole distribution (including its density function and cumulative distribution function) is supported on the interval [0, 1], while the algorithm presented in this article doesn't make that assumption (e.g., the interval [0, 1] can cover only part of the density's support).

By the way, this algorithm arose while trying to devise an algorithm that can generate an integer power of a uniform random number, with arbitrary precision, without actually calculating that power (a naïve calculation that is merely an approximation and usually introduces bias); for more information, see my other article on [**partially-sampled random numbers**](https://peteroupc.github.io/exporand.html).  Although I haven't succeeded in that yet, I have in the meantime come up with the algorithm in this note, which may be of independent interest.

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
