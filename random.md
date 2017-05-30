# The Two Kinds of Random-number Generators Most Applications Need

[Peter Occil](mailto:poccil14@gmail.com)

Begun on Mar. 5, 2016; last updated on May 30, 2017.

Most apps that use random numbers care about either unpredictability or speed/high quality.

## Introduction

As I see it, there are two kinds of random-number generators (RNGs) needed by applications, namely--

- unpredictable random generators, and
- statistically random generators.

The following is a sketch of a C programming interface that specifies two functions that could meet these two needs.

## Unpredictable RNGs

Unpredictable random implementations (also known as "cryptographically strong" or "cryptographically secure" RNGs) are indispensable in information security contexts, such as--

-  generating keying material, such as encryption keys,
-  generating random passwords,
-  generating "salts" to vary cryptographic hashes of the same password, and
-  use in secure communication protocols.

They are also useful in other contexts, such as--

-  shuffling a digital deck of cards, for reasons described later, and
-  cases where the application generates random numbers so infrequently that the RNG's speed is not a concern.

The goal of this kind of generator is to keep the random numbers from being guessed easily.

    int random(uint8_t[] bytes, size_t size);

Generates random bits using an unpredictable-random implementation.

-  Quality: An unpredictable-random implementation generates random bits that are unpredictable.
-  Predictability: "Unpredictable" means that an outside party can guess neither prior nor future unseen bits of the random sequence correctly with more than a 50% chance per bit, even with knowledge of the random algorithm or the implementation's internal state at the given point in time. (If the sequence was generated directly by a deterministic RNG, ensuring future bits are unguessable this way should be done wherever the implementation finds it feasible; see "Seeding and Reseeding".)
-  Seeding and Reseeding: The following applies only to deterministic RNG implementations; nondeterministic RNGs don't require seeding or reseeding.

    The implementation must be initialized ("seeded") with a "seed" described as follows. The seed--
    - must consist of unpredictable data, no part of which may be the RNG's own output (the unpredictable data may be mixed with other arbitrary data as long as the result is no less unpredictable), and
    - must be at least the same size as the RNG's _seed length_.

    The _seed length_ is the maximum size of the seed the RNG can take to initialize its state without truncating or compressing that seed. It must be at least 128 bits and should be at least 256 bits.

    The implementation should be reseeded from time to time (using a newly generated seed as described above) to help ensure the unpredictability of the output. If the implementation reseeds, it must do so before it generates more than 2<sup>67</sup> bits without reseeding and should do so  before it generates more than 2<sup>32</sup> bits without reseeding.
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

-  Quality: A statistical-random implementation generates random bits, each of which, practically speaking, is uniformly randomly distributed independently of the other bits. The implementation must be almost certain to pass simple statistical randomness tests and many complex ones. (For example, any RNG algorithm that shows no [systematic failures](http://xoroshiro.di.unimi.it/#quality) in `TestU01`'s `BigCrush` test battery [L'Ecuyer and Simard 2007] meets these requirements.)
-  Predictability: The implementation's output must not be trivially predictable. "Trivially predictable" means that it's generally trivial to guess future outputs of the RNG given knowledge of the RNG algorithm and a sequence of outputs whose total length is no greater than the RNG's _seed length_.
-  Seeding and Reseeding: The following applies only to deterministic RNGs.

    The implementation must be initialized ("seeded") with a seed described below. The RNG's _seed length_ must be at least 64 bits and should be at least 128 bits. The seed--
    - must consist of data not known _a priori_ by the implementation, such as random bits from an unpredictable-random implementation,
    - must not be a fixed value or a user-entered value,
    - should not be trivially predictable, as far as practical, and
    - must be at least the same size as the RNG's _seed length_.

    The implementation may reseed itself from time to time (using a newly generated seed as described above). It should do so if the RNG's seed length is less than 238 bits. If the implementation reseeds, it should do so before it generates more values than the square root of the RNG's period without reseeding.
-  Speed: The implementation should select algorithms that are reasonably fast for most applications. The implementation may instead use an unpredictable-random implementation as long as the function remains at least as fast, in the average case, as the statistical-random implementation it would otherwise use.
-  Time Complexity: The implementation must run in amortized linear time on the size of the output array.
-  Thread Safety: The implementation should be safe for concurrent use by multiple threads.
-  Examples: The "`xorshift128+`" and `Lehmer128` random number generators.
-  Non-examples:  Mersenne Twister [systematically fails](http://xoroshiro.di.unimi.it/#quality) one of the `BigCrush` tests.  Any linear congruential generator with modulus 2<sup>63</sup> or less (such as `java.util.Random`) has a _seed length_ of less than 64 bits.

"bytes" is a pointer to a byte array, "size" is the number of random bytes to generate. Each bit in each byte will be randomly set to 0 or 1. Returns 0 if the function succeeds, and nonzero otherwise.

## Shuffling

A deterministic random number generator (DRNG) can't generate more permutations of random number sequences than its _period_. A DRNG can't generate all permutations of a list if the factorial of its size is greater than the DRNG's period. This means that the items in a shuffled list of that size will never appear in certain orders when that DRNG is used to shuffle it.

A DRNG with period 2<sup>64</sup>, for example, can't generate all permutations of a list with more than 20 items; with period 2<sup>128</sup>, more than 34 items; with period 2<sup>226</sup>, more than 52 items; and with period 2<sup>256</sup>, more than 57 items.

When shuffling more than 20 items, a concerned application would be well advised to use an unpredictable-random implementation.

Shuffling a list is usually done with the [Fisher-Yates shuffle method](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).

## Seedable Random Generators

In addition, some applications generate results based on apparently-random principles, starting from a known initial state. One notable example is a "code", or password, for generating a particular game level in some role-playing games.

Functions for seeding random number algorithms are not included, because applications that require seeding usually care about reproducible results. Such applications often need to keep not only the RNG algorithm stable, but also any algorithm that uses that RNG algorithm (such as a game level generator), especially if it publishes seeds (for example, game level passwords). Moreover, which RNG algorithm to use for such purpose depends on the application. (Such an algorithm will necessarily be a DRNG.) But here are some recommendations:

-  Any DRNG algorithm selected for producing reproducible results should meet at least the quality and predictability requirements of a statistical-random implementation, and should be reasonably fast.
-  The DRNG's _seed length_ should be 64 bits or greater.
-  Any seed passed to the DRNG should be at least the same size as the DRNG's seed length.

An application should only use seeding if--

1. the initial state (the seed) which the "random" result will be generated from--
    - is hard-coded,
    - was entered by the user, or
    - was generated using a statistical or unpredictable RNG (as defined above),
2. the application needs to generate the same "random" result multiple times,
3.  it would be impractical to store or distribute that "random" result without relying on seeding, such as--
    -   by saving the result to a file, or
    -   by distributing the results or the random numbers to networked users as they are generated, and
4. the RNG algorithm and any procedure using that algorithm to generate that "random" result will remain stable as long as the relevant feature is still in use by the application. (Not using seeding allows either to be changed or improved without affecting the application's functionality.)

On the other hand, an application need not use seeding if the randomness is only used for slight and inconspicuous visual variations, provided the visual variations have no impact on information security or on gameplay. For such purposes, the random-number generator need only be as strong as required to achieve the desired visual variations.

## RNG Building Blocks

Whether an unpredictable or statistical RNG or another kind of RNG is used, two methods
given below form the building blocks for writing code that makes practical use of randomness.
Both methods assume the RNG produces uniformly random numbers, like the RNGs
described in this article.

1. To generate a random integer 0 or greater, but less than N, use the RNG to generate as many
random bits as used to represent N-minus-1, then convert those bits to a nonnegative integer.
If that nonnegative integer is N or greater, repeat this process.
2. To generate a random 64-bit floating-point number 0 or greater, but less than 1, generate a random
integer 0 or greater, but less than 2<sup>53</sup>, then divide that integer by 2<sup>53</sup>.
(See "Generating uniform doubles in the unit interval" in the [`xoroshiro+` remarks page](http://xoroshiro.di.unimi.it/#remarks)
for further discussion.)

Other methods to generate random numbers or integers that fall within a given range or that
follow a given distribution, such as a normal, geometric, binomial, or discrete weighted
distribution, are beyond the scope of this article.  In general, such methods can be
written in terms of the two basic building blocks for generating uniform random numbers.
These building blocks, in turn, work essentially the same way regardless of the RNG used
(such as unpredictable, statistical, or seedable).

## Conclusion

In conclusion, most applications that require random numbers usually want either unpredictability (cryptographic security), or speed and high quality. I believe that RNGs that meet the descriptions specified above will meet the needs of these applications.

Feel free to send comments. They may help improve this page.

## License

This article, along with any associated source code and files, is licensed under [A Public Domain dedication](http://creativecommons.org/licenses/publicdomain/)
