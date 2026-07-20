import axios from "axios"

// Base URL of your FastAPI backend. Override with NEXT_PUBLIC_API_URL if needed.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export const api = axios.create({
  baseURL: API_BASE_URL,
})

export type UploadResponse = {
  filename: string
  chunks: number
  message: string
}

export type Source = {
  page: number
  score: number
}

export type AskResponse = {
  question: string
  answer: string
  sources: Source[]
}

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const { data } = await api.post<UploadResponse>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function askQuestion(question: string): Promise<AskResponse> {
  const { data } = await api.post<AskResponse>("/ask", { question })
  return data
}
