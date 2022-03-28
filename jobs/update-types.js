const fs = require('fs');
const path = require('path');

const ttData = require('../modules/tt-data');

const {query, jobComplete} = require('../modules/db-connection');

module.exports = async () => {
    const allTTItems = await ttData();
    const bsgData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'bsg-data.json')));

    let i = 0;
    for(const itemId in allTTItems){
        const item = allTTItems[itemId];
        i = i + 1;
        // console.log(`Updating ${i + 1}/${Object.keys(allTTItems).length} ${itemId} ${item.shortName}`);

        if(!bsgData[itemId]?._props){
            continue;
        }

        try {
            if(item.types.includes('noFlea') && bsgData[itemId]._props.CanSellOnRagfair){
                console.log(`You can sell ${itemId} ${item.name}`);

                await query(`DELETE FROM types WHERE item_id = ? AND type = 'no-flea'`, [itemId]);
            } else if(!item.types.includes('noFlea') && !bsgData[itemId]._props.CanSellOnRagfair){
                console.log(`You can't sell ${itemId} ${item.name}`);
    
                await query(`INSERT IGNORE INTO types (item_id, type) VALUES(?, 'no-flea')`, [itemId]);
            }
        } catch (error){
            console.error(error);

            return Promise.reject(error);
        }
    }
    await jobComplete();
};