require('dotenv').config(); // Ensure .env is loaded

const { Sequelize } = require('sequelize');

console.log({
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    POSTGRES_URL:process.env.POSTGRES_URL
});
let sequelize = null
if(process.env.POSTGRES_URL)
sequelize = new Sequelize(process.env.POSTGRES_URL)
 else     
sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

module.exports = sequelize;
