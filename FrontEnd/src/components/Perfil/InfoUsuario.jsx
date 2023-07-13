import React, { useState, useRef, useEffect } from "react";
import styles from "./InfoUsuario.module.css";
import Avatar from "react-avatar-edit";
import { dataURLtoFile } from "../../utils/geral.mjs";
import botaoEditar from "../../assets/botao-editar.png";
import axiosInstance from "../../config/ipConfig"
import Modal from "../Modal/Modal";
import { useNavigate } from "react-router-dom";

const InfoUsuario = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState(sessionStorage.getItem("token"));

    const [src, setSrc] = useState("");
    const [preview, setPreview] = useState(null);
    const [imagemPerfil, setImagemPerfil] = useState(null);

    const [isEditImage, setIsEditImage] = useState(false);
    const [isEditName, setIsEditName] = useState(false);
    const [isEditSenha, setIsEditSenha] = useState(false);

    const [nome, setNome] = useState('');
    const [nomeEdit, setNomeEdit] = useState('');
    const [canSaveNome, setCanSaveNome] = useState(false);
    const [senhaAntiga, setSenhaAntiga] = useState('');
    const [senhaNova, setSenhaNova] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const inputName = useRef(null);
    const [nomeIndiponivel, setNomeIndiponivel] = useState(false);

    const inputSenhaAntiga = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [modal, setModal] = useState({
        title: '',
        text: ''
    });
    const [time, setTime] = useState(3000);

    useEffect(() => {
        axiosInstance.get('/usuario/config/')
            .then((response) => {
                let perfilSrc = response.data.perfilSrc;
                if (perfilSrc) {
                    perfilSrc = `http://localhost:8080/usuario/imagem/${encodeURI(perfilSrc)}`;
                } else {
                    perfilSrc = "src/assets/default-avatar.jpg"
                }

                setImagemPerfil(perfilSrc);
                setNome(response.data.nome);
                setNomeEdit(response.data.nome);
            }).catch((error) => {
                console.log(error);
            });

    }, [])

    function atualizarImagem() {
        if (!preview) {
            axiosInstance.patch('/usuario/imagem/remover')
                .then((res) => {
                    sessionStorage.setItem('token', res.data);
                    setModal({
                        title: 'Foto de perfil removida com sucesso!',
                    });
                    setTimeout(() => {
                        window.location.reload();
                    }, time);
                    setShowModal(true);
                }).catch((error) => {
                    setModal({
                        title: 'Erro',
                        text: 'Erro ao remover foto de perfil'
                    });
                    setShowModal(true);
                    console.log(error);
                });
        };

        // converter base64 para file
        const file = dataURLtoFile(preview, 'perfilImage.png');

        const formData = new FormData();

        formData.append('perfilImage', file);
        formData.append('token', token);


        axiosInstance.patch('/usuario/imagem', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }).then((res) => {
            sessionStorage.setItem('token', res.data);
            setModal({
                title: 'Foto de perfil alterada com sucesso!',
            });
            setTimeout(() => {
                window.location.reload();
            }, time);
            setShowModal(true);
        }).catch((error) => {
            setModal({
                title: 'Erro',
                text: 'Erro ao trocar foto de perfil'
            });
            setShowModal(true);
            console.log(error);
        });
    }

    const verificarNome = (newNome) => {
        newNome = newNome.trim();

        if (newNome === "") {
            inputName.current.style.border = "2px solid #ff0000";
            setNomeIndiponivel(true);
            setCanSaveNome(false);
            return;
        }

        if (newNome.toLowerCase() === nome.toLowerCase()) {
            return setCanSaveNome(false);
        };

        axiosInstance.get(`/usuario/verificar/${newNome}`)
            .then((response) => {
                if (response.data) {
                    inputName.current.style.border = "2px solid #ff0000";
                    setNomeIndiponivel(true);
                    setCanSaveNome(false);
                } else {
                    inputName.current.style.border = "2px solid #00ff00";
                    setNomeIndiponivel(false);
                    setCanSaveNome(true);
                }
            }).catch((error) => {
                console.log(error);
            });
    }

    const atualizarNome = () => {
        axiosInstance.patch('/usuario/nome', {
            nome: nomeEdit,
            token: token
        }).then((res) => {
            setModal({
                title: 'Nome alterado com sucesso!',
            });

            sessionStorage.setItem('token', res.data);

            setTimeout(() => {
                window.location.reload();
            }, time);

            setShowModal(true);
        }).catch((error) => {
            setModal({
                title: 'Erro',
                text: 'Erro ao trocar nome'
            });
            setShowModal(true);
            console.log(error);
        });
    }

    const cancelarEdicaoNome = () => {
        setIsEditName(false);
        inputName.current.style.border = "none";
        setNomeIndiponivel(false); setNomeEdit(nome)
    }


    const confirmaSenhaAntiga = async () => {
        let senha = senhaAntiga.trim();
        return axiosInstance.get(`/usuario/verificarSenha/${senha}`
        ).then((response) => {
            return response.data
        }).catch((error) => {
            console.log(error);
            return false;
        });
    }

    const atualizarSenha = async () => {
        if (senhaAntiga === "" || senhaNova === "" || confirmarSenha === "") {
            setModal({
                title: 'Erro',
                text: 'Preencha todos os campos'
            });
            setShowModal(true);
            return;
        }

        const senhaAntigaValida = await confirmaSenhaAntiga(senhaAntiga);

        if (!senhaAntigaValida) {
            setModal({
                title: 'Erro',
                text: 'Senha antiga incorreta'
            });
            setShowModal(true);
            return;
        };

        if (senhaNova !== confirmarSenha) {
            setModal({
                title: 'Erro',
                text: 'As senhas não coincidem'
            });
            setShowModal(true);
            return;
        }

        axiosInstance.patch('/usuario/senha', {
            senha: senhaNova,
        }).then((res) => {
            setModal({
                title: 'Senha alterada com sucesso!',
            });
            sessionStorage.setItem('token', res.data);
            setTimeout(() => {
                window.location.reload();
            }, time);
            setShowModal(true);
        }).catch((error) => {
            setModal({
                title: 'Erro',
                text: 'Erro ao trocar senha'
            });
            setShowModal(true);
            console.log(error);
        });
    }

    return (
        <>
            <div className={styles.infoUsuario}>
                <h1>Informações do Usuário</h1>
                <div className={styles.content}>
                    <div className={`${styles.fotoPerfil} ${styles.block}`}>
                        <h2>Foto de Perfil</h2>
                        {isEditImage ?
                            <>
                                <Avatar
                                    label="Selecione uma imagem"
                                    labelStyle={{ color: "#9d9d9d", fontSize: "1.2rem", cursor: "pointer", padding: "35% 15%" }}
                                    width={300}
                                    height={250}
                                    src={src}
                                    onClose={() => { setPreview(null) }}
                                    onCrop={(preview) => setPreview(preview)}
                                />
                                <div className={styles.buttons}>
                                    <button className={styles.cancelar} onClick={() => setIsEditImage(false)}>Cancelar</button>
                                    <button className={styles.salvar} onClick={atualizarImagem}>Salvar</button>
                                </div>
                            </>

                            :
                            <div className={styles.defaultEdit}>
                                <img src={imagemPerfil} alt="" />
                                <button className={styles.editImage} onClick={() => setIsEditImage(true)}>
                                    <img src={botaoEditar} alt="" />
                                </button>
                            </div>
                        }
                    </div>
                    <hr />
                    <div className={`${styles.infoConta} ${styles.block}`}>
                        <h2>Informações da Conta</h2>
                        <div className={styles.boxes}>
                            <div className={styles.box}>
                                <h2>Nome ou Tag</h2>
                                <input disabled={!isEditName} ref={inputName} onChange={(e) => { setNomeEdit(e.target.value); verificarNome(e.target.value) }} value={isEditName ? nomeEdit : nome} />
                                {nomeIndiponivel && <p>Esse nome está indisponível!</p>}
                                <div className={styles.buttons}>
                                    {isEditName ?
                                        <>
                                            <button className={styles.cancelar} onClick={cancelarEdicaoNome}>Cancelar</button>
                                            <button disabled={!canSaveNome} className={styles.salvar} onClick={atualizarNome}>Salvar</button>
                                        </>
                                        :
                                        <button className={styles.editIcon} onClick={() => setIsEditName(true)}>
                                            <img src={botaoEditar} alt="" />
                                        </button>
                                    }
                                </div>
                            </div>
                            <div className={styles.box}>
                                <h2>Senha</h2>
                                <button className={styles.mudarSenha} onClick={() => setIsEditSenha(true)}>Mudar senha</button>
                            </div>
                        </div>
                    </div>
                </div>
                {isEditSenha &&
                    <div className={styles.modalSenha}>
                        <div className={styles.modal}>
                            <h2>Mudar Senha</h2>
                            <div className={styles.boxes}>
                                <div className={styles.box}>
                                    <label>Senha Atual</label>
                                    <input type="password" ref={inputSenhaAntiga} onChange={(e) => setSenhaAntiga(e.target.value)} value={senhaAntiga} />
                                </div>

                                <div className={styles.box}>
                                    <label>Nova Senha</label>
                                    <input type="password" onChange={(e) => { setSenhaNova(e.target.value) }} value={senhaNova} />
                                </div>
                                <div className={styles.box}>

                                    <label>Confirmar Senha</label>
                                    <input type="password" onChange={(e) => { setConfirmarSenha(e.target.value) }} value={confirmarSenha} />
                                </div>
                                <div className={styles.box}>
                                    <div className={styles.buttons}>
                                        <button className={styles.cancelar} onClick={() => setIsEditSenha(false)}>Cancelar</button>
                                        <button onClick={atualizarSenha} className={styles.salvar}>Salvar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
            <Modal
                showModal={showModal}
                setShowModal={setShowModal}
                modal={modal}
                time={time}
            />
        </>

    )
}

export default InfoUsuario;