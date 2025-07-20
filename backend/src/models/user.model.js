import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    meetingHistory: [{
        meetingId: String,
        joinedAt: Date,
        leftAt: Date,
        duration: Number // in minutes
    }],
    preferences: {
        defaultMicMuted: { type: Boolean, default: false },
        defaultVideoOff: { type: Boolean, default: false },
        theme: { type: String, default: 'dark' }
    }
}, {
    timestamps: true // adds createdAt and updatedAt
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Remove password from JSON output
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model("User", userSchema);

export {User};
