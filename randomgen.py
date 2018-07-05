"""
Sample code for the article "Random Number Generation and Sampling Methods"
https://www.codeproject.com/Articles/1190459/Random-Number-Generation-Methods

Written by Peter O.
Any copyright is released to the Public Domain.
https://creativecommons.org/publicdomain/zero/1.0/
"""

import math
import random

_SIGBITS = 53
_FLOAT_MAX = 1.7976931348623157e+308

def _tableInterpSearch(table,x,censor=False):
   # Effective length is the length of table minus 1
   tablelen=len(table)-1
   left=0
   right=tablelen-1
   while left<=right:
      index=int((left+right)/2)
      c=table[index]
      n=table[index+1]
      if x>=c[0] and x<n[0]:
          interp=(x-c[0])*1.0/(n[0]-c[0])
          return c[1]+(n[1]-c[1])*interp
      if x>c[0]:
          left = index+1
          continue
      right=index-1
      continue
   if censor:
       if x<=table[0][0]: return table[0][1]
       if x>=table[tablelen][0]:
           return table[tablelen][1]
   return None

def numericalTable(func, x, y, n=100):
  ret=[x+(y-x)*(i*1.0/n) for i in range(n+1)]
  return [[func(b), b] for b in ret]

class RandomGen:
  def __init__(self,rng=None):
    """ NOTES:

     1. Assumes that 'rng' implements
     a 'randint(a, b)' method that returns a random
     integer in the interval [a, b].  Currently, this
     class assumes 'a' is always 0.
     2. _rndint_ (and functions that ultimately call it) may be
     slower than desirable if many random numbers are
     needed at once.  Ways to improve the performance
     of generating many random numbers at once, such
     as parallel processing or vectorization, are currently outside
     the scope of this code. """
    if rng==None:
      self.rng=random.Random()
    else:
      self.rng=rng
    self.bitcount=24
    self.curbit=0

  def _rndbit(self):
    if self.bitcount>=24:
      self.bitcount=0
      self.curbit=self.rng.randint(0,(1<<24) - 1)
    ret=self.curbit&1
    self.curbit>>=1
    self.bitcount+=1
    return ret

  def rndint(self, maxInclusive):
    if maxInclusive < 0:
      raise ValueError("maxInclusive less than 0")
    if maxInclusive==0:
      return 0
    if maxInclusive==1:
      return self._rndbit()
    return self.rng.randint(0, maxInclusive)

  def rndintrange(self, minInclusive, maxInclusive):
    # NOTE: Since Python integers are arbitrary-precision,
    # the naive approach will work well here
    return minInclusive + self.rndint(maxInclusive - minInclusive)

  def rndintexcrange(self, minInclusive, maxExclusive):
    return minInclusive + self.rndint(maxExclusive - minInclusive - 1)

  def rndbits(self, bits):
    return self.rndint((1 << bits) - 1)

  def rndu01(self):
    e=-_SIGBITS
    while True:
      if self.rndint(1)==0:
        e-=1
      else:
        break
    sig=self.rndint((1 << (_SIGBITS - 1)) - 1)
    if sig==0 and self.rndint(1)==0:
      e+=1
    sig=sig+(1<<(_SIGBITS - 1))
    # NOTE: Multiply by 1.0 to coerce to floating-point
    return sig * 1.0 * (2.0 ** e)

  def rndu01oneexc(self):
    while True:
      ret=self.rndu01()
      if ret != 1.0:
        return ret

  def rndu01zerooneexc(self):
    while True:
      ret=self.rndu01()
      if ret != 1.0 and ret != 0.0:
        return ret

  def rndu01zeroexc(self):
    while True:
      ret=self.rndu01()
      if ret != 0.0:
        return ret

  def rndnumrange(self, minInclusive, maxInclusive):
    if minInclusive > maxInclusive:
      raise ValueError
    if minInclusive >= 0 or minInclusive + _FLOAT_MAX >= maxInclusive:
       return minInclusive + (maxInclusive - minInclusive) * self.rndu01()
    while True:
       ret = self.rndu01() * _FLOAT_MAX
       negative = self.rndint(1) == 0
       if negative:
          ret = 0 - ret
       if negative and ret == 0:
          continue
       if ret>=minInclusive and ret<=maxInclusive:
          return ret

  def rndnumexcrange(self, minInclusive, maxExclusive):
    if minInclusive >= maxExclusive:
      raise ValueError
    while True:
      ret=self.rndnumrange(minInclusive, maxExclusive)
      if ret < maxExclusive:
        return ret

  def shuffle(self, list):
    if len(list) >= 2:
      i = len(list) - 1
      while i > 0:
        k=self.rndintexc(i+1)
        tmp=list[i]
        list[i]=list[k]
        list[k]=tmp
        i-=1
    return list

  def partialshuffle(self, list, k):
    ki = 0
    if len(list) >= 2:
      i = len(list) - 1
      while i > 0 and ki < k:
        k=self.rndintexc(i+1)
        tmp=list[i]
        list[i]=list[k]
        list[k]=tmp
        i-=1
        k+=1
    return list

  def sample(self, list, k):
    if k<0 or k>len(list): raise ValueError
    n=len(list)
    if n==k: return [x for x in list]
    if n<200:
      s=self.shuffle([x for x in list])
      return s[0:k] # Choose first k items
    if n/4>k and n<5000:
      s=self.partialshuffle([x for x in list], k)
      return s[n-k:n] # Choose last k items
    ki=0
    kh={}
    while ki < k:
       c=self.rndintexc(k)
       if c not in kh:
          kh[c]=True
          ki+=1
    return [list[i] for i in kh.keys()]

  def choice(self, list):
    return list[self.rndintexc(len(list))]

  def ball_point(self, dimension, radius = 1.0):
    if dimension<=0:
      raise ValueError
    while True:
      norm=0
      point=[self.rndnumrange(-1,1) for i in range(dimension)]
      for coord in point:
        norm+=coord*coord
      norm=math.sqrt(norm)
      if norm<=1.0:
        return point

  def hypersphere_point(self, dimension, radius = 1.0):
    if dimension<=0:
      raise ValueError
    while True:
      norm=0
      point=[self.normal() for i in range(dimension)]
      for coord in point:
        norm+=coord*coord
      norm=math.sqrt(norm)
      if norm>0:
        return [p*radius/norm for p in point]

  def numbersWithSum(self, count, sum = 1.0):
    if count<=0 or sum<=0:
      raise ValueError
    while True:
      numsum=0
      nums=None
      if sum==1:
         nums=[self.exponential() for i in range(count)]
      else:
         nums=[self.gamma(sum) for i in range(count)]
      for num in nums:
        numsum+=num
      if numsum>0:
        return [(p/numsum)*sum for p in nums]

  def weighted_choice(self, weights):
    if len(weights)==0:
      raise ValueError
    sum=0
    i=0
    while i < len(weights):
      sum+=weights[i]
      i+=1
    value=self.rndnumexcrange(0, sum)
    i=0
    lastItem=len(weights)-1
    runningValue=0
    while i<len(weights):
      if weights[i]>0:
        newValue=runningValue+weights[i]
        if value < newValue:
          return i
        runningValue=newValue
        lastItem=i
      i+=1
    return lastItem

  def continuous_choice(self, list, weights):
    if len(list)<=0 or len(weights)<len(list):
      raise ValueError
    if len(list)==1:
      return list[0]
    sum=0
    areas=[]
    i=0
    while i<len(list)-1:
      weightArea=(weights[i]+weights[i+1])*0.5* \
        (list[i+1]-list[i])
      if weightArea < 0:
        weightArea = -weightArea
      sum+=weightArea
      i+=1
    value=self.rndnumexcrange(0, sum)
    i=0
    runningValue=0
    while i < len(list)-1:
      area=areas[i]
      if area>0:
        newValue=runningValue+area
        if value<newValue:
          interp=self.rndu01oneexc()
          retValue=list[i]+(list[i+1]-list[i])*interp
          return retValue
        runningValue=newValue
      i+=1
    return list[len(list)-1]

  def normal(self, mu=0.0, sigma=1.0):
    """ Generates a normally-distributed random number. """
    bmp=0.8577638849607068 # sqrt(2/exp(1))
    while True:
      a=self.rndu01zeroexc()
      b=self.rndnumrange(-bmp,bmp)
      if b*b <= -4 * a * a * math.log(a):
        return (b * sigma / a) + mu

  def lognormal(self,mu=0.0,sigma=0.0):
    return math.exp(self.normal(mu,sigma))

  def weibull(self, a, b):
    """ Generates a Weibull-distributed random number. """
    return b*(-math.log(self.rndu01zerooneexc()))**(1.0/a)

  def triangular(self, startpt, midpt, endpt):
    return self.continuous_choice([startpt,midpt,endpt],\
      [0,1,0])

  def gumbel(self,a,b):
     return a + math.log(self.exponential()) * b

  def frechet(self,a,b,mu=0):
    return b*pow(self.exponential(),-1.0/a)+mu

  def beta(self, a, b, nc = 0):
    """ Generates a beta-distributed random number.
     `a` and `b` are the two parameters of the beta distribution,
     and `nc` is a parameter such that `nc` other than 0
     indicates a _noncentral_ distribution. """
    avar = a + self.poisson(nc)
    if b==1 and avar==1: return self.rndu01()
    if avar==1: return 1.0-pow(self.rndu01(),1.0/b)
    if b==1: return pow(self.rndu01(),1.0/avar)
    x=self.gamma(avar)
    return x/(x+self.gamma(b))

  def binomial(self, trials, p):
    if trials < 0:
      raise ValueError
    if trials==0:
      return 0
    if p>=1.0:
      return trials
    if p<=0.0:
      return 0
    i=0
    count=0
    tp=trials*p*1.0
    if tp>25 or (tp > 5 and p>0.1 and p<0.9):
      countval=-1
      while countval<0 or countval > trials:
        countval=self.normal(tp,tp)
      return round(countval)
    while i < trials:
      if self.rndu01oneexc() < p:
        count+=1
      i+=1
    return count

  def hypergeometric(self,trials,ones,count):
    if ones<0 or count<0 or trials<0 or ones > count or trials>count:
      raise ValueError
    if ones==0:
      return 0
    successes=0
    i=0
    currentCount=count
    currentOnes=ones
    while i<trials and currentOnes>0:
      if self.rndintexc(currentCount)<currentOnes:
        currentOnes-=1
        successes+=1
      currentCount-=1
      i+=1
    return successes

  def poisson(self,mean):
    """ Generates a random number following a Poisson distribution.  """
    if mean<0:
      raise ValueError
    if mean==0:
      return 0
    p=1.0
    if mean>9:
      p=-1.0
      while p<0:
        p=self.normal(mean,mean)
      return round(p)
    pn=math.exp(-mean)
    count=0
    while True:
      count+=1
      p*=self.rndu01oneexc()
      if p<=pn:
        return count-1

  def rayleigh(self,a):
    """ Generates a random number following a Rayleigh distribution.  """
    return a * math.sqrt(-2 * math.log(self.rndu01zerooneexc()))

  def gamma(self,mean,b=1.0,c=1.0,d=0.0):
    """ Generates a random number following a gamma distribution.  """
    if mean<=0:
      raise ValueError
    dd=mean
    v=0
    if mean==1:
      return -math.log(self.rndu01zerooneexc())
    if mean<1:
      dd+=1
    dd-=1.0/3
    cc=1.0/math.sqrt(9*dd)
    while True:
      x=0
      while True:
        x=self.normal(0,1)
        v=cc*x+1
        v=v*v*v
        if v>0:
          break
      u=self.rndu01zeroexc()
      x2=x*x
      if u<1-(0.0331*x2*x2):
        break
      if math.log(u)<(0.5*x2)+(dd*(1-v+math.log(v))):
        break
    ret=dd*v
    if mean<1:
      ret=ret*math.exp(math.log(1.0-self.rndu01oneexc()) / mean)
    return ret**(1.0/c)*b+d

  def stable(self, alpha, beta):
        """ Generates a random number following a stable distribution.  """
        if alpha <=0 or alpha > 2: raise ValueError
        if beta < -1 or beta > 1: raise ValueError
        halfpi = math.pi * 0.5
        unif=self.rndnumexcrange(-halfpi, halfpi)
        while unif==-halfpi: unif=self.rndnumexcrange(-halfpi, halfpi)
        # Cauchy special case
        if alpha == 1 and beta == 0: return tan(unif)
        expo=-math.log(self.rndu01zeroexc())
        c=math.cos(unif)
        if alpha == 1:
                s=math.sin(unif)
                return 2.0*((unif*beta+halfpi)*s/c -  \
                    beta * math.log(halfpi*expo*c/(unif*beta+halfpi)))/pi
        z=-math.tan(alpha*halfpi)*beta
        ug=unif+math.atan2(-z, 1)/alpha
        cpow=pow(c, -1.0 / alpha)
        return pow(1.0+z*z, 1.0 / (2*alpha))*  \
            (math.sin(alpha*ug)*cpow)*  \
            pow(math.cos(unif-alpha*ug)/expo, (1.0 - alpha) / alpha)

  def stable0(self, alpha, beta, mu, sigma):
       """ Generates a random number following a 'type 0' stable distribution.  """
       x=math.log(sigma)*2.0/pi if alpha==1 else math.tan(pi*0.5*alpha)
       return self.stable(alpha, beta) * sigma + (mu - sigma * beta * x)

  def geometric(self, p):
     return self.negativebinomial(1, p)

  def negativebinomial(self,successes,p):
    if successes<0:
      raise ValueError
    if successes==0 or p>=1.0:
      return 0
    if p<=0.0:
      return 1.0/0.0
    if successes==1.0:
      return int(math.log(self.rndu01zerooneexc())/ln(1.0-p))
    else:
      return self.poisson(self.gamma(successes)*(1-p)/p)

  def dirichlet(alphas):
     gammas=[self.gamma(x,1) for x in alphas]
     sumgammas=sum(gammas)
     return [gammas[i]/sumgammas for i in range(len(alphas)-1)]

  def multipoisson(self, firstmean, othermeans):
     """ Multivariate Poisson distribution (as found in Mathematica). """
     first=self.poisson(firstmean)
     return [first+self.poisson(m) for m in othermeans]

  def exponential(self,lamda = 1.0):
    return -math.log(self.rndu01zerooneexc())/lamda

  def pareto(self,minimum,alpha):
    return self.rndu01zerooneexc()**(-1.0/alpha)*minimum

  def vonmises(self,mean,kappa):
    if kappa<0:
      raise ValueError
    if kappa==0:
      return self.rndnumexcrange(mean-pi,mean+pi)
    r=1+math.sqrt(4*kappa*kappa+1)
    rho=(r-math.sqrt(2*r))/(kappa*2)
    s=(1+rho*rho)/(2*rho)
    while True:
      u=self.rndnumexcrange(-1,1)
      v=self.rndu01zerooneexc()
      z=math.cos(math.pi*u)
      w=(1+s*z)/(s+z)
      y=kappa*(s-w)
      if y*(2-y)-v>=0 or math.log(y/v)+1-y>=0:
        if w<-1:
          w=-1
        if w>1:
          w=1
        angle=math.acos(w)
        if u<0:
          angle=-angle
        return mean+angle

  def negativeMultinomial(self, succ, failures):
    """
Negative multinomial distribution.

Models the number of failures of one or more
kinds before a given number of successes happens.
succ: Number of successes.
failures: Contains probabilities for each kind of failure.
The sum of probabilities must be less than 1.
Returns: A list containing a random number
of failures of each kind of failure.
    """
    ret=[0 for _ in failures]
    i=0
    while i<succ:
        r=self.rndu01oneexc()
        p=0
        nosuccess=false
        for j in range(len(failures)):
              if r>=p and r<p+failures[j]:
                     ret[j]+=1
                     nosuccess=true
                     break
              p+=failures[j]
        if not nosuccess: i+=1
    return ret

  def nonzeroIntegersWithSum(self, n, total):
    if n <= 0 or total <=0:
        raise ValueError
    ls = []
    i = 0
    list.insert(ls,0,0)
    while len(ls) < n:
        c = self.rndintexcrange(1, total)
        found = False
        j = 1
        while j < len(ls):
            if ls[j] == c:
                found = True
                break
            j = j + 1
        if found == False:
            list.insert(ls,len(ls),c)
    ls.sort()
    list.insert(ls,len(ls),total)
    return [ls[i]-ls[i-1] for i in range(1,len(ls))]

  def integersWithSum(self, n, total):
    if n <= 0 or total <=0:
        raise ValueError
    return [s-1 for s in self.nonzeroIntegersWithSum(n, total + n)]

  def diceRoll(self, dice, sides = 6, bonus = 0):
    if dice < 0 or sides < 1: raise ValueError
    if dice == 0: return 0
    if sides == 1: return dice
    ret = 0
    if dice > 50:
        # If there are many dice to roll,
        # use a faster approach, noting that
        # the dice-roll distribution approaches
        # a "discrete" normal distribution as the
        # number of dice increases.
        mean = dice * (sides + 1) * 0.5
        sigma = math.sqrt(dice * (sides * sides - 1) / 12)
        ret = -1
        while ret < dice or ret > dice * sides:
            ret = round(self.normal(mean, sigma))
    else:
         i = 0
         while i < dice:
              ret = ret + self.rndintrange(1, sides)
              i = i + 1
    ret = ret + bonus
    if ret < 0: ret = 0
    return ret

  def _ierf(self, x):
    """ Inverse error function. """
    coeffs=[0.3333333333333333, 0.23333333333333333, 0.2015873015873016, 0.19263668430335099, 0.19532547699214364, 0.20593586454697566, 0.2232097574187521, 0.24697023314275485, 0.27765382560322394, 0.3161426235531171, 0.3637175870396921, 0.4220720808430425, 0.49336326556393456, 0.5802938460615139, 0.6862233969476911, 0.815312205552808, 0.9727032088645521, 1.1647499636184413, 1.3993010831666697, 1.6860544545395042]
    cx=x*0.886226925452758 # x/(2.0/sqrt(pi))
    ret=cx
    cxsq=cx*cx
    for c in coeffs:
      cx*=cxsq
      ret+=cx*c
    return ret

  def _icdfnormal(self, x):
    """ Inverse cumulative distribution function of the
       standard normal distribution.  """
    return self._ierf(2*x-1)*math.sqrt(2)

  def powerlognormal(self, p, sigma=1.0):
    """ Power lognormal distribution, as described in NIST/SEMATECH
     e-Handbook of Statistical Methods, http://www.itl.nist.gov/div898/handbook/,
     accessed Jun. 9, 2018, sec. 1.3.6.6.14. """
    return math.exp(self._icdfnormal(1-(1-self.rndu01())**(1.0/p))*sigma)

  def powernormal(self, p):
    """ Power normal distribution, as described in NIST/SEMATECH
     e-Handbook of Statistical Methods, http://www.itl.nist.gov/div898/handbook/,
     accessed Jun. 9, 2018, sec. 1.3.6.6.13. """
    return self._icdfnormal(1-(1-self.rndu01())**(1.0/p))

  def _decompose(self, matrix):
      numrows = len(matrix)
      if len(matrix[0])!=numrows: raise ValueError
      # Does a Cholesky decomposition of a matrix
      # assuming it's positive definite and invertible
      ret=[[0 for j in range(numrows)] for i in range(numrows)]
      s1 = math.sqrt(matrix[0][0])
      if s1==0: return ret # For robustness
      for i in range(0,numrows):
        ret[0][i]=matrix[0][i]*1.0/s1
      for i in range(0,numrows):
        sum=0.0
        for j in range(i): sum = sum + ret[j][i]*ret[j][i]
        sq=matrix[i][i]-sum
        if sq<0: sq=0 # For robustness
        ret[i][i]=math.sqrt(sq)
      for j in range(0,numrows):
        for i in range(j+1,numrows):
          # For robustness
          if ret[j][j]==0: ret[j][i]=0
          if ret[j][j]!=0:
            sum=0
            for k in range(j):sum = sum + ret[k][i]*ret[k][j]
            ret[j][i]=(matrix[j][i]-sum)*1.0/ret[j][j]
      return ret

  def kth_smallest_of_n_u01(self, k, n):
      """ Generates the kth smallest number among n random numbers
         from 0 to 1. """
      if k>n or n<1: raise ValueError
      if n<20:
           nums=[self.randu01() for i in n]
           nums.sort()
           return nums[k-1]
      return self.beta(k, n+1-k)

  def multinormal(self, mu, cov):
      mulen=len(cov)
      if mu != None:
        mulen = len(mu)
        if mulen!=len(cov): raise ValueError
        if mulen!=len(cov[0]): raise ValueError
      cho=self._decompose(cov)
      i=0
      ret=[0 for i in range(mulen)]
      variables=[self.normal(0,1) for i in range(mulen)]
      while i<mulen:
        sum = 0
        if mu != None: sum=mu[i]
        for j in range(mulen): sum=sum+variables[j]*cho[j][i]
        ret[i]=sum
        i=i+1
      return ret

  def upper_bound_copula(self, n = 2):
      x=self.rndu01() # Generate number once
      return [x for i in range(n)]

  def product_copula(self, n = 2):
      return [self.rndu01() for i in range(n)]

  def lower_bound_copula(self):
      x=self.rndu01() # Generate number once
      return [x, 1.0 - x]

  def gaussian_copula(self, cov):
       mvn=self.multinormal(None, cov)
       for i in range(len(cov)):
          # Apply the normal distribution's CDF
          # to get uniform variables
          mvn[i] = (math.erf(mvn[i]/(math.sqrt(2)*math.sqrt(cov[i][i])))+1)*0.5
       return mvn

  def multivariate_t(self, mu, cov, df):
     """ Multivariate t-distribution, mu is the mean (can be None),
           cov is the covariance matrix, and df is the degrees of freedom. """
     mn=self.multinormal(None, cov)
     cd=self.gamma(df*0.5,2.0/df)
     return [(0 if mu==None else mu[i])+mn[i]/math.sqrt(cd) for i in range(len(mn))]

  def _pochhammer(self, a, b):
    return math.gamma(a+b)/math.gamma(a)

  def _beta(self, a, b):
    return math.gamma(a)*math.gamma(b)/math.gamma(a+b)

  def _betainc(self, x, a, b):
    # Incomplete beta function.  NOTES:
    # 1. The SciPy method
    # scipy.stats.betainc(a, b, x) is the same as _betainc(x, a, b).
    # 2. This is also the beta distribution's CDF.
    if x>0.5 and x < 1.0: return 1.0 - self._betainc(1.0 - x, b, a)
    if x==0 and a>0: return 0.0
    if b<50 and math.floor(b)==b:
        if b<0: return 0
        return (x**a)*sum([ \
            self._pochhammer(a,i)*pow(1-x,i)*1.0/math.gamma(i+1) \
            for i in range(int(b))])
    if a>0 and a<50 and math.floor(a)==a:
        return 1.0-((1.0-x)**b)*sum([ \
            self._pochhammer(b,i)*(x**i)*1.0/math.gamma(i+1) \
            for i in range(int(a))])
    ret=pow(10,-100)
    d=0
    c=ret
    i=0
    k=0
    while i < 100:
        # Get next convergent of continued fraction
        if i==0: num=1.0
        else:
          if (i&1)==1: num=-(a+k)*(a+b+k)*x*1.0/((a+i-1)*(a+i))
          else: num=(b-k)*k*x*1.0/((a+i-1)*(a+i))
        c=1+num/c # 1 is the convergent's denominator
        d=1+num*d # ditto
        if d==0: d=pow(10,-100)
        if c==0: c=pow(10,-100)
        d=1.0/d
        delta=d*c
        ret*=delta
        if abs(delta-1.0)<pow(10,-14): break
        i=i+1
        if (i&1)==0: k=k+1
    return ret*(x**a)*((1-x)**b)/(a*self._beta(a,b))

  def _student_t_cdf(self,nu, x):
    if x<=0:
       return self._betainc(nu/(x*x+nu),nu*0.5,0.5)*0.5
    else:
       return (self._betainc((x*x)/(x*x+nu),0.5,nu*0.5)+1)*0.5

  def t_copula(self, cov, df):
    """ Multivariate t-copula. 'cov' is the covariance matrix
       and 'df' is the degrees of freedom.  """
    mt=self.multivariate_t(None, cov, df)
    return [self._student_t_cdf(df, mt[i]) \
        for i in range(len(mt))]

  def simplex_point(self, points):
       ret=[]
       if len(points) > len(points[0])+1: raise ValueError
       if len(points)==1: # Return a copy of the point
         for i in range(0,len(points[0])): ret+=[points[0][i]]
         return ret
       gammas=[]
       # Sample from a Dirichlet distribution
       simplexDims=len(points)-1
       for i in range(0,len(points)): gammas+=[self.exponential()]
       tsum=0
       for i in range(0,len(gammas)): tsum = tsum + gammas[i]
       tot = 0
       for i in range(0,len(gammas) - 1):
           gammas[i] = gammas[i] / tsum
           tot = tot + gammas[i]
       tot = 1.0 - tot
       for i in range(0,len(points[0])): ret+=[points[0][i]*tot]
       for i in range(1,len(points)):
          for j in range(0,len(points[0])):
             ret[j]=ret[j]+points[i][j]*gammas[i-1]
       return ret

  def numbers_from_cdf(self, cdf, mn, mx, n = 1):
      """ Generates one or more random numbers from a probability
         distribution by numerically inverting its cumulative
         distribution function (CDF).  The random number
         will be in the interval [mn, mx].  `n` random numbers will be
         generated. `cdf` is the CDF; it takes one parameter and returns,
         for that parameter, the probability that a random number will
         be less than or equal to that parameter. By default, `n` is 1.  """
      ntable=numericalTable(cdf, mn, mx)
      return [self.from_interp(ntable) for i in range(n)]

  def from_interp(self, table):
     """ Generates a random number given a list of CDF--number
       pairs sorted by CDF.

       An example of this list is as follows.
       ` [[0.1, 0], [0.4, 1], [0.8, 2], [0.9, 3], [0.95, 4], [0.99, 5]]`

       In this example, the first item of each pair is the value of
       a cumulative distribution function (CDF) and is in the interval [0, 1],
       and the second item is the number associated with that CDF's
       value. The random number will fall within the range of numbers
       suggested in the table, which will be in the interval [0, 5] in the
       example above.

       The `numericalTable` method generates an appropriate table
       for this method's `table` parameter, given a CDF and a range
       of numbers.
       """
     while True:
        x=_tableInterpSearch(table, self.rndu01())
        if x!=None: return x

  def randomwalk_u01(self,n):
     """ Random walk of uniform 0-1 random numbers. """
     ret=[0 for i in range(n+1)]
     for i in range(n):
        ret[i]=self.rndu01()
     for i in range(n):
        ret[i+1]=ret[i+1]+ret[i]
     return ret

  def randomwalk_posneg1(self,n):
     """ Random walk of uniform positive and negative steps. """
     ret=[0 for i in range(n+1)]
     for i in range(n):
        ret[i]=self.rndint(1)*2-1
     for i in range(n):
        ret[i+1]=ret[i+1]+ret[i]
     return ret

  def wiener(self, st, en, step=1.0, mu = 0.0, sigma = 1.0):
      """ Generates random numbers following a Wiener
            process (Brownian motion). Each element of the return
            value contains a timestamp and a random number in that order. """
      if st==en: return [[st, self.normal(mu*st,sigma*math.sqrt(st))]]
      ret=[]
      i=st
      lastv=0
      lasttime=st
      while i < en:
         if i==st: lastv=self.normal(mu*st,sigma*math.sqrt(st))
         else: lastv=lastv+self.normal(mu*step,sigma*math.sqrt(step))
         lasttime=i
         ret+=[[i, lastv]]
         i+=step
      lastv=lastv+self.normal(mu*(en-lasttime),sigma*math.sqrt(en-lasttime))
      ret+=[[i, lastv]]
      return ret

class AlmostRandom:
  def __init__(self, randgen, list):
    if len(list)==0:
      raise ValueError
    self.randgen=randgen
    self.list=self.randgen.shuffle([x for x in list])
    self.index=0

  def choose(self):
    if self.index>=len(self.list):
      self.index=0
      self.list=self.randgen.shuffle(self.list)
    item=self.list[self.index]
    self.index+=1
    return item

# Examples of use
if __name__ == "__main__":
    # Generate multiple dice rolls
    randgen=RandomGen()
    dierolls=[randgen.diceRoll(2,6) for i in range(10)]
    # Results
    print("Results: %s" % (dierolls))
    # Highest die roll
    print("Highest: %d" % (max(dierolls)))
    # Lowest die roll
    print("Lowest: %d" % (min(dierolls)))
    # Sum, dropping the lowest
    print("Sum: %d" % (sum(dierolls)))
    # Sum, dropping the lowest
    print("Drop-the-lowest: %d" % (sum(dierolls)-min(dierolls)))
    #
    #  Weighted choice
    #
    ranges=[[0, 5], [5, 10], [10, 11], [11, 13]]
    weights=[3,15,1,2]
    def rc():
        index=randgen.weighted_choice(weights)
        item=ranges[index] # Choose a random range
        return randgen.rndintexcrange(item[0],item[1])
    print("Weighted choice results")
    print([rc() for i in range(25)])
    #
    #  Model times to failure
    #
    rate = 1.0/1000 # Failure rate
    print("Times to failure (rate: %f)" % (rate))
    print([randgen.exponential(rate) for i in range(25)])
    #  Multinormal
    for i in range(10):
       print(randgen.multinormal(None, [[1, 0],[0, 1]]))
    # Random walks
    print(randgen.randomwalk_u01(50))
    print(randgen.randomwalk_posneg1(50))
    # White noise
    print([randgen.normal() for i in range(20)])
    # Demonstrate numerical CDF inversion
    print("Gaussian values by CDF inversion")
    normal_cdf = lambda x: 0.5*(1+math.erf(x/math.sqrt(2)))
    print(randgen.numbers_from_cdf(normal_cdf, -6, 6, n=30))
