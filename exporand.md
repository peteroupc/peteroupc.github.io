# Partially-Sampled Exponential Random Numbers

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

This page introduces an implementation of partially-sampled exponential random numbers.

There are papers that discuss generating exponential random numbers using random bits (Flajolet and Saheb 1982)<sup>[**(1)**](#Note1)</sup>, (Karney 2014)<sup>[**(2)**](#Note2)</sup>, (Devroye and Gravel 2018)<sup>[**(3)**](#Note3)</sup>, (Thomas and Luk 2008)<sup>[**(4)**](#Note4)</sup>, but none I am aware of deal with generating partially-sampled exponential random numbers using an arbitrary rate, not just 1.

<a id=Code></a>
## Code

The following Python code implements partially-sampled exponential random numbers, called e-rands in this document for convenience (similarly to Karney's "u-rands" for partially-sampled uniform random numbers (Karney 2014)<sup>[**(2)**](#Note2)</sup>).  It implements a way to determine whether one e-rand is less than another, as well as a way to fill an e-rand as necessary to give its fractional part a given number of bits.

It makes use of two observations (based on the parameter &lambda; of the exponential distribution):

- With probability exp(-&lambda;), the exponential random number is increased by 1.
- With probability 1/(1+exp(&lambda;/2<sup>_k_</sup>), the exponential random number is increased by 2<sup>-_k_</sup>, where _k_ > 0 is an integer.

(Devroye and Gravel 2018)<sup>[**(3)**](#Note3)</sup> already made these observations in their Appendix, but only for &lambda; = 1.

To implement these probabilities using just random bits, the code uses two algorithms:

- One to simulate a probability of the form `exp(-x/y)` (`zero_or_one_exp_minus`; (Canonne et al. 2020)<sup>[**(5)**](#Note5)</sup>).
- One to simulate a probability of the form `1/(1+exp(lamda/pow(2, prec)))` (`logisticexp` (Morina et al. 2019)<sup>[**(6)**](#Note6)</sup>).

Both algorithms are included in the Python code below.

```python

import random

def logisticexp(lamda, prec):
        denom=2**prec
        while True:
           if random.randint(0,1)==0: return 0
           if zero_or_one_exp_minus(lamda, denom) == 1: return 1

def exprandnew(lamda=1):
   """ Returns an object to serve as a partially-sampled
          exponential random number with the given
          rate 'lamda'.  The object is a list of four numbers:
          the first is a multiple of 2^X, the second is X, the third is the integer
          part (initially -1 to indicate the integer part wasn't sampled yet),
          and the fourth is the 'lamda' parameter.  Default for 'lamda' is 1.
          The number created by this method will be "empty"
          (no bits sampled yet).
          """
   return [0, 0, -1, lamda]

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
        while zero_or_one_exp_minus(a[3], 1) == 1:
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
       a[0]=(a[0]<<1)|logisticexp(a[3], index+1)
    return a[0]|(a[2]<<bits)

def exprandless(a, b):
    """ Determines whether one partially-sampled exponential number
           is less than another; returns
           true if so and false otherwise.  During
           the comparison, additional bits will be sampled in both numbers
           if necessary for the comparison. """
    # Check integer part of exponentials
    if a[2]==-1:
        a[2]=0
        while zero_or_one_exp_minus(a[3], 1) == 1:
            a[2]+=1
    if b[2]==-1:
        b[2]=0
        while zero_or_one_exp_minus(b[3], 1) == 1:
            b[2]+=1
    if a[2]<b[2]: return True
    if a[2]>b[2]: return False
    index=0
    while True:
        # Fill with next bit in a's exponential number
        if a[1]<index: raise ValueError
        if b[1]<index: raise ValueError
        if a[1]<=index:
           a[1]+=1
           a[0]=logisticexp(a[3], index+1) | (a[0] << 1)
        # Fill with next bit in b's exponential number
        if b[1]<=index:
           b[1]+=1
           b[0]=logisticexp(b[3], index+1) | (b[0] << 1)
        aa = (a[0] >> (a[1]-1-index))&1
        bb = (b[0] >> (b[1]-1-index))&1
        #print([index,ab,bb])
        if ab<bb: return True
        if ab>bb: return False
        index+=1

def zero_or_one_exp_minus(x, y):
        """ Generates 1 with probability exp(-px/py); 0 otherwise.
               Reference:
               Canonne, C., Kamath, G., Steinke, T., "[The Discrete Gaussian
               for Differential Privacy](https://arxiv.org/abs/2004.00010v2)", arXiv:2004.00010v2 [cs.DS], 2020. """
        if y <= 0 or x < 0:
            raise ValueError
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
        oy = y
        while True:
            if random.randint(0, y-1) >= x:
                return r
            if r == 1:
                r = 0
            else:
                r = 1
            y = y + oy

# Example of use
def exprand(lam):
   return exprandfill(exprandnew(lam),53)*1.0/(1<<53)

```

<a id=Application_to_Weighted_Reservoir_Sampling></a>
## Application to Weighted Reservoir Sampling

Details on this application will be given later.

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> Philippe Flajolet, Nasser Saheb. The complexity of generating an exponentially distributed variate. [Research Report] RR-0159, INRIA. 1982. inria-00076400.</small>

<small><sup id=Note2>(2)</sup> Karney, C.F.F., "[**Sampling exactly from the normal distribution**](https://arxiv.org/abs/1303.6257v2)", arXiv:1303.6257v2  [physics.comp-ph], 2014.</small>

<small><sup id=Note3>(3)</sup> Devroye, L., Gravel, C., "[**Sampling with arbitrary precision**](https://arxiv.org/abs/1502.02539v5)", arXiv:1502.02539v5 [cs.IT], 2018.</small>

<small><sup id=Note4>(4)</sup> Thomas, D.B. and Luk, W., 2008, September. Sampling from the exponential distribution using independent bernoulli variates. In 2008 International Conference on Field Programmable Logic and Applications (pp. 239-244). IEEE.</small>

<small><sup id=Note5>(5)</sup> Canonne, C., Kamath, G., Steinke, T., "[**The Discrete Gaussian for Differential Privacy**](https://arxiv.org/abs/2004.00010v2)", arXiv:2004.00010v2 [cs.DS], 2020.</small>

<small><sup id=Note6>(6)</sup> Morina, G., Łatuszyński, K., et al., "From the Bernoulli Factory to a Dice Enterprise via Perfect Sampling of Markov Chains", 2019.</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
