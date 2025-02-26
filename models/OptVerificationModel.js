const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class OptVerificationModel extends Model {
        static associate(models) {
            OptVerificationModel.belongsTo(models.UserModel, {
                foreignKey: 'user_id',
                as: 'user', // Alias for the association
                onDelete: 'CASCADE',
            });
        }
    }

    OptVerificationModel.init({
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users', // Must match the tableName in UserModel
                key: 'id',
            },
        },
        otp: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expire_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'OptVerificationModel',
        tableName: 'otp_verifications',
        timestamps: true,
        paranoid: true,
    });

    return OptVerificationModel;
};
