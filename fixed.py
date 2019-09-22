import decimal as dec
import math

class Fixed:
   """
   Fixed-point numbers, represented using integers that store multiples
   of 2^-BITS.  They are not necessarily faster than floating-point numbers, nor
   do they necessarily have the same precision or resolution of floating-point
   numbers.  The main benefit of fixed-point numbers is that they improve
   determinism for applications that rely on non-integer real numbers (notably
   simulations and machine learning applications), in the sense that the operations
   given here deliver the same answer for the same input across computers,
   whereas floating-point numbers have a host of problems that make repeatable
   results difficult, including differences in their implementation, rounding
   behavior, and order of operations, as well as nonassociativity of
   floating-point numbers.

   The operations given here are not guaranteed to be "constant-time"
   (non-data-dependent and branchless) for all relevant inputs.

   Any copyright to this file is dedicated to the Public Domain, under
   Creative Commons Zero version 1.0.
   """
   """ Number of bits in the fractional part of a fixed-point number. """
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
   TwoTimesPiArcTanBits = 3373259426 # Pi*2, expressed in ArcTanFrac fractional bits
   HalfPiArcTanBits = 843314856 # Pi/2, expressed in ArcTanFrac fractional bits
   SinCosK = 326016435 # Expressed in ArcTanFrac fractional bits
   ExpK = 648270061 # Expressed in ArcTanFrac fractional bits
   HalfPiBits = 1647099 # Half of pi, expressed in 20 fractional bits
   QuarterPiArcTanBits = 421657428 # Pi/4, expressed in ArcTanFrac fractional bits
   PiBits = 3294199 # Pi, expressed in 20 fractional bits
   TwoTimesPiBits = 6588397 # Pi*2, expressed in 20 fractional bits
   Ln2ArcTanBits = 372130559  # Ln(2), expressed in ArcTanFrac fractional bits

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
   def _roundedshiftraw(a, shift):
     aa=abs(a)
     ret=aa>>shift
     frac=aa&((1<<shift)-1)
     # Divisor's least significant bit is even
     if (frac>(1<<(shift-1)) or (frac==(1<<(shift-1)) and (ret&1)==1)):
        ret+=1
     if a<0:
        ret=-ret
     return ret

   @staticmethod
   def _roundedshift(a, shift):
     return Fixed(Fixed._roundedshiftraw(a, shift))

   @staticmethod
   def _divbits(av, bv, outputFracBits):
     """
     Divides two fixed point numbers and rounds the result
     using round-to-nearest, ties to even.
     av, bv - Fixed-point numbers with the same number of fractional bits
     outputFracBits - Number of fractional bits in the result
     """
     ava=abs(av)
     bva=abs(bv)
     ret=ava<<outputFracBits
     # Note: ret and bva are nonnegative, avoiding
     # differences in rounding between languages
     # when one but not both is negative
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
     return ret

   @staticmethod
   def _div(a, b):
     av=Fixed.v(a).value
     bv=Fixed.v(b).value
     ret=Fixed._divbits(av, bv, Fixed.BITS)
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
     # Note: ret and bva are nonnegative, avoiding
     # differences in rounding between languages
     # when one but not both is negative
     ret = (ret // bva)
     if (av>=0) != (bv>=0):
        frac = oldret % bva
        if frac!=0:
          ret+=1
        ret=-ret
     return Fixed.v(ret)

   def __mod__(a, b):
     # Note: In Python, the "//" integer division operator
     # does a floor rounding of the quotient.  Other programming
     # languages, such as Java, truncate the quotient's fractional part
     # in integer division and define remainder, in general,
     # as "a-(a/b)*b" where "/" is their integer division operator.
     # Here, we use Python's definition of the "%" operator
     # (and by extension "__mod__").
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
     """
     Calculates an approximation of the inverse sine of the given number.
     """
     av=Fixed.v(a)
     if av<-1 or av>1: raise ValueError
     return av.atan2((Fixed.v(1)-av*av).sqrt())

   def acos(a):
     """
     Calculates an approximation of the inverse sine of the given number.
     """
     av=Fixed.v(a)
     if av<-1 or av>1: raise ValueError
     return (Fixed.v(1)-av*av).sqrt().atan2(av)

   def sqrt(a):
     """
     Calculates an approximation of the square root of a the given number.
     """
     return Fixed.v(a).pow(Fixed(Fixed.HALF))

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
     fbits=1<<Fixed.BITS
     try:
       return float(a.value/fbits)
     except:
       return float("-inf") if a<0 else float("inf")

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

   # High-resolution approximation of pi/2
   HalfPiHighRes=0x1921fb54442d18469898cc51701b83
   # High-resolution approximation of pi*2
   TwoTimesPiHighRes=0x6487ed5110b4611a62633145c06e0e
   # Pi*3/2
   PiAndHalfHighRes=0x4b65f1fccc8748d3c9ca64f450528a
   # Pi
   PiHighRes=0x3243f6a8885a308d313198a2e03707
   # Number of fractional bits in halfPiHighRes
   HighResFrac=116

   @staticmethod
   def _highResSine(angle):
     # For angles close to pi/2 or pi*3/2.
     negra=angle<0
     negOutput=negra
     angle=abs(angle)
     if angle>=Fixed.TwoTimesPiHighRes:
       angle=angle%Fixed.TwoTimesPiHighRes
     if angle>=Fixed.PiHighRes:
       negOutput=(not negra)
     if angle>=Fixed.HalfPiHighRes and angle<Fixed.PiAndHalfHighRes:
       angle=abs(Fixed.PiHighRes-angle)
     if angle>=Fixed.PiAndHalfHighRes:
       angle=Fixed.TwoTimesPiHighRes-angle
     zpidiff=angle-Fixed.HalfPiHighRes
     zpidiffsq=zpidiff*zpidiff
     zpidiff=zpidiffsq
     zpdfrac=Fixed.HighResFrac*2
     outputbits=Fixed.ArcTanFrac*3
     ret=(1<<outputbits)
     ret-=Fixed._divbits(zpidiff,2<<zpdfrac,outputbits)
     denom=24
     facinput=4
     pos=True
     while True:
       zpidiff*=zpidiffsq
       zpdfrac+=Fixed.HighResFrac*2
       term=Fixed._divbits(zpidiff,denom<<zpdfrac,outputbits)
       if term==0: break
       if pos: ret+=term
       else: ret-=term
       pos=(not pos)
       denom*=facinput*(facinput+1)
       facinput+=2
     if negOutput: ret=-ret
     return ret

   @staticmethod
   def _highResCosine(angle):
     # For angles close to pi/2 or pi*3/2.
     ra=abs(angle)
     negOutput=False
     if angle>=Fixed.TwoTimesPiHighRes:
       angle=angle%Fixed.TwoTimesPiHighRes
     if angle>=Fixed.HalfPiHighRes and angle<Fixed.PiAndHalfHighRes:
       negOutput=True
     if angle>=Fixed.HalfPiHighRes and angle<Fixed.PiAndHalfHighRes:
       angle=abs(Fixed.PiHighRes-angle)
     if angle>=Fixed.PiAndHalfHighRes:
       angle=Fixed.TwoTimesPiHighRes-angle
     zpidiff=angle-Fixed.HalfPiHighRes
     zpidiffsq=zpidiff*zpidiff
     zpdfrac=Fixed.HighResFrac
     outputbits=Fixed.ArcTanFrac*3
     ret=-Fixed._divbits(zpidiff,1<<zpdfrac,outputbits)
     denom=6
     facinput=4
     pos=True
     while True:
       zpidiff*=zpidiffsq
       zpdfrac+=Fixed.HighResFrac*2
       term=Fixed._divbits(zpidiff,denom<<zpdfrac,outputbits)
       if term==0: break
       if pos: ret+=term
       else: ret-=term
       pos=(not pos)
       denom*=facinput*(facinput+1)
       facinput+=2
     if negOutput: ret=-ret
     return ret

   @staticmethod
   def _sincos(ra):
     if ra==0: return [0, 1<<Fixed.ArcTanFrac]
     negra=ra<0
     ra=abs(ra)
     if ra>=Fixed.TwoTimesPiArcTanBits:
       ra=ra%Fixed.TwoTimesPiArcTanBits
     pi15=Fixed.PiArcTanBits+Fixed.HalfPiArcTanBits
     negateSin=negra
     negateCos=False
     if ra>=Fixed.HalfPiArcTanBits and ra<pi15:
       negateCos=True
       ra=Fixed.PiArcTanBits-ra
     if ra>=pi15:
       negateSin=(not negra)
       ra=Fixed.TwoTimesPiArcTanBits-ra
     ry=0
     rx=Fixed.SinCosK
     rz=ra
     for i in range(len(Fixed.ArcTanTable)):
        x=rx>>i
        y=ry>>i
        if rz>=0:
          rx-=y; ry+=x; rz-=Fixed.ArcTanTable[i]
        else:
          rx+=y; ry-=x; rz+=Fixed.ArcTanTable[i]
     if negateSin:
        ry=-ry
     if negateCos:
        rx=-rx
     return [ry, rx]

   @staticmethod
   def _signedshift(x, shift):
     if x<0:
       return -((-x)<<shift)
     else:
       return x<<shift

   def sin(a):
     """
     Calculates the approximate sine of the given angle; the angle is in radians.
     For the fraction size used by this class, this method is accurate to within
     1 unit in the last place of the correctly rounded result for all inputs
     in the range [-pi*2, pi*2].
     This method's accuracy decreases beyond that range.
     """
     ra=Fixed.v(a).value
     if ra==0: return Fixed.v(0)
     ret=Fixed._sincos(Fixed._signedshift(ra, Fixed.ArcTanBitDiff))[0]
     return Fixed._roundedshift(ret, Fixed.ArcTanBitDiff)

   def cos(a):
     """
     Calculates the approximate cosine of the given angle; the angle is in radians.
     For the fraction size used by this class, this method is accurate to within
     1 unit in the last place of the correctly rounded result for all inputs
     in the range [-pi*2, pi*2].
     This method's accuracy decreases beyond that range.
     """
     ra=Fixed.v(a).value
     if ra==0: return Fixed.v(1)
     ret=Fixed._sincos(Fixed._signedshift(ra, Fixed.ArcTanBitDiff))[1]
     return Fixed._roundedshift(ret, Fixed.ArcTanBitDiff)

   @staticmethod
   def _tan(ra, outputbits):
      if ra==0: return 0
      sc=Fixed._sincos(ra)
      ret=Fixed._divbits(sc[0],sc[1],outputbits)
      if (abs(ret)>>outputbits)>5:
         # Try for more accuracy in case of high tan value
         shift=Fixed.HighResFrac-Fixed.ArcTanFrac
         rs=Fixed._signedshift(ra,shift)
         hsin=Fixed._highResSine(rs)
         hcos=Fixed._highResCosine(rs)
         ret=Fixed._divbits(hsin,hcos,outputbits)
      return ret

   def tan(a):
     """
     Calculates the approximate tangent of the given angle; the angle is in radians.
     For the fraction size used by this class, this method is accurate to within
     2 units in the last place of the correctly rounded result for all inputs
     in the range [-pi*2, pi*2].
     This method's accuracy decreases beyond that range.
     """
     ra=Fixed.v(a).value
     if ra==0: return Fixed.v(0)
     rashft=Fixed._signedshift(ra, Fixed.ArcTanBitDiff)
     return Fixed(Fixed._tan(rashft, Fixed.BITS))

   def atan2(y, x):
     """
     Calculates the approximate measure, in radians, of the angle formed by the X axis and
     a line determined by the origin and the given coordinates of a 2D point.
     This is also known as the inverse tangent.
     """
     rx=Fixed.v(x).value
     ry=Fixed.v(y).value
     if ry==0 and rx==0:
       return 0
     if ry==0 and rx<0:
       return Fixed(Fixed.PiBits)
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
         rz-=Fixed.PiArcTanBits
       else:
         rz+=Fixed.PiArcTanBits
     return Fixed._roundedshift(rz, Fixed.ArcTanBitDiff)

   def pow(a, b):
     """
     Calculates an approximation of this number raised to the power of another number.
     """
     av=Fixed.v(a)
     bv=Fixed.v(b)
     if bv==0: return Fixed.v(1)
     if av==0:
        if bv<0: raise ValueError
        return av
     if av==1: return av
     if bv.value==Fixed.HALF:
        # Square root special case
        ava=av.value*(1<<Fixed.BITS)
        sx=ava
        powerBits=0
        while sx>0:
           sx>>=1; powerBits+=1
        powerBits=(powerBits+1)//2
        sx=ava
        sy=1 << powerBits;
        while True:
          sx = sy
          sy = ava//sx
          sy += sx
          sy >>= 1
          if sy>=sx: break
        return Fixed(sx)
     bvint=(bv.floor()==bv)
     if av<0 and not bvint: raise ValueError
     bva=abs(bv)
     intpart=bva.floor()
     fracpart=bva-intpart
     # Power is an integer or greater than 1
     if bvint or bv>1:
       r=1<<Fixed.BITS
       eiv=abs(av.value)
       eivprec=Fixed.BITS
       rprec=0
       # Find the power of the integer part
       p=int(intpart)
       while p>0:
         if (p&1)!=0:
            r*=eiv
            rprec+=eivprec
         p>>=1
         if p!=0:
            eiv*=eiv
            eivprec+=eivprec
       if bv<0:
         # Reciprocal
         rv=Fixed._divbits(1<<(rprec+Fixed.BITS), r, Fixed.BITS)
         r=Fixed(rv)
       else:
         if bv>1:
            # We've found the power of the integer part,
            # now find the power of the fractional part and
            # multiply
            # 'fracr' has 'rprec+BITS' fractional bits
            fracr=av.pow(fracpart).value<<rprec
            # 'r' has 'rprec+BITS' fractional bits
            r*=fracr
            r=Fixed._roundedshift(r,rprec*2+Fixed.BITS)
         else:
            # 'r' has 'rprec+BITS' fractional bits; after the
            # shift, it has BITS fractional bits
            r=Fixed._roundedshift(r,rprec)
       if av<0 and (int(bva)&1)==1:
         r=-r
       return r
     return (bv*av.log()).exp()

   LogMin = (1<<BITS)*15/100 # In BITS fractional bits
   Log2Bits = 726817 # log(2), in BITS fractional bits

   def _halflog(a):
     fa=Fixed.v(a)
     av=fa.value
     if av<=0: raise ValueError
     if av >= 1<<(Fixed.BITS-1) or av < Fixed.LogMin:
       return fa.log()/2
     avx = av << Fixed.ArcTanBitDiff
     rx=avx + (1<<Fixed.ArcTanFrac)
     ry=avx - (1<<Fixed.ArcTanFrac)
     rz=0
     for i in range(1, len(Fixed.ArcTanHTable)):
       iters=2 if i==4 or i==13 else 1
       for m in range(iters):
         x=rx>>i
         y=ry>>i
         if ry<=0:
           rx+=y; ry+=x; rz-=Fixed.ArcTanHTable[i]
         else:
           rx-=y; ry-=x; rz+=Fixed.ArcTanHTable[i]
     return Fixed._roundedshift(rz, Fixed.ArcTanBitDiff)

   def log(a):
     """
     Calculates an approximation of the natural logarithm of this number.
     """
     fa=Fixed.v(a)
     av=fa.value
     if av<=0: raise ValueError
     if av >= 1<<(Fixed.BITS-1):
       return (fa/2).log()+Fixed(Fixed.Log2Bits)
     if av < Fixed.LogMin:
       return (fa*2).log()-Fixed(Fixed.Log2Bits)
     avx = av << Fixed.ArcTanBitDiff
     rx=avx + (1<<Fixed.ArcTanFrac)
     ry=avx - (1<<Fixed.ArcTanFrac)
     rz=0
     for i in range(1, len(Fixed.ArcTanHTable)):
       iters=2 if i==4 or i==13 else 1
       for m in range(iters):
         x=rx>>i
         y=ry>>i
         if ry<=0:
           rx+=y; ry+=x; rz-=Fixed.ArcTanHTable[i]
         else:
           rx-=y; ry-=x; rz+=Fixed.ArcTanHTable[i]
     return Fixed._roundedshift(rz, Fixed.ArcTanBitDiff - 1)

   @staticmethod
   def _expinternal(avArcTanBits, recip, shift):
     rx=Fixed.ExpK
     ry=Fixed.ExpK
     rz=avArcTanBits
     for i in range(1, len(Fixed.ArcTanHTable)):
       iters=2 if i==4 or i==13 else 1
       for m in range(iters):
         x=rx>>i
         y=ry>>i
         if rz>=0:
           rx+=y; ry+=x; rz-=Fixed.ArcTanHTable[i]
         else:
           rx-=y; ry-=x; rz+=Fixed.ArcTanHTable[i]
     rx <<= shift
     if recip:
        # Reciprocal
        rx=Fixed._divbits(1<<(Fixed.ArcTanFrac), rx, Fixed.ArcTanFrac)
     return Fixed._roundedshiftraw(rx, Fixed.ArcTanBitDiff)

   def exp(a):
     """
     Calculates an approximation of e (base of natural logarithms) raised
     to the power of this number.  May raise an error if this number
     is extremely high.
     """
     fa=Fixed.v(a)
     av=fa.value
     if av==0: return Fixed.v(1)
     if Fixed.BITS<6 and fa < -6: return Fixed(0)
     # With BITS 6 or greater, e^-BITS will round to 0
     # in the round-to-nearest mode
     if Fixed.BITS>=6 and fa < -Fixed.BITS: return Fixed(0)
     avneg=av<0
     ava=abs(av) << Fixed.ArcTanBitDiff
     if abs(fa)>Fixed.v(1):
        # Note: ava is nonnegative, avoiding
        # differences in rounding between languages
        # when one but not both is negative
        fint=ava//Fixed.Ln2ArcTanBits
        frac=ava-fint*Fixed.Ln2ArcTanBits
        if fint>(1<<32):
           # Result too big to handle sanely
           raise ValueError
        avr=Fixed._expinternal(frac, avneg, fint)
        return Fixed(avr)
     avr=Fixed._expinternal(ava, avneg, 0)
     return Fixed(avr)

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
   f1=float(Fixed(1))
   print(f"ulp={f1:0.12f}")
   import random
   rnd=random.Random()
   maxerror=0
   for i in range(100000):
       y=rnd.randint(-(500<<Fixed.BITS), (500<<Fixed.BITS)+1)
       x=rnd.randint(-(100<<Fixed.BITS), (100<<Fixed.BITS)+1)
       fx=Fixed(y)
       fx2=Fixed(x)
       if fx==0 and fx2<0:
         continue
       if fx<0 and fx2.floor()!=fx2:
         fx2=fx2.floor()
       fxsv=fx.pow(fx2)
       if fxsv.value>(1<<64):
         continue
       fxs=float(fxsv)
       fps=math.pow(float(fx),float(fx2))
       if abs(fxs-fps)>0.1:
        print([fx,fx2,fxs,fps])
       maxerror=max(abs(fxs-fps), maxerror)
   print(f"pow (max=2^64) maxerror={maxerror:0.12f}")
   maxerror=0
   for i in range(1000000):
     y=rnd.randint(-(10<<Fixed.BITS), (10<<Fixed.BITS)+1)
     x=rnd.randint(-(10<<Fixed.BITS), (10<<Fixed.BITS)+1)
     fx=Fixed(y)
     fx2=Fixed(x)
     fxs=float(fx.atan2(fx2))
     fps=math.atan2(float(fx),float(fx2))
     if abs(fxs-fps)>0.1:
      print([fx,fx2,fxs,fps])
     maxerror=max(abs(fxs-fps), maxerror)
   print(f"atan2 maxerror={maxerror:0.12f}")
   maxerror=0
   for v in range(-Fixed.PiBits*2, Fixed.PiBits*2+1):
     fx=Fixed(v)
     fxsv=fx.tan()
     fxs=float(fxsv)
     fps=math.tan(float(fx))
     if abs(fxs-fps)>0.1:
      print([v,fx,fxs,fps])
     maxerror=max(abs(fxs-fps), maxerror)
   print(f"tan maxerror={maxerror:0.12f}")
   maxerror=0
   for v in range(-Fixed.PiBits*2, Fixed.PiBits*2+1):
     if v%493!=0: continue
     fx=Fixed(v)
     fxs=float(fx.exp())
     fps=math.exp(float(fx))
     if abs(fxs-fps)>0.1:
      print([v,fx,fxs,fps])
     maxerror=max(abs(fxs-fps), maxerror)
   print(f"exp maxerror={maxerror:0.12f}")
   maxerror=0
   for v in range(0, Fixed.PiBits*4+1):
     if v%493!=0: continue
     fx=Fixed(v)
     fxs=float(fx.sqrt())
     fps=math.sqrt(float(fx))
     if abs(fxs-fps)>0.1:
      print([v,fx,fxs,fps])
     maxerror=max(abs(fxs-fps), maxerror)
   print(f"sqrt maxerror={maxerror:0.12f}")
   maxerror=0
   for v in range(1, Fixed.PiBits*4+1):
     if v%493!=0: continue
     fx=Fixed(v)
     fxs=float(fx.log())
     fps=math.log(float(fx))
     if abs(fxs-fps)>0.1:
      print([v,fx,fxs,fps])
     maxerror=max(abs(fxs-fps), maxerror)
   print(f"log maxerror={maxerror:0.12f}")
   maxerror=0
   for v in range(-(1<<Fixed.BITS), (1<<Fixed.BITS)+1):
     fx=Fixed(v)
     fxsv=fx.asin()
     fxs=float(fxsv)
     fps=math.asin(float(fx))
     if abs(fxs-fps)>0.1:
      print([v,fx,fxs,fps])
     maxerror=max(abs(fxs-fps), maxerror)
   print(f"asin maxerror={maxerror:0.12f}")
   maxerror=0
   for v in range(-(1<<Fixed.BITS), (1<<Fixed.BITS)+1):
     fx=Fixed(v)
     fxsv=fx.acos()
     fxs=float(fxsv)
     fps=math.acos(float(fx))
     if abs(fxs-fps)>0.1:
      print([v,fx,fxs,fps])
     maxerror=max(abs(fxs-fps), maxerror)
   print(f"acos maxerror={maxerror:0.12f}")
   maxerror=0
   for v in range(-Fixed.PiBits*2, Fixed.PiBits*2+1):
     fx=Fixed(v)
     fxsv=fx.sin()
     if fxsv<-1 or fxsv>1: raise ValueError
     fxs=float(fxsv)
     fps=math.sin(float(fx))
     if abs(fxs-fps)>0.1:
      print([v,fx,fxs,fps])
     maxerror=max(abs(fxs-fps), maxerror)
   print(f"sin maxerror={maxerror:0.12f}")
   maxerror=0
   for v in range(-Fixed.PiBits*2, Fixed.PiBits*2+1):
     fx=Fixed(v)
     fxsv=fx.cos()
     if fxsv<-1 or fxsv>1: raise ValueError
     fxs=float(fxsv)
     fps=math.cos(float(fx))
     if abs(fxs-fps)>0.1:
      print([v,fx,fxs,fps])
     maxerror=max(abs(fxs-fps), maxerror)
   print(f"cos maxerror={maxerror:0.12f}")
