"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("MenuItems", "discount", {
      type: Sequelize.FLOAT,
      allowNull: true,
      validate: {
        min: 1,
        max: 100,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("menu_items", "discount", {
      type: Sequelize.FLOAT,
      allowNull: true,
      validate: {
        min: 1,
        max: 100,
      },
    });

    await queryInterface.addColumn("menu_items", "remaining_discount_time", {
      type: Sequelize.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("menu_items", "discount");
    await queryInterface.removeColumn("menu_items", "remaining_discount_time");
  },
};
