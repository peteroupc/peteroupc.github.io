# Random Number Generator Recommendations for Applications

[Peter Occil](mailto:poccil14@gmail.com)

Begun on Mar. 5, 2016; last updated on June 8, 2017.

Most apps that use random numbers care about either unpredictability or speed/high quality.

<a id=Introduction></a>
## Introduction

As I see it, there are two kinds of random number generators (RNGs) needed by most applications, namely _statistically random generators_ and _unpredictable-random generators_.  I make this distinction because that is how programming languages often present random number generators -- they usually offer a general-purpose RNG (such as C's `rand` or Java's `java.util.Random`) and sometimes an RNG intended for security purposes (such as `java.security.SecureRandom`).  This page will discuss these two kinds of RNG in the nature of a sketch of a C programming interface, and make recommendations on their use and properties.

In addition, other applications require numbers that "seem" random but are based on an initial state, or "seed".  This page will discuss when seeds should be used by applications.

Finally, this page will discuss issues on the practical use of RNGs in applications, namely, shuffling and the two methods for higher-level randomness methods.

<a id=Contents></a>
## Contents

[Introduction](#Introduction)<br>[Contents](#Contents)<br>[Definitions](#Definitions)<br>[Unpredictable-random Generators](#Unpredictable_random_Generators)<br>[Statistically Random Generators](#Statistically_Random_Generators)<br>[Seedable Random Generators](#Seedable_Random_Generators)<br>[Using Random Number Generators](#Using_Random_Number_Generators)<br>&nbsp;&nbsp;[Random Number Extraction](#Random_Number_Extraction)<br>&nbsp;&nbsp;[Shuffling](#Shuffling)<br>[Conclusion](#Conclusion)<br>[License](#License)<br>

<a id=Definitions></a>
## Definitions

The following definitions are helpful in better understanding this document.

- **Pseudorandom number generator (PRNG).** A number generator that outputs seemingly random numbers using a deterministic algorithm, that is, an algorithm that returns the same output for the same state every time. (In this document, RNGs include PRNGs.)
- **Seed.**  Arbitrary data for initializing the state of a PRNG.
- **Seed length.**  The maximum size of the seed a PRNG can take to initialize its state without truncating or compressing that seed.
- **Period.** The number of random numbers a PRNG can generate in one sequence before the sequence repeats.  The period will not be greater than 2<sup>`L`</sup> where `L` is the PRNG's _seed length_.

<a id=Unpredictable_random_Generators></a>
## Unpredictable-Random Generators

Unpredictable-random implementations (also known as "cryptographically strong" or "cryptographically secure" RNGs) are indispensable in computer security and information security contexts, such as--

-  generating keying material, such as encryption keys,
-  generating random passwords or session identifiers,
-  generating "salts" to vary cryptographic hashes of the same password,
-  use in secure communication protocols, and
-  use in multiplayer networked games where predicting future random numbers would give a player an unfair advantage.

They are also useful in other contexts, such as--

-  shuffling a digital deck of cards, for reasons described later, and
-  cases where the application generates random numbers so infrequently that the RNG's speed is not a concern.

The goal of this kind of generator is to keep the random numbers from being guessed easily.

    int random(uint8_t[] bytes, size_t size);

Generates random bits using an unpredictable-random implementation.

-  **Quality:** An unpredictable-random implementation generates uniformly random bits that are unpredictable. "Unpredictable" means that an outside party can guess neither prior nor future unseen bits of the random sequence correctly with more than a 50% chance per bit, even with knowledge of the randomness-generating procedure, the implementation's internal state at the given point in time, or extremely many outputs of the RNG. (If the sequence was generated directly by a PRNG, ensuring future bits are unguessable this way should be done wherever the implementation finds it feasible; see "Seeding and Reseeding".)
-  **Seeding and Reseeding:** The following applies only to implementations that use PRNGs.

    The implementation must be automatically initialized ("seeded") with a "seed" described as follows. The seed--
    - must consist of unpredictable data (as defined above), which ultimately derives from a nondeterministic source or sources and no part of which may be the PRNG's own output (such data may be mixed with other arbitrary data as long as the result is no less unpredictable), and
    - must be at least the same size as the PRNG's _seed length_.

    The PRNG's _seed length_ must be at least 128 bits and should be at least 256 bits.

    The implementation should be reseeded from time to time (using a newly generated seed as described above) to help ensure the unpredictability of the output. If the implementation reseeds, it must do so before it generates more than 2<sup>67</sup> bits without reseeding and should do so  before it generates more than 2<sup>32</sup> bits without reseeding.
-  **Speed:** The implementation should select procedures that are reasonably fast for most applications.
-  **Time Complexity:** The implementation must run in amortized linear time on the size of the output array.
-  **Thread Safety:** The implementation should be safe for concurrent use by multiple threads.
-  **Examples:** The "`/dev/urandom`" device on many Unix-based operating systems; `CryptGenRandom` function on Windows; cryptographic hash functions that take unpredictable signals as input (such as disk access and keystroke timings).

"bytes" is a pointer to a byte array, "size" is the number of random bytes to generate. Each bit in each byte will be randomly set to 0 or 1. Returns 0 if the function succeeds, and nonzero otherwise.

<a id=Statistically_Random_Generators></a>
## Statistically Random Generators

Statistically random generators are used by simulations and many games to bring an element of chance and variation to the application. This kind of generator is generally suitable only if--

-  computer security and information security are not involved,
-  20 or fewer items are being shuffled (in cases where the RNG is used for shuffling), and
-  the application generates random numbers so frequently that it would slow down undesirably if an unpredictable-random implementation were used instead.

The goal of this kind of generator is for each possible outcome to be equally likely.

    int random_fast(uint8_t[] bytes, size_t size);

Generates random bits using a statistical-random implementation.

-  **Quality:** A statistical-random implementation generates random bits, each of which is uniformly randomly distributed independently of the other bits, at least for nearly all practical purposes. The implementation must be almost certain to pass simple statistical randomness tests and many complex ones. (For example, any RNG algorithm that shows no [systematic failures](http://xoroshiro.di.unimi.it/#quality) in `TestU01`'s `BigCrush` test battery [L'Ecuyer and Simard 2007] meets these requirements.)
-  **Seeding and Reseeding:** The following applies only to implementations that use PRNGs.

    The implementation must be automatically initialized ("seeded") with a seed described as follows. The seed--
    - must consist of data not known _a priori_ by the implementation, such as random bits from an unpredictable-random implementation,
    - must not be a fixed value or a user-entered value,
    - should not be trivially predictable in any of its bits, as far as practical, and
    - must be at least the same size as the PRNG's _seed length_.

    The PRNG's _seed length_ must be at least 64 bits and should be at least 128 bits.

    The implementation may reseed itself from time to time (using a newly generated seed as described above). It should do so if the PRNG's _seed length_ is less than 238 bits. If the implementation reseeds, it should do so before it generates more values than the square root of the PRNG's period without reseeding.
-  **Speed:** The implementation should select procedures that are reasonably fast for most applications. The implementation may instead use an unpredictable-random implementation as long as the function remains at least as fast, in the average case, as the statistical-random implementation it would otherwise use.
-  **Time Complexity:** The implementation must run in amortized linear time on the size of the output array.
-  **Thread Safety:** The implementation should be safe for concurrent use by multiple threads.
-  **Examples:** The "`xorshift128+`" and `Lehmer128` random number generators.
-  **Non-Examples:**  Mersenne Twister [systematically fails](http://xoroshiro.di.unimi.it/#quality) one of the `BigCrush` tests.  Any linear congruential generator with modulus 2<sup>63</sup> or less (such as `java.util.Random`) has a _seed length_ of less than 64 bits.

"bytes" is a pointer to a byte array, "size" is the number of random bytes to generate. Each bit in each byte will be randomly set to 0 or 1. Returns 0 if the function succeeds, and nonzero otherwise.

<a id=Seedable_Random_Generators></a>
## Seedable Random Generators

In addition, some applications use pseudorandom number generators (PRNGs) to generate results based on apparently-random principles, starting from a known initial state, or "seed". One notable example is a "code", or password, for generating a particular game level in some role-playing games.

Applications that require seeding usually care about reproducible results. Such applications often need to keep not only the PRNG algorithm stable, but also any algorithm that uses that algorithm (such as a game level generator), especially if it publishes seeds (for example, game level passwords). Moreover, which PRNG to use for such purpose depends on the application. But here are some recommendations:

-  Any PRNG algorithm selected for producing reproducible results should meet or exceed the quality requirements of a statistical-random implementation, and should be reasonably fast.
-  The PRNG's _seed length_ should be 64 bits or greater.
-  Any seed passed to the PRNG should be at least the same size as the PRNG's _seed length_.

An application should only use seeding if--

1. the initial state (the seed) which the "random" result will be generated from--
    - is hard-coded,
    - was entered by the user,
    - was generated using a statistical or unpredictable-random implementation (as defined above), or
    - is based on a timestamp (but only if the reproducible result is not intended to vary during the time specified on the timestamp and within the timestamp's granularity; for example, a year/month/day timestamp for a result that varies only daily),
2. the application needs to generate the same "random" result multiple times,
3.  it would be impractical to store or distribute that "random" result without relying on seeding, such as--
    -   by saving the result to a file, or
    -   by distributing the results or the random numbers to networked users as they are generated, and
4. the PRNG algorithm and any procedure using that algorithm to generate that "random" result will remain stable as long as the relevant feature is still in use by the application. (Not using seeding allows either to be changed or improved without affecting the application's functionality.)

Seeds also come into play in other situations, such as:

* **Verifiable randomness.** An application can use seeds to generate publicly verifiable random numbers (that is, random numbers that are publicly disclosed together with all the information required to verify their generation), using a process described, for example, in [RFC 3797](https://www.rfc-editor.org/rfc/rfc3797.txt) (to the extent its advice is not specific to the Internet Engineering Task Force or its Nominations Committee).
* **Noise.** Randomly generated numbers can serve as _noise_, that is, a randomized variation in images and sound.   An application need not follow the seeding recommendations when generating noise, and the RNG used to generate the noise need only be as strong as required to achieve the desired effect, but only if--
     - the RNG is used solely to generate noise, or the RNG meets the requirements of a statistical-random or unpredictable-random implementation, and
     - the use of the noise has no impact on application functionality and does not implicate computer or information security.
 
    (A detailed description of noise algorithms, such as white, pink, or other colored noise, Perlin noise, or fractal Brownian motion, is outside the scope of this page.)

<a id=Using_Random_Number_Generators></a>
## Using Random Number Generators

The following topics deal with the practical use of RNGs in applications.  Unless stated otherwise,
they apply regardless of the kind of RNG used (such as an unpredictable-random or statistically
random implementation).

<a id=Random_Number_Extraction></a>
### Random Number Extraction

Two methods given below can serve as building blocks for writing code that makes practical use
of randomness. Both methods assume the RNG produces uniformly random numbers, like the RNGs
described in this page.

1. The first method is to generate a random integer from 0 inclusive to N exclusive (here
called `RNDINT(N)`), where N is an integer greater than 0. To do so, use the RNG to generate as many
random bits as used to represent N-minus-1, then convert those bits to a nonnegative integer.
If that nonnegative integer is N or greater, repeat this process.
2. The second method is to generate a random number from 0 inclusive to 1 exclusive. This can be
implemented by calling `RNDINT(X)` and dividing by X, where X is an integer which is the number of fractional parts between 0 and 1.  For 64-bit IEEE 854 floating-point numbers
(Java `double`), X will be 2<sup>53</sup>.  For 32-bit IEEE 854 floating-point numbers
(Java `float`), X will be 2<sup>24</sup>. (See "Generating uniform doubles in the unit interval" in the [`xoroshiro+` remarks page](http://xoroshiro.di.unimi.it/#remarks)
for further discussion.)

A detailed discussion of other methods to generate random numbers or integers that
follow a given distribution, such as a normal, geometric, binomial, or discrete weighted
distribution, or that fall within a given range, is outside the scope of this page, however;  I have written about this in [another document](https://peteroupc.github.io/randomfunc.html).

In my opinion, new programming languages should include methods corresponding to the two
given above in their standard libraries -- one set for unpredictable-random generators, and another
set for statistical RNGs.

<a id=Shuffling></a>
### Shuffling

There are special considerations in play when applications use RNGs to shuffle a list of items.

1. **Shuffling method.** The [Fisher-Yates shuffle method](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle) shuffles a list such that all permutations of that list are equally likely to occur, assuming the RNG it uses produces uniformly random numbers and can generate all permutations of that list.  However, that method is also easy to get wrong; I give a correct implementation in [another document](https://peteroupc.github.io/randomfunc.html).
2. **Generating all permutations.** A pseudorandom number generator (PRNG) can't generate all permutations of a list if the [factorial](https://en.wikipedia.org/wiki/Factorial) of the list's size is greater than the generator's _period_. This means that the items in a shuffled list of that size will never appear in certain orders when that generator is used to shuffle it. For example, a PRNG with period 2<sup>64</sup> (or one with a 64-bit seed length) can't generate all permutations of a list with more than 20 items; with period 2<sup>128</sup>, more than 34 items; with period 2<sup>226</sup>, more than 52 items; and with period 2<sup>256</sup>, more than 57 items. When shuffling more than 20 items, a concerned application would be well advised to use an unpredictable-random implementation. (See "Lack of randomness" in the [BigDeal document by van Staveren](https://sater.home.xs4all.nl/doc.html) for further discussion.)

<a id=Conclusion></a>
## Conclusion

In conclusion, most applications that require random numbers usually want either unpredictability (cryptographic security), or speed and high quality. I believe that RNGs that meet the descriptions specified in the "unpredictable-random implementations" and "Statistical RNGs" sections will meet the needs of those applications.

What has motivated me to write a more rigorous definition of random number generators is the fact that many applications still use weak RNGs.  In my opinion, this is largely because most popular programming languages today--
- don't specify virtually any requirements on RNGs (such as C's `rand` function),
- specify a relatively weak general-purpose RNG (such as Java's `java.math.Random`, although it also includes a much stronger `SecureRandom` class),
- implement RNGs by default that leave a bit to be desired (particularly the Mersenne Twister algorithm found in PHP's `mt_rand` as well as in Python and Ruby),
- seed RNGs with a timestamp by default (such as the [.NET Framework implementation of `System.Random`](https://msdn.microsoft.com/en-us/library/h343ddh9.aspx)), and/or
- leave the default seeding fixed or unspecified (such as C's `rand` function).

In addition, this document recommends using unpredictable-random implementations in many cases, especially in computer and information security contexts, and recommends easier programming interfaces for both unpredictable-random and statistical-random implementations in new programming languages.

Feel free to send comments. They may help improve this page.

I acknowledge the commenters to the CodeProject version of this page, including Cryptonite.

<a id=License></a>
## License

This page is licensed under [A Public Domain dedication](http://creativecommons.org/licenses/publicdomain/).
