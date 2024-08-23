import { Schema, model } from "mongoose";

const UserSchema = Schema ({
  name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  nick: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  bio: String,
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "role_user"
  },
  image: {
    type: String,
    default: "default.png"
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default model("User", UserSchema, "users");
// "User" nombre del modelo
// UserSchema nombre del esquema
// "users" nombre de la colección en MondoDB