export interface Message {
  id: string,
  data: {
    date: number,
    content: string,
    from: string,
    to: string
  }
}