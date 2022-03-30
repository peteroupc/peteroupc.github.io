import random
import bernoulli
import randomgen
import math
from fractions import Fraction

###################

def psrn_complement(x):
    # NOTE: Assumes digits is 2
    for i in range(len(x[2])):
        if x[2][i] != None:
            x[2][i] = 1 - x[2][i]
    return x

def psrn_new_01():
    return [1, 0, []]

def psrn_fill(rg, psrn, precision=53, digits=2):
    af = 0
    afrac = psrn[2]
    asign = psrn[0]
    aint = psrn[1]
    if asign != -1 and asign != 1:
        raise ValueError
    hasNoneDigits = False
    for d in afrac:
        if d == None:
            hasNoneDigits = True
    if (not hasNoneDigits) and digits == 2:
        diglen = (precision + 1) - len(afrac)
        if diglen > 0:
            rest = rg.rndint((1 << diglen) - 1)
            for i in range(diglen):
                afrac.append(rest & 1)
                rest >>= 1
        for i in range(precision + 1):
            af = af * digits + afrac[i]
    else:
        for i in range(precision + 1):
            if i >= len(afrac):
                afrac.append(rg.rndint(digits - 1))
            if afrac[i] == None:
                afrac[i] = rg.rndint(digits - 1)
            af = af * digits + afrac[i]
    if af % digits >= digits - digits // 2:
        # round up
        return (
            asign
            * (((af // digits) + 1) + (aint * digits ** precision))
            / (digits ** precision)
        )
    else:
        return (
            asign
            * ((af // digits) + (aint * digits ** precision))
            / (digits ** precision)
        )

def psrn_in_range(rg, bmin, bmax, digits=2):
    if bmin >= bmax:
        raise ValueError
    if bmin >= 0 and bmax >= 0:
        return psrn_in_range_positive(rg, bmin, bmax, digits)
    if bmin <= 0 and bmax <= 0:
        ret = psrn_in_range_positive(rg, abs(bmax), abs(bmin), digits)
        ret[0] = -1
        return ret
    while True:
        a = psrn_new_01()
        bmaxi = int(bmax)
        if bmax < 0 and bmax != bmaxi:
            bmaxi -= 1
        bmini = int(bmin)
        if bmin < 0 and bmin != bmini:
            bmini -= 1
        ipart = (
            bmini + rg.rndint(bmaxi - 1 - bmini)
            if bmaxi == bmax
            else bmini + rg.rndint(bmaxi - bmini)
        )
        if ipart != bmini and ipart != bmaxi:
            a[0] = 1 if ipart >= 0 else -1
            a[1] = abs(ipart + 1) if ipart < 0 else ipart
            return a
        if ipart == bmini:
            a[0] = 1
            a[1] = abs(ipart + 1)
            if psrn_less_than_fraction(rg, a, abs(bmin), digits) == 1:
                a[0] = -1
                return a
        if ipart == bmaxi:
            a[0] = 1
            a[1] = ipart
            if psrn_less_than_fraction(rg, a, bmax, digits) == 1:
                a[0] = 1
                return a

def psrn_in_range_positive(rg, bmin, bmax, digits=2):
    if bmin >= bmax or bmin < 0 or bmax <= 0:
        raise ValueError
    a = psrn_new_01()
    if bmax == 1 and bmin == 0:
        return a
    bmaxi = int(bmax)
    bmini = int(bmin)
    if bmini == bmin and bmaxi == bmax:
        a[0] = 1
        a[1] = bmini + rg.rndint(bmaxi - 1 - bmini)
        return a
    # count = 0
    while True:
        # count += 1
        # if count>=20 and count%10==0:
        #   print([count,float(bmin),float(bmax)])
        a[0] = 1
        if bmaxi == bmax:
            a[1] = bmini + rg.rndint(bmaxi - 1 - bmini)
        else:
            a[1] = bmini + rg.rndint(bmaxi - bmini)
        # print([a[1],"bmini",bmini,float(bmin),"bmaxi",bmaxi,float(bmax)])
        if a[1] > bmini and a[1] < bmaxi:
            return a
        if bmin == bmini and a[1] == bmini and a[1] < bmaxi:
            return a
        bmaxv = bmax - bmaxi
        bminv = bmin - bmini
        if a[1] != bmini and a[1] != bmaxi:
            raise ValueError
        i = 0
        istart = 0
        if a[1] == bmini and a[1] == bmaxi:
            while True:
                dmin = int(digits * bminv)
                dmax = int(digits * bmaxv)
                if dmin != dmax:
                    break
                a[2].append(dmin)
                bminv = bminv * digits - dmin
                bmaxv = bmaxv * digits - dmax
                i += 1
            istart = i
        i = istart
        if a[1] == bmini:
            success = 0
            while True:
                bminv *= digits
                dmin = int(bminv)
                bminv -= dmin
                if i >= len(a[2]):
                    a[2].append(None)
                if a[2][i] == None:
                    a[2][i] = rg.rndint(digits - 1)
                ad = a[2][i]
                # print([i,"=bmini<bmaxi",dmin,ad,a,float(bminv),"bmini",a[1]])
                if ad > dmin:
                    success = 1
                    break
                if ad < dmin:
                    a = psrn_new_01()
                    break
                i += 1
            if not success:
                continue
        i = istart
        if a[1] == bmaxi:
            success = 0
            if bmaxi == 0 and bmaxi != bmax and len(a[2]) == 0:
                while True:
                    d = int(bmaxv * digits)
                    if d != 0:
                        break
                    bmaxv *= digits
                    bmaxv -= d
                    a[2].append(0)
                    i += 1
            while True:
                bmaxv *= digits
                dmax = int(bmaxv)
                bmaxv -= dmax
                if i >= len(a[2]):
                    a[2].append(None)
                if a[2][i] == None:
                    a[2][i] = rg.rndint(digits - 1)
                ad = a[2][i]
                # print([i,"=bmaxi>bmini",dmax,ad,a,"bmaxi",a[1]])
                if ad < dmax:
                    success = 1
                    break
                if ad > dmax or bmaxv == 0:
                    a = psrn_new_01()
                    break
                i += 1
            if not success:
                continue
        return a

def psrn_sample(rg, psrn, digits=2):
    return psrn_less(rg, psrn_new_01(), [1, 0, psrn[2]], digits)

def psrn_less(rg, psrn1, psrn2, digits=2):
    if psrn1[0] == None or psrn1[1] == None or psrn2[0] == None or psrn2[1] == None:
        raise ValueError
    if psrn1[0] != psrn2[0]:
        return 1 if psrn1[0] < 0 else 0
    if psrn1[0] >= 0:
        if psrn1[1] < psrn2[1]:
            return 1
        if psrn1[1] > psrn2[1]:
            return 0
    if psrn1[0] < 0:
        if psrn1[1] < psrn2[1]:
            return 0
        if psrn1[1] > psrn2[1]:
            return 1
    index = 0
    psrn1len = len(psrn1[2])
    psrn2len = len(psrn2[2])
    while True:
        # Fill with next digit in a's uniform number
        while psrn1len <= index:
            psrn1[2].append(rg.rndint(digits - 1))
            psrn1len += 1
        if psrn1[2][index] == None:
            psrn1[2][index] = rg.rndint(digits - 1)
        # Fill with next digit in b's uniform number
        while psrn2len <= index:
            psrn2[2].append(rg.rndint(digits - 1))
            psrn2len += 1
        if psrn2[2][index] == None:
            psrn2[2][index] = rg.rndint(digits - 1)
        aa = psrn1[2][index]
        bb = psrn2[2][index]
        if aa < bb:
            return 1
        if aa > bb:
            return 0
        index += 1

def psrn_less_than_fraction(rg, psrn, rat, digits=2):
    if (psrn[0] != -1 and psrn[0] != 1) or psrn[1] == None:
        raise ValueError
    rat = rat if isinstance(rat, Fraction) else Fraction(rat)
    num = rat.numerator
    den = rat.denominator
    if num < 0 and den < 0:
        num = abs(num)
        den = abs(den)
    bs = -1 if num < 0 or den < 0 else 1
    num = abs(num)
    den = abs(den)
    bi = int(num // den)
    num = num - den * bi
    sgn = 0
    if psrn[0] < 0:
        sgn = -1
    if psrn[0] > 0:
        sgn = 1
    if sgn != bs:
        return 1 if psrn[0] < 0 else 0
    if psrn[0] > 0:
        if psrn[1] < bi:
            return 1
        if psrn[1] > bi:
            return 0
    if psrn[0] < 0:
        if psrn[1] > bi:
            return 1
        if psrn[1] < bi:
            return 0
    if den == 0:
        raise ValueError
    if num == 0:
        # Is an integer
        return 0 if psrn[0] > 0 else 1
    pt = digits
    index = 0
    psrnlen = len(psrn[2])
    while True:
        # Fill with next digit in a's uniform number
        while psrnlen <= index:
            psrn[2].append(rg.rndint(digits - 1))
            psrnlen += 1
        if psrn[2][index] == None:
            psrn[2][index] = rg.rndint(digits - 1)
        d1 = psrn[2][index]
        c = 1 if num * pt >= den else 0
        d2 = (num * pt) // den
        if d2 < 0 or d2 >= digits:
            raise ValueError
        if d1 < d2:
            return 1 if psrn[0] > 0 else 0
        if d1 > d2:
            return 0 if psrn[0] > 0 else 1
        if c == 1:
            num = num * pt - den * d2
            den = den * pt
        if num == 0:
            return 0 if psrn[0] > 0 else 1
        pt *= digits
        index += 1

def psrn_reciprocal(rg, psrn1, digits=2):
    """Generates the reciprocal of a partially-sampled random number.
    psrn1: List containing the sign, integer part, and fractional part
        of the first PSRN.  Fractional part is a list of digits
        after the point, starting with the first.
    digits: Digit base of PSRNs' digits.  Default is 2, or binary."""
    if psrn1[0] == None or psrn1[1] == None:
        raise ValueError
    for i in range(len(psrn1[2])):
        psrn1[2][i] = rg.rndint(digits - 1) if psrn1[2][i] == None else psrn1[2][i]
    digitcount = len(psrn1[2])
    frac1 = psrn1[1]
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn1[2][i]
    while frac1 == 0:
        # Avoid degenerate cases
        d1 = rg.rndint(digits - 1)
        psrn1[2].append(d1)
        frac1 = frac1 * digits + d1
        digitcount += 1
    while True:
        dcount = digitcount
        ddc = digits ** dcount
        small = Fraction(ddc, frac1 + 1)
        large = Fraction(ddc, frac1)
        if small > large:
            raise ValueError
        if small == 0:
            raise ValueError
        while True:
            dc = int(small * ddc)
            if dc != 0:
                break
            dcount += 1
            ddc *= digits
        dc2 = int(large * ddc) + 1
        rv = dc + rg.rndint(dc2 - 1 - dc)
        rvx = rg.rndint(dc - 1)
        # print([count,float(small), float(large),dcount, dc/ddc, dc2/ddc])
        while True:
            rvsmall = Fraction(rv, ddc)
            rvlarge = Fraction(rv + 1, ddc)
            if rvsmall >= small and rvlarge < large:
                rvd = Fraction(dc, ddc)
                rvxf = Fraction(rvx, dc)
                rvxf2 = Fraction(rvx + 1, dc)
                # print(["dcs",rvx,"rvsmall",float(rvsmall),"rvlarge",float(rvlarge),"small",float(small),
                #   "rvxf",float(rvxf),float(rvxf2),"rvd",float(rvd),
                #   "sl",float((rvd*rvd)/(rvlarge*rvlarge)),float((rvd*rvd)/(rvsmall*rvsmall))])
                if rvxf2 < (rvd * rvd) / (rvlarge * rvlarge):
                    cpsrn = [1, 0, [0 for i in range(dcount)]]
                    cpsrn[0] = psrn1[0]
                    sret = rv
                    for i in range(dcount):
                        cpsrn[2][dcount - 1 - i] = sret % digits
                        sret //= digits
                    cpsrn[1] = sret
                    return cpsrn
                elif rvxf > (rvd * rvd) / (rvsmall * rvsmall):
                    break
            elif rvsmall > large or rvlarge < small:
                break
            rv = rv * digits + rg.rndint(digits - 1)
            rvx = rvx * digits + rg.rndint(digits - 1)
            dcount += 1
            ddc *= digits
            dc *= digits

def proddist(x, a, b, c, d):
    if a * d < b * c:
        aa = a
        bb = b
        cc = c
        dd = d
        a = cc
        b = dd
        c = aa
        d = bb
    if a * c > x:
        x = a * c
    if b * d < x:
        x = b * d
    if a * c <= x and x <= b * c:
        r = max(0, min(1, math.log(x / (a * c)))) / math.log(b / a)
    elif b * c <= x and x <= a * d:
        r = 1
    else:
        r = max(0, min(1, math.log(b * d / x))) / math.log(b / a)
    return max(0, min(1, r))

def proddist2(x, a, b, c, d):
    if a * d < b * c:
        aa = a
        bb = b
        cc = c
        dd = d
        a = cc
        b = dd
        c = aa
        d = bb
    if a * c > x:
        x = a * c
    if b * d < x:
        x = b * d
    if a * c <= x and x <= b * c:
        r = [Fraction(x, a * c), Fraction(b, a)]
    elif b * c <= x and x <= a * d:
        r = [Fraction(b, a), Fraction(b, a)]
    else:
        r = [Fraction(b * d, x), Fraction(b, a)]
    return r

def psrn_multiply(rg, psrn1, psrn2, digits=2):
    """Multiplies two uniform partially-sampled random numbers.
    psrn1: List containing the sign, integer part, and fractional part
        of the first PSRN.  Fractional part is a list of digits
        after the point, starting with the first.
    psrn2: List containing the sign, integer part, and fractional part
        of the second PSRN.
    digits: Digit base of PSRNs' digits.  Default is 2, or binary."""
    return psrn_multiply_b(rg, psrn1, psrn2, digits=digits)

def _dlc(rg, psrn, c, digits=2):
    i = rg.rndint(c - 1)
    if i < psrn[1]:
        return 1
    if i == psrn[1]:
        return psrn_sample(rg, psrn, digits=digits)
    return 0

def _log_1n(rg, c):
    # ln(1+1/c)
    u = None
    while True:
        if rg.rndint(1) == 0:
            return 1 if rg.rndint(c - 1) == 0 else 0
        if u == None:
            u = psrn_new_01()
        if psrn_sample(rg, u) == 1:
            if rg.rndint(c - 1) == 0:
                return 0

def _log_yxyz(rg, psrn, st, digits=2):
    # ln((st+psrn)/st)
    if psrn[0] < 0 or psrn[1] > st:
        raise ValueError([psrn[1], "st", st])
    u = None
    while True:
        if rg.rndint(1) == 0:
            return _dlc(rg, psrn, st, digits=digits)
        if u == None:
            u = psrn_new_01()
        if psrn_sample(rg, u, digits=digits) == 1:
            if _dlc(rg, psrn, st, digits=digits) == 1:
                return 0

def _dlc2(rg, psrn, n, d, digits=2):
    while True:
        if rg.rndint(d) != d:
            i = rg.rndint(d - 1)
            if i < n:
                return 1
            if i == n:
                return 1 - psrn_sample(rg, psrn, digits=digits)
            return 0
        if psrn_sample(rg, psrn, digits=digits) == 1:
            return 0

def _log_xyzy(rg, psrn, large, midmax, digits=2):
    # ln(large/(midmax+psrn))
    if psrn[0] < 0:
        raise ValueError
    u = None
    n = large - psrn[1] - midmax - 1
    d = psrn[1] + midmax
    while True:
        if rg.rndint(1) == 0:
            return _dlc2(rg, psrn, n, d, digits=digits)
        if u == None:
            u = psrn_new_01()
        if psrn_sample(rg, u, digits=digits) == 1:
            if _dlc2(rg, psrn, n, d, digits=digits) == 1:
                return 0

def _log_yxyz_test(ps, st):
    import scipy.integrate as spi

    rg = bernoulli.Bernoulli()
    print(spi.quad(lambda x: math.log((st + ps + x) / st), 0, 1)[0])
    print(sum(_log_yxyz(rg, [1, ps, []], st) for i in range(100000)) / 100000)

def _log_xyzy_test(ps, large, midmax):
    import scipy.integrate as spi

    rg = bernoulli.Bernoulli()
    print(spi.quad(lambda x: math.log(large / (midmax + ps + x)), 0, 1)[0])
    print(
        sum(_log_xyzy(rg, [1, ps, []], large, midmax) for i in range(100000)) / 100000
    )

def _dlc2_test(n, d):
    import scipy.integrate as spi

    rg = bernoulli.Bernoulli()
    print(spi.quad(lambda x: (n + (1 - x)) / (d + x), 0, 1)[0])
    print(sum(_dlc2(rg, [1, 0, []], n, d) for i in range(100000)) / 100000)

if False:
    _dlc2_test(0, 19)
    _dlc2_test(12, 19)
    _dlc2_test(17, 19)
    _log_yxyz_test(0, 1)
    _log_yxyz_test(0, 2)
    _log_yxyz_test(0, 50)
    _log_yxyz_test(3, 50)
    _log_yxyz_test(7, 50)
    _log_yxyz_test(20, 50)
    _log_xyzy_test(3, 20, 16)
    _log_xyzy_test(1, 32, 30)
    _log_xyzy_test(0, 16, 14)
    exit()

def psrn_multiply_b(rg, psrn1, psrn2, digits=2, testing=False):
    if psrn1[0] == None or psrn1[1] == None or psrn2[0] == None or psrn2[1] == None:
        raise ValueError
    for i in range(len(psrn1[2])):
        psrn1[2][i] = rg.rndint(digits - 1) if psrn1[2][i] == None else psrn1[2][i]
    for i in range(len(psrn2[2])):
        psrn2[2][i] = rg.rndint(digits - 1) if psrn2[2][i] == None else psrn2[2][i]
    while len(psrn1[2]) < len(psrn2[2]):
        psrn1[2].append(rg.rndint(digits - 1))
    while len(psrn1[2]) > len(psrn2[2]):
        psrn2[2].append(rg.rndint(digits - 1))
    digitcount = len(psrn1[2])
    if len(psrn2[2]) != digitcount:
        raise ValueError
    # Perform multiplication
    frac1 = psrn1[1]
    frac2 = psrn2[1]
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn1[2][i]
    for i in range(digitcount):
        frac2 = frac2 * digits + psrn2[2][i]
    zero = False  # (frac1 == 0 and frac2 != 0) or (frac2 == 0 and frac1 != 0)
    # print(["before",frac1,frac2,zero])
    while frac1 == 0 or frac2 == 0:
        # Avoid degenerate cases
        d1 = rg.rndint(digits - 1)
        psrn1[2].append(d1)
        d2 = rg.rndint(digits - 1)
        psrn2[2].append(d2)
        frac1 = frac1 * digits + d1
        frac2 = frac2 * digits + d2
        digitcount += 1
    # print(["after",frac1,frac2])
    small = frac1 * frac2
    mid1 = frac1 * (frac2 + 1)
    mid2 = (frac1 + 1) * frac2
    large = (frac1 + 1) * (frac2 + 1)
    midmin = min(mid1, mid2)
    midmax = max(mid1, mid2)
    dc2 = digitcount * 2
    cpsrn = [1, 0, [0 for i in range(dc2)]]
    cpsrn[0] = psrn1[0] * psrn2[0]
    iters = 0
    while True:
        iters += 1
        if iters > 1500:
            return None
        rv = rg.rndint(large - small - 1)
        if (not zero) and (rv < midmin - small or rv >= midmax - small):
            ru = small + rv
            succ = False
            if rv < midmin - small:
                psrn = [1, ru - small, []]  # PSRN
                succ = _log_yxyz(rg, psrn, small, digits=digits) == 1
            else:
                psrn = [1, ru - midmax, []]  # PSRN
                succ = _log_xyzy(rg, psrn, large, midmax, digits=digits) == 1
            if succ:
                # Success
                sret = ru
                for i in range(dc2):
                    idx = (dc2) - 1 - i
                    while idx >= len(cpsrn[2]):
                        cpsrn[2].append(None)
                    cpsrn[2][idx] = sret % digits
                    sret //= digits
                for i in range(len(psrn[2])):
                    idx = dc2 + i
                    while idx >= len(cpsrn[2]):
                        cpsrn[2].append(None)
                    cpsrn[2][idx] = psrn[2][i]
                cpsrn[1] = sret
                # if iters>100:print(iters)
                return cpsrn
        else:
            # Middle, or uniform, part of product density
            if not zero:
                if mid1 > mid2:
                    if _log_1n(rg, frac1) == 0:
                        continue
                else:
                    if _log_1n(rg, frac2) == 0:
                        continue
            sret = small + rv
            for i in range(dc2):
                cpsrn[2][dc2 - 1 - i] = sret % digits
                sret //= digits
            cpsrn[1] = sret
            # if iters>100:print(iters)
            return cpsrn

def psrn_multiply_by_fraction(rg, psrn1, fraction, digits=2):
    """Multiplies a partially-sampled random number by a fraction.
    psrn1: List containing the sign, integer part, and fractional part
        of the first PSRN.  Fractional part is a list of digits
        after the point, starting with the first.
    fraction: Fraction to multiply by.
    digits: Digit base of PSRNs' digits.  Default is 2, or binary."""
    if psrn1[0] == None or psrn1[1] == None:
        raise ValueError
    fraction = Fraction(fraction)
    for i in range(len(psrn1[2])):
        psrn1[2][i] = rg.rndint(digits - 1) if psrn1[2][i] == None else psrn1[2][i]
    digitcount = len(psrn1[2])
    # Perform multiplication
    frac1 = psrn1[1]
    fracsign = -1 if fraction < 0 else 1
    absfrac = abs(fraction)
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn1[2][i]
    while True:
        dcount = digitcount
        ddc = digits ** dcount
        small = Fraction(frac1, ddc) * absfrac
        large = Fraction(frac1 + 1, ddc) * absfrac
        dc = int(small * ddc)
        dc2 = int(large * ddc) + 1
        rv = dc + rg.rndint(dc2 - 1 - dc)
        while True:
            rvsmall = Fraction(rv, ddc)
            rvlarge = Fraction(rv + 1, ddc)
            if rvsmall >= small and rvlarge < large:
                cpsrn = [1, 0, [0 for i in range(dcount)]]
                cpsrn[0] = psrn1[0] * fracsign
                sret = rv
                for i in range(dcount):
                    cpsrn[2][dcount - 1 - i] = sret % digits
                    sret //= digits
                cpsrn[1] = sret
                return cpsrn
            elif rvsmall > large or rvlarge < small:
                break
            else:
                rv = rv * digits + rg.rndint(digits - 1)
                dcount += 1
                ddc *= digits

def psrn_add(rg, psrn1, psrn2, digits=2):
    """Adds two uniform partially-sampled random numbers.
    psrn1: List containing the sign, integer part, and fractional part
        of the first PSRN.  Fractional part is a list of digits
        after the point, starting with the first.
    psrn2: List containing the sign, integer part, and fractional part
        of the second PSRN.
    digits: Digit base of PSRNs' digits.  Default is 2, or binary."""
    if psrn1[0] == None or psrn1[1] == None or psrn2[0] == None or psrn2[1] == None:
        raise ValueError
    for i in range(len(psrn1[2])):
        psrn1[2][i] = rg.rndint(digits - 1) if psrn1[2][i] == None else psrn1[2][i]
    for i in range(len(psrn2[2])):
        psrn2[2][i] = rg.rndint(digits - 1) if psrn2[2][i] == None else psrn2[2][i]
    while len(psrn1[2]) < len(psrn2[2]):
        psrn1[2].append(rg.rndint(digits - 1))
    while len(psrn1[2]) > len(psrn2[2]):
        psrn2[2].append(rg.rndint(digits - 1))
    digitcount = len(psrn1[2])
    if len(psrn2[2]) != digitcount:
        raise ValueError
    # Perform addition
    frac1 = psrn1[1]
    frac2 = psrn2[1]
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn1[2][i]
    for i in range(digitcount):
        frac2 = frac2 * digits + psrn2[2][i]
    small = frac1 * psrn1[0] + frac2 * psrn2[0]
    mid1 = frac1 * psrn1[0] + (frac2 + 1) * psrn2[0]
    mid2 = (frac1 + 1) * psrn1[0] + frac2 * psrn2[0]
    large = (frac1 + 1) * psrn1[0] + (frac2 + 1) * psrn2[0]
    minv = min(small, mid1, mid2, large)
    maxv = max(small, mid1, mid2, large)
    # Difference is expected to be a multiple of two
    if abs(maxv - minv) % 2 != 0:
        raise ValueError
    vs = [small, mid1, mid2, large]
    vs.sort()
    midmin = vs[1]
    midmax = vs[2]
    while True:
        rv = rg.rndint(maxv - minv - 1)
        if rv < 0:
            raise ValueError
        side = 0
        start = minv
        if rv < midmin - minv:
            # Left side of sum density; rising triangular
            side = 0
            start = minv
        elif rv >= midmax - minv:
            # Right side of sum density; falling triangular
            side = 1
            start = midmax
        else:
            # Middle, or uniform, part of sum density
            sret = minv + rv
            cpsrn = [1, 0, [0 for i in range(digitcount)]]
            if sret < 0:
                sret += 1
                cpsrn[0] = -1
            sret = abs(sret)
            for i in range(digitcount):
                cpsrn[2][digitcount - 1 - i] = sret % digits
                sret //= digits
            cpsrn[1] = sret
            return cpsrn
        if side == 0:  # Left side
            pw = rv
            b = midmin - minv
        else:
            pw = rv - (midmax - minv)
            b = maxv - midmax
        newdigits = 0
        y = rg.rndint(b - 1)
        while True:
            lowerbound = pw if side == 0 else b - 1 - pw
            if y < lowerbound:
                # Success
                sret = start * (digits ** newdigits) + pw
                cpsrn = [1, 0, [0 for i in range(digitcount + newdigits)]]
                if sret < 0:
                    sret += 1
                    cpsrn[0] = -1
                sret = abs(sret)
                for i in range(digitcount + newdigits):
                    idx = (digitcount + newdigits) - 1 - i
                    while idx >= len(cpsrn[2]):
                        cpsrn[2].append(None)
                    cpsrn[2][idx] = sret % digits
                    sret //= digits
                cpsrn[1] = sret
                return cpsrn
            elif y > lowerbound + 1:  # Greater than upper bound
                # Rejected
                break
            pw = pw * digits + rg.rndint(digits - 1)
            y = y * digits + rg.rndint(digits - 1)
            b *= digits
            newdigits += 1

def psrn_add_fraction(rg, psrn, fraction, digits=2):
    if psrn[0] == None or psrn[1] == None:
        raise ValueError
    fraction = Fraction(fraction)
    fracsign = -1 if fraction < 0 else 1
    absfrac = abs(fraction)
    origfrac = fraction
    isinteger = absfrac.denominator == 1
    # Special cases
    # positive+pos. integer or negative+neg. integer
    if ((fracsign < 0) == (psrn[0] < 0)) and isinteger and len(psrn[2]) == 0:
        return [fracsign, psrn[1] + int(absfrac), []]
    # PSRN has no fractional part, fraction is integer
    if (
        isinteger
        and psrn[0] == 1
        and psrn[1] == 0
        and len(psrn[2]) == 0
        and fracsign < 0
    ):
        return [fracsign, int(absfrac) - 1, []]
    if (
        isinteger
        and psrn[0] == 1
        and psrn[1] == 0
        and len(psrn[2]) == 0
        and fracsign > 0
    ):
        return [fracsign, int(absfrac), []]
    if fraction == 0:  # Special case of 0
        return [psrn[0], psrn[1], [x for x in psrn[2]]]
    # End special cases
    for i in range(len(psrn[2])):
        psrn[2][i] = rg.rndint(digits - 1) if psrn[2][i] == None else psrn[2][i]
    digitcount = len(psrn[2])
    # Perform addition
    frac1 = psrn[1]
    frac2 = int(absfrac)
    fraction = absfrac - frac2
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn[2][i]
    for i in range(digitcount):
        digit = int(fraction * digits)
        fraction = (fraction * digits) - digit
        frac2 = frac2 * digits + digit
    ddc = digits ** digitcount
    small = Fraction(frac1 * psrn[0], ddc) + origfrac
    large = Fraction((frac1 + 1) * psrn[0], ddc) + origfrac
    minv = min(small, large)
    maxv = max(small, large)
    while True:
        newdigits = 0
        b = 1
        ddc = digits ** digitcount
        mind = int(minv * ddc)
        maxd = int(maxv * ddc)
        rvstart = mind - 1 if minv < 0 else mind
        rvend = maxd if maxv < 0 else maxd + 1
        rv = rg.rndint(rvend - rvstart - 1)
        rvs = rv + rvstart
        if rvs >= rvend:
            raise ValueError
        while True:
            rvstartbound = mind if minv < 0 else mind + 1
            rvendbound = maxd - 1 if maxv < 0 else maxd
            if rvs > rvstartbound and rvs < rvendbound:
                sret = rvs
                cpsrn = [1, 0, [0 for i in range(digitcount + newdigits)]]
                if sret < 0:
                    sret += 1
                    cpsrn[0] = -1
                sret = abs(sret)
                for i in range(digitcount + newdigits):
                    idx = (digitcount + newdigits) - 1 - i
                    cpsrn[2][idx] = sret % digits
                    sret //= digits
                cpsrn[1] = sret
                return cpsrn
            elif rvs <= rvstartbound:
                rvd = Fraction(rvs + 1, ddc)
                if rvd <= minv:
                    # Rejected
                    break
                else:
                    # print(["rvd",rv+rvstart,float(rvd),float(minv)])
                    newdigits += 1
                    ddc *= digits
                    rvstart *= digits
                    rvend *= digits
                    mind = int(minv * ddc)
                    maxd = int(maxv * ddc)
                    rv = rv * digits + rg.rndint(digits - 1)
                    rvs = rv + rvstart
            else:
                rvd = Fraction(rvs, ddc)
                if rvd >= maxv:
                    # Rejected
                    break
                else:
                    newdigits += 1
                    ddc *= digits
                    rvstart *= digits
                    rvend *= digits
                    mind = int(minv * ddc)
                    maxd = int(maxv * ddc)
                    rv = rv * digits + rg.rndint(digits - 1)
                    rvs = rv + rvstart

def psrnexpo(rg):
    count = 0
    while True:
        y1 = psrn_new_01()
        y = y1
        accept = True
        while True:
            z = psrn_new_01()
            if psrn_less(rg, y, z) == 0:
                accept = not accept
                y = z
                continue
            break
        if accept:
            return [1, count, y1[2]]
        count += 1

###################

def geobagcompare(bag, f):
    """Returns 1 with probability f(U), where U is the value that
      the given geometric bag turns out to hold, or 0 otherwise.
      This method samples bits from the geometric bag as necessary.
    - b: Geometric bag, that is, an ordinary Python list
       that holds a list of bits from left to
       right starting with the bit immediately after the binary point.
       An item can contain the value None, which indicates an
       unsampled bit.
    - f: Function to run, which takes one parameter, namely a 'float'.
      Currently, this method assumes f is monotonic.
      Note that this may suffer rounding and other approximation
      errors as a result.  A more robust implementation would require
      the method to return an interval (as in interval arithmetic)
      or would pass the desired level of accuracy to the function given
      here, and would probably have the function use arbitrary-precision
      rational or floating-point numbers rather than the fixed-precision
      'float' type of Python, which usually has 53 bits of precision.
    """
    k = 1
    v = 0
    prec = 1 << k
    prectol = 1.0 / prec
    i = 0
    geobagv = 0
    for i in range(len(bag)):
        if bag[i] == None:
            bag[i] = rg.randbit()
        geobagv = (geobagv << 1) | bag[i]
        i += 1
    lastfvstart = None
    lastfvend = None
    vnext = geobagv + 1
    iprec = 1 << i
    while True:
        while True:
            # print([lastfvstart,lastfvend])
            fvstart = lastfvstart if lastfvstart != None else f(geobagv / iprec)
            fvend = lastfvend if lastfvend != None else f(vnext / iprec)
            lastfvstart = fvstart
            lastfvend = fvend
            # NOTE: Assumes f is monotonic, so we don't check
            # if fvstart and fvend are the true min/max
            if abs(fvstart - fvend) <= 2 * prectol:
                # Within desired tolerance; calculate the
                # approximation
                pk = int(((fvstart + fvend) / 2) * prec)
                # Compare
                v = (v << 1) | rg.randbit()
                if pk + 1 <= v:
                    return 0
                if pk - 2 >= v:
                    return 1
                k += 1
                prec = 1 << k
                prectol = 1.0 / prec
                break
            if i >= len(bag):
                bag.append(rg.randbit())
                geobagv = (geobagv << 1) | bag[i]
                vnext = geobagv + 1
            lastfvstart = None
            lastfvend = None
            i += 1
            iprec = 1 << i

def _bern_power(bern, bag, num, den, bagfactory):
    if len(bag) >= 4 and bag[0] == 0 and bag[1] == 0 and bag[2] == 0 and bag[3] == 0:
        # If the geometric bag is known to hold a very small number, use
        # a different approach than the power Bernoulli factory, which converges
        # very slowly as the input number approaches 0, when num/den
        # is less than 1.
        # NOTE: Calculating "**(num/den)" requires floating-point arithmetic,
        # and so does geobagcompare, at the moment.
        # This is only a performance optimization.
        return geobagcompare(bag, lambda x: x ** (num / den))
    else:
        return bern.power(bagfactory, num, den)

def _power_of_uniform_greaterthan1(bern, power, complement=False, precision=53):
    return psrn_fill(
        _power_of_uniform_greaterthan1_geobag(bern, power, complement),
        precision=precision,
    )

def _power_of_uniform_greaterthan1_geobag(bern, power, complement=False):
    if power < 1:
        raise ValueError("Not supported")
    if power == 1:
        return psrn_new_01()
    i = 1
    powerfrac = Fraction(power)
    powerrest = Fraction(1) - Fraction(1) / powerfrac
    # Choose an interval
    while (
        bern.zero_or_one_power_ratio(1, 2, powerfrac.denominator, powerfrac.numerator)
        == 1
    ):
        i += 1
    # Crude choice of epsdividend:
    # epsdividend = Fraction(1)/(powerfrac * 2**(i))
    # The following choice of epsdividend makes eps_div
    # much faster, but it requires floating-point arithmetic
    # to calculate "**powerrest".  Using either choice does not
    # affect the correctness of this algorithm.
    probx = (2.0 ** (-i - 1)) ** powerrest
    epsdividend = Fraction(probx) * 255 / 256
    bag = psrn_new_01()
    gb = lambda: bern.geometric_bag(bag[2])
    bf = lambda: _bern_power(
        bern, bag[2], powerrest.numerator, powerrest.denominator, gb
    )
    # print(i)
    while True:
        # Limit sampling to the chosen interval
        bag[2].clear()
        for k in range(i - 1):
            bag[2].append(0)
        bag[2].append(1)
        # Simulate epsdividend / x**(1-1/power)
        if bern.eps_div(bf, epsdividend) == 1:
            # Flip all bits if complement is true
            return psrn_complement(bag) if complement else bag

def powerOfUniform(b, px, py, precision=53):
    """Generates a power of a uniform random number.
    - px, py - Numerator and denominator of desired exponent for the uniform
      random number.
    - precision: Number of bits after the point that the result will contain.
    """
    # Special case of beta, returning power of px/py
    # of a uniform random number, provided px/py
    # is in (0, 1].
    return betadist(b, py, px, 1, 1, precision)

def betadist(b, ax=1, ay=1, bx=1, by=1, precision=53):
    return psrn_fill(betadist_geobag(b, ax, ay, bx, by), precision=precision)

def betadist_geobag(b, ax=1, ay=1, bx=1, by=1):
    """Generates a beta-distributed random number with arbitrary
     (user-defined) precision.  Currently, this sampler only works if (ax/ay) and
     (bx/by) are both 1 or greater, or if one of these parameters is
    1 and the other is less than 1.
    - b: Bernoulli object (from the "bernoulli" module).
    - ax, ay: Numerator and denominator of first shape parameter.
    - bx, by: Numerator and denominator of second shape parameter.
    - precision: Number of bits after the point that the result will contain.
    """
    # Beta distribution for alpha>=1 and beta>=1
    bag = psrn_new_01()
    afrac = Fraction(ax) if ay == 1 else Fraction(ax, ay)
    bfrac = Fraction(bx) if by == 1 else Fraction(bx, by)
    bpower = bfrac - 1
    apower = afrac - 1
    # Special case for a=b=1
    if bpower == 0 and apower == 0:
        return bag
    # Special case if a=1
    if apower == 0 and bpower < 0:
        return _power_of_uniform_greaterthan1_geobag(b, Fraction(by, bx), True)
    # Special case if b=1
    if bpower == 0 and apower < 0:
        return _power_of_uniform_greaterthan1_geobag(b, Fraction(ay, ax), False)
    if apower <= -1 or bpower <= -1:
        raise ValueError
    # Special case if a and b are integers
    if int(bpower) == bpower and int(apower) == apower:
        a = int(afrac)
        b = int(bfrac)
        return randomgen.RandomGen().kthsmallest_psrn(a + b - 1, a)
    # Split a and b into two parts which are relatively trivial to simulate
    if bfrac > 2 and afrac > 2:
        bintpart = int(bfrac) - 1
        aintpart = int(afrac) - 1
        brest = bfrac - bintpart
        arest = afrac - aintpart
        # Generalized rejection method, p. 47
        while True:
            bag = betadist_geobag(b, aintpart, 1, bintpart, 1)
            gb = lambda: b.geometric_bag(bag[2])
            gbcomp = lambda: b.geometric_bag(bag[2]) ^ 1
            if b.power(gbcomp, brest) == 1 and b.power(gb, arest) == 1:
                return bag
    # Create a "geometric bag" to hold a uniform random
    # number (U), described by Flajolet et al. 2010
    gb = lambda: b.geometric_bag(bag[2])
    # Complement of "geometric bag"
    gbcomp = lambda: b.geometric_bag(bag[2]) ^ 1
    bp1 = lambda: (
        1 if b.power(gbcomp, bpower) == 1 and b.power(gb, apower) == 1 else 0
    )
    while True:
        # Create a uniform random number (U) bit-by-bit, and
        # accept it with probability U^(a-1)*(1-U)^(b-1), which
        # is the unnormalized PDF of the beta distribution
        bag[2].clear()
        if bp1() == 1:
            # Accepted
            return bag

#####################

class _RGConv:
    # Wrapper that takes an object that implements
    # rndint(maxinc).  Implements randint(mininc,maxinc).
    def __init__(self, rg):
        self.rg = rg

    def randint(self, a, b):
        return a + self.rg.rndint(b - a)

#####################

def genshape(rg, inshape):
    """Generates a random point inside a 2-dimensional shape, in the form of a uniform PSRN.
    inshape is a function that takes three parameters (x, y, s) and
    returns 1 if the box (x/s,y/s,(x+1)/s,(y+1)/s) is fully in the shape;
    -1 if not; and 0 if partially."""
    psrnx = psrn_new_01()
    psrny = psrn_new_01()
    base = 2
    while True:
        s = base
        cx = 0
        cy = 0
        d = 1
        while True:
            cx = cx * base + rg.rndbit()
            cy = cy * base + rg.rndbit()
            el = inshape(cx, cy, s)
            if el > 0:
                psrnx[2] = [0 for i in range(d)]
                psrny[2] = [0 for i in range(d)]
                for i in range(d):
                    psrnx[2][d - 1 - i] = cx % base
                    cx //= base
                    psrny[2][d - 1 - i] = cy % base
                    cy //= base
                psrnx[0] = -1 if rg.rndbit() == 0 else 1
                psrny[0] = -1 if rg.rndbit() == 0 else 1
                return [psrnx, psrny]
            elif el < 0:
                break
            else:
                s *= base
                d += 1

class _PavingNode:
    def __init__(self, coords):
        """ Represents a tree node of a mapped regular paving. """
        self.mark = 0
        self.coords = coords
        self.left = None
        self.right = None

    def getBisection(self):
        coord = 0
        maxwid = self.coords[0][1] - self.coords[0][0]
        for i in range(1, len(self.coords)):
            wid = self.coords[i][1] - self.coords[i][0]
            if wid > maxwid:  # Choose first widest coordinate
                coord = i
                maxwid = wid
        # Bisect
        sc = self.coords
        leftcoords = [
            [sc[i][0], sc[i][0] + maxwid / 2] if i == coord else sc[i]
            for i in range(len(sc))
        ]
        rightcoords = [
            [sc[i][0] + maxwid / 2, sc[i][1]] if i == coord else sc[i]
            for i in range(len(sc))
        ]
        left = _PavingNode(leftcoords)
        right = _PavingNode(rightcoords)
        return left, right

    def bisect(self):
        if self.left != None or self.right != None:
            raise ValueError
        self.left, self.right = self.getBisection()
        return self.left, self.right

class ShapeSampler2:
    YES = 1
    NO = -1
    MAYBE = 0

    def __init__(self, inshape, dx=1, dy=1):
        """Builds a sampler for random numbers on or inside a 2-dimensional shape.
        inshape is a function that takes a box described as [[min1, max1], ..., [minN, maxN]]
        and returns 1 if the box is fully in the shape;
        -1 if not; and 0 if partially.
        dx and dy are the size of the bounding box and must be integers.  Default is 1 each.
        """
        self.inshape = inshape
        self.root = _PavingNode(
            [[Fraction(0), Fraction(dx)], [Fraction(0), Fraction(dy)]]
        )
        self._setup(self.root)

    def _setup(self, box, depth=0):
        v = self.inshape(box.coords)
        if v == ShapeSampler2.YES or v == ShapeSampler2.NO:
            box.mark = v
            # print([box.coords,box.mark])
        else:  # MAYBE
            if depth < 6:
                left, right = box.bisect()
                self._setup(left, depth + 1)
                self._setup(right, depth + 2)
            else:
                # max. depth reached
                box.mark = ShapeSampler2.MAYBE
                # print([box.coords,box.mark])

    def _traverse(self, box, rg):
        r = 0
        d = 0
        while True:
            if box.left == None:
                return box, r, d
            else:
                child = rg.randbit()
                r = (r << 1) | child
                d += 1
                box = box.left if child == 0 else box.right

    def _makepsrn(self, coord, rg):
        # Because of bisections and the restriction of root box sizes to
        # integers, the denominator must be a power of 2.
        # Moreover, coords are assumed to be non-negative.
        if coord[0].numerator < 0:
            raise NotImplementedError
        if coord[1].numerator < 0:
            raise NotImplementedError
        # Get greatest denominator
        denom = max(coord[0].denominator, coord[1].denominator)
        c1 = int(coord[0] * denom)
        c2 = int((coord[1] - coord[0]) * denom)
        if c2 > 1:
            c1 += rg.rndint(c2 - 1)
        fracsize = denom.bit_length() - 1
        psrn = [0, 0, [0 for i in range(fracsize)]]
        # Set fractional part
        for i in range(fracsize):
            psrn[2][fracsize - 1 - i] = c1 & 1
            c1 >>= 1
        psrn[1] = c1  # Set integer part
        psrn[0] = 1  # Sign is assumed to be positive
        return psrn

    def sample(self, rg):
        """ Generates a random point inside the shape. """
        while True:
            box, r, d = self._traverse(self.root, rg)
            while True:
                if box.mark == ShapeSampler2.YES:
                    return [
                        self._makepsrn(box.coords[0], rg),
                        self._makepsrn(box.coords[1], rg),
                    ]
                if box.mark == ShapeSampler2.NO:
                    break
                # Mark is MAYBE
                child = rg.randbit()
                r = (r << 1) | child
                d += 1
                left, right = box.getBisection()
                box = left if child == 0 else right
                box.mark = self.inshape(box.coords)

class ShapeSampler:
    def __init__(self, inshape, dx=1, dy=1):
        """Builds a sampler for random numbers (in the form of PSRNs) on or inside a 2-dimensional shape.
        inshape is a function that takes three parameters (x, y, s) and
        returns 1 if the box (x/s,y/s,(x+1)/s,(y+1)/s) is fully in the shape;
        -1 if not; and 0 if partially.
        dx and dy are the size of the bounding box and must be integers.  Default is 1 each.
        """
        self.yeses = []
        self.maybes = []
        self.dx = dx
        self.dy = dy
        self.base = 2
        self.k = 4
        self.inshape = inshape
        s = self.base ** self.k
        for x in range(s * dx):
            for y in range(s * dy):
                v = inshape(x, y, s)
                if v == 1:
                    self.yeses.append([x, y])
                if v == 0:
                    self.maybes.append([x, y])

    def sample(self, rg):
        """ Generates a random point inside the shape, in the form of a uniform PSRN. """
        psrnx = psrn_new_01()
        psrny = psrn_new_01()
        done = False
        d = 1
        while not done:
            s = self.base
            cx = rg.rndint(self.dx - 1)
            cy = rg.rndint(self.dy - 1)
            box = rg.rndint(len(self.yeses) + len(self.maybes) - 1)
            d = self.k
            if box < len(self.yeses):
                cx = self.yeses[box][0]
                cy = self.yeses[box][1]
                s = self.base ** self.k
                break
            else:
                box -= len(self.yeses)
                cx = self.maybes[box][0]
                cy = self.maybes[box][1]
                s = self.base ** (self.k + 1)
                d += 1
            while True:
                cx = cx * self.base + rg.rndint(self.base - 1)
                cy = cy * self.base + rg.rndint(self.base - 1)
                el = self.inshape(cx, cy, s)
                if el > 0:
                    done = True
                    break
                elif el < 0:
                    break
                else:
                    s *= self.base
                    d += 1
        psrnx[2] = [0 for i in range(d)]
        psrny[2] = [0 for i in range(d)]
        for i in range(d):
            psrnx[2][d - 1 - i] = cx % self.base
            cx //= self.base
            psrny[2][d - 1 - i] = cy % self.base
            cy //= self.base
        psrnx[1] = cx
        psrny[1] = cy
        psrnx[0] = -1 if rg.randbit() == 0 else 1
        psrny[0] = -1 if rg.randbit() == 0 else 1
        return [psrnx, psrny]

def _peres(bits, output):
    u = []
    v = []
    length = len(bits) - len(bits) % 2
    if length == 0:
        return
    i = 0
    while i < length:
        if bits[i] == 0 and bits[i + 1] == 0:
            u.append(0)
            v.append(0)
        elif bits[i] == 0 and bits[i + 1] == 1:
            output.append(0)
            u.append(1)
        elif bits[i] == 1 and bits[i + 1] == 0:
            output.append(1)
            u.append(1)
        elif bits[i] == 1 and bits[i + 1] == 1:
            u.append(0)
            v.append(1)
        i += 2
    # Recursion on "discarded" bits
    _peres(u, output)
    _peres(v, output)

class _BitFetchingRandomGen:
    def __init__(self, *args):
        self.rg = randomgen.RandomGen(*args)
        self.fetchedbits = 0
        self.lastfetchedbits = 0
        self.totalfetchedbits = 0
        self.randombits = 0
        self.queuedbits = 0
        self.queuedbitvalues = 0
        self.queue = []
        self.recycled = []

    def extract(self, bits, output):
        _peres(bits, output)

    def _report(self, count):
        print(
            (
                "fetched=%d (per variate=%f)\n"
                + "random=%d (per variate=%f)\n"
                + "queued bit mean=%f\n"
                + "rate=%f"
            )
            % (
                self.totalfetchedbits,
                self.totalfetchedbits / count,
                self.randombits,
                self.randombits / count,
                self.queuedbitvalues / max(1, self.queuedbits),
                self.randombits / max(1, self.totalfetchedbits),
            )
        )

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

    def randbit(self):
        self.fetchedbits += 1
        self.totalfetchedbits += 1
        while len(self.recycled) >= 64:
            oldqueue = len(self.queue)
            self.extract(self.recycled[:64], self.queue)
            self.recycled[:64] = []
        if len(self.queue) > 0:
            ret = self.queue.pop(0)
            self.queuedbitvalues += ret
            self.queuedbits += 1
            return ret
        self.randombits += 1
        return self.rg.randbit()

    def feed_fetchedbits(self):
        # Feed the difference between the previous
        # and current number of fetched bits
        x = abs(self.fetchedbits - self.lastfetchedbits)
        self.lastfetchedbits = self.fetchedbits
        while x > 0:
            self.recycled.append(x & 1)
            x >>= 1
        self.fetchedbits = 0

def _test_rand_extraction(rg, func, digits=2, nofill=False):

    func(rg)
    return

    import scipy.stats as st

    # Test whether adding randomness extraction suggested by Devroye and Gravel
    # preserves the distribution
    samplesize = 5000
    rg = randomgen.RandomGen()
    sample1 = [
        func(rg) if nofill else psrn_fill(rg, func(rg), precision=32, digits=digits)
        for i in range(samplesize)
    ]
    bfrg = _BitFetchingRandomGen()
    sample2 = []
    for i in range(samplesize):
        ps = (
            func(bfrg)
            if nofill
            else psrn_fill(bfrg, func(bfrg), precision=32, digits=digits)
        )
        bfrg.feed_fetchedbits()
        sample2.append(ps)
    ks = st.ks_2samp(sample1, sample2)
    bfrg._report(samplesize)
    if ks.pvalue < 1e-4:
        bfrg._report(samplesize)
        print(ks)
        print("    # exp. range about %s - %s" % (min(sample1), max(sample1)))
        print("    # act. range about %s - %s" % (min(sample2), max(sample2)))
        try:
            dobucket(sample1)
            dobucket(sample2)
        except:
            pass

def addto1(rg):
    # Simulates the number of uniforms
    # in [0,1] needed to produce a sum greater than 1.
    pa = psrn_new_01()
    i = 1
    while True:
        pa = psrn_add(rg, pa, psrn_new_01())
        i += 1
        if pa[1] > 0:
            break
    return i

########################

# Random real numbers.  Uses ideas from H.J. Boehm's
# concept of "constructive reals".
# Essentially, each operation on real numbers has
# a function ev(n) that returns an integer m such that
# m/2^n is strictly within 1/2^n of the exact result
# of the operation.
#
#   References:
#
# Boehm, Hans-J. "Towards an API for the real numbers." In Proceedings of the 41st ACM SIGPLAN Conference on Programming Language Design and Implementation, pp. 562-576. 2020.
# Hans-J. Boehm. 1987. Constructive Real Interpretation of Numerical Programs. In Proceedings of the SIGPLAN ’87 Symposium on Interpreters and Interpretive Techniques. 214-221
# Goubault-Larrecq, Jean, Xiaodong Jia, and Clément Théron. "A Domain-Theoretic Approach to Statistical Programming Languages." arXiv preprint arXiv:2106.16190 (2021) (especially sec. 12.3).

class Real:
    def ev(self, n):
        raise NotImplementedError

    def __neg__(a):
        return RealNegate(a)

    def __mul__(a, b):
        return RealMultiply(a, b)

    def __rmul__(a, b):
        return RealMultiply(b, a)

    def __pow__(a, b):
        if b == 2:
            return RealMultiply(a, a)
        return RealPow(a, b)

    def __rpow__(b, a):
        if a == 2:
            return RealMultiply(b, b)
        return RealPow(b, a)

    def __truediv__(a, b):
        return RealDivide(a, b)

    def __rtruediv__(a, b):
        return RealDivide(b, a)

    def __add__(a, b):
        return RealAdd(a, b)

    def __radd__(a, b):
        return RealAdd(b, a)

    def __sub__(a, b):
        return RealSubtract(a, b)

    def __rsub__(a, b):
        return RealSubtract(b, a)

    def disp(a):
        return a.ev(30) / 2 ** 30

    def __repr__(a):
        return "Real"

class RealPi(Real):
    def __init__(self, fraction=1):
        self.fraction = Fraction(fraction)
        if self.fraction < 0:
            raise ValueError
        self.ev_n = -1
        self.ev_v = 0

    def __repr__(self):
        return "RealPi(%s)" % (self.fraction)

    def ev(self, n):
        if self.fraction == 0:
            return 0
        if self.ev_n == n:
            # print(["fast",self.ev_n,self.ev_v])
            return self.ev_v
        if n < self.ev_n:
            # print(["faster",self.ev_n,self.ev_v])
            return self.ev_v >> (self.ev_n - n)
        k = 0
        lower = Fraction(0)
        upper = lower
        while True:
            # Do calculation (BBP formula)
            upper += (
                self.fraction
                * (
                    Fraction(4, 8 * k + 1)
                    - Fraction(2, 8 * k + 4)
                    - Fraction(1, 8 * k + 5)
                    - Fraction(1, 8 * k + 6)
                )
                / 16 ** k
            )
            cinf = fracAreClose(lower, upper, n)
            if cinf != None:
                # In this case, cinf*ulp is strictly within 1 ulp of
                # both bounds, and thus strictly within 1 ulp
                # of the exact result
                self.ev_n = n
                self.ev_v = cinf
                return cinf
            lower = upper
            k += 1

REALPI = RealPi()
REALHALFPI = RealPi(Fraction(1, 2))

class RealSin(Real):
    def __init__(self, a):
        self.a = a if isinstance(a, Real) else RealFraction(a)
        self.a = RealCos(REALHALFPI - self.a)
        self.ev_n = -1
        self.ev_v = 0

    def __repr__(self):
        return "RealSin(%s)" % (self.a)

    def ev(self, n):
        return self.a.ev(n)

def fracAreClose(a, b, n):
    # if a>b: raise ValueError
    an = a.numerator
    ad = a.denominator
    bn = b.numerator
    bd = b.denominator
    return fracAreCloseND(an, ad, bn, bd, n)

def fracEV(sn, sd, n):
    sh = 2
    shv = 4
    sn = sn << (n + sh) if sn >= 0 else sn * (1 << (n + sh))
    ret = abs(sn) // sd
    if sn < 0:
        ret = -ret
    # if ret != int(Fraction(self.num, self.den) * (1 << (n + sh))):
    #    raise ValueError
    ret2 = (ret // shv) + 1 if ret % shv >= (shv >> 1) else (ret // shv)
    return ret2

def fracAreCloseND(an, ad, bn, bd, n):
    if ad < 0 or bd < 0:
        raise ValueError
    onen = 1 << n
    # (b-a)>=1/2^n
    if ad == bd:
        if onen * (bn - an) >= ad:
            # print(["too far (easy)",an,ad,bn,bd])
            return None
    else:
        if onen * (ad * bn - an * bd) >= ad * bd:
            # print(["too far",an,ad,bn,bd])
            return None
    ra = fracEV(an, ad, n)
    rb = fracEV(bn, bd, n)
    if ra == rb:
        return ra
    if ra != rb - 1:
        return None
    if an * onen > ad * ra and bn * onen < bd * rb:  # a>ra/2^n  # b<rb/2^n
        return ra
    return None

class RealCos(Real):
    def __init__(self, a):
        # NOTE: Currently assumes 'a' is greater than -pi,
        # and works best if 'a' is in (-pi, 2*pi).
        self.is_zero = False
        if isinstance(a, Real):
            self.a = a
        else:
            # Here, we can assume 'a' is any rational on the real line
            self.a = RealFraction(abs(a))
            self.is_zero = a == 0
        self.ev_n = -1
        self.ev_v = 0
        self.is_even = True
        while realIsLess(REALPI, self.a):
            self.a = RealSubtract(self.a, REALPI)
            self.is_even = not self.is_even

    def __repr__(self):
        return "RealCos(%s)" % (self.a)

    FRACZERO = Fraction(0)

    def _cosbounds(x, n, bits):
        m = 2 * n if x < 0 else 2 * n + 1
        ret = RealCos.FRACZERO
        oldret = ret
        fac = 2
        bitsshift = Fraction(1, 1 << (bits + 8))
        for i in range(1, m + 1):
            inc = Fraction((-1) ** (i), fac) * x ** (2 * i)
            ret += inc
            # print([i,float(ret)<float(oldret),float(inc)])
            if ((i & 1) == (m & 1)) and abs(inc) < bitsshift:
                # print([i,m])
                break
            elif i < m:
                oldret = ret
                fac *= (2 * i + 1) * (2 * i + 2)
        upbound = oldret
        lowbound = ret
        if lowbound > upbound:
            raise ValueError("Sanity check failed: x=%d n=%d" % (x, n))
        return [1 + lowbound, 1 + upbound]

    def ev(self, n):
        if self.is_zero:
            return 1 << n
        # Use best approximation calculated so far
        # to save time when n is no greater than that
        # approximation's length.
        # NOTE: Because of this feature, ev(n) can return
        # inconsistent values across runs; all that it must do is
        # return an n-bit approximation to the true result, and
        # depending on the true result there may be one or
        # two correct answers.
        if self.ev_n == n:
            # print(["fast",self.ev_n,self.ev_v])
            return self.ev_v
        if n < self.ev_n:
            # print(["faster",self.ev_n,self.ev_v])
            return self.ev_v >> (self.ev_n - n)
        nv = 2
        while True:
            av = abs(self.a.ev(nv))
            if abs(av) < 2:
                nv += 2
                continue
            # a's interval is weakly within 1/2^nv
            # of the exact value of a.
            # ainf will be less than pi due to argument reduction
            ainf = Fraction(av - 1, 1 << nv)
            asup = Fraction(av + 1, 1 << nv)
            # TODO: For correctness, check whether 'asup'
            # is greater than pi, and if so, replace lower bound with 0.
            # Do calculation
            ss = RealCos._cosbounds(asup, nv, n)
            ii = RealCos._cosbounds(ainf, nv, n)
            # Calculate n-bit approximation of
            # the two bounds
            cinf = min(ss[0], ii[0])
            csup = max(ss[1], ii[1])
            # print([nv,n,"a",av,"cinf",float(cinf/2**n),"csup",float(csup/2**n),
            #   "even",self.is_even])
            cinf = fracAreClose(cinf, csup, n)
            # if nv>200:
            #   print([self.a,n,float(min(ss[0],ii[0])),float(max(ss[1],ii[1]))])
            #   print(["supdiff",float(abs(ss[0]-ss[1]))])
            #   print(["infdiff",float(abs(ii[0]-ii[1]))])
            #   raise ValueError
            if cinf != None:
                # In this case, cinf*ulp is strictly within 1 ulp of
                # both bounds, and thus strictly within 1 ulp
                # of the exact result
                if not self.is_even:
                    cinf = -cinf
                self.ev_n = n
                self.ev_v = cinf
                return cinf
            nv += 6

class RealExp(Real):
    def __init__(self, a):
        self.a = a if isinstance(a, Real) else RealFraction(a)
        self.ev_n = -1
        self.ev_v = 0

    def __repr__(self):
        return "RealExp(%s)" % (self.a)

    @staticmethod
    def _fracfloor(x):
        ix = int(x)
        if x >= 0:
            return ix
        if x != ix:
            return ix - 1
        return ix

    @staticmethod
    def _expbounds(x, n, bits):
        if x == 0:
            return (Fraction(1), Fraction(1))
        if x >= -1 and x < 0:
            ret = Fraction(0)
            fac = 1
            for i in range(0, 2 * (n + 1) + 1):
                ret += x ** i / fac
                fac *= i + 1
            m = 2 * (n + 1) + 1
            lowerbound = ret + x ** m / fac
            if lowerbound > ret:
                raise ValueError
            return (lowerbound, ret)
        if x < -1:
            negfloor = -RealExp._fracfloor(x)
            ex = RealExp._expbounds(x / negfloor, n, bits)
            lower = ex[0] ** negfloor
            upper = ex[1] ** negfloor
            if lower > upper:
                raise ValueError
            return (lower, upper)
        else:
            ex = RealExp._expbounds(-x, n, bits)
            lower = 1 / ex[1]
            upper = 1 / ex[0]
            if lower > upper:
                raise ValueError
            return (lower, upper)

    @staticmethod
    def _exp(inf, sup, n, bits):
        return (
            RealExp._expbounds(inf, n, bits)[0],
            RealExp._expbounds(sup, n, bits)[1],
        )

    def ev(self, n):
        # Use best approximation calculated so far
        # to save time when n is no greater than that
        # approximation's length.
        # NOTE: Because of this feature, ev(n) can return
        # inconsistent values across runs; all that it must do is
        # return an n-bit approximation to the true result, and
        # depending on the true result there may be one or
        # two correct answers.
        if self.ev_n == n:
            # print(["fast",self.ev_n,self.ev_v])
            return self.ev_v
        if n < self.ev_n:
            # print(["faster",self.ev_n,self.ev_v])
            return self.ev_v >> (self.ev_n - n)
        nv = n // 2
        # print("--exp nv=%s--" % (nv))
        while True:
            av = self.a.ev(nv)
            # a's interval is weakly within 1/2^nv
            # of the exact value of a
            ainf = Fraction(av - 1, 1 << nv)
            asup = Fraction(av + 1, 1 << nv)
            # Do calculation
            a = RealExp._exp(ainf, asup, nv, n + 8)
            # print(["exp",nv,n,float(ainf),float(asup),float(a[0]),float(a[1])])
            # Calculate n-bit approximation of
            # the two bounds
            cinf = fracAreClose(a[0], a[1], n)
            if cinf != None:
                # In this case, cinf*ulp is strictly within 1 ulp of
                # both bounds, and thus strictly within 1 ulp
                # of the exact result
                self.ev_n = n
                self.ev_v = cinf
                return cinf
            nv += 2

class RealPow(Real):
    def __init__(self, a, b):
        self.a = a if isinstance(a, Real) else RealFraction(a)
        self.b = b if isinstance(b, Real) else RealFraction(b)
        self.r = RealExp(RealLn(self.a) * self.b)

    def __repr__(self):
        return "RealPow(%s,%s)" % (self.a, self.b)

    def ev(self, n):
        return self.r.ev(n)

class RealDivide(Real):
    def __init__(self, a, b):
        self.a = a if isinstance(a, Real) else RealFraction(a)
        self.b = b if isinstance(b, Real) else RealFraction(b)
        self.ev_n = -1
        self.ev_v = 0

    def __repr__(self):
        return "RealDivide(%s,%s)" % (self.a, self.b)

    def ev(self, n):
        # Use best approximation calculated so far
        # to save time when n is no greater than that
        # approximation's length.
        # NOTE: Because of this feature, ev(n) can return
        # inconsistent values across runs; all that it must do is
        # return an n-bit approximation to the true result, and
        # depending on the true result there may be one or
        # two correct answers.
        if self.ev_n == n:
            # print(["fast",self.ev_n,self.ev_v])
            return self.ev_v
        if n < self.ev_n:
            # print(["faster",self.ev_n,self.ev_v])
            return self.ev_v >> (self.ev_n - n)
        nv = n
        while True:
            av = self.a.ev(nv)  # div
            bv = self.b.ev(nv)  # div
            if abs(bv) < 2:
                nv += 4
                continue
            # a's interval is weakly within 1/2^nv
            # of the exact value of a
            onenv = 1 << nv
            ainf = Fraction(av - 1, onenv)
            asup = Fraction(av + 1, onenv)
            newsup = Fraction(onenv, bv - 1)
            newinf = Fraction(onenv, bv + 1)
            if av > 1 and bv > 1:
                a = ainf * newinf
                b = asup * newsup
                # Calculate n-bit approximation of
                # the two bounds
                cinf = fracAreClose(a, b, n)
            elif av < -1 and bv > 1:
                b = ainf * newsup
                c = asup * newinf
                # Calculate n-bit approximation of
                # the two bounds
                cinf = fracAreClose(b, c, n)
            else:
                # Do calculation
                a = ainf * newinf
                b = ainf * newsup
                c = asup * newinf
                d = asup * newsup
                # Calculate n-bit approximation of
                # the two bounds
                # print([av, bv, float(a), float(b), float(c), float(d)])
                cinf = fracAreClose(min([a, b, c, d]), max([a, b, c, d]), n)
            if cinf != None:
                # In this case, cinf*ulp is strictly within 1 ulp of
                # both bounds, and thus strictly within 1 ulp
                # of the exact result
                self.ev_n = n
                self.ev_v = cinf
                return cinf
            nv += 4

class RandPSRN(Real):
    # Constructive real operation
    # that takes a positive uniform PSRN with base-2
    # fractional digits as input.
    def __init__(self, a):
        if a[0] < 0:
            raise NotImplementedError("Negative PSRN not supported")
        self.psrn = a

    def __repr__(self):
        return "RandPSRN(%s)" % (self.psrn)

    def ev(self, n):
        bits = self.psrn[1]
        while len(self.psrn[2]) < n + 1:
            self.psrn[2].append(random.randint(0, 1))
        for i in range(n + 1):
            if self.psrn[2][i] == None:
                self.psrn[2][i] = random.randint(0, 1)
            bits = (bits << 1) | self.psrn[2][i]
        if bits & 1 == 1:
            # Rounding to ensure result has error strictly less
            # than 1 ulp (with probability one)
            bits = (bits >> 1) + 1
        else:
            bits = bits >> 1
        return bits

_realbits = 0

class RandUniform(Real):
    # Random uniform real number in the interval (0, 1).
    def __init__(self):
        self.bits = 0
        self.count = 0

    def __repr__(self):
        return "RandUniform(%s,%s)" % (self.bits, self.count)

    def ev(self, n):
        global _realbits
        n1 = n + 1
        if n1 > self.count:
            diff = n1 - self.count
            _realbits += diff
            self.bits = (self.bits << diff) + random.randint(0, (1 << diff) - 1)
            self.count = n1
        ret = self.bits >> (self.count - n)
        # Rounding to ensure result has error strictly less
        # than 1 ulp (with probability one)
        if (self.bits >> (self.count - n - 1)) & 1 == 1:
            ret += 1
        return ret

class RealFraction(Real):
    def __init__(self, a, b=None):
        if b != None:
            self.num = a
            self.den = b
            if self.den < 0:
                raise ValueError
        elif isinstance(a, int):
            self.num = a
            self.den = 1
        elif isinstance(a, Fraction):
            self.num = a.numerator
            self.den = a.denominator
        else:
            a = Fraction(a)
            self.num = a.numerator
            self.den = a.denominator

    def __repr__(self):
        return "RealFraction(%s)" % (Fraction(self.num, self.den))

    def ev(self, n):
        return fracEV(self.num, self.den, n)

class RealNegate(Real):
    def __init__(self, a):
        self.a = a if isinstance(a, Real) else RealFraction(a)

    def __repr__(self):
        return "RealNegate(%s)" % (self.a)

    def ev(self, n):
        return -self.a.ev(n)

class RealSubtract(Real):
    def __init__(self, a, b):
        self.a = a if isinstance(a, Real) else RealFraction(a)
        self.b = b if isinstance(b, Real) else RealFraction(b)

    def __repr__(self):
        return "RealSubtract(%s,%s)" % (self.a, self.b)

    def ev(self, n):
        r = self.a.ev(n + 2) - self.b.ev(n + 2)
        return (r // 4) + 1 if r % 4 >= 2 else (r // 4)

class RealAdd(Real):
    def __init__(self, a, b):
        self.a = a if isinstance(a, Real) else RealFraction(a)
        self.b = b if isinstance(b, Real) else RealFraction(b)
        self.ev_n = -1
        self.ev_v = 0

    def __repr__(self):
        return "RealAdd(%s,%s)" % (self.a, self.b)

    def ev(self, n):
        # Use best approximation calculated so far
        # to save time when n is no greater than that
        # approximation's length.
        # NOTE: Because of this feature, ev(n) can return
        # inconsistent values across runs; all that it must do is
        # return an n-bit approximation to the true result, and
        # depending on the true result there may be one or
        # two correct answers.
        if self.ev_n == n:
            return self.ev_v
        if n < self.ev_n:
            return self.ev_v >> (self.ev_n - n)
        r = self.a.ev(n + 2) + self.b.ev(n + 2)
        ret = (r // 4) + 1 if r % 4 >= 2 else (r // 4)
        self.ev_n = n
        self.ev_v = ret
        return ret

from interval import FInterval

ArcTanHTable = [
    0,
    294906490,
    137123709,
    67461703,
    33598225,
    16782680,
    8389290,
    4194389,
    2097162,
    1048577,
    524288,
    262144,
    131072,
    65536,
    32768,
    16384,
    8192,
    4096,
    2048,
    1024,
    512,
    256,
    128,
    64,
    32,
    16,
    8,
    4,
    2,
    1,
]

def _roundedshiftraw(a, shift):
    aa = abs(a)
    ret = aa >> shift
    frac = aa & ((1 << shift) - 1)
    # Divisor's least significant bit is even
    if frac > (1 << (shift - 1)) or (frac == (1 << (shift - 1)) and (ret & 1) == 1):
        ret += 1
    if a < 0:
        ret = -ret
    return ret

def logsmall(av, n):
    if n > 16 or av < 2:
        return None
    if av >= (1 << n):
        return None
    avminus = (av - 1) << (16 - n)
    avplus = (av + 1) << (16 - n)
    # Calculate crude log
    infcr = crudelog(avminus)
    supcr = crudelog(avplus)
    # Tolerance adjustment
    infcr = infcr - 2 if avminus <= 271 else infcr - 1
    supcr = supcr + 2 if avplus <= 271 else supcr + 1
    return (infcr, 65536, supcr, 65536)

def crudelog(av):
    # The CORDIC way to
    # calculate an approximation of the natural logarithm of av/2^_bits.
    # When _bits=16, crudelog is accurate to 2/2^16 for av in [1, 271],
    # and to 1/2^16 in [272, 65536].
    _bits = 16
    _logmin = (1 << _bits) * 15 // 100
    _log2bits = 45426
    _arcTanFrac = 29
    _arcTanBitDiff = _arcTanFrac - _bits
    if av <= 0:
        raise ValueError
    if av == 1 << _bits:
        return 0
    if av >= 1 << (_bits):
        return crudelog(av // 2) + _log2bits + 1
    if av < _logmin:
        return crudelog(av * 2) - _log2bits
    avx = av << _arcTanBitDiff
    rx = avx + (1 << _arcTanFrac)
    ry = avx - (1 << _arcTanFrac)
    rz = 0
    for i in range(1, len(ArcTanHTable)):
        iters = 2 if i == 4 or i == 13 else 1
        for m in range(iters):
            x = rx >> i
            y = ry >> i
            if ry <= 0:
                rx += y
                ry += x
                rz -= ArcTanHTable[i]
            else:
                rx -= y
                ry -= x
                rz += ArcTanHTable[i]
    return _roundedshiftraw(rz, _arcTanBitDiff - 1)

class RealLn(Real):
    def __init__(self, a):
        self.a = a if isinstance(a, Real) else RealFraction(a)
        self.ev_n = -1
        self.ev_v = 0
        self.nv_last = -1

    def __repr__(self):
        return "RealLn(%s)" % (self.a)

    def _log(infnum, infden, supnum, supden, n, bits):
        inf = RealLn._logbounds(infnum, infden, n, bits)
        sup = RealLn._logbounds(supnum, supden, n, bits)
        return (inf[0], inf[1], sup[2], sup[3])

    _logboundscache = {}

    def _logbounds(num, den, n, bits):
        # See interval arithmetic described in:
        # Daumas, M., Lester, D., Muñoz, C., "Verified Real Number Calculations:
        #  A Library for Interval Arithmetic", arXiv:0708.3721 [cs.MS], 2007.
        # Unfortunately, at least the arXiv version has some errors.
        bittol = bits * 2
        if num == 0 or den == 0 or (num < 0 and den > 0) or (den < 0 and num > 0):
            raise ValueError
        if num == den:
            return (0, 1, 0, 1)
        if num > den and num * 2 <= den * 3:  # ... and (num/den)<=1.5
            xmn = num - den
            xmd = den
            xva = xmn
            xvb = xmd
            # Numerator and denominator of lower bound
            va = 0
            vb = 1
            vtrunc = 0
            # print("--num=%s den=%s n=%d bits=%d--" % (num,den,n,bits))
            for i in range(1, 2 * n + 1):
                oldva = va
                oldvb = vb
                vc = xmn
                vd = xmd * i
                xmn *= xva
                xmd *= xvb
                if i % 2 == 0:
                    # Subtract from lower bound
                    ra = va * vd - vb * vc
                    rb = vb * vd
                    va = ra
                    vb = rb
                else:
                    # Add to lower bound
                    ra = va * vd + vb * vc
                    rb = vb * vd
                    va = ra
                    vb = rb
                # Truncate lower bound to mitigate "runaway" growth of
                # numerator and denominator
                if i % 4 == 0 or i == 2 * n:
                    va, vb, vtrunc = RealLn._truncateNumDen(va, vb, bittol, vtrunc)
            # print("--done--")
            # Calculate upper bound
            vc = xmn
            vd = xmd * (2 * n + 1)
            ua = va * vd + vb * vc
            ub = vb * vd
            # Add truncation error (vtrunc/2^bittol) to upper bound
            if vtrunc > 0:
                tua = ua * (1 << bittol) + ub * vtrunc
                tub = ub * (1 << bittol)
                ua = tua
                ub = tub
            return (va, vb, ua, ub)
        if num < den:
            bounds = RealLn._logbounds(den, num, n, bits)
            # NOTE: Correcting an error in arXiv version
            # of the paper
            # First two is infimum; last two is supremum
            return (-bounds[2], bounds[3], -bounds[0], bounds[1])
        # now, x>2
        # NOTE: Replacing 2 (used in paper) with 1.5, which leads to much
        # faster convergence
        m = 0
        xn = num
        xd = den
        while xn * 2 > xd * 3:  # (xn/xd)>1.5
            m += 1
            xn *= 2  # Denominator of 1.5
            xd *= 3  # Numerator of 1.5
        # print("m=%d n=%d"%(m,n))
        if not ((n, bits) in RealLn._logboundscache):
            # Find logbounds for 1.5 and given accuracy level
            # print(["logbounds",n,bits])
            lbc = RealLn._logbounds(3, 2, n, bits)
            l2inf = Fraction(lbc[0], lbc[1])
            l2sup = Fraction(lbc[2], lbc[3])
            RealLn._logboundscache[(n, bits)] = (l2inf, l2sup)
        l2 = RealLn._logboundscache[(n, bits)]
        ly = RealLn._logbounds(xn, xd, n, bits)
        lyinf = Fraction(ly[0], ly[1])
        lysup = Fraction(ly[2], ly[3])
        lower = m * l2[0] + lyinf
        upper = m * l2[1] + lysup
        return (lower.numerator, lower.denominator, upper.numerator, upper.denominator)

    def _truncateNumDen(infnum, infden, bittol, vtrunc):
        if infnum.bit_length() > bittol:
            ninf = infnum << bittol if infnum > 0 else infnum * 2 ** bittol
            ninf = (
                -int(abs(ninf) // abs(infden)) - 1
                if infnum < 0
                else int(abs(ninf) // abs(infden))
            )
            # vtrunc stores an upper bound on the truncation
            # error, which in this case
            # is no more than 2**bittol per call.
            return (ninf, 1 << bittol, vtrunc + 1)
        else:
            return (infnum, infden, vtrunc)

    def ev(self, n):
        # Use best approximation calculated so far
        # to save time when n is no greater than that
        # approximation's length.
        # NOTE: Because of this feature, ev(n) can return
        # inconsistent values across runs; all that it must do is
        # return an n-bit approximation to the true result, and
        # depending on the true result there may be one or
        # two correct answers.
        if self.ev_n == n:
            # print(["fast",self.ev_n,self.ev_v])
            return self.ev_v
        if n < self.ev_n:
            # print(["faster",self.ev_n,self.ev_v])
            return self.ev_v >> (self.ev_n - n)
        nv = n + 4
        # print("--ln nv=%s--" % (nv))
        while True:
            av = self.a.ev(nv)
            if av < 2:
                nv += 2
                continue
            sl = logsmall(av, nv)
            if sl != None:
                a = sl
            else:
                # Interval is weakly within 1/2^nv
                # of the exact value of a
                ainfnum = max(0, av - 1)
                ainfden = 1 << nv
                asupnum = av + 1
                asupden = 1 << nv
                # Do calculation
                a = RealLn._log(ainfnum, ainfden, asupnum, asupden, nv, n + 8)
            # if Fraction(ainfnum,ainfden)>Fraction(asupnum,asupden): raise ValueError
            # print([n,"nv",nv,"av",av,[float(Fraction(a[0],a[1])),
            #    float(Fraction(a[2],a[3]))],float(Fraction(a[2],a[3])-Fraction(a[0],a[1])),
            #   1/(1<<n)])
            # Calculate n-bit approximation of
            # the two bounds
            cinf = fracAreCloseND(a[0], a[1], a[2], a[3], n)
            if cinf != None:
                # In this case, cinf*ulp is strictly within 1 ulp of
                # both bounds, and thus strictly within 1 ulp
                # of the exact result
                self.ev_n = n
                self.ev_v = cinf
                self.nv_last = nv + 4
                return cinf
            nv += 2

def realFloor(a):
    if isinstance(a, RealFraction):
        # NOTE: Python's "//" operator does floor division
        return a.num // a.den
    n = 2
    while True:
        av = a.ev(n)
        mask = (1 << n) - 1
        avfrac = av & mask
        if avfrac != 0 and avfrac != mask:
            return av // (1 << n)
        n += 2

def realCeiling(a):
    if isinstance(a, RealFraction):
        # NOTE: Python's "//" operator does floor division
        return -((-a.num) // a.den)
    return -realFloor(RealNegate(a))

def realIsLess(a, b):
    n = 8
    while True:
        aa = a.ev(n)
        bb = b.ev(n)
        if bb + 1 <= aa:
            return False
        if bb - 2 >= aa:
            return True
        n += 8

def realIsNegative(a):
    n = 3
    while True:
        aa = a.ev(n)
        if 1 <= aa:
            return False
        if -2 >= aa:
            return True
        n += 2

def _truncatesup(sup, bits):
    nsup = sup * 2 ** bits
    nsup = int(nsup) if nsup < 0 else int(nsup) + 1
    return Fraction(nsup, 2 ** bits)

class RealSqrt(Real):
    def __init__(self, a):
        self.a = RealPow(a, Fraction(1, 2))

    def __repr__(self):
        return "RealSqrt(%s)" % (self.a)

    def ev(self, n):
        return self.a.ev(n)

class RealMultiply(Real):
    def __init__(self, a, b):
        self.a = a if isinstance(a, Real) else RealFraction(a)
        self.b = b if isinstance(b, Real) else RealFraction(b)
        self.ev_n = -1
        self.ev_v = 0

    def __repr__(self):
        return "RealMultiply(%s,%s)" % (self.a, self.b)

    def ev(self, n):
        # Use best approximation calculated so far
        # to save time when n is no greater than that
        # approximation's length.
        # NOTE: Because of this feature, ev(n) can return
        # inconsistent values across runs; all that it must do is
        # return an n-bit approximation to the true result, and
        # depending on the true result there may be one or
        # two correct answers.
        if self.ev_n == n:
            return self.ev_v
        if n < self.ev_n:
            return self.ev_v >> (self.ev_n - n)
        nv = n + 4
        while True:
            av = self.a.ev(nv)  # mul
            bv = self.b.ev(nv)  # mul
            if abs(av) < 2 or abs(bv) < 2:
                nv += 2
                continue
            # a's interval is weakly within 1/2^nv
            # of the exact value of a
            if av >= 2 and bv >= 2:
                a = (av - 1) * (bv - 1)
                b = (av + 1) * (bv + 1)
                onenv2 = 1 << (nv * 2)
                cinf = fracAreCloseND(a, onenv2, b, onenv2, n)
            elif av <= -2 and bv <= -2:
                av = abs(av)
                bv = abs(bv)
                a = (av - 1) * (bv - 1)
                b = (av + 1) * (bv + 1)
                onenv2 = 1 << (nv * 2)
                cinf = fracAreCloseND(a, onenv2, b, onenv2, n)
            elif av <= -2 or bv <= -2:
                av = abs(av)
                bv = abs(bv)
                a = -((av - 1) * (bv - 1))
                b = -((av + 1) * (bv + 1))
                onenv2 = 1 << (nv * 2)
                cinf = fracAreCloseND(b, onenv2, a, onenv2, n)
            else:
                # print([av,bv])
                onenv = 1 << nv
                ainf = Fraction(av - 1, onenv)
                asup = Fraction(av + 1, onenv)
                # b's interval is weakly within 1/2^nv
                # of the exact value of b
                binf = Fraction(bv - 1, onenv)
                bsup = Fraction(bv + 1, onenv)
                # Do calculation
                a = ainf * binf
                b = ainf * bsup
                c = asup * binf
                d = asup * bsup
                # print([a,b,c,d])
                # Calculate n-bit approximation of
                # the two bounds
                cinf = fracAreClose(min([a, b, c, d]), max([a, b, c, d]), n)
            if cinf != None:
                # In this case, cinf*ulp is strictly within 1 ulp of
                # both bounds, and thus strictly within 1 ulp
                # of the exact result
                self.ev_n = n
                self.ev_v = cinf
                return cinf
            nv += 6

REAL_858_1000 = RealFraction(Fraction(858, 1000))

def realNormalROU():
    # Generates a Gaussian random variate using
    # the ratio of uniforms method.
    while True:
        a = RandUniform()
        b = REAL_858_1000 * RandUniform()
        c = -a * a * 4 * RealLn(a)
        if realIsLess(b * b, c):
            if random.randint(0, 1) == 0:
                return -b / a
            return b / a

def fpNormalROU():
    # Generates a Gaussian random variate using
    # the ratio of uniforms method.
    while True:
        a = random.random()
        if a == 0:
            continue
        b = (858 / 1000) * random.random()
        c = -a * a * 4 * math.log(a)
        if b * b < c:
            if random.randint(0, 1) == 0:
                return -b / a
            return b / a

def realGamma(ml):
    # Generates a gamma random variate
    # using the Marsaglia--Tsang (2000) algorithm.
    d = ml
    v = RealFraction(0)
    if ml < 1:
        d += 1
    d = d - Fraction(1, 3)
    c = 1 / RealSqrt(9 * d)
    frac0_0331 = Fraction(331, 10000)
    while True:
        x = 0
        while True:
            x = realNormalROU()
            v = c * x + 1
            v = v * v * v
            if not realIsNegative(v):
                break
        u = RandUniform()
        x2 = x * x
        if realIsLess(u, 1 - (frac0_0331 * x2 * x2)):
            break
        if realIsLess(RealLn(u), x2 / 2 + (d * (1 - v + RealLn(v)))):
            break
    ret = d * v
    if ml < 1:
        ret = ret * RealPow(RandUniform(), Fraction(1, ml))
    return ret

######################

if __name__ == "__main__":

    # The following code tests some of the methods in this module.

    import scipy.stats as st

    def dobucket(v, bounds=None, allints=None):
        a = Fraction(min(v))
        b = Fraction(max(v))
        if bounds != None:
            a, b = bounds
        size = int(max(30, math.ceil(b - a)))
        if allints != True and allints != False:
            allints = True
            if size == 30:
                for x in v:
                    if int(x) != x:
                        allints = False
                        break
                if allints:
                    size = int(b - a)
            else:
                allints = False
        if allints:
            ls = [int(a + (b - a) * x / size) for x in range(size + 1)]
        else:
            ls = [a + (b - a) * (x / size) for x in range(size + 1)]
        buckets = [0 for i in range(size)]
        for x in v:
            for i in range(len(buckets)):
                if x >= ls[i] and x < ls[i + 1]:
                    buckets[i] += 1
                    break
        showbuckets(ls, buckets)
        return buckets

    def showbuckets(ls, buckets):
        mx = max(0.00000001, max(buckets))
        sumbuckets = max(0.00000001, sum(buckets))
        if mx == 0:
            return
        labels = [
            ("%0.5f %d [%f]" % (ls[i], buckets[i], buckets[i] * 1.0 / sumbuckets))
            if int(buckets[i]) == buckets[i]
            else ("%0.5f %f [%f]" % (ls[i], buckets[i], buckets[i] * 1.0 / sumbuckets))
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

    ru = RandUniform()
    ru.bits = 13316137426883106017001167244436327878983283970967943792329288895
    ru.count = 215
    ru = RealCos(RealMultiply(ru, RealPi(2)))
    ru.ev(17)
    ru = RandUniform()
    ru.bits = 12701413119756455176826198713937382767308938832267691531265144707
    ru.count = 213
    ru = RealCos(RealMultiply(ru, RealPi(2)))
    ru.ev(19)
    ru = RandUniform()
    ru.bits = 7777011677718951988093522150082782455248378071942131481561209356
    ru.count = 213
    ru = RealCos(RealMultiply(ru, RealPi(2)))
    ru.ev(17)

    def routest():
        rou = [realNormalROU().ev(52) / 2 ** 52 for i in range(10000)]
        # dobucket(rou)

    def routest2():
        rou = [fpNormalROU() for i in range(10000)]
        # dobucket(rou)

    def routest3(rg):
        # rou = [random.normalvariate(0,1) for i in range(10000)]
        rou = [psrnexpo(rg) for i in range(10000)]
        # dobucket(rou)

    def gammatest():
        for i in range(300):
            g = realGamma(1.3)
            print(g.ev(30) / 2 ** 30)

    import time
    import cProfile

    def ccos():
        return RandUniform() ** 8
        # while True:
        #    r = RandUniform()
        #    if realIsLess(RandUniform(), RealCos(r)):
        #        return r

    def routest():
        rou = [ccos().ev(52) / 2 ** 52 for i in range(10000)]
        dobucket(rou)

    def cpr():
        tm = time.time()
        cProfile.run("routest()")
        print(time.time() - tm)
        t1 = 0
        t2 = 0
        tm = time.time()
        routest()
        t1 = time.time() - tm
        tm = time.time()
        routest2()
        t2 = time.time() - tm
        print([t1, t2, "times slower:", t1 / t2])

    cpr()
    exit()

    ###################

    _havesympy = False

    def lntest(num, den):
        global _havesympy
        if not _havesympy:
            return
        frac = log(Fraction(num, den))
        rr = RealLn(Fraction(num, den))
        for n in list(range(0, 60)) + list(range(0, 60)):
            ret = rr.ev(n)
            if abs(Fraction(ret, 1 << n) - frac) >= Fraction(1, 1 << n):
                raise ValueError("ln %d/%d, n=%d, ret=%d" % (num, den, n, ret))

    def exptest(num, den):
        global _havesympy
        if not _havesympy:
            return
        frac = exp(Fraction(num, den))
        rr = RealExp(Fraction(num, den))
        for n in list(range(0, 60)) + list(range(0, 60)):
            ret = rr.ev(n)
            if abs(Fraction(ret, 1 << n) - frac) >= Fraction(1, 1 << n):
                raise ValueError("exp %d/%d, n=%d, ret=%d" % (num, den, n, ret))

    TWOPI = RealPi(2)

    def sincostest(num, den):
        global _havesympy
        if not _havesympy:
            return
        frac = sin(Fraction(num, den))
        rr = RealSin(Fraction(num, den))
        for n in list(range(0, 60)) + list(range(0, 60)):
            ret = rr.ev(n)
            if abs(Fraction(ret, 1 << n) - frac) >= Fraction(1, 1 << n):
                raise ValueError("sin %d/%d, n=%d, ret=%d" % (num, den, n, ret))
        frac = cos(Fraction(num, den))
        rr = RealCos(Fraction(num, den))
        for n in list(range(0, 60)) + list(range(0, 60)):
            try:
                ret = rr.ev(n)
            except:
                print("cos %d/%d, n=%d, ret=%d" % (num, den, n, ret))
                raise
            if abs(Fraction(ret, 1 << n) - frac) >= Fraction(1, 1 << n):
                raise ValueError("cos %d/%d, n=%d, ret=%d" % (num, den, n, ret))

    def rationaltest(num, den):
        frac = Fraction(num, den)
        rr = RealFraction(Fraction(num, den))
        for n in list(range(0, 60)) + list(range(0, 60)):
            ret = rr.ev(n)
            if abs(Fraction(ret, 1 << n) - frac) >= Fraction(1, 1 << n):
                raise ValueError("%d/%d, n=%d, ret=%d" % (num, den, n, ret))
        frac = -Fraction(num, den)
        rr = RealNegate(Fraction(num, den))
        for n in list(range(0, 60)) + list(range(0, 60)):
            ret = rr.ev(n)
            if abs(Fraction(ret, 1 << n) - frac) >= Fraction(1, 1 << n):
                raise ValueError("-%d/%d, n=%d, ret=%d" % (num, den, n, ret))

    def addmultiplytest(num, den, num2, den2):
        frac = Fraction(num, den) + Fraction(num2, den2)
        rr = RealAdd(Fraction(num, den), Fraction(num2, den2))
        for n in list(range(0, 60)) + list(range(0, 60)):
            ret = rr.ev(n)
            if abs(Fraction(ret, 1 << n) - frac) >= Fraction(1, 1 << n):
                raise ValueError(
                    "add(%d/%d, %d/%d) n=%d, ret=%d" % (num, den, num2, den2, n, ret)
                )
        frac = Fraction(num, den) - Fraction(num2, den2)
        rr = RealSubtract(Fraction(num, den), Fraction(num2, den2))

        for n in list(range(0, 60)) + list(range(0, 60)):
            ret = rr.ev(n)
            if abs(Fraction(ret, 1 << n) - frac) >= Fraction(1, 1 << n):
                raise ValueError(
                    "sub(%d/%d, %d/%d) n=%d, ret=%d" % (num, den, num2, den2, n, ret)
                )
        frac = Fraction(num, den) * Fraction(num2, den2)
        rr = RealMultiply(Fraction(num, den), Fraction(num2, den2))
        for n in list(range(0, 60)) + list(range(0, 60)):
            ret = rr.ev(n)
            if abs(Fraction(ret, 1 << n) - frac) >= Fraction(1, 1 << n):
                raise ValueError(
                    "mul(%d/%d, %d/%d) n=%d, ret=%d" % (num, den, num2, den2, n, ret)
                )

    def rutest(bits, count, ev2, ev3):
        ru = RandUniform()
        ru.bits = bits
        ru.count = count
        if ru.ev(2) != ev2:
            raise ValueError(ru.ev(2))
        if ru.ev(3) != ev3:
            raise ValueError(ru.ev(3))
        ru = RealFraction(Fraction(bits, 2 ** count))
        if ru.ev(2) != ev2:
            raise ValueError(ru.ev(2))
        if ru.ev(3) != ev3:
            raise ValueError(ru.ev(3))

    try:
        from sympy import log, sin, cos, exp

        _havesympy = True
    except:
        pass

    def randomrealtest():
        rutest(0x7F, 8, 2, 4)
        rutest(0x80, 8, 2, 4)
        rutest(0xFF, 8, 4, 8)
        rutest(0x3F, 8, 1, 2)
        rutest(0x40, 8, 1, 2)
        rutest(0x5F, 8, 1, 3)
        rutest(0x60, 8, 2, 3)
        ru = RealLn(Fraction(1752140, 4790796))
        ev = ru.ev(0)
        if ev != -1 and ev != -2:
            raise ValueError
        ru = RealCos(Fraction(0, 1))
        ev = ru.ev(0)
        if ev != 1:
            raise ValueError
        ev = ru.ev(100)
        if ev != 1 << 100:
            raise ValueError
        for i in range(100):
            num = random.randint(1, 10000000)
            den = random.randint(1, 10000000)
            lntest(num, den)
        for i in range(30000):
            num = random.randint(-10000000, 10000000)
            den = random.randint(1, 10000000)
            rationaltest(num, den)
        for i in range(30000):
            num = random.randint(-10000000, 10000000)
            den = random.randint(1, 10000000)
            num2 = random.randint(-10000000, 10000000)
            den2 = random.randint(1, 10000000)
            addmultiplytest(num, den, num2, den2)
        for i in range(300):
            num = random.randint(0, 62700000)
            den = 10000000
            sincostest(num, den)
            num = random.randint(0, 62700)
            den = 10000
            sincostest(num, den)
        for i in range(300):
            num = random.randint(-100000000, 100000000)
            den = 10000000
            exptest(num, den)
        sincostest(102900, 65536)
        sincostest(102943, 65536)
        sincostest(102944, 65536)

    randomrealtest()
    exit()

    ###################

    def _readpsrn(rg, asign, aint, afrac, digits=2, minprec=None):
        af = 0.0
        prec = len(afrac)
        if asign != -1 and asign != 1:
            raise ValueError
        if minprec != None:
            prec = max(minprec, prec)
        for i in range(prec):
            if i >= len(afrac):
                afrac.append(None)
            if afrac[i] == None:
                afrac[i] = rg.rndint(digits - 1)
            af += afrac[i] * digits ** (-i - 1)
        ret = af + aint
        if ret < 0:
            raise ValueError
        if asign < 0:
            ret = -ret
        return ret

    def _readpsrnend(rg, asign, aint, afrac, digits=2, minprec=None):
        af = 0.0
        prec = len(afrac)
        if asign != -1 and asign != 1:
            raise ValueError
        if minprec != None:
            prec = max(minprec, prec)
        for i in range(prec):
            if i >= len(afrac):
                afrac.append(None)
            if afrac[i] == None:
                afrac[i] = rg.rndint(digits - 1)
            af += afrac[i] * digits ** (-i - 1)
        # Add endpoint
        af += 1 * digits ** (-(prec - 1) - 1)
        ret = af + aint
        if ret < 0:
            raise ValueError
        if asign < 0:
            ret = -ret
        return ret

    def _readpsrn2(rg, psrn, digits=2, minprec=None):
        if minprec == None:
            return _readpsrn(rg, psrn[0], psrn[1], psrn[2], digits, minprec)
        else:
            return psrn_fill(rg, psrn, digits=digits, precision=minprec)

    def _readpsrnend2(rg, psrn, digits=2, minprec=None):
        return _readpsrnend(rg, psrn[0], psrn[1], psrn[2], digits, minprec)

    def random_psrn(rg, digits=2):
        asign = -1 if rg.randbit() == 0 else 1
        aint = rg.rndint(8)
        asize = rg.rndint(8)
        afrac = [rg.rndint(digits - 1) for i in range(asize)]
        return asign, aint, afrac

    def _rp(rg, a, digits=2):
        if a == None:
            return 0
        return _readpsrn2(rg, a, minprec=32, digits=digits)

    def psrn_add_fraction_test(rg, ps, pi, pf, frac, i=0, digits=2):
        pfc = [x for x in pf]
        pfcs = str(pfc)
        p = _readpsrn(rg, ps, pi, pf, digits=digits)
        p2 = _readpsrnend(rg, ps, pi, pf, digits=digits)
        mult = psrn_add_fraction(rg, [ps, pi, pf], frac, digits=digits)
        if mult == None:
            print(
                "    psrn_add_fraction_test(%d,%d,%s, Fraction(%d,%d)) # No mult"
                % (ps, pi, pfc, frac.numerator, frac.denominator)
            )
            return
        q = float(frac)
        q2 = float(frac)
        ms, mi, mf = mult
        m = _readpsrn2(rg, mult, minprec=32, digits=digits)
        mn = min(p + q, p2 + q, p + q2, p2 + q2)
        mx = max(p + q, p2 + q, p + q2, p2 + q2)
        if mn > mx:
            raise ValueError
        if m < mn or m > mx:
            print("    # %s" % str(["add", p, q, mn, mx, "m", m]))
            print(
                "    psrn_add_fraction_test(%d,%d,%s, Fraction(%d,%d),digits=%d) # Out of range"
                % (ps, pi, pfc, frac.numerator, frac.denominator, digits)
            )
            return
        if i < 10:
            _test_rand_extraction(
                rg,
                lambda rg: psrn_add_fraction(
                    rg, [ps, pi, [x for x in pfc]], frac, digits=digits
                ),
                digits=digits,
            )
            sample1 = [random.uniform(p, p2) + q for _ in range(2000)]
            sample2 = [
                psrn_add_fraction(rg, [ps, pi, [x for x in pfc]], frac, digits=digits)
                for _ in range(2000)
            ]
            sample2 = [
                _rp(
                    rg,
                    v,
                    digits=digits,
                )
                for v in sample2
            ]
            ks = st.ks_2samp(sample1, sample2)
            if str(pfc) != pfcs:
                raise ValueError
            if ks.pvalue < 1e-6:
                print(
                    "    psrn_add_fraction_test(%d,%d,%s, Fraction(%d,%d),digits=%d)"
                    % (ps, pi, pfc, frac.numerator, frac.denominator, digits)
                )
                print("    # %s - %s" % (mn, mx))
                print("    # exp. range about %s - %s" % (min(sample1), max(sample1)))
                print("    # act. range about %s - %s" % (min(sample2), max(sample2)))
                dobucket(sample1)
                dobucket(sample2)

    def psrn_in_range_test(rg, frac1, frac2, i=0, digits=2):
        f1 = min(frac1, frac2)
        f2 = max(frac1, frac2)
        if f1 == f2:
            try:
                psrn_in_range(rg, f1, f2, digits=digits)
            except:
                pass
            return
        mult = psrn_in_range(rg, f1, f2, digits=digits)
        m = _readpsrn2(rg, mult, minprec=32, digits=digits)
        # print([mult,m,"f1",float(f1),float(f2)])
        if m < f1 or m > f2:
            raise ValueError
        if i < 100:
            _test_rand_extraction(
                rg, lambda rg: psrn_in_range(rg, f1, f2, digits=digits), digits=digits
            )
            sample1 = [random.uniform(float(f1), float(f2)) for _ in range(2000)]
            sample2 = [
                _readpsrn2(
                    rg,
                    psrn_in_range(rg, f1, f2, digits=digits),
                    minprec=32,
                    digits=digits,
                )
                for _ in range(2000)
            ]
            ks = st.ks_2samp(sample1, sample2)
            if ks.pvalue < 1e-6:
                print(
                    "    psrn_in_range_test(Fraction(%d,%d),Fraction(%d,%d),digits=%d)"
                    % (
                        f1.numerator,
                        f1.denominator,
                        f2.numerator,
                        f2.denominator,
                        digits,
                    )
                )
                print(ks)
                print("    # %s - %s" % (min(sample1), max(sample1)))
                print("    # %s - %s" % (min(sample2), max(sample2)))
                dobucket(sample1)
                dobucket(sample2)

    def psrn_multiply_by_fraction_test(rg, ps, pi, pf, frac, i=0, digits=2):
        pfc = [x for x in pf]
        pfcs = str(pfc)
        p = _readpsrn(rg, ps, pi, pf, digits=digits)
        p2 = _readpsrnend(rg, ps, pi, pf, digits=digits)
        mult = psrn_multiply_by_fraction(rg, [ps, pi, pf], frac, digits=digits)
        q = float(frac)
        q2 = float(frac)
        ms, mi, mf = mult
        m = _readpsrn2(rg, mult, minprec=32, digits=digits)
        mn = min(p * q, p2 * q, p * q2, p2 * q2)
        mx = max(p * q, p2 * q, p * q2, p2 * q2)
        if mn > mx:
            raise ValueError
        if m < mn or m > mx:
            print(["mult", p, q, mn, mx, "m", m])
            raise ValueError
        if i < 10:
            _test_rand_extraction(
                rg,
                lambda rg: psrn_multiply_by_fraction(
                    rg, [ps, pi, [x for x in pfc]], frac, digits=digits
                ),
                digits=digits,
            )
            sample1 = [random.uniform(p, p2) * q for _ in range(2000)]
            sample2 = [
                _readpsrn2(
                    rg,
                    psrn_multiply_by_fraction(
                        rg, [ps, pi, [x for x in pfc]], frac, digits=digits
                    ),
                    minprec=32,
                    digits=digits,
                )
                for _ in range(2000)
            ]
            ks = st.ks_2samp(sample1, sample2)
            if str(pfc) != pfcs:
                raise ValueError
            if ks.pvalue < 1e-6:
                print(
                    "    psrn_multiply_by_fraction_test(%d,%d,%s, Fraction(%d,%d),digits=%d)"
                    % (ps, pi, pfc, frac.numerator, frac.denominator, digits)
                )
                print(ks)
                print("    # p=%s p2=%s q=%s" % (p, p2, q))
                print("    # %s - %s" % (min(sample1), max(sample1)))
                print("    # %s - %s" % (min(sample2), max(sample2)))

    def psrn_reciprocal_test(rg, ps, pi, pf, i=0, digits=2):
        pfc = [x for x in pf]
        pfcs = str(pfc)
        p = _readpsrn(rg, ps, pi, pf, digits=digits)
        p2 = _readpsrnend(rg, ps, pi, pf, digits=digits)
        if p == 0:
            p = 1e-10 if ps > 0 else -1e-10
        if p2 == 0:
            p2 = 1e-10 if ps > 0 else -1e-10
        mult = psrn_reciprocal(rg, [ps, pi, pf], digits=digits)
        ms, mi, mf = mult
        m = _readpsrn2(rg, mult, minprec=32, digits=digits)
        mn = min(1 / p, 1 / p2)
        mx = max(1 / p, 1 / p2)
        if mn > mx:
            raise ValueError
        if m < mn or m > mx:
            print(["recip", p, mn, mx, "m", m])
            raise ValueError
        if i < 20:
            _test_rand_extraction(
                rg,
                lambda rg: psrn_reciprocal(
                    rg, [ps, pi, [x for x in pfc]], digits=digits
                ),
                digits=digits,
            )
            count = 2000
            sample1 = [1 / random.uniform(p, p2) for _ in range(count)]
            sample2 = [
                _readpsrn2(
                    rg,
                    psrn_reciprocal(rg, [ps, pi, [x for x in pfc]], digits=digits),
                    minprec=32,
                    digits=digits,
                )
                for _ in range(count)
            ]
            ks = st.ks_2samp(sample1, sample2)
            if str(pfc) != pfcs:
                raise ValueError
            if ks.pvalue < 1e-6:
                print(
                    "    psrn_reciprocal_test(%d,%d,%s, digits=%d)"
                    % (ps, pi, pfc, digits)
                )
                print(ks)
                print("    # p=%s p2=%s" % (p, p2))
                print("    # %s - %s" % (min(sample1), max(sample1)))
                print("    # %s - %s" % (min(sample2), max(sample2)))
                dobucket(sample1)
                dobucket(sample2)

    def psrn_add_psrns_test(rg, ps, pi, pf, qs, qi, qf, i=0, digits=2):
        pfc = [x for x in pf]
        qfc = [x for x in qf]
        psrn1 = [ps, pi, pf]
        psrn2 = [qs, qi, qf]
        p = _readpsrn2(rg, psrn1, digits=digits)
        p2 = _readpsrnend2(rg, psrn1, digits=digits)
        q = _readpsrn2(rg, psrn2, digits=digits)
        q2 = _readpsrnend2(rg, psrn2, digits=digits)
        mult = psrn_add(rg, psrn1, psrn2, digits=digits)
        ms, mi, mf = mult
        m = _readpsrn2(rg, [ms, mi, mf], minprec=32, digits=digits)
        mn = min(p + q, p2 + q, p + q2, p2 + q2)
        mx = max(p + q, p2 + q, p + q2, p2 + q2)
        if mn > mx:
            raise ValueError
        if m < mn or m > mx:
            print(
                "    psrn_add_psrns_test(%d,%d,%s,%d,%d,%s,digits=%d)"
                % (ps, pi, pfc, qs, qi, qfc, digits)
            )
            return
        if i < 50:
            _test_rand_extraction(
                rg,
                lambda rg: psrn_add(
                    rg,
                    [ps, pi, [x for x in pfc]],
                    [qs, qi, [x for x in qfc]],
                    digits=digits,
                ),
                digits=digits,
            )
            sample1 = [
                random.uniform(p, p2) + random.uniform(q, q2) for _ in range(2000)
            ]
            sample2 = [
                _readpsrn2(
                    rg,
                    psrn_add(
                        rg,
                        [ps, pi, [x for x in pfc]],
                        [qs, qi, [x for x in qfc]],
                        digits=digits,
                    ),
                    minprec=32,
                    digits=digits,
                )
                for _ in range(2000)
            ]
            ks = st.ks_2samp(sample1, sample2)
            if ks.pvalue < 1e-6:
                print(
                    "    psrn_add_psrns_test(%d,%d,%s,%d,%d,%s,digits=%d)"
                    % (ps, pi, pfc, qs, qi, qfc, digits)
                )
                print("    # %s - %s" % (mn, mx))
                print("    # exp. range about %s - %s" % (min(sample1), max(sample1)))
                print("    # act. range about %s - %s" % (min(sample2), max(sample2)))
                dobucket(sample1)
                dobucket(sample2)

    def psrn_multiply_test(rg, ps, pi, pf, qs, qi, qf, i=0, digits=2, count=3000):
        pfc = [x for x in pf]
        qfc = [x for x in qf]
        psrn1 = [ps, pi, pf]
        psrn2 = [qs, qi, qf]
        p = _readpsrn2(rg, psrn1, digits=digits)
        p2 = _readpsrnend2(rg, psrn1, digits=digits)
        q = _readpsrn2(rg, psrn2, digits=digits)
        q2 = _readpsrnend2(rg, psrn2, digits=digits)
        mult = psrn_multiply(rg, psrn1, psrn2, digits=digits)
        print(
            "    # Start psrn_multiply_test(%d,%d,%s,%d,%d,%s,digits=%d)"
            % (ps, pi, pfc, qs, qi, qfc, digits)
        )
        if mult == None:
            print(
                "    psrn_multiply(%d,%d,%s,%d,%d,%s,digits=%d)"
                % (ps, pi, pfc, qs, qi, qfc, digits)
            )
            return
        ms, mi, mf = mult
        m = _readpsrn2(rg, [ms, mi, mf], minprec=32, digits=digits)
        mn = min(p * q, p2 * q, p * q2, p2 * q2)
        mx = max(p * q, p2 * q, p * q2, p2 * q2)
        if mn > mx:
            raise ValueError
        if m < mn or m > mx:
            print(["mult", "p", p, p2, "q", q, q2, "m", mn, m, mx])
            print(["p1", psrn1])
            print(["p2", psrn2])
            raise ValueError
        if i < 100:
            _test_rand_extraction(
                rg,
                lambda rg: psrn_multiply(
                    rg,
                    [ps, pi, [x for x in pfc]],
                    [qs, qi, [x for x in qfc]],
                    digits=digits,
                ),
                digits=digits,
            )
            sample1 = [
                random.uniform(min(p, p2), max(p, p2))
                * random.uniform(min(q, q2), max(q, q2))
                for _ in range(count * 10)
            ]
            fullsample1 = sample1
            sample2 = [
                psrn_multiply(
                    rg,
                    [ps, pi, [x for x in pfc]],
                    [qs, qi, [x for x in qfc]],
                    digits=digits,
                )
                for _ in range(count)
            ]

            def compact(c):
                r = []
                for v in c:
                    if v != None:
                        r.append(v)
                return r

            sample2 = compact(sample2)
            if len(sample2) == 0:
                print(
                    "    psrn_multiply_test(%d,%d,%s,%d,%d,%s,digits=%d) # empty"
                    % (ps, pi, pfc, qs, qi, qfc, digits)
                )
                return
            sample1 = sample1[: len(sample2)]
            sample2 = [
                _rp(
                    rg,
                    v,
                    digits=digits,
                )
                for v in sample2
            ]
            ks = st.ks_2samp(sample1, sample2)
            if ks.pvalue < 1e-6:
                print(
                    "    psrn_multiply_test(%d,%d,%s,%d,%d,%s,digits=%d)"
                    % (ps, pi, pfc, qs, qi, qfc, digits)
                )
                if True:
                    print("    # %s - %s" % (mn, mx))
                    print(
                        "    # exp. range about %s - %s" % (min(sample1), max(sample1))
                    )
                    print(
                        "    # act. range about %s - %s" % (min(sample2), max(sample2))
                    )
                    print([p, p2, q, q2])
                    print("Expected:")
                    dobucket(fullsample1)
                    print("Actual:")
                    dobucket(sample2)

    def psrn_expo_test(rg):
        sample1 = [random.expovariate(1) for i in range(10000)]
        sample2 = [psrn_fill(rg, psrnexpo(rg)) for i in range(10000)]
        ks = st.ks_2samp(sample1, sample2)
        if ks.pvalue < 1e-6:
            print("    psrn_expo_test()")
            print("    # exp. range about %s - %s" % (min(sample1), max(sample1)))
            print("    # act. range about %s - %s" % (min(sample2), max(sample2)))
            dobucket(sample1)
            dobucket(sample2)

    bern = bernoulli.Bernoulli()
    rg = randomgen.RandomGen()

    # More tests.
    for d in [2, 3, 10, 5]:
        psrn_multiply_test(rg, -1, 8, [0, 0, 0, 1, 1, 1], -1, 0, [0, 0, 0, 0], digits=d)
        psrn_multiply_test(
            rg, -1, 8, [0, 0, 0, 1, 1, 1], -1, 0, [0, 0, 0, 0, 0, 0], digits=d
        )
        psrn_multiply_test(rg, 1, 8, [0, 0, 0, 1, 1, 1], 1, 0, [0, 0, 0, 0], digits=d)
        psrn_multiply_test(
            rg, 1, 8, [0, 0, 0, 1, 1, 1], 1, 0, [0, 0, 0, 0, 0, 0], digits=d
        )
        psrn_multiply_test(
            rg, -1, 8, [0, 0, 0, 1, 1, 1], -1, 0, [0, 0, 0, 0, 1, 1], digits=d
        )
        psrn_multiply_test(
            rg, -1, 8, [0, 0, 0, 1, 1, 1], -1, 0, [0, 0, 0, 0, 0, 1], digits=d
        )
        psrn_multiply_test(
            rg, -1, 8, [0, 0, 0, 1, 1, 1], -1, 0, [0, 0, 0, 0, 1, 0], digits=d
        )

    psrn_expo_test(rg)

    sample1 = []
    sample2 = []
    for i in range(3000):
        digits = 2
        ps = [1, 0, []]
        ps2 = psrn_multiply_by_fraction(rg, ps, 82.4)
        ps2 = psrn_multiply_by_fraction(rg, ps2, (73.2 / 82.4))
        ps2 = psrn_multiply_by_fraction(rg, ps2, 28.7 / 73.2)
        m1 = _readpsrn2(rg, ps2, minprec=32, digits=digits)
        m2 = random.random() * 28.7
        sample1.append(m1)
        sample2.append(m2)

    ks = st.ks_2samp(sample1, sample2)
    if ks.pvalue < 1e-6:
        print(ks)
        print("    # exp. range about %s - %s" % (min(sample1), max(sample1)))
        print("    # act. range about %s - %s" % (min(sample2), max(sample2)))
        dobucket(sample1)
        dobucket(sample2)

    psrn_add_fraction_test(rg, 1, 0, [], Fraction(-1, 1), digits=2)
    psrn_add_fraction_test(rg, 1, 0, [], Fraction(-1, 1), digits=10)
    psrn_add_fraction_test(rg, 1, 0, [], Fraction(-2, 1), digits=2)
    psrn_add_fraction_test(rg, 1, 0, [], Fraction(-2, 1), digits=10)

    psrn_multiply_test(rg, -1, 3, [], -1, 4, [], digits=2)
    psrn_multiply_test(rg, -1, 0, [], -1, 0, [], digits=2)
    psrn_multiply_test(rg, -1, 0, [], -1, 0, [0], digits=2)
    psrn_multiply_test(rg, -1, 0, [0], -1, 0, [0], digits=2)
    psrn_multiply_test(rg, -1, 0, [0], -1, 0, [0, 0], digits=2)
    psrn_multiply_test(rg, -1, 0, [0, 0], -1, 0, [0, 0], digits=2)
    psrn_multiply_test(rg, -1, 5, [], 1, 2, [], digits=3)
    psrn_multiply_test(rg, -1, 2, [], 1, 2, [], digits=10)
    psrn_multiply_test(rg, 1, 5, [], 1, 6, [], digits=10)
    # Additional tests
    psrn_multiply_test(rg, -1, 5, [], 1, 2, [], digits=2)
    psrn_multiply_test(rg, -1, 2, [], 1, 2, [], digits=2)
    psrn_multiply_test(rg, 1, 5, [], 1, 6, [], digits=2)
    psrn_multiply_test(rg, -1, 5, [], 1, 2, [], digits=10)
    psrn_multiply_test(rg, -1, 2, [], 1, 2, [], digits=10)
    psrn_multiply_test(rg, 1, 5, [], 1, 6, [], digits=3)

    for digits in [2, 3, 10, 5, 16]:
        psrn_in_range_test(rg, Fraction(-9, 11), Fraction(1, 23), digits=2)
        psrn_in_range_test(rg, Fraction(-25, 21), Fraction(13, 3), digits=2)
        psrn_in_range_test(rg, Fraction(-7, 18), Fraction(11, 17), digits=2)
        psrn_in_range_test(rg, Fraction(-6, 23), Fraction(13, 27), digits=2)
        psrn_in_range_test(rg, Fraction(-7, 26), Fraction(5, 7), digits=3)

        for i in range(1000):
            ps, pi, pf = random_psrn(rg, digits=digits)
            frac = Fraction(rg.rndint(32), 1 + rg.rndint(31))
            frac2 = Fraction(rg.rndint(32), 1 + rg.rndint(31))
            if rg.randbit() == 0:
                frac = -frac
            if rg.randbit() == 0:
                frac2 = -frac2
            psrn_in_range_test(rg, frac, frac2, i, digits=digits)

        for i in range(1000):
            ps, pi, pf = random_psrn(rg, digits=digits)
            frac = Fraction(1 + rg.rndint(8), 1 + rg.rndint(8))
            if rg.randbit() == 0:
                frac = -frac
            psrn_add_fraction_test(rg, ps, pi, pf, frac, i, digits=digits)

        psrn_add_psrns_test(rg, 1, 1, [0], -1, 1, [0, 0, 1], digits=digits)
        # Specific tests with output ranges that straddle zero
        psrn_add_psrns_test(rg, -1, 8, [1, 0, 0], 1, 8, [1, 0, 0], digits=digits)
        psrn_add_psrns_test(rg, -1, 6, [1], 1, 6, [], digits=digits)
        psrn_add_psrns_test(rg, -1, 7, [], 1, 7, [0], digits=digits)
        psrn_add_psrns_test(rg, -1, 5, [1, 1], 1, 5, [], digits=digits)
        psrn_add_psrns_test(rg, 1, 5, [0], -1, 5, [], digits=digits)
        psrn_add_psrns_test(rg, 1, 2, [1, 0], -1, 2, [1], digits=digits)
        psrn_add_psrns_test(rg, -1, 4, [], 1, 4, [], digits=digits)
        psrn_add_psrns_test(rg, 1, 4, [1, 0], -1, 4, [], digits=digits)
        psrn_add_psrns_test(rg, -1, 7, [], 1, 7, [1], digits=digits)

        for i in range(1000):
            ps, pi, pf = random_psrn(rg, digits=digits)
            qs, qi, qf = random_psrn(rg, digits=digits)
            psrn_add_psrns_test(rg, ps, pi, pf, qs, qi, qf, i, digits=digits)

        for i in range(1000):
            ps, pi, pf = random_psrn(rg, digits=digits)
            qs, qi, qf = random_psrn(rg, digits=digits)
            psrn_multiply_test(rg, ps, pi, pf, qs, qi, qf, i, digits=digits)

        for i in range(200):
            ps, pi, pf = random_psrn(rg, digits=digits)
            pi = 0
            psrn_reciprocal_test(rg, ps, pi, pf, i, digits=digits)

        for i in range(1000):
            ps, pi, pf = random_psrn(rg, digits=digits)
            psrn_reciprocal_test(rg, ps, pi, pf, i, digits=digits)

        psrn_multiply_by_fraction_test(
            rg, -1, 5, [0, 1, 0, 0, 0, 0, 1], Fraction(-7, 2), digits=digits
        )
        psrn_multiply_by_fraction_test(
            rg, -1, 0, [0, 1, 0, 1, 1, 0, 0, 0], Fraction(-1, 4), digits=digits
        )
        psrn_multiply_by_fraction_test(
            rg, 1, 0, [0, 1, 1, 0, 1, 1], Fraction(7, 4), digits=digits
        )
        psrn_multiply_by_fraction_test(
            rg, -1, 2, [1, 1, 0, 1, 0, 0, 1, 1], Fraction(7, 8), digits=digits
        )
        psrn_multiply_by_fraction_test(rg, 1, 1, [0], Fraction(-4, 1), digits=digits)
        psrn_multiply_by_fraction_test(
            rg, 1, 6, [1, 1, 1, 0, 0], Fraction(-1, 1), digits=digits
        )
        psrn_multiply_by_fraction_test(rg, 1, 1, [], Fraction(-2, 7), digits=digits)

        psrn_multiply_test(rg, -1, 0, [], -1, 0, [], digits=digits)
        psrn_multiply_test(rg, -1, 0, [0], -1, 0, [], digits=digits)
        psrn_multiply_test(rg, -1, 0, [], -1, 0, [0], digits=digits)
        psrn_multiply_test(rg, -1, 0, [0], -1, 0, [0], digits=digits)
        psrn_multiply_test(rg, -1, 0, [0, 0], -1, 0, [0], digits=digits)
        psrn_multiply_test(rg, -1, 0, [0], -1, 0, [0, 0], digits=digits)
        psrn_multiply_test(rg, -1, 0, [0, 0], -1, 0, [0, 0], digits=digits)

        for i in range(1000):
            ps, pi, pf = random_psrn(rg, digits=digits)
            frac = Fraction(1 + rg.rndint(31), 1 + rg.rndint(31))
            if rg.randbit() == 0:
                frac = -frac
            psrn_multiply_by_fraction_test(rg, ps, pi, pf, frac, i, digits=digits)

        psrn_add_fraction_test(
            rg, -1, 5, [0, 1, 0, 1, 0, 0, 0, 0], Fraction(-2, 3), digits=digits
        )
        psrn_add_fraction_test(rg, -1, 8, [], Fraction(7, 4), digits=digits)
        psrn_add_fraction_test(
            rg, 1, 0, [1, 1, 1, 1, 0, 0, 0, 1], Fraction(-6, 7), digits=digits
        )
        psrn_add_fraction_test(
            rg, -1, 2, [0, 0, 0, 0, 1, 0], Fraction(1, 3), digits=digits
        )
        psrn_add_fraction_test(
            rg, -1, 0, [0, 1, 0, 0, 1, 0], Fraction(4, 9), digits=digits
        )

        psrn_add_fraction_test(rg, -1, 0, [0, 1, 0, 1], Fraction(-9, 5), digits=digits)
        psrn_add_fraction_test(
            rg, 1, 1, [0, 0, 1, 0, 1, 1], Fraction(-3, 7), digits=digits
        )
        psrn_add_fraction_test(rg, 1, 4, [], Fraction(1, 2), digits=digits)
        psrn_add_fraction_test(rg, 1, 1, [], Fraction(-9, 2), digits=digits)
        psrn_add_fraction_test(rg, 1, 6, [], Fraction(7, 3), digits=digits)
        psrn_add_fraction_test(
            rg, 1, 5, [0, 0, 0, 0, 1, 1], Fraction(1, 3), digits=digits
        )
        psrn_add_fraction_test(rg, -1, 4, [], Fraction(-9, 8), digits=digits)
