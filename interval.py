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
        return ab * 4

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

    def _greaterThanZero(frac):
        return (frac.numerator > 0 and frac.denominator > 0) or (
            frac.numerator < 0 and frac.denominator < 0
        )

    def log(self, n):
        if not FInterval._greaterThanZero(self.inf):
            raise ValueError
        return FInterval(
            FInterval._logbounds(self.inf.numerator, self.inf.denominator, n).inf,
            FInterval._logbounds(self.sup.numerator, self.sup.denominator, n).sup,
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

    _logboundscache = {}
    _fraction15 = Fraction(1.5)

    def _logbounds(num, den, n):
        if num == 0 or den == 0 or (num < 0 and den > 0) or (den < 0 and num > 0):
            raise ValueError
        if num == den:
            return FInterval(0)
        if num > den and num * 2 <= den * 3:  # ... and (num/den)<=1.5
            xmn = num - den
            xmd = den
            xva = xmn
            xvb = xmd
            # Numerator and denominator of lower bound
            va = 0
            vb = 1
            vtrunc = 0
            for i in range(1, 2 * n + 1):
                vc = xmn
                vd = xmd * i
                xmn *= xva
                xmd *= xvb
                if i % 2 == 0:
                    # Subtract from lower bound
                    ra = va * vd - vb * vc
                    rb = vb * vd
                    va = ra
                    vb = rb
                else:
                    # Add to lower bound
                    ra = va * vd + vb * vc
                    rb = vb * vd
                    va = ra
                    vb = rb
                # Truncate lower bound to avoid "runaway" growth of
                # numerator and denominator
                if i % 4 == 0 or i == 2 * n:
                    va, vb, vtrunc = FInterval._truncateNumDen(va, vb, n, vtrunc)
            # print([va, vb, vtrunc])
            # Calculate upper bound
            vc = xmn
            vd = xmd * i
            ua = va * vd + vb * vc
            ub = vb * vd
            # Add truncation error to upper bound
            if vtrunc > 0:
                tua = ua * 2 ** max(n * 4, 128) + ub * vtrunc
                tub = ub * 2 ** max(n * 4, 128)
                ua = tua
                ub = tub
            return FInterval._toTruncated(va, vb, ua, ub)
        if num < den:
            lb = FInterval._logbounds(den, num, n)
            # NOTE: Correcting an error in arXiv version
            # of the paper
            lower = -lb.sup
            upper = -lb.inf
            return FInterval(lower, upper)
        # now, x>2
        # NOTE: Replacing 2 with 1.5, which leads to much
        # faster convergence
        m = 0
        xn = num
        xd = den
        while xn * 2 > xd * 3:  # (xn/xd)>1.5
            m += 1
            xn *= 2  # Denominator of 1.5
            xd *= 3  # Numerator of 1.5
        if not (n in FInterval._logboundscache):
            # Find logbounds for 1.5 and given accuracy level
            FInterval._logboundscache[n] = FInterval._logbounds(3, 2, n)
        l2 = FInterval._logboundscache[n]
        ly = FInterval._logbounds(xn, xd, n)
        lower = m * l2.inf + ly.inf
        upper = m * l2.sup + ly.sup
        return FInterval(lower, upper)

    def _truncateNumDen(infnum, infden, v, vtrunc):
        bittol = max(v * 4, 128)
        if infnum.bit_length() > bittol:
            ninf = infnum << bittol if infnum > 0 else infnum * 2 ** bittol
            ninf = (
                -int(abs(ninf) // abs(infden)) - 1
                if infnum < 0
                else int(abs(ninf) // abs(infden))
            )
            # print([float(Fraction(infnum,infden)),float(Fraction(ninf,2**bittol))])
            return (ninf, 1 << bittol, vtrunc + 1)
        else:
            return (infnum, infden, vtrunc)

    def _toTruncated(infnum, infden, supnum, supden):
        bittol = 128
        if infnum < (1 << bittol) and supnum < (1 << bittol):
            # print([infnum,supnum])
            ret = Fraction(infnum, infden)
            upper = Fraction(supnum, supden)
            return FInterval(ret, upper)
        elif ((supnum * infden - supden * infnum) * (1 << bittol)) < (infden * supden):
            ret = Fraction(infnum, infden)
            upper = Fraction(supnum, supden)
            # print(float(upper-ret))
            return FInterval(ret, upper)
        else:
            ninf = infnum * 2 ** bittol
            ninf = (
                -int(abs(ninf) // abs(infden)) - 1
                if infnum < 0
                else int(abs(ninf) // abs(infden))
            )
            nsup = supnum * 2 ** bittol
            nsup = (
                -int(abs(nsup) // abs(supden)) - 1
                if supnum < 0
                else int(abs(nsup) // abs(supden))
            )
            # print([ninf,nsup])
            return FInterval(Fraction(ninf, 2 ** bittol), Fraction(nsup, 2 ** bittol))

    def _expbounds(x, n):
        x = x if isinstance(x, Fraction) else Fraction(x)
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
        x = x if isinstance(x, Fraction) else Fraction(x)
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
        x = x if isinstance(x, Fraction) else Fraction(x)
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
        x = x if isinstance(x, Fraction) else Fraction(x)
        upper = x + 1
        for i in range(0, n):
            upper = (upper + x / upper) / 2
        lower = x / upper
        if lower > upper:
            raise ValueError
        return FInterval(max(lower, upper), max(lower, upper))

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

    def truncate(self):
        """ Truncates the numerator and denominator of this interval's
            bounds if it's relatively wide.  This can help improve performance
            in arithmetic operations involving this interval, since it reduces
            the work that needs to be done (especially in reductions to lowest
            terms) when generating new Fractions as a result of these operations.
            In Python in particular, working with Fractions is very slow. """
        if (
            self.sup.numerator.bit_length() < 64
            and self.sup.denominator.bit_length() < 64
            and self.inf.numerator.bit_length() < 64
            and self.inf.denominator.bit_length() < 64
        ):
            return self
        if self.sup - self.inf < Fraction(1, 2 ** 64):
            return self
        ninf = self.inf * 2 ** 64
        ninf = int(ninf) - 1 if ninf < 0 else int(ninf)
        nsup = self.sup * 2 ** 64
        nsup = int(nsup) if nsup < 0 else int(nsup) + 1
        ret = FInterval(Fraction(ninf, 2 ** 64), Fraction(nsup, 2 ** 64))
        return ret

    def exp(self, n):
        return FInterval(
            FInterval._expbounds(self.inf, n).inf, FInterval._expbounds(self.sup, n).sup
        )

    def __repr__(self):
        return "[%s, %s]" % (float(self.inf), float(self.sup))

# Yannis Manolopoulos. 2002. "Binomial coefficient computation:
# recursion or iteration?", SIGCSE Bull. 34, 4 (December 2002),
# 65–67. DOI: https://doi.org/10.1145/820127.820168
# NOTE: A logarithmic version of this formula is trivial to derive
# from this one, but it's rather slow compared to log gamma:
# instead of the product, take the sum of logarithms.
def binco(n, k):
    vnum = 1
    vden = 1
    for i in range(n - k + 1, n + 1):
        vnum *= i
        vden *= n - i + 1
    return vnum // vden

# Calculates Bernoulli numbers
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
    global _extrabernnumbers
    if n % 2 == 1:
        return 0
    if n < len(_BERNNUMBERS):
        return _BERNNUMBERS[n]
    if n in _extrabernnumbers:
        return _extrabernnumbers[n]
    # print(n)
    v = 1
    v += Fraction(-(n + 1), 2)
    i = 2
    while i < n:
        v += binco(n + 1, i) * bernoullinum(i)
        i += 2
    ret = -v / (n + 1)
    _extrabernnumbers[n] = ret
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

def loggamma(k, v=4):
    global _logpi2cache
    # Log gamma primarily intended for computing factorials (of integers).
    # v is an accuracy parameter.
    # -------
    # Return 0 for k<=2.  We don't care about numbers less than 2,
    # other than 1.
    if k <= 2:
        return FInterval(0)
    origk = k if isinstance(k, Fraction) else Fraction(k)
    k = FInterval(k)
    if not (v in _logpi2cache):
        _logpi2cache[v] = (FInterval.pi(v + 4) * 2).log(v + 4).truncate()
    # Binet's approximation
    ret = (k - FInterval(1 / 2)) * k.log(v + 4) + _logpi2cache[v] / 2 - k
    p = [0, -1, 2]
    denom = Fraction(1)
    extra = Fraction(0)
    for j in range(1, v + 1):
        c = _polynomialIntegral(p)
        p = _polynomialProductA(p, j, 1)
        denom *= origk + j
        extra += c / (j * denom)
    ret += extra / 2
    # Error bounds
    # bc is rounded up from 5*sqrt(pi)*exp(1/6)/24
    # TODO: This bound was taken from Devroye 1986;
    # are there tighter bounds for the Binet series?
    bc = Fraction(43624, 100000)
    kp1 = origk + 1
    error = (
        bc * (Fraction(kp1) / origk) * (kp1 / (kp1 + v)) ** min(int(origk), max(v, 50))
    )
    # NOTE: Error term not added to inf because the Binet series
    # is monotonically increasing
    inf = ret.inf
    sup = ret.sup + error / 2
    if False:
        lg = math.lgamma(float(origk))
        lt = float(ret.sup + error / 2) >= lg
        if not lt:
            print(
                [
                    origk,
                    v,
                    "ret",
                    lg >= float(ret.inf) and lg <= float(ret.sup + error / 2),
                    lg,
                    "real",
                    int(ret.inf * 10 ** 20),
                    float(ret.sup + upper),
                    float(ret.sup + error / 2),
                    float(ret.sup + error),
                ]
            )
    return FInterval(inf, sup)

def logbinco(n, k, v=4):
    # Log binomial coefficient.
    # v is an accuracy parameter.
    if k + 1 == (n - k) + 1:
        r = loggamma(n + 1, v) - loggamma(k + 1, v) * 2
    else:
        r = loggamma(n + 1, v) - loggamma(k + 1, v) - loggamma((n - k) + 1, v)
    return r.truncate()

def logbinprob(n, k, v=4):
    # Log of binomial probability, that is, the log of the probability
    # that exactly k zeros occur among n unbiased random bits.
    # v is an accuracy parameter.
    divisor = FInterval(2).log(v + 4) * n  # ln(2)*n = ln(2**n)
    return logbinco(n, k, v) - divisor
