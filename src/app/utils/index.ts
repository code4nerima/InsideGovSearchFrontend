export const getGroupByKey = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[],
  key: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] =>
  Object.values(
    data.reduce((res, item) => {
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

export const getConcatResults = (obj: object, concatDisplayKeys: string[]) => {
  const concatResults = Object.entries(obj)
    .filter(([k]) => concatDisplayKeys.includes(k))
    .map(([, value]) => {
      return value as string
    })
  return concatResults.join(' ')
}
