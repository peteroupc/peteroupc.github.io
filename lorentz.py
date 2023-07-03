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
        (theta) / (n**alpha)
        + (
            RealSqrt(Fraction(i, n) * (1 - Fraction(i, n)) / n)
            if alpha == 1
            else (Fraction(i, n) * (1 - Fraction(i, n)) / n) ** (alpha // 2)
        )
        for i in range(n + 1)
    ]
    phi = degelev(phi, r)
    upper = [nrcoeffs[i] + phi[i] * d for i in range(len(phi))]
    lower = [nrcoeffs[i] - phi[i] * d for i in range(len(phi))]
    return upper, lower

def example1():
    # Example function: A concave piecewise
    # polynomial with three continuous derivatives
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

def degelev(coeffs, r):  # Elevate polynomial in Bernstein form by r degrees
    if r < 0:
        raise ValueError
    if r == 1:
        n = len(coeffs) - 1
        return [
            coeffs[max(0, k - 1)] * Fraction(k, n + 1)
            + coeffs[min(n, k)] * Fraction((n + 1) - k, n + 1)
            for k in range(n + 2)
        ]
    while r >= 256:
        coeffs = elevatemulti(coeffs, 256)
        r -= 256
    for i in range(r):
        coeffs = degelev(coeffs, 1)
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
    coeffs2 = degelev(coeffs, nPlusR - existingNPlusR)
    if len(coeffs) != len(l4):
        raise ValueError
    return [realSimplify(v + w) for v, w in zip(coeffs2, l4)]

def lorentz4iter(func, coeffs, nPlusR):
    existingNPlusR = len(coeffs) - 1
    if existingNPlusR <= 0 or nPlusR < existingNPlusR:
        raise ValueError
    l4 = lorentz4poly(PolyDiff(func, BernsteinPoly(coeffs)), nPlusR - 4)
    coeffs2 = degelev(coeffs, nPlusR - existingNPlusR)
    if len(coeffs) != len(l4):
        raise ValueError
    return [realSimplify(v + w) for v, w in zip(coeffs2, l4)]

def lorentz4poly(pwpoly, n):
    # Polynomial for Lorentz operator with r=4,
    # of degree n+r = n+4, given four times differentiable piecewise polynomial
    r = 4
    # Stores homogeneous coefficients for the degree n+4 polynomial.
    vals = [REALZERO for i in range(n + r + 1)]
    for k in range(0, n + 1):
        kdivn = Fraction(k, n)
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
            - f3v * Fraction(1, 24 * n**2)
            - f4v * Fraction(1, 96 * n**3)
        ) * (4 * nck)
        # print("k+2")
        vals[k + 2] += (
            f0v
            - f2v * Fraction(1, 6 * n)
            + f4v * Fraction(1, 48 * n**2)
            + f4v * Fraction(1, 36 * n**3)
        ) * (6 * nck)
        # print("k+3")
        vals[k + 3] += (
            f0v
            - f2v * Fraction(1, 8 * n)
            + f3v * Fraction(1, 24 * n**2)
            - f4v * Fraction(1, 96 * n**3)
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
    vals = degelev(vals, r)
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

def realSimplify(r):
    if isinstance(r, RealMultiply):
        if isinstance(r.a, RealFraction) and isinstance(r.b, RealFraction):
            return r.a.toFraction() * r.b.toFraction()
        s1 = realSimplify(r.a)
        s2 = realSimplify(r.b)
        if s1 != r.a or s2 != r.b:
            return realSimplify(s1 * s2)
        return s1 * s2
    if isinstance(r, RealAdd):
        if isinstance(r.a, RealFraction) and isinstance(r.b, RealFraction):
            return r.a.toFraction() + r.b.toFraction()
        s1 = realSimplify(r.a)
        s2 = realSimplify(r.b)
        if s1 != r.a or s2 != r.b:
            return realSimplify(s1 + s2)
        return s1 + s2
    if isinstance(r, RealSubtract):
        if isinstance(r.a, RealFraction) and isinstance(r.b, RealFraction):
            return r.a.toFraction() - r.b.toFraction()
        s1 = realSimplify(r.a)
        s2 = realSimplify(r.b)
        if s1 != r.a or s2 != r.b:
            return realSimplify(s1 - s2)
        return s1 - s2
    return r

class C4Function:
    # func must map [0, 1] to (0, 1) and have at least
    # four continuous derivatives by default.
    def __init__(self, func, norm, lorentz=False, concave=False, contderivs=4):
        # Norm is:
        # contderivs=1 --> Lipschitz constant
        # contderivs=2 --> max. abs. value of second derivative
        # contderivs>2 --> max. abs. value of func, 1st, ..., and
        #               'contderivs'-th derivative
        self.func = func
        self.contderivs = min(4, contderivs)
        if self.contderivs < 1 and not lorentz:
            raise ValueError("this value of contderivs not supported for lorentz=False")
        if self.contderivs < 2 and lorentz:
            raise ValueError("this value of contderivs not supported for lorentz=True")
        self.norm = norm
        self.lopolys = {}
        self.hipolys = {}
        self.concave = concave
        self.nextdegree = None  # Use default for nextdegree
        # Whether to use Lorentz operator of order
        # 4 or the Micchelli--Felbecker iterated Boolean sum of order 2.
        self.lorentz = lorentz
        if self.lorentz:
            # Lorentz operator of order 2 or 4.
            # NOTE: 'func' should have at least 'lorentz_r' many
            # continuous derivatives.  Necessary condition: derivative
            # of order ('lorentz_r'-1) is in Zygmund class.
            self.lorentz_r = 4 if self.contderivs >= 4 else 2
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
                # print("nextdegree %d [to %d]" % (d, deg))
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
                    up = [realSimplify(v) for v in up]
                    if self.concave:
                        lo = [
                            realSimplify(self.func.value(Fraction(i, d)))
                            for i in range(d + 1)
                        ]
                    else:
                        lo = [realSimplify(v) for v in lo]
                        for v in lo:
                            if realIsLess(v, Fraction(0)):
                                lo = [REALZERO for i in range(deg + 1)]
                                break
                    self.lopolys[d] = lo
                    for v in up:
                        if realIsLess(Fraction(1), v):
                            up = [REALONE for i in range(deg + 1)]
                            break
                    self.hipolys[d] = up
            if n not in self.lopolys:
                raise ValueError
            if n not in self.hipolys:
                raise ValueError
            if len(self.lopolys[n]) != n + 1:
                raise ValueError
            if len(self.hipolys[n]) != n + 1:
                raise ValueError
            return [self.lopolys[deg], self.hipolys[deg]]

    def _ensure(self, deg):
        if deg in self.lopolys:
            return [self.lopolys[deg], self.hipolys[deg]]
        if self.lorentz:
            return self._ensurelorentz(deg)
        if self.contderivs >= 4:
            # WARNING: Conjectured bound
            incr = Fraction(25, 100) * self.norm / deg**2
        elif self.contderivs >= 3:
            # WARNING: Conjectured bound
            incr = (Fraction(9, 100) * self.norm) / RealFraction(deg) ** Fraction(3, 2)
        elif self.contderivs >= 2:
            # (Nacu & Peres 2005)
            incr = (Fraction(1, 2) * self.norm) / RealFraction(deg)
        elif self.contderivs >= 1:
            # NOTE: Slightly bigger than 1+sqrt(2) (Nacu & Peres 2005)
            incr = (Fraction(241422, 100000) * self.norm) / RealFraction(
                deg
            ) ** Fraction(1, 2)
        else:
            print("Unsupported")
        overshifted = realIsLessOrEqual(Fraction(1), incr)
        ipol = None if overshifted else iteratedPoly2(self.func, deg)
        # NOTE: Can return a Fraction (rather than Real*)
        # in some cases, but this is only used in realIsLess
        # and realFloor, which both accept Fractions
        if self.concave:
            pol = [
                realSimplify(self.func.value(Fraction(i, deg))) for i in range(deg + 1)
            ]
        elif overshifted:
            pol = [REALZERO for i in range(deg + 1)]
        else:
            pol = [realSimplify(v - incr) for v in ipol]
            for v in pol:
                if realIsLess(v, Fraction(0)):
                    pol = [REALZERO for i in range(deg + 1)]
                    break
        self.lopolys[deg] = pol
        if overshifted:
            pol = [REALONE for i in range(deg + 1)]
        else:
            pol = [realSimplify(v + incr) for v in ipol]
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
        """- coin(): Function that returns 1 or 0 with a fixed probability."""
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
    """A Bernoulli factory for a continuous function f(x) that maps [0, 1]
     to [0, 1] (and where f(x) is polynomially bounded).  Returns either 1
     with probability f(x) (where x is the probability that the given coin
     outputs 1) and 0 otherwise.  The function f(x) is defined by two
    sequences of polynomials in Bernstein form that converge to f(x)
    from above and below and meet consistency requirements on their coefficients.
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
    ret = RandUniform()
    correctness = False
    if correctness:
        fba = {}
        faa = {}
    while True:
        for i in range(degree - lastdegree):
            if coin() == 1:
                ones += 1
        c = math.comb(degree, ones)
        md = degree
        l = _fb2(fbelow, degree, ones, c << md)
        u = _fa2(fabove, degree, ones, c << md)
        if correctness:
            fba[(degree, ones)] = l
            faa[(degree, ones)] = u
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
            if correctness:  # Correctness check
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
            if l < ls:
                raise ValueError
            if us < u:
                raise ValueError
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
    # ce = c4example()
    # f = C4Function(ce, 5, lorentz=False,contderivs=4)
    ce = example1()
    f = C4Function(ce, 5, lorentz=False, concave=True, contderivs=3)
    coin = lambda: 1 if random.random() < 0.9 else 0
    print(ce.value(0.9))
    print(sum(f.simulate(coin) for i in range(50000)) / 50000)

from sympy import Min, Max, ceiling, S
from sympy import Matrix, binomial, chebyshevt, pi, Piecewise, Eq, floor, ceiling

def tachevcoeffs(func, x, n):
    coeffs = [func.subs(x, S(i) / n) for i in range(n + 1)]
    coeffselev = [coeffs[i * 2] for i in range(n // 2 + 1)]
    coeffselev = elevatemulti(coeffselev, n // 2)
    return [2 * c1 - c2 for c1, c2 in zip(coeffs, coeffselev)]

def _isRandomLess(u, s):
    # Determines whether 'u', a uniform random variate
    # between 0 and 1, is less than 's'.
    sh = 16  # Number of bits from 'u' generated at a time
    if u[1] == 0:
        u[0] = random.randint(0, (1 << sh) - 1)
        u[1] = 1 << sh
    while True:
        if S(u[0]) / u[1] < s:
            return True
        if S(u[0] + 1) / u[1] > s:
            return False
        u[0] = (u[0] << sh) | random.randint(0, (1 << sh) - 1)
        u[1] = u[1] << sh

class FactoryFunction:
    def __init__(self, func, x):
        # A Bernoulli factory for continuous functions.
        # Relies on the SymPy computer algebra library.
        # 'func' must have a minimum greater than 0 and
        # a maximum less than 1.
        # 'x' is a SymPy symbol of the variable used by 'func'.
        if thirdderiv < 0:
            raise ValueError
        self.startdist = 0
        self.start_nn = 0
        nn = self.start_nn
        self.coeffarr = [None]
        self.func = func
        self.tc = {}
        self.x = x
        while True:
            err = self._errshift(nn)
            co = None
            # print(["nn",nn])
            if err > 2:  # Error too big to be a starting polynomial
                nn += 1
                continue
            coeffs = [(c - err) for c in self.coeffs(self.func, self.x, 2**nn)]
            self.tc[nn] = coeffs
            comin = Min(*coeffs)
            comax = Max(*coeffs)
            # print(["nn",nn,comin.n(),comax.n()])
            if comin >= 0 and comax <= 1:
                self.startdist = ceiling(comax * 65536) / 65536  # Rounded up
                if self.startdist < 0:
                    raise ValueError
                self.start_nn = nn
                self.coeffarr.append([c / self.startdist for c in coeffs])
                # print([nn,comax.n()])
                break
            nn += 1
        # totaldist=summation(diffwidth,(n,self.start_nn,oo))+self.startdist
        # Same as prev. line
        self.totaldist = self._t(self.start_nn, self.startdist)
        # print(["dist",self.dist])
        if self.totaldist > 1:
            print(["totaldist", self.totaldist])
            raise ValueError("Not supported")

    def _coeffs(self, func, x, nn):
        raise NotImplementedError

    def _t(self):
        raise NotImplementedError

    def _errshift(self, m):
        raise NotImplementedError

    def _diffwidth(self, m):
        raise NotImplementedError

    def ensure(self, r):
        if r < 0:
            raise ValueError
        if r < len(self.coeffarr) and self.coeffarr[r] != None:
            return self.coeffarr[r]
        while r >= len(self.coeffarr):
            self.coeffarr.append(None)
        nn = (r - 2) + self.start_nn
        # print(["r",r,"nn",nn])
        err = self._errshift(nn)
        newerr = self._errshift(nn + 1)
        diffwidth = self._diffwidth(nn)
        if diffwidth < 0:
            raise ValueError
        coeffs1 = None
        coeffs2 = None
        if nn in self.tc:
            coeffs1 = self.tc[nn]
        else:
            coeffs1 = [
                (c - err) for c in self.coeffs(self.func, self.x, 2**nn)
            ]  # Polynomial of degree 2**nn is lower polynomial
            self.tc[nn] = coeffs1
        if nn + 1 in self.tc:
            coeffs2 = self.tc[nn + 1]
        else:
            coeffs2 = [
                (c - newerr) for c in self.coeffs(self.func, self.x, 2 ** (nn + 1))
            ]  # Polynomial of degree 2**(nn+1) is upper polynomial
            self.tc[nn + 1] = coeffs2
        coeffs1 = degelev(coeffs1, 2**nn)  # Lower polynomial
        if len(coeffs2) != len(coeffs1):
            raise ValueError
        coeffs = [(a - b) / diffwidth for a, b in zip(coeffs2, coeffs1)]
        # coeffs represents the Bernstein coefficients of a nonnegative polynomial
        # bounded by 0 and 1, but the coefficients are not
        # necessarily bounded by 0 and 1, so elevate the polynomial's
        # degree if necessary
        while True:
            comin = Min(*coeffs)
            comax = Max(*coeffs)
            # print(["nn",nn,comin.n(),comax.n()])
            if comin >= 0 and comax <= 1:
                break
            coeffs = degelev(coeffs, len(coeffs) - 1)
        self.coeffarr[r] = coeffs
        return coeffs

    def sim(self, coin):
        r = 0
        s = 1 - self.totaldist
        u = [0, 0]
        # Generate 'r'
        # r=0 --> Remainder
        while not _isRandomLess(u, s):
            r += 1
            if r == 1:
                s += self.startdist  # r=1 --> First piece
            else:  # r>=2 --> In-between pieces
                nn = (r - 2) + self.start_nn
                s += self._diffwidth(nn)
        if r == 0:
            return 0
        # Simulate the polynomial labeled 'r'
        coeffs = self.ensure(r)
        heads = sum(coin() for i in range(len(coeffs) - 1))
        if _isRandomLess([0, 0], coeffs[heads]):
            return 1
        return 0

class C3Function(FactoryFunction):
    def __init__(self, func, x, thirdderiv):
        # A Bernoulli factory for functions with a continuous
        # third derivative.
        # 'func' must have a minimum greater than 0 and
        # a maximum less than 1, and must have a
        # continuous third derivative.
        # 'x' is a SymPy symbol of the variable used by 'func'.
        # thirdderiv is no less than max. of abs. of third deriv
        if thirdderiv < 0:
            raise ValueError
        self.zz = S("1.29904")  # Constant used in approximation scheme
        self.mm = S(thirdderiv)
        super(func, x)

    def _coeffs(self, func, x, nn):
        return tachevcoeffs(func, x, 2**nn)

    def _t(self, start_nn, start_dist):
        return (
            S("1.01") * 10 * self.mm * self.zz / (3 * 2 ** (2 * start_nn)) + startdist
        )

    def _errshift(self, m):
        return S("1.01") * 4 * self.mm * self.zz / (3 * 2 ** (2 * m))

    def _diffwidth(self, m):
        return S("1.01") * 5 * self.mm * self.zz / (2 ** (2 * m + 1))

def cheb_to_bern(n):
    # Transforms Chebyshev interp. coefficients to Bernstein coefficients
    # Rababah, Abedallah. "Transformation of Chebyshev–Bernstein polynomial basis." Computational Methods in Applied Mathematics 3.4 (2003): 608-622.
    mat = [
        [
            sum(
                (-1) ** (k - i) * binomial(2 * k, 2 * i) * binomial(n - k, j - i)
                for i in range(max(0, j + k - n), min(j, k) + 1)
            )
            / (binomial(n, j))
            for k in range(0, n + 1)
        ]
        for j in range(0, n + 1)
    ]
    return Matrix(mat)

def chebpoly(coeffs, x, a=0, b=1):
    # Polynomial on [a,b] given Chebyshev interpolant coefficients
    if a > b:
        raise ValueError
    return sum(
        coeffs[i] * chebyshevt(i, (S(x - a) / S(b - a)) * 2 - 1)
        for i in range(0, len(coeffs))
    )

def chebpoly2(coeffs, x):
    # Polynomial on [-1,1] given Chebyshev interpolant coefficients
    # If func^{nu} has bounded variation V, nu>=1,
    # the error bound is 4V/(pi*nu*(n-nu)^nu).  If V has a derivative on its domain,
    # V is the integral of abs(func^{nu}).
    # Theorem 7.2, Trefethen, Lloyd N., Approximation theory and approximation practice, 2013.  G. Mastroianni and J. Szabados, "Jackson order of approximation by Lagrange interpolation", Acta Mathematica Hungarica, 69 (1995), 73-82.
    return chebpoly(coeffs, x, a=-1, b=1)

def chebdegree(eps, totvar, nu):
    # Upper bound on degree of polynomial to achieve error tolerance eps,
    # given that func^{nu} has bounded variation totvar on [-1,1].
    # nu>=1
    if nu < 1:
        raise ValueError("'nu' must be 1 or greater")
    return ceiling(nu + (S(4 * totvar) / (pi * eps * nu)) ** (1 / S(nu)))

def chebdegree_rough(eps, totvar, nu):
    # Rougher upper bound on degree of polynomial to achieve error tolerance eps,
    # given that func^{nu} has bounded variation totvar on [-1,1].
    # nu>=1
    return chebdegree_01_rough(eps, totvar, nu, a=-1, b=1)

def chebdegree_01_rough(eps, totvar, nu, a=0, b=1):
    # Rougher upper bound on degree of polynomial to achieve error tolerance eps,
    # given that func^{nu} has bounded variation totvar on [a, b].
    # nu>=1
    if nu < 1:
        raise ValueError("'nu' must be 1 or greater")
    if a > b:
        raise ValueError
    return ceiling(
        nu
        + ((S(12733) / 10000) * ((S(b - a) / 2) ** nu) * (totvar) / (eps * nu))
        ** (1 / S(nu))
    )

def chebcoeffs(func, x, n, a=0, b=1):
    # Chebyshev interpolant coefficients of degree n
    # for a continuous function func defined on [-1,1]
    # Background: https://arxiv.org/pdf/2106.03456.pdf
    tm = time.time()
    cosines = [cos(j * pi / n) for j in range(n + 1)]
    funcsub = [func.subs(x, a + (b - a) * (cosines[j] + 1) / 2) for j in range(n + 1)]
    chebpolys = [chebyshevt(k, x) for k in range(n + 1)]
    print(time.time() - tm)
    ret = [
        (S(2) / n)
        * sum(
            (
                (
                    S(1) / (2 if j == 0 or j == n else 1)
                )  # halve if first or last summand
                * funcsub[j]
                * chebpolys[k].subs(x, cosines[j])
                for j in range(0, n + 1)
            )
        )
        for k in range(0, n + 1)
    ]
    # Halve first and last coefficient so that the coefficients
    # are correct on chebpoly and chebpoly2
    ret[0] /= 2
    ret[n] /= 2
    print(time.time() - tm)
    return ret

# fun=exp(-(x + S(49)/10)**2 / (S(1) / 12))
# fun1=fun.subs(x,x*24-12)
# cc=chebcoeffs(fun1.subs(x,(x+1)/2),x,100)

def cheb_berncoeffs_deg(func, x, delta=S(1) / 1000, nn=10):
    if nn < 1:
        raise ValueError("'nn' must be 1 or greater")
    delta = S(delta)
    chc = chebcoeffs(func.subs(x, (x + 1) / 2), x, nn)
    chc = [c.simplify() for c in chc]
    cc = Matrix(chc)
    bern = cheb_to_bern(nn) * cc
    return [floor(c / delta + S.Half) * delta for c in bern]

def cheb_berncoeffs(func, x, eps=S(1) / 1000, totvar=1, nu=3):
    # Calculates Bernstein coefficients of a polynomial that
    # approximates func(x) with an error tolerance 'eps',
    # using a Chebyshev interpolant.
    # func is continuous on [0,1], 'totvar' is 'nu'-th derivative's
    # total variation on [0,1].
    # Since calculating these coefficients can take seconds or more --
    # too slowly for real-time or "online" use -- this method is best
    # used to pregenerate ("offline") the Bernstein approximation
    # of a function known in advance
    if nu < 1:
        raise ValueError("'nu' must be 1 or greater")
    eps = S(eps)
    delta = eps / 2
    nn = chebdegree_01_rough(eps / 2, totvar, nu)
    return cheb_berncoeffs_deg(func, x, delta=delta, nn=nn)

def akahiraest(func, x, p):
    # Akahira et al. (1992) unbiased estimator of func(x) where
    # x is the expected value of a Bernoulli random variate
    # (probability of success).
    #
    # func - function to estimate
    # x - variable used in func.
    # p - probability of success
    deg = 0
    pp = S(1) / 4
    p = S(p)
    u = [0, 0]
    while not _isRandomLess(u, pp):
        deg += 1
    pn = S(pp) * (1 - pp) ** deg
    if deg == 0:
        return 0
    if deg != 1 << (deg.bit_length() - 1):
        return 0
    prevdeg = deg // 2
    i = sum(1 if _isRandomLess([0, 0], p) else 0 for _ in range(deg))
    d0 = [0 if j > i else func.subs(x, S(j) / deg) for j in range(deg + 1)]
    d1 = [
        0 if (deg == 1 or j > i) else func.subs(x, S(j) / (prevdeg))
        for j in range((prevdeg) + 1)
    ]
    d1 = degelev(d1, len(d0) - len(d1) - 1)
    try:
        return (
            S(
                d0[i]
                - i * (0 if i == 0 else d1[i - 1]) / deg
                - (deg - i) * (0 if i > (deg - 1) else d1[i]) / deg
            )
            / pn
        )
    except:
        print([deg, i, len(d0), len(d1)])
        raise ValueError
