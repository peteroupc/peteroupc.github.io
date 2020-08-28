# Accurate Functions for Probability Distributions

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

This page is intended to contain implementations of probability density and inverse cumulative distribution functions (inverse CDFs) for popular probability distributions, such as the normal, gamma, and beta distributions.  The difference here is that they return accurate answers to an arbitrary precision (rather than just for the commonly-used floating-point formats called _binary32_ and _binary64_).  They are needed in order to implement the rejection sampling and inversion methods described by Devroye and Gravel ((2016)<sup>[**(1)**](#Note1)</sup> and (2015)<sup>[**(2)**](#Note2)</sup>, respectively), which generate arbitrary-precision random numbers that follow a distribution as closely as possible.  Both samplers are [**implemented in Python**](https://github.com/peteroupc/peteroupc.github.io/blob/master/randomgen.py) as the `numbers_from_dist` and the `numbers_from_dist_inversion` methods, respectively.

A word about probability density functions and inverse CDFs:

* The [**_probability density function_**](https://en.wikipedia.org/wiki/Probability_density_function), or _PDF_, is, roughly and intuitively, a curve of weights 0 or greater, where for each number, the greater its weight, the more likely a number close to that number is randomly chosen.
* The _inverse CDF_ (also known as _quantile function_) maps numbers in the interval [0, 1\) to numbers in the distribution, from low to high.

Both functions normally take one number in and put one number out, but in the case of the sampling methods by Devroye and Gravel, special versions of these functions are needed.  Specifically:

* For the rejection sampler, `EPDF(min_x, max_x, precision)` calculates tight bounds of the PDF anywhere in a region of interest, namely, in the interval [`min_x` * 2<sup>`-precision`</sup>, `max_x` * 2<sup>`-precision`</sup>].   `EPDF` returns two values: the first is the greatest lower bound of the PDF anywhere in the region of interest, and the second is the least upper bound of the PDF anywhere in that region.
* For the inversion sampler, `EICDF(u, ubits, digitplaces)` calculates an accurate approximation to the quantile. Specifically, `EICDF` returns a number that is within `base`<sup>`-digitplaces`</sup> of the true quantile of `u` * `base`<sup>`-ubits`</sup>, and is monotonic for a given value of `digitplaces`.  `base` is the digit base of the accuracy, and `numbers_from_dist_inversion` can take any digit base (such as 2 for binary or 10 for decimal).

<a id=Functions></a>
## Functions

Generally, `EICDF` can make use of interval arithmetic, which provides rigorous error bounds on the result of calculations.  The following Python code is an example of `EICDF` that produces an accurate approximation of the exponential quantile, to within 10<sup>`-precision`</sup>, using interval arithmetic.

    def expoicdf(u, ubits, precision):
        """ Inverse CDF for the exponential distribution, implemented
             accurately using interval arithmetic. """
        intv = Fraction(u, 10 ** ubits)
        threshold = Fraction(1, 10 ** precision)
        while True:
           ret = 1 - intv
           ret = -(Interval(ret, prec=precision).log())
           if ret.isAccurateTo(threshold):
               return ret.midpoint()
           precision += 8

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Devroye, L., Gravel, C., "[The expected bit complexity of the von Neumann rejection
algorithm](https://arxiv.org/abs/1511.02273v2)", arXiv:1511.02273v2  \[cs.IT\], 2016.</small>
- <small><sup id=Note2>(2)</sup> Devroye, L., Gravel, C., "[**Sampling with arbitrary precision**](https://arxiv.org/abs/1502.02539v5)", arXiv:1502.02539v5 \[cs.IT\], 2015.</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
