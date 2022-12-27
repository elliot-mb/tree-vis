var DocumentHandler = /** @class */ (function () {
    function DocumentHandler() {
        this.DOMTreeBox = document.getElementById(TREEBOX_ID);
        this.headerID = 0;
    }
    DocumentHandler.prototype.getDOMTree = function () {
        return document.getElementById(TREE_ID);
    };
    // setDOMTree(): void{
    //     let tree = this.getDOMTree();
    //     tree.remove();
    //     this.DOMTreeBox.appendChild(this.DOMTree);
    // }
    DocumentHandler.prototype.compileTreeToDOM = function (t) {
        var DOMTree = this.DOMTreeBox;
        var page = { HTML: "<div id=\"tree\" class=\"tree\">" };
        this.headerID = 0;
        if (t !== null)
            this.treeToDOM(t.getTree(), page);
        page.HTML += "</div>";
        DOMTree.innerHTML = page.HTML;
        return "";
    };
    DocumentHandler.prototype.treeToDOM = function (t, page) {
        var _this = this;
        var header = "<h1 id=\"".concat(this.headerID, "\">");
        var tree = t;
        header += tree.fst !== null ? "".concat(tree.fst[0]) : "";
        header += tree.snd !== null ? ", ".concat(tree.snd[0]) : "";
        header += tree.trd !== null ? ", ".concat(tree.trd[0], "</h1>") : "</h1>";
        this.headerID++;
        page.HTML += header;
        page.HTML += "<div class=\"nodes\">";
        var subTrees = [
            tree.fst[1],
            tree.fst[2],
            tree.snd !== null ? tree.snd[1] : null,
            tree.trd !== null ? tree.trd[1] : null
        ];
        subTrees.map(function (subTree) {
            if (subTree !== null) {
                page.HTML += "<div class=\"tree\">";
                _this.treeToDOM(subTree, page);
                page.HTML += "</div>";
            }
        });
        page.HTML += "</div>";
        console.log(page.HTML);
    };
    DocumentHandler.prototype.nodePositionOnId = function (str) {
        var rect = this.nodeBoxOnId(str);
        return [(rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2];
    };
    DocumentHandler.prototype.nodeBoxOnId = function (str) {
        return document.getElementById(str).getBoundingClientRect();
    };
    DocumentHandler.prototype.connectTree = function () {
        this.View = [];
        this.connect(this.getDOMTree(), "0"); //root is a
    };
    DocumentHandler.prototype.connect = function (elem, id) {
        var _this = this;
        var start = this.nodePositionOnId(id);
        var nodes = elem.children[1];
        if (nodes === undefined) {
            return;
        }
        var treesArray = Array.prototype.slice.call(nodes.children);
        treesArray.map(function (tree) {
            //console.log(tree.children);
            if (tree.children[0] !== undefined) {
                var end = _this.nodePositionOnId(tree.children[0].id);
                _this.View.push([start, end]);
                _this.connect(tree, tree.children[0].id);
            }
        });
    };
    DocumentHandler.prototype.draw = function (ctx) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000';
        this.View.map(function (line) {
            ctx.beginPath();
            ctx.moveTo(line[0][0], line[0][1]);
            ctx.lineTo(line[1][0], line[1][1]);
            ctx.stroke();
        });
    };
    return DocumentHandler;
}());
var isTwoNode = function (b) {
    return b !== null && b.fst !== null && b.snd === null && b.trd === null;
};
var isThreeNode = function (b) {
    return b !== null && !isTwoNode(b) && b.snd !== null && b.trd === null;
};
var isFourNode = function (b) {
    return b !== null && !isTwoNode(b) && !isThreeNode(b);
};
var TREEBOX_ID = "tree-box";
var TREE_ID = "tree";
var Tree = /** @class */ (function () {
    function Tree() {
        this.docHandler = new DocumentHandler();
        this.tree = null;
    }
    Tree.prototype.insert = function (x) {
        if (this.tree === null) {
            this.tree = {
                parent: null,
                fst: [x, null, null],
                snd: null, trd: null
            };
            return;
        }
        this.insertHere(x, this.tree);
    };
    Tree.prototype.insertHere = function (x, b) {
        // console.log(`inserting ${x} at`, b);
        if (isFourNode(b)) { //split
            console.log("splitting a 4 node");
            if (b.parent === null) { //we are splitting the root
                console.log("splitting the root");
                var rootVal = b.snd[0];
                var newRoot = {
                    parent: null,
                    fst: [rootVal, null, null],
                    snd: null, trd: null
                };
                newRoot.fst[1] = {
                    parent: newRoot,
                    fst: b.fst,
                    snd: null, trd: null
                };
                newRoot.fst[2] = {
                    parent: newRoot,
                    fst: [b.trd[0], b.snd[1], b.trd[1]],
                    snd: null, trd: null
                };
                this.tree = newRoot;
                this.insertHere(x, this.tree); //go up and then back down
                return;
            }
            // not the root, just a normal fournode
            if (isThreeNode(b.parent)) {
                b = this.splitParentThreeNode(b, x);
            }
            if (isTwoNode(b.parent)) {
                b = this.splitParentTwoNode(b);
            }
            this.insertHere(x, b);
            return;
        }
        if (isThreeNode(b)) {
            console.log("is threenode");
            if (x < b.fst[0]) {
                if (b.fst[1] !== null) { //recurse left
                    this.insertHere(x, b.fst[1]);
                    return;
                }
                //else slide values along
                b.trd = [b.snd[0], null];
                b.snd = [b.fst[0], null];
                b.fst = [x, null, null];
                //new bottom-level fournode
                return;
            }
            if (x > b.fst[0] && x < b.snd[0]) {
                if (b.snd[1] !== null) { //recurse on middle
                    this.insertHere(x, b.fst[2]);
                    return;
                }
                //else put x in the middle
                b.trd = [b.snd[0], null];
                b.snd = [x, null];
                //new bottom-level fournode
                return;
            }
            //larger than both
            if (b.snd[1] !== null) {
                this.insertHere(x, b.snd[1]);
                return;
            }
            //place x at the end
            b.trd = [x, null];
            //new bottom-level fournode
        }
        if (isTwoNode(b)) {
            console.log("is twonode");
            if (x < b.fst[0]) {
                if (b.fst[1] !== null) {
                    this.insertHere(x, b.fst[1]); //left
                    return;
                }
                b.snd = [b.fst[0], null];
                b.fst = [x, null, null];
                return;
            }
            if (b.fst[2] !== null) {
                this.insertHere(x, b.fst[2]);
                return;
            }
            b.snd = [x, null];
        }
    };
    Tree.prototype.splitParentTwoNode = function (b) {
        //if we're on the right of parent
        if (b.parent.fst[0] <= b.fst[0]) {
            b.parent.fst[2] = {
                parent: b.parent,
                fst: b.fst,
                snd: null, trd: null
            };
            b.parent.snd = [b.snd[0], {
                    parent: b.parent,
                    fst: [b.trd[0], b.snd[1], b.trd[1]],
                    snd: null, trd: null
                }];
            b = b.parent.snd[1];
        }
        else {
            //we're on the left side
            b.parent.snd = [b.parent.fst[0], b.parent.fst[2]];
            b.parent.fst = [
                b.snd[0],
                {
                    parent: b.parent,
                    fst: b.fst,
                    snd: null, trd: null
                },
                {
                    parent: b.parent,
                    fst: [b.trd[0], b.snd[1], b.trd[1]],
                    snd: null, trd: null
                }
            ];
            b = b.parent.fst[1];
        }
        return b;
    };
    Tree.prototype.splitParentThreeNode = function (b, x) {
        //split up from the right 
        if (b.parent.snd[0] <= b.fst[0]) {
            b.parent.snd[1] = {
                parent: b.parent,
                fst: b.fst,
                snd: null, trd: null
            };
            b.parent.trd = [b.snd[0], {
                    parent: b.parent,
                    fst: [b.trd[0], b.snd[1], b.trd[1]],
                    snd: null, trd: null
                }];
            b = b.parent.trd[1];
            //split up from the left
        }
        else if (b.parent.fst[0] >= b.trd[0]) {
            b.parent.trd = b.parent.snd;
            b.parent.snd = [b.parent.fst[0], b.parent.fst[2]];
            b.parent.fst = [b.snd[0], {
                    parent: b.parent,
                    fst: b.fst,
                    snd: null, trd: null
                },
                {
                    parent: b.parent,
                    fst: [b.trd[0], b.snd[1], b.trd[1]],
                    snd: null, trd: null
                }];
            b = x < b.parent.fst[0] ? b.parent.fst[1] : b.parent.fst[2];
            //split up from the middle
        }
        else {
            b.parent.fst[2] = {
                parent: b.parent,
                fst: b.fst,
                snd: null, trd: null
            };
            b.parent.trd = b.parent.snd;
            b.parent.snd = [b.snd[0], {
                    parent: b.parent,
                    fst: [b.trd[0], b.snd[1], b.trd[1]],
                    snd: null, trd: null
                }];
            b = x < b.parent.snd[0] ? b.parent.fst[2] : b.parent.snd[1];
        }
        return b;
    };
    Tree.prototype.getTree = function () {
        return this.tree;
    };
    Tree.prototype.search = function (x) {
        return 0;
    };
    Tree.prototype.remove = function (x) {
        return 0;
    };
    Tree.prototype.print = function () {
        console.log(this);
    };
    Tree.prototype.compile = function () {
        var err = this.docHandler.compileTreeToDOM(this);
        return err;
    };
    Tree.prototype.update = function () {
        this.docHandler.connectTree();
    };
    Tree.prototype.draw = function (ctx) {
        this.docHandler.draw(ctx);
    };
    return Tree;
}());
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var tree = new Tree();
tree.print();
// tree.connectTree();
var resize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame();
};
var background = function () {
    ctx.fillStyle = "#bbbbcc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};
var drawFrame = function () {
    background();
    tree.update();
    tree.draw(ctx);
};
var recompile = function () {
    tree.compile();
    setTimeout(function () {
        tree.update();
        tree.draw(ctx);
    }, 100);
};
window.addEventListener('resize', resize, false);
resize();
tree.insert(6);
tree.insert(5);
tree.insert(3);
tree.insert(2);
tree.insert(1);
tree.insert(4);
tree.print();
recompile();
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
