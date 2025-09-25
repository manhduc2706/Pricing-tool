import { create } from "lodash";
import { AccountModel, IAccount } from "../models/Account.model";
import { AccountRepository } from "../repositories/Account.repository";
import { CreateAccount, SignInResponse } from "../shared";

export class AccountService {
    private accountRepository: AccountRepository

    constructor() {
        this.accountRepository = new AccountRepository();
    }

    async signUp(data: CreateAccount): Promise<IAccount> {
        const exitingEmail = await this.accountRepository.findEmail(data.email)

        if (exitingEmail) {
            console.log("Email đã tồn tại")
        }

        const newAccount = new AccountModel({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role ?? "User"
        })

        return await newAccount.save()
    }

    async signIn(email: String, password: String): Promise<SignInResponse> {
        const account = await this.accountRepository.findEmail(email)

        if (!account || account.password !== password) {
            throw new Error("Tài khoản không hợp lệ");
        }
        // // Tạo JWT từ account
        // const token = generateJwt({
        //     id: account.id,
        //     role: account.role
        // });

        return {
            id: account._id.toString(),
            name: account.name,
            role: account.role ?? "User"
        };
    }
}