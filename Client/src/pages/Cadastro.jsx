import React, { useState, useRef, useCallback } from "react";
import axiosInstance from "../config/ipConfig";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";
import styles from "./Cadastro.module.css"
import Modal from "../components/modal/Modal";
import AvatarEditor from "react-avatar-editor";
import defaultAvatar from "../assets/default-avatar.jpg"
import { dataURLtoFile, resizeImage } from "../utils/geral.mjs";
import correctImage from "../assets/correct.png";
import incorrectImage from "../assets/incorrect.png";
import loadingGif from "../assets/loadingGif.svg";

function Cadastro() {
    const [nome, setNome] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const imgVerificacaoRef = useRef(null);
    const [senha, setSenha] = useState('');

    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(defaultAvatar);
    const [editZoom, setEditZoom] = useState(10);
    const editorRef = useRef(null);
    const inputImageRef = useRef(null);

    const navigator = useNavigate();

    const [modal, setModal] = useState({
        title: '',
        text: ''
    });

    const [time, setTime] = useState(3000);
    const [showModal, setShowModal] = useState(false);


    const [form, setForm] = useState(1);

    const inputName = useRef(null);
    const [nomeIndiponivel, setNomeIndiponivel] = useState(false);

    function Cadastrar(e) {
        e.preventDefault();

        editorRef.current.getImageScaledToCanvas()
            .toBlob((blob) => {

                let perfilImage = null;

                if (file) {
                    perfilImage = new File([blob], file.name, {
                        type: "image/png",
                        lastModified: Date.now(),
                    });
                }

                const formData = new FormData();

                formData.append('perfilImage', perfilImage);
                formData.append('nome', nome);
                formData.append('tipo', "perfil");
                formData.append('senha', senha);

                axiosInstance.post('/usuario', formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }).then(() => {
                    setModal({
                        title: 'Usuário cadastrado com sucesso',
                        text: 'Redirecionando...'
                    });
                    setShowModal(true);
                    setTimeout(() => {
                        navigator('/');
                    }, time);
                }).catch((error) => {
                    setModal({
                        title: 'Erro',
                        text: 'Erro ao cadastrar'
                    });
                    setShowModal(true);
                    console.log(error);
                });
            })
    }

    const verificarNome = useCallback(
        debounce((nome) => {
            nome = nome.trim();
            if (!nome) return;
            axiosInstance.get(`/usuario/verificar/${nome}`)
                .then((response) => {
                    if (response.data) {
                        imgVerificacaoRef.current.src = incorrectImage;
                        setNomeIndiponivel(true);
                    } else {
                        imgVerificacaoRef.current.src = correctImage;
                        setNomeIndiponivel(false);
                    }
                    setIsLoading(false);
                }).catch((error) => {
                    console.log(error);
                })
        }, 1000
        ), []);

    React.useEffect(() => {
        setIsLoading(true);

        if (!nome) return setNomeIndiponivel(false);

        if (imgVerificacaoRef.current.src.endsWith(loadingGif)) return;
        imgVerificacaoRef.current.src = loadingGif;

    }, [nome]);

    const formInvalido = nome.trim() === "" && senha.trim() === "";

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            resizeImage(file, (imagem) => {
                setFileUrl(URL.createObjectURL(imagem));
                setFile(imagem);
                setEditZoom(10);
            });
        }
    }

    const handleRemoveImage = () => {
        setFileUrl(defaultAvatar);
        setEditZoom(10);
        setFile(null);
        inputImageRef.current.value = "";
    }


    return (
        <>
            <div className={styles.cadastro}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Cadastre-se</h1>

                    <div className={styles.steps}>
                        <div className={`${styles.step} ${(form === 1 || form === 2) && styles.active}`}>
                            <div className={styles.circle}>
                                <span>1</span>
                            </div>
                            <p>Informações de Conta</p>
                        </div>
                        <div className={`${styles.step} ${form === 2 && styles.active}`}>
                            <div className={styles.circle}>
                                <span>2</span>
                            </div>
                            <p>Foto de Perfil</p>
                        </div>
                    </div>

                    <form onSubmit={(e) => Cadastrar(e)}>
                        {form === 1 &&
                            <div className={`${styles.stepForm} ${form === 1 && styles.activeForm}`}>
                                <h1>Informações de Conta</h1>
                                <div className={styles.boxes}>
                                    <div className={styles.box}>
                                        <label>Nome ou Tag</label>
                                        <div className={styles.verificacao}>
                                            {nome && <img ref={imgVerificacaoRef} src={loadingGif} alt="verificacao" />}
                                        </div>
                                        <input type="text" ref={inputName} value={nome} onChange={(e) => { setNome(e.target.value); verificarNome(e.target.value) }} />
                                        {nomeIndiponivel && <p>Esse nome está indisponível!</p>}
                                    </div>
                                    <div className={styles.box}>
                                        <label>Senha</label>
                                        <input type="password" value={senha} onChange={(e) => { setSenha(e.target.value) }} />
                                    </div>
                                    <div className={styles.box}>
                                        <button onClick={() => setForm(2)} disabled={isLoading || nomeIndiponivel || !senha}>Próximo</button>
                                    </div>
                                </div>
                            </div>
                        }

                        {form === 2 &&
                            <div className={`${styles.stepForm} ${form === 2 && styles.activeForm}`}>
                                <h1>Foto de Perfil</h1>

                                <div className={styles.boxes}>
                                    <div className={styles.editAvatar}>
                                        <AvatarEditor
                                            image={fileUrl}
                                            width={150}
                                            height={150}
                                            border={50}
                                            color={fileUrl != defaultAvatar ? [80, 80, 80, 0.8] : [35, 35, 38]} // RGBA
                                            scale={editZoom / 10}
                                            borderRadius={125}
                                            ref={editorRef}
                                        />
                                        {(fileUrl != defaultAvatar) &&
                                            <input disabled={fileUrl == defaultAvatar}
                                                className={styles.editZoom} type="range" id="editZoom"
                                                onChange={(e) => {
                                                    if (e.target.value < 10) return;
                                                    setEditZoom(e.target.value)
                                                }}
                                                value={editZoom} min={8} max={50} />
                                        }
                                    </div>
                                    <div className={styles.uploadImage}>
                                        <div className={styles.uploadImage}>
                                            <label htmlFor="perfilImage">Selecione uma imagem</label>
                                            <input type="file" ref={inputImageRef} id="perfilImage" onChange={handleFileChange} multiple={false} accept="image/*" />
                                        </div>
                                        {(fileUrl != defaultAvatar) &&
                                            <button className={styles.remover} onClick={handleRemoveImage}>Remover Imagem</button>
                                        }
                                    </div>

                                    <div className={styles.buttons}>
                                        <button onClick={() => setForm(1)}>Anterior</button>
                                        <button disabled={formInvalido}>{fileUrl != defaultAvatar ? "Cadastrar" : "Cadastrar sem Foto"}</button>
                                    </div>
                                </div>

                            </div>
                        }
                    </form>
                </div>
            </div >

            <Modal showModal={showModal} setShowModal={setShowModal} modal={modal} time={time} />

        </>
    )
}

export default Cadastro;