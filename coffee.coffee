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
}
