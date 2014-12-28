window.PubSub =
  subs: {}
  sub: (name, cb) ->
    this.subs[name] = this._subsFor(name)
    this.subs[name].push(cb)
  pub: (name, e) ->
    this._subsFor(name).forEach((cb) -> cb(e))
  _subsFor: (name) ->
    this.subs[name] || []

window.formatNumber = (number) ->
  number.toFixed(0).replace(/\d(?=(\d{3})+$)/g, "$& ")

window.BidRow = React.createClass
  color: ->
    COLORS[this.props.bid.buyer]

  reserveClasses: ->
    React.addons.classSet({
      "bid__amount": true,
      "bid__amount--reserve-met": this.props.bid.reserve_met
    })

  render: ->
    { tr, td, span } = React.DOM
    (tr {},
      (td {},
        (span className: "bid__bidder", style: { background: @color() }, @props.bid.buyer)
      )
      (td {}, @props.bid.time)
      (td className: @reserveClasses(), formatNumber(@props.bid.amount))
    )
