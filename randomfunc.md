# Random Number Generation and Sampling Methods

[Peter Occil](mailto:poccil14@gmail.com)

Begun on June 4, 2017; last updated on Feb. 10, 2018.

Discusses many ways applications can do random number generation and sampling from an underlying RNG and includes pseudocode for many of them.

<a id=Introduction></a>
## Introduction

This page discusses many ways applications can do random number generation and sampling from an underlying random number generator (RNG), often with pseudocode. Those methods include&mdash;
- ways to generate uniform random numbers from an underlying RNG (such as the [core method, `RNDINT(N)`](#Core_Random_Generation_Method)),
- ways to generate randomized content and conditions, such as [Boolean conditions](#Boolean_Conditions), [shuffling](#Shuffling), and [sampling unique items from a list](#Sampling_Without_Replacement_Choosing_Several_Unique_Items), and
- generating non-uniform random numbers, including [weighted choice](#Discrete_Weighted_Choice), the [normal distribution](#Normal_Gaussian_Distribution), and [other probability distributions](#Other_Non_Uniform_Distributions).

[Sample Python code](https://peteroupc.github.io/randomgen.py) that implements many of the methods in this document is available.

All the random number methods presented on this page&mdash;

- assume the existence of an underlying RNG,
- make no assumptions on the underlying RNG's implementation (e.g., whether that RNG is a deterministic RNG or some other kind), and
- make no assumptions on the statistical quality or predictability of the underlying RNG.

**In general, this document does not cover:**
- How to choose an underlying RNG for a particular application, including in terms of security, performance, and quality. I have written more on RNG recommendations in [another document](https://peteroupc.github.io/random.html).
- Techniques that are specific to an application programming interface.
- Techniques that are specific to certain kinds of RNGs.
- Generating sequences of unique integers using specific kinds of deterministic RNGs.
- Seemingly random numbers that are specifically generated using [hash functions](https://peteroupc.github.io/random.html#Hash_Functions), including pseudorandom functions (as opposed to RNGs).  But if such a number is used to initialize a deterministic RNG (that is, to serve as its "seed"), then that RNG is generally within the scope of this document.

<a id=Contents></a>
## Contents

- [Introduction](#Introduction)
- [Contents](#Contents)
- [Notation and Definitions](#Notation_and_Definitions)
- [Uniform Random Numbers](#Uniform_Random_Numbers)
    - [`RNDINT`: Random Integers in \[0, N\]](#RNDINT_Random_Integers_in_0_N)
    - [`RNDINTRANGE`: Random Integers in \[N, M\]](#RNDINTRANGE_Random_Integers_in_N_M)
    - [`RNDU01`: Random Numbers in \[0, 1\]](#RNDU01_Random_Numbers_in_0_1)
    - [`RNDNUMRANGE`: Random Numbers in \[X, Y\]](#RNDNUMRANGE_Random_Numbers_in_X_Y)
    - [`RNDINTEXC`: Random Integers in \[0, N)](#RNDINTEXC_Random_Integers_in_0_N)
    - [`RNDINTEXCRANGE`: Random Integers in \[N, M)](#RNDINTEXCRANGE_Random_Integers_in_N_M)
    - [`RNDU01OneExc`, `RNDU01ZeroExc`, and `RNDU01ZeroOneExc`: Random Numbers in \[0, 1), (0, 1\], or (0, 1)](#RNDU01OneExc_RNDU01ZeroExc_and_RNDU01ZeroOneExc_Random_Numbers_in_0_1_0_1_or_0_1)
    - [`RNDNUMEXCRANGE`: Random Numbers in \[X, Y)](#RNDNUMEXCRANGE_Random_Numbers_in_X_Y)
    - [`RNDBITS`: Random N-Bit Integers](#RNDBITS_Random_N_Bit_Integers)
    - [Special Programming Environments](#Special_Programming_Environments)
- [Randomization Techniques](#Randomization_Techniques)
    - [Boolean Conditions](#Boolean_Conditions)
    - [Shuffling](#Shuffling)
    - [Creating a Random Character String](#Creating_a_Random_Character_String)
    - [Sampling With Replacement: Choosing a Random Item from a List](#Sampling_With_Replacement_Choosing_a_Random_Item_from_a_List)
    - [Sampling Without Replacement: Choosing Several Unique Items](#Sampling_Without_Replacement_Choosing_Several_Unique_Items)
    - [Almost-Random Sampling](#Almost_Random_Sampling)
    - [Choosing a Random Date/Time](#Choosing_a_Random_Date_Time)
    - [Generating Random Numbers in Sorted Order](#Generating_Random_Numbers_in_Sorted_Order)
    - [Rejection Sampling](#Rejection_Sampling)
- [General Non-Uniform Distributions](#General_Non_Uniform_Distributions)
    - [Discrete Weighted Choice](#Discrete_Weighted_Choice)
        - [Weighted Choice Without Replacement](#Weighted_Choice_Without_Replacement)
        - [Choosing Multiple Items](#Choosing_Multiple_Items)
        - [Piecewise Constant Distribution](#Piecewise_Constant_Distribution)
    - [Continuous Weighted Choice](#Continuous_Weighted_Choice)
    - [Random Numbers from a Distribution of Data Points](#Random_Numbers_from_a_Distribution_of_Data_Points)
    - [Random Numbers from an Arbitrary Distribution](#Random_Numbers_from_an_Arbitrary_Distribution)
    - [Mixtures of Distributions](#Mixtures_of_Distributions)
    - [Censored and Truncated Distributions](#Censored_and_Truncated_Distributions)
    - [Correlated Random Numbers](#Correlated_Random_Numbers)
- [Specific Non-Uniform Distributions](#Specific_Non_Uniform_Distributions)
    - [Dice](#Dice)
    - [Normal (Gaussian) Distribution](#Normal_Gaussian_Distribution)
    - [Binomial Distribution](#Binomial_Distribution)
    - [Poisson Distribution](#Poisson_Distribution)
    - [Gamma Distribution](#Gamma_Distribution)
    - [Negative Binomial Distribution](#Negative_Binomial_Distribution)
    - [von Mises Distribution](#von_Mises_Distribution)
    - [Stable Distribution](#Stable_Distribution)
    - [Hypergeometric Distribution](#Hypergeometric_Distribution)
    - [Multivariate Normal Distribution](#Multivariate_Normal_Distribution)
    - [Dirichlet Distribution: Random Numbers with a Given Positive Sum](#Dirichlet_Distribution_Random_Numbers_with_a_Given_Positive_Sum)
    - [Multinomial Distribution](#Multinomial_Distribution)
    - [Gaussian Copula](#Gaussian_Copula)
    - [Other Non-Uniform Distributions](#Other_Non_Uniform_Distributions)
- [Geometric Sampling](#Geometric_Sampling)
    - [Random Point Inside a Triangle](#Random_Point_Inside_a_Triangle)
    - [Random Points on the Surface of a Hypersphere](#Random_Points_on_the_Surface_of_a_Hypersphere)
    - [Random Points Inside a Ball or Shell](#Random_Points_Inside_a_Ball_or_Shell)
    - [Random Latitude and Longitude](#Random_Latitude_and_Longitude)
- [Conclusion](#Conclusion)
- [Notes](#Notes)
- [License](#License)

<a id=Notation_and_Definitions></a>
## Notation and Definitions

In this document:

* The [**pseudocode conventions**](https://peteroupc.github.io/pseudocode.html) apply to this document.
* **Intervals.** The following notation is used for intervals:
    - [`a`, `b`) means "`a` or greater, but less than `b`".
    - (`a`, `b`) means "greater than `a`, but less than `b`".
    - (`a`, `b`] means "greater than `a` and less than or equal to `b`".
    - [`a`, `b`] means "`a` or greater and `b` or less".
- **Random number generator (RNG).** Software and/or hardware that seeks to generate independent numbers that seem to occur by chance and that are approximately uniformly distributed<sup>[(1)](#Note1)</sup>.
* **Norm.** The norm of one or more numbers is the square root of the sum of squares of those numbers, that is, `sqrt(num1 * num1 + num2 * num2 + ... + numN * numN)`.
* **Significand permutations.** A floating-point format's floating-point base raised to the power of the format's precision (the maximum number of significant digits that the format can represent without loss). For example&mdash;
    - the 64-bit IEEE 754 binary floating-point format (e.g., Java `double`) has 2<sup>53</sup> (9007199254740992) significand permutations,
    - the 64-bit IEEE 754 decimal floating-point format has 10<sup>16</sup> significand permutations,
    - the 32-bit IEEE 754 binary floating-point format (e.g., Java `float`) has 2<sup>24</sup> (16777216) significand permutations,
    - the .NET Framework decimal format (`System.Decimal`) has a precision of 28 (since it can represent up to that many significant digits without loss, even though it can represent some numbers greater than 10<sup>28</sup>), so it has 10<sup>28</sup> significand permutations, and
    - arbitrary-precision floating point numbers (e.g., Java `BigDecimal`) can have a theoretically arbitrary number of significand permutations.

<a id=Uniform_Random_Numbers></a>
## Uniform Random Numbers

This section describes how an underlying RNG can be used to generate uniformly-distributed random numbers.  Here is an overview of the methods described in this section.

* Random Integers: `RNDINT`, `RNDINTEXC`, `RNDINTRANGE`, `RNDINTRANGEEXC`.
* Random Bits: `RNDBITS`.
* Random Numbers in 0-1 Bounded Interval: `RNDU01`, `RNDU01ZeroExc`, `RNDU01OneExc`, `RNDU01ZeroOneExc`.
* Other Random Numbers: `RNDNUMRANGE`, `RNDNUMRANGEEXC`.

One method, `RNDINT`, described next, can serve as the basis for the remaining methods.

<a id=RNDINT_Random_Integers_in_0_N></a>
### `RNDINT`: Random Integers in [0, N]

In this document, **`RNDINT(maxInclusive)`** is the core method for generating uniform random integers from an underlying RNG, which is called **`RNG()`** in this section. The random integer is **in the interval [0, `maxInclusive`]**.  This section explains how `RNDINT` can be implemented for two kinds of underlying RNGs; however, the definition of `RNDINT` is not limited to those kinds.

- **Method 1**: If `RNG()` outputs **integers in the interval \[0, positive `MODULUS`\)** (for example, less than 1,000,000 or less than 6), then `RNDINT(maxInclusive)` can be implemented as in the pseudocode below.<sup>[(2)](#Note2)</sup>
- **Method 2**: If `RNG()` outputs **floating-point numbers in the interval [0, 1)**, then find `s`, where `s` is the number of _significand permutations_ for the floating-point format, and use Method 1 above, where `MODULUS` is `s` and `RNG()` is `floor(RNG() * s)` instead.  (If the RNG outputs arbitrary-precision floating-point numbers, `s` should be set to the number of different values that are possible from the underlying RNG.)
- **Other RNGs:** A detailed `RNDINT(maxInclusive)` implementation for other kinds of RNGs is not given here, since they seem to be lesser seen in practice.  Readers who know of such an RNG (provided it's in wide use) should send me a comment.

&nbsp;

    METHOD RndIntHelperNonPowerOfTwo(maxInclusive)
        cx = floor(maxInclusive / MODULUS) + 1
        while true
           ret = cx * RNG()
           // NOTE: If this method is implemented using a fixed-
           // precision type, the addition operation below should
           // check for overflow and should reject the number
           // if overflow would result.
           ret = ret + RNDINT(cx - 1)
           if ret <= maxInclusive: return ret
        end
    END METHOD

    METHOD RndIntHelperPowerOfTwo(maxInclusive)
            // NOTE: Finds the number of bits minus 1 needed
            // to represent MODULUS. This will be a constant
            // here, though.
            modBits = ln(MODULUS)/ln(2)
            // Calculate the bit count of maxInclusive
            bitCount = 0
            tempnumber = maxInclusive
            while tempnumber > 0
                   // NOTE: If the programming language implements
                   // division with two integers by truncating to an
                   // integer, the division can be used as is without
                   // using a "floor" function.
                   tempnumber = floor(tempnumber / 2)
                   bitCount = bitCount + 1
            end
            while true
                   // Build a number with `bitCount` bits
                    tempnumber = 0
                    while bitCount > 0
                         wordBits = modBits
                         rngNumber = RNG()
                         if wordBits > bitCount
                            wordBits = bitCount
                            // Truncate number to 'wordBits' bits
                            // NOTE: If the programming language supports a bitwise
                            // AND operator, the mod operation can be implemented
                            // as "rndNumber AND ((1 << wordBits) - 1)"
                            rngNumber = mod(rngNumber, (1 << wordBits))
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
    END METHOD

    METHOD RNDINT(maxInclusive)
      // maxInclusive must be 0 or greater
      if maxInclusive < 0: return error
      if maxInclusive == 0: return 0
      // N equals modulus
      if maxInclusive == MODULUS - 1: return RNG()
      // NOTE: Finds the number of bits minus 1 needed
      // to represent MODULUS (if it's a power of 2).
      // This will be a constant here, though.
      modBits=ln(MODULUS)/ln(2)
      // NOTE: The following condition checks if MODULUS
      // is a power of 2.  This will be a constant here, though.
      isPowerOfTwo=floor(modBits) == modBits
      // Special cases if MODULUS is a power of 2
      if isPowerOfTwo
           if maxInclusive == 1: return mod(RNG(), 2)
           if maxInclusive == 3 and modBits >= 2: return mod(RNG(), 4)
           if maxInclusive == 255 and modBits >= 8: return mod(RNG(), 256)
           if maxInclusive == 65535 and modBits >=16: return mod(RNG(), 65535)
       end
      if maxInclusive > MODULUS - 1:
         if isPowerOfTwo
           return RndIntHelperPowerOfTwo(maxInclusive)
         else
           return RndIntHelperNonPowerOfTwo(maxInclusive)
         end
      else
        // NOTE: If the programming language implements
        // division with two integers by truncating to an
        // integer, the division can be used as is without
        // using a "floor" function.
              nPlusOne = maxInclusive + 1
              maxexc = floor((MODULUS - 1) / nPlusOne) * nPlusOne
              while true
                        ret = RNG()
                        if ret < nPlusOne: return ret
                        if ret < maxexc: return mod(ret, nPlusOne)
              end
      end
    END METHOD

> **Notes:**
>
> - To generate a random number that's either -1 or 1, the following idiom can be used: `(RNDINT(1) * 2 - 1)`.
> - To generate a random integer that's divisible by a positive integer (`DIV`), generate the integer with any method (such as `RNDINT`), let `X` be that integer, then generate `X - mod(X, DIV)` if `X >= 0`, or `X - (DIV - mod(abs(X), DIV))` otherwise. (Depending on the method, the resulting integer may be out of range, in which case this procedure is to be repeated.)
> - A random 2-dimensional point on an NxM grid can be expressed as a single integer as follows:
>      - To generate a random NxM point `P`, generate `P = RNDINT(N * M - 1)` (`P` is thus in the interval [0, `N * M`)).
>      - To convert a point `P` to its 2D coordinates, generate `[mod(P, N), floor(P / N)]`. (Each coordinate starts at 0.)
>      - To convert 2D coordinates `coord` to an NxM point, generate `P = coord[1] * N + coord[0]`.

<a id=RNDINTRANGE_Random_Integers_in_N_M></a>
### `RNDINTRANGE`: Random Integers in [N, M]

The na&iuml;ve way of generating a **random integer in the interval [`minInclusive`, `maxInclusive`]**, shown below, works well for unsigned integers and arbitrary-precision integers.

     METHOD RNDINTRANGE(minInclusive, maxInclusive)
       // minInclusive must not be greater than maxInclusive
       if minInclusive > maxInclusive: return error
       return minInclusive + RNDINT(maxInclusive - minInclusive)
     END METHOD

The na&iuml;ve approach won't work as well, though, for signed integer formats if the difference between `maxInclusive` and `minInclusive` exceeds the highest possible integer for the format.  For fixed-length signed integer formats <sup>[(3)](#Note3)</sup>, such random integers can be generated using the following pseudocode.  In the pseudocode below, `INT_MAX` is the highest possible integer in the integer format.

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
         // form, use the following three lines instead of the preceding line;
         // here, zero will be rejected at a 50% chance because zero occurs
         // twice in both forms.
         // negative = RNDINT(1) == 0
         // if negative: ret = 0 - ret
         // if negative and ret == 0: continue
         if ret >= minInclusive and ret <= maxInclusive: return ret
       end
    END METHOD

> **Notes:**
> - To simulate rolling an N-sided die (N greater than 1), generate a random number in the interval \[1, N\] by `RNDINTRANGE(1, N)`.
> - Generating a random integer with one base-10 digit is equivalent to generating `RNDINTRANGE(0, 9)`.
> - Generating a random integer with N base-10 digits (where N is 2 or greater) is equivalent to generating `RNDINTRANGE(pow(10, N-1), pow(10, N) - 1)`.

<a id=RNDU01_Random_Numbers_in_0_1></a>
### `RNDU01`: Random Numbers in [0, 1]

The idiom `RNDINT(X) / X` (called **`RNDU01()`** in this document), generates a **random number in the interval [0, 1]**, where `X` is the number of fractional parts between 0 and 1. (For fixed-precision floating-point number formats, `X` should equal the number of _significand permutations_ for that format. See "Generating uniform doubles in the unit interval" in the [`xoroshiro+` remarks page](http://xoroshiro.di.unimi.it/#remarks) for further discussion.)

For fixed-precision binary floating-point numbers with fixed exponent range (such as Java's `double` and `float`), the following pseudocode for `RNDU01()` can be used instead.  It's based on a [technique devised by Allen Downey](http://allendowney.com/research/rand/), who found that dividing a random number by a constant usually does not yield all representable binary floating-point numbers in the desired range.  In the pseudocode below, `SIGBITS` is the binary floating-point format's precision (for examples, see the [note for "significand permutations"](#Notation_and_Definitions)).

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

<a id=RNDNUMRANGE_Random_Numbers_in_X_Y></a>
### `RNDNUMRANGE`: Random Numbers in [X, Y]

The na&iuml;ve way of generating a **random number in the interval \[`minInclusive`, `maxInclusive`\]**, is shown in the following pseudocode, which generally works well only if the number format can't be negative or that format uses arbitrary precision.

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

<a id=RNDINTEXC_Random_Integers_in_0_N></a>
### `RNDINTEXC`: Random Integers in [0, N)

`RNDINTEXC(maxExclusive)`, which generates a **random number in the interval \[0, `maxExclusive`\)**,
can be implemented as follows<sup>[(4)](#Note4)</sup>:

     METHOD RNDINTEXC(maxExclusive)
        if maxExclusive <= 0: return error
        return RNDINT(maxExclusive - 1)
     END METHOD

> **Note:** The following are alternative ways of generating a random integer in the interval [0, `maxExclusive`):
> - `floor(RNDNUMEXCRANGE(0, maxExclusive))`.
> - Generate `N = floor(RNDU01OneExc()*(maxExclusive))` until `N < maxExclusive`. (The loop is needed because otherwise, rounding error due to the nature of certain floating-point formats can result in `maxExclusive` being returned in rare cases.<sup>[(5)](#Note5)</sup>)
>
> These approaches, though, are recommended only if the programming language&mdash;
> - supports floating-point number types and no other number types (an example is JavaScript),
> - is a dialect of SQL, or
> - doesn't support an integer type that is big enough to fit the number `maxExclusive - 1`.

<a id=RNDINTEXCRANGE_Random_Integers_in_N_M></a>
### `RNDINTEXCRANGE`: Random Integers in [N, M)

**`RNDINTEXCRANGE`** returns a **random integer in the interval [`minInclusive`, `maxExclusive`)**.  It can be implemented using [`RNDINTRANGE`](#Random_Integers_Within_a_Range_Maximum_Inclusive), as the following pseudocode demonstrates.

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

<a id=RNDU01OneExc_RNDU01ZeroExc_and_RNDU01ZeroOneExc_Random_Numbers_in_0_1_0_1_or_0_1></a>
### `RNDU01OneExc`, `RNDU01ZeroExc`, and `RNDU01ZeroOneExc`: Random Numbers in [0, 1), (0, 1], or (0, 1)

Three methods related to `RNDU01()` can be implemented as follows, where
`X` is the number of fractional parts between 0 and 1 (see `RNDU01()` section).

- **`RNDU01OneExc()`, interval [0, 1)**, can be implemented in one of the following ways:
    - Generate `RNDU01()` in a loop until a number other than 1.0 is generated this way.  This is preferred.
    - `RNDINT(X - 1) / X`.
    - `RNDINTEXC(X) / X`.

    Note that `RNDU01OneExc()` corresponds to `Math.random()` in Java and JavaScript.
- **`RNDU01ZeroExc()`, interval (0, 1]**, can be implemented in one of the following ways:
    - Generate `RNDU01()` in a loop until a number other than 0.0 is generated this way.  This is preferred.
    - `(RNDINT(X - 1) + 1) / X`.
    - `(RNDINTEXC(X) + 1) / X`.
    - `1.0 - RNDU01OneExc()` (but this is recommended only if the set of numbers `RNDU01OneExc()` could return &mdash; as opposed to their probability &mdash; is evenly distributed).
- **`RNDU01ZeroOneExc()`, interval (0, 1)**, can be implemented in one of the following ways:
    - Generate `RNDU01()` in a loop until a number other than 0.0 or 1.0 is generated this way.  This is preferred.
    - `(RNDINT(X - 2) + 1) / X`.
    - `(RNDINTEXC(X - 1) + 1) / X`.

<a id=RNDNUMEXCRANGE_Random_Numbers_in_X_Y></a>
### `RNDNUMEXCRANGE`: Random Numbers in [X, Y)

**`RNDNUMEXCRANGE`** returns a  **random number in the interval [`minInclusive`, `maxExclusive`)**.
 It can be implemented using [`RNDNUMRANGE`](#Random_Integers_Within_a_Range_Maximum_Inclusive), as the following pseudocode demonstrates.

    METHOD RNDNUMEXCRANGE(minInclusive, maxExclusive)
       if minInclusive >= maxExclusive: return error
       while true
         ret = RNDNUMRANGE(minInclusive, maxExclusive)
         if ret < maxExclusive: return ret
       end
    END METHOD

<a id=RNDBITS_Random_N_Bit_Integers></a>
### `RNDBITS`: Random N-Bit Integers

The idiom `RNDINT((1 << b) - 1)`, called **`RNDBITS(b)`** in this document, is a na&iuml;ve way of generating a **uniform random `N`-bit integer** (with maximum 2<sup>`b` - 1</sup>).

Although this idiom works well for arbitrary-precision integers, it won't work well for the much more popular integer types called _fixed-length two's-complement signed integers_ <sup>[(3)](#Note3)</sup>. For such signed integers as well as fixed-length unsigned integers, `RNDBITS(bits)` can be implemented using the pseudocode below.  In the pseudocode below, `BITCOUNT` is the number of bits used in the format.  Note that for such signed integers, `RNDBITS(bits)` can return a sequence of bits that resolves to a negative number.

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

<a id=Special_Programming_Environments></a>
### Special Programming Environments

In certain programming environments it's often impractical to implement the uniform random number generation methods just described without recurring to other programming languages.  These include the following:

- Microsoft Windows batch files (newer versions of which, at least, include a `%RANDOM%` variable which returns a random integer in the interval \[0, 65535\]).
- `bash` and other shell scripts (some of which include a `$RANDOM` variable which returns a random integer in the interval \[0, 65535\]).
- SQL dialects, such as&mdash;
    - MySQL (which has a `RAND()` akin to `RNDU01OneExc()`),
    - T-SQL (which also has a `RAND()` akin to `RNDU01OneExc()`),
    - PL/SQL (which often has `DBMS_RANDOM.VALUE` akin to either `RNDU01OneExc()` or `RNDNUMEXCRANGE`),
    - PostgreSQL (which has `RANDOM()`), and
    - SQLite (which sometimes has `RANDOM()` which returns a random integer in the interval [-2<sup>63</sup>, 2<sup>63</sup>)),

    especially within a single query.

Readers aware of how these environments can support those uniform random number methods should send me a comment.

Moreover, in functional programming languages such as Haskell, it may be important to separate code that directly uses RNGs from other code, usually by rewriting certain functions to take one or more pregenerated random numbers rather than directly using `RNDINT`, `RNDNUMRANGE`, or another random number generation method presented earlier in this document.

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
- True with odds of X to Y: `RNDINTEXC(X + Y) < X`.
- True with probability X, where X is from 0 through 1 (a _Bernoulli trial_): `RNDU01OneExc() < X`.

> **Examples:**
> - True with probability 3/8: `RNDINTEXC(8) < 3`.
> - True with odds of 100 to 1: `RNDINTEXC(101) < 1`.
> - True with 20% probability: `RNDINTEXC(100) < 20`.

<a id=Shuffling></a>
### Shuffling

The [Fisher&ndash;Yates shuffle method](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle) shuffles a list (puts its items in a random order) such that all permutations (arrangements) of that list are equally likely to occur, assuming the RNG it uses can choose from among all permutations of that list.  However, that method is also easy to write incorrectly (see also Jeff Atwood, "[The danger of na&iuml;vet&eacute;](https://blog.codinghorror.com/the-danger-of-naivete/)").  The following pseudocode is designed to shuffle a list's contents.

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
             // "k = RNDINTEXC(size(list))"
             // The following is wrong since the algorithm won't
             // choose from among all possible permutations:
             // "k = RNDINTEXC(i)"
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

An important consideration with respect to shuffling is the nature of the underlying RNG, as I discuss in further detail in my [RNG recommendation document on shuffling](https://peteroupc.github.io/random.html#Shuffling).<sup>[(6)](#Note6)</sup>

> **Note:** In simulation testing, shuffling is used to relabel items from a dataset at random, where each item in the dataset is assigned one of several labels.  In such testing&mdash;
> - one or more statistics that involve the specific labeling of the original dataset's groups is calculated (such as the difference, maximum, or minimum of means or variances between groups), then
> - multiple simulated datasets are generated, where each dataset is generated by&mdash;
>    - merging the groups,
>    - shuffling the merged dataset, and
>    - relabeling each item in order such that the number of items in each group for the simulated dataset is the same as for the original dataset, then
> - for each simulated dataset, the same statistics are calculated as for the original dataset, then
> - the statistics for the simulated datasets are compared with those of the original.

<a id=Creating_a_Random_Character_String></a>
### Creating a Random Character String

To generate a random string of characters (usually a random _alphanumeric string_, or string of letters and digits):

1. Generate a list of the letters, digits, and/or other characters the string can have.  For example, those characters can be&mdash;
    * the basic digits "0" to "9" (U+0030-U+0039, nos. 48-57),
    * the basic upper case letters "A" to "Z" (U+0041-U+005A, nos. 65-90), and
    * the basic lower case letters "a" to "z" (U+0061-U+007A, nos. 96-122),

    as found in the Basic Latin block of the Unicode Standard.
2. Build a new string whose characters are chosen from that character list.  The pseudocode below demonstrates this by creating a list, rather than a string, where the random characters will be held.  It also takes the number of characters as a parameter named `size`.  (How to convert this list to a text string depends on the programming language and is outside the scope of this page.)

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

> **Notes:**
>
> - If the list of characters is fixed, the list can be statically created at runtime or compile time, or a string type as provided in the programming language can be used to store the list as a string.
> - Instead of individual characters, the list can consist of strings of one or more characters each (e.g., words or syllables).  In that case, storing the list of strings as a single string is usually not a clean way to store those strings.
> - Often applications need to generate a string of characters that's not only random, but also unique.  The best way to ensure uniqueness in this case is to store a list (such as a hash table) of strings already generated and to check newly generated strings against that list.  _Random number generators alone should not be relied on to deliver unique results._  Special considerations apply if the strings identify database records, file system paths, or other shared resources; such special considerations include the need to synchronize access, but are not discussed further in this document.
> - Generating a random hexadecimal string is equivalent to generating `RandomString(characterList, stringSize)`, where `characterList` is `["0", "1", ..., "9", "A", ..., "F"]` or `["0", "1", ..., "9", "a", ..., "f"]` (with ellipses used to save space), and `stringSize` is the desired size.
> - For generating a random base-10 digit string, the list of characters passed to `RandomString` consists of the basic digits only.
> - Ways to generate "pronounceable" words or words similar to natural-language words<sup>[(7)](#Note7)</sup>, or to generate strings that match a regular expression, are too complicated to discuss in this document.

<a id=Sampling_With_Replacement_Choosing_a_Random_Item_from_a_List></a>
### Sampling With Replacement: Choosing a Random Item from a List

To choose a random item from a list&mdash;

- whose size is known in advance, use the idiom `list[RNDINTEXC(size(list))]`; or
- whose size is not known in advance, generate `RandomKItemsFromFile(file, 1)`, in pseudocode given in a [later section](#Sampling_Without_Replacement_Choosing_Several_Unique_Items) (the result will be a 1-item list or be an empty list if there are no items).

Choosing an item this way is also known as _sampling with replacement_.

> **Notes:**

> - Generating a random number in the interval [`mn`, `mx`) in increments equal to `step` is equivalent to&mdash;
>     - generating a list of all numbers in the interval [`mn`, `mx`) of the form `mn + step * x`, where `x >= 0` is an integer, then
>     - choosing a random item from the list generated this way.
> - [_Bootstrapping_](https://en.wikipedia.org/wiki/Bootstrapping_%28statistics%29) is a method of creating a simulated dataset by choosing random items with replacement from an existing dataset until both datasets have the same size.  (The simulated dataset can contain duplicates this way.)  Usually, multiple simulated datasets are generated this way, one or more statistics, such as the mean, are calculated for each simulated dataset as well as the original dataset, and the statistics for the simulated datasets are compared with those of the original.

<a id=Sampling_Without_Replacement_Choosing_Several_Unique_Items></a>
### Sampling Without Replacement: Choosing Several Unique Items

There are several techniques for choosing `k` unique items or values uniformly at random from among `n` available items or values, depending on whether `n` is known, how big `n` and `k` are, and other considerations.

- **If `n` is not known in advance:** Use the _reservoir sampling_ method; see the `RandomKItemsFromFile` method in the pseudocode below.  Although the pseudocode refers to files and lines, the technique applies to any situation when items are retrieved one at a time from a dataset or list whose size is not known in advance.
- **If items are to be chosen in order:**
    - **If `n` is relatively small,** then the `RandomKItemsInOrder` method, in the pseudocode below, demonstrates a solution (based on a technique presented in Devroye 1986, p. 620).
    - **If `n` is relatively large,** see the item "If `n` is relatively large", later.
- **If `n` is relatively small (for example, if there are 200 available items, or there is a range of numbers from 0 to 200 to choose from):** Do one of the following:
    - Store all the items in a list, [shuffle](#Shuffling) that list, then choose the first `k` items from that list.
    - If the items are already stored in a list and the list's order can be changed, then shuffle that list and choose the first `k` items from the shuffled list.
    - If the items are already stored in a list and the list's order can't be changed, then store the indices to those items in another list, shuffle the latter list, then choose the first `k` indices (or the items corresponding to those indices) from the latter list.
- **If `k` is much smaller than `n` and the items are stored in a list whose order can be changed:** Do a _partial shuffle_ of that list, then choose the _last_ `k` items from that list.  A _partial shuffle_ proceeds as given in the section "[Shuffling](#Shuffling)", except the partial shuffle stops after `k` swaps have been made (where swapping one item with itself counts as a swap).
- **If `k` is much smaller than `n` and `n` is not very large (for example, less than 5000):** Do one of the following:
    - Store all the items in a list, do a _partial shuffle_ of that list, then choose the _last_ `k` items from that list.
    - If the items are already stored in a list and the list's order can't be changed, then store the indices to those items in another list, do a _partial shuffle_ of the latter list, then choose the _last_ `k` indices (or the items corresponding to those indices) from the latter list.
- **If `n` is relatively large (for example, if 32-bit or larger integers will be chosen so that `n` is 2<sup>32</sup> or is a greater power of 2):** Create a [hash table](https://en.wikipedia.org/wiki/Hash_table) storing the indices to items already chosen.  When a new index to an item is randomly chosen, check the hash table to see if it's there already.  If it's not there already, add it to the hash table.  Otherwise, choose a new random index.  Repeat this process until `k` indices were added to the hash table this way. If the items are to be chosen in order, then a [red&ndash;black tree](https://en.wikipedia.org/wiki/Red%E2%80%93black_tree), rather than a hash table, can be used to store the indices this way; after `k` indices are added to the tree, the indices (and the items corresponding to them) can be retrieved in sorted order.  Performance considerations involved in storing data in hash tables or red&ndash;black trees, and in retrieving data from them, are outside the scope of this document.

Choosing several unique items as just described is also known as _sampling without replacement_.

The following pseudocode implements the `RandomKItemsFromFile` and `RandomKItemsInOrder` methods referred to in this section.

        METHOD RandomKItemsFromFile(file, k)
           list = NewList()
           j = 0
           endOfFile = false
           while j < k
              // Get the next line from the file
              item = GetNextLine(file)
              // The end of the file was reached, break
              if item == nothing:
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

> **Note:** Removing `k` random items from a list of `n` items (`list`) is equivalent to generating a new
list by `RandomKItemsInOrder(list, n - k)`.

<a id=Almost_Random_Sampling></a>
### Almost-Random Sampling

Some applications (particularly some games) may find it important to control which random numbers appear, to make the random outcomes appear fairer to users.  Without this control, a user may experience long streaks of good outcomes or long streaks of bad outcomes, both of which are theoretically possible with a random number generator.  To implement this kind of "almost-random" sampling, do one of the following:

- Generate a list of possible outcomes (for example, the list can contain 10 items labeled "good" and three labeled "bad") and [shuffle](#Shuffling) that list.  Each time an outcome must be generated, choose the next unchosen outcome from the shuffled list.  Once all those outcomes are chosen, shuffle the list and continue.
- Create two lists: one list with the different possible outcomes, and another list of the same size containing an integer weight 0 or greater for each outcome (for example, one list can contain the items "good" and "bad", and the other list can contain the weights 10 and 3, respectively).  Each time an outcome must be generated, choose one outcome using the [weighted choice without replacement](#Weighted_Choice_Without_Replacement) technique.  Once all of the weights are 0, re-fill the list of weights with the same weights the list had at the start, and continue.

However, "almost-random" sampling techniques are not recommended whenever information security (ISO/IEC 27000) is involved, including when predicting future random numbers would give a player or user a significant and unfair advantage.

> **Note:** [Monte Carlo integration](https://en.wikipedia.org/wiki/Monte_Carlo_integration) uses randomization to estimate a multidimensional integral. It involves evaluating a function at N random points in the domain, adding them up, then dividing the sum by N.  The ["Variance" MathWorld article](http://mathworld.wolfram.com/Variance.html) gives methods for calculating the estimate's variance. (After calculating the error, or square root of variance, and the estimated integral, both can be multiplied by the volume of the domain.) Often _quasirandom sequences_ (also known as [_low-discrepancy sequences_](https://en.wikipedia.org/wiki/Low-discrepancy_sequence), such as Sobol and Halton sequences), often together with an RNG, provide the "random" numbers to sample the function more efficiently.  Unfortunately, the methods to produce such sequences are too complicated to show here.

<a id=Choosing_a_Random_Date_Time></a>
### Choosing a Random Date/Time

Choosing a random date/time at or between two others is equivalent to&mdash;

- converting the two input date/times to an integer or number (here called `date1` and `date2`, where `date1` represents the earlier date/time and `date2` the other) at the required granularity, for instance, month, day, or hour granularity (the details of such conversion depend on the date/time format and are outside the scope of this document),
- generating `newDate = RNDINTRANGE(date1, date2)` or `newDate = RNDNUMRANGE(date1, date2)`, respectively, and
- converting `newDate` to a date/time.

If either input date/time was generated as the random date, but that is not desired, the process just given can be repeated until such a date/time is not generated this way.

<a id=Generating_Random_Numbers_in_Sorted_Order></a>
### Generating Random Numbers in Sorted Order

The following pseudocode describes a method that generates random numbers in the interval [0, 1] in sorted order.   `count` is the number of random numbers to generate this way. The method is based on an algorithm from Bentley and Saxe 1979.

     METHOD SortedRandom(count)
        list = NewList()
        k = count
        c = 1.0
        while k > 0
            c = pow(RNDU01(), 1.0 / k) * c
            AddItem(list, c)
        end
        return list
     END METHOD

Alternatively, random numbers can be generated (using any method and where the numbers have any distribution and range) and stored in a list, and the list then sorted using a sorting algorithm.  Details on sorting algorithms, however, are beyond the scope of this document.

<a id=Rejection_Sampling></a>
### Rejection Sampling

_Rejection sampling_ is a simple and flexible technique for generating random content that
meets certain requirements.  To implement rejection sampling:

1. Generate the random content (such as a random number) by any method and with any distribution and range.
2. If the content doesn't meet predetermined criteria, go to step 1.

Example criteria include checking any one or more of&mdash;
- whether a random number is prime,
- whether a random number is divisible or not by certain numbers,
- whether a random number is not among recently chosen random numbers,
- whether a random number was not already chosen (with the aid of a hash table, red-black tree, or similar structure),
- whether a random point is sufficiently distant from previous random points (with the aid of a KD-tree or similar structure), and
- whether a random number is not included in a "blacklist" of numbers.

(KD-trees, hash tables, red-black trees, and prime-number testing algorithms are outside the scope of this document.)

<a id=General_Non_Uniform_Distributions></a>
## General Non-Uniform Distributions

Some applications need to choose random items or numbers such that some of them are more likely to be chosen than others (a _non-uniform_ distribution). Most of the techniques in this section show how to use the [uniform random number methods](#Uniform_Random_Numbers) to generate such random items or numbers.

<a id=Discrete_Weighted_Choice></a>
### Discrete Weighted Choice

The discrete weighted choice method generates a random item from among a collection of them with separate probabilities of each item being chosen.

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

**Example**:

Assume we have the following list: `["apples", "oranges", "bananas", "grapes"]`, and `weights` is the following: `[3, 15, 1, 2]`.  The weight for "apples" is 3, and the weight for "oranges" is 15.  Since "oranges" has a higher weight than "apples", the index for "oranges" (1) is more likely to be chosen than the index for "apples" (0) with the `DiscreteWeightedChoice` method.  The following pseudocode implements how to get a randomly chosen item from the list with that method.

        index = DiscreteWeightedChoice(weights)
        // Get the actual item
        item = list[index]

In the example above, the weights sum to 21.  However, the weights do not mean that when 21 items are selected, the index for "apples" will be chosen exactly 3 times, or the index for "oranges" exactly 15 times, for example.  Each number generated by `DiscreteWeightedChoice` is independent from the others, and each weight indicates only a _likelihood_ that the corresponding index will be chosen rather than the other indices.  And this likelihood doesn't change no matter how many times `DiscreteWeightedChoice` is given the same weights.  This is called a weighted choice _with replacement_, which can be thought of as drawing a ball, then putting it back.

<a id=Weighted_Choice_Without_Replacement></a>
#### Weighted Choice Without Replacement

To implement weighted choice _without replacement_ (which can be thought of as drawing a ball _without_ putting it back), generate an index by `DiscreteWeightedChoice`, and then decrease the weight for the chosen index by 1.  In this way, when items are selected repeatedly, each weight behaves like the number of "copies" of each item. This technique, though, will only work properly if all the weights are integers 0 or greater.  The pseudocode below is an example of this.

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

Sorting a list of items such that higher-weighted items are more likely to appear first is equivalent to the technique presented in this section.

<a id=Piecewise_Constant_Distribution></a>
#### Piecewise Constant Distribution

The discrete weighted choice method can also be used to implement a [_piecewise constant distribution_](http://en.cppreference.com/w/cpp/numeric/random/piecewise_constant_distribution), as in the following example. Assume we have the following list: `[0, 5, 10, 11, 15]`, and `weights` is the following: `[3, 15, 1, 2]`.  Note that the weight list has one fewer item than the number list.  The weight for "0 to 5" (0 or greater, less than 5) is 3, and the weight for "5 to 10" is 15.  Since "5 to 10" has a higher weight than "0 to 5", this distribution will choose a number from 5 to 10 more often than a number from 0 to 5.  The following pseudocode implements the piecewise constant distribution.

    // Choose a random index
    index = DiscreteWeightedChoice(weights)
    // Choose a random number in the chosen interval on the list
    number = RNDNUMEXCRANGE(list[index], list[index + 1])

The code above implements the distribution _with replacement_.  Implementing the distribution _without replacement_ is similar to implementing [discrete weighted choice without replacement](#Weighted_Choice_Without_Replacement); the only change is to replace `AddItem(items, list[index])` with `AddItem(items, RNDNUMEXCRANGE(list[index], list[index + 1]))` in the pseudocode.

<a id=Continuous_Weighted_Choice></a>
### Continuous Weighted Choice

The continuous weighted choice method generates a random number that follows a continuous probability distribution (here, a [_piecewise linear distribution_](http://en.cppreference.com/w/cpp/numeric/random/piecewise_linear_distribution)).

The pseudocode below takes two lists as follows:

- `list` is a list of numbers (which need not be integers). If the numbers are arranged in ascending order, which they should, the first number in this list can be returned exactly, but not the last number.
- `weights` is a list of weights for the given numbers (where each number and its weight have the same index in both lists).   The greater a number's weight, the more likely it is that a number close to that number will be chosen.  Each weight should be 0 or greater.

&nbsp;

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

**Example**: Assume `list` is the following: `[0, 1, 2, 2.5, 3]`, and `weights` is the following: `[0.2, 0.8, 0.5, 0.3, 0.1]`.  The weight for 2 is 0.5, and that for 2.5 is 0.3.  Since 2 has a higher weight than 2.5, numbers near 2 are more likely to be chosen than numbers near 2.5 with the `ContinuousWeightedChoice` method.

<a id=Random_Numbers_from_a_Distribution_of_Data_Points></a>
### Random Numbers from a Distribution of Data Points

To generate a random number (or data point) based on the distribution of a list of numbers (or data points)&mdash;

- choose one of the numbers or points at random (see, for example, [Choosing a Random Item from a List](#Sampling_With_Replacement_Choosing_a_Random_Item_from_a_List)), and
- add a randomized "jitter" to the chosen number or point; for example&mdash;
    - add `Normal(0, sigma)` to the chosen number, where `sigma` is the _bandwidth_ (which should be as low or as high as allows the estimated distribution to fit the data and remain smooth), or
    - add a separately generated `Normal(0, sigma)` to each component of the chosen point, where `sigma` is the _bandwidth_<sup>[(8)](#Note8)</sup>.

A detailed discussion on how to calculate bandwidth or on other possible ways to add randomized "jitter" (whose distribution is formally called a _kernel_) is outside the scope of this document.  For further information on _kernel density estimation_, which the random number generation technique here is related to, see the Wikipedia articles on [single-variable](https://en.wikipedia.org/wiki/Kernel_density_estimation) and [multiple-variable](https://en.wikipedia.org/wiki/Multivariate_kernel_density_estimation) estimation, or a [blog post by M. Kay](http://mark-kay.net/2013/12/24/kernel-density-estimation/).

<a id=Random_Numbers_from_an_Arbitrary_Distribution></a>
### Random Numbers from an Arbitrary Distribution

Many probability distributions can be defined in terms of any of the following:

* The [_cumulative distribution function_](https://en.wikipedia.org/wiki/Cumulative_distribution_function), or _CDF_, returns, for each number, the probability for a randomly generated variable to be equal to or less than that number; the probability is in the interval [0, 1].
* The [_probability density function_](https://en.wikipedia.org/wiki/Probability_density_function), or _PDF_, is, roughly and intuitively, a curve of weights greater than 0, where for each number, the greater its weight, the more likely a number close to that number is randomly chosen.<sup>[(9)](#Note9)</sup>

If a probability distribution's **PDF is known**, one of the following techniques, among others, can be used to generate random numbers that follow that distribution.

1. Use the PDF to calculate the weights for a number of sample points (usually regularly spaced). Create one list with the sampled points in ascending order (the `list`) and another list of the same size with the PDF's values at those points (the `weights`).  Finally generate [`ContinuousWeightedChoice(list, weights)`](#Continuous_Weighted_Choice) to generate a random number bounded by the lowest and highest sampled point. This technique can be used even if the area under the PDF isn't 1. **OR**
2. Use [_inverse transform sampling_](https://en.wikipedia.org/wiki/Inverse_transform_sampling). Generate `ICDF(RNDU01ZeroOneExc())`, where `ICDF(X)` is the distribution's _inverse cumulative distribution function_ (_inverse CDF_, or inverse of the CDF) assuming the area under the PDF is 1. **OR**
3. Use [_rejection sampling_](#Rejection_Sampling).  Choose the lowest and highest random number to generate (`minValue` and `maxValue`, respectively) and find the maximum value of the PDF at or between those points (`maxDensity`).  The rejection sampling approach is then illustrated with the following pseudocode, where `PDF(X)` is the distribution's PDF (see also Saucier 2000, p. 39).   This technique can be used even if the area under the PDF isn't 1.

        METHOD ArbitraryDist(minValue, maxValue, maxDensity)
             if minValue >= maxValue: return error
             while True:
                 x=RNDNUMEXCRANGE(minValue, maxValue)
                 y=RNDNUMEXCRANGE(0, maxDensity)
                 if y < PDF(x): return x
             end
        END METHOD

If both **a PDF and a uniform random variable in the interval [0, 1) (`randomVariable`)** are given, then one of the following techniques can be used to generate a random number that follows that distribution:

1. Do the same process as method 1, given earlier, except&mdash;
    - divide the weights in the `weights` list by the sum of all weights, and
    - use a modified version of [`ContinuousWeightedChoice`](#Continuous_Weighted_Choice) that uses `randomVariable` rather than generating a new random number. **OR**
2. Generate `ICDF(randomVariable)`, where `ICDF(X)` is the distribution's inverse CDF (see method 2, given earlier).

If the distribution's **CDF is known**, generate `ICDF(RNDU01ZeroOneExc())`, where `ICDF(X)` is the inverse of that CDF.

> **Note:** Further details on inverse transform sampling or on how to find inverses, as well as lists of PDFs and CDFs, are outside the scope of this page.

<a id=Mixtures_of_Distributions></a>
### Mixtures of Distributions

A _mixture_ consists of two or more sampling distributions with separate probabilities of being sampled.
To generate random content from a mixture&mdash;

1. generate `index = DiscreteWeightedChoice(weights)`, where `weights` is a list of relative probabilities that each distribution in the mixture will be sampled, then
2. based on the value of `index`, generate the random content from the corresponding distribution.

> **Examples:**
>
> - One mixture consists of two normal distributions with two different means: 1 and -1, but the mean 1 normal will be sampled 80% of the time.  The following pseudocode shows how this mixture can be sampled:
>
>         index = DiscreteWeightedChoice([80, 20])
>         number = 0
>         // If index 0 was chosen, sample from the mean 1 normal
>         if index==0: number = Normal(1, 1)
>         // Else index 1 was chosen, sample from the mean -1 normal
>         else: number = Normal(-1, 1)
>
> - Choosing a point uniformly at random from a complex shape (in any number of dimensions) is equivalent to sampling uniformly from a mixture of simpler shapes that make up the complex shape (here, the `weights` list holds the content of each simpler shape).  (Content is called area in 2D and volume in 3D.) For example, a simple closed 2D polygon can be [_triangulated_](https://en.wikipedia.org/wiki/Polygon_triangulation), or decomposed into [triangles](#Random_Point_Inside_a_Triangle), and a mixture of those triangles can be sampled.<sup>[(10)](#Note10)</sup>
> - For generating a random integer from multiple nonoverlapping ranges of integers&mdash;
>     - each range has a weight of `(mx - mn) + 1`, where `mn` is that range's minimum and `mx` is its maximum, and
>     - the chosen range is sampled by generating `RNDINTRANGE(mn, mx)`, where `mn` is the that range's minimum and `mx` is its maximum.
>
>     For generating random numbers, that may or may not be integers, from nonoverlapping number ranges, each weight is `mx - mn` instead and the number is sampled by `RNDNUMEXCRANGE(mn, mx)` instead.

<a id=Censored_and_Truncated_Distributions></a>
### Censored and Truncated Distributions

To sample from a _censored_ probability distribution, generate a random number from that distribution and&mdash;
- if that number is less than a minimum threshold, use the minimum threshold instead, and/or
- if that number is greater than a maximum threshold, use the maximum threshold instead.

To sample from a _truncated_ probability distribution, generate a random number from that distribution and, if that number is less than a minimum threshold and/or higher than a maximum threshold, repeat this process.

<a id=Correlated_Random_Numbers></a>
### Correlated Random Numbers

According to (Saucier 2000), sec. 3.8, to generate two correlated (dependent) random variables&mdash;

- generate two independent and identically distributed random variables `x` and `y` (for example, two `Normal(0, 1)` variables or two `RNDU01()` variables), and
- calculate `[x, y*sqrt(1 - rho * rho) + rho * x]`, where `rho` is a _correlation coefficient_ in the interval \[-1, 1\] (if `rho` is 0, the variables are uncorrelated).

Another way to generate correlated random numbers is explained in the section "[Gaussian Copula](#Gaussian_Copula)".

<a id=Specific_Non_Uniform_Distributions></a>
## Specific Non-Uniform Distributions

This section contains information on some of the most common non-uniform sampling distributions.

<a id=Dice></a>
### Dice

The following method generates a random result of rolling virtual dice.<sup>[(11)](#Note11)</sup>  It takes three parameters: the number of dice (`dice`), the number of sides in each die (`sides`), and a number to add to the result (`bonus`) (which can be negative, but the result of the subtraction is 0 if that result is greater).

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
            while ret < dice or ret > dice * sides
                ret = round(Normal(mean, sigma))
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

> **Examples:** The result of rolling&mdash;
> - four six-sided virtual dice ("4d6") is `DiceRoll(4,6,0)`,
> - three ten-sided virtual dice, with 4 added ("3d10 + 4"), is `DiceRoll(3,10,4)`, and
> - two six-sided virtual dice, with 2 subtracted ("2d6 - 2"), is `DiceRoll(2,6,-2)`.

<a id=Normal_Gaussian_Distribution></a>
### Normal (Gaussian) Distribution

The [_normal distribution_](https://en.wikipedia.org/wiki/Normal_distribution) (also called the Gaussian distribution) can model many kinds of measurements or scores whose values are most likely around a given average and are less likely the farther away from that average on either side.

In the pseudocode below, which uses the polar method <sup>[(12)](#Note12)</sup> to generate two normally-distributed random numbers:
- `mu` (&mu;) is the mean (average), or the peak of the distribution's "bell curve".
- `sigma` (&sigma;), the standard deviation, affects how wide the "bell curve" appears. The
probability that a normally-distributed random number will be within one standard deviation from the mean is about 68.3%; within two standard deviations (2 times `sigma`), about 95.4%; and within three standard deviations, about 99.7%.

&nbsp;

    METHOD Normal2(mu, sigma)
      while true
        a = RNDU01()
        b = RNDU01()
        if a != 0 and RNDINT(1) == 0: a = 0 - a
        if b != 0 and RNDINT(1) == 0: b = 0 - b
        c = a * a + b * b
        if c != 0 and c <= 1
           c = sqrt(-2 * ln(c) / c)
           return [a * mu * c + sigma, b * mu * c + sigma]
        end
      end
    END METHOD

Since `Normal2` returns two numbers instead of one, but many applications require only one number at a time, a problem arises on how to return one number while storing the other for later retrieval.  Ways to solve this problem are outside the scope of this page, however.  The name `Normal` will be used in this document to represent a method that returns only one normally-distributed random number rather than two.

Alternatively, or in addition, the following method (implementing a ratio-of-uniforms technique) can be used to generate normally distributed random numbers.

    METHOD Normal(mu, sigma)
        bmp = sqrt(2.0/exp(1.0)) // about 0.8577638849607068
        while true
            a=RNDU01ZeroExc()
            b=RNDNUMRANGE(-bmp,bmp)
            if b*b <= -a * a * 4 * ln(a)
                return (b * sigma / a) + mu
            end
        end
    END METHOD

> **Notes:**
> - In a _standard normal distribution_, `mu` = 0 and `sigma` = 1.
> - Note that if variance is given, rather than standard deviation, the standard deviation (`sigma`) is the variance's square root.

<a id=Binomial_Distribution></a>
### Binomial Distribution

A random integer that follows a _binomial distribution_&mdash;
- expresses the number of successes that have happened after a given number of independently performed trials
(expressed as `trials` below), where the probability of a success in each trial is `p` (which ranges from 0, never, to
1, always, and which can be 0.5, meaning an equal chance of success or failure), and
- is also known as  [_Hamming distance_](https://en.wikipedia.org/wiki/Hamming_distance), if each trial is treated
as a "bit" that's set to 1 for a success and 0 for a failure, and if `p` is 0.5.

&nbsp;

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
        // generation of probability distributions", 2000, p. 49
        tp = trials * p
        if tp > 25 or (tp > 5 and p > 0.1 and p < 0.9)
             countval = -1
             while countval < 0 or countval > trials
                  countval = round(Normal(tp, tp))
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

> **Examples:**
> - If `p` is 0.5, the binomial distribution models the task "Flip N coins, then count the number of heads."
> - The idiom `Binomial(N, 0.5) >= C` is true if at least C coins, among N coins flipped, show the successful outcome (for example, heads if heads is the successful outcome).
> - The idiom `Binomial(N, 1/S)` models the task "Roll N S-sided dice, then count the number of dice that show the number S."

<a id=Poisson_Distribution></a>
### Poisson Distribution

In the following method, which generates a random integer that follows a _Poisson distribution_&mdash;

- `mean` is the average number of independent events of a certain kind per fixed unit of time or space (for example, per day, hour, or square kilometer), and can be an integer or a non-integer, and
- the method's return value&mdash;
    - gives a random number of such events within one such unit, and
    - is such that the average of the return values approaches `mean` when this method is repeatedly given the same value for `mean`.

The method given here is based on Knuth's method from 1969.

    METHOD Poisson(mean)
        if mean < 0: return error
        if mean == 0: return 0
        p = 1.0
        // Suggested by Saucier, R. in "Computer
        // generation of probability distributions", 2000, p. 49
        if mean > 9
            p = -1.0
            while p < 0: p = round(Normal(mean, mean))
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

The _gamma distribution_ models expected lifetimes. The following method, which generates a random number that follows a gamma distribution, is based on Marsaglia and Tsang's method from 2000.

    METHOD GammaDist(meanLifetime)
        // Must be greater than 0
        if meanLifetime <= 0: return error
        // Exponential distribution special case if
        // `meanLifetime` is 1 (see also
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

<a id=Negative_Binomial_Distribution></a>
### Negative Binomial Distribution

A random integer that follows a _negative binomial distribution_ expresses the number of failures that have happened after seeing a given number of successes (expressed as `successes` below), where the probability of a success in each case is `p` (where `p <= 0` means never, `p >= 1` means always, and `p = 0.5` means an equal chance of success or failure).

    METHOD NegativeBinomial(successes, p)
        // Must be 0 or greater
        if successes < 0: return error
        // No failures if no successes or if always succeeds
        if successes == 0 or p >= 1.0: return 0
        // Always fails (NOTE: infinity can be the maximum possible
        // integer value if NegativeBinomial is implemented to return
        // an integer)
        if p <= 0.0: return infinity
        // NOTE: If 'successes' can be an integer only,
        // omit the following three lines:
        if floor(successes) != successes
            return Poisson(GammaDist(successes) * (1 - p) / p)
        end
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

> **Example:** If `p` is 0.5 and `successes` is 1, the negative binomial distribution models the task "Flip a coin until you get tails, then count the number of heads."

<a id=von_Mises_Distribution></a>
### von Mises Distribution

In the following method, which generates a random number that follows a _von Mises distribution_, which describes a distribution of circular angles&mdash;

- `mean` is the mean angle,
- `kappa` is a shape parameter, and
- the method can return a number within &pi; of that mean.

The algorithm below is the Best&ndash;Fisher algorithm from 1979 (as described in Devroye 1986 with errata incorporated).

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
               // NOTE: Inverse cosine replaced here
               // with `atan2` equivalent
               angle = atan2(sqrt(1-w*w),w)
               if u < 0: angle = -angle
               return mean + angle
            end
        end
    END METHOD

<a id=Stable_Distribution></a>
### Stable Distribution

As more and more independent and identically distributed random variables are added
together, their distribution tends to a [_stable distribution_](https://en.wikipedia.org/wiki/Stable_distribution),
which resembles a curve with a single peak, but with generally "fatter" tails than the normal distribution.  The pseudocode below uses the Chambers&ndash;Mallows&ndash;Stuck algorithm.  The `Stable` method, implemented below, takes two parameters:

- `alpha` is a stability index in the interval (0, 2].
- `beta` is a skewness in the interval [-1, 1]; if `beta` is 0, the curve is symmetric.

&nbsp;

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
        ug=unif+atan2(-z, 1)/alpha
        cpow=pow(c, -1.0 / alpha)
        return pow(1.0+z*z, 1.0 / (2*alpha))*
            (sin(alpha*ug)*cpow)*
            pow(cos(unif-alpha*ug)/expo, (1.0 - alpha) / alpha)
    END METHOD

Extended versions of the stable distribution:

- The four-parameter stable distribution (`Stable4(alpha, beta, mu, sigma)`), where `mu` is the mean and ` sigma` is the scale, is `Stable(alpha, beta) * sigma + mu`.
- The "type 0" stable distribution (`StableType0(alpha, beta, mu, sigma)`) is `Stable(alpha, beta) * sigma + (mu - sigma * beta * x)`, where `x` is `ln(sigma)*2.0/pi` if `alpha` is 1, and `tan(pi*0.5*alpha)` otherwise.

<a id=Hypergeometric_Distribution></a>
### Hypergeometric Distribution

The following method generates a random integer that follows a _hypergeometric distribution_.
When a given number of items are drawn at random without replacement from a collection of items
each labeled either `1` or `0`,  the random integer expresses the number of items drawn
this way that are labeled `1`.  In the method below, `trials` is the number of items
drawn at random, `ones` is the number of items labeled `1` in the set, and `count` is
the number of items labeled `1` or `0` in that set.

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

> **Example:** In a 52-card deck of Anglo-American playing cards, 12 of the cards are face
cards (jacks, queens, or kings).  After the deck is shuffled and seven cards are drawn, the number
of face cards drawn this way follows a hypergeometric distribution where `trials` is 7, `ones` is
12, and `count` is 52.

<a id=Multivariate_Normal_Distribution></a>
### Multivariate Normal Distribution

The following pseudocode calculates a random point in space that follows a [_multivariate normal distribution_](https://en.wikipedia.org/wiki/Multivariate_normal_distribution).  The method `MultivariateNormal` takes the following parameters:

- A list, `mu`, which indicates the means
to add to each component of the random point. `mu` can be `nothing`, in which case each
component will have a mean of zero.
- A list of lists `cov`, that specifies a _covariance matrix_ (a symmetric positive definite NxN matrix with as many rows and as many columns as components of the random point).

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
      mulen=size(cov)
      if mu != nothing
       mulen = size(mu)
        if mulen!=size(cov): return error
        if mulen!=size(cov[0]): return error
      end
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
        if mulen == nothing: sum = 0
        else: sum=mu[i]
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

<a id=Dirichlet_Distribution_Random_Numbers_with_a_Given_Positive_Sum></a>
### Dirichlet Distribution: Random Numbers with a Given Positive Sum

The _Dirichlet distribution_ models a distribution of N numbers that sum to a given positive number, `total`.  Generating N `GammaDist(total)` numbers and dividing them by their sum will result in N random numbers that (approximately) sum to `total` (see the [Wikipedia article](https://en.wikipedia.org/wiki/Dirichlet_distribution#Gamma_distribution)).  For example, if `total` is 1, the numbers will (approximately) sum to 1.  Note that in the exceptional case that all numbers are 0, the process should repeat. (A more general version of the Dirichlet distribution allows the parameter in `GammaDist` to vary for each random number.)

The following pseudocode shows how to generate random integers with a given positive sum. (The algorithm for this was presented in Smith and Tromble, "[Sampling Uniformly from the Unit Simplex](http://www.cs.cmu.edu/~nasmith/papers/smith+tromble.tr04.pdf)", 2004.)  In the pseudocode below&mdash;

- the method `NonzeroIntegersWithSum` returns `n` positive integers that sum to `total`,
- the method `IntegersWithSum` returns `n` nonnegative integers that sum to `total`, and
- `Sort(list)` sorts the items in `list` in ascending order (note that details on sort algorithms are outside the scope of this document).

&nbsp;

    METHOD NonzeroIntegersWithSum(n, total)
        if n <= 0 or total <=0: return error
        ls = NewList()
        ret = NewList()
        AddItem(ls, 0)
        while size(ls) < n
                c = RNDINTEXCRANGE(1, total)
                found = false
                j = 1
                while j < size(ls)
                        if ls[j] == c
                                found = true
                                break
                        end
                        j = j + 1
                end
                if found == false: AddItem(ls, c)
        end
        Sort(ls)
        AddItem(ls, total)
         i = 1
        while i < size(ls):
                AddItem(ret, list[i] - list[i - 1])
                i = i + 1
        end
        return ret
    END METHOD

    METHOD IntegersWithSum(n, total)
        if n <= 0 or total <=0: return error
        ret = NonzeroIntegersWithSum(n, total + n)
         i = 0
        while i < size(ret):
                ret[i] = ret[i] - 1
                i = i + 1
        end
        return ret
    END METHOD

> **Notes:**
>
> - The problem of generating N random numbers with a given positive sum `sum` is equivalent to the problem of generating a uniformly distributed point inside an N-dimensional simplex (simplest convex figure) whose edges all have a length of `sum` units.
> - Generating `N` random numbers with a given positive average `avg` is equivalent to generating `N` random numbers with the sum `N * avg`.
> - Generating `N` random numbers `min` or greater and with a given positive sum `sum` is equivalent to generating `N` random numbers with the sum `sum - n * min`, then adding `min` to each number generated this way.

<a id=Multinomial_Distribution></a>
### Multinomial Distribution

The _multinomial distribution_ models the number of times each of several mutually exclusive events happens among a given number of trials, where each event can have a separate probability of happening.  The pseudocode below is of a method that takes two parameters: `trials`, which is the number of trials, and `weights`, which are the relative probabilities of each event.  The method tallies the events as they happen and returns a list (with the same size as `weights`) containing the number of successes for each event.

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

<a id=Gaussian_Copula></a>
### Gaussian Copula

Correlated random numbers can be generated by sampling from a [multivariate normal distribution](#Multivariate_Normal_Distribution), then converting the resulting numbers to uniformly-distributed numbers.  In the following pseudocode, which generates correlated uniformly-distributed random numbers this way:

- The parameter `covar` is the covariance matrix for the multivariate normal distribution.
- `erf(v)` is the [error function](https://en.wikipedia.org/wiki/Error_function) of the variable `v`.  It's provided here because some popular programming languages, such as JavaScript at the time of this writing, don't include a built-in version of `erf`.  In the method, `EPSILON` is a very small number to end the iterative calculation.

The pseudocode below is one example of a _copula_ (a distribution of groups of two or more correlated uniform random numbers), namely, a _Gaussian copula_.

    METHOD erf(v)
        if v==0: return 0
        if v<0: return -erf(-v)
        if v==infinity: return 1
        // NOTE: For Java `double`, the following
        // line can be added:
        // if v>=6: return 1
        i=1
        ret=0
        zp=-(v*v)
        zval=1.0
        den=1.0
        while i < 100
            r=v*zval/den
            den=den+2
            ret=ret+r
            // NOTE: EPSILON can be 10^14,
            // for example.
            if abs(r)<EPSILON: break
            if i==1: zval=zp
            else: zval = zval*zp/i
            i = i + 1
        end
        return ret*2/sqrt(pi)
    END METHOD

    METHOD GaussianCopula(covar)
        mvn=MultivariateNormal(nothing, covar)
        i = 0
       sqrt2=sqrt(2)
       while i < size(covar)
          stdev=sqrt(covar[i][i])
          // Apply the standard normal distribution's CDF
          // function to get uniform variables
          mvn[i] = (erf(mvn[i]/(sqrt2))+1)*0.5
           i = i + 1
       end
       return mvn
    END METHOD

Each of the resulting uniform variables will be in the interval [0, 1], and each one can be further transformed to any other probability distribution (which is called a _marginal distribution_ here) by one of the methods given in "[Random Numbers from an Arbitrary Distribution](#Random_Numbers_from_an_Arbitrary_Distribution)". (See also Cario and Nelson 1997.)

**Example**: To generate two correlated uniform variables by this method, generate `GaussianCopula([[1, rho], [rho, 1]])`, where `rho` is the Pearson correlation coefficient, in the interval [-1, 1]. (Note that [_rank correlation_](https://en.wikipedia.org/wiki/Rank_correlation) parameters, which can be converted to `rho`, can better describe the correlation than `rho` itself. For example, if a 2x2 covariance matrix is used, the Spearman coefficient `srho` can be converted to `rho` by `rho = sin(srho * pi / 6) * 2`.  Rank correlation parameters are not further discussed in this document.)

<a id=Other_Non_Uniform_Distributions></a>
### Other Non-Uniform Distributions

Most commonly used:

- **Beta distribution (`BetaDist(a, b)`)**: `x / (x + GammaDist(b))`, where `x` is `GammaDist(a)` and `a` and `b` are
 the two parameters of the beta distribution.  The range of the beta distribution is [0, 1).
- **Cauchy (Lorentz) distribution**: `scale * tan(pi * (RNDU01OneExc()-0.5)) + mu`, where `mu` and `scale`
are the two parameters of the Cauchy distribution.  This distribution is similar to the normal distribution, but with "fatter" tails.
- **Chi-squared distribution**: `GammaDist(df * 0.5 + Poisson(sms * 0.5)) * 2`, where `df` is the number of degrees of freedom and `sms` is the sum of mean squares (where `sms` other than 0 indicates a _noncentral_ distribution).
- **Exponential distribution**: `-ln(RNDU01ZeroExc()) / lamda`, where `lamda` is the inverse scale. The `lamda` is usually the probability that an independent event of a given kind will occur in a given span of time (such as in a given day or year).  (This distribution is thus useful for modeling a _Poisson process_.) `1.0 / lamda` is the scale (mean), which is usually the average waiting time between two independent events of the same kind.
- **Extreme value distribution**: `a - ln(-ln(RNDU01ZeroOneExc())) * b`, where `b` is the scale and `a` is the location of the distribution's curve peak (mode).
This expresses a distribution of maximum values.
- **Geometric distribution**: `NegativeBinomial(1, p)`, where `p` has the same meaning
 as in the negative binomial distribution.  As used here, this is the number of failures that have happened before a success happens. (Saucier 2000, p. 44, also mentions an alternative definition that includes the success.)
- **Gumbel distribution**: `a + ln(-ln(RNDU01ZeroOneExc())) * b`, where `b` is the scale and `a` is the location of the distribution's curve peak (mode).
This expresses a distribution of minimum values.
- **Inverse gamma distribution**: `b / GammaDist(a)`, where `a` and `b` have the
 same meaning as in the two-parameter gamma distribution.
- **Laplace (double exponential) distribution**: `(ln(RNDU01ZeroExc()) - ln(RNDU01ZeroExc())) * beta + mu`, where `beta` is the scale and `mu` is the mean.
- **Logarithmic distribution**: `min + (max - min) * RNDU01OneExc() * RNDU01OneExc()`, where `min` is the minimum value and `max` is the maximum value (Saucier 2000, p. 26).  In this distribution, numbers closer to `min` are exponentially more likely than numbers closer to `max`.
- **Logarithmic normal distribution**: `exp(Normal(mu, sigma))`, where `mu` and `sigma`
 have the same meaning as in the normal distribution.
- **Pareto distribution**: `pow(RNDU01ZeroOneExc(), -1.0 / alpha) * minimum`, where `alpha`  is the shape and `minimum` is the minimum.
- **Rayleigh distribution**: `a * sqrt(-2 * ln(RNDU01ZeroExc()))`, where `a` is the scale and is greater than 0.
- **Student's _t_-distribution**: `Normal(cent, 1) / sqrt(GammaDist(df * 0.5) * 2 / df)`, where `df` is the number of degrees of freedom, and _cent_ is the mean of the normally-distributed random number.  A `cent` other than 0 indicates a _noncentral_ distribution.
- **Triangular distribution**: `ContinuousWeightedChoice([startpt, midpt, endpt], [0, 1, 0])`. The distribution starts at `startpt`, peaks at `midpt`, and ends at `endpt`.
- **Weibull distribution**: `b * pow(-ln(RNDU01ZeroExc()),1.0 / a)`, where `a` is the shape, `b` is the scale, and `a` and `b` are greater than 0.

Miscellaneous:

- **Arcsine distribution**: `min + (max - min) * BetaDist(0.5, 0.5)`, where `min` is the minimum value and `max` is the maximum value (Saucier 2000, p. 14).
- **Beta binomial distribution**: `Binomial(trials, BetaDist(a, b))`, where `a` and `b` are
 the two parameters of the beta distribution, and `trials` is a parameter of the binomial distribution.
- **Beta-PERT distribution**: `startpt + size * BetaDist(1.0 + (midpt - startpt) * shape / size, 1.0 + (endpt - midpt) * shape / size)`. The distribution starts  at `startpt`, peaks at `midpt`, and ends at `endpt`, `size` is `endpt - startpt`, and `shape` is a shape parameter that's 0 or greater, but usually 4.  If the mean (`mean`) is known rather than the peak, `midpt = 3 * mean / 2 - (startpt + endpt) / 4`.
- **Beta prime distribution**: `x / (1 - x)`, where `x` is `BetaDist(a, b)` and `a` and `b` are the two parameters of the beta distribution.
- **Beta negative binomial distribution**: `NegativeBinomial(successes, BetaDist(a, b))`, where `a` and `b` are
 the two parameters of the beta distribution, and `successes` is a parameter of the negative binomial distribution. If _successes_ is 1, the result is a _Waring&ndash;Yule distribution_.
- **Binormal distribution**: `MultivariateNormal([mu1, mu2], [[s1*s1, s1*s2*rho], [rho*s1*s2, s2*s2]])`, where `mu1` and `mu2` are the means of the two random variables, `s1` and `s2` are their standard deviations, and `rho` is a _correlation coefficient_ greater than -1 and less than 1.
- **Chi distribution**: `sqrt(GammaDist(df * 0.5) * 2)`, where `df` is the number of degrees of
  freedom.
- **Cosine distribution**: `min + (max - min) * atan2(x, sqrt(1 - x * x)) / pi`, where `x = RNDNUMRANGE(-1, 1)` and `min` is the minimum value and `max` is the maximum value (Saucier 2000, p. 17; inverse sine replaced with `atan2` equivalent).
- **Double logarithmic distribution**: `min + (max - min) * (0.5 + (RNDINT(1) * 2 - 1) * 0.5 * RNDU01OneExc() * RNDU01OneExc())`, where `min` is the minimum value and `max` is the maximum value (see also Saucier 2000, p. 15, which shows the wrong X axes).
- **Erlang distribution**: `GammaDist(shape) / rate`, where `shape` and `rate` are the two parameters of the Erlang distribution.
- **Generalized extreme value (Fisher&ndash;Tippett) distribution**: `a - (pow(-ln(RNDU01ZeroExc()), -c) - 1) * b / c` if `c != 0`, or `a - ln(-ln(RNDU01ZeroOneExc())) * b` otherwise, where `b` is the scale, `a` is the location of the distribution's curve peak (mode), and `c` is a shape parameter.
This expresses a distribution of maximum values.
- **Half-normal distribution**: `abs(Normal(0, sqrt(pi * 0.5) / invscale)))`, where `invscale` is a parameter of the half-normal distribution.
- **Inverse chi-squared distribution**: `df * scale / (GammaDist(df * 0.5) * 2)`, where `df` is the number of degrees of freedom and `scale` is the scale, usually `1.0 / df`.
- **Inverse Gaussian distribution (Wald distribution)**: Generate `n = mu + (mu*mu*y/(2*lamda)) - mu * sqrt(4 * mu * lamda * y + mu * mu * y * y) / (2 * lamda)`, where `y = pow(Normal(0, 1), 2)`, then return `n` if `RNDU01OneExc() <= mu / (mu + n)`, or `mu * mu / n` otherwise. `mu` is the mean and `lamda` is the scale; both parameters are greater than 0. Based on method published in [Devroye 1986](http://luc.devroye.org/rnbookindex.html).
- **Kumaraswamy distribution**: `min + (max - min) * pow(1-pow(RNDU01ZeroExc(),1.0/b),1.0/a)`, where `a` and `b` are shape parameters, `min` is the minimum value, and `max` is the maximum value.
- **L&eacute;vy distribution**: `sigma * 0.5 / GammaDist(0.5) + mu`, where `mu` is the location and `sigma` is the dispersion.
- **Logarithmic series distribution**: `floor(1.0 + ln(RNDU01ZeroExc()) / ln(1.0 - pow(1.0 - param, RNDU01ZeroOneExc())))`, where `param` is a number greater than 0 and less than 1. Based on method described in Devroye 1986.
- **Logistic distribution**: `(ln(x/(1.0 - x)) * scale + mean`, where `x` is `RNDU01ZeroOneExc()` and `mean` and `scale` are the two parameters of the logistic distribution.
- **Maxwell distribution**: `scale * sqrt(GammaDist(1.5) * 2)`, where `scale` is the scale.
- **Parabolic distribution**: `min + (max - min) * BetaDist(2, 2)`, where `min` is the minimum value and `max` is the maximum value (Saucier 2000, p. 30).
- **Pascal distribution**: `NegativeBinomial(successes, p) + successes`, where `successes` and `p` have the same meaning as in the negative binomial distribution, except `successes` must be an integer.
- **Pearson VI distribution**: `GammaDist(v) / (GammaDist(w))`, where `v` and `w` are shape parameters greater than 0 (Saucier 2000, p. 33; there, an additional `b` parameter is defined, but that parameter is canceled out in the source code).
- **Power distribution**: `pow(RNDU01ZeroOneExc(), 1.0 / alpha)`, where `alpha`  is the shape.  Nominally in the interval (0, 1).
- **Power law distribution**: `pow(pow(mn,n+1) + (pow(mx,n+1) - pow(mn,n+1)) * RNDU01(), 1.0 / (n+1))`, where `n`  is the exponent, `mn` is the minimum, and `mx` is the maximum.  [Reference](http://mathworld.wolfram.com/RandomNumber.html).
- **Skellam distribution**: `Poisson(mean1) - Poisson(mean2)`, where `mean1` and `mean2` are the means of the two Poisson variables.
- **Skewed normal distribution**: `Normal(0, x) + mu + alpha * abs(Normal(0, x))`, where `x` is `sigma / sqrt(alpha * alpha + 1.0)`, `mu` and `sigma` have
the same meaning as in the normal distribution, and `alpha` is a shape parameter.
- **Snedecor's (Fisher's) _F_-distribution**: `GammaDist(m * 0.5) * n / (GammaDist(n * 0.5 + Poisson(sms * 0.5)) * m)`, where `m` and `n` are the numbers of degrees of freedom of two random numbers with a chi-squared distribution, and if `sms` is other than 0, one of those distributions is _noncentral_ with sum of mean squares equal to `sms`.
- **Zeta distribution**: Generate `n = floor(pow(RNDU01ZeroOneExc(), -1.0 / r))`, and if `d / pow(2, r) < (d - 1) * RNDU01OneExc() * n / (pow(2, r) - 1.0)`, where `d = pow((1.0 / n) + 1, r)`, repeat this process. The parameter `r` is greater than 0. Based on method described in Devroye 1986. A zeta distribution [truncated](#Truncation_and_Censoring) by rejecting random values greater than some positive integer is called a _Zipf distribution_ or _Estoup distribution_. (Note that Devroye uses "Zipf distribution" to refer to the untruncated zeta distribution.)

<a id=Geometric_Sampling></a>
## Geometric Sampling

This section contains various geometric sampling techniques.

<a id=Random_Point_Inside_a_Triangle></a>
### Random Point Inside a Triangle

The following pseudocode, which
generates, uniformly at random, a point inside a 2-dimensional triangle,
takes three parameters, `p0`, `p1`, and `p2`, each of which is a 2-item list containing the X and Y
coordinates, respectively, of one vertex of the triangle.

        METHOD RandomPointInTriangle(
                x1=p1[0]-p0[0]
                y1=p1[1]-p0[1]
                x2=p2[0]-p0[0]
                y2=p2[1]-p0[1]
                den=(x1*y2-x2*y1)
                // Avoid division by zero
                if den==0: den=0.0000001
                r=RNDU01()
                s=RNDU01()
                xv=r*x1 + s*x2
                yv=r*y1 + s*y2
                a=(xv*y2 - x2*yv)/den
                b=(x1*yv - xv*y1)/den
                if a<=0 or b<=0 or a+b>=1
                        return [x1+x2+p0[0]-xv,y1+y2+p0[1]-yv]
                else
                        return [p0[0]+xv, p0[1]+yv]
                end
        end

<a id=Random_Points_on_the_Surface_of_a_Hypersphere></a>
### Random Points on the Surface of a Hypersphere

To generate, uniformly at random, an N-dimensional point on the surface of an N-dimensional hypersphere of radius R, generate N `Normal(0, 1)` random numbers, then multiply them by `R / X`, where `X` is those numbers' [_norm_](#Notation_and_Definitions) (if `X` is 0, the process should repeat). A hypersphere's surface is formed by all points lying R units away from a common point in N-dimensional space. Based on a technique described in [MathWorld](http://mathworld.wolfram.com/HyperspherePointPicking.html).

This problem is equivalent to generating, uniformly at random, a unit vector (vector with length 1) in N-dimensional space.

<a id=Random_Points_Inside_a_Ball_or_Shell></a>
### Random Points Inside a Ball or Shell

To generate, uniformly at random, an N-dimensional point inside an N-dimensional ball of radius R, either&mdash;

- generate N `Normal(0, 1)` random numbers, generate `X = sqrt( S - ln(RNDU01ZeroExc()))`, where `S` is the sum of squares of the random numbers, and multiply each random number by `R / X` (if `X` is 0, the process should repeat), or
- generate N `RNDNUMRANGE(-R, R)` random numbers<sup>[(13)](#Note13)</sup> until their [_norm_](#Notation_and_Definitions) is R or less,

although the former method "may ... be slower" "in practice", according to a [MathWorld article](http://mathworld.wolfram.com/BallPointPicking.html), which was the inspiration for the two methods given here.

To generate, uniformly at random, a point inside an N-dimensional spherical shell (a hollow ball) with inner radius A and outer radius B (where A is less than B), either&mdash;
- generate, uniformly at random, a point for a ball of radius B until the [_norm_](#Notation_and_Definitions) of the numbers making up that point is A or greater;
- for 2 dimensions, generate, uniformly at random, a point on the surface of a circle with radius equal to `sqrt(RNDNUMRANGE(0, B * B - A * A) + A * A)` (Dupree and Fraley 2004); or
- for 3 dimensions, generate, uniformly at random, a point on the surface of a sphere with radius equal to `pow(RNDNUMRANGE(0, pow(B, 3) - pow(A, 3)) + pow(A, 3), 1.0 / 3.0)` (Dupree and Fraley 2004).

<a id=Random_Latitude_and_Longitude></a>
### Random Latitude and Longitude

To generate, uniformly at random, a point on the surface of a sphere in the form of a latitude and longitude (in radians with west and south coordinates negative)&mdash;

- generate the longitude `RNDNUMEXCRANGE(-pi, pi)`, where the longitude ranges from -&pi; to &pi;, and
- generate the latitude `atan2(sqrt(1 - x * x), x) - pi / 2`, where&mdash;
    - `x = RNDNUMRANGE(-1, 1)` and the latitude ranges from -&pi;/2 to &pi;/2 (the range includes the poles, which have many equivalent forms), or
    - `x = 2 * RNDU01ZeroOneExc() - 1` and the latitude ranges from -&pi;/2 to &pi;/2 (the range excludes the poles).

Reference: ["Sphere Point Picking"](http://mathworld.wolfram.com/SpherePointPicking.html) in MathWorld (replacing inverse cosine with `atan2` equivalent).

<a id=Conclusion></a>
## Conclusion

This page discussed many ways applications can extract random numbers
from random number generators.

Feel free to send comments. They may help improve this page.  In particular, corrections to any method given on this page are welcome.

I acknowledge the commenters to the CodeProject version of this page, including George Swan, who referred me to the reservoir sampling method.

Currently, the following are not covered in this document, but may be added based on reader interest:

- Techniques to generate random mazes, graphs, matrices, or paths.
- Brownian motion and other random movement and stochastic processes.

<a id=Notes></a>
## Notes

<small>

<small><small><small><small><sup id=Note1>(1)</sup> This definition includes RNGs that&mdash;
- seek to generate random numbers that are at least cost-prohibitive (but not necessarily _impossible_) to predict,
- merely seek to generate number sequences likely to pass statistical tests of randomness,
- are initialized automatically before use,
- are initialized with an application-specified "seed",
- use a deterministic algorithm for random number generation,
- rely, at least primarily, on one or more nondeterministic sources for random number
   generation (including by extracting uniformly distributed bits from two or more such sources), or
- have two or more of the foregoing properties.

If a number generator uses a nonuniform distribution, but otherwise meets this definition, then it can be converted to one with a uniform distribution, at least in theory, by applying the nonuniform distribution's [_cumulative distribution function_](https://en.wikipedia.org/wiki/Cumulative_distribution_function) (CDF) to each generated number (see also "[Random Numbers from an Arbitrary Distribution](#Random_Numbers_from_an_Arbitrary_Distribution)").  Further details on this kind of conversion, as well a list of CDFs, are outside the scope of this document.</small>

<small><sup id=Note2>(2)</sup> For an exercise solved by this method, see A. Koenig and B. E. Moo, _Accelerated C++_, 2000; see also a [blog post by Johnny Chan](http://mathalope.co.uk/2014/10/26/accelerated-c-solution-to-exercise-7-9/).

Note that if `MODULUS` is a power of 2 (for example, 256 or 2<sup>32</sup>), the `RNDINT` implementation given may leave unused bits (for example, when truncating a random number to `wordBits` bits or in the special cases at the start of the method).  How a more sophisticated implementation may save those bits for later reuse is beyond this page's scope.</small>

<small><sup id=Note3>(3)</sup> This number format describes B-bit signed integers with minimum value -2<sup>B-1</sup> and maximum value 2<sup>B-1</sup> - 1, where B is a positive even number of bits; examples include Java's `short`, `int`, and `long`, with 16, 32, and 64 bits, respectively. A _signed integer_ is an integer that can be positive, zero, or negative. In _two's-complement form_, nonnegative numbers have the highest (most significant) bit set to zero, and negative numbers have that bit (and all bits beyond) set to one, and a negative number is stored in such form by decreasing its absolute value by 1 and swapping the bits of the resulting number.</small>

<small><sup id=Note4>(4)</sup> `RNDINTEXC` is not given as the core random generation method because it's harder to fill integers in popular integer formats with random bits with this method.</small>

<small><sup id=Note5>(5)</sup> In situations where loops are not possible, such as within an SQL query, the idiom `min(floor(RNDU01OneExc() * maxExclusive, maxExclusive - 1))`, where `min(a,b)` is the smaller of `a` and `b`, returns an integer in the interval \[0, `maxExclusive`\); however, such an idiom can have a slight, but for most purposes negligible, bias toward `maxExclusive - 1`.</small>

<small><sup id=Note6>(6)</sup> It suffices to say here that in general, whenever a deterministic RNG is otherwise called for, such an RNG is good enough for shuffling a 52-item list if its period is 2<sup>226</sup> or greater. (The _period_ is the maximum number of values in a generated sequence for a deterministic RNG before that sequence repeats.)</small>

<small><sup id=Note7>(7)</sup> Such techniques usually involve [_Markov chains_](https://en.wikipedia.org/wiki/Markov_chain), which are outside this page's scope.</small>

<small><sup id=Note8>(8)</sup> A third kind of randomized "jitter" (for multi-component data points) consists of a point generated from a [multivariate normal distribution](https://en.wikipedia.org/wiki/Multivariate_normal_distribution) with all the means equal to 0 and a _covariance matrix_ that, in this context, serves as a _bandwidth matrix_. The second kind of "jitter" given here is an easy special case of the multivariate normal distribution, where the _bandwidth_ corresponds to a bandwidth matrix with diagonal elements equal to _bandwidth_-squared and with zeros everywhere else.</small>

<small><sup id=Note9>(9)</sup> More formally&mdash;
- the PDF is the derivative (instantaneous rate of change) of the distribution's CDF (that is, PDF(x) = CDF&prime;(x)), and
- the CDF is also defined as the _integral_ of the PDF,

provided the PDF's values are all 0 or greater and the area under the PDF's curve is 1.</small>

<small><sup id=Note10>(10)</sup> A convex polygon can be trivially decomposed into triangles that have one vertex in common and each have two other adjacent vertices of the original polygon. Triangulation of other polygons is nontrivial and outside the scope of this document.</small>

<small><sup id=Note11>(11)</sup> The "Dice" section used the following sources:

- Red Blob Games, ["Probability and Games: Dice Rolls"](http://www.redblobgames.com/articles/probability/damage-rolls.html) was the main source for the dice-roll distribution.  The method `random(N)` in that document corresponds to `RNDINTEXC(N)` in this document.
- The [MathWorld article "Dice"](http://mathworld.wolfram.com/Dice.html) provided the mean of the dice roll distribution.
- S. Eger, "Stirling's approximation for central extended binomial coefficients", 2014, helped suggest the variance of the dice roll distribution.</small>

<small><sup id=Note12>(12)</sup> The method that formerly appeared here is the _Box-Muller transformation_: `mu + radius * cos(angle)` and `mu + radius * sin(angle)`, where `angle = 2 * pi * RNDU01OneExc()` and `radius = sqrt(-2 * ln(RNDU01ZeroExc())) * sigma`, are two independent normally-distributed random numbers.  A method of generating approximate standard normal random numbers, which consists of summing twelve `RNDU01OneExc()`  numbers and subtracting by 6 (see also ["Irwin&ndash;Hall distribution" on Wikipedia](https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution)), results in values not less than -6 or greater than 6; on the other hand, in a standard normal distribution, results less than -6 or greater than 6 will occur only with a generally negligible probability.</small>

<small><sup id=Note13>(13)</sup> The N numbers generated this way will form a point inside an N-dimensional _hypercube_ with length `2 * R` in each dimension and centered at the origin of space.</small>

<a id=License></a>
## License

This page is licensed under [Creative Commons Zero](https://creativecommons.org/publicdomain/zero/1.0/).
