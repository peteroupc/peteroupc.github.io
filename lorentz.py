from fractions import Fraction
import math
import random

class PiecewisePoly:
    def __init__(self):
        self.pieces = []

    def piece(self, coeffs, mn, mx):
        if len(coeffs) == 0:
            raise ValueError
        self.pieces.append([coeffs, mn, mx])

    def value(self, x):  # Value of piecewise polynomial
        for coeffs, mn, mx in self.pieces:
            if x >= mn and x <= mx:
                return sum(coeffs[i] * x ** i for i in range(len(coeffs)))
        return 0

    def diff(self, x):  # Derivative of piecewise polynomial
        for coeffs, mn, mx in self.pieces:
            if x >= mn and x <= mx:
                if len(coeffs) <= 1:
                    return 0
                return sum(coeffs[i] * i * x ** (i - 1) for i in range(1, len(coeffs)))
        return 0

    def diff2(self, x):  # Second derivative of piecewise polynomial
        for coeffs, mn, mx in self.pieces:
            if x >= mn and x <= mx:
                if len(coeffs) <= 2:
                    return 0
                return sum(
                    coeffs[i] * i * (i - 1) * x ** (i - 2)
                    for i in range(2, len(coeffs))
                )
        return 0

class PolySum:
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def value(self, x):
        return self.a.value(x) + self.b.value(x)

    def diff(self, x):
        return self.a.diff(x) + self.b.diff(x)

    def diff2(self, x):
        return self.a.diff2(x) + self.b.diff2(x)

    def diff3(self, x):
        return self.a.diff3(x) + self.b.diff3(x)

    def diff4(self, x):
        return self.a.diff4(x) + self.b.diff4(x)

    def get_coeffs(self):
        # print(["get_coeffs",self])
        a = self.a.get_coeffs()
        b = self.b.get_coeffs()
        if len(a) < len(b):
            a = elevate(a, (len(b) - 1) - (len(a) - 1))
        if len(a) > len(b):
            b = elevate(b, (len(b) - 1) - (len(a) - 1))
        return [aa + bb for aa, bb in zip(a, b)]

class PolyDiff:
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def value(self, x):
        return self.a.value(x) - self.b.value(x)

    def diff(self, x):
        return self.a.diff(x) - self.b.diff(x)

    def diff2(self, x):
        return self.a.diff2(x) - self.b.diff2(x)

    def diff3(self, x):
        return self.a.diff3(x) - self.b.diff3(x)

    def diff4(self, x):
        return self.a.diff4(x) - self.b.diff4(x)

    def valuei(self, x):
        return self.a.valuei(x) - self.b.valuei(x)

    def diff2i(self, x):
        return self.a.diff2i(x) - self.b.diff2i(x)

    def get_coeffs(self):
        # print(["get_coeffs",self])
        a = self.a.get_coeffs()
        b = self.b.get_coeffs()
        oldmax = max(len(a), len(b))
        if len(a) < len(b):
            a = elevate(a, (len(b) - 1) - (len(a) - 1))
        if len(a) > len(b):
            b = elevate(b, (len(b) - 1) - (len(a) - 1))
        newmax = max(len(a), len(b))
        if newmax != oldmax:
            raise ValueError
        return [aa - bb for aa, bb in zip(a, b)]

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
    s[0] = Frac(num, den).reduce()
    oldv = v
    v *= s[0]
    num = 1
    den = 1
    for i in range(split, n + 1):
        num *= i
        den *= n - i + 1
    s[1] = Frac(num, den).reduce()
    SPLITBINCOMBS[(n, k)] = s
    v0 = v * s[1]
    return v0

def fstr(x):
    if isinstance(x, Frac):
        return float(x)
    return x

class PiecewiseBernsteinPoly:
    def __init__(self):
        self.pieces = []
        self.diff2pieces = []
        self.diff3pieces = []
        self.diff4pieces = []
        self.valueAtime = 0
        self.valueBtime = 0
        self.pieces2 = []

    def fromcoeffs(coeffs):
        """Creates a PiecewiseBernsteinPoly given a
        polynomial's Bernstein coefficients."""
        return PiecewiseBernsteinPoly().piece(coeffs, 0, 1)

    def _ensure_homogen(self):
        if len(self.pieces2) == len(self.pieces):
            return
        # Homogeneous coefficients
        for i in range(len(self.pieces2), len(self.pieces)):
            coeffs, mn, mx = self.pieces[i]
            n = len(coeffs) - 1
            self.pieces2.append(
                [[coeffs[j] * ccomb(n, j) for j in range(len(coeffs))], mn, mx]
            )
        if len(self.pieces2) != len(self.pieces):
            raise ValueError

    def piece(self, coeffs, mn, mx):
        if len(coeffs) == 0:
            raise ValueError
        # Bernstein coefficients
        self.pieces.append([coeffs, mn, mx])
        return self

    def value(self, x):  # Value of piecewise polynomial
        self._ensure_homogen()
        for coeffs, mn, mx in self.pieces2:
            if x >= mn and x <= mx:
                n = len(coeffs) - 1
                return sum(
                    coeffs[i] * x ** i * (1 - x) ** (n - i)
                    for i in range(0, len(coeffs))
                )
        return 0

    def valuei(self, x):  # Value of piecewise polynomial
        for coeffs, mn, mx in self.pieces:
            if x >= mn and x <= mx:
                n = len(coeffs) - 1
                if len(coeffs) > 200:
                    if x == 0:
                        return FInterval(coeffs[0])
                    if x == 1:
                        return FInterval(coeffs[n])
                    xp = [FINTERVAL_ONE for i in range(n + 1)]
                    xm = [FINTERVAL_ONE for i in range(n + 1)]
                    for i in range(1, n + 1):
                        xp[i] = xp[i - 1] * x
                        xm[i] = xm[i - 1] * (1 - x)
                    v0 = sum(
                        coeffs[i] * binco2(xp[i] * xm[n - i], n, i)
                        for i in range(0, len(coeffs))
                    )
                    return v0
                return sum(
                    FInterval(coeffs[i]) * binco2(x ** i * (1 - x) ** (n - i), n, i)
                    for i in range(0, len(coeffs))
                )
        return 0

    def diff(self, x):  # Derivative of piecewise polynomial
        for coeffs, mn, mx in self.pieces:
            if x >= mn and x <= mx:
                if len(coeffs) <= 1:
                    return 0
                n = len(coeffs) - 1
                return (
                    sum(
                        (coeffs[i + 1] - coeffs[i])
                        * x ** i
                        * (1 - x) ** (n - i - 1)
                        * ccomb(n - 1, i)
                        for i in range(0, len(coeffs) - 1)
                    )
                    * n
                )
        return 0

    def _ensurediff2(self):
        if len(self.diff2pieces) == len(self.pieces):
            return
        # Homogeneous coefficients
        for i in range(len(self.diff2pieces), len(self.pieces)):
            coeffs, mn, mx = self.pieces[i]
            if len(coeffs) <= 2:
                self.diff2pieces.append([None, mn, mx])
            else:
                n = len(coeffs) - 1
                tmp = [
                    (coeffs[j] - 2 * coeffs[j + 1] + coeffs[j + 2])
                    for j in range(len(coeffs) - 2)
                ]
                self.diff2pieces.append([tmp, mn, mx])
        if len(self.diff2pieces) != len(self.pieces):
            raise ValueError

    def _ensurediff3(self):
        if len(self.diff3pieces) == len(self.pieces):
            return
        # Homogeneous coefficients
        for i in range(len(self.diff3pieces), len(self.pieces)):
            coeffs, mn, mx = self.pieces[i]
            if len(coeffs) <= 3:
                self.diff3pieces.append([None, mn, mx])
            else:
                n = len(coeffs) - 1
                tmp = [
                    (coeffs[j + 3] - 3 * coeffs[j + 2] + 3 * coeffs[j + 1] - coeffs[j])
                    for j in range(len(coeffs) - 3)
                ]
                self.diff3pieces.append([tmp, mn, mx])
        if len(self.diff3pieces) != len(self.pieces):
            raise ValueError

    def _ensurediff4(self):
        if len(self.diff4pieces) == len(self.pieces):
            return
        # Homogeneous coefficients
        for i in range(len(self.diff4pieces), len(self.pieces)):
            coeffs, mn, mx = self.pieces[i]
            if len(coeffs) <= 4:
                self.diff4pieces.append([None, mn, mx])
            else:
                n = len(coeffs) - 1
                tmp = [
                    (
                        coeffs[j]
                        - 4 * coeffs[j + 1]
                        + 6 * coeffs[j + 2]
                        - 4 * coeffs[j + 3]
                        + coeffs[j + 4]
                    )
                    for j in range(len(coeffs) - 4)
                ]
                self.diff4pieces.append([tmp, mn, mx])
        if len(self.diff4pieces) != len(self.pieces):
            raise ValueError

    def diff2(self, x):  # Second derivative of piecewise polynomial
        self._ensurediff2()
        for coeffs, mn, mx in self.diff2pieces:
            if x >= mn and x <= mx:
                if coeffs == None:
                    return 0
                n = len(coeffs) - 1
                return sum(
                    coeffs[i] * x ** i * (1 - x) ** (n - i) * ccomb(n, i)
                    for i in range(0, len(coeffs))
                ) * ((n + 1) * (n + 2))
        return 0

    def diff2i(self, x):  # Second derivative of piecewise polynomial
        self._ensurediff2()
        for coeffs, mn, mx in self.diff2pieces:
            if x >= mn and x <= mx:
                if coeffs == None:
                    return 0
                n = len(coeffs) - 1
                if len(coeffs) > 200:
                    if x == 0:
                        return FInterval(coeffs[0])
                    if x == 1:
                        return FInterval(coeffs[n])
                    xp = [FINTERVAL_ONE for i in range(n + 1)]
                    xm = [FINTERVAL_ONE for i in range(n + 1)]
                    for i in range(1, n + 1):
                        xp[i] = xp[i - 1] * x
                        xm[i] = xm[i - 1] * (1 - x)
                    return sum(
                        coeffs[i] * binco2(xp[i] * xm[n - i], n, i)
                        for i in range(0, len(coeffs))
                    )
                return sum(
                    FInterval(coeffs[i]) * binco2(x ** i * (1 - x) ** (n - i), n, i)
                    for i in range(0, len(coeffs))
                ) * ((n + 1) * (n + 2))
        return 0

    def diff3(self, x):  # Third derivative of piecewise polynomial
        self._ensurediff3()
        for coeffs, mn, mx in self.diff3pieces:
            if x >= mn and x <= mx:
                if coeffs == None:
                    return 0
                n = len(coeffs) - 1
                return sum(
                    (coeffs[i]) * binco2(x ** i * (1 - x) ** (n - i), n, i)
                    for i in range(0, len(coeffs))
                ) * ((n + 1) * (n + 2) * (n + 3))
        return 0

    def diff4(self, x):  # Fourth derivative of piecewise polynomial
        self._ensurediff4()
        for coeffs, mn, mx in self.diff4pieces:
            if x >= mn and x <= mx:
                if coeffs == None:
                    return 0
                n = len(coeffs) - 1
                return sum(
                    (coeffs[i]) * binco2(x ** i * (1 - x) ** (n - i), n, i)
                    for i in range(0, len(coeffs))
                ) * ((n + 1) * (n + 2) * (n + 3) * (n + 4))
        return 0

    def diff3i(self, x):  # Third derivative of piecewise polynomial
        self._ensurediff3()
        for coeffs, mn, mx in self.diff3pieces:
            if x >= mn and x <= mx:
                if coeffs == None:
                    return 0
                n = len(coeffs) - 1
                return sum(
                    FInterval(coeffs[i]) * binco2(x ** i * (1 - x) ** (n - i), n, i)
                    for i in range(0, len(coeffs))
                ) * ((n + 1) * (n + 2) * (n + 3))
        return 0

    def diff4i(self, x):  # Fourth derivative of piecewise polynomial
        self._ensurediff4()
        for coeffs, mn, mx in self.diff4pieces:
            if x >= mn and x <= mx:
                if coeffs == None:
                    return 0
                n = len(coeffs) - 1
                return sum(
                    FInterval(coeffs[i]) * binco2(x ** i * (1 - x) ** (n - i), n, i)
                    for i in range(0, len(coeffs))
                ) * ((n + 1) * (n + 2) * (n + 3) * (n + 4))
        return 0

    def get_coeffs(self):
        if len(self.pieces) != 1:
            raise ValueError("likely not a polynomial")
        return [v.reduce() for v in self.pieces[0][0]]

def elevate1(coeffs):  # Elevate polynomial in Bernstein form by 1 degree
    n = len(coeffs) - 1
    return [
        coeffs[max(0, k - 1)] * Frac(k, n + 1)
        + coeffs[min(n, k)] * Frac((n + 1) - k, n + 1)
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
            ccomb(r, k - j) * ccomb(n, j) * coeffs[j]
            for j in range(max(0, k - r), min(n, k) + 1)
        )
        / ccomb(n + r, k)
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
        coeffs = [v.reduce() for v in coeffs]
    return coeffs

"""
#$\tau_2(x,n)$ = (n*x*(x-1)/factorial(2))
#$\tau_3(x,n)$ = (n*x*(-2*x**2+2*x+x-1)/factorial(3))
#$\tau_4(x,n)$ = (n*x*((3*(n+2))*x**3 - (6*(n+2))*x**2 + (3*(n+2))*x+x-1)/factorial(4))

f0,f2,f3,f4=symbols('f0 f2 f3 f4') # For the value and 2nd, 3rd, and 4th derivatives
tau2=(n*x*(x-1)/factorial(2))
tau3=(n*x*(-2*x**2+2*x+x-1)/factorial(3))
tau4=(n*x*((3*(n+2))*x**3 - (6*(n+2))*x**2 + (3*(n+2))*x+x-1)/factorial(4))
bco=f0 + f2*tau2/n**2 + f3*tau3/n**3 + f4*tau4/n**4

When bco is rewritten as a Bernstein polynomial of degree 4, we get
the following Bernstein coefficients:

f0,
f0 - f2/(8*n) - f3/(24*n**2) - f4/(96*n**3),
f0 - f2/(6*n) + f4/(48*n**2) + f4/(36*n**3),
f0 - f2/(8*n) + f3/(24*n**2) - f4/(96*n**3),
f0

"""

def lorentz4poly(pwpoly, n):
    # Polynomial for Lorentz operator with r=4,
    # of degree n+r = n+4, given four times differentiable piecewise polynomial
    # NOTE: Currently well-defined only if value and derivatives are
    # rational whenever k/n is rational
    r = 4
    # Stores homogeneous coefficients for the degree n+4 polynomial.
    vals = [FRAC_ZERO for i in range(n + r + 1)]
    for k in range(0, n + 1):
        f0v = pwpoly.value(Frac(k) / n)  # Value
        f2v = pwpoly.diff2(Frac(k) / n)  # Second derivative
        f3v = pwpoly.diff3(Frac(k) / n)  # Third derivative
        f4v = pwpoly.diff4(Frac(k) / n)  # Fourth derivative
        nck = ccomb(n, k)
        ends = f0v * 1 * nck
        vals[k + 0] += ends
        vals[k + 1] += (
            (f0v - f2v / (8 * n) - f3v / (24 * n ** 2) - f4v / (96 * n ** 3)) * 4 * nck
        )
        vals[k + 2] += (
            (f0v - f2v / (6 * n) + f4v / (48 * n ** 2) + f4v / (36 * n ** 3)) * 6 * nck
        )
        vals[k + 3] += (
            (f0v - f2v / (8 * n) + f3v / (24 * n ** 2) - f4v / (96 * n ** 3)) * 4 * nck
        )
        vals[k + 4] += ends
    # Divide homogeneous coefficient i by (n+r) choose i to turn
    # it into a Bernstein coefficient
    return PiecewiseBernsteinPoly.fromcoeffs(
        [Frac(vals[i]) / ccomb(n + r, i) for i in range(n + r + 1)]
    )

def lorentz2poly(pwpoly, n):
    # Polynomial for Lorentz operator with r=2,
    # of degree n+r = n+2, given twice differentiable piecewise polynomial
    # NOTE: Currently well-defined only if value and diff2 are
    # rational whenever k/n is rational
    r = 2
    # Stores homogeneous coefficients for the degree n+2 polynomial.
    vals = [FRAC_ZERO for i in range(n + r + 1)]
    for k in range(0, n + 1):
        f0v = pwpoly.value(Frac(k) / n)  # Value
        f2v = pwpoly.diff2(Frac(k) / n)  # Second derivative
        nck = ccomb(n, k)
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
        homoc = (f0v - Frac(f2v, 4 * n)) * 2
        # Alternative to above line:
        # "homoc = f0v * 2 - Frac(f2v, 4*n) * 2"
        homoc *= nck
        vals[k + 1] += homoc
    # Divide homogeneous coefficient i by (n+r) choose i to turn
    # it into a Bernstein coefficient
    return PiecewiseBernsteinPoly.fromcoeffs(
        [Frac(vals[i]) / ccomb(n + r, i) for i in range(n + r + 1)]
    )

def pwp2poly(p):
    return bernpoly(p.pieces[0][0], x)

def lorentz2polyB(pwpoly, n, r=2):
    # Polynomial for Lorentz operator with r=0, 1, 2,
    # of degree n+r, given twice differentiable piecewise polynomial
    # NOTE: Currently well-defined only if value (and diff2 if r=2) are
    # rational whenever k/n is rational
    if r != 0 and r != 1 and r != 2:
        raise ValueError("unsupported r")
    # Get degree n coefficients
    vals = [FRAC_ZERO for i in range(n + 1)]
    for k in range(0, n + 1):
        f0v = pwpoly.value(Frac(k) / n)  # Value
        vals[k] = f0v
    # Elevate to degree n+r
    vals = elevate(vals, r)
    if r >= 2:
        # Shift downward according to Lorentz operator
        for k in range(1, n + r):
            f2v = pwpoly.diff2(Frac(k - 1) / n)  # Second derivative
            fv = Frac(f2v, 4 * n) * 2
            # fv=fv*binomial(n,k-1)/binomial(n+r,k)
            # Alternative impl.
            fv = fv * k * (n + 2 - k) / ((n + 1) * (n + 2))
            vals[k] -= fv
    return PiecewiseBernsteinPoly.fromcoeffs(vals)

def lorentz2polyC(pwpoly, n, r=2):
    # Polynomial for Lorentz operator with r=0, 1, 2,
    # of degree n+r given twice differentiable piecewise polynomial
    # Uses fractional intervals.
    # NOTE: Currently well-defined only if value (and diff2 if r=2) are
    # rational whenever k/n is rational
    # NOTE: See note in polyshift w.r.t. fractional intervals.
    if r != 0 and r != 1 and r != 2:
        raise ValueError("unsupported r")
    # Get degree n coefficients
    vals = [FRAC_ZERO for i in range(n + 1)]
    for k in range(0, n + 1):
        f0v = pwpoly.valuei(Frac(k) / n)  # Value
        vals[k] = f0v
    # Elevate to degree n+r
    vals = elevate(vals, r)
    if r >= 2:
        # print(["elevate",r,time.time()-t])
        # Shift downward according to Lorentz operator
        for k in range(1, n + r):
            f2v = pwpoly.diff2i(Frac(k - 1) / n)  # Second derivative
            fv = (f2v / (4 * n)) * 2
            # fv=fv*binomial(n,k-1)/binomial(n+r,k)
            # Alternative impl. to the previous line
            fv = fv * k * (n + 2 - k) / ((n + 1) * (n + 2))
            vals[k] -= fv
    return PiecewiseBernsteinPoly.fromcoeffs(vals)

class FInterval:
    """An interval of two Fractions.  x.sup holds the upper bound, and x.inf holds
    the lower bound."""

    TRUNCATEBITS = 1028
    BITDENOM = 1 << TRUNCATEBITS

    def __new__(cl, v, sup=None, prec=None):
        if isinstance(v, FInterval) and sup == None:
            return v
        scl = super(FInterval, cl)
        self = scl.__new__(cl)
        if isinstance(v, int) and sup == None:
            self.sup = Frac(v)
            self.inf = self.sup
            return self
        elif isinstance(v, int) and isinstance(sup, int):
            self.sup = Frac(sup)
            self.inf = Frac(v)
            return self
        inf = v
        sup = v if sup == None else sup
        self.sup = sup if isinstance(sup, Frac) else Frac(sup)
        self.inf = inf if isinstance(inf, Frac) else Frac(inf)
        # Truncation
        self._truncate()
        return self

    def _truncate(self, bits=TRUNCATEBITS):
        infnum = self.inf.n
        infden = self.inf.d
        supnum = self.sup.n
        supden = self.sup.d
        if (
            supnum.bit_length() < bits
            and supden.bit_length() < bits
            and infnum.bit_length() < bits
            and infden.bit_length() < bits
        ):
            return
        ninf = (infnum << bits) // infden
        ninf = ninf - 1 if infnum < 0 else ninf
        nsup = (supnum << bits) // supden
        nsup = nsup if supnum < 0 else nsup + 1
        self.inf = FRAC_ZERO if ninf == 0 else Frac(ninf, FInterval.BITDENOM)
        self.sup = FRAC_ZERO if nsup == 0 else Frac(nsup, FInterval.BITDENOM)
        if supnum.bit_length() > 10000:
            print(
                [
                    supnum.bit_length(),
                    float(infnum / infden),
                    float(self.inf),
                    float(supnum / supden),
                    float(self.sup),
                ]
            )

    def _truncatend(self, infnum, infden, bits=TRUNCATEBITS):
        if True or (infnum.bit_length() < bits and infden.bit_length() < bits):
            fr = Frac(infnum, infden)
            return FInterval(fr, fr)
        ninf = (infnum << bits) // infden
        nsup = ninf
        ninf = ninf - 1 if infnum < 0 else ninf
        nsup = nsup if infnum < 0 else nsup + 1
        inf = FRAC_ZERO if ninf == 0 else Frac(ninf, FInterval.BITDENOM)
        sup = FRAC_ZERO if nsup == 0 else Frac(nsup, FInterval.BITDENOM)
        return FInterval(inf, sup)

    def _truncatend2(self, infnum, infden, supnum, supden, bits=TRUNCATEBITS):
        if infnum == supnum and infden == supden:
            return self._truncatend(infnum, infden, bits)
        if (
            supnum.bit_length() < bits
            and supden.bit_length() < bits
            and infnum.bit_length() < bits
            and infden.bit_length() < bits
        ):
            return FInterval(Frac(infnum, infden), Frac(supnum, supden))
        ninf = (infnum << bits) // infden
        ninf = ninf - 1 if infnum < 0 else ninf
        nsup = (supnum << bits) // supden
        nsup = nsup if supnum < 0 else nsup + 1
        inf = FRAC_ZERO if ninf == 0 else Frac(ninf, FInterval.BITDENOM)
        sup = FRAC_ZERO if nsup == 0 else Frac(nsup, FInterval.BITDENOM)
        return FInterval(inf, sup)

    def __max__(a, b):
        b = FInterval(b)
        return FInterval(min(a.sup, b.sup), max(a.sup, b.sup))

    def __min__(a, b):
        b = FInterval(b)
        return FInterval(min(a.inf, b.inf), max(a.inf, b.inf))

    def __add__(self, v):
        y = FInterval(v)
        return FInterval(self.inf + y.inf, self.sup + y.sup)

    def __abs__(self):
        return self.abs()

    def negate(self):
        return FInterval(-self.sup, -self.inf)

    def __neg__(self):
        return self.negate()

    def __rsub__(self, v):
        return FInterval(v) - self

    def __rmul__(self, v):
        return FInterval(v) * self

    def __radd__(self, v):
        return FInterval(v) + self

    def __rtruediv__(self, v):
        return FInterval(v) / self

    def __sub__(self, v):
        y = FInterval(v)
        return FInterval(self.inf - y.sup, self.sup - y.inf)

    def __mul__(self, v):
        if self.sup == self.inf:
            isintv = isinstance(v, FInterval)
            if isintv and v.sup == v.inf:
                r = self.inf * v.inf
                return FInterval(r, r)
            if isinstance(v, int):
                rn = self.inf.n * v
                rd = self.inf.d
                return self._truncatend(rn, rd)
            if isinstance(v, Frac):
                rn = self.inf.n * v.n
                rd = self.inf.d * v.d
                return self._truncatend(rn, rd)
            if not isintv:
                r = self.inf * v
                return FInterval(r, r)
        # print([self.inf,"-----",v])
        if isinstance(v, Frac):
            if v >= 0:
                an = self.inf.n * v.n
                ad = self.inf.d * v.d
                bn = self.sup.n * v.n
                bd = self.sup.d * v.d
                return self._truncatend2(an, ad, bn, bd)
            else:
                a = self.inf * v
                b = self.sup * v
                return FInterval(min(a, b), max(a, b))
        if isinstance(v, int):
            a = self.inf * v
            b = self.sup * v
            return FInterval(min(a, b), max(a, b))
        y = FInterval(v)
        if self.inf >= 0 and y.inf >= 0:
            # if self.inf.n.bit_length()+y.inf.n.bit_length()>10000:
            #    print(["imul",self.inf.n.bit_length(),y.inf.n.bit_length()])
            return FInterval(self.inf * y.inf, self.sup * y.sup)
        # print([self.inf,"1-----",v])
        a = self.inf * y.inf
        b = self.inf * y.sup
        c = self.sup * y.inf
        d = self.sup * y.sup
        return FInterval(min([a, b, c, d]), max([a, b, c, d]))

    def __truediv__(self, v):
        if self.sup == self.inf:
            if isinstance(v, FInterval) and v.sup == v.inf:
                r = self.inf / v.inf
                return FInterval(r, r)
            if not isinstance(v, FInterval):
                r = self.inf / v
                return FInterval(r, r)
        y = FInterval(v)
        newinf = Frac(y.sup.d, y.sup.n)
        newsup = Frac(y.inf.d, y.inf.n)
        a = self.inf * newinf
        b = self.inf * newsup
        c = self.sup * newinf
        d = self.sup * newsup
        return FInterval(min([a, b, c, d]), max([a, b, c, d]))

    def abs(self):
        if (self.inf < 0) != (self.sup < 0):
            return FInterval(0, max(abs(self.inf), abs(self.sup)))
        else:
            a = abs(self.inf)
            b = abs(self.sup)
            return FInterval(min(a, b), max(a, b))

    def _fracfloor(x):
        ix = int(x)
        if x >= 0:
            return ix
        if x != ix:
            return ix - 1
        return ix

    def _fracceil(x):
        ix = int(x)
        if x < 0:
            return ix
        if x != ix:
            return ix + 1
        return ix

    def floor(self):
        floorinf = FInterval._fracfloor(self.inf)
        floorsup = FInterval._fracfloor(self.sup)
        return FInterval(min(floorinf, floorsup), max(floorinf, floorsup))

    def ceil(self):
        cinf = FInterval._fracceil(self.inf)
        csup = FInterval._fracceil(self.sup)
        return FInterval(min(cinf, csup), max(cinf, csup))

    def rem(self, v):
        return self - (self / v).floor() * v

    def intersect(self, y):
        if x.sup < y.inf or x.inf > y.sup:
            return None
        return FInterval(max(x.inf, y.inf), min(x.sup, y.sup))

    def reduce(self):
        return self

    def containedIn(self, y):
        return y.inf <= self.inf and self.sup <= y.sup

    def pow(self, yn):
        # Only integer powers supported
        if yn == 0:
            return FInterval(1, 1)
        if yn == 1:
            return self
        while yn > 32:
            self = self.pow(32)
            yn -= 32
        if yn % 2 == 1 or self.inf >= 0:
            return FInterval(self.inf ** yn, self.sup ** yn)
        if self.sup <= 0:
            return FInterval(self.sup ** yn, self.inf ** yn)
        return FInterval(0, max(self.inf ** yn, self.sup ** yn))

    def __pow__(self, v):
        return self.pow(v)

    def __repr__(self):
        return "[%s, %s]" % (float(self.inf), float(self.sup))

def roundLowerCoeffs(lower):
    if not isinstance(lower[0], FInterval):
        return lower
    # Round the coefficients down in a manner
    # that suffices for the Bernoulli factory problem
    # (when coin is not one-sided).
    # NOTE: Merely using the fractional intervals's
    # sup or inf is not guaranteed to form nondecreasing or
    # nonincreasing polynomials
    # that satisfy Bernoulli factory requirements, even if the full-precision
    # values do.  This is because interval arithmetic might produce
    # looser bounds than desired in some cases.
    n = len(lower) - 1
    lf = [lfloor(lower[i].inf, n, i) for i in range(n + 1)]
    alower = sum(1 if lf[i] == lfloor(lower[i].sup, n, i) else 0 for i in range(n + 1))
    if alower != n + 1:
        # Not accurate enough, perhaps because TRUNCATEBITS
        # is too small for all the needed interval calculations
        print(["lower not accurate enough", alower, n])
    return [Frac(lf[i], ccomb(n, i)) for i in range(n + 1)]

def roundUpperCoeffs(upper):
    if not isinstance(upper[0], FInterval):
        return upper
    # Round the coefficients up in a manner
    # that suffices for the Bernoulli factory problem
    # (when coin is not one-sided).
    # See note in roundLowerCoeffs.
    n = len(upper) - 1
    uc = [uceil(upper[i].inf, n, i) for i in range(n + 1)]
    aupper = sum(1 if uc[i] == uceil(upper[i].sup, n, i) else 0 for i in range(n + 1))
    if aupper != n + 1:
        # Not accurate enough, perhaps because TRUNCATEBITS
        # is too small for all the needed interval calculations
        print(["upper not accurate enough", aupper, n])
    ret = [Frac(uc[i], ccomb(n, i)) for i in range(n + 1)]
    return ret

def _sqrtbounds(x, n):
    upper = x + 1
    for i in range(0, n):
        upper = (upper + x / upper) / 2
    lower = x / upper
    if lower > upper:
        raise ValueError
    return FInterval(min(lower, upper), max(lower, upper))

def intervalsqrt(x, n):
    x = FInterval(x)
    return FInterval(_sqrtbounds(x.inf, n).inf, _sqrtbounds(x.sup, n).sup)

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
    alpha = r
    if r < 1 or int(r) != r or (r != 1 and r % 2 != 0):
        raise ValueError("disallowed r")
    n = len(nrcoeffs) - 1 - r  # n+r+1 coefficients
    phi = [
        Frac(theta) / (n ** alpha)
        + (
            intervalsqrt(Frac(i, n) * (1 - Frac(i, n)) / n, 10)
            if alpha == 1
            else (Frac(i, n) * (1 - Frac(i, n)) / n) ** (alpha // 2)
        )
        for i in range(n + 1)
    ]
    phi = elevate(phi, r)
    upper = [nrcoeffs[i] + phi[i] * d for i in range(len(phi))]
    lower = [nrcoeffs[i] - phi[i] * d for i in range(len(phi))]
    upper = roundUpperCoeffs(upper)
    lower = roundLowerCoeffs(lower)
    return upper, lower

def lfloor(v, n, k):
    # NOTE: In Python, integer division has floor semantics
    return v.n * ccomb(n, k) // v.d

def uceil(v, n, k):
    # NOTE: In Python, integer division has floor semantics
    return -((-v.n) * ccomb(n, k) // v.d)

def example2():
    # Example function: A C4 continuous piecewise polynomial
    pwp2 = PiecewiseBernsteinPoly()
    pwp2.piece(
        [
            Frac(1, 384) + Frac(1, 10),
            Frac(953, 9600) + Frac(1, 10),
            Frac(2681, 9600) + Frac(1, 10),
            Frac(4409, 9600) + Frac(1, 10),
            Frac(6137, 9600) + Frac(1, 10),
            Frac(1573, 1920) + Frac(1, 10),
        ],
        Frac(1, 2),
        1,
    )
    pwp2.piece(
        [
            Frac(0, 1) + Frac(1, 10),
            Frac(163, 1280) + Frac(1, 10),
            Frac(2167, 5760) + Frac(1, 10),
            Frac(2267, 3840) + Frac(1, 10),
            Frac(263, 320) + Frac(1, 10),
        ],
        0,
        Frac(1, 2),
    )
    return pwp2

def example1():
    # Example function: A concave piecewise polynomial
    pwp2 = PiecewiseBernsteinPoly()
    pwp2.piece(
        [
            Frac(29) / 60,
            Frac(9, 10),
            Frac(9, 10),
            Frac(9, 10),
            Frac(9, 10),
        ],
        Frac(1, 2),
        1,
    )
    pwp2.piece(
        [
            Frac(163, 320),
            Frac(2867, 2880),
            Frac(2467, 2880),
            Frac(889, 960),
        ],
        0,
        Frac(1, 2),
    )
    return pwp2

class C4PiecewisePoly:
    """This is an algorithm to toss heads with probability equal to
     a piecewise polynomial function (defined on the closed interval [0, 1])
     that is four times differentiable. (Necessary condition is: third derivative is in Zygmund class.)

    The algorithm implements the method of Holtz et al. 2011,
    using polynomials that converge from above and below to the
    target function.  The polynomials approximate the target function
    via a so-called Lorentz operator of degree 4.

    Generally, the algorithm converges at a rate near O(1/n^2) if the input coin
    is close to fair, and near O(1/n^4) if the coin leans heavily towards heads
    or tails.  However, the algorithm relies on Conjecture 34, which is not yet proved.

    pwp is a PiecewiseBernsteinPoly, PolySum, or PolyDiff.

    Reference: Holtz, O., Nazarov, F., Peres, Y., "New Coins from Old, Smoothly", _Constructive Approximation_ 33 (2011).

    """

    def __init__(self, pwp):
        self.pwp = pwp
        self.concave = False
        self.initialdeg = 4
        r = 4
        self.nextdegree = lambda n: max(self.initialdeg + r, (n - r) * 2 + r)
        self.fbelow = lambda n, k: self._fbelow(n, k)
        self.fabove = lambda n, k: self._fabove(n, k)
        self.fbound = lambda n: (0, 1)
        self.polys = {}
        self.lastfn = None
        self.lastdegree = 0

    def _ensure(self, n):
        if n in self.polys:
            return self.polys[n]
        else:
            d = self.lastdegree
            while d <= n:
                d = self.nextdegree(d)
                lastfn_coeffs = None
                # t=time.time(); print("nextdegree %d" % (d))
                if self.lastfn == None:
                    self.lastfn = lorentz4poly(self.pwp, d - 4)
                else:
                    # Iterative construction
                    resid = lorentz4poly(PolyDiff(self.pwp, self.lastfn), d - 4)
                    self.lastfn = PolySum(self.lastfn, resid)
                    self.lastfn = PiecewiseBernsteinPoly.fromcoeffs(
                        self.lastfn.get_coeffs()
                    )
                # print("nextdegree %d done %f" % (d,time.time()-t))
                olddegree = self.lastdegree
                self.lastdegree = d
                if d not in self.polys:
                    # NOTE: Value of 1 is not certain to work for
                    # all functions within this class's scope.
                    up, lo = polyshift(
                        self.lastfn.get_coeffs(), Frac(1897, 1000), 1, r=4
                    )
                    if len(up) != d + 1:
                        raise ValueError
                    # Replace out-of-bounds polynomials with constant polynomials
                    if self.concave:  # Concave special case
                        lo = [self.pwp.value(Frac(i, d)) for i in range(d + 1)]
                    elif min(lo) < 0:
                        lo = [FRAC_ZERO for v in lo]
                    if max(up) > 1:
                        up = [FRAC_ONE for v in up]
                    # print(d, float(min(lo)), float(max(up)))
                    if False:
                        # Verifying whether polynomial meets the
                        # consistency requirement
                        if olddegree in self.polys:
                            lastpolys = self.polys[olddegree]
                            verifyPolys(lo, up, lastpolys[0], lastpolys[1])
                    self.polys[d] = [lo, up]
            if n not in self.polys:
                raise ValueError
            if len(self.polys[n][0]) != n + 1:
                raise ValueError
            if len(self.polys[n][1]) != n + 1:
                raise ValueError
            return self.polys[n]

    def _fbelow(self, n, k):
        return self._ensure(n)[0][k]

    def _fabove(self, n, k):
        return self._ensure(n)[1][k]

    def simulate(self, coin):
        """ - coin(): Function that returns 1 or 0 with a fixed probability."""
        return simulate(coin, self.fbelow, self.fabove, self.fbound, self.nextdegree)

class C2PiecewisePoly:
    def __init__(self, pwp):
        """This is an algorithm to toss heads with probability equal to
         a piecewise polynomial function (defined on the closed interval [0, 1])
         that is twice differentiable. (Necessary condition is: derivative is in Zygmund class.)

        The algorithm implements the method of Holtz et al. 2011,
        using polynomials that converge from above and below to the
        target function.  The polynomials approximate the target function
        via a so-called Lorentz operator of degree 2.

        Generally, the algorithm converges at a rate near O(1/n) if the input coin
        is close to fair, and near O(1/n^2) if the coin leans heavily towards heads
        or tails. However, the algorithm relies on Conjecture 34, which is not yet proved.

        pwp is a PiecewiseBernsteinPoly, PolySum, or PolyDiff.

        Reference: Holtz, O., Nazarov, F., Peres, Y., "New Coins from Old, Smoothly", _Constructive Approximation_ 33 (2011).
        """
        self.pwp = pwp
        self.initialdeg = 4
        self.nextdegree = lambda n: max(self.initialdeg + 2, (n - 2) * 2 + 2)
        self.fbelow = lambda n, k: self._fbelow(n, k)
        self.fabove = lambda n, k: self._fabove(n, k)
        self.fbound = lambda n: (0, 1)
        self.polys = {}
        self.lastfn = None
        self.lastdegree = 0
        self.concave = False

    def _ensure(self, n):
        if n in self.polys:
            return self.polys[n]
        else:
            d = self.lastdegree
            while d <= n:
                d = self.nextdegree(d)
                lastfn_coeffs = None
                # t=time.time(); print("nextdegree %d" % (d))
                if self.lastfn == None:
                    self.lastfn = lorentz2polyC(self.pwp, d - 2)
                else:
                    # Iterative construction
                    resid = lorentz2polyC(PolyDiff(self.pwp, self.lastfn), d - 2)
                    self.lastfn = PolySum(self.lastfn, resid)
                    self.lastfn = PiecewiseBernsteinPoly.fromcoeffs(
                        self.lastfn.get_coeffs()
                    )
                # print("nextdegree %d done %f" % (d,time.time()-t))
                olddegree = self.lastdegree
                self.lastdegree = d
                if d not in self.polys:
                    # NOTE: Value of 1 is not certain to work for
                    # all functions within this class's scope.
                    up, lo = polyshift(self.lastfn.get_coeffs(), Frac(2703, 1000), 1)
                    if len(up) != d + 1:
                        raise ValueError
                    # Replace out-of-bounds polynomials with constant polynomials
                    if self.concave:  # Concave special case
                        lo = roundLowerCoeffs(
                            [self.pwp.valuei(Frac(i, d)) for i in range(d + 1)]
                        )
                    elif min(lo) < 0:
                        lo = [FRAC_ZERO for v in lo]
                    if max(up) > 1:
                        up = [FRAC_ONE for v in up]
                    print(d, float(min(lo[1:-2])), float(max(up[1:-2])))
                    if False:
                        # Verifying whether polynomial meets the
                        # consistency requirement
                        if olddegree in self.polys:
                            lastpolys = self.polys[olddegree]
                            verifyPolys(lo, up, lastpolys[0], lastpolys[1])
                    self.polys[d] = [lo, up]
            if n not in self.polys:
                raise ValueError
            if len(self.polys[n][0]) != n + 1:
                raise ValueError
            if len(self.polys[n][1]) != n + 1:
                raise ValueError
            return self.polys[n]

    def _fbelow(self, n, k):
        return self._ensure(n)[0][k]

    def _fabove(self, n, k):
        return self._ensure(n)[1][k]

    def simulate(self, coin):
        """ - coin(): Function that returns 1 or 0 with a fixed probability."""
        return simulate(coin, self.fbelow, self.fabove, self.fbound, self.nextdegree)

def verifyPolys(lo, up, lastlo, lastup):
    # Check consistency requirement of polynomials'
    # Bernstein coefficients, as needed
    # for the Bernoulli factory problem
    if len(lastlo) > len(lo):
        raise ValueError
    if len(lo) != len(up) or len(lastlo) != len(lastup):
        raise ValueError
    degdiff = len(lo) - len(lastlo)
    lastlo = elevate(lastlo, degdiff)
    lastup = elevate(lastup, degdiff)
    for prev, curr in zip(lastlo, lo):
        if prev > curr:
            # print([float(v) for v in lastlo])
            # print([float(v) for v in lo])
            raise ValueError("invalid lower curve: deg=%d" % (len(lo) - 1))
    for prev, curr in zip(lastup, up):
        if prev < curr:
            # print([float(v) for v in lastup])
            # print([float(v) for v in up])
            raise ValueError("invalid upper curve: deg=%d" % (len(up) - 1))

class C2PiecewisePoly2:
    def __init__(self, pwp):
        """ pwp is a PiecewiseBernsteinPoly, PolySum, or PolyDiff. """
        self.pwp = pwp
        self.initialdeg = 4
        self.nextdegree = lambda n: max(self.initialdeg, n * 2)
        self.fbelow = lambda n, k: self._fbelow(n, k)
        self.fabove = lambda n, k: self._fabove(n, k)
        self.fbound = lambda n: (0, 1)
        self.polys = {}

    def _ensure(self, n):
        if n in self.polys:
            return self.polys[n]
        else:
            # Frac("3.75") is absolute maximum value of second derivative
            # for example function
            up = [
                self.pwp.value(Frac(i, n)) + Frac(1, 7 * n) * Frac(375, 100)
                for i in range(n + 1)
            ]
            lo = [
                self.pwp.value(Frac(i, n)) - Frac(1, 7 * n) * Frac(375, 100)
                for i in range(n + 1)
            ]
            # Replace out-of-bounds polynomials with constant polynomials
            if min(lo) < 0:
                lo = [FRAC_ZERO for v in lo]
            if max(up) > 1:
                up = [FRAC_ONE for v in up]
            lo = [Frac(int(v * 2 ** n), 2 ** n) for v in lo]
            up = [
                Frac(int(v * 2 ** n), 2 ** n)
                if v == Frac(int(v * 2 ** n), 2 ** n)
                else Frac(int(v * 2 ** n) + 1, 2 ** n)
                for v in up
            ]
            # print(float(min(lo)), float(max(up)))
            if False:
                if n // 2 in self.polys:
                    lastpolys = self.polys[n // 2]
                    verifyPolys(lo, up, lastpolys[0], lastpolys[1])
            self.polys[n] = [lo, up]
            if n not in self.polys:
                raise ValueError
            return self.polys[n]

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
    return Frac(int(Frac(fbelow(a, b)) * v), v)

def _fa2(fabove, a, b, v=1):
    if b > a:
        raise ValueError
    mv = Frac(fabove(a, b)) * v
    imv = int(mv)
    return Frac(imv, v) if mv == imv else Frac(imv + 1, v)

def simulate(coin, fbelow, fabove, fbound, nextdegree=None):
    """Simulates a general factory function defined by two
    sequences of polynomials that converge from above and below.
    - coin(): Function that returns 1 or 0 with a fixed probability.
    - fbelow(n, k): Calculates the kth Bernstein coefficient (not the value),
      or a lower bound thereof, for the degree-n lower polynomial (k starts at 0).
    - fabove(n, k): Calculates the kth Bernstein coefficient (not the value),
      or an upper bound thereof, for the degree-n upper polynomial.
    - fbound(n): Returns a tuple or list specifying a lower and upper bound
       among the values of fbelow and fabove, respectively, for the given n.
     - nextdegree(n): Returns a lambda returning the next degree after the
       given degree n for which a polynomial is available; the lambda
       must return an integer greater than n.
       Optional.  If not given, the first degree is 1 and the next degree is n*2
       (so that for each power of 2 as well as 1, a polynomial of that degree
       must be specified)."""
    ones = 0
    lastdegree = 0
    l = Frac(0)
    lt = Frac(0)
    u = Frac(1)
    ut = Frac(1)
    degree = nextdegree(0) if nextdegree != None else 1
    while True:
        fb = fbound(degree)
        if fb[0] >= 0 and fb[1] <= 1:
            break
        degree = nextdegree(degree) if nextdegree != None else degree * 2
    startdegree = degree
    fba = {}
    faa = {}
    ret = random.random()
    while True:
        # The following condition should not be present for exact
        # simulation, but is here in order to keep simulation
        # times reasonable
        if degree >= 8192:
            print("skipped")
            return 0
        for i in range(degree - lastdegree):
            if coin() == 1:
                ones += 1
        c = ccomb(degree, ones)
        md = degree
        l = _fb2(fbelow, degree, ones, c << md)
        u = _fa2(fabove, degree, ones, c << md)
        # fba[(degree, ones)] = l
        # faa[(degree, ones)] = u
        ls = Frac(0)
        us = Frac(1)
        if degree > startdegree:
            nh = ccomb(degree, ones)
            md = lastdegree
            combs = [
                Frac(
                    ccomb(degree - lastdegree, ones - j) * ccomb(lastdegree, j),
                    nh,
                )
                for j in range(0, min(lastdegree, ones) + 1)
            ]
            if False:  # Correctness check
                for j in range(0, min(lastdegree, ones) + 1):
                    fb = _fb2(fbelow, lastdegree, j, (1 * ccomb(lastdegree, j)) << md)
                    if (lastdegree, j) in fba:
                        # print(fb)
                        if fba[(lastdegree, j)] != fb:
                            raise ValueError
                    fa = _fa2(fabove, lastdegree, j, (1 * ccomb(lastdegree, j)) << md)
                    if (lastdegree, j) in faa:
                        # print(fa)
                        if faa[(lastdegree, j)] != fa:
                            raise ValueError
            ls = sum(
                _fb2(fbelow, lastdegree, j, (1 * ccomb(lastdegree, j)) << md) * combs[j]
                for j in range(0, min(lastdegree, ones) + 1)
            )
            us = sum(
                _fa2(fabove, lastdegree, j, (1 * ccomb(lastdegree, j)) << md) * combs[j]
                for j in range(0, min(lastdegree, ones) + 1)
            )
            if ls > l:
                # print([lastdegree,degree,ones,"ls",float(ls),"l",float(l)])
                raise ValueError
            if us < u:
                # print([lastdegree,degree,ones,"us",float(us),"u",float(u)])
                raise ValueError
        m = (ut - lt) / (us - ls)
        lt = lt + (l - ls) * m
        ut = ut - (us - u) * m
        # print([ret,"lt",float(lt),"ut",float(ut),"l",float(l),"u",float(u)])
        if ret <= lt:
            return 1
        if ret >= ut:
            return 0
        lastdegree = degree
        degree = nextdegree(degree) if nextdegree != None else degree * 2

_dogcd = 0

class Frac:
    def __new__(cl, n, d=1):
        global _dogcd
        isfrac = isinstance(n, Frac)
        if isfrac and d == 1:
            return n
        scl = super(Frac, cl)
        self = scl.__new__(cl)
        if isinstance(n, Fraction):
            if d == 1:
                self.n = n.numerator
                self.d = n.denominator
            elif isinstance(d, int):
                self.n = n.numerator
                self.d = n.denominator * d
            else:
                n /= d
                self.n = n.numerator
                self.d = n.denominator
        elif isfrac and isinstance(d, int):
            self.n = n.n
            self.d = n.d * d
        elif (not isfrac) and (isinstance(n, float) and d == 1):
            n = Fraction(n)
            self.n = n.numerator
            self.d = n.denominator
        else:
            _dogcd += 1
            if _dogcd > 30:
                # Do lowest-terms reduction only occasionally,
                # rather than every time a Frac is created.
                # Doing so significantly improves performance
                _dogcd = 0
                try:
                    v = Fraction(n, d)
                    self.n = v.numerator
                    self.d = v.denominator
                except:
                    # print([n,d])
                    raise ValueError
            else:
                self.n = n
                self.d = d
        # if self.n==0: self.d=1
        if self.d <= 0:
            raise ValueError
        return self

    def reduce(self):
        return Frac(Fraction(self.n, self.d))

    def __min__(a, b):
        b = Frac(b)
        return b if a.n * b.d - a.d * b.n > 0 else a

    def __max__(a, b):
        b = Frac(b)
        return a if a.n * b.d - a.d * b.n > 0 else b

    def __add__(self, v):
        v = Frac(v)
        return Frac(self.n * v.d + self.d * v.n, self.d * v.d)

    def __abs__(self):
        return Frac(abs(self.n), self.d)

    def __neg__(self):
        return Frac(-self.n, self.d)

    def __rsub__(self, v):
        return Frac(v) - self

    def __rmul__(self, v):
        return Frac(v) * self

    def __radd__(self, v):
        return Frac(v) + self

    def __rtruediv__(self, v):
        return Frac(v) / self

    def __sub__(self, v):
        v = Frac(v)
        return Frac(self.n * v.d - self.d * v.n, self.d * v.d)

    def __mul__(self, v):
        if isinstance(v, int):
            return Frac(self.n * v, self.d)
        try:
            return Frac(self.n * v.n, self.d * v.d)
        except:
            v = Frac(v)
            return Frac(self.n * v.n, self.d * v.d)

    def __truediv__(self, v):
        v = Frac(v)
        return Frac(self.n * v.d, self.d * v.n)

    def __pow__(self, v):
        # Only integer powers supported
        # if (self.n.bit_length()*v)>10000:
        #   print(["pow",self.n.bit_length(),self.d.bit_length(),"v",v])
        return Frac(self.n ** v, self.d ** v)

    def __repr__(self):
        return "Frac(%s, %s)" % (self.n, self.d)

    def __float__(self):
        return float(Fraction(self.n, self.d))

    def __int__(self):
        return (-1 if self.n < 0 else 1) * (abs(self.n) // self.d)

    def __lt__(a, b):
        try:
            if a.n < 0 and b.n >= 0:
                return True
            if b.n < 0 and a.n >= 0:
                return False
            return a.n * b.d - a.d * b.n < 0
        except:
            b = Frac(b)
            if a.n < 0 and b.n >= 0:
                return True
            if b.n < 0 and a.n >= 0:
                return False
            return a.n * b.d - a.d * b.n < 0

    def __gt__(a, b):
        try:
            if a.n < 0 and b.n >= 0:
                return False
            if b.n < 0 and a.n >= 0:
                return True
            return a.n * b.d - a.d * b.n > 0
        except:
            b = Frac(b)
            if a.n < 0 and b.n >= 0:
                return False
            if b.n < 0 and a.n >= 0:
                return True
            return a.n * b.d - a.d * b.n > 0

    def __eq__(a, b):
        try:
            if b is None:
                return False
            if a.n < 0 and b.n >= 0:
                return False
            if b.n < 0 and a.n >= 0:
                return False
            return a.n * b.d - a.d * b.n == 0
        except:
            try:
                b = Frac(b)
                if a.n < 0 and b.n >= 0:
                    return False
                if b.n < 0 and a.n >= 0:
                    return False
                return a.n * b.d - a.d * b.n == 0
            except:
                return False

    def __le__(a, b):
        b = Frac(b)
        return a.n * b.d - a.d * b.n <= 0

    def __ge__(a, b):
        b = Frac(b)
        return a.n * b.d - a.d * b.n >= 0

FRAC_ZERO = Frac(0)
FRAC_ONE = Frac(1)
FINTERVAL_ONE = FInterval(Frac(1))
