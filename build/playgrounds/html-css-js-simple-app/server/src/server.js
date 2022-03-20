const express = require("express");
const fs = require("fs");
const fsp = fs.promises;
const app = express();
const cors = require("cors");

const ORIGINS = ["http://localhost:3000", "http://localhost:4000"];

app.use(
  cors({
    origin: ORIGINS,
    credentials: true,
  })
);

app.use(express.json());

// type File = {
//   name: string;
//   content?: string;
//   isDirectory: boolean;
//   path: string;
//   files?: File[];
// }
const ignoreDirs = ["node_modules", ".git"];
async function getFiles(path) {
  let result = [];
  const files = await fsp.readdir(path, {
    encoding: "utf-8",
    withFileTypes: true,
  });

  for (const file of files) {
    if (file.isDirectory()) {
      if (ignoreDirs.includes(file.name)) continue;
      const subFiles = await getFiles(`${path}/${file.name}`);

      result.push({
        name: file.name,
        isDirectory: file.isDirectory(),
        path: `${path}/${file.name}`,
        files: subFiles,
      });
      continue;
    }

    const content = await fsp.readFile(`${path}/${file.name}`, "utf-8");

    result.push({
      name: file.name,
      isDirectory: file.isDirectory(),
      path: `${path}/${file.name}`,
      content,
    });
    continue;
  }

  return result;
}

async function loadFiles(files) {
  for (const file of files) {
    if (file.isDirectory) {
      if (!fs.existsSync(file.path)) {
        fs.mkdirSync(file.path);
      }

      if (!file.files) continue;

      for (const subFile of file.files) {
        if (subFile.isDirectory) {
          if (!fs.existsSync(subFile.path)) {
            fs.mkdirSync(subFile.path);
          }

          if (!subFile.files) continue;

          await loadFiles(subFile.files);
        }

        fs.writeFileSync(subFile.path, subFile.content);
      }

      continue;
    }

    fs.writeFileSync(file.path, file.content);
  }
}

app.get("/backup-files", async (req, res) => {
  try {
    const files = await getFiles("/app");
    return res.send(files);
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.post("/load-backup", async (req, res) => {
  try {
    const files = req.body;
    await loadFiles(files);
    return res.send("Loaded");
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.get("/file", async (req, res) => {
  try {
    const path = req.query.path.startsWith("/")
      ? req.query.path
      : `/app/${req.query.path}`;

    if (!path) {
      res.status(400).send("No path specified");
      return;
    }

    const data = await fsp.readFile(path);
    res.send({
      path,
      content: data.toString(),
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/files", async (req, res) => {
  const path = req.query.path
    ? req.query.path.startsWith("/")
      ? req.query.path
      : `/app/${req.query.path}`
    : "/app";

  try {
    const files = await fsp.readdir(path, {
      withFileTypes: true,
      encoding: "utf8",
    });

    res.send(
      files.map((file) => ({
        name: file.name,
        isDirectory: file.isDirectory(),
        path: `${path}/${file.name}`,
      }))
    );
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/create-file", async (req, res) => {
  try {
    const userInput = req.query.path.startsWith("/")
      ? req.query.path
      : `/app/${req.query.path}`;

    const path = userInput.split("/");
    const dirs = path.slice(0, path.length - 1).filter((dir) => dir);

    if (fs.existsSync(userInput)) {
      return res.status(200).send("File already exists");
    }

    dirs.forEach((dir) => {
      const pathToDir = `/${dirs.slice(0, dirs.indexOf(dir) + 1).join("/")}`;
      if (!fs.existsSync(pathToDir)) {
        fs.mkdirSync(pathToDir);
      }
    });

    await fsp.writeFile(path.join("/"), "");
    res.send("File created");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.post("/delete-file", async (req, res) => {
  const path = req.query.path.startsWith("/")
    ? req.query.path
    : `/app/${req.query.path}`;

  if (!path) return res.status(400).send("No path specified");

  if (!fs.existsSync(path)) {
    return res.status(200).send("File does not exist");
  }

  try {
    await fsp.unlink(path);
    res.send("File deleted");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.post("/delete-dir", async (req, res) => {
  const path = req.query.path.startsWith("/")
    ? req.query.path
    : `/app/${req.query.path}`;

  if (!path) return res.status(400).send("No path specified");

  if (!fs.existsSync(path)) {
    return res.status(200).send("Directory does not exist");
  }

  try {
    await fsp.rm(path, { recursive: true });
    res.send("Directory deleted");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.post("/save-file", async (req, res) => {
  try {
    const { path: filePath, content } = req.body;

    const path = filePath.startsWith("/") ? filePath : `/app/${filePath}`;
    if (!path) return res.status(400).send("No path specified");

    if (!fs.existsSync(path)) {
      return res.status(200).send("File does not exist");
    }

    await fsp.writeFile(path, content);
    res.send("File saved");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.listen(7777);
