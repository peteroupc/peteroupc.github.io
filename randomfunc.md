# Random Number Generation Methods

[Peter Occil](mailto:poccil14@gmail.com)

Begun on June 4, 2017; last updated on Aug. 4, 2017.

Discusses many ways in which applications can extract random numbers from RNGs and includes pseudocode for most of them.

<a id=Introduction></a>
## Introduction

This page discusses many ways applications can extract random numbers
from random number generators (RNGs) and includes pseudocode for most
of them.

As used in this document, a random number generator&mdash;
- seeks to generate independent and identically distributed numbers that seem to occur by chance (though the numbers need not be uniformly distributed or approximately so),
- can seek to generate random numbers that are cost-prohibitive to predict (also called "cryptographically strong" RNGs), or merely seek to generate number sequences likely to pass statistical tests of randomness,
- can be initialized automatically before use, or can be initialized with an application specified "seed", and
- can use a deterministic algorithm, or primarily rely on one or more nondeterministic sources for random number generation.

The methods presented on this page apply to all those kinds of RNGs unless otherwise noted. Moreover, recommendations on which RNGs are suitable for which applications are generally outside the scope of this page;  I have written about this in [another document](https://peteroupc.github.io/random.html).

This methods described in this document can be categorized as follows:
- Methods to generate uniformly distributed random numbers from an underlying RNG (such as the [core method, `RNDINT(N)`](#Core_Random_Generation_Method)).
- Common tasks to generate randomized content and conditions, such as [Boolean conditions](#Boolean_Conditions), [shuffling](#Shuffling), and [sampling unique items from a list](#Choosing_Several_Unique_Items).
- Methods to generate non-uniformly distributed random numbers, including [weighted choice](#Discrete_Weighted_Choice), the [normal distribution](#Normal_Gaussian_Distribution), and [other statistical distributions](#Other_Non_Uniform_Distributions).

[Sample Python code](https://peteroupc.github.io/randomgen.py) that implements many of the methods in this document is available.

<a id=Contents></a>
## Contents

- [Introduction](#Introduction)
- [Contents](#Contents)
- [Notation and Definitions](#Notation_and_Definitions)
- [Uniform Random Numbers](#Uniform_Random_Numbers)
    - [`RNDINT`: Core Random Integer Method](#RNDINT_Core_Random_Integer_Method)
    - [`RNDINTRANGE`: Random Integers Within a Range, Maximum Inclusive](#RNDINTRANGE_Random_Integers_Within_a_Range_Maximum_Inclusive)
    - [`RNDBITS`: Random N-Bit Integers](#RNDBITS_Random_N_Bit_Integers)
    - [`RNDU01`: Random Numbers 0 or Greater and 1 or Less](#RNDU01_Random_Numbers_0_or_Greater_and_1_or_Less)
    - [`RNDNUMRANGE`: Random Numbers Within a Range, Maximum Inclusive](#RNDNUMRANGE_Random_Numbers_Within_a_Range_Maximum_Inclusive)
    - [`RNDINTEXC`: Modified Core Method, Maximum Exclusive](#RNDINTEXC_Modified_Core_Method_Maximum_Exclusive)
    - [`RNDINTEXCRANGE`: Random Integers Within a Range, Maximum Exclusive](#RNDINTEXCRANGE_Random_Integers_Within_a_Range_Maximum_Exclusive)
    - [`RNDNUMEXCRANGE`: Random Numbers Within a Range, Maximum Exclusive](#RNDNUMEXCRANGE_Random_Numbers_Within_a_Range_Maximum_Exclusive)
        - [`RNDU01OneExc`, `RNDU01ZeroExc`, and `RNDU01ZeroOneExc`: Related Methods for Random Numbers Bounded by 0 and 1](#RNDU01OneExc_RNDU01ZeroExc_and_RNDU01ZeroOneExc_Related_Methods_for_Random_Numbers_Bounded_by_0_and_1)
- [Randomization Techniques](#Randomization_Techniques)
    - [Boolean Conditions](#Boolean_Conditions)
    - [Shuffling](#Shuffling)
    - [Choosing a Random Item from a List](#Choosing_a_Random_Item_from_a_List)
    - [Creating a Random Character String](#Creating_a_Random_Character_String)
    - [Choosing Several Unique Items](#Choosing_Several_Unique_Items)
    - [Almost-Random Sampling](#Almost_Random_Sampling)
- [Non-Uniform Distributions](#Non_Uniform_Distributions)
    - [Discrete Weighted Choice](#Discrete_Weighted_Choice)
        - [Example](#Example)
        - [Weighted Choice Without Replacement](#Weighted_Choice_Without_Replacement)
        - [Choosing Multiple Items](#Choosing_Multiple_Items)
        - [Piecewise Constant Distribution](#Piecewise_Constant_Distribution)
        - [Multinomial Distribution](#Multinomial_Distribution)
    - [Continuous Weighted Choice](#Continuous_Weighted_Choice)
        - [Example](#Example_2)
    - [Dice](#Dice)
    - [Normal (Gaussian) Distribution](#Normal_Gaussian_Distribution)
        - [Generating Random Points on the Surface of a Hypersphere](#Generating_Random_Points_on_the_Surface_of_a_Hypersphere)
        - [Generating Random Points Inside a Ball](#Generating_Random_Points_Inside_a_Ball)
    - [Binomial Distribution](#Binomial_Distribution)
    - [Hypergeometric Distribution](#Hypergeometric_Distribution)
    - [Poisson Distribution](#Poisson_Distribution)
    - [Gamma Distribution](#Gamma_Distribution)
        - [Generating Random Numbers with a Given Positive Sum](#Generating_Random_Numbers_with_a_Given_Positive_Sum)
    - [Negative Binomial Distribution](#Negative_Binomial_Distribution)
    - [von Mises Distribution](#von_Mises_Distribution)
    - [Stable Distribution](#Stable_Distribution)
    - [Multivariate Normal Distribution](#Multivariate_Normal_Distribution)
    - [Other Non-Uniform Distributions](#Other_Non_Uniform_Distributions)
    - [Correlated Random Numbers](#Correlated_Random_Numbers)
    - [Generating Random Numbers from a Distribution of Data Points](#Generating_Random_Numbers_from_a_Distribution_of_Data_Points)
    - [Generating Random Numbers from an Arbitrary Distribution](#Generating_Random_Numbers_from_an_Arbitrary_Distribution)
- [Conclusion](#Conclusion)
- [Notes](#Notes)
- [License](#License)

<a id=Notation_and_Definitions></a>
## Notation and Definitions

In this document:

* Divisions do not round to an integer.  In programming languages in which division of two integers results in an integer, the right-hand side of the division must be converted to a floating-point number first.
* Lists are indexed starting with 0.  That means the first item in the list is 0, the second item in the list is 1, and so on, up to the last item, whose index is the list's size minus 1.
* The pseudocode shown doesn't cover all error handling that may be necessary in a particular implementation.   Such errors may include overflow checking, bounds checking, division by zero, and checks for infinity.  Neither is the pseudocode guaranteed to yield high performance in a particular implementation, either in time or memory.
* `pi` is the constant &pi;, the ratio of a circle's circumference to its diameter.
* `sin(a)`, `cos(a)`, and `tan(a)` are the sine, cosine, and tangent of the angle `a`, respectively, where `a` is in radians.
* `asin(a)`, `acos(a)`, and `atan(a)` are the inverse sine, inverse cosine, and inverse tangent of `a`, respectively.
* `pow(a, b)` is the number `a` raised to the power `b`.
* `abs(a)` is the absolute value of `a`.
* `sqrt(a)` is the square root of `a`.
* `floor(a)` is the highest integer that is less than or equal to `a`.
* `nothing` indicates the absence of a value.  It corresponds to `null` in Java, C#, and JavaScript, `nil` in Ruby, and `None` in Python.
* `true` and `false` are the two Boolean values.
* `ln(a)` is the natural logarithm of `a`.  It corresponds to the `Math.log` method in Java and JavaScript.
* `exp(a)` is the number _e_ (base of natural logarithms) raised to the power `a`.
* `GetNextLine(file)` is a method that gets the next line from a file, or returns `nothing` if the end of the file was reached.
* `NewList()` creates a new empty list.
* `AddItem(list, item)` adds the item `item` to the list `list`.
* `size(list)` returns the size of the list `list`.
* `list[k]` refers to the item at index `k` of the list `list`.
* `mod(a, b)` is the remainder when `a` is divided by `b`.
* The `<<` operator in the pseudocode is a bitwise left shift, with both sides of the operator being integers.  If both sides are positive, it is the same as multiplying the left-hand side by 2<sup>_n_</sup>, where _n_ is the right-hand side.
* The `|` operator in the pseudocode is a bitwise OR operator between two integers.  It combines the bits of both integers so that each bit is set in the result if the corresponding bit is set on either or both sides of the operator.
* The `&` operator in the pseudocode is a bitwise AND operator between two integers. Although the `&` operator is not always equivalent to `mod(a, b + 1)`, where `a` is the left-hand side and `b` is the right-hand side, all uses of the `&` operator in the pseudocode effectively have that meaning, so that the form with `mod` can be used in programming languages without a built-in AND operator.
* The term _significand permutations_, with respect to a floating-point format, means the format's radix (number base) raised to the power of the format's precision (the maximum number of significant digits in the format). For example&mdash;
    - the 64-bit IEEE 754 binary floating-point format (e.g., Java `double`) has 2<sup>53</sup> (9007199254740992) significand permutations,
    - the 64-bit IEEE 754 decimal floating-point format has 10<sup>16</sup> significand permutations,
    - the 32-bit IEEE 754 binary floating-point format (e.g., Java `float`) has 2<sup>24</sup> (16777216) significand permutations, and
    - arbitrary-precision floating point numbers (e.g., Java `BigDecimal`) can have a theoretically arbitrary number of significand permutations.

<a id=Uniform_Random_Numbers></a>
## Uniform Random Numbers

This section describes how RNGs can be used to generate uniformly-distributed random numbers.  Here is an overview of the methods described in this section.

* Random Integers: `RNDINT`, `RNDINTEXC`, `RNDINTRANGE`, `RNDINTRANGEEXC`.
* Random Bits: `RNDBITS`.
* Random Numbers in 0-1 Bounded Interval: `RNDU01`, `RNDU01ZeroExc`, `RNDU01OneExc`, `RNDU01ZeroOneExc`.
* Other Random Numbers: `RNDNUMRANGE`, `RNDNUMRANGEEXC`.

One method, `RNDINT`, described next, can serve as the basis for the remaining methods.

<a id=RNDINT_Core_Random_Integer_Method></a>
### `RNDINT`: Core Random Integer Method

The core method for generating random numbers using an RNG is called **`RNDINT(maxInclusive)`** in this document. It generates a **random integer 0 or greater and `maxInclusive` or less**, where `maxInclusive` is an integer 0 or greater and the number generated is approximately uniformly distributed. This core method can serve as the basis for all other methods described in later sections that extract random numbers from RNGs.

The implementation of `RNDINT(maxInclusive)` depends heavily on what kind of values the underlying RNG returns.  This section explains how `RNDINT(maxInclusive)` can be implemented for four kinds of RNGs.

In this section:
* `RNG()` is a random number returned by the underlying random number generator.
* The term _modulus_ means an integer that is 1 higher than the highest integer that an RNG can output.
* The four kinds of RNG mentioned in this section are assumed to seek to generate random numbers that are approximately uniformly distributed.

If the RNG outputs **integers 0 or greater and less than a positive integer** (for example, less than 1,000,000 or less than 6), then `RNDINT(maxInclusive)` can be implemented as follows.  In the pseudocode below, `MODULUS` is the RNG's modulus.   Note that all the variables in this method are unsigned integers.  (For an exercise solved by this method, see A. Koenig and B. E. Moo, _Accelerated C++_, 2000; see also a [blog post by Johnny Chan](http://mathalope.co.uk/2014/10/26/accelerated-c-solution-to-exercise-7-9/).)

    METHOD RNDINT(maxInclusive)
      // maxInclusive must be 0 or greater
      if maxInclusive < 0: return error
      if maxInclusive == 0: return 0
      // N equals modulus
      if maxInclusive == MODULUS - 1: return RNG()
      if maxInclusive >= MODULUS:
        cx = floor(maxInclusive / MODULUS) + 1
        while true
           ret = cx * RNG
           // NOTE: If this method is implemented using a fixed-
           // precision type, the addition operation below should
           // check for overflow and should reject the number
           // if overflow would result.
           ret = ret + RNDINT(cx - 1)
           if ret <= maxInclusive: return ret
        end
      else
        // NOTE: If the programming language implements
        // division with two integers by truncating to an
        // integer, the division can be used as is without
        // calling a "floor" function.
              nPlusOne = maxInclusive + 1
              maxexc = floor((MODULUS - 1) / nPlusOne) * nPlusOne
              while true
                        ret = RNG()
                        if ret < nPlusOne: return ret
                        if ret < maxexc: return mod(ret, nPlusOne)
              end
      end
    END METHOD

If the RNG outputs **integers 0 or greater and less than a positive integer that's a power of two**, such as random bits, random bytes, or random values of a given number of bits, then `RNDINT(maxInclusive)` can be implemented as follows. In the pseudocode below, `MODULUS` is the RNG's modulus, and `MODBITS` is the number of bits, minus 1, used to represent the modulus.  For example:

- If the RNG outputs random 32-bit integers, `MODULUS` is 2<sup>32</sup> and `MODBITS` is 32.
- If the RNG outputs random 8-bit bytes, `MODULUS` is 256 and `MODBITS` is 8.

Note that all the variables in this method are unsigned integers.

    METHOD RNDINT(maxInclusive)
       // maxInclusive must be 0 or greater
        if maxInclusive < 0: return error
        if maxInclusive == 0: return 0
        // maxInclusive equals maximum
        if maxInclusive == MODULUS - 1: return RNG()
        // Special cases
        if maxInclusive == 1: return RNG() & 1
        if maxInclusive == 3 and MODBITS >= 2: return RNG() & 3
        if maxInclusive == 255 and MODBITS >= 8: return RNG() & 255
        if maxInclusive == 65535 and MODBITS >=16: return RNG() & 65535
        if maxInclusive > MODULUS - 1:
            // Calculate the bit count of maxInclusive
            bitCount = 0
            tempnumber = maxInclusive
            while tempnumber > 0
                   // NOTE: If the programming language implements
                   // division with two integers by truncating to an
                   // integer, the division can be used as is without
                   // calling a "floor" function.
                   tempnumber = floor(tempnumber / 2)
                   bitCount = bitCount + 1
            end
            while true
                   // Build a number with `bitCount` bits
                    tempnumber = 0
                    while bitCount > 0
                         wordBits = MODBITS
                         rngNumber = RNG()
                         if wordBits > bitCount
                            wordBits = bitCount
                            // Truncate number to 'wordBits' bits
                            rngNumber = rngNumber & (
                               (1 << wordBits) - 1)
                         end
                         tempnumber = tempnumber << wordBits
                         // NOTE: In programming languages that
                         // support the OR operator between two
                         // integers, that operator can replace the
                         // plus operator below.
                         tempnumber = tempnumber + rngNumber
                         bitCount = bitCount - wordBits
                    end
                    // Accept the number if allowed
                    if tempnumber <= maxInclusive: return tempnumber
             end
       else
              nPlusOne = maxInclusive + 1
              maxexc = floor((MODULUS - 1) / nPlusOne) * nPlusOne
              while true
                        ret = RNG()
                        if ret < nPlusOne: return ret
                        if ret < maxexc: return mod(ret, nPlusOne)
              end
       end
    END METHOD

Note that this implementation of `RNDINT(maxInclusive)` may result in unused bits (for example, when truncating a random number to `wordBits` bits or in the special cases at the start of the method).  It would be outside the scope of this document to describe how a more sophisticated implementation may save those bits for later reuse.

If the RNG outputs **fixed-point numbers 0 or greater and less than a positive integer**, that is, numbers with a fixed number of fractional parts, then find `A` and `B`, where `A` is the greatest integer that is less than the highest number the RNG can output, and `B` is the number of fractional parts the fixed-point number format can have, and use one of the two methods given above depending on whether `A * B` is a power of two (`A * B` is treated as the _modulus_ for that purpose).  Here, though, `RNG()` in the methods above is `floor(RNG() * B)` instead.

If the RNG outputs **floating-point numbers 0 or greater and less than 1**, then find `s`, where `s` is the number of _significand permutations_ for the floating-point format, and use one of the two methods given above depending on whether `s` is a power of two (`s` is treated as the _modulus_ for that purpose).  Here, though, `RNG()` in the methods above is `floor(RNG() * s)` instead.  (If the RNG outputs arbitrary-precision floating-point numbers, `s` should be set to the number of different values that are possible by calling the underlying RNG.)

----------------

The underlying RNG can be other than already described in this section; however, a detailed `RNDINT(maxInclusive)` implementation for other kinds of RNGs is not given here, since they seem to be lesser seen in practice.  Readers who know of a RNG that is in wide use, returns uniformly distributed numbers, and is other than already described in this section should send me a comment.

_**Note:** To generate a random number that's either -1 or 1, the following idiom can be used: `(RNDINT(1) * 2 - 1)`._

<a id=RNDINTRANGE_Random_Integers_Within_a_Range_Maximum_Inclusive></a>
### `RNDINTRANGE`: Random Integers Within a Range, Maximum Inclusive

The na&iuml;ve way of generating a **random integer `minInclusive` or greater and `maxInclusive` or less** is as follows. This approach works well for unsigned integers and arbitrary-precision integers.

     METHOD RNDINTRANGE(minInclusive, maxInclusive)
       // minInclusive must not be greater than maxInclusive
       if minInclusive > maxInclusive: return error
       return minInclusive + RNDINT(maxInclusive - minInclusive)
     END METHOD

The na&iuml;ve approach won't work as well, though, for signed integer formats if the difference between `maxInclusive` and `minInclusive` exceeds the highest possible integer for the format.  For fixed-length signed integer formats [<sup>(1)</sup>](#Note1), such random integers can be generated using the following pseudocode.  In the pseudocode below, `INT_MAX` is the highest possible integer in the integer format.

    METHOD RNDINTRANGE(minInclusive, maxInclusive)
       // minInclusive must not be greater than maxInclusive
       if minInclusive > maxInclusive: return error
       if minInclusive == maxInclusive: return minInclusive
       if minInclusive==0: return RNDINT(maxInclusive)
       // Difference does not exceed maxInclusive
       if minInclusive > 0 or minInclusive + INT_MAX >= maxInclusive
           return minInclusive + RNDINT(maxInclusive - minInclusive)
       end
       while true
         ret = RNDINT(INT_MAX)
         // NOTE: If the signed integer format uses two's-complement
         // form, use the following line:
         if RNDINT(1) == 0: ret = -1 - ret
         // NOTE: If the signed integer format uses sign-magnitude
         // form (such as .NET's `System.Decimal`) or one's-complement
         // form,  use the following three lines instead of the preceding line;
         // here, zero will be rejected at a 50% chance because zero occurs
         // twice in both forms.
         // negative = RNDINT(1) == 0
         // if negative: ret = 0 - ret
         // if negative and ret == 0: continue
         if ret >= minInclusive and ret <= maxInclusive: return ret
       end
    END METHOD

A common use case of `RNDINTRANGE` is to simulate die rolls.  For example, to simulate rolling a six-sided die, generate a random number from 1 through 6 by calling `RNDINTRANGE(1, 6)`.

<a id=RNDBITS_Random_N_Bit_Integers></a>
### `RNDBITS`: Random N-Bit Integers

The following na&iuml;ve way of generating a **uniformly distributed random N-bit integer** is as follows:

     METHOD RNDBITS(bits)
        // NOTE: The maximum number that could be returned
        // here is 2^bits - 1, in which all `bits` bits are set to 1.
        return RNDINT((1 << bits) - 1)
     END METHOD

Although this works well for arbitrary-precision integers, it won't work well for the much more popular integer types called _fixed-length two's-complement signed integers_ [<sup>(1)</sup>](#Note1). For such signed integers as well as fixed-length unsigned integers, `RNDBITS(bits)` can be implemented using the pseudocode below.  In the pseudocode below, `BITCOUNT` is the number of bits used in the format.  Note that for such signed integers, `RNDBITS(bits)` can return a sequence of bits that resolves to a negative number.

    METHOD RNDBITS(bits)
         if bits<0 or bits > BITCOUNT: return error
         if bits==0: return 0
         if bits==1: return RNDINT(1)
         if bits==2 and BITCOUNT == 2
             return (RNDINT(1) << 1) | RNDINT(1)
         end
         if bits==2: return RNDINT(3)
         bitsMinus2 = bits - 2
         // NOTE: The "|" below is the OR operator between
         // two integers.  The following line is implemented this
         // way to accommodate implementations that use
         // fixed-length two's-complement signed integers.
         ret = (RNDINT((1<<bitsMinus2) - 1) << bitsMinus2) | RNDINT(3)
         // NOTE: If the implementation uses fixed-length
         // unsigned integers, the following line can replace
         // the preceding line.  Note that the implementation
         // avoids shifting an integer by BITCOUNT bits or more,
         // because such behavior is undefined in C and C++.
         // ret = RNDINT( (((1 << (bits - 1)) - 1) << 1) | 1 )
         // NOTE: Alternatively, a list containing powers-of-two
         // minus 1 can be generated (calculating `floor(pow(2,i)) - 1`
         // for each relevant index `i` of the list, assuming unlimited
         // precision) and the following line used instead of the
         // preceding (assuming `list` is
         // the list generated this way):
         // ret = RNDINT( list[bits] )
         return ret
    END METHOD

<a id=RNDU01_Random_Numbers_0_or_Greater_and_1_or_Less></a>
### `RNDU01`: Random Numbers 0 or Greater and 1 or Less

The following method, `RNDU01()`, generates a **random number 0 or greater and 1 or less**:

     METHOD RNDU01()
        return RNDINT(X) / X
     END METHOD

In the method above, `X` is the number of fractional parts between 0 and 1. (For fixed-precision floating-point number formats, `X` should equal the number of _significand permutations_ for that format. See "Generating uniform doubles in the unit interval" in the [`xoroshiro+` remarks page](http://xoroshiro.di.unimi.it/#remarks) for further discussion.)

For fixed-precision binary floating-point numbers with fixed exponent range (such as Java's `double` and `float`), the following pseudocode for `RNDU01()` can be used instead, which returns a uniformly-distributed **random number 0 or greater and 1 or less**.  It's based on a [technique devised by Allen Downey](http://allendowney.com/research/rand/), who found that dividing a random number by a constant usually does not yield all representable binary floating-point numbers in the desired range.  In the pseudocode below, `SIGBITS` is the binary floating-point format's precision (for examples, see the [note for "significand permutations"](#Notes_and_Definitions)).

    METHOD RNDU01()
        e=-SIGBITS
        while true
            if RNDINT(1)==0: e = e - 1
          else: break
        end
        sig = RNDINT((1 << (SIGBITS - 1)) - 1)
        if sig==0 and RNDINT(1)==0: e = e + 1
        sig = sig + (1 << (SIGBITS - 1))
        // NOTE: This multiplication should result in
        // a floating-point number; if `e` is sufficiently
        // small, the number will underflow to 0
        return sig * pow(2, e)
    END METHOD

<a id=RNDNUMRANGE_Random_Numbers_Within_a_Range_Maximum_Inclusive></a>
### `RNDNUMRANGE`: Random Numbers Within a Range, Maximum Inclusive

The na&iuml;ve way of generating **random number `minInclusive` or greater and `maxInclusive` or less**, is shown in the following pseudocode, which generally works well only if the number format can't be negative or that format uses arbitrary precision.

    METHOD RNDNUMRANGE(minInclusive, maxInclusive)
        if minInclusive > maxInclusive: return error
        return minInclusive + (maxInclusive - minInclusive) * RNDU01()
    END

For fixed-point or floating-point number formats with fixed precision (such as Java's `double` and `float`), the pseudocode above can overflow if the difference between `maxInclusive` and `minInclusive` exceeds the maximum possible value for the format.  For such formats, the following pseudocode for `RNDU01()` can be used instead.  In the pseudocode below, `NUM_MAX` is the highest possible value for the number format.  The pseudocode assumes that the highest possible value is positive and the lowest possible value is negative.

    METHOD RNDNUMRANGE(minInclusive, maxInclusive)
       if minInclusive > maxInclusive: return error
       if minInclusive == maxInclusive: return minInclusive
       // Difference does not exceed maxInclusive
       if minInclusive >= 0 or minInclusive + NUM_MAX >= maxInclusive
           return minInclusive + (maxInclusive - minInclusive) * RNDU01()
       end
       while true
         ret = RNDU01() * NUM_MAX
         // NOTE: If the number format uses sign-magnitude
         // representation, as is the case for Java `float` and
         // `double` and .NET's implementation of `System.Decimal`,
         // for example, use the following:
         negative = RNDINT(1) == 0
         if negative: ret = 0 - ret
         if negative and ret == 0: continue
         // NOTE: For fixed-precision fixed-point numbers implemented
         // using two's complement numbers (note 1), use the following line
         // instead of the preceding three lines, where `QUANTUM` is the
         // smallest representable positive number in the fixed-point format:
         // if RNDINT(1) == 0: ret = (0 - QUANTUM) - ret
         if ret >= minInclusive and ret <= maxInclusive: return ret
       end
    END

<a id=RNDINTEXC_Modified_Core_Method_Maximum_Exclusive></a>
### `RNDINTEXC`: Modified Core Method, Maximum Exclusive

A method based on `RNDINT(maxInclusive)` is called `RNDINTEXC(maxExclusive)` in this document; it generates a random integer **0 or greater** and **less than `maxExclusive`**, where `maxExclusive` is an integer greater than 0.  This variant is not given as the core random generation method because it's harder to fill integers in popular integer formats with random bits with this method. The method can be implemented as follows:

     METHOD RNDINTEXC(maxExclusive)
        if maxExclusive <= 0: return error
        return RNDINT(maxExclusive - 1)
     END METHOD

**Note:** Alternative ways of generating a random integer 0 or greater and less than the integer `maxExclusive` are the following:
- `floor(RNDNUMEXCRANGE(0, maxExclusive))`.
- Generate `X = floor(RNDU01OneExc()*(maxExclusive))` until `X < maxExclusive`. (The loop is needed because otherwise, rounding error due to the nature of certain floating-point formats can result in `maxExclusive` being returned in rare cases.<sup>[(5)](#Note5)</sup>)

These approaches, though, are recommended only if the programming language&mdash;
- supports only floating-point numbers (an example is JavaScript),
- is a dialect of SQL, or
- doesn't support an integer type that is big enough to fit the number `maxExclusive - 1`.

<a id=RNDINTEXCRANGE_Random_Integers_Within_a_Range_Maximum_Exclusive></a>
### `RNDINTEXCRANGE`: Random Integers Within a Range, Maximum Exclusive

A version of `RNDINTRANGE`, called `RNDINTEXCRANGE` here, returns a **random integer `minInclusive` or greater and less than `maxExclusive`**.  It can be implemented using [`RNDINTRANGE`](#Random_Integers_Within_a_Range_Maximum_Inclusive), as the following pseudocode demonstrates.

    METHOD RNDINTEXCRANGE(minInclusive, maxExclusive)
       if minInclusive >= maxExclusive: return error
       // NOTE: For signed integer formats, replace the following line
       // with "if minInclusive >=0 or minInclusive + INT_MAX >=
       // maxExclusive", where `INT_MAX` has the same meaning
       // as the pseudocode for `RNDINTRANGE`.
       if minInclusive >=0
         return RNDINTRANGE(minInclusive, maxExclusive - 1)
       end
       while true
         ret = RNDINTRANGE(minInclusive, maxExclusive)
         if ret < maxExclusive: return ret
       end
    END METHOD

<a id=RNDNUMEXCRANGE_Random_Numbers_Within_a_Range_Maximum_Exclusive></a>
### `RNDNUMEXCRANGE`: Random Numbers Within a Range, Maximum Exclusive

A version of `RNDNUMRANGE`, called `RNDNUMEXCRANGE` here, returns a  **random number `minInclusive` or greater and less than `maxExclusive`**.
 It can be implemented using [`RNDNUMRANGE`](#Random_Integers_Within_a_Range_Maximum_Inclusive), as the following pseudocode demonstrates.

    METHOD RNDNUMEXCRANGE(minInclusive, maxExclusive)
       if minInclusive >= maxExclusive: return error
       while true
         ret = RNDNUMRANGE(minInclusive, maxExclusive)
         if ret < maxExclusive: return ret
       end
    END METHOD

<a id=RNDU01OneExc_RNDU01ZeroExc_and_RNDU01ZeroOneExc_Related_Methods_for_Random_Numbers_Bounded_by_0_and_1></a>
#### `RNDU01OneExc`, `RNDU01ZeroExc`, and `RNDU01ZeroOneExc`: Related Methods for Random Numbers Bounded by 0 and 1

Three related methods also generate a **random number in an interval bounded at 0 and 1**.  They can be implemented as follows.

- **`RNDU01OneExc()` (0 or greater, but less than 1)** can be implemented in one of the following ways:
    - Call `RNDU01()` in a loop until a number other than 1.0 is generated this way.  This is preferred.
    - `RNDINT(X - 1) / X`, where X is the number of fractional parts between 0 and 1 (see `RNDU01()` section).
    - `RNDINTEXC(X) / X`, where X is the number of fractional parts between 0 and 1.

    Note that `RNDU01OneExc()` corresponds to `Math.random()` in Java and JavaScript.
- **`RNDU01ZeroExc()` (greater than 0, but 1 or less)** can be implemented in one of the following ways:
    - Call `RNDU01()` in a loop until a number other than 0.0 is generated this way.  This is preferred.
    - `(RNDINT(X - 1) + 1) / X`, where X is the number of fractional parts between 0 and 1.
    - `(RNDINTEXC(X) + 1) / X`, where X is the number of fractional parts between 0 and 1.
    - `1.0 - RNDU01OneExc()` (but this is recommended only if the set of numbers `RNDU01OneExc()` could return &mdash; as opposed to their probability &mdash; is evenly distributed).
- **`RNDU01ZeroOneExc()` (greater than 0, but less than 1)** can be implemented in one of the following ways:
    - Call `RNDU01()` in a loop until a number other than 0.0 or 1.0 is generated this way.  This is preferred.
    - `(RNDINT(X - 2) + 1) / X`, where X is the number of fractional parts between 0 and 1.
    - `(RNDINTEXC(X - 1) + 1) / X`, where X is the number of fractional parts between 0 and 1.

<a id=Randomization_Techniques></a>
## Randomization Techniques

This section describes commonly used randomization techniques, such as shuffling, selection of several unique items, and creating random strings of text.

<a id=Boolean_Conditions></a>
### Boolean Conditions

To generate a condition that is true at the specified probabilities, use
the following idioms in an `if` condition:

- True or false with equal probability: `RNDINT(1) == 0`.
- True with X percent probability: `RNDINTEXC(100) < X`.
- True with probability X/Y: `RNDINTEXC(Y) < X`.
- True with probability X, where X is from 0 through 1 (a _Bernoulli trial_): `RNDU01OneExc() < X`.
- **Example:** True with probability 3/8: `RNDINTEXC(8) < 3`.
- **Example:** True with 20% probability: `RNDINTEXC(100) < 20`.

<a id=Shuffling></a>
### Shuffling

The [Fisher&ndash;Yates shuffle method](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle) shuffles a list such that all permutations of that list are equally likely to occur, assuming the RNG it uses produces uniformly random numbers and can choose from among all permutations of that list.  However, that method is also easy to write incorrectly (see also Jeff Atwood, "[The danger of na&iuml;vet&eacute;](https://blog.codinghorror.com/the-danger-of-naivete/)").  The following pseudocode is designed to shuffle a list's contents.

    METHOD Shuffle(list)
       // NOTE: Check size of the list early to prevent
       // `i` from being less than 0 if the list's size is 0 and
       // `i` is implemented using an unsigned type available
       // in certain programming languages.
       if size(list) >= 2
          // Set i to the last item's index
          i = size(list) - 1
          while i > 0
             // Choose an item ranging from the first item
             // up to the item given in `i`. Note that the item
             // at i+1 is excluded.
             k = RNDINTEXC(i + 1)
             // The following is wrong since it introduces biases:
             // k = RNDINTEXC(size(list))
             // The following is wrong since the algorithm won't
             // choose from among all possible permutations:
             // k = RNDINTEXC(i)
             // Swap item at index i with item at index k;
             // in this case, i and k may be the same
             tmp = list[i]
             list[i] = list[k]
             list[k] = tmp
             // Move i so it points to the previous item
             i = i - 1
          end
       end
       // NOTE: An implementation can return the
       // shuffled list, as is done here, but this is not required.
       return list
    END METHOD

An important consideration with respect to shuffling is the nature of the underlying RNG, as I discuss in further detail in my [RNG recommendation document on shuffling](https://peteroupc.github.io/random.html#Shuffling).  It suffices to say here that in general, whenever a deterministic, uniformly-distributed RNG is otherwise called for, such an RNG is good enough for shuffling a 52-item list if its period is 2<sup>226</sup> or greater. (The _period_ is the maximum number of values in a generated sequence for an RNG before that sequence repeats).

**Note:** In simulation testing, shuffling is used to relabel items from a dataset at random, where each item in the dataset is assigned one of several labels.  In such testing:
- One or more statistics that involve the specific labeling of the original dataset's groups is calculated (such as the difference, maximum, or minimum of means or variances between groups).
- Multiple simulated datasets are generated. Each dataset is generated by merging the groups, shuffling the merged dataset, and relabeling each item in order such that the number of items in each group for the simulated dataset is the same as for the original dataset.
- For each simulated dataset, the same statistics are calculated as for the original dataset.
- The statistics for the simulated datasets are compared with those of the original.

<a id=Choosing_a_Random_Item_from_a_List></a>
### Choosing a Random Item from a List

To choose a random item from a list&mdash;

- whose size is known in advance, use the idiom `list[RNDINTEXC(size(list))]`.  This idiom assumes that the first item of the list is at position 0, the second is at position 1, and so on; or
- whose size is not known in advance, use a method like the following.  Although the pseudocode refers to files and lines, the technique applies to any situation when items are retrieved one at a time from a dataset or list whose size is not known in advance.

        METHOD RandomItemFromFile(file)
           i = 1
           lastItem = nothing
           while true
              // Get the next line from the file
              item = GetNextLine(file)
              // The end of the file was reached, break
              if item == nothing: break
              if RNDINTEXC(i) == 0: lastItem = item
              i = i + 1
           end
        end

Choosing an item this way is also known as _sampling with replacement_.

**Note:** [_Bootstrapping_](https://en.wikipedia.org/wiki/Bootstrapping_%28statistics%29) is a method of creating a simulated dataset by choosing random items with replacement from an existing dataset until both datasets have the same size.  (The simulated dataset can contain duplicates this way.)  Usually, multiple simulated datasets are generated this way, one or more statistics, such as the mean, are calculated for each simulated dataset as well as the original dataset, and the statistics for the simulated datasets are compared with those of the original.

<a id=Creating_a_Random_Character_String></a>
### Creating a Random Character String

A commonly asked question involves how to generate a random string of characters (usually a random _alphanumeric string_, or string of letters and digits).

The first step is to generate a list of the letters, digits, and/or other characters the string can have.  Often, those characters will be&mdash;
* the basic digits "0" to "9" (U+0030-U+0039, nos. 48-57),
* the basic upper case letters "A" to "Z" (U+0041-U+005A, nos. 65-90), and
* the basic lower case letters "a" to "z" (U+0061-U+007A, nos. 96-122),

as found in the Basic Latin block of the Unicode Standard. Note that:

- If the list of characters is fixed, the list can be statically created at runtime or compile time, or a string type as provided in the programming language can be used to store the list as a string.
- Instead of individual characters, the list can consist of strings of one or more characters each.  In that case, storing the list of strings as a single string is usually not a clean way to store those strings.

The second step is to build a new string whose characters are chosen from that character list.  The pseudocode below demonstrates this by creating a list, rather than a string, where the random characters will be held.  It also takes the number of characters as a parameter named `size`.  (Converting this list to a text string is programming-language-dependent, and the details of the conversion are outside the scope of this page.)

      METHOD RandomString(characterList, stringSize)
           i = 0
           newString = NewList()
           while i < stringSize
               // Choose a character from the list
               randomChar = characterList[RNDINTEXC(size(characterList))]
               // Add the character to the string
               AddItem(newString, randomChar)
               i = i + 1
            end
            return newString
      END METHOD

_**Note:** Often applications need to generate a string of characters that's not only random, but also unique.  The best way to ensure uniqueness in this case is to store a list (such as a hash table) of strings already generated and to check newly generated strings against the list (or table).  Random number generators alone should not be relied on to deliver unique results._

<a id=Choosing_Several_Unique_Items></a>
### Choosing Several Unique Items

Often, the need arises to choose `k` unique items or values from among `n` available items or values.  (This is also known as _sampling without replacement_.) The following assumes that each item has an equal chance of being chosen.  There are several techniques for doing this depending on whether `n` is known and how big it is:

- **If `n` is not known in advance:** Use the _reservoir sampling_ method, implemented below.  Although the pseudocode refers to files and lines, the technique applies to any situation when items are retrieved one at a time from a dataset or list whose size is not known in advance.

        METHOD RandomKItemsFromFile(file, k)
           list = NewList()
           j = 0
           endOfFile = false
           while j < k
              // Get the next line from the file
              item = GetNextLine(file)
              // The end of the file was reached, break
              if item == nothing
                 endOfFile = true
                 break
              end
              AddItem(list, item)
              j = j + 1
           end
           i = 1 + k
           while endOfFile == false
              // Get the next line from the file
              item = GetNextLine(file)
              // The end of the file was reached, break
              if item == nothing: break
              j = RNDINTEXC(i)
              if j < k: list[j] = item
              i = i + 1
           end
           // We shuffle at the end in case k or fewer
           // lines were in the file, since in that
           // case the items would appear in the same
           // order as they appeared in the file
           // if the list weren't shuffled.  This line
           // can be removed, however, if the items
           // in the returned list need not appear
           // in random order.
           Shuffle(list)
           return list
        end
- **If `n` is relatively small (for example, if there are 200 available items, or there is a range of numbers from 0 to 200 to choose from):** Either&mdash;
    - store all the items in a list, [shuffle](#Shuffling) that list, then choose the first `k` items from that list, or
    - if the items are already stored in a list, then store the indices to those items in another list, shuffle the latter list, then choose the first `k` indices (or items corresponding to those indices) from the latter list.
- **If `n` is relatively small and items are to be chosen in order**, then the following pseudocode can be used (based on a technique presented in Devroye 1986, p. 620):

        METHOD RandomKItemsInOrder(list, k)
           i = 0
           kk = k
           ret = NewList()
           n = size(list)
           while i  < n and size(ret) < k
             u = RNDINTEXC(n - i)
             if u <= kk
              AddItem(ret, list[i])
              kk = kk - 1
             end
             i = i + 1
          end
          return ret
        END METHOD

- **If `n` is relatively large (for example, if 32-bit or larger integers will be chosen so that `n` is 2<sup>32</sup> or is a greater power of 2):** Create a [hash table](https://en.wikipedia.org/wiki/Hash_table) storing the indices to items already chosen.  When a new index to an item is randomly chosen, check the hash table to see if it's there already.  If it's not there already, add it to the hash table.  Otherwise, choose a new random index.  Repeat this process until `k` indices were added to the hash table this way.  This technique can also be used for relatively small `n`, if some of the items have a higher probability of being chosen than others (see also [Discrete Weighted Choice](#Discrete_Weighted_Choice)).  If the items are to be chosen in order, then a [red&ndash;black tree](https://en.wikipedia.org/wiki/Red%E2%80%93black_tree), rather than a hash table, can be used to store the indices this way; after `k` indices are added to the tree, the indices (and the items corresponding to them) can be retrieved in sorted order.  Performance considerations involved in storing data in hash tables or red-black trees, and in retrieving data from them, are outside the scope of this document.

<a id=Almost_Random_Sampling></a>
### Almost-Random Sampling

Some applications (particularly some games) may find it important to control which random numbers appear, to make the random outcomes appear fairer to users.  Without this control, a user may experience long streaks of good outcomes or long streaks of bad outcomes, both of which are theoretically possible with a random number generator.  To implement this kind of "almost-random" sampling, an application can do one of the following:

- Generate a list of possible outcomes (for example, the list can contain 10 items labeled "good" and three labeled "bad") and [shuffle](#Shuffling) that list.  Each time an outcome must be generated, choose the next unchosen outcome from the shuffled list.  Once all those outcomes are chosen, shuffle the list and continue.
- Create two lists: one list with the different possible outcomes, and another list of the same size containing an integer weight 0 or greater for each outcome (for example, one list can contain the items "good" and "bad", and the other list can contain the weights 10 and 3, respectively).  Each time an outcome must be generated, choose one outcome using the [weighted choice without replacement](#Weighted_Choice_Without_Replacement) technique.  Once all of the weights are 0, re-fill the list of weights with the same weights the list had at the start, and continue.

However, "almost-random" sampling techniques are not recommended&mdash;
- whenever computer or information security is involved, or
- in cases (such as in multiplayer networked games) when predicting future random numbers would give a player or user a significant and unfair advantage.

**Note:** [Monte Carlo integration](https://en.wikipedia.org/wiki/Monte_Carlo_integration) uses randomization to estimate a multidimensional integral. It involves evaluating a function at N random points in the domain, adding them up, then dividing the sum by N.  The ["Variance" MathWorld article](http://mathworld.wolfram.com/Variance.html) gives methods for calculating the estimate's variance. (After calculating the error, or square root of variance, and the estimated integral, both can be multiplied by the volume of the domain.) Often _quasirandom sequences_ (also known as [_low-discrepancy sequences_](https://en.wikipedia.org/wiki/Low-discrepancy_sequence), such as Sobol and Halton sequences), often together with a uniformly-distributed RNG, provide the "random" numbers to sample the function more efficiently.  Unfortunately, the methods to produce such sequences are too complicated to show here.

<a id=Non_Uniform_Distributions></a>
## Non-Uniform Distributions

Some applications need to choose random items or numbers such that some of them are more likely to be chosen than others.
This section describes how to use the [uniform random number methods](#Uniform_Random_Numbers) to generate random numbers that follow a non-uniform statistical distribution.  (Some of the techniques in this section discuss ways to generate data uniformly at random;
they're included here because they often involve non-uniform distributions.)

<a id=Discrete_Weighted_Choice></a>
### Discrete Weighted Choice

The discrete weighted choice method is used to choose a random item from among a set of them with separate probabilities of being chosen.

The following pseudocode takes a single list `weights`, and returns the index of a weight from that list.  The greater the weight, the more likely its index will be chosen. (Note that there are two possible ways to generate the random number depending on whether the weights are all integers or can be fractional numbers.) Each weight should be 0 or greater.

    METHOD DiscreteWeightedChoice(weights)
        if size(weights) == 0: return error
        sum = 0
        // Get the sum of all weights
        i = 0
        while i < size(weights)
            sum = sum + weights[i]
            i = i + 1
        end
        // Choose a random integer/number from 0 to less than
        // the sum of weights.
        value = RNDINTEXC(sum)
        // NOTE: If the weights can be fractional numbers,
        // use this instead:
        // value = RNDNUMEXCRANGE(0, sum)
        // Choose the object according to the given value
        i = 0
        lastItem = size(weights) - 1
        runningValue = 0
        while i < size(weights)
           if weights[i] > 0
              newValue = runningValue + weights[i]
              // NOTE: Includes start, excludes end
              if value < newValue: return i
              runningValue = newValue
              lastItem = i
           end
           i = i + 1
        end
        // Last resort (might happen because rounding
        // error happened somehow)
        return lastItem
    END METHOD

<a id=Example></a>
#### Example

Assume we have the following list: `["apples", "oranges", "bananas", "grapes"]`, and `weights` is the following: `[3, 15, 1, 2]`.  The weight for "apples" is 3, and the weight for "oranges" is 15.  Since "oranges" has a higher weight than "apples", the index for "oranges" (1) is more likely to be chosen than the index for "apples" (0) with the `DiscreteWeightedChoice` method.  The following pseudocode implements how to get a randomly chosen item from the list with that method.

    index = DiscreteWeightedChoice(weights)
    // Get the actual item
    item = list[index]

<a id=Weighted_Choice_Without_Replacement></a>
#### Weighted Choice Without Replacement

In the example above, the weights sum to 21.  However, the weights do not mean that when 21 items are selected, the index for "apples" will be chosen exactly 3 times, or the index for "oranges" exactly 15 times, for example.  Each call to `DiscreteWeightedChoice` is independent from the others, and each weight indicates only a _likelihood_ that the corresponding index will be chosen rather than the other indices.  And this likelihood doesn't change no matter how many times `DiscreteWeightedChoice` is called with the same weights.  This is called a weighted choice _with replacement_, which can be thought of as drawing a ball, then putting it back.

To implement weighted choice _without replacement_ (which can be thought of as drawing a ball _without_ putting it back), simply call `DiscreteWeightedChoice`, and then decrease the weight for the chosen index by 1.  In this way, when items are selected repeatedly, each weight behaves like the number of "copies" of each item. This technique, though, will only work properly if all the weights are integers 0 or greater.  The pseudocode below is an example of this.

    // Get the sum of weights
    // (NOTE: This code assumes that `weights` is
    // a list that can be modified.  If the original weights
    // are needed for something else, a copy of that
    // list should be made first, but the copying process
    // is not shown here.  This code also assumes that `list`,
    // a list of items, was already declared earlier and
    // has at least as many items as `weights`.)
    totalWeight = 0
    i = 0
    while i < size(weights)
        totalWeight = totalWeight + weights[i]
        i = i + 1
    end
    // Choose as many items as the sum of weights
    i = 0
    items = NewList()
    while i < totalWeight
        index = DiscreteWeightedChoice(weights)
        // Decrease weight by 1 to implement selection
        // without replacement.
        weights[index] = weights[index] - 1
        AddItem(items, list[index])
        i = i + 1
    end

Alternatively, if all the weights are integers 0 or greater and their sum is relatively small, create a list with as many copies of each item as its weight, then [shuffle](#Shuffling) that list.  The resulting list will be ordered in a way that corresponds to a weighted random choice without replacement.

<a id=Choosing_Multiple_Items></a>
#### Choosing Multiple Items

The discrete weighted choice method can also be used for choosing multiple items from a list, whether or not the items have the same probability of being chosen.  In this case, after choosing a random index, set the weight for that index to 0 to keep it from being chosen again.  The pseudocode below is an example of this.

    // (NOTE: This code assumes that `weights` is
    // a list that can be modified.  If the original weights
    // are needed for something else, a copy of that
    // list should be made first, but the copying process
    // is not shown here.  This code also assumes that `list`,
    // a list of items, was already declared earlier and
    // has at least as many items as `weights`.)
    chosenItems = NewList()
    i = 0
    // Choose k items from the list
    while i < k or i < size(weights)
        index = DiscreteWeightedChoice(weights)
        // Set the weight for the chosen index to 0
        // so it won't be chosen again
        weights[index] = 0
        // Add the item at the chosen index
        AddItem(chosenItems, list[index])
    end
    // `chosenItems` now contains the items chosen

<a id=Piecewise_Constant_Distribution></a>
#### Piecewise Constant Distribution

The discrete weighted choice method can also be used to implement a [_piecewise constant distribution_](http://en.cppreference.com/w/cpp/numeric/random/piecewise_constant_distribution), as in the following example. Assume we have the following list: `[0, 5, 10, 11, 15]`, and `weights` is the following: `[3, 15, 1, 2]`.  Note that the weight list has one fewer item than the number list.  The weight for "0 to 5" (0 or greater, less than 5) is 3, and the weight for "5 to 10" is 15.  Since "5 to 10" has a higher weight than "0 to 5", this distribution will choose a number from 5 to 10 more often than a number from 0 to 5.  The following pseudocode implements the piecewise constant distribution.

    // Choose a random index
    index = DiscreteWeightedChoice(weights)
    // Choose a random number in the chosen interval on the list
    number = list[index] + (list[index + 1] - list[index]) * RNDU01OneExc()

The code above implements the distribution _with replacement_.  Implementing the distribution _without replacement_ is similar to implementing discrete weighted choice without replacement; the only change is
to replace `AddItem(items, list[index])` with `AddItem(items, list[index] + (list[index + 1] - list[index]) * RNDU01OneExc())` in the pseudocode.

<a id=Multinomial_Distribution></a>
#### Multinomial Distribution

The discrete weighted choice method can also be used to implement a _multinomial distribution_.  This distribution models the number of times each of several mutually exclusive events happens among a given number of trials, where each event can have a separate probability of happening.  The pseudocode below is of a method that takes two parameters: `trials`, which is the number of trials, and `weights`, which are the relative probabilities of each event.  The method tallies the events as they happen and returns a list (with the same size as `weights`) containing the number of successes for each event.

    METHOD Multinomial(trials, weights)
        if trials < 0: return error
        // create a list of successes
        list = NewList()
        i = 0
        while i < size(weights)
           AddItem(list, 0)
           i = i + 1
        end
        i = 0
        while i < trials
            // Choose an index
            index = DiscreteWeightedChoice(weights)
            // Tally the event at the chosen index
            list[index] = list[index] + 1
            i = i + 1
        end
        return list
    END METHOD

<a id=Continuous_Weighted_Choice></a>
### Continuous Weighted Choice

The continuous weighted choice method is used to choose a random number that follows a continuous statistical distribution (here, a [_piecewise linear distribution_](http://en.cppreference.com/w/cpp/numeric/random/piecewise_linear_distribution)).

The following pseudocode takes two lists, `list` and `weights`, and returns a random number that follows the distribution.  `list` is a list of numbers (which can be fractional numbers) that should be arranged in ascending order, and `weights` is a list of _probability densities_ for the given numbers (where each number and its density have the same index in both lists). (A number's _probability density_ is the relative probability that a randomly chosen value will be infinitesimally close to that number, assuming no precision limits.)  Each probability density should be 0 or greater.  Both lists should be the same size.  In the pseudocode below, the first number in `list` can be returned exactly, but not the last item in `list`, assuming the numbers in `list` are arranged in ascending order.

    METHOD ContinuousWeightedChoice(list, weights)
        if size(list) <= 0 or size(weights) < size(list): return error
        if size(list) == 1: return list[0]
        // Get the sum of all areas between weights
        sum = 0
        areas = NewList()
        i = 0
        while i < size(list) - 1
          weightArea = abs((weights[i] + weights[i + 1]) * 0.5 *
                (list[i + 1] - list[i]))
          AddItem(areas, weightArea)
          sum = sum + weightArea
           i = i + 1
        end
        // Choose a random number
        value = RNDNUMEXCRANGE(0, sum)
        // Interpolate a number according to the given value
        i=0
        // Get the number corresponding to the random number
        runningValue = 0
        while i < size(list) - 1
         area = areas[i]
         if area > 0
          newValue = runningValue + area
          // NOTE: Includes start, excludes end
          if value < newValue
           // NOTE: The following line can also read
           // "interp = RNDU01OneExc()", that is, a new number is generated
           // within the chosen area rather than using the point
           // already generated.
           interp = (value - runningValue) / (newValue - runningValue)
           retValue = list[i] + (list[i + 1] - list[i]) * interp
           return retValue
          end
          runningValue = newValue
         end
         i = i + 1
        end
        // Last resort (might happen because rounding
        // error happened somehow)
        return list[size(list) - 1]
    END METHOD

<a id=Example_2></a>
#### Example

Assume `list` is the following: `[0, 1, 2, 2.5, 3]`, and `weights` is the following: `[0.2, 0.8, 0.5, 0.3, 0.1]`.  The probability density for 2 is 0.5, and that for 2.5 is 0.3.  Since 2 has a higher probability density than 2.5, numbers near 2 are more likely to be chosen than numbers near 2.5 with the `ContinuousWeightedChoice` method.

<a id=Dice></a>
### Dice

The following method generates a random result of rolling virtual dice.  It takes three parameters: the number of dice (`dice`), the number of sides in each die (`sides`), and a number to add to the result (`bonus`) (which can be negative, but the result of the subtraction is 0 if that result is greater).

    METHOD DiceRoll(dice, sides, bonus)
        if dice < 0 or sides < 1: return error
        if dice == 0: return 0
        if sides == 1: return dice
        ret = 0
        if dice > 50
            // If there are many dice to roll,
            // use a faster approach, noting that
            // the dice-roll distribution approaches
            // a "discrete" normal distribution as the
            // number of dice increases.
            mean = dice * (sides + 1) * 0.5
            sigma = sqrt(dice * (sides * sides - 1) / 12)
            ret = -1
            while ret < dice and ret > dice * sides
                ret = floor(Normal(mean, sigma) + 0.5)
            end
         else
             i = 0
             while i < dice
                  ret = ret + RNDINTRANGE(1, sides)
                  i = i + 1
              end
         end
         ret = ret + bonus
         if ret < 0: ret = 0
         return ret
    END METHOD

As examples, the result of rolling&mdash;
- four six-sided virtual dice ("4d6") is `DiceRoll(4,6,0)`,
- three ten-sided virtual dice, with 4 added ("3d10 + 4"), is `DiceRoll(3,10,4)`, and
- two six-sided virtual dice, with 2 subtracted ("2d6 - 2"), is `DiceRoll(2,6,-2)`.

This section used the following sources:

- Red Blob Games, ["Probability and Games: Dice Rolls"](http://www.redblobgames.com/articles/probability/damage-rolls.html) was the main source for the dice-roll distribution.  The method `random(N)` in that document corresponds to `RNDINTEXC(N)` in this document.
- The [MathWorld article "Dice"](http://mathworld.wolfram.com/Dice.html) provided the mean of the dice roll distribution.
- S. Eger, "Stirling's approximation for central extended binomial coefficients", 2014, helped suggest the variance of the dice roll distribution.

<a id=Normal_Gaussian_Distribution></a>
### Normal (Gaussian) Distribution

The normal distribution (also called the Gaussian distribution) can model many kinds of measurements or scores whose values are most likely around a given average and are less likely the farther away from that average on either side.

The following method generates two [normally-distributed](https://en.wikipedia.org/wiki/Normal_distribution)
random numbers with mean (average) `mu` (&mu;) and standard deviation `sigma` (&sigma;), using the polar method <sup>[(2)](#Note2)</sup>.  (In a _standard normal distribution_, &mu; = 0 and &sigma; = 1.)
The standard deviation `sigma` affects how wide the normal distribution's "bell curve" appears; the
probability that a normally-distributed random number will be within one standard deviation from the mean is about 68.3%; within two standard deviations (2 times `sigma`), about 95.4%, and within three standard deviations, about 99.7%.

    METHOD Normal2(mu, sigma)
      while true
        a = RNDU01()
        b = RNDU01()
        if a != 0 and RNDINT(1) == 0: a = 0 - a
        if b != 0 and RNDINT(1) == 0: b = 0 - b
        c = a * a + b * b
        if c != 0 and c <= 1
           c = sqrt(-2 * ln(c) / c)
           return [c * a, c * b]
        end
      end
    END METHOD

Since `Normal2` returns two numbers instead of one, but many applications require only one number at a time, a problem arises on how to return one number while storing the other for later retrieval.  Ways to solve this problem are outside the scope of this page, however.  The name `Normal` will be used in this document to represent a method that returns only one normally-distributed random number rather than two.

Also note that a normally-distributed random number can theoretically fall anywhere on the number line, even if it's extremely far from the mean.  Depending on the use case, an application may need to reject normally-distributed numbers lower than a minimum threshold and/or higher than a maximum threshold and generate new normally-distributed numbers, or to clamp outlying numbers to those thresholds.  But then the resulting distribution would no longer be a real normal distribution, but rather a _truncated_ or _censored_ normal distribution, respectively.   (Rejecting or clamping outlying numbers this way can be done for any statistical distribution, not just a normal distribution.)

Alternatively, or in addition, the following method (implementing a ratio-of-uniforms technique) can be used to generate normally distributed random numbers.

    METHOD Normal(mu, sigma)
        bmp = 0.8577638849607068 // sqrt(2/exp(1))
        while true
            a=RNDU01ZeroExc()
            b=RNDNUMRANGE(-bmp,bmp)
            if b*b <= -a * a * 4 * ln(a)
                return (b * sigma / a) + mu
            end
        end
    END METHOD

<a id=Generating_Random_Points_on_the_Surface_of_a_Hypersphere></a>
#### Generating Random Points on the Surface of a Hypersphere

Generating N `Normal(0, 1)` random numbers, then dividing them by their _norm_ (the square root of the sum of squares of the numbers generated this way, that is, `sqrt(num1 * num1 + num2 * num2 + ... + numN * numN)`) will result in an N-dimensional point lying on the surface of an N-dimensional hypersphere of radius 1 (that is, the surface formed by all points lying 1 unit away from a common point in N-dimensional space).  [Reference](http://mathworld.wolfram.com/HyperspherePointPicking.html).
(In the exceptional case that the norm is 0, the process should repeat.)

<a id=Generating_Random_Points_Inside_a_Ball></a>
#### Generating Random Points Inside a Ball

To generate an N-dimensional point inside an N-dimensional ball of radius R, an application can either&mdash;

- generate N `Normal(0, 1)` random numbers, generate `X = sqrt( S - ln(RNDU01ZeroExc()))`, where `S` is the sum of squares of the random numbers, and multiply each random number by `R / X` (if `X` is 0, the process should repeat), or
- generate N `RNDNUMRANGE(-R, R)` random numbers<sup>[(3)](#Note3)</sup> until the _norm_ of the N numbers is R or less,

although the former method "may ... be slower" "in practice", according to a [MathWorld article](http://mathworld.wolfram.com/BallPointPicking.html), which was the inspiration for the two methods given here.

If the ball is hollow, that is, only points within a range of distances from the center of the ball are allowed, then use either method given earlier to generate a random point for a ball of radius equal to the maximum allowed distance, until the _norm_ of a point generated this way is within the desired range of distances.

<a id=Binomial_Distribution></a>
### Binomial Distribution

The following method generates a random integer that follows a binomial distribution.  This number&mdash;
- expresses the number of successes that have happened after a given number of independently performed trials
(expressed as `trials` below), where the probability of a success in each trial is `p` (which ranges from 0, never, to
1, always, and which can be 0.5, meaning an equal chance of success or failure), and
- is also known as  [_Hamming distance_](https://en.wikipedia.org/wiki/Hamming_distance), if each trial is treated
as a "bit" that's set to 1 for a success and 0 for a failure, and if `p` is 0.5.

**Examples:**
- If `p` is 0.5, the binomial distribution models the task "Flip N coins, then count the number of heads."
- The idiom `Binomial(N, 0.5) >= C` is true if at least C coins, among N coins flipped, show the successful outcome (for example, heads if heads is the successful outcome).
- The idiom `Binomial(N, 1/S)` models the task "Roll N S-sided dice, then count the number of dice that show the number S."

----

    METHOD Binomial(trials, p)
        if trials < 0: return error
        if trials == 0: return 0
        // Always succeeds
        if p >= 1.0: return trials
        // Always fails
        if p <= 0.0: return 0
        i = 0
        count = 0
        // Suggested by Saucier, R. in "Computer
        // generation of statistical distributions", 2000, p. 49
        tp = trials * p
        if tp > 25 or (tp > 5 and p > 0.1 and p < 0.9)
             countval = -1
             // "countval
             while countval < 0 and countval > trials
                  countval = floor(Normal(tp, tp) + 0.5)
             end
             return countval
        end
        if p == 0.5
            while i < trials
                if RNDINT(1) == 0
                    // Success
                    count = count + 1
                end
                i = i + 1
            end
        else
            while i < trials
                if RNDU01OneExc() < p
                    // Success
                    count = count + 1
                end
                i = i + 1
            end
        end
        return count
    END METHOD

<a id=Hypergeometric_Distribution></a>
### Hypergeometric Distribution

The following method generates a random integer that follows a hypergeometric distribution.
When a given number of items are drawn at random without replacement from a set of items
each labeled either `1` or `0`,  the random integer expresses the number of items drawn
this way that are labeled `1`.  In the method below, `trials` is the number of items
drawn at random, `ones` is the number of items labeled `1` in the set, and `count` is
the number of items labeled `1` or `0` in that set.

**Example:** In a 52-card deck of Anglo-American playing cards, 12 of the cards are face
cards (jacks, queens, or kings).  After the deck is shuffled and seven cards are drawn, the number
of face cards drawn this way follows a hypergeometric distribution where `trials` is 7, `ones` is
12, and `count` is 52.

    METHOD Hypergeometric(trials, ones, count)
        if ones < 0 or count < 0 or trials < 0 or ones > count or trials > count
                return error
        end
        if ones == 0: return 0
       successes = 0
        i = 0
        currentCount = count
        currentOnes = ones
        while i < trials and currentOnes > 0
                if RNDINTEXC(currentCount) < currentOnes
                        currentOnes = currentOnes - 1
                        successes = successes + 1
                end
                currentCount = currentCount - 1
                i = i + 1
        end
        return successes
    END METHOD

<a id=Poisson_Distribution></a>
### Poisson Distribution

The following method generates a random integer that follows a Poisson distribution. In the method below, the `mean` is the average number of independent events of a certain kind per fixed unit of time or space (for example, per day, hour, or square kilometer), and the method's return value gives a random number of such events during one such unit.

The random integer from the method below is such that the average of the random integers approaches the given mean number when this method is called repeatedly with the same mean.  Note that the mean can be an integer or a non-integer. The method given here is based on Knuth's method from 1969.

    METHOD Poisson(mean)
        if mean < 0: return error
        if mean == 0: return 0
        p = 1.0
        // Suggested by Saucier, R. in "Computer
        // generation of statistical distributions", 2000, p. 49
        if mean > 9
            p = -1.0
            while p < 0: p = floor(Normal(mean, mean) + 0.5)
            return p
        end
        pn = exp(-mean)
        count = 0
        while true
            count = count + 1
            p = p * RNDU01OneExc()
            if p <= pn
                    return count - 1
            end
        end
    END METHOD

<a id=Gamma_Distribution></a>
### Gamma Distribution

The following method generates a random number that follows a gamma distribution.
The gamma distribution models expected lifetimes. The method given here is based on Marsaglia and Tsang's method from 2000.

    METHOD GammaDist(meanLifetime)
        // Must be greater than 0
        if meanLifetime <= 0: return error
        // Exponential special case (see also
        // Devroye 1986, p. 405)
        if meanLifetime == 1: return -ln(RNDU01ZeroOneExc())
        d = meanLifetime
        v = 0
        if meanLifetime < 1: d = d + 1
        d = d - (1.0 / 3) // NOTE: 1.0 / 3 must be a fractional number
        c = 1.0 / sqrt(9 * d)
        while true
            x = 0
            while true
               x = Normal(0, 1)
               v = c * x + 1;
               v = v * v * v
               if v > 0: break
            end
            u = RNDU01ZeroExc()
            x2 = x * x
            if u < 1 - (0.0331 * x2 * x2): break
            if ln(u) < (0.5 * x2) + (d * (1 - v + ln(v))): break
        end
        ret = d * v
        if meanLifetime < 1
           ret = ret * exp(ln(RNDU01ZeroExc()) / meanLifetime)
        end
        return ret
    end

Extended versions of the gamma distribution:

- The two-parameter gamma distribution (`GammaDist2(a, b)`), where `b` is the scale, is `GammaDist(a) * b`.  Here, `a` can be seen as the mean lifetime in unspecified units of time, and `b` indicates the size of each unit of time.
- The three-parameter gamma distribution (`GammaDist3(a, b, c)`), where `c` is another shape parameter, is `pow(GammaDist(a), 1.0 / c) * b`.
- The four-parameter gamma distribution (`GammaDist4(a, b, c, d)`), where `d` is the minimum value, is `pow(GammaDist(a), 1.0 / c) * b + d`.

<a id=Generating_Random_Numbers_with_a_Given_Positive_Sum></a>
#### Generating Random Numbers with a Given Positive Sum

The _Dirichlet distribution_ models a distribution of N numbers that sum to a given positive number, `total`.  Generating N `GammaDist(total)` calls and dividing them by their sum will result in N random numbers that (approximately) sum to `total` (see the [Wikipedia article](https://en.wikipedia.org/wiki/Dirichlet_distribution#Gamma_distribution)).  For example, if `total` is 1, the numbers will (approximately) sum to 1.  Note the following:

- In the exceptional case that all numbers are 0, the process should repeat.
- A more general version of the Dirichlet distribution allows the parameter in `GammaDist` to vary for each random number.
- If `total` is 1, the exponential distribution, described [later](#Other_Non_Uniform_Distributions), can be used instead of `GammaDist(1)` to generate the random numbers; see also Devroye 1986, p. 405.

An alternative method, which can work better if random integers are to be generated instead of random numbers, is illustrated in the following pseudocode.  In the pseudocode below, `Sort(list)` sorts the items in `list` in ascending order. (Note that details on sort algorithms are outside the scope of this document.)

    METHOD NumbersWithSum(n, total)
        if n <= 0 or total <=0: return error
        list = NewList()
        i = 0
        while i < n - 1
           AddItem(list, RNDNUMRANGE(0, total))
           // NOTE: If only integers are to be generated, the following
           // can be used instead of the preceding line:
           // AddItem(list, RNDINT(total))
           i = i + 1
         end
         AddItem(list, total)
         Sort(list)
         prev = list[0]
         i = 1
        while i < n
             newValue = list[i] - prev
             prev = list[i]
             list[i] = newValue
             i = i + 1
        end
    END METHOD

<a id=Negative_Binomial_Distribution></a>
### Negative Binomial Distribution

The following method generates a random integer that follows a negative binomial distribution.  This number expresses the number of failures that have happened after seeing a given number of successes (expressed as `successes` below), where the probability of a success in each case is `p` (which can be greater than 0, never, and equal to or less than 1, always, and which can be 0.5, meaning an equal chance of success or failure).

**Example:** If `p` is 0.5 and `successes` is 1, the negative binomial distribution models the task "Flip a coin until you get tails, then count the number of heads."

The following implementation of the negative binomial distribution allows `successes` to be an integer or a non-integer (and implements a distribution also known as the _P&oacute;lya distribution_).

    METHOD NegativeBinomial(successes, p)
        // Must be 0 or greater
        if successes < 0: return error
        // No failures if no successes or if always succeeds
        if successes == 0 or p >= 1.0: return 0
        // Always fails (NOTE: infinity can be the maximum possible
        // integer value if NegativeBinomial is implemented to return
        // an integer)
        if p <= 0.0: return infinity
        if successes == 1.0
            // Geometric distribution special case (see Saucier 2000)
            return floor(ln(RNDU01ZeroExc()) / ln(1.0 - p))
        else
            return Poisson(GammaDist(successes) * (1 - p) / p)
        end
    END METHOD

The following implementation of the negative binomial distribution allows `successes` to be an integer only.

    METHOD NegativeBinomialInt(successes, p)
        // Must be 0 or greater
        if successes < 0: return error
        // No failures if no successes or if always succeeds
        if successes == 0 or p >= 1.0: return 0
        // Always fails (NOTE: infinity can be the maximum possible
        // integer value if NegativeBinomialInt is implemented to return
        // an integer)
        if p <= 0.0: return infinity
        count = 0
        total = 0
        if successes == 1
            if p == 0.5
              while RNDINT(1) == 0: count = count + 1
               return count
            end
            // Geometric distribution special case (see Saucier 2000)
            return floor(ln(RNDU01ZeroExc()) / ln(1.0 - p))
        end
        while true
            if RNDU01OneExc() < p
                // Success
                total = total + 1
                if total >= successes
                        return count
                end
            else
                // Failure
                count = count + 1
            end
        end
    END METHOD

<a id=von_Mises_Distribution></a>
### von Mises Distribution

The von Mises distribution describes a distribution of circular angles.  In the pseudocode below, the `mean` is the mean angle, `kappa` is a shape parameter, and the method can return a number within &pi; of that mean.  The algorithm below is the Best&ndash;Fisher algorithm from 1979 (as described in Devroye 1986 with errata incorporated).

    METHOD VonMises(mean, kappa)
        if kappa < 0: return error
        if kappa == 0
            return RNDNUMEXCRANGE(mean-pi, mean+pi)
        end
        r = 1.0 + sqrt(4 * kappa * kappa + 1)
        rho = (r - sqrt(2 * r)) / (kappa * 2)
        s = (1 + rho * rho) / (2 * rho)
        while true
            u = RNDNUMEXCRANGE(-1, 1)
            v = RNDU01ZeroOneExc()
            z = cos(pi * u)
            w = (1 + s*z) / (s + z)
            y = kappa * (s - w)
            if y*(2 - y) - v >=0 or ln(y / v) + 1 - y >= 0
               if angle<-1: angle=-1
               if angle>1: angle=1
               angle = acos(w)
               if u < 0: angle = -angle
               return mean + angle
            end
        end
    END METHOD

<a id=Stable_Distribution></a>
### Stable Distribution

A stable distribution is a limiting distribution of the sum of independent and identically distributed random variables; the distribution resembles a curve with a single peak, but with generally "fatter" tails than the normal distribution.  The pseudocode below uses the Chambers&ndash;Mallows&ndash;Stuck algorithm.  The two shape parameters are `alpha` (stability index, greater than 0 and 2 or less) and `beta` (skewness, -1 or greater and 1 or less); if `beta` is 0, the curve is symmetric.

    METHOD Stable(alpha, beta)
         if alpha <=0 or alpha > 2: return error
         if beta < -1 or beta > 1: return error
        halfpi = pi * 0.5
        unif=RNDNUMEXCRANGE(-halfpi, halfpi)
        while unif==-halfpi: unif=RNDNUMEXCRANGE(-halfpi, halfpi)
        // Cauchy special case
        if alpha == 1 and beta == 0: return tan(unif)
        expo=-ln(RNDU01ZeroExc())
        c=cos(unif)
        if alpha == 1
                s=sin(unif)
                return 2.0*((unif*beta+halfpi)*s/c -
                    beta * ln(halfpi*expo*c/(unif*beta+halfpi)))/pi
        end
        z=-tan(alpha*halfpi)*beta
        ug=unif+atan(-z)/alpha
        cpow=pow(c, -1.0 / alpha)
        return pow(1.0+z*z, 1.0 / (2*alpha))*
            (sin(alpha*ug)*cpow)*
            pow(cos(unif-alpha*ug)/expo, (1.0 - alpha) / alpha)
    END METHOD

Extended versions of the stable distribution:

- The four-parameter stable distribution (`Stable4(alpha, beta, mu, sigma)`), where `mu` is the mean and ` sigma` is the scale, is `Stable(alpha, beta) * sigma + mu`.
- The "type 0" stable distribution (`StableType0(alpha, beta, mu, sigma)`) is `Stable(alpha, beta) * sigma + (mu - sigma * beta * x)`, where `x` is `ln(sigma)*2.0/pi` if `alpha` is 1, and `tan(pi*0.5*alpha)` otherwise.

<a id=Multivariate_Normal_Distribution></a>
### Multivariate Normal Distribution

The following pseudocode calculates a random point in space that follows a [multivariate normal distribution](https://en.wikipedia.org/wiki/Multivariate_normal_distribution).  The method `MultivariateNormal` takes a list, `mu`, which indicates the means
to add to each component of the random point, and a list of lists, `cov`, that specifies
a _covariance matrix_ (a symmetric positive definite NxN matrix with as many
rows and as many columns as components of the random point.)

For conciseness, the following pseudocode uses `for` loops, defined as follows. `for X=Y to Z; [Statements] ; end` is shorthand for `X = Y; while X <= Z; [Statements]; X = X + 1; end`.

    METHOD Decompose(matrix)
      numrows = size(matrix)
      if matrix[0]!=numrows: return error
      // Does a Cholesky decomposition of a matrix
      // assuming it's positive definite and invertible
      ret=NewList()
      for i = 0 to numrows - 1
        submat = NewList()
        for j = 0 to numrows - 1
          AddItem(submat, 0)
        end
        AddItem(ret, submat)
      end
      s1 = sqrt(matrix[0][0])
      if s1==0: return ret // For robustness
      for i = 1 to numrows - 1
        ret[0][i]=matrix[0][i]*1.0/s1
      end
      for i = 1 to numrows - 1
        sum=0.0
        for j = 0 to i - 1
          sum = sum + ret[j][i]*ret[j][i]
        end
        sq=matrix[i][i]-sum
        if sq<0: sq=0 // For robustness
        ret[i][i]=math.sqrt(sq)
      end
      for j = 1 to numrows - 1
        for i = j + 1 to numrows - 1
          // For robustness
          if ret[j][j]==0: ret[j][i]=0
          if ret[j][j]!=0
            sum=0
            for k = 0 to j - 1
              sum = sumret[k][i]*ret[k][j]
            end
            ret[j][i]=(matrix[j][i]-sum)*1.0/ret[j][j]
          end
        end
      end
      return ret
    END METHOD

    METHOD MultivariateNormal(mu, cov)
      mulen = size(mu)
       if mulen!=size(cov): return error
       if mulen!=size(cov[0]): return error
      // NOTE: If multiple random points will
      // be generated using the same covariance
      // matrix, an implementation can consider
      // precalculating the decomposed matrix
      // in advance rather than calculating it here.
      cho=Decompose(cov)
      i=0
      ret=NewList()
      while i<mulen
        nv=Normal(0,1)
        sum=mu[i]
        j=0
        while j<mulen
          sum=sum+nv*cho[j][i]
          j=j+1
        end
        AddItem(ret, sum)
        i=i+1
      end
      return ret
    end

<a id=Other_Non_Uniform_Distributions></a>
### Other Non-Uniform Distributions

- **Beta distribution (`BetaDist(a, b)`)**: `x / (x + GammaDist(b))`, where `x` is `GammaDist(a)` and `a` and `b` are
 the two parameters of the beta distribution.  The range of the beta distribution is 0 or greater and less than 1.
    - **Arcsine distribution**: `min + (max - min) * BetaDist(0.5, 0.5)`, where `min` is the minimum value and `max` is the maximum value (Saucier 2000, p. 14).
    - **Beta-PERT distribution**: `startpt + size * BetaDist(1.0 + (midpt - startpt) * shape / size, 1.0 + (endpt - midpt) * shape / size)`. The distribution starts  at `startpt`, peaks at `midpt`, and ends at `endpt`, `size` is `endpt - startpt`, and `shape` is a shape parameter that's 0 or greater, but usually 4.
    - **Beta prime distribution**: `x / (1 - x)`, where `x` is `BetaDist(a, b)` and `a` and `b` are the two parameters of the
        beta distribution.
    - **Parabolic distribution**: `min + (max - min) * BetaDist(2, 2)`, where `min` is the minimum value and `max` is the maximum value (Saucier 2000, p. 30).
- **Beta binomial distribution**: `Binomial(trials, BetaDist(a, b))`, where `a` and `b` are
 the two parameters of the beta distribution, and `trials` is a parameter of the binomial distribution.
- **Beta negative binomial distribution**: `NegativeBinomial(successes, BetaDist(a, b))`, where `a` and `b` are
 the two parameters of the beta distribution, and `successes` is a parameter of the negative binomial distribution. If _successes_ is 1, the result is a _Waring&ndash;Yule distribution_. (`NegativeBinomial` can be `NegativeBinomialInt` instead.)
- **Binormal distribution**: `MultivariateNormal([mu1, mu2], [[s1*s1, s1*s2*rho], [rho*s1*s2, s2*s2]])`, where `mu1` and `mu2` are the means of the two random variables, `s1` and `s2` are their standard deviations, and `rho` is a _correlation coefficient_ greater than -1 and less than 1.
- **Cauchy (Lorentz) distribution**: `scale * tan(pi * (RNDU01OneExc()-0.5)) + mu`, where `mu` and `scale`
are the two parameters of the Cauchy distribution.  This distribution is similar to the normal distribution, but with "fatter" tails.
- **Chi distribution**: `sqrt(GammaDist(df * 0.5) * 2)`, where `df` is the number of degrees of
  freedom.
- **Chi-squared distribution**: `GammaDist(df * 0.5) * 2`, where `df` is the number of degrees of
  freedom.  This expresses a sum-of-squares of `df` random variables in the standard normal distribution.
- **Cosine distribution**: `min + (max - min) * asin(RNDNUMRANGE(-1, 1)) / pi`, where `min` is the minimum value and `max` is the maximum value (Saucier 2000, p. 17).
- **Double logarithmic distribution**: `min + (max - min) * (0.5 + (RNDINT(1) * 2 - 1) * 0.5 * RNDU01OneExc() * RNDU01OneExc())`, where `min` is the minimum value and `max` is the maximum value (see also Saucier 2000, p. 15, which shows the wrong X axes).
- **Erlang distribution**: `GammaDist(shape) / rate`, where `shape` and `rate` are the two parameters of the Erlang distribution.
- **Exponential distribution**: `-ln(RNDU01ZeroExc()) / lamda`, where `lamda` is the inverse scale. The `lamda` is usually the probability that an independent event of a given kind will occur in a given span of time (such as in a given day or year).  (This distribution is thus useful for modeling a _Poisson process_.) `1.0 / lamda` is the scale (mean), which is usually the average waiting time between two independent events of the same kind.
- **Extreme value distribution**: `a - ln(-ln(RNDU01ZeroOneExc())) * b`, where `b` is the scale and `a` is the location of the distribution's curve peak (mode).
This expresses a distribution of maximum values.
- **Geometric distribution**: `NegativeBinomialInt(1, p)`, where `p` has the same meaning
 as in the negative binomial distribution.  As used here, this is the number of failures that have happened before a success happens. (Saucier 2000, p. 44, also mentions an alternative definition that includes the success.)
- **Gumbel distribution**: `a + ln(-ln(RNDU01ZeroOneExc())) * b`, where `b` is the scale and `a` is the location of the distribution's curve peak (mode).
This expresses a distribution of minimum values.
- **Half-normal distribution**: `abs(Normal(0, sqrt(pi * 0.5) / invscale)))`, where `invscale` is a parameter of the half-normal distribution.
- **Inverse chi-squared distribution**: `df * scale / (GammaDist(df * 0.5) * 2)`, where `df` is the number of degrees of freedom and `scale` is the scale, usually `1.0 / df`.
- **Inverse gamma (Pearson V) distribution**: `b / GammaDist(a)`, where `a` and `b` have the
 same meaning as in the two-parameter gamma distribution.
- **Inverse Gaussian distribution (Wald distribution)**: Generate `n = mu + (mu*mu*y/(2*lamda)) - mu * sqrt(4 * mu * lamda * y + mu * mu * y * y) / (2 * lamda)`, where `y = pow(Normal(0, 1), 2)`, then return `n` if `RNDU01OneExc() <= mu / (mu + n)`, or `mu * mu / n` otherwise. `mu` is the mean and `lamda` is the scale; both parameters are greater than 0. Based on method published in [Devroye 1986](http://luc.devroye.org/rnbookindex.html).
- **Kumaraswamy distribution**: `min + (max - min) * pow(a-pow(RNDU01ZeroExc(),1.0/b),1.0/a)`, where `a` and `b` are shape parameters, `min` is the minimum value, and `max` is the maximum value.
- **Laplace (double exponential) distribution**: `(ln(RNDU01ZeroExc()) - ln(RNDU01ZeroExc())) * beta + mu`, where `beta` is the scale and `mu` is the mean.
- **L&eacute;vy distribution**: `sigma * 0.5 / GammaDist(0.5) + mu`, where `mu` is the location and `sigma` is the dispersion.
- **Logarithmic distribution**: `min + (max - min) * RNDU01OneExc() * RNDU01OneExc()`, where `min` is the minimum value and `max` is the maximum value (Saucier 2000, p. 26).
- **Logarithmic normal distribution**: `exp(Normal(mu, sigma))`, where `mu` and `sigma`
 have the same meaning as in the normal distribution.
- **Logarithmic series distribution**: `floor(1.0 + ln(RNDU01ZeroExc()) / ln(1.0 - pow(1.0 - param, RNDU01ZeroOneExc())))`, where `param` is a number greater than 0 and less than 1. Based on method described in Devroye 1986.
- **Logistic distribution**: `(ln(x/(1.0 - x)) * scale + mean`, where `x` is `RNDU01ZeroOneExc()` and `mean` and `scale` are the two parameters of the logistic distribution.
- **Maxwell distribution**: `scale * sqrt(GammaDist(1.5) * 2)`, where `scale` is the scale.
- **Noncentral chi-squared distribution**: `GammaDist(df * 0.5 + Poisson(sms * 0.5)) * 2`, where `df` is the number of degrees of freedom and `sms` is the sum of mean squares.
- **Noncentral _F_-distribution**: `GammaDist(m * 0.5) * n / (GammaDist(n * 0.5 + Poisson(sms * 0.5)) * m)`, where `m` and `n` are the numbers of degrees of freedom of two random numbers with a chi-squared distribution, one of which has a noncentral distribution with sum of mean squares equal to `sms`.
- **Pareto distribution**: `pow(RNDU01ZeroOneExc(), -1.0 / alpha) * minimum`, where `alpha`  is the shape and `minimum` is the minimum.
- **Pascal distribution**: `NegativeBinomialInt(successes, p) + successes`, where `successes` and `p` have the same meaning as in the negative binomial distribution.
- **Pearson VI distribution**: `GammaDist(v) / (GammaDist(w))`, where `v` and `w` are shape parameters greater than 0 (Saucier 2000, p. 33; there, an additional `b` parameter is defined, but that parameter is canceled out in the source code).
- **Power distribution**: `pow(RNDU01ZeroOneExc(), 1.0 / alpha)`, where `alpha`  is the shape.
- **Rayleigh distribution**: `a * sqrt(-2 * ln(RNDU01ZeroExc()))`, where `a` is the scale and is greater than 0.
- **Skellam distribution**: `Poisson(mean1) - Poisson(mean2)`, where `mean1` and `mean2` are the means of the two Poisson variables.
- **Skewed normal distribution**: `Normal(0, x) + mu + alpha * abs(Normal(0, x))`, where `x` is `sigma / sqrt(alpha * alpha + 1.0)`, `mu` and `sigma` have
the same meaning as in the normal distribution, and `alpha` is a shape parameter.
- **Snedecor's (Fisher's) _F_-distribution**: `GammaDist(m * 0.5) * n / (GammaDist(n * 0.5) * m)`, where `m` and `n` are the numbers of degrees of freedom of two random numbers with a chi-squared distribution.
- **Student's _t_-distribution**: `Normal(cent, 1) / sqrt(GammaDist(df * 0.5) * 2 / df)`, where `df` is the number of degrees of freedom, and _cent_ is the mean of the normally-distributed random number.  A `cent` other than 0 indicates a _noncentral_ distribution.
- **Triangular distribution**: `ContinuousWeightedChoice([startpt, midpt, endpt], [0, 1, 0])`. The distribution starts at `startpt`, peaks at `midpt`, and ends at `endpt`.
- **Weibull distribution**: `b * pow(-ln(RNDU01ZeroExc()),1.0 / a)`, where `a` is the shape, `b` is the scale, and `a` and `b` are greater than 0.
- **Zeta distribution**: Generate `n = floor(pow(RNDU01ZeroOneExc(), -1.0 / r))`, and if `d / pow(2, r) < (d - 1) * RNDU01OneExc() * n / (pow(2, r) - 1.0)`, where `d = pow((1.0 / n) + 1, r)`, repeat this process. The parameter `r` is greater than 0. Based on method described in Devroye 1986. A zeta distribution truncated by rejecting random values greater than some positive integer is called a _Zipf distribution_ or _Estoup distribution_. (Note that Devroye uses "Zipf distribution" to refer to the untruncated zeta distribution.)

<a id=Correlated_Random_Numbers></a>
### Correlated Random Numbers

To generate two correlated (dependent) random variables&mdash;

- generate two independent and identically distributed random variables `x` and `y` (for example, two `Normal(0, 1)` variables or two `RNDU01()` variables), and
- calculate `[x, y*sqrt(1 - rho * rho) + rho * x]`, where `rho` is a _correlation coefficient_ -1 or greater and 1 or less.
  If `rho` is 0, the variables are uncorrelated.

See Saucier 2000, sec. 3.8, which was the source of the technique given here.

<a id=Generating_Random_Numbers_from_a_Distribution_of_Data_Points></a>
### Generating Random Numbers from a Distribution of Data Points

To generate a random number (or data point) based on the distribution of a list of numbers (or data points), an application can&mdash;

- choose one of the numbers or points at random (see, for example, [Choosing a Random Item from a List](#Choosing_a_Random_Item_from_a_List)), and
- add a randomized "jitter" to the chosen number or point; for example&mdash;
    - add `Normal(0, sigma)` to the chosen number, where `sigma` is the _bandwidth_ (which should be as small as allows the estimated probability density to fit the data distribution and remain smooth), or
    - add a separately generated `Normal(0, sigma)` to each component of the chosen point, where `sigma` is the _bandwidth_<sup>[(4)](#Note4)</sup>.

A detailed discussion on how to calculate bandwidth or on other possible ways to add randomized "jitter" (whose distribution is formally called a _kernel_) is outside the scope of this document.  For further information on _kernel density estimation_, which the random number generation technique here is related to, see the Wikipedia articles on [single-variable](https://en.wikipedia.org/wiki/Kernel_density_estimation) and [multiple-variable](https://en.wikipedia.org/wiki/Multivariate_kernel_density_estimation) estimation, or a [blog post by M. Kay](http://mark-kay.net/2013/12/24/kernel-density-estimation/).

<a id=Generating_Random_Numbers_from_an_Arbitrary_Distribution></a>
### Generating Random Numbers from an Arbitrary Distribution

If a statistical distribution's [_probability density function_](https://en.wikipedia.org/wiki/Probability_density_function) (PDF) is known, one of the following techniques, among others, can be used to generate random numbers that follow that distribution. A PDF is a function that specifies each number's _probability density_ in that distribution, where each density is 0 or greater. Note, however, that a list of common PDFs is outside the scope of this page.

- Use the PDF to calculate the probability density for a number of sample points (usually regularly spaced). Create one list with the sampled points in ascending order (the `list`) and another list of the same size with the densities at those points (the `weights`).  Finally call `ContinuousWeightedChoice(list, weights)` to generate a random number bounded by the lowest and highest sampled point.
- In many cases, random numbers that follow the distribution can be generated using [inverse transform sampling](https://en.wikipedia.org/wiki/Inverse_transform_sampling), that is, by generating `ICDF(RNDU01ZeroOneExc())`, where `ICDF(X)` is the distribution's _inverse cumulative distribution function_, or inverse of the integral of the PDF, assuming the area under the PDF is 1.  Further details on such a technique or on finding integrals or inverses are outside the scope of this document.
- Use _rejection sampling_.  Choose the lowest and highest random number to generate (`minValue` and `maxValue`, respectively) and find the maximum value of the PDF at or between those points (`maxDensity`).  The rejection sampling approach is then illustrated with the following pseudocode, where `PDF(X)` is the distribution's PDF (see also Saucier 2000, p. 39).

        METHOD ArbitraryDist(minValue, maxValue, maxDensity)
             if minValue >= maxValue: return error
             while True:
                 x=RNDNUMEXCRANGE(minValue, maxValue)
                 y=RNDNUMEXCRANGE(0, maxDensity)
                 if y < PDF(x): return x
             end
        END METHOD

<a id=Conclusion></a>
## Conclusion

This page discussed many ways applications can extract random numbers
from random number generators.

Feel free to send comments. They may help improve this page.  In particular, corrections to any method given on this page are welcome.

I acknowledge the commenters to the CodeProject version of this page, including George Swan, who referred me to the reservoir sampling method.

<a id=Notes></a>
## Notes

 <sup id=Note1>(1)</sup> This number format describes B-bit signed integers with minimum value -2<sup>B-1</sup> and maximum value 2<sup>B-1</sup> - 1, where B is a positive even number of bits; examples include Java's `short`, `int`, and `long`, with 16, 32, and 64 bits, respectively. A _signed integer_ is an integer that can be positive, zero, or negative. In _two' s-complement form_, nonnegative numbers have the highest (most significant) bit set to zero, and negative numbers have that bit (and all bits beyond) set to one, and a negative number is stored in such form by decreasing its absolute value by 1 and swapping the bits of the resulting number.

 <sup id=Note2>(2)</sup> The method that formerly appeared here is the _Box-Muller-transformation_: `mu + radius * cos(angle)` and `mu + radius * sin(angle)`, where `angle = 2 * pi * RNDU01OneExc()` and `radius = sqrt(-2 * ln(RNDU01ZeroExc())) * sigma`, are two independent normally-distributed random numbers.  A method of generating approximate standard normal random numbers, which consists of summing twelve `RNDU01OneExc()`  calls and subtracting by 6 (see also ["Irwin&ndash;Hall distribution" on Wikipedia](https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution)), results in values not less than -6 or greater than 6, but results outside that range will occur only with a generally negligible probability.

 <sup id=Note3>(3)</sup> The N numbers generated this way will form a point inside an N-dimensional _hypercube_ with length `2 * R` in each dimension and centered at the origin of space.

 <sup id=Note4>(4)</sup> A third kind of randomized "jitter" (for multi-component data points) consists of a point generated from a [multivariate normal distribution](https://en.wikipedia.org/wiki/Multivariate_normal_distribution) with all the means equal to 0 and a_covariance matrix_ that, in this context, serves as a _bandwidth matrix_. The second kind of "jitter" given here is an easy special case of the multivariate normal distribution, where the _bandwidth_ corresponds to a bandwidth matrix with diagonal elements equal to _bandwidth_-squared and with zeros everywhere else.

 <sup id=Note5>(5)</sup> In situations where loops are not possible, such as within an SQL query, the idiom `min(floor(RNDU01OneExc() * maxExclusive, maxExclusive - 1))`, where `min(a,b)` is the smaller of `a` and `b`, returns an integer 0 or greater and less than `maxExclusive`; however, such an idiom can have a slight, but for most purposes negligible, bias toward `maxExclusive - 1`.

<a id=License></a>
## License

This page is licensed under [A Public Domain dedication](http://creativecommons.org/licenses/publicdomain/).
