// utils/uuid.js
import { v4 as uuidv4 } from 'uuid'

/**
 * 生成 UUID
 * 优先使用原生 crypto.randomUUID，降级使用 uuid 库
 */
export function generateUUID() {
  try {
    // 尝试使用原生方法
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
  } catch (error) {
    console.warn('crypto.randomUUID 不可用，使用 uuid 库替代',error)
  }

  // 降级方案：使用 uuid 库
  return uuidv4()
}

// 或者直接导出 uuidv4
export { v4 as uuidv4 } from 'uuid'
