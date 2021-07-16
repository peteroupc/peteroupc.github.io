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
    # Perform multiplication
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


def psrn_multiply(rg, psrn1, psrn2, digits=2):
    """Multiplies two uniform partially-sampled random numbers.
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
    # Perform multiplication
    frac1 = psrn1[1]
    frac2 = psrn2[1]
    for i in range(digitcount):
        frac1 = frac1 * digits + psrn1[2][i]
    for i in range(digitcount):
        frac2 = frac2 * digits + psrn2[2][i]
    while frac1 == 0 and frac2 == 0:
        # Avoid degenerate cases
        d1 = rg.rndint(digits - 1)
        psrn1[2].append(d1)
        d2 = rg.rndint(digits - 1)
        psrn2[2].append(d2)
        frac1 = frac1 * digits + d1
        frac2 = frac2 * digits + d2
        digitcount += 1
    small = frac1 * frac2
    mid1 = frac1 * (frac2 + 1)
    mid2 = (frac1 + 1) * frac2
    large = (frac1 + 1) * (frac2 + 1)
    midmin = min(mid1, mid2)
    midmax = max(mid1, mid2)
    cpsrn = [1, 0, [0 for i in range(digitcount * 2)]]
    cpsrn[0] = psrn1[0] * psrn2[0]
    while True:
        rv = rg.rndint(large - small - 1)
        if rv < midmin - small:
            # Left side of product density; rising triangular
            pw = rv
            newdigits = 0
            b = midmin - small
            y = rg.rndint(b - 1)
            while True:
                if y < pw:
                    # Success
                    sret = small * (digits ** newdigits) + pw
                    for i in range(digitcount * 2 + newdigits):
                        idx = (digitcount * 2 + newdigits) - 1 - i
                        while idx >= len(cpsrn[2]):
                            cpsrn[2].append(None)
                        cpsrn[2][idx] = sret % digits
                        sret //= digits
                    cpsrn[1] = sret
                    return cpsrn
                elif y > pw + 1:  # Greater than upper bound
                    # Rejected
                    break
                pw = pw * digits + rg.rndint(digits - 1)
                y = y * digits + rg.rndint(digits - 1)
                b *= digits
                newdigits += 1
        elif rv >= midmax - small:
            # Right side of product density; falling triangular
            pw = rv - (midmax - small)
            newdigits = 0
            b = large - midmax
            y = rg.rndint(b - 1)
            while True:
                lowerbound = b - 1 - pw
                if y < lowerbound:
                    # Success
                    sret = midmax * (digits ** newdigits) + pw
                    for i in range(digitcount * 2 + newdigits):
                        idx = (digitcount * 2 + newdigits) - 1 - i
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
        else:
            # Middle, or uniform, part of product density
            sret = small + rv
            for i in range(digitcount * 2):
                cpsrn[2][digitcount * 2 - 1 - i] = sret % digits
                sret //= digits
            cpsrn[1] = sret
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


def _test_rand_extraction(func, digits=2, nofill=False):

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
    # Simulates the number of random numbers
    # in [0,1] needed to produce a sum greater than 1.
    pa = psrn_new_01()
    i = 1
    while True:
        pa = psrn_add(rg, pa, psrn_new_01())
        i += 1
        if pa[1] > 0:
            break
    return i


if __name__ == "__main__":
    # The following code tests some of the methods in this module.

    import scipy.stats as st
    import math

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
                lambda rg: psrn_add_fraction(
                    rg, [ps, pi, [x for x in pfc]], frac, digits=digits
                ),
                digits=digits,
            )
            sample1 = [random.uniform(p, p2) + q for _ in range(2000)]
            sample2 = [
                _rp(
                    rg,
                    psrn_add_fraction(
                        rg, [ps, pi, [x for x in pfc]], frac, digits=digits
                    ),
                    digits=digits,
                )
                for _ in range(2000)
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
                lambda rg: psrn_in_range(rg, f1, f2, digits=digits), digits=digits
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

    def psrn_multiply_test(rg, ps, pi, pf, qs, qi, qf, i=0, digits=2):
        pfc = [x for x in pf]
        qfc = [x for x in qf]
        psrn1 = [ps, pi, pf]
        psrn2 = [qs, qi, qf]
        p = _readpsrn2(rg, psrn1, digits=digits)
        p2 = _readpsrnend2(rg, psrn1, digits=digits)
        q = _readpsrn2(rg, psrn2, digits=digits)
        q2 = _readpsrnend2(rg, psrn2, digits=digits)
        mult = psrn_multiply(rg, psrn1, psrn2, digits=digits)
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
                lambda rg: psrn_multiply(
                    rg,
                    [ps, pi, [x for x in pfc]],
                    [qs, qi, [x for x in qfc]],
                    digits=digits,
                ),
                digits=digits,
            )
            sample1 = [
                random.uniform(p, p2) * random.uniform(q, q2) for _ in range(2000)
            ]
            sample2 = [
                _rp(
                    rg,
                    psrn_multiply(
                        rg,
                        [ps, pi, [x for x in pfc]],
                        [qs, qi, [x for x in qfc]],
                        digits=digits,
                    ),
                    digits=digits,
                )
                for _ in range(2000)
            ]
            ks = st.ks_2samp(sample1, sample2)
            if ks.pvalue < 1e-6:
                print(
                    "    psrn_multiply_test(%d,%d,%s,%d,%d,%s,digits=%d)"
                    % (ps, pi, pfc, qs, qi, qfc, digits)
                )
                print("    # %s - %s" % (mn, mx))
                print("    # exp. range about %s - %s" % (min(sample1), max(sample1)))
                print("    # act. range about %s - %s" % (min(sample2), max(sample2)))
                dobucket(sample1)
                dobucket(sample2)

    def psrn_expo_test(rg):
        sample1 = [random.expovariate(1) for i in range(10000)]
        sample2 = [psrn_fill(rg, psrnexpo(rg)) for i in range(10000)]
        ks = st.ks_2samp(sample1, sample2)
        # dobucket(sample1)
        # dobucket(sample2)
        if ks.pvalue < 1e-6:
            print("    psrn_expo_test()")
            print("    # exp. range about %s - %s" % (min(sample1), max(sample1)))
            print("    # act. range about %s - %s" % (min(sample2), max(sample2)))
            dobucket(sample1)
            dobucket(sample2)

    bern = bernoulli.Bernoulli()
    rg = randomgen.RandomGen()
    _test_rand_extraction(lambda rg: psrnexpo(rg))
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
