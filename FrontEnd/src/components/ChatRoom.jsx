import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from "../config/ipConfig";
import styles from "./ChatRoom.module.css";
import moment from "moment-timezone"
import anexos from "../assets/anexos.png";
import { formatarDataChat } from '../utils/geral.mjs';
import AdicionarUsuario from './AdicionarUsuario';
import { ipUse } from '../config/ipConfig';

const ChatRoom = (props) => {
    const [idSala, setIdSala] = useState(props.salaConfig.id);
    const [room, setRoom] = useState(props.salaConfig.identificador);
    const socket = props.salaConfig.socket;
    const tokenUsuario = sessionStorage.getItem("token");

    const [usuarios, setUsuarios] = useState([]);
    const [colorsUsed, setColorsUsed] = useState([]);

    const [showAddUser, setShowAddUser] = useState(false);

    const [mensagemDigitada, setMensagemDigitada] = useState('');
    const [mensagens, setMensagens] = useState([]);
    const [usuarioAnterior, setUsuarioAnterior] = useState(null);

    const imagemSelecionada = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);

    const chatContainer = useRef(null);

    const [idsUsuariosOnline, setIdsUsuariosOnline] = useState({});


    useEffect(() => {
        carregarUsuarios();
        carregarMensagens();

        socket.emit('joinRoom', room);

    }, [room]);

    const carregarMensagens = () => {
        // Carregar mensagens anteriores
        axiosInstance.get("/chat/mensagem/" + idSala,
        ).then((res) => {
            res.data.forEach((msg) => {
                msg.dtMensagem = formatarDataChat(msg.dtMensagem);
            });
            setMensagens(res.data);
        }).catch((err) => {
            console.log(err);
        })
    }

    const carregarUsuarios = () => {
        // Load users in the room
        axiosInstance.get("/chat/usuario/" + idSala,
        ).then((res) => {
            const usuarios = res.data;
            setUsuarios(usuarios);

            atualizarCoresUsuarios();

        }).catch((err) => {
            console.log(err);
        });
    }

    // useEfect usuarios carrgarONline
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

        // Convert array to Set for faster lookup
        const idSockerOnlineSet = new Set(idUsuariosOnline);

        setIdsUsuariosOnline((idOnline) => {
            let idsOnline = { ...idOnline };

            // Set online users
            idSockerOnlineSet.forEach((userId) => {
                // no json, colocar [] é a mesma coisa que colocar ., mas pode ser usado quando o nome da propriedade tem espaço ou é um numero
                idsOnline[userId] = true;
            });

            // Set offline users
            for (let userId in idsOnline) {
                // Quando percorre um json com for in, o valor da variavel é a chave, ou seja, o atributo, que sempre é uma string
                if (!idSockerOnlineSet.has(parseInt(userId))) {
                    idsOnline[userId] = false;
                }
            }

            return idsOnline;
        });
    };



    const atualizarCoresUsuarios = () => {
        setUsuarios((anteriores) => {
            const usuariosAtualizados = anteriores.map((user) => {
                if (user.color) return user;
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

        axiosInstance.post(`/chat/mensagem/imagem/${idSala}`, formData, {
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

        if (colorsUsed.length == 0) {
            setColorsUsed([corSorteada]);
        }

        setColorsUsed((anteriores) => [...anteriores, corSorteada]);
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
                            <div className={styles.statusUser} style={{ backgroundColor: idsUsuariosOnline[user.id] ? "#00ff00" : "#e73f5d" }}></div>
                        </div>
                    ))}
                    <button className={styles.iconAddUser} onClick={() => setShowAddUser(true)}>+</button>
                </div>
            </div>

            <AdicionarUsuario idSala={idSala} showAddUser={showAddUser} setShowAddUser={setShowAddUser}
                carregarUsuarios={carregarUsuarios} />

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
                                <a href={`http://${ipUse}:8080/chat/imagem/${msg.srcImage}`}>
                                    <img src={`http://${ipUse}:8080/chat/imagem/${msg.srcImage}`} alt="imagem" />
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
