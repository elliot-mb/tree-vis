class DocumentHandler { 
    private DOMTree: HTMLElement;
    private DOMTreeBox: HTMLElement = document.getElementById(TREEBOX_ID)!;
    private View: Line[];

    constructor(){
        this.DOMTree = this.getDOMTree();
    }

    getDOMTree(): HTMLElement{
        return document.getElementById(TREE_ID)!;
    }

    setDOMTree(): void{
        let tree = this.getDOMTree();
        tree.remove();
        this.DOMTreeBox.appendChild(this.DOMTree);
    }

    print(): void{
        console.log(this.DOMTree);
    }

    private nodePositionOnId(str: string): Pair {
        let rect: Box = this.nodeBoxOnId(str);
        return [(rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2];
    }

    private nodeBoxOnId(str: string): Box {
        return (document.getElementById(str) as HTMLElement).getBoundingClientRect();
    }

    connectTree(): void{
        this.View = [];
        this.connect(this.DOMTree, "0"); //root is a
    }

    private connect(elem: HTMLElement, id: string): void{
        const start: Pair = this.nodePositionOnId(id);
        const nodes = elem.children[1];
        if(nodes === undefined) { return; }
        const treesArray = Array.prototype.slice.call(nodes.children);
        treesArray.map((tree) => {
            //console.log(tree.children);
            if(tree.children[0] !== undefined) {
                const end: Pair = this.nodePositionOnId((tree.children[0] as HTMLElement).id);
                this.View.push([start, end]);
                this.connect(tree as HTMLElement, (tree.children[0] as HTMLElement).id);
            }
        });
    }

    draw(ctx: CanvasRenderingContext2D): void{
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        this.View.map(line => {
            ctx.beginPath();
            ctx.moveTo(line[0][0], line[0][1]);
            ctx.lineTo(line[1][0], line[1][1]);
            ctx.stroke();
        });
    }
}