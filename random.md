# The Two Kinds of Random-number Generators Most Applications Need

[Peter Occil](mailto:poccil14@gmail.com)

Begun on Mar. 5, 2016; last updated on May 27, 2017.

Most apps that use random numbers care about either unpredictability or speed/high quality.

## Introduction

As I see it, there are two kinds of random-number generators (RNGs) needed by applications, namely--

- unpredictable random generators (also known as "cryptographically strong" or "cryptographically secure"), and
- statistically random generators.

The following is a sketch of a C programming interface that specifies two functions that could meet these two needs.

## Unpredictable RNGs

Unpredictable random implementations (also known as "cryptographically strong" or "cryptographically secure" RNGs) are indispensable in information security contexts, such as--

-  generating encryption keys,
-  generating "salts" to vary cryptographic hashes of the same password, and
-  use in secure communication protocols.

They are also useful in other contexts, such as--

-  shuffling a digital deck of cards, for reasons described later, and
-  cases where the application generates random numbers so infrequently that the RNG's speed is not a concern.

The goal of this kind of generator is to keep the random numbers from being guessed easily.

    int random(uint8_t[] bytes, size_t size);

Generates random bits using an unpredictable-random implementation.

-  Quality: An unpredictable-random implementation generates random bits that are unpredictable.
-  Predictability: "Unpredictable" means that an outside party, even if the random algorithm used and extremely many outputs of the implementation are known--
    -   cannot guess prior unseen bits of the random sequence correctly with more than a 50% chance per bit, even with knowledge of the implementation's internal state at the given point in time, and
    -   cannot guess future unseen bits of that sequence correctly with more than a 50% chance per bit without knowledge of that state at the given point in time (or -- if the implementation uses a nondeterministic RNG or otherwise finds it feasible -- with that knowledge).
-  Seeding: If the implementation uses a deterministic RNG algorithm, its internal state must be initialized ("seeded") with a seed described below. The internal state (the part of the algorithm's state that can be initialized with arbitrary data) must be at least 128 bits and should be at least 238 bits (the length in bits of 54 factorial). The seed must be at least the same size as the internal state and consist of--
     -  unpredictable data, or
     -  a cryptographic hash of unpredictable data plus arbitrary data (or vice versa), where the unpredictable data has at least the same size as the internal state.
-  Reseeding: If the implementation uses a deterministic RNG algorithm, its internal state should be reseeded from time to time (using a seed described in the "Seeding" item) to ensure each bit of the output is unpredictable even if an outside party somehow gains knowledge of its internal state. If the implementation reseeds, it must do so before it generates more than 2<sup>68</sup> bits without reseeding and should do so  before it generates more than 2<sup>32</sup> bits without reseeding. (Reseeding is not necessary if the implementation uses a nondeterministic RNG.)
-  Speed: The implementation should select algorithms that are reasonably fast for most applications.
-  Time Complexity: The implementation must run in amortized linear time on the size of the output array.
-  Thread Safety: The implementation should be safe for concurrent use by multiple threads.
-  Examples: The "`/dev/urandom`" device on many Unix-based operating systems; `CryptGenRandom` function on Windows; cryptographic hash functions that take unpredictable signals as input (such as disk access and keystroke timings).

"bytes" is a pointer to a byte array, "size" is the number of random bytes to generate. Each bit in each byte will be randomly set to 0 or 1. Returns 0 if the function succeeds, and nonzero otherwise.

## Statistical RNGs

Statistically random generators are needed by simulations and many games to bring an element of chance and variation to the application. This kind of generator is generally suitable only if--

-  information security is not involved,
-  20 or fewer items are being shuffled (in cases where the RNG is used for shuffling), and
-  the application generates random numbers so frequently that it would slow down undesirably if an unpredictable RNG were used instead.

The goal of this kind of generator is for each possible outcome to be equally likely.

    int random_fast(uint8_t[] bytes, size_t size);

Generates random bits using a statistical-random implementation.

-  Quality: A statistical-random implementation generates random bits that, theoretically, are uniformly randomly chosen independently of the other bits. The implementation must be almost certain to pass simple statistical randomness tests and many complex ones. (For example, any RNG algorithm that shows no [systematic failures](http://xoroshiro.di.unimi.it/#quality) in TestU01's BigCrush test battery [L'Ecuyer and Simard 2007] meets these requirements.)
-  Predictability: The implementation's output must not be trivially predictable.
-  Seeding: The implementation must be initialized ("seeded") with a seed described below. The internal state must be at least 64 bits and should be at least 128 bits. The seed--
    - must consist of data not known _a priori_ by the implementation, such as random bits from an unpredictable-random implementation,
    - must not be a fixed value or a user-entered value,
    - should not be trivially predictable, as far as practical, and
    - must be at least the same size as the internal state.
-  Reseeding: The implementation may reseed the internal state from time to time (using a seed described in the "Seeding" item). It should do so if its internal state's size is less than 238 bits. If the implementation reseeds, it should do so before it generates more values than the square root of the RNG's period without reseeding.
-  Speed: The implementation should select algorithms that are reasonably fast for most applications. The implementation may instead use an unpredictable-random implementation as long as the function remains at least as fast, in the average case, as the statistical-random implementation it would otherwise use.
-  Time Complexity: The implementation must run in amortized linear time on the size of the output array.
-  Thread Safety: The implementation should be safe for concurrent use by multiple threads.
-  Examples: The "xorshift128+" and Lehmer128 random number generators.

"bytes" is a pointer to a byte array, "size" is the number of random bytes to generate. Each bit in each byte will be randomly set to 0 or 1. Returns 0 if the function succeeds, and nonzero otherwise.

## Shuffling

A deterministic random number generator (DRNG) can't generate more permutations of random number sequences than its period. A DRNG can't generate all permutations of a list if the factorial of its size is greater than the DRNG's period. This means that the items in a shuffled list of that size will never appear in certain orders when that DRNG is used to shuffle it.

A DRNG with period 264, for example, can't generate all permutations of a list with more than 20 items; with period 2128, more than 34 items; with period 2226, more than 52 items; and with period 2256, more than 57 items.

When shuffling more than 20 items, a concerned application would be well advised to use an unpredictable-random implementation.

Shuffling a list is usually done with the [Fisher-Yates shuffle method](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).

## Seedable Random Generators

In addition, some applications generate results based on apparently-random principles, starting from a known initial state. One notable example is a "code", or password, for generating a particular game level in some role-playing games.

Functions for seeding random number algorithms are not included, because applications that require seeding usually care about reproducible results. Such applications often need to keep not only the RNG algorithm stable, but also any algorithm that uses that RNG algorithm (such as a game level generator), especially if it publishes seeds (for example, game level passwords). Moreover, which RNG algorithm to use for such purpose depends on the application. (Such an algorithm will necessarily be a DRNG.) But here are some recommendations:

-  Any DRNG algorithm selected for producing reproducible results should meet at least the quality and predictability requirements of a statistical-random implementation, and should be reasonably fast.
-  Any seed passed as input to that algorithm should be 64 bits or greater.

An application should only use seeding if:

1. the initial state (the seed) which the "random" result will be generated from--
    - is hard-coded,
    - was entered by the user, or
    - was generated using a statistical or unpredictable RNG (as defined above),
2. the application needs to generate the same "random" result multiple times,
3.  it would be impractical to convey that "random" result without relying on seeding, such as--
    -   by saving the result to a file, or
    -   by distributing the results or the random numbers to networked users as they are generated, and
4. the RNG algorithm and any procedure using that algorithm to generate that "random" result will remain stable as long as the relevant feature is still in use by the application. (Not using seeding allows either to be changed or improved without affecting the application's functionality.)

On the other hand, an application need not use seeding if the randomness is only used for slight and inconspicuous visual variations, provided the visual variations have no impact on information security or on gameplay. For such purposes, the random-number generator need only be as strong as required to achieve the desired visual variations.

## Conclusion

In conclusion, most applications that require random numbers usually want either unpredictability (cryptographic security), or speed and high quality. I believe that RNGs that meet the descriptions specified above will meet the needs of these applications.

Feel free to send comments. They may help improve this page.

## License

This article, along with any associated source code and files, is licensed under [A Public Domain dedication](http://creativecommons.org/licenses/publicdomain/)
