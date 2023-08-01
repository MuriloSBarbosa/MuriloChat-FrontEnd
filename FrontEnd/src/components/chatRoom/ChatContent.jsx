
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

const ChatContent = (props) => {
    const [idSala, setIdSala] = useState(props.salaConfig.id);
    const [room, setRoom] = useState(props.salaConfig.identificador);
    const tokenUsuario = sessionStorage.getItem("token");
    const socket = props.salaConfig.socket;

    const [isAdmin, setIsAdmin] = useState(false);

    const [usuarios, setUsuarios] = useState([]);

    const [mensagens, setMensagens] = useState([]);

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
        currentChatContainer.addEventListener("scrollend", srollBehavior)

        socket.emit('joinRoom', room);

        return () => {
            props.setShowModal(false);
            props.setIsRemovido(false);
            currentChatContainer.removeEventListener("scrollend", srollBehavior);
        }

    }, []);


    const srollBehavior = () => {
        chatContainer.current.style.opacity = 1;
    }

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

            const usuarios = res.data.usuarios;
            setIsAdmin(res.data.isAdmin);

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

        console.log("carregando mensagens");

        const currentScrollHeight = chatContainer.current.scrollHeight;
        console.log(currentScrollHeight);

        setOldScrollHeight(currentScrollHeight);

        chatContainer.current.style.scrollBehavior = "auto";

        axiosInstance.get(`/chat/mensagem/${idSala}?skip=${skip}&limit=100`)
            .then((res) => {
                const newMessages = res.data.map(msg => formatarMensagens(msg)).reverse();

                setMensagens((anteriores) => [...newMessages, ...anteriores]);

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
                console.log("carregando mais mensagens");
                carregarMensagens();
            }
        };

        currentChatContainer.addEventListener("scroll", handleScroll);

        return () => {
            currentChatContainer.removeEventListener("scroll", handleScroll);
        };
    }, [skip]);

    useEffect(() => {
        if (usuarios.length === 0) return;

        socket.on('novaMensagem', novasMensagens);
        console.log(usuarios);

        carregarMensagens();

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
            mensagem.perfilSrc = "src/assets/default-avatar.jpg";
        } else if (mensagem.perfilSrc) {
            mensagem.perfilSrc = `http://${ipUse}:8080/usuario/imagem/${encodeURI(mensagem.perfilSrc)}`;
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
        if (scrollTop + clientHeight >= scrollHeight - 400) {
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
                        key={index}
                        index={index}
                        verImagem={verImagem}
                        mensagens={mensagens}
                    />
                ))}
                <button style={showRolar ? { display: "none" } : null} className={styles.rolar} onClick={rolarParaBaixo}>
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
