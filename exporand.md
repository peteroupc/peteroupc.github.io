# Partially-Sampled Exponential Random Numbers

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

This page introduces an implementation of _partially-sampled_ exponential random numbers.   Called _e-rands_ in this document, they represent incomplete numbers whose contents are determined only when necessary, making them have potentially arbitrary precision.  [**See the section "Code" for sample Python code**](#Code).

Moreover, this document includes methods that operate on e-rands in a way that uses only uniform random bits, and without relying on floating-point arithmetic (except for conversion purposes in the example method `exprand`).  Also, the methods support e-rands with an arbitrary rate parameter (&lambda;) greater than 0.

There are papers that discuss generating exponential random numbers using random bits (Flajolet and Saheb 1982)<sup>[**(1)**](#Note1)</sup>, (Karney 2014)<sup>[**(2)**](#Note2)</sup>, (Devroye and Gravel 2015)<sup>[**(3)**](#Note3)</sup>, (Thomas and Luk 2008)<sup>[**(4)**](#Note4)</sup>, but none I am aware of deal with generating partially-sampled exponential random numbers using an arbitrary rate, not just 1.

<a id=About_the_Exponential_Distribution></a>
## About the Exponential Distribution

The _exponential distribution_ takes a parameter &lambda;.  Informally speaking, a random number that follows an exponential distribution is the number of units of time between one event and the next, and &lambda; is the expected average number of events per unit of time.  Usually, &lambda; is equal to 1.

An exponential random number is commonly generated as follows: `-ln(1 - RNDU01()) / lamda`, where `RNDU01()` is a uniform random number in the interval \[0, 1).  (This particular formula is not robust, though, for reasons that are outside the scope of this document, but see (Pedersen 2018)<sup>[**(5)**](#Note5)</sup>.)  This page presents an alternative way to sample exponential random numbers.

<a id=About_Partially_Sampled_Random_Numbers></a>
## About Partially-Sampled Random Numbers

In this document, a _partially-sampled_ random number is a data structure that allows a random number that exactly follows a continuous distribution to be sampled digit by digit and with arbitrary precision, without relying on floating-point arithmetic or calculations of irrational or transcendental numbers (other than digit extractions).  Informally, they represent incomplete real numbers whose contents are sampled only when necessary, but in a way that follows the distribution being sampled.

The most trivial example of a _partially-sampled_ random number is that of the uniform distribution in [0, 1].  Such a random number can be implemented as a list of items, where each item is either a digit (such as zero or one for binary), or a placeholder value (which represents an unsampled digit), and represents a list of the digits after the radix point, from left to right, of a real number in the interval [0, 1], that is, the number's _digit expansion_ (e.g., _binary expansion_ in the case of binary digits).  This kind of number is referred to&mdash;

- as a _geometric bag_ in (Flajolet et al. 2010)<sup>[**(6)**](#Note6)</sup> (but only in the binary case), and
- as a _u-rand_ in (Karney 2014)<sup>[**(2)**](#Note2)</sup>.

Each additional bit is sampled simply by setting it to an independent unbiased random digit, an observation that dates from von Neumann (1951)<sup>[**(7)**](#Note7)</sup> in the binary case.

Partially-sampled numbers of other distributions can be implemented via rejection from the uniform distribution. For example:

1. The beta and continuous Bernoulli distributions, as discussed in my companion document on an [**exact beta generator**](https://peteroupc.github.io/betadist.html).
2. The standard normal distribution, as shown in (Karney 2014)<sup>[**(2)**](#Note2)</sup> by running Karney's Algorithm N and filling unsampled digits uniformly at random.
3. For uniform distributions in \[0, _n_\) (not just [0, 1]), a partially-sampled version might be trivial by first ensuring that the first "few" digits are such that the resulting number will be less than _n_, via rejection sampling.

For these distributions (and others that are continuous almost everywhere and bounded from above), Oberhoff (2018)<sup>[**(8)**](#Note8)</sup> proved that unsampled trailing bits of the partially-sampled number converge to the uniform distribution.

As an additional example, in this document a partially-sampled exponential random number (or _e-rand_, named similarly to Karney's "u-rands" for partially-sampled uniform random numbers (Karney 2014)<sup>[**(2)**](#Note2)</sup>) samples each bit that, when combined with the existing bits, results in an exponentially-distributed random number of the given rate.  Also, because `-ln(1 - RNDU01())` is exponentially distributed, e-rands can also represent the natural logarithm of a partially-sampled uniform random number in (0, 1].  The difference here is that additional bits are sampled not as unbiased random bits, but rather as bits with a vanishing bias.

Partially sampled numbers could also be implemented via rejection from the exponential distribution, although no concrete examples are presented here.

On the other hand, the concept of _prefix distributions_ (Oberhoff 2018)<sup>[**(8)**](#Note8)</sup> comes close to partially-sampled random numbers, but numbers sampled this way are not partially-sampled random numbers in the sense used here.  This is because the method requires calculating minimums of probabilities (and, in practice, requires the use of floating-point arithmetic in most cases).  Moreover, the method samples from a discrete distribution whose progression depends on the value of previously sampled bits, not just on the position of those bits as with the uniform and exponential distributions (see also (Thomas and Luk 2008)<sup>[**(4)**](#Note4)</sup>).

Two partially-sampled random numbers, each of a different distribution but storing digits of the same radix, can be exactly compared to each other using an algorithm similar to the following. The **RandLess** algorithm compares two partially-sampled random numbers, **a** and **b** (and samples additional bits from them as necessary) and returns `true` if **a** turns out to be less than **b**, or `false` otherwise (see also (Karney 2014)<sup>[**(2)**](#Note2)</sup>)).

1. If **a**'s integer part wasn't sampled yet, sample **a**'s integer part.  Do the same for **b**.
2. Return `true` if **a**'s integer part is less than **b**'s, or `false` if **a**'s integer part is greater than **b**'s.
3. Set _i_ to 0.
4. If **a**'s fractional part has _i_ or fewer digits, sample digit _i_ of **a** (positions start at 0 where 0 is the most significant digit after the point, 1 is the next, etc.), and append the result to that fractional part's digit expansion.  Do the same for **b**.
5. Return `true` if **a**'s fractional part is less than **b**'s, or `false` if **a**'s fractional part is greater than **b**'s.
6. Add 1 to _i_ and go to step 4.

<a id=Building_Blocks></a>
## Building Blocks

This section describes the building-blocks used in the sampling algorithm and the code to follow.  Sampling an e-rand makes use of two observations (based on the parameter &lambda; of the exponential distribution):

- While a coin flip with probability of heads of exp(-&lambda;) is heads, the exponential random number is increased by 1.
- If a coin flip with probability of heads of 1/(1+exp(&lambda;/2<sup>_k_</sup>)) is heads, the exponential random number is increased by 2<sup>-_k_</sup>, where _k_ > 0 is an integer.

(Devroye and Gravel 2015)<sup>[**(3)**](#Note3)</sup> already made these observations in their Appendix, but only for &lambda; = 1.

To implement these probabilities using just random bits, the sampler uses two algorithms:

1. One to simulate a probability of the form `exp(-x/y)` (**ZeroOrOneExpMinus**).
2. One to simulate a probability of the form `1/(1+exp(x/(y*pow(2, prec))))` (**LogisticExp**).

These two algorithms enable e-rands with rational-valued &lambda; parameters and are described below.

The **ZeroOrOneExpMinus** algorithm takes integers _x_ >= 0 and _y_ > 0 and outputs 1 with probability `exp(-x/y)` or 0 otherwise. It originates from (Canonne et al. 2020)<sup>[**(9)**](#Note9)</sup>.

1. Special case: If _x_ is 0, return 1. (This is because the probability becomes `exp(0) = 1`.)
2. If `x > y` (so _x_/_y_ is greater than 1), call **ZeroOrOneExpMinus** `floor(x/y)` times with _x_ = _y_ = 1 and once with _x_ = _x_ - floor(_x_/_y_) * _y_ and _y_ = _y_.  Return 1 if all these calls return 1; otherwise, return 0.
3. Set _r_ to 1 and _i_ to 1.
4. Return _r_ with probability _x_/(_y_*_i_).
5. Set _r_ to 1 - _r_, add 1 to _i_, and go to step 4.

The **LogisticExp** algorithm is a special case of the _logistic Bernoulli factory_ given in (Morina et al. 2019)<sup>[**(10)**](#Note10)</sup>.  It takes integers _x_ >= 0,  _y_ > 0, and _prec_ > 0 and outputs 1 with probability `1/(1+exp(x/(y*pow(2, prec))))` and 0 otherwise.

1. Return 0 with probability 1/2.
2. Call **ZeroOrOneExpMinus** with _x_ = _x_ and _y_ = _y_*2<sup>_prec_</sup>.  If the call returns 1, return 1.
3. Go to step 1.

<a id=Algorithm></a>
## Algorithm

As implemented in the code, an e-rand consists of five numbers: the first is a multiple of 2^X, the second is X, the third is the integer part (initially &minus;1 to indicate the integer part wasn't sampled yet), and the fourth and fifth are the &lambda; parameter's numerator and denominator, respectively.

The **ExpRandLess** algorithm is a special case of the general **RandLess** algorithm given earlier.  It compares two e-rands **a** and **b** (and samples additional bits from them as necessary) and returns `true` if **a** turns out to be less than **b**, or `false` otherwise. (Note that **a** and **b** are allowed to have different &lambda; parameters.)

1. If **a**'s integer part wasn't sampled yet, call **ZeroOrOneExpMinus** with _x_ = &lambda;'s numerator and _y_ = &lambda;'s denominator, until the call returns 0, then set the integer part to the number of times 1 was returned this way.  Do the same for **b**.
2. Return `true` if **a**'s integer part is less than **b**'s, or `false` if **a**'s integer part is greater than **b**'s.
3. Set _i_ to 0.
4. If **a**'s fractional part has _i_ or fewer bits, call **LogisticExp** with _x_ = &lambda;'s numerator, _y_ = &lambda;'s denominator, and _prec_ = _i_ + 1, and append the result to that fractional part's binary expansion.  Do the same for **b**.
5. Return `true` if **a**'s fractional part is less than **b**'s, or `false` if **a**'s fractional part is greater than **b**'s.
6. Add 1 to _i_ and go to step 4.

The **ExpRandFill** generates a `p`-bit-precision number (a number with `p` binary digits after the point) from an e-rand **a** as follows:

1. Sample **a**'s integer part as given in step 1 of **ExpRandLess**.
2. If **a**'s fractional part has greater than _i_ bits, round **a** to a `p`-bit-precision number and return that number.  The rounding can be done, for example, by discarding all bits beyond `p` bits after the rounding point, or by rounding to the nearest 2<sup>-p</sup>, ties-to-up, as done in the sample Python code.
3. While **a**'s fractional part has fewer than _i_ bits, call **LogisticExp** with _x_ = &lambda;'s numerator, _y_ = &lambda;'s denominator, and _prec_ = _i_ + 1, and append the result to that fractional part's binary expansion.
4. Return the number represented by **a**.

<a id=Code></a>
## Code

In the Python code below, note that `zero_or_one_exp_minus` uses `random.randint` which does not necessarily use only random bits; it could be replaced with a random-bit-only algorithm such as FastDiceRoller or Bernoulli, both of which were presented by Lumbroso (2013)<sup>[**(11)**](#Note11)</sup>.

```
import random

def logisticexp(ln, ld, prec):
    "'" Returns 1 with probability 1/(1+exp(ln/(ld*2^prec))). """
        denom=ld*2**prec
        while True:
           if random.randint(0,1)==0: return 0
           if zero_or_one_exp_minus(ln, denom) == 1: return 1

def exprandnew(lamdanum=1, lamdaden=1):
     """ Returns an object to serve as a partially-sampled
          exponential random number with the given
          rate 'lamdanum'/'lamdaden'.  The object is a list of five numbers
          as given in the prose.  Default for 'lamdanum'
          and 'lamdaden' is 1.
          The number created by this method will be "empty"
          (no bits sampled yet).
          """
     return [0, 0, -1, lamdanum, lamdaden]

def exprandfill(a, bits):
    """ Fills the unsampled bits of the given exponential random number
           'a' as necessary to make a number whose fractional part
           has 'bits' many bits.  If the number's fractional part already has
           that many bits or more, the number is rounded using the round-to-nearest,
           ties to even rounding rule.  Returns the resulting number as a
           multiple of 2^'bits'. """
    # Fill the integer if necessary.
    if a[2]==-1:
        a[2]=0
        while zero_or_one_exp_minus(a[3], a[4]) == 1:
            a[2]+=1
    if a[1] > bits:
        # Shifting bits beyond the first excess bit.
        aa = a[0] >> (a[1] - bits - 1)
        # Check the excess bit; if odd, round up.
        ret=aa >> 1 if (aa & 1) == 0 else (aa >> 1) + 1
        return ret|(a[2]<<bits)
    # Fill the fractional part if necessary.
    while a[1] < bits:
       index = a[1]
       a[1]+=1
       a[0]=(a[0]<<1)|logisticexp(a[3], a[4], index+1)
    return a[0]|(a[2]<<bits)

def exprandless(a, b):
        """ Determines whether one partially-sampled exponential number
           is less than another; returns
           true if so and false otherwise.  During
           the comparison, additional bits will be sampled in both numbers
           if necessary for the comparison. """
        # Check integer part of exponentials
        if a[2] == -1:
            a[2] = 0
            while zero_or_one_exp_minus(a[3], a[4]) == 1:
                a[2] += 1
        if b[2] == -1:
            b[2] = 0
            while zero_or_one_exp_minus(b[3], b[4]) == 1:
                b[2] += 1
        if a[2] < b[2]:
            return True
        if a[2] > b[2]:
            return False
        index = 0
        while True:
            # Fill with next bit in a's exponential number
            if a[1] < index:
                raise ValueError
            if b[1] < index:
                raise ValueError
            if a[1] <= index:
                a[1] += 1
                a[0] = logisticexp(a[3], a[4], index + 1) | (a[0] << 1)
            # Fill with next bit in b's exponential number
            if b[1] <= index:
                b[1] += 1
                b[0] = logisticexp(b[3], b[4], index + 1) | (b[0] << 1)
            aa = (a[0] >> (a[1] - 1 - index)) & 1
            bb = (b[0] >> (b[1] - 1 - index)) & 1
            if aa < bb:
                return True
            if aa > bb:
                return False
            index += 1

def zero_or_one_exp_minus(x, y):
        """ Generates 1 with probability exp(-px/py); 0 otherwise.
               Reference: Canonne et al. 2020. """
        if y <= 0 or x < 0:
            raise ValueError
        if x==0: return 1
        if x > y:
            xf = int(x / y)  # Get integer part
            x = x % y  # Reduce to fraction
            if x > 0 and zero_or_one_exp_minus(x, y) == 0:
                return 0
            for i in range(1, xf + 1):
                if zero_or_one_exp_minus(1, 1) == 0:
                    return 0
            return 1
        r = 1
        ii = 1
        while True:
            # NOTE: See note about randint in prose.
            if random.randint(0, (y*ii)-1) >= x:
                return r
            r=1-r
            ii += 1

# Example of use
def exprand(lam):
   return exprandfill(exprandnew(lam),53)*1.0/(1<<53)

```

<a id=Extension></a>
### Extension

The code above supports rational-valued &lambda; parameters.  It can be extended to support any real-valued &lambda; parameter in (0, 1), as long as the parameter can be simulated by an algorithm that outputs heads with probability equal to &lambda; <sup>[**(12)**](#Note12)</sup>.  For example:

- `exprandnew` is modified to take a function that implements the simulation algorithm (e.g., `prob`), rather than `lamdanum` and `lamdaden`.
- `zero_or_one_exp_minus(a, b)` can be replaced with the `exp_minus` algorithm of (Łatuszyński et al. 2011)<sup>[**(13)**](#Note13)</sup> or that of (Flajolet et al. 2010)<sup>[**(6)**](#Note6)</sup> (e.g., `bernoulli.exp_minus(lambda: random.randint(0, y-1) < x)`; see a class I wrote called "[**bernoulli.py**](https://github.com/peteroupc/peteroupc.github.io/blob/master/bernoulli.py)).  This `exp_minus` algorithm takes a Bernoulli generator that outputs heads with probability &lambda;, and in turn outputs heads with probability exp(-&lambda;).
- `logisticexp(a, b, index+1)` can be replaced with a modified `logisticexp` as follows: `bf=lambda: 1 if (random.randint(0, (2**prec)-1) == 0 and prob()==1) else 0`, and loop the following two statements: `if random.randint(0,1)==0: return 0` and `if bernoulli.exp_minus(bf) == 1: return 1`.  The modified **LogisticExp** is described as follows:
    1. Create a Bernoulli generator that returns 1 with probability 2<sup>_prec_</sup> _and_ if the algorithm that simulates &lambda; returns 1, and 0 otherwise.
    2. Return 0 with probability 1/2.
    3. Call the `exp_minus` algorithm (described earlier) with the Bernoulli generator described in step 1; if it returns 1, return 1.
    4. Go to step 2.

<a id=Correctness_Testing></a>
## Correctness Testing

To test the correctness of the `exprandfill` method, the Kolmogorov&ndash;Smirnov test was applied with various values of &lambda; and the default precision of 53, using SciPy's `kstest` method.  The code for the test is very simple: `kst = scipy.stats.kstest(ksample, lambda x: scipy.stats.expon.cdf(x, scale=1/lamda))`, where `ksample` is a sample of random numbers generated using the `exprand` method above.  Note that SciPy uses a two-sided Kolmogorov&ndash;Smirnov test by default.

The table below shows the results of the correctness testing. For each parameter, five samples with 50,000 numbers per sample were taken, and results show the lowest and highest Kolmogorov&ndash;Smirnov statistics and p-values achieved for the five samples.  Note that a p-value extremely close to 0 or 1 strongly indicates that the samples do not come from the corresponding exponential distribution.

|  &lambda; | Statistic | _p_-value |
 ---- | ---- | ---- |
| 1/10 | 0.00233-0.00435 | 0.29954-0.94867 |
| 1/4 | 0.00254-0.00738 | 0.00864-0.90282 |
| 1/2 | 0.00195-0.00521 | 0.13238-0.99139 |
| 2/3 | 0.00295-0.00457 | 0.24659-0.77715 |
| 3/4 | 0.00190-0.00636 | 0.03514-0.99381 |
| 9/10 | 0.00226-0.00474 | 0.21032-0.96029 |
| 1 | 0.00267-0.00601 | 0.05389-0.86676 |
| 2 | 0.00293-0.00684 | 0.01870-0.78310 |
| 3 | 0.00284-0.00675 | 0.02091-0.81589 |
| 5 | 0.00256-0.00546 | 0.10130-0.89935 |
| 10 | 0.00279-0.00528 | 0.12358-0.82974 |

To test the correctness of `exprandless`, a two-independent-sample T-test was applied to scores involving e-rands and scores involving the Python `random.expovariate` method.  Specifically, the score is calculated as the number of times one exponential number compares as less than another; for the same &lambda; this event should ideally be as likely as the event that it compares as greater.  The Python code that follows the table calculates this score for e-rands and `expovariate`.   Even here, the code for the test is very simple: `kst = scipy.stats.ttest_ind(exppyscores, exprandscores)`, where `exppyscores` and `exprandscores` are each lists of 20 results from `exppyscore` or `exprandscore`, respectively, and and each of the results contained in `exppyscores` and `exprandscores` were generated independently of each other.

The table below shows the results of the correctness testing. For each pair of parameters, results show the lowest and highest T-test statistics and p-values achieved for the 20 results.  Note that a p-value extremely close to 0 or 1 strongly indicates that exponential random numbers are not compared as less or greater with the expected probability.

|  Left &lambda; | Right &lambda; | Statistic | _p_-value |
 ---- | ---- | ---- | ---- |
| 1/10 | 1/10 | -1.21015 &ndash; 0.93682 | 0.23369 &ndash; 0.75610 |
| 1/10 | 1/2 | -1.25248 &ndash; 3.56291 | 0.00101 &ndash; 0.39963 |
| 1/10 | 1 | -0.76586 &ndash; 1.07628 | 0.28859 &ndash; 0.94709 |
| 1/10 | 2 | -1.80624 &ndash; 1.58347 | 0.07881 &ndash; 0.90802 |
| 1/10 | 5 | -0.16197 &ndash; 1.78700 | 0.08192 &ndash; 0.87219 |
| 1/2 | 1/10 | -1.46973 &ndash; 1.40308 | 0.14987 &ndash; 0.74549 |
| 1/2 | 1/2 | -0.79555 &ndash; 1.21538 | 0.23172 &ndash; 0.93613 |
| 1/2 | 1 | -0.90496 &ndash; 0.11113 | 0.37119 &ndash; 0.91210 |
| 1/2 | 2 | -1.32157 &ndash; -0.07066 | 0.19421 &ndash; 0.94404 |
| 1/2 | 5 | -0.55135 &ndash; 1.85604 | 0.07122 &ndash; 0.76994 |
| 1 | 1/10 | -1.27023 &ndash; 0.73501 | 0.21173 &ndash; 0.87314 |
| 1 | 1/2 | -2.33246 &ndash; 0.66827 | 0.02507 &ndash; 0.58741 |
| 1 | 1 | -1.24446 &ndash; 0.84555 | 0.22095 &ndash; 0.90587 |
| 1 | 2 | -1.13643 &ndash; 0.84148 | 0.26289 &ndash; 0.95717 |
| 1 | 5 | -0.70037 &ndash; 1.46778 | 0.15039 &ndash; 0.86996 |
| 2 | 1/10 | -0.77675 &ndash; 1.15350 | 0.25591 &ndash; 0.97870 |
| 2 | 1/2 | -0.23122 &ndash; 1.20764 | 0.23465 &ndash; 0.91855 |
| 2 | 1 | -0.92273 &ndash; -0.05904 | 0.36197 &ndash; 0.95323 |
| 2 | 2 | -1.88150 &ndash; 0.64096 | 0.06758 &ndash; 0.73056 |
| 2 | 5 | -0.08315 &ndash; 1.01951 | 0.31441 &ndash; 0.93417 |
| 5 | 1/10 | -0.60921 &ndash; 1.54606 | 0.13038 &ndash; 0.91563 |
| 5 | 1/2 | -1.30038 &ndash; 1.43602 | 0.15918 &ndash; 0.86349 |
| 5 | 1 | -1.22803 &ndash; 1.35380 | 0.18380 &ndash; 0.64158 |
| 5 | 2 | -1.83124 &ndash; 1.40222 | 0.07491 &ndash; 0.66075 |
| 5 | 5 | -0.97110 &ndash; 2.00904 | 0.05168 &ndash; 0.74398 |

```
def exppyscore(ln,ld,ln2,ld2):
        return sum(1 if random.expovariate(ln*1.0/ld)<random.expovariate(ln2*1.0/ld2) \
              else 0 for i in range(1000))

def exprandscore(ln,ld,ln2,ld2):
        return sum(1 if exprandless(exprandnew(ln,ld), exprandnew(ln2,ld2)) \
              else 0 for i in range(1000))
```

<a id=Application_to_Weighted_Reservoir_Sampling></a>
## Application to Weighted Reservoir Sampling

[**Weighted reservoir sampling**](https://peteroupc.github.io/randomfunc.html#Weighted_Choice_Without_Replacement_List_of_Unknown_Size) (choosing an item at random from a list of unknown size) is often implemented by&mdash;

- assigning each item a _weight_ (an integer 0 or greater) as it's encountered, call it _w_,
- giving each item an exponential random number with &lambda; = _w_, call it a key, and
- choosing the item with the smallest key

(see also (Efraimidis 2015)<sup>[**(14)**](#Note14)</sup>). However, using fully-sampled exponential random numbers as keys (such as the naïve idiom `-ln(1-RNDU01())/w` in binary64) can lead to inexact sampling, since the keys have a limited precision, it's possible for multiple items to have the same random key (which can make sampling those items depend on their order rather than on randomness), and the maximum weight is unknown.  Partially-sampled e-rands, as given in this document, eliminate the problem of inexact sampling.  This is notably because the `exprandless` method returns one of only two answers&mdash;either "less" or "greater"&mdash;and samples from both e-rands as necessary so that they will differ from each other by the end of the operation.  (This is not a problem because randomly generated real numbers are expected to differ from each other almost surely.) Another reason is that partially-sampled e-rands have potentially arbitrary precision.

<a id=Open_Questions></a>
## Open Questions

There are some open questions on whether partially-sampled random numbers are possible:

1. Are there constructions for partially-sampled normal random numbers with a standard deviation other than 1 and/or a mean other than an integer?
2. Are there constructions for partially-sampled random numbers other than for cases given earlier in this document?
3. How can arithmetic on partially-sampled random numbers (such as addition, multiplication, division, and powering) be carried out?

<a id=Acknowledgments></a>
## Acknowledgments

I acknowledge Claude Gravel who reviewed this article.

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> Philippe Flajolet, Nasser Saheb. The complexity of generating an exponentially distributed variate. [Research Report] RR-0159, INRIA. 1982. inria-00076400.</small>

<small><sup id=Note2>(2)</sup> Karney, C.F.F., "[**Sampling exactly from the normal distribution**](https://arxiv.org/abs/1303.6257v2)", arXiv:1303.6257v2  [physics.comp-ph], 2014.</small>

<small><sup id=Note3>(3)</sup> Devroye, L., Gravel, C., "[**Sampling with arbitrary precision**](https://arxiv.org/abs/1502.02539v5)", arXiv:1502.02539v5 [cs.IT], 2015.</small>

<small><sup id=Note4>(4)</sup> Thomas, D.B. and Luk, W., 2008, September. Sampling from the exponential distribution using independent bernoulli variates. In 2008 International Conference on Field Programmable Logic and Applications (pp. 239-244). IEEE.</small>

<small><sup id=Note5>(5)</sup> Pedersen, K., "[**Reconditioning your quantile function**](https://arxiv.org/abs/1704.07949v3)", arXiv:1704.07949v3 [stat.CO], 2018</small>

<small><sup id=Note6>(6)</sup> Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560v2)", arXiv:0906.5560v2  [math.PR], 2010.</small>

<small><sup id=Note7>(7)</sup> von Neumann, J., "Various techniques used in connection with random digits", 1951.</small>

<small><sup id=Note8>(8)</sup> Oberhoff, Sebastian, "[**Exact Sampling and Prefix Distributions**](https://dc.uwm.edu/etd/1888)", _Theses and Dissertations_, University of Wisconsin Milwaukee, 2018.</small>

<small><sup id=Note9>(9)</sup> Canonne, C., Kamath, G., Steinke, T., "[**The Discrete Gaussian for Differential Privacy**](https://arxiv.org/abs/2004.00010v2)", arXiv:2004.00010v2 [cs.DS], 2020.</small>

<small><sup id=Note10>(10)</sup> Morina, G., Łatuszyński, K., et al., "From the Bernoulli Factory to a Dice Enterprise via Perfect Sampling of Markov Chains", 2019.</small>

<small><sup id=Note11>(11)</sup> Lumbroso, J., "[**Optimal Discrete Uniform Generation from Coin Flips, and Applications**](https://arxiv.org/abs/1304.1916)", arXiv:1304.1916 [cs.DS].</small>

<small><sup id=Note12>(12)</sup> This algorithm is also known as a _Bernoulli factory_, an algorithm that turns coins biased one way into coins biased another way (Keane,  M.  S.,  and  O'Brien,  G.  L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.)</small>

<small><sup id=Note13>(13)</sup> Łatuszyński, K., Kosmidis, I.,  Papaspiliopoulos, O., Roberts, G.O., "Simulating events of unknown probabilities via reverse time martingales", 2011.</small>

<small><sup id=Note14>(14)</sup> Efraimidis, P. "[**Weighted Random Sampling over Data Streams**](https://arxiv.org/abs/1012.0256v2)", arXiv:1012.0256v2 [cs.DS], 2015.</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
