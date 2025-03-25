import toast from "app/utils/toast";



export default class ToastException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ToastException';
        toast(message);
    }
}