import random

def _verifyless(bag, pk, f, k, v):
    bagv = 0
    bagc = 0
    for i in range(len(bag)):
        if bag[i] == None:
            break
        bagv = (bagv << 1) | bag[i]
        bagc += 1
    bagf = f(bagv / (1 << bagc))
    vf = v / (1 << k)
    if vf > bagf:
        raise ValueError(
            str(
                [
                    "verifyless",
                    k,
                    v,
                    "bagv",
                    bagv,
                    bagv / (1 << bagc),
                    bagf,
                    vf,
                    pk,
                    int(bagf * (1 << k)),
                ]
            )
        )

def _verifygreater(bag, pk, f, k, v):
    bagv = 0
    bagc = 0
    for i in range(len(bag)):
        if bag[i] == None:
            break
        bagv = (bagv << 1) | bag[i]
        bagc += 1
    bagf = f(bagv / (1 << bagc))
    vf = v / (1 << k)
    if vf < bagf:
        raise ValueError(
            str(
                [
                    "verifygreater",
                    k,
                    v,
                    "bagv",
                    bagv,
                    bagv / (1 << bagc),
                    bagf,
                    vf,
                    pk,
                    int(bagf * (1 << k)),
                ]
            )
        )

def geobagcompare(bag, f):
    """ Returns 1 with probability f(U), where U is the value that
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
            bag[i] = random.randint(0, 1)
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
                # print(["vs",i,k,geobagv])
                pk = int(((fvstart + fvend) / 2) * prec)
                # Compare
                v = (v << 1) | random.randint(0, 1)
                if pk + 1 <= v:
                    # _verifygreater(bag,pk,f,k,v)
                    return 0
                if pk - 2 >= v:
                    # _verifyless(bag,pk,f,k,v)
                    return 1
                k += 1
                prec = 1 << k
                prectol = 1.0 / prec
                break
            if i >= len(bag):
                bag.append(random.randint(0, 1))
                geobagv = (geobagv << 1) | bag[i]
                vnext = geobagv + 1
            lastfvstart = None
            lastfvend = None
            i += 1
            iprec = 1 << i
