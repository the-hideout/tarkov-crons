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

main();

async function main() {

    await client.connect();
    console.log('Connected successfully to server');

    try {
        const db = client.db(dbName);
        let collection = db.collection('itemdata')

        let query = {
            _id: '544fb45d4bdc2dee738b4568'
        }
        let res = await collection.find(query).toArray();

        for (const item of res) {
            const id = item['_id']
            const name = item['_name']
            const marketData = item['marketdata']
            const price = marketData['price']
            const timestamp = moment(marketData['updated']).format("YYYY-MM-DD HH:mm:ss")

            const result = await doQuery(`
            INSERT INTO price_data (item_id, price, source, timestamp)
            SELECT '${id}', ${price}, 'tm', '${timestamp}'
            FROM DUAL
            WHERE NOT EXISTS(SELECT *
                             FROM price_data
                             WHERE timestamp = '${timestamp}'
                               AND item_id = '${id}');
            `)

            console.log(`${name}`);

            //Update trader
            /* if (marketData['buyPrices'].length) {
                //Contains buyPrices
                for (i2 in marketData['buyPrices']) {
                    if (marketData['buyPrices'][i2]['type'] !== 'trader') {
                        //We need the trader price only.
                        continue;
                    }

                    const traderPrice = marketData['buyPrices'][i2]
                    const price = traderPrice['price']
                    const currencySymbol = traderPrice['cur']
                    const trader = traderPrice['trader']
                    const level = traderPrice['level']

                    console.log(`Item ${name} | Trader ${trader} | Level ${level} | Price ${price} | CUR ${currencySymbol}`);

                    const dbTraderItem = await doQuery(`
                    SELECT id 
                    FROM trader_items 
                    WHERE
                        item_id='${id}'
                        AND trader_name='${trader}'
                        AND currency='RUB'
                        AND min_level=${level}
                    LIMIT 1`)

                    if (dbTraderItem.length > 0) {
                        //Item already exists, lets get ID and push price update.
                        const traderItemID = dbTraderItem[0]['id']

                        console.log(traderItemID);
                    } else {
                        //Item doesn't exists, lets push it and THEN push the price update with the new ID.
                    }

                    console.log(dbTraderItem);
                }
            } */
        }
    } catch (err) {
        console.log(err);
        throw err;
    } finally {
        client.close();
        process.exit(0);
    }
}