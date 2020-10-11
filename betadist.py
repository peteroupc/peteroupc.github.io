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

def _urand_to_geobag(bag):
    return [(bag[0] >> (bag[1] - 1 - i)) & 1 for i in range(bag[1])]

def _geobag_to_urand(bag):
    bagc = 0
    bagv = 0
    for i in range(len(bag)):
        if bag[i] == None:
            bag[i] = random.randint(0, 1)
        bagv = (bagv << 1) | bag[i]
        bagc += 1
    return [bagv, bagc]

def exp_minus_x2y(self, f, y, pwr=2):
    """ B(x) -> B(x*x*y) """
    u = Fraction(1)
    l = Fraction(0)
    uw = 1
    bag = []
    n = 1
    uy = Fraction(y)
    fac = Fraction(1)
    while True:
        for i in range(pwr):
            if uw != 0:
                uw *= f()
        if n % 2 == 0:
            u = l + uw * y / fac
        else:
            l = u - uw * y / fac
        if self._uniform_less(bag, l) == 1:
            return 1
        if self._uniform_less(bag, u) == 0:
            return 0
        n += 1
        fac *= n
        y *= uy

def exp_minus_xy(self, f, y):
    """ B(x) -> B(x*y) """
    u = Fraction(1)
    l = Fraction(0)
    uw = 1
    bag = []
    n = 1
    uy = Fraction(y)
    fac = Fraction(1)
    while True:
        if uw != 0:
            uw *= f()
        if n % 2 == 0:
            u = l + uw * y / fac
        else:
            l = u - uw * y / fac
        if self._uniform_less(bag, l) == 1:
            return 1
        if self._uniform_less(bag, u) == 0:
            return 0
        n += 1
        fac *= n
        y *= uy

def sampleIntPlusBag(bern, bag, k):
    """ Return 1 with probability (x+k)/2^bitlength(k). """
    bitLength = k.bit_length()
    r = 0
    c = 0
    sample = 0
    while bern.randbit() == 0:
        r += 1
    if r < bitLength:
        # Integer part, namely k
        return (k >> (bitLength - 1 - r)) & 1
    else:
        # Fractional part, namely the bag
        r -= bitLength
        while len(bag) <= r:
            bag.append(None)
        if bag[r] == None:
            bag[r] = bern.randbit()
        return bag[r]

def forsythe_prob2(rg, bern, x):
    # Returns true with probability x*exp(1-x), where x is in [0, 1].
    # Implemented with the help of Theorem IV.2.1(iii) given in
    # Non-Uniform Random Variate Generation.
    while True:
        # 1 minus maximum of two uniform(0,1) random numbers, or beta(2,1).pdf(x)
        ret1 = psrn_new_01()
        ret2 = psrn_new_01()
        ret = None
        if psrn_less(ret1, ret2):
            ret = psrn_complement(ret2)
        else:
            ret = psrn_complement(ret1)
        k = 1
        u = ret
        while True:
            v = psrn_new_01()
            if psrn_less(u, v):
                break
            k += 1
            u = v
        if k % 2 == 1:
            return 1 if psrn_less_than_rational_01(ret, x) else 0

def forsythe_prob3(rg, bern, x):
    # Returns true with probability erf(x)/erf(1), where x is in [0, 1].
    # Implemented with the help of Theorem IV.2.1(iii) given in
    # Non-Uniform Random Variate Generation.
    while True:
        # Maximum of two uniform(0,1) random numbers, or beta(2,1).pdf(1-x)
        ret = psrn_new_01()
        k = 1
        u = ret
        while True:
            # Generate v as the maximum of two uniform(0,1) random numbers, or beta(2,1).pdf(x)
            ret1 = psrn_new_01()
            ret2 = psrn_new_01()
            v = ret2 if psrn_less(ret1, ret2) else ret1
            if psrn_less(u, v):
                break
            k += 1
            u = v
        if k % 2 == 1:
            return 1 if psrn_less_than_rational_01(ret, x) else 0

def forsythe_prob(rg, bern, m, n):
    # Returns true with probability gamma(m,n)/gamma(m,1),
    # where gamma(.) is the lower incomplete gamma function.
    # Implemented with the help of Theorem IV.2.1(iii) given in
    # Non-Uniform Random Variate Generation.
    while True:
        # Maximum of m uniform(0,1) random numbers, or beta(m,1)
        ret = rg.kthsmallest_urand(m, m)
        ret = [1, 0, _urand_to_geobag(ret)]
        k = 1
        u = ret
        while True:
            v = psrn_new_01()
            if psrn_less(u, v):
                break
            k += 1
            u = v
        if k % 2 == 1:
            return 1 if psrn_less_than_rational_01(ret, n) else 0

def psrn_complement(x):
    for i in range(len(x[2])):
        if x[2][i] != None:
            x[2][i] = 1 - x[2][i]
    return x

def psrn_new_01():
    return [1, 0, []]

def psrn_less(psrn1, psrn2):
    if psrn1[0] == None or psrn1[1] == None or psrn2[0] == None or psrn2[1] == None:
        raise ValueError
    if psrn1[0] != psrn2[0]:
        return 1 if psrn1[0] < 0 else 0
    if psrn1[0] >= 0:
        if psrn1[1] < psrn2[1]:
            return 1
        if psrn1[1] > psrn2[1]:
            return 0
    if psrn1[0] < 0:
        if psrn1[1] < psrn2[1]:
            return 0
        if psrn1[1] > psrn2[1]:
            return 1
    index = 0
    while True:
        # Fill with next bit in a's uniform number
        while len(psrn1[2]) <= index:
            psrn1[2].append(None)
        if psrn1[2][index] == None:
            psrn1[2][index] = random.randint(0, 1)
        # Fill with next bit in b's uniform number
        while len(psrn2[2]) <= index:
            psrn2[2].append(None)
        if psrn2[2][index] == None:
            psrn2[2][index] = random.randint(0, 1)
        aa = psrn1[2][index]
        bb = psrn2[2][index]
        if aa < bb:
            return True
        if aa > bb:
            return False
        index += 1

def psrn_less_than_rational_01(psrn1, rat):
    rat = Fraction(rat)
    num = rat.numerator
    den = rat.denominator
    if den == 0:
        raise ValueError
    if num < 0 and den < 0:
        num = abs(num)
        den = abs(den)
    if num == 0:
        return 0
    if num < 0 or den < 0:
        return 0
    if num >= den:
        return 1
    pt = 2
    index = 0
    while True:
        # Fill with next bit in a's uniform number
        while len(psrn1[2]) <= index:
            psrn1[2].append(None)
        if psrn1[2][index] == None:
            psrn1[2][index] = random.randint(0, 1)
        d1 = psrn1[2][index]
        c = 1 if num * pt >= den else 0
        d2 = int(num * pt / den)
        if d1 < d2:
            return 1
        if d1 > d2:
            return 0
        if c == 1:
            num = num * pt - den
            den *= pt
        if num == 0:
            return 0
        pt *= 2
        index += 1

def multiply_psrns(psrn1, psrn2, digits=2):
    """ Multiplies two uniform partially-sampled random numbers.
        psrn1: List containing the sign, integer part, and fractional part
            of the first PSRN.  Fractional part is a list of digits
            after the point, starting with the first.
        psrn2: List containing the sign, integer part, and fractional part
            of the second PSRN.
        digits: Digit base of PSRNs' digits.  Default is 2, or binary. """
    if psrn1[0] == None or psrn1[1] == None or psrn2[0] == None or psrn2[1] == None:
        raise ValueError
    for i in range(len(psrn1[2])):
        psrn1[2][i] = (
            random.randint(0, digits - 1) if psrn1[2][i] == None else psrn1[2][i]
        )
    for i in range(len(psrn2[2])):
        psrn2[2][i] = (
            random.randint(0, digits - 1) if psrn2[2][i] == None else psrn2[2][i]
        )
    while len(psrn1[2]) < len(psrn2[2]):
        psrn1[2].append(random.randint(0, digits - 1))
    while len(psrn1[2]) > len(psrn2[2]):
        psrn2[2].append(random.randint(0, digits - 1))
    digitcount = len(psrn1[2])
    if digitcount == 0:
        # Make sure fractional part has at least one digit, to simplify matters
        psrn1[2].append(random.randint(0, digits - 1))
        psrn2[2].append(random.randint(0, digits - 1))
        digitcount += 1
    if len(psrn2[2]) != digitcount:
        raise ValueError
    # Perform multiplication
    frac1 = psrn1[1]
    frac2 = psrn2[1]
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn1[2][i]
    for i in range(digitcount):
        frac2 = frac2 * digits + psrn2[2][i]
    small = frac1 * frac2
    mid1 = frac1 * (frac2 + 1)
    mid2 = (frac1 + 1) * frac2
    large = (frac1 + 1) * (frac2 + 1)
    midmin = min(mid1, mid2)
    midmax = max(mid1, mid2)
    cpsrn = [1, 0, [0 for i in range(digitcount * 2)]]
    cpsrn[0] = psrn1[0] * psrn2[0]
    while True:
        rv = random.randint(0, large - small - 1)
        if rv < midmin - small:
            # Left side of product density; rising triangular
            pw = rv
            newdigits = 0
            b = midmin - small
            y = random.randint(0, b - 1)
            while True:
                if y < pw:
                    # Success
                    sret = small * (digits ** newdigits) + pw
                    for i in range(digitcount * 2 + newdigits):
                        idx = (digitcount * 2 + newdigits) - 1 - i
                        while idx >= len(cpsrn[2]):
                            cpsrn[2].append(None)
                        cpsrn[2][idx] = sret % digits
                        sret //= digits
                    cpsrn[1] = sret
                    return cpsrn
                elif y > pw + 1:  # Greater than upper bound
                    # Rejected
                    break
                pw = pw * digits + random.randint(0, digits - 1)
                y = y * digits + random.randint(0, digits - 1)
                b *= digits
                newdigits += 1
        elif rv >= midmax - small:
            # Right side of product density; falling triangular
            pw = rv - (midmax - small)
            newdigits = 0
            b = large - midmax
            y = random.randint(0, b - 1)
            while True:
                lowerbound = b - 1 - pw
                if y < lowerbound:
                    # Success
                    sret = midmax * (digits ** newdigits) + pw
                    for i in range(digitcount * 2 + newdigits):
                        idx = (digitcount * 2 + newdigits) - 1 - i
                        while idx >= len(cpsrn[2]):
                            cpsrn[2].append(None)
                        cpsrn[2][idx] = sret % digits
                        sret //= digits
                    cpsrn[1] = sret
                    return cpsrn
                elif y > lowerbound + 1:  # Greater than upper bound
                    # Rejected
                    break
                pw = pw * digits + random.randint(0, digits - 1)
                y = y * digits + random.randint(0, digits - 1)
                b *= digits
                newdigits += 1
        else:
            # Middle, or uniform, part of product density
            sret = small + rv
            for i in range(digitcount * 2):
                cpsrn[2][digitcount * 2 - 1 - i] = sret % digits
                sret //= digits
            cpsrn[1] = sret
            return cpsrn

def multiply_psrn_by_fraction(psrn1, fraction, digits=2):
    """ Multiplies a partially-sampled random number by a fraction.
        psrn1: List containing the sign, integer part, and fractional part
            of the first PSRN.  Fractional part is a list of digits
            after the point, starting with the first.
        fraction: Fraction to multiply by.
        digits: Digit base of PSRNs' digits.  Default is 2, or binary. """
    if psrn1[0] == None or psrn1[1] == None:
        raise ValueError
    fraction = Fraction(fraction)
    for i in range(len(psrn1[2])):
        psrn1[2][i] = (
            random.randint(0, digits - 1) if psrn1[2][i] == None else psrn1[2][i]
        )
    digitcount = len(psrn1[2])
    if digitcount == 0:
        # Make sure fractional part has at least one digit, to simplify matters
        psrn1[2].append(random.randint(0, digits - 1))
        digitcount += 1
    # Perform multiplication
    frac1 = psrn1[1]
    fracsign = -1 if fraction < 0 else 1
    absfrac = abs(fraction)
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn1[2][i]
    # Result is "inexact", and "small" expresses a lower bound
    while True:
        dcount = digitcount
        ddc = digits ** dcount
        small1 = Fraction(frac1, ddc) * absfrac
        large1 = Fraction(frac1 + 1, ddc) * absfrac
        # print(["small1",float(small1),"large1",float(large1)])
        dc = int(small1 * ddc)
        dc2 = int(large1 * ddc) + 1
        rv = random.randint(dc, dc2 - 1)
        while True:
            rvsmall = Fraction(rv, ddc)
            rvlarge = Fraction(rv + 1, ddc)
            if rvsmall >= small1 and rvlarge < large1:
                cpsrn = [1, 0, [0 for i in range(dcount)]]
                cpsrn[0] = psrn1[0] * fracsign
                sret = rv
                for i in range(dcount):
                    cpsrn[2][dcount - 1 - i] = sret % digits
                    sret //= digits
                cpsrn[1] = sret
                return cpsrn
            elif rvsmall > large1 or rvlarge < small1:
                break
            else:
                rv = rv * digits + random.randint(0, digits - 1)
                dcount += 1
                ddc *= digits

def add_psrns(psrn1, psrn2, digits=2):
    """ Adds two uniform partially-sampled random numbers.
        psrn1: List containing the sign, integer part, and fractional part
            of the first PSRN.  Fractional part is a list of digits
            after the point, starting with the first.
        psrn2: List containing the sign, integer part, and fractional part
            of the second PSRN.
        digits: Digit base of PSRNs' digits.  Default is 2, or binary. """
    if psrn1[0] == None or psrn1[1] == None or psrn2[0] == None or psrn2[1] == None:
        raise ValueError
    for i in range(len(psrn1[2])):
        psrn1[2][i] = (
            random.randint(0, digits - 1) if psrn1[2][i] == None else psrn1[2][i]
        )
    for i in range(len(psrn2[2])):
        psrn2[2][i] = (
            random.randint(0, digits - 1) if psrn2[2][i] == None else psrn2[2][i]
        )
    while len(psrn1[2]) < len(psrn2[2]):
        psrn1[2].append(random.randint(0, digits - 1))
    while len(psrn1[2]) > len(psrn2[2]):
        psrn2[2].append(random.randint(0, digits - 1))
    digitcount = len(psrn1[2])
    if len(psrn2[2]) != digitcount:
        raise ValueError
    # Perform addition
    if digitcount == 0:
        # Make sure fractional part has at least one digit, to simplify matters
        psrn1[2].append(random.randint(0, digits - 1))
        psrn2[2].append(random.randint(0, digits - 1))
        digitcount += 1
    frac1 = psrn1[1]
    frac2 = psrn2[1]
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn1[2][i]
    for i in range(digitcount):
        frac2 = frac2 * digits + psrn2[2][i]
    small = frac1 * psrn1[0] + frac2 * psrn2[0]
    mid1 = frac1 * psrn1[0] + (frac2 + 1) * psrn2[0]
    mid2 = (frac1 + 1) * psrn1[0] + frac2 * psrn2[0]
    large = (frac1 + 1) * psrn1[0] + (frac2 + 1) * psrn2[0]
    minv = min(small, mid1, mid2, large)
    maxv = max(small, mid1, mid2, large)
    while True:
        rv = random.randint(0, 1)
        pw = random.randint(0, digits - 1)
        newdigits = 1
        b = digits
        y = random.randint(0, digits - 1)
        while True:
            if rv == 1:
                lowerbound = b - 1 - pw
            else:
                lowerbound = pw
            if y < lowerbound:
                # Success
                if rv == 1:
                    if minv >= 0:
                        sret = (minv + 1) * (digits ** newdigits) + pw
                    else:
                        sret = (maxv - 1) * (digits ** newdigits) - pw
                else:
                    if minv >= 0:
                        sret = minv * (digits ** newdigits) + pw
                    else:
                        sret = (maxv - 1) * (digits ** newdigits) + pw
                cpsrn = [1, 0, [0 for i in range(digitcount + newdigits)]]
                cpsrn[0] = -1 if sret < 0 else 1
                sret = abs(sret)
                for i in range(digitcount + newdigits):
                    idx = (digitcount + newdigits) - 1 - i
                    cpsrn[2][idx] = abs(sret) % digits
                    sret //= digits
                cpsrn[1] = abs(sret)
                return cpsrn
            elif y > lowerbound + 1:
                # Rejected
                break
            pw = pw * digits + random.randint(0, digits - 1)
            y = y * digits + random.randint(0, digits - 1)
            b *= digits
            newdigits += 1

def rayleigh(bern, s=1):
    k = 0
    # Choose a piece according to Rayleigh distribution function
    while True:
        # Conditional probability of each piece
        # is 1-exp(-(k*2+1)/(2*s**2))
        emparam = Fraction(k * 2 + 1, 2 * s * s)
        if bern.zero_or_one_exp_minus(emparam.numerator, emparam.denominator) == 0:
            break
        k += 1
    # In the chosen piece, sample (x+k)*exp(-(x+k)**2/(2*s*s))
    while True:
        y = 2 * s * s
        bag = []
        gb = lambda: bern.geometric_bag(bag)
        # Break exp into exp(-x**2/y) * exp(-k**2/y) * exp(-x*k*2/y) and sample.
        # Then divide bag by 2^piecebits and thus sample (x+k)/2**piecebits.
        # The rest of the PDF's piece is a normalization constant and doesn't
        # affect the result of the sampling
        ky = Fraction(k * k, y)
        if (
            bern.zero_or_one_exp_minus(ky.numerator, ky.denominator) == 1
            and exp_minus_x2y(bern, gb, Fraction(1) / y) == 1
            and exp_minus_xy(bern, gb, Fraction(k * 2) / y) == 1
            and sampleIntPlusBag(bern, bag, k) == 1
        ):
            # Accepted
            return bern.fill_geometric_bag(bag) + k

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
    return b.fill_geometric_bag(betadist_geobag(b, ax, ay, bx, by), precision)

def betadist_geobag(b, ax=1, ay=1, bx=1, by=1):
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
    afrac = Fraction(ax) if ay == 1 else Fraction(ax, ay)
    bfrac = Fraction(bx) if by == 1 else Fraction(bx, by)
    bpower = bfrac - 1
    apower = afrac - 1
    # Special case for a=b=1
    if bpower == 0 and apower == 0:
        return bag
    # Special case if a=1
    if apower == 0 and bpower < 0:
        return _power_of_uniform_greaterthan1_geobag(b, Fraction(by, bx), True)
    # Special case if b=1
    if bpower == 0 and apower < 0:
        return _power_of_uniform_greaterthan1_geobag(b, Fraction(ay, ax), False)
    if apower <= -1 or bpower <= -1:
        raise ValueError
    # Special case if a and b are integers
    if int(bpower) == bpower and int(apower) == apower:
        a = int(afrac)
        b = int(bfrac)
        return _urand_to_geobag(randomgen.RandomGen().kthsmallest_urand(a + b - 1, a))
    # Split a and b into two parts which are relatively trivial to simulate
    if bfrac > 2 and afrac > 2:
        bintpart = int(bfrac) - 1
        aintpart = int(afrac) - 1
        brest = bfrac - bintpart
        arest = afrac - aintpart
        # Generalized rejection method, p. 47
        while True:
            bag = betadist_geobag(b, aintpart, 1, bintpart, 1)
            gb = lambda: b.geometric_bag(bag)
            gbcomp = lambda: b.geometric_bag(bag) ^ 1
            if b.power(gbcomp, brest) == 1 and b.power(gb, arest) == 1:
                return bag
    # Create a "geometric bag" to hold a uniform random
    # number (U), described by Flajolet et al. 2010
    gb = lambda: b.geometric_bag(bag)
    # Complement of "geometric bag"
    gbcomp = lambda: b.geometric_bag(bag) ^ 1
    bp1 = lambda: (
        1 if b.power(gbcomp, bpower) == 1 and b.power(gb, apower) == 1 else 0
    )
    while True:
        # Create a uniform random number (U) bit-by-bit, and
        # accept it with probability U^(a-1)*(1-U)^(b-1), which
        # is the unnormalized PDF of the beta distribution
        bag.clear()
        if bp1() == 1:
            # Accepted
            return bag

if __name__ == "__main__":
    # The following code tests some of the methods in this module.

    import scipy.stats as st

    bern = bernoulli.Bernoulli()
    sample = [rayleigh(bern) for i in range(10000)]
    ks = st.kstest(sample, lambda x: st.rayleigh.cdf(x))
    if ks.pvalue < 1e-6:
        print("Kolmogorov-Smirnov results for rayleigh:")
        print(ks)

    def _readpsrn(asign, aint, afrac, digits=2, minprec=None):
        af = 0.0
        prec = len(afrac)
        if minprec != None:
            prec = max(minprec, prec)
        for i in range(prec):
            if i >= len(afrac):
                afrac.append(None)
            if afrac[i] == None:
                afrac[i] = random.randint(0, digits - 1)
            af += afrac[i] * digits ** (-i - 1)
        ret = af + aint
        if ret < 0:
            raise ValueError
        if asign < 0:
            ret = -ret
        return ret

    def _readpsrnend(asign, aint, afrac, digits=2, minprec=None):
        af = 0.0
        prec = len(afrac)
        if minprec != None:
            prec = max(minprec, prec)
        for i in range(prec):
            if i >= len(afrac):
                afrac.append(None)
            if afrac[i] == None:
                afrac[i] = random.randint(0, digits - 1)
            af += afrac[i] * digits ** (-i - 1)
        # Add endpoint
        af += 1 * digits ** (-(prec - 1) - 1)
        ret = af + aint
        if ret < 0:
            raise ValueError
        if asign < 0:
            ret = -ret
        return ret

    def _readpsrn2(psrn, digits=2, minprec=None):
        return _readpsrn(psrn[0], psrn[1], psrn[2], digits, minprec)

    def _readpsrnend2(psrn, digits=2, minprec=None):
        return _readpsrnend(psrn[0], psrn[1], psrn[2], digits, minprec)

    def random_psrn():
        asign = -1 if random.random() < 0.5 else 1
        aint = random.randint(0, 8)
        asize = random.randint(0, 8)
        afrac = [random.randint(0, 1) for i in range(asize)]
        return asign, aint, afrac

    for i in range(1000):
        ps, pi, pf = random_psrn()
        qs, qi, qf = random_psrn()
        pfc = [x for x in pf]
        qfc = [x for x in qf]
        p = _readpsrn(ps, pi, pf)
        p2 = _readpsrnend(ps, pi, pf)
        q = _readpsrn(qs, qi, qf)
        q2 = _readpsrnend(qs, qi, qf)
        mult = multiply_psrns([ps, pi, pf], [qs, qi, qf])
        ms, mi, mf = mult
        m = _readpsrn2(mult, minprec=32)
        mn = min(p * q, p2 * q, p * q2, p2 * q2)
        mx = max(p * q, p2 * q, p * q2, p2 * q2)
        if mn > mx:
            raise ValueError
        if m < mn or m > mx:
            print(["mult", p, q, mn, mx, m])
            raise ValueError
        if i < 10:
            sample1 = [
                random.uniform(p, p2) * random.uniform(q, q2) for _ in range(2000)
            ]
            sample2 = [
                _readpsrn2(
                    multiply_psrns(
                        [ps, pi, [x for x in pfc]], [qs, qi, [x for x in qfc]]
                    ),
                    minprec=32,
                )
                for _ in range(2000)
            ]
            ks = st.ks_2samp(sample1, sample2)
            if ks.pvalue < 1e-6:
                print(["mult", ks])
                print([sample1[0:10]])
                print([sample2[0:10]])

    def multiply_psrn_by_fraction_test(ps, pi, pf, frac, i=0):
        pfc = [x for x in pf]
        pfcs = str(pfc)
        p = _readpsrn(ps, pi, pf)
        p2 = _readpsrnend(ps, pi, pf)
        mult = multiply_psrn_by_fraction([ps, pi, pf], frac)
        q = float(frac)
        q2 = float(frac)
        ms, mi, mf = mult
        m = _readpsrn2(mult, minprec=32)
        mn = min(p * q, p2 * q, p * q2, p2 * q2)
        mx = max(p * q, p2 * q, p * q2, p2 * q2)
        if mn > mx:
            raise ValueError
        if m < mn or m > mx:
            print(["mult", p, q, mn, mx, "m", m])
            raise ValueError
        if i < 10:
            sample1 = [random.uniform(p, p2) * q for _ in range(2000)]
            sample2 = [
                _readpsrn2(
                    multiply_psrn_by_fraction([ps, pi, [x for x in pfc]], frac),
                    minprec=32,
                )
                for _ in range(2000)
            ]
            ks = st.ks_2samp(sample1, sample2)
            if str(pfc) != pfcs:
                raise ValueError
            if ks.pvalue < 1e-6:
                print(
                    "    multiply_psrn_by_fraction_test(%d,%d,%s, Fraction(%d,%d))"
                    % (ps, pi, pfc, frac.numerator, frac.denominator)
                )
                print(ks)
                print("    # p=%s p2=%s q=%s" % (p, p2, q))
                print("    # %s-%s" % (min(sample1), max(sample1)))
                print("    # %s-%s" % (min(sample2), max(sample2)))

    multiply_psrn_by_fraction_test(-1, 5, [0, 1, 0, 0, 0, 0, 1], Fraction(-7, 2))
    multiply_psrn_by_fraction_test(-1, 0, [0, 1, 0, 1, 1, 0, 0, 0], Fraction(-1, 4))
    multiply_psrn_by_fraction_test(1, 0, [0, 1, 1, 0, 1, 1], Fraction(7, 4))
    multiply_psrn_by_fraction_test(-1, 2, [1, 1, 0, 1, 0, 0, 1, 1], Fraction(7, 8))
    multiply_psrn_by_fraction_test(1, 1, [0], Fraction(-4, 1))
    multiply_psrn_by_fraction_test(1, 6, [1, 1, 1, 0, 0], Fraction(-1, 1))
    multiply_psrn_by_fraction_test(1, 1, [], Fraction(-2, 7))

    for i in range(1000):
        ps, pi, pf = random_psrn()
        frac = Fraction(random.randint(1, 9), random.randint(1, 9))
        if random.random() < 0.5:
            frac = -frac
        multiply_psrn_by_fraction_test(ps, pi, pf, frac, i)

    for i in range(1000):
        ps, pi, pf = random_psrn()
        qs, qi, qf = random_psrn()
        pfc = [x for x in pf]
        qfc = [x for x in qf]
        psrn1 = [ps, pi, pf]
        psrn2 = [qs, qi, qf]
        p = _readpsrn2(psrn1)
        p2 = _readpsrnend2(psrn1)
        q = _readpsrn2(psrn2)
        q2 = _readpsrnend2(psrn2)
        mult = add_psrns(psrn1, psrn2)
        ms, mi, mf = mult
        m = _readpsrn2([ms, mi, mf], minprec=32)
        mn = min(p + q, p2 + q, p + q2, p2 + q2)
        mx = max(p + q, p2 + q, p + q2, p2 + q2)
        if mn > mx:
            raise ValueError
        if m < mn or m > mx:
            print(["add", "p", p, p2, "q", q, q2, "m", mn, m, mx])
            print(["p1", psrn1])
            print(["p2", psrn2])
            raise ValueError
        if i < 1000:
            sample1 = [
                random.uniform(p, p2) + random.uniform(q, q2) for _ in range(2000)
            ]
            sample2 = [
                _readpsrn2(
                    add_psrns([ps, pi, [x for x in pfc]], [qs, qi, [x for x in qfc]]),
                    minprec=32,
                )
                for _ in range(2000)
            ]
            ks = st.ks_2samp(sample1, sample2)
            if ks.pvalue < 1e-6:
                print(
                    "    add_psrns_test(%d,%d,%s,%d,%d,%s)" % (ps, pi, pfc, qs, qi, qfc)
                )
                print("    # %s-%s" % (min(sample1), max(sample1)))
                print("    # %s-%s" % (min(sample2), max(sample2)))
