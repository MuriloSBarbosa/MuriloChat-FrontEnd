import express from "express"
import * as controller from "../controllers/chatController.mjs"
import { upload } from "../utils/multerConfig.mjs";

const chatRouter = express.Router();

chatRouter.post("/sala", (req, res) => {
    controller.criarSala(req, res);
});

chatRouter.delete("/sala/sair", (req, res) => {
    controller.sairDaSala(req, res);
});

chatRouter.get("/listar", (req, res) => {
    controller.listarChats(req, res);
});

chatRouter.get("/usuario/:idSala", (req, res) => {
    controller.verUsuariosDaSala(req, res);
});

chatRouter.post("/usuario", (req, res) => {
    controller.inserirUser(req, res);
});

chatRouter.delete("/usuario", (req, res) => {
    controller.removerUsuario(req, res);
});

chatRouter.patch("/usuario", (req, res) => {
    controller.atualizarUsuario(req, res);
});

chatRouter.get("/mensagem/:fkSala", (req, res) => {
    controller.listarMensagens(req, res);
});

chatRouter.post("/mensagem/imagem/:fkSala", upload.single("chatImage"), (req, res) => {
    controller.inserirMensagemImagem(req, res);
})

chatRouter.get("/imagem/:nomeImagem", (req, res) => {
    controller.buscarImagem(req, res);
})

chatRouter.post("/mensagem/documento/:fkSala", upload.single("chatDoc"), (req, res) => {
    controller.inserirMensagemDoc(req, res);
})

chatRouter.get("/documento/:nomeDocumento", (req, res) => {
    controller.buscarDocumento(req, res);
})

export default chatRouter;