export const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded"
        });
    }

    // Return the URL path
    // Assuming the server is serving 'uploads' static folder at root /uploads
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
        success: true,
        message: "Image uploaded successfully",
        data: {
            url: fileUrl,
            filename: req.file.filename
        }
    });
};
