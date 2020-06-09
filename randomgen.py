"""
Sample code for the article "Random Number Generation and Sampling Methods"
https://www.codeproject.com/Articles/1190459/Random-Number-Generation-Methods

Written by Peter O.
Any copyright is released to the Public Domain.
https://creativecommons.org/publicdomain/zero/1.0/
"""

import math
import random
from fractions import Fraction

_SIGBITS = 53
_FLOAT_MAX = 1.7976931348623157e308

def _mean(list):
    if len(list) <= 1:
        return 0
    xm = list[0]
    i = 1
    while i < len(list):
        c = list[i]
        i += 1
        cxm = c - xm
        xm += cxm * 1.0 / i
    return xm

def _variance(list):
    if len(list) <= 1:
        return 0
    xm = list[0]
    xs = 0
    i = 1
    while i < len(list):
        c = list[i]
        i += 1
        cxm = c - xm
        xm += cxm * 1.0 / i
        xs += cxm * (c - xm)
    return xs * 1.0 / (len(list) - 1)

def _tableInterpSearch(table, x, censor=False):
    # Effective length is the length of table minus 1
    tablelen = len(table) - 1
    left = 0
    right = tablelen - 1
    while left <= right:
        index = int((left + right) / 2)
        c = table[index]
        n = table[index + 1]
        if x >= c[0] and x < n[0]:
            interp = (x - c[0]) * 1.0 / (n[0] - c[0])
            return c[1] + (n[1] - c[1]) * interp
        if x > c[0]:
            left = index + 1
            continue
        right = index - 1
        continue
    if censor:
        if x <= table[0][0]:
            return table[0][1]
        if x >= table[tablelen][0]:
            return table[tablelen][1]
    return None

def numericalTable(func, x, y, n=100):
    ret = [x + (y - x) * (i * 1.0 / n) for i in range(n + 1)]
    return [[func(b), b] for b in ret]

class VoseAlias:
    """
    Implements Vose's alias sampler, which chooses a random number in [0, n)
    where the probability that each number is chosen is weighted.  The 'weights' is the
    list of integer weights each 0 or greater; the higher the weight, the greater
    the probability.
    """

    def __init__(self, weights):
        # Vose's alias method for large n and nonnegative
        # weights.  This method has a non-trivial setup,
        # but a linear-time sampling step in n.
        prob = [0 for _ in weights]
        alias = [0 for _ in weights]
        tmp = [p * len(weights) for p in weights]
        mn = min(weights)
        mx = max(weights)
        ms = sum(weights)
        small = [i for i in range(len(tmp)) if tmp[i] < ms]
        large = [i for i in range(len(tmp)) if tmp[i] >= ms]
        sc = len(small)
        lc = len(large)
        while sc > 0 and lc > 0:
            lv = small[sc - 1]
            g = large[lc - 1]
            prob[lv] = tmp[lv]
            alias[lv] = g
            overhead = (tmp[g] + tmp[lv]) - ms
            if overhead < ms:
                small[sc - 1] = g
                lc -= 1
            else:
                sc -= 1
            tmp[g] = overhead
        for i in range(sc):
            prob[small[i]] = ms
        for i in range(lc):
            prob[large[i]] = ms
        if len(prob) != len(weights):
            raise ValueError("Internal error")
        if len(alias) != len(weights):
            raise ValueError("Internal error")
        self.total = ms
        self.prob = prob
        self.alias = alias

    def next(self, randgen):
        d = randgen.rndintexc(len(self.prob))
        da = self.alias[d]
        if d == da:
            return d
        tsample = (
            randgen.rndintexc(self.total)
            if int(self.total) == self.total
            else randgen.rndrangemaxexc(0, self.total)
        )
        return d if tsample < self.prob[d] else da

class FastLoadedDiceRoller:
    """
    Implements the Fast Loaded Dice Roller, which chooses a random number in [0, n)
    where the probability that each number is chosen is weighted.  The 'weights' is the
    list of integer weights each 0 or greater; the higher the weight, the greater
    the probability.

    Reference: Saad, F.A., Freer C.E., et al. "The Fast Loaded Dice Roller: A
    Near-Optimal Exact Sampler for Discrete Probability Distributions", in
    _AISTATS 2020: Proceedings of the 23rd International Conference on Artificial
    Intelligence and Statistics, Proceedings of Machine Learning Research_ 108,
    Palermo, Sicily, Italy, 2020.
    """

    def __init__(self, weights):
        self.n = len(weights)
        weightBits = 0
        totalWeights = sum(weights)
        tmp = totalWeights
        while tmp > 0:
            tmp >>= 1
            weightBits += 1
        lasta = (1 << weightBits) - totalWeights
        self.leavesAndLabels = [
            [0 for i in range(weightBits)] for j in range(self.n + 2)
        ]
        shift = weightBits - 1
        for j in range(weightBits):
            level = 1
            for i in range(self.n + 1):
                ai = lasta if i == self.n else weights[i]
                if ai < 0:
                    raise ValueError
                leaf = (ai >> shift) & 1
                if leaf > 0:
                    # NOTE: Labels start at 1
                    self.leavesAndLabels[0][j] += leaf
                    self.leavesAndLabels[level][j] = i + 1
                    level += 1
            shift -= 1

    def next(self, randgen):
        x = 0
        y = 0
        while True:
            x = randgen.rndint(1) + (x << 1)
            leaves = self.leavesAndLabels[0][y]
            if x < leaves:
                label = self.leavesAndLabels[x + 1][y]
                if label <= self.n:
                    # NOTE: The pair [label-1, (x, y)] could be
                    # recycled via a randomness extraction
                    # method to generate additional uniform
                    # random bits, as explained by L.
                    # Devroye and C. Gravel
                    # ("Sampling with arbitrary precision",
                    # 2015/2018, arXiv:1502.02539 [cs.IT])
                    return label - 1
                x = 0
                y = 0
            else:
                x -= leaves
                y += 1

class PascalTriangle:
    """ Generates the rows of Pascal's triangle, or the
      weight table for a binomial(n,1/2) distribution. """

    def __init__(self):
        self.table = []
        self.rownumber = 0

    def row(self):
        """ Gets the row number of the row that will be generated
            the next time _next_ is called."""
        return self.rownumber

    def nextto(self, desiredRow):
        """ Generates the row of Pascal's triangle with the given row number,
            skipping all rows in between.  The return value is a list of
            row-number-choose-k values. """
        if self.rownumber > desiredRow:
            raise ValueError
        xr = [
            self.table[i] if i < len(self.table) else 0 for i in range(desiredRow + 1)
        ]
        for i in range(self.rownumber, desiredRow + 1):
            last = 1
            for j in range(1, i + 1):
                n = xr[j] + last
                last = xr[j]
                xr[j] = n
        self.table = xr
        self.rownumber = desiredRow + 1
        return [x for x in self.table]

    def next(self):
        """ Generates the next row of Pascal's triangle, starting with
            row 0. The return value is a list of row-number-choose-k
            values. """
        x = self.table
        xr = [
            1 if i == 0 or i == len(x) else x[i] + x[i - 1] for i in range(len(x) + 1)
        ]
        self.table = xr
        self.rownumber += 1
        return [x for x in self.table]

class BinaryExpansion:
    """ Generates the binary expansion of a 64-bit floating-point
        number 'fp', assuming the number is greater than 0 and
        less than 1.  An example of a binary expansion is:
        0.1010111000010... """

    def __init__(self, fp):
        pw = fp
        pt = 0.5
        x = 0
        sh = 0
        while pw > 0:
            x |= (1 if (pw >= pt) else 0) << sh
            sh += 1
            if pw >= pt:
                pw -= pt
            pt /= 2
        self.x = x
        self.xorig = x

    def eof():
        """ Returns whether the expansion has no more ones. """
        return self.x == 0

    def next():
        """ Generates the next bit in the binary expansion, starting
           with the bit after the point."""
        ret = self.x & 1
        self.x >>= 1
        return ret

    def reset():
        """ Resets the expansion to before any bits were extracted
           with the 'next' method. """
        self.x = self.xorig

class RandomGen:
    """ A class that implements many methods for
      random number generation and sampling.  It takes
      an underlying RNG as specified in the constructor."""

    def __init__(self, rng=None):
        """ Initializes a new RandomGen instance.
     NOTES:

     1. Assumes that 'rng' implements
     a 'randint(a, b)' method that returns a random
     integer in the interval [a, b].  Currently, this
     class assumes 'a' is always 0.
     2. 'rndint' (and functions that ultimately call it) may be
     slower than desirable if many random numbers are
     needed at once.  Ways to improve the performance
     of generating many random numbers at once include
     vectorization (which is often PRNG specific) and multithreading
     (which is too complicated to show here). """
        if rng == None:
            self.rng = random.Random()
        else:
            self.rng = rng
        self.bitcount = 31
        self.curbit = 0

    def _rndbit(self):
        if self.bitcount >= 31:
            self.bitcount = 0
            self.curbit = self.rng.randint(0, (1 << 31) - 1)
        ret = self.curbit & 1
        self.curbit >>= 1
        self.bitcount += 1
        return ret

    def rndint(self, maxInclusive):
        if maxInclusive < 0:
            raise ValueError("maxInclusive less than 0")
        if maxInclusive == 0:
            return 0
        if maxInclusive == 1:
            return self._rndbit()
        # Lumbroso's fast dice roller method
        x = 1
        y = 0
        while True:
            x = x * 2
            y = y * 2 + self._rndbit()
            if x > maxInclusive:
                if y <= maxInclusive:
                    return y
                x = x - maxInclusive - 1
                y = y - maxInclusive - 1

    def rndintexc(self, maxExclusive):
        if maxExclusive <= 0:
            raise ValueError("maxExclusive 0 or less")
        return self.rng.randint(0, maxExclusive - 1)
        # return self.rndint(maxExclusive - 1)

    def rndintrange(self, minInclusive, maxInclusive):
        # NOTE: Since Python integers are arbitrary-precision,
        # the naive approach will work well here
        return minInclusive + self.rndint(maxInclusive - minInclusive)

    def rndintexcrange(self, minInclusive, maxExclusive):
        return minInclusive + self.rndint(maxExclusive - minInclusive - 1)

    def rndbits(self, n):
        """ Generates an n-bit random integer. """
        return self.rndint((1 << n) - 1)

    def rndu01(self):
        e = -_SIGBITS
        while True:
            if self.rndint(1) == 0:
                e -= 1
            else:
                break
        sig = self.rndint((1 << (_SIGBITS - 1)) - 1)
        if sig == 0 and self.rndint(1) == 0:
            e += 1
        sig = sig + (1 << (_SIGBITS - 1))
        # NOTE: Multiply by 1.0 to coerce to floating-point
        return sig * 1.0 * (2.0 ** e)

    def rndu01oneexc(self):
        while True:
            ret = self.rndu01()
            if ret != 1.0:
                return ret

    def rndu01zerooneexc(self):
        while True:
            ret = self.rndu01()
            if ret != 1.0 and ret != 0.0:
                return ret

    def rndu01zeroexc(self):
        while True:
            ret = self.rndu01()
            if ret != 0.0:
                return ret

    def rndrange(self, minInclusive, maxInclusive):
        if minInclusive > maxInclusive:
            raise ValueError
        if minInclusive >= 0 or minInclusive + _FLOAT_MAX >= maxInclusive:
            return minInclusive + (maxInclusive - minInclusive) * self.rndu01()
        while True:
            ret = self.rndu01() * _FLOAT_MAX
            negative = self.rndint(1) == 0
            if negative:
                ret = 0 - ret
            if negative and ret == 0:
                continue
            if ret >= minInclusive and ret <= maxInclusive:
                return ret

    def rndrangemaxexc(self, minInclusive, maxExclusive):
        if minInclusive >= maxExclusive:
            raise ValueError
        while True:
            ret = self.rndrange(minInclusive, maxExclusive)
            if ret < maxExclusive:
                return ret

    def rndrangeminexc(self, mn, mx):
        if mn >= mx:
            raise ValueError
        while True:
            ret = self.rndrange(mn, mx)
            if ret > mn:
                return ret

    def rndrangeminmaxexc(self, mn, mx):
        if mn >= mx:
            raise ValueError
        while True:
            ret = self.rndrange(mn, mx)
            if ret > mn and ret < mx:
                return ret

    def shuffle(self, list):
        if len(list) >= 2:
            i = len(list) - 1
            while i > 0:
                k = self.rndintexc(i + 1)
                tmp = list[i]
                list[i] = list[k]
                list[k] = tmp
                i -= 1
        return list

    def partialshuffle(self, list, k):
        """ Does a partial shuffle of
a list's items (stops when 'k' items
are shuffled); the shuffled items
will appear at the end of the list.
Returns 'list'. """
        ki = 0
        if len(list) >= 2:
            i = len(list) - 1
            while i > 0 and ki < k:
                k = self.rndintexc(i + 1)
                tmp = list[i]
                list[i] = list[k]
                list[k] = tmp
                i -= 1
                k += 1
        return list

    def sample(self, list, k):
        if k < 0 or k > len(list):
            raise ValueError
        n = len(list)
        if n == k:
            return [x for x in list]
        if n < 200:
            s = self.shuffle([x for x in list])
            return s[0:k]  # Choose first k items
        if n / 4 > k and n < 5000:
            s = self.partialshuffle([x for x in list], k)
            return s[n - k : n]  # Choose last k items
        ki = 0
        kh = {}
        while ki < k:
            c = self.rndintexc(k)
            if c not in kh:
                kh[c] = True
                ki += 1
        return [list[i] for i in kh.keys()]

    def choice(self, list):
        return list[self.rndintexc(len(list))]

    def numbersWithSum(self, count, sum=1.0):
        if count <= 0 or sum <= 0:
            raise ValueError
        while True:
            numsum = 0
            nums = None
            if sum == 1:
                nums = [self.exponential() for i in range(count)]
            else:
                nums = [self.gamma(sum) for i in range(count)]
            for num in nums:
                numsum += num
            if numsum > 0:
                return [(p / numsum) * sum for p in nums]

    def zero_or_one(self, px, py):
        """ Returns 1 at probability px/py, 0 otherwise. """
        if py <= 0:
            raise ValueError
        if px == py:
            return 1
        z = px
        while True:
            z = z * 2
            if z >= py:
                if self.rndint(1) == 0:
                    return 1
                z = z - py
            elif z == 0 or self.rndint(1) == 0:
                return 0

    def bernoulli(self, p):
        """ Returns 1 at probability p, 0 otherwise. """
        bexp = BinaryExpansion(p)
        while not bexp.eof():
            bp = bexp.next()
            br = self.rndint(2)
            if br < bp:
                return 1
            if br > bp:
                return 0
        return 0

    def weighted_choice(self, weights):
        return self._weighted_choice_n(weights, 1, 0)[0]

    def weighted_choice_n(self, weights, n=1):
        return self._weighted_choice_n(weights, n, 0)

    def _weighted_choice_n(self, weights, n, addvalue):
        if len(weights) == 0:
            raise ValueError
        msum = 0
        i = 0
        negweights = False
        nonintweights = False
        while i < len(weights):
            negweights = negweights or weights[i] < 0
            if int(weights[i]) != weights[i]:
                nonintweights = True
            msum += weights[i]
            i += 1
        if n > 100 and not negweights and not nonintweights:
            aliasinfo = FastLoadedDiceRoller(weights)
            return [aliasinfo.next(self) for k in range(n)]
        ret = [0 for k in range(n)]
        rv = [
            randgen.rndintexc(msum)
            if not nonintweights
            else randgen.rndrangemaxexc(0, msum)
            for k in range(n)
        ]
        k = 0
        while k < n:
            value = rv[k]
            i = 0
            lastItem = len(weights) - 1
            runningValue = 0
            while i < len(weights):
                if weights[i] > 0:
                    newValue = runningValue + weights[i]
                    lastItem = i
                    if value < newValue:
                        break
                    runningValue = newValue
                i += 1
            ret[k] = lastItem + addvalue
            k += 1
        return ret

    def piecewise_linear(self, values, weights):
        return self.piecewise_linear_n(values, weights)[0]

    def piecewise_linear_n(self, values, weights, n=1):
        if len(values) <= 0 or len(weights) < len(values):
            raise ValueError
        if len(values) == 1:
            return [values[0] for i in range(n)]
        total = 0
        areas = [0 for i in range(len(values) - 1)]
        i = 0
        while i < len(values) - 1:
            weightArea = (
                (weights[i] + weights[i + 1]) * 0.5 * (values[i + 1] - values[i])
            )
            if weightArea < 0:
                weightArea = -weightArea
            areas[i] = weightArea
            total += weightArea
            i += 1
        valuelist = [self.rndrangemaxexc(0, total) for _ in range(n)]
        wtlist = [self.rndu01oneexc() for _ in range(n)]
        lastValue = values[len(values) - 1]
        retValues = [lastValue for _ in range(n)]
        k = 0
        while k < n:
            i = 0
            runningValue = 0
            while i < len(values) - 1:
                area = areas[i]
                if area > 0:
                    newValue = runningValue + area
                    if valuelist[k] < newValue:
                        w1 = weights[i]
                        w2 = weights[i + 1]
                        wt = wtlist[k]
                        interp = wt
                        diff = w2 - w1
                        if diff > 0:
                            cs = w2 * w2 * wt + w1 * w1 - w1 * w1 * wt
                            s = math.sqrt(cs)
                            interp = (s - w1) / diff
                            if interp < 0 or interp > 1:
                                interp = -(s + w1) / diff
                        if diff < 0:
                            cs = w1 * w1 * wt + w2 * w2 - w2 * w2 * wt
                            s = math.sqrt(cs)
                            interp = -(s - w2) / diff
                            if interp < 0 or interp > 1:
                                interp = (s + w2) / diff
                            interp = 1 - interp
                        retValues[k] = values[i] + (values[i + 1] - values[i]) * interp
                        break
                    runningValue = newValue
                i += 1
            k += 1
        return retValues

    def normal(self, mu=0.0, sigma=1.0):
        """ Generates a normally-distributed random number. """
        bmp = 0.8577638849607068  # sqrt(2/exp(1))
        if self.rndint(1) == 0:
            while True:
                a = self.rndu01zeroexc()
                b = self.rndu01zeroexc()
                if self.rndint(1) == 0:
                    a = 0 - a
                if self.rndint(1) == 0:
                    b = 0 - b
                c = a * a + b * b
                if c != 0 and c <= 1:
                    c = math.sqrt(-math.log(c) * 2 / c)
                    if self.rndint(1) == 0:
                        return a * mu * c + sigma
                    else:
                        return b * mu * c + sigma
        else:
            while True:
                a = self.rndu01zeroexc()
                b = self.rndrange(-bmp, bmp)
                if b * b <= -4 * a * a * math.log(a):
                    return (b * sigma / a) + mu

    def lognormal(self, mu=0.0, sigma=0.0):
        return math.exp(self.normal(mu, sigma))

    def weibull(self, a, b):
        """ Generates a Weibull-distributed random number. """
        return b * (self.exponential()) ** (1.0 / a)

    def triangular(self, startpt, midpt, endpt):
        return self.piecewise_linear([startpt, midpt, endpt], [0, 1, 0])

    def gumbel(self, a, b):
        return a + math.log(self.exponential()) * b

    def frechet(self, a, b, mu=0):
        return b * pow(self.exponential(), -1.0 / a) + mu

    def beta(self, a, b, nc=0):
        """ Generates a beta-distributed random number.
     `a` and `b` are the two parameters of the beta distribution,
     and `nc` is a parameter such that `nc` other than 0
     indicates a _noncentral_ distribution. """
        avar = a + self.poisson(nc)
        if b == 1 and avar == 1:
            return self.rndu01()
        if avar == 1:
            return 1.0 - pow(self.rndu01(), 1.0 / b)
        if b == 1:
            return pow(self.rndu01(), 1.0 / avar)
        x = self.gamma(avar)
        return x / (x + self.gamma(b))

    _aliastables = {}
    _pascal = PascalTriangle()

    def _getaliastable(self, n):
        if n in self._aliastables:
            return self._aliastables[n]
        for i in range(self._pascal.row(), n + 1):
            if self._ispoweroftwo(i):
                p = self._pascal.nextto(i)
                self._aliastables[i] = FastLoadedDiceRoller(p)
        return self._aliastables[n]

    def _ispoweroftwo(self, n):
        while n != 0 and (n & 1) == 0:
            n >>= 1
        return n == 1

    def binomial_int(self, trials, px, py):
        if trials < 0:
            raise ValueError
        if trials == 0:
            return 0
        # Always succeeds
        if px == py:
            return trials
        # Always fails
        if px == 0:
            return 0
        if px * 2 == py:
            return binomial(self, trials, 0.5)
        count = 0
        # Based on proof of Theorem 2 in Farach-Colton and Tsai.
        # Decompose prob into its binary expansion (assuming
        # division by 2 is exact except on underflow)
        pw = Fraction(px, py)
        pt = Fraction(1, 2)
        while trials > 0:
            c = self.binomial(trials, 0.5)
            if pw >= pt:
                count = count + c
                trials = trials - c
                pw = pw - pt
            else:
                trials = c
            pt /= 2
        return count

    def binomial(self, trials, p):
        if trials < 0:
            raise ValueError
        if trials == 0:
            return 0
        # Always succeeds
        if p >= 1.0:
            return trials
        # Always fails
        if p <= 0.0:
            return 0
        count = 0
        if p == 0.5:
            if trials < 32:
                r = self.rndintexc(1 << trials)
                while r > 0:
                    if (r & 1) != 0:
                        count += 1
                    r >>= 1
            elif not self._ispoweroftwo(trials):
                # Decompose _trials_ into powers of two (taking idea
                # from "simple reduction" in Farach-Colton and Tsai),
                # except a simple table-free algorithm is used for
                # the lowest bits of _trials_.
                count += self.binomial(trials & 31, 0.5)
                trials -= trials & 31
                shift = 5
                while trials > 0:
                    count += self.binomial(trials & (1 << shift), 0.5)
                    trials -= trials & (1 << shift)
                    shift += 1
            else:
                count = count + self._getaliastable(trials).next(self)
        else:
            # Based on proof of Theorem 2 in Farach-Colton and Tsai.
            # Decompose prob into its binary expansion (assuming
            # division by 2 is exact except on underflow)
            pw = p
            pt = 0.5
            while trials > 0 and pw > 0:
                c = self.binomial(trials, 0.5)
                if pw >= pt:
                    count = count + c
                    trials = trials - c
                    pw = pw - pt
                else:
                    trials = c
                pt = pt / 2.0  # NOTE: Not rounded
        return count

    def hypergeometric(self, trials, ones, count):
        if ones < 0 or count < 0 or trials < 0 or ones > count or trials > count:
            raise ValueError
        if ones == 0:
            return 0
        successes = 0
        i = 0
        currentCount = count
        currentOnes = ones
        while i < trials and currentOnes > 0:
            if self.rndintexc(currentCount) < currentOnes:
                currentOnes -= 1
                successes += 1
            currentCount -= 1
            i += 1
        return successes

    def poissonint(self, mx, my):
        """ Generates a random number following a Poisson distribution with mean mx/my.  """
        if my == 0:
            raise ValueError
        if mx == 0:
            return 0
        if (mx < 0 and my < 0) or (mx > 0 and my < 0):
            return 0
        if mx == my:
            return self.poissonint(1, 2) + self.poissonint(1, 2)
        if mx > my:
            # Mean is 1 or greater
            mm = mx % my
            if mm == 0:
                mf = int(mx / my)
                ret = 0
                if mf % 2 == 1:
                    ret += self.poissonint(1, 1)
                    mf -= 1
                ret += self.poissonint(mf / 2, 1) + self.poissonint(mf / 2, 1)
                return ret
            else:
                return self.poissonint(mm, my) + self.poissonint(mx - mm, my)
        while True:
            # Generate n, a geometric random number
            # (NOTE: Flajolet et al. define a geometric
            # distribution as number of SUCCESSES BEFORE
            # FAILURE, not counting the failure, so we
            # have to complement the probability here)
            n = self.negativebinomialint(1, my - mx, my)
            # If n uniform random numbers turn out
            # to be sorted, accept n
            if n <= 1:
                return n
            u = self._urandnew()
            success = True
            i = 1
            while i < n and success:
                u2 = self._urandnew()
                if self._urandless(u, u2):
                    u = u2
                else:
                    success = False  # Not sorted
                i = i + 1
            if success:
                return n
        return count

    def poisson(self, mean):
        """ Generates a random number following a Poisson distribution.  """
        if mean < 0:
            raise ValueError
        if mean == 0:
            return 0
        count = 0
        while mean > 20:
            n = math.ceil(mean - pow(mean, 0.7))
            g = self.gamma(n, 1)
            if g >= mean:
                return count + (n - 1 - self.binomial(n - 1, (g - mean) / g))
            mean = mean - g
            count = count + n
        p = 1.0
        pn = math.exp(-mean)
        while True:
            count += 1
            p *= self.rndu01oneexc()
            if p <= pn:
                return count - 1

    def rayleigh(self, a):
        """ Generates a random number following a Rayleigh distribution.  """
        return a * math.sqrt(2 * self.exponential())

    def truncnormal(randgen, a, b):
        """
        Samples from a truncated normal distribution in [a, b]; this method is
        designed to sample from either tail of that distribution.

        Reference:
        Botev, Z. and L'Ecuyer, P., 2019. Simulation from the Tail of the
        Univariate and Multivariate Normal Distribution. In _Systems
        Modeling: Methodologies and Tools_ (pp. 115-132). Springer, Cham.
        """
        c = a * a * 0.5
        if b == math.inf:
            while True:
                v = self.rndu01zerooneexc()
                x = c + self.exponential()
                if x * v * v <= a:
                    return math.sqrt(2 * x)
        else:
            q = 1.0 - math.exp(c - b * b * 0.5)
            while True:
                v = self.rndu01zerooneexc()
                x = c - math.log1p(-q * self.rndu01zerooneexc())
                if x * v * v <= a:
                    return math.sqrt(2 * x)

    def gamma(self, mean, b=1.0, c=1.0, d=0.0):
        """ Generates a random number following a gamma distribution.  """
        if mean <= 0:
            raise ValueError
        dd = mean
        v = 0
        if mean == 1:
            return self.exponential()
        if mean < 1:
            dd += 1
        dd -= 1.0 / 3
        cc = 1.0 / math.sqrt(9 * dd)
        while True:
            x = 0
            while True:
                x = self.normal(0, 1)
                v = cc * x + 1
                v = v * v * v
                if v > 0:
                    break
            u = self.rndu01zeroexc()
            x2 = x * x
            if u < 1 - (0.0331 * x2 * x2):
                break
            if math.log(u) < (0.5 * x2) + (dd * (1 - v + math.log(v))):
                break
        ret = dd * v
        if mean < 1:
            ret = ret * math.pow(self.rndu01(), 1.0 / mean)
        return ret ** (1.0 / c) * b + d

    def cauchy(self):
        return stable(1, 0)

    def stable(self, alpha, beta):
        """ Generates a random number following a stable distribution.  """
        if alpha <= 0 or alpha > 2:
            raise ValueError
        if beta < -1 or beta > 1:
            raise ValueError
        halfpi = math.pi * 0.5
        unif = self.rndrangemaxexc(-halfpi, halfpi)
        while unif == -halfpi:
            unif = self.rndrangemaxexc(-halfpi, halfpi)
        # Cauchy special case
        if alpha == 1 and beta == 0:
            return -math.cos(unif) / math.sin(unif)
        expo = self.exponential()
        c = math.cos(unif)
        if alpha == 1:
            s = math.sin(unif)
            return (
                2.0
                * (
                    (unif * beta + halfpi) * s / c
                    - beta * math.log(halfpi * expo * c / (unif * beta + halfpi))
                )
                / pi
            )
        z = -math.tan(alpha * halfpi) * beta
        ug = unif + math.atan2(-z, 1) / alpha
        cpow = pow(c, -1.0 / alpha)
        return (
            pow(1.0 + z * z, 1.0 / (2 * alpha))
            * (math.sin(alpha * ug) * cpow)
            * pow(math.cos(unif - alpha * ug) / expo, (1.0 - alpha) / alpha)
        )

    def stable0(self, alpha, beta, mu=0, sigma=1):
        """ Generates a random number following a 'type 0' stable distribution.  """
        x = (
            math.log(sigma) * 2.0 / pi
            if alpha == 1
            else math.tan(math.pi * 0.5 * alpha)
        )
        return self.stable(alpha, beta) * sigma + (mu - sigma * beta * x)

    def moyal(self, mu=0, sigma=1):
        """ Sample from a Moyal distribution, using the
         method given in C. Walck, "Handbook on
         Statistical Distributions for Experimentalists",
         pp. 93-94."""
        while True:
            tany = self.cauchy()
            hy = math.exp(-(tany + math.exp(-tany)) * 0.5)
            hy = hy / ((math.cos(y) ** 2) * sqrt(2.0 * math.pi))
            if self.rndrange(0, 0.912) <= hy:
                return tany * sigma + mu

    def geometric(self, p):
        return self.negativebinomial(1, p)

    def zero_or_one_exp_minus(self, x, y):
        """ Generates 1 with probability exp(-px/py); 0 otherwise.
               Reference:
               Canonne, C., Kamath, G., Steinke, T., "The Discrete Gaussian
               for Differential Privacy", arXiv:2004.00010v2 [cs.DS], 2020. """
        if y <= 0 or x < 0:
            raise ValueError
        if x > y:
            xf = int(x / y)  # Get integer part
            x = x % y  # Reduce to fraction
            if x > 0 and self.zero_or_one_exp_minus(x, y) == 0:
                return 0
            for i in range(1, xf + 1):
                if self.zero_or_one_exp_minus(1, 1) == 0:
                    return 0
            return 1
        r = 1
        oy = y
        while True:
            if self.zero_or_one(x, y) == 0:
                return r
            if r == 1:
                r = 0
            else:
                r = 1
            y = y + oy

    def _zero_or_one_power_frac(self, px, py, nx, ny):
        # Generates a random number, namely 1 with
        # probability (px/py)^(ax/ay) (where ax/ay is in (0, 1)),
        # and 1 otherwise.  Returns 1 if ax/ay is 0.  Reference:
        # Mendo, Luis. "An asymptotically optimal Bernoulli
        # factory for certain functions that can be expressed
        # as power series." Stochastic Processes and their
        # Applications 129, no. 11 (2019): 4366-4384.
        i = 1
        while True:
            x = self.zero_or_one(px, py)
            if x == 1:
                return 1
            if self.zero_or_one(ax, ay * i) == 1:
                return 0
            i = i + 1

    def zero_or_one_power_ratio(self, px, py, nx, ny):
        """ Generates 1 with probability (px/py)^(nx/ny) (where nx/ny can be positive, negative, or zero); 0 otherwise. """
        if py <= 0 or px < 0:
            raise ValueError
        n = Fraction(nx, ny)
        p = Fraction(px, py)
        nx = n.numerator
        ny = n.denominator
        px = p.numerator
        py = p.denominator
        if n < 0:  # (px/py)^(nx/ny) -> (py/px)^-(nx/ny)
            n = -n
            return self.zero_or_one_power_ratio(py, px, n.numerator, n.denominator)
        if n == 0 or px >= py:
            return 1
        if nx == ny:
            return self.zero_or_one(px, py)
        if nx > ny:
            # (px/py)^(nx/ny) -> (px/py)^int(nx/ny) * (px/py)^frac(nx/ny)
            xf = int(nx / ny)  # Get integer part
            nx = nx % ny  # Reduce to fraction
            if nx > 0 and self._zero_or_one_power_frac(nx, ny) == 0:
                return 0
            n1 = 1
            npx = px
            npy = py
            while n1 < xf and px < (1 << 32) and py < (1 << 32):
                npx *= px
                npy *= py
                n1 += 1
            if n1 > 1:
                quo = int(xf / n1)
                if self.zero_or_one_power(npx, npy, quo) == 0:
                    return 0
                xf -= quo * n1
            for i in range(xf):
                if self.zero_or_one(px, py) == 0:
                    return 0
            return 1
        return self._zero_or_one_power_frac(nx, ny)

    def zero_or_one_power(self, px, py, n):
        """ Generates 1 with probability (px/py)^n (where n can be positive, negative, or zero); 0 otherwise. """
        return self.zero_or_one_power_ratio(px, py, n, 1)

    def negativebinomialint(self, successes, px, py):
        if successes < 0 or py == 0:
            raise ValueError
        if successes == 0 or px >= py:
            return 0
        if px < 0.0:
            return 1.0 / 0.0
        if successes > 1:
            r = 0
            for i in range(successes):
                r += self.negativebinomialint(1, px, py)
            return r
        # Geometric distribution for successes=1
        px = py - px
        if px * 10 < py:
            # Use the trivial algorithm if success
            # probability is high enough
            count = 0
            while True:
                if self.zero_or_one(px, py) == 0:
                    return count
                count += 1
            return count
        # Based on the algorithm given in Bringmann, K.
        # and Friedrich, T., 2013, July. Exact and efficient generation
        # of geometric random variates and random graphs, in
        # _International Colloquium on Automata, Languages, and
        # Programming_ (pp. 267-278).
        d = 0
        k = 4
        while self.zero_or_one_power(px, py, 1 << k) == 1:
            d += 1
        m = 0
        accepted = False
        while not accepted:
            m = 0
            accepted = True
            for i in range(k):
                mb = self.rndint(1) << (k - 1 - i)
                m |= mb
                if self.zero_or_one_power(px, py, mb) == 0:
                    accepted = False
                    break
        return (d << k) + m

    def negativebinomial(self, successes, p):
        if successes < 0:
            raise ValueError
        if successes == 0 or p >= 1.0:
            return 0
        if p <= 0.0:
            return 1.0 / 0.0
        if successes == 1.0:
            return int(-self.exponential(math.log(1.0 - p)))
        if int(successes) != successes or successes > 1000:
            return self.poisson(self.gamma(successes) * (1 - p) / p)
        else:
            count = 0
            while True:
                if self.bernoulli(p) == 1:
                    return count
                else:
                    count += 1

    def dirichlet(alphas):
        gammas = [self.gamma(x, 1) for x in alphas]
        sumgammas = sum(gammas)
        return [gammas[i] / sumgammas for i in range(len(alphas) - 1)]

    def multipoisson(self, firstmean, othermeans):
        """ Multivariate Poisson distribution (as found in Mathematica). """
        first = self.poisson(firstmean)
        return [first + self.poisson(m) for m in othermeans]

    def _urandnew(self):
        return [0, 0]

    def _urandless(self, a, b):
        abits = a[1]
        if abits == 0:
            abits = 1
            tmp = self.rndintexc(1 << (abits + 1))
            a[0] = tmp & 1
            bb = tmp >> 1
        else:
            bb = 0
            # Set bits of b from most to least
            # significant bit
            for i in range(abits):
                sh = abits - 1 - i
                bb |= self.rndintexc(2) << sh
                # Bits not yet determined are set to ones,
                # since we're checking if a is greater
                # than the highest possible value for b,
                # which indicates failure
                bbc = bb | (1 << sh) - 1
                if a[0] > bbc:
                    # a turned out to be greater than b
                    return False
        while bb == a[0]:
            abits += 1
            sr = self.rndint(3)
            bb = (bb << 1) | (sr & 1)
            a[0] = (a[0] << 1) | ((sr >> 1) & 1)
        a[1] = abits
        b[0] = bb
        b[1] = abits
        return a[0] < b[0]

    def _urandgreater(self, a, b):
        abits = a[1]
        if abits == 0:
            abits = 1
            tmp = self.rndintexc(1 << (abits + 1))
            a[0] = tmp & 1
            bb = tmp >> 1
        else:
            bb = 0
            # Set bits of b from most to least
            # significant bit
            for i in range(abits):
                sh = abits - 1 - i
                bb |= self.rndintexc(2) << sh
                # Bits not yet determined are set to zeros,
                # since we're checking if a is less
                # than the lowest possible value for b,
                # which indicates failure
                if a[0] < bb:
                    # a turned out to be less than b
                    return False
        while bb == a[0]:
            abits += 1
            sr = self.rndint(3)
            bb = (bb << 1) | (sr & 1)
            a[0] = (a[0] << 1) | ((sr >> 1) & 1)
        a[1] = abits
        b[0] = bb
        b[1] = abits
        return a[0] > b[0]

    def _urandfill(self, a, bits):
        if a[1] > bits:
            # Shifting bits beyond the first excess bit.
            aa = a[0] >> (a[1] - bits - 1)
            # Check the excess bit; if odd, round up.
            return aa >> 1 if (aa & 1) == 0 else (aa >> 1) + 1
        elif a[1] < bits:
            bc = bits - a[1]
            a[0] <<= bc
            a[0] |= self.rndintexc(1 << bc)
            a[1] = bits
            return a[0]
        else:
            return a[0]

    # The von Neumann exponential generator,
    # but using u-rands as defined in Karney.
    def _expovnbits(self, bits):
        count = 0
        while True:
            y1 = self._urandnew()
            y = y1
            accept = True
            while True:
                z = self._urandnew()
                if self._urandgreater(y, z):
                    accept = not accept
                    y = z
                break
            if accept:
                count += self._urandfill(y1, bits)
                break
            count += 1 << bits
        return count * 1.0 / (1 << bits)

    def exponential(self, lamda=1.0):
        if self.rndint(1) == 0:
            return self._expovnbits(53)
        # Flip-flopping idea taken from (Pederson 2018)
        if self.rndint(1) == 0:
            x = self.rndrangeminexc(0, 0.5)
            # avoid bias
            while x == 0.5 and self.rndint(1) == 0:
                x = self.rndrangeminexc(0, 0.5)
            return -math.log(x) / lamda
        else:
            return -math.log1p(self.rndrangeminmaxexc(-0.5, 0)) / lamda

    def expoRatio(self, base, rx=1, ry=1):
        """ Generates an exponential random number
          (in the form of a ratio, or two-element list) given
          the rate `rx`/`ry` and the base `base`.
          The number will have the denominator `base*rx`. """
        return [self.expoNumerator(base * ry), base * rx]

    def expoNumerator(self, denom):
        """ Generates the numerator of an exponential random
           number with a given denominator,
           using von Neumann's
           algorithm ("Various techniques used in connection with
           random digits", 1951). """
        count = 0
        while True:
            y1 = self.rndintexc(denom)
            y = y1
            accept = True
            while True:
                z = self.rndintexc(denom)
                if y <= z:
                    break
                accept = not accept
                y = z
            if accept:
                count += y1
            else:
                count += denom
            if accept:
                break
        return count

    def pareto(self, minimum, alpha):
        return self.rndu01zerooneexc() ** (-1.0 / alpha) * minimum

    def vonmises(self, mean, kappa):
        if kappa < 0:
            raise ValueError
        if kappa == 0:
            return self.rndrangemaxexc(mean - pi, mean + pi)
        r = 1 + math.sqrt(4 * kappa * kappa + 1)
        rho = (r - math.sqrt(2 * r)) / (kappa * 2)
        s = (1 + rho * rho) / (2 * rho)
        while True:
            u = self.rndrangemaxexc(-1, 1)
            v = self.rndu01zerooneexc()
            z = math.cos(math.pi * u)
            w = (1 + s * z) / (s + z)
            y = kappa * (s - w)
            if y * (2 - y) - v >= 0 or math.log(y / v) + 1 - y >= 0:
                if w < -1:
                    w = -1
                if w > 1:
                    w = 1
                angle = math.acos(w)
                if u < 0:
                    angle = -angle
                return mean + angle

    def negativeMultinomial(self, succ, failures):
        """
Negative multinomial distribution.

Models the number of failures of one or more
kinds before a given number of successes happens.
succ: Number of successes.
failures: Contains probabilities for each kind of failure.
The sum of probabilities must be less than 1.
Returns: A list containing a random number
of failures of each kind of failure.
    """
        ret = [0 for _ in failures]
        i = 0
        while i < succ:
            r = self.rndu01oneexc()
            p = 0
            nosuccess = false
            for j in range(len(failures)):
                if r >= p and r < p + failures[j]:
                    ret[j] += 1
                    nosuccess = true
                    break
                p += failures[j]
            if not nosuccess:
                i += 1
        return ret

    def multinomial(self, trials, weights):
        if trials * 2 < len(weights):
            ls = [0 for i in range(len(weights))]
            for i in range(trials):
                wc = self.weighted_choice(weights)
                ls[wc] += 1
            return ls
        else:
            # Corollary 45's proof in Durfee, et al., l1 Regression
            # using Lewis Weights Preconditioning and Stochastic
            # Gradient Descent, Proc. of Machine Learning Research
            # 75(1), 2018.  Assumes weights are integers.
            ls = [0 for i in range(len(weights))]
            s = sum(weights)
            # Note: Corollary assumes each item in this list
            # is a rational number
            ratios = [Fraction(w, s) for w in weights]
            t = trials
            for i in range(len(weights)):
                r = ratios[i]
                b = self.binomial_int(t, r.numerator, r.denominator)
                ls[i] = b
                t -= b
                for j in range(i + 1, len(weights)):
                    ratios[j] /= 1 - r
            return ls

    def nonzeroIntegersWithSum(self, n, total):
        """"
Returns a list of 'n' integers greater than 0 that sum to 'total'.
The combination is chosen uniformly at random among all
possible combinations.
        """
        if n <= 0 or total <= 0:
            raise ValueError
        ls = []
        i = 0
        list.insert(ls, 0, 0)
        while len(ls) < n:
            c = self.rndintexcrange(1, total)
            found = False
            j = 1
            while j < len(ls):
                if ls[j] == c:
                    found = True
                    break
                j = j + 1
            if found == False:
                list.insert(ls, len(ls), c)
        ls.sort()
        list.insert(ls, len(ls), total)
        return [ls[i] - ls[i - 1] for i in range(1, len(ls))]

    def integersWithSum(self, n, total):
        """"
Returns a list of 'n' integers 0 or greater that sum to 'total'.
The combination is chosen uniformly at random among all
possible combinations.
        """
        if n <= 0 or total <= 0:
            raise ValueError
        return [s - 1 for s in self.nonzeroIntegersWithSum(n, total + n)]

    def diceRoll(self, dice, sides=6, bonus=0):
        if dice < 0 or sides < 1:
            raise ValueError
        if dice == 0:
            return 0
        if sides == 1:
            return dice
        ret = 0
        if dice > 50:
            # If there are many dice to roll,
            # use a faster approach, noting that
            # the dice-roll distribution approaches
            # a "discrete" normal distribution as the
            # number of dice increases.
            mean = dice * (sides + 1) * 0.5
            sigma = math.sqrt(dice * (sides * sides - 1) / 12)
            ret = -1
            while ret < dice or ret > dice * sides:
                ret = round(self.normal(mean, sigma))
        else:
            i = 0
            while i < dice:
                ret = ret + self.rndintrange(1, sides)
                i = i + 1
        ret = ret + bonus
        if ret < 0:
            ret = 0
        return ret

    def _ierf(self, x):
        """ Inverse error function. """
        coeffs = [
            0.3333333333333333,
            0.23333333333333333,
            0.2015873015873016,
            0.19263668430335099,
            0.19532547699214364,
            0.20593586454697566,
            0.2232097574187521,
            0.24697023314275485,
            0.27765382560322394,
            0.3161426235531171,
            0.3637175870396921,
            0.4220720808430425,
            0.49336326556393456,
            0.5802938460615139,
            0.6862233969476911,
            0.815312205552808,
            0.9727032088645521,
            1.1647499636184413,
            1.3993010831666697,
            1.6860544545395042,
        ]
        cx = x * 0.886226925452758  # x/(2.0/sqrt(pi))
        ret = cx
        cxsq = cx * cx
        for c in coeffs:
            cx *= cxsq
            ret += cx * c
        return ret

    def _icdfnormal(self, x):
        """ Inverse cumulative distribution function of the
       standard normal distribution.  """
        return self._ierf(2 * x - 1) * math.sqrt(2)

    def powerlognormal(self, p, sigma=1.0):
        """ Power lognormal distribution, as described in NIST/SEMATECH
     e-Handbook of Statistical Methods, http://www.itl.nist.gov/div898/handbook/,
     accessed Jun. 9, 2018, sec. 1.3.6.6.14. """
        return math.exp(self._icdfnormal(1 - (1 - self.rndu01()) ** (1.0 / p)) * sigma)

    def powernormal(self, p):
        """ Power normal distribution, as described in NIST/SEMATECH
     e-Handbook of Statistical Methods, http://www.itl.nist.gov/div898/handbook/,
     accessed Jun. 9, 2018, sec. 1.3.6.6.13. """
        return self._icdfnormal(1 - (1 - self.rndu01()) ** (1.0 / p))

    def _mhc2(self, pdf, n, sigma=1.0):
        # Bivariate Metropolis-Hastings
        burnin = 1000
        ru = [self.rndu01() for _ in range(n + burnin)]
        sqsigma = sigma * sigma
        cov = [[sqsigma, 0], [0, sqsigma]]
        rn = self.multinormal_n(None, cov, n + burnin)
        ret = [0 for _ in range(n)]
        p = 0
        while p == 0:
            x = self.multinormal(None, cov)
            p = pdf(x)
        for i in range(n + burnin):
            newx = [x[j] + rn[i][j] for j in range(2)]
            p2 = pdf(newx)
            accept = p2 > 0 and p2 / p >= ru[i]
            x = newx if accept else x
            p = p2 if accept else p
            if i >= burnin:
                ret[i - burnin] = x
        return ret

    def _mhc(self, pdf, n, sigma=1.0):
        # Univariate Metropolis-Hastings
        burnin = 1000
        ru = [self.rndu01() for _ in range(n + burnin)]
        rn = [self.normal(0, sigma) for _ in range(n + burnin)]
        ret = [0 for _ in range(n)]
        p = 0
        nsig = 1.0 / (2 * sigma * sigma)
        while p == 0:
            x = self.normal(0, sigma)
            p = math.exp(-0.5 * (x * x) * nsig) * pdf(x)
        for i in range(n + burnin):
            newx = x + rn[i]
            p2 = math.exp(-0.5 * (newx * newx) * nsig) * pdf(newx)
            accept = p2 > 0 and p2 / p >= ru[i]
            x = newx if accept else x
            p = p2 if accept else p
            if i >= burnin:
                ret[i - burnin] = x
        return ret

    def slicesample(self, pdf, n, xstart=0.1):
        """
  Slice sampling of R. M. Neal.
  Generates 'n' random numbers that follow
  the probability density given in 'pdf' using
  slice sampling.  The resulting random numbers
  are not independent, but are often close to
    being independent.  'pdf' takes one number as
    a parameter and returns a number 0 or greater.
    The area under the curve (integral) of 'pdf'
    need not be equal to 1. 'xstart' should be
  chosen such that `pdf(xstart)>0`.
     """
        x = xstart
        w = 0.2
        while pdf(x) <= 0:
            xstart += w
        ret = []
        burnin = 2000
        while len(ret) < n:
            y = self.rndrange(0, pdf(x))
            xleft = x
            xright = x
            while xleft == x or y < pdf(xleft):
                xleft -= w
            while xright == x or y < pdf(xright):
                xright += w
            while True:
                x2 = self.rndrange(xleft, xright)
                if y < pdf(x2):
                    x = x2
                    break
                if x2 > x:
                    xright = x2
                else:
                    xleft = x2
            if burnin == 0:
                ret.append(x)
            else:
                burnin -= 1
        return ret

    def mcmc(self, pdf, n):
        """ Generates 'n' random numbers that follow
    the probability density given in 'pdf' using
    a Markov-chain Monte Carlo algorithm, currently
    Metropolis--Hastings.  The resulting random numbers
    are not independent, but are often close to
    being independent.  'pdf' takes one number as
    a parameter and returns a number 0 or greater.
    The area under the curve (integral) of 'pdf'
    need not be equal to 1. """
        # Compute optimal sigma.  See
        # Gelman et al., 1997.
        s = _variance(self._mhc(pdf, 1000, 3.0)) * 5.6644
        return self._mhc(pdf, n, s)

    def mcmc2(self, pdf, n):
        """ Generates 'n' pairs of random numbers that follow
    the probability density given in 'pdf' using
    a Markov-chain Monte Carlo algorithm, currently
    Metropolis--Hastings.  The resulting random pairs
    are not independent, but are often close to
    being independent.  'pdf' takes one parameter,
    namely, a list of two numbers giving a sampled
    point and returns a number 0 or greater.
    The volume under the surface (integral) of 'pdf'
    need not be equal to 1. """
        mhc = self._mhc2(pdf, 1000, 3.0)
        # Compute distances of random points
        # from the origin
        dists = [math.sqrt(x * x + y * y) for x, y in mhc]
        # Compute optimal sigma.  See
        # Gelman et al., 1997.
        s = _variance(dists) * 5.6644
        return self._mhc2(pdf, n, s)

    def _decompose(self, matrix):
        numrows = len(matrix)
        if len(matrix[0]) != numrows:
            raise ValueError
        # Does a Cholesky decomposition of a matrix
        # assuming it's positive definite and invertible
        ret = [[0 for j in range(numrows)] for i in range(numrows)]
        s1 = math.sqrt(matrix[0][0])
        if s1 == 0:
            return ret  # For robustness
        for i in range(0, numrows):
            ret[0][i] = matrix[0][i] * 1.0 / s1
        for i in range(0, numrows):
            msum = 0.0
            for j in range(i):
                msum = msum + ret[j][i] * ret[j][i]
            sq = matrix[i][i] - msum
            if sq < 0:
                sq = 0  # For robustness
            ret[i][i] = math.sqrt(sq)
        for j in range(0, numrows):
            for i in range(j + 1, numrows):
                # For robustness
                if ret[j][j] == 0:
                    ret[j][i] = 0
                if ret[j][j] != 0:
                    msum = 0
                    for k in range(j):
                        msum = msum + ret[k][i] * ret[k][j]
                    ret[j][i] = (matrix[j][i] - msum) * 1.0 / ret[j][j]
        return ret

    def spsa_minimize(
        self, func, guess, iterations=200, constrain=None, a=None, c=None, acap=None
    ):
        """Tries to find a choice of parameters that minimizes the value
of a scoring function, also called the objective function or loss
function, starting from an initial guess.  This method uses an
algorithm called "simultaneous perturbation
stochastic approximation", which is a randomized
search for the minimum value of the objective function.
func - Objective function, a function that calculates a score for the
 given array of parameters and returns that score.  The score is a
 single number; the lower the score, the better.
 The score can be negative.  (Note that the problem of maximizing
 the score is the same as minimizing it except
 that the score's sign is reversed at the end.)
guess - Initial guess for the best choice of parameters.  This is an
 array of parameters, each of which is a number. This array has
 as many items as the array passed to 'func'.
iterations - Maximum number of iterations in which to run the
 optimization process.  Default is 200.
constrain - Optional. A function that takes the given array of
 parameters and constrains them to fit the bounds of a valid
 array of parameters. This function modifies the array in place.
a - Optional.  A setting used in the optimization process; greater than 0.
c - Optional.  A setting used in the optimization process; greater than 0. As a guideline,
  'c' is about equal to the "standard deviation of the measurement noise"
  for several measurements at the initial guess, and is a "small positive
  number" if measurements are noise-free (Spall 1998).  Default
  is 0.001.
acap - Optional.  A setting used in the optimization process; an
  integer greater than 0.
"""
        # c>0; a>0; acap is an integer > 0
        if c == None:
            c = 0.001  # Guideline (Spall 1998)
        if acap == None:
            acap = max([1, int(iterations / 10)])  # Guideline (Spall 1998)
        if a == None:
            # Guideline (Spall 1998).  Assume the desired
            # movement in early iterations is 1/10 of magnitude
            # (norm) of ghat(guess,func,c,acap):
            # > ghats=[_norm(ghat(guess,func,c,acap)) for i in range(5)]
            # > meanghat=sum(ghats)/len(ghats)
            # > movementRatio=desiredMovement/meanghat
            movementRatio = 0.1
            a = ((acap + 1) ** 1.0) * movementRatio
        if a <= 0 or c <= 0 or acap <= 0:
            raise ValueError
        g = 1.0 / 6
        low = [x for x in guess]
        high = [x for x in guess]
        curguess = [x for x in guess]
        newguess = [x for x in guess]
        oldvalue = func(guess)
        bestguess = [x for x in guess]
        bestvalue = oldvalue
        nochangecount = 0
        for i in range(iterations):
            ci = c * 1.0 / (1 + i) ** g
            d = [ci * (self.rndint(1) * 2 - 1) for x in curguess]
            for j in range(len(curguess)):
                high[j] = curguess[j] + d[j]
                low[j] = curguess[j] - d[j]
            gr = func(high) - func(low)
            ai = a * 1.0 / (1 + i + acap)
            for j in range(len(curguess)):
                newguess[j] = curguess[j] - ai * gr / (d[j] * 2.0)
            # constraint
            if constrain != None:
                constrain(newguess)
            newvalue = func(newguess)
            if newvalue > oldvalue + 10:
                continue
            # update current guess
            for j in range(len(curguess)):
                curguess[j] = newguess[j]
            if newvalue < bestvalue:
                bestvalue = newvalue
                for j in range(len(curguess)):
                    bestguess[j] = newguess[j]
            # NOTE: Here, 1e-5 is a tolerance
            # between successive iterations
            # of the algorithm; values within
            # tolerance are treated as changing
            # little
            if abs(newvalue - oldvalue) < 1e-5:
                nochangecount += 1
                if nochangecount > 10:
                    break
            else:
                nochangecount = 0
            oldvalue = newvalue
        return bestguess

    def monte_carlo_integrate(self, func, bounds, samples=1000):
        """
    Estimates the integral (volume) of a function within the
    given bounds using Monte Carlo integration, which generates
    an estimate using the help of randomization.
    func - Function to integrate.  Takes the same number
       of parameters as the length of bounds.
    bounds - Bounds of integration at each dimension.
       An N-length array of arrays.  Each array in turn
       contains two items: the lower bound and upper bound
       for that dimension.
    samples - Number of times to sample the bounds of
       integration randomly.  The default is 1000 samples.
    Returns an array containing two items: the estimated
    integral and the standard error.
    """
        xm = func(*[self.rndrange(a[0], a[1]) for a in bounds])
        xs = 0
        i = 1
        for j in range(samples):
            c = func(*[self.rndrange(a[0], a[1]) for a in bounds])
            i += 1
            cxm = c - xm
            xm += cxm * 1.0 / i
            xs += cxm * (c - cxm)
        # Calculate the bounding volume
        volume = 1
        for a in bounds:
            volume *= a[1] - a[0]
        # Return integral and standard error
        return [volume * xm, volume * math.sqrt(xs * 1.0 / (i * i))]

    def kth_smallest_of_n_u01(self, k, n):
        """ Generates the kth smallest number among n random numbers
         in the interval [0, 1]. """
        if k > n or n < 1:
            raise ValueError
        if n < 20:
            nums = [self.randu01() for i in n]
            nums.sort()
            return nums[k - 1]
        return self.beta(k, n + 1 - k)

    def multinormal_n(self, mu, cov, n=1):
        mulen = len(cov)
        if mu != None:
            mulen = len(mu)
            if mulen != len(cov):
                raise ValueError
            if mulen != len(cov[0]):
                raise ValueError
        cho = self._decompose(cov)
        vts = [self.normal(0, 1) for i in range(mulen * n)]
        ret = [[0 for i in range(mulen)] for i in range(n)]
        for k in range(n):
            js = mulen * k
            i = 0
            while i < mulen:
                msum = 0
                if mu != None:
                    msum = mu[i]
                for j in range(mulen):
                    msum = msum + vts[js + j] * cho[j][i]
                ret[k][i] = msum
                i = i + 1
        return ret

    def multinormal(self, mu, cov):
        return self.multinormal_n(mu, cov, 1)[0]

    def upper_bound_copula(self, n=2):
        x = self.rndu01()  # Generate number once
        return [x for i in range(n)]

    def product_copula(self, n=2):
        return [self.rndu01() for i in range(n)]

    def lower_bound_copula(self):
        x = self.rndu01()  # Generate number once
        return [x, 1.0 - x]

    def gaussian_copula(self, cov):
        mvn = self.multinormal(None, cov)
        for i in range(len(cov)):
            # Apply the normal distribution's CDF
            # to get uniform random number
            mvn[i] = (
                math.erf(mvn[i] / (math.sqrt(2) * math.sqrt(cov[i][i]))) + 1
            ) * 0.5
        return mvn

    def multivariate_t(self, mu, cov, df):
        """ Multivariate t-distribution, mu is the mean (can be None),
           cov is the covariance matrix, and df is the degrees of freedom. """
        mn = self.multinormal(None, cov)
        cd = self.gamma(df * 0.5, 2.0 / df)
        return [
            (0 if mu == None else mu[i]) + mn[i] / math.sqrt(cd) for i in range(len(mn))
        ]

    def _pochhammer(self, a, b):
        return math.gamma(a + b) / math.gamma(a)

    def _beta(self, a, b):
        return math.gamma(a) * math.gamma(b) / math.gamma(a + b)

    def _betainc(self, x, a, b):
        # Incomplete beta function.  NOTES:
        # 1. The SciPy method
        # scipy.stats.betainc(a, b, x) is the same as _betainc(x, a, b).
        # 2. This is also the beta distribution's CDF.
        if x > 0.5 and x < 1.0:
            return 1.0 - self._betainc(1.0 - x, b, a)
        if x == 0 and a > 0:
            return 0.0
        if b < 50 and math.floor(b) == b:
            if b < 0:
                return 0
            return (x ** a) * sum(
                [
                    self._pochhammer(a, i) * pow(1 - x, i) * 1.0 / math.gamma(i + 1)
                    for i in range(int(b))
                ]
            )
        if a > 0 and a < 50 and math.floor(a) == a:
            return 1.0 - ((1.0 - x) ** b) * sum(
                [
                    self._pochhammer(b, i) * (x ** i) * 1.0 / math.gamma(i + 1)
                    for i in range(int(a))
                ]
            )
        ret = pow(10, -100)
        d = 0
        c = ret
        i = 0
        k = 0
        while i < 100:
            # Get next convergent of continued fraction
            if i == 0:
                num = 1.0
            else:
                if (i & 1) == 1:
                    num = -(a + k) * (a + b + k) * x * 1.0 / ((a + i - 1) * (a + i))
                else:
                    num = (b - k) * k * x * 1.0 / ((a + i - 1) * (a + i))
            c = 1 + num / c  # 1 is the convergent's denominator
            d = 1 + num * d  # ditto
            if d == 0:
                d = pow(10, -100)
            if c == 0:
                c = pow(10, -100)
            d = 1.0 / d
            delta = d * c
            ret *= delta
            if abs(delta - 1.0) < pow(10, -14):
                break
            i = i + 1
            if (i & 1) == 0:
                k = k + 1
        return ret * (x ** a) * ((1 - x) ** b) / (a * self._beta(a, b))

    def _student_t_cdf(self, nu, x):
        if x <= 0:
            return self._betainc(nu / (x * x + nu), nu * 0.5, 0.5) * 0.5
        else:
            return (self._betainc((x * x) / (x * x + nu), 0.5, nu * 0.5) + 1) * 0.5

    def t_copula(self, cov, df):
        """ Multivariate t-copula. 'cov' is the covariance matrix
       and 'df' is the degrees of freedom.  """
        mt = self.multivariate_t(None, cov, df)
        return [self._student_t_cdf(df, mt[i]) for i in range(len(mt))]

    def simplex_point(self, points):
        """ Generates an independent and uniform random point on the surface of an N-dimensional
           simplex (line segment, triangle, tetrahedron, etc.)
           with the given coordinates. """
        ret = []
        if len(points) > len(points[0]) + 1:
            raise ValueError
        if len(points) == 1:  # Return a copy of the point
            for i in range(0, len(points[0])):
                ret.append(points[0][i])
            return ret
        gammas = []
        # Sample from a Dirichlet distribution
        simplexDims = len(points) - 1
        for i in range(0, len(points)):
            gammas.append(self.exponential())
        tsum = 0
        for i in range(0, len(gammas)):
            tsum = tsum + gammas[i]
        tot = 0
        for i in range(0, len(gammas) - 1):
            gammas[i] = gammas[i] / tsum
            tot = tot + gammas[i]
        tot = 1.0 - tot
        for i in range(0, len(points[0])):
            ret.append(points[0][i] * tot)
        for i in range(1, len(points)):
            for j in range(0, len(points[0])):
                ret[j] = ret[j] + points[i][j] * gammas[i - 1]
        return ret

    def hypercube_point(self, dims, sizeFromCenter=1):
        """ Generates an independent and uniform random point on the surface of a 'dims'-dimensional
           hypercube (square, cube, etc.)
           centered at the origin. """
        return [self.rndrange(-sizeFromCenter, sizeFromCenter) for _ in range(dims)]

    def _norm(self, vec):
        return math.sqrt(sum([x * x for x in vec]))

    def _sumsq(self, vec):
        return sum([x * x for x in vec])

    def _numngrad(self, f, u, v):
        """ Numerical norm of gradient. """
        eu = f(u, v)
        du = None
        dv = None
        edu = f(u + 0.00001, v)
        if edu[0] == 0 and edu[1] == 0 and edu[2] == 0:
            edu = f(u - 0.00001, v)
            du = [(eu[i] - edu[i]) / 0.00001 for i in range(3)]
        else:
            du = [(edu[i] - eu[i]) / 0.00001 for i in range(3)]
        edu = f(u, v + 0.00001)
        if edu[0] == 0 and edu[1] == 0 and edu[2] == 0:
            edu = f(u, v - 0.00001)
            dv = [(eu[i] - edu[i]) / 0.00001 for i in range(3)]
        else:
            dv = [(edu[i] - eu[i]) / 0.00001 for i in range(3)]
        gx = du[1] * dv[2] - du[2] * dv[1]
        gy = du[2] * dv[0] - du[0] * dv[2]
        gz = du[0] * dv[1] - du[1] * dv[0]
        return math.sqrt(gx * gx + gy * gy + gz * gz)

    def surface_point(self, f, bounds, ngrad, gmax):
        """ Generates a uniform random point on
        a parametric surface, using a rejection
        approach developed by Williamson, J.F.,
        "Random selection of points distributed on
         curved surfaces", Physics in Medicine & Biology 32(10), 1987.
     - f: Takes two parameters (u and v) and returns
       a 3-element array expressing
       a 3-dimensional position at the given point.
     - bounds: Two 2-element arrays expressing bounds
       for u and v.  Of the form [[umin, umax], [vmin,
       vmax]].
     - ngrad: Takes two parameters (u and v) and returns
       the norm of the gradient (stretch factor)
       at the given point.  Can be None, in which
       the norm-of-gradient is calculated numerically.
     - gmax: Maximum norm-of-gradient
       for entire surface.
       """
        while True:
            u = self.rndrangemaxexc(bounds[0][0], bounds[0][1])
            v = self.rndrangemaxexc(bounds[1][0], bounds[1][1])
            pt = f(u, v)
            nog = self._numngrad(f, u, v) if ngrad == None else ngrad(u, v)
            if nog >= self.rndrange(gmax):
                return pt

    def geoellipsoid_point(self, a=6378.137, invf=298.2572236):
        """ Generates an independent and uniform random
      point on the surface of a geoellipsoid.  The
      geoellipsoid uses the following parameters:
      a - semimajor axis (distance from the center of
         the geoellipsoid to the equator).  The default
         is the WGS 84 ellipsoid's semimajor axis
         in kilometers.
      invf - inverse flattening.  The default is the
         WGS 84 ellipsoid's inverse flattening. """
        # b is the semiminor axis, the distance from the
        # center of the geoellipsoid to the north pole
        b = a - (a * 1.0 / invf)
        semim = b / a
        semimp4 = semim * semim * semim * semim
        semiminv = 1.0 / semim
        while True:
            # Generate an ellipsoidal point, then accept or
            # reject it depending on its stretch factor (norm-of-
            # gradient).  This rejection approach for sampling
            # curved surfaces was developed by Williamson, J.F.,
            # "Random selection of points distributed on
            # curved surfaces", Physics in Medicine & Biology 32(10), 1987.
            # Generate a spherical point
            pt = self.hypersphere_point(3)
            # Make it ellipsoidal
            pz = pt[2] * semim
            # g is:
            # - the norm of the gradient for (pt[0],pt[1],pz),
            #   divided by
            # - the maximum possible value of that norm for
            #   the whole ellipsoid
            g = semiminv * math.sqrt(
                pz * pz + semimp4 * (pt[0] * pt[0] + pt[1] * pt[1])
            )
            if self.rndu01() <= g:
                # Accept the equivalent point
                # on the geoellipsoid
                return [pt[0] * a, pt[1] * a, pt[2] * b]

    def hypersphere_point(self, dims, radius=1):
        """ Generates an independent and uniform random point on the surface of a 'dims'-dimensional
           hypersphere (circle, sphere, etc.)
           centered at the origin. """
        if dims == 2:
            # Use polar method mentioned in Devroye 1986, p. 235
            while True:
                a = self.rndrange(-1, 1)
                b = self.rndrange(-1, 1)
                c = a * a
                d = b * b
                e = c + d
                if e != 0 and e <= 1:
                    ie = radius / e
                    return [(c - d) * ie, a * b * ie * 2]
        x = 0
        while x == 0:
            ret = [self.normal() for _ in range(dims)]
            x = self._norm(ret)
        return [i * radius / x for i in ret]

    def ball_point(self, dims, radius=1):
        """ Generates an independent and uniform random point inside a 'dims'-dimensional
           ball (disc, solid sphere, etc.) centered at the origin. """
        x = 0
        while x == 0:
            ret = [self.normal() for _ in range(dims)]
            x = math.sqrt(self._sumsq(ret) + self.exponential())
        return [i * radius / x for i in ret]

    def shell_point(self, dims, outerRadius=1, innerRadius=0.5):
        """ Generates an independent and uniform random point inside a 'dims'-dimensional
           spherical shell (donut, hollow sphere, etc.)
           centered at the origin. """
        r = self.rndrange(innerRadius ** dims, outerRadius ** dims) ** (1.0 / dims)
        return self.hypersphere_point(dims, r)

    def latlon(self):
        """ Generates an independent and uniform random latitude and
          longitude, in radians.  West and south coordinates
          are negative. """
        lon = self.rndrangemaxexc(-math.pi, math.pi)
        latx = self.rndrange(-1, 1)
        while latx == -1 or latx == 1:
            latx = self.rndrange(-1, 1)
        lat = math.atan2(math.sqrt(1 - latx * latx), latx) - math.pi * 0.5
        return [lat, lon]

    def _getSolTable(self, n, mn, mx, sum):
        t = [[0 for i in range(sum + 1)] for j in range(n + 1)]
        t[0][0] = 1
        for i in range(1, n + 1):
            for j in range(0, sum + 1):
                jm = max(j - (mx - mn), 0)
                v = 0
                for k in range(jm, j + 1):
                    v += t[i - 1][k]
                t[i][j] = v
        return t

    def _getSolTableForRanges(self, ranges, adjsum):
        n = len(ranges)
        t = [[0 for i in range(adjsum + 1)] for j in range(n + 1)]
        t[0][0] = 1
        for i in range(1, n + 1):
            for j in range(0, adjsum + 1):
                krange = ranges[i - 1][1] - ranges[i - 1][0]
                jm = max(j - krange, 0)
                v = 0
                for k in range(jm, j + 1):
                    v += t[i - 1][k]
                t[i][j] = v
        return t

    def intsInRangesWithSum(self, numSamples, ranges, total):
        """ Generates one or more combinations of
           'len(ranges)' numbers each, where each
           combination's numbers sum to 'total', and each number
           has its own valid range.  'ranges' is a list of valid ranges
           for each number; the first item in each range is the minimum
           value and the second is the maximum value.  For example,
           'ranges' can be [[1,4],[3,5],[2,6]], which says that the first
           number must be in the interval [1, 4], the second in [3, 5],
           and the third in [2, 6].
            The combinations are chosen uniformly at random.
               Neither the integers in the 'ranges' list nor
           'total' may be negative.  Returns an empty
           list if 'numSamples' is zero.
            This is a modification I made to an algorithm that
              was contributed in a _Stack Overflow_
          answer (`questions/61393463`) by John McClane.
          Raises an error if there is no solution for the given
          parameters.  """
        mintotal = sum([x[0] for x in ranges])
        maxtotal = sum([x[1] for x in ranges])
        adjsum = total - mintotal
        # Min, max, sum negative
        if total < 0:
            raise ValueError
        for r in ranges:
            if r[0] < 0 or r[1] < 0:
                raise ValueError
        # No solution
        if mintotal > total or maxtotal < total:
            raise ValueError
        if numSamples == 0:
            return []
        # One solution
        if maxtotal == total:
            return [[x[1] for x in ranges] for i in range(numSamples)]
        if mintotal == total:
            return [[x[0] for x in ranges] for i in range(numSamples)]
        samples = [None for i in range(numSamples)]
        numPerSample = len(ranges)
        table = self._getSolTableForRanges(ranges, adjsum)
        for sample in range(numSamples):
            s = adjsum
            ret = [0 for i in range(numPerSample)]
            for ib in range(numPerSample):
                i = numPerSample - 1 - ib
                v = self.rndintexc(table[i + 1][s])
                r = ranges[i][0]
                v -= table[i][s]
                while v >= 0:
                    s -= 1
                    r += 1
                    v -= table[i][s]
                ret[i] = r
            samples[sample] = ret
        return samples

    def intsInRangeWithSum(self, numSamples, numPerSample, mn, mx, sum):
        """ Generates one or more combinations of
           'numPerSample' numbers each, where each
           combination's numbers sum to 'sum' and are listed
           in any order, and each
           number is in the interval '[mn, mx]'.
            The combinations are chosen uniformly at random.
               'mn', 'mx', and
           'sum' may not be negative.  Returns an empty
           list if 'numSamples' is zero.
            The algorithm is thanks to a _Stack Overflow_
          answer (`questions/61393463`) by John McClane.
          Raises an error if there is no solution for the given
          parameters.  """
        adjsum = sum - numPerSample * mn
        # Min, max, sum negative
        if mn < 0 or mx < 0 or sum < 0:
            raise ValueError
        # No solution
        if numPerSample * mx < sum:
            raise ValueError
        if numPerSample * mn > sum:
            raise ValueError
        if numSamples == 0:
            return []
        # One solution
        if numPerSample * mx == sum:
            return [[mx for i in range(numPerSample)] for i in range(numSamples)]
        if numPerSample * mn == sum:
            return [[mn for i in range(numPerSample)] for i in range(numSamples)]
        samples = [None for i in range(numSamples)]
        table = self._getSolTable(numPerSample, mn, mx, adjsum)
        for sample in range(numSamples):
            s = adjsum
            ret = [0 for i in range(numPerSample)]
            for ib in range(numPerSample):
                i = numPerSample - 1 - ib
                v = self.rndintexc(table[i + 1][s])
                r = mn
                v -= table[i][s]
                while v >= 0:
                    s -= 1
                    r += 1
                    v -= table[i][s]
                ret[i] = r
            samples[sample] = ret
        return samples

    def _getSolTableSorted(self, n, mn, mx, sum):
        mrange = mx - mn
        t = [
            [[0 for _ in range(sum + 1)] for _ in range(mrange + 1)]
            for _ in range(n + 1)
        ]
        for i in range(0, mrange + 1):
            t[0][i][0] = 1
        for i in range(1, n + 1):
            for k in range(0, sum + 1):
                t[i][0][k] = t[i - 1][0][k]
            for j in range(1, mrange + 1):
                for k in range(0, sum + 1):
                    kj = k - j
                    v = t[i][j - 1][k]
                    if kj >= 0:
                        v += t[i - 1][j][k - j]
                    t[i][j][k] = v
        return t

    def intsInRangeSortedWithSum(self, numSamples, numPerSample, mn, mx, sum):
        """ Generates one or more combinations of
           'numPerSample' numbers each, where each
           combination's numbers sum to 'sum' and are listed
           in sorted order, and each
           number is in the interval '[mn, mx]'.
            The combinations are chosen uniformly at random.
               'mn', 'mx', and
           'sum' may not be negative.  Returns an empty
           list if 'numSamples' is zero.
            The algorithm is thanks to a _Stack Overflow_
          answer (`questions/61393463`) by John McClane.
          Raises an error if there is no solution for the given
          parameters.  """
        adjsum = sum - numPerSample * mn
        # Min, max, sum negative
        if mn < 0 or mx < 0 or sum < 0:
            raise ValueError
        # No solution
        if numPerSample * mx < sum:
            raise ValueError
        if numPerSample * mn > sum:
            raise ValueError
        if numSamples == 0:
            return []
        # One solution
        if numPerSample * mx == sum:
            return [[mx for i in range(numPerSample)] for i in range(numSamples)]
        if numPerSample * mn == sum:
            return [[mn for i in range(numPerSample)] for i in range(numSamples)]
        samples = [None for i in range(numSamples)]
        table = self._getSolTableSorted(numPerSample, mn, mx, adjsum)
        for sample in range(numSamples):
            s = adjsum
            mrange = mx - mn
            ret = [0 for i in range(numPerSample)]
            for ib in range(numPerSample):
                i = numPerSample - 1 - ib
                ts = table[i + 1][mrange][s]
                v = self.rndintexc(ts)
                mrange = min(mrange, s)
                s -= mrange
                r = mn + mrange
                v -= table[i][mrange][s]
                while v >= 0:
                    s += 1
                    mrange -= 1
                    r -= 1
                    v -= table[i][mrange][s]
                ret[i] = r
            samples[sample] = ret
        if s != 0:
            raise ValueError
        return samples

    MINEXPONENT = -1074
    FPPRECISION = 53
    FPRADIX = 2

    def _fpExponent(self, x):  # The 'e' in s*2**e
        if x == 0:
            return MINEXPONENT
        return max(MINEXPONENT, math.frexp(x)[1] - FPPRECISION)

    def _fpSignificand(self, x):  # The 's' in s*2**e
        if x == 0:
            return 0
        fre = math.frexp(x)
        fexp = fre[1] - FPPRECISION
        c = ((fre[0] - 0.5) * (1 << FPPRECISION)).to_i | (1 << (FPPRECISION - 1))
        if fexp < MINEXPONENT:
            diff = -(fexp - MINEXPONENT)
            if (c & ((1 << diff) - 1)) != 0:
                raise ValueError
            c >>= diff
        return c

    def _fpRatio(self, fp):
        expo = self._fpExponent(fp)
        sig = self._fpSignificand(fp)
        if expo >= 0:
            return [sig * (1 << expo), 1]
        return [sig, 1 << abs(expo)]

    def _toWeights(self, ratios):
        ret = [self._fpRatio(r) for r in ratios]
        maxden = 0
        for r in ratios:
            maxden = max(maxden, r[1])
        return [r[0] * (maxden // r[1]) for i in ratios]

    def integers_from_pdf(self, pdf, mn, mx, n=1):
        """ Generates one or more random integers from a discrete probability
         distribution expressed as a probability density
         function (PDF), which is also called the probability mass
         function for discrete distributions.  The random integers
         will be in the interval [mn, mx].  `n` random integers will be
         generated. `pdf` is the PDF; it takes one parameter and returns,
         for that parameter, a weight indicating the relative likelihood
         that a random integer will equal that parameter.
         The area under the "curve" of the PDF need not be 1.
         By default, `n` is 1.  """
        wt = self._toWeights([pdf(x) for x in range(mn, mx)])
        return r._weighted_choice_n(wt, n, mn)

    def _ensuredenom(self, frac, denom):
        if frac.denominator > denom:
            newnum = int(abs(frac) * denom)
            if frac < 0:
                newnum = -newnum
            return Fraction(newnum, denom)
        return frac

    def _bisectionuniform(self, a, b, bitplaces):
        """  Devroye/Gravel bisection algorithm. """
        if a > b:
            raise ValueError
        if a == b:
            return mn
        epsdenom = 1 << bitplaces
        eps = Fraction(1, epsdenom)
        aax = a / eps
        bbx = b / eps
        if aax.denominator == 1 and bbx.denominator == 1:
            # Fast track
            diff = bbx.numerator - aax.numerator
            return self._ensuredenom(
                a + Fraction(self.rndint(diff), epsdenom), epsdenom
            )
        twoEps = eps * 2
        mn = Fraction(a)
        mx = Fraction(b)
        mxmn = mx - mn
        cdfa = Fraction(0)
        cdfb = Fraction(1)
        while True:
            bit = self.rndint(2)
            cdf = (cdfa + cdfb) / 2
            z = mn + (mx - mn) * cdf
            cdfz = (z - mn) / mxmn
            if bit == 0:
                b = z
                cdfb = cdfz
            else:
                a = z
                cdfa = cdfz
            if b - a <= twoEps:
                return self._ensuredenom((a + b) / 2, epsdenom)

    def numbers_from_dist_inversion(self, icdf, n=1, bitplaces=53):
        """
Generates 'n' random numbers that follow a continuous
or discrete probability distribution, using the inversion method.
Implements section 5 of Devroye and Gravel,
"Sampling with arbitrary precision", arXiv:1502.02539v5 [cs.IT], 2018.
- 'n' is the number of random numbers to generate.  Default is 1.
- 'icdf' is a procedure that takes three arguments: u, ubits, bitplaces,
   and returns a number within 2^-bitplaces of the true inverse
   CDF (inverse cumulative distribution function, or quantile function)
   of u/2^ubits.
- 'bitplaces' is an accuracy expressed as a number of bits after the
   binary point. The random number will be a multiple of 2^-bitplaces,
   or have a smaller granularity. Default is 53.
       """
        u = 0
        ubits = 0
        threshold = Fraction(1, 1 << bitplaces) * 2
        ret = [None for i in range(n)]
        k = 0
        while k < n:
            incr = precision if (ubits == 0) else 8
            u = (u << incr) | self.rndintexc(1 << incr)
            ubits += incr
            lower = icdf(u, ubits, precision)
            upper = icdf(u + 1, ubits, precision)
            # ICDF can never go down
            if lower > upper:
                raise ValueError
            diff = upper - lower
            if diff <= threshold:
                ret[k] = upper + (upper - lower) / 2
                k += 1
                u = 0
                ubits = 0
        return ret

    def numbers_from_dist(self, pdf, mn=0, mx=1, n=1, bitplaces=53):
        """
Generates 'n' random numbers that follow a continuous
distribution in an interval [mn, mx].  The distribution's
PDF (probability density function) must be bounded
(have a finite value) and be continuous almost everywhere
in the interval.  Implements section 4 of Devroye and Gravel,
"The expected bit complexity of the von Neumann rejection
algorithm", arXiv:1511.02273v2  [cs.IT], 2016/2018.
- 'n' is the number of random numbers to generate.  Default is 1.
- 'pdf' is a procedure that takes three arguments: xmin, xmax, bitplaces,
   and returns an array of two items: the greatest lower bound of f(x) anywhere
   in the interval [xmin, xmax] (where f(x) is the PDF), and the least upper
   bound of f(x) anywhere there.  Both bounds are multiples of 2^-bitplaces.
- 'bitplaces' is an accuracy expressed as a number of bits after the
   binary point. The random number will be a multiple of 2^-bitplaces,
   or have a smaller granularity. Default is 53.
- 'mn' and 'mx' express the interval.  Both are optional and
   are set to 0 and 1, respectively, by default.
      """
        if n < 0 or bitplaces < 0:
            raise ValueError
        r = [Fraction(mn), 0, Fraction(mx), 0]
        infsup = pdf(r[0], r[2], bitplaces)
        firstinfsup = infsup
        r[3] = infsup[1]
        firstrect = [Fraction(r[0]), Fraction(r[1]), Fraction(r[2]), Fraction(r[3])]
        ret = [None for i in range(n)]
        if r[1] > r[3]:
            raise ValueError("pdf() returned negative lower bound")
        k = 0
        hsh = {}
        while k < n:
            r = firstrect
            first = True
            decision = 0
            while decision == 0:
                if first:
                    infsup = firstinfsup
                else:
                    # NOTE: Fractions not stored directly in the
                    # tuple, since otherwise lookup time
                    # would take much longer
                    tup = (
                        r[0].numerator,
                        r[0].denominator,
                        r[2].numerator,
                        r[2].denominator,
                    )
                    if not (tup in hsh):
                        infsup = pdf(r[0], r[2], bitplaces)
                        hsh[tup] = [Fraction(infsup[0]), Fraction(infsup[1])]
                    else:
                        infsup = hsh[tup]
                first = False
                if r[3] <= infsup[0]:  # Below the infimum, accept
                    decision = 1
                elif r[1] > infsup[1]:  # Above the supremum, reject
                    decision = 2
                else:
                    rcx = (r[0] + r[2]) / 2
                    rcy = (r[1] + r[3]) / 2
                    rx = self.rndint(3)
                    rn = [r[0], r[1], r[2], r[3]]
                    if (rx >> 1) == 0:
                        rn[2] = rcx
                    else:
                        rn[0] = rcx
                    if (rx & 1) == 0:
                        rn[1] = rcy
                    else:
                        rn[3] = rcy
                    r = rn
            if decision == 1:
                ret[k] = self._bisectionuniform(r[0], r[2], bitplaces)
                ret[k] = float(ret[k])
                k += 1
        return ret

    def numbers_from_pdf(self, pdf, mn, mx, n=1, steps=100):
        """ Generates one or more random numbers from a continuous probability
         distribution expressed as a probability density
         function (PDF).  The random number
         will be in the interval [mn, mx].  `n` random numbers will be
         generated. `pdf` is the PDF; it takes one parameter and returns,
         for that parameter, a weight indicating the relative likelihood
          that a random number will be close to that parameter. `steps`
         is the number of subintervals between sample points of the PDF.
         The area under the curve of the PDF need not be 1.
         By default, `n` is 1 and `steps` is 100.  """
        values = [mn + (mx - mn) * i * 1.0 / steps for i in range(steps + 1)]
        weights = [pdf(v) for v in values]
        return self.piecewise_linear_n(values, weights, n)

    def numbers_from_cdf(self, cdf, mn, mx, n=1, steps=100):
        """ Generates one or more random numbers from a continuous probability
         distribution by numerically inverting its cumulative
         distribution function (CDF).  The random number
         will be in the interval [mn, mx].  `n` random numbers will be
         generated. `cdf` is the CDF; it takes one parameter and returns,
         for that parameter, the probability that a random number will
         be less than or equal to that parameter. `steps` is the number
         of subintervals between sample points of the CDF.
         By default, `n` is 1 and `steps` is 100.  """
        ntable = numericalTable(cdf, mn, mx, steps)
        return [self.from_interp(ntable) for i in range(n)]

    def from_interp(self, table):
        """ Generates a random number given a list of CDF--number
       pairs sorted by CDF.

       An example of this list is as follows.
       ` [[0.1, 0], [0.4, 1], [0.8, 2], [0.9, 3], [0.95, 4], [0.99, 5]]`

       In this example, the first item of each pair is the value of
       a cumulative distribution function (CDF) and is in the interval [0, 1],
       and the second item is the number associated with that CDF's
       value. The random number will fall within the range of numbers
       suggested in the table, which will be in the interval [0, 5] in the
       example above.

       The `numericalTable` method generates an appropriate table
       for this method's `table` parameter, given a CDF and a range
       of numbers.
       """
        while True:
            x = _tableInterpSearch(table, self.rndu01())
            if x != None:
                return x

    def randomwalk_u01(self, n):
        """ Random walk of uniform 0-1 random numbers. """
        ret = [0 for i in range(n + 1)]
        for i in range(n):
            ret[i] = self.rndu01()
        for i in range(n):
            ret[i + 1] = ret[i + 1] + ret[i]
        return ret

    def randomwalk_posneg1(self, n):
        """ Random walk of uniform positive and negative steps. """
        ret = [0 for i in range(n + 1)]
        for i in range(n):
            ret[i] = self.rndint(1) * 2 - 1
        for i in range(n):
            ret[i + 1] = ret[i + 1] + ret[i]
        return ret

    def wiener(self, st, en, step=1.0, mu=0.0, sigma=1.0):
        """ Generates random numbers following a Wiener
            process (Brownian motion). Each element of the return
            value contains a timestamp and a random number in that order. """
        if st == en:
            return [[st, self.normal(mu * st, sigma * math.sqrt(st))]]
        ret = []
        i = st
        lastv = 0
        lasttime = st
        while i < en:
            if i == st:
                lastv = self.normal(mu * st, sigma * math.sqrt(st))
            else:
                lastv = lastv + self.normal(mu * step, sigma * math.sqrt(step))
            lasttime = i
            ret.append([i, lastv])
            i += step
        lastv = lastv + self.normal(
            mu * (en - lasttime), sigma * math.sqrt(en - lasttime)
        )
        ret.append([i, lastv])
        return ret

    def _kthsmallest_internal(self, ret, index, n, k, compl=0):
        # Generate a sorted list of u-rands in the portion
        # of ret at the position range [index, n + index].
        # compl=0 -> kth smallest; compl=1 -> kth largest
        # Early exit if we go beyond the kth smallest index
        if index >= k:
            return
        # Each uniform (0, 1) random number is equally likely to
        # be less than half or greater than half; thus, the number
        # of uniform numbers that are less than half vs. greater
        # than half follows a binomial(n, 1/2) distribution.
        # The same applies to other digits in the number's
        # binary expansion, such as 1/4, 1/8, 1/16, etc.
        leftcount = self.binomial(n, 0.5)
        rightcount = n - leftcount
        clearbit = compl
        setbit = 1 - compl
        # Add clear bit to left-hand side
        for i in range(index, index + leftcount):
            ret[i][0] = (ret[i][0] << 1) | clearbit
            ret[i][1] += 1
        # Recurse for left-hand side
        if leftcount > 1:
            self._kthsmallest_internal(ret, index, leftcount, k, compl)
        # Add set bit to right-hand side
        if index + leftcount < k:
            for i in range(index + leftcount, index + n):
                ret[i][0] = (ret[i][0] << 1) | setbit
                ret[i][1] += 1
            # Recurse for right-hand side
            if rightcount > 1:
                self._kthsmallest_internal(ret, index + leftcount, rightcount, k, compl)

    def kthsmallest(self, n, k, b):
        """ Generates the 'k'th smallest 'b'-bit uniform random
            number out of 'n' of them. """
        if k <= 0 or k > n:
            raise ValueError
        ret = [[0, 0] for i in range(n)]
        if k < n / 2:
            # kth smallest
            self._kthsmallest_internal(ret, 0, n, k, 0)
            return self._urandfill(ret[k - 1], b)
        else:
            # (n-k+1)th largest
            self._kthsmallest_internal(ret, 0, n, n - k + 1, 1)
            return self._urandfill(ret[n - k], b)

class ConvexPolygonSampler:
    """ A class for uniform random sampling of
      points from a convex polygon.  This
      class only supports convex polygons because
      the random sampling process involves
      triangulating a polygon, which is trivial
      for convex polygons only. "randgen" is a RandomGen
      object, and "points" is a list of points
      (two-item lists) that make up the polygon.  """

    def __init__(self, randgen, points):
        if len(points) < 3:
            raise ValueError
        self.randgen = randgen
        self.points = [[p[0], p[1]] for p in points]
        # Triangulate polygon
        self.triangles = [
            [self.points[0], self.points[i], self.points[i + 1]]
            for i in range(1, len(self.points) - 1)
        ]
        # Calculate areas for each triangle
        self.areas = [self._area(t) for t in self.triangles]

    def _area(self, tri):
        return (
            abs(
                (tri[1][0] - tri[0][0]) * (tri[2][1] - tri[0][1])
                - (tri[2][0] - tri[0][0]) * (tri[1][1] - tri[0][1])
            )
            * 0.5
        )

    def sample(self):
        """ Choose a random point in the convex polygon
        uniformly at random. """
        index = self.randgen.weighted_choice(self.areas)
        tri = self.triangles[index]
        return self.randgen.simplex_point(tri)

class _KVectorRootSolver:
    def _derivcdf(self, cdf, x):
        eps = 0.0001
        return (cdf(x + eps) - cdf(x - eps)) / (2 * eps)

    def _linspace(self, a, b, size):
        return [a + (b - a) * (x * 1.0 / size) for x in range(size + 1)]

    def _findroot(self, f, df, y, x, x2):
        if df != None:
            # Use Newton method if df is given
            for i in range(5):
                fv = f(x) - y
                dfv = df(x)
                if dfv == 0:
                    return x
                fv /= dfv
                if abs(fv) < 2.22e-16:
                    return x
                x -= fv
            return x
        else:
            # Use regula falsi (secant) method if df is not given
            nx = x
            if x == x2:
                return x
            for i in range(10):
                fa = f(x)
                fb = f(x2)
                if fb == fa:
                    return nx
                nx = x + (x2 - x) * (y - fa) / (fb - fa)
                fnx = f(nx)
                if fnx <= y:
                    x = nx
                else:
                    x2 = nx
                if abs(x2 - x) < 2.22e-16:
                    return nx
            return nx

    def __init__(self, cdf, xmin, xmax, pdf=None):
        self.pdf = pdf
        self.cdf = cdf
        self.numElements = 1
        if self.pdf == None:
            self.numElements = 2
            # self.pdf = lambda x: self._derivcdf(self.cdf, x)
        eps = 2.22e-16
        x = self._linspace(xmin, xmax, 2000)
        n = len(x)
        xy = [[cdf(v), v] for v in x]
        ys = [v[0] for v in xy]
        deltas = [abs(ys[i + 1] - ys[i]) for i in range(n - 1)]
        self.delta = max(deltas) * 4 * eps
        xy.sort()
        xs = [v[1] for v in xy]  # x's corresponding to sorted y's
        ys.sort()  # sorted y's
        self.delta_x = (xmax - xmin) * 1.0 / (n - 1)
        ymax = ys[n - 1]
        ymin = ys[0]
        xi = eps * max(abs(ymin), abs(ymax))
        self.m = ((ymax - ymin) + 2.0 * xi) / (n - 1)
        self.q = ymin - self.m - xi
        self.xs = xs
        self.ys = ys
        self.k = [0 for i in range(n + 1)]  # One-based
        self.k[1] = 0
        self.k[n] = n
        for i in range(1, n + 1):
            self.k[i] = n
            for j in range(1, n + 1):
                if self.ys[j - 1] > self.m * i + self.q:
                    self.k[i] = j - 1
                    break

    def solve(self, ylist):
        return [self._solveone(v) for v in ylist]

    def _solveone(self, yr):
        halfdelta = self.delta * 0.5
        ya = yr - halfdelta * self.numElements
        yb = yr + halfdelta * self.numElements
        n = len(self.ys)
        ja = int(math.floor((ya - self.q) / self.m))
        jb = int(math.ceil((yb - self.q) / self.m))
        ja = max(1, min(n, ja))
        jb = max(1, min(n, jb))
        ja = self.k[ja] + 1  # One-based
        jb = self.k[jb]  # One-based
        ka = min(ja, jb)
        kb = max(ja, jb)
        xy = [[self.xs[i - 1], self.ys[i - 1]] for i in range(ka, kb + 1)]
        if len(xy) == 1:
            return self._findroot(self.cdf, self.pdf, yr, xy[0][0], xy[0][0])
        elif len(xy) == 2 and self.numElements == 2:
            return self._findroot(self.cdf, self.pdf, yr, xy[0][0], xy[1][0])
        xy.sort()
        roots = []
        delta_x_and_half = self.delta_x * 1.5
        for i in range(len(xy) - 1):
            xdiff = xy[i + 1][0] - xy[i][0]
            if xdiff >= delta_x_and_half:
                # New potential root found
                roots.append(self._findroot(self.cdf, self.pdf, yr, xy[i][0], xy[i][0]))
            if xdiff < delta_x_and_half and i == 0:
                # New potential root found
                roots.append(
                    self._findroot(self.cdf, self.pdf, yr, xy[i][0], xy[i + 1][0])
                )
        return roots[0]  # Return the first root found

class KVectorSampler:
    """ A K-Vector-like sampler of a continuous distribution
      with a known cumulative distribution function (CDF).
      Uses algorithms
      described in Arnas, D., Leake, C., Mortari, D., "Random
      Sampling using k-vector", Computing in Science &
      Engineering 21(1) pp. 94-107, 2019, and Mortari, D.,
      Neta, B., "k-Vector Range Searching Techniques".  """

    def _linspace(self, a, b, size):
        return [a + (b - a) * (x * 1.0 / size) for x in range(size + 1)]

    def __init__(self, rg, cdf, xmin, xmax, pdf=None, nd=200):
        """ Initializes the K-Vector-like sampler.
         Parameters:
         - randgen: A random generator (RandGen) object.
         - cdf: Cumulative distribution function (CDF) of the
            distribution.  The CDF must be
            monotonically nondecreasing everywhere in the
            interval [xmin, xmax] and must output values in [0, 1];
            for best results, the CDF should
            be increasing everywhere in [xmin, xmax].
         - xmin: Maximum x-value to generate.
         - xmax: Maximum y-value to generate.  For best results,
            the range given by xmin and xmax should cover all or
            almost all of the distribution.
         - pdf: Optional. Distribution's probability density
            function (PDF), to improve accuracy in the root-finding
            process.
         - nd: Optional. Size of tables used in the sampler.
            Default is 200.
         """
        eps = 2.22e-16
        ymin = cdf(xmin)
        ymax = cdf(xmax)
        xi = max(abs(ymin), abs(ymax)) * eps
        self.ys = self._linspace(ymin, ymax, nd - 1)
        # NOTE: Using the K-vector function inversion approach
        # in Arnas et al., but any other root-finding method
        # will work well here, especially since we're only doing
        # root-finding in the setup phase, not the sampling phase.
        # This is perhaps the only non-trivial part of the algorithm.
        roots = _KVectorRootSolver(cdf, xmin, xmax, pdf).solve(self.ys)
        roots = [[self.ys[i], roots[i]] for i in range(len(roots))]
        # Clamp roots for robustness, then
        # recalculate CDFs for the roots,
        # in case some parts of the
        # CDF have zero derivative
        for i in range(len(roots)):
            r = min(xmax, max(xmin, roots[i][1]))
            roots[i][1] = r
            roots[i][0] = cdf(r)
        roots.sort()
        self.xs = [v[1] for v in roots]
        self.ys = [v[0] for v in roots]
        self.ymin = self.ys[0]
        self.ymax = self.ys[len(self.ys) - 1]
        self.ys = [cdf(x) for x in self.xs]
        self.m = (nd - 1) * 1.0 / (self.ymax - self.ymin + 2 * xi)
        self.q = 1 - self.m * (self.ymin - xi)
        self.rg = rg

    def _sampleone(self):
        while True:
            a = self.rg.rndrange(self.ymin, self.ymax)
            # Do a "search" for 'a'
            b = int(math.floor(self.m * a + self.q))
            x0 = self.xs[b - 1]
            x1 = self.xs[b]
            y0 = self.ys[b - 1]
            y1 = self.ys[b]
            # print([a,x0, x1, y0, y1])
            # Reject "empty" regions
            if y1 == y0 or x1 == x0:
                continue
            return x0 + (a - y0) * (x1 - x0) / (y1 - y0)

    def _invertone(self, a):
        a = self.ymin + (self.ymax - self.ymin) * a
        # Do a "search" for 'a'
        b = int(math.floor(self.m * a + self.q))
        x0 = self.xs[b - 1]
        x1 = self.xs[b]
        y0 = self.ys[b - 1]
        y1 = self.ys[b]
        # print([a,x0, x1, y0, y1])
        # Handle "empty" regions
        if y1 == y0 or x1 == x0:
            return self.xs[0]
        return x0 + (a - y0) * (x1 - x0) / (y1 - y0)

    def invert(self, uniforms):
        """ Returns a list of 'n' numbers that correspond
            to the given uniform random numbers and follow
            the distribution represented by this sampler.  'uniforms'
            is a list of uniform random values in the interval
            [0, 1].  For best results, this sampler's range
            (xmin and xmax in the constructor)
            should cover all or almost all of the desired distribution and
            the distribution's CDF should be monotonically
            increasing everywhere (every number in the distribution's
            range has nonzero probability of occurring), since
            among other things,
            this method maps each uniform value to the
            range of CDFs covered by this distribution (that is,
            [0, 1] is mapped to [minCDF, maxCDF]), and
            uniform values in "empty" regions (regions with
            constant CDF) are handled by replacing those
            values with the minimum CDF value covered. """
        return [self._invertone(u) for u in uniforms]

    def sample(self, n):
        """ Returns a list of 'n' random numbers of
         the distribution represented by this sampler. """
        return [self._sampleone() for i in range(n)]

class AlmostRandom:
    def __init__(self, randgen, list):
        if len(list) == 0:
            raise ValueError
        self.randgen = randgen
        self.list = self.randgen.shuffle([x for x in list])
        self.index = 0

    def choose(self):
        if self.index >= len(self.list):
            self.index = 0
            self.list = self.randgen.shuffle(self.list)
        item = self.list[self.index]
        self.index += 1
        return item

# Examples of use
if __name__ == "__main__":
    # Initialize random generator
    randgen = RandomGen()
    import time

    def linspace(a, b, size):
        return [a + (b - a) * (x * 1.0 / size) for x in range(size + 1)]

    def normalcdf(x, mu=0, sigma=1):
        cdf = (1 + math.erf((x - mu) / (math.sqrt(2) * sigma))) / 2.0
        return cdf

    def normalpdf(x, mu=0, sigma=1):
        x -= mu
        return math.exp(-(x * x) / (2 * sigma * sigma)) / (
            math.sqrt(2 * math.pi) * sigma
        )

    def normaloracle(mn, mx, bitplaces):
        points = []
        if mn < 0 and mx > 0:
            points.append(Fraction(1))
        points.append(Fraction(math.exp(-(mn * mn) / 2)))
        points.append(Fraction(math.exp(-(mx * mx) / 2)))
        eps = Fraction(1, 1 << (bitplaces + 1))
        pmn = max(min(points), 0)
        pmx = max(points)
        return [pmn, pmx]

    def showbuckets(ls, buckets):
        mx = max(0.00000001, max(buckets))
        if mx == 0:
            return
        labels = [
            ("%0.3f %d" % (ls[i], buckets[i]))
            if int(buckets[i]) == buckets[i]
            else ("%0.3f %f" % (ls[i], buckets[i]))
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

    def bucket(v, ls, buckets):
        for i in range(len(buckets) - 1):
            if v >= ls[i] and v < ls[i + 1]:
                buckets[i] += 1
                break

    def showfunc(f, mn, mx):
        ls = linspace(mn, mx, 30)
        showbuckets(ls, [f(x) for x in ls])

    # Generate normal random numbers
    def uu():
        print("Generating normal random numbers with numbers_from_dist")
        ls = linspace(-3.3, 3.3, 30)
        buckets = [0 for x in ls]
        t = time.time()
        ksample = randgen.numbers_from_dist(normaloracle, -4, 4, 3000)
        print("Took %f seconds" % (time.time() - t))
        for ks in ksample:
            bucket(ks, ls, buckets)
        showbuckets(ls, buckets)

    weights = [2, 45, 3, 1, 44, 23, 9, 22, 33, 11, 88]
    t = time.time()
    ksample = randgen.multinomial(1000, weights)
    print(ksample)
    print("multinomial: Took %f seconds" % (time.time() - t))

    uu()
    print("Generating normal random numbers with numbers_from_pdf")
    ls = linspace(-3.3, 3.3, 30)
    buckets = [0 for x in ls]
    t = time.time()
    ksample = randgen.numbers_from_pdf(normalpdf, -4, 4, 5000, steps=40)
    print("Took %f seconds" % (time.time() - t))
    for ks in ksample:
        bucket(ks, ls, buckets)
    showbuckets(ls, buckets)

    print("Generating normal random numbers with KVectorSampler")
    kvs = KVectorSampler(randgen, normalcdf, -4, 4, nd=1000)  # , pdf=normalpdf)
    t = time.time()
    ksample = kvs.sample(1000)
    print("Took %f seconds" % (time.time() - t))
    ls = linspace(-3.3, 3.3, 30)
    buckets = [0 for x in ls]
    for ks in ksample:
        bucket(ks, ls, buckets)
    showbuckets(ls, buckets)

    print("Generating binomial random numbers")
    t = time.time()
    ksample = [randgen.binomial(100, 0.7) for i in range(10000)]
    print(time.time() - t)
    ls = linspace(0, 100, 100)
    buckets = [0 for x in ls]
    for ks in ksample:
        bucket(ks, ls, buckets)
    showbuckets(ls, buckets)

    print(randgen.intsInRangesWithSum(10, [[1, 4], [3, 5], [2, 6]], 12))
    print(randgen.intsInRangeWithSum(10, 3, 1, 6, 12))
    print(randgen.intsInRangeSortedWithSum(10, 3, 1, 6, 12))

    # Generate multiple dice rolls
    dierolls = [randgen.diceRoll(2, 6) for i in range(10)]
    # Results
    print("Results: %s" % (dierolls))
    # Highest die roll
    print("Highest: %d" % (max(dierolls)))
    # Lowest die roll
    print("Lowest: %d" % (min(dierolls)))
    # Sum, dropping the lowest
    print("Sum: %d" % (sum(dierolls)))
    # Sum, dropping the lowest
    print("Drop-the-lowest: %d" % (sum(dierolls) - min(dierolls)))
    #
    #  Weighted choice
    #
    ranges = [[0, 5], [5, 10], [10, 11], [11, 13]]
    weights = [3, 15, 1, 2]

    def rc():
        index = randgen.weighted_choice(weights)
        item = ranges[index]  # Choose a random range
        return randgen.rndintexcrange(item[0], item[1])

    print("Weighted choice results")
    print([rc() for i in range(25)])
    print(randgen.weighted_choice_n(weights, 150))
    #
    #  Model times to failure
    #
    rate = 1.0 / 1000  # Failure rate
    print("Times to failure (rate: %f)" % (rate))
    print([randgen.exponential(rate) for i in range(25)])
    print("Times to failure (rate: %f; rationals)" % (rate))
    print([randgen.expoRatio(3000, 1, 1000) for i in range(25)])
    #  Multinormal
    print("Multinormal sample")
    for i in range(10):
        print(randgen.multinormal(None, [[1, 0], [0, 1]]))
    #  Multinormal
    print("Geometric sample")
    print([randgen.negativebinomialint(1, 1, 20) for i in range(25)])
    print([randgen.negativebinomialint(1, 18, 20) for i in range(25)])
    # Random walks
    print("Random walks")
    print(randgen.randomwalk_u01(50))
    print(randgen.randomwalk_posneg1(50))
    # White noise
    print("White noise")
    print([randgen.normal() for i in range(20)])
    # White noise
    print("Binomial values")
    print([randgen.binomial(98, 0.8) for i in range(20)])
    # Demonstrate numerical CDF inversion
    print("Gaussian values by CDF inversion")
    normal_cdf = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
    print(randgen.numbers_from_cdf(normal_cdf, -6, 6, n=30))
    # Geoellipsoid points
    print("Geoellipsoid points")
    print([randgen.geoellipsoid_point() for i in range(20)])
    # Convex polygon sampler
    poly = [[0, 0], [0, 20], [20, 20], [20, 0]]
    cps = ConvexPolygonSampler(randgen, poly)
    print("Sampling a rectangle")
    for i in range(10):
        print(cps.sample())
    # Estimating raw moments of a normal distribution
    n = [randgen.normal() for i in range(10000)]
    print("Estimating expectation values of a normal distribution")
    print("Mean ~= %f" % (_mean([x for x in n])))
    print("2nd raw moment ~= %f" % (_mean([x ** 2 for x in n])))
    print("3rd raw moment ~= %f" % (_mean([x ** 3 for x in n])))
    print("4th raw moment ~= %f" % (_mean([x ** 4 for x in n])))
    print("5th raw moment ~= %f" % (_mean([x ** 5 for x in n])))
    print("Mean of sines (E<sin(x)>) ~= %f" % (_mean([math.sin(x) for x in n])))

    # Estimates expectation given
    # an array of samples
    def expect(a, f):
        return _mean([f(x) for x in a])

    def trim(x, f):
        ret = []
        for i in x:
            if f(i):
                ret.append(i)
        return ret

    # Two ways to get the estimated
    # conditional expectation given
    # an array of samples and a predicate
    def condexpect1(a, f, pred):
        e1 = expect(nums, lambda x: (f(x) if pred(x) else 0))
        # e2 is probability given predicate
        e2 = expect(nums, lambda x: (1 if pred(x) else 0))
        return e1 / e2

    def condexpect2(a, f, pred):
        # Expectation of only the samples
        # that meet the predicate
        return expect(trim(a, pred), f)

    # Conditional expectation estimation
    nums = [abs(randgen.normal(0, 1)) for _ in range(10000)]
    epred = lambda x: x < 2
    efunc = lambda x: x * x
    print(expect(nums, efunc))
    print(condexpect1(nums, efunc, epred))
    print(condexpect2(nums, efunc, epred))
