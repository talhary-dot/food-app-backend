const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class OTPModel extends Model {}

  OTPModel.init(
    {
      restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expire_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'OTPModel',
      tableName: 'res_otp_verifications',
    }
  );

  return OTPModel;
};
