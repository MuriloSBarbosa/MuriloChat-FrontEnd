import multer from "multer";
import moment from "moment";

// no cb, o primeiro parametro é o erro, o segundo é o nome do arquivo
// o nome do arquivo é composto pela data e hora atual, e o nome original do arquivo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads");
    }, filename: (req, file, cb) => {
        cb(null, `${moment().format("YYYY-MM-DD-HH[h]-mm[m]-ss[s]")}-${file.originalname}`);
    }
});

export const filtro = (req, file, cb) => {
    const formatoAceito = ["image/png", "image/jpg", "image/jpeg"]

    formatoAceito.find(
        formato => formato == file.mimetype
    );

    if (formatoAceito) {
        return cb(null, true);
    }

    return cb(null, false);
};

// o upload recebe dois parametros, o primeiro é o storage, que é o local onde o arquivo será salvo	
// e o segundo é o filtro, que é o tipo de arquivo que será aceito    
export const upload = multer({ storage, filtro });
