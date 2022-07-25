class Observer {
    constructor (data) {
        this.observe(data);
    }
    observe (data) {

        if(!data || typeof data !== 'object') {return;}//如果data不存在或不是object类型就不进行数据劫持了
        Object.keys(data).forEach(key => {
            // 劫持（实现数据响应式）
            this.defineReactive(data, key, data[key]);
            this.observe(data[key]); //递归劫持每个项目
        });
    }
    defineReactive (ob, k, v) { // 响应式
        let that = this;
        // 每个变化的数据都会对应一个数组，这个数组是存放所有更新的操作
        let dep = new Dep();

        // 获取某个值被监听到
        Object.defineProperty(ob, k, {
            enumerable: true,
            configurable: true,
            get () { // 当取值时调用的方法
                // @ts-ignore
                Dep.target && dep.addSub(Dep.target);
                // @ts-ignore
                // console.log(dep.subs);
                return v;
            },
            set (newValue) { // 当给 data 属性中设置的值适合，更改获取的属性的值
                if(newValue !== v) {
                    that.observe(newValue); // 重新赋值如果是对象进行深度劫持
                    v = newValue;
                    dep.notify(); // 通知数据更新
                }
            }
        });
    }
}
