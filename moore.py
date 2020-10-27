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
import math
from randomgen import RandomGen, FastLoadedDiceRoller
from decimal import Decimal, Context
from fractions import Fraction

# TODO: Eventually, use FInterval instead
class Interval:
    """ An interval of two Decimal values. """

    def __new__(cl, v, sup=None, prec=None):
        if isinstance(v, Interval) and sup == None and prec == None:
            return v
        scl = super(Interval, cl)
        self = scl.__new__(cl)
        if isinstance(v, Interval) and sup == None:
            self.sup = v.sup
            self.inf = v.inf
            self.prec = v.prec
            self.sup = Interval._tosup(self.sup, prec)
            self.inf = Interval._toinf(self.inf, prec)
            return self
        elif isinstance(v, Decimal) and isinstance(sup, Decimal):
            self.sup = sup
            self.inf = v
            self.prec = prec
            return self
        elif isinstance(v, int) and sup == None:
            self.prec = prec
            self.sup = Decimal(v)
            self.inf = self.sup
        elif isinstance(v, int) and isinstance(sup, int):
            self.prec = prec
            self.sup = Decimal(sup)
            self.inf = Decimal(v)
        elif isinstance(v, Fraction) and sup == None:
            d = Decimal(v.numerator) / v.denominator
            if d == v:
                self.prec = prec
                self.sup = d
                self.inf = d
                return self
        inf = v
        sup = v if sup == None else sup
        self.prec = prec
        self.sup = Interval._tosup(sup, prec)
        self.inf = Interval._toinf(inf, prec)
        if self.sup < self.inf:
            raise ValueError
        return self

    def _tosup(v, prec):
        if isinstance(v, Fraction):
            return (Interval(v.numerator, prec=prec) / v.denominator).sup
        return _RCEILING.create_decimal(v)

    def _toinf(v, prec):
        if isinstance(v, Fraction):
            return (Interval(v.numerator, prec=prec) / v.denominator).inf
        return _RFLOOR.create_decimal(v)

    def _convert(self, v):
        if isinstance(v, Interval):
            return v
        return Interval(v, prec=self.prec)

    def _floor(self):
        return _RFLOOR  # Floor context for exact operations (addition, multiplication)

    def _ceil(self):
        return (
            _RCEILING
        )  # Ceiling context for exact operations (addition, multiplication)

    def _floorprec(self):
        # Floor context for inexact operations (division, log, exp, etc.)
        if self.prec == None:
            return Context(rounding=decimal.ROUND_FLOOR, prec=56)
        return Context(rounding=decimal.ROUND_FLOOR, prec=self.prec)

    def _ceilprec(self):
        # Ceiling context for inexact operations (division, log, exp, etc.)
        if self.prec == None:
            return Context(rounding=decimal.ROUND_CEILING, prec=56)
        return Context(rounding=decimal.ROUND_CEILING, prec=self.prec)

    def _newintv(self, a, b):
        return Interval(a, b, prec=self.prec)

    def clamp(self, a, b):
        if a > b:
            raise ValueError
        newinf = max(a, self.inf)
        newsup = min(b, self.sup)
        if self.inf == newinf and self.sup == newsup:
            return self
        return self._newintv(newinf, newsup)

    def clampleft(self, a):
        newinf = max(a, self.inf)
        newsup = max(newinf, self.sup)
        if self.inf == newinf and self.sup == newsup:
            return self
        return self._newintv(newinf, newsup)

    def __add__(self, v):
        v = self._convert(v)
        return self._newintv(
            self._floor().add(self.inf, v.inf), self._ceil().add(self.sup, v.sup)
        )

    def __max__(a, b):
        b = a.convert(b)
        return Interval(
            min(a.sup, b.sup), max(a.sup, b.sup), prec=max(self.prec, b.prec)
        )

    def __min__(a, b):
        b = a.convert(b)
        return Interval(
            min(a.inf, b.inf), max(a.inf, b.inf), prec=max(self.prec, b.prec)
        )

    def __neg__(self):
        return _ZERO - self

    def __rsub__(self, v):
        return self._convert(v) - self

    def __rmul__(self, v):
        return self._convert(v) * self

    def __radd__(self, v):
        return self._convert(v) + self

    def __rtruediv__(self, v):
        return self._convert(v) / self

    def __sub__(self, v):
        v = self._convert(v)
        return self._newintv(
            self._floor().subtract(self.inf, v.sup),
            self._ceil().subtract(self.sup, v.inf),
        )

    def __mul__(self, v):
        v = self._convert(v)
        if self == 1:
            return v
        if self == 0 or v == 0:
            return _ZERO
        return self._newintv(
            min(
                self._floor().multiply(self.inf, v.inf),
                self._floor().multiply(self.sup, v.inf),
                self._floor().multiply(self.inf, v.sup),
                self._floor().multiply(self.sup, v.sup),
            ),
            max(
                self._ceil().multiply(self.inf, v.inf),
                self._ceil().multiply(self.sup, v.inf),
                self._ceil().multiply(self.inf, v.sup),
                self._ceil().multiply(self.sup, v.sup),
            ),
        )

    def __truediv__(self, v):
        v = self._convert(v)
        if self == 1:
            return v
        return self * self._newintv(
            self._floorprec().divide(1, v.sup), self._ceilprec().divide(1, v.inf)
        )

    def _supintv(self):
        return self._newintv(self.sup, self.sup)

    def _infintv(self):
        return self._newintv(self.inf, self.inf)

    def mignitude(self):
        if self.inf < 0 and self.sup > 0:
            return Decimal(0)
        return min(abs(self.sup), abs(self.inf))

    def magnitude(self):
        return max(abs(self.sup), abs(self.inf))

    def sqrt(self):
        if self.inf < 0:
            raise ValueError("Out of range for sqrt: %s" % (self))
        return self.pow(0.5)

    def pi(prec=56):
        if prec == None:
            prec = 56
        ret = Interval(0, prec=prec)
        k = 0
        sign = 1
        for i in range(prec + 10):
            fr = (
                Fraction(2, 4 * k + 2) + Fraction(1, 4 * k + 3) + Fraction(2, 4 * k + 1)
            ) / 4 ** k
            ret += Interval(sign, prec=prec) * fr
            k += 1
            sign = -sign
        return ret

    def sin(self):
        k = 0
        sp = 56 if self.prec == None else self.prec
        pi = Interval.pi(sp)
        if (self._supintv() - self._infintv()).sup > (pi * 2).inf:
            return self._newintv(Decimal(-1), Decimal(1))
        sinmod = self.rem(pi * 2)
        halfpi = pi / 2
        k = 2
        kf = 2
        shp = sinmod - halfpi
        ret = 1 - shp ** 2 / 2
        ks = -1
        for i in range(sp):
            kf *= (k + 1) * (k + 2)
            ks = -ks
            k += 2
            oldwid = ret.width()
            newret = ret + ks * shp ** k / kf
            # print(newret)
            if oldwid < newret.width() and (
                ret.inf == newret.inf or ret.sup == newret.sup
            ):
                return ret
            ret = newret
        return ret

    def cos(self):
        return (self + Interval.pi() / 2).sin()

    def tan(self):
        return self.sin() / self.cos()

    def isAccurateTo(self, v):
        # If upper bound on width is less than or equal to desired accuracy
        return (self._supintv() - self._infintv()).sup <= Interval(v).inf

    def width(self):
        """ NOTE: Not rigorous! """
        return self.sup - self.inf

    def log(self):
        if self.inf <= 0:
            raise ValueError("Out of range for log: %s" % (self))
        if self.sup == 1 and self.inf == 1:
            return _ZERO
        # Unfortunately, Decimal.ln doesn't support multiple
        # rounding modes, so implementing rounding
        # for this function is more convoluted
        rprec = self._floorprec().prec + 4
        highprec = Context(prec=rprec)
        sup = None
        inf = None
        # NOTE: These loops rely on the fact that the result
        # of ln is, in general, inexact
        if self.inf == 1:
            inf = 0
        else:
            vh = highprec.ln(self.inf)
            while True:
                inf = self._floorprec().plus(vh)
                # print(["inf", vh, inf])
                if inf != vh:
                    break
                highprec = Context(prec=highprec.prec + 16)
                vh = highprec.ln(self.inf)
        if self.sup == 1:
            sup = 0
        else:
            vh = highprec.ln(self.sup)
            while True:
                sup = self._ceilprec().plus(vh)
                # print(["sup", vh, sup])
                if sup != vh:
                    break
                highprec = Context(prec=highprec.prec + 16)
                vh = highprec.ln(self.sup)
        return self._newintv(inf, sup)

    def abs(self):
        return self._newintv(self.mignitude(), self.magnitude())

    def floor(self):
        floorinf = self._floor().quantize(self.inf, Decimal("1."))
        floorsup = self._floor().quantize(self.sup, Decimal("1."))
        return self._newintv(min(floorinf, floorsup), max(floorinf, floorsup))

    def ceil(self):
        ceilinf = self._ceil().quantize(self.inf, Decimal("1."))
        ceilsup = self._ceil().quantize(self.sup, Decimal("1."))
        return self._newintv(min(ceilinf, ceilsup), max(ceilinf, ceilsup))

    def rem(self, v):
        return self - (self / v).floor() * v

    def pow(self, v):
        v = self._convert(v)
        if v.inf == v.sup:
            if v.inf == 1:
                return self
            intinf = int(v.inf)
            if intinf == 2:
                return self._newintv(
                    self.mignitude() ** intinf, self.magnitude() ** intinf
                )
            if intinf >= 2 and intinf <= 100 and intinf == v.inf and self.inf >= 0:
                return self._newintv(
                    self.mignitude() ** intinf, self.magnitude() ** intinf
                )
            if intinf == v.inf:
                if intinf >= 1 and intinf % 2 == 1:
                    return self._newintv(self.inf ** intinf, self.sup ** intinf)
                elif intinf >= 1 and intinf % 2 == 0:
                    return self._newintv(
                        self.mignitude() ** intinf, self.magnitude() ** intinf
                    )
                elif intinf == 0:
                    return _ONE
                elif intinf <= -1 and self.inf != 0 and self.sup != 0:
                    return (_ONE / self) ** (-intinf)
        if self.inf == 1 and self.sup == 1:
            return self
        if self.inf == 0:
            if self.sup == 0 and v.inf == v.sup and v.inf == 0:
                return _ONE
            if self.sup == 0 and v.inf == v.sup:
                return _ZERO
            powInf = 0
            if v.inf == v.sup and v.inf == 0:
                powInf = 1
            tmp = self._newintv(self.sup, self.sup)
            tpow = tmp.pow(v)
            return self._newintv(min(1, tpow.inf, powInf), max(1, tpow.sup, powInf))
        return (v * self.log()).exp()

    def __pow__(self, v):
        return self.pow(v)

    def exp(self):
        if self.sup == 0 and self.inf == 0:
            return _ONE
        # Unfortunately, Decimal.exp doesn't support multiple
        # rounding modes, so implementing rounding
        # for this function is more convoluted
        rprec = self._floorprec().prec + 4
        highprec = Context(prec=rprec)
        sup = None
        inf = None
        if self.inf == 0:
            inf = 1
        else:
            vh = highprec.exp(self.inf)
            # NOTE: These loops rely on the fact that the result
            # of exp is, in general, inexact
            while True:
                inf = self._floorprec().plus(vh)
                # print(["inf", vh, inf])
                if inf != vh:
                    break
                highprec = Context(prec=highprec.prec + 16)
                vh = highprec.exp(self.inf)
        if self.sup == 0:
            sup = 1
        else:
            vh = highprec.exp(self.sup)
            while True:
                sup = self._ceilprec().plus(vh)
                # print(["sup", vh, sup])
                if sup != vh:
                    break
                highprec = Context(prec=highprec.prec + 16)
                vh = highprec.exp(self.sup)
        return self._newintv(inf, sup)

    def __repr__(self):
        return "[%s, %s]" % (self.inf, self.sup)

_RCEILING = Context(rounding=decimal.ROUND_CEILING, prec=9999999999)
_RFLOOR = Context(rounding=decimal.ROUND_FLOOR, prec=9999999999)
_ZERO = Interval(0)
_ONE = Interval(1)

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
        return float(Fraction(self.accepts, self.totaltrials))

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
        # Minimum denominator is 2^bitAccuracy,
        # so that all vectors with a coarsest resolution
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
        # NOTE: The use of width is not rigorous, but
        # accuracy is not crucial here
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
        if funcrange.sup < 0:
            raise ValueError("pdf is negative at %s" % (box))
        if not isinstance(funcrange, Interval):
            raise ValueError("pdf must output an Interval")
        # NOTE: Priority key can be a coarse-precision
        # floating-point number, since the exact value of
        # the key is not crucial for the sampler's correctness.
        # The same goes for the use of width, which is not rigorous.
        priorityKey = float(-volume * float(funcrange.width()))
        # NOTE: On the other hand, the weight's exact value
        # is crucial for correctness, since this affects the
        # probability of the sampler choosing each box
        # in the density's approximation.  Therefore, use
        # Fraction, which can store rational numbers (including
        # decimal fractions) exactly, without issues with
        # default precision found in Decimal.
        aliasWeight = volume * Fraction(funcrange.sup)
        # Convert box range elements to integers
        # NOTE: We are dealing here with a random point between 0
        # and the top of the PDF's range anywhere in the box.  A
        # proposed vector is accepted if the point is less than
        # the bottom of the PDF's range, and a "slower"
        # process is done otherwise, which requires evaluating
        # the PDF.  The random point x/denom is chosen, where
        # x is a random integer in [0, rangeSup).
        # Minimum denominator is 2^bitAccuracy.
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

    def fullnormalpdf(x, mean=0, sd=1):
        mean = Interval(mean)
        sd = Interval(sd)
        return (-((x - mean) ** 2) / (2 * sd ** 2)).exp() / (
            sd * Interval(2 * math.pi).sqrt()
        )

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

    def student_t(x, lam=0.5):
        lam = Interval(lam)
        return (lam + x * x) ** (-lam / 2 - Interval(0.5))

    def continuous_bernoulli(x, lamda=0.01):
        """
        Reference: Loaiza-Ganem, G., Cunningham, J., "The
        continuous Bernoulli: fixing a pervasive error
        in variational autoencoders", 2019. """
        lamda = Interval(lamda)  # Parameter in (0, 1)
        return lamda ** x * (1 - lamda) ** (1 - x)

    def osciexpo(x, a=1.0 / 8, b=9.0 / 20, c=1.0 / 2):
        axb = a * x ** b
        rt = 1 + c * (axb * (b * Interval.pi()).tan()).sin()
        ret = (axb).exp() * (rt)
        ret = ret.clampleft(0)
        if ret.sup < 0:
            return Interval(0)
        return ret

    import time
    import math
    import cProfile

    mrs = MooreSampler(normalpdf, -4, 4)
    ls = linspace(-4, 4, 60)
    buckets = [0 for x in ls]
    t = time.time()
    ksample = [mrs.sample() for i in range(5000)]
    print("Took %f seconds (accept rate %0.3f)" % (time.time() - t, mrs.acceptRate()))
    for ks in ksample:
        bucket(ks, ls, buckets)
    showbuckets(ls, buckets)
