import random

def geobagfunc(bag, f, k):
    """ Samples bits from a geometric bag (U) as necessary to
       calculate f(U) to within 1/2^k of the true result.
     - b: Geometric bag, that is, an ordinary Python list
        that holds a list of bits from left to
        right starting with the bit immediately after the binary point.
        An item can contain the value None, which indicates an
        unsampled bit.
     - f: Function to run, which takes one parameter, namely a 'float'.
       Note that this may suffer rounding and other approximation
       errors as a result.  A more robust implementation would require
       the method to return an interval (as in interval arithmetic)
       or would pass the desired level of accuracy to the function given
       here, and would probably have the function use arbitrary-precision
       rational or floating-point numbers rather than the fixed-precision
       'float' type of Python, which usually has 53 bits of precision.
     - k: Desired precision expressed as a number of bits after the
       binary point.
     Returns a multiple of 1/2^k that expresses the approximation
     of f(U).
   """
    prec = 1 << k
    prectol = 1.0 / prec
    i = 0
    v = 0
    d = 0
    for i in range(len(bag)):
        if bag[i] == None:
            bag[i] = random.randint(0, 1)
        v = (v << 1) | bag[i]
        i += 1
    while True:
        vnext = v + 1
        iprec = 1 << i
        vstart = v / iprec  # v/2^(i+1)
        vend = vnext / iprec  # vnext/2^(i+1)
        fvstart = f(vstart)
        fvend = f(vend)
        if abs(fvstart - fvend) <= 2 * prectol:
            # Within desired tolerance; return the
            # approximation
            # print(["vs",v,vstart,(vstart+vend)/2,vend,i,len(bag)])
            # print(["fvs",fvstart,(fvstart+fvend)/2,fvend])
            # print(bag)
            return int(((fvstart + fvend) / 2) * prec)
        if i >= len(bag):
            bag.append(random.randint(0, 1))
            v = (v << 1) | bag[i]
        i += 1

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
       See the 'geobagfunc' method.
   """
    k = 1
    v = 0
    while True:
        v = (v << 1) | random.randint(0, 1)
        pk = geobagfunc(bag, f, k)
        if pk + 1 <= v:
            # _verifygreater(bag,pk,f,k,v)
            return 0
        if pk - 2 >= v:
            # _verifyless(bag,pk,f,k,v)
            return 1
        k += 1
