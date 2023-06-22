import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { ip } from '../config/ipConfig';
import axiosInstance from "../config/ipConfig";
import styles from "./ChatRoom.module.css";
import moment from "moment-timezone"

const ChatRoom = (props) => {
    const [idSala, setIdSala] = useState(props.salaConfig.id);
    const [room, setRoom] = useState(props.salaConfig.identificador);
    const [usuarios, setUsuarios] = useState([]);

    const tokenUsuario = sessionStorage.getItem("token");

    const [socket, setSocket] = useState(null);
    const [mensagemDigitada, setMensagemDigitada] = useState('');
    const [mensagens, setMensagens] = useState([]);

    const [addUserNome, setAddUserNome] = useState('');

    const chatContainer = useRef(null);

    useEffect(() => {

        // Carregar usuarios da sala 
        axiosInstance.get("/chat/usuario/" + idSala,
            {
                headers: {
                    "authorization": "Bearer " + tokenUsuario
                }
            }
        ).then((res) => {
            setUsuarios(res.data);
        }).catch((err) => {
            console.log(err);
        });

        console.log(usuarios);
        // Entrar no socket
        const newSocket = io(`http:${ip}//:8080`, {
            auth: { usuarios: usuarios, token: tokenUsuario }
        });

        //Setar o socket
        setSocket(newSocket);

        //Entrar na sala
        newSocket.emit('joinRoom', room);


        // Carregar mensagens anteriores
        axiosInstance.get("/chat/mensagem/" + idSala,
            {
                headers: {
                    "authorization": "Bearer " + tokenUsuario
                }
            }
        ).then((res) => {
            console.log(res.data);
            res.data.forEach((msg) => {
                msg.dtMensagem = formatarData(msg.dtMensagem);
            });
            setMensagens(res.data);
            chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
        }).catch((err) => {
            console.log(err);
        });

        return () => {
            // Quando sair da página, desconectar do socket
            newSocket.disconnect();
        };
    }, [room]);

    useEffect(() => {
        // Se não tiver socket, não faz nada
        if (!socket) return;

        // Adicionar a nova mensagem no array de mensagens
        const novasMensagens = (novaMensagem) => {
            if (novaMensagem.token == tokenUsuario) {
                novaMensagem.isRemetente = true;
            }
            delete novaMensagem.token;

            novaMensagem.dtMensagem = formatarData(novaMensagem.dtMensagem);

            setMensagens((anteriores) => [...anteriores, novaMensagem]);
            setTimeout(() => {
                chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
            }, 10);
        };

        // Ouvir o evento 'newMessage'
        socket.on('novaMensagem', novasMensagens);

        // Ouvir o evento onlineUsers
        socket.on('onlineUsers', (usuarios) => {
            setUsuarios(usuarios);
        });

        return () => {
            // Parar de ouvir o evento 'newMessage'
            socket.off('novaMensagem', novasMensagens);
        };
    }, [socket]);

    function formatarData(data) {
        let dtMensagem = moment(data).tz("America/Sao_Paulo").format("DD/MM/YYYY");

        if (moment().tz("America/Sao_Paulo").format("DD/MM/YYYY") == dtMensagem) {
            dtMensagem = "Hoje, às " + moment(data).tz("America/Sao_Paulo").format("HH:mm");
        } else {
            dtMensagem = moment(data).tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm");
        }

        return dtMensagem;
    }

    function enviarMensagem(e) {
        if (e.key !== 'Enter' && e.type != "click") return;
        if (mensagemDigitada == "") return;
        mensagemDigitada.trim();
        socket.emit('enviarMensagem', idSala, room, mensagemDigitada, tokenUsuario);
        setMensagemDigitada('');
    };

    function verificarUser() {
        const nomeCodificado = encodeURIComponent(addUserNome);
        axiosInstance.get(`/usuario/verificar/${nomeCodificado}`)
            .then((res) => {
                if (res.data) {
                    const id = Number(addUserNome.split(" ")[1].replaceAll("#", ""));

                    addUser(id);
                } else {
                    alert("Usuário não encontrado");
                }
            }).catch((err) => {
                console.log(err);
            });
    }

    function addUser(idUser) {
        console.log(idUser);
        axiosInstance.post("/chat/usuario",
            {
                idUser,
                idSala: idSala
            },
            {
                headers: {
                    "authorization": "Bearer " + tokenUsuario
                }
            })
            .then((res) => {
                alert("Usuário adicionado com sucesso");
            })
            .catch((err) => {
                console.log(err);
            });
    }


    return (
        <div className={styles.chatRoom}>
            <div className={styles.header}>
                <h1>{props.salaConfig.nome}</h1>
            </div>

            <div className={styles.mensagens} ref={chatContainer}>
                {mensagens.map((msg, index) => (
                    <div className={msg.isRemetente ? `${styles.mensagem}, ${styles.remetente}` : styles.mensagem} key={index}>
                        <div className={styles.nomeUsuarioMsg}>{!msg.isRemetente && msg.nome} <span className={styles.dtMensagem}>{msg.dtMensagem}</span></div>
                        <div className={styles.textMsg}>{msg.texto}</div>
                    </div>
                ))}
            </div>

            <div className={styles.listaUser}>

            </div>

            <div className={styles.sendBox}>
                <input type="text" value={mensagemDigitada} onChange={(e) => setMensagemDigitada(e.target.value)} placeholder="Digite sua mensagem"
                    onKeyDown={(e) => { enviarMensagem(e) }} />
                <button onClick={(e) => { enviarMensagem(e) }}>Enviar</button>
            </div>

            <div className={styles.addUser} style={{ display: "none" }}>
                <h2>Adicionar usuario ao chat</h2>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label>Nome</label>
                    <input type="text" value={addUserNome} onChange={(e) => setAddUserNome(e.target.value)} />
                    <button onClick={verificarUser}>Adicionar</button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
