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
        if (tree.values.length !== 0)
            this.treeToDOM(tree, page);
        page.HTML += "</div>";
        DOMTree.innerHTML = page.HTML;
        return "";
    };
    DocumentHandler.prototype.treeToDOM = function (t, page) {
        var _this = this;
        var header = "<h1 class=\"element\" id=\"".concat(this.headerID, "\">");
        t.values.map(function (val) { return header += "".concat(val, "  "); });
        this.headerID++;
        page.HTML += header.trim() + "</h1>";
        page.HTML += "<div class=\"nodes\">";
        t.nodes.map(function (subTree) {
            if (subTree !== undefined) {
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
// const isTwoNode = (b: Branch): boolean => { 
//     return b !== null && b.fst !== null && b.snd === null && b.trd === null;
// }
// const isThreeNode = (b: Branch): boolean => {
//     return b !== null && !isTwoNode(b) && b.snd !== null && b.trd === null;
// }
var isFourNode = function (node) {
    return node.values.length === 3;
};
var TREEBOX_ID = "tree-box";
var TREE_ID = "tree";
var Tree = /** @class */ (function () {
    function Tree() {
        this.docHandler = new DocumentHandler();
        this.tree = { values: [], nodes: [] };
    }
    Tree.prototype.insert = function (x) {
        if (isFourNode(this.tree)) {
            var newRoot = {
                values: [],
                nodes: [this.tree]
            };
            this.split(0, newRoot);
            this.tree = newRoot;
            console.log(this.tree);
        }
        this.insertIn(x, this.tree);
    };
    Tree.prototype.rangeCheckValues = function (i, node) {
        if (i >= node.values.length)
            throw Error("Error: provided a node which was too small to get the ".concat(i, "th value"));
    };
    Tree.prototype.rangeCheckNodes = function (i, node) {
        if (i >= node.nodes.length)
            throw Error("Error: provided a node which was too small to get the ".concat(i, "th node"));
    };
    Tree.prototype.insertIn = function (x, node) {
        var nodeType = node.nodes.length; //two/three/four node
        for (var i = 0; i < node.values.length; i++) {
            var val = node.values[i];
            var leftChild = node.nodes[i];
            if (x <= val && node.nodes[i] === undefined) {
                node.values.splice(i, 0, x);
                return;
            }
            else if (x <= val) {
                //check if the subsequent node is a fournode, split it if so
                var offset = 0;
                if (isFourNode(leftChild)) {
                    var newVal = this.split(i, node);
                    if (x > newVal) {
                        offset = 1;
                    }
                }
                this.insertIn(x, node.nodes[i + offset]);
                return;
            }
        }
        var lastNode = node.nodes[nodeType - 1];
        if (lastNode === undefined) {
            node.values.push(x);
        }
        else {
            //check if the subsequent node is fournode, split it if so 
            var offset = 0;
            if (isFourNode(lastNode)) {
                var newVal = this.split(nodeType - 1, node);
                if (x > newVal) {
                    offset = 1;
                }
            }
            this.insertIn(x, node.nodes[nodeType - 1 + offset]);
        }
    };
    //splits are done pre-emptively so we only ever go into a split node
    //this removes the need for vertices to know their parents ;w;
    //this will split the ith node in 'node.nodes', and mutate 'node'. The node passed in is the **parent** of the node being split 
    Tree.prototype.split = function (i, node) {
        //this.rangeCheckValues(i, node);
        this.rangeCheckNodes(i, node); //if we're splitting the right node, we want to know its index is within our current node
        var toSplit = node.nodes[i];
        if (!isFourNode(toSplit)) {
            console.log(toSplit);
            throw Error("Error: split attempted on non-fournode");
        }
        node.nodes.splice(i, 1);
        var middleValue = toSplit.values[1];
        node.values.splice(i, 0, middleValue); //pull up the middle value and put it where it belongs
        node.nodes.splice(i, 0, this.twoNode(0, toSplit), this.twoNode(2, toSplit)); //variadic insertion of both new twoNodes
        return middleValue;
    };
    Tree.prototype.twoNode = function (i, node) {
        //console.log(node);
        this.rangeCheckValues(i, node);
        var left = node.nodes[i];
        var right = node.nodes[i + 1];
        var children = [];
        if (left !== undefined)
            children.push(left);
        if (right !== undefined)
            children.push(right);
        return {
            values: [node.values[i]],
            nodes: children
        };
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
