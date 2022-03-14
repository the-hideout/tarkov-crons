const mysql = require('mysql2');

const pool = mysql.createPool({
    host     : process.env.DATABASE_HOST,
    user     : process.env.PSCALE_USER,
    password : process.env.PSCALE_PASS,
    database : process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: true
    }
});
pool.keepAlive = false;

module.exports = {
    connection: pool,
    doQuery: async (query, params) => {
        let responseData;
        const promise = new Promise((resolve, reject) => {
            pool.query(query,
                params
                , async (error, results) => {
                    if (error) {
                        reject(error)
                    }

                    resolve(results);
                }
            );
        });

        try {
            responseData = await promise;
        } catch (upsertError){
            console.error(upsertError);

            throw upsertError;
        }

        return responseData;
    },
    jobComplete: async () => {
        if (pool.keepAlive) {
            return Promise.resolve(false);
        }
        return new Promise((resolve, reject) => {
            pool.end(error => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(true);
            });
        });
    }
};