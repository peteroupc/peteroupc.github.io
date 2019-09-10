import decimal as dec
import math

class Fixed:
   """
   Fixed-point numbers, represented using integers that store multiples
   of 2^BITS.  They are not necessarily faster than floating-point numbers, nor
   do they necessarily have the same precision or resolution of floating-point
   numbers.  The main benefit of fixed-point numbers is that they improve
   determinism for applications that rely on non-integer real numbers (notably
   simulations and machine learning applications), in the sense that the operations
   given here deliver the same answer for the same input across computers,
   whereas floating-point numbers have a host of problems that make repeatable
   results difficult, including differences in implementation, rounding
   behavior, and order of operations, as well as nonassociativity of
   floating-point numbers.

   Any copyright to this file is dedicated to the Public Domain, under
   Creative Commons Zero version 1.0.
   """
   # Bits in the fraction of a fixed-point number
   BITS = 20
   MASK = (1<<BITS)-1
   HALF = (1<<(BITS-1))
   ArcTanTable = [421657428, 248918914, 131521918, 66762579, 33510843,
       16771757, 8387925, 4194218, 2097141, 1048574, 524287, 262143, 131071,
       65535, 32767, 16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1]
   ArcTanHTable = [0, 294906490, 137123709, 67461703, 33598225, 16782680,
       8389290, 4194389, 2097162, 1048577, 524288, 262144, 131072, 65536, 32768,
       16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1]
   ArcTanFrac = 29
   ArcTanBitDiff = ArcTanFrac - BITS
   PiArcTanBits = 1686629713 # Pi, expressed in ArcTanFrac fractional bits
   SinCosK = 326016435 # Expressed in ArcTanFrac fractional bits
   ExpK = 648270061 # Expressed in ArcTanFrac fractional bits
   HalfPiBits = 1647099 # Half of pi, expressed in 20 fractional bits
   PiBits = 3294199 # Pi, expressed in 20 fractional bits
   TwoTimesPiBits = 6588397 # Pi*2, expressed in 20 fractional bits

   def __init__(self, i):
     self.value=i

   @staticmethod
   def v(i):
     """
     Converts a string, integer, Decimal, or other number type into
     a fixed-point number.  If the parameter is a Fixed, returns itself.
     If the given number is a non-integer, returns the closest value to
     a Fixed after rounding using the round-to-nearest-ties-to-even
     rounding mode.  The parameter is recommended to be a string
     or integer, and is not recommended to be a `float`.
     """
     if i.__class__==Fixed:
        return i
     b = 0
     neg = False
     if i.__class__==int:
        neg=(i<0)
        b = abs(i) * (1 << Fixed.BITS)
        return Fixed(-b) if neg else Fixed(b)
     else:
        d=dec.Decimal(i)
        neg=(d<0)
        b = abs(dec.Decimal(i)) * (1 << Fixed.BITS)
        b = int(b.quantize(dec.Decimal(1), rounding=dec.ROUND_HALF_EVEN))
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

   @staticmethod
   def _roundedshift(a, shift):
     aa=abs(a)
     ret=aa>>shift
     frac=aa&((1<<shift)-1)
     # Divisor's least significant bit is even
     if (frac>(1<<(shift-1)) or (frac==(1<<(shift-1)) and (ret&1)==1)):
        ret+=1
     if a<0:
        ret=-ret
     return Fixed(ret)

   @staticmethod
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

   def __int__(a):
     av=Fixed.v(a).value
     ava=abs(av)
     ret=ava
     frac = ret&Fixed.MASK
     ret = (ret>>Fixed.BITS)
     if av<0:
        ret=-ret
     return ret

   def __float__(a):
     fbits=float(1<<Fixed.BITS)
     return float(a.value/fbits)

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

   def _sincos(a):
     ra=Fixed.v(a).value
     if ra==0: return [0, 1]
     negra=ra<0
     ra=abs(ra)
     if ra>=Fixed.TwoTimesPiBits: ra=ra%Fixed.TwoTimesPiBits
     pi15=Fixed.PiBits+Fixed.HalfPiBits
     negateSin=negra
     if ra>=Fixed.HalfPiBits and ra<pi15:
       ra=Fixed.PiBits-ra
     if ra>=pi15:
       negateSin=(not negra)
       ra=Fixed.TwoTimesPiBits-ra
     ry=0
     rx=Fixed.SinCosK
     rz=ra << Fixed.ArcTanBitDiff
     for i in range(len(Fixed.ArcTanTable)):
        x=rx>>i
        y=ry>>i
        if rz>=0:
          rx-=y; ry+=x; rz-=Fixed.ArcTanTable[i]
        else:
          rx+=y; ry-=x; rz+=Fixed.ArcTanTable[i]
     if negateSin:
        ry=-ry
     # TODO: Fix sign of cos
     return [
        Fixed._roundedshift(ry, Fixed.ArcTanBitDiff),
        Fixed._roundedshift(rx, Fixed.ArcTanBitDiff)]

   def sin(a):
     return Fixed.v(a)._sincos()[0]

   def cos(a):
     return Fixed.v(a)._sincos()[1]

   def tan(a):
     sc=Fixed.v(a)._sincos()
     return sc[0]/sc[1]

   def atan2(y, x):
     rx=Fixed.v(x).value
     ry=Fixed.v(y).value
     if ry==0: return 0
     if rx==0:
       if ry>=0:
         return Fixed(Fixed.HalfPiBits)
       else:
         return Fixed(-Fixed.HalfPiBits)
     rz=0
     xneg=rx<0
     yneg=ry<0
     rx=abs(rx) << Fixed.ArcTanBitDiff
     ry=abs(ry) << Fixed.ArcTanBitDiff
     for i in range(len(Fixed.ArcTanTable)):
        x=rx>>i
        y=ry>>i
        if ry<=0:
          rx-=y; ry+=x; rz-=Fixed.ArcTanTable[i]
        else:
          rx+=y; ry-=x; rz+=Fixed.ArcTanTable[i]
     if yneg != xneg:
       rz=-rz
     if xneg:
       if yneg:
         rz-=Fixed.PiBitsArcTanBits
       else:
         rz+=Fixed.PiBitsArcTanBits
     return Fixed._roundedshift(rz, Fixed.ArcTanBitDiff)

   def pow(a, b):
     av=Fixed.v(a)
     bv=Fixed.v(b)
     if a==0: return a
     if a==1: return a
     if bv>0 and bv.floor()==bv:
       r=Fixed.v(1)
       eiv=a
       p=int(bv)
       while p>0:
         if (p&1)!=0: r*=eiv
         p>>=1
         if p!=0: eiv*=eiv
       return r
     raise NotImplementedError

   def sqrt(a):
     if a<0: raise ValueError
     if a==0: return Fixed(0)
     raise NotImplementedError

   def log(a):
     raise NotImplementedError

   def exp(a):
     av=Fixed.v(a).value
     if av==0: return Fixed.v(1)
     if av<0:
        return Fixed.v(1)/(-a).exp()
     if a>Fixed.v(3):
        expc=(a/3).exp()
        return expc*expc*expc
     if a>Fixed.v(1):
        exphalf=(a/2).exp()
        return exphalf*exphalf
     ava=abs(av)
     rx=Fixed.ExpK
     ry=Fixed.ExpK
     rz=ava << Fixed.ArcTanBitDiff
     for i in range(1, len(Fixed.ArcTanHTable)):
       for m in range(2 if i==4 or i==13 else 1):
         x=rx>>i
         y=ry>>i
         if rz>=0:
           rx+=y; ry+=x; rz-=Fixed.ArcTanHTable[i]
         else:
           rx-=y; ry-=x; rz+=Fixed.ArcTanHTable[i]
     return Fixed._roundedshift(rx, Fixed.ArcTanBitDiff)

   def __str__(self):
     return str(dec.Decimal(self.value)/dec.Decimal((1<<Fixed.BITS)))

   def __repr__(self):
     return str(dec.Decimal(self.value)/dec.Decimal((1<<Fixed.BITS)))

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
   asserteq(Fixed.v(9), Fixed.v(3).pow(2))
   asserteq(Fixed.v(27), Fixed.v(3).pow(3))
   asserteq(Fixed.v(81), Fixed.v(3).pow(4))
   maxerror=0
   minvalue=0 # -Fixed.PiBits*2
   for v in range(-Fixed.PiBits*2, Fixed.PiBits*2+1):
     if v%493!=0: continue
     fx=Fixed(v)
     fxs=float(fx.sin())
     fps=math.sin(float(fx))
     if abs(fxs-fps)>0.1:
      print([v,fx,fxs,fps])
     maxerror=max(abs(fxs-fps), maxerror)
   print("sin maxerror=%f" % maxerror)
   maxerror=0
   for v in range(minvalue, Fixed.PiBits*2+1):
     if v%493!=0: continue
     fx=Fixed(v)
     fxs=float(fx.cos())
     fps=math.cos(float(fx))
     if abs(fxs-fps)>0.1:
      print([v,fx,fxs,fps])
     maxerror=max(abs(fxs-fps), maxerror)
   print("cos maxerror=%f" % maxerror)
   halfpi=float(Fixed(Fixed.HalfPiBits))
   for v in [halfpi, -halfpi, 0.5, 1, 1.5, 2, 2.5, -0.5, -1, -1.5, -2, -2.5]:
     print(["exp",v,Fixed.v(v).exp(),math.exp(v)])
