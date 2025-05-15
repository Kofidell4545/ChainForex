#[test_only]
module chainforex::price_feed_tests {
    use sui::clock;
    use sui::test_scenario as ts;
    
    use chainforex::test_utils;
    use chainforex::price_feed::{Self, PriceFeed};

    #[test]
    fun test_create_price_feed() {
        let (scenario, clock) = test_utils::setup_scenario(@0x1);
        let (price_feed, _) = test_utils::setup_market(&mut scenario, &clock);

        // Verify price feed was created with initial values
        assert!(price_feed::get_latest_price(&price_feed, &clock) == 0, 0);
        assert!(price_feed::get_last_update_time(&price_feed) == 0, 1);
        assert!(price_feed::get_confidence_interval(&price_feed) == 0, 2);

        // Clean up
        ts::return_shared(price_feed);
        test_utils::clean_up(scenario, clock);
    }

    #[test]
    #[expected_failure(abort_code = price_feed::E_PRICE_TOO_OLD)]
    fun test_price_staleness() {
        let (scenario, clock) = test_utils::setup_scenario(@0x1);
        let (price_feed, _) = test_utils::setup_market(&mut scenario, &clock);

        // Try to get price without updating it
        let _ = price_feed::get_latest_price(&price_feed, &clock);

        // Clean up
        ts::return_shared(price_feed);
        test_utils::clean_up(scenario, clock);
    }

    #[test]
    fun test_price_update_and_retrieval() {
        let (scenario, mut clock) = test_utils::setup_scenario(@0x1);
        let (price_feed, _) = test_utils::setup_market(&mut scenario, &clock);

        // Update price feed (simulated, in real environment this would come from Pyth)
        ts::next_tx(&mut scenario, @0x1);
        {
            let feed = &mut price_feed;
            feed.last_price = 10000; // $1.0000
            feed.last_update_time = clock::timestamp_ms(&clock);
            feed.confidence_interval = 98;
        };

        // Verify price can be retrieved
        assert!(price_feed::get_latest_price(&price_feed, &clock) == 10000, 0);
        assert!(price_feed::get_confidence_interval(&price_feed) == 98, 1);

        // Clean up
        ts::return_shared(price_feed);
        test_utils::clean_up(scenario, clock);
    }

    #[test]
    #[expected_failure(abort_code = price_feed::E_PRICE_TOO_OLD)]
    fun test_price_expiration() {
        let (scenario, mut clock) = test_utils::setup_scenario(@0x1);
        let (price_feed, _) = test_utils::setup_market(&mut scenario, &clock);

        // Update price
        ts::next_tx(&mut scenario, @0x1);
        {
            let feed = &mut price_feed;
            feed.last_price = 10000;
            feed.last_update_time = clock::timestamp_ms(&clock);
        };

        // Advance clock beyond MAX_PRICE_AGE_MS
        test_utils::advance_clock(&mut clock, 61000); // 61 seconds

        // Try to get expired price
        let _ = price_feed::get_latest_price(&price_feed, &clock);

        // Clean up
        ts::return_shared(price_feed);
        test_utils::clean_up(scenario, clock);
    }
}
