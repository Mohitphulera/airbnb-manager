const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dietel9cz',
  api_key: '733876868125425',
  api_secret: '_skNASJBbG0DrZ0F8sc6-a4QSf8'
});

const imgBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

cloudinary.uploader.upload(imgBase64)
  .then(res => console.log('Upload success:', res.secure_url))
  .catch(err => console.error('Upload Error:', err));
