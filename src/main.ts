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

tree.insert(6);
tree.insert(5);
tree.insert(4);
tree.insert(3);
tree.insert(2);
tree.insert(1);
tree.insert(4.1)
tree.insert(4.2);
tree.insert(4.3);
tree.print();
// tree.insert(0);
// tree.print();
// tree.insert(-1);
// tree.print();
// tree.insert(7);
// tree.print();
// tree.insert(5);
// tree.print();
// tree.insert(6);
// tree.print();
// tree.insert(0);
// tree.print();
// tree.insert(-1);
// // tree.print();
// tree.insert(7);
// tree.print();
// tree.insert(8);
// tree.print();



// const mainLoop: (() => void) = () => {

//     background();
//     tree.draw(ctx);

//     requestAnimationFrame(mainLoop);
// }

// mainLoop();