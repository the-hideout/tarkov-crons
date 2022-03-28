const { query, jobComplete } = require('../modules/db-connection');

module.exports = async () => {
    try {
        const results = await query(`
            SELECT
                MAX(timestamp) AS last_scan,
                source
            FROM
                price_data
            GROUP BY
            source;
        `);
        const now = new Date();
        const scanCutoff = (now.getTime() / 1000) - 21600 - (now.getTimezoneOffset() * 60);

        for(const scannerResult of results){
            if((scannerResult.last_scan.getTime() / 1000) > scanCutoff){
                continue;
            }
            console.log(`${scannerResult.source} hasn't worked since ${scannerResult.last_scan} so removing the checkout`);
            await query(`
                UPDATE
                    item_data
                SET
                    checked_out_by = NULL
                WHERE
                    checked_out_by = ?;
            `, [scannerResult.source]);
        }
    } catch (error) {
        return Promise.reject(error);
    }

    // Possibility to POST to a Discord webhook here with cron status details
    console.log(`Process completed`);
    await jobComplete();
};