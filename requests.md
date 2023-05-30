# Requests and Open Questions

[**Peter Occil**](mailto:poccil14@gmail.com)

This page lists questions and issues relating to my articles posted on this site.  Any answers to these questions will greatly improve those articles.  If you can answer any of them, post an issue in the [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues).

<a id=Contents></a>
## Contents

- [**Contents**](#Contents)
- [**My Probability Questions**](#My_Probability_Questions)
- [**Randomization and Sampling Methods**](#Randomization_and_Sampling_Methods)
- [**Bernoulli Factory Algorithms**](#Bernoulli_Factory_Algorithms)
- [**Partially-Sampled Random Numbers**](#Partially_Sampled_Random_Numbers)
- [**Randomized Estimation Algorithms**](#Randomized_Estimation_Algorithms)
- [**Color Topics for Programmers**](#Color_Topics_for_Programmers)
- [**Notes**](#Notes)
- [**License**](#License)

<a id=My_Probability_Questions></a>
## My Probability Questions

The following two pages describe questions I have also posted on _MathOverflow_ and other _Stack Exchange_ sites.  Can you help answer any of these?  Answers to them will greatly improve my articles on this site.

- [**Open Questions on the Bernoulli Factory Problem**](https://peteroupc.github.io/bernreq.html)
- [**Other Open Questions on Probability**](https://peteroupc.github.io/requestsother.html)

<a id=Randomization_and_Sampling_Methods></a>
## Randomization and Sampling Methods

**Size Reduction Sought:**

Of the articles in this repository, [**Randomization and Sampling Methods**](https://peteroupc.github.io/randomfunc.html) and [**More Random Sampling Methods**](https://peteroupc.github.io/randomnotes.html) combined are very long.

These articles describe numerous algorithms to generate random variates (from discrete and continuous distributions) as well as perform random sampling with and without replacement, shuffling, geometric sampling, and more, assuming a source of "truly" random numbers is available.

I would like to reduce the size of these articles while maintaining the most relevant algorithms for random variate generation.

Here are my goals for both articles:

- To shorten the [**Randomization with Real Numbers**](https://peteroupc.github.io/randomfunc.html#Randomization_with_Real_Numbers) section as much as possible, while still describing the most general (and exact) algorithms possible for sampling real numbers of any distribution.
- To put emphasis on algorithms that work with random integers (or, if necessary, rational numbers), rather than random floating-point numbers.
- To put emphasis on algorithms that sample a distribution _exactly_, or at least with a controlled upper bound on the error.  For discussion, see  "[**Exact, Error-Bounded, and Approximate Algorithms**](https://peteroupc.github.io/randomnotes.html#Exact_Error_Bounded_and_Approximate_Algorithms)".
- To ensure the documents are easy for programmers to understand and implement.

<a id=Bernoulli_Factory_Algorithms></a>
## Bernoulli Factory Algorithms

- [**https://peteroupc.github.io/bernoulli.html**](https://peteroupc.github.io/bernoulli.html)

This page shows algorithms to turn a coin with an unknown probability of heads into a coin with a different probability of heads, also known as _Bernoulli factories_.  A _factory function_ is a function that relates the old probability to the new one.  Roughly speaking, a function can be a factory function only if it is the constant 0 or 1, or if it is continuous on its domain and equals neither 0 nor 1 on the open interval (0, 1) (Keane and O'Brien 1994\)[^1].

For open questions, see "[**Open Questions on the Bernoulli Factory Problem**](https://peteroupc.github.io/bernreq.html)".

<a id=Partially_Sampled_Random_Numbers></a>
## Partially-Sampled Random Numbers

- [**https://peteroupc.github.io/exporand.html**](https://peteroupc.github.io/exporand.html)

This page describes a structure for storing a random variate with arbitrary precision.

1. We would like to see new implementations of the following:
    - Algorithms that implement **InShape** for specific closed curves, specific closed surfaces, and specific signed distance functions.  Recall that **InShape** determines whether a box lies inside, outside, or partly inside or outside a given curve or surface.
    - Descriptions of algorithms for non-discrete distributions that satisfy the [**properties for partially-sampled random number algorithms**](https://peteroupc.github.io/exporand.html#Properties).
    - Descriptions of new arbitrary-precision algorithms that use the skeleton given in the section "[**Building an Arbitrary-Precision Sampler**](#https://peteroupc.github.io/exporand.html#Building_an_Arbitrary_Precision_Sampler)".
3. Take a polynomial _f_(_&lambda;_) of even degree _n_ of the form choose(_n_,_n_/2)\*_&lambda;_<sup>_n_/2</sup>\*(1&minus;_&lambda;_)<sup>_n_/2</sup>\*_k_, where _k_ is greater than 1 (thus all _f_'s Bernstein coefficients are 0 except for the middle one, which equals _k_).  Suppose _f_(1/2) lies in the interval (0, 1).  If we do the degree elevation enough times (at least _r_ times), then _f_'s Bernstein coefficients will all lie in [0, 1].  The question is: how many degree elevations are enough?  A [**MathOverflow answer**](https://mathoverflow.net/questions/381419/on-the-degree-elevation-needed-to-bring-bernstein-coefficients-to-0-1) showed that _r_ is at least _m_ = (_n_/_f_(1/2)<sup>2</sup>)/(1&minus;_f_(1/2)<sup>2</sup>), but is it true that floor(_m_)+1 elevations are enough?

For other open questions, see "[**Other Open Questions on Probability**](https://peteroupc.github.io/requestsother.html)".

<a id=Randomized_Estimation_Algorithms></a>
## Randomized Estimation Algorithms

[**https://peteroupc.github.io/estimation.html**](https://peteroupc.github.io/estimation.html)

For open questions, see "[**Questions on Estimation Algorithms**](https://peteroupc.github.io/requestsother.html#Questions_on_Estimation_Algorithms)".

<a id=Color_Topics_for_Programmers></a>
## Color Topics for Programmers

[**https://peteroupc.github.io/colorgen.html**](https://peteroupc.github.io/colorgen.html)

Should this document cover the following topics, and if so, how?

- The CAM02 color appearance model.
- Color rendering metrics for light sources, including color rendering index (CRI) and the metrics given in TM-30-15 by the Illuminating Engineering Society.

Does any of the following exist?

- A method for performing color calibration and color matching using a smartphone's camera and, possibly, a color calibration card or white balance card, provided that method is not covered by any active patents or pending patent applications.
- Reference source code for a method to match a desired color on paper given spectral reflectance curves of the paper and of the inks being used in various concentrations, provided that method is not covered by any active patents or pending patent applications.

<a id=Notes></a>
## Notes

[^1]: Keane, M. S., and O'Brien, G. L., "A Bernoulli factory", ACM Transactions on Modeling and Computer Simulation 4(2), 1994.

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
