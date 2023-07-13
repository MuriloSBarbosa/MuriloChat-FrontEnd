import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/ipConfig";
import styles from "./Login.module.css"
import Modal from "../components/Modal/Modal.jsx";

function Login() {
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const navigate = useNavigate();

    const [modal, setModal] = useState({
        title: '',
        text: ''
    });

    const [time, setTime] = useState(3000);

    const [showModal, setShowModal] = useState(false);

    function logar(e) {
        e.preventDefault();
        axiosInstance.post('/usuario/login', {
            login: login,
            senha: senha
        }).then((response) => {
            if (response.status === 200) {

                sessionStorage.setItem('token', response.data);
                navigate('/salas');
            } else {
                setModal({
                    title: 'Erro',
                    text: 'Login e/ou senha incorretos'
                });
                setShowModal(true);
            }
        }).catch((error) => {
            setModal({
                title: 'Erro ao fazer login',
                text: 'Login e/ou senha incorretos'
            });
            console.log(error);
        });
    }

    const verificarCampos = login === '' || senha === '';

    return (
        <div className={styles.login}>
            <div className={styles.content}>
                <h1>Login</h1>
                <form className={styles.boxes} onSubmit={(e) => { logar(e) }}>
                    <div className={styles.box}>
                        <label>Nome</label>
                        <input type="text" value={login} onChange={(e) => { setLogin(e.target.value) }} />
                    </div>
                    <div className={styles.box}>
                        <label>Senha</label>
                        <input type="password" value={senha} onChange={(e) => { setSenha(e.target.value) }} />
                    </div>
                    <div className={styles.box}>
                        <button disabled={verificarCampos}>Entrar</button>
                        <p>Ainda não logado?<span onClick={() => { navigate('/cadastrar') }}>Cadastre-se</span></p>
                    </div>
                </form>
            </div>

            <Modal showModal={showModal} setShowModal={setShowModal} modal={modal} time={time} />
        </div >
    )
}

export default Login;