class Compile {
    el:any;
    vm:any;
    constructor (el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        if(this.el) {
            // 如果这个元素能获取到，我们才开始编译
            // 1.先把这些真实的 DOM 移动到内存中 fragment
            // 2.编译 => 提取想要的元素节点 v-model 和文本节点 {{message}}
            // 把编译好的 fragment再塞回到页面中去
            let fragment = this.node_Fragment(this.el);
            this.compile(fragment);
            this.el.appendChild(fragment);
        }
    }
    isElementNode (node):boolean {
        return node.nodeType === 1;
    } // 是不是 dom 节点
    isCommand (name):boolean {
        return name.includes('v-');
    }// 是不是指令
    node_Fragment (el) :DocumentFragment{
        // 文档碎片 内存中的 dom 节点
        let fragment = document.createDocumentFragment();
        let firstChild;
        firstChild=el.firstChild;
        while(firstChild) {
            fragment.appendChild(firstChild);
            firstChild=el.firstChild;
        }
        return fragment; // 内存中的节点
    }//将 el 中的内容全部放到内存中
    compile (fragment) {
        // 需要递归
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach(node => {
            if(this.isElementNode(node)) {
                // 是元素节点，还需要继续深入的检查
                this.compile(node);
                // 这里需要编译元素
                this.compileElement(node);
            } else {
                // 是文本节点
                // 这里需要编译文本
                this.compileText(node);
            }
        });
    }// 编译文档碎片方法
    compileElement (node) {
        // 带 v-model 的
        let attrs = node.attributes; // 取出当前节点的属性
        Array.from(attrs).forEach(attr => {
            // 判断属性名字是不是包含 v-
            // @ts-ignore
            let attrName = attr.name;
            if(this.isCommand(attrName)) {
                // 取到对应的值，放在节点中
                // @ts-ignore
                let exp = attr.value;
                let [, type] = attrName.split('-');
                // node this.vm.$date exp
                CompileUtil[type](node, this.vm, exp);
            }
        });
    }// 编译元素节点
    compileText (node) {
        // 带 {{}} 的
        let exp = node.textContent; // 获取文本中的内容
        let reg = /\{\{([^}]+)\}\}/g; // {{a}} {{b}} {{c}}
        if(reg.test(exp)) {
            // node this.vm.$date exp
            CompileUtil['text'](node, this.vm, exp);
        }
    }// 编译文本节点

}
let CompileUtil = {
    get (vm, exp) { // 获取实例上对应的数据
        exp = exp.split('.');
        return exp.reduce((prev, next) => {
            return prev[next];//迭代获取实际的位置
        }, vm.$data);
    },
    set (vm, exp, newVal) { // 设置实例上对应的数据
        exp = exp.split('.');
        return exp.reduce((prev, next, currentIndex) => {
            if(currentIndex === exp.length - 1) {
                return prev[next] = newVal;//与get同理
            }
            return prev[next];
        }, vm.$data);
    },
    getTextVal (vm, exp) { // 获取编译文本后的结果
        return exp.replace(/\{\{([^}]+)\}\}/g, (...arg) => {
            return this.get(vm, arg[1]);
        });
    },
    text (node, vm, exp) { //文本处理
        let updateFn = this.updater['textUpdater'];
        let value = this.getTextVal(vm, exp);
        exp.replace(/\{\{([^}]+)\}\}/g, (...arg) => {
            new Watcher(vm, arg[1], newValue => {
                // 如果数据变化了，文本节点应该重新获取依赖的数据更新文本中的内容
                updateFn && updateFn(node, newValue);
            });
        });
        updateFn && updateFn(node, value);//为什么会有&&？ 为了防止指令不存在
    },
    model (node, vm, exp) { // 输入框处理
        let updateFn = this.updater['modelUpdater'];
        let value = this.get(vm, exp);
        // 这里应该加一个监控，数据变化了，应该调用 watch 的回调
        new Watcher(vm, exp, newValue => {
            updateFn && updateFn(node, newValue);
        });
        // 添加输入框事件实现双向绑定
        node.addEventListener('input', e => {
            let newValue = e.target.value;
            this.set(vm, exp, newValue);
        });
        updateFn && updateFn(node, value);//为什么会有&&？ 为了防止指令不存在
    },
    updater: {
        // 文本更新
        textUpdater (node, value) {node.textContent = value;},
        // 输入框更新
        modelUpdater (node, value) {node.value = value;}
    }
};