// Importando o express
const express = require("express");

// Importando o MySql
const mysql = require("mysql2");

// Importando o módulo express-handlebars
const { engine } = require("express-handlebars");

// Importando módulo fileupload
const fileupload = require("express-fileupload");

// Importando o File Systems
const fs = require("fs");

// Importando o dotenv
require("dotenv").config();

// App
const app = express();

// Habilitando o upload de arquivos
app.use(fileupload());

// Servindo aquivos estáticos
app.use(express.static("views"));
app.use("/img", express.static("./img"));

// Configurando o express-handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Manipulação de dados via rotas
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuração de conexão
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Porta
const PORT = process.env.PORT

// Rotas
app.get("/", (req, res) => {
  let sql = "SELECT * FROM produtos";

  connection.query(sql, (error, retorno) => {
    res.render("form", { produtos: retorno });
  });
});

// Rota de cadastro
app.post("/register", (req, res) => {
  // Obter os dados que serão utilizados para o cadastro
  let name = req.body.name;
  let price = req.body.price;
  let image = req.files.image.name;

  //SQL
  let sql = `INSERT INTO produtos (nome, valor, imagem) VALUES ("${name}", ${price}, "${image}")`;

  // Executar comando SQL
  connection.query(sql, (error, retorno) => {
    // Caso ocorra algum erro
    if (error) throw error;

    req.files.image.mv(__dirname + "/img/" + req.files.image.name);
  });

  // Retornar para a rota principal
  res.redirect("/");
});

// Rota para remover produtos
app.get("/remove/:codigo&:imagem", (req, res) => {
  // SQL
  let sql = `DELETE FROM produtos WHERE codigo = ${req.params.codigo}`;

  // Executar o comando SQL
  connection.query(sql, (error, retorno) => {
    // Caso o comando sql falhe
    if (error) throw error;

    // Caso o comando sql funcione
    fs.unlink(__dirname + "/img/" + req.params.imagem, (erro_imagem) => {
      console.log("Falha ao remover a imagem");
    });
  });

  // Retornar para a rota principal
  res.redirect("/");
});

// Rota alterar produtos
app.get("/edit/:codigo", (req, res) => {
  // SQL
  let sql = `SELECT * FROM produtos WHERE codigo = ${req.params.codigo}`;

  //Executar comando SQL
  connection.query(sql, (error, retorno) => {
    if (error) throw error;

    res.render("edit", { produtos: retorno[0] });
  });
});

// Alterar produto
app.post("/edited", (req, res) => {
  // Obter os dados do formulário
  let code = req.body.code;
  let name = req.body.name;
  let price = req.body.price;
  let currentImage = req.body.currentImage;

  // Definir o tipo de edição
  try {
    let newImage = req.files.newImage;

    let sql = `UPDATE produtos SET nome="${name}", valor=${price}, imagem="${newImage.name}" WHERE codigo=${code}`;

    connection.query(sql, (error, retorno) => {
      if (error) throw error;

      fs.unlink(__dirname + "/img/" + currentImage, (erro_image) => {
        if (erro_image) {
          console.log("Falha ao remover a imagem");
        }
      });

      newImage.mv(__dirname + "/img/" + newImage.name),
        (err) => {
          if (err) {
            console.log("Erro ao mover a imagem:", err);
          }
        };
    });
  } catch (erro) {
    let sql = `UPDATE produtos SET nome="${name}", valor=${price} WHERE codigo=${code}`;

    connection.query(sql, (error, retorno) => {
      if (error) throw error;
    });
  }

  res.redirect("/");
});

// Servidor
app.listen(PORT);
