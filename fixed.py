from decimal import Decimal
import math

class Fixed:
   """
   Fixed-point numbers, represented using integers that store multiples
   of 2^BITS.  They are not necessarily faster than floating-point numbers, nor
   do they necessarily have the same precision or resolution of floating-point
   numbers.  The main benefit of fixed-point numbers is that they improve
   determinism for applications that rely on non-integer real numbers (notably
   simulations and machine learning applications), whereas floating-point
   numbers have a host of problems that make repeatable results across
   computers difficult, including differences in implementation, rounding
   behavior, and order of operations, as well as nonassociativity of
   floating-point numbers.

   Any copyright to this file is dedicated to the Public Domain, under
   Creative Commons Zero version 1.0.
   """
   # Bits in the fraction of a fixed-point number
   BITS = 20
   MASK = (1<<BITS)-1
   HALF = (1<<(BITS-1))

   def __init__(self, i):
     self.value=i

   def v(i):
     if i.__class__==Fixed:
        return i
     b = 0
     neg = False
     if i.__class__==str:
        d=Decimal(str)
        neg=(d<0)
        b = int(abs(Decimal(i)) * (1 << Fixed.BITS))
     else:
        neg=(i<0)
        b = int(abs(i) * (1 << Fixed.BITS))
     return Fixed(-b) if neg else Fixed(b)

   def __add__(a, b):
     av=Fixed.v(a).value
     bv=Fixed.v(b).value
     if (av>=0) == (bv>=0):
        return Fixed(av + bv)
     if a>=0: # a is nonnegative and b is negative
        return Fixed(av - abs(bv))
     else: # a is negative and b is nonnegative
        return Fixed(bv - abs(av))

   def __sub__(a, b):
     return a + (-b)

   def __mul__(a, b):
     av=Fixed.v(a).value
     bv=Fixed.v(b).value
     ava=abs(av)
     bva=abs(bv)
     ret=(ava*bva)
     frac = ret&Fixed.MASK
     ret = (ret>>Fixed.BITS)
     # Rounding to nearest, ties to even
     if (frac>Fixed.HALF or (frac==Fixed.HALF and (ret&1)==1)):
        ret+=1
     if (av>=0) != (bv>=0):
        ret=-ret
     return Fixed(ret)

   def _div(a, b):
     av=Fixed.v(a).value
     bv=Fixed.v(b).value
     ava=abs(av)
     bva=abs(bv)
     ret=ava<<Fixed.BITS
     frac = ret % bva
     ret = (ret // bva)
     # Rounding to nearest, ties to even
     if (bva&1)==0:
       # Divisor's least significant bit is even
       if (frac>(bva>>1) or (frac==(bva>>1) and (ret&1)==1)):
         ret+=1
     else:
       if (frac>(bva>>1)):
         ret+=1
     if (av>=0) != (bv>=0):
        ret=-ret
     return Fixed(ret)

   def __rtruediv__(a, b):
     return Fixed._div(a, b)

   def __rdiv__(a, b):
     return Fixed._div(a, b)

   def __div__(a, b):
     return Fixed._div(a, b)

   def __truediv__(a, b):
     return Fixed._div(a, b)

   def __floordiv__(a, b):
     av=Fixed.v(a).value
     bv=Fixed.v(b).value
     ava=abs(av)
     bva=abs(bv)<<Fixed.BITS
     ret=ava<<Fixed.BITS
     oldret=ret
     ret = (ret // bva)
     if (av>=0) != (bv>=0):
        frac = oldret % bva
        if frac!=0:
          ret+=1
        ret=-ret
     return Fixed.v(ret)

   def __mod__(a, b):
     return a - (a // b) * b

   def __neg__(self): return Fixed(-self.value)
   def __pos__(self): return self
   def __abs__(self): return Fixed(abs(self.value))
   def __lt__(self, other): return self.value < Fixed.v(other).value
   def __le__(self, other): return self.value <= Fixed.v(other).value
   def __eq__(self, other): return self.value == Fixed.v(other).value
   def __ne__(self, other): return self.value != Fixed.v(other).value
   def __gt__(self, other): return self.value > Fixed.v(other).value
   def __ge__(self, other): return self.value >= Fixed.v(other).value
   def __cmp__(self, other):
      othervalue = Fixed.v(other).value
      if self.value == othervalue: return 0
      if self.value < othervalue: return -1
      return 1

   def floor(a):
     av=Fixed.v(a)
     if av>=0:
       return Fixed((av.value>>Fixed.BITS) << Fixed.BITS)
     ava=abs(av.value)
     if (ava&Fixed.MASK) != 0:
       return Fixed(-( ((ava>>Fixed.BITS) + 1) << Fixed.BITS))
     else:
       return av

   def asin(a):
     return atan2(a, sqrt(Fixed.v(1)-a*a))

   def acos(a):
     return atan2(sqrt(Fixed.v(1)-a*a), a)

   def round(a):
     av=Fixed.v(a).value
     ava=abs(av)
     ret=ava
     frac = ret&Fixed.MASK
     ret = (ret>>Fixed.BITS)
     # Rounding to nearest, ties away from zero
     if (frac>=Fixed.HALF):
        ret+=1
     if av<0:
        ret=-ret
     return Fixed.v(ret)

   def sin(a):
     raise NotImplementedError

   def cos(a):
     raise NotImplementedError

   def tan(a):
     raise NotImplementedError

   def atan2(y, x):
     x=Fixed.v(x)
     if y==0: return 0
     raise NotImplementedError

   def pow(a, b):
     raise NotImplementedError

   def sqrt(a):
     if a<0: raise ValueError
     if a==0: return Fixed(0)
     raise NotImplementedError

   def log(a):
     raise NotImplementedError

   def exp(a):
     raise NotImplementedError

   def __str__(self):
     return str(Decimal(self.value)/Decimal((1<<Fixed.BITS)))

   def __repr__(self):
     return str(Decimal(self.value)/Decimal((1<<Fixed.BITS)))

if __name__ == "__main__":
   def asserteq(a,b):
      if a!=b: raise ValueError(str([a, b]))
   asserteq(Fixed.v(-0.75), Fixed.v(-3)/4)
   asserteq(Fixed.v(-1), Fixed.v(-3)//4)
   asserteq(Fixed.v(15.75), Fixed.v(3.5)*4.5)
   asserteq(Fixed.v(1), Fixed.v(-3)%4)
   asserteq(Fixed.v(0), Fixed.v(0.5).floor())
   asserteq(Fixed.v(1), Fixed.v(0.5).round())
   asserteq(Fixed.v(0), Fixed.v(0.1).round())
   asserteq(Fixed.v(1), Fixed.v(0.9).round())
   asserteq(Fixed.v(-1), Fixed.v(-0.5).floor())
   asserteq(Fixed.v(-1), Fixed.v(-1).floor())
