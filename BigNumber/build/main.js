var OperandSelect = React.createClass({
  displayName: "OperandSelect",

  render: function () {
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

  render: function () {
    return React.createElement("input", { type: "text", onChange: this.props.onChange });
  }
});

var Calculator = React.createClass({
  displayName: "Calculator",

  getInitialState: function () {
    return { op1: "", op: "+", op2: "", value: "" };
  },
  chgOp1: function (e) {
    this.setState({ op1: e.target.value });
  },
  chgOp2: function (e) {
    this.setState({ op2: e.target.value });
  },
  chgOp: function (e) {
    this.setState({ op: e.target.value });
  },
  calc: function () {
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
      result = ed1.Divide(ed2);
    }
    this.setState({ "value": result.toString() });
  },
  render: function () {
    return React.createElement(
      "div",
      null,
      React.createElement(Operand, { onChange: this.chgOp1 }),
      " ",
      React.createElement(OperandSelect, { values: "+-*/", onChange: this.chgOp }),
      " ",
      React.createElement(Operand, { onChange: this.chgOp2 }),
      " ",
      React.createElement("input", { type: "button", value: "=", onClick: this.calc }),
      " ",
      React.createElement("input", { type: "text", value: this.state.value })
    );
  }
});

ReactDOM.render(React.createElement(Calculator, null), document.getElementById('calc'));
