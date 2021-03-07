from sympy import *
import math
import sys

def upperbound(x, boundmult=1000000000000000):
    # Calculates a limited-precision upper bound of x.
    boundmult = S(boundmult)
    return S(int(ceiling(x * boundmult).n())) / boundmult

def lowerbound(x, boundmult=1000000000000000):
    # Calculates a limited-precision lower bound of x.
    boundmult = S(boundmult)
    return S(int(floor(x * boundmult).n())) / boundmult

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
    print("WARNING: Resorting to numerical computation")
    return upperbound(estimatehoelder(func, xz, alpha, points), 10000)

def c2params(func, x, n):
    """
      This method returns symbolic expressions for parameters needed to apply my approximation scheme for C<sup>2</sup> continuous functions (namely: fbelow(n, k) = f(k/n) - m/(7 * n); fabove(n, k) = f(k/n) + m / (7 * n)).  It takes these parameters:

    - `func`: SymPy expression of the desired function.
    - `x`: Variable used by `func`.
    - `n`: A Sympy variable used in the symbolic expressions for the two bounds.  It indicates the degree of the polynomial for which the method should find upper and lower bounds.  Must be a power of 2 and must be 4 or greater.

    The method returns a tuple containing three expressions in the following order: the absolute maximum "slope-of-slope" _m_ (`m`) and the two bounds for **fbound(_n_)** (`bound1` and `bound2`, respectively).  See the notes in the section on [**general factory functions**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions) for more information.  This method will use symbolic computations whenever possible.  If it has to resort to numerical methods, it will print warnings, since in that case, the parameters found by this method are not guaranteed to be correct.
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
        return dd / (n * 2)
    elif kind == "myc2":
        # Use my theoretical offset for twice
        # differentiable functions, valid if n>=4. dd=max. abs. second derivative
        return dd / (n * 7)
    elif kind == "lipschitz":
        # Use the theoretical offset for Lipschitz
        # continuous functions. dd=max. abs. "slope"
        return dd * (1 + sqrt(2)) / sqrt(n)
    elif kind == "mylipschitz":
        # Use my theoretical offset for Lipschitz
        # continuous functions, valid if n>=4. dd=max. abs. "slope"
        return dd * (sqrt(7) * (sqrt(2) + 2)) / (7 * sqrt(n))
    elif kind == "sikkema":
        # Use the theoretical offset for C0
        # Lipschitz continuous functions involving Sikkema's constant.
        # (If the function is not Lipschitz continuous the formula
        # is sikkema*W(1/sqrt(n)), where W(h) is the function's
        # modulus of continuity.)
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
        return (S(3) / 4) * dd / n
    elif kind == "c0":
        # Use the theoretical offset for C0
        # Lipschitz continuous functions involving a more trivial bound
        # (by Popoviciu)
        return (S(5) / 4) * dd / sqrt(n)
    else:
        raise ValueError

def nminmax(func, x):
    # Find minimum and maximum at [0,1].
    try:
        return [minimum(func, x, Interval(0, 1)), maximum(func, x, Interval(0, 1))]
    except:
        print("WARNING: Resorting to numerical optimization")
    cv = [0, 1]
    df = diff(func)
    for i in range(20):
        try:
            ns = nsolve(df, x, (S(i) / 20, S(i + 1) / 20), solver="bisect")
            cv.append(ns)
        except:
            cv.append(S(i) / 20)
            cv.append(S(i + 1) / 20)
    # Evaluate at critical points, and
    # remove incomparable values
    cv2 = []
    for c in cv:
        c2 = func.subs(x, c)
        # Change complex infinity to infinity
        if c2 == zoo:
            c2 = oo
        try:
            Min(c2)
            cv2.append(c2)
        except:
            pass
    cv = cv2
    return [Min(*cv).simplify(), Max(*cv).simplify()]

def buildParam(kind, func, x, lip=None):
    if kind == "c2" or kind == "c1" or kind == "myc2":
        try:
            # Maximum of second derivative.
            dd = nminmax(diff(diff(func)), x)
            dd = Max(Abs(dd[0]), Abs(dd[1])).simplify()
        except:
            # Unfortunately, SymPy's maximum and minimum are
            # not powerful enough to handle many common cases
            # of functions (notably piecewise functions), and
            # also has no convenient way to
            # minimize or maximize functions numerically.
            if lip == None:
                raise ValueError
            dd = S(lip)
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
            ff = func.rewrite(Piecewise)
            dd = nminmax(diff(func), x)
            dd = Max(Abs(dd[0]), Abs(dd[1])).simplify()
            if dd == 0:
                # Erroneous parameter, so fall back to estimation
                dd = hoelderconst(func, x, 1)
        except:
            # Estimate the Lipschitz constant
            dd = hoelderconst(func, x, 1)
    else:
        raise ValueError
    ss = str(dd)
    if len(ss) > 50:
        # Get upper bound for complicated constants;
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

def concavity(func, x):
    try:
        if is_convex(func, x, domain=Interval(0, 1)):
            return "convex"
        if is_convex(-func, x, domain=Interval(0, 1)):
            return "concave"
    except:
        print(
            "WARNING: Can't determine whether function is concave or convex symbolically, "
            + "so resorting to numerical computation"
        )
        d = diff(func, x)
        d2 = diff(d, x)
        c = 100
        diffs = []
        for i in range(c + 1):
            v = d2.subs(x, S(i) / c).n()
            try:
                Min(v)
                diffs.append(v)
            except:
                # Not comparable, so take limits instead
                snext = S(i + 1) / c
                diffs.append(
                    funclimit(d, x, S(i) / c, "-") - funclimit(d, x, snext, "-")
                )
                diffs.append(
                    funclimit(d, x, S(i) / c, "+") - funclimit(d, x, snext, "+")
                )
        isconcave = True
        isconvex = True
        for i in range(len(diffs) - 1):
            try:
                # print([diffs[i].n(),diffs[i+1].n()])
                if diffs[i] > 0:
                    isconcave = False
                if diffs[i] < 0:
                    isconvex = False
            except:
                print("WARNING: Can't determine whether function is concave or convex")
                return None
            if (not isconvex) and (not isconcave):
                break
        if isconcave:
            return "concave"
        if isconvex:
            return "convex"
    return None

def consistencyCheckCore(curvedata, ratio, diagnose=False):
    for i in range(len(curvedata) - 1):
        cons = consistencyCheckInner(
            curvedata[i], curvedata[i + 1], ratio=ratio, diagnose=diagnose
        )
        if cons == "incons":
            return False
    return True

def funcstring(func, x):
    pwfunc = func.subs(x, symbols("lambda")).rewrite(Piecewise)
    pwfunc = piecewise_fold(pwfunc)
    if isinstance(pwfunc, Piecewise):
        sep = False
        data = ""
        for a, b in pwfunc.args:
            if sep:
                data += "; "
            if b == True:
                data += ("%s otherwise" % (str(a).replace("*", "\*"))).replace(
                    "lambda", "_&lambda;_"
                )
            else:
                data += (
                    "%s if %s" % (str(a).replace("*", "\*"), str(b).replace("*", "\*"))
                ).replace("lambda", "_&lambda;_")
            sep = True
        return data
    else:
        return "%s" % (str(pwfunc).replace("*", "\*").replace("lambda", "_&lambda;_"))

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
        ret += a[i] * bino * pt ** i * (1 - pt) ** (n - i)
    return ret

def dominates(func, x, hfunc):
    # Determine whether hfunc is greater than func
    # everywhere in the open interval (0, 1).
    try:
        nmax = minimum(hfunc - func, x, Interval.open(0, 1))
        if nmax <= 0:
            return False
        return True
    except:
        print("WARNING: Resorting to numerical optimization")
        lip = upperbound(buildParam("lipschitz", cc, x))
        if lip == 0:
            lip = 1
        cs = S(1) / 100000
        ce = 1 - cs
        n = ceiling(20 * lip) + 2
        hf = hfunc - func
        for i in range(n + 1):
            if hf.subs(x, cs + (ce - cs) * S(i) / n) <= 0:
                return False
        return True

def findh(func, x):
    deg = 1
    while True:
        coeffs = [0 if i == 0 else 1 for i in range(deg + 1)]
        bp = bernpoly(coeffs, x)
        print(bp - func)
        if dominates(func, x, bp):
            return coeffs
        deg *= 2

def approxscheme2(func, x, kind="c2", lip=None, double=True, levels=9, isdiff=False):
    """
        This method builds a scheme for approximating a continuous function _f_(_&lambda;_) that maps the interval \[0, 1\] to (0, 1), with the help of polynomials that converge from above and below to that function.  The function is approximated in a way that allows simulating the probability _f_(_&lambda;_) given a black-box way to sample the probability _&lambda;_; this is also known as the Bernoulli Factory problem.  Not all functions of this kind are supported yet.

    Note that because numerical methods may be used in some cases, and because only a finite number of polynomials are generated and checked by the code, the approximation scheme is not guaranteed to be correct in all cases.  The method will print warnings if it has to resort to numerical methods.

    The `approxscheme2(func,x,kind,lip,double,levels)` method takes these parameters:

    - `func`: SymPy expression of the desired function.
    - `x`: Variable used by `func`.
    - `kind`: a string specifying the approximation scheme, such as "c2" (see code for `buildParam`).
    - `lip`: A manually determined parameter that depends on the 'kind', in case the parameter can't be found automatically.
    - `double`: Whether to double the degree with each additional level (`True`, the default) or to increase that degree by 1 with each level (`False`).
    - `levels`: Number of polynomial levels to generate.  The first level will be the polynomial of degree 2 for the kinds "c1", "c0", or "sikkema", and degree 1 otherwise.  Default is 9.

    The method prints out text describing the approximation scheme, which can then be used in either of the [**general factory function algorithms**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions) to simulate the probability _f_(_&lambda;_) given a black-box way to sample the probability _&lambda;_.  It refers to the functions **fbelow**, **fabove**, and **fbound**.  **fbelow** and **fabove** mean the _k_<sup>th</sup> Bernstein coefficient for the lower or upper degree-_n_ polynomial, respectively, where _k_ is an integer in the interval \[0, _n_\]. **fbound** means the coefficients' lower and upper bounds for the polynomial of degree _n_.
    """
    print(func)
    curvedata = []
    if kind == "c1" or kind == "c0" or kind == "sikkema":
        deg = 2
    elif kind == "mylipschitz" or kind == "myc2":
        deg = 4
    else:
        deg = 1
    nmm = nminmax(func, x)
    if nmm[0] < 0 or nmm[1] > 1:
        if not isdiff:
            print("Function does not admit a Bernoulli factory")
        return False
    conc = concavity(func, x)
    if conc != "concave" and nmm[0] <= 0:
        if (not isdiff) and func.subs(x, 0) == 0 and func.subs(x, 1) > 0:
            # TODO: Support case when func(1)==0
            h = findh(func, x)
            hpoly = bernpoly(h, x)
            newfunc = Piecewise(
                (funclimit(func / hpoly, x, 0), Eq(x, 0)), (func / hpoly, True)
            )
            newfunc = piecewise_fold(newfunc)
            if approxscheme2(
                newfunc,
                x,
                kind=kind,
                lip=None,
                double=double,
                levels=levels,
                isdiff=True,
            ):
                print(
                    "Let _f_(_&lambda;_) = "
                    + funcstring(func, x)
                    + ".  Then simulate _f_ by first "(
                        "flipping the input coin"
                        if h == [0, 1]
                        else "simulating a polynomial with the following coefficients: "
                        + str(h)
                    )
                    + ".  If it returns 1, then simulate "
                    + "_g_ and return the result."
                )
                return True
        if (not isdiff) and func.subs(x, 1) == 0:
            newfunc = diff(func.subs(x, 1 - x), x)
            if approxscheme2(
                newfunc,
                x,
                kind=kind,
                lip=None,
                double=double,
                levels=levels,
                isdiff=True,
            ):
                print(
                    "Let _f_(_&lambda;_) = "
                    + funcstring(func, x)
                    + ".  Then _f&prime;_(1&minus;_&lambda;_) is the derivative of "
                    + "_f_(_&lambda;_), and the "
                    + "function _f_ can be simulated using the integral method and a coin that returns 1 "
                    + "minus the original coin flip result."
                )
                return True
        if not isdiff:
            print("This non-concave function with minimum of 0 is not yet supported")
        return False
    if conc != "convex" and nmm[1] >= 1:
        if not isdiff:
            print("This non-convex function with maximum of 1 is not yet supported")
        return False
    dd = buildParam(kind, func, x, lip)
    if dd == oo or dd == zoo:
        if not isdiff:
            print("Function not supported for the scheme %s" % (kind))
        return False
    if dd == 0:
        if lip != None:
            dd = S(lip)
        else:
            print("Erroneous parameter calculated for the scheme %s" % (kind))
            return False
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
            file=sys.stdout,
        )
        consistencyCheckCore(curvedata, Rational(1), diagnose=True)
        return
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
        print(
            "consistent(len=%d) --> offset_deg1=%s [ratio=%s, dd=%s, kind=%s]"
            % (cdlen, S(offset * right).n(), right.n(), upperbound(dd.n()).n(), kind),
            file=sys.stdout,
        )
    inrangedeg = -1
    inrangedata = None
    for cd in curvedata:
        if isinrange(cd, right, conc):
            inrangedeg = cd[0]
            inrangedata = cd
            break
    nsymbol = symbols("n")
    offsetn = buildOffset(kind, dd, nsymbol)
    offsetn *= right
    if isdiff:
        data = "* Let _g_(_&lambda;_) = "
    else:
        data = "* Let _f_(_&lambda;_) = "
    data += funcstring(func, x) + "."
    if double:
        data += " Then, for all _n_ that are powers of 2, starting from 1:\n"
    else:
        data += " Then:\n"
    data += "    * **fbelow**(_n_, _k_) = "
    upperbounded = False
    lowerbounded = False
    if inrangedeg >= 0:
        offsetinrangedeg = lowerbound(
            Min(*inrangedata[1]) - inrangedata[2] * right, 10000
        )
        if conc == "concave":
            # Automatically lower-bounded
            lowerbounded = True
        elif offsetinrangedeg >= 0:
            data += "%s if _n_&lt;%d; otherwise, " % (offsetinrangedeg, inrangedeg)
            lowerbounded = True
        else:
            # print(["conc",conc,"loweroffset",offsetinrangedeg])
            data += "0 if _n_&lt;%d; otherwise, " % (inrangedeg)
            lowerbounded = True
    if isdiff:
        data += "_g_(_k_/_n_)"
    else:
        data += "_f_(_k_/_n_)"
    if conc != "concave":
        data += " &minus; `%s`" % (
            str(offsetn.subs(x, symbols("lambda"))).replace("*", "\*")
        )
    data += ".\n"
    data += "    * **fabove**(_n_, _k_) = "
    if inrangedeg >= 0:
        bound = S(0)
        offsetinrangedeg = upperbound(
            Max(*inrangedata[1]) + inrangedata[2] * right, 10000
        )
        if conc == "convex":
            # Automatically upper-bounded
            upperbounded = True
        elif offsetinrangedeg <= 1:
            data += "%s if _n_&lt;%d; otherwise, " % (offsetinrangedeg, inrangedeg)
            upperbounded = True
        else:
            # print(["conc",conc,"upperoffset",offsetinrangedeg])
            data += "1 if _n_&lt;%d; otherwise, " % (inrangedeg)
            upperbounded = True
    data += "_f_(_k_/_n_)"
    if conc != "convex":
        data += " + `%s`" % (str(offsetn.subs(x, symbols("lambda"))).replace("*", "\*"))
    data += ".\n"
    if inrangedeg >= 0 or (upperbounded and lowerbounded):
        if conc == "concave" or conc == "convex" or (upperbounded and lowerbounded):
            data += "    * **fbound**(_n_) = [0, 1].\n"
        else:
            data += (
                "    * **fbound**(_n_) = [0, 1] if _n_&ge;%d, or [&minus;1, 2] otherwise.\n"
                % (inrangedeg)
            )
    print(data)
    return True
