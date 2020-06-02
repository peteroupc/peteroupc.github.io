# An Exact Beta Generator

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

This page introduces a new sampler for beta-distributed random numbers.  Unlike any other specially-designed beta sampler I am aware of, this sampler&mdash;

- avoids floating-point arithmetic, and
- samples from the beta distribution (with both parameters 1 or greater) to an arbitrary precision (and thus is "exact" in the sense defined in (Karney 2014)<sup>[**(1)**](#Note1)</sup>).

It takes advantage of a construct called the _Bernoulli factory_ (Keane and O'Brien 1994)<sup>[**(2)**](#Note2)</sup> (Flajolet et al., 2010)<sup>[**(3)**](#Note3)</sup>, which can simulate an arbitrary probability by transforming biased coins to biased coins, as well as the "geometric bag" technique by Flajolet and others (2010)<sup>[**(3)**](#Note3)</sup>, which generates heads or tails with a probability that is built up bit by bit.  One important feature of Bernoulli factories is that they can simulate a given probability _exactly_, without having to calculate that probability manually, which is important if the probability can be an irrational number that no computer can compute exactly (such as `pow(p, 1/2)` or `exp(-2)`).

This page shows Python code for my new sampler.

<a id=About_the_Beta_Distribution></a>
## About the Beta Distribution

The [**beta distribution**](https://en.wikipedia.org/wiki/Beta_distribution) is a bounded probability distribution; its two parameters, `alpha` and `beta`, are both greater than 0 and describe the distribution's shape.  Depending on `alpha` and `beta`, the shape can be a smooth peak or a smooth valley.  The beta distribution can take on values in the interval [0, 1].  Any value in this interval (`x`) can occur with a probability proportional to&mdash;

    pow(x, alpha - 1) * pow(1 - x, beta - 1).

Although `alpha` and `beta` can each be greater than 0, this sampler only works if both parameters are 1 or greater.

<a id=Sampler_Code></a>
## Sampler Code

The following Python code relies on a class I wrote called "[**bernoulli.py**](https://github.com/peteroupc/peteroupc.github.io/blob/master/bernoulli.py)", which collects a number of Bernoulli factories, some of which are relied on by the code below.  This includes the "geometric bag" mentioned earlier, as well as a Bernoulli factory that transforms a coin that produces heads with probability `p` with one that produces heads with probability `pow(p, y)`.  The case where `y` is in (0, 1) is due to recent work by Mendo (2019)<sup>[**(4)**](#Note4)</sup>.

This code is far from fast, though, at least in Python.

```python
import math
import random
import bernoulli
from fractions import Fraction

def betadist(b, ax, ay, bx, by, precision=53):
        # Beta distribution for alpha>=1 and beta>=1
        bag=[]
        # Create a "geometric bag" to hold a uniform random
        # number (U), described by Flajolet et al. 2010
        gb=lambda: b.geometric_bag(bag)
        # Complement of "geometric bag"
        gbcomp=lambda: b.geometric_bag(bag)^1
        bpower=Fraction(bx, by)-1
        apower=Fraction(ax, ay)-1
        while True:
           # Create a uniform random number (U) bit-by-bit, and
           # accept it with probability U^(a-1)*(1-U)^(b-1), which
           # is the unnormalized PDF of the beta distribution
           bag.clear()
           # Return 1 with probability U^(a-1)
           r=b.power(gb, apower)
           if r == 1:
              # Return 1 with probability (1-U)^(b-1)
              r=b.power(gbcomp, bpower)
              if r==1:
                 # Accepted, so fill up the "bag" and return the
                 # uniform number
                 return _fill_geometric_bag(bag, precision)

def _fill_geometric_bag(b, bag, precision):
        ret=0
        lb=min(len(bag), precision)
        for i in range(lb):
           if i>=len(bag) or bag[i]==None:
              ret=(ret<<1)|b.randbit()
           else:
              ret=(ret<<1)|bag[i]
        if len(bag) < precision:
           diff=precision-len(bag)
           ret=(ret<<diff)|random.randint(0,(1<<diff)-1)
        # Now we have a number that is a multiple of
        # 2^-precision.
        # NOTE: Although we convert to a floating-point
        # number here, this is not strictly necessary and
        # is merely for convenience.
        return ret*1.0/(1<<precision)

```

<a id=Correctness_Testing></a>
## Correctness Testing

To test the correctness of this sampler, the Kolmogorov&ndash;Smirnov test will be applied with various values of `alpha` and `beta` and the default precision of 53, using SciPy's `kstest` method.  The code for the test is very simple: `kst = scipy.stats.kstest(ksample, lambda x: scipy.stats.beta.cdf(x, alpha, beta))`, where `ksample` is a sample of random numbers generated using the sampler above.  Note that SciPy uses a two-sided Kolmogorov&ndash;Smirnov test by default.

This page will be updated with results of this test.  For each pair of parameters, five samples with 50,000 numbers per sample will be taken.

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> Karney, C.F.F., "Sampling exactly from the normal distribution", arXiv:1303.6257v2  [physics.comp-ph], 2014.</small>

<small><sup id=Note2>(2)</sup> Keane,  M.  S.,  and  O'Brien,  G.  L., "A  Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.</small>

<small><sup id=Note3>(3)</sup> Flajolet, P., Pelletier, M., Soria, M., "On Buffon machines and numbers", arXiv:0906.5560v2  [math.PR], 2010.</small>

<small><sup id=Note4>(4)</sup> Mendo, Luis. "An asymptotically optimal Bernoulli factory for certain functions that can be expressed as power series." Stochastic Processes and their Applications 129, no. 11 (2019): 4366-4384.</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
