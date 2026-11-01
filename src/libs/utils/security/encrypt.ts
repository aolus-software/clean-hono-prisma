import * as CryptoJS from "crypto-js";
import { env } from "@config";

export class EncryptionToolkit {
	private static get secretKey(): string {
		return env.APP_KEY;
	}

	static encrypt(text: string): string {
		return CryptoJS.AES.encrypt(text, this.secretKey).toString();
	}

	static decrypt(encryptedText: string): string {
		const bytes = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
		return bytes.toString(CryptoJS.enc.Utf8);
	}
}
