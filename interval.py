#
#  Implements interval numbers and interval arithmetic, backed
#  by Decimal values.
#
#  Written by Peter O. Any copyright to this file is released to the Public Domain.
#  In case this is not possible, this file is also licensed under Creative Commons Zero
#  (https://creativecommons.org/publicdomain/zero/1.0/).
#

import decimal
from decimal import Decimal, Context
from fractions import Fraction

class Interval:
    """ An interval of two Decimal values. """

    def __init__(self, v, sup=None, prec=None):
        if isinstance(v, Interval) and sup == None:
            self.sup = v.sup
            self.inf = v.inf
            self.prec = v.prec
        else:
            inf = v
            sup = v if sup == None else sup
            self.prec = prec
            self.sup = Interval._tosup(sup, prec)
            self.inf = Interval._toinf(inf, prec)
        if self.sup < self.inf:
            raise ValueError

    def _tosup(v, prec):
        if isinstance(v, Fraction):
            return (Interval(v.numerator, prec=prec) / v.denominator).sup
        if prec == None:
            return Decimal(v)
        return Context(rounding=decimal.ROUND_CEILING, prec=prec).plus(Decimal(v))

    def _toinf(v, prec):
        if isinstance(v, Fraction):
            return (Interval(v.numerator, prec=prec) / v.denominator).inf
        if prec == None:
            return Decimal(v)
        return Context(rounding=decimal.ROUND_FLOOR, prec=prec).plus(Decimal(v))

    def _convert(self, v):
        if isinstance(v, Interval):
            return v
        return Interval(v)

    def _floor(self):
        if self.prec == None:
            return Interval.RFLOOR
        return Context(rounding=decimal.ROUND_FLOOR, prec=self.prec)

    def _ceil(self):
        if self.prec == None:
            return Interval.RCEILING
        return Context(rounding=decimal.ROUND_CEILING, prec=self.prec)

    def vol(self):
        # NOTE: For multidimensional intervals, vol is product of wid's
        return self.sup - self.inf

    def _newintv(self, a, b):
        return Interval(a, b, prec=self.prec)

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
        return self._newintv(0, 0) - self

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
            return self._newintv(0, 0)
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
        return self * self._newintv(
            self._floor().divide(1, v.sup), self._ceil().divide(1, v.inf)
        )

    def mignitude(self):
        return min(abs(self.sup), abs(self.inf))

    def magnitude(self):
        return max(abs(self.sup), abs(self.inf))

    def sqrt(self):
        return self.pow(0.5)

    def isAccurateTo(self, v):
        return self.vol() <= Interval(v).sup

    def width(self):
        return self.sup - self.inf

    def midpoint(self):
        return self.inf + (self.sup - self.inf) / 2

    def log(self):
        if self.inf <= 0:
            raise ValueError
        if self.sup == 1 and self.inf == 1:
            return Interval(0, self.prec)
        # Unfortunately, Decimal.ln doesn't support multiple
        # rounding modes, so implementing rounding
        # for this function is more convoluted
        rprec = self._floor().prec + 4
        highprec = Context(prec=rprec)
        vh = highprec.ln(self.inf)
        sup = None
        inf = None
        # NOTE: These loops rely on the fact that the result
        # of ln is, in general, inexact
        while True:
            inf = self._floor().plus(vh)
            # print(["inf", vh, inf])
            if inf != vh:
                break
            highprec = Context(prec=highprec.prec + 16)
            vh = highprec.ln(self.inf)
        vh = highprec.ln(self.sup)
        while True:
            sup = self._ceil().plus(vh)
            # print(["sup", vh, sup])
            if sup != vh:
                break
            highprec = Context(prec=highprec.prec + 16)
            vh = highprec.ln(self.sup)
        return self._newintv(inf, sup)

    def abs(self):
        return self._newintv(self.mignitude(), self.magnitude())

    def pow(self, v):
        v = self._convert(v)
        if v.inf == v.sup:
            if v.inf == 1:
                return self
            if v.inf == 2:
                return self._newintv(self.mignitude() ** 2, self.magnitude() ** 2)
        return (v * self.log()).exp()

    def __pow__(self, v):
        return self.pow(v)

    def exp(self):
        if self.sup == 0 and self.inf == 0:
            return self._newintv(1, self.prec)
        # Unfortunately, Decimal.exp doesn't support multiple
        # rounding modes, so implementing rounding
        # for this function is more convoluted
        rprec = self._floor().prec + 4
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
                inf = self._floor().plus(vh)
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
                sup = self._ceil().plus(vh)
                # print(["sup", vh, sup])
                if sup != vh:
                    break
                highprec = Context(prec=highprec.prec + 16)
                vh = highprec.exp(self.sup)
        return self._newintv(inf, sup)

    def __repr__(self):
        return "[%s, %s]" % (self.inf, self.sup)

    RCEILING = Context(rounding=decimal.ROUND_CEILING)
    RFLOOR = Context(rounding=decimal.ROUND_FLOOR)
