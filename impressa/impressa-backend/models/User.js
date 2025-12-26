import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String }, // Made optional for Google Auth users
  role: {
    type: String,
    enum: ["admin", "cashier", "inventory", "delivery", "customer", "guest", "seller"],
    default: "customer",
  },
  googleId: { type: String, unique: true, sparse: true },
  // Seller Profile Fields
  storeName: { type: String, trim: true },
  storeDescription: { type: String, trim: true },
  storeLogo: { type: String, default: null },
  storePhone: { type: String, trim: true },
  sellerStatus: {
    type: String,
    enum: ["pending", "active", "rejected"],
    default: "pending"
  },
  signatureImage: { type: String, default: null },
  stampImage: { type: String, default: null },
  profileImage: { type: String, default: null },
  title: { type: String, trim: true },
  twoFactorEnabled: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
  refreshToken: { type: String },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    phone: String
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    phone: String
  },
  // Auto-approval tracking
  autoApproved: { type: Boolean, default: false },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalScore: { type: Number },

  // RDB Verification (Rwanda Development Board)
  rdbVerification: {
    // TIN (Tax Identification Number)
    tinNumber: { type: String, trim: true },
    // Business registration info
    businessName: { type: String, trim: true },
    businessType: {
      type: String,
      enum: ['sole_proprietor', 'company', 'partnership', 'cooperative', 'other'],
      default: 'sole_proprietor'
    },
    // Document uploads
    rdbCertificate: { type: String }, // File path to uploaded certificate
    nationalId: { type: String }, // File path to national ID
    // Verification status
    documentStatus: {
      type: String,
      enum: ['not_submitted', 'pending_review', 'approved', 'rejected'],
      default: 'not_submitted'
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String }
  },

  // Terms & Conditions Acceptance
  termsAcceptance: {
    accepted: { type: Boolean, default: false },
    acceptedAt: { type: Date },
    version: { type: String }, // Terms version accepted
    ipAddress: { type: String },
    digitalSignature: { type: String } // Full legal name as signature
  }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);
export default User;