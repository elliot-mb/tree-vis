var canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement; 
var ctx : CanvasRenderingContext2D = canvas.getContext("2d")!;

let tree: Tree = new Tree();
tree.print();
// tree.connectTree();

const resize: (() => void) = (): void => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    tree.update();
    drawFrame();
};

const background: (() => void) = (): void => {
    ctx.fillStyle = "#bbbbcc";
    ctx.fillRect(0,0,canvas.width, canvas.height);
}

const drawFrame: (() => void) = (): void => {
    background();
    tree.draw(ctx);
}

window.addEventListener('resize', resize, false);

resize();


ctx.fillStyle = "#fff";
let rect = (document.getElementById("0") as HTMLElement).getBoundingClientRect();
ctx.fillRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top);

console.log(rect.top, rect.bottom, rect.left, rect.right);

// const mainLoop: (() => void) = () => {

//     background();
//     tree.draw(ctx);

//     requestAnimationFrame(mainLoop);
// }

// mainLoop();