import { Sequelize } from "sequelize";
import { configDotenv } from 'dotenv';
configDotenv();

const nomeBanco = process.env.DB_SCHEMA;
const usuarioBanco = process.env.DB_USER;
const senhaBanco = process.env.DB_PASS;
const hostBanco = process.env.DB_HOST;
const portaBanco = process.env.DB_PORT;
const dialectBanco = process.env.DB_DIALECT;

const dataBase = new Sequelize(nomeBanco, usuarioBanco, senhaBanco, {
    host: hostBanco,
    port: portaBanco,
    dialect: dialectBanco,
    logging: false,
});

dataBase.authenticate().then(() => {
    console.log("Conexão com o banco de dados realizada com sucesso!");
}).catch((erro) => {
    console.log("Erro ao conectar com o banco de dados: " + erro);
});

export default dataBase;