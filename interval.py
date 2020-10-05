#
#  Implements interval numbers and interval arithmetic, backed
#  by Decimal values.
#
#  Written by Peter O. Any copyright to this file is released to the Public Domain.
#  In case this is not possible, this file is also licensed under Creative Commons Zero
#  (https://creativecommons.org/publicdomain/zero/1.0/).
#

import decimal
import math
from decimal import Decimal, Context
from fractions import Fraction

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

#
#  Implements interval numbers and interval arithmetic, backed
#  by Fractions.  Implements the interval arithmetic in
#  Daumas, M., Lester, D., Muñoz, C., "Verified Real Number Calculations:
#  A Library for Interval Arithmetic", arXiv:0708.3721 [cs.MS], 2007.
#

class FInterval:
    """ An interval of two Fractions.  x.sup holds the upper bound, and x.inf holds
       the lower bound. """

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
        self.sup = Fraction(sup)
        self.inf = Fraction(inf)
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
        y = FInterval(y)
        return [self.inf + y.inf, self.sup + y.sup]

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
        if y.inf == 0 or y.sup == 0 or (y.inf < 0) != (y.sup < 0):
            raise ValueError("can't divide")
        return self * FInterval(1 / Fraction(y.sup), 1 / Fraction(y.inf))

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

    def pi(n):
        ab = FInterval._atanbounds(1, n)
        return FInterval(16 * ab.inf - 4 * ab.sup, 16 * ab.sup - 4 * ab.inf)

    def atan(self, n):
        return FInterval(
            FInterval._atanbounds(self.inf, n).inf,
            FInterval._atanbounds(self.sup, n).sup,
        )

    def sin(self, n):
        pi = FInterval.pi(n)
        if self.containedIn(FInterval(-pi.inf / 2, pi.inf / 2)):
            return FInterval(
                FInterval._sinbounds(self.inf, n).inf,
                FInterval._sinbounds(self.sup, n).sup,
            )
        elif self.containedIn(FInterval(pi.sup / 2, pi.inf)):
            return FInterval(
                FInterval._sinbounds(self.sup, n).inf,
                FInterval._sinbounds(self.inf, n).sup,
            )
        elif self.containedIn(FInterval(0, pi.inf)):
            return FInterval(
                min(
                    FInterval._sinbounds(self.inf, n).inf,
                    FInterval._sinbounds(self.sup, n).inf,
                ),
                1,
            )
        elif self.containedIn(FInterval(-pi.inf, 0)):
            return self.negate().sin(n).negate()
        else:
            return FInterval(-1, 1)

    def cos(self, n):
        pi = FInterval.pi(n)
        if self.containedIn(FInterval(0, pi.inf)):
            return FInterval(
                FInterval._cosbounds(self.sup, n).inf,
                FInterval._cosbounds(self.inf, n).sup,
            )
        elif self.containedIn(FInterval(-pi.inf, 0)):
            return self.negate().cos(n)
        elif self.containedIn(FInterval(-pi.inf / 2, pi.inf / 2)):
            return FInterval(
                min(
                    FInterval._cosbounds(self.inf, n).inf,
                    FInterval._cosbounds(self.sup, n).inf,
                ),
                1,
            )
        else:
            return FInterval(-1, 1)

    def tan(self, n):
        pi = FInterval.pi(n + 5)
        if not self.containedIn([-pi.inf / 2, pi.inf / 2]):
            raise ValueError
        sl = FInterval._sinbounds(self.inf, n + 5)
        su = FInterval._sinbounds(self.sup, n + 5)
        cl = FInterval._cosbounds(self.inf, n + 5)
        cu = FInterval._cosbounds(self.sup, n + 5)
        lower = sl.inf / cl.sup
        upper = su.sup / cl.inf
        if lower > upper:
            raise ValueError
        return FInterval(lower, upper)

    def isAccurateTo(self, v):
        # If upper bound on width is less than or equal to desired accuracy
        return (FInterval(self.sup) - FInterval(self.inf)).sup <= FInterval(v).inf

    def width(self):
        return self.sup - self.inf

    def log(self, n):
        if not self.greaterThanScalar(0):
            raise ValueError
        return FInterval(
            FInterval._logbounds(self.inf, n).inf, FInterval._logbounds(self.sup, n).sup
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

    def containedIn(self, y):
        return y.inf <= self.inf and self.sup <= y.sup

    def pow(self, v, n):
        y = FInterval(v)
        if y.inf == y.sup and int(y.inf) == y.inf and y.inf >= 0 and y.inf <= 32:
            # Special case: Integer power
            yn = int(y.inf)
            if yn == 0:
                return FInterval(1, 1)
            if yn % 2 == 1 or self.inf >= 0:
                return FInterval(self.inf ** yn, self.sup ** yn)
            if self.sup <= 0:
                return FInterval(self.sup ** yn, self.inf ** yn)
            return FInterval(0, max(self.inf ** yn, self.sup ** yn))
        if y.inf == y.sup and y.inf == Fraction(1, 2):
            # Square root special case
            if not self.greaterEqualScalar(0):
                raise ValueError
            return FInterval(
                FInterval._sqrtbounds(self.inf, n).inf,
                FInterval._sqrtbounds(self.sup, n).sup,
            )
        return (self.log(n) * y).exp(n)

    def __pow__(self, v):
        """ For convenience only. """
        return self.pow(v, 5)

    def _logbounds(x, n):
        x = Fraction(x)
        if x == 0:
            raise ValueError
        if x == 1:
            return FInterval(0)
        if x > 1 and x <= 2:
            ret = Fraction(0)
            for i in range(1, 2 * n + 1):
                ret += (-1) ** (i + 1) * (x - 1) ** i / i
            m = 2 * n + 1
            upper = ret + (-1) ** (m + 1) * (x - 1) ** m / m
            if ret > upper:
                raise ValueError
            return FInterval(ret, upper)
        if x < 1:
            lb = FInterval._logbounds(1 / x, n)
            # NOTE: Correcting an error in arXiv version
            # of the paper
            lower = -lb.sup
            upper = -lb.inf
            if lower > upper:
                raise ValueError
            return FInterval(lower, upper)
        # now, x>2
        m = 0
        while x > 2:
            m += 1
            x /= 2
        l2 = FInterval._logbounds(2, n)
        ly = FInterval._logbounds(x, n)
        lower = m * l2.inf + ly.inf
        upper = m * l2.sup + ly.sup
        if lower > upper:
            raise ValueError
        return FInterval(lower, upper)

    def _expbounds(x, n):
        x = Fraction(x)
        if x == 0:
            return FInterval(1)
        if x >= -1 and x < 0:
            ret = Fraction(0)
            fac = 1
            for i in range(0, 2 * (n + 1) + 1):
                ret += x ** i / fac
                fac *= i + 1
            m = 2 * (n + 1) + 1
            bound = ret + x ** m / fac
            if bound > ret:
                raise ValueError
            return FInterval(bound, ret)
        if x < 1:
            negfloor = -FInterval._fracfloor(x)
            ex = FInterval._expbounds(x / negfloor, n)
            lower = ex.inf ** negfloor
            upper = ex.sup ** negfloor
            if lower > upper:
                raise ValueError
            return FInterval(lower, upper)
        else:
            ex = FInterval._expbounds(-x, n)
            lower = 1 / ex.sup
            upper = 1 / ex.inf
            if lower > upper:
                raise ValueError
            return FInterval(lower, upper)

    def _sinbounds(x, n):
        x = Fraction(x)
        m = 2 * n if x < 0 else 2 * n + 1
        ret = Fraction(0)
        fac = 1
        for i in range(1, m + 1):
            ret += (-1) ** (i - 1) * x ** (2 * i - 1) / fac
            fac *= 2 * i
            fac *= 2 * i + 1
        upbound = ret + (-1) ** (m + 1) * x ** (2 * (m + 1) - 1) / fac
        if ret > upbound:
            raise ValueError
        return FInterval(ret, upbound)

    def _cosbounds(x, n):
        x = Fraction(x)
        m = 2 * n if x < 0 else 2 * n + 1
        ret = Fraction(0)
        fac = 2
        for i in range(1, m + 1):
            ret += (-1) ** (i) * x ** (2 * i) / fac
            fac *= 2 * i + 1
            fac *= 2 * i + 2
        upbound = ret + (-1) ** (m) * x ** (2 * (m)) / fac
        if upbound > ret:
            raise ValueError
        return FInterval(1 + upbound, 1 + ret)

    def _sqrtbounds(x, n):
        x = Fraction(x)
        upper = x / (x + 1)
        for i in range(1, n):
            upper = (upper + x / upper) / 2
        lower = x / upper
        if lower > upper:
            raise ValueError
        return FInterval(lower, upper)

    def _atanbounds(x, n):
        x = Fraction(x)
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
        return FInterval(
            FInterval._expbounds(self.inf, n).inf, FInterval._expbounds(self.sup, n).sup
        )

    def __repr__(self):
        return "[%s, %s]" % (float(self.inf), float(self.sup))
