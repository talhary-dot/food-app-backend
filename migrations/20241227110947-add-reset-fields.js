'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add columns to users table
    await queryInterface.addColumn('users', 'reset_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'reset_token_expires', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Add columns to restaurants table
    await queryInterface.addColumn('restaurants', 'reset_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('restaurants', 'reset_token_expires', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove columns from users table
    await queryInterface.removeColumn('users', 'reset_token');
    await queryInterface.removeColumn('users', 'reset_token_expires');

    // Remove columns from restaurants table
    await queryInterface.removeColumn('restaurants', 'reset_token');
    await queryInterface.removeColumn('restaurants', 'reset_token_expires');
  },
};
