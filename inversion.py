#
#  Demonstrates how a random number following a 
#  given distribution can be generated
#  to a given accuracy using CDF inversion and interval arithmetic.
#
#  Written by Peter O. Any copyright to this file is released to the Public Domain.
#  In case this is not possible, this file is also licensed under Creative Commons Zero
#  (https://creativecommons.org/publicdomain/zero/1.0/).
#

import random
import decimal
from decimal import Decimal, Context
from fractions import Fraction

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
