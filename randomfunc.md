# Random Number Generation Methods

<a id=Introduction></a>
## Introduction

This page discusses many ways applications can extract random numbers
from random number generators (RNGs) and includes pseudocode for most
of them.

RNGs include those that seek to generate "unpredictable" random numbers (also called "cryptographically strong" RNGs) and those that merely seek to generate number sequences likely to pass statistical tests of randomness.  In general, recommendations on which RNGs are suitable for which applications are outside the scope of this page;  I have written about this in [another document](https://peteroupc.github.io/random.html).

Note that the pseudocode doesn't cover all error handling that may be necessary in a particular implementation.   Such errors may include overflow checking, bounds checking, division by zero, and checks for infinity.

<a id=Contents></a>
## Contents

[Introduction](#Introduction)<br>[Contents](#Contents)<br>[Notes and Definitions](#Notes_and_Definitions)<br>[Core Random Generation Method](#Core_Random_Generation_Method)<br>[Random Numbers Within a Range](#Random_Numbers_Within_a_Range)<br>&nbsp;&nbsp;[Random Integers Within a Range](#Random_Integers_Within_a_Range)<br>&nbsp;&nbsp;[Random Numbers in a 0-1 Bounded Interval](#Random_Numbers_in_a_0_1_Bounded_Interval)<br>&nbsp;&nbsp;[Uniform Numbers Within a Range](#Uniform_Numbers_Within_a_Range)<br>[Boolean Conditions](#Boolean_Conditions)<br>[Shuffling](#Shuffling)<br>[Choosing an Item from a List](#Choosing_an_Item_from_a_List)<br>[Creating a Random Character String](#Creating_a_Random_Character_String)<br>[Choosing Several Unique Items](#Choosing_Several_Unique_Items)<br>[Discrete Weighted Choice](#Discrete_Weighted_Choice)<br>[Triangular Distribution](#Triangular_Distribution)<br>[Normal Distribution](#Normal_Distribution)<br>[Binomial Distribution](#Binomial_Distribution)<br>[Negative Binomial Distribution](#Negative_Binomial_Distribution)<br>[Hypergeometric Distribution](#Hypergeometric_Distribution)<br>[Poisson Distribution](#Poisson_Distribution)<br>[Gamma Distribution](#Gamma_Distribution)<br>[Other Non-Uniform Distributions](#Other_Non_Uniform_Distributions)<br>[Conclusion](#Conclusion)<br>[License](#License)<br>

<a id=Notes_and_Definitions></a>
## Notes and Definitions

In this document:

* Divisions do not round to an integer.  In programming languages in which division of two integers results in an integer, the right-hand side of the division must be converted to a floating-point number first.
* Lists are indexed starting with 0.  That means the first item in the list is 0, the second item in the list is 1, and so on, up to the last item, whose index is the list's size minus 1
* `pi` is the constant &pi;, the ratio of a circle's circumference to its diameter.
* `sin(a)`, `cos(a)`, and `tan(a)` are the sine, cosine, and tangent of the angle `a`, in radians.
* `pow(a, b)` is the number `a` raised to the power `b`.
* `sqrt(a)` is the square root of `a`.
* `ln(a)` is the natural logarithm of `a`.  It corresponds to the `Math.log` method in Java and JavaScript.
* `exp(a)` is the number _e_ (base of natural logarithms) raised to the power `a`.
* `NewList()` creates a new empty list.
* `AddItem(list, item)` adds the item `item` to the list `list`.
* `size(list)` returns the size of the list `list`.
* `list[k]` refers to the item at index `k` of the list `list`.

<a id=Core_Random_Generation_Method></a>
## Core Random Generation Method

The core method for generating random numbers using an RNG is called **`RNDINT(N)`** in this document. It generates a random integer from 0 inclusive to N exclusive, where N is an integer greater than 0, and it assumes the generator produces uniformly random numbers.

`RNDINT(N)` can be implemented as follows: Use the RNG to generate as many random bits as used to represent N-minus-1, then convert those bits to a nonnegative integer. If that nonnegative integer is N or greater, repeat this process.

This core method can serve as the basis for all other methods described below that extract random numbers from RNGs.

<a id=Random_Numbers_Within_a_Range></a>
## Random Numbers Within a Range

The following methods aid in generating random numbers within a range.

<a id=Random_Integers_Within_a_Range></a>
### Random Integers Within a Range

- Random integer from MIN inclusive to MAX exclusive: `MIN + RNDINT(MAX - MIN)`
- Random integer from MIN inclusive to MAX inclusive: `MIN + RNDINT((MAX - MIN) + 1)`
- **Example:** Random integer from 10 inclusive to 40 exclusive: `10 + RNDINT(30)`

<a id=Random_Numbers_in_a_0_1_Bounded_Interval></a>
### Random Numbers in a 0-1 Bounded Interval

The following idioms generate a random number in an interval bounded at 0 and 1.

- `RNDU()`, a random number 0 or greater, but less than 1 (interval `[0, 1)`): `RNDINT(X) / X`
- `RNDNZU()`, a random number greater than 0, but less than 1 (interval `(0, 1)`): `(RNDINT(X-1) + 1) / X`
- Random number 0 or greater, but 1 or less (interval `[0, 1]`): `(RNDINT(X + 1)) / X`
- Random number greater than 0, but 1 or less (interval `(0, 1]`): `(RNDINT(X) + 1) / X`

In the method definitions given above, X is an integer which is the number of fractional parts between 0 and 1.  For 64-bit IEEE 854 floating-point numbers (Java `double`), X will be 2<sup>53</sup>.  For 32-bit IEEE 854 floating-point numbers (Java `float`), X will be 2<sup>24</sup>.  (See "Generating uniform doubles in the unit interval" in the [`xoroshiro+` remarks page](http://xoroshiro.di.unimi.it/#remarks)
for further discussion.)  Note that--
- `RNDU()` corresponds to `Math.random()` in Java and JavaScript, and

<a id=Uniform_Numbers_Within_a_Range></a>
### Uniform Numbers Within a Range

- Random number from MIN inclusive to MAX exclusive: `MIN + RNDU()*(MAX - MIN)`
- Alternative way of generating a random integer from 0 inclusive to N exclusive: `floor(RNDU()*(N))`
    - **Example:** In JavaScript, this can be implemented as: `Math.floor(Math.random()*N)`

<a id=Boolean_Conditions></a>
## Boolean Conditions

To generate a condition that is true at the specified probabilities, use
the following idioms in an `if` condition:

- True or false with equal probability: `RNDINT(2) == 0`.
- True with X percent probability: `RNDINT(100) < X`.
- True with probability X/Y: `RNDINT(Y) < X`.
- True with probability X, where X is from 0 through 1 (a _Bernoulli trial_): `RNDU() < X`.
- **Example:** True with probability 3/8: `RNDINT(8) < 3`.
- **Example:** True with 20% probability: `RNDINT(100) < 20`.

<a id=Shuffling></a>
## Shuffling

The [Fisher-Yates shuffle method](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle) shuffles a list such that all permutations of that list are equally likely to occur, assuming the RNG it uses produces uniformly random numbers and can generate all permutations of that list.  However, that method is also easy to get wrong.

    METHOD Shuffle(list)
       if size(list) >= 2
          // Set i to the last item's index
          i = size(list) - 1
          while i > 0
             // Choose an item ranging from the first item
             // up to the item given in i
             k = RNDINT(i + 1)
             // The following is wrong since it introduces biases:
             // k = RNDINT(size(list))
             // The following is wrong since the algorithm won't
             // choose from among all possible permutations:
             // k = RNDINT(i)
             // Swap item at index i with item at index k;
             // in this case, i and k may be the same
             tmp = list[i]
             list[i] = list[k]
             list[k] = tmp
             // Move i so it points to the previous item
             i = i - 1
          end
       end
    END METHOD

An important consideration with respect to shuffling is the kind of RNG used.  This is because a deterministic RNG can't generate all permutations of a list if the [factorial](https://en.wikipedia.org/wiki/Factorial) of the list's size is greater than the generator's _period_ (the maximum number of values it can generate in a sequence before that sequence repeats). This means that the items in a shuffled list of that size will never appear in certain orders when that generator is used to shuffle it. For example, a deterministic RNG with period 2<sup>64</sup> can't generate all permutations of a list with more than 20 items; with period 2<sup>128</sup>, more than 34 items; with period 2<sup>226</sup>, more than 52 items; and with period 2<sup>256</sup>, more than 57 items.  RNGs that seek to generate "unpredictable" numbers suffer less from this problem.

<a id=Choosing_an_Item_from_a_List></a>
## Choosing an Item from a List

To choose an item from a list, use the idiom `list[RNDINT(size(list))]`.  This idiom assumes that the first item of the list is at position 0, the second is at position 1, and so on.

<a id=Creating_a_Random_Character_String></a>
## Creating a Random Character String

A commonly asked question involves how to generate a random string of characters (usually a random _alphanumeric string_, or string of letters and digits).

The first step is to generate a list of the letters and digits (and/or other characters) the string can have.  Often, those characters will be--
* the basic digits "0" to "9" (U+0030-U+0039, nos. 48-57),
* the basic upper case letters "A" to "Z" (U+0041-U+005A, nos. 65-90), and
* the basic lower case letters "a" to "z" (U+0061-U+007A, nos. 96-122),

as found in the Basic Latin block of the Unicode Standard. (Note that if the list of characters is fixed, the list can be statically created at runtime or compile time, or a string type as provided in the programming language can be used to store the string.)

The second step is to build a new string whose characters are chosen from that character list.  The pseudocode below demonstrates this by creating a list, rather than a string (which is programming-language-dependent), where the random characters will be held.  It also takes the number of characters as a parameter named `size`.

      METHOD RandomString(characterList, stringSize)
           i = 0
           newString = NewList()
           while i < stringSize
               // Choose a character from the list
               randomChar = characterList[RNDINT(characterList)]
               // Add the character to the string
               AddItem(newString, randomChar)
               i = i + 1
            end
            return newString
      END METHOD

_**Note:** Often applications need to generate a string of characters that's not only random, but also unique.  The best way to ensure uniqueness in this case is to store a list (such as a hash table) of strings already generated.  Random number generators alone should not be relied on to deliver unique results._

<a id=Choosing_Several_Unique_Items></a>
## Choosing Several Unique Items

Often, the need arises to choose `k` unique items or values from among `n` available items or values.

If `n` is relatively small (for example, if there are 1000 available items, or there is a range of numbers from 0 to 1000 to choose from), then store the items in a list, [shuffle](#Shuffling) that list, and choose the first `k` items from that list.

If `k` unique integers of 32 bits or greater are to be chosen (so that `n` is 2<sup>32</sup> or is a greater power of 2), or if `n` is otherwise relatively large, create a hash table storing the items already generated.  When a new item (or index to an item) is chosen, check the hash table to see if it's there already.  If it's not there already, add it to the hash table.  Otherwise, choose a new item (or index).  Repeat this process until `k` items (or indices) were added to the hash table this way.  Performance considerations involving hash tables are outside the scope of this document.

<a id=Discrete_Weighted_Choice></a>
## Discrete Weighted Choice

Some applications need to choose random items such that some items are more likely to be chosen than others.

The following pseudocode takes two lists, `list` and `weights`, and returns one item from the list `list`.  Items with greater weights (which are given at the corresponding indices in the list `weights`) are more likely to be chosen. (Note that there are two possible ways to generate the random number depending on whether the weights are all integers or can be fractional numbers.)

    METHOD WeightedChoice(list, weights)
        if size(list) <= 0 or size(weights) < size(list): return error
        sum = 0
        // Get the sum of all weights
        i = 0
        while i < size(weights)
            sum = sum + weights[i]
            i = i + 1
        end
        // Choose a random integer/number from 0 to less than
        // the number of weights.
        value = RNDINT(sum)
        // NOTE: If the weights can be fractional numbers,
        // use this instead:
        // value = RNDU() * sum
        // Choose the object according to the given value
        i = 0
        lastItem = size(list) - 1
        while i < size(weights)
            value = value - weights[i]
            if value <= 0: return list[i]
            if weights[i] > 0: lastItem = i
            i = i + 1
        end
        // Last resort (shouldn't happen unless rounding
        // error happened somehow)
        return list[lastItem]
    END METHOD

<a id=Triangular_Distribution></a>
## Triangular Distribution

The following method generates a random number that follows a triangular distribution, a distribution that starts at `startpt`, peaks at `midpt`, and ends at `endpt`.

    METHOD Triangular(startpt, midpt, endpt)
         if startpt==midpt or midpt==endpt or startpt>midpt or
             midpt>endpt or startpt>endpt: return error
         ca = (midpt - startpt)
         pdf = ca * ca / (endpt - startpt) * ca
         rndvar = RNDU()
         // Or `rndvar = (RNDINT(X + 1)) / X` if endpoint is to be included;
         // see "Uniform Numbers Within a Range", above
         if rndvar<pdf
             # Left hand side
             return startpt+ca*(pdf-rndvar)/pdf
         else
              # Right hand side
             return midpt+(endpt-midpt)*(rndvar-pdf)/(1.0-pdf)
         end
    end

<a id=Normal_Distribution></a>
## Normal Distribution

The following method generates two [normally-distributed](https://wikipedia.org/wiki/Normal_distribution)
random numbers with mean `mu` (&mu;) and standard deviation `sigma` (&sigma;). (In a _standard normal distribution_, &mu; = 0 and &sigma; = 1.),
using the so-called [Box-Muller transformation](https://wikipedia.org/wiki/Box-Muller transformation).

    METHOD Normal2(mu, sigma)
      s = sqrt(-2 * ln(RNDNZU())) * sigma
      t = 2 * pi * RNDU()
      // Return two normally-distributed numbers
      return [mu + s * sin(t), mu + s * cos(t)]
    END METHOD

Since `Normal2` returns two numbers instead of one, but many applications require only one number at a time, a problem arises on how to return one number while storing the other for later retrieval.  Ways to solve this problem are outside the scope of this page, however.  The name `Normal` will be used in this document to represent a method that returns only one normally-distributed random number rather than two.

<a id=Binomial_Distribution></a>
## Binomial Distribution

The following method generates a random integer that follows a binomial distribution.  This number
expresses the number of successes that have happened after a given number of trials
(expressed as `successes` below), where the probability of a success is `p` (ranging from 0, never, to
1, always).

    METHOD Binomial(trials, p)
        if successes < 0: return error
        if successes == 0: return 0
        // Always succeeds
        if p >= 1.0: return trials
        // Always fails
        if p <= 0.0: return 0
        i = 0
        count = 0
        while i < trials
            if RNDU() < p
                // Success
                count = count + 1
            end
            i = i + 1
        end
        return count
    END METHOD

<a id=Negative_Binomial_Distribution></a>
## Negative Binomial Distribution

The following method generates a random integer that follows a negative binomial distribution.  This number
expresses the number of failures that have happened after seeing a given number of successes
(expressed as `successes` below), where the probability of a success is `p` (ranging from 0, never, to
1, always).

    METHOD NegativeBinomial(successes, p)
        if successes < 0: return error
        if successes == 0: return 0
        // Always succeeds
        if p >= 1.0: return 0
        // Always fails (NOTE: infinity can be the maximum possible
        // integer value if NegativeBinomial is implemented to return
        // an integer)
        if p <= 0.0: return infinity
        count = 0
        total = 0
        loop
              if RNDU() < p
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

<a id=Hypergeometric_Distribution></a>
## Hypergeometric Distribution

The following method generates a random integer that follows a hypergeometric distribution.
When a given number of items are drawn at random without replacement from a set of items
labeled either `1` or `0`,  the random integer expresses the number of items drawn
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
                if RNDINT(currentCount) < currentOnes
                        currentOnes = currentOnes - 1
                        successes = successes + 1
                end
                currentCount = currentCount - 1
                i = i + 1
        end
        return successes
    END METHOD

<a id=Poisson_Distribution></a>
## Poisson Distribution

The following method generates a random integer that follows a Poisson distribution.
The integer is such that the average of the random integers approaches the given mean number when this method is called repeatedly with the same mean.  Note that the mean can also
be a fractional number.  The method given here is based on Knuth's method from 1969.

    METHOD Poisson(mean)
        if mean < 0: return error
        pn = exp(-mean)
        p = 1.0
        count = 0
        loop
            count = count + 1
            p = p * RNDU()
            if p <= pn
                    return count - 1
            end
        end
    END METHOD

<a id=Gamma_Distribution></a>
## Gamma Distribution

The following method generates a random number that follows a gamma distribution.
The method given here is based on Marsaglia and Tsang's method from 2000.

    METHOD GammaDist(a)
        if a <= -1: return error
        d = a
        v = 0
        if a < 1: d = d + 1
        d = d - (1/3) // NOTE: 1/3 must be a fractional number
        c = 1 / sqrt(9 * d)
        loop
            loop
               x = Normal(0, 1)
               v = c*x + 1;
               v = v * v * v
               if v > 0: break
            end
            // Avoid possibility of u being 0 because
            // of ln function below
            u = RNDNZU()
            x2 = x * x
            if u < 1 - (0.0331 * x2 * x2): break
            if ln(u) < (0.5 * x2) + (d * (1 - v + ln(v))): break
        end
        if a < 1: return d * v * exp(ln(RNDNZU()) / a)
        return d * v
    end

The two-parameter gamma distribution (`GammaDist2(a, b)`), where `b` is the scale, is simply `GammaDist(a) * b`.

<a id=Other_Non_Uniform_Distributions></a>
## Other Non-Uniform Distributions

- **Beta distribution**: `x / (x + GammaDist(b))`, where `x` is `GammaDist(a)` and `a` and `b` are
 the two parameters of the beta distribution.
- **Beta binomial distribution**: `Binomial(trials, x / (x + GammaDist(b)))`, where `x` is `GammaDist(a)`, `a` and `b` are
 the two parameters of the beta distribution, and `trials` is a parameter of the binomial distribution.
- **Cauchy distribution**: `scale * tan(pi * (RNDU()-0.5)) + mu`, where `mu` and `scale`
are the two parameters of the Cauchy distribution.
- **Chi-squared distribution**: `GammaDist(df * 0.5) * 2`, where `df` is the number of degrees of
  freedom.
- **Exponential distribution**: `-ln(RNDNZU()) / lambda`, where `lambda` is the inverse scale.
- **Geometric distribution**: `NegativeBinomial(1, p)`, where `p` has the same meaning
 as in the negative binomial distribution.
- **Inverse gamma distribution**: `b / GammaDist(a)`, where `a` and `b` have the
 same meaning as in the two-parameter gamma distribution.
- **Laplace (double exponential) distribution**: `(ln(RNDNZU())-ln(RNDNZU()))*beta+mu`, where `beta` is the scale and `mu` is the mean.
- **Logarithmic normal distribution**: `exp(Normal(mu, sigma))`, where `mu` and `sigma`
 have the same meaning as in the normal distribution.
- **Snedecor's _F_-distribution**: `GammaDist(m * 0.5) * n / (GammaDist(n * 0.5) * m)`, where `m` and `n` are the numbers of degrees of freedom of two random numbers with a chi-squared distribution.
- **Student's _t_-distribution**: `Normal(0, 1) / sqrt(GammaDist(df * 0.5) * 2 / df)`, where `df` is the number of degrees of freedom.
- **Weibull distribution**: `b * pow(-ln(RNDNZU()),1/a)`, where `a` and `b` are greater than 0.

<a id=Conclusion></a>
## Conclusion

This page discussed many ways applications can extract random numbers
from random number generators.

Feel free to send comments. They may help improve this page.  In particular, corrections to any method given on this page are welcome.

<a id=License></a>
## License

This page is licensed under [A Public Domain dedication](http://creativecommons.org/licenses/publicdomain/).
