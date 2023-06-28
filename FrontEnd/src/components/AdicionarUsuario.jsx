import React from "react";

function AdicionarUsuario() {
    const [addUserNome, setAddUserNome] = useState('');

    function verificarUser() {
        const nomeCodificado = encodeURIComponent(addUserNome);
        axiosInstance.get(`/usuario/verificar/${nomeCodificado}`)
            .then((res) => {
                if (res.data) {
                    const id = Number(addUserNome.split(" ")[1].replaceAll("#", ""));

                    addUser(id);
                } else {
                    alert("Usuário não encontrado");
                }
            }).catch((err) => {
                console.log(err);
            });
    }

    function addUser(idUser) {
        console.log(idUser);
        axiosInstance.post("/chat/usuario",
            {
                idUser,
                idSala: idSala
            },
            {
                headers: {
                    "authorization": "Bearer " + tokenUsuario
                }
            })
            .then((res) => {
                alert("Usuário adicionado com sucesso");
            })
            .catch((err) => {
                console.log(err);
            });
    }

    return (
        <div className={styles.addUser} style={{ display: "none" }}>
            <h2>Adicionar usuario ao chat</h2>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <label>Nome</label>
                <input type="text" value={addUserNome} onChange={(e) => setAddUserNome(e.target.value)} />
                <button onClick={verificarUser}>Adicionar</button>
            </div>
        </div>

    )
}

export default AdicionarUsuario;