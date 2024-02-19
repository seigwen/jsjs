
export type ScopeType = 'function' | 'loop' | 'switch' | 'block'

export type Kind = 'const' | 'var' | 'let'


/**
 * 变量接口
 * @export
 * @interface Var
 * @typedef {Var}
 */
export interface Var {
  $get(): any
  $set(value: any): boolean
  // $call($this: any, args: Array<any>): any
}


/**
 * 作用域中的变量
 *
 * @export
 * @class ScopeVar
 * @typedef {ScopeVar}
 * @implements {Var}
 */
export class ScopeVar implements Var {
  value: any
  kind: Kind

  constructor(kind: Kind, value: any) {
    this.value = value
    this.kind = kind
  }

  $set(value: any): boolean {
    if (this.value === 'const') {
      return false
    } else {
      this.value = value
      return true
    }
  }

  $get(): any {
    return this.value
  }
}


/**
 * 对象中的变量
 *
 * @class PropVar
 * @typedef {PropVar}
 * @implements {Var}
 */
export class PropVar implements Var {
  object: any
  property: string

  constructor(object: any, property: string) {
    this.object = object
    this.property = property
  }

  $set(value: any) { this.object[this.property] = value; return true }
  $get() { return this.object[this.property] }
  $delete() { delete this.object[this.property] }
}

/**
 * 用于表示作用域的类
 */
export class Scope {
  /** 作用域内的变量。key为变量名，value为变量值 */
  private variables: { [key: string]: Var }
  /** 父作用域的类的实例 */
  private parent: Scope | null
  private prefix: string = '@'

  readonly type: ScopeType
  /** 
   * 是否为侵入式scope.
   * catch/while/doWhile/forIn/function的scope类型是侵入式的, 其blockStatement无需新建scope, 直接使用外部scope
   * switch/for的scope的非侵入式的
   **/
  invasived: boolean

  constructor(type: ScopeType, parent?: Scope, label?: string) {
    this.type = type
    this.parent = parent || null
    this.variables = {}
    this.invasived = false
  }

  /**
   * 查找作用域内的变量
   * @param raw_name 变量名
   * @returns 变量值
   */
  $find(raw_name: string): Var | null {
    const name = this.prefix + raw_name
    if (this.variables.hasOwnProperty(name)) {
      return this.variables[name]
    } else if (this.parent) {
      return this.parent.$find(raw_name)
    } else {
      return null
    }
  }

  /**
   * 添加let变量
   * @param raw_name 常量名
   * @param value 常量值
   * @returns bool 添加成功
   */
  $let(raw_name: string, value: any): boolean {
    const name = this.prefix + raw_name
    const $var = this.variables[name]
    if (!$var) {
      this.variables[name] = new ScopeVar('let', value) 
      return true
    } else { return false }
  }

  /**
   * 添加const常量
   * @param raw_name 常量名
   * @param value 常量值
   * @returns 添加成功
   */
  $const(raw_name: string, value: any): boolean { 
    const name = this.prefix + raw_name
    const $var = this.variables[name]
    if (!$var) {
      this.variables[name] = new ScopeVar('const', value) 
      return true
    } else { return false }
  }

  /**
   * 添加var变量
   * @param raw_name 变量名
   * @param value 变量值
   * @returns 添加成功
   */
  $var(raw_name: string, value: any): boolean {
    const name = this.prefix + raw_name
    let scope: Scope = this

    while (scope.parent !== null && scope.type !== 'function') {
      scope = scope.parent
    }

    const $var = scope.variables[name]
    if (!$var) {
      this.variables[name] = new ScopeVar('var', value) 
      return true
    } else { return false }
  }


  $declar(kind: Kind, raw_name: string, value: any): boolean {
    return ({
      'var': () => this.$var(raw_name, value),
      'let': () => this.$let(raw_name, value),
      'const': () => this.$const(raw_name, value)
    })[kind]()
  }
}
