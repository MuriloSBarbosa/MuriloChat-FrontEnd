import express from "express"
import * as controller from "../controllers/chatController.mjs"
import { autenticarTokenUsuario } from "../config/jwtConfig.mjs";
import { upload } from "../utils/multerConfig.mjs";

const chatRouter = express.Router();

chatRouter.post("/sala", autenticarTokenUsuario, (req, res) => {
    controller.criarSala(req, res);
});

chatRouter.get("/listar", autenticarTokenUsuario, (req, res) => {
    controller.listarChats(req, res);
});

chatRouter.get("/usuario/:idSala", (req, res) => {
    controller.verUsuariosDaSala(req, res);
});

chatRouter.post("/usuario", (req, res) => {
    controller.inserirUser(req, res);
});

chatRouter.get("/mensagem/:fkSala", autenticarTokenUsuario, (req, res) => {
    controller.listarMensagens(req, res);
});

chatRouter.post("/mensagem", (req, res) => {
    controller.inserirMensagem(req, res);
});

chatRouter.post("/mensagem/imagem/:fkSala", autenticarTokenUsuario, upload.single("chatImage"), (req, res) => {
    controller.inserirMensagemImagem(req, res);
})

export default chatRouter;
