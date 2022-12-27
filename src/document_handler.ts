type HTMLBox = { 
    HTML: string
};

const X_OFFSET = 5; //how bunched up the lines are
const Y_OFFSET = 10; //how inset each line is into each block on the y axis

class DocumentHandler { 
    private DOMTreeBox: HTMLElement = document.getElementById(TREEBOX_ID)!;
    private headerID = 0;
    private View: Line[];

    constructor(){

    }

    getDOMTree(): HTMLElement{
        return document.getElementById(TREE_ID)!;
    }

    // setDOMTree(): void{
    //     let tree = this.getDOMTree();
    //     tree.remove();
    //     this.DOMTreeBox.appendChild(this.DOMTree);
    // }

    compileTreeToDOM(t: Tree): string { //returns its error
        const tree = t.getTree(); 
        const DOMTree = this.DOMTreeBox;
        const page: HTMLBox = { HTML: `<div id="tree" class="tree">` };
        this.headerID = 0;
        if(tree !== null) this.treeToDOM(tree, page);
        page.HTML += `</div>`;
        DOMTree.innerHTML = page.HTML;
        return "";
    }

    private treeToDOM(t: Branch, page: HTMLBox){
        let header = `<h1 class="element" id="${this.headerID}">`;
        const tree = t!;
        header += tree.fst !== null ? `${tree.fst[0]}` : ""; 
        header += tree.snd !== null ? `, ${tree.snd[0]}` : "";
        header += tree.trd !== null ? `, ${tree.trd[0]}</h1>` : "</h1>";
        this.headerID++;
        page.HTML += header;
        
        page.HTML += `<div class="nodes">`;
        let subTrees: (Branch)[] = [ //possible subtrees
            tree.fst[1], 
            tree.fst[2], 
            tree.snd !== null ? tree.snd[1] : null, 
            tree.trd !== null ? tree.trd[1] : null
        ];
        subTrees.map((subTree) => {
            if(subTree !== null) {
                page.HTML += `<div class="tree">`
                this.treeToDOM(subTree, page);
                page.HTML += `</div>`
            }
        });
        page.HTML += `</div>`;
        //console.log(page.HTML);
    }

    private nodePositionOnId(str: string, top: boolean): Pair {
        let rect: Box = this.nodeBoxOnId(str);
        return [
            (rect.left + rect.right) / 2, 
            top ? rect.top : rect.bottom
        ];
    }

    private nodeBoxOnId(str: string): Box {
        let elem = document.getElementById(str);
        if(elem === null) { return new DOMRectReadOnly(-1, -1, -1, -1); }
        return elem.getBoundingClientRect();
    }

    connectTree(): void{
        this.View = [];
        this.connect(this.getDOMTree(), "0"); //root is a
    }

    private connect(elem: HTMLElement, id: string): void{
        const start: Pair = this.nodePositionOnId(id, false);
        const nodes = elem.children[1];
        if(nodes === undefined) { return; }
        const treesArray: HTMLElement[] = Array.prototype.slice.call(nodes.children);
        const outDegree = treesArray.length;
        const nodeBox = this.nodeBoxOnId(id);
        const width = nodeBox.right - nodeBox.left;
        const interval: number = (width - (2 * X_OFFSET)) / (outDegree - 1);
        treesArray.map((tree, i) => {
            //console.log(tree.children);
            if(tree.children[0] !== undefined) {
                const end: Pair = this.nodePositionOnId((tree.children[0] as HTMLElement).id, true);
                this.View.push([
                [
                    nodeBox.left + X_OFFSET + (interval * i), 
                    start[1] - Y_OFFSET
                ], 
                [
                    end[0], 
                    end[1] + Y_OFFSET
                ]]);
                this.connect(tree as HTMLElement, (tree.children[0] as HTMLElement).id);
            }
        });
    }

    draw(ctx: CanvasRenderingContext2D): void{
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000';
        this.View.map(line => {
            ctx.beginPath();
            ctx.moveTo(line[0][0], line[0][1]);
            ctx.lineTo(line[1][0], line[1][1]);
            ctx.stroke();
        });
    }
}