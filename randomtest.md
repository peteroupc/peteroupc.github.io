<a id=Testing_PRNGs_for_High_Quality_Randomness></a>
## Testing PRNGs for High-Quality Randomness

According to my document on [**pseudorandom number generator (PRNG) recommendations**](https://peteroupc.github.io/random.html), a high-quality PRNG, among other requirements&mdash;

> generates bits that behave like independent uniform random bits (at least for nearly all practical purposes outside of information security)[,]

a requirement called the "independence requirement" in this short document.

To determine whether a PRNG meets the independence requirement, its output should be sent to the PractRand program by Chris Doty-Humphrey and pass the PractRand tests at 1 TiB (2^40 bytes) or greater.  For more information, see "[**How to Test with PractRand**](https://github.com/peteroupc/peteroupc.github.io/blob/master/randomtest.md)" by M. E. O'Neill.

To determine whether nearby sequences of the PRNG meet the independence requirement, the output sent to PractRand should consist of one output from the first sequence, one output from the second, another output from the first, another from the second, and so on.

There are several kinds of nearby sequences to test for this purpose:

- The original PRNG state, and the state produced by discarding a huge number of PRNG outputs in an efficient way.
- A PRNG initialized with one seed, and the PRNG initialized with the same seed, except one of the seed's bits is flipped (see also "[**The wrap-up on PCG generators**](http://pcg.di.unimi.it/pcg.php#flaws)").

**Hash functions and counter-based PRNGs.** In general, counter-based PRNGs based on hash functions (such as MD5, SHA-1, MurmurHash, CityHash, xxHash) will meet the independence requirement if the following hash stream (for that hash function) passes the PractRand tests at 1 TiB or greater:

1. Write out the hash code of `seed + "_" + counter`.
2. Write out the hash code of `(seed+1) + "_" + counter`.
3. Add 1 to `counter` and go to the first step.

In general, a hash function that passes is worthy of mention if it's noncryptographic and faster than hash functions designed for cryptography, such as MD5 and the SHA family.

**Splittable PRNGs.** For so-called "splittable" PRNGs, Schaathun, H.G., "Evaluation of Splittable Pseudo-Random Generators", 2015, suggests four random number sequences for testing purposes.  They use the PRNG's `split` and `generate` operations.

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
