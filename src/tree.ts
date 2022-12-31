type Vertex = {
    values: number[], // values[i] has left and right children nodes[i] and nodes[i+1] 
    nodes: Vertex[]
}; 

// const isTwoNode = (b: Branch): boolean => { 
//     return b !== null && b.fst !== null && b.snd === null && b.trd === null;
// }

// const isThreeNode = (b: Branch): boolean => {
//     return b !== null && !isTwoNode(b) && b.snd !== null && b.trd === null;
// }

const isFourNode = (node: Vertex): boolean => {
    return node.values.length === 3;
}

type Pair = [number, number]; //x, y
type Line = [Pair, Pair];
type Box  = DOMRectReadOnly;

const TREEBOX_ID = "tree-box";
const TREE_ID    = "tree";

class Tree {
    private docHandler: DocumentHandler = new DocumentHandler();
    private tree: Vertex = {values: [], nodes: []};

    constructor(){

    }

    insert(x: number): void {
        if(isFourNode(this.tree)){
            const newRoot: Vertex = {
                values: [],
                nodes: [this.tree]
            };
            this.split(0, newRoot);
            this.tree = newRoot;
            console.log(this.tree);
        }
        this.insertIn(x, this.tree);
    }

    private rangeCheckValues(i: number, node: Vertex): void{
        if(i >= node.values.length) throw Error(`Error: provided a node which was too small to get the ${i}th value`);
    }

    private rangeCheckNodes(i: number, node: Vertex): void{
        if(i >= node.nodes.length) throw Error(`Error: provided a node which was too small to get the ${i}th node`);
    }

    private insertIn(x: number,  node: Vertex): void {
        const nodeType: number = node.nodes.length; //two/three/four node

        for(let i = 0; i < node.values.length; i++) {
            const val: number = node.values[i];
            const leftChild: Vertex = node.nodes[i];
            if(x <= val && node.nodes[i] === undefined){
                node.values.splice(i, 0, x);
                return;
            }else if(x <= val){
                //check if the subsequent node is a fournode, split it if so
                let offset = 0;
                if(isFourNode(leftChild)) { 
                    const newVal: number = this.split(i, node); 
                    if(x > newVal) { offset = 1; }
                } 
                this.insertIn(x, node.nodes[i + offset]);
                return;
            }
        }
        const lastNode = node.nodes[nodeType - 1];
        if(lastNode === undefined) {
            node.values.push(x);
        }else{
            //check if the subsequent node is fournode, split it if so 
            let offset: number = 0;
            if(isFourNode(lastNode)) { 
                const newVal: number = this.split(nodeType - 1, node); 
                if(x > newVal) { offset = 1; }
            }
            this.insertIn(x, node.nodes[nodeType - 1 + offset]);
        }
    }

    //splits are done pre-emptively so we only ever go into a split node
    //this removes the need for vertices to know their parents ;w;
    //this will split the ith node in 'node.nodes', and mutate 'node'. The node passed in is the **parent** of the node being split 
    private split(i: number, node: Vertex): number {
        //this.rangeCheckValues(i, node);
        this.rangeCheckNodes(i, node); //if we're splitting the right node, we want to know its index is within our current node

        const toSplit: Vertex = node.nodes[i];
        if(!isFourNode(toSplit)) { 
            console.log(toSplit);
            throw Error("Error: split attempted on non-fournode");
        }

        node.nodes.splice(i, 1);

        const middleValue: number = toSplit.values[1];
        node.values.splice(i, 0, middleValue); //pull up the middle value and put it where it belongs
        node.nodes.splice(i, 0, this.twoNode(0, toSplit), this.twoNode(2, toSplit)); //variadic insertion of both new twoNodes


        return middleValue;
    }

    private twoNode(i: number, node: Vertex): Vertex { //get the ith two-node from the given node
        //console.log(node);
        this.rangeCheckValues(i, node);
        const left: Vertex | undefined = node.nodes[i];
        const right: Vertex | undefined =  node.nodes[i+1];
        let children: Vertex[] = [];
        if(left !== undefined) children.push(left);
        if(right !== undefined) children.push(right);
        return {
            values: [node.values[i]],
            nodes: children
        }
    }

    getTree(): Vertex {
        return this.tree;
    }

    search(x: number): number | null {
        return 0;
    }

    remove(x: number): number | null {
        return 0;
    }

    print(): void{
        console.log(this);
    }

    compile(): string {
        let err = this.docHandler.compileTreeToDOM(this);
        return err;
    }

    update(): void {
        this.docHandler.connectTree();
    }

    draw(ctx: CanvasRenderingContext2D): void{
        this.docHandler.draw(ctx);
    }
}