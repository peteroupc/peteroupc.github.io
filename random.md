# Random Number Generator Recommendations for Applications

[**Peter Occil**](mailto:poccil14@gmail.com)

Begun on Mar. 5, 2016; last updated on Sep. 12, 2018.

Most apps that use random numbers care about either unpredictability or speed/high quality.

<a id=Introduction_and_Summary></a>
## Introduction and Summary

Many applications rely on random number generators (RNGs); these RNGs include&mdash;

- _statistical RNGs_, which seek to generate numbers that follow a uniform random distribution,
- _cryptographic RNGs_, which seek to generate numbers that are cost-prohibitive to predict, and
- _seeded PRNGs_ (pseudorandom number generators), which generate numbers that "seem" random given an initial "seed".

**This document covers:**

- Statistical and cryptographic RNGs, as well as recommendations on their use and properties.
- A discussion on when an application that needs numbers that "seem" random SHOULD specify their own "seed" (the initial state that the numbers are based on).
- Nondeterministic RNGs, entropy, and seed generation.
- An explanation of how to implement RNGs in programming code, including APIs that help in doing so.
- Issues on shuffling with an RNG.

**This document does not cover:**

- Testing an RNG implementation for correctness or adequate random number generation.
- Generation of random numbers or keying material based at least in part on a password (e.g. _key derivation functions_, _password authenticated key exchange_).
- Low-discrepancy sequences (quasirandom sequences), such as Sobol sequences.  Their structure differs in an essential way from independent uniform random numbers.
- Applications for which the selection of RNGs is constrained by statutory or regulatory requirements.

**The following table summarizes the kinds of RNGs covered in this document:**

| Kind of RNG   | When to Use This RNG  | Examples |
 --------|--------|------|
| [**Cryptographic RNG**](#Cryptographic_RNGs)   | In information security cases, or when speed is not a concern.  | `/dev/urandom`, `BCryptGenRandom` |
| [**Statistical RNG**](#Statistical_RNGs)   | When information security is not a concern, but speed is.  See also [**"Shuffling"**](#Shuffling).| `xoroshiro128+`, `xorshift128+` |
| [**Seeded PRNG**](#Seeded_PRNGs)   | When generating reproducible "randomness" in a way not practical otherwise.   | High-quality PRNG with custom seed |

<a id=About_This_Document></a>
### About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/random.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/random.md)**.  You can send comments on this document either on** [**CodeProject**](https://www.codeproject.com/Articles/1083372/Random-Number-Generator-Recommendations-for-Applic) **or on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues)**.**

<a id=Contents></a>
## Contents

- [**Introduction and Summary**](#Introduction_and_Summary)
    - [**About This Document**](#About_This_Document)
- [**Contents**](#Contents)
- [**Definitions**](#Definitions)
- [**Cryptographic RNGs**](#Cryptographic_RNGs)
    - [**Quality**](#Quality)
    - [**Seeding and Reseeding**](#Seeding_and_Reseeding)
    - [**Examples**](#Examples)
- [**Statistical RNGs**](#Statistical_RNGs)
    - [**Quality**](#Quality_2)
    - [**Seeding and Reseeding**](#Seeding_and_Reseeding_2)
    - [**Examples and Non-Examples**](#Examples_and_Non_Examples)
- [**Seeded PRNGs**](#Seeded_PRNGs)
    - [**When to Use a Seeded PRNG**](#When_to_Use_a_Seeded_PRNG)
    - [**Which Seeded PRNG to Use**](#Which_Seeded_PRNG_to_Use)
    - [**Seed Generation for Seeded PRNGs**](#Seed_Generation_for_Seeded_PRNGs)
    - [**Examples**](#Examples_2)
        - [**Games**](#Games)
        - [**Unit Tests**](#Unit_Tests)
        - [**Noise**](#Noise)
        - [**Verifiable Random Numbers**](#Verifiable_Random_Numbers)
- [**Nondeterministic Sources and Seed Generation**](#Nondeterministic_Sources_and_Seed_Generation)
    - [**Examples of Nondeterministic Sources**](#Examples_of_Nondeterministic_Sources)
    - [**Entropy**](#Entropy)
    - [**Seed Generation**](#Seed_Generation)
- [**Implementing RNGs in Programming Languages**](#Implementing_RNGs_in_Programming_Languages)
- [**RNG Topics**](#RNG_Topics)
    - [**How to Initialize RNGs**](#How_to_Initialize_RNGs)
    - [**Shuffling**](#Shuffling)
    - [**GPU Programming Environments**](#GPU_Programming_Environments)
- [**Hash Functions**](#Hash_Functions)
- [**Motivation**](#Motivation)
- [**Conclusion**](#Conclusion)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Suggested Entropy Size**](#Suggested_Entropy_Size)
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
- **MUST, SHOULD, SHOULD NOT, MAY, RECOMMENDED, NOT RECOMMENDED.**  As defined in RFC 2119 and RFC 8174.

<a id=Cryptographic_RNGs></a>
## Cryptographic RNGs

Cryptographic RNGs (also known as "cryptographically strong" or "cryptographically secure" RNGs) seek to generate random numbers that are cost-prohibitive to predict.  Cryptographic RNGs are RECOMMENDED for applications that use random numbers for information security, such as&mdash;

-  generating keying material, such as encryption keys,
-  generating random passwords, nonces, or session identifiers,
-  generating "salts" to vary hash codes of the same password,
-  use in communications between two networked computers (including in data transfer, data transport, and messaging), and
-  cases (such as in multiplayer networked games) when predicting future random numbers would give a player or user a significant and unfair advantage,

as well as for applications that generate random numbers so infrequently that the RNG's speed is not a concern.

<a id=Quality></a>
### Quality

A cryptographic RNG implementation generates uniformly distributed random bits such that it would be at least cost-prohibitive for an outside party to guess prior unseen bits of the random sequence correctly with more than a 50% chance per bit, even with knowledge of the randomness-generating procedure, the implementation's internal state at the given point in time, and/or extremely many outputs of the RNG.

<a id=Seeding_and_Reseeding></a>
### Seeding and Reseeding

If a cryptographic RNG implementation uses a PRNG, the following requirements apply.

The PRNG's _state length_ MUST be at least 128 bits and SHOULD be at least 256 bits.  The _security strength_ used by the RNG MUST be at least 112 bits, SHOULD be at least 128 bits, and MAY equal the PRNG's _state length_.

Before an instance of the RNG generates a random number, it MUST have been initialized ("seeded") with a seed defined as follows. The seed&mdash;
- MUST have as many bits as the PRNG's _state length_,
- MUST consist of data that ultimately derives from the output of one or more [**nondeterministic sources**](#Nondeterministic_Sources_and_Seed_Generation), where the output is at least as hard to predict as ideal random data with as many bits as the _security strength_, and
- MAY be mixed with arbitrary data other than the seed as long as the result is no easier to predict<sup>[**(2)**](#Note2)</sup>.

The RNG MAY reseed itself from time to time, using a newly generated seed as described earlier. If the implementation reseeds, it SHOULD do so as often as feasible (whenever doing so would not slow down applications undesirably).  If the RNG reseeds if it would generate more than a threshold number of bits without reseeding, that threshold SHOULD be 2<sup>67</sup> or less.

<a id=Examples></a>
### Examples

Examples of cryptographic RNG implementations include the following:
- The `/dev/random` device on many Unix-based operating systems, which generally uses only nondeterministic sources; however, in some implementations of the device it can block for seconds at a time, especially if not enough randomness is available.
- The `/dev/urandom` device on many Unix-based operating systems, which often relies on both a PRNG and the same nondeterministic sources used by `/dev/random`.
- The `BCryptGenRandom` method in Windows 7 and later.
- Two-source extractors, multi-source extractors, or cryptographic [**hash functions**](#Hash_Functions) that take very hard-to-predict signals from two or more nondeterministic sources as input.
- A "fast-key-erasure" random number generator described by D.J. Bernstein in his blog (Bernstein 2017)<sup>[**(3)**](#Note3)</sup>.
- An RNG implementation complying with NIST SP 800-90A.  The SP 800-90 series goes into further detail on how RNGs appropriate for information security can be constructed, and inspired much of the "Cryptographic RNGs" section.

<a id=Statistical_RNGs></a>
## Statistical RNGs

Statistical RNGs are used, for example, in simulations, numerical integration, and many games to bring an element of chance and variation to the application, with the goal that each possible outcome is equally likely. However, statistical RNGs are generally suitable only if&mdash;

-  information security is not involved, and
-  the application generates random numbers so frequently that it would slow down undesirably if a cryptographic RNG were used instead.

A statistical RNG is usually implemented with a PRNG, but can also be implemented in a similar way as a cryptographic RNG provided it remains reasonably fast.

> **Note:** If more than 20 items are being shuffled, a concerned application would be well advised to use alternatives to a statistical RNG implementation (see [**"Shuffling"**](#Shuffling)).

<a id=Quality_2></a>
### Quality

A statistical RNG generates random bits, each of which is uniformly distributed independently of the other bits, at least for nearly all practical purposes.  If the implementation uses a PRNG, that PRNG algorithm MUST either satisfy the _collision resistance_ property or be significantly more likely than not to pass all tests (other than MatrixRank and LinearComp) of `BigCrush`, part of L'Ecuyer and Simard's "TestU01". The RNG need not be perfectly equidistributed.

<a id=Seeding_and_Reseeding_2></a>
### Seeding and Reseeding

If a statistical RNG implementation uses a PRNG, the following requirements apply.

The PRNG's _state length_ MUST be at least 64 bits, SHOULD be at least 128 bits, and is encouraged to be as high as the implementation can go to remain reasonably fast for most applications.

Before an instance of the RNG generates a random number, it MUST have been initialized ("seeded") with a seed described as follows. The seed&mdash;
- MUST have as many bits as the PRNG's _state length_,
- MUST consist of data that ultimately derives from the output of one or more [**nondeterministic sources**](#Nondeterministic_Sources_and_Seed_Generation) and/or cryptographic RNGs, where the output is encouraged to cover a state space of at least as many bits as the PRNG's _state length_, and
- MAY be mixed with arbitrary data other than the seed.

The RNG MAY reseed itself from time to time, using a newly generated seed as described earlier.  If the RNG reseeds if it would generate more than a threshold number of values without reseeding, that threshold SHOULD be the PRNG's period's square root or less.

<a id=Examples_and_Non_Examples></a>
### Examples and Non-Examples

Examples of statistical RNGs include the following:
- [**xoshiro256&#x2a;&#x2a;**](http://xoshiro.di.unimi.it/xoshiro256starstar.c) (state length 256 bits; nonzero seed).
- [**xoroshiro128&#x2a;&#x2a;**](http://xoshiro.di.unimi.it/xoroshiro128starstar.c) (state length 128 bits; nonzero seed).
- `Lehmer64` and `Lehmer128` (for each: state length 128 bits; odd seed, so effectively 127 bits state length).
- XorShift\* 128/64 (state length 128 bits; nonzero seed).
- XorShift\* 64/32 (state length 64 bits; nonzero seed).
- `JKISS`, `JKISS32`, `JLKISS`, `JLKISS64`, described in (Jones 2007/2010)<sup>[**(4)**](#Note4)</sup>.
- C++'s [**`std::ranlux48` engine**](http://www.cplusplus.com/reference/random/ranlux48/) (state length 577 bits; nonzero seed).
- PCG (`pcg32`, `pcg64`, and `pcg64_fast` classes), by Melissa O'Neill. See also a [**critique by S. Vigna**](http://pcg.di.unimi.it/pcg.php).
- Other examples include B. Jenkins's "A small noncryptographic PRNG" (sometimes called `jsf`), C. Doty-Humphrey's `sfc`, `msws` (Widynski 2017)<sup>[**(5)**](#Note5)</sup>, and D. Blackman's `gjrand`.

The following also count as statistical RNGs, but are not preferred:
- Mersenne Twister shows a [**systematic failure**](http://xoroshiro.di.unimi.it/#quality) in `BigCrush`'s LinearComp test. (See also (Vigna 2016)<sup>[**(6)**](#Note6)</sup>.)
- [**`xoroshiro128+`**](http://xoshiro.di.unimi.it/xoroshiro128plus.c), `xoshiro256+`, and `xorshift128+`.  As described by (Blackman and Vigna 2018)<sup>[**(7)**](#Note7)</sup>, these linear PRNGs use weak scramblers, so that each output's lowest bits have low linear complexity even though the output as a whole has excellent statistical randomness.  See also [**"Testing lowest bits in isolation"**](http://xoshiro.di.unimi.it/lowcomp.php).

Non-examples include the following:
- Any [**linear congruential generator**](https://en.wikipedia.org/wiki/Linear_congruential_generator) with modulus 2<sup>63</sup> or less (such as `java.util.Random` and C++'s `std::minstd_rand` and `std::minstd_rand0` engines) has a _state length_ of less than 64 bits.
- `System.Random`, as implemented in the .NET Framework 4.7, can take a seed of at most 32 bits, so has a state length of at most 32 bits.

<a id=Seeded_PRNGs></a>
## Seeded PRNGs

In addition, some applications use pseudorandom number generators (PRNGs) to generate results based on apparent randomness, starting from a known initial state, or "seed". Such applications usually care about repeatable "randomness". (Note that in the definitions for [**cryptographic**](#Cryptographic_RNGs) and [**statistical**](#Statistical_RNGs) RNGs given earlier, the PRNGs involved are automatically seeded before use.)

<a id=When_to_Use_a_Seeded_PRNG></a>
### When to Use a Seeded PRNG

An application SHOULD NOT use a PRNG with a seed it specifies (rather than an automatically-initialized PRNG or another kind of RNG) unless&mdash;

1. the application might need to generate the same "random" result multiple times,
2. the application either&mdash;
    - makes the seed (or a "code" or "password" based on the seed) accessible to the user, or
    - finds it impractical to store or distribute the "random" numbers or results (rather than the seed) for later use, such as&mdash;
        - by saving the result to a file,
        - by storing the "random" numbers for the feature generating the result to "replay" later, or
        - by distributing the results or the "random" numbers to networked users as they are generated, and
3. any feature that uses such a PRNG to generate that "random" result will remain backward compatible with respect to the "random" results it generates, for as long as that feature is still in use by the application.

> **Note:** Meeting statement 3 is aided by using _stable_ PRNGs; see [**"Definitions"**](#Definitions) and the following examples:
>
> - [**`java.util.Random`**](https://docs.oracle.com/javase/8/docs/api/java/util/Random.html) is stable.
> - The C [**`rand` method**](http://en.cppreference.com/w/cpp/numeric/random/rand) is not stable (because the algorithm it uses is unspecified).
> - C++'s random number distribution classes, such as [**`std::uniform_int_distribution`**](http://en.cppreference.com/w/cpp/numeric/random/uniform_int_distribution), are not stable (because the algorithms they use are implementation-defined according to the specification).
> - .NET's [**`System.Random`**](https://docs.microsoft.com/dotnet/api/system.random) is not stable (because its generation behavior could change in the future).

Among other things, using seeded PRNGs only in the limited circumstances given above makes the application less dependent on a particular RNG or on a particular RNG implementation, meaning the application is free to change the RNG if needed.

<a id=Which_Seeded_PRNG_to_Use></a>
### Which Seeded PRNG to Use

If an application decides to use a seeded PRNG for repeatable "randomness", that PRNG SHOULD&mdash;

- meet or exceed the quality requirements of a [**statistical RNG**](#Statistical_RNGs),
- be reasonably fast, and
- have a _state length_ of 64 bits or greater.

<a id=Seed_Generation_for_Seeded_PRNGs></a>
### Seed Generation for Seeded PRNGs

As much as possible, an application SHOULD generate seeds for a seeded PRNG&mdash;

- using a cryptographic or statistical RNG (as defined earlier),
- as described in [**Nondeterministic Sources and Seed Generation**](#Nondeterministic_Sources_and_Seed_Generation), or
- otherwise using hard-to-predict data.

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

In general, such a game SHOULD NOT use a PRNG with a custom seed for such purposes unless&mdash;

1. generating the random content uses relatively many random numbers (say, more than a few thousand), and the application finds it impractical to store or distribute the content or the numbers for later use, or
2. the game makes the seed (or a "code" or "password" based on the seed, such as a barcode or a string of letters and digits) accessible to the player, to allow the player to regenerate the content.

Option 1 often applies to games that generate procedural terrain for game levels, since the terrain often exhibits random variations over an extended space.  Option 1 is less suitable for puzzle game boards or card shuffling, since much less data needs to be stored.

> **Example:** Suppose a game generates a map with random terrain and shows the player a "code" to generate that map. In this case, the game&mdash;
>
> - MAY change the algorithm it uses to generate random maps, but
> - SHOULD use, in connection with the new algorithm, "codes" that can't be confused with "codes" it used for previous algorithms, and
> - SHOULD continue to generate the same random map using an old "code" when the player enters it, even after the change to a new algorithm.

<a id=Unit_Tests></a>
#### Unit Tests

A custom seed is appropriate when unit testing a method that uses a seeded PRNG in place of another kind of RNG for the purpose of the test (provided the test ensures backward compatibility).

<a id=Noise></a>
#### Noise

_Noise_ is a randomized variation in images, sound, and other data.  (See also Red Blob Games, [**"Noise Functions and Map Generation"**](http://www.redblobgames.com/articles/noise/introduction.html)).  For the purposes of RNG recommendations, there are two kinds of noise:

1.  **_Procedural noise_** is generated using a _noise function_, which is a function that outputs seemingly random numbers given an _n_-dimensional point and, optionally, additional data (such as gradients or hash values).<sup>[**(8)**](#Note8)</sup>  Procedural noise includes [**cellular noise**](https://en.wikipedia.org/wiki/Cellular_noise), [**value noise**](https://en.wikipedia.org/wiki/Value_noise), and [**gradient noise**](https://en.wikipedia.org/wiki/Gradient_noise) (such as [**Perlin noise**](https://en.wikipedia.org/wiki/Perlin_noise)).  As much as possible, procedural noise implementations SHOULD **use an RNG to generate the additional data** for the noise function in advance.  If using a [**custom-seeded PRNG**](#When_to_Use_a_Seeded_PRNG) is appropriate for the application, the additional data MAY be **"hard-coded"** instead.  If the noise function **incorporates a** [**_hash function_**](#Hash_Functions), that hash function SHOULD be reasonably fast, be _stable_ (see [**"Definitions"**](#Definitions)), and have the so-called _avalanche property_.

2.  **_Nonprocedural noise_** is generated using the help of an RNG.  Nonprocedural noise includes [**colored noise**](https://en.wikipedia.org/wiki/Colors_of_noise) (including white noise and pink noise), periodic noise, and noise following a Gaussian or other [**probability distribution**](https://peteroupc.github.io/randomfunc.html#Specific_Non_Uniform_Distributions).  For nonprocedural noise, the same considerations apply to any RNGs the noise implementation uses as in cases not involving noise.

<a id=Verifiable_Random_Numbers></a>
#### Verifiable Random Numbers

_Verifiable random numbers_ are random numbers (such as seeds for PRNGs) that are disclosed along with all the information necessary to verify their generation.  Usually, such information includes random numbers and/or uncertain data to be determined and publicly disclosed in the future.  Generating verifiable randomness has been described in [**RFC 3797**](https://www.rfc-editor.org/rfc/rfc3797.txt), in (Lenstra et al., 2015)<sup>[**(9)**](#Note9)</sup>, in (Boneh et al., 2018)<sup>[**(10)**](#Note10)</sup> (which introduces the concept of _verifiable delay functions_, functions whose output deliberately takes time to compute but is easy to verify), and elsewhere.

<a id=Nondeterministic_Sources_and_Seed_Generation></a>
## Nondeterministic Sources and Seed Generation

RNGs ultimately rely on nondeterministic sources to generate random numbers.  Such sources are used to help generate a _seed_ for a PRNG, for example.  The best nondeterministic sources for this purpose are those whose output is very hard to predict.

<a id=Examples_of_Nondeterministic_Sources></a>
### Examples of Nondeterministic Sources

Examples of nondeterministic sources are&mdash;

- disk access timings,
- timings of keystrokes and/or other input device interactions,
- thermal noise,
- the output generated with A. Seznec's technique called hardware volatile entropy gathering and expansion (HAVEGE), provided a high-resolution counter is available, and
- differences between two high-resolution counter values taken in quick succession (such as in "Jitter RNG"; see (M&uuml;ller)<sup>[**(11)**](#Note11)</sup>).

RFC 4086, "Randomness Requirements for Security", section 3, contains a survey of nondeterministic sources.

> **Notes:**
>
> 1. Online services that make random numbers available to applications, as well as outputs of audio and video devices (see RFC 4086 sec. 3.2.1), are additional nondeterministic sources.  However, online services require Internet or other network access, and some of them require access credentials.  Also, many mobile operating systems require applications to declare network, camera, and microphone access to users upon installation.  For these reasons, these kinds of sources are NOT RECOMMENDED if other approaches are adequate.
> 2. For noncryptographic RNGs, timestamps from the system clock are commonly used.  Timestamps with millisecond or coarser granularity are not encouraged, however, because multiple instances of a PRNG automatically seeded with a timestamp, when they are created at about the same time, run the risk of starting with the same seed and therefore generating the same sequence of random numbers.
> 3. For general-purpose use, nondeterministic sources that enable many high-quality seeds per second to be generated are highly advantageous, especially for a cryptographic RNG.

<a id=Entropy></a>
### Entropy

_Entropy_ is a value that describes how hard it is to predict a nondeterministic source's output, compared to ideal random data; this is generally the size in bits of the ideal random data.  (For example, a 64-bit output with 32 bits of entropy is as hard to predict as an ideal random 32-bit data block.)  NIST SP 800-90B recommends _min-entropy_ as the entropy measure and also details how nondeterministic sources can be used for information security.  See also RFC 4086 section 2.

<a id=Seed_Generation></a>
### Seed Generation

In general, especially for cryptographic RNGs, **to generate an N-bit seed, enough data needs to be gathered from nondeterministic sources to reach N bits of entropy or more**.

Once data with enough entropy is gathered, it might need to be condensed into a seed to initialize a PRNG with. Following (Cliff et al., 2009)<sup>[**(12)**](#Note12)</sup>, it is suggested to generate an N-bit seed by using an HMAC or "cascade" hash function (such as SHA-256 or SHA-512), with outputs at least N times 3 bits long, on data with at least N times 3 bits of entropy, then truncating the output to N bits.  See also NIST SP 800-90B sec. 3.1.5.1 and RFC 4086 sec. 4.2 and 5.2.

<a id=Implementing_RNGs_in_Programming_Languages></a>
## Implementing RNGs in Programming Languages

As much as possible, **applications SHOULD use existing libraries and techniques** that already meet the requirements for cryptographic and statistical RNGs.

The following table lists application programming interfaces (APIs) for
cryptographic and statistical RNGs for popular programming languages. Note the following:

- Methods and libraries mentioned in the "Statistical" column need to be initialized with a seed before use (for example, a seed generated using an implementation in the "Cryptographic" column).
- The mention of a third-party library in this section does not imply sponsorship or endorsement of that library, or imply a preference of that library over others. The list is not comprehensive.

| Language   | Cryptographic   | Statistical | Other |
 --------|-----------------------------------------------|------|------|
| .NET (incl. C# and VB.NET) (H) | `RNGCryptoServiceProvider` in `System.Security.Cryptography` namespace | [**airbreather/AirBreather.Common library**](https://github.com/airbreather/Airbreather.Common) (XorShift1024Star, XorShift128Plus, XoroShiro128Plus) |   |
| C/C++ (G)  | (C) | [**`xoroshiro128plus.c`**](http://xoroshiro.di.unimi.it/xoroshiro128plus.c) (128-bit nonzero seed); [**`xorshift128plus.c`**](http://xoroshiro.di.unimi.it/xorshift128plus.c) (128-bit nonzero seed); [**frostburn/jkiss**](https://github.com/frostburn/jkiss) library |
| Python | `secrets.SystemRandom` (since Python 3.6); `os.urandom()`| [**ihaque/xorshift**](https://github.com/ihaque/xorshift) library (128-bit nonzero seed; default seed uses `os.urandom()`) | `random.getrandbits()` (A); `random.seed()` (19,936-bit seed) (A) |
| Java (D) | (C); `java.security.SecureRandom` (F) |  [**grunka/xorshift**](https://github.com/grunka/xorshift) (`XORShift1024Star` or `XORShift128Plus`); [**jenetics/prngine**](https://github.com/jenetics/prngine) (`KISS32Random`, `KISS64Random`) |  prngine library (`MT19937_32Random`, `MT19937_64Random`) |
| JavaScript | `crypto.randomBytes(byteCount)` (node.js only); `crypto.getRandomValues()` (Web) | [**`xorshift`**](https://github.com/AndreasMadsen/xorshift) library | `Math.random()` (ranges from 0 through 1) (B) |
| Ruby | (C); `SecureRandom.rand()` (ranges from 0 through 1) (E); `SecureRandom.rand(N)` (integer) (E) (for both, `require 'securerandom'`) |  | `Random#rand()` (ranges from 0 through 1) (A) (E); `Random#rand(N)` (integer) (A) (E); `Random.new(seed)` (default seed uses nondeterministic data) |
| PHP | `random_int()`, `random_bytes()` (both since PHP 7) |  | `mt_rand()` (A) |

<small>(A) General RNG implements [**Mersenne Twister**](https://en.wikipedia.org/wiki/Mersenne_Twister), which is not preferred for a statistical RNG.  PHP's `mt_rand()` implements or implemented a flawed version of Mersenne Twister.</small>

<small>(B) JavaScript's `Math.random` is implemented using `xorshift128+` (or a variant) in the V8 engine, Firefox, and certain other modern browsers as of late 2017; the exact algorithm to be used by JavaScript's `Math.random` is "implementation-dependent", though, according to the ECMAScript specification.</small>

<small>(C) A cryptographic RNG implementation can&mdash;
   - read from the `/dev/urandom` and/or `/dev/random` devices in most Unix-based systems (using the `open` and `read` system calls where available),
   - call the `getentropy` method on OpenBSD, or
   - call the `BCryptGenRandom` API in Windows 7 and later,</small>

<small>and only use other techniques if the existing ones are inadequate for the application.</small>

<small>(D) Java's `java.util.Random` class uses a 48-bit seed, so doesn't meet the statistical RNG requirements.  However, a subclass of `java.util.Random` might be implemented to meet those requirements.</small>

<small>(E) In my opinion, Ruby's `Random#rand` and `SecureRandom.rand` methods present a beautiful and simple API for random number generation.</small>

<small>(F) Calling the `setSeed` method of `SecureRandom` before use is RECOMMENDED. The data passed to the method SHOULD be data described in note (C). (Despite the name, `setSeed` _supplements_ the existing seed, according to the documentation.)</small>

<small>(G) [**`std::random_device`**](http://en.cppreference.com/w/cpp/numeric/random/random_device), introduced in C++11, is NOT RECOMMENDED because its specification leaves considerably much to be desired.  For example,  `std::random_device` can fall back to a pseudorandom number generator of unspecified quality without much warning.  At best, `std::random_device` SHOULD only be used to supplement other techniques for random number generation.</small>

<small>(H) The .NET Framework's `System.Random` class uses a seed of at most 32 bits, so doesn't meet the statistical RNG requirements.  However, a subclass of `System.Random` might be implemented to meet those requirements.</small>

----

In the limited cases where existing solutions are inadequate, a programming language API could implement cryptographic and statistical RNGs by filling one or more memory units (such as 8-bit bytes) completely with random bits. Such an API is RECOMMENDED to be reasonably fast for most applications, and to be safe for concurrent use by multiple threads, whenever convenient.

> **Example:** A C language API for such RNGs could look like the following: `int random(uint8_t[] bytes, size_t size);`, where `bytes` is a pointer to an array of 8-bit bytes, and `size` is the number of random 8-bit bytes to generate, and where 0 is returned if the method succeeds and nonzero otherwise.

My document on [**random number generation methods**](https://peteroupc.github.io/randomfunc.html) includes details on ten uniform random number methods. In my opinion, a new programming language's standard library ought to include those ten methods separately for cryptographic and for statistical RNGs. That document also discusses how to implement other methods to generate random numbers or integers that follow a given distribution (such as a normal, geometric, binomial, or weighted distribution) or fall within a given range.

<a id=RNG_Topics></a>
## RNG Topics

&nbsp;

<a id=How_to_Initialize_RNGs></a>
### How to Initialize RNGs

For cryptographic RNGs, an application SHOULD use only one thread-safe instance of the RNG for the entire application to use.

For statistical and seeded RNGs, to **reduce the chance of correlated random numbers or identical random number sequences**, an application is encouraged to create&mdash;
- one thread-safe instance of an RNG for the entire application to use, or
- one instance of an RNG for each thread of the application, where each instance&mdash;
    - is accessible to only one thread (such as with thread-local storage), and
    - is initialized with a seed that is unrelated to the other seeds (using sequential or linearly related seeds can cause [**undesirable correlations**](https://blogs.unity3d.com/2015/01/07/a-primer-on-repeatable-random-numbers/) in some PRNGs).

An application that generates **random numbers in parallel** can also do one or both of&mdash;

- using a different conforming RNG scheme for each instance, and
- using a conforming RNG scheme specially designed for parallel random number generation (such as so-called "splittable" PRNGs).

(Many questions on _Stack Overflow_ highlight the pitfalls of creating a new RNG instance each time a random number is needed, rather than only once in the application.  This is notably the case with the .NET generator `System.Random`.)

<a id=Shuffling></a>
### Shuffling

In a list with `N` different items, there are `N` factorial (that is, `1 * 2 * ... * N` or `N!`) ways to arrange the items in that list.  These ways are called _permutations_<sup>[**(13)**](#Note13)</sup>.

An application can **shuffle a list**&mdash;

- by generating a random integer at least 0 and less than the number of permutations, and converting that integer to a permutation, or
- by doing a [**Fisher&ndash;Yates shuffle**](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle) (which is unfortunately easy to mess up &mdash; see (Atwood)<sup>[**(14)**](#Note14)</sup> &mdash; and is implemented correctly in [**another document of mine**](https://peteroupc.github.io/randomfunc.html)).

Either way, however, if a PRNG's period is less than the number of permutations, then there are **some permutations that that PRNG can't choose** when it shuffles that list. (This is not the same as _generating_ all permutations of a list, which, for a list big enough, can't be done by any computer in a reasonable time.)

If an application uses PRNGs for shuffling purposes, it is encouraged to&mdash;

1. choose a PRNG with a state length `B` or greater, then
2. gather data with at least **`B` bits of** [**_entropy_**](#Nondeterministic_Sources_and_Seed_Generation) (randomness), then
3. [**generate a full-length seed**](#Seed_Generation) with the data gathered this way, then
4. pass the seed to the chosen PRNG, then
5. use the PRNG to do a Fisher&ndash;Yates shuffle.

Here, `B` can usually be calculated for different lists using the Python code in the [**appendix**](#Suggested_Entropy_Size); see also (van Staveren 2000, "Lack of randomness")<sup>[**(15)**](#Note15)</sup>.  For example, `B` is 226 bits for a 52-item list.  (However, if information security is not involved, an application can instead choose any number 256 or more for `B` and follow the steps above accordingly &mdash; for a list big enough, it's generally more important to have shuffles act random than to choose from among all permutations.)

The PRNG chosen this way SHOULD meet at least the quality requirements of a statistical RNG implementation and SHOULD have the highest feasible period for its state length.

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

A _hash function_ is a function that takes an arbitrary input of any size (such as an array of 8-bit bytes or a sequence of characters) and returns an output with a fixed number of bits. That output is also known as a _hash code_. (By definition, hash functions are deterministic<sup>[**(16)**](#Note16)</sup>.)

A hash code can be used as follows:
- The hash code can serve as a seed for a PRNG, and the desired random numbers can be generated from that PRNG.  (See my document on [**random number generation methods**](https://peteroupc.github.io/randomfunc.html) for techniques.)
- If a number of random bits is needed, and the hash code has at least that many bits, then that many bits can instead be taken directly from the hash code.

Useful properties of some hash functions include&mdash;

- the _avalanche property_ (every bit of the input affects every bit of the output without a clear preference for 0 or 1),
- _collision resistance_ (finding two different inputs that lead to a given output is cost-prohibitive), and
- the _one-way property_ (finding an unknown input that leads to a given output is cost-prohibitive) (see NIST SP 800-108).

Applications SHOULD choose hash functions with the avalanche property.  Hash functions used for information security SHOULD also have the collision resistance and one-way properties.

<a id=Motivation></a>
## Motivation

What has motivated me to write a more rigorous definition of random number generators is the fact that many applications still use weak RNGs.  In my opinion, this is largely because most popular programming languages today&mdash;
- specify few and weak requirements on RNGs (such as [**C's `rand`**](http://en.cppreference.com/w/cpp/numeric/random/rand)),
- specify a relatively weak general-purpose RNG (such as Java's `java.math.Random`, although it also includes a much stronger `SecureRandom` class),
- implement RNGs by default that leave something to be desired (particularly the Mersenne Twister algorithm found in PHP's `mt_rand` as well as in Python and Ruby),
- seed RNGs with a timestamp by default (such as the [**.NET Framework implementation of `System.Random`**](https://docs.microsoft.com/dotnet/api/system.random)), and/or
- leave the default seeding fixed (as is the case in [**MATLAB**](https://www.mathworks.com/help/matlab/examples/controlling-random-number-generation.html); see also the question titled "Matlab rand and c++ rand()" on _Stack Overflow_).

Many programming languages offer a general-purpose RNG (such as C's `rand` or Java's `java.util.Random`) and sometimes an RNG intended for information security purposes (such as `java.security.SecureRandom`).  Thus, a distinction between _statistical_ and _cryptographic_ RNGs seems natural.

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

<small><sup id=Note1>(1)</sup> If the software and/or hardware uses a nonuniform distribution, but otherwise meets this definition, it can be converted to use a uniform distribution, at least in theory, using _unbiasing_, _deskewing_, or _randomness extraction_ (see RFC 4086 sec. 4 or Cliff et al. 2009 for further discussion).</small>

<small><sup id=Note2>(2)</sup> Such arbitrary data can include process identifiers, time stamps, environment variables, random numbers, virtual machine guest identifiers, and/or other data specific to the session or to the instance of the RNG.  See also NIST SP800-90A and the references below.<br/>Everspaugh, A., Zhai, Y., et al.  "Not-So-Random Numbers in Virtualized Linux and the Whirlwind RNG", 2014.<br>Ristenpart, T., Yilek, S. "When Good Randomness Goes Bad: Virtual Machine Reset Vulnerabilities and Hedging Deployed Cryptography", 2010.</small>

<small><sup id=Note3>(3)</sup> Bernstein, D.J.  "Fast-key-erasure random number generators", Jun. 23, 2017.</small>

<small><sup id=Note4>(4)</sup> Jones, D., "Good Practice in (Pseudo) Random Number Generation for Bioinformatics Applications", 2007/2010.</small>

<small><sup id=Note5>(5)</sup> Widynski, B., "Middle Square Weyl Sequence RNG", arXiv:1704.00358v1 [cs.CR], 2017</small>

<small><sup id=Note6>(6)</sup> S. Vigna, "[**An experimental exploration of Marsaglia's `xorshift` generators, scrambled**](http://vigna.di.unimi.it/ftp/papers/xorshift.pdf)", 2016.</small>

<small><sup id=Note7>(7)</sup> Blackman, D., Vigna, S. "Scrambled Linear Pseudorandom Number Generators", 2018.</small>

<small><sup id=Note8>(8)</sup> Noise functions include functions that combine several outputs of a noise function, including by [**fractional Brownian motion**](https://en.wikipedia.org/wiki/Fractional_Brownian_motion).  By definition, noise functions are deterministic.</small>

<small><sup id=Note9>(9)</sup> Lenstra, A.K., Wesolowski, B. "A random zoo: sloth, unicorn, and trx", 2015.</small>

<small><sup id=Note10>(10)</sup> Boneh, D., Bonneau, J., et al. "Verifiable Delay Functions", 2018.</small>

<small><sup id=Note11>(11)</sup> M&uuml;ller, S. "CPU Time Jitter Based Non-Physical True Random Number Generator".</small>

<small><sup id=Note12>(12)</sup> Cliff, Y., Boyd, C., Gonzalez Nieto, J.  "How to Extract and Expand Randomness: A Summary and Explanation of Existing Results", 2009.</small>

<small><sup id=Note13>(13)</sup> More generally, a list has `N! / (W_1! * W_2! * ... * W_K!)` permutations (a [**multinomial coefficient**](http://mathworld.wolfram.com/MultinomialCoefficient.html)), where `N` is the list's size, `K` is the number of different items in the list, and `W_i` is the number of times the item identified by `i` appears in the list.  However, this number is never more than `N!` and suggests using less randomness, so an application need not use this more complicated formula and MAY assume that a list has `N!` permutations even if some of its items occur more than once.</small>

<small><sup id=Note14>(14)</sup> Atwood, Jeff. "[**The danger of na&iuml;vet&eacute;**](https://blog.codinghorror.com/the-danger-of-naivete/)".</small>

<small><sup id=Note15>(15)</sup> van Staveren, Hans. [**"Big Deal: A new program for dealing bridge hands"**](https://sater.home.xs4all.nl/doc.html), Sep. 8, 2000</small>

<small><sup id=Note16>(16)</sup> Note that although PRNGs can also act like hash functions (if they're seeded with the input and the PRNG is "large enough" for the input), some PRNGs (such as `xorshift128+`) are not well suited to serve as hash functions, because they don't mix their state before generating a random number from that state.</small>

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=Suggested_Entropy_Size></a>
### Suggested Entropy Size

The following Python code suggests how many bits of entropy are needed for shuffling.  For example:
- To shuffle an `n`-item list, the suggested bits of entropy is at least as high as the base-2 logarithm, rounded up, of `n!` (`stateLengthN(n)`).
- To shuffle a 52-item list, at least 226 bits of entropy is suggested (`stateLengthN(52)`).
- To shuffle two 52-item lists of identical contents together, at least 500 bits of entropy is suggested (`stateLengthDecks(2, 52)`).

&nbsp;

    from math import factorial as fac

    def ceillog2(x):
        """ Calculates base-2 logarithm, rounded up, of x. """
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

<a id=License></a>
## License

This page is licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
