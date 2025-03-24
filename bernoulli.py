import math
import random
from fractions import Fraction

class Bernoulli:
    """This class contains methods that generate Bernoulli random numbers,
       (either 1 or heads with a given probability, or 0 or tails otherwise).
       This class also includes implementations of so-called "Bernoulli factories", algorithms
    that sample a new probability given a coin that shows heads with an unknown probability.
    Written by Peter O.

    References:
    - Flajolet, P., Pelletier, M., Soria, M., "On Buffon machines and numbers",
    arXiv:0906.5560v2 [math.PR], 2010.
    - Huber, M., "Designing perfect simulation algorithms using local correctness",
    arXiv:1907.06748v1 [cs.DS], 2019.
    - Huber, M., "Nearly optimal Bernoulli factories for linear functions",
    arXiv:1308.1562v2  [math.PR], 2014.
    - Huber, M., "Optimal linear Bernoulli factories for small mean problems",
    arXiv:1507.00843v2 [math.PR], 2016.
    - Łatuszyński, K., Kosmidis, I.,  Papaspiliopoulos, O., Roberts, G.O., "Simulating
    events of unknown probabilities via reverse time martingales", arXiv:0907.4018v2
    [stat.CO], 2009/2011.
    - Goyal, V. and Sigman, K. 2012. On simulating a class of Bernstein
    polynomials. ACM Transactions on Modeling and Computer Simulation 22(2),
    Article 12 (March 2012), 5 pages.
    -  Giulio Morina. Krzysztof Łatuszyński. Piotr Nayar. Alex Wendland. "From the Bernoulli factory to a dice enterprise via perfect sampling of Markov chains." Ann. Appl. Probab. 32 (1) 327 - 359, February 2022.
      doi.org/10.1214/21-AAP1679
    - Dughmi, Shaddin, Jason Hartline, Robert D. Kleinberg, and Rad Niazadeh. "Bernoulli factories and black-box reductions in mechanism design." Journal of the ACM (JACM) 68, no. 2 (2021): 1-30.
    - Gonçalves, F. B., Łatuszyński, K. G., Roberts, G. O. (2017).  Exact Monte
    Carlo likelihood-based inference for jump-diffusion processes.
    - Vats, D., Gonçalves, F. B., Łatuszyński, K. G., Roberts, G. O. Efficient
    Bernoulli factory MCMC for intractable posteriors, Biometrika 109(2), June 2022.
    - Mendo, Luis. "An asymptotically optimal Bernoulli factory for certain
    functions that can be expressed as power series." Stochastic Processes and their
    Applications 129, no. 11 (2019): 4366-4384.
    - Canonne, C., Kamath, G., Steinke, T., "The Discrete Gaussian
    for Differential Privacy", arXiv:2004.00010 [cs.DS], 2020.
    - Lee, A., Doucet, A. and Łatuszyński, K., 2014. Perfect simulation using
    atomic regeneration with application to Sequential Monte Carlo,
    arXiv:1407.5770v1  [stat.CO]
    """

    def __init__(self):
        """Creates a new instance of the Bernoulli class."""
        self.r = random.Random()
        self.rbit = -1
        self.totalbits = 0
        self.debug = False

    def _algorithm_a(self, f, m, c):
        # B(p) -> B(c*p*(1-(c*p)^(m-1))/(1-(c*p)^m)), or the "gambler's ruin" walk
        # (Huber 2016)
        s = 1
        # if self.debug and self.totalbits!=0: print([m, self.totalbits, float(c), self._coinprob])
        while s > 0 and s < m:
            if self.debug and self.totalbits >= 5000:
                return math.nan
            lo = self.logistic(f, c.numerator, c.denominator)
            s = s - lo * 2 + 1
        return 1 if s == 0 else 0

    def _high_power_logistic(self, f, m, beta, c):
        # B(p) => B((beta*c*p)^m/(1+(beta*c*p)+...+(beta*c*p)^m)) (Huber 2016)
        s = 1
        bc = beta * c
        while s > 0 and s <= m:
            if self.debug and self.totalbits >= 5000:
                return math.nan
            s = s + self.logistic(f, bc.numerator, bc.denominator) * 2 - 1
        return 1 if s == m + 1 else 0

    def _henderson_glynn_double_inexact(self, f, n=100):
        # Henderson-Glynn doubling scheme.  Reference:
        # Henderson, S.G., Glynn, P.W., "Nonexistence of a
        # Class of Variate Generation Schemes", Operations Research Letters 31 (2), 2001.
        x = 0
        for i in range(n):
            x += f()
        lh = Fraction(x, i + 1)
        rh = (1 - Fraction(1, i + 1)) / 2
        z = min(lh, rh) * 2  # B(p) -> B(2*p - (2*p - E[z])) == B(E[z])
        return self.zero_or_one(z.numerator, z.denominator)

    def _nacu_peres_double_inexact(self, f, n=100):
        # B(p) -> B(2*p - eps), where eps is less than or equal to
        # 2*exp(−2*n(1/2−p)^2), and where p is in (0, 1/2). Reference:
        # Nacu, Şerban, and Yuval Peres. "Fast simulation of
        # new coins from old", The Annals of Applied Probability
        # 15, no. 1A (2005): 93-115.
        x = 0
        for i in range(n):
            x += 1 if f() == 1 else -1
            if x >= 0:
                return 1
            if x + (n - 1 - i) < 0:
                break  # Can't catch up
        return 0

    def zero_or_one(self, px, py):
        """Returns 1 at probability px/py, 0 otherwise."""
        if py <= 0:
            raise ValueError
        if px == py:
            return 1
        z = px
        while True:
            z = z * 2
            if z >= py:
                if self.randbit() == 0:
                    return 1
                z = z - py
            elif z == 0 or self.randbit() == 0:
                return 0

    def randbit(self):
        """Generates a random bit that is 1 or 0 with equal probability."""
        if self.rbit < 0 or self.rbit >= 32:
            self.rbit = 0
            self.rvalue = self.r.randint(0, (1 << 32) - 1)
        ret = (self.rvalue >> self.rbit) & 1
        self.rbit += 1
        self.totalbits += 1
        return ret

    def rndint(self, maxInclusive):
        if maxInclusive < 0:
            raise ValueError("maxInclusive less than 0")
        if maxInclusive == 0:
            return 0
        if maxInclusive == 1:
            return self.randbit()
        # Lumbroso's fast dice roller method
        x = 1
        y = 0
        while True:
            x = x * 2
            y = y * 2 + self.randbit()
            if x > maxInclusive:
                if y <= maxInclusive:
                    return y
                x = x - maxInclusive - 1
                y = y - maxInclusive - 1

    def _randbits(self, count):
        ret = 0
        for i in range(count):
            ret = (ret << 1) + self.randbit()
        return ret

    def fill_geometric_bag(self, bag, precision=53):
        ret = 0
        lb = min(len(bag), precision)
        for i in range(lb):
            if i >= len(bag) or bag[i] == None:
                ret = (ret << 1) | self.randbit()
            else:
                ret = (ret << 1) | bag[i]
        if len(bag) < precision:
            diff = precision - len(bag)
            ret = (ret << diff) | self._randbits(diff)
        # Now we have a number that is a multiple of
        # 2^-precision.
        return ret / (1 << precision)

    def geometric_bag(self, u):
        """Bernoulli factory for a uniformly-distributed random number in (0, 1)
        (Flajolet et al. 2010).
        - u: List that holds the binary expansion, from left to right, of the uniformly-
          distributed random number.  Each element of the list is 0, 1, or None (meaning
          the digit is not yet known).  The list may be expanded as necessary to put
          a new digit in the appropriate place in the binary expansion.
        """
        r = 0
        c = 0
        while self.randbit() == 0:
            r += 1
        while len(u) <= r:
            u.append(None)
        if u[r] == None:
            u[r] = self.randbit()
        return u[r]

    def zero_or_one_log1p(self, x, y=1):
        """Generates 1 with probability log(1+x/y); 0 otherwise.
        Reference: Flajolet et al. 2010.  Uses a uniformly-fast special case of
        the two-coin Bernoulli factory, rather than the even-parity construction in
        Flajolet's paper, which does not have bounded expected running time for all heads probabilities.
        """
        bag = []
        while True:
            if self.randbit() == 0:
                return 1
            if self.zero_or_one(x, y) == 1 and self.geometric_bag(bag) == 1:
                return 0

    def zero_or_one_arctan_n_div_n(self, x, y=1):
        """Generates 1 with probability arctan(x/y)*y/x; 0 otherwise.
           x/y must be in [0, 1]. Uses a uniformly-fast special case of
        the two-coin Bernoulli factory, rather than the even-parity construction in
        Flajolet's paper, which does not have bounded expected running time for all heads probabilities.
        Reference: Flajolet et al. 2010."""
        bag = []
        xsq = x * x
        ysq = y * y
        while True:
            if self.randbit() == 0:
                return 1
            if (
                self.zero_or_one(xsq, ysq) == 1
                and self.geometric_bag(bag) == 1
                and self.geometric_bag(bag) == 1
            ):
                return 0

    def arctan_n_div_n(self, f):
        """Arctan div N: B(p) -> B(arctan(p)/p). Uses a uniformly-fast special case of
        the two-coin Bernoulli factory, rather than the even-parity construction in
        Flajolet's paper, which does not have bounded expected running time for all heads probabilities.
        Reference: Flajolet et al. 2010.
         - f: Function that returns 1 if heads and 0 if tails.
        """
        bag = []
        while True:
            if self.randbit() == 0:
                return 1
            if (
                f() == 0
                and self.geometric_bag(bag) == 0
                and f() == 0
                and self.geometric_bag(bag) == 0
            ):
                return 0

    def zero_or_one_pi_div_4(self):
        """Generates 1 with probability pi/4.
        Reference: Flajolet et al. 2010.
        """
        r = self.rndintexc(6)
        if r < 3:
            return self.zero_or_one_arctan_n_div_n(1, 2)
        else:
            return 1 if r < 5 and self.zero_or_one_arctan_n_div_n(1, 3) == 1 else 0

    def one_div_pi(self):
        """Generates 1 with probability 1/pi.
        Reference: Flajolet et al. 2010.
        """
        t = 0
        while self.zero_or_one(1, 4) == 0:
            t += 1
        while self.zero_or_one(1, 4) == 0:
            t += 1
        if self.zero_or_one(5, 9):
            t += 1
        if t == 0:
            return 1
        for i in range(3):
            s = sum(self.randbit() for j in t * 2)
            if s != t:
                return 0
        return 1

    def _uniform_less_nd(self, bag, num, den):
        """Determines whether a uniformly-distributed random number
        (given as an incomplete binary expansion that is built up
         as necessary) is less than the specified fraction (in the interval [0, 1])
         expressed as a numerator and denominator."""
        a = num
        if num == 0:
            return 0
        b = den
        if num == den:
            return 1
        pt = 1
        i = 0
        while True:
            while len(bag) <= i:
                bag.append(self.randbit())
            if bag[i] == None:
                bag[i] = self.randbit()
            mybit = bag[i]
            # Determine whether frac >= 2**-pt
            cmpare = (a << pt) >= b
            # if cmpare!=(frac>=Fraction(1,1<<pt)): raise ValueError
            bit = 1 if cmpare else 0
            if mybit == 0 and bit == 1:
                return 1
            if mybit == 1 and bit == 0:
                return 0
            if bit == 1:
                # Subtract 2**-pt from frac
                a = (a << pt) - b
                b <<= pt
            # Frac is now 0, so result can only be 0
            if a == 0:
                return 0
            pt += 1
            i += 1
        return 0

    def _uniform_less(self, bag, frac):
        """Determines whether a uniformly-distributed random number
        (given as an incomplete binary expansion that is built up
         as necessary) is less than the specified Fraction (in the interval [0, 1])."""
        frac = frac if isinstance(frac, Fraction) else Fraction(frac)
        # NOTE: Fractions are not compared and subtracted directly because
        # doing so is very costly in Python
        return self._uniform_less_nd(bag, frac.numerator, frac.denominator)

    def bernoulli_x(self, f, x):
        """Bernoulli factory with a given probability: B(p) => B(x) (Mendo 2019).
            Mendo calls Bernoulli factories "nonrandomized" if their randomness
            is based entirely on the underlying coin.
        - f: Function that returns 1 if heads and 0 if tails.
        - x: Desired probability, in [0, 1]."""
        pw = Fraction(x)
        if pw == 0:
            return 0
        if pw == 1:
            return 1
        pt = Fraction(1, 2)
        while True:
            y = f()
            z = f()
            if y == 1 and z == 0:
                return 1 if pw >= pt else 0
            elif y == 0 and z == 1:
                if pw >= pt:
                    pw -= pt
                pt /= 2

    def coin(self, c):
        """Convenience method to generate a function that returns
        1 (heads) with the specified probability c (which must be in [0, 1])
        and 0 (tails) otherwise."""
        if c == 0:
            return lambda: 0
        if c == 1:
            return lambda: 1
        c = Fraction(c)
        return lambda: self.zero_or_one(c.numerator, c.denominator)

    def complement(self, f):
        """Complement (NOT): B(p) => B(1-p) (Flajolet et al. 2010)
        - f: Function that returns 1 if heads and 0 if tails.
        """
        return f() ^ 1

    def square(self, f1, f2):
        """Square: B(p) => B(1-p). (Flajolet et al. 2010)
        - f1, f2: Functions that return 1 if heads and 0 if tails.
        """
        return 1 if f1() == 1 and f1() == 1 else 0

    def product(self, f1, f2):
        """Product (conjunction; AND): B(p), B(q) => B(p*q)  (Flajolet et al. 2010)
        - f1, f2: Functions that return 1 if heads and 0 if tails.
        """
        return 1 if f1() == 1 and f2() == 1 else 0

    def disjunction(self, f1, f2):
        """Disjunction (OR): B(p), B(q) => B(p+q-p*q) (Flajolet et al. 2010)
        - f1, f2: Functions that return 1 if heads and 0 if tails.
        """
        return 1 if f1() == 1 or f2() == 1 else 0

    def mean(self, f1, f2):
        """Mean: B(p), B(q) => B((p+q)/2)  (Flajolet et al. 2010)
        - f1, f2: Functions that return 1 if heads and 0 if tails.
        """
        return f1() if self.randbit() == 0 else f2()

    def conditional(self, f1, f2, f3):
        """Conditional: B(p), B(q), B(r) => B((1-r)*q+r*p)  (Flajolet et al. 2010)
        - f1, f2, f3: Functions that return 1 if heads and 0 if tails.
        """
        return f1() if f3() == 1 else f2()

    def evenparity(self, f):
        """Even parity: B(p) => B(1/(1+p)) (Flajolet et al. 2010)
        - f: Function that returns 1 if heads and 0 if tails.
        Note that this function is slow as the probability of heads approaches 1.
        """
        while True:
            if f() == 0:
                return 1
            if f() == 0:
                return 0

    def divoneplus(self, f):
        """Divided by one plus p: B(p) => B(1/(1+p)), implemented
                as a special case of the two-coin construction.  Prefer over even-parity
                for having bounded expected running time for all heads probabilities.
        - f: Function that returns 1 if heads and 0 if tails.
        Note that this function is slow as the probability of heads approaches 1.
        """
        while True:
            if self.randbit() == 0:
                return 1
            if f() == 1:
                return 0

    def logistic(self, f, cx=1, cy=1):
        """Logistic Bernoulli factory: B(p) -> B(cx*p/(cy+cx*p)) or
            B(p) -> B((cx/cy)*p/(1+(cx/cy)*p)) (Morina et al. 2019)
        - f: Function that returns 1 if heads and 0 if tails.  Note that this function can
          be slow as the probability of heads approaches 0.
        - cx, cy: numerator and denominator of c; the probability of heads (p) is multiplied
          by c. c must be in (0, 1).
        """
        c = Fraction(cx, cy)
        while True:
            if self.zero_or_one(c.denominator, c.numerator + c.denominator) == 1:
                return 0
            elif f() == 1:
                return 1

    def _multilogistic_inexact(self, fa, ca):
        # Huber 2016, replaces logistic(f, c) in linear Bernoulli factory to make a multivariate
        # Bernoulli factory of the form B(p1), ..., B(pn) -> B(c1*p1 + ... + cn*pn).
        # For this method:
        # B(p1), ..., B(pn) -> B(r/(1+r)), where r = c1*p1 + ... + cn*pn and r is bounded away
        # from 1 (notice that c1, ..., cn need not be in [0, 1]).
        x = 0
        a = -math.log(self.r.random())
        t = [0 for i in range(len(fa))]
        for i in range(len(fa)):
            t[i] = -math.log(self.r.random()) / ca[i]
            while x == 0 and t[i] < a:
                if fa[i]() == 1:
                    return 1
                t[i] -= math.log(self.r.random()) / ca[i]
        return 0

    def eps_div(self, f, eps):
        """Bernoulli factory as follows: B(p) -> B(eps/p) (Lee et al. 2014).
        - f: Function that returns 1 if heads and 0 if tails.
        - eps: Fraction in (0, 1), must be chosen so that eps < p, where p is
          the probability of heads."""
        if eps == 0:
            return 0
        if eps < 0:
            raise ValueError
        eps = Fraction(eps)
        ceps = Fraction(1) / (1 - Fraction(eps))
        cgamma = None
        # Proposition 4 of Lee et al. 2014
        half = Fraction(1, 2)
        if eps >= half:
            beta = half
            cgamma = 1 - (1 - beta) / (1 - Fraction(1, 4))
        else:
            beta = eps * 2
            cgamma = 1 - (1 - beta) / (1 - eps)
        finv = lambda: (f() ^ 1)
        while True:
            if self.zero_or_one(eps.numerator, eps.denominator) == 1:
                return 1
            # Sample B((p-eps)/(1-eps)) or B(1-(1-p)/(1-eps))
            b = self.linear(finv, ceps.numerator, ceps.denominator, cgamma)
            if b == 0:
                return 0

    def zero_or_one_exp_minus(self, x, y):
        """Generates 1 with probability exp(-x/y); 0 otherwise.
        Reference: Canonne et al. 2020."""
        if y <= 0 or x < 0:
            raise ValueError
        if x == 0:
            return 1
        if x > y:
            xf = int(x / y)  # Get integer part
            x = x % y  # Reduce to fraction
            if x > 0 and self.zero_or_one_exp_minus(x, y) == 0:
                return 0
            for i in range(xf):
                if self.zero_or_one_exp_minus(1, 1) == 0:
                    return 0
            return 1
        r = 1
        oy = y
        while True:
            if self.zero_or_one(x, y) == 0:
                return r
            r = 1 - r
            y = y + oy

    def rndintexc(self, maxexc):
        """Returns a random integer in [0, maxexc)."""
        if maxexc <= 0:
            raise ValueError
        if maxexc == 1:
            return 0
        maxinc = maxexc - 1
        x = 1
        y = 0
        while True:
            x *= 2
            y = y * 2 + self.randbit()
            if x > maxinc:
                if y <= maxinc:
                    return y
                x = x - maxinc - 1
                y = y - maxinc - 1

    def probgenfunc(self, f, rng):
        """Probability generating function Bernoulli factory: B(p) => B(E[p^x]), where x is rng()
         (Dughmi et al. 2021). E[p^x] is the expected value of p^x and is also known
         as the probability generating function.
        - f: Function that returns 1 if heads and 0 if tails.
        - rng: Function that returns a nonnegative integer at random.
          Example (Dughmi et al. 2021): if 'rng' is Poisson(lamda) we have
          an "exponentiation" Bernoulli factory as follows:
          B(p) => B(exp(p*lamda-lamda))
        """
        n = rng()
        for i in range(n):
            if f() == 0:
                return 0
        return 1

    def powerseries(self, f):
        """Power series Bernoulli factory: B(p) => B(1 - c(0)*(1-p) + c(1)*(1-p)^2 +
          c(2)*(1-p)^3 + ...), where c(i) = `c[i]/sum(c)`) (Mendo 2019).
        - f: Function that returns 1 if heads and 0 if tails.
        - c: List of coefficients in the power series, all of which must be
          nonnegative integers."""
        i = 0
        csum = sum(c)
        dsum = 0
        while True:
            x = f()
            if x == 1:
                return 1
            ci = Fraction(0) if i >= c.length else Fraction(c[i], csum)
            d = ci / (1 - dsum)
            if d == 1 or self.zero_or_one(d.numerator, d.denominator) == 1:
                return 0
            dsum += ci
            i += 1

    def power(self, f, ax, ay=1):
        """Power Bernoulli factory: B(p) => B(p^(ax/ay)). (case of (0, 1) provided by
         Mendo 2019).
        - f: Function that returns 1 if heads and 0 if tails.
        - ax, ay: numerator and denominator of the desired power to raise the probability
         of heads to. This power must be 0 or greater."""
        a = None
        if ay == 1 and isinstance(ax, Fraction):
            a = ax
            ax = a.numerator
            ay = a.denominator
        elif not (isinstance(ax, int) and isinstance(ay, int)):
            a = Fraction(ax, ay)
            ax = a.numerator
            ay = a.denominator
        if (ax < 0) ^ (ay < 0) or ay == 0:  # Denominator is 0 or power is negative
            raise ValueError
        if ax == 0:
            return 1
        if ax == ay:
            return f()
        if ax > ay:
            # (px/py)^(ax/ay) -> (px/py)^int(ax/ay) * (px/py)^frac(ax/ay)
            xf = int(ax / ay)  # Get integer part
            nx = ax % ay  # Reduce to fraction
            if nx > 0:
                # Split 1 plus the fractional part in two pieces, so that the fractional
                # parts involved in power_frac are closer to 1, and so are processed
                # much faster by power_frac.  Compensate by reducing the
                # integer part by 1.
                xf -= 1
                nx += ay
                nxpart = int(nx / 2)
                if (
                    self.power(f, nxpart, ay) == 0
                    or self.power(f, nx - nxpart, ay) == 0
                ):
                    return 0
            if xf > 0:
                for i in range(xf):
                    if f() == 0:
                        return 0
            return 1
        # Following is algorithm from Mendo 2019
        i = 1
        while True:
            if f() == 1:
                return 1
            if self.zero_or_one(ax, ay * i) == 1:
                return 0
            i = i + 1

    def a_div_b_bag(self, numerator, intpart, bag):
        """Simulates numerator/(intpart+bag)."""
        while True:
            if self.zero_or_one(intpart, 1 + intpart) == 1:
                return self.zero_or_one(numerator, intpart)
            if self.geometric_bag(bag) == 1:
                return 0

    def a_bag_div_b_bag(selfnumerator, numbag, intpart, bag):
        """Simulates (numerator+numbag)/(intpart+bag)."""
        while True:
            if self.zero_or_one(intpart, 1 + intpart) == 1:
                while True:
                    i = self.rndintexc(intpart)
                    if i < numerator:
                        return 1
                    if i == numerator:
                        return self.geometric_bag(numbag)
            if self.geometric_bag(bag) == 1:
                return 0

    def _zero_or_one_power_frac(self, px, py, nx, ny):
        # Generates a random number, namely 1 with
        # probability (px/py)^(nx/ny) (where nx/ny is in (0, 1)),
        # and 1 otherwise.  Returns 1 if nx/ny is 0.  Reference: Mendo 2019.
        i = 1
        while True:
            if self.debug and self.totalbits >= 5000:
                return math.nan
            x = self.zero_or_one(px, py)
            if x == 1:
                return 1
            if self.zero_or_one(nx, ny * i) == 1:
                return 0
            i = i + 1

    def zero_or_one_power_ratio(self, px, py, nx, ny):
        """Generates 1 with probability (px/py)^(nx/ny) (where nx/ny can be
        positive, negative, or zero); 0 otherwise."""
        if py <= 0 or px < 0:
            raise ValueError
        n = Fraction(nx, ny)
        p = Fraction(px, py)
        nx = n.numerator
        ny = n.denominator
        px = p.numerator
        py = p.denominator
        if self.debug and self.totalbits >= 5000:
            return math.nan
        if n < 0:  # (px/py)^(nx/ny) -> (py/px)^-(nx/ny)
            n = -n
            return self.zero_or_one_power_ratio(py, px, n.numerator, n.denominator)
        if n == 0 or px >= py:
            return 1
        if nx == ny:
            return self.zero_or_one(px, py)
        if nx > ny:
            # (px/py)^(nx/ny) -> (px/py)^int(nx/ny) * (px/py)^frac(nx/ny)
            xf = int(nx / ny)  # Get integer part
            nx = nx % ny  # Reduce to fraction
            if nx > 0:
                # Split 1 plus the fractional part in two pieces, so that the fractional
                # parts involved in power_frac are closer to 1, and so are processed
                # much faster by power_frac.  Compensate by reducing the
                # integer part by 1.
                xf -= 1
                nx += ny
                nxpart = int(nx / 2)
                if (
                    self._zero_or_one_power_frac(nxpart, ny) == 0
                    or self._zero_or_one_power_frac(nx - nxpart, ny) == 0
                ):
                    return 0
            if xf >= 1:
                n1 = 1
                npx = px
                npy = py
                while n1 < xf and px < (1 << 32) and py < (1 << 32):
                    npx *= px
                    npy *= py
                    n1 += 1
                if n1 > 1:
                    quo = int(xf / n1)
                    if self.zero_or_one_power(npx, npy, quo) == 0:
                        return 0
                    xf -= quo * n1
                for i in range(xf):
                    if self.debug and self.totalbits >= 5000:
                        return math.nan
                    if self.zero_or_one(px, py) == 0:
                        return 0
            return 1
        return self._zero_or_one_power_frac(px, py, nx, ny)

    def zero_or_one_power(self, px, py, n):
        """Generates 1 with probability (px/py)^n (where n can be
        positive, negative, or zero); 0 otherwise."""
        return self.zero_or_one_power_ratio(px, py, n, 1)

    def twocoin(self, f1, f2, c1=1, c2=1, beta=1):
        """Two-coin Bernoulli factory: B(p), B(q) =>
                  B(c1*p*beta / (beta * (c1*p+c2*q) - (beta - 1)*(c1+c2)))
            (Gonçalves et al. 2017, Vats et al. 2020; in Vats et al.,
             C1,p1 corresponds to cy and C2,p2 corresponds to cx).
            Logistic Bernoulli factory is a special case with q=1, c2=1, beta=1.
        - f1, f2: Functions that return 1 if heads and 0 if tails.
        - c1, c2: Factors to multiply the probabilities of heads for f1 and f2, respectively.
        - beta: Early rejection parameter ("portkey" two-coin factory).
          When beta = 1, the formula simplifies to B(c1*p/(c1*p+c2*q)).
        """
        cx = Fraction(c1) / (Fraction(c1) + Fraction(c2))
        beta = Fraction(beta)
        while True:
            if beta != 1:
                if self.zero_or_one(beta.numerator, beta.denominator) == 0:
                    return 0
            if self.zero_or_one(cx.numerator, cx.denominator) == 1:
                if f1() == 1:
                    return 1
            else:
                if f2() == 1:
                    return 0

    def sin(self, f):
        """Sine Bernoulli factory: B(p) => B(sin(p)).  Special
        case of Algorithm3 of reverse-time martingale paper.
        """
        if f() == 0:
            return 0
        u = Fraction(1)
        l = Fraction(0)
        w = Fraction(1)
        bag = []
        fac = 6
        n = 1
        while True:
            if self.debug and self.totalbits >= 5000:
                return math.nan
            # print([fac,math.factorial(2*n)])
            if w != 0:
                w *= f()
            if w != 0:
                w *= f()
            if n % 2 == 0:
                u = l + w / fac
            else:
                l = u - w / fac
            if self._uniform_less(bag, l) == 1:
                return 1
            if self._uniform_less(bag, u) == 0:
                return 0
            n += 1
            fac *= (n * 2) * (n * 2 + 1)

    def martingale(self, coin, coeff):
        """General martingale algorithm for alternating power
        series.
        'coin' is the coin to be flipped; 'coeff' is a function
        that takes an index 'i' and calculates the coefficient
        for index 'i'.  Indices start at 0."""
        u = Fraction(coeff(0))
        l = Fraction(0)
        w = Fraction(1)
        bag = []
        n = 1
        while True:
            if w != 0:
                w *= coin()
            coef = coeff(n)
            if coef > 0:
                u = l + w * coef
            else:
                l = u - w * abs(coef)
            if self._uniform_less(bag, l) == 1:
                return 1
            if self._uniform_less(bag, u) == 0:
                return 0
            n += 1

    def cos(self, f):
        """Cosine Bernoulli factory: B(p) => B(cos(p)).  Special
        case of Algorithm3 of reverse-time martingale paper.
        """
        u = Fraction(1)
        l = Fraction(0)
        w = Fraction(1)
        bag = []
        fac = 2
        n = 1
        while True:
            if self.debug and self.totalbits >= 5000:
                return math.nan
            # print([fac,math.factorial(2*n)])
            if w != 0:
                w *= f()
            if w != 0:
                w *= f()
            if n % 2 == 0:
                u = l + w / fac
            else:
                l = u - w / fac
            if self._uniform_less(bag, l) == 1:
                return 1
            if self._uniform_less(bag, u) == 0:
                return 0
            n += 1
            fac *= (n * 2 - 1) * (n * 2)

    def add(self, f1, f2, eps=Fraction(5, 100)):
        """Addition Bernoulli factory: B(p), B(q) => B(p+q) (Dughmi et al. 2021)
        - f1, f2: Functions that return 1 if heads and 0 if tails.
        - eps: A Fraction in (0, 1). eps must be chosen so that p+q <= 1 - eps,
          where p and q are the probability of heads for f1 and f2, respectively.
        """
        fv = lambda: self.mean(f1, f2)
        return self.linear(fv, 2, 1)

    def old_linear(self, f, cx, cy=1, eps=Fraction(5, 100)):
        """Linear Bernoulli factory: B(p) => B((cx/cy)*p). Older algorithm given in (Huber 2014).
        - f: Function that returns 1 if heads and 0 if tails.
        - cx, cy: numerator and denominator of c; the probability of heads (p) is multiplied
          by c. c must be 0 or greater. If c > 1, c must be chosen so that c*p < 1 - eps.
        - eps: A Fraction in (0, 1). If c > 1, eps must be chosen so that c*p < 1 - eps.
        """
        if cy == 1:
            c = Fraction(cx)
        else:
            c = Fraction(cx, cy)
        # Fast cases, not covered in Huber, to make this more general than c > 1
        if c < 0:
            raise ValueError
        if c == 0:
            return 0
        if c == 1:
            return f()
        if c.numerator < c.denominator:
            # B(p) -> B(c*p), where c is in (0, 1)
            return (
                1
                if self.zero_or_one(c.numerator, c.denominator) == 1 and f() == 1
                else 0
            )
        gamma = Fraction(1, 2)
        eps = Fraction(eps)
        if eps <= 0:
            raise ValueError
        k = Fraction(23, 10) / (gamma * eps)
        eps = min(eps, Fraction(644, 1000))
        i = 1
        while True:
            ce = (c - 1) / c
            cn = ce.numerator
            cd = ce.denominator
            while True:
                # print([i,self.totalbits,float(self._coinprob),"k",float(k)])
                if self.debug and self.totalbits >= 5000:
                    return math.nan
                i -= 1
                if f() == 0:
                    # Number of failures before first success, plus 1
                    i += 1
                    while self.zero_or_one(cn, cd) == 0:
                        if self.debug and self.totalbits >= 5000:
                            return math.nan
                        i += 1
                if i == 0:
                    return 1
                if i >= k:
                    break
            if i >= k:
                ce = 1 + gamma * eps
                if ce < 1:
                    raise ValueError
                if self.debug and self.totalbits >= 5000:
                    return math.nan
                # print(float(ce),float(ce**-i),float((1/ce)**i))
                if self.zero_or_one_power(ce.denominator, ce.numerator, i) == 0:
                    return 1 if i == 0 else 0
                c *= ce
                eps *= 1 - gamma
                k /= 1 - gamma
            if i == 0:
                return 1

    def linear(self, f, cx, cy=1, eps=Fraction(5, 100)):
        """Linear Bernoulli factory: B(p) => B((cx/cy)*p) (Huber 2016).
        - f: Function that returns 1 if heads and 0 if tails.
        - cx, cy: numerator and denominator of c; the probability of heads (p) is multiplied
          by c. c must be 0 or greater. If c > 1, c must be chosen so that c*p <= 1 - eps.
        - eps: A Fraction in (0, 1). If c > 1, eps must be chosen so that c*p <= 1 - eps.
        """
        if cy == 1:
            c = Fraction(cx)
        else:
            c = Fraction(cx, cy)
        # Fast cases, not covered in Huber, to make this more general than c > 1
        if c < 0:
            raise ValueError
        if c == 0:
            return 0
        if c == 1:
            return f()
        if c.numerator < c.denominator:
            # B(p) -> B(c*p), where c is in (0, 1)
            return (
                1
                if self.zero_or_one(c.numerator, c.denominator) == 1 and f() == 1
                else 0
            )
        eps = Fraction(eps)
        if eps <= 0:
            raise ValueError
        m = (Fraction(9, 2) / eps) + 1
        # Ceiling operation
        m += Fraction(m.denominator - m.numerator % m.denominator, m.denominator)
        m = int(m)
        beta = 1 + Fraction(1) / (m - 1)
        if self.debug and self.totalbits >= 5000:
            return math.nan
        if self._algorithm_a(f, m, beta * c) == 0:
            if self.debug and self.totalbits >= 5000:
                return math.nan
            return 0
        if self.zero_or_one(beta.denominator, beta.numerator) == 1:
            if self.debug and self.totalbits >= 5000:
                return math.nan
            return 1  # Bern(1/beta)
        bc = beta * c
        while True:
            if self.debug and self.totalbits >= 5000:
                return math.nan
            if (
                self.linear(f, bc.numerator, bc.denominator, eps=1 - beta * (1 - eps))
                == 0
            ):
                if self.debug and self.totalbits >= 5000:
                    return math.nan
                return 0
            if self._high_power_logistic(f, m - 2, beta, c) == 1:
                if self.debug and self.totalbits >= 5000:
                    return math.nan
                return 1
            m -= 1

    def bernstein(self, f, alpha):
        """Polynomial Bernoulli factory: B(p) => B(Bernstein(alpha))
             (Goyal and Sigman 2012).
        - f: Function that returns 1 if heads and 0 if tails.
        - alpha: List of Bernstein coefficients for the polynomial (when written
           in Bernstein form),
           whose degree is this list's length minus 1.
           For this to work, each coefficient must be in [0, 1]."""
        for a in alpha:
            if a < 0 or a > 1:
                raise ValueError
        j = sum([f() for i in range(len(alpha) - 1)])
        return 1 if self._uniform_less([], alpha[j]) == 1 else 0

    def exp_minus_ext(self, f, c=0):
        """
        Extension to the exp-minus Bernoulli factory of (Łatuszyński et al. 2011):
        B(p) -> B(exp(-p - c))
        To the best of my knowledge, I am not aware
               of any article or paper that presents this particular
               Bernoulli factory (before my articles presenting
               accurate beta and exponential generators).
        - f: Function that returns 1 if heads and 0 if tails.
        - c: Integer part of exp-minus.  Default is 0.
        """
        if self.zero_or_one_exp_minus(c, 1) == 0:
            return 0
        return self.exp_minus(f)

    def alt_series(self, f, series):
        """
        Alternating-series Bernoulli factory: B(p) -> B(s[0] - s[1]*p + s[2]*p^2 - ...)
        (Łatuszyński et al. 2011).
        - f: Function that returns 1 if heads and 0 if tails.
        - series: Object that generates each coefficient of the series starting with the first.
          Each coefficient must be less than or equal to the previous and all of them must
          be 1 or less.
          Implements the following two methods: reset() resets the object to the first
          coefficient; and next() generates the next coefficient.
        """
        series.reset()
        u = Fraction(1) * series.next()
        l = Fraction(0)
        w = Fraction(1)
        bag = []
        n = 1
        while True:
            if w != 0:
                w *= f()
            if n % 2 == 0:
                u = l + w * series.next()
            else:
                l = u - w * series.next()
            if self._uniform_less(bag, l) == 1:
                return 1
            if self._uniform_less(bag, u) == 0:
                return 0
            n += 1

    def exp_minus(self, f):
        """
        Exp-minus Bernoulli factory: B(p) -> B(exp(-p)) (Łatuszyński et al. 2011).
        - f: Function that returns 1 if heads and 0 if tails.
        """
        u = Fraction(1)
        l = Fraction(0)
        uw = 1
        bag = []
        n = 1
        fac = Fraction(1)
        while True:
            if uw != 0:
                uw *= f()
            if n % 2 == 0:
                u = l + uw / fac
            else:
                l = u - uw / fac
            if self._uniform_less(bag, l) == 1:
                return 1
            if self._uniform_less(bag, u) == 0:
                return 0
            n += 1
            fac *= n

    def twofacpower(self, fbase, fexponent):
        """Bernoulli factory B(p, q) => B(p^q).
        Based on algorithm from (Mendo 2019),
        but changed to accept a Bernoulli factory
        rather than a fixed value for the exponent.
        To the best of my knowledge, I am not aware
        of any article or paper that presents this particular
        Bernoulli factory (before my articles presenting
        accurate beta and exponential generators).
        - fbase, fexponent: Functions that return 1 if heads and 0 if tails.
          The first is the base, the second is the exponent.
        """
        i = 1
        while True:
            if fbase() == 1:
                return 1
            if fexponent() == 1 and self.zero_or_one(1, i) == 1:
                return 0
            i = i + 1

    def linear_power(self, f, cx, cy=1, i=1, eps=Fraction(5, 100)):
        """Linear-and-power Bernoulli factory: B(p) => B((p*cx/cy)^i) (Huber 2019).
        - f: Function that returns 1 if heads and 0 if tails.
        - cx, cy: numerator and denominator of c; the probability of heads (p) is multiplied
          by c. c must be 0 or greater. If c > 1, c must be chosen so that c*p <= 1 - eps.
        - i: The exponent.  Must be an integer and 0 or greater.
        - eps: A Fraction in (0, 1). If c > 1, eps must be chosen so that c*p <= 1 - eps.
        """
        if i == 0:
            return 1
        if i < 0:
            raise ValueError
        eps = Fraction(eps)
        if eps <= 0:
            raise ValueError
        if cy == 1:
            c = Fraction(cx)
        else:
            c = Fraction(cx, cy)
        # Fast cases, not covered in Huber, to make this more general than c > 1
        if c < 0:
            raise ValueError
        if c == 0:
            return 0
        if c == 1 and i == 1:
            return f()
        if c.numerator < c.denominator:
            # B(p) -> B((c*p)^i), where c is in (0, 1)
            fv = lambda: (
                1
                if self.zero_or_one(c.numerator, c.denominator) == 1 and f() == 1
                else 0
            )
            return self.power(fv, i)
        thresh = Fraction(355, 100)
        while True:
            if self.debug and self.totalbits >= 5000:
                return math.nan
            if i == 0:
                return 1
            while i > thresh / eps:
                if self.debug and self.totalbits >= 5000:
                    return math.nan
                halfeps = eps / 2
                beta = (1 - halfeps) / (1 - eps)
                if self.zero_or_one_power(beta.denominator, beta.numerator, i) == 0:
                    if self.debug and self.totalbits >= 5000:
                        return math.nan
                    return 0
                c *= beta
                eps = halfeps
            i = i + 1 - self.logistic(f, c, 1) * 2
            if math.isnan(i):
                return math.nan

    def linear_lowprob(self, f, cx, cy=1, m=Fraction(249, 500)):
        """Linear Bernoulli factory which is faster if the probability of heads is known
            to be less than half: B(p) => B((cx/cy)*p) (Huber 2016).
        - f: Function that returns 1 if heads and 0 if tails.
        - cx, cy: numerator and denominator of c; the probability of heads (p) is multiplied
          by c. c must be 0 or greater. If c > 1, c must be chosen so that c*p <= m < 1/2.
        - m: A Fraction in (0, 1/2). If c > 1, m must be chosen so that c*p <= m < 1/2.
        """
        if cy == 1:
            c = Fraction(cx)
        else:
            c = Fraction(cx, cy)
        # Fast cases, not covered in Huber, to make this more general than c > 1
        if c < 0:
            raise ValueError
        if c == 0:
            return 0
        if c == 1:
            return f()
        if c.numerator < c.denominator:
            # B(p) -> B(c*p), where c is in (0, 1)
            return (
                1
                if self.zero_or_one(c.numerator, c.denominator) == 1 and f() == 1
                else 0
            )
        m = Fraction(m)
        if m >= Fraction(1, 2):
            raise ValueError
        beta = Fraction(1) / (1 - 2 * m)
        bc = beta * c
        lb = self.logistic(f, bc.numerator, bc.denominator)
        if lb == 0:
            if self.debug and self.totalbits >= 5000:
                return math.nan
            return 0
        if self.zero_or_one(beta.denominator, beta.numerator) == 1:
            return 1  # Bern(1/beta)
        c = beta * c / (beta - 1)
        return self.linear(f, c, eps=Fraction(1) - m)

    def _fb2(self, fbelow, a, b, v=1):
        if b > a:
            raise ValueError
        return Fraction(int(Fraction(fbelow(a, b)) * v), v)

    def _fa2(self, fabove, a, b, v=1):
        if b > a:
            raise ValueError
        mv = Fraction(fabove(a, b)) * v
        imv = int(mv)
        return Fraction(imv, v) if mv == imv else Fraction(imv + 1, v)

    def simulate(self, coin, fbelow, fabove, fbound, nextdegree=None):
        """Simulates a general factory function defined by two
        sequences of polynomials that converge from above and below.
        - coin(): Function that returns 1 or 0 with a fixed probability.
        - fbelow(n, k): Calculates the kth Bernstein coefficient (not the value),
          or a lower bound thereof, for the degree-n lower polynomial (k starts at 0).
        - fabove(n, k): Calculates the kth Bernstein coefficient (not the value),
          or an upper bound thereof, for the degree-n upper polynomial.
        - fbound(n): Returns a tuple or list specifying a lower and upper bound
           among the values of fbelow and fabove, respectively, for the specified n.
         - nextdegree(n): Returns a lambda returning the next degree after the specified degree n for which a polynomial is available; the lambda
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
        ret = []
        while True:
            for i in range(degree - lastdegree):
                if coin() == 1:
                    ones += 1
            c = math.comb(degree, ones)
            md = degree
            l = self._fb2(fbelow, degree, ones, c << md)
            u = self._fa2(fabove, degree, ones, c << md)
            if False:
                fba[(degree, ones)] = l
                faa[(degree, ones)] = u
            ls = Fraction(0)
            us = Fraction(1)
            if degree > startdegree:
                nh = math.comb(degree, ones)
                md = lastdegree
                combs = [
                    Fraction(
                        math.comb(degree - lastdegree, ones - j)
                        * math.comb(lastdegree, j),
                        nh,
                    )
                    for j in range(0, min(lastdegree, ones) + 1)
                ]
                if False:  # Correctness check
                    for j in range(0, min(lastdegree, ones) + 1):
                        fb = self._fb2(
                            fbelow, lastdegree, j, math.comb(lastdegree, j) << md
                        )
                        if (lastdegree, j) in fba:
                            # print(fb)
                            if fba[(lastdegree, j)] != fb:
                                raise ValueError
                        fa = self._fa2(
                            fabove, lastdegree, j, math.comb(lastdegree, j) << md
                        )
                        if (lastdegree, j) in faa:
                            # print(fa)
                            if faa[(lastdegree, j)] != fa:
                                raise ValueError
                ls = sum(
                    self._fb2(fbelow, lastdegree, j, math.comb(lastdegree, j) << md)
                    * combs[j]
                    for j in range(0, min(lastdegree, ones) + 1)
                )
                us = sum(
                    self._fa2(fabove, lastdegree, j, math.comb(lastdegree, j) << md)
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
            if self._uniform_less(ret, lt):
                return 1
            if not self.uniform_less(ret, ut):
                return 0
            lastdegree = degree
            degree = nextdegree(degree) if nextdegree != None else degree * 2

def _multinom(n, x):
    # Use "ymulticoeff" algorithm found in https://github.com/leolca/bincoeff#multicoeff
    num = 1
    for i in range(x[0] + 1, n + 1):
        num *= i
    den = 1
    for i in range(1, len(x)):
        for j in range(1, x[i] + 1):
            den *= j
    return Fraction(num) / den

def _neighbordist(ni, nj, b):
    ret = [av - bv for av, bv in zip(ni, nj)]
    ret[b] += 1
    return sum(abs(x) for x in ret)

class _FastLoadedDiceRoller:
    """
    Fast Loaded Dice Roller.  Reference: Saad et al. 2020, "The Fast Loaded
    Dice Roller [etc.]".
    """

    def _toWeights(self, numbers):
        ret = [Fraction(r) for r in numbers]
        prod = 1
        for v in ret:
            prod *= v.denominator
        ret = [int(v * prod) for v in ret]
        gc = 0
        for v in ret:
            gc = math.gcd(gc, v)
        return [v // gc for v in ret]

    def __init__(self, weights):
        self.n = len(weights)
        if self.n == 1:
            return
        weights = self._toWeights(weights)
        weightBits = 0
        totalWeights = sum(weights)
        if totalWeights < 0:
            raise ValueError("Sum of weights is negative")
        if totalWeights == 0:
            raise ValueError("Sum of weights is zero")
        tmp = totalWeights - 1
        while tmp > 0:
            tmp >>= 1
            weightBits += 1
        lasta = (1 << weightBits) - totalWeights
        self.leavesAndLabels = [
            [0 for i in range(weightBits)] for j in range(self.n + 2)
        ]
        shift = weightBits - 1
        for j in range(weightBits):
            level = 1
            for i in range(self.n + 1):
                ai = lasta if i == self.n else weights[i]
                if ai < 0:
                    raise ValueError
                leaf = (ai >> shift) & 1
                if leaf > 0:
                    # NOTE: Labels start at 1
                    self.leavesAndLabels[0][j] += leaf
                    self.leavesAndLabels[level][j] = i + 1
                    level += 1
            shift -= 1

    def next(self, randgen):
        if self.n == 1:
            return 0
        x = 0
        y = 0
        while True:
            x = randgen.randbit() | (x << 1)
            leaves = self.leavesAndLabels[0][y]
            if x < leaves:
                label = self.leavesAndLabels[x + 1][y]
                if label <= self.n:
                    return label - 1
                x = 0
                y = 0
            else:
                x -= leaves
                y += 1

BERNCOMATRIX = {}

def berncomatrix(deg):
    if deg in BERNCOMATRIX:
        return BERNCOMATRIX[deg]
    n = deg + 1
    if n < 0:
        raise ValueError
    # Build power-to-Bernstein basis matrix
    mat = [[0 for _ in range(n)] for _ in range(n)]
    factorials = [math.factorial(i) for i in range(n)]
    for j in range(n):
        for k in range(n):
            if k == 0 or j == n - 1:
                mat[j][k] = Fraction(1)
            elif k <= j:
                binnum = Fraction(factorials[j], factorials[j - k] * factorials[k])
                binden = Fraction(
                    factorials[n - 1], factorials[k] * factorials[n - 1 - k]
                )
                mat[j][k] = Fraction(binnum, binden)
            else:
                mat[j][k] = Fraction(0)
    BERNCOMATRIX[deg] = mat
    return mat

def bernsteinDiff(coeffs, diff=1):
    # Gets the Bernstein coefficients of the 'diff'-th derivative of
    # a polynomial given its Bernstein coefficients.
    # The coefficients are ordered 0th order, 1st order, and
    # so on.
    if len(coeffs) == 0:
        raise ValueError("no coeffs")
    if diff < 0:
        raise ValueError("invalid value for diff (diff<0)")
    if diff == 0:
        return coeffs
    n = len(coeffs) - 1
    if diff > n:
        return [0]
    for i in range(diff):
        coeffs = [(coeffs[i + 1] - coeffs[i]) * n for i in range(n)]
        n -= 1
    return coeffs

def matmult(mat, vec):
    # Multiply a matrix by a column vector
    return [sum(r[i] * vec[i] for i in range(len(vec))) for r in mat]

def berncofrompower(coeffs):
    if len(coeffs) == 0:
        return [0]
    if max(coeffs) == 0 and min(coeffs) == 0:
        return [0] * len(coeffs)
    degree = max(i for i in range(len(coeffs)) if coeffs[i] != 0)
    n = degree + 1
    # Build coefficient vector
    coeffs = [Fraction(v) for v in coeffs[0:n]]
    mat = berncomatrix(n - 1)
    # Get the Bernstein control points
    return matmult(mat, coeffs)

try:
    from betadist import PiecewiseBernstein
except:
    pass

def _elevate1(coeffs):  # Elevate polynomial in Bernstein form by 1 degree
    n = len(coeffs) - 1
    return [
        coeffs[max(0, k - 1)] * Fraction(k) / (n + 1)
        + coeffs[min(n, k)] * Fraction((n + 1) - k) / (n + 1)
        for k in range(n + 2)
    ]

class PolynomialSim:
    """
    Bernoulli factory for a polynomial expressed in power coefficients.
    powerCoeffs[0] is the coefficient of order 0; powerCoeffs[1], of order 1, etc.
    """

    def __init__(self, bern, powerCoeffs, coin1):
        self.bern = bern
        self.coin1 = coin1
        if len(powerCoeffs) == 0:
            raise ValueError
        coeffs = powerCoeffs
        if sum(coeffs) < 0 or sum(coeffs) > 1 or coeffs[0] < 0 or coeffs[0] > 1:
            # Polynomial at 1 is greater than 0 or less than 1,
            # or order-0 coefficient is so
            raise ValueError
        # Convert to Bernstein coefficients
        bco = berncofrompower(coeffs)
        zeroOne = (bco[0] == 1 and bco[len(bco) - 1] == 0) or (
            bco[0] == 0 and bco[len(bco) - 1] == 1
        )
        mn = min(berncoeffs)
        mx = max(berncoeffs)
        ubound = mx
        if mn < 0 or mx > 1:
            pwb = PiecewiseBernstein().piece(berncoeffs, 0, 1)
            mn, ubound = pwb.findBounds()
        if mn < 0:
            raise ValueError
        if zeroOne and ubound > 1:
            raise ValueError
        # Ensure all coefficients are nonnegative
        while min(bco) < 0 and ((not zeroOne) or max(bco) > 0):
            bco = _elevate1(bco)
        bco = [Fraction(c.p, c.q) for c in bco]
        bcomax = max(bco)
        self.bcomax = bcomax
        self.bco = bco
        # Build coin
        if bcomax > 1:
            # Ensure all coefficients are no more than 1
            eps = Fraction(1) - ubound
            if eps <= 0:
                # maximum is 1 or greater
                raise ValueError
            self.bco = [c / bcomax for c in bco]
            self.newcoin = lambda: self.bern._uniform_less(
                [], self.bco[sum(self.coin1() for i in range(len(self.bco) - 1))]
            )
            self.eps = eps

    def simulate(self):
        if self.bcomax > 1:
            # Run linear Bernoulli factory
            return self.bern.old_linear(
                self.newcoin,
                self.bcomax.numerator,
                self.bcomax.denominator,
                eps=self.eps,
            )
        else:
            return self.bern._uniform_less(
                [], self.bco[sum(self.coin1() for i in range(len(self.bco) - 1))]
            )

class DiceEnterprise:
    """
    Implements the Dice Enterprise algorithm for
    turning loaded dice with unknown probability of heads into loaded dice
    with a different probability of heads.  Specifically, it supports specifying
    the probability that the output die will land on a given
    number, as a polynomial function of the input die's probability of heads.
    The case of coins to coins is also called
    the Bernoulli factory problem; this class allows the output
    coin's probability of heads to be specified as a polynomial function of the
    input coin's probability of heads.

    Reference: Morina, G., Łatuszyński, K., et al., "From the
    Bernoulli Factory to a Dice Enterprise via Perfect
    Sampling of Markov Chains", arXiv:1912.09229v1 [math.PR], 2019.

    Example:

    >>> from bernoulli import DiceEnterprise
    >>> import math
    >>> import random
    >>>
    >>> ent=DiceEnterprise()
    >>> # Example 3 from the paper
    >>> ent.append_poly(1,[[math.sqrt(2),3]])
    >>> ent.append_poly(0,[[-5,3],[11,2],[-9,1],[3,0]])
    >>> coin=lambda: 1 if random.random() < 0.60 else 0
    >>> print([ent.next(coin) for i in range(100)])

    """

    def __init__(self):
        self.ladder = []
        self.optladder = []
        self.bern = Bernoulli()
        self.vmatrix = None
        self._dirty = True

    def append_poly(self, result, poly):
        """
        Appends a probability that the output die will land on
        a given number, in the form of a polynomial.
        result - A number indicating the result (die roll or coin
          flip) that will be returned by the _output_ coin or _output_
          die with the probability represented by this polynomial.
          Must be an integer 0 or greater.  In the case of dice-to-coins
          or coins-to-coins, must be either 0 or 1, where 1 means
          heads and 0 means tails.
        poly - Polynomial expressed as a list of terms as follows:
          Each term is a list of two or more items that each express one of
          the polynomial's terms; the first item is the coefficient, and
          the remaining items are the powers of the input die's
          probabilities.  The number of remaining items in each term
          is the number of faces the _input_ die has. Specifically, the
          term has the following form:

          In the case of coins-to-dice or coins-to-coins (so the probabilities are 1-p and p,
          where the [unknown] probability that the _input_ coin returns 0
          is 1 - p, or returns 1 is p):
                   term[0] * p**term[1] * (1-p)**term[2].
          In the case of dice-to-dice or dice-to-coins (so the probabilities are p1, p2, etc.,
          where the [unknown] probability that the _input_ die returns
          0 is p1, returns 1 is p2, etc.):
                   term[0] * p1**term[1] * p2**term[2] * ... * pn**term[n].

          For example, [3, 4, 5] becomes:
                   3 * p**4 * (1-p)**5
          As a special case, the term can contain two items and a zero is
          squeezed between the first and second item.
          For example, [3, 4] is the same as [3, 0, 4], which in turn becomes:
                   3 * p**4 * (1-p)**0 = 3 * p **4

          For best results, the coefficient should be a rational number
          (such as int or Python's Fraction).

          Each term in the polynomial must have the same number of items (except
          for the special case given earlier).  For example, the following is not a valid
          way to express this parameter:
                   [[1, 1, 0], [1, 3, 4, 5], [1, 1, 2], [2, 3, 4]]
          Here, the second term has four items, not three like the rest.
        Returns this object.
        """
        if result < 0 or int(result) != result:
            raise ValueError
        oldrlen = -1
        for j in range(len(poly)):
            r = poly[j][1:]  # Get powers of variables
            if len(r) == 1:
                r = [0, r[0]]  # Special case
            if oldrlen >= 0 and oldrlen != len(r):
                raise ValueError
            oldrlen = len(r)
            # Append coefficient, powers, and result to ladder
            self.ladder.append([[Fraction(poly[j][0])], r, [result]])
        self._dirty = True
        return self

    def _is_definitely_connected(self):
        # Determine whether the ladder is connected.
        # Currently, works only for univariate ladders.
        if not self._is_univariate():
            # Assume ladder is not connected, since determining
            # whether every state is reachable from every other
            # seems hard in the multivariate case.  Fortunately,
            # augmenting the ladder enough times will form a
            # connected ladder, and we know how often it should
            # be augmented.
            return False
        # For each state...
        for i in range(len(self.ladder) - 1):
            j = i + 1
            # Calculate 1-norm over all degrees (powers) in the
            # two states to check their closeness
            one_norm = 0
            for k in range(len(self.ladder[j][1])):
                one_norm += abs(self.ladder[j][1][k] - self.ladder[i][1][k])
            if one_norm > 2:
                return False
        return True

    def _thin(self):
        for i in range(len(self.ladder)):
            if self.ladder[i] == None:
                continue
            if (len(self.ladder[i][0]) == 1 and self.ladder[i][0] == 0) or sum(
                self.ladder[i][0]
            ) == 0:
                # This state has a coefficient of 0
                self.ladder[i] = None
                continue
            for j in range(i + 1, len(self.ladder)):
                if self.ladder[j] and (
                    (len(self.ladder[j][0]) == 1 and self.ladder[j][0] == 0)
                    or sum(self.ladder[j][0]) == 0
                ):
                    # This state has a coefficient of 0
                    self.ladder[j] = None
                if self.ladder[j] and self.ladder[i][1] == self.ladder[j][1]:
                    # Combine terms with the same monomial
                    # print(self.ladder[i])
                    # print(self.ladder[j])
                    for k in range(len(self.ladder[j][0])):
                        added = False
                        jm = self.ladder[j][0][k]
                        for m in range(len(self.ladder[i][0])):
                            im = self.ladder[i][0][m]
                            # Add two terms if they both
                            # point to the same result (die roll or coin toss).
                            # Since the terms are Fractions, this will be exact.
                            if self.ladder[i][2][m] == self.ladder[j][2][k]:
                                # print(["adding","im",float(self.ladder[i][0][m]),"jm",float(jm)])
                                self.ladder[i][0][m] += jm
                                added = True
                                break
                        if not added:
                            self.ladder[i][0].append(self.ladder[j][0][k])
                            self.ladder[i][2].append(self.ladder[j][2][k])
                    # print(["i now",self.ladder[i]])
                    self.ladder[j] = None
        newladder = []
        for v in self.ladder:
            if v != None:
                newladder.append(v)
        if self._is_univariate():
            newladder.sort(key=lambda x: x[1])
        self.ladder = newladder
        return self

    def _increase_degree(self):
        newladder = []
        for v in self.ladder:
            for k in range(len(self.ladder[0][1])):
                # Copy coefficients, powers, and results
                nl = [[x for x in v[0]], [x for x in v[1]], [x for x in v[2]]]
                nl[1][
                    k
                ] += 1  # Add 1 to the degree (power) corresponding to the variable k
                newladder.append(nl)
        self.ladder = newladder
        return self

    def _neighbors(self, m):
        k = len(self.ladder)
        ret = [[[] for _ in range(m + 1)] for _ in range(k)]
        for i in range(k):
            for j in range(k):
                if i == j:
                    continue
                for b in range(m + 1):
                    if _neighbordist(self.ladder[i][1], self.ladder[j][1], b) == 1:
                        ret[i][b].append(j)
        return ret

    def _sum_neighbors(self, neighbors):
        return [
            [sum(sum(self.ladder[j][0]) for j in v2) for v2 in v] for v in neighbors
        ]

    def _copy_neighbors(self, neighbors):
        return [[[j for j in v2] for v2 in v] for v in neighbors]

    def _find_max_b_i(self, s):
        mv = -1
        best_i = 0
        best_b = 0
        for i in range(len(s)):
            for b in range(len(s[i])):
                if mv < s[i][b]:
                    best_i = i
                    best_b = b
                    mv = s[i][b]
        return best_b, best_i

    def _find_direction(self, neighbors, i, j):
        for c in range(len(neighbors[j])):
            if i in neighbors[j][c]:
                return c
        # Failed; perhaps the ladder is not a connected one
        print(["Cannot find i in any of j's neighbors", "i", i, "j", j])
        print(["neighbors", neighbors[j]])
        return None

    def _build_markov_matrix(self):
        k = len(self.ladder) - 1
        m = len(self.ladder[0][1]) - 1
        v = [[0 for _ in range(k + 1)] for _ in range(k + 1)]
        n = self._neighbors(m)
        self.neighbors = self._copy_neighbors(n)
        n_count = sum(sum(len(v2) for v2 in v) for v in n)
        if n_count % 2 != 0:
            raise ValueError
        s = self._sum_neighbors(n)
        w = [[0 for _ in nb] for nb in n]
        while n_count > 0:
            b, i = self._find_max_b_i(s)
            for j in [x for x in n[i][b]]:
                ri = sum(self.ladder[i][0])
                rj = sum(self.ladder[j][0])
                v[i][j] = rj / s[i][b]
                n[i][b].remove(j)
                w[i][b] += v[i][j]
                # print([n[i][b],i,j])
                c = self._find_direction(n, i, j)
                if c == None:
                    # Failed; perhaps the ladder is not a connected one
                    raise ValueError
                v[j][i] = ri / s[i][b]
                n[j][c].remove(i)
                w[j][c] += v[j][i]
                s[j][c] = sum(sum(self.ladder[jj][0]) for jj in n[j][c]) / (1 - w[j][c])
                n_count -= 2
            s[i][b] = 0
        self.vmatrix = v
        return self

    def _degree(self):
        deg = 0  # Degree of polynomial
        for v in self.ladder:
            deg = max(deg, max(v[1]))
        return deg

    def _rebuild(self):
        deg = self._degree()
        hasneg = False
        maxresult = 0
        for st in self.ladder:
            maxresult = max(max(st[2]), maxresult)
        # Rebuild the whole ladder, in case not all polynomials
        # for each result have the same degree or some of their
        # coefficients are negative.  This is especially important
        # in the multivariate case in order for the Markov matrix
        # construction to succeed.

        dimension = len(self.ladder[0][1]) - 1  # Dimension of simplex
        newladder = []
        # print("before make_positive")
        # print(self.ladder)
        for res in range(maxresult + 1):
            self._make_positive(newladder, res, deg, dimension)
        # print("after make_positive")
        # print(newladder)
        self.ladder = newladder

    def _autoaugment(self):
        self._rebuild()
        deg = self._degree()
        # Turn into a fine ladder if necessary
        # print(["degree",deg])
        self._thin()
        for i in range(deg):
            if self._is_definitely_connected():
                break
            self._increase_degree()._thin()
        return self._compile_ladder()

    def augment(self, count=1):
        """Augments the degree of the function represented
        by this object, which can improve performance in some cases
        (for details, see the paper).
        - count: Number of times to augment the ladder.
        Returns this object.
        """
        if self._dirty:
            self._dirty = False
            self._rebuild()
        for i in range(count):
            self._increase_degree()._thin()
        return self._compile_ladder()

    def _calcprob(self, p, result=1):
        # Debugging method to calculate the probability
        # of getting a particular result from this object
        if isinstance(p, float):
            p = [1 - p, p]
        p = [Fraction(x) for x in p]
        ret = 0
        rtot = 0
        for v in self.ladder:
            for k in range(len(v[2])):
                rtv = v[0][k]
                for pv, v2 in zip(p, v[1]):
                    rtv *= pv**v2
                rtot += rtv
                if v[2][k] == result:
                    ret += rtv
        return float(ret / rtot)

    def next(self, coin):
        """Returns the next result of the flip from a coin or die
        that is transformed from the specified input coin or die by the function
        represented by this Dice Enterprise object.
        coin - In the case of coins-to-dice or coins-to-coins (see the "append_poly" method),
           this specifies the _input coin_, which must be a function that
           returns either 1 (heads) or 0 (tails).  In the case of dice-to-dice or dice-to-coins,
           this specifies an _input die_ with _m_ faces, which must be a
           function that returns an integer in the interval [0, m), which
           specifies which face the input die lands on."""
        if len(self.ladder) == 0:
            return 0
        if self._dirty:
            self._dirty = False
            self._autoaugment()
            self._compile_ladder()
        if len(self.ladder[0][1]) == 2:
            s = self._monotoniccftp(coin)
        else:
            s = self._cftp(coin)
        if s[0] == None:
            # Only one coefficient, so return the corresponding result
            return s[1][0]
        else:
            # This is an aggregation, so do a weighted choice
            # of all coefficients sharing this monomial to decide
            # which result to return
            return s[1][s[0].next(self.bern)]

    def _is_univariate(self):
        return len(self.ladder[0][1]) == 2

    def _compile_ladder(self):
        self.optladder = [0 for i in range(len(self.ladder))]
        univ = self._is_univariate()
        if not univ:
            self._build_markov_matrix()
        for i in range(len(self.ladder)):
            fr1 = 0
            fr2 = 0
            fr3 = None
            if len(self.ladder[i][0]) > 1:
                fr3 = _FastLoadedDiceRoller(self.ladder[i][0])
            # Precalculation done here because Python's
            # Fraction class is greatly slow
            if univ:
                # Precalculation for univariate ladders
                if i > 0:  # Calculate ladder[i-1]/max(ladder[i-1],ladder[i])
                    la = self.ladder[i - 1][0]  # Coefficient(s) for previous state
                    lcur = self.ladder[i][0]  # Coefficient(s) for current state
                    la = la[0] if len(la) == 1 else sum(la)
                    lcur = lcur[0] if len(lcur) == 1 else sum(lcur)
                    lcur = max(la, lcur)
                    fr = (
                        Fraction(la, lcur)
                        if isinstance(la, int) and isinstance(lcur, int)
                        else (Fraction(la) / Fraction(lcur))
                    )
                    fr1 = fr
                if i < len(self.ladder) - 1:
                    # Calculate ladder[i+1]/max(ladder[i+1],ladder[i])
                    la = self.ladder[i + 1][0]
                    lcur = self.ladder[i][0]
                    la = la[0] if len(la) == 1 else sum(la)
                    lcur = lcur[0] if len(lcur) == 1 else sum(lcur)
                    fr = (
                        Fraction(la, lcur)
                        if isinstance(la, int) and isinstance(lcur, int)
                        else (Fraction(la) / Fraction(lcur))
                    )
                    fr2 = fr
            else:
                # Precalculation for multivariate ladders
                n = [[] for v in self.neighbors[i]]
                for b in range(len(self.neighbors[i])):
                    v = Fraction(0)
                    for j in self.neighbors[i][b]:
                        v += self.vmatrix[i][j]
                        n[b].append([v.numerator, v.denominator])
                fr1 = n
            self.optladder[i] = [fr1, fr2, fr3]
            # print(self.optladder)
        return self

    def _monotonicladderupdate(self, i, b, u):
        # Update function for univariate ladders (coins-to-dice)
        # Heads case
        if i > 0 and b == 1 and self.bern._uniform_less(u, self.optladder[i][0]):
            return i - 1
        # Tails case
        if (
            i < len(self.ladder) - 1
            and b == 0
            and self.bern._uniform_less(u, self.optladder[i][1])
        ):
            return i + 1
        return i

    def _ladderupdate(self, i, b, u):
        vs = self.optladder[i][0][b]
        n = self.neighbors[i][b]
        for v, j in zip(vs, n):
            if self.bern._uniform_less_nd(u, v[0], v[1]):
                return j
        return i

    def _allsame(self, states):
        for i in range(len(states) - 1):
            if states[i] != states[i + 1]:
                return False
        return True

    def _cftp(self, coin):
        states = [x for x in range(len(self.ladder))]
        bs = []
        us = []
        while not self._allsame(states):
            bs.append(coin())
            us.append([])  # Uniform random number to be filled on demand
            states = [x for x in range(len(self.ladder))]
            i = 0
            while i < len(bs):
                for j in range(len(states)):
                    states[j] = self._ladderupdate(
                        states[j], bs[len(bs) - 1 - i], us[len(bs) - 1 - i]
                    )
                i += 1
        return [self.optladder[states[0]][2], self.ladder[states[0]][2]]

    def _monotoniccftp(self, coin):
        state1 = 0
        state2 = len(self.ladder) - 1
        bs = []
        us = []
        while state1 != state2:
            bs.append(coin())
            us.append([])  # Uniform random number to be filled on demand
            state1 = 0
            state2 = len(self.ladder) - 1
            i = 0
            while i < len(bs):
                state1 = self._monotonicladderupdate(
                    state1, bs[len(bs) - 1 - i], us[len(bs) - 1 - i]
                )
                state2 = self._monotonicladderupdate(
                    state2, bs[len(bs) - 1 - i], us[len(bs) - 1 - i]
                )
                i += 1
        return [self.optladder[state1][2], self.ladder[state1][2]]

    def _simplex(self, d, m):
        # Enumerates the points of a d-scaled m-dimensional simplex
        if m <= 0:
            raise ValueError
        if m == 1:  # One-dimensional case, or base case
            for nv in range(d + 1):
                yield [nv, d - nv]  # p**nv * (1-p)**(d-nv)
        else:
            for nv in range(d + 1):
                for nvs in self._simplex(d - nv, m - 1):
                    yield [nv] + nvs

    def _simplex_allowed(self, nt, np, n):
        for t, p, nn in zip(nt, np, n):
            if t + p != nn:
                return False
        return True

    def _each_allowed_simplex(self, degree, dimension, ntilde, n):
        if dimension == 1:  # One-dimensional case is simple
            d1 = n[0] - ntilde[0]
            d2 = n[1] - ntilde[1]
            if d1 >= 0 and d2 >= 0 and d1 + d2 == degree:
                yield [d1, d2]
        else:  # Multi-dimensional case
            for nprime in self._simplex(degree, dimension):
                if self._simplex_allowed(ntilde, nprime, n):
                    yield nprime

    def _make_positive_onedim(self, newladder, result, degree):
        # One-dimensional case of make-positive
        """
        # For the polynomial with given result:
        n is desired degree
        For each _n0_ in [0, _n_]:
           Set z to 0
           For each term of the form x*p**j * (1-p)**i:
           If n0 >= i and (n-n0) >= j and i+j <= n: Add x*choose(n-(i_j), n0-i) to z
        Append term ret*p**(n-n0) * (1-p)**n0 to ladder
        """
        for n0 in range(degree + 1):
            n1 = degree - n0
            ret = 0
            for state in self.ladder:
                for j in range(
                    len(state[0])
                ):  # The same state may have multiple "results"
                    if state[2][j] == result:
                        ntilde = state[1]  # Monomial for this state
                        if n0 >= ntilde[0] and n1 >= ntilde[1]:
                            d1 = n0 - ntilde[0]
                            d2 = n1 - ntilde[1]
                            # print(["n0",n0,"d1",d1,"d2",d2,"ntilde",ntilde])
                            # d1+d2 = (n0+n1) - (ntilde[0]+ntilde[1])
                            # d1+d2 = degree - current_degree
                            d1d2 = degree - (ntilde[0] + ntilde[1])
                            # Same as: 0 <= d1 + d2 <= degree, since ntilde[x] must
                            # be nonnegative
                            if ntilde[0] + ntilde[1] <= degree:
                                # print([float(state[0][j]),"n0",n0,"n",d1d2,"k",d1,"ntilde",ntilde])
                                ret += Fraction(state[0][j]) * math.comb(d1d2, d1)
            if ret != 0:
                newladder.append([[ret], [n0, n1], [result]])

    def _make_positive(self, newladder, result, degree, dimension):
        if dimension == 1:
            self._make_positive_onedim(newladder, result, degree)
            return
        for n in self._simplex(degree, dimension):
            ret = 0
            for state in self.ladder:
                for j in range(
                    len(state[0])
                ):  # The same state may have multiple "results"
                    if state[2][j] == result:
                        ntilde = state[1]  # Monomial for this state
                        for i in range(degree + 1):
                            for nprime in self._each_allowed_simplex(
                                degree - i, dimension, ntilde, n
                            ):
                                # print(["ntilde",ntilde,"nprime",nprime,"n",n])
                                mnom = _multinom(degree - i, nprime)
                                ret += Fraction(state[0][j]) * Fraction(mnom)
            if ret != 0:
                newladder.append([[ret], n, [result]])

# Examples of use
if __name__ == "__main__":

    def _mean(list):
        if len(list) <= 1:
            return 0
        xm = list[0]
        i = 1
        while i < len(list):
            c = list[i]
            i += 1
            cxm = c - xm
            xm += cxm * 1.0 / i
        return xm

    def linspace(a, b, size):
        if (a - b) % size == 0:
            # for robustness when all points are integers
            return [a + ((b - a) * x) // size for x in range(size + 1)]
        return [a + (b - a) * (x * 1.0 / size) for x in range(size + 1)]

    def showbuckets(ls, buckets):
        mx = max(0.00000001, max(buckets))
        if mx == 0:
            return
        labels = [
            (
                ("%0.3f %d" % (ls[i], buckets[i]))
                if int(buckets[i]) == buckets[i]
                else ("%0.3f %f" % (ls[i], buckets[i]))
            )
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

    def bucket(v, ls, buckets):
        for i in range(len(buckets) - 1):
            if v >= ls[i] and v < ls[i + 1]:
                buckets[i] += 1
                break
