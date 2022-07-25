class Watcher {
    vm:any;
    exp:any;
    callback:any;
    value:any;
    constructor (vm, exp, callback) {
        this.vm = vm;
        this.exp = exp;
        this.callback = callback;
        // 先获取一下老的值
        this.value = this.get();
    }
    update () {
        let newValue = CompileUtil.get(this.vm, this.exp);
        let oldValue = this.value;
        if(newValue !== oldValue) {
            this.callback(newValue); // 如果修改后得新旧值不等就执行回调
        }
    }
    get () { // 获取实例上老值得方法
        // @ts-ignore
        Dep.target = this;
        let value = CompileUtil.get(this.vm, this.exp);
        // @ts-ignore
        Dep.target = null;
        return value;
    }
}
