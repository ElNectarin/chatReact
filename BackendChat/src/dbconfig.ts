import { Sequelize } from "sequelize";
require("dotenv").config();

const dbName = process.env.DB_NAME || "default_db_name";
const dbLogin = process.env.DB_LOGIN || "default_db_login";
const dbPassword = process.env.DB_PASSWORD || "default_db_password";
const dbHost = process.env.DB_HOST || "default_db_host";

const sequelize = new Sequelize({
  database: dbName,
  username: dbLogin,
  password: dbPassword,
  host: dbHost,
  dialect: "postgres",
});

async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log("Соединение с базой данных установлено успешно.");
  } catch (error) {
    console.error("Ошибка подключения к базе данных:", error);
  }
}

testDatabaseConnection();

export { sequelize };
