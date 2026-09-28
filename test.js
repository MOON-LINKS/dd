// test.js
const sharp = require("sharp");

async function compressImage() {
  await sharp("12.jpg")
    .resize(200) 
    .webp({ quality:40, effort:6})
    .toFile("output1.webp");

  console.log("✅ Image compressed and saved as output.webp");
}

compressImage();
