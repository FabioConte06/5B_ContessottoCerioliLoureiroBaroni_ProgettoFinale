const fs = require('fs');
const mysql = require('mysql2');
const conf = JSON.parse(fs.readFileSync('conf.json'));
conf.ssl = {
    ca: fs.readFileSync(__dirname + '/ca.pem')
};
const connection = mysql.createConnection(conf);

const executeQuery = (sql) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(result);
        });
    });
};

const database = {
    createTable: async () => {
        await executeQuery(
            `CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )`
        );
    },
    register: async (username, email, password) => {
        const checkUsername = `SELECT * FROM users WHERE username = '${username}'`;
        const existingUsername = await executeQuery(checkUsername);
        if (existingUsername.length > 0) {
            throw new Error('Username già registrato.');
        }
        const checkEmail = `SELECT * FROM users WHERE email = '${email}'`;
        const existingEmail = await executeQuery(checkEmail);
        if (existingEmail.length > 0) {
            throw new Error('Email già registrata.');
        }
        const sql = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`;
        return executeQuery(sql);
    },
    login: async (username, password) => {
        const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
        const result = await executeQuery(sql);
        return result.length > 0 ? result[0] : null;
    },
};

module.exports = database;