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
    Moore rejection sampler, for generating independent samples
    from continuous distributions in a way that minimizes error,
    if the distribution's PDF (probability density function)
    uses "well-defined" arithmetic expressions.
    It can sample from one-dimensional or multidimensional
    distributions.  It can also sample from so-called "transdimensional
    distributions" if the distribution is the union of several component
    distributions that may have different dimensions and are associated
    with one of several _labels_.

    Parameters:

    - pdf: A function that specifies the PDF.  It takes a single parameter that
        differs as follows, depending on the case:
        - One-dimensional case: A single Interval. (An Interval is a mathematical
          object that specifies upper and lower bounds of a number.)
        - Multidimensional case: A list of Intervals, one for each dimension.
        - Transdimensional case (numLabels > 1): A list of two items: the Interval
           or Intervals, followed by a label number (an integer in [0, numLabels)).
        This function returns an Interval.  For best results,
        the function should use interval arithmetic throughout.  The area under
        the PDF need not equal 1 (this sampler works even if the PDF is only known
        up to a normalizing constant).
    - mn, mx: Specifies the sampling domain of the PDF.  There are three cases:
       - One-dimensional case: Both mn and mx are numbers giving the domain,
          which in this case is [mn, mx].
       - Multidimensional case: Both mn and mx are lists giving the minimum
          and maximum bounds for each dimension in the sampling domain.
          In this case, both lists must have the same size.
       - Transdimensional case: Currently, this class assumes the component
          distributions share the same sampling domain, which
          is given depending on the preceding two cases.
       For this sampler to work, the PDF must be "locally Lipschitz" in the
       sampling domain, meaning that the function is continuous everywhere
       in the domain, and has no slope that tends to a vertical slope anywhere in
       that domain.
    - numlabels: The number of labels associated with the distribution, if it's a
       transdimensional distribution.  Optional; the default is 1.
    - bitAccuracy: Bit accuracy of the sampler; the sampler will sample from
       a distribution (truncated to the sampling domain) that is close to the
       ideal distribution by 2^-bitAccuracy.  The default is 53.

    Reference:
    Sainudiin, Raazesh, and Thomas L. York. "An Auto-Validating, Trans-Dimensional,
    Universal Rejection Sampler for Locally Lipschitz Arithmetical Expressions."
    Reliable Computing 18 (2013): 15-54.

    The following reference describes an optimization, not yet implemented here:
    Sainudiin, R., 2014. An Auto-validating Rejection Sampler for Differentiable
    Arithmetical Expressions: Posterior Sampling of Phylogenetic Quartets. In
    Constraint Programming and Decision Making (pp. 143-152). Springer, Cham.
    """

    def __init__(self, pdf, mn, mx, numLabels=1, bitAccuracy=53):
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
        self.bitAccuracy = bitAccuracy
        self.queue = []
        self.boxes = []
        self.weights = []
        self.transdim = numLabels > 1
        for label in range(numLabels):
            box = [Interval(mn[i], mx[i]) for i in range(len(mn))]
            boxkey, boxrange, boxweight = self._boxInfo(box, label)
            heapq.heappush(self.queue, (boxkey, len(self.boxes)))
            self.boxes.append((box, boxrange, self._boxToISD(box), label))
            self.weights.append(boxweight)
        self._regenTable()
        self.rg = RandomGen()
        self.accepts = 0
        self.totaltrials = 0

    def acceptRate(self):
        return Decimal(self.accepts) / Decimal(self.totaltrials)

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
        # NOTE: We are dealing here with the range of the box from which
        # a vector is chosen uniformly at random during the
        # sampling process.  A random number x/denom is chosen, where
        # x is a random integer in [rangeInf, rangeSup).
        # NOTE FOR IMPROVEMENT: Minimum denominator is 2^bitAccuracy
        # power of 10, so that all vectors with a coarsest resolution
        # of, say, 2^-bitAccuracy have a chance to be chosen.
        denom = max(1 << self.bitAccuracy, (rangeSup + rangeInf).denominator)
        rangeSup = int(rangeSup * denom)
        rangeInf = int(rangeInf * denom)
        return [rangeInf, rangeSup, denom]

    def _bisect(self):
        # Pop the item with the smallest key
        _, boxindex = heapq.heappop(self.queue)
        box, boxrange, _, label = self.boxes[boxindex]
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
            boxkey, boxrange, boxweight = self._boxInfo(leftbox, label)
            heapq.heappush(self.queue, (boxkey, newBoxIndex))
            self.boxes[newBoxIndex] = (
                leftbox,
                boxrange,
                self._boxToISD(leftbox),
                label,
            )
            self.weights[newBoxIndex] = boxweight
            newBoxIndex = len(self.boxes)  # Add right box
        else:
            # Weight is 0, since the old box was removed
            self.weights[newBoxIndex] = 0
        # Right box
        rightbox[dim] = Interval(mid, box[dim].sup)
        if rightbox[dim].inf != rightbox[dim].sup:
            boxkey, boxrange, boxweight = self._boxInfo(rightbox, label)
            heapq.heappush(self.queue, (boxkey, newBoxIndex))
            box = (rightbox, boxrange, self._boxToISD(rightbox), label)
            self.boxes.append(box)
            self.weights.append(boxweight)

    def _widthAsFrac(self, intv):
        return Fraction(intv.sup) - Fraction(intv.inf)

    def _boxInfo(self, box, label):
        # Calculates the sort key (for the priority queue), the
        # range, and the weight (for the alias table)
        volume = None
        funcrange = None
        if len(box) == 1:
            volume = self._widthAsFrac(box[0])
            b = box[0]
            funcrange = self.pdf([b, label]) if self.transdim else self.pdf(b)
        else:
            volume = self._widthAsFrac(box[0])
            for i in range(1, len(box)):
                volume *= self._widthAsFrac(box[i])
            funcrange = self.pdf([box, label]) if self.transdim else self.pdf(box)
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
        # NOTE: We are dealing here with a random point between 0
        # and the top of the PDF's range anywhere in the box.  A
        # proposed vector is accepted if the point is less than
        # the bottom of the PDF's range, and a "slower"
        # process is done otherwise, which requires evaluating
        # the PDF.  The random point x/denom is chosen, where
        # x is a random integer in [0, rangeSup).
        # NOTE FOR IMPROVEMENT: Minimum denominator is
        # 2^bitAccuracy.
        rangeSup = Fraction(funcrange.sup)
        rangeInf = Fraction(funcrange.inf)
        denom = max(1 << self.bitAccuracy, (rangeSup + rangeInf).denominator)
        rangeSup = int(rangeSup * denom)
        rangeInf = int(rangeInf * denom)
        # Return box info: priority key, function range, weight
        boxinfo = (priorityKey, [rangeInf, rangeSup, denom], aliasWeight)
        return boxinfo

    def _rndrange(self, isd):
        if isd[0] == isd[1]:
            return isd[0]
        frac = Fraction(isd[0] + random.randint(0, isd[1] - isd[0] - 1), isd[2])
        return frac

    def _cvtsample(self, kx, label):
        if isinstance(kx, list):
            smp = [float(v) for v in kx]
            return [smp, label] if self.transdim else smp
        else:
            smp = float(kx)
            return [smp, label] if self.transdim else smp

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
       If the sampler is transdimensional (the number of labels is greater than 1),
       instead returns a list containing the sample and a random label in the
       interval [0, numLabels), in that order.
       """
        trials = 50
        while True:
            s = self._sample(trials)
            self.accepts += 1
            self.totaltrials += s[1]
            if (s[0] == None or s[1] >= 5) and len(self.boxes) < 100000:
                # print(["accept",self.acceptRate()])
                for i in range(10):
                    self._bisect()
                self._regenTable()
            if s[0] != None:
                return s[0]

    def _fastrandint(self, x, y):
        """
        Returns a random integer in [0, y), but
        returns -1 instead if that number would be less than x.
        Designed to reduce the number of random bits consumed
        when x is close to y.
        """
        if self.rg.zero_or_one(x, y) == 1:
            return -1
        return x + random.randint(0, (y - x) - 1)

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
            _, boxrange, boxisd, label = self.boxes[area]
            kx = self._rndbox(boxisd)
            # Kĝ(kx), a scalar, where kx may be a scalar or vector
            udenom = boxrange[2]
            if boxrange[1] == boxrange[0]:
                continue
            u = self._fastrandint(boxrange[0], boxrange[1])
            # Quick accept
            if u < 0:
                return [self._cvtsample(kx, label), i + 1]
            while True:
                ufrac = Fraction(u, udenom)
                # Evaluate PDF, which returns an interval.
                intv = self._intvsample(kx)
                pdfvalue = self.pdf([intv, label]) if self.transdim else self.pdf(intv)
                if ufrac < pdfvalue.inf:
                    # Accepted
                    return [self._cvtsample(kx, label), i + 1]
                elif ufrac >= pdfvalue.sup:
                    # Rejected
                    break
                else:
                    # Don't know whether to accept or reject
                    if (pdfvalue.sup - pdfvalue.inf) < Fraction(
                        1, 1 << self.bitAccuracy
                    ):
                        # Difference is within accuracy tolerance; safe to reject
                        break
                    else:
                        raise ValueError(
                            "Sampling failed; PDF may be too inaccurate "
                            + "(less than 2^-%d accuracy)" % (self.bitAccuracy)
                        )
                    break
        return [None, trials]

if __name__ == "__main__":

    def bucket(v, ls, buckets):
        for i in range(len(buckets) - 1):
            if v >= ls[i] and v < ls[i + 1]:
                buckets[i] += 1
                break

    def linspace(a, b, size):
        if (a - b) % size == 0:
            # for robustness when all points are integers
            return [a + ((b - a) * x) // size for x in range(size + 1)]
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

    def normalpdf(x, mean=0, sd=1):
        mean = Interval(mean)
        sd = Interval(sd)
        return (-((x - mean) ** 2) / (2 * sd ** 2)).exp()

    def gammapdf(x, al=2, sc=2):
        return (x ** (al - 1)) * (-x / sc).exp()

    def normalpdfv(x, mean=0, vari=1):
        mean = Interval(mean)
        vari = Interval(vari)
        return (-((x - mean) ** 2) / (2 * vari)).exp()

    def betapdf(x):
        if x.sup < 0 or x.inf >= 1:
            return Interval(0)
        x = x.clamp(0, 1)
        alpha = Interval(9.7)
        beta = Interval(3)
        return (1 - x) ** (alpha) * x ** (beta)

    def geninvgaussian(x, lamda, chi, psi):
        if x.sup <= 0:
            return Interval(0)
        ret = x ** (lamda - 1) * (-(chi / x + psi * x) / 2).exp()
        return ret

    import time
    import math
    import cProfile

    mrs = MooreSampler(lambda x: geninvgaussian(x, 2, 1, 3), 0.001, 15)
    ls = linspace(0.001, 15, 30)
    buckets = [0 for x in ls]
    t = time.time()
    ksample = [mrs.sample() for i in range(50000)]
    print("Took %f seconds (accept rate %0.3f)" % (time.time() - t, mrs.acceptRate()))
    for ks in ksample:
        bucket(ks, ls, buckets)
    showbuckets(ls, buckets)
