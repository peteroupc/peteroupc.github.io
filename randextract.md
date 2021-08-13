# A Note on Randomness Extraction

[**Peter Occil**](mailto:poccil14@gmail.com)

_Randomness extraction_ (also known as _unbiasing_, _debiasing_, _deskewing_, _whitening_, or _entropy extraction_) is a set of techniques for generating unbiased random bits from biased sources.  This note covers some useful extraction techniques.

<a id=In_Information_Security></a>
## In Information Security

In information security, randomness extraction serves to generate a seed, password, encryption key, or other secret value from hard-to-predict nondeterministic sources.

Randomness extraction for information security is discussed in NIST SP 800-90B sec. 3.1.5.1, and RFC 4086 sec. 4.2 and 5.2. Possible choices of such extractors include keyed cryptographic hash functions (see, e.g., (Cliff et al., 2009)<sup>[**(1)**](#Note1)</sup>; (Coretti et al., 2019)<sup>[**(2)**](#Note2)</sup>) and two-universal hash functions with a fixed but randomly chosen seed (Frauchiger et al., 2013)<sup>[**(3)**](#Note3)</sup>. In information security applications:

- Unkeyed hash functions and other unkeyed extraction functions should not be used by themselves in randomness extraction.
- Lossless compression should not be used as a randomness extractor.
- Where possible, there should be two or more independent nondeterministic sources from which to apply randomness extraction (McInnes and Pinkas 1990)<sup>[**(4)**](#Note4)</sup>.

Some papers also refer to two-source extractors and resilient functions (especially the works by E. Chattopadhyay and D. Zuckerman), but there are few if any real implementations of these extraction techniques.

> **Example:** The Cliff reference reviewed the use of HMAC (hash-based message authentication code) algorithms, and implies that one way to generate a seed is as follows:
>
> 1. Gather data with at least 512 bits of entropy.
> 2. Run HMAC-SHA-512 with that data to generate a 512-bit HMAC.
> 3. Take the first 170 (or fewer) bits as the seed (512 divided by 3, rounded down).

<a id=Outside_of_Information_Security></a>
## Outside of Information Security

Outside of information security, randomness extraction serves the purpose of recycling randomly generated numbers or, more generally, to transform those numbers from one form to another while preserving their randomness.  This can be done, for example, to reduce calls to a pseudorandom number generator (PRNG) or to generate a new seed for such a PRNG.

Perhaps the most familiar example of randomness extraction is the one by von Neumann (1951)<sup>[**(5)**](#Note5)</sup>, which works if "independence of successive [coin] tosses is assumed"<sup>[**(6)**](#Note6)</sup>:

1. Flip a coin twice (whose probability of heads is unknown).
2. If the coin lands heads then tails, return heads.  If it lands tails then heads, return tails.  If neither is the case, go to step 1.

An algorithm found in (Morina et al. 2019)<sup>[**(7)**](#Note7)</sup> (called **Algorithm M** in this note) extends this to loaded dice.  According to personal communication with K. Łatuszyński, the key "is to find two non overlapping events of the same probability" via "symmetric events {X_1 < X_2}  and  {X_2 < X_1} that have the same probability".

1. Throw a (loaded) die, call the result _X_.  Throw the die again, call the result _Y_.
2. If _X_ is less than _Y_, return 0.  If _X_ is greater than _Y_, return 1.  If neither is the case, go to step 1.

Algorithm M in fact works in a surprisingly broad range of cases; for more, see the [**appendix**](#Appendix).

Pae (2005)<sup>[**(8)**](#Note8)</sup> and (Pae and Loui 2006)<sup>[**(9)**](#Note9)</sup> characterize _extracting functions_.  Informally, an _extracting function_ is a function that maps a fixed number of digits to a variable number of bits such that, whenever the input has a given number of ones, twos, etc., every output bit-string of a given length is as likely to occur as every other output bit-string of that length, regardless of the input's probability of zero or one.<sup>[**(10)**](#Note10)</sup>  Among others, von Neumann's extractor and the one by Peres (1992)<sup>[**(11)**](#Note11)</sup> are extracting functions.  The Peres extractor takes a list of bits (zeros and ones generated from a "coin" with a given probability of heads) as input and is described as follows:

1. Create two empty lists named U and V. Then, while two or more bits remain in the input:
    1. If the next two bits are 0/0, append 0 to U and 0 to V.
    2. Otherwise, if those bits are 0/1, append 1 to U, then write a 0.
    3. Otherwise, if those bits are 1/0, append 1 to U, then write a 1.
    4. Otherwise, if those bits are 1/1, append 0 to U and 1 to V.
2. If U is not empty, do a separate (recursive) run of this algorithm, reading from the bits placed in U.
3. If V is not empty, do a separate (recursive) run of this algorithm, reading from the bits placed in V.

A streaming algorithm, which builds something like an "extractor tree", is another example of a randomness extractor (Zhou and Bruck 2012)<sup>[**(12)**](#Note12)</sup>.

I maintain [**source code of this extractor and the Peres extractor**](https://github.com/peteroupc/peteroupc.github.io/blob/master/rextract.rb), which also includes additional notes on randomness extraction.

Pae's "entropy-preserving" binarization (Pae 2018)<sup>[**(13)**](#Note13)</sup>, given below, is meant to be used in other extractor algorithms such as the ones mentioned above.  It assumes the number of possible values, _n_, is known. However, it is obviously not efficient if _n_ is a large number.

1. Let _f_ be a number in the interval \[0, _n_) that was previously randomly generated.  If _f_ is greater than 0, write a 1 (and go to step 2).
2. If _f_ is less than _n_ &minus; 1, write a 0 _x_ times, where _x_ is (_n_ &minus; 1) &minus; _f_.

Some additional notes:

1. Different kinds of random numbers should not be mixed in the same extractor stream.  For example, if one source outputs random 6-sided die results, another source outputs random sums of rolling 2 six-sided dice, and a third source outputs coin flips with a probability of heads of 0.75, there should be three extractor streams (for instance, three extractor trees that implement the Zhou and Bruck algorithm).
2. Hash functions, such as those mentioned in my [**examples of high-quality PRNGs**](https://peteroupc.github.io/hqrand.html#Counter_Based_PRNGs), also serve to produce random-behaving numbers from a variable number of bits.  In general, they can't be extracting functions; however, as long as their output has more bits than used to produce it, that output can serve as input to an extraction algorithm.
3. Peres (1992)<sup>[**(11)**](#Note11)</sup> warns that if a program takes enough input bits (such as flips of a coin with unknown probability of heads) so that the extracting function outputs _m_ bits with them, those _m_ bits will not be uniformly distributed.  Instead, the extracting function should be passed blocks of input bits, one block at a time (where each block should have a fixed length of at least 2 bits), until _m_ bits or more are generated by the extractor this way.
4. Extractors that maintain state, such as the Zhou and Bruck extractor tree, should be used only on sources whose distribution does not change significantly over time.  Dividing the source into blocks, as in the previous note, and assigning one extractor instance to each block, can improve robustness for sources whose distribution can change over time.
5. The lower bound on the average number of coin flips needed to turn a biased coin into an unbiased coin is as follows (and is a special case of the _entropy bound_; see, e.g., (Pae 2005)<sup>[**(8)**](#Note8)</sup>, (Peres 1992)<sup>[**(11)**](#Note11)</sup>): ln(2) / ((&lambda; &minus; 1) * ln(1 &minus; &lambda;) &minus; &lambda; * ln(&lambda;)), where &lambda; is the probability of heads of the input coin and ranges from 0 for always tails to 1 for always heads.  According to this formula, a growing number of coin flips is needed if the input coin strongly leans towards heads or tails.  (For certain values of &lambda;, Kozen (2014)<sup>[**(14)**](#Note14)</sup> showed a tighter lower bound of this kind, but this bound is non-trivial and assumes &lambda; is known.)

Devroye and Gravel (2020)<sup>[**(15)**](#Note15)</sup> suggest a special randomness extractor to reduce the number of random bits needed to produce a batch of samples by a sampling algorithm.  The extractor works based on the probability that the algorithm consumes _X_ random bits to produce a specific output _Y_.  Since the algorithm seems not to be well developed, I discuss this extractor in detail elsewhere, in "[**Miscellaneous Notes on Randomization**](https://peteroupc.github.io/randmisc.html)".

<a id=Notes></a>
## Notes

- <small><sup id=Note1>(1)</sup> Cliff, Y., Boyd, C., Gonzalez Nieto, J. "How to Extract and Expand Randomness: A Summary and Explanation of Existing Results", 2009.</small>
- <small><sup id=Note2>(2)</sup> Coretti, S., Dodis, Y., et al., "Seedless Fruit is the Sweetest: Random Number Generation, Revisited", 2019.</small>
- <small><sup id=Note3>(3)</sup> Frauchiger, D., Renner, R., Troyer, M., "True randomness from realistic quantum devices", 2013.</small>
- <small><sup id=Note4>(4)</sup> McInnes, J. L., & Pinkas, B. (1990, August). On the impossibility of private key cryptography with weakly random keys. In Conference on the Theory and Application of Cryptography (pp. 421-435).</small>
- <small><sup id=Note5>(5)</sup> von Neumann, J., "Various techniques used in connection with random digits", 1951.</small>
- <small><sup id=Note6>(6)</sup> However, this method and Peres's extractor also works if the coin tosses are _exchangeable_, which roughly means that changing the order of the tosses doesn't change their overall probability of heads (Peres 1992).</small>
- <small><sup id=Note7>(7)</sup> Morina, G., Łatuszyński, K., et al., "[**From the Bernoulli Factory to a Dice Enterprise via Perfect Sampling of Markov Chains**](https://arxiv.org/abs/1912.09229)", arXiv:1912.09229 [math.PR], 2019.</small>
- <small><sup id=Note8>(8)</sup> Pae, S., "Random number generation using a biased source", dissertation, University of Illinois at Urbana-Champaign, 2005.</small>
- <small><sup id=Note9>(9)</sup> Pae, S., Loui, M.C., "Randomizing functions: Simulation of discrete probability distribution using a source of unknown distribution", _IEEE Transactions on Information Theory_ 52(11), November 2006.</small>
- <small><sup id=Note10>(10)</sup> It follows from this definition that an extracting function must map an all-X string (such as an all-zeros string) to the empty string, since there is only one empty string but more than one string of any other length.  Thus, no reversible function can be extracting, and a function that never returns an empty string (including nearly all hash functions) can't be extracting, either.</small>
- <small><sup id=Note11>(11)</sup> Peres, Y., "[**Iterating von Neumann's procedure for extracting random bits**](https://projecteuclid.org/euclid.aos/1176348543)", Annals of Statistics 1992,20,1, p. 590-597.</small>
- <small><sup id=Note12>(12)</sup> Zhou, H. and Bruck, J., "[**Streaming algorithms for optimal generation of random bits**](https://arxiv.org/abs/1209.0730)", arXiv:1209.0730 [cs.IT], 2012.</small>
- <small><sup id=Note13>(13)</sup> S. Pae, "[**Binarization Trees and Random Number Generation**](https://arxiv.org/abs/1602.06058v2)", arXiv:1602.06058v2 [cs.DS], 2018.</small>
- <small><sup id=Note14>(14)</sup> Kozen, D., [**"Optimal Coin Flipping"**](http://www.cs.cornell.edu/~kozen/Papers/Coinflip.pdf), 2014.</small>
- <small><sup id=Note15>(15)</sup> Devroye, L., Gravel, C., "[**Random variate generation using only finitely many unbiased, independently and identically distributed random bits**](https://arxiv.org/abs/1502.02539v6)", arXiv:1502.02539v6  [cs.IT], 2020.</small>
- <small><sup id=Note16>(16)</sup> Montes Gutiérrez, I., "Comparison of alternatives under uncertainty and imprecision", doctoral thesis, Universidad de Oviedo, 2014.</small>
- <small><sup id=Note17>(17)</sup> De Schuymer, Bart, Hans De Meyer, and Bernard De Baets. "A fuzzy approach to stochastic dominance of random variables", in _International Fuzzy Systems Association World Congress_ 2003.</small>
- <small><sup id=Note18>(18)</sup> Camion, Paul, "Unbiased die rolling with a biased die", North Carolina State University. Dept. of Statistics, 1974.</small>

<a id=Appendix></a>
## Appendix

&nbsp;

<a id=On_Algorithm_M></a>
### On Algorithm M

Algorithm M works regardless of what numbers _X_ and _Y_ can take on and with what probability, and even if the "dice" for _X_ and _Y_ are loaded differently, as long as&mdash;

- each _pair_ of throws is independent of each other,
- each "die" has a chance of showing different outcomes, and
- the chance that the first "die" shows a number less than the second "die" is the same as the chance that the first "die" shows a greater number.

More formally, P(_X_ &lt; _Y_) must be equal to P(_X_ &gt; _Y_).  This relationship is equivalent to _statistical indifference_ (Montes Gutiérrez 2014)<sup>[**(16)**](#Note16)</sup>, (De Schuymer et al. 2003)<sup>[**(17)**](#Note17)</sup>. This relationship works even if _X_ and _Y_ are dependent on each other but independent of everything else; this is easy to see if we treat _X_ and _Y_ as a single random "vector" \[_X_, _Y_\].  This is shown by the following two propositions.  In the propositions below, a random variable is _non-degenerate_ if it does not take on a single value with probability 1.

**Proposition 1.** _Let X and Y be real-valued non-degenerate random variables.  Then Algorithm M outputs 0 or 1 with equal probability if and only if X and Y are statistically indifferent._

_Proof._ For any _X_ and _Y_ there are only three mutually exclusive possibilities, _X_>_Y_, _Y_>_X_, and _X_=_Y_. Because both random variables are nondegenerate, P(_X_>_Y_) or P(_Y_>_X_) or both are nonzero, and P(_X_=_Y_) < 1.   For the algorithm to return 0, _X_ must be less than _Y_, and for it to return 1, _X_ must be greater than _Y_.

For the "only if" part: For the algorithm to return 0 or 1 with equal probability, it must be that P(_X_>_Y_) = P(_Y_>_X_).  But this necessarily means that P(_X_>_Y_) and P(_Y_>_X_) are both 1/2 or less.  And if we assign half of the remainder (the remainder being P(_X_=_Y_)) to each probability, we get&mdash;

- P(_X_>_Y_) + P(_X_=_Y_)/2 = 1/2, and
- P(_Y_>_X_) + P(_X_=_Y_)/2 = 1/2,

and thus, _X_ and _Y_ must be statistically indifferent by definition (see below).

For the "if" part:  If _X_ and _Y_ are statistically indifferent, this means that &alpha; = P(_X_>_Y_) + P(_X_=_Y_)/2 and &beta; = P(_Y_>_X_) + P(_X_=_Y_)/2 are equal and &alpha; = &beta; = 1/2.  Since both &alpha; and &beta; are equal and P(_X_=_Y_) in &alpha; and &beta; are also equal, this must mean that P(_X_>_Y_) = P(_Y_>_X_).  It thus follows that for _X_ and _Y_, the algorithm will return 0 or 1 with equal probability.  ◻

**Proposition 2.** _Let X and Y be real-valued non-degenerate random variables that are independent, identically distributed, and defined on the same probability space.  Then X and Y are statistically indifferent._

_Proof._ By definition, _X_ and _Y_ are statistically indifferent if and only if _X_ is statistically preferred to _Y_ and vice versa (that is, P(_X_>_Y_) + P(_X_=_Y_)/2 >= P(_Y_>_X_) + P(_Y_=_X_)/2) (De Schuymer et al. 2003)<sup>[**(17)**](#Note17)</sup>.  Because both random variables are nondegenerate, P(_X_>_Y_) or P(_Y_>_X_) or both are nonzero, and P(_X_=_Y_) < 1. Moreover, because both random variables are identically distributed, their distribution functions _F_<sub>_X_</sub> and  _F_<sub>_Y_</sub> are the same, and therefore their values and expectations for any given _z_ (e.g., _F_<sub>_X_</sub>(_z_) and E[_F_<sub>_X_</sub>(_z_)], respectively) are the same.

If we look at Theorem 3.12 in (Montes Gutiérrez 2014)<sup>[**(16)**](#Note16)</sup>, we see that we can replace&mdash;

- the left hand side of Equation 3.5 with 0 &minus; 0, since it's a difference of expectations of the same distribution function and random variable, and
- the right hand side with (1/2) \* 0, since the difference of  _P_(_X_ =_Y_) and  _P_(_X_ = _X&prime;_) is taken and _P_(_X_ =_Y_) is equivalent to _P_(_X_ = _X&prime;_), which is equivalent because _X_, _X&prime;_ and _Y_ are identically distributed by the hypotheses of this proposition and Theorem 3.12.

As a result, Equation 3.5 becomes 0 >= 0, which is true and thus establishes that _X_ is statistically preferred to _Y_ (by Theorem 3.12).  It thus trivially follows that _Y_ is likewise statistically preferred to _X_ once we replace the roles of both variables, since both variables are identically distributed.  As a result, _X_ and _Y_ are found to be statistically indifferent and the proposition is proved.  ◻

Here are some of the many examples where this algorithm works:

- Set _X_ and _Y_ to two independent Gaussian random numbers with a mean of 0 but a different standard deviation. Or...
- Set _X_ and _Y_ to two independent uniform(0, 1) random numbers.  Or...
- Set _X_ and _Y_ to two independent uniform(0, 1) random numbers, then set _Y_ to (_X_+_Y_)/2.

See also a procedure given as a remark near the end of a paper by Camion (1974)<sup>[**(18)**](#Note18)</sup>.

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
