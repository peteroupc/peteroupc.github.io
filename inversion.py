#
#  Implements interval numbers and demonstrates how
#  a random number following a given distribution can be generated
#  to a given accuracy using CDF inversion.
#
#  Written by Peter O. Any copyright to this file is released to the Public Domain.
#  In case this is not possible, this file is also licensed under Creative Commons Zero
#  (https://creativecommons.org/publicdomain/zero/1.0/).
#

import random
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
            self.sup = Interval._tosup(v, prec)
            self.inf = Interval._toinf(v, prec)
            self.prec = prec

    def _tosup(v, prec):
        if isinstance(v, Fraction):
            return (Interval(v.numerator, prec=prec) / v.denominator).sup
        return Decimal(v)

    def _toinf(v, prec):
        if isinstance(v, Fraction):
            return (Interval(v.numerator, prec=prec) / v.denominator).inf
        return Decimal(v)

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

    def __neg__(self):
        return self._newintv(-self.inf, -self.sup)

    def __rsub__(self, v):
        return self._convert(v) - self

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

    def sqrt(self):
        return self.pow(0.5)

    def isAccurateTo(self, v):
        return self.vol() <= Interval(v).sup

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

    def pow(self, v):
        v = self._convert(v)
        if self.inf <= 0:
            raise ValueError
        return (v * self.log()).exp()

    def __pow__(self, v):
        return self.pow(v)

    def exp(self):
        if self.sup == 0 and self.inf == 0:
            return Interval(1)
        # Unfortunately, Decimal.exp doesn't support multiple
        # rounding modes, so implementing rounding
        # for this function is more convoluted
        rprec = self._floor().prec + 4
        highprec = Context(prec=rprec)
        vh = highprec.exp(self.inf)
        sup = None
        inf = None
        # NOTE: These loops rely on the fact that the result
        # of exp is, in general, inexact
        while True:
            inf = self._floor().plus(vh)
            # print(["inf", vh, inf])
            if inf != vh:
                break
            highprec = Context(prec=highprec.prec + 16)
            vh = highprec.exp(self.inf)
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

def inversion(icdf, precision=15):
    """  Generates a random number with a given inverse CDF.
          'icdf(a, b, c)' returns a number that is within 10^-c
          of the true CDF of a*10^-b. """
    u = 0
    ubits = 0
    threshold = Fraction(1, 10 ** precision) * 2
    incr = 8
    while True:
        incr = precision if ubits == 0 else 8
        u = u * 10 ** incr + random.randint(0, 10 ** incr - 1)
        ubits += incr
        lower = icdf(u, ubits, precision)
        upper = icdf(u + 1, ubits, precision)
        diff = upper - lower
        if diff <= threshold:
            return upper + diff / 2

def expoicdf(u, ubits, precision):
    """ Inverse CDF for the exponential distribution, implemented
         accurately using interval arithmetic. """
    intv = Fraction(u, 10 ** ubits)
    threshold = Fraction(1, 10 ** precision)
    while True:
        ret = 1 - intv
        ret = -(Interval(ret, prec=precision).log())
        if ret.isAccurateTo(threshold):
            return ret.midpoint()
        precision += 8
