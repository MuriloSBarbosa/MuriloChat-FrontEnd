import express from 'express';
import { Server } from 'socket.io';
import socketConfig from './src/utils/chatWebSocket.mjs';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

import chatRouter from './src/routes/chatRouter.mjs';
import userRouter from './src/routes/usuarioRouter.mjs';

app.use('/chat', chatRouter);
app.use('/usuario', userRouter);

const port = 8080;
const server = app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});

export const servidorIo = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  }
});


servidorIo.on('connection', (socketUser) => {
  console.log('Novo usuário conectado:', socketUser.id);
  
  socketConfig(socketUser);

  socketUser.on('disconnect', () => {
    console.log('Usuário desconectado:', socketUser.id);
  });
});