import math
import random
from fractions import Fraction

class Bernoulli:
    """ This class contains methods that generate Bernoulli random numbers,
         (either 1 or heads with a given probability, or 0 or tails otherwise).
         This class also includes implementations of so-called "Bernoulli factories", algorithms
      that turn coins biased one way into coins biased another way.
      Written by Peter O.

      References:
      - Flajolet, P., Pelletier, M., Soria, M., "On Buffon machines and numbers",
      arXiv:0906.5560v2 [math.PR], 2010.
      - Huber, M., "Designing perfect simulation algorithms using local correctness",
      arXiv:1907.06748v1 [cs.DS], 2019.
      - Huber, M., "Optimal linear Bernoulli factories for small mean problems",
      arXiv:1507.00843v2 [math.PR], 2016.
      - Łatuszyński, K., Kosmidis, I.,  Papaspiliopoulos, O., Roberts, G.O., "Simulating
      events of unknown probabilities via reverse time martingales", 2011.
      - Goyal, V. and Sigman, K. 2012. On simulating a class of Bernstein
      polynomials. ACM Transactions on Modeling and Computer Simulation 22(2),
      Article 12 (March 2012), 5 pages.
      - Morina, G., Łatuszyński, K., et al., "From the Bernoulli Factory to a Dice
      Enterprise via Perfect Sampling of Markov Chains",
      arXiv:1912.09229v1 [math.PR], 2019.
      - Shaddin Dughmi, Jason D. Hartline, Robert Kleinberg, and Rad Niazadeh.
      2017. Bernoulli Factories and Black-Box Reductions in Mechanism Design.
      In _Proceedings of 49th Annual ACM SIGACT Symposium on the Theory
      of Computing_, Montreal, Canada, June 2017 (STOC’17).
      - Gonçalves, F. B., Łatuszyński, K. G., Roberts, G. O.(2017).  Exact Monte
      Carlo likelihood-based inference for jump-diffusion processes.
      - Vats, D., Gonçalves, F. B., Łatuszyński, K. G., Roberts, G. O. Efficient
      Bernoulli factory MCMC for intractable likelihoods, arXiv:2004.07471v1
      [stat.CO], 2020.
      - Mendo, Luis. "An asymptotically optimal Bernoulli factory for certain
      functions that can be expressed as power series." Stochastic Processes and their
      Applications 129, no. 11 (2019): 4366-4384.
      - Canonne, C., Kamath, G., Steinke, T., "The Discrete Gaussian
      for Differential Privacy", arXiv:2004.00010v2 [cs.DS], 2020.
      - Lee, A., Doucet, A. and Łatuszyński, K., 2014. Perfect simulation using
      atomic regeneration with application to Sequential Monte Carlo,
      arXiv:1407.5770v1  [stat.CO]
     """

    def __init__(self):
        """ Creates a new instance of the Bernoulli class."""
        self.r = random.Random()

    def _algorithm_a(self, f, m, c):
        # B(p) -> B(c*p*(1-(c*p)^(m-1))/(1-(c*p)^m)) (Huber 2016)
        s = 1
        cx = Fraction(1) / (Fraction(c) + 1)
        while s > 0 and s < m:
            # b = logistic(f, beta*c)
            b = -1
            while b < 0:  # Logistic algorithm found in Morina et al., not Huber
                if self.zero_or_one(cx.numerator, cx.denominator) == 1:
                    b = 0
                elif f() == 1:
                    b = 1
            s = s - b * 2 + 1
        return 1 if s == 0 else 0

    def _high_power_logistic(self, f, m, beta, c):
        # B(p) => B(beta*c*p*(1+(beta*c*p)+...+(beta*c*p)^m)) (Huber 2016)
        s = 1
        cx = Fraction(1) / (Fraction(beta * c) + 1)
        while s > 0 and s <= m:
            # b = logistic(f, beta*c)
            b = -1
            while b < 0:  # Logistic algorithm found in Morina et al., not Huber
                if self.zero_or_one(cx.numerator, cx.denominator) == 1:
                    b = 0
                elif f() == 1:
                    b = 1
            s = s + b * 2 - 1
        return 1 if s == m + 1 else 0

    def _henderson_glynn_double(self, f, n=100):
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

    def _nacu_peres_double(self, f, n=100):
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
        """ Returns 1 at probability px/py, 0 otherwise. """
        if py <= 0:
            raise ValueError
        if px == py:
            return 1
        z = px
        while True:
            z = z * 2
            if z >= py:
                if self.r.randint(0, 1) == 0:
                    return 1
                z = z - py
            elif z == 0 or self.r.randint(0, 1) == 0:
                return 0

    def geometric_bag(self, u):
        """ Bernoulli factory for a uniformly-distributed random number in (0, 1)
         (Flajolet et al. 2010).
         - u: List that holds the binary expansion, from left to right, of the uniformly-
           distributed random number.  Each element of the list is 0, 1, or None (meaning
           the digit is not yet known).  The list may be expanded as necessary to put
           a new digit in the appropriate place in the binary expansion.
     """
        r = 0
        while self.r.randint(0, 1) == 0:
            r += 1
        while len(u) <= r:
            u.append(None)
        if u[r] == None:
            u[r] = self.r.randint(0, 1)
        return u[r]

    def zero_or_one_log1p(self, x, y):
        """ Generates 1 with probability log(1+x/y); 0 otherwise.
         Reference: Flajolet et al. 2010. """
        bag = []
        while True:
            if self.zero_or_one(x, y) == 0 or self.geometric_bag(bag) == 0:
                return self.zero_or_one(x, y)
            if self.zero_or_one(x, y) == 0 or self.geometric_bag(bag) == 0:
                return 0

    def _uniform_less(self, bag, frac):
        """ Determines whether a uniformly-distributed random number
             (given as an incomplete binary expansion that is built up
              as necessary) is less than the given Fraction (in the interval [0, 1]). """
        if frac == 0:
            return 0
        if frac == 1:
            return 1
        frac = Fraction(frac)
        pt = Fraction(1, 2)
        i = 0
        while True:
            while len(bag) <= i:
                bag.append(self.r.randint(0, 1))
            if bag[i] == None:
                bag[i] = self.r.randint(0, 1)
            mybit = bag[i]
            bit = 1 if frac >= pt else 0
            if mybit == 0 and bit == 1:
                return 1
            if mybit == 1 and bit == 0:
                return 0
            if frac >= pt:
                frac -= pt
            pt /= 2
            i += 1
        return 0

    def _uniform_greater(self, bag, frac):
        """ Determines whether a uniformly-distributed random number
             (given as an incomplete binary expansion that is built up
              as necessary) is greater than the given Fraction (in the interval [0, 1]). """
        return self._uniform_less(bag, frac) ^ 1

    def bernoulli_x(self, f, x):
        """ Bernoulli factory with a given probability: B(p) => B(x) (Mendo 2019).
         Mendo calls Bernoulli factories "non-randomized" if their randomness
         is based entirely on the underlying coin.
     - f: Function that returns 1 if heads and 0 if tails.
     - x: Desired probability, in [0, 1].  """
        pw = Rational(x)
        if pw == 0:
            return 0
        if pw == 1:
            return 1
        pt = Rational(1, 2)
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
        """ Convenience method to generate a function that returns
         1 (heads) with the given probability c (which must be in (0, 1))
         and 0 (tails) otherwise. """
        c = Fraction(c)
        return lambda: self.zero_or_one(c.numerator, c.denominator)

    def complement(self, f):
        """ Complement (NOT): B(p) => B(1-p) (Flajolet et al. 2010)
     - f: Function that returns 1 if heads and 0 if tails.
     """
        return f() ^ 1

    def square(self, f1, f2):
        """ Square: B(p) => B(1-p). (Flajolet et al. 2010)
     - f1, f2: Functions that return 1 if heads and 0 if tails.
     """
        return 1 if f1() == 1 and f1() == 1 else 0

    def product(self, f1, f2):
        """ Product (conjunction; AND): B(p), B(q) => B(p*q)  (Flajolet et al. 2010)
     - f1, f2: Functions that return 1 if heads and 0 if tails.
     """
        return 1 if f1() == 1 and f2() == 1 else 0

    def disjunction(self, f1, f2):
        """ Disjunction (OR): B(p), B(q) => B(p+q-p*q) (Flajolet et al. 2010)
     - f1, f2: Functions that return 1 if heads and 0 if tails.
     """
        return 1 if f1() == 1 or f2() == 1 else 0

    def mean(self, f1, f2):
        """ Mean: B(p), B(q) => B((p+q)/2)  (Flajolet et al. 2010)
     - f1, f2: Functions that return 1 if heads and 0 if tails.
     """
        return f1() if self.r.randint(0, 1) == 0 else f2()

    def conditional(self, f1, f2, f3):
        """ Conditional: B(p), B(q), B(r) => B((1-r)*q+r*p)  (Flajolet et al. 2010)
     - f1, f2, f3: Functions that return 1 if heads and 0 if tails.
     """
        return f1() if f3() == 1 else f2()

    def evenparity(self, f):
        """ Even parity: B(p) => B(1/(1+p)) (Flajolet et al. 2010)
     - f: Function that returns 1 if heads and 0 if tails.
     Note that this function is slow as the probability of heads approaches 1.
     """
        while True:
            if f() == 0:
                return 1
            if f() == 0:
                return 0

    def logistic(self, f, cx, cy=1):
        """ Logistic Bernoulli factory: B(p) -> B(cx*p/(cy+cx*p)) or
         B(p) -> B((cx/cy)*p/(1+(cx/cy)*p)) (Morina et al. 2019)
     - f: Function that returns 1 if heads and 0 if tails.
     - cx, cy: numerator and denominator of c; the probability of heads (p) is multiplied
       by c. c must be in (0, 1).
     """
        cc = Fraction(1) / (Fraction(cx, cy) + 1)
        while True:
            if self.zero_or_one(cc.numerator, cc.denominator) == 1:
                return 0
            elif f() == 1:
                return 1

    def _multilogistic(fa, ca):
        # Huber 2016, replaces logistic(f, c) in linear Bernoulli factory to make a multivariate
        # Bernoulli factory of the form B(p1), ..., B(pn) -> B(c1*p1 + ... + cn*pn).
        # For this method:
        # B(p1), ..., B(pn) -> B(r/(1+r)), where r = c1*p1 + ... + cn*pn
        x = 0
        a = -math.log(self.r.random())
        t = [0 for i in range(fa.length)]
        for i in range(len(fa)):
            t[i] = -math.log(self.r.random()) / ca[i].to_f
            while x == 0 and t[i] < a:
                if fa[i].call() == 1:
                    return 1
                t[i] -= math.log(self.r.random()) / ca[i].to_f
        return 0

    def eps_div(self, f, eps):
        """ Bernoulli factory as follows: B(p) -> B(eps/p) (Lee et al. 2014).
       - f: Function that returns 1 if heads and 0 if tails.
       - eps: Fraction in (0, 1), must be chosen so that eps < p, where p is
         the probability of heads. """
        if eps == 0:
            return 0
        if eps < 0:
            raise ValueError
        eps = Fraction(eps)
        ceps = Fraction(1) / (1 - Fraction(eps))
        finv = lambda: (f() ^ 1)
        while True:
            if self.zero_or_one(eps.numerator, eps.denominator) == 1:
                return 1
            # Sample B((p-eps)/(1-eps)) or B(1-(1-p)/(1-eps))
            b = self.linear(finv, ceps, eps) ^ 1
            if b == 1:
                return 0

    def zero_or_one_exp_minus(self, x, y):
        """ Generates 1 with probability exp(-x/y); 0 otherwise.
               Reference: Canonne et al. 2020. """
        if y <= 0 or x < 0:
            raise ValueError
        if x > y:
            xf = int(x / y)  # Get integer part
            x = x % y  # Reduce to fraction
            if x > 0 and self.zero_or_one_exp_minus(x, y) == 0:
                return 0
            for i in range(1, xf + 1):
                if self.zero_or_one_exp_minus(1, 1) == 0:
                    return 0
            return 1
        r = 1
        oy = y
        while True:
            if self.zero_or_one(x, y) == 0:
                return r
            if r == 1:
                r = 0
            else:
                r = 1
            y = y + oy

    def probgenfunc(self, f, rng):
        """ Probability generating function Bernoulli factory: B(p) => B(E[p^x]), where x is rng()
         (Dughmi et al. 2017). E[p^x] is the expected value of p^x and is also known
         as the probability generating function.
        - f: Function that returns 1 if heads and 0 if tails.
        - rng: Function that returns a non-negative integer at random.
          Example (Dughmi et al. 2017): if 'rng' is Poisson(lamda) we have
          an "exponentiation" Bernoulli factory as follows:
          B(p) => B(exp(p*lamda-lamda))
     """
        n = rng()
        for i in range(n):
            if f() == 0:
                return 0
        return 1

    def powerseries(self, f):
        """ Power series Bernoulli factory: B(p) => B(1 - c(0)*(1-p) + c(1)*(1-p)^2 +
          c(2)*(1-p)^3 + ...), where c(i) = `c[i]/sum(c)`) (Mendo 2019).
        - f: Function that returns 1 if heads and 0 if tails.
        - c: List of coefficients in the power series, all of which must be
          non-negative integers."""
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
        """ Power Bernoulli factory: B(p) => B(p^(ax/ay)). (case of (0, 1) provided by
         Mendo 2019).
        - f: Function that returns 1 if heads and 0 if tails.
        - ax, ay: numerator and denominator of the desired power to raise the probability
         of heads to. This power must be 0 or greater. """
        a = Fraction(ax, ay)
        ax = a.numerator
        ay = a.denominator
        if a < 0:
            raise ValueError
        if a == 0:
            return 1
        if ax == ay:
            return f()
        if ax > ay:
            # (px/py)^(ax/ay) -> (px/py)^int(ax/ay) * (px/py)^frac(ax/ay)
            xf = int(ax / ay)  # Get integer part
            nx = ax % ay  # Reduce to fraction
            if nx > 0 and self.power(f, nx, ay) == 0:
                return 0
            for i in range(n):
                if f() == 0:
                    return 0
            return 1
        # Following is algorithm from Mendo 2019
        i = 1
        while True:
            if f() == 1:
                return 1
            if ax == ay or self.zero_or_one(ax, ay * i):
                return 0
            i = i + 1

    def _zero_or_one_power_frac(self, px, py, nx, ny):
        # Generates a random number, namely 1 with
        # probability (px/py)^(ax/ay) (where ax/ay is in (0, 1)),
        # and 1 otherwise.  Returns 1 if ax/ay is 0.  Reference: Mendo 2019.
        i = 1
        while True:
            x = self.zero_or_one(px, py)
            if x == 1:
                return 1
            if ax == ay or self.zero_or_one(ax, ay * i):
                return 0
            i = i + 1

    def zero_or_one_power_ratio(self, px, py, nx, ny):
        """ Generates 1 with probability (px/py)^(nx/ny) (where nx/ny can be positive, negative, or zero); 0 otherwise. """
        if py <= 0 or px < 0:
            raise ValueError
        n = Fraction(nx, ny)
        p = Fraction(px, py)
        nx = n.numerator
        ny = n.denominator
        px = p.numerator
        py = p.denominator
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
            if nx > 0 and self._zero_or_one_power_frac(nx, ny) == 0:
                return 0
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
                if self.zero_or_one(px, py) == 0:
                    return 0
            return 1
        return self._zero_or_one_power_frac(nx, ny)

    def zero_or_one_power(self, px, py, n):
        """ Generates 1 with probability (px/py)^n (where n can be positive, negative, or zero); 0 otherwise. """
        return self.zero_or_one_power_ratio(px, py, n, 1)

    def twocoin(self, f1, f2, c1=1, c2=1, beta=1):
        """ Two-coin Bernoulli factory: B(p), B(q) => B(c1*p*beta / (c1*p+c2*q))
         (Gonçalves et al. 2017, Vats et al. 2020; in Vats et al.,
          C1,p1 corresponds to cy and C2,p2 corresponds to cx).
         Logistic Bernoulli factory is a special case with q=1, c2=1, beta=1.
     - f1, f2: Functions that return 1 if heads and 0 if tails.
     - c1, c2: Factors to multiply the probabilities of heads for f1 and f2, respectively.
     - beta: Early rejection parameter ("portkey" two-coin factory).
       Returns 0 immediately with probability 1 - beta.
        """
        cx = Fraction(c1) / (Fraction(c1) + Fraction(c2))
        if beta != 1:
            beta = Fraction(beta)
            if self.zero_or_one(beta.numerator, beta.denominator) == 0:
                return 0
        while True:
            if self.zero_or_one(cx.numerator, cx.denominator) == 1:
                if f1() == 1:
                    return 1
            else:
                if f2() == 1:
                    return 0

    def _multicoin(self, coins):
        # Morina et al. 2019; see also Dughmi et al. 2017
        while True:
            # Choose a random coin
            c = self.r.randint(0, len(coins) - 1)
            # Return it if it flips heads
            if coins[c]() == 1:
                return c

    def add(self, f1, f2, eps=Fraction(5, 100)):
        """ Addition Bernoulli factory: B(p), B(q) => B(p+q) (Dughmi et al. 2017)
     - f1, f2: Functions that return 1 if heads and 0 if tails.
     - eps: A Fraction in (0, 1). eps must be chosen so that p+q <= 1 - eps,
       where p and q are the probability of heads for f1 and f2, respectively.
     """
        fv = lambda: self.mean(f1, f2)
        return self.linear(fv, 2, 1)

    def linear(self, f, cx, cy=1, eps=Fraction(5, 100)):
        """ Linear Bernoulli factory: B(p) => B((cx/cy)*p) (Huber 2016).
     - f: Function that returns 1 if heads and 0 if tails.
     - cx, cy: numerator and denominator of c; the probability of heads (p) is multiplied
       by c. c must be 0 or greater. If c > 1, c must be chosen so that c*p <= 1 - eps.
     - eps: A Fraction in (0, 1). If c > 1, eps must be chosen so that c*p <= 1 - eps.
       This method is more accurate, but slower, when eps is close to 1.
     """
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
        m = (Fraction(45, 10) / eps) + 1
        # Ceiling operation
        m += Fraction(m.denominator - m.numerator % m.denominator, m.denominator)
        beta = 1 + Fraction(1) / (m - 1)
        if self._algorithm_a(f, m, c) == 0:
            return 0
        if self.zero_or_one(beta.denominator, beta.numerator) == 1:
            return 1  # Bern(1/beta)
        # Algorithm B (B(p) -> B((m-1)*(beta*c*p)^(m-1)/(1+(beta*c*p)+...+(beta*c*p)^(m-2)))
        while True:
            bc = beta * c
            if self.linear(f, bc.numerator, bc.denominator, 1 - beta * (1 - eps)) == 0:
                return 0
            if self._high_power_logistic(f, m - 2, beta, c) == 1:
                return 1
            m -= 1

    def bernstein(self, f, alpha):
        """ Bernstein polynomial Bernoulli factory: B(p) => B(Bernstein(alpha))
               (Goyal and Sigman 2012).
          - f: Function that returns 1 if heads and 0 if tails.
          - alpha: List of Bernstein coefficients for the Bernstein polynomial.
             For this to work, each coefficient must be in [0, 1]. """
        for a in alpha:
            if a < 0 or a > 1:
                raise ValueError
        j = sum([f() for i in range(n)])
        return 1 if self._uniform_less([], alpha[j]) else 0

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
            if self._uniform_less(bag, l):
                return 1
            if self._uniform_greater(bag, u):
                return 0
            n += 1
            fac *= n

    def linear_power(self, f, cx, cy=1, i=1, eps=Fraction(5, 100)):
        """ Linear-and-power Bernoulli factory: B(p) => B((p*cx/cy)^i) (Huber 2019).
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
            return self.linear_power(fv, 1, 1, i, eps)
        thresh = Fraction(355, 100)
        while True:
            if i == 0:
                return 1
            while i > thresh / eps:
                halfeps = eps / 2
                beta = (1 - halfeps) / (1 - eps)
                if self.zero_or_one_power(beta.denominator, beta.numerator, i) == 0:
                    return 0
                c *= beta
                eps = halfeps
            i = i + 1 - self.logistic(f, c, 1) * 2

    def linear_lowprob(self, f, cx, cy=1, m=Fraction(249, 500)):
        """ Linear Bernoulli factory which is faster if the probability of heads is known
         to be less than half: B(p) => B((cx/cy)*p) (Huber 2016).
     - f: Function that returns 1 if heads and 0 if tails.
     - cx, cy: numerator and denominator of c; the probability of heads (p) is multiplied
       by c. c must be 0 or greater. If c > 1, c must be chosen so that c*p <= m < 1/2.
     - m: A Fraction in (0, 1/2). If c > 1, m must be chosen so that c*p <= m < 1/2.
     """
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
        if m == None:
            m = Fraction(249, 500)
        m = Fraction(m)
        if m >= Fraction(1, 2):
            raise ValueError
        beta = Fraction(1) / (1 - 2 * m)
        bc = beta * c
        lb = self.logistic(f, bc.numerator, bc.denominator)
        if lb == 0:
            return 0
        if self.zero_or_one(beta.denominator, beta.numerator) == 1:
            return 1  # Bern(1/beta)
        c = beta * c / (beta - 1)
        return self.linear(f, c)

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

    b = Bernoulli()
    c = [b.exp_minus(b.coin(0.2)) for i in range(10000)]
    print([_mean(c), math.exp(-0.2)])
    c = [b.exp_minus(b.coin(0.4)) for i in range(10000)]
    print([_mean(c), math.exp(-0.4)])
    c = [b.exp_minus(b.coin(0.6)) for i in range(10000)]
    print([_mean(c), math.exp(-0.6)])
    c = [b._uniform_less([], math.exp(-0.4)) for i in range(10000)]
    print([_mean(c), math.exp(-0.4)])
    c = [b._uniform_greater([], math.exp(-0.4)) for i in range(10000)]
    print([_mean(c), 1 - math.exp(-0.4)])
    exit()
    c = [b.zero_or_one(20, 100) for i in range(10000)]
    print([_mean(c), 0.2])
    c = [b.zero_or_one(20, 100) for i in range(10000)]
    print([_mean(c), 0.2])
    c = [b.linear_lowprob(b.coin(0.2), 2, 1, 0.41) for i in range(1000)]
    print([_mean(c), 0.4])
    c = [b.linear(b.coin(0.2), 2, 1, 0.89) for i in range(1000)]
    print([_mean(c), 0.4])
    c = [b.linear_power(b.coin(0.2), 2, 1, 1, 0.59) for i in range(1000)]
    print([_mean(c), 0.4])
    c = [b.linear_power(b.coin(0.2), 1, 2, 2, 0.1) for i in range(1000)]
    print([_mean(c), (0.2 * 0.5) ** 2])
    c = [b.linear_power(b.coin(0.2), 2, 1, 3, 0.59) for i in range(1000)]
    print([_mean(c), 0.064])
