# Random Number Generator Recommendations for Applications

[Peter Occil](mailto:poccil14@gmail.com)

Begun on Mar. 5, 2016; last updated on July 10, 2017.

Most apps that use random numbers care about either unpredictability or speed/high quality.

<a id=Introduction_and_Summary></a>
## Introduction and Summary

As I see it, there are two kinds of random number generators (RNGs) needed by most applications, namely&mdash;
- _statistical-random generators_, which seek to generate numbers that follow a uniform random distribution, and
- _unpredictable-random generators_, which seek to generate numbers that are cost-prohibitive to predict.

This page will discuss these two kinds of RNG, and make recommendations on their use and properties.

In addition, other applications require numbers that "seem" random but are based on an initial state, or "seed".  This page will discuss when applications should specify their own seeds.

Then, this page will explain what programming language APIs implement statistical-random and unpredictable-random generators and give advice on implementing them in programming languages.

Finally, this page will discuss issues on shuffling with an RNG.

<a id=Summary></a>
### Summary

The following table summarizes the kinds of RNGs covered in this document.

| Kind of RNG   | When to Use This RNG  | Examples |
 --------|--------|------|
| [Unpredictable-Random](#Unpredictable_Random_Generators)   | In computer/information security cases, or when speed is not a concern.  | `/dev/urandom`, `CryptGenRandom` |
| [Statistical-Random](#Statistical_Random_Generators)   | When computer/information security is not a concern, but speed is.  See also ["Shuffling"](#Shuffling).| `xoroshiro128+`, `xorshift128+` |
| [Seeded PRNG](#Seeded_Random_Generators)   | When generating reproducible results in a way not practical otherwise.   | Statistical-random quality PRNG with custom seed |

<a id=Contents></a>
## Contents

- [Introduction and Summary](#Introduction_and_Summary)
    - [Summary](#Summary)
- [Contents](#Contents)
- [Definitions](#Definitions)
- [Unpredictable-Random Generators](#Unpredictable_Random_Generators)
    - [Quality](#Quality)
    - [Seeding and Reseeding](#Seeding_and_Reseeding)
    - [Examples](#Examples)
- [Statistical-Random Generators](#Statistical_Random_Generators)
    - [Quality](#Quality_2)
    - [Seeding and Reseeding](#Seeding_and_Reseeding_2)
    - [Examples and Non-Examples](#Examples_and_Non_Examples)
- [Seeded Random Generators](#Seeded_Random_Generators)
    - [Seeding Recommendations](#Seeding_Recommendations)
    - [Seedable PRNG Recommendations](#Seedable_PRNG_Recommendations)
    - [Examples](#Examples_2)
        - [Games](#Games)
        - [Unit Testing](#Unit_Testing)
        - [Verifiable Random Numbers](#Verifiable_Random_Numbers)
        - [Noise](#Noise)
- [Programming Language APIs](#Programming_Language_APIs)
- [Advice for New Programming Language APIs](#Advice_for_New_Programming_Language_APIs)
- [Shuffling](#Shuffling)
    - [Shuffling Method](#Shuffling_Method)
    - [Choosing from Among All Permutations](#Choosing_from_Among_All_Permutations)
- [Motivation](#Motivation)
- [Conclusion](#Conclusion)
    - [Request for Comments](#Request_for_Comments)
- [Notes](#Notes)
- [License](#License)

<a id=Definitions></a>
## Definitions

The following definitions are helpful in better understanding this document.

- **Pseudorandom number generator (PRNG).** A number generator that outputs seemingly random numbers using a deterministic algorithm, that is, an algorithm that returns the same output for the same state every time. (In this document, RNGs include PRNGs.)
- **Seed.**  Arbitrary data for initializing the state of a PRNG.
- **State length.**  The maximum size of the seed a PRNG can take to initialize its state without truncating or compressing that seed.
- **Period.** The maximum number of values in a generated sequence for a PRNG before that sequence repeats before the sequence repeats.  The period will not be greater than 2<sup>`L`</sup> where `L` is the PRNG's _state length_.

<a id=Unpredictable_Random_Generators></a>
## Unpredictable-Random Generators

Unpredictable-random implementations (also known as "cryptographically strong" or "cryptographically secure" RNGs) seek to generate random numbers that are cost-prohibitive to predict.  Such implementations are indispensable in computer security and information security contexts, such as&mdash;

-  generating keying material, such as encryption keys,
-  generating random passwords or session identifiers,
-  generating "salts" to vary cryptographic hashes of the same password,
-  use in communications between two networked computers,
-  use in transfer, transport, messaging, and other communication protocols, and
-  cases (such as in multiplayer networked games) when predicting future random numbers would give a player or user a significant and unfair advantage.

They are also useful in cases where the application generates random numbers so infrequently that the RNG's speed is not a concern.

An unpredictable-random implementation ultimately relies on one or more _nondeterministic sources_ (sources that don't always return the same output for the same input) for random number generation.  Sources that are reasonably fast for most applications (for instance, by producing very many random bits per second), especially sources implemented in hardware, are highly advantageous here, since an implementation for which such sources are available can rely less on PRNGs, which are deterministic and benefit from reseeding as explained later.

<a id=Quality></a>
### Quality

An unpredictable-random implementation generates uniformly random bits such that an outside party can guess neither prior nor future unseen bits of the random sequence correctly with more than a 50% chance per bit, even with knowledge of the randomness-generating procedure, the implementation's internal state at the given point in time, and/or extremely many outputs of the RNG. (If the sequence was generated directly by a PRNG, ensuring future bits are unguessable this way should be done wherever the implementation finds it feasible; see "Seeding and Reseeding".)

<a id=Seeding_and_Reseeding></a>
### Seeding and Reseeding

If an unpredictable-random implementation uses a PRNG, the following requirements apply.

The PRNG's _state length_ must be at least 128 bits and should be at least 256 bits.

Before an instance of the RNG generates a random number, it must have been initialized ("seeded") with an _unpredictable seed_, defined as follows. The seed&mdash;
- must consist of data which meets the quality requirement described earlier, which does not contain, in whole or in part, the PRNG's own output, and which ultimately derives from one or more nondeterministic sources (such data may be mixed with other arbitrary data as long as the result is no less cost-prohibitive to predict), and
- must be at least the same size as the PRNG's _state length_.

The RNG should be reseeded from time to time (using a newly generated _unpredictable seed_) to help ensure the unguessability of the output. If the implementation reseeds, it must do so before it generates more than 2<sup>67</sup> bits without reseeding and should do so before it generates more than 2<sup>32</sup> bits without reseeding.

<a id=Examples></a>
### Examples

Examples of unpredictable-random implementations include the following:
- The `/dev/random` device on many Unix-based operating systems, which generally uses only nondeterministic sources; however, in some implementations of the device it can block for seconds at a time, especially if not enough randomness ("entropy") is available.
- The `/dev/urandom` device on many Unix-based operating systems, which often relies on both a PRNG and the same nondeterministic sources used by `/dev/random`.
- The `CryptGenRandom` method on Windows.
- Cryptographic hash functions that take very hard-to-predict signals as input (such as disk access timings, keystroke timings, thermal noise, and/or A. Seznec's technique called hardware volatile entropy gathering and expansion).

<a id=Statistical_Random_Generators></a>
## Statistical-Random Generators

Statistical-random generators are used, for example, in simulations, numerical integration, and many games to bring an element of chance and variation to the application, with the goal that each possible outcome is equally likely. However, statistical-random generators are generally suitable only if&mdash;

-  computer security and information security are not involved, and
-  the application generates random numbers so frequently that it would slow down undesirably if an unpredictable-random implementation were used instead.

If more than 20 items are being shuffled, a concerned application would be well advised to use alternatives to this kind of implementation (see ["Shuffling"](#Shuffling)).

A statistical-random implementation is usually implemented with a PRNG, but can also be implemented in a similar way as an unpredictable-random implementation provided it remains reasonably fast.

<a id=Quality_2></a>
### Quality

A statistical-random implementation generates random bits, each of which is uniformly randomly distributed independently of the other bits, at least for nearly all practical purposes. The implementation must be highly likely to pass all the tests used in `TestU01`'s `Crush`, `SmallCrush`, and `BigCrush` test batteries [L'Ecuyer and Simard 2007], and should be highly likely to pass other known statistical randomness tests. The RNG need not be equidistributed. (Mentioning specific test batteries here is in the interest of precision and makes it clearer whether a particular RNG meets these quality requirements.)

<a id=Seeding_and_Reseeding_2></a>
### Seeding and Reseeding

If statistical-random implementation uses a PRNG, the following requirements apply.

The PRNG's _state length_ must be at least 64 bits, should be at least 128 bits, and is encouraged to be as high as the implementation can go to remain reasonably fast for most applications.

Before an instance of the RNG generates a random number, it must have been initialized ("seeded") with a seed described as follows. The seed&mdash;
- must consist of data not known _a priori_ by the implementation, such as random bits from an unpredictable-random implementation,
- must not be a fixed value or a user-entered value,
- should not be trivially predictable in any of its bits, as far as practical,
- is encouraged not to consist of a timestamp (especially not a timestamp with millisecond or coarser granularity)<sup>(1)</sup>, and
- must be at least the same size as the PRNG's _state length_.

The implementation is encouraged to reseed itself from time to time (using a newly generated seed as described earlier), especially if the PRNG has a _state length_ less than 238 bits. If the implementation reseeds, it should do so before it generates more values than the square root of the PRNG's period without reseeding.

<a id=Examples_and_Non_Examples></a>
### Examples and Non-Examples

Examples of statistically-random generators include the following:
- `xoroshiro128+` (state length 128 bits; nonzero seed &mdash; but see warning in the [source code](http://xoroshiro.di.unimi.it/xoroshiro128plus.c) about the lowest bit of the PRNG's outputs).
- `xorshift128+` (state length 128 bits; nonzero seed).
- `Lehmer128` (state length 128 bits).
- `JKISS` on top of page 3 of Jones 2010 (state length 128 bits; seed with four 32-bit nonzero pieces).
- C++'s [`ranlux48` engine](http://www.cplusplus.com/reference/random/ranlux48/) (state length 577 bits; nonzero seed).

Non-examples include the following:
- Mersenne Twister shows a [systematic failure](http://xoroshiro.di.unimi.it/#quality) in one of the `BigCrush` tests. (See also S. Vigna, "[An experimental exploration of Marsaglia's `xorshift` generators, scrambled](http://vigna.di.unimi.it/ftp/papers/xorshift.pdf)", as published in the `xoroshiro128+` website.)
- Any [linear congruential generator](https://en.wikipedia.org/wiki/Linear_congruential_generator) with modulus 2<sup>63</sup> or less (such as `java.util.Random` and C++'s `minstd_rand` and `minstd_rand0` engines) has a _state length_ of less than 64 bits.

<a id=Seeded_Random_Generators></a>
## Seeded Random Generators

In addition, some applications use pseudorandom number generators (PRNGs) to generate results based on apparently-random principles, starting from a known initial state, or "seed". Such applications usually care about reproducible results. (Note that in the definitions for [unpredictable-random](#Unpredictable_Random_Generators) and [statistical-random](#Statistical_Random_Generators) generators given earlier, the PRNGs involved are automatically seeded before use.)

<a id=Seeding_Recommendations></a>
### Seeding Recommendations

An application should use a PRNG with a seed it specifies (rather than an automatically-initialized PRNG or another kind of RNG) only if&mdash;

1. the initial state (the seed) which the "random" result will be generated from&mdash;
    - is hard-coded,
    - was entered by the user,
    - is known to the application and was generated using a statistical or unpredictable-random implementation (as defined earlier), or
    - is based on a timestamp (but only if the reproducible result is not intended to vary during the time specified on the timestamp and within the timestamp's granularity; for example, a year/month/day timestamp for a result that varies only daily),
2. the application might need to generate the same "random" result multiple times,
3. the application either&mdash;
    - makes the seed (or a "code" or "password" based on the seed) accessible to the user, or
    - finds it impractical to store or distribute the "random" results or the random numbers (rather than the seed) for later use, such as&mdash;
        - by saving the result to a file,
        - by storing the random numbers for the feature generating the result to "replay" later, or
        - by distributing the results or the random numbers to networked users as they are generated,
4. the random number generation method will remain _stable_ for as long as the relevant feature is still in use by the application, and
5. any feature using that random number generation method to generate that "random" result will remain backward compatible with respect to the "random" results it generates, for as long as that feature is still in use by the application.

As used here, a random number generation method is _stable_ if it uses a PRNG, outputs the same random sequence given the same seed, and has no random-number generation behavior that is unspecified, that is implementation-dependent, or that may change in the future.  For example&mdash;
- [`java.util.Random`](https://docs.oracle.com/javase/8/docs/api/java/util/Random.html) is stable,
- the C [`rand` method](http://en.cppreference.com/w/cpp/numeric/random/rand) is not stable (because the algorithm it uses is unspecified), and
- .NET's [`System.Random`](https://msdn.microsoft.com/en-us/library/h343ddh9.aspx) is not stable (because itis generation behavior may change in the future).

<a id=Seedable_PRNG_Recommendations></a>
### Seedable PRNG Recommendations

Which PRNG to use for generating reproducible results depends on the application. But here are some recommendations:

-  Any PRNG algorithm selected for producing reproducible results should meet or exceed the quality requirements of a statistical-random implementation, and should be reasonably fast.
-  The PRNG's _state length_ should be 64 bits or greater.
-  Any seed passed to the PRNG should be at least the same size as the PRNG's _state length_.

<a id=Examples_2></a>
### Examples

Custom seeds can come into play in the following situations, among others.

<a id=Games></a>
#### Games

Many kinds of games generate game content using apparently-random principles, such as&mdash;

- procedurally generated maps for a role-playing game,
- [shuffling](#Shuffling) a digital deck of cards for a solitaire game, or
- a game board or puzzle board that normally varies every session,

where the game might need to generate the same content of that kind multiple times.

In general, such a game should use a PRNG with a custom seed for such purposes only if&mdash;

1. generating the random content uses relatively many random numbers (say, more than a few thousand), and the application finds it impractical to store or distribute the content or the numbers for later use (see recommendations 2 and 3), or
2. the game makes the seed (or a "code" or "password" based on the seed, such as a barcode or a string of letters and digits) accessible to the player, to allow the player to generate the level or state repeatedly (see recommendations 2 and 3).

Option 1 often applies to games that generate procedural terrain for game levels, since the terrain often exhibits random variations over an extended space.  Option 1 is less suitable for puzzle game boards or card shuffling, since much less data needs to be stored.

<a id=Unit_Testing></a>
#### Unit Testing

A custom seed is appropriate when unit testing a method that uses a seeded PRNG in place of another kind of RNG for the purpose of the test (provided the method meets recommendation 5).

<a id=Verifiable_Random_Numbers></a>
#### Verifiable Random Numbers

_Verifiable random numbers_ are random numbers (such as seeds for PRNGs) that are disclosed along with all the information required to verify their generation.  Usually, of the information used to derive such numbers, at least some of it is not known by anyone until some time after the announcement is made that those numbers will be generated, but all of it will eventually be publicly available.  In some cases, some of the information required to verify the numbers' generation is disclosed in the announcement that those numbers will be generated.

One process to generate verifiable random numbers is described in [RFC 3797](https://www.rfc-editor.org/rfc/rfc3797.txt) (to the extent its advice is not specific to the Internet Engineering Task Force or its Nominations Committee).  Although the source code given in that RFC uses the MD5 algorithm, the process does not preclude the use of hash algorithms stronger than MD5 (see the last paragraph of section 3.3 of that RFC).

<a id=Noise></a>
#### Noise

Randomly generated numbers can serve as _noise_, that is, a randomized variation in images and sound.  There are two kinds of noise generation methods:

1. [Colored noise](https://en.wikipedia.org/wiki/Colors_of_noise), such as white noise and pink noise. Here, the same RNG recommendations apply to these functions as they do to most other cases.<sup>(2)</sup>
2. _Noise functions_, including [Perlin noise](https://en.wikipedia.org/wiki/Perlin_noise) and [fractional Brownian motion](https://en.wikipedia.org/wiki/Fractional_Brownian_motion), output one or more random numbers given an _n_-dimensional point as input. Although noise functions don't take seeds themselves, the core of a noise function can be an RNG that converts an _n_-dimensional point to a seed for a PRNG, then uses the PRNG to generate a random number.  The noise function's PRNG should follow the [seedable PRNG recommendations](#Seedable_PRNG_Recommendations) if the [seeding recommendations](#Seeding_Recommendations) apply to the noise generation or if the PRNG is not used solely to generate noise; otherwise, that PRNG need only be as strong as required to achieve the desired effect.  However, noise functions (rather than other RNGs) ought to be used only if it's not feasible to achieve the randomized variation without them.

<a id=Programming_Language_APIs></a>
## Programming Language APIs

The following table lists techniques, methods, and functions that implement
unpredictable-random and statistical-random RNGs for popular programming languages. Note the following:

- For both kinds of generators it's encouraged to create a single instance of the RNG on application startup and use that instance throughout the application (if the application is multithreaded, the instance ought to be thread-safe).
- Methods and libraries mentioned in the "Statistical-random" column need to be initialized with a full-length seed before use (for example, a seed generated using an implementation in the "Unpredictable-random" column).
- The mention of a third-party library in this section does not imply sponsorship or endorsement
of that library, or imply a preference of that library over others. The list is not comprehensive.

| Language   | Unpredictable-random   | Statistical-random | Other |
 --------|-----------------------------------------------|------|------|
| C/C++  | (C) | [`xoroshiro128plus.c`](http://xoroshiro.di.unimi.it/xoroshiro128plus.c) (128-bit nonzero seed); [`xorshift128plus.c`](http://xoroshiro.di.unimi.it/xorshift128plus.c) (128-bit nonzero seed) |
| Python | `secrets.SystemRandom` (since Python 3.6); `os.urandom()`| [ihaque/xorshift](https://github.com/ihaque/xorshift) library (128-bit nonzero seed; default seed uses `os.urandom()`) | `random.getrandbits()` (A); `random.seed()` (19,936-bit seed) (A) |
| Java (D) | (C); `java.security.SecureRandom` (F) |  [grunka/xorshift](https://github.com/grunka/xorshift) (`XORShift1024Star` or `XORShift128Plus`) | |
| JavaScript | `crypto.randomBytes(byteCount)` (node.js only) | [`xorshift`](https://github.com/AndreasMadsen/xorshift) library | `Math.random()` (floating-point) (B) |
| Ruby | (C); `SecureRandom` class (`require 'securerandom'`) |  | `Random#rand()` (floating-point) (A) (E); `Random#rand(N)` (integer) (A) (E); `Random.new(seed)` (default seed uses entropy) |

(A) Default general RNG implements the [Mersenne Twister](https://en.wikipedia.org/wiki/Mersenne_Twister), which doesn't
meet the statistical-random requirements, strictly speaking, but may be adequate for many applications due to its extremely long period.

(B) JavaScript's `Math.random` is implemented using `xorshift128+` in the latest V8 engine, Firefox, and certain other modern browsers at the time of writing; the exact algorithm to be used by JavaScript's `Math.random` is "implementation-dependent", though, according to the ECMAScript specification.

(C) Read from the `/dev/urandom` and/or `/dev/random` devices in Unix-based systems (both devices can generally be read from in the same way as disk files), or call the `CryptGenRandom` API in Windows-based systems (see ["Advice for New Programming Language APIs"](#Advice_for_New_Programming_Language_APIs)).

(D) Java's `java.util.Random` class uses a 48-bit seed, so doesn't meet the statistical-random requirements.  However, a subclass of `java.util.Random` might be implemented to meet those requirements.

(E) In my opinion, Ruby's `Random#rand` method presents a beautiful and simple API for random number generation.

(F) At least in Unix-based systems, calling the `SecureRandom` constructor that takes a byte array is recommended. The byte array should be data described in note (C).

<a id=Advice_for_New_Programming_Language_APIs></a>
## Advice for New Programming Language APIs

Wherever possible, existing libraries or techniques that already meet the requirements for unpredictable-random and statistical-random RNGs should be used.  For example:
- An unpredictable-random implementation can read from the `/dev/urandom` and/or `/dev/random` devices in Unix-based systems, or call the `CryptGenRandom` API in Windows-based systems, and only use other techniques if the existing solutions are inadequate in certain respects or in certain circumstances.
- A statistical-random implementation can use a PRNG algorithm mentioned as an example in the [statistical-random generator](#Statistical_Random_Generators) section.

If existing solutions are inadequate, a programming language API could implement unpredictable-random and statistical-random RNGs by filling an output byte buffer with random bytes, where each bit in each byte will be randomly set to 0 or 1.  For instance, a C language API for unpredictable-random generators could look like the following: `int random(uint8_t[] bytes, size_t size);`, where "bytes" is a pointer to a byte array, and "size" is the number of random bytes to generate, and where 0 is returned if the method succeeds and nonzero otherwise. Any programming language API that implements such RNGs by filling a byte buffer must run in amortized linear time on the number of random bytes the API will generate.

Unpredictable-random and statistical-random implementations&mdash;
- should be reasonably fast for most applications, and
- should be safe for concurrent use by multiple threads, whenever convenient.

In my opinion, a new programming language's standard library should include&mdash;
- a method that returns a random integer 0 or greater and less than a positive integer, and
- a method that returns a floating-point number 0 or greater and less than 1,

and should include those two methods separately for unpredictable-random generators and for statistical RNGs. However, a detailed discussion of how to implement those two methods or other methods to generate random numbers or integers that follow a given distribution (such as a normal, geometric, binomial, or discrete weighted
distribution) or fall within a given range is outside the scope of this page;  I have written about this in [another document](https://peteroupc.github.io/randomfunc.html).

<a id=Shuffling></a>
## Shuffling

There are special considerations in play when applications use RNGs to shuffle a list of items.

<a id=Shuffling_Method></a>
### Shuffling Method

The [Fisher&ndash;Yates shuffle method](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle) shuffles a list such that all permutations of that list are equally likely to occur, assuming the RNG it uses produces uniformly random numbers and can choose from among all permutations of that list.  However, that method is also easy to mess up (see also Jeff Atwood, "[The danger of na&iuml;vet&eacute;](https://blog.codinghorror.com/the-danger-of-naivete/)"); I give a correct implementation in [another document](https://peteroupc.github.io/randomfunc.html).

<a id=Choosing_from_Among_All_Permutations></a>
### Choosing from Among All Permutations

If a pseudorandom number generator's period is less than the number of distinct permutations (arrangements) of a list, then there are some permutations that PRNG can't choose when it shuffles that list. (This is not the same as _generating_ all permutations of a list, which, for a sufficiently large list size, can't be done by any computer in a reasonable time.)

The number of distinct permutations is the [multinomial coefficient](http://mathworld.wolfram.com/MultinomialCoefficient.html) _m_! / (_w_<sub>1</sub>! &times; _w_<sub>2</sub>! &times; ... &times; _w_<sub>_n_</sub>!), where _m_ is the list's size, _n_ is the number of different items in the list, _x_! means "_x_ [factorial](https://en.wikipedia.org/wiki/Factorial)", and _w_<sub>_i_</sub> is the number of times the item identified by _i_ appears in the list. Special cases of this are&mdash;
- _n_!, if the list consists of _n_ different items, and
- (_nm_)! / _m_!<sup>_n_</sup>, if the list is formed from _m_ identical lists each with _n_ different items.

In general, a PRNG with state length _k_ bits, as shown in the table below, can't choose from among all the distinct permutations of a list with more items than the given maximum list size (_k_ is the base-2 logarithm of _n_!, rounded up to an integer). (Note that a PRNG with state length _k_ bits can't have a period greater than 2<sup>_k_</sup>, so can't choose from among more than 2<sup>_k_</sup> permutations.)

| State length (_k_)  |  Maximum list size (_n_) |
| -----------------|----------------------- |
| 64 | 20 |
| 128 | 34 |
| 226 | 52 |
| 256 | 72 |

A PRNG with state length less than the number of bits given below (_k_) can't choose from among all the distinct permutations of a list formed from _m_ identical lists each with _n_ different items, as shown in this table  (_k_ is the base-2 logarithm of ((_nm_)! / _m_!<sup>_n_</sup>), rounded up to an integer).

| Number of lists (_m_) | Items per list (_n_) | Minimum state length (_k_) |
| -----------------|----------|------------- |
| 1 | 20 | 62 |
| 2 | 20 | 140 |
| 4 | 20 | 304 |
| 1 | 52 | 226 |
| 2 | 52 | 500 |
| 4 | 52 | 1069 |
| 1 | 60 | 273 |
| 2 | 60 | 601 |
| 4 | 60 | 1282 |

An application concerned about being able to choose from among all the distinct permutations of a shuffled list (and not just from among some of them) would be well advised&mdash;
- to use an unpredictable-random implementation, or
- if speed is a concern and computer and information security is not, to use a PRNG&mdash;
    - that meets or exceeds the quality requirements of a statistical-random implementation,
    - that has a period at least as high as the number of permutations of the list to be shuffled, and
    - that was initialized automatically with an _unpredictable seed_ before use.

(See "Lack of randomness" in the [BigDeal document by van Staveren](https://sater.home.xs4all.nl/doc.html) for further discussion.)

<a id=Motivation></a>
## Motivation

In this document, I made the distinction between _statistical-random_ and _unpredictable-random_ generators because that is how programming languages often present random number generators &mdash; they usually offer a general-purpose RNG (such as C's `rand` or Java's `java.util.Random`) and sometimes an RNG intended for security purposes (such as `java.security.SecureRandom`).

What has motivated me to write a more rigorous definition of random number generators is the fact that many applications still use weak RNGs.  In my opinion, this is largely because most popular programming languages today&mdash;
- specify few and weak requirements on RNGs (such as C's `rand`),
- specify a relatively weak general-purpose RNG (such as Java's `java.math.Random`, although it also includes a much stronger `SecureRandom` class),
- implement RNGs by default that leave a bit to be desired (particularly the Mersenne Twister algorithm found in PHP's `mt_rand` as well as in Python and Ruby),
- seed RNGs with a timestamp by default (such as the [.NET Framework implementation of `System.Random`](https://msdn.microsoft.com/en-us/library/h343ddh9.aspx)), and/or
- leave the default seeding fixed (such as [C's `rand`](http://en.cppreference.com/w/cpp/numeric/random/rand)).

<a id=Conclusion></a>
## Conclusion

In conclusion, most applications that require random numbers usually want either unpredictability (cryptographic security), or speed and high quality. I believe that RNGs that meet the descriptions specified in the [Unpredictable-Random Generators](#Unpredictable_Random_Generators) and [Statistical-Random Generators](#Statistical_Random_Generators) sections will meet the needs of those applications.

In addition, this document recommends using unpredictable-random implementations in many cases, especially in computer and information security contexts, and recommends easier programming interfaces for both unpredictable-random and statistical-random implementations in new programming languages.

I acknowledge&mdash;
- the commenters to the CodeProject version of this page, including Cryptonite, and
- Lee Daniel Crocker, who reviewed this document and gave comments.

<a id=Request_for_Comments></a>
### Request for Comments

Feel free to send comments. They may help improve this page.

Comments on any aspect of the document are welcome, but answers to the following would be particularly appreciated.

-  Have I characterized the randomness needs of applications properly?
-  Did I cover the vast majority of applications that require randomness?
-  Are there existing programming language APIs or software libraries, not mentioned in this document, that already meet the requirements for unpredictable-random or statistical-random RNGs?
-  Are there certain kinds of applications that require a different kind of RNG (unpredictable-random, statistical-random, seeded, etc.) than I recommended?
- In a typical computer a consumer would have today:
    - How many random numbers per second would an unpredictable-random implementation generate? A statistical-random implementation?
    - How many random numbers per second does a typical application using RNGs generate? Are there applications that usually generate considerably more random numbers than that per second?

<a id=Notes></a>
## Notes

<sup>(1)</sup> This statement appears because multiple instances of a PRNG automatically seeded with a timestamp, when they are created at about the same time, run the risk of starting with the same seed and therefore generating the same sequence of random numbers.

<sup>(2)</sup> This is because usual implementations of colored noise don't sample each point of the sample space more than once; rather, all the samples are generated, then, for some kinds of colored noise, a filter is applied to the samples.

<a id=License></a>
## License

This page is licensed under [A Public Domain dedication](http://creativecommons.org/licenses/publicdomain/).
