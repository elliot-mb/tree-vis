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
        this.insertHere(x, null, this.tree);
    }

    private insertHere(x: number, parent: Branch, b: Branch): void {

        if (isFourNode(b)) { //split
      
            if(parent === null) { //we are splitting the root
             
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
                this.insertHere(x, null, this.tree); //go up and then back down
                return;
            }
            // not the root, just a normal fournode
            if(isThreeNode(parent)){
               
                b = this.splitParentThreeNode(parent, b, x);
                this.insertHere(x, parent, b); 
            }
            if(isTwoNode(parent)){
               
                b = this.splitParentTwoNode(parent, b, x);
                this.insertHere(x, parent, b); 
            }
            return;
        }

        if (isThreeNode(b)) {
            if(x <= b!.fst[0]) {
                if(b!.fst[1] !== null) { //recurse left
                    this.insertHere(x, b, b!.fst[1]);
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
                    this.insertHere(x, b, b!.fst[2]);
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
                this.insertHere(x, b, b!.snd![1]);
                return;
            }
            //place x at the end
            b!.trd = [x, null];
            //new bottom-level fournode
        }
        if (isTwoNode(b)) {
            if(x <= b!.fst[0]){
                if(b!.fst[1] !== null){
                    this.insertHere(x, b, b!.fst[1]); //left
                    return
                }
                b!.snd = [b!.fst[0], null];
                b!.fst = [x, null, null];
                return
            }
            if(b!.fst[2] !== null){
                this.insertHere(x, b, b!.fst[2]);
                return
            }
            b!.snd = [x, null];
        }
    }

    private splitParentTwoNode(p: Branch, b: Branch, x: number): Branch{
        //if we're on the right of parent
        const prt = p!;
        if(prt.fst[0] <= b!.fst[0]){
            
            prt.fst![2] = {
                parent: prt,
                fst: b!.fst,
                snd: null, trd: null
            };
            prt.snd = [b!.snd![0], {
                parent: prt,
                fst: [b!.trd![0], b!.snd![1], b!.trd![1]],
                snd: null, trd: null
            }];
            b = x < prt.snd[0] ? prt.fst[2] : prt.snd[1];
        }else{
        //we're on the left side
         
            prt.snd = [prt.fst[0], prt.fst[2]];
            prt.fst = [
                b!.snd![0],
                {
                    parent: prt,
                    fst: b!.fst,
                    snd: null, trd: null
                },
                {
                    parent: prt,
                    fst: [b!.trd![0], b!.snd![1], b!.trd![1]],
                    snd: null, trd: null
                }
            ];
            b = x < prt.fst[0] ? prt.fst[1] : prt.fst[2];
        }
        return b;
    }

    private splitParentThreeNode(p: Branch, b: Branch, x: number): Branch{
        //split up from the right 
        const prt = p!;
        if(prt.snd![0] <= b!.fst[0]){
         
            prt.snd![1] = { //snd is defined because we're there now
                parent: prt,
                fst: b!.fst,
                snd: null, trd: null
            }
            prt.trd = [b!.snd![0], { 
                parent: prt,
                fst: [b!.trd![0], b!.snd![1], b!.trd![1]], 
                snd: null, trd: null
            }];
            b = x < prt.trd[0] ? prt.snd![1] : prt.trd[1];
        //split up from the left
        }else if(prt.fst[0] >= b!.trd![0]){
       
            prt.trd = prt.snd;
            prt.snd = [prt.fst[0], prt.fst[2]];
            prt.fst = [b!.snd![0], {
                parent: prt,
                fst: b!.fst,
                snd: null, trd: null
            },
            {
                parent: prt,
                fst: [b!.trd![0], b!.snd![1], b!.trd![1]],
                snd: null, trd: null   
            }];
            b = x < prt.fst[0] ? prt.fst[1] : prt.fst[2];
        //split up from the middle
        }else{
            prt.fst[2] = {
                parent: prt,
                fst: b!.fst,
                snd: null, trd: null
            };
            prt.trd = prt.snd;
            prt.snd = [ b!.snd![0], {
                parent: prt,
                fst: [b!.trd![0], b!.snd![1], b!.trd![1]],
                snd: null, trd: null
            }];
            b = x < prt.snd[0] ? prt.fst[2] : prt.snd[1];
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