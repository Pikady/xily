// 这个文件已被弃用，请使用 src/hooks/ 目录下的专用 hook 文件
// 保留一些通用的工具函数
import React from 'react'

// 通用异步Hook
export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate = false
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  
  const execute = React.useCallback(async (...args: any[]) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await asyncFunction(...args)
      setData(result)
      
      setLoading(false)
      return result
    } catch (err) {
      setError(err as Error)
      setLoading(false)
      throw err
    }
  }, [asyncFunction])
  
  const reset = React.useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
  }, [])
  
  React.useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])
  
  return { data, loading, error, execute, reset }
}