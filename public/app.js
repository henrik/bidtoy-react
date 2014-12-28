const TRUNCATE_AT = 3;

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var BidTable = React.createClass({
  componentDidMount: function() {
    this.fetchBids();
    // Run this method on an interval. Poor man's websocket.
    setInterval(this.fetchBids, 2000);

    var that = this;
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

    $.get(this.props.source, function(data) {
      if (!that.isMounted()) return;

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

    var showAllLink = this.state.truncationEnabled && this.state.bids.length > TRUNCATE_AT && (
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
  <BidTable source="/bids.json" />,
  document.getElementById("bid-table")
);
