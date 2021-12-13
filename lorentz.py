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

class PiecewiseBernsteinPoly:
    def __init__(self):
        self.pieces = []
        self.comb = {}
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
                [[coeffs[j] * math.comb(n, j) for j in range(len(coeffs))], mn, mx]
            )
        if len(self.pieces2) != len(self.pieces):
            raise ValueError

    def piece(self, coeffs, mn, mx):
        if len(coeffs) == 0:
            raise ValueError
        # Bernstein coefficients
        self.pieces.append([coeffs, mn, mx])
        return self

    def valueC(self, x):  # Value of piecewise polynomial
        for coeffs, mn, mx in self.pieces:
            if x >= mn and x <= mx:
                # print(["value",len(coeffs),x])
                tmp = [v for v in coeffs]
                n = len(tmp) - 1
                for z in range(1, n + 1):
                    for i in range(0, (n - z) + 1):
                        tmp[i] += (tmp[i + 1] - tmp[i]) * x
                # print(["value",float(tmp[0])])
                return tmp[0]
        return 0

    def value_(self, x):  # Value of piecewise polynomial
        t = time.time()
        v1 = self.valueA(x)
        self.valueAtime += time.time() - t
        t = time.time()
        v2 = self.valueB(x)
        self.valueBtime += time.time() - t
        if v1 != v2:
            raise ValueError
        if self.valueAtime > 0.5:
            print([self.valueAtime, self.valueBtime])
        return v1

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
                    FInterval(coeffs[i])
                    * (x ** i * (1 - x) ** (n - i) * math.comb(n, i))
                    for i in range(0, len(coeffs))
                )
        return 0

    def valueA(self, x):  # Value of piecewise polynomial
        for coeffs, mn, mx in self.pieces:
            if x >= mn and x <= mx:
                n = len(coeffs) - 1
                return sum(
                    coeffs[i] * x ** i * (1 - x) ** (n - i) * math.comb(n, i)
                    for i in range(0, len(coeffs))
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
                    n * (n - 1) * (coeffs[j] - 2 * coeffs[j + 1] + coeffs[j + 2])
                    for j in range(len(coeffs) - 2)
                ]
                self.diff2pieces.append([tmp, mn, mx])
        if len(self.diff2pieces) != len(self.pieces):
            raise ValueError

    def diff2_(self, x):  # Second derivative of piecewise polynomial
        self._ensurediff2()
        for coeffs, mn, mx in self.diff2pieces:
            if x >= mn and x <= mx:
                if coeffs == None:
                    return 0
                tmp = [v for v in coeffs]
                n = len(tmp) - 1
                for z in range(1, n + 1):
                    for i in range(0, (n - z) + 1):
                        tmp[i] += (tmp[i + 1] - tmp[i]) * x
                return tmp[0]
        return 0

    def diff2(self, x):  # Second derivative of piecewise polynomial
        self._ensurediff2()
        for coeffs, mn, mx in self.diff2pieces:
            if x >= mn and x <= mx:
                if coeffs == None:
                    return 0
                n = len(coeffs) - 1
                return sum(
                    coeffs[i] * x ** i * (1 - x) ** (n - i) * math.comb(n, i)
                    for i in range(0, len(coeffs))
                )
        return 0

    def diff2i(self, x):  # Second derivative of piecewise polynomial
        self._ensurediff2()
        for coeffs, mn, mx in self.diff2pieces:
            if x >= mn and x <= mx:
                if coeffs == None:
                    return 0
                n = len(coeffs) - 1
                return sum(
                    FInterval(coeffs[i])
                    * (x ** i * (1 - x) ** (n - i) * math.comb(n, i))
                    for i in range(0, len(coeffs))
                )
        return 0

    def get_coeffs(self):
        if len(self.pieces) != 1:
            raise ValueError("likely not a polynomial")
        return self.pieces[0][0]

def elevate1(coeffs):  # Elevate polynomial in Bernstein form by 1 degree
    n = len(coeffs) - 1
    return [
        coeffs[max(0, k - 1)] * Fraction(k, n + 1)
        + coeffs[min(n, k)] * Fraction((n + 1) - k, n + 1)
        for k in range(n + 2)
    ]

def elevate(coeffs, r):  # Elevate polynomial in Bernstein form by r degrees
    if r < 0:
        raise ValueError
    for i in range(r):
        coeffs = elevate1(coeffs)
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
        f0v = pwpoly.value(Fraction(k) / n)  # Value
        f2v = pwpoly.diff2(Fraction(k) / n)  # Second derivative
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
        # Bernstein coefficient times choose(2,1)
        # times n choose k, for the
        # (k+1)th homogeneous coefficient of
        # the degree n+2 polynomial
        homoc = (f0v - Fraction(f2v, 4 * n)) * 2
        # Alternative to above line:
        # "homoc = f0v * 2 - Fraction(f2v, 4*n) * 2"
        homoc *= nck
        vals[k + 1] += homoc
        homoc = f0v * 1
        homoc *= nck
        vals[k + 2] += homoc
    # Divide homogeneous coefficient i by (n+r) choose i to turn
    # it into a Bernstein coefficient
    return PiecewiseBernsteinPoly.fromcoeffs(
        [Fraction(vals[i]) / math.comb(n + r, i) for i in range(n + r + 1)]
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
        f0v = pwpoly.value(Fraction(k) / n)  # Value
        vals[k] = f0v
    # Elevate to degree n+r
    vals = elevate(vals, r)
    # Shift downward according to Lorentz operator
    for k in range(1, n + r):
        f2v = pwpoly.diff2(Fraction(k - 1) / n)  # Second derivative
        fv = Fraction(f2v, 4 * n) * 2
        # fv=fv*math.comb(n,k-1)/math.comb(n+r,k)
        # Alternative impl.
        fv = fv * k * (n + 2 - k) / ((n + 1) * (n + 2))
        vals[k] -= fv
    return PiecewiseBernsteinPoly.fromcoeffs(vals)

def lorentz2polyC(pwpoly, n):
    # Polynomial for Lorentz operator with r=2,
    # of degree n+r = n+2, given C2 continuous piecewise polynomial
    # NOTE: Currently well-defined only if value and diff2 are
    # rational whenever k/n is rational
    r = 2
    # Get degree n coefficients
    vals = [0 for i in range(n + 1)]
    for k in range(0, n + 1):
        f0v = pwpoly.valuei(Fraction(k) / n)  # Value
        vals[k] = f0v
    # Elevate to degree n+r
    # t=time.time()
    vals = elevate(vals, r)
    # print(["elevate",r,time.time()-t])
    # Shift downward according to Lorentz operator
    for k in range(1, n + r):
        f2v = pwpoly.diff2i(Fraction(k - 1) / n)  # Second derivative
        fv = (f2v / (4 * n)) * 2
        # fv=fv*math.comb(n,k-1)/math.comb(n+r,k)
        # Alternative impl.
        fv = fv * k * (n + 2 - k) / ((n + 1) * (n + 2))
        vals[k] -= fv
    return PiecewiseBernsteinPoly.fromcoeffs(vals)

class FInterval:
    """An interval of two Fractions.  x.sup holds the upper bound, and x.inf holds
    the lower bound."""

    def __new__(cl, v, sup=None, prec=None):
        if isinstance(v, FInterval) and sup == None:
            return v
        scl = super(FInterval, cl)
        self = scl.__new__(cl)
        if isinstance(v, int) and sup == None:
            self.sup = Fraction(v)
            self.inf = self.sup
            if self.inf > self.sup:
                raise ValueError
            return self
        elif isinstance(v, int) and isinstance(sup, int):
            self.sup = Fraction(sup)
            self.inf = Fraction(v)
            if self.inf > self.sup:
                raise ValueError
            return self
        inf = v
        sup = v if sup == None else sup
        self.sup = sup if isinstance(sup, Fraction) else Fraction(sup)
        self.inf = inf if isinstance(inf, Fraction) else Fraction(inf)
        if self.inf > self.sup:
            raise ValueError
        # Truncation
        self._truncate(512)
        return self

    def _truncate(self, bits):
        if (
            self.sup.numerator.bit_length() < bits
            and self.sup.denominator.bit_length() < bits
            and self.inf.numerator.bit_length() < bits
            and self.inf.denominator.bit_length() < bits
        ):
            return
        # print(["truncate",self.inf.denominator.bit_length(),
        #    float(self.inf),
        #    self.sup.denominator.bit_length(),float(self.sup)])
        infnum = self.inf.numerator
        infden = self.inf.denominator
        supnum = self.sup.numerator
        supden = self.sup.denominator
        ninf = (infnum << bits) // infden
        ninf = ninf - 1 if infnum < 0 else ninf
        nsup = (supnum << bits) // supden
        nsup = nsup if supnum < 0 else nsup + 1
        self.inf = Fraction(ninf, 1 << bits)
        self.sup = Fraction(nsup, 1 << bits)
        # print([float(oldinf),float(self.inf),float(oldsup),float(self.sup)])

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
            if not isinstance(v, FInterval):
                r = self.inf * v
                return FInterval(r, r)
        y = FInterval(v)
        a = self.inf * y.inf
        b = self.inf * y.sup
        c = self.sup * y.inf
        d = self.sup * y.sup
        return FInterval(min([a, b, c, d]), max([a, b, c, d]))

    def __truediv__(self, v):
        if self.sup == self.inf:
            if isinstance(v, FInterval) and v.sup == v.inf:
                r = self.inf * v.inf
                return FInterval(r, r)
            if not isinstance(v, FInterval):
                r = self.inf * v
                return FInterval(r, r)
        y = FInterval(v)
        newinf = Fraction(y.sup.denominator, y.sup.numerator)
        newsup = Fraction(y.inf.denominator, y.inf.numerator)
        a = self.inf * newinf
        b = self.inf * newsup
        c = self.sup * newinf
        d = self.sup * newsup
        return FInterval(min([a, b, c, d]), max([a, b, c, d]))

    def union(v):
        y = FInterval(v)
        return FInterval(min(self.inf, y.inf), max(self.sup, y.sup))

    def mignitude(self):
        if self.inf < 0 and self.sup > 0:
            return Fraction(0)
        return min(abs(self.sup), abs(self.inf))

    def magnitude(self):
        return max(abs(self.sup), abs(self.inf))

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

    def greaterThanScalar(self, a):
        return self.inf > a

    def greaterEqualScalar(self, a):
        return self.inf >= a

    def lessThanScalar(self, a):
        return self.sup < a

    def lessEqualScalar(self, a):
        return self.sup <= a

    def intersect(self, y):
        if x.sup < y.inf or x.inf > y.sup:
            return None
        return FInterval(max(x.inf, y.inf), min(x.sup, y.sup))

    def containedIn(self, y):
        return y.inf <= self.inf and self.sup <= y.sup

    def pow(self, v):
        y = v if isinstance(v, FInterval) else FInterval(v)
        if y.inf == y.sup and int(y.inf) == y.inf and y.inf >= 0 and y.inf <= 32:
            # Special case: Integer power
            yn = int(y.inf)
            if yn == 0:
                return FInterval(1, 1)
            if yn == 1:
                return self
            if yn % 2 == 1 or self.inf >= 0:
                return FInterval(self.inf ** yn, self.sup ** yn)
            if self.sup <= 0:
                return FInterval(self.sup ** yn, self.inf ** yn)
            return FInterval(0, max(self.inf ** yn, self.sup ** yn))
        if self.inf == self.sup and self.inf == 0:
            # Special case: 0
            return FInterval(0)
        raise ValueError("Not supported")

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
    if theta < 1:
        raise ValueError("disallowed theta")
    r = 2
    alpha = r
    n = len(nrcoeffs) - 1 - r  # n+r+1 coefficients
    phi = [
        Fraction(theta, n ** alpha) + (Fraction(i, n) * (1 - Fraction(i, n)) / n)
        for i in range(n + 1)
    ]
    phi = elevate(phi, r)
    if isinstance(nrcoeffs[0], FInterval):
        upper = [nrcoeffs[i].sup + phi[i] * d for i in range(len(phi))]
        lower = [nrcoeffs[i].inf - phi[i] * d for i in range(len(phi))]
    else:
        upper = [nrcoeffs[i] + phi[i] * d for i in range(len(phi))]
        lower = [nrcoeffs[i] - phi[i] * d for i in range(len(phi))]
    return upper, lower

def example1():
    # Example function: A concave piecewise polynomial
    pwp2 = PiecewiseBernsteinPoly()
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
                    self.lastfn = lorentz2polyB(self.pwp, d - 2)
                else:
                    resid = lorentz2polyB(PolyDiff(self.pwp, self.lastfn), d - 2)
                    self.lastfn = PolySum(self.lastfn, resid)
                    self.lastfn = PiecewiseBernsteinPoly.fromcoeffs(
                        self.lastfn.get_coeffs()
                    )
                # print("nextdegree %d done %f" % (d,time.time()-t))
                self.lastdegree = d
                if d not in self.polys:
                    # NOTE: Value of 1 is not certain to work for
                    # all functions within this class's scope.
                    up, lo = polyshift(
                        self.lastfn.get_coeffs(), Fraction(2703, 1000), 1
                    )
                    if len(up) != d + 1:
                        raise ValueError
                    # Replace out-of-bounds polynomials with constant polynomials
                    if min(lo) < 0:
                        lo = [0 for v in lo]
                    if max(up) > 1:
                        up = [1 for v in up]
                    print(float(min(lo)), float(max(up)))
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
            # Fraction("3.75") is absolute maximum value of second derivative
            # for example function
            up = [
                self.pwp.value(Fraction(i, n)) + Fraction(1, 7 * n) * Fraction("3.75")
                for i in range(n + 1)
            ]
            lo = [
                self.pwp.value(Fraction(i, n)) - Fraction(1, 7 * n) * Fraction("3.75")
                for i in range(n + 1)
            ]
            # Replace out-of-bounds polynomials with constant polynomials
            if min(lo) < 0:
                lo = [0 for v in lo]
            if max(up) > 1:
                up = [1 for v in up]
            print(float(min(lo)), float(max(up)))
            """
            if n//2 in self.polys:
                lastpolys=self.polys[n//2]
                lastlo=elevate(lastpolys[0],n//2)
                lastup=elevate(lastpolys[1],n//2)
                for prev,curr in zip(lastlo,lo):
                   if prev>curr: raise ValueError("invalid lower curve: deg=%d" % (n))
                for prev,curr in zip(lastup,up):
                   if prev<curr: raise ValueError("invalid upper curve: deg=%d" % (n))
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
    return Fraction(int(Fraction(fbelow(a, b)) * v), v)

def _fa2(fabove, a, b, v=1):
    if b > a:
        raise ValueError
    mv = Fraction(fabove(a, b)) * v
    imv = int(mv)
    return Fraction(imv, v) if mv == imv else Fraction(imv + 1, v)

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
    ret = random.random()
    while True:
        # if degree>=8192:
        #  print("skipped")
        #  return 0
        for i in range(degree - lastdegree):
            if coin() == 1:
                ones += 1
        c = math.comb(degree, ones)
        md = degree
        l = _fb2(fbelow, degree, ones, 2 ** md * c)
        u = _fa2(fabove, degree, ones, 2 ** md * c)
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
            if False:  # Correctness check
                for j in range(0, min(lastdegree, ones) + 1):
                    fb = _fb2(fbelow, lastdegree, j, 2 ** md * math.comb(lastdegree, j))
                    if (lastdegree, j) in fba:
                        # print(fb)
                        if fba[(lastdegree, j)] != fb:
                            raise ValueError
                    fa = _fa2(fabove, lastdegree, j, 2 ** md * math.comb(lastdegree, j))
                    if (lastdegree, j) in faa:
                        # print(fa)
                        if faa[(lastdegree, j)] != fa:
                            raise ValueError
            ls = sum(
                _fb2(fbelow, lastdegree, j, 2 ** md * math.comb(lastdegree, j))
                * combs[j]
                for j in range(0, min(lastdegree, ones) + 1)
            )
            us = sum(
                _fa2(fabove, lastdegree, j, 2 ** md * math.comb(lastdegree, j))
                * combs[j]
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
