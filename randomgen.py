import math
import random

SIGBITS = 53

class RandomGen:
  def __init__(self,rng=None):
    if rng==None:
      self.rng=random
    else:
      self.rng=rng

  def rndint(self, maxInclusive):
    if maxInclusive < 0:
      raise ValueError("maxInclusive less than 0")
    if maxInclusive==0:
      return 0
    return self.rng.randint(0, maxInclusive + 1)

  def rndintrange(self, minInclusive, maxInclusive):
    # NOTE: Since Python integers are arbitrary-precision,
    # the naive approach will work well here
    return minInclusive + self.rndint(self.maxInclusive - minInclusive)

  def rndbits(self, bits):
    return self.rndint((1 << bits) - 1)

  def rndu_zeroinconeinc(self):
    e=-SIGBITS
    while True:
      if self.rndint(1)==0:
        e-=1
      else:
        break
    sig=self.rndint((1 << (SIGBITS - 1)) - 1)
    if sig==0 and self.rndint(1)==0:
      e+=1
    sig=sig+(1<<(SIGBITS - 1))
    # NOTE: Multiply by 1.0 to coerce to floating-point
    return sig * 1.0 * (2 ** e)

  def rndu(self):
    while True:
      ret=self.rndu_zeroinconeinc()
      if ret != 1.0:
        return ret

  def rndnzu(self):
    while True:
      ret=self.rndu_zeroinconeinc()
      if ret != 1.0 and ret != 0.0:
        return ret

  def rndu_zeroexconeinc(self):
    while True:
      ret=self.rndu_zeroinconeinc()
      if ret != 0.0:
        return ret

  def rndnumrange(self, minInclusive, maxInclusive):
    if minInclusive > maxInclusive:
      raise ValueError
    return minInclusive + (maxInclusive - minInclusive) * \
      self.rndu_zeroinconeinc()

  def rndintexc(self, maxExclusive):
    if maxExclusive <= 0:
      raise ValueError
    return self.rndint(maxExclusive - 1)

  def rndintexcrange(self, minInclusive, maxExclusive):
    if minInclusive >= maxExclusive:
      raise ValueError
    while True:
      ret=self.rndintrange(minInclusive, maxExclusive)
      if ret < maxExclusive:
        return ret

  def rndnumexcrange(self, minInclusive, maxExclusive):
    if minInclusive >= maxExclusive:
      raise ValueError
    return minInclusive + (maxExclusive - minInclusive) * \
      self.rndu()

  def shuffle(self, list):
    if len(list) >= 2:
      i = len(list) - 1
      while i > 0:
        k=self.rndintexc(i+1)
        tmp=list[i]
        list[i]=list[k]
        list[k]=tmp
        i-=1

  def choice(self, list):
    return list[self.rndintexc(len(list))]

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
        if value<=newValue:
          interp=self.rndu()
          retValue=list[i]+(list[i+1]-list[i])*interp
          return retValue
        runningValue=newValue
      i+=1
    return list[len(list)-1]

  def normal(self, mu=0.0, sigma=1.0):
    radius=math.sqrt(-2*math.log(1.0-self.rndu()))*sigma
    angle=2*math.pi*self.rndu()
    n1=mu+radius*math.cos(angle)
    return n1

  def lognormal(self,mu=0.0,sigma=0.0):
    return math.exp(self.normal(mu,sigma))

  def weibull(self, a, b):
    return b*(-math.log(1.0-self.rndu()))**(1.0/a)

  def triangular(self, startpt, midpt, endpt):
    return self.continuous_choice([startpt,midpt,endpt],\
      [0,1,0])

  def beta(self, a, b):
    x=self.gamma(a)
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
      while countval<0:
        countval=self.normal(tp,tp)
      return int(countval+0.5)
    while i < trials:
      if self.rndu() < p:
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
    if mean<0:
      raise ValueError
    if mean==0:
      return 0
    p=1.0
    if mean>9:
      p=-1.0
      while p<0:
        p=self.normal(mean,mean)
      return int(p+0.5)
    pn=math.exp(-mean)
    count=0
    while True:
      count+=1
      p*=self.rndu()
      if p<=pn:
        return count-1

  def gamma(self,mean,b=1.0,c=1.0,d=0.0):
    if mean<=0:
      raise ValueError
    dd=mean
    v=0
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
      u=1.0-self.rndu()
      x2=x*x
      if u<1-(0.0331*x2*x2):
        break
      if math.log(u)<(0.5*x2)+(dd*(1-v+math.log(v))):
        break
    ret=dd*v
    if mean<1:
      ret=ret*math.exp(math.ln(1.0-self.rndu()) / mean)
    return ret**(1.0/c)*b+d

  def negativebinomial(self,successes,p):
    if successes<0:
      raise ValueError
    if successes==0 or p>=1.0:
      return 0
    if p<=0.0:
      return 1.0/0.0
    if successes==1.0:
      return int(math.log(1.0-self.rndu())/ln(1.0-p))
    else:
      return self.poisson(self.gamma(successes)*(1-p)/p)

  def exponential(self,lamda):
    return -math.log(1.0-self.rndu())/lamda

  def pareto(self,minimum,alpha):
    return self.rndnzu()**(-1.0/alpha)*minimum

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
      v=self.rndnzu()
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

rg=RandomGen()
for i in range(10):
  print(rg.negativebinomial(10,0.5))
