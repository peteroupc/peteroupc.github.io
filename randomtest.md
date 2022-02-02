<a id=Testing_PRNGs_for_High_Quality_Randomness></a>
## Testing PRNGs for High-Quality Randomness

[**Peter Occil**](mailto:poccil14@gmail.com)

According to my document on [**pseudorandom number generator (PRNG) recommendations**](https://peteroupc.github.io/random.html), a high-quality PRNG, among other requirements&mdash;

> generates bits that behave like independent uniform random bits (at least for nearly all practical purposes outside of information security)[,]

a requirement called the "independence requirement" in this short document.

To determine whether a PRNG meets the independence requirement, its output should be sent to the PractRand program by Chris Doty-Humphrey and show no failures ("FAILs") in the PractRand tests at 1 TiB (2^40 bytes) or greater.  For more information, see "[**How to Test with PractRand**](http://www.pcg-random.org/posts/how-to-test-with-practrand.html)" by M. E. O'Neill.

**Random number streams.** Many PRNGs use different strategies to produce nearby sequences (or _streams_) of pseudorandom numbers.  But not every strategy produces _independent_ streams.  To determine whether nearby sequences of the PRNG meet the independence requirement, the output sent to PractRand should be formed by interleaving the outputs of those sequences (for example, one output from the first sequence, one output from the second, another output from the first, another from the second, and so on).

There are several kinds of nearby sequences to test for this purpose:

- The original PRNG state, and the state produced by discarding a huge number of PRNG outputs in an efficient way ("[**jump-ahead**](https://peteroupc.github.io/jump.html)").  That number can matter.
- Two or more PRNGs initialized with consecutive seeds.
- Two or more PRNGs initialized with seeds that differ from each other by one bit (see also "[**The wrap-up on PCG generators**](http://pcg.di.unimi.it/pcg.php#flaws)").

The _leapfrogging_ technique involves assigning N processes each a PRNG that differs from the last by 1 step, then having each such PRNG advance N steps, where N is the number of PRNGs, each time it generates a random number.  However, note that testing nearby sequences produced by leapfrogging is redundant with testing the regular PRNG sequence without streams.

**Hash functions and counter-based PRNGs.** In general, a _counter-based PRNG_ produces pseudorandom numbers by transforming a seed and a _counter_; with each number, it increments the counter and leaves the seed unchanged (Salmon et al. 2011\)[^1].  The seed and counter can be transformed using block ciphers, other permutation functions, or hash functions.  In general, counter-based PRNGs that use hash functions (such as MD5, SHA-1, MurmurHash, CityHash, xxHash) will meet the independence requirement if the following hash stream (for that hash function) doesn't fail the PractRand tests at 1 TiB or greater:

1. Write out the hash code of `seed || 0x5F || counter` (the `||` symbol means concatenation).
2. Write out the hash code of `(seed+1) || 0x5F || counter`.
3. Add 1 to `counter` and go to the first step.

In general, a hash function without PractRand failures is worthy of mention if it's noncryptographic and faster than hash functions designed for cryptography, such as MD5 and the SHA family.

**Combined PRNGs.** As G. Marsaglia (in KISS), D. Jones (in JKISS), and A. Fog (2015\)[^2] have recognized, combining two or more PRNGs of weaker quality often leads to a higher-quality PRNG.  It might be possible to convert a PRNG that isn't high-quality to a high-quality PRNG in one of the following ways:

- If the PRNG has at least 128 bits of state and uses a _permutation function_[^3] `P(x)` to transform that state, have the PRNG generate each number as follows instead:
     1. Add 1 (or another odd constant[^4]) to the state (using wraparound addition).
     2. Output either `P(state)` or `S(P(state))`, where `S(x)` is one of the four _scramblers_ defined in (Blackman and Vigna 2019\)[^5] \(+, ++, \*, \*\*).
- If the PRNG admits 2<sup>63</sup> or more seeds and outputs N-bit numbers, then each number it outputs can be _combined_ with the next number from a sequence that cycles through at least 2<sup>128</sup> numbers, to produce a new N-bit number. (These two numbers can be combined via XOR or wraparound addition if they have the same size, or via hashing.) This sequence can be one of the following:
     - A _Weyl sequence_ (a sequence formed by wraparound addition of a constant odd number).
     - A _permutation function_ of an incrementing counter that starts at 0.
     - A PRNG with a fixed seed and a single cycle of 2<sup>128</sup> or more numbers, such as a linear congruential generator.
- If the PRNG admits 2<sup>63</sup> or more seeds, has a minimum cycle length of 2<sup>128</sup> or more, and outputs N-bit numbers, each number it outputs can be _combined_ with the next number from another PRNG to produce a new N-bit number.
- If the PRNG has a single cycle of at least 2<sup>63</sup>, admits that many seeds, and outputs N-bit numbers, each number it outputs can be _combined_ with the next number from another PRNG to produce a new N-bit number.

_Other combinations and transformations._  There are other ways to combine two PRNGs, or to transform a single PRNG, but they are not preferred ways to build a _high-quality PRNG_.  They include:

- Keeping some outputs and discarding others (as in RANLUX).
- The [**Bays&ndash;Durham shuffle**](https://peteroupc.github.io/bdshuffle.html) (as in C++'s `shuffle_block_engine`).
- Transforming a PRNG's outputs with a permutation function (for example, Mersenne Twister's "tempering").
- The "shrinking generator" technique, which takes each bit from one PRNG only if the corresponding bit from another PRNG is set (see (Cook 2019\)[^6]).
- "Self-shrinking" and von Neumann unbiasing (von Neumann 1951)[^8], which each transform a PRNG based on pairs of output bits.

**Splittable PRNGs.** A _splittable PRNG_ consists of two operations: a `split` operation to create multiple new internal states from one, and a `generate` operation to produce a pseudorandom number from a state (Schaathun 2015; Claessen et al., 2013\)[^7]. The Schaathun paper surveys several known constructions of splittable PRNGs.  Some of the constructions can be used by any PRNG, but do not necessarily lead to high-quality splittable PRNGs.

The Schaathun paper suggests the following four random number sequences for testing purposes:

- Sequence suggested in section 5.5:
    1. Set `seed` and `g` to `split(seed)[0]` and `split(seed)[1]`, respectively.
    2. Set `t` to `split(split(g)[0])`, write out `generate(t[0])`, and write out `generate(t[1])`.
    3. Set `t` to `split(split(g)[1])`, write out `generate(t[0])`, and write out `generate(t[1])`.
    4. Go to the first step.
- Sequence SL (section 5.6): Set `seed` and `g` to `split(seed)[1]` and `split(seed)[0]`, respectively, and write out `generate(g)`. Go to the first step.
- Sequence SR (section 5.6): Set `seed` and `g` to `split(seed)[0]` and `split(seed)[1]`, respectively, and write out `generate(g)`. Go to the first step.
- Sequence SA (section 5.6):
    1. Set `seed` and `g` to `split(seed)[1]` and `split(seed)[0]`, respectively, and write out `generate(g)`.
    2. Set `seed` and `g` to `split(seed)[0]` and `split(seed)[1]`, respectively, and write out `generate(g)`.
    3. Go to the first step.

<a id=Notes></a>
## Notes

[^1]: Salmon, John K., Mark A. Moraes, Ron O. Dror, and David E. Shaw. "Parallel random numbers: as easy as 1, 2, 3." In _Proceedings of 2011 International Conference for High Performance Computing, Networking, Storage and Analysis_, pp. 1-12. 2011.

[^2]: Agner Fog, "[**Pseudo-Random Number Generators for Vector Processors and Multicore Processors**](http://digitalcommons.wayne.edu/jmasm/vol14/iss1/23)", _Journal of Modern Applied Statistical Methods_ 14(1), article 23 (2015).

[^3]: A _permutation function_ (or _bijection_) is a reversible mapping from N-bit integers to N-bit integers.  Examples include: JSF64 by B. Jenkins; MIX and MIX-i (part of Tyche and Tyche-i); the Romu family by Mark Overton; block ciphers with a fixed key; mixing functions with reversible operations as described in "[**Hash functions**](https://papa.bretmulvey.com/post/124027987928)" by B. Mulvey.

[^4]: As [**P. Evensen shows**](https://mostlymangling.blogspot.com/2018/07/on-mixing-functions-in-fast-splittable.html#testing_with_practrand), the choice of constant can matter for a given permutation function.

[^5]: Blackman, D., Vigna, S., "Scrambled Linear Pseudorandom Number Generators", 2019.

[^6]: J. D. Cook, "Using one RNG to sample another", June 4, 2019.

[^7]: Schaathun, H.G. "Evaluation of Splittable Pseudo-Random Generators", 2015; Claessen, K., et al. "Splittable Pseudorandom Number Generators using Cryptographic Hashing", Proceedings of Haskell Symposium 2013, pp. 47-58.

[^8]: von Neumann, J., "Various techniques used in connection with random digits", 1951.
