import Blog from "../models/Blog.js";
import { catchAsync } from "../middleware/errorHandler.js";

export const getAllBlogs = catchAsync(async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
});

export const getBlogById = catchAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        res.status(404);
        throw new Error("Blog not found");
    }
    res.json(blog);
});

export const createBlog = catchAsync(async (req, res) => {
    const blog = await Blog.create(req.body);
    res.status(201).json(blog);
});

export const updateBlog = catchAsync(async (req, res) => {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!blog) {
        res.status(404);
        throw new Error("Blog not found");
    }
    res.json(blog);
});

export const deleteBlog = catchAsync(async (req, res) => {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
        res.status(404);
        throw new Error("Blog not found");
    }
    res.json({ message: "Blog deleted" });
});
