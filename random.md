# Random Number Generator Recommendations for Applications

[**Peter Occil**](mailto:poccil14@gmail.com)

Begun on Mar. 5, 2016; last updated on Nov. 14, 2018.

Most apps that use random numbers care about either unpredictability, speed/high quality, or repeatability.  This article explains the three kinds of RNGs and gives recommendations on each kind.

<a id=Introduction_and_Summary></a>
## Introduction and Summary

Many applications rely on random number generators (RNGs); these RNGs include&mdash;

- _statistical RNGs_, which seek to generate numbers that follow a uniform random distribution,
- _cryptographic RNGs_, which seek to generate numbers that are cost-prohibitive to predict, and
- _seeded PRNGs_ (pseudorandom number generators), which generate numbers that "seem" random given an initial "seed".

A distinction between _statistical_ and _cryptographic_ RNGs seems natural, because many programming languages offer a general-purpose RNG (such as C's `rand` or Java's `java.util.Random`) and sometimes an RNG intended for information security purposes (such as `java.security.SecureRandom`).  However, for many programming languages, the built-in RNG offers little assurance of quality.

**This document covers:**

- Statistical and cryptographic RNGs, as well as recommendations on their use and properties.
- A discussion on when an application that needs numbers that "seem" random SHOULD specify their own "seed" (the initial state that the numbers are based on).
- Nondeterministic RNGs, entropy, and seed generation.
- An explanation of how to implement RNGs in programming code, including APIs that help in doing so.
- Issues on shuffling with an RNG.

**This document does not cover:**

- Testing an RNG implementation for correctness or adequate random number generation (e.g., Dörre and Klebanov 2016<sup>[**(1)**](#Note1)</sup>).
- Generation of random numbers or keying material based at least in part on a password (e.g. _key derivation functions_).
- Generation of random numbers that follow a nonuniform distribution; I discuss this topic in [**another document**](https://peteroupc.github.io/randomfunc.html).
- Low-discrepancy sequences (quasirandom sequences), such as Sobol sequences.  Their structure differs in an essential way from independent uniform random numbers.
- Applications for which the selection of RNGs is constrained by regulatory requirements.

**The following table summarizes the kinds of RNGs covered in this document:**

| Kind of RNG   | When to Use This RNG  | Examples |
 --------|--------|------|
| [**Cryptographic RNG**](#Cryptographic_RNGs)   | In information security cases, or when speed is not a concern.  | `/dev/urandom`, `BCryptGenRandom` |
| [**Statistical RNG**](#Statistical_RNGs)   | When information security is not a concern, but speed is. | `xoroshiro128+`, `xorshift128+` |
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
- [**Motivation**](#Motivation)
- [**Cryptographic RNGs**](#Cryptographic_RNGs)
    - [**Examples**](#Examples)
    - [**Resource-Constrained Devices**](#Resource_Constrained_Devices)
- [**Statistical RNGs**](#Statistical_RNGs)
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
- [**Existing RNG APIs in Programming Languages**](#Existing_RNG_APIs_in_Programming_Languages)
- [**RNG Topics**](#RNG_Topics)
    - [**How to Initialize RNGs**](#How_to_Initialize_RNGs)
    - [**Shuffling**](#Shuffling)
    - [**GPU Programming Environments**](#GPU_Programming_Environments)
- [**Hash Functions**](#Hash_Functions)
- [**Guidelines for New RNG APIs**](#Guidelines_for_New_RNG_APIs)
    - [**Cryptographic RNGs: Requirements**](#Cryptographic_RNGs_Requirements)
    - [**Statistical RNGs: Requirements**](#Statistical_RNGs_Requirements)
    - [**Implementing New RNG APIs**](#Implementing_New_RNG_APIs)
- [**Conclusion**](#Conclusion)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Suggested Entropy Size**](#Suggested_Entropy_Size)
- [**License**](#License)

<a id=Definitions></a>
## Definitions

The following definitions are helpful in better understanding this document.

- **Random number generator (RNG).** Software and/or hardware that seeks to generate independent numbers that seem to occur by chance and that are approximately uniformly distributed<sup>[**(2)**](#Note2)</sup>.
- **Pseudorandom number generator (PRNG).** A random number generator that outputs seemingly random numbers using a deterministic algorithm (that is, an algorithm that returns the same output for the same input and state every time), and in which its state can be initialized and possibly reinitialized with arbitrary data.
- **Seed.**  Arbitrary data for initializing the state of a PRNG.
- **State length.**  The maximum size of the seed a PRNG can take to initialize its state without shortening or compressing that seed.
- **Period.** The maximum number of values in a generated sequence for a PRNG before that sequence repeats.  The period will not be greater than 2<sup>_L_</sup> where _L_ is the PRNG's _state length_.
- **Stable.** A programming interface is _stable_ if it has no behavior that is unspecified, implementation-dependent, nondeterministic, or subject to future change.
- **Information security.** Defined in ISO/IEC 27000.
- **Nondeterministic source.** Data source that does not always return the same output for the same input.
- **MUST, SHOULD, SHOULD NOT, MAY, RECOMMENDED, NOT RECOMMENDED.**  As defined in RFC 2119 and RFC 8174.

<a id=Motivation></a>
## Motivation

Unfortunately, most popular programming languages today&mdash;

- specify few and weak requirements on their built-in RNGs (such as [**C's `rand`**](http://en.cppreference.com/w/cpp/numeric/random/rand)),
- specify a relatively weak general-purpose RNG (such as Java's `java.math.Random`, although it also includes a much stronger `SecureRandom` class),
- implement RNGs by default that leave something to be desired (such as Mersenne Twister),
- seed RNGs with a timestamp by default (such as the [**.NET Framework implementation of `System.Random`**](https://docs.microsoft.com/dotnet/api/system.random)), and/or
- use fixed seeds by default in their RNGs (as is the case in [**MATLAB**](https://www.mathworks.com/help/matlab/examples/controlling-random-number-generation.html) and C; see also the question titled "Matlab rand and c++ rand()" on _Stack Overflow_),

so that as a result, many applications use RNGs, especially built-in RNGs, that have little assurance of high quality or security.  That is why this document includes a more rigorous definition of RNGs, and also suggests [**existing RNGs**](#Existing_RNG_APIs_in_Programming_Languages) an application could consider using.

<a id=Cryptographic_RNGs></a>
## Cryptographic RNGs

Cryptographic RNGs (also known as "cryptographically strong" or "cryptographically secure" RNGs) seek to generate random numbers that are cost-prohibitive to predict.  Cryptographic RNGs are RECOMMENDED for applications that use random numbers for information security, such as&mdash;

-  generating keying material, such as encryption keys,
-  generating random passwords, nonces, or session identifiers,
-  generating "salts" to vary hash codes of the same password,
-  use in communications between two networked computers (including in data transfer, data transport, and messaging), and
-  cases (such as in multiplayer networked games) when predicting future random numbers would give a player or user a significant and unfair advantage,

as well as for applications that generate random numbers so infrequently that the RNG's speed is not a concern.

See "[**Cryptographic RNGs: Requirements**](#Cryptographic_RNGs_Requirements)" for requirements.

<a id=Examples></a>
### Examples

Examples of cryptographic RNG implementations include the following:
- The `/dev/urandom` device on many Unix-based operating systems<sup>[**(3)**](#Note3)</sup>.
- The `BCryptGenRandom` method in Windows 7 and later.
- Two-source extractors, multi-source extractors, or cryptographic [**hash functions**](#Hash_Functions) that take very hard-to-predict signals from two or more nondeterministic sources as input.
- A "fast-key-erasure" random number generator described by D.J. Bernstein in his blog (Bernstein 2017)<sup>[**(4)**](#Note4)</sup>.
- An RNG implementation complying with NIST SP 800-90A.  The SP 800-90 series goes into further detail on how RNGs appropriate for information security can be constructed, and inspired much of the "Cryptographic RNGs" section.

<a id=Resource_Constrained_Devices></a>
### Resource-Constrained Devices

Compared to general-purpose computing devices such as desktop computers and smartphones, resource-constrained devices ("embedded" devices) are much less likely to have a cryptographic RNG available (Wetzels 2017)<sup>[**(5)**](#Note5)</sup>, although methods exist for implementing a cryptographic RNG on the Arduino (Peng 2017)<sup>[**(6)**](#Note6)</sup>.

<a id=Statistical_RNGs></a>
## Statistical RNGs

Statistical RNGs are RNGs with a high quality of statistical randomness, but are not necessarily appropriate for information security.

An application SHOULD NOT use RNGs with weaker quality than that of statistical RNGs.

An application SHOULD NOT use statistical RNGs in information security contexts, and it SHOULD NOT use them unless it generates random numbers so frequently that it would slow down undesirably if a cryptographic RNG were used instead.

See "[**Statistical RNGs: Requirements**](#Statistical_RNGs_Requirements)" for requirements.

<a id=Examples_and_Non_Examples></a>
### Examples and Non-Examples

Examples of statistical RNGs include the following:
- [**xoshiro256&#x2a;&#x2a;**](http://xoshiro.di.unimi.it/xoshiro256starstar.c) (state length 256 bits; nonzero seed).
- [**xoroshiro128&#x2a;&#x2a;**](http://xoshiro.di.unimi.it/xoroshiro128starstar.c) (state length 128 bits; nonzero seed).
- `Lehmer64` and `Lehmer128` (for each: state length 128 bits; odd seed, so effectively 127 bits state length).
- XorShift\* 128/64 (state length 128 bits; nonzero seed).
- XorShift\* 64/32 (state length 64 bits; nonzero seed).
- `JKISS`, `JKISS32`, `JLKISS`, `JLKISS64`, described in (Jones 2007/2010)<sup>[**(7)**](#Note7)</sup>.
- C++'s [**`std::ranlux48` engine**](http://www.cplusplus.com/reference/random/ranlux48/) (state length 577 bits; nonzero seed).
- PCG (`pcg32`, `pcg64`, and `pcg64_fast` classes), by Melissa O'Neill. See also a [**critique by S. Vigna**](http://pcg.di.unimi.it/pcg.php).
- Other examples include B. Jenkins's "A small noncryptographic PRNG" (sometimes called `jsf`), C. Doty-Humphrey's `sfc`, `msws` (Widynski 2017)<sup>[**(8)**](#Note8)</sup>, and D. Blackman's `gjrand`.

The following also count as statistical RNGs, but are not preferred:
- Mersenne Twister shows a [**systematic failure**](http://xoroshiro.di.unimi.it/#quality) in `BigCrush`'s LinearComp test. (See also (Vigna 2016)<sup>[**(9)**](#Note9)</sup>.)
- [**`xoroshiro128+`**](http://xoshiro.di.unimi.it/xoroshiro128plus.c), `xoshiro256+`, and `xorshift128+`.  As described by (Blackman and Vigna 2018)<sup>[**(10)**](#Note10)</sup>, these linear PRNGs use weak scramblers, so that each output's lowest bits have low linear complexity even though the output as a whole has excellent statistical randomness.  See also [**"Testing lowest bits in isolation"**](http://xoshiro.di.unimi.it/lowcomp.php).

Non-examples include the following:
- Any [**linear congruential generator**](https://en.wikipedia.org/wiki/Linear_congruential_generator) with modulus 2<sup>63</sup> or less (such as `java.util.Random` and C++'s `std::minstd_rand` and `std::minstd_rand0` engines) has a _state length_ of less than 64 bits.
- `System.Random`, as implemented in the .NET Framework 4.7, can take a seed of at most 32 bits, so has a state length of at most 32 bits.

<a id=Seeded_PRNGs></a>
## Seeded PRNGs

Some applications (such as simulations, machine learning, and some games) use pseudorandom number generators (PRNGs) to generate apparently "random" numbers starting from a known initial state, or "seed". Such applications usually care about repeatable "randomness". (Note that in the definitions for [**cryptographic**](#Cryptographic_RNGs) and [**statistical**](#Statistical_RNGs) RNGs given earlier, the PRNGs involved are automatically seeded before use.)

<a id=When_to_Use_a_Seeded_PRNG></a>
### When to Use a Seeded PRNG

By using a seeded PRNG for repeatable "randomness", an application will be tied to that PRNG or its implementation. For this reason, an application SHOULD NOT use a seeded PRNG (rather than an automatically-initialized PRNG or another kind of RNG) unless&mdash;

1. the application might need to generate the same "random" result multiple times,
2. the application either&mdash;
    - makes the seed (or a "code" or "password" based on the seed) accessible to the user, or
    - finds it impractical to store or distribute the "random" numbers or results (rather than the seed) for later use, such as&mdash;
        - by saving the result to a file,
        - by storing the "random" numbers for the feature generating the result to "replay" later, or
        - by distributing the "random" numbers or results to networked users as they are generated, and
3. any feature that uses such a PRNG to generate that "random" result will remain backward compatible with respect to the "random" results it generates, for as long as that feature is still in use by the application.

> **Note:** Meeting statement 3 is aided by using _stable_ PRNGs; see [**"Definitions"**](#Definitions) and the following examples:
>
> - [**`java.util.Random`**](https://docs.oracle.com/javase/8/docs/api/java/util/Random.html) is stable.
> - The C [**`rand` method**](http://en.cppreference.com/w/cpp/numeric/random/rand) is not stable (because the algorithm it uses is unspecified).
> - C++'s random number distribution classes, such as [**`std::uniform_int_distribution`**](http://en.cppreference.com/w/cpp/numeric/random/uniform_int_distribution), are not stable (because the algorithms they use are implementation-defined according to the specification).
> - .NET's [**`System.Random`**](https://docs.microsoft.com/dotnet/api/system.random) is not stable (because its generation behavior could change in the future).

<a id=Which_Seeded_PRNG_to_Use></a>
### Which Seeded PRNG to Use

If an application decides to use a seeded PRNG for repeatable "randomness", that PRNG SHOULD meet or exceed the requirements of a [**statistical RNG**](#Statistical_RNGs) (except the seed is application-defined instead) and SHOULD be reasonably fast.

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

1.  **_Procedural noise_** is generated using a _noise function_, which is a function that outputs seemingly random numbers given an _n_-dimensional point and, optionally, additional data (such as gradients or hash values).<sup>[**(11)**](#Note11)</sup>  Procedural noise includes [**cellular noise**](https://en.wikipedia.org/wiki/Cellular_noise), [**value noise**](https://en.wikipedia.org/wiki/Value_noise), and [**gradient noise**](https://en.wikipedia.org/wiki/Gradient_noise) (such as [**Perlin noise**](https://en.wikipedia.org/wiki/Perlin_noise)).  As much as possible, procedural noise implementations SHOULD **use an RNG to generate the additional data** for the noise function in advance.  If using a [**custom-seeded PRNG**](#When_to_Use_a_Seeded_PRNG) is appropriate for the application, the additional data MAY be **"hard-coded"** instead.  If the noise function **incorporates a** [**_hash function_**](#Hash_Functions), that hash function SHOULD be reasonably fast, be _stable_ (see [**"Definitions"**](#Definitions)), and have the so-called _avalanche property_.

2.  **_Nonprocedural noise_** is generated using the help of an RNG.  Nonprocedural noise includes [**colored noise**](https://en.wikipedia.org/wiki/Colors_of_noise) (including white noise and pink noise), periodic noise, and noise following a Gaussian or other [**probability distribution**](https://peteroupc.github.io/randomfunc.html#Specific_Non_Uniform_Distributions).  For nonprocedural noise, the same considerations apply to any RNGs the noise implementation uses as in cases not involving noise.

<a id=Verifiable_Random_Numbers></a>
#### Verifiable Random Numbers

_Verifiable random numbers_ are random numbers (such as seeds for PRNGs) that are disclosed along with all the information necessary to verify their generation.  Usually, such information includes random numbers and/or uncertain data to be determined and publicly disclosed in the future.  Generating verifiable randomness has been described in [**RFC 3797**](https://www.rfc-editor.org/rfc/rfc3797.txt), in (Lenstra et al., 2015)<sup>[**(12)**](#Note12)</sup>, in (Boneh et al., 2018)<sup>[**(13)**](#Note13)</sup> (which introduces the concept of _verifiable delay functions_, functions whose output deliberately takes time to compute but is easy to verify), and elsewhere.

<a id=Nondeterministic_Sources_and_Seed_Generation></a>
## Nondeterministic Sources and Seed Generation

RNGs ultimately rely on nondeterministic sources to generate random numbers.  Such sources are used to help generate a _seed_ for a PRNG, for example.  The best nondeterministic sources for this purpose are those whose output is very hard to predict.

<a id=Examples_of_Nondeterministic_Sources></a>
### Examples of Nondeterministic Sources

Examples of nondeterministic sources are&mdash;

- disk access timings,
- timings of keystrokes and/or other input device interactions,
- thermal noise,
- the output of assembly instructions specially dedicated to random number generation, such as RdSeed,
- the output generated with A. Seznec's technique called hardware volatile entropy gathering and expansion (HAVEGE), provided a high-resolution counter is available, and
- differences between two high-resolution counter values taken in quick succession (such as in "Jitter RNG"; see (M&uuml;ller)<sup>[**(14)**](#Note14)</sup>).

RFC 4086, "Randomness Requirements for Security", section 3, contains a survey of nondeterministic sources.

> **Notes:**
>
> 1. Online services that make random numbers available to applications, as well as outputs of audio and video devices (see RFC 4086 sec. 3.2.1), are additional nondeterministic sources.  However, online services require Internet or other network access, and some of them require access credentials.  Also, many mobile operating systems require applications to declare network, camera, and microphone access to users upon installation.  For these reasons, these kinds of sources are NOT RECOMMENDED if other approaches are adequate.
> 2. For noncryptographic RNGs, timestamps from the system clock are commonly used.  Timestamps with millisecond or coarser granularity are not encouraged, however, because multiple instances of a PRNG automatically seeded with a timestamp, when they are created at about the same time, run the risk of starting with the same seed and therefore generating the same sequence of random numbers.
> 3. For general-purpose use, nondeterministic sources that enable many high-quality seeds per second to be generated are highly advantageous, especially for a cryptographic RNG.

<a id=Entropy></a>
### Entropy

_Entropy_ is a value that describes how hard it is to predict a nondeterministic source's output, compared to ideal random data; this is generally the size in bits of the ideal random data.  (For example, a 64-bit output with 32 bits of entropy is as hard to predict as an ideal random 32-bit data block.)  NIST SP 800-90B recommends _min-entropy_ as the entropy measure.  Characterizing a nondeterministic source's entropy is nontrivial and beyond the scope of this document.  See also RFC 4086 section 2.

<a id=Seed_Generation></a>
### Seed Generation

In general, especially for cryptographic RNGs, **to generate an N-bit seed, enough data needs to be gathered from nondeterministic sources to reach N bits of entropy or more**.

Once data with enough entropy is gathered, it might need to be condensed into a seed to initialize a PRNG with. Following (Cliff et al., 2009)<sup>[**(15)**](#Note15)</sup>, it is suggested to generate an N-bit seed by using an HMAC (hash-based message authentication code), with outputs at least N times 3 bits long, on data with at least N times 3 bits of entropy, then truncating the output to N bits.  See also NIST SP 800-90B sec. 3.1.5.1 and RFC 4086 sec. 4.2 and 5.2.

<a id=Existing_RNG_APIs_in_Programming_Languages></a>
## Existing RNG APIs in Programming Languages

As much as possible, **applications SHOULD use existing libraries and techniques** that already meet the requirements for cryptographic and statistical RNGs. The following table lists application programming interfaces (APIs) for such RNGs for popular programming languages.

- Methods and libraries mentioned in the "Statistical" column need to be initialized with a seed before use (for example, a seed generated using an implementation in the "Cryptographic" column).
- The mention of a third-party library in this section does not imply sponsorship or endorsement of that library, or imply a preference of that library over others. The list is not comprehensive.
- See also [**Paragon's blog post**](https://paragonie.com/blog/2016/05/how-generate-secure-random-numbers-in-various-programming-languages) on existing cryptographic RNGs.

| Language   | Cryptographic   | Statistical |
 --------|-----------------------------------------------|------|
| .NET (incl. C# and VB.NET) (H) | `RNGCryptoServiceProvider` in `System.Security.Cryptography` namespace | [**airbreather/AirBreather.Common library**](https://github.com/airbreather/Airbreather.Common) (XorShift1024Star, XorShift128Plus, XoroShiro128Plus) |
| C/C++ (G)  | (C) | [**`xoroshiro128plus.c`**](http://xoroshiro.di.unimi.it/xoroshiro128plus.c) (128-bit nonzero seed); [**`xorshift128plus.c`**](http://xoroshiro.di.unimi.it/xorshift128plus.c) (128-bit nonzero seed); [**frostburn/jkiss**](https://github.com/frostburn/jkiss) library |
| Python (A) | `secrets.SystemRandom` (since Python 3.6); `os.urandom()`| `pypcg` package; [**ihaque/xorshift**](https://github.com/ihaque/xorshift) library (128-bit nonzero seed; default seed uses `os.urandom()`) |
| Java (A) (D) | (C); `java.security.SecureRandom` (F) |  [**grunka/xorshift**](https://github.com/grunka/xorshift) (`XORShift1024Star` or `XORShift128Plus`); [**jenetics/prngine**](https://github.com/jenetics/prngine) (`KISS32Random`, `KISS64Random`) |
| JavaScript (B) | `crypto.randomBytes(byteCount)` (node.js only); `random-number-csprng` package (node.js only); `crypto.getRandomValues()` (Web) | `pcg-random` or `xoroshiro128starstar` package |
| Ruby (A) (E) | (C); `SecureRandom.rand()` (ranges from 0 to 1 exclusive) (E); `SecureRandom.rand(N)` (integer) (E) (for both, `require 'securerandom'`); `sysrandom` gem |  |
| PHP (A) | `random_int()`, `random_bytes()` (both since PHP 7) |  |
| Go | `crypto/rand` package |  |

<small>(A) The general RNGs of Python and Ruby implement [**Mersenne Twister**](https://en.wikipedia.org/wiki/Mersenne_Twister), which is not preferred for a statistical RNG.  PHP's `mt_rand()` implements or implemented a flawed version of Mersenne Twister. `prngine`, a Java library, also has `MT19937_32Random`, `MT19937_64Random` classes that implement Mersenne Twister.</small>

<small>(B) JavaScript's `Math.random()` (which ranges from 0 to 1 exclusive) is implemented using `xorshift128+` (or a variant) in the V8 engine, Firefox, and certain other modern browsers as of late 2017; `Math.random()` uses an "implementation-dependent algorithm or strategy", though (see ECMAScript sec. 20.2.2.27).</small>

<small>(C) A cryptographic RNG implementation can&mdash;
   - read from the `/dev/urandom` device in most Unix-based systems (using the `open` and `read` system calls where available),
   - call the `getentropy` method on OpenBSD, or
   - call the `BCryptGenRandom` API in Windows 7 and later,</small>

<small>and only use other techniques if the existing ones are inadequate for the application.</small>

<small>(D) Java's `java.util.Random` class uses a 48-bit seed, so doesn't meet the statistical RNG requirements.  However, a subclass of `java.util.Random` might be implemented to meet those requirements.</small>

<small>(E) Ruby's `Random#rand` and `SecureRandom.rand` methods present a beautiful and simple API for random number generation, in my opinion.  Namely, `rand()` returns a number from 0 to 1 exclusive, and `rand(N)` returns an integer from 0 to N exclusive.</small>

<small>(F) Calling the `setSeed` method of `SecureRandom` before use is RECOMMENDED. The data passed to the method SHOULD be data described in note (C). (Despite the name, `setSeed` _supplements_ the existing seed, according to the documentation.)  See also (Klyubin 2013)<sup>[**(16)**](#Note16)</sup>.</small>

<small>(G) [**`std::random_device`**](http://en.cppreference.com/w/cpp/numeric/random/random_device), introduced in C++11, is NOT RECOMMENDED because its specification leaves considerably much to be desired.  For example,  `std::random_device` can fall back to a pseudorandom number generator of unspecified quality without much warning.  At best, `std::random_device` SHOULD only be used to supplement other techniques for random number generation.</small>

<small>(H) The .NET Framework's `System.Random` class uses a seed of at most 32 bits, so doesn't meet the statistical RNG requirements.  However, a subclass of `System.Random` might be implemented to meet those requirements.</small>

<a id=RNG_Topics></a>
## RNG Topics

&nbsp;

<a id=How_to_Initialize_RNGs></a>
### How to Initialize RNGs

For cryptographic RNGs, an application SHOULD use only one thread-safe instance of the RNG for the entire application to use.

For statistical and seeded RNGs, to **reduce the chance of correlated random numbers or identical random number sequences**, an application is encouraged to create&mdash;
- one thread-safe instance of an RNG for the entire application to use, or
- one instance of an RNG for each thread of the application, where each instance&mdash;
    - is accessible to only one thread (such as with thread-local storage),
    - is initialized with a seed that is unrelated to the other seeds (using sequential or linearly related seeds can cause [**undesirable correlations**](https://blogs.unity3d.com/2015/01/07/a-primer-on-repeatable-random-numbers/) in some PRNGs), and
    - MAY use a different conforming RNG scheme from the others.

(Many questions on _Stack Overflow_ highlight the pitfalls of creating a new RNG instance each time a random number is needed, rather than only once in the application.  This is notably the case with the .NET generator `System.Random`.)

<a id=Shuffling></a>
### Shuffling

In a list with `N` different items, there are `N` factorial (that is, `1 * 2 * ... * N`, or `N!`) ways to arrange the items in that list.  These ways are called _permutations_<sup>[**(17)**](#Note17)</sup>.

An application can **shuffle a list**&mdash;

- by generating a random integer at least 0 and less than the number of permutations, and converting that integer to a permutation, or
- by doing a [**Fisher&ndash;Yates shuffle**](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle) (which is unfortunately easy to mess up &mdash; see (Atwood)<sup>[**(18)**](#Note18)</sup> &mdash; and is implemented correctly in [**another document of mine**](https://peteroupc.github.io/randomfunc.html)).

Either way, however, if a PRNG's period is less than the number of permutations, then there are **some permutations that that PRNG can't choose** when it shuffles that list. (This is not the same as _generating_ all permutations of a list, which, for a list big enough, can't be done by any computer in a reasonable time.)

On the other hand, for a list big enough, it's generally **more important to have shuffles act random** than to choose from among all permutations.

An application that shuffles a list can do the shuffling&mdash;

1. using a cryptographic RNG, preferably one with a security strength of `B` or greater, or
2. if a noncryptographic RNG is otherwise appropriate, using a PRNG that&mdash;
    - has a state length of `B` or greater,
    - is initialized with a seed derived from data with at least **`B` bits of** [**_entropy_**](#Nondeterministic_Sources_and_Seed_Generation), or "randomness", and
    - qualifies as a statistical RNG except it uses a seed derived as given above.

Here, `B` can usually be calculated for different lists using the Python code in the [**appendix**](#Suggested_Entropy_Size); see also (van Staveren 2000, "Lack of randomness")<sup>[**(19)**](#Note19)</sup>.  For example, `B` is 226 bits for a 52-item list.  An application MAY limit `B` to 256 or greater, in cases when variety of permutations is not important.

<a id=GPU_Programming_Environments></a>
### GPU Programming Environments

In general, GL Shading Language (GLSL) and other programming environments designed for execution on a graphics processing unit (GPU) are stateless (they take data in and give data out without storing any state themselves), so random number generators for such environments are often designed as [**hash functions**](#Hash_Functions), because their output is determined solely by the input rather than both the input and state (as with PRNGs).

However, some of the hash functions which have been written in GLSL give undesirable results in computers whose GPUs support only 16-bit binary floating point numbers and no other kinds of numbers, which makes such GPUs an important consideration when choosing a hash function.

<a id=Hash_Functions></a>
## Hash Functions

A seemingly random number can be generated from arbitrary data using a _hash function_.

A _hash function_ is a function that takes an arbitrary input of any size (such as an array of 8-bit bytes or a sequence of characters) and returns an output with a fixed number of bits. That output is also known as a _hash code_. (By definition, hash functions are deterministic<sup>[**(20)**](#Note20)</sup>.)

A hash code can be used as follows:
- The hash code can serve as a seed for a PRNG, and the desired random numbers can be generated from that PRNG.  (See my document on [**random number generation methods**](https://peteroupc.github.io/randomfunc.html) for techniques.)
- If a number of random bits is needed, and the hash code has at least that many bits, then that many bits can instead be taken directly from the hash code.

Useful properties of some hash functions include&mdash;

- the _avalanche property_ (every bit of the input affects every bit of the output without a clear preference for 0 or 1),
- _collision resistance_ (finding two different inputs that lead to a given output is cost-prohibitive), and
- the _one-way property_ (finding an unknown input that leads to a given output is cost-prohibitive) (see NIST SP 800-108).

Hash functions not used for information security SHOULD have the avalanche property (e.g, MurmurHash3, xxHash, CityHash).  Hash functions used for information security SHOULD have the collision resistance, avalanche, and one-way properties (e.g., SHA2-256, BLAKE2).

<a id=Guidelines_for_New_RNG_APIs></a>
## Guidelines for New RNG APIs

This section contains guidelines for those seeking to implement RNGs designed for wide reuse (such as in a programming language's standard library).  _As mentioned earlier, an application SHOULD use existing RNG implementations whenever possible._

This section contains suggested requirements on cryptographic and statistical RNGs that a new programming language can choose to adopt.

<a id=Cryptographic_RNGs_Requirements></a>
### Cryptographic RNGs: Requirements

A cryptographic RNG generates uniformly distributed random bits such that it would be cost-prohibitive for an outside party to correctly guess, with more than a 50% chance per bit, prior or future unseen outputs of that RNG after knowing how the RNG works and/or extremely many outputs of the RNG, or prior unseen outputs of that RNG after knowing the RNG's internal state at the given point in time.

If a cryptographic RNG implementation uses a PRNG, the following requirements apply.

1. The PRNG's _state length_ MUST be at least 128 bits and SHOULD be at least 256 bits.  The _security strength_ used by the RNG MUST be at least 112 bits, SHOULD be at least 128 bits, and is less than or equal to the PRNG's _state length_.

2. Before an instance of the RNG generates a random number, it MUST have been initialized ("seeded") with a seed defined as follows. The seed&mdash;
    - MUST have as many bits as the PRNG's _state length_,
    - MUST consist of data that ultimately derives from the output of one or more [**nondeterministic sources**](#Nondeterministic_Sources_and_Seed_Generation), where the output is at least as hard to predict as ideal random data with as many bits as the _security strength_, and
    - MAY be mixed with arbitrary data other than the seed as long as the result is no easier to predict<sup>[**(21)**](#Note21)</sup>.

3. The RNG SHOULD reseed itself from time to time, using a newly generated seed as described earlier.  If the RNG reseeds if it would generate more than a threshold number of bits without reseeding, that threshold SHOULD be 2<sup>67</sup> or less.

<a id=Statistical_RNGs_Requirements></a>
### Statistical RNGs: Requirements

A statistical RNG generates random bits, each of which is uniformly distributed independently of the other bits, at least for nearly all practical purposes.  If the implementation uses a PRNG, that PRNG algorithm MUST either satisfy the _collision resistance_ property or be significantly more likely than not to pass all tests (other than MatrixRank and LinearComp) of `BigCrush`, part of L'Ecuyer and Simard's "TestU01". The RNG need not be perfectly equidistributed.

If a statistical RNG implementation uses a PRNG, the following requirements apply.

1. The PRNG's _state length_ MUST be at least 64 bits, SHOULD be at least 128 bits, and is encouraged to be as high as the implementation can go to remain reasonably fast for most applications.

2. Before an instance of the RNG generates a random number, it MUST have been initialized ("seeded") with a seed described as follows. The seed&mdash;
    - MUST have as many bits as the PRNG's _state length_,
    - MUST consist of data that ultimately derives from the output of one or more [**nondeterministic sources**](#Nondeterministic_Sources_and_Seed_Generation) and/or cryptographic RNGs, where the output is encouraged to cover a state space of at least as many bits as the PRNG's _state length_, and
    - MAY be mixed with arbitrary data other than the seed.

3. The RNG MAY reseed itself from time to time, using a newly generated seed as described earlier.  If the RNG reseeds if it would generate more than a threshold number of values without reseeding, that threshold SHOULD be the PRNG's period's square root or less.

<a id=Implementing_New_RNG_APIs></a>
### Implementing New RNG APIs

A **programming language API** designed for reuse by applications could implement RNGs using the following guidelines:

1.  The RNG API can include a method that fills one or more memory units (such as 8-bit bytes) completely with random bits (see example 1).
2.  If the API implements an automatically-initialized RNG, it SHOULD NOT allow applications to initialize that same RNG with a seed for repeatable "randomness"<sup>[**(22)**](#Note22)</sup> (it MAY provide a separate PRNG to accept such a seed). See example 2.
3.  If the API provides a PRNG that an application can seed for repeatable "randomness", that PRNG SHOULD be _stable_ and documented, and so SHOULD any methods the API provides that use that PRNG (such as shuffling and Gaussian number generation). See example 2.
4.  My document on [**random number generation methods**](https://peteroupc.github.io/randomfunc.html) includes details on ten uniform random number methods. In my opinion, a new programming language's **standard library** ought to include those ten methods separately for cryptographic and for statistical RNGs.

> **Examples:**
>
> 1. A C language RNG method for filling memory could look like the following: `int random(uint8_t[] bytes, size_t size);`, where `bytes` is a pointer to an array of 8-bit bytes, and `size` is the number of random 8-bit bytes to generate, and where 0 is returned if the method succeeds and nonzero otherwise.
> 2. A Java API that follows these guidelines can contain two classes: a `RandomGen` class that implements an unspecified but general-purpose RNG, and a `RandomStable` class that implements a PCG PRNG that is documented and will not change in the future. `RandomStable` includes a constructor that takes a seed for repeatable "randomness", while `RandomGen` does not.  Both classes include methods to generate uniform random numbers, but `RandomStable` specifies the exact algorithms to those methods and `RandomGen` does not.  At any time in the future, `RandomGen` can change its implementation to use a different RNG while remaining backward compatible, while `RandomStable` has to use the same algorithms for all time to remain backward compatible, especially because it takes a seed for repeatable "randomness".

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

<small><sup id=Note1>(1)</sup> F. Dörre and V. Klebanov, "Practical Detection of Entropy Loss in Pseudo-Random Number Generators", 2016.</small>

<small><sup id=Note2>(2)</sup> If the software and/or hardware uses a nonuniform distribution, but otherwise meets this definition, it can be converted to use a uniform distribution, at least in theory, using _unbiasing_, _deskewing_, or _randomness extraction_ (see RFC 4086 sec. 4 or Cliff et al. 2009 for further discussion).</small>

<small><sup id=Note3>(3)</sup> Using the similar `/dev/random` is NOT RECOMMENDED, since in some implementations it can block for seconds at a time, especially if not enough randomness is available.  See also [**"Myths about /dev/urandom"**](https://www.2uo.de/myths-about-urandom).</small>

<small><sup id=Note4>(4)</sup> Bernstein, D.J.  "Fast-key-erasure random number generators", Jun. 23, 2017.</small>

<small><sup id=Note5>(5)</sup> Wetzels, J., "33C3: Analyzing Embedded Operating System Random Number Generators", samvartaka.github.io, Jan. 3, 2017.</small>

<small><sup id=Note6>(6)</sup> B. Peng, "Two Fast Methods of Generating True Random Numbers on the Arduino", GitHub Gist, December 2017.</small>

<small><sup id=Note7>(7)</sup> Jones, D., "Good Practice in (Pseudo) Random Number Generation for Bioinformatics Applications", 2007/2010.</small>

<small><sup id=Note8>(8)</sup> Widynski, B., "Middle Square Weyl Sequence RNG", arXiv:1704.00358v1 [cs.CR], 2017.</small>

<small><sup id=Note9>(9)</sup> S. Vigna, "[**An experimental exploration of Marsaglia's `xorshift` generators, scrambled**](http://vigna.di.unimi.it/ftp/papers/xorshift.pdf)", 2016.</small>

<small><sup id=Note10>(10)</sup> Blackman, D., Vigna, S. "Scrambled Linear Pseudorandom Number Generators", 2018.</small>

<small><sup id=Note11>(11)</sup> Noise functions include functions that combine several outputs of a noise function, including by [**fractional Brownian motion**](https://en.wikipedia.org/wiki/Fractional_Brownian_motion).  By definition, noise functions are deterministic.</small>

<small><sup id=Note12>(12)</sup> Lenstra, A.K., Wesolowski, B. "A random zoo: sloth, unicorn, and trx", 2015.</small>

<small><sup id=Note13>(13)</sup> Boneh, D., Bonneau, J., et al. "Verifiable Delay Functions", 2018.</small>

<small><sup id=Note14>(14)</sup> M&uuml;ller, S. "CPU Time Jitter Based Non-Physical True Random Number Generator".</small>

<small><sup id=Note15>(15)</sup> Cliff, Y., Boyd, C., Gonzalez Nieto, J.  "How to Extract and Expand Randomness: A Summary and Explanation of Existing Results", 2009.</small>

<small><sup id=Note16>(16)</sup> A. Klyubin, "Some SecureRandom Thoughts", Android Developers Blog, Aug. 14, 2013.</small>

<small><sup id=Note17>(17)</sup> More generally, a list has `N! / (W_1! * W_2! * ... * W_K!)` permutations (a [**multinomial coefficient**](http://mathworld.wolfram.com/MultinomialCoefficient.html)), where `N` is the list's size, `K` is the number of different items in the list, and `W_i` is the number of times the item identified by `i` appears in the list.  However, this number is never more than `N!` and suggests using less randomness, so an application need not use this more complicated formula and MAY assume that a list has `N!` permutations even if some of its items occur more than once.</small>

<small><sup id=Note18>(18)</sup> Atwood, Jeff. "[**The danger of na&iuml;vet&eacute;**](https://blog.codinghorror.com/the-danger-of-naivete/)".</small>

<small><sup id=Note19>(19)</sup> van Staveren, Hans. [**"Big Deal: A new program for dealing bridge hands"**](https://sater.home.xs4all.nl/doc.html), Sep. 8, 2000</small>

<small><sup id=Note20>(20)</sup> Note that although PRNGs can also act like hash functions (if they're seeded with the input and the PRNG is "large enough" for the input), some PRNGs (such as `xorshift128+`) are not well suited to serve as hash functions, because they don't mix their state before generating a random number from that state.</small>

<small><sup id=Note21>(21)</sup> Such arbitrary data can include process identifiers, time stamps, environment variables, random numbers, virtual machine guest identifiers, and/or other data specific to the session or to the instance of the RNG.  See also NIST SP800-90A and the references below.<br/>Everspaugh, A., Zhai, Y., et al.  "Not-So-Random Numbers in Virtualized Linux and the Whirlwind RNG", 2014.<br>Ristenpart, T., Yilek, S. "When Good Randomness Goes Bad: Virtual Machine Reset Vulnerabilities and Hedging Deployed Cryptography", 2010.</small>

<small><sup id=Note22>(22)</sup> Allowing applications to do so would hamper forward compatibility &mdash; the API would then be less free to change how the RNG is implemented in the future (e.g., to use a cryptographic or otherwise "better" RNG), or to make improvements or bug fixes in methods that use that RNG (such as shuffling and Gaussian number generation).  (As a notable example, the V8 JavaScript engine recently changed its `Math.random()` implementation to use a variant of `xorshift128+`, which is backward compatible because nothing in JavaScript allows  `Math.random()` to be seeded.)  Nevertheless, APIs can still allow applications to provide additional input ("entropy") to the RNG in order to increase its randomness rather than to ensure repeatability.</small>

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
