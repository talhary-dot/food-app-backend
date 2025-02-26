const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../config/db'); // Adjust the path to your `db.js` file
const basename = path.basename(__filename);
const db = {};

// Dynamically load all model files in the models directory
fs.readdirSync(__dirname)
    .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

// Initialize associations for each model if defined
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// Export the Sequelize instance and the loaded models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
