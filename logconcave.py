#
#  Written by Peter O. Any copyright to this file is released to the Public Domain.
#  In case this is not possible, this file is also licensed under Creative Commons Zero
#  (https://creativecommons.org/publicdomain/zero/1.0/).
#

import math
import random

class LogConcaveSampler:
    """
    Generates a random number that follows a distribution
    whose probability density function (PDF) is log-concave.  Specifically
    the PDF is proportional to exp(psi), where psi is a continuous concave
    function. (A log-concave PDF necessarily has a single mode, or peak,
    and its range is bounded from above by a finite value.  See Devroye, 1986,
    "Non-Uniform Random Variate Generation".)
      - psi - A function that takes one number and
         outputs one number.  For this sampler to work, psi must be a
         continuous concave function (informally, a function is concave
         if the area "above" the function's graph is concave).
      - dpsi - Derivative of psi.  Optional; if not given, this derivative will be
         numerically approximated from psi, assuming that 0 is the
         distribution's mode (peak location) and psi(0) = 0 (and thus
         exp(psi(0)) = 1).
      - s, t - Each must be greater than 0 and chosen such that
         psi(-s) == psi(t) > 0. Optional; if not given, these two parameters
         will be chosen through numerical root finding, with the assumptions
         given earlier.

     Example:

     The normal distribution's PDF is a log-concave PDF proportional to
     exp(psi), where psi is:

     >>> psi = lambda x:  -(x * x) / (2 * sigma * sigma)

     The PDF's mode is 0 (its peak is located at 0), and psi(0) = 0 (and thus
     exp(psi(0)) = 1), so no shifting or scaling of exp(psi) is necessary.
     Thus, because the mode of the normal distribution
     is the mean (mu), the following example
     generates a normally-distributed number with mean of mu and
     standard deviation of sigma:

     >>> sampler = LogConcaveSampler(psi)
     >>> print([x+mu for x in sampler.sample(10)])

     Reference:
     Devroye, Luc, “Random variate generation for the generalized inverse
     Gaussian distribution”, Statistics and Computing 24 (2014): 239-246.
    """

    def _derivpsi(self, psi, x):
        eps = 1e-6
        return (psi(x + eps) - psi(x - eps)) / (2 * eps)

    def __init__(self, psi, dpsi=None, s=None, t=None):
        self.psi = psi
        rho = 0.3
        if s == None:
            k = -1
            while True:
                s = k
                for i in range(10):
                    psis = psi(-s)
                    dpsis = dpsi(-s) if dpsi != None else self._derivpsi(psi, -s)
                    if dpsis==0: break
                    s += (psis + rho) / dpsis
                if s > 0:
                    break
                k += 1
        if t == None:
            k = -1
            while True:
                t = k
                for i in range(10):
                    psis = psi(t)
                    dpsis = dpsi(t) if dpsi != None else self._derivpsi(psi, t)
                    if dpsis==0: break
                    t -= (psis + rho) / dpsis
                if t > 0:
                    break
                k += 1
        if s <= 0:
            raise ValueError("invalid s value")
        if t <= 0:
            raise ValueError("invalid t value")
        eta = -psi(t)
        self.zeta = -dpsi(t) if dpsi != None else -self._derivpsi(psi, t)
        theta = -psi(-s)
        self.xi = dpsi(-s) if dpsi != None else self._derivpsi(psi, -s)
        self.p = 1.0 / self.xi
        self.r = 1.0 / self.zeta
        self.t = t
        self.s = s
        self.tp = t - self.r * eta
        self.sp = s - self.p * theta
        self.q = self.sp + self.tp
        self.tze = self.zeta * self.t - eta
        self.sxt = self.xi * self.s - theta
        self.pqr = self.p + self.q + self.r
        self.qr = self.q + self.r

    def sample(self, n):
        return [self.sampleOne() for i in range(n)]

    def sampleOne(self):
        while True:
            u = random.random() * self.pqr
            v = random.random()
            ret = 0
            if u < self.q:
                ret = -self.sp + self.q * v
            elif u < self.qr:
                ret = self.tp + self.r * math.log(1 / v)
            else:
                ret = -self.sp - self.p * math.log(1 / v)
            chi = random.random()
            logchi = math.log(chi)
            pr = self.psi(ret)
            if ret > self.tp:
                if logchi + self.tze - self.zeta * ret <= pr:
                    # if chi * math.exp(self.tze - self.zeta * ret) <= math.exp(pr):
                    return ret
            elif ret < -self.sp:
                if logchi + self.sxt + self.xi * ret <= pr:
                    # if chi * math.exp(self.sxt + self.xi * ret) <= math.exp(pr):
                    return ret
            elif logchi <= pr:
                return ret

class LogConcaveSampler2:
    """
    Generates a random number that follows a distribution
    whose probability density function (PDF) is log-concave.  Specifically
    the PDF is proportional to exp(psi), where psi is a continuous concave
    function. (A log-concave PDF necessarily has a single mode, or peak,
    and its range is bounded from above by a finite value.
    See Devroye, 1986, "Non-Uniform Random Variate Generation".)
      - psi - A function that takes one number and
         outputs one number.  For this sampler to work, psi must be a
         continuous concave function (informally, a function is concave
         if the area "above" the function's graph is concave),
         and 0 must be the distribution's mode (peak location) and thus
         the peak of psi must be at 0.

     Example:

     The normal distribution's PDF is a log-concave PDF proportional to
     exp(psi), where psi is:

     >>> psi = lambda x:  -(x * x) / (2 * sigma * sigma)

     The PDF's mode is 0 (its peak is located at 0), and psi(0) = 0 (and thus
     exp(psi(0)) = 1). Thus, because the mode of the normal distribution
     is the mean (mu), the following example
     generates a number that follows the
     normal distribution with mean of mu and
     standard deviation of sigma:

     >>> sampler = LogConcaveSampler2(psi)
     >>> print([x+mu for x in sampler.sample(10)])

     Reference:
     Devroye, L., 2012. A note on generating random variables with
     log-concave densities. Statistics & Probability Letters, 82(5),
     pp.1035-1039.
    """

    def __init__(self, psi):
        self.left = LogConcaveSamplerMonotonePositive(lambda x: psi(-x))
        self.right = LogConcaveSamplerMonotonePositive(psi)

    def sample(self, n):
        return [self.sampleOne() for i in range(n)]

    def sampleOne(self):
        while True:
            if random.randint(0, 1) == 0:
                ret = self.left.sampleIteration()
                if ret != None:
                    return -ret
            else:
                ret = self.right.sampleIteration()
                if ret != None:
                    return ret

class LogConcaveSamplerMonotone:
    """
    Generates a random number that follows a distribution
    whose probability density function (PDF) is log-concave, monotonically
    nonincreasing, and has a positive domain.  Specifically
    the PDF is proportional to exp(psi), where psi is a continuous concave
    function. (A log-concave PDF necessarily has a single mode, or peak,
    and its range is bounded from above by a finite value.
    See Devroye, 1986, "Non-Uniform Random Variate Generation".)
      - psi - A function that takes one number and
         outputs one number.  For this sampler to work, psi must be a
         continuous concave function, monotonically
         nonincreasing, and have a positive domain (informally, a
         function is concave if the area "above" the function's graph is concave),
         and 0 must be the distribution's mode (peak location) and thus
         the peak of psi must be at 0.
      - symmetric - If true, the PDF is symmetric on both sides of the origin.
         This is done by mirroring the right half on the left half, but doesn't change
         the requirement that psi must have a positive domain only.

     Example:

     The normal distribution's PDF is a log-concave PDF proportional to
     exp(psi), where psi is:

     >>> psi = lambda x:  -(x * x) / (2 * sigma * sigma)

     The PDF's mode is 0 (its peak is located at 0), and psi(0) = 0 (and thus
     exp(psi(0)) = 1). Thus, because the mode of the normal distribution
     is the mean (mu), the following example
     generates a number that follows the right-hand half of a
     normal distribution with mean of mu and
     standard deviation of sigma:

     >>> sampler = LogConcaveSamplerMonotonePositive(psi)
     >>> print([x+mu for x in sampler.sample(10)])

     Reference:
     Devroye, L., 2012. A note on generating random variables with
     log-concave densities. Statistics & Probability Letters, 82(5),
     pp.1035-1039.
    """

    def _fx(self, psi):
        f0 = math.exp(psi(0))
        i = 0
        while True:
            a = 2.0 ** i
            fa = math.exp(psi(a))
            f2a = math.exp(psi(2 * a))
            # print([i, fa, 0.25, f2a])
            if fa / f0 >= 0.25 and 0.25 >= f2a / f0:
                return a
            if fa / f0 < 0.25:
                break
            i += 1
        i = -1
        while True:
            a = 2.0 ** i
            fa = math.exp(psi(a))
            f2a = math.exp(psi(2 * a))
            if fa / f0 >= 0.25 and 0.25 >= f2a / f0:
                return a
            i -= 1

    def __init__(self, psi, symmetric=False):
        self.psi = psi
        self.symmetric=symmetric
        self.a = self._fx(psi)
        self.logfa = psi(self.a)
        self.logf2a = psi(2 * self.a)
        self.fa = math.exp(self.logfa)
        self.logf0 = psi(0)
        self.f0 = math.exp(self.logf0)
        f2a = math.exp(self.logf2a)
        self.r = self.a * self.fa
        self.q = self.a * self.f0
        self.qr = self.q + self.r
        self.sp = self.a / math.log(self.fa / f2a)
        self.s = self.qr + f2a * self.sp

    def sample(self, n):
        return [self.sampleOne() for i in range(n)]

    def codegen(self, name, pdfcall=None):
        """ Generates Python code that samples
                (approximately) from the distribution estimated
                in this class.  Idea from Leydold, et al.,
                "An Automatic Code Generator for
                Nonuniform Random Variate Generation", 2001.
        - name: Distribution name.  Generates a Python method called
           sample_X where X is the name given here (samples one
           random number).
        - pdfcall: Name of the method representing psi (for more information,
           see the __init__ method of this class).  Optional. """
       if pdfcall==None: pdfcall="psi_"+name
       retv="ret*(random.randint(0,1)*2-1)" if self.symmetric else "ret"
       ret="def sample_"+name+"():\n"
       ret+="     while True:\n"
       ret+="        u = random.random()\n"
       ret+="        v = random.random() * %.15g\n" % (self.s)
       ret+="        chi = math.log(random.random())\n"
       ret+="        ret = 0\n"
       ret+="        if v <= %.15g:\n" % (self.q)
       if self.a==1:
           ret+="            ret = u\n"
       else:
           ret+="            ret = %.15g * u\n" % (self.a)
       if self.logf0 == 0:
           ret+="            if chi <= %s(ret):\n" % (pdfcall)
       else:
           ret+="            if chi + %.15g <= %s(ret):\n" % (self.logf0, pdfcall)
       ret+="                return "+retv+"\n"
       ret+="        elif v < %.15g:\n" % (self.qr)
       if self.a==1:
           ret+="            ret = 1 + u\n"
       else:
           ret+="            ret = %.15g + %.15g * u\n" % (self.a, self.a)
       ret+="            if chi + %.15g <= %s(ret):\n" % (self.logfa, pdfcall)
       ret+="                return "+retv+"\n"
       ret+="        else:\n"
       ret+="            ret = %.15g + math.log(1.0 / u) * %.15g\n" % (2 * self.a, self.sp)
       if self.logf2a!=0:
         ret+="            h = (%.15g - ret) * %.15g\n" % (2 * self.a, self.logfa / self.a)
         ret+="                    + (ret - %.15g) * %.15g\n" % (self.a, self.logf2a / self.a)
         ret+="            if chi + h <= "+pdfcall+"(ret):\n"
         ret+="                return "+retv+"\n\n"
       else:
         ret+="            return "+retv+"\n\n"
       return ret

    def sampleIteration(self):
        u = random.random()
        v = random.random() * self.s
        chi = math.log(random.random())
        ret = 0
        if v <= self.q:
            ret = self.a * u
            if chi + self.logf0 <= self.psi(ret):
                return ret*((random.randint(0,1)*2-1) if self.symmetric else 1)
        elif v < self.qr:
            ret = self.a + self.a * u
            if chi + self.logfa <= self.psi(ret):
                return ret*((random.randint(0,1)*2-1) if self.symmetric else 1)
        else:
            ret = 2 * self.a + math.log(1.0 / u) * self.sp
            h = 0
            if self.logf2a != 0:
                h = (2 * self.a - ret) * self.logfa / self.a + (ret - self.a) * self.logf2a / self.a
                if chi + h <= self.psi(ret):
                    return ret*((random.randint(0,1)*2-1) if self.symmetric else 1)
            else:
                return ret
        return None

    def sampleOne(self):
        while True:
            ret = self.sampleIteration()
            if ret != None:
                return ret

class NormalDist:
    def __init__(self, mu=0, sigma=1):
        psi = lambda x: -(x * x) / (2 * sigma * sigma)
        self.mu = mu
        self.sampler = LogConcaveSampler(psi)

    def sample(self, n):
        return [x + self.mu for x in self.sampler.sample(n)]

class GenInvGaussianAlphaBeta:
    def __init__(self, lamda, alpha, beta):
        # Three-parameter version (Hörmann, W., Leydold, J.,
        # "Generating Generalized Inverse Gaussian
        # Random Variates", 2013).
        self.sampler = GenInvGaussian(lamda, beta)
        self.alpha = alpha

    def sample(self, n):
        return [x * self.alpha for x in self.sampler.sample(n)]

    def fromLambdaPsiChi(lamda, psi, chi):
        # Called lambda, psi, chi in Hörmann and Leydold 2013
        # Called p, a, b in Devroye 2014
        return GenInvGaussianAlphaBeta(
            lamda, math.sqrt(psi / chi), math.sqrt(psi * chi)
        )

class GammaDist:
    # Devroye 2014
    def __init__(self, a):
        if a <= 0:
            raise ValueError
        self.apow = 0
        self.lessThanOne = a < 1
        if self.lessThanOne:
            self.apow = 1.0 / a
            self.a = a + 1
        else:
            self.a = a
        psi = lambda x: self.a * (1 - math.exp(x) + x)
        dpsi = lambda x: self.a * (1 - math.exp(x))
        self.sampler = LogConcaveSampler(psi, dpsi)

    def sample(self, n):
        return [
            (random.random() ** self.apow if self.lessThanOne else 1)
            * self.a
            * math.exp(x)
            for x in self.sampler.sample(n)
        ]

class GenInvGaussian:
    def __init__(self, lamda, omega):
        # omega>0, lamda>=0. Two-parameter version described in Devroye 2014
        self.invert = lamda < 0
        lamda = abs(lamda)
        alpha = math.hypot(lamda, omega) - lamda
        psi = lambda x: -alpha * (math.cosh(x) - 1) - lamda * (math.exp(x) - x - 1)
        dpsi = lambda x: -alpha * (math.sinh(x)) - lamda * (math.exp(x) - 1)
        self.sampler = LogConcaveSampler(psi, dpsi)
        self.mult = lamda / omega + math.sqrt(1 + lamda * lamda / (omega * omega))

    def _trans(self, v):
        v = self.mult * math.exp(v)
        return 1 / v if self.invert else v

    def sample(self, n):
        return [self._trans(x) for x in self.sampler.sample(n)]

if __name__ == "__main__":

    def bucket(v, ls, buckets):
        for i in range(len(buckets) - 1):
            if v >= ls[i] and v < ls[i + 1]:
                buckets[i] += 1
                break

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
            ("%0.3f %d [%.15g]" % (ls[i], buckets[i], buckets[i] * 1.0 / mx))
            if int(buckets[i]) == buckets[i]
            else ("%0.3f %.15g [%.15g]" % (ls[i], buckets[i], buckets[i] * 1.0 / mx))
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

    import time

    psi = lambda x: -(x * x) / (2 * 1 * 1)
    mrs = LogConcaveSamplerMonotone(psi)
    print(mrs.codegen("halfnormal"))
    ls = linspace(-4, 4, 30)
    buckets = [0 for x in ls]
    t = time.time()
    ksample = mrs.sample(5000)
    print("Took %.15g seconds" % (time.time() - t))
    for ks in ksample:
        bucket(ks, ls, buckets)
    showbuckets(ls, buckets)
