import React, { useState, useEffect, useCallback } from "react";
import AxiosInstance from "../../config/ipConfig.jsx";
import styles from "./Wallpaper.module.css";
import wallpaperDefault from "../../assets/wallpaper-default.jpg";
import axiosInstance from "../../config/ipConfig.jsx";
import debounce from "lodash.debounce";
import { ipUse } from "../../config/ipConfig.jsx";

const Wallpaper = () => {

    const [wallpaper, setWallpaper] = useState(wallpaperDefault);
    const [luminosidade, setLuminosidade] = useState(100);
    const isRigth = Array.from({ length: 7 }, (_, index) => index % 2 === 0);

    useEffect(() => {
        axiosInstance.get('/usuario/config/')
            .then((response) => {
                let wallpaperSrc = response.data.wallpaperSrc;
                if (wallpaperSrc) {
                    wallpaperSrc = `http://${ipUse}:8080/usuario/wallpaper/${encodeURI(wallpaperSrc)}`;
                    setWallpaper(wallpaperSrc);
                }
                setLuminosidade(response.data.wallpaperLuminosidade);
            }).catch((error) => {
                console.log(error);
            });
    }, []);


    const atualizarLuminosidade = useCallback(
        debounce((value) => {
            console.log("s");
            AxiosInstance.patch("/usuario/wallpaper/luminosidade", {
                luminosidade: value,
            })
                .then((response) => {
                    sessionStorage.setItem("token", response.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        }, 1000),
        []
    );


    const alterarWallpaper = (imagem) => {
        const formData = new FormData();
        formData.append('wallpaperImage', imagem);

        axiosInstance.patch('/usuario/wallpaper', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then((response) => {
            sessionStorage.setItem('token', response.data);
        }).catch((error) => {
            console.log(error);
        })
    }

    const removerWallpaper = () => {
        axiosInstance.patch('/usuario/wallpaper/remover')
            .then((response) => {
                sessionStorage.setItem('token', response.data);
                setWallpaper(wallpaperDefault);
            }).catch((error) => {
                console.log(error);
            })
    }

    return (
        < div className={styles.wallpaper} >
            <div className={styles.title}>
                <h2>Papel de Parede</h2>+
            </div>
            <div className={styles.previewImg}>
                <img src={wallpaper} style={{ filter: `brightness(${luminosidade / 100})` }} alt="preview" />
                <div className={styles.previewMensagens}>
                    {isRigth.map((item, index) => (
                        < div className={`${styles.mensagem} ${item && styles.rigth}`} key={index}></div>
                    ))}
                </div>
            </div>
            <div className={styles.editButton}>
                {(wallpaper !== "/src/assets/wallpaper-default.jpg") && (
                    <button onClick={removerWallpaper}>Voltar para o padrão</button>
                )}
                <div className={styles.upload}>
                    <label htmlFor="wallpaper">Alterar imagem</label>
                    <input
                        type="file"
                        name="wallpaper"
                        id="wallpaper"
                        onChange={(e) => {
                            setWallpaper(URL.createObjectURL(e.target.files[0]));
                            alterarWallpaper(e.target.files[0]);
                        }}
                    />
                </div>
            </div>
            <div className={styles.editLuminosidade}>
                <label htmlFor="luminosidade">Luminosidade do Papel de Parede</label>
                <input type="range" id="luminosidade" min={20} max={200} onChange={(e) => { setLuminosidade(e.target.value); atualizarLuminosidade(e.target.value) }} onClick={(e) => atualizarLuminosidade(e.target.value)} value={luminosidade} />
            </div>
        </div>
    )
}

export default Wallpaper;