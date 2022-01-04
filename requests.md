# Requests and Open Questions

[**Peter Occil**](mailto:poccil14@gmail.com)

This page lists questions and issues relating to my articles posted on this site.  Any answers to these questions will greatly improve those articles.  If you can answer any of them, post an issue in the [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues).

<a id=Contents></a>
## Contents

- [**Contents**](#Contents)
- [**My Probability Questions**](#My_Probability_Questions)
- [**Randomization and Sampling Methods**](#Randomization_and_Sampling_Methods)
- [**Bernoulli Factory Algorithms**](#Bernoulli_Factory_Algorithms)
- [**Partially-Sampled Random Numbers for Accurate Sampling of Continuous Distributions**](#Partially_Sampled_Random_Numbers_for_Accurate_Sampling_of_Continuous_Distributions)
- [**More Algorithms for Arbitrary-Precision Sampling**](#More_Algorithms_for_Arbitrary_Precision_Sampling)
- [**Randomized Estimation Algorithms**](#Randomized_Estimation_Algorithms)
- [**Color Topics for Programmers**](#Color_Topics_for_Programmers)
- [**Notes**](#Notes)
- [**License**](#License)

<a id=My_Probability_Questions></a>
## My Probability Questions

The following is a list of my questions on _MathOverflow_ and other _Stack Exchange_ sites.  Can you help answer any of these?  Answers to them will greatly improve my articles on this site.

- [**Probabilities arising from permutations**](https://stats.stackexchange.com/questions/499864/probabilities-arising-from-permutations)
- [**Probability distributions computable by pushdown automata**](https://cstheory.stackexchange.com/questions/50826/probability-distributions-generated-by-pushdown-automata)
- [**Checking if a shape covers a box**](https://math.stackexchange.com/questions/3882545/what-conditions-ensure-that-checking-if-a-shape-covers-a-box-can-be-done-just-by)
- [**Estimating f(E(X)) with a guaranteed error performance**](https://stats.stackexchange.com/questions/522429/estimating-f-mathbbex-with-a-guaranteed-error-performance)
- [**A generalized randomized mean estimate based on the Chebyshev inequality**](https://stats.stackexchange.com/questions/555066/a-generalized-randomized-mean-estimate-based-on-the-chebyshev-inequality)

Other questions are also found in [**Open Questions on the Bernoulli Factory Problem**](https://peteroupc.github.io/bernreq.html#Tossing_Heads_According_to_a_Concave_Function).

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

<a id=Bernoulli_Factory_Algorithms></a>
## Bernoulli Factory Algorithms

[**https://peteroupc.github.io/bernoulli.html**](https://peteroupc.github.io/bernoulli.html)

This is a page showing algorithms to turn a coin with an unknown probability of heads into a coin with a different probability of heads, also known as _Bernoulli factories_.  A _factory function_ is a function that relates the old probability to the new one.  Roughly speaking, a function can be a factory function only if it is the constant 0 or 1, or if it is continuous on its domain and equals neither 0 nor 1 on the open interval (0, 1) (Keane and O'Brien 1994\)[^1].

Attention is drawn to the requests and open questions on that page:

- [**https://peteroupc.github.io/bernoulli.html#Requests_and_Open_Questions**](https://peteroupc.github.io/bernoulli.html#Requests_and_Open_Questions)

Among other things, they relate to finding polynomial sequences, probabilities, and other mathematical constructions needed to apply certain Bernoulli factories.  These questions are reproduced below.

1. What simulations exist that are "relatively simple" and succeed with an irrational probability between 0 and 1? What about "relatively simple" Bernoulli factory algorithms for factory functions?  Here, "relatively simple" means that the algorithm:
    - Should use only uniform random integers (or bits) and integer arithmetic.
    - Does not use floating-point arithmetic or make direct use of square root or transcendental functions.
    - Should not use rational arithmetic or increasingly complex approximations, except as a last resort.

    See also Flajolet et al. (2010\)[^2].  There are many ways to describe the irrational probability or factory function. I seek references to papers or books that describe irrational constants or factory functions in any of the following ways:

    - For irrational constants:
        - Simple [**continued fraction**](https://peteroupc.github.io/bernoulli.html#Continued_Fractions) expansions.
        - Closed shapes inside the unit square whose area is an irrational number.  (Includes algorithms that tell whether a box lies inside, outside, or partly inside or outside the shape.)    [**Example.**](https://peteroupc.github.io/morealg.html#pi___4)
        - Generate a uniform (_x_, _y_) point inside a closed shape, then return 1 with probability _x_.  For what shapes is the expected value of _x_ an irrational number?  [**Example.**](https://peteroupc.github.io/morealg.html#4_3___pi)
        - Functions that map [0, 1] to [0, 1] whose integral (area under curve) is an irrational number.
    - For Bernoulli factory functions:
        - Functions with any of the following series expansions, using rational arithmetic only:
            - Series with non-negative terms where _f_(0) is 0 and _f_(1) is rational or vice versa (see "[**Certain Power Series**](https://peteroupc.github.io/bernoulli.html#Certain_Power_Series)").
            - Series with non-negative terms that can be "tucked" under a discrete probability mass function (see "[**Convex Combinations**](https://peteroupc.github.io/bernoulli.html#Convex_Combinations)").
            - Alternating power series (see "[**Certain Power Series**](https://peteroupc.github.io/bernoulli.html#Certain_Power_Series)").
            - Series with non-negative terms and bounds on the truncation error (see "[**Certain Converging Series**](https://peteroupc.github.io/bernoulli.html#Certain_Converging_Series)").
        - A way to compute two sequences of polynomials written in Bernstein form that converge from above and below to a factory function as follows: (a) Each sequence's polynomials must have coefficients lying in \[0, 1\], and be of increasing degree; (b) the degree-_n_ polynomials' coefficients must lie at or "inside" those of the previous upper polynomial and the previous lower one (once the polynomials are elevated to degree _n_).  For a formal statement of these polynomials, see my [**question on MathOverflow**](https://mathoverflow.net/questions/379858).<br><br>The [**supplemental notes**](https://peteroupc.github.io/bernsupp.html) include formulas for computing these polynomials for large classes of factory functions, but none of them ensure a finite expected number of coin flips in general, and it is suspected that a finite number of flips isn't possible unless the factory function has four or more continuous derivatives ("slope functions") that are "nice" enough.  Thus one question is: Given such a factory function, are there practical algorithms for building polynomials described here, where the expected number of coin flips is finite (besides the algorithms in this article or the supplemental notes)?  One example worth pondering is sin(_&lambda;_ \* _&pi;_/2) = cos((1&minus;_&lambda;_ \* _&pi;_/2), which equals 0 at 0 and 1 at 1.
2. Let a permutation class (such as numbers in descending order) and two continuous probability distributions _D_ and _E_ be given.  Consider the following algorithm: Generate a sequence of independent random numbers (where the first is distributed as _D_ and the rest as _E_) until the sequence no longer follows the permutation class, then return _n_, which is how many numbers were generated this way minus 1.  In this case:
    1. What is the probability that _n_ is returned?
    2. What is the probability that _n_ is odd or even or belongs to a certain class of numbers?
    3. For each _x_, what is the probability that the first generated number is _x_ or less given that _n_ is odd? ...given that _n_ is even the last generated number?

    Obviously, these answers depend on the specific permutation class and/or distributions _D_ and _E_.  See also my Stack Exchange question [**Probabilities arising from permutations**](https://stats.stackexchange.com/questions/499864/probabilities-arising-from-permutations).
3. Is there a simpler or faster way to implement the base-2 or natural logarithm of binomial coefficients?  See the example in the section "[**Certain Converging Series**](https://peteroupc.github.io/bernoulli.html#Certain_Converging_Series)".
4. Part of the reverse-time martingale algorithm of Łatuszyński et al. (2009/2011\)[^3] \(see "[**General Factory Functions**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions)") to simulate a factory function _f_(_&lambda;_) is as follows.  For each _n_ starting with 1:
    1. Flip the input coin, and compute the _n_<sup>th</sup> upper and lower bounds of _f_ given the number of heads so far, call them _L_ and _U_.
    2. Compute the (_n_&minus;1)<sup>th</sup> upper and lower bounds of _f_ given the number of heads so far, call them _L&prime;_ and _U&prime;_.  (These bounds must be the same regardless of the outcomes of future coin flips, and the interval [_L&prime;_, _U&prime;_] must equal or entirely contain the interval [_L_, _U_].)

    These parts of the algorithm appear to work for any two sequences of functions (not just polynomials) that converge to _f_, where _L_ or _L&prime;_ and _U_ or _U&prime;_ are their lower and upper bound approximations.  The section on general factory functions shows how this algorithm can be implemented for polynomials.  But how do these steps work when the approximating functions (the functions that converge to _f_) are rational functions whose coefficients are integers? Rational functions whose coefficients are rational numbers? Arbitrary approximating functions?
5. A _pushdown automaton_ is a state machine that holds a stack of symbols.  Mossel and Peres (2005\)[^4] investigated which functions (_f_(_&lambda;_)) can be simulated by these machines when they're given an infinite "tape" of flips of a coin that shows heads with probability _&lambda;_.  They showed that pushdown automata can simulate only _algebraic functions_, but perhaps not all of them. The question is: What is the exact class of algebraic functions a pushdown automaton can simulate?  Can it simulate the functions min(_&lambda;_, 1&minus;_&lambda;_) and _&lambda;_<sup>1/_p_</sup> where _p_>2 is a prime number?  I have written an [**article appendix**](https://peteroupc.github.io/morealg.html#Pushdown_Automata_and_Algebraic_Functions) showing my progress, but are there other results on this question?
6. The following is an open question in Nacu and Peres 2005.  Let _J_ be a closed interval on (0, 1), such as \[1/100, 99/100].  Suppose there is an algorithm that takes a coin with unknown probability of heads _&lambda;_ and produces one or more samples of the probability _f_(_&lambda;_).  When the probability _&lambda;_ can be any value in _J_, is it possible for this algorithm to have an expected number of input coin flips per sample that is arbitrarily close to the so-called _entropy bound_?  The entropy bound is _h_(_f_(_&lambda;_))/_h_(_&lambda;_) where _h_(_x_) = &minus;_x_\*ln(_x_)&minus;(1&minus;_x_)\*ln(1&minus;_x_) is related to the Shannon entropy function.  Does the answer change if the algorithm can also use a separate source of unbiased random bits?  See my section "[**Multiple-Output Bernoulli Factory**](https://peteroupc.github.io/bernsupp.html#Multiple_Output_Bernoulli_Factory)".
7. A factory function _f_(_&lambda;_) is _strongly simulable_ if there is an algorithm to toss heads with probability _f_(_&lambda;_) using only a coin that shows heads with probability _&lambda;_ and no other randomness.  Keane and O'Brien (1994) showed already that _f_(_&lambda;_) is strongly simulable if neither 0 nor 1 is in _f_'s domain.  It's also easy to show that if _f_ is strongly simulable, then _f_(0) and _f_(1) must each be 0, 1, or undefined.  Is this a _sufficient condition_ to be strongly simulable?  I have written an [**article appendix**](https://peteroupc.github.io/bernsupp.html#Which_functions_don_t_require_outside_randomness_to_simulate) showing my progress, but are there other results on this question?

<a id=Partially_Sampled_Random_Numbers_for_Accurate_Sampling_of_Continuous_Distributions></a>
## Partially-Sampled Random Numbers for Accurate Sampling of Continuous Distributions

[**https://peteroupc.github.io/exporand.html**](https://peteroupc.github.io/exporand.html)

A _partially-sampled random number_ (PSRN) is a data structure holding the initial digits of a random number that is built up digit by digit.

- The following is an open question on PSRNs.  Doing an arithmetic operation between two PSRNs is akin to doing an interval operation between those PSRNs, since a PSRN is ultimately a random number that lies in an interval.  However, as explained in "[**Arithmetic and Comparisons with PSRNs**](https://peteroupc.github.io/exporand.html#Arithmetic_and_Comparisons_with_PSRNs)", the result of the operation is an interval that bounds a random number that is _not_ always uniformly distributed in that interval.  For example, in the case of addition this distribution is triangular with a peak in the middle.  What are the exact distributions of this kind for other interval arithmetic operations, such as division, ln, exp, sin, or other mathematical functions?

<a id=More_Algorithms_for_Arbitrary_Precision_Sampling></a>
## More Algorithms for Arbitrary-Precision Sampling

[**https://peteroupc.github.io/morealg.html**](https://peteroupc.github.io/morealg.html)

This page has more algorithms for sampling using partially-sampled random numbers, as well as more Bernoulli factory algorithms.  The following are requests and open questions for this article.

1. We would like to see new implementations of the following:
    - Algorithms that implement **InShape** for specific closed curves, specific closed surfaces, and specific signed distance functions.  Recall that **InShape** determines whether a box lies inside, outside, or partly inside or outside a given curve or surface.
    - Descriptions of new arbitrary-precision algorithms that use the skeleton given in the section "Building an Arbitrary-Precision Sampler".
2. The [**appendix**](https://peteroupc.github.io/morealg.html#Appendix) contains implementation notes for **InShape**, which determines whether a box is outside or partially or fully inside a shape.  However, practical implementations of **InShape** will generally only be able to evaluate a shape pointwise.  What are necessary and/or sufficient conditions that allow an implementation to correctly classify a box just by evaluating the shape pointwise?  See also my related Stack Exchange question: [**How can we check if an arbitrary shape covers a box (partially, fully, or not) if we can only evaluate the shape pointwise?**](https://stackoverflow.com/questions/64728693/how-can-we-check-if-an-arbitrary-shape-covers-a-box-partially-fully-or-not-i).
3. Take a polynomial _f_(_&lambda;_) of even degree _n_ of the form choose(_n_,_n_/2)\*_&lambda;_<sup>_n_/2</sup>\*(1&minus;_&lambda;_)<sup>_n_/2</sup>\*_k_, where _k_ is greater than 1 (thus all _f_'s Bernstein coefficients are 0 except for the middle one, which equals _k_).  Suppose _f_(1/2) lies in the interval (0, 1).  If we do the degree elevation, described in the [**appendix**](https://peteroupc.github.io/morealg.html#Appendix), enough times (at least _r_ times), then _f_'s Bernstein coefficients will all lie in [0, 1].  The question is: how many degree elevations are enough?  A [**MathOverflow answer**](https://mathoverflow.net/questions/381419/on-the-degree-elevation-needed-to-bring-bernstein-coefficients-to-0-1) showed that _r_ is at least _m_ = (_n_/_f_(1/2)<sup>2</sup>)/(1&minus;_f_(1/2)<sup>2</sup>), but is it true that floor(_m_)+1 elevations are enough?
4. A [**_finite-state generator_**](https://peteroupc.github.io/morealg.html#Finite_State_and_Pushdown_Generators) is a finite-state machine that generates a real number's base-2 expansion such as 0.110101100..., driven by flips of a coin.  A _pushdown generator_ is a finite-state generator with a stack of memory.  Both generators produce real numbers with a given probability distribution.  For example, a generator with a loop that outputs 0 or 1 at an equal chance produces a _uniform distribution_.  The following questions ask what kinds of distributions are possible with these generators.

    1. Of the probability distributions that a finite-state generator can generate, what is the exact class of:
        - _Discrete distributions_ (those that cover a finite or countably infinite set of values)?
        - _Absolutely continuous distributions_ (those with a probability density function such as the uniform or triangular distribution)?
        - _Singular distributions_ (covering an uncountable but zero-volume set)?
        - Distributions with _continuous_ density functions?
    2. Same question as 1, but for pushdown generators.
    3. Of the probability distributions that a pushdown generator can generate, what is the exact class of distributions with piecewise density functions whose pieces have infinitely many "slope" functions?  (The answer is known for finite-state generators.)

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

[^1]: Keane, M. S., and O'Brien, G. L., "A Bernoulli factory", ACM Transactions on Modeling and Computer Simulation 4(2), 1994.

[^2]: Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560)", arXiv:0906.5560  [math.PR], 2010.

[^3]: Łatuszyński, K., Kosmidis, I.,  Papaspiliopoulos, O., Roberts, G.O., "[**Simulating events of unknown probabilities via reverse time martingales**](https://arxiv.org/abs/0907.4018v2)", arXiv:0907.4018v2 [stat.CO], 2009/2011.

[^4]: Mossel, Elchanan, and Yuval Peres. New coins from old: computing with unknown bias. Combinatorica, 25(6), pp.707-724.

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
