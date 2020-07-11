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
