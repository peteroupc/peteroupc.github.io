# Random Number Generation and Sampling Methods

[**Peter Occil**](mailto:poccil14@gmail.com)

Discusses many ways applications can do random number generation and sampling from an underlying RNG and includes pseudocode for many of them.

<a id=Introduction></a>
## Introduction

This page discusses many ways applications can generate and sample random content using an underlying random number generator (RNG), often with pseudocode. Those methods include&mdash;
- ways to generate uniform random numbers from an underlying RNG (such as the [**core method, `RNDINT(N)`**](#Core_Random_Generation_Method)),
- ways to generate randomized content and conditions, such as [**true/false conditions**](#Boolean_True_False_Conditions), [**shuffling**](#Shuffling), and [**sampling unique items from a list**](#Sampling_Without_Replacement_Choosing_Several_Unique_Items), and
- generating non-uniform random numbers, including [**weighted choice**](#Weighted_Choice), the [**normal distribution**](#Normal_Gaussian_Distribution), and [**other probability distributions**](#Index_of_Non_Uniform_Distributions).

[**Sample Python code**](https://peteroupc.github.io/randomgen.zip) that implements many of the methods in this document is available.

All the random number methods presented on this page are ultimately based on an underlying RNG; however, the methods make no assumptions on that RNG's implementation (e.g., whether that RNG uses only its input and its state to produce numbers) or on that RNG's statistical quality or predictability.

**In general, this document does not cover:**

- How to choose an underlying RNG for a particular application, including in terms of security, performance, and quality.  I have written more on RNG recommendations in [**another document**](https://peteroupc.github.io/random.html).
- Randomness extraction (also known as _unbiasing_, _deskewing_, or _whitening_), such as [**hash functions**](https://peteroupc.github.io/random.html#Hash_Functions) and von Neumann unbiasing.
- How to generate random security parameters such as encryption keys.

<a id=About_This_Document></a>
### About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/randomfunc.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/randomfunc.md)**.  You can send comments on this document either on** [**CodeProject**](https://www.codeproject.com/Articles/1190459/Random-Number-Generation-and-Sampling-Methods) **or on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues)**.**

**Comments on any aspect of this document are welcome, but especially comments on the following:**

- Corrections to any method given on this page.
- Should this page include additional probability distributions?  If so, which ones?
- Should this page discuss approaches to generate random graphs or matrices?  If so, how?
- Ways to implement any of the randomization methods given in "[**Randomization with Real Numbers**](https://peteroupc.github.io/randomfunc.html#Randomization_with_Real_Numbers)" without rounding errors.
- Methods to sample a random number from a distribution exactly, with arbitrary precision and using only a source of random bits.
- Integer-quantized numbers are seeing increased use today, especially in "deep-learning" neural networks.  What are ways to generate non-uniform integer-quantized numbers (especially 8-bit or smaller numbers)?

<a id=Contents></a>
## Contents

- [**Introduction**](#Introduction)
    - [**About This Document**](#About_This_Document)
- [**Contents**](#Contents)
- [**Notation and Definitions**](#Notation_and_Definitions)
- [**Uniform Random Integers**](#Uniform_Random_Integers)
    - [`RNDINT`: Random Integers in \[0, N\]](#RNDINT_Random_Integers_in_0_N)
    - [`RNDINTRANGE`: Random Integers in \[N, M\]](#RNDINTRANGE_Random_Integers_in_N_M)
    - [**`RNDINTEXC`: Random Integers in \[0, N)**](#RNDINTEXC_Random_Integers_in_0_N)
    - [**`RNDINTEXCRANGE`: Random Integers in \[N, M)**](#RNDINTEXCRANGE_Random_Integers_in_N_M)
    - [**Uniform Random Bits**](#Uniform_Random_Bits)
    - [**Certain Programming Environments**](#Certain_Programming_Environments)
    - [**Examples of Using the `RNDINT` Family**](#Examples_of_Using_the_RNDINT_Family)
- [**Randomization Techniques**](#Randomization_Techniques)
    - [**Boolean (True/False) Conditions**](#Boolean_True_False_Conditions)
    - [**Random Sampling**](#Random_Sampling)
        - [**Sampling With Replacement: Choosing a Random Item from a List**](#Sampling_With_Replacement_Choosing_a_Random_Item_from_a_List)
        - [**Sampling Without Replacement: Choosing Several Unique Items**](#Sampling_Without_Replacement_Choosing_Several_Unique_Items)
        - [**Shuffling**](#Shuffling)
        - [**Random Character Strings**](#Random_Character_Strings)
        - [**Pseudocode for Random Sampling**](#Pseudocode_for_Random_Sampling)
    - [**Rejection Sampling**](#Rejection_Sampling)
    - [**Random Walks**](#Random_Walks)
    - [**Random Dates and Times**](#Random_Dates_and_Times)
    - [**Randomization in Statistical Testing**](#Randomization_in_Statistical_Testing)
    - [**A Note on Sorting Random Numbers**](#A_Note_on_Sorting_Random_Numbers)
- [**General Non-Uniform Distributions**](#General_Non_Uniform_Distributions)
    - [**Weighted Choice**](#Weighted_Choice)
        - [**Weighted Choice With Replacement**](#Weighted_Choice_With_Replacement)
        - [**Weighted Choice Without Replacement (Multiple Copies)**](#Weighted_Choice_Without_Replacement_Multiple_Copies)
        - [**Weighted Choice Without Replacement (Single Copies)**](#Weighted_Choice_Without_Replacement_Single_Copies)
        - [**Weighted Choice Without Replacement (List of Unknown Size)**](#Weighted_Choice_Without_Replacement_List_of_Unknown_Size)
        - [**Priority Sampling**](#Priority_Sampling)
    - [**Mixtures of Distributions**](#Mixtures_of_Distributions)
    - [**Transformations of Random Numbers**](#Transformations_of_Random_Numbers)
- [**Specific Non-Uniform Distributions**](#Specific_Non_Uniform_Distributions)
    - [**Dice**](#Dice)
    - [**Binomial Distribution**](#Binomial_Distribution)
    - [**Negative Binomial Distribution**](#Negative_Binomial_Distribution)
    - [**Geometric Distribution**](#Geometric_Distribution)
    - [**Exponential Distribution**](#Exponential_Distribution)
    - [**Poisson Distribution**](#Poisson_Distribution)
    - [**Hypergeometric Distribution**](#Hypergeometric_Distribution)
    - [**Random Integers with a Given Positive Sum**](#Random_Integers_with_a_Given_Positive_Sum)
    - [**Multinomial Distribution**](#Multinomial_Distribution)
- [**Randomization with Real Numbers**](#Randomization_with_Real_Numbers)
    - [**Uniform Random Real Numbers**](#Uniform_Random_Real_Numbers)
        - [**For Fixed-Point Number Formats**](#For_Fixed_Point_Number_Formats)
        - [**For Rational Number Formats**](#For_Rational_Number_Formats)
        - [**For Floating-Point Number Formats**](#For_Floating_Point_Number_Formats)
        - [**Uniform Numbers As Their Digit Expansions**](#Uniform_Numbers_As_Their_Digit_Expansions)
    - [**Monte Carlo Sampling: Expected Values, Integration, and Optimization**](#Monte_Carlo_Sampling_Expected_Values_Integration_and_Optimization)
    - [**Low-Discrepancy Sequences**](#Low_Discrepancy_Sequences)
    - [**Weighted Choice Involving Real Numbers**](#Weighted_Choice_Involving_Real_Numbers)
        - [**Continuous Weighted Choice**](#Continuous_Weighted_Choice)
    - [**Additional Examples Involving Real Numbers**](#Additional_Examples_Involving_Real_Numbers)
        - [**Probabilities As Their Digit Expansions**](#Probabilities_As_Their_Digit_Expansions)
        - [**Random Walks (Real Numbers)**](#Random_Walks_Real_Numbers)
        - [**Mixtures (Real Numbers)**](#Mixtures_Real_Numbers)
        - [**Transformations of Random Numbers (Real Numbers)**](#Transformations_of_Random_Numbers_Real_Numbers)
    - [**Random Numbers from a Distribution of Data Points**](#Random_Numbers_from_a_Distribution_of_Data_Points)
    - [**Random Numbers from an Arbitrary Distribution**](#Random_Numbers_from_an_Arbitrary_Distribution)
        - [**Approximate Sampling for Discrete Distributions**](#Approximate_Sampling_for_Discrete_Distributions)
        - [**Inverse Transform Sampling**](#Inverse_Transform_Sampling)
        - [**Rejection Sampling with a PDF**](#Rejection_Sampling_with_a_PDF)
        - [**Markov-Chain Monte Carlo**](#Markov_Chain_Monte_Carlo)
    - [**Specific Distributions**](#Specific_Distributions)
        - [**Normal (Gaussian) Distribution**](#Normal_Gaussian_Distribution)
        - [**Gamma Distribution**](#Gamma_Distribution)
        - [**Beta Distribution**](#Beta_Distribution)
        - [**Poisson Distribution: Optimization for Large Mean**](#Poisson_Distribution_Optimization_for_Large_Mean)
        - [**von Mises Distribution**](#von_Mises_Distribution)
        - [**Stable Distribution**](#Stable_Distribution)
        - [**Multivariate Normal (Multinormal) Distribution**](#Multivariate_Normal_Multinormal_Distribution)
        - [**Random Real Numbers with a Given Positive Sum**](#Random_Real_Numbers_with_a_Given_Positive_Sum)
        - [**Gaussian and Other Copulas**](#Gaussian_and_Other_Copulas)
    - [**Index of Non-Uniform Distributions**](#Index_of_Non_Uniform_Distributions)
    - [**Geometric Sampling**](#Geometric_Sampling)
        - [**Random Points Inside a Box**](#Random_Points_Inside_a_Box)
        - [**Random Points Inside a Simplex**](#Random_Points_Inside_a_Simplex)
        - [**Random Points on the Surface of a Hypersphere**](#Random_Points_on_the_Surface_of_a_Hypersphere)
        - [**Random Points Inside a Ball, Shell, or Cone**](#Random_Points_Inside_a_Ball_Shell_or_Cone)
        - [**Random Latitude and Longitude**](#Random_Latitude_and_Longitude)
- [**Acknowledgments**](#Acknowledgments)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Implementation of `erf`**](#Implementation_of_erf)
    - [**Mean and Variance Calculation**](#Mean_and_Variance_Calculation)
    - [**Norm Calculation**](#Norm_Calculation)
    - [**Multithreading Note**](#Multithreading_Note)
    - [**Security Considerations**](#Security_Considerations)
- [**License**](#License)

<a id=Notation_and_Definitions></a>
## Notation and Definitions

In this document, a **random number generator (RNG)** means software and/or hardware that seeks to generate numbers with the property that each possible outcome is as likely as any other without influence by anything else<sup>[**(1)**](#Note1)</sup>.

The [**pseudocode conventions**](https://peteroupc.github.io/pseudocode.html) apply to this document.

This document uses the following notation for intervals:

- [`a`, `b`) means "`a` or greater, but less than `b`".
- (`a`, `b`) means "greater than `a`, but less than `b`".
- (`a`, `b`] means "greater than `a` and less than or equal to `b`".
- [`a`, `b`] means "`a` or greater and `b` or less".

In this document, `log1p(x)` is equivalent to `ln(1 + x)` and is a robust alternative where `x` is a floating-point number (Pedersen 2018)<sup>[**(2)**](#Note2)</sup>.

<a id=Uniform_Random_Integers></a>
## Uniform Random Integers

This section describes how an underlying RNG can be used to generate independent uniform random integers.  This section describes four methods: `RNDINT`, `RNDINTEXC`, `RNDINTRANGE`, `RNDINTEXCRANGE`.  Of these, `RNDINT`, described next, can serve as the basis for the remaining methods.

<a id=RNDINT_Random_Integers_in_0_N></a>
### `RNDINT`: Random Integers in [0, N]

In this document, **`RNDINT(maxInclusive)`** is the core method for using an underlying RNG to generate independent uniform random integers **in the interval [0, `maxInclusive`]**.<sup>[**(3)**](#Note3)</sup>.  The following are some ways to implement `RNDINT`:

1. [**_Rejection sampling_**](#Rejection_Sampling), which roughly means: sample in a bigger range until a sampled number fits the smaller range.  This method is _unbiased_ but has a _variable running time_.
2. Reduction method.  Generate `bignumber`, an N-bit random integer with many more bits than `maxInclusive + 1` has, then find&mdash;
    - `rem(bignumber, maxInclusive + 1)` (modulo reduction), or
    - `(bignumber * (maxInclusive + 1)) >> N` (see (Lemire 2016)<sup>[**(4)**](#Note4)</sup>).

    Either method's running time is theoretically constant, but can introduce a so-called _modulo bias_ (some numbers are slightly more likely to be chosen than others), which, however, gets smaller the more bits `bignumber` has.

The pseudocode below implements `RNDINT` and, depending on the case, uses rejection sampling or the "fast dice roller" method (Lumbroso 2013)<sup>[**(5)**](#Note5)</sup>.  In the pseudocode:

| If the underlying RNG produces: | Then `RNG()` is: | And `MODULUS` is: |
 --------- | ------ | ------ |
| Integers in the interval \[0, _n_\). | The underlying RNG. | _n_. |
| Numbers in the interval \[0, 1\) known to be evenly spaced by a number _p_ (e.g., dSFMT). | The underlying RNG, except with its outputs multiplied by _p_. | 1/_p_. |
| Numbers in the interval \[0, 1\), where numbers in \[0, 0.5\) and those in \[0.5, 1\) are known to occur with equal probability (e.g., Java's `Math.random()`). | An RNG that outputs 0 if the underlying RNG outputs a number less than 0.5, or 1 otherwise. | 2. |
| Numbers not specified above. | A new RNG formed by writing the underlying RNG's outputs to a stream of memory units (such as 8-bit bytes) and using a _randomness extraction_ technique to transform that stream to _n_-bit integers. | 2<sup>_n_</sup>. |

    METHOD RndIntHelperNonPowerOfTwo(maxInclusive)
      if maxInclusive <= MODULUS - 1:
        // NOTE: If the programming language implements
        // division with two integers by discarding the result's
        // fractional part, the division can be used as is without
        // using a "floor" function.
        nPlusOne = maxInclusive + 1
        maxexc = floor((MODULUS - 1) / nPlusOne) * nPlusOne
        while true
          ret = RNG()
          if ret < nPlusOne: return ret
          if ret < maxexc: return rem(ret, nPlusOne)
        end
      else
        cx = floor(maxInclusive / MODULUS) + 1
        while true
           ret = cx * RNG()
           // NOTE: The addition operation below should
           // check for integer overflow and should reject the
           // number if overflow would result.
           ret = ret + RNDINT(cx - 1)
           if ret <= maxInclusive: return ret
        end
      end
    END METHOD

    METHOD RndIntHelperPowerOfTwo(maxInclusive)
      // NOTE: Finds the number of bits minus 1 needed
      // to represent MODULUS (in other words, the number
      // of random bits returned by RNG() ). This will
      // be a constant here, though.
      modBits = ln(MODULUS)/ln(2)
      // Fast dice roller algorithm.
      x = 1
      y = 0
      nextBit = modBits
      rngv = 0
      while true
        if nextBit >= modBits
          nextBit = 0
          rngv = RNG()
        end
        x = x * 2
        y = y * 2 + rem(rngv, 2)
        rngv = floor(rngv / 2)
        nextBit = nextBit + 1
        if x > maxInclusive
          if y <= maxInclusive: return y
          x = x - maxInclusive - 1
          y = y - maxInclusive - 1
        end
      end
    END METHOD

    METHOD RNDINT(maxInclusive)
      // maxInclusive must be 0 or greater
      if maxInclusive < 0: return error
      if maxInclusive == 0: return 0
      if maxInclusive == MODULUS - 1: return RNG()
      // NOTE: Finds the number of bits minus 1 needed
      // to represent MODULUS (if it's a power of 2).
      // This will be a constant here, though.  If modBits
      // is an integer, MODULUS is a power of 2, which
      // is checked below.
      modBits=ln(MODULUS)/ln(2)
      if floor(modBits) == modBits
        return RndIntHelperPowerOfTwo(maxInclusive)
      else
        return RndIntHelperNonPowerOfTwo(maxInclusive)
      end
    END METHOD

> **Note:** Most RNG designs in common use maintain an internal state and update that state each time a random number is generated.  But for [**_stateless_ RNG designs**](https://peteroupc.github.io/random.html#Designs_for_PRNGs) (including so-called "splittable" RNGs), `RNDINT()`, `RNG()`, and other random sampling methods might have to be adjusted accordingly.
>

<a id=RNDINTRANGE_Random_Integers_in_N_M></a>
### `RNDINTRANGE`: Random Integers in [N, M]

The na&iuml;ve way of generating a **random integer in the interval [`minInclusive`, `maxInclusive`]**, shown below, works well for nonnegative integers and arbitrary-precision integers.

     METHOD RNDINTRANGE(minInclusive, maxInclusive)
       // minInclusive must not be greater than maxInclusive
       if minInclusive > maxInclusive: return error
       return minInclusive + RNDINT(maxInclusive - minInclusive)
     END METHOD

The na&iuml;ve approach won't work as well, though, if the integer format can express negative and nonnegative integers and the difference between `maxInclusive` and `minInclusive` exceeds the highest possible integer for the format.  For integer formats that can express&mdash;

1. every integer in the interval \[-1 - `MAXINT`, `MAXINT`\] (e.g., Java `int`, `short`, or `long`), or
2. every integer in the interval \[-`MAXINT`, `MAXINT`\] (e.g., Java `float` and `double` and .NET's implementation of `System.Decimal`),

where `MAXINT` is an integer greater than 0, the following pseudocode for `RNDINTRANGE` can be used.

    METHOD RNDINTRANGE(minInclusive, maxInclusive)
       // minInclusive must not be greater than maxInclusive
       if minInclusive > maxInclusive: return error
       if minInclusive == maxInclusive: return minInclusive
       if minInclusive==0: return RNDINT(maxInclusive)
       // Difference does not exceed maxInclusive
       if minInclusive > 0 or minInclusive + MAXINT >= maxInclusive
           return minInclusive + RNDINT(maxInclusive - minInclusive)
       end
       while true
         ret = RNDINT(MAXINT)
         // NOTE: For case 1, use the following line:
         if RNDINT(1) == 0: ret = -1 - ret
         // NOTE: For case 2, use the following three lines
         // instead of the preceding line; these lines
         // avoid negative zero
         // negative = RNDINT(1) == 0
         // if negative: ret = 0 - ret
         // if negative and ret == 0: continue
         if ret >= minInclusive and ret <= maxInclusive: return ret
       end
    END METHOD

<a id=RNDINTEXC_Random_Integers_in_0_N></a>
### `RNDINTEXC`: Random Integers in [0, N)

`RNDINTEXC(maxExclusive)`, which generates a **random integer in the interval** **\[0, `maxExclusive`\)**, can be implemented as follows<sup>[**(6)**](#Note6)</sup>:

     METHOD RNDINTEXC(maxExclusive)
        if maxExclusive <= 0: return error
        return RNDINT(maxExclusive - 1)
     END METHOD

> **Note:** `RNDINTEXC` is not given as the core random generation method because it's harder to fill integers in popular integer formats with random bits with this method.

<a id=RNDINTEXCRANGE_Random_Integers_in_N_M></a>
### `RNDINTEXCRANGE`: Random Integers in [N, M)

**`RNDINTEXCRANGE`** returns a **random integer in the interval** **\[`minInclusive`, `maxExclusive`\)**.  It can be implemented using [**`RNDINTRANGE`**](#RNDINTRANGE_Random_Integers_in_N_M), as the following pseudocode demonstrates.

    METHOD RNDINTEXCRANGE(minInclusive, maxExclusive)
       if minInclusive >= maxExclusive: return error
       if minInclusive >=0
         return RNDINTRANGE(minInclusive, maxExclusive - 1)
       end
       while true
         ret = RNDINTRANGE(minInclusive, maxExclusive)
         if ret < maxExclusive: return ret
       end
    END METHOD

<a id=Uniform_Random_Bits></a>
### Uniform Random Bits

The idiom `RNDINT((1 << b) - 1)` is a na&iuml;ve way of generating a **uniform random `b`-bit integer** (with maximum 2<sup>`b`</sup> - 1).

In practice, memory is usually divided into _bytes_, or 8-bit integers in the interval [0, 255].  In this case, a block of memory can be filled with random bits&mdash;

- by setting each byte in the block to `RNDINT(255)`, or
- via an RNG that outputs one or more 8-bit chunks at a time.

<a id=Certain_Programming_Environments></a>
### Certain Programming Environments

For certain programming environments, there are special considerations:

- Shell scripts and Microsoft Windows batch files are designed for running other programs, rather than general-purpose programming.  However, batch files and `bash` (a shell script interpreter) might support a variable which returns a random integer in the interval \[0, 32767\] (called `%RANDOM%` or `$RANDOM`, respectively); neither variable is designed for information security.
- Query languages such as SQL have no procedural elements such as loops and branches.  Moreover, standard SQL does not include an RNG in its suite of functionality, but popular SQL dialects often do &mdash; with idiosyncratic behavior.<sup>[**(7)**](#Note7)</sup>

Whenever possible, the methods in this document should be implemented in a more general-purpose programming language than query languages, shell scripts, and batch files, especially if information security is a goal.

<a id=Examples_of_Using_the_RNDINT_Family></a>
### Examples of Using the `RNDINT` Family

1. To generate a random number that's either -1 or 1, one of the following idioms can be used: `(RNDINT(1) * 2 - 1)` or `(RNDINTEXC(2) * 2 - 1)`.
2. To generate a random integer that's divisible by a positive integer (`DIV`), generate the integer with any method (such as `RNDINT`), let `X` be that integer, then generate `X - rem(X, DIV)` if `X >= 0`, or `X - (DIV - rem(abs(X), DIV))` otherwise. (Depending on the method, the resulting integer may be out of range, in which case this procedure is to be repeated.)
3. A random 2-dimensional point on an NxM grid can be expressed as a single integer as follows:
      - To generate a random NxM point `P`, generate `P = RNDINT(N * M - 1)` (`P` is thus in the interval [0, `N * M`)).
      - To convert a point `P` to its 2D coordinates, generate `[rem(P, N), floor(P / N)]`. (Each coordinate starts at 0.)
      - To convert 2D coordinates `coord` to an NxM point, generate `P = coord[1] * N + coord[0]`.
4. To simulate rolling an N-sided die (N greater than 1), generate a random number in the interval \[1, N\] by `RNDINTRANGE(1, N)`.
5. To generate a random integer with one base-10 digit, generate `RNDINTRANGE(0, 9)`.
6. To generate a random integer with N base-10 digits (where N is 2 or greater), where the first digit can't be 0, generate `RNDINTRANGE(pow(10, N-1), pow(10, N) - 1)`.
7. To generate a random number in the interval [`mn`, `mx`) in increments equal to `step`: `mn+step*RNDINTEXC(ceil((mx-mn)/(1.0*step)))`.
8. To generate a random integer in the interval [0, `X`):
     - And favor numbers in the middle:  `floor((RNDINTEXC(X) + RNDINTEXC(X)) / 2)`.
     - And strongly favor low numbers:  `floor(RNDINTEXC(X) * RNDINTEXC(X) / X)`.
     - And strongly favor high numbers:  `X - 1 - floor(RNDINTEXC(X) * RNDINTEXC(X) / X)`.

<a id=Randomization_Techniques></a>
## Randomization Techniques

This section describes commonly used randomization techniques, such as shuffling, selection of several unique items, and creating random strings of text.

<a id=Boolean_True_False_Conditions></a>
### Boolean (True/False) Conditions

To generate a condition that is true at the specified probabilities, use
the following idioms in an `if` condition:

- True or false with equal probability: `RNDINT(1) == 0`.
- True with X percent probability: `RNDINTEXC(100) < X`.
- True with probability X/Y (a _Bernoulli trial_): `RNDINTEXC(Y) < X`.
- True with odds of X to Y: `RNDINTEXC(X + Y) < X`.

> **Examples:**
> - True with probability 3/8: `RNDINTEXC(8) < 3`.
> - True with odds of 100 to 1: `RNDINTEXC(101) < 1`.
> - True with 20% probability: `RNDINTEXC(100) < 20`.

The following helper method generates 1 with probability `x`/`y` and 0 otherwise:

    METHOD ZeroOrOne(x,y)
      if RNDINTEXC(y)<x: return 1
      return 0
    END METHOD

The method can also be implemented in the following way (as pointed out by Lumbroso (2013, Appendix B)<sup>[**(5)**](#Note5)</sup>):

    // NOTE: Modified from Lumbroso
    // Appendix B to add 'z==0' and error checks
    METHOD ZeroOrOne(x,y)
      if y <= 0: return error
      z = x
      while true
        z = z * 2
        if z >= y
          if RNDINT(1) == 0: return 1
          z = z - y
        else if z == 0 or RNDINT(1) == 0: return 0
      end
    END METHOD

The following method generates 1 with probability `exp(-x/y)` and 0 otherwise (Canonne et al., 2020)<sup>[**(8)**](#Note8)</sup>:

    METHOD ZeroOrOneExpMinus(x, y)
      if y <= 0 or x<0: return error
      if x > y
        xf = floor(x/y)
        x = mod(x, y)
        if ZeroOrOneExpMinus(x, y) == 0: return 0
        for i in 1..xf
          if ZeroOrOneExpMinus(1,1) == 0: return 0
        end
        return 1
      end
      r = 1
      oy = y
      while true
        if ZeroOrOne(x, y) == 0: return r
        if r==1: r=0
        else: r=1
        y = y + oy
      end
    END METHOD

> **Note:** An algorithm that transforms "coin flips" biased one way into coin flips biased another way is called a _Bernoulli factory_ (Keane and O'Brien 1994)<sup>[**(9)**](#Note9)</sup> (Flajolet et al., 2010)<sup>[**(10)**](#Note10)</sup>.

<a id=Random_Sampling></a>
### Random Sampling

This section contains ways to choose one or more items from among a collection of them, where each item in the collection has the same chance to be chosen as any other.  This is called _random sampling_ and can be done _with replacement_ or _without replacement_.

<a id=Sampling_With_Replacement_Choosing_a_Random_Item_from_a_List></a>
#### Sampling With Replacement: Choosing a Random Item from a List

_Sampling with replacement_  essentially means taking a random item and putting it back.  To choose a random item from a list&mdash;

- whose size is known in advance, use the idiom `list[RNDINTEXC(size(list))]`; or
- whose size is not known in advance, generate `RandomKItemsFromFile(file, 1)`, in [**pseudocode given later**](#Pseudocode_for_Random_Sampling) (the result will be a 1-item list or be an empty list if there are no items).

<a id=Sampling_Without_Replacement_Choosing_Several_Unique_Items></a>
#### Sampling Without Replacement: Choosing Several Unique Items

_Sampling without replacement_  essentially means taking a random item _without_ putting it back.   There are several approaches for doing a uniform random choice of `k` unique items or values from among `n` available items or values, depending on such things as whether `n` is known and how big `n` and `k` are.

1. **If `n` is not known in advance:** Use the _reservoir sampling_ method; see the `RandomKItemsFromFile` method, in [**pseudocode given later**](#Pseudocode_for_Random_Sampling).
2. **If `n` is relatively small (for example, if there are 200 available items, or there is a range of numbers from 0 through 200 to choose from):**
    - If items have to be chosen from a list **in relative order**, or if `n` is 1, then use `RandomKItemsInOrder` (given later).
    - Otherwise, if the sampled items need not be in random order, and each item can be derived from its _index_ (the item's position as an integer starting at 0) without looking it up in a list: Use the `RandomKItemsFromFile` method.
    - Otherwise, the first three cases below will choose `k` items in random order:
        - Store all the items in a list, [**shuffle**](#Shuffling) that list, then choose the first `k` items from that list.
        - If the items are already stored in a list and the list's order can be changed, then shuffle that list and choose the first `k` items from the shuffled list.
        - If the items are already stored in a list and the list's order can't be changed, then store the indices to those items in another list, shuffle the latter list, then choose the first `k` indices (or the items corresponding to those indices) from the latter list.
        - If `k` is much smaller than `n`, proceed as in item 3 instead.
3. **If `k` is much smaller than `n`:**  The first three cases below will choose `k` items in random order:
    - **If the items are stored in a list whose order can be changed:** Do a _partial shuffle_ of that list, then choose the _last_ `k` items from that list.  A _partial shuffle_ proceeds as given in the section "[**Shuffling**](#Shuffling)", except the partial shuffle stops after `k` swaps have been made (where swapping one item with itself counts as a swap).
    - Otherwise, **if the items are stored in a list and `n` is not very large (for example, less than 5000):** Store the indices to those items in another list, do a _partial shuffle_ of the latter list, then choose the _last_ `k` indices (or the items corresponding to those indices) from the latter list.
    - Otherwise, **if `n` is not very large:** Store all the items in a list, do a _partial shuffle_ of that list, then choose the _last_ `k` items from that list.
    - Otherwise, see item 5.
4. **If `n - k` is much smaller than `n` and the sampled items need not be in random order:**  Proceed as in item 3, except the partial shuffle involves `n - k` swaps and the _first_ `k` items are chosen rather than the last `k`.
5. **Otherwise (for example, if 32-bit or larger integers will be chosen so that `n` is 2<sup>32</sup>, or if `n` is otherwise very large):** Create a data structure to store the indices to items already chosen.  When a new index to an item is randomly chosen, add it to the data structure if it's not already there, or if it is, choose a new random index.  Repeat this process until `k` indices were added to the data structure this way.  Examples of suitable data structures are&mdash;
    - a [**hash table**](https://en.wikipedia.org/wiki/Hash_table),
    - a compressed bit set (e.g, "roaring bitmap", EWAH), and
    - a self-sorting data structure such as a [**red&ndash;black tree**](https://en.wikipedia.org/wiki/Red%E2%80%93black_tree), if the random items are to be retrieved in sorted order or in index order.

    Many applications require generating unique random numbers to identify database records or other shared resources, among other reasons.  For ways to generate such numbers, see my [**RNG recommendation document**](https://peteroupc.github.io/random.html#Unique_Random_Identifiers).

<a id=Shuffling></a>
#### Shuffling

The [**Fisher&ndash;Yates shuffle method**](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle) shuffles a list (puts its items in a random order) such that all permutations (arrangements) of that list are equally likely to occur, assuming the RNG it uses can choose any one of those permutations.  However, that method is also easy to write incorrectly &mdash; see also (Atwood 2007)<sup>[**(11)**](#Note11)</sup>.  The following pseudocode is designed to shuffle a list's contents.

    METHOD Shuffle(list)
       // NOTE: Check size of the list early to prevent
       // `i` from being less than 0 if the list's size is 0 and
       // `i` is implemented using an nonnegative integer
       // type available in certain programming languages.
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

> **Notes: **
>
> 1. The choice of underlying RNG is important when it comes to shuffling; see my [**RNG recommendation document on shuffling**](https://peteroupc.github.io/random.html#Shuffling).
> 2. A shuffling algorithm that can be carried out in parallel is described in (Bacher et al., 2015)<sup>[**(12)**](#Note12)</sup>.

<a id=Random_Character_Strings></a>
#### Random Character Strings

To generate a random string of characters:

1. Generate a list of the letters, digits, and/or other characters the string can have.  Examples are given later in this section.
2. Build a new string whose characters are chosen at random from that character list.  The method, shown in the pseudocode below, demonstrates this. The method samples characters at random with replacement, and returns a list of the sampled characters. (How to convert this list to a text string depends on the programming language and is outside the scope of this page.) The method takes two parameters: `characterList` is the list from step 1, and `stringSize` is the number of random characters.

&nbsp;

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

The following are examples of character lists:

1. For an _alphanumeric string_, or string of letters and digits, the characters can be the basic digits "0" to "9" (U+0030-U+0039, nos. 48-57), the basic upper case letters "A" to "Z" (U+0041-U+005A, nos. 65-90), and the basic lower case letters "a" to "z" (U+0061-U+007A, nos. 96-122), as given in the Unicode Standard.
2. For a base-10 digit string, the characters can be the basic digits only.
3. For a base-16 digit (hexadecimal) string, the characters can be the basic digits as well as the basic letters "A" to "F" or "a" to "f" (not both).

> **Notes:**
>
> 1. If the list of characters is fixed, the list can be created in advance at runtime or compile time, or (if every character takes up the same number of code units) a string type as provided in the programming language can be used to store the list as a string.
> 2. **Unique random strings:** Often applications need to generate a string of characters that's not only random, but also unique.  This can be done by storing a list (such as a hash table) of strings already generated and checking newly generated strings against that list.<sup>[**(13)**](#Note13)</sup>
> 3. **Word generation:** This technique could also be used to generate "pronounceable" words, but this is less flexible than other approaches; see also "[**Weighted Choice With Replacement**](#Weighted_Choice_With_Replacement)".

<a id=Pseudocode_for_Random_Sampling></a>
#### Pseudocode for Random Sampling

The following pseudocode implements two methods:

1. `RandomKItemsFromFile` implements [**_reservoir sampling_**](https://en.wikipedia.org/wiki/Reservoir_sampling); it chooses up to `k` random items from a file of indefinite size (`file`). Although the pseudocode refers to files and lines, the technique applies to any situation when items are retrieved one at a time from a data set or list whose size is not known in advance.  See the comments to find out how `RandomKItemsFromFile` can be used to choose an item at random only if it meets certain criteria (see "[**Rejection Sampling**](#Rejection_Sampling)" for example criteria).
2. `RandomKItemsInOrder` returns a list of up to `k` random items from the given list (`list`), in the order in which they appeared in the list.  It is based on a technique presented in (Devroye 1986)<sup>[**(14)**](#Note14)</sup>, p. 620.

&nbsp;

    METHOD RandomKItemsFromFile(file, k)
      list = NewList()
      j = 0
      index = 0
      while true
        // Get the next line from the file
        item = GetNextLine(file)
        thisIndex = index
        index = index + 1
        // If the end of the file was reached, break
        if item == nothing: break
        // NOTE 1: The following line is OPTIONAL
        // and can be used to choose only random lines
        // in the file that meet certain criteria,
        // expressed as MEETS_CRITERIA below.
        // ------
        // if not MEETS_CRITERIA(item): continue
        // ------
        if j < k // phase 1 (fewer than k items)
          AddItem(list, item)
          // NOTE 2: To add the line number (starting at
          // 0) rather than the item, use the following
          // line instead of the previous one:
          // AddItem(list, thisIndex)
          j = j + 1
        else // phase 2
          j = RNDINT(thisIndex)
          if j < k: list[j] = item
          // NOTE 3: To add the line number (starting at
          // 0) rather than the item, use the following
          // line instead of the previous one:
          // if j < k: list[j] = thisIndex
        end
      end
      // NOTE 4: We shuffle at the end in case k or
      // fewer lines were in the file, since in that
      // case the items would appear in the same
      // order as they appeared in the file
      // if the list weren't shuffled.  This line
      // can be removed, however, if the items
      // in the returned list need not appear
      // in random order.
      if size(list)>=2: Shuffle(list)
      return list
    end

    METHOD RandomKItemsInOrder(list, k)
      n = size(list)
      // Special case if k is 1
      if k==1: return [list[RNDINTEXC(n)]]
      i = 0
      kk = k
      ret = NewList()
      while i < n and size(ret) < k
        u = RNDINTEXC(n - i)
        if u <= kk
          AddItem(ret, list[i])
          kk = kk - 1
        end
        i = i + 1
      end
      return ret
    END METHOD

> **Examples:**
>
> 1. Assume a file (`file`) has the lines `"f"`, `"o"`, `"o"`, `"d"`, in that order.  If we modify `RandomKItemsFromFile` as given in notes 2 and 3 there, and treat `MEETS_CRITERIA(item)` above as `item == "o"` (in note 1 of that method), then we can choose a random line number of an "o" line by `RandomKItemsFromFile(file, 1)`.
> 2. Removing `k` random items from a list of `n` items (`list`) is equivalent to generating a new
list by `RandomKItemsInOrder(list, n - k)`.
> 3. **Filtering:** If an application needs to sample the same list (with or without replacement) repeatedly, but only from among a selection of that list's items, it can create a list of items it wants to sample from (or a list of indices to those items), and sample from the new list instead.<sup>[**(15)**](#Note15)</sup>  This won't work well, though, for lists of indefinite or very large size.

<a id=Rejection_Sampling></a>
### Rejection Sampling

_Rejection sampling_ is a simple and flexible approach for generating random content that meets certain requirements.  To implement rejection sampling:

1. Generate the random content (such as a random number) by any method and with any distribution and range.
2. If the content doesn't meet predetermined criteria, go to step 1.

Example criteria include checking&mdash;
- whether a random number is not less than a minimum threshold (_left-truncation_),
- whether a random number is not greater than a maximum threshold (_right-truncation_),
- whether a random number is prime,
- whether a random number is divisible or not by certain numbers,
- whether a random number is not among recently chosen random numbers,
- whether a random number was not already chosen (with the aid of a hash table, red-black tree, or similar structure),
- whether a random number was not chosen more often in a row than desired,
- whether a random point is sufficiently distant from previous random points (with the aid of a KD-tree or similar structure),
- whether a random string matches a regular expression,
- whether a random number is not included in a "blacklist" of numbers, or
- two or more of the foregoing criteria.

(KD-trees, hash tables, red-black trees, prime-number testing algorithms, and regular expressions are outside the scope of this document.)

> **Note:** All rejection sampling strategies have a chance to reject data, so they all have a _variable running time_ (in fact, they could run indefinitely).  Note that graphics processing units (GPUs) and other devices that run multiple tasks at once work better if all the tasks finish their work at the same time.  This is not possible if they all generate a random number via rejection sampling because of its variable running time.  If each iteration of the rejection sampler has a low rejection rate, one solution is to have each task run one iteration of the sampler, with its own RNG, then to take the first random number that hasn't been rejected this way by a task (which can fail at a very low rate).<sup>[**(16)**](#Note16)</sup>

<a id=Random_Walks></a>
### Random Walks

A _random walk_ is a process with random behavior over time.  A simple form of random walk involves generating a random number that changes the state of the walk.  The pseudocode below generates a random walk of _n_ random numbers, where `STATEJUMP()` is the next number to add to the current state (see examples later in this section).

    METHOD RandomWalk(n)
      // Create a new list with an initial state
      list=[0]
      // Add 'n' new numbers to the list.
      for i in 0...n: AddItem(list, list[i] + STATEJUMP())
      return list
    END METHOD

> **Note:** A **white noise process** is simulated by creating a list of independent random numbers generated in the same way.  Such a process generally models behavior over time that does not depend on the time or the current state.  One example is `ZeroOrOne(px,py)` (for modeling a _Bernoulli process_, where each number is 0 or 1 depending on the probability `px`/`py`).

> **Examples:**
>
> 1. If `STATEJUMP()` is `RNDINT(1) * 2 - 1`, the random walk generates numbers that each differ from the last by -1 or 1, chosen at random.
> 2. If `STATEJUMP()` is `ZeroOrOne(px,py) * 2 - 1`, the random walk generates numbers that each differ from the last by -1 or 1 depending on the probability `px`/`py`.
> 3. **Binomial process:** If `STATEJUMP()` is `ZeroOrOne(px,py)`, the random walk advances the state with probability `px`/`py`.

<a id=Random_Dates_and_Times></a>
### Random Dates and Times

Pseudocode like the following can be used to choose a **random date-and-time** bounded by two dates-and-times (`date1`, `date2`).  In the following pseudocode, `DATETIME_TO_NUMBER` and `NUMBER_TO_DATETIME` convert a date-and-time to or from a number, respectively, at the required granularity, for instance, month, day, or hour granularity (the details of such conversion depend on the date-and-time format and are outside the scope of this document).

         dtnum1 = DATETIME_TO_NUMBER(date1)
         dtnum2 = DATETIME_TO_NUMBER(date2)
         // Choose a random date-and-time
         // in [dtnum1, dtnum2].  Any other
         // random selection strategy can be
         // used here instead.
         num = RNDINTRANGE(date1, date2)
         result = NUMBER_TO_DATETIME(num)

<a id=Randomization_in_Statistical_Testing></a>
### Randomization in Statistical Testing

Statistical testing uses shuffling and _bootstrapping_ to help draw conclusions on data through randomization.

- [**Shuffling**](#Shuffling) is used when each item in a data set belongs to one of several mutually exclusive groups.  Here, one or more **simulated data sets** are generated by shuffling the original data set and regrouping each item in the shuffled data set in order, such that the number of items in each group for the simulated data set is the same as for the original data set.
- [**_Bootstrapping_**](https://en.wikipedia.org/wiki/Bootstrapping_%28statistics%29) is a method of creating one or more random samples (simulated data sets) of an existing data set, where the items in each sample are chosen [**at random with replacement**](#Sampling_With_Replacement_Choosing_a_Random_Item_from_a_List).  (Each random sample can contain duplicates this way.)  See also (Brownlee 2018)<sup>[**(17)**](#Note17)</sup>.

After creating the simulated data sets, one or more statistics, such as the mean, are calculated for each simulated data set as well as the original data set, then the statistics for the simulated data sets are compared with those of the original (such comparisons are outside the scope of this document).

<a id=A_Note_on_Sorting_Random_Numbers></a>
### A Note on Sorting Random Numbers

In general, sorting random numbers is no different from sorting any other data. (Sorting algorithms are outside this document's scope.) <sup>[**(18)**](#Note18)</sup>

<a id=General_Non_Uniform_Distributions></a>
## General Non-Uniform Distributions

Some applications need to choose random items or numbers such that some of them are more likely to be chosen than others (a _non-uniform_ distribution). Most of the techniques in this section show how to use the [**uniform random number methods**](#Uniform_Random_Integers) to generate such random items or numbers.

<a id=Weighted_Choice></a>
### Weighted Choice

The weighted choice method generates a random item or number from among a collection of them with separate probabilities of each item or number being chosen.  There are several kinds of weighted choice.

<a id=Weighted_Choice_With_Replacement></a>
#### Weighted Choice With Replacement

The first kind is called weighted choice _with replacement_ (which can be thought of as drawing a ball, then putting it back) or a _categorical distribution_, where the probability of choosing each item doesn't change as items are chosen.  In the following pseudocode:

- `WeightedChoice` takes a single list `weights` of weights (integers 0 or greater) and returns the index of a weight from that list.  The greater the weight, the more likely its index will be chosen.
- `CumulativeWeightedChoice` takes a single list `weights` of N _cumulative weights_; they start at 0 and the next weight is not less than the previous.  Returns a number in the interval [0, N - 1).

&nbsp;

    METHOD CWChoose(weights, value)
        // Choose the index according to the given value
        for i in 0...size(weights) - 1
           if weights[i] < weights[i+1] and weights[i]>=value
              // Choose only if difference is positive
              return i
           end
        end
        return 0
    END METHOD

    METHOD WChoose(weights, value)
        // Choose the index according to the given value
        lastItem = size(weights) - 1
        runningValue = 0
        for i in 0...size(weights) - 1
           if weights[i] > 0
              newValue = runningValue + weights[i]
              lastItem = i
              // NOTE: Includes start, excludes end
              if value < newValue: break
              runningValue = newValue
           end
        end
        // If we didn't break above, this is a last
        // resort (might happen because rounding
        // error happened somehow)
        return lastItem
    END METHOD

    METHOD WeightedChoice(weights)
        if size(weights) == 0: return error
        msum = 0
        // Get the sum of all weights
        for i in 0...size(weights): msum = msum + weights[i]
        // Choose a random integer from 0 and less than
        // the sum of weights.
        return WChoose(RNDINTEXC(msum))
    END METHOD

    METHOD CumulativeWeightedChoice(weights)
        if size(weights)==0 or weights[0]!=0: return error
        // Weights is a list of cumulative weights. Chooses
        // a random number in [0, size(weights) - 1).
        sum = weights[size(weights) - 1]
        return CWChoose(RNDINTEXC(sum))
    END METHOD

> **Notes:**
>
> - The [**Python sample code**](https://peteroupc.github.io/randomgen.zip) contains a variant of this method for generating multiple random points in one call, and uses Vose's _alias method_ (described in "[**Darts, Dice, and Coins: Sampling from a Discrete Distribution**](https://www.keithschwarz.com/darts-dice-coins/)") in certain cases.
> - See also "[**Mixtures of Distributions**](#Mixtures_of_Distributions)" and "[**Approximate Sampling for Discrete Distributions**](#Approximate_Sampling_for_Discrete_Distributions)".
>
> **Examples:**
>
> 1. Assume we have the following list: `["apples", "oranges", "bananas", "grapes"]`, and `weights` is the following: `[3, 15, 1, 2]`.  The weight for "apples" is 3, and the weight for "oranges" is 15.  Since "oranges" has a higher weight than "apples", the index for "oranges" (1) is more likely to be chosen than the index for "apples" (0) with the `WeightedChoice` method.  The following idiom implements how to get a randomly chosen item from the list with that method: `item = list[WeightedChoice(weights)]`.
> 2. Example 1 can be implemented with `CumulativeWeightedChoice` instead of `WeightedChoice` if `weights` is the following list of cumulative weights: `[0, 3, 18, 19, 21]`.
> 3. **Piecewise constant distribution.** Assume the weights from example 1 are used and the list contains the following: `[0, 5, 10, 11, 13]` (one more item than the weights).  This expresses four intervals: [0, 5), [5, 10), and so on.  After a random index is chosen with `index = WeightedChoice(weights)`, an independent uniform random number in the chosen interval is chosen.  For example, code like the following chooses a random integer this way: `number = RNDINTEXCRANGE(list[index], list[index + 1])`.
> 4. A [**Markov chain**](https://en.wikipedia.org/wiki/Markov_chain) models one or more _states_ (for example, individual letters or syllables), and stores the probabilities to transition from one state to another (e.g., "b" to "e" with a chance of 20 percent, or "b" to "b" with a chance of 1 percent).  Thus, each state can be seen as having its own list of _weights_ for each relevant state transition.  For example, a Markov chain for generating **"pronounceable" words**, or words similar to natural-language words, can include "start" and "stop" states for the start and end of the word, respectively.

<a id=Weighted_Choice_Without_Replacement_Multiple_Copies></a>
#### Weighted Choice Without Replacement (Multiple Copies)

To implement weighted choice _without replacement_ (which can be thought of as drawing a ball _without_ putting it back) when each weight is an integer 0 or greater, generate an index by `WeightedChoice`, and then decrease the weight for the chosen index by 1.  In this way, **each weight behaves like the number of "copies" of each item**. The pseudocode below is an example of this.

    // Get the sum of weights.
    // NOTE: This code assumes--
    // - that `weights` is a list that can be modified,
    // - that all the weights are integers 0 or greater, and
    // - that `list`, a list of items, was already
    //   declared earlier and has at least as many
    //   items as `weights`.
    // If the original weights are needed for something
    // else, a copy of that list should be made first,
    // but the copying process is not shown here.
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
        index = WeightedChoice(weights)
        // Decrease weight by 1 to implement selection
        // without replacement.
        weights[index] = weights[index] - 1
        AddItem(items, list[index])
        i = i + 1
    end

Alternatively, if all the weights are integers 0 or greater and their sum is relatively small, create a list with as many copies of each item as its weight, then [**shuffle**](#Shuffling) that list.  The resulting list will be ordered in a way that corresponds to a weighted random choice without replacement.

> **Note:** The weighted sampling described in this section can be useful to some applications (particularly some games) that wish to control which random numbers appear, to make the random outcomes appear fairer to users (e.g., to avoid long streaks of good outcomes or of bad outcomes).  When used for this purpose, each item represents a different outcome (e.g., "good" or "bad"), and the lists are replenished once no further items can be chosen.  However, this kind of sampling should not be used for this purpose whenever information security (ISO/IEC 27000) is involved, including when predicting future random numbers would give a player or user a significant and unfair advantage.

<a id=Weighted_Choice_Without_Replacement_Single_Copies></a>
#### Weighted Choice Without Replacement (Single Copies)

The following are ways to implement weighted choice without replacement, where each item **can be chosen no more than once** at random (or alternatively, where higher-weighted items are more likely to appear first):

- Use `WeightedChoice` to choose random indices.  Each time an index is chosen, set the weight for the chosen index to 0 to keep it from being chosen again.
- Assign each index a random exponential number (with a rate equal to that index's weight), make a list of pairs assigning each number to an index, then sort that list by those numbers.  Example: `v=[]; for i in 0...size(weights): AddItem(v, [ExpoRatio(100000000, weights[i], 1), i]); Sort(v)`.  The sorted list of indices will then correspond to a weighted choice without replacement.  See "[**Algorithms for sampling without replacement**](https://timvieira.github.io/blog/post/2019/09/16/algorithms-for-sampling-without-replacement/)".

<a id=Weighted_Choice_Without_Replacement_List_of_Unknown_Size></a>
#### Weighted Choice Without Replacement (List of Unknown Size)

If the number of items in a list is not known in advance, then the following pseudocode implements a `RandomKItemsFromFileWeighted` that selects up to `k` random items from a file (`file`) of indefinite size (similarly to [**`RandomKItemsFromFile`**](#Pseudocode_for_Random_Sampling)).  See (Efraimidis and Spirakis 2005)<sup>[**(19)**](#Note19)</sup>, and see also (Efraimidis 2015)<sup>[**(20)**](#Note20)</sup>, (Vieira 2014)<sup>[**(21)**](#Note21)</sup>, and (Vieira 2019)<sup>[**(22)**](#Note22)</sup>.  In the pseudocode below:

- `WEIGHT_OF_ITEM(item, thisIndex)` is a placeholder for arbitrary code that calculates the integer weight of an individual item based on its value and its index (starting at 0); the item is ignored if its weight is 0 or less.
- `ITEM_OUTPUT(item, thisIndex, key)` is a placeholder for code that returns the item to store in the list; this can include the item's value, its index starting at 0, the item's key, or any combination of these.

&nbsp;

    METHOD RandomKItemsFromFileWeighted(file, k)
      queue=[] // Initialize priority queue
      index = 0
      while true
        // Get the next line from the file
        item = GetNextLine(file)
        thisIndex = index
        index = index + 1
        // If the end of the file was reached, break
        if item == nothing: break
        weight = WEIGHT_OF_ITEM(item, thisIndex)
        // Ignore if item's weight is 0 or less
        if weight <= 0: continue
        // NOTE: Equivalent to Expo(weight), except
        // it uses ratios
        key = ExpoRatio(100000000, weight, 1)
        itemToStore = ITEM_OUTPUT(item, thisIndex, key)
        // Begin priority queue add operation.  Instead
        // of the item ('item'), the line number starting at one
        // ('thisIndex') can be added to the queue.
        if size(queue) < k // Fewer than k items
          AddItem(queue, [key, itemToStore])
          Sort(queue)
        else // phase 2
          // Check whether this key is smaller
          // than the largest key in the queue
          if key < queue[size(queue)-1][0]
              // Replace item with largest key
              queue[size(queue)-1]=[key, itemToStore]
              Sort(queue)
          end
        end
        // End priority queue add operation
      end
      list=[]
      for v in 0...size(queue): AddItem(list, queue[v][1])
      // Optional shuffling here.
      // See NOTE 4 in RandomKItemsFromFile code.
      if size(list)>=2: Shuffle(list)
      return list
    end

> **Note:** Weighted choice _with replacement_ can be implemented by doing one or more concurrent runs of `RandomKItemsFromFileWeighted(file, 1)` (making sure each run traverses `file` the same way for multiple runs as for a single run) (Efraimidis 2015)<sup>[**(20)**](#Note20)</sup>.

<a id=Priority_Sampling></a>
#### Priority Sampling

_Priority sampling_ (Duffield et al., 2007)<sup>[**(23)**](#Note23)</sup> samples from a weighted stream of items in a way that allows the total weight of some or all the items to be estimated simply by adding their weight estimates.  The pseudocode below generates weight estimates for `m` sampled items; all other items have weight estimates of 0. See also "[**Estimating means in a finite universe**](https://timvieira.github.io/blog/post/2017/07/03/estimating-means-in-a-finite-universe/)", which shows how priority sampling can help estimate the mean of a function over a limited but high number of data points via the weighted sum of that function's value at the sampled data points.

    METHOD PrioritySample(file, m)
       // Uses RandomKItemsFromFileWeighted modified
       // as follows:  Keys are generated by
       // `MakeRatio(-weight, RNDINTRANGE(1, 1000000000))`
       // and `ITEM_OUTPUT(a, b, key)` is `[a, b, -key]`.
       items=RandomKItemsFromFileWeighted(file, m+1)
       threshold=items[m][2] // Get the (m+1)th highest key
       ret=[]
       for i in 0...m: AddItem(ret,
          [max(items[i][0], threshold), items[i][1]])
       // Returns, for each item, the weight estimate and its
       // index starting at 0
       return ret
    END METHOD

<a id=Mixtures_of_Distributions></a>
### Mixtures of Distributions

A _mixture_ consists of two or more probability distributions with separate probabilities of being sampled. To generate random content from a mixture&mdash;

1. generate `index = WeightedChoice(weights)`, where `weights` is a list of relative probabilities that each distribution in the mixture will be sampled, then
2. based on the value of `index`, generate the random content from the corresponding distribution.

> **Examples:**
>
> 1. One mixture consists of the sum of three six-sided virtual die rolls and the result of one six-sided die roll, but there is an 80% chance to roll one six-sided virtual die rather than three.  The following pseudocode shows how this mixture can be sampled:
>
>         index = WeightedChoice([80, 20])
>         number = 0
>         // If index 0 was chosen, roll one die
>         if index==0: number = RNDINTRANGE(1,6)
>         // Else index 1 was chosen, so roll three dice
>         else: number = RNDINTRANGE(1,6) +
>            RNDINTRANGE(1,6) + RNDINTRANGE(1,6)
>
> 2. Choosing an independent uniform random point, from a complex shape (in any number of dimensions) is equivalent to doing such sampling from a mixture of simpler shapes that make up the complex shape (here, the `weights` list holds the n-dimensional "volume" of each simpler shape).  For example, a simple closed 2D polygon can be [**_triangulated_**](https://en.wikipedia.org/wiki/Polygon_triangulation), or decomposed into [**triangles**](#Random_Points_Inside_a_Simplex), and a mixture of those triangles can be sampled.<sup>[**(24)**](#Note24)</sup>
> 3. Take a set of nonoverlapping integer ranges.  To choose an independent uniform random integer from those ranges:
>     - Create a list (`weights`) of weights for each range.  Each range is given a weight of `(mx - mn) + 1`, where `mn` is that range's minimum and `mx` is its maximum.
>     - Choose an index using `WeightedChoice(weights)`, then generate `RNDINTRANGE(mn, mx)`, where `mn` is the corresponding range's minimum and `mx` is its maximum.
> 4. In the pseudocode `index = WeightedChoice([80, 20]); list = [[0, 5], [5, 10]]; number = RNDINTEXCRANGE(list[index][0], list[index][1])`, a random integer in [0, 5) is chosen at an 80% chance, and a random integer in [5, 10) at a 20% chance.
> 5. A **hyperexponential distribution** is a mixture of [**exponential distributions**](#Exponential_Distribution), each one with a separate weight and separate rate parameter.  An example is below.
>
>          index = WeightedChoice([0.6, 0.3, 0.1])
>          // Rates of the three exponential distributions, as ratios
>          rates = [[3, 10], [5, 10], [1, 100]]
>          // Generate an exponential random number
>          // with chosen rate, as a ratio
>          number = ExpoRatio(100000, rates[i][0], rates[i][1])

<a id=Transformations_of_Random_Numbers></a>
### Transformations of Random Numbers

Random numbers can be generated by combining and/or transforming one or more random numbers and/or discarding some of them.

As an example, [**"Probability and Games: Damage Rolls"**](http://www.redblobgames.com/articles/probability/damage-rolls.html) by Red Blob Games includes interactive graphics showing score distributions for lowest-of, highest-of, drop-the-lowest, and reroll game mechanics.<sup>[**(25)**](#Note25)</sup>  These and similar distributions can be generalized as follows.

Generate one or more random numbers, each with a separate probability distribution, then<sup>[**(26)**](#Note26)</sup>:

1. **Highest-of:**  Choose the highest generated number.
2. **Drop-the-lowest:**  Add all generated numbers except the lowest.
3. **Reroll-the-lowest:**  Add all generated numbers except the lowest, then add a number generated randomly by a separate probability distribution.
4. **Lowest-of:**  Choose the lowest generated number.
5. **Drop-the-highest:**  Add all generated numbers except the highest.
6. **Reroll-the-highest:**  Add all generated numbers except the highest, then add a number generated randomly by a separate probability distribution.
7. **Sum:** Add all generated numbers.
8. **Mean:** Find the mean of all generated numbers.
9. **Geometric transformation:** Treat the numbers as an _n_-dimensional point, then apply a geometric transformation, such as a rotation or other _affine transformation_<sup>[**(27)**](#Note27)</sup>, to that point.

If the probability distributions are the same, then strategies 1 to 3 make higher numbers more likely, and strategies 4 to 6, lower numbers.

> **Note:** Variants of strategy 4 &mdash; e.g., choosing the second-, third-, or nth-lowest number &mdash; are formally called second-, third-, or nth-**order statistics distributions**, respectively.
>
> **Examples:**
>
> 1. The idiom `min(RNDINTRANGE(1, 6), RNDINTRANGE(1, 6))` takes the lowest of two six-sided die results (strategy 4).  Due to this approach, 1 is more likely to occur than 6.
> 2. The idiom `RNDINTRANGE(1, 6) + RNDINTRANGE(1, 6)` takes the result of two six-sided dice (see also "[**Dice**](#Dice)") (strategy 7).
> 3. A **binomial distribution** models the sum of `n` random numbers each generated by `ZeroOrOne(px,py)` (strategy 7) (see "[**Binomial Distribution**](#Binomial_Distribution)").
> 4. A **hypoexponential distribution** models the sum<sup>[**(26)**](#Note26)</sup>
 of _n_ random numbers that follow an exponential distribution and each have a separate rate parameter (see "[**Exponential Distribution**](#Exponential_Distribution)").
> 5. **Clamped random numbers.**  These are one example of transformed random numbers.  To generate a clamped random number, generate a random number as usual, then&mdash;
>     - if that number is less than a minimum threshold, use the minimum threshold instead (_left-censoring_), and/or
>     - if that number is greater than a maximum threshold, use the maximum threshold instead (_right-censoring_).
>
>     An example of a clamped random number is `min(200, RNDINT(255))`.
> 6. A **compound Poisson distribution** models the sum<sup>[**(26)**](#Note26)</sup>
 of _n_ random numbers each generated the same way, where _n_ follows a [**Poisson distribution**](#Poisson_Distribution) (e.g., `n = PoissonInt(10, 1)` for an average of 10 numbers) (strategy 7, sum).
> 7. A **P&oacute;lya&ndash;Aeppli distribution** is a compound Poisson distribution in which the random numbers are generated by `NegativeBinomial(1, 1-p)+1` for a fixed `p`.

<a id=Specific_Non_Uniform_Distributions></a>
## Specific Non-Uniform Distributions

This section contains information on some of the most common non-uniform probability distributions.

<a id=Dice></a>
### Dice

The following method generates a random result of rolling virtual dice. It takes three parameters: the number of dice (`dice`), the number of sides in each die (`sides`), and a number to add to the result (`bonus`) (which can be negative, but the result of the method is 0 if that result is greater).  See also Red Blob Games, [**"Probability and Games: Damage Rolls"**](http://www.redblobgames.com/articles/probability/damage-rolls.html).

    METHOD DiceRoll(dice, sides, bonus)
        if dice < 0 or sides < 1: return error
        ret = 0
        for i in 0...dice: ret=ret+RNDINTRANGE(1, sides)
        return max(0, ret + bonus)
    END METHOD

> **Examples:** The result of rolling&mdash;
> - four six-sided virtual dice ("4d6") is `DiceRoll(4,6,0)`,
> - three ten-sided virtual dice, with 4 added ("3d10 + 4"), is `DiceRoll(3,10,4)`, and
> - two six-sided virtual dice, with 2 subtracted ("2d6 - 2"), is `DiceRoll(2,6,-2)`.

<a id=Binomial_Distribution></a>
### Binomial Distribution

The _binomial distribution_ uses two parameters: `trials` and `p`.  This distribution models the number of successes in a fixed number of independent trials (equal to `trials`), each with the same probability of success (equal to `p`, where `p <= 0` means never, `p >= 1` means always, and `p = 1/2` means an equal chance of success or failure).

This distribution has a simple implementation: `count = 0; for i in 0...trials: count=count+ZeroOrOne(px, py)`.  But for large numbers of trials, this can be very slow.

The pseudocode below implements an exact sampler of this distribution, with certain optimizations based on (Farach-Colton and Tsai 2015)<sup>[**(28)**](#Note28)</sup>.  Here, the parameter `p` is expressed as a ratio `px`/`py`.

&nbsp;

    METHOD BinomialInt(trials, px, py)
      if trials < 0: return error
      if trials == 0: return 0
      // Always succeeds
      if mx: return trials
      // Always fails
      if p <= 0.0: return 0
      count = 0
      ret = 0
      recursed = false
      if py*2 == px // Is half
        if i > 200
          // Divide and conquer
          half = floor(trials / 2)
          return BinomialInt(half, 1, 2) + BinomialInt(trials - half, 1, 2)
        else
          if mod(trials,2)==1
            count=count+RNDINT(1)
            trials=trials-1
          end
          // NOTE: This step can be made faster
          // by precalculating an alias table
          // based on a list of n + 1 binomial(0.5)
          // weights, which consist of n-choose-i
          // for all i in [0, n], and sampling based on
          // that table (see Farach-Colton and Tsai).
          for i in 0...trials: count=count+RNDINT(1)
        end
      else
        // Based on proof of Theorem 2 in Farach-Colton and Tsai.
        // Decompose px/py into its binary expansion.
        pw = MakeRatio(px, py)
        pt = MakeRatio(1, 2)
        while trials>0 and pw>0
          c=BinomialInt(trials, 1, 2)
          if pw>=pt
            count=count+c
            trials=trials-c
            pw=pw-pt
          else
            trials=c
          end
          pt=pt/2 // NOTE: Not rounded
        end
      end
      if recursed: return count+ret
      return count
    END METHOD

> **Note:** If `px`/`py` is `1`/`2`, the binomial distribution models the task "Flip N coins, then count the number of heads", and the random sum is known as [**_Hamming distance_**](https://en.wikipedia.org/wiki/Hamming_distance) (treating each trial as a "bit" that's set to 1 for a success and 0 for a failure).  If `px` is `1`, then this distribution models the task "Roll `n` `py`-sided dice, then count the number of dice that show the number 1."

<a id=Negative_Binomial_Distribution></a>
### Negative Binomial Distribution

The _negative binomial distribution_ models the number of failing trials that happen before a fixed number of successful trials (`successes`). Each trial is independent and has a success probability of `px/py` (where 0 means never and 1 means always).

    METHOD NegativeBinomialInt(successes, px, py)
        // Needs to be 0 or greater; px must not be 0
        if successes < 0 or px == 0: return error
        if successes == 0 or px >= py: return 0
        total = 0
        count = 0
        while total < successes
            if ZeroOrOne(px, py) == 1: total = total + 1
            else: count = count + 1
        end
        return count
    END METHOD

<a id=Geometric_Distribution></a>
### Geometric Distribution

The geometric distribution is a negative binomial distribution with `successes = 1`.  Here, the sampled number is the number of failures that have happened before one success happens. (This is the definition used in _Mathematica_, for example.  Saucier 2000, p. 44, also mentions an alternative definition that includes the success, and this is the definition used, for example, in (Devroye 1986, p. 498)<sup>[**(14)**](#Note14)</sup>.)  For example, if `p` is 1/2, the geometric distribution models the task "Flip a coin until you get tails, then count the number of heads."  As a unique property of the geometric distribution, the number of trials that have already failed in a row says nothing about the number of new trials that will fail in a row.

<a id=Exponential_Distribution></a>
### Exponential Distribution

The _exponential distribution_ uses a parameter known as &lambda;, the rate, or the inverse scale.  Usually, &lambda; is the probability that an independent event of a given kind will occur in a given span of time (such as in a given day or year), and the random result is the number of spans of time until that event happens.  Usually, &lambda; is equal to 1, or 1/1.  1/&lambda; is the scale (mean), which is usually the average waiting time between two independent events of the same kind.

In this document, `Expo(lamda)` is an exponentially-distributed random number with the rate `lamda`.

In the pseudocode below, `ExpoRatio` generates an exponential random number (in the form of a ratio) given the rate `rx`/`ry` (or scale `ry`/`rx`) and the base `base`.  `ExpoNumerator` generates the numerator of an exponential random number with rate 1 given that number's denominator.  The algorithm is due to von Neumann (1951)<sup>[**(29)**](#Note29)</sup>.

    METHOD ExpoRatio(base, rx, ry)
        // Generates a numerator and denominator of
        // an exponential random number with rate rx/ry.
        return MakeRatio(ExpoNumerator(base*ry), base*rx))
    END METHOD

    METHOD ExpoNumerator(denom)
       if denom<=0: return error
       count=0
       while true
          y1=RNDINTEXC(denom)
          y=y1
          accept=true
          while true
             z=RNDINTEXC(denom)
             if y<=z: break
             accept=not accept
             y=z
          end
          if accept: count=count+y1
          else: count=count+denom
          if accept: break
       end
       return count
    END METHOD

> **Note:** `Expo(lamda)` has the following na&iuml;ve implementation: `-ln(1-RNDU01()) / lamda`.  But there are several problems here; for example, this implementation is ill-conditioned at large values because of the distribution's right-sided tail (Pedersen 2018)<sup>[**(2)**](#Note2)</sup>, and it can return infinity if `RNDU01()` becomes 1. Pedersen suggests using either `-ln(RNDRANGEMinExc(0, 0.5))` or `-log1p(-RNDRANGEMinExc(0, 0.5))` (rather than `-ln(1-RNDU01())`), chosen at random each time.

<a id=Poisson_Distribution></a>
### Poisson Distribution

The _Poisson distribution_ uses a parameter `mean` (also known as &lambda;). &lambda; is the average number of independent events of a certain kind per fixed unit of time or space (for example, per day, hour, or square kilometer).  A Poisson-distributed number is the number of such events within one such unit.

In this document, `Poisson(mean)` is a Poisson-distributed number if `mean` is greater than 0, or 0 if `mean` is 0.

The following method generates a Poisson random number with mean `mx`/`my`, using the approach suggested by (Flajolet et al., 2010)<sup>[**(10)**](#Note10)</sup>.  In the method, `UniformNew()` creates a _u-rand_, an "empty" random number in [0, 1], whose bits are not yet determined (Karney 2014)<sup>[**(30)**](#Note30)</sup>, and `UniformLess(a, b)` returns whether one _u-rand_ (`a`) is less than another (`b`), building up the bits of both as necessary.  For a less exact algorithm, replace `UniformNew()` with `RNDINT(1000)` and `UniformLess(a, b)` with `a < b`.

    METHOD PoissonInt(mx, my)
        if my == 0: return error
        if mx == 0: return 0
        if (mx < 0 and my < 0) or (mx > 0 and my < 0): return 0
        if mx >= my
           // Mean is 1 or greater
           mm=mod(mx, my)
           if mm == 0
              mf=floor(mx/my)
              if mod(mf, 2)==0: return
                 PoissonInt(mf/2, 1)+PoissonInt(mf/2, 1)
              mf=mf-1
              return PoissonInt(1,2)+PoissonInt(1,2)+
                  PoissonInt(mf/2, 1)+PoissonInt(mf/2, 1)
           else: return PoissonInt(mm, my)+
               PoissonInt(mx-mm, my)
        end
        while true
          // Generate n, a geometric random number
          n = NegativeBinomialInt(1, mx, my)
          // If n uniform random numbers turn out
          // to be sorted, accept n
          if n<=1: return n
          u = UniformNew()
          success = true
          for i in 1...n
             u2 = UniformNew()
             if UniformLess(u, u2): u = u2
             else
               success=false // Not sorted
               break
             end
          end
          if success: return n
        end
        return count
    END METHOD

> **Note:** To generate a sum of `n` independent Poisson random numbers with separate means, generate a Poisson random number whose mean is the sum of those means (see (Devroye 1986)<sup>[**(14)**](#Note14)</sup>, p. 501).  For example, to generate a sum of 1000 independent Poisson random numbers with a mean of 1/1000000, simply generate `PoissonInt(1, 1000)` (because 1/1000000 * 1000 = 1/1000).

<a id=Hypergeometric_Distribution></a>
### Hypergeometric Distribution

The following method generates a random integer that follows a _hypergeometric distribution_.  When a given number of items are drawn at random without replacement from a collection of items each labeled either `1` or `0`,  the random integer expresses the number of items drawn this way that are labeled `1`.  In the method below, `trials` is the number of items drawn at random, `ones` is the number of items labeled `1` in the set, and `count` is the number of items labeled `1` or `0` in that set.

    METHOD Hypergeometric(trials, ones, count)
        if ones < 0 or count < 0 or trials < 0 or
           ones > count or trials > count
          return error
        end
        if ones == 0: return 0
        successes = 0
        i = 0
        currentCount = count
        currentOnes = ones
        while i < trials and currentOnes > 0
          if ZeroOrOne(currentOnes, currentCount) == 1
            currentOnes = currentOnes - 1
            successes = successes + 1
          end
          currentCount = currentCount - 1
          i = i + 1
        end
        return successes
    END METHOD

> **Example:** In a 52-card deck of Anglo-American playing cards, 12 of the cards are face cards (jacks, queens, or kings).  After the deck is shuffled and seven cards are drawn, the number of face cards drawn this way follows a hypergeometric distribution where `trials` is 7, `ones` is 12, and `count` is 52.

<a id=Random_Integers_with_a_Given_Positive_Sum></a>
### Random Integers with a Given Positive Sum

The following pseudocode shows how to generate `n` uniform random integers greater than 0 with a given positive sum, in random order. (The algorithm for this was presented in (Smith and Tromble 2004)<sup>[**(31)**](#Note31)</sup>.)  In the pseudocode below&mdash;

- the method `PositiveIntegersWithSum` returns `n` integers greater than 0 that sum to `total`, in random order,
- the method `IntegersWithSum` returns `n` integers 0 or greater that sum to `total`, in random order, and
- `Sort(list)` sorts the items in `list` in ascending order (note that sort algorithms are outside the scope of this document).

&nbsp;

    METHOD PositiveIntegersWithSum(n, total)
        if n <= 0 or total <=0: return error
        ls = [0]
        ret = NewList()
        while size(ls) < n
          c = RNDINTEXCRANGE(1, total)
          found = false
          for j in 1...size(ls)
            if ls[j] == c
              found = true
              break
            end
          end
          if found == false: AddItem(ls, c)
        end
        Sort(ls)
        AddItem(ls, total)
        for i in 1...size(ls): AddItem(ret,
            ls[i] - ls[i - 1])
        return ret
    END METHOD

    METHOD IntegersWithSum(n, total)
      if n <= 0 or total <=0: return error
      ret = PositiveIntegersWithSum(n, total + n)
      for i in 0...size(ret): ret[i] = ret[i] - 1
      return ret
    END METHOD

> **Notes:**
>
> 1. To generate `N` uniform random numbers with a given positive average `avg`, in random order, generate `IntegersWithSum(N, N * avg)` (or its equivalent for real numbers).
> 2. To generate `N` uniform random numbers `min` or greater and with a given positive sum `sum`, in random order, generate `IntegersWithSum(N, sum - N * min)` (or its equivalent for real numbers), then add `min` to each number generated this way.  The [**Python sample code**](https://peteroupc.github.io/randomgen.zip) implements an efficient way to generate such integers if each one can't exceed a given maximum; the algorithm is thanks to a _Stack Overflow_ answer (`questions/61393463`) by John McClane.

<a id=Multinomial_Distribution></a>
### Multinomial Distribution

The _multinomial distribution_ models the number of times each of several mutually exclusive events happens among a given number of trials, where each event can have a separate probability of happening.  In the pseudocode below, `trials` is the number of trials, and `weights` is a list of the relative probabilities of each event.  The method tallies the events as they happen and returns a list (with the same size as `weights`) containing the number of successes for each event.

    METHOD Multinomial(trials, weights)
        if trials < 0: return error
        // create a list of successes
        list = NewList()
        for i in 0...size(weights): AddItem(list, 0)
        for i in 0...trials
            // Choose an index
            index = WeightedChoice(weights)
            // Tally the event at the chosen index
            list[index] = list[index] + 1
        end
        return list
    END METHOD

<a id=Randomization_with_Real_Numbers></a>
## Randomization with Real Numbers

This section describes randomization methods that use random real numbers, not just random integers.

However, whenever possible, **applications should work with random integers**, rather than other random real numbers.  This is because:
- Computers can represent integers more naturally than other real numbers, making random integer generation algorithms more portable and more numerically stable than random real number generation algorithms.<sup>[**(32)**](#Note32)</sup>
- No computer can choose from among all real numbers between two others, since there are infinitely many of them.
- For applications that may care about reproducible "random" numbers (unit tests, simulations, machine learning, and so on), using non-integer numbers can complicate the task of making a method reproducible from run to run or across computers.

The methods in this section should not be used to generate random numbers for information security purposes, even with a secure random number generator.  See "Security Considerations" in the appendix.

<a id=Uniform_Random_Real_Numbers></a>
### Uniform Random Real Numbers

This section defines the following methods that generate independent uniform random real numbers:

* `RNDU01`: Interval [0, 1].
* `RNDU01OneExc`: Interval &#x5b;0, 1).<sup>[**(33)**](#Note33)</sup>
* `RNDU01ZeroExc`: Interval (0, 1].
* `RNDU01ZeroOneExc`: Interval (0, 1).
* `RNDRANGE`: Interval [a, b].
* `RNDRANGEMaxExc`: Interval [a, b).
* `RNDRANGEMinExc`: Interval (a, b].
* `RNDRANGEMinMaxExc`: Interval (a, b).

<a id=For_Fixed_Point_Number_Formats></a>
#### For Fixed-Point Number Formats

For fixed-point number formats representing multiples of 1/`n`, these eight methods are trivial.  The following implementations return integers that represent fixed-point numbers.

`RNDU01` family:

* `RNDU01()`: `RNDINT(n)`.
* `RNDU01ZeroExc()`: `(RNDINT(n - 1) + 1)` or `(RNDINTEXC(n) + 1)`.
* `RNDU01OneExc()`: `RNDINTEXC(n)` or `RNDINT(n - 1)`.
* `RNDU01ZeroOneExc()`: `(RNDINT(n - 2) + 1)` or `(RNDINTEXC(n - 1) + 1)`.

`RNDRANGE` family.  In each method below, `fpa` and `fpb` are the bounds of the random number generated and are integers that represent fixed-point numbers (such that `fpa = a * n` and `fpb = b * n`).  For example, if `n` is 100, to generate a number in [6.35, 9.96], generate `RNDRANGE(6.35, 9.96)` or `RNDINTRANGE(635, 996)`.

* `RNDRANGE(a, b)`: `RNDINTRANGE(fpa, fpb)`.
* `RNDRANGEMinExc(a, b)`: `RNDINTRANGE(fpa + 1, fpb)`, or an error if `fpa >= fpb`.
* `RNDRANGEMaxExc(a, b)`: `RNDINTEXCRANGE(fpa, fpb)`.
* `RNDRANGEMinMaxExc(a, b)`: `RNDINTRANGE(fpa + 1, fpb - 1)`, or an error if `fpa >= fpb or a == fpb - 1`.

<a id=For_Rational_Number_Formats></a>
#### For Rational Number Formats

For rational number formats with a fixed denominator, the eight methods can be implemented in the numerator as given in the previous section for fixed-point formats.

<a id=For_Floating_Point_Number_Formats></a>
#### For Floating-Point Number Formats

For floating-point number formats representing numbers of the form `FPSign` * `s` * `FPRADIX`<sup>`e`</sup> <sup>[**(34)**](#Note34)</sup>, the following pseudocode implements `RNDRANGE(lo, hi)`.  In the pseudocode:

- `MINEXP` is the lowest exponent a number can have in the floating-point format.  For the IEEE 754 binary64 format (Java `double`), `MINEXP = -1074`.  For the IEEE 754 binary32 format (Java `float`), `MINEXP = -149`.
- `FPPRECISION` is the number of significant digits in the floating-point format, whether the format stores them as such or not. Equals 53 for binary64, or 24 for binary32.
- `FPRADIX` is the digit base of the floating-point format.  Equals 2 for binary64 and binary32.
- `FPExponent(x)` returns the value of `e` for the number `x` such that the number of digits in `s` equals `FPPRECISION`.  Returns `MINEXP` if `x = 0` or if `e` would be less than `MINEXP`.
- `FPSignificand(x)` returns `s`, the significand of the number `x`.  Returns 0 if `x = 0`. Has `FPPRECISION` digits unless `FPExponent(x) == MINEXP`.
- `FPSign(x)` returns either -1 or 1 indicating whether the number is positive or negative.  Can be -1 even if `s` is 0.

See also (Downey 2007)<sup>[**(35)**](#Note35)</sup> and the [**Rademacher Floating-Point Library**](https://gitlab.com/christoph-conrads/rademacher-fpl).

    METHOD RNDRANGE(lo, hi)
      losgn = FPSign(lo)
      hisgn = FPSign(hi)
      loexp = FPExponent(lo)
      hiexp = FPExponent(hi)
      losig = FPSignificand(lo)
      hisig = FPSignificand(hi)
      if lo > hi: return error
      if losgn == 1 and hisgn == -1: return error
      if losgn == -1 and hisgn == 1
        // Straddles negative and positive ranges
        // NOTE: Changes negative zero to positive
        mabs = max(abs(lo),abs(hi))
        while true
           ret=RNDRANGE(0, mabs)
           neg=rand(2)
           if neg==0: ret=-ret
           if ret>=lo and ret<=hi: return ret
        end
      end
      if lo == hi: return lo
      if losgn == -1
        // Negative range
        return -RNDRANGE(abs(lo), abs(hi))
      end
      // Positive range
      expdiff=hiexp-loexp
      if loexp==hiexp
        // Exponents are the same
        // NOTE: Automatically handles
        // subnormals
        s=RNDINTRANGE(losig, hisig)
        return s*1.0*pow(FPRADIX, loexp)
      end
      while true
        ex=hiexp
        while ex>MINEXP
          v=RNDINTEXC(FPRADIX)
          if v==0: ex=ex-1
          else: break
        end
        s=0
        if ex==MINEXP
          // Has FPPRECISION or fewer digits
          // and so can be normal or subnormal
          s=RNDINTEXC(pow(FPRADIX,FPPRECISION))
        else if FPRADIX != 2
          // Has FPPRECISION digits
          s=RNDINTEXCRANGE(
            pow(FPRADIX,FPPRECISION-1),
            pow(FPRADIX,FPPRECISION))
        else
          // Has FPPRECISION digits (bits), the highest
          // of which is always 1 because it's the
          // only nonzero bit
          sm=pow(FPRADIX,FPPRECISION-1)
          s=RNDINTEXC(sm)+sm
        end
        ret=s*1.0*pow(FPRADIX, ex)
        if ret>=lo and ret<=hi: return ret
      end
    END METHOD

The other seven methods can be derived from `RNDRANGE` as follows:

- **`RNDRANGEMaxExc`, interval \[`mn`, `mx`\)**:
    - Generate `RNDRANGE(mn, mx)` in a loop until a number other than `mx` is generated this way.  Return an error if `mn >= mx` (treating positive and negative zero as different).
- **`RNDRANGEMinExc`, interval \[`mn`, `mx`\)**:
    - Generate `RNDRANGE(mn, mx)` in a loop until a number other than `mn` is generated this way.  Return an error if `mn >= mx` (treating positive and negative zero as different).
- **`RNDRANGEMinMaxExc`, interval \(`mn`, `mx`\)**:
    - Generate `RNDRANGE(mn, mx)` in a loop until a number other than `mn` or `mx` is generated this way.  Return an error if `mn >= mx` (treating positive and negative zero as different).
- **`RNDU01()`**: `RNDRANGE(0, 1)`.
- **`RNDU01ZeroExc()`**: `RNDRANGEMinExc(0, 1)`.
- **`RNDU01OneExc()`**: `RNDRANGEMaxExc(0, 1)`.
- **`RNDU01ZeroOneExc()`**: `RNDRANGEMinMaxExc(0, 1)`.

> **Note:** In many software libraries, random numbers in a range are generated by dividing or multiplying a random integer by a constant.  For example, `RNDU01OneExc()` is often implemented like `RNDINTEXC(X) * (1.0/X)` or `RNDINTEXC(X) / X`, where X varies based on the software library.<sup>[**(36)**](#Note36)</sup> The disadvantage here is that not all numbers a floating-point format can represent in the range can be covered this way (Goualard 2020)<sup>[**(37)**](#Note37)</sup>.  As another example, `RNDRANGEMaxExc(a, b)` is often implemented like `a + RNDU01OneExc() * (b - a)`; however, this not only has the same disadvantage, but has many other issues where floating-point numbers are involved.

<a id=Uniform_Numbers_As_Their_Digit_Expansions></a>
#### Uniform Numbers As Their Digit Expansions

As noted by von Neumann (1951)<sup>[**(29)**](#Note29)</sup>, a uniform random number bounded by 0 and 1 can be produced by "juxtapos[ing] enough random binary digits".  In this sense, the random number is `RNDINTEXC(2)/2 + RNDINTEXC(2)/4 + RNDINTEXC(2)/8 + ...`, perhaps "forc[ing] the last [random bit] to be 1" "[t]o avoid any bias".  It is not hard to see that a uniform random number of an arbitrary base can be formed by generating a random digit expansion after the point.  For example, a random decimal number bounded by 0 and 1 can be generated as `RNDINTEXC(10)/10 + RNDINTEXC(10)/100 + ...`. (Note that the number 0 is an infinite digit expansion of zeros, and the number 1 is an infinite digit expansion of base-minus-ones.)

<a id=Monte_Carlo_Sampling_Expected_Values_Integration_and_Optimization></a>
### Monte Carlo Sampling: Expected Values, Integration, and Optimization

**Requires random real numbers.**

Randomization is the core of **Monte Carlo sampling**.  There are three main uses of Monte Carlo sampling: estimation, integration, and optimization.

1. **Estimating expected values.** Monte Carlo sampling can help estimate the **expected value** of a function given a random process or sampling distribution.  The following pseudocode estimates the expected value from a list of random numbers generated the same way.  Here, `EFUNC` is the function, and `MeanAndVariance` is given in the [**appendix**](#Mean_and_Variance_Calculation).  `Expectation` returns a list of two numbers &mdash; the estimated expected value and its standard error.

        METHOD Expectation(numbers)
          ret=[]
          for i in 0...size(numbers)
             AddItem(ret,EFUNC(numbers[i]))
          end
          merr=MeanAndVariance(ret)
          merr[1]=merr[1]*(size(ret)-1.0)/size(ret)
          merr[1]=sqrt(merr[1]/size(ret))
          return merr
        END METHOD

    Examples of expected values include the following:

    - The **`n`th raw moment** (mean of `n`th powers) if `EFUNC(x)` is `pow(x, n)`.
    - The **mean**, if `EFUNC(x)` is `x`.
    - The **`n`th sample central moment**, if `EFUNC(x)` is `pow(x-m, n)`, where `m` is the mean of the sampled numbers.
    - The (biased) **sample variance**, the second sample central moment.
    - The **probability**, if `EFUNC(x)` is `1` if some condition is met or `0` otherwise.

    If the sampling domain is also limited to random numbers meeting a given condition (such as `x < 2` or `x != 10`), then the estimated expected value is also called the estimated _conditional expectation_.

2. [**Monte Carlo integration**](https://en.wikipedia.org/wiki/Monte_Carlo_integration).  This is a way to estimate a multidimensional integral; randomly sampled numbers are put into a list (`nums`) and the estimated integral and its standard error are then calculated with `Expectation(nums)` with `EFUNC(x) = x`, and multiplied by the volume of the sampling domain.

3. [**Stochastic optimization**](http://mathworld.wolfram.com/StochasticOptimization.html). This uses randomness to help find the minimum or maximum value of a function with one or more variables; examples include [**_simulated annealing_**](https://en.wikipedia.org/wiki/Simulated_annealing) and [**_simultaneous perturbation stochastic approximation_**](https://en.wikipedia.org/wiki/Simultaneous_perturbation_stochastic_approximation) (see also (Spall 1998)<sup>[**(38)**](#Note38)</sup>).

<a id=Low_Discrepancy_Sequences></a>
### Low-Discrepancy Sequences

**Requires random real numbers.**

A [**_low-discrepancy sequence_**](https://en.wikipedia.org/wiki/Low-discrepancy_sequence) (or _quasirandom sequence_) is a sequence of numbers that behave like uniform random numbers but are _dependent_ on each other, in that they are less likely to form "clumps" than if they were independent.  The following are examples:
- A base-N _van der Corput sequence_ is generated as follows:  For each non-negative integer index in the sequence, take the index as a base-N number, then divide the least significant base-N digit by N, the next digit by N<sup>2</sup>, the next by N<sup>3</sup>, and so on, and add together these results of division.
- A _Halton sequence_ is a set of two or more van der Corput sequences with different prime bases; a Halton point at a given index has coordinates equal to the points for that index in the van der Corput sequences.
- Roberts, M., in "[**The Unreasonable Effectiveness of Quasirandom Sequences**](http://extremelearning.com.au/unreasonable-effectiveness-of-quasirandom-sequences/)", presents a low-discrepancy sequence based on a "generalized" version of the golden ratio.
- Sobol sequences are explained in "[**Sobol sequence generator**](https://web.maths.unsw.edu.au/~fkuo/sobol/)" by S. Joe and F. Kuo.
- _Latin hypercube sampling_ doesn't exactly produce low-discrepancy sequences, but serves much the same purpose.  The following pseudocode implements this sampling for an `n`-number sequence: `lhs = []; for i in 0...n: AddItem(RNDRANGEMinMaxExc(i*1.0/n,(i+1)*1.0/n)); lhs = Shuffle(lhs)`.
- Linear congruential generators with modulus `m`, a full period, and "good lattice structure"; a sequence of `n`-dimensional points is then `[MLCG(i), MLCG(i+1), ..., MLCG(i+n-1)]` for each integer `i` in the interval \[1, `m`\] (L'Ecuyer 1999)<sup>[**(39)**](#Note39)</sup> (see example pseudocode below).
- Linear feedback shift register generators with good "uniformity" for Monte Carlo sampling (e.g., (Harase 2020)<sup>[**(40)**](#Note40)</sup>).
- If the sequence outputs numbers in the interval [0, 1], the [**Baker's map**](http://en.wikipedia.org/wiki/Baker's_map) of the sequence is `2 * (0.5-abs(x - 0.5))`, where `x` is each
number in the sequence.

&nbsp;

    METHOD MLCG(seed) // m = 262139
      if seed<=0: return error
      return rem(92717*seed,262139)/262139.0
    END METHOD

In most cases, RNGs can be used to generate a "seed" to start the low-discrepancy sequence at.

In Monte Carlo sampling, low-discrepancy sequences are often used to achieve more efficient "random" sampling.

<a id=Weighted_Choice_Involving_Real_Numbers></a>
### Weighted Choice Involving Real Numbers

In general, to implement weighted choice given a list of weights or cumulative weights expressed as real numbers, convert those weights to integers (see "[**Approximate Sampling for Discrete Distributions**](#Approximate_Sampling_for_Discrete_Distributions)"), then use those integers in the `WeightedChoice` or `CumulativeWeightedChoice` methods, as appropriate (see "[**Weighted Choice With Replacement**](#Weighted_Choice_With_Replacement)"). Those two methods could instead be modified by changing `value = RNDINTEXC(sum)` to `value = RNDRANGEMaxExc(0, sum)`, but this is more likely to introduce error.

<a id=Continuous_Weighted_Choice></a>
#### Continuous Weighted Choice

**Requires random real numbers.**

The continuous weighted choice method generates a random number that follows a continuous probability distribution (here, a [**_piecewise linear distribution_**](http://en.cppreference.com/w/cpp/numeric/random/piecewise_linear_distribution)).

The `ContinuousWeightedChoice` method (in the pseudocode below) takes two lists as follows:

- `values` is a list of numbers (which need not be integers). If the numbers are arranged in ascending order, which they should, the first number in this list can be returned exactly, but not the last number.
- `weights` is a list of weights for the given numbers (where each number and its weight have the same index in both lists).   The greater a number's weight, the more likely it is that a number close to that number will be chosen.  Each weight should be 0 or greater.

&nbsp;

    METHOD ContWChoose(values, weights, areas, value)
        wt=RNDU01OneExc()
        // Interpolate a number according to the given value
        i=0
        // Get the number corresponding to the random number
        runningValue = 0
        while i < size(values) - 1
         area = areas[i]
         if area > 0
          newValue = runningValue + area
          // NOTE: Includes start, excludes end
          if value < newValue
           w1=weights[i]
           w2=weights[i+1]
           diff=w2-w1
           wmin=min(w1, w2)
           wmax=max(w1, w2)
           interp=wt
           if diff!=0
              s=sqrt(wmax*wmax*wt+wmin*wmin-
                 wmin*wmin*wt)
              interp=abs((s-wmin)/diff)
              if diff<0: interp=1-interp
           end
           retValue = values[i] + (values[i + 1] - values[i]) *
              interp
           return retValue
          end
          runningValue = newValue
         end
         i = i + 1
        end
        // Last resort (might happen because rounding
        // error happened somehow)
        return values[size(values) - 1]
    END METHOD

    METHOD GatherAreas(values, weights, areas)
        // Get the sum of all areas between weights
        // NOTE: Kahan summation is more robust
        // than the naive summing given here
        msum = 0
        i = 0
        while i < size(values) - 1
          weightArea = abs((weights[i] + weights[i + 1]) * 0.5 *
                (values[i + 1] - values[i]))
          AddItem(areas, weightArea)
          msum = msum + weightArea
           i = i + 1
        end
        return msum
    END METHOD

    METHOD ContinuousWeightedChoice(values, weights)
        if size(values) <= 0 or
           size(weights) < size(values): return error
        if size(values) == 1: return values[0]
        areas = []
        msum = GatherAreas(values, weights, areas)
        // Generate random numbers
        value = RNDRANGEMaxExc(0, msum)
        return ContWChoose(values, weights, areas, value)
    END METHOD

> **Note:** The [**Python sample code**](https://peteroupc.github.io/randomgen.zip) contains a variant to the method
> above for returning more than one random number in one call.
>
> **Example**: Assume `values` is the following: `[0, 1, 2, 2.5, 3]`, and `weights` is the following: `[0.2, 0.8, 0.5, 0.3, 0.1]`.  The weight for 2 is 0.5, and that for 2.5 is 0.3.  Since 2 has a higher weight than 2.5, numbers near 2 are more likely to be chosen than numbers near 2.5 with the `ContinuousWeightedChoice` method.

<a id=Additional_Examples_Involving_Real_Numbers></a>
### Additional Examples Involving Real Numbers

**Requires random real numbers.**

<a id=Probabilities_As_Their_Digit_Expansions></a>
#### Probabilities As Their Digit Expansions

Probabilities can be expressed as a digit expansion (of the form `0.dddddd...`).

If the probability is a rational number, express it as a rational number (`n`/`d`) and use `ZeroToOne(n, d)` to generate 1 with probability `n`/`d` and 0 otherwise (a _Bernoulli trial_).

If the probability is an irrational number, such as `exp(-x/y)` or `log(2)`, then the digit expansion is infinite and can only be approximated.  In that case, assuming the probability is in \[0, 1], use the following algorithm to do a Bernoulli trial with that probability ((Brassard et al., 2015)<sup>[**(41)**](#Note41)</sup>; see also (Devroye 1986, p. 769)<sup>[**(14)**](#Note14)</sup>), where `BASE` is the digit base, such as 2 for binary or 10 for decimal:

    1. Set `u` to 0 and `k` to 1.
    2.  Set `u` to `(u * BASE) + RNDINTEXC(BASE)`.  Set `pk` to the `k` digits after the point in `p`'s digit expansion.  Example: If `p` is &pi;/4, `BASE` is 10, and `k` is 5, then `pk = 78539`.
    3.  If `pk + 1 <= u`, return 0.  If `pk - 2 >= u`, return 1.  If neither is the case, add 1 to `k` and go to step 2.

<a id=Random_Walks_Real_Numbers></a>
#### Random Walks (Real Numbers)

- One example of a white noise process is a list of `Normal(0, 1)` numbers (_Gaussian white noise_).
- If `STATEJUMP()` is `RNDRANGE(-1, 1)`, the random state is advanced by a random real number in the interval [-1, 1].
- A **continuous-time process** models random behavior at every moment, not just at discrete times.  There are two popular examples:
    - A _Wiener process_ has random states and jumps that are normally distributed (a process of this kind is also known as _Brownian motion_). For a random walk that follows a Wiener process, `STATEJUMP()` is `Normal(mu * timediff, sigma * sqrt(timediff))`, where  `mu` is the average value per time unit, `sigma` is the volatility, and `timediff` is the time difference between samples.  A _Brownian bridge_ (Revuz and Yor 1999)<sup>[**(42)**](#Note42)</sup> modifies a Wiener process as follows: For each time X, calculate `W(X) - W(E) * (X - S) / (E - S)`, where `S` and `E` are the starting and ending times of the process, respectively, and `W(X)` and `W(E)` are the state at times X and E, respectively.
    - In a _Poisson process_, the time between each event is its own exponential random number with its own rate parameter (e.g., `Expo(rate)`) (see "Exponential Distribution (Real Numbers)"), and sorting N random `RNDRANGE(x, y)` expresses N arrival times in the interval `[x, y]`. The process is _homogeneous_ if all the rates are the same, and _inhomogeneous_ if the rate can vary with the "timestamp" before each event jump; to generate arrival times here, potential arrival times are generated at the maximum possible rate (`maxrate`) and each one is accepted if `RNDRANGE(0, maxrate) < thisrate`, where `thisrate` is the rate for the given arrival time (Alexoupolos 2017)<sup>[**(43)**](#Note43)</sup>.

<a id=Mixtures_Real_Numbers></a>
#### Mixtures (Real Numbers)

Example 3 in "[**Mixtures of Distributions**](#Mixtures_of_Distributions)" can be adapted to nonoverlapping real number ranges by assigning weights `mx - mn` instead of `(mx - mn) + 1` and using `RNDRANGEMaxExc` instead of `RNDINTRANGE`.

<a id=Transformations_of_Random_Numbers_Real_Numbers></a>
#### Transformations of Random Numbers (Real Numbers)

1. Sampling a **Bates distribution** involves sampling _n_ random numbers by `RNDRANGE(minimum, maximum)`, then finding the mean of those numbers (strategy 8, mean; see the [**appendix**](#Mean_and_Variance_Calculation)).
2. A random point (`x`, `y`) can be transformed (strategy 9, geometric transformation) to derive a point with **correlated random** coordinates (old `x`, new `x`) as follows (see (Saucier 2000)<sup>[**(44)**](#Note44)</sup>, sec. 3.8): `[x, y*sqrt(1 - rho * rho) + rho * x]`, where `x` and `y` are independent random numbers generated the same way, and `rho` is a _correlation coefficient_ in the interval \[-1, 1\] (if `rho` is 0, `x` and `y` are uncorrelated).
3. It is reasonable to talk about sampling the sum of N random numbers, where N has a fractional part.  In this case, `ceil(N)` random numbers are generated and the last number is multiplied by that fractional part.  For example, to sample the sum of 2.5 random numbers, generate three random numbers, multiply the last by 0.5 (the fractional part of 2.5), then sum all three numbers.

<a id=Random_Numbers_from_a_Distribution_of_Data_Points></a>
### Random Numbers from a Distribution of Data Points

**Requires random real numbers.**

Generating random data points based on how a list of data points is distributed involves the field of **machine learning**: _fit a data model_ to the data points, then _predict_ a new data point based on that model, with randomness added to the mix.  Three kinds of data models, described below, serve this purpose. (How fitting works is outside the scope of this page.)

1. **Density estimation models.** [**Density estimation**](http://scikit-learn.org/stable/modules/density.html) models seek to describe the distribution of data points in a given data set, where areas with more points are more likely to be sampled.<sup>[**(45)**](#Note45)</sup> The following are examples.

    - **Histograms** are sets of one or more non-overlapping _bins_, which are generally of equal size.  Histograms are [**_mixtures_**](#Mixtures_of_Distributions), where each bin's weight is the number of data points in that bin.  After a bin is randomly chosen, a random data point that could fit in that bin is generated (that point need not be an existing data point).
    - **Gaussian** [**mixture models**](https://en.wikipedia.org/wiki/Mixture_model) are also mixtures, in this case, mixtures of one or more [**Gaussian (normal) distributions**](#Normal_Gaussian_Distribution).
    - **Kernel distributions** are mixtures of sampling distributions, one for each data point. Estimating a kernel distribution is called [**_kernel density estimation_**](https://en.wikipedia.org/wiki/Kernel_density_estimation).  To sample from a kernel distribution:
        1. Choose one of the numbers or points in the list at random [**with replacement**](#Sampling_With_Replacement_Choosing_a_Random_Item_from_a_List).
        2. Add a randomized "jitter" to the chosen number or point; for example, add a separately generated `Normal(0, sigma)` to the chosen number or each component of the chosen point, where `sigma` is the _bandwidth_<sup>[**(46)**](#Note46)</sup>.
    - **Stochastic interpolation** is described in (Saucier 2000)<sup>[**(44)**](#Note44)</sup>, sec. 5.3.4.  It involves choosing a data point at random, taking the mean of that point and its _k_ nearest neighbors, and shifting that mean by a random weighted sum<sup>[**(26)**](#Note26)</sup> of the differences between each of those points and that mean (here, the weight is `RNDRANGE((1-sqrt(k*3))/(k+1.0), (1+sqrt(k*3))/(k+1.0))` for each point). This approach assumes that the lowest and highest values of each dimension are 0 and 1, respectively, so that arbitrary data points have to be shifted and scaled accordingly.
    - **Fitting a known distribution** (such as the normal distribution), with unknown parameters, to data can be done by [**maximum likelihood estimation**](https://en.wikipedia.org/wiki/Maximum_likelihood_estimation), among other ways.  If several kinds of distributions are possible fitting choices, then the kind showing the best _goodness of fit_ for the data (e.g., chi-squared goodness of fit) is chosen.

2. **Regression models.** A _regression model_ is a model that summarizes data as a formula and an error term.  If an application has data in the form of inputs and outputs (e.g., monthly sales figures) and wants to sample a random but plausible output given a known input point (e.g., sales for a future month), then the application can fit and sample a regression model for that data.  For example, a _linear regression model_, which simulates the value of `y` given known inputs `a` and `b`, can be sampled as follows: `y = c1 * a + c2 * b + c3 + Normal(0, sqrt(mse))`, where `mse` is the mean squared error and `c1`, `c2`, and `c3` are the coefficients of the model.  (Here, `Normal(0, sqrt(mse))` is the error term.)

3. **Generative models.** These are machine learning models that take random numbers as input and generate outputs (such as images or sounds) that are similar to examples they have already seen.  [**_Generative adversarial networks_**](https://en.wikipedia.org/wiki/Generative_adversarial_network) are one kind of generative model.

> **Note:** If the existing data points each belong in one of several _categories_:
>
> - Choosing a random category could be done by choosing a random number weighted on the number of data points in each category (see "[**Weighted Choice**](#Weighted_Choice)").
> - Choosing a random data point _and_ its category could be done&mdash;
>     1. by choosing a random data point based on all the existing data points, then finding its category (e.g., via machine learning models known as _classification models_), or
>     2. by choosing a random category as given above, then by choosing a random data point based only on the existing data points of that category.

<a id=Random_Numbers_from_an_Arbitrary_Distribution></a>
### Random Numbers from an Arbitrary Distribution

**Requires random real numbers.**

Many probability distributions can be defined in terms of any of the following:

* The [**_cumulative distribution function_**](https://en.wikipedia.org/wiki/Cumulative_distribution_function), or _CDF_, returns, for each number, the probability that a number equal to or greater than that number is randomly chosen; the probability is in the interval [0, 1].
* The [**_probability density function_**](https://en.wikipedia.org/wiki/Probability_density_function), or _PDF_, is, roughly and intuitively, a curve of weights 0 or greater, where for each number, the greater its weight, the more likely a number close to that number is randomly chosen.  In this document, the area under the PDF need not equal 1.<sup>[**(47)**](#Note47)</sup> For discrete distributions, the PDF is more properly called _probability mass function_.
* The _inverse cumulative distribution function_ (_inverse CDF_ or _quantile function_) is the inverse of the CDF and maps numbers in the interval [0, 1\) to numbers in the distribution, from low to high.

The following sections show different ways to generate random numbers based on a distribution, depending on what is known about that distribution.

> **Notes:**
>
> 1. Lists of PDFs, CDFs, or inverse CDFs are outside the scope of this page.
> 2. In practice, the logarithm of the PDF (log-PDF) is sometimes used instead of the PDF to improve numerical stability.

<a id=Approximate_Sampling_for_Discrete_Distributions></a>
#### Approximate Sampling for Discrete Distributions

If the distribution **is discrete**<sup>[**(48)**](#Note48)</sup>, numbers that closely follow it can be sampled by choosing points that cover all or almost all of the distribution, finding their weights or cumulative weights, and choosing a random point based on those weights.

The pseudocode below shows the following methods that work with a **known PDF** (`PDF(x)`) or a **known CDF** (`CDF(x)`) that outputs floating-point numbers of the form  `FPSignificand` * `FPRadix`<sup>`FPExponent`</sup> (which include Java's `double` and `float`).<sup>[**(49)**](#Note49)</sup>

- `SampleFP(mini, maxi)` chooses a random number in [`mini`, `maxi`] based on a **known PDF**.  `InversionSampleFP` is similar, but is based on a **known CDF**; however, `SampleFP` should be used instead where possible.
- `IntegerWeightsFP(mini, maxi)` generates a list of integer weights for the interval [`mini`, `maxi`] based on a **known PDF**<sup>[**(50)**](#Note50)</sup>. (Alternatively, the weights could be approximated, such as by scaling and rounding [e.g., `round(PDF(i) * mult)`] or by using a more sophisticated algorithm (Saad et al., 2020)<sup>[**(51)**](#Note51)</sup>, but doing so can introduce error.)
- `IntegerCDFFP` is similar to `IntegerWeightsFP`, but generates cumulative weights based on a **known CDF**.
- `IntegerWeightsListFP` generates integer weights from a list of weights or cumulative weights expressed as floating-point numbers.

&nbsp;

    METHOD SampleFP(mini, maxi)
      weights=IntegerWeightsFP(mini, maxi)
      return mini + WeightedChoice(weights)
    END METHOD

    METHOD InversionSampleFP(mini, maxi)
      weights=IntegerCDFFP(mini, maxi)
      return mini + CWChoose(weights,
         weights[size(weights) - 1])
    END METHOD

    METHOD FPRatio(fp)
      expo=FPExponent(fp)
      sig=FPSignificand(fp)
      radix=FPRadix(fp)
      if expo>=0: return [sig * pow(radix, expo), 1]
      return [sig, pow(radix, abs(expo))]
    END METHOD

    METHOD NormalizeRatios(ratios)
      # NOTE: Assumes denominators are powers of the same base
      maxden=0
      for r in ratios: maxden=max(maxden, r[1])
      weights=[]
      for r in ratios: AddItem(weights, r[0]*floor(maxden/r[1]))
      return weights
    END METHOD

    METHOD IntegerWeightsFP(mini, maxi)
      ratios=[]
      for i in mini..maxi: AddItem(ratios, FPRatio(PDF(i)))
      return NormalizeRatios(ratios)
    END METHOD

    METHOD IntegerCDFFP(mini, maxi)
      ratios=[[0, 1]]
      for i in mini..maxi: AddItem(ratios, FPRatio(CDF(i)))
      return NormalizeRatios(ratios)
    END METHOD

    METHOD IntegerWeightsListFP(weights)
      ratios=[]
      for w in weights: AddItem(ratios, FPRatio(w))
      return NormalizeRatios(ratios)
    END METHOD

> **Note:** [**Python sample code**](https://peteroupc.github.io/randomgen.zip) includes an `integers_from_pdf` method that implements approximate sampling for discrete distributions.

<a id=Inverse_Transform_Sampling></a>
#### Inverse Transform Sampling

[**_Inverse transform sampling_**](https://en.wikipedia.org/wiki/Inverse_transform_sampling) is the most generic way to generate a random number that follows a distribution.

If the distribution **has a known inverse CDF**, generate `RNDU01()` and take the inverse CDF of that number.  If the uniform random number is in [0, 1) and was pregenerated, instead take the inverse CDF of that number.  (This will be exact only if the inverse CDF computes the exact value without rounding error.)

In most cases, however, the inverse CDF is not available.  Thus, it has to be approximated.  The following three methods approximate the inverse CDF given a uniform random number and additional information:

- `ICDFFromDiscretePDF(u01, mini, maxi)`: **PDF of discrete distribution**; interval [`mini`, `maxi`] that covers all or almost all of the distribution.
- `ICDFFromDiscreteCDF(u01, mini, maxi)`: **CDF of discrete distribution**; interval [`mini`, `maxi`].
- `ICDFFromContPDF(u01, mini, maxi, step)`: **PDF of continuous distribution**; interval [`mini`, `maxi`]; step size.

&nbsp;

    METHOD ICDFFromDiscretePDF(u01, mini, maxi)
      weights=[]
      sum=0
      for i in mini..maxi
        pv=PDF(i)
        AddItem(weights, pv)
        sum=sum + pv
      end
      return mini + WChoose(weights, u01 * sum)
    END METHOD

    METHOD ICDFFromDiscreteCDF(u01, mini, maxi)
      weights=[0]
      for i in mini..maxi: AddItem(weights, CDF(i))
      if weights[size(weights)-1]!=1: return error
      return mini + CWChoose(weights, u01)
    END METHOD

    METHOD SampleWeights(list, weights, mini, maxi, step)
       i = mini; while i < maxi
         AddItem(list, i)
         AddItem(weights, PDF(i))
         i = i + step
       end
       AddItem(list, maxi)
       AddItem(weights, PDF(maxi))
    END METHOD

    METHOD ICDFFromContPDF(u01, mini, maxi, step)
      values=[]
      weights=[]
      areas=[]
      SampleWeights(values, weights, mini, maxi, step)
      sum=GatherAreas(values, weights, areas)
      return ContWChoose(values, weights, areas, u01 * sum)
    END METHOD

> **Notes:**
>
> 1. If only percentiles of data (such as the median or 50th percentile, the minimum or 0th percentile, or the maximum or 100th percentile) are available, the inverse CDF can be approximated via those percentiles.  The Nth percentile corresponds to `ICDF(N/100.0)`.  Missing values of the inverse CDF can then be filled in by interpolation (such as spline fitting).  If the raw data points are available, see "[**Random Numbers from a Distribution of Data Points**](#Random_Numbers_from_a_Distribution_of_Data_Points)" instead.
> 2. In the [**Python sample code**](https://peteroupc.github.io/randomgen.zip), the `numbers_from_cdf` method, the `from_interp` method, and a `KVectorSampler` class<sup>[**(52)**](#Note52)</sup> use inversion to sample a random number given a **distribution's CDF**.  These are all approximations. For `from_interp`, the CDF is expressed as a list of input/output pairs.

<a id=Rejection_Sampling_with_a_PDF></a>
#### Rejection Sampling with a PDF

If the distribution **has a known PDF**, and the PDF can be more easily sampled by another distribution with its own PDF (`PDF2`) that "dominates" `PDF` in the sense that `PDF2(x) >= PDF(x)` at every valid `x`, then generate random numbers with that distribution until a number (`n`) that satisfies `PDF(n) >= RNDRANGEMaxExc(0, PDF2(n))` is generated this way (that is, sample points in `PDF2` until a point falls within `PDF`).

See also (von Neumann 1951)<sup>[**(29)**](#Note29)</sup>; (Devroye 1986)<sup>[**(14)**](#Note14)</sup>, pp. 41-43; "[**Rejection Sampling**](#Rejection_Sampling)"; and "[**Generating Pseudorandom Numbers**](https://mathworks.com/help/stats/generating-random-data.html)".

> **Examples:**
>
> 1. To sample a random number in the interval [`low`, `high`) from a PDF with a positive maximum value no greater than `peak` at that interval, generate `x = RNDRANGEMaxExc(low, high)` and `y = RNDRANGEMaxExc(0, peak)` until `y < PDF(x)`, then take the last `x` generated this way. (See also Saucier 2000, pp. 6-7.)  If the distribution **is discrete**, generate `x` with `x = RNDINTEXCRANGE(low, high)` instead.
> 2. A custom distribution's PDF, `PDF`, is `exp(-abs(x*x*x))`, and the exponential distribution's PDF, `PDF2`, is `exp(-x)`.  The exponential PDF "dominates" the other PDF (at every `x` 0 or greater) if we multiply it by 1.5, so that `PDF2` is now `1.5 * exp(-x)`.  Now we can generate numbers from our custom distribution by sampling exponential points until a point falls within `PDF`.  This is done by generating `n = Expo(1)` until `PDF(n) >= RNDRANGEMaxExc(0, PDF2(n))`.

<a id=Markov_Chain_Monte_Carlo></a>
#### Markov-Chain Monte Carlo

[**Markov-chain Monte Carlo**](https://en.wikipedia.org/wiki/Markov_chain_Monte_Carlo) (MCMC) is a family of algorithms for sampling many random numbers from a probability distribution by building a _Markov chain_ of random values that build on each other until they converge to the given distribution.  In general, however, these random numbers will have a statistical _dependence_ on each other.

Because it takes time to converge, random numbers from the first few (e.g., first 1000) iterations of MCMC are usually ignored ("burn in").  MCMC can also be used to find a suitable sampling range for approximating the distribution's inverse CDF (see earlier).

The [**Python sample code**](https://peteroupc.github.io/randomgen.zip) includes methods that implement two MCMC algorithms: `mcmc` and `mcmc2` implement _Metropolis&ndash;Hastings_ for PDFs that take single numbers or two-dimensional points, respectively, and a method called `slicesample` implements _slice sampling_.<sup>[**(53)**](#Note53)</sup>

Most MCMC algorithms **require knowing the distribution's PDF**, but _Gibbs sampling_<sup>[**(54)**](#Note54)</sup> is an exception.  This sampling technique involves repeatedly generating random numbers from two or more distributions, each of which uses a random number from the previous distribution (_conditional distributions_). The random numbers generated this way converge to the _joint distribution_ of those conditional distributions.

> **Example:** In one Gibbs sampler, an initial value for `y` is chosen, then multiple `x`, `y` pairs of random numbers are generated, where `x = BetaDist(y, 5)` then `y = Poisson(x * 10)`.

<a id=Specific_Distributions></a>
### Specific Distributions

**Requires random real numbers.**  This section shows algorithms to sample several popular non-uniform distributions.  Many of these algorithms evaluate irrational numbers, use transcendental functions, or do numerical approximations; as a result, they won't sample the given distribution _exactly_, but they may still be useful to applications that are willing to trade accuracy for speed.

<a id=Normal_Gaussian_Distribution></a>
#### Normal (Gaussian) Distribution

The [**_normal distribution_**](https://en.wikipedia.org/wiki/Normal_distribution) (also called the Gaussian distribution) takes the following two parameters:
- `mu` (&mu;) is the mean (average), or where the peak of the distribution's "bell curve" is.
- `sigma` (&sigma;), the standard deviation, affects how wide the "bell curve" appears. The
probability that a normally-distributed random number will be within one standard deviation from the mean is about 68.3%; within two standard deviations (2 times `sigma`), about 95.4%; and within three standard deviations, about 99.7%.  (Some publications give &sigma;<sup>2</sup>, or variance, rather than standard deviation, as the second parameter.  In this case, the standard deviation is the variance's square root.)

There are a number of methods for normal random number generation, including the following.  An application can combine some or all of these.

1. The ratio-of-uniforms method (given as `NormalRatioOfUniforms` below).
2. In the _Box&ndash;Muller transformation_, `mu + radius * cos(angle)` and `mu + radius * sin(angle)`, where `angle = RNDRANGEMaxExc(0, 2 * pi)` and `radius = sqrt(Expo(0.5)) * sigma`, are two independent normally-distributed random numbers.  The polar method (given as `NormalPolar` below) likewise produces two independent normal random numbers at a time.
3. An _approximation_ to a normal random number is the sum of twelve `RNDRANGEMaxExc(0, sigma)` numbers (see Note 13), subtracted by 6 * `sigma`. See `NormalCLT` below, which also includes an optional step to "warp" the random number for better accuracy (Kabal 2000/2019)<sup>[**(55)**](#Note55)</sup> See also [**"Irwin&ndash;Hall distribution" on Wikipedia**](https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution).
4. Methods that [**invert**](#Inverse_Transform_Sampling) the normal distribution's CDF, including those by Wichura, by Acklam, and by Luu (Luu 2016)<sup>[**(56)**](#Note56)</sup>.  See also [**"A literate program to compute the inverse of the normal CDF"**](https://www.johndcook.com/blog/normal_cdf_inverse/).
5. Karney's algorithm to sample exactly from the normal distribution, without using floating-point numbers (Karney 2014)<sup>[**(30)**](#Note30)</sup>.

In 2007, Thomas, D., et al. gave a survey of normal random number methods in "Gaussian Random Number Generators", _ACM Computing Surveys_ 39(4), 2007, article 11.

    METHOD NormalRatioOfUniforms(mu, sigma)
        while true
            a=RNDU01ZeroExc()
            b=RNDRANGE(0,sqrt(2.0/exp(1.0)))
            if b*b <= -a * a * 4 * ln(a)
              return (RNDINT(1) * 2 - 1) *
                (b * sigma / a) + mu
            end
        end
    END METHOD

    METHOD NormalPolar(mu, sigma)
      while true
        a = RNDU01ZeroExc()
        b = RNDU01ZeroExc()
        if RNDINT(1) == 0: a = 0 - a
        if RNDINT(1) == 0: b = 0 - b
        c = a * a + b * b
        if c != 0 and c <= 1
           c = sqrt(-ln(c) * 2 / c)
           return [a * mu * c + sigma, b * mu * c + sigma]
        end
      end
    END METHOD

    METHOD NormalCLT(mu, sigma)
      sum = 0
      for i in 0...12: sum=sum+RNDRANGEMaxExc(0, sigma)
      sum = sum - 6*sigma
      // Optional: "Warp" the sum for better accuracy
      ssq = sum * sum
      sum = ((((0.0000001141*ssq - 0.0000005102) *
                ssq + 0.00007474) *
                ssq + 0.0039439) *
                ssq + 0.98746) * sum
      return sum + mu
     end
    END METHOD

> **Note:** Methods implementing a variant of the normal distribution, the _discrete Gaussian distribution_, generate _integers_ that closely follow the normal distribution.  Examples include the one in (Karney 2014)<sup>[**(30)**](#Note30)</sup>, as well as so-called "constant-time" methods such as (Micciancio and Walter 2017)<sup>[**(57)**](#Note57)</sup> that are used above all in _lattice-based cryptography_.

<a id=Gamma_Distribution></a>
#### Gamma Distribution

The following method generates a random number that follows a _gamma distribution_ and is based on Marsaglia and Tsang's method from 2000<sup>[**(58)**](#Note58)</sup>.  Usually, the number expresses either&mdash;

- the lifetime (in days, hours, or other fixed units) of a random component with an average lifetime of `meanLifetime`, or
- a random amount of time (in days, hours, or other fixed units) that passes until as many events as `meanLifetime` happen.

Here, `meanLifetime` must be an integer or noninteger greater than 0, and `scale` is a scaling parameter that is greater than 0, but usually 1.

    METHOD GammaDist(meanLifetime, scale)
        // Needs to be greater than 0
        if meanLifetime <= 0 or scale <= 0: return error
        // Exponential distribution special case if
        // `meanLifetime` is 1 (see also (Devroye 1986), p. 405)
        if meanLifetime == 1: return Expo(1.0 / scale)
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
           ret = ret * pow(RNDU01(), 1.0 / meanLifetime)
        end
        return ret * scale
    END METHOD

Distributions based on the gamma distribution:

- **3-parameter gamma distribution**: `pow(GammaDist(a, 1), 1.0 / c) * b`, where `c` is another shape parameter.
- **4-parameter gamma distribution**: `pow(GammaDist(a, 1), 1.0 / c) * b + d`, where `d` is the minimum value.
- **Erlang distribution**: `GammaDist(n, 1.0 / lamda)`.  Returns a number that simulates a sum of `n` exponential random numbers with the given `lamda` parameter.

<a id=Beta_Distribution></a>
#### Beta Distribution

The beta distribution is a bounded distribution; its two parameters, `a` and `b`, are both greater than 0 and describe the distribution's shape.  Depending on `a` and `b`, the shape can be a smooth peak or a smooth valley.

The following method generates a random number that follows a _beta distribution_, in the interval [0, 1).

    METHOD BetaDist(a, b)
      if b==1 and a==1: return RNDU01()
      // Min-of-uniform
      if a==1: return 1.0-pow(RNDU01(),1.0/b)
      // Max-of-uniform.  Use only if a is small to
      // avoid accuracy problems, as pointed out
      // by Devroye 1986, p. 675.
      if b==1 and a < 10: return pow(RNDU01(),1.0/a)
      x=GammaDist(a,1)
      return x/(x+GammaDist(b,1))
    END METHOD

<a id=Poisson_Distribution_Optimization_for_Large_Mean></a>
#### Poisson Distribution: Optimization for Large Mean

The following method generates a Poisson random number given the mean (&lambda;), which is a real number.  For means greater than 9, uses a method from (Ahrens and Dieter 1974)<sup>[**(59)**](#Note59)</sup>

    METHOD Poisson(mean)
        if mean < 0: return error
        if mean == 0: return 0
        count = 0
        while mean > 9
            n = floor(mean * 0.875)
            g = GammaDist(n, 1)
            if g > mean: return count + Binomial(n - 1, mean / g)
            mean = mean - g
            count = count + n
        end
        // Base case uses generator found in Devroye
        // 1986, p. 504.
        s = 0
        while true
           sum = sum + Expo(1)
           if sum >= mean: return count
           count = count + 1
        end
    END METHOD

<a id=von_Mises_Distribution></a>
#### von Mises Distribution

The _von Mises distribution_ describes a distribution of circular angles and uses two parameters: `mean` is the mean angle and `kappa` is a shape parameter.  The distribution is uniform at `kappa = 0` and approaches a normal distribution with increasing `kappa`.

The algorithm below generates a random number from the von Mises distribution, and is based on the Best&ndash;Fisher algorithm from 1979 (as described in (Devroye 1986)<sup>[**(14)**](#Note14)</sup> with errata incorporated).

    METHOD VonMises(mean, kappa)
        if kappa < 0: return error
        if kappa == 0
            return RNDRANGEMinMaxExc(mean-pi, mean+pi)
        end
        r = 1.0 + sqrt(4 * kappa * kappa + 1)
        rho = (r - sqrt(2 * r)) / (kappa * 2)
        s = (1 + rho * rho) / (2 * rho)
        while true
            u = RNDRANGEMaxExc(-pi, pi)
            v = RNDU01ZeroOneExc()
            z = cos(u)
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
#### Stable Distribution

As more and more independent random numbers, generated the same way, are added together, their distribution tends to a [**_stable distribution_**](https://en.wikipedia.org/wiki/Stable_distribution), which resembles a curve with a single peak, but with generally "fatter" tails than the normal distribution.  The pseudocode below uses the Chambers&ndash;Mallows&ndash;Stuck algorithm.  The `Stable` method, implemented below, takes two parameters:

- `alpha` is a stability index in the interval (0, 2].
- `beta` is a skewness in the interval [-1, 1]; if `beta` is 0, the curve is symmetric.

&nbsp;

    METHOD Stable(alpha, beta)
        if alpha <=0 or alpha > 2: return error
        if beta < -1 or beta > 1: return error
        halfpi = pi * 0.5
        unif=RNDRANGEMinMaxExc(-halfpi, halfpi)
        c=cos(unif)
        if alpha == 1
           s=sin(unif)
           if beta == 0: return s/c
           expo=Expo(1)
           return 2.0*((unif*beta+halfpi)*s/c -
             beta * ln(halfpi*expo*c/(unif*beta+halfpi)))/pi
        else
           z=-tan(alpha*halfpi)*beta
           ug=unif+atan2(-z, 1)/alpha
           cpow=pow(c, -1.0 / alpha)
           return pow(1.0+z*z, 1.0 / (2*alpha))*
              (sin(alpha*ug)*cpow)*
              pow(cos(unif-alpha*ug)/expo, (1.0 - alpha) / alpha)
        end
    END METHOD

Derived from the stable distribution:

- **Four-parameter stable distribution**: `Stable(alpha, beta) * sigma + mu`, where `mu` is the mean and ` sigma` is the scale.  If `alpha` and `beta` are 1, the result is a **Landau distribution**.
- **"Type 0" stable distribution**: `Stable(alpha, beta) * sigma + (mu - sigma * beta * x)`, where `x` is `ln(sigma)*2.0/pi` if `alpha` is 1, and `tan(pi*0.5*alpha)` otherwise.

<a id=Multivariate_Normal_Multinormal_Distribution></a>
#### Multivariate Normal (Multinormal) Distribution

The following pseudocode calculates a random point in space that follows a [**_multivariate normal (multinormal) distribution_**](https://en.wikipedia.org/wiki/Multivariate_normal_distribution).  The method `MultivariateNormal` takes the following parameters:

- A list, `mu` (&mu;), which indicates the means to add to the random point's components. `mu` can be `nothing`, in which case each component will have a mean of zero.
- A list of lists `cov`, that specifies a _covariance matrix_ (&Sigma;, a symmetric positive definite N&times;N matrix, where N is the number of components of the random point).

&nbsp;

    METHOD Decompose(matrix)
      numrows = size(matrix)
      if size(matrix[0])!=numrows: return error
      // Does a Cholesky decomposition of a matrix
      // assuming it's positive definite and invertible
      ret=NewList()
      for i in 0...numrows
        submat = NewList()
        for j in 0...numrows: AddItem(submat, 0)
        AddItem(ret, submat)
      end
      s1 = sqrt(matrix[0][0])
      if s1==0: return ret // For robustness
      for i in 0...numrows
        ret[0][i]=matrix[0][i]*1.0/s1
      end
      for i in 0...numrows
        msum=0.0
        for j in 0...i: msum = msum + ret[j][i]*ret[j][i]
        sq=matrix[i][i]-msum
        if sq<0: sq=0 // For robustness
        ret[i][i]=math.sqrt(sq)
      end
      for j in 0...numrows
        for i in (j + 1)...numrows
          // For robustness
          if ret[j][j]==0: ret[j][i]=0
          if ret[j][j]!=0
            msum=0
            for k in 0...j: msum = msum + ret[k][i]*ret[k][j]
            ret[j][i]=(matrix[j][i]-msum)*1.0/ret[j][j]
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
      vars=NewList()
      for j in 0...mulen: AddItem(vars, Normal(0, 1))
      while i<mulen
        nv=Normal(0,1)
        msum = 0
        if mu == nothing: msum=mu[i]
        for j in 0...mulen: msum=msum+vars[j]*cho[j][i]
        AddItem(ret, msum)
        i=i+1
      end
      return ret
    end

> **Note:** The [**Python sample code**](https://peteroupc.github.io/randomgen.zip) contains a variant of this
> method for generating multiple random points in one call.
>
> **Examples:**
>
> 1. A **binormal distribution** (two-variable multinormal distribution) can be sampled using the following idiom: `MultivariateNormal([mu1, mu2], [[s1*s1, s1*s2*rho], [rho*s1*s2, s2*s2]])`, where `mu1` and `mu2` are the means of the two normal random numbers, `s1` and `s2` are their standard deviations, and `rho` is a _correlation coefficient_ greater than -1 and less than 1 (0 means no correlation).
> 2. A **log-multinormal distribution** can be sampled by generating numbers from a multinormal distribution, then applying `exp(n)` to the resulting numbers, where `n` is each number generated this way.
> 3. A **Beckmann distribution** is the norm of a binormal random pair (that is, a random binormally-distributed point; for norm, see the appendix).
> 4. A **Rice (Rician) distribution** is a Beckmann distribution in which the binormal random pair is generated with `m1 = m2 = a / sqrt(2)`, `rho = 0`, and `s1 = s2 = b`, where `a` and `b` are the parameters to the Rice distribution.
> 5. A **Rice&ndash;Norton distributed** random number is the norm (see the appendix) of the following point: `MultivariateNormal([v,v,v],[[w,0,0],[0,w,0],[0,0,w]])`, where `v = a/sqrt(m*2)`, `w = b*b/m`, and `a`, `b`, and `m` are the parameters to the Rice&ndash;Norton distribution.
> 6. A **standard [**complex normal distribution**](https://en.wikipedia.org/wiki/Complex_normal_distribution)** is a binormal distribution in which the binormal random pair is generated with `s1 = s2 = sqrt(0.5)` and `mu1 = mu2 = 0` and treated as the real and imaginary parts of a complex number.

<a id=Random_Real_Numbers_with_a_Given_Positive_Sum></a>
#### Random Real Numbers with a Given Positive Sum

Generating _n_ `GammaDist(total, 1)` numbers and dividing them by their sum<sup>[**(26)**](#Note26)</sup>
 will result in _n_ uniform random numbers that (approximately) sum to `total`, in random order (see a [**Wikipedia article**](https://en.wikipedia.org/wiki/Dirichlet_distribution#Gamma_distribution)).  For example, if `total` is 1, the numbers will (approximately) sum to 1.  Note that in the exceptional case that all numbers are 0, the process should repeat.

> **Notes:**
>
> 1. Notes 1 and 2 in the section "Random Integers with a Given Positive Sum" apply here.
> 2. The **Dirichlet distribution**, as defined in some places (e.g., _Mathematica_; (Devroye 1986)<sup>[**(14)**](#Note14)</sup>, p. 593-594), can be sampled by generating _n_+1 random [**gamma-distributed**](#Gamma_Distribution) numbers, each with separate parameters, taking their sum<sup>[**(26)**](#Note26)</sup>, dividing them by that sum, and taking the first _n_ numbers. (The _n_+1 numbers sum to 1, but the Dirichlet distribution models the first _n_ of them, which will generally sum to less than 1.)

<a id=Gaussian_and_Other_Copulas></a>
#### Gaussian and Other Copulas

A _copula_ is a way to describe the dependence between random numbers.

One example is a _Gaussian copula_; this copula is sampled by sampling from a [**multinormal distribution**](#Multivariate_Normal_Multinormal_Distribution), then converting the resulting numbers to _dependent_ uniform random numbers. In the following pseudocode, which implements a Gaussian copula:

- The parameter `covar` is the covariance matrix for the multinormal distribution.
- `erf(v)` is the [**error function**](https://en.wikipedia.org/wiki/Error_function) of the number `v` (see the appendix).

&nbsp;

    METHOD GaussianCopula(covar)
       mvn=MultivariateNormal(nothing, covar)
       for i in 0...size(covar)
          // Apply the normal distribution's CDF
          // to get uniform random numbers
          mvn[i] = (erf(mvn[i]/(sqrt(2)*sqrt(covar[i][i])))+1)*0.5
       end
       return mvn
    END METHOD

Each of the resulting uniform random numbers will be in the interval [0, 1], and each one can be further transformed to any other probability distribution (which is called a _marginal distribution_ here) by passing the uniform number to the distribution's inverse CDF (see "[**Inverse Transform Sampling**](#Inverse_Transform_Sampling)", and see also Cario and Nelson 1997.)

> **Examples:**
>
> 1. To generate two dependent uniform random numbers with a Gaussian copula, generate `GaussianCopula([[1, rho], [rho, 1]])`, where `rho` is the Pearson correlation coefficient, in the interval [-1, 1]. (Other correlation coefficients besides `rho` exist. For example, for a two-variable Gaussian copula, the [**Spearman correlation coefficient**](https://en.wikipedia.org/wiki/Rank_correlation) `srho` can be converted to `rho` by `rho = sin(srho * pi / 6) * 2`.  Other correlation coefficients are not further discussed in this document.)
> 2. The following example generates two random numbers that follow a Gaussian copula with exponential marginals (`rho` is the Pearson correlation coefficient, and `rate1` and `rate2` are the rates of the two exponential marginals).
>
>         METHOD CorrelatedExpo(rho, rate1, rate2)
>            copula = GaussianCopula([[1, rho], [rho, 1]])
>            // Transform to exponentials using that
>            // distribution's inverse CDF
>            return [-logp1(-copula[0]) / rate1,
>              -logp1(-copula[1]) / rate2]
>         END METHOD

Other kinds of copulas describe different kinds of dependence between random numbers.  Examples of other copulas are&mdash;

- the **Fr&eacute;chet&ndash;Hoeffding upper bound copula** _\[x, x, ..., x\]_ (e.g., `[x, x]`), where `x = RNDU01()`,
- the **Fr&eacute;chet&ndash;Hoeffding lower bound copula** `[x, 1.0 - x]` where `x = RNDU01()`,
- the **product copula**, where each number is a separately generated `RNDU01()` (indicating no dependence between the numbers), and
- the **Archimedean copulas**, described by M. Hofert and M. M&auml;chler (2011)<sup>[**(60)**](#Note60)</sup>.

<a id=Index_of_Non_Uniform_Distributions></a>
### Index of Non-Uniform Distributions

**Many distributions here require random real numbers.**

A &dagger; symbol next to a distribution means the random number can be shifted by a location parameter (`mu`) then scaled by a scale parameter greater than 0 (`sigma`).  Example: `num * sigma + mu`.

A &#2b26; symbol next to a distribution means the random number can be scaled to any range, which is given with the minimum and maximum values `mini` and `maxi`.  Example: `mini + (maxi - mini) * num`.

Most commonly used:

<small>

- **Beta distribution**: See [**Beta Distribution**](#Beta_Distribution).
- **Binomial distribution**: See [**Binomial Distribution**](#Binomial_Distribution).
- **Binormal distribution**: See [**Multivariate Normal (Multinormal) Distribution**](#Multivariate_Normal_Multinormal_Distribution).
- **Cauchy (Lorentz) distribution**&dagger;:  `Stable(1, 0)`.  This distribution is similar to the normal distribution, but with "fatter" tails. Alternative algorithm mentioned in (McGrath and Irving 1975)<sup>[**(61)**](#Note61)</sup>: Generate `x = RNDU01ZeroExc()` and `y = RNDRANGE(-1, 1)` until `x * x + y * y <= 1`, then generate `y / x`.
- **Chi-squared distribution**: `GammaDist(df * 0.5 + Poisson(sms * 0.5), 2)`, where `df` is the number of degrees of freedom and `sms` is the sum of mean squares (where `sms` other than 0 indicates a _noncentral_ distribution).
- **Dice**: See [**Dice**](#Dice).
- **Exponential distribution**: See [**Exponential Distribution**](#Exponential_Distribution).
- **Extreme value distribution**: See generalized extreme value distribution.
- **Gamma distribution**: See [**Gamma Distribution**](#Gamma_Distribution).
- **Gaussian distribution**: See [**Normal (Gaussian) Distribution**](#Normal_Gaussian_Distribution).
- **Geometric distribution**: See [**Geometric Distribution**](#Geometric_Distribution).
- **Gumbel distribution**: See generalized extreme value distribution.
- **Inverse gamma distribution**: `b / GammaDist(a, 1)`, where `a` and `b` have the
 same meaning as in the gamma distribution.  Alternatively, `1.0 / (pow(GammaDist(a, 1), 1.0 / c) / b + d)`, where `c` and `d` are shape and location parameters, respectively.
- **Laplace (double exponential) distribution**&dagger;: `(Expo(1) - Expo(1))`.
- **Logarithmic distribution**&#2b26;: `RNDU01OneExc() * RNDU01OneExc()` (Saucier 2000, p. 26).  In this distribution, lower numbers are exponentially more likely than higher numbers.
- **Logarithmic normal distribution**: `exp(Normal(mu, sigma))`, where `mu` and `sigma` are the underlying normal distribution's parameters.
- **Multinormal distribution**: See multivariate normal distribution.
- **Multivariate normal distribution**: See [**Multivariate Normal (Multinormal) Distribution**](#Multivariate_Normal_Multinormal_Distribution).
- **Normal distribution**: See [**Normal (Gaussian) Distribution**](#Normal_Gaussian_Distribution).
- **Poisson distribution**: See [**Poisson Distribution**](#Poisson_Distribution).
- **Pareto distribution**: `pow(RNDU01ZeroOneExc(), -1.0 / alpha) * minimum`, where `alpha`  is the shape and `minimum` is the minimum.
- **Rayleigh distribution**&dagger;: `sqrt(Expo(0.5))`.  If the scale parameter (`sigma`) follows a logarithmic normal distribution, the result is a _Suzuki distribution_.
- **Standard normal distribution**&dagger;: `Normal(0, 1)`.  See also [**Normal (Gaussian) Distribution**](#Normal_Gaussian_Distribution).
- **Student's _t_-distribution**: `Normal(cent, 1) / sqrt(GammaDist(df * 0.5, 2 / df))`, where `df` is the number of degrees of freedom, and _cent_ is the mean of the normally-distributed random number.  A `cent` other than 0 indicates a _noncentral_ distribution.
- **Triangular distribution**:
   - **Generalized** (Kabal 2000/2019)<sup>[**(55)**](#Note55)</sup>: `alpha * min(startpt, endpt) + alpha * max(startpt, endpt)`.  The distribution starts at `startpt` and ends at `endpt`.
   - As used in _Mathematica_: `x * min(startpt, endpt) + x * max(startpt, endpt)` where `x = (midpt - startpt)/(endpt - startpt)`.
- **Weibull distribution**: See generalized extreme value distribution.

</small>

Miscellaneous:

<small>

- **3-parameter gamma distribution**: See [**Gamma Distribution**](#Gamma_Distribution).
- **4-parameter gamma distribution**: See [**Gamma Distribution**](#Gamma_Distribution).
- **4-parameter stable distribution**: See [**Stable Distribution**](#Stable_Distribution).
- **Archimedean copulas**: See [**Gaussian and Other Copulas**](#Gaussian_and_Other_Copulas).
- **Arcsine distribution**&#2b26;: `BetaDist(0.5, 0.5)` (Saucier 2000, p. 14).
- **Bates distribution**: See [**Transformations of Random Numbers: Additional Examples**](#Transformations_of_Random_Numbers_Additional_Examples).
- **Beckmann distribution**: See [**Multivariate Normal (Multinormal) Distribution**](#Multivariate_Normal_Multinormal_Distribution).
- **Beta binomial distribution**: `Binomial(trials, BetaDist(a, b))`, where `a` and `b` are
 the two parameters of the beta distribution, and `trials` is a parameter of the binomial distribution.
- **Beta negative binomial distribution**: `NegativeBinomial(successes, BetaDist(a, b))`, where `a` and `b` are the two parameters of the beta distribution, and `successes` is a parameter of the negative binomial distribution. If _successes_ is 1, the result is a _Waring&ndash;Yule distribution_. A _Yule&ndash;Simon distribution_ results if _successes_ and _b_ are both 1 (e.g., in _Mathematica_) or if _successes_ and _a_ are both 1 (in other works).
- **Beta-PERT distribution**: `startpt + size * BetaDist(1.0 + (midpt - startpt) * shape / size, 1.0 + (endpt - midpt) * shape / size)`. The distribution starts  at `startpt`, peaks at `midpt`, and ends at `endpt`, `size` is `endpt - startpt`, and `shape` is a shape parameter that's 0 or greater, but usually 4.  If the mean (`mean`) is known rather than the peak, `midpt = 3 * mean / 2 - (startpt + endpt) / 4`.
- **Beta prime distribution**&dagger;: `pow(GammaDist(a, 1), 1.0 / alpha) / pow(GammaDist(b, 1), 1.0 / alpha)`, where `a`, `b`, and `alpha` are shape parameters. If _a_ is 1, the result is a _Singh&ndash;Maddala distribution_; if _b_ is 1, a _Dagum distribution_; if _a_ and _b_ are both 1, a _logarithmic logistic distribution_.
- **Birnbaum&ndash;Saunders distribution**: `pow(sqrt(4+x*x)+x,2)/(4.0*lamda)`, where `x = Normal(0,gamma)`, `gamma` is a shape parameter, and `lamda` is a scale parameter.
- **Chi distribution**: Square root of a chi-squared random number.  See chi-squared distribution.
- **Compound Poisson distribution**: See [**Transformations of Random Numbers: Additional Examples**](#Transformations_of_Random_Numbers_Additional_Examples).
- **Cosine distribution**&#2b26;: `atan2(x, sqrt(1 - x * x)) / pi`, where `x = RNDRANGE(-1, 1)` (Saucier 2000, p. 17; inverse sine replaced with `atan2` equivalent).
- **Dagum distribution**: See beta prime distribution.
- **Dirichlet distribution**: See [**Random Real Numbers with a Given Positive Sum**](#Random_Real_Numbers_with_a_Given_Positive_Sum).
- **Double logarithmic distribution**&#2b26;: `(0.5 + (RNDINT(1) * 2 - 1) * 0.5 * RNDU01OneExc() * RNDU01OneExc())` (see also Saucier 2000, p. 15, which shows the wrong X axes).
- **Erlang distribution**: See [**Gamma Distribution**](#Gamma_Distribution).
- **Estoup distribution**: See zeta distribution.
- **Exponential power distribution** (generalized normal distribution version 1): `(RNDINT(1) * 2 - 1) * pow(GammaDist(1.0/a, 1), a)`, where `a` is a shape parameter.
- **Extended xgamma distribution** (Saha et al. 2019)<sup>[**(62)**](#Note62)</sup>: `GammaDist(alpha + x, theta)`, where `x` is 0 if `RNDU01() <= theta/(theta+beta)` and 2 otherwise, and where `alpha`, `theta`, and `beta` are shape parameters.  If `alpha = 0`, the result is an **xgamma distribution** (Sen et al., 2016)<sup>[**(63)**](#Note63)</sup>.
- **Fr&eacute;chet distribution**: See generalized extreme value distribution.
- **Fr&eacute;chet&ndash;Hoeffding lower bound copula**: See [**Gaussian and Other Copulas**](#Gaussian_and_Other_Copulas).
- **Fr&eacute;chet&ndash;Hoeffding upper bound copula**: See [**Gaussian and Other Copulas**](#Gaussian_and_Other_Copulas).
- **Gaussian copula**: See [**Gaussian and Other Copulas**](#Gaussian_and_Other_Copulas).
- **Generalized extreme value (Fisher&ndash;Tippett or generalized maximum value) distribution (`GEV(c)`)**&dagger;: `(pow(Expo(1), -c) - 1) / c` if `c != 0`, or `-ln(Expo(1))` otherwise, where `c` is a shape parameter. Special cases:
    - The negative of the result expresses a generalized minimum value.  In this case, a parameter of `c = 0` results in a _Gumbel distribution_.
    - A parameter of `c = 0` results in an _extreme value distribution_.
    - **Weibull distribution**: `1 - 1.0/a * GEV(-1.0/a)` (or `pow(Expo(1), 1.0/a)`), where `a` is a shape parameter.
    - **Fr&eacute;chet distribution**: `1 + 1.0/a * GEV(1.0/a)` (or `pow(Expo(1), -1.0/a)`), where `a` is a shape parameter.
- **Generalized Tukey lambda distribution**: `(s1 * (pow(x, lamda1)-1.0)/lamda1 - s2 * (pow(1.0-x, lamda2)-1.0)/lamda2) + loc`, where `x` is `RNDU01()`, `lamda1` and `lamda2` are shape parameters, `s1` and `s2` are scale parameters, and `loc` is a location parameter.
- **Half-normal distribution**. Parameterizations include:
    - _Mathematica_: `abs(Normal(0, sqrt(pi * 0.5) / invscale)))`, where `invscale` is a parameter of the half-normal distribution.
    - MATLAB: `abs(Normal(mu, sigma)))`, where `mu` and `sigma` are the underlying normal distribution's parameters.
- **Hyperexponential distribution**: See [**Mixtures of Distributions**](#Mixtures_of_Distributions).
- **Hypergeometric distribution**: See [**Hypergeometric Distribution**](#Hypergeometric_Distribution).
- **Hypoexponential distribution**: See [**Transformations of Random Numbers**](#Transformations_of_Random_Numbers).
- **Inverse chi-squared distribution**&dagger;: `df / (GammaDist(df * 0.5, 2))`, where `df` is the number of degrees of freedom.  The scale parameter (`sigma`) is usually `1.0 / df`.
- **Inverse Gaussian distribution (Wald distribution)**: Generate `n = mu + (mu*mu*y/(2*lamda)) - mu * sqrt(4 * mu * lamda * y + mu * mu * y * y) / (2 * lamda)`, where `y = pow(Normal(0, 1), 2)`, then return `n` if `RNDU01OneExc() <= mu / (mu + n)`, or `mu * mu / n` otherwise. `mu` is the mean and `lamda` is the scale; both parameters are greater than 0. Based on method published in (Devroye 1986)<sup>[**(14)**](#Note14)</sup>.
- **`k`th-order statistic distribution**: `BetaDist(k, n+1-k)`. Returns the `k`th smallest out of `n` uniform random numbers. See also (Devroye 1986, p. 210)<sup>[**(14)**](#Note14)</sup>.
- **Kumaraswamy distribution**&#2b26;: `pow(1-pow(RNDU01ZeroExc(),1.0/b),1.0/a)`, where `a` and `b` are shape parameters.
- **Landau distribution**: See [**Stable Distribution**](#Stable_Distribution).
- **L&eacute;vy distribution**&dagger;: `0.5 / GammaDist(0.5, 1)`.  The scale parameter (`sigma`) is also called dispersion.
- **Logarithmic logistic distribution**: See beta prime distribution.
- **Logarithmic series distribution**: `floor(1.0 - Expo(log1p(-pow(1.0 - param, RNDU01ZeroOneExc()))))`, where `param` is a number greater than 0 and less than 1. Based on method described in (Devroye 1986)<sup>[**(14)**](#Note14)</sup>.
- **Logistic distribution**&dagger;: `(ln(x)-log1p(-x))` ([**_logit function_**](http://timvieira.github.io/blog/post/2016/07/04/fast-sigmoid-sampling/)), where `x` is `RNDU01ZeroOneExc()`.
- **Log-multinormal distribution**: See [**Multivariate Normal (Multinormal) Distribution**](#Multivariate_Normal_Multinormal_Distribution).
- **Max-of-uniform distribution**: `BetaDist(n, 1)`.  Returns a number that simulates the largest out of `n` uniform random numbers.  See also (Devroye 1986, p. 675)<sup>[**(14)**](#Note14)</sup>.
- **Maxwell distribution**&dagger;: `sqrt(GammaDist(1.5, 2))`.
- **Min-of-uniform distribution**: `BetaDist(1, n)`.  Returns a number that simulates the smallest out of `n` uniform random numbers.  See also (Devroye 1986, p. 210)<sup>[**(14)**](#Note14)</sup>.
- **Moyal distribution**: See the [**Python sample code**](https://peteroupc.github.io/randomgen.zip).
- **Multinomial distribution**: See [**Multinomial Distribution**](#Multinomial_Distribution).
- **Multivariate Poisson distribution**: See the [**Python sample code**](https://peteroupc.github.io/randomgen.zip).
- **Multivariate _t_-copula**: See the [**Python sample code**](https://peteroupc.github.io/randomgen.zip).
- **Multivariate _t_-distribution**: See the [**Python sample code**](https://peteroupc.github.io/randomgen.zip).
- **Negative binomial distribution** (`NegativeBinomial(successes, p)`): See [**Negative Binomial Distribution**](#Negative_Binomial_Distribution).  The negative binomial distribution can take a `successes` value other than an integer; in that case, a negative binomial (`successes`, `p`) random number is `Poisson(GammaDist(successes, (1 - p) / p))`.
- **Negative multinomial distribution**: See the [**Python sample code**](https://peteroupc.github.io/randomgen.zip).
- **Noncentral beta distribution**&#2b26;: `BetaDist(a + Poisson(nc), b)`, where `nc` (a noncentrality), `a`, and `b` are greater than 0.
- **Parabolic distribution**&#2b26;: `BetaDist(2, 2)` (Saucier 2000, p. 30).
- **Pascal distribution**: `NegativeBinomial(successes, p) + successes`, where `successes` and `p` have the same meaning as in the negative binomial distribution, except `successes` is always an integer.
- **Pearson VI distribution**: `GammaDist(v, 1) / GammaDist(w, 1)`, where `v` and `w` are shape parameters greater than 0 (Saucier 2000, p. 33; there, an additional `b` parameter is defined, but that parameter is canceled out in the source code).
- **Piecewise constant distribution**: See [**Weighted Choice With Replacement**](#Weighted_Choice_With_Replacement).
- **Piecewise linear distribution**: See [**Continuous Weighted Choice**](#Continuous_Weighted_Choice).
- **P&oacute;lya&ndash;Aeppli distribution**: See [**Transformations of Random Numbers: Additional Examples**](#Transformations_of_Random_Numbers_Additional_Examples).
- **Power distribution**: `pow(RNDU01ZeroOneExc(), 1.0 / alpha) / b`, where `alpha`  is the shape and `b` is the domain.  Nominally in the interval (0, 1).
- **Power law distribution**: `pow(RNDRANGE(pow(mn,n+1),pow(mx,n+1)), 1.0 / (n+1))`, where `n`  is the exponent, `mn` is the minimum, and `mx` is the maximum.  [**Reference**](http://mathworld.wolfram.com/RandomNumber.html).
- **Power lognormal distribution**: See the [**Python sample code**](https://peteroupc.github.io/randomgen.zip).
- **Power normal distribution**: See the [**Python sample code**](https://peteroupc.github.io/randomgen.zip).
- **Product copula**: See [**Gaussian and Other Copulas**](#Gaussian_and_Other_Copulas).
- **Rice distribution**: See [**Multivariate Normal (Multinormal) Distribution**](#Multivariate_Normal_Multinormal_Distribution).
- **Rice&ndash;Norton distribution**: See [**Multivariate Normal (Multinormal) Distribution**](#Multivariate_Normal_Multinormal_Distribution).
- **Singh&ndash;Maddala distribution**: See beta prime distribution.
- **Skellam distribution**: `Poisson(mean1) - Poisson(mean2)`, where `mean1` and `mean2` are the means of the two Poisson random numbers.
- **Skewed normal distribution**: `Normal(0, x) + mu + alpha * abs(Normal(0, x))`, where `x` is `sigma / sqrt(alpha * alpha + 1.0)`, `mu` and `sigma` have the same meaning as in the normal distribution, and `alpha` is a shape parameter.
- **Snedecor's (Fisher's) _F_-distribution**: `GammaDist(m * 0.5, n) / (GammaDist(n * 0.5 + Poisson(sms * 0.5)) * m, 1)`, where `m` and `n` are the numbers of degrees of freedom of two random numbers with a chi-squared distribution, and if `sms` is other than 0, one of those distributions is _noncentral_ with sum of mean squares equal to `sms`.
- **Stable distribution**: See [**Stable Distribution**](#Stable_Distribution).
- **Standard complex normal distribution**: See [**Multivariate Normal (Multinormal) Distribution**](#Multivariate_Normal_Multinormal_Distribution).
- **Suzuki distribution**: See Rayleigh distribution.
- **Tukey lambda distribution**: `(pow(x, lamda)-pow(1.0-x,lamda))/lamda`, where `x` is `RNDU01()` and `lamda` is a shape parameter.
- **Twin-_t_ distribution** (Baker and Jackson 2018)<sup>[**(64)**](#Note64)</sup>: Generate `x`, a random Student's _t_-distributed number (not a noncentral one).  Accept `x` if `RNDU01OneExc() < pow((1 + y) / ((1 + y * y) + y), (df + 1) * 0.5)`, where `y = x * x / df` and `df` is the degrees of freedom used to generate the number; repeat this process otherwise.
- **"Type 0" stable distribution**: See [**Stable Distribution**](#Stable_Distribution).
- **von Mises distribution**: See [**von Mises Distribution**](#von_Mises_Distribution).
- **Waring&ndash;Yule distribution**: See beta negative binomial distribution.
- **Wigner (semicircle) distribution**&dagger;: `(BetaDist(1.5, 1.5)*2-1)`.  The scale parameter (`sigma`) is the semicircular radius.
- **Yule&ndash;Simon distribution**: See beta negative binomial distribution.
- **Zeta distribution**: Generate `n = floor(pow(RNDU01ZeroOneExc(), -1.0 / r))`, and if `d / pow(2, r) < (d - 1) * RNDU01OneExc() * n / (pow(2, r) - 1.0)`, where `d = pow((1.0 / n) + 1, r)`, repeat this process. The parameter `r` is greater than 0. Based on method described in (Devroye 1986)<sup>[**(14)**](#Note14)</sup>. A zeta distribution [**truncated**](#Rejection_Sampling) by rejecting random values greater than some positive integer is called a _Zipf distribution_ or _Estoup distribution_. (Note that Devroye uses "Zipf distribution" to refer to the untruncated zeta distribution.)
- **Zipf distribution**: See zeta distribution.

</small>

<a id=Geometric_Sampling></a>
### Geometric Sampling

**Requires random real numbers.**

This section contains ways to choose independent uniform random points in or on geometric shapes.

<a id=Random_Points_Inside_a_Box></a>
#### Random Points Inside a Box

To generate a random point inside an N-dimensional box, generate `RNDRANGEMaxExc(mn, mx)` for each coordinate, where `mn` and `mx` are the lower and upper bounds for that coordinate.  For example&mdash;
- to generate a random point inside a rectangle bounded in \[0, 2\) along the X axis and \[3, 6\) along the Y axis, generate `[RNDRANGEMaxExc(0,2), RNDRANGEMaxExc(3,6)]`, and
- to generate a _complex number_ with real and imaginary parts bounded in \[0, 1\], generate `[RNDU01(), RNDU01()]`.

<a id=Random_Points_Inside_a_Simplex></a>
#### Random Points Inside a Simplex

The following pseudocode generates a random point inside an _n_-dimensional simplex (simplest convex figure, such as a line segment, triangle, or tetrahedron).  It takes one parameter, _points_, a list consisting of the _n_ plus one vertices of the simplex, all of a single dimension _n_ or greater. See also (Grimme 2015)<sup>[**(65)**](#Note65)</sup>, which shows MATLAB code for generating a random point uniformly inside a simplex just described, but in a different way.

    METHOD RandomPointInSimplex(points):
       ret=NewList()
       if size(points) > size(points[0])+1: return error
       if size(points)==1 // Return a copy of the point
         for i in 0...size(points[0]): AddItem(ret,points[0][i])
         return ret
       end
       gammas=NewList()
       // Sample from a Dirichlet distribution
       for i in 0...size(points): AddItem(gammas, Expo(1))
       tsum=0
       for i in 0...size(gammas): tsum = tsum + gammas[i]
       tot = 0
       for i in 0...size(gammas) - 1
           gammas[i] = gammas[i] / tsum
           tot = tot + gammas[i]
       end
       tot = 1.0 - tot
       for i in 0...size(points[0]): AddItem(ret, points[0][i]*tot)
       for i in 1...size(points)
          for j in 0...size(points[0])
             ret[j]=ret[j]+points[i][j]*gammas[i-1]
          end
       end
       return ret
    END METHOD

<a id=Random_Points_on_the_Surface_of_a_Hypersphere></a>
#### Random Points on the Surface of a Hypersphere

The following pseudocode shows how to generate a random N-dimensional point on the surface of an N-dimensional hypersphere, centered at the origin, of radius `radius` (if `radius` is 1, the result can also serve as a unit vector in N-dimensional space).  Here, `Norm` is given in the appendix.  See also (Weisstein)<sup>[**(66)**](#Note66)</sup>.

    METHOD RandomPointInHypersphere(dims, radius)
      x=0
      while x==0
        ret=[]
        for i in 0...dims: AddItem(ret, Normal(0, 1))
        x=Norm(ret)
      end
      invnorm=radius/x
      for i in 0...dims: ret[i]=ret[i]*invnorm
      return ret
    END METHOD

> **Note:** The [**Python sample code**](https://peteroupc.github.io/randomgen.zip) contains an optimized method for points on the edge of a circle.
>
> **Example:** To generate a random point on the surface of a cylinder running along the Z axis, generate random X and Y coordinates on the edge of a circle (2-dimensional hypersphere) and generate a random Z coordinate by `RNDRANGE(mn, mx)`, where `mn` and `mx` are the highest and lowest Z coordinates possible.

<a id=Random_Points_Inside_a_Ball_Shell_or_Cone></a>
#### Random Points Inside a Ball, Shell, or Cone

To generate a random N-dimensional point on or inside an N-dimensional ball, centered at the origin, of radius R, either&mdash;
- generate a random (N+2)-dimensional point on the surface of an (N+2)-dimensional hypersphere with that radius (e.g., using `RandomPointInHypersphere`), then discard the last two coordinates (Voelker et al., 2017)<sup>[**(67)**](#Note67)</sup>, or
- follow the pseudocode in `RandomPointInHypersphere`, except replace `Norm(ret)` with `sqrt(S + Expo(1))`, where `S` is the sum of squares of the numbers in `ret`<sup>[**(26)**](#Note26)</sup>.

To generate a random point on or inside an N-dimensional spherical shell (a hollow ball), centered at the origin, with inner radius A and outer radius B (where A is less than B), either&mdash;
- generate a random point for a ball of radius B until the norm of that point is A or greater (see the [**appendix**](#Appendix)), or
- generate a random point on the surface of an N-dimensional hypersphere with radius equal to `pow(RNDRANGE(pow(A, N), pow(B, N)), 1.0 / N)`<sup>[**(68)**](#Note68)</sup>.

To generate a random point on or inside a cone with height `H` and radius `R` at its base, running along the Z axis, generate a random Z coordinate by `Z = H * pow(RNDU01(), 1.0 / 3)`, then generate random X and Y coordinates inside a disc (2-dimensional ball) with radius equal to `R * Z * sqrt(RNDU01()) / H`<sup>[**(69)**](#Note69)</sup>.

> **Example:** To generate a random point inside a cylinder running along the Z axis, generate random X and Y coordinates inside a disc (2-dimensional ball) and generate a random Z coordinate by `RNDRANGE(mn, mx)`, where `mn` and `mx` are the highest and lowest Z coordinates possible.
>
> **Note:** The [**Python sample code**](https://peteroupc.github.io/randomgen.zip) contains a method for generating a random point on the surface of an ellipsoid modeling the Earth.

<a id=Random_Latitude_and_Longitude></a>
#### Random Latitude and Longitude

To generate a random point on the surface of a sphere in the form of a latitude and longitude (in radians with west and south coordinates negative)<sup>[**(70)**](#Note70)</sup>&mdash;

- generate the longitude `RNDRANGEMaxExc(-pi, pi)`, where the longitude is in the interval [-&pi;, &pi;), and
- generate the latitude `atan2(sqrt(1 - x * x), x) - pi / 2`, where `x = RNDRANGE(-1, 1)` and the latitude is in the interval \[-&pi;/2, &pi;/2\] (the interval excludes the poles, which have many equivalent forms; if poles are not desired, generate `x` until neither -1 nor 1 is generated this way).

<a id=Acknowledgments></a>
## Acknowledgments

I acknowledge the commenters to the CodeProject version of this page, including George Swan, who referred me to the reservoir sampling method.

I also acknowledge Christoph Conrads, who gave suggestions in parts of this article.

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> For the definition of an RNG, it is irrelevant&mdash;
- how hard it is to predict the numbers the item produces,
- how well the item passes statistical randomness tests,
- whether the item is initialized automatically or not,
- whether the item uses only its input and its state to produce numbers, or
- whether the item extracts random bits from one or more noise sources.

If the generator produces numbers with unequal probabilities, but is otherwise an RNG as defined here, then  _randomness extraction_ (which is outside the scope of this document) can make it produce numbers with closer to equal probabilities.</small>

<small><sup id=Note2>(2)</sup> Pedersen, K., "Reconditioning your quantile function", arXiv:1704.07949v3 [stat.CO], 2018.</small>

<small><sup id=Note3>(3)</sup> For an exercise solved by the `RNDINT` pseudocode, see A. Koenig and B. E. Moo, _Accelerated C++_, 2000; see also a [**blog post by Johnny Chan**](http://mathalope.co.uk/2014/10/26/accelerated-c-solution-to-exercise-7-9/).  In addition, M. O'Neill discusses various methods, both biased and unbiased, for generating random integers in a range with an RNG in a [**blog post from July 2018**](http://www.pcg-random.org/posts/bounded-rands.html).  Finally, a post in the Math Forum ("[**Probability and Random Numbers**](http://mathforum.org/library/drmath/view/65653.html)", Feb. 29, 2004) and Mennucci, A.C.G., "Bit Recycling for Scaling Random Number Generators", arXiv:1012.4290 [cs.IT], 2018, independently show a method for batching and recycling random bits to produce random integers in a range.</small>

<small><sup id=Note4>(4)</sup> D. Lemire, "A fast alternative to the modulo reduction", Daniel Lemire's blog, 2016.</small>

<small><sup id=Note5>(5)</sup> Lumbroso, J., "Optimal Discrete Uniform Generation from Coin Flips, and Applications", arXiv:1304.1916 [cs.DS].</small>

<small><sup id=Note6>(6)</sup> A na&iuml;ve `RNDINTEXC` implementation often seen in certain languages like JavaScript is the idiom `floor(Math.random() * maxExclusive)`, where `Math.random()` is any method that outputs an independent uniform random number in the interval \[0, 1\).  However, no implementation of `Math.random()` can choose from all real numbers in \[0, 1\), so this idiom can bias some results over others depending on the value of `maxExclusive`.  For example, if `Math.random()` is implemented as `RNDINT(X - 1)/X` and `X` is not divisible by `maxExclusive`, the result will be biased.  Also, an implementation might pre-round `Math.random() * maxExclusive` (before the `floor`) to the closest number it can represent; in rare cases, that might be `maxExclusive` for certain rounding modes. If an application is concerned about these issues, it should treat the `Math.random()` implementation as the underlying RNG for `RNDINT` and implement `RNDINTEXC` through `RNDINT` instead.</small>

<small><sup id=Note7>(7)</sup> Describing differences between SQL dialects is outside the scope of this document, but [**Flourish SQL**](http://flourishlib.com/docs/FlourishSQL) describes many such differences, including those concerning RNGs.</small>

<small><sup id=Note8>(8)</sup> Canonne, C., Kamath, G., Steinke, T., "The Discrete Gaussian for Differential Privacy", arXiv:2004.00010v2 [cs.DS], 2020.</small>

<small><sup id=Note9>(9)</sup> Keane,  M.  S.,  and  O'Brien,  G.  L., "A  Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.</small>

<small><sup id=Note10>(10)</sup> Flajolet, P., Pelletier, M., Soria, M., "On Buffon machines and numbers", arXiv:0906.5560v2  [math.PR], 2010.</small>

<small><sup id=Note11>(11)</sup> Jeff Atwood, "[**The danger of na&iuml;vet&eacute;**](https://blog.codinghorror.com/the-danger-of-naivete/)", Dec. 7, 2007.</small>

<small><sup id=Note12>(12)</sup> Bacher, A., Bodini, O., et al., "MergeShuffle: A Very Fast, Parallel Random Permutation Algorithm", arXiv:1508.03167 [cs.DS], 2015.</small>

<small><sup id=Note13>(13)</sup> If the strings identify database records, file system paths, or other shared resources, special considerations apply, including the need to synchronize access to those resources.  For uniquely identifying database records, alternatives to random strings include auto-incrementing or sequentially assigned row numbers. The choice of underlying RNG is important when it comes to unique random strings; see my [**RNG recommendation document**](https://peteroupc.github.io/random.html#Unique_Random_Identifiers).</small>

<small><sup id=Note14>(14)</sup> Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.</small>

<small><sup id=Note15>(15)</sup> See also the _Stack Overflow_ question "Random index of a non zero value in a numpy array".</small>

<small><sup id=Note16>(16)</sup> S. Linderman, "A Parallel Gamma Sampling Implementation", Laboratory for Independent Probabilistic Systems Blog, Feb. 21, 2013, illustrates one example, a GPU-implemented sampler of gamma-distributed random numbers.</small>

<small><sup id=Note17>(17)</sup> Brownlee, J. "[**A Gentle Introduction to the Bootstrap Method**](https://machinelearningmastery.com/a-gentle-introduction-to-the-bootstrap-method/)", _Machine Learning Mastery_, May 25, 2018.</small>

<small><sup id=Note18>(18)</sup> Jon Louis Bentley and James B. Saxe, "Generating Sorted Lists of Random Numbers", _ACM Trans. Math. Softw._ 6 (1980), pp. 359-364, describes a way to generate random numbers in sorted order, but it's not given here because it relies on generating real numbers in the interval [0, 1], which is inherently imperfect because computers can't choose among all random numbers between 0 and 1, and there are infinitely many of them.</small>

<small><sup id=Note19>(19)</sup> Efraimidis, P. and Spirakis, P. "[**Weighted Random Sampling (2005; Efraimidis, Spirakis)**](http://utopia.duth.gr/~pefraimi/research/data/2007EncOfAlg.pdf)", 2005.</small>

<small><sup id=Note20>(20)</sup> Efraimidis, P. "Weighted Random Sampling over Data Streams". arXiv:1012.0256v2 [cs.DS], 2015.</small>

<small><sup id=Note21>(21)</sup> T. Vieira, "[**Gumbel-max trick and weighted reservoir sampling**](http://timvieira.github.io/blog/post/2014/08/01/gumbel-max-trick-and-weighted-reservoir-sampling/)", 2014.</small>

<small><sup id=Note22>(22)</sup> T. Vieira, "[**Faster reservoir sampling by waiting**](https://timvieira.github.io/blog/post/2019/06/11/faster-reservoir-sampling-by-waiting/)", 2019.</small>

<small><sup id=Note23>(23)</sup> Duffield, N., Lund, C., Thorup, M., "Priority sampling for estimation of arbitrary subset sums", October 2007.</small>

<small><sup id=Note24>(24)</sup> The [**Python sample code**](https://peteroupc.github.io/randomgen.zip) includes a `ConvexPolygonSampler` class that implements this kind of sampling for convex polygons; unlike other polygons, convex polygons are trivial to decompose into triangles.</small>

<small><sup id=Note25>(25)</sup> That article also mentions a critical-hit distribution, which is actually a [**mixture**](#Mixtures_of_Distributions) of two distributions: one roll of dice and the sum of two rolls of dice.</small>

<small><sup id=Note26>(26)</sup> [**Kahan summation**](https://en.wikipedia.org/wiki/Kahan_summation_algorithm) can be a more robust way than the na&iuml;ve approach to compute the sum of three or more floating-point numbers.</small>

<small><sup id=Note27>(27)</sup> An _affine transformation_ is one that keeps straight lines straight and parallel lines parallel.</small>

<small><sup id=Note28>(28)</sup> Farach-Colton, M. and Tsai, M.T., 2015. Exact sublinear binomial sampling. _Algorithmica_ 73(4), pp. 637-651.</small>

<small><sup id=Note29>(29)</sup> von Neumann, J., "Various techniques used in connection with random digits", 1951.</small>

<small><sup id=Note30>(30)</sup> Karney, C.F.F., "Sampling exactly from the normal distribution", arXiv:1303.6257v2  [physics.comp-ph], 2014.</small>

<small><sup id=Note31>(31)</sup> Smith and Tromble, "[**Sampling Uniformly from the Unit Simplex**](http://www.cs.cmu.edu/~nasmith/papers/smith+tromble.tr04.pdf)", 2004.</small>

<small><sup id=Note32>(32)</sup> The NVIDIA white paper "[**Floating Point and IEEE 754 Compliance for NVIDIA GPUs**](https://docs.nvidia.com/cuda/floating-point/)",
and "[**Floating-Point Determinism**](https://randomascii.wordpress.com/2013/07/16/floating-point-determinism/)" by Bruce Dawson, discuss issues with non-integer numbers in much more detail.</small>

<small><sup id=Note33>(33)</sup> Note that `RNDU01OneExc()` corresponds to `Math.random()` in Java and JavaScript.</small>

<small><sup id=Note34>(34)</sup> This includes integers if `e` is limited to 0, and fixed-point numbers if `e` is limited to a single exponent less than 0.</small>

<small><sup id=Note35>(35)</sup> Downey, A. B. "[**Generating Pseudo-random Floating Point Values**](http://allendowney.com/research/rand/)", 2007.</small>

<small><sup id=Note36>(36)</sup> Ideally, `X` is the highest integer `p` such that all multiples of `1/p` in the interval [0, 1] are representable in the number format in question.  For example, `X` is 2^53 (9007199254740992) for binary64, and 2^24 (16777216) for binary32.</small>

<small><sup id=Note37>(37)</sup> Goualard, F., "[**Generating Random Floating-Point Numbers by Dividing Integers: a Case Study**](https://hal.archives-ouvertes.fr/hal-02427338/)", 2020.</small>

<small><sup id=Note38>(38)</sup> Spall, J.C., "An Overview of the Simultaneous Perturbation Method for Efficient Optimization", _Johns Hopkins APL Technical Digest_ 19(4), 1998, pp. 482-492.</small>

<small><sup id=Note39>(39)</sup> P. L'Ecuyer, "Tables of Linear Congruential Generators of Different Sizes and Good Lattice Structure", _Mathematics of Computation_ 68(225), January 1999, with [**errata**](http://www.iro.umontreal.ca/~lecuyer/myftp/papers/latrules99Errata.pdf).</small>

<small><sup id=Note40>(40)</sup> Harase, S., "A table of short-period Tausworthe generators for Markov chain quasi-Monte Carlo", arXiv:2002.09006 [math.NA], 2020.</small>

<small><sup id=Note41>(41)</sup> Brassard, G., Devroye, L., Gravel, C., "Exact Classical Simulation of the Quantum-Mechanical GHZ Distribution", _IEEE Transactions on Information Theory_ 62(2), February 2016.  Note that that paper defines a Bernoulli trial as 0 for success and 1 for failure, rather than the other way around, as in this document.</small>

<small><sup id=Note42>(42)</sup> D. Revuz, M. Yor, "Continuous Martingales and Brownian Motion", 1999.</small>

<small><sup id=Note43>(43)</sup> Alexopoulos, Goldsman, "[**Random Variate Generation**](https://www2.isye.gatech.edu/~sman/courses/6644/Module07-RandomVariateGenerationSlides_171116.pdf)", 2017.</small>

<small><sup id=Note44>(44)</sup> Saucier, R. "Computer Generation of Statistical Distributions", March 2000.</small>

<small><sup id=Note45>(45)</sup> Other references on density estimation include [**a Wikipedia article on multiple-variable kernel density estimation**](https://en.wikipedia.org/wiki/Multivariate_kernel_density_estimation), and a [**blog post by M. Kay**](https://web.archive.org/web/20160501200206/http://mark-kay.net/2013/12/24/kernel-density-estimation).</small>

<small><sup id=Note46>(46)</sup> "Jitter", as used in this step, follows a distribution formally called a _kernel_, of which the normal distribution is one example.  _Bandwidth_ should be set so that the estimated distribution fits the data and remains smooth.  A more complex kind of "jitter" (for multi-component data points) consists of a point generated from a [**multinormal distribution**](https://en.wikipedia.org/wiki/Multivariate_normal_distribution) with all the means equal to 0 and a _covariance matrix_ that, in this context, serves as a _bandwidth matrix_.  "Jitter" and bandwidth are not further discussed in this document.</small>

<small><sup id=Note47>(47)</sup> More formally&mdash;
- the PDF is the _derivative_ (instantaneous rate of change) of the distribution's CDF (that is, PDF(x) = CDF&prime;(x)), and
- the CDF is also defined as the _integral_ ("area under the curve") of the PDF,

provided the PDF's values are all 0 or greater and the area under the PDF's curve is 1.</small>

<small><sup id=Note48>(48)</sup> A _discrete distribution_ is a distribution that associates one or more items with a separate probability. This page assumes (without loss of generality) that these items are integers.  A discrete distribution can produce non-integer values (e.g., `x/y` with probability `x/(1+y)`) as long as the values can be converted to and from integers.  There are many ways to convert them this way. For example, a rational number in lowest terms can be converted to an integer by interleaving the bits of the numerator and denominator.</small>

<small><sup id=Note49>(49)</sup> This includes integers if `FPExponent` is limited to 0, and fixed-point numbers if `FPExponent` is limited to a single exponent less than 0.

The methods shown here do not introduce any error beyond the sampling error that occurs when approximating a PDF's or CDF's points as floating-point numbers.  Generally, these approximations will have a smaller relative error the closer they are to 0 (see also Walter, M., "Sampling the Integers with Low Relative Error", in _International Conference on Cryptology in Africa_, Jul. 2019, pp. 157-180).  For example, the relative error for CDF values closer to 1 is much greater than for values closer to 0.</small>

<small><sup id=Note50>(50)</sup> Based on a suggestion by F. Saad in a personal communication (Mar. 26, 2020).</small>

<small><sup id=Note51>(51)</sup> Saad, F.A., et al., "Optimal Approximate Sampling from Discrete Probability Distributions", arXiv:2001.04555 [cs.DS], 2020.  See also the [**associated source code**](https://github.com/probcomp/optimal-approximate-sampling).</small>

<small><sup id=Note52>(52)</sup> The `KVectorSampler` class uses algorithms described in Arnas, D., Leake, C., Mortari, D., "Random Sampling using k-vector", _Computing in Science & Engineering_ 21(1) pp. 94-107, 2019, and Mortari, D., Neta, B., "k-Vector Range Searching Techniques".</small>

<small><sup id=Note53>(53)</sup> Tran, K.H., "A Common Derivation for Markov Chain Monte Carlo Algorithms with Tractable and Intractable Targets", arXiv:1607.01985v5 [stat.CO], 2018, gives a common framework for describing many MCMC algorithms, including Metropolis&ndash;Hastings, slice sampling, and Gibbs sampling.</small>

<small><sup id=Note54>(54)</sup> See also Casella, G., and George, E.I., "Explaining the Gibbs Sampler", _The American Statistician_ 46(3) (1992).</small>

<small><sup id=Note55>(55)</sup> Kabal, P., "Generating Gaussian Pseudo-Random Variates", McGill University, 2000/2019.</small>

<small><sup id=Note56>(56)</sup> Luu, T., "Fast and Accurate Parallel Computation of Quantile Functions for Random Number Generation", Dissertation, University College London, 2016.</small>

<small><sup id=Note57>(57)</sup> Micciancio, D. and Walter, M., "Gaussian sampling over the integers: Efficient, generic, constant-time", in Annual International Cryptology Conference, August 2017 (pp. 455-485).</small>

<small><sup id=Note58>(58)</sup> "A simple method for generating gamma variables", _ACM Transactions on Mathematical Software_ 26(3), 2000.</small>

<small><sup id=Note59>(59)</sup> Ahrens, J.H., Dieter, U., "Computer methods for sampling from gamma, beta, Poisson and binomial distributions", _Computing_ 12 (1974), pp. 223-246.</small>

<small><sup id=Note60>(60)</sup> Hofert, M., and Maechler, M.  "Nested Archimedean Copulas Meet R: The nacopula Package".  _Journal of Statistical Software_ 39(9), 2011, pp. 1-20.</small>

<small><sup id=Note61>(61)</sup> McGrath, E.J., Irving, D.C., "Techniques for Efficient Monte Carlo Simulation, Volume II", Oak Ridge National Laboratory, April 1975.</small>

<small><sup id=Note62>(62)</sup> Saha, M., et al., "The extended xgamma distribution", arXiv:1909.01103 [math.ST], 2019.</small>

<small><sup id=Note63>(63)</sup> Sen, S., et al., "The xgamma distribution: statistical properties and application", 2016.</small>

<small><sup id=Note64>(64)</sup> Baker, R., Jackson, D., "A new distribution for robust least squares", arXiv:1408.3237 [stat.ME], 2018.</small>

<small><sup id=Note65>(65)</sup> Grimme, C., "Picking a Uniformly Random Point from an Arbitrary Simplex", 2015.</small>

<small><sup id=Note66>(66)</sup> Weisstein, Eric W.  "[**Hypersphere Point Picking**](http://mathworld.wolfram.com/HyperspherePointPicking.html)".  From MathWorld&mdash;A Wolfram Web Resource.</small>

<small><sup id=Note67>(67)</sup> Voelker, A.R., Gosmann, J., Stewart, T.C., "Efficiently sampling vectors and coordinates from the _n_-sphere and _n_-ball", Jan. 4, 2017.</small>

<small><sup id=Note68>(68)</sup> See the _Mathematics Stack Exchange_ question titled "Random multivariate in hyperannulus", `questions/1885630`.</small>

<small><sup id=Note69>(69)</sup> See the _Stack Overflow_ question "Uniform sampling (by volume) within a cone", `questions/41749411`.</small>

<small><sup id=Note70>(70)</sup> Reference: [**"Sphere Point Picking"**](http://mathworld.wolfram.com/SpherePointPicking.html) in MathWorld (replacing inverse cosine with `atan2` equivalent).</small>

<small><sup id=Note71>(71)</sup> Mironov, I., "On Significance of the Least Significant Bits For Differential Privacy", 2012.</small>

<small><sup id=Note72>(72)</sup> For example, see Balcer, V., Vadhan, S., "Differential Privacy on Finite Computers", Dec. 4, 2018; as well as Micciancio, D. and Walter, M., "Gaussian sampling over the integers: Efficient, generic, constant-time", in Annual International Cryptology Conference, August 2017 (pp. 455-485).</small>

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Implementation_of_erf></a>
### Implementation of `erf`

The pseudocode below shows how the [**error function**](https://en.wikipedia.org/wiki/Error_function) `erf` can be implemented, in case the programming language used doesn't include a built-in version of `erf` (such as JavaScript at the time of this writing).   In the pseudocode, `EPSILON` is a very small number to end the iterative calculation.

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
            // NOTE: EPSILON can be pow(10,14),
            // for example.
            if abs(r)<EPSILON: break
            if i==1: zval=zp
            else: zval = zval*zp/i
            i = i + 1
        end
        return ret*2/sqrt(pi)
    END METHOD

<a id=Mean_and_Variance_Calculation></a>
### Mean and Variance Calculation

The following method calculates the mean and the [**bias-corrected sample variance**](http://mathworld.wolfram.com/Variance.html) of a list of real numbers, using the [**Welford method**](https://www.johndcook.com/blog/standard_deviation/) presented by J. D. Cook.  The method returns a two-item list containing the mean and that kind of variance in that order.  (Sample variance is the estimated variance of a population or distribution assuming `list` is a random sample of that population or distribution.)  The square root of the variance calculated here is what many APIs call a standard deviation (e.g. Python's `statistics.stdev`).

    METHOD MeanAndVariance(list)
        if size(list)==0: return [0, 0]
        if size(list)==1: return [list[0], 0]
        xm=list[0]
        xs=0
        i=1
        while i < size(list)
            c = list[i]
            i = i + 1
            cxm = (c - xm)
            xm = xm + cxm *1.0/ i
            xs = xs + cxm * (c - xm)
        end
        return [xm, xs*1.0/(size(list)-1)]
    END METHOD

> **Note:** The population variance (or biased sample variance) is found by dividing by `size(list)` rather than `(size(list)-1)`, and the standard deviation of the population or a sample of it is the square root of that variance.

<a id=Norm_Calculation></a>
### Norm Calculation

The following method calculates the norm of a vector (list of numbers).

    METHOD Norm(vec)
      ret=0
      rc=0
      for i in 0...size(vec)
        rc=vec[i]*vec[i]-rc
        rt=rc+ret
        rc=(rt-ret)-rc
        ret=rt
      end
      return sqrt(ret)
    END METHOD

<a id=Multithreading_Note></a>
### Multithreading Note

Multithreading can serve as a fast way to generate multiple random numbers at once; it is not reflected in the pseudocode given in this page.  In general, this involves dividing a block of memory into chunks, assigning each chunk to a thread, giving each thread its own RNG instance, and letting each thread fill its assigned chunk with random numbers.  For an example, see "[**Multithreaded Generation**](https://docs.scipy.org/doc/numpy/reference/random/multithreading.html)".

<a id=Security_Considerations></a>
### Security Considerations

If an application generates random numbers for information security purposes, such as to generate random passwords or encryption keys, the following applies:

1. **Cryptographic RNG.** The application has to use a cryptographic RNG.  Choosing a cryptographic RNG is outside the scope of this document.
2. **Timing attacks.**  Certain security attacks have exploited timing and other differences to recover cleartext, encryption keys, or other sensitive data.  Thus, so-called "constant-time" security algorithms have been developed.  Such algorithms are designed to have no timing differences that reveal anything about any secret inputs (such as keys, passwords, or RNG "seeds"), and they often have no data-dependent control flows or memory access patterns.  Examples of "constant-time" algorithms can include a `RNDINT()` implementation that uses Montgomery reduction.  But even if an algorithm has variable running time (e.g., [**rejection sampling**](#Rejection_Sampling)), it may or may not have security-relevant timing differences, especially if it does not reuse secrets.
3. **Security algorithms out of scope.** Security algorithms that take random secrets to generate random security parameters, such as encryption keys, public/private key pairs, elliptic curves, or points on an elliptic curve, are outside this document's scope.

In nearly all security-sensitive applications, random numbers generated for security purposes are integers.  In very rare cases, they're fixed-point numbers.  Even with a secure random number generator, the use of random floating-point numbers can cause security issues not present with integers or fixed-point numbers; one example is found in (Mironov 2012)<sup>[**(71)**](#Note71)</sup>.  And even in the few security applications where random floating-point numbers are used (differential privacy and lattice-based cryptography), there are ways to avoid such random numbers<sup>[**(72)**](#Note72)</sup>.

<a id=License></a>
## License

This page is licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
