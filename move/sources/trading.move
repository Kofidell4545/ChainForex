module chainforex::trading {
    use sui::object::{Self, ID};
    use sui::clock::Clock;
    use sui::tx_context::{Self, TxContext};
    use std::string;
    
    use chainforex::types::{Self, Position, MarketState};
    use chainforex::price_feed::{Self, PriceFeed};
    use chainforex::position;

    // Error codes
    const E_INVALID_PAIR: u64 = 0;
    const E_MARKET_PAUSED: u64 = 1;
    const E_PRICE_UNAVAILABLE: u64 = 2;

    /// Opens a new trading position
    public entry fun open_position(
        market: &mut MarketState,
        price_feed: &PriceFeed,
        clock: &Clock,
        pair: vector<u8>,
        size: u64,
        leverage: u64,
        is_long: bool,
        ctx: &mut TxContext
    ): ID {
        // Validate trading pair
        let pair_str = string::utf8(pair);
        assert!(market.pair == pair_str, E_INVALID_PAIR);

        // Get current price from feed
        let current_price = price_feed::get_latest_price(price_feed, clock);
        assert!(current_price > 0, E_PRICE_UNAVAILABLE);

        // Update market state
        if (is_long) {
            market.total_long_positions = market.total_long_positions + size;
        } else {
            market.total_short_positions = market.total_short_positions + size;
        };
        market.total_volume_24h = market.total_volume_24h + size;
        market.last_price = current_price;
        market.last_update = tx_context::epoch_timestamp_ms(ctx);

        // Open position
        position::open_position(
            pair_str,
            size,
            leverage,
            current_price,
            is_long,
            ctx
        )
    }

    /// Closes an existing position
    public entry fun close_position(
        market: &mut MarketState,
        price_feed: &PriceFeed,
        clock: &Clock,
        position: Position,
        ctx: &mut TxContext
    ) {
        // Get current price from feed
        let current_price = price_feed::get_latest_price(price_feed, clock);
        assert!(current_price > 0, E_PRICE_UNAVAILABLE);

        // Update market state
        let position_size = types::get_position_size(&position);
        if (types::is_position_long(&position)) {
            market.total_long_positions = market.total_long_positions - position_size;
        } else {
            market.total_short_positions = market.total_short_positions - position_size;
        };
        market.last_price = current_price;
        market.last_update = tx_context::epoch_timestamp_ms(ctx);

        // Close position
        position::close_position(position, current_price, ctx);
    }

    /// Liquidates a position if necessary
    public entry fun liquidate_position(
        market: &mut MarketState,
        price_feed: &PriceFeed,
        clock: &Clock,
        position: Position,
        ctx: &mut TxContext
    ) {
        // Get current price from feed
        let current_price = price_feed::get_latest_price(price_feed, clock);
        assert!(current_price > 0, E_PRICE_UNAVAILABLE);

        // Check if position needs liquidation
        assert!(position::check_liquidation(&position, current_price), 0);

        // Update market state
        let position_size = types::get_position_size(&position);
        if (types::is_position_long(&position)) {
            market.total_long_positions = market.total_long_positions - position_size;
        } else {
            market.total_short_positions = market.total_short_positions - position_size;
        };
        market.last_price = current_price;
        market.last_update = tx_context::epoch_timestamp_ms(ctx);

        // Liquidate position
        position::liquidate_position(position, current_price, ctx);
    }

    /// Creates a new market for a trading pair
    public entry fun create_market(
        pair: vector<u8>,
        ctx: &mut TxContext
    ) {
        let market = types::new_market_state(
            string::utf8(pair),
            ctx
        );
        sui::transfer::share_object(market);
    }

    /// Creates a new price feed for a trading pair
    public entry fun create_price_feed(
        price_identifier: vector<u8>,
        ctx: &mut TxContext
    ) {
        let feed = price_feed::new_price_feed(
            price_identifier,
            ctx
        );
        sui::transfer::share_object(feed);
    }
}
