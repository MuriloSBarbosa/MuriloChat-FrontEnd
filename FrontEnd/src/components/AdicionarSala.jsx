import React from "react";


function AdicionarSala() {
    return (
        <div>
            <button>Adicionar Sala</button>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <label>Nome</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />

                <label>Identificador</label>
                <input type="text" value={identificador} onChange={(e) => setDescricao(e.target.value)} />

                <label>Senha</label>
                <input type="text" value={senha} onChange={(e) => setSenha(e.target.value)} />

                <button onClick={adicionarSala}>Adicionar</button>
            </div>
        </div>
    )
}

export default AdicionarSala;