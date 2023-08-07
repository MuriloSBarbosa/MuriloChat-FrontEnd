
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import axiosInstance from "../../config/ipConfig";
import styles from "./ChatContent.module.css";
import Header from './Header';
import ChatMessage from './ChatMessage';
import ChatSendBox from './ChatSendBox';
import { ipUse } from '../../config/ipConfig';
import Usuarios from './Usuarios';
import arrow from "../../assets/arrow.png";
import WallpaperImage from "../../assets/wallpaper-default.jpg";
import useUsuarios from '../../hooks/useUsuarios';
import useMessages from '../../hooks/useMessages';

const ChatContent = (props) => {
    const [idSala, setIdSala] = useState(props.salaConfig.id);
    const [room, setRoom] = useState(props.salaConfig.identificador);
    const socket = props.salaConfig.socket;

    const tokenUsuario = sessionStorage.getItem("token");

    const [showImage, setShowImage] = useState(false);
    const imageView = useRef(null);

    const chatContainer = useRef(null);
    const chatBg = useRef(null);

    const [showRolar, setShowRolar] = useState(false);

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

    const {
        usuarios,
        isLoadingUsuarios,
        isAdmin,
        carregarUsuarios,
    } = useUsuarios(idSala);

    const {
        mensagens,
        setMensagens,
        novasMensagens,
        carregarMensagens,
        formatarMensagens,
    } = useMessages(
        idSala,
        tokenUsuario,
        usuarios,
        chatContainer,
        verificarScroll,
        props.isRemovido
    );


    useEffect(() => {
        setIdSala(props.salaConfig.id);
        setRoom(props.salaConfig.identificador);

    }, [props.salaConfig]);


    useEffect(() => {
        buscarWallpaper();

        const currentChatContainer = chatContainer.current;

        carregarUsuarios();

        currentChatContainer.addEventListener("scroll", verificarRolar);

        socket.emit('joinRoom', room);

        return () => {
            props.setShowModal(false);
            props.setIsRemovido(false);
        }

    }, []);


    useEffect(() => {
        if (isLoadingUsuarios) return;

        carregarMensagens();

    }, [isLoadingUsuarios]);




    const buscarWallpaper = () => {
        axiosInstance.get('/usuario/wallpaper',
            {
                responseType: 'blob'
            })
            .then((response) => {
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


    useEffect(() => {
        if (isLoadingUsuarios) return;

        socket.on('novaMensagem', novasMensagens);

        setMensagens((anteriores) => formatarMensagens(anteriores));

        return () => {
            socket.off('novaMensagem');
        };
    }, [usuarios]);



    const rolarParaBaixo = () => {
        chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }

    const verificarRolar = () => {
        if (verificarScroll()) {
            setShowRolar(false);
        } else {
            setShowRolar(true);
        }
    };



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

            <Usuarios
                usuarios={usuarios}
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
                        setShowImage={setShowImage}
                        imageView={imageView}
                        usuarios={usuarios}
                        mensagens={mensagens}
                    />
                ))}
                <button style={showRolar ? null : { display: "none" }} className={styles.rolar} onClick={rolarParaBaixo}>
                    <img src={arrow} alt="" />
                </button>
            </div>

            {showImage &&
                <div className={styles.verImagem} >
                    <img src={showImage} alt="" />
                    <button onClick={() => { setShowImage(false) }}>
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
