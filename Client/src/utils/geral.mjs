import moment from "moment-timezone";
import Resizer from 'react-image-file-resizer';


export function deslogar() {
    sessionStorage.removeItem("token");
    window.location.reload();
}

export const formatarDataChat = (data) => {
    if(data == null) return null;
    
    let dtMensagem = moment(data).tz("America/Sao_Paulo").format("DD/MM/YYYY");
    if (moment().tz("America/Sao_Paulo").format("DD/MM/YYYY") == dtMensagem) {
        dtMensagem = "Hoje, às " + moment(data).tz("America/Sao_Paulo").format("HH:mm");
    } else {
        dtMensagem = moment(data).tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm");
    }

    return dtMensagem;
}

export const dataURLtoFile = (dataurl, filename) => {

    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}

export const formatarBytes = (bytes, decimal) => {
    if (bytes == 0) return '0 Bytes';

    const k = 1024;
    const dm = decimal <= 0 ? 0 : decimal || 2;
    const tamanhos = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + tamanhos[i];
}

export const resizeImage = (file, callBack) => {
    Resizer.imageFileResizer(
        file,
        800, // Largura máxima desejada
        800, // Altura máxima desejada
        'PNG', // Formato da imagem de saída (pode ser 'JPEG', 'PNG', 'WEBP', etc.)
        70, // Qualidade da imagem (0-100)
        0, // Rotação da imagem (em graus, 0 = sem rotação)
        callBack, // Função de retorno de chamada
        'blob' // Tipo de saída, 'blob' retorna um objeto Blob
    );
}













   // if (!preview) {
        //     axiosInstance.patch('/usuario/imagem/remover')
        //         .then((res) => {
        //             sessionStorage.setItem('token', res.data);
        //             setModal({
        //                 title: 'Foto de perfil removida com sucesso!',
        //             });
        //             setTimeout(() => {
        //                 window.location.reload();
        //             }, time);
        //             setShowModal(true);
        //         }).catch((error) => {
        //             setModal({
        //                 title: 'Erro',
        //                 text: 'Erro ao remover foto de perfil'
        //             });
        //             setShowModal(true);
        //             console.log(error);
        //         });
        // };

        // converter base64 para file



        // Para pegar o arquivo do editorRef como blob, é necessário usar o canvas.toBlob()