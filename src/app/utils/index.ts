/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GroupByKeyObject {
  data: Record<string, any>[]
  [key: string]: any
}

export const getGroupByKey = (
  arr: Record<string, any>[],
  key: string
): GroupByKeyObject[] =>
  Object.values(
    arr.reduce((res, item) => {
      const value = item[key]
      const existing = res[value] || { [key]: value, data: [] }
      return {
        ...res,
        [value]: {
          ...existing,
          data: [...existing.data, item],
        },
      }
    }, {})
  )

export const getGroupByKeysRecursive = (
  arr: Record<string, any>[],
  keys: string[]
): GroupByKeyObject[] => {
  const [key, ...rest] = keys
  const groupByKey = getGroupByKey(arr, key)
  if (rest.length === 0) {
    return groupByKey
  }
  return groupByKey.map((item) => {
    return {
      ...item,
      data: getGroupByKeysRecursive(item.data, rest),
    }
  })
}

export const getConcatResults = (obj: object, concatDisplayKeys: string[]) => {
  const concatResults = Object.entries(obj)
    .filter(([k]) => concatDisplayKeys.includes(k))
    .map(([, value]) => {
      return value as string
    })
  return concatResults.join(' ')
}
