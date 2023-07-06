import express from 'express';
import { Server } from 'socket.io';
import socketConfig from './src/utils/chatWebSocket.mjs';
import cors from 'cors';
import { setarOnline, desconectar } from './src/utils/chatWebSocket.mjs';
import { autenticarTokenUsuario } from './src/config/jwtConfig.mjs';

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

const ip = {
  local: 'localhost',
  redeSpTech: '10.18.7.53'
}

export const servidorIo = new Server(server, {
  cors: {
    origin: `http://${ip.local}:5173`,
  }
});


servidorIo.on('connection', async (socketUser) => {

  console.log('Novo usuário conectado:', socketUser.id);
  
  servidorIo.emit("onlineUsers", await setarOnline(socketUser));

  await socketConfig(socketUser);

  socketUser.on('disconnect', async () => {
    servidorIo.emit("onlineUsers", await desconectar(socketUser));
    console.log('Usuário desconectado:', socketUser.id);
  });
});