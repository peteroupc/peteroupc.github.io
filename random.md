# Random Number Generator Recommendations for Applications

[**Peter Occil**](mailto:poccil14@gmail.com)

Begun on Mar. 5, 2016; last updated on Apr. 26, 2018.

Most apps that use random numbers care about either unpredictability or speed/high quality.

<a id=Introduction_and_Summary></a>
## Introduction and Summary

As I see it, there are two kinds of random number generators (RNGs) needed by most applications, namely&mdash;
- _statistical-random generators_, which seek to generate numbers that follow a uniform random distribution, and
- _unpredictable-random generators_, which seek to generate numbers that are cost-prohibitive to predict.

**This document covers:**

- Statistical-random and unpredictable-random generators, as well as recommendations on their use and properties.
- A discussion on when an application that needs numbers that "seem" random should specify their own "seed" (the initial state that the numbers are based on).
- An explanation of what programming language interfaces implement statistical-random and unpredictable-random generators, as well as advice on implementing them in programming languages.
- Issues on shuffling with an RNG.

**This document does not cover:**

- Testing an RNG implementation for adequate random number generation.
- Applications for which the selection of RNGs is constrained by statutory or regulatory requirements.

**The following table summarizes the kinds of RNGs covered in this document:**

| Kind of RNG   | When to Use This RNG  | Examples |
 --------|--------|------|
| [**Unpredictable-Random**](#Unpredictable_Random_Generators)   | In information security cases, or when speed is not a concern.  | `/dev/urandom`, `BCryptGenRandom` |
| [**Statistical-Random**](#Statistical_Random_Generators)   | When information security is not a concern, but speed is.  See also [**"Shuffling"**](#Shuffling).| `xoroshiro128+`, `xorshift128+` |
| [**Seeded PRNG**](#Seeded_Random_Generators)   | When generating reproducible results in a way not practical otherwise.   | Statistical-random quality PRNG with custom seed |

<a id=Contents></a>
## Contents

- [**Introduction and Summary**](#Introduction_and_Summary)
- [**Contents**](#Contents)
- [**Definitions**](#Definitions)
- [**Unpredictable-Random Generators**](#Unpredictable_Random_Generators)
    - [**Quality**](#Quality)
    - [**Seeding and Reseeding**](#Seeding_and_Reseeding)
    - [**Examples**](#Examples)
- [**Statistical-Random Generators**](#Statistical_Random_Generators)
    - [**Quality**](#Quality_2)
    - [**Seeding and Reseeding**](#Seeding_and_Reseeding_2)
    - [**Examples and Non-Examples**](#Examples_and_Non_Examples)
- [**Seeded Random Generators**](#Seeded_Random_Generators)
    - [**Seeding Recommendations**](#Seeding_Recommendations)
    - [**Seedable PRNG Recommendations**](#Seedable_PRNG_Recommendations)
    - [**Examples**](#Examples_2)
        - [**Games**](#Games)
        - [**Unit Testing**](#Unit_Testing)
        - [**Verifiable Random Numbers**](#Verifiable_Random_Numbers)
        - [**Noise**](#Noise)
- [**Programming Language APIs**](#Programming_Language_APIs)
- [**Advice for New Programming Language APIs**](#Advice_for_New_Programming_Language_APIs)
- [**Shuffling**](#Shuffling)
    - [**Shuffling Method**](#Shuffling_Method)
    - [**Choosing from Among All Permutations**](#Choosing_from_Among_All_Permutations)
- [**Hash Functions**](#Hash_Functions)
- [**GPU Programming Environments**](#GPU_Programming_Environments)
- [**Motivation**](#Motivation)
- [**Conclusion**](#Conclusion)
    - [**Request for Comments**](#Request_for_Comments)
- [**Notes**](#Notes)
- [**License**](#License)

<a id=Definitions></a>
## Definitions

The following definitions are helpful in better understanding this document.

- **Random number generator (RNG).** Software and/or hardware that seeks to generate independent numbers that seem to occur by chance and that are approximately uniformly distributed<sup>[**(1)**](#Note1)</sup>.
- **Pseudorandom number generator (PRNG).** A random number generator that outputs seemingly random numbers using a deterministic algorithm (that is, an algorithm that returns the same output for the same input and state every time) and without making explicit use of nondeterminism.
- **Seed.**  Arbitrary data for initializing the state of a PRNG.
- **State length.**  The maximum size of the seed a PRNG can take to initialize its state without truncating or compressing that seed.
- **Period.** The maximum number of values in a generated sequence for a PRNG before that sequence repeats.  The period will not be greater than 2<sup>_L_</sup> where _L_ is the PRNG's _state length_.
- **Stable.** A programming interface is _stable_ if it has no behavior that is unspecified, implementation-dependent, nondeterministic, or subject to future change.
- **Information security.** Defined in ISO/IEC 27000.

<a id=Unpredictable_Random_Generators></a>
## Unpredictable-Random Generators

Unpredictable-random implementations (also known as "cryptographically strong" or "cryptographically secure" RNGs) seek to generate random numbers that are cost-prohibitive to predict.  Such implementations are indispensable in information security contexts, such as&mdash;

-  generating keying material, such as encryption keys,
-  generating random passwords, nonces, or session identifiers,
-  generating "salts" to vary hash codes of the same password,
-  use in communications between two networked computers,
-  use in transfer, transport, messaging, and other communication protocols, and
-  cases (such as in multiplayer networked games) when predicting future random numbers would give a player or user a significant and unfair advantage.

They are also useful in cases where the application generates random numbers so infrequently that the RNG's speed is not a concern.

An unpredictable-random implementation ultimately relies on one or more _nondeterministic sources_ (sources that don't always return the same output for the same input) for random number generation.  Sources that are reasonably fast for most applications (for instance, by producing very many random bits per second), especially sources implemented in hardware, are highly advantageous here, since an implementation for which such sources are available can rely less on PRNGs, which are deterministic and benefit from reseeding as explained later.

<a id=Quality></a>
### Quality

An unpredictable-random implementation generates uniformly distributed random bits such that it would be at least cost-prohibitive for an outside party to guess either prior or future unseen bits of the random sequence correctly with more than a 50% chance per bit, even with knowledge of the randomness-generating procedure, the implementation's internal state at the given point in time, and/or extremely many outputs of the RNG. (If the sequence was generated directly by a PRNG, ensuring future bits are unguessable this way should be done wherever the implementation finds it feasible; for example, see "Seeding and Reseeding".)

<a id=Seeding_and_Reseeding></a>
### Seeding and Reseeding

If an unpredictable-random implementation uses a PRNG, the following requirements apply.

The PRNG's _state length_ must be at least 128 bits and should be at least 256 bits.

Before an instance of the RNG generates a random number, it must have been initialized ("seeded") with an _unpredictable seed_, defined as follows. The seed&mdash;
- must consist of data which meets the quality requirement described earlier, which does not contain, in whole or in part, the PRNG's own output, and which ultimately derives from one or more nondeterministic sources (such data may be mixed with other arbitrary data as long as the result is no less cost-prohibitive to predict), and
- must be at least the same size as the PRNG's _state length_.

The RNG should be reseeded from time to time (using a newly generated _unpredictable seed_) to help ensure the unguessability of the output. If the implementation reseeds, it must do so before it generates more than 2<sup>67</sup> bits without reseeding and should do so&mdash;
- before it generates more than 2<sup>32</sup> bits without reseeding, and
- not later than a set time span (e.g., one hour) after the RNG was last seeded or reseeded.

<a id=Examples></a>
### Examples

Examples of unpredictable-random implementations include the following:
- The `/dev/random` device on many Unix-based operating systems, which generally uses only nondeterministic sources; however, in some implementations of the device it can block for seconds at a time, especially if not enough randomness ("entropy") is available.
- The `/dev/urandom` device on many Unix-based operating systems, which often relies on both a PRNG and the same nondeterministic sources used by `/dev/random`.
- The `BCryptGenRandom` method in recent Windows-based systems.
- Two-source extractors, multi-source extractors, or cryptographic [**hash functions**](#Hash_Functions) that take very hard-to-predict signals from two or more nondeterministic sources as input.  Such sources include, where available&mdash;
    - disk access timings,
    - keystroke timings,
    - thermal noise, and
    - A. Seznec's technique called hardware volatile entropy gathering and expansion, provided a high-resolution counter is available.

<a id=Statistical_Random_Generators></a>
## Statistical-Random Generators

Statistical-random generators are used, for example, in simulations, numerical integration, and many games to bring an element of chance and variation to the application, with the goal that each possible outcome is equally likely. However, statistical-random generators are generally suitable only if&mdash;

-  information security is not involved, and
-  the application generates random numbers so frequently that it would slow down undesirably if an unpredictable-random implementation were used instead.

If more than 20 items are being shuffled, a concerned application would be well advised to use alternatives to this kind of implementation (see [**"Shuffling"**](#Shuffling)).

A statistical-random implementation is usually implemented with a PRNG, but can also be implemented in a similar way as an unpredictable-random implementation provided it remains reasonably fast.

<a id=Quality_2></a>
### Quality

A statistical-random implementation generates random bits, each of which is uniformly randomly distributed independently of the other bits, at least for nearly all practical purposes.  If the implementation uses a PRNG, that PRNG algorithm's expected number of state transitions before a cycle occurs and its expected number of state transitions during a cycle must each be at least 2<sup>32</sup>. The RNG need not be equidistributed.

<a id=Seeding_and_Reseeding_2></a>
### Seeding and Reseeding

If a statistical-random implementation uses a PRNG, the following requirements apply.

The PRNG's _state length_ must be at least 64 bits, should be at least 128 bits, and is encouraged to be as high as the implementation can go to remain reasonably fast for most applications.

Before an instance of the RNG generates a random number, it must have been initialized ("seeded") with a seed described as follows. The seed&mdash;
- must consist of data not known _a priori_ by the implementation, such as random bits from an unpredictable-random implementation,
- must not contain, in whole or in part, the RNG's own output,
- must not be a fixed value, a nearly fixed value, or a user-entered value,
- is encouraged not to consist of a timestamp (especially not a timestamp with millisecond or coarser granularity)<sup>[**(2)**](#Note2)</sup>, and
- must be at least the same size as the PRNG's _state length_.

The implementation is encouraged to reseed itself from time to time (using a newly generated seed as described earlier), especially if the PRNG has a _state length_ less than 238 bits. If the implementation reseeds, it should do so before it generates more values than the square root of the PRNG's period without reseeding.

<a id=Examples_and_Non_Examples></a>
### Examples and Non-Examples

Examples of statistical-random generators include the following:
- XorShift\* 128/64 (state length 128 bits; nonzero seed).
- XorShift\* 64/32 (state length 64 bits; nonzero seed).
- `xoroshiro128+` (state length 128 bits; nonzero seed &mdash; but see note in the [**source code**](http://xoroshiro.di.unimi.it/xoroshiro128plus.c) about the lowest bit of the PRNG's outputs).
- `Lehmer128` (state length 128 bits).
- `JKISS` on top of page 3 of Jones 2010 (state length 128 bits; seed with four 32-bit nonzero pieces).
- C++'s [**`std::ranlux48` engine**](http://www.cplusplus.com/reference/random/ranlux48/) (state length 577 bits; nonzero seed).
- PCG (classes named `pcg32`, `pcg64`, and `pcg64_fast`; state lengths 127, 255, and 127 bits, respectively) by Melissa O'Neill.

Non-examples include the following:
- Mersenne Twister shows a [**systematic failure**](http://xoroshiro.di.unimi.it/#quality) in one of the tests in `BigCrush`, part of L'Ecuyer and Simard's "TestU01". (See also S. Vigna, "[**An experimental exploration of Marsaglia's `xorshift` generators, scrambled**](http://vigna.di.unimi.it/ftp/papers/xorshift.pdf)", as published in the `xoroshiro128+` website.)
- Any [**linear congruential generator**](https://en.wikipedia.org/wiki/Linear_congruential_generator) with modulus 2<sup>63</sup> or less (such as `java.util.Random` and C++'s `std::minstd_rand` and `std::minstd_rand0` engines) has a _state length_ of less than 64 bits.  (See also the Wikipedia article for further problems with linear congruential generators.)

<a id=Seeded_Random_Generators></a>
## Seeded Random Generators

In addition, some applications use pseudorandom number generators (PRNGs) to generate results based on apparently-random principles, starting from a known initial state, or "seed". Such applications usually care about reproducible results. (Note that in the definitions for [**unpredictable-random**](#Unpredictable_Random_Generators) and [**statistical-random**](#Statistical_Random_Generators) generators given earlier, the PRNGs involved are automatically seeded before use.)

<a id=Seeding_Recommendations></a>
### Seeding Recommendations

An application should use a PRNG with a seed it specifies (rather than an automatically-initialized PRNG or another kind of RNG) only if&mdash;

1. the initial state (the seed) which the "random" result will be generated from&mdash;
    - is hard-coded,
    - was based on user-entered data,
    - is known to the application and was generated using an [**unpredictable-random**](#Unpredictable_Random_Generators) or [**statistical-random**](#Statistical_Random_Generators) implementation (as defined earlier),
    - is a [**verifiable random number**](#Verifiable_Random_Numbers) (as defined later), or
    - is based on a timestamp (but only if the reproducible result is not intended to vary during the time specified on the timestamp and within the timestamp's granularity; for example, a year/month/day timestamp for a result that varies only daily),
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

<a id=Seedable_PRNG_Recommendations></a>
### Seedable PRNG Recommendations

Which PRNG to use for generating reproducible results depends on the application. But as recommendations, any PRNG algorithm selected for producing reproducible results&mdash;

- should meet or exceed the quality requirements of a statistical-random implementation,
- should be reasonably fast, and
- should have a _state length_ of 64 bits or greater.

<a id=Examples_2></a>
### Examples

Custom seeds can come into play in the following situations, among others.

<a id=Games></a>
#### Games

Many kinds of games generate game content using apparently-random principles, such as&mdash;

- procedurally generated maps for a role-playing game,
- [**shuffling**](#Shuffling) a digital deck of cards for a solitaire game, or
- a game board or puzzle board that normally varies every session,

where the game might need to generate the same content of that kind multiple times.

In general, such a game should use a PRNG with a custom seed for such purposes only if&mdash;

1. generating the random content uses relatively many random numbers (say, more than a few thousand), and the application finds it impractical to store or distribute the content or the numbers for later use (see recommendations 2 and 3), or
2. the game makes the seed (or a "code" or "password" based on the seed, such as a barcode or a string of letters and digits) accessible to the player, to allow the player to regenerate the content (see recommendations 2 and 3).

Option 1 often applies to games that generate procedural terrain for game levels, since the terrain often exhibits random variations over an extended space.  Option 1 is less suitable for puzzle game boards or card shuffling, since much less data needs to be stored.

Suppose a game generates a map with random terrain and shows the player a "code" to generate that map. Under recommendation 4, the game&mdash;

- may change the algorithm it uses to generate random maps, but
- should use, in connection with the new algorithm, "codes" that can't be confused with "codes" it used for previous algorithms, and
- should continue to generate the same random map using an old "code" when the player enters it, even after the change to a new algorithm.

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

Randomly generated numbers can serve as _noise_, that is, a randomized variation in images and sound.  (See also Red Blob Games, [**"Noise Functions and Map Generation"**](http://www.redblobgames.com/articles/noise/introduction.html))<sup>[**(3)**](#Note3)</sup>.  In general, the same considerations apply to any RNGs the noise implementation uses as in other cases.

However, special care should be taken if the noise implementation implements [**cellular noise**](https://en.wikipedia.org/wiki/Cellular_noise), [**value noise**](https://en.wikipedia.org/wiki/Value_noise), or [**gradient noise**](https://en.wikipedia.org/wiki/Gradient_noise) (such as [**Perlin noise**](https://en.wikipedia.org/wiki/Perlin_noise)) and uses one of the following techniques:
- The implementation should use a **table of "hard-coded" gradients or hash values** only if the noise generation meets the [**seeding recommendations**](#Seeding_Recommendations) (treating the table as the seed).
- If the noise implementation **incorporates a [**hash function**](#Hash_Functions)**&mdash;
    - that hash function should be reasonably fast, be _stable_ (see [**"Definitions"**](#Definitions)), and have the so-called _avalanche property_, and
    - the noise implementation should be initialized in advance with arbitrary data of fixed length to provide to the hash function as part of its input, if the [**seeding recommendations**](#Seeding_Recommendations) apply to the noise generation.

Wherever feasible, a cellular, value, or gradient noise implementation should **use an RNG to initialize a table of gradients or hash values** in advance, to be used later by the _noise function_ (a function that outputs seemingly random numbers given an _n_-dimensional point).

<a id=Programming_Language_APIs></a>
## Programming Language APIs

The following table lists application programming interfaces (APIs) implementing
unpredictable-random and statistical-random RNGs for popular programming languages. Note the following:

- In single-threaded applications, for each kind of RNG, it's encouraged to create a single instance of the RNG on application startup and use that instance throughout the application.
- In multithreaded applications, for each kind of RNG, it's encouraged to either&mdash;
    - create a single thread-safe instance of the RNG on application startup and use that instance throughout the application, or
    - store separate and independently-initialized instances of the RNG in thread-local storage, so that each thread accesses a different instance (this might not always be ideal for unpredictable-random RNGs).
- Methods and libraries mentioned in the "Statistical-random" column need to be initialized with a full-length seed before use (for example, a seed generated using an implementation in the "Unpredictable-random" column).
- The mention of a third-party library in this section does not imply sponsorship or endorsement
of that library, or imply a preference of that library over others. The list is not comprehensive.

| Language   | Unpredictable-random   | Statistical-random | Other |
 --------|-----------------------------------------------|------|------|
| C/C++ (G)  | (C) | [**`xoroshiro128plus.c`**](http://xoroshiro.di.unimi.it/xoroshiro128plus.c) (128-bit nonzero seed); [**`xorshift128plus.c`**](http://xoroshiro.di.unimi.it/xorshift128plus.c) (128-bit nonzero seed) |
| Python | `secrets.SystemRandom` (since Python 3.6); `os.urandom()`| [**ihaque/xorshift**](https://github.com/ihaque/xorshift) library (128-bit nonzero seed; default seed uses `os.urandom()`) | `random.getrandbits()` (A); `random.seed()` (19,936-bit seed) (A) |
| Java (D) | (C); `java.security.SecureRandom` (F) |  [**grunka/xorshift**](https://github.com/grunka/xorshift) (`XORShift1024Star` or `XORShift128Plus`) | |
| JavaScript | `crypto.randomBytes(byteCount)` (node.js only) | [**`xorshift`**](https://github.com/AndreasMadsen/xorshift) library | `Math.random()` (ranges from 0 through 1) (B) |
| Ruby | (C); `SecureRandom` class (`require 'securerandom'`) |  | `Random#rand()` (ranges from 0 through 1) (A) (E); `Random#rand(N)` (integer) (A) (E); `Random.new(seed)` (default seed uses entropy) |

<small>

(A) Default general RNG implements the [**Mersenne Twister**](https://en.wikipedia.org/wiki/Mersenne_Twister), which doesn't
meet the statistical-random requirements, strictly speaking, but might be adequate for many applications due to its extremely long period.

(B) JavaScript's `Math.random` is implemented using `xorshift128+` in the latest V8 engine, Firefox, and certain other modern browsers as of late 2017; the exact algorithm to be used by JavaScript's `Math.random` is "implementation-dependent", though, according to the ECMAScript specification.

(C) See [**"Advice for New Programming Language APIs"**](#Advice_for_New_Programming_Language_APIs) for implementation notes for unpredictable-random implementations.

(D) Java's `java.util.Random` class uses a 48-bit seed, so doesn't meet the statistical-random requirements.  However, a subclass of `java.util.Random` might be implemented to meet those requirements.

(E) In my opinion, Ruby's `Random#rand` method presents a beautiful and simple API for random number generation.

(F) At least in Unix-based systems, calling the `SecureRandom` constructor that takes a byte array is recommended. The byte array should be data described in note (C).

(G) [**`std::random_device`**](http://en.cppreference.com/w/cpp/numeric/random/random_device), introduced in C++11, is not recommended because its specification leaves considerably much to be desired.  For example,  `std::random_device` can fall back to a pseudorandom number generator of unspecified quality without much warning.

</small>

<a id=Advice_for_New_Programming_Language_APIs></a>
## Advice for New Programming Language APIs

Wherever possible, applications should use existing libraries and techniques that already meet the requirements for unpredictable-random and statistical-random RNGs.  For example&mdash;
- an unpredictable-random implementation can&mdash;
    - read from the `/dev/urandom` and/or `/dev/random` devices in most Unix-based systems (using the `open` and `read` system calls where available),
    - call the `getentropy` method on OpenBSD, or
    - call the `BCryptGenRandom` API in recent Windows-based systems,

    and only use other techniques if the existing solutions are inadequate in certain respects or in certain circumstances, and
- a statistical-random implementation can use a PRNG algorithm mentioned as an example in the [**statistical-random generator**](#Statistical_Random_Generators) section.

If existing solutions are inadequate, a programming language API could implement unpredictable-random and statistical-random RNGs by filling an output byte buffer with random bytes, where each bit in each byte will be randomly set to 0 or 1.  For instance, a C language API for unpredictable-random generators could look like the following: `int random(uint8_t[] bytes, size_t size);`, where "bytes" is a pointer to a byte array, and "size" is the number of random bytes to generate, and where 0 is returned if the method succeeds and nonzero otherwise. Any programming language API that implements such RNGs by filling a byte buffer ought to run in amortized linear time on the number of random bytes the API will generate.

Unpredictable-random and statistical-random implementations&mdash;
- should be reasonably fast for most applications, and
- should be safe for concurrent use by multiple threads, whenever convenient.

My document on [**random number generation methods**](https://peteroupc.github.io/randomfunc.html) includes details on
eleven uniform random number methods; in my opinion, a new programming language's standard library ought to include
those eleven methods separately for unpredictable-random and for statistical-random generators. That document also
discusses how to implement other methods to generate random numbers or integers that follow a given distribution (such
as a normal, geometric, binomial, or discrete weighted distribution) or fall within a given range.

<a id=Shuffling></a>
## Shuffling

There are special considerations in play when applications use RNGs to shuffle a list of items.

<a id=Shuffling_Method></a>
### Shuffling Method

The first consideration touches on the shuffling method.  The [**Fisher&ndash;Yates shuffle method**](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle) does a substantially unbiased shuffle of a list, assuming the RNG it uses can choose from among all permutations of that list.  However, that method is also easy to mess up (see also Jeff Atwood, "[**The danger of na&iuml;vet&eacute;**](https://blog.codinghorror.com/the-danger-of-naivete/)"); I give a correct implementation in [**another document**](https://peteroupc.github.io/randomfunc.html).

<a id=Choosing_from_Among_All_Permutations></a>
### Choosing from Among All Permutations

The second consideration is present if the application uses PRNGs for shuffling. If the PRNG's period is less than the number of distinct permutations (arrangements) of a list, then there are some permutations that PRNG can't choose when it shuffles that list. (This is not the same as _generating_ all permutations of a list, which, for a sufficiently large list size, can't be done by any computer in a reasonable time.)

The number of distinct permutations is the [**multinomial coefficient**](http://mathworld.wolfram.com/MultinomialCoefficient.html) _m_! / (_w_<sub>1</sub>! &times; _w_<sub>2</sub>! &times; ... &times; _w_<sub>_n_</sub>!), where _m_ is the list's size, _n_ is the number of different items in the list, _x_! means "_x_ [**factorial**](https://en.wikipedia.org/wiki/Factorial)", and _w_<sub>_i_</sub> is the number of times the item identified by _i_ appears in the list. (This reduces to _n_!, if the list consists of _n_ different items).

Formulas suggesting state lengths for PRNGs are implemented below in Python.  For example, to shuffle a 52-item list, a PRNG with state length 226 or more is suggested, and to shuffle two 52-item lists of identical contents together, a PRNG with state length 500 or more is suggested.

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
      """ Suggested state length for PRNGs that shuffle
        a list of n items. """
      return ceillog2(fac(n))

    def stateLengthNChooseK(n, k):
      """ Suggested state length for PRNGs that choose k
       different items randomly from a list of n items
       (see RFC 3797, sec. 3.3) """
      return ceillog2(fac(n)/(fac(k)*fac(n-k)))

    def stateLengthDecks(numDecks, numCards):
      """ Suggested state length for PRNGs that shuffle
        multiple decks of cards in one. """
      return ceillog2(fac(numDecks*numCards)/ \
          (fac(numDecks)**numCards))

Whenever a [**statistical-random implementation**](#Statistical_Random_Generators) or [**seeded RNG**](#Seeded_Random_Generators) is otherwise called for, an application is encouraged to choose a PRNG with a state length suggested by the formulas above (and with the highest feasible period for that state length), where the choice of PRNG is based on&mdash;

- the maximum size of lists the application is expected to shuffle, if that number is less than 100; otherwise,
- the average size of such lists; or, if the application chooses,
- the application shuffling 100-item lists (which usually means a state length of 525 or greater).

(Practically speaking, for sufficiently large list sizes, any given PRNG will not be able to randomly choose some permutations of the list.  See also "Lack of randomness" in the [**BigDeal document by van Staveren**](https://sater.home.xs4all.nl/doc.html).)

The PRNG chosen this way&mdash;
- should meet or exceed the quality requirements of a statistical-random implementation, and
- should have been initialized automatically with an _unpredictable seed_ before use.

<a id=Hash_Functions></a>
## Hash Functions

A seemingly random number can be generated from arbitrary data using a _hash function_.

A _hash function_ is a function that takes an arbitrary input of any size (such as a sequence of bytes or a sequence of characters) and returns an output with a fixed size. That output is also known as a _hash code_. (By definition, hash functions are deterministic.  The definition includes a PRNG that takes the input as a seed and outputs a random number of fixed size<sup>[**(4)**](#Note4)</sup>.)

A hash code can be used as follows:
- The hash code can serve as a seed for a PRNG, and the desired random numbers can be generated from that PRNG.  (See my document on [**random number generation methods**](https://peteroupc.github.io/randomfunc.html) for techniques.)
- If a number of random bits is needed, and the hash code has at least that many bits, then that many bits can instead be taken directly from the hash code.

For such purposes, applications should choose hash functions designed such that&mdash;
- every bit of the input affects every bit of the output without a clear preference for 0 or 1 (the so-called _avalanche property_), and
- if the hash function's use implicates information security, then&mdash;
    - it is at least cost-prohibitive to find an unknown second input that leads to the same output as that of a given input (the _one-way property_), and
    - it is at least cost-prohibitive to find an unknown input that leads to a given output (_collision resistance_).

<a id=GPU_Programming_Environments></a>
## GPU Programming Environments

Because, in general, GL Shading Language (GLSL) and other programming environments designed for execution on a graphics processing unit (GPU)&mdash;
- have limited access to some system resources compared with other programming environments,
- are designed for parallel execution, and
- do not store state,

random number generators for such environments are often designed as [**hash functions**](#Hash_Functions), because their output is determined solely by the input rather than both the input and state (as with PRNGs).  Moreover, some of the hash functions which have been written in GLSL give undesirable results in computers whose GPUs support only 16-bit binary floating point numbers and no other kinds of numbers, which makes such GPUs an important consideration when choosing a hash function.

<a id=Motivation></a>
## Motivation

In this document, I made the distinction between _statistical-random_ and _unpredictable-random_ generators because that is how programming languages often present random number generators &mdash; they usually offer a general-purpose RNG (such as C's `rand` or Java's `java.util.Random`) and sometimes an RNG intended for information security purposes (such as `java.security.SecureRandom`).

What has motivated me to write a more rigorous definition of random number generators is the fact that many applications still use weak RNGs.  In my opinion, this is largely because most popular programming languages today&mdash;
- specify few and weak requirements on RNGs (such as [**C's `rand`**](http://en.cppreference.com/w/cpp/numeric/random/rand)),
- specify a relatively weak general-purpose RNG (such as Java's `java.math.Random`, although it also includes a much stronger `SecureRandom` class),
- implement RNGs by default that leave a bit to be desired (particularly the Mersenne Twister algorithm found in PHP's `mt_rand` as well as in Python and Ruby),
- seed RNGs with a timestamp by default (such as the [**.NET Framework implementation of `System.Random`**](https://docs.microsoft.com/dotnet/api/system.random)), and/or
- leave the default seeding fixed.

<a id=Conclusion></a>
## Conclusion

In conclusion, most applications that require random numbers usually want either unpredictability ("cryptographic security"), or speed and high quality. I believe that RNGs that meet the descriptions specified in the [**Unpredictable-Random Generators**](#Unpredictable_Random_Generators) and [**Statistical-Random Generators**](#Statistical_Random_Generators) sections will meet the needs of those applications.

In addition, this document recommends using unpredictable-random implementations in many cases, especially in information security contexts, and recommends easier programming interfaces for both unpredictable-random and statistical-random implementations in new programming languages.

I acknowledge&mdash;
- the commenters to the CodeProject version of this page (as well as a similar article of mine on CodeProject), including "Cryptonite" and member 3027120, and
- Lee Daniel Crocker, who reviewed this document and gave comments.

<a id=Request_for_Comments></a>
### Request for Comments

Feel free to send comments. They could help improve this page.

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

<small><sup id=Note1>(1)</sup> If a number generator uses a nonuniform distribution, but otherwise meets this definition, then it can be converted to one with a uniform distribution, at least in theory, by applying the nonuniform distribution's [**_cumulative distribution function_**](https://en.wikipedia.org/wiki/Cumulative_distribution_function) (CDF) to each generated number.  A CDF returns, for each number, the probability for a randomly generated variable to be equal to or less than that number; the probability is 0 or greater and 1 or less. Further details on CDFs or this kind of conversion are outside the scope of this document.</small>

<small><sup id=Note2>(2)</sup> This statement appears because multiple instances of a PRNG automatically seeded with a timestamp, when they are created at about the same time, run the risk of starting with the same seed and therefore generating the same sequence of random numbers.</small>

<small><sup id=Note3>(3)</sup> Noise implementations include cellular noise, value noise, gradient noise, [**colored noise**](https://en.wikipedia.org/wiki/Colors_of_noise) (including white noise and pink noise), and noise following a Gaussian or other [**probability distribution**](https://peteroupc.github.io/randomfunc.html#Specific_Non_Uniform_Distributions). A noise implementation can use [**fractional Brownian motion**](https://en.wikipedia.org/wiki/Fractional_Brownian_motion) to combine several layers of cellular, value, or gradient noise by calling the underlying noise function several times.

Note that usual implementations of noise (other than cellular, value, or gradient noise) don't sample each point of the sample space more than once; rather, all the samples are generated (e.g., with an RNG), then, for colored noise, a filter is applied to the samples.</small>

<small><sup id=Note4>(4)</sup> Note that some PRNGs (such as `xorshift128+`) are not well suited to serve as hash functions, because they don't mix their state before generating a random number from that state.</small>

<a id=License></a>
## License

This page is licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
