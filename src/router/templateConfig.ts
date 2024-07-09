export interface ITemplate {
  name: string
  async?: boolean
}

export const templateList: ITemplate[] = [
  {
    name: 'IconMarker',
    async: true
  }
]
