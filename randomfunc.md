# Random Number Generation Methods

[Peter Occil](mailto:poccil14@gmail.com)

Begun on June 4, 2017; last updated on June 15, 2017.

Discusses many ways in which applications can extract random numbers from RNGs and includes pseudocode for most of them.

<a id=Introduction></a>
## Introduction

This page discusses many ways applications can extract random numbers
from random number generators (RNGs) and includes pseudocode for most
of them.

As used in this document--
- RNGs include those that seek to generate random numbers that are cost-prohibitive to predict (also called "cryptographically strong" RNGs) and those that merely seek to generate number sequences likely to pass statistical tests of randomness, and
- RNGs include not only those that use a deterministic algorithm, but also those that primarily rely on one or more nondeterministic sources for random number generation.

In general, though, recommendations on which RNGs are suitable for which applications are outside the scope of this page;  I have written about this in [another document](https://peteroupc.github.io/random.html). Moreover, the methods presented in this page can generally be used by any RNG regardless of its nature.

<a id=Contents></a>
## Contents

- [Introduction](#Introduction)
- [Contents](#Contents)
- [Notes and Definitions](#Notes_and_Definitions)
- [Core Random Generation Method](#Core_Random_Generation_Method)
- [Random Numbers Within a Range](#Random_Numbers_Within_a_Range)
    - [Random Integers Within a Range](#Random_Integers_Within_a_Range)
    - [Random Numbers in a 0-1 Bounded Interval](#Random_Numbers_in_a_0_1_Bounded_Interval)
    - [Uniform Numbers Within a Range](#Uniform_Numbers_Within_a_Range)
- [Boolean Conditions](#Boolean_Conditions)
- [Shuffling](#Shuffling)
- [Choosing a Random Item from a List](#Choosing_a_Random_Item_from_a_List)
- [Creating a Random Character String](#Creating_a_Random_Character_String)
- [Choosing Several Unique Items](#Choosing_Several_Unique_Items)
- [Weighted Choice](#Weighted_Choice)
    - [Discrete Weighted Choice](#Discrete_Weighted_Choice)
        - [Example](#Example)
        - [Weighted Choice Without Replacement](#Weighted_Choice_Without_Replacement)
    - [Continuous Weighted Choice](#Continuous_Weighted_Choice)
        - [Example](#Example)
- [Normal (Gaussian) Distribution](#Normal_Gaussian_Distribution)
- [Binomial Distribution](#Binomial_Distribution)
- [Hypergeometric Distribution](#Hypergeometric_Distribution)
- [Poisson Distribution](#Poisson_Distribution)
- [Gamma Distribution](#Gamma_Distribution)
- [Negative Binomial Distribution](#Negative_Binomial_Distribution)
- [Other Non-Uniform Distributions](#Other_Non_Uniform_Distributions)
- [Conclusion](#Conclusion)
- [License](#License)

<a id=Notes_and_Definitions></a>
## Notes and Definitions

In this document:

* Divisions do not round to an integer.  In programming languages in which division of two integers results in an integer, the right-hand side of the division must be converted to a floating-point number first.
* Lists are indexed starting with 0.  That means the first item in the list is 0, the second item in the list is 1, and so on, up to the last item, whose index is the list's size minus 1.
* The pseudocode shown doesn't cover all error handling that may be necessary in a particular implementation.   Such errors may include overflow checking, bounds checking, division by zero, and checks for infinity.  Neither is the pseudocode guaranteed to yield high performance in a particular implementation, either in time or memory.
* `pi` is the constant &pi;, the ratio of a circle's circumference to its diameter.
* `sin(a)`, `cos(a)`, and `tan(a)` are the sine, cosine, and tangent of the angle `a`, respectively, in radians.
* `pow(a, b)` is the number `a` raised to the power `b`.
* `abs(a)` is the absolute value of `a`.
* `sqrt(a)` is the square root of `a`.
* `ln(a)` is the natural logarithm of `a`.  It corresponds to the `Math.log` method in Java and JavaScript.
* `exp(a)` is the number _e_ (base of natural logarithms) raised to the power `a`.
* `GetNextLine(file)` is a method that gets the next line from a file, or returns `nothing` if the end of the file was reached.
* `NewList()` creates a new empty list.
* `AddItem(list, item)` adds the item `item` to the list `list`.
* `size(list)` returns the size of the list `list`.
* `list[k]` refers to the item at index `k` of the list `list`.

<a id=Core_Random_Generation_Method></a>
## Core Random Generation Method

The core method for generating random numbers using an RNG is called **`RNDINT(N)`** in this document. It generates a random integer from 0 inclusive to N exclusive, where N is an integer greater than 0, and it assumes the underlying RNG produces uniformly random bits.

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
- Random number greater than 0, but less than 1 (interval `(0, 1)`): `(RNDINT(X-1) + 1) / X`
- Random number 0 or greater, but 1 or less (interval `[0, 1]`): `(RNDINT(X + 1)) / X`
- Random number greater than 0, but 1 or less (interval `(0, 1]`): `(RNDINT(X) + 1) / X`

In the method definitions given above, X is an integer which is the number of fractional parts between 0 and 1.  For 64-bit IEEE 854 floating-point numbers (Java `double`), X will be 2<sup>53</sup>.  For 32-bit IEEE 854 floating-point numbers (Java `float`), X will be 2<sup>24</sup>.  (See "Generating uniform doubles in the unit interval" in the [`xoroshiro+` remarks page](http://xoroshiro.di.unimi.it/#remarks)
for further discussion.)  Note that `RNDU()` corresponds to `Math.random()` in Java and JavaScript.

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

The [Fisher-Yates shuffle method](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle) shuffles a list such that all permutations of that list are equally likely to occur, assuming the RNG it uses produces uniformly random numbers and can generate all permutations of that list.  However, that method is also easy to get wrong.  The following pseudocode is designed to shuffle a list's contents.

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

An important consideration with respect to shuffling is the kind of RNG used.  Notably, a deterministic RNG can't generate all permutations of a list if the [factorial](https://en.wikipedia.org/wiki/Factorial) of the list's size is greater than the generator's _period_ (the maximum number of values it can generate in a sequence before that sequence repeats). This means that the items in a shuffled list of that size will never appear in certain orders when that generator is used to shuffle it. For example, a deterministic RNG with period 2<sup>64</sup> can't generate all permutations of a list with more than 20 items; with period 2<sup>128</sup>, more than 34 items; with period 2<sup>226</sup>, more than 52 items; and with period 2<sup>256</sup>, more than 57 items.  RNGs that seek to generate random numbers that are cost-prohibitive to predict (so-called "cryptographically strong" generators) suffer less from this problem.

<a id=Choosing_a_Random_Item_from_a_List></a>
## Choosing a Random Item from a List

To choose a random item from a list--

- whose size is known in advance, use the idiom `list[RNDINT(size(list))]`.  This idiom assumes that the first item of the list is at position 0, the second is at position 1, and so on.
- whose size is not known in advance, use a method like the following.  Although the pseudocode refers to files and lines, the technique applies to any situation when items are retrieved one at a time from a dataset or list whose size is not known in advance.

        METHOD RandomItemFromFile(file)
           i = 1
           lastItem = nothing
           loop
              // Get the next line from the file
              item = GetNextLine(file)
              // The end of the file was reached, break
              if item == nothing: break
              if RNDINT(i) == 0: lastItem = item
              i = i + 1
           end
        end

<a id=Creating_a_Random_Character_String></a>
## Creating a Random Character String

A commonly asked question involves how to generate a random string of characters (usually a random _alphanumeric string_, or string of letters and digits).

The first step is to generate a list of the letters, digits, and/or other characters the string can have.  Often, those characters will be--
* the basic digits "0" to "9" (U+0030-U+0039, nos. 48-57),
* the basic upper case letters "A" to "Z" (U+0041-U+005A, nos. 65-90), and
* the basic lower case letters "a" to "z" (U+0061-U+007A, nos. 96-122),

as found in the Basic Latin block of the Unicode Standard. Note that:

- If the list of characters is fixed, the list can be statically created at runtime or compile time, or a string type as provided in the programming language can be used to store the list as a string.
- Instead of individual characters, the list can consist of strings of characters.  In that case, storing the list of strings as a single string is usually not a clean way to store those strings.

The second step is to build a new string whose characters are chosen from that character list.  The pseudocode below demonstrates this by creating a list, rather than a string, where the random characters will be held.  It also takes the number of characters as a parameter named `size`.  (Converting this list to a text string is programming-language-dependent, and the details of the conversion are outside the scope of this page.)

      METHOD RandomString(characterList, stringSize)
           i = 0
           newString = NewList()
           while i < stringSize
               // Choose a character from the list
               randomChar = characterList[RNDINT(size(characterList))]
               // Add the character to the string
               AddItem(newString, randomChar)
               i = i + 1
            end
            return newString
      END METHOD

_**Note:** Often applications need to generate a string of characters that's not only random, but also unique.  The best way to ensure uniqueness in this case is to store a list (such as a hash table) of strings already generated and to check newly generated strings against the list (or table).  Random number generators alone should not be relied on to deliver unique results._

<a id=Choosing_Several_Unique_Items></a>
## Choosing Several Unique Items

Often, the need arises to choose `k` unique items or values from among `n` available items or values.  The following assumes that each item has an equal chance of being chosen.  There are several techniques for doing this depending on whether `n` is known and how big it is:

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
              j = RNDINT(i)
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
- **If `n` is relatively small (for example, if there are 200 available items, or there is a range of numbers from 0 to 200 to choose from):** Store all the items in a list, [shuffle](#Shuffling) that list, and choose the first `k` items from that list.
- **If `n` is relatively large (for example, if 32-bit or larger integers will be chosen so that `n` is 2<sup>32</sup> or is a greater power of 2):** Create a hash table storing the items already generated.  When a new index to an item is chosen, check the hash table to see if it's there already.  If it's not there already, add it to the hash table.  Otherwise, choose a new index.  Repeat this process until `k` indices were added to the hash table this way.  Performance considerations involved in storing data in hash tables, and in retrieving data from them, are outside the scope of this document.  This technique can also be used for relatively small `n`, if some of the items have a higher probability of being chosen than others (see [Discrete Weighted Choice](#Discrete_Weighted_Choice), below).

<a id=Weighted_Choice></a>
## Weighted Choice

Some applications need to choose random items or numbers such that some of them are more likely to be chosen than others.

<a id=Discrete_Weighted_Choice></a>
### Discrete Weighted Choice

The discrete weighted choice method is used to choose a random item from among a set of them with different probabilities of being chosen.

The following pseudocode takes two lists, `list` and `weights`, and returns the index of one item from the list `list`.  Items with greater weights (which are given at the corresponding indices in the list `weights`) are more likely to be chosen. (Note that there are two possible ways to generate the random number depending on whether the weights are all integers or can be fractional numbers.) Each weight should be 0 or greater. Both lists should be the same size.

    METHOD DiscreteWeightedChoice(list, weights)
        if size(list) <= 0 or size(weights) < size(list): return error
        sum = 0
        // Get the sum of all weights
        i = 0
        while i < size(list)
            sum = sum + weights[i]
            i = i + 1
        end
        // Choose a random integer/number from 0 to less than
        // the sum of weights.
        value = RNDINT(sum)
        // NOTE: If the weights can be fractional numbers,
        // use this instead:
        // value = RNDU() * sum
        // Choose the object according to the given value
        i = 0
        lastItem = size(list) - 1
        runningValue = 0
        while i < size(list)
           if weights[i] > 0
              newValue = runningValue + weights[i]
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

Assume `list` is the following: `["apples", "oranges", "bananas", "grapes"]`, and `weights` is the following: `[3, 15, 1, 2]`.  The weight for "apples" is 3, and the weight for "oranges" is 15.  Since "oranges" has a higher weight than "apples", the index for "oranges" (1) is more likely to be chosen than the index for "apples" (0) with the `DiscreteWeightedChoice` method.  The following pseudocode implements how to get a randomly chosen item from the list with that method.

    index = DiscreteWeightedChoice(list, weights)
    // Get the actual item
    item = list[index]

<a id=Weighted_Choice_Without_Replacement></a>
#### Weighted Choice Without Replacement

In the example above, the weights sum to 21.  However, the weights do not mean that when 21 items are selected, the index for "apples" will be chosen exactly 3 times, or the index for "oranges" exactly 15 times, for example.  Each call to `DiscreteWeightedChoice` is independent from the others, and each weight indicates only a _likelihood_ that the corresponding item will be chosen rather than the other items.  And this likelihood doesn't change no matter how many times `DiscreteWeightedChoice` is called with the same weights.  This is called a weighted choice _with replacement_, which can be thought of as drawing a ball, then putting it back.

To implement weighted choice _without replacement_ (which can be thought of as drawing a ball _without_ putting it back), simply call `DiscreteWeightedChoice`, and then decrease the weight for the chosen index by 1.  In this way, when items are selected repeatedly, each weight behaves like the number of "copies" of each item. This technique, though, will only work properly if all the weights are integers 0 or greater.  The pseudocode below is an example of this.

    // Get the sum of weights
    // (NOTE: This assumes that `weights` is
    // a list that can be modified.  If the original weights
    // are needed for something else, a copy of that
    // list should be made first, but the copying process
    // is not shown here.)
    totalWeight = 0
    i = 0
    while i < size(list)
        totalWeight = totalWeight + weights[i]
        i = i + 1
    end
    // Choose as many items as the sum of weights
    i = 0
    items = NewList()
    while i < totalWeight
        index = DiscreteWeightedChoice(list, weights)
        // Decrease weight by 1 to implement selection
        // without replacement.
        weights[index] = weights[index] - 1
        AddItem(items, list[index])
        i = i + 1
    end

Alternatively, if all the weights are integers 0 or greater and their sum is relatively small, create a list with as many copies of each item as its weight, then [shuffle](#Shuffling) that list.  The resulting list will be ordered in a way that corresponds to a weighted random choice without replacement.

<a id=Continuous_Weighted_Choice></a>
### Continuous Weighted Choice

The continuous weighted choice method is used to choose a random number that follows a continuous numerical distribution.

The following pseudocode takes two lists, `list` and `weights`, and returns a random number that follows the distribution.  `list` is a list of numbers (which can be fractional numbers) that should be arranged in ascending order, and `weights` is a list of _probability densities_ for the given numbers (where each number and its density have the same index in both lists).  Each probability density should be 0 or greater.  Both lists should be the same size.  In the pseudocode below, the first number in `list` can be returned exactly, but not the second item in `list`, assuming the numbers in `list` are arranged in ascending order.

In many cases, the probability densities are sampled (usually at regularly spaced points) from a so-called [_probability density function_](https://en.wikipedia.org/wiki/Probability_density_function), a function that specifies the _probability density_ for each number (the probability that a randomly chosen value will be infinitesimally close to that number, assuming no precision limits).  A list of common probability density functions is outside the scope of this page.

    METHOD ContinuousWeightedChoice(list, weights)
        if size(list) <= 0 or size(weights) < size(list): return error
        if size(list) == 1: return list[0]
        // Get the sum of all areas between weights
        sum = 0
        areas = NewList()
        i = 0
        while i < size(list) - 1
          weightArea = abs((weights[i] + weights[i + 1]) * 0.5 * (list[i + 1] - list[i]))
          AddItem(areas, weightArea)
          sum += weightArea
           i = i + 1
        end
        // Choose a random number
        value = RNDU() * sum
         // Interpolate a number according to the given value
         i=0
         // Get the number corresponding to the random number
         runningValue = 0
        while i < size(list) - 1
        area = areas[i]
         if area > 0
          newValue = runningValue + area
          if value <= newValue
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

<a id=Example></a>
#### Example

Assume `list` is the following: `[0, 1, 2, 2.5, 3]`, and `weights` is the following: `[0.2, 0.8, 0.5, 0.3, 0.1]`.  The probability density for 2 is 0.5, and that for 2.5 is 0.3.  Since 2 has a higher probability density than 2.5, numbers near 2 are more likely to be chosen than numbers near 2.5 with the `ContinuousWeightedChoice` method.

<a id=Normal_Gaussian_Distribution></a>
## Normal (Gaussian) Distribution

The normal distribution (also called the Gaussian distribution) can model many kinds of measurements or scores whose values are most likely around a given average and are less likely the farther away from that average on either side.

The following method generates two [normally-distributed](https://en.wikipedia.org/wiki/Normal_distribution)
random numbers with mean (average) `mu` (&mu;) and standard deviation `sigma` (&sigma;). (In a _standard normal distribution_, &mu; = 0 and &sigma; = 1.), using the so-called [Box-Muller transformation](https://en.wikipedia.org/wiki/Box-Muller transformation), as further explained in the pseudocode's comments.  The standard deviation `sigma` affects how wide the normal distribution's "bell curve" appears; the
probability that a normally-distributed random number will be one standard deviation from the mean is about 68.3%;
within two standard deviations (2 times `sigma`), about 95.4%, and within three standard deviations, about 99.7%.

    METHOD Normal2(mu, sigma)
      // Choose a Rayleigh-distributed radius (multiplied by sigma)
      radius = sqrt(-2 * ln(1.0 - RNDU())) * sigma
      // Choose a random angle
      angle = 2 * pi * RNDU()
      // Return two normally-distributed numbers.  This will
      // be the X and Y coordinates of a point on a circle.
      return [mu + radius * cos(angle), mu + radius * sin(angle)]
    END METHOD

Since `Normal2` returns two numbers instead of one, but many applications require only one number at a time, a problem arises on how to return one number while storing the other for later retrieval.  Ways to solve this problem are outside the scope of this page, however.  The name `Normal` will be used in this document to represent a method that returns only one normally-distributed random number rather than two.

Also note that a normally-distributed random number can theoretically fall anywhere on the number line, even if it's extremely far from the mean.  Depending on the use case, an application may need to reject normally-distributed numbers lower or higher than certain thresholds and generate new normally-distributed numbers.  But then the resulting distribution will no longer be a normal distribution.

<a id=Binomial_Distribution></a>
## Binomial Distribution

The following method generates a random integer that follows a binomial distribution.  This number
expresses the number of successes that have happened after a given number of independently performed trials
(expressed as `trials` below), where the probability of a success in each trial is `p` (which ranges from 0, never, to
1, always, and which can be 0.5, meaning an equal chance of success or failure).

**Example:** If `p` is 0.5, the binomial distribution models the task "Flip N coins, then count the number of heads."

    METHOD Binomial(trials, p)
        if trials < 0: return error
        if trials == 0: return 0
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

<a id=Hypergeometric_Distribution></a>
## Hypergeometric Distribution

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

The following method generates a random integer that follows a Poisson distribution. The integer is such that the average of the random integers approaches the given mean number when this method is called repeatedly with the same mean.  Note that the mean can also be a non-integer number. Usually, the `mean` is the average number of independent events of a certain kind per fixed span of time or space (for example, per day, hour, or square kilometer).  The method given here is based on Knuth's method from 1969.

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
The gamma distribution models expected lifetimes. The method given here is based on Marsaglia and Tsang's method from 2000.

    METHOD GammaDist(meanLifetime)
        // Must be greater than 0
        if meanLifetime <= 0: return error
        d = meanLifetime
        v = 0
        if meanLifetime < 1: d = d + 1
        d = d - (1/3) // NOTE: 1/3 must be a fractional number
        c = 1 / sqrt(9 * d)
        loop
            x = 0
            loop
               x = Normal(0, 1)
               v = c * x + 1;
               v = v * v * v
               if v > 0: break
            end
            u = 1.0 - RNDU()
            x2 = x * x
            if u < 1 - (0.0331 * x2 * x2): break
            if ln(u) < (0.5 * x2) + (d * (1 - v + ln(v))): break
        end
        if meanLifetime < 1
           return d * v * exp(ln(1.0 - RNDU()) / meanLifetime)
        end
        return d * v
    end

The two-parameter gamma distribution (`GammaDist2(a, b)`), where `b` is the scale, is simply `GammaDist(a) * b`.  Here, `a` can be seen as the mean lifetime in unspecified units of time, and `b` indicates the size of each unit of time.

<a id=Negative_Binomial_Distribution></a>
## Negative Binomial Distribution

The following method generates a random integer that follows a negative binomial distribution.  This number expresses the number of failures that have happened after seeing a given number of successes (expressed as `successes` below), where the probability of a success in each case is `p` (which can be greater than 0, never, and equal to or less than 1, always, and which can be 0.5, meaning an equal chance of success or failure).

**Example:** If `p` is 0.5 and `successes` is 1, the negative binomial distribution models the task "Flip a coin until you get tails, then count the number of heads."

The following implementation of the negative binomial distribution allows `successes` to be an integer or a non-integer.

    METHOD NegativeBinomial(successes, p)
        // Must be 0 or greater
        if successes < 0: return error
  // No failures if no successes or if always succeeds
        if successes == 0 or p >= 1.0: return 0
        // Always fails (NOTE: infinity can be the maximum possible
        // integer value if NegativeBinomial is implemented to return
        // an integer)
        if p <= 0.0: return infinity
        // NOTE: `successes` must be greater than 0,
        // but can be a non-integer
        return Poisson(GammaDist(successes) * (1 - p) / p)
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
- **Exponential distribution**: `-ln(1.0 - RNDU()) / lambda`, where `lambda` is the inverse scale. The `lambda` is usually the probability that an independent event of a given kind will occur in a given span of time (such as in a given day or year).  `1/lambda` is the scale (mean), which is usually the average waiting time between two independent events of the same kind.
- **Geometric distribution**: `NegativeBinomialInt(1, p)`, where `p` has the same meaning
 as in the negative binomial distribution.
- **Inverse gamma distribution**: `b / GammaDist(a)`, where `a` and `b` have the
 same meaning as in the two-parameter gamma distribution.
- **Laplace (double exponential) distribution**: `(ln(1.0 - RNDU())-ln(1.0 - RNDU()))*beta+mu`, where `beta` is the scale and `mu` is the mean.
- **Logarithmic normal distribution**: `exp(Normal(mu, sigma))`, where `mu` and `sigma`
 have the same meaning as in the normal distribution.
- **Pascal distribution:** `NegativeBinomialInt(successes, p) + successes`, where `successes` and `p` have the same meaning as in the negative binomial distribution.
- **Rayleigh distribution**: `sqrt(-ln(1.0 - RNDU())*2*a*a)`, where `a` is the scale and is greater than 0.
- **Snedecor's _F_-distribution**: `GammaDist(m * 0.5) * n / (GammaDist(n * 0.5) * m)`, where `m` and `n` are the numbers of degrees of freedom of two random numbers with a chi-squared distribution.
- **Student's _t_-distribution**: `Normal(0, 1) / sqrt(GammaDist(df * 0.5) * 2 / df)`, where `df` is the number of degrees of freedom.
- **Triangular distribution**: `ContinuousWeightedChoice([startpt, midpt, endpt], [0, 1, 0])`. The distribution starts at `startpt`, peaks at `midpt`, and ends at `endpt`.
- **Weibull distribution**: `b * pow(-ln(1.0 - RNDU()),1/a)`, where `a` is the shape, `b` is the scale, and `a` and `b` are greater than 0.

<a id=Conclusion></a>
## Conclusion

This page discussed many ways applications can extract random numbers
from random number generators.

Feel free to send comments. They may help improve this page.  In particular, corrections to any method given on this page are welcome.

I acknowledge the commenters to the CodeProject version of this page, including George Swan, who referred me to the reservoir sampling method.

<a id=License></a>
## License

This page is licensed under [A Public Domain dedication](http://creativecommons.org/licenses/publicdomain/).
