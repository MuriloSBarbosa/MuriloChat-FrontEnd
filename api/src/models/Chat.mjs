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
    }
},
    {
        freezeTableName: true,
        timestamps: false
    });

Chat.belongsTo(Usuario, { foreignKey: 'fkUsuario' });
Chat.belongsTo(Sala, { foreignKey: 'fkSala' });

export default Chat;
