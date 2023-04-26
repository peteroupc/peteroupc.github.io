from sympy import *
import math
import sys

def upperbound(x, boundmult=1000000000000000):
    # Calculates a limited-precision upper bound of x.
    try:
        boundmult = S(boundmult)
        return S(int(ceiling(x * boundmult).n())) / boundmult
    except TypeError:
        return x

def lowerbound(x, boundmult=1000000000000000):
    # Calculates a limited-precision lower bound of x.
    try:
        boundmult = S(boundmult)
        return S(int(floor(x * boundmult).n())) / boundmult
    except TypeError:
        return x

def funclimit(func, x, v, dir="+"):
    # Work around SymPy bugs involving limits of piecewise functions
    try:
        return limit(func, x, v, dir=dir)
    except:
        pw = piecewise_fold(func)
        if isinstance(pw, Piecewise):
            pieces = [(limit(arg[0], x, v, dir=dir), arg[1]) for arg in pw.args]
            return Piecewise(*pieces).subs(x, v)
        else:
            return limit(func, x, v, dir=dir)

def degelev(poly, degs):
    # Degree elevation of Bernstein-form polynomials.
    # See also Tsai and Farouki 2001.
    n = len(poly) - 1
    ret = []
    nchoose = [math.comb(n, j) for j in range(n // 2 + 1)]
    degschoose = (
        nchoose if degs == n else [math.comb(degs, j) for j in range(degs // 2 + 1)]
    )
    for k in range(0, n + degs + 1):
        ndk = math.comb(n + degs, k)
        c = 0
        for j in range(max(0, k - degs), min(n, k) + 1):
            degs_choose_kj = (
                degschoose[k - j]
                if k - j < len(degschoose)
                else degschoose[degs - (k - j)]
            )
            n_choose_j = nchoose[j] if j < len(nchoose) else nchoose[n - j]
            c += poly[j] * degs_choose_kj * n_choose_j / ndk
        ret.append(c)
    return ret

def estimatehoelder(func, x, alpha=S(1), discontpoints=None):
    # Estimate the alpha-Hölder constant for the given
    # function in the interval [0, 1], assuming it's continuous.
    npoints = 60
    points = []
    hh = {}
    for i in range(npoints + 1):
        pt = i / npoints
        if pt in hh:
            continue
        hh[pt] = True
        points.append((pt, func.subs(x, pt)))
    dp = [0, 1] if discontpoints == None else discontpoints
    # Sample around the discontinuous points
    for discont in dp:
        if not (discont in hh):
            hh[discont] = True
            points.append((discont, func.subs(x, discont)))
        for i in range(6):
            pt = discont + Rational(1, 10 ** (i + 8))
            if (not (pt in hh)) and pt >= 0 and pt <= 1:
                hh[pt] = True
                points.append((pt, func.subs(x, pt)))
            pt = discont - Rational(1, 10 ** (i + 8))
            if (not (pt in hh)) and pt >= 0 and pt <= 1:
                hh[pt] = True
                points.append((pt, func.subs(x, pt)))
    points.sort()  # Sort by position in func
    res = []
    for i in range(len(points)):
        for j in range(i + 1, len(points)):
            rn = (
                Abs(points[i][1] - points[j][1])
                / Abs(points[i][0] - points[j][0]) ** alpha
            ).n()
            if rn != nan:
                res.append(rn)
    return Max(*res)

def hoelderconst(func, x, alpha):
    # Find the Hölder constant of a continuous function in the interval
    # [0, 1] for a given Hölder exponent, alpha.
    # NOTE: Ensure func is real valued, since otherwise
    # it may enter complex-number territory, which is undesirable
    if alpha > 1 or alpha <= 0:
        # Allow only exponents in (0, 1]
        raise ValueError
    xz = symbols("xz", real=True)
    func = func.subs(x, xz)
    # Get the points where poles in the derivative could be.
    # NOTE: Getting the discontinuous points is a bit of a hack;
    # a better choice would be continuous_domain ... if it worked.
    pw = piecewise_fold(Abs(diff(func)).rewrite(Piecewise))
    points = []
    points.append(0)
    points.append(1)
    if isinstance(pw, Piecewise):
        try:
            for v in pw.as_expr_set_pairs(Interval(0, 1)):
                if isinstance(v[1], FiniteSet):
                    for item in v[1].args:
                        points.append(item)
                else:
                    points.append(v[1].start)
                    points.append(v[1].end)
        except:
            # Failed somehow
            points.append(0)
            points.append(1)
    else:
        points.append(0)
        points.append(1)
    # Estimate the constant given the discontinuous points.
    # Use an upper bound on the numerical estimate, since for
    # our purposes, we can do with an
    # upper bound on the Hölder constant, and also to reduce
    # the chance of underestimating that constant.
    print(
        "WARNING: Resorting to numerical computation",
        file=sys.stderr,
    )
    return upperbound(estimatehoelder(func, xz, alpha, points), 10000)

def c2params(func, x, n):
    """
      This method returns symbolic expressions for parameters needed to apply my approximation scheme for twice differentiable functions (namely: fbelow(n, k) = f(k/n) - m/(7 * n); fabove(n, k) = f(k/n) + m / (7 * n)).  It takes these parameters:

    - `func`: SymPy expression of the desired function.
    - `x`: Variable used by `func`.
    - `n`: A Sympy variable used in the symbolic expressions for the two bounds.  It indicates the degree of the polynomial for which the method should find upper and lower bounds.  Must be a power of 2 and must be 4 or greater.

    The method returns a tuple containing three expressions in the following order: the absolute maximum "slope-of-slope" _m_ (`m`) and the lower and upper bound for the function's value, respectively.  See the notes in the section on [**general factory functions**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions) for more information.  This method will use symbolic computations whenever possible.  If it has to resort to numerical methods, it will print warnings, since in that case, the parameters found by this method are not guaranteed to be correct.
    """
    if n < 4:
        raise ValueError
    n2 = n
    while n2 % 2 == 0:
        n2 = n2 // 2
    if n2 != 1:
        raise ValueError
    dd = buildParam("myc2", func, x)
    offset = buildOffset("myc2", dd, n)
    nm = nminmax(func, x)
    bound1 = nm[0] - offset
    bound2 = nm[1] + offset
    return (dd, bound1, bound2)

def buildOffset(kind, dd, n):
    if kind == "c2":
        # Use the theoretical offset for twice
        # differentiable functions. dd=max. abs. second derivative
        # NOTE: Correct for power-of-2 degrees n>=1.
        return dd / (n * 2)
    elif kind == "myc2":
        # Use my theoretical offset for twice
        # differentiable functions. dd=max. abs. second derivative
        # NOTE: Correct for power-of-2 degrees n>=4.
        return dd / (n * 7)
    elif kind == "lipschitz":
        # Use the theoretical offset for Lipschitz
        # continuous functions. dd=max. abs. "slope"
        # NOTE: Correct for power-of-2 degrees n>=1.
        return dd * (1 + sqrt(2)) / sqrt(n)
    elif kind == "myhoelderhalforig":
        # Use my theoretical offset for (1/2)-Hölder
        # continuous functions. dd=Hölder constant
        # NOTE: Correct for power-of-2 degrees n>=4.
        return (
            dd
            * (Rational(2, 7) ** Rational(1, 4))
            / ((2 ** Rational(1, 4) - 1) * (n) ** Rational(1, 4))
        )
    elif kind == "myhoelderhalf":
        # Upper bound for "myhoelderhalforig"
        return dd * 154563 / (40000 * (n) ** Rational(1, 4))
    elif kind == "mylipschitzorig":
        # Use my theoretical offset for Lipschitz
        # continuous functions. dd=max. abs. "slope"
        # NOTE: Correct for power-of-2 degrees n>=4.
        return dd * (sqrt(7) * (sqrt(2) + 2)) / (7 * sqrt(n))
    elif kind == "mylipschitz":
        # Upper bound for "mylipschitzorig"
        return dd * 322613 / (250000 * sqrt(n))
    elif kind == "sikkema":
        # Use the theoretical offset for C0
        # Lipschitz continuous functions involving Sikkema's constant.
        # (If the function is not Lipschitz continuous the formula
        # is sikkema*W(1/sqrt(n)), where W(h) is the function's
        # modulus of continuity.)
        # NOTE: Correct for n>=1.  Not used in approxscheme2,
        # because it doesn't maintain consistency requirement.
        sikkema = S(4306 + 837 * sqrt(6)) / 5832
        return sikkema * dd / sqrt(n)
    elif kind == "c1":
        # Use the theoretical offset for C1
        # functions with a Lipschitz continuous slope.
        # dd=max. abs. "slope-of-slope" (Lipschitz constant
        # of first derivative). (G. G. Lorentz. Bernstein polynomials.
        # Chelsea Publishing Co., New York, second edition, 1986.)
        # (If the slope is not Lipschitz continuous the formula
        # is (3/4)*(1/sqrt(n))*W(1/sqrt(n)), where W(h)
        # is the _modulus of continuity_ of the slope function, that is,
        # the maximum difference between the highest and lowest
        # values of that function in any window of size h inside
        # the interval [0, 1]).
        # NOTE: Correct for n>=1.  Not used in approxscheme2,
        # because it doesn't maintain consistency requirement.
        return (S(3) / 4) * dd / n
    elif kind == "c0":
        # Use the theoretical offset for C0
        # Lipschitz continuous functions involving a more trivial bound
        # (by Popoviciu)
        # NOTE: Correct for n>=1.  Not used in approxscheme2,
        # because it doesn't maintain consistency requirement.
        return (S(5) / 4) * dd / sqrt(n)
    else:
        raise ValueError

# NOTE: continuous_domain is currently unreliable for Min/Max/Piecewise,
# but helps improve speed of numerical optimization
from sympy.calculus.util import continuous_domain

def pwminmax(func, x, intv):
    # Finds minimum of certain piecewise functions
    if not isinstance(func, Piecewise):
        raise ValueError
    mn = []
    mx = []
    try:
        for ex in func.as_expr_set_pairs(intv):
            mn.append(minimum(ex[0], x, ex[1]))
            mx.append(maximum(ex[0], x, ex[1]))
    except:
        mn = []
        mx = []
        intvstart = intv.start
        intvend = intv.end
        for arg in func.args:
            cset = ConditionSet(x, arg[1])
            newintv = intv.intersect(cset)
            if isinstance(cset, ConditionSet):
                # Handle LessThan, Eq, and GreaterThan
                if (
                    newintv.args[0] == x
                    and isinstance(newintv.args[1], Eq)
                    and newintv.args[1].args[0] == x
                    and newintv.args[1].args[1].is_constant()
                    and newintv.args[1].args[1] >= intvstart
                    and newintv.args[1].args[1] <= intvend
                ):
                    newintv = newintv.args[2].intersect(
                        Interval(newintv.args[1].args[1], newintv.args[1].args[1])
                    )
                if (
                    newintv.args[0] == x
                    and isinstance(newintv.args[1], LessThan)
                    and newintv.args[1].args[0] == x
                    and newintv.args[1].args[1].is_constant()
                    and newintv.args[1].args[1] >= intvstart
                    and newintv.args[1].args[1] <= intvend
                ):
                    newintv = newintv.args[2].intersect(
                        Interval(intvstart, newintv.args[1].args[1])
                    )
                if (
                    newintv.args[0] == x
                    and isinstance(newintv.args[1], GreaterThan)
                    and newintv.args[1].args[0] == x
                    and newintv.args[1].args[1].is_constant()
                    and newintv.args[1].args[1] >= intvstart
                    and newintv.args[1].args[1] <= intvend
                ):
                    newintv = newintv.args[2].intersect(
                        Interval(newintv.args[1].args[1], intvend)
                    )
            intv -= newintv
            # print(newintv)
            if newintv != S.EmptySet:
                mn.append(minimum(arg[0], x, newintv))
                mx.append(maximum(arg[0], x, newintv))
    # print(mn)
    # print(mx)
    return [Min(*mn), Max(*mx)]

def nminmax(func, x, warningctx=None):
    # Find minimum and maximum at [0,1].
    try:
        return [minimum(func, x, Interval(0, 1)), maximum(func, x, Interval(0, 1))]
    except:
        pw = piecewise_fold(func.rewrite(Piecewise))
        if isinstance(pw, Piecewise):
            try:
                return pwminmax(pw, x, Interval(0, 1))
            except:
                pass
        print(
            "WARNING: Resorting to numerical optimization: %s" % (func), file=sys.stderr
        )
        if warningctx:
            warningctx["warning"] = True
    cv = [0, 1]
    df = diff(func)
    mmh = isinstance(func, Min) or isinstance(func, Max) or isinstance(func, Heaviside)
    n = 40 if mmh else 20
    for i in range(n):
        try:
            ns = nsolve(df, x, (S(i) / n, S(i + 1) / n), solver="bisect")
            cv.append(lowerbound(ns))
            cv.append(upperbound(ns))
        except:
            ss = S(i) / n
            se = S(i + 1) / n
            for k in range(1 + 1):
                cv.append(ss + (se - ss) * S(k) / 10)
    # Evaluate at critical points, and
    # remove incomparable values
    cv2 = []
    # print(func.__class__)
    iscont = continuous_domain(func, x, Interval(0, 1)) == Interval(0, 1)
    # print([func.__class__,iscont])
    # print(func)
    for c in cv:
        c2s = [func.subs(x, c)]
        # Finding limits for Min, Max, and Heaviside can be
        # extremely slow.  Also check whether function is continuous
        # to avoid unnecessary limit computation
        if (not iscont) and (not mmh):
            try:
                c2s.append(funclimit(func, x, c, "+"))
            except:
                pass
            # XXX: Disabling because it can be extremely slow in some
            # cases, especially when Heaviside is involved
            # try:
            #  c2s.append(funclimit(func, x, c, "-"))
            # except:
            #  pass
        for c2 in c2s:
            # Change complex infinity to infinity
            if c2 == zoo:
                c2 = oo
            try:
                Min(c2)
                cv2.append(c2)
            except:
                pass
    cv = cv2
    return [lowerbound(Min(*cv)), upperbound(Max(*cv))]

def buildParam(kind, func, x, warningctx=None):
    if kind == "myhoelderhalf":
        if warningctx:
            warningctx["warning"] = True
        try:
            dd = hoelderconst(func, x, S.Half)
        except:
            raise ValueError
    elif kind == "c2" or kind == "c1" or kind == "myc2":
        try:
            # Maximum of second derivative.
            dd = nminmax(diff(diff(func)), x, warningctx=warningctx)
            dd = Max(Abs(dd[0]), Abs(dd[1]))
        except:
            # Unfortunately, SymPy's maximum and minimum are
            # not powerful enough to handle many common cases
            # of functions (notably piecewise functions), and
            # also has no convenient way to
            # minimize or maximize functions numerically.
            raise ValueError
    elif (
        kind == "lipschitz"
        or kind == "mylipschitz"
        or kind == "sikkema"
        or kind == "c0"
    ):
        try:
            # Maximum of first derivative (Lipschitz constant).
            # Notice that Lipschitz functions are differentiable almost
            # everywhere, due to a result by Rademacher.
            # Quick checks
            dd = diff(func).subs(x, 0)
            if dd == oo or dd == -oo or dd == zoo:
                return oo
            dd = diff(func).subs(x, 1)
            if dd == oo or dd == -oo or dd == zoo:
                return oo
            ff = func.rewrite(Piecewise)
            dd = nminmax(diff(func), x, warningctx=warningctx)
            dd = Max(Abs(dd[0]), Abs(dd[1]))
            if dd == 0:
                # Erroneous parameter, so fall back to estimation
                if warningctx:
                    warningctx["warning"] = True
                dd = hoelderconst(func, x, 1)
        except:
            # Estimate the Lipschitz constant
            if warningctx:
                warningctx["warning"] = True
            dd = hoelderconst(func, x, 1)
    else:
        raise ValueError
    ss = str(dd)
    # Get upper bound for the parameter;
    # this won't affect correctness
    dd = upperbound(dd, 100000)
    return dd

def consistencyCheckInner(prevcurve, newcurve, ratio=1, diagnose=False, conc=None):
    n, prevcurve, prevoffset = prevcurve
    n2, newcurve, newoffset = newcurve
    degs = n2 - n
    prevoffset *= ratio
    newoffset *= ratio
    # NOTE: For the 'above' and 'below' cases, bounds ensure that in case of doubt,
    # the approximation is judged to be inconsistent
    # Below
    belowbernconew = [lowerbound(a - newoffset) for a in newcurve]
    maxbernconew = max(belowbernconew)
    if maxbernconew < 0:
        # Fully below 0
        pass  # return "offcurve"
    belowberncoold = degelev([upperbound(b - prevoffset) for b in prevcurve], degs)
    for oldv, newv in zip(belowberncoold, belowbernconew):
        if newv < oldv:
            # Inconsistent approximation from below
            if diagnose:
                print("Inconsistent from below")
                print(["n, n2, prevoffset, newoffset", n, n2, prevoffset, newoffset])
                print([S(c).n() for c in belowberncoold])
                print([S(c).n() for c in belowbernconew])
            return "incons"
    # Above
    bernconew = [upperbound(a + newoffset) for a in newcurve]
    minbernconew = min(bernconew)
    if minbernconew > 1:
        # Fully above 1
        pass  # return "offcurve"
    berncoold = degelev([lowerbound(b + prevoffset) for b in prevcurve], degs)
    for oldv, newv in zip(berncoold, bernconew):
        if oldv < newv:
            # Inconsistent approximation from above
            if diagnose:
                print("Inconsistent from above")
                print(["n, n2, prevoffset, newoffset", n, n2, prevoffset, newoffset])
                print([S(c).n() for c in berncoold])
                print([S(c).n() for c in bernconew])
            return "incons"
    return True

def isinrange(curve, ratio, conc=None):
    n, curve, offset = curve
    offset *= ratio
    for c in curve:
        lb = lowerbound(c - offset)
        ub = upperbound(c + offset)
        if (lb < 0 and conc != "concave") or (ub > 1 and conc != "convex"):
            return False
    return True

def concavity(func, x, warningctx=None):
    try:
        if func == x:
            return "concave"
        c1 = is_convex(func, x, domain=Interval(0, 1))
        c2 = is_convex(-func, x, domain=Interval(0, 1))
        if c1 == True and c2 == True:
            # convex AND concave, so unreliable.  This should not happen
            raise ValueError
        if c1:
            return "convex"
        if c2:
            return "concave"
    except:
        isconcave = True
        isconvex = True
        d = diff(func, x)
        d2 = diff(d, x)
        c = 100
        diffs = []
        for i in range(c):
            v1 = func.subs(x, S(i) / c)
            v2 = func.subs(x, S(i + 1) / c)
            vmid = func.subs(x, (S(i) + S.Half) / c)
            try:
                if vmid < (v1 + v2) / 2:
                    isconcave = False
                if vmid > (v1 + v2) / 2:
                    isconvex = False
            except:
                print(
                    "NOTICE: Can't determine whether function is concave or convex",
                    file=sys.stderr,
                )
                return None
            if (not isconvex) and (not isconcave):
                break
        if isconcave:
            print(
                "WARNING: Found to be concave by numerical computation: %s"
                % (str(func)),
                file=sys.stderr,
            )
            if warningctx != None:
                warningctx["warning"] = True
            return "concave"
        if isconvex:
            print(
                "WARNING: Found to be convex by numerical computation: %s"
                % (str(func)),
                file=sys.stderr,
            )
            if warningctx != None:
                warningctx["warning"] = True
            return "convex"
    # NOTE: No warning if we can't decide whether the
    # function is concave or convex, since correctness
    # is unaffected in this case
    return None

def consistencyCheckCore(curvedata, ratio, diagnose=False):
    for i in range(len(curvedata) - 1):
        cons = consistencyCheckInner(
            curvedata[i], curvedata[i + 1], ratio=ratio, diagnose=diagnose
        )
        if cons == "incons":
            return False
    return True

def srepl(s):
    return str(s).replace("&", "&amp;")

import re

def funcstring(func, x):
    pwfunc = func.subs(x, symbols("lambda")).rewrite(Piecewise)
    pwfunc = piecewise_fold(pwfunc)
    minfunc = func.rewrite(Min)
    if isinstance(minfunc, Min):
        fs = (
            "min("
            + funcstring(minfunc.args[0], x)
            + ", "
            + funcstring(minfunc.args[1], x)
            + ")"
        )
        if not ("otherwise" in fs):
            return fs
    elif str(func) != str(minfunc):
        fs = funcstring(minfunc, x)
        if not ("otherwise" in fs):
            return fs
    maxfunc = func.rewrite(Max)
    if isinstance(maxfunc, Max):
        fs = (
            "max("
            + funcstring(maxfunc.args[0], x)
            + ", "
            + funcstring(maxfunc.args[1], x)
            + ")"
        )
        if not ("otherwise" in fs):
            return fs
    elif str(func) != str(maxfunc):
        fs = funcstring(maxfunc, x)
        if not ("otherwise" in fs):
            return fs
    if isinstance(pwfunc, Piecewise):
        # pwfunc = Piecewise((pwfunc, GreaterThan(x, 0) & LessThan(x, 1)))
        # pwfunc = piecewise_fold(pwfunc)
        sep = False
        data = ""
        for a, b in pwfunc.args:
            if sep:
                data += "; "
            if b == True:
                data += ("%s otherwise" % (srepl(a))).replace("lambda", "_&lambda;_")
            elif isinstance(b, Eq):
                data += (
                    "%s if %s = %s" % (srepl(a), srepl(b.args[0]), srepl(b.args[1]))
                ).replace("lambda", "_&lambda;_")
            elif isinstance(b, LessThan):
                # NOTE: In SymPy, LessThan means less than or equal
                data += (
                    "%s if %s &le; %s" % (srepl(a), srepl(b.args[0]), srepl(b.args[1]))
                ).replace("lambda", "_&lambda;_")
            else:
                data += ("%s if %s" % (srepl(a), srepl(b))).replace(
                    "lambda", "_&lambda;_"
                )
            sep = True
    else:
        data = "%s" % (srepl(pwfunc).replace("lambda", "_&lambda;_"))
    data = data.replace(" - ", " &minus; ")
    data = data.replace("(-", "(&minus;")
    data = data.replace(" >= ", " &ge; ")
    data = re.sub(r"pi(?!\w)", "&pi;", data)
    data = re.sub(r"\*\*\(([^\)\(]+)\)", "<sup>\\1</sup>", data)
    data = re.sub(r"\*\*(\d+)", "<sup>\\1</sup>", data)
    data = data.replace("*", "\*")
    return data

def bernpoly(a, x):
    # Create a polynomial in Bernstein form using the given
    # array of coefficients and the symbol x.  The polynomial's
    # degree is the length of 'a' minus 1.
    pt = x
    n = len(a) - 1
    ret = 0
    v = [binomial(n, j) for j in range(n // 2 + 1)]
    for i in range(0, n + 1):
        oldret = ret
        bino = v[i] if i < len(v) else v[n - i]
        ret += a[i] * bino * pt**i * (1 - pt) ** (n - i)
    return ret

def dominates(func, x, hfunc, warningctx=None):
    # Determine whether hfunc is greater than func
    # everywhere in the open interval (0, 1).
    try:
        nmax = minimum(hfunc - func, x, Interval.open(0, 1))
        if nmax < 0:
            return False
        if nmax == 0:
            s = solveset(hfunc - func, x, domain=Interval.open(0, 1))
            return s == EmptySet
        return True
    except:
        print(
            "WARNING: Resorting to numerical optimization in 'dominates': %s; %s"
            % (str(func), str(hfunc)),
            file=sys.stderr,
        )
        if warningctx:
            warningctx["warning"] = True
        cs = S(1) / 100000
        ce = 1 - cs
        n = 102
        hf = hfunc - func
        for i in range(n + 1):
            if hf.subs(x, cs + (ce - cs) * S(i) / n) <= 0:
                return False
        return True

def findh(func, x, endzero=False, warningctx=None):
    # Finds a polynomial that bounds func from above.
    fdiff = diff(func, x).subs(x, 0)
    if fdiff == oo or fdiff == zoo:
        # Derivative is infinite at 0, so no dominating polynomial
        return None
    deg = 1
    for k in range(6):
        coeffs = [0 if i == 0 or (endzero and i == deg) else 1 for i in range(deg + 1)]
        bp = bernpoly(coeffs, x)
        if dominates(func, x, bp, warningctx=warningctx):
            return coeffs
        deg *= 2
    return None

def findq(func, x, warningctx=None):
    # Finds a polynomial that bounds func from below.
    deg = 1
    for k in range(6):
        coeffs = [0 if i < deg else 1 for i in range(deg + 1)]
        bp = bernpoly(coeffs, x)
        # print(bp)
        if dominates(1 - func, x, 1 - bp, warningctx=warningctx):
            return coeffs
        deg *= 2
    return None

def approxscheme2(
    func, x, kind=None, lip=None, double=True, levels=9, isdiff=False, warningctx=None
):
    """
        This method builds a scheme for approximating a continuous function _f_(_&lambda;_) that maps the interval \[0, 1\] to (0, 1), with the help of polynomials that converge from above and below to that function.  The function is approximated in a way that allows simulating the probability _f_(_&lambda;_) given a black-box way to sample the probability _&lambda;_; this is also known as the Bernoulli Factory problem.  Not all functions of this kind are supported yet.

    Note that because numerical methods may be used in some cases, and because only a finite number of polynomials are generated and checked by the code, the approximation scheme is not guaranteed to be correct in all cases.  The method will print warnings if it has to resort to numerical methods.

    The `approxscheme2(func,x,kind,lip,double,levels)` method takes these parameters:

    - `func`: SymPy expression of the desired function.
    - `x`: Variable used by `func`.
    - `kind`: a string specifying the approximation scheme, such as "myc2" (see code for `buildParam`).  If None (the default), the scheme is automatically chosen.  Must be None, "c2", "myc2", "lipschitz", "mylipschitz", "mylipschitzorig", "myhoelderhalforig", or "myhoelderhalf".
    - `double`: Whether to double the degree with each additional level (`True`, the default) or to increase that degree by 1 with each level (`False`).
    - `levels`: Number of polynomial levels to generate.  The first level will be the polynomial of degree 4 for the kinds "myc2", "mylipschitz", or "myhoelderhalf", and degree 1 otherwise.  Default is 9.

    The method returns a string in Markdown format describing the approximation scheme, which can then be used in either of the [**general factory function algorithms**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions) to simulate the probability _f_(_&lambda;_) given a black-box way to sample the probability _&lambda;_.  It refers to the functions **fbelow** and **fabove**.  **fbelow** and **fabove** mean the _k_<sup>th</sup> Bernstein coefficient for the lower or upper degree-_n_ polynomial, respectively, where _k_ is an integer in the interval \[0, _n_\]. If the method fails, it returns None.
    """
    # TODO:
    # - Special handling for polynomials
    if not (kind in [None, "c2", "myc2", "lipschitz", "mylipschitz", "myhoelderhalf"]):
        raise ValueError("unsupported kind: %s" % (str(kind)))
    func = func.simplify()
    if not isdiff:
        print(funcstring(func, x))
    curvedata = []
    # NOTE: If warningctx["warning"] becomes True at the end of the
    # method, this means that finding the approximation scheme relied
    # on numerical computations that may affect the scheme's correctness.
    if warningctx == None:
        warningctx = {"warning": False}
    if func == None:
        raise ValueError
    nmm = nminmax(func, x, warningctx=warningctx)
    if nmm[0] < 0 or nmm[1] > 1:
        if not isdiff:
            print("Function does not admit a Bernoulli factory", file=sys.stderr)
        return False
    schemes = [
        "myc2",
        "mylipschitz",
        "myhoelderhalf",
        "mylipschitzorig",
        "myhoelderhalforig",
    ]
    if kind != None:
        schemes = [kind]
    kind = None
    dd = None
    for scheme in schemes:
        wc = {"warning": False}
        dd = buildParam(scheme, func, x, warningctx=wc)
        if dd == oo or dd == zoo:
            continue
        if dd == 0:
            continue
        kind = scheme
        warningctx["warning"] |= wc["warning"]
        break
    if kind == None:
        print("Function not supported for the scheme %s" % (schemes), file=sys.stderr)
        return None
    if kind == "c1" or kind == "c0" or kind == "sikkema":
        deg = 2
    elif kind in [
        "mylipschitz",
        "myc2",
        "myhoelderhalf",
        "mylipschitzorig",
        "myhoelderhalforig",
    ]:
        deg = 4
    else:
        deg = 1
    origfunc = func
    conc = concavity(func, x, warningctx=warningctx)
    specialHandling = None
    nonconvex = False
    if conc != "concave" and nmm[0] <= 0:
        specialHandling = "zero"
    elif conc != "convex" and nmm[1] >= 1:
        specialHandling = "one"
    if specialHandling != None:
        invertedResult = False
        if specialHandling == "one":
            func = 1 - func
            invertedResult = True
        zeroAtZero = func.subs(x, 0) == 0
        zeroAtOne = func.subs(x, 1) == 0
        invertedCoin = False
        if zeroAtOne and not zeroAtZero:
            invertedCoin = True
            tmp = zeroAtZero
            zeroAtZero = zeroAtOne
            zeroAtOne = tmp
            func = func.subs(x, 1 - x)
        if (not isdiff) and zeroAtZero:
            h = findh(func, x, zeroAtOne, warningctx=warningctx)
            h2 = None
            newfunc = None
            schemedata = None
            if h != None:
                hpoly = bernpoly(h, x)
                newfunc = func / hpoly
                funczero = newfunc.subs(x, 0)
                funczerolim = funclimit(newfunc, x, 0)
                if funczero != funczerolim:
                    newfunc = Piecewise((funczerolim, Eq(x, 0)), (newfunc, True))
                newfunc = piecewise_fold(newfunc)
                if funczerolim == 0:
                    # print("Limit is zero, retrying")
                    h2 = findh(newfunc, x, zeroAtOne, warningctx=warningctx)
                    if h2 != None:
                        hpoly2 = bernpoly(h2, x)
                        newfunc = newfunc / hpoly2
                        funczero = newfunc.subs(x, 0)
                        funczerolim = funclimit(newfunc, x, 0)
                        if funczero != funczerolim:
                            newfunc = Piecewise(
                                (funczerolim, Eq(x, 0)), (newfunc, True)
                            )
                        newfunc = piecewise_fold(newfunc)
            if newfunc != None:
                schemedata = approxscheme2(
                    newfunc,
                    x,
                    kind=kind,
                    double=double,
                    levels=levels,
                    isdiff=True,
                    warningctx=warningctx,
                )
            if h != None and schemedata != None:
                simpoly = ""
                if h == [0, 1] and not invertedCoin:
                    simpoly = "flipping the input coin.  If it returns 0, "
                elif h == [0, 1, 1] and not invertedCoin:
                    simpoly = "flipping the input coin twice.  If both flips return 0, "
                else:
                    simpoly = (
                        "simulating a polynomial with the following coefficients: "
                        + str(h)
                        + ".  If it returns 0, "
                    )
                data = (
                    "* Let _f_(_&lambda;_) = "
                    + "**"
                    + funcstring(origfunc, x)
                    + "**"
                    + ".  Then simulate _f_ by first "
                    + simpoly
                    + (
                        "return 1.  Otherwise, "
                        if invertedResult
                        else "return 0.  Otherwise, "
                    )
                )
                if h2 != None:
                    simpoly = ""
                    if h2 == [0, 1] and not invertedCoin:
                        simpoly = "flip the input coin.  If it returns 0, "
                    elif h2 == [0, 1, 1] and not invertedCoin:
                        simpoly = "flip the input coin twice.  If both flips return 0, "
                    else:
                        simpoly = (
                            "simulate a polynomial with the following coefficients: "
                            + str(h2)
                            + ".  If it returns 0, "
                        )
                    data += simpoly + (
                        "return 1.  Otherwise, "
                        if invertedResult
                        else "return 0.  Otherwise, "
                    )
                data += (
                    "simulate "
                    + "_g_(_&lambda;_) (a function described below) and "
                    + (
                        "return 1 minus the result."
                        if invertedResult
                        else "return the result."
                    )
                    + (
                        "  During the simulation, instead of flipping the input coin as "
                        + "usual, a different coin is flipped which "
                        + 'does the following: "Flip the input coin and return 1 minus the result."'
                        if invertedCoin
                        else ""
                    )
                )
                data += "<br>\n"
                data += schemedata
                print(data)
                return data
        if (not isdiff) and specialHandling == "zero":
            print(
                "This non-concave function with minimum of 0 is not yet supported",
                file=sys.stderr,
            )
        if (not isdiff) and specialHandling == "one":
            print(
                "This non-concave function with maximum of 1 is not yet supported",
                file=sys.stderr,
            )
        return None
    for i in range(1, levels + 1):
        offset = buildOffset(kind, dd, deg)
        curvedata.append(
            (deg, [func.subs(x, S(j) / deg) for j in range(deg + 1)], offset)
        )
        if double:
            deg *= 2
        else:
            deg += 1
    offset = buildOffset(kind, dd, 1)
    if not consistencyCheckCore(curvedata, Rational(1)):
        print(
            "INCONSISTENT --> offset=%s [dd=%s, kind=%s]"
            % (S(offset).n(), upperbound(dd.n()).n(), kind),
            file=sys.stderr,
        )
        consistencyCheckCore(curvedata, Rational(1), diagnose=True)
        return None
    ratios = []
    for cdlen in range(3, len(curvedata) + 1):
        left = Rational(0, 1)
        right = Rational(1, 1)
        for i in range(0, 6):
            mid = (left + right) / 2
            if consistencyCheckCore(curvedata[0:cdlen], mid):
                right = mid
            else:
                left = mid
        # NOTE: If 'ratio' appears to stabilize to much less than 0, then the
        # approximation scheme is highly likely to be correct.
        ratios.append(right)
        print(
            "consistent(len=%d) --> offset_deg1=%s [ratio=%s, dd=%s, kind=%s]"
            % (cdlen, S(offset * right).n(), right.n(), upperbound(dd.n()).n(), kind),
            file=sys.stderr,
        )
    minratio = Min(*ratios)
    maxratio = Max(*ratios)
    inrangedeg = -1
    inrangedata = None
    # Tightened approximation
    for cd in curvedata:
        if isinrange(cd, right, conc):
            inrangedeg = cd[0]
            inrangedata = cd
            break
    looseinrangedeg = -1
    looseinrangedata = None
    # Non-tightened approximation
    for cd in curvedata:
        if isinrange(cd, 1, conc):
            looseinrangedeg = cd[0]
            looseinrangedata = cd
            break
    nsymbol = symbols("n")
    offsetn = buildOffset(kind, dd, nsymbol)
    warningctx["bounds"] = "correct"
    # print([maxratio,minratio,maxratio-minratio,len(ratios)])
    if maxratio < 1 and (maxratio - minratio) < Rational(5, 100) and len(ratios) >= 5:
        warningctx["bounds"] = "likelycorrect"
    elif maxratio < 1:
        warningctx["bounds"] = "tight"
    if isdiff:
        data = "    Let _g_(_&lambda;_) = "
        data += funcstring(func, x) + "."
    else:
        data = "* Let _f_(_&lambda;_) = "
        data += "**" + funcstring(func, x) + "**."
    if double:
        data += " Then, for every integer _n_ that's a power of 2, starting from 1:\n"
    else:
        data += " Then:\n"
    schemes = []
    if (
        kind == "myc2" or kind == "mylipschitz" or kind == "myhoelderhalf"
    ) and right < 1:
        schemes.append([looseinrangedata, looseinrangedeg, 1, "loose"])
    schemes.append([inrangedata, inrangedeg, right, "tight"])
    properties = {
        "myc2": "twice differentiable",
        "c2": "twice differentiable",
        "mylipschitzorig": "Lipschitz continuous",
        "mylipschitz": "Lipschitz continuous",
        "lipschitz": "Lipschitz continuous",
        "myhoelderhalf": "(1/2)-Hölder continuous",
        "myhoelderhalforig": "(1/2)-Hölder continuous",
    }
    prop = properties[kind]
    if conc == "concave":
        prop = "concave and " + properties[kind]
    if conc == "convex":
        prop = "convex and " + properties[kind]
    for sch in schemes:
        if warningctx["warning"]:
            if sch[3] == "loose":
                data += (
                    "    * Detected to be "
                    + prop
                    + " using numerical methods, which may be inaccurate:\n"
                )
            else:
                data += (
                    "    * Generated using tighter bounds than necessarily proven:\n"
                )
        elif warningctx["bounds"] == "likelycorrect":
            if sch[3] == "loose":
                data += (
                    "    * The function was detected to be " + prop + ", leading to:\n"
                )
            else:
                data += "    * Generated using tighter bounds than necessarily proven, but highly likely to be correct:\n"
        else:
            if sch[3] == "loose":
                data += (
                    "    * The function was detected to be " + prop + ", leading to:\n"
                )
            else:
                data += (
                    "    * Generated using tighter bounds than necessarily proven:\n"
                )
        irdata = sch[0]
        irdeg = sch[1]
        ratio = sch[2]
        data += "        * **fbelow**(_n_, _k_) = "
        upperbounded = False
        lowerbounded = False
        offsetinrangedeg = -1
        if irdeg >= 0:
            offsetinrangedeg = lowerbound(Min(*irdata[1]) - irdata[2] * ratio, 10000)
            if conc == "concave":
                # Automatically lower-bounded
                lowerbounded = True
            elif offsetinrangedeg >= 0:
                data += "%s if _n_&lt;%d; otherwise, " % (offsetinrangedeg, irdeg)
                lowerbounded = True
            else:
                data += "0 if _n_&lt;%d; otherwise, " % (irdeg)
                lowerbounded = True
        if isdiff:
            data += "_g_(_k_/_n_)"
        else:
            data += "_f_(_k_/_n_)"
        if conc != "concave":
            data += " &minus; %s" % (funcstring(offsetn * ratio, x))
        data += ".\n"
        data += "        * **fabove**(_n_, _k_) = "
        if irdeg >= 0:
            bound = S(0)
            offsetinrangedeg = upperbound(Max(*irdata[1]) + irdata[2] * ratio, 10000)
            if conc == "convex":
                # Automatically upper-bounded
                upperbounded = True
            elif offsetinrangedeg <= 1:
                data += "%s if _n_&lt;%d; otherwise, " % (offsetinrangedeg, irdeg)
                upperbounded = True
            else:
                data += "1 if _n_&lt;%d; otherwise, " % (irdeg)
                upperbounded = True
        if isdiff:
            data += "_g_(_k_/_n_)"
        else:
            data += "_f_(_k_/_n_)"
        if conc != "convex":
            data += " + %s" % (funcstring(offsetn * ratio, x))
        data += ".\n"
    if not isdiff:
        print(data)
    return data
