import dotenv from "dotenv";
import FtpDeploy from "ftp-deploy";
import { fileURLToPath } from "url";
import { dirname } from "path";

const envArg = process.argv.find((arg) => arg.startsWith("--env="));
const env = envArg?.split("=")[1];

if (!env) {
  console.error("❌ Укажи окружение: --env=driver | customer | forwarder");
  process.exit(1);
}

dotenv.config({
  path: `.env.ftp.${env}`,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ftpDeploy = new FtpDeploy();

const config = {
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  host: process.env.FTP_HOST,
  port: parseInt(process.env.FTP_PORT || "21", 10),
  localRoot: __dirname + "/dist/" + env + "/assets",
  remoteRoot: process.env.FTP_REMOTE_ROOT,
  include: ["*", "**/*"],
  deleteRemote: false,
};

ftpDeploy
  .deploy(config)
  .then(() => {
    console.log("Upload complete");
  })
  .catch((err) => {
    console.error(err);
  });
