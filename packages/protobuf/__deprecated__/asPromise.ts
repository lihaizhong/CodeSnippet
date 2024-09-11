/**
 * 将`node-style`风格的回调函数包装成Promise返回
 * @memberof util
 * @param {asPromiseCallback} fn 回调函数
 * @param {any} ctx 回调函数的上下文
 * @param {...any} args 回调函数的参数
 */
export function asPromise<T>(fn: (...fnArgs: any[]) => void, ctx: any, ...args: any[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const done = (err: Error, result: T) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    }

    try {
      fn.apply(ctx || null, [...args, done])
    } catch (err) {
      reject(err)
    }
  })
}
