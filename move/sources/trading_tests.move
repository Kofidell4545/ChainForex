#[test_only]
module chainforex::trading_tests {
    use sui::test_scenario as ts;
    use sui::clock;
    
    use chainforex::test_utils;
    use chainforex::trading;
    use chainforex::types::{Self, Position};
    use chainforex::price_feed::{Self, PriceFeed};

    #[test]
    fun test_create_market() {
        let (scenario, clock) = test_utils::setup_scenario(@0x1);
        let (price_feed, test_address) = test_utils::setup_market(&mut scenario, &clock);

        // Verify market was created
        ts::next_tx(&mut scenario, test_address);
        {
            // Market operations would go here
            // For now just verify price feed exists
            assert!(ts::has_most_recent_shared<PriceFeed>(), 0);
        };

        // Clean up
        ts::return_shared(price_feed);
        test_utils::clean_up(scenario, clock);
    }

    #[test]
    fun test_open_position() {
        let (scenario, mut clock) = test_utils::setup_scenario(@0x1);
        let (price_feed, test_address) = test_utils::setup_market(&mut scenario, &clock);

        // Set up price feed
        ts::next_tx(&mut scenario, test_address);
        {
            let feed = &mut price_feed;
            feed.last_price = 10000; // $1.0000
            feed.last_update_time = clock::timestamp_ms(&clock);
            feed.confidence_interval = 98;
        };

        // Open position
        ts::next_tx(&mut scenario, test_address);
        {
            let market = ts::take_shared<types::MarketState>(&scenario);
            trading::open_position(
                &mut market,
                &price_feed,
                &clock,
                b"EUR/USD",
                1000, // $1000
                5, // 5x leverage
                true, // long
                ts::ctx(&mut scenario)
            );
            ts::return_shared(market);
        };

        // Verify position was created
        ts::next_tx(&mut scenario, test_address);
        {
            assert!(ts::has_most_recent_for_sender<Position>(), 0);
        };

        // Clean up
        ts::return_shared(price_feed);
        test_utils::clean_up(scenario, clock);
    }

    #[test]
    fun test_close_position() {
        let (scenario, mut clock) = test_utils::setup_scenario(@0x1);
        let (price_feed, test_address) = test_utils::setup_market(&mut scenario, &clock);

        // Set up price feed
        ts::next_tx(&mut scenario, test_address);
        {
            let feed = &mut price_feed;
            feed.last_price = 10000;
            feed.last_update_time = clock::timestamp_ms(&clock);
            feed.confidence_interval = 98;
        };

        // Open position
        ts::next_tx(&mut scenario, test_address);
        {
            let market = ts::take_shared<types::MarketState>(&scenario);
            trading::open_position(
                &mut market,
                &price_feed,
                &clock,
                b"EUR/USD",
                1000,
                5,
                true,
                ts::ctx(&mut scenario)
            );
            ts::return_shared(market);
        };

        // Update price and close position
        ts::next_tx(&mut scenario, test_address);
        {
            let feed = &mut price_feed;
            feed.last_price = 11000; // Price moved up
            feed.last_update_time = clock::timestamp_ms(&clock);

            let market = ts::take_shared<types::MarketState>(&scenario);
            let position = ts::take_from_sender<Position>(&scenario);
            
            trading::close_position(
                &mut market,
                &price_feed,
                &clock,
                position,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(market);
        };

        // Clean up
        ts::return_shared(price_feed);
        test_utils::clean_up(scenario, clock);
    }

    #[test]
    fun test_liquidation() {
        let (scenario, mut clock) = test_utils::setup_scenario(@0x1);
        let (price_feed, test_address) = test_utils::setup_market(&mut scenario, &clock);

        // Set up price feed and open position
        ts::next_tx(&mut scenario, test_address);
        {
            let feed = &mut price_feed;
            feed.last_price = 10000;
            feed.last_update_time = clock::timestamp_ms(&clock);
            feed.confidence_interval = 98;

            let market = ts::take_shared<types::MarketState>(&scenario);
            trading::open_position(
                &mut market,
                &price_feed,
                &clock,
                b"EUR/USD",
                1000,
                5,
                true,
                ts::ctx(&mut scenario)
            );
            ts::return_shared(market);
        };

        // Move price below liquidation threshold and liquidate
        ts::next_tx(&mut scenario, test_address);
        {
            let feed = &mut price_feed;
            feed.last_price = 8000; // 20% drop, should trigger liquidation
            feed.last_update_time = clock::timestamp_ms(&clock);

            let market = ts::take_shared<types::MarketState>(&scenario);
            let position = ts::take_from_sender<Position>(&scenario);
            
            trading::liquidate_position(
                &mut market,
                &price_feed,
                &clock,
                position,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(market);
        };

        // Clean up
        ts::return_shared(price_feed);
        test_utils::clean_up(scenario, clock);
    }
}
