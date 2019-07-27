# Random Number Generation and Sampling Methods

[**Peter Occil**](mailto:poccil14@gmail.com)

Begun on June 4, 2017; last updated on Jul. 26, 2019.

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

<a id=About_This_Document></a>
### About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/randomfunc.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/randomfunc.md)**.  You can send comments on this document either on** [**CodeProject**](https://www.codeproject.com/Articles/1190459/Random-Number-Generation-and-Sampling-Methods) **or on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues)**.**

**Comments on any aspect of this document are welcome, but especially comments on the following:**

- **Corrections to any method given on this page.**
- **Requests to provide an implementation of any method given here in other programming languages, in addition to Python.**
- **If there is enough interest by readers, I may discuss approaches to generate random graphs or matrices.** <!-- Generating a random maze is equivalent to generating a random spanning tree of a mesh graph.  Generating a random path is equivalent to a simple random walk of a (weighted or unweighted) graph. -->
- **Suggestions to add probability distributions to this document.**
- **Ways to implement any of the randomization methods given in "Randomization with Real Numbers" using only random integers.**
- **Suggestions to trim the size of this document, such as by limiting it to the most common and most useful methods for generating random numbers.**

<a id=Contents></a>
## Contents

- [**Introduction**](#Introduction)
    - [**About This Document**](#About_This_Document)
- [**Contents**](#Contents)
- [**Notation and Definitions**](#Notation_and_Definitions)
- [**Uniform Random Numbers**](#Uniform_Random_Numbers)
    - [`RNDINT`: Random Integers in \[0, N\]](#RNDINT_Random_Integers_in_0_N)
    - [`RNDINTRANGE`: Random Integers in \[N, M\]](#RNDINTRANGE_Random_Integers_in_N_M)
    - [**`RNDINTEXC`: Random Integers in \[0, N)**](#RNDINTEXC_Random_Integers_in_0_N)
    - [**`RNDINTEXCRANGE`: Random Integers in \[N, M)**](#RNDINTEXCRANGE_Random_Integers_in_N_M)
    - [**Uniform Random Bits**](#Uniform_Random_Bits)
    - [**Certain Programming Environments**](#Certain_Programming_Environments)
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
    - [**Randomization in Statistical Testing**](#Randomization_in_Statistical_Testing)
    - [**A Note on Sorting Random Numbers**](#A_Note_on_Sorting_Random_Numbers)
- [**General Non-Uniform Distributions**](#General_Non_Uniform_Distributions)
    - [**Weighted Choice**](#Weighted_Choice)
        - [**Weighted Choice With Replacement**](#Weighted_Choice_With_Replacement)
        - [**Weighted Choice Without Replacement (Multiple Copies)**](#Weighted_Choice_Without_Replacement_Multiple_Copies)
        - [**Weighted Choice Without Replacement (Single Copies)**](#Weighted_Choice_Without_Replacement_Single_Copies)
    - [**Mixtures of Distributions**](#Mixtures_of_Distributions)
    - [**Transformations of Random Numbers**](#Transformations_of_Random_Numbers)
        - [**Censored and Truncated Random Numbers**](#Censored_and_Truncated_Random_Numbers)
- [**Specific Non-Uniform Distributions**](#Specific_Non_Uniform_Distributions)
    - [**Dice**](#Dice)
    - [**Hypergeometric Distribution**](#Hypergeometric_Distribution)
    - [**Random Integers with a Given Positive Sum**](#Random_Integers_with_a_Given_Positive_Sum)
    - [**Multinomial Distribution**](#Multinomial_Distribution)
- [**Randomization with Real Numbers**](#Randomization_with_Real_Numbers)
    - [**Uniform Random Real Numbers**](#Uniform_Random_Real_Numbers)
        - [**`RNDU01` Family: Random Numbers Bounded by 0 and 1**](#RNDU01_Family_Random_Numbers_Bounded_by_0_and_1)
        - [**Alternative Implementation for `RNDU01`**](#Alternative_Implementation_for_RNDU01)
        - [**`RNDRANGE` Family: Random Numbers in an Arbitrary Interval**](#RNDRANGE_Family_Random_Numbers_in_an_Arbitrary_Interval)
    - [**Monte Carlo Sampling: Expected Values, Integration, and Optimization**](#Monte_Carlo_Sampling_Expected_Values_Integration_and_Optimization)
    - [**Random Walks: Additional Examples**](#Random_Walks_Additional_Examples)
    - [**Low-Discrepancy Sequences**](#Low_Discrepancy_Sequences)
    - [**Weighted Choice Involving Real Numbers**](#Weighted_Choice_Involving_Real_Numbers)
        - [**Weighted Choice Without Replacement (Indefinite-Size List)**](#Weighted_Choice_Without_Replacement_Indefinite_Size_List)
        - [**Continuous Weighted Choice**](#Continuous_Weighted_Choice)
    - [**Mixtures: Additional Examples**](#Mixtures_Additional_Examples)
    - [**Transformations of Random Numbers: Additional Examples**](#Transformations_of_Random_Numbers_Additional_Examples)
    - [**Random Numbers from a Distribution of Data Points**](#Random_Numbers_from_a_Distribution_of_Data_Points)
    - [**Random Numbers from an Arbitrary Distribution**](#Random_Numbers_from_an_Arbitrary_Distribution)
    - [**Gibbs Sampling**](#Gibbs_Sampling)
    - [**Dice: Optimization for Many Dice**](#Dice_Optimization_for_Many_Dice)
    - [**Normal (Gaussian) Distribution**](#Normal_Gaussian_Distribution)
    - [**Binomial Distribution: Optimization for Many Trials**](#Binomial_Distribution_Optimization_for_Many_Trials)
    - [**Poisson Distribution**](#Poisson_Distribution)
    - [**Gamma Distribution**](#Gamma_Distribution)
    - [**Beta Distribution**](#Beta_Distribution)
    - [**Negative Binomial Distribution**](#Negative_Binomial_Distribution)
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
        - [**Random Points Inside a Ball or Shell**](#Random_Points_Inside_a_Ball_or_Shell)
        - [**Random Latitude and Longitude**](#Random_Latitude_and_Longitude)
- [**Acknowledgments**](#Acknowledgments)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Implementation of `erf`**](#Implementation_of_erf)
    - [**Mean and Variance Calculation**](#Mean_and_Variance_Calculation)
    - [**Norm Calculation**](#Norm_Calculation)
- [**License**](#License)

<a id=Notation_and_Definitions></a>
## Notation and Definitions

* The [**pseudocode conventions**](https://peteroupc.github.io/pseudocode.html) apply to this document.
* **Intervals.** The following notation is used for intervals:
    - [`a`, `b`) means "`a` or greater, but less than `b`".
    - (`a`, `b`) means "greater than `a`, but less than `b`".
    - (`a`, `b`] means "greater than `a` and less than or equal to `b`".
    - [`a`, `b`] means "`a` or greater and `b` or less".
- **Random number generator (RNG).** Software and/or hardware that seeks to generate independent numbers that seem to occur by chance and that are approximately uniformly distributed<sup>[**(1)**](#Note1)</sup>.

<a id=Uniform_Random_Numbers></a>
## Uniform Random Numbers

This section describes how an underlying RNG can be used to generate independent uniformly-distributed random integers.  This section describes four methods: `RNDINT`, `RNDINTEXC`, `RNDINTRANGE`, `RNDINTEXCRANGE`.  Of these, `RNDINT`, described next, can serve as the basis for the remaining methods.

<a id=RNDINT_Random_Integers_in_0_N></a>
### `RNDINT`: Random Integers in [0, N]

In this document, **`RNDINT(maxInclusive)`** is the core method for using an underlying RNG to generate independent uniform random integers **in the interval [0, `maxInclusive`]**.<sup>[**(2)**](#Note2)</sup> For the pseudocode given below:

| If the underlying RNG produces: | Then `RNG()` is: | And `MODULUS` is: |
 --------- | ------ | ------ |
| Integers in the interval \[0, _n_\). | The underlying RNG. | _n_. |
| Numbers in the interval \[0, 1\) known to be evenly spaced by a number _p_ (e.g., dSFMT). | The underlying RNG, except with its outputs multiplied by _p_. | 1/_p_. |
| Numbers not specified above. | A new RNG formed by writing the underlying RNG's outputs to a stream of memory units (such as 8-bit bytes) and using a _randomness extraction_ technique to transform that stream to _n_-bit integers. | 2<sup>_n_</sup>. |

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
      // to represent MODULUS (in other words, the number
      // of random bits returned by RNG() ). This will
      // be a constant here, though.
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
            rngNumber = rem(rngNumber, (1 << wordBits))
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
           if maxInclusive == 1: return rem(RNG(), 2)
           if maxInclusive == 3 and modBits >= 2: return rem(RNG(), 4)
           if maxInclusive == 255 and modBits >= 8: return rem(RNG(), 256)
           if maxInclusive == 65535 and modBits >=16: return rem(RNG(), 65535)
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
          if ret < maxexc: return rem(ret, nPlusOne)
        end
      end
    END METHOD

> **Notes:**
>
> 1. The `RNDINT` implementation given here is not necessarily performant.  Performance optimizations include multithreading or vectorization (SIMD instructions) to help reduce the time to generate multiple random numbers at once, or saving unused bits generated by `RNDINT` if `MODULUS` is 2<sup>32</sup> or another power of 2 (indicating `RNG()` outputs _n_-bit integers).
> 2. In functional programming languages such as Haskell, `RNDINT()`, as well as `RNG()` itself and other random-number-generating methods in this document, can be implemented by taking a random generator state as an additional parameter, and returning a list of two items, namely, the random number and a new random generator state (as in the Haskell package `AC-Random`).  This works only if the `RNG()` implementation uses only its input and its state to produce random numbers.
> 3. The implementation here uses [**_rejection sampling_**](#Rejection_Sampling) in most cases.  This has the advantage of being unbiased but has a variable running time which could be exploited in a security attack.  An alternative approach is to find `rem(bignumber, maxInclusive + 1)`, where `bignumber` is a "big" random integer (that has many more bits than `maxInclusive` has).  This alternative can be "constant-time" (non-data-dependent and branchless) if implemented correctly, but can introduce a so-called _modulo bias_ (some numbers are slightly more likely to be chosen than others), which, however, gets smaller the more bits `bignumber` has.

>
> **Examples:**
>
> 1. To generate a random number that's either -1 or 1, the following idiom can be used: `(RNDINT(1) * 2 - 1)`.
> 2. To generate a random integer that's divisible by a positive integer (`DIV`), generate the integer with any method (such as `RNDINT`), let `X` be that integer, then generate `X - rem(X, DIV)` if `X >= 0`, or `X - (DIV - rem(abs(X), DIV))` otherwise. (Depending on the method, the resulting integer may be out of range, in which case this procedure is to be repeated.)
> 3. A random 2-dimensional point on an NxM grid can be expressed as a single integer as follows:
>      - To generate a random NxM point `P`, generate `P = RNDINT(N * M - 1)` (`P` is thus in the interval [0, `N * M`)).
>      - To convert a point `P` to its 2D coordinates, generate `[rem(P, N), floor(P / N)]`. (Each coordinate starts at 0.)
>      - To convert 2D coordinates `coord` to an NxM point, generate `P = coord[1] * N + coord[0]`.

<a id=RNDINTRANGE_Random_Integers_in_N_M></a>
### `RNDINTRANGE`: Random Integers in [N, M]

The na&iuml;ve way of generating a **random integer in the interval [`minInclusive`, `maxInclusive`]**, shown below, works well for nonnegative integers and arbitrary-precision integers.

     METHOD RNDINTRANGE(minInclusive, maxInclusive)
       // minInclusive must not be greater than maxInclusive
       if minInclusive > maxInclusive: return error
       return minInclusive + RNDINT(maxInclusive - minInclusive)
     END METHOD

The na&iuml;ve approach won't work as well, though, if the integer format can express negative and nonnegative integers and the difference between `maxInclusive` and `minInclusive` exceeds the highest possible integer for the format.  For integer formats that can express&mdash;

1. any integer in the interval \[-1 - `MAXINT`, `MAXINT`\] (e.g., Java `int`, `short`, or `long`), or
2. any integer in the interval \[-`MAXINT`, `MAXINT`\] (e.g., Java `float` and `double` and .NET's implementation of `System.Decimal`),

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

> **Examples:**
>
> 1. To simulate rolling an N-sided die (N greater than 1), generate a random number in the interval \[1, N\] by `RNDINTRANGE(1, N)`.
> 2. To generate a random integer with one base-10 digit, generate `RNDINTRANGE(0, 9)`.
> 3. To generate a random integer with N base-10 digits (where N is 2 or greater), where the first digit can't be 0, generate `RNDINTRANGE(pow(10, N-1), pow(10, N) - 1)`.
> 4. Pseudocode like the following can be used to choose a **random date-and-time** bounded by two dates-and-times (`date1`, `date2`).  In the following pseudocode, `DATETIME_TO_NUMBER` and `NUMBER_TO_DATETIME` convert a date-and-time to or from a number, respectively, at the required granularity, for instance, month, day, or hour granularity (the details of such conversion depend on the date-and-time format and are outside the scope of this document).
>
>         dtnum1 = DATETIME_TO_NUMBER(date1)
>         dtnum2 = DATETIME_TO_NUMBER(date2)
>         // Choose a random date-and-time
>         // in [dtnum1, dtnum2].  Any other
>         // random selection strategy can be
>         // used here instead.
>         num = RNDINTRANGE(date1, date2)
>         result = NUMBER_TO_DATETIME(num)

<a id=RNDINTEXC_Random_Integers_in_0_N></a>
### `RNDINTEXC`: Random Integers in [0, N)

`RNDINTEXC(maxExclusive)`, which generates a **random integer in the interval** **\[0, `maxExclusive`\)**, can be implemented as follows<sup>[**(3)**](#Note3)</sup>:

     METHOD RNDINTEXC(maxExclusive)
        if maxExclusive <= 0: return error
        return RNDINT(maxExclusive - 1)
     END METHOD

> **Note:** `RNDINTEXC` is not given as the core random generation method because it's harder to fill integers in popular integer formats with random bits with this method.
>
> **Example:** Generating a random number in the interval [`mn`, `mx`) in increments equal to `step` is equivalent to generating `mn+step*RNDINTEXC(ceil((mx-mn)/(1.0*step)))`.

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

In practice, memory is usually divided into _bytes_, or 8-bit nonnegative integers in the interval [0, 255].  In this case, a block of memory can be filled with random bits by setting each byte in the block to `RNDINT(255)`. (There may be faster, RNG-specific ways to fill memory with random bytes, such as with RNGs that generate random numbers in parallel.  These ways are not detailed in this document.)

<a id=Certain_Programming_Environments></a>
### Certain Programming Environments

For certain programming environments, there are special considerations:

- Shell scripts and Microsoft Windows batch files are designed for running other programs, rather than general-purpose programming.  However, batch files and `bash` (a shell script interpreter) might support a variable which returns a random integer in the interval \[0, 32767\] (called `%RANDOM%` or `$RANDOM`, respectively); neither variable is designed for information security.
- Query languages such as SQL have no procedural elements such as loops and branches.  Moreover, standard SQL does not include an RNG in its suite of functionality, but popular SQL dialects often do &mdash; with idiosyncratic behavior.<sup>[**(4)**](#Note4)</sup>

Whenever possible, the methods in this document should be implemented in a more general-purpose programming language than query languages, shell scripts, and batch files, especially if information security is a goal.

<a id=Randomization_Techniques></a>
## Randomization Techniques

This section describes commonly used randomization techniques, such as shuffling, selection of several unique items, and creating random strings of text.

<a id=Boolean_True_False_Conditions></a>
### Boolean (True/False) Conditions

To generate a condition that is true at the specified probabilities, use
the following idioms in an `if` condition:

- True or false with equal probability: `RNDINT(1) == 0`.
- True with X percent probability: `RNDINTEXC(100) < X`.
- True with probability X/Y: `RNDINTEXC(Y) < X`.
- True with odds of X to Y: `RNDINTEXC(X + Y) < X`.
- True with probability P, where P is in the interval \[0, 1\] (a _Bernoulli trial_): Convert P to an acceptably close rational number X/Y, then do `RNDINTEXC(Y) < X`.

> **Examples:**
> - True with probability 3/8: `RNDINTEXC(8) < 3`.
> - True with odds of 100 to 1: `RNDINTEXC(101) < 1`.
> - True with 20% probability: `RNDINTEXC(100) < 20`.

The following helper method generates 1 with probability `x`/`y` and 0 otherwise:

    METHOD ZeroOrOne(x,y)
      if RNDINTEXC(y)<x: return 1
      return 0
    END METHOD

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
2. **If `n` is relatively small (for example, if there are 200 available items, or there is a range of numbers from 0 through 200 to choose from):**  If **items are to be chosen from a list in relative order**, then the `RandomKItemsInOrder` method, in [**pseudocode given later**](#Pseudocode_for_Random_Sampling), demonstrates a solution.  Otherwise, one of the following will choose `k` items **in random order**:
    - Store all the items in a list, [**shuffle**](#Shuffling) that list, then choose the first `k` items from that list.
    - If the items are already stored in a list and the list's order can be changed, then shuffle that list and choose the first `k` items from the shuffled list.
    - If the items are already stored in a list and the list's order can't be changed, then store the indices to those items in another list, shuffle the latter list, then choose the first `k` indices (or the items corresponding to those indices) from the latter list.
    - If `k` is much smaller than `n`, proceed as in item 3 instead.
3. **If `k` is much smaller than `n`:**  The first three cases below will choose `k` items in random order:
    - **If the items are stored in a list whose order can be changed:** Do a _partial shuffle_ of that list, then choose the _last_ `k` items from that list.  A _partial shuffle_ proceeds as given in the section "[**Shuffling**](#Shuffling)", except the partial shuffle stops after `k` swaps have been made (where swapping one item with itself counts as a swap).
    - Otherwise, **if the items are stored in a list and `n` is not very large (for example, less than 5000):** Store the indices to those items in another list, do a _partial shuffle_ of the latter list, then choose the _last_ `k` indices (or the items corresponding to those indices) from the latter list.
    - Otherwise, **if `n` is not very large:** Store all the items in a list, do a _partial shuffle_ of that list, then choose the _last_ `k` items from that list.
    - Otherwise, see item 5.
4. **If `n - k` is much smaller than `n` and the sampled items need not be in random order:**  Proceed as in step 3, except the partial shuffle involves `n - k` swaps and the _first_ `k` items are chosen rather than the last `k`.
5. **Otherwise (for example, if 32-bit or larger integers will be chosen so that `n` is 2<sup>32</sup>, or if `n` is otherwise very large):** Create a data structure to store the indices to items already chosen.  When a new index to an item is randomly chosen, add it to the data structure if it's not already there, or if it is, choose a new random index.  Repeat this process until `k` indices were added to the data structure this way.  Examples of suitable data structures are&mdash;
    - a [**hash table**](https://en.wikipedia.org/wiki/Hash_table),
    - a compressed bit set (e.g, "roaring bitmap", EWAH), and
    - a self-sorting data structure such as a [**red&ndash;black tree**](https://en.wikipedia.org/wiki/Red%E2%80%93black_tree), if the random items are to be retrieved in sorted order or in index order.

    Many applications require generating unique random numbers to identify database records or other shared resources.  In this case, the choice of underlying RNG is important; see my [**RNG recommendation document**](https://peteroupc.github.io/random.html#Unique_Random_Identifiers).

<a id=Shuffling></a>
#### Shuffling

The [**Fisher&ndash;Yates shuffle method**](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle) shuffles a list (puts its items in a random order) such that all permutations (arrangements) of that list are equally likely to occur, assuming the RNG it uses can choose any one of those permutations.  However, that method is also easy to write incorrectly &mdash; see also (Atwood 2007)<sup>[**(5)**](#Note5)</sup>.  The following pseudocode is designed to shuffle a list's contents.

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

The choice of underlying RNG is important when it comes to shuffling; see my [**RNG recommendation document on shuffling**](https://peteroupc.github.io/random.html#Shuffling).

<a id=Random_Character_Strings></a>
#### Random Character Strings

To generate a random string of characters:

1. Generate a list of the letters, digits, and/or other characters the string can have.  Examples are given later in this section.
2. Build a new string whose characters are chosen from that character list.  The pseudocode below demonstrates this by creating a list, rather than a string, where the random characters will be held.  It also takes the number of characters as a parameter named `stringSize`.  (How to convert this list to a text string depends on the programming language and is outside the scope of this page.)

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
> 2. **Unique random strings:** Often applications need to generate a string of characters that's not only random, but also unique.  This can be done by storing a list (such as a hash table) of strings already generated and checking newly generated strings against that list.<sup>[**(6)**](#Note6)</sup>
> 3. **Word generation:** This technique could also be used to generate "pronounceable" words, but this is less flexible than other approaches; see also "[**Weighted Choice With Replacement**](#Weighted_Choice_With_Replacement)".

<a id=Pseudocode_for_Random_Sampling></a>
#### Pseudocode for Random Sampling

The following pseudocode implements two methods:

1. `RandomKItemsFromFile` implements [**_reservoir sampling_**](https://en.wikipedia.org/wiki/Reservoir_sampling); it chooses up to `k` random items from a file of indefinite size (`file`). Although the pseudocode refers to files and lines, the technique applies to any situation when items are retrieved one at a time from a data set or list whose size is not known in advance.  See the comments to find out how `RandomKItemsFromFile` can be used to choose an item at random only if it meets certain criteria (see "[**Rejection Sampling**](#Rejection_Sampling)" for example criteria).
2. `RandomKItemsInOrder` returns a list of up to `k` random items from the given list (`list`), in the order in which they appeared in the list.  It is based on a technique presented in Devroye 1986, p. 620.

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
      i = 0
      kk = k
      ret = NewList()
      n = size(list)
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
> 3. **Filtering:** If an application needs to sample the same list (with or without replacement) repeatedly, but only from among a selection of that list's items, it can create a list of items it wants to sample from (or a list of indices to those items), and sample from the new list instead.<sup>[**(7)**](#Note7)</sup>  This won't work well, though, for lists of indefinite or very large size.

<a id=Rejection_Sampling></a>
### Rejection Sampling

_Rejection sampling_ is a simple and flexible approach for generating random content that meets certain requirements.  To implement rejection sampling:

1. Generate the random content (such as a random number) by any method and with any distribution and range.
2. If the content doesn't meet predetermined criteria, go to step 1.

Example criteria include checking&mdash;
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

> **Note:** All rejection sampling techniques have a chance to reject data, so they all have a variable running time; thus, they are not appropriate in any cases when differences in running time could be exploited in a security attack.  (Certain attacks involving encrypted communications have exploited the timing and other aspects of such communications to derive plaintext or encryption keys indirectly.)

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

> **Note:** A **white noise process** is simulated by creating a list of random numbers generated independently and in the same way.  Such a process generally models behavior over time that does not depend on the time or the current state.  One example is `ZeroOrOne(px,py)` (for modeling a _Bernoulli process_, where each number is 0 or 1 depending on the probability `px`/`py`).

> **Examples:**
>
> 1. If `STATEJUMP()` is `RNDINT(1) * 2 - 1`, the random walk generates numbers that each differ from the last by -1 or 1, chosen at random.
> 2. If `STATEJUMP()` is `ZeroOrOne(px,py) * 2 - 1`, the random walk generates numbers that each differ from the last by -1 or 1 depending on the probability `px`/`py`.
> 3. **Binomial process:** If `STATEJUMP()` is `ZeroOrOne(px,py)`, the random walk advances the state with probability `px`/`py`.

<a id=Randomization_in_Statistical_Testing></a>
### Randomization in Statistical Testing

Statistical testing uses shuffling and _bootstrapping_ to help draw conclusions on data through randomization.

- [**Shuffling**](#Shuffling) is used when each item in a data set belongs to one of several mutually exclusive groups.  Here, one or more **simulated data sets** are generated by shuffling the original data set and regrouping each item in the shuffled data set in order, such that the number of items in each group for the simulated data set is the same as for the original data set.
- [**_Bootstrapping_**](https://en.wikipedia.org/wiki/Bootstrapping_%28statistics%29) is a method of creating one or more random samples (simulated data sets) of an existing data set, where the items in each sample are chosen [**at random with replacement**](#Sampling_With_Replacement_Choosing_a_Random_Item_from_a_List).  (Each random sample can contain duplicates this way.)  See also (Brownlee 2018)<sup>[**(8)**](#Note8)</sup>.

After creating the simulated data sets, one or more statistics, such as the mean, are calculated for each simulated data set as well as the original data set, then the statistics for the simulated data sets are compared with those of the original (such comparisons are outside the scope of this document).

<a id=A_Note_on_Sorting_Random_Numbers></a>
### A Note on Sorting Random Numbers

In general, sorting random numbers is no different from sorting any other data. (Sorting algorithms are outside this document's scope.) <sup>[**(9)**](#Note9)</sup>

<a id=General_Non_Uniform_Distributions></a>
## General Non-Uniform Distributions

Some applications need to choose random items or numbers such that some of them are more likely to be chosen than others (a _non-uniform_ distribution). Most of the techniques in this section show how to use the [**uniform random number methods**](#Uniform_Random_Numbers) to generate such random items or numbers.

<a id=Weighted_Choice></a>
### Weighted Choice

The weighted choice method generates a random item or number from among a collection of them with separate probabilities of each item or number being chosen.  There are several kinds of weighted choice.

<a id=Weighted_Choice_With_Replacement></a>
#### Weighted Choice With Replacement

The first kind is called weighted choice _with replacement_ (which can be thought of as drawing a ball, then putting it back), where the probability of choosing each item doesn't change as items are chosen.

The following pseudocode implements a method `WeightedChoice` that takes a single list `weights` of weights (integers 0 or greater), and returns the index of a weight from that list.  The greater the weight, the more likely its index will be chosen.

    METHOD WeightedChoice(weights)
        if size(weights) == 0: return error
        msum = 0
        // Get the sum of all weights
        // NOTE: Kahan summation is more robust
        // than the naive summing given here
        i = 0
        while i < size(weights)
            msum = msum + weights[i]
            i = i + 1
        end
        // Choose a random integer from 0 and less than
        // the sum of weights.
        value = RNDINTEXC(sum)
        // Choose the object according to the given value
        i = 0
        lastItem = size(weights) - 1
        runningValue = 0
        while i < size(weights)
           if weights[i] > 0
              newValue = runningValue + weights[i]
              lastItem = i
              // NOTE: Includes start, excludes end
              if value < newValue: break
              runningValue = newValue
           end
           i = i + 1
        end
        // If we didn't break above, this is a last
        // resort (might happen because rounding
        // error happened somehow)
        return lastItem
    END METHOD

> **Note:** The Python sample code contains a variant of this
> method for generating multiple random points in one call.
>
> **Examples:**
>
> 1. Assume we have the following list: `["apples", "oranges", "bananas", "grapes"]`, and `weights` is the following: `[3, 15, 1, 2]`.  The weight for "apples" is 3, and the weight for "oranges" is 15.  Since "oranges" has a higher weight than "apples", the index for "oranges" (1) is more likely to be chosen than the index for "apples" (0) with the `WeightedChoice` method.  The following idiom implements how to get a randomly chosen item from the list with that method: `item = list[WeightedChoice(weights)]`.
> 2. Assume the weights from example 1 are used and the list contains ranges of numbers instead of strings: `[[0, 5], [5, 10], [10, 11], [11, 13]]`.  After a random range is chosen, an independent uniform number is chosen randomly within the chosen range (including the lower bound but not the upper bound).  For example, code like the following chooses a random integer this way: `number = RNDINTEXCRANGE(item[0], item[1])`. (See also "[**Mixtures of Distributions**](#Mixtures_of_Distributions)".)
> 3. **Piecewise constant distribution.** Assume the weights from example 1 are used and the list contains the following: `[0, 5, 10, 11, 13]` (one more item than the weights).  This expresses four ranges, the same as in example 2.  After a random index is chosen with `index = WeightedChoice(weights)`, an independent uniform number is chosen randomly within the corresponding range (including the lower bound but not the upper bound).  For example, code like the following chooses a random integer this way: `number = RNDINTEXCRANGE(list[index], list[index + 1])`.
> 4. A [**Markov chain**](https://en.wikipedia.org/wiki/Markov_chain) models one or more _states_ (for example, individual letters or syllables), and stores the probabilities to transition from one state to another (e.g., "b" to "e" with a chance of 20 percent, or "b" to "b" with a chance of 1 percent).  Thus, each state can be seen as having its own list of _weights_ for each relevant state transition.  For example, a Markov chain for generating **"pronounceable" words**, or words similar to natural-language words, can include "start" and "stop" states for the start and end of the word, respectively.

<a id=Weighted_Choice_Without_Replacement_Multiple_Copies></a>
#### Weighted Choice Without Replacement (Multiple Copies)

For positive integer weights, to implement weighted choice _without replacement_ (which can be thought of as drawing a ball _without_ putting it back), generate an index by `WeightedChoice`, and then decrease the weight for the chosen index by 1.  In this way, **each weight behaves like the number of "copies" of each item**. The pseudocode below is an example of this.

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

Weighted choice can also choose items from a list, where each item has a separate probability of being chosen and **can be chosen no more than once**.  In this case, after choosing a random index, set the weight for that index to 0 to keep it from being chosen again.  The pseudocode below is an example of this.

    // NOTE: This code assumes--
    // - that `weights` is a list that can be modified, and
    // - that `list`, a list of items, was already
    //   declared earlier and has at least as many
    //   items as `weights`.
    // If the original weights are needed for something
    // else, a copy of that list should be made first,
    // but the copying process is not shown here.
    chosenItems = NewList()
    i = 0
    // Choose k items from the list
    while i < k or i < size(weights)
        index = WeightedChoice(weights)
        // Set the weight for the chosen index to 0
        // so it won't be chosen again
        weights[index] = 0
        // Add the item at the chosen index
        AddItem(chosenItems, list[index])
    end
    // `chosenItems` now contains the items chosen

The technique presented here can solve the problem of sorting a list of items such that higher-weighted items are more likely to appear first.

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
> 2. Choosing, independently and uniformly, a random point from a complex shape (in any number of dimensions) is equivalent to doing such sampling from a mixture of simpler shapes that make up the complex shape (here, the `weights` list holds the n-dimensional "volume" of each simpler shape).  For example, a simple closed 2D polygon can be [**_triangulated_**](https://en.wikipedia.org/wiki/Polygon_triangulation), or decomposed into [**triangles**](#Random_Points_Inside_a_Simplex), and a mixture of those triangles can be sampled.<sup>[**(10)**](#Note10)</sup>
> 3. Take a set of nonoverlapping integer ranges.  To choose a random integer from those ranges independently and uniformly:
>     - Create a list (`weights`) of weights for each range.  Each range is given a weight of `(mx - mn) + 1`, where `mn` is that range's minimum and `mx` is its maximum.
>     - Choose an index using `WeightedChoice(weights)`, then generate `RNDINTRANGE(mn, mx)`, where `mn` is the corresponding range's minimum and `mx` is its maximum.

<a id=Transformations_of_Random_Numbers></a>
### Transformations of Random Numbers

Random numbers can be generated by combining and/or transforming one or more random numbers and/or discarding some of them.

As an example, [**"Probability and Games: Damage Rolls"**](http://www.redblobgames.com/articles/probability/damage-rolls.html) by Red Blob Games includes interactive graphics showing score distributions for lowest-of, highest-of, drop-the-lowest, and reroll game mechanics.<sup>[**(11)**](#Note11)</sup>  These and similar distributions can be generalized as follows.

Generate one or more random numbers, each with a separate probability distribution, then<sup>[**(12)**](#Note12)</sup>:

1. **Highest-of:**  Choose the highest generated number.
2. **Drop-the-lowest:**  Add all generated numbers except the lowest.
3. **Reroll-the-lowest:**  Add all generated numbers except the lowest, then add a number generated randomly by a separate probability distribution.
4. **Lowest-of:**  Choose the lowest generated number.
5. **Drop-the-highest:**  Add all generated numbers except the highest.
6. **Reroll-the-highest:**  Add all generated numbers except the highest, then add a number generated randomly by a separate probability distribution.
7. **Sum:** Add all generated numbers.
8. **Mean:** Find the mean of all generated numbers.
9. **Geometric transformation:** Treat the numbers as an _n_-dimensional point, then apply a geometric transformation, such as a rotation or other _affine transformation_<sup>[**(13)**](#Note13)</sup>, to that point.

If the probability distributions are the same, then strategies 1 to 3 make higher numbers more likely, and strategies 4 to 6, lower numbers.

> **Note:** Variants of strategy 4 &mdash; e.g., choosing the second-, third-, or nth-lowest number &mdash; are formally called second-, third-, or nth-**order statistics distributions**, respectively.
>
> **Examples:**
>
> 1. The idiom `min(RNDINTRANGE(1, 6), RNDINTRANGE(1, 6))` takes the lowest of two six-sided die results (strategy 4).  Due to this approach, 1 is more likely to occur than 6.
> 2. The idiom `RNDINTRANGE(1, 6) + RNDINTRANGE(1, 6)` takes the result of two six-sided dice (see also "[**Dice**](#Dice)") (strategy 7).
> 3. A [**binomial distribution**](#Binomial_Distribution_Optimization_for_Many_Trials) models the sum of `n` random numbers each generated by `ZeroOrOne(px,py)` (strategy 7), that is, the number of successes in `n` independent trials, each with a success probability of `px`/`py`.<sup>[**(14)**](#Note14)</sup>
>

<a id=Censored_and_Truncated_Random_Numbers></a>
#### Censored and Truncated Random Numbers

To generate a _censored_ random number, generate a random number as usual, then&mdash;
- if that number is less than a minimum threshold, use the minimum threshold instead, and/or
- if that number is greater than a maximum threshold, use the maximum threshold instead.

To generate a _truncated_ random number, generate random numbers as usual until a number generated this way is not less than a minimum threshold, not greater than a maximum threshold, or both.

<a id=Specific_Non_Uniform_Distributions></a>
## Specific Non-Uniform Distributions

This section contains information on some of the most common non-uniform probability distributions.

<a id=Dice></a>
### Dice

The following method generates a random result of rolling virtual dice. It takes three parameters: the number of dice (`dice`), the number of sides in each die (`sides`), and a number to add to the result (`bonus`) (which can be negative, but the result of the subtraction is 0 if that result is greater).

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
          if RNDINTEXC(currentCount) < currentOnes
            currentOnes = currentOnes - 1
            successes = successes + 1
          end
          currentCount = currentCount - 1
          i = i + 1
        end
        return successes
    END METHOD

> **Example:** In a 52-card deck of Anglo-American playing cards, 12 of the cards are face cards (jacks, queens, or kings).  After the deck is shuffled and seven cards are drawn, the number of face cards drawn this way follows a hypergeometric distribution where `trials` is 7, `ones` is
12, and `count` is 52.

<a id=Random_Integers_with_a_Given_Positive_Sum></a>
### Random Integers with a Given Positive Sum

The following pseudocode shows how to generate integers with a given positive sum, where the combination is chosen uniformly at random from among all possible combinations. (The algorithm for this was presented in (Smith and Tromble 2004)<sup>[**(15)**](#Note15)</sup>.)  In the pseudocode below&mdash;

- the method `PositiveIntegersWithSum` returns `n` integers greater than 0 that sum to `total`,
- the method `IntegersWithSum` returns `n` integers 0 or greater that sum to `total`, and
- `Sort(list)` sorts the items in `list` in ascending order (note that sort algorithms are outside the scope of this document).

&nbsp;

    METHOD PositiveIntegersWithSum(n, total)
        if n <= 0 or total <=0: return error
        ls = NewList()
        ret = NewList()
        AddItem(ls, 0)
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
            list[i] - list[i - 1])
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
> 1. To generate a uniformly randomly chosen combination of `N` numbers with a given positive average `avg`, generate a uniformly randomly chosen combination of `N` numbers with the sum `N * avg`.
> 2. To generate a uniformly randomly chosen combination of `N` numbers `min` or greater and with a given positive sum `sum`, generate a uniformly randomly chosen combination of `N` numbers with the sum `sum - n * min`, then add `min` to each number generated this way.

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
- Computers can represent integers more naturally than other real numbers, making random integer generation algorithms more portable and more numerically stable than random real number generation algorithms.
- No computer can choose from among all real numbers between two others, since there are infinitely many of them.

<a id=Uniform_Random_Real_Numbers></a>
### Uniform Random Real Numbers

This section defines the following methods that generate uniform random real numbers:

* Random Numbers in 0-1 Bounded Interval: `RNDU01`, `RNDU01ZeroExc`, `RNDU01OneExc`, `RNDU01ZeroOneExc`.
* Random Numbers in Arbitrary Interval: `RNDRANGE`, `RNDRANGEMinExc`, `RNDRANGEMaxExc`, `RNDRANGEMinMaxExc`.

<a id=RNDU01_Family_Random_Numbers_Bounded_by_0_and_1></a>
#### `RNDU01` Family: Random Numbers Bounded by 0 and 1

This section defines four methods that generate a **random number bounded by 0 and 1**.  There are several ways to implement each of those four methods; for each method, the ways are ordered from most preferred to least preferred, and `X` and `INVX` are defined later.

- **`RNDU01()`, interval [0, 1]**:
    - For Java `float` or `double`, use the alternative implementation given later.
    - `RNDINT(X) * INVX`.
    - `RNDINT(X) / X`, if the number format can represent `X`.
- **`RNDU01OneExc()`, interval [0, 1)**:
    - Generate `RNDU01()` in a loop until a number other than 1.0 is generated this way.
    - `RNDINT(X - 1) * INVX`.
    - `RNDINTEXC(X) * INVX`.
    - `RNDINT(X - 1) / X`, if the number format can represent `X`.
    - `RNDINTEXC(X) / X`, if the number format can represent `X`.

    Note that `RNDU01OneExc()` corresponds to `Math.random()` in Java and JavaScript.  See also "Generating uniform doubles in the unit interval" in the [**`xoroshiro+` remarks page**](http://xoroshiro.di.unimi.it/#remarks).
- **`RNDU01ZeroExc()`, interval (0, 1]**:
    - Generate `RNDU01()` in a loop until a number other than 0.0 is generated this way.
    - `(RNDINT(X - 1) + 1) * INVX`.
    - `(RNDINTEXC(X) + 1) * INVX`.
    - `(RNDINT(X - 1) + 1) / X`, if the number format can represent `X`.
    - `(RNDINTEXC(X) + 1) / X`, if the number format can represent `X`.
    - `1.0 - RNDU01OneExc()` (but this is recommended only if the set of numbers `RNDU01OneExc()` could return &mdash; as opposed to their probability &mdash; is evenly distributed).
- **`RNDU01ZeroOneExc()`, interval (0, 1)**:
    - Generate `RNDU01()` in a loop until a number other than 0.0 or 1.0 is generated this way.
    - `(RNDINT(X - 2) + 1) * INVX`.
    - `(RNDINTEXC(X - 1) + 1) * INVX`.
    - `(RNDINT(X - 2) + 1) / X`, if the number format can represent `X`.
    - `(RNDINTEXC(X - 1) + 1) / X`, if the number format can represent `X`.

In the idioms above:

- `X` is the highest integer `p` such that all multiples of `1/p` in the interval [0, 1] are representable in the number format in question.  For example&mdash;
    - for the 64-bit IEEE 754 binary floating-point format (e.g., Java `double`), `X` is 2<sup>53</sup> (9007199254740992),
    - for the 32-bit IEEE 754 binary floating-point format (e.g., Java `float`), `X` is 2<sup>24</sup> (16777216),
    - for the 64-bit IEEE 754 decimal floating-point format, `X` is 10<sup>16</sup>, and
    - for the .NET Framework decimal format (`System.Decimal`), `X` is 10<sup>28</sup>.
- `INVX` is the constant 1 divided by `X`.

<a id=Alternative_Implementation_for_RNDU01></a>
#### Alternative Implementation for `RNDU01`

For Java's `double` and `float` (or generally, any fixed-precision binary floating-point format with fixed exponent range), the following pseudocode for `RNDU01()` can be used instead. See also (Downey 2007)<sup>[**(16)**](#Note16)</sup>.  In the pseudocode below, `SIGBITS` is the binary floating-point format's precision (the number of binary digits the format can represent without loss; e.g., 53 for Java's `double`).

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
        // a real number, not necessarily an integer;
        // if `e` is sufficiently
        // small, the number might underflow to 0
        // depending on the number format
        return sig * pow(2, e)
    END METHOD

<a id=RNDRANGE_Family_Random_Numbers_in_an_Arbitrary_Interval></a>
#### `RNDRANGE` Family: Random Numbers in an Arbitrary Interval

**`RNDRANGE`** generates a **random number in the interval \[`minInclusive`, `maxInclusive`\]**.

For arbitrary-precision or non-negative number formats, the following pseudocode implements `RNDRANGE()`.

    METHOD RNDRANGE(minInclusive, maxInclusive)
        if minInclusive > maxInclusive: return error
        return minInclusive + (maxInclusive - minInclusive) * RNDU01()
    END METHOD

For other number formats (including Java's `double` and `float`), the pseudocode above can overflow if the difference between `maxInclusive` and `minInclusive` exceeds the maximum possible value for the format.  For such formats, the following pseudocode for `RNDRANGE()` can be used instead.  In the pseudocode below, `NUM_MAX` is the highest possible finite number for the number format.  The pseudocode assumes that the highest possible value is positive and the lowest possible value is negative.

    METHOD RNDRANGE(minInclusive, maxInclusive)
       if minInclusive > maxInclusive: return error
       if minInclusive == maxInclusive: return minInclusive
       // usual: Difference does not exceed maxInclusive
       usual=minInclusive >= 0 or
           minInclusive + NUM_MAX >= maxInclusive
       rng=NUM_MAX
       if usual: rng = (maxInclusive - minInclusive)
       while true
         ret = rng * RNDU01()
         if usual: return minInclusive + ret
         // NOTE: If the number format has positive and negative
         // zero, as is the case for Java `float` and
         // `double` and .NET's implementation of `System.Decimal`,
         // for example, use the following:
         negative = RNDINT(1) == 0
         if negative: ret = 0 - ret
         if negative and ret == 0: continue
         // NOTE: For fixed-precision fixed-point numbers implemented
         // using number formats that range from [-1-max, max] (such as Java's
         // `short`, `int`, and `long`), use the following line
         // instead of the preceding three lines, where `QUANTUM` is the
         // smallest representable number greater than 0
         // in the fixed-point format:
         // if RNDINT(1) == 0: ret = (0 - QUANTUM) - ret
         if ret >= minInclusive and ret <= maxInclusive: return ret
       end
    END METHOD

**REMARK:** Multiplying by `RNDU01()` in both cases above is not ideal, since doing so merely stretches that number to fit the range if the range is greater than 1.  There may be more sophisticated ways to fill the gaps that result this way in `RNDRANGE`.<sup>[**(17)**](#Note17)</sup>

Three related methods can be derived from `RNDRANGE` as follows:

- **`RNDRANGEMaxExc`, interval \[`mn`, `mx`\)**:
    - Generate `RNDRANGE(mn, mx)` in a loop until a number other than `mx` is generated this way.  Return an error if `mn >= mx`.
- **`RNDRANGEMinExc`, interval \[`mn`, `mx`\)**:
    - Generate `RNDRANGE(mn, mx)` in a loop until a number other than `mn` is generated this way.  Return an error if `mn >= mx`.
- **`RNDRANGEMinMaxExc`, interval \(`mn`, `mx`\)**:
    - Generate `RNDRANGE(mn, mx)` in a loop until a number other than `mn` or `mx` is generated this way.  Return an error if `mn >= mx`.

<a id=Monte_Carlo_Sampling_Expected_Values_Integration_and_Optimization></a>
### Monte Carlo Sampling: Expected Values, Integration, and Optimization

**Requires random real numbers.**

Randomization is the core of **Monte Carlo sampling**; it can be used to estimate the **expected value** of a function given a random process or sampling distribution.  The following pseudocode estimates the expected value from a list of random numbers generated the same way.  Here, `EFUNC` is the function, and `MeanAndVariance` is given in the [**appendix**](#Mean_and_Variance_Calculation).  `Expectation` returns a list of two numbers &mdash; the estimated expected value and its standard error.

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

[**Monte Carlo integration**](https://en.wikipedia.org/wiki/Monte_Carlo_integration) is a way to estimate a multidimensional integral; randomly sampled numbers are put into a list (`nums`) and the estimated integral and its standard error are then calculated with `Expectation(nums)` with `EFUNC(x) = x`, and multiplied by the volume of the sampling domain.

A third application of Monte Carlo sampling is [**stochastic optimization**](http://mathworld.wolfram.com/StochasticOptimization.html) for finding the minimum or maximum value of a function with one or more variables; examples include [**_simulated annealing_**](https://en.wikipedia.org/wiki/Simulated_annealing) and [**_simultaneous perturbation stochastic approximation_**](https://en.wikipedia.org/wiki/Simultaneous_perturbation_stochastic_approximation) (see also (Spall 1998)<sup>[**(18)**](#Note18)</sup>).

<a id=Random_Walks_Additional_Examples></a>
### Random Walks: Additional Examples

**Requires random real numbers.**

- One example of a white noise process is a list of `Normal(0, 1)` numbers (_Gaussian white noise_).
- If `STATEJUMP()` is `RNDRANGE(-1, 1)`, the random state is advanced by a random real number in the interval [-1, 1].
- A **continuous-time process** models random behavior at every moment, not just at discrete times.  There are two popular examples:
    - A _Wiener process_ has random states and jumps that are normally distributed (a process of this kind is also known as _Brownian motion_). For a random walk that follows a Wiener process, `STATEJUMP()` is `Normal(mu * timediff, sigma * sqrt(timediff))`, where  `mu` is the average value per time unit, `sigma` is the volatility, and `timediff` is the time difference between samples.
    - In a _Poisson process_, the time between each event is a random exponential variable, namely, `-ln(RNDU01ZeroOneExc()) / rate`, where `rate` is the average number of events per time unit. An _inhomogeneous Poisson process_ results if `rate` can vary with the "timestamp" before each event jump.

<a id=Low_Discrepancy_Sequences></a>
### Low-Discrepancy Sequences

**Requires random real numbers.**

A [**_low-discrepancy sequence_**](https://en.wikipedia.org/wiki/Low-discrepancy_sequence) (or _quasirandom sequence_) is a sequence of numbers that follow a uniform distribution, but are less likely to form "clumps" than independent uniform random numbers are.  The following are examples:
- Sobol and Halton sequences are too complicated to show here.
- Linear congruential generators with modulus `m`, a full period, and "good lattice structure"; a sequence of `n`-dimensional points is then `[MLCG(i), MLCG(i+1), ..., MLCG(i+n-1)]` for each integer `i` in the interval \[1, `m`\] (L'Ecuyer 1999)<sup>[**(19)**](#Note19)</sup> (see example pseudocode below).

&nbsp;

    METHOD MLCG(seed) // m = 262139
      if seed<=0: return error
      return rem(92717*seed,262139)/262139.0
    END METHOD

In most cases, RNGs can be used to generate a "seed" to start the low-discrepancy sequence at.

In Monte Carlo integration and other estimations (described earlier), low-discrepancy sequences are often used to achieve more efficient "random" sampling.

<a id=Weighted_Choice_Involving_Real_Numbers></a>
### Weighted Choice Involving Real Numbers

The `WeightedChoice` method in "[**Weighted Choice With Replacement**](#Weighted_Choice_With_Replacement)" can be modified to accept real numbers other than integers as weights by changing `value = RNDINTEXC(sum)` to `value = RNDRANGEMaxExc(0, sum)`.

<a id=Weighted_Choice_Without_Replacement_Indefinite_Size_List></a>
#### Weighted Choice Without Replacement (Indefinite-Size List)

**Requires random real numbers.**

If the number of items in a list is not known in advance, then the following pseudocode implements a `RandomKItemsFromFileWeighted` that selects up to `k` random items from a file (`file`) of indefinite size (similarly to [**`RandomKItemsFromFile`**](#Pseudocode_for_Random_Sampling)).  See (Efraimidis and Spirakis 2005)<sup>[**(20)**](#Note20)</sup>, and see also (Efraimidis 2015)<sup>[**(21)**](#Note21)</sup>.  In the pseudocode below, `WEIGHT_OF_ITEM(item, thisIndex)` is a placeholder for arbitrary code that calculates the weight of an individual item based on its value and its index (starting at 0); the item is ignored if its weight is 0 or less.

    METHOD RandomKItemsFromFileWeighted(file, k)
      list = NewList()
      j = 0
      index = 0
      skIndex = 0
      smallestKey = 0
      t = 0
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
        key = pow(RNDU01(),1.0/weight)
        // NOTE: If all weights are integers, the following
        // two lines can be used instead of the previous line,
        // where nthroot(num, n) is the 'n'th root, rounded
        // down, of 'num', and X is an arbitrary integer
        // greater than 0:
        // if weight == 1: key = RNDINTEXC(X)
        // else: key = nthroot(RNDINTEXC(X)*X,weight)
        t = smallestKey
        if index == 0 or key < smallestKey
          skIndex = index
          smallestKey = key
        end
        if j < k // phase 1 (fewer than k items)
          AddItem(list, item)
          // To add the line number (starting at
          // 0) rather than the item, use the following
          // line instead of the previous one:
          // AddItem(list, thisIndex)
          j = j + 1
        else // phase 2
          if t < key: list[skIndex] = item
          // To add the line number (starting at
          // 0) rather than the item, use the following
          // line instead of the previous one:
          // if t < key: list[skIndex] = thisIndex
        end
      end
      // Optional shuffling here.
      // See NOTE 4 in RandomKItemsFromFile code.
      if size(list)>=2: Shuffle(list)
      return list
    end

> **Note:** Weighted choice _with replacement_ can be implemented by doing one or more concurrent runs of `RandomKItemsFromFileWeighted(file, 1)` (making sure each run traverses `file` the same way for multiple runs as for a single run) (Efraimidis 2015)<sup>[**(21)**](#Note21)</sup>.

<a id=Continuous_Weighted_Choice></a>
#### Continuous Weighted Choice

**Requires random real numbers.**

The continuous weighted choice method generates a random number that follows a continuous probability distribution (here, a [**_piecewise linear distribution_**](http://en.cppreference.com/w/cpp/numeric/random/piecewise_linear_distribution)).

The pseudocode below takes two lists as follows:

- `values` is a list of numbers (which need not be integers). If the numbers are arranged in ascending order, which they should, the first number in this list can be returned exactly, but not the last number.
- `weights` is a list of weights for the given numbers (where each number and its weight have the same index in both lists).   The greater a number's weight, the more likely it is that a number close to that number will be chosen.  Each weight should be 0 or greater.

&nbsp;

    METHOD ContinuousWeightedChoice(values, weights)
        if size(values) <= 0 or size(weights) < size(values): return error
        if size(values) == 1: return values[0]
        // Get the sum of all areas between weights
        // NOTE: Kahan summation is more robust
        // than the naive summing given here
        msum = 0
        areas = NewList()
        i = 0
        while i < size(values) - 1
          weightArea = abs((weights[i] + weights[i + 1]) * 0.5 *
                (values[i + 1] - values[i]))
          AddItem(areas, weightArea)
          msum = msum + weightArea
           i = i + 1
        end
        // Generate random numbers
        value = RNDRANGEMaxExc(0, sum)
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
           interp=wt
           if diff>0
            s=sqrt(w2*w2*wt+w1*w1-w1*w1*wt)
            interp=(s-w1)/diff
            if interp<0 or interp>1: interp=-(s+w1)/diff
           end
           if diff<0
            s=sqrt(w1*w1*wt+w2*w2-w2*w2*wt)
            interp=-(s-w2)/diff
            if interp<0 or interp>1: interp=(s+w2)/diff
            interp=1-interp
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

> **Note:** The Python sample code contains a variant to the method
> above for returning more than one random number in one call.
>
> **Example**: Assume `values` is the following: `[0, 1, 2, 2.5, 3]`, and `weights` is the following: `[0.2, 0.8, 0.5, 0.3, 0.1]`.  The weight for 2 is 0.5, and that for 2.5 is 0.3.  Since 2 has a higher weight than 2.5, numbers near 2 are more likely to be chosen than numbers near 2.5 with the `ContinuousWeightedChoice` method.

<a id=Mixtures_Additional_Examples></a>
### Mixtures: Additional Examples

**Requires random real numbers.**

1. Example 3 in "[**Mixtures of Distributions**](#Mixtures_of_Distributions)" can be adapted to nonoverlapping real number ranges by assigning weights `mx - mn` instead of `(mx - mn) + 1` and using `RNDRANGEMaxExc` instead of `RNDINTRANGE`.
2. A **hyperexponential distribution** is a mixture of [**exponential distributions**](#Gamma_Distribution), each one with a separate weight and separate rate.  An example is below.

         index = WeightedChoice([0.6, 0.3, 0.1])
         // Rates of the three exponential distributions
         rates = [0.3, 0.1, 0.05]
         // Generate an exponential random number with chosen rate
         number = -ln(RNDU01ZeroOneExc()) / rates[index]

&nbsp;

<a id=Transformations_of_Random_Numbers_Additional_Examples></a>
### Transformations of Random Numbers: Additional Examples

**Requires random real numbers.**

See the [**appendix**](#Mean_and_Variance_Calculation) for how calculating the mean of a list of numbers can be implemented.

1. Sampling a **Bates distribution** involves sampling _n_ random numbers by `RNDRANGE(minimum, maximum)`, then finding the mean of those numbers (strategy 8, mean).
2. A **compound Poisson distribution** models the sum<sup>[**(12)**](#Note12)</sup>
 of _n_ random numbers each generated the same way, where _n_ follows a [**Poisson distribution**](#Poisson_Distribution) (e.g., `n = Poisson(10)` for an average of 10 numbers) (strategy 7, sum).
3. A **P&oacute;lya&ndash;Aeppli distribution** is a compound Poisson distribution in which the random numbers are generated by `NegativeBinomial(1, 1-p)+1` for a fixed `p`.
4. A **hypoexponential distribution** models the sum<sup>[**(12)**](#Note12)</sup>
 of _n_ random numbers that follow an exponential distribution and each have a separate `lamda` parameter (see "[**Gamma Distribution**](#Gamma_Distribution)").
5. A random point (`x`, `y`) can be transformed (strategy 9, geometric transformation) to derive a point with **correlated random** coordinates (old `x`, new `x`) as follows (see (Saucier 2000)<sup>[**(22)**](#Note22)</sup>, sec. 3.8): `[x, y*sqrt(1 - rho * rho) + rho * x]`, where `x` and `y` are independent random numbers generated the same way, and `rho` is a _correlation coefficient_ in the interval \[-1, 1\] (if `rho` is 0, the variables are uncorrelated).

<a id=Random_Numbers_from_a_Distribution_of_Data_Points></a>
### Random Numbers from a Distribution of Data Points

**Requires random real numbers.**

**Density estimation models.** Generating random numbers (or data points) based on how a list of numbers (or data points) is distributed involves a family of data models called [**density estimation**](http://scikit-learn.org/stable/modules/density.html) models, including the ones given below.  These models seek to describe the distribution of data points in a given data set, where areas with more points are more likely to be sampled.

1. **Histograms** are sets of one or more non-overlapping _bins_, which are generally of equal size.  Histograms are [**_mixtures_**](#Mixtures_of_Distributions), where each bin's weight is the number of data points in that bin.  After a bin is randomly chosen, a random data point that could fit in that bin is generated (that point need not be an existing data point).
2. **Gaussian** [**mixture models**](https://en.wikipedia.org/wiki/Mixture_model) are also mixtures, in this case, mixtures of one or more [**Gaussian (normal) distributions**](#Normal_Gaussian_Distribution).
3. **Kernel distributions** are mixtures of sampling distributions, one for each data point. Estimating a kernel distribution is called [**_kernel density estimation_**](https://en.wikipedia.org/wiki/Kernel_density_estimation).  To sample from a kernel distribution:
    1. Choose one of the numbers or points in the list at random [**with replacement**](#Sampling_With_Replacement_Choosing_a_Random_Item_from_a_List).
    2. Add a randomized "jitter" to the chosen number or point; for example, add a separately generated `Normal(0, sigma)` to the chosen number or each component of the chosen point, where `sigma` is the _bandwidth_<sup>[**(23)**](#Note23)</sup>.
4. **Stochastic interpolation** is described in (Saucier 2000)<sup>[**(22)**](#Note22)</sup>, sec. 5.3.4.  It involves choosing a data point at random, taking the mean of that point and its _k_ nearest neighbors, and shifting that mean by a random weighted sum<sup>[**(12)**](#Note12)</sup>
 of the differences between each of those points and that mean (here, the weight is `RNDRANGE((1-sqrt(k*3))/(k+1.0), (1+sqrt(k*3))/(k+1.0))` for each point). This approach assumes that the lowest and highest values of each dimension are 0 and 1, respectively, so that arbitrary data points have to be shifted and scaled accordingly.
5. **Fitting a known distribution** (such as the normal distribution), with unknown parameters, to data can be done by [**maximum likelihood estimation**](https://en.wikipedia.org/wiki/Maximum_likelihood_estimation) or the [**method of moments**](https://en.wikipedia.org/wiki/Method_of_moments), among other ways.  If several kinds of distributions are possible fitting choices, then the kind showing the best _goodness of fit_ for the data (e.g., chi-squared goodness of fit) is chosen.

**Regression models.** A _regression model_ is a model that summarizes data as a formula and an error term.  If an application has data in the form of inputs and outputs (e.g., monthly sales figures) and wants to sample a random but plausible output given a known input point (e.g., sales for a future month), then the application can fit and sample a regression model for that data.  For example, a _linear regression model_, which simulates the value of `y` given known inputs `a` and `b`, can be sampled as follows: `y = c1 * a + c2 * b + c3 + Normal(mse)`, where `mse` is the mean squared error and `c1`, `c2`, and `c3` are the coefficients of the model.  (Here, `Normal(mse)` is the error term.)

**Generative models.** These are machine-learning models that take random numbers as input and generate outputs (such as images or sounds) that are similar to examples they have already seen.  [**_Generative adversarial networks_**](https://en.wikipedia.org/wiki/Generative_adversarial_network) are one kind of generative model.

> **Note:** A comprehensive survey of density estimation, regression, or generative models, or how to fit such models to data, are outside the scope of this document.<sup>[**(24)**](#Note24)</sup>

<a id=Random_Numbers_from_an_Arbitrary_Distribution></a>
### Random Numbers from an Arbitrary Distribution

**Requires random real numbers.**

Many probability distributions can be defined in terms of any of the following:

* The [**_cumulative distribution function_**](https://en.wikipedia.org/wiki/Cumulative_distribution_function), or _CDF_, returns, for each number, the probability for a randomly generated variable to be equal to or less than that number; the probability is in the interval [0, 1].
* The [**_probability density function_**](https://en.wikipedia.org/wiki/Probability_density_function), or _PDF_, is, roughly and intuitively, a curve of weights 0 or greater, where for each number, the greater its weight, the more likely a number close to that number is randomly chosen.<sup>[**(25)**](#Note25)</sup>
* The _inverse cumulative distribution function_ (_inverse CDF_) is the inverse of the CDF and maps numbers in the interval [0, 1\) to numbers in the distribution, from low to high.

Depending on what information is known about the distribution, random numbers that approximately follow that distribution can be generated as follows:

-  **PDF is known**, even if the area under the PDF isn't 1:

    - **Piecewise interpolation.** Use the PDF to calculate the weights for a number of sample points (usually regularly spaced). Create one list with the sampled points in ascending order (the `list`) and another list of the same size with the PDF's values at those points (the `weights`).  Finally, generate a random number bounded by the lowest and highest sampled point using a weighted choice method (e.g., [**`ContinuousWeightedChoice(list, weights)`**](#Continuous_Weighted_Choice)).  The [**Python sample code**](https://peteroupc.github.io/randomgen.zip) includes a `numbers_from_pdf` method (for continuous PDFs) and an `integers_from_pdf` method (for discrete PDFs) that implement this approach.
    - [**Rejection sampling.**](#Rejection_Sampling)  If the PDF can be more easily sampled by another distribution with its own PDF (`PDF2`) that "dominates" `PDF` in the sense that `PDF2(x) >= PDF(x)` at every valid `x`, then generate random numbers with that distribution until a number (`n`) that satisfies `PDF(n) >= RNDRANGEMaxExc(0, PDF2(n))` is generated this way (that is, sample points in `PDF2` until a point falls within `PDF`). (See also Saucier 2000, pp. 6-7, 39; Devroye 1986, pp. 41-43; and "[**Generating Pseudorandom Numbers**](https://mathworks.com/help/stats/generating-random-data.html)".)

        To sample a random number in the interval [`low`, `high`) from a PDF with a positive maximum value no greater than `peak` at that interval, generate `x = RNDRANGEMaxExc(low, high)` and `y = RNDRANGEMaxExc(0, peak)` until `y < PDF(x)`, then take the last `x` generated this way. (See also Saucier 2000, pp. 6-7.)

        For example, a custom distribution's PDF, `PDF`, is `exp(-abs(x*x*x))`, and the exponential distribution's PDF, `PDF2`, is `exp(-x)`.  The exponential PDF "dominates" the other PDF (at every `x` 0 or greater) if we multiply it by 1.5, so that `PDF2` is now `1.5 * exp(-x)`.  Now we can generate numbers from our custom distribution by sampling exponential points until a point falls within `PDF`.  This is done by generating `n = -ln(RNDU01ZeroOneExc())` until `PDF(n) >= RNDRANGEMaxExc(0, PDF2(n))`.
    - [**Markov-chain Monte Carlo**](https://en.wikipedia.org/wiki/Markov_chain_Monte_Carlo) **(MCMC).** If many random numbers from the given PDF need to be generated, then an MCMC algorithm can be used, with the disadvantage that the resulting random numbers will not be chosen independently of each other.  MCMC algorithms include Metropolis&ndash;Hastings and slice sampling (Neal 2003)<sup>[**(26)**](#Note26)</sup>. Generally, as more numbers are generated, the MCMC algorithm converges to the given distribution; this is why usually, random numbers from the first few (e.g., first 1000) iterations are ignored ("burn in").  MCMC can also be used to find a suitable sampling range for the Piecewise interpolation method, above.  The [**Python sample code**](https://peteroupc.github.io/randomgen.zip) includes methods called `mcmc` and `mcmc2` that implement Metropolis&ndash;Hastings for PDFs that take single numbers or two-dimensional points, respectively, and a method called `slicesample` that implements slice sampling.

- **PDF and a uniform random variable in the interval \[0, 1\) (`randomVariable`)** are known: Create `list` and `weights` as given in the Piecewise interpolation method, above, then divide each item in `weights` by the sum<sup>[**(12)**](#Note12)</sup>
 of `weights`'s items, then generate [**`ContinuousWeightedChoice(list, weights)`**](#Continuous_Weighted_Choice) (except that method is modified to use `value = randomVariable` rather than `value = RNDRANGEMaxExc(0, sum)`).

- **Inverse CDF is known:** Generate `ICDF(RNDU01ZeroOneExc())`, where `ICDF(X)` is the inverse CDF ([**_inverse transform sampling_**](https://en.wikipedia.org/wiki/Inverse_transform_sampling)).

- **Inverse CDF and a uniform random variable in the interval \[0, 1\) (`randomVariable`)** are known: Generate `ICDF(randomVariable)`, where `ICDF(X)` is the inverse CDF.

- **CDF is known**: In this case, the CDF is usually numerically inverted to generate a random number from that distribution.  For example, see the `from_interp` and `numbers_from_cdf` methods in the [**Python sample code**](https://peteroupc.github.io/randomgen.zip).

> **Note:** Lists of PDFs, CDFs, or inverse CDFs are outside the scope of this page.

<a id=Gibbs_Sampling></a>
### Gibbs Sampling

**Usually requires random real numbers.**

Gibbs sampling<sup>[**(27)**](#Note27)</sup> is a Markov-chain Monte Carlo algorithm.  It involves repeatedly generating random numbers from two or more distributions, each of which uses a random number from the previous distribution (_conditional distributions_); however, the resulting random numbers will not be chosen independently of each other.

> **Example:** In one Gibbs sampler, an initial value for `y` is chosen, then multiple `x`, `y` pairs of random numbers are generated, where `x = BetaDist(y, 5)` then `y = Poisson(x * 10)`.

<a id=Dice_Optimization_for_Many_Dice></a>
### Dice: Optimization for Many Dice

**Requires random real numbers.**

If there are many dice to roll, the following pseudocode implements a faster approximation, which uses the fact that the dice-roll distribution approaches a "discrete" normal distribution as the number of dice increases.<sup>[**(28)**](#Note28)</sup>

    METHOD DiceRoll2(dice, sides, bonus)
      if dice < 50: return DiceRoll(dice,sides,bonus)
      mean = dice * (sides + 1) * 0.5
      sigma = sqrt(dice * (sides * sides - 1) / 12)
      ret = -1
      while ret < dice or ret > dice * sides
        ret = round(Normal(mean, sigma))
      end
      return max(0, ret + bonus)
    END METHOD

<a id=Normal_Gaussian_Distribution></a>
### Normal (Gaussian) Distribution

**Requires random real numbers.**

The [**_normal distribution_**](https://en.wikipedia.org/wiki/Normal_distribution) (also called the Gaussian distribution) takes the following two parameters:
- `mu` (&mu;) is the mean (average), or where the peak of the distribution's "bell curve" is.
- `sigma` (&sigma;), the standard deviation, affects how wide the "bell curve" appears. The
probability that a normally-distributed random number will be within one standard deviation from the mean is about 68.3%; within two standard deviations (2 times `sigma`), about 95.4%; and within three standard deviations, about 99.7%.  (Some publications give &sigma;<sup>2</sup>, or variance, rather than standard deviation, as the second parameter.  In this case, the standard deviation is the variance's square root.)

There are a number of methods for normal random number generation.<sup>[**(29)**](#Note29)</sup> The pseudocode below uses the polar method to generate two normal random numbers. (Ways to adapt the pseudocode to output only one random number at a time, rather than two, are outside the scope of this document.  In this document, the name `Normal` means a method that returns only one normally-distributed random number rather than two.)

    METHOD Normal2(mu, sigma)
      while true
        a = RNDU01ZeroExc()
        b = RNDU01ZeroExc()
        if RNDINT(1) == 0: a = 0 - a
        if RNDINT(1) == 0: b = 0 - b
        c = a * a + b * b
        if c != 0 and c <= 1
           c = sqrt(-2 * ln(c) / c)
           return [a * mu * c + sigma, b * mu * c + sigma]
        end
      end
    END METHOD

The following method implements a ratio-of-uniforms technique and can be used instead of or in addition to the polar method above.

    METHOD Normal(mu, sigma)
        bmp = sqrt(2.0/exp(1.0)) // about 0.8577638849607068
        while true
            a=RNDU01ZeroExc()
            b=RNDRANGE(-bmp,bmp)
            if b*b <= -a * a * 4 * ln(a)
                return (b * sigma / a) + mu
            end
        end
    END METHOD

<a id=Binomial_Distribution_Optimization_for_Many_Trials></a>
### Binomial Distribution: Optimization for Many Trials

The _binomial distribution_ models the number of successful trials among a fixed number of independently performed trials with a fixed probability of success.

**Requires random real numbers:** The pseudocode below implements an optimization for many trials.  In the pseudocode&mdash;
- `trials` is the number of independent trials, and
- `p` is the probability of success in each trial (where `p <= 0` means never, `p >= 1` means always, and `p = 0.5` means an equal chance of success or failure).

&nbsp;

    METHOD Binomial(trials, p)
        if trials < 0: return error
        if trials == 0: return 0
        // Always succeeds
        if p >= 1.0: return trials
        // Always fails
        if p <= 0.0: return 0
        count = 0
        // Suggested by Saucier, R. in "Computer
        // generation of probability distributions",
        // 2000, p. 49
        tp = trials * p
        if tp > 25 or (tp > 5 and p > 0.1 and p < 0.9)
             countval = -1
             while countval < 0 or countval > trials
                  countval = round(Normal(tp, sqrt(tp)))
             end
             return countval
        end
        if p == 0.5
          for i in 0...trials: count=count+RNDINT(1)
        else
            i = 0
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

<a id=Poisson_Distribution></a>
### Poisson Distribution

**Requires random real numbers.**

The following method generates a random integer that follows a _Poisson distribution_ and is based on Knuth's method from 1969.  In the method&mdash;

- `mean` is the average number of independent events of a certain kind per fixed unit of time or space (for example, per day, hour, or square kilometer), and can be an integer or a non-integer (the method allows `mean` to be 0 mainly for convenience), and
- the method's return value gives a random number of such events within one such unit.

&nbsp;

    METHOD Poisson(mean)
        if mean < 0: return error
        if mean == 0: return 0
        p = 1.0
        // Suggested by Saucier, R. in "Computer
        // generation of probability distributions", 2000, p. 49
        if mean > 9
            p = -1.0
            while p < 0: p = round(
              Normal(mean, sqrt(mean)))
            return p
        end
        pn = exp(-mean)
        count = 0
        while true
            p = p * RNDU01OneExc()
            if p <= pn: return count
            count = count + 1
        end
    END METHOD

<a id=Gamma_Distribution></a>
### Gamma Distribution

**Requires random real numbers.**

The following method generates a random number that follows a _gamma distribution_ and is based on Marsaglia and Tsang's method from 2000.  Usually, the number expresses either&mdash;

- the lifetime (in days, hours, or other fixed units) of a random component with an average lifetime of `meanLifetime`, or
- a random amount of time (in days, hours, or other fixed units) that passes until as many events as `meanLifetime` happen.

Here, `meanLifetime` must be an integer or noninteger greater than 0, and `scale` is a scaling parameter that is greater than 0, but usually 1.

    METHOD GammaDist(meanLifetime, scale)
        // Needs to be greater than 0
        if meanLifetime <= 0 or scale <= 0: return error
        // Exponential distribution special case if
        // `meanLifetime` is 1 (see also Devroye 1986, p. 405)
        if meanLifetime == 1: return -ln(RNDU01ZeroOneExc()) * scale
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
        return ret * scale
    end

Distributions based on the gamma distribution:

- **3-parameter gamma distribution**: `pow(GammaDist(a, 1), 1.0 / c) * b`, where `c` is another shape parameter.
- **4-parameter gamma distribution**: `pow(GammaDist(a, 1), 1.0 / c) * b + d`, where `d` is the minimum value.
- **Exponential distribution**: `GammaDist(1, 1.0 / lamda)` or `-ln(RNDU01ZeroOneExc()) / lamda`, where `lamda` is the inverse scale. Usually, `lamda` is the probability that an independent event of a given kind will occur in a given span of time (such as in a given day or year), and the random result is the number of spans of time until that event happens.  (This distribution is thus useful for modeling a _Poisson process_.) `1.0 / lamda` is the scale (mean), which is usually the average waiting time between two independent events of the same kind.
- **Erlang distribution**: `GammaDist(n, 1.0 / lamda)`.  Expresses a sum of `n` exponential random variables with the given `lamda` parameter.
- **Max-of-uniform distribution** (Devroye 1986, p. 675):  `1.0 - x/(x+GammaDist(n,1))`, where `n` is the number of uniform random variables, and `x` is `GammaDist(1,1)`.  Using `x/(x+GammaDist(n,1))` instead results in a **min-of-uniform distribution** (Devroye 1986, p. 210).

<a id=Beta_Distribution></a>
### Beta Distribution

**Requires random real numbers.**

In the following method, which generates a random number that follows a _beta distribution_, `a` and `b` are two parameters each greater than 0.  The range of the beta distribution is [0, 1).

    METHOD BetaDist(self, a, b)
      if b==1 and a==1: return RNDU01()
      if a==1: return 1.0-pow(RNDU01(),1.0/b)
      if b==1: return pow(RNDU01(),1.0/a)
      x=GammaDist(a,1)
      return x/(x+GammaDist(b,1))
    END METHOD

<a id=Negative_Binomial_Distribution></a>
### Negative Binomial Distribution

**Requires random real numbers.**

A _negative binomial distribution_ models the number of failing trials that happen before a fixed number of successful trials (`successes`).  Each trial is independent and has a success probability of `p` (where `p <= 0` means never, `p >= 1` means always, and `p = 0.5` means an equal chance of success or failure).

    METHOD NegativeBinomial(successes, p)
        // Needs to be 0 or greater
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
            return Poisson(GammaDist(successes, (1 - p) / p))
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

> **Note:** A **geometric distribution** can be sampled by generating `NegativeBinomial(1, p)`, where `p` has the same meaning as in the negative binomial distribution.  Here, the sampled number is the number of failures that have happened before a success happens. (Saucier 2000, p. 44, also mentions an alternative definition that includes the success.)  For example, if `p` is 0.5, the geometric distribution models the task "Flip a coin until you get tails, then count the number of heads."

<a id=von_Mises_Distribution></a>
### von Mises Distribution

**Requires random real numbers.**

The _von Mises distribution_ describes a distribution of circular angles. In the following method, which generates a random number from that distribution&mdash;

- `mean` is the mean angle,
- `kappa` is a shape parameter (the distribution is uniform at `kappa = 0` and approaches a normal distribution with increasing `kappa`), and
- the method can return a number within &pi; of that mean.

The algorithm below is based on the Best&ndash;Fisher algorithm from 1979 (as described in Devroye 1986 with errata incorporated).

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
### Stable Distribution

**Requires random real numbers.**

As more and more independent random numbers from the same distribution are added together, their distribution tends to a [**_stable distribution_**](https://en.wikipedia.org/wiki/Stable_distribution), which resembles a curve with a single peak, but with generally "fatter" tails than the normal distribution.  The pseudocode below uses the Chambers&ndash;Mallows&ndash;Stuck algorithm.  The `Stable` method, implemented below, takes two parameters:

- `alpha` is a stability index in the interval (0, 2].
- `beta` is a skewness in the interval [-1, 1]; if `beta` is 0, the curve is symmetric.

&nbsp;

    METHOD Stable(alpha, beta)
        if alpha <=0 or alpha > 2: return error
        if beta < -1 or beta > 1: return error
        halfpi = pi * 0.5
        unif=RNDRANGEMinMaxExc(-halfpi, halfpi)
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

- **Four-parameter stable distribution**: `Stable(alpha, beta) * sigma + mu`, where `mu` is the mean and ` sigma` is the scale.  If `alpha` and `beta` are 1, the result is a **Landau distribution**.
- **"Type 0" stable distribution**: `Stable(alpha, beta) * sigma + (mu - sigma * beta * x)`, where `x` is `ln(sigma)*2.0/pi` if `alpha` is 1, and `tan(pi*0.5*alpha)` otherwise.

<a id=Multivariate_Normal_Multinormal_Distribution></a>
### Multivariate Normal (Multinormal) Distribution

**Requires random real numbers.**

The following pseudocode calculates a random point in space that follows a [**_multivariate normal (multinormal) distribution_**](https://en.wikipedia.org/wiki/Multivariate_normal_distribution).  The method `MultivariateNormal` takes the following parameters:

- A list, `mu` (&mu;), which indicates the means to add to each component of the random point. `mu` can be `nothing`, in which case each component will have a mean of zero.
- A list of lists `cov`, that specifies a _covariance matrix_ (&Sigma;, a symmetric positive definite NxN matrix, where N is the number of components of the random point).

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
      variables=NewList()
      for j in 0...mulen: AddItem(variables, Normal(0, 1))
      while i<mulen
        nv=Normal(0,1)
        msum = 0
        if mu == nothing: msum=mu[i]
        for j in 0...mulen: msum=msum+variables[j]*cho[j][i]
        AddItem(ret, msum)
        i=i+1
      end
      return ret
    end

> **Note:** The Python sample code contains a variant of this
> method for generating multiple random points in one call.
>
> **Examples:**
>
> 1. A **binormal distribution** (two-variable multinormal distribution) can be sampled using the following idiom: `MultivariateNormal([mu1, mu2], [[s1*s1, s1*s2*rho], [rho*s1*s2, s2*s2]])`, where `mu1` and `mu2` are the means of the two random variables, `s1` and `s2` are their standard deviations, and `rho` is a _correlation coefficient_ greater than -1 and less than 1 (0 means no correlation).
> 2. A **log-multinormal distribution** can be sampled by generating numbers from a multinormal distribution, then applying `exp(n)` to the resulting numbers, where `n` is each number generated this way.
> 3. A **Beckmann distribution** can be sampled by calculating `sqrt(x*x+y*y)`, where `x` and `y` are the two numbers in a binormal random pair (see example 1).
> 4. A **Rice (Rician) distribution** is a Beckmann distribution in which the binormal random pair is generated with `m1 = m2 = a / sqrt(2)`, `rho = 0`, and `s1 = s2 = b`, where `a` and `b` are the parameters to the Rice distribution.
> 5. A **Rice&ndash;Norton distributed** random variable is the norm (see the appendix) of the following point: `MultivariateNormal([v,v,v],[[w,0,0],[0,w,0],[0,0,w]])`, where `v = a/sqrt(m*2)`, `w = b*b/m`, and `a`, `b`, and `m` are the parameters to the Rice&ndash;Norton distribution.
> 6. A **standard [**complex normal distribution**](https://en.wikipedia.org/wiki/Complex_normal_distribution)** is a binormal distribution in which the binormal random pair is generated with `s1 = s2 = sqrt(0.5)` and `mu1 = mu2 = 0` and treated as the real and imaginary parts of a complex number.

<a id=Random_Real_Numbers_with_a_Given_Positive_Sum></a>
### Random Real Numbers with a Given Positive Sum

**Requires random real numbers.**

Generating _n_ `GammaDist(total, 1)` numbers and dividing them by their sum<sup>[**(12)**](#Note12)</sup>
 will result in _n_ numbers that (approximately) sum to `total`, where the combination of numbers is chosen uniformly at random (see a [**Wikipedia article**](https://en.wikipedia.org/wiki/Dirichlet_distribution#Gamma_distribution)).  For example, if `total` is 1, the numbers will (approximately) sum to 1.  Note that in the exceptional case that all numbers are 0, the process should repeat.

> **Notes:**
>
> 1. Notes 1 and 2 in the section "Random Integers with a Given Positive Sum" apply here.
> 2. The **Dirichlet distribution**, as defined in some places (e.g., _Mathematica_; Devroye 1986, p. 594), models a uniformly randomly chosen combination of _n_ random numbers that sum to 1, and can be sampled by generating _n_+1 random [**gamma-distributed**](#Gamma_Distribution) numbers, each with separate parameters, taking their sum<sup>[**(12)**](#Note12)</sup>, and dividing the first _n_ numbers by that sum.

<a id=Gaussian_and_Other_Copulas></a>
### Gaussian and Other Copulas

**Requires random real numbers.**

A _copula_ is a distribution describing the dependence between random numbers.

One example is a _Gaussian copula_; this copula is sampled by sampling from a [**multinormal distribution**](#Multivariate_Normal_Multinormal_Distribution), then converting the resulting numbers to uniformly-distributed, but dependent, numbers. In the following pseudocode, which implements a Gaussian copula:

- The parameter `covar` is the covariance matrix for the multinormal distribution.
- `erf(v)` is the [**error function**](https://en.wikipedia.org/wiki/Error_function) of the variable `v` (see the appendix).

&nbsp;

    METHOD GaussianCopula(covar)
       mvn=MultivariateNormal(nothing, covar)
       for i in 0...size(covar)
          // Apply the normal distribution's CDF
          // to get uniform variables
          mvn[i] = (erf(mvn[i]/(sqrt(2)*sqrt(covar[i][i])))+1)*0.5
       end
       return mvn
    END METHOD

Each of the resulting uniform numbers will be in the interval [0, 1], and each one can be further transformed to any other probability distribution (which is called a _marginal distribution_ here) by one of the methods given in "[**Random Numbers from an Arbitrary Distribution**](#Random_Numbers_from_an_Arbitrary_Distribution)". (See also Cario and Nelson 1997.)

> **Examples:**
>
> 1. To generate two dependent uniform variables with a Gaussian copula, generate `GaussianCopula([[1, rho], [rho, 1]])`, where `rho` is the Pearson correlation coefficient, in the interval [-1, 1]. (Other correlation coefficients besides `rho` exist. For example, for a two-variable Gaussian copula, the [**Spearman correlation coefficient**](https://en.wikipedia.org/wiki/Rank_correlation) `srho` can be converted to `rho` by `rho = sin(srho * pi / 6) * 2`.  Other correlation coefficients are not further discussed in this document.)
> 2. The following example generates two random numbers that follow a Gaussian copula with exponential marginals (`rho` is the Pearson correlation coefficient, and `rate1` and `rate2` are the rates of the two exponential marginals).
>
>         METHOD CorrelatedExpo(rho, rate1, rate2)
>            copula = GaussianCopula([[1, rho], [rho, 1]])
>            // Transform to exponentials using that
>            // distribution's inverse CDF
>            return [-ln(copula[0]) / rate1,
>              -ln(copula[1]) / rate2]
>         END METHOD

Other kinds of copulas describe different kinds of dependence between random numbers.  Examples of other copulas are&mdash;

- the **Fr&eacute;chet&ndash;Hoeffding upper bound copula** _\[x, x, ..., x\]_ (e.g., `[x, x]`), where `x = RNDU01()`,
- the **Fr&eacute;chet&ndash;Hoeffding lower bound copula** `[x, 1.0 - x]` where `x = RNDU01()`,
- the **product copula**, where each number is a separately generated `RNDU01()` (indicating no dependence between the numbers), and
- the **Archimedean copulas**, described by M. Hofert and M. M&auml;chler (2011)<sup>[**(30)**](#Note30)</sup>.

<a id=Index_of_Non_Uniform_Distributions></a>
### Index of Non-Uniform Distributions

**Many distributions here require random real numbers.**

Most commonly used:
- **Beta distribution**: See [**Beta Distribution**](#Beta_Distribution).
- **Binomial distribution**: See [**Binomial Distribution: Optimization for Many Trials**](#Binomial_Distribution_Optimization_for_Many_Trials).
- **Binormal distribution**: See [**Multivariate Normal (Multinormal) Distribution**](#Multivariate_Normal_Multinormal_Distribution).
- **Cauchy (Lorentz) distribution**: `scale * tan(RNDRANGEMinMaxExc(-pi*0.5, pi*0.5)) + mu`, where `scale` is the scale and `mu` is the location of the distribution's curve peak (mode).  This distribution is similar to the normal distribution, but with "fatter" tails.
- **Chi-squared distribution**: `GammaDist(df * 0.5 + Poisson(sms * 0.5), 2)`, where `df` is the number of degrees of freedom and `sms` is the sum of mean squares (where `sms` other than 0 indicates a _noncentral_ distribution).
- **Dice**: See [**Dice**](#Dice).
- **Exponential distribution**: See [**Gamma Distribution**](#Gamma_Distribution).
- **Extreme value distribution**: `a - ln(-ln(RNDU01ZeroOneExc())) * b`, where `b` is the scale and `a` is the location of the distribution's curve peak (mode).  This expresses a distribution of maximum values.
- **Gamma distribution**: See [**Gamma Distribution**](#Gamma_Distribution).
- **Gaussian distribution**: See [**Normal (Gaussian) Distribution**](#Normal_Gaussian_Distribution).
- **Geometric distribution**: See [**Negative Binomial Distribution**](#Negative_Binomial_Distribution).
- **Gumbel distribution**: `a + ln(-ln(RNDU01ZeroOneExc())) * b`, where `b` is the scale and `a` is the location of the distribution's curve peak (mode). This expresses a distribution of minimum values.
- **Inverse gamma distribution**: `b / GammaDist(a, 1)`, where `a` and `b` have the
 same meaning as in the gamma distribution.  Alternatively, `1.0 / (pow(GammaDist(a, 1), 1.0 / c) / b + d)`, where `c` and `d` are shape and location parameters, respectively.
- **Laplace (double exponential) distribution**: `(ln(RNDU01ZeroExc()) - ln(RNDU01ZeroExc())) * beta + mu`, where `beta` is the scale and `mu` is the mean.
- **Logarithmic distribution**: `min + (max - min) * RNDU01OneExc() * RNDU01OneExc()`, where `min` is the minimum value and `max` is the maximum value (Saucier 2000, p. 26).  In this distribution, numbers closer to `min` are exponentially more likely than numbers closer to `max`.
- **Logarithmic normal distribution**: `exp(Normal(mu, sigma))`, where `mu` and `sigma`
 have the same meaning as in the normal distribution.
- **Multinormal distribution**: See multivariate normal distribution.
- **Multivariate normal distribution**: See [**Multivariate Normal (Multinormal) Distribution**](#Multivariate_Normal_Multinormal_Distribution).
- **Normal distribution**: See [**Normal (Gaussian) Distribution**](#Normal_Gaussian_Distribution).
- **Poisson distribution**: See [**Poisson Distribution**](#Poisson_Distribution).
- **Pareto distribution**: `pow(RNDU01ZeroOneExc(), -1.0 / alpha) * minimum`, where `alpha`  is the shape and `minimum` is the minimum.
- **Rayleigh distribution**: `a * sqrt(-2 * ln(RNDU01ZeroExc()))`, where `a` is the scale and is greater than 0.  If `a` follows a logarithmic normal distribution, the result is a _Suzuki distribution_.
- **Standard normal distribution**: `Normal(0, 1)`.  See also [**Normal (Gaussian) Distribution**](#Normal_Gaussian_Distribution).
- **Student's _t_-distribution**: `Normal(cent, 1) / sqrt(GammaDist(df * 0.5, 2 / df))`, where `df` is the number of degrees of freedom, and _cent_ is the mean of the normally-distributed random number.  A `cent` other than 0 indicates a _noncentral_ distribution.
- **Triangular distribution**: `ContinuousWeightedChoice([startpt, midpt, endpt], [0, 1, 0])`. The distribution starts at `startpt`, peaks at `midpt`, and ends at `endpt`.
- **Weibull distribution**: `b * pow(-ln(RNDU01ZeroExc()),1.0 / a) + loc`, where `a` is the shape, `b` is the scale `loc` is the location, and `a` and `b` are greater than 0.

Miscellaneous:

- **3-parameter gamma distribution**: See [**Gamma Distribution**](#Gamma_Distribution).
- **4-parameter gamma distribution**: See [**Gamma Distribution**](#Gamma_Distribution).
- **4-parameter stable distribution**: See [**Stable Distribution**](#Stable_Distribution).
- **Archimedean copulas**: See [**Gaussian and Other Copulas**](#Gaussian_and_Other_Copulas).
- **Arcsine distribution**: `min + (max - min) * BetaDist(0.5, 0.5)`, where `min` is the minimum value and `max` is the maximum value (Saucier 2000, p. 14).
- **Bates distribution**: See [**Transformations of Random Numbers: Additional Examples**](#Transformations_of_Random_Numbers_Additional_Examples).
- **Beckmann distribution**: See [**Multivariate Normal (Multinormal) Distribution**](#Multivariate_Normal_Multinormal_Distribution).
- **Beta binomial distribution**: `Binomial(trials, BetaDist(a, b))`, where `a` and `b` are
 the two parameters of the beta distribution, and `trials` is a parameter of the binomial distribution.
- **Beta negative binomial distribution**: `NegativeBinomial(successes, BetaDist(a, b))`, where `a` and `b` are the two parameters of the beta distribution, and `successes` is a parameter of the negative binomial distribution. If _successes_ is 1, the result is a _Waring&ndash;Yule distribution_.
- **Beta-PERT distribution**: `startpt + size * BetaDist(1.0 + (midpt - startpt) * shape / size, 1.0 + (endpt - midpt) * shape / size)`. The distribution starts  at `startpt`, peaks at `midpt`, and ends at `endpt`, `size` is `endpt - startpt`, and `shape` is a shape parameter that's 0 or greater, but usually 4.  If the mean (`mean`) is known rather than the peak, `midpt = 3 * mean / 2 - (startpt + endpt) / 4`.
- **Beta prime distribution**: `pow(GammaDist(a, 1), 1.0 / alpha) * scale / pow(GammaDist(b, 1), 1.0 / alpha)`, where `a`, `b`, and `alpha` are shape parameters and `scale` is the scale. If _a_ is 1, the result is a _Singh&ndash;Maddala distribution_; if _b_ is 1, a _Dagum distribution_; if _a_ and _b_ are both 1, a _logarithmic logistic distribution_.
- **Birnbaum&ndash;Saunders distribution**: `pow(sqrt(4+x*x)+x,2)/(4.0*lamda)`, where `x = Normal(0,gamma)`, `gamma` is a shape parameter, and `lamda` is a scale parameter.
- **Chi distribution**: `sqrt(GammaDist(df * 0.5, 2))`, where `df` is the number of degrees of freedom.
- **Compound Poisson distribution**: See [**Transformations of Random Numbers: Additional Examples**](#Transformations_of_Random_Numbers_Additional_Examples).
- **Cosine distribution**: `min + (max - min) * atan2(x, sqrt(1 - x * x)) / pi`, where `x = RNDRANGE(-1, 1)` and `min` is the minimum value and `max` is the maximum value (Saucier 2000, p. 17; inverse sine replaced with `atan2` equivalent).
- **Dagum distribution**: See beta prime distribution.
- **Dirichlet distribution**: See [**Random Real Numbers with a Given Positive Sum**](#Random_Real_Numbers_with_a_Given_Positive_Sum).
- **Double logarithmic distribution**: `min + (max - min) * (0.5 + (RNDINT(1) * 2 - 1) * 0.5 * RNDU01OneExc() * RNDU01OneExc())`, where `min` is the minimum value and `max` is the maximum value (see also Saucier 2000, p. 15, which shows the wrong X axes).
- **Erlang distribution**: See [**Gamma Distribution**](#Gamma_Distribution).
- **Estoup distribution**: See zeta distribution.
- **Fr&eacute;chet distribution**: `b*pow(-ln(RNDU01ZeroExc()),-1.0/a) + loc`, where `a` is the shape, `b` is the scale, and `loc` is the location of the distribution's curve peak (mode). This expresses a distribution of maximum values.
- **Fr&eacute;chet&ndash;Hoeffding lower bound copula**: See [**Gaussian and Other Copulas**](#Gaussian_and_Other_Copulas).
- **Fr&eacute;chet&ndash;Hoeffding upper bound copula**: See [**Gaussian and Other Copulas**](#Gaussian_and_Other_Copulas).
- **Gaussian copula**: See [**Gaussian and Other Copulas**](#Gaussian_and_Other_Copulas).
- **Generalized extreme value (Fisher&ndash;Tippett) distribution**: `a - (pow(-ln(RNDU01ZeroOneExc()), -c) - 1) * b / c` if `c != 0`, or `a - ln(-ln(RNDU01ZeroOneExc())) * b` otherwise, where `b` is the scale, `a` is the location of the distribution's curve peak (mode), and `c` is a shape parameter. This expresses a distribution of maximum values.
- **Generalized Tukey lambda distribution**: `(s1 * (pow(x, lamda1)-1.0)/lamda1 - s2 * (pow(1.0-x, lamda2)-1.0)/lamda2) + loc`, where `x` is `RNDU01()`, `lamda1` and `lamda2` are shape parameters, `s1` and `s2` are scale parameters, and `loc` is a location parameter.
- **Half-normal distribution**. Parameterizations include:
    - _Mathematica_: `abs(Normal(0, sqrt(pi * 0.5) / invscale)))`, where `invscale` is a parameter of the half-normal distribution.
    - MATLAB: `abs(Normal(mu, sigma)))`, where `mu` and `sigma` are the same as in the normal distribution.
- **Hyperexponential distribution**: See [**Mixtures: Additional Examples**](#Mixtures_Additional_Examples).
- **Hypergeometric distribution**: See [**Hypergeometric Distribution**](#Hypergeometric_Distribution).
- **Hypoexponential distribution**: See [**Transformations of Random Numbers: Additional Examples**](#Transformations_of_Random_Numbers_Additional_Examples).
- **Inverse chi-squared distribution**: `df * scale / (GammaDist(df * 0.5, 2))`, where `df` is the number of degrees of freedom and `scale` is the scale, usually `1.0 / df`.
- **Inverse Gaussian distribution (Wald distribution)**: Generate `n = mu + (mu*mu*y/(2*lamda)) - mu * sqrt(4 * mu * lamda * y + mu * mu * y * y) / (2 * lamda)`, where `y = pow(Normal(0, 1), 2)`, then return `n` if `RNDU01OneExc() <= mu / (mu + n)`, or `mu * mu / n` otherwise. `mu` is the mean and `lamda` is the scale; both parameters are greater than 0. Based on method published in [**Devroye 1986**](http://luc.devroye.org/rnbookindex.html).
- **Kumaraswamy distribution**: `min + (max - min) * pow(1-pow(RNDU01ZeroExc(),1.0/b),1.0/a)`, where `a` and `b` are shape parameters, `min` is the minimum value, and `max` is the maximum value.
- **Landau distribution**: See [**Stable Distribution**](#Stable_Distribution).
- **L&eacute;vy distribution**: `sigma * 0.5 / GammaDist(0.5, 1) + mu`, where `mu` is the location and `sigma` is the dispersion.
- **Logarithmic logistic distribution**: See beta prime distribution.
- **Logarithmic series distribution**: `floor(1.0 + ln(RNDU01ZeroExc()) / ln(1.0 - pow(1.0 - param, RNDU01ZeroOneExc())))`, where `param` is a number greater than 0 and less than 1. Based on method described in Devroye 1986.
- **Logistic distribution**: `(ln(x)-ln(1.0 - x)) * scale + mean`, where `x` is `RNDU01ZeroOneExc()` and `mean` and `scale` are the mean and the scale, respectively.
- **Log-multinormal distribution**: See [**Multivariate Normal (Multinormal) Distribution**](#Multivariate_Normal_Multinormal_Distribution).
- **Max-of-uniform distribution**: See [**Gamma Distribution**](#Gamma_Distribution).
- **Maxwell distribution**: `scale * sqrt(GammaDist(1.5, 2))`, where `scale` is the scale.
- **Min-of-uniform distribution**: See [**Gamma Distribution**](#Gamma_Distribution).
- **Moyal distribution**: See the [**Python sample code**](https://peteroupc.github.io/randomgen.zip).
- **Multinomial distribution**: See [**Multinomial Distribution**](#Multinomial_Distribution).
- **Multivariate Poisson distribution**: See the [**Python sample code**](https://peteroupc.github.io/randomgen.zip).
- **Multivariate _t_-copula**: See the [**Python sample code**](https://peteroupc.github.io/randomgen.zip).
- **Multivariate _t_-distribution**: See the [**Python sample code**](https://peteroupc.github.io/randomgen.zip).
- **Negative binomial distribution**: See [**Negative Binomial Distribution**](#Negative_Binomial_Distribution).
- **Negative multinomial distribution**: See the [**Python sample code**](https://peteroupc.github.io/randomgen.zip).
- **Noncentral beta distribution**: `BetaDist(a + Poisson(nc), b)`, where `nc` (a noncentrality), `a`, and `b` are greater than 0.
- **Parabolic distribution**: `min + (max - min) * BetaDist(2, 2)`, where `min` is the minimum value and `max` is the maximum value (Saucier 2000, p. 30).
- **Pascal distribution**: `NegativeBinomial(successes, p) + successes`, where `successes` and `p` have the same meaning as in the negative binomial distribution, except `successes` is always an integer.
- **Pearson VI distribution**: `GammaDist(v, 1) / (GammaDist(w, 1))`, where `v` and `w` are shape parameters greater than 0 (Saucier 2000, p. 33; there, an additional `b` parameter is defined, but that parameter is canceled out in the source code).
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
- **Skellam distribution**: `Poisson(mean1) - Poisson(mean2)`, where `mean1` and `mean2` are the means of the two Poisson variables.
- **Skewed normal distribution**: `Normal(0, x) + mu + alpha * abs(Normal(0, x))`, where `x` is `sigma / sqrt(alpha * alpha + 1.0)`, `mu` and `sigma` have the same meaning as in the normal distribution, and `alpha` is a shape parameter.
- **Snedecor's (Fisher's) _F_-distribution**: `GammaDist(m * 0.5, n) / (GammaDist(n * 0.5 + Poisson(sms * 0.5)) * m, 1)`, where `m` and `n` are the numbers of degrees of freedom of two random numbers with a chi-squared distribution, and if `sms` is other than 0, one of those distributions is _noncentral_ with sum of mean squares equal to `sms`.
- **Stable distribution**: See [**Stable Distribution**](#Stable_Distribution).
- **Standard complex normal distribution**: See [**Multivariate Normal (Multinormal) Distribution**](#Multivariate_Normal_Multinormal_Distribution).
- **Suzuki distribution**: See Rayleigh distribution.
- **Tukey lambda distribution**: `(pow(x, lamda)-pow(1.0-x,lamda))/lamda`, where `x` is `RNDU01()` and `lamda` is a shape parameter (if 0, the result is a logistic distribution).
- **"Type 0" stable distribution**: See [**Stable Distribution**](#Stable_Distribution).
- **von Mises distribution**: See [**von Mises Distribution**](#von_Mises_Distribution).
- **Waring&ndash;Yule distribution**: See beta negative binomial distribution.
- **Wigner (semicircle) distribution**: `a + radius * (BetaDist(1.5, 1.5)*2-1)`, where `radius` is the semicircular radius and `a` is the location.
- **Zeta distribution**: Generate `n = floor(pow(RNDU01ZeroOneExc(), -1.0 / r))`, and if `d / pow(2, r) < (d - 1) * RNDU01OneExc() * n / (pow(2, r) - 1.0)`, where `d = pow((1.0 / n) + 1, r)`, repeat this process. The parameter `r` is greater than 0. Based on method described in Devroye 1986. A zeta distribution [**truncated**](#Censoring_and_Truncation) by rejecting random values greater than some positive integer is called a _Zipf distribution_ or _Estoup distribution_. (Note that Devroye uses "Zipf distribution" to refer to the untruncated zeta distribution.)
- **Zipf distribution**: See zeta distribution.

<a id=Geometric_Sampling></a>
### Geometric Sampling

**Requires random real numbers.**

This section contains ways to do independent and uniform random sampling of points in or on geometric shapes.

<a id=Random_Points_Inside_a_Box></a>
#### Random Points Inside a Box

To generate a random point inside an N-dimensional box, generate `RNDRANGEMaxExc(mn, mx)` for each coordinate, where `mn` and `mx` are the lower and upper bounds for that coordinate.  For example&mdash;
- to generate a random point inside a rectangle bounded in \[0, 2\) along the X axis and \[3, 6\) along the Y axis, generate `[RNDRANGEMaxExc(0,2), RNDRANGEMaxExc(3,6)]`, and
- to generate a _complex number_ with real and imaginary parts bounded in \[0, 1\], generate `[RNDU01(), RNDU01()]`.

<a id=Random_Points_Inside_a_Simplex></a>
#### Random Points Inside a Simplex

The following pseudocode generates a random point inside an _n_-dimensional simplex (simplest convex figure, such as a line segment, triangle, or tetrahedron).  It takes an array _points_, a list consisting of the _n_ plus one vertices of the simplex, all of a single dimension _n_ or greater.

    METHOD RandomPointInSimplex(points):
       ret=NewList()
       if size(points) > size(points[0])+1: return error
       if size(points)==1 // Return a copy of the point
         for i in 0...size(points[0]): AddItem(ret,points[0][i])
         return ret
       end
       gammas=NewList()
       // Sample from a Dirichlet distribution
       for i in 0...size(points): AddItem(gammas,
           -ln(RNDU01ZeroOneExc()))
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

The following pseudocode shows how to generate a random N-dimensional point on the surface of an N-dimensional hypersphere, centered at the origin, of radius `radius` (if `radius` is 1, the result can also serve as a unit vector in N-dimensional space).  Here, `Norm` is given in the appendix.  See also (Weisstein)<sup>[**(31)**](#Note31)</sup>.

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

> **Note:** The Python sample code contains an optimized method for points on the edge of a circle.
>
> **Example:** To generate a random point on the surface of a cylinder running along the Z axis, generate random X and Y coordinates on the edge of a circle (2-dimensional hypersphere) and generate a random Z coordinate by `RNDRANGE(mn, mx)`, where `mn` and `mx` are the highest and lowest Z coordinates possible.

<a id=Random_Points_Inside_a_Ball_or_Shell></a>
#### Random Points Inside a Ball or Shell

To generate a random N-dimensional point on or inside an N-dimensional ball, centered at the origin, of radius R, follow the pseudocode in `RandomPointInHypersphere`, except replace `Norm(ret)` with `sqrt( S - ln(RNDU01ZeroExc()))`, where `S` is the sum of squares of the numbers in `ret`<sup>[**(12)**](#Note12)</sup>
.  For discs and spheres (2- or 3-dimensional balls), an alternative is to generate a vector (list) of N `RNDRANGE(-R, R)` random numbers<sup>[**(32)**](#Note32)</sup> until its _norm_ is R or less (see the [**appendix**](#Appendix)).<sup>[**(33)**](#Note33)</sup>

To generate a random point on or inside an N-dimensional spherical shell (a hollow ball), centered at the origin, with inner radius A and outer radius B (where A is less than B), either&mdash;
- generate a random point for a ball of radius B until the norm of that point is A or greater (see the [**appendix**](#Appendix)), or
- generate a random point on the surface of an N-dimensional hypersphere with radius equal to `pow(RNDRANGE(pow(A, N), pow(B, N)), 1.0 / N)`<sup>[**(34)**](#Note34)</sup>.

> **Example:** To generate a random point inside a cylinder running along the Z axis, generate random X and Y coordinates inside a disk (2-dimensional ball) and generate a random Z coordinate by `RNDRANGE(mn, mx)`, where `mn` and `mx` are the highest and lowest Z coordinates possible.
>
> **Note:** The Python sample code contains a method for generating a random point on the surface of an ellipsoid modeling the Earth.

<a id=Random_Latitude_and_Longitude></a>
#### Random Latitude and Longitude

To generate a random point on the surface of a sphere in the form of a latitude and longitude (in radians with west and south coordinates negative)&mdash;

- generate the longitude `RNDRANGEMaxExc(-pi, pi)`, where the longitude is in the interval [-&pi;, &pi;), and
- generate the latitude `atan2(sqrt(1 - x * x), x) - pi / 2`, where `x = RNDRANGE(-1, 1)` and the latitude is in the interval \[-&pi;/2, &pi;/2\] (the interval excludes the poles, which have many equivalent forms; if poles are not desired, generate `x` until neither -1 nor 1 is generated this way).

Reference: [**"Sphere Point Picking"**](http://mathworld.wolfram.com/SpherePointPicking.html) in MathWorld (replacing inverse cosine with `atan2` equivalent).

<a id=Acknowledgments></a>
## Acknowledgments

I acknowledge the commenters to the CodeProject version of this page, including George Swan, who referred me to the reservoir sampling method.

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> For the definition of an RNG, it is irrelevant&mdash;
- how hard it is to predict the numbers the item produces,
- how well the item passes statistical randomness tests,
- whether the item is initialized automatically or not,
- whether the item uses only its input and its state to produce numbers, or
- whether the item extracts uniformly distributed bits from one or more noise sources.

If an item uses a nonuniform distribution, but otherwise meets this definition, it can be converted to use a uniform distribution, at least in theory, using _randomness extraction_ techniques that are outside the scope of this document.</small>

<small><sup id=Note2>(2)</sup> For an exercise solved by the `RNDINT` pseudocode, see A. Koenig and B. E. Moo, _Accelerated C++_, 2000; see also a [**blog post by Johnny Chan**](http://mathalope.co.uk/2014/10/26/accelerated-c-solution-to-exercise-7-9/).  In addition, M. O'Neill discusses various methods, both biased and unbiased, for generating random integers in a range with an RNG in a [**blog post from July 2018**](http://www.pcg-random.org/posts/bounded-rands.html).</small>

<small><sup id=Note3>(3)</sup> A na&iuml;ve `RNDINTEXC` implementation often seen in certain languages like JavaScript is the idiom `floor(Math.random()*maxExclusive)`, where `Math.random()` is any method that outputs an independent uniform random number in the interval \[0, 1\).  However:

1. Depending on how `Math.random()` is implemented, this idiom can't choose from among all integers in its range or may bias some integers over others; this bias may or may not be negligible in a given application.  For example, if `Math.random()` is implemented as `RNDINT(255)/256`, not all numbers can "randomly" occur by this idiom with `maxExclusive` greater than 256.
2. Depending on the number format, rounding error can result in `maxExclusive` being returned in rare cases.  A more robust implementation could use a loop to check whether `maxExclusive` was generated and try again if so.  Where a loop is not possible, such as within an SQL query, the idiom above can be replaced with `min(floor(Math.random() * maxExclusive, maxExclusive - 1))`.  Neither modification addresses item 1, however.

If an application is concerned about these issues, it should treat the `Math.random()` implementation as the underlying RNG for `RNDINT` and implement `RNDINTEXC` through `RNDINT` instead.</small>

<small><sup id=Note4>(4)</sup> Describing differences between SQL dialects is outside the scope of this document, but [**Flourish SQL**](http://flourishlib.com/docs/FlourishSQL) describes many such differences, including those concerning RNGs.</small>

<small><sup id=Note5>(5)</sup> Jeff Atwood, "[**The danger of na&iuml;vet&eacute;**](https://blog.codinghorror.com/the-danger-of-naivete/)", Dec. 7, 2007.</small>

<small><sup id=Note6>(6)</sup> If the strings identify database records, file system paths, or other shared resources, special considerations apply, including the need to synchronize access to those resources.  For uniquely identifying database records, alternatives to random strings include auto-incrementing or sequentially assigned row numbers. The choice of underlying RNG is important when it comes to unique random strings; see my [**RNG recommendation document**](https://peteroupc.github.io/random.html#Unique_Random_Identifiers).</small>

<small><sup id=Note7>(7)</sup> See also the _Stack Overflow_ question "Random index of a non zero value in a numpy array".</small>

<small><sup id=Note8>(8)</sup> Brownlee, J. "[**A Gentle Introduction to the Bootstrap Method**](https://machinelearningmastery.com/a-gentle-introduction-to-the-bootstrap-method/)", _Machine Learning Mastery_, May 25, 2018.</small>

<small><sup id=Note9>(9)</sup> Jon Louis Bentley and James B. Saxe, "Generating Sorted Lists of Random Numbers", _ACM Trans. Math. Softw._ 6 (1980), pp. 359-364, describes a way to generate random numbers in sorted order, but it's not given here because it relies on generating real numbers in the interval [0, 1], which is inherently imperfect because computers can't choose among all random numbers between 0 and 1, and there are infinitely many of them.</small>

<small><sup id=Note10>(10)</sup> The [**Python sample code**](https://peteroupc.github.io/randomgen.zip) includes a `ConvexPolygonSampler` class that implements this kind of sampling for convex polygons; unlike other polygons, convex polygons are trivial to decompose into triangles.</small>

<small><sup id=Note11>(11)</sup> That article also mentions a critical-hit distribution, which is actually a [**mixture**](#Mixtures_of_Distributions) of two distributions: one roll of dice and the sum of two rolls of dice.</small>

<small><sup id=Note12>(12)</sup> [**Kahan summation**](https://en.wikipedia.org/wiki/Kahan_summation_algorithm) can be a more robust way than the na&iuml;ve approach to compute the sum of three or more numbers.</small>

<small><sup id=Note13>(13)</sup> An _affine transformation_ is one that keeps straight lines straight and parallel lines parallel.</small>

<small><sup id=Note14>(14)</sup> If `px`/`py` is `1`/`2`, the binomial distribution models the task "Flip N coins, then count the number of heads", and the random sum is known as [**_Hamming distance_**](https://en.wikipedia.org/wiki/Hamming_distance) (treating each trial as a "bit" that's set to 1 for a success and 0 for a failure).  If `px` is `1`, then this distribution models the task "Roll `n` `py`-sided dice, then count the number of dice that show the number 1."</small>

<small><sup id=Note15>(15)</sup> Smith and Tromble, "[**Sampling Uniformly from the Unit Simplex**](http://www.cs.cmu.edu/~nasmith/papers/smith+tromble.tr04.pdf)", 2004.</small>

<small><sup id=Note16>(16)</sup> Downey, A. B. "[**Generating Pseudo-random Floating Point Values**](http://allendowney.com/research/rand/)", 2007.</small>

<small><sup id=Note17>(17)</sup> See, for example, the _Stack Overflow_ question "How to generate a number in arbitrary range using random()={0..1} preserving uniformness and density?", `questions/8019589`.</small>

<small><sup id=Note18>(18)</sup> Spall, J.C., "An Overview of the Simultaneous Perturbation Method for Efficient Optimization", _Johns Hopkins APL Technical Digest_ 19(4), 1998, pp. 482-492.</small>

<small><sup id=Note19>(19)</sup> P. L'Ecuyer, "Tables of Linear Congruential Generators of Different Sizes and Good Lattice Structure", _Mathematics of Computation_ 68(225), January 1999.</small>

<small><sup id=Note20>(20)</sup> Efraimidis, P. and Spirakis, P. "[**Weighted Random Sampling (2005; Efraimidis, Spirakis)**](http://utopia.duth.gr/~pefraimi/research/data/2007EncOfAlg.pdf)", 2005.</small>

<small><sup id=Note21>(21)</sup> Efraimidis, P. "Weighted Random Sampling over Data Streams". arXiv:1012.0256v2 [cs.DS], 2015.</small>

<small><sup id=Note22>(22)</sup> Saucier, R. "Computer Generation of Statistical Distributions", March 2000.</small>

<small><sup id=Note23>(23)</sup> "Jitter", as used in this step, follows a distribution formally called a _kernel_, of which the normal distribution is one example.  _Bandwidth_ should be as low or as high as allows the estimated distribution to fit the data and remain smooth.  A more complex kind of "jitter" (for multi-component data points) consists of a point generated from a [**multinormal distribution**](https://en.wikipedia.org/wiki/Multivariate_normal_distribution) with all the means equal to 0 and a _covariance matrix_ that, in this context, serves as a _bandwidth matrix_.  "Jitter" and bandwidth are not further discussed in this document.</small>

<small><sup id=Note24>(24)</sup> Other references on density estimation include [**a Wikipedia article on multiple-variable kernel density estimation**](https://en.wikipedia.org/wiki/Multivariate_kernel_density_estimation), and a [**blog post by M. Kay**](http://mark-kay.net/2013/12/24/kernel-density-estimation/).</small>

<small><sup id=Note25>(25)</sup> More formally&mdash;
- the PDF is the _derivative_ (instantaneous rate of change) of the distribution's CDF (that is, PDF(x) = CDF&prime;(x)), and
- the CDF is also defined as the _integral_ ("area under the curve") of the PDF,

provided the PDF's values are all 0 or greater and the area under the PDF's curve is 1.</small>

<small><sup id=Note26>(26)</sup> Neal, R. M., [**"Slice sampling"**](https://projecteuclid.org/euclid.aos/1056562461), _Annals of Statistics_ 31(3), pp. 705-767 (2003).</small>

<small><sup id=Note27>(27)</sup> _See also_ Casella, G., and George, E.I., "Explaining the Gibbs Sampler", The American Statistician 46:3 (1992).</small>

<small><sup id=Note28>(28)</sup> The "Dice" and "Dice: Optimization for Many Dice" sections used the following sources:

- Red Blob Games, [**"Probability and Games: Damage Rolls"**](http://www.redblobgames.com/articles/probability/damage-rolls.html) was the main source for the dice-roll distribution.  The method `random(N)` in that document corresponds to `RNDINTEXC(N)` in this document.
- The [**MathWorld article "Dice"**](http://mathworld.wolfram.com/Dice.html) provided the mean of the dice roll distribution.
- S. Eger, "Stirling's approximation for central extended binomial coefficients", 2014, helped suggest the variance of the dice roll distribution.</small>

<small><sup id=Note29>(29)</sup> For example, besides the methods given in this section's main text:

1. In the _Box&ndash;Muller transformation_, `mu + radius * cos(angle)` and `mu + radius * sin(angle)`, where `angle = RNDRANGEMaxExc(0, 2 * pi)` and `radius = sqrt(-2 * ln(RNDU01ZeroExc())) * sigma`, are two independent normally-distributed random numbers.
2. Computing the sum of twelve `RNDU01OneExc()` numbers (see Note 17) and subtracting the sum by 6 (see also [**"Irwin&ndash;Hall distribution" on Wikipedia**](https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution)) results in approximate standard normal (`mu`=0, `sigma`=1) random numbers, whose values are not less than -6 or greater than 6; on the other hand, in a standard normal distribution, results less than -6 or greater than 6 will occur only with a generally negligible probability.
3. Generating `RNDU01ZeroOneExc()`, then running the standard normal distribution's inverse cumulative distribution function on that number, results in a random number from that distribution.  An approximation is found in M. Wichura, _Applied Statistics_ 37(3), 1988.  See also [**"A literate program to compute the inverse of the normal CDF"**](https://www.johndcook.com/blog/normal_cdf_inverse/).
4. Methods implementing a variant of the normal distribution, the _discrete Gaussian distribution_, generate _integers_ that approximately follow the normal distribution.  Two recent algorithms, one by A. Karmakar et al. ("Constant-Time Gaussian Random Sampling"), and another by Micciancio and Walter (2017, "Gaussian Sampling over the Integers: Efficient, Generic, Constant-Time"), are designed to reduce timing differences that a security attack could exploit.

In 2007, Thomas, D., et al. gave a survey of normal random number methods in "Gaussian Random Number Generators", _ACM Computing Surveys_ 39(4), 2007, article 11.</small>

<small><sup id=Note30>(30)</sup> Hofert, M., and Maechler, M.  "Nested Archimedean Copulas Meet R: The nacopula Package".  Journal of Statistical Software 39(9), 2011, pp. 1-20.</small>

<small><sup id=Note31>(31)</sup> Weisstein, Eric W.  "[**Hypersphere Point Picking**](http://mathworld.wolfram.com/HyperspherePointPicking.html)".  From MathWorld&mdash;A Wolfram Web Resource.</small>

<small><sup id=Note32>(32)</sup> The N numbers generated this way will form a point inside an N-dimensional _hypercube_ with length `2 * R` in each dimension and centered at the origin of space.</small>

<small><sup id=Note33>(33)</sup> See also a [**MathWorld article**](http://mathworld.wolfram.com/BallPointPicking.html), which was the inspiration for these two methods, and the _Stack Overflow_ question "How to generate uniform random points in (arbitrary) N-dimension ball?", `questions/54544971`.</small>

<small><sup id=Note34>(34)</sup> See the _Mathematics Stack Exchange_ question titled "Random multivariate in hyperannulus", `questions/1885630`.</small>

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

<a id=License></a>
## License

This page is licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
