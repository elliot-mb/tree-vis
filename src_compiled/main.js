var DocumentHandler = /** @class */ (function () {
    function DocumentHandler() {
        this.DOMTreeBox = document.getElementById(TREEBOX_ID);
        this.DOMTree = this.getDOMTree();
    }
    DocumentHandler.prototype.getDOMTree = function () {
        return document.getElementById(TREE_ID);
    };
    DocumentHandler.prototype.setDOMTree = function () {
        var tree = this.getDOMTree();
        tree.remove();
        this.DOMTreeBox.appendChild(this.DOMTree);
    };
    DocumentHandler.prototype.print = function () {
        console.log(this.DOMTree);
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
        this.connect(this.DOMTree, "0"); //root is a
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
            console.log(tree.children);
            if (tree.children[0] !== undefined) {
                var end = _this.nodePositionOnId(tree.children[0].id);
                _this.View.push([start, end]);
                _this.connect(tree, tree.children[0].id);
            }
        });
    };
    DocumentHandler.prototype.draw = function (ctx) {
        ctx.lineWidth = 2;
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
    return b !== null && !isTwoNode(b) && !(isThreeNode);
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
        }
        this.insertHere(x, this.tree);
    };
    Tree.prototype.insertHere = function (x, b) {
        if (isFourNode(b)) { //split
            if (b.parent === null) { //we are splitting the root
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
            }
            // not the root, just a normal fournode
            if (isThreeNode(b.parent)) {
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
            }
            if (isTwoNode(b.parent)) {
                b.parent.fst[1] = {
                    parent: b.parent,
                    fst: b.fst,
                    snd: null, trd: null
                };
                b.parent.snd = [b.snd[0], {
                        parent: b.parent,
                        fst: [b.trd[0], b.snd[1], b.trd[1]],
                        snd: null, trd: null
                    }];
            }
            this.insertHere(x, b.parent); //go up and then back down
        }
        if (isThreeNode(b)) {
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
    Tree.prototype.search = function (x) {
        return 0;
    };
    Tree.prototype.remove = function (x) {
        return 0;
    };
    Tree.prototype.print = function () {
        console.log(this);
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
    tree.update();
    drawFrame();
};
var background = function () {
    ctx.fillStyle = "#bbbbcc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};
var drawFrame = function () {
    background();
    tree.draw(ctx);
};
window.addEventListener('resize', resize, false);
resize();
ctx.fillStyle = "#fff";
var rect = document.getElementById("0").getBoundingClientRect();
ctx.fillRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top);
console.log(rect.top, rect.bottom, rect.left, rect.right);
// const mainLoop: (() => void) = () => {
//     background();
//     tree.draw(ctx);
//     requestAnimationFrame(mainLoop);
// }
// mainLoop();
