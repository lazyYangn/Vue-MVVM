class Watcher {
  constructor(vm, expr, cb) {
    //作用是新值和旧值有没有变化
    this.vm = vm
    this.expr = expr
    this.cb = cb
    //先把旧值保存起来
    this.oldVal = this.getOldVal()
  }
  getOldVal() {
    //挂在到Dep上
    Dep.target = this
    const oldVal = compileUtil.getValue(this.expr, this.vm)
    Dep.target = null
    return oldVal
  }
  update() {
    const newVal = compileUtil.getValue(this.expr, this.vm)
    if (newVal !== this.oldVal) {
      this.cb(newVal)
    }
  }
}
class Dep {
  constructor() {
    this.subs = []
  }
  //收集watcher
  addSub(watcher) {
    this.subs.push(watcher)
  }
  //通知观察者去更新
  notify() {
    console.log('观察者', this.subs)
    this.subs.forEach((w) => w.update())
  }
}
class Observer {
  constructor(data) {
    this.observer(data)
  }
  observer(data) {
    if (data && typeof data === 'object') {
      Object.keys(data).forEach((key) => {
        this.defineReactive(data, key, data[key])
      })
    }
  }
  defineReactive(obj, key, value) {
    //递归遍历
    this.observer(value)
    const dep = new Dep()
    //劫持并监听所有属性
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: false,
      get() {
        //相当于初始化
        //添加数据变化时 往data中添加观察者
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set: (newValue) => {
        //下面this指向问题
        this.observer(newValue)
        if (newValue !== value) {
          value = newValue
        }
        //告诉Dep通知变化
        dep.notify()
      },
    })
  }
}
