const {query, jobComplete} = require('../modules/db-connection');
const cloudflare = require('../modules/cloudflare');

module.exports = async () => {
    const resetTimes = {};
    try {
        const results = await query(`
            SELECT
                trader.trader_name,
                trader.reset_time,
                trader.created
            FROM
                trader_reset AS trader
            INNER JOIN (
            SELECT id, trader_name, MAX(created) AS timestamp
            FROM trader_reset
            GROUP BY trader_name, id, created
            ) AS max_time
            ON
                trader.created = max_time.timestamp
            AND
                trader.trader_name = max_time.trader_name;
        `);
        for(const result of results){
            const [hours, minutes, seconds] = result.reset_time.split(':').map(Number);
            const resetTime = result.created;

            resetTime.setHours(resetTime.getHours() + hours);
            resetTime.setMinutes(resetTime.getMinutes() + minutes);
            resetTime.setSeconds(resetTime.getSeconds() + seconds);

            resetTimes[result.trader_name] = resetTime;
        }
    } catch (error){
        console.error(error);

        return Promise.reject(error);
    }

    try {
        const response = await cloudflare(`/values/RESET_TIMES`, 'PUT', JSON.stringify(resetTimes));
        console.log(response);
    } catch (requestError){
        console.error(requestError);
    }

    // fs.writeFileSync(path.join(__dirname, '..', 'dumps', 'reset-times.json'), JSON.stringify(cloudflareData, null, 4));

    // Possibility to POST to a Discord webhook here with cron status details
    console.log(`Process completed`);
    await jobComplete();
};