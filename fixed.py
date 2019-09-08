from decimal import Decimal
from math import floor

class Fixed:
   """
   Fixed-point numbers, represented using integers that store multiples
   of 1/FRAC.  They are not necessarily faster than floating-point numbers, nor
   do they necessarily have the same precision or resolution of floating-point
   numbers.  The main benefit of fixed-point numbers is that they improve
   determinism for applications that rely on non-integer real numbers (notably
   simulations and machine learning applications), whereas floating-point
   numbers have a host of problems
   that make repeatable results across computers difficult, including differences
   in implementation, rounding behavior, and order of operations, as well as
   nonassociativity of floating-point numbers.
   """
   # Fractional parts of a fixed-point number.
   FRAC = 1000000

   def __init__(self, i):
     self.value=i

   def v(i):
     if i.__class__==Fixed:
        return i
     if i.__class__==str:
        return Fixed(int(Decimal(str)*Fixed.FRAC))
     return Fixed(int(i*Fixed.FRAC))

   def __add__(a, b):
     return Fixed(Fixed.v(a).value + Fixed.v(b).value)

   def __sub__(a, b):
     return Fixed(Fixed.v(a).value - Fixed.v(b).value)

   def __mul__(a, b):
     return Fixed((Fixed.v(a).value * Fixed.v(b).value) // Fixed.FRAC)

   def __rtruediv__(a, b):
     return Fixed((Fixed.v(a).value * Fixed.FRAC) // Fixed.v(b).value)

   def __rdiv__(a, b):
     return Fixed((Fixed.v(a).value * Fixed.FRAC) // Fixed.v(b).value)

   def __div__(a, b):
     return Fixed((Fixed.v(a).value * Fixed.FRAC) // Fixed.v(b).value)

   def __truediv__(a, b):
     return Fixed((Fixed.v(a).value * Fixed.FRAC) // Fixed.v(b).value)

   def __floordiv__(a, b):
     return (a/b).floor()

   def __mod__(a, b):
     return a - (a // b) * b

   def __neg__(self): return Fixed(-self.value)
   def __pos__(self): return self
   def __abs__(self): return Fixed(abs(self.value))
   def __lt__(self, other): return self.value < Fixed.v(other).value
   def __le__(self, other): return self.value <= Fixed.v(other).value
   def __eq__(self, other): return self.value == Fixed.v(other).value
   def __ne__(self, other): return self.value != Fixed.v(other).value
   def __gt__(self, other): return self.value >  Fixed.v(other).value
   def __ge__(self, other): return self.value >= Fixed.v(other).value
   def __cmp__(self, other):
      othervalue = Fixed.v(other).value
      if self.value == othervalue: return 0
      if self.value < othervalue: return -1
      return 1

   def floor(a):
     return Fixed((Fixed.v(a).value // Fixed.FRAC) * Fixed.FRAC)

   def asin(a):
     return atan2(a, sqrt(Fixed.v(1)-a*a))

   def acos(a):
     return atan2(sqrt(Fixed.v(1)-a*a), a)

   def round(a):
     raise NotImplementedError()

   def sin(a):
     raise NotImplementedError()

   def cos(a):
     raise NotImplementedError()

   def tan(a):
     raise NotImplementedError()

   def atan2(y, x):
     raise NotImplementedError()

   def pow(a, b):
     raise NotImplementedError()

   def sqrt(a, b):
     raise NotImplementedError()

   def log(a):
     raise NotImplementedError()

   def exp(a):
     raise NotImplementedError()

   def __str__(self):
     return str(Decimal(self.value)/Decimal(Fixed.FRAC))

if __name__ == "__main__":
   print(Fixed.v(10))
   print(Fixed.v(10)+Fixed.v(5))
   print(Fixed.v(10)*Fixed.v(5))
   print(Fixed.v(10)/Fixed.v(5))
   print(Fixed.v(10)/Fixed.v(3))
   print(Fixed.v(10)//Fixed.v(3))
   print(Fixed.v(10)%Fixed.v(3))
   print(Fixed.v(10)/5)
   print(Fixed.v(10)/3)
   print(Fixed.v(-1))
   print(Fixed.v(3))
   print(Fixed.v(3.5))
   print(Fixed.v(3.5).floor())
   print(Fixed.v(-3.5).floor())
   print(min(Fixed.v(10),Fixed.v(5)))
   print(max(Fixed.v(10),Fixed.v(5)))
