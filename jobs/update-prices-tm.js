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
const {
    MongoClient
} = require('mongodb');
const url = process.env.MONGODB_URL;
const client = new MongoClient(url);
const dbName = 'mirror';


module.exports = async () => {

    await client.connect();
    console.log('Connected successfully to server');

    try {
        const db = client.db(dbName);
        let collection = db.collection('itemdata')

        let query = {
            //_id: '5b7c710788a4506dec015957'
        }

        let res = await collection.find(query).toArray();

        for (const item of res) {
            const id = item['_id']
            const name = item['_name']
            const marketData = item['marketdata']
            const price = marketData['price']
            const timestamp = moment(marketData['priceUpdated']).format("YYYY-MM-DD HH:mm:ss")

            const result = await doQuery(`
            INSERT INTO price_data (item_id, price, source, timestamp)
            SELECT '${id}', ${price}, 'tm', '${timestamp}'
            FROM DUAL
            WHERE NOT EXISTS(SELECT *
                             FROM price_data
                             WHERE timestamp = '${timestamp}'
                               AND item_id = '${id}');
            `)

            console.log(`${res.indexOf(item)}/${res.length} | Item ${name} | Price ${price} | Updated ${timestamp}`);

            //Update trader
            if (marketData['buyPrices'].length) {
                //Contains buyPrices
                for (const i2 of marketData['buyPrices']) {
                    if (i2['type'] !== 'trader') {
                        //We need the trader price only.
                        continue;
                    }

                    const traderPrice = i2
                    const price = traderPrice['priceCur'] || traderPrice['price'];
                    if (price == null) continue;

                    var currencySymbol = traderPrice['cur']
                    const trader = traderPrice['trader'].toLowerCase()
                    const level = traderPrice['level']

                    if (currencySymbol === '₽') {
                        currencySymbol = 'RUB'
                    } else if (currencySymbol === '$') {
                        currencySymbol = 'USD'
                    } else {
                        currencySymbol = 'EUR'
                    }

                    //console.log(`Item ${name} | Trader ${trader} | Level ${level} | Price ${price} | CUR ${currencySymbol}`);

                    const dbTraderItem = await doQuery(`
                    SELECT id 
                    FROM trader_items 
                    WHERE
                        item_id='${id}'
                        AND trader_name='${trader}'
                        AND currency='${currencySymbol}'
                        AND min_level=${level}
                    LIMIT 1`)

                    if (dbTraderItem.length > 0) {
                        //Item already exists, lets get ID and push price update.
                        const traderItemID = dbTraderItem[0]['id']

                        await doQuery(`
                                INSERT INTO trader_price_data (trade_id, price, source, timestamp)
                                SELECT '${traderItemID}', ${price}, 'tm', '${timestamp}'
                                FROM DUAL
                                WHERE NOT EXISTS(SELECT *
                                        FROM trader_price_data
                                        WHERE timestamp = '${timestamp}'
                                         AND trade_id = '${traderItemID}');
                                `)

                        //console.log(traderItemID);
                    } else {
                        //Item doesn't exists, lets push it and THEN push the price update with the new ID.
                        const output = await doQuery(
                            `
                                INSERT INTO trader_items (item_id, trader_name, currency, min_level, quest_unlock_id, timestamp)
                                VALUES ('${id}', '${trader}', '${currencySymbol}', '${level}', NULL, '${timestamp}');
                            `
                        )
                        
                        await doQuery(`
                            INSERT INTO trader_price_data (trade_id, price, source, timestamp)
                            VALUES (${output.insertId}, '${price}', 'tm', '${timestamp}');
                        `)

                        //console.log(output);
                    }

                    //console.log(dbTraderItem);
                }
            }
        }
    } catch (err) {
        console.log(err);
        throw err;
    } finally {
        client.close();
        process.exit(0);
    }
}