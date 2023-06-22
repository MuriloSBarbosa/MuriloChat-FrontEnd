import mysql from "mysql2";


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    port: 3307,
    database: "murilochat"
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