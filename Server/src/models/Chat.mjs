import dataBase from "../config/DataBase.mjs";
import { Sequelize } from "sequelize";
import Usuario from "./Usuario.mjs";
import Sala from "./Sala.mjs";

const Chat = dataBase.define('Chat', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    isOut: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
},
    {
        freezeTableName: true,
    });


Chat.belongsTo(Usuario, { foreignKey: 'fkUsuario' });
Chat.belongsTo(Sala, { foreignKey: 'fkSala' });

Chat.sync();

export default Chat;
