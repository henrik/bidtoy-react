require "sinatra"
require "sinatra/json"
require "slim"
require "json"

Slim::Engine.default_options[:pretty] = true

# Store data globally. Should live as long as the server does.
module Database
  class << self
    attr_accessor :bids
  end

  def self.add_bid(values)
    new_id = bids.map { |b| b[:id] }.max + 1
    all_values = values.merge(reserve_met: true, time: "2014-05-01 12:05", id: new_id)
    bids.unshift(all_values)
  end
end

# Initial value.
Database.bids = [
  { id: 3, amount: 400, buyer: 1, reserve_met: true, time: "2014-05-01 12:02" },
  { id: 2, amount: 350, buyer: 2, reserve_met: false, time: "2014-05-01 12:01" },
  { id: 1, amount: 300, buyer: 1, reserve_met: false, time: "2014-05-01 12:00" },
]

set :views, -> { root }

get "/" do
  slim :index
end

get "/bids.json" do
  json Database.bids
end

post "/bid.json" do
  data = JSON.parse(request.body.read)
  Database.add_bid(amount: data["amount"].to_i, buyer: data["buyer"].to_i)
  json(Database.bids.first)
end
