const fs = require('fs');
const path = require('path');

const roundTo = require('round-to');

const cloudflare = require('../modules/cloudflare');
const remoteData = require('../modules/remote-data');
const connection = require('../modules/db-connection');
const moment = require('moment');

const {
    doQuery
} = require('../modules/db-connection');

const dbName = 'mirror';

const got = require('got');

module.exports = async () => {

    const response = await got.post('https://tarkov-tools.com/graphql', {
        body: JSON.stringify({
            query: `{
            itemsByName(name: \"Kalashnikov AKS-74U 5.45x39 assault rifle\"){
              id
              name
              shortName
              lastLowPrice
              updated
              buyFor {
                  source
                  price
                  currency
                  requirements {
                      type
                      value
                  }
              }
            }
          }`
        }),
        responseType: 'json',
    });

    try {
        const items = response.body.data.itemsByName
        for (const item of items) {
            //console.log(JSON.stringify(item, null, 4));

            const id = item['id']
            const name = item['name']
            const lastLowPrice = item['lastLowPrice']
            const updated = item['updated']
            const timestamp = moment(updated).format("YYYY-MM-DD HH:mm:ss")

            // Insert row into price_data if the row doesn't already exist.
            await doQuery(`
                INSERT INTO price_data (item_id, price, source, timestamp)
                SELECT '${id}', ${lastLowPrice}, 'tt', '${timestamp}'
                FROM DUAL
                WHERE NOT EXISTS(SELECT *
                                 FROM price_data
                                 WHERE timestamp = '${timestamp}'
                                   AND item_id = '${id}');
                `)


            console.log(`${items.indexOf(item)}/${items.length} | Item ${name} | Price ${lastLowPrice} | Updated ${timestamp} | ID ${id}`);

            for (const buyFor of item['buyFor']) {
                const source = buyFor['source']
                const price = buyFor['price']
                const currency = buyFor['currency']

                if (source == 'fleaMarket') {
                    //We only want trader prices, we already added the flea price above.
                    continue;
                }

                let loyaltyLevel;
                let questID;
                const trader = source;

                for (requirement of buyFor['requirements']) {
                    const type = requirement['type']
                    const value = requirement['value']

                    if (type == 'loyaltyLevel') {
                        loyaltyLevel = value
                    }

                    if (type == 'questCompleted') {
                        questID = value
                    }
                }

                let dbTraderItem;

                if (questID == undefined) {
                    dbTraderItem = await doQuery(`
                        SELECT id 
                        FROM trader_items 
                        WHERE
                            item_id='${id}'
                            AND trader_name='${trader}'
                            AND currency='${currency}'
                            AND min_level=${loyaltyLevel}
                        LIMIT 1`)
                } else {
                    dbTraderItem = await doQuery(`
                        SELECT id 
                        FROM trader_items 
                        WHERE
                            item_id='${id}'
                            AND trader_name='${trader}'
                            AND currency='${currency}'
                            AND min_level=${loyaltyLevel}
                            AND quest_unlock_id=${questID}
                        LIMIT 1`)
                }

                if (dbTraderItem.length > 0) {
                    //Item already exists, lets get ID and push price update.
                    const traderItemID = dbTraderItem[0]['id']

                    await doQuery(`
                                    INSERT INTO trader_price_data (trade_id, price, source, timestamp)
                                    SELECT '${traderItemID}', ${price}, 'tt', '${timestamp}'
                                    FROM DUAL
                                    WHERE NOT EXISTS(SELECT *
                                            FROM trader_price_data
                                            WHERE timestamp = '${timestamp}'
                                             AND trade_id = '${traderItemID}');
                                    `)

                } else {
                    //Item doesn't exists, lets push it and THEN push the price update with the new ID.
                    if (questID == undefined) {
                        const output = await doQuery(
                            `
                                        INSERT INTO trader_items (item_id, trader_name, currency, min_level, quest_unlock_id, timestamp)
                                        VALUES ('${id}', '${trader}', '${currency}', '${level}', NULL, '${timestamp}');
                                    `
                        )
    
                        await doQuery(`
                                    INSERT INTO trader_price_data (trade_id, price, source, timestamp)
                                    VALUES (${output.insertId}, '${price}', 'tt', '${timestamp}');
                                `)
                    } else {
                        const output = await doQuery(
                            `
                                        INSERT INTO trader_items (item_id, trader_name, currency, min_level, quest_unlock_id, timestamp)
                                        VALUES ('${id}', '${trader}', '${currency}', '${level}', '${questID}', '${timestamp}');
                                    `
                        )
    
                        await doQuery(`
                                    INSERT INTO trader_price_data (trade_id, price, source, timestamp)
                                    VALUES (${output.insertId}, '${price}', 'tt', '${timestamp}');
                                `)
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        throw err;
    } finally {
        process.exit(0);
    }
}