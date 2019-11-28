# Random Number Generator Recommendations for Applications

[**Peter Occil**](mailto:poccil14@gmail.com)

Begun on Mar. 5, 2016; last updated on Nov. 26, 2019.

Most apps that use random numbers care about either unpredictability, high quality, or repeatability.  This article explains the three kinds of RNGs and gives recommendations on each kind.

<a id=Introduction></a>
## Introduction

Many applications rely on random number generators (RNGs);
however, it's not enough for random numbers to merely "look random".  But unfortunately, most popular programming languages today&mdash;

- specify few and weak requirements on their built-in RNGs (such as [**C's `rand`**](http://en.cppreference.com/w/cpp/numeric/random/rand)),
- specify a relatively weak general-purpose RNG (such as Java's `java.math.Random`),
- implement RNGs by default that leave something to be desired (such as Mersenne Twister),
- initialize RNGs with a timestamp by default (such as the [**.NET Framework implementation of `System.Random`**](https://docs.microsoft.com/dotnet/api/system.random)), and/or
- use RNGs that are initialized with a fixed value by default (as is the case in [**MATLAB**](https://www.mathworks.com/help/matlab/examples/controlling-random-number-generation.html) and C<sup>[**(1)**](#Note1)</sup>),

so that as a result, many applications use RNGs, especially built-in RNGs, that have little assurance of high quality or security.   That is why this document discusses high-quality RNGs and suggests [**existing implementations**](#Existing_RNG_APIs_in_Programming_Languages) of them.

**This document covers:**

- Cryptographic RNGs<sup>[**(2)**](#Note2)</sup>, noncryptographic RNGs, and manually-seeded RNGs, as well as recommendations on their use and properties.
- Nondeterministic sources, entropy, and seed generation.
- Existing implementations of RNGs.
- Guidance for implementations of RNGs designed for reuse by applications.
- Issues on shuffling with an RNG.

**This document does not cover:**

- Testing an RNG implementation for correctness or adequate random number generation (e.g., Dörre and Klebanov 2016<sup>[**(3)**](#Note3)</sup>).
- Generation of random numbers with unequal probabilities (_nonuniform_ random numbers); I discuss this topic in [**another document**](https://peteroupc.github.io/randomfunc.html).
- Generators of low-discrepancy sequences (quasirandom sequences), such as Sobol sequences.  They are not RNGs since the numbers they produce depend on prior results.
- Applications for which the selection of RNGs is limited by regulatory requirements.

<a id=About_This_Document></a>
### About This Document

**This is an open-source document; for an updated version, see the** [**source code**](https://github.com/peteroupc/peteroupc.github.io/raw/master/random.md) **or its** [**rendering on GitHub**](https://github.com/peteroupc/peteroupc.github.io/blob/master/random.md)**.  You can send comments on this document either on** [**CodeProject**](https://www.codeproject.com/Articles/1083372/Random-Number-Generator-Recommendations-for-Applic) **or on the** [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues)**.**

<a id=Contents></a>
## Contents

- [**Introduction**](#Introduction)
    - [**About This Document**](#About_This_Document)
- [**Contents**](#Contents)
- [**Definitions**](#Definitions)
- [**Summary**](#Summary)
- [**Cryptographic RNGs**](#Cryptographic_RNGs)
- [**Noncryptographic PRNGs**](#Noncryptographic_PRNGs)
    - [**High-Quality PRNG Examples**](#High_Quality_PRNG_Examples)
- [**Manually-Seeded PRNGs**](#Manually_Seeded_PRNGs)
    - [**When to Use a Manually-Seeded PRNG**](#When_to_Use_a_Manually_Seeded_PRNG)
    - [**Manually-Seeded PRNG Recommendations**](#Manually_Seeded_PRNG_Recommendations)
    - [**Manually-Seeded PRNG Use Cases**](#Manually_Seeded_PRNG_Use_Cases)
        - [**Games**](#Games)
        - [**Unit Tests**](#Unit_Tests)
    - [**Single Random Value**](#Single_Random_Value)
- [**Nondeterministic Sources and Seed Generation**](#Nondeterministic_Sources_and_Seed_Generation)
    - [**What Is a Nondeterministic Source?**](#What_Is_a_Nondeterministic_Source)
    - [**What Is Entropy?**](#What_Is_Entropy)
    - [**Seed Generation**](#Seed_Generation)
    - [**Seed Generation for Noncryptographic PRNGs**](#Seed_Generation_for_Noncryptographic_PRNGs)
- [**Existing RNG APIs in Programming Languages**](#Existing_RNG_APIs_in_Programming_Languages)
- [**RNG Topics**](#RNG_Topics)
    - [**Shuffling**](#Shuffling)
    - [**Unique Random Identifiers**](#Unique_Random_Identifiers)
    - [**Determinism and Consistency**](#Determinism_and_Consistency)
- [**Hash Functions**](#Hash_Functions)
    - [**Procedural Noise Functions**](#Procedural_Noise_Functions)
    - [**Pseudorandom Functions**](#Pseudorandom_Functions)
- [**Verifiable Random Numbers**](#Verifiable_Random_Numbers)
- [**Guidelines for New RNG APIs**](#Guidelines_for_New_RNG_APIs)
    - [**Cryptographic RNGs: Requirements**](#Cryptographic_RNGs_Requirements)
    - [**High-Quality RNGs: Requirements**](#High_Quality_RNGs_Requirements)
    - [**Designs for PRNGs**](#Designs_for_PRNGs)
    - [**Implementing New RNG APIs**](#Implementing_New_RNG_APIs)
- [**Acknowledgments**](#Acknowledgments)
- [**Notes**](#Notes)
- [**Appendix**](#Appendix)
    - [**Suggested Entropy Size**](#Suggested_Entropy_Size)
    - [**Bays&ndash;Durham Shuffle**](#Bays_ndash_Durham_Shuffle)
- [**License**](#License)

<a id=Definitions></a>
## Definitions

The following definitions are helpful in better understanding this document.

- **Random number generator (RNG).** Software and/or hardware that seeks to generate numbers with the property that each possible outcome is as likely as any other without influence by anything else<sup>[**(4)**](#Note4)</sup>.
- **Pseudorandom number generator (PRNG).** A random number generator that outputs seemingly random numbers using a deterministic algorithm (that is, an algorithm that gives the same output for the same input and state every time), and in which its state can be initialized and possibly reinitialized with arbitrary data.
- **Seed.**  Arbitrary data for initializing the state of a PRNG.
- **State length.**  The maximum size of the seed a PRNG can take to initialize its state without shortening or compressing that seed.
- **Information security.** Keeping information safe from attacks that could access, use, delay, or manipulate that information.<sup>[**(5)**](#Note5)</sup>
- **SHOULD, SHOULD NOT, MAY, RECOMMENDED, NOT RECOMMENDED.**  These terms have the meanings given in RFC 2119 and RFC 8174.

<a id=Summary></a>
## Summary

- Does the application use random numbers for **information security** purposes (e.g., as passwords or other secrets)?
    - Yes: Use a [**cryptographic RNG**](#Cryptographic_RNGs).
- No: Does the application require [**reproducible "random" numbers**](#When_to_Use_a_Manually_Seeded_PRNG)?
    - Yes: Use a manually-seeded high-quality PRNG.  If a seed is known, use it.  Otherwise, generate a fresh seed using a cryptographic RNG.
        - Does the application run **multiple independent processes** that use random numbers?
            - No: Seed one PRNG with the seed determined above.
            - Yes: Pass the seed determined above to each process as described in "[**Seed Generation for Noncryptographic PRNGs**](#Seed_Generation_for_Noncryptographic_PRNGs)".
- No: Is a cryptographic RNG **too slow** for the application?
    - Yes: Use a [**high-quality PRNG**](#High_Quality_PRNG_Examples) with a seed generated using a cryptographic RNG.
    - No: Use a cryptographic RNG.

<a id=Cryptographic_RNGs></a>
## Cryptographic RNGs

Cryptographic RNGs (also known as "cryptographically strong" or "cryptographically secure" RNGs) seek to generate random numbers that not only "look random", but are cost-prohibitive to guess.  Cryptographic RNGs are RECOMMENDED for applications that use random numbers for information security, such as&mdash;

-  generating keying material, such as encryption keys,
-  generating random passwords, nonces, or session identifiers,
-  generating "salts" to vary hash codes of the same password,
-  sending or receiving messages or other data securely between computers, and
-  cases (such as in multiplayer networked games) when predicting future random numbers would give a player or user a significant and unfair advantage,

as well as for applications that generate random numbers so infrequently that the RNG's speed is not a concern.

- See "[**Cryptographic RNGs: Requirements**](#Cryptographic_RNGs_Requirements)" for requirements.
- See "[**Existing RNG APIs in Programming Languages**](#Existing_RNG_APIs_in_Programming_Languages)" for existing APIs.
- For cryptographic RNGs, an application SHOULD use only one thread-safe instance of the RNG for the entire application to use.

<a id=Noncryptographic_PRNGs></a>
## Noncryptographic PRNGs

Noncryptographic PRNGs vary widely in the quality of randomness of the numbers they generate.  For this reason, a noncryptographic PRNG SHOULD NOT be used&mdash;

- for information security purposes (e.g., to generate random passwords, encryption keys, or other secrets),
- if cryptographic RNGs are fast enough for the application, or
- if the PRNG is not _high quality_ (see "[**High-Quality RNGs: Requirements**](#High_Quality_RNGs_Requirements)").

Noncryptographic PRNGs can be _automatically seeded_ (a new seed is generated upon PRNG creation) or _manually seeded_ (the PRNG uses a predetermined seed).

- See "[**When to Use a Manually-Seeded PRNG**](#When_to_Use_a_Manually_Seeded_PRNG)" to learn which kind of seeding to use.
- See "[**Seed Generation for Noncryptographic PRNGs**](#Seed_Generation_for_Noncryptographic_PRNGs)" for advice on how to seed.
- See "[**Existing RNG APIs in Programming Languages**](#Existing_RNG_APIs_in_Programming_Languages)" for existing APIs.
- For automatically-seeded PRNGs, an application SHOULD use only one thread-safe instance of the RNG for the entire application to use.

<a id=High_Quality_PRNG_Examples></a>
### High-Quality PRNG Examples

Besides cryptographic RNGs, the following are examples of [**high-quality PRNGs**](#High_Quality_PRNGs_Requirements):

- `JKISS`, `JKISS32`, `JLKISS`, `JLKISS64`, described in (Jones 2007/2010)<sup>[**(6)**](#Note6)</sup>.
- A [**linear congruential generator**](https://en.wikipedia.org/wiki/Linear_congruential_generator) (LCG) with modulus 2<sup>64</sup> or higher described in Table 4 of (L'Ecuyer 1999)<sup>[**(7)**](#Note7)</sup>, where each output's highest 32 bits are used.
- PCG (`pcg32`, `pcg64`, and `pcg64_fast` classes), by Melissa O'Neill. See also a [**critique by S. Vigna**](http://pcg.di.unimi.it/pcg.php).
- Other examples include B. Jenkins's "A small noncryptographic PRNG" (sometimes called `jsf`), C. Doty-Humphrey's `sfc`, `msws` (Widynski 2017)<sup>[**(8)**](#Note8)</sup>, and D. Blackman's `gjrand`.

The following also count as high-quality PRNGs, but they require nonzero seeds, complicating the task of seeding them:

- [**xoshiro256&#x2a;&#x2a;**](http://xoshiro.di.unimi.it/xoshiro256starstar.c) (state length 256 bits).
- [**xoroshiro128&#x2a;&#x2a;**](http://xoshiro.di.unimi.it/xoroshiro128starstar.c) (state length 128 bits).
- XorShift\* 128/64 (state length 128 bits).
- XorShift\* 64/32 (state length 64 bits).
- A multiplicative LCG with modulus 2<sup>64</sup> or higher described in Table 5 of (L'Ecuyer 1999)<sup>[**(7)**](#Note7)</sup>, where each output's highest 32 bits are used.

The following also count as high-quality PRNGs, but are not preferred:

- Mersenne Twister shows a [**systematic failure**](http://xoroshiro.di.unimi.it/#quality) in `BigCrush`'s LinearComp test (part of L'Ecuyer and Simard's "TestU01"). (See also (Vigna 2016)<sup>[**(9)**](#Note9)</sup>.)
- C++'s [**`std::ranlux48` engine**](http://www.cplusplus.com/reference/random/ranlux48/) (state length 577 bits; nonzero seed) can be slower than alternatives because it discards many "random" numbers before outputting another.
- [**`xoroshiro128+`**](http://xoshiro.di.unimi.it/xoroshiro128plus.c), `xoshiro256+`, and `xorshift128+` (nonzero seed for each).  As described by (Blackman and Vigna 2018)<sup>[**(10)**](#Note10)</sup>, these linear PRNGs use weak scramblers, so that each output's lowest bits have low linear complexity even though the output as a whole has excellent statistical randomness.  See also [**"Testing lowest bits in isolation"**](http://xoshiro.di.unimi.it/lowcomp.php).

The following are not considered high-quality PRNGs:
- Any LCG with modulus 2<sup>63</sup> or less (such as `java.util.Random` and C++'s `std::minstd_rand` and `std::minstd_rand0` engines) has a _state length_ of less than 64 bits.
- `System.Random`, as implemented in the .NET Framework 4.7, can take a seed of at most 32 bits, so has a state length of at most 32 bits.

<a id=Manually_Seeded_PRNGs></a>
## Manually-Seeded PRNGs

A given pseudorandom number generator (PRNG) generates the same sequence of "random" numbers for the same "seed".  Some applications care about reproducible "randomness" and thus could set a PRNG's seed manually for reproducible "random" numbers.

<a id=When_to_Use_a_Manually_Seeded_PRNG></a>
### When to Use a Manually-Seeded PRNG

By seeding a PRNG manually for reproducible "randomness", an application will be tied to that PRNG or its implementation. For this reason, an application SHOULD NOT use a manually-seeded PRNG (rather than a cryptographic or automatically-seeded RNG) unless&mdash;

1. the application might need to generate the same "random" result multiple times,
2. the application either&mdash;
    - makes the seed (or a "code" or "password" based on the seed) accessible to the user, or
    - finds it impractical to store or distribute the "random" numbers or "random" content, rather than the seed, for later use (e.g., to store those numbers to "replay" later, to store that content in a "save file", or to distribute that content rather than a seed to networked users), and
3. any feature that uses such a PRNG to generate that "random" result will be consistent (see "Determinism and Consistency") for as long as that feature is still in use by that application.

<a id=Manually_Seeded_PRNG_Recommendations></a>
### Manually-Seeded PRNG Recommendations

If an application chooses to use a manually-seeded PRNG for reproducible "randomness", the application&mdash;

- SHOULD choose a [**high-quality PRNG**](#High_Quality_PRNG_Examples),
- SHOULD choose a PRNG implementation with consistent behavior that will not change in the future,
- ought to document the chosen PRNG being used as well as all the parameters for that PRNG,
- ought to generate seeds for the PRNG that are likely to vary "wildly" from previous seeds (see "[**Seed Generation for Noncryptographic PRNGs**](#Seed_Generation_for_Noncryptographic_PRNGs)"), and
- SHOULD NOT seed the PRNG with floating-point numbers or generate floating-point numbers with that PRNG.

> **Example:** An application could implement a manually-seeded PRNG using a third-party library that specifically says it implements a [**high-quality PRNG algorithm**](#High_Quality_PRNG_Examples), and could initialize that PRNG using a bit sequence from a cryptographic RNG.  The developers could also mention the use of the specific PRNG chosen on any code that uses it, to alert other developers that the PRNG needs to remain unchanged.

<a id=Manually_Seeded_PRNG_Use_Cases></a>
### Manually-Seeded PRNG Use Cases

Use cases for manually-seeded PRNGs include the following:

- Simulations and machine learning.  This includes physics simulations and artificial intelligence (AI) in games, as well as simulations to reproduce published research data.
- Monte Carlo estimations (to make them random-behaving but deterministic).
- Procedural noise generation.
- Unit tests in which "randomness" ought not to determine whether they pass or fail.
- Games that generate "random" content that is impractical to store.

<a id=Games></a>
#### Games

Many kinds of game software generate seemingly "random" game content that might need to be repeatedly regenerated, such as&mdash;

- procedurally generated maps for a role-playing game,
- [**shuffling**](#Shuffling) a virtual deck of cards for a solitaire game, or
- a game board or puzzle board that normally varies every session.

In general, the bigger that "random" content is, the greater the justification to use a manually-seeded PRNG and a custom seed to generate that content.  The following are special cases:

1. If the game needs reproducible "random" content only at the start of the game session (e.g., a "random" game board or a "random" order of virtual cards) and that content is small (say, no more than a hundred numbers):
    - The game SHOULD NOT use a manually-seeded PRNG unless the seed is based on a "code" or "password" entered by the user.  This is a good sign that the game ought to store the "random" content instead of a seed.
2. In a networked game where multiple computers (e.g., multiple players, or a client and server) have a shared view of the game state and random numbers are used to update that game state:
    - The game SHOULD NOT use a manually-seeded PRNG where predicting a random outcome could give a player a significant and unfair advantage (e.g., the random number is the result of a die roll, or the top card of the draw pile, for a board or card game).  The game MAY use such a PRNG in other cases to ensure the game state is consistent among computers, including in physics simulations and AI.

> **Examples:**
>
> 1. Suppose a game generates a map with random terrain (which uses lots of random numbers) and shows the player a "code" to generate that map (such as a barcode or a string of letters and digits). In this case, the game&mdash;
>
>     - MAY change the algorithm it uses to generate random maps, but
>     - SHOULD use, in connection with the new algorithm, "codes" that can't be confused with "codes" it used for previous algorithms, and
>     - SHOULD continue to generate the same random map using an old "code" when the player enters it, even after the change to a new algorithm.
>
> 2. Suppose a game implements a chapter that involves navigating a randomly generated dungeon with randomly scattered monsters and items.  If the layout of the dungeon, monsters, and items has to be the same for a given week and for all players, the game can seed a PRNG with a hash code generated from the current week, the current month, the current year, and, optionally, a constant sequence of bits.

<a id=Unit_Tests></a>
#### Unit Tests

A custom seed is appropriate when unit testing a method that uses a manually-seeded PRNG in place of another kind of RNG for the purpose of the test (provided the test delivers consistent output across the computers under test).

<a id=Single_Random_Value></a>
### Single Random Value

If an application requires only one random value, with a fixed number of bits, then the application can pass the seed to a hash function rather than a PRNG.  Examples of this include the following:

- Generating a random color by passing the seed to the MD5 hash function, which outputs a 128-bit hash code, and taking the first 24 bits of the hash code as the random color.
- Generating a random number in a GLSL (OpenGL Shading Language) fragment shader by passing the fragment coordinates (which vary for each fragment, or "pixel") as well as a seed (which is the same for all fragments) to the Wang hash, which outputs a 32-bit integer.<sup>[**(11)**](#Note11)</sup>

<a id=Nondeterministic_Sources_and_Seed_Generation></a>
## Nondeterministic Sources and Seed Generation

RNGs ultimately rely on so-called _nondeterministic sources_; without such sources, no computer can produce random numbers.

<a id=What_Is_a_Nondeterministic_Source></a>
### What Is a Nondeterministic Source?

A _nondeterministic source_ is a source that doesn't give the same output for the same input each time (for example, a clock that doesn't always give the same time).  There are many kinds of them, but sources useful for random number generation have hard-to-guess output (that is, they have high _entropy_; see the next section).  They include&mdash;

- disk access timings,
- timings of keystrokes and/or other input device interactions,
- thermal noise,
- the output of assembly instructions specially dedicated to random number generation, such as RdSeed,
- the output generated with A. Seznec's technique called hardware volatile entropy gathering and expansion (HAVEGE), provided a high-resolution counter is available, and
- differences between two high-resolution counter values taken in quick succession (such as in "Jitter RNG"; see (M&uuml;ller)<sup>[**(12)**](#Note12)</sup>).

RFC 4086, "Randomness Requirements for Security", section 3, contains a survey of nondeterministic sources.

> **Note:** Online services that make random numbers available to applications, as well as the noise registered by microphone and camera recordings (see RFC 4086 sec. 3.2.1, (Liebow-Feeser 2017a)<sup>[**(13)**](#Note13)</sup>, and  (Liebow-Feeser 2017b)<sup>[**(14)**](#Note14)</sup>), are additional nondeterministic sources.  However, online services require Internet or other network access, and some of them require access credentials.  Also, many mobile operating systems require applications to declare network, camera, and microphone access to users upon installation.  For these reasons, these kinds of sources are NOT RECOMMENDED if other approaches are adequate.

<a id=What_Is_Entropy></a>
### What Is Entropy?

_Entropy_ is a value that describes how hard it is to guess a nondeterministic source's output, compared to ideal random data; this is generally the size in bits of the ideal random data.  (For example, a 64-bit output with 32 bits of entropy is as hard to guess as an ideal random 32-bit data block.)  NIST SP 800-90B recommends _min-entropy_ as the entropy measure.  Characterizing a nondeterministic source's entropy is nontrivial and beyond the scope of this document.  See also RFC 4086 section 2.

<a id=Seed_Generation></a>
### Seed Generation

In general, there are two steps to generate an `N`-bit seed for a PRNG<sup>[**(15)**](#Note15)</sup>:

1. Gather enough data from _nondeterministic sources_ to reach `N` bits of _entropy_ or more.
2. Then, condense the data into an `N`-bit number, a process called _randomness extraction_.<sup>[**(16)**](#Note16)</sup>

Randomness extraction is discussed in NIST SP 800-90B sec. 3.1.5.1, RFC 4086 sec. 4.2 and 5.2, and (Cliff et al., 2009)<sup>[**(17)**](#Note17)</sup>.

> **Example:** The Cliff reference reviewed the use of HMAC (hash-based message authentication code) algorithms, and implies that one way to generate a seed is as follows:
>
> 1. Gather data with at least 512 bits of entropy.
> 2. Run HMAC-SHA-512 with that data to generate a 512-bit HMAC.
> 3. Take the first 170 (or fewer) bits as the seed (512 divided by 3, rounded down).

<a id=Seed_Generation_for_Noncryptographic_PRNGs></a>
### Seed Generation for Noncryptographic PRNGs

For noncryptographic PRNGs, an application ought to generate seeds likely to vary "wildly" from previously generated seeds, to reduce the risk of correlated "random" numbers or sequences.  In most cases, this can be done by seeding the PRNG's full state with the output of a cryptographic RNG or a seed generated using the advice in the [**previous section**](#Seed_Generation).

For [**manually-seeded PRNGs**](#Manually_Seeded_PRNGs), however, if multiple processes (including threads, tasks, or subtasks) need to use reproducible "random" numbers for the same purpose, an application can generate one seed (or use a pregenerated seed) and distribute that seed to those processes by doing the following for each such process<sup>[**(18)**](#Note18)</sup>:

1. Create a PRNG instance for that process.  (The processes can use PRNGs of the same design or different designs; for example, they can all use PCG64, or some can use PCG64 and others `xoroshiro128**`.)
2. Build a string consisting of three parts: `IDENT`, `UNIQUE`, and `SEED`. Example: "mysimulation-1-myseed".<sup>[**(19)**](#Note19)</sup>

    - `IDENT` is a fixed identifier that's the same for all processes in the set.
    - `UNIQUE` is a unique number for the PRNG instance.
    - `SEED` is the seed distributed to each process in the set.

3. Use a [**hash function**](#Hash_Functions) of N or more bits to generate a hash code of the string in step 2, and use the first N bits of that code as the seed for that PRNG instance, where N is that PRNG's state length.<sup>[**(20)**](#Note20)</sup>

It is NOT RECOMMENDED to seed a PRNG (especially several at once) with sequential counters, linearly related numbers, or timestamps, since these kinds of seeds can cause undesirable correlations in some PRNGs.  Moreover, seeding multiple PRNGs with coarse timestamps can introduce the risk of generating the same "random" sequence accidentally.<sup>[**(21)**](#Note21)</sup>

<a id=Existing_RNG_APIs_in_Programming_Languages></a>
## Existing RNG APIs in Programming Languages

As much as possible, **applications SHOULD use existing libraries and techniques** for cryptographic and high-quality RNGs. The following table lists application programming interfaces (APIs) for such RNGs for popular programming languages.

- Methods and libraries mentioned in the "High-Quality" column need to be initialized with a seed before use (for example, a seed generated using an implementation in the "Cryptographic" column).
- The mention of a third-party library in this section does not imply that the library is the best one available for any particular purpose. The list is not comprehensive.
- See also [**Paragon's blog post**](https://paragonie.com/blog/2016/05/how-generate-secure-random-numbers-in-various-programming-languages) on existing cryptographic RNGs.

| Language   | Cryptographic   | High-Quality |
 --------|-----------------------------------------------|------|
| .NET (incl. C# and VB.NET) (H) | `RNGCryptoServiceProvider` in `System.Security.Cryptography` namespace | [**airbreather/AirBreather.Common library**](https://github.com/airbreather/Airbreather.Common) (XorShift1024Star, XorShift128Plus, XoroShiro128Plus) |
| C/C++ (G)  | (C) | [**`xoroshiro128plus.c`**](http://xoroshiro.di.unimi.it/xoroshiro128plus.c) (128-bit nonzero seed); [**`xorshift128plus.c`**](http://xoroshiro.di.unimi.it/xorshift128plus.c) (128-bit nonzero seed); [**frostburn/jkiss**](https://github.com/frostburn/jkiss) library |
| Python (A) | `secrets.SystemRandom` (since Python 3.6); `os.urandom()`| `pypcg` package; [**ihaque/xorshift**](https://github.com/ihaque/xorshift) library (128-bit nonzero seed; default seed uses `os.urandom()`) |
| Java (A) (D) | (C); `java.security.SecureRandom` (F) |  [**grunka/xorshift**](https://github.com/grunka/xorshift) (`XORShift1024Star` or `XORShift128Plus`); [**jenetics/prngine**](https://github.com/jenetics/prngine) (`KISS32Random`, `KISS64Random`) |
| JavaScript (B) | `crypto.randomBytes(byteCount)` (node.js only); `random-number-csprng` package (node.js only); `crypto.getRandomValues()` (Web) | `pcg-random` or `xoroshiro128starstar` package |
| Ruby (A) (E) | (C); `SecureRandom.rand()` (0 or greater and less than 1) (E); `SecureRandom.rand(N)` (integer) (E) (for both, `require 'securerandom'`); `sysrandom` gem |  |
| PHP (A) | `random_int()`, `random_bytes()` (both since PHP 7) |  |
| Go | `crypto/rand` package |  |
| Perl | `Crypt::URandom` module |  |
| Other Languages | (C) |  |

<small>(A) The general RNGs of recent versions of Python and Ruby implement [**Mersenne Twister**](https://en.wikipedia.org/wiki/Mersenne_Twister), which is not preferred for a high-quality RNG.  PHP's `mt_rand()` implements or implemented a flawed version of Mersenne Twister. `prngine`, a Java library, also has `MT19937_32Random` and `MT19937_64Random` classes that implement Mersenne Twister.</small>

<small>(B) JavaScript's `Math.random()` (which ranges 0 or greater and less than 1) is implemented using `xorshift128+` (or a variant) in the V8 engine, Firefox, and certain other modern browsers as of late 2017; `Math.random()` uses an "implementation-dependent algorithm or strategy", though (see ECMAScript sec. 20.2.2.27).</small>

<small>(C) A cryptographic RNG implementation can&mdash;
   - read from the `/dev/urandom` device in Linux-based systems (using the `open` and `read` system calls where available)<sup>[**(22)**](#Note22)</sup>,
   - call the `arc4random` or `arc4random_buf` method on FreeBSD or macOS,
   - call the `getentropy` method on OpenBSD, or
   - call the `BCryptGenRandom` API in Windows 7 and later,</small>

<small>and only use other techniques if the existing ones are inadequate for the application.  But unfortunately, resource-constrained devices ("embedded" devices) are much less likely to have a cryptographic RNG available compared to general-purpose computing devices such as desktop computers and smartphones (Wetzels 2017)<sup>[**(23)**](#Note23)</sup>, although methods exist for implementing a cryptographic RNG on the Arduino (Peng 2017)<sup>[**(24)**](#Note24)</sup>.
</small>

<small>(D) Java's `java.util.Random` class uses a 48-bit seed, so is not considered a high-quality RNG.  However, a subclass of `java.util.Random` might be implemented as a high-quality RNG.</small>

<small>(E) Ruby's `Random#rand` and `SecureRandom.rand` methods present a beautiful and simple API for random number generation, in my opinion.  Namely, `rand()` returns a number 0 or greater and less than 1, and `rand(N)` returns an integer 0 or greater and less than N.</small>

<small>(F) Calling the `setSeed` method of `SecureRandom` before use is RECOMMENDED. The data passed to the method SHOULD be data described in note (C). (Despite the name, `setSeed` _supplements_ the existing seed, according to the `SecureRandom` documentation.)  See also (Klyubin 2013)<sup>[**(25)**](#Note25)</sup>.  Using the `SecureRandom` implementation `"SHA1PRNG"` is NOT RECOMMENDED, because of weaknesses in seeding and RNG quality in implementations as of 2013 (Michaelis et al., 2013)<sup>[**(26)**](#Note26)</sup>.</small>

<small>(G) [**`std::random_device`**](http://en.cppreference.com/w/cpp/numeric/random/random_device), introduced in C++11, is NOT RECOMMENDED because its specification leaves considerably much to be desired.  For example,  `std::random_device` can fall back to a pseudorandom number generator of unspecified quality without much warning.  At best, `std::random_device` SHOULD NOT be used except to supplement other techniques for random number generation.</small>

<small>(H) The .NET Framework's `System.Random` class uses a seed of at most 32 bits, so is not considered a high-quality RNG.  However, a subclass of `System.Random` might be implemented as a high-quality RNG.</small>

<a id=RNG_Topics></a>
## RNG Topics

This section discusses several important points on the use and selection of RNGs, including things to consider when shuffling or generating "unique" random numbers.

<a id=Shuffling></a>
### Shuffling

In a list with `N` different items, there are `N` factorial (that is, `1 * 2 * ... * N`, or `N!`) ways to arrange the items in that list.  These ways are called _permutations_<sup>[**(27)**](#Note27)</sup>.

In practice, an application can **shuffle a list** by doing a [**Fisher&ndash;Yates shuffle**](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle), which is unfortunately easy to mess up &mdash; see (Atwood 2007)<sup>[**(28)**](#Note28)</sup> &mdash; and is implemented correctly in [**another document of mine**](https://peteroupc.github.io/randomfunc.html).

However, if a PRNG's period (maximum size of a "random" number cycle) is less than the number of permutations, then there are **some permutations that that PRNG can't choose** when it shuffles that list. (This is not the same as _generating_ all permutations of a list, which, for a list big enough, can't be done by any computer in a reasonable time.)

On the other hand, for a list big enough, it's generally **more important to have shuffles act random** than to choose from among all permutations.

An application that shuffles a list can do the shuffling&mdash;

1. using a cryptographic RNG, preferably one with a security strength of `B` bits or greater, or
2. if a noncryptographic RNG is otherwise appropriate, using a _high-quality PRNG_ that&mdash;
    - has a state length of `B` bits or greater, and
    - is initialized with a seed derived from data with at least **`B` bits of** [**_entropy_**](#Nondeterministic_Sources_and_Seed_Generation), or "randomness".

For shuffling purposes, `B` can usually be calculated for different lists using the Python code in the [**appendix**](#Suggested_Entropy_Size); see also (van Staveren 2000, "Lack of randomness")<sup>[**(29)**](#Note29)</sup>.  For example, `B` is 226 (bits) for a 52-item list.  For shuffling purposes, an application MAY limit `B` to 256 or greater, in cases when variety of permutations is not important.

<a id=Unique_Random_Identifiers></a>
### Unique Random Identifiers

Some applications require generating unique identifiers, especially to identify database records or other shared resources.  Such identifiers include auto-incremented numbers, sequentially assigned numbers, random numbers, and combinations of these.  The following are some questions to consider when generating unique identifiers, especially random ones:

1. Can the application easily check identifiers for uniqueness within the desired scope and range (e.g., check whether a file or database record with that identifier already exists)<sup>[**(30)**](#Note30)</sup>?
2. Can the application tolerate the risk of generating the same identifier for different resources<sup>[**(31)**](#Note31)</sup>?
3. Do identifiers have to be hard to guess, be simply "random-looking", or be neither?
4. Do identifiers have to be typed in or otherwise relayed by end users<sup>[**(32)**](#Note32)</sup>?
5. Is the resource an identifier identifies available to anyone who knows that identifier (even without being logged in or authorized in some way)?
6. Do identifiers have to be memorable?

Examples of unique integers include sequentially-assigned integers as well as the primary key of a database table.  If the application requires a unique integer to "look random", it can apply a reversible operation to that integer (such as a permutation), or take that integer as the seed of a so-called "full-period" PRNG that outputs integers with as many bits as its state length<sup>[**(33)**](#Note33)</sup>.

An application that generates unique identifiers SHOULD do so as follows:

- If the application can answer yes to 1 or 2 above:
   - And yes to 5: Generate a 128-bit-long or longer random integer using a cryptographic RNG.
   - And no to 5: Generate a 32-bit-long or longer random integer using a cryptographic RNG.
- Otherwise:
   - If identifiers have to be hard to guess: Use a unique integer which is followed by a random integer generated using a cryptographic RNG (the random integer's length depends on the answer to 5, as above).
   - Otherwise: Use a unique integer. (Note that generally, random numbers alone can't ensure uniqueness.)

<a id=Determinism_and_Consistency></a>
### Determinism and Consistency

For an RNG algorithm to generate "random" numbers that are reproducible across computers, it needs to be a _consistent_ algorithm.  (This factor is important only for manually-seeded PRNGs, not necessarily for other RNGs.)

A _consistent algorithm_ is an algorithm that delivers the same output each time if given the same input twice (is _deterministic_) and that does so&mdash;

- across time,
- across different executions of the algorithm,
- across versions of the application that uses the algorithm,
- across supported hardware, and
- across supported operating systems.

An application can generally achieve consistency by not changing the algorithm between application versions.  Also, algorithms that use floating-point or other non-integer numbers are harder to make consistent than other algorithms.  Finally, C and C++ have a concept of _undefined behavior_ that any consistent algorithm has to avoid relying on, as well as data types with compiler-dependent properties (such as `int` and `long`).<sup>[**(34)**](#Note34)</sup>

[**`java.util.Random`**](https://docs.oracle.com/javase/8/docs/api/java/util/Random.html) is one example of a PRNG with consistent behavior, but none of the following is such a PRNG:

- The C [**`rand` method**](http://en.cppreference.com/w/cpp/numeric/random/rand), as well as C++'s random number distribution classes, such as [**`std::uniform_int_distribution`**](http://en.cppreference.com/w/cpp/numeric/random/uniform_int_distribution), use implementation-defined algorithms for random number generation.
- .NET's [**`System.Random`**](https://docs.microsoft.com/dotnet/api/system.random) has random number generation behavior that could change in the future.

<a id=Hash_Functions></a>
## Hash Functions

A _hash function_ is a function that takes an arbitrary input of any size (such as an array of 8-bit bytes or a sequence of characters) and returns an output with a fixed number of bits. That output is also known as a _hash code_.<sup>[**(35)**](#Note35)</sup>.  The individual bits of a hash code can serve as random numbers, or the hash code can serve as the seed for a PRNG that, in turn, [**generates random numbers**](https://peteroupc.github.io/randomfunc.html) in the desired way.

Useful properties of some hash functions include&mdash;

- the _avalanche property_ (every bit of the input affects every bit of the output without a clear preference for 0 or 1),
- _collision resistance_ (finding two different inputs that lead to a given output is cost-prohibitive), and
- the _one-way property_ (finding an unknown input that leads to a given output is cost-prohibitive) (see NIST SP 800-108).

Hash functions not used for information security SHOULD have the avalanche property (e.g, MurmurHash3, xxHash, CityHash).  Hash functions used for information security SHOULD have the collision resistance, avalanche, and one-way properties (e.g., SHA2-256, BLAKE2).

<a id=Procedural_Noise_Functions></a>
### Procedural Noise Functions

_Noise_ is a randomized variation in images, sound, and other data.<sup>[**(36)**](#Note36)</sup>

A _noise function_ is similar to a hash function; it takes an _n_-dimensional point and, optionally, additional data, and outputs a seemingly random number.<sup>[**(37)**](#Note37)</sup>  Noise functions generate **_procedural noise_** such as [**cellular noise**](https://en.wikipedia.org/wiki/Cellular_noise), [**value noise**](https://en.wikipedia.org/wiki/Value_noise), and [**gradient noise**](https://en.wikipedia.org/wiki/Gradient_noise) (including [**Perlin noise**](https://en.wikipedia.org/wiki/Perlin_noise)).  If the noise function takes additional data, that data&mdash;
- SHOULD include random numbers (from any RNG), and
- SHOULD NOT vary from one run to the next while the noise function is used for a given purpose (e.g., to generate terrain for a given map).

<a id=Pseudorandom_Functions></a>
### Pseudorandom Functions

A _pseudorandom function_ is a kind of hash function that takes&mdash;

- a _secret_ (such as a password or a long-term key), and
- additional data such as a _salt_ (which is unique in order to mitigate precomputation attacks) or a _nonce_,

and outputs a seemingly random number.  (If the output is keying material, the function is also called a _key derivation function_; see NIST SP 800-108.)  Some pseudorandom functions deliberately take time to compute their output; these are designed above all for cases in which the secret is a password or is otherwise easy to guess &mdash; examples of such functions include PBKDF2 (RFC 2898), `scrypt` (RFC 7914), and Ethash.  Pseudorandom functions are also used in proofs of work such as the one described in RFC 8019 sec. 4.4.

<a id=Verifiable_Random_Numbers></a>
## Verifiable Random Numbers

_Verifiable random numbers_ are random numbers (such as seeds for PRNGs) that are disclosed along with all the information necessary to verify their generation.  Usually, such information includes random numbers and/or uncertain data to be determined and publicly disclosed in the future.  Techniques to generate verifiable random numbers (as opposed to cryptographic RNGs alone) are used whenever one party alone can't be trusted to produce a number at random.  Verifiable random numbers that are disclosed _publicly_ SHOULD NOT be used as encryption keys or other secret parameters.

> **Examples:**
>
> 1. Generating verifiable randomness has been described in [**RFC 3797**](https://www.rfc-editor.org/rfc/rfc3797.txt), which describes the selection process for the Nominations Committee (NomCom) of the Internet Engineering Task Force.
> 2. _Verifiable delay functions_ calculate an output as well as a proof that the output was correctly calculated; these functions deliberately take much more time to calculate the output (e.g., to generate a seemingly random number from public data) than to verify its correctness.<sup>[**(38)**](#Note38)</sup> In many cases, such a function deliberately takes much more time than the time allowed to contribute randomness to that function.<sup>[**(39)**](#Note39)</sup>
> 3. In a so-called [**_commitment scheme_**](https://en.wikipedia.org/wiki/Commitment_scheme), one computer generates data to be committed (e.g. a random number or a chess move), then reveals its hash code or digital signature (_commitment_), and only later reveals to all participants the committed data (along with other information needed, if any, to verify that the data wasn't changed in between).  Examples of commitment schemes are _hash-based commitments_.<sup>[**(39)**](#Note39)</sup>
> 4. So-called _mental card game_ (_mental poker_) schemes can be used in networked games where a deck of cards has to be shuffled and dealt to players, so that the identity of some cards is known to some but not all players.<sup>[**(39)**](#Note39)</sup>

<a id=Guidelines_for_New_RNG_APIs></a>
## Guidelines for New RNG APIs

This section contains guidelines for those seeking to implement RNGs designed for wide reuse (such as in a programming language's standard library).  _As mentioned earlier, an application SHOULD use existing RNG implementations whenever possible._

This section contains suggested requirements on cryptographic and high-quality RNGs that a new programming language can choose to adopt.

<a id=Cryptographic_RNGs_Requirements></a>
### Cryptographic RNGs: Requirements

A cryptographic RNG generates random bits that behave like independent uniform random bits, such that it would be cost-prohibitive for an outside party to correctly guess, with more than a 50% chance per bit, prior or future unseen outputs of that RNG after knowing how the RNG works and/or extremely many outputs of the RNG, or prior unseen outputs of that RNG after knowing the RNG's internal state at the given point in time.<sup>[**(40)**](#Note40)</sup>

If a cryptographic RNG implementation uses a PRNG, the following requirements apply.

1. The PRNG's _state length_ is at least 128 bits and SHOULD be at least 256 bits.

2. The _security strength_ used by the RNG is at least 128 bits and is not more than the PRNG's _state length_.

3. While or after the PRNG is created, and before it generates a random number, it is initialized ("seeded") with a seed that&mdash;
    - has as many bits as the PRNG's _state length_,
    - consists of data that ultimately derives from the output of one or more [**nondeterministic sources**](#Nondeterministic_Sources_and_Seed_Generation), where the output is at least as hard to guess as ideal random data with as many bits as the _security strength_, and
    - MAY be mixed with arbitrary data other than the seed as long as the result is no easier to guess<sup>[**(41)**](#Note41)</sup>.

A cryptographic RNG is not required to reseed itself.

> **Examples:** The following are examples of cryptographic RNGs:
>
> - Randomness extractors or cryptographic [**hash functions**](#Hash_Functions) that take very hard-to-predict signals from two or more [**nondeterministic sources**](#Nondeterministic_Sources_and_Seed_Generation) as input.
> - A "fast-key-erasure" random number generator described by D.J. Bernstein in his blog (Bernstein 2017)<sup>[**(42)**](#Note42)</sup>.
> - An RNG implementation complying with NIST SP 800-90A.  The SP 800-90 series goes into further detail on how RNGs appropriate for information security can be constructed, and inspired much of this section.
> - An RNG made up of two or more independently initialized cryptographic RNGs of different designs.<sup>[**(43)**](#Note43)</sup>

<a id=High_Quality_RNGs_Requirements></a>
### High-Quality RNGs: Requirements

A PRNG is a high-quality RNG if&mdash;
- it generates bits that behave like independent uniform random bits (at least for nearly all practical purposes outside of information security),
- its state length is at least 64 bits, and
- it either satisfies the _collision resistance_ property or has a period (maximum size of a "random" number cycle) at or close to 2<sup>N</sup>, where N is its state length.

The high-quality PRNG's state length SHOULD be at least 128 bits, and the PRNG need not be perfectly equidistributed.

Every cryptographic RNG is also a high-quality RNG.

<a id=Designs_for_PRNGs></a>
### Designs for PRNGs

There are several possible ways to implement a PRNG:

1. As an object that uses an internal state and the following methods:
    - An initializer method that takes a seed and converts it to an internal state.  This method is called while the PRNG object is being created.
    - A method that takes no parameters.  It uses only the internal state to output one or more "random" numbers and update the internal state.  This method is available after the initializer is called.
2. As a function that takes a seed and outputs one or more "random" numbers.  An example is a [**hash function**](#Hash_Functions).
3. As a function that takes an internal state and outputs one or more "random" numbers.  This can be used if the application has its own logic for converting a seed to an internal state appropriate for the PRNG.
4. As a function that takes an internal state and outputs a new internal state and one or more "random" numbers.  This is how PRNGs can be implemented as so-called "pure functions" in functional programming languages (as in the package `AC-Random` for the Haskell language).

Of the designs just given, the first is _stateful_ and the last three are _stateless functions_.

<a id=Implementing_New_RNG_APIs></a>
### Implementing New RNG APIs

A **programming language API** designed for reuse by applications could implement RNGs using the following guidelines:

1.  The RNG API can include a method that fills one or more memory units (such as 8-bit bytes) completely with random bits.  See example 1.
2.  If the API implements an automatically-seeded RNG, it SHOULD NOT allow applications to initialize that same RNG with a seed for reproducible "randomness"<sup>[**(44)**](#Note44)</sup> (it MAY provide a separate PRNG to accept such a seed). See example 2.
3.  If the API provides a PRNG that an application can seed for reproducible "randomness", it SHOULD document that PRNG and any methods the API provides that use that PRNG (such as shuffling and Gaussian number generation), and SHOULD NOT change that PRNG or those methods in a way that would change the "random" numbers they deliver for a given seed. See example 2.
4.  A new programming language's **standard library** ought to include the following methods for generating numbers that behave like independent uniform random numbers (see my document on [**random number generation methods**](https://peteroupc.github.io/randomfunc.html) for details).
    - Four methods for random integers: 0 to `n` including `n`, 0 to `n` excluding `n`, `a` to `b` including `b`, and `a` to `b` excluding `b`.
    - Four methods for random numbers bounded by 0 and 1, with and without the endpoints.
    - Four methods for random numbers bounded by `a` and `b`, with and without the endpoints.

&nbsp;

> **Examples:**
>
> 1. A C language RNG method for filling memory could look like the following: `int random(uint8_t[] bytes, size_t size);`, where `bytes` is a pointer to an array of 8-bit bytes, and `size` is the number of random 8-bit bytes to generate, and where 0 is returned if the method succeeds and nonzero otherwise.
> 2. A Java API that follows these guidelines can contain two classes: a `RandomGen` class that implements an unspecified but general-purpose RNG, and a `RandomStable` class that implements a PCG PRNG that is documented and will not change in the future. `RandomStable` includes a constructor that takes a seed for reproducible "randomness", while `RandomGen` does not.  Both classes include methods described in point 4, but `RandomStable` specifies the exact algorithms to those methods and `RandomGen` does not.  At any time in the future, `RandomGen` can change its implementation to use a different RNG while remaining backward compatible, while `RandomStable` has to use the same algorithms for all time to remain backward compatible, especially because it takes a seed for reproducible "randomness".

<a id=Acknowledgments></a>
## Acknowledgments

I acknowledge&mdash;
- the commenters to the CodeProject version of this page (as well as a similar article of mine on CodeProject), including "Cryptonite" and member 3027120,
- Severin Pappadeux, and
- Lee Daniel Crocker, who reviewed this document and gave comments.

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> See also the question titled "Matlab rand and c++ rand()" on _Stack Overflow_.</small>

<small><sup id=Note2>(2)</sup> A distinction between _cryptographic_ and _noncryptographic_ RNGs seems natural, because many programming languages offer a general-purpose RNG (such as C's `rand` or Java's `java.util.Random`) and sometimes an RNG intended for information security purposes (such as Ruby's `SecureRandom`).</small>

<small><sup id=Note3>(3)</sup> F. Dörre and V. Klebanov, "Practical Detection of Entropy Loss in Pseudo-Random Number Generators", 2016.</small>

<small><sup id=Note4>(4)</sup> If the generator produces numbers with unequal probabilities, but is otherwise an RNG as defined here, then  _randomness extraction_ can make it produce numbers with closer to equal probabilities (see "[**Seed Generation**](#Seed_Generation)").</small>

<small><sup id=Note5>(5)</sup> See also the FIPS 200 definition ("The protection of information and information systems from unauthorized access, use, disclosure, disruption, modification, or destruction in order to provide confidentiality, integrity, and availability") and ISO/IEC 27000.</small>

<small><sup id=Note6>(6)</sup> Jones, D., "Good Practice in (Pseudo) Random Number Generation for Bioinformatics Applications", 2007/2010.</small>

<small><sup id=Note7>(7)</sup> P. L'Ecuyer, "Tables of Linear Congruential Generators of Different Sizes and Good Lattice Structure", _Mathematics of Computation_ 68(225), January 1999.</small>

<small><sup id=Note8>(8)</sup> Widynski, B., "Middle Square Weyl Sequence RNG", arXiv:1704.00358v1 [cs.CR], 2017.</small>

<small><sup id=Note9>(9)</sup> S. Vigna, "[**An experimental exploration of Marsaglia's `xorshift` generators, scrambled**](http://vigna.di.unimi.it/ftp/papers/xorshift.pdf)", 2016.</small>

<small><sup id=Note10>(10)</sup> Blackman, D., Vigna, S. "Scrambled Linear Pseudorandom Number Generators", 2018.</small>

<small><sup id=Note11>(11)</sup> However, some versions of GLSL (notably GLSL ES 1.0, as used by WebGL 1.0) might support integers with a restricted range (as low as -1024 to 1024) rather than 32-bit or bigger integers as are otherwise common, making it difficult to write hash functions for random number generation.  An application ought to choose hash functions that deliver acceptable "random" numbers regardless of the kinds of numbers supported.

An alternative for GLSL and other fragment or pixel shaders to support randomness is to have the shader sample a "noise texture" with random data in each pixel; for example, C. Peters, "[**Free blue noise textures**](http://momentsingraphics.de/?p=127)", _Moments in Graphics_, Dec. 22, 2016, discusses how so-called "blue noise" can be sampled this way.

See also N. Reed, "Quick And Easy GPU Random Numbers In D3D11", Nathan Reed's coding blog, Jan. 12, 2013.</small>

<small><sup id=Note12>(12)</sup> M&uuml;ller, S. "CPU Time Jitter Based Non-Physical True Random Number Generator".</small>

<small><sup id=Note13>(13)</sup> Liebow-Feeser, J., "Randomness 101: LavaRand in Production", blog.cloudflare.com, Nov. 6, 2017.</small>

<small><sup id=Note14>(14)</sup> Liebow-Feeser, J., "LavaRand in Production: The Nitty-Gritty Technical Details", blog.cloudflare.com, Nov. 6, 2017.</small>

<small><sup id=Note15>(15)</sup> These steps could also generate random numbers, rather than a seed, but this is generally slower than using PRNGs to do so.</small>

<small><sup id=Note16>(16)</sup> Also known as _entropy extraction_, _deskewing_, _whitening_, or _unbiasing_.</small>

<small><sup id=Note17>(17)</sup> Cliff, Y., Boyd, C., Gonzalez Nieto, J.  "How to Extract and Expand Randomness: A Summary and Explanation of Existing Results", 2009.</small>

<small><sup id=Note18>(18)</sup> Note that with the procedure given here, there is a risk that two processes will end up with the same PRNG seed, but this risk is often negligible, especially for PRNGs whose state length is 128 or more bits (see "[**Birthday problem**](https://en.wikipedia.org/wiki/Birthday_problem)").  As an alternative, some PRNGs, such as PCG64 and `sfc`, have multiple sequences (or _streams_) of numbers that behave like independent random number sequences, and they have efficient methods to assign a different stream to each process this way.  How these methods work is PRNG-specific and beyond the scope of this document.

P. L'Ecuyer, D. Munger, et al.  "Random Numbers for Parallel Computers: Requirements and Methods, With Emphasis on GPUs". April 17, 2015, section 4, goes in greater detail on ways to initialize PRNGs for generating random numbers in parallel, including how to ensure reproducible "randomness" this way if that is desired.</small>

<small><sup id=Note19>(19)</sup> Here, `IDENT` and `UNIQUE` form a _domain separation tag_; e.g., see the work-in-progress document `draft-irtf-cfrg-hash-to-curve`, "Hashing to Elliptic Curves".</small>

<small><sup id=Note20>(20)</sup> For most purposes, SHA-256 is a good choice for the hash function if the PRNG's state length is 256 bits or less.  Some PRNGs require nonzero seeds; in that case, if the seed is all zeros, add "-0" to the string and retry step 3 until the seed is not all zeros.</small>

<small><sup id=Note21>(21)</sup> For example, many questions on _Stack Overflow_ highlight the pitfalls of creating a new instance of .NET's `System.Random` each time a random number is needed, rather than only once in the application.  See also Johansen, R. S., "[**A Primer on Repeatable Random Numbers**](https://blogs.unity3d.com/2015/01/07/a-primer-on-repeatable-random-numbers/)", Unity Blog, Jan. 7, 2015.</small>

<small><sup id=Note22>(22)</sup> Using the similar `/dev/random` is NOT RECOMMENDED, since in some implementations it can block for seconds at a time, especially if not enough randomness is available.  See also [**"Myths about /dev/urandom"**](https://www.2uo.de/myths-about-urandom).</small>

<small><sup id=Note23>(23)</sup> Wetzels, J., "33C3: Analyzing Embedded Operating System Random Number Generators", samvartaka.github.io, Jan. 3, 2017.</small>

<small><sup id=Note24>(24)</sup> B. Peng, "Two Fast Methods of Generating True Random Numbers on the Arduino", GitHub Gist, December 2017.</small>

<small><sup id=Note25>(25)</sup> A. Klyubin, "Some SecureRandom Thoughts", Android Developers Blog, Aug. 14, 2013.</small>

<small><sup id=Note26>(26)</sup> Michaelis, K., Meyer, C., and Schwenk, J. "Randomly Failed! The State of Randomness in Current Java Implementations", 2013.</small>

<small><sup id=Note27>(27)</sup> More generally, a list has `N! / (W_1! * W_2! * ... * W_K!)` permutations (a [**multinomial coefficient**](http://mathworld.wolfram.com/MultinomialCoefficient.html)), where `N` is the list's size, `K` is the number of different items in the list, and `W_i` is the number of times the item identified by `i` appears in the list.  However, this number is never more than `N!` and suggests using less randomness, so an application need not use this more complicated formula and MAY assume that a list has `N!` permutations even if some of its items occur more than once.</small>

<small><sup id=Note28>(28)</sup> Atwood, Jeff. "[**The danger of na&iuml;vet&eacute;**](https://blog.codinghorror.com/the-danger-of-naivete/)", Dec. 7, 2007.</small>

<small><sup id=Note29>(29)</sup> van Staveren, Hans. [**"Big Deal: A new program for dealing bridge hands"**](https://sater.home.xs4all.nl/doc.html), Sep. 8, 2000</small>

<small><sup id=Note30>(30)</sup> For applications distributed across multiple computers, this check is made easier if each computer is assigned a unique value from a central database, because then the computer can use that unique value as part of unique identifiers it generates and ensure that the identifiers are unique across the application without further contacting other computers or the central database.</small>

<small><sup id=Note31>(31)</sup> In theory, generating two or more random integers of the same size runs the risk of producing a duplicate number this way.  However, this risk decreases as that size increases (see "[**Birthday problem**](https://en.wikipedia.org/wiki/Birthday_problem)").  For example, in theory, an application has a 50% chance for duplicate numbers after generating&mdash;
- about 2.7 billion billion random 122-bit integers (including those found in version-4 UUIDs, or universally unique identifiers),
- about 1.4 million billion billion random 160-bit integers, or
- about 93 billion billion billion random 192-bit integers.</small>

<small><sup id=Note32>(32)</sup> If an application expects end users to type in a unique identifier, it could find that very long unique identifiers are unsuitable for it (e.g. 128-bit numbers take up 32 base-16 characters).  There are ways to deal with these and other long identifiers, including (1) separating memorable chunks of the identifier with a hyphen, space, or another character (e.g., "ABCDEF" becomes "ABC-DEF"); (2) generating the identifier from a sequence of memorable words (as in Electrum or in Bitcoin's BIP39); or (3) adding a so-called "checksum digit" at the end of the identifier to guard against typing mistakes.  The application ought to consider trying (1) or (2) before deciding to use shorter identifiers than what this document recommends.</small>

<small><sup id=Note33>(33)</sup> Full-period PRNGs include some [**LCGs**](https://en.wikipedia.org/wiki/Linear_congruential_generator) and some [**linear-feedback shift register**](https://en.wikipedia.org/wiki/Linear-feedback_shift_register) (LFSR) generators.  For suggested LCGs, see P. L'Ecuyer, "Tables of Linear Congruential Generators of Different Sizes and Good Lattice Structure", _Mathematics of Computation_ 68(225), January 1999.  For LFSR generators, see P. Alfke, "Efficient Shift Registers, LFSR Counters, and Long Pseudo-Random Sequence Generators", Xilinx Application Note XAPP 052, July 7, 1996, which gives parameters for LFSR generators that cycle "randomly" through all but one _n_-bit integers.</small>

<small><sup id=Note34>(34)</sup> The following are some reasons an algorithm might produce different results from run to run or from machine to machine (making it an _inconsistent_ algorithm):

- Differences in how floating-point numbers and floating-point math operations are implemented, including rounding behavior and order of operations.  For example, programming environments could define math functions that don't always give the same answer for the same input, or might differ between implementations (e.g., Java's `Math` vs. `StrictMath`, or the x87 `FSIN` instruction vs. a software implementation of sine).  For more information, see "[**Floating-Point Determinism**](https://randomascii.wordpress.com/2013/07/16/floating-point-determinism/)" by Bruce Dawson, and the white paper "[**Floating Point and IEEE 754 Compliance for NVIDIA GPUs**](https://docs.nvidia.com/cuda/floating-point/)".
- The algorithm uses features that are not deterministic (output can vary even if input and state are the same), such as accessing the file system or the system clock.
- The algorithm relies on undocumented, undefined, or implementation-dependent behavior or features (such as  _undefined behavior_ in C and C++, a particular hash table traversal order, or a particular size for C/C++'s `int` or `long`).</small>

<small><sup id=Note35>(35)</sup> Note that although PRNGs can also act like hash functions (if they're seeded with the input and the PRNG is "large enough" for the input), some PRNGs (such as `xorshift128+`) are not well suited to serve as hash functions, because they don't mix their state before generating a random number from that state.</small>

<small><sup id=Note36>(36)</sup> There are many kinds of noise, such as procedural noise (including Perlin noise, cellular noise, and value noise), [**colored noise**](https://en.wikipedia.org/wiki/Colors_of_noise) (including white noise and pink noise), periodic noise, and noise following a Gaussian or other [**probability distribution**](https://peteroupc.github.io/randomfunc.html#Specific_Non_Uniform_Distributions).  See also two articles by Red Blob Games: [**"Noise Functions and Map Generation"**](http://www.redblobgames.com/articles/noise/introduction.html) and [**"Making maps from noise functions"**](https://www.redblobgames.com/maps/terrain-from-noise/).</small>

<small><sup id=Note37>(37)</sup> Noise functions include functions that combine several outputs of a noise function, including by [**fractional Brownian motion**](https://en.wikipedia.org/wiki/Fractional_Brownian_motion).  By definition, noise functions are deterministic.</small>

<small><sup id=Note38>(38)</sup> Verifiable delay functions are different from proofs of work, in which there can be multiple correct answers. These functions were first formally defined in Boneh, D., Bonneau, J., et al., "Verifiable Delay Functions", 2018, but such functions appeared earlier in Lenstra, A.K., Wesolowski, B., "A random zoo: sloth, unicorn, and trx", 2015.</small>

<small><sup id=Note39>(39)</sup> It is outside the scope of this page to explain how to build a protocol using verifiable delay functions, commitment schemes, or mental card game schemes, especially because such protocols are not yet standardized for general use and few implementations of them are used in production.</small>

<small><sup id=Note40>(40)</sup> Implementing a cryptographic RNG involves many security considerations, including these:

1. If an application runs code from untrusted sources in the same operating system process in which a cryptographic RNG's state is stored, it's possible for malicious code to read out that state via side-channel attacks. A cryptographic RNG SHOULD NOT be implemented in such a process. See (A) and see also (B).
2. A cryptographic RNG's state could be reused due to process forking or virtual machine snapshot resets.  See (C) and (D), for example.
3. If a cryptographic RNG is not "constant-time" (the RNG is data-dependent), its timing differences could be exploited in a security attack.

(A) "Post-Spectre Threat Model Re-Think" in the Chromium source code repository (May 29, 2018).<br/>(B) Bernstein, D.J. "Entropy Attacks!", Feb. 5, 2014.<br/>(C) Everspaugh, A., Zhai, Y., et al. "Not-So-Random Numbers in Virtualized Linux and the Whirlwind RNG", 2014.<br/>(D) Ristenpart, T., Yilek, S. "When Good Randomness Goes Bad: Virtual Machine Reset Vulnerabilities and Hedging Deployed Cryptography", 2010.</small>

<small><sup id=Note41>(41)</sup> Such arbitrary data can include process identifiers, time stamps, environment variables, random numbers, virtual machine guest identifiers, and/or other data specific to the session or to the instance of the RNG.  See also NIST SP800-90A and the previous note.</small>

<small><sup id=Note42>(42)</sup> Bernstein, D.J.  "Fast-key-erasure random number generators", Jun. 23, 2017.</small>

<small><sup id=Note43>(43)</sup> For example, a new RNG can be constructed from two independent RNGs using the so-called "shrinking generator" technique: generate one bit from the first RNG and one bit from the second, and take the second bit if the first bit is 1, or repeat this process otherwise.  See J. D. Cook, "Using one RNG to sample another", June 4, 2019, for more on this technique, including its advantages and drawbacks.</small>

<small><sup id=Note44>(44)</sup> Allowing applications to do so would hamper forward compatibility &mdash; the API would then be less free to change how the RNG is implemented in the future (e.g., to use a cryptographic or otherwise "better" RNG), or to make improvements or bug fixes in methods that use that RNG (such as shuffling and Gaussian number generation).  (As a notable example, the V8 JavaScript engine recently changed its `Math.random()` implementation to use a variant of `xorshift128+`, which is backward compatible because nothing in JavaScript allows  `Math.random()` to be seeded.)  Nevertheless, APIs can still allow applications to provide additional input ("entropy") to the RNG in order to increase its randomness rather than to ensure repeatability.</small>

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

<a id=Bays_ndash_Durham_Shuffle></a>
### Bays&ndash;Durham Shuffle

The Bays&ndash;Durham shuffle extends a PRNG's period (maximum size of a "random" number cycle) by giving it a bigger state. Generally, for a size of `tablesize`, the period is extended to about the number of ways to arrange a list of size `tablesize`.  The following describes the Bays&ndash;Durham shuffle with a size of `tablesize`. (C++'s `shuffle_order_engine` implements something similar to the shuffle described below.) For PRNGs that output 32- or 64-bit integers 0 or greater, a `tablesize` of 256, 512, or 1024 is suggested.

- To initialize, fill a list with as many numbers from the PRNG as `tablesize`, then set `k` to another number from the PRNG.
- For each "random" number, take the entry at position (`k` % `tablesize`) in the list, where '%' is the remainder operator and positions start at 0, then set `k` to that entry, then replace the entry at that position with a new number from the PRNG, then output `k`.

The Bays&ndash;Durham shuffle is NOT RECOMMENDED for information security purposes.

<a id=License></a>
## License

This page is licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
