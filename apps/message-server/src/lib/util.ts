import { ethers } from 'ethers'

export const recoverAddress = (data: string, sign: string): string => {
  return ethers.recoverAddress(data, sign)
}

export interface ChunkSliceResult {
  min: number
  max: number
  valArr: number[]
}

export const generateChunkKey = (min: number, max: number): string => {
  return 'USER_SEQUENCE_CHUNK_' + min.toString() + '_' + max.toString()
}

/**
 * 函数用于切割数组为子数组
 * @param array 正序后的数组
 * @param size chunk size
 * @returns
 */
export const sliceIntoChunks = (
  array: number[],
  size: number,
): ChunkSliceResult[] => {
  const result: ChunkSliceResult[] = []
  let current = -1
  let valArr: number[] = []
  for (let index = 0; index < array.length; index++) {
    const val = array[index]
    if (!val ||val <= 0) {
      continue
    }
    let idx = Math.floor(val / size)

    const idx2 = val % size
    console.log('idx=', idx, 'idx2=', idx2)

    if (idx2 === 0) {
      idx -= 1
    }
    if (current < 0) {
      current = idx
    } else {
      if (current !== idx) {
        // addSlice
        const r = {
          min: current * size + 1,
          max: (current + 1) * size,
          valArr,
        }
        console.log(r)
        result.push(r)
        current = idx
        valArr = [val]
        continue
      }
    }
    valArr.push(val)
  }
  const r = {
    min: current * size + 1,
    max: (current + 1) * size,
    valArr,
  }
  console.log(r)
  result.push(r)

  return result
}
