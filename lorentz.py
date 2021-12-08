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
    vals = elevate(vals, 2)
    # Shift downward according to Lorentz operator
    for k in range(1, n + r):
        f2v = pwpoly.diff2(Fraction(k - 1) / n)  # Second derivative
        fv = Fraction(f2v, 4 * n) * 2
        # fv=fv*math.comb(n,k-1)/math.comb(n+r,k)
        # Alternative impl.
        fv = fv * k * (n + 2 - k) / ((n + 1) * (n + 2))
        vals[k] -= fv
    return PiecewiseBernsteinPoly.fromcoeffs(vals)

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

def iterconstruct(pwp, x):
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

def diffconstruct(pwp, x):
    # Iterative construction of approximating
    # polynomials using Lorentz-2 operator;
    # differences only
    n = 4
    fn = lorentz2polyB(pwp, n)
    ret = []
    for i in range(5):
        # Build polynomials of degree 8+r, 16+r,
        # 32+r, 64+r, 128+r, where r=2
        n *= 2
        resid = lorentz2polyB(PolyDiff(pwp, fn), n)
        fn = PolySum(fn, resid)
        ret.append(resid.get_coeffs())
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
                if self.lastfn == None:
                    self.lastfn = lorentz2polyB(self.pwp, d - 2)
                else:
                    resid = lorentz2polyB(PolyDiff(self.pwp, self.lastfn), d - 2)
                    self.lastfn = PolySum(self.lastfn, resid)
                self.lastdegree = d
                if d not in self.polys:
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
            return self.polys[n]

    def _fbelow(self, n, k):
        return self._ensure(n)[0][k]

    def _fabove(self, n, k):
        return self._ensure(n)[1][k]

    def simulate(self, coin):
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
            up = [
                self.pwp.value(Fraction(i, n)) + Fraction(1, 7 * n)
                for i in range(n + 1)
            ]
            lo = [
                self.pwp.value(Fraction(i, n)) - Fraction(1, 7 * n)
                for i in range(n + 1)
            ]
            # Replace out-of-bounds polynomials with constant polynomials
            if min(lo) < 0:
                lo = [0 for v in lo]
            if max(up) > 1:
                up = [1 for v in up]
            print(float(min(lo)), float(max(up)))
            self.polys[n] = [lo, up]
            if n not in self.polys:
                raise ValueError
            return self.polys[n]

    def _fbelow(self, n, k):
        return self._ensure(n)[0][k]

    def _fabove(self, n, k):
        return self._ensure(n)[1][k]

    def simulate(self, coin):
        return simulate(coin, self.fbelow, self.fabove, self.fbound, self.nextdegree)

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
    degree = nextdegree(0) if nextdegree != None else 1
    while True:
        fb = fbound(degree)
        if fb[0] >= 0 and fb[1] <= 1:
            break
        degree = nextdegree(degree) if nextdegree != None else degree * 2
    startdegree = degree
    a = {}
    b = {}
    while True:
        for i in range(degree - lastdegree):
            if coin() == 1:
                ones += 1
        c = int(math.comb(degree, ones))
        # c *= 2 ** degree
        # print([degree,float(fbelow(degree, ones)),float(fabove(degree, ones))])
        a[(degree, ones)] = int(Fraction(fbelow(degree, ones)) * c)
        b[(degree, ones)] = int((1 - Fraction(fabove(degree, ones))) * c)
        acount = a[(degree, ones)]
        bcount = b[(degree, ones)]
        c -= acount + bcount
        if degree > startdegree:
            diff = degree - lastdegree
            u = max(ones - lastdegree, 0)
            v = min(ones, diff)
            g = math.comb(lastdegree, ones - u)
            h = 1
            # h = 2 ** degree
            for k in range(u, v + 1):
                o = ones - k
                if not (lastdegree, o) in a:
                    a[(lastdegree, o)] = int(Fraction(fbelow(lastdegree, o)) * g * h)
                if not (lastdegree, o) in b:
                    b[(lastdegree, o)] = int(
                        (1 - Fraction(fabove(lastdegree, o))) * g * h
                    )
                st = math.comb(diff, k)
                acount -= a[(lastdegree, o)] * st
                bcount -= b[(lastdegree, o)] * st
                g *= o
                g //= lastdegree + 1 - o
        # print([acount,bcount,c])
        r = random.randint(0, (acount + bcount + c) - 1)
        if r < acount:
            return 1
        if r < acount + bcount:
            return 0
        lastdegree = degree
        degree = nextdegree(degree) if nextdegree != None else degree * 2
