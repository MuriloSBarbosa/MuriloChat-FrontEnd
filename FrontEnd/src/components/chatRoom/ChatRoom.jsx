import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from "../../config/ipConfig";
import styles from "./ChatRoom.module.css";
import moment from "moment-timezone"
import anexos from "../../assets/anexos.png";
import { formatarDataChat } from '../../utils/geral.mjs';
import AdicionarUsuario from './AdicionarUsuario';
import { ipUse } from '../../config/ipConfig';
import Usuarios from './Usuarios';

const ChatRoom = (props) => {
    const [idSala, setIdSala] = useState(props.salaConfig.id);
    const [room, setRoom] = useState(props.salaConfig.identificador);
    const socket = props.salaConfig.socket;
    const tokenUsuario = sessionStorage.getItem("token");

    const [usuarios, setUsuarios] = useState([]);

    const [mensagemDigitada, setMensagemDigitada] = useState('');
    const [mensagens, setMensagens] = useState([]);
    const [perfilCache, setPerfilCache] = useState({});

    const [showImage, setShowImage] = useState(false);
    const [imagemClicada, setImagemClicada] = useState(false);

    const imagemSelecionada = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);

    const chatContainer = useRef(null);

    const [showRolar, setShowRolar] = useState(false);


    useEffect(() => {
        carregarUsuarios();
        carregarMensagens();

        chatContainer.current.addEventListener("scroll", verificarRolar);

        socket.emit('joinRoom', room);


        return () => {
            chatContainer.current.removeEventListener("scroll", verificarRolar);
        };

    }, [room]);

    const carregarMensagens = () => {
        axiosInstance.get("/chat/mensagem/" + idSala,
        ).then((res) => {
            res.data.forEach((msg) => {
                msg.dtMensagem = formatarDataChat(msg.dtMensagem);
            });

            setTimeout(() => {
                chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
            }, 100);
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

            let colorUsed = []

            usuarios.forEach((user) => {
                if (colorUsed.length == 7) {
                    colorUsed = [];
                }

                do {
                    user.color = ramdonColor();
                } while (colorUsed.includes(user.color));

                colorUsed.push(user.color);

                return user;
            });

            setUsuarios(usuarios);

        }).catch((err) => {
            console.log(err);
        });
    }

    useEffect(() => {
        socket.on('novaMensagem', novasMensagens);
        return () => {
            socket.off('novaMensagem');
        };
    }, [usuarios]);

    const novasMensagens = (novaMensagem) => {
        if (novaMensagem.token == tokenUsuario) {
            novaMensagem.isRemetente = true;
        }

        for (const user of usuarios) {
            if (novaMensagem.idColor == user.id) {
                novaMensagem.color = user.color;
                break;
            }
        }

        delete novaMensagem.token;

        novaMensagem.dtMensagem = formatarDataChat(novaMensagem.dtMensagem)

        setMensagens((anteriores) => [...anteriores, novaMensagem]);

    };

    useEffect(() => {
        for (const mensagem of mensagens) {
            for (const user of usuarios) {
                if (mensagem.idColor == user.id) {
                    mensagem.color = user.color;
                    break;
                }
            }

            if (!mensagem.perfilSrc) {
                mensagem.perfilSrc = "src/assets/default-avatar.jpg";
            } else {
                mensagem.perfilSrc = `http://${ipUse}:8080/usuario/imagem/${encodeURI(mensagem.perfilSrc)}`;
            }
        }

        setTimeout(() => {
            if (chatContainer.current.scrollTop + chatContainer.current.clientHeight >= chatContainer.current.scrollHeight * 0.96) {
                chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
            }

        }, 100);
    }, [mensagens]);

    const rolarParaBaixo = () => {
        chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }

    const verificarRolar = () => {
        const { scrollTop, clientHeight, scrollHeight } = chatContainer.current;

        if (scrollTop + clientHeight >= scrollHeight * 0.96) {
            setShowRolar(true);
        } else {
            setShowRolar(false);
        }
    };

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
        const colors = ["#ff5e00", "#1FD11F", "#0000ff", "#ff00d4", "#FF2D61", "#00a2ff", "#c30000"];
        const indexSorteado = Math.floor(Math.random() * colors.length);
        const corSorteada = colors[indexSorteado];

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

    const verificarExibicaoNome = (index, msg) => {
        if (index === 0 || msg.isRemetente) return null;

        if (!mensagens[index - 1].isAddUser) {
            if (msg.nome === mensagens[index - 1].nome) return null;
        }

        return (
            <div className={styles.userContent}>
                <img src={msg.perfilSrc} alt="Imagem de perfil" />
                {msg.nome}
            </div>
        );
    };


    const verImagem = (imagem) => {
        setImagemClicada(`http://${ipUse}:8080/chat/imagem/${imagem}`);
        setShowImage(true);
    }

    return (
        <div className={styles.chatRoom}>
            <Usuarios usuarios={usuarios} socket={socket} carregarUsuarios={carregarUsuarios} idSala={idSala} room={room} />

            <div className={styles.mensagens} ref={chatContainer}>
                {mensagens.map((msg, index) => (
                    <div className={styles.mensagemContent} key={index}>
                        {msg.isAddUser ? <div className={`${styles.mensagem} ${styles.isAddUser}`}><p>{msg.texto}</p></div> :
                            <div className={msg.isRemetente ? `${styles.mensagem} ${styles.remetente}` : styles.mensagem} >
                                <div className={styles.nomeUsuarioMsg} style={{ color: msg.color }}>
                                    {verificarExibicaoNome(index, msg)}
                                </div>
                                <div className={styles.textMsg}>
                                    {msg.texto && msg.texto}
                                    {msg.srcImage &&
                                        <button onClick={() => verImagem(msg.srcImage)}>
                                            <img src={`http://${ipUse}:8080/chat/imagem/${msg.srcImage}`} alt="imagem" />
                                        </button>
                                    }
                                    <span className={styles.dtMensagem}>{msg.dtMensagem}</span>
                                </div>
                            </div>
                        }
                    </div>
                ))}
                <button style={showRolar ? { display: "none" } : null} className={styles.rolar} onClick={rolarParaBaixo}>
                    {">"}
                </button>
            </div>

            {showImage &&
                <div className={styles.verImagem}>
                    <img src={imagemClicada} alt="" />
                    <button onClick={() => { setImagemClicada(null); setShowImage(false) }}>
                        X
                    </button>
                </div>
            }

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
