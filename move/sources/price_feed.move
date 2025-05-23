module chainforex::price_feed {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use std::string::String;
    use sui::transfer;

    friend chainforex::trading;


    /// Represents a price feed for a trading pair
    struct PriceFeed has key {
        id: UID,
        pair: String,
        last_price: u64,
        last_update: u64,
        confidence_interval: u64,
    }

    /// Create a new price feed
    public(friend) fun new_price_feed(
        pair: String,
        ctx: &mut TxContext
    ): PriceFeed {
        PriceFeed {
            id: object::new(ctx),
            pair,
            last_price: 0,
            last_update: 0,
            confidence_interval: 0,
        }
    }

    /// Update price feed with mock data for testing
    public fun update_price(
        feed: &mut PriceFeed,
        price: u64,
        confidence: u64,
        ctx: &TxContext
    ) {
        feed.last_price = price;
        feed.last_update = tx_context::epoch_timestamp_ms(ctx);
        feed.confidence_interval = confidence;
    }

    /// Get the latest price
    public fun get_latest_price(feed: &PriceFeed): u64 {
        feed.last_price
    }

    /// Get the last update timestamp
    public fun get_last_update(feed: &PriceFeed): u64 {
        feed.last_update
    }

    /// Get the confidence interval
    public fun get_confidence_interval(feed: &PriceFeed): u64 {
        feed.confidence_interval
    }

    // Share price feed
    public(friend) fun share_feed(feed: PriceFeed) {
        transfer::share_object(feed);
    }
}
