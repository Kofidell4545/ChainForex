module chainforex::price_feed {
    use sui::object::{Self, UID};
    use sui::clock::{Self, Clock};
    use sui::tx_context::{Self, TxContext};
    use pyth::price::{Self, Price};
    use pyth::price_info::{Self, PriceInfo};
    use pyth::state::{Self, State};
    
    friend chainforex::trading;

    // Error codes
    const E_PRICE_TOO_OLD: u64 = 0;
    const E_INVALID_PRICE: u64 = 1;
    const E_PRICE_CONFIDENCE_TOO_LOW: u64 = 2;

    // Constants
    const MAX_PRICE_AGE_MS: u64 = 60000; // 60 seconds
    const MIN_PRICE_CONFIDENCE: u64 = 95; // 95% confidence required

    /// Stores price feed configuration and latest prices
    struct PriceFeed has key {
        id: UID,
        price_identifier: vector<u8>, // Pyth price feed identifier
        last_price: u64,
        last_update_time: u64,
        confidence_interval: u64,
    }

    /// Create a new price feed for a specific trading pair
    public(friend) fun new_price_feed(
        price_identifier: vector<u8>,
        ctx: &mut TxContext
    ): PriceFeed {
        PriceFeed {
            id: object::new(ctx),
            price_identifier,
            last_price: 0,
            last_update_time: 0,
            confidence_interval: 0,
        }
    }

    /// Update price from Pyth oracle
    public fun update_price(
        feed: &mut PriceFeed,
        pyth_state: &State,
        price_info: &PriceInfo,
        clock: &Clock,
        ctx: &TxContext
    ) {
        // Verify price info matches our feed
        assert!(price::get_price_identifier(price_info) == feed.price_identifier, E_INVALID_PRICE);

        // Get current timestamp
        let current_time = clock::timestamp_ms(clock);
        
        // Get price from Pyth
        let price_struct = price::get_price(price_info);
        let price = price::get_price(&price_struct);
        let confidence = price::get_conf(&price_struct);
        let timestamp = price::get_timestamp(&price_struct);

        // Verify price is fresh
        assert!(current_time - timestamp <= MAX_PRICE_AGE_MS, E_PRICE_TOO_OLD);

        // Verify confidence level
        assert!(confidence >= MIN_PRICE_CONFIDENCE, E_PRICE_CONFIDENCE_TOO_LOW);

        // Update feed
        feed.last_price = (price as u64);
        feed.last_update_time = current_time;
        feed.confidence_interval = confidence;
    }

    /// Get the latest price
    public fun get_latest_price(feed: &PriceFeed, clock: &Clock): u64 {
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time - feed.last_update_time <= MAX_PRICE_AGE_MS, E_PRICE_TOO_OLD);
        feed.last_price
    }

    /// Get the last update time
    public fun get_last_update_time(feed: &PriceFeed): u64 {
        feed.last_update_time
    }

    /// Get the confidence interval
    public fun get_confidence_interval(feed: &PriceFeed): u64 {
        feed.confidence_interval
    }
}
