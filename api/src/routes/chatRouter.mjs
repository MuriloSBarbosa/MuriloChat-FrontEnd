import express from "express"
import * as controller from "../controllers/chatController.mjs"
import { upload } from "../utils/multerConfig.mjs";
import { autenticarTokenUsuario } from "../config/jwtConfig.mjs";

const chatRouter = express.Router();

chatRouter.post("/sala", autenticarTokenUsuario, (req, res) => {
    controller.criarSala(req, res);
});

chatRouter.get("/listar", autenticarTokenUsuario, (req, res) => {
    controller.listarChats(req, res);
});

chatRouter.get("/usuario/:idSala", autenticarTokenUsuario, (req, res) => {
    controller.verUsuariosDaSala(req, res);
});

chatRouter.post("/usuario", autenticarTokenUsuario, (req, res) => {
    controller.inserirUser(req, res);
});

chatRouter.get("/mensagem/:fkSala", autenticarTokenUsuario, (req, res) => {
    controller.listarMensagens(req, res);
});

chatRouter.post("/mensagem", autenticarTokenUsuario, (req, res) => {
    controller.inserirMensagem(req, res);
});

chatRouter.post("/mensagem/imagem/:fkSala", upload.single("chatImage"), autenticarTokenUsuario, (req, res) => {
    controller.inserirMensagemImagem(req, res);
})

chatRouter.get("/imagem/:nomeImagem", (req, res) => {
    controller.buscarImagem(req, res);
})

export default chatRouter;