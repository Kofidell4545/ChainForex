#[test_only]
module chainforex::position_tests {
    use sui::test_scenario as ts;
    use std::string;
    
    use chainforex::test_utils;
    use chainforex::types::{Self, Position};
    use chainforex::position;

    #[test]
    fun test_create_position() {
        let (scenario, clock) = test_utils::setup_scenario(@0x1);
        
        // Create position
        ts::next_tx(&mut scenario, @0x1);
        {
            let ctx = ts::ctx(&mut scenario);
            let position = types::new_position(
                string::utf8(b"EUR/USD"),
                1000, // $1000
                5, // 5x leverage
                10000, // $1.0000
                true, // long position
                @0x1,
                0,
                ctx
            );

            // Verify position properties
            assert!(types::get_position_size(&position) == 1000, 0);
            assert!(types::get_position_leverage(&position) == 5, 1);
            assert!(types::get_position_entry_price(&position) == 10000, 2);
            assert!(types::is_position_long(&position) == true, 3);
            assert!(types::get_position_owner(&position) == @0x1, 4);

            // Clean up
            ts::return_to_sender(&scenario, position);
        };

        test_utils::clean_up(scenario, clock);
    }

    #[test]
    #[expected_failure(abort_code = types::E_INVALID_LEVERAGE)]
    fun test_invalid_leverage() {
        let (scenario, clock) = test_utils::setup_scenario(@0x1);
        
        // Try to create position with invalid leverage
        ts::next_tx(&mut scenario, @0x1);
        {
            let ctx = ts::ctx(&mut scenario);
            let position = types::new_position(
                string::utf8(b"EUR/USD"),
                1000,
                11, // leverage > MAX_LEVERAGE (10)
                10000,
                true,
                @0x1,
                0,
                ctx
            );
            ts::return_to_sender(&scenario, position);
        };

        test_utils::clean_up(scenario, clock);
    }

    #[test]
    fun test_position_liquidation_check() {
        let (scenario, clock) = test_utils::setup_scenario(@0x1);
        
        // Create position
        ts::next_tx(&mut scenario, @0x1);
        {
            let ctx = ts::ctx(&mut scenario);
            let position = types::new_position(
                string::utf8(b"EUR/USD"),
                1000,
                5, // 5x leverage
                10000, // Entry at $1.0000
                true, // long position
                @0x1,
                0,
                ctx
            );

            // Test liquidation price
            let liquidation_price = types::get_position_liquidation_price(&position);
            
            // Price above liquidation - should not liquidate
            assert!(!position::check_liquidation(&position, liquidation_price + 1), 0);
            
            // Price at liquidation - should liquidate
            assert!(position::check_liquidation(&position, liquidation_price), 1);
            
            // Price below liquidation - should liquidate
            assert!(position::check_liquidation(&position, liquidation_price - 1), 2);

            // Clean up
            ts::return_to_sender(&scenario, position);
        };

        test_utils::clean_up(scenario, clock);
    }

    #[test]
    fun test_close_position() {
        let (scenario, clock) = test_utils::setup_scenario(@0x1);
        
        // Create and close position
        ts::next_tx(&mut scenario, @0x1);
        {
            let ctx = ts::ctx(&mut scenario);
            let position = types::new_position(
                string::utf8(b"EUR/USD"),
                1000,
                5,
                10000, // Entry at $1.0000
                true,
                @0x1,
                0,
                ctx
            );

            // Close at profit
            position::close_position(position, 11000, ctx); // Exit at $1.1000
        };

        test_utils::clean_up(scenario, clock);
    }

    #[test]
    #[expected_failure(abort_code = position::E_UNAUTHORIZED)]
    fun test_unauthorized_close() {
        let (scenario, clock) = test_utils::setup_scenario(@0x1);
        
        // Create position
        ts::next_tx(&mut scenario, @0x1);
        {
            let ctx = ts::ctx(&mut scenario);
            let position = types::new_position(
                string::utf8(b"EUR/USD"),
                1000,
                5,
                10000,
                true,
                @0x1,
                0,
                ctx
            );
            ts::return_to_sender(&scenario, position);
        };

        // Try to close from different address
        ts::next_tx(&mut scenario, @0x2);
        {
            let position = ts::take_from_sender<Position>(&scenario);
            position::close_position(position, 11000, ts::ctx(&mut scenario));
        };

        test_utils::clean_up(scenario, clock);
    }
}
