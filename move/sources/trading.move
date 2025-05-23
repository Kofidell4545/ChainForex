module chainforex::trading {
    use sui::tx_context::{Self, TxContext};
    use std::string::String;

    use chainforex::types::{Self, Position, MarketState};
    use chainforex::position;
    use chainforex::price_feed::{Self, PriceFeed};

    // Error codes
    const E_INVALID_PRICE: u64 = 1;

    /// Initialize market and price feed
    public entry fun initialize(
        pair: String,
        ctx: &mut TxContext
    ) {
        // Create market state
        let market = types::new_market_state(
            pair,
            ctx
        );

        // Create price feed
        let feed = price_feed::new_price_feed(
            pair,
            ctx
        );

        // Share objects
        types::share_market(market);
        price_feed::share_feed(feed);
    }

    /// Open a new position
    public entry fun open_position(
        market: &mut MarketState,
        feed: &PriceFeed,
        size: u64,
        leverage: u64,
        is_long: bool,
        ctx: &mut TxContext
    ) {
        // Get current price
        let entry_price = price_feed::get_latest_price(feed);

        // Open position
        let position = position::open_position(
            types::get_market_pair(market),
            size,
            leverage,
            entry_price,
            is_long,
            tx_context::sender(ctx),
            tx_context::epoch_timestamp_ms(ctx),
            ctx
        );

        // Update market state
        if (is_long) {
            types::increment_long_positions(market);
        } else {
            types::increment_short_positions(market);
        };
        types::add_volume(market, size);

        // Transfer position to sender
        types::transfer_position(position, tx_context::sender(ctx));
    }

    /// Close a position
    public entry fun close_position(
        market: &mut MarketState,
        feed: &PriceFeed,
        position: Position,
        ctx: &mut TxContext
    ) {
        let is_long = types::is_position_long(&position);
        
        // Get current price
        let exit_price = price_feed::get_latest_price(feed);

        // Close position
        position::close_position(
            position,
            exit_price,
            ctx
        );

        // Update market state
        if (is_long) {
            types::decrement_long_positions(market);
        } else {
            types::decrement_short_positions(market);
        };
    }

    /// Liquidate a position
    public entry fun liquidate_position(
        market: &mut MarketState,
        feed: &PriceFeed,
        position: Position,
        ctx: &mut TxContext
    ) {
        let is_long = types::is_position_long(&position);
        
        // Get current price
        let current_price = price_feed::get_latest_price(feed);

        // Check if position can be liquidated
        assert!(position::needs_liquidation(&position, current_price), E_INVALID_PRICE);

        // Liquidate position
        position::liquidate_position(
            position,
            ctx
        );

        // Update market state
        if (is_long) {
            types::decrement_long_positions(market);
        } else {
            types::decrement_short_positions(market);
        };
    }
}
