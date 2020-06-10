#
#  Implements the Moore Rejection Sampler.
#
#  Written by Peter O. Any copyright to this file is released to the Public Domain.
#  In case this is not possible, this file is also licensed under Creative Commons Zero
#  (https://creativecommons.org/publicdomain/zero/1.0/).
#
import decimal
from randomgen import VoseAlias, RandomGen
from decimal import Decimal, Context
from fractions import Fraction
from interval import Interval

class MooreSampler:
    """
    Moore rejection sampler, for sampling distributions whose
       PDF (probability density function) uses "well-defined" arithmetic
       expressions.  More formally, the PDF must be "locally Lipschitz", meaning
       that the function is continuous and has no slope that
       tends to a vertical slope anywhere in the sampling domain.
    - kf: PDF that takes a floating-point number or an Interval
       (a mathematical object that specifies upper and lower
      bounds of a number) and returns an Interval.  For best results,
      the PDF should use interval arithmetic throughout.
    - mn, mx: The interval [mn, mx] specifies the sampling domain of the PDF.

    TODO: Support multidimensional PDFs.

    Reference:
    Sainudiin, Raazesh, and Thomas L. York. "An Auto-Validating, Trans-Dimensional,
    Universal Rejection Sampler for Locally Lipschitz Arithmetical Expressions."
    Reliable Computing 18 (2013): 15-54.
    """

    def __init__(self, kf, mn, mx):
        if mn >= mx:
            raise ValueError
        numintervals = 50
        areasize = (mx - mn) / numintervals
        self.intervals = [
            Interval(mn + i * areasize, mn + (i + 1) * areasize)
            for i in range(numintervals)
        ]
        self.ranges = [kf(x) for x in self.intervals]
        weights = [
            float(self.intervals[i].width() * self.ranges[i].sup)
            for i in range(numintervals)
        ]
        self.alias = VoseAlias(weights)
        self.rg = RandomGen()
        self.kf = kf

    def _rndrange(self, a, b):
        return self.rg.rndrange(float(a), float(b))

    def sample(self, trials=50):
        """
        Tries to sample from the distribution.  Returns a list of two items:
        the first is the random number, and the second is the number of trials
        taken to produce the random number.  If the sampling failed, the first
        item is None.
        - trials: Number of times to attempt to generate a sample.  Default is 50.
       """
        for i in range(trials):
            area = self.alias.next(self.rg)
            # kx ~ Kg, may be a scalar or vector
            kx = self._rndrange(self.intervals[area].inf, self.intervals[area].sup)
            # Kĝ(kx), a scalar, where kx may be a scalar or vector
            u = self._rndrange(0, self.ranges[area].sup)
            # Quick accept
            if u <= self.ranges[area].inf:
                return [kx, i - 1]
            # Evaluate PDF, which returns an interval.
            # XXX: What if u is between the interval's .inf and .sup?
            # Should we bisect and try again?
            if u <= self.kf(kx).inf:
                return [kx, i + 1]
        return [None, trials]

if __name__ == "__main__":

    def bucket(v, ls, buckets):
        for i in range(len(buckets) - 1):
            if v >= ls[i] and v < ls[i + 1]:
                buckets[i] += 1
                break

    def linspace(a, b, size):
        return [a + (b - a) * (x * 1.0 / size) for x in range(size + 1)]

    def showbuckets(ls, buckets):
        mx = max(0.00000001, max(buckets))
        if mx == 0:
            return
        labels = [
            ("%0.3f %d [%f]" % (ls[i], buckets[i], buckets[i] * 1.0 / mx))
            if int(buckets[i]) == buckets[i]
            else ("%0.3f %f [%f]" % (ls[i], buckets[i], buckets[i] * 1.0 / mx))
            for i in range(len(buckets))
        ]
        maxlen = max([len(x) for x in labels])
        i = 0
        while i < (len(buckets)):
            print(
                labels[i]
                + " " * (1 + (maxlen - len(labels[i])))
                + ("*" * int(buckets[i] * 40 / mx))
            )
            if (
                buckets[i] == 0
                and i + 2 < len(buckets)
                and buckets[i + 1] == 0
                and buckets[i + 2] == 0
            ):
                print(" ... ")
                while (
                    buckets[i] == 0
                    and i + 2 < len(buckets)
                    and buckets[i + 1] == 0
                    and buckets[i + 2] == 0
                ):
                    i += 1
            i += 1

    def normalpdf(x):
        mean = Interval(0)
        sd = Interval(1)
        x = Interval(x)
        return (-((x - mean) ** 2) / (2 * sd ** 2)).exp()

    import time
    import math

    mrs = MooreSampler(normalpdf, -4, 4)
    ls = linspace(-4, 4, 30)
    buckets = [0 for x in ls]
    t = time.time()
    ksample = [mrs.sample()[0] for i in range(20000)]
    print("Took %f seconds" % (time.time() - t))
    for ks in ksample:
        bucket(ks, ls, buckets)
    showbuckets(ls, buckets)
