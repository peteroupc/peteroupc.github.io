import randomgen
import betadist
from betadist import *
from betadist import _RGConv

def truncated_gamma(rg, bern, ax, ay, precision=53):
    # Văduva's gamma generator truncated to [0, 1],
    # when ax/ay is in (0, 1].  Described in Devroye 1986, p. 180.
    while True:
        ret = _power_of_uniform_greaterthan1_geobag(bern, Fraction(ay, ax))
        w = ret
        k = 1
        while True:
            u = psrn_new_01()
            if psrn_less(rg, w, u):
                if (k & 1) == 1:
                    return psrn_fill(rg, ret, precision=precision)
                break
            w = u
            k += 1

def forsythe_prob2(rg, x):
    # Returns 1 with probability x*exp(1-x), where x is in [0, 1].
    # Implemented with the help of Theorem IV.2.1(iii) given in
    # Non-Uniform Random Variate Generation.
    while True:
        # 1 minus maximum of two uniform(0,1) random numbers, or beta(2,1).pdf(x)
        ret1 = psrn_new_01()
        ret2 = psrn_new_01()
        ret = None
        if psrn_less(rg, ret1, ret2):
            ret = psrn_complement(ret2)
        else:
            ret = psrn_complement(ret1)
        k = 1
        u = ret
        while True:
            v = psrn_new_01()
            if psrn_less(rg, u, v) == 1:
                break
            k += 1
            u = v
        if k % 2 == 1:
            return 1 if psrn_less_than_fraction(rg, ret, x) == 1 else 0

def forsythe_prob3(rg, x):
    # Returns 1 with probability erf(x)/erf(1), where x is in [0, 1].
    # Implemented with the help of Theorem IV.2.1(iii) given in
    # Non-Uniform Random Variate Generation.
    while True:
        # Uniform(0,1) random number
        ret = psrn_new_01()
        k = 1
        u = ret
        while True:
            # Generate v as the maximum of two uniform(0,1) random numbers, or beta(2,1).pdf(x)
            ret1 = psrn_new_01()
            ret2 = psrn_new_01()
            v = ret2 if psrn_less(rg, ret1, ret2) == 1 else ret1
            if psrn_less(rg, u, v) == 1:
                break
            k += 1
            u = v
        if k % 2 == 1:
            return 1 if psrn_less_than_fraction(rg, ret, x) == 1 else 0

def forsythe_prob(rg, m, n):
    # Returns 1 with probability gamma(m,n)/gamma(m,1),
    # where gamma(.) is the lower incomplete gamma function.
    # Implemented with the help of Theorem IV.2.1(iii) given in
    # Non-Uniform Random Variate Generation.
    randgen = randomgen.RandomGen(_RGConv(rg))
    while True:
        # Maximum of m uniform(0,1) random numbers, or beta(m,1)
        ret = randgen.kthsmallest_psrn(m, m)
        k = 1
        u = ret
        while True:
            v = psrn_new_01()
            if psrn_less(rg, u, v):
                break
            k += 1
            u = v
        if k % 2 == 1:
            return 1 if psrn_less_than_fraction(rg, ret, n) == 1 else 0

def exp_minus_x2y(rg, f, y, pwr=2):
    """ B(x) -> B(exp(-x*x*y)) """
    if y > 1:
        fl = int(y)
        fr = y - fl
        for i in range(fl):
            if exp_minus_x2y(rg, f, 1) == 0:
                return 0
        if fr == 0:
            return 1
        y = fr
    u = Fraction(1)
    l = Fraction(0)
    uw = 1
    bag = psrn_new_01()
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
        if psrn_less_than_fraction(rg, bag, l) == 1:
            return 1
        if psrn_less_than_fraction(rg, bag, u) == 0:
            return 0
        n += 1
        fac *= n
        y *= uy

def exp_minus_xy(rg, f, y):
    """ B(x) -> B(exp(-x*y)) """
    if y > 1:
        fl = int(y)
        fr = y - fl
        for i in range(fl):
            if exp_minus_xy(rg, f, 1) == 0:
                return 0
        if fr == 0:
            return 1
        y = fr
    u = Fraction(1)
    l = Fraction(0)
    uw = 1
    bag = psrn_new_01()
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
        if psrn_less_than_fraction(rg, bag, l) == 1:
            return 1
        if psrn_less_than_fraction(rg, bag, u) == 0:
            return 0
        n += 1
        fac *= n
        y *= uy

def sampleIntPlusBag(rg, psrn, k):
    """ Return 1 with probability (x+k)/2^bitlength(k).
         Ignores PSRN's integer part and sign. """
    bitLength = k.bit_length()
    r = 0
    c = 0
    sample = 0
    while rg.randbit() == 0:
        r += 1
    if r < bitLength:
        # Integer part, namely k
        return (k >> (bitLength - 1 - r)) & 1
    else:
        # Fractional part, namely the bag
        r -= bitLength
        while len(psrn[2]) <= r:
            psrn[2].append(None)
        if psrn[2][r] == None:
            psrn[2][r] = rg.randbit()
        return psrn[2][r]

def rayleighpsrn(rg, s=1):
    k = 0
    rndgen = randomgen.RandomGen(_RGConv(rg))
    # Choose a piece according to Rayleigh distribution function
    while True:
        # Conditional probability of each piece
        # is 1-exp(-(k*2+1)/(2*s**2))
        emparam = Fraction(k * 2 + 1, 2 * s * s)
        if rndgen.zero_or_one_exp_minus(emparam.numerator, emparam.denominator) == 0:
            break
        k += 1
    # In the chosen piece, sample (x+k)*exp(-(x+k)**2/(2*s*s))
    while True:
        y = 2 * s * s
        ky = Fraction(k * k, y)
        bag = psrn_new_01()
        gb = lambda: psrn_less(rg, psrn_new_01(), bag)
        # continue
        # Break exp into exp(-x**2/y) * exp(-k**2/y) * exp(-x*k*2/y) and sample.
        # Then divide bag by 2^piecebits and thus sample (x+k)/2**piecebits.
        # The rest of the PDF's piece is a normalization constant and doesn't
        # affect the result of the sampling
        if (
            rndgen.zero_or_one_exp_minus(ky.numerator, ky.denominator) == 1
            and exp_minus_x2y(rg, gb, Fraction(1) / y) == 1
            and exp_minus_xy(rg, gb, Fraction(k * 2) / y) == 1
            and sampleIntPlusBag(rg, bag, k) == 1
        ):
            # Accepted
            bag[1] = k
            return bag
