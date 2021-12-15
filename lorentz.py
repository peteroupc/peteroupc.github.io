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
        return (v * s[0]) * s[1]
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
    s = [0, 0]
    s[0] = Frac(num, den).reduce()
    v *= s[0]
    num = 1
    den = 1
    for i in range(split, n + 1):
        num *= i
        den *= n - i + 1
    s[1] = Frac(num, den).reduce()
    SPLITBINCOMBS[(n, k)] = s
    return v * s[1]

class PiecewiseBernsteinPoly:
    def __init__(self):
        self.pieces = []
        self.diff2pieces = []
        self.valueAtime = 0
        self.valueBtime = 0
        self.pieces2 = []

    def fromcoeffs(coeffs):
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
                return sum(
                    FInterval(coeffs[i]) * binco2(x ** i * (1 - x) ** (n - i), n, i)
                    # * (x ** i * (1 - x) ** (n - i) * ccomb(n, i))
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
                return sum(
                    FInterval(coeffs[i]) * binco2(x ** i * (1 - x) ** (n - i), n, i)
                    # * (x ** i * (1 - x) ** (n - i) * ccomb(n, i))
                    for i in range(0, len(coeffs))
                ) * ((n + 1) * (n + 2))
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
        # totalbits=sum(v.n.bit_length()+v.d.bit_length() for v in coeffs)
        coeffs = [v.reduce() for v in coeffs]
        # totalbits2=sum(v.n.bit_length()+v.d.bit_length() for v in coeffs)
        # print(totalbits,totalbits2)
    return coeffs

def lorentz2poly(pwpoly, n):
    # Polynomial for Lorentz operator with r=2,
    # of degree n+r = n+2, given C2 continuous piecewise polynomial
    # NOTE: Currently well-defined only if value and diff2 are
    # rational whenever k/n is rational
    r = 2
    # Stores homogeneous coefficients for the degree n+2 polynomial.
    vals = [0 for i in range(n + r + 1)]
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
        # Bernstein coefficient times choose(2,1)
        # times n choose k, for the
        # (k+1)th homogeneous coefficient of
        # the degree n+2 polynomial
        homoc = (f0v - Frac(f2v, 4 * n)) * 2
        # Alternative to above line:
        # "homoc = f0v * 2 - Frac(f2v, 4*n) * 2"
        homoc *= nck
        vals[k + 1] += homoc
        homoc = f0v * 1
        homoc *= nck
        vals[k + 2] += homoc
    # Divide homogeneous coefficient i by (n+r) choose i to turn
    # it into a Bernstein coefficient
    return PiecewiseBernsteinPoly.fromcoeffs(
        [Frac(vals[i]) / ccomb(n + r, i) for i in range(n + r + 1)]
    )

def pwp2poly(p):
    return bernpoly(p.pieces[0][0], x)

def lorentz2polyB(pwpoly, n):
    # Polynomial for Lorentz operator with r=2,
    # of degree n+r = n+2, given C2 continuous piecewise polynomial
    # NOTE: Currently well-defined only if value and diff2 are
    # rational whenever k/n is rational
    r = 2
    # Get degree n coefficients
    vals = [0 for i in range(n + 1)]
    for k in range(0, n + 1):
        f0v = pwpoly.value(Frac(k) / n)  # Value
        vals[k] = f0v
    # Elevate to degree n+r
    vals = elevate(vals, r)
    # Shift downward according to Lorentz operator
    for k in range(1, n + r):
        f2v = pwpoly.diff2(Frac(k - 1) / n)  # Second derivative
        fv = Frac(f2v, 4 * n) * 2
        # fv=fv*ccomb(n,k-1)/ccomb(n+r,k)
        # Alternative impl.
        fv = fv * k * (n + 2 - k) / ((n + 1) * (n + 2))
        vals[k] -= fv
    return PiecewiseBernsteinPoly.fromcoeffs(vals)

def lorentz2polyC(pwpoly, n):
    # Polynomial for Lorentz operator with r=2,
    # of degree n+r = n+2, given C2 continuous piecewise polynomial
    # Uses fractional intervals.
    # NOTE: Currently well-defined only if value and diff2 are
    # rational whenever k/n is rational
    # NOTE: See note in polyshift w.r.t. fractional intervals.
    r = 2
    # Get degree n coefficients
    vals = [0 for i in range(n + 1)]
    for k in range(0, n + 1):
        f0v = pwpoly.valuei(Frac(k) / n)  # Value
        vals[k] = f0v
    # Elevate to degree n+r
    # t=time.time()
    vals = elevate(vals, r)
    # print(["elevate",r,time.time()-t])
    # Shift downward according to Lorentz operator
    for k in range(1, n + r):
        f2v = pwpoly.diff2i(Frac(k - 1) / n)  # Second derivative
        fv = (f2v / (4 * n)) * 2
        # fv=fv*ccomb(n,k-1)/ccomb(n+r,k)
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
        self.sup = sup if isinstance(sup, Fraction) else Frac(sup)
        self.inf = inf if isinstance(inf, Fraction) else Frac(inf)
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
        self.inf = Frac(ninf, FInterval.BITDENOM)
        self.sup = Frac(nsup, FInterval.BITDENOM)
        # if supnum.bit_length()>20000:
        #  print([supnum.bit_length(),float(infnum/infden),float(self.inf),float(supnum/supden),float(self.sup)])

    def _truncatend(self, infnum, infden, bits=TRUNCATEBITS):
        if True or infnum.bit_length() < bits and infden.bit_length() < bits:
            fr = Frac(infnum, infden)
            return FInterval(fr, fr)
        ninf = (infnum << bits) // infden
        nsup = ninf
        ninf = ninf - 1 if infnum < 0 else ninf
        nsup = nsup if infnum < 0 else nsup + 1
        inf = Frac(ninf, FInterval.BITDENOM)
        sup = Frac(nsup, FInterval.BITDENOM)
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
        inf = Frac(ninf, FInterval.BITDENOM)
        sup = Frac(nsup, FInterval.BITDENOM)
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
            if isinstance(v, FInterval) and v.sup == v.inf:
                r = self.inf * v.inf
                return FInterval(r, r)
            if isinstance(v, int):
                rn = self.inf.n * v
                rd = self.inf.d * v
                return self._truncatend(rn, rd)
            if isinstance(v, Frac):
                rn = self.inf.n * v.n
                rd = self.inf.d * v.d
                return self._truncatend(rn, rd)
            if not isinstance(v, FInterval):
                r = self.inf * v
                return FInterval(r, r)
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
        # print([self.inf,"-----",v])
        if self.inf >= 0 and y.inf >= 0:
            return FInterval(self.inf * y.inf, self.sup * y.sup)
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
        if yn % 2 == 1 or self.inf >= 0:
            return FInterval(self.inf ** yn, self.sup ** yn)
        if self.sup <= 0:
            return FInterval(self.sup ** yn, self.inf ** yn)
        return FInterval(0, max(self.inf ** yn, self.sup ** yn))

    def __pow__(self, v):
        """ For convenience only. """
        return self.pow(v)

    def __repr__(self):
        return "[%s, %s]" % (float(self.inf), float(self.sup))

"""

Here is my current progress for the Lorentz operator for $\alpha=2$, so $r=2$ (which applies to twice-differentiable functions with Hölder continuous second derivative, even though the paper appears not to apply when $\alpha$ is an integer). Is the following work correct?

The Lorentz operator for $r=2$ finds the degree-n Bernstein polynomial for the target function $f$, elevates it to degree $n+r$, then shifts the coefficient at $k+1$ by $-f\prime\prime(k/n) A(n,k)$ (but the coefficients at 0 and $n+r$ are not shifted this way), where:

$$A(n,k) = (1/(4*n)) * 2 *(n+2-k)/((n+1)*(n+2)),$$

where $k$ is an integer in $[0,n+r]$. Observing that $A(n,k)$ equals 0 at 0 and at $n+r$, and has a peak at $(n+r)/2$,
the shift will be no greater (in absolute value) than
$A(n,(n+r)/2)*F$, where $F$ is the maximum absolute value
of the second derivative of $f(\lambda)$.  $A(n,(n+r)/2)$ is bounded
above by $(3/16)/n$ for $n\ge 1$, and by $(3/22)/n$ for $n\ge 10$.

Now, find $\theta_\alpha$ for $\alpha=2$, according to Lemma 25:

Let $0<\gamma<2^{\alpha/2}-1$ ($\gamma<1$ if $\alpha=2$).

Solve for $K$: $$(1-(1+\gamma)/2^{\alpha/2} - 4/(4*K)) = 0.$$  The solution for $\alpha=2$ is $K = 2/(1-\gamma)$.

Now find:  $$\theta_a = ((4/4)*K^{\alpha/2}/n^\alpha) / ((1-(1+\gamma)/2^\alpha)/n^\alpha)$$ The solution for $\alpha=2$ is $\theta_a = 8/((\gamma-3)*(\gamma-1))$.

For $\gamma=1/100$ and $\alpha=2$, $\theta_a = 80000/29601 \approx 2.703$.

There's no need to check whether the output polynomials have Bernstein coefficients in $(0, 1)$, since out-of-bounds polynomials will be replaced with 0 or 1 as necessary &mdash; which is more practical and convenient.

Now all that remains is to find $D$ given $\alpha=2$.  I haven't found how to do so yet.

Moreover, there remains to find the parameters for the Lorentz operator when $r>2$.
"""

def iterconstruct(pwp):
    # Iterative construction of approximating
    # polynomials using Lorentz-2 operator
    n = 4
    fn = lorentz2polyB(pwp, n)
    # Polynomial of degree 4+r, where r=2
    ret = [fn.get_coeffs()]
    for i in range(5):
        # Build polynomials of degree 8+r, 16+r,
        # 32+r, 64+r, 128+r, where r=2
        n *= 2
        resid = lorentz2polyB(PolyDiff(pwp, fn), n)
        fn = PolySum(fn, resid)
        ret.append(fn.get_coeffs())
    return ret

def polyshift(nrcoeffs, theta, d):
    # Upward and downward shift of polynomial according to step 5
    # in Holtz et al. 2011, for r=2 (twice differentiable
    # functions with Hölder continuous second derivative)
    # NOTE: Supports fraction intervals (with lower and upper
    # bounds of limited precision), but the fractional intervals's
    # sup or inf are not guaranteed to form monotonic polynomials
    # that satisfy Bernoulli factory requirements, even if the full-precision
    # values do.  This is because interval arithmetic might produce
    # looser bounds than desired in some cases.
    if theta < 1:
        raise ValueError("disallowed theta")
    r = 2
    alpha = r
    n = len(nrcoeffs) - 1 - r  # n+r+1 coefficients
    phi = [
        Frac(theta) / (n ** alpha) + (Frac(i, n) * (1 - Frac(i, n)) / n)
        for i in range(n + 1)
    ]
    phi = elevate(phi, r)
    upper = [nrcoeffs[i] + phi[i] * d for i in range(len(phi))]
    lower = [nrcoeffs[i] - phi[i] * d for i in range(len(phi))]
    if isinstance(nrcoeffs[0], FInterval):
        # Round the coefficients down and up in a manner
        # that suffices for the Bernoulli factory problem
        # (when coin is not one-sided).
        uc = [uceil(upper[i].inf, n + r, i) for i in range(n + r + 1)]
        lf = [lfloor(lower[i].inf, n + r, i) for i in range(n + r + 1)]
        aupper = sum(
            1 if uc[i] == uceil(upper[i].sup, n + r, i) else 0 for i in range(n + r + 1)
        )
        alower = sum(
            1 if lf[i] == lfloor(lower[i].sup, n + r, i) else 0
            for i in range(n + r + 1)
        )
        if aupper != n + r + 1:
            print(["upper not accurate enough", aupper, n + r])
        if alower != n + r + 1:
            print(["lower not accurate enough", alower, n + r])
        # upper = [upper[i].sup for i in range(n+r+1)]
        # lower = [lower[i].inf for i in range(n+r+1)]
        upper = [Frac(uc[i], ccomb(n + r, i)) for i in range(n + r + 1)]
        lower = [Frac(lf[i], ccomb(n + r, i)) for i in range(n + r + 1)]
        # print([float(v) for v in upper])
        # print([float(v) for v in lower])
    return upper, lower

def lfloor(v, n, k):
    # NOTE: In Python, integer division has floor semantics
    return v.n * ccomb(n, k) // v.d

def uceil(v, n, k):
    # NOTE: In Python, integer division has floor semantics
    return -((-v.n) * ccomb(n, k) // v.d)

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

class C2PiecewisePoly:
    # Implements Holtz method with Lorentz operator of degree 2.
    # For piecewise polynomials that are C2 continuous.
    def __init__(self, pwp):
        self.pwp = pwp
        self.initialdeg = 4
        self.nextdegree = lambda n: max(self.initialdeg + 2, (n - 2) * 2 + 2)
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
                # t=time.time(); print("nextdegree %d" % (d))
                if self.lastfn == None:
                    self.lastfn = lorentz2polyC(self.pwp, d - 2)
                else:
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
                    if min(lo) < 0:
                        lo = [0 for v in lo]
                    if max(up) > 1:
                        up = [1 for v in up]
                    print(d, float(min(lo)), float(max(up)))
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
            print([float(v) for v in lastlo])
            print([float(v) for v in lo])
            raise ValueError("invalid lower curve: deg=%d" % (len(lo) - 1))
    for prev, curr in zip(lastup, up):
        if prev < curr:
            print([float(v) for v in lastup])
            print([float(v) for v in up])
            raise ValueError("invalid upper curve: deg=%d" % (len(up) - 1))

class C2PiecewisePoly2:
    def __init__(self, pwp):
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
                lo = [0 for v in lo]
            if max(up) > 1:
                up = [1 for v in up]
            lo = [Frac(int(v * 2 ** n), 2 ** n) for v in lo]
            up = [
                Frac(int(v * 2 ** n), 2 ** n)
                if v == Frac(int(v * 2 ** n), 2 ** n)
                else Frac(int(v * 2 ** n) + 1, 2 ** n)
                for v in up
            ]
            print(float(min(lo)), float(max(up)))
            """
            if n//2 in self.polys:
                lastpolys=self.polys[n//2]
                verifyPolys(lo,up,lastpolys[0],lastpolys[1])
            """
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
            if degree >= 8192:
                return 0
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
        if isinstance(n, Frac) and d == 1:
            return n
        scl = super(Frac, cl)
        self = scl.__new__(cl)
        if isinstance(n, Fraction) and d == 1:
            self.n = n.numerator
            self.d = n.denominator
        elif isinstance(n, Frac) and isinstance(d, int):
            self.n = n.n
            self.d = n.d * d
        elif isinstance(n, Fraction) and isinstance(d, int):
            self.n = n.numerator
            self.d = n.denominator * d
        elif isinstance(n, float) and d == 1:
            n = Fraction(n)
            self.n = n.numerator
            self.d = n.denominator
        else:
            _dogcd += 1
            if _dogcd > 15:
                # Do lowest-terms reduction only occasionally,
                # rather than every time a Fraction is created.
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
        if self.d < 0:
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
        # if self.n.bit_length()>100000:raise ValueError
        # print([self.n.bit_length(),self.d.bit_length(),v.n.bit_length(),v.d.bit_length()])
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
        v = Frac(v)
        return Frac(self.n * v.n, self.d * v.d)

    def __truediv__(self, v):
        v = Frac(v)
        return Frac(self.n * v.d, self.d * v.n)

    def __pow__(self, v):
        # Only integer powers supported
        return Frac(self.n ** v, self.d ** v)

    def __repr__(self):
        return "Frac(%s, %s)" % (self.n, self.d)

    def __float__(self):
        return float(Fraction(self.n, self.d))

    def __int__(self):
        return (-1 if self.n < 0 else 1) * (abs(self.n) // self.d)

    def __lt__(a, b):
        b = Frac(b)
        if a.n < 0 and b.n >= 0:
            return True
        if b.n < 0 and a.n >= 0:
            return False
        return a.n * b.d - a.d * b.n < 0

    def __gt__(a, b):
        b = Frac(b)
        if a.n < 0 and b.n >= 0:
            return False
        if b.n < 0 and a.n >= 0:
            return True
        return a.n * b.d - a.d * b.n > 0

    def __le__(a, b):
        b = Frac(b)
        return a.n * b.d - a.d * b.n <= 0

    def __ge__(a, b):
        b = Frac(b)
        return a.n * b.d - a.d * b.n >= 0
