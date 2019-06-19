# Random Number Generator Recommendations for Applications

[**Peter Occil**](mailto:poccil14@gmail.com)

Begun on Mar. 5, 2016; last updated on June 19, 2019.

Most apps that use random numbers care about either unpredictability, speed/high quality, or repeatability.  This article explains the three kinds of RNGs and gives recommendations on each kind.

<a id=Introduction_and_Summary></a>
## Introduction and Summary

Many applications rely on random number generators (RNGs);
however, it's not enough for random numbers to merely "look random".  But unfortunately, most popular programming languages today&mdash;

- specify few and weak requirements on their built-in RNGs (such as [**C's `rand`**](http://en.cppreference.com/w/cpp/numeric/random/rand)),
- specify a relatively weak general-purpose RNG (such as Java's `java.math.Random`),
- implement RNGs by default that leave something to be desired (such as Mersenne Twister),
- initialize RNGs with a timestamp by default (such as the [**.NET Framework implementation of `System.Random`**](https://docs.microsoft.com/dotnet/api/system.random)), and/or
- use RNGs that are initialized with a fixed value by default (as is the case in [**MATLAB**](https://www.mathworks.com/help/matlab/examples/controlling-random-number-generation.html) and C; see also the question titled "Matlab rand and c++ rand()" on _Stack Overflow_),

so that as a result, many applications use RNGs, especially built-in RNGs, that have little assurance of high quality or security.   That is why this document discusses high-quality RNGs and suggests [**existing implementations**](#Existing_RNG_APIs_in_Programming_Languages) of them.

**This document covers:**

- Statistical and cryptographic RNGs<sup>[**(1)**](#Note1)</sup> and seeded PRNGs (pseudorandom number generators), as well as recommendations on their use and properties.
- A discussion on when an application that needs numbers that "seem" random ought to specify its own "seed" (the initial state that the numbers are based on).
- Nondeterministic sources, entropy, and seed generation.
- Existing implementations of RNGs.
- Guidance for implementations of RNGs designed for reuse by applications.
- Issues on shuffling with an RNG.

**This document does not cover:**

- Testing an RNG implementation for correctness or adequate random number generation (e.g., Dörre and Klebanov 2016<sup>[**(2)**](#Note2)</sup>).
- Generation of random numbers or keying material based at least in part on a password (e.g. _key derivation functions_).
- Generation of random numbers that follow a nonuniform distribution; I discuss this topic in [**another document**](https://peteroupc.github.io/randomfunc.html).
- Low-discrepancy sequences (quasirandom sequences), such as Sobol sequences.  Their structure differs in an essential way from independent uniform random numbers.
- Applications for which the selection of RNGs is limited by regulatory requirements.

**The following table summarizes the kinds of RNGs covered in this document:**

| Kind of RNG   | When to Use This RNG  | Examples |
 --------|--------|------|
| A [**cryptographic RNG**](#Cryptographic_RNGs) seeks to generate numbers that are cost-prohibitive to predict. | In information security cases, or when speed is not a concern.  | `/dev/urandom`, `BCryptGenRandom` |
| A [**statistical RNG**](#Statistical_RNGs) seeks to generate numbers that are uniformly random for most practical purposes.   | When information security is not a concern, but speed is. | `pcg64`, `xoshiro256**` |
| A [**seeded PRNG**](#Seeded_PRNGs) generates numbers that "seem" random given an initial "seed".   | When generating reproducible "randomness" in a way not practical otherwise.   | High-quality PRNG with custom seed |

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
    - [**Examples**](#Examples)
    - [**A Note on Resource-Constrained Devices**](#A_Note_on_Resource_Constrained_Devices)
- [**Statistical RNGs**](#Statistical_RNGs)
    - [**Examples and Non-Examples**](#Examples_and_Non_Examples)
- [**Seeded PRNGs**](#Seeded_PRNGs)
    - [**When to Use a Seeded PRNG**](#When_to_Use_a_Seeded_PRNG)
    - [**Seeded PRNG Recommendations**](#Seeded_PRNG_Recommendations)
    - [**Seeded PRNG Use Cases**](#Seeded_PRNG_Use_Cases)
        - [**Games**](#Games)
        - [**Unit Tests**](#Unit_Tests)
        - [**Noise**](#Noise)
        - [**Verifiable Random Numbers**](#Verifiable_Random_Numbers)
- [**Nondeterministic Sources and Seed Generation**](#Nondeterministic_Sources_and_Seed_Generation)
    - [**Examples of Nondeterministic Sources**](#Examples_of_Nondeterministic_Sources)
    - [**Entropy**](#Entropy)
    - [**Seed Generation**](#Seed_Generation)
    - [**Wildly Varying Seeds**](#Wildly_Varying_Seeds)
- [**Existing RNG APIs in Programming Languages**](#Existing_RNG_APIs_in_Programming_Languages)
- [**RNG Topics**](#RNG_Topics)
    - [**How to Initialize RNGs**](#How_to_Initialize_RNGs)
    - [**Shuffling**](#Shuffling)
    - [**Unique Random Identifiers**](#Unique_Random_Identifiers)
    - [**GPU Programming Environments**](#GPU_Programming_Environments)
    - [**Determinism and Consistency**](#Determinism_and_Consistency)
- [**Hash Functions**](#Hash_Functions)
- [**Guidelines for New RNG APIs**](#Guidelines_for_New_RNG_APIs)
    - [**Cryptographic RNGs: Requirements**](#Cryptographic_RNGs_Requirements)
    - [**Statistical RNGs: Requirements**](#Statistical_RNGs_Requirements)
    - [**Designs for PRNGs**](#Designs_for_PRNGs)
    - [**Implementing New RNG APIs**](#Implementing_New_RNG_APIs)
- [**Acknowledgments**](#Acknowledgments)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Suggested Entropy Size**](#Suggested_Entropy_Size)
- [**License**](#License)

<a id=Definitions></a>
## Definitions

The following definitions are helpful in better understanding this document.

- **Random number generator (RNG).** Software and/or hardware that seeks to generate independent numbers that seem to occur by chance and that are approximately uniformly distributed<sup>[**(3)**](#Note3)</sup>.
- **Pseudorandom number generator (PRNG).** A random number generator that outputs seemingly random numbers using a deterministic algorithm (that is, an algorithm that returns the same output for the same input and state every time), and in which its state can be initialized and possibly reinitialized with arbitrary data.
- **Seed.**  Arbitrary data for initializing the state of a PRNG.
- **State length.**  The maximum size of the seed a PRNG can take to initialize its state without shortening or compressing that seed.
- **Information security.** Keeping information safe from attacks that could access, use, delay, or manipulate that information.<sup>[**(4)**](#Note4)</sup>
- **MUST, SHOULD, SHOULD NOT, MAY, RECOMMENDED, NOT RECOMMENDED.**  These terms have the meanings given in RFC 2119 and RFC 8174.

<a id=Cryptographic_RNGs></a>
## Cryptographic RNGs

Cryptographic RNGs (also known as "cryptographically strong" or "cryptographically secure" RNGs) seek to generate random numbers that not only "look random", but are cost-prohibitive to predict.  Cryptographic RNGs are RECOMMENDED for applications that use random numbers for information security, such as&mdash;

-  generating keying material, such as encryption keys,
-  generating random passwords, nonces, or session identifiers,
-  generating "salts" to vary hash codes of the same password,
-  sending or receiving messages or other data securely between computers, and
-  cases (such as in multiplayer networked games) when predicting future random numbers would give a player or user a significant and unfair advantage,

as well as for applications that generate random numbers so infrequently that the RNG's speed is not a concern.

See "[**Cryptographic RNGs: Requirements**](#Cryptographic_RNGs_Requirements)" for requirements, and see "[**Existing RNG APIs in Programming Languages**](#Existing_RNG_APIs_in_Programming_Languages)" for existing APIs.

<a id=Examples></a>
### Examples

Examples of cryptographic RNG implementations are:
- Randomness extractors or cryptographic [**hash functions**](#Hash_Functions) that take very hard-to-predict signals from two or more [**nondeterministic sources**](#Nondeterministic_Sources_and_Seed_Generation) as input.
- A "fast-key-erasure" random number generator described by D.J. Bernstein in his blog (Bernstein 2017)<sup>[**(5)**](#Note5)</sup>.
- An RNG implementation complying with NIST SP 800-90A.  The SP 800-90 series goes into further detail on how RNGs appropriate for information security can be constructed, and inspired much of the "Cryptographic RNGs" section.
- An RNG made up of two or more independently initialized cryptographic RNGs.<sup>[**(6)**](#Note6)</sup>

<a id=A_Note_on_Resource_Constrained_Devices></a>
### A Note on Resource-Constrained Devices

Compared to general-purpose computing devices such as desktop computers and smartphones, resource-constrained devices ("embedded" devices) are much less likely to have a cryptographic RNG available (Wetzels 2017)<sup>[**(7)**](#Note7)</sup>, although methods exist for implementing a cryptographic RNG on the Arduino (Peng 2017)<sup>[**(8)**](#Note8)</sup>.

<a id=Statistical_RNGs></a>
## Statistical RNGs

Statistical RNGs are RNGs with a high quality of statistical randomness, but are not necessarily appropriate for information security.  Even here, though, the numbers delivered by a statistical RNG not only "look random".

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
- `JKISS`, `JKISS32`, `JLKISS`, `JLKISS64`, described in (Jones 2007/2010)<sup>[**(9)**](#Note9)</sup>.
- C++'s [**`std::ranlux48` engine**](http://www.cplusplus.com/reference/random/ranlux48/) (state length 577 bits; nonzero seed).
- PCG (`pcg32`, `pcg64`, and `pcg64_fast` classes), by Melissa O'Neill. See also a [**critique by S. Vigna**](http://pcg.di.unimi.it/pcg.php).
- Other examples include B. Jenkins's "A small noncryptographic PRNG" (sometimes called `jsf`), C. Doty-Humphrey's `sfc`, `msws` (Widynski 2017)<sup>[**(10)**](#Note10)</sup>, and D. Blackman's `gjrand`.

The following also count as statistical RNGs, but are not preferred:
- Mersenne Twister shows a [**systematic failure**](http://xoroshiro.di.unimi.it/#quality) in `BigCrush`'s LinearComp test. (See also (Vigna 2016)<sup>[**(11)**](#Note11)</sup>.)
- [**`xoroshiro128+`**](http://xoshiro.di.unimi.it/xoroshiro128plus.c), `xoshiro256+`, and `xorshift128+`.  As described by (Blackman and Vigna 2018)<sup>[**(12)**](#Note12)</sup>, these linear PRNGs use weak scramblers, so that each output's lowest bits have low linear complexity even though the output as a whole has excellent statistical randomness.  See also [**"Testing lowest bits in isolation"**](http://xoshiro.di.unimi.it/lowcomp.php).

Non-examples include the following:
- Any [**linear congruential generator**](https://en.wikipedia.org/wiki/Linear_congruential_generator) with modulus 2<sup>63</sup> or less (such as `java.util.Random` and C++'s `std::minstd_rand` and `std::minstd_rand0` engines) has a _state length_ of less than 64 bits.
- `System.Random`, as implemented in the .NET Framework 4.7, can take a seed of at most 32 bits, so has a state length of at most 32 bits.

<a id=Seeded_PRNGs></a>
## Seeded PRNGs

Some applications (such as simulations, machine learning, and some games) use pseudorandom number generators (PRNGs) to generate apparently "random" numbers starting from a known initial state, or "seed". Such applications usually care about repeatable "randomness". (Note that in the definitions for [**cryptographic**](#Cryptographic_RNGs_Requirements) and [**statistical**](#Statistical_RNGs_Requirements) RNGs given later, the PRNGs involved are automatically seeded before use.)

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
3. any feature that uses such a PRNG to generate that "random" result will be deterministic and consistent (see "Determinism and Consistency") for as long as that feature is still in use by that application.

<a id=Seeded_PRNG_Recommendations></a>
### Seeded PRNG Recommendations

If an application chooses to use a seeded PRNG for repeatable "randomness", the application&mdash;

- SHOULD choose a PRNG that meets or exceeds the requirements of a [**statistical RNG**](#Statistical_RNGs) (except the seed is application-defined instead),
- SHOULD choose a PRNG implementation with consistent behavior that will not change in the future,
- ought to document the chosen PRNG being used as well as all the parameters for that PRNG,
- ought to generate seeds for the PRNG that are likely to vary wildly from previous seeds, and
- SHOULD NOT seed the PRNG with floating-point numbers or generate floating-point numbers with that PRNG.

For example, an application could implement a seeded PRNG using a third-party library that specifically says it implements an algorithm mentioned in the [**statistical RNG examples**](#Examples_and_Non_Examples), and could initialize that PRNG using a bit sequence from a cryptographic RNG (see "[**Wildly Varying Seeds**](#Wildly_Varying_Seeds)").  The developers could also mention the use of the specific PRNG chosen on any code that uses it, to alert other developers that the PRNG needs to remain unchanged.

<a id=Seeded_PRNG_Use_Cases></a>
### Seeded PRNG Use Cases

Custom seeds can come into play in the following situations, among others.

<a id=Games></a>
#### Games

Many kinds of games generate game content based on apparent randomness, such as&mdash;

- procedurally generated maps for a role-playing game,
- [**shuffling**](#Shuffling) a digital deck of cards for a solitaire game, or
- a game board or puzzle board that normally varies every session,

where the game might need to generate the same content of that kind multiple times.

In general, such a game SHOULD NOT use a PRNG with a custom seed for such purposes unless&mdash;

1. generating the random content uses relatively many random numbers (say, more than a few thousand), and the application finds it impractical to store or distribute the content or the numbers for later use (this is often the case for maps with random procedural terrain, but not for puzzle game boards or card shuffling), or
2. the game makes the seed (or a "code" or "password" based on the seed, such as a barcode or a string of letters and digits) accessible to the player, to allow the player to regenerate the content.

> **Example:** Suppose a game generates a map with random terrain and shows the player a "code" to generate that map. In this case, the game&mdash;
>
> - MAY change the algorithm it uses to generate random maps, but
> - SHOULD use, in connection with the new algorithm, "codes" that can't be confused with "codes" it used for previous algorithms, and
> - SHOULD continue to generate the same random map using an old "code" when the player enters it, even after the change to a new algorithm.

<a id=Unit_Tests></a>
#### Unit Tests

A custom seed is appropriate when unit testing a method that uses a seeded PRNG in place of another kind of RNG for the purpose of the test (provided the test is deterministic and consistent).

<a id=Noise></a>
#### Noise

_Noise_ is a randomized variation in images, sound, and other data.  (See also Red Blob Games, [**"Noise Functions and Map Generation"**](http://www.redblobgames.com/articles/noise/introduction.html)).  For the purposes of RNG recommendations, there are two kinds of noise:

1.  **_Procedural noise_** is generated using a _noise function_, which is a function that takes an _n_-dimensional point and, optionally, additional data such as gradients or hash values, and outputs a seemingly random number.<sup>[**(13)**](#Note13)</sup>  Procedural noise includes [**cellular noise**](https://en.wikipedia.org/wiki/Cellular_noise), [**value noise**](https://en.wikipedia.org/wiki/Value_noise), and [**gradient noise**](https://en.wikipedia.org/wiki/Gradient_noise) (such as [**Perlin noise**](https://en.wikipedia.org/wiki/Perlin_noise)).  The same instance of a procedural noise implementation SHOULD NOT output different "random" numbers when given the same _n_-dimensional point.  Such an instance SHOULD be initialized either with "hard-coded" data only or RNG-generated data.

2.  **_Nonprocedural noise_** is generated using the help of an RNG.  Nonprocedural noise includes [**colored noise**](https://en.wikipedia.org/wiki/Colors_of_noise) (including white noise and pink noise), periodic noise, and noise following a Gaussian or other [**probability distribution**](https://peteroupc.github.io/randomfunc.html#Specific_Non_Uniform_Distributions).  For nonprocedural noise, the same considerations apply to any RNGs the noise implementation uses as in cases not involving noise.

<a id=Verifiable_Random_Numbers></a>
#### Verifiable Random Numbers

_Verifiable random numbers_ are random numbers (such as seeds for PRNGs) that are disclosed along with all the information necessary to verify their generation.  Usually, such information includes random numbers and/or uncertain data to be determined and publicly disclosed in the future.  Generating verifiable randomness has been described in [**RFC 3797**](https://www.rfc-editor.org/rfc/rfc3797.txt), in (Lenstra et al., 2015)<sup>[**(14)**](#Note14)</sup>, in (Boneh et al., 2018)<sup>[**(15)**](#Note15)</sup> (which introduces the concept of _verifiable delay functions_, functions whose output deliberately takes time to compute but is easy to verify), and elsewhere.

<a id=Nondeterministic_Sources_and_Seed_Generation></a>
## Nondeterministic Sources and Seed Generation

To generate random numbers, RNGs ultimately rely on _nondeterministic sources_, that is, sources that don't return the same output for the same input every time.  Such sources are used to help generate a _seed_ for a PRNG, for example.  The best nondeterministic sources for this purpose are those whose output is very hard to predict.

<a id=Examples_of_Nondeterministic_Sources></a>
### Examples of Nondeterministic Sources

Examples of nondeterministic sources are&mdash;

- disk access timings,
- timings of keystrokes and/or other input device interactions,
- thermal noise,
- the output of assembly instructions specially dedicated to random number generation, such as RdSeed,
- the output generated with A. Seznec's technique called hardware volatile entropy gathering and expansion (HAVEGE), provided a high-resolution counter is available, and
- differences between two high-resolution counter values taken in quick succession (such as in "Jitter RNG"; see (M&uuml;ller)<sup>[**(16)**](#Note16)</sup>).

RFC 4086, "Randomness Requirements for Security", section 3, contains a survey of nondeterministic sources.

> **Note:** Online services that make random numbers available to applications, as well as outputs of audio and video devices (see RFC 4086 sec. 3.2.1, (Liebow-Feeser 2017a)<sup>[**(17)**](#Note17)</sup>, and  (Liebow-Feeser 2017b)<sup>[**(18)**](#Note18)</sup>), are additional nondeterministic sources.  However, online services require Internet or other network access, and some of them require access credentials.  Also, many mobile operating systems require applications to declare network, camera, and microphone access to users upon installation.  For these reasons, these kinds of sources are NOT RECOMMENDED if other approaches are adequate.

<a id=Entropy></a>
### Entropy

_Entropy_ is a value that describes how hard it is to predict a nondeterministic source's output, compared to ideal random data; this is generally the size in bits of the ideal random data.  (For example, a 64-bit output with 32 bits of entropy is as hard to predict as an ideal random 32-bit data block.)  NIST SP 800-90B recommends _min-entropy_ as the entropy measure.  Characterizing a nondeterministic source's entropy is nontrivial and beyond the scope of this document.  See also RFC 4086 section 2.

<a id=Seed_Generation></a>
### Seed Generation

In general, especially for cryptographic RNGs, **to generate an N-bit seed, enough data needs to be gathered from nondeterministic sources to reach N bits of entropy or more**.

Once data with enough entropy is gathered, it might need to be condensed into a seed to initialize a PRNG with. Following (Cliff et al., 2009)<sup>[**(19)**](#Note19)</sup>, it is suggested to generate an N-bit seed using an HMAC (hash-based message authentication code) at least N times 3 bits long; in that sense, take data with at least as many bits of entropy as the HMAC size in bits, generate the HMAC with that data, then take the HMAC's first N bits.  See also NIST SP 800-90B sec. 3.1.5.1 and RFC 4086 sec. 4.2 and 5.2.

<a id=Wildly_Varying_Seeds></a>
### Wildly Varying Seeds

For noncryptographic and seeded PRNGs, an application ought to generate seeds likely to vary wildly from previously generated seeds, to reduce the risk of correlated "random" numbers or sequences.  In this sense, the following kinds of seeds are preferred, from most to least:

1. A bit sequence from a cryptographic RNG.
2. A seed extracted from hard-to-predict sources (see "Seed Generation" above).
3. A hash generated using several timestamps and additional data chosen by the application.  Here, timestamps with finer than millisecond granularity (including CPU cycle counters) are preferred.
4. A hash generated using a sequential counter and additional data chosen by the application.
5. A hash of one or more timestamps.
6. A hash of a sequential counter.
7. A timestamp with finer than millisecond granularity.

It is NOT RECOMMENDED to seed a PRNG (especially several at once) with sequential counters, linearly related numbers, or timestamps with millisecond or coarser granularity, since these kinds of seeds can cause undesirable correlations in some PRNGs or introduce the risk of generating the same "random" sequence accidentally<sup>[**(20)**](#Note20)</sup>.

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
| Ruby (A) (E) | (C); `SecureRandom.rand()` (0 or greater and less than 1) (E); `SecureRandom.rand(N)` (integer) (E) (for both, `require 'securerandom'`); `sysrandom` gem |  |
| PHP (A) | `random_int()`, `random_bytes()` (both since PHP 7) |  |
| Go | `crypto/rand` package |  |
| Other Languages | (C) |  |

<small>(A) The general RNGs of recent versions of Python and Ruby implement [**Mersenne Twister**](https://en.wikipedia.org/wiki/Mersenne_Twister), which is not preferred for a statistical RNG.  PHP's `mt_rand()` implements or implemented a flawed version of Mersenne Twister. `prngine`, a Java library, also has `MT19937_32Random` and `MT19937_64Random` classes that implement Mersenne Twister.</small>

<small>(B) JavaScript's `Math.random()` (which ranges 0 or greater and less than 1) is implemented using `xorshift128+` (or a variant) in the V8 engine, Firefox, and certain other modern browsers as of late 2017; `Math.random()` uses an "implementation-dependent algorithm or strategy", though (see ECMAScript sec. 20.2.2.27).</small>

<small>(C) A cryptographic RNG implementation can&mdash;
   - read from the `/dev/urandom` device in Linux-based systems (using the `open` and `read` system calls where available)<sup>[**(21)**](#Note21)</sup>,
   - call the `arc4random` or `arc4random_buf` method on FreeBSD or macOS, or
   - call the `getentropy` method on OpenBSD, or
   - call the `BCryptGenRandom` API in Windows 7 and later,</small>

<small>and only use other techniques if the existing ones are inadequate for the application.</small>

<small>(D) Java's `java.util.Random` class uses a 48-bit seed, so doesn't meet the statistical RNG requirements.  However, a subclass of `java.util.Random` might be implemented to meet those requirements.</small>

<small>(E) Ruby's `Random#rand` and `SecureRandom.rand` methods present a beautiful and simple API for random number generation, in my opinion.  Namely, `rand()` returns a number 0 or greater and less than 1, and `rand(N)` returns an integer 0 or greater and less than N.</small>

<small>(F) Calling the `setSeed` method of `SecureRandom` before use is RECOMMENDED. The data passed to the method SHOULD be data described in note (C). (Despite the name, `setSeed` _supplements_ the existing seed, according to the documentation.)  See also (Klyubin 2013)<sup>[**(22)**](#Note22)</sup>.  Using the `SecureRandom` implementation `"SHA1PRNG"` is NOT RECOMMENDED, because of weaknesses in seeding and RNG quality in implementations as of 2013 (Michaelis et al., 2013)<sup>[**(23)**](#Note23)</sup>.</small>

<small>(G) [**`std::random_device`**](http://en.cppreference.com/w/cpp/numeric/random/random_device), introduced in C++11, is NOT RECOMMENDED because its specification leaves considerably much to be desired.  For example,  `std::random_device` can fall back to a pseudorandom number generator of unspecified quality without much warning.  At best, `std::random_device` SHOULD NOT be used except to supplement other techniques for random number generation.</small>

<small>(H) The .NET Framework's `System.Random` class uses a seed of at most 32 bits, so doesn't meet the statistical RNG requirements.  However, a subclass of `System.Random` might be implemented to meet those requirements.</small>

<a id=RNG_Topics></a>
## RNG Topics

This section discusses several important points on the use and selection of RNGs, including things to consider when shuffling, generating "unique" random numbers, or initializing RNGs.

<a id=How_to_Initialize_RNGs></a>
### How to Initialize RNGs

For **cryptographic RNGs**, an application SHOULD use only one thread-safe instance of the RNG for the entire application to use.

For **statistical RNGs**, an application SHOULD use only one thread-safe instance of the RNG for the entire application to use.  (If doing so is a performance bottleneck for the application and a PRNG is used, the application MAY instead create one or more RNG instances as described below for seeded PRNGs.)

For **seeded PRNGs**, to **reduce the chance of correlated random numbers or identical random number sequences**, an application is encouraged to create one or more instances of a PRNG, where each instance&mdash;
- is accessible to only one thread, task, or subtask of the application (such as with thread-local storage),
- is initialized with a seed that is unrelated to the other seeds (see "[**Wildly Varying Seeds**](#Wildly_Varying_Seeds)"), and
- MAY use a different conforming RNG scheme from the others.

(L'Ecuyer et al. 2015)<sup>[**(24)**](#Note24)</sup>, section 4, goes in greater detail on ways to initialize PRNGs for generating random numbers in parallel, including how to ensure repeatable "randomness" this way if that is desired.

<a id=Shuffling></a>
### Shuffling

In a list with `N` different items, there are `N` factorial (that is, `1 * 2 * ... * N`, or `N!`) ways to arrange the items in that list.  These ways are called _permutations_<sup>[**(25)**](#Note25)</sup>.

An application can **shuffle a list**&mdash;

- by generating a random integer at least 0 and less than the number of permutations, and converting that integer to a permutation, or
- by doing a [**Fisher&ndash;Yates shuffle**](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle) (which is unfortunately easy to mess up &mdash; see (Atwood 2007)<sup>[**(26)**](#Note26)</sup> &mdash; and is implemented correctly in [**another document of mine**](https://peteroupc.github.io/randomfunc.html)).

Either way, however, if a PRNG's period is less than the number of permutations, then there are **some permutations that that PRNG can't choose** when it shuffles that list. (This is not the same as _generating_ all permutations of a list, which, for a list big enough, can't be done by any computer in a reasonable time.  A PRNG's _period_ is the maximum size of a "random" number sequence it can generate before that sequence repeats; this size is no greater than 2<sup>L</sup> where L is the PRNG's state length.)

On the other hand, for a list big enough, it's generally **more important to have shuffles act random** than to choose from among all permutations.

An application that shuffles a list can do the shuffling&mdash;

1. using a cryptographic RNG, preferably one with a security strength of `B` bits or greater, or
2. if a noncryptographic RNG is otherwise appropriate, using a PRNG that&mdash;
    - has a state length of `B` bits or greater, and
    - qualifies as a statistical RNG except it's initialized with a seed derived from data with at least **`B` bits of** [**_entropy_**](#Nondeterministic_Sources_and_Seed_Generation), or "randomness".

For shuffling purposes, `B` can usually be calculated for different lists using the Python code in the [**appendix**](#Suggested_Entropy_Size); see also (van Staveren 2000, "Lack of randomness")<sup>[**(27)**](#Note27)</sup>.  For example, `B` is 226 (bits) for a 52-item list.  For shuffling purposes, an application MAY limit `B` to 256 or greater, in cases when variety of permutations is not important.

<a id=Unique_Random_Identifiers></a>
### Unique Random Identifiers

Some applications require generating unique identifiers, especially to identify database records or other shared resources.  Such identifiers include auto-incremented numbers, sequentially assigned numbers, random numbers, and combinations of these.  Whenever practical, an application SHOULD NOT treat an identifier as uniquely identifying a resource unless&mdash;

- it checks that identifier for uniqueness within the desired scope and range, or
- it generates that identifier in a way that ensures uniqueness of identifiers within that scope and range.

An application can generate unique (not necessarily random) `B`-bit integers&mdash;

- using a `B`-bit counter (monotonically increasing number),
- using a `B`-bit counter with one or more reversible operations applied to it, or
- using a so-called "full-period" PRNG (which can be a [**linear congruential generator**](https://en.wikipedia.org/wiki/Linear_congruential_generator)) that has a state length of `B` bits and outputs `B`-bit integers<sup>[**(28)**](#Note28)</sup>.

An application that generates unique random identifiers SHOULD do so by combining&mdash;

- a _unique_ `B`-bit integer, generated in a way mentioned above, with
- a _random_ `C`-bit integer generated using a cryptographic RNG with a security strength of at least `C` bits, where `C` SHOULD be 128 or greater.

(In general, generating only the random integer this way can't ensure uniqueness by itself, but might be acceptable for applications that can tolerate the risk of generating duplicate random integers this way, or for applications that check that random integer for uniqueness.<sup>[**(29)**](#Note29)</sup>)

<a id=GPU_Programming_Environments></a>
### GPU Programming Environments

In general, GL Shading Language (GLSL) and other programming environments designed for execution on a graphics processing unit (GPU) are stateless (they read from and write to data without storing any state themselves).  Approaches that have been used for random number generation in GPU environments include&mdash;

- stateless functions (see "[**Designs for PRNGs**](#Designs_for_PRNGs)")<sup>[**(30)**](#Note30)</sup>, and
- sampling "noise textures" with random data in each pixel (Peters 2016)<sup>[**(31)**](#Note31)</sup>.

(L'Ecuyer et al. 2015)<sup>[**(32)**](#Note32)</sup> discusses parallel generation of random numbers using PRNGs, especially on GPUs.

<a id=Determinism_and_Consistency></a>
### Determinism and Consistency

For an RNG algorithm to generate "random" numbers that are reproducible across computers, it needs to be both _deterministic_ and _consistent_.  (These factors are only important for seeded PRNGs, not necessarily for cryptographic or statistical RNGs.)

An algorithm is _deterministic_ if it delivers the same output given the same input every time.  An algorithm that relies on behavior that may change outside its control (such as accessing the file system or the computer's clock) is not deterministic (e.g., because the time may be different on each run, or other programs may read and write to the same files the algorithm does).

An algorithm is _consistent_ if the output it delivers, given the same input, is the same&mdash;

- across time,
- across different executions of the algorithm,
- across versions of the application that uses the algorithm,
- across supported hardware, and
- across supported operating systems.

In practice, however, it's not easy to ensure an algorithm (especially an RNG) is both deterministic and consistent.  There are many ways an algorithm can be nondeterministic or inconsistent.  For example, different results can happen because&mdash;

- parallel operations can finish in a different order (see "[**Keras documentation**](https://keras.io/getting-started/faq/#how-can-i-obtain-reproducible-results-using-keras-during-development)"),
- items can be assigned differently to hash table buckets,
- mathematical operations on floating-point numbers can be carried out in a different order (and can lead to different results if rounding occurs after each operation), or
- floating-point numbers and math operations on such numbers can subtly differ across software and hardware implementations (for example, the IEEE 754 floating-point number standard does not require delivering as-accurate-as-possible results for many math functions it defines &mdash; see, for example, the x87 `FSIN` instruction and the difference between `Math` and `StrictMath` in Java).

[**`java.util.Random`**](https://docs.oracle.com/javase/8/docs/api/java/util/Random.html) is one example of a PRNG with deterministic and consistent behavior, but none of the following is such a PRNG:

- The C [**`rand` method**](http://en.cppreference.com/w/cpp/numeric/random/rand), as well as C++'s random number distribution classes, such as [**`std::uniform_int_distribution`**](http://en.cppreference.com/w/cpp/numeric/random/uniform_int_distribution), use implementation-defined algorithms for random number generation.
- .NET's [**`System.Random`**](https://docs.microsoft.com/dotnet/api/system.random) has random number generation behavior that could change in the future.

<a id=Hash_Functions></a>
## Hash Functions

A seemingly random number can be generated from arbitrary data using a _hash function_.

A _hash function_ is a function that takes an arbitrary input of any size (such as an array of 8-bit bytes or a sequence of characters) and returns an output with a fixed number of bits. That output is also known as a _hash code_. (By definition, hash functions are deterministic<sup>[**(33)**](#Note33)</sup>.)

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

1. The PRNG's _state length_ MUST be at least 128 bits and SHOULD be at least 256 bits.  The _security strength_ used by the RNG MUST be at least 128 bits and SHOULD be less than or equal to the PRNG's _state length_.

2. Before an instance of the RNG generates a random number, it MUST have been initialized ("seeded") with a seed described as follows. The seed&mdash;
    - MUST have as many bits as the PRNG's _state length_,
    - MUST consist of data that ultimately derives from the output of one or more [**nondeterministic sources**](#Nondeterministic_Sources_and_Seed_Generation), where the output is at least as hard to predict as ideal random data with as many bits as the _security strength_, and
    - MAY be mixed with arbitrary data other than the seed as long as the result is no easier to predict<sup>[**(34)**](#Note34)</sup>.

3. The RNG SHOULD reseed itself from time to time, using a newly generated seed as described earlier.  If the RNG reseeds if it would generate more than a threshold number of bits without reseeding, that threshold SHOULD be 2<sup>67</sup> or less.

<a id=Statistical_RNGs_Requirements></a>
### Statistical RNGs: Requirements

A statistical RNG generates random bits, each of which is uniformly distributed independently of the other bits, at least for nearly all practical purposes outside of information security.  If the implementation uses a PRNG, that PRNG algorithm MUST either satisfy the _collision resistance_ property or be significantly more likely than not to pass all tests (other than MatrixRank and LinearComp) of `BigCrush`, part of L'Ecuyer and Simard's "TestU01". The RNG need not be perfectly equidistributed.

If a statistical RNG implementation uses a PRNG, the following requirements apply.

1. The PRNG's _state length_ MUST be at least 64 bits, SHOULD be at least 128 bits, and is encouraged to be as high as the implementation can go to remain reasonably fast for most applications.

2. Before an instance of the RNG generates a random number, it MUST have been initialized ("seeded") with a seed described as follows. The seed&mdash;
    - MUST have as many bits as the PRNG's _state length_,
    - MUST consist of data that ultimately derives from the output of one or more [**nondeterministic sources**](#Nondeterministic_Sources_and_Seed_Generation) and/or cryptographic RNGs, where the output is encouraged to cover a state space of at least as many bits as the PRNG's _state length_, and
    - MAY be mixed with arbitrary data other than the seed.

3. The RNG MAY reseed itself from time to time, using a newly generated seed as described earlier.  If the RNG reseeds if it would generate more than a threshold number of values without reseeding, that threshold SHOULD be 2<sup>L</sup> or less, where _L_ is the PRNG's state length.

<a id=Designs_for_PRNGs></a>
### Designs for PRNGs

There are several possible ways to implement a PRNG:

1. As an object that uses an internal state and the following methods:
    - An initializer method that takes a seed and converts it to an internal state.  This method is called while generating the PRNG object.
    - A method that takes no parameters.  It uses only the internal state to output one or more "random" numbers and update the internal state.  This method is available after the initializer is called.
2. As a function that takes a seed and outputs one or more "random" numbers.  An example is a [**hash function**](#Hash_Functions).
3. As a function that takes an internal state and outputs one or more "random" numbers.  This can be used if the application has its own logic for converting a seed to an internal state appropriate for the PRNG.
4. As a function that takes an internal state and outputs a new internal state and one or more "random" numbers.  This is how PRNGs can be implemented as so-called "pure functions" in functional programming languages (as in the package `AC-Random` for the Haskell language).

Of the designs just given, the first is _stateful_ and the last three are _stateless functions_.

<a id=Implementing_New_RNG_APIs></a>
### Implementing New RNG APIs

A **programming language API** designed for reuse by applications could implement RNGs using the following guidelines:

1.  The RNG API can include a method that fills one or more memory units (such as 8-bit bytes) completely with random bits.  See example 1.
2.  If the API implements an automatically-initialized RNG, it SHOULD NOT allow applications to initialize that same RNG with a seed for repeatable "randomness"<sup>[**(35)**](#Note35)</sup> (it MAY provide a separate PRNG to accept such a seed). See example 2.
3.  If the API provides a PRNG that an application can seed for repeatable "randomness", it SHOULD document that PRNG and any methods the API provides that use that PRNG (such as shuffling and Gaussian number generation), and SHOULD NOT change that PRNG or those methods in a way that would change the "random" numbers they deliver for a given seed. See example 2.
4.  A new programming language's **standard library** ought to include the following methods for generating independent uniform random numbers (see my document on [**random number generation methods**](https://peteroupc.github.io/randomfunc.html) for details).
    - Four methods for random integers: 0 to `n` including `n`, 0 to `n` excluding `n`, `a` to `b` including `b`, and `a` to `b` excluding `b`.
    - Four methods for random numbers bounded by 0 and 1, with and without the endpoints.
    - Four methods for random numbers bounded by `a` and `b`, with and without the endpoints.

&nbsp;

> **Examples:**
>
> 1. A C language RNG method for filling memory could look like the following: `int random(uint8_t[] bytes, size_t size);`, where `bytes` is a pointer to an array of 8-bit bytes, and `size` is the number of random 8-bit bytes to generate, and where 0 is returned if the method succeeds and nonzero otherwise.
> 2. A Java API that follows these guidelines can contain two classes: a `RandomGen` class that implements an unspecified but general-purpose RNG, and a `RandomStable` class that implements a PCG PRNG that is documented and will not change in the future. `RandomStable` includes a constructor that takes a seed for repeatable "randomness", while `RandomGen` does not.  Both classes include methods to generate uniform random numbers, but `RandomStable` specifies the exact algorithms to those methods and `RandomGen` does not.  At any time in the future, `RandomGen` can change its implementation to use a different RNG while remaining backward compatible, while `RandomStable` has to use the same algorithms for all time to remain backward compatible, especially because it takes a seed for repeatable "randomness".

<a id=Acknowledgments></a>
## Acknowledgments

I acknowledge&mdash;
- the commenters to the CodeProject version of this page (as well as a similar article of mine on CodeProject), including "Cryptonite" and member 3027120,
- Severin Pappadeux, and
- Lee Daniel Crocker, who reviewed this document and gave comments.

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> A distinction between _statistical_ and _cryptographic_ RNGs seems natural, because many programming languages offer a general-purpose RNG (such as C's `rand` or Java's `java.util.Random`) and sometimes an RNG intended for information security purposes (such as Ruby's `SecureRandom`).</small>

<small><sup id=Note2>(2)</sup> F. Dörre and V. Klebanov, "Practical Detection of Entropy Loss in Pseudo-Random Number Generators", 2016.</small>

<small><sup id=Note3>(3)</sup> If the software and/or hardware uses a nonuniform distribution, but otherwise meets this definition, it can be converted to use a uniform distribution, at least in theory, using _unbiasing_, _deskewing_, or _randomness extraction_ (see RFC 4086 sec. 4 or Cliff et al. 2009 for further discussion).</small>

<small><sup id=Note4>(4)</sup> See also the FIPS 200 definition ("The protection of information and information systems from unauthorized access, use, disclosure, disruption, modification, or destruction in order to provide confidentiality, integrity, and availability") and ISO/IEC 27000.</small>

<small><sup id=Note5>(5)</sup> Bernstein, D.J.  "Fast-key-erasure random number generators", Jun. 23, 2017.</small>

<small><sup id=Note6>(6)</sup> For example, a new RNG can be constructed from two independent RNGs using the so-called "shrinking generator" technique: generate one bit from the first RNG and one bit from the second, and take the second bit if the first bit is 1, or repeat this process otherwise.  See J. D. Cook, "Using one RNG to sample another", June 4, 2019, for more on this technique, including its advantages and drawbacks.</small>

<small><sup id=Note7>(7)</sup> Wetzels, J., "33C3: Analyzing Embedded Operating System Random Number Generators", samvartaka.github.io, Jan. 3, 2017.</small>

<small><sup id=Note8>(8)</sup> B. Peng, "Two Fast Methods of Generating True Random Numbers on the Arduino", GitHub Gist, December 2017.</small>

<small><sup id=Note9>(9)</sup> Jones, D., "Good Practice in (Pseudo) Random Number Generation for Bioinformatics Applications", 2007/2010.</small>

<small><sup id=Note10>(10)</sup> Widynski, B., "Middle Square Weyl Sequence RNG", arXiv:1704.00358v1 [cs.CR], 2017.</small>

<small><sup id=Note11>(11)</sup> S. Vigna, "[**An experimental exploration of Marsaglia's `xorshift` generators, scrambled**](http://vigna.di.unimi.it/ftp/papers/xorshift.pdf)", 2016.</small>

<small><sup id=Note12>(12)</sup> Blackman, D., Vigna, S. "Scrambled Linear Pseudorandom Number Generators", 2018.</small>

<small><sup id=Note13>(13)</sup> Noise functions include functions that combine several outputs of a noise function, including by [**fractional Brownian motion**](https://en.wikipedia.org/wiki/Fractional_Brownian_motion).  By definition, noise functions are deterministic.</small>

<small><sup id=Note14>(14)</sup> Lenstra, A.K., Wesolowski, B. "A random zoo: sloth, unicorn, and trx", 2015.</small>

<small><sup id=Note15>(15)</sup> Boneh, D., Bonneau, J., et al. "Verifiable Delay Functions", 2018.</small>

<small><sup id=Note16>(16)</sup> M&uuml;ller, S. "CPU Time Jitter Based Non-Physical True Random Number Generator".</small>

<small><sup id=Note17>(17)</sup> Liebow-Feeser, J., "Randomness 101: LavaRand in Production", blog.cloudflare.com, Nov. 6, 2017.</small>

<small><sup id=Note18>(18)</sup> Liebow-Feeser, J., "LavaRand in Production: The Nitty-Gritty Technical Details", blog.cloudflare.com, Nov. 6, 2017.</small>

<small><sup id=Note19>(19)</sup> Cliff, Y., Boyd, C., Gonzalez Nieto, J.  "How to Extract and Expand Randomness: A Summary and Explanation of Existing Results", 2009.</small>

<small><sup id=Note20>(20)</sup> For example, many questions on _Stack Overflow_ highlight the pitfalls of creating a new instance of .NET's `System.Random` each time a random number is needed, rather than only once in the application.  See also Johansen, R. S., "[**A Primer on Repeatable Random Numbers**](https://blogs.unity3d.com/2015/01/07/a-primer-on-repeatable-random-numbers/)", Unity Blog, Jan. 7, 2015, and the section "How to Initialize RNGs".</small>

<small><sup id=Note21>(21)</sup> Using the similar `/dev/random` is NOT RECOMMENDED, since in some implementations it can block for seconds at a time, especially if not enough randomness is available.  See also [**"Myths about /dev/urandom"**](https://www.2uo.de/myths-about-urandom).</small>

<small><sup id=Note22>(22)</sup> A. Klyubin, "Some SecureRandom Thoughts", Android Developers Blog, Aug. 14, 2013.</small>

<small><sup id=Note23>(23)</sup> Michaelis, K., Meyer, C., and Schwenk, J. "Randomly Failed! The State of Randomness in Current Java Implementations", 2013.</small>

<small><sup id=Note24>(24)</sup> P. L'Ecuyer, D. Munger, et al.  "Random Numbers for Parallel Computers: Requirements and Methods, With Emphasis on GPUs". April 17, 2015.</small>

<small><sup id=Note25>(25)</sup> More generally, a list has `N! / (W_1! * W_2! * ... * W_K!)` permutations (a [**multinomial coefficient**](http://mathworld.wolfram.com/MultinomialCoefficient.html)), where `N` is the list's size, `K` is the number of different items in the list, and `W_i` is the number of times the item identified by `i` appears in the list.  However, this number is never more than `N!` and suggests using less randomness, so an application need not use this more complicated formula and MAY assume that a list has `N!` permutations even if some of its items occur more than once.</small>

<small><sup id=Note26>(26)</sup> Atwood, Jeff. "[**The danger of na&iuml;vet&eacute;**](https://blog.codinghorror.com/the-danger-of-naivete/)", Dec. 7, 2007.</small>

<small><sup id=Note27>(27)</sup> van Staveren, Hans. [**"Big Deal: A new program for dealing bridge hands"**](https://sater.home.xs4all.nl/doc.html), Sep. 8, 2000</small>

<small><sup id=Note28>(28)</sup> For suggested linear congruential generators for generating unique random numbers, see P. L'Ecuyer, "Tables of Linear Congruential Generators of Different Sizes and Good Lattice Structure", _Mathematics of Computation_ 68(225), January 1999.  Another choice for _n_-bit unique integers is an _n_-bit [**linear-feedback shift register**](https://en.wikipedia.org/wiki/Linear-feedback_shift_register) generator with the right parameters, which cycles "randomly" through all but one _n_-bit integers; see P. Alfke, "Efficient Shift Registers, LFSR Counters, and Long Pseudo-Random Sequence Generators", Xilinx Application Note XAPP 052, July 7, 1996.</small>

<small><sup id=Note29>(29)</sup> In theory, generating two or more random integers of fixed size runs the risk of producing a duplicate number this way.  However, this risk decreases as that fixed size increases (see "[**Birthday problem**](https://en.wikipedia.org/wiki/Birthday_problem)").  For example, in theory, an application has a 50% chance for duplicate numbers after generating&mdash;
- about 2.7 billion billion random 122-bit integers (including those found in version-4 UUIDs, or universally unique identifiers),
- about 1.4 million billion billion random 160-bit integers, or
- about 93 billion billion billion random 192-bit integers.</small>

<small><sup id=Note30>(30)</sup> The only binary floating-point numbers supported by some GPUs are 16-bit (with 10 significant bits of precision), notably not 32- or 64-bit as is otherwise common. An application ought to choose stateless functions that deliver acceptable "random" numbers regardless of the size of floating-point numbers supported by the GPU.</small>

<small><sup id=Note31>(31)</sup> C. Peters, "[**Free blue noise textures**](http://momentsingraphics.de/?p=127)", _Moments in Graphics_, Dec. 22, 2016.  That article discusses the sampling of _blue noise_, not independent uniformly-distributed random numbers, but a similar approach applies to textures of noise however generated.</small>

<small><sup id=Note32>(32)</sup> P. L'Ecuyer, D. Munger, et al.  "Random Numbers for Parallel Computers: Requirements and Methods, With Emphasis on GPUs". April 17, 2015.</small>

<small><sup id=Note33>(33)</sup> Note that although PRNGs can also act like hash functions (if they're seeded with the input and the PRNG is "large enough" for the input), some PRNGs (such as `xorshift128+`) are not well suited to serve as hash functions, because they don't mix their state before generating a random number from that state.</small>

<small><sup id=Note34>(34)</sup> Such arbitrary data can include process identifiers, time stamps, environment variables, random numbers, virtual machine guest identifiers, and/or other data specific to the session or to the instance of the RNG.  See also NIST SP800-90A and the references below.<br/>Everspaugh, A., Zhai, Y., et al.  "Not-So-Random Numbers in Virtualized Linux and the Whirlwind RNG", 2014.<br>Ristenpart, T., Yilek, S. "When Good Randomness Goes Bad: Virtual Machine Reset Vulnerabilities and Hedging Deployed Cryptography", 2010.</small>

<small><sup id=Note35>(35)</sup> Allowing applications to do so would hamper forward compatibility &mdash; the API would then be less free to change how the RNG is implemented in the future (e.g., to use a cryptographic or otherwise "better" RNG), or to make improvements or bug fixes in methods that use that RNG (such as shuffling and Gaussian number generation).  (As a notable example, the V8 JavaScript engine recently changed its `Math.random()` implementation to use a variant of `xorshift128+`, which is backward compatible because nothing in JavaScript allows  `Math.random()` to be seeded.)  Nevertheless, APIs can still allow applications to provide additional input ("entropy") to the RNG in order to increase its randomness rather than to ensure repeatability.</small>

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
