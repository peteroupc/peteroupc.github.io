# Open Questions on the Bernoulli Factory Problem

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Background></a>

## Background

Suppose there is a coin that shows heads with an unknown probability, $\lambda$. The goal is to use that coin (and possibly also a fair coin) to build a "new" coin that shows heads with a probability that depends on $\lambda$, call it $f(\lambda)$. This is the _Bernoulli factory problem_, and it can be solved for a function $f(\lambda)$ only if it's continuous. (For example, flipping the coin twice and taking heads only if exactly one coin shows heads, the probability $2\lambda(1-\lambda)$ can be simulated.)

This page contains several questions about the [**Bernoulli factory**](https://peteroupc.github.io/bernoulli.html) problem.  Answers to them will greatly improve my pages on this site about Bernoulli factories.  If you can answer any of them, post an issue in the [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues).

> **Note:** The Bernoulli factory problem is a special case of a more general mathematical problem that I call "[**The Sampling Problem**](https://peteroupc.github.io/sampling.html)".

<a id=Contents></a>

## Contents

- [**Background**](#Background)
- [**Contents**](#Contents)
- [**Polynomials that approach a Bernoulli factory function "fast"**](#Polynomials_that_approach_a_Bernoulli_factory_function_fast)
    - [**Main Question**](#Main_Question)
    - [**Solving the Bernoulli factory problem with polynomials**](#Solving_the_Bernoulli_factory_problem_with_polynomials)
    - [**A Matter of Efficiency**](#A_Matter_of_Efficiency)
    - [**A Conjecture on Polynomial Approximation**](#A_Conjecture_on_Polynomial_Approximation)
    - [**Strategies**](#Strategies)
- [**Other Questions**](#Other_Questions)
- [**Notes**](#Notes)

<a id=Polynomials_that_approach_a_Bernoulli_factory_function_fast></a>

## Polynomials that approach a Bernoulli factory function "fast"

This question involves solving the Bernoulli factory problem with polynomials.[^1]

In this question, a polynomial $P(x)$ is written in _Bernstein form of degree $n$_ if it is written as&mdash;

$$P(x)=\sum_{k=0}^n a_k {n \choose k} x^k (1-x)^{n-k},$$

where the real numbers $a_0, ..., a_n$ are the polynomial's _Bernstein coefficients_.

The degree-$n$ _Bernstein polynomial_ of an arbitrary function $f(x)$ has Bernstein coefficients $a_k = f(k/n)$.  In general, this Bernstein polynomial differs from $f$ even if $f$ is a polynomial.

<a id=Main_Question></a>

### Main Question

Suppose $f:[0,1]\to [0,1]$ is continuous and belongs to a large class of functions (for example, the $k$-th derivative, $k\ge 0$, is continuous, Lipschitz continuous, concave, strictly increasing, or bounded variation, or $f$ is real analytic).

1. (_Exact Bernoulli factory_): Compute the Bernstein coefficients of a sequence of polynomials ($g_n$) of degree 2, 4, 8, ..., $2^i$, ... that converge to $f$ from below and satisfy: $(g_{2n}-g_{n})$ is a polynomial with nonnegative Bernstein coefficients once it's rewritten to a polynomial in Bernstein form of degree exactly $2n$. Assume $0\lt f(\lambda)\lt 1$ or a piecewise polynomial can come between $f$ or $1-f$ and the x-axis.
2. (_Approximate Bernoulli factory_): Given $\epsilon > 0$, compute the Bernstein coefficients of a polynomial or rational function (of some degree $n$) that is within $\epsilon$ of $f$.
3. (_Series expansion of simple functions_): Find a nonnegative random variable $X$ and a series $f(\lambda)=\sum_{a\ge 0}\gamma_a(\lambda)$ such that $\gamma_a(\lambda)/\mathbb{P}(X=a)$ (letting 0/0 equal 0) is a polynomial or rational function with rational Bernstein coefficients lying in $[0, 1]$.[^2]

The convergence rate must be $O(1/n^{r/2})$ if the class has only functions with Lipschitz-continuous $(r-1)$-th derivative.  The method may not introduce transcendental or trigonometric functions (as with Chebyshev interpolants).

<a id=Solving_the_Bernoulli_factory_problem_with_polynomials></a>

### Solving the Bernoulli factory problem with polynomials

An [**algorithm**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions) (Łatuszyński et al. 2009/2011)[^3] simulates a function that admits a Bernoulli factory $f(\lambda)$ via two sequences of polynomials that converge from above and below to that function. Roughly speaking, the algorithm works as follows:

1. Generate U, a uniform random variate in $[0, 1]$.
2. Flip the input coin (with a probability of heads of $\lambda$), then build an upper and lower bound for $f(\lambda)$, based on the outcomes of the flips so far. In this case, these bounds come from two degree-$n$ polynomials that approach $f$ as $n$ gets large, where $n$ is the number of coin flips so far in the algorithm.
3. If U is less than or equal to the lower bound, return 1. If U is greater than the upper bound, return 0. Otherwise, go to step 2.

The result of the algorithm is 1 with probability _exactly_ equal to $f(\lambda)$, or 0 otherwise.

However, the algorithm requires the polynomial sequences to meet certain requirements, one of which is:

_For $f(\lambda)$ there must be a sequence of polynomials_ ($g_n$) _in Bernstein form of degree 1, 2, 3, ... that converge to $f$ from below and satisfy:_ $(g_{n+1}-g_{n})$ _is a polynomial with nonnegative Bernstein coefficients once it's rewritten to a polynomial in Bernstein form of degree exactly $n+1$ (Nacu and Peres (2005)[^4]; Holtz et al. (2011)[^5]).[^6]  For $f(\lambda)=1-f(\lambda)$ there must likewise be a sequence of this kind._

<a id=A_Matter_of_Efficiency></a>

### A Matter of Efficiency

However, ordinary Bernstein polynomials converge to a function at the rate $\Omega(1/n)$ in general, a result known since Voronovskaya (1932)[^7] and a rate that will lead to an **infinite expected number of coin flips in general**.  (See also my [**supplemental notes**](https://peteroupc.github.io/bernsupp.html).)

But Lorentz (1966)[^8] showed that if the function is positive and has a continuous $k$-th derivative, there are polynomials with nonnegative Bernstein coefficients that converge at the rate $O(1/n^{k/2})$ (and thus can enable a **finite expected number of coin flips** if the function is "smooth" enough).

Thus, researchers have studied alternatives to Bernstein polynomials that improve the convergence rate for "smoother" functions.  See Holtz et al. (2011)[^5], Sevy (1991)[^9], Waldron (2009)[^10], Costabile et al. (2005)[^11], Han (2003)[^12], Khosravian-Arab et al. (2018)[^13], and references therein; see also Micchelli (1973)[^14], Güntürk and Li (2021a)[^15], (2021b)[^16], Draganov (2024)[^17], and Tachev (2022)[^18].

These alternative polynomials usually come with results where the error bound is the desired $O(1/n^{k/2})$, but most of those results (with the notable exception of Sevy) have hidden constants with no upper bounds given, making them unimplementable (that is, it can't be known beforehand whether a given polynomial will come close to the target function within a user-specified error tolerance).

<a id=A_Conjecture_on_Polynomial_Approximation></a>

### A Conjecture on Polynomial Approximation

The following is a [**conjecture**](https://peteroupc.github.io/bernsupp.html#A_Conjecture_on_Polynomial_Approximation) that could help reduce this problem to the problem of finding explicit error bounds when approximating a function by polynomials.

Let $f(\lambda):[0,1]\to(0,1)$ have a continuous $r$-th derivative, where $r\ge 1$, let $M$ be the maximum of the absolute value of $f$ and its derivatives up to the $r$-th derivative, and denote the Bernstein polynomial of degree $n$ of a function $g$ as $B_n(g)$. Let $W_{2^0}(\lambda), W_{2^1}(\lambda), ..., W_{2^i}(\lambda),...$ be a sequence of bounded functions on [0, 1] that converge uniformly to $f$.

For each integer $n\ge 1$ that's a power of 2, suppose that there is $D>0$ such that&mdash;

$$\text{abs}(f(\lambda)-B_n(W_n(\lambda))) \le DM/n^{r/2},$$

whenever $0\le \lambda\le 1$.  Then there is $C_0\ge D$ such that the polynomials $(g_n)$ in Bernstein form of degree 2, 4, 8, ..., $2^i$, ..., defined as $g_n=B_n(W_n(\lambda)) - C_0 M/n^{r/2}$, converge from below to $f$ and satisfy: $(g_{2n}-g_{n})$ is a polynomial with nonnegative Bernstein coefficients once it's rewritten to a polynomial in Bernstein form of degree exactly $2n$.

Equivalently (see also Nacu and Peres (2005)[^4]), there is $C_1>0$ such that the inequality&mdash;

$$W_{2n}\left(\frac{k}{2n}\right) + C_1 M/n^{r/2} - \sum_{i=0}^k W_n\left(\frac{i}{n}\right)\sigma_{n,k,i}\ge 0,\tag{PB}$$

holds true for each integer $n\ge 1$ that's a power of 2 and whenever $0\le k\le 2n$, where $\sigma_{n,k,i} = {n\choose i}{n\choose {k-i}}/{2n \choose k}=\mathbb{P}(X_k=i)$ and $X_k$ is a hypergeometric($2n$, $k$, $n$) random variable.

$C_0$ or $C_1$ may depend on $r$ and the sequence $W_n$, but not on $f$ or $n$. When $C_0$ or $C_1$ exists, find a good upper bound for it.

> **Note:** This conjecture may be easy to prove if $W_n$ reproduces polynomials of degree $(r-1)$ or less.  But there are $B_n(W_n)$ (notably the iterated Boolean sum of Bernstein polynomials) that don't do so and yet converge at the rate $O(n^{-r/2})$ for some $r\gt 2$. **Also, see notes 3 and 4 in** "[**End Notes**](#End_Notes)".
>
> **Note:** I believe there is a counterexample to this conjecture, namely the sequence $B_n(W_n(\lambda))=\frac{(T_n(1-2\lambda)+1)\varphi_n}{2 \mu_n} + 1/2$, where $\varphi_n$ is a decreasing sequence of positive numbers that tends slowly enough to 0, $\mu_n$ is the maximum Bernstein coefficient (in absolute value) of the degree-$n$ polynomial $(T_n(1-2\lambda)+1)/2$, and $T_n(x)$ is the Chebyshev polynomial of the first kind of degree $n$. If this counterexample is valid, the conjecture may still be true with an additional assumption on the convergence rate of $W_n$, say, $O(1/n)$ or $O(1/n^{r/2})$ or $O(1/n^{(r-1)/2})$.

<a id=Strategies></a>

### Strategies

The following are some strategies for answering these questions:

- Verify my proofs for the results on error bounds for certain polynomials in "[**Results Used in Approximations By Polynomials**](https://peteroupc.github.io/bernapprox.html#Results_Used_in_Approximations_by_Polynomials)", including:
    - Iterated Boolean sums (linear combinations of iterates) of Bernstein polynomials ($B_n(W_n) = f-(f-B_n(f))^k$:[^19] Propositions B10C and B10D.
    - Linear combinations of Bernstein polynomials (see Costabile et al. (2005)[^11]): Proposition B10.
    - The [**Lorentz operator**](https://link.springer.com/article/10.1007/s00365-010-9108-5) (Holtz et al. 2011)[^5].
- Find the hidden constants $\theta_\alpha$, $s$, and $D$ as well as those in Lemmas 15, 17 to 22, 24, and 25 in Holtz et al. (2011)[^5].
- Find polynomials of the following kinds and find explicit bounds, with no hidden constants, on the approximation error for those polynomials:
    - Polynomial operators that preserve polynomials at a higher degree than linear functions.
    - Operators that produce a degree-$n$ polynomial from $O(n^2)$ sample points.
    - Polynomials built from samples at _rational_ values of a function $f$ that cluster at a quadratic rate toward the endpoints (Adcock et al. 2019)[^20] \(for example, values that converge to Chebyshev points $\cos(j\pi/n)$ with increasing $n$, or to Legendre points).  See also 7, 8, and 12 of Trefethen, [**_Approximation Theory and Approximation Practice_**](https://www.chebfun.org/ATAP/), 2013.

<a id=Other_Questions></a>

## Other Questions

- Let $f(\lambda):[0,1]\to [0,1]$ be writable as $f(\lambda)=\sum_{n\ge 0} a_n \lambda^n,$ where $a_n\ge 0$ is rational, $a_n$ is nonzero infinitely often, and $f(1)$ is irrational.  Then what are simple criteria to determine whether there is $0\lt p\lt 1$ such that $0\le a_n\le p(1-p)^n$ and, if so, to find such $p$?  Obviously, if $(a_n)$ is nowhere increasing then $1\gt p\ge a_0$.
- For each $r>0$, characterize the functions $f(\lambda)$ that admit a Bernoulli factory where the expected number of coin flips, raised to the power of $r$, is finite.
- [**Multiple-output Bernoulli factories**](https://mathoverflow.net/questions/412772/from-biased-coins-to-biased-coins-as-efficiently-as-possible): **Let** $f(\lambda):[a, b] \to (0, 1)$ **be continuous, where** $0\lt a$, $a\lt b$, $b\lt 1$.  Define the entropy bound as $h(f(\lambda))/h(\lambda),$ where $h(x)=-x \ln(x)-(1-x) \ln(1-x)$ is related to the Shannon entropy function. Then there is an algorithm that tosses heads with probability $f(\lambda)$ given a coin that shows heads with probability $\lambda$ and no other source of randomness (Keane and O'Brien 1994)[^21].

    But, **is there an algorithm for $f$ that produces multiple independent outputs rather than one and has an expected number of coin flips per output that is arbitrarily close to the entropy bound, uniformly for every $\lambda$ in $f$'s domain**? Call such an algorithm an _optimal factory_.  (See Nacu and Peres (2005, Question 1)[^4].)  And, does the answer change if the algorithm has access to a fair coin in addition to the biased coin?

    So far, constants as well as $\lambda$ and $1-\lambda$ do admit an optimal factory (see same work), and, as Yuval Peres (Jun. 24, 2021) told me, there is an efficient multiple-output algorithm for $f(\lambda) = \lambda/2$.  But are there others?  See an [**appendix in one of my articles**](https://peteroupc.github.io/bernsupp.html#Multiple_Output_Bernoulli_Factory) for more information on my progress on the problem.

- [**Pushdown automata and algebraic functions**](https://cstheory.stackexchange.com/questions/50853/from-coin-flips-to-algebraic-functions-via-pushdown-automata): A _pushdown automaton_ is a finite state machine with an unbounded stack, driven by a biased coin with an unknown probability of heads, $\lambda$. Its stack starts with a single symbol.  On each step, the machine flips the coin, then, based on the coin flip, the current state, and the top stack symbol, it moves to a new state (or keeps it unchanged) and replaces the top stack symbol with zero or more symbols. When the stack is empty, the machine stops and returns either 0 or 1 depending on the state it ends up at.

    Let $f(\lambda)$ be continuous and map the open interval (0, 1) to itself. Mossel and Peres (2005)[^22] showed that a pushdown automaton can output 1 with probability $f(\lambda)$ only if $f$ is _algebraic over the rational numbers_ (there is a nonzero polynomial $P(x, y)$ in two variables and whose coefficients are rational numbers, such that $P(x, f(x)) = 0$ for every $x$ in the domain of $f$).  See an [**appendix in one of my articles**](https://peteroupc.github.io/bernsupp.html#Pushdown_Automata_and_Algebraic_Functions) for more information on my progress on the problem.

    Prove or disprove:

    1. If $f$ is algebraic over rational numbers it can be simulated by a pushdown automaton.
    2. min($\lambda$, $1-\lambda$) and $\lambda^{1/p}$, for every prime $p\ge 3$, can be simulated by a pushdown automaton.
    3. Given that $f$ is algebraic over rational numbers, it can be simulated by a pushdown automaton if and only if its "critical exponent" is a dyadic number greater than $-1$ or has the form $-1-1/2^k$ for some integer $k\ge 1$.[^23]
- [**Coin-flipping degree**](https://mathoverflow.net/questions/448538/bounds-on-the-coin-flipping-degree): Let $p(\lambda)$ be a polynomial that maps the closed unit interval to itself and satisfies $0\lt p(\lambda)\lt 1$ whenever $0\lt\lambda\lt 1$.  Then its _coin-flipping degree_ (Wästlund 1999)[^24] is the smallest value of $n$ such that $p$'s _Bernstein_ coefficients of degree $n$ lie in the closed unit interval.  Given that a polynomial's degree is $m$ and its "standard" coefficients are integers, what are upper bounds (or even exact maximums) on its coin flipping degree?
- [**Simple simulation algorithms**](https://stats.stackexchange.com/questions/541402/what-are-relatively-simple-simulations-that-succeed-with-an-irrational-probabili): References are sought to papers and books that describe irrational constants or Bernoulli factory functions (continuous functions mapping (0,1) to itself) in any of the following ways.  Ideally they should involve only rational numbers and should not compute _p_-adic digit expansions.
    - Simulation experiments that succeed with an irrational probability.
    - Simple [**continued fraction**](https://peteroupc.github.io/bernoulli.html#Continued_Fractions) expansions of irrational constants.
    - Functions written as infinite power series with rational coefficients (see "[**Certain Power Series**](https://peteroupc.github.io/bernoulli.html#Certain_Power_Series)").
    - Irrational numbers written as series expansions with rational coefficients (see "[**Certain Converging Series**](https://peteroupc.github.io/bernoulli.html#Certain_Converging_Series)").
    - Functions whose integral is an irrational number.
    - Closed shapes inside the unit square whose area is an irrational number.  (Includes algorithms that tell whether a box lies inside, outside, or partly inside or outside the shape.)    [**Example.**](https://peteroupc.github.io/bernoulli.html#pi___4)
    - Generate a uniform (_x_, _y_) point inside a closed shape, then return 1 with probability _x_.  For what shapes is the expected value of _x_ an irrational number?  [**Example.**](https://peteroupc.github.io/bernsupp.html#4_3___pi).
- Given integer _m_&ge;0, rational number 0&lt;_k_&lt;exp(1) (and especially $k=1$ or $k=2$), and unknown heads probability 0&le;_&lambda;_&le;1, find a [**Bernoulli factory**](https://peteroupc.github.io/bernoulli.html) for&mdash;

    $$f(\lambda)=\exp(-(\exp(m+\lambda)-(k(m+\lambda)))) = \frac{\exp(-\exp(m+\lambda))}{\exp(-(k(m+\lambda)))},\tag{PD}$$

    that, as much as possible, avoids calculating $h(\lambda) = \exp(m+\lambda)-k(m+\lambda)$, and especially avoids floating-point operations; in this sense, the more implicitly the Bernoulli factory works with irrational or transcendental functions, the better.  The right-hand side of (PD) can be implemented by [**ExpMinus**](https://peteroupc.github.io/bernoulli.html#ExpMinus_exp_minus__z) and division Bernoulli factories, but is inefficient and heavyweight due to the need to calculate $\epsilon$ for the division factory.  In addition there is a Bernoulli factory that first calculates $h(\lambda)$ and $floor(h(\lambda))$ using constructive reals and then runs **ExpMinus**, but this is likewise far from lightweight.

Prove or disprove:

- Given that $f:[0,1]\to (0,1]$ is convex, the polynomials $(g_n) = (B_n(f) - \max_{0\le\lambda\le 1}\text{abs}(B_n(f)(\lambda)-f(\lambda)))$ (where $n\ge 1$ is an integer power of 2) are in Bernstein form of degree $n$, converge to $f$ from below, and satisfy: $(g_{2n}-g_{n})$ is a polynomial with nonnegative Bernstein coefficients once it's rewritten to a polynomial in Bernstein form of degree exactly $2n$. The same is true for the polynomials $(g_n) = (B_n(f) - \text{abs}(B_n(f)(1/2)-f(1/2)))$, if $f$ is also symmetric about 1/2.
- Let $f:(D\subseteq [0, 1])\to [0,1]$.  Given a coin that shows heads with probability $\lambda$ (which can be 0 or 1), it is possible to toss heads with probability $f(\lambda)$ using the coin and no other sources of randomness (and, thus, $f$ is [**_strongly simulable_**](https://mathoverflow.net/questions/404961/from-biased-coins-and-nothing-else-to-biased-coins)) **if and only if**&mdash;

    - $f$ is constant on its domain, or is continuous and polynomially bounded on its domain (_polynomially bounded_ means, both $f$ and $1-f$ are bounded below by min($x^n$, $(1-x)^n$) for some integer $n$ (Keane and O'Brien 1994)[^21]), and
    - $f(0)$ is 0 or 1 if 0 is in $f$'s domain and $f(1)$ is 0 or 1 whenever 1 is in $f$'s domain, and
    - if $f(0) = 0$ or $f(1) = 0$ or both, then there is a polynomial $g(x):[0,1]\to [0,1]$ with computable coefficients, such that $g(0) = f(0)$ and $g(1) = f(1)$ whenever 0 or 1, respectively, is in the domain of f, and such that $g(x)\gt f(x)$ for every $x$ in the domain of $f$, except at 0 and 1, and
    - if $f(0) = 1$ or $f(1) = 1$ or both, then there is a polynomial $h(x):[0,1]\to [0,1]$ with computable coefficients, such that $h(0) = f(0)$ and $h(1) = f(1)$ whenever 0 or 1, respectively, is in the domain of $f$, and such that $h(x)\lt f(x)$ for every $x$ in the domain of f, except at 0 and 1.

    A condition such as "0 is not in the domain of $f$, or $f$ can be extended to a Lipschitz-continuous function on $[0, \epsilon)$ for some $\epsilon>0$" does not work.  A counterexample is $f(x)=(\sin(1/x)/4+1/2)\cdot(1-(1-x)^n)$ for $n\ge 1$ ($f(0)=0$), which is strongly simulable at 0 despite not being Lipschitz at 0.  ($(1-x)^n$ is the probability of the biased coin showing zero $n$ times in a row.)  Keane and O'Brien already showed strong simulability when $D$ contains neither 0 nor 1.

<a id=Notes></a>

## Notes

[^1]: See also the following questions on _Mathematics Stack Exchange_ and _MathOverflow_: [**Converging polynomials**](https://math.stackexchange.com/questions/3904732/what-are-ways-to-compute-polynomials-that-converge-from-above-and-below-to-a-con), [**Error bounds**](https://mathoverflow.net/questions/442057/explicit-and-fast-error-bounds-for-approximating-continuous-functions), [**A conjecture**](https://mathoverflow.net/questions/427595/a-conjecture-on-consistent-monotone-sequences-of-polynomials-in-bernstein-form), [**Lorentz operators**](https://mathoverflow.net/questions/407179/using-the-holtz-method-to-build-polynomials-that-converge-to-a-continuous-functi), [**Series representations**](https://mathoverflow.net/questions/409174/concave-functions-series-representation-and-converging-polynomials).

[^2]: An example of $X$ is $\mathbb{P}(X=a) = p (1-p)^a$ where $0 < p < 1$ is a known rational.  This question's requirements imply that $\sum_{a\ge 0}\max_\lambda \text{abs}(\gamma_a(\lambda)) \le 1$.  The proof of Keane and O'Brien (1994) produces a convex combination of polynomials with 0 and 1 as Bernstein coefficients, but the combination is difficult to construct (it requires finding maximums, for example) and so this proof does not appropriately answer this question.

[^3]: Łatuszyński, K., Kosmidis, I., Papaspiliopoulos, O., Roberts, G.O., "[**Simulating events of unknown probabilities via reverse time martingales**](https://arxiv.org/abs/0907.4018v2)", arXiv:0907.4018v2 [stat.CO], 2009/2011.

[^4]: Nacu, Şerban, and Yuval Peres. "Fast simulation of new coins from old", The Annals of Applied Probability 15, no. 1A (2005): 93-115.

[^5]: Holtz, O., Nazarov, F., Peres, Y., "[**New Coins from Old, Smoothly**](https://link.springer.com/article/10.1007/s00365-010-9108-5)", Constructive Approximation 33 (2011).

[^6]: The condition on nonnegative Bernstein coefficients ensures that not only the polynomials "increase" to $f(\lambda)$, but also their Bernstein coefficients.  This condition is equivalent in practice to the following statement (Nacu & Peres 2005). For every integer $n\ge 1$ that's a power of 2, $a(2n, k)\ge\mathbb{E}[a(n, X_{n,k})]= \left(\sum_{i=0}^k a(n,i) {n\choose i}{n\choose {k-i}}/{2n\choose k}\right)$, where $a(n,k)$ is the degree-$n$ polynomial's $k$-th Bernstein coefficient, where $0\le k\le 2n$ is an integer, and where $X_{n,k}$ is a hypergeometric($2n$, $k$, $n$) random variable.  A hypergeometric($2n$, $k$, $n$) random variable is the number of "good" balls out of $k$ balls taken uniformly at random, all at once, from a bag containing $2n$ balls, $n$ of which are "good".  See also my [**MathOverflow question**](https://mathoverflow.net/questions/429037/bounds-on-the-expectation-of-a-function-of-a-hypergeometric-random-variable) on finding bounds for hypergeometric variables.

[^7]: E. Voronovskaya, "Détermination de la forme asymptotique d'approximation des fonctions par les polynômes de M. Bernstein", 1932.

[^8]: G.G. Lorentz, "The degree of approximation by polynomials with positive coefficients", 1966.

[^9]: Sevy, J., “Acceleration of convergence of sequences of simultaneous approximants”, dissertation, Drexel University, 1991.

[^10]: Waldron, S., "[**Increasing the polynomial reproduction of a quasi-interpolation operator**](https://www.sciencedirect.com/science/article/pii/S0021904508001640)", Journal of Approximation Theory 161 (2009).

[^11]: Costabile, F., Gualtieri, M.I., Serra, S., “Asymptotic expansion and extrapolation for Bernstein polynomials with applications”, BIT 36 (1996)

[^12]: Han, Xuli. “Multi-node higher order expansions of a function.” Journal of Approximation Theory 124.2 (2003): 242-253. [**https://doi.org/10.1016/j.jat.2003.08.001**](https://doi.org/10.1016/j.jat.2003.08.001)

[^13]: Khosravian-Arab, Hassan, Mehdi Dehghan, and M. R. Eslahchi. "A new approach to improve the order of approximation of the Bernstein operators: theory and applications." Numerical Algorithms 77 (2018): 111-150.

[^14]: Micchelli, Charles. "[**The saturation class and iterates of the Bernstein polynomials**](https://www.sciencedirect.com/science/article/pii/0021904573900282)", Journal of Approximation Theory 8, no. 1 (1973): 1-18.

[^15]: Güntürk, C. Sinan, and Weilin Li. "[**Approximation with one-bit polynomials in Bernstein form**](https://arxiv.org/pdf/2112.09183)", arXiv:2112.09183 (2021); Constructive Approximation, pp.1-30 (2022).

[^16]: Güntürk, C. Sinan, and Weilin Li. "[**Approximation of functions with one-bit neural networks**](https://arxiv.org/abs/2112.09181)", arXiv:2112.09181 (2021).

[^17]: Draganov, B.R., "[**Simultaneous approximation by the Bernstein operator**](https://www.fmi.uni-sofia.bg/sites/default/files/dissertation_work_doctor_of_science/dissdsci_borislavdraganov.pdf)", dissertation, Sofia University "St. Kliment Ohridski", 2024.

[^18]: Tachev, Gancho. "[**Linear combinations of two Bernstein polynomials**](https://doi.org/10.3934/mfc.2022061)", _Mathematical Foundations of Computing_, 2022.

[^19]: If $W_n(0)=f(0)$ and $W_n(1)=f(1)$ for every $n$, then the inequality $(PB)$ is automatically true when $k=0$ and $k=2n$, so that the statement has to be checked only for $0\lt k\lt 2n$.  If, in addition, $W_n$ is symmetric about 1/2, so that $W_n(\lambda)=W_n(1-\lambda)$ whenever $0\le \lambda\le 1$, then the statement has to be checked only for $0\lt k\le n$ (since the values $\sigma_{n,k,i} = {n\choose i}{n\choose {k-i}}/{2n \choose k}$ are symmetric in that they satisfy $\sigma_{n,k,i}=\sigma_{n,k,k-i}$).<br>Special cases for this question are if $W_n = 2 f - B_n(f)$ and $r$ is 3 or 4, or $W_n = B_n(B_n(f))+3(f-B_n(f))$ and $r$ is 5 or 6; these cases correspond to the iterated Boolean sum of Bernstein polynomials: $B_n(W_n)=f-(f-B_n(f))^k$, which don't reproduce polynomials of higher degree than linear functions, making it hard to find a bound better than $O(1/n)$ that satisfies the conjecture when $r\ge 3$.

[^20]: Adcock, B., Platte, R.B., Shadrin, A., “Optimal sampling rates for approximating analytic functions from pointwise samples, IMA Journal of Numerical Analysis 39(3), July 2019.

[^21]: Keane, M. S., and O'Brien, G. L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.

[^22]: Mossel, Elchanan, and Yuval Peres. New coins from old: computing with unknown bias. Combinatorica, 25(6), pp.707-724, 2005.

[^23]: On pushdown automata: Etessami and Yannakakis ("Recursive Markov chains, stochastic grammars, and monotone systems of nonlinear equations", _Journal of the ACM_ 56(1), pp.1-66, 2009) showed that pushdown automata with rational probabilities are equivalent to recursive Markov chains (with rational transition probabilities), and that for every recursive Markov chain, the system of polynomial equations has nonnegative coefficients. But this paper doesn't deal with the case of recursive Markov chains where the transition probabilities cannot just be rational, but can also be $\lambda$ and $1-\lambda$ where $\lambda$ is an unknown rational or irrational probability of heads.  Also, Banderier and Drmota ("Formulae and asymptotics for coefficients of algebraic functions", _Combinatorics, Probability and Computing_ 24(1), pp.1-53., 2014) showed the asymptotic behavior of power series solutions $f(\lambda)$ of a polynomial system, where both the series and the system have nonnegative real coefficients. Notably, functions of the form $\lambda^{1/p}$ where $p\ge 3$ is not a power of 2, are not possible solutions, because their so-called "critical exponent" is not dyadic. But the result seems not to apply to _piecewise_ power series such as $\min(\lambda,1-\lambda)$, which are likewise algebraic functions.

[^24]: Wästlund, J., "[**Functions arising by coin flipping**](http://www.math.chalmers.se/~wastlund/coinFlip.pdf)", 1999.
