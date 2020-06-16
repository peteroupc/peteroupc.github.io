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
    function.
      - psi - A continuous concave function that takes one number and
         outputs one number.
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
