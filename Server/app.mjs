import express from 'express';
import { Server } from 'socket.io';
import socketConfig from './src/controllers/chatWebSocket.mjs';
import cors from 'cors';
import { setarOnline, desconectar } from './src/controllers/chatWebSocket.mjs';
import { configDotenv } from 'dotenv';
configDotenv();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

import { autenticarTokenUsuario } from './src/config/jwtConfig.mjs';
import chatRouter from './src/routes/chatRouter.mjs';
import userRouter from './src/routes/usuarioRouter.mjs';

app.use('/chat', autenticarTokenUsuario, chatRouter);
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

servidorIo.on('connection', async (socketUser) => {

  servidorIo.emit("onlineUsers", await setarOnline(socketUser));

  await socketConfig(socketUser);

  socketUser.on('disconnect', async () => {
    servidorIo.emit("onlineUsers", await desconectar(socketUser));
  });
});