import path from 'path'; // Permite passar o caminho que vai funcionar para qualquer sistema operacional
import crypto from 'crypto';

// Arquivo reservado para armazenar as configurações de upload e imagem
import multer from 'multer';

// Onde vamos jogar os arquivos que são feitos upload aqui dentro da nossa aplicação
// "__dirname" Permite ter o caminho inteiro da aplicação até a pasta "config"
// '..' volta uma pasta(config); '..' volta outra pasta(src); 'tmp' jogando o arquivo dentro da pasta "tmp"
const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  // Criamos "directory" para saber onde os arquivos ficam
  directory: tmpFolder,

  // Por enquanto nós vamos armazenar as imagens que o usuário fizer o upload aqui na nossa aplicação dentro dentro da estrutura da nossa aplicação.
  // O diskStorage recebe duas propriedades: 1ª destination e 2ª filename
  storage: multer.diskStorage({
    destination: tmpFolder,
    // Qual nome o arquivo receberá
    // Poderia ser também: filename(request, file, callback) {...}
    filename: (request, file, callback) => {
      // Para certificar que o arquivo sempre vai ser gerado com o nome único, vamos começar a gerar um hash aleatório. Para isso, importamos o crypto do 'crypto'. Será gerado 10 bits de carateres. E serão convertidos em hexadecimal
      const fileHash = crypto.randomBytes(10).toString('hex');
      // Gerando o nome do arquivo junto com o fileHash. "originalname" é como era o nome do arquivo na máquina do usuário que fez este upload.
      const filename = `${fileHash}-${file.originalname}`;

      return callback(null, filename);
    },
  }),
};
