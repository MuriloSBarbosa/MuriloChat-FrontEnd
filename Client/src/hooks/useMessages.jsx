import React, { useState, useEffect, useLayoutEffect } from 'react'
import axiosInstance from '../config/ipConfig';
import defaultAvatar from "../assets/default-avatar.jpg";
import { formatarDataChat } from '../utils/geral.mjs';

export const useMessages = (
    idSala,
    tokenUsuario,
    usuarios,
    chatContainer,
    verificarScroll,
    isRemovido) => {

    const [mensagens, setMensagens] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [oldScrollHeight, setOldScrollHeight] = useState(0);

    const [skip, setSkip] = useState(0);

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
        if (isLoadingMessages) return;

        chatContainer.current.style.opacity = 1;
        chatContainer.current.style.scrollBehavior = "smooth";
    }, [isLoadingMessages]);

    const novasMensagens = (novaMensagem) => {
        chatContainer.current.style.scrollBehavior = "smooth";

        if (isRemovido) return;
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

    return {
        mensagens,
        setMensagens,
        novasMensagens,
        carregarMensagens,
        formatarMensagens,
    }

}

export default useMessages
