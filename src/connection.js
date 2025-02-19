// Importando o MySQL
const mysql = require("mysql2");

require("dotenv").config(); // Para usar as variáveis de ambiente do .env

// Criando a conexão com o banco de dados
const connection = mysql.createConnection({
  host: process.env.DB_HOST, // Host do banco
  user: process.env.DB_USER, // Usuário do banco
  password: process.env.DB_PASSWORD, // Senha do banco
  database: process.env.DB_NAME, // Nome do banco
});

// Verificando a conexão
connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    process.exit(1); // Encerra o processo se a conexão falhar
  } else {
    console.log("Conectado ao banco de dados com sucesso!");
  }
});

// Exportando a conexão para uso em outros arquivos
module.exports = connection;
