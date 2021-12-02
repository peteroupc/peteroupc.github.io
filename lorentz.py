from fractions import Fraction
import math

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

    def get_coeffs(self):
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

    def get_coeffs(self):
        a = self.a.get_coeffs()
        b = self.b.get_coeffs()
        if len(a) < len(b):
            a = elevate(a, (len(b) - 1) - (len(a) - 1))
        if len(a) > len(b):
            b = elevate(b, (len(b) - 1) - (len(a) - 1))
        return [aa - bb for aa, bb in zip(a, b)]

class PiecewiseBernsteinPoly:
    def __init__(self):
        self.pieces = []

    def fromcoeffs(coeffs):
        return PiecewiseBernsteinPoly().piece(coeffs, 0, 1)

    def piece(self, coeffs, mn, mx):
        if len(coeffs) == 0:
            raise ValueError
        self.pieces.append([coeffs, mn, mx])
        return self

    def value(self, x):  # Value of piecewise polynomial
        for coeffs, mn, mx in self.pieces:
            if x >= mn and x <= mx:
                n = len(coeffs) - 1
                return sum(
                    coeffs[i] * x ** i * (1 - x) ** (n - i) * math.comb(n, i)
                    for i in range(len(coeffs))
                )
        return 0

    def diff(self, x):  # Derivative of piecewise polynomial
        for coeffs, mn, mx in self.pieces:
            if x >= mn and x <= mx:
                if len(coeffs) <= 1:
                    return 0
                n = len(coeffs) - 1
                return sum(
                    (coeffs[i + 1] - coeffs[i])
                    * n
                    * x ** i
                    * (1 - x) ** (n - i - 1)
                    * math.comb(n - 1, i)
                    for i in range(0, len(coeffs) - 1)
                )
        return 0

    def diff2(self, x):  # Second derivative of piecewise polynomial
        for coeffs, mn, mx in self.pieces:
            if x >= mn and x <= mx:
                if len(coeffs) <= 2:
                    return 0
                n = len(coeffs) - 1
                return sum(
                    n
                    * (n - 1)
                    * (coeffs[i] - 2 * coeffs[i + 1] + coeffs[i + 2])
                    * x ** i
                    * (1 - x) ** (n - i - 2)
                    * math.comb(n - 2, i)
                    for i in range(0, len(coeffs) - 2)
                )
        return 0

    def to_degree(self, degree):
        pbp = PiecewiseBernsteinPoly()
        for coeffs, mn, mx in self.pieces:
            piecedeg = len(coeffs) - 1
            if piecedeg > degree:
                raise ValueError("Degree already higher than requested")
            pbp.piece(elevate(coeffs, degree - piecedeg), mn, mx)
        return pbp

    def get_coeffs(self):
        if len(self.pieces) != 1:
            raise ValueError("likely not a polynomial")
        return self.pieces[0][0]

def bincocache(c, n, k):  # Cache for binomial coefficients
    if (n, k) in c:
        return c[(n, k)]
    v = Fraction(math.comb(n, k))
    c[(n, k)] = v
    return v

def elevate(coeffs, r):  # Elevate polynomial in Bernstein form by r degrees
    if r < 0:
        raise ValueError
    if r == 0:
        return coeffs
    combs = {}
    n = len(coeffs) - 1
    return [
        sum(
            bincocache(combs, r, k - j)
            * bincocache(combs, n, j)
            * coeffs[j]
            / bincocache(combs, n + r, k)
            for j in range(max(0, k - r), min(n, k) + 1)
        )
        for k in range(n + r + 1)
    ]

def lorentz2poly(pwpoly, n):
    # Polynomial for Lorentz operator with r=2,
    # of degree n+r = n+2, given C2 continuous piecewise polynomial
    # NOTE: Currently well-defined only if value and diff are
    # rational whenever k/n is rational
    r = 2
    vals = [0 for i in range(n + r + 1)]
    for k in range(0, n + 1):
        f0v = pwpoly.value(Fraction(k) / n)  # Value
        f2v = pwpoly.diff2(Fraction(k) / n)  # Second derivative
        nck = math.comb(n, k)
        vals[k + 0] += f0v * 1 * nck
        vals[k + 1] += (f0v - Fraction(f2v, 4 * n)) * 2 * nck
        vals[k + 2] += f0v * 1 * nck
    return PiecewiseBernsteinPoly.fromcoeffs(
        [Fraction(vals[i]) / math.comb(n + r, i) for i in range(n + r + 1)]
    )

def iterconstruct(pwp, x):
    # Iterative construction of polynomials using Lorentz-2 operator
    n = 4
    fn = lorentz2poly(pwp, n)
    ret = [fn.get_coeffs()]
    for i in range(5):
        # Build polynomials of degree 8+r, 16+r,
        # 32+r, 64+r, 128+r, where r=2
        n *= 2
        resid = lorentz2poly(PolyDiff(pwp, fn), n)
        fn = PolySum(fn, resid)
        ret.append(fn.get_coeffs())
    return ret
