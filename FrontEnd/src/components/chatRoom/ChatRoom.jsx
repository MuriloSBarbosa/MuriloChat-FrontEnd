import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from "../../config/ipConfig";
import styles from "./ChatRoom.module.css";
import moment from "moment-timezone"
import anexos from "../../assets/anexos.png";
import { formatarDataChat } from '../../utils/geral.mjs';
import { ipUse } from '../../config/ipConfig';
import Usuarios from './Usuarios';
import Resizer from 'react-image-file-resizer';
import arrow from "../../assets/arrow.png";
import WallpaperImage from "../../assets/wallpaper-default.jpg";

const ChatRoom = (props) => {
    const [idSala, setIdSala] = useState(props.salaConfig.id);
    const [room, setRoom] = useState(props.salaConfig.identificador);
    const [socket, setSocket] = useState(props.salaConfig.socket);
    const tokenUsuario = sessionStorage.getItem("token");

    const [usuarios, setUsuarios] = useState([]);

    const [mensagemDigitada, setMensagemDigitada] = useState('');
    const [mensagens, setMensagens] = useState([]);

    const [showImage, setShowImage] = useState(false);
    const [imagemClicada, setImagemClicada] = useState(false);

    const imagemSelecionada = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);

    const chatContainer = useRef(null);
    const chatBg = useRef(null);

    const [showRolar, setShowRolar] = useState(false);

    useEffect(() => {
        setIdSala(props.salaConfig.id);
        setRoom(props.salaConfig.identificador);
    }, [props.salaConfig]);


    useEffect(() => {
        carregarUsuarios();
        buscarWallpaper();

        chatContainer.current.addEventListener("scroll", verificarRolar);

        socket.emit('joinRoom', room);

    }, [room]);

    const buscarWallpaper = () => {
        axiosInstance.get('/usuario/wallpaper',)
            .then((response) => {
                let wallpaperSrc = response.data.wallpaper;
                let luminosidade = response.data.luminosidade;
                if (wallpaperSrc) {
                    wallpaperSrc = `http://${ipUse}:8080/usuario/wallpaper/${encodeURI(wallpaperSrc)}`;
                    chatBg.current.src = wallpaperSrc;
                } else {
                    chatBg.current.src = WallpaperImage;
                }
                chatBg.current.style.filter = `brightness(${luminosidade}%)`;
            }).catch((error) => {
                console.log(error);
            });
    }

    const carregarUsuarios = () => {
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

    const carregarMensagens = () => {
        axiosInstance.get("/chat/mensagem/" + idSala,
        ).then((res) => {
            res.data.forEach((msg) => {
                msg = formatarMensagens(msg);
            });

            setTimeout(() => {
                chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
            }, 100);
            setMensagens(res.data);
        }).catch((err) => {
            console.log(err);
        })
    }

    useEffect(() => {
        socket.on('novaMensagem', novasMensagens);
        carregarMensagens();
        return () => {
            socket.off('novaMensagem');
        };
    }, [usuarios]);

    const novasMensagens = (novaMensagem) => {
        if (novaMensagem.token == tokenUsuario) {
            novaMensagem.isRemetente = true;
        }
        delete novaMensagem.token;

        novaMensagem = formatarMensagens(novaMensagem);

        setMensagens((anteriores) => [...anteriores, novaMensagem]);

    };

    const formatarMensagens = (mensagem) => {
        for (const user of usuarios) {
            if (mensagem.idColor == user.id) {
                mensagem.color = user.color;
                break;
            }
        }

        if (!mensagem.perfilSrc) {
            mensagem.perfilSrc = "src/assets/default-avatar.jpg";
        } else if (mensagem.perfilSrc) {
            mensagem.perfilSrc = `http://${ipUse}:8080/usuario/imagem/${encodeURI(mensagem.perfilSrc)}`;
        }

        mensagem.dtMensagem = formatarDataChat(mensagem.dtMensagem)

        return mensagem;
    }

    useEffect(() => {
        setTimeout(() => {

            if (verificarScroll()) {
                chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
            }

        }, 200);
    }, [mensagens]);

    const rolarParaBaixo = () => {
        chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }

    const verificarScroll = () => {
        const { scrollTop, clientHeight, scrollHeight } = chatContainer.current;
        if (scrollTop + clientHeight >= scrollHeight - 150) {
            return true;
        }
        return false;
    }
    const verificarRolar = () => {

        if (verificarScroll()) {
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
            room: encodeURI(room),
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

        Resizer.imageFileResizer(
            file,
            800, // Largura máxima desejada
            800, // Altura máxima desejada
            'JPEG', // Formato da imagem de saída (pode ser 'JPEG', 'PNG', 'WEBP', etc.)
            70, // Qualidade da imagem (0-100)
            0, // Rotação da imagem (em graus, 0 = sem rotação)
            (blob) => {
                // O redimensionamento e compressão foram concluídos, o blob contém a nova imagem
                formData.append('chatImage', blob);
                console.log(room);
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
            },
            'blob' // Tipo de saída, 'blob' retorna um objeto Blob
        );
    };

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
            Resizer.imageFileResizer(
                image,
                800, // Largura máxima desejada
                800, // Altura máxima desejada
                'JPEG', // Formato da imagem de saída (pode ser 'JPEG', 'PNG', 'WEBP', etc.)
                70, // Qualidade da imagem (0-100)
                0, // Rotação da imagem (em graus, 0 = sem rotação)
                (resizedImage) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setPreviewImage(reader.result);
                    };
                    reader.readAsDataURL(resizedImage);
                },
                'blob' // Tipo de saída, 'blob' retorna um objeto Blob
            );
        } catch (err) {
            alert("Erro ao carregar imagem");
        }
    };

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

            <img ref={chatBg} className={styles.chatBg} alt="" />
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
                    <img src={arrow} alt="" />
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
