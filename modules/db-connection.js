const mysql = require('mysql2');

const connection = mysql.createPool({
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

module.exports = {
    connection: connection,
    doQuery: async (query, params) => {
        let responseData;
        const promise = new Promise((resolve, reject) => {
            connection.query(query,
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
    }
};