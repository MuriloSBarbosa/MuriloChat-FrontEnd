import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/ipConfig";
import styles from "./Salas.module.css";
import AdicionarSala from "../components/AdicionarSala";
import ChatRoom from "../components/ChatRoom";
import io from 'socket.io-client';
import { ipUse } from '../config/ipConfig';


function Salas() {
    const navigator = useNavigate();
    const [salas, setSalas] = useState([]);
    const [token, setToken] = useState(sessionStorage.getItem("token"));
    const [nome, setNome] = useState("");
    const [identificador, setDescricao] = useState("");
    const [senha, setSenha] = useState("");
    const [salaConfig, setSalaConfig] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        axiosInstance.get("/chat/listar")
            .then((res) => {
                setSalas(res.data);
            }).catch((err) => {
                console.log(err);
            });

        // Entrar no socket
        const socket = io(`http://${ipUse}:8080`, {
            auth: { token: token }
        });

        setSocket(socket);

        return () => {
            socket.disconnect();
        };
    }, []);

    function adicionarSala() {
        axiosInstance.post("/chat/sala",
            {
                nome: nome,
                identificador: identificador,
                senha: senha
            })
            .then((res) => {
                console.log(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function irParaSala(id, identificador, nome) {
        setSalaConfig({
            id: id,
            identificador: identificador,
            nome: nome,
            socket: socket
        });
    }

    return (
        <>
            {token ?
                <div className={styles.salas}>
                    <div className={styles.contentListaSalas}>
                        <h1>Lista de Salas</h1>
                        <div className={styles.listaSalas}>
                            {salas.map((sala, index) => (
                                <div className={styles.itemSala} onClick={() => { irParaSala(sala.id, sala.identificador, sala.nome) }} key={index}>{sala.nome}</div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.linhaVertical}></div>
                    <div className={styles.chat}>
                        {salaConfig ? <ChatRoom salaConfig={salaConfig} /> : "Selecione uma sala"}
                    </div>
                </div>

                :
                <div>Você não está logado</div>}
        </>
    )
}

export default Salas