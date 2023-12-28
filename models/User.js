module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		server_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		minnow: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		trout: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		whale: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		minnow_given: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		trout_given: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		last_hit: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		last_minnow: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		last_user: {
			type: DataTypes.STRING,
			defaultValue: "noone",
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};
