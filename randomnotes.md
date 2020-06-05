<a id=More_Random_Sampling_Methods></a>
## More Random Sampling Methods

<a id=Specific_Distributions></a>
### Specific Distributions

**Requires random real numbers.**  This section shows algorithms to sample several popular non-uniform distributions. Note, however, that most of these algorithms won't sample the given distribution _exactly_<sup>[**(1)**](#Note1)</sup>, for many reasons:

- They may not take a parameter specifying the maximum error tolerable.
- They may use a `RNDU01` or `RNDRANGE` method, which has no precision requirements.
- They may incur errors due to numerical approximations, including when they calculate irrational numbers or transcendental functions.

Even so, however, these algorithms may be useful if the application is willing to trade accuracy for speed.

<a id=Normal_Gaussian_Distribution></a>
#### Normal (Gaussian) Distribution

The [**_normal distribution_**](https://en.wikipedia.org/wiki/Normal_distribution) (also called the Gaussian distribution) takes the following two parameters:
- `mu` (&mu;) is the mean (average), or where the peak of the distribution's "bell curve" is.
- `sigma` (&sigma;), the standard deviation, affects how wide the "bell curve" appears. The
probability that a normally-distributed random number will be within one standard deviation from the mean is about 68.3%; within two standard deviations (2 times `sigma`), about 95.4%; and within three standard deviations, about 99.7%.  (Some publications give &sigma;<sup>2</sup>, or variance, rather than standard deviation, as the second parameter.  In this case, the standard deviation is the variance's square root.)

There are a number of methods for normal random number generation, including the following.  An application can combine some or all of these.

1. The ratio-of-uniforms method (given as `NormalRatioOfUniforms` below).
2. In the _Box&ndash;Muller transformation_, `mu + radius * cos(angle)` and `mu + radius * sin(angle)`, where `angle = RNDRANGEMaxExc(0, 2 * pi)` and `radius = sqrt(Expo(0.5)) * sigma`, are two independent normally-distributed random numbers.  The polar method (given as `NormalPolar` below) likewise produces two independent normal random numbers at a time.
3. An _approximation_ to a normal random number is the sum of twelve `RNDRANGEMaxExc(0, sigma)` numbers (see Note 13), subtracted by 6 * `sigma`. See `NormalCLT` below, which also includes an optional step to "warp" the random number for better accuracy (Kabal 2000/2019)<sup>[**(2)**](#Note2)</sup> See also [**"Irwin&ndash;Hall distribution" on Wikipedia**](https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution).  D. Thomas (2014)<sup>[**(3)**](#Note3)</sup>, describes a more general approximation called CLT<sub>k</sub>, which combines `k` uniform random numbers as follows: `RNDU01() - RNDU01() + RNDU01() - ...`.
4. Methods that [**invert**](#Inverse_Transform_Sampling) the normal distribution's CDF, including those by Wichura, by Acklam, and by Luu (Luu 2016)<sup>[**(4)**](#Note4)</sup>.  See also [**"A literate program to compute the inverse of the normal CDF"**](https://www.johndcook.com/blog/normal_cdf_inverse/).
5. Karney's algorithm to sample exactly from the normal distribution, without using floating-point numbers (Karney 2014)<sup>[**(5)**](#Note5)</sup>.

For surveys of normal random number generators, see (Thomas et al. 2007)<sup>[**(6)**](#Note6)</sup>, and (Malik and Hemani 2016)<sup>[**(7)**](#Note7)</sup>

    METHOD NormalRatioOfUniforms(mu, sigma)
        while true
            a=RNDU01ZeroExc()
            b=RNDRANGE(0,sqrt(2.0/exp(1.0)))
            if b*b <= -a * a * 4 * ln(a)
              return (RNDINT(1) * 2 - 1) *
                (b * sigma / a) + mu
            end
        end
    END METHOD

    METHOD NormalPolar(mu, sigma)
      while true
        a = RNDU01ZeroExc()
        b = RNDU01ZeroExc()
        if RNDINT(1) == 0: a = 0 - a
        if RNDINT(1) == 0: b = 0 - b
        c = a * a + b * b
        if c != 0 and c <= 1
           c = sqrt(-ln(c) * 2 / c)
           return [a * mu * c + sigma, b * mu * c + sigma]
        end
      end
    END METHOD

    METHOD NormalCLT(mu, sigma)
      sum = 0
      for i in 0...12: sum=sum+RNDRANGEMaxExc(0, sigma)
      sum = sum - 6*sigma
      // Optional: "Warp" the sum for better accuracy
      ssq = sum * sum
      sum = ((((0.0000001141*ssq - 0.0000005102) *
                ssq + 0.00007474) *
                ssq + 0.0039439) *
                ssq + 0.98746) * sum
      return sum + mu
     end
    END METHOD

> **Note:** Methods implementing a variant of the normal distribution, the _discrete Gaussian distribution_, generate _integers_ that closely follow the normal distribution.  Examples include the one in (Karney 2014)<sup>[**(5)**](#Note5)</sup>, as well as so-called "constant-time" methods such as (Micciancio and Walter 2017)<sup>[**(8)**](#Note8)</sup> that are used above all in _lattice-based cryptography_.

<a id=Gamma_Distribution></a>
#### Gamma Distribution

The following method generates a random number that follows a _gamma distribution_ and is based on Marsaglia and Tsang's method from 2000<sup>[**(9)**](#Note9)</sup>.  Usually, the number expresses either&mdash;

- the lifetime (in days, hours, or other fixed units) of a random component with an average lifetime of `meanLifetime`, or
- a random amount of time (in days, hours, or other fixed units) that passes until as many events as `meanLifetime` happen.

Here, `meanLifetime` must be an integer or noninteger greater than 0, and `scale` is a scaling parameter that is greater than 0, but usually 1.

    METHOD GammaDist(meanLifetime, scale)
        // Needs to be greater than 0
        if meanLifetime <= 0 or scale <= 0: return error
        // Exponential distribution special case if
        // `meanLifetime` is 1 (see also (Devroye 1986), p. 405)
        if meanLifetime == 1: return Expo(1.0 / scale)
        d = meanLifetime
        v = 0
        if meanLifetime < 1: d = d + 1
        d = d - (1.0 / 3) // NOTE: 1.0 / 3 must be a fractional number
        c = 1.0 / sqrt(9 * d)
        while true
            x = 0
            while true
               x = Normal(0, 1)
               v = c * x + 1;
               v = v * v * v
               if v > 0: break
            end
            u = RNDU01ZeroExc()
            x2 = x * x
            if u < 1 - (0.0331 * x2 * x2): break
            if ln(u) < (0.5 * x2) + (d * (1 - v + ln(v))): break
        end
        ret = d * v
        if meanLifetime < 1
           ret = ret * pow(RNDU01(), 1.0 / meanLifetime)
        end
        return ret * scale
    END METHOD

<a id=Beta_Distribution></a>
#### Beta Distribution

The beta distribution is a bounded distribution; its two parameters, `a` and `b`, are both greater than 0 and describe the distribution's shape.  Depending on `a` and `b`, the shape can be a smooth peak or a smooth valley.

The following method generates a random number that follows a _beta distribution_, in the interval [0, 1).

    METHOD BetaDist(a, b)
      if b==1 and a==1: return RNDU01()
      // Min-of-uniform
      if a==1: return 1.0-pow(RNDU01(),1.0/b)
      // Max-of-uniform.  Use only if a is small to
      // avoid accuracy problems, as pointed out
      // by Devroye 1986, p. 675.
      if b==1 and a < 10: return pow(RNDU01(),1.0/a)
      x=GammaDist(a,1)
      return x/(x+GammaDist(b,1))
    END METHOD

I give an [**exact sampler**](https://peteroupc.github.io/betadist.html) for the beta distribution (when `a` and `b` are both 1 or greater) in a separate page.

<a id=von_Mises_Distribution></a>
#### von Mises Distribution

The _von Mises distribution_ describes a distribution of circular angles and uses two parameters: `mean` is the mean angle and `kappa` is a shape parameter.  The distribution is uniform at `kappa = 0` and approaches a normal distribution with increasing `kappa`.

The algorithm below generates a random number from the von Mises distribution, and is based on the Best&ndash;Fisher algorithm from 1979 (as described in (Devroye 1986)<sup>[**(10)**](#Note10)</sup> with errata incorporated).

    METHOD VonMises(mean, kappa)
        if kappa < 0: return error
        if kappa == 0
            return RNDRANGEMinMaxExc(mean-pi, mean+pi)
        end
        r = 1.0 + sqrt(4 * kappa * kappa + 1)
        rho = (r - sqrt(2 * r)) / (kappa * 2)
        s = (1 + rho * rho) / (2 * rho)
        while true
            u = RNDRANGEMaxExc(-pi, pi)
            v = RNDU01ZeroOneExc()
            z = cos(u)
            w = (1 + s*z) / (s + z)
            y = kappa * (s - w)
            if y*(2 - y) - v >=0 or ln(y / v) + 1 - y >= 0
               if angle<-1: angle=-1
               if angle>1: angle=1
               // NOTE: Inverse cosine replaced here
               // with `atan2` equivalent
               angle = atan2(sqrt(1-w*w),w)
               if u < 0: angle = -angle
               return mean + angle
            end
        end
    END METHOD

<a id=Stable_Distribution></a>
#### Stable Distribution

As more and more independent random numbers, generated the same way, are added together, their distribution tends to a [**_stable distribution_**](https://en.wikipedia.org/wiki/Stable_distribution), which resembles a curve with a single peak, but with generally "fatter" tails than the normal distribution.  (Here, the stable distribution means the "alpha-stable distribution".) The pseudocode below uses the Chambers&ndash;Mallows&ndash;Stuck algorithm.  The `Stable` method, implemented below, takes two parameters:

- `alpha` is a stability index in the interval (0, 2].
- `beta` is a skewness in the interval [-1, 1]; if `beta` is 0, the curve is symmetric.

&nbsp;

    METHOD Stable(alpha, beta)
        if alpha <=0 or alpha > 2: return error
        if beta < -1 or beta > 1: return error
        halfpi = pi * 0.5
        unif=RNDRANGEMinMaxExc(-halfpi, halfpi)
        c=cos(unif)
        if alpha == 1
           s=sin(unif)
           if beta == 0: return s/c
           expo=Expo(1)
           return 2.0*((unif*beta+halfpi)*s/c -
             beta * ln(halfpi*expo*c/(unif*beta+halfpi)))/pi
        else
           z=-tan(alpha*halfpi)*beta
           ug=unif+atan2(-z, 1)/alpha
           cpow=pow(c, -1.0 / alpha)
           return pow(1.0+z*z, 1.0 / (2*alpha))*
              (sin(alpha*ug)*cpow)*
              pow(cos(unif-alpha*ug)/expo, (1.0 - alpha) / alpha)
        end
    END METHOD

<a id=Multivariate_Normal_Multinormal_Distribution></a>
#### Multivariate Normal (Multinormal) Distribution

The following pseudocode calculates a random vector (list of numbers) that follows a [**_multivariate normal (multinormal) distribution_**](https://en.wikipedia.org/wiki/Multivariate_normal_distribution).  The method `MultivariateNormal` takes the following parameters:

- A list, `mu` (&mu;), which indicates the means to add to the random vector's components. `mu` can be `nothing`, in which case each component will have a mean of zero.
- A list of lists `cov`, that specifies a _covariance matrix_ (&Sigma;, a symmetric positive definite N&times;N matrix, where N is the number of components of the random vector).

&nbsp;

    METHOD Decompose(matrix)
      numrows = size(matrix)
      if size(matrix[0])!=numrows: return error
      // Does a Cholesky decomposition of a matrix
      // assuming it's positive definite and invertible
      ret=NewList()
      for i in 0...numrows
        submat = NewList()
        for j in 0...numrows: AddItem(submat, 0)
        AddItem(ret, submat)
      end
      s1 = sqrt(matrix[0][0])
      if s1==0: return ret // For robustness
      for i in 0...numrows
        ret[0][i]=matrix[0][i]*1.0/s1
      end
      for i in 0...numrows
        msum=0.0
        for j in 0...i: msum = msum + ret[j][i]*ret[j][i]
        sq=matrix[i][i]-msum
        if sq<0: sq=0 // For robustness
        ret[i][i]=math.sqrt(sq)
      end
      for j in 0...numrows
        for i in (j + 1)...numrows
          // For robustness
          if ret[j][j]==0: ret[j][i]=0
          if ret[j][j]!=0
            msum=0
            for k in 0...j: msum = msum + ret[k][i]*ret[k][j]
            ret[j][i]=(matrix[j][i]-msum)*1.0/ret[j][j]
          end
        end
      end
      return ret
    END METHOD

    METHOD MultivariateNormal(mu, cov)
      mulen=size(cov)
      if mu != nothing
        mulen = size(mu)
        if mulen!=size(cov): return error
        if mulen!=size(cov[0]): return error
      end
      // NOTE: If multiple random points will
      // be generated using the same covariance
      // matrix, an implementation can consider
      // precalculating the decomposed matrix
      // in advance rather than calculating it here.
      cho=Decompose(cov)
      i=0
      ret=NewList()
      vars=NewList()
      for j in 0...mulen: AddItem(vars, Normal(0, 1))
      while i<mulen
        nv=Normal(0,1)
        msum = 0
        if mu == nothing: msum=mu[i]
        for j in 0...mulen: msum=msum+vars[j]*cho[j][i]
        AddItem(ret, msum)
        i=i+1
      end
      return ret
    end

> **Note:** The [**Python sample code**](https://peteroupc.github.io/randomgen.zip) contains a variant of this
> method for generating multiple random vectors in one call.
>
> **Examples:**
>
> 1. A **binormal distribution** (two-variable multinormal distribution) can be sampled using the following idiom: `MultivariateNormal([mu1, mu2], [[s1*s1, s1*s2*rho], [rho*s1*s2, s2*s2]])`, where `mu1` and `mu2` are the means of the two normal random numbers, `s1` and `s2` are their standard deviations, and `rho` is a _correlation coefficient_ greater than -1 and less than 1 (0 means no correlation).
> 2. **Log-multinormal distribution**: Generate a multinormal random vector, then apply `exp(n)` to each component `n`.
> 3. A **Beckmann distribution** is the norm (see the appendix) of a random binormal vector.
> 4. A **Rice (Rician) distribution** is a Beckmann distribution in which the binormal random pair is generated with `m1 = m2 = a / sqrt(2)`, `rho = 0`, and `s1 = s2 = b`, where `a` and `b` are the parameters to the Rice distribution.
> 5. A **Rice&ndash;Norton distributed** random number is the norm of the following vector: `MultivariateNormal([v,v,v],[[w,0,0],[0,w,0],[0,0,w]])`, where `v = a/sqrt(m*2)`, `w = b*b/m`, and `a`, `b`, and `m` are the parameters to the Rice&ndash;Norton distribution.
> 6. A **standard** [**complex normal distribution**](https://en.wikipedia.org/wiki/Complex_normal_distribution) is a binormal distribution in which the binormal random pair is generated with `s1 = s2 = sqrt(0.5)` and `mu1 = mu2 = 0` and treated as the real and imaginary parts of a complex number.

<a id=Random_Real_Numbers_with_a_Given_Positive_Sum></a>
#### Random Real Numbers with a Given Positive Sum

Generating _n_ `GammaDist(total, 1)` numbers and dividing them by their sum<sup>[**(11)**](#Note11)</sup>
 will result in _n_ uniform random numbers that (approximately) sum to `total`, in random order (see a [**Wikipedia article**](https://en.wikipedia.org/wiki/Dirichlet_distribution#Gamma_distribution)).  For example, if `total` is 1, the numbers will (approximately) sum to 1.  Note that in the exceptional case that all numbers are 0, the process should repeat.

> **Notes:**
>
> 1. Notes 1 and 2 in the section "Random Integers with a Given Positive Sum" apply here.
> 2. The **Dirichlet distribution**, as defined in some places (e.g., _Mathematica_; (Devroye 1986)<sup>[**(10)**](#Note10)</sup>, p. 593-594), can be sampled by generating _n_+1 random [**gamma-distributed**](#Gamma_Distribution) numbers, each with separate parameters, taking their sum<sup>[**(11)**](#Note11)</sup>, dividing them by that sum, and taking the first _n_ numbers. (The _n_+1 numbers sum to 1, but the Dirichlet distribution models the first _n_ of them, which will generally sum to less than 1.)

<a id=Gaussian_and_Other_Copulas></a>
#### Gaussian and Other Copulas

A _copula_ is a way to describe the dependence between random numbers.

One example is a _Gaussian copula_; this copula is sampled by sampling from a [**multinormal distribution**](#Multivariate_Normal_Multinormal_Distribution), then converting the resulting numbers to _dependent_ uniform random numbers. In the following pseudocode, which implements a Gaussian copula:

- The parameter `covar` is the covariance matrix for the multinormal distribution.
- `erf(v)` is the [**error function**](https://en.wikipedia.org/wiki/Error_function) of the number `v` (see the appendix).

&nbsp;

    METHOD GaussianCopula(covar)
       mvn=MultivariateNormal(nothing, covar)
       for i in 0...size(covar)
          // Apply the normal distribution's CDF
          // to get uniform random numbers
          mvn[i] = (erf(mvn[i]/(sqrt(2)*sqrt(covar[i][i])))+1)*0.5
       end
       return mvn
    END METHOD

Each of the resulting uniform random numbers will be in the interval [0, 1], and each one can be further transformed to any other probability distribution (which is called a _marginal distribution_ here) by passing the uniform number to the distribution's inverse CDF (see "[**Inverse Transform Sampling**](#Inverse_Transform_Sampling)", and see also Cario and Nelson 1997.)

> **Examples:**
>
> 1. To generate two dependent uniform random numbers with a Gaussian copula, generate `GaussianCopula([[1, rho], [rho, 1]])`, where `rho` is the Pearson correlation coefficient, in the interval [-1, 1]. (Other correlation coefficients besides `rho` exist. For example, for a two-variable Gaussian copula, the [**Spearman correlation coefficient**](https://en.wikipedia.org/wiki/Rank_correlation) `srho` can be converted to `rho` by `rho = sin(srho * pi / 6) * 2`.  Other correlation coefficients are not further discussed in this document.)
> 2. The following example generates two random numbers that follow a Gaussian copula with exponential marginals (`rho` is the Pearson correlation coefficient, and `rate1` and `rate2` are the rates of the two exponential marginals).
>
>         METHOD CorrelatedExpo(rho, rate1, rate2)
>            copula = GaussianCopula([[1, rho], [rho, 1]])
>            // Transform to exponentials using that
>            // distribution's inverse CDF
>            return [-logp1(-copula[0]) / rate1,
>              -logp1(-copula[1]) / rate2]
>         END METHOD

Other kinds of copulas describe different kinds of dependence between random numbers.  Examples of other copulas are&mdash;

- the **Fr&eacute;chet&ndash;Hoeffding upper bound copula** _\[x, x, ..., x\]_ (e.g., `[x, x]`), where `x = RNDU01()`,
- the **Fr&eacute;chet&ndash;Hoeffding lower bound copula** `[x, 1.0 - x]` where `x = RNDU01()`,
- the **product copula**, where each number is a separately generated `RNDU01()` (indicating no dependence between the numbers), and
- the **Archimedean copulas**, described by M. Hofert and M. M&auml;chler (2011)<sup>[**(12)**](#Note12)</sup>.

<a id=Exponential_Distribution_Another_Exact_Algorithm></a>
### Exponential Distribution: Another Exact Algorithm

The following method samples exactly from an exponential distribution (with an accuracy of 2<sup>`-precision`</sup> and a &lambda; parameter of 1) (Devroye and Gravel 2018)<sup>[**(13)**](#Note13)</sup>.  Includes an algorithm due to (Morina et al. 2019)<sup>[**(14)**](#Note14)</sup>.

    METHOD LogisticExp(prec)
        // Generates 1 with probability 1/(exp(2^-prec)+1).
        // References: Alg. 6 of Morina et al. 2019; Carinne et al. 2020.
        denom=pow(2,prec)
        while true
           if RNDINT(1)==0: return 0
           if ZeroOrOneExpMinus(1, denom) == 1: return 1
        end
    END METHOD

    METHOD ExpoExact(precision)
       ret=0
       for i in 1..precision
        if LogisticExp(i)==1: ret=ret+pow(2,-i)
       end
       while ZeroOrOneExpMinus(1,1)==1: ret=ret+1
       return ret
    END METHOD

> **Note:** After `ExpoExact` is used to generate a random number, an application can append additional binary digits (such as `RNDINT(1)`) to the end of that number without affecting the distribution (Karney 2014)<sup>[**(5)**](#Note5)</sup>.

<a id=Notes></a>
## Notes

<small><sup id=Note1>(1)</sup> If an algorithm samples a distribution _exactly_, it means that the algorithm&mdash;
- gives every representable number the expected probability of occurring, as closely as possible, and
- can sample the given distribution to arbitrary precision while minimizing approximation error.

In general, the only random numbers an exact algorithm uses are random bits (binary digits).</small>

<small><sup id=Note2>(2)</sup> Kabal, P., "Generating Gaussian Pseudo-Random Variates", McGill University, 2000/2019.</small>

<small><sup id=Note3>(3)</sup> Thomas, D.B., 2014, May. FPGA Gaussian random number generators with guaranteed statistical accuracy. In _2014 IEEE 22nd Annual International Symposium on Field-Programmable Custom Computing Machines_ (pp. 149-156).</small>

<small><sup id=Note4>(4)</sup> Luu, T., "Fast and Accurate Parallel Computation of Quantile Functions for Random Number Generation", Dissertation, University College London, 2016.</small>

<small><sup id=Note5>(5)</sup> Karney, C.F.F., "[Sampling exactly from the normal distribution](https://arxiv.org/abs/1303.6257v2)", arXiv:1303.6257v2  [physics.comp-ph], 2014.</small>

<small><sup id=Note6>(6)</sup> Thomas, D., et al., "Gaussian Random Number Generators", _ACM Computing Surveys_ 39(4), 2007.</small>

<small><sup id=Note7>(7)</sup> Malik, J.S., Hemani, A., "Gaussian random number generation: A survey on hardware architectures", _ACM Computing Surveys_ 49(3), 2016.</small>

<small><sup id=Note8>(8)</sup> Micciancio, D. and Walter, M., "Gaussian sampling over the integers: Efficient, generic, constant-time", in Annual International Cryptology Conference, August 2017 (pp. 455-485).</small>

<small><sup id=Note9>(9)</sup> "A simple method for generating gamma variables", _ACM Transactions on Mathematical Software_ 26(3), 2000.</small>

<small><sup id=Note10>(10)</sup> Devroye, L., [**_Non-Uniform Random Variate Generation_**](http://luc.devroye.org/rnbookindex.html), 1986.</small>

<small><sup id=Note11>(11)</sup> [**Kahan summation**](https://en.wikipedia.org/wiki/Kahan_summation_algorithm) can be a more robust way than the na&iuml;ve approach to compute the sum of three or more floating-point numbers.</small>

<small><sup id=Note12>(12)</sup> Hofert, M., and Maechler, M.  "Nested Archimedean Copulas Meet R: The nacopula Package".  _Journal of Statistical Software_ 39(9), 2011, pp. 1-20.</small>

<small><sup id=Note13>(13)</sup> Devroye, L., Gravel, C., "[Sampling with arbitrary precision](https://arxiv.org/abs/1502.02539v5)", arXiv:1502.02539v5 [cs.IT], 2018.</small>

<small><sup id=Note14>(14)</sup> Morina, G., Łatuszyński, K., et al., "From the Bernoulli Factory to a Dice Enterprise via Perfect Sampling of Markov Chains", 2019.</small>

<a id=Appendix></a>
## Appendix

<a id=Implementation_of_erf></a>
### Implementation of `erf`

The pseudocode below shows how the [**error function**](https://en.wikipedia.org/wiki/Error_function) `erf` can be implemented, in case the programming language used doesn't include a built-in version of `erf` (such as JavaScript at the time of this writing).   In the pseudocode, `EPSILON` is a very small number to end the iterative calculation.

    METHOD erf(v)
        if v==0: return 0
        if v<0: return -erf(-v)
        if v==infinity: return 1
        // NOTE: For Java `double`, the following
        // line can be added:
        // if v>=6: return 1
        i=1
        ret=0
        zp=-(v*v)
        zval=1.0
        den=1.0
        while i < 100
            r=v*zval/den
            den=den+2
            ret=ret+r
            // NOTE: EPSILON can be pow(10,14),
            // for example.
            if abs(r)<EPSILON: break
            if i==1: zval=zp
            else: zval = zval*zp/i
            i = i + 1
        end
        return ret*2/sqrt(pi)
    END METHOD

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
