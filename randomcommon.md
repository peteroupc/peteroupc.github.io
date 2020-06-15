# The Most Common Topics Involving Random Number Generation

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

This page lists some of the most common topics involving random number generation in programming.  They were based on an analysis of the _Stack Overflow_ questions that were most often targeted as duplicates of other questions (using the _Stack Exchange Data Explorer_ query named "Most popular duplicate targets by tag", with "random" as the TagName).

The analysis showed the following topics were among the most commonly asked:

- Generating uniform random integers in a range.
- Generating uniform random floating-point numbers in a range.
- Generating unique random integers in a range.
- Choosing a random item from a list.
- Choosing several unique items from a list.
- Choosing items with separate probabilities.
- Choosing random records from a database.
- Shuffling.
- Generating a random text string of characters selected from a restricted character set (such as only A to Z, a to z, 0 to 9).

Not all topics are covered above.  Notably, the analysis ignores questions that were API-specific or programming-language specific, unless the underlying issue is present in multiple APIs or languages.

Another notable trend is that these topics were asked for programming languages where convenient APIs for these tasks were missing. This is why I recommend that [**new programming language APIs**](https://peteroupc.github.io/random.html#Implementing_New_RNG_APIs) _provide functionality covering the topics above in their standard libraries_, to ease the burden of programmers using that language.

The following sections will detail the topics given above, with suggestions on how to solve them.

The [**pseudocode conventions**](https://peteroupc.github.io/pseudocode.html) apply to this document.

<a id=Uniform_Numbers_in_a_Range></a>
## Uniform Numbers in a Range

For algorithms on generating uniform random _integers_ in a range, see [**"Uniform Random Integers"**](https://peteroupc.github.io/randomfunc.html#Uniform_Random_Integers).  It should be noted there that most RNGs (random number generators) in common use output 32- or 64-bit non-negative integers, and for JavaScript, the idiom `(Math.random() < 0.5 ? 0 : 1)` will work in many practical cases as a random bit generator.  Here is a JavaScript example of generating a random integer in the interval [`minInclusive`, `maxExclusive`], using the Fast Dice Roller by J. Lumbroso (2013)<sup>[**(1)**](#Note1)</sup>:

```javascript
    function randomInt(minInclusive, maxExclusive) {
      var maxInclusive = (maxExclusive - minInclusive) - 1
      var x = 1
      var y = 0
      while(true) {
        x = x * 2
        var randomBit = (Math.random() < 0.5 ? 0 : 1)
        y = y * 2 + randomBit
        nextBit = nextBit + 1
        if(x > maxInclusive) {
          if (y <= maxInclusive) { return y + minInclusive }
          x = x - maxInclusive - 1
          y = y - maxInclusive - 1
        }
      }
    }
```

Many common programming languages have no convenient or correct way to generate random numbers in a range.  For example:

- Java's `java.util.Random` until version 8 had methods to produce `int`s in the interval [0, n) (`nextInt`), but not `long`s in that interval or integers in an arbitrary interval [a, b).   Additional methods named `longs`, `ints`, and `doubles` were provided that offer this functionality, but even so, they are not as convenient in some cases than the existing `nextInt` method.
- JavaScript until recently has only one API for random number generation, namely `Math.random()`, and no built-in method for random integer generation or shuffling, among other things.  Naïve solutions such as `Math.floor(Math.random()*x)+y` are not guaranteed to work reliably, in part because JavaScript doesn't require any particular implementation for `Math.random`.
- C's `rand` function produces random integers in a predetermined range (\[0, `RAND_MAX`\]) that is not within the application's control.  This is just one of a [**host of issues with `rand`**](https://stackoverflow.com/questions/52869166/why-is-the-use-of-rand-considered-bad/52881465#52881465), by the way (unspecified algorithm, yet is initializable with "srand" for repeatability; non-thread-safety; historical implementations had weak low bits; etc.).

For algorithms on generating uniform random _floating-point numbers_ in a range, see [**"For Floating-Point Number Formats"**](https://peteroupc.github.io/randomfunc.html#For_Floating_Point_Number_Formats).  Floating-point number generation has a number of issues not present with integer generation.  For example, no computer can choose from all real numbers between two others, since there are infinitely many of them, and also, naïvely multiplying or dividing an integer by a constant (e.g., `Math.random()*x` in JavaScript) will necessarily miss many representable floating-point numbers (for details, see Goualard 2020<sup>[**(2)**](#Note2)</sup>).

<a id=Choosing_Random_Items></a>
## Choosing Random Items

In general, choosing a random item from a list is trivial: choose a random integer in `[0, n)`, where `n` is the size of the list, then take the item at the chosen position.  The previous section already discussed how to generate a random integer.

However, if the number of items is not known in advance, then a technique called _reservoir sampling_ can be used to choose one or more items at random.   Here is how to implement reservoir sampling.

1. Set N to 1.
2. If no items remain, return the last chosen item.  Otherwise, take the next item and choose it with probability 1/N.
3. Add 1 to N and go to step 2.

See "[**Pseudocode for Random Sampling**](https://peteroupc.github.io/randomfunc.html#Pseudocode_for_Random_Sampling)" for an algorithm for reservoir sampling.

<a id=Unique_Integers_or_Items></a>
## Unique Integers or Items

Generating unique random integers or items is also known as sampling _without replacement_, _without repetition_, or _without duplicates_.

There are many ways to generate unique items, depending on the number of items to choose, the number of items to choose _from_, and so on, and they have different tradeoffs in terms of time and memory requirements.  See "[**Sampling Without Replacement: Choosing Several Unique Items**](https://peteroupc.github.io/randomfunc.html#Sampling_Without_Replacement_Choosing_Several_Unique_Items)" for advice.

Some applications require generating unique values that identify something, such as database records, user accounts, and so on.  However, there are certain things to keep in mind when generating unique values for this purpose; see [**Unique Random Identifiers**](https://peteroupc.github.io/random.html#Unique_Random_Identifiers) for more information.

<a id=Shuffling></a>
## Shuffling

An algorithm to randomize (_shuffle_) the order of a list is given in [**"Shuffling"**](https://peteroupc.github.io/randomfunc.html#Shuffling).  It should be noted that the algorithm is easy to implement incorrectly.

<a id=Random_Records_from_a_Database></a>
## Random Records from a Database

Querying random records (_rows_) from a database usually involves the database language SQL.  However, SQL is implemented very differently in practice between database management systems (DBMSs), so that even trivial SQL statements are not guaranteed to work the same from one DBMS to another.  Moreover, SQL has no loops, no branches, and no standard way to generate random numbers.  Thus, the correct way to generate random records from a database will vary from DBMS to DBMS.

With that said, the following specific situations tend to come up in random record queries.

- Querying one random record from a database.
- Querying a specified number of random records from a database.
- Querying one or more records each with a probability proportional to its weight.  Very generally, this can be done by giving the table a column where each entry is a number generated as follows: `ln(R) / W` (where `W` is the record's weight greater than 0, and `R` is a uniform random number in (0, 1)) (see also (Efraimidis 2015)<sup>[**(3)**](#Note3)</sup>), then taking the records with the highest values of that column, but the efficiency of this technique depends on the DBMS.

<a id=Random_Character_Strings></a>
## Random Character Strings

Nothing here yet.

<a id=Choosing_Items_with_Separate_Probabilities></a>
## Choosing Items with Separate Probabilities

TODO: Discuss weighted choice, the alias method, and the Fast Loaded Dice Roller.

Note that choosing _true_ with a given probability, or _false_ otherwise, is a special case of weighted sampling involving two items (also known as a _Bernoulli trial_).  But there are much simpler ways of choosing _true_ or _false_ this way; see [**Boolean (True/False) Conditions**](#Boolean_True_False_Conditions).  Perhaps the most practical is the idiom `RNDINTEXC(Y) < X`, which chooses _true_ with probability `X/Y`, _false_ otherwise.

<a id=Other_Topics></a>
## Other Topics

Other topics showed up in the analysis, and it's worth mentioning them here.  These topics included:

- Generating a random _derangement_, or a random shuffle where every item moves to a different position (see [**"Shuffling"**](https://peteroupc.github.io/randomfunc.html#Shuffling); see also `questions/25200220`).
- Generating a number that follows the [**normal distribution**](https://peteroupc.github.io/randomnotes.md#Normal_Gaussian_Distribution).
- Generating a number that follows an [**arbitrary distribution**](https://peteroupc.github.io/randomfunc.html#Random_Numbers_from_an_Arbitrary_Distribution)
- [**Random colors**](https://peteroupc.github.io/colorgen.html#Generating_a_Random_Color).
- Random [**numbers with a given sum**](https://peteroupc.github.io/randomfunc.html#Random_Integers_with_a_Given_Positive_Sum).
- Random [**dates and times**](https://peteroupc.github.io/randomfunc.html#Random_Dates_and_Times).
- Stratified sampling (per-group sampling).
- Generating a [**random point inside a circle**](https://peteroupc.github.io/randomfunc.md#Random_Points_Inside_a_Ball_Shell_or_Cone).

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> Lumbroso, J., "[**Optimal Discrete Uniform Generation from Coin Flips, and Applications**](https://arxiv.org/abs/1304.1916)", arXiv:1304.1916 [cs.DS].</small>

<small><sup id=Note2>(2)</sup> Goualard, F., "[**Generating Random Floating-Point Numbers by Dividing Integers: a Case Study**](https://hal.archives-ouvertes.fr/hal-02427338/)", 2020.</small>

<small><sup id=Note3>(3)</sup> Efraimidis, P. "[**Weighted Random Sampling over Data Streams**](https://arxiv.org/abs/1012.0256v2)", arXiv:1012.0256v2 [cs.DS], 2015.</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
