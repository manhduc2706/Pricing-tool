import { AccountModel, IAccount } from "../models/Account.model";


export class AccountRepository {
    async findId(id: String): Promise<IAccount | null> {
        return await AccountModel.findById({ _id: id }).exec()
    }

    async findName(name: String): Promise<IAccount | null> {
        return await AccountModel.findOne({ name }).exec()
    }

    async findEmail(email: String): Promise<IAccount | null> {
        return await AccountModel.findOne({ email }).exec()
    }
}