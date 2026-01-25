import mongoose, { Document, Model, Schema } from 'mongoose';

const userSchema: Schema = new Schema({
  clerkUserId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, lowercase: true },
  name: { type: String, required: false },
  imageUrl: { type: String, required: false },
}, { timestamps: true });

const User: Model<Document> = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
