#[test_only]
module chainforex::test_utils {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils;
    use std::string;
    use chainforex::trading;
    use chainforex::types::{Self, Position};
    use chainforex::price_feed::PriceFeed;

    // Test constants
    const TEST_PAIR: vector<u8> = b"EUR/USD";
    
    /// Setup a test scenario
    public fun setup_scenario(addr: address): Scenario {
        ts::begin(addr)
    }

    /// Setup a market with price feed
    public fun setup_market(scenario: &mut Scenario) {
        ts::next_tx(scenario, @0x1);
        
        trading::initialize(
            string::utf8(TEST_PAIR),
            ts::ctx(scenario)
        );

        // Return the scenario
        scenario
    }

    /// Helper to create a test position
    public fun create_test_position(
        size: u64,
        leverage: u64,
        is_long: bool,
        ctx: &mut ts::Context
    ): Position {
        let pair = string::utf8(TEST_PAIR);
        let entry_price = 10000; // $1.0000 with 4 decimal places
        
        types::new_position(
            pair,
            size,
            leverage,
            entry_price,
            is_long,
            ts::sender(ctx),
            ts::ctx(ctx)
        )
    }
}
