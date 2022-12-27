type Branch = {
    parent: Branch | null //nullable if root
    fst: [number, Branch, Branch],
    snd: [number, Branch] | null,
    trd: [number, Branch] | null
} | null; // a Branch may have null children

const isTwoNode = (b: Branch): boolean => { 
    return b !== null && b.fst !== null && b.snd === null && b.trd === null;
}

const isThreeNode = (b: Branch): boolean => {
    return b !== null && !isTwoNode(b) && b.snd !== null && b.trd === null;
}

const isFourNode = (b: Branch): boolean => {
    return b !== null && !isTwoNode(b) && !isThreeNode(b);
}

type Pair = [number, number]; //x, y
type Line = [Pair, Pair];
type Box  = DOMRectReadOnly;

const TREEBOX_ID = "tree-box";
const TREE_ID    = "tree";

class Tree {
    private docHandler: DocumentHandler = new DocumentHandler();
    private tree: Branch = null;

    constructor(){

    }

    insert(x: number): void {
        if(this.tree === null) {
            this.tree = {
                parent: null,
                fst: [x, null, null],
                snd: null, trd: null
            };
            return;
        }
        this.insertHere(x, this.tree);
    }

    private insertHere(x: number, b: Branch): void {
        // console.log(`inserting ${x} at`, b);
        if (isFourNode(b)) { //split
            console.log("splitting a 4 node");
            if(b!.parent === null) { //we are splitting the root
                console.log("splitting the root");
                const rootVal: number = b!.snd![0];
                const newRoot: Branch = {
                    parent: null,
                    fst: [rootVal, null, null],
                    snd: null, trd: null
                }
                newRoot.fst[1] = {
                    parent: newRoot,
                    fst: b!.fst,
                    snd: null, trd: null
                }
                newRoot.fst[2] = {
                    parent: newRoot,
                    fst: [b!.trd![0], b!.snd![1], b!.trd![1]],
                    snd: null, trd: null
                }
                this.tree = newRoot;
                this.insertHere(x, this.tree); //go up and then back down
                return;
            }
            // not the root, just a normal fournode
            if(isThreeNode(b!.parent)){
                b = this.splitParentThreeNode(b, x);
            }
            if(isTwoNode(b!.parent)){
                b = this.splitParentTwoNode(b);
            }
            this.insertHere(x, b); 
            return;
        }

        if (isThreeNode(b)) {
            console.log("is threenode");
            if(x < b!.fst[0]) {
                if(b!.fst[1] !== null) { //recurse left
                    this.insertHere(x, b!.fst[1]);
                    return;
                }
                //else slide values along
                b!.trd = [b!.snd![0], null];
                b!.snd = [b!.fst[0], null];
                b!.fst = [x, null, null];
                //new bottom-level fournode
                return;
            }
            if(x > b!.fst[0] && x < b!.snd![0]){
                if(b!.snd![1] !== null) { //recurse on middle
                    this.insertHere(x, b!.fst[2]);
                    return;
                }
                //else put x in the middle
                b!.trd = [b!.snd![0], null];
                b!.snd = [x, null];
                //new bottom-level fournode
                return;
            }
            //larger than both
            if(b!.snd![1] !== null) {
                this.insertHere(x, b!.snd![1]);
                return;
            }
            //place x at the end
            b!.trd = [x, null];
            //new bottom-level fournode
        }
        if (isTwoNode(b)) {
            console.log("is twonode");
            if(x < b!.fst[0]){
                if(b!.fst[1] !== null){
                    this.insertHere(x, b!.fst[1]); //left
                    return
                }
                b!.snd = [b!.fst[0], null];
                b!.fst = [x, null, null];
                return
            }
            if(b!.fst[2] !== null){
                this.insertHere(x, b!.fst[2]);
                return
            }
            b!.snd = [x, null];
        }
    }

    private splitParentTwoNode(b: Branch): Branch{
        //if we're on the right of parent
        if(b!.parent!.fst[0] <= b!.fst[0]){
            b!.parent!.fst![2] = {
                parent: b!.parent,
                fst: b!.fst,
                snd: null, trd: null
            };
            b!.parent!.snd = [b!.snd![0], {
                parent: b!.parent,
                fst: [b!.trd![0], b!.snd![1], b!.trd![1]],
                snd: null, trd: null
            }];
            b = b!.parent!.snd[1];
        }else{
        //we're on the left side
            b!.parent!.snd = [b!.parent!.fst[0], b!.parent!.fst[2]];
            b!.parent!.fst = [
                b!.snd![0],
                {
                    parent: b!.parent,
                    fst: b!.fst,
                    snd: null, trd: null
                },
                {
                    parent: b!.parent,
                    fst: [b!.trd![0], b!.snd![1], b!.trd![1]],
                    snd: null, trd: null
                }
            ];
            b = b!.parent!.fst[1];
        }
        return b;
    }

    private splitParentThreeNode(b: Branch, x: number): Branch{
        //split up from the right 
        if(b!.parent!.snd![0] <= b!.fst[0]){
            b!.parent!.snd![1] = { //snd is defined because we're there now
                parent: b!.parent,
                fst: b!.fst,
                snd: null, trd: null
            }
            b!.parent!.trd = [b!.snd![0], { 
                parent: b!.parent,
                fst: [b!.trd![0], b!.snd![1], b!.trd![1]], 
                snd: null, trd: null
            }];
            b = b!.parent!.trd[1];
        //split up from the left
        }else if(b!.parent!.fst[0] >= b!.trd![0]){
            b!.parent!.trd = b!.parent!.snd;
            b!.parent!.snd = [b!.parent!.fst[0], b!.parent!.fst[2]];
            b!.parent!.fst = [b!.snd![0], {
                parent: b!.parent,
                fst: b!.fst,
                snd: null, trd: null
            },
            {
                parent: b!.parent,
                fst: [b!.trd![0], b!.snd![1], b!.trd![1]],
                snd: null, trd: null   
            }];
            b = x < b!.parent!.fst[0] ? b!.parent!.fst[1] : b!.parent!.fst[2];
        //split up from the middle
        }else{
            b!.parent!.fst[2] = {
                parent: b!.parent,
                fst: b!.fst,
                snd: null, trd: null
            };
            b!.parent!.trd = b!.parent!.snd;
            b!.parent!.snd = [ b!.snd![0], {
                parent: b!.parent,
                fst: [b!.trd![0], b!.snd![1], b!.trd![1]],
                snd: null, trd: null
            }];
            b = x < b!.parent!.snd[0] ? b!.parent!.fst[2] : b!.parent!.snd[1];
        }
        return b;
    }

    getTree(): Branch {
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