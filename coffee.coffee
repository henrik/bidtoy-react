COLORS = [ "_", "powderblue", "chartreuse", "yellow", "pink", "#eee" ]
BID_STEP = 50

window.PubSub =
  subs: {}
  sub: (name, cb) ->
    @subs[name] = @_subsFor(name)
    @subs[name].push(cb)
  pub: (name, e) ->
    @_subsFor(name).forEach((cb) -> cb(e))
  _subsFor: (name) ->
    @subs[name] || []

window.formatNumber = (number) ->
  number.toFixed(0).replace(/\d(?=(\d{3})+$)/g, "$& ")

window.BidRow = React.createClass
  color: ->
    COLORS[@props.bid.buyer]

  reserveClasses: ->
    React.addons.classSet({
      "bid__amount": true,
      "bid__amount--reserve-met": @props.bid.reserve_met
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

window.BidForm = React.createClass
  componentDidMount: ->
    # Trying out using pubsub to sync the two components.
    # Another alternative to look into: an owner component passing its state into owned component props.
    that = this
    PubSub.sub "fetchedBids", (bids) ->
      that.setState leadingAmount: bids[0].amount

  nextAmount: ->
    @state.leadingAmount + BID_STEP

  handleSubmit: (e) ->
    e.preventDefault()
    amountField = @refs.amount.getDOMNode()
    buyerField = @refs.buyer.getDOMNode()
    amount = amountField.value || @nextAmount()
    buyer = buyerField.value

    postData =
      amount: amount
      buyer: buyer

    $.post("/bid.json", postData).success (data) ->
      amountField.value = ""
      PubSub.pub("bidPlaced", data)

  render: ->
    # Don't render until we know the amount.
    return React.DOM.div({}, "Loading…") unless @state

    buyerOpts = [ 1, 2, 3, 4, 5 ].map (n) -> React.DOM.option(key: n, n)

    { div, p, form, select, input, button } = React.DOM

    (div {},
      (p {}, "Leading bid: #{formatNumber @state.leadingAmount} SEK")
      (form onSubmit: @handleSubmit,
        (p {},
          "Bid as buyer #"
          (select ref: "buyer", buyerOpts)
        )
        (p {},
          (input type: "number", ref: "amount", placeholder: formatNumber(@nextAmount()), min: @nextAmount(), step: BID_STEP)
          (button {}, "Place bid")
        )
      )
    )

React.render `<BidForm />`, document.getElementById("bid-form")
