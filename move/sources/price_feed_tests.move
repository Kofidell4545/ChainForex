#[test_only]
module chainforex::price_feed_tests {
    use sui::test_scenario::{Self as ts};
    use std::string;
    use chainforex::test_utils;
    use chainforex::trading;
    use chainforex::price_feed::{Self, PriceFeed};

    #[test]
    fun test_price_feed_creation() {
        let scenario = test_utils::setup_scenario(@0x1);
        test_utils::setup_market(&mut scenario);

        // Verify price feed exists
        ts::next_tx(&mut scenario, @0x1);
        {
            assert!(ts::has_most_recent_shared<PriceFeed>(), 0);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_price_update() {
        let scenario = test_utils::setup_scenario(@0x1);
        test_utils::setup_market(&mut scenario);

        // Update price
        ts::next_tx(&mut scenario, @0x1);
        {
            let feed = ts::take_shared<PriceFeed>(&scenario);
            price_feed::update_price(
                &mut feed,
                10000,
                98,
                ts::ctx(&mut scenario)
            );
            ts::return_shared(feed);
        };

        // Verify price was updated
        ts::next_tx(&mut scenario, @0x1);
        {
            let feed = ts::take_shared<PriceFeed>(&scenario);
            assert!(price_feed::get_latest_price(&feed) == 10000, 0);
            assert!(price_feed::get_confidence_interval(&feed) == 98, 0);
            ts::return_shared(feed);
        };

        ts::end(scenario);
    }
}
