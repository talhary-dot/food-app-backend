"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("orders", "receivedBy", {
      type: Sequelize.STRING,
      allowNull: true, // Allow null since it's optional
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("orders", "receivedBy");
  },
};
