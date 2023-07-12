import express from "express";
import * as controller from "../controllers/usuarioController.mjs";
import { upload } from "../utils/multerConfig.mjs";

const userRouter = express.Router()

userRouter.post("/", upload.single("perfilImage"), (req, res) => {
    controller.cadastrarUsuario(req, res);
});

userRouter.post("/login", (req, res) => {
    controller.verificarUsuario(req, res);
});

userRouter.get("/verificar/:nome", (req, res) => {
    controller.verificarNome(req, res);
});

userRouter.get("/imagem/:nomeImagem", (req, res) => {
    controller.buscarImagem(req, res);
})

export default userRouter;  