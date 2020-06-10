#
#  Implements the Moore Rejection Sampler.
#
#  Written by Peter O. Any copyright to this file is released to the Public Domain.
#  In case this is not possible, this file is also licensed under Creative Commons Zero
#  (https://creativecommons.org/publicdomain/zero/1.0/).
#
import decimal
import heapq
import random
from randomgen import RandomGen, FastLoadedDiceRoller
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
    It can sample from one-dimensional or multidimensional distributions.

    - pdf: A function that specifies the PDF.  It takes a single parameter that
        differs as follows, depending on the case:
        - One-dimensional case: A single floating-point number or an Interval.
        - Multidimensional case: A list of numbers and/or Intervals, one for each
           dimension.
        This function returns an Interval. (An Interval is a mathematical object that
        specifies upper and lower bounds of a number.) For best results,
        the function should use interval arithmetic throughout.
    - mn, mx: Specifies the sampling domain of the PDF.  There are two cases:
       - One-dimensional case: Both mn and mx are numbers giving the domain,
          which in this case is [mn, mx].
       - Multidimensional case: Both mn and mx are lists giving the minimum
          and maximum bounds for each dimension in the sampling domain.
          In this case, both lists must have the same size.

    Reference:
    Sainudiin, Raazesh, and Thomas L. York. "An Auto-Validating, Trans-Dimensional,
    Universal Rejection Sampler for Locally Lipschitz Arithmetical Expressions."
    Reliable Computing 18 (2013): 15-54.

    The following reference describes an optimization, not yet implemented here:
    Sainudiin, R., 2014. An Auto-validating Rejection Sampler for Differentiable
    Arithmetical Expressions: Posterior Sampling of Phylogenetic Quartets. In
    Constraint Programming and Decision Making (pp. 143-152). Springer, Cham.
    """

    def __init__(self, pdf, mn, mx):
        if not isinstance(mn, list):
            mn = [mn]
        if not isinstance(mx, list):
            mx = [mx]
        if len(mn) != len(mx):
            raise ValueError("mn and mx have different lengths")
        # Check whether minimums and maximums are proper
        for i in range(len(mn)):
            if mn[i] >= mx[i]:
                raise ValueError("A minimum is not less than a maximum")
        self.pdf = pdf
        self.queue = []
        box = [Interval(mn[i], mx[i]) for i in range(len(mn))]
        boxkey, boxrange, boxweight = self._boxInfo(box)
        self.boxes = []
        self.weights = []
        heapq.heappush(self.queue, (boxkey, len(self.boxes)))
        self.boxes.append((box, boxrange, self._boxToISD(box)))
        self.weights.append(boxweight)
        self._regenTable()
        self.rg = RandomGen()

    def _regenTable(self):
        # Convert to integer weights
        wsum = sum(self.weights)
        intweights = [int(x * wsum.denominator) for x in self.weights]
        # Regenerate alias table
        self.alias = FastLoadedDiceRoller(intweights)

    def _boxToISD(self, box):  # ISD = inf, sup, denominator
        return [self._intvToISD(intv) for intv in box]

    def _intvToISD(self, intv):
        rangeInf = Fraction(intv.inf)
        rangeSup = Fraction(intv.sup)
        denom = max(10000000, (rangeSup + rangeInf).denominator)
        rangeSup = int(rangeSup * denom)
        rangeInf = int(rangeInf * denom)
        return [rangeInf, rangeSup, denom]

    def _bisect(self):
        # Pop the item with the smallest key
        _, boxindex = heapq.heappop(self.queue)
        box, boxrange, _ = self.boxes[boxindex]
        # Find dimension with the greatest width
        dim = 0
        dimbest = 0
        if len(box) >= 2:
            for i in range(0, len(box)):
                if box[i].width() > dimbest:
                    dimbest = box[i].width()
                    dim = i
        # Split chosen dimension in two
        leftbox = [x for x in box]
        rightbox = [x for x in box]
        fsup = Fraction(box[dim].sup)
        finf = Fraction(box[dim].inf)
        mid = finf + (fsup - finf) / 2
        # Left box
        leftbox[dim] = Interval(box[dim].inf, mid)
        newBoxIndex = boxindex  # Replace chosen box with left box
        if leftbox[dim].inf != leftbox[dim].sup:
            boxkey, boxrange, boxweight = self._boxInfo(leftbox)
            heapq.heappush(self.queue, (boxkey, newBoxIndex))
            self.boxes[newBoxIndex] = (leftbox, boxrange, self._boxToISD(leftbox))
            self.weights[newBoxIndex] = boxweight
            newBoxIndex = len(self.boxes)  # Add right box
        # Right box
        rightbox[dim] = Interval(mid, box[dim].sup)
        if rightbox[dim].inf != rightbox[dim].sup:
            boxkey, boxrange, boxweight = self._boxInfo(rightbox)
            heapq.heappush(self.queue, (boxkey, newBoxIndex))
            self.boxes.append((rightbox, boxrange, self._boxToISD(rightbox)))
            self.weights.append(boxweight)

    def _widthAsFrac(self, intv):
        return Fraction(intv.sup) - Fraction(intv.inf)

    def _boxInfo(self, box):
        # Calculates the sort key (for the priority queue), the
        # range, and the weight (for the alias table)
        volume = None
        funcrange = None
        if len(box) == 1:
            volume = self._widthAsFrac(box[0])
            funcrange = self.pdf(box[0])
        else:
            volume = self._widthAsFrac(box[0])
            for i in range(1, len(box)):
                volume *= self._widthAsFrac(box[i])
            funcrange = self.pdf(box)
        if not isinstance(funcrange, Interval):
            raise ValueError("pdf must output an Interval")
        # NOTE: Priority key can be a coarse-precision
        # floating-point number, since the exact value of
        # the key is not crucial for the sampler's correctness
        priorityKey = float(-volume * float(funcrange.width()))
        # NOTE: On the other hand, the weight's exact value
        # is crucial for correctness, since this affects the
        # probability of the sampler choosing each box
        # in the density's approximation.  Therefore, use
        # Fraction, which can store rational numbers (including
        # decimal fractions) exactly, without issues with
        # default precision found in Decimal
        aliasWeight = volume * Fraction(funcrange.sup)
        # Convert box range elements to integers
        rangeSup = Fraction(funcrange.sup)
        rangeInf = Fraction(funcrange.inf)
        denom = max(1 << 32, (rangeSup + rangeInf).denominator)
        rangeSup = int(rangeSup * denom)
        rangeInf = int(rangeInf * denom)
        # Return box info
        return (priorityKey, [rangeInf, rangeSup, denom], aliasWeight)

    def _rndrange(self, isd):
        frac = Fraction(isd[0] + random.randint(0, isd[1] - isd[0] + 1), isd[2])
        return frac

    def _cvtsample(self, kx):
        if isinstance(kx, list):
            return [float(v) for v in kx]
        else:
            return float(kx)

    def _intvsample(self, kx):
        if isinstance(kx, list):
            return [Interval(v) for v in kx]
        else:
            return Interval(kx)

    def _rndbox(self, box):
        ret = [self._rndrange(isd) for isd in box]
        return ret[0] if len(ret) == 1 else ret

    def sample(self):
        """
       Samples a number or vector (depending on the number of dimensions)
       from the distribution and returns that sample.
       """
        trials = 50
        while True:
            s = self._sample(trials)
            if (s[0] == None or s[1] >= 5) and len(self.boxes) < 100000:
                for i in range(10):
                    self._bisect()
                self._regenTable()
                # print(len(self.boxes))
            if s[0] != None:
                return s[0]

    def _sample(self, trials=50):
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
            _, boxrange, boxisd = self.boxes[area]
            kx = self._rndbox(boxisd)
            # Kĝ(kx), a scalar, where kx may be a scalar or vector
            udenom = boxrange[2]
            u = random.randint(0, boxrange[1] - 1)
            # Quick accept
            if u <= boxrange[0]:
                return [self._cvtsample(kx), i - 1]
            while True:
                ufrac = Fraction(u, udenom)
                # Evaluate PDF, which returns an interval.
                pdfvalue = self.pdf(self._intvsample(kx))
                if ufrac <= pdfvalue.inf:
                    # Accepted
                    return [self._cvtsample(kx), i + 1]
                elif ufrac >= pdfvalue.sup:
                    # Rejected
                    break
                else:
                    # Don't know whether to accept or reject, so increase
                    # granularity of ufrac
                    print([pdfvalue.inf, Decimal(ufrac), pdfvalue.sup, ufrac])
                    udenom <<= 8
                    u = (u << 8) | random.randint(0, 255)
                    ufrac = Fraction(u, denom)
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
        mean = Interval(0.1)
        sd = Interval(1)
        return (-((x - mean) ** 2) / (2 * sd ** 2)).exp()

    def normalpdf2(x):
        return normalpdf(x[0])

    import time
    import math
    import cProfile

    mrs = MooreSampler(normalpdf, -4, 4)
    ls = linspace(-4, 4, 30)
    buckets = [0 for x in ls]
    t = time.time()
    ksample = [mrs.sample() for i in range(20000)]
    print("Took %f seconds" % (time.time() - t))
    for ks in ksample:
        bucket(ks, ls, buckets)
    showbuckets(ls, buckets)
