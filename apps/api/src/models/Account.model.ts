import { model, Schema, Types } from "mongoose"

export interface IAccount {
    _id: Types.ObjectId,
    name: string,
    email: string,
    password: string,
    role?: "Admin" | "User"
}

const AccountSchema = new Schema<IAccount>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "User"], default: "User" }
})

export const AccountModel = model<IAccount>("Account", AccountSchema)