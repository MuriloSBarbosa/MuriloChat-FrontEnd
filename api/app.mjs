import express from 'express';
import { Server } from 'socket.io';
import socketConfig from './src/utils/chatWebSocket.mjs';
import cors from 'cors';
import { setarOnline, desconectar } from './src/utils/chatWebSocket.mjs';
import { autenticarTokenUsuario } from './src/config/jwtConfig.mjs';
import { configDotenv } from 'dotenv';
configDotenv();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

import chatRouter from './src/routes/chatRouter.mjs';
import userRouter from './src/routes/usuarioRouter.mjs';

app.use('/chat', chatRouter);
app.use('/usuario', userRouter);

const port = 8080;
const server = app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});

const ip = process.env.IP_ADDRESS;

export const servidorIo = new Server(server, {
  cors: {
    origin: `http://${ip}:5173`,
  }
});

const socket = [20, 23];

const json = {
  20: true,
  23: true
}

json["s"] = "Teste2";
json[4] = "Teste3";

for (const js in json) {
  console.log("aqui");
  console.log(js);
}

console.log(json);

servidorIo.on('connection', async (socketUser) => {

  console.log('Novo usuário conectado:', socketUser.id);

  servidorIo.emit("onlineUsers", await setarOnline(socketUser));

  await socketConfig(socketUser);

  socketUser.on('disconnect', async () => {
    servidorIo.emit("onlineUsers", await desconectar(socketUser));
    console.log('Usuário desconectado:', socketUser.id);
  });
});