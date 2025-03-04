const multer = require("multer");
const path = require("path");

function configureMulter({
  destinationFolder = "./uploads",
  maxSize = 5 * 1024 * 1024,
}) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destinationFolder);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  return multer({
    storage: storage,
    limits: { fileSize: maxSize },
  });
}

module.exports = configureMulter;
