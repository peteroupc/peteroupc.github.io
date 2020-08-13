import random
import bernoulli
import randomgen
import geobag
from fractions import Fraction

def _bern_power(bern, bag, num, den, bagfactory):
    if len(bag) >= 4 and bag[0] == 0 and bag[1] == 0 and bag[2] == 0 and bag[3] == 0:
        # If the geometric bag is known to hold a very small number, use
        # a different approach than the power Bernoulli factory, which converges
        # very slowly as the input number approaches 0, when num/den
        # is less than 1.
        # NOTE: Calculating "**(num/den)" requires floating-point arithmetic,
        # and so does geobagcompare, at the moment.
        # This is only a performance optimization.
        return geobag.geobagcompare(bag, lambda x: x ** (num / den))
    else:
        return bern.power(bagfactory, num, den)

def _geobag_to_urand(bag):
    bagc = 0
    bagv = 0
    for i in range(len(bag)):
        if bag[i] == None:
            bag[i] = random.randint(0, 1)
        bagv = (bagv << 1) | bag[i]
        bagc += 1
    return [bagv, bagc]

def _power_of_uniform_greaterthan1(bern, power, complement=False, precision=53):
    return bern.fill_geometric_bag(
        _power_of_uniform_greaterthan1_geobag(bern, power, complement), precision
    )

def _power_of_uniform_greaterthan1_geobag(bern, power, complement=False):
    if power < 1:
        raise ValueError("Not supported")
    if power == 1:
        return []  # Empty uniform random number
    i = 1
    powerfrac = Fraction(power)
    powerrest = Fraction(1) - Fraction(1) / powerfrac
    # Choose an interval
    while (
        bern.zero_or_one_power_ratio(1, 2, powerfrac.denominator, powerfrac.numerator)
        == 1
    ):
        i += 1
    # Crude choice of epsdividend:
    # epsdividend = Fraction(1)/(powerfrac * 2**(i))
    # The following choice of epsdividend makes eps_div
    # much faster, but it requires floating-point arithmetic
    # to calculate "**powerrest".  Using either choice does not
    # affect the correctness of this algorithm.
    probx = (2.0 ** (-i - 1)) ** powerrest
    epsdividend = Fraction(probx) * 255 / 256
    bag = []
    gb = lambda: bern.geometric_bag(bag)
    bf = lambda: _bern_power(bern, bag, powerrest.numerator, powerrest.denominator, gb)
    # print(i)
    while True:
        # Limit sampling to the chosen interval
        bag.clear()
        for k in range(i - 1):
            bag.append(0)
        bag.append(1)
        # Simulate epsdividend / x**(1-1/power)
        if bern.eps_div(bf, epsdividend) == 1:
            # Flip all bits if complement is true
            bag = [x if x == None else 1 - x for x in bag] if complement else bag
            return bag

def powerOfUniform(b, px, py, precision=53):
    """ Generates a power of a uniform random number.
         - px, py - Numerator and denominator of desired exponent for the uniform
           random number.
         - precision: Number of bits after the point that the result will contain.
        """
    # Special case of beta, returning power of px/py
    # of a uniform random number, provided px/py
    # is in (0, 1].
    return betadist(b, py, px, 1, 1, precision)

def truncated_gamma(rg, bern, ax, ay, precision=53):
    # Văduva's gamma generator truncated to [0, 1],
    # when ax/ay is in (0, 1].  Described in Devroye 1986, p. 180.
    while True:
        ret = _power_of_uniform_greaterthan1_geobag(bern, Fraction(ay, ax))
        ret = _geobag_to_urand(ret)
        w = ret
        k = 1
        while True:
            u = randomgen.urandnew()
            if randomgen.urandless(rg, w, u):
                if (k & 1) == 1:
                    return randomgen.urandfill(rg, ret, precision) / (1 << precision)
                break
            w = u
            k += 1

def betadist(b, ax=1, ay=1, bx=1, by=1, precision=53):
    """ Generates a beta-distributed random number with arbitrary
          (user-defined) precision.  Currently, this sampler only works if (ax/ay) and
          (bx/by) are both 1 or greater, or if one of these parameters is
         1 and the other is less than 1.
         - b: Bernoulli object (from the "bernoulli" module).
         - ax, ay: Numerator and denominator of first shape parameter.
         - bx, by: Numerator and denominator of second shape parameter.
         - precision: Number of bits after the point that the result will contain.
        """
    # Beta distribution for alpha>=1 and beta>=1
    bag = []
    bpower = Fraction(bx, by) - 1
    apower = Fraction(ax, ay) - 1
    # Special case for a=b=1
    if bpower == 0 and apower == 0:
        return _toreal(random.randint(0, (1 << precision) - 1), 1 << precision)
    # Special case if a=1
    if apower == 0 and bpower < 0:
        return _power_of_uniform_greaterthan1(b, Fraction(by, bx), True, precision)
    # Special case if b=1
    if bpower == 0 and apower < 0:
        return _power_of_uniform_greaterthan1(b, Fraction(ay, ax), False, precision)
    if apower <= -1 or bpower <= -1:
        raise ValueError
    # Special case if a and b are integers
    if int(bpower) == bpower and int(apower) == apower:
        a = int(Fraction(ax, ay))
        b = int(Fraction(bx, by))
        return _toreal(RandomGen().kthsmallest(a + b - 1, a, precision), precision)
    # Create a "geometric bag" to hold a uniform random
    # number (U), described by Flajolet et al. 2010
    gb = lambda: b.geometric_bag(bag)
    # Complement of "geometric bag"
    gbcomp = lambda: b.geometric_bag(bag) ^ 1
    bPowerBigger = bpower > apower
    while True:
        # Create a uniform random number (U) bit-by-bit, and
        # accept it with probability U^(a-1)*(1-U)^(b-1), which
        # is the unnormalized PDF of the beta distribution
        bag.clear()
        r = 1
        if bPowerBigger:
            # Produce 1 with probability (1-U)^(b-1)
            r = b.power(gbcomp, bpower)
            # Produce 1 with probability U^(a-1)
            if r == 1:
                r = b.power(gb, apower)
        else:
            # Produce 1 with probability U^(a-1)
            r = b.power(gb, apower)
            # Produce 1 with probability (1-U)^(b-1)
            if r == 1:
                r = b.power(gbcomp, bpower)
        if r == 1:
            # Accepted, so fill up the "bag" and return the
            # uniform number
            ret = bern.fill_geometric_bag(b, bag, precision)
            return ret
