export class Util {

    public static stringToNumber(string: string): number {
        let convertido: number = parseInt(string);
        if (!Number.isNaN(convertido)) return convertido;
        else return null;
    }

    public static isEmptyString(string: string): boolean {
        if (string != null && string != undefined && string != '') return false;
        return true;
    }

    public static isNotEmptyString(string: string): boolean {
        if (string != null && string != undefined && string != '') return true;
        return false;
    }

    public static isEmptyNumber(number: number): boolean {
        if (number != null && number != undefined) return false;
        return true;
    }

    public static isNotEmptyNumber(number: number): boolean {
        if (number != null && number != undefined) return true;
        return false;
    }
}