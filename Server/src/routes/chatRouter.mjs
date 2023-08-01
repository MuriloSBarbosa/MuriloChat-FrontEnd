import express from "express"
import * as controller from "../controllers/chatController.mjs"
import { upload } from "../utils/multerConfig.mjs";
import { autenticarTokenUsuario } from "../config/jwtConfig.mjs";

const chatRouter = express.Router();

chatRouter.post("/sala", autenticarTokenUsuario, (req, res) => {
    controller.criarSala(req, res);
});

chatRouter.delete("/sala/sair", autenticarTokenUsuario, (req, res) => {
    controller.sairDaSala(req, res);
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

chatRouter.delete("/usuario", autenticarTokenUsuario, (req, res) => {
    controller.removerUsuario(req, res);
});

chatRouter.patch("/usuario", autenticarTokenUsuario, (req, res) => {
    controller.atualizarUsuario(req, res);
});

chatRouter.get("/mensagem/:fkSala", autenticarTokenUsuario, (req, res) => {
    controller.listarMensagens(req, res);
});

chatRouter.post("/mensagem/imagem/:fkSala", upload.single("chatImage"), autenticarTokenUsuario, (req, res) => {
    controller.inserirMensagemImagem(req, res);
})

chatRouter.get("/imagem/:nomeImagem", (req, res) => {
    controller.buscarImagem(req, res);
})

chatRouter.post("/mensagem/documento/:fkSala", upload.single("chatDoc"), autenticarTokenUsuario, (req, res) => {
    controller.inserirMensagemDoc(req, res);
})

chatRouter.get("/documento/:nomeDocumento", (req, res) => {
    controller.buscarDocumento(req, res);
})

export default chatRouter;