import { servidorIo } from "../../app.mjs"
import * as modelChat from "../models/chatModel.mjs";
import { decodificarToken } from "../config/jwtConfig.mjs";
import moment from "moment-timezone";

const onlineUsers = [];

export default async function socketConfig(socketUser) {

    // Evento para entrar em uma sala
    socketUser.on('joinRoom', (room) => {
        socketUser.join(room);
        console.log("joinRoom");
        console.log(`Cliente ${socketUser.id} entrou na sala: ${room}`);
        servidorIo.emit("onlineUsers", mapearId(onlineUsers))
    });

    socketUser.on('carregarOnline', () => {
        console.log("carregarOnline");
        servidorIo.emit("onlineUsers", mapearId(onlineUsers))
    });

    socketUser.on('enviarMensagem', (mensagem) => {
        enviarMensagem(mensagem);
    });

    socketUser.on('leaveRoom', (room) => {
        socketUser.leave(room);
        console.log(`Cliente saiu da sala: ${room}`);
    });
}

async function enviarMensagem(mensagem) {
    const {
        idSala,
        room,
        mensagemDigitada,
        tokenUsuario
    } = mensagem;

    try {
        let tokenDecoded = await decodificarToken(tokenUsuario);
        const idUsuario = tokenDecoded.id;
        const nome = tokenDecoded.nome;
        const perfilSrc = tokenDecoded.perfilSrc;

        servidorIo.to(room).emit('novaMensagem', { nome, texto: mensagemDigitada, token: tokenUsuario, idColor: idUsuario, perfilSrc });

        const dtAgora = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');

        await modelChat.inserirMensagem(idUsuario, idSala, mensagemDigitada, dtAgora);

    }
    catch (error) {
        console.error(error);
    }
}

export async function setarOnline(socketUser) {
    try {
        const tokenDecoded = await decodificarToken(socketUser.handshake.auth.token);

        // Usuarios online
        if (onlineUsers.length == 0) {
            onlineUsers.push({ idUser: tokenDecoded.id, idSocket: socketUser.id });
        }

        const hasUser = onlineUsers.some(user => user.idUser == tokenDecoded.id);

        if (!hasUser) {
            onlineUsers.push({ idUser: tokenDecoded.id, idSocket: socketUser.id });
        }

        console.log("Usuários online:", onlineUsers);

    } catch (error) {
        console.error(error);
    }

    return mapearId(onlineUsers);

}

function mapearId(onlineUsers) {
    const onlineUsersId = onlineUsers.map(user => user.idUser);
    return onlineUsersId;
}

export async function desconectar(socketUser) {
    try {
        const tokenDecoded = await decodificarToken(socketUser.handshake.auth.token);

        const index = onlineUsers.findIndex(user => user.idUser === tokenDecoded.id);
        if (index !== -1) {
            onlineUsers.splice(index, 1);
        }

        console.log("Usuários online:", onlineUsers);
    } catch (error) {
        console.error(error);
    }

    const onlineUsersId = onlineUsers.map(user => user.idUser);
    return onlineUsersId;
}