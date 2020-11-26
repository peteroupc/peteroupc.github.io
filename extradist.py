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
    y = Fraction(2 * s * s)
    rndgen = randomgen.RandomGen(_RGConv(rg))
    # Choose a piece according to Rayleigh distribution function
    while True:
        # Conditional probability of each piece
        # is 1-exp(-(k*2+1)/(2*s**2))
        emparam = Fraction(k * 2 + 1) / y
        if rndgen.zero_or_one_exp_minus(emparam.numerator, emparam.denominator) == 0:
            break
        k += 1
    # In the chosen piece, sample (x+k)*exp(-(x+k)**2/(2*s*s))
    while True:
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

def size_biased_poisson_ailamujia(rg, eta=1):
    """ Hassan, A., Dar, S.A., et al., "On size biased Poisson Ailamujia distribution and its applications",
        Pak. J. Statistics 37(1), 19-38, 2021. """
    rndgen = randomgen.RandomGen(_RGConv(rg))
    z = 1
    eta = Fraction(eta)
    cumu = Fraction(1)
    while True:
        pr = Fraction(4 * eta ** 3 * z * (z + 1)) / (1 + 2 * eta) ** (z + 2)
        prc = pr / cumu
        if rndgen.zero_or_one(prc.numerator, prc.denominator) == 1:
            return z
        cumu -= pr
        z += 1

if __name__ == "__main__":
    # The following code tests some of the methods in this module and the betadist module.

    import scipy.stats as st
    import math
    from betadist import _test_rand_extraction
    from bernoulli import Bernoulli
    from interval import FInterval

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

    def normalroupt(u, v, s):
        if v.inf == 0:
            return FInterval(0)
        wid = v.width()
        n = 5
        while wid < 1:
            wid *= 8
            n += 1
        return (u / v) ** 2 + 4 * (v).log(n)

    def normalroupaving(coord):
        a = normalroupt(
            FInterval(coord[0][0], coord[0][1]), FInterval(coord[1][0], coord[1][1]), 1
        )
        if a.sup < 0:
            return 1
        if a.inf > 0:
            return -1
        return 0

    rg = Bernoulli()
    samp = [size_biased_poisson_ailamujia(rg, 0.2) for i in range(3000)]
    dobucket(samp)
    _test_rand_extraction(
        lambda rg: size_biased_poisson_ailamujia(rg, 0.1), nofill=True
    )
    exit()

    paving = ShapeSampler2(normalroupaving)
    _test_rand_extraction(lambda rg: paving.sample(rg)[0])
    _test_rand_extraction(lambda rg: paving.sample(rg)[1])

    _test_rand_extraction(lambda rg: rayleighpsrn(rg))
    _test_rand_extraction(lambda rg: rayleighpsrn(rg, 2))
    _test_rand_extraction(lambda rg: rayleighpsrn(rg, 0.5))

    def rgcoin(rg):
        return lambda: rg.rndint(10) < 3

    _test_rand_extraction(lambda rg: exp_minus_xy(rg, rgcoin(rg), 1), nofill=True)
    _test_rand_extraction(lambda rg: exp_minus_xy(rg, rgcoin(rg), 3), nofill=True)
    _test_rand_extraction(lambda rg: exp_minus_xy(rg, rgcoin(rg), 3.5), nofill=True)
    _test_rand_extraction(lambda rg: exp_minus_xy(rg, rgcoin(rg), 0.5), nofill=True)
