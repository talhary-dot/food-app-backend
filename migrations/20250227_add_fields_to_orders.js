"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'reason' column exists before adding it
    const reasonExists = await queryInterface
      .describeTable("orders")
      .then((tableDefinition) => {
        return tableDefinition.hasOwnProperty("reason");
      });
    if (!reasonExists) {
      await queryInterface.addColumn("orders", "reason", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    // Check if the 'completedAt' column exists before adding it
    const completedAtExists = await queryInterface
      .describeTable("orders")
      .then((tableDefinition) => {
        return tableDefinition.hasOwnProperty("completedAt");
      });
    if (!completedAtExists) {
      await queryInterface.addColumn("orders", "completedAt", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    // Check if the 'tipAmount' column exists before adding it
    const tipAmountExists = await queryInterface
      .describeTable("orders")
      .then((tableDefinition) => {
        return tableDefinition.hasOwnProperty("tipAmount");
      });
    if (!tipAmountExists) {
      await queryInterface.addColumn("orders", "tipAmount", {
        type: Sequelize.FLOAT,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("orders", "reason");
    await queryInterface.removeColumn("orders", "completedAt");
    await queryInterface.removeColumn("orders", "tipAmount");
  },
};
