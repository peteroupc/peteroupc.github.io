from sympy import *
import random

def roughmaxiopen(func, x):
    # Rough version of maxiopen that samples points
    # in the open interval (0, 1) to find an approximate
    # maximum.
    return Max(
        *[ceiling(func.subs(x, S(i) / 100) * 100000) / 100000 for i in range(1, 100)]
    )

def maxi(func, x):
    # Finds the maximum of a function whose domain is [0,1].
    # Unfortunately, SymPy's 'maximum' does not always work
    # and naïve replacements are usually not robust enough.
    # Others are encouraged to reimplement this method using
    # a more robust version that works for a large class of continuous
    # functions of practical importance (such as piecewise functions
    # with real analytic and/or algebraic pieces).
    # func=target function; x=variable used in 'func'
    return maximum(func, x, Interval(0, 1))

def maxiopen(func, x):
    # Finds the maximum of a function whose domain is (0,1).
    # Unfortunately, SymPy's 'maximum' does not always work
    # and naïve replacements are usually not robust enough.
    # Others are encouraged to reimplement this method using
    # a more robust version that works for a large class of continuous
    # functions of practical importance (such as piecewise functions
    # with real analytic and/or algebraic pieces).
    # func=target function; x=variable used in 'func'
    return maximum(func, x, Interval.open(0, 1))

def bernpoly(a, x):
    # Create a polynomial in Bernstein form using the given
    # array of coefficients and the symbol x.  The polynomial's
    # degree is the length of 'a' minus 1.
    pt = x
    n = len(a) - 1
    ret = S(0)
    v = [binomial(n, j) for j in range(n // 2 + 1)]
    for i in range(0, n + 1):
        oldret = ret
        bino = v[i] if i < len(v) else v[n - i]
        ret += a[i] * bino * pt**i * (1 - pt) ** (n - i)
    return ret

def kobevents(func, p, numpolys=12):
    # Generates 'func', a Bernoulli factory function,
    # as a convex combination of polynomials
    # in Bernstein form with 0/1 coefficients.  There
    # will be infinitely many of them in general, so this
    # method will generate only the first 'numpolys' of them
    # (so that an approximate version of the factory function
    # will be simulated if the polynomials are passed to
    # the 'kob' method).
    # Implements Keane and O'Brien, "A Bernoulli
    # Factory", ACM Transactions on Modeling
    # and Computer Simulation, Apr. 1994.
    # func=target function; p=variable used in 'func'
    # traces=number of polynomials of the function
    fevents = []  # Gets simulation data for the target function
    results = []
    currentDegree = 0
    accuracyWarning = False
    for j in range(1, numpolys):
        # Generate 'numpolys' many "traces" of the function
        # (should actually be infinitely many)
        ff = None
        while True:
            currentDegree += 1
            # Calculate Bernstein coefficients for a polynomial
            # representing the probability
            # that ((X1 + ... + currentDegree)/currentDegree) is in the set of p such
            # that f(p)>=1/2, where X1, ..., X_currentDegree are i.i.d. Bernoulli
            # random variables.
            coeffs = [
                1 if func.subs(p, S(i) / currentDegree) >= S.Half else 0
                for i in range(currentDegree + 1)
            ]
            print([j, currentDegree, sum(coeffs)])
            alreadyBelow = False
            alreadyAbove = False
            if sum(coeffs) == currentDegree + 1:
                # All coefficients are ones, so simply shift by 1/4
                ff = func - S(1) / 4
                alreadyBelow = True
            elif sum(coeffs) == 0:
                # All coefficients are zeros, so function is unchanged
                ff = func
                alreadyAbove = True
            else:
                ff = func - bernpoly(coeffs, p) / 4
            # break
            try:
                aob = alreadyBelow or maxiopen(ff, p) < S(3) / 4
            except:
                hi = roughmaxiopen(ff, p)
                print(["hi", hi.n()])
                if hi >= S(3) / 4:
                    aob = False
                else:
                    if not accuracyWarning:
                        accuracyWarning = True
                        print("Warning: May be inaccurate")
                    aob = True
            try:
                aob = aob and (alreadyAbove or (1 - maxiopen((1 - ff), p)) > S(0))
            except:
                lo = 1 - roughmaxiopen(1 - ff, p)
                print(["lo", lo.n()])
                if lo <= S(0):
                    aob = False
                else:
                    if not accuracyWarning:
                        accuracyWarning = True
                        print("Warning: May be inaccurate")
                    aob = True
            # if not aob:
            #   pprint(ff)
            #   print(ff)
            #   plot(ff,(p,0,1))
            #   return
            # Note that we ought to stop when 0 <= ff <= 3/4, and not
            # after a set number of iterations.
            if aob == True:
                break
        # Now, polynomial 'j' has a Bernstein degree of 'currentDegree', so
        # it has 'currentDegree' + 1 Bernstein coefficients.  It would be an interesting
        # research problem to determine, in advance, the appropriate value for
        # 'currentDegree' given 'j' and 'func', and this is expected to depend on the
        # smoothness of 'func'.
        # Now, build the Bernstein polynomial for 'j', where each Bernstein coefficient
        # is 1 if func(i/currentDegree)>=1/2, and 0 otherwise,
        # where i is in [0, currentDegree].
        coeffs = [
            1 if func.subs(p, S(i) / currentDegree) >= S.Half else 0
            for i in range(currentDegree + 1)
        ]
        fevents.append(coeffs)
        results.append([currentDegree, coeffs, func])
        func = ff * 4 / 3
    for a, b, _ in results:
        print([a, b])
    # plot(*[r[2] for r in results], (p, 0, 1))
    return fevents

def kob(fevents, p):
    # Simulates a convex combination of polynomials
    # returned by kobevents, which will generally be an
    # approximation of a Bernoulli factory function.
    # fevents is the data returned by kobevents
    geo = 0
    while random.random() > 1 / 4:
        geo += 1
    if geo >= len(fevents):
        # No polynomial available, so return 0.  This shouldn't happen
        # for an exact simulation.
        return 0
    s = sum(1 if random.random() < p else 0 for i in range(len(fevents[geo]) - 1))
    return fevents[geo][s]

p = symbols("p")  # Variable used in the example function
# Example function
ofunc = sin(2 * pi * p) / 4 + S.Half + S(1) / 100
ofunc = ofunc * p * 2
fevents = kobevents(ofunc, p)
# Simulate the target function
for pp in [0.1, 0.2, 0.3, 0.4, 0.5, 0.6]:
    print(ofunc.subs(p, pp).n())
    print(sum(kob(fevents, pp) for i in range(100000)) / 100000)

# Plot the sequence of polynomials that converge
# from below to the target function
fev = [ofunc]
fc = S(0)
for i in range(len(fevents)):
    fd = bernpoly(fevents[i], p) * (S(1) / 4) * (S(3) / 4) ** i
    fc += fd
    fev.append(fc)
plot(*fev, (p, 0, 1))
# plot(ofunc-fc,(p,0,1))
