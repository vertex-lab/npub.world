import { Client } from 'open-ranking'

const ENDPOINT_VERTEX = "https://ranking.vertexlab.io"

export const openRanking = await Client.create(ENDPOINT_VERTEX)
