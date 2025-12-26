import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Blog title is required"],
            trim: true,
        },
        content: {
            type: String,
            required: [true, "Blog content is required"],
        },
        excerpt: {
            type: String,
            required: [true, "Blog excerpt is required"],
        },
        author: {
            type: String,
            required: [true, "Author name is required"],
        },
        image: {
            type: String,
            default: "",
        },
        category: {
            type: String,
            required: [true, "Category is required"],
        },
    },
    {
        timestamps: true,
    }
);

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
