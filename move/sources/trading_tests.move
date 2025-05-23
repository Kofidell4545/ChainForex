#[test_only]
module chainforex::trading_tests {
    use sui::test_scenario::{Self as ts};
    use std::string;
    
    use chainforex::test_utils;
    use chainforex::trading;
    use chainforex::types::{Self, Position, MarketState};
    use chainforex::price_feed::{Self, PriceFeed};

    #[test]
    fun test_initialize_market() {
        let scenario = test_utils::setup_scenario(@0x1);
        ts::next_tx(&mut scenario, @0x1);
        
        // Initialize market
        trading::initialize(
            string::utf8(b"EUR/USD"),
            ts::ctx(&mut scenario)
        );

        // Verify market was created
        ts::next_tx(&mut scenario, @0x1);
        {
            // Verify price feed exists
            assert!(ts::has_most_recent_shared<PriceFeed>(), 0);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_open_position() {
        let scenario = test_utils::setup_scenario(@0x1);
        test_utils::setup_market(&mut scenario);

        // Set up price feed
        ts::next_tx(&mut scenario, @0x1);
        {
            let feed = ts::take_shared<PriceFeed>(&scenario);
            price_feed::update_price(
                &mut feed,
                10000, // $1.0000
                98, // 98% confidence
                ts::ctx(&mut scenario)
            );
            ts::return_shared(feed);
        };

        // Open position
        ts::next_tx(&mut scenario, @0x1);
        {
            let market = ts::take_shared<MarketState>(&scenario);
            let feed = ts::take_shared<PriceFeed>(&scenario);
            
            trading::open_position(
                &mut market,
                &feed,
                1000, // $1000
                5, // 5x leverage
                true, // long
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(market);
            ts::return_shared(feed);
        };

        // Verify position was created
        ts::next_tx(&mut scenario, @0x1);
        {
            assert!(ts::has_most_recent_for_sender<Position>(), 0);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_close_position() {
        let scenario = test_utils::setup_scenario(@0x1);
        test_utils::setup_market(&mut scenario);

        // Set up price feed and open position
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

        // Open position
        ts::next_tx(&mut scenario, @0x1);
        {
            let market = ts::take_shared<MarketState>(&scenario);
            let feed = ts::take_shared<PriceFeed>(&scenario);
            
            trading::open_position(
                &mut market,
                &feed,
                1000,
                5,
                true,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(market);
            ts::return_shared(feed);
        };

        // Update price and close position
        ts::next_tx(&mut scenario, @0x1);
        {
            let feed = ts::take_shared<PriceFeed>(&scenario);
            price_feed::update_price(
                &mut feed,
                11000, // Price moved up
                98,
                ts::ctx(&mut scenario)
            );

            let market = ts::take_shared<MarketState>(&scenario);
            let position = ts::take_from_sender<Position>(&scenario);
            
            trading::close_position(
                &mut market,
                &feed,
                position,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(market);
            ts::return_shared(feed);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_liquidation() {
        let scenario = test_utils::setup_scenario(@0x1);
        test_utils::setup_market(&mut scenario);

        // Set up price feed and open position
        ts::next_tx(&mut scenario, @0x1);
        {
            let feed = ts::take_shared<PriceFeed>(&scenario);
            price_feed::update_price(
                &mut feed,
                10000,
                98,
                ts::ctx(&mut scenario)
            );

            let market = ts::take_shared<MarketState>(&scenario);
            
            trading::open_position(
                &mut market,
                &feed,
                1000,
                5,
                true,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(market);
            ts::return_shared(feed);
        };

        // Move price below liquidation threshold and liquidate
        ts::next_tx(&mut scenario, @0x1);
        {
            let feed = ts::take_shared<PriceFeed>(&scenario);
            price_feed::update_price(
                &mut feed,
                8000, // 20% drop, should trigger liquidation
                98,
                ts::ctx(&mut scenario)
            );

            let market = ts::take_shared<MarketState>(&scenario);
            let position = ts::take_from_sender<Position>(&scenario);
            
            trading::liquidate_position(
                &mut market,
                &feed,
                position,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(market);
            ts::return_shared(feed);
        };

        ts::end(scenario);
    }
}
