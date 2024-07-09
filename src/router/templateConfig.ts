export interface ITemplate {
  name: string
  async?: boolean
  icon?: string
}

export const templateList: ITemplate[] = [
  {
    name: 'IconMarker',
    async: true,
    icon: '../../public/IconMarker.png'
  }
]
