# Requests and Open Questions

[**Peter Occil**](mailto:poccil14@gmail.com)

This page lists questions and issues relating to my articles posted on this site.  Any answers to these questions will greatly improve those articles.  If you can answer any of them, post an issue in the [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues).

<a id=Contents></a>
## Contents

- [**Contents**](#Contents)
- [**Randomization and Sampling Methods**](#Randomization_and_Sampling_Methods)
- [**Bernoulli Factory Algorithms**](#Bernoulli_Factory_Algorithms)
- [**Partially-Sampled Random Numbers for Accurate Sampling of Continuous Distributions**](#Partially_Sampled_Random_Numbers_for_Accurate_Sampling_of_Continuous_Distributions)
- [**More Algorithms for Arbitrary-Precision Sampling**](#More_Algorithms_for_Arbitrary_Precision_Sampling)
- [**Randomized Estimation Algorithms**](#Randomized_Estimation_Algorithms)
- [**Color Topics for Programmers**](#Color_Topics_for_Programmers)
- [**Notes**](#Notes)
- [**License**](#License)

<a id=Randomization_and_Sampling_Methods></a>
## Randomization and Sampling Methods

**Size Reduction Sought:**

Of the articles in this repository, [**Randomization and Sampling Methods**](https://peteroupc.github.io/randomfunc.html) and [**More Random Sampling Methods**](https://peteroupc.github.io/randomnotes.html) combined are very long (about 230 KB in size combined).

These articles describe numerous algorithms to generate random variates (from discrete and continuous distributions) as well as perform random sampling with and without replacement, shuffling, geometric sampling, and more, assuming a source of "truly" random numbers is available.

I would like to reduce the size of these articles while maintaining the most relevant algorithms for random variate generation.

Here are my goals for both articles:

- To shorten the [**Randomization with Real Numbers**](https://peteroupc.github.io/randomfunc.html#Randomization_with_Real_Numbers) section as much as possible, while still describing the most general (and exact) algorithms possible for sampling real numbers of any distribution.
- To put emphasis on algorithms that work with random integers (or, if necessary, rational numbers), rather than random floating-point numbers.
- To put emphasis on algorithms that sample a distribution _exactly_, or at least with a controlled upper bound on the error.  For discussion, see  "[**Exact, Error-Bounded, and Approximate Algorithms**](https://peteroupc.github.io/randomnotes.html#Exact_Error_Bounded_and_Approximate_Algorithms)".
- To ensure the documents are easy for programmers to understand and implement.

**Other questions:**

- Is there any non-trivial use of random fixed-point numbers in any applications, other than uniformly distributed numbers?

<a id=Bernoulli_Factory_Algorithms></a>
## Bernoulli Factory Algorithms

[**https://peteroupc.github.io/bernoulli.html**](https://peteroupc.github.io/bernoulli.html)

This is a page showing algorithms to turn a coin with an unknown probability of heads into a coin with a different probability of heads, also known as _Bernoulli factories_.  A _factory function_ is a function that relates the old probability to the new one.  Roughly speaking, a function can be a factory function only if it is the constant 0 or 1, or if it is continuous on its domain and equals neither 0 nor 1 on the open interval (0, 1) (Keane and O'Brien 1994)<sup>[**(1)**](#Note1)</sup>.

Attention is drawn to the requests and open questions on that page:

- [**https://peteroupc.github.io/bernoulli.html#Requests_and_Open_Questions**](https://peteroupc.github.io/bernoulli.html#Requests_and_Open_Questions)

Among other things, they relate to finding polynomial sequences, probabilities, and other mathematical constructions needed to apply certain Bernoulli factories.  These questions are reproduced below.

1. Let a permutation class (such as numbers in descending order) and two continuous probability distributions _D_ and _E_ be given.  Consider the following algorithm: Generate a sequence of independent random numbers (where the first is distributed as _D_ and the rest as _E_) until the sequence no longer follows the permutation class, then return _n_, which is how many numbers were generated this way, minus 1.  In this case:
    1. What is the probability that _n_ is returned?
    2. What is the probability that _n_ is odd or even or belongs to a certain class of numbers?
    3. What is the distribution function (CDF) of the first generated number given that _n_ is odd, or that _n_ is even?

    Obviously, these answers depend on the specific permutation class and/or distributions _D_ and _E_.  Thus, answers that work only for particular classes and/or distributions are welcome.  See also my Stack Exchange question [**Probabilities arising from permutations**](https://stats.stackexchange.com/questions/499864/probabilities-arising-from-permutations).
2. I request expressions of mathematical functions that can be expressed in any of the following ways:
    - Series expansions for continuous functions that equal 0 or 1 at the points 0 and 1.
    - A series expansion with non-negative terms that can be "tucked" under a discrete probability mass function.
    - Series expansions for alternating power series whose coefficients are all in the interval [0, 1] and form a nonincreasing sequence.
    - Series expansions with non-negative coefficients and for which bounds on the truncation error are available.
    - Upper and lower bound approximations that converge to a given constant.  These upper and lower bounds must be nonincreasing or nondecreasing, respectively.
    - Sequences of approximating functions (such as rational functions) that converge from above and below to a given function.  These sequences must be nonincreasing or nondecreasing, respectively (but the approximating functions themselves need not be).
    - To apply the algorithms for [**general factory functions**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions), what is needed are two sequences of polynomials written in Bernstein form that converge from above and below to a factory function as follows: (a) Each sequence's polynomials must have coefficients lying in \[0, 1\], and be of increasing degree; (b) the degree-_n_ polynomials' coefficients must lie at or "inside" those of the previous upper polynomial and the previous lower one (once the polynomials are elevated to degree _n_).  For a formal statement of these polynomials, see my [**question on Mathematics Stack Exchange**](https://math.stackexchange.com/questions/3904732/what-are-ways-to-compute-polynomials-that-converge-from-above-and-below-to-a-con). The [**supplemental notes**](https://peteroupc.github.io/bernsupp.html) include formulas for computing these polynomials for large classes of factory functions, but none of them ensure a finite expected number of coin flips in general, and it is suspected that a finite number of flips isn't possible unless the factory function is C<sup>2</sup> continuous (has two or more continuous "slope" functions).  Thus one question is: Given a C<sup>2</sup> continuous factory function, are there practical algorithms for building polynomials that converge to that function in a manner that solves the Bernoulli factory problem, and where the expected number of coin flips is finite?
    - Simple [**continued fractions**](https://peteroupc.github.io/bernoulli.html#Continued_Fractions) that express useful constants.

    All these expressions should not rely on floating-point arithmetic or the direct use of irrational constants (such as _&pi;_ or sqrt(2)), but may rely on rational arithmetic.  For example, a series expansion that _directly_ contains the constant _&pi;_ is not desired; however, a series expansion that converges to a fraction of _&pi;_ is.
3. Is there a simpler or faster way to implement the base-2 or natural logarithm of binomial coefficients?  See the example in the section "[**Certain Converging Series**](https://peteroupc.github.io/bernoulli.html#Certain_Converging_Series)".
4. Part of the reverse-time martingale algorithm of Łatuszyński et al. (2009/2011)<sup>[**(2)**](#Note2)</sup> (see "[**General Factory Functions**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions)") to simulate a factory function _f_(_&lambda;_) is as follows.  For each _n_ starting with 1:
    1. Flip the input coin, and compute the _n_<sup>th</sup> upper and lower bounds of _f_ given the number of heads so far, call them _L_ and _U_.
    2. Compute the (_n_&minus;1)<sup>th</sup> upper and lower bounds of _f_ given the number of heads so far, call them _L&prime;_ and _U&prime;_.  (These bounds must be the same regardless of the outcomes of future coin flips, and the interval [_L&prime;_, _U&prime;_] must equal or entirely contain the interval [_L_, _U_].)

    These parts of the algorithm appear to work for any two sequences of functions (not just polynomials) that converge to _f_, where _L_ or _L&prime;_ and _U_ or _U&prime;_ are their lower and upper bound approximations.  The section on general factory functions shows how this algorithm can be implemented for polynomials.  Specifically:

    1. Given the number of heads _H_<sub>_n_</sub>, _L_ is the _H_<sub>n</sub> Bernstein coefficient of the _n_<sup>th</sup> lower approximating polynomial, and _U_ is that of the corresponding upper polynomial.
    2. _L&prime;_ is the _H_<sub>n</sub><sup>th</sup> Bernstein coefficient of the (_n_&minus;1)<sup>th</sup> lower approximating polynomial, and _U&prime;_ is that of the corresponding upper polynomial, after elevating both polynomials to degree _n_.

    But how do these steps work when the approximating functions (the functions that converge to _f_) are rational functions whose coefficients are integers? Rational functions whose coefficients are rational numbers? Arbitrary approximating functions?
5. Let _f_ be a continuous function that maps (0, 1) to (0, 1).  A _pushdown automaton_ is a state machine that holds a stack of symbols.  According to (Mossel and Peres 2005)<sup>[**(3)**](#Note3)</sup>, this machine can read flips of a coin with unknown probability of heads of _&lambda;_ and simulate a coin with probability of heads of _f_(_&lambda;_) only if _f_ is a solution of a polynomial whose coefficients are rational numbers. (See "[**Certain Algebraic Functions**](https://peteroupc.github.io/bernoulli.html#Certain_Algebraic_Functions)".)  Are there any results showing whether the converse is true; namely, can a pushdown automaton simulate _any_ _f_ of this kind?  Note that this question is not quite the same as the question of which algebraic functions can be simulated by a context-free grammar (either in general or restricted to those of a certain ambiguity and/or alphabet size), and is not quite the same as the question of which _probability generating functions_ can be simulated by context-free grammars or pushdown automata, although answers to those questions would be nice.  (See also Icard 2019<sup>[**(4)**](#Note4)</sup>.  Answering this question might involve ideas from analytic combinatorics; e.g., see the recent works of Cyril Banderier and colleagues.)
6. The following is an open question in Nacu and Peres 2005.  Let _J_ be a closed interval on (0, 1), such as [1/100, 99/100], and let _f_(_&lambda;_) be a function that admits a Bernoulli factory.  Suppose there is an algorithm that takes a coin with unknown probability of heads _&lambda;_ and produces one or more samples of the probability _f_(_&lambda;_).  When the probability _&lambda;_ can be any value in _J_, is it possible for this algorithm to have an expected number of input coin flips per sample that is arbitrarily close to the so-called _entropy bound_?  The entropy bound is _h_(_f_(_&lambda;_))/_h_(_&lambda;_) where _h_(_x_) = &minus;_x_\*ln(_x_)&minus;(1&minus;_x_)\*ln(1&minus;_x_) is the Shannon entropy function.  Does the answer change if the algorithm can also use a separate source of unbiased random bits?

    I believe that an algorithm like that does not exist for all functions that admit a Bernoulli factory.  For example, Luis Mendo (2019) proved a lower bound that applies, among other things, when _f_ is a polynomial, but this bound can be higher than the entropy bound for the polynomial with Bernstein coefficients (0, 9/10, 2/10, 7/10, 5/10), for example.  On the other hand, constant functions _f_ do admit such an algorithm, as already noted in Nacu and Peres.

    Thus, a natural question is: for which functions does an algorithm like this exist?

<a id=Partially_Sampled_Random_Numbers_for_Accurate_Sampling_of_Continuous_Distributions></a>
## Partially-Sampled Random Numbers for Accurate Sampling of Continuous Distributions

[**https://peteroupc.github.io/exporand.html**](https://peteroupc.github.io/exporand.html)

A _partially-sampled random number_ (PSRN) is a data structure holding the initial digits of a random number that is built up digit by digit.  The following is an open question on PSRNs.

Doing an arithmetic operation between two PSRNs is akin to doing an interval operation between those PSRNs, since a PSRN is ultimately a random number that lies in an interval.  However, as explained in "[**Arithmetic and Comparisons with PSRNs**](https://peteroupc.github.io/exporand.html#Arithmetic_and_Comparisons_with_PSRNs)", the result of the operation is an interval that bounds a random number that is _not_ always uniformly distributed in that interval.  For example, in the case of addition this distribution is triangular with a peak in the middle, and in the case of multiplication this distribution resembles a trapezoid.  What are the exact distributions of this kind for other interval arithmetic operations, such as division, ln, exp, sin, or other mathematical functions?

<a id=More_Algorithms_for_Arbitrary_Precision_Sampling></a>
## More Algorithms for Arbitrary-Precision Sampling

[**https://peteroupc.github.io/morealg.html**](https://peteroupc.github.io/morealg.html)

This page has more algorithms for sampling using partially-sampled random numbers, as well as more Bernoulli factory algorithms.  The following are requests and open questions for this article.

1. We would like to see new implementations of the following:
    - Algorithms that implement **InShape** for specific closed curves, specific closed surfaces, and specific signed distance functions.  Recall that **InShape** determines whether a box lies inside, outside, or partly inside or outside a given curve or surface.
    - Descriptions of new arbitrary-precision algorithms that use the skeleton given in the section "Building an Arbitrary-Precision Sampler".
2. The [**appendix**](https://peteroupc.github.io/morealg.html#Appendix) contains implementation notes for **InShape**, which determines whether a box is outside or partially or fully inside a shape.  However, practical implementations of **InShape** will generally only be able to evaluate a shape pointwise.  What are necessary and/or sufficient conditions that allow an implementation to correctly classify a box just by evaluating the shape pointwise?  See also my related Stack Exchange question: [**How can we check if an arbitrary shape covers a box (partially, fully, or not) if we can only evaluate the shape pointwise?**](https://stackoverflow.com/questions/64728693/how-can-we-check-if-an-arbitrary-shape-covers-a-box-partially-fully-or-not-i).
3. Take a polynomial _f_(_&lambda;_) of even degree _n_ of the form choose(_n_,_n_/2)\*_&lambda;_<sup>_n_/2</sup>\*(1&minus;_&lambda;_)<sup>_n_/2</sup>\*_k_, where _k_ is greater than 1 (thus all _f_'s Bernstein coefficients are 0 except for the middle one, which equals _k_).  Suppose _f_(1/2) lies in the interval (0, 1).  If we do the degree elevation, described in the [**appendix**](https://peteroupc.github.io/morealg.html#Appendix), enough times (at least _r_ times), then _f_'s Bernstein coefficients will all lie in [0, 1].  The question is: how many degree elevations are enough?  A [**MathOverflow answer**](https://mathoverflow.net/questions/381419/on-the-degree-elevation-needed-to-bring-bernstein-coefficients-to-0-1) showed that _r_ is at least _m_ = (_n_/_f_(1/2)<sup>2</sup>)/(1&minus;_f_(1/2)<sup>2</sup>), but is it true that floor(_m_)+1 elevations are enough?

<a id=Randomized_Estimation_Algorithms></a>
## Randomized Estimation Algorithms

[**https://peteroupc.github.io/estimation.html**](https://peteroupc.github.io/estimation.html)

Let _X_ be a stream of random numbers and let _f_(_x_) be a known continuous function.

1. Is there an algorithm, besides _Algorithm C_ or _Algorithm F_ in the article, that can find **E**\[_X_\] (or _f_(**E**\[_X_\])) with either a high probability of a "small" absolute error or one of a "small" relative error, when the distribution of _X_ is unbounded, and additional assumptions on the distribution of _X_ apply, such as&mdash;

    - being unimodal (having one peak) and symmetric (mirrored on each side of the peak), and/or
    - following a geometric distribution, and/or
    - having decreasing or nonincreasing probabilities?

    Notice that merely having finite moments is not enough (Theorem 3.4, Kunsch et al.).  Here, the accuracy tolerances for small error and high probability are user-specified.

2. How can _Algorithm D_ or _Algorithm E_ in the article be adapted to discontinuous functions _g_, so that the algorithm finds _g_(**E**[_X_]) with either a high probability of a "small" absolute error or one of a "small" relative error at all points in [0, 1] except at a "negligible" area around _g_'s discontinuities?  Is it enough to replace _g_ with a continuous function _f_ that equals _g_ everywhere except at that "negligible" area?  Here, the accuracy tolerances for small error, high probability, and "negligible" area are user-specified.

3. Is it true that _Algorithm F_ in the article remains valid when the sample size _n_ is ceil(abs(_M_)/(_&delta;_\*_&gamma;_<sup>_k_</sup>)), given that the stream's distribution is known to have a maximum _k_<sup>th</sup> central absolute moment of _M_?

<a id=Color_Topics_for_Programmers></a>
## Color Topics for Programmers

[**https://peteroupc.github.io/colorgen.html**](https://peteroupc.github.io/colorgen.html)

Should this document cover the following topics, and if so, how?

- The CAM02 color appearance model.
- Color rendering metrics for light sources, including color rendering index (CRI) and the metrics given in TM-30-15 by the Illuminating Engineering Society.

Does any of the following exist?

- A method for performing color calibration and color matching using a smartphone's camera and, possibly, a color calibration card and/or white balance card, provided that method is not covered by any active patents or pending patent applications.
- Reference source code for a method to match a desired color on paper given spectral reflectance curves of the paper and of the inks being used in various concentrations, provided that method is not covered by any active patents or pending patent applications.

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Keane, M. S., and O'Brien, G. L., "A Bernoulli factory", ACM Transactions on Modeling and Computer Simulation 4(2), 1994.</small>
- <small><sup id=Note2>(2)</sup> Łatuszyński, K., Kosmidis, I.,  Papaspiliopoulos, O., Roberts, G.O., "[**Simulating events of unknown probabilities via reverse time martingales**](https://arxiv.org/abs/0907.4018v2)", arXiv:0907.4018v2 [stat.CO], 2009/2011.</small>
- <small><sup id=Note3>(3)</sup> Mossel, Elchanan, and Yuval Peres. New coins from old: computing with unknown bias. Combinatorica, 25(6), pp.707-724.</small>
- <small><sup id=Note4>(4)</sup> Icard, Thomas F., "Calibrating generative models: The probabilistic Chomsky–Schützenberger hierarchy." Journal of Mathematical Psychology 95 (2020): 102308.</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
