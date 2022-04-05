import random
import randomgen
import math
from fractions import Fraction
from betadist import (
    logbinco,
    psrnexpo,
    RealLn,
    RealExp,
    RandPSRN,
    RealNegate,
    realIsLess,
)

class BinomialSampler:
    def __init__(self, rg=None):
        self.rg = randomgen.RandomGen() if rg == None else rg
        self.logcache = {}
        self.binomialinfo = {}
        self.bits = 0
        self.curbit = -1

    def _logint(self, n):
        if not n in self.logcache:
            self.logcache[n] = RealLn(n)
        return self.logcache[n]

    def _randbit(self):
        if self.rg != None:
            return self.rg.randbit()
        if self.curbit == -1 or self.curbit >= 64:
            self.bits = random.randint(0, (1 << 64) - 1)
            self.curbit = 0
        r = self.bits & 1
        self.bits >>= 1
        self.curbit += 1
        return r

    def _roughSqrt(x):
        """Returns a number m such that m is in the
        interval [sqrt(x), sqrt(x)+3].  This rough approximation
        suffices for the binomial sampler."""
        u = 1 << ((x.bit_length() + 1) // 2)
        i = 0
        while True:
            v = (u + x // u) // 2
            if v >= u:
                return u + 1
            u = v

    def sample(self, n):
        """Draws a binomial(n, 1/2) random variate.
        Uses the rejection sampling approach from Bringmann et al.
        2014, but uses log binomial coefficients and in general, upper
        and lower bounds of logarithmic probabilities (to support very
        large values of n) together with the alternating series method
        and rational interval arithmetic (rather than floating-point arithmetic).

        Reference:
        K. Bringmann, F. Kuhn, et al., “Internal DLA: Efficient Simulation of
        a Physical Growth Model.” In: _Proc. 41st International
        Colloquium on Automata, Languages, and Programming (ICALP'14)_, 2014.
        """
        if n == 0:
            return 0
        if n % 2 == 1:
            return self._randbit() + self.sample(n - 1)
        n2 = n
        ret = 0
        if n2 % 2 == 1:
            ret += self._randbit()
            n2 -= 1
            if n2 == 0:
                return ret
        if not n2 in self.binomialinfo:
            bm = BinomialSampler._roughSqrt(n2)
            bi = [bm, {}]
            self.binomialinfo[n2] = bi
        halfn = n2 // 2
        m = self.binomialinfo[n2][0]
        bincos = self.binomialinfo[n2][1]
        while True:
            pos = self._randbit() == 0
            k = 0
            while self._randbit() == 0:
                k += 1
            r = k * m + (
                self.rg.rndint(m - 1) if self.rg != None else random.randint(0, m - 1)
            )
            rv = halfn + r if pos else halfn - r - 1
            if rv >= 0 and rv <= n2:
                psrn = psrnexpo(self.rg)
                psrn[0] = -1  # Negate
                if not (rv in bincos):
                    bincos[rv] = None
                if bincos[rv] == None:
                    # Calculate log of acceptance probability on demand
                    bincos[rv] = (
                        logbinco(n2, rv)
                        + self._logint(m)
                        + self._logint(2) * (k - n2 - 2)
                    )
                h = RandPSRN(psrn)
                if realIsLess(h, bincos[rv]):
                    return rv

def dobucket(v, bounds=None, allints=None):
    a = Fraction(min(v))
    b = Fraction(max(v))
    if bounds != None:
        a, b = bounds
    size = int(max(30, math.ceil(b - a)))
    if allints != True and allints != False:
        allints = True
        if size == 30:
            for x in v:
                if int(x) != x:
                    allints = False
                    break
            if allints:
                size = int(b - a)
        else:
            allints = False
    if allints:
        ls = [int(a + (b - a) * x / size) for x in range(size + 1)]
    else:
        ls = [a + (b - a) * (x / size) for x in range(size + 1)]
    buckets = [0 for i in range(size)]
    for x in v:
        for i in range(len(buckets)):
            if x >= ls[i] and x < ls[i + 1]:
                buckets[i] += 1
                break
    showbuckets(ls, buckets)
    return buckets

def showbuckets(ls, buckets):
    mx = max(0.00000001, max(buckets))
    sumbuckets = max(0.00000001, sum(buckets))
    if mx == 0:
        return
    labels = [
        ("%0.5f %d [%f]" % (ls[i], buckets[i], buckets[i] * 1.0 / sumbuckets))
        if int(buckets[i]) == buckets[i]
        else ("%0.5f %f [%f]" % (ls[i], buckets[i], buckets[i] * 1.0 / sumbuckets))
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
