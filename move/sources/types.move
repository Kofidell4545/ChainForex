module chainforex::types {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use std::string::String;
    use sui::transfer;

    friend chainforex::trading;
    friend chainforex::position;

    /// Represents a trading position
    struct Position has key, store {
        id: UID,
        pair: String,
        size: u64,
        leverage: u64,
        entry_price: u64,
        liquidation_price: u64,
        is_long: bool,
        owner: address,
        timestamp: u64,
    }

    /// Represents the state of a trading market
    struct MarketState has key {
        id: UID,
        pair: String,
        total_long_positions: u64,
        total_short_positions: u64,
        total_volume_24h: u64,
    }

    // Position accessors
    public fun get_position_id(position: &Position): &UID {
        &position.id
    }

    public fun get_position_pair(position: &Position): String {
        position.pair
    }

    public fun get_position_size(position: &Position): u64 {
        position.size
    }

    public fun get_position_leverage(position: &Position): u64 {
        position.leverage
    }

    public fun get_position_entry_price(position: &Position): u64 {
        position.entry_price
    }

    public fun get_position_liquidation_price(position: &Position): u64 {
        position.liquidation_price
    }

    public fun is_position_long(position: &Position): bool {
        position.is_long
    }

    public fun get_position_owner(position: &Position): address {
        position.owner
    }

    public fun get_position_timestamp(position: &Position): u64 {
        position.timestamp
    }

    // Market state accessors
    public fun get_market_pair(market: &MarketState): String {
        market.pair
    }

    public fun get_long_positions(market: &MarketState): u64 {
        market.total_long_positions
    }

    public fun get_short_positions(market: &MarketState): u64 {
        market.total_short_positions
    }

    public fun get_total_volume(market: &MarketState): u64 {
        market.total_volume_24h
    }

    // Market state mutators
    public(friend) fun increment_long_positions(market: &mut MarketState) {
        market.total_long_positions = market.total_long_positions + 1;
    }

    public(friend) fun decrement_long_positions(market: &mut MarketState) {
        market.total_long_positions = market.total_long_positions - 1;
    }

    public(friend) fun increment_short_positions(market: &mut MarketState) {
        market.total_short_positions = market.total_short_positions + 1;
    }

    public(friend) fun decrement_short_positions(market: &mut MarketState) {
        market.total_short_positions = market.total_short_positions - 1;
    }

    public(friend) fun add_volume(market: &mut MarketState, volume: u64) {
        market.total_volume_24h = market.total_volume_24h + volume;
    }

    // Constructor functions
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
        let liquidation_price = if (is_long) {
            entry_price - (entry_price / (leverage * 2))
        } else {
            entry_price + (entry_price / (leverage * 2))
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

    public(friend) fun new_market_state(
        pair: String,
        ctx: &mut TxContext
    ): MarketState {
        MarketState {
            id: object::new(ctx),
            pair,
            total_long_positions: 0,
            total_short_positions: 0,
            total_volume_24h: 0,
        }
    }

    // Cleanup functions
    public(friend) fun destroy_position(position: Position) {
        let Position { id, pair: _, size: _, leverage: _, entry_price: _, liquidation_price: _, is_long: _, owner: _, timestamp: _ } = position;
        object::delete(id);
    }

    // Share market state
    public(friend) fun share_market(market: MarketState) {
        transfer::share_object(market);
    }

    // Transfer position
    public(friend) fun transfer_position(position: Position, recipient: address) {
        transfer::transfer(position, recipient);
    }
}
