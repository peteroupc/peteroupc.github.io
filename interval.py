#
#  Implements interval numbers and interval arithmetic, backed
#  by Fractions.
#
#  Written by Peter O. Any copyright to this file is released to the Public Domain.
#  In case this is not possible, this file is also licensed under Creative Commons Zero
#  (https://creativecommons.org/publicdomain/zero/1.0/).
#
import math
from decimal import Decimal
from fractions import Fraction

#
#  Implements interval numbers and interval arithmetic, backed
#  by Fractions.  Implements the interval arithmetic in
#  Daumas, M., Lester, D., Muñoz, C., "Verified Real Number Calculations:
#  A Library for Interval Arithmetic", arXiv:0708.3721 [cs.MS], 2007.
#

class FInterval:
    """An interval of two Fractions.  x.sup holds the upper bound, and x.inf holds
    the lower bound."""

    def __new__(cl, v, sup=None, prec=None):
        if isinstance(v, FInterval) and sup == None:
            return v
        scl = super(FInterval, cl)
        self = scl.__new__(cl)
        if isinstance(v, Decimal) and isinstance(sup, Decimal):
            self.sup = Fraction(sup)
            self.inf = Fraction(v)
            return self
        elif isinstance(v, int) and sup == None:
            self.sup = Fraction(v)
            self.inf = self.sup
            if self.inf > self.sup:
                raise ValueError
            return self
        elif isinstance(v, int) and isinstance(sup, int):
            self.sup = Fraction(sup)
            self.inf = Fraction(v)
            if self.inf > self.sup:
                raise ValueError
            return self
        inf = v
        sup = v if sup == None else sup
        # Avoid unnecessary conversion to Fraction (and reduction
        # to lowest terms) if an input is already a Fraction
        self.sup = sup if isinstance(sup, Fraction) else Fraction(sup)
        self.inf = inf if isinstance(inf, Fraction) else Fraction(inf)
        if self.inf > self.sup:
            raise ValueError
        return self

    def clamp(self, a, b):
        if a > b:
            raise ValueError
        newinf = max(a, self.inf)
        newsup = min(b, self.sup)
        if self.inf == newinf and self.sup == newsup:
            return self
        return FInterval(newinf, newsup)

    def clampleft(self, a):
        newinf = max(a, self.inf)
        newsup = max(newinf, self.sup)
        if self.inf == newinf and self.sup == newsup:
            return self
        return FInterval(newinf, newsup)

    def __max__(a, b):
        b = FInterval(b)
        return FInterval(min(a.sup, b.sup), max(a.sup, b.sup))

    def __min__(a, b):
        b = FInterval(b)
        return FInterval(min(a.inf, b.inf), max(a.inf, b.inf))

    def __add__(self, v):
        y = FInterval(v)
        return FInterval(self.inf + y.inf, self.sup + y.sup)

    def __abs__(self):
        return self.abs()

    def negate(self):
        return FInterval(-self.sup, -self.inf)

    def __neg__(self):
        return self.negate()

    def __rsub__(self, v):
        return FInterval(v) - self

    def __rmul__(self, v):
        return FInterval(v) * self

    def __radd__(self, v):
        return FInterval(v) + self

    def __rtruediv__(self, v):
        return FInterval(v) / self

    def __sub__(self, v):
        y = FInterval(v)
        return FInterval(self.inf - y.sup, self.sup - y.inf)

    def __mul__(self, v):
        y = FInterval(v)
        a = self.inf * y.inf
        b = self.inf * y.sup
        c = self.sup * y.inf
        d = self.sup * y.sup
        return FInterval(min([a, b, c, d]), max([a, b, c, d]))

    def __truediv__(self, v):
        y = FInterval(v)
        newinf = Fraction(y.sup.denominator, y.sup.numerator)
        newsup = Fraction(y.inf.denominator, y.inf.numerator)
        a = self.inf * newinf
        b = self.inf * newsup
        c = self.sup * newinf
        d = self.sup * newsup
        return FInterval(min([a, b, c, d]), max([a, b, c, d]))

    def union(v):
        y = FInterval(v)
        return FInterval(min(self.inf, y.inf), max(self.sup, y.sup))

    def mignitude(self):
        if self.inf < 0 and self.sup > 0:
            return Fraction(0)
        return min(abs(self.sup), abs(self.inf))

    def magnitude(self):
        return max(abs(self.sup), abs(self.inf))

    def sqrt(self, n):
        return self.pow(FInterval(0.5), n)

    def pi(precision):
        # Use precision 1 greater than requested, so that
        # bounds will come (weakly) within 2^(precision+1) and thus
        # strictly within 2^precision.
        rli = RealPi().ev(precision + 1)
        return FInterval(
            Fraction(rli - 1, 1 << (precision + 1)),
            Fraction(rli + 1, 1 << (precision + 1)),
        )

    def atan(self, n):
        return FInterval(
            FInterval._atanbounds(self.inf, n).inf,
            FInterval._atanbounds(self.sup, n).sup,
        )

    def sin(self, precision):
        if self.sup - self.inf >= Fraction(62832, 10000):
            return FInterval(-1, 1)
        halfpi = RealPi(Fraction(1, 2))
        return FInterval._cos(halfpi - self.inf, halfpi - self.sup, precision)

    def cos(self, precision):
        if self.sup - self.inf >= Fraction(62832, 10000):
            return FInterval(-1, 1)
        return FInterval._cos(RealFraction(self.inf), RealFraction(self.sup), precision)

    @staticmethod
    def _cos(sup, inf, precision):
        inffloor = realFloor(inf / RealPi())
        supfloor = realFloor(sup / RealPi())
        if abs(supfloor - inffloor) >= 2:
            return FInterval(-1, 1)
        rli = RealCos(inf).ev(precision + 1)
        rls = RealCos(sup).ev(precision + 1)
        precden = 1 << (precision + 1)
        if rli < -precden or rli > precden or rls < -precden or rli > precden:
            raise ValueError
        if abs(supfloor - inffloor) == 1:
            # Straddles pi boundaries
            even = abs(inffloor) % 2 == 0
            # Even means descending then ascending
            if even:
                rlinf = -1
            else:
                rlinf = Fraction(max(-precden, min(rli - 1, rls - 1)), precden)
            if not even:
                rlsup = 1
            else:
                rlsup = Fraction(min(precden, max(rli + 1, rls + 1)), precden)
        else:
            rlinf = Fraction(max(-precden, min(rli - 1, rls - 1)), precden)
            rlsup = Fraction(min(precden, max(rli + 1, rls + 1)), precden)
        return FInterval(rlinf, rlsup)

    def tan(self, n):
        raise NotImplementedError

    def isAccurateTo(self, v):
        # If upper bound on width is less than or equal to desired accuracy
        return (FInterval(self.sup) - FInterval(self.inf)).sup <= FInterval(v).inf

    def width(self):
        return self.sup - self.inf

    def _greaterThanZero(frac):
        return (frac.numerator > 0 and frac.denominator > 0) or (
            frac.numerator < 0 and frac.denominator < 0
        )

    def abs(self):
        if (self.inf < 0) != (self.sup < 0):
            return FInterval(0, max(abs(self.inf), abs(self.sup)))
        else:
            a = abs(self.inf)
            b = abs(self.sup)
            return FInterval(min(a, b), max(a, b))

    def _fracfloor(x):
        ix = int(x)
        if x >= 0:
            return ix
        if x != ix:
            return ix - 1
        return ix

    def _fracceil(x):
        ix = int(x)
        if x < 0:
            return ix
        if x != ix:
            return ix + 1
        return ix

    def floor(self):
        floorinf = FInterval._fracfloor(self.inf)
        floorsup = FInterval._fracfloor(self.sup)
        return FInterval(min(floorinf, floorsup), max(floorinf, floorsup))

    def ceil(self):
        cinf = FInterval._fracceil(self.inf)
        csup = FInterval._fracceil(self.sup)
        return FInterval(min(cinf, csup), max(cinf, csup))

    def rem(self, v):
        return self - (self / v).floor() * v

    def greaterThanScalar(self, a):
        return self.inf > a

    def greaterEqualScalar(self, a):
        return self.inf >= a

    def lessThanScalar(self, a):
        return self.sup < a

    def lessEqualScalar(self, a):
        return self.sup <= a

    def intersect(self, y):
        if x.sup < y.inf or x.inf > y.sup:
            return None
        return FInterval(max(x.inf, y.inf), min(x.sup, y.sup))

    def containedIn(self, y):
        return y.inf <= self.inf and self.sup <= y.sup

    def pow(self, v, precision):
        y = v if isinstance(v, FInterval) else FInterval(v)
        if y.inf == y.sup and int(y.inf) == y.inf and y.inf >= 0 and y.inf <= 32:
            # Special case: Integer power
            yn = int(y.inf)
            if yn == 0:
                return FInterval(1, 1)
            if yn == 1:
                return self
            if yn % 2 == 1 or self.inf >= 0:
                return FInterval(self.inf ** yn, self.sup ** yn)
            if self.sup <= 0:
                return FInterval(self.sup ** yn, self.inf ** yn)
            return FInterval(0, max(self.inf ** yn, self.sup ** yn))
        if self.inf == self.sup and self.inf == 0:
            # Special case: 0
            return FInterval(0)
        # Use precision 1 greater than requested, so that
        # bounds will come (weakly) within 2^(precision+1) and thus
        # strictly within 2^precision.
        rli = RealPow(self.inf, v).ev(precision + 1) - 1
        rls = RealPow(self.sup, v).ev(precision + 1) + 1
        return FInterval(
            Fraction(rli, 1 << (precision + 1)), Fraction(rls, 1 << (precision + 1))
        )

    def __pow__(self, v):
        """ For convenience only. """
        return self.pow(v, 5)

    def log(self, precision):
        if not FInterval._greaterThanZero(self.inf):
            raise ValueError
        # Use precision 1 greater than requested, so that
        # bounds will come (weakly) within 2^(precision+1) and thus
        # strictly within 2^precision.
        rli = RealLn(self.inf).ev(precision + 1) - 1
        rls = RealLn(self.sup).ev(precision + 1) + 1
        return FInterval(
            Fraction(rli, 1 << (precision + 1)), Fraction(rls, 1 << (precision + 1))
        )

    def _sqrtbounds(x, n):  # x>=0; n is number of iterations
        x = x if isinstance(x, Fraction) else Fraction(x)
        upper = x + 1
        for i in range(0, n):
            upper = (upper + x / upper) / 2
        lower = x / upper
        if lower > upper:
            raise ValueError("Sanity check failed")
        return FInterval(lower, upper)

    def _atanbounds(x, n):
        x = x if isinstance(x, Fraction) else Fraction(x)
        if x == 0:
            return FInterval(0, 0)
        if x == 1:
            a1 = FInterval._atanbounds(Fraction(1, 5), n)
            a2 = FInterval._atanbounds(Fraction(1, 239), n)
            a3 = [
                4 * a1.inf - a2.inf,
                4 * a1.inf - a2.sup,
                4 * a1.sup - a2.inf,
                4 * a1.sup - a2.sup,
            ]
            # print(a3)
            return FInterval(min(a3), max(a3))
        if x > 0 and x < 1:
            ret = Fraction(0)
            # NOTE: Another error corrected in arXiv version
            # of the paper: The series starts at i=0, not i=1
            for i in range(0, 2 * n + 1):
                ret += (-1) ** i * x ** (2 * i + 1) / (2 * i + 1)
                # print("ret %f" % (ret))
            m = 2 * n + 1
            bound = ret + (-1) ** (m) * x ** (2 * m + 1) / (2 * m + 1)
            # print("x %f, ret=%f, bound=%f" % (float(x),float(ret),float(bound)))
            if ret < bound:
                raise ValueError
            return FInterval(bound, ret)
        if x > 1:
            pi = FInterval.pi(n)
            at = FInterval._atanbounds(1 / x, n)
            low = pi.inf / 2 - at.sup
            high = pi.sup / 2 - at.inf
            if low > high:
                raise ValueError
            return FInterval(low, high)
        else:
            at = FInterval._atanbounds(-x, n)
            if -at.sup > -at.inf:
                raise ValueError
            return FInterval(-at.sup, -at.inf)

    def exp(self, n):
        # Use precision 1 greater than requested, so that
        # bounds will come (weakly) within 2^(precision+1) and thus
        # strictly within 2^precision.
        rli = RealExp(self.inf).ev(precision + 1) - 1
        rls = RealExp(self.sup).ev(precision + 1) + 1
        return FInterval(
            Fraction(rli, 1 << (precision + 1)), Fraction(rls, 1 << (precision + 1))
        )

    def __repr__(self):
        return "[%s, %s]" % (float(self.inf), float(self.sup))

_BERNNUMBERS = [
    Fraction(1),
    Fraction(-1, 2),
    Fraction(1, 6),
    0,
    Fraction(-1, 30),
    0,
    Fraction(1, 42),
    0,
    Fraction(-1, 30),
    0,
    Fraction(5, 66),
    0,
]
_extrabernnumbers = {}

def bernoullinum(n):
    # Calculates Bernoulli numbers
    global _extrabernnumbers
    if n < len(_BERNNUMBERS):
        return _BERNNUMBERS[n]
    if n % 2 == 1:
        return 0
    if n in _extrabernnumbers:
        return _extrabernnumbers[n]
    # print(n)
    v = 1
    v += Fraction(-(n + 1), 2)
    i = 2
    while i < n:
        v += math.comb(n + 1, i) * bernoullinum(i)
        i += 2
    ret = -v / (n + 1)
    _extrabernnumbers[n] = ret
    return ret

_STIRLING1 = {}

def stirling1(n, k):
    # Calculates Stirling numbers of the first kind
    if n == k:
        return 1
    if k <= 0:
        return 0
    if (n, k) in _STIRLING1:
        return _STIRLING1[(n, k)]
    ret = stirling1(n - 1, k - 1) - stirling1(n - 1, k) * (n - 1)
    _STIRLING1[(n, k)] = ret
    return ret

def _polynomialProduct(a, b):
    # Finds the product of two polynomials.  Each polynomial
    # is a list of the following form:
    # [d, f, g, ...] which corresponds to d + f*x**1 + g*x**2 + ...
    deg = (len(a) - 1) + (len(b) - 1)
    ret = [0 for i in range(deg + 1)]
    for i in range(len(a)):
        for j in range(len(b)):
            ret[i + j] += a[i] * b[j]
    return ret

def _polynomialProductA(a, b0, b1):
    ret = [0 for i in range(len(a) + 1)]
    for i in range(len(a)):
        ret[i] += a[i] * b0  # b0 is 0th-order coefficient
        ret[i + 1] += a[i] * b1  # b1 is 1st-order coefficient
    return ret

def _polynomialIntegral(p, x=1):
    # Finds the integral of a polynomial at the point x.
    if x == 1:
        n = 0
        d = 1
        for i in range(len(p)):
            n = n * (i + 1) + d * p[i]
            d *= i + 1
        return Fraction(n, d)
    else:
        return sum(Fraction(p[i] * x ** i, i + 1) for i in range(len(p)))

_logpi2cache = {}
_FRACTION_ZERO = Fraction(0)

def loggamma(k, v=4):
    global _logpi2cache
    # Log gamma primarily intended for computing factorials (of integers).
    # v is an accuracy parameter.
    # -------
    # Return 0 (ln(1)) for k<=2.  We don't care about numbers less than 2,
    # other than 1.
    if k <= 2:
        return FInterval(0)
    if not (v in _logpi2cache):
        _logpi2cache[v] = (FInterval.pi(v * 2) * 2).log(v * 2)
    # Implements the first listed convergent version of Stirling's formula
    # given in section 3 of R. Schumacher, "Rapidly Convergent Summation Formulas
    # involving Stirling Series", arXiv:1602.00336v1 [math.NT], 2016.
    # Usually, Stirling's approximation diverges, which however is inappropriate for
    # use in exact sampling algorithms, where series expansions must converge
    # in order for the algorithm to halt with probability 1.
    # Unfortunately, the formula from the paper is monotonically increasing and
    # that paper didn't specify the exact rate of convergence or
    # an upper bound on the error incurred when truncating the series (a bound required
    # for our purposes of exact sampling).  For this reason, this method
    # employs an error bound suggested to me by the user "Simply Beautiful Art"
    # from the Mathematics Stack Exchange community:
    # The error is abs(t[n+1]**2 / (t[n+2] - t[n+1])), where t[n+1] and t[n+2] are the first
    # two neglected terms.
    xn = k - 1
    logx = FInterval(xn).log(v * 2)
    ret = xn * logx - xn + (logx + _logpi2cache[v]) / 2
    rb = _FRACTION_ZERO
    d = 1
    # print("rsup",float(ret.sup))
    lastterm1 = _FRACTION_ZERO
    lastterm2 = _FRACTION_ZERO
    for i in range(1, v + 2):
        nn = 0
        nd = 1
        for l in range(1, i + 1):
            bn = bernoullinum(l + 1)
            sn = stirling1(i, l)
            an = bn.numerator * sn.numerator
            ad = bn.denominator * sn.denominator * (l * (l + 1))
            if l % 2 == 1:
                # Subtract (an/ad)
                nn = nn * ad - nd * an
                nd *= ad
            else:
                # Add (an/ad)
                nn = nn * ad + nd * an
                nd *= ad
        d *= xn + i
        term = Fraction(nn, nd * d)
        if i % 2 == 1:
            term = -term
        if i == v + 1:
            lastterm = abs(term)
        elif i == v + 2:
            lastterm2 = abs(term)
        else:
            oldrb = rb
            rb += term
    ediff = abs(lastterm * lastterm / (lastterm2 - lastterm))
    ret += rb
    retinf = max(ret.inf, 0)
    retsup = max(ret.sup + ediff, 0)
    return FInterval(retinf, retsup)

def logbinco(n, k, v=4):
    # Log binomial coefficient.
    # v is an accuracy parameter.
    if k + 1 == (n - k) + 1:
        r = loggamma(n + 1, v) - loggamma(k + 1, v) * 2
    else:
        r = loggamma(n + 1, v) - loggamma(k + 1, v) - loggamma((n - k) + 1, v)
    return r

def logbinprob(n, k, v=4):
    # Log of binomial probability, that is, the log of the probability
    # that exactly k zeros occur among n unbiased random bits.
    # v is an accuracy parameter.
    divisor = FInterval(2).log(v + 4) * n  # ln(2)*n = ln(2**n)
    return logbinco(n, k, v) - divisor

def logpoisson(lamda, n, v=4):
    # Log of the probability that a Poisson(lamda) random number is n.
    # v is an accuracy parameter.
    return FInterval(lamda).log(v + 4) * n - lamda - loggamma(n + 1, v)

if __name__ == "__main__":
    print("----")
    print(logpoisson(10, 15) / 2)  # log(sqrt(PoissonProb))
    print(logpoisson(2 ** 30, 2 ** 30, 10) / 2)  # log(sqrt(PoissonProb))
    print(math.log(math.sqrt(10 ** 15 * math.exp(-10) / math.gamma(15 + 1))))
    last = None
    for i in range(4, 15):
        n = loggamma(1000, i)
        if last != None and (n.inf < last.inf or n.sup > last.sup):
            raise ValueError
        print([n, math.lgamma(1000)])
        last = n
