import { Wallet } from "app/utils/wallet";

declare global {
    var token: string | null
    var wallet: Wallet | null;
    var tmpWallet: Wallet | null;
}