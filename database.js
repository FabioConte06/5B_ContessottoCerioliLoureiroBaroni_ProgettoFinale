const fs = require('fs');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const conf = JSON.parse(fs.readFileSync('conf.json'));
conf.ssl = {
   ca: fs.readFileSync(__dirname + '/ca.pem')
}
const connection = mysql.createConnection(conf);

const executeQuery = (sql) => {
   return new Promise((resolve, reject) => {
      connection.query(sql, function (err, result) {
         if (err) {
            console.error(err);
            reject();
         }
         console.log('done');
         resolve(result);
      });
   });
}

const database = {
   createTable: async () => {
      await executeQuery(
         `CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL,
            password VARCHAR(255) NOT NULL
         )`
      );
   },
   register: async (username, email, password) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${hashedPassword}')`;
      return executeQuery(sql);
   },
   login: async (username, password) => {
      const sql = `SELECT * FROM users WHERE username = '${username}'`;
      const result = await executeQuery(sql);
      if (result.length > 0) {
         const user = result[0];
         const match = await bcrypt.compare(password, user.password);
         return match ? user : null;
      }
      return null;
   },
};

module.exports = database;