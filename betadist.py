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

def _add_neg_power_of_base(psrn, pwr, digits=2, treat_as_abs=False):
    """ Adds digits^(-pwr) to a PSRN. """
    if pwr <= 0:
        psrn[1] += 1 << (-pwr)
        return psrn
    i = pwr - 1
    incr = -1 if psrn[0] < 0 and not treat_as_abs else 1
    while i >= 0:
        psrn[2][i] += incr
        if psrn[2][i] < 0:
            psrn[2][i] += digits
        elif psrn[2][i] >= digits:
            psrn[2][i] -= digits
        else:
            return psrn
        i -= 1
    psrn[1] += incr
    return psrn

def multiply_psrns(psrn1, psrn2, digits=2):
    """ Multiplies two partially-sampled random numbers.
        psrn1: List containing the sign, integer part, and fractional part
            of the first PSRN.  Fractional part is a list of digits
            after the point, starting with the first.
        psrn1: List containing the sign, integer part, and fractional part
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
                lowerbound = pw
                upperbound = pw + 1
                if y < lowerbound:
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
                elif y > upperbound:
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
            # print(["bounds",(b-1-0,(b-1-0)+1),(b-1-1,(b-1-1)+1),(b-1-2,(b-1-2)+1)])
            y = random.randint(0, b - 1)
            while True:
                lowerbound = b - 1 - pw
                upperbound = (b - 1 - pw) + 1
                # if rv==midmax-small:
                #   print([newdigits, y,"pw",pw,"b",b,lowerbound,upperbound])
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
                elif y > upperbound:
                    # Rejected
                    break
                d = random.randint(0, digits - 1)
                y = y * digits + random.randint(0, digits - 1)
                pw = pw * digits + d
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

def add_psrns(psrn1, psrn2, digits=2):
    """ Adds two partially-sampled random numbers.
        psrn1: List containing the sign, integer part, and fractional part
            of the first PSRN.  Fractional part is a list of digits
            after the point, starting with the first.
        psrn1: List containing the sign, integer part, and fractional part
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
    cpsrn = [1, 0, [0 for i in range(digitcount)]]
    while True:
        rv = random.randint(0, 1)
        success = False
        extradigits = []
        if rv == 0:
            # Left side of sum density; rising triangular
            pw = rv
            newdigits = 0
            b = 1
            y = random.randint(0, b - 1)
            while True:
                lowerbound = pw
                upperbound = pw + 1
                if y < lowerbound:
                    # Success
                    sret = minv * (digits ** newdigits) + pw
                    cpsrn[0] = -1 if sret < 0 else 1
                    sret = abs(sret)
                    for i in range(digitcount + newdigits):
                        idx = (digitcount + newdigits) - 1 - i
                        while idx >= len(cpsrn[2]):
                            cpsrn[2].append(None)
                        cpsrn[2][idx] = abs(sret) % digits
                        sret //= digits
                    cpsrn[1] = abs(sret)
                    return cpsrn
                elif y > upperbound:
                    # Rejected
                    break
                pw = pw * digits + random.randint(0, digits - 1)
                y = y * digits + random.randint(0, digits - 1)
                b *= digits
                newdigits += 1
        elif rv == 1:
            # Right side of sum density; falling triangular
            pw = 0
            newdigits = 0
            b = 1
            px = []
            y = random.randint(0, b - 1)
            while True:
                lowerbound = b - 1 - pw
                upperbound = (b - 1 - pw) + 1
                if y < lowerbound:
                    # Success
                    # TODO: When PSRN to be returned is negative, success is reached
                    # at the wrong occasions; fix this
                    sret = (minv + 1) * (digits ** newdigits) + pw
                    cpsrn[0] = -1 if sret < 0 else 1
                    sret = abs(sret)
                    for i in range(digitcount + newdigits):
                        idx = (digitcount + newdigits) - 1 - i
                        while idx >= len(cpsrn[2]):
                            cpsrn[2].append(None)
                        cpsrn[2][idx] = sret % digits
                        sret //= digits
                    cpsrn[1] = abs(sret)
                    return cpsrn
                elif y > upperbound:
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
