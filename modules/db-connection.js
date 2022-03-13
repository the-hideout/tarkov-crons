const mysql = require('mysql2');

const connection = mysql.createPool({
    host     :  '6hvetf6kcr04.us-east-1.psdb.cloud',
    user     : '0js449syx4y0',
    password : 'pscale_pw_iAk-6MSUCyfxOVuxanCMmANBBEmDr7CbInbW_nYH8Wo',
    database : 'tarkov',
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