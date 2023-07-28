import React, { useState, useRef, useEffect } from "react";
import styles from "./ChatSendBox.module.css";
import anexos from "../../assets/anexos.png";
import imagem from "../../assets/imagem.png";
import docs from "../../assets/docs.png";
import moment from "moment-timezone"
import Resizer from 'react-image-file-resizer';
import axiosInstance from "../../config/ipConfig";


const ChatSendBox = (props) => {
    const { idSala, room, tokenUsuario, socket } = props;
    const [showAnexos, setShowAnexos] = useState(false);
    const [mensagemDigitada, setMensagemDigitada] = useState('');
    const imagemSelecionada = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);
    const anexosImg = useRef(null);
    const anexosContent = useRef(null);


    useEffect(() => {
        window.addEventListener("click", (e) => fecharAnexos(e));

        return () => {
            window.removeEventListener("click", fecharAnexos);
        }
    }, []);


    const enviarMensagem = (e) => {
        if (e.key !== 'Enter' && e.type != "click") return;

        if (mensagemDigitada == "") return;

        const mensagem = {
            idSala,
            room: encodeURI(room),
            mensagemDigitada: mensagemDigitada.trim(),
            tokenUsuario
        }

        socket.emit('enviarMensagem', mensagem);

        setMensagemDigitada('');
    };

    const ResizeImage = (file, callBack) => {
        Resizer.imageFileResizer(
            file,
            800, // Largura máxima desejada
            800, // Altura máxima desejada
            'JPEG', // Formato da imagem de saída (pode ser 'JPEG', 'PNG', 'WEBP', etc.)
            70, // Qualidade da imagem (0-100)
            0, // Rotação da imagem (em graus, 0 = sem rotação)
            callBack, // Função de retorno de chamada
            'blob' // Tipo de saída, 'blob' retorna um objeto Blob
        );
    }

    const enviarImagem = () => {
        const file = imagemSelecionada.current.files[0];

        if (!file) return;

        imagemSelecionada.current.value = "";

        const formData = new FormData();

        ResizeImage(file, (blob) => {
            const dtMensagem = moment().tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss");

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
        });
    };



    const inserirImagem = () => {

        const [image] = imagemSelecionada.current.files;

        if (!image) return;

        try {
            ResizeImage(image, (blob) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImage(reader.result);
                };
                reader.readAsDataURL(blob);
            });
        } catch (err) {
            alert("Erro ao carregar imagem");
        }
    };

    const cancelarImagem = () => {
        setPreviewImage(null);
        imagemSelecionada.current.value = "";
    }

    const fecharAnexos = (e) => {
        if (!anexosContent.current.contains(e.target) && e.target != anexosImg.current) {
            setShowAnexos(false);
        }
    }

    return (
        <>
            {previewImage &&
                <div className={styles.preview}>
                    {previewImage ? <img src={previewImage} alt="preview" /> : null}
                    <div className={styles.buttons}>
                        <button onClick={cancelarImagem} className={styles.cancelarImg}>Cancelar</button>
                        <button onClick={enviarImagem}>Enviar Imagem</button>
                    </div>
                </div>
            }

            <div className={styles.sendBox} >
                <div className={styles.anexos}>
                    <img src={anexos} alt="" onClick={() => setShowAnexos(!showAnexos)} ref={anexosImg} />
                    <div className={`${styles.anexosContent} ${showAnexos ? styles.showAnexosContent : null}`} ref={anexosContent}>
                        <div className={styles.image}>
                            <label className={styles.anexosLabel} htmlFor="image">
                                <img src={imagem} alt="clip" />
                                <input type="file" id='image' accept="image/*" ref={imagemSelecionada} onChange={inserirImagem} />
                                <p>Imagens</p>
                            </label>
                        </div>
                        <div className={styles.doc}>
                            <label className={styles.anexosLabel} htmlFor="doc">
                                <img src={docs} alt="clip" />
                                <input type="file" disabled={true} onChange={inserirImagem} />
                                <p>Documentos</p>
                            </label>
                        </div>
                    </div>
                </div>
                <input type="text" value={mensagemDigitada}
                    onChange={(e) => setMensagemDigitada(e.target.value)}
                    placeholder="Digite sua mensagem"
                    onKeyDown={(e) => { enviarMensagem(e) }}
                    disabled={props.props.isRemovido}
                />
                <button disabled={props.props.isRemovido} onClick={(e) => { enviarMensagem(e) }}>Enviar</button>
            </div>
        </>
    )
}

export default ChatSendBox;