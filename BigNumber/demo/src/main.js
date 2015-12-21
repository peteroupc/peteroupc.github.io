var OperandSelect=React.createClass({
 render:function(){
   return (<select onChange={this.props.onChange}>
   {this.props.values.split(",").map(function(item){
     return <option key={item} value={item}>{item}</option>;
   })}
   </select>);
 }
});

var Operand=React.createClass({
 render:function(){
  return <input type="text" onChange={this.props.onChange}/>;
 }
});

var Calculator=React.createClass({
 getInitialState:function(){
  return {op1:"",op:"+",op2:"",value:""}
 },
 calc:function(){
  if(this.state.op1.length==0 || this.state.op2.length==0){
   return;
  }
  var ed1=null,ed2=null;
  try {
   ed1=ExtendedDecimal.FromString(this.state.op1);
   ed2=ExtendedDecimal.FromString(this.state.op2);
  } catch(e){
   this.setState({"value":"Error"});
   return;
  }
  var result="";
  if(this.state.op=="+"){
   result=ed1.Add(ed2);
  } else if(this.state.op=="-"){
   result=ed1.Subtract(ed2);
  } else if(this.state.op=="*"){
   result=ed1.Multiply(ed2);
  } else if(this.state.op=="/"){
   result=ed1.Divide(ed2, PrecisionContext.Decimal64);
  }
  this.setState({"value":result.toString()});
 },
 render:function(){
   return <div>
    <Operand onChange={e=>{this.setState({op1:e.target.value})}}/>&nbsp;
    <OperandSelect
      values="+,-,*,/"
      onChange={e=>{this.setState({op:e.target.value})}}/>&nbsp;
    <Operand onChange={e=>{this.setState({op2:e.target.value})}}/>&nbsp;
    <input type="button" value="=" onClick={this.calc}/>&nbsp;
    <input type="text" value={this.state.value}/>
   </div>;
 }
});

ReactDOM.render(
  <Calculator/>,
  document.getElementById('calc')
);
