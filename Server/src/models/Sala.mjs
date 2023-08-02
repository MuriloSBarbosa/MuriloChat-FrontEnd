import sequelize from "../config/DataBase.mjs";
import { Sequelize } from "sequelize";

const Sala = sequelize.define('Sala', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    identificador: {
        type: Sequelize.STRING,
        allowNull: false
    }
},

    {
        freezeTableName: true,
    });

Sala.sync();

export default Sala;