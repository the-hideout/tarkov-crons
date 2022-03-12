const fs = require('fs');
const path = require('path');

const roundTo = require('round-to');

const cloudflare = require('../modules/cloudflare');
const remoteData = require('../modules/remote-data');
const doQuery = require('../modules/do-query');

module.exports = async () => {
    const itemMap = await remoteData.get();
    const itemData = {};

    console.time('price-yesterday-query');
    const avgPriceYesterday = await doQuery(`SELECT
        avg(price) AS priceYesterday,
        item_id
    FROM
        price_data
    WHERE
        timestamp > DATE_SUB(NOW(), INTERVAL 2 DAY)
    AND
        timestamp < DATE_SUB(NOW(), INTERVAL 1 DAY)
    GROUP BY
        item_id`);
    console.timeEnd('price-yesterday-query');

    console.time('last-low-price-query');
    const lastKnownPriceData = await doQuery(`SELECT
        price,
        a.timestamp,
        a.item_id
    FROM
        price_data a
    INNER JOIN (
        SELECT
            max(timestamp) as timestamp,
            item_id
        FROM
            price_data
        WHERE
        	timestamp > '2021-12-12 01:00:00'
        GROUP BY
            item_id
    ) b
    ON
        a.timestamp = b.timestamp
    GROUP BY
        item_id, timestamp, price;`);
    console.timeEnd('last-low-price-query');

    console.time('contained-items-query');
    const containedItems = await doQuery(`SELECT
        *
    FROM
        item_children;`);
    console.timeEnd('contained-items-query');

    let containedItemsMap = {};

    for (const result of containedItems) {
        if (!containedItemsMap[result.container_item_id]) {
            containedItemsMap[result.container_item_id] = [];
        }

        containedItemsMap[result.container_item_id].push({
            itemId: result.child_item_id,
            count: result.count,
        });
    }

    for (const [key, value] of itemMap.entries()) {
        itemData[key] = value;

        Reflect.deleteProperty(itemData[key], 'last_update');
        Reflect.deleteProperty(itemData[key], 'last_scan');
        Reflect.deleteProperty(itemData[key], 'checked_out_by');
        Reflect.deleteProperty(itemData[key], 'trader_last_scan');
        Reflect.deleteProperty(itemData[key], 'trader_checked_out_by');
        Reflect.deleteProperty(itemData[key], 'scan_position');
        Reflect.deleteProperty(itemData[key], 'match_index');

        // Only add these if it's allowed on the flea market
        if (!itemData[key].types.includes('no-flea')) {
            let itemPriceYesterday = avgPriceYesterday.find(row => row.item_id === key);

            if (!itemPriceYesterday || itemData[key].avg24hPrice === 0) {
                itemData[key].changeLast48hPercent = 0;
            } else {
                const percentOfDayBefore = itemData[key].avg24hPrice / itemPriceYesterday.priceYesterday
                itemData[key].changeLast48hPercent = roundTo((percentOfDayBefore - 1) * 100, 2);
            }
            itemData[key].changeLast48h = itemData[key].changeLast48hPercent

            if (!itemData[key].lastLowPrice) {
                let lastKnownPrice = lastKnownPriceData.find(row => row.item_id === key);
                if (lastKnownPrice) {
                    itemData[key].updated = lastKnownPrice.timestamp;
                    itemData[key].lastLowPrice = lastKnownPrice.price;
                }
            }
        }

        itemData[key].containsItems = containedItemsMap[key];

        // itemData[key].changeLast48h = itemPriceYesterday.priceYesterday || 0;
    }

    try {
        const response = await cloudflare(`/values/ITEM_CACHE`, 'PUT', JSON.stringify(itemData));
        console.log(response);
    } catch (requestError) {
        console.error(requestError);
    }

    fs.writeFileSync(path.join(__dirname, '..', 'dumps', 'item-cache.json'), JSON.stringify(itemData, null, 4));

    // Possibility to POST to a Discord webhook here with cron status details
    console.log(`Process completed`);
    process.exit(0);
};