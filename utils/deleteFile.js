import fs from "fs";

export default function deleteFile(pathToFile) {
  fs.unlink(pathToFile, err => {
    if (err) throw (err);
  });
}