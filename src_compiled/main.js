var ButtonHandler = /** @class */ (function () {
    function ButtonHandler(id) {
        this.button = document.getElementById(id);
    }
    ButtonHandler.prototype.listen = function (fn) {
        if (this.button === null) {
            return "Error: button not found";
        }
        this.button.addEventListener("click", fn);
        return "";
    };
    return ButtonHandler;
}());
var X_OFFSET = 5; //how bunched up the lines are
var Y_OFFSET = 10; //how inset each line is into each block on the y axis
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
        var tree = t.getTree();
        var DOMTree = this.DOMTreeBox;
        var page = { HTML: "<div id=\"tree\" class=\"tree\">" };
        this.headerID = 0;
        if (tree !== null)
            this.treeToDOM(tree, page);
        page.HTML += "</div>";
        DOMTree.innerHTML = page.HTML;
        return "";
    };
    DocumentHandler.prototype.treeToDOM = function (t, page) {
        var _this = this;
        var header = "<h1 class=\"element\" id=\"".concat(this.headerID, "\">");
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
        //console.log(page.HTML);
    };
    DocumentHandler.prototype.nodePositionOnId = function (str, top) {
        var rect = this.nodeBoxOnId(str);
        return [
            (rect.left + rect.right) / 2,
            top ? rect.top : rect.bottom
        ];
    };
    DocumentHandler.prototype.nodeBoxOnId = function (str) {
        var elem = document.getElementById(str);
        if (elem === null) {
            return new DOMRectReadOnly(-1, -1, -1, -1);
        }
        return elem.getBoundingClientRect();
    };
    DocumentHandler.prototype.connectTree = function () {
        this.View = [];
        this.connect(this.getDOMTree(), "0"); //root is a
    };
    DocumentHandler.prototype.connect = function (elem, id) {
        var _this = this;
        var start = this.nodePositionOnId(id, false);
        var nodes = elem.children[1];
        if (nodes === undefined) {
            return;
        }
        var treesArray = Array.prototype.slice.call(nodes.children);
        var outDegree = treesArray.length;
        var nodeBox = this.nodeBoxOnId(id);
        var width = nodeBox.right - nodeBox.left;
        var interval = (width - (2 * X_OFFSET)) / (outDegree - 1);
        treesArray.map(function (tree, i) {
            //console.log(tree.children);
            if (tree.children[0] !== undefined) {
                var end = _this.nodePositionOnId(tree.children[0].id, true);
                _this.View.push([
                    [
                        nodeBox.left + X_OFFSET + (interval * i),
                        start[1] - Y_OFFSET
                    ],
                    [
                        end[0],
                        end[1] + Y_OFFSET
                    ]
                ]);
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
        this.insertHere(x, null, this.tree);
    };
    Tree.prototype.insertHere = function (x, parent, b) {
        if (isFourNode(b)) { //split
            if (parent === null) { //we are splitting the root
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
                this.insertHere(x, null, this.tree); //go up and then back down
                return;
            }
            // not the root, just a normal fournode
            if (isThreeNode(parent)) {
                b = this.splitParentThreeNode(parent, b, x);
                this.insertHere(x, parent, b);
            }
            if (isTwoNode(parent)) {
                b = this.splitParentTwoNode(parent, b, x);
                this.insertHere(x, parent, b);
            }
            return;
        }
        if (isThreeNode(b)) {
            if (x <= b.fst[0]) {
                if (b.fst[1] !== null) { //recurse left
                    this.insertHere(x, b, b.fst[1]);
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
                    this.insertHere(x, b, b.fst[2]);
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
                this.insertHere(x, b, b.snd[1]);
                return;
            }
            //place x at the end
            b.trd = [x, null];
            //new bottom-level fournode
        }
        if (isTwoNode(b)) {
            if (x <= b.fst[0]) {
                if (b.fst[1] !== null) {
                    this.insertHere(x, b, b.fst[1]); //left
                    return;
                }
                b.snd = [b.fst[0], null];
                b.fst = [x, null, null];
                return;
            }
            if (b.fst[2] !== null) {
                this.insertHere(x, b, b.fst[2]);
                return;
            }
            b.snd = [x, null];
        }
    };
    Tree.prototype.splitParentTwoNode = function (p, b, x) {
        //if we're on the right of parent
        var prt = p;
        if (prt.fst[0] <= b.fst[0]) {
            prt.fst[2] = {
                parent: prt,
                fst: b.fst,
                snd: null, trd: null
            };
            prt.snd = [b.snd[0], {
                    parent: prt,
                    fst: [b.trd[0], b.snd[1], b.trd[1]],
                    snd: null, trd: null
                }];
            b = x < prt.snd[0] ? prt.fst[2] : prt.snd[1];
        }
        else {
            //we're on the left side
            prt.snd = [prt.fst[0], prt.fst[2]];
            prt.fst = [
                b.snd[0],
                {
                    parent: prt,
                    fst: b.fst,
                    snd: null, trd: null
                },
                {
                    parent: prt,
                    fst: [b.trd[0], b.snd[1], b.trd[1]],
                    snd: null, trd: null
                }
            ];
            b = x < prt.fst[0] ? prt.fst[1] : prt.fst[2];
        }
        return b;
    };
    Tree.prototype.splitParentThreeNode = function (p, b, x) {
        //split up from the right 
        var prt = p;
        if (prt.snd[0] <= b.fst[0]) {
            prt.snd[1] = {
                parent: prt,
                fst: b.fst,
                snd: null, trd: null
            };
            prt.trd = [b.snd[0], {
                    parent: prt,
                    fst: [b.trd[0], b.snd[1], b.trd[1]],
                    snd: null, trd: null
                }];
            b = x < prt.trd[0] ? prt.snd[1] : prt.trd[1];
            //split up from the left
        }
        else if (prt.fst[0] >= b.trd[0]) {
            prt.trd = prt.snd;
            prt.snd = [prt.fst[0], prt.fst[2]];
            prt.fst = [b.snd[0], {
                    parent: prt,
                    fst: b.fst,
                    snd: null, trd: null
                },
                {
                    parent: prt,
                    fst: [b.trd[0], b.snd[1], b.trd[1]],
                    snd: null, trd: null
                }];
            b = x < prt.fst[0] ? prt.fst[1] : prt.fst[2];
            //split up from the middle
        }
        else {
            prt.fst[2] = {
                parent: prt,
                fst: b.fst,
                snd: null, trd: null
            };
            prt.trd = prt.snd;
            prt.snd = [b.snd[0], {
                    parent: prt,
                    fst: [b.trd[0], b.snd[1], b.trd[1]],
                    snd: null, trd: null
                }];
            b = x < prt.snd[0] ? prt.fst[2] : prt.snd[1];
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
var btnHandler = new ButtonHandler("insert-button");
btnHandler.listen(function () {
    var entry = document.getElementById("new-node-entry");
    if (entry === null) {
        return;
    }
    var entryText = entry.textContent === null ? "" : entry.value;
    var r = /-?[0-9]+(\.[0-9]*[1-9]+)?/;
    var matches = r.exec(entryText);
    if (matches === null) {
        return;
    }
    var numberPlain = matches[0].toString();
    var value = +numberPlain;
    tree.insert(value);
    recompile();
});
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
    tree.compile(); //expensive operation
    setTimeout(function () {
        drawFrame();
    }, 100);
};
window.addEventListener('resize', resize, false);
setTimeout(function () {
    resize();
}, 100);
// for(let i: number = 1; i < 20; i++){
//     console.log(`--------inserting ${i}--------`);
//     tree.insert(i);
// }
tree.print();
recompile();
