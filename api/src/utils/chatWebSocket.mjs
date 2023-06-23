import { servidorIo } from "../../app.mjs"
import executar from "../config/DataBase.mjs";
import { decodificarToken } from "../config/jwtConfig.mjs";
import moment from "moment-timezone";

const onlineUsersToken = [];

export default async function socketConfig(socketUser) {

    try {
        const tokenDecoded = await decodificarToken(socketUser.handshake.auth.token);

        // Usuarios online
        if (onlineUsersToken.length == 0) {
            onlineUsersToken.push(tokenDecoded.id);
        }

        onlineUsersToken.forEach((user) => {
            if (user != tokenDecoded.id) {
                onlineUsersToken.push(tokenDecoded);
            }
        });
    } catch (error) {
        console.error(error);
    }

    console.log("Usuários online:", onlineUsersToken);

    socketUser.emit('onlineUsers', onlineUsersToken);


    // Evento para entrar em uma sala
    socketUser.on('joinRoom', (room) => {
        socketUser.join(room);
        console.log(`Cliente entrou na sala: ${room}`);
    });

    // Evento para enviar uma mensagem para a sala
    socketUser.on('enviarMensagem', async (idSala, room, mensagem, token) => {
        let nome;
        let id;
        try {
            let tokenDecoded = await decodificarToken(token);
            nome = tokenDecoded.nome;
            id = tokenDecoded.id;

            servidorIo.to(room).emit('novaMensagem', { nome, texto: mensagem, token });
        }
        catch (error) {
            console.error(error);
        }

        try {
            const dtAgora = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');

            executar(`INSERT INTO Mensagem values (null,${id},${idSala},'${mensagem}','${dtAgora}')`);
        } catch (error) {
            console.error(error);
        }
    });

    // Evento para sair de uma sala
    socketUser.on('leaveRoom', (room) => {
        socketUser.leave(room);
        console.log(`Cliente saiu da sala: ${room}`);
    });
}
