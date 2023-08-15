export class Util {

    public static transformStringToNumber(string: string): number {
        let convertido: number = parseInt(string);
        if (!Number.isNaN(convertido)) return convertido;
        else return null;
    }

    public static isListEmpty(list: any[]): boolean {
        if (list == null || list == undefined) return true;
        else {
            if (list.length == 0) return true;
            else return false;
        }
    }

    public static isObjectEmpty(object: any): boolean {
        if (object == null || object == undefined) return true;
        return false;
    }

    public static isNotObjectEmpty(object: any): boolean {
        if (object == null || object == undefined) return false;
        return true;
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

    public static isSomeAttributeFilled(object: any): boolean {
        if (Object.keys(object).some(k => !!object[k])) return true;
        return false;
    }

    public static somaMesesNaDataAtual(qtdMeses: number): string {
        let hoje = new Date();

        let formattedDate: any;
        hoje.setMonth(hoje.getMonth() + qtdMeses);
        let mesAtualizado = hoje.getMonth() + 1;

        switch (mesAtualizado) {
            case 1:
                return 'Janeiro de ' + hoje.getFullYear();
            case 2:
                return 'Fevereiro de ' + hoje.getFullYear();
            case 3:
                return 'Março de ' + hoje.getFullYear();
            case 4:
                return 'Abril de ' + hoje.getFullYear();
            case 5:
                return 'Maio de ' + hoje.getFullYear();
            case 6:
                return 'Junho de ' + hoje.getFullYear();
            case 7:
                return 'Julho de ' + hoje.getFullYear();
            case 8:
                return 'Agosto de ' + hoje.getFullYear();
            case 9:
                return 'Setembro de ' + hoje.getFullYear();
            case 10:
                return 'Outubro de ' + hoje.getFullYear();
            case 11:
                return 'Novembro de ' + hoje.getFullYear();
            case 12:
                return 'Dezembro de ' + hoje.getFullYear();
            default:
                return '';
        }

        // formattedDate = hoje.toISOString().slice(0, 10);
        // return formattedDate;
    }

    public static getDiaMesAnoAtual(): string {
        let hoje = new Date();
        let year = hoje.getFullYear().toString();
        let monthPreOp = hoje.getMonth() + 1;
        let month = monthPreOp < 10 ? '0' + monthPreOp.toString() : monthPreOp.toString();
        let day = hoje.getDate() < 10 ? '0' + hoje.getDate().toString() : hoje.getDate().toString();
        return (year + '-' + month + '-' + day).toString();
    }

    public static getMesAnoAtual(): string {
        let hoje = new Date();
        let year = hoje.getFullYear().toString();
        let monthPreOp = hoje.getMonth() + 1;
        let month = monthPreOp < 10 ? '0' + monthPreOp.toString() : monthPreOp.toString();
        let day = hoje.getDate() < 10 ? '0' + hoje.getDate().toString() : hoje.getDate().toString();
        return (year + '-' + month).toString();
    }

    public static obtemMesAnoPorExtenso(mesAno: string): string {

        let mesAnoSplitted: string[] = mesAno.split('-');

        switch (mesAnoSplitted[1]) {
            case '01' || '1':
                return 'Janeiro de ' + mesAnoSplitted[0];
            case '02' || '2':
                return 'Fevereiro de ' + mesAnoSplitted[0];
            case '03' || '3':
                return 'Março de ' + mesAnoSplitted[0];
            case '04' || '4':
                return 'Abril de ' + mesAnoSplitted[0];
            case '05' || '5':
                return 'Maio de ' + mesAnoSplitted[0];
            case '06' || '6':
                return 'Junho de ' + mesAnoSplitted[0];
            case '07' || '7':
                return 'Julho de ' + mesAnoSplitted[0];
            case '08' || '8':
                return 'Agosto de ' + mesAnoSplitted[0];
            case '09' || '9':
                return 'Setembro de ' + mesAnoSplitted[0];
            case '10':
                return 'Outubro de ' + mesAnoSplitted[0];
            case '11':
                return 'Novembro de ' + mesAnoSplitted[0];
            case '12':
                return 'Dezembro de ' + mesAnoSplitted[0];
        }

        return mesAno;
    }
}