import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/ipConfig";
import styles from "./Salas.module.css";
import ChatContent from "../components/chatRoom/ChatContent";
import io from 'socket.io-client';
import { ipUse } from '../config/ipConfig';
import configPng from '../assets/config.png';
import Deslogar from "../components/Deslogar";
import AdicionarSala from "../components/Salas/AdicionarSala";

function Salas() {
    const [salas, setSalas] = useState([]);
    const [salasFiltro, setSalasFiltro] = useState([]);
    const [token, setToken] = useState(sessionStorage.getItem("token"));
    const [usuarioId, setUsuarioId] = useState("");
    const [salaConfig, setSalaConfig] = useState(null);
    const [socket, setSocket] = useState(null);
    const [showAddSala, setShowAddSala] = useState(false);

    const navigate = useNavigate();


    useEffect(() => {
        if (!token) {
            navigate("/");
        }

        listarSalas();

        // Entrar no socket
        const socket = io(`http://${ipUse}:8080`, {
            auth: { token: token }
        });

        setSocket(socket);

        axiosInstance.get('/usuario/config/')
            .then((response) => {
                setUsuarioId(response.data.id);
            }).catch((error) => {
                console.log(error);
            });

        return () => {
            socket.disconnect();
        };
    }, []);

    const listarSalas = () => {
        axiosInstance.get("/chat/listar")
            .then((res) => {
                setSalas(res.data);
                setSalasFiltro(res.data);
            }).catch((err) => {
                console.log(err);
            });
    }

    const irParaSala = (id, identificador, nome, index) => {
        setSalaConfig({
            id: id,
            identificador: identificador,
            nome: nome,
            socket: socket
        });

        salas.map((sala) => {
            sala.selecionada = false;
        });

        salasFiltro.map((sala) => {
            sala.selecionada = false;
        });

        salasFiltro[index].selecionada = true;

    }

    const pesquisarSala = (nome) => {
        if (nome === "" || !nome) {
            setSalasFiltro(salas);
        }

        setSalasFiltro(salas.filter((sala) => sala.nome.toLowerCase().includes(nome.toLowerCase())));
    }

    useEffect(() => {
        if (socket == null) return;

        socket.on("atualizarSalas", (dados) => {

            listarSalas();

            console.log(usuarioId == dados.idUsuario);
            console.log(dados.idSala);

            if (usuarioId != dados.idUsuario) return;
            console.log("passou");

            if (salaConfig.id == dados.idSala) {
                navigate(0);
            }

        });
    }), [salas, socket]


    return (
        <>
            <div className={styles.salas}>
                <div className={styles.contentListaSalas}>
                    <button className={styles.config} onClick={() => navigate("/perfil")}>
                        <img src={configPng} alt="Configurações" />
                    </button>

                    <Deslogar styles={styles} />

                    <div className={styles.title}>
                        <h1>Lista de Salas</h1>
                        <button className={styles.adicionarSala} onClick={() => setShowAddSala(true)}>
                            <p>+</p>
                        </button>
                    </div>
                    {showAddSala && <AdicionarSala setShowAddSala={setShowAddSala} socket={socket} listarSalas={listarSalas} setSalaConfig={setSalaConfig} />}

                    <div className={styles.pesquisar}>
                        <input type="text" placeholder="Pesquisar sala" onChange={(e) => pesquisarSala(e.target.value)} />
                    </div>

                    <div className={styles.listaSalas}>
                        {salasFiltro.map((sala, index) => (
                            <div className={`${styles.itemSala} ${sala.selecionada ? styles.selecionada : null}`} onClick={() => { irParaSala(sala.id, sala.identificador, sala.nome, index) }} key={index}>{sala.nome}</div>
                        ))}
                    </div>
                </div>
                <div className={styles.linhaVertical}></div>
                <div className={styles.chat}>
                    {salaConfig ? <ChatContent salaConfig={salaConfig} listarSalas={listarSalas} /> :
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