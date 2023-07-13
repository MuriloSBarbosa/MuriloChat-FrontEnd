import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/ipConfig";
import styles from "./Salas.module.css";
import ChatRoom from "../components/chatRoom/ChatRoom";
import io from 'socket.io-client';
import { ipUse } from '../config/ipConfig';
import configPng from '../assets/config.png';
import Deslogar from "../components/Deslogar";

function Salas() {
    const [salas, setSalas] = useState([]);
    const [token, setToken] = useState(sessionStorage.getItem("token"));
    const [salaConfig, setSalaConfig] = useState(null);
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        if (!token) {
            navigate("/");
        }

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

    function irParaSala(id, identificador, nome, index) {
        setSalaConfig({
            id: id,
            identificador: identificador,
            nome: nome,
            socket: socket
        });

        salas.map((sala) => {
            sala.selecionada = false;
        });

        salas[index].selecionada = true;

    }

    return (
        <>
            <div className={styles.salas}>
                <div className={styles.contentListaSalas}>
                    <button className={styles.config} onClick={() => navigate("/perfil")}>
                        <img src={configPng} alt="Configurações" />
                    </button>

                    <Deslogar styles={styles} />

                    <h1>Lista de Salas</h1>
                    <div className={styles.listaSalas}>
                        {salas.map((sala, index) => (
                            <div className={`${styles.itemSala} ${sala.selecionada ? styles.selecionada : null}`} onClick={() => { irParaSala(sala.id, sala.identificador, sala.nome, index) }} key={index}>{sala.nome}</div>
                        ))}
                    </div>
                </div>
                <div className={styles.linhaVertical}></div>
                <div className={styles.chat}>
                    {salaConfig ? <ChatRoom salaConfig={salaConfig} /> :
                        <div className={styles.bemvindo}>
                            <h1>Bem-vindo(a) ao <span className={styles.logo}>Murilo<span>Chat!</span></span></h1>
                            <p>Selecione uma sala para começar a conversar</p>
                        </div>
                    }
                </div>
            </div >
        </>
    )
}

export default Salas