# A Note on Randomness Extraction

[**Peter Occil**](mailto:poccil14@gmail.com)

_Randomness extraction_ (also known as _unbiasing_, _debiasing_, _deskewing_, _whitening_, or _entropy extraction_) is a set of techniques for generating unbiased random bits from biased sources.  This note covers some useful extraction techniques.

<a id=In_Information_Security></a>
## In Information Security

In information security, randomness extraction serves to generate a seed, password, encryption key, or other secret value from hard-to-predict nondeterministic sources.

Randomness extraction for information security is discussed in NIST SP 800-90B sec. 3.1.5.1, and RFC 4086 sec. 4.2 and 5.2. Possible choices of such extractors include keyed cryptographic hash functions (see, e.g., (Cliff et al., 2009)<sup>[**(1)**](#Note1)</sup>; (Coretti et al., 2019)<sup>[**(2)**](#Note2)</sup>) and two-universal hash functions with a fixed but randomly chosen seed (Frauchiger et al., 2013)<sup>[**(3)**](#Note3)</sup>. In information security applications:

- Unkeyed hash functions and other unkeyed extraction functions should not be used by themselves in randomness extraction.
- Lossless compression should not be used as a randomness extractor.
- Where possible, there should be two or more independent nondeterministic sources from which to apply randomness extraction.

Some papers also refer to two-source extractors and resilient functions (especially the works by E. Chattopadhyay and D. Zuckerman), but there are few if any real implementations of these extraction techniques.

> **Example:** The Cliff reference reviewed the use of HMAC (hash-based message authentication code) algorithms, and implies that one way to generate a seed is as follows:
>
> 1. Gather data with at least 512 bits of entropy.
> 2. Run HMAC-SHA-512 with that data to generate a 512-bit HMAC.
> 3. Take the first 170 (or fewer) bits as the seed (512 divided by 3, rounded down).

<a id=Outside_of_Information_Security></a>
## Outside of Information Security

Outside of information security, randomness extraction serves the purpose of recycling randomly generated numbers or, more generally, to transform those numbers from one form to another while preserving their randomness.  This can be done, for example, to reduce calls to a pseudorandom number generator (PRNG) or to generate a new seed for such a PRNG.

Perhaps the most familiar example of randomness extraction is the one by von Neumann (1951)<sup>[**(4)**](#Note4)</sup>:

1. Flip a coin twice (whose bias is unknown).
2. If the coin lands heads then tails, return heads.  If it lands tails then heads, return tails.  If neither is the case, go to step 1.

An algorithm found in (Morina et al. 2019)<sup>[**(5)**](#Note5)</sup> extends this to loaded dice.  According to personal communication with K. Łatuszyński, the key "is to find two non overlapping events of the same probability" via "symmetric events {X_1 < X_2}  and  {X_2 < X_1} that have the same probability".

1. Throw a die twice (whose bias is unknown), call the results _X_ and _Y_, respectively.
2. If _X_ is less than _Y_, return 0.  If _X_ is greater than _Y_, return 1.  If neither is the case, go to step 1.

> **Note:** In fact, the algorithm above appears to be a special case of a procedure given as a remark near the end of a paper by Camion (1974)<sup>[**(6)**](#Note6)</sup>.  The algorithm works regardless of what numbers _X_ and _Y_ can take on and with what probability, and even if the "dice" are loaded differently, as long as the chance that the first "die" shows a number less than the second "die" is the same as the chance that the first "die" shows a greater number, and as long as each _pair_ of throws is independent of any other.<sup>[**(14)**](#Note14)</sup>.  Here are some of the many examples where this algorithm works: (1) Set _X_ and _Y_ to two independent Gaussian random numbers with a mean of 0 but a different standard deviation. Or... (2) Set _X_ and _Y_ to two independent uniform(0, 1) random numbers.  Or... (3) Set _X_ and _Y_ to two independent uniform(0, 1) random numbers, then set _Y_ to (_X_+_Y_)/2.

Pae (2005)<sup>[**(7)**](#Note7)</sup> and (Pae and Loui 2006)<sup>[**(8)**](#Note8)</sup> characterize _extracting functions_.  Informally, an _extracting function_ is a function that maps a fixed number of digits to a variable number of bits such that, whenever the input has a given number of ones, twos, etc., every output bit-string of a given length is as likely to occur as every other output bit-string of that length, regardless of the input's bias.<sup>[**(9)**](#Note9)</sup>  Among others, von Neumann's extractor and the one by Peres (1992)<sup>[**(10)**](#Note10)</sup> are extracting functions.  The Peres extractor takes a list of bits (zeros and ones with the same bias) as input and is described as follows:

1. Create two empty lists named U and V. Then, while two or more bits remain:
    1. If the next two bits are 0/0, append 0 to U and 0 to V.
    2. Otherwise, if those bits are 0/1, append 1 to U, then write a 0.
    3. Otherwise, if those bits are 1/0, append 1 to U, then write a 1.
    4. Otherwise, if those bits are 1/1, append 0 to U and 1 to V.
2. Run this algorithm recursively, with the bits placed in U.
3. Run this algorithm recursively, with the bits placed in V.

A streaming algorithm, which builds something like an "extractor tree", is another example of a randomness extractor (Zhou and Bruck 2012)<sup>[**(11)**](#Note11)</sup>.

I maintain [**source code of this extractor and the Peres extractor**](https://github.com/peteroupc/peteroupc.github.io/blob/master/rextract.rb), which also includes additional notes on randomness extraction.

Pae's "entropy-preserving" binarization (Pae 2020)<sup>[**(12)**](#Note12)</sup>, given below, is meant to be used in other extractor algorithms such as the ones mentioned above.  It assumes the number of possible values, _n_, is known. However, it is obviously not efficient if _n_ is a large number.

1. Let _f_ be a number in the interval \[0, _n_) that was previously randomly generated.  If _f_ is greater than 0, output a 1 (and go to step 2).
2. If _f_ is less than _n_ &minus; 1, output a 0 _x_ times, where _x_ is (_n_ &minus; 1) &minus; _f_.

Some additional notes:

- Different kinds of random numbers should not be mixed in the same extractor stream.  For example, if one source outputs random 6-sided die results, another source outputs random sums of rolling 2 six-sided dice, and a third source outputs coin flips with a bias of 0.75, there should be three extractor streams (for instance, three extractor trees that implement the Zhou and Bruck algorithm).
- Hash functions, such as those mentioned in my [**examples of high-quality PRNGs**](https://peteroupc.github.io/hqrand.html#Counter_Based_PRNGs), also serve to produce random-behaving numbers from a variable number of bits.  In general, they can't be extracting functions; however, their output can serve as input to an extraction algorithm.
- Peres (1992)<sup>[**(10)**](#Note10)</sup> warns that if a program takes enough biased bits so that the extracting function outputs _m_ bits with them, those _m_ bits will not be uniformly distributed.  Instead, the extracting function should be passed blocks of biased bits, one block at a time (where each block should have a fixed length of at least 2 bits), until _m_ bits or more are generated by the extractor this way.
- The lower bound on the average number of coin flips needed to turn a biased coin into an unbiased coin is as follows (and is a special case of the _entropy bound_; see, e.g., (Pae 2005)<sup>[**(7)**](#Note7)</sup>, (Peres 1992)<sup>[**(10)**](#Note10)</sup>): ln(2) / ((&lambda; &minus; 1) * ln(1 &minus; &lambda;) &minus; &lambda; * ln(&lambda;)), where &lambda; is the bias of the input coin and ranges from 0 for always tails to 1 for always heads.  According to this formula, a growing number of coin flips is needed if the input coin is strongly biased towards heads or tails.  (For certain values of &lambda;, Kozen (2014)<sup>[**(13)**](#Note13)</sup> showed a tighter lower bound of this kind, but this bound is non-trivial and assumes &lambda; is known.)

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Cliff, Y., Boyd, C., Gonzalez Nieto, J. "How to Extract and Expand Randomness: A Summary and Explanation of Existing Results", 2009.</small>
- <small><sup id=Note2>(2)</sup> Coretti, S., Dodis, Y., et al., "Seedless Fruit is the Sweetest: Random Number Generation, Revisited", 2019.</small>
- <small><sup id=Note3>(3)</sup> Frauchiger, D., Renner, R., Troyer, M., "True randomness from realistic quantum devices", 2013.</small>
- <small><sup id=Note4>(4)</sup> von Neumann, J., "Various techniques used in connection with random digits", 1951.</small>
- <small><sup id=Note5>(5)</sup> Morina, G., Łatuszyński, K., et al., "[**From the Bernoulli Factory to a Dice Enterprise via Perfect Sampling of Markov Chains**](https://arxiv.org/abs/1912.09229v1)", arXiv:1912.09229v1 [math.PR], 2019.</small>
- <small><sup id=Note6>(6)</sup> Camion, Paul, "Unbiased die rolling with a biased die", North Carolina State University. Dept. of Statistics, 1974.</small>
- <small><sup id=Note7>(7)</sup> Pae, S., "Random number generation using a biased source", dissertation, University of Illinois at Urbana-Champaign, 2005.</small>
- <small><sup id=Note8>(8)</sup> Pae, S., Loui, M.C., "Randomizing functions: Simulation of discrete probability distribution using a source of unknown distribution", _IEEE Transactions on Information Theory_ 52(11), November 2006.</small>
- <small><sup id=Note9>(9)</sup> It follows from this definition that an extracting function must map an all-X string (such as an all-zeros string) to the empty string, since there is only one empty string but more than one string of any other length.  Thus, no reversible function can be extracting, and a function that never returns an empty string (including nearly all hash functions) can't be extracting, either.</small>
- <small><sup id=Note10>(10)</sup> Peres, Y., "Iterating von Neumann's procedure for extracting random bits", Annals of Statistics 1992,20,1, p. 590-597.</small>
- <small><sup id=Note11>(11)</sup> Zhou, H. and Bruck, J., "[**Streaming algorithms for optimal generation of random bits**](https://arxiv.org/abs/1209.0730)", arXiv:1209.0730 [cs.IT], 2012.</small>
- <small><sup id=Note12>(12)</sup> S. Pae, "[**Binarization Trees and Random Number Generation**](https://arxiv.org/abs/1602.06058v2)", arXiv:1602.06058v2 [cs.DS].</small>
- <small><sup id=Note13>(13)</sup> Kozen, D., [**"Optimal Coin Flipping"**](http://www.cs.cornell.edu/~kozen/Papers/Coinflip.pdf), 2014.</small>
- <small><sup id=Note14>(14)</sup> More formally, P(X &lt; Y) must be equal to P(X &gt; Y).  This relationship is similar to but not exactly the same as _statistical preference_ (Montes Gutiérrez, I., "Comparison of alternatives under uncertainty and imprecision", doctoral thesis, Universidad de Oviedo, 2014). Both notions work even if _X_ and _Y_ are dependent on each other but independent of everything else; this is easy to see if we treat _X_ and _Y_ as a single random "vector" \[_X_, _Y_\].</small>

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
