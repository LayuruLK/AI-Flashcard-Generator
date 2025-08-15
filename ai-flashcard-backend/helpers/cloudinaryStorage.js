const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

const uploadStream = (file, options) => {
  return new Promise((resolve, reject) => {
    const cloudinaryUploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );

    const readableStream = new Readable();
    readableStream.push(file.buffer);
    readableStream.push(null);
    readableStream.pipe(cloudinaryUploadStream);
  });
};

const uploadToCloudinary = async (file) => {
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  let options = {
    folder: 'elects_uploads',
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    resource_type: 'auto'
  };

  if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
    options.resource_type = 'image';
  } else if (fileExtension === 'pdf') {
    options.resource_type = 'raw';
  }

  try {
    const result = await uploadStream(file, options);
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

module.exports = { uploadToCloudinary };