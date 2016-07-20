export class NodeParents {
    constructor(root, node) {
        this.root = root;
        this.node = node;
    }

    get parents() {
        let root = this.root;
        let node = this.node.parentNode;
        let parents = [];
        while (node !== root) {
            parents.push(node);
            node = node.parentNode;
        }
        parents.push(root);
        return parents;
    }

    findCommon(nodeParents) {
        let p1 = this.parents;
        let p2 = nodeParents.parents;
        let res;
        p1.some((p) => {
            if (p2.indexOf(p) !== -1) {
                res = p;
                return true;
            }
            return false;
        });
        return res;
    }

    getLower(parent) {
        let p = this.parents;
        let io = p.indexOf(parent);
        return p[io - 1];
    }
}
