module chainforex::types {
    use sui::object::{Self, ID, UID};
    use sui::tx_context::TxContext;
    use std::string::String;
    
    friend chainforex::trading;
    friend chainforex::position;

    // Constants for position management
    const MAX_LEVERAGE: u64 = 10; // 10x max leverage
    const MIN_POSITION_SIZE: u64 = 100; // Minimum position size in USD
    const MAX_POSITION_SIZE: u64 = 1000000; // Maximum position size in USD

    // Error codes
    const E_INVALID_LEVERAGE: u64 = 0;
    const E_INVALID_POSITION_SIZE: u64 = 1;
    const E_INSUFFICIENT_MARGIN: u64 = 2;

    /// Represents a trading position
    struct Position has key, store {
        id: UID,
        pair: String,           // Trading pair (e.g., "EUR/USD")
        size: u64,             // Position size in USD
        leverage: u64,         // Current leverage (1-10x)
        entry_price: u64,      // Entry price in base currency
        liquidation_price: u64, // Price at which position gets liquidated
        is_long: bool,         // true for long, false for short
        owner: address,        // Position owner's address
        timestamp: u64,        // Position opening timestamp
    }

    /// Represents market state for a trading pair
    struct MarketState has key {
        id: UID,
        pair: String,
        last_price: u64,
        last_update: u64,
        total_long_positions: u64,
        total_short_positions: u64,
        total_volume_24h: u64,
    }

    // Events
    struct PositionOpened has copy, drop {
        position_id: ID,
        pair: String,
        size: u64,
        leverage: u64,
        entry_price: u64,
        is_long: bool,
        owner: address,
        timestamp: u64,
    }

    struct PositionClosed has copy, drop {
        position_id: ID,
        pair: String,
        exit_price: u64,
        pnl: i64,
        timestamp: u64,
    }

    struct PositionLiquidated has copy, drop {
        position_id: ID,
        pair: String,
        liquidation_price: u64,
        timestamp: u64,
    }

    // Constructor for Position
    public(friend) fun new_position(
        pair: String,
        size: u64,
        leverage: u64,
        entry_price: u64,
        is_long: bool,
        owner: address,
        timestamp: u64,
        ctx: &mut TxContext
    ): Position {
        assert!(leverage <= MAX_LEVERAGE, E_INVALID_LEVERAGE);
        assert!(size >= MIN_POSITION_SIZE && size <= MAX_POSITION_SIZE, E_INVALID_POSITION_SIZE);
        
        let liquidation_price = if (is_long) {
            entry_price - ((entry_price * 90) / (leverage * 100))
        } else {
            entry_price + ((entry_price * 90) / (leverage * 100))
        };

        Position {
            id: object::new(ctx),
            pair,
            size,
            leverage,
            entry_price,
            liquidation_price,
            is_long,
            owner,
            timestamp,
        }
    }

    // Constructor for MarketState
    public(friend) fun new_market_state(
        pair: String,
        ctx: &mut TxContext
    ): MarketState {
        MarketState {
            id: object::new(ctx),
            pair,
            last_price: 0,
            last_update: 0,
            total_long_positions: 0,
            total_short_positions: 0,
            total_volume_24h: 0,
        }
    }

    // Accessors
    public fun get_position_size(position: &Position): u64 { position.size }
    public fun get_position_leverage(position: &Position): u64 { position.leverage }
    public fun get_position_entry_price(position: &Position): u64 { position.entry_price }
    public fun get_position_liquidation_price(position: &Position): u64 { position.liquidation_price }
    public fun is_position_long(position: &Position): bool { position.is_long }
    public fun get_position_owner(position: &Position): address { position.owner }
}
