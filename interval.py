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
from betadist import *

#
#  Implements interval numbers and interval arithmetic.  Builds on the concept of "constructive reals"
#  or "recursive reals", which provide a function that outputs a value
#  strictly within 1/2^n of the true result, where n is a user-specified
#  precision in bits.
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
                return FInterval(self.inf**yn, self.sup**yn)
            if self.sup <= 0:
                return FInterval(self.sup**yn, self.inf**yn)
            return FInterval(0, max(self.inf**yn, self.sup**yn))
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

    def tan(self, precision):
        # Use precision 1 greater than requested, so that
        # bounds will come (weakly) within 2^(precision+1) and thus
        # strictly within 2^precision.
        rli = RealTan(self.inf).ev(precision + 1) - 1
        rls = RealTan(self.sup).ev(precision + 1) + 1
        return FInterval(
            Fraction(rli, 1 << (precision + 1)), Fraction(rls, 1 << (precision + 1))
        )

    def exp(self, precision):
        # Use precision 1 greater than requested, so that
        # bounds will come (weakly) within 2^(precision+1) and thus
        # strictly within 2^precision.
        rli = RealExp(self.inf).ev(precision + 1) - 1
        rls = RealExp(self.sup).ev(precision + 1) + 1
        return FInterval(
            Fraction(rli, 1 << (precision + 1)), Fraction(rls, 1 << (precision + 1))
        )

    def atan2(self, x, precision):
        x = FInterval(x)
        if x.sup < 0 and x.inf > 0:
            pi = FInterval.pi(precision)
            return FInterval(-pi.sup, pi.sup)
        rla = RealArcTan2(self.inf, x.inf).ev(precision + 1)
        rlb = RealArcTan2(self.sup, x.inf).ev(precision + 1)
        rlc = RealArcTan2(self.inf, x.sup).ev(precision + 1)
        rld = RealArcTan2(self.sup, x.sup).ev(precision + 1)
        oneprec = 1 << (precision + 1)
        return FInterval(
            Fraction(min(rla - 1, rlb - 1, rlc - 1, rld - 1), 1 << (precision + 1)),
            Fraction(max(rla + 1, rlb + 1, rlc + 1, rld + 1), 1 << (precision + 1)),
        )

    def atan(self, precision):
        # Use precision 1 greater than requested, so that
        # bounds will come (weakly) within 2^(precision+1) and thus
        # strictly within 2^precision.
        rli = RealArcTan(self.inf).ev(precision + 1) - 1
        rls = RealArcTan(self.sup).ev(precision + 1) + 1
        return FInterval(
            Fraction(rli, 1 << (precision + 1)), Fraction(rls, 1 << (precision + 1))
        )

    def pi(precision):
        # Use precision 1 greater than requested, so that
        # bounds will come (weakly) within 2^(precision+1) and thus
        # strictly within 2^precision.
        rli = RealPi().ev(precision + 1)
        return FInterval(
            Fraction(rli - 1, 1 << (precision + 1)),
            Fraction(rli + 1, 1 << (precision + 1)),
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

    def __repr__(self):
        return "[%s, %s]" % (float(self.inf), float(self.sup))

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
        return sum(Fraction(p[i] * x**i, i + 1) for i in range(len(p)))
