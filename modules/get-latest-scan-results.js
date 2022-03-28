const {query} = require('./db-connection');
const timer = require('./console-timer');

module.exports = async () => {
    const t = timer('latest-scan-query');
    return query('select max(timestamp) as timestamp, source from price_data group by source order by `timestamp` desc').then(results => {
        t.end();
        return results;
    })
};