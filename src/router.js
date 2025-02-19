const express = require("express");
const connection = require("./connection"); // Importando a conexão com o banco de dados
const path = require("path");
const fs = require("fs"); // Importando o File Systems

const router = express.Router();

// Rota para renderizar a página inicial com os produtos
router.get("/", (req, res) => {
  let sql = "SELECT * FROM produtos";

  connection.query(sql, (error, retorno) => {
    if (error) {
      console.error("Erro ao buscar produtos:", error);
      return res.status(500).send("Erro ao buscar produtos.");
    }
    res.render("form", { produtos: retorno });
  });
});

// Rota para cadastrar um novo produto
router.post("/register", (req, res) => {
  let name = req.body.name;
  let price = req.body.price;
  let image = req.files.image.name;

  let sql = `INSERT INTO produtos (nome, valor, imagem) VALUES ("${name}", ${price}, "${image}")`;

  connection.query(sql, (error, retorno) => {
    if (error) throw error;

    req.files.image.mv(__dirname + "/../img/" + req.files.image.name);
  });

  res.redirect("/");
});

// Rota para remover um produto
router.get("/remove/:codigo&:imagem", (req, res) => {
  let sql = `DELETE FROM produtos WHERE codigo = ${req.params.codigo}`;

  connection.query(sql, (error, retorno) => {
    if (error) throw error;

    fs.unlink(__dirname + "/../img/" + req.params.imagem, (erro_imagem) => {
      if (erro_imagem) {
        console.log("Falha ao remover a imagem");
      }
    });
  });

  res.redirect("/");
});

// Rota para alterar produtos
router.get("/edit/:codigo", (req, res) => {
  // SQL
  let sql = `SELECT * FROM produtos WHERE codigo = ${req.params.codigo}`;

  //Executar comando SQL
  connection.query(sql, (error, retorno) => {
    if (error) throw error;

    res.render("edit", { produtos: retorno[0] });
  });
});

// Alterar produto
router.post("/edited", (req, res) => {
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
  
        // Corrigir caminho da imagem atual
        const currentImagePath = path.join(__dirname, "..", "img", currentImage);
        fs.unlink(currentImagePath, (erro_image) => {
          if (erro_image) {
            console.log("Falha ao remover a imagem", erro_image);
          } else {
            console.log("Imagem antiga removida com sucesso");
          }
        });
  
        // Mover nova imagem para o diretório correto
        const newImagePath = path.join(__dirname, "..", "img", newImage.name);
        newImage.mv(newImagePath, (err) => {
          if (err) {
            console.log("Erro ao mover a imagem:", err);
          } else {
            console.log("Nova imagem movida com sucesso.");
          }
        });
      });
    } catch (erro) {
      let sql = `UPDATE produtos SET nome="${name}", valor=${price} WHERE codigo=${code}`;
  
      connection.query(sql, (error, retorno) => {
        if (error) throw error;
      });
    }
  
    res.redirect("/");
  });
  

// Exportando as rotas
module.exports = router;
