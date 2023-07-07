import mysql from "mysql2";
import { configDotenv } from 'dotenv';
configDotenv();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    database: process.env.DB_SCHEMA,
});

connection.connect((err) => {
    if (err) {
        console.log("Erro ao conectar no banco de dados");
        return;
    }
    console.log("Conectado com sucesso!");
});


export default function executar(query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (err, result) => {
            if (err) {
                console.log("Houve um erro: " + err);
                reject(err);
                return;
            }
            return resolve(result);
        });
    });
}