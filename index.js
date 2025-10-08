const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

// Setup Multer (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// About page
app.get("/", (req, res) => {
  res.send(`
    <h1>House Rental Webapp</h1>
    <p>This is a simple demo web app running locally.</p>
    <p><a href="/upload">Upload an Image</a></p>
    <p><a href="/gallery">View Uploaded Images</a></p>
  `);
});

// Upload form
app.get("/upload", (req, res) => {
  res.send(`
    <h1>Upload Image</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file" accept="image/*" required />
      <button type="submit">Upload</button>
    </form>
    <p><a href="/">Back</a></p>
  `);
});

// Handle upload (save locally instead of Azure)
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const filePath = path.join(uploadDir, Date.now() + "-" + req.file.originalname);
    fs.writeFileSync(filePath, req.file.buffer);

    res.send(`
      <h2>File uploaded successfully!</h2>
      <p>Saved as: ${filePath}</p>
      <p><a href="/upload">Upload another</a></p>
      <p><a href="/gallery">View Gallery</a></p>
    `);
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).send("Upload failed: " + err.message);
  }
});

// Gallery page (list uploaded images)
app.get("/gallery", (req, res) => {
  const uploadDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadDir)) {
    return res.send("<h2>No images uploaded yet.</h2><p><a href='/'>Back</a></p>");
  }

  const files = fs.readdirSync(uploadDir);
  const images = files.map(
    (file) => `<div style="margin:10px;">
                 <img src="/uploads/${file}" width="200"/>
                 <p>${file}</p>
               </div>`
  );

  res.send(`
    <h1>Gallery</h1>
    <div style="display:flex; flex-wrap:wrap;">${images.join("")}</div>
    <p><a href="/">Back</a></p>
  `);
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start server
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
