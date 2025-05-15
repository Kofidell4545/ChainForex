module chainforex::position {
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::event;
    use sui::tx_context::{Self, TxContext};
    use std::string::String;
    
    use chainforex::types::{Self, Position, PositionOpened, PositionClosed, PositionLiquidated};
    use chainforex::price_feed::{Self, PriceFeed};

    friend chainforex::trading;

    // Error codes
    const E_UNAUTHORIZED: u64 = 0;
    const E_POSITION_NOT_LIQUIDATABLE: u64 = 1;
    const E_INVALID_PRICE: u64 = 2;

    /// Opens a new position
    public(friend) fun open_position(
        pair: String,
        size: u64,
        leverage: u64,
        entry_price: u64,
        is_long: bool,
        ctx: &mut TxContext
    ): ID {
        let owner = tx_context::sender(ctx);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        
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

        let position_id = object::id(&position);

        // Emit position opened event
        event::emit(PositionOpened {
            position_id,
            pair,
            size,
            leverage,
            entry_price,
            is_long,
            owner,
            timestamp,
        });

        // Transfer position to owner
        transfer::transfer(position, owner);
        
        position_id
    }

    /// Closes a position
    public fun close_position(
        position: Position,
        exit_price: u64,
        ctx: &mut TxContext
    ) {
        let Position {
            id,
            pair,
            size,
            leverage,
            entry_price,
            liquidation_price: _,
            is_long,
            owner,
            timestamp: _
        } = position;

        assert!(tx_context::sender(ctx) == owner, E_UNAUTHORIZED);

        // Calculate PnL
        let pnl = calculate_pnl(size, leverage, entry_price, exit_price, is_long);

        // Emit position closed event
        event::emit(PositionClosed {
            position_id: object::uid_to_inner(&id),
            pair,
            exit_price,
            pnl,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        object::delete(id);
    }

    /// Liquidates a position if price crosses liquidation threshold
    public fun liquidate_position(
        position: Position,
        current_price: u64,
        ctx: &mut TxContext
    ) {
        let Position {
            id,
            pair,
            size: _,
            leverage: _,
            entry_price: _,
            liquidation_price,
            is_long,
            owner: _,
            timestamp: _
        } = position;

        // Check if position can be liquidated
        let can_liquidate = if (is_long) {
            current_price <= liquidation_price
        } else {
            current_price >= liquidation_price
        };

        assert!(can_liquidate, E_POSITION_NOT_LIQUIDATABLE);

        // Emit liquidation event
        event::emit(PositionLiquidated {
            position_id: object::uid_to_inner(&id),
            pair,
            liquidation_price,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        object::delete(id);
    }

    /// Calculate position PnL
    fun calculate_pnl(
        size: u64,
        leverage: u64,
        entry_price: u64,
        exit_price: u64,
        is_long: bool
    ): i64 {
        let price_diff = if (is_long) {
            (exit_price as i64) - (entry_price as i64)
        } else {
            (entry_price as i64) - (exit_price as i64)
        };

        let leveraged_size = (size as i64) * (leverage as i64);
        (leveraged_size * price_diff) / (entry_price as i64)
    }

    /// Check if a position needs to be liquidated
    public fun check_liquidation(
        position: &Position,
        current_price: u64
    ): bool {
        let liquidation_price = types::get_position_liquidation_price(position);
        let is_long = types::is_position_long(position);

        if (is_long) {
            current_price <= liquidation_price
        } else {
            current_price >= liquidation_price
        }
    }
}
