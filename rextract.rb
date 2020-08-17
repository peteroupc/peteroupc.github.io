=begin
Implements a streaming algorithm that extracts
uniform random bits from a biased-coin source, as found in:

Zhou, H. and Bruck, J., 2012. Streaming algorithms for optimal generation of random bits. arXiv preprint arXiv:1209.0730.

Because this algorithm is stateful, it is best implemented on biased-coin sources whose bias does not change significantly over time.

Written by Peter O. Any copyright is released to the Public Domain under Creative Commons CC0.

=end

TAILS = 0
HEADS = 1
PHI = 2
ZERO = 3
ONE = 4
# Maximum tree depth; tunable. If this is
# 0, this extractor becomes the von Neumann extractor.
MAXDEPTH = 15

# Creates a new randomness extractor tree.
# There should be an extractor tree for each source
# with a given bias.  For example, if one source outputs
# random 6-sided die results, another source outputs
# random sums of rolling 2 six-sided dice, and a third
# source outputs coin flips with a bias of 0.75, there
# should be three extractor trees.  At least if those three
# sources are independent, the extracted bit sequences will be
# independent and unbiased, so that those sequences
# can then be concatenated to each other without
# introducing bias (Zhou and Bruck, "A Universal Scheme
# for Transforming Binary Algorithms to Generate Random
# Bits from Loaded Dice", arXiv:1209.0726 [cs.IT], 2012).
def newtree()
  return [PHI, nil, nil]
end

# Passes a face (in [0, numFaces)) that was randomly
# generated to the extractor tree.
# If numFaces is a power of 2, the face's bits are
# sent to the extractor directly.  Otherwise, the face
# is passed using
# the "entropy-preserving binarization" in S. Pae,
# "Binarization Trees and Random Number Generation",
# arXiv:1602.06058v2 [cs.DS].  Note that this is not
# efficient if 'numFaces' is a large number.
def extractFace(tree, randomFace, numFaces, output)
  raise if numFaces<2
  if numFaces==2
    extract(tree, randomFace, output)
    return
  end
  if (numFaces-1).bit_length() < numFaces.bit_length()
    # Power of 2
    bits=(numFaces-1).bit_length()
    for b in 0...bits
      extract(tree, randomFace&1, output)
      randomFace>>=1
    end
    return
  end
  if randomFace>0
    extract(tree, 1, output)
  end
  if randomFace<numFaces-1
    for b in 0...((numFaces-1)-randomFace)
      extract(tree, 0, output)
    end
  end
end

# Passes two i.i.d. random numbers to the extractor as follows: Passes
# 0 if the first is less than the second, nothing if they are equal, 1 otherwise.
# Reference: Algorithm 1 in Morina, G., Łatuszyński, K., et al., "From the
# Bernoulli Factory to a Dice Enterprise via Perfect
# Sampling of Markov Chains", arXiv:1912.09229v1 [math.PR], 2019.
def extractFaces(tree, face1, face2, output)
  if face1<face2
    extract(tree, 0, output)
  elsif face1>face2
    extract(tree, 1, output)
  end
end

# Alternative method for passing
# a face (in [0, numFaces)) that was randomly
# generated to the extractor tree.
def extractFace2(tree, randomFace, numFaces, output)
  raise if numFaces<2
  if numFaces==2
    extract(tree, randomFace, output)
    return
  end
  # Add bit_length+1 bits, up to the bit
  # length of numFaces
  bits=randomFace.bit_length()+1
  if bits>numFaces.bit_length()
    bits=numFaces.bit_length()
  end
  for b in 0...bits
    extract(tree, randomFace&1, output)
    randomFace>>=1
  end
end

# Uses the given extractor tree to
# extract randomness from the given bit (0 or 1)
# and write output bits to the given array.
# The bit is assumed to come from a biased-coin
# source. Depth is an internal parameter.
def extract(tree, bit, output, depth=0)
  node=tree
  if node[0]==PHI
    node[0]=bit
  elsif node[0]==ZERO
    output.push(0)
    node[0]=bit
  elsif node[0]==ONE
    output.push(1)
    node[0]=bit
  else
     if (!node[1] || !node[2]) && depth < MAXDEPTH
      node[1]=[PHI,nil,nil]
      node[2]=[PHI,nil,nil]
     end
     x=node[0]
     if x==HEADS && bit==HEADS
       node[0]=PHI
       extract(node[1], TAILS, output, depth+1) if node[1]
       extract(node[2], HEADS, output, depth+1) if node[2]
     elsif x==TAILS && bit==TAILS
       node[0]=PHI
       extract(node[1], TAILS, output, depth+1) if node[1]
       extract(node[2], TAILS, output, depth+1) if node[2]
     elsif x==TAILS && bit==HEADS
       node[0]=ZERO
       extract(node[1], HEADS, output, depth+1) if node[1]
     elsif x==HEADS && bit==TAILS
       node[0]=ONE
       extract(node[1], HEADS, output, depth+1) if node[1]
     end
  end
end

# Produces an extractor tree in string form for
# debugging purposes.
def dbgtree(tree)
 label=["TAILS","HEADS","PHI","ZERO","ONE"][tree[0]]
 if !tree[1]
   return label
 end
 return "["+label+","+dbgtree(tree[1])+","+dbgtree(tree[2])+"]"
end

# Reads all bits from 'bits' (leaving out the last if there is an
# odd number of bits), and stores the extracted bits in 'output'.
# Reference: Peres, Y., "Iterating von Neumann's procedure for
# extracting random bits", The Annals of Statistics 1992,20,1,
# pp.590-597.
def peres(bits,output)
  u=[]
  v=[]
  len=bits.length-bits.length%2
  return if len==0
  i=0; while i<len
    if bits[i]==0 and bits[i+1]==0
      u.push(0)
      v.push(0)
    elsif bits[i]==0 and bits[i+1]==1
      output.push(0)
      u.push(1)
    elsif bits[i]==1 and bits[i+1]==0
      output.push(1)
      u.push(1)
    elsif bits[i]==1 and bits[i+1]==1
      u.push(0)
      v.push(1)
    end
    i+=2
  end
  # Recursion on "discarded" bits
  peres(u, output)
  peres(v, output)
end

# Example
output=[]
tree=newtree()
for i in 0...200000
  bit=rand(10)==0 ? 1 : 0
  extract(tree,bit,output)
end
a=output.map{|x| x==0 ? 1 : nil}.compact.length
b=output.map{|x| x==1 ? 1 : nil}.compact.length
p [a,b]

output=[]
tree=newtree()
for i in 0...200000
  extractFaces(tree,rand(6)+rand(6),rand(6)+rand(6),output)
end
a=output.map{|x| x==0 ? 1 : nil}.compact.length
b=output.map{|x| x==1 ? 1 : nil}.compact.length
p [a,b]
