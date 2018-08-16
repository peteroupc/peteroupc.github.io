# Random Number Generator Recommendations for Applications

[**Peter Occil**](mailto:poccil14@gmail.com)

Begun on Mar. 5, 2016; last updated on Aug. 16, 2018.

Most apps that use random numbers care about either unpredictability or speed/high quality.

<a id=Request_for_Comments></a>
## Request for Comments

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/random.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/random.md)**.  You can send comments on this document either on** [**CodeProject**](https://www.codeproject.com/Articles/1083372/Random-Number-Generator-Recommendations-for-Applic) **or on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues)**.**

**Comments on any aspect of this document are welcome, but especially answers to the following questions:**

- **Have I characterized the randomness needs of applications properly?**
- **Did I cover the vast majority of applications that require randomness?**
- **Are there existing programming language APIs or software libraries, not mentioned in this document, that already meet the requirements for cryptographic or statistical RNGs?**
- **Are there certain kinds of applications that require a different kind of RNG (cryptographic, statistical, seeded, etc.) than I recommended?**
- **In a typical computer a consumer would have today, how many random numbers per second does a typical application using RNGs generate? Are there applications that usually generate considerably more random numbers than that per second?**

<a id=Introduction_and_Summary></a>
## Introduction and Summary

Many applications rely on random number generators (RNGs); these RNGs include&mdash;

- _statistical RNGs_, which seek to generate numbers that follow a uniform random distribution,
- _cryptographic RNGs_, which seek to generate numbers that are cost-prohibitive to predict, and
- _seeded PRNGs_ (pseudorandom number generators), which generate numbers that "seem" random given an initial "seed".

**This document covers:**

- Statistical and cryptographic RNGs, as well as recommendations on their use and properties.
- A discussion on when an application that needs numbers that "seem" random should specify their own "seed" (the initial state that the numbers are based on).
- An explanation of how to implement RNGs in programming code, including APIs that help in doing so.
- Issues on shuffling with an RNG.

**This document does not cover:**

- Testing an RNG implementation for correctness or adequate random number generation.
- Generation of random numbers or keying material based at least in part on a password (e.g. _key derivation functions_, _password authenticated key exchange_).
- Applications for which the selection of RNGs is constrained by statutory or regulatory requirements.

**The following table summarizes the kinds of RNGs covered in this document:**

| Kind of RNG   | When to Use This RNG  | Examples |
 --------|--------|------|
| [**Cryptographic RNG**](#Cryptographic_RNGs)   | In information security cases, or when speed is not a concern.  | `/dev/urandom`, `BCryptGenRandom` |
| [**Statistical RNG**](#Statistical_RNGs)   | When information security is not a concern, but speed is.  See also [**"Shuffling"**](#Shuffling).| `xoroshiro128+`, `xorshift128+` |
| [**Seeded PRNG**](#Seeded_PRNGs)   | When generating reproducible results in a way not practical otherwise.   | High-quality PRNG with custom seed |

<a id=Contents></a>
## Contents

- [**Request for Comments**](#Request_for_Comments)
- [**Introduction and Summary**](#Introduction_and_Summary)
- [**Contents**](#Contents)
- [**Definitions**](#Definitions)
- [**Cryptographic RNGs**](#Cryptographic_RNGs)
    - [**Quality**](#Quality)
    - [**Seeding and Reseeding**](#Seeding_and_Reseeding)
    - [**Nondeterministic Sources**](#Nondeterministic_Sources)
    - [**Examples**](#Examples)
- [**Statistical RNGs**](#Statistical_RNGs)
    - [**Quality**](#Quality_2)
    - [**Seeding and Reseeding**](#Seeding_and_Reseeding_2)
    - [**Examples and Non-Examples**](#Examples_and_Non_Examples)
- [**Seeded PRNGs**](#Seeded_PRNGs)
    - [**Seeding Recommendations**](#Seeding_Recommendations)
    - [**Recommendations for Seeded PRNGs**](#Recommendations_for_Seeded_PRNGs)
    - [**Examples**](#Examples_2)
        - [**Games**](#Games)
        - [**Unit Testing**](#Unit_Testing)
        - [**Verifiable Random Numbers**](#Verifiable_Random_Numbers)
        - [**Noise**](#Noise)
- [**Implementing RNGs in Programming Languages**](#Implementing_RNGs_in_Programming_Languages)
- [**RNG Topics**](#RNG_Topics)
    - [**How to Initialize RNGs**](#How_to_Initialize_RNGs)
    - [**Shuffling**](#Shuffling)
        - [**Shuffling Method**](#Shuffling_Method)
        - [**Choosing from Among All Permutations**](#Choosing_from_Among_All_Permutations)
    - [**GPU Programming Environments**](#GPU_Programming_Environments)
- [**Hash Functions**](#Hash_Functions)
- [**Motivation**](#Motivation)
- [**Conclusion**](#Conclusion)
- [**Notes**](#Notes)
- [**License**](#License)

<a id=Definitions></a>
## Definitions

The following definitions are helpful in better understanding this document.

- **Random number generator (RNG).** Software and/or hardware that seeks to generate independent numbers that seem to occur by chance and that are approximately uniformly distributed<sup>[**(1)**](#Note1)</sup>.
- **Pseudorandom number generator (PRNG).** A random number generator that outputs seemingly random numbers using a deterministic algorithm (that is, an algorithm that returns the same output for the same input and state every time), and in which its state can be initialized and possibly reinitialized with arbitrary data.
- **Seed.**  Arbitrary data for initializing the state of a PRNG.
- **State length.**  The maximum size of the seed a PRNG can take to initialize its state without shortening or compressing that seed.
- **Period.** The maximum number of values in a generated sequence for a PRNG before that sequence repeats.  The period will not be greater than 2<sup>_L_</sup> where _L_ is the PRNG's _state length_.
- **Stable.** A programming interface is _stable_ if it has no behavior that is unspecified, implementation-dependent, nondeterministic, or subject to future change.
- **Information security.** Defined in ISO/IEC 27000.
- **Nondeterministic source.** Data source that does not always return the same output for the same input.

<a id=Cryptographic_RNGs></a>
## Cryptographic RNGs

Cryptographic RNGs (also known as "cryptographically strong" or "cryptographically secure" RNGs) seek to generate random numbers that are cost-prohibitive to predict.  Such RNGs are indispensable in information security contexts, such as&mdash;

-  generating keying material, such as encryption keys,
-  generating random passwords, nonces, or session identifiers,
-  generating "salts" to vary hash codes of the same password,
-  use in communications between two networked computers (including in data transfer, data transport, and messaging), and
-  cases (such as in multiplayer networked games) when predicting future random numbers would give a player or user a significant and unfair advantage.

They are also useful when the application generates random numbers so infrequently that the RNG's speed is not a concern.

<a id=Quality></a>
### Quality

A cryptographic RNG implementation generates uniformly distributed random bits such that it would be at least cost-prohibitive for an outside party to guess either prior or future unseen bits of the random sequence correctly with more than a 50% chance per bit, even with knowledge of the randomness-generating procedure, the implementation's internal state at the given point in time, and/or extremely many outputs of the RNG. (If the sequence was generated directly by a PRNG, ensuring future bits are unguessable this way should be done wherever the implementation finds it feasible; for example, see "Seeding and Reseeding".)

<a id=Seeding_and_Reseeding></a>
### Seeding and Reseeding

If a cryptographic RNG implementation uses a PRNG, the following requirements apply.

The PRNG's _state length_ must be at least 128 bits and should be at least 256 bits.  The _security strength_ used by the RNG must be at least 112 bits, should be at least 128 bits, and may equal the PRNG's _state length_.

Before an instance of the RNG generates a random number, it must have been initialized ("seeded") with a seed defined as follows. The seed&mdash;
- must have as many bits as the PRNG's _state length_,
- must consist of data that ultimately derives from the output of one or more nondeterministic sources, where the output is at least as hard to predict as ideal random data with as many bits as the _security strength_, and
- may be mixed with arbitrary data other than the seed as long as the result is no easier to predict<sup>[**(2)**](#Note2)</sup>.

The RNG should be reseeded, using a newly generated seed as described earlier, to help ensure the unguessability of its output. If the implementation reseeds, it should do so as often as feasible (whenever doing so would not slow down applications undesirably).  If the RNG reseeds if it would generate more than a threshold number of bits without reseeding, that threshold should be 2<sup>67</sup> or less.

<a id=Nondeterministic_Sources></a>
### Nondeterministic Sources

A cryptographic RNG ultimately relies on one or more _nondeterministic sources_ for random number generation.<sup>[**(3)**](#Note3)</sup>  Examples of nondeterministic sources are&mdash;

- disk access timings,
- timings of keystrokes and other input device interactions,
- thermal noise, and
- the output generated with A. Seznec's technique called hardware volatile entropy gathering and expansion (HAVEGE), provided a high-resolution counter is available.

A value called _entropy_ measures how hard it is to predict a nondeterministic source's output, compared to ideal random data; this is generally the size in bits of the ideal random data.  (For example, a 64-bit output with 32 bits of entropy is as hard to predict as an ideal random 32-bit data block.)  NIST SP 800-90B recommends _min-entropy_ as the entropy measure and also details how nondeterministic sources can be used for information security.

If a cryptographic RNG implementation uses a PRNG, the output of the strongest nondeterministic source used to derive a seed ought to have as many bits of entropy as the _security strength_.  If the implementation does not use a PRNG, the output of the strongest nondeterministic source used to derive an RNG output ought to have as many bits of entropy as the RNG output's size in bits.

<a id=Examples></a>
### Examples

Examples of cryptographic RNG implementations include the following:
- The `/dev/random` device on many Unix-based operating systems, which generally uses only nondeterministic sources; however, in some implementations of the device it can block for seconds at a time, especially if not enough randomness is available.
- The `/dev/urandom` device on many Unix-based operating systems, which often relies on both a PRNG and the same nondeterministic sources used by `/dev/random`.
- The `BCryptGenRandom` method in recent versions of Windows. (An independent analysis, published in 2007, showed flaws in an earlier version of `CryptGenRandom`.)
- Two-source extractors, multi-source extractors, or cryptographic [**hash functions**](#Hash_Functions) that take very hard-to-predict signals from two or more nondeterministic sources as input.
- An RNG implementation complying with NIST SP 800-90A.  The SP 800-90 series goes into further detail on how RNGs appropriate for information security can be constructed, and inspired much of the "Cryptographic RNGs" section.

<a id=Statistical_RNGs></a>
## Statistical RNGs

Statistical RNGs are used, for example, in simulations, numerical integration, and many games to bring an element of chance and variation to the application, with the goal that each possible outcome is equally likely. However, statistical RNGs are generally suitable only if&mdash;

-  information security is not involved, and
-  the application generates random numbers so frequently that it would slow down undesirably if a cryptographic RNG were used instead.

If more than 20 items are being shuffled, a concerned application would be well advised to use alternatives to this kind of implementation (see [**"Shuffling"**](#Shuffling)).

A statistical RNG is usually implemented with a PRNG, but can also be implemented in a similar way as a cryptographic RNG provided it remains reasonably fast.

<a id=Quality_2></a>
### Quality

A statistical RNG generates random bits, each of which is uniformly distributed independently of the other bits, at least for nearly all practical purposes.  If the implementation uses a PRNG, that PRNG algorithm must either satisfy the _one-way property_ or be significantly more likely than not to pass all tests (other than MatrixRank and LinearComp) of `BigCrush`, part of L'Ecuyer and Simard's "TestU01". The RNG need not be perfectly equidistributed.

<a id=Seeding_and_Reseeding_2></a>
### Seeding and Reseeding

If a statistical RNG implementation uses a PRNG, the following requirements apply.

The PRNG's _state length_ must be at least 64 bits, should be at least 128 bits, and is encouraged to be as high as the implementation can go to remain reasonably fast for most applications.

Before an instance of the RNG generates a random number, it must have been initialized ("seeded") with a seed described as follows. The seed&mdash;
- must have as many bits as the PRNG's _state length_,
- must consist of data that ultimately derives from the output of one or more nondeterministic sources (for example, the system clock) and/or cryptographic RNGs, where the output is encouraged to cover a state space of at least as many bits as the PRNG's _state length_<sup>[**(4)**](#Note4)</sup>, and
- may be mixed with arbitrary data other than the seed.

The implementation is encouraged to reseed itself from time to time (using a newly generated seed as described earlier), especially if the PRNG has a _state length_ less than 238 bits.  If the RNG reseeds if it would generate more than a threshold number of values without reseeding, that threshold should be the PRNG's period's square root or less.

<a id=Examples_and_Non_Examples></a>
### Examples and Non-Examples

Examples of statistical RNGs include the following:
- [**xoshiro256 star star**](http://xoshiro.di.unimi.it/xoshiro256starstar.c) (state length 256 bits; nonzero seed).
- `xoroshiro128+` (state length 128 bits; nonzero seed &mdash; but see note in the [**source code**](http://xoshiro.di.unimi.it/xoroshiro128plus.c) about the lowest bit of the PRNG's outputs).
- `Lehmer128` (state length 128 bits).
- XorShift\* 128/64 (state length 128 bits; nonzero seed).
- XorShift\* 64/32 (state length 64 bits; nonzero seed).
- `JKISS` on top of page 3 of Jones 2010 (state length 128 bits; seed with four 32-bit nonzero pieces).
- C++'s [**`std::ranlux48` engine**](http://www.cplusplus.com/reference/random/ranlux48/) (state length 577 bits; nonzero seed).

The following also count as statistical RNGs, but are not preferred:
- Mersenne Twister shows a [**systematic failure**](http://xoroshiro.di.unimi.it/#quality) in `BigCrush`'s LinearComp test. (See also S. Vigna, "[**An experimental exploration of Marsaglia's `xorshift` generators, scrambled**](http://vigna.di.unimi.it/ftp/papers/xorshift.pdf)", as published in the `xoroshiro128+` website.)
- PCG (`pcg32`, `pcg64`, and `pcg64_fast` classes), by Melissa O'Neill. [**S. Vigna believes**](http://pcg.di.unimi.it/pcg.php) "there is no reason to use PCG generators" when better alternatives exist.

Non-examples include the following:
- Any [**linear congruential generator**](https://en.wikipedia.org/wiki/Linear_congruential_generator) with modulus 2<sup>63</sup> or less (such as `java.util.Random` and C++'s `std::minstd_rand` and `std::minstd_rand0` engines) has a _state length_ of less than 64 bits.

<a id=Seeded_PRNGs></a>
## Seeded PRNGs

In addition, some applications use pseudorandom number generators (PRNGs) to generate results based on apparent randomness, starting from a known initial state, or "seed". Such applications usually care about reproducible results. (Note that in the definitions for [**cryptographic**](#Cryptographic_RNGs) and [**statistical**](#Statistical_RNGs) RNGs given earlier, the PRNGs involved are automatically seeded before use.)

<a id=Seeding_Recommendations></a>
### Seeding Recommendations

An application should use a PRNG with a seed it specifies (rather than an automatically-initialized PRNG or another kind of RNG) only if&mdash;

1. the initial state (the seed) which the "random" result will be generated from&mdash;
    - is hard-coded,
    - is derived from user-entered data,
    - is known to the application and was generated using a [**cryptographic**](#Cryptographic_RNGs) or [**statistical**](#Statistical_RNGs) RNG (as defined earlier),
    - is a [**verifiable random number**](#Verifiable_Random_Numbers) (as defined later), or
    - is based on a timestamp (but only if the "random" content will remain the same during the time specified on the timestamp and within the timestamp's granularity; for example, a year/month/day timestamp for content that varies only daily),
2. the application might need to generate the same "random" result multiple times,
3. the application either&mdash;
    - makes the seed (or a "code" or "password" based on the seed) accessible to the user, or
    - finds it impractical to store or distribute the "random" numbers or results (rather than the seed) for later use, such as&mdash;
        - by saving the result to a file,
        - by storing the random numbers for the feature generating the result to "replay" later, or
        - by distributing the results or the random numbers to networked users as they are generated, and
4. any feature using that random number generation method to generate that "random" result will remain backward compatible with respect to the "random" results it generates, for as long as that feature is still in use by the application.

Meeting recommendation 4 is aided by using _stable_ PRNGs; see [**"Definitions"**](#Definitions) and the following examples:

- [**`java.util.Random`**](https://docs.oracle.com/javase/8/docs/api/java/util/Random.html) is stable.
- The C [**`rand` method**](http://en.cppreference.com/w/cpp/numeric/random/rand) is not stable (because the algorithm it uses is unspecified).
- C++'s random number distribution classes, such as [**`std::uniform_int_distribution`**](http://en.cppreference.com/w/cpp/numeric/random/uniform_int_distribution), are not stable (because the algorithms they use are implementation-defined according to the specification).
- .NET's [**`System.Random`**](https://docs.microsoft.com/dotnet/api/system.random) is not stable (because its generation behavior could change in the future).

<a id=Recommendations_for_Seeded_PRNGs></a>
### Recommendations for Seeded PRNGs

Which PRNG to use for generating reproducible results depends on the application. But as recommendations, any PRNG algorithm selected for producing reproducible results&mdash;

- should meet or exceed the quality requirements of a statistical RNG,
- should be reasonably fast, and
- should have a _state length_ of 64 bits or greater.

<a id=Examples_2></a>
### Examples

Custom seeds can come into play in the following situations, among others.

<a id=Games></a>
#### Games

Many kinds of games generate game content based on apparent randomness, such as&mdash;

- procedurally generated maps for a role-playing game,
- [**shuffling**](#Shuffling) a digital deck of cards for a solitaire game, or
- a game board or puzzle board that normally varies every session,

where the game might need to generate the same content of that kind multiple times.

In general, such a game should use a PRNG with a custom seed for such purposes only if&mdash;

1. generating the random content uses relatively many random numbers (say, more than a few thousand), and the application finds it impractical to store or distribute the content or the numbers for later use (see recommendations 2 and 3), or
2. the game makes the seed (or a "code" or "password" based on the seed, such as a barcode or a string of letters and digits) accessible to the player, to allow the player to regenerate the content (see recommendations 2 and 3).

Option 1 often applies to games that generate procedural terrain for game levels, since the terrain often exhibits random variations over an extended space.  Option 1 is less suitable for puzzle game boards or card shuffling, since much less data needs to be stored.

> **Example:** Suppose a game generates a map with random terrain and shows the player a "code" to generate that map. Under recommendation 4, the game&mdash;
>
> - may change the algorithm it uses to generate random maps, but
> - should use, in connection with the new algorithm, "codes" that can't be confused with "codes" it used for previous algorithms, and
> - should continue to generate the same random map using an old "code" when the player enters it, even after the change to a new algorithm.

<a id=Unit_Testing></a>
#### Unit Testing

A custom seed is appropriate when unit testing a method that uses a seeded PRNG in place of another kind of RNG for the purpose of the test (provided the method meets recommendation 4).

<a id=Verifiable_Random_Numbers></a>
#### Verifiable Random Numbers

_Verifiable random numbers_ are random numbers (such as seeds for PRNGs) that are disclosed along with all the information necessary to verify their generation.  Usually, of the information used to derive such numbers&mdash;
- at least some of it is not known by anyone until some time after the announcement is made that those numbers will be generated, but all of it will eventually be publicly available, and
- some of it can be disclosed in the announcement that those numbers will be generated.

One process to generate verifiable random numbers is described in [**RFC 3797**](https://www.rfc-editor.org/rfc/rfc3797.txt) (to the extent its advice is not specific to the Internet Engineering Task Force or its Nominations Committee).  Although the source code given in that RFC uses the MD5 algorithm, the process does not preclude the use of [**hash functions**](#Hash_Functions) stronger than MD5 (see the last paragraph of section 3.3 of that RFC).

<a id=Noise></a>
#### Noise

Randomly generated numbers can serve as _noise_, that is, a randomized variation in images, sound, and other data.  (See also Red Blob Games, [**"Noise Functions and Map Generation"**](http://www.redblobgames.com/articles/noise/introduction.html)).  For the purposes of RNG recommendations, there are two kinds of noise:

1.  **_Procedural noise_** is generated using a _noise function_, which is a function that outputs seemingly random numbers given an _n_-dimensional point and, optionally, additional data (such as gradients or hash values).<sup>[**(5)**](#Note5)</sup>  Procedural noise includes [**cellular noise**](https://en.wikipedia.org/wiki/Cellular_noise), [**value noise**](https://en.wikipedia.org/wiki/Value_noise), and [**gradient noise**](https://en.wikipedia.org/wiki/Gradient_noise) (such as [**Perlin noise**](https://en.wikipedia.org/wiki/Perlin_noise)).  Wherever feasible, procedural noise implementations should **use an RNG to generate the additional data** for the noise function in advance.  The additional data may be **"hard-coded"** instead if the [**seeding recommendations**](#Seeding_Recommendations) apply to the noise generation (treating the hard-coded data as the seed).  If the noise function **incorporates a** [**_hash function_**](#Hash_Functions), that hash function should be reasonably fast, be _stable_ (see [**"Definitions"**](#Definitions)), and have the so-called _avalanche property_.

2.  **_Nonprocedural noise_** is generated using the help of an RNG.  Nonprocedural noise includes [**colored noise**](https://en.wikipedia.org/wiki/Colors_of_noise) (including white noise and pink noise), periodic noise, and noise following a Gaussian or other [**probability distribution**](https://peteroupc.github.io/randomfunc.html#Specific_Non_Uniform_Distributions).  For nonprocedural noise, the same considerations apply to any RNGs the noise implementation uses as in cases not involving noise.

<a id=Implementing_RNGs_in_Programming_Languages></a>
## Implementing RNGs in Programming Languages

As much as possible, **applications should use existing libraries and techniques** that already meet the requirements for cryptographic and statistical RNGs.

The following table lists application programming interfaces (APIs) for
cryptographic and statistical RNGs for popular programming languages. Note the following:

- Methods and libraries mentioned in the "Statistical" column need to be initialized with a seed before use (for example, a seed generated using an implementation in the "Cryptographic" column).
- The mention of a third-party library in this section does not imply sponsorship or endorsement of that library, or imply a preference of that library over others. The list is not comprehensive.

| Language   | Cryptographic   | Statistical | Other |
 --------|-----------------------------------------------|------|------|
| C/C++ (G)  | (C) | [**`xoroshiro128plus.c`**](http://xoroshiro.di.unimi.it/xoroshiro128plus.c) (128-bit nonzero seed); [**`xorshift128plus.c`**](http://xoroshiro.di.unimi.it/xorshift128plus.c) (128-bit nonzero seed) |
| Python | `secrets.SystemRandom` (since Python 3.6); `os.urandom()`| [**ihaque/xorshift**](https://github.com/ihaque/xorshift) library (128-bit nonzero seed; default seed uses `os.urandom()`) | `random.getrandbits()` (A); `random.seed()` (19,936-bit seed) (A) |
| Java (D) | (C); `java.security.SecureRandom` (F) |  [**grunka/xorshift**](https://github.com/grunka/xorshift) (`XORShift1024Star` or `XORShift128Plus`) | |
| JavaScript | `crypto.randomBytes(byteCount)` (node.js only) | [**`xorshift`**](https://github.com/AndreasMadsen/xorshift) library | `Math.random()` (ranges from 0 through 1) (B) |
| Ruby | (C); `SecureRandom` class (`require 'securerandom'`) |  | `Random#rand()` (ranges from 0 through 1) (A) (E); `Random#rand(N)` (integer) (A) (E); `Random.new(seed)` (default seed uses nondeterministic data) |
| PHP | `random_int()` (since PHP 7) |  | `mt_rand()` (A) |

<small>(A) General RNG implements [**Mersenne Twister**](https://en.wikipedia.org/wiki/Mersenne_Twister), which is not preferred for a statistical RNG.  PHP's `mt_rand()` implements or implemented a flawed version of Mersenne Twister.</small>

<small>(B) JavaScript's `Math.random` is implemented using `xorshift128+` in the latest V8 engine, Firefox, and certain other modern browsers as of late 2017; the exact algorithm to be used by JavaScript's `Math.random` is "implementation-dependent", though, according to the ECMAScript specification.</small>

<small>(C) A cryptographic RNG implementation can&mdash;
   - read from the `/dev/urandom` and/or `/dev/random` devices in most Unix-based systems (using the `open` and `read` system calls where available),
   - call the `getentropy` method on OpenBSD, or
   - call the `BCryptGenRandom` API in recent versions of Windows,</small>

<small>and only use other techniques if the existing ones are inadequate for the application.</small>

<small>(D) Java's `java.util.Random` class uses a 48-bit seed, so doesn't meet the statistical RNG requirements.  However, a subclass of `java.util.Random` might be implemented to meet those requirements.</small>

<small>(E) In my opinion, Ruby's `Random#rand` method presents a beautiful and simple API for random number generation.</small>

<small>(F) At least in Unix-based systems, calling the `SecureRandom` constructor that takes a byte array is recommended. The byte array should be data described in note (C).</small>

<small>(G) [**`std::random_device`**](http://en.cppreference.com/w/cpp/numeric/random/random_device), introduced in C++11, is not recommended because its specification leaves considerably much to be desired.  For example,  `std::random_device` can fall back to a pseudorandom number generator of unspecified quality without much warning.</small>

----

In the uncommon cases where existing solutions are inadequate, a programming language API could implement cryptographic and statistical RNGs by filling an output byte buffer with random bytes, where each bit in each byte will be randomly set to 0 or 1. Such an API is recommended to be reasonably fast for most applications, and to be safe for concurrent use by multiple threads, whenever convenient.

> **Example:** A C language API for such RNGs could look like the following: `int random(uint8_t[] bytes, size_t size);`, where "bytes" is a pointer to a byte array, and "size" is the number of random bytes to generate, and where 0 is returned if the method succeeds and nonzero otherwise.

My document on [**random number generation methods**](https://peteroupc.github.io/randomfunc.html) includes details on ten uniform random number methods. In my opinion, a new programming language's standard library ought to include those ten methods separately for cryptographic and for statistical RNGs. That document also discusses how to implement other methods to generate random numbers or integers that follow a given distribution (such as a normal, geometric, binomial, or weighted distribution) or fall within a given range.

<a id=RNG_Topics></a>
## RNG Topics

&nbsp;

<a id=How_to_Initialize_RNGs></a>
### How to Initialize RNGs

To **reduce the chance of correlated random numbers or identical random number sequences**, an application is encouraged to create&mdash;
- one thread-safe instance of an RNG for the entire application to use, or
- one instance of an RNG for each thread of the application, where each instance&mdash;
    - is accessible to only one thread (such as with thread-local storage), and
    - is initialized with a seed that is unrelated to the other seeds (using sequential or linearly related seeds can cause [**undesirable correlations**](https://blogs.unity3d.com/2015/01/07/a-primer-on-repeatable-random-numbers/) in some PRNGs).

An application that generates **random numbers in parallel** can also do one or both of&mdash;

- using a different conforming RNG scheme for each instance, and
- using a conforming RNG scheme specially designed for parallel random number generation.

If an application uses more than one kind of RNG (cryptographic, statistical, seeded), the advice above applies separately to each such kind of RNG.

(Many questions on _Stack Overflow_ highlight the pitfalls of creating a new RNG instance each time a random number is needed, rather than only once in the application.  This is notably the case with the .NET generator `System.Random`.)

<a id=Shuffling></a>
### Shuffling

There are special considerations in play when applications use RNGs to shuffle a list of items.

<a id=Shuffling_Method></a>
#### Shuffling Method

The first consideration touches on the **shuffling method**.  The [**Fisher&ndash;Yates shuffle method**](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle) does a substantially unbiased shuffle of a list, assuming the RNG it uses can choose from among all permutations of that list.  However, that method is also easy to mess up (see also Jeff Atwood, "[**The danger of na&iuml;vet&eacute;**](https://blog.codinghorror.com/the-danger-of-naivete/)"); I give a correct implementation in [**another document**](https://peteroupc.github.io/randomfunc.html).

<a id=Choosing_from_Among_All_Permutations></a>
#### Choosing from Among All Permutations

The second consideration is present if PRNGs are used for shuffling. If the PRNG's period is less than the number of **distinct permutations (arrangements) of a list**, then there are some permutations that PRNG can't choose when it shuffles that list. (This is not the same as _generating_ all permutations of a list, which, for a sufficiently large list size, can't be done by any computer in a reasonable time.)

The number of distinct permutations is the [**multinomial coefficient**](http://mathworld.wolfram.com/MultinomialCoefficient.html) _m_! / (_w_<sub>1</sub>! &times; _w_<sub>2</sub>! &times; ... &times; _w_<sub>_n_</sub>!), where _m_ is the list's size, _n_ is the number of different items in the list, _x_! means "_x_ [**factorial**](https://en.wikipedia.org/wiki/Factorial)", and _w_<sub>_i_</sub> is the number of times the item identified by _i_ appears in the list. (This reduces to _n_!, if the list consists of _n_ different items.)

The following Python code suggests how many bits of [**_entropy_**](#Nondeterministic_Sources) (randomness) are needed for shuffling. (See also "Lack of randomness" in the [**Big Deal document by van Staveren**](https://sater.home.xs4all.nl/doc.html).) For example&mdash;

- to shuffle a 52-item list, it is suggested to use a PRNG with state length 226 or more, initialized with a seed with at least 226 bits of entropy (`stateLengthN(52)`), and
- to shuffle two 52-item lists of identical contents together, then the suggested state length and bits of entropy are 500 or more (`stateLengthDecks(2, 52)`).

    def fac(x):
        """ Calculates factorial of x. """
        if x<=1: return 1
        ret=1
        for i in range(x): ret=ret*(i+1)
        return ret

    def ceillog2(x):
        """ Calculates base-2 logarithm of x, rounded up. """
        ret=0
        needCeil=True
        while x>1:
           one=needCeil and ((x&1)!=0)
           x=x>>1
           if one:
             ret+=1; needCeil=False
           ret+=1
        return ret

    def stateLengthN(n):
      """ Suggested state length (or bits of entropy)
         for PRNGs that shuffle
        a list of n items. """
      return ceillog2(fac(n))

    def stateLengthNChooseK(n, k):
      """ Suggested state length/entropy for PRNGs that choose k
       different items randomly from a list of n items
       (see RFC 3797, sec. 3.3) """
      return ceillog2(fac(n)/(fac(k)*fac(n-k)))

    def stateLengthDecks(numDecks, numCards):
      """ Suggested state length/entropy for PRNGs that shuffle
        multiple decks of cards in one. """
      return ceillog2(fac(numDecks*numCards)/ \
          (fac(numDecks)**numCards))

Whenever a PRNG is to be used for shuffling purposes, an application is encouraged to choose a PRNG with a state length suggested by the formulas above (and with the highest feasible period for that state length), depending on the size of lists the application will shuffle.  For general-purpose use (but not when information security is involved), that state length could be 525 or more (`stateLengthN(100)`).  (Practically speaking, for sufficiently large list sizes, any given PRNG will not be able to randomly choose some permutations of the list.)

The PRNG chosen this way should meet at least the quality requirements of a statistical RNG implementation, and should be initialized with a full-length seed.

<a id=GPU_Programming_Environments></a>
### GPU Programming Environments

In general, GL Shading Language (GLSL) and other programming environments designed for execution on a graphics processing unit (GPU)&mdash;
- have limited access to some system resources compared with other programming environments,
- are designed for parallel execution, and
- do not store state,

so random number generators for such environments are often designed as [**hash functions**](#Hash_Functions), because their output is determined solely by the input rather than both the input and state (as with PRNGs).  Moreover, some of the hash functions which have been written in GLSL give undesirable results in computers whose GPUs support only 16-bit binary floating point numbers and no other kinds of numbers, which makes such GPUs an important consideration when choosing a hash function.

<a id=Hash_Functions></a>
## Hash Functions

A seemingly random number can be generated from arbitrary data using a _hash function_.

A _hash function_ is a function that takes an arbitrary input of any size (such as a sequence of bytes or a sequence of characters) and returns an output with a fixed size. That output is also known as a _hash code_. (By definition, hash functions are deterministic.  The definition includes a PRNG that takes the input as a seed and outputs a random number of fixed size<sup>[**(6)**](#Note6)</sup>.)

A hash code can be used as follows:
- The hash code can serve as a seed for a PRNG, and the desired random numbers can be generated from that PRNG.  (See my document on [**random number generation methods**](https://peteroupc.github.io/randomfunc.html) for techniques.)
- If a number of random bits is needed, and the hash code has at least that many bits, then that many bits can instead be taken directly from the hash code.

For such purposes, applications should choose hash functions designed such that every bit of the input affects every bit of the output without a clear preference for 0 or 1 (the so-called _avalanche property_).  Hash functions used in information security contexts should be designed such that finding an unknown second input that leads to the same output as that of a given input is cost-prohibitive (the _one-way property_) and so is finding an unknown input that leads to a given output (_collision resistance_), and should have other information security properties depending on the application.

<a id=Motivation></a>
## Motivation

In this document, I made the distinction between _statistical_ and _cryptographic_ RNGs because that is how many programming languages present random number generators &mdash; they usually offer a general-purpose RNG (such as C's `rand` or Java's `java.util.Random`) and sometimes an RNG intended for information security purposes (such as `java.security.SecureRandom`).

What has motivated me to write a more rigorous definition of random number generators is the fact that many applications still use weak RNGs.  In my opinion, this is largely because most popular programming languages today&mdash;
- specify few and weak requirements on RNGs (such as [**C's `rand`**](http://en.cppreference.com/w/cpp/numeric/random/rand)),
- specify a relatively weak general-purpose RNG (such as Java's `java.math.Random`, although it also includes a much stronger `SecureRandom` class),
- implement RNGs by default that leave something to be desired (particularly the Mersenne Twister algorithm found in PHP's `mt_rand` as well as in Python and Ruby),
- seed RNGs with a timestamp by default (such as the [**.NET Framework implementation of `System.Random`**](https://docs.microsoft.com/dotnet/api/system.random)), and/or
- leave the default seeding fixed (as is the case in [**MATLAB**](https://www.mathworks.com/help/matlab/examples/controlling-random-number-generation.html)).

<a id=Conclusion></a>
## Conclusion

Random numbers that merely "look random" are not enough for most applications.  That is why this document defines [**cryptographic RNGs**](#Cryptographic_RNGs) and [**statistical RNGs**](#Statistical_RNGs); I believe RNGs that meet either category will fulfill the expectations of many applications as regards random numbers.  In general:

- For _statistical RNGs_, the random numbers not only "look random", but are shown to behave like random numbers through statistical tests.
- For _cryptographic RNGs_, the random numbers not only "look random", but are virtually unpredictable.

In addition, this document recommends using cryptographic RNGs in many cases, especially in information security contexts, and recommends easier programming interfaces for both cryptographic and statistical RNGs in new programming languages.

I acknowledge&mdash;
- the commenters to the CodeProject version of this page (as well as a similar article of mine on CodeProject), including "Cryptonite" and member 3027120, and
- Lee Daniel Crocker, who reviewed this document and gave comments.

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> If the software and/or hardware uses a nonuniform distribution, but otherwise meets this definition, it can be converted to use a uniform distribution, at least in theory, using _unbiasing_ or _randomness extraction_ methods that it is outside the scope of this document to describe.</small>

<small><sup id=Note2>(2)</sup> Such arbitrary data can include process identifiers, time stamps, environment variables, random numbers, and/or other data specific to the session or to the instance of the RNG.  See also NIST SP800-90A and (Ristenpart and Yilek 2010).</small>

<small><sup id=Note3>(3)</sup> Nondeterministic sources that are reasonably fast for most applications (for instance, by enabling very many seeds to be generated per second), especially sources implemented in hardware, are highly advantageous in a cryptographic RNG.</small>

<small><sup id=Note4>(4)</sup> Timestamps with millisecond or coarser granularity are not encouraged, however, because multiple instances of a PRNG automatically seeded with a timestamp, when they are created at about the same time, run the risk of starting with the same seed and therefore generating the same sequence of random numbers.</small>

<small><sup id=Note5>(5)</sup> Noise functions include functions that combine several outputs of a noise function, including by [**fractional Brownian motion**](https://en.wikipedia.org/wiki/Fractional_Brownian_motion).  By definition, noise functions are deterministic.</small>

<small><sup id=Note6>(6)</sup> Note that some PRNGs (such as `xorshift128+`) are not well suited to serve as hash functions, because they don't mix their state before generating a random number from that state.</small>

<a id=License></a>
## License

This page is licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
