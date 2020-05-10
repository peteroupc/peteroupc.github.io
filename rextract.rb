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
def newtree()
  return [PHI, nil, nil]
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
