export class Colaborador {
    id: number;
    checked: boolean;
    expanded: boolean;

    constructor(item) {
        this.id = item?.id;
    }

    isChecked(): boolean {
        return this.checked;
    }
}