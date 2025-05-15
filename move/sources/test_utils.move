#[test_only]
module chainforex::test_utils {
    use sui::clock::{Self, Clock};
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils;
    use std::string;

    use chainforex::types;
    use chainforex::trading;
    use chainforex::price_feed::{Self, PriceFeed};

    // Test constants
    const TEST_PRICE_FEED_ID: vector<u8> = x"ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
    const TEST_PAIR: vector<u8> = b"EUR/USD";
    
    /// Creates a test scenario with a clock
    public fun setup_scenario(initial_sender: address): (Scenario, Clock) {
        let scenario = ts::begin(initial_sender);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        (scenario, clock)
    }

    /// Sets up a test market with price feed
    public fun setup_market(scenario: &mut Scenario, clock: &Clock): (@PriceFeed, address) {
        let test_address = @0xCAFE;
        
        // Create market
        ts::next_tx(scenario, test_address);
        {
            trading::create_market(
                TEST_PAIR,
                ts::ctx(scenario)
            );
        };

        // Create price feed
        ts::next_tx(scenario, test_address);
        {
            trading::create_price_feed(
                TEST_PRICE_FEED_ID,
                ts::ctx(scenario)
            );
        };

        // Return the price feed and test address
        let price_feed = ts::take_shared<PriceFeed>(scenario);
        (price_feed, test_address)
    }

    /// Helper to create a test position
    public fun create_test_position(
        size: u64,
        leverage: u64,
        is_long: bool,
        ctx: &mut ts::Context
    ) {
        let pair = string::utf8(TEST_PAIR);
        let entry_price = 10000; // $1.0000 with 4 decimal places
        
        types::new_position(
            pair,
            size,
            leverage,
            entry_price,
            is_long,
            ts::sender(ctx),
            0, // timestamp
            ctx
        );
    }

    /// Advance clock by milliseconds
    public fun advance_clock(clock: &mut Clock, ms: u64) {
        clock::increment_for_testing(clock, ms);
    }

    /// Clean up test scenario
    public fun clean_up(scenario: Scenario, clock: Clock) {
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}
