module chainforex::position {
    use sui::object::{Self, ID};
    use sui::event;
    use sui::tx_context::{Self, TxContext};
    use chainforex::types::{Self, Position};
    use std::string::String;

    friend chainforex::trading;

    // Event structs
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
        pnl: u64,
        timestamp: u64,
    }

    struct PositionLiquidated has copy, drop {
        position_id: ID,
        pair: String,
        liquidation_price: u64,
        timestamp: u64,
    }

    /// Open a new position
    public(friend) fun open_position(
        pair: String,
        size: u64,
        leverage: u64,
        entry_price: u64,
        is_long: bool,
        owner: address,
        timestamp: u64,
        ctx: &mut TxContext
    ): Position {
        let position = types::new_position(
            pair,
            size,
            leverage,
            entry_price,
            is_long,
            owner,
            timestamp,
            ctx
        );

        event::emit(PositionOpened {
            position_id: object::uid_to_inner(types::get_position_id(&position)),
            pair: types::get_position_pair(&position),
            size: types::get_position_size(&position),
            leverage: types::get_position_leverage(&position),
            entry_price: types::get_position_entry_price(&position),
            is_long: types::is_position_long(&position),
            owner: types::get_position_owner(&position),
            timestamp: types::get_position_timestamp(&position),
        });

        position
    }

    /// Close a position
    public(friend) fun close_position(
        position: Position,
        exit_price: u64,
        ctx: &mut TxContext
    ) {
        let id = types::get_position_id(&position);
        let pair = types::get_position_pair(&position);
        let size = types::get_position_size(&position);
        let leverage = types::get_position_leverage(&position);
        let entry_price = types::get_position_entry_price(&position);
        let is_long = types::is_position_long(&position);

        let pnl = calculate_pnl(
            size,
            leverage,
            entry_price,
            exit_price,
            is_long
        );

        event::emit(PositionClosed {
            position_id: object::uid_to_inner(id),
            pair,
            exit_price,
            pnl,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        types::destroy_position(position);
    }

    /// Liquidate a position
    public(friend) fun liquidate_position(
        position: Position,
        ctx: &mut TxContext
    ) {
        let id = types::get_position_id(&position);
        let pair = types::get_position_pair(&position);
        let liquidation_price = types::get_position_liquidation_price(&position);

        event::emit(PositionLiquidated {
            position_id: object::uid_to_inner(id),
            pair,
            liquidation_price,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        types::destroy_position(position);
    }

    /// Calculate PnL for a position
    fun calculate_pnl(
        size: u64,
        leverage: u64,
        entry_price: u64,
        exit_price: u64,
        is_long: bool
    ): u64 {
        let price_diff = if (is_long) {
            (exit_price * 100) / entry_price - 100
        } else {
            (entry_price * 100) / exit_price - 100
        };

        (size * leverage * price_diff) / 100
    }

    /// Check if a position needs to be liquidated
    public fun needs_liquidation(
        position: &Position,
        current_price: u64
    ): bool {
        if (types::is_position_long(position)) {
            current_price <= types::get_position_liquidation_price(position)
        } else {
            current_price >= types::get_position_liquidation_price(position)
        }
    }
}
