# Open Questions on the Bernoulli Factory Problem

[**Peter Occil**](mailto:poccil14@gmail.com)

<a id=Background></a>
## Background

Suppose there is a coin that shows heads with an unknown probability, $\lambda$. The goal is to use that coin (and possibly also a fair coin) to build a "new" coin that shows heads with a probability that depends on $\lambda$, call it $f(\lambda)$. This is the _Bernoulli factory problem_, and it can be solved only for certain functions $f$. (For example, flipping the coin twice and taking heads only if exactly one coin shows heads, the probability $2\lambda(1-\lambda)$ can be simulated.)

Specifically, the only functions that can be simulated this way **are continuous and polynomially bounded on their domain, and map $[0, 1]$ or a subset thereof to $[0, 1]$**, as well as $f=0$ and $f=1$. These functions are called _factory functions_ in this page. (A function $f(x)$ is _polynomially bounded_ if both $f$ and $1-f$ are greater than or equal to min($x^n$, $(1-x)^n$) for some integer $n$ (Keane and O'Brien 1994). This implies that $f$ admits no roots on (0, 1) and can't take on the value 0 or 1 except possibly at 0, 1, or both.)

This page contains several questions about the [**Bernoulli factory**](https://peteroupc.github.io/bernoulli.html) problem.  Answers to them will greatly improve my pages on this site about Bernoulli factories.  If you can answer any of them, post an issue in the [**GitHub issues page**](https://github.com/peteroupc/peteroupc.github.io/issues).

<a id=Contents></a>
## Contents

- [**Background**](#Background)
- [**Contents**](#Contents)
- [**Key Problems**](#Key_Problems)
- [**Polynomials that approach a factory function "fast"**](#Polynomials_that_approach_a_factory_function_fast)
    - [**Main Question**](#Main_Question)
    - [**Solving the Bernoulli factory problem with polynomials**](#Solving_the_Bernoulli_factory_problem_with_polynomials)
    - [**A Matter of Efficiency**](#A_Matter_of_Efficiency)
    - [**A Conjecture on Polynomial Approximation**](#A_Conjecture_on_Polynomial_Approximation)
    - [**Strategies**](#Strategies)
- [**Building Series Expansions of Polynomials**](#Building_Series_Expansions_of_Polynomials)
- [**New coins from old, smoothly**](#New_coins_from_old_smoothly)
    - [**Questions**](#Questions)
- [**From coin flips to algebraic functions via pushdown automata**](#From_coin_flips_to_algebraic_functions_via_pushdown_automata)
    - [**Pushdown Automata**](#Pushdown_Automata)
    - [**Algebraic Functions**](#Algebraic_Functions)
    - [**Questions**](#Questions_2)
- [**Other Questions**](#Other_Questions)
- [**End Notes**](#End_Notes)
- [**References**](#References)

<a id=Key_Problems></a>
## Key Problems

The following summarizes most of the problems raised by these open questions.

1. **Suppose $f:[0,1]\to [0,1]$ is continuous and belongs to a large class of functions (e.g., the $k$-th derivative, $k\ge 0$, is continuous, Lipschitz, concave, strictly increasing, bounded variation, or Zygmund, or $f$ is real analytic).**
    - _Exact Bernoulli factory_: **Assuming $0\lt f(\lambda)\lt 1$, compute the Bernstein coefficients of a sequence of polynomials ($g_n$) of degree 2, 4, 8, ..., $2^i$, ... that converge to $f$ from below and satisfy: $(g_{2n}-g_{n})$ is a polynomial with non-negative Bernstein coefficients once it's rewritten to a polynomial in Bernstein form of degree exactly $2n$.**
    - _Approximate Bernoulli factory_: **Given $\epsilon > 0$, compute the Bernstein coefficients of a polynomial or rational function (of some degree $n$) that is within $\epsilon$ of $f$.**
    - _Series expansion of simple functions_: **Find a random variable $X$ and a non-trivial series $f(\lambda)=\sum_{a\ge 0}\gamma_a(\lambda)$ such that $\gamma_a(\lambda)/\mathbb{P}(X=a)$ (letting 0/0 equal 0) is a polynomial or rational function with Bernstein coefficients lying in [0, 1].**

    **The convergence rate must be $O(1/n^{r/2})$ if the class has only functions with Lipschitz-continuous $(r-1)$-th derivative.  The method may not introduce transcendental or trigonometric functions (as with Chebyshev interpolants).**
2. **Characterize the following three classes of factory functions $f(\lambda)$:**

    - **Can be simulated using nothing but the biased coin, when the biased coin can show heads every time, tails every time, or both.**
    - **Have a Bernoulli factory that can come arbitrarily close to the entropy limit if it produces multiple $f$-coin flips at a time, rather than just one.**
    - **Are algebraic and can be simulated by a finite-state machine with an unbounded stack.**

<a id=Polynomials_that_approach_a_factory_function_fast></a>
## Polynomials that approach a factory function "fast"

[**https://math.stackexchange.com/questions/3904732/what-are-ways-to-compute-polynomials-that-converge-from-above-and-below-to-a-con**](https://math.stackexchange.com/questions/3904732/what-are-ways-to-compute-polynomials-that-converge-from-above-and-below-to-a-con)

[**https://mathoverflow.net/questions/442057/explicit-and-fast-error-bounds-for-approximating-continuous-functions**](https://mathoverflow.net/questions/442057/explicit-and-fast-error-bounds-for-approximating-continuous-functions)

[**https://mathoverflow.net/questions/427595/a-conjecture-on-consistent-monotone-sequences-of-polynomials-in-bernstein-form**](https://mathoverflow.net/questions/427595/a-conjecture-on-consistent-monotone-sequences-of-polynomials-in-bernstein-form)

[**https://mathoverflow.net/questions/429037/bounds-on-the-expectation-of-a-function-of-a-hypergeometric-random-variable**](https://mathoverflow.net/questions/429037/bounds-on-the-expectation-of-a-function-of-a-hypergeometric-random-variable)

This question involves solving the Bernoulli factory problem with polynomials.

In this question, a polynomial $P(x)$ is written in _Bernstein form of degree $n$_ if it is written as&mdash; $$P(x)=\sum_{k=0}^n a_k {n \choose k} x^k (1-x)^{n-k},$$ where $a_0, ..., a_n$ are the polynomial's _Bernstein coefficients_.

The degree-$n$ _Bernstein polynomial_ of an arbitrary function $f(x)$ has Bernstein coefficients $a_k = f(k/n)$.  In general, this Bernstein polynomial differs from $f$ even if $f$ is a polynomial.

<a id=Main_Question></a>
### Main Question

Suppose $f:[0,1]\to [0,1]$ is continuous and belongs to a large class of functions (for example, the $k$-th derivative, $k\ge 0$, is continuous, Lipschitz continuous, concave, strictly increasing, bounded variation, or in the Zygmund class, or $f$ is real analytic) (**see note 4 in "[**End Notes**](#End_Notes)"**).

1. (_Exact Bernoulli factory_): Compute the Bernstein coefficients of a sequence of polynomials ($g_n$) of degree 2, 4, 8, ..., $2^i$, ... that converge to $f$ from below and satisfy: $(g_{2n}-g_{n})$ is a polynomial with non-negative Bernstein coefficients once it's rewritten to a polynomial in Bernstein form of degree exactly $2n$. (**See note 5 in "[**End Notes**](#End_Notes)".**)  Assume $0\lt f(\lambda)\lt 1$ or $f$ is polynomially bounded.
2. (_Approximate Bernoulli factory_): Given $\epsilon > 0$, compute the Bernstein coefficients of a polynomial or rational function (of some degree $n$) that is within $\epsilon$ of $f$.

The convergence rate must be $O(1/n^{r/2})$ if the class has only functions with Lipschitz-continuous $(r-1)$-th derivative.  The method may not introduce transcendental or trigonometric functions (as with Chebyshev interpolants).

<a id=Solving_the_Bernoulli_factory_problem_with_polynomials></a>
### Solving the Bernoulli factory problem with polynomials

An [**algorithm**](https://peteroupc.github.io/bernoulli.html#General_Factory_Functions) simulates a factory function $f(\lambda)$ via two sequences of polynomials that converge from above and below to that function. Roughly speaking, the algorithm works as follows:

1. Generate U, a uniform random variate in $[0, 1]$.
2. Flip the input coin (with a probability of heads of $\lambda$), then build an upper and lower bound for $f(\lambda)$, based on the outcomes of the flips so far. In this case, these bounds come from two degree-$n$ polynomials that approach $f$ as $n$ gets large, where $n$ is the number of coin flips so far in the algorithm.
3. If U is less than or equal to the lower bound, return 1. If U is greater than the upper bound, return 0. Otherwise, go to step 2.

The result of the algorithm is 1 with probability _exactly_ equal to $f(\lambda)$, or 0 otherwise.

However, the algorithm requires the polynomial sequences to meet certain requirements; among them, the sequences must be of Bernstein-form polynomials that converge from above and below to a factory function.  Specifically:

_For $f(\lambda)$ there must be a sequence of polynomials_ ($g_n$) _in Bernstein form of degree 1, 2, 3, ... that converge to $f$ from below and satisfy:_ $(g_{n+1}-g_{n})$ _is a polynomial with non-negative Bernstein coefficients once it's rewritten to a polynomial in Bernstein form of degree exactly $n+1$ (**see note 5 in "[**End Notes**](#End_Notes)"**; Nacu and Peres 2005; Holtz et al. 2011).  For $f(\lambda)=1-f(\lambda)$ there must likewise be a sequence of this kind._

<a id=A_Matter_of_Efficiency></a>
### A Matter of Efficiency

However, ordinary Bernstein polynomials converge to a function at the rate $\Omega(1/n)$ in general, a result known since Voronovskaya (1932) and a rate that will lead to an **infinite expected number of coin flips in general**.  (See also my [**supplemental notes**](https://peteroupc.github.io/bernsupp.html).)

But Lorentz (1966) showed that if the function is positive and has a continuous $k$-th derivative, there are polynomials with nonnegative Bernstein coefficients that converge at the rate $O(1/n^{k/2})$ (and thus can enable a **finite expected number of coin flips** if the function is "smooth" enough).

Thus, people have developed alternatives, including linear combinations and iterated Boolean sums of Bernstein polynomials, to improve the convergence rate. These include Micchelli (1973), Guan (2009), Güntürk and Li (2021a, 2021b), the "Lorentz operator" in Holtz et al. (2011) (see also "[**New coins from old, smoothly**](#New_coins_from_old_smoothly)"), Draganov (2014), and Tachev (2022).

These alternative polynomials usually include results where the error bound is the desired $O(1/n^{k/2})$, but most of those results (e.g., Theorem 4.4 in Micchelli; Theorem 5 in Güntürk and Li) have hidden constants with no upper bounds given, making them unimplementable (that is, it can't be known beforehand whether a given polynomial will come close to the target function within a user-specified error tolerance).

<a id=A_Conjecture_on_Polynomial_Approximation></a>
### A Conjecture on Polynomial Approximation

The following is a [**conjecture**](https://peteroupc.github.io/bernsupp.html#A_Conjecture_on_Polynomial_Approximation) that could help reduce this problem to the problem of finding explicit error bounds when approximating a function by polynomials.

Let $f(\lambda):[0,1]\to(0,1)$ have $r\ge 1$ continuous derivatives, let $M$ be the maximum of the absolute value of $f$ and its derivatives up to the $r$-th derivative, and denote the Bernstein polynomial of degree $n$ of a function $g$ as $B_n(g)$. Let $W_{2^0}(\lambda), W_{2^1}(\lambda), ..., W_{2^i}(\lambda),...$ be a sequence of functions on [0, 1] that converge uniformly to $f$.

For each integer $n\ge 1$ that's a power of 2, suppose that there is $D>0$ such that&mdash; $$|f(\lambda)-B_n(W_n(\lambda))| \le DM/n^{r/2},$$ whenever $0\le \lambda\le 1$.  Then there is $C_0\ge D$ such that for every $C\ge C_0$, the polynomials $(g_n)$ in Bernstein form of degree 2, 4, 8, ..., $2^i$, ..., defined as $g_n=B_n(W_n(\lambda) - CM/n^{r/2})$, converge from below to $f$ and satisfy: $(g_{2n}-g_{n})$ is a polynomial with non-negative Bernstein coefficients once it's rewritten to a polynomial in Bernstein form of degree exactly $2n$. (**See note 5 in "[**End Notes**](#End_Notes)".**)

Equivalently (see also Nacu and Peres 2005), there is $C_1>0$ such that the inequality $(PB)$ (see below) holds true for each integer $n\ge 1$ that's a power of 2 (see "Strategies", below).

My goal is to see not just whether this conjecture is true, but also which value of $C_0$ (or $C_1$) suffices for the conjecture, especially for any combination of the special cases mentioned at the end of "[**Main Question**](#Main_Question)", above.

<a id=Strategies></a>
### Strategies

The following are some strategies for answering these questions:

- For iterated Boolean sums (linear combinations of iterates) of Bernstein polynomials ($U_{n,k}$ in [**Micchelli 1973**](https://www.sciencedirect.com/science/article/pii/0021904573900282); see also [**Güntürk and Li**](https://arxiv.org/abs/2112.09181)), find an explicit bound, with no hidden constants, on the approximation error for functions with continuous $r$-th derivative, or verify my [**proofs of these bounds in Propositions B10C and B10D**](https://peteroupc.github.io/bernsupp.html#Results_Used_in_Approximate_Bernoulli_Factories).
- For linear combinations of Bernstein polynomials (Butzer 1953, [**Tachev 2022**](https://doi.org/10.3934/mfc.2022061)), verify my proof of those error bounds in [**my Proposition B10**](https://peteroupc.github.io/bernsupp.html#Results_Used_in_Approximate_Bernoulli_Factories).
- For the "[**Lorentz operator**](https://link.springer.com/article/10.1007/s00365-010-9108-5)", find an explicit bound, with no hidden constants, on the approximation error for the operator $Q_{n,r}$ and for the polynomials $(f_n)$ and $(g_n)$ formed with it, and find the hidden constants $\theta_\alpha$, $s$, and $D$ as well as those in Lemmas 15, 17 to 22, 24, and 25 in the paper.  Or verify my proof of the order-2 operator's error bounds in [**my Proposition B10A**](https://peteroupc.github.io/bernsupp.html#Results_Used_in_Approximate_Bernoulli_Factories).
- Let $f:[-1,1]\to [0,1]$ be continuous.  Find explicit bounds, with no hidden constants, on the error in approximating $f$ with the following polynomials: The polynomials are similar to Chebyshev interpolants, but evaluate $f$ at _rational_ values of $\lambda$ that converge to Chebyshev points (that is, converging to $\cos(j\pi/n)$ with increasing $n$). The error bounds must be close to those of Chebyshev interpolants (see, e.g., chapters 7, 8, and 12 of Trefethen, [**_Approximation Theory and Approximation Practice_**](https://www.chebfun.org/ATAP/), 2013).
- Find other polynomial operators meeting the requirements of the main question (see "Main Question", above) and having explicit error bounds, with no hidden constants, especially operators that preserve polynomials of a higher degree than linear functions.
- Find a sequence of functions $(W_n(f))$ and an explicit and tight upper bound on $C_1>0$ such that, for each integer $n\ge 1$ that's a power of 2&mdash; $$\left|\left(\sum_{i=0}^k W_n\left(\frac{i}{n}\right)\sigma_{n,k,i}\right)-W_{2n}\left(\frac{k}{2n}\right)\right|=|\mathbb{E}[W_n(X_k/n)] - W_{2n}(\mathbb{E}[X_k/n])|\le \frac{C_1 M}{n^{r/2}},\tag{PB}$$ whenever $0\le k\le 2n$, where $M = \max(L, \max|f^{(0)}|, ...,\max|f^{(r-1)}|)$, $L$ is $\max|f^{(r)}|$ or the Lipschitz constant of $f^{(r-1)}$, $X_k$ is a hypergeometric($2n$, $k$, $n$) random variable, and $\sigma_{n,k,i} = {n\choose i}{n\choose {k-i}}/{2n \choose k}=\mathbb{P}(X_k=i)$ is the probability that $X_k$ equals $i$. (**See notes 5 and 6 in "[**End Notes**](#End_Notes)" as well as "[**Proofs for Polynomial-Building Schemes**](https://peteroupc.github.io/bernsupp.html#Proofs_for_Polynomial_Building_Schemes).**)

<a id=Building_Series_Expansions_of_Polynomials></a>
## Building Series Expansions of Polynomials

[**https://mathoverflow.net/questions/409174/concave-functions-series-representation-and-converging-polynomials**](https://mathoverflow.net/questions/409174/concave-functions-series-representation-and-converging-polynomials)

Suppose $f:[0,1]\to[0,1]$ is continuous, polynomially bounded, and belongs to a large class of functions (for example, the $k$-th derivative, $k\ge 0$, is continuous, Lipschitz continuous, concave, strictly increasing, bounded variation, or in the Zygmund class, or $f$ is real analytic).

Then find a non-negative random variable $X$ and a non-trivial series $f(\lambda)=\sum_{a\ge 0}\gamma_a(\lambda)$ such that $\gamma_a(\lambda)/\mathbb{P}(X=a)$ (letting 0/0 equal 0) is a polynomial or rational function with rational Bernstein coefficients lying in $[0, 1]$.

- An example of $X$ is $\mathbb{P}(X=a) = p (1-p)^a$ where $0 < p < 1$ is a known rational.  That is, the probability of getting $a$ is $p (1-p)^a$.
- The convergence rate must be $O(1/n^{r/2})$ if the class has only functions with Lipschitz-continuous $(r-1)$-th derivative.  The method may not introduce transcendental or trigonometric functions (as with Chebyshev interpolants).
- The requirements imply that $\sum_{a\ge 0}\max |\gamma_a(\lambda)| \le 1$.
- The proof of Keane and O'Brien (1994) produces a convex combination of polynomials with 0 and 1 as Bernstein coefficients, but the combination is difficult to construct (it requires finding maximums, for example) and so this proof does not appropriately answer this question.

<a id=New_coins_from_old_smoothly></a>
## New coins from old, smoothly

[**https://mathoverflow.net/questions/407179/using-the-holtz-method-to-build-polynomials-that-converge-to-a-continuous-functi**](https://mathoverflow.net/questions/407179/using-the-holtz-method-to-build-polynomials-that-converge-to-a-continuous-functi)

- [https://mathoverflow.net/questions/447064/explicit-bounds-on-derivatives-of-moments-related-to-bernstein-polynomials](https://mathoverflow.net/questions/447064/explicit-bounds-on-derivatives-of-moments-related-to-bernstein-polynomials)

Let $B_n(f)$ be the degree-$n$ Bernstein polynomial of $f$.

[**Holtz et al. 2011**](https://link.springer.com/content/pdf/10.1007/s00365-010-9108-5.pdf), in the paper "New coins from old, smoothly", studied a family of polynomials $(Q_{n,r} f)$ (which they call the _Lorentz operators_) that approximate a continuous function $f$.

They used the Lorentz operators to build a family of polynomials $(g_n)$ that converge from below to $f$ and satisfy the following: $(g_{2n}−g_{n})$ is a polynomial with non-negative Bernstein coefficients, once it's rewritten to a polynomial in Bernstein form of degree exactly $2n$.

They proved, among other results, the following.  A function $f(\lambda):[0,1]\to(0,1)$ admits a family $(g_n)$ described above that converges at the rate&mdash;

- $O((\Delta_n(\lambda))^\beta)$ if and only if $f$ is $\lfloor\beta\rfloor$ times differentiable and has a ($\beta-\lfloor\beta\rfloor$)-Hölder continuous $\lfloor\beta\rfloor$-th derivative, where $\beta>0$ is a non-integer and $\Delta_n(\lambda) = \max((\lambda(1-\lambda)/n)^{1/2}, 1/n)$.  (Roughly speaking, the rate is $O((1/n)^{\beta})$ when $\lambda$ is close to 0 or 1, and $O((1/n)^{\beta/2})$ elsewhere.)
- $O((\Delta_n(\lambda))^{r+1})$ only if the $r$th derivative of $f$ is in the Zygmund class, where $r\ge 0$ is an integer.

The scheme is as follows:

Let $f:[0,1]\to (0,1)$ have a $\beta$-Hölder continuous $r$-th derivative, where $\beta$ is in (0, 1).  Let $\alpha = r+\beta$; $b = 2^s$; $s\gt 0$ be an integer.  Let $Q_{n, r}f$ be a degree $n+r$ approximating polynomial called a _Lorentz operator_ as described in Holtz et al. 2011.  Let $n_0$ be the smallest $n$, divisible by $b$, such that $Q_{n_0, r}f$ has coefficients within [0, 1]. Define the following for every integer $n \ge n_0$ divisible by $b$:

- $f_{n_0} = Q_{n_0, r}f$.
- $f_{n} = f_{n/b} + Q_{n, r}(f-f_{n/b})$ for each integer $n > n_0$.
- $\phi(n, \alpha, \lambda) = \frac{\theta_{\alpha}}{n^{\alpha}}+(\frac{\lambda(1-\lambda)}{n})^{\alpha/2}$.
- $BP(\lambda)$ is a polynomial defined as follows: Find the degree-$n$ Bernstein polynomial of $\phi(n, r+\beta, \lambda)$, then rewrite it as a degree-$n+r$ polynomial in Bernstein form.
- $g(n, r,\lambda) = f_{n}(\lambda) - D \cdot BP(\lambda).$

Thus, $\theta_\alpha$, $s$, and $D$ are hidden constants with no upper bounds given, making the Holtz method unimplementable.  The same is true for the constants in Lemmas 15, 17 to 22, and 24 in the paper.

<a id=Questions></a>
### Questions

Let $f(\lambda):[0,1]\to (0,1)$ have a $\beta-\lfloor\beta\rfloor$)-Hölder continuous $\lfloor\beta\rfloor$-th derivative, where $\beta>0$ is a non-integer.

1. What is an explicit upper bound (with no hidden constants) on the error in approximating $f$ with the Lorentz operators $(Q_{n,r} f)$, described above, of the form $C\cdot M\cdot\max((\lambda(1-\lambda)/n)^{1/2}, 1/n)^r$, where $C=C(r)$ and $M=M(f,r)$ are constants?
2. Same question, but for the polynomial family $(g_n)$ given in (1), above.
3. Same questions as 1 and 2, but $f$'s $(r-1)$-th derivative is in the Zygmund class. (Note that the method of Holtz et al.'s paper as written doesn't apply to integer $\beta$; see also Conjecture 34 of that paper.)

<a id=From_coin_flips_to_algebraic_functions_via_pushdown_automata></a>
## From coin flips to algebraic functions via pushdown automata

[**https://cstheory.stackexchange.com/questions/50853/from-coin-flips-to-algebraic-functions-via-pushdown-automata**](https://cstheory.stackexchange.com/questions/50853/from-coin-flips-to-algebraic-functions-via-pushdown-automata)

This section is about solving the Bernoulli factory problem on a restricted computing model, namely the model of _pushdown automata_ (finite-state machines with a stack) that are driven by flips of a coin and produce new probabilities.

<a id=Pushdown_Automata></a>
### Pushdown Automata

A _pushdown automaton_ has a finite set of _states_ and a finite set of _stack symbols_, one of which is called EMPTY and takes a biased coin with an unknown probability of heads. It starts with a given state and its stack starts with EMPTY. On each iteration:

- The automaton flips the coin.
- Based on the coin flip (HEADS or TAILS), the current state, and the top stack symbol, it moves to a new state (or keeps it unchanged) and replaces the top stack symbol with zero, one, or two symbols. Thus, there are three kinds of _transition rules_:
     - (_state_, _flip_, _symbol_) &rarr; (_state2_, {_symbol2_}): move to _state2_, replace top stack symbol with same or different one.
     - (_state_, _flip_, _symbol_) &rarr; (_state2_, {_symbol2_, _new_}): move to _state2_, replace top stack symbol with _symbol2_, then _push_ a new symbol (_new_) onto the stack.
     - (_state_, _flip_, _symbol_) &rarr; (_state2_, {}): move to _state2_, _pop_ the top symbol from the stack.

When the stack is empty, the machine stops and returns either 0 or 1 depending on the state it ends up at. (For the questions below, let _flip_ be HEADS, TAILS, or a rational number in [0, 1]; this likewise reduces to the definition above.  The rest of this question assumes the pushdown automaton terminates with probability 1.)

<a id=Algebraic_Functions></a>
### Algebraic Functions

Let $f: (0, 1) \to (0, 1)$ be continuous.  Mossel and Peres (2005) showed that a pushdown automaton can simulate $f$ only if $f$ is _algebraic over the rational numbers_ (there is a nonzero polynomial $P(x, y)$ in two variables and whose coefficients are rational numbers, such that $P(x, f(x)) = 0$ for every $x$ in the domain of $f$).  The algebraic function generated by pushdown automata corresponds to a system of polynomial equations, as described by Mossel and Peres (2005) and Esparza et al. 2004.

Let $\mathcal{C}$ be the class of continuous functions that map (0, 1) to (0, 1) and are algebraic over rationals.  The constants 0 and 1 are also in $\mathcal{C}$.

Let $\mathcal{D} \subseteq \mathcal{C}$ be the class of functions that a pushdown automaton can simulate.

I don't yet know whether $\mathcal{D}=\mathcal{C}$ (and that was also a question of Mossel and Peres).

The following section of my open-source page, [**Pushdown Automata and Algebraic Functions**](https://peteroupc.github.io/bernsupp.html#Pushdown_Automata_and_Algebraic_Functions), contains information on the question. That section sets forth the following results about the class $\mathcal{D}$:

- $\sqrt{\lambda}$ is in $\mathcal{D}$, and so is every rational function in $\mathcal{C}$.
- If $f(\lambda)$ and $g(\lambda)$ are in $\mathcal{D}$, then so are their product and composition.
- If $f(\lambda)$ is in $\mathcal{D}$, then so is every Bernstein-form polynomial in the variable $f(\lambda)$ with coefficients in $\mathcal{D}$.
- If a pushdown automaton can generate a discrete distribution of _n_-letter words, then that distribution's probability generating function is in $\mathcal{D}$ (cf. Dughmi et al. 2021).
- If a pushdown automaton can generate a discrete distribution of _n_-letter words of the same letter, it can generate that distribution conditioned on a finite set of word lengths, or a periodic infinite set of word lengths (e.g., odd word lengths only).
- Every quadratic irrational in (0, 1) is in $\mathcal{D}$.

<a id=Questions_2></a>
### Questions

1. For every function in class $\mathcal{C}$, is there a pushdown automaton that can simulate that function? (In other words, is $\mathcal{D}=\mathcal{C}$?).
2. In particular, is min($\lambda$, $1-\lambda$) in class $\mathcal{D}$? What about $\lambda^{1/p}$ for some prime $p\ge 3$?

**See also Notes 2 and 3.**

<a id=Other_Questions></a>
## Other Questions

- Given integer _m_&ge;0, rational number 0&lt;_k_&le;exp(1), and unknown heads probability 0&le;_&lambda;_&le;1, find a [**Bernoulli factory**](https://peteroupc.github.io/bernoulli.html) for&mdash; $$f(\lambda)=\exp(-(\exp(m+\lambda)-(k(m+\lambda)))) = \frac{\exp(-\exp(m+\lambda))}{\exp(-(k(m+\lambda)))},\tag{PD}$$ that, as much as possible, avoids calculating $h(\lambda) = \exp(m+\lambda)-k(m+\lambda)$; in this sense, the more implicitly the Bernoulli factory works with irrational or transcendental functions, the better.  A solution is sought especially when _k_ is 1 or 2.   Note that the right-hand side of (PD) can be implemented by [**ExpMinus**](https://peteroupc.github.io/bernoulli.html#ExpMinus_exp_minus__z) and division Bernoulli factories, but is inefficient and heavyweight due to the need to calculate $\epsilon$ for the division factory.  In addition there is a Bernoulli factory that first calculates $h(\lambda)$ and $floor(h(\lambda))$ using constructive reals and then runs **ExpMinus**, but this is likewise far from lightweight.  (Calculating exp(.) with floating-point operations is not acceptable for this question.)
- Let $f(\lambda):[0,1]\to [0,1]$ be writable as $f(\lambda)=\sum_{n\ge 0} a_n \lambda^n,$ where $a_n\ge 0$ is rational, $a_n$ is nonzero infinitely often, and $f(1)$ is irrational.  Then what are simple criteria to determine whether there is $0\lt p\lt 1$ such that $0\le a_n\le p(1-p)^n$ and, if so, to find such $p$?  Obviously, if $(a_n)$ is nowhere increasing then $1\gt p\ge a_0$.
- For each $r>0$, characterize the functions $f(\lambda)$ that admit a Bernoulli factory where the expected number of coin flips, raised to the power of $r$, where $r>0$, is finite.
- [**Multiple-Output Bernoulli Factories**](https://mathoverflow.net/questions/412772/from-biased-coins-to-biased-coins-as-efficiently-as-possible): **Let $f(\lambda):\[a, b\] \to (0, 1)$ be continuous, where $0\lt a\lt b\lt 1$**.  Define the entropy bound as $h(f(\lambda))/h(\lambda),$ where&mdash; $h(x)=-x \ln(x)-(1-x) \ln(1-x)$ is related to the Shannon entropy function. Then there is an algorithm that tosses heads with probability $f(\lambda)$ given a coin that shows heads with probability $\lambda$ and no other source of randomness.

    But, **is there an algorithm for $f$ that produces _multiple_ outputs rather than one and has an expected number of coin flips per output that is arbitrarily close to the entropy bound, uniformly for every $\lambda$ in $f$'s domain**? Call such an algorithm an _optimal factory_.  (See Nacu and Peres 2005, Question 1.)  And, does the answer change if the algorithm has access to a fair coin in addition to the biased coin?

    So far, constants as well as $\lambda$ and $1-\lambda$ do admit an optimal factory (see same work), and, as Yuval Peres (Jun. 24, 2021) told me, there is an efficient multiple-output algorithm for $f(\lambda) = \lambda/2$.  But are there others?  See an [**appendix in one of my articles**](https://peteroupc.github.io/bernsupp.html#Multiple_Output_Bernoulli_Factory) for more information on my progress on the problem.

- [**Simple simulation algorithms**](https://stats.stackexchange.com/questions/541402/what-are-relatively-simple-simulations-that-succeed-with-an-irrational-probabili): What simulations exist that are "relatively simple" and succeed with an irrational probability between 0 and 1? What about "relatively simple" Bernoulli factory algorithms for factory functions?  Here, "relatively simple" means that the algorithm:
    - Should use only uniform random integers (or bits) and integer arithmetic.
    - Does not use floating-point arithmetic, make direct use of irrational or transcendental functions or constants, or calculate the _p_-adic digit expansion of an irrational or transcendental function, for any real _p_.
    - Should not use rational arithmetic or increasingly complex approximations, except as a last resort.

    See also Flajolet et al., "On Buffon machines and numbers", 2010.  There are many ways to describe the irrational probability or factory function. References are sought to papers or books that describe irrational constants or factory functions in any of the following ways:

    - For irrational constants:
        - Simple [**continued fraction**](https://peteroupc.github.io/bernoulli.html#Continued_Fractions) expansions.
        - Closed shapes inside the unit square whose area is an irrational number.  (Includes algorithms that tell whether a box lies inside, outside, or partly inside or outside the shape.)    [**Example.**](https://peteroupc.github.io/bernoulli.html#pi___4)
        - Generate a uniform (_x_, _y_) point inside a closed shape, then return 1 with probability _x_.  For what shapes is the expected value of _x_ an irrational number?  [**Example.**](https://peteroupc.github.io/bernsupp.html#4_3___pi)
        - Functions that map [0, 1] to [0, 1] whose integral is an irrational number.
    - Bernoulli factory functions with any of the following series expansions, using rational arithmetic only:
        - Alternating power series (see "[**Certain Power Series**](https://peteroupc.github.io/bernoulli.html#Certain_Power_Series)").
        - Series with nonnegative terms and bounds on the truncation error (see "[**Certain Converging Series**](https://peteroupc.github.io/bernoulli.html#Certain_Converging_Series)").

Prove or disprove:

- Given that $f:[0,1]\to (0,1]$ is convex, the polynomials $(g_n) = (B_n(f) - \max_{0\le\lambda\le 1}|B_n(f)(\lambda)-f(\lambda)|)$ (where $n\ge 1$ is an integer power of 2) are in Bernstein form of degree $n$, converge to $f$ from below, and satisfy: $(g_{2n}-g_{n})$ is a polynomial with non-negative Bernstein coefficients once it's rewritten to a polynomial in Bernstein form of degree exactly $2n$. The same is true for the polynomials $(g_n) = (B_n(f) - |B_n(f)(1/2)-f(1/2)|)$, if $f$ is also symmetric about 1/2.
- Let $f:(D\subseteq [0, 1])\to [0,1]$.  Given a coin that shows heads with probability $\lambda$ (which can be 0 or 1), it is possible to toss heads with probability $f(\lambda)$ using the coin and no other sources of randomness (and, thus, $f$ is [**_strongly simulable_**](https://mathoverflow.net/questions/404961/from-biased-coins-and-nothing-else-to-biased-coins)) **if and only if**&mdash;

    - $f$ is constant on its domain, or is continuous and polynomially bounded on its domain (_polynomially bounded_ means, both $f$ and $1-f$ are bounded below by min($x^n$, $(1-x)^n$) for some integer $n$ [Keane and O'Brien 1994]), and
    - $f(0)$ is 0 or 1 if 0 is in $f$'s domain and $f(1)$ is 0 or 1 whenever 1 is in $f$'s domain, and
    - if $f(0) = 0$ or $f(1) = 0$ or both, then there is a polynomial $g(x):[0,1]\to [0,1]$ with computable coefficients, such that $g(0) = f(0)$ and $g(1) = f(1)$ whenever 0 or 1, respectively, is in the domain of f, and such that $g(x)\gt f(x)$ for every $x$ in the domain of $f$, except at 0 and 1, and
    - if $f(0) = 1$ or $f(1) = 1$ or both, then there is a polynomial $h(x):[0,1]\to [0,1]$ with computable coefficients, such that $h(0) = f(0)$ and $h(1) = f(1)$ whenever 0 or 1, respectively, is in the domain of $f$, and such that $g(x)\lt f(x)$ for every $x$ in the domain of f, except at 0 and 1.

    A condition such as "0 is not in the domain of $f$, or $f$ can be extended to a Lipschitz continuous function on $[0, \epsilon)$ for some $\epsilon>0$" does not work.  A counterexample is $f(x)=(\sin(1/x)/4+1/2)\cdot(1-(1-x)^n)$ for $n\ge 1$ ($f(0)=0$), which is strongly simulable at 0 despite not being Lipschitz at 0.  ($(1-x)^n$ is the probability of the biased coin showing zero $n$ times in a row.)  Keane and O'Brien already showed strong simulability when $D$ contains neither 0 nor 1.

<a id=End_Notes></a>
## End Notes

**Note 2**: On pushdown automata: Etessami and Yannakakis (2009) showed that pushdown automata with rational probabilities are equivalent to recursive Markov chains (with rational transition probabilities), and that for every recursive Markov chain, the system of polynomial equations has nonnegative coefficients. But this paper doesn't deal with the case of recursive Markov chains where the transition probabilities cannot just be rational, but can also be $\lambda$ and $1-\lambda$ where $\lambda$ is an unknown rational or irrational probability of heads.

**Note 3**: On pushdown automata: Banderier and Drmota (2014) showed the asymptotic behavior of power series solutions $f(\lambda)$ of a polynomial system, where both the series and the system have nonnegative real coefficients. Notably, functions of the form $\lambda^{1/p}$ where $p\ge 3$ is not a power of 2, are not possible solutions, because their so-called "critical exponent" is not dyadic. But the result seems not to apply to _piecewise_ power series such as $\min(\lambda,1-\lambda)$, which are likewise algebraic functions.

**Note 4**: $g(\lambda)$ is in the Zygmund class if there is $D>0$ such that $|g(x-h) + g(x+h) - 2g(x)|\le Dh$ wherever the left-hand side is defined and $0\lt h\le\epsilon$.

**Note 5**: This condition is also known as a "consistency requirement"; it ensures that not only the polynomials "increase" to $f(\lambda)$, but also their Bernstein coefficients do as well.  This condition is equivalent in practice to the following statement (Nacu & Peres 2005). For every integer $n\ge 1$ that's a power of 2, $a(2n, k)\ge\mathbb{E}[a(n, X_{n,k})]= \left(\sum_{i=0}^k a(n,i) {n\choose i}{n\choose {k-i}}/{2n\choose k}\right)$, where $a(n,k)$ is the degree-$n$ polynomial's $k$-th Bernstein coefficient, where $0\le k\le 2n$ is an integer, and where $X_{n,k}$ is a hypergeometric($2n$, $k$, $n$) random variable.  A hypergeometric($2n$, $k$, $n$) random variable is the number of "good" balls out of $n$ balls taken uniformly at random, all at once, from a bag containing $2n$ balls, $k$ of which are "good".  See also my [**MathOverflow question**](https://mathoverflow.net/questions/429037/bounds-on-the-expectation-of-a-function-of-a-hypergeometric-random-variable) on finding bounds for hypergeometric variables.

**Note 6**: If $W_n(0)=f(0)$ and $W_n(1)=f(1)$ for every $n$, then the inequality $(PB)$ is automatically true when $k=0$ and $k=2n$, so that the statement has to be checked only for $0\lt k\lt 2n$.  If, in addition, $W_n$ is symmetric about 1/2, so that $W_n(\lambda)=W_n(1-\lambda)$ whenever $0\le \lambda\le 1$, then the statement has to be checked only for $0\lt k\le n$ (since the values $\sigma_{n,k,i} = {n\choose i}{n\choose {k-i}}/{2n \choose k}$ are symmetric in that they satisfy $\sigma_{n,k,i}=\sigma_{n,k,k-i}$).<br>This question is a problem of finding the _Jensen gap_ of $W_n$ for certain kinds of hypergeometric random variables (**see Note 5**).  Lee et al. (2021) deal with a problem very similar to this one and find results that take advantage of $f$'s (here, $W_n$'s) smoothness, but unfortunately assume the variable is supported on an _open_ interval, rather than a _closed_ one (namely $[0,1]$) as in this question.

<a id=References></a>
## References

- E. Voronovskaya, "Détermination de la forme asymptotique d'approximation des fonctions par les polynômes de M. Bernstein", 1932.
- Łatuszyński, K., Kosmidis, I., Papaspiliopoulos, O., Roberts, G.O., "[**Simulating events of unknown probabilities via reverse time martingales**](https://arxiv.org/abs/0907.4018v2)", arXiv:0907.4018v2 [stat.CO], 2009/2011.
- Keane, M. S., and O'Brien, G. L., "A Bernoulli factory", _ACM Transactions on Modeling and Computer Simulation_ 4(2), 1994.
- Holtz, O., Nazarov, F., Peres, Y., "[**New Coins from Old, Smoothly**](https://link.springer.com/article/10.1007/s00365-010-9108-5)", Constructive Approximation 33 (2011).
- Nacu, Şerban, and Yuval Peres. "Fast simulation of new coins from old", The Annals of Applied Probability 15, no. 1A (2005): 93-115.
- Knuth, Donald E. and Andrew Chi-Chih Yao. "The complexity of nonuniform random number generation", in _Algorithms and Complexity: New Directions and Recent Results_, 1976.
- Peres, Y., "[**Iterating von Neumann's procedure for extracting random bits**](https://projecteuclid.org/euclid.aos/1176348543)", Annals of Statistics 1992,20,1, p. 590-597.
- Mossel, Elchanan, and Yuval Peres. New coins from old: computing with unknown bias. Combinatorica, 25(6), pp.707-724, 2005.
- Icard, Thomas F., "Calibrating generative models: The probabilistic Chomsky–Schützenberger hierarchy." Journal of Mathematical Psychology 95 (2020): 102308.
- Dughmi, Shaddin, Jason Hartline, Robert D. Kleinberg, and Rad Niazadeh. "Bernoulli Factories and Black-box Reductions in Mechanism Design." Journal of the ACM (JACM) 68, no. 2 (2021): 1-30.
- Etessami, K. And Yannakakis, M., "Recursive Markov chains, stochastic grammars, and monotone systems of nonlinear equations", Journal of the ACM 56(1), pp.1-66, 2009.
- Banderier, C. And Drmota, M., 2015. Formulae and asymptotics for coefficients of algebraic functions. Combinatorics, Probability and Computing, 24(1), pp.1-53.
- Esparza, J., Kučera, A. and Mayr, R., 2004, July. Model checking probabilistic pushdown automata. In Proceedings of the 19th Annual IEEE Symposium on Logic in Computer Science, 2004. (pp. 12-21). IEEE.
- Flajolet, P., Pelletier, M., Soria, M., "[**On Buffon machines and numbers**](https://arxiv.org/abs/0906.5560v2)", arXiv:0906.5560v2 [math.PR], 2010.
- von Neumann, J., "Various techniques used in connection with random digits", 1951.
- G.G. Lorentz, "The degree of approximation by polynomials with positive coefficients", 1966.
- Micchelli, C. (1973). The saturation class and iterates of the Bernstein polynomials. Journal of Approximation Theory, 8(1), 1-18.
- Butzer, P.L., "Linear combinations of Bernstein polynomials", Canadian Journal of Mathematics 15 (1953).
- Guan, Zhong. "[**Iterated Bernstein polynomial approximations**](https://arxiv.org/pdf/0909.0684)." arXiv preprint arXiv:0909.0684 (2009).
- Güntürk, C. Sinan, and Weilin Li. "[**Approximation with one-bit polynomials in Bernstein form**](https://arxiv.org/pdf/2112.09183)", arXiv:2112.09183 (2021); Constructive Approximation, pp.1-30 (2022).
- Güntürk, C. Sinan, and Weilin Li. "[**Approximation of functions with one-bit neural networks**](https://arxiv.org/abs/2112.09181)", arXiv:2112.09181 (2021).
- Draganov, Borislav R. "On simultaneous approximation by iterated Boolean sums of Bernstein operators." Results in Mathematics 66, no. 1 (2014): 21-41.
- Kawamura, Akitoshi, Norbert Müller, Carsten Rösnick, and Martin Ziegler. "[**Computational benefit of smoothness: Parameterized bit-complexity of numerical operators on analytic functions and Gevrey’s hierarchy**](https://doi.org/10.1016/j.jco.2015.05.001)." Journal of Complexity 31, no. 5 (2015): 689-714.
- Borwein, P.B., "Restricted Uniform Rational Approximations", dissertation, University of British Columbia, 1979.
- Tachev, Gancho. "[**Linear combinations of two Bernstein polynomials**](https://doi.org/10.3934/mfc.2022061)", _Mathematical Foundations of Computing_, 2022.
- Lee, Sang Kyu, Jae Ho Chang, and Hyoung-Moon Kim. "Further sharpening of Jensen's inequality." Statistics 55, no. 5 (2021): 1154-1168.
- Bustamante, J., "Estimates of positive linear operators in terms of second order moduli", J. Math. Anal. Appl. 345 (2008).
- S.N. Bernstein, "The asymptotic behavior of the approximation of functions by their Bernstein polynomials", 1932.
- X. Han, "[**Multi-node higher order expansions of a function**](https://www.sciencedirect.com/science/article/pii/S0021904503001485)", Journal of Approximation Theory, October 2003.
