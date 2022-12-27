class ButtonHandler {
    private button: HTMLElement | null;

    constructor(id: string){
        this.button = document.getElementById(id);
    }

    listen(fn: () => void): string {
        if(this.button === null) { return "Error: button not found";}
        this.button.addEventListener("click", fn);
        return "";
    }
}