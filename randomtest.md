<a id=Testing_PRNGs_for_High_Quality_Randomness></a>
## Testing PRNGs for High-Quality Randomness

According to my document on [**pseudorandom number generator (PRNG) recommendations**](https://peteroupc.github.io/random.html), a high-quality PRNG, among other requirements&mdash;

> generates bits that behave like independent uniform random bits (at least for nearly all practical purposes outside of information security)[,]

a requirement called the "independence requirement" in this short document.

To determine whether a PRNG meets the independence requirement, its output should be sent to the PractRand program by Chris Doty-Humphrey and pass the PractRand tests at 1 TiB (2^40 bytes) or greater.  For more information, see "[**How to Test with PractRand**](https://github.com/peteroupc/peteroupc.github.io/blob/master/randomtest.md)" by M. E. O'Neill.

**Random number streams.** Many PRNGs use different strategies to produce nearby sequences (or _streams_) of pseudorandom numbers.  But not every strategy produces _independent_ streams.  To determine whether nearby sequences of the PRNG meet the independence requirement, the output sent to PractRand should consist of one output from the first sequence, one output from the second, another output from the first, another from the second, and so on.

There are several kinds of nearby sequences to test for this purpose:

- The original PRNG state, and the state produced by discarding a huge number of PRNG outputs in an efficient way.  That number can matter; one suggestion found in [**NumPy documentation**](https://docs.scipy.org/doc/numpy/reference/random/parallel.html) is the maximum cycle length divided by the golden ratio.
- Two or more PRNGs initialized with consecutive seeds.
- Two or more PRNGs initialized with seeds that differ from each other by one bit (see also "[**The wrap-up on PCG generators**](http://pcg.di.unimi.it/pcg.php#flaws)").

**Hash functions and counter-based PRNGs.** In general, a _counter-based PRNG_ produces pseudorandom numbers by transforming a seed and a _counter_; with each number, it increments the counter and leaves the seed unchanged (Salmon, J.K.; Moraes, M.A.; et al., "Parallel Random Numbers: As Easy as 1, 2, 3", 2011).  The seed and counter can be transformed using block ciphers, other permutations, or hash functions.  In general, counter-based PRNGs based on hash functions (such as MD5, SHA-1, MurmurHash, CityHash, xxHash) will meet the independence requirement if the following hash stream (for that hash function) passes the PractRand tests at 1 TiB or greater:

1. Write out the hash code of `seed + "_" + counter`.
2. Write out the hash code of `(seed+1) + "_" + counter`.
3. Add 1 to `counter` and go to the first step.

In general, a hash function that passes is worthy of mention if it's noncryptographic and faster than hash functions designed for cryptography, such as MD5 and the SHA family.

**Splittable PRNGs.** A _splittable PRNG_ consists of two operations: a `split` operation to create multiple internal states from one, and a `generate` operation to produce a pseudorandom number from a state (see Schaathun, H.G. "Evaluation of Splittable Pseudo-Random Generators", 2015; Claessen, K., et al. "Splittable Pseudorandom Number Generators using Cryptographic Hashing", _Proceedings of Haskell Symposium 2013_, pp. 47-58).  The Schaathun paper surveys several known constructions of splittable PRNGs.  Some of the constructions can be used by any PRNG, but do not necessarily lead to high-quality splittable PRNGs.

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

**Combined PRNGs.** As G. Marsaglia (in KISS), D. Jones (in JKISS), and A. Fog (Pseudo-Random Number Generators for Vector Processors and Multicore Processors", Journal of Modern Applied Statistical Methods 14(1), article 23 (2015)) have recognized, combining two or more PRNGs of weaker quality often leads to a higher-quality PRNG.  Examples of combined PRNGs include:

1. The top N bits of `P(C)`, where `P` is an `N * 2`-bit or longer permutation of an incrementing counter `C` (Salmon, et al., 2011).
2. `(PRNG() xor LCG()) mod 2^N`, where `PRNG` is a PRNG admitting 2<sup>63</sup> or more seeds and outputting `N` bits, and `LCG` is an `N`-bit or longer linear congruential generator or Weyl sequence (Weyl sequences are used, e.g., in G. Marsaglia's XORWOW and B. Widynski's MSWS).
3. `(PRNG() xor P(C)) mod 2^N`, where `PRNG` is a PRNG admitting 2<sup>63</sup> or more seeds and outputting `N` bits, and `P` is an `N * 2`-bit or longer permutation of an incrementing counter `C`.
4. A PRNG described in (2) or (3), except with wraparound addition rather than `xor`.

In the examples above, if N is 64 or greater and the combined PRNG meets the independence requirement in this document, it will count as a high-quality PRNG.

Other examples of combining two PRNGs include the "shrinking generator" technique (J. D. Cook, "Using one RNG to sample another", June 4, 2019), or an XOR or wraparound addition of the PRNGs' outputs.

**Transformed PRNGs.** A single PRNG can be transformed to one with higher quality, but the new PRNG is generally slower.  Examples of such transformations include "self-shrinking"; keeping some outputs and discarding others (as in RANLUX); and the Bays&ndash;Durham shuffle (as in C++'s `shuffle_block_engine`).
