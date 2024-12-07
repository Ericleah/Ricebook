////////////////////////////////
// Upload files to Cloudinary //
////////////////////////////////
const multer = require('multer')
const stream = require('stream')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary');

if (!process.env.CLOUDINARY_URL) {
    console.error('*******************************************************************************')
    console.error('*******************************************************************************\n')
    console.error('You must set the CLOUDINARY_URL environment variable for Cloudinary to function\n')
    console.error('\texport CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"\n')
    console.error('*******************************************************************************')
    console.error('*******************************************************************************')
    process.exit(1)
}

const doUpload = (publicId, req, res, next) => {
    if (!req.file) {
        req.fileurl = null;
        req.fileid = null;
        return next();
    }

	const uploadStream = cloudinary.uploader.upload_stream(result => {    	
         // capture the url and public_id and add to the request
         req.fileurl = result.url
         req.fileid = result.public_id
         next()
	}, { public_id: req.body[publicId]})

	// multer can save the file locally if we want
	// instead of saving locally, we keep the file in memory
	// multer provides req.file and within that is the byte buffer

	// we create a passthrough stream to pipe the buffer
	// to the uploadStream function for cloudinary.
	const s = new stream.PassThrough()
	s.end(req.file.buffer)
	s.pipe(uploadStream)
	s.on('end', uploadStream.end)
	// and the end of the buffer we tell cloudinary to end the upload.
}
// Configure Cloudinary Storage for Multer


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'avatars', // Folder name in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [
        { quality: "auto", fetch_format: "auto" }
      ]    
    },
  });
// multer parses multipart form data. 
const uploadImage = (fieldName) => multer({ storage: storage }).single(fieldName);
const uploadAvatar = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed!"), false);
      }
    },
  }).single("avatar");


module.exports = { uploadImage, uploadAvatar, doUpload };