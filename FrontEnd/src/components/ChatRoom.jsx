import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from "../config/ipConfig";
import styles from "./ChatRoom.module.css";
import moment from "moment-timezone"
import anexos from "../assets/anexos.png";
import { formatarDataChat } from '../utils/geral.mjs';

const ChatRoom = (props) => {
    const [idSala, setIdSala] = useState(props.salaConfig.id);
    const [room, setRoom] = useState(props.salaConfig.identificador);
    const socket = props.salaConfig.socket;

    const [usuarios, setUsuarios] = useState([]);
    const [usuariosCarregados, setUsuariosCarregados] = useState(false);
    const [colorsUsed, setColorsUsed] = useState([]);

    const tokenUsuario = sessionStorage.getItem("token");

    const [mensagemDigitada, setMensagemDigitada] = useState('');
    const [mensagens, setMensagens] = useState([]);
    const imagemSelecionada = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);

    const chatContainer = useRef(null);

    useEffect(() => {

        // Carregar usuarios da sala 
        axiosInstance.get("/chat/usuario/" + idSala,
        ).then((res) => {
            setUsuarios(res.data);
            atualizarCoresUsuarios();
            setTimeout(() => {
                setUsuariosCarregados(true);
            }, 100);
        }).catch((err) => {
            console.log(err);
        });


        // Carregar mensagens anteriores
        axiosInstance.get("/chat/mensagem/" + idSala,
        ).then((res) => {
            res.data.forEach((msg) => {
                msg.dtMensagem = formatarDataChat(msg.dtMensagem);
            });
            setMensagens(res.data);
        }).catch((err) => {
            console.log(err);
        });

        socket.emit('joinRoom', room);

    }, [room]);

    useEffect(() => {
        // Se não tiver socket, não faz nada
        if (!socket) return;

        //Entrar na sala
        socket.on('novaMensagem', novasMensagens);
        socket.on('onlineUsers', usuariosOnline);

        return () => {
            // Quando o componente for desmontado, remover os listeners
            socket.off('novaMensagem');
            socket.off('onlineUsers');
        };
    }, [socket]);

    const novasMensagens = (novaMensagem) => {
        if (novaMensagem.token == tokenUsuario) {
            novaMensagem.isRemetente = true;
        }
        delete novaMensagem.token;

        novaMensagem.dtMensagem = formatarDataChat(novaMensagem.dtMensagem);

        setMensagens((anteriores) => [...anteriores, novaMensagem]);
    };

    useEffect(() => {
        for (const mensagem of mensagens) {
            for (const user of usuarios) {
                if (mensagem.idColor == user.id) {
                    mensagem.color = user.color;
                }
            }
        }

        setTimeout(() => {
            chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
        }, 100);
    }, [mensagens]);


    const usuariosOnline = (idUsuariosOnline) => {
        setUsuarios((anteriores) => {
            const usuariosAtualizados = anteriores.map((user) => {
                if (idUsuariosOnline.includes(user.id)) {
                    user.isOnline = true;
                } else {
                    user.isOnline = false;
                }
                return user;
            });
            return usuariosAtualizados;
        });
    }

    useEffect(() => {
        if (!socket) return;

        socket.emit('carregarOnline');

        console.log(usuarios);

    }, [usuariosCarregados]);

    const atualizarCoresUsuarios = () => {
        setUsuarios((anteriores) => {
            const usuariosAtualizados = anteriores.map((user) => {
                user.color = ramdonColor();
                return user;
            });
            return usuariosAtualizados;
        });
    }

    const enviarMensagem = (e) => {
        if (e.key !== 'Enter' && e.type != "click") return;

        if (mensagemDigitada == "") return;

        mensagemDigitada.trim();

        const mensagem = {
            idSala,
            room,
            mensagemDigitada,
            tokenUsuario
        }

        socket.emit('enviarMensagem', mensagem);

        setMensagemDigitada('');
    };

    const enviarImagem = () => {
        const file = imagemSelecionada.current.files[0];

        if (!file) return;

        imagemSelecionada.current.value = "";

        const formData = new FormData();
        const dtMensagem = moment().tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss");

        formData.append('chatImage', file);
        formData.append("room", room);
        formData.append("dtMensagem", dtMensagem);

        axiosInstance.post(`http://localhost:8080/chat/mensagem/imagem/${idSala}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }).then((res) => {
            cancelarImagem();
        }).catch((err) => {
            console.log(err);
        });

    }

    const ramdonColor = () => {
        const colors = ["#ff5e00", "#189c18", "#0000ff", "#ff00d4", "#ff00ff", "#00a2ff", "#c30000"];
        const indexSorteado = Math.floor(Math.random() * colors.length);
        const corSorteada = colors[indexSorteado];

        if (colorsUsed.length == colors.length) {
            setColorsUsed([]);
        }

        if (colorsUsed.includes(corSorteada)) {
            return ramdonColor();
        }

        return corSorteada;
    }

    const inserirImagem = () => {
        const [image] = imagemSelecionada.current.files;

        if (!image) return;

        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(image);
        } catch (err) {
            alert("Erro ao carregar imagem");
        }
    }

    const cancelarImagem = () => {
        setPreviewImage(null);
        imagemSelecionada.current.value = "";
    }

    return (
        <div className={styles.chatRoom}>
            <div className={styles.usuarios}>
                <div className={styles.listaUser}>
                    {usuarios.map((user, index) => (
                        <div className={styles.user} key={index}>
                            <div className={styles.nomeUser}>{user.nome}</div>
                            {console.log(usuarios)}
                            <div className={styles.statusUser} style={{ backgroundColor: user.isOnline ? "#00ff00" : "#e73f5d" }}></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.mensagens} ref={chatContainer}>
                {mensagens.map((msg, index) => (
                    <div className={msg.isRemetente ? `${styles.mensagem} ${styles.remetente}` : styles.mensagem} key={index}>
                        <div className={styles.nomeUsuarioMsg} style={{ color: msg.color }}>
                            {!msg.isRemetente && msg.nome}
                            <span className={styles.dtMensagem}>{msg.dtMensagem}</span>
                        </div>
                        <div className={styles.textMsg}>
                            {msg.texto && msg.texto}
                            {msg.srcImage &&
                                <a href={`http://localhost:8080/chat/imagem/${msg.srcImage}`}>
                                    <img src={`http://localhost:8080/chat/imagem/${msg.srcImage}`} alt="imagem" />
                                </a>
                            }
                        </div>
                    </div>
                ))}
            </div>

            {previewImage &&
                <div className={styles.preview}>
                    {previewImage ? <img src={previewImage} alt="preview" /> : null}
                    <div className={styles.buttons}>
                        <button onClick={cancelarImagem} className={styles.cancelarImg}>Cancelar</button>
                        <button onClick={enviarImagem}>Enviar Imagem</button>
                    </div>
                </div>
            }

            <div className={styles.sendBox}>
                <div className={styles.anexos}>
                    <label htmlFor="image">
                        <img src={anexos} alt="clip" />
                    </label>
                    <input type="file" id='image' accept="image/*" ref={imagemSelecionada} onChange={inserirImagem} />
                </div>
                <input type="text" value={mensagemDigitada} onChange={(e) => setMensagemDigitada(e.target.value)} placeholder="Digite sua mensagem"
                    onKeyDown={(e) => { enviarMensagem(e) }} />
                <button onClick={(e) => { enviarMensagem(e) }}>Enviar</button>
            </div>

        </div>
    );
};

export default ChatRoom;
