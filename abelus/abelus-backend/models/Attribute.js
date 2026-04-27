import mongoose from "mongoose";
import slugify from "slugify";

const attributeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Attribute name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["select", "color", "label", "image"],
      default: "select",
    },
    values: [
      {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        value: { type: String }, // Hex code for color, or image URL
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate slug from name before saving
attributeSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Attribute = mongoose.model("Attribute", attributeSchema);

export default Attribute;
