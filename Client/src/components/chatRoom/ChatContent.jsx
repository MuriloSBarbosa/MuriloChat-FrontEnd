
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import axiosInstance from "../../config/ipConfig";
import styles from "./ChatContent.module.css";
import Header from './Header';
import ChatMessage from './ChatMessage';
import ChatSendBox from './ChatSendBox';
import { formatarDataChat } from '../../utils/geral.mjs';
import { ipUse } from '../../config/ipConfig';
import Usuarios from './Usuarios';
import arrow from "../../assets/arrow.png";
import WallpaperImage from "../../assets/wallpaper-default.jpg";
import defaultAvatar from "../../assets/default-avatar.jpg";

const ChatContent = (props) => {
    const [idSala, setIdSala] = useState(props.salaConfig.id);
    const [room, setRoom] = useState(props.salaConfig.identificador);
    const tokenUsuario = sessionStorage.getItem("token");
    const socket = props.salaConfig.socket;

    const [isAdmin, setIsAdmin] = useState(false);

    const [usuarios, setUsuarios] = useState([]);
    const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(true);

    const [mensagens, setMensagens] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);

    const [skip, setSkip] = useState(0);
    const [oldScrollHeight, setOldScrollHeight] = useState(0);

    const [showImage, setShowImage] = useState(false);
    const [imagemClicada, setImagemClicada] = useState(false);


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

        const currentChatContainer = chatContainer.current;


        currentChatContainer.addEventListener("scroll", verificarRolar);

        socket.emit('joinRoom', room);

        return () => {
            props.setShowModal(false);
            props.setIsRemovido(false);
        }

    }, []);


    useEffect(() => {
        if (isLoadingMessages) return;

        chatContainer.current.style.opacity = 1;
        chatContainer.current.style.scrollBehavior = "smooth";
    }, [isLoadingMessages]);

    const buscarWallpaper = () => {
        axiosInstance.get('/usuario/wallpaper',
            {
                responseType: 'blob'
            })
            .then((response) => {
                // let luminosidade = response.data.luminosidade;

                if (response.status == 200) {
                    const wallpaperSrc = URL.createObjectURL(response.data);
                    chatBg.current.src = wallpaperSrc;
                } else {
                    chatBg.current.src = WallpaperImage;
                }

                axiosInstance.get('/usuario/config')
                    .then((res) => {
                        const config = res.data;
                        const luminosidade = config.wallpaperLuminosidade;
                        chatBg.current.style.filter = `brightness(${luminosidade}%)`;
                    }).catch((err) => {
                        console.log(err);
                    });
            }).catch((error) => {
                console.log(error);
            });
    }

    const carregarUsuarios = () => {
        axiosInstance.get("/chat/usuario/" + idSala)
            .then(async (res) => {
                const usuarios = res.data.usuarios;
                setIsAdmin(res.data.isAdmin);

                let colorUsed = []

                const updatedUsuarios = await Promise.all(usuarios.map(async (user) => {
                    if (colorUsed.length === 7) {
                        colorUsed = [];
                    }

                    user.perfilSrc = await carregarPerfilSrc(user.perfilSrc);

                    do {
                        user.color = ramdonColor();
                    } while (colorUsed.includes(user.color));

                    colorUsed.push(user.color);

                    return user;
                }));

                setIsLoadingUsuarios(false);
                setUsuarios(updatedUsuarios);


            }).catch((err) => {
                console.log(err);
            });
    }

    const carregarPerfilSrc = async (perfilSrc) => {

        if (!perfilSrc) return defaultAvatar;

        return axiosInstance.get(`/usuario/imagem/${encodeURI(perfilSrc)}`, {
            responseType: 'blob'
        })
            .then((response) => {
                const file = new Blob([response.data], { type: response.data.type });
                const fileURL = URL.createObjectURL(file);
                return fileURL;
            })
            .catch((error) => {
                console.log(error);
            });
    }


    const carregarMensagens = () => {

        const currentScrollHeight = chatContainer.current.scrollHeight;

        setOldScrollHeight(currentScrollHeight);

        chatContainer.current.style.scrollBehavior = "auto";

        axiosInstance.get(`/chat/mensagem/${idSala}?skip=${skip}&limit=100`)
            .then((res) => {

                const mensagens = res.data;

                const newMessages = mensagens.map(msg => formatarMensagens(msg)).reverse();

                setMensagens((anteriores) => [...newMessages, ...anteriores]);

                setIsLoadingMessages(false);

                setSkip(oldSkip => oldSkip + 100);

            }).catch((err) => {
                console.log(err);
            })
    }

    useEffect(() => {
        if (skip == 0) return;

        const currentChatContainer = chatContainer.current;

        const handleScroll = () => {
            if (currentChatContainer.scrollTop === 0) {
                carregarMensagens();
            }
        };

        currentChatContainer.addEventListener("scroll", handleScroll);

        return () => {
            currentChatContainer.removeEventListener("scroll", handleScroll);
        };
    }, [skip]);

    useEffect(() => {
        if (isLoadingUsuarios) return;

        console.log(isLoadingUsuarios);

        carregarMensagens();

    }, [isLoadingUsuarios]);

    useEffect(() => {
        if (isLoadingUsuarios) return;

        socket.on('novaMensagem', novasMensagens);

        setMensagens((anteriores) => formatarMensagens(anteriores));

        return () => {
            socket.off('novaMensagem');
        };
    }, [usuarios]);

    const novasMensagens = (novaMensagem) => {
        chatContainer.current.style.scrollBehavior = "smooth";

        if (props.isRemovido) return;
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
            mensagem.perfilSrc = defaultAvatar;
        }

        mensagem.dtMensagem = formatarDataChat(mensagem.dtMensagem)

        return mensagem;
    }

    useLayoutEffect(() => {
        // useLayoutEffect, ao contrário do useEffect, é executado antes da tela ser renderizada
        // Isso serve para que o scroll seja ajustado antes da tela ser renderizada
        // Assim, o usuário não percebe a tela sendo renderizada

        if (verificarScroll() || chatContainer.current.scrollTop == 0) {
            const newScrollHeight = chatContainer.current.scrollHeight;
            chatContainer.current.scrollTop += (newScrollHeight - oldScrollHeight);
        };

    }, [mensagens]);

    const rolarParaBaixo = () => {
        chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }

    const verificarScroll = () => {
        const { scrollTop, clientHeight, scrollHeight } = chatContainer.current;

        // ScrollTop = Quantidade de pixels que o scroll está do topo
        // ClientHeight = Altura da tela, depende do tamanho da tela do usuário
        // ScrollHeight = Altura total do scroll

        // Se a soma do scrollTop com o clientHeight for maior ou igual ao scrollHeight - 400, 
        // significa que o usuário está a 400px do fim da tela
        if (scrollTop + clientHeight >= scrollHeight - 400) {
            return true;
        }
        return false;
    }

    const verificarRolar = () => {
        if (verificarScroll()) {
            setShowRolar(false);
        } else {
            setShowRolar(true);
        }
    };

    const ramdonColor = () => {
        const colors = ["#ff5e00", "#1FD11F", "#0000ff", "#ff00d4", "#FF2D61", "#00a2ff", "#c30000"];
        const indexSorteado = Math.floor(Math.random() * colors.length);
        const corSorteada = colors[indexSorteado];

        return corSorteada;
    }

    const verImagem = (imagem) => {
        setImagemClicada(`http://${ipUse}:8080/chat/imagem/${imagem}`);
        setShowImage(true);
    }

    return (
        <div className={styles.chatRoom} style={props.isRemovido ? { filter: "grayscale(1)" } : null}>

            <Header
                idSala={idSala}
                nomeSala={props.salaConfig.nome}
                carregarUsuarios={carregarUsuarios}
                room={room}
                socket={socket}
                setSalaConfig={props.setSalaConfig}
            />

            <Usuarios usuarios={usuarios}
                setUsuarios={setUsuarios}
                socket={socket}
                carregarUsuarios={carregarUsuarios}
                idSala={idSala}
                room={room}
                isAdmin={isAdmin}
            />

            <img ref={chatBg} className={styles.chatBg} alt="" />

            <div className={styles.mensagens} ref={chatContainer} style={{ opacity: 0 }}>
                {mensagens.map((msg, index) => (
                    <ChatMessage
                        msg={msg}
                        key={`mensagens-${index}`}
                        index={index}
                        verImagem={verImagem}
                        mensagens={mensagens}
                        usuarios={usuarios}
                    />
                ))}
                <button style={showRolar ? null : { display: "none" }} className={styles.rolar} onClick={rolarParaBaixo}>
                    <img src={arrow} alt="" />
                </button>
            </div>

            {showImage &&
                <div className={styles.verImagem} >
                    <img src={imagemClicada} alt="" />
                    <button onClick={() => { setImagemClicada(null); setShowImage(false) }}>
                        X
                    </button>
                </div>
            }

            <ChatSendBox
                props={props}
                idSala={idSala}
                room={room}
                tokenUsuario={tokenUsuario}
                socket={socket}
            />



        </div>

    );
};

export default ChatContent;
