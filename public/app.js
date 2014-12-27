const COLORS = [ "_", "powderblue", "chartreuse", "yellow", "pink", "#eee" ];
const TRUNCATE_AT = 3;
const BID_STEP = 50;

var PubSub = {
  subs: {},
  sub: function(name, cb) {
    this.subs[name] = this._subsFor(name);
    this.subs[name].push(cb);
  },
  pub: function(name, e) {
    var subs = this._subsFor(name).forEach(function(cb) { cb(e) });
  },
  _subsFor: function(name) {
    return this.subs[name] || [];
  }
};

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var BidForm = React.createClass({
  componentDidMount: function() {
    // Trying out using pubsub to sync the two components.
    // Another alternative to look into: sharing state between owner/owned components, if possible.
    var that = this;
    PubSub.sub("fetchedBids", function(bids) {
      var leadingAmount = bids[0].amount;
      that.setState({ leadingAmount: leadingAmount });
    });
  },

  getInitialState: function() {
    return { leadingAmount: 0 };
  },

  nextAmount: function() {
    return this.state.leadingAmount + BID_STEP;
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var amountField = this.refs.amount.getDOMNode();
    var buyerField = this.refs.buyer.getDOMNode();
    var amount = amountField.value || this.nextAmount();
    var buyer = buyerField.value;

    $.post("/bid.json", {
      amount: amount,
      buyer: buyer
    }).success(function(data) {
      amountField.value = "";
      PubSub.pub("bidPlaced", data);
    });
  },

  render: function() {
    var buyerOpts = [1, 2, 3, 4, 5].map(function(n) { return <option key={n}>{n}</option>; });

    return <div>
      <p>Leading bid: {this.state.leadingAmount} SEK</p>
      <form onSubmit={this.handleSubmit}>
        <p>
          Bid as buyer #
          <select ref="buyer">{buyerOpts}</select>
          &nbsp;
          <input type="number" ref="amount" placeholder={this.nextAmount()} min={this.nextAmount()} step={BID_STEP} />
          &nbsp;
          <button>Place bid</button>
        </p>
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
  componentDidMount: function() {
    var that = this;

    this.fetchBids();
    // Run this method on an interval. Poor man's websocket.
    setInterval(this.fetchBids, 2000);

    PubSub.sub("bidPlaced", function(bid) {
      that.setState({ bids: [ bid ].concat(that.state.bids) });
    });
  },

  getInitialState: function() {
    return {
      truncationEnabled: true,
      bids: []
    };
  },

  fetchBids: function() {
    var that = this;

    $.ajax("/bids.json").success(function(data) {
      that.setState({ bids: data });
      PubSub.pub("fetchedBids", data);
    });
  },

  showAll: function(e) {
    e.preventDefault();
    this.setState({ truncationEnabled: false });
  },

  render: function() {
    var bids = this.state.bids;

    bids = this.state.truncationEnabled ? bids.slice(0, TRUNCATE_AT) : bids;

    var rows = bids.map(function(bid) {
      return <BidRow key={bid.id} bid={bid} />
    });

    var showAllLink = this.state.truncationEnabled && (
      <tr>
        <td className="show-all-bids" colSpan="3">
          <a href="#" onClick={this.showAll}>
            Show all {this.state.bids.length} bids
          </a>
        </td>
      </tr>
    );

    return <div>
      <table className="bids">
        <ReactCSSTransitionGroup transitionName="example" transitionLeave={false} component="tbody">
          {rows}
        </ReactCSSTransitionGroup>
        {showAllLink}
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
