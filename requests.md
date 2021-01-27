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

This is a page showing algorithms to turn a coin with an unknown probability of heads into a coin with a different probability of heads, also known as _Bernoulli factories_.  A _factory function_ is a function that relates the old probability to the new one.  Roughly speaking, a function can be a factory function only if it maps the interval [0, 1] to the interval [0, 1], is continuous, and doesn't touch 0 or 1 except possibly at the endpoints (Keane and O'Brien 1994)<sup>[**(1)**](#Note1)</sup>.

Attention is drawn to the requests and open questions on that page:

- [**https://peteroupc.github.io/bernoulli.html#Requests_and_Open_Questions**](https://peteroupc.github.io/bernoulli.html#Requests_and_Open_Questions)

Among other things, they relate to finding polynomial sequences, probabilities, and other mathematical constructions needed to apply certain Bernoulli factories.  These questions are reproduced below.

1. Let a permutation class (such as numbers in descending order) and two probability distributions D and E be given.  Consider the following algorithm: Generate a sequence of independent random numbers (where the first is distributed as D and the rest as E) until the sequence no longer follows the permutation class, then return _n_, which is how many numbers were generated this way, minus 1.  In this case:
    1. What is the probability that _n_ is returned?
    2. What is the probability that _n_ is odd or even or belongs to a certain class of numbers?
    3. What is the distribution function (CDF) of the first generated number given that _n_ is odd, or that _n_ is even?

    See also "[**Probabilities Arising from Certain Permutations**](https://peteroupc.github.io/bernoulli.html#Probabilities_Arising_from_Certain_Permutations)" and my Stack Exchange question [**Probabilities arising from permutations**](https://stats.stackexchange.com/questions/499864/probabilities-arising-from-permutations).
2. I request expressions of mathematical functions that can be expressed in any of the following ways:
    - Series expansions for continuous functions that equal 0 or 1 at the points 0 and 1.  These are required for Mendo's algorithm for [**certain power series**](https://peteroupc.github.io/bernoulli.html#Certain_Power_Series).
    - Series expansions for alternating power series whose coefficients are all in the interval [0, 1] and form a nonincreasing sequence.
    - Series expansions with non-negative coefficients and for which bounds on the truncation error are available.
    - Upper and lower bound approximations that converge to a given constant.  These upper and lower bounds must be nonincreasing or nondecreasing, respectively.
    - Sequences of approximating functions (such as rational functions) that converge from above and below to a given function.  These sequences must be nonincreasing or nondecreasing, respectively (but the approximating functions themselves need not be).
    - To apply the algorithms for [**general factory functions**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions), what is needed are two sequences of polynomials in Bernstein form, one of which converges from above to a given function, the other from below.  These sequences must be nonincreasing or nondecreasing, respectively (but the polynomials themselves need not be), and the polynomials must be of increasing degree and have Bernstein coefficients that are all rational numbers lying in \[0, 1\], but the polynomials in each sequence may start closer to the function at some points than at others.  There is also a technical requirement: For each sequence, the difference between one polynomial and the previous one must have non-negative Bernstein coefficients, once the latter polynomial is converted to have the same degree as the other (see Holtz et al. 2011<sup>[**(2)**](#Note2)</sup>).

        Especially helpful would be an automated procedure to compute such sequences, in terms of their Bernstein coefficients, for a large class of factory functions (such as min(_&lambda;_, _c_) where _c_ is a constant in (0, 1)).  (This is in the sense that when given only information about the desired function, such as the coordinates of the function's piecewise linear graph, the procedure can automatically compute the appropriate sequences without further user intervention.)

        I have found [**several methods**](https://math.stackexchange.com/questions/3889382) to compute such sequences, but most of them have issues that I seek clarification on.  For example, the method of Holtz et al. (2011)<sup>[**(2)**](#Note2)</sup> requires knowing the function's smoothness class and requires the function to be bounded away from 0 and 1; moreover the method uses several constants, namely _s_, _θ<sub>α</sub>_, and _D_, with no easy lower bounds.  As another example, Gal's method (1989)<sup>[**(3)**](#Note3)</sup> produces polynomials that converge too slowly to be practical.

        An intriguing suggestion from Thomas and Blanchet (2012)<sup>[**(4)**](#Note4)</sup> is to use multiple pairs of polynomial sequences that converge to _f_, where each pair is optimized for particular ranges of _&lambda;_: first flip the input coin several times to get a rough estimate of _&lambda;_, then choose the pair that's optimized for the estimated _&lambda;_, and simulate _f_(_&lambda;_) using the chosen polynomials.  The paper gives the example of min(_&lambda;_, 8/10).  Are there formulas for computing these sequences efficiently, unlike the paper's approach that requires computing an intersection of a curve with an approximating polynomial, which gets very inefficient as the polynomial's degree gets large?

        See also my questions on _Mathematics Stack Exchange_:

        - [**Computing converging polynomials**](https://math.stackexchange.com/questions/3904732/what-are-ways-to-compute-polynomials-that-converge-from-above-and-below-to-a-con).
        - [**Bounds of Bernstein coefficients**](https://math.stackexchange.com/questions/3929743/are-error-bounds-on-bernstein-form-polynomials-also-error-bounds-on-their-bernst).
    - Simple [**continued fractions**](https://peteroupc.github.io/bernoulli.html#Continued_Fractions) that express useful constants.

    All these expressions should not rely on floating-point arithmetic or the direct use of irrational constants (such as _&pi;_ or sqrt(2)), but may rely on rational arithmetic.  For example, a series expansion that _directly_ contains the constant _&pi;_ is not desired; however, a series expansion that converges to a fraction of _&pi;_ is.
3. Is there a simpler or faster way to implement the base-2 or natural logarithm of binomial coefficients?  See the example in the section "[**Certain Converging Series**](https://peteroupc.github.io/bernoulli.html#Certain_Converging_Series)".
4. According to (Mossel and Peres 2005)<sup>[**(5)**](#Note5)</sup>, a pushdown automaton can take a coin with unknown probability of heads of _&lambda;_ and turn it into a coin with probability of heads of _f_(_&lambda;_) only if _f_ is a factory function and can be a solution of a polynomial system with rational coefficients. (See "[**Certain Algebraic Functions**](https://peteroupc.github.io/bernoulli.html#Certain_Algebraic_Functions)".)  Are there any results showing whether the converse is true; namely, can a pushdown automaton simulate _any_ _f_ of this kind?  Note that this question is not quite the same as the question of which algebraic functions can be simulated by a context-free grammar (either in general or restricted to those of a certain ambiguity and/or alphabet size), and is not quite the same as the question of which _probability generating functions_ can be simulated by context-free grammars or pushdown automata, although answers to those questions would be nice.  (See also Icard 2019<sup>[**(6)**](#Note6)</sup>.  Answering this question might involve ideas from analytic combinatorics; e.g., see the recent works of Cyril Banderier and colleagues.)

<a id=Partially_Sampled_Random_Numbers_for_Accurate_Sampling_of_Continuous_Distributions></a>
## Partially-Sampled Random Numbers for Accurate Sampling of Continuous Distributions

[**https://peteroupc.github.io/exporand.html**](https://peteroupc.github.io/exporand.html)

A _partially-sampled random number_ (PSRN) is a data structure holding the initial digits of a random number that is built up digit by digit.  There are some open questions on PSRNs.

1. Are there constructions for PSRNs other than for cases given earlier in this document?  (The constructions include uniform PSRNs, where the digits are generated uniformly at random; as well as exponential PSRNs or e-rands, where the PSRN follows an exponential distribution.)
2. Doing an arithmetic operation between two PSRNs is akin to doing an interval operation between those PSRNs, since a PSRN is ultimately a random number that lies in an interval.  However, as explained in "[**Arithmetic and Comparisons with PSRNs**](https://peteroupc.github.io/exporand.html#Arithmetic_and_Comparisons_with_PSRNs)", the result of the operation is an interval that bounds a random number that is _not_ always uniformly distributed in that interval.  For example, in the case of addition this distribution is triangular with a peak in the middle, and in the case of multiplication this distribution resembles a trapezoid.  What are the exact distributions of this kind for other interval arithmetic operations, such as division, ln, exp, sin, or other mathematical functions?
3. Are the conjectures in the section "[**Setting Digits by Digit Probabilities**](https://peteroupc.github.io/exporand.html#Setting_Digits_by_Digit_Probabilities)" true?  See also my Stack Exchange question [**On random variables made up of independent random digits**](https://stats.stackexchange.com/questions/503096/on-random-variables-made-up-of-independent-random-digits).

<a id=More_Algorithms_for_Arbitrary_Precision_Sampling></a>
## More Algorithms for Arbitrary-Precision Sampling

[**https://peteroupc.github.io/morealg.html**](https://peteroupc.github.io/morealg.html)

This page has more algorithms for sampling using partially-sampled random numbers, as well as more Bernoulli factory algorithms.  The following are requests and open questions for this article.

1. We would like to see new implementations of the following:
    - Algorithms that implement **InShape** for specific closed curves, specific closed surfaces, and specific signed distance functions.  Recall that **InShape** determines whether a box lies inside, outside, or partly inside or outside a given curve or surface.
    - Descriptions of new arbitrary-precision algorithms that use the skeleton given in the section "Building an Arbitrary-Precision Sampler".
2. The [**appendix**](https://peteroupc.github.io/morealg.html#Appendix) contains implementation notes for **InShape**, which determines whether a box is outside or partially or fully inside a shape.  However, practical implementations of **InShape** will generally only be able to evaluate a shape pointwise.  What are necessary and/or sufficient conditions that allow an implementation to correctly classify a box just by evaluating the shape pointwise?  See also my related Stack Exchange question: [**How can we check if an arbitrary shape covers a box (partially, fully, or not) if we can only evaluate the shape pointwise?**](https://stackoverflow.com/questions/64728693/how-can-we-check-if-an-arbitrary-shape-covers-a-box-partially-fully-or-not-i).
3. Take a polynomial _f_(_&lambda;_) of even degree _n_ of the form choose(_n_,_n_/2)\*_&lambda;_<sup>_n_/2</sup>\*(1&minus;_&lambda;_)<sup>_n_/2</sup>\*_k_, where _k_ is greater than 1 (thus all _f_'s Bernstein coefficients are 0 except for the middle one, which equals _k_).  Suppose _f_(1/2) lies in the interval (0, 1).  If we do the degree elevation, described in the [**appendix**](https://peteroupc.github.io/morealg.html#Appendix), enough times (at least _r_ times), then _f_'s Bernstein coefficients will all lie in [0, 1].  The question is: how many degree elevations are enough?  A [**MathOverflow answer**](https://mathoverflow.net/questions/381419/on-the-degree-elevation-needed-to-bring-bernstein-coefficients-to-0-1) showed that _r_ is at least _m_ = (_n_/_f_(1/2)<sup>2</sup>)/(1&minus;_f_(1/2)<sup>2</sup>), but is it true that floor(_m_)+1 elevations are enough?

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
- <small><sup id=Note2>(2)</sup> Holtz, O., Nazarov, F., Peres, Y., "New Coins from Old, Smoothly", _Constructive Approximation_ 33 (2011).</small>
- <small><sup id=Note3>(3)</sup> Gal, S.G., "Constructive approximation by monotonous polynomial sequences in LipMα, with α ∈ (0, 1]", _Journal of Approximation Theory_ 59 (1989).</small>
- <small><sup id=Note4>(4)</sup> Thomas, A.C., Blanchet, J., "[**A Practical Implementation of the Bernoulli Factory**](https://arxiv.org/abs/1106.2508v3)", arXiv:1106.2508v3  [stat.AP], 2012.</small>
- <small><sup id=Note5>(5)</sup> Mossel, Elchanan, and Yuval Peres. New coins from old: computing with unknown bias. Combinatorica, 25(6), pp.707-724.</small>
- <small><sup id=Note6>(6)</sup> Icard, Thomas F., "Calibrating generative models: The probabilistic Chomsky–Schützenberger hierarchy." Journal of Mathematical Psychology 95 (2020): 102308.</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
