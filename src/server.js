const express = require("express"); // Importando o express
const connection = require("./connection"); // Importando a conexão com o banco de dados
const { engine } = require("express-handlebars"); // Importando o Handlebars
const fileupload = require("express-fileupload"); // Importando módulo fileupload
const path = require("path"); // Importando o Path
const router = require("./router"); // Importando o arquivo de rotas

// App
const app = express();

const PORT = process.env.PORT;

app.use(fileupload()); // Habilitando o upload de arquivos

// Manipulação de dados via rotas
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configurando o express-handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("../views", "../views");

// Servindo aquivos estáticos
app.use(express.static("views"));
app.use("/img", express.static(path.join(__dirname, "..", "img")));

// Rotas
app.use("/", router);

// Inicializando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
