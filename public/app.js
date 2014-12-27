const COLORS = [ "_", "powderblue", "chartreuse", "yellow", "pink", "#eee" ];

var PubSub = {
  subs: [],
  sub: function(cb) {
    this.subs.push(cb);
  },
  pub: function(e) {
    this.subs.forEach(function(cb) { cb(e) });
  }
};

var BidForm = React.createClass({
  getInitialState: function() {
    return { leadingAmount: 0, fieldValue: 100 };
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var amountField = this.refs.amount.getDOMNode();
    var bidderField = this.refs.bidder.getDOMNode();
    var amount = amountField.value;
    var bidder = bidderField.value;

    $.post("/bid.json", {
      amount: amount,
      buyer: bidder
    }).success(function(data) {
      PubSub.pub(data);
    });
  },
  render: function() {
    return <div>
      <p>Leading bid: {this.state.leadingAmount} SEK</p>
      <form onSubmit={this.handleSubmit}>
        <select ref="bidder">
          <option>1</option>
          <option>2</option>
        </select>
        <input type="number" ref="amount" defaultValue={this.state.fieldValue} />
        <button>Place bid</button>
      </form>
    </div>;
  }
});

var BidRow = React.createClass({
  color: function() {
    return { background: COLORS[this.props.bid.buyer] };
  },

  reserveClasses: function() {
    return React.addons.classSet({
      "bid-amount": true,
      "reserve-met": this.props.bid.reserve_met
    });
  },

  render: function() {
    return <tr>
      <td className="bid-buyer">
        <span style={this.color()}>{this.props.bid.buyer}</span>
      </td>
      <td className="bid-time">{this.props.bid.time}</td>
      <td className={this.reserveClasses()}>{this.props.bid.amount}</td>
    </tr>;
  }
});

var BidTable = React.createClass({
  getInitialState: function() {
    return { bids: [] };
  },

  componentDidMount: function() {
    var that = this;

    $.ajax("/bids.json").success(function(data) {
      that.setState({ bids: data });
    });

    PubSub.sub(function(bid) {
      that.setState({ bids: [ bid ].concat(that.state.bids) });
    });
  },

  render: function() {
    rows = this.state.bids.map(function(bid) {
      return <BidRow key={bid.id} bid={bid} />
    });

    return <div>
      <table className="bids">
        {rows}
      </table>
    </div>;
  }
});

React.render(
  <BidForm />,
  document.getElementById("bid-form")
);

React.render(
  <BidTable />,
  document.getElementById("bid-table")
);
