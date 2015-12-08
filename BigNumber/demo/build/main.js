"use strict";

var OperandSelect = React.createClass({
  displayName: "OperandSelect",

  render: function render() {
    var propItems = [];
    var parent = this.parent;
    for (var i = 0; i < this.props.values.length; i++) {
      propItems.push(this.props.values.charAt(i));
    }
    return React.createElement(
      "select",
      { onChange: this.props.onChange },
      propItems.map(function (item) {
        return React.createElement(
          "option",
          { key: item, value: item },
          item
        );
      })
    );
  }
});

var Operand = React.createClass({
  displayName: "Operand",

  render: function render() {
    return React.createElement("input", { type: "text", onChange: this.props.onChange });
  }
});

var Calculator = React.createClass({
  displayName: "Calculator",

  getInitialState: function getInitialState() {
    return { op1: "", op: "+", op2: "", value: "" };
  },
  calc: function calc() {
    if (this.state.op1.length == 0 || this.state.op2.length == 0) {
      return;
    }
    var ed1 = null,
        ed2 = null;
    try {
      ed1 = ExtendedDecimal.FromString(this.state.op1);
      ed2 = ExtendedDecimal.FromString(this.state.op2);
    } catch (e) {
      this.setState({ "value": "Error" });
      return;
    }
    var result = "";
    if (this.state.op == "+") {
      result = ed1.Add(ed2);
    } else if (this.state.op == "-") {
      result = ed1.Subtract(ed2);
    } else if (this.state.op == "*") {
      result = ed1.Multiply(ed2);
    } else if (this.state.op == "/") {
      result = ed1.Divide(ed2, PrecisionContext.Decimal64);
    }
    this.setState({ "value": result.toString() });
  },
  render: function render() {
    var _this = this;

    return React.createElement(
      "div",
      null,
      React.createElement(Operand, { onChange: function onChange(e) {
          _this.setState({ op1: e.target.value });
        } }),
      " ",
      React.createElement(OperandSelect, {
        values: "+-*/",
        onChange: function onChange(e) {
          _this.setState({ op: e.target.value });
        } }),
      " ",
      React.createElement(Operand, { onChange: function onChange(e) {
          _this.setState({ op2: e.target.value });
        } }),
      " ",
      React.createElement("input", { type: "button", value: "=", onClick: this.calc }),
      " ",
      React.createElement("input", { type: "text", value: this.state.value })
    );
  }
});

ReactDOM.render(React.createElement(Calculator, null), document.getElementById('calc'));
