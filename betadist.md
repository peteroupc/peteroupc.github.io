# An Exact Beta Generator

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

This page introduces a new sampler for beta-distributed random numbers.  Unlike any other specially-designed beta sampler I am aware of, this sampler&mdash;

- avoids floating-point arithmetic, and
- samples from the beta distribution (with both parameters 1 or greater) to an arbitrary precision and with user-specified error bounds (and thus is "exact" in the sense defined in (Karney 2014)<sup>[**(1)**](#Note1)</sup>).

It takes advantage of a construct called the _Bernoulli factory_ (Keane and O'Brien 1994)<sup>[**(2)**](#Note2)</sup> (Flajolet et al., 2010)<sup>[**(3)**](#Note3)</sup>, which can simulate an arbitrary probability by transforming biased coins to biased coins, as well as the "geometric bag" technique to be described later.  One important feature of Bernoulli factories is that they can simulate a given probability _exactly_, without having to calculate that probability manually, which is important if the probability can be an irrational number that no computer can compute exactly (such as `pow(p, 1/2)` or `exp(-2)`).

This page shows Python code for my new sampler.

<a id=About_the_Beta_Distribution></a>
## About the Beta Distribution

The [**beta distribution**](https://en.wikipedia.org/wiki/Beta_distribution) is a bounded-domain probability distribution; its two parameters, `alpha` and `beta`, are both greater than 0 and describe the distribution's shape.  Depending on `alpha` and `beta`, the shape can be a smooth peak or a smooth valley.  The beta distribution can take on values in the interval [0, 1].  Any value in this interval (`x`) can occur with a probability proportional to&mdash;

    pow(x, alpha - 1) * pow(1 - x, beta - 1).               (1)

Although `alpha` and `beta` can each be greater than 0, this sampler only works if both parameters are 1 or greater.

<a id=Building_Blocks></a>
## Building Blocks

The beta sampler relies on several building blocks described in this section.

One of them is the "geometric bag" technique by Flajolet and others (2010)<sup>[**(3)**](#Note3)</sup>, which generates heads or tails with a probability that is built up bit by bit.   A _geometric bag_ is a list of items, where each item is a zero, a one, or a placeholder value (which represents an unsampled bit), and represents a list of the binary digits after the binary point, from left to right, of a real number in the interval [0, 1], that is, the number's _binary expansion_.

The algorithm **SampleGeometricBag** is a Bernoulli factory algorithm described as follows:

1.  Let N be a geometric random number with parameter 0.5.  That is, flip fair coins until tails is flipped, then let N be the number of heads flipped this way.
2.  If the item at position N in the geometric bag is 0 or 1, return that item. (Positions start at 0.)  Otherwise, set the item at that position to either 0 or 1 with equal probability, increasing the geometric bag's capacity as necessary, then return the newly set item.  (As a result, there may be "gaps" in the geometric bag where no bit was sampled yet.)

**SampleGeometricBagComplement** is the same as the **SampleGeometricBag** algorithm, except the return value is 1 minus the original return value.  The result is that if **SampleGeometricBag** outputs 1 with probability _U_, **SampleGeometricBagComplement** outputs 1 with probability 1 &minus; _U_.

**FillGeometricBag** generates a `p`-bit-precision number (a number with `p` binary digits after the point) from a geometric bag as follows:

1. For each position in [**0, `p`), if the item at that position is neither 0 nor 1, set the item there to either 0 or 1 with equal probability, increasing the geometric bag's capacity as necessary. (See also (Oberhoff 2018, sec. 8)<sup>[**(4)**](#Note4)</sup>.)
2. Take the first `p` bits of the geometric bag and return &Sigma;<sub>_i_=0, _p_-1</sub> bag[_i_] * 2<sup>-_i_-1</sup>.  (If it somehow happens that bits beyond `p` are set to 0 or 1, then the implementation could choose instead to fill all unsampled bits between the first and the last set bit and return the full number, optionally rounding it to a `p`-bit-precision number with a rounding mode of choice.)

**PowerBernoulliFactory** is a Bernoulli factory algorithm that transforms a coin that produces heads with probability `p` into a coin that produces heads with probability `pow(p, y)`.  The case where `y` is in (0, 1) is due to recent work by Mendo (2019)<sup>[**(5)**](#Note5)</sup>.  The algorithm takes a Bernoulli factory sub-algorithm (the coin that produces heads with probability `p`) as well as the parameter _y_, and is described as follows:

1. If _y_ is equal to 1, call the sub-algorithm and return the result.
2. If _y_ is greater than 1, call the sub-algorithm `floor(y)` times and call **PowerBernoulliFactory** (once) with _y_ = _y_ - floor(_y_).  Return 1 if all these calls return 1; otherwise, return 0.
3. _y_ is less than 1, so set _i_ to 1.
4. Call the sub-algorithm; if it returns 1, return 1.
5. Return 0 with probability _y_/_i_.
6. Add 1 to _i_ and go to step 4.

The **kthsmallest** method generates the 'k'th smallest 'bitcount'-bit uniform random number out of 'n' of them, is also relied on by this beta sampler.  It is used when both `a` and `b` are integers, based on the known property that a beta random variable in this case is the `a`th smallest uniform (0, 1) random number out of `a + b - 1` of them (Devroye 1986, p. 431)<sup>[**(6)**](#Note6)</sup>.

**kthsmallest**, however, doesn't simply generate 'n' 'bitcount'-bit numbers and then sort them.  Rather, it builds up their binary expansions bit by bit, via the concept of "u-rands" (Karney 2014)<sup>[**(1)**](#Note1)</sup>.    It uses the observation that each uniform (0, 1) random number is equally likely to be less than half or greater than half; thus, the number of uniform numbers that are less than half vs. greater than half follows a binomial(n, 1/2) distribution (and of the numbers less than half, say, the less-than-one-quarter vs. greater-than-one-quarter numbers follows the same distribution, and so on).  Thanks to this observation, the algorithm can generate a sorted sample "on the fly".

The algorithm is as follows:

1. Create `n` empty u-rands.
2. Set `index` to 1.
3. If `index <= k`:
    1. Generate `LC`, a binomial(`n`, 0.5) random number.
    2. Append a 0 bit to the first `LC` u-rands (starting at `index`) and a 1 bit to the next `n - LC` u-rands.
    3. If `LC > 1`, repeat step 3 and these substeps with the same `index` and `n = LC`.
    4. If `n - LC > 1`, repeat step 3 and these substeps with `index = index+LC`, and `n = n - LC`.
4. Take the `k`th u-rand (starting at 1) and fill it with uniform random bits as necessary to make a `bitcount`-bit number. (See also (Oberhoff 2018, sec. 8)<sup>[**(4)**](#Note4)</sup>.)  Return that u-rand.

<a id=The_Algorithm></a>
## The Algorithm

The full algorithm of the beta generator is as follows.  It takes three parameters: _a_ >= 1 and _b_ >= 1 are the parameters to the beta distribution, and _p_ > 0 is a precision parameter.

1. Special case: If _a_ = 0 and _b_ = 0, return a uniform _p_-bit-precision number (for example, RandomBits(_p_) / 2<sup>_p_</sup> where `RandomBits(x)` returns an x-bit block of unbiased random bits).
2. Special case: If _a_ and _b_ are both integers, return the result of **kthsmallest** with parameters (_a_ &minus; _b_ + 1) and _a_ in that order, and fill it as necessary to make a _p_-bit-precision number (similarly to **FillGeometricBag** above).
3. Create an empty list to serve as a "geometric bag".
4. While true:
     1. Remove all bits from the geometric bag.  This will result in an empty uniform random number, _U_, for the following steps, which will accept _U_ with probability _U_<sup>a&minus;1</sup>*(1&minus;_U_)<sup>b&minus;1</sup>) (the proportional probability for the beta distribution), as _U_ is built up.
     2. Call the **PowerBernoulliFactory** using the **SampleGeometricBag** algorithm and parameter _a_ &minus; 1 (which will return 1 with probability _U_<sup>a&minus;1</sup>).  If the result is 0, go to substep 1.
     3. Call the **PowerBernoulliFactory** using the **SampleGeometricBagComplement** algorithm and parameter _b_ &minus; 1 (which will return 1 with probability (1&minus;_U_)<sup>b&minus;1</sup>).  If the result is 0, go to substep 1. (Note that substeps 2 and 3 don't depend on each other and can be done in either order without affecting correctness, and this is taken advantage of in the Python code below.)
     4. _U_ was accepted, so return the result of **FillGeometricBag**.

<a id=Sampler_Code></a>
## Sampler Code

The following Python code implements the algorithm just described.  It relies on a class I wrote called "[**bernoulli.py**](https://github.com/peteroupc/peteroupc.github.io/blob/master/bernoulli.py)", which collects a number of Bernoulli factories, some of which are relied on by the code below.  This includes the building blocks mentioned earlier.  The Python code also relies on a method I wrote called `kthsmallest`, which generates the kth smallest number in an arbitrary precision.  This will be described later in this page.

This code is far from fast, though, at least in Python.

```
import math
import random
import bernoulli
from randomgen import RandomGen
from fractions import Fraction

def _toreal(ret, precision):
        # NOTE: Although we convert to a floating-point
        # number here, this is not strictly necessary and
        # is merely for convenience.
        return ret*1.0/(1<<precision)

def betadist(b, ax, ay, bx, by, precision=53):
        # Beta distribution for alpha>=1 and beta>=1
        bag=[]
        bpower=Fraction(bx, by)-1
        apower=Fraction(ax, ay)-1
        # Special case for a=b=1
        if bpower==0 and apower==0:
           return random.randint(0, (1<<precision)-1)*1.0/(1<<precision)
        # Special case if a and b are integers
        if int(bpower) == bpower and int(apower) == apower:
           a=int(Fraction(ax, ay))
           b=int(Fraction(bx, by))
           return _toreal(RandomGen().kthsmallest(a+b-1,a, \
                  precision), precision)
        # Create a "geometric bag" to hold a uniform random
        # number (U), described by Flajolet et al. 2010
        gb=lambda: b.geometric_bag(bag)
        # Complement of "geometric bag"
        gbcomp=lambda: b.geometric_bag(bag)^1
        bPowerBigger=(bpower > apower)
        while True:
           # Create a uniform random number (U) bit-by-bit, and
           # accept it with probability U^(a-1)*(1-U)^(b-1), which
           # is the unnormalized PDF of the beta distribution
           bag.clear()
           r=1
           if bPowerBigger:
             # Produce 1 with probability (1-U)^(b-1)
             r=b.power(gbcomp, bpower)
             # Produce 1 with probability U^(a-1)
             if r==1: r=b.power(gb, apower)
           else:
             # Produce 1 with probability U^(a-1)
             r=b.power(gb, apower)
             # Produce 1 with probability (1-U)^(b-1)
             if r==1: r=b.power(gbcomp, bpower)
           if r == 1:
                 # Accepted, so fill up the "bag" and return the
                 # uniform number
                 ret=_fill_geometric_bag(b, bag, precision)
                 return ret

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
           ret=(ret << diff)|random.randint(0,(1 << diff)-1)
        # Now we have a number that is a multiple of
        # 2^-precision.
        return _toreal(ret, precision)
```

<a id=Known_Issues></a>
### Known Issues

The bigger `alpha` or `beta` is, the smaller the area of acceptance becomes (and the more likely random numbers get rejected by this method, raising its run-time).  This is because `max(u^(alpha-1)*(1-u)^(beta-1))`, the peak of the density, approaches 0 as the parameters get bigger.  One idea to solve this issue is to expand the density so that the acceptance rate increases.  The following was tried:

- Estimate an upper bound for the peak of the density `peak`, given `alpha` and `beta`.
- Calculate a largest factor `c` such that `peak * c = m < 0.5`.
- Use Huber's `linear_lowprob` Bernoulli factory (implemented in _bernoulli.py_) (Huber 2016)<sup>[**(7)**](#Note7)</sup>, taking the values found for `c` and `m`.  Testing shows that the choice of `m` is crucial for performance.

But doing so apparently worsened the performance (in terms of random bits used) compared to the simple rejection approach.

<a id=Correctness_Testing></a>
## Correctness Testing

To test the correctness of this sampler, the Kolmogorov&ndash;Smirnov test was applied with various values of `alpha` and `beta` and the default precision of 53, using SciPy's `kstest` method.  The code for the test is very simple: `kst = scipy.stats.kstest(ksample, lambda x: scipy.stats.beta.cdf(x, alpha, beta))`, where `ksample` is a sample of random numbers generated using the sampler above.  Note that SciPy uses a two-sided Kolmogorov&ndash;Smirnov test by default.

See the results of the [**correctness testing**](https://peteroupc.github.io/betadistresults.html).   For each pair of parameters, five samples with 50,000 numbers per sample were taken, and results show the lowest and highest Kolmogorov&ndash;Smirnov statistics and p-values achieved for the five samples.  Note that a p-value extremely close to 0 or 1 strongly indicates that the samples do not come from the corresponding beta distribution.

<a id=Exact_Simulation_of_Continuous_Distributions_on_0_1></a>
## Exact Simulation of Continuous Distributions on [0, 1]

The beta distribution is one case of a general approach to simulating continuous distributions with support on the interval [0, 1], and this with arbitrary precision, thanks to Bernoulli factories.  This general approach can sample an `n`-bit binary expansion of a number following that continuous distribution, and is described as follows:

1. Create a "geometric bag", that is, an "empty" uniform random number also known as a "u-rand".
2. As the geometric bag builds up a uniform random number, accept the number with a probability that can be represented by Bernoulli factories, or reject it otherwise.  As shown by Keane and O'Brien <sup>[**(2)**](#Note2)</sup>, this is possible if and only if the probability function, in the interval [0, 1]&mdash;
    - is continuous everywhere, and
    - either returns a constant value in [0, 1] everywhere, or returns a value in [0, 1] at each of the points 0 and 1 and a value in (0, 1) at each other point,

   and they give the example of 2*p* as a probability function that cannot be represented by a Bernoulli factory.  In the case of constants, they can be represented by a geometric bag&mdash;
    - that is prefilled with the binary expansion of the constant in question, or
    - that uses a modified **SampleGeometricBag** algorithm in which the constant's binary expansion's bits are not sampled at random, but rather calculated "on the fly" and as necessary.

3. If the geometric bag is accepted, fill the unsampled bits of the bag with uniform random bits as necessary to make an `n`-bit number (similarly to **FillGeometricBag** above).

The beta distribution's probability function at (1) fits these requirements (for `alpha` and `beta` both greater than 1), since it's continuous and never returns 0 or 1 outside of the points 0 and 1, thus it can be simulated by Bernoulli factories and is covered by this general approach.

<a id=An_Example_The_Continuous_Bernoulli_Distribution></a>
### An Example: The Continuous Bernoulli Distribution

The continuous Bernoulli distribution (Loaiza-Ganem and Cunningham 2019)<sup>[**(8)**](#Note8)</sup> was designed to considerably improve performance of variational autoencoders (a machine learning model) in modeling continuous data that takes values in the interval [0, 1], including "almost-binary" image data.

The continous Bernoulli distribution takes one parameter `lamda` (a number in [0, 1]), and takes on values in the interval [0, 1] with a probability proportional to&mdash;

    pow(lamda, x) * pow(1 - lamda, 1 - x).

Again, this function meets the requirements stated by Keane and O'Brien, so it can be simulated via Bernoulli factories.  Thus, this distribution can be simulated in Python using a geometric bag (which represents _x_ in the formula above) and a two-coin exponentiating Bernoulli factory.

The **two-coin factory** has the following algorithm.  It is based on the **PowerBernoulliFactory** given earlier (including the algorithm from Mendo (2019)<sup>[**(5)**](#Note5)</sup>), but changed to accept a second Bernoulli factory sub-algorithm rather than a fixed value for the exponent. To the best of my knowledge, I am not aware of any other article or paper that presents this exact Bernoulli factory.

1. Set _i_ to 1.
2. Call the base sub-algorithm; if it returns 1, return 1.
3. Call the exponent sub-algorithm; if it returns 1, return 0 with probability 1/_i_.
4. Add 1 to _i_ and go to step 1.

The algorithm for sampling the continuous Bernoulli distribution follows.  It uses a **lambda Bernoulli factory** algorithm, which returns 1 with probability `lamda`.

1. Create an empty list to serve as a "geometric bag".
2. Create a **complementary lambda Bernoulli factory** that returns 1 minus the result of the **lambda Bernoulli factory**.
3. While true:
     1. Remove all bits from the geometric bag.  This will result in an empty uniform random number, _U_, for the following steps, which will accept _U_ with probability `lamda`<sup>_U_</sup>*(1&minus;`lamda`)<sup>1&minus;_U_</sup>) (the proportional probability for the beta distribution), as _U_ is built up.
     2. Call the **two-coin factory** using the **lambda Bernoulli factory** as the base and **SampleGeometricBag** as the exponent (which will return 1 with probability `lamda`<sup>_U_</sup>).  If the result is 0, go to substep 1.
     3. Call the **two-coin factory** using the **complementary lambda Bernoulli factory** as the base and **SampleGeometricBagComplement** algorithm and parameter _b_ &minus; 1 (which will return 1 with probability (1-`lamda`)<sup>1&minus;_U_</sup>).  If the result is 0, go to substep 1. (Note that substeps 2 and 3 don't depend on each other and can be done in either order without affecting correctness.)
     4. _U_ was accepted, so return the result of **FillGeometricBag**.

The Python code that samples the continuous Bernoulli distribution follows.

    def _twofacpower(b, fbase, fexponent):
        """ Bernoulli factory B(p, q) => B(p^q).
               - fbase, fexponent: Functions that return 1 if heads and 0 if tails.
                 The first is the base, the second is the exponent.
                 """
        i = 1
        while True:
            if fbase() == 1:
                return 1
            if fexponent() == 1 and \
                b.zero_or_one(1, i) == 1:
                return 0
            i = i + 1

    def contbernoullidist(b, lamda, precision=53):
        # Continuous Bernoulli distribution
        bag=[]
        lamda=Fraction(lamda)
        gb=lambda: b.geometric_bag(bag)
        # Complement of "geometric bag"
        gbcomp=lambda: b.geometric_bag(bag)^1
        fcoin=b.coin(lamda)
        lamdab=lambda: fcoin()
        # Complement of "lambda coin"
        lamdabcomp=lambda: fcoin()^1
        acc=0
        while True:
           # Create a uniform random number (U) bit-by-bit, and
           # accept it with probability lamda^U*(1-lamda)^(1-U), which
           # is the unnormalized PDF of the beta distribution
           bag.clear()
           # Produce 1 with probability lamda^U
           r=_twofacpower(b, lamdab, gb)
           # Produce 1 with probability (1-lamda)^(1-U)
           if r==1: r=_twofacpower(b, lamdabcomp, gbcomp)
           if r == 1:
                 # Accepted, so fill up the "bag" and return the
                 # uniform number
                 ret=_fill_geometric_bag(b, bag, precision)
                 return ret
           acc+=1

<a id=Acknowledgments></a>
## Acknowledgments

I acknowledge Claude Gravel who reviewed this article.

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> Karney, C.F.F., "[**Sampling exactly from the normal distribution**](https://arxiv.org/abs/1303.6257v2)", arXiv:1303.6257v2  [physics.comp-ph], 2014.</small>

<small><sup id=Note2>(2)</sup> Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.</small>

<small><sup id=Note3>(3)</sup> Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560v2)", arXiv:0906.5560v2  [math.PR], 2010.</small>

<small><sup id=Note4>(4)</sup> Oberhoff, Sebastian, "[**Exact Sampling and Prefix Distributions**](https://dc.uwm.edu/etd/1888)", _Theses and Dissertations_, University of Wisconsin Milwaukee, 2018.</small>

<small><sup id=Note5>(5)</sup> Mendo, Luis. "An asymptotically optimal Bernoulli factory for certain functions that can be expressed as power series." Stochastic Processes and their Applications 129, no. 11 (2019): 4366-4384.</small>

<small><sup id=Note6>(6)</sup> Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.</small>

<small><sup id=Note7>(7)</sup> Huber, M., "[**Optimal linear Bernoulli factories for small mean problems**](https://arxiv.org/abs/1507.00843v2)", arXiv:1507.00843v2 [math.PR], 2016</small>

<small><sup id=Note8>(8)</sup> Loaiza-Ganem, G., Cunningham, J.P., "[**The continuous Bernoulli: fixing a pervasive error in variational autoencoders**](https://arxiv.org/abs/1907.06845v5)", arXiv:1907.06845v5  [stat.ML], 2019.</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
