<a id=Testing_PRNGs_for_High_Quality_Randomness></a>
## Testing PRNGs for High-Quality Randomness

According to my document on pseudorandom number generator (PRNG) recommendations, a high-quality PRNG&mdash;

> generates bits that behave like independent uniform random bits (at least for nearly all practical purposes outside of information security)[,]

a requirement called the "independence requirement" in this short document.

To determine whether a PRNG meets the independence requirement, its output should be sent to the PractRand program by Chris Doty-Humphrey and pass the PractRand tests at 1 TiB (2^40 bytes) or greater.

To determine whether nearby sequences of the PRNG meet the independence requirement, the output passed to PractRand should consist of one output from the first sequence, one output from the second, another output from the first, another from the second, and so on.

There are several kinds of nearby sequences to test for this purpose:

- The original PRNG state, and the state produced by discarding a huge number of PRNG outputs in an efficient way.
- A PRNG initialized with one seed, and the PRNG initialized with the same seed, except one of the seed's bits is flipped (see also "[**The wrap-up on PCG generators**](http://pcg.di.unimi.it/pcg.php#flaws)").

In general, counter-based PRNGs based on hash functions (such as MD5, SHA-1, MurmurHash, CityHash, xxHash) will meet the independence requirement if the following hash stream (for that hash function) passes the PractRand tests at 1 TiB or greater:

1. Write out the hash code of `seed + "_" + counter`.
2. Write out the hash code of `(seed+1) + "_" + counter`.
3. Add 1 to `counter` and repeat this process.

In general, a hash function that passes is worthy of mention if it's noncryptographic and faster than hash functions designed for cryptography, such as MD5 and the SHA family.
