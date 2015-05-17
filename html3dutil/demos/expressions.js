var Extras={
"compact":function(arr){
 var fillOffset=0
 var newLength=arr.length
 for(var i=0;i<arr.length;i++){
  if(fillOffset!=i && arr[i]!=null){
   arr[fillOffset]=arr[i]
   fillOffset++
  } else if(arr[i]!=null){
   fillOffset++
  }
 }
 arr.length=fillOffset
},
"includes":function(arr,value){
 for(var i=0;i<arr.length;i++){
  if(arr[i]==value)return true
 }
 return false
}
}
var nextToken = function(tok) {
    var a, x = null, e = null, t = null, token = null;

    x = tok[0];
    if (x.length==(0)) {
      return ["end", null]};
    if (((a = x.match(/^\s*(-?\d+(\.\d*)?)\s*/)))) {
      e = a[0];
      t = a[1];
      token = ["constant", t*1.0];
      tok[0] = x.substr(e.length,x.length);
    } else if (((a = x.match(/^\s*([\+\-\*\/\(\)\^])\s*/)))) {
      e = a[0];
      t = a[1];
      token = "plus";
      if (t=="-") {
        token = "minus"};
      if (t=="*") {
        token = "mul"};
      if (t=="/") {
        token = "div"};
      if (t=="(") {
        token = "lparen"};
      if (t==")") {
        token = "rparen"};
      if (t=="^") {
        token = "pow"};
      token = [token, null];
      tok[0] = x.substr(e.length,x.length);
    } else if (a = x.match(/^\s*(sin|cos|sqrt|tan|acos|asin|atan|ln|abs)\s*/i)) {
      e = a[0];
      t = a[1].toLowerCase();
      token = ["function", t];
      tok[0] = x.substr(e.length,x.length);
    } else if (a = x.match(/^\s*(pi|e)\s*/)) {
      e = a[0];
      t = a[1];
      token = ["knownconstant", t];
      tok[0] = x.substr(e.length,x.length);
    } else if (a = x.match(/^\s*([a-z])/)) {
      e = a[0];
      t = a[1];
      token = ["variable", t];
      tok[0] = x.substr(e.length,x.length);
      } else {
      throw new Error("unexpected token")
    };
    return token;
  };

    var Operator = function(name) {

      this.name = name;
    };

    Operator.prototype.toString = function() {

      return this.name;
    };

    var Expression = function() {

       this.nodes = [];
    };

    Expression.isExpr = function(x) {
      var a, b, c, d;
      return ((a = x !== false && x !== null) ? ((((b = (((c = ((d=false) ? d : x instanceof Operation)) !== false && c !== null) ? c : x instanceof Variable)) !== false && b !== null) ? b : x instanceof Constant)) : a);
    };

    Expression.prototype.simplify = function() {

      return Expression.simplifyNodes(this.nodes);
    };

    Expression.simplifyNodes = function(nodes) {
      var a, b, c, d, e, passes = null, pass__ = null, pass = null, prevNode = null, prevNodeIndex = null, i = null, node = null, nextNode = null, op = null;
      // Eliminate expression nodes
      for(var i=0;i<nodes.length;i++){
       node=nodes[i];
       if(!node)continue;
       if(node instanceof Expression){
        node.simplify();
        while (node instanceof Expression && node.nodes.length==1) {
         nodes[i] = node.nodes[0];
         node = node.nodes[0]
        };
        if(node instanceof Expression){
         throw new Error("unexpected expression");
        }
       }
      }
      passes = [["pow"], ["mul", "div"], ["plus", "minus"]];
      for (var pass__=0;pass__<(passes.length);pass__++){
      var pass=passes[pass__];
      prevNode = null;
      prevNodeIndex = -1;
      i = 0;
      while (i<(nodes.length)) {
      node = nodes[i];
      if (!(c = node)) {
        i = i+(1);
        continue;};
      if (c = (d = node instanceof Operator, d !== false && d !== null ?Extras.includes(pass,node.name) : d)) {
        nextNode = nodes[i+(1)];
        if (!(((c = ((d = Expression.isExpr(prevNode)) !== false && d !== null) ? d : !Expression.isExpr(nextNode))))) {
          throw new Error("expressions expected between operator")};
        op = new Operation((node.name=="minus") ? (("plus")) : (node.name));
        var negative=(node.name=="minus");
        if(prevNode instanceof Expression)throw new Error("prevNode should not be Expression");
        op.nodes.push(prevNode);
        op.nodes.push(negative ? nextNode.negate() : nextNode);
        op.simplify();
        nodes[prevNodeIndex] = op;
        nodes[i] = null;
        nodes[i+(1)] = null;
        prevNode = op;
        i = i-(1);
      } else if (node instanceof Operation) {
        node.simplify();
        prevNodeIndex = i;
        prevNode = node;
      } else {
        prevNode = node;
        prevNodeIndex = i;
      };
      i = i+(1);};
      Extras.compact(nodes);};
    };

    Expression.prototype.toString = function() {

      return "["+this.nodes+"]";
    };

    var Operation = function(operator) {

      this.operator = operator;
      this.nodes = [];
      this.negative = false;
    };

    Operation.prototype.length = function() {

      return this.nodes.length;
    };

    Operation.prototype.get = function(index) {

      return this.nodes[index];
    };

    Operation.prototype.isOperation = function(op) {

      return this.operator==(op);
    };

    Operation.prototype.equals = function(x) {
      var a, b, i__ = null, i = null;

      if (!(a = x instanceof Operation)) {
        return false};
      if (!(a = this.nodes.length==(x.nodes.length))) {
        return false};
      if (!(a = this.negative==(x.negative))) {
        return false};
      if (!(a = this.operator==(x.operator))) {
        return false};
      for (var i=0;i<(this.nodes.length);i++){
      if (!(b = this.nodes[i]==(x.nodes[i]))) {
        return false};};
      return true;
    };

    Operation.prototype.simplify = function() {
      var a, b, c, d, e, f, g, done = null, resimplify = null, origlength = null, constVals = null, constValsIndex = null, i = null, node = null, n__ = null, n = null, realnode = null, cv = null, haveNonconst = null, c = null,
        neg = null;

      Expression.simplifyNodes(this.nodes);
      if (((a = (((b = (((c = this.operator=="plus") !== false && c !== null) ? c : this.operator=="mul")) !== false && b !== null) ? b : this.operator=="div")))) {
        done = false;
        resimplify = false;
        while (!(b = done)) {
        origlength = this.nodes.length;
        done = true;
        constVals = null;
        constValsIndex = -1;
        i = 0;
        while (i<(origlength)) {
        node = this.nodes[i];
        if (((c = (d = this.negative!=(node.negative), d !== false && d !== null ? (!(node instanceof Constant)) : d)))) {
          i = i+(1);
          continue;};
        if (c = (d = node instanceof Operation, d !== false && d !== null ?node.operator==(this.operator) : d)) {
          for (var n__=0;n__<(node.nodes.length);n__++){
          var n=node.nodes[n__];
          realnode = n;
          this.nodes.push(realnode);};
          this.nodes[i] = null;
          done = false;
        } else if (c = (d = (e = node instanceof Operation, e !== false && e !== null ?node.operator=="div" : e), d !== false && d !== null ?this.operator=="mul" : d)) {
          if (((c = (d = (e = (f = ((g = node.nodes.length==(2)) ? (!(node.negative)) : g), f !== false && f !== null ? (!(this.negative)) : f), e !== false && e !== null ? (!(node.nodes[0].constantValue())) : e), d !== false && d !== null ?node.nodes[1].constantValue() : d)))) {
            this.nodes.push(node.nodes[0]);
            this.nodes.push(new Constant((1.0)/(node.nodes[1].constantValue())));
            this.nodes[i] = null;
            done = false;
            } else {
            cv = null;
            haveNonconst = false;
            for (var n__=0;n__<(node.nodes.length);n__++){
            var n=node.nodes[n__];
            if (c !== false && c !== null) {
              if (!(d = cv==(null))) {
                cv = 1};
              cv = cv/(c);
              } else {
              haveNonconst = true
            };};
            if (cv!=null && !haveNonconst) {
              this.nodes.push(new Constant(cv));
              this.nodes[i] = null;
              done = false;};
          }
        } else if (c = (this.operator=="plus")) {
          cv = node.constantValue();
          if (cv==(0)) {
            this.nodes[i] = null;
            done = false;};
        } else if (c = (this.operator=="div")) {
          cv = node.constantValue();
          if (cv==(1)) {
            this.nodes[i] = null;
            done = false;};
        } else if (c = (this.operator=="mul")) {
          cv = node.constantValue();
          if (cv==(1)) {
            this.nodes[i] = null;
            done = false;
          } else if (cv==(0)) {
            this.nodes.length=0;
            this.nodes[0] = new Constant(0);
            return this;
          } else if (((c = (d = ((e = cv==(-1)) ? i==(0) : e), d !== false && d !== null ?this.nodes.length==(2) : d)))) {
            neg = this.nodes[1].negate();
            this.nodes.length=0;
            this.nodes[0] = neg;
            return this;
          } else if (((c = (d = ((e = cv==(-1)) ? i==(1) : e), d !== false && d !== null ?this.nodes.length==(2) : d)))) {
            neg = this.nodes[0].negate();
            this.nodes.length=0;
            this.nodes[0] = neg;
            return this;
          } else if (((c = ((d = cv!=(null)) ? (!(constVals==(null))) : d)))) {
            constVals = constVals*(cv);
            this.nodes[constValsIndex] = new Constant(constVals);
            this.nodes[i] = null;
            done = false;
          } else if (!(c = cv==(null))) {
            constVals = cv;
            constValsIndex = i;};};
        if (!(c = done)) {
          resimplify = true};
        i = i+(1);};
        Extras.compact(this.nodes);
        if (this.nodes.length==(0)) {
          if (b = (this.operator=="plus")) {
            this.nodes[0] = new Constant(0)
            } else {
            this.nodes[0] = new Constant(1)
          }};};};
      return this;
    };

    Operation.prototype.degen = function() {
      var a, b, c, cv = null;
      this.simplify();
      if (((a = (((b = (((c = this.operator=="plus") !== false && c !== null) ? c : this.operator=="mul")) !== false && b !== null) ? b : this.operator=="div")))) {
        if (this.nodes.length==(1) && !this.negative) {
          return this.nodes[0].degen()}};
      cv = this.constantValue();
      if (!(a = cv==(null))) {
        return new Constant(cv)};
      return this;
    };

    Operation.prototype.constantValue = function() {
      var a, b, c, val = null, node__ = null, node = null, cv = null;

      if (((a = (((b = (((c = this.operator=="plus") !== false && c !== null) ? c : this.operator=="mul")) !== false && b !== null) ? b : this.operator=="div")))) {
        val = null;
        for (var node__=0;node__<(this.nodes.length);node__++){
        var node=this.nodes[node__];
        cv = node.constantValue();
        if (cv==(null)) {
          return null};
        if (val==(null)) {
          val = cv
          } else {
          if (this.operator=="plus") {
            val = val+(cv)};
          if (this.operator=="mul") {
            val = val*(cv)};
          if (((b = ((c = cv==(0)) ? this.operator=="mul" : c)))) {
            return 0};
          if (this.operator=="div") {
            val = val/(cv)};
        };};
        return (this.negative) ? -val : val;
        } else {
        return null
      };
    };

    Operation.func = function(operation, args) {
      var a, op = null, arg__ = null, arg = null;
      op = new Operation(operation);
      for (var arg=1;arg<arguments.length;arg++){
       op.nodes.push(arguments[arg]);
      };
      return op.degen();
    };

    Operation.prototype.combineOp = function(operation, x) {
      var a, op = null;

      if (a = x instanceof Number) {
        x = new Constant(x)};
      op = new Operation(operation);
      op.nodes.push(this);
      op.nodes.push(x);
      return op.degen();
    };

    Operation.prototype.negate = function() {
      var a, b, op = null, node__ = null, node = null;

      op = new Operation(this.operator);
      op.negative=!this.negative;
      for (var node__=0;node__<(this.nodes.length);node__++){
      op.nodes.push(this.nodes[node__]);};
      return op.degen();
    };

    Operation.prototype.subtract = function(x) {
      var a;

      return this.add((a = x instanceof Number) ? (-x) : (x.negate()));
    };

    Operation.prototype.add = function(x) {

      return this.combineOp("plus", x);
    };

    Operation.prototype.multiply = function(x) {
      var a;

      if (a = (this.equals(x))) {
        return Operation.func("pow", x, 2)};
      return this.combineOp("mul", x);
    };

    Operation.prototype.divide = function(x) {

      return this.combineOp("div", x);
    };

    Operation.prototype.toJSString = function() {
      var a, b, c, d, opArray = null, i__ = null, i = null, paren = null, ret = null, op = null;

      opArray = [];
      for (var i__=0;i__<(this.nodes.length);i__++){
      var i=this.nodes[i__];
      if(i instanceof Variable){
       if(i.name!="u" && i.name!="v"){
        throw new Error("invalid variable "+i.name);
       }
      }
      paren = (b = i instanceof Operation, b !== false && b !== null ?((((c = (((d = i.operator=="plus") !== false && d !== null) ?
       d : i.operator=="mul"))
        !== false && c !== null) ? c : i.operator=="div")) : b);
      opArray.push((paren !== false && paren !== null) ? ("("+(i.toJSString())+(")")) : (i.toJSString()));};

      if (this.operator=="plus") {
        ret = "";
        if (this.negative) { ret = ret+("-(")};
        for (var i=0;i<(opArray.length);i++){
        op = opArray[i];
        if (i>(0)) {
          ret = ret+(" + ")};
        ret = ret+op.toString();};
        if (this.negative) { ret = ret+(")")};
        return ret;
      } else if (this.operator=="mul") {
        return ((a = this.negative) ? ("-") : (""))+(opArray.join("*"))
      } else if (this.operator=="div") {
        return ((a = this.negative) ? ("-") : (""))+(opArray.join("/"))
      } else if (this.operator=="pow") {
        var p1=opArray[0];
        var p2=opArray[1];
        return ((a = this.negative) ? ("-") : (""))+"(Math.sign("+p1+")*Math.pow(Math.abs("+p1+"),"+p2+"))"
      } else {
        var oper=this.operator
        if(oper=="ln")oper="log"
        return ret = ((a = this.negative) ? ("-") : (""))+("Math." + oper + "(")+(opArray.join(", "))+(")")
      };
    };

    Operation.prototype.toString = function() {
      var a, b, c, d, opArray = null, i__ = null, i = null, paren = null, ret = null, op = null;

      opArray = [];
      for (var i__=0;i__<(this.nodes.length);i__++){
      var i=this.nodes[i__];
      paren = (b = i instanceof Operation, b !== false && b !== null ?((((c = (((d = i.operator=="plus") !== false && d !== null) ? d : i.operator=="mul"))
        !== false && c !== null) ? c : i.operator=="div")) : b);
      opArray.push((paren !== false && paren !== null) ? ("("+(i.toString())+(")")) : (i.toString()));};

      if (this.operator=="plus") {
        ret = "";
        if (this.negative) { ret = ret+("-(")};
        for (var i=0;i<(opArray.length);i++){
        op = opArray[i];
        if (i>(0)) {
          ret = ret+(" + ")};
        ret = ret+op.toString();};
        if (this.negative) { ret = ret+(")")};
        return ret;
      } else if (this.operator=="mul") {
        return ((a = this.negative) ? ("-") : (""))+(opArray.join("*"))
      } else if (this.operator=="div") {
        return ((a = this.negative) ? ("-") : (""))+(opArray.join("/"))
      } else if (this.operator=="pow") {
        return ((a = this.negative) ? ("-") : (""))+(opArray.join("^"))
        } else {
        return ret = ((a = this.negative) ? ("-") : (""))+("" + (this.operator) + "(")+(opArray.join(", "))+(")")
      };
    };

    var Variable = function(name) {
      this.name = name;
      this.negative = false;
    };

    Variable.prototype.isOperation = function(op) {

      return false;
    };

    Variable.prototype.constantValue = function() {

      return null;
    };

    Variable.prototype.equals = function(x) {
      var a;

      if (!(a = x instanceof Variable)) {
        return false};
      if (!(this.negative==(x.negative))) {
        return false};
      return this.name==(x.name);
    };

    Variable.prototype.toJSString = function() {
      return this.toString();
    }

    Variable.prototype.toString = function() {
      var a;
      return ((a = this.negative) ? ("-") : (""))+(this.name);
    };

    Variable.prototype.combineOp = function(operation, x) {
      var a, op = null, cv = null;

      if (a = x instanceof Number) {
        x = new Constant(x)};
      op = new Operation(operation);
      if (operation=="mul") {
        op.nodes.push(x);
        op.nodes.push(this);
      } else if (operation=="pow") {
        cv = x.constantValue();
        if (cv==(1)) {
          return this};
        op.nodes.push(this);
        op.nodes.push(x);
        } else {
        op.nodes.push(this);
        op.nodes.push(x);
      };
      return op.degen();
    };

    Variable.prototype.degen = function() {

      return this;
    };

    Variable.prototype.add = function(x) {

      return this.combineOp("plus", x);
    };

    Variable.prototype.negate = function() {
      var a, b, v = null;

      v = new Variable(this.name);
      v.negative=!this.negative;
      return v;
    };

    Variable.prototype.subtract = function(x) {
      var a;

      return this.add((a = x instanceof Number) ? (-x) : (x.negate()));
    };

    Variable.prototype.multiply = function(x) {

      return this.combineOp("mul", x);
    };

    Variable.prototype.divide = function(x) {

      return this.combineOp("div", x);
    };

    var Constant = function(value, name) {

      if (name == null) {
        name = null
      }
      this.negative=(value<0);
      if (name=="pi") {
        this.name = name;
        return this.value = (Math.PI);
      } else if (name=="e") {
        this.name = name;
        return this.value = (Math.E);
      } else {
        this.name = null;
        return this.value = value;
      };
    };

    Constant.prototype.isOperation = function(op) {

      return false;
    };

    Constant.prototype.equals = function(x) {
      var a;

      if (!(a = x instanceof Constant)) {
        return false};
      return this.value==(x.value);
    };

    Constant.prototype.constantValue = function() {

      return this.value;
    };

    Constant.prototype.degen = function() {

      return this;
    };

    Constant.prototype.toJSString = function() {
      var vi = this.value.toString();
      if (vi.substr(vi.length-(2),vi.length)==".0") {
        vi = vi.substr(0,vi.length-(2))};
      return vi;
    }

    Constant.prototype.toString = function() {
      var a, vi = null;
      if (a = this.name) {
        return this.name.toString()};
      vi = this.value.toString();
      if (vi.substr(vi.length-(2),vi.length)==".0") {
        vi = vi.substr(0,vi.length-(2))};
      return vi;
    };

    Constant.prototype.combineOp = function(operation, x) {
      var a, op = null;

      if (a = x instanceof Number) {
        x = new Constant(x)};
      op = new Operation(operation);
      op.nodes.push(this);
      op.nodes.push(x);
      if (!(a = op.constantValue()==(null))) {
        return new Constant(op.constantValue())};
      return op.degen();
    };

    Constant.prototype.negate = function() {

      return new Constant(-this.value);
    };

    Constant.prototype.add = function(x) {
      var a;

      if (a = x instanceof Number) {
        return new Constant(x+(this.constantValue()))};
      return this.combineOp("plus", x);
    };

    Constant.prototype.subtract = function(x) {
      var a;

      return this.add((a = x instanceof Number) ? (-x) : (x.negate()));
    };

    Constant.prototype.multiply = function(x) {
      var a;

      if (a = x instanceof Number) {
        return new Constant(x*(this.constantValue()))};
      return this.combineOp("mul", x);
    };

    Constant.prototype.divide = function(x) {
      var a;

      if (a = x instanceof Number) {
        return new Constant(x/(this.constantValue()))};
      return this.combineOp("div", x);
    };

  var getExpression = function(expr) {
    var a, b, c, d, e, test = null, tokens = null, token = null, expressions = null, i = null, lastexpr = null, prevexpr = null, expression = null, ret = null;

    test = [expr];
    tokens = [];
    while (!(b = (token = nextToken(test))[0]=="end")) {
    tokens.push(token)};
    expressions = [new Expression()];
    i = 0;
    while (i<(tokens.length)) {
    token = tokens[i];
    if (expressions.length==(0)) {
      throw new Error("unbalanced")};
    lastexpr = expressions[expressions.length-(1)];
    if (token[0]=="lparen") {
      prevexpr = (b = (lastexpr.nodes.length==(0))) ? (null) : (lastexpr.nodes[lastexpr.nodes.length-(1)]);
      if (((b = ((c = prevexpr !== false && prevexpr !== null) ? ((((d = (((e = prevexpr instanceof Constant) !== false && e !== null) ? e : prevexpr instanceof Variable)) !== false && d !== null) ? d : prevexpr instanceof Expression)) : c)))) {
        lastexpr.nodes.push(new Operator("mul"))};
      expressions.push(new Expression());
    } else if (token[0]=="rparen") {
      expressions.pop();
      if (expressions.length==(0)) {
        throw new Error("unbalanced")};
      expressions[expressions.length-(1)].nodes.push(lastexpr);
    } else if (token[0]=="function") {
      if (!(((b = (((c = i+(1)>=(tokens.length)) !== false && c !== null) ? c : tokens[i+(1)][0]=="lparen"))))) {
        throw new Error("left paren expected")};
      i = i+(1);
      expressions.push(new Operation(token[1]));
    } else if (token[0]=="constant") {
      if (token[1]<(0)) {
        prevexpr = (b = (lastexpr.nodes.length==(0))) ? (null) : (lastexpr.nodes[lastexpr.nodes.length-(1)]);
        if (((b = ((c = prevexpr !== false && prevexpr !== null) ? !((d = prevexpr instanceof Operator, d !== false && d !== null ?prevexpr.name=="pow" : d)) : c)))) {
          lastexpr.nodes.push(new Operator("plus"))};
        lastexpr.nodes.push(new Constant(token[1]));
        } else {
        lastexpr.nodes.push(new Constant(token[1]))
      }
    } else if (token[0]=="variable") {
      prevexpr = (b = (lastexpr.nodes.length==(0))) ? (null) : (lastexpr.nodes[lastexpr.nodes.length-(1)]);
      if (((b = ((c = prevexpr !== false && prevexpr !== null) ? ((((d = (((e = prevexpr instanceof Constant) !== false && e !== null) ? e : prevexpr instanceof Variable)) !== false && d !== null) ? d : prevexpr instanceof Expression)) : c)))) {
        lastexpr.nodes.push(new Operator("mul"))};
      lastexpr.nodes.push(new Variable(token[1]));
    } else if (token[0]=="knownconstant") {
      prevexpr = (b = (lastexpr.nodes.length==(0))) ? (null) : (lastexpr.nodes[lastexpr.nodes.length-(1)]);
      if (((b = ((c = prevexpr !== false && prevexpr !== null) ? ((((d = (((e = prevexpr instanceof Constant) !== false && e !== null) ? e : prevexpr instanceof Variable)) !== false && d !== null) ? d : prevexpr instanceof Expression)) : c)))) {
        lastexpr.nodes.push(new Operator("mul"))};
      lastexpr.nodes.push(new Constant(null, token[1]));
      } else {
      if(token[0]=="minus" && lastexpr.nodes.length==0){
       lastexpr.nodes.push(new Constant(0));
      }
      lastexpr.nodes.push(new Operator(token[0]))
    };
    i = i+(1);};
    if (!(a = expressions.length==(1))) {
      throw new Error("unbalanced")};
    expression = expressions[0];
    expression.simplify();
    ret = expression.nodes[0];
    return ret.degen();
  };
  var getSingleVariable = function(op, variable) {
    var a, b, i__ = null, i = null, node = null;

    for (var i=0;i<op.length();i++){
    node = op.get(i);
    if (b = node instanceof Operation) {
      if (!(b = this.getSingleVariable(node, variable))) {
        return false}
    } else if (b = node instanceof Variable) {
      if (variable.length==(1)) {
        return false};
      variable.push(node);};};
    return true;
  };

    var product = function(expr, start, count) {
      var a, ret = null, i__ = null, i = null;
      if (count==(1)) {
        return expr.get(start)};
      ret = new Constant(1);
      for (var i=0;i<(count);i++){
      ret = ret.multiply(expr.get(start+(i)));};
      return ret;
    };
    var quotient = function(expr, start, count) {
    var a, ret = null, i__ = null, i = null;

    if (count==(1)) {
      return expr.get(start)};
    ret = new Constant(1);
    for (var i=0;i<(count);i++){
    ret = ret.divide(expr.get(start+(i)));};
    return ret;
  };
  var findDerivative = function(expr) {
    var a, deriv1 = null, deriv2 = null, cutoff = null, e0 = null, e1 = null, sq = null, ops = null, i__ = null, i = null;

    if (!(a = expr.constantValue()==(null))) {
      return new Constant(0)
    } else if (a = expr.isOperation("pow")) {
      return expr.get(1).multiply(expr.get(0).combineOp("pow",
        expr.get(1).subtract(1))).multiply(findDerivative(expr.get(0)))
    } else if (a = expr instanceof Variable) {
      return new Constant((a = expr.negative) ? (-1) : (1))
    } else if (a = expr.isOperation("mul")) {
      if (expr.length()==(1)) {
        return findDerivative(expr.get(0))
      } else if (expr.length()==(2)) {
        deriv1 = findDerivative(expr.get(0)).multiply(expr.get(1));
        deriv2 = findDerivative(expr.get(1)).multiply(expr.get(0));
        return deriv1.add(deriv2);
        } else {
        cutoff = expr.length()/2|0;
        e0 = product(expr, 0, cutoff);
        e1 = product(expr, cutoff, expr.length()-(cutoff));
        deriv1 = findDerivative(e0).multiply(e1);
        deriv2 = findDerivative(e1).multiply(e0);
        return deriv1.add(deriv2);
      }
    } else if (a = expr.isOperation("div")) {
      if (expr.length()==(1)) {
        return findDerivative(expr.get(0))
        } else {
        e0 = expr.get(0);
        e1 = expr.get(1);
        if (expr.length()>(2)) {
          cutoff = expr.length()/2|0;
          e0 = quotient(expr, 0, cutoff);
          e1 = quotient(expr, cutoff, expr.length()-(cutoff))
        }
        deriv1 = findDerivative(e0).multiply(e1);
        deriv2 = findDerivative(e1).multiply(e0);
        sq = e1.multiply(e1);
        return deriv1.subtract(deriv2).divide(sq);
      }
    } else if (a = expr.isOperation("plus")) {
      ops = new Constant(0);
      for (var i=0;i<(expr.length());i++){
      ops = ops.add(findDerivative(expr.get(i)));};
      return ops;
    } else if (a = expr.isOperation("sin")) {
      return Operation.func("cos", expr.get(0)).multiply(findDerivative(expr.get(0)))
    } else if (a = expr.isOperation("cos")) {
      return Operation.func("sin", expr.get(0)).negate().multiply(findDerivative(expr.get(0)))
    } else if (a = expr.isOperation("tan")) {
      return findDerivative(Operation.func("sin", expr.get(0)).divide(Operation.func("cos", expr.get(0))))
    } else {
      throw new Error("unsupported function")
    };
    return expr;
  };
