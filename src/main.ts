var canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement; 
var ctx : CanvasRenderingContext2D = canvas.getContext("2d")!;

let tree: Tree = new Tree();
let btnHandler: ButtonHandler = new ButtonHandler("insert-button");
btnHandler.listen(() => {
    let entry: HTMLInputElement | null = document.getElementById("new-node-entry") as HTMLInputElement;
    if(entry === null) { return; }
    let entryText: string = entry.textContent === null ? "" : entry.value;

    let r: RegExp = /-?[0-9]+(\.[0-9]*[1-9]+)?/;
    let matches = r.exec(entryText);
    if(matches === null) { return; }
    let numberPlain: string = matches[0].toString();
    let value: number = +numberPlain;

    tree.insert(value);
    recompile();
});

const resize: (() => void) = (): void => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawFrame();
};

const background: (() => void) = (): void => {
    ctx.fillStyle = "#bbbbcc";
    ctx.fillRect(0,0,canvas.width, canvas.height);
}

const drawFrame: (() => void) = (): void => {
    background();
    tree.update();
    tree.draw(ctx);
}

const recompile: (() => void) = (): void => {
    tree.compile(); //expensive operation
    setTimeout(() => {
        drawFrame();
    }, 100);
}

window.addEventListener('resize', resize, false);

setTimeout(() => {
    resize();
}, 100);

// for(let i: number = 1; i < 20; i++){
//     console.log(`--------inserting ${i}--------`);
//     tree.insert(i);
// }
tree.print();
recompile();
