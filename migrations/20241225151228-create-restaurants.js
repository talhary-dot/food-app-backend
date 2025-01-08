'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('restaurants', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      restaurant_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      owner_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      restaurant_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      operating_hours: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      restaurant_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      menu_upload: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      profile_picture: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      payment_details: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('restaurants');
  },
};
