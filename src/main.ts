var canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement; 
var ctx : CanvasRenderingContext2D = canvas.getContext("2d")!;

let tree: Tree = new Tree();
tree.print();
// tree.connectTree();

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

for(let i: number = 1; i < 30; i++){
    console.log(`--------inserting ${i}--------`);
    tree.insert(i);
}
tree.print();
recompile();


// const mainLoop: (() => void) = () => {

//     background();
//     tree.draw(ctx);

//     requestAnimationFrame(mainLoop);
// }

// mainLoop();