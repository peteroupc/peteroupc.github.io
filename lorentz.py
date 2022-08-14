from fractions import Fraction
from betadist import *
import time
import math
import random

BINCOMBS = {}
SPLITBINCOMBS = {}

def ccomb(n, k):
    if k < 10:
        return math.comb(n, k)
    if (n, k) in BINCOMBS:
        return BINCOMBS[(n, k)]
    v = math.comb(n, k)
    BINCOMBS[(n, k)] = v
    return v

def binco2(v, n, k):
    if k < 100 or k > n - 100:
        return v * ccomb(n, k)
    if (n, k) in SPLITBINCOMBS:
        s = SPLITBINCOMBS[(n, k)]
        v0 = (v * s[0]) * s[1]
        return v0
    if k == 0 or k == n:
        return v
    if k < 0 or k > n:
        return 0
    num = 1
    den = 1
    split = n - (k + 1) // 2
    for i in range(n - k + 1, split):
        num *= i
        den *= n - i + 1
    s = [FRAC_ZERO, FRAC_ZERO]
    s[0] = Fraction(num, den).reduce()
    oldv = v
    v *= s[0]
    num = 1
    den = 1
    for i in range(split, n + 1):
        num *= i
        den *= n - i + 1
    s[1] = Fraction(num, den).reduce()
    SPLITBINCOMBS[(n, k)] = s
    v0 = v * s[1]
    return v0

def polyshift(nrcoeffs, theta, d, alpha=2):
    # Upward and downward shift of polynomial according to step 5
    # in Holtz et al. 2011, for even integer r>=2 or r=1 (r times
    # differentiable functions with Hölder continuous r-th derivative;
    # necessary condition is (r-1) times differentiable with
    # (r-1)th derivative in the Zygmund class).
    # NOTE: Supports fraction intervals (with lower and upper
    # bounds of limited precision).
    if theta < 1:
        raise ValueError("disallowed theta")
    r = alpha
    if r < 1 or int(r) != r or (r != 1 and r % 2 != 0):
        raise ValueError("disallowed r")
    theta = theta if isinstance(theta, Real) else RealFraction(theta)
    n = len(nrcoeffs) - 1 - r  # n+r+1 coefficients
    phi = [
        (theta) / (n ** alpha)
        + (
            RealSqrt(Fraction(i, n) * (1 - Fraction(i, n)) / n)
            if alpha == 1
            else (Fraction(i, n) * (1 - Fraction(i, n)) / n) ** (alpha // 2)
        )
        for i in range(n + 1)
    ]
    phi = elevate(phi, r)
    upper = [nrcoeffs[i] + phi[i] * d for i in range(len(phi))]
    lower = [nrcoeffs[i] - phi[i] * d for i in range(len(phi))]
    return upper, lower

def example1():
    # Example function: A concave piecewise polynomial
    pwp2 = PiecewiseBernstein()
    pwp2.piece(
        [
            Fraction(29) / 60,
            Fraction(9, 10),
            Fraction(9, 10),
            Fraction(9, 10),
            Fraction(9, 10),
        ],
        Fraction(1, 2),
        1,
    )
    pwp2.piece(
        [
            Fraction(163, 320),
            Fraction(2867, 2880),
            Fraction(2467, 2880),
            Fraction(889, 960),
        ],
        0,
        Fraction(1, 2),
    )
    return pwp2

REALONE = RealFraction(1)
REALZERO = RealFraction(0)

def elevate1(coeffs):  # Elevate polynomial in Bernstein form by 1 degree
    n = len(coeffs) - 1
    return [
        coeffs[max(0, k - 1)] * Fraction(k, n + 1)
        + coeffs[min(n, k)] * Fraction((n + 1) - k, n + 1)
        for k in range(n + 2)
    ]

def elevatemulti(coeffs, r):  # Elevate polynomial in Bernstein form by r degrees
    if r < 0:
        raise ValueError
    if r == 0:
        return coeffs
    n = len(coeffs) - 1
    return [
        sum(
            math.comb(r, k - j) * math.comb(n, j) * coeffs[j]
            for j in range(max(0, k - r), min(n, k) + 1)
        )
        / math.comb(n + r, k)
        for k in range(n + r + 1)
    ]

def elevate(coeffs, r):  # Elevate polynomial in Bernstein form by r degrees
    if r < 0:
        raise ValueError
    while r >= 256:
        coeffs = elevatemulti(coeffs, 256)
        r -= 256
    for i in range(r):
        coeffs = elevate1(coeffs)
        coeffs = [v for v in coeffs]
    return coeffs

class PolyDiff:
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def value(self, x):
        return self.a.value(x) - self.b.value(x)

    def diff(self, x, d=1):
        return self.a.diff(x, d=d) - self.b.diff(x, d=d)

def lorentz2iter(func, coeffs, nPlusR):
    existingNPlusR = len(coeffs) - 1
    if existingNPlusR <= 0 or nPlusR < existingNPlusR:
        raise ValueError
    l4 = lorentz2poly(PolyDiff(func, BernsteinPoly(coeffs)), nPlusR - 2)
    coeffs2 = elevate(coeffs, nPlusR - existingNPlusR)
    return [simplify(v + w) for v, w in zip(coeffs2, l4)]

def lorentz4iter(func, coeffs, nPlusR):
    existingNPlusR = len(coeffs) - 1
    if existingNPlusR <= 0 or nPlusR < existingNPlusR:
        raise ValueError
    l4 = lorentz4poly(PolyDiff(func, BernsteinPoly(coeffs)), nPlusR - 4)
    coeffs2 = elevate(coeffs, nPlusR - existingNPlusR)
    return [simplify(v + w) for v, w in zip(coeffs2, l4)]

def lorentz4poly(pwpoly, n):
    # Polynomial for Lorentz operator with r=4,
    # of degree n+r = n+4, given four times differentiable piecewise polynomial
    # NOTE: Currently well-defined only if value and derivatives are
    # rational whenever k/n is rational
    r = 4
    # Stores homogeneous coefficients for the degree n+4 polynomial.
    vals = [REALZERO for i in range(n + r + 1)]
    for k in range(0, n + 1):
        kdivn = Fraction(k, n)
        # print([n,k,"value"])
        f0v = pwpoly.value(kdivn)  # Value
        # print([n,k,"diff2"])
        f2v = pwpoly.diff(kdivn, d=2)  # Second derivative
        # print([n,k,"diff3"])
        f3v = pwpoly.diff(kdivn, d=3)  # Third derivative
        # print([n,k,"diff4"])
        f4v = pwpoly.diff(kdivn, d=4)  # Fourth derivative
        # print([n,k,"diff4 done"])
        # f0,f2,f3,f4=symbols('f0 f2 f3 f4') # For the value and 2nd, 3rd, and 4th derivatives
        # tau2=(n*x*(x-1)/factorial(2))
        # tau3=(n*x*(-2*x**2+2*x+x-1)/factorial(3))
        # tau4=(n*x*((3*(n+2))*x**3 - (6*(n+2))*x**2 + (3*(n+2))*x+x-1)/factorial(4))
        # bco=f0 + f2*tau2/n**2 + f3*tau3/n**3 + f4*tau4/n**4
        # The terms added to vals reflect the Bernstein coefficients of
        # the degree-4 polynomial bco.
        nck = math.comb(n, k)
        # print([n,k,"comb done"])
        ends = f0v * 1 * nck
        vals[k + 0] += ends
        vals[k + 1] += (
            f0v
            - f2v * Fraction(1, 8 * n)
            - f3v * Fraction(1, 24 * n ** 2)
            - f4v * Fraction(1, 96 * n ** 3)
        ) * (4 * nck)
        # print("k+2")
        vals[k + 2] += (
            f0v
            - f2v * Fraction(1, 6 * n)
            + f4v * Fraction(1, 48 * n ** 2)
            + f4v * Fraction(1, 36 * n ** 3)
        ) * (6 * nck)
        # print("k+3")
        vals[k + 3] += (
            f0v
            - f2v * Fraction(1, 8 * n)
            + f3v * Fraction(1, 24 * n ** 2)
            - f4v * Fraction(1, 96 * n ** 3)
        ) * (4 * nck)
        # print("k+4")
        vals[k + 4] += ends
        # print([n,k,"vals done"])
    # Divide homogeneous coefficient i by (n+r) choose i to turn
    # it into a Bernstein coefficient
    return [(vals[i]) / math.comb(n + r, i) for i in range(n + r + 1)]

# NOTE: Lorentz operator with r=0 or r=1 of degree n+r
# is the same as the degree-n Bernstein polynomial, elevated
# r degrees to degree n+r.

def lorentz2polyB(func, n, r=2):
    # Polynomial for Lorentz operator with r=0, 1, 2,
    # of degree n+r, given r times differentiable function
    if r != 0 and r != 1 and r != 2:
        raise ValueError("unsupported r")
    # Get degree n coefficients
    vals = [REALZERO for i in range(n + 1)]
    for k in range(0, n + 1):
        f0v = func.value(Frac(k) / n)  # Value
        vals[k] = f0v
    # Elevate to degree n+r
    vals = elevate(vals, r)
    # Shift downward according to Lorentz operator
    for k in range(1, n + 2):
        f2v = func.diff(Fraction(k - 1) / n, d=2)  # Second derivative
        fv = ((f2v) / (4 * n)) * 2
        # fv=fv*binomial(n,k-1)/binomial(n+r,k)
        # Alternative impl.
        fv = fv * k * (n + 2 - k) / ((n + 1) * (n + 2))
        vals[k] -= fv
    return vals

def lorentz2poly(pwpoly, n):
    # Polynomial for Lorentz operator with r=2,
    # of degree n+r = n+2, given twice differentiable piecewise polynomial
    # NOTE: Currently well-defined only if value and diff2 are
    # rational whenever k/n is rational
    r = 2
    # Stores homogeneous coefficients for the degree n+2 polynomial.
    vals = [REALZERO for i in range(n + r + 1)]
    for k in range(0, n + 1):
        kdivn = Fraction(k, n)
        f0v = pwpoly.value(kdivn)  # Value
        f2v = pwpoly.diff(kdivn, d=2)  # Second derivative
        nck = math.comb(n, k)
        # Rewrite
        # $f(k/n) + f^{(2)}(k/n) \tau_{2,2}(x,n)/n^2$
        # $=f(k/n) + f^{(2)}(k/n) x*(1-x)/(2*n)$
        # as a Bernstein polynomial of degree r=2.
        homoc = f0v * 1  # Bernstein coefficient times choose(2,0)
        # equals 0th homogeneous coefficient
        # for degree 2 polynomial.
        homoc *= nck  # Multiply by n choose k to turn it into
        # part of the (k+0)th homogeneous coefficient of
        # the degree n+2 polynomial
        vals[k + 0] += homoc
        # Same for (k+2)th homogeneous coefficient
        vals[k + 2] += homoc
        # Bernstein coefficient times choose(2,1)
        # times n choose k, for the
        # (k+1)th homogeneous coefficient of
        # the degree n+2 polynomial
        homoc = (f0v - f2v / (4 * n)) * 2
        # Alternative to above line:
        # "homoc = f0v * 2 - f2v / (4*n) * 2"
        homoc *= nck
        vals[k + 1] += homoc
    # Divide homogeneous coefficient i by (n+r) choose i to turn
    # it into a Bernstein coefficient
    return [(vals[i]) / math.comb(n + r, i) for i in range(n + r + 1)]

def simplify(r):
    if isinstance(r, RealMultiply):
        if isinstance(r.a, RealFraction) and isinstance(r.b, RealFraction):
            return r.a.toFraction() * r.b.toFraction()
        s1 = simplify(r.a)
        s2 = simplify(r.b)
        if s1 != r.a or s2 != r.b:
            return simplify(s1 * s2)
        return s1 * s2
    if isinstance(r, RealAdd):
        if isinstance(r.a, RealFraction) and isinstance(r.b, RealFraction):
            return r.a.toFraction() + r.b.toFraction()
        s1 = simplify(r.a)
        s2 = simplify(r.b)
        if s1 != r.a or s2 != r.b:
            return simplify(s1 + s2)
        return s1 + s2
    if isinstance(r, RealSubtract):
        if isinstance(r.a, RealFraction) and isinstance(r.b, RealFraction):
            return r.a.toFraction() - r.b.toFraction()
        s1 = simplify(r.a)
        s2 = simplify(r.b)
        if s1 != r.a or s2 != r.b:
            return simplify(s1 - s2)
        return s1 - s2
    return r

class C4Function:
    def __init__(self, func, norm, lorentz=False):
        self.func = func
        self.norm = norm
        self.lopolys = {}
        self.hipolys = {}
        self.nextdegree = None  # Use default for nextdegree
        # Whether to use Lorentz operator of order
        # 2 or the Micchelli--Felbecker iterated Bernstein
        # polynomial of order 2.
        self.lorentz = lorentz
        if self.lorentz:
            # Lorentz operator of order 4.
            # NOTE: 'func' should have at least 'lorentz_r' many
            # continuous derivatives.  Necessary condition: derivative
            # of order ('lorentz_r'-1) is in Zygmund class.
            self.lorentz_r = 4
            self.initialdeg = 4
            self.lastfn = None
            self.nextdegree = lambda n: max(
                self.initialdeg + self.lorentz_r,
                (n - self.lorentz_r) * 2 + self.lorentz_r,
            )
            self.lastdegree = 0
        self.fbelow = lambda n, k: self._fbelow(n, k)
        self.fabove = lambda n, k: self._fabove(n, k)
        self.fbound = lambda n: (0, 1)

    def _ensurelorentz(self, deg):
        n = deg
        if n in self.lopolys:
            return [self.lopolys[n], self.hipolys[n]]
        else:
            if self.lorentz_r != 2 and self.lorentz_r != 4:
                raise ValueError("Unsupported lorentz_r")
            d = self.lastdegree
            while d <= n:
                d = self.nextdegree(d)
                print("nextdegree %d [to %d]" % (d, deg))
                # t=time.time()
                lastfn_coeffs = None
                if self.lastfn == None:
                    self.lastfn = (
                        lorentz4poly(self.func, d - self.lorentz_r)
                        if self.lorentz_r == 4
                        else lorentz2poly(self.func, d - self.lorentz_r)
                    )
                else:
                    # Iterative construction
                    self.lastfn = (
                        lorentz4iter(self.func, self.lastfn, d)
                        if self.lorentz_r == 4
                        else lorentz2iter(self.func, self.lastfn, d)
                    )
                # print("nextdegree %d done %f" % (d,time.time()-t))
                olddegree = self.lastdegree
                self.lastdegree = d
                if d not in self.lopolys:
                    # NOTE: Value of 1 is not certain to work for
                    # all functions within this class's scope.
                    if self.lorentz_r == 2:
                        # WARNING: 2703/1000 and 1 are conjectured values
                        # for self.lorentz_r=2.  Especially because Conjecture 34
                        # of Holtz et al. 2011 is not yet proved.
                        # Reference: Holtz, O., Nazarov, F., Peres, Y., "New Coins
                        # from Old, Smoothly", _Constructive Approximation_ 33 (2011).
                        up, lo = polyshift(
                            self.lastfn,
                            Fraction(2703, 1000),
                            1,
                            alpha=self.lorentz_r,
                        )
                    else:
                        # WARNING: 1897/1000 and 1 are conjectured values
                        # for self.lorentz_r=4.   Especially because Conjecture 34
                        # of Holtz et al. 2011 is not yet proved.
                        up, lo = polyshift(
                            self.lastfn,
                            Fraction(1897, 1000),
                            1,
                            alpha=self.lorentz_r,
                        )
                    if len(up) != d + 1:
                        raise ValueError
                    up = [simplify(v) for v in up]
                    print([v.disp() for v in up])
                    lo = [simplify(v) for v in lo]
                    for v in lo:
                        if realIsLess(v, Fraction(0)):
                            lo = [REALZERO for i in range(deg + 1)]
                            break
                    self.lopolys[deg] = lo
                    for v in up:
                        if realIsLess(Fraction(1), v):
                            up = [REALONE for i in range(deg + 1)]
                            break
                    self.hipolys[deg] = up
            if n not in self.lopolys:
                raise ValueError
            if n not in self.hipolys:
                raise ValueError
            if len(self.lopolys[n]) != n + 1:
                raise ValueError
            if len(self.lopolys[n]) != n + 1:
                raise ValueError
            return [self.lopolys[deg], self.hipolys[deg]]

    def _ensure(self, deg):
        if deg in self.lopolys:
            return [self.lopolys[deg], self.hipolys[deg]]
        if self.lorentz:
            return self._ensurelorentz(deg)
        # WARNING: 11/100 is conjectured bound
        incr = Fraction(11, 100) * self.norm / deg ** 2
        ipol = iteratedPoly2(self.func, deg)
        # NOTE: Can return a Fraction (rather than Real*)
        # in some cases, but this is only used in realIsLess
        # and realFloor, which both accept Fractions
        pol = [simplify(v - incr) for v in ipol]
        for v in pol:
            if realIsLess(v, Fraction(0)):
                pol = [REALZERO for i in range(deg + 1)]
                break
        self.lopolys[deg] = pol
        pol = [simplify(v + incr) for v in ipol]
        for v in pol:
            if realIsLess(Fraction(1), v):
                pol = [REALONE for i in range(deg + 1)]
                break
        self.hipolys[deg] = pol
        return [self.lopolys[deg], self.hipolys[deg]]

    def _fbelow(self, n, k):
        return self._ensure(n)[0][k]

    def _fabove(self, n, k):
        return self._ensure(n)[1][k]

    def simulate(self, coin):
        """ - coin(): Function that returns 1 or 0 with a fixed probability."""
        return simulate(coin, self.fbelow, self.fabove, self.fbound, self.nextdegree)

def _fb2(fbelow, a, b, v=1):
    if b > a:
        raise ValueError
    return Fraction(realFloor(fbelow(a, b) * v), v)

def _fa2(fabove, a, b, v=1):
    if b > a:
        raise ValueError
    mv = realFloor(fabove(a, b) * v)
    imv = int(mv)
    return Fraction(imv, v) if mv == imv else Fraction(imv + 1, v)

def simulate(coin, fbelow, fabove, fbound, nextdegree=None):
    """Simulates a general factory function defined by two
    sequences of polynomials that converge from above and below.
    - coin(): Function that returns 1 or 0 with a fixed probability.
    - fbelow(n, k): A lambda that calculates the kth Bernstein coefficient (not the value),
      or a lower bound thereof, for the degree-n lower polynomial (k starts at 0).
    - fabove(n, k): A lambda that calculates the kth Bernstein coefficient (not the value),
      or an upper bound thereof, for the degree-n upper polynomial.
    - fbound(n): A lambda that returns a tuple or list specifying a lower and upper bound
       among the values of fbelow and fabove, respectively, for the given n.
     - nextdegree(n): A lambda that returns the next degree after the
       given degree n for which a polynomial is available; the lambda
       must return an integer greater than n.
       Optional.  If not given, the first degree is 1 and the next degree is n*2
       (so that for each power of 2 as well as 1, a polynomial of that degree
       must be specified)."""
    ones = 0
    lastdegree = 0
    l = Fraction(0)
    lt = Fraction(0)
    u = Fraction(1)
    ut = Fraction(1)
    degree = nextdegree(0) if nextdegree != None else 1
    while True:
        fb = fbound(degree)
        if fb[0] >= 0 and fb[1] <= 1:
            break
        degree = nextdegree(degree) if nextdegree != None else degree * 2
    startdegree = degree
    fba = {}
    faa = {}
    ret = RandUniform()
    while True:
        # The following condition should not be present for exact
        # simulation, but is here in order to keep simulation
        # times reasonable
        # print(["degree",degree])
        if degree >= 8192:
            print("skipped")
            return 0
        for i in range(degree - lastdegree):
            if coin() == 1:
                ones += 1
        c = math.comb(degree, ones)
        md = degree
        l = _fb2(fbelow, degree, ones, c << md)
        u = _fa2(fabove, degree, ones, c << md)
        # fba[(degree, ones)] = l
        # faa[(degree, ones)] = u
        ls = Fraction(0)
        us = Fraction(1)
        if degree > startdegree:
            nh = math.comb(degree, ones)
            md = lastdegree
            combs = [
                Fraction(
                    math.comb(degree - lastdegree, ones - j) * math.comb(lastdegree, j),
                    nh,
                )
                for j in range(0, min(lastdegree, ones) + 1)
            ]
            if False:  # Correctness check
                for j in range(0, min(lastdegree, ones) + 1):
                    fb = _fb2(
                        fbelow, lastdegree, j, (1 * math.comb(lastdegree, j)) << md
                    )
                    if (lastdegree, j) in fba:
                        # print(fb)
                        if fba[(lastdegree, j)] != fb:
                            raise ValueError
                    fa = _fa2(
                        fabove, lastdegree, j, (1 * math.comb(lastdegree, j)) << md
                    )
                    if (lastdegree, j) in faa:
                        # print(fa)
                        if faa[(lastdegree, j)] != fa:
                            raise ValueError
            ls = sum(
                _fb2(fbelow, lastdegree, j, (1 * math.comb(lastdegree, j)) << md)
                * combs[j]
                for j in range(0, min(lastdegree, ones) + 1)
            )
            us = sum(
                _fa2(fabove, lastdegree, j, (1 * math.comb(lastdegree, j)) << md)
                * combs[j]
                for j in range(0, min(lastdegree, ones) + 1)
            )
        m = (ut - lt) / (us - ls)
        lt = lt + (l - ls) * m
        ut = ut - (us - u) * m
        if lt > ut:
            raise ValueError
        # print([ret,"lt",float(lt),"ut",float(ut),"l",float(l),"u",float(u)])
        if realIsLess(ret, lt):
            return 1
        if realIsLess(ut, ret):
            return 0
        lastdegree = degree
        degree = nextdegree(degree) if nextdegree != None else degree * 2

def cc():
    f = C4Function(c4example(), 5, lorentz=True)
    coin = lambda: 1 if random.random() < 0.3 else 0
    print(sum(f.simulate(coin) for i in range(5000)) / 5000)

import cProfile

cProfile.run("cc()")
