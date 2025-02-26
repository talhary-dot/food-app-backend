'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('otp_verifications', 'deletedAt', {
          type: Sequelize.DATE,
          allowNull: true,
      });
  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('otp_verifications', 'deletedAt');
  },
};