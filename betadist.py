import random
import bernoulli
import randomgen
import math
import interval
from interval import FInterval
from fractions import Fraction

def _verifyless(bag, pk, f, k, v):
    bagv = 0
    bagc = 0
    for i in range(len(bag)):
        if bag[i] == None:
            break
        bagv = (bagv << 1) | bag[i]
        bagc += 1
    bagf = f(bagv / (1 << bagc))
    vf = v / (1 << k)
    if vf > bagf:
        raise ValueError(
            str(
                [
                    "verifyless",
                    k,
                    v,
                    "bagv",
                    bagv,
                    bagv / (1 << bagc),
                    bagf,
                    vf,
                    pk,
                    int(bagf * (1 << k)),
                ]
            )
        )

def _verifygreater(bag, pk, f, k, v):
    bagv = 0
    bagc = 0
    for i in range(len(bag)):
        if bag[i] == None:
            break
        bagv = (bagv << 1) | bag[i]
        bagc += 1
    bagf = f(bagv / (1 << bagc))
    vf = v / (1 << k)
    if vf < bagf:
        raise ValueError(
            str(
                [
                    "verifygreater",
                    k,
                    v,
                    "bagv",
                    bagv,
                    bagv / (1 << bagc),
                    bagf,
                    vf,
                    pk,
                    int(bagf * (1 << k)),
                ]
            )
        )

def geobagcompare(bag, f):
    """ Returns 1 with probability f(U), where U is the value that
       the given geometric bag turns out to hold, or 0 otherwise.
       This method samples bits from the geometric bag as necessary.
     - b: Geometric bag, that is, an ordinary Python list
        that holds a list of bits from left to
        right starting with the bit immediately after the binary point.
        An item can contain the value None, which indicates an
        unsampled bit.
     - f: Function to run, which takes one parameter, namely a 'float'.
       Currently, this method assumes f is monotonic.
       Note that this may suffer rounding and other approximation
       errors as a result.  A more robust implementation would require
       the method to return an interval (as in interval arithmetic)
       or would pass the desired level of accuracy to the function given
       here, and would probably have the function use arbitrary-precision
       rational or floating-point numbers rather than the fixed-precision
       'float' type of Python, which usually has 53 bits of precision.
   """
    k = 1
    v = 0
    prec = 1 << k
    prectol = 1.0 / prec
    i = 0
    geobagv = 0
    for i in range(len(bag)):
        if bag[i] == None:
            bag[i] = random.randint(0, 1)
        geobagv = (geobagv << 1) | bag[i]
        i += 1
    lastfvstart = None
    lastfvend = None
    vnext = geobagv + 1
    iprec = 1 << i
    while True:
        while True:
            # print([lastfvstart,lastfvend])
            fvstart = lastfvstart if lastfvstart != None else f(geobagv / iprec)
            fvend = lastfvend if lastfvend != None else f(vnext / iprec)
            lastfvstart = fvstart
            lastfvend = fvend
            # NOTE: Assumes f is monotonic, so we don't check
            # if fvstart and fvend are the true min/max
            if abs(fvstart - fvend) <= 2 * prectol:
                # Within desired tolerance; calculate the
                # approximation
                pk = int(((fvstart + fvend) / 2) * prec)
                # Compare
                v = (v << 1) | random.randint(0, 1)
                if pk + 1 <= v:
                    return 0
                if pk - 2 >= v:
                    return 1
                k += 1
                prec = 1 << k
                prectol = 1.0 / prec
                break
            if i >= len(bag):
                bag.append(random.randint(0, 1))
                geobagv = (geobagv << 1) | bag[i]
                vnext = geobagv + 1
            lastfvstart = None
            lastfvend = None
            i += 1
            iprec = 1 << i

def _bern_power(bern, bag, num, den, bagfactory):
    if len(bag) >= 4 and bag[0] == 0 and bag[1] == 0 and bag[2] == 0 and bag[3] == 0:
        # If the geometric bag is known to hold a very small number, use
        # a different approach than the power Bernoulli factory, which converges
        # very slowly as the input number approaches 0, when num/den
        # is less than 1.
        # NOTE: Calculating "**(num/den)" requires floating-point arithmetic,
        # and so does geobagcompare, at the moment.
        # This is only a performance optimization.
        return geobagcompare(bag, lambda x: x ** (num / den))
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
            return 1 if psrn_less_than_rational(ret, x) else 0

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
            return 1 if psrn_less_than_rational(ret, x) else 0

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
            return 1 if psrn_less_than_rational(ret, n) else 0

def psrn_fill(psrn, digits=2, precision=53):
    af = 0
    afrac = psrn[2]
    asign = psrn[0]
    aint = psrn[1]
    if asign != -1 and asign != 1:
        raise ValueError
    for i in range(precision + 1):
        if i >= len(afrac):
            afrac.append(random.randint(0, digits - 1))
        if afrac[i] == None:
            afrac[i] = random.randint(0, digits - 1)
        af = af * digits + afrac[i]
    if af % digits >= digits - digits // 2:
        # round up
        return (
            asign
            * (((af // digits) + 1) + (aint * digits ** precision))
            / (digits ** precision)
        )
    else:
        return (
            asign
            * ((af // digits) + (aint * digits ** precision))
            / (digits ** precision)
        )

def psrn_complement(x):
    # NOTE: Assumes digits is 2
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
    psrn1len = len(psrn1[2])
    psrn2len = len(psrn2[2])
    while True:
        # Fill with next bit in a's uniform number
        while psrn1len <= index:
            psrn1[2].append(random.randint(0, 1))
            psrn1len += 1
        if psrn1[2][index] == None:
            psrn1[2][index] = random.randint(0, 1)
        # Fill with next bit in b's uniform number
        while psrn2len <= index:
            psrn2[2].append(random.randint(0, 1))
            psrn2len += 1
        if psrn2[2][index] == None:
            psrn2[2][index] = random.randint(0, 1)
        aa = psrn1[2][index]
        bb = psrn2[2][index]
        if aa < bb:
            return 1
        if aa > bb:
            return 0
        index += 1

def _sgn(x):
    if x > 0:
        return 1
    if x < 0:
        return -1
    return 0

def psrn_less_than_rational(psrn, rat):
    if psrn[0] < -1 or psrn[0] > 1 or psrn[1] == None:
        raise ValueError
    rat = rat if isinstance(rat, Fraction) else Fraction(rat)
    num = rat.numerator
    den = rat.denominator
    if num < 0 and den < 0:
        num = abs(num)
        den = abs(den)
    bs = -1 if num < 0 or den < 0 else 1
    num = abs(num)
    den = abs(den)
    bi = int(num // den)
    num = num - den * bi
    if _sgn(psrn[0]) != bs:
        return 1 if psrn[0] < 0 else 0
    if psrn[0] > 0:
        if psrn[1] < bi:
            return 1
        if psrn[1] > bi:
            return 0
    if psrn[0] < 0:
        if psrn[1] > bi:
            return 1
        if psrn[1] < bi:
            return 0
    if den == 0:
        raise ValueError
    if num == 0:
        # Is an integer
        return 0 if psrn[0] > 0 else 1
    pt = 2
    index = 0
    psrnlen = len(psrn[2])
    while True:
        # Fill with next bit in a's uniform number
        while psrnlen <= index:
            psrn[2].append(random.randint(0, 1))
            psrnlen += 1
        if psrn[2][index] == None:
            psrn[2][index] = random.randint(0, 1)
        d1 = psrn[2][index]
        c = 1 if num * pt >= den else 0
        d2 = int(num * pt / den)
        if d1 < d2:
            return 1 if psrn[0] > 0 else 0
        if d1 > d2:
            return 0 if psrn[0] > 0 else 1
        if c == 1:
            num = num * pt - den
            den *= pt
        if num == 0:
            return 0 if psrn[0] > 0 else 1
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
    if len(psrn2[2]) != digitcount:
        raise ValueError
    # Perform multiplication
    frac1 = psrn1[1]
    frac2 = psrn2[1]
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn1[2][i]
    for i in range(digitcount):
        frac2 = frac2 * digits + psrn2[2][i]
    if frac1 == 0 and frac2 == 0:
        while True:
            d1 = random.randint(0, digits - 1)
            d2 = random.randint(0, digits - 1)
            frac1 = frac1 * digits + d1
            frac2 = frac2 * digits + d2
            digitcount += 1
            if d1 != 0 or d2 != 0:
                break
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
    # Difference is expected to be a multiple of two
    if abs(maxv - minv) % 2 != 0:
        raise ValueError
    vs = [small, mid1, mid2, large]
    vs.sort()
    midmin = vs[1]
    midmax = vs[2]
    while True:
        rv = random.randint(0, maxv - minv - 1)
        if rv < 0:
            raise ValueError
        side = 0
        start = minv
        if rv < midmin - minv:
            # Left side of sum density; rising triangular
            side = 0
            start = minv
        elif rv >= midmax - minv:
            # Right side of sum density; falling triangular
            side = 1
            start = midmax
        else:
            # Middle, or uniform, part of sum density
            sret = minv + rv
            cpsrn = [1, 0, [0 for i in range(digitcount)]]
            if sret < 0:
                sret += 1
                cpsrn[0] = -1
            sret = abs(sret)
            for i in range(digitcount):
                cpsrn[2][digitcount - 1 - i] = sret % digits
                sret //= digits
            cpsrn[1] = sret
            return cpsrn
        if side == 0:  # Left side
            pw = rv
            b = midmin - minv
        else:
            pw = rv - (midmax - minv)
            b = maxv - midmax
        newdigits = 0
        y = random.randint(0, b - 1)
        while True:
            lowerbound = pw if side == 0 else b - 1 - pw
            if y < lowerbound:
                # Success
                sret = start * (digits ** newdigits) + pw
                cpsrn = [1, 0, [0 for i in range(digitcount + newdigits)]]
                if sret < 0:
                    sret += 1
                    cpsrn[0] = -1
                sret = abs(sret)
                for i in range(digitcount + newdigits):
                    idx = (digitcount + newdigits) - 1 - i
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

def add_psrn_and_fraction(psrn, fraction, digits=2):
    if psrn[0] == None or psrn[1] == None:
        raise ValueError
    fraction = Fraction(fraction)
    fracsign = -1 if fraction < 0 else 1
    absfrac = abs(fraction)
    origfrac = fraction
    isinteger = absfrac.denominator == 1
    # Special cases
    # positive+pos. integer or negative+neg. integer
    if ((fracsign < 0) == (psrn[0] < 0)) and isinteger and len(psrn[2]) == 0:
        return [fracsign, psrn[1] + int(absfrac), []]
    # PSRN has no fractional part, fraction is integer
    if (
        isinteger
        and psrn[0] == 1
        and psrn[1] == 0
        and len(psrn[2]) == 0
        and fracsign < 0
    ):
        return [fracsign, int(absfrac) - 1, []]
    if (
        isinteger
        and psrn[0] == 1
        and psrn[1] == 0
        and len(psrn[2]) == 0
        and fracsign > 0
    ):
        return [fracsign, int(absfrac), []]
    if fraction == 0:  # Special case of 0
        return [psrn[0], psrn[1], [x for x in psrn[2]]]
    # End special cases
    for i in range(len(psrn[2])):
        psrn[2][i] = random.randint(0, digits - 1) if psrn[2][i] == None else psrn[2][i]
    digitcount = len(psrn[2])
    # Perform addition
    frac1 = psrn[1]
    frac2 = int(absfrac)
    fraction = absfrac - frac2
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn[2][i]
    for i in range(digitcount):
        digit = int(fraction * digits)
        fraction = (fraction * digits) - digit
        frac2 = frac2 * digits + digit
    ddc = digits ** digitcount
    small = Fraction(frac1 * psrn[0], ddc) + origfrac
    large = Fraction((frac1 + 1) * psrn[0], ddc) + origfrac
    minv = min(small, large)
    maxv = max(small, large)
    while True:
        newdigits = 0
        b = 1
        ddc = digits ** digitcount
        mind = int(minv * ddc)
        maxd = int(maxv * ddc)
        rvstart = mind - 1 if minv < 0 else mind
        rvend = maxd if maxv < 0 else maxd + 1
        rv = random.randint(0, rvend - rvstart - 1)
        rvs = rv + rvstart
        if rvs >= rvend:
            raise ValueError
        while True:
            rvstartbound = mind if minv < 0 else mind + 1
            rvendbound = maxd - 1 if maxv < 0 else maxd
            if rvs > rvstartbound and rvs < rvendbound:
                sret = rvs
                cpsrn = [1, 0, [0 for i in range(digitcount + newdigits)]]
                if sret < 0:
                    sret += 1
                    cpsrn[0] = -1
                sret = abs(sret)
                for i in range(digitcount + newdigits):
                    idx = (digitcount + newdigits) - 1 - i
                    cpsrn[2][idx] = sret % digits
                    sret //= digits
                cpsrn[1] = sret
                return cpsrn
            elif rvs <= rvstartbound:
                rvd = Fraction(rvs + 1, ddc)
                if rvd <= minv:
                    # Rejected
                    break
                else:
                    # print(["rvd",rv+rvstart,float(rvd),float(minv)])
                    newdigits += 1
                    ddc *= digits
                    rvstart *= digits
                    rvend *= digits
                    mind = int(minv * ddc)
                    maxd = int(maxv * ddc)
                    rv = rv * digits + random.randint(0, digits - 1)
                    rvs = rv + rvstart
            else:
                rvd = Fraction(rvs, ddc)
                if rvd >= maxv:
                    # Rejected
                    break
                else:
                    newdigits += 1
                    ddc *= digits
                    rvstart *= digits
                    rvend *= digits
                    mind = int(minv * ddc)
                    maxd = int(maxv * ddc)
                    rv = rv * digits + random.randint(0, digits - 1)
                    rvs = rv + rvstart

def psrnexpo():
    count = 0
    while True:
        y1 = psrn_new_01()
        y = y1
        accept = True
        while True:
            z = psrn_new_01()
            if psrn_less(y, z) == 0:
                accept = not accept
                y = z
                continue
            break
        if accept:
            return [1, count, y1[2]]
        count += 1

class BinomialSampler:
    def __init__(self):
        self.logcache = {}
        self.binomialinfo = {}
        self.bits = 0
        self.curbit = -1

    def _logint(self, n, v):
        if not n in self.logcache:
            self.logcache[n] = [None, 0]
        c = self.logcache[n]
        if c[1] >= v and c[0] != None:
            return c[0]
        c[0] = FInterval(n).log(v)
        c[1] = v
        return c[0]

    def _randbit(self):
        if self.curbit == -1 or self.curbit >= 64:
            self.bits = random.randint(0, (1 << 64) - 1)
            self.curbit = 0
        r = self.bits & 1
        self.bits >>= 1
        self.curbit += 1
        return r

    def _roughSqrt(x):
        """ Returns a number m such that m is in the
        interval [sqrt(x), sqrt(x)+3].  This rough approximation
        suffices for the binomial sampler. """
        u = (x >> (x.bit_length() // 2)) + 2
        while True:
            v = (u + x // u) // 2
            if v == u:
                return v + 1
            u = v

    def sample(self, n):
        """ Draws a binomial(n, 1/2) random variate.
       Uses the rejection sampling approach from Bringmann et al.
       2014, but uses log binomial coefficients and in general, upper
       and lower bounds of logarithmic probabilities (to support very
       large values of n) together with the alternating series method
       and rational interval arithmetic (rather than floating-point arithmetic).

       Reference:
       K. Bringmann, F. Kuhn, et al., “Internal DLA: Efficient Simulation of
       a Physical Growth Model.” In: _Proc. 41st International
       Colloquium on Automata, Languages, and Programming (ICALP'14)_, 2014.
    """
        if n == 0:
            return 0
        if n % 2 == 1:
            return self.randbit() + self.sample(n - 1)
        n2 = n
        ret = 0
        if n2 % 2 == 1:
            ret += random.randint(0, 1)
            n2 -= 1
            if n2 == 0:
                return ret
        if not n2 in self.binomialinfo:
            bm = BinomialSampler._roughSqrt(n2)
            bi = [bm, {}]
            self.binomialinfo[n2] = bi
        halfn = n2 // 2
        m = self.binomialinfo[n2][0]
        bincos = self.binomialinfo[n2][1]
        while True:
            pos = self._randbit() == 0
            k = 0
            while self._randbit() == 0:
                k += 1
            r = k * m + random.randint(0, m - 1)
            rv = halfn + r if pos else halfn - r - 1
            if rv >= 0 and rv <= n2:
                psrn = psrnexpo()
                psrn[0] = -1  # Turn the PSRN negative
                success = 0
                if not (rv in bincos):
                    bincos[rv] = [None, 4]
                if bincos[rv][0] == None:
                    # Calculate log of acceptance probability on demand
                    v = 4
                    bincos[rv][0] = (
                        interval.logbinco(n2, rv, v)
                        + self._logint(m, v)
                        + self._logint(2, v) * (k - (n2 + 2))
                    ).truncate()
                    # print([rv,v,bincos[rv][0]])
                    bincos[rv][1] = v
                while True:
                    if psrn_less_than_rational(psrn, bincos[rv][0].inf) == 1:
                        # Less than log of acceptance probability
                        success = 1
                        break
                    if psrn_less_than_rational(psrn, bincos[rv][0].sup) == 0:
                        # Greater than log of acceptance probability
                        success = 0
                        break
                    # Calculate more precise bounds for the log of acceptance probability
                    bincos[rv][1] += 2
                    v = bincos[rv][1]
                    bc = (
                        interval.logbinco(n2, rv, v)
                        + self._logint(m, v)
                        + self._logint(2, v) * (k - (n2 + 2))
                    ).truncate()
                    bincos[rv][0] = bc
                if success:
                    return rv

def rayleighpsrn(bern, s=1):
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
            return [1, k, bag]

def genshape(inshape):
    """ Generates a random point inside a 2-dimensional shape, in the form of a uniform PSRN.
         inshape is a function that takes three parameters (x, y, s) and
         returns 1 if the box (x/s,y/s,(x+1)/s,(y+1)/s) is fully in the shape;
         -1 if not; and 0 if partially. """
    psrnx = psrn_new_01()
    psrny = psrn_new_01()
    base = 2
    while True:
        s = base
        cx = 0
        cy = 0
        d = 1
        while True:
            cx = cx * base + random.randint(0, base - 1)
            cy = cy * base + random.randint(0, base - 1)
            el = inshape(cx, cy, s)
            if el > 0:
                psrnx[2] = [0 for i in range(d)]
                psrny[2] = [0 for i in range(d)]
                for i in range(d):
                    psrnx[2][d - 1 - i] = cx % base
                    cx //= base
                    psrny[2][d - 1 - i] = cy % base
                    cy //= base
                psrnx[0] = -1 if random.randint(0, 1) == 0 else 1
                psrny[0] = -1 if random.randint(0, 1) == 0 else 1
                return [psrnx, psrny]
            elif el < 0:
                break
            else:
                s *= base
                d += 1

class ShapeSampler:
    def __init__(self, inshape):
        """ Builds a sampler for random numbers (in the form of PSRNs) on or inside a 2-dimensional shape.
       inshape is a function that takes three parameters (x, y, s) and
       returns 1 if the box (x/s,y/s,(x+1)/s,(y+1)/s) is fully in the shape;
       -1 if not; and 0 if partially.
       """
        self.yeses = []
        self.maybes = []
        self.base = 2
        self.k = 4
        self.inshape = inshape
        s = self.base ** self.k
        for x in range(s):
            for y in range(s):
                v = inshape(x, y, s)
                if v == 1:
                    self.yeses.append([x, y])
                if v == 0:
                    self.maybes.append([x, y])

    def sample(self):
        """ Generates a random point inside the shape, in the form of a uniform PSRN. """
        psrnx = psrn_new_01()
        psrny = psrn_new_01()
        done = False
        d = 1
        while not done:
            s = self.base
            cx = 0
            cy = 0
            box = random.randint(0, len(self.yeses) + len(self.maybes) - 1)
            d = self.k
            if box < len(self.yeses):
                cx = self.yeses[box][0]
                cy = self.yeses[box][1]
                s = self.base ** self.k
                break
            else:
                box -= len(self.yeses)
                cx = self.maybes[box][0]
                cy = self.maybes[box][1]
                s = self.base ** (self.k + 1)
                d += 1
            while True:
                cx = cx * self.base + random.randint(0, self.base - 1)
                cy = cy * self.base + random.randint(0, self.base - 1)
                el = self.inshape(cx, cy, s)
                if el > 0:
                    done = True
                    break
                elif el < 0:
                    break
                else:
                    s *= self.base
                    d += 1
        psrnx[2] = [0 for i in range(d)]
        psrny[2] = [0 for i in range(d)]
        for i in range(d):
            psrnx[2][d - 1 - i] = cx % self.base
            cx //= self.base
            psrny[2][d - 1 - i] = cy % self.base
            cy //= self.base
        psrnx[0] = -1 if random.randint(0, 1) == 0 else 1
        psrny[0] = -1 if random.randint(0, 1) == 0 else 1
        return [psrnx, psrny]

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
        ret = [1, 0, ret]
        w = ret
        k = 1
        while True:
            u = psrn_new_01()
            if psrn_less(w, u):
                if (k & 1) == 1:
                    return psrn_fill(ret, precision=precision)
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
    import math

    bern = bernoulli.Bernoulli()
    sample = [rayleigh(bern) for i in range(10000)]
    ks = st.kstest(sample, lambda x: st.rayleigh.cdf(x))
    if ks.pvalue < 1e-6:
        print("Kolmogorov-Smirnov results for rayleigh:")
        print(ks)

    def _readpsrn(asign, aint, afrac, digits=2, minprec=None):
        af = 0.0
        prec = len(afrac)
        if asign != -1 and asign != 1:
            raise ValueError
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
        if asign != -1 and asign != 1:
            raise ValueError
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

    def random_psrn(digits=2):
        asign = -1 if random.random() < 0.5 else 1
        aint = random.randint(0, 8)
        asize = random.randint(0, 8)
        afrac = [random.randint(0, digits - 1) for i in range(asize)]
        return asign, aint, afrac

    def dobucket(v, bounds=None):
        a = Fraction(min(v))
        b = Fraction(max(v))
        if bounds != None:
            a, b = bounds
        size = int(max(30, math.ceil(b - a)))
        allints = True
        if size == 30:
            for x in v:
                if int(x) != x:
                    allints = False
                    break
            if allints:
                size = int(b - a)
        else:
            allints = False
        if allints:
            ls = [int(a + (b - a) * x / size) for x in range(size + 1)]
        else:
            ls = [a + (b - a) * (x / size) for x in range(size + 1)]
        buckets = [0 for i in range(size)]
        for x in v:
            for i in range(len(buckets)):
                if x >= ls[i] and x < ls[i + 1]:
                    buckets[i] += 1
                    break
        showbuckets(ls, buckets)
        return buckets

    def showbuckets(ls, buckets):
        mx = max(0.00000001, max(buckets))
        sumbuckets = max(0.00000001, sum(buckets))
        if mx == 0:
            return
        labels = [
            ("%0.5f %d [%f]" % (ls[i], buckets[i], buckets[i] * 1.0 / sumbuckets))
            if int(buckets[i]) == buckets[i]
            else ("%0.5f %f [%f]" % (ls[i], buckets[i], buckets[i] * 1.0 / sumbuckets))
            for i in range(len(buckets))
        ]
        maxlen = max([len(x) for x in labels])
        i = 0
        while i < (len(buckets)):
            print(
                labels[i]
                + " " * (1 + (maxlen - len(labels[i])))
                + ("*" * int(buckets[i] * 40 / mx))
            )
            if (
                buckets[i] == 0
                and i + 2 < len(buckets)
                and buckets[i + 1] == 0
                and buckets[i + 2] == 0
            ):
                print(" ... ")
                while (
                    buckets[i] == 0
                    and i + 2 < len(buckets)
                    and buckets[i + 1] == 0
                    and buckets[i + 2] == 0
                ):
                    i += 1
            i += 1

    def _rp(a, digits=2):
        if a == None:
            return 0
        return _readpsrn2(a, minprec=32, digits=digits)

    def add_psrn_and_fraction_test(ps, pi, pf, frac, i=0, digits=2):
        pfc = [x for x in pf]
        pfcs = str(pfc)
        p = _readpsrn(ps, pi, pf, digits=digits)
        p2 = _readpsrnend(ps, pi, pf, digits=digits)
        mult = add_psrn_and_fraction([ps, pi, pf], frac, digits=digits)
        if mult == None:
            print(
                "    add_psrn_and_fraction_test(%d,%d,%s, Fraction(%d,%d)) # No mult"
                % (ps, pi, pfc, frac.numerator, frac.denominator)
            )
            return
        q = float(frac)
        q2 = float(frac)
        ms, mi, mf = mult
        m = _readpsrn2(mult, minprec=32, digits=digits)
        mn = min(p + q, p2 + q, p + q2, p2 + q2)
        mx = max(p + q, p2 + q, p + q2, p2 + q2)
        if mn > mx:
            raise ValueError
        if m < mn or m > mx:
            print("    # %s" % str(["add", p, q, mn, mx, "m", m]))
            print(
                "    add_psrn_and_fraction_test(%d,%d,%s, Fraction(%d,%d),digits=%d) # Out of range"
                % (ps, pi, pfc, frac.numerator, frac.denominator, digits)
            )
            return
        if i < 10:
            sample1 = [random.uniform(p, p2) + q for _ in range(2000)]
            sample2 = [
                _rp(
                    add_psrn_and_fraction(
                        [ps, pi, [x for x in pfc]], frac, digits=digits
                    ),
                    digits=digits,
                )
                for _ in range(2000)
            ]
            ks = st.ks_2samp(sample1, sample2)
            if str(pfc) != pfcs:
                raise ValueError
            if ks.pvalue < 1e-6:
                print(
                    "    add_psrn_and_fraction_test(%d,%d,%s, Fraction(%d,%d),digits=%d)"
                    % (ps, pi, pfc, frac.numerator, frac.denominator, digits)
                )
                print("    # %s - %s" % (mn, mx))
                print("    # exp. range about %s - %s" % (min(sample1), max(sample1)))
                print("    # act. range about %s - %s" % (min(sample2), max(sample2)))
                dobucket(sample1)
                dobucket(sample2)

    def multiply_psrn_by_fraction_test(ps, pi, pf, frac, i=0, digits=2):
        pfc = [x for x in pf]
        pfcs = str(pfc)
        p = _readpsrn(ps, pi, pf, digits=digits)
        p2 = _readpsrnend(ps, pi, pf, digits=digits)
        mult = multiply_psrn_by_fraction([ps, pi, pf], frac, digits=digits)
        q = float(frac)
        q2 = float(frac)
        ms, mi, mf = mult
        m = _readpsrn2(mult, minprec=32, digits=digits)
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
                    multiply_psrn_by_fraction(
                        [ps, pi, [x for x in pfc]], frac, digits=digits
                    ),
                    minprec=32,
                    digits=digits,
                )
                for _ in range(2000)
            ]
            ks = st.ks_2samp(sample1, sample2)
            if str(pfc) != pfcs:
                raise ValueError
            if ks.pvalue < 1e-6:
                print(
                    "    multiply_psrn_by_fraction_test(%d,%d,%s, Fraction(%d,%d),digits=%d)"
                    % (ps, pi, pfc, frac.numerator, frac.denominator, digits)
                )
                print(ks)
                print("    # p=%s p2=%s q=%s" % (p, p2, q))
                print("    # %s - %s" % (min(sample1), max(sample1)))
                print("    # %s - %s" % (min(sample2), max(sample2)))

    def add_psrns_test(ps, pi, pf, qs, qi, qf, i=0, digits=2):
        pfc = [x for x in pf]
        qfc = [x for x in qf]
        psrn1 = [ps, pi, pf]
        psrn2 = [qs, qi, qf]
        p = _readpsrn2(psrn1, digits=digits)
        p2 = _readpsrnend2(psrn1, digits=digits)
        q = _readpsrn2(psrn2, digits=digits)
        q2 = _readpsrnend2(psrn2, digits=digits)
        mult = add_psrns(psrn1, psrn2, digits=digits)
        ms, mi, mf = mult
        m = _readpsrn2([ms, mi, mf], minprec=32, digits=digits)
        mn = min(p + q, p2 + q, p + q2, p2 + q2)
        mx = max(p + q, p2 + q, p + q2, p2 + q2)
        if mn > mx:
            raise ValueError
        if m < mn or m > mx:
            print(
                "    add_psrns_test(%d,%d,%s,%d,%d,%s,digits=%d)"
                % (ps, pi, pfc, qs, qi, qfc, digits)
            )
            return
        if i < 50:
            sample1 = [
                random.uniform(p, p2) + random.uniform(q, q2) for _ in range(2000)
            ]
            sample2 = [
                _readpsrn2(
                    add_psrns(
                        [ps, pi, [x for x in pfc]],
                        [qs, qi, [x for x in qfc]],
                        digits=digits,
                    ),
                    minprec=32,
                    digits=digits,
                )
                for _ in range(2000)
            ]
            ks = st.ks_2samp(sample1, sample2)
            if ks.pvalue < 1e-6:
                print(
                    "    add_psrns_test(%d,%d,%s,%d,%d,%s,digits=%d)"
                    % (ps, pi, pfc, qs, qi, qfc, digits)
                )
                print("    # %s - %s" % (mn, mx))
                print("    # exp. range about %s - %s" % (min(sample1), max(sample1)))
                print("    # act. range about %s - %s" % (min(sample2), max(sample2)))
                dobucket(sample1)
                dobucket(sample2)

    def multiply_psrns_test(ps, pi, pf, qs, qi, qf, i=0, digits=2):
        pfc = [x for x in pf]
        qfc = [x for x in qf]
        psrn1 = [ps, pi, pf]
        psrn2 = [qs, qi, qf]
        p = _readpsrn2(psrn1, digits=digits)
        p2 = _readpsrnend2(psrn1, digits=digits)
        q = _readpsrn2(psrn2, digits=digits)
        q2 = _readpsrnend2(psrn2, digits=digits)
        mult = multiply_psrns(psrn1, psrn2, digits=digits)
        if mult == None:
            print(
                "    multiply_psrns(%d,%d,%s,%d,%d,%s,digits=%d)"
                % (ps, pi, pfc, qs, qi, qfc, digits)
            )
            return
        ms, mi, mf = mult
        m = _readpsrn2([ms, mi, mf], minprec=32, digits=digits)
        mn = min(p * q, p2 * q, p * q2, p2 * q2)
        mx = max(p * q, p2 * q, p * q2, p2 * q2)
        if mn > mx:
            raise ValueError
        if m < mn or m > mx:
            print(["mult", "p", p, p2, "q", q, q2, "m", mn, m, mx])
            print(["p1", psrn1])
            print(["p2", psrn2])
            raise ValueError
        if i < 100:
            sample1 = [
                random.uniform(p, p2) * random.uniform(q, q2) for _ in range(2000)
            ]
            sample2 = [
                _rp(
                    multiply_psrns(
                        [ps, pi, [x for x in pfc]],
                        [qs, qi, [x for x in qfc]],
                        digits=digits,
                    ),
                    digits=digits,
                )
                for _ in range(2000)
            ]
            ks = st.ks_2samp(sample1, sample2)
            if ks.pvalue < 1e-6:
                print(
                    "    multiply_psrns_test(%d,%d,%s,%d,%d,%s,digits=%d)"
                    % (ps, pi, pfc, qs, qi, qfc, digits)
                )
                print("    # %s - %s" % (mn, mx))
                print("    # exp. range about %s - %s" % (min(sample1), max(sample1)))
                print("    # act. range about %s - %s" % (min(sample2), max(sample2)))
                dobucket(sample1)
                dobucket(sample2)

    def _cloneread(p, digits=2):
        p = [p[0], p[1], [x for x in p[2]]]
        return _readpsrn2(p, minprec=32, digits=digits)

    sample1 = []
    sample2 = []
    for i in range(3000):
        digits = 2
        ps = [1, 0, []]
        ps2 = multiply_psrn_by_fraction(ps, 82.4)
        ps2 = multiply_psrn_by_fraction(ps2, (73.2 / 82.4))
        ps2 = multiply_psrn_by_fraction(ps2, 28.7 / 73.2)
        m1 = _readpsrn2(ps2, minprec=32, digits=digits)
        mx = random.random()
        m2 = mx * 28.7
        sample1.append(m1)
        sample2.append(m2)

    ks = st.ks_2samp(sample1, sample2)
    if ks.pvalue < 1e-6:
        print(ks)
        print("    # exp. range about %s - %s" % (min(sample1), max(sample1)))
        print("    # act. range about %s - %s" % (min(sample2), max(sample2)))
        dobucket(sample1)
        dobucket(sample2)

    add_psrn_and_fraction_test(1, 0, [], Fraction(-1, 1), digits=2)
    add_psrn_and_fraction_test(1, 0, [], Fraction(-1, 1), digits=10)
    add_psrn_and_fraction_test(1, 0, [], Fraction(-2, 1), digits=2)
    add_psrn_and_fraction_test(1, 0, [], Fraction(-2, 1), digits=10)

    for digits in [2, 3, 10, 5, 16]:
        for i in range(1000):
            ps, pi, pf = random_psrn(digits=digits)
            frac = Fraction(random.randint(1, 9), random.randint(1, 9))
            if random.random() < 0.5:
                frac = -frac
            add_psrn_and_fraction_test(ps, pi, pf, frac, i, digits=digits)

        add_psrns_test(1, 1, [0], -1, 1, [0, 0, 1], digits=digits)
        # Specific tests with output ranges that straddle zero
        add_psrns_test(-1, 8, [1, 0, 0], 1, 8, [1, 0, 0], digits=digits)
        add_psrns_test(-1, 6, [1], 1, 6, [], digits=digits)
        add_psrns_test(-1, 7, [], 1, 7, [0], digits=digits)
        add_psrns_test(-1, 5, [1, 1], 1, 5, [], digits=digits)
        add_psrns_test(1, 5, [0], -1, 5, [], digits=digits)
        add_psrns_test(1, 2, [1, 0], -1, 2, [1], digits=digits)
        add_psrns_test(-1, 4, [], 1, 4, [], digits=digits)
        add_psrns_test(1, 4, [1, 0], -1, 4, [], digits=digits)
        add_psrns_test(-1, 7, [], 1, 7, [1], digits=digits)

        for i in range(1000):
            ps, pi, pf = random_psrn(digits=digits)
            qs, qi, qf = random_psrn(digits=digits)
            add_psrns_test(ps, pi, pf, qs, qi, qf, i, digits=digits)

        for i in range(1000):
            ps, pi, pf = random_psrn(digits=digits)
            qs, qi, qf = random_psrn(digits=digits)
            multiply_psrns_test(ps, pi, pf, qs, qi, qf, i, digits=digits)

        multiply_psrn_by_fraction_test(
            -1, 5, [0, 1, 0, 0, 0, 0, 1], Fraction(-7, 2), digits=digits
        )
        multiply_psrn_by_fraction_test(
            -1, 0, [0, 1, 0, 1, 1, 0, 0, 0], Fraction(-1, 4), digits=digits
        )
        multiply_psrn_by_fraction_test(
            1, 0, [0, 1, 1, 0, 1, 1], Fraction(7, 4), digits=digits
        )
        multiply_psrn_by_fraction_test(
            -1, 2, [1, 1, 0, 1, 0, 0, 1, 1], Fraction(7, 8), digits=digits
        )
        multiply_psrn_by_fraction_test(1, 1, [0], Fraction(-4, 1), digits=digits)
        multiply_psrn_by_fraction_test(
            1, 6, [1, 1, 1, 0, 0], Fraction(-1, 1), digits=digits
        )
        multiply_psrn_by_fraction_test(1, 1, [], Fraction(-2, 7), digits=digits)

        multiply_psrns_test(-1, 0, [], -1, 0, [], digits=digits)
        multiply_psrns_test(-1, 0, [0], -1, 0, [], digits=digits)
        multiply_psrns_test(-1, 0, [], -1, 0, [0], digits=digits)
        multiply_psrns_test(-1, 0, [0], -1, 0, [0], digits=digits)
        multiply_psrns_test(-1, 0, [0, 0], -1, 0, [0], digits=digits)
        multiply_psrns_test(-1, 0, [0], -1, 0, [0, 0], digits=digits)
        multiply_psrns_test(-1, 0, [0, 0], -1, 0, [0, 0], digits=digits)

        for i in range(1000):
            ps, pi, pf = random_psrn(digits=digits)
            frac = Fraction(random.randint(1, 9), random.randint(1, 9))
            if random.random() < 0.5:
                frac = -frac
            multiply_psrn_by_fraction_test(ps, pi, pf, frac, i, digits=digits)

        add_psrn_and_fraction_test(
            -1, 5, [0, 1, 0, 1, 0, 0, 0, 0], Fraction(-2, 3), digits=digits
        )
        add_psrn_and_fraction_test(-1, 8, [], Fraction(7, 4), digits=digits)
        add_psrn_and_fraction_test(
            1, 0, [1, 1, 1, 1, 0, 0, 0, 1], Fraction(-6, 7), digits=digits
        )
        add_psrn_and_fraction_test(
            -1, 2, [0, 0, 0, 0, 1, 0], Fraction(1, 3), digits=digits
        )
        add_psrn_and_fraction_test(
            -1, 0, [0, 1, 0, 0, 1, 0], Fraction(4, 9), digits=digits
        )

        add_psrn_and_fraction_test(-1, 0, [0, 1, 0, 1], Fraction(-9, 5), digits=digits)
        add_psrn_and_fraction_test(
            1, 1, [0, 0, 1, 0, 1, 1], Fraction(-3, 7), digits=digits
        )
        add_psrn_and_fraction_test(1, 4, [], Fraction(1, 2), digits=digits)
        add_psrn_and_fraction_test(1, 1, [], Fraction(-9, 2), digits=digits)
        add_psrn_and_fraction_test(1, 6, [], Fraction(7, 3), digits=digits)
        add_psrn_and_fraction_test(
            1, 5, [0, 0, 0, 0, 1, 1], Fraction(1, 3), digits=digits
        )
        add_psrn_and_fraction_test(-1, 4, [], Fraction(-9, 8), digits=digits)
