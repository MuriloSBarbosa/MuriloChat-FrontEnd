import express from "express";
import * as controller from "../controllers/usuarioController.mjs";

const userRouter = express.Router()

userRouter.post("/", (req, res) => {
    controller.cadastrarUsuario(req, res);
});

userRouter.post("/login", (req, res) => {
    controller.verificarUsuario(req, res);
});

userRouter.get("/verificar/:nome", (req, res) => {
    controller.verificarNome(req, res);
});

export default userRouter;  